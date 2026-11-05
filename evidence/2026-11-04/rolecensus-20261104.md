# Role-differentiation census — report (2026-11-04)

Question (Steve 2026-11-04): villagers don't fall into different role paths
or hybrids naturally. On current master, do villagers' LIVED behavior
profiles cluster into roles (hunter, cook, fighter, diplomat, teacher,
scout...) or hybrids, or does everything trace back to formerOccupation?

Prereg: `evidence/2026-11-04/rolecensus-prereg.md` (seeds 61001–61008,
competent policy, 120-day horizon, stop early on game over).

**Recovered 2026-11-05 by the main session:** the census worker ran all 8
seeds and wrote the driver, analyzer, per-seed JSON and analysis JSON, but
never committed or reported. This report is written from its analysis file
(`rolecensus-20261104-analysis.json`, reproduced by re-running
`scripts/rolecensus-analyze-20261104.js`); no seeds were re-run.

## Panel

- 8 seeds, end days 121 / 113 / 108 / 90 / 75 / 47 / 92 / 103. 4 seeds
  reached 100 days, so the prereg's 100-day panel threshold is met exactly.
- 30 villagers qualified (present ≥60 days); 150 villagers ever lived
  across the 8 villages; 30 were alive at the end of their runs.
- 2 qualified villagers had no strong task at all (top task None).

## Verdict: diagnosis CONFIRMED on all three pre-registered expectations

1. **villagerCompetence never moves: 0 cells changed** across all 30
   qualified villagers. Competence is still a pure function of starting
   occupation + temperament, neither of which changes.
2. **specialistSkill never rises from zero: 0 villagers** went 0 → positive,
   and **0 XP was gained on unskilled specialties** — foodXp does not grow
   for unskilled villagers doing the work, so the skill stays 0. (The
   prereg expected foodXp to grow while skill stayed 0; the data shows
   neither grows — the gate is tighter than expected.)
3. **Track XP is the only lived-experience channel, and it does not
   produce roles:** 21/30 villagers hold a track level, but only 1
   villager's top track drifted from their starting lean, and deed-top
   track matched the XP-top track for only 19 of 30.

## The sharpening: behavior already differentiates — the system records none of it

- 28/30 qualified villagers have a strong task (one task ≥25% of their
  resolved work); 16/30 are hybrids (two strong tasks). Mean top-task
  share 0.43. 19 of 24 villagers with both halves switched their top task
  between the first and second half of their lives.
- **But 0 of 28 matched their occupation:** not one villager's most-done
  task is the task their occupation says they should do. Top tasks spread
  across stone (8), water (5), cook (4), fish (4), deadfall (3), wood (3),
  garden (1).
- Stickiness (same task on the next active day) averages 0.57 — lived
  history does predict tomorrow's task a little, but the competent policy
  re-scores by occupation every day, so this is the leader's assignment
  pattern, not the villager's own pull (the known confound in the prereg).
- Teaching works and skills spread: 146 skills gained, 81 lessons taught,
  76 learned, 22 teachers, 26 seekers, 32 abilities granted — but none of
  that moves competence or specialistSkill.

In plain words: **villagers already live differentiated lives — they do
different work, switch work, and hold two strong tasks at once — but the
game's competence and skill numbers never notice.** What a villager does
most has nothing to do with what they started as, and nothing to do with
what the game thinks they are good at. Roles exist in behavior and are
invisible to the systems that should grow them. That is the gap the
role-formation build (per-person experience counters, competence drifting
toward demonstrated performance) has to close.

## Metric review

- The prereg's "foodXp grows for unskilled villagers" expectation was
  WRONG in the direction of generosity: xpGainUnskilled is 0, not just
  skill-gain 0. Future preregs should expect both to be 0 on current
  master.
- "Occupation-matched task" (competence ≥1.4 or specialistSkill > 0) is a
  weak match test — 0/28 matched anyway, so the finding does not depend
  on the threshold.
- The census cannot separate leader-assigned tasks from villager-chosen
  tasks (stated confound); the autonomous signals (leads, lessons,
  deeds) are the cleaner read, and they point the same way.

## Files

- `evidence/2026-11-04/rolecensus-prereg.md`
- `evidence/2026-11-04/rolecensus-20261104-analysis.json` (pooled + 30 rows)
- `evidence/2026-11-04/rolecensus-20261104-seed6100{1..8}.json`
- `scripts/rolecensus-20261104.js` (driver, measurement-only)
- `scripts/rolecensus-analyze-20261104.js` (analyzer; re-running it
  reproduces the analysis JSON)
