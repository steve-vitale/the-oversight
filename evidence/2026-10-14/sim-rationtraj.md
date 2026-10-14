# PANTRY-TRAJECTORY RATION LEVER — policy arm (scale-onramp, fleshout-a 2026-10-14-2315, ARM 4: sim-rationtraj)

Axis: scale-onramp. Policy-side arm, default OFF (RATIONTRAJ=1), zero
game-code changes. Claims sim-findings #177 (RATION-CALL TIMING): the r31
raidration arm KILLED per §14 (primary −6.25d vs +20d bar on
predation-positive seeds). The siege detector keyed on gorge nights, but the
killer sieges are the ones where the pantry is ALREADY EMPTY when the call
comes (s11: engaged d112, pantry empty since d110 — the ration call was a
eulogy). This arm rebuilds the r31 spec (evidence/2026-10-14/sim-raidration-r31.md)
but RE-KEYS the trigger to pantry trajectory: the ration call engages when
fresh-days are falling and thin (or nearly gone), not when a gorge counter
trips. The defender-meal verb is NOT rebuilt per #178 (unreachable: the
scholar is never topped up during a real siege — the watch-meal precondition
contradicts its trigger). The survival mechanism is feast pause + honest beg
refusal (pantry savings), not fed-defender DPS. Tribute/tend untouched
(the scale engine — a ration call that breaks the courtship road isn't a
ration call, it's a surrender); donations untouched (inflow).

Canon read: docs/CANON.md (no silent actions — every suppression narrates;
knowledge gates surfaces — not touched by this arm). No canon doc covers
siege rationing specifically; the design below is ordinary village survival
logic (a village whose stores are draining calls the ration before the stores
are empty), documented here for Steve to overrule.

## Pre-registered header (docs/MEASUREMENT.md §§9–12, 14) — written BEFORE any sims

- **HYPOTHESIS**: keying the ration call on pantry trajectory (fresh-days
  thin AND draining) engages the savings verbs while the pantry still holds
  food to save — before the eulogy point — reducing starvation deaths vs the
  leadfeast baseline on identical seeds.
- **MEASUREMENT**: identical seeds, post-fix code BOTH sides. Baseline:
  leadfeast (FEASTSCALE_R13=1) + predation-lib telemetry. Armed: leadfeast +
  scripts/policies/rationtraj.js (RATIONTRAJ=1) + predation-lib telemetry.
  Gate-off side delegates byte-identically (proof RED phase pins it).
  Same-road constraint (finding #230 content / THROTTLE ROAD-DEPENDENCE):
  the leadfeast road is held fixed on both sides.
- **SEEDS/POLICIES**: 11/22/33/44/55/66/77/88 × leadfeast, 180d
  death-aware, identical seeds armed vs baseline.
- **DET-GATE FIRST**: 8/8 identical per side required (two in-process
  invocations per combo, day-hash compare). A diverged seed is EXCLUDED from
  the before/after comparison (per det-gate.js's own rule). >2 diverged
  seeds → the comparison is untrustworthy → KILL as unmeasurable.
  (Known risk, det-gate.js header: timestamp-based villager IDs leak into
  contest RNG on fight-heavy seeds — leadfeast s44 is the documented case.)
- **TRIGGER (pre-registered design — Steve can overrule)**:
  `Game.pantryFreshDays()` (engine, read-only: fresh spoil-risk kcal at the
  measured burn rate; 999 when the village covers itself) is sampled every
  policy.daily into a trailing 7-day window. slope = least-squares slope of
  the window; a full 7-sample window is required (earliest engagement ~day 8).
  ENGAGE when (freshDays < 3 AND slope < −0.05) — thin and draining — OR
  freshDays < 1 — nearly gone, regardless of slope. DISENGAGE when
  freshDays > 4 (solid recovery) OR slope > 0.15 on 2 consecutive days
  (recovering). The gorge counter is gone: a gorge night that doesn't move
  the pantry trajectory no longer declares a siege; a draining pantry with
  no gorges still calls the ration.
- **VERBS (while engaged, pre-registered — Steve can overrule)**:
  1. FEAST PAUSE: refuse-through wrap on Game.hostFeast during the
     policy.upkeep (finally-restored), each refusal narrated honestly (it
     genuinely would have fired — the gates passed).
  2. BEG REFUSAL: force-refuse wrap on Game.answerAidBeg during the
     policy.daily (finally-restored), narrated with the beggar named.
     Dedupe (#179, cheap): first refusal per beggar per engagement gets the
     full beat (name + cost); repeats get a short holding beat, never the
     verbatim repeat.
  3. NO SILENT ACTIONS: engage/disengage beats + one beat per suppressed
     outflow. Beats must read as a village deciding to tighten under a
     draining pantry (sense-tested by reading).
- **PRIMARY**: armed starvation deaths ≤ control−2 AND armed median ≥
  control−5d.
- **GO**: primary met AND guardrails clean — national ≥ control−2, no new
  death mode (cause-FAMILY level: armed-only family with n≥3 per #215),
  exiled ≤ control+1.
- **KILL**: primary missed → NO-GO per §14 (never re-scored); guardrail
  miss → NO-GO; kill protocol: delete the layer, revert byte-clean, keep
  proof/sweep/det-gate/evidence as instruments with a "KILLED AT PILOT"
  file.
- **Instruments**: scripts/sweep-rationtraj-20261014.js (SIDE=baseline|armed,
  --invocations=2 det-gate mode); scripts/test-rationtraj-20261014.js
  (REAL RED→GREEN: gate-off byte-identical trajectories; trigger fires on
  falling fresh-days, silent on gorge-noise; det-gate shape; SMOKE=1
  instrument-honesty gate).
- **Wall numbers reported every run**: national / table / wins, wave 4–5
  unlocks, median survival (both sides).
- **Per-seed JSON**: emitted under evidence/2026-10-14/rationtraj-per-seed/
  for scripts/telemetry-check.js vs the scale-wall baseline.

## Build log (post-registration)

Built scripts/policies/rationtraj.js (RATIONTRAJ=1, default OFF) wrapping
leadfeast: daily pantryFreshDays() sampling into a trailing 7-day window,
least-squares slope, engage at (freshDays<3 AND slope<−0.05) OR freshDays<1,
disengage at freshDays>4 OR slope>0.15 ×2d. Verbs: feast pause (upkeep,
refuse-through, narrated) + beg refusal (daily, through the REAL
answerAidBeg('refuse') so trust/gossip consequences stand — cf. finding #201;
dedupe per beggar per engagement per #179). Defender-meal NOT rebuilt (#178).
Zero game-code changes. Instruments: scripts/test-rationtraj-20261014.js
(RED→GREEN + SMOKE=1), scripts/sweep-rationtraj-20261014.js
(SIDE=baseline|armed, --invocations=2, tele('death') cause telemetry, rt*
ctx harvest, per-seed JSONs under evidence/2026-10-14/rationtraj-per-seed/).

## Proof test (scripts/test-rationtraj-20261014.js)

41/41 checks green, ALL GREEN (SMOKE=1 RED at 30d; full run RED at 180d
byte-identical over the full lived trajectory, 116d seed 44, village-lost
both sides).
- RED: gate-off rationtraj == raw leadfeast trajectory, byte-identical
  per-day hashes (30d smoke, 116d full).
- G1: pure evalTrajectory — falling+thin engages; falling-but-full silent;
  gorge-noise window silent (the r31 false-positive class); nearly-gone
  engages regardless of slope; 999 steady-state silent; short window refuses
  to decide. Live: policy.daily samples the real pantryFreshDays() into
  ctx._rtWindow; updateRationCall engages/disengages on a real game with
  narrated beats.
- G2: disengage via the 2-day recovering-slope streak (streak 1 → still
  engaged; streak 2 → disengaged + lift beat).
- G3: engaged feast refused {ok:false, 'under the ration call'}, narrated,
  pantry untouched (47,250 → 47,250), verb restored, counted.
- G4: engaged beg force-refused through the real verb (returned 'refused'),
  narrated with the beggar named (Testville); dedupe: repeat gets the short
  holding beat ("Same word as yesterday"), never the verbatim repeat; no
  pending beg → delegates to the real verb.
- G5: feedWatch absent by design (#178).
- G6 SENSE-TEST (read, not counted): "RATION CALL — Ellie calls it plainly
  at the fire: the stores stand at 2 fresh-days and falling. No feasts while
  the bins drain. Beggars get an honest no. The village eats lean until the
  stores recover." / "A beg came from Stonebridge — and Haven says no, aloud,
  with the stores at 1.8 fresh-days. ... They'll remember this." / "The
  ration call lifts — the stores stand at 4.7 fresh-days (recovered)."
  Verdict: reads as a village deciding, not dispenser text.
- Kill-protocol SKIP built in: if the layer is deleted the proof exits 0
  pointing at this evidence file.

## Det-gate

Baseline (SIDE=baseline, leadfeast FEASTSCALE_R13=1, --invocations=2):
**8/8 IDENTICAL** — 11: 170d, 22: 86d, 33: 128d, 44: 103d, 55: 93d,
66: 54d, 77: 75d, 88: 58d. The det-gate.js KNOWN ISSUE (timestamp-ID contest
nondeterminism, leadfeast s44) did not bite this run. predation-lib
instrument errors: 0 on all 16 invocations.
Armed (SIDE=armed, RATIONTRAJ=1, --invocations=2): **8/8 IDENTICAL** — the
det-gate is met on both sides; cross-side deltas are deterministic
consequences of the layer, not noise. predation-lib instrument errors: 0
on all 16 invocations.

## Before/after on identical seeds

| seed | days B/A | starv B/A | nat B/A | table | exiled | rtEng | feasts refused | begs refused | diseng |
|---|---|---|---|---|---|---|---|---|---|
| 11 | 170/170 | 0/0 | 1/1 | 0/0 | 0/0 | 3 | 0 | 1 | 2 |
| 22 | 86/86 | 0/0 | 0/0 | 0/0 | 0/0 | 1 | 0 | 0 | 0 |
| 33 | 128/128 | 0/0 | 1/1 | 0/0 | 0/0 | 2 | 0 | 0 | 1 |
| 44 | 103/103 | 0/0 | 0/0 | 1/1 | 0/0 | 3 | 0 | 2 | 2 |
| 55 | 93/93 | 0/0 | 0/0 | 0/0 | 1/1 | 5 | 0 | 0 | 4 |
| 66 | 54/54 | 1/1 | 0/0 | 0/0 | 0/0 | 1 | 0 | 0 | 0 |
| 77 | 75/75 | 0/0 | 0/0 | 0/0 | 0/0 | 1 | 0 | 0 | 0 |
| 88 | 58/60 | 2/1 | 0/0 | 0/0 | 0/0 | 3 | 1 | 0 | 2 |

PRIMARY (pre-registered: armed starvation deaths ≤ control−2 AND armed
median ≥ control−5d): control starvation deaths = 3 (s66: 1, s88: 2);
armed = 2 (s66: 1, s88: 1). 2 > 3−2=1 → **PRIMARY MISSED → NO-GO per §14**
(never re-scored). Armed median 89.5d = control 89.5d (≥ 84.5d ✓) — but the
primary needs both.
Guardrails: national 2/8 both (≥ control−2 ✓); no new death mode — armed
death families byte-identical to baseline except s88 starvation 2→1
(fewer, not new; no armed-only family at n≥3 ✓); exiled 1/8 both
(≤ control+1 ✓). Guardrails clean, primary missed — NO-GO.

What the numbers say: the trigger ENGAGED on all 8 seeds (1–5 engagements
each, 0–4 disengagements — the trajectory detector fires live and lifts on
recovery), but the savings verbs found almost nothing to save: 1 feast
refused and 3 begs refused across 8×180d. 7/8 seeds have byte-identical
survival days; s88 moved 58→60d (−1 starvation death). The mechanism is
directionally right on the one seed where starvation deaths exist (s88) and
inert everywhere else. #177's timing fix was necessary but not sufficient:
the discretionary outflows a ration call can pause are too thin to move
starvation deaths.

## Wall numbers

| metric | baseline | armed |
|---|---|---|
| national | 2/8 | 2/8 |
| table | 1/8 | 1/8 |
| wins | 0/8 | 0/8 |
| wave 4-5 unlocks | 6/8 | 6/8 |
| max wave | 5 | 5 |
| max Arc | IV | IV |
| median survival | 89.5d | 89.5d |
| vests | 0 | 0 |
| exiled | 1/8 | 1/8 |
| starvation deaths | 3 | 2 |

The scale wall stands: 0 wins either side. The ration layer moves neither
the ceiling nor the floor.

## Village assessment

**s88 (the mover, 58→60d, starvation 2→1)** — the only seed where the
mechanism touched the primary. Live-beat slice (armed): d48 "RATION CALL —
Helga calls it plainly at the fire: the stores stand at 2.7 fresh-days and
falling. No feasts while the bins drain. Beggars get an honest no."; d49 one
real feast refused ("No feast tonight — the stores stand at 2.7 fresh-days
and falling"); d50 "The ration call lifts — the stores stand at 8.1
fresh-days (recovered)"; d52 a second call at 2.9 fresh-days; d57 lift at
4.5; d59 a third call at 0 fresh-days — the village lost at d60. The beats
read as a village deciding: named caller (Helga), named stores, lifts on
recovery. The d59 call at 0 fresh-days is the eulogy shape #177 warned
about — but it came as the THIRD engagement after two honest earlier calls,
not the first; the trigger engaged early (d48) and the verbs fired while
food remained. The village died of the same combat/sickness mix either way
(death families byte-identical except the one starvation death).

**s11/s33 (national seeds, 0 delta)** — the trigger engaged 3×/2× on
170d/128d survival trajectories and changed nothing: these villages die of
combat and sickness with full-ish pantries; a ration call is irrelevant to
their end. s55 engaged 5× (most of any seed) on a 93d trajectory — the
trajectory trigger is sensitive (thin-and-draining happens often on this
road), and the verbs still found nothing (no feasts, no begs came).

**The pattern**: starvation deaths are RARE on this road (3 in 8×~750
village-days; the baseline dies of combat/sickness at 89.5d median). A
ration lever aimed at starvation deaths is aimed at a thin target — the
primary's bar (≤1) was reachable only on s88's shape. The trigger works;
the savings verbs don't find enough outflow to matter; the bind is the
wrong door again, one level down from r31's.

## Blanks filled / documented

- **sim-findings #177 follow-up — KILLED per §14, NO-GO.** The
  pantry-trajectory ration call does not move starvation deaths past the bar
  (armed 2 vs control−2 = 1). Killed; policy file deleted per kill protocol
  (proof + sweep + det-gate + per-seed JSONs + this evidence land as
  instruments).
- **New open blank: SAVINGS VERBS TOO THIN** — the trajectory trigger
  engages live on all 8 seeds and lifts on recovery (honest, sense-tested),
  but feast pause + beg refusal find ~nothing to save (1 feast, 3 begs in
  8×180d). A ration lever that bites needs a bigger savings verb (what
  discretionary outflows actually exist during a thin-and-draining
  stretch?) or a different bind — starvation deaths are 3/8 seeds on this
  road; combat/sickness end the other 5. Filed to sim-findings.md.
- **#179 closed by construction**: beg-refusal dedupe proven (full beat
  once per beggar per engagement, short holding beat on repeats); the "1
  gorge nights" pluralization nit is gone with the gorge language (beats
  speak fresh-days).
- **#178 honored**: defender-meal verb never rebuilt (G5 pins the absence).
- **Feast/siege coincidence re-confirmed**: 1 refused feast in 8×180d — the
  policy's own feast gates already avoid feasting into thin stretches.

## Metric review (§14, mandatory)

- PRIMARY (armed starvation deaths ≤ control−2 AND armed median ≥
  control−5d): MISSED on the first clause (2 vs ≤1). NO-GO per §14 — not
  re-scored, not re-scored against a friendlier metric. The 7/8
  byte-identical trajectories are the signal: the layer changes almost
  nothing.
- Det-gate 8/8 both sides: MET — cross-side deltas trustworthy.
- Guardrails (national ≥ control−2, no new death mode at the n≥3 family
  floor, exiled ≤ control+1): all MET. The NO-GO is on the primary alone.
- Metric concern for the next arm: starvation deaths are 3/8 on this road —
  the primary's bar was calibrated on a sparse target. A future ration
  lever should pre-register a per-firing savings metric (kcal actually
  saved per engagement) or a pantry-depth metric rather than a rare-event
  count. Also: median is a blunt instrument here — both sides 89.5d to the
  decimal with 7/8 identical seeds.
- The predation-positive classification (r31's pre-screen) was correctly
  NOT applied here: the trigger is pantry trajectory, not gorges; gorge
  nights ran 0–4/seed this run (the r30 drought shape) and the arm is
  measurable regardless.

## Convergence report

- Convergence: KILLED at the primary (NO-GO). Axis scale-onramp: still
  blocked (0/8 wins both sides; the ration layer moves neither ceiling nor
  floor).
- Wall numbers this run: national 2/8, table 1/8, wins 0/8, wave 4–5 on
  6/8, median survival 89.5d — identical both sides except starvation
  deaths 3→2.
