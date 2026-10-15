#!/usr/bin/env node
// test-w5avoid2-20261015.js — proof for the W5-AVOIDANCE DOCTRINE layer,
// clearing half deleted (scale-onramp, run fleshout-a-2026-10-15-0015 ARM 1).
// Real RED -> GREEN on a live Game, no mocks.
//
// RED (gate off):  injected w5 lingerer + wrapped policy.daily -> the layer
//   is inert (no engagement, no avoidance counts, travelTo untouched).
// NON-AGGRESSION (gate off byte-identical): raw leadfeast vs wrapped policy
//   (W5AVOID2 unset), 20 days, same seed -> identical day hashes.
// GREEN avoidance: w5 follower (editor) at the treeline + dawnWatch ->
//   NO pendingEncounter, w5Avoided=1 (follower), w5AlertDays=1, and the
//   travel guard refuses a march onto its tile (null + w5MarchRefused)
//   while letting other tiles and the haven tile pass through.
// GREEN alerts-only (the r36 regression case): w4 raider AND w1 hushwolf
//   pack on the haven tile + dawnWatch -> NO pendingEncounter for either.
//   The old layer engaged these; the clearing half is deleted — the watch
//   only alerts on w5.
// JUDGMENT: tableActive / hurt scholar / live pendingEncounter -> the watch
//   still only alerts on w5 and never engages under any condition.
// ALERT WATCH: w5 threats present -> w5AlertDays counted once per day,
//   twice-daily calls don't double-count.
// SMOKE=1: instrument-honesty gate — fails loudly if the suite ever runs
//   policy-less (unwrap check + harness-drives-policy check).
//
// KILLED-ARM GUARD: if the layer is absent (deleted per kill protocol), the
// proof degrades to INFO-SKIP, never MODULE_NOT_FOUND (6th-instance lesson).
'use strict';
process.env.FEASTSCALE_R13 = '1';
const assert = require('assert');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { leadfeast } = require('./policies/feastscale');
// landed-tree guard: the w5avoid2 layer may be deleted per kill protocol —
// degrade to INFO-SKIP, not MODULE_NOT_FOUND.
let wa = null;
try { wa = require('./policies/w5avoid2'); } catch (e) { /* absent: killed arm */ }
if (require.main === module && !wa) {
  console.log('INFO-SKIP: w5avoid2 layer absent (killed arm, deleted per kill protocol).');
  process.exit(0);
}

let pass = 0;
function ok(cond, msg) {
  if (!cond) { console.error('FAIL: ' + msg); process.exit(1); }
  pass++;
  console.log('  ok: ' + msg);
}
function havenTile(Game) {
  const v = (Game.state || {}).village || {};
  return { x: (v.px !== undefined && v.px !== null) ? v.px : 4, y: (v.py !== undefined && v.py !== null) ? v.py : 4 };
}
function clearTile(Game, x, y) {
  const wms = Game.worldMonsters();
  for (let i = wms.length - 1; i >= 0; i--) {
    if (wms[i].tx === x && wms[i].ty === y) wms.splice(i, 1);
  }
}
function injectMonster(Game, id, wave, tx, ty, lingering) {
  const { x: hx, y: hy } = havenTile(Game);
  const X = tx === undefined ? hx : tx, Y = ty === undefined ? hy : ty;
  clearTile(Game, X, Y);
  const wms = Game.worldMonsters();
  const m = {
    id, tx: X, ty: Y, mx: 4, my: 4, size: 1,
    hp: 400, maxHp: 400, wave: wave, lingering: !!lingering,
    stance: null, fearTurns: 0, veteran: false, variant: null, lostSight: 0,
  };
  wms.push(m);
  try { Game.syncMonsterAlias(); } catch (e) {}
  return m;
}
function injectFollower(Game, id, wave) {
  // adjacent tile (the treeline); def must carry follows
  const { x: hx, y: hy } = havenTile(Game);
  const wms = Game.worldMonsters();
  for (let i = wms.length - 1; i >= 0; i--) {
    const m = wms[i];
    if (Math.abs(m.tx - hx) + Math.abs(m.ty - hy) === 1) wms.splice(i, 1);
  }
  return injectMonster(Game, id, wave, hx + 1, hy, false);
}
function healScholar(Game, pct) {
  const s = Game.state.scholar || {};
  const max = (Game.maxHealth ? Game.maxHealth() : 100) || 100;
  s.health = max * pct;
}
function dayHash(Game) {
  try {
    const s = (Game.state || {}).scholar || {}, v = (Game.state || {}).village || {};
    return [s.day, Math.round(s.health || 0), Math.round(s.kcal || 0), (v.roster || []).length].join('|');
  } catch (e) { return 'ERR'; }
}
async function runHashed(policy, seed, days) {
  const { Game } = await loadGame({ seed, mode: 'w5avoid2-test', fullTelemetry: false });
  await setupGame(Game);
  const hashes = [];
  const p = Object.assign({}, policy);
  const od = policy.daily;
  p.daily = (G, ctx) => { hashes.push(dayHash(G)); return od ? od(G, ctx) : undefined; };
  await quietLog(() => runDays(Game, p, { days }));
  return hashes;
}
function withEnv(k, v, fn) {
  const old = process.env[k];
  return Promise.resolve().then(() => {
    if (v === undefined) delete process.env[k]; else process.env[k] = v;
    return fn();
  }).finally(() => {
    if (old === undefined) delete process.env[k]; else process.env[k] = old;
  });
}
function freshCtx() { return {}; }

