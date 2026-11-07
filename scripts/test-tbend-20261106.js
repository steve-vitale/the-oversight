// test-tbend-20261106.js — proof for sim-tbend-a (diagnostic arm).
//
// THE 51002 SHAPE, REPRODUCED LIVE (evidence/2026-11-06/sim-pyrrhic-b.md):
// seed 51002 baseline, day 80, the Strike (wave 4) was killed by grace_obi
// over 21 rounds — the kill IS in killsLive (recordWaveKill ran) — but the
// fight trace never closed through tbEnd: outcome 'unfinished', no round-21
// verb row, no round-21 monster turn. The corpus proved the shape, not the
// site. The site, pinned by a live anchor replay
// (scripts/tbend-repro-20261106.js, byte-identical to the corpus on days /
// endReason / killsLive / traces / tbFights / waveKillLog):
//
//   tbEnd('won')'s FINALLY resumes the arena contest — game.js tbEnd,
//   ARENA CONTESTS hook, calls _contestArenaAfter(arc, result); on 'won'
//   with waves left, contests.js _contestArenaAfter starts the next bout
//   with startCombat(arc.waves[arc.waveIdx]) — INSIDE tbEnd, before tbEnd
//   returns. The nested startCombat's instrument wrappers then run while
//   the won fight's tbEnd is still on the stack: the fightinterior wrapper
//   stale-closed the won trace as 'unfinished', the stageally wrapper's
//   tbEnd post-block unconditionally nulled _currentTb (clobbering the new
//   bout's row pointer — the 51002 Strike row stayed null because the
//   drumbelly bout's post-block had already clobbered it), and the
//   fightinterior tbEnd wrapper's close read the LIVE t._trace (null by
//   then) instead of the captured trace, so the 'won' close never landed.
//   No exception is involved anywhere (0 throws in the replay) — the
//   verb row is lost because the trace is already gone when tbPlayerStrike
//   returns, and the round-21 monster turn never runs because tbEndCheck
//   ends the fight on the player's action. The dissolve path
//   (tbBarrierExit: death mid-crossing sets f.result='dissolved' directly,
//   no tbEnd) is a DIFFERENT shape — scholar dead, beast alive — and is
//   the control below.
//
// THE FIX (scripts only, zero src/js — the arena chain is intended engine
// behavior: multi-wave Blood bouts are SUPPOSED to chain):
//   - fightinterior startCombat wrapper: when the open trace's fight is
//     already over with a real tbEnd result ('won'/'lost'/'fled'/'routed'/
//     'calmed'), close the trace with the fight's OWN result instead of
//     'unfinished'. 'dissolved' is deliberately NOT in that set.
//   - fightinterior tbEnd wrapper: close only the trace this tbEnd
//     captured (t._trace === trace0), never a new fight's trace.
//   - stageally tbEnd wrapper: clear _currentTb/_currentTbFight only when
//     they still name THIS fight, so a nested chain-start's row survives.
//
// THE LOOP DEFECT (sim-tbend-a prove round, diagnosed 2026-11-06): the
// first version of this test's fight loop stood at 8 passed / 6 failed
// NOT because the fix was wrong but because the bout never reached its
// killing blow. Two compounding causes, both in the test loop, neither
// in the game or the fix: (1) in the node harness there is no window, so
// tbAfterPlayerAction does NOT auto-advance after a spent player turn —
// a successful strike leaves tbIsPlayerTurn() true with p.acted set, so
// the next strike returns false ("Already acted this turn") and the
// loop's only tbAdvance lived in the not-player-turn branch, which the
// spent-turn state never reached; each strike therefore cost ~2 loop
// iterations (strike + a wasted false-strike/move cycle). (2) A strike
// deals ~4–11 damage (roll 10–16 + weapon, vs the Strike), so the
// 300-HP bout needed ~35–40 successful strikes ≈ 70–80+ iterations
// against a guard of 80 — the loop expired one round short of the kill,
// the trace never closed, and every chain assertion failed downstream.
// Fixed here: explicit tbAdvance() after a spent player turn (only while
// the same bout is still live), Strike HP 300 → 100 (~12 strikes), and
// both guards 80 → 300.
//
// THIS TEST reproduces the chain live (a 2-wave Pit contest: Strike, then
// speedbump) and asserts the recorder now closes the won bout as 'kill'
// with its row 'won'. The Strike's HP is lowered to 100 so the bout ends
// in a few strikes (the chain fires on ANY 'won' tbEnd; HP never enters
// it) and the scholar's HP is raised to 1000 so the bout is survivable.
// Pre-fix this test FAILS on the trace/row assertions (ending
// 'unfinished', row outcome null) — the anchor replay is the pre-fix
// proof of that shape.
// Usage: node scripts/test-tbend-20261106.js
'use strict';
const K = require('./godpath/lib');
const INST = require('./fightinterior-instrument-20261106');
const T = K.reporter('test-tbend-20261106');

