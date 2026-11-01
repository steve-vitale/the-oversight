# Build arm: armor lesson-offer rate (2026-11-01)

## Question
Armor-craft conversion is shipped live, but its teaching leg is thin:
0 armor lessons offered across 24 pooled conversation sittings in the
deepening r80 + r81 panels (3 sittings/seed x 8 seeds), while armor is
crafted 2/4 seeds and worn 4/4. The r82 rate-revision rule already
triggered, so this rate raise is pre-authorized. Bound: behavior change
only — no deedGateReady / stage / scale / gate retunes, no win-price
changes. No re-run of the r80/r81 panels; their cited result is reused.

## Mechanism found (root cause, not a rate)
The 0/24 is a structural zero, not a bad dice roll. Two stacked causes:

1. **Armor was never a teachable topic.** Conversation lesson offers
   (`convoSkillChoices` in `src/js/skill-teaching.js`) only offer
   knowledge skills from `knowledge.json`. Bark/hide armor are *recipes*
   (`codex.recipes` for the player, `avCraft` for villagers), so they
   could never appear in `offeredLearn`/`offeredTeach`, and `teachSkill`
   could never teach them (`skillTeachable` fails for non-knowledge ids).
   Raising any lesson probability (e.g. `VILLAGER_DAILY_CHANCE`) would
   have changed nothing for armor — the daily villager-lesson pool has
   the same gap (`skillFit` returns 0.25 for a non-ability id, below the
   FIT_MIN of 1).
2. **Even listed, armor would lose the single slot.** The conversation
   offers exactly one learn pick and one teach pick, ranked
   ability-carrying skills first. A non-ability topic loses that pick
   whenever any ability skill is teachable — which in the r80/r81
   sittings was essentially always. So the fix gives armor its own slot
   beside the skill pick, not a higher weight inside it.

A second, smaller eligibility gap: `villagerArmorCraftDay` read a taught
`avCraft` level for hide armor but not for bark — a villager taught bark
could never spend the lesson crafting. Fixed to read both the same way.

## Change (branch build-armor-lesson, base master 8231797bc)
- `src/js/skill-teaching.js`:
  - `armorLevel(who, rid)`: player = codex recipe level; villager =
    avCraft level, with wearing a piece counting as L1 (the
    demonstrated-L1 rule of the craft beat).
  - `armorTeachableSkills(teacher, learner)` + armor branch in
    `canTeachSkill`: teacher must know the materials (recipe L2+),
    learner must lack them (below L2); then the *same* shared gates as
    a skill lesson — one lesson per learner per day, trust 15+ where a
    player is involved, shared language.
  - Armor branch in `teachSkill`: a lesson teaches the materials (L2 —
    85% craft instead of blind 35%). Player via the unified
    `grantKnowledge('recipe', …, 2, {type:'taught'})`; villager via
    `avCraft = 2` (never lowered). Recorded in `skillLessons` under the
    recipe id, so future deepening panels count it as an armor lesson
    (`skill` containing 'armor') and as an armor offer
    (`skill_learn:bark_armor` / `skill_teach:hide_armor` in the
    sitting snapshot).
  - `convoSkillChoices`: armor gets its own slot — at most one learn
    line and one teach line (bark before hide), appended beside, never
    instead of, the skill pick. One lesson per conversation still
    holds (`skillLessonDone` closes the menu after either lesson).
  - `_skillName` falls back to the recipe name, so the menu reads
    "Teach me Bark armor?" instead of the raw id.
- `src/js/villager-build.js` (`villagerArmorCraftDay`): a taught
  avCraft level counts for bark as it already did for hide, so a taught
  villager actually attempts the craft.
- What did NOT change: no gate/stage/scale/price values, no trust
  threshold (still 15), no lesson-per-day rule, no daily villager
  lesson chance, no skill-lesson behavior. Villager-to-villager daily
  auto-lessons still do not pick armor (fit below threshold) — the
  measured channel is conversations, and that is what this arm fixes.

## Proof — before/after on IDENTICAL seeds
Proof script: `scripts/test-build-armor-lesson-20261101.js`
(plain node; loads one game at seed 20261015 via `scripts/godpath/lib`,
no check.js, no jest, no panel re-run).
- BEFORE (unmodified master code, same script, same seed):
  8 passed / 8 failed. Every armor check failed: no bark offer to the
  player (menu showed only `skill_learn:weather_read`,
  `skill_teach:old_world_cache`), player bark stayed L1, no armor
  lesson recorded, no hide/bark offer to villagers, taught-bark
  villager spent no materials (bark 3 -> 3, made 0). Guardrails and
  the skill-lesson regression passed on old code, as expected.
- AFTER (this branch, same script, same seed):
  16 passed / 0 failed, exit 0. Villager -> player bark offer present
  beside a skill offer; player bark L1 -> L2; armor lesson recorded
  with skill `bark_armor`; player -> villager hide and bark offers
  present and landing at avCraft 2; taught-bark villager attempts a
  bark craft (materials spent). Guardrails hold: a wearing-only (L1)
  teacher offers nothing, a learner already at L2 gets no offer, a
  low-trust (5) teacher offers nothing, one lesson per conversation
  and per learner per day still hold, and the existing skill lesson
  still works.
- Syntax: `node --check` passes on `src/js/skill-teaching.js`,
  `src/js/villager-build.js`, and the proof script.

## Commits (branch build-armor-lesson, base 8231797bc)
- Code + proof: 603330fdcebd0d0bb0877d6d39a8ca768415dfda
  ("build: armor lessons offered in conversation (own slot, L2 teach)
  [needs-eyes]" — 3 files, +205/-6; index-clobber after safe-commit
  repaired via `update-index --add --cacheinfo` with HEAD blobs, all
  three worktree files hash-matched to HEAD, status clean).
- This evidence file: committed as a follow-up on the same branch
  (hash in the branch tip at merge time).

## Infrastructure notes for the coordinator (not game changes)
- `worktree-register.sh` never completed for this arm: the first
  attempt died in the container EPERM write flap during checkout
  (thousands of `unable to write file` errors), leaving branch
  `build-armor-lesson` created but no worktree and no registry entry;
  attempts 2–4 then failed in the script's fallback `git worktree add`
  (its error message hides the fallback's stderr behind the first
  failure's). The worktree was landed by a direct `git worktree add`
  retry loop (succeeded on try 4) at
  `~/workspace/worktrees/build-armor-lesson`, HEAD 8231797bc, branch
  `build-armor-lesson`, status clean. The registry entry is still
  missing (`worktree-heartbeat.sh` reports "not registered") — the
  coordinator should append it
  (slug build-armor-lesson, path
  ~/workspace/worktrees/build-armor-lesson, branch build-armor-lesson,
  owner build-coordinator, purpose "build: armor lesson-offer rate")
  or merge the branch regardless of registry state. The tree is
  invisible to the reaper (it only iterates registry entries), so it
  is not at auto-removal risk.
- The same EPERM flap blocked `safe-commit.sh` (its private index
  lives in /tmp) for 7 consecutive tries before landing on try 8.
- NOT merged, NOT pushed, NO version bump — coordinator merges.
