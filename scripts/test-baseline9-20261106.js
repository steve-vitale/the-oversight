// test-baseline9-20261106.js — proof for sim-baseline9-a (arm sim-baseline9-a).
// Analyzer-only proof over the committed confirm corpus (read-only — this
// test writes nothing into the repo). No game load: the kill-channel
// classification is a pure read of waveKillLog + matched fight rows.
//
// Checks:
//   (A) fixtures — matchKill taxonomy on synthetic rows (companion with the
//       scholar present, wild field kill, pyrrhic lost-row kill, unmatched,
//       'routed' normalization, waveKillLog 'w' field vs killsLive 'wave').
//   (B) corpus — analyzer runs on perseed-stageally-confirm-b with 0
//       instrument errors; headline numbers reproduce the confirm evidence
//       (kills 3 armed / 9 baseline; TB survival 13.5% / 29.4%; ally
//       presence 73.0% / 44.1%); all 12 wave-4 kills classified with
//       matched fight rows, 0 unmatched, 0 pyrrhic.
//   (C) channel answer — both companion kills matched scholar-present with
//       the scholar alive in the winning fight AND a same-day grind trail;
//       the wild kill matched a field vKill with no TB row that day; the
//       53006-d149 1-round solo kill classified scholar-TB with no prior
//       Congregation fight anywhere on that leg (wounded-entry refuted).
//   (D) pooled context — the same analyzer on perseed-stageally-a
//       classifies all 10 pilot kills, 0 unmatched (pooled 11 vs 11).
// Usage: node scripts/test-baseline9-20261106.js  (prints PASS n/n)
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const A = require('./baseline9-analyze-20261106');

const REPO = path.join(__dirname, '..');
const CORPUS = path.join(REPO, 'evidence', '2026-11-06', 'perseed-stageally-confirm-b');
const PILOT = path.join(REPO, 'evidence', '2026-11-06', 'perseed-stageally-a');

let n = 0;
function check(name, fn) { n++; try { fn(); console.log('ok ' + n + ' - ' + name); } catch (e) { console.log('FAIL ' + n + ' - ' + name + ': ' + e.message); process.exitCode = 1; } }
function approx(actual, expected, tol) { assert.ok(Math.abs(actual - expected) <= tol, 'expected ' + expected + ' ±' + tol + ', got ' + actual); }

// ---- (A) fixtures: synthetic corpus rows through matchKill / classifyRow ----
function tbRow(seq, day, mid, outcome, opts) {
  return Object.assign({ seq: seq, day: day, mid: mid, wave: 4, alliesAtEntry: 0, partyAtEntry: 0,
    allyIds: [], partyIds: [], outcome: outcome, scholarDiedInFight: false,
    scholarHpFracEnd: 0.5, monsterHpFracEnd: 0, rounds: 5 }, opts || {});
}

check('A1 companion kill matches scholar-present TB row (scholar alive)', function () {
  const row = { tbFights: [tbRow(1, 10, 'algorithm', 'lost', { monsterHpFracEnd: 0.4, scholarDiedInFight: true, scholarHpFracEnd: -0.1 }),
    tbRow(2, 10, 'algorithm', 'won', { alliesAtEntry: 2, allyIds: ['elena_petrova', 'visjoin_47'], scholarHpFracEnd: 0.36 })],
    fights: [], scholarDeaths: [], waveKillLog: [{ d: 10, mid: 'algorithm', w: 4, by: 'elena_petrova', via: 'companion' }],
    killsLive: [{ day: 10, mid: 'algorithm', wave: 4, by: 'elena_petrova', via: 'companion', scholarChannel: false }] };
  const m = A.matchKill(row, { d: 10, mid: 'algorithm', w: 4, by: 'elena_petrova', via: 'companion' });
  assert.strictEqual(m.kind, 'companion-tb-scholar-present');
  assert.strictEqual(m.fight.seq, 2);
  assert.ok(m.fight.scholarHpFracEnd > 0 && !m.fight.scholarDiedInFight, 'scholar must be alive in the winning fight');
});

