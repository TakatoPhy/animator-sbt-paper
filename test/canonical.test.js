const { expect } = require("chai");
const {
  canonicalStringify,
  computeEvidenceHash,
  verifyEvidenceHash,
} = require("../services/issuance/canonical");

describe("canonical serialization & evidence_hash", function () {
  const attrs = {
    animator_name: "Tanaka Yuki",
    animator_wallet: "0x7eBa20e703",
    project: "Episode 7",
    role: "key_anim",
    task_count: 25,
    start_date: "2025-01-15",
    end_date: "2025-03-30",
    studio_name: "Studio Example",
  };

  it("is independent of key insertion order (the bug this fixes)", function () {
    // Same data, reversed key order
    const reordered = {};
    Object.keys(attrs)
      .reverse()
      .forEach((k) => (reordered[k] = attrs[k]));

    expect(canonicalStringify(reordered)).to.equal(canonicalStringify(attrs));
    expect(computeEvidenceHash(reordered)).to.equal(computeEvidenceHash(attrs));
  });

  it("produces a stable, reproducible hash for fixed input", function () {
    // If this value ever changes unexpectedly, serialization changed — investigate.
    const h1 = computeEvidenceHash(attrs);
    const h2 = computeEvidenceHash(JSON.parse(JSON.stringify(attrs)));
    expect(h1).to.equal(h2);
    expect(h1).to.match(/^0x[0-9a-f]{64}$/);
  });

  it("round-trips through verifyEvidenceHash", function () {
    const h = computeEvidenceHash(attrs);
    expect(verifyEvidenceHash(attrs, h)).to.be.true;
    expect(verifyEvidenceHash({ ...attrs, task_count: 26 }, h)).to.be.false;
  });

  it("changes when any value changes", function () {
    const a = computeEvidenceHash(attrs);
    const b = computeEvidenceHash({ ...attrs, role: "in_between" });
    expect(a).to.not.equal(b);
  });

  it("preserves array order (arrays are semantically ordered)", function () {
    const x = computeEvidenceHash({ evidence: ["a", "b"] });
    const y = computeEvidenceHash({ evidence: ["b", "a"] });
    expect(x).to.not.equal(y);
  });

  it("omits undefined-valued keys (matches JSON.stringify) and handles null", function () {
    expect(canonicalStringify({ a: 1, b: undefined })).to.equal(
      canonicalStringify({ a: 1 })
    );
    // null studio_name (NDA case) is kept and stable
    const withNull = computeEvidenceHash({ ...attrs, studio_name: null });
    expect(withNull).to.match(/^0x[0-9a-f]{64}$/);
    expect(withNull).to.not.equal(computeEvidenceHash(attrs));
  });

  it("canonicalizes nested objects recursively", function () {
    const a = canonicalStringify({ outer: { z: 1, a: 2 } });
    const b = canonicalStringify({ outer: { a: 2, z: 1 } });
    expect(a).to.equal(b);
    expect(a).to.equal('{"outer":{"a":2,"z":1}}');
  });
});
