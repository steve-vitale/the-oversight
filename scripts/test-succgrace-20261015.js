#!/usr/bin/env node
// scripts/test-succgrace-20261015.js — proof for the succession-day grace
// lever (sim-succgrace, 2026-10-15, scale-onramp axis, sim-findings #321).
//
// THE LEVER (src/js/hierarchy.js, SUCCGRACE=1, env-gated, default OFF): in
// successionCrisis, a Haven-primary link below the seasoned bar (trust <
// 40) at the funeral that would dissolve the realm aloud gets an
// answerable renegotiation beat instead of the silent verdict — the
// young_links_get_grace idiom extended to succession day (gift/visit/wait,
// real costs, expires aloud in 7d). While pending, _linkSeasoned holds the
// fire's place; the beat's answers land through the mourning choke (the
// new speaker's played deeds — mourning itself untouched); unanswered, the
// realm dissolves aloud exactly as today. Chaos untouched: haircut,
// tribute moves, neglect snap, 14d proving window.
//
// REAL RED first (gate off: no beat staged, realm dissolves aloud as
// today), then GREEN (gate on). Det-gate: D1 gate-off determinism x2, D2
// gate-off byte-identical to PRISTINE HEAD hierarchy.js (override loader),
// D3 armed determinism x2.
//
// Fixture shape mirrors the observed s44 d115 case: three seasoned fires
// (80/76/44, 40d old), the third at trust 44 — the funeral's -8 haircut
// drops it to 36 (< 40), the realm's third leg, and the realm comes apart.
//
// HARNESS QUIRK (from test-tribshield-20261015.js): never create two games
// before running one — sequential create-run-create-run throughout.
//
// Usage: FEASTSCALE_R13=1 node scripts/test-succgrace-20261015.js
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const { loadGame, setupGame, mulberry32, ROOT } = require('./sim-harness');

const R13 = process.env.FEASTSCALE_R13 === '1';
if (!R13) {
  console.error('SUCCGRACE FATAL: FEASTSCALE_R13=1 required (the courtship-road substrate).');
  process.exit(2);
}
function setGate(on) {
  if (on) process.env.SUCCGRACE = '1'; else delete process.env.SUCCGRACE;
}

let passed = 0, failed = 0;
function ok(name, fn) {
  return Promise.resolve().then(fn).then(
    () => { passed++; console.log('  PASS ' + name); },
    (e) => { failed++; console.log('  FAIL ' + name + ' — ' + e.message); });
}
function expectFail(name, fn) {
  return Promise.resolve().then(fn).then(
    () => { failed++; console.log('  FAIL(red) ' + name + ' — levered assert did NOT fail with the gate off (RED is insensitive!)'); },
    () => { passed++; console.log('  PASS(red) ' + name + ' — correctly failed with the gate off'); });
}

// ---------- fixture ----------
function primLink(Game, id, trust) {
  const l = { id, status: 'active', primary: 'haven', subordinate: 'v-' + id,
    trust, day: 60, tributeKcalPerWeek: 4000, arrears: 0, tendedWeek: -1,
    lastKeptDay: 99, kind: 'lead' };
  Game.mshipState().links.push(l);
  return l;
}
async function freshGame(load) {
  const L = load || loadGame;
  const { Game } = await L({ seed: 4242, mode: 'succgrace-fixture' });
  await setupGame(Game);
  Game.state.scholar = Game.state.scholar || {};
  Game.state.scholar.day = 100;
  Game.state.village = Game.state.village || {};
  Game.state.village.pantry = [{ kcalEach: 1000, units: 40 }]; // 40k kcal
  Game.mshipState().links = [];
  Game.state.nationalLive = true;
  primLink(Game, 'l-a', 80);
  primLink(Game, 'l-b', 76);
  primLink(Game, 'l-c', 44); // the s44 third leg: 44 -> 36 at the funeral
  Game._sgBeats = [];
  const origSay = Game.say.bind(Game);
  Game.say = function (msg) {
    try {
      const t = String((msg && (msg.text || msg.msg || msg.message)) || msg || '');
      Game._sgBeats.push(t.replace(/<[^>]*>/g, '').replace(/\s+/g, ' '));
    } catch (e) {}
    return origSay(msg);
  };
  return Game;
}
function linkById(Game, id) {
  return (Game.mshipState().links || []).find(l => l.id === id);
}
function saidLike(Game, re) { return Game._sgBeats.filter(t => re.test(t)); }
function setDay(Game, d) { Game.state.scholar.day = d; }
function snapState(Game) {
  const links = (Game.mshipState().links || []).map(l =>
    [l.id, l.trust, l.tributeKcalPerWeek, l.mourningUntil || 0, l.status,
     l.pendingRenegotiation ? JSON.stringify(l.pendingRenegotiation) : '-'].join(',')).join(';');
  return [Game.state.scholar.day, Game.state.nationalLive ? 1 : 0, links].join('|');
}
// scripted trajectory: funeral on all three links, then N days of ticks.
function runTrajectory(Game, days) {
  const hashes = [];
  Game.successionCrisis('l-a');
  Game.successionCrisis('l-b');
  Game.successionCrisis('l-c');
  Game._checkNational();
  for (let d = 0; d < days; d++) {
    setDay(Game, 100 + d);
    try { Game._renegotiationTick(); } catch (e) {}
    try { Game._checkNational(); } catch (e) {}
    hashes.push(snapState(Game));
  }
  return crypto.createHash('sha1').update(hashes.join('~')).digest('hex');
}

