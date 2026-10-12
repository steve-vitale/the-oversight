# Journey leg 5 — social life, r6 (2026-10-12, run 2026-10-12T09:30:43Z)

**Leg:** social life (conversations, gossip, moots, friendships, rivalries across a full run). Rotation 5→6 (succession next).

## Play
Full-run sim harness (`scripts/journey-social-life-20261012-r6.js` — r5 script +
moot-transcript capture). Competent survival base + socialite layer, real full
conversations through the natural player path, honest votes in justice trials
(new: the player now votes on evidence instead of leaving trials hanging).
3 fresh seeds, DAYCAP=140.

| seed | end | fullConvs | naturalEnds | forced | feasts | petition moots | justice trials | met |
|------|-----|-----------|-------------|--------|--------|----------------|----------------|-----|
| 20261012 | village-lost day 115 | 68 | 60 | 8 | 16 | 3 | 0 | 14 |
| 111 | survived day 120 (2 alive) | 73 | 70 | 3 | 17 | 1 | 0 | 11 |
| 222 | village-lost day 83 | 49 | 30 | 19 | 11 | 0 | 0 | 11 |

190 full conversations, 133 natural ends. 4 petition moots captured as FULL
transcripts (the r5 documented blank — r5's capture was empty because the sim
harness stubs `Game.say` to noop and the span math broke on the log cap; r6
uses recording stubs + base-offset spans).

## Village assessment (plain words)
**Seed 20261012** — everybody died. James fell in combat d16, Carlos to a
monster d19, Linda d23, Marcus d45, Carmine d57, Malik and Eduarda d70, then a
d109–110 combat wipe took Lena, Barra, Ines and Rosa; David starved alone on
d115. 34 plants in the codex, 1600 kcal in the pantry — they didn't starve,
they were fought to death. **Seed 111** — David the plumber (trust 90) and
James the carpenter (trust 0, mood warm) outlived everyone to day 120; 10
fallen, mostly combat and monsters, Chester starved d100, pantry at 0.
**Seed 222** — 7 fallen by day 83; Marcus died of lockjaw (the mundane disease
pool working as designed), the rest to combat. What was missing in all three:
nobody thrives — the villages that survive long enough to be social are
two-person remnants. Social content is proven on dying villages, same as r5.

## People check (sense-tested transcripts)
- **Petition moots (4 full transcripts):** the arc is genuinely good — the fire
  built up, petitioners outside the light, named speeches for/against, the
  count said aloud ("7 for taking them in. 2 against."), the loudest loser
  speaking after ("Fine. But when the food runs short, remember whose idea
  this was."), consequences with teeth (the rejected walk to The Red Table;
  "Haven is clean hands. (Opinion +2 with every village that knows you.)").
  Two days of cannibal petitions back-to-back played Sofia's "They EAT people"
  line and Carmine's count VERBATIM — speech pools are single-template per
  cause (documented blank, content work for a future run).
- **Conversations:** Sofia (day 24, pre-fix evidence) carries her unfinished
  thread with the dead Linda into the player's conversation ("Linda and I
  never finished talking... You're wearing Linda's shoes now") — real
  continuity, reads like a person. The 19 forced closes on seed 222 were the
  driver mashing one investigation choice, which is exactly what exposed the
  blank below.
- **Gossip:** chains spread with real distortion (0→6, up to 7 hearers,
  'raid'/'order'/'departure' actions traveling villager-to-villager), but only
  1–6 gossip entries per 140-day run — the village is quieter than the design
  ("information spreads by gossip, not broadcast") suggests. Observation, not
  a fix this run.

## Blank filled: the r5 deflect fix collapsed back into the parrot
`convoSelfRepeatLine`'s "past 9 uses → canonical" cap lived on the persistent
`v.conv[vid]` object and `startConvo` never reset it — so after 9 LIFETIME
self-repeat calls the pool collapsed to the canonical line VERBATIM, forever.
Instrumented evidence: emma_larsen 78x, lena_ruiz 20x, gen_aplgycf 19x
identical "I just said — did you miss it?" in one run — the exact filler-loop
Steve called out, reintroduced by the fix itself. Also found: eager evaluation
in `finish()` burned a pool slot on every successful sayLine (phase shift),
and convo-dialogue.js's `dlg:details` blocked branch still had the hardcoded
line (fourth call site r5 missed).
Fix: pool cycles FOREVER (rotating honest brush-offs is what a real person
does); `startConvo` resets the counter (true per-conversation pool);
`sayLine` accepts a lazy function fallback; both eager call sites pass thunks;
dlg:details wired to the pool.
Proof `scripts/test-convo-deflect-cycle-20261012-r6.js`: 13/13 GREEN (6 RED
pre-fix). r5 test updated to the new contract: 11/11. Post-fix wild verify
(seed 222, 140d): 167 deflects split 72/53/42 across variants, longest
identical run = 1 — zero verbatim adjacency in the whole run.
Regressions: norepeat-fallback 9/9, gossip-rumors 11/11, self-gossip 13/13,
moot-grammar ALL GREEN, test-moot 38/1 (pre-existing bribe failure, identical
on pristine src), ontology 84/84. playtests/test_conversations.js fails
identically pre/post (pre-existing stale harness module list, missing
resolveConsequence — r5 documented).

## Verdict
- **Reachable: YES.** Conversations (190), talk requests, feasts (44), petition
  moots (4, full transcripts now) all fire organically; the player votes in
  trials and moots with remembered social consequences.
- **Fun: YES, with the robot parrot now actually dead.** Moot ceremonies read
  like theater; NPC memory (dead Linda's unfinished thread) reads like people.
  The single-template moot speeches are the remaining robotic edge.
- **Winnable: PARTIAL — survival, not sociality, is the binding constraint.**
  Combat attrition decides every run (d83/d115 wipes, 2-person remnants at
  d120). The social leg's content is solid; villages need to live longer for
  it to compound.

## Blanks documented (not fixed)
1. Petition-moot speeches are single-template per cause (verbatim across
   consecutive moots). Needs a rotating pool like convoDryLine — content work.
2. Zero justice trials fired in 3 full runs (~300 village-days). The courtroom
   ceremony (callMoot→conductTrial, incl. the trial-by-combat path fixed this
   morning) has no natural-fire coverage in this loop. Either competent play
   never produces crimes (working as designed) or the ladder stalls —
   a targeted probe should decide.
3. Gossip volume: 1–6 entries per 140-day run. The distortion machinery works;
   the village may just be too quiet for "information spreads by gossip."
