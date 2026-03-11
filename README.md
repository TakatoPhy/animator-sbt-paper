# Soulbound Tokens for Anime Production

**Paper:** "Soulbound Tokens for Anime Production: A Blockchain-Based Contribution Certification Framework for Freelance Animators"

**Target:** SSRN preprint

## Structure

```
paper/          LaTeX source
  main.tex      Entry point
  sections/     Section files
  figures/      Figures and diagrams
contracts/      Solidity smart contracts (AnimatorSBT)
simulation/     Cost analysis & simulation scripts
data/           Public datasets (NAFCA/JAniCA stats)
references/     BibTeX references
```

## Build

```bash
cd paper && latexmk -pdf main.tex
```

## Authors

TOONIQ LLC
