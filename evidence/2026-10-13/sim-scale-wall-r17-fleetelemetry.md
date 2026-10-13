# Scale-wall r17 arm 3 — flee-exit telemetry instrument (TOOLING ONLY)

Run: fleshout-20261013T2015Z-r17, arm 3 (flee-exit telemetry). Worktree: ~/workspace/worktrees/scale-fleetelemetry.
Axis: scale-onramp (blocking). Canon: docs/CANON.md read first — no canon doc covers sim-harness telemetry instrumentation (CANON.md's docs are game-design canon: DISEASES/BEAR/PRESERVATION/MONSTER-WAVES/etc.); nothing here invents or changes game canon. No game-code changes at all — scripts/ + evidence/ only.

## Pre-registration

- Blank (r16 arm B, sim-findings.md): the sweep driver's flee telemetry counts ATTEMPTS, not exits — ctx.fled increments on every policy flee() tick (edge walks, held ground, no-op barrier pushes, real exits). leadcourt s22 logged 5,410 flee() ticks across 13 fights with ZERO fights ending 'fled'. Every future flee lever would misread this.
- Fix: count actual fight EXITS ('fled' endings / successful disengages) separately from attempt ticks, in the sweep driver.
- GO: instrument verified — the s22 replay reads 0 exits / 5,410 attempts, and the proof test's synthetic fight counts exits exactly. Miss = killed, no commit.

## The fix

**`scripts/sweep-compare.js`** — new shared helper `fleeExitSummary(fights, ctx)` (exported):
- EXITS = per-fight audit records closed with `result === 'fled'` — the engine's genuine disengage endings: door flee (game.js:29773), barrier push with no chasers / into Haven / all chasers gave up at the barrier (tbBarrierExit → tbEnd('fled')), or the tbEndCheck `p.fled` path (game.js:37230).
- NOT exits: `result === 'dissolved'` — death mid-barrier-crossing (the mantle-watch dissolve in tbBarrierExit) or a fight abandoned without tbEnd. Nobody walked out of a dissolve. Reported separately as `dissolved` so the number is visible, not silently dropped.
- ATTEMPTS = `ctx.fled` carried through untouched (policies unchanged).
- Returns `{ attempts, exits, dissolved, nFights, byResult, exitRate }`. Read attempts vs exits together.

**`scripts/sweep-dmgaudit-r16-20261013.js`** (latest instrumented wall-suite driver) — wired in:
- per-run row: `fledExits`, `fledDissolved`, full `fleeSummary`; console line now prints `fled=<attempts>(exit=<exits>)`.
- per-policy aggregate: `fledExits`.
- Future wall drivers: require `fleeExitSummary` from sweep-compare and report both numbers (noted in the helper docstring).

## Verification

**Proof test `scripts/test-flee-exit-telemetry.js` — 24/24 PASS** (node harness via sim-harness: seeded BEFORE eval, full src/js list, window stub deleted; never stubs Game.save):

Part A — synthetic fights, live engine, seed 4242:
1. Genuine exit: speedbump_turtle (follows:false — nothing can chase) at the grid edge → `tbBarrierExit` → record closed `'fled'` via the real tbEnd wrapper.
2. Control: turtle struck down → `'won'` (not an exit).
3. Dissolve: turtle fight dissolved EXACTLY as tbBarrierExit does on death mid-crossing (`over=true, result='dissolved', tbfight=null`), closed by the instrument's real `closeIfAbandoned` path inside the next startCombat wrapper → `'dissolved'` (not an exit); follow-up fight ended `'won'`.
- Exactness: 4 records → exits=1, dissolved=1, byResult {fled:1, won:2, dissolved:1}, attempts carried from synthetic ctx as 5.

Part B — the r16 replay (stored `evidence/2026-10-13/sim-scale-wall-r16-dmgmath-baseline.json`, no re-sim):
- leadcourt s22: **0 exits / 5,410 attempts / 13 fights** — the GO number, exactly.
- All 8 runs: 5,515 attempts / 0 exits / 0 dissolved.
- Exactness invariant: helper exits === records with `result==='fled'` on every run.

**GO VERDICT: GO.** Instrument verified on both halves of the pre-registered threshold.

## Sense-test read (attempts vs exits tells the r1/r2 story)

- r1's dpsFled: "fired at turn 7 and the scholar still died at turn 20, ten no-op flees from the same edge tile" — attempts, zero exits. The lever's telemetry (ctx.fled) could never have shown that; it read as "fleeing a lot."
- r2's directional flee added `ctx.barrierPushes` — pushes are still attempts: sealed fights, blocked far sides, and world edges all consume the push with no exit (tbBarrierExit returns true, fight continues). A push is an exit only when the fight actually ends 'fled'.
- r16's s22 in the wild: 5,410 attempts / 0 exits across 13 fights — the legacy walk-to-edge flee standing at the edge pressing "flee" as a no-op while the fight continues. With this instrument, the next flee lever reports `fled=5410(exit=0)` and the story is unambiguous.

## Wall numbers

Unchanged — tooling only, no lever, no re-sim. (r16 baseline stands: national 4/8, table 0/8, wins 0/8, median 84d.)

## Blanks

FILLED: r16's "flee telemetry counts attempts, not exits" (sim-findings.md combat/policy item → marked fixed; the instrument is `fleeExitSummary` + driver wiring + proof test).

NEW (open, not chased — adjacent telemetry gap found while building the proof test): fights that "come apart" during startCombat's opening pass leave NO audit record. A follows:false monster that spawns out of striking range trips tbEndCheck's honest-disengage path ("It comes apart — no one in reach, no one chasing" → 'routed') inside startCombat's opening `tbAdvance()` — before the instrument's startCombat wrapper opens the record (it opens only after startCombat returns a live fight). The 'routed' ending is invisible to per-fight telemetry: nFights undercounts by exactly these fights. Doesn't affect exit counts ('routed' isn't an exit) but denominators and fight census are short. Appended to sim-findings.md as open.
