const { expect } = require("chai");
const {
  buildDisclosure,
  verifyDisclosure,
  computeEvidenceHash,
} = require("../services/issuance/canonical");

const ATTRS = {
  animator_name: "A. Kimura",
  animator_wallet: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
  project: "Episode 7",
  role: "key_anim",
  task_count: 25,
  start_date: "2026-01-15",
  end_date: "2026-03-30",
  studio_name: null,
};

describe("selective disclosure by commitment", () => {
  it("publishes no direct identifier", () => {
    const { publicAttributes } = buildDisclosure(ATTRS, {
      animatorName: ATTRS.animator_name,
    });
    expect(publicAttributes).to.not.have.property("animator_name");
    expect(JSON.stringify(publicAttributes)).to.not.include("Kimura");
  });

  it("keeps the attributes a verifier needs without the holder's consent", () => {
    const { publicAttributes } = buildDisclosure(ATTRS, {
      animatorName: ATTRS.animator_name,
    });
    expect(publicAttributes.role).to.equal("key_anim");
    expect(publicAttributes.task_count).to.equal(25);
    expect(publicAttributes.start_date).to.equal("2026-01-15");
  });

  it("verifies a disclosure the holder presents", () => {
    const d = buildDisclosure(ATTRS, { animatorName: ATTRS.animator_name });
    expect(verifyDisclosure(d.publicAttributes, d.disclosureSecret, d.evidenceHash))
      .to.equal(true);
  });

  it("rejects a different name against the same certificate", () => {
    const d = buildDisclosure(ATTRS, { animatorName: ATTRS.animator_name });
    const forged = { ...d.disclosureSecret, animator_name: "B. Sato" };
    expect(verifyDisclosure(d.publicAttributes, forged, d.evidenceHash))
      .to.equal(false);
  });

  it("rejects a correct name with the wrong salt", () => {
    const d = buildDisclosure(ATTRS, { animatorName: ATTRS.animator_name });
    const forged = { ...d.disclosureSecret, salt: "0x" + "ab".repeat(32) };
    expect(verifyDisclosure(d.publicAttributes, forged, d.evidenceHash))
      .to.equal(false);
  });

  it("rejects a disclosure against altered public attributes", () => {
    const d = buildDisclosure(ATTRS, { animatorName: ATTRS.animator_name });
    const tampered = { ...d.publicAttributes, task_count: 26 };
    expect(verifyDisclosure(tampered, d.disclosureSecret, d.evidenceHash))
      .to.equal(false);
  });

  it("gives two certificates for the same person unlinkable commitments", () => {
    // Distinct salts mean the digests do not reveal that one person holds both.
    const a = buildDisclosure(ATTRS, { animatorName: ATTRS.animator_name });
    const b = buildDisclosure(ATTRS, { animatorName: ATTRS.animator_name });
    expect(a.evidenceHash).to.not.equal(b.evidenceHash);
    expect(a.disclosureSecret.salt).to.not.equal(b.disclosureSecret.salt);
  });

  it("is stable when a salt is supplied, so issuance is reproducible", () => {
    const salt = "0x" + "11".repeat(32);
    const a = buildDisclosure(ATTRS, { animatorName: ATTRS.animator_name, salt });
    const b = buildDisclosure(ATTRS, { animatorName: ATTRS.animator_name, salt });
    expect(a.evidenceHash).to.equal(b.evidenceHash);
  });

  it("refuses to build a commitment without a name", () => {
    expect(() => buildDisclosure(ATTRS, {})).to.throw(/animatorName/);
  });

  it("still hashes the private record canonically, independent of key order", () => {
    const salt = "0x" + "22".repeat(32);
    const a = buildDisclosure(ATTRS, { animatorName: "A. Kimura", salt });
    const reordered = Object.fromEntries(
      Object.entries(ATTRS).reverse()
    );
    const b = buildDisclosure(reordered, { animatorName: "A. Kimura", salt });
    expect(a.evidenceHash).to.equal(b.evidenceHash);
  });
});
