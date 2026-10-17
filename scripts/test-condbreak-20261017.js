// test-condbreak-20261017.js — proof for the condbreak diagnostic.
// UNIT: the classifier's reason paths on synthetic rows.
// GROUNDING: the gate table's key predicates exist in the engine source
//   (src/js/fieldFights.js villagerTrickAction) — the classification is
//   grounded in real gates, not invented ones.
// INTEGRATION: the analyzer over the real execensus corpus — 13/13 rows
//   classified, expected shares, zero instrument errors, zero unattributed.
'use strict';
const fs = require('fs');
const path = require('path');
const { classifyRow, GATE_TABLE, analyze } = require('./condbreak-20261017.js');

let pass = 0, fail = 0;
function ok(name, cond, detail) {
  if (cond) { pass++; /* console.log('ok - ' + name); */ }
  else { fail++; console.log('FAIL - ' + name + (detail ? ' :: ' + detail : '')); }
}

function synthFight(over) {
  return Object.assign({
    cls: 'conditions-never-met', seq: 200, day: 100, vid: 'v',
    outcome: 'vDie', rounds: 1, evals: 1, fires: 0, trickLog: [],
  }, over || {});
}

// ---- UNIT: reason paths ----
let r = classifyRow('congregation', synthFight({ rounds: 1 }), 100);
ok('congregation rounds=1 -> rounds-missing', r.row.reason === 'rounds-missing', r.row.reason);

r = classifyRow('congregation', synthFight({ rounds: 2, evals: 2 }), 100);
ok('congregation rounds=2 -> rounds-missing', r.row.reason === 'rounds-missing');

r = classifyRow('reunion', synthFight({ rounds: 1 }), 100);
ok('reunion rounds=1 -> rounds-missing', r.row.reason === 'rounds-missing');

r = classifyRow('reunion', synthFight({ rounds: 2, evals: 2 }), 100);
ok('reunion rounds=2 -> rounds-missing', r.row.reason === 'rounds-missing');

r = classifyRow('editor', synthFight({ rounds: 1 }), 100);
ok('editor rounds=1 -> rounds-missing', r.row.reason === 'rounds-missing');

r = classifyRow('editor', synthFight({ rounds: 2, evals: 2 }), 100);
ok('editor rounds=2 -> rounds-missing', r.row.reason === 'rounds-missing');

r = classifyRow('eater', synthFight({ rounds: 1 }), 100);
ok('eater rounds=1 -> material-missing', r.row.reason === 'material-missing', r.row.reason);

r = classifyRow('eater', synthFight({ rounds: 5, evals: 5 }), 100);
ok('eater rounds=5 evals=5 -> STILL material-missing (no round component)', r.row.reason === 'material-missing');

r = classifyRow('mystery_beast', synthFight({}), 100);
ok('unmapped kind -> other (named)', r.row.reason === 'other' && /unmapped-kind/.test(r.row.reasonDetail), r.row.reasonDetail);

// knowledge check: fight before the learning is an instrument error
r = classifyRow('congregation', synthFight({ seq: 90 }), 100);
ok('fight.seq <= learn.seq -> instrumentError', r.row.instrumentError === true);

// non-cnm input is an instrument error
r = classifyRow('congregation', synthFight({ cls: 'flee', fires: 1 }), 100);
ok('non-cnm input -> instrumentError', r.row.instrumentError === true);

// rounds reaching the gate requirement but no fire: inconsistency, not classification
r = classifyRow('congregation', synthFight({ rounds: 4, evals: 4 }), 100);
ok('congregation rounds=4 evals=4 fires=0 -> instrumentError (gate should have fired)',
  r.row.instrumentError === true && r.row.reason === null);

// eater with evals=0: sweep classifies that as no-opportunity, never cnm
r = classifyRow('eater', synthFight({ evals: 0 }), 100);
ok('eater evals=0 -> instrumentError', r.row.instrumentError === true);

// ---- GROUNDING: gate predicates exist in the engine source ----
const src = fs.readFileSync(path.join(__dirname, '..', 'src', 'js', 'fieldFights.js'), 'utf8');
ok('src/js/fieldFights.js readable', src.length > 10000, 'len=' + src.length);
const predicates = [
  ['congregation round%3 gate', /mid === 'congregation' && \(fctx\.round % 3 === 0\)/],
  ['reunion strikes>=2 gate', /_rStrikes >= 2 && _rLast === 'strike'/],
  ['editor two-strikes gate', /_pAk\[_pAk\.length - 2\] === 'strike'/],
  ['eater spoiled-food gate', /mid === 'eater' && this\.villagerHasSpoiledFood && this\.villagerHasSpoiledFood\(vid\)/],
  ['FIGHTOPEN default OFF (corpus substrate)', /process\.env\.FIGHTOPEN === '1'/],
];
for (const [name, re] of predicates) ok(name, re.test(src), 'predicate not found in fieldFights.js');

// gate table covers every kind that appears in the real corpus
const corpusDir = path.join(__dirname, '..', 'evidence', '2026-10-16', 'perseed-execensus');
const corpusKinds = new Set();
for (const f of fs.readdirSync(corpusDir).filter(x => x.endsWith('.json'))) {
  const d = JSON.parse(fs.readFileSync(path.join(corpusDir, f), 'utf8'));
  for (const L of (d.funnel || []))
    for (const fight of (L.fights || []))
      if (fight.cls === 'conditions-never-met') corpusKinds.add(L.id || L.trick);
}
for (const k of corpusKinds) ok('gate table covers corpus kind ' + k, !!GATE_TABLE[k]);

// ---- INTEGRATION: real corpus ----
const res = analyze(corpusDir);
ok('corpus files = 16', res.corpusFiles === 16, 'got ' + res.corpusFiles);
ok('conditions-never-met rows = 13', res.nConditionsNeverMet === 13, 'got ' + res.nConditionsNeverMet);
ok('every row classified (reason set)', res.rows.every(x => !!x.reason), JSON.stringify(res.rows.filter(x => !x.reason)));
ok('zero instrument errors', res.instrumentErrors.length === 0, JSON.stringify(res.instrumentErrors));
ok('zero unattributed rows', res.unattributedRows === 0);
ok('rounds-missing = 11', res.reasonShares['rounds-missing'] === 11, JSON.stringify(res.reasonShares));
ok('material-missing = 2', res.reasonShares['material-missing'] === 2);
ok('knowledge-missing = 0 (funnel is post-learning)', !res.reasonShares['knowledge-missing']);
ok('position-missing = 0 (no gate needs grid)', !res.reasonShares['position-missing']);
ok('kind cells: congregation x rounds-missing = 3', res.kindReasonCells['congregation x rounds-missing'] === 3);
ok('kind cells: reunion x rounds-missing = 3', res.kindReasonCells['reunion x rounds-missing'] === 3);
ok('kind cells: editor x rounds-missing = 5', res.kindReasonCells['editor x rounds-missing'] === 5);
ok('kind cells: eater x material-missing = 2', res.kindReasonCells['eater x material-missing'] === 2);
ok('median rounds of rounds-missing fights = 1', res.fightShapeByReason['rounds-missing'].medianRounds === 1);
ok('verdict GO', res.verdict === 'GO', res.verdict);

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
