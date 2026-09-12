# Cover Letter

Takato Oki
TOONIQ LLC, Tokyo
oki@tooniq.co.jp
2026-09-12

To the Editors of *Ledger*:

Please consider our manuscript, "Soulbound Tokens for Anime Production: A
Blockchain-Based Contribution Certification Framework for Freelance
Animators" (framework name: AnimatorSBT), for publication in *Ledger*.

**The problem and its prevalence.** Project-based production splits work
across many hands, and credit fails wherever no body holds jurisdiction
over who gets named. In game development, a 2023 IGDA survey found that
51.3% of respondents (299 of 582) rarely or never receive official credit,
and 83.1% did not know whether their employer had a credit policy at all;
a study of 100 games released 2016-2020 found the omissions systematic
rather than accidental (Švelch, 2022). In film visual effects — inside the
same unionized industry as screenwriting but outside its jurisdiction —
Double Negative credited 277 of the roughly 600 people who worked on
*Fantastic Beasts*, and 27 of more than 160 on *Oppenheimer*. In scholarly
publishing, the ICMJE states it has no authority to enforce its own
authorship criteria and that adjudicating disputes is "not the role of
journal editors"; a 2018 review of the literature found "no generally
recognized avenues for authors to seek help." Where jurisdiction
exists — the WGA's exclusive authority over screen credit, backed by an
agreement binding employers to its arbitration — attribution is reliable,
but that combination is rare, and the WGA itself later added a second,
non-adjudicated credit because arbitration concentrates recognition on a
few names. Japanese animation has none of the three: 47.3% of animation
creators were self-employed or freelance in 2023, no body holds craft
jurisdiction over crediting, and the government's own model contract for
freelance animators has the animator waive the moral right to be named and
leaves crediting to the studio's discretion. This paper specifies and
measures a certification framework there; animation is where the
mechanism is built and evaluated, not what the paper is about.

**Novel contribution.** The contribution is not the credential mechanism —
a third-party-attested, non-transferable, holder-owned record is a mature
primitive — but an analysis of where such an attestation can originate
when no jurisdictional body exists to vouch for it, anchoring it to an
order a studio has already accepted and paid for rather than to a
self-report, so co-signing records an attestation that already occurred
instead of manufacturing one; and a measured cost structure showing
on-chain issuance is negligible (about a tenth of a cent per certificate)
while the real, recurring cost is a flat off-chain metadata-pinning
subscription that reintroduces dependence on a single operator.

**Scope.** The problem is not specific to animation. The same structure —
multi-party subcontracted production with no jurisdictional adjudicator —
recurs in game credits, visual effects, and academic collaboration at the
rates above, and the approach here, deriving an attestation from an
already-occurring commercial event rather than self-report or standing
arbitration, is not particular to any one of them.

**Status.** The v1 contract is deployed on the Polygon Amoy testnet only.
The co-signing authenticity layer (v2) is implemented and tested (60
tests) but has not been operated with an independent studio attester, so
the issuer currently also holds the attester role. No certificates have
been issued from production data; these are open problems, not solved
ones.

**Disclosure.** I am the founder of TOONIQ LLC, which builds
production-management software for this industry; the framework is
designed for integration with it. The paper reports gas costs and design
tradeoffs, not a commercial outcome.

**Suggested reviewers.**

- Macià Mut-Puigserver, Universitat de les Illes Balears, Palma, Spain
  (macia.mut@uib.cat) — corresponding author, soulbound-token digital
  credentials system with Solidity implementation and cost/security
  analysis, *Annals of Telecommunications* 79:843-855 (2024).
- Andrea Pinna, University of Cagliari, Dept. of Mathematics and
  Information Technology (pinna.andrea@unica.it) — first author of an SBT
  case study in the health sector, *ACM Distributed Ledger Technologies:
  Research and Practice*; works on blockchain-oriented software
  engineering.
- Nikhil Malik, USC Marshall School of Business (maliknik@marshall.usc.edu)
  — first author, "Blockchain technology for creative industries,"
  *International Journal of Research in Marketing* 40(1):38-48 (2023).

Sincerely,
Takato Oki

I am not institutionally supported with funding earmarked for open-access
publication and request the full fee waiver *Ledger* offers on that basis.
