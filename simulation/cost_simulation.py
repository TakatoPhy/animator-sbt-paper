"""
AnimatorSBT Cost & Scale Simulation

Simulates annual operating costs for AnimatorSBT deployment
across the Japanese anime industry using public statistics
from JAniCA (2023) and NAFCA (2024).
"""

import json
import pathlib

# ===== Industry Parameters =====

# Workforce base. No authoritative headcount of Japanese animators is published:
# JAniCA's and NAFCA's surveys state no population estimate, and the JSIC
# animation-production code is not tabulated separately in the public census
# aggregates. 5,500 is the Association of Japanese Animations' own top-down estimate
# of the drawing roles (animation director 500, layout 500, key animation 1,000,
# in-between check 500, in-betweening 3,000) within its estimate of just under 20,000
# domestic animation creators, derived from end-credit counts and from the headcount
# needed to produce the year's released minutes per stage. It is an assumption here,
# not a measurement. See references.bib: aja2025creators.
#
# Share working outside employment, used as a range for sensitivity analysis. Each
# figure is the sum of JAniCA's two relevant response categories, freelance and
# self-employed: 26.0 + 11.0 = 37.0% in the 2026 wave (n=970, PDF p.33) and
# 30.8 + 16.5 = 47.3% in the 2023 wave (n=425, p.23). JAniCA's 2026 report states the
# two waves were conducted under different conditions, so this is a range across two
# measurements rather than a trend.
TOTAL_ANIMATORS_ESTIMATE = 5_500  # AJA top-down estimate, drawing roles
FREELANCE_RATIO_LOW = 0.370      # JAniCA 2026
FREELANCE_RATIO_HIGH = 0.473     # JAniCA 2023

# TDB 2025: ~300 anime production studios in Japan
NUM_STUDIOS = 300

# Average TV anime episodes per year: ~300 series * 12 eps = ~3,600
# Plus films, OVAs, etc. → estimate ~4,000 distinct productions/year
PRODUCTIONS_PER_YEAR = 4_000

# Average animators per production (key + in-between + coloring)
# Conservative estimate based on typical TV anime episode
AVG_ANIMATORS_PER_PRODUCTION = 15

# Average SBTs per animator per year
# (multiple projects, each generating 1 SBT)
AVG_PROJECTS_PER_ANIMATOR_YEAR = 6

# ===== Cost Parameters (Polygon PoS, measured on Amoy testnet) =====

GAS_PRICE_GWEI = 30
MATIC_PRICE_USD = 0.22  # POL price March 2026

# Gas is read from the measurement file that scripts/measure_gas_local.js writes by
# executing the contracts, so this script and paper/figures/cost_simulation.py cannot
# disagree. Nothing below is hard-coded; earlier versions of this file carried their own
# constants and drifted, because mint gas is dominated by the length of the tokenURI and
# the earlier figures were taken against a short placeholder rather than a real CID.
_GAS = json.loads(
    (pathlib.Path(__file__).resolve().parent / "gas_measurements.json").read_text()
)
GAS_DEPLOY = _GAS["deployment_gas"]["AnimatorSBT"]
GAS_MINT_SINGLE = _GAS["operation_gas"]["mint (new holder, steady state)"]
GAS_MINT_BATCH_10 = _GAS["operation_gas"]["mintBatch(10)"]
GAS_REVOKE = _GAS["operation_gas"]["revoke"]

# IPFS pinning (Pinata free tier: 500 files, paid: $20/mo for 50GB)
IPFS_COST_PER_FILE_USD = 0.0  # Free tier covers small JSON files
IPFS_MONTHLY_PAID_USD = 20.0

def gwei_to_matic(gas: int, gas_price: int = GAS_PRICE_GWEI) -> float:
    return gas * gas_price / 1e9

def matic_to_usd(matic: float, price: float = MATIC_PRICE_USD) -> float:
    return matic * price

def gas_to_usd(gas: int) -> float:
    return matic_to_usd(gwei_to_matic(gas))

# ===== Simulation =====

