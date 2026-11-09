// test-journey-scale-r112-veteran-20261109.js — proof for journey-scale r112.
// Fixture tests for the r112 ladder instrument (wrapper delegation,
// snapshot fields incl. the veteran-attribution columns, the death
// watch, finalize corpus, delivery-order helper, uninstall restore)
// + a live harness smoke leg (97901, DAYCAP 60, /tmp). Green BEFORE any
// judged sim.
// Usage: node scripts/test-journey-scale-r112-veteran-20261109.js
'use strict';
const assert = require('assert');
const path = require('path');
const fs = require('fs');
const { execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const LI = require(path.join(REPO, 'scripts', 'ladder-instrument-20261109'));

let passed = 0;
function check(name, fn) {
  try { fn(); passed += 1; console.log('ok ' + passed + ' - ' + name); }
  catch (e) { console.error('FAIL - ' + name + '\n  ' + (e && e.stack ? e.stack.split('\n').slice(0, 4).join('\n  ') : e)); process.exitCode = 1; }
}

// --- Fake Game (the ladder's read surface + the two wrapped verbs) --------
function fakeGame(overrides) {
  const g = {
    villagerId: 'me',
    state: {
      scholar: { day: 95 },
      village: { roster: ['me', 'v1', 'v2', 'v3'] },
      // waveKillLog: scholar kill (by = current vid), villager kill,
      // unattributed kill, contest 'player' kill, a wave-3 kill (kept
      // in the finalize dump), and a wave-2 kill (dropped by finalize).
      waveKillLog: [
        { d: 95, mid: 'herald', w: 4, by: 'me', via: 'player', trick: null },
        { d: 94, mid: 'herald', w: 4, by: 'v1', via: 'wild', trick: null },
        { d: 93, mid: 'herald', w: 4, by: null, via: 'unknown', trick: null },
        { d: 92, mid: 'finale', w: 5, by: 'player', via: 'contest', trick: null },
        { d: 90, mid: 'herald', w: 3, by: 'v2', via: 'patrol', trick: null },
        { d: 88, mid: 'deer', w: 2, by: 'v3', via: 'wild', trick: null },
      ],
      waveKillByChannel: { 'player.w4': 1, 'wild.w4': 1, 'unknown.w4': 1, 'contest.w5': 1 },
    },
    data: { monsters: [{ id: 'highbeam_deer', wave: 1 }, { id: 'herald', wave: 4 }, { id: 'finale', wave: 5 }] },
    vpOf: function (vid) {
      if (vid === 'v2') return { dead: true };
      if (vid === 'v3') return { dead: false };
      if (vid === 'v1') return { dead: false };
      if (vid === 'me') return { dead: false };
      return null;
    },
    sentimentTaught: function () { return true; },
    villageLadder: function () {
      return {
        stage: 2, peakStage: 2, counted: 31, cap: 14, nextThreshold: 40, nextStageName: 'National Standing', shortfall: 9,
        tracks: { fight: 9, forage: 6, craft: 4, talk: 8, explore: 7 },
        countedTracks: { fight: 9, forage: 6, craft: 4, talk: 8, explore: 7 },
        capped: [],
        detail: { fightLedger: 18, fieldXp: 72, craftXp: 48, links: 3, contests: 2, discovery: 20, breadth: 12, activeLinks: 4, bundleBonus: 4, bundleStages: [1], bankedHeadStart: 6 },
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

check('classifyKill: scholar today, scholar yesterday, player literal, villager, unknown', () => {
  assert.strictEqual(LI.classifyKill('me', 'me', 'old'), 'scholar', 'by === today scholar vid');
  assert.strictEqual(LI.classifyKill('old', 'me', 'old'), 'scholar', 'by === yesterday scholar vid (succession day)');
  assert.strictEqual(LI.classifyKill('player', 'me', 'old'), 'scholar', 'by === player literal (contest path)');
  assert.strictEqual(LI.classifyKill('player', null, null), 'scholar', 'player literal with no scholar vids');
  assert.strictEqual(LI.classifyKill('v1', 'me', 'old'), 'villager', 'other vid is a villager kill');
  assert.strictEqual(LI.classifyKill('v1', null, null), 'villager', 'other vid with no scholar map is a villager kill');
  assert.strictEqual(LI.classifyKill(null, 'me', 'old'), 'unknown', 'null by is unknown');
  assert.strictEqual(LI.classifyKill(undefined, 'me', 'old'), 'unknown', 'undefined by is unknown');
  assert.strictEqual(LI.classifyKill('me', null, 'me'), 'scholar', 'yesterday match when today is null');
});

check('snapshot reads the full ladder state + the r112 attribution columns', () => {
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
  assert.strictEqual(d.detail.bankedHeadStart, 6, 'leg-3 banked head start read');
  assert.deepStrictEqual(d.thresholds, [12, 24, 40], 'live thresholds read');
  assert.strictEqual(d.capstones.military_tribute.ready, true, 'tribute ready read');
  assert.strictEqual(d.capstones.military_tribute.veterans, 3, 'tribute veterans read');
  assert.strictEqual(d.capstones.trade_charter.ready, false, 'charter not ready read');
  assert.strictEqual(d.capstones.trade_charter.reason, 'no-sealed-charter', 'charter reason kept');
  assert.strictEqual(d.capstones.feast_embassy.reason, 'no-bundle-feast', 'embassy reason kept');
  assert.strictEqual(d.delivered, null, 'nothing delivered reads null');
  assert.strictEqual(d.seat, 'lesser', 'seat read');
  assert.deepStrictEqual(d.previewLadder, { stage: 2, counted: 31, nextThreshold: 40 }, 'preview ladder block read');
  // R112 columns.
  assert.strictEqual(d.scholarVid, 'me', 'scholar vid read');
  assert.strictEqual(d.sentimentTaught, true, 'sentiment taught read');
  assert.deepStrictEqual(d.killAttr, { w4total: 4, w4scholar: 2, w4villager: 1, w4null: 1, w4distinctVillagers: 1, w4livingVillagers: 1 }, 'killAttr: scholar vid + player literal count as scholar; v1 the one distinct living villager killer');
  assert.strictEqual(li.t.errors.length, 0, 'no instrument errors');
  li.uninstall();
});

check('killAttr keeps a past scholar life\'s kill as scholar after succession', () => {
  const g = fakeGame();
  const li = LI.install(g);
  li.snapshot({}); // day 95, scholar 'me': d95 kill by 'me' is scholar
  assert.strictEqual(li.t.daily[0].killAttr.w4scholar, 2, 'day-95 snapshot: 2 scholar kills');
  // Succession: 'v1' becomes the scholar on day 96. The d95 kill by
  // 'me' must STAY scholar (day-joined rule); the d94 kill by 'v1'
  // stays villager (v1 was a villager that day). v1 is now the scholar,
  // so it no longer counts as a living VILLAGER killer (leg-3 rule).
  g.villagerId = 'v1';
  g.state.scholar.day = 96;
  li.snapshot({});
  const d2 = li.t.daily[1];
  assert.deepStrictEqual(d2.killAttr, { w4total: 4, w4scholar: 2, w4villager: 1, w4null: 1, w4distinctVillagers: 1, w4livingVillagers: 0 }, 'day-96 snapshot: past scholar life still scholar; v1 no longer a living villager killer');
  assert.deepStrictEqual(li.t.scholarVidsByDay, { 95: 'me', 96: 'v1' }, 'scholar-vid map has both lives');
  assert.strictEqual(li.t.errors.length, 0, 'no instrument errors');
  li.uninstall();
});

check('snapshot survives missing optionals (no ladder, no preview, no sentiment)', () => {
  const g = fakeGame();
  delete g.villageLadder;
  delete g.tablePreview;
  delete g.sentimentTaught;
  g.ladderCapstoneReady = function () { throw new Error('boom'); };
  const li = LI.install(g);
  li.snapshot({});
  const d = li.t.daily[0];
  assert.strictEqual(d.stage, null, 'missing ladder reads null stage');
  assert.strictEqual(d.previewLadder, null, 'missing preview reads null');
  assert.strictEqual(d.capstones.military_tribute, null, 'throwing readiness reads null');
  assert.strictEqual(d.sentimentTaught, null, 'missing sentimentTaught reads null');
  assert.strictEqual(d.scholarVid, 'me', 'scholar vid still read');
  assert.ok(d.killAttr, 'killAttr still computed without the ladder');
  assert.ok(li.t.errors.length > 0, 'readiness throw recorded as an instrument error');
  li.uninstall();
});

check('death watch drains the telemetry ring daily (primary) + roster scan (backup), each death once', () => {
  const g = fakeGame();
  // Telemetry ring holds two deaths already (one villager, one monster);
  // the roster scan would also see v2 dead — the drain must win (with a
  // cause) and the roster backup must not double-record v2.
  g.state.telemetry = [
    { type: 'death', day: 93, who: 'v9', cause: 'combat' },
    { type: 'death', day: 94, who: 'v2', cause: 'fever' },
    { type: 'death', day: 94, who: 'monster-x', cause: 'combat' },
    { type: 'birth', day: 94, who: 'v10' },
  ];
  const li = LI.install(g);
  li.snapshot({}); // day 95
  assert.deepStrictEqual(li.t.deaths, [
    { vid: 'v9', day: 93, cause: 'combat' },
    { vid: 'v2', day: 94, cause: 'fever' },
    { vid: 'monster-x', day: 94, cause: 'combat' },
  ], 'telemetry deaths drained with day + cause, non-deaths ignored, roster backup does not double-record v2');
  li.snapshot({}); // same day again: no duplicates
  assert.strictEqual(li.t.deaths.length, 3, 'no duplicate death record on re-snapshot');
  // A new death lands in the ring the next day; the roster backup also
  // sees v1 newly dead (a death path with no telemetry entry).
  g.state.scholar.day = 96;
  g.state.telemetry.push({ type: 'death', day: 96, who: 'v8', cause: 'drowned' });
  g.vpOf = function (vid) { return (vid === 'v1' || vid === 'v2') ? { dead: true } : { dead: false }; };
  li.snapshot({});
  assert.strictEqual(li.t.deaths.length, 5, 'new telemetry death + roster-backup death both recorded');
  assert.deepStrictEqual(li.t.deaths[3], { vid: 'v8', day: 96, cause: 'drowned' }, 'new telemetry death day is the death day');
  assert.deepStrictEqual(li.t.deaths[4], { vid: 'v1', day: 96, cause: null }, 'roster-backup death carries cause null');
  assert.strictEqual(li.t.errors.length, 0, 'no instrument errors');
  li.uninstall();
});

check('finalize dumps waveKillLog (wave>=3 only), channels, scholar map, deaths, final roster', () => {
  const g = fakeGame();
  const li = LI.install(g);
  li.snapshot({});
  const fin = li.finalize();
  assert.strictEqual(fin.waveKillLog.length, 5, 'wave>=3 rows kept (the wave-2 row is dropped)');
  assert.ok(fin.waveKillLog.every(e => (e.w | 0) >= 3), 'no wave<3 row in the dump');
  assert.strictEqual(fin.waveKillLog[0].by, 'me', 'kill rows keep the killer vid');
  assert.strictEqual(fin.waveKillLog[3].by, 'player', 'player-literal row kept verbatim');
  assert.deepStrictEqual(fin.waveKillByChannel, { 'player.w4': 1, 'wild.w4': 1, 'unknown.w4': 1, 'contest.w5': 1 }, 'channel map copied');
  assert.deepStrictEqual(fin.scholarVidsByDay, { 95: 'me' }, 'scholar-vid map has the snapshot day');
  assert.deepStrictEqual(fin.deaths, [{ vid: 'v2', day: 95, cause: null }], 'death watch carried into finalize (roster backup, cause null — no telemetry entry in the fixture)');
  assert.deepStrictEqual(fin.finalRoster, [{ vid: 'me', dead: false }, { vid: 'v1', dead: false }, { vid: 'v2', dead: true }, { vid: 'v3', dead: false }], 'final roster carries dead flags');
  assert.strictEqual(fin.errors.length, 0, 'no instrument errors');
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

check('live smoke leg: seed 97901, DAYCAP 60, /tmp — 0 instrument errors, ladder rows + vetkill corpus present', () => {
  const tmp = fs.mkdtempSync(path.join('/tmp', 'journey-scale-r112-smoke-'));
  execFileSync('node', [path.join(REPO, 'scripts', 'journey-scale-r112-20261109.js')], {
    cwd: REPO,
    env: Object.assign({}, process.env, { SEEDS: '97901', DAYCAP: '60', EVIDIR: tmp }),
    stdio: 'pipe', timeout: 600000,
  });
  const trust = JSON.parse(fs.readFileSync(path.join(tmp, 'journey-scale-r112-trust-97901.json'), 'utf8'));
  assert.ok(trust.census, 'trust json has a census');
  assert.ok(trust.census.ladderChain, 'census carries the ladder-chain rollup');
  assert.strictEqual(trust.census.ladderChain.errors, 0, '0 ladder instrument errors on the smoke leg');
  assert.ok(trust.census.ladderChain.rows > 0, 'ladder daily rows present');
  assert.ok(typeof trust.census.ladderChain.peakStage === 'number', 'ladder peak stage present');
  assert.ok(Number.isFinite(trust.fightsTotal), 'telemetry fightsTotal emitted');
  assert.ok(trust.fightsByWave && typeof trust.fightsByWave === 'object', 'telemetry fightsByWave emitted');
  assert.ok(Number.isFinite(trust.maxGameDay), 'telemetry maxGameDay emitted');
  const chainTxt = fs.readFileSync(path.join(tmp, 'journey-scale-r112-ladder-97901.txt'), 'utf8').split('\n').filter(Boolean);
  assert.ok(chainTxt.length > 0, 'ladder txt has rows');
  assert.ok(/^d\d+ stage=/.test(chainTxt[0]), 'ladder row shape');
  assert.ok(/ scholar=\S+ sent=[01-]/.test(chainTxt[0]), 'ladder row carries scholar/sent columns');
  assert.ok(/ kAttr=w4:\d+\/sch:\d+\/vil:\d+\/null:\d+\/dist:\d+\/liv:\d+/.test(chainTxt[0]), 'ladder row carries killAttr columns');
  const eventsTxt = fs.readFileSync(path.join(tmp, 'journey-scale-r112-ladderevents-97901.txt'), 'utf8');
  assert.ok(!/INSTRUMENT-ERROR/.test(eventsTxt), 'no instrument errors in the events file');
  const vet = JSON.parse(fs.readFileSync(path.join(tmp, 'journey-scale-r112-vetkill-97901.json'), 'utf8'));
  assert.ok(Array.isArray(vet.waveKillLog), 'vetkill corpus has a waveKillLog array');
  assert.ok(vet.waveKillLog.every(e => (e.w | 0) >= 3), 'vetkill rows are wave>=3');
  assert.ok(vet.scholarVidsByDay && typeof vet.scholarVidsByDay === 'object', 'vetkill corpus has the scholar-vid map');
  assert.ok(Object.keys(vet.scholarVidsByDay).length > 0, 'scholar-vid map is non-empty');
  assert.ok(Array.isArray(vet.deaths), 'vetkill corpus has a deaths array');
  assert.ok(Array.isArray(vet.finalRoster), 'vetkill corpus has a final roster');
  assert.strictEqual((vet.instrumentErrors || []).length, 0, '0 instrument errors in the vetkill corpus');
  const reg = JSON.parse(fs.readFileSync(path.join(tmp, 'journey-scale-r112-regional-97901.json'), 'utf8'));
  assert.ok((reg.daily || []).length > 0, 'regional corpus has rows');
  assert.strictEqual((reg.instrumentErrors || []).length, 0, '0 recorder errors on the smoke leg');
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}
});

console.log(passed + ' passed');
