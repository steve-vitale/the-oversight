# sim-tbend-a — prove round: the 51002 kill-logged-but-never-closed fight

- Run: `fleshout-20261106T2256Z`, Loop A, axis scale-onramp / winnability chain
- Arm: `sim-tbend-a`, branch `sim-tbend-a`, worktree `~/workspace/worktrees/sim-tbend-a`
- Prereg: `evidence/2026-11-06/sim-tbend-a-prereg.md` (binding)
- Corpus: `evidence/2026-11-06/perseed-fightinterior-b/` (seeds 51001–51008)
- Prior evidence: `evidence/2026-11-06/sim-pyrrhic-b.md` (the shape), `evidence/2026-11-06/sim-fightinterior-b.md`
- Canon read: `docs/CANON.md`, `docs/MONSTER-WAVES.md` (wave-4 Strike: "a house-sized inflatable rat; it doesn't attack, it shuts the grid down — negotiate or scab")

## Verdict: GO (prereg met, fix proven and merge-ready)

The prereg GO was a LIVE REPRODUCTION pinning the throw/interleave site — the exact code path by which a logged kill's fight trace escapes tbEnd without closing — with a reproduction script and a proof test reproducing the shape. That is delivered:

- `scripts/test-tbend-20261106.js`: **18 passed, 0 failed** — reproduces the arena chain live (a 2-wave Pit contest: Strike, then speedbump), asserts `nestedChainStarts === 1` (a startCombat ran INSIDE tbEnd, not after it), the Strike kill in killsLive, and the Strike trace closing `won` / `kill` with its row `won`.
- Pre-fix control (instrument fix stashed, same test, same tree): **15 passed, 3 failed** — the failures are exactly the 51002 shape: trace outcome `unfinished`, ending `kill-unclosed`, chained speedbump row outcome `null`. The fix is what turns those three green; nothing else changed between the two runs.
- No exception is involved anywhere: the full 88-day repro logged **0 throws in 324 traced events**, and the focused test's chain assertions pass with `nestedChainStarts === 1`. H3 (throw after recordWaveKill) is refuted; H2 (strike-side startCombat without tbEnd) is refuted — tbEnd runs, and the chain starts inside it. **H1 confirmed.**

The fix landed in this arm is **scripts-only, zero `src/js`** (the arena chain is intended engine behavior: multi-wave Blood bouts are SUPPOSED to chain). No gate/price/deed/readyDemand change. No `table.js` change. No rout/stall code touched.

## The pinned site (file + function + line context)

All line numbers on this branch's tip (`33232cbe3` + this arm's commits; game.js lines drift daily — grep by function name).

**The interleave — engine code (not changed):**

1. `src/js/game.js:45879` — `tbEnd(result) {`. The fight's real end runs here; `recordWaveKill` runs inside tbEnd before the arena hook, which is why the kill IS in killsLive.
2. `src/js/game.js:46332–46338` — the ARENA CONTESTS hook, at the tail of tbEnd, AFTER the `finally` that nulls `this.tbfight`:
   ```
   try {
     const arc = this.state && this.state.arenaContest;
     if (arc) {
       this.state.arenaContest = null;                                    // :46336
       if (typeof this._contestArenaAfter === 'function') this._contestArenaAfter(arc, result);  // :46337
     }
   } catch (e) {}
   ```
   tbEnd has NOT returned when this runs — the arena resume is inside tbEnd's call stack.
3. `src/js/contests.js:4767` — `G._contestArenaAfter = function (arc, result)`. On `'won'` with waves left (`arc.waveIdx < arc.waves.length`):
4. `src/js/contests.js:4779` — `try { this.startCombat(arc.waves[arc.waveIdx]); }` — the next bout opens **inside the won fight's tbEnd**, before tbEnd returns and before the killing `tbPlayerStrike` returns.

**What that interleave did to the recorders (pre-fix) — three distinct clobbers, one call stack:**

- (a) The fightinterior `startCombat` wrapper saw an open trace and closed it as `'unfinished'` (`'stale'` path) — it could not tell a just-ended fight from a dissolved one. The won Strike trace was stamped unfinished before the tbEnd wrapper's own close could run, and the tbEnd wrapper's close then read the LIVE `t._trace` (null by then — the nested startCombat had already opened the new bout's trace) instead of the trace it captured, so the `'won'` close never landed. The round-21 verb row was lost for the same reason: the verb wrapper pushes only if the trace is still open when `tbPlayerStrike` returns, and by then the trace was already gone — while the round-21 hit WAS recorded, because `tbDamage` ran inside the strike, before tbEnd.
- (b) The stageally `tbEnd` wrapper nulled `_currentTb` / `_currentTbFight` unconditionally in its post-block. By the time the outer tbEnd's post-block ran, those pointers had already advanced to the NEW bout's row — so it destroyed the new bout's row pointer, and the chained bout's own tbEnd could never record its outcome. In the corpus the Strike row (tbSeq 7) stayed `outcome: null` for exactly this reason — and the speedbump row (tbSeq 8) did record `won`, because its tbEnd ran with no further chain behind it.
- (c) The round-21 monster turn never ran because `tbEndCheck` ends the fight on the player's action (`tbAfterPlayerAction`), not because the monster was skipped: the Strike deals 0 damage all fight by design (it doesn't attack).

