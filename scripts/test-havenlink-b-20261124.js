// test-havenlink-b-20261124.js — proof test for the foreign-polity
// membership census instrument + analyzer (arm sim-havenlink-b).
// Fixture-based (foreign-primary identification, membership
// listing, BELONG-bar gap decomposition, join-offer classification
// incl. counter terms and Binding costs, link-formation event
// capture incl. orphans, reproduction-field comparison) plus one
// live harness smoke: a fresh loaded game snapshots with the
// havenlink fields present, no instrument errors, and all wraps
// restored on uninstall. No repo writes.
// Usage: node scripts/test-havenlink-b-20261124.js
'use strict';
const path = require('path');
const assert = require('assert');
const AN = require(path.join(__dirname, 'havenlink-b-analyze-20261124'));
const INST = require(path.join(__dirname, 'havenlink-b-instrument-20261124'));

let pass = 0;
function ok(name, fn) { fn(); pass++; console.log('ok ' + pass + ' - ' + name); }

// --- fixture builders (analyzer shape only) ---
function snap(day, over) {
  return Object.assign({
    day: day, havenLinks: [], foreignPolitiesFull: [],
    belongPolity: null, havenPolityFull: null, pendingAccord: null,
    pendingNational: null, nationalLive: false, scaleRefused: false,
  }, over || {});
}
function fp(primary, primaryName, subs, subsNames, day) {
  return { primary: primary, primaryName: primaryName, subs: subs.slice(),
    subsNames: (subsNames || subs).slice(), day: day || 10, size: 1 + subs.length };
}
function hl(other, otherName, over) {
  return Object.assign({ other: other, otherName: otherName, kind: null,
    status: 'active', day: 20, trust: 30, age: 40, seasoned: true,
    role: 'primary', tributeKcalPerWeek: 4000, arrears: 0,
    goodStanding: false, belongGap: { trust: false, arrears: true, age: true, size: false },
    isForeignPrimary: false, foreignPolityOfOther: null }, over || {});
}
function run(over) {
  return Object.assign({ seed: 1, run: 'fixture', days: 100, endReason: 'village-lost',
    won: false, maxWave: 4, scaleRank: 'regional', endUnlockedWave: 4,
    peakBeforeEndCall: 0, peakAfterEndCall: 0, endCallMovedPeak: false,
    daily: [], linkEvents: [], proposeEvents: [], counterEvents: [],
    nationalEvents: [], linkLines: [], instrumentErrors: [] }, over || {});
}

// --- foreign-primary identification ---
ok('link target IS the foreign primary when ids match', function () {
  const c = AN.classifySeed(run({ daily: [
    snap(30, { havenLinks: [hl('village_0', 'Marrow', { isForeignPrimary: true, foreignPolityOfOther: { primary: 'village_0', subs: ['village_1', 'village_2'], size: 3, day: 12 } })],
      foreignPolitiesFull: [fp('village_0', 'Marrow', ['village_1', 'village_2'], ['Ash', 'Birch'], 12)] }),
    snap(60, { havenLinks: [hl('village_0', 'Marrow', { trust: 55, goodStanding: true, belongGap: { trust: true, arrears: true, age: true, size: false }, isForeignPrimary: true, foreignPolityOfOther: { primary: 'village_0', subs: ['village_1', 'village_2'], size: 3, day: 12 } })],
      foreignPolitiesFull: [fp('village_0', 'Marrow', ['village_1', 'village_2'], ['Ash', 'Birch'], 12)] }),
  ] }));
  assert.strictEqual(c.isTargetForeignPrimary, true);
  assert.strictEqual(c.foreignPolity.primary, 'village_0');
  assert.strictEqual(c.foreignPolity.primaryName, 'Marrow');
  assert.deepStrictEqual(c.foreignPolity.subs, ['village_1', 'village_2']);
  assert.strictEqual(c.foreignPolity.maxSize, 3);
  assert.strictEqual(c.havenLink.first.other, 'village_0');
  assert.strictEqual(c.havenLink.first.otherName, 'Marrow');
});

