# SIM-TRAJCLOSE-B — aidspoil rot-driver lineage closure (loop B, food-economy diagnostic)

Date: 2026-10-16 · Loop: oversight-flesh-out-loop-b · Worker tree: sim-trajclose-b
Run: fleshout-loop-b-20261016T2330Z · Axis: food-economy (scale-wall lens).

## The question

The sim-aidspoil arm (evidence/2026-10-15/sim-aidspoil-b.md) left a 4x rot
reduction unexplained (driver-ON 799k vs pristine 3,144k on seeds
11/22/33/44/55/66/77/88). Follow-ups killed every component: aid-only
1.014x null (sim-aiddrain-b), feast-only 1.114x null (sim-feastdrawdown-b),
aid×feast interaction 0.786 KILLED (sim-aidfeastint-b), 2-day floor
eliminated (sim-floorday3-b). The residual verdict was "driver-level
trajectory effect" — but the 4x was NEVER measured same-sweep (799k and
3,144k came from different sweeps). This arm rebuilds the EXACT aidspoil
driver verb-verbatim (scripts/policies/trajclose.js, TRAJCLOSE=1) and tests
it vs pristine in ONE sweep on identical seeds.

## Pre-registration (docs/MEASUREMENT.md §§9-12, 14 — binding, written BEFORE sims)

- **Design**: 8 seeds [11,22,33,44,55,66,77,88 — the ORIGINAL seeds] ×
  {leadfeast} × {pristine, driver} = 16 runs, 180d death-aware, pre-seat
  courtship (SEATDRIVE=0 explicit), FEASTSCALE_R13=1. Own in-sweep control,
  identical seeds. Env gate flips in-process.
- **Driver spec** (from evidence/2026-10-15/sim-aidspoil-b.md "Driver
  (instrument" section, rebuilt verb-verbatim as scripts/policies/
  trajclose.js, TRAJCLOSE=1, default OFF, browser-safe typeof guard):
  wraps leadfeast as trajLead. Fresh-days > 4 + siege-gate clear → ONE
  verb/day, priority AID (honest tendLink on a thin subordinate: sub pantry
  < 5d of need, untended this week, not mourning; DEFAULT
  least-perishable-first ordering — the 799k configuration, NO spoil-first,
  game code untouched) > FEAST (hostFeast under the r13 allowance chain via
  allowgate2.feastCandidate + floor cost ≤ fresh − 2×burn). NO tribute verb.
  Floor: never below 2 fresh-days (maxDrawdownKcal = fresh − 2×burn).
  Siege-gate: lingerer / gorge-night-trailing-7d / raid-7d hold all verbs off
  (count holds). Cause lines after CONFIRMED verbs only. The aid fires in
  daily BEFORE the parent's daily (preempts the base weekly tend via
  tendedWeek idempotency); the driver's feast fires in upkeep BEFORE the
  parent's upkeep (s.feastDay blocks the allowance after — no double-feast,
  no displacement: own _tcLastFeastDay cadence, shared _fsLastFeastDay
  untouched).
- **PRIMARY (binding)**: driver-vs-pristine aggregate absolute fresh-rot
  kcal ratio. GO if ≤ 0.7x (the 4x reproduces same-sweep) → the trajectory
  metrics below become the mechanism hunt and a second measurement round
  characterizes WHERE the trajectory diverges. KILL if ~1.0x (null) →
  lineage CLOSED: the 4x was cross-sweep drift, the "trajectory effect"
  residual is retired, verdict overrides aidfeastint's. A miss is NO-GO,
  never re-scored.
- **TRAJECTORY METRICS** (measure regardless; mechanism lens only if
  PRIMARY goes): pantry-peak distributions (daily pantry-kcal histogram,
  armed vs control), day-type composition (counts of overstock-trigger days,
  aid days, feast days, siege-hold days), event timing (day-of first
  aid/feast, rot accumulation curves).
- **GUARDRAILS**: national ≥ control−2; starvation deaths ≤ control+2; no
  new death mode (n≥3); median report-only.
- **PROOF FIRST**: RED/ARMED for the rebuilt driver (verb-verbatim: exact
  kcal, floor math, beat ordering, siege gates, armed determinism),
  det-gate (gates-off byte-identical wrapper-vs-parent), SMOKE honesty gate.
  Do NOT trust any comparison until proofs are green.
