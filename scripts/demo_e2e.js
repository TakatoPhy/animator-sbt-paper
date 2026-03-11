/**
 * E2E Demo Script: Tanaka Scenario
 *
 * Recreates the paper's Tanaka scenario:
 * 1. Create animator wallet
 * 2. Build work-log metadata
 * 3. Upload metadata to IPFS
 * 4. Mint SBT to Tanaka's wallet
 * 5. Verify with balanceOf, tokenURI, tokensOfOwner
 * 6. Record all tx hashes and gas costs
 *
 * Prerequisites:
 *   - .env with PRIVATE_KEY, AMOY_RPC_URL, CONTRACT_ADDRESS, PINATA_API_KEY, PINATA_SECRET
 *   - Contract deployed on Amoy
 *   - Pinata account set up
 */

require("dotenv").config();
const { ethers } = require("ethers");
const { IssuanceService } = require("../services/issuance/index.js");
const AnimatorSBTArtifact = require("../artifacts/contracts/AnimatorSBT.sol/AnimatorSBT.json");

async function main() {
  const {
    PRIVATE_KEY,
    AMOY_RPC_URL,
    CONTRACT_ADDRESS,
    PINATA_API_KEY,
    PINATA_SECRET,
  } = process.env;

  // Validate env
  const required = ["PRIVATE_KEY", "AMOY_RPC_URL", "CONTRACT_ADDRESS", "PINATA_API_KEY", "PINATA_SECRET"];
  for (const key of required) {
    if (!process.env[key]) {
      console.error(`Missing env variable: ${key}`);
      process.exit(1);
    }
  }

  console.log("=== AnimatorSBT E2E Demo: Tanaka Scenario ===\n");

  // Step 1: Create animator wallet (Tanaka)
  console.log("Step 1: Creating Tanaka's wallet...");
  const tanakaWallet = ethers.Wallet.createRandom();
  console.log(`  Address: ${tanakaWallet.address}`);
  console.log(`  (Private key generated - not shown for security)\n`);

  // Initialize issuance service
  const service = new IssuanceService({
    rpcUrl: AMOY_RPC_URL,
    privateKey: PRIVATE_KEY,
    contractAddress: CONTRACT_ADDRESS,
    pinataApiKey: PINATA_API_KEY,
    pinataSecret: PINATA_SECRET,
  });

  // Step 2-4: Issue SBT (build metadata → IPFS → mint)
  console.log("Step 2-4: Issuing SBT...");
  const result = await service.issue({
    animatorName: "Tanaka Yuki",
    animatorWallet: tanakaWallet.address,
    project: "Episode 7",
    role: "key_anim",
    taskCount: 25,
    startDate: "2025-01-15",
    endDate: "2025-03-30",
    studioName: "Studio Example",
    evidenceFiles: [
      "ipfs://QmExampleHash1_storyboard",
      "ipfs://QmExampleHash2_keyframes",
    ],
  });

  // Step 5: Verification
  console.log("\nStep 5: Verification...");
  const provider = new ethers.JsonRpcProvider(AMOY_RPC_URL);
  const contract = new ethers.Contract(
    CONTRACT_ADDRESS,
    AnimatorSBTArtifact.abi,
    provider
  );

  const balance = await contract.balanceOf(tanakaWallet.address);
  console.log(`  balanceOf(Tanaka): ${balance.toString()}`);

  const tokenURI = await contract.tokenURI(result.tokenId);
  console.log(`  tokenURI(${result.tokenId}): ${tokenURI}`);

  const tokens = await contract.tokensOfOwner(tanakaWallet.address);
  console.log(`  tokensOfOwner(Tanaka): [${tokens.map((t) => t.toString()).join(", ")}]`);

  const isRevoked = await contract.isRevoked(result.tokenId);
  console.log(`  isRevoked(${result.tokenId}): ${isRevoked}`);

  const issuedAt = await contract.issuedAt(result.tokenId);
  const issuedDate = new Date(Number(issuedAt) * 1000);
  console.log(`  issuedAt(${result.tokenId}): ${issuedDate.toISOString()}`);

  // Step 6: Summary
  console.log("\n=== E2E Demo Results ===");
  console.log(`Tanaka wallet:    ${tanakaWallet.address}`);
  console.log(`Token ID:         ${result.tokenId}`);
  console.log(`IPFS CID:         ${result.ipfsCid}`);
  console.log(`Token URI:        ${result.tokenURI}`);
  console.log(`TX Hash:          ${result.txHash}`);
  console.log(`Gas Used (mint):  ${result.gasUsed}`);
  console.log(`Evidence Hash:    ${result.metadata.evidence_hash}`);
  console.log(`Balance:          ${balance.toString()}`);
  console.log(`Is Revoked:       ${isRevoked}`);
  console.log(`Issued At:        ${issuedDate.toISOString()}`);
  console.log("\nAll steps completed successfully.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("E2E Demo failed:", error);
    process.exit(1);
  });
