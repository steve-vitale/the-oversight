# sim-healerbisect-b — midpoint #9 full-8 (`4e6fa44ab`, r112 specialist ladder)

**Arm:** sim-healerbisect-b (DIAG, zero src/js) · **Run:** fleshout-loop-b-20261108T0830Z · **Axis:** scale-onramp / winnability chain · **Tracker blank:** (3) · **Findings:** #1885 · **Branch:** sim-healerbisect-mid5-b (base master `e9399e09e`) · **Prereg:** `evidence/2026-11-08/sim-healerbisect-b-prereg.md` (+ Amendment A1) · **Instrument:** doorwalk driver, BASELINE leg only (TAKESEAT_B=1, DOORWALK_B off), 150d death-aware. This file completes the 0730Z run's screen (`sim-healerbisect-midpoint9-b.md`, subset only) with the four non-subset seeds, run in this window. Corpora: all 8 seeds committed under `evidence/2026-11-08/perseed-healerbisect-mid9full8-b/` (subset 4 copied from the committed mid9 corpora, non-subset 4 run here). Proof `scripts/test-healerbisect-b.js` **17/17 green**.

## Verdict: AMBIGUOUS on the full-8 bars — #9's screen HEALED does not survive the full band

Midpoint #9 `4e6fa44ab` (journey-establishment r112 Q1: specialist ladder — foodXp buys skill from 0, village work grants foodXp) screened **HEALED** on the subset (3/4 reach 150d, 0730Z run). On the full 8 it reads **AMBIGUOUS**: median **108.5d**, sits **4/8**. The sits bar passes (≥4/8) but the median bar fails (<120d). Per the prereg's flip bars, a commit counts as HEALED only if median ≥120d AND sits ≥4/8 — #9 meets one of the two. It is not the healer on the full band, and no landing is fingered yet.

## Per-seed table — midpoint #9 `4e6fa44ab`, full 8

| Seed | Days | End | Standing | maxWave | Seat | w4 kills | w5 kills | vs collapsed | vs healed |
|---|---|---|---|---|---|---|---|---|---|
| 53001 | 67 | village-lost | 199 | 4 | — | 2 | 0 | 88d → 67d (worse) | 105d → 67d (worse) |
| 53002 | 150 | survived | 199 | 4 | lesser d90 | 2 | 0 | 84d → 150d | 140d → 150d, sits |
| 53003 | 45 | village-lost | 84 | 3 | — | 0 | 0 | 68d → 45d (worse) | 65d → 45d (worse) |
| 53004 | 150 | survived | 199 | 4 | lesser d90 | 3 | 0 | 73d → 150d, exact healed match | exact (150/d90/199/3) |
| 53005 | 54 | village-lost | 199 | 4 | — | 1 | 0 | exact (54d) | 150d → 54d |
| 53006 | 150 | survived | 675 | 5 | lesser d90 | 11 | 8 | 66d → 150d | EXCEEDS healed (150/d90/199/3) |
| 53007 | 59 | village-lost | 134 | 4 | — | 0 | 0 | 63d → 59d | 50d → 59d |
| 53008 | 150 | survived | 199 | 4 | lesser d141 | 1 | 0 | 92d → 150d | 150d, late sit (healed d97, w4 3) |

0 instrument errors on all 8 seeds. Subset seeds (53004/53005/53006/53008) are the 0730Z run's corpora, copied verbatim; non-subset seeds (53001/53002/53003/53007) ran in this window (08:56–09:00Z, one invocation, ~200s). Full-8 median 108.5d, sits 4/8.

## Flip tables (analyzer)

Collapsed control → mid9 full-8: `A collapsed-control: n=8 median=70.5d sits=0/8 verdict=COLLAPSED; B mid9full8: n=8 median=108.5d sits=4/8 verdict=AMBIGUOUS; seeds with moved death day: 7/8; instrument errors A=0 B=0`. Moved: 53001 −21, 53002 +66, 53003 −23, 53004 +77, 53006 +84, 53007 −4, 53008 +58. Unmoved: 53005 only (54d, exactly collapsed).

Healed control → mid9 full-8: `A healed-control: n=8 median=145d sits=4/8 verdict=HEALTHY; B mid9full8: n=8 median=108.5d sits=4/8 verdict=AMBIGUOUS; seeds with moved death day: 5/8; instrument errors A=0 B=0`. 53004/53006/53008 match the healed endpoint on days and seat; 53001/53003 die earlier than both endpoints; 53005 dies exactly as collapsed while the healed endpoint sits it d99.

## What this means for the bisect

