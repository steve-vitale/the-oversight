#!/usr/bin/env node
// scripts/test-sicktele-b.js — proof for sim-sicktele-b (DIAG, no sims
// re-run: reads the committed trace files + runs the analyzer on them).
// Asserts: 9983 fidelity vs the parent starveplenty trace; elif + marcus
// classify REMOVAL-NO-REGISTER via _cxKillContestant; pilot pooled
// numbers (81 exits, 100% named, 0 gaps); the "is gone" say lines; the
// post-mortem sickness tick on elif; zero src/js diff vs HEAD.
// Usage: node scripts/test-sicktele-b.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const EV = path.join(ROOT, 'evidence', '2026-10-30');
let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra != null ? ' :: ' + extra : '')); }
}
function load(f) { return JSON.parse(fs.readFileSync(path.join(EV, f), 'utf8')); }
function runAnalyzer(files) {
  const out = execSync('node scripts/analyze-sicktele-b.js ' + files.map(f => '"' + path.join(EV, f) + '"').join(' '), { cwd: ROOT }).toString();
  const dec = /{[\s\S]*?}\s*(?={|$)/g; // not used; parse via JSONDecoder-like split below
  // Concatenated pretty JSON objects: split on lines that are exactly '}' followed by '{'
  const parts = [];
  let depth = 0, cur = '';
  for (const line of out.split('\n')) {
    cur += line + '\n';
    for (const ch of line) { if (ch === '{') depth++; if (ch === '}') depth--; }
    if (depth === 0 && cur.trim()) { parts.push(cur); cur = ''; }
  }
  return parts.map(p => JSON.parse(p));
}

const t9983 = load('sim-sicktele-b-trace-9983.json');
const parent = load('sim-starveplenty-b-trace-9983.json');
check('9983 fidelity: 39d village-lost', t9983.days === 39 && t9983.endReason === 'village-lost', t9983.days + '/' + t9983.endReason);
check('9983 harness deaths == parent deaths exactly', JSON.stringify(t9983.harnessDeaths) === JSON.stringify(parent.deaths));
check('9983 trace teles == harness deaths', t9983.teles.length === 14 && t9983.registers.length === 14, t9983.teles.length + '/' + t9983.registers.length);

const a9983 = runAnalyzer(['sim-sicktele-b-trace-9983.json'])[0];
const byVid = {};
for (const c of a9983.classified) byVid[c.vid] = c;
check('9983 exits 7, coverage 1.0', a9983.exits === 7 && a9983.coverage === 1, a9983.exits + '/' + a9983.coverage);
check('9983 delta-deaths 7, gaps 2', a9983.deltaDeaths === 7 && a9983.gaps === 2, a9983.deltaDeaths + '/' + a9983.gaps);
for (const vid of ['elif_demir', 'marcus_webb']) {
  const c = byVid[vid];
  check(vid + ' is REMOVAL-NO-REGISTER gap', c && c.bucket === 'REMOVAL-NO-REGISTER' && c.gap === true, c && c.bucket);
  check(vid + ' mechanism is _cxKillContestant killed', c && /_cxKillContestant/.test(c.mechanism) && /killed/.test(c.mechanism), c && c.mechanism);
}
const rem9983 = {};
for (const r of t9983.removals) rem9983[r.vid] = r;
check('elif removal day 32 how killed, dead flags true', rem9983.elif_demir && rem9983.elif_demir.day === 32 && rem9983.elif_demir.how === 'killed' && rem9983.elif_demir.gpDeadAfter === true);
check('no registerDeath for elif or marcus', !t9983.registers.some(r => r.vid === 'elif_demir' || r.vid === 'marcus_webb'));
check('no tele for elif or marcus', !t9983.teles.some(r => r.who === 'elif_demir' || r.who === 'marcus_webb'));
check('neither gap victim in fallen or corpses', !t9983.finalSnap.fallen.includes('elif_demir') && !t9983.finalSnap.fallen.includes('marcus_webb') && !t9983.finalSnap.corpses.includes('elif_demir'));
const elifSay = t9983.sayLines.find(s => s.day === 32 && /Elif is gone/.test(s.line));
const marcSay = t9983.sayLines.find(s => s.day === 23 && /Marcus is gone/.test(s.line));
check('sense: "Elif is gone" said day 32', !!elifSay, JSON.stringify(elifSay || null));
check('sense: "Marcus is gone" said day 23', !!marcSay, JSON.stringify(marcSay || null));
const postMortem = t9983.hurts.find(h => h.vid === 'elif_demir' && h.day === 32 && h.cause === 'sickness');
check('post-mortem tick: elif day-32 sickness hurt 52->49, off-roster, dead flags true',
  postMortem && postMortem.healthBefore === 52 && postMortem.healthAfter === 49 && postMortem.onRoster === false && postMortem.gpDead === true && postMortem.vpDead === true,
  JSON.stringify(postMortem || null));

const pilotFiles = [];
for (let s = 10201; s <= 10208; s++) pilotFiles.push('sim-sicktele-b-trace-' + s + '.json');
const pilot = runAnalyzer(pilotFiles);
let pExits = 0, pNamed = 0, pGaps = 0, pDelta = 0;
for (const a of pilot) { pExits += a.exits; pNamed += a.named; pGaps += a.gaps; pDelta += a.deltaDeaths; }
check('pilot: 8 seeds present', pilot.length === 8);
check('pilot pooled: 81 exits, 81 named, 0 gaps', pExits === 81 && pNamed === 81 && pGaps === 0, pExits + '/' + pNamed + '/' + pGaps);
check('pilot pooled: delta-deaths 81 (all tele-present)', pDelta === 81, String(pDelta));
check('pilot: no UNEXPLAINED-DELTA anywhere', pilot.every(a => a.classified.every(c => c.bucket !== 'UNEXPLAINED-DELTA')));
check('pilot: no REMOVAL-NO-REGISTER anywhere', pilot.every(a => a.classified.every(c => c.bucket !== 'REMOVAL-NO-REGISTER')));

const srcDiff = execSync('git diff --name-only HEAD -- src/js', { cwd: ROOT }).toString().trim();
check('zero src/js diff vs HEAD (diag-only)', srcDiff === '', srcDiff);
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
