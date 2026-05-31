"""
AnimatorSBT Cost & Scale Simulation

Simulates annual operating costs for AnimatorSBT deployment
across the Japanese anime industry using public statistics
from JAniCA (2023) and NAFCA (2024).
"""

import json

# ===== Industry Parameters (from public surveys) =====

# JAniCA 2023: ~5,500 animation creators surveyed
# Freelance ratio: 47.3% (JAniCA 2023) to 69.6% (JAniCA 2019)
# We use a range for sensitivity analysis
TOTAL_ANIMATORS_ESTIMATE = 5_500  # JAniCA survey base
FREELANCE_RATIO_LOW = 0.473      # JAniCA 2023
FREELANCE_RATIO_HIGH = 0.696     # JAniCA 2019

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

# Gas costs measured ON-CHAIN on the Polygon Amoy testnet (authoritative; see paper Appendix A).
# Hardhat-simulated values differ for mint/mintBatch (135,505 and 1,039,581) and are
# reported alongside these in the paper's gas table; we use the on-chain values here.
GAS_DEPLOY = 1_824_117        # Amoy on-chain (matches Hardhat)
GAS_MINT_SINGLE = 189_792     # Amoy on-chain (Hardhat avg was 135,505)
GAS_MINT_BATCH_10 = 1_025_449 # Amoy on-chain (Hardhat was 1,039,581)
GAS_REVOKE = 50_027           # Amoy on-chain (matches Hardhat)

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
