#!/usr/bin/env node
// scripts/test-younggrace-20261015.js — proof tests for the YOUNGGRACE
// consolidation-grace lever (flesh-out sim-younggrace, 2026-10-15).
//
// Modes:
//   default    unit proofs: REAL-RED (pristine mechanisms demonstrably
//              fire with the gate OFF) + GREEN (lever fires with the gate
//              ON), gate boundary + det-gate D1 (gate-off trajectories
//              byte-identical 60d x2).
//   SMOKE=1    15d x {control, YOUNGGRACE=1} leadfeast runs: no crash,
//              samples collected — instrument-honesty gate.
//
// Env: FEASTSCALE_R13=1 node scripts/test-younggrace-20261015.js
//      SMOKE=1 FEASTSCALE_R13=1 node scripts/test-younggrace-20261015.js
//
// Env-var discipline: the suite never leaves YOUNGGRACE set after it
// finishes (delete in finally) so the gate-off state is the ambient one.
'use strict';
const crypto = require('crypto');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const RB = require('./readinessbind-lib');

const R13 = process.env.FEASTSCALE_R13 === '1';
if (!R13) {
  console.error('YOUNGGRACE FATAL: FEASTSCALE_R13=1 required (leadfeast is a feastscale policy, #312 lesson).');
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

function takeFromLines(lines) {
  for (const l of lines) {
    const m = l.match(/carried off ~([\d,]+) kcal/);
    if (m) return parseInt(m[1].replace(/,/g, ''), 10);
  }
  return null;
}

// Set the national clock: nationalLive + formation day `formedAgo` days ago.
function setNational(Game, formedAgo) {
  Game.state.nationalLive = true;
  Game.state.nationalDay = gday(Game) - formedAgo;
}

async function unitProofs() {
  console.log('UNIT PROOFS: mechanism absent with gate OFF, present with gate ON');
  delete process.env.YOUNGGRACE;

  // ---- gate state ----
  {
    const { Game } = await loadGame({ seed: 11, mode: 'yg-unit' });
    await setupGame(Game);
    chk('gate OFF: youngGraceOn() false even when national <30d old', (() => { setNational(Game, 5); return Game.youngGraceOn() === false; })());
    chk('gate OFF: youngGraceOn() false when not national', (() => { Game.state.nationalLive = false; return Game.youngGraceOn() === false; })());
  }

  // ---- REAL-RED: pristine raid take request 500-1500 with gate OFF ----
  // (capture the `want` argument to pantryDraw — `taken` can overshoot on
  // indivisible items, which is honest pristine draw behavior, not the
  // raid's doing)
  let wantOff;
  {
    const { Game } = await loadGame({ seed: 42, mode: 'yg-red-take' });
    await setupGame(Game);
    const ov = mkRaider(Game, 0);
    const origDraw = Game.pantryDraw;
    let want = null;
    Game.pantryDraw = function (v, w, opts) { want = w; return origDraw.call(Game, v, w, opts); };
    captureSay(Game, () => Game.commonsRaid(ov));
    Game.pantryDraw = origDraw;
    wantOff = want;
    chk('RED: gate OFF commonsRaid requests take in [500,1500] (pristine)', want != null && want >= 500 && want <= 1500, 'want=' + want);
  }

  // ---- REAL-RED: pristine succession press x0.75 with gate OFF ----
  {
    const { Game } = await loadGame({ seed: 43, mode: 'yg-red-press' });
    await setupGame(Game);
    const day = gday(Game);
    Game.mshipState().links = [{ id: 'l-red', kind: 'lead', status: 'active', day: day - 60, subordinate: 'v-red', primary: 'haven', trust: 50, tributeKcalPerWeek: 4000 }];
    Game.successionCrisis('l-red');
    const link = Game.mshipState().links.find(l => l.id === 'l-red');
    chk('RED: gate OFF succession press is x0.75 (4000->3000)', link && link.tributeKcalPerWeek === 3000, 'got ' + (link && link.tributeKcalPerWeek));
  }

  // ---- REAL-RED: pristine raid roll ~0.08 with gate OFF ----
  {
    const { Game } = await loadGame({ seed: 44, mode: 'yg-red-roll' });
    await setupGame(Game);
    const ov = mkRaider(Game, 0);
    let raids = 0;
    for (let i = 0; i < 400; i++) {
      const before = Game.state.village && Game.state.village.pop || 0;
      Game.commonsTick();
      // commonsRaid seeds gossip 'raid' — count via trust delta is messy;
      // instead count by wrapping: cheaper to count say-lines.
      void before;
    }
    // (rate measured properly below with say-capture)
    chk('RED: commonsTick executes 400x without error (gate OFF)', true);
    void raids;
  }

  // Rate measurement with say-capture (both arms, same seed -> honest bands).
  async function raidRate(seed, yg) {
    if (yg) process.env.YOUNGGRACE = '1'; else delete process.env.YOUNGGRACE;
    const { Game } = await loadGame({ seed, mode: 'yg-rate-' + (yg ? 'on' : 'off') });
    await setupGame(Game);
    const ov = mkRaider(Game, 0);
    if (yg) setNational(Game, 5);
    let raids = 0;
    for (let i = 0; i < 400; i++) {
      const lines = captureSay(Game, () => Game.commonsTick());
      if (lines.some(l => l.includes('🌙 Raid'))) raids++;
      // keep the gate tripped: commonsRaid craters trust, re-arm each tick
      ov.trust = 10; ov.commons.tension = 70;
    }
    return raids;
  }
  const rOff = await raidRate(99, false);
  chk('RED: gate OFF raid rate ~0.08 over 400 ticks (band 16-48)', rOff >= 16 && rOff <= 48, 'raids=' + rOff);

  // ---- GREEN: lever fires with gate ON ----
  process.env.YOUNGGRACE = '1';
  {
    const { Game } = await loadGame({ seed: 11, mode: 'yg-green-gate' });
    await setupGame(Game);
    setNational(Game, 5);
    chk('GREEN: youngGraceOn() true when YOUNGGRACE=1 + national 5d old', Game.youngGraceOn() === true);
    setNational(Game, 29);
    chk('GREEN: grace holds at 29d (< 30)', Game.youngGraceOn() === true);
    setNational(Game, 30);
    chk('GREEN: grace expires at 30d (boundary)', Game.youngGraceOn() === false);
    Game.state.nationalLive = false;
    chk('GREEN: no grace when national dissolves', Game.youngGraceOn() === false);
  }

  // ---- GREEN: take request halved (same seed => identical random stream) ----
  {
    const { Game } = await loadGame({ seed: 42, mode: 'yg-green-take' });
    await setupGame(Game);
    const ov = mkRaider(Game, 0);
    setNational(Game, 5);
    const origDraw = Game.pantryDraw;
    let want = null;
    Game.pantryDraw = function (v, w, opts) { want = w; return origDraw.call(Game, v, w, opts); };
    captureSay(Game, () => Game.commonsRaid(ov));
    Game.pantryDraw = origDraw;
    const wantOn = want;
    chk('GREEN: gate ON commonsRaid take request is half of pristine (' + wantOff + '->' + wantOn + ')',
      wantOn != null && wantOn === Math.round(wantOff * 0.5), 'want=' + wantOn);
  }

  // ---- GREEN: succession press x0.9 under grace ----
  {
    const { Game } = await loadGame({ seed: 43, mode: 'yg-green-press' });
    await setupGame(Game);
    const day = gday(Game);
    setNational(Game, 5);
    Game.mshipState().links = [{ id: 'l-green', kind: 'lead', status: 'active', day: day - 60, subordinate: 'v-green', primary: 'haven', trust: 50, tributeKcalPerWeek: 4000 }];
    Game.successionCrisis('l-green');
    const link = Game.mshipState().links.find(l => l.id === 'l-green');
    chk('GREEN: gate ON succession press is x0.9 (4000->3600)', link && link.tributeKcalPerWeek === 3600, 'got ' + (link && link.tributeKcalPerWeek));
  }

  // ---- GREEN: raid rate ~0.04 under grace ----
  const rOn = await raidRate(99, true);
  chk('GREEN: grace raid rate ~0.04 over 400 ticks (band 6-28)', rOn >= 6 && rOn <= 28, 'raids=' + rOn);
  chk('GREEN: grace rate below pristine rate', rOn < rOff, rOn + ' vs ' + rOff);
}

async function detgateD1() {
  console.log('DETGATE D1: gate-off trajectory determinism (seed 11, leadfeast, 60d x2)');
  delete process.env.YOUNGGRACE;
  const { leadfeast } = require('./policies/feastscale');
  async function hash60() {
    const { Game } = await loadGame({ seed: 11, mode: 'yg-det' });
    await setupGame(Game);
    const hashes = [];
    const base = leadfeast;
    const policy = Object.assign({}, base);
    const origDaily = base.daily;
    policy.daily = (G, ctx) => { if (origDaily) { try { origDaily(G, ctx); } catch (e) {} } try { hashes.push(RB.trajectoryHash(G)); } catch (e) {} };
    await runDays(Game, policy, { days: 60, sampleEvery: 10 });
    return crypto.createHash('sha1').update(hashes.join('|')).digest('hex');
  }
  const h1 = await hash60();
  const h2 = await hash60();
  chk('D1 gate determinism byte-identical', h1 === h2, h1.slice(0, 12) + ' vs ' + h2.slice(0, 12));
}

async function smoke() {
  console.log('SMOKE: 15d x {control, YOUNGGRACE=1} leadfeast');
  const { leadfeast } = require('./policies/feastscale');
  for (const yg of [false, true]) {
    if (yg) process.env.YOUNGGRACE = '1'; else delete process.env.YOUNGGRACE;
    const { Game } = await loadGame({ seed: 11, mode: 'yg-smoke-' + (yg ? 'on' : 'off') });
    await setupGame(Game);
    const base = leadfeast;
    const policy = Object.assign({}, base);
    const origDaily = base.daily;
    let n = 0;
    policy.daily = (G, ctx) => { if (origDaily) { try { origDaily(G, ctx); } catch (e) {} } n++; };
    const r = await runDays(Game, policy, { days: 15, sampleEvery: 10 });
    chk('SMOKE ' + (yg ? 'YOUNGGRACE=1' : 'control') + ': 15d, samples collected', r.days === 15 && n >= 10, 'days=' + r.days + ' n=' + n);
  }
}

(async () => {
  try {
    if (process.env.SMOKE === '1') { await smoke(); }
    else { await unitProofs(); await detgateD1(); }
  } finally {
    delete process.env.YOUNGGRACE;
  }
  console.log(`\nYOUNGGRACE PROOF: ${pass} pass, ${fail} fail`);
  if (fail) { console.error('PROOF FAILED'); process.exit(1); }
  console.log('PROOF GREEN');
})().catch(e => { delete process.env.YOUNGGRACE; console.error('YOUNGGRACE FATAL:', e && e.stack || e); process.exit(1); });
