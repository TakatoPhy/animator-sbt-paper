const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AnimatorSBT", function () {
  let sbt;
  let admin, issuer, animator1, animator2, nonIssuer;
  let ISSUER_ROLE, DEFAULT_ADMIN_ROLE;

  beforeEach(async function () {
    [admin, issuer, animator1, animator2, nonIssuer] =
      await ethers.getSigners();

    const AnimatorSBT = await ethers.getContractFactory("AnimatorSBT");
    sbt = await AnimatorSBT.deploy();
    await sbt.waitForDeployment();

    ISSUER_ROLE = await sbt.ISSUER_ROLE();
    DEFAULT_ADMIN_ROLE = await sbt.DEFAULT_ADMIN_ROLE();

    // Grant ISSUER_ROLE to issuer account
    await sbt.grantRole(ISSUER_ROLE, issuer.address);
  });

  // ===== Deployment =====
  describe("Deployment", function () {
    it("Should set correct name and symbol", async function () {
      expect(await sbt.name()).to.equal("AnimatorSBT");
      expect(await sbt.symbol()).to.equal("ASBT");
    });

    it("Should grant DEFAULT_ADMIN_ROLE to deployer", async function () {
      expect(await sbt.hasRole(DEFAULT_ADMIN_ROLE, admin.address)).to.be.true;
    });

    it("Should grant ISSUER_ROLE to deployer", async function () {
      expect(await sbt.hasRole(ISSUER_ROLE, admin.address)).to.be.true;
    });

    it("Should start with 0 total minted", async function () {
      expect(await sbt.totalMinted()).to.equal(0);
    });
  });

  // ===== mint() =====
  describe("mint()", function () {
    const tokenURI = "ipfs://QmTest123456789";

    it("Should mint with ISSUER_ROLE", async function () {
      const tx = await sbt.connect(issuer).mint(animator1.address, tokenURI);
      const receipt = await tx.wait();

      expect(await sbt.ownerOf(1)).to.equal(animator1.address);
      expect(await sbt.tokenURI(1)).to.equal(tokenURI);
      expect(await sbt.totalMinted()).to.equal(1);

      // Gas reporting
      console.log(`    mint() gas used: ${receipt.gasUsed.toString()}`);
    });

    it("Should emit SBTMinted event", async function () {
      await expect(sbt.connect(issuer).mint(animator1.address, tokenURI))
        .to.emit(sbt, "SBTMinted")
        .withArgs(1, animator1.address, tokenURI, (v) => v > 0);
    });

    it("Should record issuedAt timestamp", async function () {
      await sbt.connect(issuer).mint(animator1.address, tokenURI);
      const timestamp = await sbt.issuedAt(1);
      expect(timestamp).to.be.gt(0);
    });

    it("Should increment token IDs", async function () {
      await sbt.connect(issuer).mint(animator1.address, tokenURI);
      await sbt.connect(issuer).mint(animator2.address, tokenURI);
      expect(await sbt.ownerOf(1)).to.equal(animator1.address);
      expect(await sbt.ownerOf(2)).to.equal(animator2.address);
      expect(await sbt.totalMinted()).to.equal(2);
    });

    it("Should revert when caller lacks ISSUER_ROLE", async function () {
      await expect(
        sbt.connect(nonIssuer).mint(animator1.address, tokenURI)
      ).to.be.revertedWith(
        /AccessControl: account .* is missing role .*/
      );
    });
  });

  // ===== mintBatch() =====
  describe("mintBatch()", function () {
    it("Should batch mint to multiple recipients", async function () {
      const recipients = [animator1.address, animator2.address];
      const uris = ["ipfs://QmA", "ipfs://QmB"];

      const tx = await sbt.connect(issuer).mintBatch(recipients, uris);
      const receipt = await tx.wait();

      expect(await sbt.ownerOf(1)).to.equal(animator1.address);
      expect(await sbt.ownerOf(2)).to.equal(animator2.address);
      expect(await sbt.tokenURI(1)).to.equal("ipfs://QmA");
      expect(await sbt.tokenURI(2)).to.equal("ipfs://QmB");
      expect(await sbt.totalMinted()).to.equal(2);

      console.log(
        `    mintBatch(2) gas used: ${receipt.gasUsed.toString()}`
      );
    });

    it("Should batch mint 10 tokens and report gas", async function () {
      const signers = await ethers.getSigners();
      const recipients = [];
      const uris = [];
      for (let i = 0; i < 10; i++) {
        recipients.push(signers[i % signers.length].address);
        uris.push(`ipfs://QmBatch${i}`);
      }

      const tx = await sbt.connect(issuer).mintBatch(recipients, uris);
      const receipt = await tx.wait();

      expect(await sbt.totalMinted()).to.equal(10);
      console.log(
        `    mintBatch(10) gas used: ${receipt.gasUsed.toString()}`
      );
    });

    it("Should revert on length mismatch", async function () {
      const recipients = [animator1.address, animator2.address];
      const uris = ["ipfs://QmA"];

      await expect(
        sbt.connect(issuer).mintBatch(recipients, uris)
      ).to.be.revertedWith("Length mismatch");
    });

    it("Should revert when caller lacks ISSUER_ROLE", async function () {
      await expect(
        sbt
          .connect(nonIssuer)
          .mintBatch([animator1.address], ["ipfs://QmA"])
      ).to.be.revertedWith(
        /AccessControl: account .* is missing role .*/
      );
    });
  });

  // ===== tokenURI() =====
  describe("tokenURI()", function () {
    it("Should return correct URI after mint", async function () {
      const uri = "ipfs://QmMetadata123";
      await sbt.connect(issuer).mint(animator1.address, uri);
      expect(await sbt.tokenURI(1)).to.equal(uri);
    });

    it("Should revert for non-existent token", async function () {
      await expect(sbt.tokenURI(999)).to.be.revertedWith(
        "ERC721: invalid token ID"
      );
    });
  });

  // ===== Soulbinding =====
  describe("Soulbinding", function () {
    beforeEach(async function () {
      await sbt.connect(issuer).mint(animator1.address, "ipfs://QmTest");
    });

    it("Should revert on transferFrom", async function () {
      await expect(
        sbt
          .connect(animator1)
          .transferFrom(animator1.address, animator2.address, 1)
      ).to.be.revertedWithCustomError(sbt, "SoulboundTransferDisabled");
    });

    it("Should revert on safeTransferFrom", async function () {
      await expect(
        sbt
          .connect(animator1)
          ["safeTransferFrom(address,address,uint256)"](
            animator1.address,
            animator2.address,
            1
          )
      ).to.be.revertedWithCustomError(sbt, "SoulboundTransferDisabled");
    });

    it("Should revert on approve", async function () {
      await expect(
        sbt.connect(animator1).approve(animator2.address, 1)
      ).to.be.revertedWithCustomError(sbt, "SoulboundTransferDisabled");
    });

    it("Should revert on setApprovalForAll", async function () {
      await expect(
        sbt.connect(animator1).setApprovalForAll(animator2.address, true)
      ).to.be.revertedWithCustomError(sbt, "SoulboundTransferDisabled");
    });
  });

  // ===== revoke() =====
  describe("revoke()", function () {
    beforeEach(async function () {
      await sbt.connect(issuer).mint(animator1.address, "ipfs://QmTest");
    });

    it("Should revoke a token", async function () {
      const tx = await sbt.connect(issuer).revoke(1);
      const receipt = await tx.wait();

      expect(await sbt.isRevoked(1)).to.be.true;
      console.log(`    revoke() gas used: ${receipt.gasUsed.toString()}`);
    });

    it("Should emit SBTRevoked event", async function () {
      await expect(sbt.connect(issuer).revoke(1))
        .to.emit(sbt, "SBTRevoked")
        .withArgs(1, (v) => v > 0);
    });

    it("Should revert on double revoke", async function () {
      await sbt.connect(issuer).revoke(1);
      await expect(
        sbt.connect(issuer).revoke(1)
      ).to.be.revertedWithCustomError(sbt, "TokenAlreadyRevoked");
    });

    it("Should revert for non-existent token", async function () {
      await expect(
        sbt.connect(issuer).revoke(999)
      ).to.be.revertedWith("ERC721: invalid token ID");
    });

    it("Should revert when caller lacks ISSUER_ROLE", async function () {
      await expect(
        sbt.connect(nonIssuer).revoke(1)
      ).to.be.revertedWith(
        /AccessControl: account .* is missing role .*/
      );
    });
  });

  // ===== View Functions =====
  describe("View Functions", function () {
    beforeEach(async function () {
      await sbt.connect(issuer).mint(animator1.address, "ipfs://Qm1");
      await sbt.connect(issuer).mint(animator1.address, "ipfs://Qm2");
      await sbt.connect(issuer).mint(animator2.address, "ipfs://Qm3");
    });

    it("isRevoked() should return false for non-revoked token", async function () {
      expect(await sbt.isRevoked(1)).to.be.false;
    });

    it("issuedAt() should return block timestamp", async function () {
      const timestamp = await sbt.issuedAt(1);
      expect(timestamp).to.be.gt(0);
    });

    it("totalMinted() should return correct count", async function () {
      expect(await sbt.totalMinted()).to.equal(3);
    });

    it("tokensOfOwner() should return all tokens for an owner", async function () {
      const tokens = await sbt.tokensOfOwner(animator1.address);
      expect(tokens.length).to.equal(2);
      expect(tokens[0]).to.equal(1);
      expect(tokens[1]).to.equal(2);
    });

    it("tokensOfOwner() should return single token for single holder", async function () {
      const tokens = await sbt.tokensOfOwner(animator2.address);
      expect(tokens.length).to.equal(1);
      expect(tokens[0]).to.equal(3);
    });

    it("tokensOfOwner() should return empty array for non-holder", async function () {
      const tokens = await sbt.tokensOfOwner(nonIssuer.address);
      expect(tokens.length).to.equal(0);
    });
  });

  // ===== AccessControl =====
  describe("AccessControl", function () {
    it("Admin should grant ISSUER_ROLE", async function () {
      await sbt.grantRole(ISSUER_ROLE, nonIssuer.address);
      expect(await sbt.hasRole(ISSUER_ROLE, nonIssuer.address)).to.be.true;

      // Newly granted issuer can mint
      await sbt.connect(nonIssuer).mint(animator1.address, "ipfs://QmNew");
      expect(await sbt.ownerOf(1)).to.equal(animator1.address);
    });

    it("Admin should revoke ISSUER_ROLE", async function () {
      await sbt.revokeRole(ISSUER_ROLE, issuer.address);
      expect(await sbt.hasRole(ISSUER_ROLE, issuer.address)).to.be.false;

      // Revoked issuer cannot mint
      await expect(
        sbt.connect(issuer).mint(animator1.address, "ipfs://QmFail")
      ).to.be.revertedWith(
        /AccessControl: account .* is missing role .*/
      );
    });

    it("Non-admin should not grant roles", async function () {
      await expect(
        sbt.connect(nonIssuer).grantRole(ISSUER_ROLE, nonIssuer.address)
      ).to.be.revertedWith(
        /AccessControl: account .* is missing role .*/
      );
    });

    it("supportsInterface should return true for ERC721 and AccessControl", async function () {
      // ERC721 interface ID: 0x80ac58cd
      expect(await sbt.supportsInterface("0x80ac58cd")).to.be.true;
      // AccessControl interface ID: 0x7965db0b
      expect(await sbt.supportsInterface("0x7965db0b")).to.be.true;
      // ERC165 interface ID: 0x01ffc9a7
      expect(await sbt.supportsInterface("0x01ffc9a7")).to.be.true;
    });
  });

  // ===== Gas Measurement Summary =====
  describe("Gas Measurement", function () {
    it("Should measure deploy gas", async function () {
      const AnimatorSBT = await ethers.getContractFactory("AnimatorSBT");
      const deployTx = await AnimatorSBT.deploy();
      const receipt = await deployTx.deploymentTransaction().wait();
      console.log(`    deploy() gas used: ${receipt.gasUsed.toString()}`);
    });
  });
});
