# Scale Debug Scenarios — evidence (2026-10-11)

Steve 2026-10-11: "include relevant debug scenarios" — he wants to experience
the scale transitions on his phone. Correction: "We need the scenarios for
each scale stage not just the highest."

## What was built

9 scenarios in `src/js/debug-scenarios.js`, new "🌍 Scale" debug category.

**Transition beats** (drop the player right BEFORE the moment — sleep to let
the day turn and the beat stages, played not viewed):
1. `scaleDawn` — 🌅 Regional Dawn eve. One bond, 21 days old, gesture answered
   or not, Dawn pending. Sleep → the System overlay grows into coordination.
2. `scaleCouncil` — 🕊️ Founding Council eve. 3 seasoned covenant bonds (35d,
   trust 45), regional a full season. Sleep → Council: pact/pool/walk/REFUSE.
3. `scaleCharter` — 📜 Charter eve. 3 seasoned trade bonds. Sleep → Charter:
   sign/bargain/walk/REFUSE.
4. `scaleCourt` — ⚖️ Iron Court eve. 3 fires taken by force, a season held
   (conquered links: the season, not the trust). Sleep → Court:
   yoke/mercy/release/REFUSE.
5. `scaleWatchers` — 📡 Watchers eve. National, viewership 42. Sleep → the
   world feed demands Haven: champion/feast/decline.

**Stage snapshots** (what life IS at each rung):
6. `scaleVillage` — 🏕️ day 20, no links. The baseline.
7. `scaleRegional` — 🤝 day 45, 2 bonds, tribute flowing, coordination live.
8. `scaleNational` — 🏛️ day 75, covenant polity running, granary open,
   viewership 25. The pantry pressure is the point.
9. `scaleGlobal` — 📡 day 100, globalLive, viewership 48. Favorite-fire pressure.

All links are honest: formed through the real `_formLink`/`_formPeerLink`,
then seasoned (30+ days, trust 40+; conquered: season only) — the same
`_linkSeasoned` gates the game uses. No faked flags except the stage
snapshots' live flags (networkLive/nationalLive/globalLive), which reflect
what the gates would have produced.

## Proof

`scripts/test-scale-scenarios.js`: **60/60 GREEN**.
- All 9 listed + in the 🌍 Scale category.
- scaleDawn: bond 21+d, `_checkRegional` fires the Dawn, networkLiveDay set.
- scaleCouncil/Charter/Court: 3 seasoned links each, polity qualifies, rung
  gate open, `_checkNational` stages the beat with the right shape,
  `answerNationalChoice('refuse')` resolves (scaleRefused).
- scaleWatchers: viewership 42, `_checkGlobal` stages pendingGlobal.
- Stage snapshots: correct days, flags, link counts; national/global snapshots
  hold their polities.

`scripts/validate-ontology.js`: 78/78 green.
`scripts/test-debug-scenarios.js`: 80 pass, 4 fail — the 4 failures
("zero English across roster", "native tongues set", "starts at village
edge") reproduce identically on pristine HEAD; pre-existing, unrelated
(roster language generation).

## Sense check (read aloud)

- Dawn eve: "The gesture went out; the Dawn has not yet broken. Sleep (or
  wait out the day) and watch the System overlay grow into coordination."
  Reads as anticipation, not a checklist.
- Council eve: "Three seasoned covenant bonds; Haven has been regional a full
  season." The beat that follows is the played Council — pact/pool/walk with
  REFUSE always offered.
- Court eve: "Three fires taken by force, a season held. The realm answers
  for how it was built." The Iron Court's yoke/mercy/release lands as
  judgment, which is what conquest earned.
- Watchers eve: "National, viewership 42, the planet is watching." Dusk
  day-part — the feed comes alive at dusk.
- Each stage snapshot names 2–3 things to try, so Steve can feel the rung
  rather than just see the flag.

## Before/after visibility (Steve's ask)

The transition beats are staged so the overlay growth is checkable: run the
eve scenario, screenshot the System overlay / tribute panel / coordination
UI, sleep, screenshot again. The Dawn adds the coordination layer; the
national beats add the polity machinery (pool, tariff, defense calls); the
Watchers add the broadcast tier. The stage snapshots let him compare the
rungs side by side.
