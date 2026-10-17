# sim-ambientfix-b — loop B lever loop (2026-10-17)

## PRE-REGISTERED HEADER (docs/MEASUREMENT.md §§9-12, 14 — binding)

Two-part run. Axis: food-economy (loop B axis), narration-layer levers.
Substrate (asserted up front in every script):
FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1, SEATDRIVE=0 explicit.
Policies: leadfeast / belongfeast (scripts/policies/seatdrive.js, uncomposed SEATDRIVE=0 per the seatdiag finding).

**PART 1 — #440: the benevolent-pilot ambient line (sim-findings line 440).**
The line "Someone's been leaving food out. Good food. Don't ask me how I
know it wasn't one of us." fired 8 times word-for-word with only the speaker
name varying (sim-trig6-b sense-read, evidence/2026-10-17/trig6-beats/).
PRIMARY GO = proof RED→GREEN (fixtures: ambient line varies across ≥2
pilot-persona states / speakers) AND det-gate byte-identical trajectories
AND an 8-seed paired sweep (seeds × {leadfeast,belongfeast} × {armed,control},
180d death-aware, FEASTSCALE_R13=1, SEATDRIVE=0 explicit) with wall metrics
identical (national/table/wins/wave/median). SENSE-READ: 2 ambient-gossip
sequences read as a reader — the villagers must sound like distinct people.

**PART 2 — #392: "THE FICTION'S TWO FACES IN ONE RUN" (sim-findings line 392).**
Read-only verification, zero game-code risk: sim-fictiongate-b LANDED the
honesty split at justice.js:137-158 (the cold-shoulder journal line keys on
the dated-voluntary ledger). PRIMARY = 0 honest-line voicings on
clean-ledger armings across ≥8 runs AND ≥1 honest-line firing on a real-drip
arming (mechanism coverage). Fresh seeds [517, 628, 739, 850] ×
{leadfeast,belongfeast} × 25d with LEDGERDIAG=1.

Horizon rationale: Part 1's lever fires behind the 2-day gossip cooldown
across the whole run (180d death-aware, +10d tail); Part 2's cold-shoulder
firings land d12–d25 in pilots (rearmlat-b census: first re-arms d14).

## THE FIX — PART 1 (narration only, zero behavior change)

Precedent: dawnrefuse-b, fictiongate-b, ambient-b — all landed permanently,
det-clean. File: src/js/alienPlayers.js.

- The benevolent branch of apVillageGossip's per-known-pilot loop now calls
  `Game.apPilotFoodLine(vid, pid, per, apSeen)`: a 4-variant pool per pilot.
  Variant 0 = the original line verbatim. Variants 1–3 NAME the pilot (a
  known alien with a name deserves a name in the gossip) and use a per-pilot
  drop spot drawn from each pilot's own canon — Wren's hollow caches,
  Old Tam's fire-pit jerky (src/data/alienPlayers.json helpLines/backstories).
- Selection is a pure function of (speaker vid, pilot id, day) via
  this._hashStr — NEVER R()/Math.random() (findings #263/#264: RNG draw-count
  changes fail the det-gate). Per-speaker dedup: a villager never repeats
  their own line about a pilot until all four are said (apSeen keyed
  vname|pid|line, so the general-pool dedup is untouched).
- Meaning preserved in every variant: food keeps showing up from outside,
  and the speaker knows it wasn't one of us. Sadistic line untouched.
- No gates, no rates, no cooldowns, no mechanics touched.

Variants (vname voiced by speaker):
0. `says: "Someone's been leaving food out. Good food. Don't ask me how I know it wasn't one of us."` (original verbatim)
1. `says: "Wren again. There was food by the hollow this morning — good food. Don't ask me how I know it wasn't one of us."`
2. `mutters: "Found a parcel by the hollow. Dried meat, clean water. That has Wren written all over it."`
3. `whispers: "Someone's been leaving food out, and Wren won't admit a thing. Don't ask me how I know it wasn't one of us."`

## PROOF — PART 1 (scripts/test-ambientfix-20261017.js)

- PART 0 RED: the pre-fix single template has exactly 1 rendering —
  RED-confirmed (<3 variants), proving the test discriminates the blank.
- PART A fixtures on the real engine (seeded): 35 distinct renderings
  across 2 personas × 5 speakers × 30 days; variant 0 verbatim preserved;
  both pilots named; both drop spots voiced; deterministic (200 calls);
  rotation (4/4 variants over 120 days per pilot); no RNG in the helper
  (source scan clean); dedup: 4 distinct lines before any repeat.
