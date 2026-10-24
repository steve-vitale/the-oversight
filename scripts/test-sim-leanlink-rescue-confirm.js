#!/usr/bin/env node
// test-sim-leanlink-rescue-confirm.js — proof for arm sim-leanlink-rescue-confirm.
// T1 pairing/delta source proof (no harness needed) — the confirm reuses the
//   pilot instrument verbatim; this pins that nothing in the pairing drifted.
// T2 confirm corpus completeness (73509-73516 x {control, armed} = 16/16 in
//   perseed-leanlinkrescue-confirm; skipped pre-sweep).
// T3 recomputation of the pre-registered verdict from per-seed JSONs:
//   primary (final national armed>=2 and > control), starvation guardrail,
//   median guardrail, spike-cause naming, ever-reached national, wave/table/
//   wins, tend gate (tendAbove40==0), tend attempts.
// T4 no-trace proof: no src/js file modified, no policy file modified; only
//   this arm's confirm files differ from HEAD.
// T5 functional gate proof on a stub Game (rescue-tend gate unchanged).
// Sensitivity corpus (73517-73520), if present, is REPORTED only — it never
//   enters the T3 verdict.
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
const RANK = { village: 0, regional: 1, national: 2, global: 3 };
function everRank(r) {
  let m = RANK[r.scaleRank] || 0;
  for (const w of (r.trustWeekly || [])) m = Math.max(m, RANK[w.rank] || 0);
  return m;
}
function starvCount(r) { return r.deaths.filter(d => /starv/i.test(String(d.cause || ''))).length; }
function med(v) { const s = v.slice().sort((a, b) => a - b); return (s[3] + s[4]) / 2; }

// T1a: competent.js contains no scale verbs.
const comp = read('scripts/policies/competent.js');
for (const v of ['proposeLink', 'tendLink', 'answerCounter', 'answerAccord', 'answerNationalChoice', 'answerGlobalChoice', 'hierarchyState']) {
  ok('T1a competent lacks ' + v, !comp.includes(v));
}
// T1b: leanlinkrescue.js unchanged in the ways that matter.
const llr = read('scripts/policies/leanlinkrescue.js');
ok('T1b env gate LEANLINKRESCUE=1', llr.includes('LEANLINKRESCUE') && llr.includes("=== '1'"));
ok('T1b off delegates to competent.daily', llr.includes('if (!leanlinkRescueOn()) return competent.daily(Game, ctx)'));
ok('T1b subCap 3', /const subCap = 3;/.test(llr));
ok('T1b rescue-tend gate trust < 40', llr.includes('trust < 40'));
ok('T1b no src/js require', !/require\([^)]*src\/js/.test(llr));
// T1c: sweep pairs exactly and accepts an EVID override (confirm corpus separation).
const sweep = read('scripts/sim-leanlink-rescue-sweep.js');
ok('T1c sweep control = competent, LEANLINKRESCUE unset', sweep.includes('delete process.env.LEANLINKRESCUE') && sweep.includes("policies', 'competent'"));
ok('T1c sweep armed = leanlinkrescue, LEANLINKRESCUE=1', sweep.includes("process.env.LEANLINKRESCUE = '1'") && sweep.includes("policies', 'leanlinkrescue'"));
ok('T1c sweep EVID overridable', sweep.includes("process.env.EVID"));