check('A2 wild kill matches field vKill, not a TB row', function () {
  const row = { tbFights: [], fights: [{ day: 20, channel: 'field', fighter: 'wanjiru_kamau', mid: 'influencer', wave: 4, outcome: 'vKill' }],
    scholarDeaths: [], waveKillLog: [{ d: 20, mid: 'influencer', w: 4, by: 'wanjiru_kamau', via: 'wild' }],
    killsLive: [{ day: 20, mid: 'influencer', wave: 4, by: 'wanjiru_kamau', via: 'wild', scholarChannel: false }] };
  const m = A.matchKill(row, { d: 20, mid: 'influencer', w: 4, by: 'wanjiru_kamau', via: 'wild' });
  assert.strictEqual(m.kind, 'wild-field');
  assert.strictEqual(m.fight.outcome, 'vKill');
});

check('A3 pyrrhic kill (log-only) matches the lost TB row', function () {
  const row = { tbFights: [tbRow(1, 30, 'strike', 'lost', { monsterHpFracEnd: 0, scholarDiedInFight: true, scholarHpFracEnd: -0.2 })],
    fights: [], scholarDeaths: [], waveKillLog: [{ d: 30, mid: 'strike', w: 4, by: 'gen_x', via: 'player' }], killsLive: [] };
  const c = A.classifyRow({ file: 'x.json', row: row });
  assert.strictEqual(c.kills.length, 1);
  assert.strictEqual(c.kills[0].channel, 'pyrrhic-tb');
  assert.strictEqual(c.kills[0].pyrrhic, true);
});

check('A4 kill with no fight row anywhere is unmatched (never silently classified)', function () {
  const row = { tbFights: [], fights: [], scholarDeaths: [],
    waveKillLog: [{ d: 40, mid: 'eulogy', w: 4, by: 'gen_y', via: 'player' }],
    killsLive: [{ day: 40, mid: 'eulogy', wave: 4, by: 'gen_y', via: 'player', scholarChannel: true }] };
  const m = A.matchKill(row, { d: 40, mid: 'eulogy', w: 4, by: 'gen_y', via: 'player' });
  assert.strictEqual(m.kind, 'unmatched');
});

check('A5 routed normalizes to rout (fightinterior-b D1 taxonomy)', function () {
  assert.strictEqual(A.normOutcome('routed'), 'rout');
  assert.strictEqual(A.normOutcome('won'), 'won');
  assert.strictEqual(A.normOutcome(null), 'unfinished');
});

check('A6 waveKillLog wave field is w, not wave', function () {
  const row = { tbFights: [tbRow(1, 50, 'strike', 'won', { scholarHpFracEnd: 0.9 })],
    fights: [], scholarDeaths: [],
    waveKillLog: [{ d: 50, mid: 'strike', w: 4, by: 'gen_z', via: 'player' }],
    killsLive: [{ day: 50, mid: 'strike', wave: 4, by: 'gen_z', via: 'player', scholarChannel: true }] };
  const c = A.classifyRow({ file: 'x.json', row: row });
  assert.strictEqual(c.kills.length, 1, 'a log row with w:4 must be counted (wave: undefined would miss it)');
  assert.strictEqual(c.kills[0].channel, 'scholar-tb');
});

// ---- (B) corpus: headlines reproduce the confirm evidence ----
const res = A.analyzeDir(CORPUS);
check('B1 analyzer runs on the confirm corpus with 0 instrument errors', function () {
  assert.strictEqual(res.files, 16);
  assert.strictEqual(res.baselineSeeds, 8);
  assert.strictEqual(res.armedSeeds, 8);
  assert.strictEqual(res.instrumentErrors, 0);
});

check('B2 headline kills reproduce: 9 baseline / 3 armed', function () {
  assert.strictEqual(res.byLeg.baseline.kills, 9);
  assert.strictEqual(res.byLeg.staged.kills, 3);
  assert.strictEqual(res.gap, 6);
});