ok('link target is NOT the foreign primary when ids differ', function () {
  const c = AN.classifySeed(run({ daily: [
    snap(30, { havenLinks: [hl('village_3', 'Cinder', { isForeignPrimary: false })],
      foreignPolitiesFull: [fp('village_0', 'Marrow', ['village_1'], ['Ash'], 12)] }),
  ] }));
  assert.strictEqual(c.isTargetForeignPrimary, false);
  assert.strictEqual(c.havenMember, 'not-a-member');
  assert.strictEqual(c.havenMemberDetail.linkTarget, 'village_3');
  assert.strictEqual(c.belongGap.notApplicable, 'link target is not the foreign primary');
  assert.strictEqual(c.belongGap.foreignPrimary, 'village_0');
});

// --- membership listing ---
ok('subordinate to the foreign primary with a belong polity reads as member', function () {
  const c = AN.classifySeed(run({ daily: [
    snap(60, { havenLinks: [hl('village_0', 'Marrow', { role: 'subordinate', trust: 55, goodStanding: true, belongGap: { trust: true, arrears: true, age: true, size: true }, isForeignPrimary: true })],
      foreignPolitiesFull: [fp('village_0', 'Marrow', ['village_1', 'village_2', 'village_3'], ['Ash', 'Birch', 'Cinder'], 12)],
      belongPolity: { primary: 'village_0', primaryName: 'Marrow', villages: ['village_0', 'haven', 'village_1', 'village_2', 'village_3'], size: 5, shape: 'belong' } }),
  ] }));
  assert.strictEqual(c.havenMember, 'subordinate');
  assert.strictEqual(c.havenMemberDetail.primary, 'village_0');
  assert.strictEqual(c.havenMemberDetail.size, 5);
  assert.strictEqual(c.joinPath, 'no-join-path-offered'); // membership already held; no NEW offer staged on this fixture
});

ok('subordinate to the foreign primary without good standing reads as subordinate-not-in-good-standing', function () {
  const c = AN.classifySeed(run({ daily: [
    snap(60, { havenLinks: [hl('village_0', 'Marrow', { role: 'subordinate', trust: 35, goodStanding: false, belongGap: { trust: false, arrears: true, age: true, size: true }, isForeignPrimary: true })],
      foreignPolitiesFull: [fp('village_0', 'Marrow', ['village_1', 'village_2', 'village_3'], ['Ash', 'Birch', 'Cinder'], 12)] }),
  ] }));
  assert.strictEqual(c.havenMember, 'subordinate-not-in-good-standing');
  assert.strictEqual(c.havenMemberDetail.belongGap.trust, false);
});

// --- BELONG-bar gap decomposition ---
ok('BELONG gap counts met days per bar when linked to the foreign primary', function () {
  const days = [];
  for (let d = 20; d <= 29; d++) {
    // trust climbs 40..49 (short throughout), arrears 0, age 20+ (met), size 3+1 (met)
    days.push(snap(d, { havenLinks: [hl('village_0', 'Marrow', { trust: 30 + d, age: d, isForeignPrimary: true,
      belongGap: { trust: false, arrears: true, age: true, size: true },
      foreignPolityOfOther: { primary: 'village_0', subs: ['village_1', 'village_2'], size: 3, day: 12 } })],
      foreignPolitiesFull: [fp('village_0', 'Marrow', ['village_1', 'village_2'], ['Ash', 'Birch'], 12)] }));
  }
  const c = AN.classifySeed(run({ daily: days }));
  assert.strictEqual(c.belongGap.days.n, 10);
  assert.strictEqual(c.belongGap.days.trust, 0);
  assert.strictEqual(c.belongGap.days.arrears, 10);
  assert.strictEqual(c.belongGap.days.age, 10);
  assert.strictEqual(c.belongGap.days.size, 10);
  assert.strictEqual(c.belongGap.days.all, 0);
  assert.strictEqual(c.belongGap.last.trust, 59);
});

