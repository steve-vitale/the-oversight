#!/usr/bin/env node
// test-readiness-audit-20261020.js — proof for the readiness-gate diagnostic
// audit instrument (scripts/probe-readiness-audit-20261020.js).
//
// PROOF OF EFFECT (not just green assertions): the fixtures craft scenarios
// where the GATE's number and the village's TRUE state disagree, and the
// test asserts the census NAMES THE MECHANISM — a gate-parroting instrument
// fails RED on the mechanism assertions. RED->GREEN: run once against a
// stub census that returns only gate numbers to see the RED, then against
// the real censusReadiness for GREEN.
//
// Fixtures (fresh loadGame + setupGame, direct state writes = test setup):
//   F1 armor pack-not-worn: villager carries hide_armor (P20), nothing worn
//      -> gate excludes them; census.armor.near names mech 'pack-not-worn'.
//   F2 armory stock: 3 hunting_spear units in stashState().weapons ->
//      gate armed excludes them; census.weapons.armoryUnits = 3.
//   F3 dead killer: wave-4 kill by a villager who then dies ->
//      gate veterans 0 (VETSHAPE unset = pristine living-only); shadow = 1,
//      killer named with living:false. Asserts process.env.VETSHAPE != '1'.
//   F4 tricks: 3 wave-1/2 counters discovered -> gate tricks 3; wave-3
//      'redactor' discovery returns false (no counter field) -> still 3.
//   F5 carried weapon counts: stone_knife in pack, nothing equipped ->
//      gate armed INCLUDES them (carriesWeapon path); census records
//      carriedNotEquipped >= 1 (the census is honest in both directions).
//   F6 scholar armor: riot_gear (P30) worn -> gate armored includes scholar.
//
// Plus SMOKE (1 seed x 10d live instrument, 0 engine errors, census
// fields present) and DET (instrument-on vs instrument-off byte-identical,
// 1 seed x 2 policies x 30d; the probe's own DET=1 covers 2x60d).
//
// Node harness rules: Math.random seeded before eval (loadGame), full
// src/js list minus DOM-only, Game.save never stubbed. Never run concurrent
// jest; use --cacheDirectory=/tmp/jest-cache-sim-readiness-audit.
//
// Usage: node scripts/test-readiness-audit-20261020.js
'use strict';
const assert = require('assert');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { censusReadiness } = require(path.join(REPO, 'scripts', 'probe-readiness-audit-20261020'));

let passed = 0, failed = 0;
function check(name, fn) {
  try { fn(); passed++; console.log(`  ok ${name}`); }
  catch (e) { failed++; console.log(`  FAIL ${name}: ${e.message}`); }
}

async function freshGame(seed) {
  const { Game } = await loadGame({ seed, mode: 'readiness-audit-test', fullTelemetry: false });
  await setupGame(Game);
  return Game;
}
function livingVillagers(Game) {
  const roster = ((Game.state && Game.state.village && Game.state.village.roster) || []);
  return roster.filter(vid => vid !== Game.villagerId && (() => { try { const vp = Game.vpOf(vid); return !!(vp && !vp.dead); } catch (e) { return false; } })());
}
function vpOf(Game, vid) { return Game.vpOf(vid); }

