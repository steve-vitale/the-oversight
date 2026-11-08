// test-journey-scale-r110-feastchain-20261107.js — proof for journey-scale r110.
// Fixture tests for the feast-chain instrument (wrapper delegation, snapshot
// fields, uninstall restore) + a live harness smoke leg (97001, DAYCAP 60,
// /tmp). Green BEFORE any judged sim.
// Usage: node scripts/test-journey-scale-r110-feastchain-20261107.js
'use strict';
const assert = require('assert');
const path = require('path');
const fs = require('fs');
const { execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const FC = require(path.join(REPO, 'scripts', 'feastchain-instrument-20261107'));

let passed = 0;
function check(name, fn) {
  try { fn(); passed += 1; console.log('ok ' + passed + ' - ' + name); }
  catch (e) { console.error('FAIL - ' + name + '\n  ' + (e && e.stack ? e.stack.split('\n').slice(0, 4).join('\n  ') : e)); process.exitCode = 1; }
}

// --- Fake Game (the chain's read surface + the five wrapped verbs) --------
function fakeGame(overrides) {
  const g = {
    state: {
      scholar: {
        day: 5,
        feastDay: 4,
        feastBuff: { untilDay: 7, used: false },
        prog: { feastSurge: 2.25, feastSurgeUsed: false },
        abilities: [{ id: 'a', level: 3 }, { id: 'b', level: 1 }],
        backgroundAbilities: [],
      },
      village: {
        pantry: [{ kcalEach: 100, units: 10 }],
        gives: { me: 5000 },
        roster: ['me', 'rosa'],
      },
    },
    villagerId: 'me',
    progState: function () { return { sentimentTaught: true, slotMoments: { 60: true }, surgeResonance: 20 }; },
    channelReadyKeepsakes: function () { return [{ id: 'k1' }]; },
    fusionReactorOnline: function () { return false; },
    feastPlan: function () { return { ok: true, cost: 2000, have: 5000 }; },
    feastedActive: function () { return true; },
    hostFeast: function () { return { ok: true }; },
    grantFeastBuff: function () { return { granted: true, quality: 1 }; },
    channelSentiment: function (idx) { g.state.scholar.prog.feastSurge = 1.5; return 'channeled'; },
    noteFeastedCombatUse: function () { g._deedMarked = true; },
    startCombat: function (id) { assert.strictEqual(this, g, 'startCombat receives the Game as this'); return 'combat-started'; },
  };
  Object.assign(g, overrides || {});
  return g;
}

check('wrappers forward args and return the original return verbatim', () => {
  const g = fakeGame();
  const orig = { hostFeast: g.hostFeast, grantFeastBuff: g.grantFeastBuff, channelSentiment: g.channelSentiment, noteFeastedCombatUse: g.noteFeastedCombatUse, startCombat: g.startCombat };
  // Reference passthrough: the fake returns a fresh literal per call, so
  // pin a sentinel and assert the wrapper returns THAT object.
  const feastRep = { ok: true, sentinel: 1 };
  g.hostFeast = function () { return feastRep; };
  orig.hostFeast = g.hostFeast;
  const fc = FC.install(g);
  assert.strictEqual(g.hostFeast(), feastRep, 'hostFeast return passes through by reference');
  assert.strictEqual(g.grantFeastBuff({ quality: 1 }).granted, true, 'grantFeastBuff return passes through');
  assert.strictEqual(g.channelSentiment(0), 'channeled', 'channelSentiment return passes through');
  assert.strictEqual(g.startCombat('deer_1'), 'combat-started', 'startCombat return passes through');
  g.noteFeastedCombatUse();
  assert.strictEqual(g._deedMarked, true, 'noteFeastedCombatUse reached the original');
  assert.strictEqual(fc.t.calls.length, 1, 'one feast call logged');
  assert.strictEqual(fc.t.calls[0].day, 5, 'feast call day-attributed');
  assert.strictEqual(fc.t.calls[0].ok, true, 'feast call ok logged');
  assert.strictEqual(fc.t.grants.length, 1, 'one grant logged');
  assert.strictEqual(fc.t.grants[0].granted, true, 'grant logged as granted');
  assert.strictEqual(fc.t.grants[0].quality, 1, 'grant quality logged');
  assert.strictEqual(fc.t.channels.length, 1, 'one channel logged');
  assert.strictEqual(fc.t.channels[0].resonance, 20, 'channel resonance-after logged');
  assert.strictEqual(fc.t.channels[0].armed, true, 'channel armed-after logged');
  assert.strictEqual(fc.t.deeds.length, 1, 'one deed marking logged');
  assert.strictEqual(fc.t.deeds[0].day, 5, 'deed day-attributed');
  assert.strictEqual(fc.t.fights.length, 1, 'one fight logged');
  assert.strictEqual(fc.t.fights[0].monsterId, 'deer_1', 'fight monster id logged');
  assert.strictEqual(fc.t.fights[0].feasted, true, 'fight feasted state logged');
  assert.strictEqual(fc.t.errors.length, 0, 'no instrument errors');
  fc.uninstall();
  assert.strictEqual(g.hostFeast, orig.hostFeast, 'uninstall restores hostFeast');
  assert.strictEqual(g.grantFeastBuff, orig.grantFeastBuff, 'uninstall restores grantFeastBuff');
  assert.strictEqual(g.startCombat, orig.startCombat, 'uninstall restores startCombat');
});

check('grant refusal is logged with its reason, not swallowed', () => {
  const g = fakeGame({ grantFeastBuff: function () { return { granted: false, why: 'Feast buff refused: devotion gate.' }; } });
  const fc = FC.install(g);
  g.grantFeastBuff({});
  assert.strictEqual(fc.t.grants.length, 1, 'refusal logged');
  assert.strictEqual(fc.t.grants[0].granted, false, 'refusal logged as not granted');
  assert.ok(/devotion gate/.test(fc.t.grants[0].why), 'refusal reason kept');
  assert.strictEqual(fc.t.errors.length, 0, 'no instrument errors');
  fc.uninstall();
});

check('snapshot reads the full chain state (feasted window live)', () => {
  const g = fakeGame();
  const fc = FC.install(g);
  fc.snapshot({ feasts: 2, surplusFeasts: 1, devotionChannels: 3 });
  assert.strictEqual(fc.t.daily.length, 1, 'one daily row');
  const d = fc.t.daily[0];
  assert.strictEqual(d.day, 5, 'day');
  assert.strictEqual(d.sentiment, true, 'sentimentTaught read');
  assert.strictEqual(d.slot60, true, 'slot60 read');
  assert.strictEqual(d.keepsakes, 1, 'keepsakes ready counted');
  assert.strictEqual(d.resonance, 20, 'resonance read');
  assert.strictEqual(d.l3, 1, 'L3 count read');
  assert.strictEqual(d.armed, true, 'armed read');
  assert.strictEqual(d.armedValue, 2.25, 'armed value read');
  assert.strictEqual(d.reactor, false, 'reactor read');
  assert.strictEqual(d.pantry, 1000, 'pantry summed');
  assert.strictEqual(d.gives, 5000, 'gives read');
  assert.strictEqual(d.feastDay, 4, 'feastDay read');
  assert.strictEqual(d.feasts, 2, 'feasts from ctx');
  assert.strictEqual(d.surplusFeasts, 1, 'surplus feasts from ctx');
  assert.strictEqual(d.devotionChannels, 3, 'devotion channels from ctx');
  assert.strictEqual(d.feasted, true, 'feasted: day 5 < untilDay 7');
  assert.strictEqual(d.buffUsed, false, 'buff unused');
  assert.strictEqual(d.buffUntil, 7, 'buff until read');
  assert.strictEqual(d.surgeUsed, false, 'surge unused');
  assert.strictEqual(d.planOk, true, 'plan ok read');
  assert.strictEqual(d.planCost, 2000, 'plan cost read');
  assert.strictEqual(d.planHave, 5000, 'plan have read');
  assert.strictEqual(fc.t.errors.length, 0, 'no instrument errors');
  fc.uninstall();
});

check('snapshot reads feasted false once the window has passed', () => {
  const g = fakeGame();
  g.state.scholar.feastBuff.untilDay = 4; // day 5 > untilDay 4
  const fc = FC.install(g);
  fc.snapshot({});
  assert.strictEqual(fc.t.daily[0].feasted, false, 'expired window reads unfeasted');
  assert.strictEqual(fc.t.errors.length, 0, 'no instrument errors');
  fc.uninstall();
});

check('snapshot survives missing optionals (no keepsakes, no plan, unarmed)', () => {
  const g = fakeGame({
    channelReadyKeepsakes: function () { return []; },
    feastPlan: function () { return { ok: false, why: 'You need to be at the haven to host a feast.' }; },
  });
  g.state.scholar.prog = {};
  g.state.scholar.feastBuff = null;
  const fc = FC.install(g);
  fc.snapshot({});
  const d = fc.t.daily[0];
  assert.strictEqual(d.keepsakes, 0, 'no keepsakes reads 0');
  assert.strictEqual(d.armed, false, 'unarmed reads false');
  assert.strictEqual(d.feasted, false, 'no buff reads unfeasted');
  assert.strictEqual(d.planOk, false, 'plan refusal read');
  assert.ok(/haven/.test(d.planWhy), 'plan refusal reason kept');
  assert.strictEqual(fc.t.errors.length, 0, 'no instrument errors');
  fc.uninstall();
});

check('missing wrapped method is an instrument error, not a crash', () => {
  const g = fakeGame();
  delete g.grantFeastBuff;
  const fc = FC.install(g);
  assert.ok(fc.t.errors.some(e => /grantFeastBuff/.test(e.where)), 'missing grantFeastBuff recorded');
  fc.snapshot({});
  assert.strictEqual(fc.t.daily.length, 1, 'snapshot still runs');
  fc.uninstall();
});

check('live smoke leg: seed 97001, DAYCAP 60, /tmp — 0 instrument errors, feast-chain rows present', () => {
  const tmp = fs.mkdtempSync(path.join('/tmp', 'journey-scale-r110-smoke-'));
  execFileSync('node', [path.join(REPO, 'scripts', 'journey-scale-r110-20261107.js')], {
    cwd: REPO,
    env: Object.assign({}, process.env, { SEEDS: '97001', DAYCAP: '60', EVIDIR: tmp }),
    stdio: 'pipe', timeout: 600000,
  });
  const trust = JSON.parse(fs.readFileSync(path.join(tmp, 'journey-scale-r110-trust-97001.json'), 'utf8'));
  assert.ok(trust.census, 'trust json has a census');
  assert.ok(trust.census.feastChain, 'census carries the feast-chain rollup');
  assert.strictEqual(trust.census.feastChain.errors, 0, '0 feast-chain instrument errors on the smoke leg');
  assert.ok(trust.census.feastChain.rows > 0, 'feast-chain daily rows present');
  const chainTxt = fs.readFileSync(path.join(tmp, 'journey-scale-r110-feastchain-97001.txt'), 'utf8').split('\n').filter(Boolean);
  assert.ok(chainTxt.length > 0, 'feastchain txt has rows');
  assert.ok(/^d\d+ sentiment=/.test(chainTxt[0]), 'feastchain row shape');
  const eventsTxt = fs.readFileSync(path.join(tmp, 'journey-scale-r110-feastevents-97001.txt'), 'utf8');
  assert.ok(!/INSTRUMENT-ERROR/.test(eventsTxt), 'no instrument errors in the events file');
  const reg = JSON.parse(fs.readFileSync(path.join(tmp, 'journey-scale-r110-regional-97001.json'), 'utf8'));
  assert.ok((reg.daily || []).length > 0, 'regional corpus has rows');
  assert.strictEqual((reg.instrumentErrors || []).length, 0, '0 recorder errors on the smoke leg');
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}
});

console.log(passed + ' passed');