// ---------- pristine override loader (D2) ----------
// Mirrors sim-harness loadGame, but src/js/hierarchy.js is read from
// `git show HEAD:src/js/hierarchy.js` (the pre-change file). Everything
// else is identical: same seed-before-eval, same frozen clock, same
// two-pass game.js, same macrotask yield.
async function loadGamePristine(opts) {
  const seed = (opts && opts.seed != null) ? opts.seed : 4242;
  const pristineHierarchy = execSync('git show HEAD:src/js/hierarchy.js', { cwd: ROOT }).toString('utf8');
  Math.random = mulberry32(seed);
  let clockCalls = 0;
  Date.now = () => 1760400000000 + (clockCalls++);
  global.fetch = (f) => Promise.resolve({
    json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8')))
  });
  const order = execSync(`grep -o 'src/js/[^\"'\"'\"']*\\.js' index.html`, { cwd: ROOT })
    .toString().split('\n')
    .filter(s => s && !/app\.js|sprites\.js|tile-scenes\.js|move-anim\.js|drama\.js/.test(s));
  global.window = global;
  const gameIdx = order.indexOf('src/js/game.js');
  const evalFile = (f) => {
    const module = { exports: {} };
    const exports = module.exports;
    const src = (f === 'src/js/hierarchy.js') ? pristineHierarchy : fs.readFileSync(path.join(ROOT, f), 'utf8');
    try { eval(src); } catch (e) { throw new Error('pristine eval failed for ' + f + ': ' + e.message); }
  };
  order.forEach((f, i) => { if (gameIdx < 0 || i < gameIdx) evalFile(f); });
  if (gameIdx >= 0) evalFile(order[gameIdx]);
  global.Game = globalThis.Scattering.Game;
  order.forEach((f, i) => { if (i > gameIdx) evalFile(f); });
  delete global.window;
  await new Promise(r => setTimeout(r, 0));
  const G = globalThis.Scattering.Game;
  G.say = function () {}; G.sysSay = function () {}; G.audioEvent = function () {};
  if (G.drama === undefined) G.drama = function () {};
  await G.init();
  return { Game: G };
}

