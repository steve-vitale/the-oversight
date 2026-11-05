# Role-differentiation census — prereg (2026-11-04, before any seed runs)

Question (Steve 2026-11-04): villagers don't fall into different role paths
or hybrids naturally. On current master, do villagers' LIVED behavior
profiles cluster into roles (hunter, cook, fighter, diplomat, teacher,
scout...) or hybrids, or does everything trace back to formerOccupation?

Method: sim-harness, competent policy, seeds 61001–61008 (fresh band, no
loop band collision), 120 days each, stop early on game over and report the
days actually reached. One process, seeds sequential (never two harnesses
in one process at once). Driver: scripts/rolecensus-20261104.js
(measurement-only; read-only wraps that call the original exactly once).

Per villager recorded: starting occupation + occupationId + temperament,
villagerCompetence per delegate task, specialistSkill per specialty,
foodXp per specialty task, raw track record (npcXp: combat/field/social/
craft/strange + granted/skilled — read raw, never via npcXp() creation),
npcSkills, npcAbilities, npcKnow keys, daily task-lead map, per-day resolved
tasks (via resolveOneAssignment wrap), assignments given (via assignTask
wrap), deeds (via creditDeed wrap), and end telemetry rows for skill
lessons / seek-knowledge / level-ups / killer tales / deaths.

Pre-registered analysis definitions:
- Strong path: one task ≥25% of a villager's resolved tasks. Hybrid: two
  strong paths in one villager. Specialization index: top-task share.
- Occupation-matched task: villagerCompetence(task) ≥1.4, or
  specialistSkill > 0 for the matching specialty.
- Role drift via tracks: a villager's top track at end (by XP) differs from
  their starting lean's top track (raw npcXp at day 0; no record = no lean
  touched yet).
- Convergence test: villagers whose top resolved task is NOT
  occupation-matched — do they exist in numbers, and do their profiles look
  like the matched workers on that task?
- Stickiness test: from per-day task logs, P(same task on next active day)
  vs the occupation-score prediction (competent re-scores by occupation
  every day, so lived history should NOT predict tomorrow's task).

Pre-registered expectations (to be verified, not assumed):
- villagerCompetence moves 0 cells (pure function of occupation +
  temperament, neither changes).
- specialistSkill goes 0 → positive for 0 villagers (foodXp boosts skill
  only if skill > 0).
- foodXp DOES grow for unskilled villagers who do the work — skill stays 0.
- Track XP DOES move with deeds (the one lived-experience channel), with
  per-day caps; whether it produces distinct role profiles is the open
  question, not an assumption.

Known confound, stated up front: the competent policy staffs by
occupation score (assignBest/assignAnother add +2 for occupation words
plus villagerCompetence), so assigned-task counts partly measure the
LEADER's occupation-matching, not villagers' own choices. The census
therefore separates (a) assigned/resolved task profiles, (b) autonomous
signals (task-lead takeovers, lessons taught, skills sought, deeds, track
movement), and (c) the stickiness test, which directly asks whether lived
history ever feeds back into tomorrow's assignment.

Sample-size honesty: 8 seeds × up to ~15–25 villagers, but only villagers
present ≥60 days count for profile analysis; villages that die early
contribute their days honestly and are reported as short runs, not
silently dropped. If fewer than 4 seeds reach 100 days, the report says so
and does not claim a 100-day panel.

Amendment (after 1-seed pilot, before the full run — pilot seed 61001 is
re-run under the amended rule): PRODTHROTTLE redirects recurse into
resolveOneAssignment, so a naive wrap double-counts one job as two tasks
(e.g. fish + wood). The wrap now records only the outermost call, with
the innermost (final) task — the work actually done. Pilot also showed
the scholar (mantle successors included) must be excluded from NPC
profiles, so the driver now tracks every villagerId held during the run
and periodic day-30/60/90 snapshots (dead villagers drop off the roster,
so end snapshots alone would lose them).
