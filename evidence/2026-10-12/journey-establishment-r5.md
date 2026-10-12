# Journey leg: ESTABLISHMENT (days 14–40) R5 — 2026-10-12 (06:30 run)

Rotation idx 1 → played leg 1 (fifth establishment pass). Re-baselined on
2b78c0ff (post-c61aa343: favor deflect pools, armor-up policy, trapline).
Canon read: CANON.md, MONSTER-WAVES.md, CONTESTS.md.

Pre-flight note: main tree had 4 dirty files (index.html, src/js/build.js,
sw.js, version.json) — the STALE-INDEX hazard from the batch ship loop: the
shared index held the OLD version tag (fc9dd296-20261012-052411) while HEAD
and worktree agreed on the new tag (c61aa343-20261012-112411). Resynced with
`git read-tree HEAD` (index-only); no work lost, tree verified clean after.
Lock: none present; created and will delete at end of run.

## What was played
- `scripts/test-journey-establishment-r5-20261012.js` — r4 harness refreshed
  (dynamic index.html list, now 79 files), same 3 seeds (20261011 / 777 /
  424242) × 40 days, competent policy, text capture ON.
- `scripts/test-est-opener-beats-r5-20261012.js` — proof test for this run's
  blank (below): RED 7 on pristine → GREEN 14/14 fixed.

## Village assessment (plain words)

**Seed 20261011 — the collapse, game over day 30.** 12 → 1 alive. Pantry
38.8k → 0 by the end; scholar at 0 kcal. Wave 2 unlocked. Deaths came in
three flavors: monsters (Emma d17, Lena d23, James d28), starvation (d17,
d24, d27 ×2), sickness (d24). The designed food wall, sharpened by wave-2
predators — the village fought (moderator, hushwolf kills) but the pantry
never recovered once deaths started thinning the foragers.

**Seed 777 — the thin survivors, day 41.** 12 → 5 alive. Pantry 37k → 4.5k —
a real buffer, thin but holding. Wave 1 never unlocked wave 2 (fewer than 5
wave-1 ledger points — fights happened but kills were spread thin across
types). 12 contests/shows fired with real prize variety (ability offers,
synergy hints, knowledge dumps). Survivors carry real knowledge (19 plants,
5 monsters).

**Seed 424242 — the thriving village, day 41.** 12 → 10 alive. Pantry
41k → 37.8k — the surplus economy holds. **Wave 3 unlocked in-leg**
(moderator, understudy, statickite kills; a villager died to a Static d40 —
wave-2 predators are a real tax even on a strong village). 13 contests/shows.
This is the establishment leg at its best: routines, specialists, a pantry,
the show interrupting, the escalation arriving on schedule.

## People check (SENSE-TESTING — full transcripts read)

Villagers act like people. The continuity is the star:
- **James (777-day15, water favor):** "We're down to 0 liters of clean
  water." / "I can't carry enough alone. First light, the creek, you and
  me?" — first-person need, real stakes; commit → "Dawn, then. Bring
  something to carry — and thank you." resolution=promised.
- **Ciro (777, four conversations, days 20→30):** day 20 food favor deflected
  → "Right. I get it." + subject closed, memory:deflected planted. Day 25 a
  NEW wound ask arrives from seed (the old deflection is offered back as a
  choice — the village remembers what you refused). Day 30: the player never
  delivered on day 25's promise → "About what you promised..." memory choice
  is live, and Ciro the librarian asks a real question instead: "What's the
  most useful thing you've learned since we got here?" → "How to be hungry
  and keep going anyway." → "The fundamental skill. Everything else is
  decoration." A genuine exchange with a point of view, want resolved
  engaged. Grief/mourning beats fire by name (crisis r4 mantle memory holds).
