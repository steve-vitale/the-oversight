// test-approachbranch-20261104.js — proof for the branch split (arm
// sim-approachbranch-a). Read-only over existing corpora; asserts:
//   1. 99605 seq 2 (confirm baseline): old 14 approach -> flee 14,
//      approach 0; old loop TRUE, true-approach loop FALSE (the
//      overturn the correction note records).
//   2. 99604 seq 5 (confirm baseline): old 4 -> approach 3, flee 1;
//      max true run 3 (below the loop threshold, so NOT a loop).
//   3. Confirm corpus totals: baseline old 18 -> flee 15, approach 3,
//      other 0; armed old 6 -> approach 6, other 0, flee 0.
//   4. Fleerepair candidate 99601 seq 4 (gated fleerepair leg): old 8
//      -> approach 7, other 1; max true run 7; post-mark approach
//      turns 4, all hp >= 0.35 (the firing substrate for the replay).
//      Same shape on seq 5 (approach 7, max true 7) and seq 6
//      (approach 5, max true 5).
//   5. Fight-start outmatched unit rule: round 1 + 850 vs 100 -> true;
//      the same numbers on round 2 -> false (the block is first-call
//      only, so mid-fight turns are never outmatched-issued).
//   6. Gated ambiguity: the same 99605 seq-2 turns under gated=true
//      classify 'other', never 'flee' (corpus alone cannot identify
//      the branch when flee may fall through to approach).
//   7. Determinism: classifying the confirm corpus twice is identical.
// Usage: node scripts/test-approachbranch-20261104.js (exit 0 = ALL PASS)
'use strict';
const path = require('path');
const fs = require('fs');
const REPO = path.join(__dirname, '..');
const B = require('./approachbranch-analyze-20261104');
const CONF = require('./approachconf-analyze-20261104');

