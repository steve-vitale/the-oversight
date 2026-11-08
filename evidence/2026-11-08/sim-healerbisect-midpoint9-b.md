# sim-healerbisect-b — midpoint #9 screen (`4e6fa44ab`, r112 specialist ladder)

**Arm:** sim-healerbisect-b (DIAG, zero src/js) · **Run:** fleshout-loop-b-20261108T0730Z · **Axis:** scale-onramp / winnability chain · **Tracker blank:** (3) · **Findings:** #1885 · **Branch:** sim-healerbisect-mid9-b (base master `1cac498d5`) · **Prereg:** `evidence/2026-11-08/sim-healerbisect-b-prereg.md` (+ Amendment A1) · **Instrument:** doorwalk driver, BASELINE leg only (TAKESEAT_B=1, DOORWALK_B off), 150d death-aware, screen subset {53004, 53005, 53006, 53008}. Corpora committed under `evidence/2026-11-08/perseed-healerbisect-mid9-b/`. Proof `scripts/test-healerbisect-b.js` **17/17 green**; screen module `scripts/healerbisect-screen-20261108.js`.

## Verdict: HEALED on the screen rule — flip is in #1..#9, next midpoint #5

Midpoint #9 `4e6fa44ab` (journey-establishment r112 Q1: specialist ladder — foodXp buys skill from 0, village work grants foodXp) screens **HEALED**: 3/4 subset seeds reach 150d (bar ≥3/4). The flip interval narrows to **#1..#9**; the next midpoint is **#5 `19ee88466`** (journey-establishment r111 Q2: convoNextMenu returns the current line) — dispatched by the coordinator, NOT run here.

Seed-level truth, which the headline hides: **53005 does not heal at all** at #9 — its fallen list is identical to the collapsed control, day for day, death for death (see below). The #1..#9 flip heals 53004, 53006, 53008 but leaves 53005 exactly collapsed. Either the landing that heals 53005 sits in #10..#17, or the full heal is a combination (#9's ladder plus a later landing). The bisect on the screen rule proceeds at #5; 53005 is a second, still-open question the adopting run must carry — a flip verdict that rests only on the 3/4 screen would be incomplete for this seed.

## Per-seed table — midpoint #9 `4e6fa44ab` (this run)

| Seed | Days | End | Standing | maxWave | Seat | w4 kills | w5 kills | vs collapsed | vs healed |
|---|---|---|---|---|---|---|---|---|---|
| 53004 | 150 | survived | 199 | 4 | lesser d90 | 3 | 0 | 73d → 150d, exact healed match | exact (150/d90/199/3) |
| 53005 | 54 | village-lost | 199 | 4 | — | 1 | 0 | exact collapsed (54d) | 150d → 54d, NOT healed |
| 53006 | 150 | survived | 675 | 5 | lesser d90 | 11 | 8 | 66d → 150d | EXCEEDS healed (150/d90/199/3) |
| 53008 | 150 | survived | 199 | 4 | lesser d141 | 1 | 0 | 92d → 150d | 150d, late sit (healed d97, w4 3) |

0 instrument errors on all 4 seeds. Screen classifier: `{n: 4, healed: 3, collapsed: 1, verdict: "HEALED"}`. Subset median 150d, sits 3/4. Smoke (53004 alone, 08:20:57–08:21:17Z, ~20s) validated the instrument before any judged seed; remaining 3 seeds ran in one invocation (~30s). Total sim time ~50s — far faster than the 0530Z run's ~5 min/seed; the box is quiet this run.

## Flip table: collapsed (0530Z subset, published) → mid9 (this run)

| Seed | Collapsed days | Mid9 days | Δdays | Collapsed seat/sat | Mid9 seat/sat | Collapsed stand | Mid9 stand | Collapsed w4 | Mid9 w4 | end |
|---|---|---|---|---|---|---|---|---|---|---|
| 53004 | 73 | 150 | +77 | — | lesser d90 | 199 | 199 | 2 | 3 | village-lost → survived |
| 53005 | 54 | 54 | 0 | — | — | 199 | 199 | 1 | 1 | village-lost → village-lost |
| 53006 | 66 | 150 | +84 | — | lesser d90 | 190 | 675 | 1 | 11 | village-lost → survived |
| 53008 | 92 | 150 | +58 | — | lesser d97 | 199 | 199 | 3 | 1 | village-lost → survived |