async function fixtures() {
  console.log('fixtures:');
  // F1: armor in pack, not worn.
  {
    const Game = await freshGame(101);
    const vids = livingVillagers(Game);
    assert(vids.length > 0, 'need living villagers');
    const vid = vids[0];
    const vp = vpOf(Game, vid);
    vp.equipped = {};
    vp.items = ['hide_armor']; // P20, carried not worn
    const c = censusReadiness(Game, 5);
    check('F1 gate excludes pack-armor villager', () => {
      const near = c.armor.near.find(n => String(n.vid) === String(vid));
      assert(near, 'census must name the near-miss villager');
      assert.strictEqual(near.mech, 'pack-not-worn');
      assert.strictEqual(near.p, 20);
      assert.strictEqual(near.item, 'hide_armor');
    });
    check('F1 gate number is the honest count (no phantom armor)', () => {
      // the gate's armored count must NOT include this villager
      const g2 = Game.waveUnlockReady(5);
      assert.strictEqual(c.gate.armored, g2.armored, 'census gate half == engine gate');
    });
  }
  // F2: armory stock invisible to the armed leg.
  {
    const Game = await freshGame(102);
    const vids = livingVillagers(Game);
    const vid = vids[0];
    const vp = vpOf(Game, vid);
    vp.equipped = {}; vp.items = [];
    const st = Game.stashState();
    st.weapons = st.weapons || [];
    st.weapons.push({ itemId: 'hunting_spear', units: 3 });
    const c = censusReadiness(Game, 5);
    check('F2 armory stock counted by census, invisible to gate', () => {
      assert.strictEqual(c.weapons.armoryUnits, 3);
      assert.deepStrictEqual(c.weapons.armoryList, [{ id: 'hunting_spear', units: 3 }]);
    });
  }
  // F3: dead wave-4 killer.
  {
    const Game = await freshGame(103);
    check('F3 VETSHAPE unset (pristine living-only gate)', () => {
      assert(process.env.VETSHAPE !== '1', 'VETSHAPE must not be 1');
    });
    const vids = livingVillagers(Game);
    const vid = vids[0];
    Game.state.waveKillLog = Game.state.waveKillLog || [];
    Game.state.waveKillLog.push({ d: 100, mid: 'redactor', w: 4, by: vid, via: 'patrol', trick: null });
    const vp = vpOf(Game, vid);
    vp.dead = true;
    const c = censusReadiness(Game, 5);
    check('F3 gate veterans 0 for dead killer, shadow 1', () => {
      assert.strictEqual(c.veterans.count, 0, 'living-only gate must not count the dead killer');
      assert.strictEqual(c.veterans.shadow, 1, 'VETSHAPE=1 shadow must count living-or-dead');
      const k = c.veterans.killers.find(x => String(x.vid) === String(vid));
      assert(k, 'killer must be named');
      assert.strictEqual(k.living, false);
      assert.strictEqual(k.firstKillD, 100);
    });
  }
  // F4: tricks — waves 1-2 countable, wave 3 not.
  {
    const Game = await freshGame(104);
    let n = 0;
    for (const mid of ['bulldozer', 'hushwolf', 'gallowdeer']) {
      if (Game.discoverMonsterCounter(mid, 'trick')) n++;
    }
    const red = Game.discoverMonsterCounter('redactor', 'trick');
    const c = censusReadiness(Game, 5);
    check('F4 3 wave-1/2 counters known', () => {
      assert.strictEqual(n, 3);
      assert.strictEqual(c.tricks.count, 3);
      assert.strictEqual(red, false, 'wave-3 discovery must fail closed (no counter field)');
      assert.strictEqual(censusReadiness(Game, 5).tricks.count, 3);
    });
  }
  // F5: carried weapon counts (the leg's honest direction).
  {
    const Game = await freshGame(105);
    const vids = livingVillagers(Game);
    const vid = vids[0];
    const vp = vpOf(Game, vid);
    vp.equipped = {}; vp.items = ['stone_knife'];
    const c = censusReadiness(Game, 5);
    check('F5 carried weapon counts as armed', () => {
      assert(c.weapons.carriedNotEquipped >= 1, 'census must record the carried channel');
      const g = Game.waveUnlockReady(5);
      assert.strictEqual(c.gate.armed, g.armed, 'census gate half == engine gate');
      assert(g.armed >= 1, 'gate must count the carried weapon (carriesWeapon path)');
    });
  }
  // F6: scholar worn armor counts.
  {
    const Game = await freshGame(106);
    Game.state.scholar.equipped = { torso: { itemId: 'riot_gear', name: 'Riot Gear' } };
    const c = censusReadiness(Game, 5);
    check('F6 scholar worn P30 armor counts', () => {
      const g = Game.waveUnlockReady(5);
      assert(g.armored >= 1, 'gate must count the armored scholar');
      assert.strictEqual(c.gate.armored, g.armored, 'census gate half == engine gate');
      assert.strictEqual(c.armor.count, g.armored, 'census armor count == gate');
    });
  }
}

async function smokeDet() {
  console.log('smoke:');
  const probe = require(path.join(REPO, 'scripts', 'probe-readiness-audit-20261020'));
  const env = { FEASTSCALE_R13: '1', TRIBFLOOR: '1', SUCCGRACE: '1', RAIDDENSITY: '1', WINPURSUIT: '1', WINDEFER: '1', SEATDRIVE: '0', NODEWITNESS: '1', KILLDISC: '1' };
  const saved = {};
  for (const k of Object.keys(env)) { saved[k] = process.env[k]; process.env[k] = env[k]; }
  try {
    process.env.DAYS = '10'; process.env.SEEDS = '65111'; process.env.ONLY = 'leadfeast';
    delete process.env.RDAUDIT_BARE;
    const r = await probe.runOne(65111, 'leadfeast', { noWrite: true });
    check('SMOKE live run completes, census present', () => {
      assert(r.endCensus && r.endCensus.gate, 'endCensus with gate numbers');
      assert(typeof r.endCensus.living === 'number', 'living count present');
      assert(r.endCensus.veterans && typeof r.endCensus.veterans.shadow === 'number', 'veteran shadow present');
      assert(r.hashes.length > 0, 'day hashes recorded');
    });
    console.log('det (1 seed x 2 policies x 30d, instrument-on vs off):');
    process.env.DAYS = '30';
    delete process.env.SEEDS; delete process.env.ONLY;
    for (const policyId of ['leadfeast', 'belongfeast']) {
      delete process.env.RDAUDIT_BARE;
      const live = await probe.runOne(65111, policyId, { noWrite: true });
      process.env.RDAUDIT_BARE = '1';
      const bare = await probe.runOne(65111, policyId, { noWrite: true });
      delete process.env.RDAUDIT_BARE;
      check(`DET ${policyId}/s65111 byte-identical`, () => {
        assert.strictEqual(JSON.stringify(live.hashes), JSON.stringify(bare.hashes), 'trajectories must be byte-identical');
        assert(live.hashes.length > 0, 'hashes recorded');
      });
    }
  } finally {
    for (const k of Object.keys(env)) { if (saved[k] === undefined) delete process.env[k]; else process.env[k] = saved[k]; }
    delete process.env.DAYS; delete process.env.SEEDS; delete process.env.ONLY; delete process.env.RDAUDIT_BARE;
  }
}

async function main() {
  await quietLog(async () => { await fixtures(); });
  await smokeDet();
  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed) process.exit(1);
  console.log('PROOF GREEN.');
}
main().catch(e => { console.error('PROOF CRASH:', e); process.exit(2); });
