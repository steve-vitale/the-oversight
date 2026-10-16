# SIM-AIDFEASTINT-B — the aid×feast interaction factorial (loop B, food-economy)

Date: 2026-10-16 · Loop: oversight-flesh-out-loop-b · Worker tree: sim-aidfeastint-b
Run: fleshout-loop-b-20261016T2130Z · Axis: food-economy (scale-wall lens).

## The question

The aidspoil driver's 4x rot reduction (799k vs 3,144k, identical seeds/master)
is explained by NEITHER verb alone (aid-only 1.014x null at pilot —
sim-aiddrain-b; feast-only 1.114x null at pilot — sim-feastdrawdown-b), and
sim-floorday3-b eliminated the 2-day-floor hypothesis. Remaining hypotheses:
an aid×feast INTERACTION, or a driver-level trajectory effect. This arm is a
DIAGNOSTIC factorial, not a lever revival.

## Pre-registration (docs/MEASUREMENT.md §§9-12, 14 — binding, written BEFORE sims)

- **Design**: 2x2 factorial — cells {neither, aid-only, feast-only, both} ×
  8 FRESH seeds [3201-3208] (verified absent from all evidence/**/perseed*/
  filenames; the 3201-3208 hits in evidence file CONTENTS are coincidental
  kcal values, e.g. "gave":3201) × {leadfeast, belongfeast} = 64 runs,
  180d death-aware, pre-seat courtship (SEATDRIVE=0 explicit),
  FEASTSCALE_R13=1. Own in-sweep comparisons: identical seeds across all 8
  cells. Env gates flip per cell in-process (drivers read them at call time).
- **Rebuilt layers** (diagnostic only): both the aid-only driver
  (scripts/policies/aiddrain.js, AIDDRAIN=1) and the feast-only driver
  (scripts/policies/feastdrawdown.js, FEASTDRAWDOWN=1) were KILLED per
  protocol and their layers DELETED — but the files were never committed to
  git history (workers built them uncommitted and deleted them uncommitted;
  the kill commits only landed instruments + evidence). Rebuilt verb-verbatim
  from the killed arms' specs + the kept proof scripts, each behind its own
  default-OFF env gate. The rebuilt layers are DELETED again after
  measurement (zero-trace); only instruments + this evidence persist.
- **PRIMARY** = interaction term on aggregate absolute fresh-rot kcal on the
  LEAD road (the road the whole aidspoil lineage ran on):
  I = (both/neither) / ((aid/neither) × (feast/neither)).
  **GO = I ≤ 0.7** (interaction exists and is rot-reducing).
  **KILL otherwise → verdict: driver-level trajectory effect, the verb space
  is closed.** The belong road is a replication secondary.
- **VALIDITY (engagement floor — the drawvol-confirm lesson: a rare-event
  lever needs a channel-availability floor, not an absolute count)**: the
  both-cell must engage comparably to the aidspoil driver's own engagement
  (47 aids + 22 feasts on 8 leadfeast seeds). Floor = both-cell aggregate
  across the 16 both-cell runs: ≥ 24 aid verbs AND ≥ 8 driver feasts, AND the
  overstock trigger (fresh-days > 4) available on ≥ 32 run-days. If the floor
  is missed, the verdict is **"inconclusive — channel starved"**, NOT the
  trajectory verdict.
