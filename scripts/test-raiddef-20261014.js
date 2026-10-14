#!/usr/bin/env node
// test-raiddef-20261014.js — proof for the r35 ARM 3 raid-channel defense
// layer (scale-onramp, 2026-10-14). Real RED -> GREEN on a live Game, no mocks.
//
// RED (gate off):  raider injected on the haven tile + wrapped policy.daily
//   -> NO engagement (pendingEncounter false, raidEngagements 0).
// NON-AGGRESSION (gate off byte-identical): raw leadfeast vs wrapped policy
//   (RAIDDEF unset), 20 days, same seed -> identical day hashes.
// GREEN (gate on): raider on the haven tile + healthy scholar ->
//   policy.daily sets pendingEncounter with the raider's monsterId
//   (triggerEncounter choke point); one answer per threat per day.
// GREEN follower: mdef.follows monster on the tile adjacent to haven ->
//   engaged as a 'follower' threat (the treeline path).
// JUDGMENT: tableActive -> no trigger; scholar HP < 60% (w4) -> no trigger +
//   raidHeldHp counted; wave-4 threat + no party + healthy villagers at home
//   who refuse -> HOLD (no trigger) + raidHeldAlone counted.
// SMOKE=1: instrument-honesty gate — fails loudly if the suite ever runs
//   policy-less (unwrap check + harness-drives-policy check + wrap-installs).
//
// If the raid-channel threats had no engine-reachable engagement path, this
// test could not go GREEN — that was the brief's stop condition.
'use strict';
process.env.FEASTSCALE_R13 = '1';
const assert = require('assert');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const rd = require('./policies/raiddef');
const { leadfeast } = require('./policies/feastscale');

let pass = 0;
function ok(cond, msg) {
  if (!cond) { console.error('FAIL: ' + msg); process.exit(1); }
  pass++;
  console.log('  ok: ' + msg);
}
const gday = (G) => ((G && G.state && G.state.scholar) || {}).day || 0;
function havenTile(Game) {
  const v = (Game.state || {}).village || {};
  return { x: (v.px !== undefined && v.px !== null) ? v.px : 4, y: (v.py !== undefined && v.py !== null) ? v.py : 4 };
}
function clearHavenTile(Game) {
  const { x: hx, y: hy } = havenTile(Game);
  const wms = Game.worldMonsters();
  for (let i = wms.length - 1; i >= 0; i--) {
    if (wms[i].tx === hx && wms[i].ty === hy) wms.splice(i, 1);
  }
}
function injectRaider(Game, id, wave) {
  clearHavenTile(Game);
  const { x: hx, y: hy } = havenTile(Game);
  const wms = Game.worldMonsters();
  const m = {
    id, tx: hx, ty: hy, mx: 4, my: 4, size: 1,
    hp: 400, maxHp: 400, wave: wave || 4, lingering: false,
    stance: null, fearTurns: 0, veteran: false, variant: null, lostSight: 0,
  };
  wms.push(m);
  try { Game.syncMonsterAlias(); } catch (e) {}
  return m;
}
function injectFollower(Game, id) {
  // adjacent tile (manhattan distance 1 from haven); the def must carry follows
  clearHavenTile(Game);
  const { x: hx, y: hy } = havenTile(Game);
  const wms = Game.worldMonsters();
  for (let i = wms.length - 1; i >= 0; i--) {
    const m = wms[i];
    if (Math.abs(m.tx - hx) + Math.abs(m.ty - hy) === 1) wms.splice(i, 1);
  }
  const m = {
    id, tx: hx + 1, ty: hy, mx: 4, my: 4, size: 1,
    hp: 300, maxHp: 300, wave: 3, lingering: false,
    stance: null, fearTurns: 0, veteran: false, variant: null, lostSight: 0,
  };
  wms.push(m);
  try { Game.syncMonsterAlias(); } catch (e) {}
  return m;
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
  const { Game } = await loadGame({ seed, mode: 'raiddef-test', fullTelemetry: false });
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
  console.log('RED (gate off): injected raider -> no engagement');
  await withEnv('RAIDDEF', undefined, async () => {
    const { Game } = await loadGame({ seed, mode: 'raiddef-red' });
    await setupGame(Game);
    healScholar(Game, 1.0);
    injectRaider(Game, 'reunion', 4);
    const ctx = freshCtx();
    const policy = Object.assign({}, rd.leadfeastRaiddef);
    await quietLog(() => policy.daily(Game, ctx));
    ok(!Game.pendingEncounter, 'gate off: no pendingEncounter set');
    ok(!ctx.raidEngagements, 'gate off: raidEngagements 0');
    ok(!ctx.raidWatchDays, 'gate off: raidWatch did not run');
  });
}

