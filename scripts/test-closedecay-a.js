#!/usr/bin/env node
// test-closedecay-a.js — proof test for sim-closedecay-a (Loop A 20261102,
// axis scale-onramp). READ-ONLY: asserts over the committed per-seed trace
// JSONs and the policy sources. No harness, no writes, no RNG.
// Proves:
//   1. 97330 closecommit reproduces: call d97 gate 11/11 ready; refusals
//      d110 x12, all at judged gate 8; identical gate series r1 vs r2.
//   2. The decay decomposition: allied component CONSTANT (8) every
//      traced day; the whole movement is Haven 3 -> 2 (d103) -> 0 (d106).
//   3. 97338 check: call d113 gate 9 (already short — no decay needed);
//      Haven 3 -> 2 (d115) -> 0 (d117) by the same succession chain;
//      refusals d118 at gate 6; allies constant 6.
//   4. Refresh v2 on 97330 does NOT close: d106 commits 1 (gate 9),
//      d107 finds 0 free, contact still refused at gate 8, 0 fights.
//   5. Perception audit: commitrefresh.js reads no monster roster, no
//      allied roster, no link list (own muster record + verb only).
// Usage: node scripts/test-closedecay-a.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const DIR = path.join(REPO, 'evidence', '2026-11-02', 'perseed-closedecay-a');
let pass = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log('PASS ' + name + (detail != null ? ' — ' + detail : '')); }
  else { console.log('FAIL ' + name + (detail != null ? ' — ' + detail : '')); process.exitCode = 1; }
}
function load(f) { return JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')); }
function rowFor(rec, day) { return rec.dailyTrace.find(function (r) { return r.day === day; }); }
function gateAt(rec, day) { const r = rowFor(rec, day); return r ? r.gate : null; }

const r1 = load('cd-closecommit-s97330-r1.json');
const r2 = load('cd-closecommit-s97330-r2.json');
const diag = load('cd-closecommit-s97330-diag.json');
const s338 = load('cd-closecommit-s97338-diag.json');
const ref = load('cd-refresh-s97330-r2.json');

// 1. Reproduction + determinism (97330 closecommit).
check('97330 call day 97', r1.callDay === 97, 'callDay=' + r1.callDay);
check('97330 call gate raw 11', gateAt(r1, 97).gateRaw === 11);
check('97330 call gate living 11 + ready', gateAt(r1, 97).gateLiving === 11 && gateAt(r1, 97).ready === true);
check('97330 refusals 12 on d110', r1.attemptCount === 12 && r1.attempts.every(function (a) { return a.day === 110 && a.reason === 'MUSTER-GATE'; }), 'attempts=' + r1.attemptCount);
check('97330 refusal snapshots all gate 8', r1.attemptGateSnaps.length === 12 && r1.attemptGateSnaps.every(function (s) { return s.gate.gateLiving === 8 && s.gate.ready === false; }));
check('97330 zero fights (no fought attempt)', r1.attempts.every(function (a) { return a.cls === 'REFUSED'; }) && r1.won === 0 && r1.maxWave === 4);
const series = function (rec) { return rec.dailyTrace.map(function (r) { return r.day + ':' + r.gate.gateRaw + '/' + r.gate.gateLiving + '/' + r.gate.ready; }).join(','); };
check('97330 gate series r1 == r2 (determinism)', series(r1) === series(r2));
check('97330 diag gate series == r1', series(diag) === series(r1));

// 2. Decomposition (97330): allies constant, Haven moves.
const alliedAll = r1.dailyTrace.every(function (r) { return r.gate.livingAllies === 8 && r.gate.rawAllies === 8; });
check('97330 allies constant 8/8 every traced day', alliedAll, 'days=' + r1.dailyTrace.length);
check('97330 Haven 3 on d97-102', [97, 98, 99, 100, 101, 102].every(function (d) { return gateAt(r1, d).validHaven === 3; }));
check('97330 Haven 2 on d103-105 (succession step)', [103, 104, 105].every(function (d) { return gateAt(r1, d).validHaven === 2; }));
check('97330 Haven 0 from d106 (bearer deaths)', r1.dailyTrace.filter(function (r) { return r.day >= 106; }).every(function (r) { return r.gate.validHaven === 0; }));
check('97330 gate 10 while Haven 2, 8 once Haven 0', gateAt(r1, 103).gateLiving === 10 && gateAt(r1, 106).gateLiving === 8);
const rw103 = rowFor(diag, 103).rosterWatch, rw106 = rowFor(diag, 106).rosterWatch;
check('97330 d103: bearer changed to a committed blade (Vera), still in roster',
  rw103.bearer === 'gen_b2d5j83' && rw103.tracked.find(function (t) { return t.vid === 'gen_b2d5j83'; }).inRoster === true,
  'bearer=' + rw103.bearer);
check('97330 d106: all three committed blades fallen, cause the wild',
  ['gen_b2d5j83', 'nora_wilson', 'aroha_ngata'].every(function (vid) {
    return (rw106.fallen || []).some(function (f) { return f.villagerId === vid && f.day === 106 && f.cause === 'the wild'; });
  }));
check('97330 d103 fallen: Patrick (prior bearer), cause the wild',
  (rw103.fallen || []).some(function (f) { return f.villagerId === 'gen_nf4myf8' && f.day === 103 && f.cause === 'the wild'; }));

// 3. Second seed check (97338).
check('97338 call d113 gate 9, already short', s338.callDay === 113 && gateAt(s338, 113).gateLiving === 9 && gateAt(s338, 113).ready === false);
check('97338 allies constant 6', s338.dailyTrace.every(function (r) { return r.gate.livingAllies === 6; }));
check('97338 Haven 3 -> 2 on d115 -> 0 on d117',
  gateAt(s338, 113).validHaven === 3 && gateAt(s338, 115).validHaven === 2 && gateAt(s338, 117).validHaven === 0);
check('97338 refusals d118 at gate 6', s338.attemptCount === 6 && s338.attemptGateSnaps.every(function (s) { return s.day === 118 && s.gate.gateLiving === 6; }));

// 4. Refresh v2 (97330): measured, does not close.
const cr = ref.commitrefreshCtx || {};
check('97330 refresh d106 commits exactly 1 (pool nearly dry)',
  (cr.episodes || []).some(function (e) { return e.day === 106 && e.result === 'committed' && e.havenBefore === 0 && e.havenAfter === 1; }),
  'episodes=' + JSON.stringify(cr.episodes));
check('97330 refresh d107 finds 0 free',
  (cr.episodes || []).some(function (e) { return e.day === 107 && e.result === 'null' && e.havenAfter === 0; }));
check('97330 refresh still 0 fights, refused at gate 8',
  ref.attempts.length >= 1 && ref.attempts.every(function (a) { return a.cls === 'REFUSED'; }) && ref.attemptGateSnaps.every(function (s) { return s.gate.gateLiving === 8; }),
  'attempts=' + JSON.stringify(ref.attempts));

// 5. Perception audit (commitrefresh policy source).
const src = fs.readFileSync(path.join(REPO, 'scripts', 'policies', 'commitrefresh.js'), 'utf8');
['worldMonsters', '_otherVillage', 'hierarchyState', 'titanCallReadiness', '.roster'].forEach(function (bad) {
  check('commitrefresh has no ' + bad + ' read', src.indexOf(bad) < 0);
});
check('commitrefresh decides from own muster + verb', src.indexOf('titanMusterState') >= 0 && src.indexOf('titanCommitOwn') >= 0);

console.log(pass + ' checks passed' + (process.exitCode ? ' (FAILURES PRESENT)' : ''));
