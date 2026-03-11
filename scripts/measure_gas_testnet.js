/**
 * Measure gas costs on Amoy testnet for paper Table IV.
 * Runs: mintBatch(10), revoke()
 * (deploy and mint() already measured from deploy.js and demo_e2e.js)
 */
require("dotenv").config();
const { ethers } = require("ethers");
const AnimatorSBTArtifact = require("../artifacts/contracts/AnimatorSBT.sol/AnimatorSBT.json");

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.AMOY_RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const contract = new ethers.Contract(
    process.env.CONTRACT_ADDRESS,
    AnimatorSBTArtifact.abi,
    wallet
  );

  console.log("=== Testnet Gas Measurement ===\n");

  // mintBatch(10)
  console.log("1. mintBatch(10)...");
  const recipients = [];
  const uris = [];
  for (let i = 0; i < 10; i++) {
    const w = ethers.Wallet.createRandom();
    recipients.push(w.address);
    uris.push(`ipfs://QmTestBatch${i}`);
  }
  const batchTx = await contract.mintBatch(recipients, uris);
  const batchReceipt = await batchTx.wait();
  console.log(`   TX: ${batchReceipt.hash}`);
  console.log(`   Gas: ${batchReceipt.gasUsed.toString()}`);

  // revoke() - revoke token #2 (first token from the batch, which is tokenId 2)
  const totalMinted = await contract.totalMinted();
  console.log(`\n   Total minted so far: ${totalMinted.toString()}`);

  console.log("\n2. revoke()...");
  const revokeTx = await contract.revoke(2); // token #2 from batch
  const revokeReceipt = await revokeTx.wait();
  console.log(`   TX: ${revokeReceipt.hash}`);
  console.log(`   Gas: ${revokeReceipt.gasUsed.toString()}`);

  // Summary
  console.log("\n=== Gas Summary (Testnet) ===");
  console.log(`deploy():       1,824,117 (from deploy.js)`);
  console.log(`mint():         189,792 (from demo_e2e.js, first mint with cold storage)`);
  console.log(`mintBatch(10):  ${batchReceipt.gasUsed.toString()}`);
  console.log(`revoke():       ${revokeReceipt.gasUsed.toString()}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