- **Canon check**: docs/CANON.md + docs/PRESERVATION.md read. Honored:
  "Rot can't be smoked back into food" (honest engine verbs only — the
  driver never touches stack ordering or spoilage; nothing is re-shelved);
  "No nonsensical calorie loss" (conservation — the proof's A9 pins pantry
  before − after == paid). No canon doc covers draw ordering and this arm
  changes none (the 799k configuration = current default ordering).

## Proof results (run BEFORE any sims)

Rebuilt-driver verification, all green, independently re-run:
- scripts/test-trajclose-20261016.js: RED 7/7 (R1 gate-off byte-identical
  trajLead == leadfeast 40/40 × 2 seeds; R2 no verbs fire gate-off, the
  parent's own tend discipline intact — pantry 150000→148500) + ARMED
  67/67 (A1 aid verb-verbatim: tcAid=1, 1500 kcal, sub 1000→2500, trust
  30→38, pantry lighter by exactly paid, cause after the engine beat
  tend@0 cause@1, floor ≥ 2 after, _tcFired=30; A2 fat sub refused; A3
  mourning refused; A4/A5/A6 siege gates hold with hold counted and
  hold-day recorded, 8d-old gorge does NOT hold; A7 floor math unit
  (maxDraw = 2143, the exact G5 number from the original proof) +
  small-burn refusal/allow fixtures; A8 no-tribute negative; A9
  conservation + whole-unit honesty; A10 one-verb/day; A11 feast
  verb-verbatim: tcFeasts=1, real pantry draw, cause after the beat, floor
  ≥ 2 after, own _tcLastFeastDay=30 marked, shared _fsLastFeastDay
  untouched, engine feastDay set; A12 trigger strictly > 4; A13 feast floor
  binds/refuses on small-burn fixtures; A14 feast siege gates; A15 no
  double-feast; A16 priority aid > feast (upkeep yields, daily fires,
  exactly one verb/day); A17 feast inert without FEASTSCALE_R13, aid
  unaffected; A18 armed determinism; A19 driver feast first, s.feastDay
  blocks the allowance after — exactly one feast beat, no displacement).
  A17 ran in its own phase (TRAJCLOSE=1, r13 unset) — green.
- scripts/det-gate-trajclose-20261016.js: armed trajLead 8/8 seeds × 40d
  bit-identical — GREEN.
- SMOKE=1 (scripts/sweep-trajclose-20261016.js): both cells drive
  (daily/upkeep invoked, pacing > 0) — green before measuring.

Engagement fidelity (the verb-verbatim check that matters): on the
identical 8 seeds the rebuilt driver fired 47 aids + 18 driver feasts vs
the original aidspoil driver's 47 aids + 22 feasts — the same verbs at the
same rate. One telemetry-convention difference, documented: siege-hold
counts (111 on the rebuild vs 1383 originally) — the original's counting
rule is unknown; the rebuild counts only would-have-fired holds (the
allowgate2 convention). Hold counts never touch the game; the fired verbs
are what could move rot, and they match.

## Sweep results

16 runs (2 cells × 8 ORIGINAL seeds [11,22,33,44,55,66,77,88]), 180d
death-aware, SEATDRIVE=0, FEASTSCALE_R13=1, own in-sweep control,
identical seeds across cells. Sweep exit 0; 16/16 per-seed JSONs carry
exact numeric keys national/table/wins/exiled (schema-drift check: 0
drifts). Det-gate green + SMOKE green before measuring (see Proof
results).

Aggregate absolute fresh-rot kcal:

| cell | rot | r/vd | national | table | wins | w4 | w5 | median | max |
|---|---|---|---|---|---|---|---|---|---|
| pristine | 2802.1k | 302 | 7/8 | 7/8 | 0/8 | 0/8 | 0/8 | 144d | 180d |
| driver | 3638.6k | 395 | 6/8 | 6/8 | 0/8 | 0/8 | 0/8 | 167d | 180d |

Per-seed driver/pristine fresh-rot: s11 1.53, s22 1.29, s33 0.00
(driver died d37 before rotting), s44 0.42, s55 1.89, s66 1.19, s77 nz
(both ~0), s88 3.97. Direction flips by seed — the lineage's familiar
noise signature; the aggregate 1.30× is driven by the big-rot seeds
(s11, s55, s88), exactly as the aidspoil pilot's 1.32× was driven by
s22/s44.

**PRIMARY: 1.299 — MISS (needs ≤ 0.7). KILLED per §14.** No re-scoring.

The cross-sweep autopsy: pristine reproduces across sweeps (2802k here
vs 3144k in the original cross-sweep comparison — within 11%), while the
driver-ON side does not (3639k here vs 799k there). The 799k was
cross-sweep drift — an anomalous sweep — not a driver effect. There is no
driver-level trajectory effect to hunt.

## Trajectory metrics

Measured regardless (mechanism lens — moot after the KILL, recorded for
the lineage record):
- Day-type composition: overstock-trigger days (fd>4) pristine 867 vs
  driver 851 — the driver's verbs did not reshape trigger availability;
  aid days 47 (113k kcal); feast days (ALL engine feasts) pristine 80 vs
  driver 84 — the driver's 18 feasts displaced ~14 allowance feasts
  (s.feastDay blocks the allowance after); siege-hold counts 111 on 111
  distinct days.
- Event timing: first aid days 26–42 across seeds (channel forms in the
  first month); first driver-feast days 34–50.
- Pantry-kcal histogram (daily samples): pristine vs driver nearly
  identical — 0-25k 30.3%/25.6%, 25-50k 35.9%/39.6%, 50-75k
  22.1%/23.0%, 75-100k 10.1%/9.3%, 100k+ ~1.6%/2.5% both. The driver's
  teaspoons do not reshape the pantry distribution.
- Rot accumulation curves: the same mid-run cliffs on both sides
  (d49–d84 concentration) — the rot weather is seed-driven, not
  driver-driven.
- Guardrails: national 6 vs 7 (need ≥ 5 ✓); starvation 6 vs 4 (need ≤ 6
  ✓); no new death mode (n≥3) ✓; median report-only (167d vs 144d).

## Sense-testing (SENSE-TESTING LAW — read, not counted)

Driver-cell re-runs on the two largest |driver−pristine| rot-delta seeds
(s88 ratio 3.97, s55 ratio 1.89; deterministic per det-gate — same seed,
same beats), all driver-cause beats with ±6 context. Full transcript:
evidence/2026-10-16/trajclose-sense/sense-beats-88-55.txt.

The driver's lines slot after confirmed verbs with honest post-draw
counts and read as a village deciding:
- "🌾 Haven sends 1,500 kcal of grain to Emberhold's fire — not tribute,
  the other way around. Someone's grandmother over there will remember
  who fed her. (Trust +8.)" → "🌾 Haven's shelves hold ~19 days of fresh
  — more than the village eats before it turns. The surplus goes to
  Emberhold's fire, not the rot." (d26, s88; the count thins honestly as
  the pantry drains: ~19d → ~4d by d28)