- Favor register (r4's fix) holds: "the food I needed", "this wound", "the
  sickness I'm fighting" — all first person in follow-up heads.

## Blank FILLED: opener-beat hygiene (two glue bugs, caught live in r5)

**Bug 1 — pending-invite lure space-glued onto the want opener.**
conversation.js appended the invite label with a bare space:
`"We're down to 0 liters of clean water." I can't carry enough alone. First
light, the creek, you and me? "Come get air with me. I need to think out
loud."` — three discourse moves in one breath, no connective tissue (777-day15
James, 777-day25/day30 Ciro — the invite def varies: air/haul/look). The
landing-r6 intent was "a second opener beat" — now it literally is one: the
lure speaks as its own THEM line right after the opener (same precedent as
the drift note beat). `inv.spoken` once-per-pending unchanged; accept/decline
untouched.

**Bug 2 — voiceLine prepended a discourse opener onto self-naming favor
heads.** The seed-prefix guard (r4) did its job, then voiceLine glued a voice
open fragment on top: `"The way I read it — Never mind the food I needed —
we got it handled. Thanks anyway."` (777-day20 Ciro; fragment from the
measured age-set open pool). New shared `Game.convoFavorHead(line)` recognizes
the five self-naming heads (About / Never mind / You came through on / You
said you'd help with / inherited "I asked X about"); voiceLine never leads
heads with an opener and filters dash-led closers on them (trailing/address
closers stay — voice without the doubling). The r4 favor-register test's
coupling guard now uses the behavioral API (falls back to source-regex
extraction on pristine trees).

**Fix:** src/js/conversation.js (+39/-3). **Proof:**
scripts/test-est-opener-beats-r5-20261012.js — 14/14 GREEN fixed, 7 RED on
pristine (HEAD conversation.js swapped in: openers prepended, lure glued).

## Regressions (node proof scripts, sequential)
- test-est-opener-beats-r5-20261012 (new): RED 7 pristine → GREEN 14/14
- test-dialog-coherence-20261011: 37/37 ✓
- test-dialog-gating-20261011: ALL GREEN ✓
- test-dialog-stream-20261011: 43/43 ✓
- test-favor-system-20261011: 30/30 ✓
- test-est-favor-register-r4-20261012: 31/31 ✓ (coupling guard updated for
  convoFavorHead; RED path verified via HEAD-source extraction)
- test-landing-spoken-lure-20261012: 11/11 ✓ (updated to the r5 contract:
  lure spoken as its own transcript beat, asserted NOT glued into r.line)
- scripts/validate-ontology.js: 84/84 ✓

## Observed, not fixed (documented)
- Stoic voice closer "Done." lands after a question ("Are you in? Done.") —
  reads as the speaker giving up mid-ask. Curated voice data, borderline;
  left alone (scope), flagging for a voice-data pass.
- r4's deferred items still open: betrayal-case investigation menu flood
  (27 choices, 20 betrayal) — social-life/betrayal-UI pass; monster-lesson
  template repetition ("the tracks, the sound it makes before it moves...")
  — field-teaching variety.

## Reachable / fun / winnable
- **Reachable: yes.** Contests fire on cadence with real prizes; wave 2
  unlocks in-leg in fighting villages; wave 3 reachable by day ~40 in a
  strong one; favor arcs span seeds, deflections, broken promises.
- **Fun: yes.** The opener beats are the leg's heartbeat — villagers with
  real needs, real memories, real questions. The two glue fixes remove the
  recurring uncanny beats (triple-fragment openers, doubled discourse
  markers).
- **Winnable: the leg is the on-ramp.** 1 of 3 seeds collapsed on the
  designed food wall (d30), 1 survived thin, 1 thrived into wave 3. The
  competent policy feeds the player first; a real player feeding the pantry
  does better (r3/r4 policy note, unchanged).

## Files
- Fix: src/js/conversation.js (convoFavorHead; voiceLine head rule; invite
  lure as own beat)
- Proof: scripts/test-est-opener-beats-r5-20261012.js (14/14; 7 red pristine)
- Harness: scripts/test-journey-establishment-r5-20261012.js
- Test updates: scripts/test-est-favor-register-r4-20261012.js (behavioral
  coupling guard), scripts/test-landing-spoken-lure-20261012.js (separate-beat
  contract)
- Transcripts: /tmp/journey-est-transcript-*.txt (15, ephemeral)
- Censuses: /tmp/journey-est-census-{20261011,777,424242}.json (ephemeral)

Status: fixed + committed in worktree; coordinator lands. No bump, no push
(ship loop owns it). merged locally, pending ship.
