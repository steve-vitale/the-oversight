# sim-entrywindow-confirm-b — combined balance panel (§15) summary

Invocation (single combined campaign, both policies, same seeds/days —
the instrument shape the multisweep lesson requires, since
single-policy panels can never match a new-policy arm):

```
node scripts/balance-panel.js --out /tmp/entrywindow-confirm-panel-b \
  --policies competent,competent-entrywindow-b \
  --seeds 60201,60202,60203,60204,60205,60206,60207,60208,60209,60210,60211,60212 \
  --days 30 --par 4
```

Raw panel retained as evidence/2026-11-01/sim-entrywindow-confirm-b-panel.json.gz
(24 cases, 0 reused). Validity: sourcesStable true, neutrality matched
on both policies (proof seed 60201, observer on/off identical), zero
warnings.

| | competent | competent-entrywindow-b |
|---|---|---|
| cases | 12 | 12 |
| endReason survived | 12 | 11 |
| won | 0 | 0 |
| national | 0 | 0 |
| table (entered) | 0 | 0 |
| maxRank | village | village |
| maxArc | 3 | 3 |
| waveReach | 1–3 (4× wave 1, 7× wave 2, 1× wave 3) | 1–2 (3× wave 1, 9× wave 2) |
| vests | 0 | 0 |

Panel numbers are CONTEXT, never verdict (pilot precedent): the panel
runs its own substrate and its survival/death definitions differ from
the driver's judged cost bar. The disagreement proves the point: the
panel's one armed non-survival is 60202 village-lost at gameDay 20,
while the judged driver has armed 60202 surviving all 30 days (and
baseline 60202 collapsing on the driver). Neither panel line changes
the confirm verdict, which rests on the driver per the prereg. No wall
movement is shown or claimed: in a 30-day pre-seat window national /
table / wins are not reachable, and none is reached on either arm.
