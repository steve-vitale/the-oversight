#!/usr/bin/env node
// test-day100raid-code-b.js — proof for sim-day100raid-code-b (code-read).
// Re-derives the day-100 raid reachability verdict from the code and the
// screen corpus by its own reads (no hand-copied verdicts). DIAG only:
// zero src/js changes, zero game behavior changes.
// Usage: node scripts/test-day100raid-code-b.js
// Exit 0 + PROOF GREEN iff every check passes; otherwise PROOF FAILED.
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const failures = [];
const notes = [];
function check(name, ok, detail) {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
  if (!ok) failures.push(name);
  else if (detail) notes.push(`${name}: ${detail}`);
}
function read(p) { return fs.readFileSync(path.join(ROOT, p), 'utf8'); }
function lineOf(src, needle) {
  const i = src.indexOf(needle);
  if (i < 0) return -1;
  return src.slice(0, i).split('\n').length;
}

// ---- 1. Chain: endDay -> membershipDaily -> hierarchyDaily -> villageAgencyDaily
const memb = read('src/js/membership.js');
check('chain/endDay-wrap-exists', memb.includes('var _endDay = G.endDay'),
  `membership.js:${lineOf(memb, 'var _endDay = G.endDay')}`);
check('chain/membershipDaily-before-original-endDay',
  memb.indexOf('this.membershipDaily()') < memb.indexOf('_endDay ? _endDay.call(this)'),
  `membershipDaily call at line ${lineOf(memb, 'this.membershipDaily()')}, original endDay call later`);
const hier = read('src/js/hierarchy.js');
check('chain/membershipDaily-wrap-exists', hier.includes('var _membershipDaily = G.membershipDaily'),
  `hierarchy.js:${lineOf(hier, 'var _membershipDaily = G.membershipDaily')}`);
check('chain/hierarchyDaily-before-original-membershipDaily',
  hier.indexOf('if (this.hierarchyDaily) this.hierarchyDaily();') < hier.indexOf('_membershipDaily ? _membershipDaily.call(this)'),
  `hierarchyDaily call precedes original membershipDaily call`);
const va = read('src/js/villageAgency.js');
check('chain/hierarchyDaily-wrap-exists', va.includes('var _hierarchyDaily = G.hierarchyDaily'),
  `villageAgency.js:${lineOf(va, 'var _hierarchyDaily = G.hierarchyDaily')}`);
check('chain/villageAgencyDaily-after-original-hierarchyDaily',
  va.indexOf('if (this.villageAgencyDaily) this.villageAgencyDaily();') > va.indexOf('_hierarchyDaily.apply(this, arguments)'),
  `villageAgencyDaily call follows original hierarchyDaily apply`);

// ---- 2. Branch: unconditional take branch; staging runs before it
const branchNeedle = 'if (pr && day > (pr.day || 0))';
check('branch/take-branch-exists', va.includes(branchNeedle),
  `villageAgency.js:${lineOf(va, branchNeedle)}`);
check('branch/take-calls-removePantryKcal-800',
  va.includes('this._removePantryKcal(800)'),
  `villageAgency.js:${lineOf(va, 'this._removePantryKcal(800)')}`);
