const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("==================================================");
  console.log("Deploying Verxl Protocol Contracts to Sepolia...");
  console.log("Deployer Address:", deployer.address);
  console.log("Account Balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());
  console.log("==================================================");

  // 1. Founding Team Allocation (250,000 $VRXL each out of 1,000,000 fixed supply)
  const founder1 = process.env.FOUNDER_1_ADDRESS || deployer.address;
  const founder2 = process.env.FOUNDER_2_ADDRESS || "0x2222222222222222222222222222222222222222";
  const founder3 = process.env.FOUNDER_3_ADDRESS || "0x3333333333333333333333333333333333333333";
  const founder4 = process.env.FOUNDER_4_ADDRESS || "0x4444444444444444444444444444444444444444";

  const trancheAmount = hre.ethers.parseEther("250000"); // 250k tokens
  const founders = [founder1, founder2, founder3, founder4];
  const amounts = [trancheAmount, trancheAmount, trancheAmount, trancheAmount];

  console.log("\n1. Deploying VerxlToken ($VRXL)...");
  const VerxlToken = await hre.ethers.getContractFactory("VerxlToken");
  const vrxlToken = await VerxlToken.deploy(founders, amounts);
  await vrxlToken.waitForDeployment();
  const vrxlTokenAddress = await vrxlToken.getAddress();
  console.log("-> VerxlToken deployed at:", vrxlTokenAddress);

  // 2. Deploy VerxlStakingRegistry
  const daoVaultAddress = process.env.ARAGON_DAO_VAULT_ADDRESS || deployer.address;
  const qualityOracleAddress = process.env.ORACLE_WORKER_ADDRESS || deployer.address;

  console.log("\n2. Deploying VerxlStakingRegistry...");
  console.log("   DAO Vault Target:", daoVaultAddress);
  console.log("   Quality Oracle Target:", qualityOracleAddress);

  const VerxlStakingRegistry = await hre.ethers.getContractFactory("VerxlStakingRegistry");
  const stakingRegistry = await VerxlStakingRegistry.deploy(
    vrxlTokenAddress,
    daoVaultAddress,
    qualityOracleAddress
  );
  await stakingRegistry.waitForDeployment();
  const stakingRegistryAddress = await stakingRegistry.getAddress();
  console.log("-> VerxlStakingRegistry deployed at:", stakingRegistryAddress);

  console.log("\n==================================================");
  console.log("Deployment Complete!");
  console.log("Summary for Aragon DAO / Moodle Submission:");
  console.log("- $VRXL Token:", vrxlTokenAddress);
  console.log("- Staking Registry:", stakingRegistryAddress);
  console.log("- DAO Vault:", daoVaultAddress);
  console.log("==================================================");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
