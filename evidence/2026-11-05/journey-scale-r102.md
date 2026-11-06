# journey-scale r102 — run note (lane A, leg 3 SCALE)

**Run id:** laneA-scale-2026-11-05T2256Z (scheduled 16:45 CST 2026-11-05).
No prior lock existed, so no stale-lock recovery; main tree clean,
disk 24%. Base master@e39227114 at worktree creation. Rotation read 3
-> scale; 3->0 written at closeout with verified write + retry (see
closeout). Lock deleted at closeout per the body's even-on-failure
rule. Prereg:
evidence/2026-11-05/journey-scale-r102-prereg.md (committed f2d735dbb
BEFORE any scored seed ran; proof test 24/24). Heartbeats:
registration 22:59Z, 600s loop throughout.

## Q1 — NARROWED FILL ARM ELIMINATES DRY WALK-OUTS (binding, arm-vs-control)

**Verdict: INSUFFICIENT-DATA.** Control dry = **0 across the quad**
(10 walk-outs: dry 0, partial 1, wet 9) — the same as r100's control.
The phenomenon the arm would eliminate does not occur on this base
at all, so the arm's 0 dry (9 walk-outs: dry 0, partial 0, wet 9)
carries no evidence for the arm. NOT a pass — reported exactly as
the prereg's INSUFFICIENT-DATA arm requires. Second consecutive run
where the base has erased the r99 phenomenon (r99: 2 dry / 10;
r100 control: 0 / 10; r102 control: 0 / 10).

**The narrowing itself, measured separately: the study-day half is
fixed, the footprint is not gone.**
- Study-day unloads GONE: 85502 (target at dist 1, all 14 trips
  eval+study from home) — broad arm r100: 11 unloads, 0 fills;
  narrowed arm: **0 unloads, fillSkipStudy=14**. The gate declined
  every one, and the skip counters name them.
- Quad totals: unloads 28 -> 10 (broad r100 -> narrowed r102);
  fills 2 -> 4 days / 4 liters. Skips named: fillSkipStudy=14 (all
  85502), fillSkipFull=60 (85501: 55, 85503: 2, 85504: 3). The arm
  fired on 85501 (3 days, 3L: d89, d97, d124, each packW 2->3) and
  85503 (1 day, 1L: d27 packW 2->3); 85502 and 85504 never needed
  a fill on a walk-imminent day.
- BUT the footprint is NOT gone: **85501 still diverges — arm dies
  d127 vs control d150 (23 days earlier; the broad arm was 44
  days).** First real divergence is exactly the first fill (d89
  postCourt: packW 2->3, packKg +1.0, cistern -1, ticks +1 — the
  fill's own footprint, nothing else differs that day). The d119
  walk then fails on the arm run (stays at Haven, dist2 6) while
  the control reaches the village (dist2 0); the trip stalls and
  the village dies 23 days early. The fill is 1L of water —
  harmless in isolation — but it costs a tick, a cistern liter,
  and a kilogram of pack room (29.7/30 vs 28.7/30 at d89
  postCourt), and the downstream stream is different from there.
  The arm's walk-out count is 9 vs the control's 10 because that
  d119 walk-out never happened.
- Residual no-fill unloads: **10 unloads for 4 fills — 7 unload
  passes bought no water.** donateHaul sheds only donation-ready
  surplus above keepKcal; when the weight is raw/unknown haul
  nothing sheds and fillWater then refuses pack-full. The
  unload-then-fill ordering still tries to shed on days the fill
  refuses.
- The control's one PARTIAL walk-out (85501 d119, packW 1, three
  pack-full refusals that day) is the same day the arm's walk
  failed outright — the pack was already full at the walk in both
  quads; the arm's earlier fills are what differ.

