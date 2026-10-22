#!/usr/bin/env node
// w5gates-noseat-analyze-20261021.js — gate-decomposition report for the
// sim-w5gates-noseat sweep (flesh-out loop, run fleshout-20261021T2215Z,
// axis scale-onramp). THIRD substrate: plain long SEATDRIVE=0 (no seat
// stack, wins structurally 0).
//
// Reads evidence/2026-10-21/perseed-w5gates-noseat/<policy>/s<seed>.json
// and prints:
//   1. per-run attribution table (outcome, attributed, binding, unmet, distances)
//   2. binding-gate counts (which gate binds most often)
//   3. per-gate reach distributions (end-of-run + ever in daily trace)
//   4. veteran-leg vs unlock cross-tab
//   5. wall numbers (national/table/wins, wave reach, survival, death causes)
//   6. binding-leg-days: which defer5 leg was binding over each run's life
//      (from the daily trace — the sim-w5gates metric review called for
//      this; the terminal snapshot understates bar churn)
//   7. closest run to unlock (fewest remaining shortfalls)
//   8. cross-substrate comparison: vgear substrate (sim-w5gates) vs
//      seatdrive substrate (sim-fullseat) vs this noseat substrate
//   9. SENSE-TESTING: System hold/release lines vs the instrument's gate
//      states (narration-live SENSE runs; the sweep corpus capture is
//      silent by harness design — see sim-w5gates.md metric review)
//
// Usage: node scripts/w5gates-noseat-analyze-20261021.js [--json]
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const DIR = path.join(REPO, 'evidence', '2026-10-21', 'perseed-w5gates-noseat');

const runs = [];
for (const pol of fs.readdirSync(DIR)) {
  const pd = path.join(DIR, pol);
  if (!fs.statSync(pd).isDirectory()) continue;
  for (const f of fs.readdirSync(pd)) {
    if (!/^s\d+\.json$/.test(f)) continue;
    runs.push(JSON.parse(fs.readFileSync(path.join(pd, f), 'utf8')));
  }
}
if (!runs.length) { console.error('no per-seed JSONs'); process.exit(2); }
runs.sort((a, b) => (a.policyId === b.policyId) ? a.seed - b.seed : (a.policyId < b.policyId ? -1 : 1));

const pct = (n, d) => (d ? (100 * n / d).toFixed(1) : '0.0');
const R = { runs: runs.length, attributed: 0, unlocked: 0 };

// ---- 1. per-run attribution ----
console.log('=== 1. PER-RUN ATTRIBUTION (primary metric: 16/16 attributed) ===');
console.log('seed     policy      end(days/reason) uw outcome  attributed binding     unmet');
for (const r of runs) {
  const e = r.end || {}, a = e.attr || {};
  if (a.attributed) R.attributed++;
  if (a.outcome === 'unlocked') R.unlocked++;
  const line = `s${r.seed} ${String(r.policyId).padEnd(11)} ${String(r.gameDays).padStart(3)}d/${String(r.endReason).slice(0, 9).padEnd(9)} ` +
    `uw=${e.uw} ${String(a.outcome || '?').padEnd(8)} ${String(a.attributed)}      ` +
    `${String(a.binding || '-').padEnd(10)} ${(a.unmet || []).join(',')}`;
  console.log(line);
  const d = e.dist || {};
  if (a.binding === 'w3rung') console.log(`       dist: day-short=${d.w3rung.day} l2-short=${d.w3rung.l2}`);
  if (a.binding === 'stand-raw') console.log(`       dist: standing-short=${d['stand-raw'].standing} (raw=${e.raw})`);
  if (a.binding === 'plenty-cap') console.log(`       dist: bread-capped-loss=${d['plenty-cap'].loss} (raw=${e.raw} capped=${e.capped})`);
  if (a.binding === 'defer4' || a.binding === 'defer5') {
    const b = d[a.binding] || {};
    const bars = e[a.binding === 'defer4' ? 'r4' : 'r5'] || {};
    console.log(`       dist: armor+${b.armor} weapons+${b.weapons} tricks+${b.tricks} veterans+${b.veterans} ` +
      `(have a${bars.armored}/w${bars.armed}/t${bars.tricks}/v${bars.veterans})`);
  }
  if (a.binding === 'w4faced') console.log(`       dist: 0 wave-4 types faced (facedPerWave=${JSON.stringify(e.facedPerWave)})`);
}
console.log(`\nPRIMARY: ${R.attributed}/${R.runs} attributed — ${R.attributed === R.runs ? 'GO' : 'NO-GO'}`);