**The dissolve control is a different shape** (prereg H-control, verified in the proof test): `tbBarrierExit` sets `f.result = 'dissolved'` directly with `tbfight = null` and NO tbEnd — scholar dead, beast alive. The test's dissolve section confirms a dissolved trace still closes `'unfinished'` with `unfinishedKind: 'dissolved'`, never as a kill. The 51002 Strike is not that shape: scholar HP at trace end 91.5% (alive), beast at 0 HP.

## The fix (scripts only — fight-close machinery in the recorders)

`scripts/fightinterior-instrument-20261106.js` (M) and `scripts/stageally-instrument-20261106.js` (M):

1. **fightinterior `startCombat` wrapper — over-aware close:** when a trace is open at the next startCombat, read the open trace's own fight object (`t._trace._fight`): if it is already `over` with a real tbEnd result (`won`/`lost`/`fled`/`routed`/`calmed`), close the trace with the fight's OWN result (via `closeTrace(result, fight, row, 'tbEnd')`, so `'won'` + a killsLive match classifies `'kill'`). `'dissolved'` is deliberately NOT in that set — a dissolved fight still closes `'unfinished'`/`'dissolved'`.
2. **fightinterior `tbEnd` wrapper — captured-trace-only close:** `if (trace0 && t._trace === trace0) closeTrace(...)` — never stamp the old result onto the new fight's trace when the nested chain already closed trace0 and opened the next one.
3. **stageally `tbEnd` wrapper — identity-guarded pointer clear:** `if (t._currentTb === row0) t._currentTb = null; if (t._currentTbFight === f0) t._currentTbFight = null;` — clear only pointers that still name THIS fight, so a nested chain-start's row survives.

No game behavior changes: the fix touches only recorder wrappers (pure reads + recorder-state writes, zero RNG draws, zero game-state writes). Neutrality is proven, not asserted — see "Anchor replay" below.

## The proof-loop defect (diagnosed this round — the 8-passed / 6-failed stand)

The prior round's proof stood at 8 passed / 6 failed with the loop defect undiagnosed. The defect was in the TEST loop, not the game and not the fix — two compounding causes:

1. **No auto-advance in the node harness.** There is no `window` in node, so `tbAfterPlayerAction` does NOT auto-advance after a spent player turn (game.js: the async `tbAdvanceAsync` branch requires `window`/`setTimeout`). A successful strike leaves `tbIsPlayerTurn()` true with `p.acted` set, so the next `tbPlayerStrike` returns false ("Already acted this turn") — and the old loop's only `tbAdvance` lived in the not-player-turn branch, which the spent-turn state never reached. Each strike therefore cost ~2 loop iterations (strike + a wasted false-strike/move cycle). Diagnosed live: a debug run showed strike true/false alternating on the same round, the round advancing only when `tbAdvance` was called explicitly.
2. **Guard too small for the damage rate.** A strike deals ~4–11 damage (roll 10–16 + weapon bonus, vs the Strike), so the 300-HP bout needed ~35–40 successful strikes ≈ 70–80+ iterations against a guard of 80. The loop expired one round short of the kill, the trace never closed, and every chain assertion failed downstream.

