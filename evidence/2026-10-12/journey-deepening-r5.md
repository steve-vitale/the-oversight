# Journey leg 2 (deepening) — R5 run note (2026-10-12)

**Leg**: deepening (days 40–80) · **Run**: R5 · **run_id**: playtest-20261012T073046Z
**Harness**: `scripts/journey-deepening-r5-20261012.js` (r4 harness + smarter flee + standoff hands-off)
**Canon**: MONSTER-WAVES.md, KNOWLEDGE.md read.
**Seeds**: 10101, 20202, 30303, 40404, 50505, 60606 (honest, day 1→110, PROBE_W3 off)

## The blank filled: self-gossip in third person (FIXED)

R4 documented it, R5 fixed it. James (seed 50505, R4) said to the player, about
himself: "Did you hear? James just walked away from Haven. Didn't look
back." The gossip branch in `Game.askAbout(topic 'gossip', game.js)` filtered
heard gossip to "about other people" — but excluded only the PLAYER
(`dims.who !== this.villagerId`). A rumor about the TELLER's own departure
(`dims.who === vid`) sailed through and rendered as if about a third party.

**Fix** (`src/js/game.js`, +12/−5): when `g.dims.who === vid`, render
FIRST-person lines per action:
- departure: "Yeah, that was me. I walked away from Haven once. Didn't look back."
- return: "I left. Walked back in like I'd never left, apparently."
- stingy: "Word is I've been holding back. Keeping the good stuff close, yeah. I'll own that."
- generous: "People are saying I've been generous. Sharing around, no questions asked."
- default: "People are talking about me. Take it for what it's worth."
Non-self rendering is byte-identical to before. Journal notes unchanged
(journal is the scholar's voice — "they" is correct there).

**Proof**: `scripts/test-self-gossip-first-person-20261012.js` — 13/13 GREEN
post-fix; 10/13 RED on pre-fix code (stash-verified; the 3 others-mode checks
pass on both, correctly). Covers all 5 actions self + other, plus the R4
transcript regression ("Did you hear? <self-name>" never emitted).

**Regressions**: want-more-exhaustion 5/5, dialog-coherence 37/37,
favor-system 30/30, ontology 83/83.

## Tooling (harness-only, no game change)

R4's documented harness bug — the naive flee retried one blocked tile 20k
times (player (4,1) → (4,0), findPath null; hummice couldn't path either).
`scripts/journey-deepening-r5-20261012.js`:
1. **Smarter flee**: the flee step remembers its last target; a target that
   failed to move the player is not retried — the harness rotates through the
   other 7 adjacent tiles (each path-checked via findPath); if none path, the
   turn passes (the stall was the RETRY, not the pass). A real player tries
   another direction.
2. **Standoff hands-off**: 120+ rounds, zero monster-HP damage, and flee
   sealed (`noFlee`/arena) or boxed (`fleeBoxed` > 20) → the policy stops
   handling that fight (hands off); the shared driver's no-progress breaker
   exits each day's drive. The fight stays open — honest, the game never
   resolved it — loudly noted in telemetry.

No standoff fired this run; stalemate-flee fired once (60606). The 20k freeze
did not recur.

## What R5 measured (the leg)

Honest play, same 6 seeds as R4, same competent policy:

| seed | end | wave 3 | w3 fights (honest) | scale |
|------|-----|--------|-------------------|-------|
| 10101 | survived day 112 | unlocked day 98 | 0 (1 engaged) | regional (Stonebridge linked d25) |
| 20202 | survived day 105 | unlocked day 66 | 2 (Callback ×2, both lost) | village |
| 30303 | lost day 51 | — | 0 | regional (Emberhold linked d25) |
| 40404 | lost day 61 | — | 0 | village |
| 50505 | lost day 17 | — | 0 | village |
| 60606 | lost day 75 | unlocked day 54 | 4 (2× Ad Break fled, 2× Redactor lost/routed) | regional (Emberhold linked d29) |

**First honest-play wave-3 signature mechanics** (sigFired):
- **The Callback** (20202, days 86/87): wears dead villagers' faces —
  "Sofia's borrowed swing hits you for 31", "Lena's borrowed swing hits you
  for 26" — funeral/"NOT" markers surfaced. Lost both fights; the player
  survived at negative HP (cheat-death path), village down to the last.
- **Ad Break** (60606, day 65): ad break / SKIP / sponsor mechanics; the
  player struck the Sponsor-creature (counterplay engaged). Fled both.
- **The Redactor** (60606, days 68/74): REDACT — "The handles close around
  your Crossbow — REDACTED. For two rounds it is just a shape in your hands."
  Starvation mechanic fired: "The bar thins, flickers — nothing left loud
  enough to redact. It is STARVING."

**Caveat (honest measurement)**: R4→R5 (0/6 → 2/6 survived, 0 → 6 w3
fights) is a HARNESS-fairness delta, not a game balance change. R4's harness
was dumber than a real player in stalls. Game code changed only in dialogue
this run. R5 measures the game more fairly; the food+combat wall is unchanged.

## Village assessment (plain words)

**Seed 10101** (day 112, survived): four people left standing — Emma the
veterinarian (trust 90, 33 plants, steady), David the plumber (trust 90, 33
plants, lonely), Rosa the line cook (trust 90, 33 plants, lonely), and Vy the
baker (trust 8, 29 plants, lonely). They are a real village: deep plant
knowledge, high trust, regional ties to Stonebridge — and every one of them
lonely, because 25 people died getting here. Knowledge kept them alive;
grief is the price on the ledger.

**Seed 20202** (day 105, survived): one villager left — Marcus the electrician
(trust 0, 25 plants, scared). The village died around him: Lena, Emma, and
Jakob fell to monsters and wounds in the 80s; the player fought the Callback
twice and barely walked away both times. Marcus doesn't trust the bearer at
all and he's frightened — a village of two where one is a stranger. Survival,
not triumph.

**The lost four**: 30303 and 40404 died to the mid-game grind (monster +
attrition, days 51/61). 50505 wiped on day 17 to wave-1 fauna — the early
wall at its harshest. 60606 reached wave 3 and regional scale, fought four
real wave-3 fights, and died on day 75 with Emma swinging at the Redactor
for 2 damage a hit. They fought bravely and lost — the designed shape of a
wave-3 loss.

## People check (SENSE-TESTING LAW)

Read 8 full transcripts (days 55/75/95). **They act like people.**

- Vy the baker (10101, day 75), withdrawn, trust 90, on "did you leave
  someone behind": player says "Yes." — "Yeah." A long quiet. "Me too."
  Then, on gossip: "I'm not saying there's anything wrong with Rosa. I'm
  just saying I sleep better with them on the other side of the fire." —
  a real edge, a real person.
- Emma (10101, day 95): "We never finished talking about that favor — we got
  cut off, 6 days back." The unfinished-business thread from day 55's
  conversation reopens and resolves ("Careful with it. And — thank you.",
  resolution: promised). Cross-conversation memory works.
- Violet the butcher (60606, day 55): teaches Hushpuppy fieldcraft ("the
  tracks, the sound it makes before it moves, where not to stand") — the
  knowledge economy doing its job — and vouches for David: "A plumber, back
  before. Solid person."
- Favors stay concrete ("It's getting worse, not better. If it festers I'm
  no good to anyone — can't haul, can't hunt, can't watch. Just clean it out
  and wrap it tight.") with real resolutions.
- No verbatim repeats in the sampled transcripts; the R4 want-more fix holds.
- Teach reactions cycle a small pool ("Their eyes widen. 'I never knew
  that.'" / "They nod slowly, committing it to memory." / "A short laugh.
  'And I've been walking past it for weeks.'") — structural but varied per
  plant, no repeats within a conversation. Acceptable.
- Minor: favor openers sometimes stack the want's ask with a pending
  micro-quest invite ("This cut — ...?" + "Walk my trap line with me?") —
  two real asks in one breath. Reads okay; noted, not a bug.
- The self-gossip branch did not fire in the sampled transcripts; covered by
  the proof test instead.

## Reachable / Fun / Winnable

- **Reachable**: YES — wave 3 unlocks 3/6 (days 54/66/98), 6 honest wave-3
  fights across 2 seeds, 3 distinct wave-3s engaged (deed currency), regional
  scale 3/6 (Stonebridge, Emberhold ×2), signature mechanics firing. The
  leg's signature content is reachable in honest play for the first time.
- **Fun**: YES — the conversations are genuinely good (mantle-awareness,
  concrete favors, gossip with teeth, monster fieldcraft taught at the fire),
  and the wave-3 fights are hard, costly, and distinct: the Callback wearing
  your dead villagers' faces, the Sponsor-creature as a real target, the
  Redactor starving on quiet turns.
- **Winnable**: PARTIAL — 2/6 survived past day 105; 4/6 lost (one to a
  day-17 wave-1 wipe). The food+combat wall still binds. Longsim's lever
  territory, not this loop's.

## Still open (documented, not fixed)

- **Identical favor directions** (from R4): "East treeline, first light.
  Bring a pack." verbatim across NPCs — the favor template needs per-NPC
  variation.
- **Day-17 wave-1 wipes** (50505): early-game harshness. Balance lever
  question for the longsim loop.

## Files

- Fix: `src/js/game.js` (self-gossip first-person rendering)
- Proof: `scripts/test-self-gossip-first-person-20261012.js` (13/13; 10 red on pre-fix)
- Harness: `scripts/journey-deepening-r5-20261012.js` (smarter flee, standoff hands-off)
- Evidence JSONs: `evidence/2026-10-12/journey-deepening-r5-*.json`
- Transcripts: `/tmp/journey-deep-r5-transcript-*` (8 read)
