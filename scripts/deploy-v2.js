const { ethers } = require("hardhat");

/**
 * Deploy AnimatorSBTV2 (Phase C: studio co-signing).
 *
 * Local check (no key/funds needed):
 *   npx hardhat run scripts/deploy-v2.js --network hardhat
 * Testnet (needs PRIVATE_KEY + Amoy POL in hardhat.config 'amoy' network):
 *   npx hardhat run scripts/deploy-v2.js --network amoy
 *
 * After deploying to a testnet, grant STUDIO_ATTESTER_ROLE to each studio's
 * attester wallet (the wallet that will call coSign):
 *   sbt.grantRole(await sbt.STUDIO_ATTESTER_ROLE(), <studioAttesterAddress>)
 */
async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying AnimatorSBTV2 with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "POL");

  const Factory = await ethers.getContractFactory("AnimatorSBTV2");
  const sbt = await Factory.deploy();
  await sbt.waitForDeployment();

  const receipt = await sbt.deploymentTransaction().wait();
  const contractAddress = await sbt.getAddress();

  console.log("\n=== Deployment Result ===");
  console.log("Contract address:", contractAddress);
  console.log("Transaction hash:", receipt.hash);
  console.log("Block number:", receipt.blockNumber);
  console.log("Gas used:", receipt.gasUsed.toString());

  const DEFAULT_ADMIN_ROLE = await sbt.DEFAULT_ADMIN_ROLE();
  const ISSUER_ROLE = await sbt.ISSUER_ROLE();
  const STUDIO_ATTESTER_ROLE = await sbt.STUDIO_ATTESTER_ROLE();
  console.log("\n=== Role Verification (deployer) ===");
  console.log("ADMIN_ROLE:", await sbt.hasRole(DEFAULT_ADMIN_ROLE, deployer.address));
  console.log("ISSUER_ROLE:", await sbt.hasRole(ISSUER_ROLE, deployer.address));
  console.log("STUDIO_ATTESTER_ROLE:", await sbt.hasRole(STUDIO_ATTESTER_ROLE, deployer.address));

  const net = await ethers.provider.getNetwork();
  console.log("\n=== Next steps ===");
  console.log(`Contract: ${contractAddress}  Network: ${net.name} (chainId ${net.chainId})`);
  console.log("STUDIO_ATTESTER_ROLE hash:", STUDIO_ATTESTER_ROLE);
  console.log("Set ISSUANCE env: CONTRACT_ADDRESS, ISSUER_PRIVATE_KEY, (optional) ATTESTER_PRIVATE_KEY, RPC_URL, PINATA_*");
  console.log("Grant attesters: sbt.grantRole(STUDIO_ATTESTER_ROLE, <studioAttesterAddress>)");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