// --- join-offer classification ---
ok('binding staged classifies with the swear/serve costs', function () {
  const c = AN.classifySeed(run({
    daily: [snap(70, { pendingNational: { shape: 'belong', day: 70, primary: 'village_0' },
      foreignPolitiesFull: [fp('village_0', 'Marrow', ['village_1', 'village_2', 'village_3'], ['Ash', 'Birch', 'Cinder'], 12)] })],
    nationalEvents: [{ day: 70, kind: 'staged', shape: 'belong', primary: 'village_0', primaryName: 'Marrow', villages: ['village_0', 'haven', 'village_1', 'village_2', 'village_3'] }],
  }));
  assert.strictEqual(c.joinPath, 'binding-staged');
  assert.ok(c.joinPathDetail.costNote.indexOf('3,000 kcal') >= 0);
  assert.strictEqual(c.pendingNationalEver, true);
});

ok('counter asking Haven to bow classifies with the tribute price', function () {
  const c = AN.classifySeed(run({
    daily: [snap(40, { foreignPolitiesFull: [fp('village_0', 'Marrow', ['village_1'], ['Ash'], 12)] })],
    counterEvents: [{ day: 40, target: 'village_0', targetName: 'Marrow', asSubordinate: true, tributeKcalPerWeek: 6000, terms: "They'll take Haven — but the tribute is 6,000 kcal/week." }],
  }));
  assert.strictEqual(c.joinPath, 'counter-offered');
  assert.strictEqual(c.joinPathDetail.counters[0].tributeKcalPerWeek, 6000);
});

ok('subordinate link formed classifies with tribute + caller', function () {
  const c = AN.classifySeed(run({
    daily: [snap(45, { havenLinks: [hl('village_0', 'Marrow', { role: 'subordinate', isForeignPrimary: true })],
      foreignPolitiesFull: [fp('village_0', 'Marrow', ['village_1', 'village_2'], ['Ash', 'Birch'], 12)] })],
    linkEvents: [{ day: 45, target: 'village_0', targetName: 'Marrow', asSubordinate: true, tributeKcalPerWeek: 6000, formed: true, caller: 'bond-initiation.js' }],
  }));
  assert.strictEqual(c.joinPath, 'subordinate-link-formed');
  assert.strictEqual(c.joinPathDetail.formed[0].tributeKcalPerWeek, 6000);
  assert.deepStrictEqual(c.orphanLinkEvents, []);
});

ok('no join path offered states the reason', function () {
  const c = AN.classifySeed(run({ daily: [
    snap(30, { havenLinks: [hl('village_3', 'Cinder', { isForeignPrimary: false })],
      foreignPolitiesFull: [fp('village_0', 'Marrow', ['village_1'], ['Ash'], 12)] }),
  ] }));
  assert.strictEqual(c.joinPath, 'no-join-path-offered');
  assert.ok(c.joinPathDetail.reasons.some(function (r) { return r.indexOf('Cinder') >= 0 && r.indexOf('Marrow') >= 0; }));
  assert.strictEqual(c.unclassified, false);
});

ok('no foreign polity + no link still classifies (0 UNCLASSIFIED)', function () {
  const c = AN.classifySeed(run({ scaleRank: 'village', days: 36, daily: [snap(10), snap(20), snap(36)] }));
  assert.strictEqual(c.foreignPolity, null);
  assert.strictEqual(c.havenLink.first, null);
  assert.strictEqual(c.isTargetForeignPrimary, null);
  assert.strictEqual(c.havenMember, 'not-a-member');
  assert.strictEqual(c.joinPath, 'no-join-path-offered');
  assert.strictEqual(c.unclassified, false);
});

// --- link-formation event capture / orphans ---
ok('orphan _formLink event (no matching snapshot link) flags UNCLASSIFIED', function () {
  const c = AN.classifySeed(run({
    daily: [snap(30)],
    linkEvents: [{ day: 30, target: 'village_9', targetName: 'Ghost', asSubordinate: false, tributeKcalPerWeek: 4000, formed: true, caller: 'bond-initiation.js' }],
  }));
  assert.strictEqual(c.orphanLinkEvents.length, 1);
  assert.strictEqual(c.unclassified, true);
  assert.ok(c.unclassifiedReasons.some(function (r) { return r.indexOf('orphan') >= 0; }));
});

