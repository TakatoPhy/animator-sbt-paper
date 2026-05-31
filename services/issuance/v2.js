/**
 * AnimatorSBT Issuance Service v2 (Phase C).
 *
 * Extends the v1 flow (build metadata -> IPFS -> mint) with:
 *   - canonical/deterministic evidence_hash (see ./canonical.js)
 *   - studio co-signing: coSign(tokenId) via a STUDIO_ATTESTER_ROLE wallet,
 *     elevating a self-attested SBT to studio-attested (AnimatorSBTV2.coSign).
 *   - separate issuer (ISSUER_ROLE) and attester (STUDIO_ATTESTER_ROLE) wallets,
 *     so the studio's co-signature is a distinct on-chain actor.
 *
 * NOT YET DEPLOYED. Targets a fresh AnimatorSBTV2 deployment on a testnet.
 * Wallet provisioning for the animator (the mint recipient) is delegated to a
 * WalletProvider (see ./wallet-provider.js); the recommended MVP provider is
 * Coinbase CDP Embedded Wallets (op-based pricing, non-custodial TEE, key
 * export) — see the Phase C plan ADR-001. The animator is a RECEIVE-ONLY
 * address here: the issuer wallet calls mint() and pays gas, so the animator
 * never signs for issuance.
 */

const { ethers } = require("ethers");
const PinataSDK = require("@pinata/sdk");
const { computeEvidenceHash, verifyEvidenceHash } = require("./canonical");

// v2 ABI (compiled by `hardhat compile`)
const AnimatorSBTV2Artifact = require("../../artifacts/contracts/AnimatorSBTV2.sol/AnimatorSBTV2.json");

class IssuanceServiceV2 {
  /**
   * @param {object} cfg
   * @param {string} cfg.rpcUrl
   * @param {string} cfg.issuerPrivateKey   ISSUER_ROLE wallet (mints, pays gas)
   * @param {string} [cfg.attesterPrivateKey] STUDIO_ATTESTER_ROLE wallet (co-signs).
   *        Defaults to the issuer key (single-operator MVP); use a distinct key
   *        once real studios hold the attester role.
   * @param {string} cfg.contractAddress     deployed AnimatorSBTV2 address
   * @param {string} cfg.pinataApiKey
   * @param {string} cfg.pinataSecret
   */
  constructor({
    rpcUrl,
    issuerPrivateKey,
    attesterPrivateKey,
    contractAddress,
    pinataApiKey,
    pinataSecret,
  }) {
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.issuerWallet = new ethers.Wallet(issuerPrivateKey, this.provider);
    this.attesterWallet = new ethers.Wallet(
      attesterPrivateKey || issuerPrivateKey,
      this.provider
    );
    this.abi = AnimatorSBTV2Artifact.abi;
    this.contractAddress = contractAddress;
    this.asIssuer = new ethers.Contract(contractAddress, this.abi, this.issuerWallet);
    this.asAttester = new ethers.Contract(contractAddress, this.abi, this.attesterWallet);
    this.pinata = new PinataSDK(pinataApiKey, pinataSecret);
  }

  /** Build metadata (Table III schema) with a canonical evidence_hash. */
  buildMetadata({
    animatorName,
    animatorWallet,
    project,
    role,
    taskCount,
    startDate,
    endDate,
    studioName = null,
    evidenceFiles = [],
    issuedAt,
  }) {
    const attributes = {
      animator_name: animatorName,
      animator_wallet: animatorWallet,
      project,
      role,
      task_count: taskCount,
      start_date: startDate,
      end_date: endDate,
      studio_name: studioName, // nullable (NDA)
      issued_at: issuedAt || new Date().toISOString(),
    };
    return {
      name: `AnimatorSBT - ${animatorName}`,
      description: `Contribution certification for ${animatorName} on ${project}`,
      attributes,
      evidence_files: evidenceFiles,
      evidence_hash: computeEvidenceHash(attributes),
    };
  }

  async uploadToIPFS(metadata, name) {
    const result = await this.pinata.pinJSONToIPFS(metadata, {
      pinataMetadata: { name: name || "AnimatorSBT-metadata" },
    });
    return result.IpfsHash;
  }

  /** Mint a (self-attested) SBT to the animator's address. Issuer pays gas. */
  async mint(toAddress, ipfsCid) {
    const uri = `ipfs://${ipfsCid}`;
    const receipt = await (await this.asIssuer.mint(toAddress, uri)).wait();
    const tokenId = this._parseTokenId(receipt, "SBTMinted");
    return { tokenId, txHash: receipt.hash, gasUsed: receipt.gasUsed.toString(), tokenURI: uri };
  }

  /**
   * Studio co-signs an existing token, elevating it to studio-attested.
   * Caller wallet must hold STUDIO_ATTESTER_ROLE.
   */
  async coSign(tokenId) {
    const receipt = await (await this.asAttester.coSign(tokenId)).wait();
    return {
      tokenId: tokenId.toString(),
      txHash: receipt.hash,
      gasUsed: receipt.gasUsed.toString(),
      attestationLevel: (await this.asIssuer.attestationLevel(tokenId)).toString(),
    };
  }

  _parseTokenId(receipt, eventName) {
    for (const log of receipt.logs) {
      try {
        const parsed = this.asIssuer.interface.parseLog(log);
        if (parsed && parsed.name === eventName) return parsed.args.tokenId.toString();
      } catch {
        /* not our event */
      }
    }
    return "unknown";
  }

  /**
   * Full flow: metadata -> IPFS -> mint (self-attested). Optionally co-sign.
   * Idempotency (1 contribution = 1 SBT) is enforced UPSTREAM by AnimaTime's
   * SbtIssuance ledger (unique on [staffId, episodeId, role]); this service is
   * the executor. Do not call twice for the same contribution.
   */
  async issue(params, { coSign = false } = {}) {
    const metadata = this.buildMetadata(params);
    if (!verifyEvidenceHash(metadata.attributes, metadata.evidence_hash)) {
      throw new Error("evidence_hash self-check failed"); // should never happen
    }
    const cid = await this.uploadToIPFS(metadata, `SBT-${params.animatorName}-${params.project}`);
    const minted = await this.mint(params.animatorWallet, cid);
    let attestation = null;
    if (coSign && minted.tokenId !== "unknown") {
      attestation = await this.coSign(minted.tokenId);
    }
    return { ...minted, ipfsCid: cid, metadata, attestation };
  }
}

module.exports = { IssuanceServiceV2 };
