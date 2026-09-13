#!/usr/bin/env python3
"""Cost figure for the paper, derived entirely from measured gas.

Reads simulation/gas_measurements.json, which scripts/measure_gas_local.js
writes by executing the contracts. No gas number is hard-coded here, so the
figure cannot drift away from the artifact it describes.

The fiat conversion is a snapshot and is labelled as one: gas is deterministic,
a token price is not.

    uv run --with matplotlib python paper/figures/cost_simulation.py
"""
import json
import pathlib

import matplotlib as mpl
import matplotlib.pyplot as plt

ROOT = pathlib.Path(__file__).resolve().parents[2]
GAS = json.loads((ROOT / "simulation" / "gas_measurements.json").read_text())

# --- Conversion assumptions, stated so the reader can redo them ------------
GAS_PRICE_GWEI = 30.0      # Polygon PoS priority fee used throughout
POL_USD = 0.22             # snapshot price
PRICE_DATE = "March 2026"

# --- Off-chain storage, from the pinning provider's published tiers --------
IPFS_FREE_FILES = 500      # free tier ceiling
IPFS_PAID_USD_MONTH = 20.0

CERTS_PER_ANIMATOR_YEAR = 6
REVOCATION_RATE = 0.01     # share of issued certificates later revoked

# Headcounts follow simulation/cost_simulation.py: a base of 5,500 animators in the
# drawing roles (AJA's top-down estimate) times the share working outside employment,
# which JAniCA's two most recent waves put at 37.0% (2026) and 47.3% (2023).
SCENARIOS = [
    ("Pilot\n(50)", 50),
    ("Early\n(500)", 500),
    ("Moderate\n(1,017)", 1017),
    ("Full, low\n(2,035)", 2035),
    ("Full, high\n(2,601)", 2601),
]

INK = "#1a1a1a"
ACCENT = "#8c1d18"
MUTE = "#b8b8b8"


def usd(gas: float) -> float:
    return gas * GAS_PRICE_GWEI * 1e-9 * POL_USD


