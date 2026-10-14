# sim-wave5cond-r27 — SCALE-WALL r27: the CONDITIONAL wave-5 posture, RE-RUN on deterministic code

Arm: `sim-wave5cond-r27` (oversight-flesh-out-loop, run 2026-10-14, axis scale-onramp).
Policy-side only — `scripts/policies/wave5cond.js` (gate `WAVE5COND=1`, default OFF),
rebuilt from the r25 design (evidence/2026-10-14/sim-wave5cond.md; the file was
deleted per the r25 kill protocol). Sweep driver `scripts/sweep-wave5cond-20261014.js`
(restored to service — no changes needed). Proof tests
`scripts/test-wave5cond-20261014.js` (10/10 green, unchanged). No src/js game-code
changes for the layer. One harness change: deterministic sim clock
(scripts/sim-harness.js — see "The entropy hunt" below).

Lineage: r24 measured the blanket post-unlock posture (killed at pilot: 32.8d → 34.8d,
needed +15d). r25 built the conditional design (engage iff trailing-30d scholar
deaths >= 2) and killed it as UNMEASURABLE — per-run nondeterminism made the
identical-seed comparison noise-dominated (det-test: s44 d161 vs d180 in-process).
r26 closed the timestamp-ID entropy source in contest seeding (a9abbd66) — but only
proved s44. This arm re-runs the conditional posture on post-detfix code.

## THE CONDITION (pre-registered — unchanged from r25)

After wave-5 unlock latches, each day count trailing-30d scholar deaths
(succession events, `state.scholar.villagerId` changes — tracked passively from
day 1, no behavior change pre-window or gate-off): ENGAGE the r24 posture verbs
when count >= 2; STAND DOWN when count < 2. At the unlock latch, evaluate
immediately from pre-unlock history. Verbs when engaged: travel guard
(monster-active wild tiles declined; haven + adjacent + homeward-clear allowed;
combatExit always passes), proposal pause, walk-home at engage, dusk top-up feast
vs wave-5 haven threat (honest feast gates + 1.5x buffer, one/day). Not engaged:
pure delegation.

## Pre-registration (MEASUREMENT.md §§9–12, 14) — written BEFORE the sweep

- ARMS: leadfeast (baseline: FEASTSCALE_R13=1, WAVE5COND off) vs condfeast
  (FEASTSCALE_R13=1, WAVE5COND=1). Both sides on post-fix code, identical seeds.
- SEEDS: pilot 11,22,33,44,55,66,77,88 (8; pilot gate per §9).
- HORIZON: 180d death-aware (runDays stops on Game.over / pop zero). Why 180:
  wave-5 is a late metric; shorter caps truncate the survivors that carry the
  post-unlock window. WIN-PATH HORIZON 180 is the absolute max.
- PRIMARY METRIC: mean post-unlock survival days (endDay − unlockDay5) among
  wave-5 unlockers. GO = armed mean >= baseline mean + 15d.
- SECONDARY METRIC: table reaches among wave-5 unlockers. GO = armed >= baseline + 1.
- THIN-N RULE: if unlocks < 2 on BOTH sides → UNMEASURABLE → kill per §9, no
  confirm spend.
- GUARDRAILS: overall median survival within ±10d of baseline; national >=
  baseline−2; no wave-reach regression. (Median guardrail calibrated from A/A
  data per sim-findings #125: the det-gate shows ZERO A/A noise — bit-identical
  trajectories on all 8 seeds for both policies — so the ±10d band is honest,
  not tighter than the noise floor.)
- WHAT WOULD KILL IT: condition never fires on any unlock seed (precondition
  kill); GO missed at pilot (no confirm spend); any guardrail breached.
- INSTRUMENT: scripts/sweep-wave5cond-20261014.js; per-seed JSON
  evidence/2026-10-14/wave5cond-r27-sweep.json. Dot-paths: same as r25
  (summary.perPolicy[].wave5unlock / .meanPostUnlock / .tableAmongUnlockers /
  .national / .table / .medianDays / .exiled / .wcEngageDays / .wcEngages /
  .wcMonsterTileDeclined / .wcFarTravelDeclined / .wcProposalsPaused /
  .wcTopUpFeasts / .wcHomeReturns; rows[].unlockDay5 / .postUnlockDays /
  .wcEngageDays / .wcEngages / .u5ScholarDeaths30d / .windowSay).
- §14 BINDING: a miss is NO-GO, never re-scored against a friendlier metric
  mid-run. Doubts go under "metric review" for the NEXT run.

## The entropy hunt (instrument repair — read before the verdict)

