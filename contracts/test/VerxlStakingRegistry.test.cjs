const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("Verxl Protocol Smart Contracts", function () {
  let owner, oracle, daoVault, provider1, provider2, founder2, founder3, founder4;
  let vrxlToken, stakingRegistry;

  const initialStake = ethers.parseEther("10000"); // 10,000 $VRXL
  const tranche = ethers.parseEther("250000");     // 250,000 $VRXL

  beforeEach(async function () {
    [owner, oracle, daoVault, provider1, provider2, founder2, founder3, founder4] =
      await ethers.getSigners();

    // 1. Deploy VerxlToken
    const founders = [owner.address, founder2.address, founder3.address, founder4.address];
    const amounts = [tranche, tranche, tranche, tranche];

    const VerxlToken = await ethers.getContractFactory("VerxlToken");
    vrxlToken = await VerxlToken.deploy(founders, amounts);
    await vrxlToken.waitForDeployment();

    // Transfer some tokens to provider1 & provider2 for testing
    await vrxlToken.transfer(provider1.address, ethers.parseEther("20000"));
    await vrxlToken.transfer(provider2.address, ethers.parseEther("20000"));

    // 2. Deploy VerxlStakingRegistry
    const VerxlStakingRegistry = await ethers.getContractFactory("VerxlStakingRegistry");
    stakingRegistry = await VerxlStakingRegistry.deploy(
      await vrxlToken.getAddress(),
      daoVault.address,
      oracle.address
    );
    await stakingRegistry.waitForDeployment();

    // Approve staking contract
    await vrxlToken
      .connect(provider1)
      .approve(await stakingRegistry.getAddress(), ethers.MaxUint256);
    await vrxlToken
      .connect(provider2)
      .approve(await stakingRegistry.getAddress(), ethers.MaxUint256);
  });

  describe("VerxlToken Genesis Distribution", function () {
    it("Should allocate 250,000 $VRXL to each of the 4 founding members", async function () {
      expect(await vrxlToken.balanceOf(founder2.address)).to.equal(tranche);
      expect(await vrxlToken.balanceOf(founder3.address)).to.equal(tranche);
      expect(await vrxlToken.balanceOf(founder4.address)).to.equal(tranche);
      expect(await vrxlToken.totalSupply()).to.equal(ethers.parseEther("1000000"));
    });
  });

  describe("Provider Registration & Staking", function () {
    it("Should successfully register a GPU provider with sufficient stake", async function () {
      await expect(
        stakingRegistry
          .connect(provider1)
          .registerProvider(
            "https://gpu-node-01.verxl.internal/v1",
            "meta-llama/llama-3-70b-instruct",
            8000, // $0.80 per 1M prompt
            8000, // $0.80 per 1M completion
            initialStake
          )
      )
        .to.emit(stakingRegistry, "ProviderRegistered")
        .withArgs(
          provider1.address,
          "https://gpu-node-01.verxl.internal/v1",
          "meta-llama/llama-3-70b-instruct",
          initialStake
        );

      const p = await stakingRegistry.providers(provider1.address);
      expect(p.operator).to.equal(provider1.address);
      expect(p.stakedAmountVRXL).to.equal(initialStake);
      expect(p.status).to.equal(0); // ProviderStatus.ACTIVE
    });

    it("Should reject registration if stake is below 1,000 $VRXL minimum", async function () {
      const lowStake = ethers.parseEther("500");
      await expect(
        stakingRegistry
          .connect(provider1)
          .registerProvider(
            "https://gpu-low.verxl.internal",
            "llama-3-8b",
            1000,
            1000,
            lowStake
          )
      ).to.be.revertedWith("Stake is below minimum requirement");
    });
  });

  describe("Autonomous AI Quality Oracle Auditing & Slashing", function () {
    beforeEach(async function () {
      await stakingRegistry
        .connect(provider1)
        .registerProvider(
          "https://gpu-node-01.verxl.internal/v1",
          "meta-llama/llama-3-70b-instruct",
          8000,
          8000,
          initialStake
        );
    });

    it("Should put a provider into PROBATION on first failed audit probe", async function () {
      await stakingRegistry
        .connect(oracle)
        .recordAuditResult(provider1.address, 7200, false); // 72% fidelity score (Failed)

      const p = await stakingRegistry.providers(provider1.address);
      expect(p.status).to.equal(1); // ProviderStatus.PROBATION
    });

    it("Should restore an audited provider to ACTIVE upon passing probe retest", async function () {
      // Put in probation first
      await stakingRegistry
        .connect(oracle)
        .recordAuditResult(provider1.address, 7200, false);

      // Retest passes
      await stakingRegistry
        .connect(oracle)
        .recordAuditResult(provider1.address, 9950, true);

      const p = await stakingRegistry.providers(provider1.address);
      expect(p.status).to.equal(0); // ProviderStatus.ACTIVE
    });

    it("Should automatically slash 10% collateral and route 50% to DAO Vault upon consecutive failure", async function () {
      const vaultBalanceBefore = await vrxlToken.balanceOf(daoVault.address);

      // First failure -> PROBATION
      await stakingRegistry
        .connect(oracle)
        .recordAuditResult(provider1.address, 7000, false);

      // Second consecutive failure -> SLASHED
      await expect(
        stakingRegistry
          .connect(oracle)
          .recordAuditResult(provider1.address, 6500, false)
      ).to.emit(stakingRegistry, "ProviderSlashed");

      const p = await stakingRegistry.providers(provider1.address);
      expect(p.status).to.equal(2); // ProviderStatus.SLASHED

      // 10% penalty of 10,000 = 1,000 $VRXL. 500 to vault, 500 burned.
      const expectedVaultCut = ethers.parseEther("500");
      const vaultBalanceAfter = await vrxlToken.balanceOf(daoVault.address);
      expect(vaultBalanceAfter - vaultBalanceBefore).to.equal(expectedVaultCut);
      expect(p.stakedAmountVRXL).to.equal(ethers.parseEther("9000"));
    });

    it("Should disallow non-oracles from triggering audits or slashing", async function () {
      await expect(
        stakingRegistry
          .connect(provider2)
          .recordAuditResult(provider1.address, 5000, false)
      ).to.be.revertedWith("Caller is not Quality Oracle or Aragon DAO");
    });
  });

  describe("Unbonding Period & Cooldown Enforcement", function () {
    beforeEach(async function () {
      await stakingRegistry
        .connect(provider1)
        .registerProvider(
          "https://gpu-node-01.verxl.internal/v1",
          "meta-llama/llama-3-70b-instruct",
          8000,
          8000,
          initialStake
        );
    });

    it("Should prevent immediate withdrawal before the 24-hour unbonding period", async function () {
      const unbondAmount = ethers.parseEther("5000");
      await stakingRegistry.connect(provider1).initiateUnbonding(unbondAmount);

      // Attempting immediate completion should revert
      await expect(
        stakingRegistry.connect(provider1).completeWithdrawal()
      ).to.be.revertedWith("Unbonding delay has not elapsed yet");
    });

    it("Should permit withdrawal after the 24-hour unbonding period has passed", async function () {
      const unbondAmount = ethers.parseEther("5000");
      const balanceBefore = await vrxlToken.balanceOf(provider1.address);

      await stakingRegistry.connect(provider1).initiateUnbonding(unbondAmount);

      // Fast forward 24 hours + 1 second
      await time.increase(24 * 60 * 60 + 1);

      await stakingRegistry.connect(provider1).completeWithdrawal();
      const balanceAfter = await vrxlToken.balanceOf(provider1.address);

      expect(balanceAfter - balanceBefore).to.equal(unbondAmount);
    });
  });
});