check('B3 TB survival reproduces: 29.4% baseline / 13.5% armed', function () {
  approx(res.byLeg.baseline.tb.tbSurvival * 100, 29.4, 0.05);
  approx(res.byLeg.staged.tb.tbSurvival * 100, 13.5, 0.05);
  assert.strictEqual(res.byLeg.baseline.tb.tbFightsW4, 34);
  assert.strictEqual(res.byLeg.staged.tb.tbFightsW4, 37);
});

check('B4 ally presence reproduces: 44.1% baseline / 73.0% armed', function () {
  approx(res.byLeg.baseline.tb.allyPresence * 100, 44.1, 0.05);
  approx(res.byLeg.staged.tb.allyPresence * 100, 73.0, 0.05);
});

check('B5 all 12 wave-4 kills classified, 0 unmatched, 0 pyrrhic', function () {
  assert.strictEqual(res.kills.length, 12);
  assert.strictEqual(res.unclassified, 0);
  assert.strictEqual(res.ambiguousMatches, 0);
  assert.strictEqual(res.pyrrhicKills, 0);
  assert.strictEqual(res.verdict.verdict, 'DIAG-GO');
});

check('B6 median survival reproduces the guard: 108d baseline / 111.5d armed', function () {
  assert.strictEqual(res.byLeg.baseline.medianSurvival, 108);
  assert.strictEqual(res.byLeg.staged.medianSurvival, 111.5);
});

// ---- (C) channel answer ----
const companion = res.kills.filter(function (k) { return k.channel === 'companion-tb-scholar-present'; });
check('C1 both companion kills are scholar-present with the scholar alive', function () {
  assert.strictEqual(companion.length, 2);
  companion.forEach(function (k) {
    assert.ok(k.matched, 'companion kill must match a TB row');
    assert.strictEqual(k.fightOutcome, 'won');
    assert.ok(k.scholarHpEnd > 0, 'scholar alive at end, got ' + k.scholarHpEnd);
    assert.strictEqual(k.scholarDiedInFight, false);
    assert.ok((k.allyIds || []).indexOf(k.by) >= 0, 'killer stands in the fight as an ally');
  });
});

check('C2 both companion kills are same-day grind finishes (2+ prior fights, scholar deaths)', function () {
  const byDay = {};
  companion.forEach(function (k) { byDay[k.seed + 'd' + k.day] = k; });
  assert.strictEqual(byDay['53006d91'].priorSameDayFights, 2);
  assert.strictEqual(byDay['53006d91'].priorScholarDeaths, 2);
  assert.strictEqual(byDay['53008d109'].priorSameDayFights, 4);
  assert.strictEqual(byDay['53008d109'].priorScholarDeaths, 4);
  // Wound trail declines to near-zero before the kill fight.
  assert.deepStrictEqual(byDay['53006d91'].woundTrail.map(function (t) { return t.monsterHp; }), [0.667, 0.138]);
  assert.deepStrictEqual(byDay['53008d109'].woundTrail.map(function (t) { return t.monsterHp; }), [0.705, 0.409, 0.381, 0.26]);
});

check('C3 wild kill is a field vKill with no TB row that day', function () {
  const wild = res.kills.filter(function (k) { return k.channel === 'wild-field'; });
  assert.strictEqual(wild.length, 1);
  assert.strictEqual(wild[0].seed, 53002);
  assert.strictEqual(wild[0].day, 143);
  assert.strictEqual(wild[0].mid, 'influencer');
  assert.strictEqual(wild[0].tbCandidates, 0);
});

check('C4 gap decomposes to scholar-tb 3 + companion-tb 2 + wild-field 1', function () {
  assert.deepStrictEqual(res.channelGap, { 'wild-field': 1, 'scholar-tb': 3, 'companion-tb-scholar-present': 2 });
});