- **GUARDRAILS** (per road vs own neither): national ≥ neither−2;
  starvation deaths ≤ neither+2; hungryDays ≤ neither × 1.409 (#208);
  no new death mode (n≥3); social-verb sanity: both-cell aid verbs ≥ 0.5 ×
  aid-cell verbs, both-cell driver feasts ≥ 0.5 × feast-cell feasts
  (the drivers must not suppress each other); median survival report-only.
- **SECONDARY**: belong-road interaction, wall numbers
  (national/table/wins/exiled, Arc reach, waves 1–5, median/max survival,
  death-cause shares), per-seed both/neither ratios (near-zero guard:
  ratios suppressed when the control seed rotted < 5k), trigger-availability
  vs engagement, fresh-days distribution, pantry peaks, cliffs.
- **Det-gate**: gates-off byte-identical wrapper-vs-parent for all 4 new
  wrappers (8/8 seeds × 40d), armed determinism per wrapper — before trusting
  any comparison. SMOKE=1 honesty gate (all 8 cells drive) before measuring.
- **Seeds**: [3201-3208] × 8 cells. Confirm: none — this is a diagnostic;
  the 8 seeds ARE the measurement (pilot-sized per the task brief).
- **Metric-review note (§14)**: the interaction threshold 0.7 is set against
  the driver-level effect size: the aidspoil driver measured ~0.25×
  (799k/3144k) with single-verb ratios 1.014× (aid) and 1.114× (feast) —
  implying I ≈ 0.22 if the interaction fully explains it. The 0.7 bar demands
  a substantial rot-reducing interaction while tolerating noise; a miss is
  NO-GO, never re-scored. The pooled-primary alternative (both roads pooled
  by raw kcal) was rejected: pooling raw kcal across roads lets the bigger
  road dominate; the lead road is where the 4x was measured.

## Proof results (run BEFORE any sims)

Rebuilt-layer verification, all green, independently re-run:
- scripts/test-aiddrain-20261015.js (kept): RED 6/6 + ARMED 24/24 — the
  rebuilt aid driver is verb-verbatim (1500-kcal tendLink, thin channel,
  floor 78214 on the fixture, beat ordering tend@0 cause@1, siege gates,
  no-tribute negative, conservation, one-verb/day, armed determinism).
- scripts/test-feastdrawdown-20261015.js (kept): RED 6/6 + ARMED 22/22 —
  the rebuilt feast driver is verb-verbatim (5000-kcal hostFeast, floor
  math 78000, 3-day floor binds/refuses correctly, siege gates, own
  _fdLastFeastDay / shared _fsLastFeastDay untouched, no double-feast,
  inert without FEASTSCALE_R13).
- scripts/test-aidfeastint-20261016.js (new): B1 belong variants gate-off
  byte-identical (4/4), B2 both-cell gate-off byte-identical (2/2),
  B3/B4 single verbs fire on the belong road, B5 both-cell fires aid +
  feast the same day (pantry 150000→143500, no double-feast, both cause
  lines after their verbs), B6 both-cell armed determinism — all pass.
- scripts/det-gate-aidfeastint-20261016.js: all 4 new wrappers gates-off
  byte-identical 8/8 + armed determinism 8/8 — GREEN (64 × 40d runs,
  ~6.6 min; implies ~28s per 180d sweep run).
- SMOKE=1: all 8 cells drive (daily + upkeep invoked, pacing > 0) — green
  before measuring.

## Sweep results

64 runs (8 cells × 8 fresh seeds [3201-3208]), 180d death-aware,
SEATDRIVE=0, FEASTSCALE_R13=1, own in-sweep comparisons (identical seeds
across all cells). Sweep exit 0; 64/64 per-seed JSONs carry exact numeric
keys national/table/wins/exiled (schema-drift check: 0 drifts).
Det-gate green + SMOKE green before measuring (see Proof results).

Aggregate absolute fresh-rot kcal:

| road | neither | aid-only | feast-only | both | aid/n | feast/n | both/n |
|---|---|---|---|---|---|---|---|
| lead | 3305.2k | 4445.3k | 2432.9k | 2571.1k | 1.345 | 0.736 | 0.778 |
| belong | 2200.9k | 2200.9k | 2409.7k | 2409.7k | 1.000 | 1.095 | 1.095 |

Per-seed lead-road fresh-rot (k): s3201 177/249/157/218 · s3202
263/305/206/359 · s3203 362/117/76/232 · s3204 1172/1236/727/727 · s3205
444/506/462/405 · s3206 541/654/343/298 · s3207 349/1282/129/252 · s3208
~0/95/333/79 (neither near-zero — ratio suppressed per the aiddrain
near-zero lesson). Per-seed both/neither: 1.24, 1.37, 0.64, 0.62, 0.91,
0.55, 0.72, nz — direction flips by seed, the familiar noise signature.

**PRIMARY (lead road)**: I = 0.778 / (1.345 × 0.736) = **0.786** — MISS
(needs ≤ 0.7). **KILLED per §14.** Belong replication: I = 1.000.

**VALIDITY FLOOR**: both-cell aggregate (16 runs): 62 aid verbs (floor 24
✓), 221 driver feasts (floor 8 ✓), overstock trigger available on 1833
run-days (floor 32 ✓). Floor MET — the interaction verdict is
interpretable. (Belong contributed 0 aids: the thin-link channel never
materialized there — see Villagers/metric review.)

**GUARDRAILS** (all held — clean kill, not harm):
- lead: national 8 vs 7 (need ≥ 5 ✓); starvation 8 vs 11 (need ≤ 13 ✓);
  hungryDays 20 vs 20 (need ≤ 28 ✓); wave5 0 vs 0; social-verb sanity
  62 ≥ 36 ✓ / 114 ≥ 58 ✓.
- belong: national 8 vs 5 (need ≥ 3 ✓); starvation 2 vs 5 (need ≤ 7 ✓);
  hungryDays 18 vs 26 (need ≤ 37 ✓).

Engagement detail: lead both-cell 62 aids/114 driver feasts vs aid-cell
71 / feast-cell 116 — the drivers do not suppress each other in the
both-cell. The feast-alone cell's 0.736 on these seeds vs the pilot's
1.114 is seed heterogeneity (pilot per-seed range 0.19–2.10); the
interaction term is robust to it by construction (identical seeds,
same sweep). Note the aid-alone 1.345 HELPS the interaction look
rot-reducing (denominator 0.99 vs 0.736) — even with that help, I = 0.786
misses. The miss is robust.

## Sense-testing (SENSE-TESTING LAW — read, not counted)

Both-cell re-runs on the 3 largest |both−neither| rot-delta seeds per road
(deterministic per det-gate — same seed, same beats), ~10 beat samples
around each seed's largest rotByDay days. Full transcript:
evidence/2026-10-16/aidfeastint-sense/aidfeastint-sense-beats.txt.

The beats around the rot cliffs read as a village drowning in its own
surplus, and the village knows it:
- "The village threw out spoiled stores: Foraged food. Natalia mutters:
  'Should've smoked that. Fresh stuff keeps a day or two on the shelf —
  the smoke rack is right there.'" (d38, seed 3204) — the rot is narrated
  with a sensible in-fiction complaint, named villager, right after the
  throw-out. Coherent.
- "🌿 Aki checks the pantry before heading out — the shelves are full,
  ~47 days of fresh on hand… leaves the fish nets standing and turns to
  the stone pile instead. The pantry can't take more; the wild will
  keep." — foragers self-regulate intake against the stockpile. The
  village's own feedback loop works; the rot is a STOCK problem (what's
  already there spoils), not a flow problem.
