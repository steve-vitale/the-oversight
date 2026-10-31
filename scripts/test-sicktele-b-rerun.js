#!/usr/bin/env node
// scripts/test-sicktele-b-rerun.js — proof for the 20261031T0007Z re-run
// of sim-sicktele-b (run fleshout-loop-b-20261031T0007Z). Asserts on the
// run-suffixed traces + pilot analysis only; never touches the prior
// run's files. No src/js changes are asserted (diag-only guard).
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const EV = path.join('evidence', '2026-10-30');
const PFX = 'sim-sicktele-b-20261031T0007Z';
let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra !== undefined ? ' :: ' + JSON.stringify(extra) : '')); }
}
const load = f => JSON.parse(fs.readFileSync(path.join(EV, f), 'utf8'));
const t9983 = load(`${PFX}-trace-9983.json`);
// 9983 re-run: trajectory diverged from the prior run (38d/10 teles vs
// 39d/14 teles); elif survives to the scatter, so no elif gap exists.
check('9983 days 38 village-lost', t9983.days === 38 && t9983.endReason === 'village-lost', [t9983.days, t9983.endReason]);
check('9983 teles 10 regs 10', t9983.teles.length === 10 && t9983.registers.length === 10, [t9983.teles.length, t9983.registers.length]);
check('9983 elif in final roster (alive at scatter)', t9983.finalSnap.roster.includes('elif_demir'), t9983.finalSnap.roster);
check('9983 no elif removal', !t9983.removals.some(r => r.vid === 'elif_demir'), t9983.removals.filter(r => r.vid === 'elif_demir'));
check('9983 no elif tele', !t9983.teles.some(x => x.who === 'elif_demir'));
check('9983 marcus alive too (no prior gap recurs)', t9983.finalSnap.roster.includes('marcus_webb'), t9983.finalSnap.roster);
// Pilot analysis: parse the concatenated per-file JSON summaries.
const raw = fs.readFileSync(path.join(EV, `${PFX}-pilot-analysis.json`), 'utf8');
const summaries = [];
{
  // Incremental parse: each summary is one JSON object; scan with a
  // string-aware brace counter and return the end index with the value.
  const parseOne = (s, at) => {
    let depth = 0, inStr = false, esc = false;
    for (let j = at; j < s.length; j++) {
      const c = s[j];
      if (inStr) { if (esc) esc = false; else if (c === '\\') esc = true; else if (c === '"') inStr = false; }
      else if (c === '"') inStr = true;
      else if (c === '{' || c === '[') depth++;
      else if (c === '}' || c === ']') { depth--; if (depth === 0) return { obj: JSON.parse(s.slice(at, j + 1)), end: j + 1 }; }
    }
    throw new Error('unbalanced JSON');
  };
  let i = 0;
  while (i < raw.length) {
    while (i < raw.length && /\s/.test(raw[i])) i++;
    if (i >= raw.length) break;
    const { obj, end } = parseOne(raw, i);
    summaries.push(obj);
    i = end;
  }
}
check('analysis covers 9 traces', summaries.length === 9, summaries.length);
const bySeed = {};
for (const s of summaries) bySeed[s.seed] = s;
check('9983 analysis gaps 0', bySeed[9983].gaps === 0 && bySeed[9983].exits === 6, [bySeed[9983].gaps, bySeed[9983].exits]);
const census = [10211, 10212, 10213, 10214, 10215, 10216, 10217, 10218].map(s => bySeed[s]);
check('census has all 8 seeds', census.every(Boolean) && census.length === 8);
const pooled = census.reduce((a, s) => ({ exits: a.exits + s.exits, named: a.named + s.named, delta: a.delta + s.deltaDeaths, gaps: a.gaps + s.gaps, phantom: a.phantom + s.phantomLethal }), { exits: 0, named: 0, delta: 0, gaps: 0, phantom: 0 });
check('census pooled 83 exits 83 named 0 gaps 0 phantom', pooled.exits === 83 && pooled.named === 83 && pooled.gaps === 0 && pooled.phantom === 0, pooled);
check('census pooled delta 83 all tele-matched', pooled.delta === 83, pooled);
check('every seed coverage 1.0', census.every(s => s.coverage === 1), census.map(s => [s.seed, s.coverage]));
// The contest-death path now registers: 10213 david_kim.
const t213 = load(`${PFX}-trace-10213.json`);
const dkRem = t213.removals.find(r => r.vid === 'david_kim');
const dkReg = t213.registers.find(r => r.vid === 'david_kim');
const dkTel = t213.teles.find(x => x.who === 'david_kim');
check('10213 david_kim removal via _cxKillContestant', !!(dkRem && dkRem.caller === '_cxKillContestant'), dkRem);
check('10213 david_kim registerDeath via _cxKillContestant day 126', !!(dkReg && dkReg.caller === '_cxKillContestant' && dkReg.day === 126), dkReg);
check('10213 david_kim tele day 126 cause contest player false', !!(dkTel && dkTel.day === 126 && dkTel.cause === 'contest' && dkTel.player === false), dkTel);
check('10213 david_kim in fallen, no field corpse (by design)', t213.finalSnap.fallen.includes('david_kim') && !t213.finalSnap.corpses.includes('david_kim'), [t213.finalSnap.fallen.includes('david_kim'), t213.finalSnap.corpses.includes('david_kim')]);
// Diag-only guards.
const jsDiff = execSync('git diff --name-only HEAD -- src/js', { encoding: 'utf8' }).trim();
check('zero src/js diff vs HEAD', jsDiff === '', jsDiff);
const status = execSync('git status --short', { encoding: 'utf8' });
const modifiedTracked = status.split('\n').filter(l => l && !l.startsWith('??'));
check('no tracked file modified (new files only)', modifiedTracked.length === 0, modifiedTracked);
console.log(`\n${pass}/${pass + fail} GREEN`);
process.exit(fail ? 1 : 0);