// T5: functional gate proof on a stub Game.
delete process.env.LEANLINKRESCUE;
const { leanlinkRescueCourtship } = require(path.join(REPO, 'scripts', 'policies', 'leanlinkrescue'));
function stubGame(links) {
  const tended = [];
  return { tended,
    state: { scholar: { day: 30 }, village: { pantry: [{ kcalEach: 30000, units: 1 }], roster: ['a', 'b', 'c', 'd', 'e'] }, otherVillages: [] },
    hierarchyState: () => links, _week: () => 3, tendLink: (id) => { tended.push(id); } };
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

// T4: git status — only this arm's confirm files may differ from HEAD.
let status = '';
try { status = execSync('git status --porcelain', { cwd: REPO }).toString(); } catch (e) {}
const changed = status.trim().split('\n').filter(Boolean).map(l => l.slice(3));
const allowed = new Set([
  'scripts/test-sim-leanlink-rescue-confirm.js',
  'evidence/2026-10-24/sim-leanlink-rescue-confirm.md',
]);
const stray = changed.filter(f => !allowed.has(f)
  && !f.startsWith('evidence/2026-10-24/perseed-leanlinkrescue-confirm/')
  && !f.startsWith('evidence/2026-10-24/perseed-leanlinkrescue-confirm-sense/'));
ok('T4 only confirm files changed (plus confirm corpus)', stray.length === 0, stray.length ? 'stray=' + stray.join(',') : 'changed=' + changed.join(','));
ok('T4 no src/ change', !changed.some(f => f.startsWith('src/')));
ok('T4 no policy file change', !changed.some(f => f.startsWith('scripts/policies/')));

// T2/T3: confirm corpus (skipped pre-sweep).
const EVID = path.join(REPO, 'evidence', '2026-10-24', 'perseed-leanlinkrescue-confirm');
const SEEDS = [73509, 73510, 73511, 73512, 73513, 73514, 73515, 73516];
function loadCorpus(dir, seeds) {
  const rows = []; let complete = true;
  for (const s of seeds) for (const arm of ['control', 'armed']) {
    const f = path.join(dir, `s${s}-${arm}.json`);
    if (!fs.existsSync(f)) { complete = false; console.log('MISSING ' + f); continue; }
    try { const d = JSON.parse(fs.readFileSync(f, 'utf8')); rows.push(d); if (!Array.isArray(d.deaths)) complete = false; }
    catch (e) { complete = false; console.log('UNPARSEABLE ' + f); }
  }
  return { rows, complete };
}
if (!fs.existsSync(EVID)) {
  console.log('SKIP T2/T3: no confirm corpus yet (pre-sweep run)');
} else {
  const { rows, complete } = loadCorpus(EVID, SEEDS);
  if (rows.length === 0) {
    console.log('SKIP T2/T3: confirm corpus dir exists but empty (pre-sweep run)');
  } else {
  ok('T2 confirm corpus complete 16/16', complete && rows.length === 16, 'rows=' + rows.length);
  if (rows.length === 16) {
    const sum = (arm, fn) => rows.filter(r => r.arm === arm).reduce((t, r) => t + fn(r), 0);
    const natA = sum('armed', r => r.national), natC = sum('control', r => r.national);
    const everA = rows.filter(r => r.arm === 'armed' && everRank(r) >= 2).length;
    const everC = rows.filter(r => r.arm === 'control' && everRank(r) >= 2).length;
    const stA = sum('armed', starvCount), stC = sum('control', starvCount);
    const medA = med(rows.filter(r => r.arm === 'armed').map(r => r.gameDays));
    const medC = med(rows.filter(r => r.arm === 'control').map(r => r.gameDays));
    const maxA = Math.max(...rows.filter(r => r.arm === 'armed').map(r => r.gameDays));
    const maxC = Math.max(...rows.filter(r => r.arm === 'control').map(r => r.gameDays));
    const tabA = sum('armed', r => r.table), tabC = sum('control', r => r.table);
    const winA = sum('armed', r => r.won), winC = sum('control', r => r.won);
    const above40 = sum('armed', r => r.tendAbove40 || 0);
    const tendA = sum('armed', r => r.court.tended);
    const villCombatA = sum('armed', r => r.deathTotals.villagerCombat);
    const villCombatC = sum('control', r => r.deathTotals.villagerCombat);
    const waves = {};
    for (const r of rows) { const k = r.arm + ':w' + r.maxWave; waves[k] = (waves[k] || 0) + 1; }
    const causes = {};
    for (const r of rows) for (const d of r.deaths) {
      const key = r.arm + '|' + (d.cause || 'unknown');
      causes[key] = (causes[key] || 0) + 1;
    }
    const spike = Object.keys(causes).filter(k => k.startsWith('armed|') && causes[k] >= 3 && (causes['control|' + k.slice(6)] || 0) === 0);
    console.log(`T3 recomputed: final national armed=${natA} control=${natC}; ever-national armed=${everA} control=${everC}; table armed=${tabA} control=${tabC}; wins armed=${winA} control=${winC}`);
    console.log(`T3 survival: median armed=${medA} control=${medC} (ratio ${(medA / medC).toFixed(2)}, guardrail ${0.8 * medC}); max armed=${maxA} control=${maxC}`);
    console.log(`T3 starvation armed=${stA} control=${stC} (guardrail ${stC + 2}); villager-combat armed=${villCombatA} control=${villCombatC}`);
    console.log(`T3 waves: ${JSON.stringify(waves)}; tend attempts armed=${tendA}, tendAbove40=${above40}`);
    console.log(`T3 spike candidates (>=3 armed, 0 control): ${spike.length ? spike.map(k => k + '=' + causes[k]).join(', ') : 'none'}`);
    ok('T3 primary national armed>=2 and > control', natA >= 2 && natA > natC);
    ok('T3 starvation guardrail armed <= control+2', stA <= stC + 2);
    ok('T3 median guardrail armed >= 0.8*control median', medA >= 0.8 * medC);
    ok('T3 tendAbove40 == 0 (gate held in corpus)', above40 === 0);
    ok('T3 anchor uniform across corpus', new Set(rows.map(r => r.anchorCommit)).size === 1, 'anchors=' + [...new Set(rows.map(r => r.anchorCommit))].join(','));
  }
  // Sensitivity corpus: reported only, never judged.
  const sensDir = EVID;
  const srows = [];
  for (const s of [73517, 73518, 73519, 73520]) for (const arm of ['control', 'armed']) {
    const f = path.join(sensDir, `s${s}-${arm}.json`);
    if (fs.existsSync(f)) { try { srows.push(JSON.parse(fs.readFileSync(f, 'utf8'))); } catch (e) {} }
  }
  if (srows.length) {
    const ssum = (arm, fn) => srows.filter(r => r.arm === arm).reduce((t, r) => t + fn(r), 0);
    console.log(`SENSITIVITY (reported only, never verdict): rows=${srows.length} final national armed=${ssum('armed', r => r.national)} control=${ssum('control', r => r.national)}; ever-national armed=${srows.filter(r => r.arm === 'armed' && everRank(r) >= 2).length} control=${srows.filter(r => r.arm === 'control' && everRank(r) >= 2).length}; starvation armed=${ssum('armed', starvCount)} control=${ssum('control', starvCount)}`);
  } else {
    console.log('SENSITIVITY: no 73517-73520 rows (not run or not yet run)');
  }
  }
}

if (fails) { console.error(`TEST-FAIL ${fails} failures`); process.exit(1); }
console.log('TEST-OK');