- "🍲 Natalia cooked for the haven — meals stretched. The racks are
  already full (20,100 kcal kept — more than the haven can eat before it
  turns), so Natalia left the fresh pile for tonight's dinner instead of
  smoking it onto the rot pile." — preservation is blocked by full racks;
  the ladder's top rungs are unreachable when the bottom overflows.
- The driver's feast cause line slots naturally after the engine's feast
  beat: "🍖 FEAST 📺 — Rafael opens the pantry wide: 8× Foraged food…
  eat until the fire burns low." → "🍖 The shelves groan — ~47 days of
  fresh on hand, and the rot is already circling. We eat the mountain
  tonight, or it eats itself." (d38, seed 3204) — the WHY after the WHAT,
  honest count, reads as a village deciding. The feast then draws a
  scavenger ("Sunback is circling the edge of the light. It followed the
  feast here.") — the engine's played consequences fire around the
  driver's verb. Nothing robotic in the driver lines.
- Aid beats (lead road): the engine's tend beat with named subordinates
  and the driver's "not the rot" cause line after — same honest pattern
  as the aiddrain arm.

**PASS** with two documented observations (out of arm, pre-existing):
(1) the "checks the pantry… leaves the [fish nets/harvest] standing and
turns to the [stone pile/wood run/water run] instead" beat repeats with
only the task swapped — mild engine-beat repetition, varying but
templated; (2) the rot cliffs happen while foragers are ALREADY standing
down — the village's intake brake works, but nothing draws the stockpile
down except rot and the driver's teaspoons. That is the trajectory story
in miniature: the aidspoil driver's 4x lives in how the run's trajectory
fills (or doesn't fill) the pantry, not in the verbs.

**Documented blank (out of arm)**: the pantry-check beat's templated
repetition — filed, not chased.

## Villagers as people

Sampled villager behavior out of the sims via the both-cell beats
(sense-testing) and the social-verb telemetry. The aid verbs landed on
named thin subordinates with the engine's own tend beats (named
recipients, varying whole-unit amounts 1500/1550/1600/4000/4600 from
over-removal on big-unit stacks — the same honest variance the aiddrain
arm documented), each followed by the driver's cause line after the
confirmed verb. The feast verbs ran through the engine's hostFeast (named
villagers open, varying menus). Nothing robotic in the driver lines; the
pre-existing engine tend-beat voice repetition (byte-identical every
tend) remains documented and unchased. The belong road's zero-aid
finding is itself a people-finding: belongseek's membership dynamics
never form the haven-primary thin-subordinate links the aid verb needs —
the village's relationships, not the driver's gates, closed the channel
(trigger available 796–847 run-days, siege-gate held 459 times, aids 0).

## Wall numbers (every run)

