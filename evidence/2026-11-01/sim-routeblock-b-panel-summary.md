# sim-routeblock-b — combined balance panel (§15) summary

Invocation (single combined campaign, both policies, same seeds/days —
the instrument shape the multisweep lesson requires, since
single-policy panels can never match a new-policy arm):

```
node scripts/balance-panel.js --out ./sim-routeblock-panel-tmp \
  --policies competent,competent-routeblock-b \
  --seeds 52001,52002,52003,52004,52005,52006,52007,52008 \
  --days 30 --par 4
```

Note: the first panel run wrote to /tmp and /tmp was wiped mid-run
(panel artifact lost); the run was repeated with --out under the
worktree, and this summary describes the repeated run (16 cases,
0 cached jobs). Raw panel retained as
evidence/2026-11-01/sim-routeblock-b-panel.json.gz (16 rows).
Validity: sourcesStable true, neutrality matched on both
policies (proof seed 52001, observer on/off identical), zero
warnings, zero exclusions.

| | competent | competent-routeblock-b |
|---|---|---|
| cases | 8 | 8 |
| endReason survived | 8 | 8 |
| won | 0 | 0 |
| national | 0 | 0 |
| table (entered) | 0 | 0 |
| maxRank | village | village |
| maxArc | 3 | 3 |
| waveReach | 1–2 | 1–2 |
| vests | 0–1 | 0–1 |

Panel numbers are CONTEXT, never verdict (patchrot precedent): the
panel runs its own substrate (not the driver's DEPOSITGATE=0 judged
path) and its survival/death definitions differ from the driver's
judged cost bar. No wall movement is shown or claimed: in a 30-day
pre-seat window national / table / wins are not reachable, and none
is reached on either arm. The two panel columns are identical,
consistent with the driver's finding that the gates barely engage
in this window.