// ---- 2. binding-gate counts ----
console.log('\n=== 2. BINDING-GATE COUNTS (which gate binds most often) ===');
const bc = {};
for (const r of runs) { const b = ((r.end || {}).attr || {}).binding || '?'; bc[b] = (bc[b] || 0) + 1; }
for (const [k, n] of Object.entries(bc).sort((a, b) => b[1] - a[1])) console.log(`  ${k}: ${n}`);

// ---- 3. per-gate reach ----
console.log('\n=== 3. PER-GATE REACH (end-of-run state / ever reached in daily trace) ===');
function reach(pred, everPred) {
  let end = 0, ever = 0;
  for (const r of runs) {
    const e = r.end || {};
    if (pred(e)) end++;
    if (everPred && (r.trace || []).some(everPred)) ever++;
    else if (!everPred && pred(e)) ever = end;
  }
  return { end, ever };
}
const g = {
  'w3 rung met': reach(e => e.w3 && e.w3.met, t => t.d >= 25 && t.l2 >= 4),
  'standing raw>=200 (end/ever)': reach(e => e.raw >= 200, t => t.raw >= 200),
  'capped>=200 (end/ever)': reach(e => e.capped >= 200, t => t.capped >= 200),
  'defer4 not deferred (end)': reach(e => !(e.df4 && e.df4.deferred)),
  'defer5 not deferred (end)': reach(e => !(e.df5 && e.df5.deferred)),
  'rd4 ready (end/ever)': reach(e => e.r4 && e.r4.ready, t => t.r4 && t.r4.ready),
  'rd5 ready (end/ever)': reach(e => e.r5 && e.r5.ready, t => t.r5 && t.r5.ready),
  'rd5 veterans>=2 (end/ever)': reach(e => e.r5 && e.r5.veterans >= 2, t => t.r5 && t.r5.veterans >= 2),
  'rd5 armor>=4 (end/ever)': reach(e => e.r5 && e.r5.armored >= 4, t => t.r5 && t.r5.armored >= 4),
  'rd5 armed>=6 (end/ever)': reach(e => e.r5 && e.r5.armed >= 6, t => t.r5 && t.r5.armed >= 6),
  'rd5 tricks>=3 (end/ever)': reach(e => e.r5 && e.r5.tricks >= 3, t => t.r5 && t.r5.tricks >= 3),
  'w4 faced>0 (end/ever)': reach(e => e.w4faced > 0, t => t.w4faced > 0),
  'unlocked uw>=5 (end/ever)': reach(e => e.uw >= 5, t => t.uw >= 5),
};
for (const [k, v] of Object.entries(g)) console.log(`  ${k}: ${v.end} / ${v.ever}`);
const vetMaxes = runs.map(r => r.maxVet5 | 0).sort((a, b) => a - b);
console.log(`  rd5.veterans max over run: [${vetMaxes.join(',')}] (median ${vetMaxes[Math.floor(vetMaxes.length / 2)]})`);

// ---- 4. veteran-leg vs unlock cross-tab ----
console.log('\n=== 4. VETERAN-LEG-MET vs UNLOCK ===');
let vmU = 0, vmL = 0, nvmU = 0, nvmL = 0;
for (const r of runs) {
  const vm = !!r.everVetLegMet, u = (r.maxWave || 1) >= 5;
  if (vm && u) vmU++; else if (vm && !u) vmL++; else if (!vm && u) nvmU++; else nvmL++;
}
console.log(`  vet-leg met & unlocked: ${vmU} | vet-leg met & locked: ${vmL} | vet-leg unmet & unlocked: ${nvmU} | vet-leg unmet & locked: ${nvmL}`);
console.log(`  veteran leg met ever: ${vmU + vmL}/${R.runs}; unlocks: ${vmU + nvmU}/${R.runs}`);

