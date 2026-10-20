#!/usr/bin/env node
// test-killattr-20261020.js — proof for the killattr death-attribution
// instrument (arm sim-killeraftermath, diagnostic phase).
//
// FIXTURES (RED→GREEN): F1 env-gating (KILLATTR unset installs nothing);
//   F2 death-time ctx capture (before-hook ordering — the ctx must be read
//   BEFORE playerDeath mutates state; a shallow instrument that records only
//   {day,cause,who} FAILS the mechanism-field assertions RED, the real
//   instrument passes GREEN); F3 recordWaveKill wave-4+ filter + kill ctx;
//   F4 havenRaidTick raid-night ledger join.
// SMOKE: 1 seed x 2 policies x 30d — 0 engine errors, 0 instrument errors.
// DET: 1 seed x 2 policies x 30d — instrument-on vs instrument-off
//   dayHash trajectories byte-identical.
//
// Node harness rules: Math.random seeded before eval (loadGame), full
// src/js list minus DOM-only, Game.save never stubbed. Never run concurrent
// jest; use --cacheDirectory=/tmp/jest-cache-sim-killeraftermath.
//
// Usage: node scripts/test-killattr-20261020.js
'use strict';
// The w5path substrate probe gates at REQUIRE time — set env before requires.
const _savedEnv = {};
for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER', 'NODEWITNESS']) {
  _savedEnv[k] = process.env[k]; process.env[k] = '1';
}
_savedEnv.SEATDRIVE = process.env.SEATDRIVE; process.env.SEATDRIVE = '0';
for (const k of ['VETREL', 'REPOSITION', 'VETSHAPE']) { _savedEnv[k] = process.env[k]; delete process.env[k]; }
const assert = require('assert');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { dayHash } = require(path.join(REPO, 'scripts', 'det-gate'));
const KA = require(path.join(REPO, 'scripts', 'killattr-instrument-20261020'));
const SW = require(path.join(REPO, 'scripts', 'probe-w5path-20261019'));

let passed = 0, failed = 0;
function check(name, fn) {
  try { fn(); passed++; console.log(`  ok ${name}`); }
  catch (e) { failed++; console.log(`  FAIL ${name}: ${e.message}`); }
}

async function freshGame(seed) {
  const { Game } = await loadGame({ seed, mode: 'killattr-test', fullTelemetry: false });
  await setupGame(Game);
  return Game;
}

// F2's RED counterpart: a shallow instrument that only records {day,cause,who}.
function shallowInstall(Game, t) {
  t.deaths = [];
  const o = Game.playerDeath;
  Game.playerDeath = function (cause) {
    let day = 0, who = null;
    try { day = ((Game.state || {}).scholar || {}).day | 0; } catch (e) {}
    try { who = Game.villagerId; } catch (e) {}
    t.deaths.push({ day, cause: String(cause || 'unknown'), who });
    return o.apply(this, arguments);
  };
  return () => { Game.playerDeath = o; };
}

const MECH_FIELDS = ['atHaven', 'inTb', 'onExped', 'loc', 'arena', 'raidNight', 'noFlee', 'opps', 'allies'];
function assertMechFields(rec, label) {
  for (const f of MECH_FIELDS) assert(rec[f] !== undefined, `${label}: missing mechanism field '${f}'`);
}

