#!/usr/bin/env python3
"""Generate cost simulation figure for AnimatorSBT paper."""

import matplotlib.pyplot as plt
import matplotlib.ticker as ticker
import numpy as np

# ---------- style ----------
plt.style.use('seaborn-v0_8-whitegrid')
plt.rcParams.update({
    'font.family': 'serif',
    'font.size': 8,
    'axes.labelsize': 9,
    'axes.titlesize': 10,
    'xtick.labelsize': 7.5,
    'ytick.labelsize': 7.5,
    'legend.fontsize': 7.5,
    'figure.dpi': 300,
})

# ---------- data ----------
scenarios = ['Pilot\n(50)', 'Early\n(500)', 'Moderate\n(1,300)', 'Full Low\n(2,601)', 'Full High\n(3,828)']
annual_cost = [0.49, 244, 252, 263, 274]
n_animators = [50, 500, 1300, 2601, 3828]
cost_per_animator = [0.010, 0.489, 0.194, 0.101, 0.072]

# gradient: light blue -> dark blue
colors = ['#a6cee3', '#6baed6', '#3182bd', '#1f6fbd', '#08519c']

# ---------- figure ----------
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 4))

# --- Left: bar chart ---
bars = ax1.bar(scenarios, annual_cost, color=colors, edgecolor='white', linewidth=0.5, width=0.6)

# value labels
for bar, val in zip(bars, annual_cost):
    label = f'${val:.2f}' if val < 1 else f'${val:,.0f}'
    ax1.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 6,
             label, ha='center', va='bottom', fontsize=7.5, fontweight='bold')

ax1.set_ylabel('Annual Cost (USD)')
ax1.set_title('(a) Annual Cost by Scenario', fontweight='bold')
ax1.tick_params(axis='x', rotation=25)
ax1.set_ylim(0, max(annual_cost) * 1.18)
ax1.yaxis.set_major_formatter(ticker.FuncFormatter(lambda x, _: f'${x:,.0f}'))

# --- Right: line chart ---
ax2.plot(n_animators, cost_per_animator, marker='o', color='#08519c',
         linewidth=1.8, markersize=6, markerfacecolor='#3182bd',
         markeredgecolor='#08519c', markeredgewidth=1.2, zorder=3)

# data-point labels
offsets = [(15, 0.015), (15, 0.025), (15, 0.015), (15, 0.012), (-350, 0.015)]
for i, (x, y) in enumerate(zip(n_animators, cost_per_animator)):
    label = f'${y:.3f}'
    dx, dy = offsets[i]
    ax2.annotate(label, (x, y), textcoords='data', xytext=(x + dx, y + dy),
                 fontsize=7, color='#333333')

# horizontal reference line
ax2.axhline(y=0.10, color='#e31a1c', linestyle='--', linewidth=1, alpha=0.7)
ax2.text(2800, 0.115, '< 1 min of work\nat median wage',
         fontsize=7, color='#e31a1c', ha='center', style='italic')

ax2.set_xlabel('Number of Animators')
ax2.set_ylabel('Cost per Animator (USD/year)')
ax2.set_title('(b) Cost per Animator vs Scale', fontweight='bold')
ax2.set_xlim(-100, 4200)
ax2.set_ylim(-0.02, 0.56)
ax2.yaxis.set_major_formatter(ticker.FuncFormatter(lambda x, _: f'${x:.2f}'))

# ---------- save ----------
fig.tight_layout(w_pad=3)
out = '/Users/taka/animator-sbt-paper/paper/figures/cost_simulation.pdf'
fig.savefig(out, format='pdf', bbox_inches='tight', dpi=300)
print(f'Saved -> {out}')
plt.close(fig)
