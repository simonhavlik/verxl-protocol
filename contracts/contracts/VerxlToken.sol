// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Verxl Governance Token ($VRXL)
 * @author Šimon Havlík - Verxl Protocol
 * @notice Native governance and collateral staking token for Verxl DAO.
 * @dev Fixed genesis supply of 1,000,000 tokens (18 decimals) distributed to founding members.
 */
contract VerxlToken is ERC20, Ownable {
    uint256 public constant GENESIS_SUPPLY = 1_000_000 * 10 ** 18;

    /**
     * @notice Deploys the token and mints genesis supply across founding members.
     * @param initialHolders Array of founding addresses.
     * @param initialAmounts Array of token quantities for each founder.
     */
    constructor(
        address[] memory initialHolders,
        uint256[] memory initialAmounts
    ) ERC20("Verxl Governance Token", "VRXL") Ownable(msg.sender) {
        require(
            initialHolders.length == initialAmounts.length,
            "Mismatched holders and amounts array"
        );

        uint256 totalAllocated = 0;
        for (uint256 i = 0; i < initialHolders.length; i++) {
            require(initialHolders[i] != address(0), "Cannot mint to zero address");
            _mint(initialHolders[i], initialAmounts[i]);
            totalAllocated += initialAmounts[i];
        }

        require(
            totalAllocated <= GENESIS_SUPPLY,
            "Allocation exceeds genesis supply ceiling"
        );

        // If any tokens remain unallocated, mint them to the DAO deployer / treasury
        if (totalAllocated < GENESIS_SUPPLY) {
            _mint(msg.sender, GENESIS_SUPPLY - totalAllocated);
        }
    }
}