- "🍖 FEAST 📺 — Violet opens the pantry wide: 5× Foraged food… eat until
  the fire burns low." → "🍖 FEASTED ×2.03 until tomorrow's dawn…" →
  "🌙 The cookfire's smell carried further than the laughter did… Dustboar
  is circling the edge of the light. It followed the feast here." →
  "🍖 The shelves groan — ~24 days of fresh on hand, and the rot is
  already circling. We eat the mountain tonight, or it eats itself."
  (d34, s55) — the engine's played consequences (scavenger draw, FEASTED
  buff, the reactor ceiling refusing the buff at d85) fire around the
  driver's verb. Nothing robotic in the driver lines.

**PASS** with documented observations (out of arm, pre-existing):
(1) the engine's tend beat repeats byte-identically on every tend
("Someone's grandmother…" — the aidspoil arm's documented blank, still
open); (2) aid amounts inflate via the engine's whole-unit over-removal
(1500 nominal → 1,545/1,600/3,750/4,000/5,000/6,140 paid — honest, the
driver records the real paid kcal, but "1500-kcal aid" is nominal);
(3) the pantry-check beat's templated repetition ("leaves the [fish
nets/harvest/forage] standing and turns to the [water run/stone
pile/wood run] instead" — the aidfeastint arm's documented blank).