async function testRed(seed) {
  console.log('RED (gate off): injected w5 lingerer -> layer inert');
  await withEnv('W5AVOID2', undefined, async () => {
    const { Game } = await loadGame({ seed, mode: 'w5avoid2-red' });
    await setupGame(Game);
    healScholar(Game, 1.0);
    const { x: hx, y: hy } = havenTile(Game);
    injectMonster(Game, 'editor', 5, hx, hy, true); // w5 lingerer at haven
    const travelRef = Game.travelTo;
    const ctx = freshCtx();
    const policy = Object.assign({}, wa.leadfeastW5avoid2);
    await quietLog(() => policy.daily(Game, ctx));
    ok(!Game.pendingEncounter, 'gate off: no pendingEncounter set');
    ok(!ctx.w5Avoided, 'gate off: w5Avoided unset');
    ok(!ctx.w5AlertDays, 'gate off: w5AlertDays unset');
    ok(!ctx.w5MarchRefused, 'gate off: w5MarchRefused unset');
    ok(Game.travelTo === travelRef, 'gate off: travelTo untouched (no guard installed)');
  });
}

async function testNonAggression(seed) {
  console.log('NON-AGGRESSION (gate off byte-identical): 20d same seed');
  await withEnv('W5AVOID2', undefined, async () => {
    const a = await runHashed(leadfeast, seed, 20);
    const b = await runHashed(wa.leadfeastW5avoid2, seed, 20);
    ok(a.length === b.length && a.every((h, i) => h === b[i]),
      `gate off: ${a.length}d identical hashes (leadfeast == leadfeast+w5avoid2)`);
  });
}