| cell | national | table | wins | w4 | w5 | median | max | exiled | maxArc |
|---|---|---|---|---|---|---|---|---|---|
| lead_neither | 7/8 | 6/8 | 0/8 | 0/8 | 0/8 | 152d | 180d | 0 | 4 |
| lead_aid | 8/8 | 7/8 | 0/8 | 1/8 | 0/8 | 180d | 180d | 0 | 4 |
| lead_feast | 7/8 | 8/8 | 0/8 | 0/8 | 0/8 | 146d | 180d | 0 | 4 |
| lead_both | 8/8 | 7/8 | 0/8 | 0/8 | 0/8 | 160d | 180d | 0 | 4 |
| belong_neither | 5/8 | 7/8 | 0/8 | 0/8 | 0/8 | 155d | 180d | 0 | 4 |
| belong_aid | 5/8 | 7/8 | 0/8 | 0/8 | 0/8 | 155d | 180d | 0 | 4 |
| belong_feast | 8/8 | 8/8 | 0/8 | 1/8 | 0/8 | 163d | 180d | 0 | 4 |
| belong_both | 8/8 | 8/8 | 0/8 | 1/8 | 0/8 | 163d | 180d | 0 | 4 |

No wins in 64 runs. The table seats (54/64 combined) but nobody wins.
Wave-4 barely unlocks on these seeds (3/64 total; wave-5: 0/64) — much
harsher than the 11–88 seed set (wave-4 8/8 in the pilots). The scale
wall stands on both roads: villages reach national and the table but
not the win, and wave 4/5 are decoration on this seed set.

## Death-cause shares

Both-cell (16 runs, 836 deaths): combat 541 (65%), villager combat 129
(15%), monster 100 (12%), expedition 17 (2%), contest 12 (1%), sickness
10 (1%), starvation 10 (1%), a wound that wouldn't close 7 (1%),
remainder <1% each. Neither (16 runs, 744): combat 429 (58%), villager
combat 126 (17%), monster 98 (13%), expedition 18 (2%), starvation 16
(2%), sickness 12 (2%), a wound that wouldn't close 11 (1%), contest 10
(1%). Same families — no new death mode (every n≥3 category exists on
both sides). Villages die of violence, not hunger, on both sides; the
both-cell starves slightly less (10 vs 16). Death capture worked on this
harness path (the aiddrain instrument gap did not reproduce).

## Village assessment (plain words)

Sixty-four villages, two roads, one story: the pantry rots on its own
weather and the verbs are teaspoons. On the lead road the both-cell
fired 62 honest aids and 114 honest feasts — 176 real verbs, real kcal,
real narration — and rotted 2571k against the neither-cell's 3305k.
The feast-alone cell rotted 2433k; the aid-alone cell rotted 4445k.
The both-cell is the feast cell plus noise. There is no synergy hiding
in the combination: the interaction term lands at 0.786, above the 0.7
bar, and the per-seed direction flips (0.55–1.37) the way it always does
in this lineage.

Who thrived: the villages that reached national (7–8/8 on lead, 5–8/8
on belong) did it on every cell — the drivers changed no trajectory.
The aid fed real grain to thin subordinates (+8 trust a tend, 62 tends
on the lead both-cell) — the social ledger moved, the rot ledger didn't.
Who died: the same combat/monster/raider deaths in the same proportions
on all cells; starvation stayed marginal (8–11 on lead across cells,
2–5 on belong). The blank this run fills is the one the task named: the
aidspoil driver's 4x (799k vs 3144k) is explained by neither verb alone
nor by their interaction. The verb space is closed — whatever moved rot
in that driver is a driver-level trajectory effect (the driver's
presence reshaping the run's trajectory: pantry peaks, timing, the
composition of days), not the verbs.

The belong road added its own blank: the aid verb's channel is
road-dependent. On belong, the overstock trigger was open 796+ run-days
and the siege-gate held 459 times, but zero aids fired in 16 runs —
belongseek's membership dynamics never form the haven-primary
thin-subordinate links the tendLink verb requires. The aid is a
relationship verb; where the relationships don't exist, the verb is
decoration. That is a design fact about the roads, not a driver bug
(the B3 fixture proof fires the aid on belongfeast when a link exists).

## Blanks filled / documented

