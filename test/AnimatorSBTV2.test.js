const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AnimatorSBTV2 (co-signing layer)", function () {
  let sbt;
  let admin, issuer, studio1, studio2, animator1, nonAttester;
  let ISSUER_ROLE, STUDIO_ATTESTER_ROLE, DEFAULT_ADMIN_ROLE;
  const URI = "ipfs://QmTestV2";

  beforeEach(async function () {
    [admin, issuer, studio1, studio2, animator1, nonAttester] =
      await ethers.getSigners();

    const Factory = await ethers.getContractFactory("AnimatorSBTV2");
    sbt = await Factory.deploy();
    await sbt.waitForDeployment();

    ISSUER_ROLE = await sbt.ISSUER_ROLE();
    STUDIO_ATTESTER_ROLE = await sbt.STUDIO_ATTESTER_ROLE();
    DEFAULT_ADMIN_ROLE = await sbt.DEFAULT_ADMIN_ROLE();

    await sbt.grantRole(ISSUER_ROLE, issuer.address);
    await sbt.grantRole(STUDIO_ATTESTER_ROLE, studio1.address);
    // mint a self-attested token (id 1) to animator1
    await sbt.connect(issuer).mint(animator1.address, URI);
  });

  // ===== Deployment / roles =====
  describe("Deployment", function () {
    it("Should keep name/symbol and grant all three roles to deployer", async function () {
      expect(await sbt.name()).to.equal("AnimatorSBT");
      expect(await sbt.hasRole(DEFAULT_ADMIN_ROLE, admin.address)).to.be.true;
      expect(await sbt.hasRole(ISSUER_ROLE, admin.address)).to.be.true;
      expect(await sbt.hasRole(STUDIO_ATTESTER_ROLE, admin.address)).to.be.true;
    });

    it("A freshly minted token starts self-attested (level 0)", async function () {
      expect(await sbt.attestationLevel(1)).to.equal(0);
      expect(await sbt.attestationCount(1)).to.equal(0);
      expect((await sbt.attesters(1)).length).to.equal(0);
    });
  });

  // ===== coSign() =====
  describe("coSign()", function () {
    it("A studio attester elevates the token to studio-attested (level 1)", async function () {
      const tx = await sbt.connect(studio1).coSign(1);
      const receipt = await tx.wait();

      expect(await sbt.attestationLevel(1)).to.equal(1);
      expect(await sbt.attestationCount(1)).to.equal(1);
      expect(await sbt.hasCoSigned(1, studio1.address)).to.be.true;
      const list = await sbt.attesters(1);
      expect(list.length).to.equal(1);
      expect(list[0]).to.equal(studio1.address);

      console.log(`    coSign() gas used: ${receipt.gasUsed.toString()}`);
    });

    it("Should emit SBTCoSigned", async function () {
      await expect(sbt.connect(studio1).coSign(1))
        .to.emit(sbt, "SBTCoSigned")
        .withArgs(1, studio1.address, (v) => v > 0);
    });

    it("Should revert when caller lacks STUDIO_ATTESTER_ROLE", async function () {
      await expect(
        sbt.connect(nonAttester).coSign(1)
      ).to.be.revertedWith(/AccessControl: account .* is missing role .*/);
    });

    it("Should revert for a non-existent token", async function () {
      await expect(sbt.connect(studio1).coSign(999)).to.be.revertedWith(
        "ERC721: invalid token ID"
      );
    });

    it("Should revert when co-signing a revoked token", async function () {
      await sbt.connect(issuer).revoke(1);
      await expect(
        sbt.connect(studio1).coSign(1)
      ).to.be.revertedWithCustomError(sbt, "CannotCoSignRevokedToken");
    });

    it("Should revert on duplicate attestation by the same studio", async function () {
      await sbt.connect(studio1).coSign(1);
      await expect(
        sbt.connect(studio1).coSign(1)
      ).to.be.revertedWithCustomError(sbt, "DuplicateAttestation");
    });

    it("Should allow multiple distinct studios to co-sign (multi-studio)", async function () {
      await sbt.grantRole(STUDIO_ATTESTER_ROLE, studio2.address);
      await sbt.connect(studio1).coSign(1);
      await sbt.connect(studio2).coSign(1);

      expect(await sbt.attestationCount(1)).to.equal(2);
      expect(await sbt.attestationLevel(1)).to.equal(1); // coarse level stays 1
      expect(await sbt.hasCoSigned(1, studio1.address)).to.be.true;
      expect(await sbt.hasCoSigned(1, studio2.address)).to.be.true;
      const list = await sbt.attesters(1);
      expect(list).to.have.lengthOf(2);
      expect(list).to.include(studio1.address);
      expect(list).to.include(studio2.address);
    });
  });

  // ===== AccessControl for the new role =====
  describe("STUDIO_ATTESTER_ROLE management", function () {
    it("Admin can grant the attester role to a studio, which can then co-sign", async function () {
      expect(await sbt.hasCoSigned(1, studio2.address)).to.be.false;
      await sbt.grantRole(STUDIO_ATTESTER_ROLE, studio2.address);
      await sbt.connect(studio2).coSign(1);
      expect(await sbt.hasCoSigned(1, studio2.address)).to.be.true;
    });

    it("Admin can revoke the attester role; revoked studio can no longer co-sign", async function () {
      await sbt.revokeRole(STUDIO_ATTESTER_ROLE, studio1.address);
      await expect(
        sbt.connect(studio1).coSign(1)
      ).to.be.revertedWith(/AccessControl: account .* is missing role .*/);
    });
  });

  // ===== ERC-5192 (minimal soulbound) signaling =====
  describe("ERC-5192 locked() interface", function () {
    it("reports every minted token as permanently locked", async function () {
      expect(await sbt.locked(1)).to.be.true;
    });

    it("reverts locked() for a non-existent token", async function () {
      await expect(sbt.locked(999)).to.be.revertedWith(
        "ERC721: invalid token ID"
      );
    });

    it("emits Locked(tokenId) on mint", async function () {
      await expect(sbt.connect(issuer).mint(animator1.address, URI))
        .to.emit(sbt, "Locked")
        .withArgs(2); // token 1 minted in beforeEach
    });

    it("advertises the ERC-5192 interface id (0xb45a3c0e) via supportsInterface", async function () {
      expect(await sbt.supportsInterface("0xb45a3c0e")).to.be.true;
    });
  });

  // ===== Sanity: v1 behavior preserved =====
  describe("Inherited behavior still holds", function () {
    it("Soulbinding still blocks transfers", async function () {
      await expect(
        sbt
          .connect(animator1)
          .transferFrom(animator1.address, studio1.address, 1)
      ).to.be.revertedWithCustomError(sbt, "SoulboundTransferDisabled");
    });

    it("Co-signing does not affect tokenURI/ownership", async function () {
      await sbt.connect(studio1).coSign(1);
      expect(await sbt.ownerOf(1)).to.equal(animator1.address);
      expect(await sbt.tokenURI(1)).to.equal(URI);
    });
  });
});
