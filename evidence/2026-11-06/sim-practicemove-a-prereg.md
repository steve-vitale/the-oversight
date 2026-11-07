# sim-practicemove-a — preregistration (practice-movement gap: replicate + diagnose)

- Run: `fleshout-2026-11-07T0221Z`, Loop A, axis scale-onramp / winnability
  chain (tracker blank #4 from the 0059Z round: role-formation
  practice-movement gap).
- Arm: `sim-practicemove-a`, worktree
  `~/workspace/worktrees/sim-practicemove-a`, branch `sim-practicemove-a`.
- Band: **99891–99898** (8 seeds, pilot), horizon 80d death-aware,
  competent policy verbatim. MEASUREMENT FIRST; build only if the
  diagnosis finds a small gate in the practice path (see below).
- Claim: coordinator claim `fleshout-2026-11-07T0221Z.json` names this arm
  (sibling arms sim-finishersize-a, sim-durablepair-a,
  sim-killersurvive-b — NOT touched).

## Band-reuse justification (recorded, deliberate)

Band 99891–99898 was freshness-checked by the roleform prereg (0 hits
across ALL dated preregs + forbidden/contaminated lists) and used once,
by sim-roleform-a (8 seeds, 80d, competent, landed 79137ca39). Reuse
here is DELIBERATE and justified, not contamination: this arm is a
REPLICATION of that exact measurement on the same seeds on current
master (master has moved since: grind, tbend, armorcap, routstall,
journey-deepening landings), and identical seeds are the before/after
base for any build leg. The question is whether the roleform numbers
reproduce, not whether a fresh band is free. No fresh band is taken by
this arm; a confirm (12–16 seeds) would take a fresh,
fully freshness-checked band (grep ALL dated preregs
evidence/*/sim-*-prereg.md plus forbidden/contaminated lists) and
never reuses 99891–99898 for a fresh screen.

## The gap as briefed — and the correction this replication must test

The brief states the roleform census "found practice moves competence
NOWHERE — the census GO is carried by track/deed levels, not
practice". That is NOT what the roleform evidence file says. Read
plainly, `evidence/2026-11-06/sim-roleform-a.md` reports practice
moving competence in organic play: 33 changed competence cells / 50
rung steps (field 14, craft 36), 195 rung-gain "getting the hang of …"
lines, across 45 qualifying villagers — and its own §"How the GO is
actually built" says practice reaches field + craft only, while the
5/5-track BREADTH of the GO is carried by track/deed levels (combat,
social, strange show zero competence movement because the work is
never assigned). The 0059Z adoption round's summary ("practice moves
competence nowhere on the census") misread the evidence file; the
brief inherited that misreading. This replication settles it with
counts on current master: either the roleform practice numbers
reproduce (brief's premise REFUTED, diagnosis = why practice reaches
only the tasks it reaches) or they do not (premise CONFIRMED, the
roleform instrument or the practice build regressed — stop and say
so). Either outcome is a reportable result, not a failure.

## Mechanisms (code-verified before the prereg, not assumed)

- Practice → competence is ONE path: `Game.villagerPractice(vid, task)`
  (src/js/game.js, landed 2b9b0371e) is the ONLY writer of
  `vp.practice[task]`; it is called once per resolved assignment
  (resolveOneAssignment tail, final task only). Reps 8/20/36 → rungs
  0.7→1.0→1.2→1.3→1.4, capped at 1.4. Competence therefore has exactly
  two inputs: occupation base (+ temperament) and practice steps. A
  competence delta IS practice-attributed by construction; the analyzer
  still cross-checks every rung gain against reps gained (a rung gain
  with <8 reps would falsify the instrument).
- Practice does NOT touch specialistSkill: `specialistSkill`
  (src/js/food.js:1230) is occupation match ONLY, plus +1 if base > 0
  AND `foodXp[task] >= 5`. `foodXp` is written ONLY by the
  smoking/preserving path (food.js:1471, the person doing the smoking)
  — practice reps never feed it. So a non-matching occupation stays
  specialistSkill 0 forever, however much they practice. That is the
  hard gate the census's "skill 0→positive for 0 villagers" measures.
- `practice-deeds.js` is NOT the villager practice path: it wires
  SCHOLAR-side deed grants (stalk, blood_trail, ambush, war_cry,
  haymaker, soft_step) for System ability offers. The villager
  practice path is game.js `villagerPractice`; `learnSkill` is the
  scholar-side skill-gain dispatcher. Any build in this arm lives in
  the villager practice path (game.js villagerPractice /
  resolveOneAssignment tail) — NOT practice-deeds.js, NOT the
  track/deed system, NOT the drive build's thresholds (unless the
  diagnosis proves a threshold is the gate, in which case that is a
  named lever for the next arm, not a silent retune here).
- Opportunity channels (two, both instrumented): (1) direct
  assignments via `Game.assignTask` — trust/obedience/fitness-gated,
  one part per assignment, deleted on resolution; (2) task leads via
  `v.taskLeads[task] = vid` — the lead works their domain EVERY part
  (3/day) with no assignTask call. Seed 99891's roleform corpus
  already shows the split: wood/stone resolve 74× each with ZERO
  assignTask records (leads), while fish is assigned 75× and resolves
  0× — the prod-throttle redirect (game.js resolveOneAssignment:
  pantry >4 fresh days turns fish/forage/garden into an alt task
  wood/water/stone, recorded under the FINAL task) is the prime
  suspect for the fish shape. The analyzer counts offered (assignTask
  ok/refused + lead-days × 3 parts) vs resolved per task, so each
  task's zero is attributed to exactly one gate: never offered /
  offered-but-refused / offered-but-redirected / offered-and-resolved.
- Teaching spreads SKILLS (npcSkills), not competence:
  skill-teaching.js + `skill_lesson` telemetry rows. Track levels
  (deeds → XP → level-ups) grant skills via the level-up sheet.
  The analyzer attributes each qualifying villager's skills gained to
  lessons-learned vs track-level-ups vs other, so the "who taught
  whom" half of the census is not conflated with practice.

## Primary metric and verdict rule (pre-registered)

Qualifying villager = ≥60 NPC days (roleform rule); ≥30-day
sensitivity set reported alongside, not judged.

1. **Replication**: practice-attributed competence movement on
   99891–99898 (changed cells, rung steps by task/track, rung-gain
   lines by task) vs the roleform numbers (33 cells / 50 steps /
   195 lines; field 14 / craft 36 steps; combat/social/strange 0).
   Reproduce = same shape within pilot noise (field+craft > 0,
   combat/social/strange 0, no decreases). Refute = practice movement
   0 everywhere (brief's premise confirmed) or a materially different
   shape — either way reported with counts, never smoothed over.
2. **Attribution**: every competence delta attributed by source —
   practice reps gained per (villager, task) vs rung diffs (all rung
   gains must have reps ≥ threshold); skills gained attributed to
   lessons vs level-ups; specialistSkill deltas + foodXp deltas, with
   the count of villagers gate-blocked (foodXp ≥ 5 in a spec with
   base skill 0) sized explicitly.
3. **Opportunities**: offered vs taken vs refused per task, both
   channels (assignTask ok/refused + lead-days), resolution rate per
   task, throttle-redirect count (fish/forage/garden assigned vs
   resolved, cross-checked against the village throttle ledger).
   The blocking gate for each zero-movement task is NAMED with its
   counts (never offered / refused / redirected / resolved-but-below-
   threshold).

**DIAG-GO** iff (1) the replication is consistent with roleform OR
refutes it with counts (either way the premise is settled, not left
open), AND (3) every zero-movement task has its blocking gate named
with counts, AND (2) the attribution cross-checks pass (no rung gain
without reps, no unexplained competence delta).
**DIAG-NO-GO** iff the replication diverges from roleform without an
identified cause, or any zero-movement task's gate cannot be named
from the instrument (then the instrument is the finding — fix it,
do not re-score).
**Build GO (only if a small practice-path gate is found)**: a minimal
fix in the practice path (villagerPractice / resolveOneAssignment
tail) with practice-attributed competence moves > 0 cells on the band
in a NEW task the census showed at 0, with no regression in the
role-formation census totals (cells/steps/lines within pilot noise
of the replication leg) and no new death mode. Build leg runs on the
SAME band 99891–99898 (identical seeds = the before/after base).
If the cause is systemic (no practice opportunities arise at all in
organic play for a task family, or the gate is the food.js
specialistSkill hard-gate, or the policy never offers the work),
report DIAG with the named, sized lever for the next arm and make NO
game-code change. The specialistSkill gate is a food.js arm's blank,
not this arm's build.

Guards (reported, NOT gated): wall numbers per leg (national / table /
wins, wave-4/5 kills, median survival, villagers alive); death-cause
shares from daily rows where instrumented; no new death mode.

## Method

1. **Instrument** (`scripts/practicemove-census-20261106.js`, a copy
   of `scripts/roleform-census-20261106.js` with LEG + output prefix
   changed and a throttle-ledger snapshot added — no game-code
   change): per seed, competent policy, 80d death-aware; same
   snapshots (start/30/60/end) of competence / specialistSkill /
   foodXp / practice reps / npcXp tracks / npcSkills; resolved +
   assigned logs; creditDeed log; skill telemetry rows; rung-gain
   say lines; wall snapshot daily.
2. **Pilot**: 8 seeds 99891–99898, current master, single leg
   (measurement only — the comparison is against the recorded
   roleform census numbers on the identical seeds).
3. **Analysis** (`scripts/practicemove-analyze-20261106.js`): the
   replication tables, the per-source attribution, the
   offered/taken/refused ledger per task, the specialistSkill gate
   sizing, wall numbers, verdict per the rule above.
4. **Proof** (`scripts/test-practicemove-20261106.js`): analyzer
   correctness on a small synthetic corpus AND on the existing
   roleform corpora (the analyzer must reproduce the published
   roleform numbers — 33 cells / 50 steps / 195 lines / spec
   0→positive 0 — from `roleform-a-seed*.json` before the fresh run
   is judged). Green before the evidence file is written.
5. **Balanced panel (§15)**: inapplicable — same limitation recorded
   by killersurvive-a, drive-practice-a and roleform-a: the panel runs
   its own full panel and takes no corpus input, so it cannot compare
   this census corpus on identical seeds. The identical-seed census
   comparison against the recorded roleform numbers is the
   before/after instrument, with per-seed JSON corpora attached:
   `practicemove-a-seed9989{1..8}.json`.
6. **Sense test**: read a few villagers' days from the corpora
   (practice lines + resolved sequences) and judge whether
   practice/teaching reads like a person improving, not a counter
   ticking.

## Canon

docs/CANON.md read; docs/MONSTER-WAVES.md read for wave context. No
canon doc covers villager practice/competence growth — CANON.md's
"Human skills ≠ alien abilities" is the governing rule instead
(practice grows HUMAN competence/skill, never grants alien abilities,
never touches the six slots). Steve 2026-11-06 11:48 CST (reward all
paths) and 2026-11-06 17:12 CST (role formation lands inside the ONE
SCORER as weights/candidates, never a new system) bound any build:
a practice-path fix here is a gate fix inside existing code, not a
new system.

## Metric review (pre-run note)

- The 80d horizon with a ≥60-NPC-day qual bar is strict (roleform:
  45 qual60). If the qual set comes back tiny (<10 villagers), the
  ≥30-day sensitivity set is the honest fallback — the verdict rule
  still reads the ≥60 set, and a verdict driven by an empty
  denominator is recorded as "unmeasurable at this scale", not a
  NO-GO.
- The replication is deterministic on master for seeds 99891–99898
  only if master has not changed the sim-relevant code since
  roleform ran — it HAS (grind, tbend, armorcap, routstall,
  journey-deepening landings). Small divergences (a few cells/lines)
  are expected noise from those landings, not a refutation; a
  refutation needs a SHAPE change (practice movement 0 everywhere,
  or movement appearing in a track that was 0). The evidence file
  must state which landings could have moved the numbers.
- The `assigned` log counts assignTask calls only; wood/stone's
  opportunity channel is taskLeads, counted from daily.taskLeads
  (lead-days × 3 parts/day, minus sheltered/mustered parts — the
  resolved log is the ground truth for what actually happened, the
  lead-day count is the offered estimate, and any gap between them
  is itself reported).
- Fish/forage/garden assigned-vs-resolved gaps are EXPECTED to be
  large (prod-throttle redirects) — the redirect is not a defect
  claim, it is the mechanism that turns a fishing opportunity into
  wood/stone practice. The diagnosis must say that plainly rather
  than counting redirected assignments as "lost" opportunities.

## Convergence state

Axis scale-onramp / winnability chain: NOT converged. This arm is a
replication + diagnosis on the role-formation practice-movement gap
(tracker blank #4, 0059Z round). It proposes no build unless the
diagnosis finds a small practice-path gate; any larger lever is named
and sized for the next arm.