async function testGreenAvoidance(seed) {
  console.log('GREEN avoidance: w5 follower at the treeline -> alerted, never engaged');
  await withEnv('W5AVOID2', '1', async () => {
    const { Game } = await loadGame({ seed, mode: 'w5avoid2-avoid' });
    await setupGame(Game);
    healScholar(Game, 1.0);
    // editor: wave 5, follows=true (s33's treeline holder)
    const def = (Game.data.monsters || []).find(m => m.id === 'editor');
    ok(!!(def && def.wave === 5 && def.follows), 'precondition: editor def is wave-5 follows');
    const m = injectFollower(Game, 'editor', 5);
    const threats = wa.threatsAtHaven(Game);
    ok(threats.length === 1 && threats[0].kind === 'follower' && threats[0].wave === 5,
      'threat scanner sees the w5 follower (got ' + JSON.stringify(threats.map(t => t.kind + '/w' + t.wave)) + ')');
    const ctx = freshCtx();
    await quietLog(() => wa.dawnWatch(Game, ctx));
    ok(!Game.pendingEncounter, 'w5 follower: NO pendingEncounter (never engaged)');
    ok(ctx.w5Avoided === 1, 'w5Avoided 1');
    ok(ctx.w5Avoided_follower === 1, 'w5Avoided_follower 1');
    ok(ctx.w5AlertDays === 1, 'w5AlertDays 1');
    // second call same day: no double-count
    await quietLog(() => wa.dawnWatch(Game, ctx));
    ok(ctx.w5Avoided === 1, 'second call same day: still 1 (one watch per day)');
    // travel guard: a march onto the follower's tile is refused
    const calls = [];
    const pre = Game.travelTo;
    const recorder = function (...a) { calls.push(a); return pre.apply(this, a); };
    Game.travelTo = recorder;
    const restore = wa.guardTravel(Game, ctx);
    let r1 = null;
    await quietLog(() => { r1 = Game.travelTo(m.tx, m.ty); });
    ok(r1 === null && calls.length === 0, 'march onto the w5 tile refused (null, orig not called)');
    ok(ctx.w5MarchRefused === 1, 'w5MarchRefused 1');
    // the haven tile itself is always allowed through to the engine
    const { x: hx, y: hy } = havenTile(Game);
    await quietLog(() => { Game.travelTo(hx, hy); });
    ok(calls.length === 1, 'haven tile passes through to the engine');
    // a w5-free tile passes through too
    await quietLog(() => { Game.travelTo(hx, (hy + 2) % 9); });
    ok(calls.length === 2, 'w5-free tile passes through to the engine');
    restore();
    ok(Game.travelTo === recorder, 'guard restored after use');
    Game.travelTo = pre;
  });
}

async function testGreenAlertsOnly(seed) {
  console.log('GREEN alerts-only: w4 raider + w1 pack -> named nowhere, engaged nowhere');
  await withEnv('W5AVOID2', '1', async () => {
    const { Game } = await loadGame({ seed, mode: 'w5avoid2-alert' });
    await setupGame(Game);
    healScholar(Game, 1.0);
    // the r36 regression case: the old layer engaged these at dawn.
    injectMonster(Game, 'reunion', 4);   // w4 raider on the haven tile
    injectMonster(Game, 'hushwolf', 1);  // w1 pack member on the haven tile
    const ctx = freshCtx();
    await quietLog(() => wa.dawnWatch(Game, ctx));
    ok(!Game.pendingEncounter, 'w4 raider: NO pendingEncounter (clearing half deleted)');
    ok(Game.pendingMonsterId == null, 'pendingMonsterId untouched');
    ok(!ctx.w5Avoided, 'w5Avoided 0 — the watch only answers w5');
    ok(!ctx.w5AlertDays, 'w5AlertDays 0 — no w5 threats present');
    // and a w5 raider alongside: alerted, never engaged
    injectMonster(Game, 'editor', 5);
    const ctx2 = freshCtx();
    await quietLog(() => wa.dawnWatch(Game, ctx2));
    ok(!Game.pendingEncounter, 'w5 raider: NO pendingEncounter (never engaged)');
    ok(ctx2.w5Avoided === 1, 'w5Avoided 1 (the w5 raider)');
    ok(ctx2.w5Avoided_raider === 1, 'w5Avoided_raider 1');
  });
}

async function testJudgment(seed) {
  console.log('JUDGMENT: the watch never engages under any condition');
  await withEnv('W5AVOID2', '1', async () => {
    // table sanctity + w5 threat: still only alerts
    {
      const { Game } = await loadGame({ seed, mode: 'w5avoid2-j1' });
      await setupGame(Game);
      healScholar(Game, 1.0);
      injectMonster(Game, 'editor', 5);
      Game.tableActive = () => true;
      const ctx = freshCtx();
      await quietLog(() => wa.dawnWatch(Game, ctx));
      ok(!Game.pendingEncounter, 'tableActive: no engagement');
      ok(ctx.w5Avoided === 1, 'tableActive: still alerts (w5Avoided 1)');
    }
    // hurt scholar: still only alerts
    {
      const { Game } = await loadGame({ seed, mode: 'w5avoid2-j2' });
      await setupGame(Game);
      healScholar(Game, 0.4);
      injectMonster(Game, 'editor', 5);
      const ctx = freshCtx();
      await quietLog(() => wa.dawnWatch(Game, ctx));
      ok(!Game.pendingEncounter, 'HP 40%: no engagement');
      ok(ctx.w5Avoided === 1, 'HP 40%: still alerts (w5Avoided 1)');
    }
    // live pendingEncounter: never clobbered
    {
      const { Game } = await loadGame({ seed, mode: 'w5avoid2-j3' });
      await setupGame(Game);
      healScholar(Game, 1.0);
      injectMonster(Game, 'editor', 5);
      Game.pendingEncounter = true; Game.pendingMonsterId = 'hushwolf';
      const ctx = freshCtx();
      await quietLog(() => wa.dawnWatch(Game, ctx));
      ok(Game.pendingMonsterId === 'hushwolf', 'live pendingEncounter untouched');
      ok(!ctx.w5Engagements, 'no engagement channel exists anymore');
    }
  });
}

