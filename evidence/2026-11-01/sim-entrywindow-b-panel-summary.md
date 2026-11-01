# sim-entrywindow-b — combined balance panel (§15) summary

Invocation (single combined campaign, both policies, same seeds/days —
the instrument shape the multisweep lesson requires, since
single-policy panels can never match a new-policy arm):

```
node scripts/balance-panel.js --out /tmp/entrywindow-panel-b \
  --policies competent,competent-entrywindow-b \
  --seeds 60121,60122,60123,60124,60125,60126,60127,60128 \
  --days 30 --par 4
```

Raw panel retained as evidence/2026-11-01/sim-entrywindow-b-panel.json.gz
(16 cases, 0 reused). Validity: sourcesStable true, neutrality matched
on both policies (proof seed 60121, observer on/off identical), zero
warnings.

| | competent | competent-entrywindow-b |
|---|---|---|
| cases | 8 | 8 |
| endReason survived | 8 | 8 |
| won | 0 | 0 |
| national | 0 | 0 |
| table (entered) | 0 | 0 |
| maxRank | village | village |
| maxArc | 3 | 3 |
| waveReach | 1–2 (4× wave 1, 4× wave 2) | 1–2 (2× wave 1, 6× wave 2) |
| vests | 0 | 0 |

Panel numbers are CONTEXT, never verdict (fertrot precedent): the panel
runs its own substrate (not the driver's DEPOSITGATE=0 judged path) and
its survival/death definitions differ from the driver's judged cost bar.
No wall movement is shown or claimed: in a 30-day pre-seat window
national / table / wins are not reachable, and none is reached on either
arm. The waveReach tilt (6× wave 2 armed vs 4× baseline) is a
context-only observation on 16 cases, not a reachability claim.
