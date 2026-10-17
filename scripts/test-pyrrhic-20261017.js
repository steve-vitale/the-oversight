#!/usr/bin/env node
// test-pyrrhic-20261017.js — proof record for the sim-pyrrhic arm
// (flesh-out loop, axis scale-onramp, run fleshout-20261017T1223Z).
//
// THE FIX: evidence/2026-10-17/sim-attrcensus.md named the a2 path-drop —
// a trick-bearing monster that DIES in a fight the scholar LOSES (pyrrhic
// kill: killed on the dying tick, result 'lost') leaves NO waveKillLog
// entry at all — no trick attribution, no codex 'slain', no villageSlain.
// The fix extends tbEnd's per-kill ledger to write waveKillLog entries
// (with trickSummaryFor) on 'lost' — the ledger entry + codex 'slain' +
// villageSlain ONLY. Loot/carcass stay forfeit (deliberate); wave-unlock
// DEEDS stay out (scoreLedgerKill NOT called — steve-call pending).
//
// RED-PIN: this test FAILS on pristine game.js (no ledger on 'lost') and
// PASSES with the fix. Verified RED 2026-10-17 before the fix landed.
//
// Sections:
//   PYRRHIC — synthetic tbEnd('lost') with a dead trick-bearing monster:
//             waveKillLog entry (+trick), codex 'slain', villageSlain.
//   BOUNDARY — scoreLedgerKill NOT called (deed path untouched),
//               tbKillRewards NOT called (loot forfeit), ledger points flat.
//   ROUTED-CTRL — tbEnd('routed') still routes through recordWaveKill
//                 (ledger points scored): the fix didn't reroute won/routed.
//
// Sim-harness rules honored: loads via sim-harness.js (seed before eval);
// single harness per process; no Game.save stub; no hardcoded absolute
// paths (ROOT from __dirname).
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, quietLog } = require(path.join(ROOT, 'scripts', 'sim-harness.js'));

let pass = 0, fail = 0;
const fails = [];
function ok(cond, name) {
  if (cond) { pass++; }
  else { fail++; fails.push(name); console.log('  FAIL: ' + name); }
}

function mkFight(Game, mid, trickTokens) {
  const mdef = (Game.data.monsters || []).find(m => m.id === mid);
  if (!mdef) throw new Error('no mdef for ' + mid);
  const f = {
    over: false, result: null, style: 0, round: 5, worldOrigin: null,
    trickLogByMid: {},
    fighters: [
      { key: 'p', kind: 'player', alive: false, hp: 0, maxHp: 100 },
      { key: 'm_0', kind: 'monster', alive: false, hp: 0, mdef: mdef, monsterId: mid },
    ],
  };
  f.trickLogByMid[mid] = trickTokens.slice();
  return f;
}