async function main() {
  // ================= RED (gate OFF): the mechanism is absent =================
  console.log('\nRED (gate off): no beat, dissolution exactly as today');
  setGate(false);
  await expectFail('R1 gate-off: successionCrisis returns grace on the sub-bar link', async () => {
    const Game = await freshGame();
    const r = Game.successionCrisis('l-c');
    assert.strictEqual(r, 'grace', 'expected grace, got ' + r);
  });
  await ok('R2 gate-off: sub-bar link shakes, no beat staged', async () => {
    const Game = await freshGame();
    const r = Game.successionCrisis('l-c');
    assert.strictEqual(r, 'shaken');
    assert.ok(!linkById(Game, 'l-c').pendingRenegotiation, 'no beat staged');
    assert.strictEqual(linkById(Game, 'l-c').trust, 36, 'haircut lands: 44-8=36');
  });
  let redDissolveBeat = null;
  await ok('R3 gate-off: the realm dissolves aloud as today', async () => {
    const Game = await freshGame();
    Game.successionCrisis('l-a');
    Game.successionCrisis('l-b');
    Game.successionCrisis('l-c');
    Game._checkNational();
    assert.strictEqual(Game.state.nationalLive, false, 'realm falls: 2 seasoned < 3');
    const beats = saidLike(Game, /realm came apart/);
    assert.ok(beats.length >= 1, 'dissolution said aloud');
    redDissolveBeat = beats[beats.length - 1];
  });

  // ================= GREEN (gate ON) =================
  console.log('\nGREEN (gate on): the beat stages and resolves');
  setGate(true);
  await ok('G1 gate-on: beat staged on the eligible sub-bar succession', async () => {
    const Game = await freshGame();
    const r = Game.successionCrisis('l-c');
    assert.strictEqual(r, 'grace');
    const pr = linkById(Game, 'l-c').pendingRenegotiation;
    assert.ok(pr && pr.succgrace === true, 'succgrace beat pending');
    assert.strictEqual(linkById(Game, 'l-c').trust, 36, 'chaos untouched: haircut landed');
    assert.ok((linkById(Game, 'l-c').mourningUntil || 0) > 100, 'chaos untouched: mourning marked');
    const staging = saidLike(Game, /bond is fraying/);
    assert.strictEqual(staging.length, 1, 'staging beat said aloud once');
  });
  await ok('G2 gate-on: pending beat holds the realm at the day boundary', async () => {
    const Game = await freshGame();
    Game.successionCrisis('l-a');
    Game.successionCrisis('l-b');
    Game.successionCrisis('l-c');
    Game._checkNational();
    assert.strictEqual(Game.state.nationalLive, true, 'realm held while the beat is pending');
    assert.strictEqual(saidLike(Game, /realm came apart/).length, 0, 'no dissolution while pending');
  });
  await ok('G3 gate-on: answered gift holds the fraying link (44 >= 40)', async () => {
    const Game = await freshGame();
    Game.successionCrisis('l-c');
    const r = Game.answerRenegotiation('l-c', 'gift');
    assert.strictEqual(r, 'gift');
    const l = linkById(Game, 'l-c');
    assert.strictEqual(l.pendingRenegotiation, null, 'beat consumed');
    assert.strictEqual(l.trust, 44, 'gift lands through the mourning choke: 36+8=44');
    assert.ok((l.mourningUntil || 0) > 100, 'mourning restored untouched after the answer');
    Game._checkNational();
    assert.strictEqual(Game.state.nationalLive, true, 'realm holds: link seasoned again');
  });
  await ok('G4 gate-on: answered visit holds the fraying link', async () => {
    const Game = await freshGame();
    linkById(Game, 'l-c').trust = 46; // 46-8=38; visit +5=43, empty-bench +2=40
    Game.successionCrisis('l-c');
    assert.strictEqual(linkById(Game, 'l-c').trust, 38);
    const r = Game.answerRenegotiation('l-c', 'visit');
    assert.strictEqual(r, 'visit');
    assert.ok(linkById(Game, 'l-c').trust >= 40, 'visit lands: trust ' + linkById(Game, 'l-c').trust);
    Game._checkNational();
    assert.strictEqual(Game.state.nationalLive, true, 'realm holds after visit');
  });
  await ok('G5 gate-on: wait lets the silence answer, realm dissolves as today', async () => {
    const Game = await freshGame();
    Game.successionCrisis('l-c');
    const r = Game.answerRenegotiation('l-c', 'wait');
    assert.strictEqual(r, 'lapsed');
    assert.strictEqual(linkById(Game, 'l-c').trust, 30, 'lapse costs -6: 36-6=30');
    Game._checkNational();
    assert.strictEqual(Game.state.nationalLive, false, 'realm dissolves');
    const beats = saidLike(Game, /realm came apart/);
    assert.ok(beats.length >= 1, 'dissolution said aloud');
    assert.strictEqual(beats[beats.length - 1], redDissolveBeat,
      'lapse dissolution beat is byte-identical to the gate-off dissolution');
  });
  await ok('G6 gate-on: unanswered beat expires at 7d, then dissolves as today', async () => {
    const Game = await freshGame();
    Game.successionCrisis('l-c');
    setDay(Game, 106);
    Game._renegotiationTick();
    assert.ok(linkById(Game, 'l-c').pendingRenegotiation, 'still pending at 6d');
    Game._checkNational();
    assert.strictEqual(Game.state.nationalLive, true, 'realm still held at 6d');
    setDay(Game, 107);
    Game._renegotiationTick();
    assert.strictEqual(linkById(Game, 'l-c').pendingRenegotiation, null, 'lapsed at 7d');
    const lapse = saidLike(Game, /silence answered for Haven/);
    assert.ok(lapse.length >= 1, 'lapse said aloud');
    Game._checkNational();
    assert.strictEqual(Game.state.nationalLive, false, 'realm dissolves after lapse');
    assert.ok(saidLike(Game, /realm came apart/).length >= 1, 'dissolution said aloud');
  });
  await ok('G7 gate-on: ineligible links get no grace beat', async () => {
    const Game = await freshGame();
    // seasoned link (80-8=72): shakes, no beat
    assert.strictEqual(Game.successionCrisis('l-a'), 'shaken');
    assert.ok(!linkById(Game, 'l-a').pendingRenegotiation, 'no beat on seasoned link');
    // young link (<21d): young idiom, not the grace beat
    const yl = primLink(Game, 'l-y', 44);
    yl.day = 90; // 10d old
    assert.strictEqual(Game.successionCrisis('l-y'), 'grace');
    assert.ok(!linkById(Game, 'l-y').pendingRenegotiation.succgrace, 'young beat has no succgrace flag');
    // no national: no beat even on a sub-bar link
    const Game2 = await freshGame();
    Game2.state.nationalLive = false;
    assert.strictEqual(Game2.successionCrisis('l-c'), 'shaken');
    assert.ok(!linkById(Game2, 'l-c').pendingRenegotiation, 'no beat when not national');
  });

} // end main()

