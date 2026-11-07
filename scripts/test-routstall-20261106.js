// test-routstall-20261106.js — proof for sim-routstall-b (DIAG ONLY, zero src/js).
// Determinism + classification fixtures for the 159-round rout diagnosis.
// Run: node scripts/test-routstall-20261106.js
// Exits nonzero on any failure; prints PASS/FAIL per check.
'use strict';
const path = require('path');
const fs = require('fs');
const REPO = path.join(__dirname, '..');
const A = require(path.join(REPO, 'scripts', 'routstall-analyze-20261106'));
const INST = require(path.join(REPO, 'scripts', 'fightinterior-instrument-20261106'));

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (detail ? ' — ' + detail : '')); }
}

// ---- A. Analyzer fixtures: verb census ----
(function () {
  const tr = { rounds: 5, verbs: [
    { r: 1, verb: 'move', to: [5, 5] }, { r: 1, verb: 'move', to: [5, 5] },
    { r: 2, verb: 'strike', target: 'm_0' }, { r: 3, verb: 'wait' },
    { r: 4, verb: 'move', to: [6, 5] },
  ] };
  const vc = A.verbCensus(tr);
  check('A1 verb census counts move/strike/wait', vc.byVerb.move === 3 && vc.byVerb.strike === 1 && vc.byVerb.wait === 1, JSON.stringify(vc.byVerb));
  check('A2 move targets tallied per tile', vc.moveTargets['move->5,5'] === 2 && vc.moveTargets['move->6,5'] === 1, JSON.stringify(vc.moveTargets));
})();

// ---- B. Analyzer fixtures: hit census ----
(function () {
  const tr = { rounds: 10, hits: [
    { r: 1, tgt: 'm_0', tgtKind: 'monster', dmg: 12, hpAfter: 988 },
    { r: 2, tgt: 'p', tgtKind: 'player', dmg: 0, hpAfter: 100 },
    { r: 5, tgt: 'm_0', tgtKind: 'monster', dmg: 8, hpAfter: 980 },
    { r: 9, tgt: 'm_0', tgtKind: 'monster', dmg: 0, hpAfter: 980 },
  ] };
  const hc = A.hitCensus(tr);
  check('B1 dealt sums monster damage only', hc.dealt === 20 && hc.taken === 0, JSON.stringify(hc));
  check('B2 last monster-HP-drop round', hc.lastMonsterHpDropRound === 5, String(hc.lastMonsterHpDropRound));
  check('B3 scholar never hit for damage', hc.scholarHitsTaken === 1 && hc.lastScholarHitTakenRound === null, JSON.stringify(hc));
  check('B4 rounds-with-hits counts distinct rounds', hc.roundsWithHits === 4, String(hc.roundsWithHits));
})();

// ---- C. Terminator classification fixtures ----
(function () {
  const watchdogStack = 'at Game.tbEnd (game.js:45879:5) | at runDays (sim-harness.js:588:11) | at async oneRun';
  const engineStack = 'at Game.tbEnd (game.js:45879:5) | at Game.tbEndCheck (game.js:45560:10) | at Game.tbMonsterTurn (game.js:43010:9)';
  const corpus = { tbEndCalls: [
    { result: 'routed', day: 41, round: 159, frozenSleeps: 8, loopDay: 49, stack: watchdogStack },
  ], frozenStreaks: [{ loopDay: 49, sday: 41, frozen: 8 }] };
  const t1 = A.classifyTerminator(corpus, { day: 41, rounds: 159 });
  check('C1 watchdog stack classifies harness-watchdog', t1.verdict === 'harness-watchdog', t1.verdict);
  check('C2 frozen streak >=8 recorded as evidence', t1.frozenStreaksOnFightDay.length === 1, JSON.stringify(t1.frozenStreaksOnFightDay));
  const corpus2 = { tbEndCalls: [
    { result: 'routed', day: 41, round: 159, frozenSleeps: 0, loopDay: 41, stack: engineStack },
  ], frozenStreaks: [] };
  const t2 = A.classifyTerminator(corpus2, { day: 41, rounds: 159 });
  check('C3 engine stack classifies engine', t2.verdict === 'engine', t2.verdict);
  const corpus3 = { tbEndCalls: [], frozenStreaks: [] };
  const t3 = A.classifyTerminator(corpus3, { day: 41, rounds: 159 });
  check('C4 no matching call stays unknown, not invented', t3.verdict === 'unknown', t3.verdict);
})();

