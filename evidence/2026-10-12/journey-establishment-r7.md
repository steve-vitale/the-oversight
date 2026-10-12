# Journey leg: ESTABLISHMENT (days 14–40) R7 — 2026-10-12 (18:30 run)

Rotation idx 1 → played leg 1 (seventh establishment pass). Re-baselined on
a3b8d937 (post-landing-r8 lure respeak + longsim-combat-r8 witnesses).
Canon read: CANON.md, CONVERSATIONS.md.

Lock: none present at run start; created, heartbeat on register, will delete
at end. Main tree clean pre-flight; disk 15%. Worktree journey-establishment
registered + heartbeated (sim-wave-r7 active from the sibling loop, untouched).

## What was played
- `scripts/test-journey-establishment-r7-20261012.js` — r6 harness, seeds
  20261011 / 777 / 424242 / 60606 × 40 days, competent policy, text capture
  ON. Post-fix re-harvest on seed 777 confirmed the honest beats live.
- `scripts/test-est-settled-favor-engage-20261012.js` — proof test for this
  run's blanks: RED-verified vs pristine HEAD source, 18/18 GREEN fixed.

## Village assessment (plain words)

**Seed 20261011 — scattered day 20 (famine).** Pantry hit 0 on day 19, three
hungry days, the village scattered on day 20. Dedi the journalist asked for
food on day 20 with real stakes ("My hands shake when I try to work") and
the promise was made — the food wall took the village before the promise
could be kept. 7 alive at scatter, wave 2 reached. The designed wall, honest.

**Seed 777 — thriving to day 41.** 6/6 alive at the end, 16–18 contests/shows
with real prizes (ability offers, synergy hints, knowledge dumps), 17 plants
/ 5 skills / 7 monsters known. Trust spreads 0–90 (Manuel the electrician at
0 trust but 19 plants known — distrustful, useful, very human). Villagers
fought 6+ real monster fights.

**Seed 424242 — thriving to day 41.** 9/9 alive, 7 contests, 20 plants / 7
skills / 7 monsters known. Luz the exterminator at trust 90 — the wound
favor across the whole leg (asked d25, re-asked d30, committed d30).

**Seed 60606 — scattered day 13.** Never entered the leg: pantry 0 by day
11, scatter day 13 with 11 alive. A pre-leg logistics collapse — informs the
food-wall baseline, not the leg.

## People check (SENSE-TESTING — full transcripts read, 14 files)

Villagers act like people; the favor system is the leg's heartbeat:
- **Dedi (20261011, journalist, d20):** food favor with the shaking hands,
  "I'm listening" deepens to the why, commit lands "Thank you. I won't
  forget who fed me when it mattered." — want, stakes, resolution.
- **Hattie (424242, beekeeper, d15):** the left-behind question answered with
  "Yeah. A long quiet. Me too." — two words and a pause do more than a
  paragraph.
- **Manuel (777, electrician, d30):** THE BUG CATCH — opener "Never mind
  this wound — we got it handled. Thanks anyway." then "How can I help?"
  → "It's getting worse, not better..." — the dead ask's stakes spoken
  moments after the settlement. Fixed (see below); post-fix harvest on the
  identical seed/villager/day reads honestly.