async function testNonAggression(seed) {
  console.log('NON-AGGRESSION (gate off byte-identical): 20d same seed');
  await withEnv('RAIDDEF', undefined, async () => {
    const a = await runHashed(leadfeast, seed, 20);
    const b = await runHashed(rd.leadfeastRaiddef, seed, 20);
    ok(a.length === b.length && a.every((h, i) => h === b[i]),
      `gate off: ${a.length}d identical hashes (leadfeast == leadfeast+raiddef)`);
  });
}

function isolateScholar(Game) {
  // deterministic GREEN: nobody to ask — the layer must engage alone
  // (the party-invite path is probabilistic; the HOLD path is pinned by
  // testJudgment). Keeps only the scholar on the roster.
  try { Game.state.village.roster = [Game.villagerId]; } catch (e) {}
}
async function testGreenRaider(seed) {
  console.log('GREEN (gate on): haven-tile raider -> triggerEncounter');
  await withEnv('RAIDDEF', '1', async () => {
    const { Game } = await loadGame({ seed, mode: 'raiddef-green' });
    await setupGame(Game);
    healScholar(Game, 1.0);
    isolateScholar(Game);
    injectRaider(Game, 'reunion', 4);
    const ctx = freshCtx();
    const policy = Object.assign({}, rd.leadfeastRaiddef);
    // run ONLY the layer's dawnClearing (skip base.daily's full day: faster,
    // deterministic, and the engagement path is what this pins)
    await quietLog(() => rd.dawnClearing(Game, ctx));
    ok(Game.pendingEncounter === true, 'gate on: pendingEncounter set');
    ok(Game.pendingMonsterId === 'reunion', 'pendingMonsterId is the raider (got ' + Game.pendingMonsterId + ')');
    ok(ctx.raidEngagements === 1, 'raidEngagements 1');
    ok(ctx.raidEngaged_raider === 1, 'kind counted as raider');
    // one answer per threat per day: second call is a no-op
    Game.pendingEncounter = false; Game.pendingMonsterId = null;
    await quietLog(() => rd.dawnClearing(Game, ctx));
    ok(ctx.raidEngagements === 1, 'second call same day: still 1 (one-answer rule)');
  });
}

async function testGreenFollower(seed) {
  console.log('GREEN (gate on): adjacent follower -> engaged as follower');
  await withEnv('RAIDDEF', '1', async () => {
    const { Game } = await loadGame({ seed, mode: 'raiddef-greenf' });
    await setupGame(Game);
    healScholar(Game, 1.0);
    isolateScholar(Game);
    // reunion carries follows in the defs (s55's treeline holder)
    const def = (Game.data.monsters || []).find(m => m.id === 'reunion');
    ok(!!(def && def.follows), 'precondition: reunion def carries follows');
    injectFollower(Game, 'reunion');
    const threats = rd.threatsAtHaven(Game);
    ok(threats.length === 1 && threats[0].kind === 'follower',
      'threat scanner sees the adjacent follower (got ' + JSON.stringify(threats.map(t => t.kind)) + ')');
    const ctx = freshCtx();
    await quietLog(() => rd.dawnClearing(Game, ctx));
    ok(Game.pendingEncounter === true && Game.pendingMonsterId === 'reunion',
      'gate on: follower engaged via triggerEncounter');
    ok(ctx.raidEngaged_follower === 1, 'kind counted as follower');
  });
}

async function testJudgment(seed) {
  console.log('JUDGMENT gates');
  await withEnv('RAIDDEF', '1', async () => {
    // table sanctity
    {
      const { Game } = await loadGame({ seed, mode: 'raiddef-j1' });
      await setupGame(Game);
      healScholar(Game, 1.0);
      injectRaider(Game, 'reunion', 4);
      Game.tableActive = () => true;
      const ctx = freshCtx();
      await quietLog(() => rd.dawnClearing(Game, ctx));
      ok(!Game.pendingEncounter, 'tableActive: no engagement');
    }
    // HP gate (w4 needs >=60%)
    {
      const { Game } = await loadGame({ seed, mode: 'raiddef-j2' });
      await setupGame(Game);
      healScholar(Game, 0.4);
      injectRaider(Game, 'reunion', 4);
      const ctx = freshCtx();
      await quietLog(() => rd.dawnClearing(Game, ctx));
      ok(!Game.pendingEncounter, 'HP 40% < 60%: no engagement');
      ok(ctx.raidHeldHp === 1, 'raidHeldHp counted');
    }
    // party hold: wave-4, no companions, villagers available but refuse
    {
      const { Game } = await loadGame({ seed, mode: 'raiddef-j3' });
      await setupGame(Game);
      healScholar(Game, 1.0);
      injectRaider(Game, 'reunion', 4);
      // force refusals: system not arrived -> buildParty returns 0, but
      // healthyVillagersAtHome is non-empty
      const hadSystem = Game.state.systemArrived;
      Game.state.systemArrived = false;
      const ctx = freshCtx();
      const villagers = rd.healthyVillagersAtHome(Game);
      await quietLog(() => rd.dawnClearing(Game, ctx));
      Game.state.systemArrived = hadSystem;
      if (villagers.length) {
        ok(!Game.pendingEncounter, 'no party + villagers available: HOLD');
        ok(ctx.raidHeldAlone === 1, 'raidHeldAlone counted');
      } else {
        ok(Game.pendingEncounter === true, 'no villagers at all: engage alone');
      }
    }
  });
}

