# sim-roleform-a — preregistration (role-formation census, all five tracks)

- Run: `fleshout-20261106T2256Z`, Loop A, axis scale-onramp / winnability
  chain (tracker blank (1) from the 2103Z entry).
- Arm: `sim-roleform-a`, worktree `~/workspace/worktrees/sim-roleform-a`,
  branch `sim-roleform-a`.
- Band: **99891–99898** (8 seeds, pilot).
- Horizon: **80d max, death-aware** (run until game over; villages that die
  stop simulating, +10d tail max). Why 80d: same as drive-practice — many
  rung chances inside observed village lifetimes (median survival ~day
  39–63 on the scale wall; drive-practice pilot median 76–81d).
- Policies: `scripts/policies/competent` (verbatim, NOT modified). No new
  policy. No game-code change — MEASUREMENT ONLY. No gate/price/deed/
  readyDemand change.
- Canon: docs/CANON.md read; docs/MONSTER-WAVES.md read for wave context.
  No canon doc covers villager practice/competence growth — CANON.md's
  "Human skills ≠ alien abilities" is the governing rule instead
  (practice grows HUMAN competence/skill, never grants alien abilities,
  never touches the six slots).

## Steve's 2026-11-06 11:48 CST ruling this census measures

REWARD ALL PATHS, NOT JUST KILLING: a forager, crafter, talker, or
explorer must progress toward their role just as a fighter does; roles
differentiate by personality; measure by role formation across ALL five
tracks (combat, field, social, craft, strange), NOT by kill counts. A
kill-count-only metric is a MIS-MEASURE of this ruling and is not used
as a judge anywhere in this arm (kills are context only).

## Baseline to beat (2026-11-05 census, 8 seeds, 30 qualifying villagers)

See `evidence/2026-11-06/sim-drive-practice-a.md` and its prereg
(2026-11-05 role census, scripts/rolecensus-20261104.js, 120d): competence
moved **0 cells**, skill moved 0→positive for **0 villagers**; behavior
differentiated (28/30 strong task, 16/30 hybrids) but 0/28 top tasks
matched occupation. Since then drive-practice landed (merged 2b9b0371e):
practice moves competence on the 0.7/1.0/1.2/1.3/1.4 ladder — pilot
14/16 practicing villagers moved ≥1 cell at 80d, 312 reps — BUT the
specialistSkill zero-gate in food.js is untouched (a non-matching
occupation still has specialistSkill 0), and combat/social/strange
tracks have no sim coverage yet (competent policy barely assigns
hunt/patrol/scout/teach/tend).

## Primary metric and verdict rule (pre-registered)

Qualifying villager = ≥60 NPC days (rolecensus rule: days in the NPC
window, before any mantle; comparable to the 2026-11-05 baseline's 30
villagers). A ≥30-NPC-day sensitivity set is reported alongside, not
judged.

Per-track measures (per qualifying villager, first → last snapshot,
last-seen not end-only so departing workers still count):
1. **Competence movement**: ladder-rung diffs on 0.7/1.0/1.2/1.3/1.4,
   temperament-normalized, per task; rung-gain "getting the hang of …"
   lines counted as a second instrument (drive-practice lesson: the
   end-snapshot denominator understates the mechanism).
2. **Skill 0→positive**: specialistSkill 0→positive per spec
   (butcher/cook/preserver/spotter/builder) + villager skills gained
   (npcSkills) + track levels reached (npcXp vs thresholds 18/48/96/192/
   384, one shared scale).
3. **Role emergence**: a villager has a dominant track when their top
   track XP is ≥50% of their total track XP AND ≥18 (level 1); dominant
   task when top-task share ≥0.5 with competence ≥1.2 in that task.
4. **Behavior differentiation**: top task vs occupation (competence
   ≥1.4 match), strong tasks (share ≥0.25), hybrids (≥2 strong tasks),
   stickiness, half-switching — rolecensus measures, for comparability.
5. **Personality differentiation**: dominant track/task cross-tabbed by
   temperament (bold / steady / cautious).

Task→track map (judgment, documented; raw per-task tables are always
reported alongside so the map never hides data; deed semantics from
src/data/tracks.json govern where a deed exists):
- combat: patrol (guard/fight-readiness). Hunt is FIELD — the deed
  table credits 'hunting' to field; combat XP comes from fight deeds
  (fight_won / fight_survived), not the hunt assignment itself.
- field: hunt, forage, garden, fish, deadfall, water, scout.
- social: teach (deed 'teaching' → social). Conversation/contest deeds
  also feed social but are not assignments.
- craft: wood, stone, cook, mend (deed 'crafting' → craft), tend
  (deed 'healing' → craft; doctoring is craft work, game.js:14373).
- strange: NO assignment task feeds strange — only alien_fight,
  contest_survived, integration, mantle deeds. That absence is itself a
  finding this census is designed to surface, not a mapping gap to fill
  by invention.
Specialist spec→track: butcher→field, preserver→field, spotter→field,
cook→craft, builder→craft (preserving deed → field, cooking/crafting →
craft).