check('C5 field opportunities existed on both legs (wild channel not crowded out)', function () {
  assert.strictEqual(res.byLeg.baseline.field.fieldW4Fights, 20);
  assert.strictEqual(res.byLeg.staged.field.fieldW4Fights, 26);
  assert.strictEqual(res.byLeg.baseline.field.fieldVKills, 1);
  assert.strictEqual(res.byLeg.staged.field.fieldVKills, 0);
});

check('C6 armed leg had MORE ally-present TB fights and still 0 companion kills', function () {
  assert.strictEqual(res.byLeg.staged.tb.tbFightsW4WithAlly, 27);
  assert.strictEqual(res.byLeg.baseline.tb.tbFightsW4WithAlly, 15);
  assert.strictEqual((res.byLeg.staged.channels['companion-tb-scholar-present'] || 0), 0);
  assert.strictEqual(res.byLeg.baseline.channels['companion-tb-scholar-present'], 2);
});

check('C7 53006-d149 1-round solo kill: scholar-TB, no prior Congregation fight on the leg', function () {
  const kill = res.kills.filter(function (k) { return k.policy === 'staged' && k.seed === 53006 && k.day === 149; });
  assert.strictEqual(kill.length, 1);
  assert.strictEqual(kill[0].channel, 'scholar-tb');
  assert.strictEqual(kill[0].rounds, 1);
  assert.strictEqual(kill[0].alliesAtEntry, 0);
  assert.strictEqual(kill[0].partyAtEntry, 0);
  assert.strictEqual(kill[0].priorSameDayFights, 0);
  const row = JSON.parse(fs.readFileSync(path.join(CORPUS, 'stageally-s53006-stageally-confirm-staged.json'), 'utf8'));
  assert.strictEqual(row.tbFights.filter(function (f) { return f.mid === 'congregation'; }).length, 1, 'exactly one Congregation TB fight on the leg');
  assert.strictEqual(row.fights.filter(function (f) { return f.mid === 'congregation'; }).length, 1, 'exactly one Congregation fight of any kind on the leg');
});

check('C8 grind conversion: baseline 2/3 groups won, armed 1/7', function () {
  assert.strictEqual(res.byLeg.baseline.tb.grindGroups, 3);
  assert.strictEqual(res.byLeg.baseline.tb.grindGroupsWon, 2);
  assert.strictEqual(res.byLeg.staged.tb.grindGroups, 7);
  assert.strictEqual(res.byLeg.staged.tb.grindGroupsWon, 1);
});

check('C9 rally proxy computed: 27 calls, 30 matched rows (over-match 3)', function () {
  const r = res.byLeg.staged.rally;
  assert.strictEqual(r.rallyCalls, 27);
  assert.strictEqual(r.ralliedRows, 30);
  assert.strictEqual(r.overMatch, 3);
  assert.strictEqual(r.rallied.wins, 2);
});

// ---- (D) pooled context: pilot corpus ----
const pilot = A.analyzeDir(PILOT, 'stageally-s');
check('D1 pilot corpus classifies all 10 kills, 0 unmatched (pooled 11 vs 11)', function () {
  assert.strictEqual(pilot.kills.length, 10);
  assert.strictEqual(pilot.unclassified, 0);
  assert.strictEqual(pilot.byLeg.baseline.kills, 2);
  assert.strictEqual(pilot.byLeg.staged.kills, 8);
  assert.strictEqual(res.byLeg.baseline.kills + pilot.byLeg.baseline.kills, 11);
  assert.strictEqual(res.byLeg.staged.kills + pilot.byLeg.staged.kills, 11);
});

check('D2 pilot armed leg produced 4 companion kills — same policy, opposite band', function () {
  assert.strictEqual(pilot.byLeg.staged.channels['companion-tb-scholar-present'], 4);
  assert.strictEqual(pilot.byLeg.baseline.channels['companion-tb-scholar-present'] || 0, 0);
});

console.log('PASS ' + n + '/' + n + (process.exitCode ? ' (with failures above)' : ''));
