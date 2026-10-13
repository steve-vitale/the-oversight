# Journey Endgame r7 — Leg 4 (Endgame): NPC Ascension + Facilitation, End to End

**Run:** 2026-10-12/13 · Worktree `journey-endgame` (base `af173f1a`) · synthetic day-140 villages, seeds 1301/1313/7777/1401
**Harness:** `scripts/diag-table-ascension-20261013.js` (pilot, 2 scenarios), `scripts/test-table-ascension-20261013.js` (proof, 17 asserts)

## Pre-registered question
Do NPC ascension + facilitation actually work end to end at the table?
1. Does each facilitation kind have a REAL engine effect behind its promise?
2. Do the epilogues credit the architect honestly / sting honestly when outshone?
3. Does the pantheon politics beat fire when 2+ ascend?
4. Is "bargaining power (+path strength)" priced anywhere, or only said aloud?

**Interesting-finding bar (pre-registered):** a promised-but-unwired mechanic counts; epilogue branch misfires count.

## Verdict: four promised mechanics were fake or unreachable — all four now wired, proof-tested, RED-verified.

| # | Promise | Pre-fix reality | Fix |
|---|---------|-----------------|-----|
| 1 | `tableFacilitate('shield')`: "the village's fights will spend others first" | `v.shielded` was written and NEVER read anywhere | Shielded villagers now stand at the BACK of the raid defender line in `havenRaidTick` (havenGrowth.js) — spent last, still fight when no one else is left |
| 2 | `tableFacilitate('teach')`: "You teach X everything the relay taught you" | Wrote nothing — the villager learned zero, `taughtByPlayer` stayed empty | The villager now learns the plants the Bearer <redacted> (up to 12, only what the Bearer <redacted>) via the conversation teach path's real stores (`villagerLearnsPlant` + `taughtByPlayer`) — feeds their ascension score honestly |
| 3 | `villagerAscensionScore` knowledge component ("taught and teaching") | Read `v.knowledgeBreadth`/`v.taughtPlants` — fields NO game system ever writes (only harness scripts). Unreachable in real play. | Reads the real villager knowledge model: in-run `v.taught` + background `v.familiar` (legacy fields kept as fallback) |
| 4 | "Each ascended villager adds bargaining power (+path strength)" | Said aloud ONLY in the epilogue; the audit's standing numbers never moved | `tableEarnedPaths` adds +10 standing per ascension (cap 100); the audit voices it once; the epilogue line became "The terms held — the table had priced the village, ascensions and all, and the village paid in full." (no duplicate) |

## Sense-testing (full transcripts read)

- **THE ARCHITECT beat** (facilitated ascension): "Saul Price ascended through doors you built: teach, shield. The galaxy will remember the god's name. The village will remember who built the door. Both are true. Neither is small." — names the real person, the real acts. Reads earned.
- **OUTSHONE beat** (no facilitation, villager outscores bearer): "Tanya Weber did what you would not: acted, boldly, while there was still time. The village thrives. The god is someone else. The record notes, kindly and accurately, that you watched. It stings exactly as much as it should." — honest, stings, Steve's law holds.
- **THE PANTHEON beat** (2 ascensions, new this run): "Lucas Fisher and Liam Mehta ascended together, and gods, it turns out, have politics. They argue about you the way the living argue about weather. Mostly, they agree: the village comes first. Mostly." — wry, in-voice, fires alongside (not instead of) the architect beat.
- **Beloved finale with the facilitated villager cast**: "Saul tells the hunt — the real one, with the fear left in." — the ascended villager participates as a person, not a stat block.
- **The shield promise's say line** ("the village's fights will spend others first. Protection is a kind of authorship.") is now TRUE — verified by driving a real raid and recording defender order (pre-fix the shielded villager fought second: `v,HERO,v`; post-fix last-or-not-at-all).

## Village assessment (plain words)

The synthetic day-140 village is a real place: a chef-Bearer <redacted> a dozen people through 140 days, two dead to combat and one to starvation along the way, the fire still lit. The strong villagers are people with trades and bold streaks — Saul the hunter who learned twelve plants at firesides and earned the cameras' attention, Tanya the lawyer the village trusts at 85. The player who taught them walks the table as a builder, not a god: the audit prices the run ("A lesser seat — regional standing, waves 1–3 faced (4/4/3), 2 contests survived, 2 crises weathered. The table does not rise. It prices."), and the epilogue follows the village's story — hero, facilitator, or footnote, credited honestly.

## People check

Two full table transcripts read end to end (facilitator + watcher scenarios) plus the pantheon capture: every villager named in the epilogue beats is a real person with real deeds (abilities earned, plants learned, contests survived, trust standing). The NPC-wants structure holds at the table: the facilitated villager's ascension is the payoff of a want the player chose to serve (their growth), and the outshone beat is the cost of a want ignored. Villagers act like people.

## Blanks filled

The four fixes above (all in `src/js/table.js` + `src/js/havenGrowth.js`), plus canon updates in `docs/TABLE.md` (facilitation verbs now documented as wired; ascension pricing documented as +10/standing voiced in audit; score's knowledge component documented as the real model) and a player-facing `src/data/build-notes.json` entry (pruned to 15).

## Proof + regression results

| Suite | Result |
|-------|--------|
| test-table-ascension-20261013.js (new) | **17/17** × 2 seeds (1313, 7777); RED-verified 7 failures on pre-fix code (T1a, T2a, T2d, T3b, T4a, T4b, T4c) |
| test-table-core-20261011.js | 31/31 |
| test-tablechain-20261012.js | 15/15 |
| test-table-beloved-20261011.js | 24/24 |
| test-table-sanctity-20261012.js | 34/34 |
| test-raid-player-encounter-20261012.js | 9/9 |
| validate-ontology.js | 86/86 (regen byte-identical) |

## Reachable / fun / winnable verdict (endgame leg — ascension/facilitation)

- **Reachable**: YES, improved. The knowledge component of the ascension score was unreachable in real play (read never-written fields); it now reads the fireside/fieldwork/taught stores villagers actually accumulate. A villager who learns, fights, and is trusted can clear the 45 bar on real state (pilot hero: 68).
- **Fun**: YES. The facilitation verbs are now real verbs — teaching visibly teaches (the lesson names the plants), shielding visibly reorders the defense line, and the table prices ascensions aloud before you choose a door. The pantheon beat is the table's best new line.
- **Winnable**: YES. Nothing in the finale's winnability changed; the ascension bonus (+10 standing/path) makes facilitated runs slightly stronger at the audit, which is the design ("the god needed someone to build the door").

## Files changed
`src/js/table.js`, `src/js/havenGrowth.js`, `docs/TABLE.md`, `src/data/build-notes.json`, `scripts/test-table-ascension-20261013.js`, `scripts/diag-table-ascension-20261013.js`, `evidence/2026-10-13/journey-endgame-r7.*`
