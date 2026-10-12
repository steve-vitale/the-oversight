# Journey leg: ESTABLISHMENT (days 14–40) R4 — 2026-10-12 (02:00 run)

Rotation idx 1 → played leg 1 (fourth establishment pass; r3 was earlier
today). Re-baselined on the current tree (c1d466d1): since r3, journey
landing r5 (nonverbal spoken-lure + honest decline lines), longsim agency r5
(teach-chore line variety), and the wave lever r4 (villager-xp channel audit)
all landed. Canon read: CANON.md, CONTESTS.md (+ r3's evidence note).

## What was played
- `scripts/test-journey-establishment-r4-20261012.js` — r3 harness refreshed
  to the DYNAMIC index.html module list (r3's hardcoded 75 missed
  sigW4/sigW5/finale-campaign; r4 picks up all 78). Seeded RNG before eval,
  window-stub discipline, competent policy, same 3 seeds as r3
  (20261011 / 777 / 424242) × 40 days. 12 transcripts.
- `scripts/test-est-favor-register-r4-20261012.js` — proof test for the blank
  (below): RED 18 fails on pristine HEAD → GREEN 31/31 fixed.

## Village assessment (plain words)

**Seed 20261011 — the starving, haunted village, dead day 26.** Wave 2
unlocked day 14 (r3: wave stayed 1). Deaths: ambush (Sofia, d16), contest
(d18), starvation (d21), monsters (d23 ×2). Pantry 38.8k → 0 by d24; the
scholar hit 0 kcal d21–26 and the village scattered at d26. Only 2
contests/shows fired (r3: 8) — contest cadence moved with the tree changes.
The betrayal menu names the real case ("put the ambush of Sofia to the
village"); four cases' investigation menus now flood some conversations
(27 choices, 20 betrayal — menu-flood grit, documented below).

**Seed 777 — the extinct village, dead day 29.** Pantry 37.2k → 0 by d16 and
never recovered. 8 deaths: monsters (d15, d28), sickness — Sofia (d15),
starvation ×3 (d18, d19, d27), a wound that wouldn't close — Lena (d21),
combat (d29). Population 12 → 0 by d28: full extinction, not just
scattering. Scholar starved d24–28. 7 contests/shows (talent_pit, stare_down,
lies won + ability_offer prize, lockpick lost). The designed food wall, at
its harshest — the pantry never had a buffer once deaths started.

**Seed 424242 — the surviving village.** 12 → 7 alive at day 41. Pantry
healthy through the leg (41k-class buffer, preserved food present).
14 contests/shows (r3: 6) — the show budget is firing with real variety
(tidepool, windfall, cache + prize_ability_offer, vigil +
prize_synergy_hint). Survivors: Ursula (social worker, trust 5, scared),
Luz (exterminator, trust 90, steady — tracking 42/survival 39, the hunter),
Lena (ER nurse), Sofia (community gardener), James (carpenter), Emma (vet),
David (plumber). Everyone knows 14–17 plants; Luz's agency XP is the
differentiated hunter again (the r3 tooling fix holds). Five of seven
survivors are "lonely" — mood variety is thin under the competent policy
(which never does social actions); flag for the social-life leg, not an
establishment bug.

## People check (SENSE-TESTING — full transcripts read)

- **The fix target, caught live twice.** 777-day15 (Emma, heal_help):
  `"About their injury — still need hands. Are you in?"` — Emma speaks
  about her OWN wound in the third person. 777-day25 (Wanda, food_share):
  `"About the help I asked you for — Never mind the food they needed — we
  got it handled. Thanks anyway."` — Wanda speaks about her OWN hunger in
  the third person, AND gets the redundant seed prefix glued onto an already
  self-naming follow-up. Both are exactly the r3 "minor grit" note, now with
  live receipts.
- **Favor arcs have real continuity.** 777-day15: re-ask ("About their
  injury" → now "About this wound") → commit → "Careful with it. And —
  thank you." → resolution=promised, obligation tracked. 777-day25: honest
  deflect → "Forget I asked. They won't forget. They'll just stop asking." +
  a memory:deflected seed. Consequences persist.
- **Grief works.** 424242-day30 (David, seek_comfort, grieving): comfort
  engagement → stage 3, resolution=comforted; closing line "Talking helps.
  Then it hurts. Then it helps again. It's a cycle." Human.
- **Curiosity teaches.** 424242-day40 (Luz): favor resume + lure opener,
  field-teaching (Bulldozer → Nightlight → American Ginseng). Two grits:
  the monster-lesson template "the tracks, the sound it makes before it
  moves, where not to stand" repeats verbatim for two monsters in one
  conversation (roboto), and the favor-resume + lure opener are two quoted
  beats back-to-back with no connective tissue.
- **Menu flood (documented, not fixed):** 20261011-day20 (Marcus): 27-choice
  menu, 20 of them betrayal-case investigation (4 cases × 5 options). A real
  player would drown. Candidate for the social-life leg or a betrayal-UI
  pass — out of scope for this run.

## Blank FILLED: favor follow-up voice (register + double prefix)

**Bug 1 — first-person register.** favor.short is spoken by the asker in
EVERY follow-up head ("About {short} — ...", "Never mind {short} — ...",
"You came through on {short}", "You said you'd help with {short}...") and
in the repay opener. Three kinds shipped third-person shorts for the
asker's own need:
- food_share: 'the food they needed' → 'the food I needed'
- heal_help: 'their injury' → 'this wound'
- sick_help: 'the sickness they're fighting' → 'the sickness I'm fighting'
The journal-facing favor.task keeps third person (the narrator quotes it —
correct).

**Bug 2 — seed double-prefix.** conversation.js's unfinished-business
opener prefixes "About {seedNote} — " unless the follow-up already
self-names — but the guard only recognized `"About ` heads. The settled
heads ("Never mind ...", "You came through on ...", "You said you'd help
with ...") got the redundant prefix. Extended the alreadyNamed guard to
all four self-naming heads.

**Fix:** src/js/convo-wants.js (3 shorts), src/js/conversation.js (guard).

**Proof:** scripts/test-est-favor-register-r4-20261012.js — builds real
favors for all three kinds, renders all five follow-up states, asserts
first-person register, no third-person slips, and (coupling guard) that
every follow-up head matches the alreadyNamed regex extracted from
conversation.js source. PRISTINE=1: 18 RED. Fixed: 31/31 GREEN.

## Regressions (node proof scripts, sequential)
- test-est-favor-register-r4-20261012 (new): RED 18 on pristine → GREEN 31/31
- test-dialog-coherence-20261011: 37/37 ✓
- test-dialog-gating-20261011: ALL GREEN ✓
- test-dialog-stream-20261011: 43/43 ✓
- test-favor-system-20261011: 30/30 ✓
- test-succession-spent-choices-20261012: ALL GREEN ✓
- test-landing-spoken-lure-20261012: 10/10 ✓
- scripts/validate-ontology.js: 83/83 ✓

## Reachable / fun / winnable
- **Reachable: yes.** 14 contests/shows in the surviving seed with real
  prize variety (ability offers, synergy hints); wave 2 unlocks in-leg via
  villager+player kills; favor arcs span conversations and states.
- **Fun: yes.** The leg's heartbeat holds — the show interrupts, villagers
  have real needs with real memories. The favor-voice fix removes the two
  recurring uncanny beats (third-person self-reference, double-prefixed
  follow-ups).
- **Winnable: the leg is the on-ramp.** 2 of 3 seeds ended in the designed
  food-wall failure (scattering d26, extinction d28); the third thrives
  into wave 2 with a healthy pantry. The competent policy feeds the player,
  not the pantry (r3's policy gap, not a game bug — a real player choosing
  to feed the pantry would do better).

## Files
- Fix: src/js/convo-wants.js (3 favor shorts → first person),
  src/js/conversation.js (alreadyNamed guard: 4 self-naming heads)
- Harness: scripts/test-journey-establishment-r4-20261012.js (dynamic
  index.html list, same 3 seeds as r3)
- Proof: scripts/test-est-favor-register-r4-20261012.js (31/31; 18 red pristine)
- Transcripts: /tmp/journey-est-transcript-*.txt (12, ephemeral)
- Censuses: /tmp/journey-est-census-{20261011,777,424242}.json

Status: fixed + committed in worktree (876b6f59); coordinator lands. No
bump, no push (ship loop owns it). merged locally, pending ship.