async function detgate() {
  console.log('\nDET-GATE: byte-identical default-off trajectories');
  let fail = 0;
  const chk = (name, a, b) => {
    if (a === b) { console.log('  PASS ' + name); }
    else { fail++; console.log('  FAIL ' + name + ' — ' + String(a).slice(0, 12) + ' != ' + String(b).slice(0, 12)); }
  };
  // D1: gate-off determinism x2 (modified code)
  setGate(false);
  const d1a = runTrajectory(await freshGame(), 30);
  const d1b = runTrajectory(await freshGame(), 30);
  chk('D1 gate-off determinism x2 (modified code)', d1a, d1b);
  // D2: gate-off PRISTINE (HEAD hierarchy.js) vs modified — the byte-identical claim
  const d2p = runTrajectory(await freshGame(loadGamePristine), 30);
  const d2m = runTrajectory(await freshGame(), 30);
  chk('D2 gate-off pristine-HEAD == modified (30d funeral trajectory)', d2p, d2m);
  // D3: armed determinism x2 (beat stages, lapses unanswered, realm dissolves)
  setGate(true);
  const d3a = runTrajectory(await freshGame(), 30);
  const d3b = runTrajectory(await freshGame(), 30);
  chk('D3 armed determinism x2', d3a, d3b);
  // D3b: armed trajectory differs from gate-off exactly at the beat (sanity: the lever does something)
  setGate(false);
  const d3c = runTrajectory(await freshGame(), 30);
  if (d3a === d3c) { fail++; console.log('  FAIL D3b sanity — armed trajectory identical to gate-off (lever inert!)'); }
  else { console.log('  PASS D3b sanity — armed trajectory differs from gate-off (lever fires)'); }
  setGate(false);
  if (fail) { console.error('DETGATE FAILED'); process.exit(1); }
  console.log('DETGATE GREEN');
}

main().then(detgate).then(() => {
  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed) process.exit(1);
  console.log('SUCCGRACE PROOF GREEN');
}).catch(e => { console.error('FATAL', e); process.exit(2); });
