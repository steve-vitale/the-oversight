#!/usr/bin/env node
// test-trickroute-20261017.js — proof for sim-trickroute (flesh-out loop
// DIAGNOSTIC, run fleshout-20261017-061313). Proves:
//   1. classifyRow is deterministic on fixtures (all four classes).
//   2. Precedence edges: kill beats rout; rout needs the three conditions.
//   3. Read-only det-gate: classification never mutates its inputs and two
//      runs over the same inputs produce byte-identical output (no
//      trajectory change is possible — post-hoc, but verified).
//   4. Coverage: every performed row gets a class (100% — the PRIMARY).
// Exit 0 on GREEN, nonzero on RED with the failing assertion named.
'use strict';

const assert = require('assert');
const { classifyRow, classifyRun, rollup, CLASSES } = require('./trickroute-20261017.js');

let passed = 0;
function ok(name, cond) {
  if (!cond) { console.error('RED: ' + name); process.exitCode = 1; return; }
  passed++;
}

// --- 1. all four classes on fixtures ---
const f_killed = { performed: 1, species_killed: 1, kill_attributed: 1, result: 'won' };
const f_routed = { performed: 1, species_killed: 0, kill_attributed: 0, result: 'routed' };
const f_fled = { performed: 1, species_killed: 0, kill_attributed: 0, result: 'fled' };
const f_lost = { performed: 1, species_killed: 0, kill_attributed: 0, result: 'lost' };
ok('killed class', classifyRow(f_killed) === 'killed');
ok('routed-via-trick class', classifyRow(f_routed) === 'routed-via-trick');
ok('fled class', classifyRow(f_fled) === 'fled');
ok('other class (lost)', classifyRow(f_lost) === 'other');

// --- 2. precedence edges ---
// kill beats rout: species dead but result somehow 'routed' -> killed
ok('precedence: kill beats routed',
  classifyRow({ performed: 1, species_killed: 1, kill_attributed: 0, result: 'routed' }) === 'killed');
// rout requires kill_attributed=0: a routed fight that IS kill-attributed
// is not the disengagement class (defensive edge; never seen in census)
ok('precedence: kill_attributed routed is not routed-via-trick',
  classifyRow({ performed: 1, species_killed: 0, kill_attributed: 1, result: 'routed' }) === 'other');
// non-performed rows are not trick resolutions -> null, never 'other'
ok('non-performed -> null', classifyRow({ performed: 0, result: 'won' }) === null);
ok('null row -> null', classifyRow(null) === null);
// every performed row gets a class: fuzz the result/kill matrix
const results = ['won', 'routed', 'fled', 'lost', null, 'weird'];
const sks = [0, 1, null];
const kas = [0, 1, null];
let unclass = 0, total = 0;
for (const r of results) for (const sk of sks) for (const ka of kas) {
  total++;
  const c = classifyRow({ performed: 1, species_killed: sk, kill_attributed: ka, result: r });
  if (!CLASSES.includes(c)) unclass++;
}
ok('coverage: 100% of performed rows classified (' + total + '/' + total + ')', unclass === 0);

// --- 3. read-only det-gate ---
const fixture = [
  { performed: 1, species_killed: 1, kill_attributed: 1, result: 'won', mid: 'hushwolf', kind: 'strike_lead', _file: 'f1.json', fightSeq: 1, day: 19, seed: 1901, policyId: 'leadfeast', wave: 1, n_perfs: 2, rounds: 3, hp_cost: 19, p_survived: 1 },
  { performed: 1, species_killed: 0, kill_attributed: 0, result: 'routed', mid: 'hushwolf', kind: 'strike_lead', _file: 'f1.json', fightSeq: 2, day: 28, seed: 1901, policyId: 'leadfeast', wave: 1, n_perfs: 2, rounds: 3, hp_cost: 7, p_survived: 1 },
  { performed: 1, species_killed: 0, kill_attributed: 0, result: 'lost', mid: 'moderator', kind: 'wait', _file: 'f2.json', fightSeq: 9, day: 120, seed: 1902, policyId: 'belongfeast', wave: 2, n_perfs: 3, rounds: 14, hp_cost: 82, p_survived: 0 },
  { performed: 0, species_killed: 0, kill_attributed: 0, result: 'won', mid: 'bulldozer', kind: 'sidestep', _file: 'f2.json' },
];
const before = JSON.stringify(fixture);
const run1 = JSON.stringify(rollup([['f1.json', classifyRun(fixture)]]));
ok('inputs unchanged after classification (read-only)', JSON.stringify(fixture) === before);
const run2 = JSON.stringify(rollup([['f1.json', classifyRun(JSON.parse(before))]]));
ok('det-gate: two runs byte-identical', run1 === run2);
const census = rollup([['f1.json', classifyRun(fixture)]]);
ok('det-gate tally killed=1', census.tally.killed === 1);
ok('det-gate tally routed-via-trick=1', census.tally['routed-via-trick'] === 1);
ok('det-gate tally other=1', census.tally.other === 1);
ok('det-gate nPerformed=3 (non-performed excluded)', census.nPerformed === 3);
ok('det-gate unclassified=0', census.unclassified === 0);

console.log('GREEN: ' + passed + ' assertions passed (test-trickroute-20261017.js)');
