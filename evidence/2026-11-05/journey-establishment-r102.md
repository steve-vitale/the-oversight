# Journey leg ESTABLISHMENT — r102 run note (2026-11-05, Lane A)

## Prereg
`evidence/2026-11-05/journey-establishment-r102-prereg.md` (committed
8b18ef47 BEFORE any scored seed; one driver fix committed fea1fb8a
before scoring: EVID dir corrected 2026-11-04 → 2026-11-05 after the
pilot seed wrote to the wrong directory — pilot seed 1501 discarded
and re-run on the fixed driver, so the whole panel shares one
instrument; the re-run reproduced the pilot exactly: endDay 43,
aliveEnd 9, pantryEnd 46,221). Driver
`scripts/journey-establishment-r102-20261105.js` (r101 clone, teaching
intervention REMOVED — natural lessons only), analyzer
`scripts/analyze-journey-establishment-r102-20261105.py` (+ thin node
wrapper). Seeds 1501–1504 (fresh band), competent policy, 42-iteration
horizon (scholar-day labels run to 42–44; see metric review), death-aware
tail (10 all-dead days; never hit — no village went over). Base: master
c0e08a1bc at branch time; branch `journey-establishment` was already
at master after registration (no foreign commits carried, verified).

## Leg question
r101 proved lessons land (player-taught 126, villager-taught ongoing)
and left one open item: its "used" count was the lesson's own grant
echo. This run asks, under a STRICT instrument (post-lesson telemetry
rows naming learner + skill, `villager_skill` rows excluded entirely,
ordering by telemetry sequence index, not scholar-day labels): does a
taught skill get used afterwards, or does learning stay a ledger entry?

## Panel verdict (BINDING metrics)
- M1 LESSONS: **GO 4/4.** Natural lessons per seed: 22/14/28/25
  (89 total), distinct skills 7/8/6/9 — comfortably over the r99 floor
  (≥5 lessons, ≥3 skills per seed). The classroom runs without any
  player intervention: field_dressing, track_read, wound_care,
  gossip_network, diplomat, mediate, herbal_medicine, preserve_food,
  read_people, old_world_cache, animal_behavior, steady_hands,
  soft_step, stalk, pathfinder.
