# Certifying the Work That Credits Omit

**Paper:** "Certifying the Work That Credits Omit: Non-Transferable Records Anchored to Accepted Orders in Japanese Animation"

**Target:** Ledger (ledgerjournal.org). An earlier version is on SSRN as
*Soulbound Tokens for Anime Production*, DOI 10.2139/ssrn.6391520.

## Structure

```
paper/          LaTeX source (English, IEEE format)
  main.tex      Entry point
  sections/     Section files
  figures/      Figures and diagrams
paper-ja/       Japanese translation
contracts/      Solidity smart contracts
  AnimatorSBT.sol     v1 (deployed on Polygon Amoy testnet)
  AnimatorSBTV2.sol   v2 co-signing reference impl (local only)
services/       Issuance service + verification portal
test/           Hardhat test suite (60 tests)
simulation/     Cost analysis & simulation scripts
data/           Public datasets (NAFCA/JAniCA stats)
references/     BibTeX references
```

## Build

```bash
cd paper && latexmk -pdf main.tex   # paper
npx hardhat test                    # contracts (60 passing)
```

## Status & disclaimer

This is a **research prototype**, not a production system, and it has **not** been
independently audited.

- The **v1** `AnimatorSBT` contract is deployed on the **Polygon Amoy testnet only**
  (no mainnet, no real value).
- The **v2** `AnimatorSBTV2` co-signing contract is validated by the test suite but
  is **not deployed on-chain**. In the single-operator MVP the issuer also holds the
  studio-attester role, so a co-signature adds **no authenticity** until an
  independent, identity-bound studio operates the role.
- **No SBTs have been minted from real user data**; the end-to-end demos use scripted
  work logs.
- The metadata schema stores identifying fields (e.g., animator name) in cleartext;
  do **not** use this code with real personal data without a data-protection review
  (see the paper, §7.3). The wallet-abstraction and gasless-relayer components are
  design targets, not implemented.

## License

MIT — see [`LICENSE`](LICENSE). The smart contracts carry SPDX `MIT` headers.

## Authors

TOONIQ LLC (合同会社TOONIQ)
