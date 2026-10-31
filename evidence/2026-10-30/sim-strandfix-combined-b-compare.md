# sim-strandfix-combined-b — paired compare (NOT an official panel run)

Paired comparison on identical seeds (bank of 10, DAYS=30,
substrate POLICY=nighttravel, COMPETENT_FEAST=0, SEATDRIVE=0,
PLENTYDEPRI=0, DEPOSITGATE=1, WOODCARRY=1). The official
panel driver cannot express the strand stack (strandfix
policy legs + woodwarm restraint + raw-gate evening classes
on a single-seed strand), so this is a paired compare
attached to sim-strandfix-combined-b.md — never presented
as an official panel run (same standing as
fedexile/tickbudget).

## Strand seed 15215, per-evening pairing (control = OFF-ON)

Control strand: nights 7-16 (10 still evenings).
Classes use raw gates (wood >= 4, kcal >= 60, ticks >= 96).

### FULL-ON (protection + morning) vs control

| night | control class | FULL evening | verdict |
|-------|---------------|--------------|---------|
| 7 | ticks-only | still, ticks-only | still |
| 8 | kcal-only | still, kcal-only | still |
| 9 | kcal-only | still, kcal-only | still |
| 10 | wood-only | BRIDGE (wood 4, kcal 180, ticks 110) | single-converted |
| 11 | both | (variant home) | prevented-early-rescue |
| 12 | both | (variant home) | prevented-early-rescue |
| 13 | both | (variant home) | prevented-early-rescue |
| 14 | wood-only | (variant home) | prevented-early-rescue |
| 15 | both | (variant home) | prevented-early-rescue |
| 16 | both | (variant home) | prevented-early-rescue |

Strand nights: 10 -> 3 (fall 7). Both converted: 0.
FULL-ON == PROT-ON on every per-seed count and every
15215 evening gate (morning component contributes 0 ticks
on FULL strand mornings).

### PROT-ON (protection only) vs control

Identical table to FULL-ON (same bridge night 10, same
gates, warmth acted 0 vs control 6 acted / 4 logs spent).
Live R1 reproduces warmfuel's counterfactual prediction
exactly (3 still nights, bridge night 10).

### MORN-ON (morning only) vs control

| night | control class | MORN evening | verdict |
|-------|---------------|--------------|---------|
| 7 | ticks-only | still, ticks-only | still |
| 8 | kcal-only | still, kcal-only | still |
| 9 | kcal-only | still, kcal-only | still |
| 10 | wood-only | still, wood-only (kcal 586) | still |
| 11 | both | still, both (kcal 30) | still |
| 12 | both | still, wood-only (kcal 1036) | still |
| 13 | both | still, wood-only (kcal 210) | still |
| 14 | wood-only | still, wood-only (kcal 886) | still |
| 15 | both | still, wood-only (kcal 120) | still |
| 16 | both | still, wood+kcal+ticks (kcal 0, ticks 95) | still |
| 17-27 | (control home) | still, wood-only (kcal ~2100-2388) | extension (no control evening) |

Strand nights: 10 -> 21 (extension +11). Both converted: 0.
Presses fix kcal on days 10/12/14 (and day 13's wood-only
shape follows from the day-12 press trajectory); wood
never moves (every fell refused: no axe). Bearer death:
control day 17 -> MORN day 28 (+11, same cause "the wild").

### FULL-GUARD vs OFF-GUARD

Identical: strand nights 7-9 both legs, day-10 rescue both
legs (wood 4, kcal 180, ticks 110). Guard fall: 0.

## Non-strand seeds

All 9 non-stranding seeds are identical per-seed on
creek/still/rescued and wave reach across OFF, FULL, PROT,
and MORN legs (the prototype acts only on stranded field
mornings, and only 15215 strands). The only per-seed
movement anywhere is 15215 (above) plus 15215's wave reach
on MORN (1 -> 2).

## Wall numbers (structural, 30d pre-seat substrate)

National 0/10, table 0/10, wins 0/10 on all legs; median
survival 30 days (ceiling); wave reach wave >= 1: 10/10,
wave >= 2: 8/10 (9/10 MORN), wave 3: 1/10, waves 4-5: 0/10.

## Paired verdict

GO requires strand fall >= 4 AND >= 1 both-evening
converted same-day. Fall holds (10 -> 3 on FULL-ON);
both-conversion fails (0; prevention is not conversion).
Paired verdict: NO-GO (prevention, not conversion).
