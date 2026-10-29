#!/usr/bin/env node
// scripts/test-pickband-a-fixtures.js — sim-pickband-a arm-leg
// fixtures (NOT a join-rule proof: the join rule is departlag's,
// reused verbatim by import, and proven by
// scripts/test-departlag-a-fixtures.js 18/18). These fixtures
// prove only this arm's own wiring: the fixed seed band, the
// corpus dir, the forced-recorders sweep, and that the analyzer's
// imported classifyPick behaves on two synthetic traces.
// No game code, no corpus. Exit 0 only on full pass.
'use strict';
const fs = require('fs');
const path = require('path');
const { classifyPick } = require('./test-departlag-a');
const { SEEDS } = require('./test-pickband-a');
const REPO = path.join(__dirname, '..');
let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; }
  else { fail++; console.log(`FAIL ${name}${extra ? ' :: ' + extra : ''}`); }
}
check('seed-band', JSON.stringify(SEEDS) === JSON.stringify([75117, 75118, 75119, 75120, 75121, 75122, 75123, 75124]), JSON.stringify(SEEDS));
const sweep = fs.readFileSync(path.join(REPO, 'scripts', 'test-pickband-a-sweep.js'), 'utf8');
check('sweep-seeds', sweep.indexOf('75117,75118,75119,75120,75121,75122,75123,75124') >= 0);
check('sweep-corpus-dir', sweep.indexOf('perseed-pickband-a') >= 0);
check('sweep-departhold-forced', sweep.indexOf("process.env.DEPARTHOLD = '1'") >= 0);
check('sweep-no-funnel-band', sweep.indexOf('75101') < 0 && sweep.indexOf('75106') < 0, 'funnel band seeds must not appear in the pickband sweep');
const analyzer = fs.readFileSync(path.join(REPO, 'scripts', 'test-pickband-a.js'), 'utf8');
check('analyzer-imports-departlag', analyzer.indexOf("require('./test-departlag-a')") >= 0);
check('analyzer-no-own-join', analyzer.indexOf('function classifyPick') < 0, 'analyzer must not reimplement the join');
const mons = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'monsters.json'), 'utf8'));
const mlist = Array.isArray(mons) ? mons : (mons.monsters || []);
const w4 = new Set(mlist.filter(m => (m.wave | 0) === 4).map(m => m.id));
check('wave4-lookup-has-eulogy', w4.has('eulogy'));
check('wave4-lookup-nonempty', w4.size >= 8, `w4 size=${w4.size}`);
// Synthetic import sanity (mirrors departlag fixtures 2/3, proves
// the import this arm actually uses, not a copy).
function row(o) {
  return { seed: 99999, days: 180, funnel: { picks: o.picks || [] },
    returns: { departures: o.deps || [], drops: o.drops || [] }, deathsList: o.deaths || [] };
}
function pick(vid, day, part, mid, huntDay) { return { vid, day, part, chosen: { kind: 'HUNT', huntMid: mid, huntDay } }; }
function dep(vid, day, part, mid, huntDay) { return { vid, day, part, objective: { kind: 'HUNT', huntMid: mid, huntDay } }; }
let c = classifyPick(pick('v1', 135, 536, 'eulogy', 132), row({ picks: [pick('v1', 135, 536, 'eulogy', 132), pick('v1', 138, 549, 'x', null)],
  deps: [dep('v1', 137, 544, 'eulogy', 132)], drops: [{ vid: 'v1', mid: 'eulogy', day: 137, part: 545, dropped: true }] }));
check('import-departed-stale', c.cls === 'DEPARTED' && c.lagDays === 2 && c.staleAtDeparture && c.dropped, JSON.stringify(c));
c = classifyPick(pick('v1', 135, 536, 'eulogy', 132), row({ picks: [pick('v1', 135, 536, 'eulogy', 132), { vid: 'v1', day: 135, part: 539, chosen: { kind: 'EAT' } }] }));
check('import-superseded-needs', c.cls === 'SUPERSEDED' && c.subKind === 'NEEDS' && c.lagParts === 3, JSON.stringify(c));
console.log(`FIXTURES ${pass}/${pass + fail} ${fail === 0 ? 'PASS' : 'FAIL'}`);
process.exit(fail === 0 ? 0 : 1);
