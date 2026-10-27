/**
 * Verxl DAO Programmatic Deployment Script via Aragon OSx SDK
 * Network: Ethereum Sepolia Testnet
 * Purpose: Fulfills Task 1 Extra Credit (+1 AP) for programmatic DAO deployment
 * Instructor: Ondřej Paruch (FMV / FIR VŠE)
 */

import { Client, Context, TokenType, DaoCreationSteps } from "@aragon/sdk-client";
import { ethers } from "ethers";
import * as dotenv from "dotenv";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

async function main() {
  const RPC_URL = process.env.SEPOLIA_RPC_URL || "https://rpc.sepolia.org";
  const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY;

  if (!PRIVATE_KEY || PRIVATE_KEY === "0x0000000000000000000000000000000000000000000000000000000000000001") {
    console.error("=================================================================");
    console.error("ERROR: DEPLOYER_PRIVATE_KEY is missing or unconfigured in .env");
    console.error("Please provide a valid Sepolia testnet private key to proceed.");
    console.error("=================================================================");
    process.exit(1);
  }

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const signer = new ethers.Wallet(PRIVATE_KEY, provider);

  console.log("=================================================================");
  console.log("Verxl Protocol: Deploying Aragon OSx DAO on Ethereum Sepolia...");
  console.log("Deployer Address:", signer.address);
  console.log("Network RPC:", RPC_URL);
  console.log("=================================================================");

  const context = new Context({
    network: "sepolia",
    signer: signer,
    web3Providers: [RPC_URL],
  });

  const client = new Client(context);

  // 4 Founding members each receive 250,000 $VRXL (25% voting power)
  const founder1 = process.env.FOUNDER_1_ADDRESS || signer.address;
  const founder2 = process.env.FOUNDER_2_ADDRESS || "0x2222222222222222222222222222222222222222";
  const founder3 = process.env.FOUNDER_3_ADDRESS || "0x3333333333333333333333333333333333333333";
  const founder4 = process.env.FOUNDER_4_ADDRESS || "0x4444444444444444444444444444444444444444";

  const createDaoParams = {
    metadataUri: "ipfs://QmVerxlDaoMetadataHashV1",
    ensSubdomain: "verxl-dao-" + Math.floor(Math.random() * 10000), // Unique testnet ENS
    plugins: [
      {
        id: "token-voting-repo",
        data: {
          votingSettings: {
            minDuration: 3600,       // 1 hour for fast testnet proposal turnaround
            minParticipation: 0.20,  // 20% Quorum
            supportThreshold: 0.50,  // 50% Simple Majority
            minProposerVotingPower: 1n,
          },
          tokenSettings: {
            tokenType: TokenType.ERC20,
            name: "Verxl Governance Token",
            symbol: "VRXL",
            decimals: 18,
            balances: [
              { address: founder1, balance: 250000n * 10n ** 18n },
              { address: founder2, balance: 250000n * 10n ** 18n },
              { address: founder3, balance: 250000n * 10n ** 18n },
              { address: founder4, balance: 250000n * 10n ** 18n },
            ],
          },
        },
      },
    ],
  };

  console.log("\nSubmitting DAO Creation to Sepolia...");
  const steps = client.methods.createDao(createDaoParams);

  for await (const step of steps) {
    switch (step.key) {
      case DaoCreationSteps.CREATING:
        console.log(`[Tx Submitted] Hash: ${step.txHash}`);
        break;
      case DaoCreationSteps.DONE:
        console.log(`\n=================================================================`);
        console.log(`SUCCESS: Verxl DAO deployed on Sepolia!`);
        console.log(`DAO Contract Address: ${step.address}`);
        console.log(`Aragon App URL: https://app.aragon.org/#/daos/sepolia/${step.address}`);
        console.log(`=================================================================`);
        break;
    }
  }
}

main().catch((err) => {
  console.error("Deployment failed:", err);
  process.exit(1);
});