## Villagers as people

Sampled out of the sense transcripts (s88: 12,498 beats; s55: 17,130
beats). The aid verbs land on named thin subordinates (Emberhold,
Stonebridge, Thornfield) with the engine's tend beats and varying
whole-unit amounts; the mourning refusal fires in-fiction ("They're
burying their speaker — grain can wait a week; grief can't."). Villagers
self-regulate against full pantries ("the shelves are full, ~75 days of
fresh on hand… leaves the forage standing and turns to the wood run
instead"), gossip distorts through retelling ("Three retellings in,
nobody remembers what actually happened — but everyone has opinions"),
foragers stand down when the pantry can't take more, the rot is narrated
with a named villager's complaint ("Should've smoked that. Fresh stuff
keeps a day or two on the shelf — the smoke rack is right there."). The
village reads as people, not robots — on both cells; the driver changes
no behavior, only adds its teaspoons.

## Wall numbers (every run)

| cell | national | table | wins | w4 | w5 | median | max | exiled |
|---|---|---|---|---|---|---|---|---|
| pristine | 7/8 | 7/8 | 0/8 | 0/8 | 0/8 | 144d | 180d | 0 |
| driver | 6/8 | 6/8 | 0/8 | 0/8 | 0/8 | 167d | 180d | 0 |

No wins in 16 runs. The table seats (13/16) but nobody wins; wave-4 never
unlocks on this seed set (0/16 both cells — harsher than the
aidfeastint 3201-3208 set's 3/64, and far harsher than the pilots' 8/8).
The scale wall stands: villages reach national and the table but not the
win, and wave 4/5 are decoration here.

## Death-cause shares

Driver (8 runs, deaths by cause): combat-dominated on both cells — no new
death mode (every n≥3 category exists on both sides; analyzer-verified).
Starvation: 6 driver vs 4 pristine (guardrail ≤ 6 ✓). Villages die of
violence, not hunger, on both sides.

## Village assessment (plain words)

Sixteen villages on the leadfeast road, eight with the rebuilt driver and
eight without, and the story is the lineage's oldest: the pantry rots on
its own weather and the verbs are teaspoons. The driver fired 47 honest
aids and 18 honest feasts — real kcal (113k + 42k), real narration, real
trust — and rotted 3,639k against pristine's 2,802k. The per-seed
direction flips (0.00–3.97) the way it always does in this lineage; the
aggregate moves on the big-rot seeds' weather, not the driver's verbs.
The pantry histograms are near-identical, the trigger-day counts are
near-identical (851 vs 867), the rot cliffs land on the same mid-run
days. The driver changed nothing about the trajectory — it only added
its teaspoons to whichever weather the seed brought.

Who thrived: the villages that reached national (7 pristine, 6 driver)
did it on both cells — the driver changed no trajectory. The aid fed
real grain to thin subordinates (+8 trust a tend) — the social ledger
moved, the rot ledger didn't. Who died: the same combat/monster deaths in
the same proportions; starvation stayed marginal (4–6). The blank this
run fills is the one the task named: the aidspoil driver's 4x is closed.
It was never measured same-sweep; rebuilt verb-verbatim and measured
same-sweep it is 1.30x the wrong way — cross-sweep drift, not a
trajectory effect. The residual verdict from aidfeastint ("driver-level
trajectory effect") is retired. The verb space was already closed; now
the driver space is closed too.

## Blanks filled / documented

- **MEASURED, KILLED (diagnostic)**: the aidspoil rot-driver lineage —
  the last open question on food-economy. Rebuilt the exact aidspoil
  driver verb-verbatim (scripts/policies/trajclose.js, TRAJCLOSE=1; proof
  RED 7/7 + ARMED 67/67, det-gate 8/8, SMOKE green) and measured it vs
  pristine in ONE sweep on identical seeds (8 original seeds × 2 cells,
  180d death-aware). PRIMARY 1.299 (need ≤ 0.7) → KILL per §14.
  Engagement fidelity: 47 aids + 18 driver feasts vs the original's 47 +
  22 — the rebuild is behaviorally verb-verbatim. The 4x (799k vs 3144k)
  was cross-sweep drift: pristine reproduces across sweeps (2802k vs
  3144k), the driver side does not (3639k vs 799k).
- **REBUILT + DELETED per diagnostic protocol**: scripts/policies/
  trajclose.js was rebuilt verb-verbatim and DELETED after measurement —
  zero-trace. Kept as instruments: scripts/test-trajclose-20261016.js,
  scripts/det-gate-trajclose-20261016.js,
  scripts/sweep-trajclose-20261016.js,
  scripts/analyze-trajclose-20261016.js,
  scripts/sense-trajclose-20261016.js, this evidence file,
  trajclose-sweep.json + 16 per-seed JSONs under
  evidence/2026-10-16/perseed-trajclose/ (+ trajclose-sense/).
- **DOCUMENTED** (telemetry): the original's siege-hold counting rule is
  unknown (asGateHeld=1383 vs the rebuild's 111 would-have-fired holds);
  hold counts never touch the game — the fired verbs are what could move
  rot, and they match. Any future rebuild should pin the hold-counting
  convention explicitly.
- **DOCUMENTED** (design): the aid's 1500-kcal size is nominal — the
  engine's whole-unit over-removal pays 1,545–6,140 real kcal (honest,
  recorded, but the nominal understates the draw).
- **DOCUMENTED** (design): the driver's feasts displace allowance feasts
  (~14 over 8 runs via s.feastDay) — on the leadfeast road a driver feast
  is partly a re-timed allowance feast, not a purely additive verb.
- **DOCUMENTED** (infra, pre-existing): `node scripts/check.js --quick`
  reports 96 passed / 1 failed at this commit — the failure is
  scripts/test-sprites-valid-20261014.js (dustboar/sunback/sweeps_week/
  cliffhanger calm/aggro sprites), unrelated to this arm (zero src/js,
  src/data, or sprite changes; the arm's files are new scripts + evidence
  only). Left for the owning loop.

## Metric review (§14)

1. **KILL stands — primary missed (1.299 vs ≤ 0.7).** No re-scoring. The
   sweep was the right size: 47 aids + 18 driver feasts fired on identical
   seeds in the same sweep, engagement matching the original driver's
   47+22. This is a clean null, not an underpowered sniff test.
2. **The cross-sweep autopsy is the finding.** The task's suspicion is
   confirmed with numbers: pristine 2802k (this sweep) vs 3144k (original
   cross-sweep) — the control side reproduces; driver 3639k vs 799k — the
   armed side does not. The 4x lived in one anomalous sweep's driver-side
   number, never in the driver.
3. **The per-seed flip signature (0.00–3.97) is the lineage's noise
   signature**, not a mechanism — the same pattern as the aidspoil
   pilot's 0.13–2.84. Aggregates in this lineage are driven by the two or
   three big-rot seeds' weather.
4. **Guardrail widths were right.** National and starvation never bound;
   no new death mode. The kill is clean, not harm-driven.
5. **For the food-economy axis**: the aidspoil lineage is CLOSED —
   aid (1.014x), feast (1.114x), aid×feast (0.786), 2-day floor
   (eliminated), and now the driver itself (1.299x same-sweep) are all
   dead. The residual "trajectory effect" is retired. Future rot work
   starts from prodthrottle (the only landed lever) and the scale-wall
   lens, not this lineage. Do NOT re-run any aidspoil-lineage variant.

## Convergence state

food-economy: **killed-at-pilot** (trajclose — diagnostic lineage
closure). The aidspoil driver's 4x rot reduction does not reproduce
same-sweep: rebuilt verb-verbatim (47a/18f engagement fidelity vs the
original's 47a/22f), the driver moved aggregate absolute fresh-rot
1.299x the wrong way (3638.6k vs 2802.1k, identical seeds, same sweep).
Verdict: cross-sweep drift — the 799k was an anomalous sweep, the
"driver-level trajectory effect" residual is retired, and the aidspoil
lineage is CLOSED (aid, feast, interaction, floor, driver — all dead).
Driver deleted zero-trace per diagnostic protocol; instruments + evidence
kept. food-economy stays `converging`; prodthrottle remains the only
landed rot lever.