- PART B real-engine call-site: 120 gated apVillageGossip calls with
  constructed known pilots → 16 distinct benevolent-pilot food texts,
  11 naming a pilot.
- RESULT: ALL GREEN (19 checks). (Two test-setup bugs fixed mid-run:
  eligibility needs systemIntegration + ledger w1 points; dedup pool-growth
  measured over 20 days not 6 — the day hash can land the same variant twice
  in a row, which IS the dedup working.)

## DET-GATE — PART 1 (scripts/sweep-ambientfix-20261017.js + detgate-compare-ambientfix-20261017.js)

8 fresh seeds [1101..1808] × {leadfeast,belongfeast} × {control,armed} =
32 runs, 180d death-aware, identical seeds across sides. Control captured
PRE-FIX (evidence/2026-10-17/ambientfix-control/, 16 runs, 363 gossip
firings), armed POST-FIX (evidence/2026-10-17/ambientfix-armed/, 16 runs,
266 classifier-visible firings — the sweep's classifier regex missed
variant 1 "Wren again..." which contains neither "leaving food out" nor
"written all over it"; instrument artifact, corrected in the sense script).
Mechanics-only per-dawn hash (say TEXT excluded): day|health|kcal|roster|
takes|gives|pantry.

**DET-GATE: 16/16 byte-identical trajectory hashes, 16/16 identical wall
metrics.** RESULT: GO — voice-only, zero mechanics movement.

Wall metrics (identical control vs armed, per-seed):
national 14/16, table 14/16, wins 0/16, wave 3 (2 in the two d29/d31
village-losts), maxArc/wave/survival/endReason identical seed-for-seed.
(Single-policy wall numbers are substrate-norm: this is the pre-seat
stack; no win-seeking policy change was in scope.)

Variety (directional, not a gate): control = 1 distinct core (the single
template — established by PART 0 RED); armed = 4 distinct cores in every
transcript (35/4, 28/4, 33/4, 26/4 firings/distinct). Sense PASS below.

check.js --quick: 96 passed, 1 failed — the single failure is
scripts/test-sprites-valid-20261014.js (dustboar/sunback/sweeps_week/
cliffhanger sprite assets), unrelated to this change (no sprite files
touched; pre-existing).

## SENSE-READS (SENSE-TESTING LAW) — transcripts in evidence/2026-10-17/ambientfix-transcripts/

**Sequence 1 — leadfeast s1505, pilot-food lines d40–d90.** Nikolai names
Wren and the hollow; Valeria says the original line; Raj mutters about the
parcel; Sari finds her own parcel two days later; Vasyl whispers that Wren
won't admit a thing. Four variants circulate across nine speakers in 50
days. Reads as a village slowly building a shared mystery, not a script.

**Sequence 2 — belongfeast s1505, d63–d106.** James, Nikolai, Ethan, Raj,
Valeria, Mlungisi, Vasyl, Johana — different verbs (says/mutters/whispers),
the whisper variant landing late like a rumor gaining confidence. The
pilots stay named; the drop spots stay per-pilot.

Honest notes: (a) within one variant the parcel detail is fixed ("dried
meat, clean water") — three different speakers found the same parcel in a
week (d80–d86). It's the pilot's signature drop, so convergence is
plausible, but it is the one remaining verbatim tell. (b) Only Wren was
known in these runs, so no Old Tam lines fired — honest, only known pilots
gossip; Old Tam's variants are fixture-proven, not sim-proven.

Verdict: PASS. Villagers sound like distinct people; the blank is filled.

## PART 2 — VERIFICATION OF THE FICTIONGATE HONESTY SPLIT (READ-ONLY)

scripts/verify-fictiongate-20261017.js. Fresh seeds [517,628,739,850] ×
{leadfeast,belongfeast} × 25d, LEDGERDIAG=1 (8 runs). Zero src/js edits —
justice.js READ-ONLY as briefed.

- PART A fixtures (real engine, same driver pattern as
  test-fictiongate-20261016.js): clean ledger (16,000 kcal, all meals) →
  meal-aware line; real drip (3,000 kcal voluntary takes in-window) →
  honest line; mechanics parity (heat/stage/say identical — only the
  journal text differs). All GREEN.
- PART B pilot: 12 cold-shoulder journal beats captured at TICK TIME with
  the engine's OWN trailing-7d reading ((giveRate7−takeRate7)×7) — not the
  instrument's dawn-day reconstruction. **5 clean (net7 = 0) → all 5 the
  meal-aware line, 0 honest voicings. 7 honest (net7 < 0) → all 7 the honest
  line, 7/7.** Instrument clean (0 errors), every beat text one of the two
  known lines.
- The existing proof (scripts/test-fictiongate-20261016.js, SMOKE) also
  re-ran GREEN on current master.

Method note: the first pilot attempt classified by the instrument's
dawn-day voluntaryNet7 and showed one "honest-classified arming firing the
meal line" (seed 628 belongfeast d23, vn7=−800). Re-classifying by the
engine's own tick-time reading (net7=0 — a take landed between the tick
and the dawn row) resolved it: the fiction was honest at the moment it
spoke. The instrument's ±1-day beat matching is the artifact; the split
itself is exact. Documented here so nobody re-litigates it.

