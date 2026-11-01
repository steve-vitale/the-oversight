# sim-offergeo-b — compare (matched seed-day tables, NOT a panel comparison)

Run: oversight-flesh-out-loop-b, arm sim-offergeo-b, run
fleshout-loop-b-20261101T0630Z, axis food-economy.
§15 panel note (stated explicitly, not silently skipped):
no lever change is panelled here — like the eveningstep
arm, the deliverable is matched seed-day tables across
policies on identical seeds through the new offergeo
analyzer. scripts/balance-panel.js cannot express the
nighttravel+woodcarry+woodwarm stack, per-evening offer
geometry, departure tiles, or entry-failure cohorts, and
it cannot run creekseek-stack (not in the registry). No
panel result is fabricated; the panel tool was not invoked.

## Corpora (all 30d, death-aware horizon)

- COMMITTED (awayeve, base 6409c1312): 24 seeds
  17543-17566, P1 (nighttravel-stack) + creekseek-stack,
  1,428 evenings. Reused verbatim.
- NEWBASE-1 (this base, this arm): 48 seeds 17567-17614,
  P1 + creekseek, 2,878 evenings. Labeled new-base, never
  presented as reproductions of the awayeve legs (a base
  move re-rolls the shared RNG stream).
- NEWBASE-2 (this base, this arm): 48 seeds 17615-17662,
  P1 + creekseek, 2,872 evenings. Same labeling.
- POOLED: 120 seeds x 2 stacks, 7,178 evenings, 286
  offer-evaluated evenings, 0 surprises, 0
  haven-coordinate violations on every block.

## Offer-by-distance table, by block (n = evaluated / offered)

| block | Band A d<=3 | Band B d=4-5 | Band C d>=6 | total |
|---|---|---|---|---|
| committed P1 | 2 / 2 | 24 / 0 | 6 / 0 | 32 / 2 |
| committed CS | 2 / 2 | 24 / 0 | 10 / 0 | 36 / 2 |
| committed pooled | 4 / 4 | 48 / 0 | 16 / 0 | 68 / 4 |
| newbase-1 P1 | 15 / 15 | 9 / 0 | 3 / 0 | 27 / 15 |
| newbase-1 CS | 2 / 2 | 13 / 0 | 22 / 0 | 37 / 2 |
| newbase-1 pooled | 17 / 17 | 22 / 0 | 25 / 0 | 64 / 17 |
| newbase-2 P1 | 15 / 15 | 56 / 0 | 8 / 0 | 79 / 15 |
| newbase-2 CS | 11 / 11 | 56 / 0 | 8 / 0 | 75 / 11 |
| newbase-2 pooled | 26 / 26 | 112 / 0 | 16 / 0 | 154 / 26 |
| POOLED P1 | 32 / 32 | 89 / 0 | 17 / 0 | 138 / 32 |
| POOLED CS | 15 / 15 | 93 / 0 | 40 / 0 | 148 / 15 |
| POOLED | 47 / 47 | 182 / 0 | 57 / 0 | 286 / 47 |

Read: the cliff is identical on every block and both
stacks — offered iff d <= 3, never otherwise. The
committed block alone left Bands A (4) and C (16) below
n = 20; the two new-base blocks closed both (A: 4 ->
47, C: 16 -> 57). P1 offers more often than creekseek
(32 vs 15 pooled) because the creek visit moves the
departure tile before the step — a contrast, not a
mechanism proof (the visit's tile is usually farther
from haven or on a different tile than the post-daily
position).

## Offered-evening kinds, pooled

| kind | pooled | committed | newbase-1 | newbase-2 |
|---|---|---|---|---|
| hop-refused (offered, blocked) | 39 | 2 | 13 | 24 |
| hop-yes-entry-yes | 6 | 0 | 3 | 3 |
| hop-yes-entry-no | 2 | 2 | 0 | 0 |
| offer-no (not offered) | 239 | 64 | 47 | 128 |