- **Wanda (777, exterminator, d40):** re-ask "I hate to ask twice, but it's
  still open. Will you?" → commit → "Careful with it. And — thank you."
  plus a real monster lesson ("Saw things with too many joints. Give them
  room.") — the r6 per-species lesson fix holding up across the leg.

## Blanks FILLED (two, both in the settled-favor family)

**Blank 1 — settled favors spoke the dead ask's whyLine.** When a need died
between the seed and the sitting, the opener honestly declared the favor
settled ("we got it handled") — but "How can I help?" / "Tell me more"
then spoke the DEAD favor's whyLine ("It's getting worse, not better"),
and "I can't right now" fired the guilt-framed deflect beats ("They won't
forget. They'll just stop asking.") for an ask that never existed in that
sitting. Fix (src/js/convo-wants.js): engageBeat / deflectBeat / closeLine
honor settled states (moot/thanked/acknowledged/fulfilled) with honest
it's-handled beats. Live favors untouched (whyLine deepening preserved).
Proof 18/18 (RED-verified 6 fail pristine).

**Blank 2 — settled-favor want re-open dead-ended.** "Is there something you
need? Really." on a settled favor fell through to the "Okay. Here's the
thing —" opener fallback (caught live, seed 999). Fix
(src/js/conversation.js, the akind==='want' branch): settled ask_favor wants
answer "No, really — it's handled. Thanks for asking, though."

**Small fix — food_share whyLine was the only unquoted favor whyLine.**
Every other kind quotes it; food_share rendered as narration ("THEM: I
haven't eaten right in days..." — no quotes, seed 20261011 d20). One-line
fix in convo-wants.js; whyLine is speech-only (journal uses why/stakes),
so quoting is safe.

**Small fix — voiceLine double-space joins.** Space-led closers (' Funny how
that works.', ' Not that it matters.') got sep=' ' ON TOP of their own
leading space ("Will you?  Funny how that works."). A space-led closer now
joins with no extra space. (The closer pool itself is curated voice data —
kept as-is per r6's stance.)

## Regressions (node proof scripts, sequential)
- test-est-settled-favor-engage-20261012 (new): RED-verified → GREEN 18/18
- test-dialog-coherence-20261011: 37/37 ✓
- test-dialog-gating-20261011: ALL GREEN ✓
- test-dialog-stream-20261011: 43/43 ✓
- test-favor-system-20261011: 30/30 ✓
- test-landing-lure-spoken-20261012: 9/9 ✓
- test-landing-lure-respeak-20261012: 11/11 ✓
- test-est-opener-beats-r5-20261012: 14/14 ✓
- test-convo-norepeat-fallback-20261011: 9/9 ✓
- test-convo-seed-voice-20261011: 37/37 ✓
- test-est-favor-register-r4-20261012: 31/31 ✓
- test-est-lesson-beats-r6-20261012: 87 GREEN / 3 pre-existing fails (the
  suite's RED-check assumes HEAD~1 is the pre-r6-fix base; the tree has moved
  past it — identical failures on pristine, unrelated to this run)
- scripts/validate-ontology.js: 85/85 ✓

## Observed, not fixed (documented)
- Betrayal-case menu flood (r6 deferred): NOT observed this run — menus maxed
  at 13 choices; the 27-choice flood needs 2+ concurrent open cases. A
  collapse-per-case-actions-behind-a-dossier-choice redesign is a design
  call; documenting, not launching.
- "There's more, but that's for another fire." as first-exhaustion closer:
  the menu promises a lesson on npcFieldLessons, the engine finds nothing
  new, and the soft-deferral closer implies more is coming. Second ask gets
  the honest closer. Borderline by design; watching.
- r6's deferred items still open: voice-closer "You'd know about that." is
  embittered-drift voice data (accusatory BY DESIGN — kept); quiet closer
  "...if that helps." is curated register data (kept).
- Seeds 20261011/60606 scatter at the designed food wall (pantry 0 →
  scatter). The collapse is the design; the famine is the leg's weather.

## Reachable / fun / winnable
- **Reachable: yes.** Contests on cadence with real prizes; wave 2 unlocks
  in-leg; favor arcs span weeks; the re-ask variety cycle ("I hate to ask
  twice") never repeated verbatim.
- **Fun: yes.** The favor economy is the leg's heartbeat — wounds, water,
  food, all with names and stakes. The two fixes remove the recurring uncanny
  beats (dead-ask whiplash, guilt for a handled favor, narration-rendered
  hunger).
- **Winnable: the leg is the on-ramp.** 2 of 4 seeds scattered at the food
  wall (one pre-leg), 2 thrived to day 41 with real knowledge and real
  promises kept. Collapse seeds die to logistics, not unfair fights.

## Files
- Fix: src/js/convo-wants.js (settled-favor engage/deflect/close guards,
  food_share whyLine quotes), src/js/conversation.js (space-led closer join,
  settled ask_favor want re-open)
- Proof: scripts/test-est-settled-favor-engage-20261012.js (18/18)
- Harness: scripts/test-journey-establishment-r7-20261012.js
- Transcripts: /tmp/journey-est-transcript-*.txt (ephemeral)

Status: fixed + committed in worktree; coordinator lands. No bump, no push
(ship loop owns it). merged locally, pending ship.
