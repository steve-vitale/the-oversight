# SIM-WINDYIELD-B — portion-scaled windfall feast + the racks-thin yield (arm sim-windyield-b, loop B, food-economy)

Date: 2026-10-18 · Loop: oversight-flesh-out-loop-b · Worker tree: sim-windyield-b
Axis: food-economy (scale-wall lens) — REVIVAL of the killed portion-scaled
windfall feast (sim-portionwindfall-b: 0.774x rot; sim-portionwindfall-b2:
0.645x rot, killed on the retired 1.15x per-pair starve-rate bar;
sim-windfallrev-b: killed at pilot 0.821x with both reconciliations) with the
ONE differentiator from the b2 metric review's named next (2): the windfall
YIELDS to the duty smoke drive when racks are thin, and fires only when racks
are full. The loosened test of windfallrev's reconciliation (4) — its tight
conjunction (racks thin + pile <= 4000 + drive recently active) engaged 7
times and left the question unanswered ("loosen the engagement (drop the
drive-active fail-safe, or widen the budget) or kill the question").

## Pre-registration (docs/MEASUREMENT.md §§9-12, 14–15 — binding, specified in the work order BEFORE sims)

- **Question**: does the portion-scaled windfall, yielding to the duty smoke
  drive whenever racks are thin, cut rot under the dose-aware guardrails —
  and does the yield let the smoke drive absorb the doomed substrate (the
  -11% duty-preserved hint)?
- **Lever**: scripts/policies/windyield.js (WINDYIELD=1, default OFF;
  FOODLEVER pattern; wraps leadfeast/belongfeast), rebuilt EXACTLY per the
  sim-portionwindfall-b2 evidence spec: 300*roster doomed trigger, NO
  frequency cap, cost capped at 275*roster via the h most-trusted invitable
  guests (h = floor(275*roster/400) - 1; tiny-roster fallback invites
  everyone invitable), all feast gates kept (dusk, haven, one/day,
  affordability have>=scaledCost*1.5, contribution >=1500/7d via
  recentGives+recentTribute), doomed-fresh via the rot-accounting split
  (preserved/rendered/pemmican excluded; foodState-undefined stacks count —
  finding #546; spoiled excluded on the bonus-aware boundary), urgency-first
  draw via the engine's own hostFeast/pantryDraw (fresh-first; spoiled
  skipped — no laundering), cadence clock resets on a windfall, one honest
  voice line naming the why (byte-identical to the proven line).
- **THE YIELD** (the one differentiator, defined exactly): thin/full use the
  ENGINE'S OWN racks-full math (game.js cook duty, rackschannel-b finding
  #462): racksFull = preservedKcal >= 125*roster*max(1, ownShelf-2),
  ownShelf from the DUTY COOK's preserver skill (30+5*skill), 15 when
  unskilled or no cook assigned (assignments resolve before dusk, so the
  fallback is the common case — documented conservative); the FOODLEVER_R5
  stand-down respected. THIN (yield/skip): not racksFull — the windfall
  stands down (counted: _wyYieldSkips/_wyYieldSkipDays/_wyYieldDoomed,
  silent-by-design) and lets the duty smoke drive absorb the doomed pile.
  FULL (fire): racksFull — preservation saturated, the windfall fires. NO
  budget-fit requirement, NO drive-active fail-safe. The yield is evaluated
  AFTER the other gates, so a yield-skip always means a feast that would
  genuinely have fired.
- **SUBSTRATE**: FEASTSCALE_R13=1 both sides; SEATDRIVE=0 EXPLICIT (pre-seat);
  HUNTSTAFF unset; base courtship policies only. 180d death-aware; dead
  villages stop. Assert env up front; SWEEP STOPS on mismatch.