let failures = 0;
function check(name, cond, extra) {
  if (cond) console.log('PASS ' + name);
  else { failures++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}
function loadCorpus(dir, file) {
  return JSON.parse(fs.readFileSync(path.join(REPO, 'evidence', '2026-11-04', dir, file)));
}
function findFight(d, seq) {
  return (d.exposures || []).filter(function (e) { return e.seq === seq; })[0];
}

// 1. 99605 seq 2: the overturn.
(function () {
  const d = loadCorpus('perseed-approachconf-b', 'approachconf-s99605-baseline.json');
  const r = B.analyzeBranch(findFight(d, 2), { gated: false });
  check('99605-seq2 old=14', r.oldApproachTurns === 14, 'got ' + r.oldApproachTurns);
  check('99605-seq2 flee=14', r.fleeTurns === 14, 'got ' + r.fleeTurns);
  check('99605-seq2 approach=0', r.approachTurns === 0, 'got ' + r.approachTurns);
  check('99605-seq2 other=0', r.otherTurns === 0, 'got ' + r.otherTurns);
  check('99605-seq2 maxTrueRun=0', r.maxTrueApproachRun === 0, 'got ' + r.maxTrueApproachRun);
  check('99605-seq2 oldLoop=true', r.oldIsLoop === true, 'got ' + r.oldIsLoop);
  check('99605-seq2 trueLoop=false', r.isTrueApproachLoop === false, 'got ' + r.isTrueApproachLoop);
  const allFlee = r.turnDetail.filter(function (x) { return x.oldClass === 'approach'; })
    .every(function (x) { return x.branch === 'flee' && x.hpPct < 0.35; });
  check('99605-seq2 every split turn flee below flee line', allFlee);
})();

// 2. 99604 seq 5: three true-approach turns, then a flee turn.
(function () {
  const d = loadCorpus('perseed-approachconf-b', 'approachconf-s99604-baseline.json');
  const r = B.analyzeBranch(findFight(d, 5), { gated: false });
  check('99604-seq5 old=4', r.oldApproachTurns === 4, 'got ' + r.oldApproachTurns);
  check('99604-seq5 approach=3', r.approachTurns === 3, 'got ' + r.approachTurns);
  check('99604-seq5 flee=1', r.fleeTurns === 1, 'got ' + r.fleeTurns);
  check('99604-seq5 maxTrueRun=3', r.maxTrueApproachRun === 3, 'got ' + r.maxTrueApproachRun);
  check('99604-seq5 trueLoop=false (run 3 < 4)', r.isTrueApproachLoop === false);
  check('99604-seq5 postMark empty (no 4th approach turn)', B.postMarkApproachTurns(r).length === 0);
})();

// 3. Confirm corpus totals.
(function () {
  const res = B.summarizeCorpus(path.join(REPO, 'evidence', '2026-11-04', 'perseed-approachconf-b'));
  check('confirm totals old=24', res.totals.old === 24, 'got ' + res.totals.old);
  check('confirm totals flee=15', res.totals.flee === 15, 'got ' + res.totals.flee);
  check('confirm totals approach=9', res.totals.approach === 9, 'got ' + res.totals.approach);
  check('confirm totals other=0', res.totals.other === 0, 'got ' + res.totals.other);
  check('confirm totals oldLoops=1', res.totals.oldLoops === 1, 'got ' + res.totals.oldLoops);
  check('confirm totals trueLoops=0', res.totals.trueLoops === 0, 'got ' + res.totals.trueLoops);
  const base = res.fights.filter(function (f) { return f.policy === 'competent'; });
  const armed = res.fights.filter(function (f) { return f.policy === 'approachfall'; });
  const sum = function (rows, k) { return rows.reduce(function (s, r) { return s + r[k]; }, 0); };
  check('confirm baseline old=18', sum(base, 'old') === 18, 'got ' + sum(base, 'old'));
  check('confirm baseline flee=15', sum(base, 'flee') === 15, 'got ' + sum(base, 'flee'));
  check('confirm baseline approach=3', sum(base, 'approach') === 3, 'got ' + sum(base, 'approach'));
  check('confirm armed old=6', sum(armed, 'old') === 6, 'got ' + sum(armed, 'old'));
  check('confirm armed approach=6', sum(armed, 'approach') === 6, 'got ' + sum(armed, 'approach'));
})();

// 4. Fleerepair candidate geometry (gated leg, approach fallback OFF).
(function () {
  const d = loadCorpus('perseed-fleerepair-a', 'fleerepair-s99601-confirm-fleerepair.json');
  const r4 = B.analyzeBranch(findFight(d, 4), { gated: true });
  check('fleer-99601-seq4 old=8', r4.oldApproachTurns === 8, 'got ' + r4.oldApproachTurns);
  check('fleer-99601-seq4 approach=7', r4.approachTurns === 7, 'got ' + r4.approachTurns);
  check('fleer-99601-seq4 other=1', r4.otherTurns === 1, 'got ' + r4.otherTurns);
  check('fleer-99601-seq4 maxTrueRun=7', r4.maxTrueApproachRun === 7, 'got ' + r4.maxTrueApproachRun);
  const pm = B.postMarkApproachTurns(r4);
  check('fleer-99601-seq4 postMark=4', pm.length === 4, 'got ' + pm.length);
  check('fleer-99601-seq4 postMark all hp>=0.35',
    pm.every(function (p) { return p.hpPct >= 0.35; }));
  check('fleer-99601-seq4 postMark all target 3,5',
    pm.every(function (p) { return p.target === '3,5'; }));
  const r5 = B.analyzeBranch(findFight(d, 5), { gated: true });
  check('fleer-99601-seq5 approach=7 maxTrue=7', r5.approachTurns === 7 && r5.maxTrueApproachRun === 7,
    'approach=' + r5.approachTurns + ' maxTrue=' + r5.maxTrueApproachRun);
  check('fleer-99601-seq5 postMark=4', B.postMarkApproachTurns(r5).length === 4,
    'got ' + B.postMarkApproachTurns(r5).length);
  const r6 = B.analyzeBranch(findFight(d, 6), { gated: true });
  check('fleer-99601-seq6 approach=5 maxTrue=5', r6.approachTurns === 5 && r6.maxTrueApproachRun === 5,
    'approach=' + r6.approachTurns + ' maxTrue=' + r6.maxTrueApproachRun);
  check('fleer-99601-seq6 postMark=2', B.postMarkApproachTurns(r6).length === 2,
    'got ' + B.postMarkApproachTurns(r6).length);
})();

// 5. Fight-start outmatched unit rule.
(function () {
  const ex = { wave: 4, monsters: [{ key: 'm_0', wave: 4 }] };
  const mk = function (round) {
    return { round: round, start: { player: { hp: 100, maxHp: 100 },
      monsters: [{ key: 'm_0', alive: true, maxHp: 850, hp: 322 }] } };
  };
  check('outmatched round1 true', B.fightStartOutmatched(ex, mk(1)) === true);
  check('outmatched round2 false', B.fightStartOutmatched(ex, mk(2)) === false);
  const weak = { round: 1, start: { player: { hp: 100, maxHp: 100 },
    monsters: [{ key: 'm_0', alive: true, maxHp: 100, hp: 90 }] } };
  check('outmatched round1 weak-monster false', B.fightStartOutmatched(ex, weak) === false);
})();

// 6. Gated ambiguity on the same 99605 turns.
(function () {
  const d = loadCorpus('perseed-approachconf-b', 'approachconf-s99605-baseline.json');
  const r = B.analyzeBranch(findFight(d, 2), { gated: true });
  check('99605-seq2 gated other=14', r.otherTurns === 14, 'got ' + r.otherTurns);
  check('99605-seq2 gated flee=0', r.fleeTurns === 0, 'got ' + r.fleeTurns);
  check('99605-seq2 gated approach=0', r.approachTurns === 0, 'got ' + r.approachTurns);
})();

// 7. Determinism.
(function () {
  const a = B.summarizeCorpus(path.join(REPO, 'evidence', '2026-11-04', 'perseed-approachconf-b'));
  const b = B.summarizeCorpus(path.join(REPO, 'evidence', '2026-11-04', 'perseed-approachconf-b'));
  check('corpus summary deterministic', JSON.stringify(a) === JSON.stringify(b));
})();

// Sanity: the old analyzer still loads (no regression in the shared module).
(function () {
  check('approachconf analyzer loads', typeof CONF.analyzeConfirm === 'function');
})();

if (failures) { console.log('FAILURES: ' + failures); process.exit(1); }
console.log('ALL PASS');