Eveningstep's committed-corpus zero (hop-yes-entry-yes
= 0) is superseded on new-base legs: hops DO enter
successfully (6 rows, 4 events: 17576 d16 both stacks,
17576 d24 P1, 17650 d19 both stacks, 17629 d25 CS).
The 17563 day-5 hop-entry failure remains the ONLY
hop-entry failure in 7,178 evenings.

## Refusal blockages (woodcarry classification, all blocks)

fallen_tree intermediate 27, washed_out intermediate 8,
creek intermediate 4 (total 39 = all hop-refused rows).
Every refusal is an INTERMEDIATE block: the hop's path
bounding box, never the destination tile. Route-around
paths exist in the records (17567: 5-step and 4-step
routes around the (4,3) fallen tree) but the step does
not walk them — the detour gate is OFF, by design.

## Entry-failure cohorts, by block

| block | cohort A fail rows | cohort A success rows | cohort H hop-entry-no | cohort H hop-entry-yes |
|---|---|---|---|---|
| committed | 2 | 1,356 | 2 | 0 |
| newbase-1 | 2 | 2,805 | 0 | 3 |
| newbase-2 | 4 | 2,703 | 0 | 3 |
| POOLED | 8 | 6,864 | 2 | 6 |

Cohort A fail events (rows come in same-seed-day
pairs, one per stack): 17563 d5 walk-no-path (hop),
17569 d25 walk-interrupted-combat, 17625 d20
walk-interrupted-combat, 17626 d27
walk-interrupted-combat. Cohort A fail rows by
outcome: walk-no-path 2, walk-interrupted-combat 6,
no-go-inside-button 0, entry-refused 0.

## Entry-failure cost, pooled (next-morning measures)

| measure | fail (n=8) | success (n=6,864; with next morning 6,631) |
|---|---|---|
| haven-evening rate | 8/8 = 100% (definitional: entry only attempted on haven tile) | — |
| still at haven next morning | 8/8 = 100% | 100% |
| inside next morning | 2/8 = 25% | 99.5% |
| vessel same next morning | 6/8 = 75% | 98.9% |
| next evening haven | 6/8 = 75% | 99.1% |
| next evening inCombat | 0/8 = 0% | 0.5% |
| mean overnight kcal delta | +130 | +140 |

The kcal means match, but the fail distribution is
bimodal (+1190 x2, +200 x2, -1117 x2, +246 x2) and is
explained by evening kcal, not entry: entry-success
rows by evening kcal show mean overnight delta +2083
(51-200 kcal, n=2), +1815 (201-500, n=2), +1258
(501-1200, n=240), +97 (1201-2400, n=6,387) — low-kcal
villagers gain the most overnight regardless of entry.
The cost that DOES separate fail from success is the
inside morning: 25% vs 99.5%.

## Cohort H cost (hop arrivals only)

| | hop-entry-no (17563 d5, 2 rows, 1 event) | hop-entry-yes (6 rows, 4 events) |
|---|---|---|
| evening kcal | 0, 0 | 140 - 2,352 |
| inside next morning | 0/2 | 6/6 |
| vessel same | 2/2 | 6/6 |
| next evening haven | 0/2 | 6/6 |

The single hop-entry failure costs the inside morning
and the next-evening stay; hop-entry successes wake
inside and stay haven the next evening, even at 140
evening kcal (17650 d19). Overnight kcal (+1190 on the
failure) is the starvation/dawn-feeding trace, not an
entry effect — see the kcal-band scan above.

## Excluded from the offer table (pooled, for audit)

entry-only haven evenings 6,858 (P1 3,434 + CS 3,424);
guard-combat evenings 28 (16 haven-tile, 12 away-tile;
guard fires before the offer check on both); entry-fail-
only haven evenings 6 (the walk-interrupted-combat
rows above — they ARE cohort A, but the step never
evaluated an offer for them, so they are not offer
rows); guard-tent 0; no-step / game-over evenings are
BARE/P3-only and carry no offer data. Counting any of
these as "offered" would be the pooled-share error
eveningstep warned against.
