# Journey leg: ESTABLISHMENT (days 14–40) R6 — 2026-10-12 (13:00 run)

Rotation idx 1 → played leg 1 (sixth establishment pass). Re-baselined on
8e5caae7 (post-landing-r7). Canon read: CANON.md, MONSTER-WAVES.md,
CONTESTS.md.

Lock: none present at run start; created playtest-loop-20261012-181954, will
delete at end. Main tree clean pre-flight; disk 15%. Worktree
journey-establishment registered + heartbeated; sim-combat-r7 active from the
sibling loop (untouched).

## What was played
- `scripts/test-journey-establishment-r6-20261012.js` — r5 harness, same 3
  seeds (20261011 / 777 / 424242) × 40 days, competent policy, text capture
  ON. Re-run post-fix on seed 424242 — clean.
- `scripts/test-est-lesson-beats-r6-20261012.js` — proof test for this run's
  blanks: RED-verified vs pristine HEAD source, 90/90 GREEN fixed.

## Village assessment (plain words)

**Seed 20261011 — game over day 36.** 12 → 4 alive. Pantry 38.8k → 0. Deaths:
monsters (villager-vs-monster combat, incl. a wave-2 voice_mimic_radio d25),
combat, starvation, and a thirst crash (3 dead d33–34 — the cistern ran dry
and the creek runs never happened). Wave 2 unlocked. The designed food wall
plus a water logistics failure; the village fought hard (13 monster kills by
villagers) but the pantry never recovered once the foragers thinned.

**Seed 777 — game over day 29.** 12 → 1 alive. Pantry 37.2k → 0. Monster-heavy
(nevermore d9, nightcourt d28, emma d15, sofia d16), starvation, combat. Wave
1 only — fights happened but kills were spread thin across types, never
banking the wave-2 ledger. The collapse seed: early predator pressure the
village never answered.

**Seed 424242 — the thriving village, day 41.** 12 → 9 alive. Pantry
41.3k → 19.3k + 12.4k preserved — the surplus economy holds. **Wave 3
unlocked in-leg** (moderator, understudy, statickite kills; paparazzo,
hushwolf, hummice kills d40 — the village defends itself constantly: 20
villager-vs-monster combat resolutions). 13 contests/shows with real prizes
(ability offers, synergy hints, knowledge dumps). Survivors carry real
knowledge (22 plants, 9 skills, 7 monsters). This is the leg at its best:
routines, specialists, a pantry, the show interrupting, the escalation
arriving on schedule.

## People check (SENSE-TESTING — full transcripts read, 14 files)

Villagers act like people; the continuity is the leg's heartbeat:
- **Ursula (424242, social worker, d15/d20):** "When's the last time you
  really laughed?" → "Stealing joy. I like that. We should steal more of
  it." / d20: "What do you miss most? From before." → "God. Yes. I dream
  about soup. Actual soup, with a spoon." — genuine, her want (curious)
  engages both times.
- **Jimena (424242, bush pilot, d25):** "Do you believe in anything? Now, I
  mean. After everything." → "That's not naive. That's load-bearing. Hold
  onto it." — the bush pilot's faith is structural, not sentimental.
- **Hattie (424242, beekeeper, d35→d40):** d35 unfinished favor — "We never
  finished talking about that favor — we got cut off, 2 days back." → "This
  cut — I can't clean it properly one-handed." → commit → "Careful with it.
  And — thank you." (promised). d40: the wound healed on its own — "You said
  you'd help with this wound. ...It's done now. Forget it." → "Right. Forget
  it. They won't forget. Debts unpaid just sit there." (deflected) — the
  broken promise sits in the ledger. The village remembers.
- **Ciro (777, librarian, d20/d25):** d20 refused a night-watch favor →
  "...Okay. I'll figure it out. They won't ask twice. That much is clear."
  d25 grieving, mourning beat live, settles an old food favor: "Never mind
  the food I needed — we got it handled. Thanks anyway."
- **James (777, carpenter, d15):** water favor with real stakes — "The
  cistern's nearly dry — 4 liters left." → "Do the math with me: 4 liters,
  8 people. That's not tomorrow's water." → "Dawn, then. Bring something to
  carry — and thank you." (promised). The cistern then ran dry on seeds
  20261011 anyway — the promise outlived the logistics.

## Blanks FILLED (two, caught live in r6 transcripts)

