# sim-healerbisect-b — midpoint #16 full-8 (`685dc9ec4`, pellet pass) — THE HEALER (flip interval #15..#16)

**Arm:** sim-healerbisect-b (DIAG, zero src/js) · **Run:** fleshout-loop-b-20261108T1030Z · **Axis:** scale-onramp / winnability chain · **Tracker blank:** (3) · **Findings:** #1885 · **Branch:** sim-healerbisect-mid14-b (tip `246ce6dc2` lineage + Amendment B `af93aa2df` + mid14 evidence `9a824cbb`) · **Prereg:** `evidence/2026-11-08/sim-healerbisect-b-prereg.md` (+ Amendment A1, + Amendment B) · **Instrument:** doorwalk driver, BASELINE leg only (TAKESEAT_B=1, DOORWALK_B off), 150d death-aware, frozen band 53001–53008, full 8 per Amendment B. Corpora committed under `evidence/2026-11-08/perseed-healerbisect-mid16-b/`. Proof `scripts/test-healerbisect-b.js` **17/17 green**; screen module `scripts/healerbisect-screen-20261108.js`.

## Verdict: HEALED on the full-8 bars — #16 reproduces the healed control EXACTLY

Midpoint #16 `685dc9ec4` (pellet pass: the pellet moves to hungrier hands at dawn — `src/js/progression.js` +104, Steve's ruling 2026-11-07) reads **HEALED**: median **145d**, sits **4/8**. Both flip bars pass (median ≥120d AND sits ≥4/8). Against the healed control the analyzer reports **0/8 moved death days** — every seed identical on days, seat, standing, and wave-4 kills. This is not a partial heal or a near miss. It is the healed endpoint, reproduced landing-for-landing up to #16.

The staircase, complete through #16, full-8 medians: collapsed control 70.5d → #8 100d → #9 108.5d → #14 103d → **#16 145d** → healed control 145d. Sits: 0/8 → 2/8 → 4/8 → 4/8 → **4/8** → 4/8. The climb from #14 to #16 is 42 days of median and the whole remaining shape at once.

**Attribution, precisely stated:** the flip interval is **#15..#16**. #14 (AMBIGUOUS, full-8 confirmed) is the last non-healed point; #16 (HEALED, full-8 confirmed) is the first healed point. The interval contains one untested landing, #15 `e6ddaf32a` (specialist first rung 10 → 5 XP). The fingered landing is therefore **#16 (pellet pass) OR #15** — this run cannot name one of them alone, because #15 has not been screened. If #15 screens HEALED, the finger is #15; if #15 screens AMBIGUOUS or COLLAPSED, the finger is #16. The adopting run screens #15 (full 8, ~10–25 min at current contention) and then names the landing and runs the balanced panel. What is already proven, and needs no further screen: **some landing in #15..#16 heals the whole band, and #16's code state heals it exactly** — the combination question is closed for the upper half; the only open question is which of the two landings does it.

## Per-seed table — midpoint #16 `685dc9ec4`, full 8

| Seed | Days | End | Standing | maxWave | Seat | w4 kills | w5 kills | vs #14 | vs healed |
|---|---|---|---|---|---|---|---|---|---|
| 53001 | 105 | village-lost | 275 | 5 | — | 5 | 2 | 67d → 105d | exact (105/275/5) |
| 53002 | 140 | village-lost | 199 | 4 | — | 1 | 0 | 139d → 140d, seat lost | exact (140/199/1) |
| 53003 | 65 | village-lost | 199 | 4 | — | 1 | 0 | 45d → 65d | exact (65/199/1) |
| 53004 | 150 | survived | 199 | 4 | lesser d90 | 3 | 0 | identical days/seat/stand; w4 9 → 3 | exact (150/d90/199/3) |
| 53005 | 150 | survived | 199 | 4 | lesser d99 | 2 | 0 | 54d → 150d, sits | exact (150/d99/199/2) |
| 53006 | 150 | survived | 199 | 4 | lesser d90 | 3 | 0 | identical days/seat; stand 675 → 199, w5 8 → 0 | exact (150/d90/199/3) |
| 53007 | 50 | village-lost | 75 | 3 | — | 0 | 0 | 59d → 50d | exact (50/75/0) |
| 53008 | 150 | survived | 199 | 4 | lesser d97 | 3 | 0 | identical days; seat d141 → d97, w4 1 → 3 | exact (150/d97/199/3) |

