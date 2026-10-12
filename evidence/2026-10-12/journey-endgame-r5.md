# Journey leg: ENDGAME (day 140+) — 2026-10-12 (run 5)

Rotation 4 → 5. Worktree `journey-endgame`. No lock existed (stale-lock recovery: none needed). Stale registry cleanup: removed the dead `journey-scale` entry (04:00 UTC run; tree removed, branch landed as 80e0a14c, verified in master) so registration could proceed — registry-only edit, no trees touched. Main tree untouched until landing.

## Mission

r4 (earlier today) walked all 7 paths light/dark, fixed the trial-by-combat softlock, and filed two blanks: (1) TABLE.md documents light/dark only while code has the grey band, (2) the 2026-10-11 journey-sense test fails 3 relay checks against it. r5's territory: the grey pragmatist band (GRADIENT law, Steve 2026-10-11) — walked end to end for the first time, sense-tested, blanks filled.

Canon read first: CANON.md, TABLE.md, ENDGAME-BUILDS.md, KIN.md, FANS.md. Tooling: `scripts/sweep-table-grey-walks-20261012.js` (3 grey walks), transcripts in `evidence/2026-10-12/table-experience-grey/walk-*.txt`.

## Village assessment (plain words)

The grey villages are synthetic day-140 runs with real history, same as r4's: real ledger, three dead (combat day 61, starvation day 92, combat day 118), real deed fights (4/4/3 waves), 2 contests, 2 crises, regional standing, claimed relay office. What the grey walks prove is that the middle is a real place to stand: the door gift reads the gradient honestly (tender-leaning walker gets the tender hand, total-leaning gets the total hand, dead-neutral gets only the shared gifts), the challenge plays straight through to the grey finals, and both pragmatist endings resolve. Nobody is stranded in the middle — the middle has doors.

## The blanks filled

**1. Grey walks were never walked; three pieces of the middle were misvoiced or loopy.**

- **"The light/dark road is open" for grey walkers** (table.js): the ledger-read line voiced the old binary branch even though the relay path resolves on the leaning band. A grey walker with a light-ish ledger heard "the light road is open," then walked the both-hands ending — off-voice. Fix: for relay with a grey band, the line now reads "The middle road is open." Proof in test §3.
- **DEEPEN was a single hardcoded line** (relay-ext.js): four deepens in one challenge read byte-identical (the r4-class filler loop). Now 4 variants, round-robin by deepen count — no repeats within a challenge, no RNG stream change. Proof §1.
- **PROBE pool had no no-repeat guard** (relay-ext.js): 3-entry pool, raw picks — the same find spoke 3 beats running in the neutral walk. Same RNG draw count, just never the same find twice in a row. Proof §2 (stuck-RNG test).
- **Commune-while-pending repeated one line** (relay-dialogue.js): 3 identical "still waiting" lines in the total walk. Now a 3-variant waiting pool, round-robin. The verb stays (the 4-commune challenge rhythm is the author's encoded contract — a filter that withdrew the verb broke test-table-relay-20261011's dark section 3/49; reverted within the run, pool instead). Proof §5.
- **Epilogue coda pronoun slip** (table.js): "Declan Ross walks out of the light alone, which is how they walked in." The game tracks villager gender (game.js nameGender); the coda now uses the Bearer's own pronouns (he/she/they; unfamiliar names keep they/them per the standing rule). Proof §4.

**2. TABLE.md ↔ code reconciled** (r4's filed blank): the light/dark axis section now documents the grey band — leaning meter, ±10 nudge law, door gift (whichever hand is forward), band-voiced road line, live meter readout, dark conscript terms. The grey band carries Steve's GRADIENT attribution (2026-10-11), so this is documentation, not invention.

**3. Stale sense test updated to the gradient law** (`test-journey-endgame-table-sense-20261011.js`): the 3 relay failures were the test encoding the pre-gradient binary assumption (dark ledger alone should yield the dark branch; the old flat `relayAbils` shape the fixed reader no longer reads). Fixtures now earn the band honestly — five clamped ±10 `addRelayLean` nudges standing in for months of relay verb use. 11/11 green (was 8/11).

**Proof:** `scripts/test-table-grey-r5-20261012.js` — 14/14. RED: 7/14 on pristine (exactly the fix-targeted assertions fail; non-fix assertions pass).

**Regressions:** table-relay 49/49, table-core 31/31, table-feared 27/27, table-trial-fire 18/18, table-assimilated 13/13, table-beloved 24/24, table-defiant 20/20, table-indispensable 22/22, table-witness 20/20, journey-sense 11/11, relay-dialogue 27/27, ontology 84/84 (release permitted).

Build-notes entry added (player-facing; file at the 15-entry cap).

## People check (SENSE-TESTING LAW — three grey transcripts read in full)

- **Tender walk (lean +20):** door grants the tender hand; "The middle road is open." Deepen pool reads beautifully across 4 beats ("the hum gets personal", "a storm you have agreed to stand inside"). Both-hands final lands; coda "Carmen Peng ... which is how they walked in" — correct per the unfamiliar-name rule (Carmen not in the gender map → they/them, strangers' pronouns aren't assumed).
- **Total walk (lean −15):** dark hand at door; the dark conscript beat fires (lean < 0) and the refusal is voiced honestly ("The mourners exhale"). The-contract final lands ("I WILL SIGN THEM IN EVERY COLOR OF WEATHER I HAVE"). Coda "Casey Thomas ... they" — correct (Casey ambiguous → they/them).
- **Neutral walk (lean 0):** only shared gifts at the door; the gradient gates open Sanctuary/Advocate mid-challenge through play ("Acts can still open the other track") — the machinery works as designed. Coda "Declan Ross ... which is how he walked in" — correct (Declan in the map as masculine).
- sysBond arc ("It is champion now" / "It is kin now") fires on all walks. No dead ends, no stalls, no fabricated history. The grey finals are first-class endings, not lesser frames.

## Reachable / Fun / Winnable

- **Reachable: NO — unchanged, lever worker's territory.** 0/30 honest runs reach the lesser seat (winpath r4 landed); the experience past the bars is what this leg judges.
- **Fun: YES.** The middle road is now voiced as the middle. The deepen/probe/commune pools remove the last verbatim repetitions I could find in the relay challenge.
- **Winnable: demonstrated 3/3 grey walks reach endings** (both-hands ×2, the-contract ×1), all won.

## Notes for the win-path lever worker

- Nothing in the bars changed; the experience past them is done. The grey band is now canon-documented — lever sims that reach the table with |lean| < 40 will walk the middle; the door gift and finals are real.
- Documented (not fixed): the dark conscript beat fires for grey walkers with negative lean — intended (the pragmatist's dark hand is open), flagging in case lever-side tuning touches it.
