#!/usr/bin/env node
// scripts/test-raiddensity-20261015.js — proof tests for the RAIDDENSITY
// Haven post-raid cooldown arm (flesh-out sim-raiddensity, 2026-10-15).
//
// The lever: one Haven-side 7-day post-raid cooldown across BOTH rival-raid
// channels (commons raids in game.js + famine raids in villageAgency.js),
// enforced only on young nationals (nationalLive, <60d from formation).
// Env-gated RAIDDENSITY=1, default OFF.
//
// Modes:
//   default    unit proofs: mechanism absent with gate OFF, present with
//              gate ON (both channels, boundary, old-national/not-national
//              refusals), cross-channel conversion (famine raid -> beg),
//              refusal-path aftermath untouched, REAL-RED on pristine code,
//              + det-gate D1 (gate-off trajectories byte-identical).
//   SMOKE=1    15d x {control, RAIDDENSITY=1} leadfeast runs: no crash,
//              instrument-honesty gate (raid-line counts reported).
//
// Env: FEASTSCALE_R13=1 node scripts/test-raiddensity-20261015.js
//      SMOKE=1 FEASTSCALE_R13=1 node scripts/test-raiddensity-20261015.js
//
// Env-var discipline: the suite never leaves RAIDDENSITY set after it
// finishes (deleted in finally) so the gate-off state is the ambient one.
'use strict';
const crypto = require('crypto');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const RB = require('./readinessbind-lib');

if (process.env.FEASTSCALE_R13 !== '1') {
  console.error('RAIDDENSITY FATAL: FEASTSCALE_R13=1 required (leadfeast/belongfeast are feastscale policies, #312 lesson).');
  process.exit(2);
}

let pass = 0, fail = 0;
const chk = (name, cond, extra) => {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
};

const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) {} return 0; };

// mkRaider: a rival village whose commons state trips the raid gate
// (tension 70+, trust <15, no deal, no shared-ground strain).
function mkRaider(Game, seedN) {
  const ovs = Game.state.otherVillages || [];
  const ov = ovs[seedN % Math.max(1, ovs.length)] || { id: 'v-test', name: 'Testfire', x: 8, y: 4 };
  ov.commons = { strainUs: 0, strainThem: 0, tension: 70, deal: null, depleteMult: 1, strainTiles: [], rumorStage: 0 };
  ov.trust = 10;
  return ov;
}

// capture say-lines while fn runs; return them.
function captureSay(Game, fn) {
  const lines = [];
  const orig = Game.say;
  Game.say = function (msg) { lines.push(String((msg && (msg.text || msg.msg || msg.message)) || msg || '')); return orig ? orig.call(Game, msg) : msg; };
  try { fn(); } finally { Game.say = orig; }
  return lines;
}

// Set the national clock: nationalLive + formation day `formedAgo` days ago.
function setNational(Game, formedAgo) {
  Game.state.nationalLive = true;
  const d = gday(Game) - formedAgo;
  Game.state.nationalDay = d;
  Game.state.nationalFirstDay = d; // stamped by hierarchy.js at formation with gate ON
}

const innerOf = (Game, v) => { try { return Game._vaInner(v); } catch (e) { return null; } };

