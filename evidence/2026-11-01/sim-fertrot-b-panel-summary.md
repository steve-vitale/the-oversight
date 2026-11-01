# sim-fertrot-b — combined balance panel (§15) summary

Invocation (single combined campaign, both policies, same seeds/days —
the instrument shape the multisweep lesson requires, since
single-policy panels can never match a new-policy arm):

```
node scripts/balance-panel.js --out /tmp/fertrot-panel-b \
  --policies competent,competent-fertrot-b \
  --seeds 60101,60102,60103,60104,60105,60106,60107,60108 \
  --days 30 --par 4
```

Raw panel retained as evidence/2026-11-01/sim-fertrot-b-panel.json.gz
(16 cases). Validity: sourcesStable true, neutrality matched on both
policies (proof seed 60101, observer on/off identical), zero warnings,
zero exclusions.

| | competent | competent-fertrot-b |
|---|---|---|
| cases | 8 | 8 |
| endReason survived | 8 | 8 |
| won | 0 | 0 |
| national | 0 | 0 |
| table (entered) | 0 | 0 |
| maxRank | village | village |
| maxArc | 3 | 3 |
| waveReach | 1–2 | 1–2 |
| vests | 0 | 0 |

Panel numbers are CONTEXT, never verdict (patchrot / routeblock
precedent): the panel runs its own substrate (not the driver's
DEPOSITGATE=0 judged path) and its survival/death definitions differ
from the driver's judged cost bar. No wall movement is shown or
claimed: in a 30-day pre-seat window national / table / wins are not
reachable, and none is reached on either arm.

Panel acquisition note (loud): the panel run was blocked by the
container EPERM write flap for ~15 minutes — 5 + 1 + 8 + 1 failed
attempts (worker writeFileSync denied on case tmp files; on several
attempts even the error text failed to write, leaving 0-byte logs
and orphaned .json.tmp case files) — before retry 2 of the final
loop sailed through with 16 cases, 0 cached jobs. No panel content
was fabricated and no shared tooling was edited to work around the
flap; the run above is the complete successful invocation.