Fixed in `scripts/test-tbend-20261106.js`: explicit `tbAdvance()` after a spent player turn (only while the SAME bout is still live — never once the bout has chained, so the new bout's opening player turn is not skipped), Strike HP 300 → 100 (~12 strikes; the chain is HP-independent), both guards 80 → 300. The same advance pattern was applied to the chained-speedbump loop.

## Proof results

| Check | Result |
|---|---|
| `node scripts/test-tbend-20261106.js` (fixed tree) | **18 passed, 0 failed** |
| Same test, instrument fix stashed (pre-fix control) | 15 passed, 3 failed — outcome `unfinished`, ending `kill-unclosed`, speedbump row `null` (the exact 51002 shape) |
| `node scripts/test-pyrrhic-20261106.js` (regression) | **52 passed, 0 failed** |
| `node scripts/test-fightinterior-20261106.js` (regression) | **33 passed, 0 failed** |
| `node scripts/check.js --quick` | NOT RUN to completion — started, still running with no output after ~10 min while sibling drive64 panels saturated the box (load avg 17); killed, not a failure and not a pass. The prereg's required regressions are the two named scripts above, both green. |
| 88-day anchor repro, fixed vs pre-fix (neutrality) | game state identical; exactly ONE recording row differs (see below) |

## Anchor replay — and a correction to the prior round's claim

The prior round's test header claimed the anchor replay (`scripts/tbend-repro-20261106.js`, seed 51002, 88 days) was "byte-identical to the corpus on days / endReason / killsLive / traces / tbFights / waveKillLog". **That claim does NOT reproduce on this tip.** I ran the repro twice on this tree — once with the fix, once with the fix stashed:

- Fixed instrument: days 88, endReason `survived`, 81 killsLive, 1 trace (day-82 eater, scholar-death), 324 traced events, 0 throws.
- Pre-fix instrument: days 88, endReason `survived`, 81 killsLive, 1 trace, 324 traced events, 0 throws — **the same run**.
- Committed corpus: days 88, endReason `village-lost`, 53 killsLive, 4 traces (days 54/80/80/85).

The two repro runs agree with each other and both disagree with the corpus: the run itself diverged (different scholar lineage by day 54 — the corpus's day-80 arena chain with grace_obi never happens on this tip; this tip's village survives to day 88 instead). That is base drift since the corpus was generated (fightinterior-b run, earlier master — this branch's base carries later commits, e.g. journey-social r149), not an effect of the fix. The GO does not depend on the anchor replay: the live reproduction is the focused test, which reproduces the chain with call-order assertions (`nestedChainStarts === 1`) on this tip.

**Neutrality (the important half):** comparing the fixed vs pre-fix 88-day repro outputs field by field — days, endReason, killsLive, waveKillLog, traces, and all 324 traced events (ignoring only stack-trace line numbers, which shift because the fix added lines to the instrument file) are **identical**. The single difference in the entire run is recording, in the direction the fix intends: the day-54 `ad_break` tbFight row records `outcome: 'routed'`, `rounds: 50`, scholar HP frac 0.259, monster HP frac 0.859 with the fix, where pre-fix it stayed `outcome: null` with all end fields null. (Its exact trigger path was not separately traced — it is reported as an observed in-the-wild repair consistent with the clobber guard, not as a second pinned site.) The instrument fix changes no game outcome on a full 88-day run.

## Corpus evidence (seed 51002, committed file)

`evidence/2026-11-06/perseed-fightinterior-b/fightinterior-s51002-fightinterior-baseline.json` — trace seq 2, day 80, Strike, 21 rounds:

- Hit log: player strikes rounds 4–21; round-21 hit dmg 63, beast HP 49 → −14. (Rounds 16–20: 63/68/64/61/66 dmg — the scholar was hitting hard by then.)
- Verb log: strikes rounds 2, 4–20 — **NO round-21 verb**. Turn log: monster turns rounds 1–20 only — **NO round-21 monster turn**. Monster dealt 0 damage all fight.
- `killsLive` HAS the kill: day 80, strike, wave 4, by grace_obi, via `'player'`.
- Raw corpus trace: outcome `'unfinished'`, ending `'unfinished'`, mHpLeft 0, scholar HP 91.5% at end. (The `'kill-unclosed'` ending is sim-pyrrhic-b's offline re-classification of this same record, not the raw corpus field — the corpus instrument predated the pyrrhic classifier.)
- tbFight rows: seq 6 drumbelly_tanuki `won` (rounds 2), seq 7 strike `outcome: null` (all end fields null), seq 8 speedbump_turtle `won` (rounds 4), seq 10 eulogy `lost` (the next fight, same day). The arena chain on day 80 was drumbelly → Strike → speedbump; the Strike is the middle bout, the one whose tbEnd chained.

## Sense-testing — read the transcript

Does the unclosed trace read as a real fight, or as bookkeeping losing track of one? **A real fight, lost by the bookkeeping.** The transcript is coherent throughout: grace_obi walks into the Pit on day 80, beats the drumbelly in 2 rounds, faces the house-sized Strike, and works it down over 21 rounds while it never lands a hit (it doesn't attack — it shuts the grid down, per MONSTER-WAVES.md), landing the killing blow in round 21 for 63 damage. The scholar walks out at 91.5% health and immediately wins the speedbump bout in 4 rounds. Nothing about the fight itself is broken, robotic, or incoherent — no repeated line, no impossible state, no missing round except the one the recorder dropped. The ONLY wrong thing in the record is the ending: `'unfinished'` on a fight that was won, in a run whose kill log already knew it was won. That is bookkeeping losing track of a real fight, in the most literal sense: the recorder was mid-sentence (inside tbEnd) when the next fight started, and the new fight's opening overwrote the old fight's ending. The fix makes the record say what the fight already said.

## Plain-words explanation (what happened to grace_obi's fight)

Grace_obi fought in the Pit — a Blood contest that runs in waves, one beast after another. She beat the first beast, then the Strike, then the speedbump turtle, all on day 80. The Strike fight was real and she won it: 21 rounds, killing blow in the last round, and she walked out barely scratched because the Strike never attacks.

The problem was in the scorekeeping, not the fight. When a Pit bout ends, the game immediately opens the next bout *while it is still finishing the paperwork on the bout that just ended* — the next fight starts inside the ending of the old one. The fight recorder wasn't built for that overlap: it saw the new fight opening, assumed the old fight must have dissolved without ending, and wrote "unfinished" over a win. Then the ending paperwork tried to close the old fight but found the new fight's paperwork in its place, so it wrote nothing. The kill itself was recorded fine (the kill log knew), but the fight's own record said "unfinished" — and because the recorder also knocked out the next bout's row pointer, the damage spread: the Strike's row stayed blank, and the same overlap could blank other rows.

The fix teaches the recorder to check, before it writes "unfinished", whether the old fight actually already ended — and if it did, to write down the real ending instead. It also teaches it to close only the fight it started closing, and to leave the next fight's row alone. The fights themselves are untouched: same beasts, same waves, same outcomes. Only the record now matches what happened.

## Metric review (docs/MEASUREMENT.md §14)

- **Pre-registered metric (binding):** GO = a live reproduction pinning the throw/interleave site (file + function + line context) with a reproduction script and a proof test reproducing the kill-logged-but-never-closed shape. **GO met:** the focused proof test reproduces the chain live with the site named (`game.js:45879` tbEnd → `:46337` arena hook → `contests.js:4767` `_contestArenaAfter` → `:4779` nested `startCombat`), `nestedChainStarts === 1`, 0 throws, and the pre-fix control reproduces the exact 51002 shape (outcome `unfinished`, ending `kill-unclosed`).
- **No metric was swapped.** The fix was optional in the prereg and is landed only because the proof went green on the rebased tip with regressions green — the pinned cause is the GO; the fix is a bonus, proven separately (pre-fix 15/3 → post-fix 18/18, plus the 88-day neutrality comparison).
- **Correction recorded:** the prior round's "anchor replay byte-identical to the corpus" claim does not reproduce on this tip (both repro runs diverge from the corpus on endReason/kills/traces — base drift, not the fix). The claim is corrected here, not carried forward. Future arms: do not cite the 51002 anchor replay as byte-identical; cite the focused test (`test-tbend-20261106.js`) as the live reproduction.
- **Metric for the NEXT run (proposal, not a swap):** the `kill-unclosed` ending class now has a proven cause for one of its two instances (this chain); the other (greta_hansen, 51005) is a different shape. Any future arm reading `kill-unclosed` counts should treat the class as "recorder lost the ending", not "fight didn't end" — and the analyzer's `KILL_ENDINGS` read (kill + pyrrhic-kill + kill-unclosed) remains the honest kill count until the recorder fix has re-run the corpus bands.

## Boundary — the 159-round rout stall (Loop B, sim-routstall-b)

NOT touched. No rout/stall code was read for a fix or changed; the only routed fight in this evidence is the day-54 `ad_break` 50-round rout row repaired in the repro comparison (a recording repair, not a rout change — the fight still routes, it is now merely recorded as routing). If the rout-stall diagnosis touches the tbEnd/startCombat wrappers changed here, the overlap is this: the wrappers now close over-aware traces with the fight's own result — a stall that ends in a chain would be recorded with its real ending rather than `'unfinished'`. No rout fix here.

## Files changed (this arm — scripts only, zero src/js)

- `scripts/fightinterior-instrument-20261106.js` (M) — over-aware close in the startCombat wrapper; captured-trace-only close in the tbEnd wrapper.
- `scripts/stageally-instrument-20261106.js` (M) — identity-guarded `_currentTb`/`_currentTbFight` clear in the tbEnd wrapper.
- `scripts/test-tbend-20261106.js` (new) — the proof: arena chain live, dissolve control, 18/18.
- `scripts/tbend-repro-20261106.js` (new, prior round) — the 88-day anchor replay driver; preserved as written (its corpus-comparison section now documents the drift rather than asserting identity — see "Anchor replay" above).
- `evidence/2026-11-06/sim-tbend-a.md` (new, this file).
- `evidence/2026-11-06/sim-tbend-a-prereg.md` (prior round, unchanged).

## Findings backlog

- None new from this arm. (The anchor-replay drift is recorded in "Metric review" above rather than as a backlog item: the corpus bands predate this tip, and re-running them is a loop-coordinator call, not a design gap.)
