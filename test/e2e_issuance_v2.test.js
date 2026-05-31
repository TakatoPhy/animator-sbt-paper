const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
  computeEvidenceHash,
  verifyEvidenceHash,
} = require("../services/issuance/canonical");

/**
 * Local end-to-end of the Phase C issuance flow, with NO external creds:
 *   build metadata + canonical evidence_hash  (off-chain, services/issuance)
 *   -> issuer mints the SBT to the animator    (on-chain, AnimatorSBTV2)
 *   -> studio co-signs                          (on-chain)
 *   -> verify ownership / URI / hash / attestation level
 *
 * IPFS upload (Pinata) and the real testnet are exercised only in the live POC
 * (they need keys); here we use a placeholder CID. This proves the contract +
 * canonical-hash + mint + co-sign compose correctly, and that the animator is
 * receive-only (only the issuer and attester sign).
 */
describe("Phase C issuance E2E (local, no creds)", function () {
  it("mints a self-attested SBT then elevates it to studio-attested", async function () {
    const [deployer, issuer, studio, animator] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory("AnimatorSBTV2");
    const sbt = await Factory.deploy();
    await sbt.waitForDeployment();

    await sbt.grantRole(await sbt.ISSUER_ROLE(), issuer.address);
    await sbt.grantRole(await sbt.STUDIO_ATTESTER_ROLE(), studio.address);

    // 1) Off-chain: build attributes + canonical evidence_hash
    const attributes = {
      animator_name: "Tanaka Yuki",
      animator_wallet: animator.address,
      project: "Episode 7",
      role: "key_anim",
      task_count: 25,
      start_date: "2025-01-15",
      end_date: "2025-03-30",
      studio_name: "Studio Example",
      issued_at: "2026-03-11T16:04:05.123Z", // fixed for determinism in test
    };
    const evidenceHash = computeEvidenceHash(attributes);
    expect(verifyEvidenceHash(attributes, evidenceHash)).to.be.true;

    // 2) (IPFS upload skipped locally) placeholder CID
    const cid = "QmLocalDemoPlaceholderCID";
    const uri = `ipfs://${cid}`;

    // 3) Issuer mints to the animator (animator does NOT sign)
    const mintRc = await (await sbt.connect(issuer).mint(animator.address, uri)).wait();
    const tokenId = 1n;

    expect(await sbt.ownerOf(tokenId)).to.equal(animator.address);
    expect(await sbt.tokenURI(tokenId)).to.equal(uri);
    expect(await sbt.attestationLevel(tokenId)).to.equal(0); // self-attested
    console.log(`    mint() gas: ${mintRc.gasUsed.toString()}`);

    // soulbound: animator cannot transfer it away
    await expect(
      sbt.connect(animator).transferFrom(animator.address, studio.address, tokenId)
    ).to.be.revertedWithCustomError(sbt, "SoulboundTransferDisabled");

    // 4) Studio co-signs -> studio-attested
    const coRc = await (await sbt.connect(studio).coSign(tokenId)).wait();
    expect(await sbt.attestationLevel(tokenId)).to.equal(1); // studio-attested
    expect(await sbt.hasCoSigned(tokenId, studio.address)).to.be.true;
    expect(await sbt.attestationCount(tokenId)).to.equal(1);
    console.log(`    coSign() gas: ${coRc.gasUsed.toString()}`);

    // 5) The credential's hash still verifies against the original attributes
    expect(verifyEvidenceHash(attributes, evidenceHash)).to.be.true;
  });
});