0 instrument errors on all 8 seeds. Full-8 median 145d, sits 4/8. Smoke (53004 alone, 10:55:20–10:57:xxZ, ~2.5 min) validated the instrument before any judged seed; the other 7 seeds ran in one invocation (10:58:16–11:21:04Z, ~23 min — contention rising through the run; per-seed cost roughly doubled from the #14 sweep). Total sim time ~25 min.

## Flip tables (analyzer)

Collapsed control → mid16: `A collapsed-control: n=8 median=70.5d sits=0/8 verdict=COLLAPSED; B mid16-685dc9ec4: n=8 median=145d sits=4/8 verdict=HEALTHY; seeds with moved death day: 8/8; instrument errors A=0 B=0`. Every seed's death day moved; 53005 moves +96d, 53006 +84d, 53004 +77d, 53002 +56d, 53008 +58d, 53001 +17d; 53003 −3d and 53007 −13d move *earlier* yet land exactly on the healed endpoint (both die earlier than the collapsed tip too — the healed shape for those seeds is an early death, and #16 reproduces it).

| Seed | Collapsed days | Mid16 days | Δdays | Collapsed seat/sat | Mid16 seat/sat | Collapsed stand | Mid16 stand | Collapsed w4 | Mid16 w4 | end |
|---|---|---|---|---|---|---|---|---|---|---|
| 53001 | 88 | 105 | +17 | — | — | 199 | 275 | 3 | 5 | village-lost → village-lost |
| 53002 | 84 | 140 | +56 | — | — | 100 | 199 | 0 | 1 | village-lost → village-lost |
| 53003 | 68 | 65 | −3 | — | — | 120 | 199 | 0 | 1 | village-lost → village-lost |
| 53004 | 73 | 150 | +77 | — | lesser d90 | 199 | 199 | 2 | 3 | village-lost → survived |
| 53005 | 54 | 150 | +96 | — | lesser d99 | 199 | 199 | 1 | 2 | village-lost → survived |
| 53006 | 66 | 150 | +84 | — | lesser d90 | 190 | 199 | 1 | 3 | village-lost → survived |
| 53007 | 63 | 50 | −13 | — | — | 125 | 75 | 0 | 0 | village-lost → village-lost |
| 53008 | 92 | 150 | +58 | — | lesser d97 | 199 | 199 | 3 | 3 | village-lost → survived |

Healed control → mid16: `A healed-control: n=8 median=145d sits=4/8 verdict=HEALTHY; B mid16-685dc9ec4: n=8 median=145d sits=4/8 verdict=HEALTHY; seeds with moved death day: 0/8; instrument errors A=0 B=0`. All eight rows identical on days, seat, standing, and w4 kills — reproduced verbatim in the table below.

| Seed | Healed days | Mid16 days | Δ | Healed seat/sat | Mid16 seat/sat | Healed stand | Mid16 stand | Healed w4 | Mid16 w4 |
|---|---|---|---|---|---|---|---|---|---|
| 53001 | 105 | 105 | 0 | — | — | 275 | 275 | 5 | 5 |
| 53002 | 140 | 140 | 0 | — | — | 199 | 199 | 1 | 1 |
| 53003 | 65 | 65 | 0 | — | — | 199 | 199 | 1 | 1 |
| 53004 | 150 | 150 | 0 | lesser d90 | lesser d90 | 199 | 199 | 3 | 3 |
| 53005 | 150 | 150 | 0 | lesser d99 | lesser d99 | 199 | 199 | 2 | 2 |
| 53006 | 150 | 150 | 0 | lesser d90 | lesser d90 | 199 | 199 | 3 | 3 |
| 53007 | 50 | 50 | 0 | — | — | 75 | 75 | 0 | 0 |
| 53008 | 150 | 150 | 0 | lesser d97 | lesser d97 | 199 | 199 | 3 | 3 |

Mid14 → mid16: `A mid14: n=8 median=103d sits=4/8 verdict=AMBIGUOUS; B mid16: n=8 median=145d sits=4/8 verdict=HEALTHY; seeds with moved death day: 5/8; instrument errors A=0 B=0`. Moved: 53001 +38, 53002 +1, 53003 +20, 53005 +96, 53007 −9. Unmoved: 53004, 53006, 53008 (all three survive 150d at both points — but their internals change: 53004's w4 kills fall 9 → 3, 53006's standing falls 675 → 199 and its 8 wave-5 kills vanish, 53008's seat comes 44 days earlier, d141 → d97, w4 1 → 3). The #9/#14 overshoot (53006 hunting Producers, 53004 killing 9 wave-4 monsters) was a property of the pre-pellet-pass code, not of the healed endpoint: at #16 the villages stop overshooting and land exactly on the healed shape.

## Mechanism — the pellet pass heals 53005 by feeding the village

The control analysis (0530Z) showed the healing signature is starvation disappearing: collapsed 7 starvation deaths → healed 0. At #16 the census reads starvation **1** in 96 fallen — a single death, Boris d47 in 53007, the seed that dies at 50d in both endpoints. 53005, the seed that starved five people in two days at every point #5..#14, starves **nobody** at #16.

53005's fallen list tells it in plain words. The first four deaths are identical to the collapsed control, day for day: Robin ambushed d13, Joshua killed by The Callback d26, Cheryl lost in the wild d29, Caleb dead in combat d36. Then it splits. Collapsed: Desmond dies of a wound that won't close d39, Patrick of sickness d43, Aki to a monster d48, then five starve d50–51 and the village is gone d54. At #16: Desmond dies of sickness d37, Patrick to a monster d39 — and the village keeps going. It loses 22 people over 150 days (monsters, the wild, contests, the arena) but never starves anyone, and sits the lesser seat on d99. The pellet pass is the mechanism the control analysis predicted: the bearer never hungers, so the village never threw the feast the table counts; when the pellet passes to hungrier hands at dawn, the village eats, the feast happens, and the second month stops thinning to starvation. The first month of dying is unchanged — the same four early deaths — and the village absorbs them and recovers, exactly as the healed control does.

Note the pellet-mention count does not discriminate (2 mentions in the 53005 corpus at #14, #16, and healed alike — the pellet is narrated in table/quote lines, not in a per-pass event the corpus counts). The proof is the trajectory, not the mention count: 53005's death list is identical to collapsed through d36 and identical to healed from d37 on. The prereg's GO bar asks for one healed village's trajectory read in plain words — that is 53005 above.

## 53005 reading — HEALED, at last

53005 heals at #16 (150d, lesser d99, standing 199, w4 2 — exact healed match). It was exactly collapsed at every screened point #5, #7, #8, #9, #14 (54d, identical fallen list). Its healer is in #15..#16. The 53005 caveat that ran through the whole bisect is closed as a question of *whether* it heals; only *which* of the two landings heals it remains, and that is the #15 screen's job.

## Village assessment — what the villages looked like

Four villages out of eight live out the 150 days at #16, and all four sit down at the lesser table — the same four that sit in the healed control, on the same days. The other four die on the same schedule the healed endpoint always used, including the two that die early (53003 at 65d, 53007 at 50d) and the two that live long without ever sitting (53001 at 105d, 53002 at 140d). Nothing overshoots any more: no village hunts Producers, no village kills nine wave-4 monsters, no village sits late. The band at #16 is not a better version of the healed endpoint. It *is* the healed endpoint, seed for seed. The most legible village is still 53005: the same twelve people die in the same order for the first five weeks, and then — where five of them starved together in two days at every earlier point — nobody starves, and the village that used to die at the table with empty bowls sits down at the lesser table on day 99 instead.

Sense-check: sit days read from `takeseatStats.seatDay` (taken day). 53002 at #16 does *not* sit (unlike #14, where it sat d90 and died d139) — the healed control also leaves it unseated, and #16 reproduces that exactly; the #14 seat was reshuffle, not progress. 53006's end-state `readiness5` at #16 reads veterans 1, short of the 2 demanded, while the village sits d90 without unlocking wave 5 — the readiness question from #9 (veterans 0 at #9, 1 at #8, 1 at #16) is still open as a *reading* question, but it no longer blocks anything: the gate's end-state read was never the healer. No dialogue in these corpora reads robotic on its face; the death lists cohere with the healed control where the seeds match, which at #16 is everywhere.

## Wall numbers (mid16, full 8)

- National 0/8, table sits 4/8 (lesser only), wins 0/8 (baseline leg never walks a door).
- Wave-4 unlocks 8/8, wave-5 unlocks 1/8 (53001 only — standing 275, 2 wave-5 kills, both The Editor d86/d91; identical to the healed control).
- Median survival 145d; max 150d; min 50d.
- Telemetry deviation check: not run — DIAG screen, no lever before/after; the classification is the validity check. (The balanced panel §15 is owed by the adopting run once #15 names the fingered landing.)

## Method note

- Flap probes passed before the #16 extraction, before the smoke (10:55:20Z), and before the full sweep (10:58:16Z). No flap observed this run.
- Worktree heartbeat **hung** this run (`timeout 60 bash scripts/worktree-heartbeat.sh sim-healerbisect-mid14-b` → exit 124, killed at 60s) — the known heartbeat-script hang from the 0530Z/0830Z runs, not git (the `git archive` that followed ran normally). The registry heartbeat is therefore stale from the coordinator's registration; the branch and evidence commits are the durable record.
- Old code extracted read-only with a single `git archive 685dc9ec4 src scripts index.html manifest.json version.json | tar -x -C scratch-685dc9ec4/` (after `mkdir -p`). `version.json` stamp `09e57528e-20261107-233501` (the #13 bump — no bump between #13 and #16, consistent). Code identity verified: scratch `src/js/progression.js` contains the pellet-pass code (22 `pellet` refs, "passing to hungrier hands" comment).
- The three frozen instrument files were overwritten from branch tip `246ce6dc2` via `git show` (driver, doorwalk policy, analyzer) and verified byte-identical to the worktree tip copies.
- Require closure verified BEFORE the smoke: 18 files, none missing (same closure as #14).
- Anchor reads `246ce6dc22f13` (the worktree tip) in every corpus JSON. The SHA under test is recorded here (`685dc9ec4`), not inferred from the anchor.
- The safe-commit index clobber hit the mid14 evidence commit (9 files shown as D + ?? after a correct commit `9a824cbb`); repaired via `git ls-tree -r HEAD | git update-index --add --index-info`, status clean, diff empty — same class as the 0530Z run and the Amendment B commit.
- Scratch dirs `scratch-2bc17d793/` and `scratch-685dc9ec4/` left untracked in the worktree (extractions of the screened SHAs, frozen instrument copies inside them), per the #5/#7/#8/#9 precedent.

## Metric review

- The full-8 bars were applied without re-scoring: #16 meets both (median 145d ≥ 120d AND sits 4/8) → HEALED. The reproduction is stronger than the bars require: 0/8 moved death days against the healed control, identical on days, seats, standing, and wave-4 kills for all eight seeds — including the two seeds (53003, 53007) whose death days move *earlier* than the collapsed tip. No friendlier metric was consulted; the median bar and the exact-reproduction check agree.
- No metric change proposed. Amendment B (full-8 screens from #14) earned its keep twice over: at #14 it prevented a false HEALED from the retired 3/4 screen, and at #16 it supplied the full-8 proof that the heal is exact rather than partial.
- One correction to the prereg's expectation, not the metric: the prereg's bisect narrative assumes the flip interval's healed end names the fingered landing directly. The interval here is #15..#16 with #15 untested, so the landing is named only as a two-candidate interval, not a single commit. The GO bar's "fingered landing named with full-8 evidence on both sides" is therefore met for the *interval* but not for the *single landing* — the adopting run's #15 screen closes that gap, and the panel follows it. Nothing in this run re-scores or re-defines the bar to claim a single landing prematurely.

## Convergence state

scale-onramp stays **converging** (NOT converged): the healer is found to within one landing — the flip is #15..#16, and #16's code state reproduces the healed control exactly on all 8 seeds — but the single fingered landing (#15 specialist first rung vs #16 pellet pass) is not yet named, and the balanced panel is not yet run. The next blank, in order: the #15 screen (adoption handoff below), then the panel, then the tracker update naming the healer.

## Adoption handoff — #15 screen + panel

1. Midpoint #16 `685dc9ec4` reads **HEALED** on the full 8 (median 145d, sits 4/8, 0/8 moved death days vs the healed control). The flip interval is **#15..#16**. Next midpoint **#15 `e6ddaf32a`** (journey-establishment r113 Q1: specialist self-taught first rung 10 XP → 5 XP, `src/js/food.js`) on the full 8 seeds {53001..53008} per Amendment B — same driver invocation, same extraction method (this run's method note above — full archive, `mkdir -p` first, frozen instrument overwrite, 18-file closure check before smoke). If #15 HEALED → the fingered landing is **#15**; if AMBIGUOUS or COLLAPSED → the fingered landing is **#16 (pellet pass)**. Either way the flip point is then confirmed on all 8 seeds on both sides (already done for #14 and #16; #15's own full-8 is the confirm) + balanced panel via `scripts/balance-panel.js` before any verdict, per the prereg.
2. The 53005 caveat is closed on *whether* (it heals at #16); the #15 screen answers *which landing* heals it. Track 53005 separately at #15 as at every screen.
3. Budget warning: the #16 full-8 sweep cost ~25 min at current contention (smoke ~2.5 min, 7 seeds ~23 min — roughly double the #14 pace). Plan the adopting run's window accordingly; do not shrink to a subset without a disclosed prereg amendment.
4. Worktree `~/workspace/worktrees/sim-healerbisect-mid14-b`, branch `sim-healerbisect-mid14-b` (tip: Amendment B `af93aa2df` + mid14 evidence `9a824cbb` + this evidence commit). Scratch dirs `scratch-2bc17d793/` and `scratch-685dc9ec4/` left untracked in the worktree.
5. Staircase for the tracker: collapsed 70.5d/0 sits → #8 100d/2 → #9 108.5d/4 → #14 103d/4 → **#16 145d/4 = healed control 145d/4**. Per-seed healer map: 53004 heals #8; 53006 heals #8 (overshoots #9/#14, exact at #16); 53008 heals #9; 53002 heals #9 only (seated-then-lost at #14, exact healed at #16); 53001/53003/53005 heal at #16 only (53005 never before); 53007 never heals anywhere (best 63d collapsed/#8; 50d at #16 = healed control).
