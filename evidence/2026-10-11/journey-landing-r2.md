# Playtest loop 2026-10-11 — journey leg 0: LANDING R2 (days 1–14)

Rotation idx 0 → played leg 0 again (r1 ran pre-favor-rebuild; this run
re-baselines on the current tree). Next: idx 1 (establishment).

Base: a7688368 (includes r1's F1/F2/F3, the favor-obligation rebuild
c6138e39, convo-loop fixes 5905fa69, relay dialogue rework b234535b +
sense pass a7688368).

## What was played
- `scripts/test-journey-landing-r2-20261011.js` — r1 harness refreshed with
  the FULL current index.html script list (69 files: +voice-piper.js,
  table*.js, relay-*.js), seeded RNG before eval, window-stub discipline.
  3 seeds × 14 days, engage-first policy. 33 transcripts.
- `scripts/test-journey-landing-r3-20261011.js` — same, with an engagement
  policy fit for the rebuilt favor flow (deepen via help/more/details,
  answer the favor's own yes/no, deflect honestly at commit points, decline
  betrayal lures, leave only when exhausted). 33 transcripts, run to
  natural ends. R2's policy left after 1 turn on hijacked yes/no menus;
  R3 is the real people-check pass.
- `scripts/test-phantom-beats-r2-20261011.js` — proof test for the blank
  (below): RED 12 fails on base → GREEN 18/18 ×3 seeds fixed.

## Village assessment (plain words)
All three villages live through the fortnight. Seed 20261011: 12/12 alive,
trust 5–35 (the player sits lowest at 5 — still the stranger), everyone
knows 14–18 plants, pantry 43k → 13.5k kcal. Seed 424242: 12/12 alive,
trust 5–38, pantry 43k → 23.8k. Seed 777: 11/12 — Marcus Webb was ambushed
and killed on day 13 (villager-on-villager betrayal plot sprung off-screen;
recorded honestly as death kind 'person' cause 'ambush'; the case/moot
machinery picked it up). Nobody starves; the player ends every seed at
100 HP. The System arrives day 8 in all seeds. The village feels alive:
Sofia teaches Pokeweed/Maypop by the fire, fireside pairs linger, gossip
fires ("Joshua isn't pulling weight" — about the PLAYER, honest social
consequence), Marcus studies plants, David barters. The cistern sits at
0L from ~day 2 (11 villagers × 2L/day vs a 20L start; only the
player-delegated 'Fetch water' duty refills it, and this player never
delegated) — the whole village spends the leg asking for water hauls.
That chorus is honest: the need is real, the numbers are real.

## People check (SENSE-TESTING LAW — full transcripts read for meaning)

**The favor system works now.** The r1 fizzles are gone:
- share_news "tell me more" → "That's pretty much all of it, honestly"
  loop: ZERO occurrences in 66 transcripts (was 6–7/33). The thread now
  exhausts honestly.
- ask_favor contentless verbatim repeats + false `engaged`: gone. Every
  favor names a real need (water haul at 0L, forage help at a draining
  pantry, wound cleaning with real stakes), lines are per-instance
  (no verbatim repeats in 32/33; the 1 repeat is the fallback bug below),
  and 32/33 resolve `deflected` honestly — `engaged` is unreachable
  without dlg:commit, as designed.
- A full favor arc reads human (777-day10, Emma, heal_help): "My cut needs
  a second pair of hands. Could you clean it out for me? Please." →
  "Yes." → "It's getting worse, not better. If it festers I'm no good to
  anyone — can't haul, can't hunt, can't watch. Just clean it out and wrap
  it tight." → "I'm sorry, I can't." → "No, yeah, of course. Forget I
  asked." They won't forget. They'll just stop asking. / close: "Take care
  of yourself, yeah? I mean it." Want → engagement → deflection →
  consequence → planted thread. This is the bar being met.

