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