async function testAlertBeats(seed) {
  console.log('ALERT BEATS: the avoidance reads in-fiction (sense check)');
  await withEnv('W5AVOID2', '1', async () => {
    const { Game } = await loadGame({ seed, mode: 'w5avoid2-beats' });
    await setupGame(Game);
    healScholar(Game, 1.0);
    injectFollower(Game, 'editor', 5);
    const said = [];
    const origSay = Game.say.bind(Game);
    Game.say = (t) => { said.push(String(t)); return origSay(t); };
    const ctx = freshCtx();
    await quietLog(() => wa.dawnWatch(Game, ctx));
    Game.say = origSay;
    const beats = said.filter(t => t.includes('treeline') || t.includes('answers that'));
    ok(beats.length >= 1, 'avoidance beat fired (' + beats.length + ')');
    for (const b of beats) {
      ok(!/The The /.test(b), 'no doubled article: ' + JSON.stringify(b));
      console.log('  beat: ' + b);
    }
  });
}

async function smokeGate() {
  console.log('SMOKE=1 instrument-honesty gate');
  const fails = [];
  const check = (name, cond, detail) => {
    console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
    if (!cond) fails.push(name);
  };
  check('named export unwraps (r20b)', !!(wa.leadfeastW5avoid2 && wa.leadfeastW5avoid2.id === 'leadfeast+w5avoid2'),
    'id=' + (wa.leadfeastW5avoid2 && wa.leadfeastW5avoid2.id));
  check('unwrapped daily is a function', typeof wa.leadfeastW5avoid2.daily === 'function', '');
  check('control unwraps', !!(leadfeast && leadfeast.id === 'leadfeast'), '');
  check('layerOn() false when unset', (() => { delete process.env.W5AVOID2; return wa.layerOn() === false; })(), '');
  check('parent resolved', wa.baseId === 'leadfeast', 'baseId=' + wa.baseId);
  if (fails.length) { console.log('\nSMOKE STOP: unwrap failure — the suite would run policy-less.'); process.exit(1); }
  process.env.W5AVOID2 = '1';
  const { Game } = await loadGame({ seed: 11, mode: 'w5avoid2-smoke' });
  await setupGame(Game);
  const policy = Object.assign({}, wa.leadfeastW5avoid2);
  let result = null;
  await quietLog(async () => { result = await runDays(Game, policy, { days: 10, sampleEvery: 10 }); });
  const meanCalls = result.pacing ? (result.pacing.meanPolicyCallsPerDay || 0) : 0;
  check('harness drives armed policy.daily', meanCalls > 0, 'mean=' + meanCalls);
  delete process.env.W5AVOID2;
  if (fails.length) { console.log('\nSMOKE STOP: instrument-honesty gate failed.'); process.exit(1); }
  console.log('SMOKE GREEN: unwrap honest, harness drives the armed policy.');
}

async function main() {
  if (process.env.SMOKE === '1') { await smokeGate(); return; }
  const seeds = (process.env.SEEDS || '11,42,99').split(',').map(Number);
  console.log(`proof: w5avoid2 layer (seeds ${seeds.join(',')})`);
  for (const s of seeds) {
    console.log(`-- seed ${s} --`);
    await testRed(s);
    await testNonAggression(s);
    await testGreenAvoidance(s);
    await testGreenAlertsOnly(s);
    await testJudgment(s);
    await testAlertBeats(s);
  }
  console.log(`\nALL GREEN: ${pass} checks passed.`);
}

if (require.main === module) { main().catch(e => { console.error('FATAL', e); process.exit(1); }); }
module.exports = {};