**F2/F3/F1 re-verified on the current tree:**
- F2: System-arrival arm-grab goes to a roster villager ("Abdallah grabs
  your arm. 'Tell me you hear that too.'" — Abdallah is on the roster).
  Zero phantom Mara/Jesse/Aki in 66 transcripts + 3 arrival streams.
- F3: spawn names resolve (Joshua / Bill / Casey at day 1).
- F1: the bedtime gate holds — [SLEEP] logs show bedtime hydration 50 →
  "You wake rested", no crisis, no double-punishment.

**The arrival sequence is still the leg's best writing** — unhinged,
funny, world-changing (party system, talking journals, identification,
"The days need witnesses" energy).

## Status of r1's three documented fizzles (vs the convo-loop fixes)
1. share_news filler loop — FIXED (0/66; establishment leg's news-type
   freshness work holds).
2. ask_favor contentless + false engaged — FIXED by the rebuild
   (per-instance favors, 'stated'/'promised' resolutions, no verbatim
   repeats). The fresh-ask yes/no menu (answering "Yes." engages but does
   not commit) is the convo loop's deliberate design ("untouched" per the
   social-life evidence) — left alone.
3. just_company menu mismatch — UNEVALUABLE: just_company (weight 1,
   3 when social>70) never won a single want roll in 66 conversations.
   ask_favor's urgency (2 forage / 3 water / 4 acute) beats every other
   want's 0.5–1.5 whenever a real need exists — and in the landing leg a
   real need ALWAYS exists (pantry starts below the 4000/mouth bar, water
   hits 0 by day 2). The want economy has one winner. Whether that's
   right is the convo loop's design call, but the consequence is
   observable: zero NPC questions (CONVERSATIONS.md: "the first
   conversation with someone always includes one — strangers are
   curious"), zero share_news, zero company-seeking in 66 first meetings.
   Documented for the convo loop.

## Blank FILLED: two more F2-family phantom beats (fixed in worktree)

The F2 sweep missed two beats that name "Mara" — a fixed-cast phantom;
no Mara exists in any generated roster:

1. **food.js `sweepSpoiled()`** — the pantry-spoilage teaching beat:
   "Old Mara mutters: 'Should've smoked that…'" Fires in the landing leg
   whenever stores rot and the player doesn't know smoking.
2. **game.js `freeloadWarning(vid)`, player branch** — "Mara corners you
   by the fire. 'We all eat from the same pot…'" Stage 2 of the
   freeloading sequence; the stage-1 gossip ("Joshua isn't pulling
   weight") fired in this run, so stage 2 is reachable in-leg.

Fix: both beats now cast via `this._beatCast(1)` (real living non-player
villager, displayName — descriptors pre-System, true names post-arrival),
same pattern as F2; 'Someone' fallback if the cast is empty. Comments
updated; no header/ontology changes needed.

Proof: `scripts/test-phantom-beats-r2-20261011.js` — drives the real
`sweepSpoiled()` (spoiled pantry item, preserve unknown) and the real
`freeloadWarning(playerId)`, asserting the speaker names a roster
villager and never "Mara". RED on base: 12 failures ×3 seeds (A2/A3/B2/B3
all fail: "Old Mara mutters", "Mara corners you"). GREEN fixed: 18/18.
Sample fixed beats: "A man, maybe 40s, with a limp mutters: 'Should've
smoked that…'" / "A woman, maybe 20s corners you by the fire. 'We all eat
from the same pot…'"

## Findings documented for other loops (precise, not fixed here)

**For the convo loop — run-ledger false positives + the lying fallback
(conversation.js `sayLine`, convo-dialogue.js handlers):**
- The 48-entry run-wide ledger (`convoRunLedger`, defect-7 fix) blocks
  legitimately-shared pool lines: 5-line GQ_ACK pools, the
  "Another time, then." decline line, per-kind whyLines (3 variants).
  Blocked beats fall back to "I just said — did you miss it?", which (a)
  LIES — the current NPC never said the line; another villager did
  (777-day10: Emma says it after "Yes."; 424242-day7: Marcus's water_haul
  whyLine blocked, "What do you need?" → "I just said -- did you miss
  it?"); (b) REPEATS VERBATIM — the fallback is ledger-exempt, so two
  blocked beats in one conversation parrot it (777-day10 flags
  `!! VERBATIM REPEATS: "I just said — did you miss it?"`); (c) it reads
  as the NPC snapping at the player for not listening, when the player
  answered directly. The fallback is only honest when the block came from
  the speaker's OWN ledger (true self-repeat). Suggested direction (their
  call): make `convoPick`/`convoPickCycle` run-ledger-aware so picks avoid
  blocked lines, and give exhausted pools an honest dry line (the
  topic2Beat-null pattern) instead of the snapping fallback.
  Transcript lines: /tmp/journey-landing-r3-transcript-777-day10.txt
  (turns 1 and 4), /tmp/journey-landing-r3-transcript-424242-day7.txt
  (turns 1–2).
- **betrayal invite menu cross-wire (betrayal.js `betrayalChoices`,
  `npcInviteTick`):** pending invites are created silently and surface
  ONLY as `betrayal:accept`/"decline" menu choices — the NPC never speaks
  the lure, and the opener doesn't mention it. 7/33 R2 conversations
  offered "Sure. Walk my trap line with me? Extra hands, extra eyes."
  while the NPC talked about hauling water — the player is asked to
  accept an invitation they were never given, for a different activity
  than the one discussed (424242-day7 R2; 424242-day3 R3). Accepting blind
  can walk into an armed plot. The label also echoes the NPC's lure as
  the player's own speech. Whether the silent-invite design is intended,
  the opener/invite mismatch is a sense gap.
- **NPC questions never fire** (see fizzle #3 above): 0 ans: choices in
  66 conversations; CONVERSATIONS.md's first-conversation question
  guarantee is dead under the current weights.

**For the sim loop — water economy lever:** the cistern is 0L from day 2
in all seeds (22L/day draw vs 20L start; only player delegation refills).
Villagers take silent -5 HP/day thirst damage; the only signal is the
favor chorus. Delegation-only refilling may be the design, but the
numbers make "0 liters" the permanent state, which in turn pins the want
economy to ask_favor (see above). Lever, not bug.

## Reachable / fun / winnable
- **Reachable: yes.** The full leg plays end-to-end on the current tree;
  System contact fires day 8; favors, gossip, teaching, the freeload
  sequence, even a villager murder all fire naturally.
- **Fun: yes, with the documented caveats.** The favor arcs and the
  arrival sequence are genuinely good. The "I just said — did you miss
  it?" snaps and the want monoculture (every first meeting is a favor
  ask) are the remaining grit — both documented above for the convo loop.
- **Winnable: yes for the leg.** 35/36 villagers alive across 3 seeds;
  the one death was honest betrayal-system violence, not attrition. The
  player ends every seed at 100 HP.

## Regressions (sequential, node proof scripts)
- test-phantom-beats-r2-20261011 (new proof): RED 12 fails on base →
  GREEN 18/18 ×3 seeds
- test-phantom-cast-20261011 (F2): 15/15 ✓
- test-sleep-crisis-bedtime-20261011 (F1): 5/5 ✓
- test-food-break-pantry-phantoms: 10 passed, 1 failed — the Red Hunger
  failure is PRE-EXISTING (identical 10/1 on pristine base via stash;
  unrelated to this change)
- test-dialog-coherence-20261011: 37/37 ✓
- test-dialog-gating-20261011: ALL GREEN ✓
- test-dialog-stream-20261011: 43/43 ✓
- scripts/validate-ontology.js: 74/74 ✓

## Files
- Harness: scripts/test-journey-landing-r2-20261011.js (full 69-file
  list), scripts/test-journey-landing-r3-20261011.js (engagement policy)
- Proof: scripts/test-phantom-beats-r2-20261011.js
- Fix: src/js/food.js (sweepSpoiled Old Mara → _beatCast),
  src/js/game.js (freeloadWarning player branch → _beatCast)
- Transcripts: /tmp/journey-landing-r3-transcript-*.txt (33, ephemeral)
- Censuses: /tmp/journey-landing-r3-census-{20261011,777,424242}.json

Merged locally: NO — worker does not merge; coordinator lands.
Status: fixed in worktree, "merged locally, pending ship" is the
coordinator's call. No bump, no push (ship loop owns it).