// ---- D. Classifier fixtures (midnightkill matcher + rout normalization) ----
(function () {
  // 'routed' outcome normalizes to 'rout' via classifyEnding.
  const tr = { outcome: 'routed', day: 41, mid: 'congregation', mids: ['congregation'], fighters: ['scholar-x'], mHpLeft: 584 };
  const cls = INST.classifyEnding(tr, [], [], 'tbEnd', false);
  check('D1 routed classifies as rout', cls.ending === 'rout', JSON.stringify(cls));
  const trWon = { outcome: 'won', day: 41, mid: 'congregation', mids: ['congregation'], fighters: ['scholar-x'], mHpLeft: 0 };
  const clsWon = INST.classifyEnding(trWon, [], [{ d: 41, mid: 'congregation', w: 4, by: 'scholar-x', via: 'player' }], 'tbEnd', false);
  check('D2 won + same-day kill log match classifies kill', clsWon.ending === 'kill', JSON.stringify(clsWon));
  const clsWonNext = INST.classifyEnding(trWon, [], [{ d: 42, mid: 'congregation', w: 4, by: 'scholar-x', via: 'player' }], 'tbEnd', false);
  check('D3 won + next-day (±1) kill match classifies kill (midnightkill)', clsWonNext.ending === 'kill', JSON.stringify(clsWonNext));
  const clsWonOther = INST.classifyEnding(trWon, [], [{ d: 41, mid: 'strike', w: 4, by: 'scholar-x', via: 'player' }], 'tbEnd', false);
  check('D4 won + different-beast kill does NOT match (same-beast guard)', clsWonOther.ending === 'rout', JSON.stringify(clsWonOther));
})();

// ---- E. Committed reproduction corpora (present after the 2ff11cbf runs) ----
(function () {
  const dir = path.join(REPO, 'evidence', '2026-11-06', 'perseed-routstall-b');
  const base = path.join(dir, 'routstall-s53001-routstall-baseline.json');
  const staged = path.join(dir, 'routstall-s53001-routstall-staged.json');
  if (!fs.existsSync(base) || !fs.existsSync(staged)) {
    console.log('SKIP E1/E2/E3: reproduction corpora not present yet (run the routstall driver at 2ff11cbf first)');
    return;
  }
  [base, staged].forEach(function (file, i) {
    const leg = i === 0 ? 'baseline' : 'staged';
    const c = JSON.parse(fs.readFileSync(file, 'utf8'));
    const cong = (c.traces || []).filter(function (t) { return t.mid === 'congregation'; });
    check('E1-' + leg + ' Congregation trace exists', cong.length === 1, 'traces=' + cong.length);
    if (!cong.length) return;
    const tr = cong[0];
    check('E2-' + leg + ' reproduces day 41 / 159 rounds', tr.day === 41 && tr.rounds === 159, 'day=' + tr.day + ' rounds=' + tr.rounds);
    check('E3-' + leg + ' scholar untouched, beast ~0.59', tr.scholarHpFracEnd === 1 && tr.mHpLeftFrac >= 0.55 && tr.mHpLeftFrac <= 0.62,
      'sHp=' + tr.scholarHpFracEnd + ' mHp=' + tr.mHpLeftFrac);
    check('E4-' + leg + ' instrument clean', (c.instrumentErrors || []).length === 0, JSON.stringify((c.instrumentErrors || []).slice(0, 3)));
    check('E5-' + leg + ' anchor is the confirm anchor', (c.anchorCommit || '').indexOf('2ff11cbf') === 0, String(c.anchorCommit));
  });
})();

console.log('\n' + pass + ' passed, ' + fail + ' failed.');
process.exit(fail ? 1 : 0);
