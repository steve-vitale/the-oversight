# sim-roleform-b — preregistration (role-formation FIRST NUMBERS, coverage program Tier 1 #1)

- Run: `fleshout-loop-b-20261110T1730Z`, Loop B, arm `sim-roleform-b`,
  worktree `~/workspace/worktrees/sim-roleform-b`, branch `sim-roleform-b`.
- Band: **160201–160208** (8 seeds, pilot). Seed-band freshness verified
  before this prereg was written (see "Seed-freshness record" below).
- Horizon: **150d max, death-aware** (run until game over; villages that
  die stop simulating, +10d tail max). Why 150d: the coverage program
  asks for FIRST NUMBERS on role formation at a long horizon — roleform-a
  (Nov 6) measured 80d; this arm extends the window to 150d so roles
  have a full second half in which to form, while staying inside
  observed village lifetimes (median survival ~day 39–81 on the scale
  wall; roleform-a median 81d with 7/8 alive at 80d).
- Policies: `scripts/policies/competent` (verbatim, NOT modified). No new
  policy. No game-code change — MEASUREMENT ONLY. No gate/price/deed/
  readyDemand change.
- Canon: docs/CANON.md read; no canon doc covers villager practice/
  competence growth — CANON.md's "Human skills ≠ alien abilities" is
  the governing rule (practice grows HUMAN competence/skill, never
  grants alien abilities, never touches the six slots). Coverage-audit
  definition read:
  `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/coverage-audit-20261110.md`
  (§5 gap #1: practice moves competence nowhere in the 2026-11-05
  census; `sim-roleform-a` Nov 6 verdict GO was "carried by the
  track/deed system, not by practice").

## What this arm is (and is not)

- FIRST NUMBERS for the coverage program: the item has never been
  judged against a pre-registered bar at this horizon on a fresh band.
  This arm records the numbers — it does NOT re-judge roleform-a's
  verdict and it changes no lever.
- Metrics (coverage program): competence-cell movement per villager +
  skill 0→positive per villager + practice reps by track. Same
  qualifying rule as roleform-a for comparability (≥60 NPC days,
  ≥30-day sensitivity set alongside), plus a ≥90-day sensitivity set
  now that the horizon is 150d.
- Comparison context (not judge): roleform-a, 80d, band 99891–99898:
  33 changed competence cells / 50 rung steps (field 14, craft 36),
  specialist 0→positive for 0 villagers, 28/45 villagers at track
  level ≥1, 195 rung-gain lines, 0 resolutions in hunt/scout/patrol/
  teach/tend/mend. This arm reports the same table at 150d; any
  difference is a horizon effect to describe, not a verdict.

## Primary metric and verdict rule (pre-registered)

This is an instrument-validity + complete-capture arm. The GO bar is:

**GO** iff ALL of the following hold:
1. The instrument runs to completion on every pilot seed (8/8 corpora
   written, no seed crash, no missing section — start/end/periodic
   snapshots, daily rows, resolved, deeds, practiceLines, wall, wave
   kill log).
2. The instrument is internally consistent on every seed: zero
   competence decreases (a decrease means the recorder mis-reads the
   ladder, per roleform-a), rung-gain lines name only tasks that exist
   in the task table, and practice reps are monotone non-decreasing
   across snapshots for every villager-task pair.
3. First numbers are captured for every metric on every seed:
   competence-cell movement per villager, specialist 0→positive per
   villager, practice reps by track, track levels, dominant tracks,
   wall numbers (national / table / wins, wave-4/5 kills, median
   survival).

**NO-GO** iff any pilot seed fails to produce a complete corpus, or
any internal-consistency check fires. A NO-GO here means the
instrument is broken — stop and fix it, do not re-score, do not
publish first numbers from a broken recorder.

**What the numbers themselves mean is reported, not judged.** Whether
competence moves a lot or a little at 150d is the finding; the GO bar
is about the recorder being trustworthy. The movement verdict belongs
to the coverage program's later lever arm, not to this capture.

## Method

1. **Instrument** (`scripts/roleform-driver-20261110.js`, adapted from
   `scripts/roleform-census-20261106.js` + drive-practice census):
   per seed, competent policy, 150d death-aware; start/periodic-
   30/60/90/120/end snapshots of villagerCompetence /
   specialistSkill / foodXp / npcXp tracks / npcSkills / practice
   reps; resolved-assignment log (outermost call, final task);
   creditDeed log; skill telemetry rows; rung-gain say lines; wall
   snapshot tracked daily. All instruments are read-only wraps: the
   original is called exactly once and its return value passes through
   unchanged.
2. **Pilot**: 8 seeds, current master, single leg (measurement only —
   the comparison is against the recorded roleform-a numbers, not a
   second leg). Confirm 12–16 seeds ONLY if the pilot's verdict needs
   more power (e.g. a consistency check is borderline on one seed).
3. **Analysis** (`scripts/roleform-analyze-20261110.js`): per-track
   tables vs roleform-a, role-emergence and personality cross-tabs,
   practice reps by track, wall numbers, verdict per the rule above.
4. **Proof** (`scripts/test-roleform-b.js`): analyzer correctness on
   synthetic corpora (GO/NO-GO legs carried from test-roleform-
   20261106.js) + driver determinism leg (same seed run twice at a
   short horizon produces byte-identical corpora) + recorder-validity
   legs (monotone practice reps, rung-line task parsing, NPC-window
   exclusion). Green before the evidence file is written.
5. **Balanced panel (§15)**: inapplicable — the panel runs its own full
   panel and takes no corpus input, so it cannot compare this census
   corpus on identical seeds (same limitation recorded by
   killersurvive-a, drive-practice-a, roleform-a and other census
   arms). The identical-seed census comparison against the recorded
   roleform-a numbers is the before/after instrument, with per-seed
   JSON corpora attached.

## Seed-freshness record (band 160201–160208)

- Searched ALL dated preregs (`evidence/*/sim-*-prereg.md`, via
  `rg --glob 'sim-*-prereg.md'`): 0 hits for each of 160201, 160202,
  160203, 160204, 160205, 160206, 160207, 160208 individually, and
  0 hits for the range strings "160201-160208" / "160201–160208".
- Searched ALL of `evidence/` for the eight seeds: the only hits are
  float substrings inside unrelated JSON numbers, not seed uses —
  `16020786`, `1602077`, `16020214006`, `160202360877`,
  `160207388204796`, `16020171642276`, `1602033`, `1602087` (hashes /
  kcal / dawnFd decimals in panel case JSONs and sweep files), and
  bare `160204` / `160206` inside kcal decimals
  (e.g. `13901.18205160204`). None is a standalone seed.
- Searched the goal `hidden_files/` tree for `16020[1-8]`: hits are
  the same float-substring class (kcal decimals in panel case JSONs
  and `screen.jsonl`); 0 prereg files under hidden_files name the
  band. No file under hidden_files is named forbidden/contaminated;
  the filename listing shows no forbidden-band or contaminated-band
  list to consult.
- **Band 160201–160208 is FRESH.** No collision; no other band was
  taken.

## Precondition

- `node scripts/godpath/test-measurement-proof-update.js` at base
  (master tip 28a3952fd): GREEN, 9 passed / 0 failed, before any
  judged sim ran. (Run 2026-11-10 ~11:57 CST.)

## Metric review (pre-run note)

- The 150d horizon with a ≥60-NPC-day qual bar is strict: a villager
  must be present and NPC for 40% of the run. If the qual set comes
  back tiny (<10 villagers), the ≥30-day and ≥90-day sensitivity sets
  are the honest fallback to report — the verdict rule still reads
  instrument validity, and a verdict driven by an empty denominator
  is recorded as "unmeasurable at this scale", not a NO-GO.
- The competent policy barely assigns hunt/patrol/scout/teach/tend
  (roleform-a: 0 resolutions in those tasks on all 8 seeds). Empty
  combat/social/strange practice columns are therefore a
  POLICY-COVERAGE finding (the policy never exercises those tracks),
  not proof that villagers cannot form those roles — the evidence
  file must say which.
- Strange has no feeding task by design (see roleform-a prereg map).
  A zero strange-practice column is expected; strange track levels
  arrive via deeds (in roleform-a, 505 of 513 strange deeds were
  death_in_family). The practice-reps-by-track table makes that gap
  visible instead of hiding it inside a level count.
- The GO bar deliberately does not judge movement size: roleform-a
  already showed competence moves in field + craft only and the
  specialist ladder stays at 0. If this 150d capture shows the same
  shape, that is the first-numbers finding, and the lever that moves
  it belongs to the one-brain program (Steve 2026-11-06 17:12 CST,
  item 5: duties judge by lived experience), not to this arm.

## Convergence state

Axis scale-onramp / winnability chain: NOT converged. This arm is a
first-numbers capture on the role-formation blank (coverage program
Tier 1 #1, tracker blank (1) from the 2103Z entry, already measured
once by roleform-a at 80d). It proposes no build. Any build it
motivates lands inside the one-brain program as scorer weights/
candidates — never a new standalone system.
