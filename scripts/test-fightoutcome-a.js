#!/usr/bin/env node
// test-fightoutcome-a.js — proof test for the fight-outcome recorder
// (sim-fightoutcome-recorder). No game load: (1) unit cases for the
// normalization taxonomy, (2) a fake-Game install smoke test proving
// the fightSeq join, tbEnd capture, and dissolved path without the
// full engine, (3) analyzer join cases over synthetic per-seed JSON
// in /tmp (the analyzer judges files, never the live corpus).
// Usage: node scripts/test-fightoutcome-a.js
// Exit 0 only if every case passes; prints PASS/FAIL per case.
'use strict';
const path = require('path');
const fs = require('fs');
const os = require('os');
const { execSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const REC = require(path.join(REPO, 'scripts', 'fightoutcome-recorder'));

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS: ' + name); }
  else { fail++; console.log('FAIL: ' + name + (extra ? ' — ' + extra : '')); }
}

// --- 1. normalization taxonomy ---
check('norm won+monster-dead => slain', REC.normalizeTb('won', { monster: { alive: false }, bearer: { alive: true } }, null) === 'slain');
check('norm won+monster-alive => other', REC.normalizeTb('won', { monster: { alive: true }, bearer: { alive: true } }, null) === 'other');
check('norm lost+bearer-dead => party-death', REC.normalizeTb('lost', { monster: { alive: true }, bearer: { alive: false } }, null) === 'party-death');
check('norm lost+bearer-alive => other', REC.normalizeTb('lost', { monster: { alive: true }, bearer: { alive: true } }, null) === 'other');
check('norm fled => fled', REC.normalizeTb('fled', {}, null) === 'fled');
check('norm routed => fled', REC.normalizeTb('routed', {}, null) === 'fled');
check('norm dissolved => dissolved', REC.normalizeTb('dissolved', {}, null) === 'dissolved');
check('norm titan slain overrides tb result', REC.normalizeTb('lost', {}, { outcome: 'slain' }) === 'slain');
check('norm titan fled overrides tb result', REC.normalizeTb('won', {}, { outcome: 'fled' }) === 'fled');
check('norm field vKill => slain', REC.normalizeField('vKill') === 'slain');
check('norm field vDie => party-death', REC.normalizeField('vDie') === 'party-death');
check('norm field mFlee => fled', REC.normalizeField('mFlee') === 'fled');
check('norm field vFlee => fled', REC.normalizeField('vFlee') === 'fled');
check('norm field evade => other', REC.normalizeField('evade') === 'other');
check('norm field unresolved => other', REC.normalizeField('unresolved') === 'other');

// --- 2. fake-Game install smoke test ---
function fakeGame() {
  const G = {
    state: { scholar: { day: 42 }, titans: { outcomes: [], musters: {} } },
    data: { monsters: [{ id: 'herald', wave: 6 }], titans: { herald: { minAllies: 10 } } },
    villagerId: 'v1', tbfight: null, pendingEncounter: false, pendingMonsterId: null,
    map: { px: 4, py: 4 },
    say() {}, worldMonsters() { return []; },
    tbFighter() { return null; },
  };
  let fid = 0;
  // Dynamic G.tbBeginTurn lookup: after install this calls the
  // recorder-wrapped turn, mid-startCombat — the engine's own
  // order (game.js startCombat calls tbBeginTurn during setup).
  G.startCombat = function () { fid++; G.tbfight = { id: 'f-' + fid, over: false, fighters: [{ key: 'p', kind: 'villager', villagerId: 'v1', hp: 10, maxHp: 20, alive: true }, { key: 'm_0', kind: 'monster', id: 'herald', hp: 0, maxHp: 700, alive: false }] }; G.tbBeginTurn(); return true; };
  G.tbEnd = function () { if (G.tbfight) { G.tbfight.over = true; G.tbfight.result = 'won'; } };
  // Real engine order (game.js tbBarrierExit): the bearer changes
  // DURING the call (travelTo death/succession), then the fight is
  // dissolved with tbfight=null and no tbEnd. The wrapper's
  // before/after bearer comparison detects exactly that.
  G.tbBeginTurn = function () {};
  G.tbBarrierExit = function () { G.villagerId = 'v2'; G.tbfight = null; };
  G.fieldFight = function () { return { outcome: 'vKill', rounds: 3, vTaken: 5, mDealt: 40, vHpLeft: 15, mHpLeft: 0 }; };
  G.recordWaveKill = function () {};
  return G;
}
(function smoke() {
  const G = fakeGame();
  const t = { attempts: [], tbFights: [], tbOutcomes: {}, fieldFights: [], kills: [], titanOutcomesAppended: [], transcripts: [], instrumentErrors: [] };
  const uninstall = REC.install(G, t);
  G.startCombat('herald');
  check('smoke FOUGHT attempt recorded', t.attempts.length === 1 && t.attempts[0].cls === 'FOUGHT', JSON.stringify(t.attempts.map(a => a.cls)));
  check('smoke no double row (turn-inside-startCombat upgrades, not duplicates)', t.attempts.length === 1, 'rows=' + t.attempts.length);
  const seq = t.attempts[0].fightSeq;
  check('smoke fightSeq assigned', seq === 1, 'seq=' + seq);
  G.tbEnd('won');
  check('smoke tbFight row joined by seq', t.tbFights.length === 1 && t.tbFights[0].fightSeq === 1, JSON.stringify(t.tbFights.map(f => f.fightSeq)));
  check('smoke engine result preserved', t.tbFights[0].engineResult === 'won');
  check('smoke normalized slain (monster dead)', t.tbFights[0].normalized === 'slain', 'norm=' + t.tbFights[0].normalized);
  check('smoke monster snapshot captured', t.tbFights[0].monster && t.tbFights[0].monster.alive === false);
  // Dissolved path: new fight, bearer changes, barrier exit clears it.
  G.startCombat('herald');
  const seq2 = t.attempts[1].fightSeq;
  G.tbBarrierExit();
  check('smoke dissolved row recorded', t.tbFights.length === 2 && t.tbFights[1].engineResult === 'dissolved' && t.tbFights[1].fightSeq === seq2,
    JSON.stringify(t.tbFights.map(f => f.engineResult)));
  // Bypass start: a fight built directly (alien/uprising/betrayal
  // class) must register at first tbBeginTurn and join at tbEnd,
  // with the monster id read off the fighter's monsterId field.
  G.tbfight = { id: 'f-direct', over: false, alienFight: true,
    fighters: [{ key: 'p', kind: 'villager', villagerId: 'v2', hp: 12, maxHp: 20, alive: true },
               { key: 'm_0', kind: 'monster', monsterId: 'hushwolf', hp: 30, maxHp: 90, alive: true }] };
  G.tbBeginTurn();
  const byp = t.attempts.find(a => a.cls === 'BYPASS');
  check('smoke bypass start registered at turn', !!byp && byp.mid === 'hushwolf', JSON.stringify(t.attempts.map(a => a.cls + ':' + a.mid)));
  check('smoke bypass flags carried', byp && byp.fightFlags && byp.fightFlags.alienFight === true);
  G.tbEnd('routed');
  const bypRow = t.tbFights.find(f => f.fightSeq === byp.fightSeq);
  check('smoke bypass outcome joins', !!bypRow && bypRow.engineResult === 'routed' && bypRow.normalized === 'fled');
  // Field fight.
  G.fieldFight('v9', { id: 'herald' });
  check('smoke fieldFight row recorded', t.fieldFights.length === 1 && t.fieldFights[0].outcome === 'vKill' && t.fieldFights[0].normalized === 'slain');
  uninstall();
  check('smoke uninstall restores startCombat', G.startCombat.toString().indexOf('tbfight') >= 0 && !G.startCombat.toString().includes('fightoutcome'));
  check('smoke no instrument errors', t.instrumentErrors.length === 0, t.instrumentErrors.join('; '));
})();