Step 1 ran scripts/det-gate.js on the 8-seed set BEFORE trusting any before/after.
Result: 4/8 DIVERGED (s11 d41, s22 d86, s33 d52, s88 d59) — the r26 detfix closed
only the contest-seed path. Bisect on s11: RNG streams bit-identical through day
41 (136,769 draws each), then run B drew 2 extra draws; first observable split
was pantry (−200 kcal, same item count); `_removePantryKcal` call sites/amounts
identical. Draw-value capture in the split window once showed identical values
through day 60 — the split timing is stochastic across runs. Frozen-`Date.now()`
diag: all 4 divergent seeds flip to bit-identical A/A. ROOT CAUSE: `Date.now()`
embedded in generated IDs (villager `app_<ts>_<rand>`, fighter keys
`'m_ur_'+Date.now()%100000`, link/scam/visitor IDs) — at least one consumer is
order-sensitive to ID strings (in addition to r26's contest path).

FIX (harness-side, scripts/sim-harness.js — no game-code change): loadGame now
installs a deterministic monotonic sim clock (`Date.now = () => 1760400000000 +
(callCount++)`, reset per loadGame). Uniqueness within a run preserved (every
call fresh, like wall-clock); reproducibility across runs holds (same seed →
same call sequence → same IDs). No game logic branches on wall-clock values
(expedition clock is game-time; pacing telemetry uses performance.now and is
decision-free), so behavior is unchanged — only reproducibility. Proof:
scripts/test-deterministic-clock-20261014.js (6/6 green: monotonicity,
cross-run determinism, all 4 previously-divergent seeds A/A identical) and the
r26 gate test still green on s44. Det-gate re-run: ALL 8 SEEDS IDENTICAL, both
policies (baseline + armed). The instrument is repaired — identical-seed
before/after is a controlled comparison again, for every seed.

## RESULTS

Sweep: 16/16 runs completed (8 seeds x leadfeast/condfeast, 180d death-aware,
identical seeds, one process, post-fix code both sides). Per-seed JSON:
evidence/2026-10-14/wave5cond-r27-sweep.json. Proof tests
scripts/test-wave5cond-20261014.js: 10/10 green (unchanged from r25 — the
rebuilt layer re-pins every RED/GREEN). Det-gate: ALL 8 seeds bit-identical
A/A on BOTH policies (see "The entropy hunt" — the comparison is controlled,
not noise-dominated; this is the re-run r25 could not do).

### Pilot numbers (adjudicated, not just reported)

- Baseline (leadfeast): 4 unlocks — s22 u5=57 postU=115 (FULL table),
  s44 u5=58 postU=56, s55 u5=116 postU=8, s88 u5=66 postU=3.
  meanPostUnlock 45.5d; table among unlockers 1; national 5; median 124d.
- Armed (condfeast): 4 unlocks — s22 u5=57 postU=84 (lesser table),
  s44 u5=58 postU=65, s55 u5=116 postU=8, s88 u5=66 postU=3.
  meanPostUnlock 40.0d; table among unlockers 1; national 5; median 124d.
- Condition telemetry (armed): 3 runs active, 4 engages / 1 disengage,
  151 engage-days, 36 monster-tile declines + 77 far-travel declines,
  0 proposals paused, 2 top-up feasts, 0 walk-homes (scholars were already
  home at engage). Trailing-30d deaths at unlock: s22: 2, s44: 3, s55: 1,
  s88: 1 — the condition fired at the latch exactly on the two >=2 seeds
  (s22, s44), plus a 3-day late engage on s55.

### Adjudication (§14 — binding)

- PRIMARY: armed mean 40.0d vs GO (baseline 45.5 + 15 = 60.5d) → MISS
  (and −5.5d below baseline outright).
- SECONDARY: table among unlockers 1 vs GO (baseline 1 + 1 = 2) → MISS.
- Guardrails: median 124 = 124 ✓; national 5 >= 3 ✓; wave-reach 4 = 4 ✓.
- Thin-n rule not triggered (4 unlocks each side).

### Verdict: KILLED AT PILOT — NO-GO (measured, not unmeasurable)

Unlike r25's kill (unmeasurable — noise-dominated), this kill is a measured
rejection on a controlled instrument. The per-seed autopsy:

- **s22 (−31d, full→lesser table): the selectivity hypothesis is FALSIFIED.**
  s22 unlocked with 2 trailing scholar deaths and 20 pantry-days banked —
  the condition fired at the latch "correctly" per its rule and NEVER
  disengaged (85/85 post-unlock days, 45 declined travels). But s22 was not
  in a spiral: the baseline went 115 days post-unlock to a FULL table seat.
  Two scholar deaths in 30 days was attrition, not collapse — and the
  posture pinned a healthy village's scholar home for 85 days, costing 31
  days and the full seat. The >=2 count does NOT discriminate "spiral" from
  "strong village with recent attrition."
- **s44 (+9d): the mechanism works where the village is actually bleeding.**
  3 trailing deaths, 63 engaged days across 2 engages + 1 disengage (the
  oscillation working as designed), 2 top-up feasts fired, 65 vs 56 postU.
  The posture's help is real but small and seed-local.
- **s55/s88 (0d): correctly inert.** s55's 3-day late engage and s88's
  never-engage show the condition standing down where it should.

Net: −31 + 9 + 0 + 0 = −5.5d mean. The r24 blanket posture's failure mode
(helps the dying, costs the strong) is NOT fixed by the >=2 condition —
because the condition cannot tell the two apart. Per §14: no re-score, no
confirm spend. The arm is killed; the policy file is deleted per the kill
protocol; proof + driver + evidence + instruments survive.

## Metric review

§14 honored: both misses are NO-GO as pre-registered — no re-score, no
confirm spend. Doubts recorded here for the NEXT run, not this one:
(1) The +15d GO bar assumed the layer's upside concentrates on weak
unlockers; s22 shows the downside concentrates on misclassified strong
ones — a future conditional design should pre-register a per-seed
asymmetric analysis (help on true spirals vs cost on false positives),
not just the mean. (2) Mean post-unlock among unlockers is still
conditioned on unlocking, but with deterministic code the unlock SET was
identical both sides (4/4 same seeds) — the r25 subset-composition worry
did not materialize here. (3) The median guardrail (±10d, calibrated from
zero A/A noise) passed trivially (124=124) — the calibration held.

## Village assessment

What the villages looked like: four wave-5 windows, and the posture's
judgment call on each.

**s22** is the tragedy of a false positive. The transcript at the latch
(d57) shows a thriving village: Kira of Stonebridge walks in with 2,875
kcal ("Eat. We'll settle the books when the green comes back"), the
village pays 2,250 kcal tribute to Emberhold ("The fire network. That's
what it's FOR"), Theo smokes 3 batches, the codex grows. Two scholars died
in the last moon — and the village braced. The brace line reads as a real
decision ("Two scholars lost in a moon. The village braces — no more
ranging, no new courts. Home ground, full bellies, and the table."). But
the village was mourning, not dying — and the posture could not tell the
difference. 85 homebound days later: lesser seat instead of full, dead at
d141 instead of d172. Who thrived: no one — the posture's caution was the
injury. What was missing: not a better posture but a better TRIGGER — the
count of deaths, without their shape (accelerating? pantry collapsing?
standing falling?), is attrition data, not spiral data.

**s44** is the posture working as designed, small and honest. Three
trailing deaths at unlock, the brace fires d58, and the village oscillates:
engage, bleed, disengage when the deaths age out, re-engage when fresh
ones land (2 engages / 1 disengage / 63 days). Two dusk top-up feasts fire
against wave-5 haven threats. The Red Table's Ines walks in mid-window
with 2,468 kcal ("Heard your bins are echoing") — the village lives around
its homebound scholar, traders still come, the pantry carries. +9 days.
Not a rescue — a hand on the shoulder.

**s55/s88**: the condition correctly stands down (1 trailing death each);
identical trajectories both sides. The layer is inert where it should be.

Who died and why: the usual wave-5 wall — monster/villager 72,
villager/player 40, villager/villager 68 across the 16 runs. No wins, no
vests; national 5/8 both sides (the scale wall stands — this arm was never
going to move it, but the wall numbers are reported per the standing
directive).

Blanks filled: none — the arm is killed. Blanks documented: (a) the
Date.now()-ID entropy class — DIAGNOSED AND FIXED at the instrument level
(deterministic sim clock in sim-harness.js; the two "residual
nondeterminism" sim-findings entries are now closed); (b) the s22
selectivity falsification — a death-COUNT trigger cannot discriminate
spiral from attrition; the next conditional design needs a spiral-SHAPED
trigger (death acceleration, pantry/standing trajectory, or explicit
spiral markers), filed to sim-findings.md.

## Sense test (SENSE-TESTING LAW)

Three window transcripts read (s22, s44, s55 — the armed runs with
engage-days). The brace line fires exactly at the latch in s22 and s44 and
reads as a village decision in context: in s44 it follows real strain
(fever, night-shift dread, the Red Table's aid); in s22 it follows two
mourned deaths amid a living village (traders, tribute, feasts, codex
growth). The engaged days interleave posture effects with living beats —
declines never appear as bare engine text (the guard is silent, as
designed; the SAY_RE capture shows no "declined" lines, which is correct:
a declined travel is a decision not taken, not an announcement). The two
top-up feasts on s44 fire without fanfare in the transcript (they're
ordinary feasts — correct; a top-up feast should not read as an emergency
broadcast). The sense test PASSES — which is why this kill is purely
outcome-driven: the posture is coherent, its beats read as decisions, its
condition fires selectively; but on a controlled instrument it costs more
than it saves because the trigger misclassifies strength as spiral.