def main() -> None:
    op = GAS["operation_gas"]
    per_cert = GAS["per_certificate_gas"]

    mint_gas = op["mint (new holder, steady state)"]
    batch10 = op["mintBatch(10)"]

    mpl.rcParams.update({
        "font.family": "serif",
        "font.serif": ["Times New Roman", "Nimbus Roman", "DejaVu Serif"],
        "font.size": 9,
        "axes.edgecolor": INK,
        "axes.labelcolor": INK,
        "text.color": INK,
        "xtick.color": INK,
        "ytick.color": INK,
        "axes.spines.top": False,
        "axes.spines.right": False,
    })

    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(7.2, 3.0))

    # ---- (a) where the money actually goes -------------------------------
    labels, onchain, offchain = [], [], []
    for label, n in SCENARIOS:
        certs = n * CERTS_PER_ANIMATOR_YEAR
        batches = certs / 10.0
        revocations = certs * REVOCATION_RATE
        chain = usd(batches * batch10 + revocations * op["revoke"])
        files = certs
        pin = 0.0 if files <= IPFS_FREE_FILES else IPFS_PAID_USD_MONTH * 12
        labels.append(label)
        onchain.append(chain)
        offchain.append(pin)

    x = range(len(labels))
    ax1.bar(x, offchain, color=MUTE, edgecolor=INK, linewidth=0.6,
            label="IPFS pinning (flat)")
    ax1.bar(x, onchain, bottom=offchain, color=ACCENT, edgecolor=INK,
            linewidth=0.6, label="On-chain minting")
    ax1.set_xticks(list(x))
    ax1.set_xticklabels(labels, fontsize=7)
    ax1.set_xlabel("Deployment scale (animators)", fontsize=8)
    ax1.set_ylabel("Annual operating cost (USD)")
    ax1.set_title("(a) The dominant cost is off-chain and flat", fontsize=9,
                  loc="left")
    ax1.legend(frameon=False, fontsize=7, loc="upper left")

    for i, (c, p) in enumerate(zip(onchain, offchain)):
        total = c + p
        note = f"${total:,.0f}" if total >= 1 else f"${total:.2f}"
        ax1.text(i, total + 8, note, ha="center", fontsize=7)
    ax1.annotate("below the free tier:\nno pinning charge",
                 xy=(0, 4), xytext=(0.25, 95), fontsize=6.5,
                 arrowprops=dict(arrowstyle="-", lw=0.6, color=INK))
    ax1.set_ylim(0, max(o + f for o, f in zip(onchain, offchain)) * 1.35)

    # ---- (b) what authenticity costs -------------------------------------
    bars = [
        ("Self-attested\n(single mint)", mint_gas, MUTE),
        ("Self-attested\n(batch of 10)",
         per_cert["self-attested, amortised in a batch of 10"], MUTE),
        ("Studio-attested\n(mint + co-sign)",
         per_cert["studio-attested (v2 mint + coSign)"], ACCENT),
    ]
    ax2.bar([b[0] for b in bars], [b[1] for b in bars],
            color=[b[2] for b in bars], edgecolor=INK, linewidth=0.6, width=0.6)
    ax2.set_ylabel("Gas per certificate")
    ax2.set_title("(b) Authenticity has a measurable price", fontsize=9,
                  loc="left")
    ax2.tick_params(axis="x", labelsize=7)
    for i, (_, g, _) in enumerate(bars):
        ax2.text(i, g * 1.02, f"{g:,}\n(${usd(g):.4f})", ha="center", fontsize=7)
    ax2.set_ylim(0, max(b[1] for b in bars) * 1.3)
    ax2.yaxis.set_major_formatter(
        mpl.ticker.FuncFormatter(lambda v, _: f"{int(v):,}"))

    fig.text(0.5, -0.03,
             f"Gas measured on the local EVM (solc "
             f"{GAS['environment']['solc_version']}, optimizer "
             f"{GAS['environment']['optimizer_runs']} runs). USD at "
             f"{GAS_PRICE_GWEI:.0f} gwei and ${POL_USD:.2f}/POL, {PRICE_DATE}.",
             ha="center", fontsize=6.5, color="#555555")

    fig.tight_layout()
    out = ROOT / "paper" / "figures" / "cost_simulation.pdf"
    fig.savefig(out, bbox_inches="tight")
    print(f"written: {out.relative_to(ROOT)}")

    # Machine-readable companion to the figure.
    rows = [
        {
            "scenario": label.replace("\n", " "),
            "animators": n,
            "certificates_per_year": n * CERTS_PER_ANIMATOR_YEAR,
            "onchain_usd_year": round(c, 4),
            "ipfs_usd_year": round(p, 2),
            "total_usd_year": round(c + p, 2),
            "usd_per_animator_year": round((c + p) / n, 4),
        }
        for (label, n), c, p in zip(SCENARIOS, onchain, offchain)
    ]
    dest = ROOT / "simulation" / "cost_model.json"
    dest.write_text(json.dumps(
        {
            "assumptions": {
                "gas_price_gwei": GAS_PRICE_GWEI,
                "pol_usd": POL_USD,
                "price_date": PRICE_DATE,
                "certificates_per_animator_year": CERTS_PER_ANIMATOR_YEAR,
                "ipfs_free_tier_files": IPFS_FREE_FILES,
                "ipfs_paid_usd_month": IPFS_PAID_USD_MONTH,
                "gas_source": "simulation/gas_measurements.json",
            },
            "scenarios": rows,
        }, indent=2) + "\n")
    print(f"written: {dest.relative_to(ROOT)}")
    for r in rows:
        print(f"  {r['scenario']:34s} ${r['total_usd_year']:>8,.2f}/yr  "
              f"(on-chain ${r['onchain_usd_year']:.2f})")


if __name__ == "__main__":
    main()