- **MEASURED, KILLED (diagnostic)**: the aid×feast interaction — the last
  unexplained rot driver on food-economy. 2×2 factorial (neither/aid/feast/
  both) × 2 roads × 8 fresh seeds [3201-3208], 64 runs, 180d death-aware,
  identical seeds across cells. PRIMARY I_lead = 0.786 > 0.7 → KILL.
  Validity floor met (62 aids ≥ 24, 221 feasts ≥ 8, 1833 trigger-days ≥ 32)
  — the null is interpretable, not channel-starved. Verdict: driver-level
  trajectory effect; the verb space is closed. The aidspoil driver's 4x is
  NOT aid, NOT feast, NOT aid×feast, NOT the 2-day floor (sim-floorday3-b).
- **REBUILT + RE-DELETED per diagnostic protocol**: scripts/policies/
  aiddrain.js and scripts/policies/feastdrawdown.js were rebuilt
  verb-verbatim (kept proof scripts: aid RED 6/6 + ARMED 24/24, feast RED
  6/6 + ARMED 22/22 — exact kcal, floor math, beat ordering, siege gates
  all reproduced) and DELETED again after measurement — zero-trace. Kept
  as instruments: scripts/test-aidfeastint-20261016.js,
  scripts/det-gate-aidfeastint-20261016.js,
  scripts/sweep-aidfeastint-20261016.js,
  scripts/analyze-aidfeastint-20261016.js,
  scripts/sense-aidfeastint-20261016.js, this evidence file,
  aidfeastint-sweep.json + 64 per-seed JSONs under
  evidence/2026-10-16/perseed-aidfeastint/ (+ aidfeastint-sense/).
- **DOCUMENTED** (design): the aid verb's channel is road-dependent — on
  the belong road the thin-subordinate channel never forms (0 aids in 16
  runs despite 796+ trigger-days and 459 siege-gate holds). The aid is a
  relationship verb; where the relationships don't exist it is decoration.
  Any future aid-side lever must check channel formation per road before
  measuring effect.
- **DOCUMENTED** (metric): the belong road cannot test aid×feast (I=1.000
  degenerate — aid never fired). The lead road is the valid interaction
  test; the belong road served as replication only for the feast verb.

## Metric review (§14)

1. **KILL stands — primary missed (0.786 vs ≤ 0.7).** No re-scoring. The
   factorial was the right size: 176 verbs fired in the lead both-cell,
   the engagement floor was met with margin (62/221/1833 vs 24/8/32), and
   the aggregate moved on identical seeds in the same sweep. This is a
   clean null, not an underpowered sniff test.
2. **The miss is robust to the friendliest re-read.** The aid-alone
   1.345× HELPS the interaction (denominator 0.99 vs 0.736); even so,
   I = 0.786. Dropping the near-zero s3208 seed moves I to 0.80 — still
   a miss. No alternative aggregation reaches 0.7.
3. **The feast-alone 0.736 vs the pilot's 1.114 is seed heterogeneity,
   not a contradiction.** The pilot's per-seed range was 0.19–2.10; these
   seeds' feast-alone per-seed range is 0.37–1.27 (ex-nz). The interaction
   term exists precisely to be robust to this — and it is: all four cells
   on identical seeds, same sweep, same master.
4. **The validity floor did its job.** The drawvol-confirm lesson demanded
   a channel-availability floor rather than an absolute count; the floor
   (24/8/32) was met at 62/221/1833, so "channel starved" is off the
   table and the trajectory-effect verdict is earned. The belong road's
   zero-aid is documented as a channel-formation finding, not a floor
   failure (the floor was pre-registered as a both-cell aggregate).
5. **Guardrail widths were right.** hungryDays ×1.409 and the national
   band never bound; starvation stayed marginal everywhere. The
   social-verb sanity check (both-cell ≥ 0.5× single-cell) confirmed the
   drivers don't suppress each other — the both-cell is a clean
   superposition, which is what makes the null interpretable.
6. **For the next arm on this lineage**: the verb space is closed. The
   remaining hypothesis is driver-level trajectory — the driver's
   presence reshaping the run (pantry peaks, day composition, timing).
   That is a different measurement (trajectory comparison: pantry-peak
   distributions, day-type composition, event timing), not another verb
   factorial. Do NOT re-run aid, feast, or aid×feast.

## Convergence state

food-economy: **killed-at-pilot** (aidfeastint — diagnostic factorial).
No rot-reducing aid×feast interaction: I_lead = 0.786 > 0.7 (validity
floor met — interpretable null). The aidspoil driver's 4x rot reduction
is not the aid verb (1.014×), not the feast verb (1.114×), not their
interaction (0.786), not the 2-day floor — it is a driver-level
trajectory effect. The verb space on this lineage is closed. Rebuilt
layers deleted zero-trace; instruments + evidence kept. food-economy
stays `converging`; prodthrottle remains the only landed rot lever.