**What this means:** the narrowed gate fixes the study-day half of
r100's over-broad gate (proven: 14 declines, 0 unloads on 85502)
but any state-changing action before courtship still perturbs the
downstream stream — the footprint shrinks (44d -> 23d) but doesn't
vanish. The next step is a design question, not a re-score:
whether a competent player topping up before a walk is worth ANY
footprint, or whether the fill belongs somewhere with no stream
cost (e.g. inside courtship's own walk step, or only when the
pack/cistern state is already known). Not built here.

## Q1b — RESET-LOOP CONSEQUENCE (report-only)

Resets **0 in BOTH quads** (control 0, arm 0). r99's 28-reset loop
does not occur on this base at all. Vacuous alongside Q1 — same as
r100.

## Q1c — MOVER + DRAIN REGRESSION (report-only)

Burn model HOLDS in r100's sense, with the same caveats. **Zero
no-drink nights in either quad** (every pilgrimage night the
scholar drank >= 1) — so r100's no-drink check is vacuous here.
Drink nights vs burn-50xdrank: control 27/95 outside +/-10, arm
30/102 — but 23/27 and 26/30 of those wake at hyd >= 99
(cap-clipped drinks, same class as r100's d85 -100 drain
artifact: the formula doesn't account for the 100 cap). Only 4
nights per quad are outside +/-10 WITHOUT cap clipping, all
drain 14 vs pred ~0, drankNight=1, and IDENTICAL in arm and
control (same seeds/days: d41, d55, d107/d111 vs d112) — a
base-behavior residual, not an arm effect and not a model break
to re-score. Side note: 85501 arm retry nights' packWOut avg rose
2.2 -> 2.8 — the fills land where they fire.

## Q2 — CENSUS CONTINUITY (report-only; r93–r100 metric unchanged)

| seed | arm end | control end | rank | seat | arc | seasoned peers (final) |
|---|---|---|---|---|---|---|
| 85501 | d127 pop 1/1 pantry 0 | d150 pop 0/0 pantry 600 | regional | lesser waiting | 4 | arm: 0 (lead 29/102d, trust < 40); control: 1 (lead 47/124d) + 2 covenants d121–122, unseasoned |
| 85502 | d61 pop 0/0 pantry 0 | d61 pop 0/0 pantry 0 | regional | lesser waiting | 4 | 0 both (lead 30/35d) |
| 85503 | d33 pop 5/5 pantry 0 | d33 pop 5/5 pantry 0 | village | none | 3 | 0 both (lead 33/8d) |
| 85504 | d74 pop 0/0 pantry 250 | d74 pop 0/0 pantry 250 | regional | lesser waiting | 4 | 3 both (lead 45/48d; covenants 59/32d, 54/31d) — identical |

National staged 0/4 both quads; courtNational answers 0/4. Same
as r93–r100. 85502/85503/85504 end IDENTICALLY arm vs control
(day/over/pop/pantry/rank/seat/arc/peers all match); only 85501
diverges, and its earlier death costs the covenants entirely
(control banks two at d121–122; the arm banks none).

## Q3 — PEOPLE CHECK (sense law; corpus rule as r96–r100)

Corpus: **2 sittings read in full** (arm 85501 — the only seed
alive at day 90/120; the control has only a day-90 transcript,
its d120 daily never completed the instrument block — scholar away
at the target creek after the d119 walk-out, no postCourt or
hungerwatch row for d120, so no sitting was taken that day).
Both REAL.
- **Day 90 Dongsheng (crossing guard, dry, trust 91, 16 prior
  convos, ask_favor stage 2 planted d88):** a betrayal lead-in
  takes the sitting first ("All right. Let's go." -> the hollow,
  "Sometimes that's the whole point"), then a recipe-aphorism
  chain: "Food is love out here. Not metaphorically. Literally.
  Calories are care." / "I'd rather be the cook than the hero.
  Heroes get songs. Cooks get everyone through winter." / "I
  dream in recipes now." Coherent, in-character, dry. Caveat:
  the planted ask_favor want never gets voiced in 8 turns — the
  betrayal lead-in + "tell me more" chain crowd it out. Same
  coverage class as r106's question-first half: a sitting that
  opens on something else never gives the planted want its turn.
- **Day 120 Wilmer (dockworker, cautious, trust 79, 11 prior
  convos, ask_favor stage 2 planted d115):** opens ON the want —
  "About the pantry run — I hate to ask twice, but it's still
  open. Will you?" — scholar commits, Wilmer names a real
  place/time ("The old burn east of camp, before the dew dries.
  Two packs between us."), want advances stage 2 -> 3, then a
  betrayal walk ("Come get air with me. ... Don't tell the
  others. Everyone needs one place.") and an honest frayed close
  ("Sorry. I need a minute. This was... thank you."). REAL — the
  best-shaped sitting of the two.
No fabricated history, no filler loops, no verbatim repeats in
either sitting.

## Village assessment, in plain words

Four villages on a band the base has now reshuffled twice over.
The water story is the same as the morning's: nobody walks out
dry — every pilgrim carries water, the thirst that used to strand
them never bites, and the reset loop that once ate whole
pilgrimages is simply gone. What changed this run is the cost of
carrying the water: the scholar who tops up before walking dies
three weeks earlier than the one who doesn't, on the longest-lived
seed — not from thirst, but because the extra liter, the extra
tick, and the shed food quietly change everything downstream, and
one walk home fails that used to succeed. The other three villages
end identically with and without the top-up. Two die with a lesser
seat already waiting, one never leaves the village, and the
longest-lived banks three seasoned friends and still never sees a
nation sit.

## Reachable / Fun / Winnable (leg verdict)

- **REACHABLE — PARTLY, unchanged from r96–r101.** Regional on 3/4
  seeds; national staged 0/4 both quads. The covenant road opens
  (85504 banks three seasoned peers, twice over) but the court
  never sits.
- **FUN — YES, with the same honest caveat.** The two conversations
  are genuinely good (Wilmer's pantry-run re-ask, Dongsheng's
  cook-not-hero). The dull spot is the early-death band: one
  village ends before the leg's window (day 80) even opens, and
  two more die with a lesser seat waiting.
- **WINNABLE — NOT YET.** No national, no global, no full seat on
  any seed in either quad; the lesser seat waits on 2/4 while the
  villages die. No wave-5 content faced; no kill claimed.

## Telemetry deviation check

`node scripts/telemetry-check.js` against
hidden_files/telemetry-baselines/scale.json, metrics
nationalLive,scaleRank, current = arm quad trust jsons:
**quiet (4 files, 2 metrics, no large deviations).** Same caveat
as r93–r101: that baseline is an old aggregate shape, so "quiet"
means "no large deviation on these two metrics", not a clean bill.
Baseline NOT rolled forward.

## Metric review

- **Q1's FINDING clause worked as designed:** the
  INSUFFICIENT-DATA arm caught the vacuous case a second run
  running — the control-first design earned its keep. No
  re-scoring was done: the verdict is INSUFFICIENT-DATA on the
  elimination question, with the footprint question answered
  descriptively alongside it.
- **The footprint question now has numbers:** unloads 28 -> 10,
  fills 2 -> 4L, study-day unloads 11 -> 0 (85502), but 85501's
  death moved only 44d -> 23d earlier. A narrowed gate shrinks
  the footprint; it does not remove it. The next run's prereg
  should ask whether the fill belongs inside courtship's own walk
  step (no extra pre-courtship action) or only when the
  pack/cistern state is already known — NOT another gate-narrowing
  on the same pre-courtship placement.
- **Q1c's burn check has no no-drink nights on this band anymore
  (0/197 nights)** — the no-drink comparison is vacuous here; the
  drink-night formula + cap-clipping account covers the rest, with
  a 4-night base residual (drain 14 vs pred ~0) identical in both
  quads. The next run should either name the residual's mechanism
  or drop the per-night formula in favor of the separator check.
- D-THING / V-INIT-BOND not carried this run (deepening
  instruments, not scale); no metric change proposed.
- No pre-registered metric was re-scored mid-run.

## Harness

Policy:
scripts/policies/scalecourt-nogate-morntrace3-fillnarrow.js (r100
fill clone + narrowed gate + skip counters + export; diff 48
lines). Driver: scripts/journey-scale-r102-20261105.js (r100
driver, labels/EVIDIR/mode/policy + 2 census fields). Control:
r99 driver as-is with EVIDIR override (no new control driver).
Analyzer: scripts/analyze-journey-scale-r102-20261105.js (r100
analyzer + PREFIX arg + neutral gate print + skip counters).
Proof: scripts/test-journey-scale-r102-narrow-gate-20261105.js
(24/24; not on the green list, same precedent as the r105/r106
proof tests — do not add it). Per-seed evidence:
evidence/2026-11-05/journey-scale-r102/ (arm),
evidence/2026-11-05/journey-scale-r102-control/ (control) +
analysis txts. Prereg + this note in repo evidence/2026-11-05/.

## Regression gate

`node scripts/check.js --quick` with
--cacheDirectory=/tmp/jest-cache-playtest, single run, 1825s:
**273 passed, 17 failed** — vs r106's 282/8 and r100's 284/6. All 17
are pre-existing or load flakes; NO new failures. The 8 non-timeout
failures are r106's same 8 (same files, same signatures:
test-measurement-proof-update, test-measurement-workflow,
test-mobile-combat-cadence, test-occupation-panels,
test-measurement-cache-flags (4 sub-failures, same as r106),
test-phone-frame-proof (3 sub-failures, stale phone receipt),
test-trust-observer-neutrality (this run: setup Error at 62.4s,
exit 1; r106: 120s timeout — same pre-existing file, different
load symptom), test-establishment-r20-fixes (1 sub-failure:
racks-full voice "next day voices once more", expected 2 got 1 —
the known r103 baseline failure)). The 9 additional failures are
ALL 120s timeouts (exit null) under load 14–16: comfort-arc,
phase-shawl, solo-campaign-endings, time-save-crashes,
synergy-stall, throttlefeast, capable-bot, first-ability-magic,
table-endings — 5 of these were named timeout flakes in r105
(passed in r106 under lower load, failed in r105 under load); the
other 4 share the identical 120s-timeout signature. This run
changed NO src/js (only new scripts/ + evidence/), so none of the
17 can be caused by it. Targeted proof on the touched area:
narrowed-gate proof test 24/24. Full log:
evidence/2026-11-05/journey-scale-r102-checkquick.log.

## Infrastructure notes

- Registration slow (~4 min) under REGISTRY.lock contention;
  heartbeat loop held throughout (600s).
- Safe-commit index clobber struck the prereg/tooling commit (5
  files staged-as-deleted + untracked; commit f2d735dbb correct);
  repaired via HEAD-blob cacheinfo, verified clean.
- Rotation-write discrepancy: r106's 2 -> 3 stuck; this run's
  closeout write 3 -> 0 verified by read-back with retries (see
  closeout).
- No EPERM flap this run.
- Lock discipline held throughout; lock deleted at closeout.

## Closeout (filled after the check gate)
- check.js --quick: 273 passed, 17 failed in 1825s (all pre-existing
  / load, no new failures — see above).
- Rebased onto master 5194acd46 (sim-winnability-round-2130 +
  tbretreat-refind-confirm-b landed while the gate ran; zero file
  overlap with this branch); proof test re-run green after the
  rebase (24/24).
- Merged locally, pending ship (no bump/push/live-verify — ship loop
  owns those). Merge hash in the memory log.
- Rotation 3 -> 0 written at closeout, verified by read-back (see
  rotation note below).

## Rotation note
Closeout write 3 -> 0 verified by read-back (up to 3 retries, 60s
apart, per the r106 closeout practice). Start state was 3 (written
by r106's 2 -> 3 closeout, verified then).
