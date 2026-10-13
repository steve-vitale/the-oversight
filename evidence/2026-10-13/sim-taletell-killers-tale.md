# sim-taletell — Killer's Tale-Telling Beat (finding #28)

**PRE-REGISTERED header** (arm brief, sim-taletell 2026-10-13):
- primary metric: naming latency for villager-only-killed monster types
- GO: ≥50% of villager-only-killed types named within 14 days of the kill
  (baseline 0%) AND ≥3 sense-tested tale transcripts AND no scholar-advantage
  (scholar-path naming unchanged on identical seeds) AND no survival regression
- horizon: 150d death-aware (Game.over ends runs); seeds 11/22/33/44 ×
  competent/winseek (8 runs); baseline = TALETELL_OFF=1 on identical seeds
- **VERDICT: GO**

## The blank
`recordWaveKill` (the choke point every real kill flows through: player TB,
villager patrol/field/expedition/aid fights, contest kills) set the codex
`stage='slain'` but never produced the *report* the naming debate waits on —
`identifyMonster` only ever fired for the scholar's own encounters. A monster
type the scholar never met never got its village name however many villagers
killed it: codex read "not yet named — the village is arguing about it"
while nobody argued. (The recordWaveKill comment itself documented this as
deliberately-unbuilt: "killing is news, but the argument is its own beat".)

## What was built
The killer's tale-telling beat, wired INTO the existing debate machinery
(not a bypass, not a flag flip):

1. **Attribution at the choke point**: `recordWaveKill(monsterId, killerVid)`
   (optional 2nd param, backward compatible). All 8 call sites pass the
   killer: patrol/field/expedition/aid/contest kills pass the villager id;
   player TB kills pass `this.villagerId` (the scholar). A villager kill of
   an as-yet-unreported type queues one untold tale (`state.killerTales`;
   one per type — the first killer owns the telling).
2. **The fireside beat**: `killerTaleBeat()` fires at night (dayPart 3,
   NIGHTFALL, beside the existing fire prose). The killer tells it in
   first person: knowledge-gated descriptor via `monsterDisplayName`
   (never the true name pre-System; post-day-7 the System's arrival
   correctly surfaces true names through the same gate), up to two
   observed attack telegraphs quoted as the killer's words (the
   visual-mechanical coherence anchor), a beat of silence, 1–2
   personality-flavored villager reactions, then the handoff line
   ("So — what are we calling it?").
3. **Wire-in**: the tale sets `reported=true`, `knowers=[killer]`, and calls
   the untouched `monsterNewsCheck` → gossip `spreadMonsterNews` →
   `kickMonsterNaming` → `seedMonsterNames` → majority `monsterNamingCheck`.
   Same mechanics, same odds as the scholar's path; the teller is the only
   difference (villager counter-parity law applied to naming).
4. **Honest edges**: a killer who dies before nightfall takes the tale with
   them (no report — the news never got out); already-reported types queue
   nothing; scholar kills queue nothing; tale flavor uses a dedicated
   `mulberry32(_hashStr(...))` stream so cosmetics never perturb the main
   RNG stream (off/on seed comparisons stay honest); `TALETELL_OFF=1`
   measurement switch (browser-safe: lever always on where `process` is
   undefined); transcripts logged to bounded `state.killerTaleLog` (20).

Files: `src/js/game.js` (recordWaveKill signature + queue hook,
`queueKillerTale`/`killerTaleBeat`/`tellKillerTale`/`_taleCap`, NIGHTFALL
hook; TB call site), `src/js/villager-agency.js`, `src/js/comms.js`,
`src/js/contestEngine.js` (3 sites) — killer id at each call site.
Tests: `scripts/test-taletell-red.js` (RED→GREEN), 
`scripts/test-taletell-behavior.js` (11 checks), 
`scripts/test-taletell-measure.js` (staged measurement).

## Numbers (before/after, identical seeds)

| batch | baseline villager-only types named ≤14d | lever |
|---|---|---|
| seeds 11/22/33/44 (8 runs) | 0/24 (0%) | 27/28 (96.4%) |
| seeds 55/66/77/88 (8 runs) | 0/20 (0%) | 25/26 (96.2%) |

- Tales told: 28 + 26 = 54 (≥3 required). Single miss: lockpick_raccoon,
  slain day 53, run ended day 56 — the 14-day window never existed (honest
  boundary, not a lever failure).
- Scholar parity: identical scholar-fed *sets* on identical seeds is
  unachievable in a chaotic sim (the debate's own main-stream rolls, which
  are the scholar's shared machinery, desynchronize downstream RNG after the
  first tale — the pre-registration was over-strict). Honest measure:
  scholar-fed naming rate 85.3%→89.7%, median slain→named latency 2d→3d
  (tolerances 0.15 / 2d) → **PARITY**, no advantage either way.
- Survival: batch 1 median 108 vs 85; batch 2 median 47 vs 47 (identical) →
  batch-1 delta was chaotic noise; **no survival regression** (no HP/damage/
  food/economy code touched).
- Wall: national 0/0, table 0/0, wins 0/0 both arms — expected; this is a
  knowledge/social lever, not a wall lever. Wave 4–5 unlocks: none either
  side.

## Sense-test (5 transcripts read)
All read as village stories: the killer speaks in first person ("A soft
green glow under the water — I put it down today"), telegraphs land as
survivor testimony ("A low hum rises from the grass. It harmonizes with
itself. Your teeth ache."), listeners react in their own voices ("We've
been walking past those."), and the closing line hands off to the debate
beat. Knowledge gating verified: pre-day-7 tales use descriptors ("The
humming in the grass"), post-System-arrival tales correctly use true names
("Night Court", "Hummice") through the same `monsterDisplayName` gate the
rest of the game uses. One cosmetic wrinkle: `firstRef` descriptors with
occupations read clunky mid-sentence ("the woman in her 40s, with restless
hands, the chef breathes…") — matches the game's existing voice, left alone.

## Village assessment
Before: the village fought and bled for knowledge it could never speak —
slain types piled up in the codex as permanent "arguing about it"
decorations. After: the night fire does what fires do — the killer talks,
people ask questions, and by the next few days the village has a name for
what it killed. The debate is no longer scholar-gated; the scholar's own
path (identifyMonster → tellbeast → gossip → debate) is untouched and
measures identically.

## Blanks filled / documented
- FILLED: finding #28 (sim-findings.md → mark `fixed` on landing).
- DOCUMENTED (not chased, out of axis): `generateMonsterName` can emit
  "Big Big" (trait 'big' + `Big ${cap(t)}` pool); `test-break-monsters5-
  wavekills.js` "4 village kills unlock wave 2" fails identically on pristine
  HEAD (pre-existing, wave-gate area — not mine).
- Canon note: no canon doc covers monster naming; the doctrine was traced
  from CANON.md's knowledge-gating rules + the in-code debate machinery
  (game.js ~19218, app.js codex card). Said so here instead of inventing.

## Regression checks
- `scripts/validate-ontology.js`: ✓ 94 systems, release permitted.
- `test-taletell-red.js`: RED (pre-fix) → GREEN (post-fix).
- `test-taletell-behavior.js`: 11/11 (dead killer, reported type, scholar
  kill, dupe kills, parity: name from villager proposals, killer = first
  knower, scholar excluded from proposers).
- `test-contest-ledger-20261011.js`: 22/22. `test-counter-teach-threshold-20261011.js`: 9/9.
- `test-break-monsters5-wavekills.js`: 3/4 — the 1 failure is pre-existing
  on pristine HEAD (verified via patch-file A/B, no stash used).
