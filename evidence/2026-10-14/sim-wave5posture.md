# sim-wave5posture — SCALE-WALL r24, ARM 2 of 3: the wave-5 survival lever

Arm: `sim-wave5posture` (oversight-flesh-out-loop, run 2026-10-14, axis scale-onramp).
Base SHA: a6b392b1. Policy-side only — new file scripts/policies/wave5posture.js
(gate `WAVE5POSTURE=1`, default OFF); sweep driver
scripts/sweep-wave5posture-20261014.js; proof tests
scripts/test-wave5posture-20261014.js (10/10 green). No src/js game-code
changes. No game balance changes — the posture only drives existing verbs.

Context: the plentycost confirm (evidence/2026-10-14/sim-plentycost.md)
measured the wall's current face: 0/6 wave-5 unlockers reached the table on
15 seeds; the one table reach (s303) died AT the table in a 7-deep succession
chain. The feast policy arm (leadfeast) is what produces wave-5 unlocks via
the Standing plenty path. The r17 tablerecon instruments
(tableSeat/deedGateReady rows, waveLedgerPoints sampling, bounded story
capture) were reused in trimmed form.

## The posture (design)

Once wave-5 unlocks (`Game.unlockedWave() >= 5`), shift from expansion to
survival as an opt-in policy layer on leadfeast:
(a) scholar avoids non-haven fights — monster-active wild tiles declined at
    the movement layer (wraps leadfeast's own `Game.travelTo`; combatExit
    barrier exits always pass — the guard never touches fleeing); haven
    defense still engages (fight path untouched — sanctuary semantics are
    Steve's design call, so minimize exposure, don't change engine).
(b) pause new link proposals (`Game.proposeLink` wrapped to decline in the
    window) — tend existing links at the weekly maintenance cadence only.
(c) keep the scholar at/near haven — travel held to haven + adjacent nodes;
    return-home hops always allowed (a stranded scholar walks back one node
    at a time); at window latch, the scholar walks home first.
(d) feast to topped-up before deliberate wave-5 fights — at dusk in the
    window, if a wave-5 monster is on the haven tile and the scholar isn't
    feasted, host an honest feast (feastPlan gates + 1.5x pantry buffer,
    one/day); the feast-surge buff (feastburn conversion, canon) rides into
    the night's fight.
Graceful degradation: parent resolved defensively (falls back to leadcourt
if the feastscale file is gone — r21b/r23 lesson); gate off = pure
delegation, byte-identical (RED-pinned in the proof test).

## Pre-registration (MEASUREMENT.md §§9–12, 14) — written BEFORE the sweep

- ARMS: leadfeast (baseline: FEASTSCALE_R13=1, WAVE5POSTURE off) vs
  posturefeast (FEASTSCALE_R13=1, WAVE5POSTURE=1).
- SEEDS: 11,22,33,44,55,66,77,88 (8; pilot gate per §9).
- HORIZON: 180d death-aware (runDays stops on Game.over / pop zero). Why 180:
  wave-5 is a late metric; shorter caps truncate exactly the survivors that
  carry the post-unlock window. WIN-PATH HORIZON 180 is the absolute max.
- PRIMARY METRIC: post-unlock survival days (endDay − unlockDay5) among
  wave-5 unlockers ≥ baseline + 15d, OR table reaches among wave-5 unlockers
  ≥ baseline + 1.
- THIN-N RULE (pre-registered): expect ~3 unlocks/8 seeds (plentycost
  pattern on these seeds: s44/s55/s88). If unlocks < 2 on BOTH sides →
  UNMEASURABLE → kill per §9, no confirm spend.
- GUARDRAILS: national within ±2 of baseline, median survival ±10d, exiled
  ≤ baseline + 1.
- INSTRUMENT: scripts/sweep-wave5posture-20261014.js; per-seed JSON:
  evidence/2026-10-14/wave5posture-sweep.json. Dot-paths:
  summary.perPolicy[].wave5unlock / .meanPostUnlock / .tableAmongUnlockers /
  .national / .table / .medianDays / .exiled; rows[].unlockDay5 /
  .postUnlockDays / .wpActive / .wpMonsterTileDeclined / .wpFarTravelDeclined
  / .wpProposalsPaused / .wpTopUpFeasts / .wpHomeReturns / .windowSay.

## RESULTS

Sweep: 16/16 runs completed (8 seeds x leadfeast/posturefeast, 180d
death-aware, identical seeds). Per-seed JSON:
evidence/2026-10-14/wave5posture-sweep.json (dot-paths in the
pre-registration header). Proof tests scripts/test-wave5posture-20261014.js:
10/10 green (gate-off byte-identical delegation RED-pinned; gate-on
pre-window no-op; travel guard; proposal pause; top-up gates; defensive
load).

Per-seed (policy / seed: endDay endReason, unlockDay5, postUnlockDays):
- leadfeast: s11 d48 lost; s22 d180 survived table(lesser); s33 d92 lost u5=79 postU=13; s44 d133 lost u5=111 postU=22; s55 d171 lost u5=83 postU=88 table(lesser); s66 d117 lost u5=103 postU=14 table(lesser); s77 d110 lost u5=66 postU=44; s88 d82 lost u5=66 postU=16
- posturefeast: s11 d48 lost; s22 d180 survived table(lesser); s33 d111 lost u5=79 postU=32; s44 d149 lost u5=111 postU=38; s55 d180 survived u5=83 postU=97 table(lesser); s66 d110 lost u5=103 postU=7 table(lesser); s77 d88 lost u5=66 postU=22; s88 d79 lost u5=66 postU=13