def simulate_scenario(
    name: str,
    num_animators: int,
    sbt_per_animator_year: int,
    use_batch: bool = True,
    batch_size: int = 10
) -> dict:
    """Simulate annual costs for a given adoption scenario."""

    total_sbts_year = num_animators * sbt_per_animator_year

    # Minting cost
    if use_batch:
        num_batches = total_sbts_year // batch_size
        remainder = total_sbts_year % batch_size
        gas_total_mint = (
            num_batches * GAS_MINT_BATCH_10 +
            remainder * GAS_MINT_SINGLE
        )
        cost_per_sbt = gas_to_usd(GAS_MINT_BATCH_10) / batch_size
    else:
        gas_total_mint = total_sbts_year * GAS_MINT_SINGLE
        cost_per_sbt = gas_to_usd(GAS_MINT_SINGLE)

    mint_cost_usd = gas_to_usd(gas_total_mint)

    # Deployment cost (one-time, amortized over first year)
    deploy_cost_usd = gas_to_usd(GAS_DEPLOY)

    # IPFS cost
    if total_sbts_year <= 500:
        ipfs_cost_year = 0.0  # Free tier
    else:
        ipfs_cost_year = IPFS_MONTHLY_PAID_USD * 12  # $240/year

    # Revocation estimate (1% of SBTs revoked)
    revoke_count = int(total_sbts_year * 0.01)
    revoke_cost_usd = gas_to_usd(revoke_count * GAS_REVOKE)

    total_annual_usd = deploy_cost_usd + mint_cost_usd + ipfs_cost_year + revoke_cost_usd

    return {
        "scenario": name,
        "num_animators": num_animators,
        "sbt_per_animator_year": sbt_per_animator_year,
        "total_sbts_year": total_sbts_year,
        "cost_per_sbt_usd": round(cost_per_sbt, 4),
        "mint_cost_usd": round(mint_cost_usd, 2),
        "deploy_cost_usd": round(deploy_cost_usd, 4),
        "ipfs_cost_year_usd": round(ipfs_cost_year, 2),
        "revoke_cost_usd": round(revoke_cost_usd, 4),
        "total_annual_usd": round(total_annual_usd, 2),
        "cost_per_animator_year_usd": round(total_annual_usd / num_animators, 4),
    }


def main():
    scenarios = [
        # Scenario 1: Pilot (single studio, ~50 freelancers)
        simulate_scenario("Pilot (1 studio)", 50, 6),

        # Scenario 2: Early adoption (10 studios, ~500 freelancers)
        simulate_scenario("Early Adoption (10 studios)", 500, 6),

        # Scenario 3: Moderate adoption (50% of freelancers)
        simulate_scenario(
            "Moderate (50% freelancers)",
            int(TOTAL_ANIMATORS_ESTIMATE * FREELANCE_RATIO_LOW * 0.5),
            AVG_PROJECTS_PER_ANIMATOR_YEAR
        ),

        # Scenario 4: Full adoption (all freelancers, low estimate)
        simulate_scenario(
            "Full (all freelancers, low est.)",
            int(TOTAL_ANIMATORS_ESTIMATE * FREELANCE_RATIO_LOW),
            AVG_PROJECTS_PER_ANIMATOR_YEAR
        ),

        # Scenario 5: Full adoption (all freelancers, high estimate)
        simulate_scenario(
            "Full (all freelancers, high est.)",
            int(TOTAL_ANIMATORS_ESTIMATE * FREELANCE_RATIO_HIGH),
            AVG_PROJECTS_PER_ANIMATOR_YEAR
        ),
    ]

    # Print results
    print("=" * 80)
    print("AnimatorSBT Cost Simulation Results")
    print("=" * 80)
    print(f"Gas price: {GAS_PRICE_GWEI} gwei | MATIC price: ${MATIC_PRICE_USD}")
    print(f"Mint gas (single): {GAS_MINT_SINGLE:,} | Mint gas (batch 10): {GAS_MINT_BATCH_10:,}")
    print("=" * 80)

    for s in scenarios:
        print(f"\n--- {s['scenario']} ---")
        print(f"  Animators:          {s['num_animators']:,}")
        print(f"  SBTs/year:          {s['total_sbts_year']:,}")
        print(f"  Cost per SBT:       ${s['cost_per_sbt_usd']:.4f}")
        print(f"  Annual mint cost:   ${s['mint_cost_usd']:.2f}")
        print(f"  IPFS cost/year:     ${s['ipfs_cost_year_usd']:.2f}")
        print(f"  Total annual cost:  ${s['total_annual_usd']:.2f}")
        print(f"  Cost per animator:  ${s['cost_per_animator_year_usd']:.4f}/year")

    # Save to JSON for LaTeX table generation
    output_path = "cost_simulation_results.json"
    with open(output_path, "w") as f:
        json.dump(scenarios, f, indent=2)
    print(f"\nResults saved to {output_path}")

    # Comparison with industry revenue
    print("\n" + "=" * 80)
    print("Context: Industry Revenue Comparison")
    print("=" * 80)
    industry_revenue_jpy = 362_100_000_000  # TDB 2025: ¥362.1B
    industry_revenue_usd = industry_revenue_jpy / 150  # ~$2.4B
    full_adoption_cost = scenarios[-1]["total_annual_usd"]
    ratio = full_adoption_cost / industry_revenue_usd * 100
    print(f"  Industry revenue (2024): ¥{industry_revenue_jpy/1e9:.1f}B (~${industry_revenue_usd/1e9:.2f}B)")
    print(f"  Full adoption cost:      ${full_adoption_cost:.2f}")
    print(f"  Ratio:                   {ratio:.6f}% of industry revenue")


if __name__ == "__main__":
    main()