async function fixtures() {
  console.log('fixtures:');
  // F1: env gating — unset installs nothing.
  {
    const Game = await freshGame(70001);
    const before = Game.playerDeath;
    const t = {};
    const saved = process.env.KILLATTR;
    delete process.env.KILLATTR;
    let un;
    if (KA.instrumentOn()) un = KA.install(Game, t);
    if (saved !== undefined) process.env.KILLATTR = saved;
    check('F1 env-gate: unset installs nothing', () => {
      assert(!KA.instrumentOn(), 'instrumentOn() false with KILLATTR unset');
      assert.strictEqual(Game.playerDeath, before, 'playerDeath untouched');
    });
    if (un) un();
  }
  // F2 RED: shallow instrument fails the mechanism assertions.
  {
    const Game = await freshGame(70002);
    const t = {};
    const un = shallowInstall(Game, t);
    let red = false;
    try { Game.playerDeath('test-red'); } catch (e) {}
    try { assertMechFields(t.deaths[0] || {}, 'shallow'); } catch (e) { red = true; }
    un();
    check('F2 RED: shallow instrument lacks mechanism fields', () => {
      assert(red, 'expected the shallow instrument to fail the mechanism assertions');
      assert(t.deaths.length >= 1, 'shallow instrument recorded the death');
    });
  }
  // F2 GREEN: real instrument captures full death ctx before mutation.
  {
    const saved = process.env.KILLATTR; process.env.KILLATTR = '1';
    const Game = await freshGame(70003);
    const t = {};
    const un = KA.install(Game, t);
    const vidBefore = Game.villagerId;
    try { Game.playerDeath('test-green'); } catch (e) {}
    const rec = t.deaths[0] || {};
    un();
    if (saved === undefined) delete process.env.KILLATTR; else process.env.KILLATTR = saved;
    check('F2 GREEN: real instrument captures mechanism fields', () => {
      assert(t.deaths.length >= 1, 'death recorded');
      assert.strictEqual(rec.cause, 'test-green', 'cause captured');
      assert.strictEqual(String(rec.who), String(vidBefore), 'who captured before mantle pass');
      assertMechFields(rec, 'real');
      assert.strictEqual(typeof rec.atHaven, 'boolean', 'atHaven is boolean');
      assert.strictEqual(rec.instrumentErrors === undefined, true, 'no instrumentErrors field on rec');
    });
    check('F2 GREEN: uninstall restores originals', () => {
      assert.strictEqual((t.instrumentErrors || []).length, 0, 'zero instrument errors');
    });
  }
  // F3: recordWaveKill wave-4+ filter + kill ctx.
  {
    const saved = process.env.KILLATTR; process.env.KILLATTR = '1';
    const Game = await freshGame(70004);
    const t = {};
    const un = KA.install(Game, t);
    const vid = Game.villagerId;
    Game.recordWaveKill('strike', vid, 'player', null);      // wave 4 — kept
    Game.recordWaveKill('highbeam_deer', vid, 'player', null); // wave 1 — dropped
    un();
    if (saved === undefined) delete process.env.KILLATTR; else process.env.KILLATTR = saved;
    check('F3: wave-4+ kills captured, wave-1 dropped', () => {
      assert.strictEqual(t.kills.length, 1, `expected 1 kill, got ${t.kills.length}`);
      const k = t.kills[0];
      assert.strictEqual(k.mid, 'strike', 'mid captured');
      assert(k.wave >= 4, 'wave>=4');
      assert.strictEqual(String(k.by), String(vid), 'by vid captured');
      assert(k.ctx && typeof k.ctx.atHaven === 'boolean', 'kill ctx present');
      assert('scholarHp' in (k.ctx || {}), 'kill walkout HP present');
    });
  }
  // F4: havenRaidTick raid-night ledger join.
  {
    const saved = process.env.KILLATTR; process.env.KILLATTR = '1';
    const Game = await freshGame(70005);
    const t = {};
    const un = KA.install(Game, t);
    let fired = null;
    try { fired = Game.havenRaidTick(); } catch (e) {}
    const day = ((Game.state || {}).scholar || {}).day | 0;
    let deathRec = null;
    try { Game.playerDeath('test-raidjoin'); } catch (e) {}
    deathRec = t.deaths[t.deaths.length - 1] || {};
    un();
    if (saved === undefined) delete process.env.KILLATTR; else process.env.KILLATTR = saved;
    check('F4: raid-night ledger + death join', () => {
      assert(t.raidNights.length >= 1, 'raid night recorded');
      if (fired) assert.strictEqual(deathRec.raidNight, true, 'same-day death joins the raid night');
      else assert.strictEqual(deathRec.raidNight, false, 'no raid night, no join');
    });
  }
}

async function smokeDet() {
  console.log('smoke+det:');
  // Env already set at require time (top of file); ensure KILLATTR for live arm.
  const savedKattr = process.env.KILLATTR; process.env.KILLATTR = '1';
  const seed = 65111, policies = ['leadfeast', 'belongfeast'];
  try {
    for (const policyId of policies) {
      const live = { hashes: [], instErr: 0 };
      const bare = { hashes: [] };
      // live: instrument installed.
      {
        const policy = SW.policyFor(policyId);
        const { Game } = await loadGame({ seed, mode: 'killattr-test', fullTelemetry: false });
        const t = {};
        KA.install(Game, t);
        await setupGame(Game);
        const oDaily = policy.daily;
        const pol = Object.assign({}, policy);
        pol.daily = (G, ctx) => {
          let r; if (oDaily) { try { r = oDaily(G, ctx); } catch (e) {} }
          try { live.hashes.push(dayHash(G)); } catch (e) {}
          return r;
        };
        await quietLog(async () => { await runDays(Game, pol, { days: 30, manifest: undefined, sampleEvery: 30 }); });
        live.instErr = (t.instrumentErrors || []).length;
        check(`SMOKE ${policyId}: 0 instrument errors`, () => { assert.strictEqual(live.instErr, 0, `instrument errors: ${live.instErr}`); });
      }
      // bare: no instrument.
      {
        const policy = SW.policyFor(policyId);
        const { Game } = await loadGame({ seed, mode: 'killattr-test', fullTelemetry: false });
        await setupGame(Game);
        const oDaily = policy.daily;
        const pol = Object.assign({}, policy);
        pol.daily = (G, ctx) => {
          let r; if (oDaily) { try { r = oDaily(G, ctx); } catch (e) {} }
          try { bare.hashes.push(dayHash(G)); } catch (e) {}
          return r;
        };
        await quietLog(async () => { await runDays(Game, pol, { days: 30, manifest: undefined, sampleEvery: 30 }); });
      }
      check(`DET ${policyId}/s65111 byte-identical`, () => {
        assert(live.hashes.length > 0, 'hashes recorded');
        assert.strictEqual(JSON.stringify(live.hashes), JSON.stringify(bare.hashes), 'trajectories must be byte-identical');
      });
    }
  } finally {
    // Restore: KILLATTR to pre-run, then the substrate env to pre-script.
    if (savedKattr === undefined) delete process.env.KILLATTR; else process.env.KILLATTR = savedKattr;
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
