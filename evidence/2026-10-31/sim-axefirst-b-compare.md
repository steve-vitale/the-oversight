# sim-axefirst-b — guard-vs-ON comparison (standalone analyzer, NOT a panel result)

Census: evidence/2026-10-31/sim-axefirst-b-census.json (40 legs:
pilot 16 + confirm 24). Guard leg = WOODWARM=0, ON leg = WOODWARM=1,
identical seeds, same warmed(woodcarry(nighttravel)) stack, 30 days.
This file is produced by scripts/analyze-axefirst-b.js (pure reads
over the recorder corpora). It is NOT a balance-panel comparison:
the panel refused the recorder rows (see the evidence file §6 for
the refusal verbatim), so no panel decision is claimed here.

## Per-seed guard-vs-ON (still evenings / strand mornings / first axe / wave)

| seed | guard still | ON still | guard strand | ON strand | first axe (guard) | first axe (ON) | source | wave guard/ON |
|------|-------------|----------|--------------|-----------|-------------------|----------------|--------|---------------|
| 15215 | 7,8,9 | 7-16 | 3 | 9 | never | never | — | 1 / 1 |
| 15501 | — | — | 0 | 0 | never | never | — | 2 / 2 |
| 15502 | — | — | 0 | 0 | never | never | — | 2 / 2 |
| 15503 | — | — | 0 | 0 | never | never | — | 2 / 2 |
| 15504 | — | — | 0 | 0 | never | never | — | 2 / 2 |
| 15505 | — | — | 0 | 0 | eve 1 / morn 2 | eve 1 / morn 2 | stash fetch | 1 / 1 |
| 15506 | — | — | 0 | 0 | never | never | — | 2 / 2 |
| 15507 | — | — | 0 | 0 | never | never | — | 3 / 3 |
| 15508 | — | — | 0 | 0 | never | never | — | 2 / 2 |
| 15509 | — | — | 0 | 0 | eve 27 / morn 28 | eve 27 / morn 28 | corpse loot | 2 / 2 |
| 15510 | — | — | 0 | 0 | never | never | — | 2 / 2 |
| 15511 | — | — | 0 | 0 | never | never | — | 1 / 1 |
| 15512 | — | — | 0 | 0 | never | never | — | 2 / 2 |
| 15513 | — | — | 0 | 0 | never | never | — | 2 / 2 |
| 15514 | — | — | 0 | 0 | never | never | — | 2 / 2 |
| 15515 | — | — | 0 | 0 | never | never | — | 2 / 2 |
| 15516 | — | — | 0 | 0 | never | never | — | 2 / 2 |
| 15517 | — | — | 0 | 0 | never | never | — | 2 / 2 |
| 15518 | — | — | 0 | 0 | never | never | — | 2 / 2 |
| 15519 | — | — | 0 | 0 | never | never | — | 2 / 2 |

## What the comparison shows

- Warmth changes NOTHING about axe acquisition: on both axe seeds
  the first-axe day and source are identical on guard and ON legs
  (15505 day 1, 15509 day 27). Acquisition happens before any
  warmth divergence, or — for 15509 — on a road warmth never touches.
- Warmth changes the strand only on the seed that strands: 15215
  guard 3 strand mornings (all pack-ready) vs ON 9 (7 needs-wood),
  the known warmth-eats-bridge-logs shape, re-derived here.
- Every other seed agrees guard-vs-ON exactly (same still sets —
  none — same waves, same axe result). The guard/ON contrast is
  clean: no recorder noise, no warmth bleed into acquisition.
- Pairing (strand morning + axe-holder): 0 on guard, 0 on ON, 0
  overall. Fell-capable mornings: 0 on guard, 0 on ON, 0 overall.