- **SEEDS**: pilot 8 FRESH seeds (6901, 6902, 6903, 6904, 6908, 6909, 6910,
  6911 — verified unused in scripts/ + evidence/ before sims, the 6606
  lesson) x {leadfeast, belongfeast} x {control, armed} = 32 runs,
  IDENTICAL seeds both sides, own in-sweep paired control. Confirm seeds
  (6912-6915, 7009, 7109-7119) verified fresh, held for a GO pilot.
- **PRIMARY** (binding): (rot:preserved + rot:fresh) ABSOLUTE per 100 days
  alive — armed <= 0.80x control (proven 0.774x / 0.645x on this layer).
- **ENGAGEMENT** (kill-fast, cluster-tails per #558): windfall tail-burn
  fires (a fire with another windfall fire <=2d earlier) >= 8 on the armed
  side. Mean fires reported, not gating.
- **Guardrail (a) — DOSE-AWARE** (the 1.15x per-pair ratio bar is RETIRED —
  it fired on noise twice): FAIL iff the pooled starve-rate rises > +15%
  AND Pearson(windfall count, per-pair starve-rate delta) > +0.3.
- **Guardrail (b)**: new-death-mode, exposure-matched with a >=2 count floor
  (kept — it worked).
- **Guardrail (c)**: median survival >= control-10d (dose-response reported).
- **Guardrail (d)**: laundering 0, measured AT CONVERT TIME.
- **Guardrail (e) — bearer-churn** (the b2 named next (1)): lead-road
  bearer deaths/run armed <= control + 1.0. A miss kills the arm — the
  churn signal must reconcile, not recur.
- **Yield diagnostic** (not gating): duty preserved armed vs control — the
  -11% gap should close if the drive absorbs the yielded pile.
- **Det-gate**: wrapped+WINDYIELD-unset byte-identical to base over 40d
  (2 seeds x 2 policies).
- **Balanced panel (§15)**: before/after through scripts/balance-panel.js on
  the named registry policies (leadwindyield, belongwindyield), same 8 seeds
  x 180d, gate-off vs WINDYIELD=1 (env FEASTSCALE_R13=1 / SEATDRIVE=0 both
  builds). The panel is the instrument; the pre-registered primary/guards
  are the judge. The compare .md is attached.
- **Sense-testing**: read the windfall beats on the highest-engagement seed;
  prove they are sensical, not just functional.

## Proof results (scripts/test-windyield-b.js — run BEFORE any sims)

PROOF GREEN (62/62):
- RED gate-off: no fire, no voice, no telemetry (including yield keys), no
  fire-day bookkeeping.
- GREEN: doomed 9000 > 300*12=3600, racks full (25000 preserved >= 19500
  cap) → fires once; feastDay set; voice said once with no dev
  parenthetical; telemetry kcal/doomed set; cadence reset; fire day
  recorded; spent=3200 <= 275*12=3300; doomedEaten=3200 (~one portion); cap
  bit recorded; guest subset 7 of 11 (top-trust); glut tail survives (5800 >
  3600 — burns tomorrow by construction).
- G2 floor / G2b 5000-band fires / G3 no frequency cap / G4 one-per-day /
  G5b unaffordable at the scaled cost (no yield-skip: no genuine fire to
  yield) / G6 no contribution / G7 away from haven → no fire.
- G8/G8b (finding #546): foodState-undefined stacks count as the fresh
  sink; preserved excluded. G9/G10 determinism + portionHeads edge cases.
- Y1–Y5 (the yield): racks thin → stand down, counted, silent-by-design, no
  voice, cadence clock untouched, doomed pile left for the drive; racks full
  → fires, never skips; boundary preserved==cap is full, cap-1 is thin; no
  cook assigned → unskilled shelf 15; glut 9000 + thin racks YIELDS (the
  loosened test — no budget-fit requirement); deterministic both paths.
- L1: the windfall converts nothing (no new preserved/rendered stacks —
  laundering 0 by construction).

Det-gate (scripts/detgate-windyield-b.js): wrapped+unset == base
byte-identical over 40d, 2 seeds x 2 policies; wrapped==wrapped identical.
GREEN.

## Sweep results

### Pilot (32 runs: 8 fresh seeds x {leadfeast, belongfeast} x {control, armed})

| metric | control (16) | armed (16) | pre-reg |
|---|---|---|---|
| rot/100d (**PRIMARY**) | 128,381k | 78,379k | **PASS** (ratio 0.611 ≤ 0.80) |
| tail-burn fires (engagement) | 0 | 117 | **PASS** (≥ 8) |
| mean fires (informative) | 0 | 158 | — |
| yield-skips (the differentiator) | 0 | 81 | (diagnostic) |
| doomed-seen / doomed-eaten | — | 1075k / 237k | (info) |
| doomed-yielded to the drive | — | 616k | (diagnostic) |
| duty preserved | 1468k | 1157k | (diagnostic: −21%, gap did NOT close) |
| median survival | 102d | 113d | **PASS** (+11d ≥ −10d) |
| starveDays/100d (pooled median) | 18.3 | 17.2 (−6.0%) | (a) **PASS** |
| dose r (windfall, rate delta) | — | −0.11 | (a) **PASS** (not > +0.3) |
| lead-road bearer deaths/run | 5.38 | 7.63 (+2.25) | (e) **FAIL** (bar: ≤ +1.0) |
| dose r (windfall, bearer delta) | — | +0.33 | (e) diagnostic |
| laundered | 0 | 0 | **PASS** |
| new death mode (exp-matched, ≥2) | — | none | **PASS** |
| national | 9/16 | 7/16 | (info) |
| table | 14/16 | 14/16 | (info) |
| wins | 0/16 | 0/16 | (pre-seat) |
| wave 4 | 11/16 | 11/16 | (info) |
| wave 5 | 0/16 | 0/16 | (info) |

Per-seed: evidence/2026-10-18/perseed-windyield-b/sweep-*.json
Analyzer: scripts/analyze-windyield-b.js

**Pilot verdict: NO-GO** — guardrail (e) (lead-road bearer deaths/run armed
<= control + 1.0) fails: 7.63 vs 5.38 (+2.25/run). Per §14, a miss is
NO-GO, never re-scored. The arm is KILLED: layer deleted zero-trace
(scripts/policies/windyield.js + the two registry entries); instruments +
evidence landed.

Dose-response: Pearson(windfall count, survival delta) = −0.22 (n=16) —
unattributed. Pearson(windfall count, starve-rate delta) = −0.11 — the
dose-aware bar passes cleanly. Pearson(windfall count, per-pair
bearer-change delta) = **+0.33** — the churn tracks the mechanism dose.

Per-pair survival deltas (armed−control): −54d (belong 6909, wf=12),
−48d (belong 6904, wf=14, yskip=30), −35d (lead 6909, wf=51), −5d (belong
6903, wf=13; lead 6903, wf=6, yskip=4), −3d (belong 6901, wf=2, yskip=1),
+0d (belong 6908 / lead 6902 / lead 6908 — the early-collapse seeds; lead
6911, wf=0, yskip=1), +7d (lead 6901, wf=9, yskip=17), +16d (lead 6910,
wf=2, yskip=7), +21d (belong 6902, wf=6, yskip=1), +36d (belong 6911, wf=1,
yskip=2), +42d (lead 6904, wf=40, yskip=16), +60d (belong 6910, wf=2,
yskip=2).

### Guardrail (e), examined (the b2 named next (1) — answered)

The b2 §15 panel's lead-road signal (+2.5 player deaths/run,
regression_signal) REPLICATES at sweep level on fresh seeds: +2.25
bearer deaths/run on leadfeast (7.63 vs 5.38), +2.37 on belongfeast (9.50
vs 7.13), with a positive dose relationship (+0.33). The windfallrev
sweep's null (full 112 vs control 122, dose −0.23) was the artifact of its
scavenger-draw yield suppressing 45 feasts — remove the suppression and the
churn returns at the same magnitude. The mechanism is the feast's
scavenger lottery: a windfall feast arms the surge (harvest_table /
devotion), rolls the feast-surge draw, and the competent fight road faces
the beast while feasted — through a glut cluster that's a new fight every
~2 days. Combat deaths rise 100→152 armed-side (+52), monster +14. The
churn is fire-side: the yield only skips fires, and the fires that happened
still drew. The known reconciliation (the 3-day scavenger quiet window)
suppresses the churn but costs ~0.07x rot (windfallrev) — a future arm
could try the narrower pending-only yield the windfallrev review named,
measured against the same primary.

### The yield, examined (the b2 named next (2) — answered)

The loosened engagement DID test the question: 81 yield-skips (vs
windfallrev's 7), 616k doomed kcal yielded to the drive. The answer is no:
duty preserved did NOT recover — it fell 1468k → 1157k (−21%, worse than
the −11% hint). The drive does not absorb the yielded pile; the yielded
doomed food rots or gets eaten fresh faster than the drive smokes it (the
drive's eligibility/duty bindings from rackschannel-b still bind). The
windfall's fires (racks-full only, 158 of them) still drove rot to 0.611x
— the racks-full fires are the highest-value ones — but the yield half of
the design is a loss. The windfallrev named next (4) is now answered:
kill the question.

### Balanced panel (§15 — the instrument, not the judge)

Built before/after through scripts/balance-panel.js on the named registry
policies (leadwindyield, belongwindyield), same 8 seeds × 180d, gate-off
(WINDYIELD unset) vs WINDYIELD=1, env FEASTSCALE_R13=1 / SEATDRIVE=0 both
builds. Both panels valid (16 cases, neutrality proofs green, no validity
errors). Compare: evidence/2026-10-18/panel-windyield-b/compare.md
(panel.json.gz + compare.json alongside; cases/ caches not committed per
§15).

**Panel decision: review_required.** Investigation notes (screen only, 8
pairs — exploratory intervals, not verdicts):
- leadwindyield: Player deaths per run +2.125 (**regression_signal**,
  interval 0.875–3.375 — clear of 0); player deaths/100d +1.3407
  (**regression_signal**, interval 0.4334–2.1786); mean sampled living NPCs
  −0.5393 (**regression_signal**); bearer changes +2.0 (descriptive);
  table invitation −0.125, national −0.125, community loss +0.125 (watch).
- belongwindyield: Player deaths per run −3.0 (no_material_signal, interval
  −6 to 0.125 — includes 0); bearer changes −2.875 (descriptive); community
  loss +0.125 (watch); no regression_signal on any metric.

Per §15 the panel never overrides the pre-registered verdict — but it
corroborates the sweep independently and more sharply: the lead-road churn
is +2.1 player deaths/run with an interval clear of zero, the same
magnitude as the b2 panel's +2.5 signal. The churn is lead-road-specific
(belong shows no signal), fire-side, and real. (Panel build note: the
lever env was NOT added to balance-panel.js's flagNames — the windfallrev
pitfall avoided; before/after compared clean.)

### Sense-testing (SENSE-TESTING LAW — read, not counted)

scripts/sense-windyield-b.js, seed 6909 (highest engagement, 51 fires on the
180d sweep; 12 fires in the 60d sense window), fire days 39–55:

d39: "🍖 The Foraged food won't keep till tomorrow — Kelly calls a feast to
eat it before it turns." Followed by the engine report (12× Foraged food;
Consuelo, Elisa, Aroha, Otieno and 1 more eat; the grief register fires —
"somebody's seat is empty, and everybody sees it"; −2,400 kcal from the
pantry).

**PASS with the carried notes** — the line reads as a person making a
sensible call (names the food, the caller, the reason); the engine's
emotional register tracks each night (grief, then the harvest register as
the pantry fills); the guest subset rotates night to night (different
top-trust circles show). Carried notes: (1) the SUBSET invitation is still
unexplained in-fiction (who's in the impromptu circle and why) — third
carry-over; name the circle if the voice ever lands. (2) On this run the
scholar runs a fusion reactor, so the buff-refusal line follows EVERY
windfall — honest, but it makes the feast read as a failed ritual rather
than a salvage supper (the windfallrev note). (3) "The channeled keepsake
feeds the feast — the feast was the weapon, and the surge rides the fire"
— the feast arms the surge, which is the mechanism behind the churn
finding: every windfall is a potential fight night.

The yield-skip silence: silent-by-design, documented honestly. The windfall
is the exception; its absence needs no announcement — the village simply
doesn't get an impromptu feast, and the cook's own duty narrates the racks
work ("worked the smoke racks too" / the racks-full note). A voice line
for every skipped feast would be noise on glut days.

## Wall numbers (every run)

Armed: national 7/16, table 14/16, wins 0/16, w4 11/16, w5 0/16, median
113d, max 177d. Control: national 9/16, table 14/16, wins 0/16, w4 11/16,
w5 0/16, median 102d, max 180d. The wall stands (zero wins, wave-4
ceiling, pre-seat). This arm does not attack the wall — but it is the
strongest rot lever measured on fresh seeds this axis (0.611x) with no
village-survival cost (+11d).

## Village assessment (plain words)

Thirty-two villages, sixteen twinned. The armed twins hold portion-scaled
windfall feasts — 158 across the pilot, 117 of them tail-burns — and yield
81 more to the smoke drive, eating 237k kcal of doomed food out of 1075k
seen and yielding 616k to the racks. Their pantries are leaner (rot down
39%, ratio 0.611 — the strongest rot number on this axis) and they live
longer (+11d median). The dose is the story again: the valve fires hardest
on the glut pairs (lead 6904: 40 fires + 16 skips, +42d; lead 6909: 51
fires, −35d).

Who thrives: villages that live long enough to feast — the biggest gains
(belong 6910 +60d, lead 6904 +42d, belong 6911 +36d) convert would-rot
food into eaten food or yielded preservation. Who dies: the early
collapses (combat and monster dominate — 152 combat, 67 monster vs 12
starvation on the armed side; the feast is never the direct killer) and
the 6908 graveyard (33d/35d both sides — nothing to feast, nothing to
save). The three biggest survival losses (belong 6909 −54d, belong 6904
−48d, lead 6909 −35d) sit on the highest-windfall pairs — the feast's
fight nights cost the bearers who face them.

The hunger picture is quiet: pooled starvation rate −6.0%, dose-response
−0.11 — the meal-displacement mechanism does not track the lever. The
bearer picture is the finding: +2.25 bearer deaths/run on the lead road
(+2.37 on belong), dose +0.33 — the b2 panel's churn signal replicates at
sweep level. The village eats; the bearers bleed.

## Blanks filled / documented

- **FILLED (finding)**: the portion-windfall economics replicate a FOURTH
  time on fresh seeds — 0.611x, the strongest rot number on this axis,
  with the yield engaged (81 skips). The cluster-tail mechanism is
  seed-robust (117 tail-burns).
- **FILLED (finding)**: the b2 panel's lead-road bearer-churn signal
  REPLICATES at sweep level on fresh seeds (+2.25/run lead, +2.37/run
  belong, dose +0.33) once the scavenger-draw suppression is removed. The
  windfallrev null was the suppression's artifact, not the signal's
  absence. The mechanism is the feast's scavenger-draw→fight path.
- **FILLED (finding)**: the smoke-drive yield question is ANSWERED — the
  loosened engagement (81 skips) tested it, and the drive does not absorb
  the yielded pile (duty preserved −21%, worse than the −11% hint). Kill
  the question per the windfallrev named next.
- **FILLED (finding)**: the dose-aware starve-rate guardrail passes
  cleanly a third time (−0.11, −6.0%) — adopt it as the standing
  starve-rate guardrail for the axis (the windfallrev run already did).
- **DOCUMENTED (killed)**: the revival with the racks-thin yield is KILLED
  at pilot — primary 0.611x (PASS), engagement 117 tail-burns (PASS),
  survival +11d (PASS), dose-aware starve-rate (PASS), new-death-mode
  (PASS), laundering 0 (PASS) — but guardrail (e) fails: lead-road bearer
  deaths/run 7.63 vs 5.38 (+2.25 > +1.0 bar). Per §14 the miss binds:
  NO-GO. Layer deleted zero-trace per kill protocol; instruments + evidence
  landed.
- **DOCUMENTED (seed)**: 6908 is an early-collapse seed both sides (33d
  lead / 35d belong, village rank, wave 1–2) — contributes nothing to the
  rot metric; 6909 is the showcase glut seed (51 windfall fires lead).

## Metric review (§14)

- The primary (rot/100d ≤ 0.80x) PASSED (0.611). The metric is sound; the
  lever's economics replicate a fourth time on fresh seeds.
- The engagement bar (≥ 8 tail-burn fires) PASSED (117). Keep this metric.
- Guardrail (a) dose-aware PASSED (−0.11, −6.0%). The revision works — keep
  it as the standing starve-rate guardrail for the axis.
- Guardrail (b) exposure-matched ≥2 PASSED cleanly. Keep.
- Guardrail (c) survival PASSED (+11d). The #538 split rule never engaged.
- Guardrail (d) laundering PASSED (0).
- Guardrail (e) bearer-churn FAILED (7.63 vs 6.38 bar). The guardrail did
  its job: the b2 named next (1) is answered — the churn signal is real,
  fire-side, and dose-tracking. A future arm that wants the windfall's rot
  economics must carry a churn reconciliation (the pending-only scavenger
  yield is the named next) and beat the 0.80x primary WITH it.
- The yield diagnostic (duty preserved) answered its question: −21% — the
  drive doesn't absorb. The windfallrev named next (4) is closed: kill the
  question.
- §15 panel: built and attached (evidence/2026-10-18/panel-windyield-b/
  compare.md). **Decision: review_required** — the instrument corroborates
  the sweep independently: lead-road player deaths +2.125/run
  (regression_signal, interval 0.875–3.375 clear of 0), player deaths/100d
  +1.34 (regression_signal), living NPCs −0.54 (regression_signal). The
  churn is lead-road-specific (belong: no signal), fire-side, and real —
  the same magnitude as the b2 panel's +2.5 signal.

## Telemetry

`node scripts/telemetry-check.js --baseline .../telemetry-baselines/scale-wall-preseat.json
--current '/tmp/sim-windyield-b/agg/agg-*.json' --metrics national,table,wins,exiled`:
2 LOUD: "national swung 78%: baseline 9 -> current 16" and "table swung
100%: baseline 14 -> current 28". BOTH explained by aggregation — the tool
sums the two per-arm aggregate files (control 9 + armed 7 = 16 national;
14 + 14 = 28 table), the same artifact the prior runs documented. Per-arm:
control national 9/16 = baseline 9 (exact), table 14/16 = baseline 14
(exact); armed national 7/16, table 14/16 — within noise. Not drift, not a
bug. Baseline NOT rolled.

## Convergence state

**killed-at-pilot** (NO-GO on the pre-registered bearer-churn guardrail —
lead-road 7.63 vs 6.38 bar; see Metric review for the dose-response case
that the churn is fire-side and real). The food-economy axis is not
converged. The portion-scaled windfall's rot economics are proven 4x
(0.774/0.645/0.747-0.751/0.611) — but the lead-road bearer-churn signal is
now a twice-replicated sweep-level finding, and any future windfall arm
must carry a churn reconciliation to land.
