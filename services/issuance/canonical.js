/**
 * Canonical (deterministic) JSON serialization + evidence_hash.
 *
 * The original issuance service hashed `JSON.stringify(attributes)`, whose byte
 * output depends on key INSERTION order. If two parties (issuer and verifier)
 * build the attributes object with different key order, their evidence_hash
 * disagree even for identical data — a classic, silent hash-mismatch bug. The
 * AnimatorSBT paper (Sec. 5.3 limitations) explicitly flags serialization
 * determinism as untested; this module fixes and tests it.
 *
 * `canonicalStringify` sorts object keys recursively so logically-equal objects
 * always serialize to identical bytes. Array order is preserved (it is
 * semantically meaningful). `undefined`-valued properties are omitted, matching
 * JSON.stringify semantics. This is intentionally a small, dependency-light
 * subset of RFC 8785 (JCS) sufficient for the flat metadata schema; if the
 * schema ever grows nested numeric edge cases, adopt a full JCS implementation.
 */

const { ethers } = require("ethers");

function canonicalStringify(value) {
  if (value === null || typeof value !== "object") {
    // primitives (string/number/boolean/null)
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return "[" + value.map(canonicalStringify).join(",") + "]";
  }
  const keys = Object.keys(value)
    .filter((k) => value[k] !== undefined) // omit undefined, like JSON.stringify
    .sort();
  return (
    "{" +
    keys
      .map((k) => JSON.stringify(k) + ":" + canonicalStringify(value[k]))
      .join(",") +
    "}"
  );
}

/** Keccak-256 over the canonical serialization of the attributes object. */
function computeEvidenceHash(attributes) {
  return ethers.keccak256(ethers.toUtf8Bytes(canonicalStringify(attributes)));
}

/**
 * Recompute the evidence hash from attributes and compare to a stored value.
 * NOTE (paper Sec. 4.4): this proves only INTEGRITY (the attributes are
 * unaltered since the hash was taken) — not AUTHENTICITY (that the work was
 * performed). Authenticity comes from studio co-signing (AnimatorSBTV2.coSign).
 */
function verifyEvidenceHash(attributes, expectedHash) {
  return computeEvidenceHash(attributes) === expectedHash;
}

module.exports = { canonicalStringify, computeEvidenceHash, verifyEvidenceHash };

/**
 * Selective disclosure by commitment.
 *
 * The published metadata should not carry a direct identifier. Writing an
 * animator's name to public, content-addressed storage that the on-chain record
 * points at permanently is not something a revocation flag can undo, and a hash
 * of personal data can itself remain personal data where the input space is
 * small enough to search (Finck 2018).
 *
 * So the certificate commits to a record that names the holder, and publishes
 * the record without the name. `evidence_hash` is taken over the full private
 * record — public attributes, plus the holder's name, plus a random salt the
 * holder keeps. A verifier who is shown the name and the salt recomputes the
 * hash and learns that this certificate was issued for that person; anyone else
 * sees a certified role, volume and period bound to an address, and cannot brute
 * force the name because they do not have the salt.
 *
 * This is not zero knowledge. The holder reveals the name in full to whoever
 * they choose to show it to. What it buys is that disclosure becomes an act the
 * holder performs per verifier, rather than a permanent publication performed
 * once by the issuer.
 */

/** Split a record into what is published and what the holder keeps. */
function buildDisclosure(attributes, { animatorName, salt } = {}) {
  if (!animatorName) throw new Error("animatorName is required for the commitment");
  const s = salt || ethers.hexlify(ethers.randomBytes(32));
  const publicAttributes = { ...attributes };
  delete publicAttributes.animator_name;
  const privateRecord = { ...publicAttributes, animator_name: animatorName, salt: s };
  return {
    publicAttributes,
    evidenceHash: computeEvidenceHash(privateRecord),
    // the holder keeps these; they are never pinned and never go on chain
    disclosureSecret: { animator_name: animatorName, salt: s },
  };
}

/** Verify a disclosure a holder has presented against a published certificate. */
function verifyDisclosure(publicAttributes, disclosureSecret, expectedHash) {
  const rebuilt = { ...publicAttributes, ...disclosureSecret };
  return computeEvidenceHash(rebuilt) === expectedHash;
}

module.exports.buildDisclosure = buildDisclosure;
module.exports.verifyDisclosure = verifyDisclosure;
