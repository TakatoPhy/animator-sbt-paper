/**
 * Authoritative gas measurement for the paper's cost tables and figures.
 *
 * Gas consumption is deterministic for a given contract bytecode and call, so
 * measuring against the local Hardhat EVM yields the same figures a testnet
 * would. What a testnet adds is a live gas price, which is a market quantity
 * and is handled separately (and explicitly) in the fiat conversion.
 *
 * Writes simulation/gas_measurements.json, which is the single source the cost
 * simulation and Fig. 4 read. Nothing downstream hard-codes a gas number.
 *
 *   npx hardhat run scripts/measure_gas_local.js
 */
const fs = require("fs");
const path = require("path");
const hre = require("hardhat");

async function gasOf(txPromise) {
  const receipt = await (await txPromise).wait();
  return Number(receipt.gasUsed);
}

async function main() {
  const [deployer, animator, studio, other] = await hre.ethers.getSigners();

  const solc = hre.config.solidity.compilers[0];
  const env = {
    solc_version: solc.version,
    optimizer_enabled: solc.settings.optimizer.enabled,
    optimizer_runs: solc.settings.optimizer.runs,
    evm: "Hardhat local network",
    measured_at: new Date().toISOString().slice(0, 10),
    note:
      "Gas is deterministic for a given bytecode and call; the local EVM " +
      "reproduces testnet gas. Fiat conversion is applied downstream from " +
      "explicitly stated gas and token prices.",
  };

  // ---- v1: AnimatorSBT -------------------------------------------------
  const V1 = await hre.ethers.getContractFactory("AnimatorSBT");
  const v1 = await V1.deploy();
  await v1.waitForDeployment();
  const v1Deploy = Number(
    (await hre.ethers.provider.getTransactionReceipt(
      v1.deploymentTransaction().hash
    )).gasUsed
  );

  const ISSUER = await v1.ISSUER_ROLE();
  await (await v1.grantRole(ISSUER, deployer.address)).wait();

  // A first mint to a fresh address pays the cold-storage premium; later mints
  // to the same holder are cheaper. Both are reported rather than averaged
  // away, because the deployment profile decides which one dominates.
  const mintFirst = await gasOf(
    v1.mint(animator.address, "ipfs://QmCertificate0001")
  );
  const mintSubsequent = await gasOf(
    v1.mint(animator.address, "ipfs://QmCertificate0002")
  );

  const batchSizes = [1, 5, 10, 25];
  const mintBatch = {};
  for (const n of batchSizes) {
    const to = [];
    const uris = [];
    for (let i = 0; i < n; i++) {
      to.push(hre.ethers.Wallet.createRandom().address);
      uris.push(`ipfs://QmBatch${n}_${i}`);
    }
    mintBatch[n] = await gasOf(v1.mintBatch(to, uris));
  }

  const revoke = await gasOf(v1.revoke(1));

  // ---- v2: AnimatorSBTV2 (studio co-signing) ---------------------------
  const V2 = await hre.ethers.getContractFactory("AnimatorSBTV2");
  const v2 = await V2.deploy();
  await v2.waitForDeployment();
  const v2Deploy = Number(
    (await hre.ethers.provider.getTransactionReceipt(
      v2.deploymentTransaction().hash
    )).gasUsed
  );

  const ISSUER2 = await v2.ISSUER_ROLE();
  const ATTESTER = await v2.STUDIO_ATTESTER_ROLE();
  await (await v2.grantRole(ISSUER2, deployer.address)).wait();
  const grantAttester = await gasOf(v2.grantRole(ATTESTER, studio.address));

  const v2Mint = await gasOf(
    v2.mint(animator.address, "ipfs://QmV2Certificate0001")
  );
  const coSign = await gasOf(v2.connect(studio).coSign(1));

  const out = {
    environment: env,
    deployment_gas: {
      AnimatorSBT: v1Deploy,
      AnimatorSBTV2: v2Deploy,
    },
    operation_gas: {
      "mint (first certificate to a holder)": mintFirst,
      "mint (subsequent certificate to the same holder)": mintSubsequent,
      "mintBatch(1)": mintBatch[1],
      "mintBatch(5)": mintBatch[5],
      "mintBatch(10)": mintBatch[10],
      "mintBatch(25)": mintBatch[25],
      revoke: revoke,
      "grantRole (studio attester)": grantAttester,
      "mint (v2)": v2Mint,
      "coSign (studio attestation)": coSign,
    },
    per_certificate_gas: {
      "self-attested (v1 mint, subsequent)": mintSubsequent,
      "self-attested, amortised in a batch of 10": Math.round(mintBatch[10] / 10),
      "studio-attested (v2 mint + coSign)": v2Mint + coSign,
    },
  };

  const dest = path.join(__dirname, "..", "simulation", "gas_measurements.json");
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, JSON.stringify(out, null, 2) + "\n");

  console.log(JSON.stringify(out, null, 2));
  console.log(`\nwritten: ${path.relative(process.cwd(), dest)}`);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