async function unitProofs() {
  console.log('UNIT PROOFS: mechanism absent with gate OFF, present with gate ON');
  delete process.env.RAIDDENSITY;

  // ---- REAL-RED anchor: helpers must exist on armed code ----
  {
    const { Game } = await loadGame({ seed: 11, mode: 'rd-presence' });
    await setupGame(Game);
    chk('presence: _rdOn/_raidCooldownYoung/_raidCooldownSet on Game (REAL-RED on pristine)',
      typeof Game._rdOn === 'function' && typeof Game._raidCooldownYoung === 'function' && typeof Game._raidCooldownSet === 'function',
      'got ' + [typeof Game._rdOn, typeof Game._raidCooldownYoung, typeof Game._raidCooldownSet].join(','));
    chk('presence: _vaGuardRaidStage on Game (REAL-RED on pristine)',
      typeof Game._vaGuardRaidStage === 'function', 'got ' + typeof Game._vaGuardRaidStage);
  }

  // ---- gate OFF: the mechanism is absent ----
  {
    const { Game } = await loadGame({ seed: 12, mode: 'rd-off' });
    await setupGame(Game);
    const day = gday(Game);
    setNational(Game, 5);
    Game.state.havenRaidCooldownUntil = day + 7; // even a hypothetical window is inert
    chk('gate OFF: _raidCooldownYoung() false even with window set + young national',
      Game._raidCooldownYoung() === false);
    const before = Game.state.havenRaidCooldownUntil;
    const ov = mkRaider(Game, 0);
    captureSay(Game, () => Game.commonsRaid(ov));
    chk('gate OFF: commonsRaid does not touch havenRaidCooldownUntil',
      Game.state.havenRaidCooldownUntil === before, 'got ' + Game.state.havenRaidCooldownUntil);
    delete Game.state.havenRaidCooldownUntil;
    const ov2 = Game.state.otherVillages[1] || Game.state.otherVillages[0];
    captureSay(Game, () => Game._vaStageRaidDefense(ov2));
    chk('gate OFF: _vaStageRaidDefense does not set havenRaidCooldownUntil',
      Game.state.havenRaidCooldownUntil == null, 'got ' + Game.state.havenRaidCooldownUntil);
    Game.state.pendingRaidDefense = null;
  }

  // ---- gate ON ----
  process.env.RAIDDENSITY = '1';

  // cooldown fires on both channels: staging sets day+7
  {
    const { Game } = await loadGame({ seed: 13, mode: 'rd-set' });
    await setupGame(Game);
    const day = gday(Game);
    setNational(Game, 5);
    const ov = mkRaider(Game, 0);
    captureSay(Game, () => Game.commonsRaid(ov));
    chk('GREEN: commonsRaid sets havenRaidCooldownUntil = day+7',
      Game.state.havenRaidCooldownUntil === day + 7, 'got ' + Game.state.havenRaidCooldownUntil);
    const ov2 = Game.state.otherVillages[1] || Game.state.otherVillages[0];
    Game.state.scholar.day = day + 30; // move past the commons window
    captureSay(Game, () => Game._vaStageRaidDefense(ov2));
    chk('GREEN: _vaStageRaidDefense sets havenRaidCooldownUntil = day+7',
      Game.state.havenRaidCooldownUntil === day + 37, 'got ' + Game.state.havenRaidCooldownUntil);
    Game.state.pendingRaidDefense = null;
  }

  // boundary: young national, window active/refused
  {
    const { Game } = await loadGame({ seed: 14, mode: 'rd-bound' });
    await setupGame(Game);
    const day = gday(Game);
    setNational(Game, 5);
    chk('GREEN: no cooldown before any raid', Game._raidCooldownYoung() === false);
    Game._raidCooldownSet();
    chk('GREEN: cooldown fires right after a raid stages', Game._raidCooldownYoung() === true);
    Game.state.scholar.day = day + 6;
    chk('GREEN: cooldown still holds at day+6', Game._raidCooldownYoung() === true);
    Game.state.scholar.day = day + 7;
    chk('GREEN: cooldown refuses at day+7 (boundary)', Game._raidCooldownYoung() === false);
  }

  // refusals: old national, dissolved national
  {
    const { Game } = await loadGame({ seed: 15, mode: 'rd-refuse' });
    await setupGame(Game);
    setNational(Game, 61); // old: past the 60-day young window
    Game._raidCooldownSet();
    chk('GREEN: old national (61d) ignores the cooldown', Game._raidCooldownYoung() === false);
    setNational(Game, 59); // young edge
    Game._raidCooldownSet();
    chk('GREEN: 59d-old national still covered', Game._raidCooldownYoung() === true);
    Game.state.nationalLive = false;
    chk('GREEN: dissolved national ignores the cooldown', Game._raidCooldownYoung() === false);
  }

  // commons channel: blocked night is fiction, not a raid; expired window raids
  {
    const { Game } = await loadGame({ seed: 16, mode: 'rd-commons' });
    await setupGame(Game);
    const day = gday(Game);
    setNational(Game, 5);
    const ov = mkRaider(Game, 0);
    Game._raidCooldownSet(); // a raid staged today
    const trustBefore = ov.trust;
    const realRandom = Math.random;
    Math.random = () => 0.05; // force the 0.08 raid roll to trip
    let lines;
    try { lines = captureSay(Game, () => Game.commonsTick()); } finally { Math.random = realRandom; }
    chk('GREEN: blocked commons raid says the doubled-watch line, never silent',
      lines.some(l => l.includes('doubled watch turned it')), 'lines=' + lines.length);
    chk('GREEN: blocked commons raid stages NO raid beat',
      !lines.some(l => l.includes('🌙 Raid —')), 'saw a raid line');
    chk('GREEN: blocked commons raid costs no trust',
      ov.trust === trustBefore, 'trust ' + trustBefore + '->' + ov.trust);
    // window expired: the same roll stages a real raid
    Game.state.scholar.day = day + 8;
    ov.trust = 10; ov.commons.tension = 70;
    try { Math.random = () => 0.05; lines = captureSay(Game, () => Game.commonsTick()); } finally { Math.random = realRandom; }
    chk('GREEN: expired window lets the commons raid stage',
      lines.some(l => l.includes('🌙 Raid —')), 'lines=' + lines.length);
    chk('GREEN: staged commons raid craters trust (-10)',
      ov.trust === 0, 'trust=' + ov.trust);
  }

  // famine channel: raid converts to a beg inside the window (beg cooldown paid)
  {
    const { Game } = await loadGame({ seed: 17, mode: 'rd-famine' });
    await setupGame(Game);
    const day = gday(Game);
    setNational(Game, 5);
    const v = Game.state.otherVillages[1] || Game.state.otherVillages[0];
    const inner = innerOf(Game, v);
    inner.begCooldownUntil = day - 1; // normal beg cooldown paid
    Game._raidCooldownSet(); // a raid staged today
    let verdict;
    const convLines = captureSay(Game, () => { verdict = Game._vaGuardRaidStage(v); });
    chk('GREEN: famine raid inside the window converts to a beg', verdict === 'beg', 'got ' + verdict);
    chk('GREEN: beg staged (pendingBeg set), no raid beat staged',
      !!Game.state.pendingBeg && !Game.state.pendingRaidDefense);
    chk('GREEN: conversion fiction explains the doubled watch, never silent',
      convLines.some(l => l.includes("We're asking. Not taking.")) && convLines.some(l => l.includes('doubled watch')),
      'lines=' + convLines.length);
  }

  // famine channel: beg cooldown still owed -> 'none', watch fiction stands alone
  {
    const { Game } = await loadGame({ seed: 18, mode: 'rd-famine2' });
    await setupGame(Game);
    const day = gday(Game);
    setNational(Game, 5);
    const v = Game.state.otherVillages[1] || Game.state.otherVillages[0];
    const inner = innerOf(Game, v);
    inner.begCooldownUntil = day + 10; // normal beg cooldown owed
    Game._raidCooldownSet();
    let verdict;
    const lines = captureSay(Game, () => { verdict = Game._vaGuardRaidStage(v); });
    chk('GREEN: famine raid inside the window with beg cooldown owed -> none',
      verdict === 'none', 'got ' + verdict);
    chk('GREEN: no beat staged at all (never both, never ungated)',
      !Game.state.pendingBeg && !Game.state.pendingRaidDefense);
    chk('GREEN: the watch explains why, aloud',
      lines.some(l => l.includes('asking again this soon buys nothing')), 'lines=' + lines.length);
  }

  // refusal-path aftermath untouched: an unanswered STAGED raid still melts back
  // with kcal taken, even inside the cooldown window
  {
    const { Game } = await loadGame({ seed: 19, mode: 'rd-refusal' });
    await setupGame(Game);
    const day = gday(Game);
    setNational(Game, 5);
    const v = Game.state.otherVillages[1] || Game.state.otherVillages[0];
    Game._raidCooldownSet(); // window active
    const panBefore = (Game.state.village.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
    Game.state.pendingRaidDefense = { villageId: v.id, champion: 'Testchamp', raiders: ['A', 'B'], demand: 2000, day: day - 1 };
    const lines = captureSay(Game, () => Game.villageAgencyDaily());
    const panAfter = (Game.state.village.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
    chk('GREEN: unanswered staged raid still melts back with kcal (refusal path untouched)',
      lines.some(l => l.includes("didn't wait")) && panAfter < panBefore,
      'pantry ' + panBefore + '->' + panAfter);
  }
}

async function detgateD1() {
  console.log('DETGATE D1: gate-off trajectory determinism (seeds 11/22, leadfeast, 60d x2 each)');
  delete process.env.RAIDDENSITY;
  const { leadfeast } = require('./policies/feastscale');
  async function hash60(seed) {
    const { Game } = await loadGame({ seed, mode: 'rd-det' });
    await setupGame(Game);
    const hashes = [];
    const base = leadfeast;
    const policy = Object.assign({}, base);
    const origDaily = base.daily;
    policy.daily = (G, ctx) => { if (origDaily) { try { origDaily(G, ctx); } catch (e) {} } try { hashes.push(RB.trajectoryHash(G)); } catch (e) {} };
    await runDays(Game, policy, { days: 60, sampleEvery: 10 });
    return crypto.createHash('sha1').update(hashes.join('|')).digest('hex');
  }
  for (const seed of [11, 22]) {
    const h1 = await hash60(seed);
    const h2 = await hash60(seed);
    chk('D1 gate determinism byte-identical (seed ' + seed + ')', h1 === h2, h1.slice(0, 12) + ' vs ' + h2.slice(0, 12));
  }
}

async function smoke() {
  console.log('SMOKE: 15d x {control, RAIDDENSITY=1} leadfeast — instrument honesty');
  const { leadfeast } = require('./policies/feastscale');
  for (const rd of [false, true]) {
    if (rd) process.env.RAIDDENSITY = '1'; else delete process.env.RAIDDENSITY;
    const { Game } = await loadGame({ seed: 11, mode: 'rd-smoke-' + (rd ? 'on' : 'off') });
    await setupGame(Game);
    const base = leadfeast;
    const policy = Object.assign({}, base);
    const origDaily = base.daily;
    let n = 0;
    const raidLines = [];
    const origSay = Game.say;
    Game.say = function (msg) { const t = String((msg && (msg.text || msg.msg || msg.message)) || msg || ''); if (/Raid|raid defense|doubled watch/i.test(t)) raidLines.push(t.slice(0, 80)); return origSay ? origSay.call(Game, msg) : msg; };
    policy.daily = (G, ctx) => { if (origDaily) { try { origDaily(G, ctx); } catch (e) {} } n++; };
    const r = await runDays(Game, policy, { days: 15, sampleEvery: 10 });
    Game.say = origSay;
    chk('SMOKE ' + (rd ? 'RAIDDENSITY=1' : 'control') + ': 15d, samples collected, instrument saw ' + raidLines.length + ' raid-class lines',
      r.days === 15 && n >= 10, 'days=' + r.days + ' n=' + n);
  }
}

(async () => {
  try {
    if (process.env.SMOKE === '1') { await smoke(); }
    else { await unitProofs(); await detgateD1(); }
  } finally {
    delete process.env.RAIDDENSITY;
  }
  console.log(`\nRAIDDENSITY PROOF: ${pass} pass, ${fail} fail`);
  if (fail) { console.error('PROOF FAILED'); process.exit(1); }
  console.log('PROOF GREEN');
})().catch(e => { delete process.env.RAIDDENSITY; console.error('RAIDDENSITY FATAL:', e && e.stack || e); process.exit(1); });
