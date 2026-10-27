# TACKLE-TEACH BEFORE measurement (2026-10-27, unmodified code)

Band: scripts/test-teach-new-band.js, seeds 71001–71006, 30 days each,
System arrived, villagers at home, neutral needs, fed pantry. One process
per seed. Baseline for the pre-registered bars in tackle-teach-prereg.md.

## Band totals (6 seeds, 1980 villager-days)

- WANTS: sheet 0, build 466, null 1514
  (null breakdown: plan-full 1283, throttled 231, other 0)
- SEEK attempts 166, SEEK successes 136
- NEW-ABILITY total 124: teacher-seek 118, System-broadcast 0,
  sheet-show 6, other 0
- RETEACH 18, SKILL-NEW 353 (skill lane, never counted as ability)
- CONVO-TEACH: taught 6/6, ledgered 0/6
- Holders: 11/11 villagers holding an ability on day 1 and day 30
  (knacks grant on day 1); day-30 target-build distribution almost all 3.

## What this proves (diagnosis)

1. The seek mechanism itself WORKS under at-home, System-arrived
   conditions: 166 seeks, 136 successes, 118 genuinely new ability
   teaches from teachers. "Villagers never seek" is not a mechanism
   failure — it is a long-run shape plus invisibility:
   - Seeking is front-loaded: once a villager's target build reaches 3
     (their plan is no longer "thin"), build-seeking stops by design
     (1283 of 1514 null wants are plan-full). Further new knowledge
     then comes only via level-up sheets, conversations, and witnessing.
   - Conversation teaches DO happen (6/6 driven held conversations
     taught the villager something new — iron_stomach, the bearer's
     held ability) but are NEVER ledgered: npcLearnFromTalk writes no
     tele event, no journal note, no narration. Any measurement that
     counts ledgered teaches sees zero conversation teaches.
2. Teachers exist (11/11 holders from day 1) and teaching succeeds
   (136/166 seeks). The remaining seek failures are saturation
   (every teacher ability already known at cap), not missing teachers.
3. Plant-channel context (succession r53 re-run, seeds 26081–26085):
   BAND TEACH-NEW = 0, known = 28, all 28 via haul-teach, zero via
   teachRound or conversation. Two separate causes, both outside this
   workstream's game-code fix and reported, not silently changed:
   - The r53 driver records EVERY teachPlant call, success or not, and
     does not record the return value — so "28 teaches" may include
     no-op lessons (the scholar already knows the plant at L1+ through
     the office-kept Codex, so teachPlant's stop signal returns null).
     Its "new" axis is the TEACHER's plantKnowledge, not the student's
     learning — the wrong side of the lesson.
   - The competent policy's teachRound can never teach: it iterates
     scholar-known plants, skips scholar-known ones, and then picks
     villagers who do NOT know the plant as teachers
     (competent.js teachRound: `if (!vk.includes(pid))` before
     `teachPlant(vid, pid)` — but teachPlant requires the teacher to
     know it). The file's own comment flags the inversion and defers
     it as "a separate lever". Policies are the measurement instrument;
     changing them mid-program breaks band comparability, so the fix
     is reported to the parent/policy lane, not applied here.
   - Conversation plant teaches (`teach` choice -> teach:pid) write
     taughtByPlayer/villagerLearnsPlant, never Game.teachPlant, so the
     r53 driver (which wraps teachPlant only) cannot ledger them.

## Fixes to apply (in scope, no gate changes)

- A. Ledger conversation ability-teaches: npcLearnFromTalk gains a
  tele event and a journal note naming teacher, learner, ability.
  (No change to who learns what.)
- B. A seek that finds no teacher and no lesson must not consume the
  seek window: stamp lastSeek only when a lesson actually happened
  (best found), not on every call. A villager who asked and found
  nobody home can ask again tomorrow.
