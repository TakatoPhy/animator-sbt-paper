/**
 * AnimatorSBT Issuance Service
 *
 * Handles the full SBT issuance workflow:
 * 1. Build contribution metadata JSON (Table III schema)
 * 2. Upload to IPFS via Pinata
 * 3. Compute evidence_hash (Keccak-256)
 * 4. Call AnimatorSBT.mint() on-chain
 */

const { ethers } = require("ethers");
const PinataSDK = require("@pinata/sdk");

// Load ABI from Hardhat artifacts
const AnimatorSBTArtifact = require("../../artifacts/contracts/AnimatorSBT.sol/AnimatorSBT.json");

class IssuanceService {
  constructor({ rpcUrl, privateKey, contractAddress, pinataApiKey, pinataSecret }) {
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.wallet = new ethers.Wallet(privateKey, this.provider);
    this.contract = new ethers.Contract(
      contractAddress,
      AnimatorSBTArtifact.abi,
      this.wallet
    );
    this.pinata = new PinataSDK(pinataApiKey, pinataSecret);
  }

  /**
   * Build metadata JSON conforming to Table III schema.
   */
  buildMetadata({
    animatorName,
    animatorWallet,
    project,
    role,
    taskCount,
    startDate,
    endDate,
    studioName,
    evidenceFiles = [],
  }) {
    const metadata = {
      name: `AnimatorSBT - ${animatorName}`,
      description: `Contribution certification for ${animatorName} on ${project}`,
      attributes: {
        animator_name: animatorName,
        animator_wallet: animatorWallet,
        project: project,
        role: role,
        task_count: taskCount,
        start_date: startDate,
        end_date: endDate,
        studio_name: studioName,
        issued_at: new Date().toISOString(),
      },
      evidence_files: evidenceFiles,
    };

    // Compute evidence_hash (Keccak-256 of stringified metadata)
    const evidenceHash = ethers.keccak256(
      ethers.toUtf8Bytes(JSON.stringify(metadata.attributes))
    );
    metadata.evidence_hash = evidenceHash;

    return metadata;
  }

  /**
   * Upload metadata JSON to IPFS via Pinata.
   * Returns the IPFS CID.
   */
  async uploadToIPFS(metadata, name) {
    const result = await this.pinata.pinJSONToIPFS(metadata, {
      pinataMetadata: { name: name || "AnimatorSBT-metadata" },
    });
    return result.IpfsHash;
  }

  /**
   * Mint an SBT with the given IPFS URI.
   * Returns { tokenId, txHash, gasUsed }.
   */
  async mint(toAddress, ipfsCid) {
    const uri = `ipfs://${ipfsCid}`;
    const tx = await this.contract.mint(toAddress, uri);
    const receipt = await tx.wait();

    // Parse SBTMinted event to get tokenId
    const mintEvent = receipt.logs.find((log) => {
      try {
        const parsed = this.contract.interface.parseLog(log);
        return parsed && parsed.name === "SBTMinted";
      } catch {
        return false;
      }
    });

    let tokenId;
    if (mintEvent) {
      const parsed = this.contract.interface.parseLog(mintEvent);
      tokenId = parsed.args.tokenId;
    }

    return {
      tokenId: tokenId ? tokenId.toString() : "unknown",
      txHash: receipt.hash,
      gasUsed: receipt.gasUsed.toString(),
      tokenURI: uri,
    };
  }

  /**
   * Full issuance flow: build metadata → upload to IPFS → mint SBT.
   */
  async issue(params) {
    console.log("1. Building metadata...");
    const metadata = this.buildMetadata(params);
    console.log("   evidence_hash:", metadata.evidence_hash);

    console.log("2. Uploading to IPFS via Pinata...");
    const cid = await this.uploadToIPFS(
      metadata,
      `SBT-${params.animatorName}-${params.project}`
    );
    console.log("   IPFS CID:", cid);

    console.log("3. Minting SBT on-chain...");
    const result = await this.mint(params.animatorWallet, cid);
    console.log("   Token ID:", result.tokenId);
    console.log("   TX Hash:", result.txHash);
    console.log("   Gas Used:", result.gasUsed);

    return { ...result, metadata, ipfsCid: cid };
  }
}

module.exports = { IssuanceService };