The staircase so far, full-8 medians: collapsed control 70.5d → #8 100d → #9 108.5d → healed control 145d. Sits: 0/8 → 2/8 → 4/8 → 4/8. The ladder (#9) supplies the sits; the median still climbs 36.5 days short of the healed endpoint. The remaining climb — 53001 from 67d to 105d, 53003 from 45d to 65d, 53005 from 54d to 150d, 53007 from 59d to 50d — must come from #10..#17. Two seeds (53001, 53003) die *earlier* at #9 than at the collapsed tip, which is the RNG-reshuffle signature of a conversation/food-system change, not a regression in the landing itself; the median is the judge, and it says #9 is a partial heal.

Per-seed healer map (screen + full-8, this run and the 0730Z run):
- 53004 heals at #8 (150d, lesser d90) and stays healed at #9.
- 53006 heals at #8 (150d, lesser d90, standing 620) and overshoots further at #9 (standing 675, 8 wave-5 kills).
- 53008 heals at #9 only (150d, lesser d141).
- 53002 heals at #9 only (150d, lesser d90) — it died at 50d at #8.
- 53001 survives at #8 (150d, no seat) but dies at 67d at #9 — the ladder's RNG reshuffle hurts this seed.
- 53003 lives longest at #8 (108d), dies earliest at #9 (45d).
- 53007 never heals; best is 63d (collapsed / #8), worst 50d (healed control).
- 53005 never heals anywhere in #1..#9; exactly collapsed at #5, #7, #8, and #9.

There is no single healer landing in #1..#9. The prereg's COMBINATION clause now governs: the minimal flipping set must be named and proven by construction (each member required — removing any one member un-flips it, confirmed on all 8). That proof belongs to a later run once the staircase's remaining steps in #10..#17 are mapped; this run does not attempt it.

## 53005 reading

53005 is exactly collapsed at every screened point (#5, #7, #8, #9): 54d, fallen list identical day-for-day at each one. Its healer, if any single landing heals it, sits in #10..#17, or the full heal is a combination. A verdict that rests only on the 3/4 screen would be incomplete for this seed — stated here, as at #9, so the adopting run does not mistake a screen HEALED for a found healer.

## Wall numbers (mid9 full-8)

- National 0/8, table sits 4/8 (lesser only), wins 0/8 (baseline leg never walks a door).
- Wave-4 unlocks 8/8, wave-5 unlocks 1/8 (53006 only — standing 675, 8 w5 kills).
- Median survival 108.5d; max 150d; min 45d.
- Telemetry deviation check: not run — DIAG screen, no lever before/after; the classification is the validity check.

## Method note

- Flap probe passed before the sweep (08:56Z). No flap observed this run.
- Old code extracted read-only with a single `git archive 4e6fa44ab src scripts index.html manifest.json version.json | tar -x -C scratch-4e6fa44ab/` — first try. The three frozen instrument files were overwritten from branch tip `e9399e09e` via `git show` and verified byte-identical to the worktree tip copies.
- The subset corpora were copied verbatim from the committed `evidence/2026-11-08/perseed-healerbisect-mid9-b/` (0730Z run) — not re-run. The non-subset seeds were run fresh in this window against the same extraction, same driver invocation, same instrument. Anchor reads `e9399e09e943` in the fresh corpora; the 0730Z subset corpora carry the 0730Z run's anchor (`1cac498d5a1e`).

## Metric review

- The full-8 bars were applied without re-scoring: #9 meets the sits bar (4/8) and fails the median bar (108.5d < 120d) → AMBIGUOUS. The screen HEALED from the 0730Z run is not overturned — the screen rule is a narrowing tool and it narrowed correctly — but the screen verdict is not the flip verdict. The prereg's design (screen to narrow, full-8 to judge) worked exactly as intended here: it caught a partial heal that the subset alone would have called complete.
- No metric change proposed. The median bar (≥120d) is doing real work: without it, #9 would be declared the healer on a 3/4 screen while half the band still dies early.

## Convergence state

scale-onramp stays **converging** (NOT converged): the staircase is mapped through #9 (70.5 → 100 → 108.5 → 145d) with no single healer in #1..#9 and 53005 unhealed throughout. The next bisect step is into #10..#17 (next midpoint #14 `2bc17d793`, alien expansion).

## Adoption handoff

See `sim-healerbisect-midpoint5-b.md` § Adoption handoff. Add: the #9 full-8 result above; the minimal-flipping-set proof (prereg COMBINATION clause) is owed once #10..#17 are mapped. Do not credit #9 (or #8) as the healer on the screen alone.