// ---- 5. wall numbers ----
console.log('\n=== 5. WALL NUMBERS ===');
const nat = runs.filter(r => r.national).length, tab = runs.filter(r => r.table).length, won = runs.filter(r => r.won).length;
const ex = runs.filter(r => r.exiled).length;
const wr = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
for (const r of runs) for (let w = 1; w <= 5; w++) if ((r.maxWave || 1) >= w) wr[w]++;
const days = runs.map(r => r.gameDays | 0).sort((a, b) => a - b);
const med = days[Math.floor(days.length / 2)];
const causes = {};
for (const r of runs) for (const [k, n] of Object.entries(r.deaths || {})) causes[k] = (causes[k] || 0) + n;
console.log(`  national ${nat}/${R.runs} · table ${tab}/${R.runs} · wins ${won}/${R.runs} · exiled ${ex}/${R.runs}`);
console.log(`  wave reach: 1:${wr[1]} 2:${wr[2]} 3:${wr[3]} 4:${wr[4]} 5:${wr[5]}`);
console.log(`  survival days: median ${med}, max ${days[days.length - 1]}, min ${days[0]}`);
console.log('  death causes: ' + Object.entries(causes).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([k, n]) => `${k}=${n}`).join(' · '));

// ---- 6. binding-leg-days (from the daily trace) ----
console.log('\n=== 6. BINDING-LEG-DAYS (defer5 leg shortfall days over each run\'s life) ===');
// Per run: while defer5's conditions hold for the defer (raw bar high
// enough that the readiness demand is the binding question), count days
// each bar (armor/weapons/tricks/veterans) was unmet. Demand is read from
// the end vector (engine's own readyDemand); trace carries the daily bars.
let legTotals = { armor: 0, weapons: 0, tricks: 0, veterans: 0 };
let runsWithDefer5Phase = 0;
for (const r of runs) {
  const e = r.end || {}, dem = e.demand5 || { armored: 4, armed: 6, tricks: 3, veterans: 2 };
  const tr = r.trace || [];
  const legs = { armor: 0, weapons: 0, tricks: 0, veterans: 0 };
  let deferDays = 0;
  for (const t of tr) {
    const b5 = t.r5; if (!b5 || b5.armored == null || b5.armored < 0) continue;
    // defer5 only binds once standing is at the bar (raw>=200 and the cap
    // doesn't already hold it — mirror of villageStandingTotal's holds).
    if (t.raw >= 200 && t.capped >= 200) {
      deferDays++;
      if (b5.armored < (dem.armored || 4)) legs.armor++;
      if (b5.armed < (dem.armed || 6)) legs.weapons++;
      if (b5.tricks < (dem.tricks || 3)) legs.tricks++;
      if (b5.veterans < (dem.veterans || 2)) legs.veterans++;
    }
  }
  if (deferDays > 0) runsWithDefer5Phase++;
  for (const k of Object.keys(legs)) legTotals[k] += legs[k];
  if (deferDays > 0)
    console.log(`  s${r.seed}/${r.policyId}: defer5-phase ${deferDays}d — short armor ${legs.armor}d · weapons ${legs.weapons}d · tricks ${legs.tricks}d · veterans ${legs.veterans}d (end binding: ${(e.attr || {}).binding || '?'})`);
}
console.log(`  defer5-phase reached on ${runsWithDefer5Phase}/${R.runs} runs; leg-short totals: armor ${legTotals.armor} · weapons ${legTotals.weapons} · tricks ${legTotals.tricks} · veterans ${legTotals.veterans}`);

