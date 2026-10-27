// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title VerxlStakingRegistry
 * @author Šimon Havlík - Verxl Protocol
 * @notice Manages GPU compute provider staking, registration, automated slashing,
 *         and protocol fee routing for Verxl Protocol (verxl.com).
 */
contract VerxlStakingRegistry is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    enum ProviderStatus {
        ACTIVE,
        PROBATION,
        SLASHED,
        OFFLINE
    }

    struct Provider {
        address operator;
        string endpointUrl;
        string modelIdentifier;
        uint256 pricePer1mPromptTokens;     // In USD micro-cents / 6 decimals
        uint256 pricePer1mCompletionTokens; // In USD micro-cents / 6 decimals
        uint256 stakedAmountVRXL;
        ProviderStatus status;
        uint256 lastAuditTimestamp;
        uint256 lastAuditScore;             // Scaled by 100 (e.g., 9850 = 98.50%)
        uint256 unbondingRequestedAt;
        uint256 unbondingAmount;
    }

    IERC20 public immutable vrxlToken;
    address public daoVaultAddress;
    address public qualityOracle;

    uint256 public minimumStakeAmount = 1_000 * 10 ** 18; // 1,000 $VRXL minimum
    uint256 public protocolFeeBasisPoints = 50;           // 0.5% (50 / 10000)
    uint256 public slashingPenaltyBasisPoints = 1000;      // 10.0% (1000 / 10000)
    uint256 public unbondingPeriod = 1 days;              // 24 hour withdrawal delay

    mapping(address => Provider) public providers;
    address[] public providerAddresses;

    event ProviderRegistered(
        address indexed operator,
        string endpointUrl,
        string modelIdentifier,
        uint256 stakedAmount
    );
    event StakeIncreased(address indexed operator, uint256 addedAmount, uint256 totalStake);
    event UnbondingInitiated(address indexed operator, uint256 amount, uint256 releaseTime);
    event StakeWithdrawn(address indexed operator, uint256 amount);
    event ProviderStatusChanged(address indexed operator, ProviderStatus newStatus, string reason);
    event ProviderSlashed(
        address indexed operator,
        uint256 slashedAmount,
        uint256 feeToVault,
        uint256 burnedAmount,
        string reason
    );
    event AuditRecorded(address indexed operator, uint256 score, bool passed);
    event DaoVaultUpdated(address indexed newVault);
    event QualityOracleUpdated(address indexed newOracle);
    event ProtocolFeeUpdated(uint256 newBasisPoints);

    modifier onlyOracleOrDAO() {
        require(
            msg.sender == qualityOracle || msg.sender == owner(),
            "Caller is not Quality Oracle or Aragon DAO"
        );
        _;
    }

    constructor(
        address _vrxlToken,
        address _daoVaultAddress,
        address _qualityOracle
    ) Ownable(msg.sender) {
        require(_vrxlToken != address(0), "Invalid VRXL token address");
        require(_daoVaultAddress != address(0), "Invalid DAO vault address");
        require(_qualityOracle != address(0), "Invalid oracle address");

        vrxlToken = IERC20(_vrxlToken);
        daoVaultAddress = _daoVaultAddress;
        qualityOracle = _qualityOracle;
    }

    /**
     * @notice Register a new GPU inference provider node with initial $VRXL collateral.
     */
    function registerProvider(
        string calldata endpointUrl,
        string calldata modelIdentifier,
        uint256 pricePrompt,
        uint256 priceCompletion,
        uint256 stakeAmount
    ) external nonReentrant {
        require(stakeAmount >= minimumStakeAmount, "Stake is below minimum requirement");
        require(bytes(endpointUrl).length > 0, "Endpoint URL cannot be empty");
        require(bytes(modelIdentifier).length > 0, "Model identifier cannot be empty");
        require(providers[msg.sender].operator == address(0), "Provider already registered");

        vrxlToken.safeTransferFrom(msg.sender, address(this), stakeAmount);

        providers[msg.sender] = Provider({
            operator: msg.sender,
            endpointUrl: endpointUrl,
            modelIdentifier: modelIdentifier,
            pricePer1mPromptTokens: pricePrompt,
            pricePer1mCompletionTokens: priceCompletion,
            stakedAmountVRXL: stakeAmount,
            status: ProviderStatus.ACTIVE,
            lastAuditTimestamp: block.timestamp,
            lastAuditScore: 10000, // 100% initial probation score
            unbondingRequestedAt: 0,
            unbondingAmount: 0
        });

        providerAddresses.push(msg.sender);

        emit ProviderRegistered(msg.sender, endpointUrl, modelIdentifier, stakeAmount);
    }

    /**
     * @notice Increase existing collateral stake.
     */
    function addStake(uint256 amount) external nonReentrant {
        Provider storage p = providers[msg.sender];
        require(p.operator != address(0), "Provider not registered");
        require(amount > 0, "Amount must be greater than zero");

        vrxlToken.safeTransferFrom(msg.sender, address(this), amount);
        p.stakedAmountVRXL += amount;

        // If provider was slashed or in probation and now meets minimum stake, allow reactivation
        if (p.status == ProviderStatus.SLASHED && p.stakedAmountVRXL >= minimumStakeAmount) {
            p.status = ProviderStatus.PROBATION;
            emit ProviderStatusChanged(msg.sender, ProviderStatus.PROBATION, "Restaked collateral");
        }

        emit StakeIncreased(msg.sender, amount, p.stakedAmountVRXL);
    }

    /**
     * @notice Initiate unbonding/withdrawal delay for stake.
     */
    function initiateUnbonding(uint256 amount) external nonReentrant {
        Provider storage p = providers[msg.sender];
        require(p.operator != address(0), "Provider not registered");
        require(amount > 0 && amount <= p.stakedAmountVRXL, "Invalid unbonding amount");
        require(p.unbondingAmount == 0, "Unbonding already pending");

        p.unbondingRequestedAt = block.timestamp;
        p.unbondingAmount = amount;
        p.stakedAmountVRXL -= amount;

        if (p.stakedAmountVRXL < minimumStakeAmount) {
            p.status = ProviderStatus.OFFLINE;
            emit ProviderStatusChanged(msg.sender, ProviderStatus.OFFLINE, "Stake below minimum during unbonding");
        }

        emit UnbondingInitiated(msg.sender, amount, block.timestamp + unbondingPeriod);
    }

    /**
     * @notice Finalize withdrawal once the unbonding delay has elapsed.
     */
    function completeWithdrawal() external nonReentrant {
        Provider storage p = providers[msg.sender];
        require(p.unbondingAmount > 0, "No pending withdrawal");
        require(
            block.timestamp >= p.unbondingRequestedAt + unbondingPeriod,
            "Unbonding delay has not elapsed yet"
        );

        uint256 amountToTransfer = p.unbondingAmount;
        p.unbondingAmount = 0;
        p.unbondingRequestedAt = 0;

        vrxlToken.safeTransfer(msg.sender, amountToTransfer);

        emit StakeWithdrawn(msg.sender, amountToTransfer);
    }

    /**
     * @notice Called by Autonomous AI Quality Oracle to record audit probe results.
     */
    function recordAuditResult(
        address providerAddress,
        uint256 fidelityScore,
        bool passed
    ) external onlyOracleOrDAO {
        Provider storage p = providers[providerAddress];
        require(p.operator != address(0), "Provider not registered");

        p.lastAuditTimestamp = block.timestamp;
        p.lastAuditScore = fidelityScore;

        if (!passed) {
            if (p.status == ProviderStatus.ACTIVE) {
                p.status = ProviderStatus.PROBATION;
                emit ProviderStatusChanged(providerAddress, ProviderStatus.PROBATION, "Failed deterministic probe");
            } else if (p.status == ProviderStatus.PROBATION) {
                // Second consecutive failure: trigger automated slash
                _slash(providerAddress, "Consecutive probe failure / Model spoofing detected");
            }
        } else {
            if (p.status == ProviderStatus.PROBATION) {
                p.status = ProviderStatus.ACTIVE;
                emit ProviderStatusChanged(providerAddress, ProviderStatus.ACTIVE, "Passed probe retest");
            }
        }

        emit AuditRecorded(providerAddress, fidelityScore, passed);
    }

    /**
     * @notice Explicitly slash a dishonest or spoofed provider.
     */
    function slashProvider(
        address providerAddress,
        string calldata reason
    ) external onlyOracleOrDAO {
        _slash(providerAddress, reason);
    }

    /**
     * @dev Internal slashing logic: 10% penalty (50% to DAO Vault, 50% burned).
     */
    function _slash(address providerAddress, string memory reason) internal {
        Provider storage p = providers[providerAddress];
        require(p.operator != address(0), "Provider not registered");
        require(p.stakedAmountVRXL > 0, "No collateral available to slash");

        uint256 penalty = (p.stakedAmountVRXL * slashingPenaltyBasisPoints) / 10000;
        if (penalty == 0 && p.stakedAmountVRXL > 0) {
            penalty = p.stakedAmountVRXL;
        }

        p.stakedAmountVRXL -= penalty;
        p.status = ProviderStatus.SLASHED;

        // 50% to DAO Vault, 50% to burn address (0x0000...dead)
        uint256 feeToVault = penalty / 2;
        uint256 burned = penalty - feeToVault;

        vrxlToken.safeTransfer(daoVaultAddress, feeToVault);
        vrxlToken.safeTransfer(address(0x000000000000000000000000000000000000dEaD), burned);

        emit ProviderSlashed(providerAddress, penalty, feeToVault, burned, reason);
        emit ProviderStatusChanged(providerAddress, ProviderStatus.SLASHED, reason);
    }

    // --- DAO Governance Setters ---

    function setDaoVault(address _newVault) external onlyOwner {
        require(_newVault != address(0), "Invalid vault address");
        daoVaultAddress = _newVault;
        emit DaoVaultUpdated(_newVault);
    }

    function setQualityOracle(address _newOracle) external onlyOwner {
        require(_newOracle != address(0), "Invalid oracle address");
        qualityOracle = _newOracle;
        emit QualityOracleUpdated(_newOracle);
    }

    function setProtocolFeeBasisPoints(uint256 _newFeeBps) external onlyOwner {
        require(_newFeeBps <= 500, "Protocol fee cannot exceed 5.0%");
        protocolFeeBasisPoints = _newFeeBps;
        emit ProtocolFeeUpdated(_newFeeBps);
    }

    function setUnbondingPeriod(uint256 _period) external onlyOwner {
        unbondingPeriod = _period;
    }

    function getProviderCount() external view returns (uint256) {
        return providerAddresses.length;
    }
}