- M2 STRICT-USE: **USE-INVISIBLE, 26/89 (29%)** — below the
  pre-registered 1/3 bar, and the shape matters more than the gap:
  ALL 26 pieces of evidence are ONWARD lessons (the learner later
  teaches the same skill to someone else). CRAFT 0, ABILITY 0, OTHER 0.
  No taught skill is ever seen firing in a fight row, a craft row, or
  any other telemetry row naming learner + skill after the lesson.
  Per-skill: track_read 6/16 teaches onward best; diplomat 0/5,
  herbal_medicine 0/5, mediate 0/5 never do; field_dressing 3/11,
  wound_care 2/6, preserve_food 2/6, read_people 3/7. Excluding the
  2 no-opportunity lessons (1502's last-day lessons) the rate is
  26/87 (30%) — still below the bar, so the verdict does not hinge
  on that choice. No learner died before a later row existed
  (learnerDead 0 on all lessons).
- M3 SURVIVAL-42: **GO 4/4.** No game over on any seed; alive at end
  9/6/9/9. (aliveAt40 as printed is unreliable on 1501 — its daily
  trace has no day-40 entry because scholar-day labels skip — so M3
  is judged on aliveEnd + no game over, which is robust on all seeds.)
- M4 PANTRY-GUARDRAIL: **GO 4/4.** Zero starvation/thirst deaths on
  all four seeds. Pantries end 46,221 / 40,850 / 11,794 / 25,575 kcal.
  The r101 dry-spell thirst story did not repeat.
- M5 PEOPLE: **PASS on all 8 held convos read in full** (2 per seed).
  See below.

## What "use-invisible" does and does not mean
It does NOT mean villagers never use what they learn. It means the
game's own record never shows it: a villager who learns wound_care or
field_dressing has no per-use telemetry row to fire (ability_used
carries no actor, field-fight records carry action kinds, not skill
attribution), and the one use channel that IS attributable — teaching
onward — fires for only 29% of lessons. The honest statement is:
**learning propagates (teaching chains are real — e.g. 1501: Ana
learns field_dressing day 2, teaches it on day 10; 1503: a
preserve_food chain runs day 10 → 17 → 29), but no other use of a
taught skill is visible in-window.** That is a measurement blank
first (actor-attributed ability use is the missing instrument) and a
game question second: if a skill never visibly changes what its
holder does, the classroom is a ledger, not a village getting better
at things. No game code was changed on this evidence — a use claim
needs the instrument before it needs a lever.

## Village assessment, in plain words
Four villages started with 12 people each and all four are still
standing at day 42 — the second establishment panel in a row with no
scatter. They are not the same villages: 1501 is a quiet one (wave 2
only, pantry fat at 46k, 9 alive, skills spreading through teaching
chains); 1502 is the hard one (reached wave 4, pantry fat at 40k,
but only 6 alive at the end — 41 death records, almost all monster
fights and expeditions, no starvation); 1503 is the lean one (wave 3,
pantry 11.8k, 9 alive, the most lessons at 28); 1504 is the steady
one (wave 3, pantry 25.6k, 9 alive, 5 contests all won). Living
villagers end knowing 1–16 skills each (the 16 is the player
character's codex; most villagers hold 3–8). Bark armor is worn at
the end on three seeds (Ethan, James, Caroline) but armor-craft
attempts in-window are 0/1/1/2 — the worn armor is starting gear
more than in-window making, and no armor lesson appears in any
skill_lesson row (armor lessons are not recorded as skill lessons).
Nobody on any final roster is dead (rosterDead 0 on all four seeds);
the 21–41 death records per seed are fight/expedition records, as in
r99/r101.

## Contests (r101 metric-review rule applied)
Fired/ended per seed: 3/3, 5/4, 3/2, 5/5. Under the corrected rule
(exclude fired within 2 days of run end): 1502's calorie_run (fired
day 43, endDay 44) and 1503's drop (fired day 41, endDay 43) are
excluded — ZERO stuck contests on any seed. No seed fired zero
contests. Results are mostly wins (1504: 5/5 won).

## People check (M5), in plain words
All eight held conversations read as people with business, not menus:
- 1501 Ana dreams of taken kin in humming pods, asks the player to
  ask the System, and accepts a promise; Greta tests whether the
  player can be trusted and judges the answer ("The wrong one
  would've been 'yes' too fast").
- 1502 Ezequiel needs hands on a wound and a Haven-door condition;
  Quinn confesses skimming food, ashamed and unable to stop, then
  notices who eats first and who waits.
- 1503 Priya's cut, a gossip thread, and three confront picks that
  escalate instead of looping ("I confessed that already. I'm not
  confessing it twice for dramatic effect"); James keeps a mental
  list of everyone still kind.
- 1504 Caroline and Sebastian both carry taken kin (sister Wanda,
  brother Kuba) and the pod dreams; Sebastian's trap-line invitation
  ends with a gifted tool.
Flat notes, stated not hidden: repeated "goon" picks return templated
mood lines ("The ease drains out of it, a little") — readable as
mood, not nonsense. Driver hygiene (not a game bug): the people-check
driver picked a betrayal:accept verdict on Sebastian's case while
sampling; held-convo drivers should avoid story verdicts the way the
teaching driver did.

## Telemetry deviation check (step 14)
Baseline: `telemetry-baselines/establishment.json` (r40 re-seed).
Per-seed JSONs carry derived `guardrails` + `c3` blocks (deaths /
aliveEnd / pantryKcalEnd / starvation count, computed from each
file's own fields, same shape as r101 — derivation recorded here,
not hidden).
- LOUD: `guardrails.deaths` 41 -> 114 (+178%).
- Quiet: popAlive, pantryKcal, starvationDeaths.
- Verdict: same class as r85/r86/r99/r101, now a fifth consecutive
  panel. NOT a village-mortality regression — rosterDead 0 on all
  four seeds, and villager-combat / expedition rows dominate every
  seed's death list, so most death records are fight records, not
  village deaths. **Baseline NOT rolled forward** in this run; the
  roll needs its own regime note (per the baselines NOTES.md) and is
  not done silently here.

## Metric review (for the NEXT run, not this one)
- The missing instrument is now precise: `ability_used` needs an
  actor field (or a villager-use row) before field-fight skill use
  can be measured at all. Until then, any "villagers use their
  skills" claim is unmeasurable from telemetry, and runs should say
  so instead of citing lesson counts as use.
- Census skills are FIXED in the r102 driver (real
  `Game.skillsKnownBy(vid)` API; r99/r101 census `skills` was null) —
  future runs can census skill holdings directly.
- Still standing, unchanged: scholar-day labels skip/repeat (all
  ordering in r102 uses telemetry sequence index); census `equipped`
  first-row duplication (r99); player codex start snapshot is missing
  (end snapshot only), so player skill level-up-vs-lesson could not
  be computed — a future driver should snapshot codex skills at
  start.
- Armor lessons are not skill_lesson rows and armor-craft attempts
  are near-zero in-window: if armor-teaching is meant to be an
  establishment story, it needs its own instrument (avCraft levels
  are now snapshotted at end; start snapshots would complete it).

## Reachable / fun / winnable (establishment)
- Reachable: YES for learning — 89 natural lessons across 4 villages
  with no player intervention, 6–9 distinct skills per village.
- Fun: PARTIAL — conversations are human and teaching chains are a
  real village story (Ana → leo, preserve_food chains), but the
  payoff of learning is invisible: a taught wound_care never visibly
  treats a wound, a taught track_read never visibly finds a trail.
  The classroom feels like a ledger until use is visible.
- Winnable: PARTIAL, same shape as r101 but healthier — survival,
  wave progression (to wave 4 on one seed), contests, and teaching
  all work in-window, no scatter, no starvation. The establishment
  risk this panel is not food but fights: 1502 lost half its roster
  to monster fights/expeditions while its pantry stayed fat.

## Infrastructure notes
- safe-commit index clobber hit twice on this run (private-index
  commits left the main index purged/stale for the committed files);
  repaired both times with `git update-index --cacheinfo` from HEAD
  blobs, verified with clean `git status` + empty `git diff HEAD`
  and correct `git show --stat`. Commits themselves were correct.
- Heartbeat loop verified via registry read-back (heartbeat fresh
  at panel time); lock discipline held throughout.
- No src/js change in this run: tooling + evidence only (driver,
  analyzer, prereg, run note, per-seed JSONs, convo transcripts).