// --- reproduction-field comparison ---
function reproRow(day, capped, peak) {
  return { day: day,
    readiness5: { ready: false, armored: 0, armed: 0, tricks: 0, veterans: 0, short: ['veterans'] },
    readiness4: { ready: true },
    standing: { total: capped, war: capped, diplomacy: 0, plenty: 0 },
    capped: capped, peak: peak,
    deferral5: { deferred: false, ready: false }, deferral4: { deferred: false, ready: true },
    ledger: { 3: { points: capped / 25, perType: {}, perTypeX: {} }, 4: { points: 0, perType: {}, perTypeX: {} }, 5: { points: 0, perType: {}, perTypeX: {} } },
    links: [], feasts: [], ladder: null, w4faced: 0, w5faced: 0,
    w3rung: { met: true }, scaleRank: 'regional',
    gatedTotal: capped, holdKind: 'none', deferralMismatch: false,
    pendingNational: null, nationalLive: false, networkLive: true,
    networkLiveDay: 27, scaleRefused: false, havenPolity: null, foreignPolities: 1,
    logW4: [], veteranVids: [], veteranVidsAll: [], veteranRecount: 0, veteranMismatch: false, livingCount: 5 };
}
function reproRun(capped) {
  return { seed: 109301, days: 126, endReason: 'village-lost', won: false,
    scaleRank: 'regional', maxWave: 5, endUnlockedWave: 5,
    peakBeforeEndCall: 5, peakAfterEndCall: 5, endCallMovedPeak: false,
    daily: [reproRow(10, capped, 0), reproRow(80, capped, 5)],
    killEvents: [], feastEvents: [], deathEvents: [], standingLines: [],
    releaseLines: [], saySample: [], instrumentErrors: [] };
}
ok('reproduction check matches identical runs', function () {
  const r = AN.reproductionCheck(reproRun(325), reproRun(325));
  assert.strictEqual(r.match, true);
  assert.deepStrictEqual(r.mismatches, []);
});
ok('reproduction check names the diverged field (bestCapped)', function () {
  const r = AN.reproductionCheck(reproRun(330), reproRun(325));
  assert.strictEqual(r.match, false);
  assert.strictEqual(r.mismatches.length, 1);
  assert.strictEqual(r.mismatches[0].field, 'bestCapped');
  assert.strictEqual(r.mismatches[0].replay, 330);
  assert.strictEqual(r.mismatches[0].pilot, 325);
});
ok('reproduction check names a days divergence', function () {
  const a = reproRun(325); a.days = 125;
  const r = AN.reproductionCheck(a, reproRun(325));
  assert.strictEqual(r.match, false);
  assert.ok(r.mismatches.some(function (m) { return m.field === 'days'; }));
});

// --- live harness smoke ---
(async function liveSmoke() {
  const { loadGame, setupGame } = require(path.join(__dirname, 'sim-harness'));
  const { Game } = await loadGame({ seed: 109301, mode: 'havenlink-b-smoke', fullTelemetry: false });
  await setupGame(Game);
  const sayBefore = Game.say, formLinkBefore = Game._formLink;
  const inst = INST.install(Game);
  assert.notStrictEqual(Game.say, sayBefore, 'say wrapped');
  assert.notStrictEqual(Game._formLink, formLinkBefore, '_formLink wrapped');
  const s = inst.snapshot();
  assert.ok(Array.isArray(s.havenLinks), 'havenLinks array present');
  assert.ok(Array.isArray(s.foreignPolitiesFull), 'foreignPolitiesFull array present');
  assert.ok('belongPolity' in s, 'belongPolity present');
  assert.ok('pendingAccord' in s, 'pendingAccord present');
  assert.ok(Array.isArray(s.links), 'standing snapshot links present (layer intact)');
  assert.ok('capped' in s, 'standing snapshot capped present (layer intact)');
  assert.deepStrictEqual(inst.t.instrumentErrors, [], '0 instrument errors on smoke snapshot');
  inst.uninstall();
  assert.strictEqual(Game.say, sayBefore, 'say restored');
  assert.strictEqual(Game._formLink, formLinkBefore, '_formLink restored');
  const ovs = inst.otherVillages();
  assert.ok(Array.isArray(ovs), 'otherVillages readable after uninstall');
  console.log('ok ' + (++pass) + ' - live smoke: instrument installs, snapshots with havenlink fields, uninstalls clean');
  console.log('PASS ' + pass + '/' + pass);
})().catch(function (e) { console.error(e.stack); process.exit(1); });
