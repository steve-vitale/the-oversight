# sim-glutprobe-b — the production rebound, dose-response by channel (food-economy diagnostic)

Run: fleshout-loop-b-20261020T1630Z, arm sim-glutprobe-b (DIAGNOSTIC — no lever,
no landing, instrument-only, zero src/js changes, zero new policy layers).
Worker tree: ~/workspace/worktrees/sim-glutprobe-b.
Answers backlog #570: the feastdraw kill's perverse dose-response
(Pearson(fd nights, pair rot ratio) = +0.73 on permanent-glut seeds) —
investigate the production rebound (inflow-side) before any further
draw/supply lever.

## Where this sits

This question has been investigated twice before; this run extends, not repeats:

- 2026-10-18 sim-prodrebound-b (evidence/2026-10-18/sim-prodrebound-b.md):
  mechanism map — share_surplus 84–88% of inflow, ungoverned; PRODTHROTTLE
  governs duties only; the feastdraw backfire did NOT reproduce with a
  faithful replay (fidelity gate failed).
- 2026-10-20 sim-prodrebound-b (evidence/2026-10-20/sim-prodrebound-b.md):
  OBSERVATIONAL, 16 fresh runs, DIAG-GO — no aggregate rebound; the only
  lean-responsive channel is duty_fish (31.46x via the PRODTHROTTLE disengage
  leg); share_surplus is pro-cyclical (0.46x lean); marginal fat-side rot
  ~37–42% through the ungoverned funnels. Named next sim-sharelean-b →
  KILLED (lean collapse is compositional, not a hoard); duty_fish scale-up →
  KILLED (dutyfish-b2: staffing can't fix inflow collapse).

What those runs did NOT do (this run's brief, verbatim): per-channel inflow
vs pantry fresh-days AND vs doomed stock dose-response curves; FIND the
permanent-glut configs on current master and attribute the MARGINAL GLUT
INFLOW by channel; NAME the channels that do NOT throttle when the pantry is
full — with dose-response tables. The 2026-10-20 instrument also had an
honest classification limit (duty forage/garden/hunt yields smeared into the
share_surplus funnel by merged item tags); this run's instrument attributes
by CALL PATH, separating duty production from the autonomous funnel.

## Pre-registration (binding, docs/MEASUREMENT.md §§9–12, 14–15 — written BEFORE sims)

- **Question**: on the standard substrate, which inflow channels do NOT
  throttle when the pantry is full, and how does each channel's inflow
  dose-respond to pantry fresh-days and to doomed stock?
- **Channel set** (call-path, from engine code): `duty:forage`,
  `duty:garden`, `duty:fish`, `duty:hunt` (resolveOneAssignment —
  forage/garden/fish PRODTHROTTLE-governed, hunt not); `share_surplus`
  (villagerMealDay → stockSurplus — the autonomous funnel);
  `away_wild` (npcNodeTravel — away-NPC returns); `scholar_home`
  (returnToVillage/returnToOldVillage — scholar expedition homecoming);
  `ambient:villagelives` (villageLives — BIG DAY hauls etc.);
  `traps` / `haul:field` (objReturnEffect); `quest`, `events:ambient`,
  `events:special`, `aid_system`, `donation`, `tribute`, `system`,
  `internal:meal` (leftovers re-deposit), `unattributed` (fallback —
  must be <1% of chokeTotal or the instrument is dishonest).
- **Throttle metric** (binding): per-channel mean kcal/day on glut dawns
  (dawn freshDays ≥ 7) vs lean dawns (≤ 2). A channel "does NOT throttle
  when the pantry is full" if its glut/lean ratio ≥ 0.80; it "throttles"
  if the ratio ≤ 0.50; else PARTIAL. (Duty forage/garden/fish are
  expected to THROTTLE — the PRODTHROTTLE is their named mechanism; the
  question is which OTHER channels keep feeding a full pantry.)
- **Doomed-stock dose-response** (binding): per-channel mean kcal/day vs
  dawn doomed kcal buckets (0 / 1–2k / 2k–10k / >10k). Doomed = fresh
  kcal with effective spoilDay == day+1 at dawn (rots at tomorrow's dawn
  before any meal — the feastdraw definition).
- **Permanent-glut config** (binding): a run with ≥ 40% of lived days at
  dawn freshDays ≥ 7. Marginal glut inflow = pooled inflow by channel on
  glut days, shares of total.
- **Full-attribution target** (binding): ≥ 99% of choke-point inflow in
  named channels (instrument-honest, proven by scripts/test-glutprobe-b.js
  GREEN + det-gate byte-identical before the sweep).
- **Seeds**: 8 FRESH seeds 8801–8808 × {leadfeast, belongfeast} = 16 runs;
  freshness asserted inline against the banned/used list in the sweep.
- **Substrate**: leadfeast/belongfeast + FEASTSCALE_R13=1, SEATDRIVE=0
  explicit, SURPLUSFEED unset (asserted; sweep exits on mismatch).
- **Horizon**: 180d death-aware (dead villages stop, +10d tail max) —
  matches every prior food-economy arm; glut dynamics need long horizons.
- **DIAG-GO** (binding — "question answered with full attribution"): ALL
  of (a) ≥ 99% of total inflow in named channels; (b) glut and lean
  buckets each ≥ 30 pooled day-pairs (else NO-GO — under-powered); (c)
  permanent-glut configs identified; (d) unthrottled channels NAMED with
  ratios; (e) a named production-side next. NO-GO: instrument dishonest
  or buckets under-powered — documented, not re-scored.

## Canon

- docs/CANON.md + docs/PRESERVATION.md read first. This is a diagnostic:
  no game code touched, no policy layers built. "Rot can't be smoked back
  into food" untouched; instrumented paths (stockPantry, stockSurplus,
  depositPantryPieces, sweepSpoiled) are wrapped read-only and call
  through.
- Existing governors in the engine (context for the taxonomy): PRODTHROTTLE
  (game.js:14954 — `pantryFreshDays() > 4` redirects duty forage/garden/
  fish to wood/water/stone; hunger-exempt at hungryStreak ≥ 3); the pantry
  CAP (food.js pantryCapKcal, 120,000 kcal — binds stockSurplus); the
  landed-but-OFF SURPLUSFEED governor (default OFF — NOT this substrate).

## Instruments

- scripts/probe-glut-instruments.js — shared instrument module: attachProbe
  applies all wraps; channel stack pushed by entry-function wrappers
  (duty task, funnel, away, scholar home, ambient life, traps/haul,
  quests/events, aid, donations); choke-point recorders on stockPantry /
  stockSurplus / depositPantryPieces (record what actually entered, tag
  arrivals _diagCh/_diagArr for rot attribution); sweepSpoiled
  identity-deduped rot by arrival channel + ≤3d fast-rot; PRODTHROTTLE
  sensor; duty smoke-drive throughput + laundering; dawn sensor in sleep
  (freshDays, doomedKcal, burnAvg, roster); econ say() capture (capped);
  kind-aware deaths. KNOWN LIMIT: merged units inherit the first arrival
  tag (fungibility by design) — rot-by-channel is exact for never-merged
  arrivals, approximate for merged ones; INFLOW attribution is by call
  path and exact.
- scripts/test-glutprobe-b.js — proof: RED (pristine: no tags), GREEN
  (2 seeds × 25d: chokeTotal > 0, channels sum === chokeTotal,
  unattributed < 1%, dawnSamples carry freshDays+doomedKcal, ≥4 named
  channels), DET (40d × 2 seeds instrumented vs pristine byte-identical
  canonical projection). **13/13 GREEN before the sweep.**
- scripts/probe-glut-b.js — 16-run sweep (env asserts, seed-freshness
  assert inline, 180d death-aware). Per-seed JSONs carry top-level
  won/national/table.
- scripts/analyze-glut-b.js — dose-response aggregator (the pre-registered
  buckets and verdict bands are encoded here, written before the sweep).
- scripts/sense-glut-b.js — transcript dump for the sense read.

[RESULTS — sweep complete 2026-10-20 ~12:05 CDT]

## Results

16 runs (8 fresh seeds 8801–8808 × {leadfeast, belongfeast}, 180d death-aware,
FEASTSCALE_R13=1/SEATDRIVE=0/SURPLUSFEED-unset; freshness asserted inline,
all banned-list clean). 2282 pooled day-pairs. Corpus:
evidence/2026-10-20/perseed-glutprobe-b/{leadfeast,belongfeast}.json;
aggregate: evidence/2026-10-20/glutprobe-analysis.json.

Instrument honesty: **unattributed = 0.00% on all 16 runs** — 100% of the
12.5M kcal choke-point inflow sits in named call-path channels (binding
target ≥ 99%: MET).

### Dose-response vs pantry fresh-days (mean kcal/day/channel, pooled)

| channel | lean ≤2 | 2–4 | 4–7 | glut ≥7 | verdict |
|---|---|---|---|---|---|
| share_surplus | 1,675 | 2,798 | 2,616 | 4,345 | DOES-NOT-THROTTLE (2.59x) |
| tribute | 270 | 164 | 403 | 549 | DOES-NOT-THROTTLE (2.03x) |
| away_wild | 285 | 143 | 158 | 369 | DOES-NOT-THROTTLE (1.29x) |
| ambient:villagelives | 222 | 232 | 327 | 339 | DOES-NOT-THROTTLE (1.53x) |
| scholar_home | 17 | 31 | 35 | 151 | DOES-NOT-THROTTLE (8.72x) |
| traps | 8 | 8 | 15 | 23 | DOES-NOT-THROTTLE (2.78x) |
| duty:fish | 588 | 536 | 16 | 26 | THROTTLES (0.04x) |
| duty:forage | 4 | 0 | 0 | 0 | THROTTLES (~0) |
| duty:hunt / duty:garden | 0 | 0 | 0 | 0 | UNSTAFFED (0 kcal in 16 runs — see below) |
| aid_system | 207 | 101 | 92 | 70 | THROTTLES (0.34x — lean-responsive aid, the good direction) |
| events:ambient | 16 | 16 | 19 | 20 | flat / tiny |

n-day-pairs: lean 417, 2–4: 170, 4–7: 212, glut 1483. Pearson(dawn
freshDays, same-day inflow) = **+0.26** — inflow is pro-cyclical overall
(same direction as the 2026-10-20 observational run's +0.49).

The funnel's curve is SMOOTH through the PRODTHROTTLE threshold: 2.8k at
2–4 days → 2.6k at 4–7 → 4.3k at ≥7. The throttle's >4-day kink binds only
the duty curves (fish collapses 536 → 16 across the same boundary). The
autonomous funnel has no feedback — visible in the table, not inferred.

### Dose-response vs dawn doomed stock (mean kcal/day/channel, pooled)

| channel | doom 0 | 1–2k | 2k–10k | 10k+ |
|---|---|---|---|---|
| share_surplus | 2.0k | 3.1k | 4.9k | 6.3k |
| away_wild | 249 | 262 | 375 | 547 |
| scholar_home | 26 | 55 | 185 | 221 |
| traps | 8 | 15 | 26 | 48 |
| tribute | 253 | 350 | 677 | 356 (noisy, n=87) |
| duty:fish | 405 | 44 | 9 | 0 |
| ambient:villagelives | 269 | 355 | 328 | 310 (flat) |

The channels that feed the doomed pile most are the ones that never look at
it: share_surplus triples into the 10k+ doomed bucket while duty:fish —
the one channel that DOES respond — falls to zero exactly as the doomed
pile grows. The pile is fed by the ungoverned channels and cleared by none.

### Permanent-glut configs (≥40% of days at freshDays ≥ 7): ALL 16 RUNS

glutShare 0.51–0.92, mean fresh-days up to 93.8 (lead 8802), 80.4 (lead
8804), 65.3 (belong 8801). Permanent glut is the NORM on this substrate,
not the exception — the village lives at ≥7 fresh-days on the majority of
days in every config. (The two early collapses — lead 8807 54d,
belong 8804 45d — are glut the whole short way down; same class as
feastdraw's 6208 seed.)

### Marginal glut inflow attribution (1483 glut-days, 8.75M kcal)

| channel | kcal | share |
|---|---|---|
| share_surplus | 6,443k | 73.7% |
| tribute | 815k | 9.3% |
| away_wild | 548k | 6.3% |
| ambient:villagelives | 503k | 5.7% |
| scholar_home | 225k | 2.6% |
| aid_system | 104k | 1.2% |
| duty:fish | 39k | 0.4% |
| traps | 34k | 0.4% |
| events | 36k | 0.4% |

### The named unthrottled channels (binding question, answered)

Channels that do NOT throttle when the pantry is full (glut/lean ≥ 0.80):

1. **share_surplus — 2.59x** (73.7% of marginal glut inflow). The
   autonomous villager-production funnel. No pantry feedback in code
   (villagerDayProduction game.js:28165 → villagerMealDay → stockSurplus);
   the curve is smooth through the throttle threshold.
2. **tribute — 2.03x** (9.3%). Subordinate grain. Rises with village
   standing; the d51 transcript shows tribute grain itself rotting
   ("Tribute grain from Thornfield, Tribute grain from Stonebridge"
   thrown out).
3. **away_wild — 1.29x** (6.3%). Away-NPC returns. No pantry check on
   return; foragers walk into 100-day pantries with +500 kcal hauls daily.
4. **ambient:villagelives — 1.53x** (5.7%). BIG DAY hauls and villager
   life events. Autonomous, ungoverned.
5. **scholar_home — 8.72x** (2.6%). Scholar expedition homecomings. Small
   absolute, steep ratio.
6. **traps — 2.78x** (0.4%). Small absolute; never throttles.

Channels that DO throttle: **duty:fish (0.04x)** and **duty:forage (~0)**
— the PRODTHROTTLE's named mechanism, measured at 86.9% engagement
(4405/5068 calls); **aid_system (0.34x)** — lean-responsive aid, the good
direction, not a glut driver.

**duty:hunt and duty:garden: 0 kcal in all 16 runs — UNSTAFFED, not
throttled.** No policy in the competent family assigns the hunt duty
(grep: zero 'hunt' assignments in competent/feastscale/belongseek/
leadcourt/kitchen). The hunt channel is scholar-only on this substrate.
Throttle verdicts do not apply to a channel that never fires.

### Wall numbers

won 0/16, national 4/16, table 10/16, wave-4 12/16, wave-5 0/16, median
154d, max 180d. The wall stands (zero wins, wave-4 ceiling, pre-seat).
This diagnostic does not attack the wall.

Death causes (224 total): combat 118, monster 48, wounds-that-wouldn't-
close 16, starvation 14, sickness 10, dehydration 6, ambush 4, contest 3.
Villages die fighting; starvation days (all runs starveD=0 — the glut
substrate) don't even register.

### Village assessment (plain words)

Sixteen villages on the standard pre-seat substrate, and every single one
lives in permanent glut — 51–92% of days at 7+ fresh-days, pantries at
50–115k kcal, the dawn sweep throwing out spoiled stores daily. The
village is not starving; it is drowning, and it keeps pouring.

Who thrives: nobody in particular — the glut is structural, not earned.
The four national-reaching configs (lead 8802/8803/8804/8805) are the
gluttiest (glutShare 0.51–0.92); the two early collapses (lead 8807,
belong 8804) die at 45–68d while sitting on 8–11 fresh-days — killed by
combat/monsters with full shelves, the same "die rich" shape the
windowsurvive diagnostic named.

What the village looked like: a machine with one honest governor and five
open taps. The duty throttle works and reads as a person — Ananya checks
the pantry at ~119 fresh-days and turns to the stone pile. The funnel,
the away-foragers, the tribute bearers, the BIG DAY heroes, and the
trappers never check at all. The cook's smoke drive runs 1.59M kcal
through the racks across the corpus, but the racks cap (~47–50k) is the
bottleneck — "the racks are already full… so Emma left the fresh pile
for tonight's dinner instead of smoking it onto the rot pile" — and the
fresh pile's only remaining exit is the dawn sweep.

Which blank I filled: the taxonomy. The 2026-10-18 mechanism map named
share_surplus as the ungoverned channel from code-reading; the 2026-10-20
observational run measured the lean/fat split with a known instrument
limit. This run's call-path instrument closes the loop: per-channel
dose-response curves vs fresh-days AND vs doomed stock, marginal glut
inflow fully attributed (100.00% named), six unthrottled channels named
with ratios, the duty channels' throttle measured, and the hunt duty
exposed as unstaffed on this substrate. The #570 question — "why does
the village over-produce into gluts it cannot eat" — is now answered
with numbers: it over-produces because five of its six inflow channels
have no pantry feedback, and the one governed channel (duties) is the
smallest.

## Sense-testing (SENSE-TESTING LAW — read, not counted)

Transcript: evidence/2026-10-20/glutprobe-sense.txt (leadfeast 8805, 60d —
glutShare 0.92, rot 460k by d124).

**Verdict: the over-production reads as a MISSING FEEDBACK LOOP, not as
villagers behaving like people.**

What reads as people: the PRODTHROTTLE redirect ("the shelves are full,
~46 days of fresh on hand… leaves the fish nets standing and turns to
the water run instead. The pantry can't take more; the wild will keep.")
— a villager making a sensible, voiced call. The glut's cost is narrated
honestly every dawn ("The village threw out spoiled stores: Foraged
food"), and the raids punish it in-fiction ("drawn by the smell of the
pantry!", "They carried off ~1400 kcal from the pantry").

What reads as machinery: the funnel's 6–9k/day arrives with NO voice, no
pantry check, no decision — and no cultural beat that would make it a
choice (no "we're stocking for the cold" — the d6/d30 cold snaps pass
without a stockpile motive; no crew-lead ambition voiced). The
away-foragers are the sharpest tell: named people with voiced departures
("Bringing dinner back. One way or another.") walk home into a 106-day
pantry with +574 kcal hauls and deposit them without a glance at the
shelves. Nobody in the fiction ever asks whether the pantry needs it.
The tribute is the same: "Tribute from Stonebridge arrives — 3,000 kcal
of grain into the pantry. Their fields, our fire" — and three weeks
later the same grain goes out in the dawn sweep.

Two polish notes (voice follow-up candidates, not this diagnostic): (1)
the racks-full beat repeats with the same stuck figure (~47–50k) day
after day — same stuck-gauge note as the 2026-10-20 prodrebound sense
read; (2) "A person, maybe 40s, with a slouched posture" — the unnamed
villager descriptor repeats verbatim across days for the throttle beat
(the same villager, presumably, but the fiction never names them).

## Blanks filled / documented

- **FILLED (finding)**: per-channel dose-response taxonomy with full
  attribution (100.00% named on all 16 runs) — the six unthrottled
  channels named with glut/lean ratios; the duty throttle measured at
  86.9% engagement; the funnel's curve smooth through the throttle
  threshold; the doomed-stock curves showing the ungoverned channels
  feeding the pile the throttle can't see.
- **FILLED (finding)**: permanent glut is the NORM on the FEASTSCALE_R13
  substrate (16/16 configs ≥ 40% glut days) — not the feastdraw run's
  two-seed exception. The marginal glut inflow: share_surplus 73.7%,
  tribute 9.3%, away_wild 6.3%, ambient:villagelives 5.7%.
- **FILLED (finding)**: duty:hunt and duty:garden contribute 0 kcal on
  the standard substrate — unstaffed by every policy in the competent
  family. The hunt channel is scholar-only here. (Reachability note for
  the axis: hunting as a village duty is decoration on this substrate.)
- **FILLED (finding)**: sense verdict — the over-production is a missing
  feedback loop, not villager culture. The duty throttle is the only
  voiced, person-like governor; the funnel/away/tribute channels are
  machinery with no pantry check.
- **DOCUMENTED (instrument)**: scripts/probe-glut-instruments.js —
  call-path channel attribution (fixes the 2026-10-20 observational
  instrument's merged-tag smear); proof 13/13 GREEN + det-gate
  byte-identical. Reusable for future dose-response diagnostics.

## Named nexts (for the food-economy axis)

1. **sim-surplusfeed-curvecheck** (diagnostic, instrument-only — reuse
   this run's instrument): the SURPLUSFEED governor is landed in-engine
   but default-OFF, and nobody has measured whether it bends the
   share_surplus dose-response curve. Run this exact sweep with
   SURPLUSFEED=1: pre-register share_surplus glut/lean ratio ≤ 1.5x
   (control 2.59x) with lean-day inflow ≥ control (must not touch the
   lean answer) and fast-rot ≤ control. If the curve bends, the governor
   is the production-side lever the taxonomy points at; if it doesn't,
   the funnel needs a structural (game-code) governor and the axis
   should stop circling it.
2. **Away-return intake discipline** (design question): away_wild
   (1.29x, 6.3% of glut inflow) and scholar_home (8.72x) deposit into
   full pantries with no check. The realistic feedback is at the return:
   eat from the haul on the trail / leave the surplus standing where it
   grew (the SURPLUSFEED rationale, extended to returns). Policy-side
   shape, default OFF.
3. **Tribute intake** (design question): tribute (2.03x, 9.3%) rots in
   the pantry by name. Refusing tribute has diplomatic cost — the lever
   is a diversion (tribute → feast/relations), not a refusal. Needs a
   design call before any arm.
4. **Hunt-duty staffing** (reachability): duty:hunt is unstaffed on the
   competent substrate. If the axis wants hunting as a village channel,
   a policy must staff it first — currently any "hunt lever" would be
   measuring a dark channel.

## Metric review (§14)

- The pre-registered DIAG-GO bar is MET on all five clauses: (a) 100.00%
  named (≥99%); (b) glut 1483 + lean 417 day-pairs (≥30 each); (c) 16/16
  permanent-glut configs; (d) six unthrottled channels named with ratios;
  (e) named nexts above. No re-scoring was needed or done.
- The permanent-glut bar (≥40% of days at freshDays ≥ 7) caught all 16
  runs — calibrated from the feastdraw backfire seeds (60–75% trigger
  nights), it turned out to describe the substrate's normal state, not
  an exception. The bar did its job (found the configs); the
  interpretation updated: glut is structural here.
- The throttle verdict bands (≥0.80 / ≤0.50) classified every channel
  cleanly — no channel landed in the PARTIAL band. aid_system (0.34x) is
  the only "throttles" verdict that is not a governor: it is
  lean-responsive aid (relief flows to lean villages), the good
  direction — the band measures direction-agnostic response, and the
  interpretation notes the sign.
- Pearson(fd, inflow) = +0.26 vs the 2026-10-20 observational run's
  +0.49: same pro-cyclical direction, weaker magnitude — different fresh
  seed set, same substrate family. Not a contradiction; a replication
  with the expected seed wobble.

## Convergence state

**DIAG-GO.** #570's production-rebound question is answered with full
attribution: the village over-produces into gluts because five of its
six inflow channels have no pantry feedback (share_surplus 2.59x,
tribute 2.03x, away_wild 1.29x, ambient:villagelives 1.53x,
scholar_home 8.72x, traps 2.78x); only the duty channels throttle
(PRODTHROTTLE, 86.9% engaged) and aid is lean-responsive. The funnel's
curve is smooth through the throttle threshold — the missing governor is
visible in the table. Permanent glut is the substrate's normal state
(16/16 configs). Named next: measure the landed SURPLUSFEED governor's
effect on the dose-response curve before any new production-side build.
food-economy stays converging; no scale-wall movement (wins 0/16,
wave-5 0/16 — pre-seat substrate).