PRIMARY — post-unlock survival days (mean among unlockers):
- leadfeast: 32.8d (unlocks 6/8; per-seed postU 13,22,88,14,44,16)
- posturefeast: 34.8d (unlocks 6/8; per-seed postU 32,38,97,7,22,13)
- GO needed ≥ baseline + 15d (47.8). 34.8 vs 47.8 → **MISS by 13.0d.**
- OR branch: table reaches among wave-5 unlockers ≥ baseline + 1 → 2 vs 2
  (both: s55, s66) → **MISS.**
- Thin-n rule: 6 unlocks on BOTH sides (≥ 2) → measurable, no §9 kill-by-
  unmeasurable. Verdict is a clean NO-GO on the pre-registered metric.
- Median post-unlock (not pre-registered, reported): 22 → 32 (+10d). The
  median tells a less-bad story than the mean — see metric review.

GUARDRAILS (all held):
- national: 6 → 5 (within ±2)
- median survival: 117d → 111d (within ±10d)
- exiled: 0 → 0 (≤ baseline+1)

SECONDARIES / posture telemetry (armed, 6 window runs):
- wpMonsterTileDeclined 445, wpFarTravelDeclined 29 — the movement guard
  fires heavily; wpProposalsPaused 0 (courtship already complete by the
  window — the proposal pause never had anything to decline);
  wpTopUpFeasts 1 (a wave-5 monster on the haven tile while unfeasted is
  rare); wpHomeReturns 0 (scholars were already home at latch).
- Death causes (both policies): villager/monster ~1/3, villager/villager
  ~1/3, villager/player ~1/3 — the posture does NOT change how villages
  die, same as the feast layer before it.
- Starvation: median starveDays 0 both policies; pushStarveDays 0 both;
  pantryDaysMed 12 → 16. The posture does not starve the village — the
  pantry carries the homebound scholar.
- t5 crossed 7/8 both; feasts 56 → 55 (the feast economy is untouched).

Paired per-seed Δ (postU armed − baseline): s33 +19, s44 +16, s55 +9,
s66 −7, s77 −22, s88 −3. The posture helps villages that die FAST
post-unlock (s33/s44: the weak-window deaths it was built for) and is
neutral-to-negative on strong ones — s77 lost 22 days AND its national
(armed nat=0 vs baseline nat=1). Where the village is strong, the scholar's
ranging is load-bearing; pinning them home costs more than the exposure
saves.

NONDETERMINISM NOTE: seed 88 ran three different trajectories across three
identical invocations (d=86 u5=68 / d=82 u5=66 / d=102 no-unlock / d=84
u5=68 on the baseline policy alone). The sim has a genuine noise floor on
long fight-heavy trajectories — filed as a sim-findings item. The verdict
gap (+2.0d vs +15d needed) is well outside plausible noise; the NO-GO is
robust.

## Metric review

§14 honored: the pre-registered GO missed on both branches → NO-GO, arm
killed, no re-score. Doubts recorded here for the NEXT run, not this one:
(1) mean post-unlock is conditioned on unlocking — on thin n the subset
matters more than the lever; median (+10d here) may be the more robust
primary. (2) The posture can in principle prevent the unlock condition
itself (fewer wild fights → waveEngaged(4) never trips) — a future metric
should count "unlocks" as an outcome, not just a conditioning set.
(3) The thin-n rule held (6/8 unlocks), but the s88 nondeterminism shows
identical-seed before/after is necessary but not sufficient — pair the
seeds AND budget for the noise floor.

## Village assessment

What the villages looked like: the wave-5 window is a siege, and both
policies live it the same way — the difference is where the scholar
stands. Baseline scholars keep ranging: they forage, loot, and walk into
wave-4/5 fights on wild tiles; the weak ones die fast (s33: 13 post-unlock
days), the strong ones bank long post-unlock runs (s55: 88 days, table).
Armed scholars come home at the latch and stay: 445 monster-tile declines
and 29 far-travel declines across 6 window runs. The weak ones live longer
(s33: 13→32, s44: 22→38) — the posture does what it was built for, on the
villages that needed it. The strong ones pay for it (s77: 44→22, national
lost; s66: 14→7) — their ranging was feeding the engine that kept them
alive, and home is not free.

Who thrived: scholars whose villages were already dying when wave-5
unlocked — exposure was their whole problem. Who died: everyone,
eventually, to monsters — death-cause shares identical across policies.
What was missing: nothing the posture could supply — the blank is still
downstream (surviving wave-5 content once unlocked), and this lever's
answer (don't go out there) only moves the weak half of the distribution.

Blanks filled: none — the arm is killed. Blanks documented: (a) seed-88
nondeterminism → sim-findings; (b) the weak/strong split in post-unlock
trajectories — a future arm could target ONLY the weak-window villages
(e.g. posture engages only when the village is already losing scholars,
not as a blanket rule).

## Sense test (SENSE-TESTING LAW)

Window-day transcripts (120 lines/run, posture-gated capture) read as
bracing, not turtling. The latch line fires honestly — "The fifth wave is
on the ledger. The village braces — no more ranging, no new courts. Home
ground, full bellies, and the table." — and the decline line reads as a
decision, not a bug: "No ranging while the fifth wave is up. The village
needs its scholar home." The village keeps living around the homebound
scholar: Nora cooks with the racks already full (13,754 kcal kept), traders
walk in, the fire network pays out (2,813 kcal to a starving Stonebridge),
raids still come TO haven (a Moderator-led raid hits the stores on s33 —
the posture never promised safety, only fewer self-inflicted fights).
Starvation warnings on s88 (d66-68) are transient scholar-level flags —
village starveDays median 0 on both policies, pantry med 16 days. The
transcripts do NOT show a village turtling into starvation; they show a
village bracing with a full pantry. The sense-test passes — which is why
the kill is purely metric-driven: the posture is coherent, it just doesn't
move the pre-registered number.