**GO** iff at least 4 of the 5 tracks show ≥1 qualifying villager with
track level ≥1 OR competence movement in that track, AND ≥2 distinct
dominant tracks appear among qualifying villagers.
**NO-GO** iff ≤3 tracks show any movement/level, or every dominant
track is the same single track (no differentiation), or competence
movement is 0 cells anywhere it was 0 in the baseline without the
drive-practice explanation (i.e. the instrument is broken — stop and
fix it, do not re-score).
Guards (reported, NOT gated): wall numbers per leg (national / table /
wins, wave-4/5 kills, median survival, villagers alive); death-cause
shares from daily rows where instrumented; no new death mode.

## Method

1. **Instrument** (`scripts/roleform-census-20261106.js`, adapted from
   `scripts/rolecensus-20261104.js` + drive-practice census): per seed,
   competent policy, 80d death-aware; start/periodic-30/60/end snapshots
   of villagerCompetence + specialistSkill + foodXp + npcXp tracks +
   npcSkills/npcAbilities; resolved-assignment log (outermost call,
   final task); creditDeed log; skill telemetry rows; rung-gain say
   lines; wall snapshot tracked daily.
2. **Pilot**: 8 seeds, current master, single leg (measurement only —
   the comparison is against the recorded 2026-11-05 census numbers,
   not a second leg). Confirm 12–16 seeds ONLY if the pilot's verdict
   needs more power (e.g. a track sits at exactly 1 villager).
3. **Analysis** (`scripts/roleform-analyze-20261106.js`): per-track
   tables vs the 2026-11-05 baseline, role-emergence and personality
   cross-tabs, wall numbers, verdict per the rule above.
4. **Proof** (`scripts/test-roleform-20261106.js`): analyzer
   correctness on a small synthetic corpus + the drive-practice corpus
   (rung diffs, temperament normalization, dominant-track rule,
   NPC-window exclusion). Green before the evidence file is written.
5. **Balanced panel (§15)**: inapplicable — the panel runs its own full
   panel and takes no corpus input, so it cannot compare this census
   corpus on identical seeds (same limitation recorded by
   killersurvive-a, drive-practice-a and other census arms). The
   identical-seed census comparison against the recorded 2026-11-05
   baseline is the before/after instrument, with per-seed JSON corpora
   attached.

## Seed-freshness record (band 99891–99898)

- Searched ALL dated preregs (`evidence/*/sim-*-prereg.md`, 580 files):
  0 hits for each of 99891, 99892, 99893, 99894, 99895, 99896, 99897,
  99898 individually, and 0 hits for the range strings
  "99891–99898" / "99891-99898".
- Searched the goal hidden_files forbidden/contaminated lists: 0 hits
  for 9989x seeds or ranges (no `*.md` under hidden_files names them).
- Checked the near bands that ARE used, so the next worker does not
  repeat the check: the suggested band 99601–99608 is USED (named in
  evidence/2026-11-04/sim-approachbranch-a-prereg.md, confirm band for
  the fleerepair corpus); 99701/99801 heavily used (11 preregs each);
  99751, 99771, 99791, 99811, 99831, 99841–99891 show 0 single-seed
  prereg hits but their prefixes (9975, 9977, 9979, 9983–9988) appear in
  preregs as ranges/other seeds, so they were NOT taken — 99891–99898
  is the cleanest verified band. Screens: "9989" appears only as float
  substrings in non-prereg evidence (same class as the 99451
  fifthlink/fullpantry false positives in the drive-practice prereg),
  not as a seed use.
- **Band 99891–99898 is FRESH.**

## Metric review (pre-run note)

- The 80d horizon with a ≥60-NPC-day qual bar is strict: a villager
  must be present and NPC for 3/4 of the run. If the qual set comes
  back tiny (<10 villagers), the ≥30-day sensitivity set is the honest
  fallback to report — the verdict rule still reads the ≥60 set, and a
  verdict driven by an empty denominator is recorded as
  "unmeasurable at this scale", not a NO-GO.
- The competent policy barely assigns hunt/patrol/scout/teach/tend
  (drive-practice pilot: 0 practicing villagers in those tasks). A
  NO-GO driven by empty combat/social/strange columns is therefore a
  POLICY-COVERAGE finding (the policy never exercises those tracks),
  not proof that villagers cannot form those roles — the evidence file
  must say which. The follow-up is a policy/task-coverage arm, or the
  one-brain scorer (Steve 2026-11-06 17:12 CST: role formation lands
  inside the ONE SCORER as weights/candidates, never a new system).
- Strange has no feeding task by design (see map above). A zero
  strange column is expected unless alien/contest deeds fire; the
  verdict rule counts strange as one of the five, so a GO requires
  strange movement via deeds — if the pilot shows zero strange deeds
  across 8 seeds, that is itself the finding and the verdict rule's
  4-of-5 bar is what keeps it honest (GO is still reachable via the
  other four tracks, but the strange gap is named).
- Temperament normalization is load-bearing for the cell count (same
  as drive-practice): the analyzer divides by the temperament
  multiplier before rung-indexing and fails loudly on off-ladder
  values.

## Convergence state

Axis scale-onramp / winnability chain: NOT converged. This arm is a
measurement census on the role-formation blank (tracker blank (1),
2103Z entry) — it proposes no build. Any build it motivates lands
inside the one-brain program (Steve 2026-11-06 17:12 CST, item 5:
duties judge by lived experience) as scorer weights/candidates.