// ---- 7. closest run to unlock ----
console.log('\n=== 7. CLOSEST RUN TO UNLOCK (fewest remaining shortfalls on locked runs) ===');
function shortfallScore(r) {
  const e = r.end || {}, a = e.attr || {}, d = e.dist || {};
  if (a.outcome === 'unlocked') return { score: 0, note: 'UNLOCKED' };
  let score = 0; const parts = [];
  for (const id of ['w3rung', 'stand-raw', 'plenty-cap', 'defer4', 'defer5', 'w4faced']) {
    const g = (a.gates || []).find(x => x.id === id);
    if (g && !g.met) {
      score++;
      let mag = '';
      if (id === 'w3rung') mag = `day-${d.w3rung.day}/l2-${d.w3rung.l2}`;
      if (id === 'stand-raw') mag = `-${d['stand-raw'].standing} standing`;
      if (id === 'plenty-cap') mag = `cap-loss ${d['plenty-cap'].loss}`;
      if (id === 'defer4' || id === 'defer5') { const b = d[id] || {}; mag = `+${b.armor}a +${b.weapons}w +${b.tricks}t +${b.veterans}v`; }
      if (id === 'w4faced') mag = '0 faced';
      parts.push(`${id}(${mag})`);
    }
  }
  return { score, note: parts.join(' ') };
}
const ranked = runs.map(r => ({ r, s: shortfallScore(r) })).sort((a, b) => a.s.score - b.s.score);
for (const { r, s } of ranked.slice(0, 5)) {
  const e = r.end || {};
  console.log(`  s${r.seed}/${r.policyId} ${r.gameDays}d uw=${e.uw} — ${s.score} gate(s) unmet: ${s.note}`);
}
const best = ranked[0];

// ---- 8. cross-substrate comparison ----
console.log('\n=== 8. CROSS-SUBSTRATE: binding-gate distribution (all three mapped substrates) ===');
console.log('  VGEAR (sim-w5gates, 2026-10-21, VGEAR=1/FEASTSCALE_R13=1):');
console.log('    stand-raw 8/16 · defer5 5/16 · plenty-cap 1/16 · w3rung 1/16 · unlocked 1/16');
console.log('  SEATDRIVE (sim-fullseat, 2026-10-21, SEATDRIVE=1/TRIBFLOOR/WINPURSUIT/WINDEFER/FULLSEAT):');
console.log('    defer5 8/16 (veterans 8/8 short, armor 3/8, weapons 1/8) · plenty-cap 2/16 · below-bar(stand-raw) 6/16 · 0/16 unlocks');
console.log('  NOSEAT (this corpus, FEASTSCALE_R13=1/SEATDRIVE=0, plain bases):');
const bcLine = Object.entries(bc).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} ${n}/${R.runs}`).join(' · ');
console.log(`    ${bcLine} · unlocks ${R.unlocked}/${R.runs}`);
console.log(`  closest run: s${best.r.seed}/${best.r.policyId} — ${best.s.score} gate(s) unmet: ${best.s.note}`);

// ---- 9. SENSE-TESTING ----
console.log('\n=== 9. SENSE-TESTING (corpus capture + narration-live SENSE runs) ===');
console.log('  corpus say-capture: runs with >=1 captured gate line (narration is');
console.log('  stubbed at corpus time; captures are opportunistic, not exhaustive):');
let capRuns = 0;
for (const r of runs) {
  const lines = r.sayLines || [];
  if (lines.length) {
    capRuns++;
    console.log(`  s${r.seed}/${r.policyId}: ${lines.length} line(s) — e.g. [d${lines[0].d}] "${lines[0].text.slice(0, 140)}..."`);
  }
}
console.log(`  ${capRuns}/${R.runs} runs captured gate lines in-corpus; the narration-live SENSE run (SENSE=1) carries the authoritative voice-vs-state read.`);

if (process.argv.includes('--json')) {
  const rep = { runs: R.runs, attributed: R.attributed, unlocked: R.unlocked, bindingCounts: bc, gateReach: g,
    vetLeg: { vmU, vmL, nvmU, nvmL }, wall: { nat, tab, won, exiled: ex, wr, medDays: med, causes },
    legTotals, defer5PhaseRuns: runsWithDefer5Phase, closest: { seed: best.r.seed, policy: best.r.policyId, score: best.s.score, note: best.s.note } };
  fs.writeFileSync(path.join(DIR, 'w5gates-noseat-report.json'), JSON.stringify(rep, null, 1));
  console.log('\nwrote ' + path.join(DIR, 'w5gates-noseat-report.json'));
}
