// test-journey-scale-r111-ladder-20261108.js — proof for journey-scale r111.
// Fixture tests for the ladder instrument (wrapper delegation, snapshot
// fields, delivery-order helper, uninstall restore) + a live harness smoke
// leg (97801, DAYCAP 60, /tmp). Green BEFORE any judged sim.
// Usage: node scripts/test-journey-scale-r111-ladder-20261108.js
'use strict';
const assert = require('assert');
const path = require('path');
const fs = require('fs');
const { execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const LI = require(path.join(REPO, 'scripts', 'ladder-instrument-20261108'));

let passed = 0;
function check(name, fn) {
  try { fn(); passed += 1; console.log('ok ' + passed + ' - ' + name); }
  catch (e) { console.error('FAIL - ' + name + '\n  ' + (e && e.stack ? e.stack.split('\n').slice(0, 4).join('\n  ') : e)); process.exitCode = 1; }
}

// --- Fake Game (the ladder's read surface + the two wrapped verbs) --------
function fakeGame(overrides) {
  const g = {
    state: { scholar: { day: 95 }, village: { roster: ['me'] } },
    data: { monsters: [{ id: 'highbeam_deer', wave: 1 }, { id: 'herald', wave: 4 }, { id: 'finale', wave: 5 }] },
    villageLadder: function () {
      return {
        stage: 2, peakStage: 2, counted: 31, cap: 14, nextThreshold: 40, nextStageName: 'National Standing', shortfall: 9,
        tracks: { fight: 9, forage: 6, craft: 4, talk: 8, explore: 7 },
        countedTracks: { fight: 9, forage: 6, craft: 4, talk: 8, explore: 7 },
        capped: [],
        detail: { fightLedger: 18, fieldXp: 72, craftXp: 48, links: 3, contests: 2, discovery: 20, breadth: 12, activeLinks: 4, bundleBonus: 4, bundleStages: [1] },
      };
    },
    ladderCfg: function () { return { thresholds: [12, 24, 40], stageNames: ['Unranked', 'Village Standing', 'Regional Standing', 'National Standing'] }; },
    ladderCapstoneReady: function (kind) {
      if (kind === 'military_tribute') return { kind, ready: true, veterans: 3, need: 2, reason: 'ready' };
      if (kind === 'trade_charter') return { kind, ready: false, charteredLinks: 0, scale: 'regional', reason: 'no-sealed-charter' };
      if (kind === 'feast_embassy') return { kind, ready: false, stage: 2, needStage: 3, bundle: false, reason: 'no-bundle-feast' };
      return { kind, ready: false, reason: 'unknown-capstone' };
    },
    ladderCapstoneDelivered: function () { return null; },
    tableSeat: function () { return { seat: 'lesser', detail: { rank: 'regional' } }; },
    tablePreview: function () { return { ladder: { stage: 2, counted: 31, nextThreshold: 40 } }; },
    ladderDeliverCapstone: function (kind) { g._delivered = kind; return { ok: true, kind, reason: 'delivered' }; },
    startCombat: function (id) { assert.strictEqual(this, g, 'startCombat receives the Game as this'); return 'combat-started'; },
  };
  Object.assign(g, overrides || {});
  return g;
}

check('wrappers forward args and return the original return verbatim', () => {
  const g = fakeGame();
  const orig = { ladderDeliverCapstone: g.ladderDeliverCapstone, startCombat: g.startCombat };
  // Reference passthrough: pin a sentinel and assert the wrapper returns THAT object.
  const deliverRep = { ok: true, kind: 'military_tribute', reason: 'delivered', sentinel: 1 };
  g.ladderDeliverCapstone = function () { return deliverRep; };
  orig.ladderDeliverCapstone = g.ladderDeliverCapstone;
  const li = LI.install(g);
  assert.strictEqual(g.ladderDeliverCapstone('military_tribute'), deliverRep, 'ladderDeliverCapstone return passes through by reference');
  assert.strictEqual(g.startCombat('herald'), 'combat-started', 'startCombat return passes through');
  assert.strictEqual(li.t.deliveries.length, 1, 'one delivery logged');
  assert.strictEqual(li.t.deliveries[0].day, 95, 'delivery day-attributed');
  assert.strictEqual(li.t.deliveries[0].kind, 'military_tribute', 'delivery kind logged');
  assert.strictEqual(li.t.deliveries[0].ok, true, 'delivery ok logged');
  assert.strictEqual(li.t.deliveries[0].reason, 'delivered', 'delivery reason logged');
  assert.strictEqual(li.t.fights.length, 1, 'one fight logged');
  assert.strictEqual(li.t.fights[0].monsterId, 'herald', 'fight monster id logged');
  assert.strictEqual(li.t.fights[0].wave, 4, 'fight wave read from the monster def');
  assert.strictEqual(li.t.errors.length, 0, 'no instrument errors');
  li.uninstall();
  assert.strictEqual(g.ladderDeliverCapstone, orig.ladderDeliverCapstone, 'uninstall restores ladderDeliverCapstone');
  assert.strictEqual(g.startCombat, orig.startCombat, 'uninstall restores startCombat');
});

check('delivery refusal is logged with its reason, not swallowed', () => {
  const g = fakeGame({ ladderDeliverCapstone: function () { return { ok: false, reason: 'veterans-short' }; } });
  const li = LI.install(g);
  g.ladderDeliverCapstone('military_tribute');
  assert.strictEqual(li.t.deliveries.length, 1, 'refusal logged');
  assert.strictEqual(li.t.deliveries[0].ok, false, 'refusal logged as not ok');
  assert.strictEqual(li.t.deliveries[0].reason, 'veterans-short', 'refusal reason kept');
  assert.strictEqual(li.t.errors.length, 0, 'no instrument errors');
  li.uninstall();
});

check('startCombat with no id records a null wave, not a crash', () => {
  const g = fakeGame();
  const li = LI.install(g);
  g.startCombat();
  assert.strictEqual(li.t.fights.length, 1, 'no-id fight logged');
  assert.strictEqual(li.t.fights[0].monsterId, null, 'no-id fight has null id');
  assert.strictEqual(li.t.fights[0].wave, null, 'no-id fight has null wave');
  g.startCombat('unknown_beast');
  assert.strictEqual(li.t.fights[1].wave, null, 'unknown def has null wave');
  assert.strictEqual(li.t.errors.length, 0, 'no instrument errors');
  li.uninstall();
});

check('snapshot reads the full ladder state', () => {
  const g = fakeGame();
  const li = LI.install(g);
  li.snapshot({});
  assert.strictEqual(li.t.daily.length, 1, 'one daily row');
  const d = li.t.daily[0];
  assert.strictEqual(d.day, 95, 'day');
  assert.strictEqual(d.stage, 2, 'stage read');
  assert.strictEqual(d.peakStage, 2, 'peak stage read');
  assert.strictEqual(d.counted, 31, 'counted read');
  assert.strictEqual(d.cap, 14, 'cap read');
  assert.strictEqual(d.nextThreshold, 40, 'next threshold read');
  assert.strictEqual(d.nextStageName, 'National Standing', 'next stage name read');
  assert.strictEqual(d.shortfall, 9, 'shortfall read');
  assert.deepStrictEqual(d.tracks, { fight: 9, forage: 6, craft: 4, talk: 8, explore: 7 }, 'tracks read');
  assert.deepStrictEqual(d.countedTracks, { fight: 9, forage: 6, craft: 4, talk: 8, explore: 7 }, 'counted tracks read');
  assert.deepStrictEqual(d.capped, [], 'capped read');
  assert.strictEqual(d.detail.bundleBonus, 4, 'bundle bonus read');
  assert.deepStrictEqual(d.detail.bundleStages, [1], 'bundle stages read');
  assert.deepStrictEqual(d.thresholds, [12, 24, 40], 'live thresholds read');
  assert.strictEqual(d.capstones.military_tribute.ready, true, 'tribute ready read');
  assert.strictEqual(d.capstones.military_tribute.veterans, 3, 'tribute veterans read');
  assert.strictEqual(d.capstones.trade_charter.ready, false, 'charter not ready read');
  assert.strictEqual(d.capstones.trade_charter.reason, 'no-sealed-charter', 'charter reason kept');
  assert.strictEqual(d.capstones.feast_embassy.reason, 'no-bundle-feast', 'embassy reason kept');
  assert.strictEqual(d.delivered, null, 'nothing delivered reads null');
  assert.strictEqual(d.seat, 'lesser', 'seat read');
  assert.deepStrictEqual(d.previewLadder, { stage: 2, counted: 31, nextThreshold: 40 }, 'preview ladder block read');
  assert.strictEqual(li.t.errors.length, 0, 'no instrument errors');
  li.uninstall();
});

check('snapshot survives missing optionals (no ladder, no preview)', () => {
  const g = fakeGame();
  delete g.villageLadder;
  delete g.tablePreview;
  g.ladderCapstoneReady = function () { throw new Error('boom'); };
  const li = LI.install(g);
  li.snapshot({});
  const d = li.t.daily[0];
  assert.strictEqual(d.stage, null, 'missing ladder reads null stage');
  assert.strictEqual(d.previewLadder, null, 'missing preview reads null');
  assert.strictEqual(d.capstones.military_tribute, null, 'throwing readiness reads null');
  assert.ok(li.t.errors.length > 0, 'readiness throw recorded as an instrument error');
  li.uninstall();
});

check('pickCapstoneOrder is free-before-costly and null when nothing is ready', () => {
  assert.strictEqual(LI.pickCapstoneOrder({ trade_charter: { ready: true }, feast_embassy: { ready: true }, military_tribute: { ready: true } }), 'trade_charter', 'charter first when all ready');
  assert.strictEqual(LI.pickCapstoneOrder({ trade_charter: { ready: false }, feast_embassy: { ready: true }, military_tribute: { ready: true } }), 'feast_embassy', 'embassy next when charter not ready');
  assert.strictEqual(LI.pickCapstoneOrder({ trade_charter: { ready: false }, feast_embassy: { ready: false }, military_tribute: { ready: true } }), 'military_tribute', 'tribute last');
  assert.strictEqual(LI.pickCapstoneOrder({ trade_charter: { ready: false }, feast_embassy: { ready: false }, military_tribute: { ready: false } }), null, 'null when nothing ready');
  assert.strictEqual(LI.pickCapstoneOrder(null), null, 'null on bad input');
  assert.strictEqual(LI.pickCapstoneOrder({}), null, 'null on empty readiness');
});

check('missing wrapped method is an instrument error, not a crash', () => {
  const g = fakeGame();
  delete g.ladderDeliverCapstone;
  const li = LI.install(g);
  assert.ok(li.t.errors.some(e => /ladderDeliverCapstone/.test(e.where)), 'missing ladderDeliverCapstone recorded');
  li.snapshot({});
  assert.strictEqual(li.t.daily.length, 1, 'snapshot still runs');
  li.uninstall();
});

check('live smoke leg: seed 97801, DAYCAP 60, /tmp — 0 instrument errors, ladder rows present', () => {
  const tmp = fs.mkdtempSync(path.join('/tmp', 'journey-scale-r111-smoke-'));
  execFileSync('node', [path.join(REPO, 'scripts', 'journey-scale-r111-20261108.js')], {
    cwd: REPO,
    env: Object.assign({}, process.env, { SEEDS: '97801', DAYCAP: '60', EVIDIR: tmp }),
    stdio: 'pipe', timeout: 600000,
  });
  const trust = JSON.parse(fs.readFileSync(path.join(tmp, 'journey-scale-r111-trust-97801.json'), 'utf8'));
  assert.ok(trust.census, 'trust json has a census');
  assert.ok(trust.census.ladderChain, 'census carries the ladder-chain rollup');
  assert.strictEqual(trust.census.ladderChain.errors, 0, '0 ladder instrument errors on the smoke leg');
  assert.ok(trust.census.ladderChain.rows > 0, 'ladder daily rows present');
  assert.ok(typeof trust.census.ladderChain.peakStage === 'number', 'ladder peak stage present');
  assert.ok(Number.isFinite(trust.fightsTotal), 'telemetry fightsTotal emitted');
  assert.ok(trust.fightsByWave && typeof trust.fightsByWave === 'object', 'telemetry fightsByWave emitted');
  assert.ok(Number.isFinite(trust.maxGameDay), 'telemetry maxGameDay emitted');
  const chainTxt = fs.readFileSync(path.join(tmp, 'journey-scale-r111-ladder-97801.txt'), 'utf8').split('\n').filter(Boolean);
  assert.ok(chainTxt.length > 0, 'ladder txt has rows');
  assert.ok(/^d\d+ stage=/.test(chainTxt[0]), 'ladder row shape');
  const eventsTxt = fs.readFileSync(path.join(tmp, 'journey-scale-r111-ladderevents-97801.txt'), 'utf8');
  assert.ok(!/INSTRUMENT-ERROR/.test(eventsTxt), 'no instrument errors in the events file');
  const reg = JSON.parse(fs.readFileSync(path.join(tmp, 'journey-scale-r111-regional-97801.json'), 'utf8'));
  assert.ok((reg.daily || []).length > 0, 'regional corpus has rows');
  assert.strictEqual((reg.instrumentErrors || []).length, 0, '0 recorder errors on the smoke leg');
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}
});

console.log(passed + ' passed');
