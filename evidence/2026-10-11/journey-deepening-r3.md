# Journey leg 2 (deepening) — R3 run note (2026-10-11)

**Leg**: deepening (days 40–80) · **Run**: R3 (third deepening run today; R1 morning, R2 afternoon)
**Harness**: `scripts/journey-deepening-r3-20261011.js` (new this run) — 6 honest seeds × 110d + 3 probe seeds (PROBE_W3=1)
**Canon**: MONSTER-WAVES.md, SCALE.md, KNOWLEDGE.md read.

## What R3 set out to fill

R2's documented blank: *"wave-3 encounter volume post-unlock — gate reachable (day 51) but no wave-3 fight ever observed."*
R3 targeted exactly that blank — and found the reason no wave-3 fight had ever been observed, plus a sanctuary-law violation.

## The blank filled: followers were entering Haven (FIXED)

**Root cause.** `travelTo()`'s follower re-entry branch (`src/js/game.js` ~line 9718) had **no `isSafeTile` check**. Six of nine wave-3 monsters carry `follows:true` (redactor, focus_group, spool, chorus_line, callback, buffering). When the player traveled home, they chased onto haven tiles; `monsterTurn()` then started combat **inside the sanctuary**. Pre-fix probe-11: 5 wave-3 fights at haven, 5 bearer deaths. This violates Steve's law *"isSafeTile: villages are safe from monsters. The ONLY safe space"* — every other encounter path (checkEncounter, moveWanderer, pickWorldTile, wanderWorldMonsters) respects it.

**Fix** (uncommitted at write time; `src/js/game.js` +22/−6): followers hold at the safe-tile boundary — *"The Spool stops at the treeline — pacing, unwilling. The walls end the argument. It's still out there."* — and the monster stays on the old tile. Also fixed the double article (*"It followed you. The The Redactor is here."* → *"The Redactor is here."*) in both follower branches.

**Proof**: `scripts/test-follower-haven-20261011.js` — 21/21 × 3 seeds GREEN post-fix; on reverted code 5 RED (spool entered haven at 4,4; "followed you" said into haven; "The The" present). Before/after demonstrated via `git checkout --` + restore.

**Regressions**: travel suites all green (blocked-travel 13/13, animal 5/5, clamps 4/4, sib-clamps PASS, spam 5/5). `test-break-monsters-r2.js`: 2 failures **pre-existing** (stale assertion `wave3count === 0` — test predates the wave-3 roster; `monsters.json` untouched by this run).

## What R3 measured

- **Wave-3 gate reachable**: unlocked day 73 (seed 1618032, honest) and day 91 (seed 314159, honest).
- **First live wave-3 fights ever observed**: seed 1618032 fought a Spool (day 75, 41 rounds, lost); probe-11 fought 5 wave-3s (spool, buffering, redactor, spool, chorus_line), **4 distinct faced by day 92** — the endgame deed bar (4 distinct wave-3) completes when the gate opens ~day 45.
- **Signature mechanics fire in live play**: Spool REC●/REPLAY, Buffering afterimages ("IT WILL STEP LEFT"), Redactor REDACT, Chorus Line downbeat — all confirmed via capture markers.

## Village assessment (plain words)

Five of six honest seeds lost their village (days 58–100); one seed (314159) survived to day 112 with 5/5 alive — the first full-leg survival. The dead villages died the same way R2 documented: **combat + starvation**. Death causes across seeds: villager-combat 5–13, combat 5–14, starvation 1–6, monster 1–2, plus sickness/contest/ambush onesies. Food is still the mid-game wall — as villagers survive longer, more mouths shift pressure onto the player.

The survivor (seed 314159): Lena (ER nurse, trust 90, 34 plants), Marcus (electrician, trust 90, 33), James (carpenter, trust 90, 33), Emma (Veterinarian, trust 90, 32), Sofia (community gardener, trust 0, 29). High trust, high knowledge, a real village — proof the deepening leg is winnable with competent play.

## People check (SENSE-TESTING LAW)

Read 4 full transcripts (seeds 314159, 1618032, 20261102; days 55/75/95). **They act like people**: Lena asks "Do you believe in anything? Now, I mean. After everything." and answers honestly — "That's not naive. That's load-bearing. Hold onto it." Favors are concrete ("East treeline, first light. Bring a pack.") with real resolutions (promised/engaged). Gossip is specific ("Did you hear? Marcus just walked away from Haven. Didn't look back.").

**Still broken (convo loop's, documented not fixed)**: the teach template repeats *verbatim* — "Their eyes widen. 'I never knew that.'" 4× in one conversation; the favor direction "East treeline, first light. Bring a pack." is identical across NPCs; "Sorry — I asked you something there." reads garbled. Same findings as R2 — the conversation rebuild (greenlit 2026-10-11) is the real fix.

## Investigation: the 5401-round stall (harness bug, FIXED)

Post-fix seed 314159 hit a 5401-round fight vs a spool at haven — player 61 HP, spool 313/313, bare-handed, never ending. Traced via STALLDUMP: the spool was a **raider** (havenGrowth.js raid mechanic — "WEALTH DRAWS TEETH", pantry 17,560 kcal), NOT a follower — a legitimate mechanic, separate from the fixed bug. The stall itself was a **harness bug**: the r2 `flee()` moved to the grid edge via `tbPlayerMove` but never called `tbBarrierExit` — 5,455 futile "flees" parking at the edge. Also added: stalemate detection (40+ rounds, monsters ≥90% HP → disengage) and multi-direction edge pushes (one exit was creek-blocked). Post-fix: the same fight resolves in 3 rounds (fled). No game change — the game offered the barrier; the harness wasn't using it.

## Reachable / Fun / Winnable

- **Reachable**: YES — wave-3 gate opens day 73–91 in honest play; first live wave-3 fights observed; signature mechanics fire.
- **Fun**: YES with the fix — "The walls end the argument" is a real beat; the spool/buffering/redactor/chorus fights are distinct. The haven-raid ("coming for YOU — inside the haven") is terrifying and legitimate.
- **Winnable**: YES — seed 314159 survived the full leg with a thriving village. But 5/6 villages died to the known food+combat wall; the deepening leg is winnable, not easy.

## Files

- Fix: `src/js/game.js` (follower re-entry safe-tile guard + article fix)
- Proof: `scripts/test-follower-haven-20261011.js`
- Harness: `scripts/journey-deepening-r3-20261011.js`
- Evidence JSONs: `evidence/2026-10-11/journey-deepening-r3-*.json`
- Transcripts: `/tmp/journey-deep-r3-transcript-*` (4 read for people check)
- Debug scripts (stall investigation): `scripts/debug-stall-20261011.js`, `scripts/debug-travel-20261011.js`, `scripts/debug-w3-source-20261011.js` — scratch, kept for the record