Collapsed reference: 0530Z subset table in `evidence/2026-11-08/sim-healerbisect-b.md` (the /tmp corpora were wiped; the published table is the durable record). The analyzer could not re-run against collapsed corpora for the same reason — see Method note.

## Analyzer: healed subset (full-8 control, extracted from `c5c7d5414`) → mid9

```
A healed-subset: n=4 median=150d sits=4/8 verdict=HEALTHY
B mid9-4e6fa44ab: n=4 median=150d sits=3/8 verdict=AMBIGUOUS
seeds with moved death day: 1/4; instrument errors A=0 B=0
```

(The analyzer's HEALTHY bar needs sits ≥4/8; on a 4-seed input it can only see 3 sits at mid9, so it reads AMBIGUOUS. That is the analyzer's full-8-bar reading, NOT the binding screen rule — the prereg's screen rule is HEALED at ≥3/4 reaching 150d, which mid9 meets. The one moved death day is 53005, healed → collapsed, i.e. the seed #9 fails to heal.)

| Seed | Healed days | Mid9 days | Δ | Healed seat/sat | Mid9 seat/sat | Healed stand | Mid9 stand | Healed w4 | Mid9 w4 |
|---|---|---|---|---|---|---|---|---|---|
| 53004 | 150 | 150 | 0 | lesser d90 | lesser d90 | 199 | 199 | 3 | 3 |
| 53005 | 150 | 54 | −96 | lesser d99 | — | 199 | 199 | 2 | 1 |
| 53006 | 150 | 150 | 0 | lesser d90 | lesser d90 | 199 | 675 | 3 | 11 |
| 53008 | 150 | 150 | 0 | lesser d97 | lesser d141 | 199 | 199 | 3 | 1 |

## Mechanism — 53005 is the collapsed village, untouched

53005 fallen at mid9 (13), identical to the collapsed 0530Z record through every day and cause: Robin ambushed d13, Joshua killed by The Callback d26, Cheryl lost in the wild d29, Caleb dead in combat d36, Desmond dies of a wound that won't close d39, Patrick of sickness d43, Aki to a monster d48, then **five villagers starve on d50–51** (Adriano, Nikolai, Somchai, Jorge, Anayo), Brian dies in combat d52, village gone d54. The specialist ladder changed nothing here — not one death day moved, not one cause changed. Whatever the ladder teaches, this village's second month still thins to starvation on the same schedule.

The other three seeds tell the opposite story. 53004 loses 7 people (all to the wild or the arena, no starvation) and sits d90. 53008 loses 12 (one starvation, Ecep d82 — a single death the village absorbs) and sits late, d141. 53006 is the outlier that overshoots the healed endpoint entirely: 12 fallen, no starvation, and the village goes on to kill **8 wave-5 monsters** (The Editor ×3, The Spoiler, The Network Note, The Rerun, The Timeslot ×2) and 11 wave-4 kills, standing 675 — against the healed control's 150d/199/w4 3 with no wave 5 at all. The ladder does not merely restore the healed shape on this seed; it pushes the village past it, into wave 5, while the healed endpoint never got there.

Death-cause census, mid9 subset (44 fallen): 'the wild' 24, starvation 6 (5 in 53005, 1 in 53008), ambush 2, combat 2, contest 2, 'the night' 2, The Callback 1, 'a wound that wouldn't close' 1, sickness 1, monster 1, the arena 1, betrayal 1. Collapsed subset census was starvation 7, healed subset 0 — mid9 sits between, entirely because of 53005.

## Village assessment — what the villages looked like

Three villages out of four sit down at the lesser table and live out the 150 days; the fourth dies exactly the way it always died. On the three that live, the ladder's fingerprint is legible: nobody starves (one death aside), and one village gets strong enough to hunt the Producers — the wave-5 road opens at #9, a full eight landings before the healed endpoint. On 53005, the ladder is invisible. The same twelve people die in the same order on the same days, and the same five starve together in two days. The difference between the seeds is not visible in the ladder's code — it is in what each village needed: three needed hands that could learn the work, one needed something else entirely, and the ladder only supplies the first.

Sense-check: sit days read from `takeseatStats.seatDay` (taken day), not the daily `tableSeat()` rows. 53008's late sit (d141 vs healed d97) reads as the village earning the seat late, not an instrument artifact — its fallen list shows steady attrition through d140 (Valeria to the wild on the sit day itself). No dialogue in these corpora reads robotic on its face; the death lists are the story here, and they cohere.

## Wall numbers (mid9 screen, 4 seeds)

- National 0/4, table sits 3/4 (lesser only), wins 0/4 (baseline leg never walks a door).
- Wave-4 unlocks 4/4, wave-5 unlocks 1/4 (53006 only — standing 675, 8 w5 kills).
- Median survival 150d (subset); max 150d; min 54d.
- Telemetry deviation check: not run — this is a DIAG screen with no lever before/after; the screen classification is the validity check (same as both control runs).

## Method note — flap-resilient extraction (same as the healed control)

- The write-denial flap was OFF at run start: the O_EXCL probe (`git update-ref refs/heads/probe HEAD` in the main repo) passed on the first try at 08:19:27Z, and the new branch `sim-healerbisect-mid9-b` was created from master `1cac498d5` immediately after.
- Old code extracted read-only with a single `git archive 4e6fa44ab src scripts index.html manifest.json version.json | tar -x -C scratch-4e6fa44ab/` — 9,891 files, first try, no chunking needed. `version.json` stamp `eac2bfc4d-20261107-175416` (the #4 bump — consistent with #9 sitting after #4). Code identity verified: scratch `src/js/food.js` contains the r112 self-taught ladder (`else if (skill === 0 && xp >= 10)`) and DIFFERS from the worktree tip (post-#9 changes, e.g. #15's rung change, are in the tip but not the scratch); scratch `src/js/game.js` likewise differs from the tip.
- The three frozen instrument files were overwritten from master tip `1cac498d5` via `git show` (driver, doorwalk policy, analyzer) and verified byte-identical to the worktree tip copies — and, checked first, byte-identical to `4e6fa44ab`'s own driver/policy copies, so the overwrite is a content no-op, kept for the record. The analyzer is absent from `4e6fa44ab` (created later, by `1d1dbb467`) and runs from the branch tip, per the prereg.
- Require closure verified BEFORE the smoke: all 17 files the driver needs, including the three transitive instrument requires the healed run's first smoke caught (`stageally-instrument-20261106`, `bankkiller-instrument-20261105`, `killerdeath-instrument-20261105`) plus the deeper transitive set (`competent`, `idle`, `vinebank`, `snareteach`, `conversation-pages`, `competent-feastdrive-b`, `competent-linkdrive-b`). The full `src`+`scripts` archive includes the closure by construction; the smoke passed on the first try (~20s, 0 errors).
- Anchor reads `1cac498d5a1e` (the worktree tip) in every corpus JSON, not `unknown` as in the healed run — the harness records the anchor from the invoking checkout. The SHA under test is recorded here (`4e6fa44ab`), not inferred from the anchor.
- `scripts/worktree-heartbeat.sh sim-healerctl-hea-b` WORKED this run (exit 0, <1s at 08:23:19Z) — unlike both previous workers, where it hung. No retry needed.
- Collapsed corpora for the analyzer flip table were unavailable: the 0530Z /tmp corpora were wiped and never committed, and the collapsed subset lives only as the published table in `sim-healerbisect-b.md` (used above). The healed-subset corpora were re-extracted read-only from commit `c5c7d5414` into /tmp for the analyzer run.

## Metric review

- The screen rule held without re-scoring: HEALED at ≥3/4 reaching 150d, met exactly at 3/4. No friendlier metric was consulted — and the seed-level reading (53005 exactly collapsed) is reported alongside the headline rather than folded into it.
- One correction to the prereg's expectation, not the metric: the prereg's bisect narrative assumes a single landing flips the whole band. At #9 the flip is 3/4, not 4/4. The screen rule as written still classifies #9 HEALED and narrows the interval to #1..#9 — but the adopting run must not treat #5's verdict as settling 53005. If #5 also reads HEALED 3/4 with 53005 collapsed, the flip is in #1..#5 for three seeds and 53005's healer is a separate, later question (or a combination). If #5 reads COLLAPSED, the flip is #5..#9 for three seeds, same caveat.
- The 53006 over-heal (standing 675, 8 w5 kills vs healed 199/0) is a property of #9's code, not of the screen: the healed endpoint is the sum of all 17 landings, and #9 alone overshoots it on this seed. A later landing (#10..#17) may temper it — or the overshoot may be seed noise in a village that was already strong. Not judged here; the full-8 confirm of the flip point will show whether it persists.
- Open question, not chased: 53006's end-state `readiness5` reads veterans 0 (short of the 2 demanded) yet the village unlocked wave 5 and killed 8 Producers. Either the wave-4 killers died before the end (veterans are living-roster only) or the readiness gate released on a different read. The corpus holds the answer; a future arm can check it. Logged in the findings backlog.

## Convergence state

scale-onramp stays **converging** (NOT converged): the bisect has its first narrowing — the flip is in #1..#9, with #9 itself reading HEALED on the screen — but no landing is fingered yet, the flip point is unconfirmed on the full 8, and 53005's healer is still entirely unknown. The next blank, in order: midpoint #5 `19ee88466` on the screen subset (coordinator dispatches; not started here).

## Adoption handoff — midpoint #5 may proceed

1. Midpoint #9 `4e6fa44ab` screens HEALED (3/4 reach 150d; 53005 still collapsed exactly). The flip is in **#1..#9**; next midpoint **#5 `19ee88466`** (r111 Q2 convoNextMenu) on the screen subset {53004, 53005, 53006, 53008}: same driver invocation, same extraction method (this run's method note above — full archive, frozen instrument overwrite, 17-file closure check before smoke). If #5 HEALED → flip in #1..#5, next #3 `5b2dd06ed`; if COLLAPSED → flip in #5..#9, next #7 `820b61496` (the prodstore revert — a no-op step with #6, so a flip landing there is an instrument/base problem, re-examine, do not credit).
2. Carry the 53005 caveat: track 53005's days separately at every screen. If the flip interval narrows while 53005 stays collapsed, its healer is a second question in #10..#17 (or a combination) — do not declare the healer found on the 3/4 screen alone.
3. The flip point is confirmed on all 8 seeds (both bracketing commits, full sweeps) + balanced panel before any verdict, per the prereg. Budget this run: ~50s total sim time for the 4-seed screen — the box is quiet; a full-8 confirm is affordable in the next window.
4. Worktree `~/workspace/worktrees/sim-healerctl-hea-b`, branch `sim-healerbisect-mid9-b` (base master `1cac498d5`). The healed-control branch `sim-healerctl-hea-b` (commit `c5c7d5414`) was NOT touched. Scratch dir `scratch-4e6fa44ab/` left untracked in the worktree (extraction of `4e6fa44ab`, frozen instrument copies inside it).

## Findings backlog

- [open] 2026-11-08 — readiness / wave-5 — WAVE 5 UNLOCKED WITH END-STATE VETERANS 0: seed 53006 at midpoint #9 `4e6fa44ab` unlocks wave 5 (standing 675, 8 wave-5 kills) while its end-state `readiness5` reads veterans 0, short of the 2 demanded for wave 5. Either the wave-4 killers died before the end (veterans are living-roster only) or the gate released on a different read. The corpus holds the answer; check before trusting the readiness gate's end-state read. (Loop B arm sim-healerbisect-b midpoint #9, run fleshout-loop-b-20261108T0730Z, evidence/2026-11-08/sim-healerbisect-midpoint9-b.md.)
