#!/usr/bin/env node
// test-sim-leanlink-rescue.js — proof for arm sim-leanlink-rescue.
// T1 pairing/delta source proof (no harness needed).
// T2 corpus completeness (after the pilot sweep; skipped pre-sweep).
// T3 recomputation of the pre-registered verdict from per-seed JSONs.
// T4 no-trace proof: no src/js file modified, no other policy file touched.
// T5 functional gate proof: leanlinkRescueCourtship tends ONLY trust<40
//   links (stub Game, no harness).
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const REPO = path.join(__dirname, '..');
let fails = 0;
function ok(name, cond, extra) {
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}${extra ? ' ' + extra : ''}`);
  if (!cond) fails++;
}
function read(p) { return fs.readFileSync(path.join(REPO, p), 'utf8'); }

// T1a: competent.js contains no scale verbs.
const comp = read('scripts/policies/competent.js');
for (const v of ['proposeLink', 'tendLink', 'answerCounter', 'answerAccord', 'answerNationalChoice', 'answerGlobalChoice', 'hierarchyState']) {
  ok('T1a competent lacks ' + v, !comp.includes(v));
}
// T1b: leanlinkrescue.js — gate, cap, rescue-tend gate, and nothing else.
const llr = read('scripts/policies/leanlinkrescue.js');
ok('T1b env gate LEANLINKRESCUE=1', llr.includes("LEANLINKRESCUE") && llr.includes("=== '1'"));
ok('T1b off delegates to competent.daily', llr.includes('if (!leanlinkRescueOn()) return competent.daily(Game, ctx)'));
ok('T1b subCap 3', /const subCap = 3;/.test(llr));
ok('T1b no cap 5', !/subCap = 5/.test(llr));
ok('T1b rescue-tend gate trust < 40', llr.includes('trust < 40'));
ok('T1b tend gate pantry > 20000', llr.includes('pantryKcal(Game) > 20000'));
ok('T1b tend gate tendedWeek', llr.includes('link.tendedWeek !== week'));
ok('T1b tend gate primary haven', llr.includes("link.primary === 'haven'"));
ok('T1b propose from 25', llr.includes('proposeFrom = 25'));
ok('T1b tribute 4000', llr.includes('tributeKcalPerWeek: 4000'));
ok('T1b answers counters sweeten>25000', llr.includes('pantryKcal(Game) > 25000') && llr.includes("'sweeten'"));
ok('T1b no src/js require', !/require\([^)]*src\/js/.test(llr));
// T1c: sweep pairs exactly.
const sweep = read('scripts/sim-leanlink-rescue-sweep.js');
ok('T1c sweep control = competent, LEANLINKRESCUE unset', sweep.includes("delete process.env.LEANLINKRESCUE") && sweep.includes("policies', 'competent'"));
ok('T1c sweep armed = leanlinkrescue, LEANLINKRESCUE=1', sweep.includes("process.env.LEANLINKRESCUE = '1'") && sweep.includes("policies', 'leanlinkrescue'"));
ok('T1c sweep no LINKFORM', !sweep.includes('LINKFORM'));

// T5: functional gate proof on a stub Game.
delete process.env.LEANLINKRESCUE;
const { leanlinkRescueCourtship } = require(path.join(REPO, 'scripts', 'policies', 'leanlinkrescue'));
function stubGame(links) {
  const tended = [];
  return {
    tended,
    state: { scholar: { day: 30 }, village: { pantry: [{ kcalEach: 30000, units: 1 }], roster: ['a','b','c','d','e'] }, otherVillages: [] },
    hierarchyState: () => links,
    _week: () => 3,
    tendLink: (id) => { tended.push(id); },
  };
}
const links = [
  { id: 'high', status: 'active', primary: 'haven', trust: 85, tendedWeek: 0 },
  { id: 'atbar', status: 'active', primary: 'haven', trust: 40, tendedWeek: 0 },
  { id: 'dipping', status: 'active', primary: 'haven', trust: 30, tendedWeek: 0 },
  { id: 'low', status: 'active', primary: 'haven', trust: 12, tendedWeek: 0 },
  { id: 'already', status: 'active', primary: 'haven', trust: 20, tendedWeek: 3 },
  { id: 'foreign', status: 'active', primary: 'other', trust: 10, tendedWeek: 0 },
  { id: 'broken', status: 'broken', primary: 'haven', trust: 10, tendedWeek: 0 },
];
const g = stubGame(links);
leanlinkRescueCourtship(g, {});
ok('T5 tends only trust<40 haven-active untended', JSON.stringify(g.tended) === JSON.stringify(['dipping', 'low']), 'tended=' + JSON.stringify(g.tended));
ok('T5 tendTrusts recorded below 40', (() => {
  const ctx = {}; leanlinkRescueCourtship(stubGame(links), ctx);
  return Array.isArray(ctx.tendTrusts) && ctx.tendTrusts.length === 2 && ctx.tendTrusts.every(t => t.trust < 40);
})());

// T4: git status in this worktree — only this arm's files may differ from HEAD.
let status = '';
try { status = execSync('git status --porcelain', { cwd: REPO }).toString(); } catch (e) {}
const changed = status.trim().split('\n').filter(Boolean).map(l => l.slice(3));
const allowed = new Set([
  'scripts/policies/leanlinkrescue.js', 'scripts/sim-leanlink-rescue-sweep.js',
  'scripts/test-sim-leanlink-rescue.js', 'evidence/2026-10-24/sim-leanlink-rescue.md',
]);
const stray = changed.filter(f => !allowed.has(f) && !f.startsWith('evidence/2026-10-24/perseed-leanlinkrescue/') && !f.startsWith('evidence/2026-10-24/perseed-leanlinkrescue-sense/'));
ok('T4 only arm files changed (plus evidence corpus)', stray.length === 0, stray.length ? 'stray=' + stray.join(',') : 'changed=' + changed.join(','));
ok('T4 no src/ change', !changed.some(f => f.startsWith('src/')));

// T2/T3: corpus (skipped pre-sweep).
const EVID = path.join(REPO, 'evidence', '2026-10-24', 'perseed-leanlinkrescue');
const SEEDS = [73501, 73502, 73503, 73504, 73505, 73506, 73507, 73508];
if (!fs.existsSync(EVID)) {
  console.log('SKIP T2/T3: no pilot corpus yet (pre-sweep run)');
} else {
  let complete = true, rows = [];
  for (const s of SEEDS) for (const arm of ['control', 'armed']) {
    const f = path.join(EVID, `s${s}-${arm}.json`);
    if (!fs.existsSync(f)) { complete = false; console.log('MISSING ' + f); continue; }
    try { const d = JSON.parse(fs.readFileSync(f, 'utf8')); rows.push(d); if (!Array.isArray(d.deaths)) complete = false; }
    catch (e) { complete = false; console.log('UNPARSEABLE ' + f); }
  }
  ok('T2 pilot corpus complete 16/16', complete && rows.length === 16, 'rows=' + rows.length);
  if (rows.length === 16) {
    const sum = (arm, fn) => rows.filter(r => r.arm === arm).reduce((t, r) => t + fn(r), 0);
    const natA = sum('armed', r => r.national), natC = sum('control', r => r.national);
    const starv = (arm) => sum(arm, r => (r.deathTotals.byCause.starvation || 0) + (r.deathTotals.byCause.starved || 0));
    // starvation counted by cause-name substring in T3 recompute below
    const starvByName = (arm) => rows.filter(r => r.arm === arm).reduce((t, r) =>
      t + r.deaths.filter(d => /starv/i.test(String(d.cause || ''))).length, 0);
    const med = (arm) => { const v = rows.filter(r => r.arm === arm).map(r => r.gameDays).sort((a, b) => a - b); return (v[3] + v[4]) / 2; };
    const above40 = sum('armed', r => r.tendAbove40 || 0);
    console.log(`T3 recomputed: national armed=${natA} control=${natC}; starvation armed=${starvByName('armed')} control=${starvByName('control')}; median armed=${med('armed')} control=${med('control')}; tendAbove40=${above40}; tendTotal armed=${sum('armed', r => r.court.tended)}`);
    ok('T3 tendAbove40 == 0 (gate held in corpus)', above40 === 0);
    ok('T3 primary national armed>=2 and > control', natA >= 2 && natA > natC);
  }
}

if (fails) { console.error(`TEST-FAIL ${fails} failures`); process.exit(1); }
console.log('TEST-OK');
