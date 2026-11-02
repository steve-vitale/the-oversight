# sim-gardenpool-b — combined balance panel (§15) summary

Invocation (single combined campaign, both policies, same seeds/days):

```
node scripts/balance-panel.js --out /tmp/gardenpool-panel-b \
  --policies competent,competent-entrywindow-b \
  --seeds 74001,74002,74003,74004,74005,74006,74007,74008 \
  --days 30 --par 4
```

Run on the ARMED (gardenpool) working tree: HEAD at panel time was
e468cec17 (the prereg commit) with the gardenpool game change
present but uncommitted. The panel compares POLICIES, not code
variants, so it cannot judge this game-code arm — it is context
for the rotation-ON regime under garden pooling.

Raw panel retained as
evidence/2026-11-01/sim-gardenpool-b-panel.json.gz
(16 cases, 0 reused). Validity: sourcesStable true,
neutrality matched on both policies (proof seed 74001,
observer on/off identical), zero warnings, zero observer
errors.

| | competent | competent-entrywindow-b |
|---|---|---|
| cases | 8 | 8 |
| endReason survived | 8 | 8 |
| won | 0 | 0 |
| national | 0 | 0 |
| table (entered) | 0 | 0 |
| maxRank | village | village |
| maxArc | 3 | 3 |
| waveReach | 2 (8x wave 2) | 1–2 (1x wave 1, 7x wave 2) |
| vests | 0 | 0 |

Panel numbers are CONTEXT, never verdict (pilot precedent): the
panel runs its own substrate and its survival/death definitions
differ from the driver's judged bars. The two policies are
near-identical on this band under garden pooling. No wall
movement is shown or claimed: in a 30-day pre-seat window
national / table / wins are not reachable, and none is
reached on either policy.