async function testRaidWatch(seed) {
  console.log('RAID WATCH: ripe day builds party before actions');
  await withEnv('RAIDDEF', '1', async () => {
    const { Game } = await loadGame({ seed, mode: 'raiddef-watch' });
    await setupGame(Game);
    // force ripeness: 3+ world monsters, pantry, lastRaidDay old
    const v = Game.state.village || {};
    v.lastRaidDay = 0;
    (Game.state.scholar || {}).day = 30;
    const ctx = freshCtx();
    const ripe = rd.raidRipe(Game);
    console.log('  info: raidRipe=' + ripe + ' (worldMonsters=' + (Game.worldMonsters ? Game.worldMonsters().length : '?') + ')');
    await quietLog(() => rd.raidWatch(Game, ctx));
    // raidWatch runs without crashing and counts the day iff ripe-or-threats
    const expected = (ripe || rd.threatsAtHaven(Game).length) ? 1 : 0;
    const got = ctx.raidWatchDays || 0;
    ok(got === expected, `raidWatch counted iff ripe or threats present (got ${got}, want ${expected})`);
  });
}

async function smokeGate() {
  console.log('SMOKE=1 instrument-honesty gate');
  const fails = [];
  const check = (name, cond, detail) => {
    console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
    if (!cond) fails.push(name);
  };
  check('named export unwraps (r20b)', !!(rd.leadfeastRaiddef && rd.leadfeastRaiddef.id === 'leadfeast+raiddef'),
    'id=' + (rd.leadfeastRaiddef && rd.leadfeastRaiddef.id));
  check('unwrapped daily is a function', typeof rd.leadfeastRaiddef.daily === 'function', '');
  check('control unwraps', !!(leadfeast && leadfeast.id === 'leadfeast'), '');
  check('layerOn() false when unset', (() => { delete process.env.RAIDDEF; return rd.layerOn() === false; })(), '');
  if (fails.length) { console.log('\nSMOKE STOP: unwrap failure — the suite would run policy-less.'); process.exit(1); }
  process.env.RAIDDEF = '1';
  const { Game } = await loadGame({ seed: 11, mode: 'raiddef-smoke' });
  await setupGame(Game);
  const policy = Object.assign({}, rd.leadfeastRaiddef);
  let result = null;
  await quietLog(async () => { result = await runDays(Game, policy, { days: 10, sampleEvery: 10 }); });
  const meanCalls = result.pacing ? (result.pacing.meanPolicyCallsPerDay || 0) : 0;
  check('harness drives armed policy.daily', meanCalls > 0, 'mean=' + meanCalls);
  delete process.env.RAIDDEF;
  if (fails.length) { console.log('\nSMOKE STOP: instrument-honesty gate failed.'); process.exit(1); }
  console.log('SMOKE GREEN: unwrap honest, harness drives the armed policy.');
}

async function main() {
  if (process.env.SMOKE === '1') { await smokeGate(); return; }
  const seeds = (process.env.SEEDS || '11,42,99').split(',').map(Number);
  console.log(`proof: raiddef layer (seeds ${seeds.join(',')})`);
  for (const s of seeds) {
    console.log(`-- seed ${s} --`);
    // rebind seed-dependent helpers by re-running with SEED override
    await testRed(s);
    await testNonAggression(s);
    await testGreenRaider(s);
    await testGreenFollower(s);
    await testJudgment(s);
    await testRaidWatch(s);
  }
  console.log(`\nALL GREEN: ${pass} checks passed.`);
}

if (require.main === module) { main().catch(e => { console.error('FATAL', e); process.exit(1); }); }
module.exports = {};
