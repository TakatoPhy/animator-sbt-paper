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
      "Gas is deterministic for a given bytecode and call, so the local EVM " +
      "reproduces testnet gas provided the inputs match. Mint gas is dominated " +
      "by tokenURI length, so a realistic CIDv1 URI is used throughout; a short " +
      "placeholder understates it by roughly 50,000 gas. Fiat conversion is " +
      "applied downstream from explicitly stated gas and token prices.",
    token_uri_used: "CIDv1, 66 characters",
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

  // A realistic metadata URI, because tokenURI length drives the cost of a
  // certificate more than anything else the contract does. A CIDv1 pin is what
  // the issuance service actually produces; measuring with a short placeholder
  // understates mint by tens of thousands of gas.
  const URI =
    "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi";

  // Three mints are distinguished rather than averaged, because they differ by
  // which storage slots are already warm: the very first mint a contract ever
  // performs also pays to take the token counter from zero, a mint to a new
  // holder is the steady-state case, and a mint to a holder who already owns a
  // certificate is cheaper again.
  const mintFirst = await gasOf(v1.mint(animator.address, URI));
  const mintSubsequent = await gasOf(v1.mint(animator.address, URI));

  // How much of the mint cost is the URI? Reported because it is the one knob
  // an implementer controls, and it dominates.
  const uriSensitivity = {};
  for (const candidate of [
    "ipfs://QmShortPlaceholder",
    "ipfs://QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
    URI,
    URI + "/metadata.json",
  ]) {
    const fresh = hre.ethers.Wallet.createRandom().address;
    uriSensitivity[`${candidate.length} characters`] = await gasOf(
      v1.mint(fresh, candidate)
    );
  }

  const batchSizes = [1, 5, 10, 25];
  const mintBatch = {};
  for (const n of batchSizes) {
    const to = [];
    const uris = [];
    for (let i = 0; i < n; i++) {
      to.push(hre.ethers.Wallet.createRandom().address);
      uris.push(URI);
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

  const v2Mint = await gasOf(v2.mint(animator.address, URI));
  const coSign = await gasOf(v2.connect(studio).coSign(1));

  const out = {
    environment: env,
    deployment_gas: {
      AnimatorSBT: v1Deploy,
      AnimatorSBTV2: v2Deploy,
    },
    operation_gas: {
      "mint (first in the contract's lifetime)": mintFirst,
      "mint (new holder, steady state)": uriSensitivity["66 characters"],
      "mint (existing holder)": mintSubsequent,
      "mintBatch(1)": mintBatch[1],
      "mintBatch(5)": mintBatch[5],
      "mintBatch(10)": mintBatch[10],
      "mintBatch(25)": mintBatch[25],
      revoke: revoke,
      "grantRole (studio attester)": grantAttester,
      "mint (v2)": v2Mint,
      "coSign (studio attestation)": coSign,
    },
    mint_gas_by_uri_length: uriSensitivity,
    per_certificate_gas: {
      "self-attested (v1 mint, new holder)": uriSensitivity["66 characters"],
      "self-attested, amortised in a batch of 10": Math.round(mintBatch[10] / 10),
      "studio-attested (v2 mint + coSign)": uriSensitivity["66 characters"] + coSign,
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