check('branch/no-other-day-guard-on-branch',
  !/if\s*\(pr && day > \(pr\.day \|\| 0\) &&/.test(va),
  'branch condition is exactly day > pr.day (no extra day guard)');
const simInnerIdx = va.indexOf('this._vaSimInner(ovs[i])');
const branchIdx = va.indexOf(branchNeedle);
check('branch/staging-loop-before-take-branch', simInnerIdx > 0 && branchIdx > simInnerIdx,
  `_vaSimInner loop before take branch in villageAgencyDaily`);
check('branch/stage-sets-pending-day', va.includes('pendingRaidDefense = {') && va.includes('day: day'),
  `_vaStageRaidDefense stamps pendingRaidDefense.day = scholar.day`);
check('branch/famine-guard-blocks-clobber',
  va.includes('if (this.state.pendingBeg || this.state.pendingRaidDefense) return;'),
  `_vaFamineAct returns early when a demand is pending, so a day-99 demand is not clobbered by a day-100 staging`);

// ---- 3. Increment ordering: scholar.day += 1 inside original endDay (after the chain)
const game = read('src/js/game.js');
const incrLine = lineOf(game, 'scholar.day += 1;');
check('increment/scholar-day-increment-in-endDay', incrLine > 0,
  `game.js:${incrLine} (inside original endDay, which runs after the membershipDaily chain per the wrap)`);
check('increment/tickAction-calls-endDay-at-day-budget',
  game.includes('s.dayTicks >= T.TICKS_PER_DAY') && game.includes('this.endDay();'),
  'tickAction fires endDay when the day budget is spent');

// ---- 4. Loop ordering: policy.daily (snapshot) before sleep (endDay), same iteration
const harness = read('scripts/sim-harness.js');
const loopIdx = harness.indexOf('for (day = 1; day <= days');
const dailyIdx = harness.indexOf('policy.daily(Game, ctx)', loopIdx);
const sleepIdx = harness.indexOf('Game.sleep()', loopIdx);
const loopEndIdx = harness.indexOf('}); // end quietLog day loop', loopIdx);
check('loop/policy-daily-before-sleep-in-runDays',
  loopIdx > 0 && dailyIdx > loopIdx && sleepIdx > dailyIdx && sleepIdx < loopEndIdx,
  `runDays loop: policy.daily line ~${harness.slice(0, dailyIdx).split('\n').length}, sleep line ~${harness.slice(0, sleepIdx).split('\n').length}, both inside the day loop`);
const sweep = read('scripts/sweep-raidday100-b.js');
const sweepDailyDef = sweep.indexOf('daily(Game2, ctx) {');
check('loop/sweep-snapshot-inside-policy-daily',
  sweepDailyDef > 0 &&
  sweep.indexOf('competent.daily(Game2, ctx)', sweepDailyDef) > sweepDailyDef &&
  sweep.indexOf('spoilvol.snapshotPantry()', sweepDailyDef) > sweep.indexOf('competent.daily(Game2, ctx)', sweepDailyDef),
  'sweep wrappedPolicy.daily runs competent.daily then takes the spoilDays snapshot (scoped past the earlier opening-stock snapshot)');

// ---- 5. Corpus reconciliation: screen corpus 10100-10139
const corpusDir = path.join(ROOT, 'evidence', '2026-10-27', 'sim-raidday100-b-screen-corpus');
const files = fs.readdirSync(corpusDir).filter(f => f.endsWith('.json')).sort();
let demands = [], takes = [];
const perSeed = {};
for (const f of files) {
  const d = JSON.parse(fs.readFileSync(path.join(corpusDir, f), 'utf8'));
  const dem = (d.raidSayLines || []).filter(r => /Shouts from the treeline/.test(r.line)).map(r => r.day);
  const tak = (d.raidSayLines || []).filter(r => /didn't wait/.test(r.line)).map(r => r.day);
  perSeed[d.seed] = { dem, tak };
  demands.push(...dem.map(day => [d.seed, day]));
  takes.push(...tak.map(day => [d.seed, day]));
}
check('corpus/40-files', files.length === 40, `${files.length} screen corpus files`);
check('corpus/53-demands-52-takes', demands.length === 53 && takes.length === 52,
  `${demands.length} demands, ${takes.length} takes`);
let pairBad = [];
for (const [seed, v] of Object.entries(perSeed)) {
  const exp = v.dem.map(x => x + 1);
  const ok = JSON.stringify(v.tak) === JSON.stringify(exp) || JSON.stringify(v.tak) === JSON.stringify(exp.slice(0, -1));
  if (!ok) pairBad.push([seed, v.dem, v.tak]);
}
check('corpus/take-equals-demand-plus-1-everywhere', pairBad.length === 0,
  pairBad.length ? `mismatches: ${JSON.stringify(pairBad)}` : 'all 40 seeds: takes == demands+1 (or minus the hanging last demand)');
const hanging = Object.entries(perSeed).filter(([, v]) => v.dem.length > v.tak.length)
  .map(([s, v]) => [Number(s), v.dem[v.dem.length - 1]]);
check('corpus/single-hanging-demand-10133-day100',
  hanging.length === 1 && hanging[0][0] === 10133 && hanging[0][1] === 100,
  `hanging demand: seed ${hanging.length ? hanging[0][0] : '?'} day ${hanging.length ? hanging[0][1] : '?'}`);
check('corpus/no-demand-day-99', !demands.some(([, day]) => day === 99),
  `demand days include ${[...new Set(demands.map(([, d]) => d))].sort((a, b) => a - b).filter(d => d >= 95).join(',')} — no 99`);
check('corpus/no-take-after-99', !takes.some(([, day]) => day > 99),
  `max take day ${Math.max(...takes.map(([, d]) => d))}`);

// ---- 6. Recorder log: day-100 call observed, corpus pattern reproduced
const recLogPath = path.join(ROOT, 'evidence', '2026-10-27', 'sim-day100raid-code-b-recorder.log');
let rec = null;
try { rec = JSON.parse(fs.readFileSync(recLogPath, 'utf8')); } catch (e) { /* checked below */ }
check('recorder/log-exists-and-parses', !!rec, rec ? `seed ${rec.seed}, daysAlive ${rec.daysAlive}` : 'missing/unparsable recorder log');
if (rec) {
  check('recorder/seed-10133-survived-100', rec.seed === 10133 && rec.daysAlive === 100 && rec.endReason === 'survived',
    `daysAlive ${rec.daysAlive}, endReason ${rec.endReason}`);
  check('recorder/day-100-call-observed', rec.day100callCount >= 1,
    `${rec.day100callCount} villageAgencyDaily call(s) with day == 100`);
  const d100 = (rec.day100calls || [])[0] || {};
  check('recorder/day-100-call-staged-day-100-demand',
    d100.staged === true && d100.pendingAfter === 100 && d100.takeFired === false,
    `day-100 call: staged=${d100.staged}, pendingAfter=${d100.pendingAfter}, takeFired=${d100.takeFired} (branch evaluated day 100 > 100 = false)`);
  check('recorder/demands-reproduce-corpus-10133',
    JSON.stringify(rec.demandDays) === JSON.stringify([64, 68, 72, 100]),
    `demandDays ${JSON.stringify(rec.demandDays)}`);
  check('recorder/takes-reproduce-corpus-10133',
    JSON.stringify(rec.takeDays) === JSON.stringify([65, 69, 73]),
    `takeDays ${JSON.stringify(rec.takeDays)}`);
  check('recorder/take-branch-fired-at-demand-plus-1',
    JSON.stringify((rec.takeFiredCalls || []).map(c => c.day)) === JSON.stringify([65, 69, 73]) &&
    JSON.stringify((rec.takeFiredCalls || []).map(c => c.pendingBefore)) === JSON.stringify([64, 68, 72]),
    `takeFired at ${JSON.stringify((rec.takeFiredCalls || []).map(c => c.day))} for demands ${JSON.stringify((rec.takeFiredCalls || []).map(c => c.pendingBefore))}`);
  check('recorder/corpus-10133-agrees',
    JSON.stringify(perSeed[10133].dem) === JSON.stringify(rec.demandDays) &&
    JSON.stringify(perSeed[10133].tak) === JSON.stringify(rec.takeDays),
    'recorder demand/take days equal corpus seed-10133 demand/take days');
}

// ---- 7. Analyzer leg: raid100 counts records dated == lastSnapDay
const analyzer = read('scripts/analyze-raidday100-b.js');
const lastSnapLine = analyzer.split('\n').find(l => l.includes('lastSnapDay ='));
check('analyzer/lastSnapDay-from-spoilDays',
  !!lastSnapLine && lastSnapLine.includes('spoilDays'),
  lastSnapLine ? lastSnapLine.trim() : 'no lastSnapDay assignment found');
check('analyzer/raid100-is-day-equals-lastSnapDay',
  analyzer.includes('if (r.day === lastSnapDay)'),
  'raid100 accumulates records with r.day === lastSnapDay');

// ---- 8. Hygiene
let status = '';
try { status = execSync('git status --short', { cwd: ROOT, encoding: 'utf8' }); } catch (e) { status = 'GIT-STATUS-FAILED'; }
const allowed = new Set([
  'evidence/2026-10-27/sim-day100raid-code-b-prereg.md',
  'scripts/test-day100raid-code-b.js',
  'scripts/trace-day100raid-code-b.js',
  'evidence/2026-10-27/sim-day100raid-code-b-recorder.log',
  'evidence/2026-10-27/sim-day100raid-code-b.md',
]);
const badLines = status.split('\n').filter(Boolean).filter(l => {
  const p = l.slice(3).trim();
  return !allowed.has(p);
});
check('hygiene/no-src-js-modified', !status.split('\n').some(l => l.slice(3).trim().startsWith('src/js/')),
  'zero src/js entries in git status');
check('hygiene/no-files-outside-this-run', badLines.length === 0,
  badLines.length ? `unexpected status lines: ${badLines.join('; ')}` : `status shows only this run's files:\n${status.trim().split('\n').join('\n')}`);

console.log(failures.length
  ? `\nPROOF FAILED: ${failures.length} failure(s): ${failures.join(', ')}`
  : '\nPROOF GREEN: all checks pass');
process.exit(failures.length ? 1 : 0);