// --- 3. analyzer join cases over synthetic per-seed JSON ---
(function analyzerCases() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fightoutcome-test-'));
  function seedFile(name, rec) { fs.writeFileSync(path.join(tmp, name), JSON.stringify(rec, null, 2) + '\n'); }
  const good = { seed: 1, run: 'r1', callDay: 10,
    attempts: [{ fightSeq: 1, day: 11, mid: 'herald', cls: 'FOUGHT', titan: true },
               { fightSeq: null, day: 11, mid: 'herald', cls: 'REFUSED', titan: true }],
    tbFights: [{ fightSeq: 1, day: 11, endDay: 11, mid: 'herald', titan: true, engineResult: 'won', normalized: 'slain' }],
    fieldFights: [{ day: 12, vid: 'v1', mid: 'herald', outcome: 'vFlee', normalized: 'fled' }],
    kills: [], titanOutcomesEnd: [{ day: 11, titan: 'herald', outcome: 'fought' }, { day: 11, titan: 'herald', outcome: 'slain' }],
    unresolved: [] };
  const bad = { seed: 2, run: 'r1', callDay: 10,
    attempts: [{ fightSeq: 1, day: 11, mid: 'herald', cls: 'FOUGHT', titan: true },
               { fightSeq: 2, day: 12, mid: 'herald', cls: 'FOUGHT', titan: true }],
    tbFights: [{ fightSeq: 1, day: 11, endDay: 11, mid: 'herald', titan: true, engineResult: 'won', normalized: 'slain' },
               { fightSeq: 1, day: 11, endDay: 11, mid: 'herald', titan: true, engineResult: 'won', normalized: 'slain' },
               { fightSeq: 9, day: 13, endDay: 13, mid: 'herald', titan: true, engineResult: 'lost', normalized: 'other' }],
    fieldFights: [{ day: 12, vid: 'v1', mid: 'herald', outcome: 'unresolved', normalized: 'other' }],
    kills: [], titanOutcomesEnd: [{ day: 11, titan: 'herald', outcome: 'slain' }],
    unresolved: [] };
  seedFile('good.json', good);
  seedFile('bad.json', bad);
  const out = execSync('node ' + path.join(REPO, 'scripts', 'fightoutcome-analyze-20261102.js') + ' ' + tmp, { encoding: 'utf8' });
  const analysis = JSON.parse(fs.readFileSync(path.join(tmp, 'analysis.json'), 'utf8'));
  const g = analysis.perSeed.find(s => s.seed === 1);
  const b = analysis.perSeed.find(s => s.seed === 2);
  check('analyzer good seed has no problems', g.problems.length === 0, g.problems.join('; '));
  check('analyzer good seed titan join ok', g.titanJoins.length === 1 && g.titanJoins[0].joined === true);
  check('analyzer bad seed flags missing outcome', b.missing.length === 1 && b.missing[0].fightSeq === 2, JSON.stringify(b.missing));
  check('analyzer bad seed flags duplicate', b.problems.some(p => /duplicate/.test(p)), b.problems.join('; '));
  check('analyzer bad seed flags orphan', b.orphanTb.length === 1 && b.orphanTb[0].fightSeq === 9);
  check('analyzer bad seed flags unresolved field', b.unresolvedField.length === 1);
  check('analyzer totals count problems', analysis.totals.problems > 0);
  fs.rmSync(tmp, { recursive: true, force: true });
})();

console.log('\n' + pass + ' passed, ' + fail + ' failed.');
process.exit(fail ? 1 : 0);
