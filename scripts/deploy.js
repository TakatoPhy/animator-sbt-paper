const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying AnimatorSBT with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "POL");

  // Deploy
  const AnimatorSBT = await ethers.getContractFactory("AnimatorSBT");
  const sbt = await AnimatorSBT.deploy();
  await sbt.waitForDeployment();

  const deployTx = sbt.deploymentTransaction();
  const receipt = await deployTx.wait();

  const contractAddress = await sbt.getAddress();
  console.log("\n=== Deployment Result ===");
  console.log("Contract address:", contractAddress);
  console.log("Transaction hash:", receipt.hash);
  console.log("Block number:", receipt.blockNumber);
  console.log("Gas used:", receipt.gasUsed.toString());

  // Verify roles
  const ISSUER_ROLE = await sbt.ISSUER_ROLE();
  const DEFAULT_ADMIN_ROLE = await sbt.DEFAULT_ADMIN_ROLE();
  console.log("\n=== Role Verification ===");
  console.log(
    "Deployer has ADMIN_ROLE:",
    await sbt.hasRole(DEFAULT_ADMIN_ROLE, deployer.address)
  );
  console.log(
    "Deployer has ISSUER_ROLE:",
    await sbt.hasRole(ISSUER_ROLE, deployer.address)
  );

  // Output for paper
  console.log("\n=== For Paper (copy-paste) ===");
  console.log(`Contract: ${contractAddress}`);
  console.log(`Network: ${(await ethers.provider.getNetwork()).name} (Chain ID: ${(await ethers.provider.getNetwork()).chainId})`);
  console.log(`Deploy gas: ${receipt.gasUsed.toString()}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
