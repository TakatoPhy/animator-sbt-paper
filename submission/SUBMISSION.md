# Ledger submission checklist

Everything the submission form asks for, with the text to paste where it asks for
text. Source of the requirements: the journal's own submission page and fee page,
read 2026-09-12; the reasoning behind the choices is in
`lit/ledger_venue_analysis.md`.

## Files to upload

| File | What it is |
|---|---|
| `Ledger_manuscript.pdf` | The manuscript, built from `paper/main-ledger.tex` with the journal's own `ledger.cls`. 32 pages. |
| `Ledger_cover_letter.pdf` | Cover letter. Uploaded as a supplementary file at Step 4, not as the manuscript. |

Rebuild the manuscript with:

```
cd paper && pdflatex main-ledger && bibtex main-ledger \
  && pdflatex main-ledger && pdflatex main-ledger
```

⚠️ `ledger.cls` as distributed does not compile under TeX Live 2025. Two changes
are applied, with the original kept as `paper/ledger.cls.orig`: an obsolete
`compatibility=true` passed to `\captionsetup`, and a global redefinition of
`\item` that broke every list in the body, now scoped to the keywords
environment. Both are documented in the commit that introduced them.

## Article type

**Research Article.** `\pretitle` in `main-ledger.tex` is already set to this and
retains the required line "Submission Under Consideration at Ledger".

## Fee declaration

Paste into **Comments for the Editor**, verbatim, exactly one of the four options
the journal lists. The applicable one:

> 2. I am institutionally supported without funding and would like my fees fully
> waived.

Rationale: the journal charges "institutionally-supported authors **with available
funding**" and waives in full for "authors without institutional backing or whose
institutions cannot afford it". The author is affiliated with TOONIQ LLC and Tokyo
University of Science; neither holds funds earmarked for open-access publication.
No fee is invoiced until after peer review and acceptance, so this does not gate
submission. Confirmed with the owner 2026-09-12.

## Suggested reviewers

Three are required. All three are cited in the paper, which is the journal's own
advice for finding them, and none has any relationship with the author. Contact
details were taken from the sources named, not constructed.

| Name | Affiliation | Email | Why |
|---|---|---|---|
| Macià Mut-Puigserver | Universitat de les Illes Balears, Palma, Spain | `macia.mut@uib.cat` | Corresponding author on a rejectable-soulbound-token credentials system with a Solidity implementation and cost and security analysis, *Annals of Telecommunications* 79:843–855 (2024). Same methodology as this paper. Email is printed in that article. |
| Andrea Pinna | University of Cagliari, Dept. of Mathematics and Information Technology | `pinna.andrea@unica.it` | First author of an SBT application case study in the health sector, ACM *Distributed Ledger Technologies: Research and Practice*. Works on blockchain-oriented software engineering. Email from the university's own staff page. |
| Nikhil Malik | USC Marshall School of Business | `maliknik@marshall.usc.edu` | First author, "Blockchain technology for creative industries", *International Journal of Research in Marketing* 40(1):38–48 (2023). Covers the creative-industry and economics side the other two do not. Email from the CV hosted by USC Marshall. |

Alternate if one declines: M. Magdalena Payeras-Capellá, UIB, `mpayeras@uib.cat`.

## Checklist items the form asks you to confirm

- **Original, unpublished, not under consideration elsewhere.** True. An earlier
  version is public as an SSRN preprint, DOI `10.2139/ssrn.6391520`, under the
  title *Soulbound Tokens for Anime Production*. Ledger explicitly accepts
  submissions previously posted to SSRN, arXiv or Crypto ePrint, and permits
  posting a prepublication manuscript before and during review. Disclose the
  preprint; do not describe it as a separate work.
- **Citations are real and not artificially generated, with doi.org links where
  available.** All 59 entries were audited against DOI registrars, publisher
  deposits and issuing bodies' own documents on 2026-09-12; the record of what was
  wrong and what it was corrected to is in `references/AUDIT.md`.
- **Agreement with the AI policy.** Generative AI was used and is disclosed in the
  paper under *Statements → Use of generative AI*. It assisted with implementation
  and produced first drafts the author revised.
- **Conflicts of interest declared.** Disclosed in the paper and in the cover
  letter: the author founded TOONIQ LLC, which builds production-management
  software for this industry and would be party to any deployment.
- **Fee schedule understood.** See above.

## Conditions of publication to be aware of before accepting

- **Licence is CC BY 4.0**, with the author retaining copyright.
- **Source availability is a condition**: the journal requires that all material
  necessary to evaluate the findings be freely available. The contracts, tests,
  issuance service, measurement scripts and the data files behind every figure are
  public at `github.com/TakatoPhy/animator-sbt-paper` under MIT, and the paper says
  so in *Statements → Data and code availability*. The paper is explicit that the
  order-anchored issuance path exists only in a closed commercial system and is
  excluded from the evidence it rests on.
- Authors are **strongly encouraged to sign the hash of the final PDF with a
  Bitcoin key**. Optional; decide at acceptance.

## What to expect

Target time to a first decision is 10–12 weeks per round, with no limit on rounds.
The modal path in the journal's published transcripts is one round of review and
one revision; two rounds are common. A split between one enthusiastic and one
hostile reviewer is the norm for applied papers, and papers that reviewers rated
"Bottom 50%", answered "No" on novelty, or recommended rejecting have been
published after revision. Answer everything point by point, and where you decline
a demand, decline it with a stated reason — that has been accepted repeatedly in
this journal's record.