function monsterOf(Game, f) {
  try { return (f.fighters || []).find(function (x) { return x && x.kind === 'monster'; }) || null; } catch (e) { return null; }
}
function midOf(Game, f) {
  const m = monsterOf(Game, f);
  return m ? ((m.mdef && m.mdef.id) || m.monsterId || m.id || null) : null;
}

(async function () {
  const Game = await K.load({ seed: 51002 });
  K.newRun(Game);
  const inst = INST.install(Game);
  const t = inst.t;

  // --- Chain detection: tbEnd depth + startCombat calls inside it. ---
  let tbEndDepth = 0, nestedChainStarts = 0;
  const origTbEnd = Game.tbEnd;
  Game.tbEnd = function () {
    tbEndDepth++;
    try { return origTbEnd.apply(this, arguments); }
    finally { tbEndDepth--; }
  };
  const origStart = Game.startCombat;
  Game.startCombat = function () {
    try { if (tbEndDepth > 0) nestedChainStarts++; } catch (e) {}
    return origStart.apply(this, arguments);
  };

  T.section('arena chain: Strike bout wins, speedbump bout chains inside tbEnd');
  // Arena state, exactly as _contestArena writes it: a 2-wave Pit contest
  // whose bouts are Strike, then speedbump. (contestId 'pit' is the real
  // Blood-cat contest in src/data/contests.json.)
  Game.state.activeContest = { contestId: 'pit' };
  Game.state.arenaContest = { contestId: 'pit', waves: ['strike', 'speedbump_turtle'], waveIdx: 0 };
  const mf = K.fight(Game, 'strike', { px: 5, py: 4, mx: 6, my: 4, hp: 1000 });
  T.ok('strike fight started', !!Game.tbfight && midOf(Game, Game.tbfight) === 'strike');
  if (mf) mf.hp = 100; // wounded rat, fast bout; the chain is HP-independent
  const scholarId = Game.villagerId;
  let guard = 0, chainFightLive = false;
  while (guard++ < 300) {
    const f = Game.tbfight;
    if (!f || f.over) break;
    if (midOf(Game, f) !== 'strike') { chainFightLive = true; break; } // chained bout is live
    if (Game.tbIsPlayerTurn && Game.tbIsPlayerTurn()) {
      Game.tbPlayerStrike('m_0');
      // NODE HARNESS: a spent player turn does NOT auto-advance (no
      // window → tbAfterPlayerAction leaves tbIsPlayerTurn() true with
      // p.acted set). Advance explicitly while the SAME bout is still
      // live, else the next strike returns false ("Already acted") and
      // the loop spins without ever reaching the kill. Do NOT advance
      // once the bout has chained — that would skip the new bout's
      // opening player turn.
      if (Game.tbfight && !Game.tbfight.over && midOf(Game, Game.tbfight) === 'strike' &&
          Game.tbIsPlayerTurn && Game.tbIsPlayerTurn()) {
        try { Game.tbAdvance(); } catch (e) {}
      }
    } else {
      try { Game.tbAdvance(); } catch (e) { break; }
    }
    if (Game.tbfight && midOf(Game, Game.tbfight) === 'speedbump_turtle') { chainFightLive = true; break; }
  }
  T.ok('nested startCombat ran INSIDE tbEnd (not after it)', nestedChainStarts === 1, 'nestedChainStarts=' + nestedChainStarts);
  T.ok('chained bout is live when the killing strike returns', chainFightLive && !!Game.tbfight && midOf(Game, Game.tbfight) === 'speedbump_turtle');
  const killLive = (t.killsLive || []).find(function (k) { return k.mid === 'strike' && k.by === scholarId && k.via === 'player'; });
  T.ok('strike kill IS in killsLive (recordWaveKill ran)', !!killLive);
  const strikeTrace = (t.traces || []).find(function (x) { return x.mid === 'strike'; });
  T.ok('strike trace exists', !!strikeTrace);
  if (strikeTrace) {
    T.ok('strike trace outcome is won (not unfinished)', strikeTrace.outcome === 'won', 'outcome=' + strikeTrace.outcome);
    T.ok('strike trace ending is kill (not kill-unclosed)', strikeTrace.ending === 'kill', 'ending=' + strikeTrace.ending);
    T.ok('strike trace beast at 0 HP', strikeTrace.mHpLeft === 0, 'mHpLeft=' + strikeTrace.mHpLeft);
  }
  const strikeRow = (t.tbFights || []).find(function (r) { return r.mid === 'strike'; });
  T.ok('strike tbFight row exists', !!strikeRow);
  if (strikeRow) T.ok('strike tbFight row outcome is won (not null)', strikeRow.outcome === 'won', 'outcome=' + strikeRow.outcome);
  const bumpRow = (t.tbFights || []).find(function (r) { return r.mid === 'speedbump_turtle'; });
  T.ok('speedbump tbFight row exists (chain bout recorded)', !!bumpRow);

  // Play the chained bout out: its own tbEnd must record 'won' too — the
  // chain must not break the NEXT fight's recording (corpus: speedbump won).
  let guard2 = 0;
  while (guard2++ < 300) {
    const f = Game.tbfight;
    if (!f || f.over) break;
    if (midOf(Game, f) !== 'speedbump_turtle') break;
    if (Game.tbIsPlayerTurn && Game.tbIsPlayerTurn()) {
      Game.tbPlayerStrike('m_0');
      if (Game.tbfight && !Game.tbfight.over && midOf(Game, Game.tbfight) === 'speedbump_turtle' &&
          Game.tbIsPlayerTurn && Game.tbIsPlayerTurn()) {
        try { Game.tbAdvance(); } catch (e) {}
      }
    } else {
      try { Game.tbAdvance(); } catch (e) { break; }
    }
  }
  const bumpRow2 = (t.tbFights || []).find(function (r) { return r.mid === 'speedbump_turtle'; });
  if (bumpRow2) T.ok('chained speedbump bout records won', bumpRow2.outcome === 'won', 'outcome=' + bumpRow2.outcome);
  T.ok('no instrument errors', (t.instrumentErrors || []).length === 0, JSON.stringify(t.instrumentErrors || []));

  T.section('dissolve control: a dissolved fight still closes unfinished, not killed');
  // Simulate the dissolve path exactly as tbBarrierExit does it (death
  // mid-crossing: f.result='dissolved' set directly, tbfight=null, NO
  // tbEnd) and open the next fight: the trace must close 'unfinished'
  // with unfinishedKind 'dissolved' — the over-aware branch must NOT
  // claim it as a tbEnd result.
  try { Game.state.arenaContest = null; } catch (e) {}
  try { Game.state.activeContest = null; } catch (e) {}
  if (Game.tbfight && !Game.tbfight.over) { try { Game.tbEnd('fled'); } catch (e) { Game.tbfight = null; } }
  Game.state.village.roster = [];
  K.fight(Game, 'eater', { px: 5, py: 4, mx: 6, my: 4, hp: 1000 });
  const eaterFight = Game.tbfight;
  T.ok('eater fight started (dissolve control)', !!eaterFight && midOf(Game, eaterFight) === 'eater');
  const tracesBefore = (t.traces || []).length;
  // The dissolve, verbatim: over + result set directly, fight nulled.
  eaterFight.over = true; eaterFight.result = 'dissolved';
  Game.tbfight = null;
  Game.startCombat('speedbump_turtle');
  const eaterTrace = (t.traces || []).slice(tracesBefore).find(function (x) { return x.mid === 'eater'; });
  T.ok('dissolved eater trace closed on next startCombat', !!eaterTrace);
  if (eaterTrace) {
    T.ok('dissolved trace stays unfinished', eaterTrace.outcome === 'unfinished', 'outcome=' + eaterTrace.outcome);
    T.ok('dissolved trace kind is dissolved', eaterTrace.unfinishedKind === 'dissolved', 'kind=' + eaterTrace.unfinishedKind);
    T.ok('dissolved trace is NOT a kill ending', eaterTrace.ending !== 'kill' && eaterTrace.ending !== 'kill-unclosed', 'ending=' + eaterTrace.ending);
  }
  if (Game.tbfight && !Game.tbfight.over) { try { Game.tbEnd('fled'); } catch (e) { Game.tbfight = null; } }
  try { inst.uninstall(); } catch (e) {}
  Game.tbEnd = origTbEnd;
  Game.startCombat = origStart;
  T.done();
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