**PRIMARY (pre-registered): 0 honest-line voicings on clean-ledger armings
across 8 runs ✓ AND ≥1 honest-line firing on a real-drip arming ✓ —
VERIFIED. The honesty split HOLDS on current master.** sim-findings #392
marked fixed.

## VILLAGE ASSESSMENT (plain words)

These were control/armed substrate runs, not lever runs, so the village
story is the substrate's, not the lever's: 16 long runs, national reached
14/16, table 14/16, wins 0/16 (pre-seat policies), median survival ~150d,
wave 3 the ceiling. The villagers gossip about the audience (350 general
firings), ask about abilities by name, and — now — tell Wren's story in
four voices instead of one. Who thrived: nobody new; the lever is voice.
Who died: the usual wave-3 wall. Knowledge missing: Old Tam stayed
unknown in every sense run, so his voice is fixture-proven only — a blank
for a future run's transcript read, not a defect.

## BLANKS FILLED

- #440 FIXED (this run): 8-faces-one-voice benevolent-pilot line → 4
  pilot-aware variants, per-pilot naming + drop spots, det-clean. Landed on
  branch sim-ambientfix-b, pending coordinator merge ("merged locally,
  pending ship" per brief — worker commits; coordinator merges).
- #392 VERIFIED (this run): the fictiongate honesty split holds on current
  master, 5/5 clean → bewildered, 7/7 honest → "I know why", exact at the
  engine's own tick-time reading. Backlog marked fixed with this evidence.

## METRIC REVIEW

- Part 1's pre-registered PRIMARY bound the run: RED→GREEN ✓, det-gate
  byte-identical ✓, wall metrics identical ✓. No re-scoring was needed.
- The pre-register said "armed distinct pilot-food texts >= 3 across the
  sweep" — the sweep's variety classifier undercounted (missed variant 1)
  and counted speaker-name-distinct texts rather than cores. The honest
  measure (4 distinct cores armed vs 1 control, per transcript) exceeded
  the bar; next run should pre-register cores, not raw distinct texts.
- Part 2's PRIMARY bound cleanly and the tick-time re-classification was
  a measurement refinement, not a re-score: the original classification was
  the instrument's, never the engine's.
- Wall metrics were guardrails, not levers — 0/16 wins on both sides is
  substrate-norm for pre-seat policies, not a finding.

## FILES

- scripts/test-ambientfix-20261017.js — Part 1 proof (RED/GREEN fixtures + real call-site)
- scripts/sweep-ambientfix-20261017.js — 32-run paired sweep (det-gate + wall metrics)
- scripts/detgate-compare-ambientfix-20261017.js — det-gate comparator
- scripts/sense-ambientfix-20261017.js — transcript capture for sense reads
- scripts/verify-fictiongate-20261017.js — Part 2 honesty-split verification
- evidence/2026-10-17/ambientfix-control/ — 16 control per-seed JSONs
- evidence/2026-10-17/ambientfix-armed/ — 16 armed per-seed JSONs
- evidence/2026-10-17/ambientfix-transcripts/ — persona sequences + 4 full gossip transcripts + summary
- evidence/2026-10-17/sim-ambientfix-b.md — this file
- src/js/alienPlayers.js — the lever (apPilotFoodLine + benevolent branch)

## CONVERGENCE

Part 1: converging → converged (lever landed on branch, det-gate GO,
sense PASS). Part 2: verification duty → converged (split verified, #392
closed).