(async () => {
  const { Game } = await loadGame({ seed: 1812, mode: 'pyrrhic-proof', fullTelemetry: false });
  await setupGame(Game);
  const scholarVid = Game.villagerId;

  // ---------- PYRRHIC: tbEnd('lost') with a dead trick-bearing monster ----------
  console.log('== PYRRHIC ==');
  const wklBefore = (Game.state.waveKillLog || []).length;
  const vsBefore = ((Game.state.villageSlain || {}).belltoad | 0);
  const ledgerBefore = Game.waveLedgerPoints ? Game.waveLedgerPoints(1) : null;
  const codexBefore = (((Game.state.codex || {}).monsters || {}).belltoad || {}).stage || null;

  let scoreCalls = 0, rewardCalls = 0;
  const _slk = Game.scoreLedgerKill;
  const _tkr = Game.tbKillRewards;
  if (typeof _slk === 'function') Game.scoreLedgerKill = function (...a) { scoreCalls++; return _slk.apply(this, a); };
  if (typeof _tkr === 'function') Game.tbKillRewards = function (...a) { rewardCalls++; return _tkr.apply(this, a); };

  await quietLog(async () => {
    Game.tbfight = mkFight(Game, 'belltoad', ['shout', 'shout', 'shout']);
    Game.tbEnd('lost');
  });

  if (typeof _slk === 'function') Game.scoreLedgerKill = _slk;
  if (typeof _tkr === 'function') Game.tbKillRewards = _tkr;

  const wkl = Game.state.waveKillLog || [];
  const newEntries = wkl.slice(wklBefore);
  const bell = newEntries.filter(e => e && e.mid === 'belltoad');
  ok(bell.length === 1, 'pyrrhic: exactly one waveKillLog entry for the dead belltoad (got ' + bell.length + ')');
  const be = bell[0] || {};
  ok(be.trick === 'shout,shout,shout', 'pyrrhic: trick summary rides the entry (got ' + JSON.stringify(be.trick) + ')');
  ok(be.by === scholarVid, 'pyrrhic: by = the fallen scholar (got ' + JSON.stringify(be.by) + ')');
  ok(be.via === 'player', 'pyrrhic: via = player (got ' + JSON.stringify(be.via) + ')');
  ok(be.w === 1, 'pyrrhic: wave tag = 1 (got ' + JSON.stringify(be.w) + ')');
  const codexAfter = (((Game.state.codex || {}).monsters || {}).belltoad || {}).stage || null;
  ok(codexAfter === 'slain', 'pyrrhic: codex belltoad stage slain (was ' + JSON.stringify(codexBefore) + ', now ' + JSON.stringify(codexAfter) + ')');
  const vsAfter = ((Game.state.villageSlain || {}).belltoad | 0);
  ok(vsAfter === vsBefore + 1, 'pyrrhic: villageSlain[belltoad] +1 (was ' + vsBefore + ', now ' + vsAfter + ')');

  // ---------- BOUNDARY: no deeds, no loot ----------
  console.log('== BOUNDARY ==');
  ok(scoreCalls === 0, 'boundary: scoreLedgerKill NOT called on lost (calls=' + scoreCalls + ')');
  ok(rewardCalls === 0, 'boundary: tbKillRewards NOT called on lost (calls=' + rewardCalls + ')');
  if (ledgerBefore !== null) {
    const ledgerAfter = Game.waveLedgerPoints(1);
    ok(ledgerAfter === ledgerBefore, 'boundary: wave-1 ledger points flat (was ' + ledgerBefore + ', now ' + ledgerAfter + ')');
  }

  // ---------- ROUTED-CTRL: existing path untouched ----------
  console.log('== ROUTED-CTRL ==');
  const lb2 = Game.waveLedgerPoints ? Game.waveLedgerPoints(1) : null;
  await quietLog(async () => {
    const f2 = mkFight(Game, 'gallowdeer', ['move_windup']);
    f2.fighters[0].alive = true; f2.fighters[0].hp = 40; // scholar lives: routed
    Game.tbfight = f2;
    Game.tbEnd('routed');
  });
  const wkl2 = Game.state.waveKillLog || [];
  const gal = wkl2.filter(e => e && e.mid === 'gallowdeer');
  ok(gal.length >= 1, 'routed-ctrl: gallowdeer kill logged on routed');
  if (lb2 !== null) {
    const la2 = Game.waveLedgerPoints(1);
    ok(la2 > lb2, 'routed-ctrl: routed kill still scores ledger points (' + lb2 + ' -> ' + la2 + ')');
  }
  const gcx = (((Game.state.codex || {}).monsters || {}).gallowdeer || {}).stage || null;
  ok(gcx === 'slain', 'routed-ctrl: codex gallowdeer slain on routed');

  console.log('\npyrrhic-proof: ' + pass + ' pass, ' + fail + ' fail');
  if (fail) { console.log('FAILED: ' + fails.join('; ')); process.exit(1); }
  console.log('GREEN');
})().catch(e => { console.error('PROOF CRASH:', e); process.exit(2); });