**Blank 1 — monster-lesson template repetition + double-speak.** "Teach me
something from the wild." spoke ONE generic template for every species
("the tracks, the sound it makes before it moves, where not to stand"),
and agencyTeachMonster's 📖 narrator beat repeated the SAME template — a
single teach doubled it, five teaches were five copies with a swapped name.
Also `"The ${monsterDisplayName}"` article-doubled pre-naming ("The a
dog-shaped silence at the treeline — ..."). Fix (src/js/villager-agency.js):
new `Game.agencyMonsterLessonLine(mid)` — the lesson teaches the monster's
REAL tell (first sentence of its primary-attack telegraph, data) + when it
hunts, in 3 deterministic-per-species compositions; prose descriptors fall
back to 'something' via monsterNoun (no more mangled grammar); the narrator
beat now only frames + records "(Monster codex: observed.)". Counter TRICKS
stay knowledge-gated (discoverMonsterCounter / beasttricks topic, slain
types only — canon: field lessons teach 'observed'-level knowledge).
Proof: 90/90 (11 species × per-monster/distinctness/determinism/no-trick-
leak + teach-flow framing + transcript + water_haul quoting); RED-verified
against pristine HEAD source; 59-species sweep: 59 unique, 0 composition
breaks. Sample: "The Bulldozer — Lowers its head, paws the earth. It hunts
by day — watch the open ground."

**Blank 2 — water_haul favor quote mixing.** The water favor glued its ask
OUTSIDE the quotes ("The cistern's nearly dry — 4 liters left." I can't
carry enough alone. First light, the creek, you and me?) — the player
couldn't tell what was spoken vs. narrated, and the ask IS the favor (the
menu's commit/decline answers it). It was the only favor with mixed
quoting; siblings fully quote. Fix (src/js/convo-wants.js): the whole favor
line + whyLine are quoted speech. Deterministic variant selection
unchanged — same content, honest framing.

## Regressions (node proof scripts, sequential)
- test-est-lesson-beats-r6-20261012 (new): RED-verified → GREEN 90/90
- test-dialog-coherence-20261011: 37/37 ✓
- test-dialog-gating-20261011: ALL GREEN ✓
- test-dialog-stream-20261011: 43/43 ✓
- test-favor-system-20261011: 30/30 ✓
- test-est-favor-register-r4-20261012: 31/31 ✓
- test-landing-lure-spoken-20261012: 9/9 ✓
- test-est-opener-beats-r5-20261012: 14/14 ✓
- test-convo-norepeat-fallback-20261011: 9/9 ✓
- test-convo-seed-voice-20261011: 37/37 ✓
- scripts/validate-ontology.js: 85/85 ✓

## Observed, not fixed (documented)
- Voice-closer "You'd know about that." after a stealing-joke answer reads
  faintly accusatory; double-space join before it. Curated voice data,
  borderline — flagging for a voice-data pass (same class as the r7
  bare-closer fix, not the same bug).
- r5's deferred items still open: betrayal-case investigation menu flood
  (betrayal choices crowd the menu when a plot invite is pending — the lure
  now speaks, but 27-choice menus persist); opener tail "...if that helps."
  (Emma d30) reads like a leftover composition artifact.

## Reachable / fun / winnable
- **Reachable: yes.** Contests fire on cadence (13/shows per seed on the
  surviving ones) with real prizes; wave 2 unlocks in-leg in fighting
  villages; wave 3 reachable by day ~40 in a strong one; favor arcs span
  seeds, deflections, broken promises.
- **Fun: yes.** The opener beats and the favor arcs are the leg's heartbeat
  — villagers with real needs, real memories, real questions. The two fixes
  remove the recurring uncanny beats (template-doubled lessons, spoken-vs-
  narrated favor asks); lessons now teach things that matter for the next
  fight.
- **Winnable: the leg is the on-ramp.** 2 of 3 seeds collapsed (d29, d36 —
  the designed food/water wall), 1 thrived into wave 3. The competent policy
  feeds the player first; a real player feeding the pantry does better.
  Collapse seeds die to logistics, not to unfair fights — the wall is the
  design.

## Files
- Fix: src/js/villager-agency.js (agencyMonsterLessonLine; framing beat),
  src/js/convo-wants.js (water_haul quoting)
- Proof: scripts/test-est-lesson-beats-r6-20261012.js (90/90)
- Harness: scripts/test-journey-establishment-r6-20261012.js
- Transcripts: /tmp/journey-est-transcript-*.txt (14, ephemeral)
- Censuses: /tmp/journey-est-census-{20261011,777,424242}.json (ephemeral)

Status: fixed + committed in worktree; coordinator lands. No bump, no push
(ship loop owns it). merged locally, pending ship.
