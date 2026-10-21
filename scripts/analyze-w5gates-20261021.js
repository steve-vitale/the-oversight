#!/usr/bin/env node
// analyze-w5gates-20261021.js — gate-decomposition report for the sim-w5gates
// sweep (flesh-out loop, run fleshout-20261021T0146Z, axis scale-onramp).
//
// Reads evidence/2026-10-21/perseed-w5gates/<policy>/s<seed>.json and prints:
//   1. per-run attribution table (outcome, attributed, binding, unmet, distances)
//   2. binding-gate counts (which gate binds most often)
//   3. per-gate reach distributions
//   4. veteran-leg-met vs unlock cross-tab
//   5. wall numbers (national/table/wins, wave reach, survival, death causes)
//   6. SENSE-TESTING: System hold/release lines vs the instrument's gate states
//
// Usage: node scripts/analyze-w5gates-20261021.js [--json]
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const DIR = path.join(REPO, 'evidence', '2026-10-21', 'perseed-w5gates');

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
  // distances for the binding gate
  const d = e.dist || {};
  if (a.binding === 'w3rung') console.log(`       dist: day-short=${d.w3rung.day} l2-short=${d.w3rung.l2}`);
  if (a.binding === 'stand-raw') console.log(`       dist: standing-short=${d['stand-raw'].standing} (raw=${e.raw})`);
  if (a.binding === 'plenty-cap') console.log(`       dist: bread-capped-loss=${d['plenty-cap'].loss} (raw=${e.raw} capped=${e.capped})`);
  if (a.binding === 'defer4' || a.binding === 'defer5') {
    const b = d[a.binding] || {};
    console.log(`       dist: armor+${b.armor} weapons+${b.weapons} tricks+${b.tricks} veterans+${b.veterans} ` +
      `(have a${e[a.binding === 'defer4' ? 'r4' : 'r5'].armored}/w${e[a.binding === 'defer4' ? 'r4' : 'r5'].armed}/t${e[a.binding === 'defer4' ? 'r4' : 'r5'].tricks}/v${e[a.binding === 'defer4' ? 'r4' : 'r5'].veterans})`);
  }
  if (a.binding === 'w4faced') console.log(`       dist: 0 wave-4 types faced (facedPerWave=${JSON.stringify(e.facedPerWave)})`);
}
console.log(`\nPRIMARY: ${R.attributed}/${R.runs} attributed — ${R.attributed === R.runs ? 'GO' : 'NO-GO'}`);

// ---- 2. binding-gate counts ----
console.log('\n=== 2. BINDING-GATE COUNTS (which gate binds most often) ===');
const bc = {};
for (const r of runs) { const b = ((r.end || {}).attr || {}).binding || '?'; bc[b] = (bc[b] || 0) + 1; }
for (const [k, n] of Object.entries(bc).sort((a, b) => b[1] - a[1])) console.log(`  ${k}: ${n}`);

// ---- 3. per-gate reach distributions (end-of-run + ever-in-trace) ----
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

// veterans trajectory summary
const vetMaxes = runs.map(r => r.maxVet5 | 0).sort((a, b) => a - b);
console.log(`  rd5.veterans max over run: [${vetMaxes.join(',')}] (median ${vetMaxes[Math.floor(vetMaxes.length / 2)]})`);

// ---- 4. veteran-leg vs unlock cross-tab ----
console.log('\n=== 4. VETERAN-LEG-MET vs UNLOCK (vgear pilot: 3/16 vet-leg met, 0/16 unlocks) ===');
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
const wr = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
for (const r of runs) for (let w = 1; w <= 5; w++) if ((r.maxWave || 1) >= w) wr[w]++;
const days = runs.map(r => r.gameDays | 0).sort((a, b) => a - b);
const med = days[Math.floor(days.length / 2)];
const causes = {};
for (const r of runs) for (const [k, n] of Object.entries(r.deaths || {})) causes[k] = (causes[k] || 0) + n;
console.log(`  national ${nat}/${R.runs} · table ${tab}/${R.runs} · wins ${won}/${R.runs}`);
console.log(`  wave reach: 1:${wr[1]} 2:${wr[2]} 3:${wr[3]} 4:${wr[4]} 5:${wr[5]}`);
console.log(`  survival days: median ${med}, max ${days[days.length - 1]}, min ${days[0]}`);
console.log('  death causes: ' + Object.entries(causes).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([k, n]) => `${k}=${n}`).join(' · '));

// ---- 6. SENSE-TESTING: hold/release lines vs gate states ----
console.log('\n=== 6. SENSE-TESTING (System hold/release lines vs instrument gate states) ===');
let senseOk = 0, senseBad = 0;
for (const r of runs) {
  const e = r.end || {};
  const lines = r.sayLines || [];
  const hasDefer5 = lines.some(l => /fifth draft stays in the wings/i.test(l.text));
  const hasDefer4 = lines.some(l => /the next act is not for strangers|the next act is still waiting/i.test(l.text));
  const hasCap = lines.some(l => /not bought with bread alone/i.test(l.text));
  const hasRel4 = lines.some(l => /Wave 4 talent has been released/i.test(l.text));
  const hasRel5 = lines.some(l => /greenlit the fifth draft/i.test(l.text));
  const notes = [];
  if ((e.df5 && e.df5.deferred)) { if (hasDefer5) notes.push('defer5-beat✓'); else { notes.push('defer5-beat MISSING'); senseBad++; } }
  if ((e.df4 && e.df4.deferred)) { if (hasDefer4) notes.push('defer4-beat✓'); else { notes.push('defer4-beat MISSING'); senseBad++; } }
  if ((e.raw >= 200) && (e.capped < 200) && (e.peak < 5)) { if (hasCap) notes.push('cap-beat✓'); else { notes.push('cap-beat MISSING'); senseBad++; } }
  if ((e.peak || 0) >= 5) { if (hasRel5) notes.push('release5-beat✓'); else { notes.push('release5-beat MISSING'); senseBad++; } }
  else if ((e.peak || 0) >= 4) { if (hasRel4) notes.push('release4-beat✓'); else { notes.push('release4-beat MISSING'); senseBad++; } }
  if (notes.length) { console.log(`  s${r.seed}/${r.policyId}: ${notes.join(' ')}`); senseOk++; }
}
// quote one defer5 hold beat + one release beat for the sense read
for (const r of runs) {
  const l = (r.sayLines || []).find(x => /fifth draft stays in the wings/i.test(x.text));
  if (l) { console.log(`\n  sample defer5 hold beat (s${r.seed}/${r.policyId} d${l.d}):\n  "${l.text}"`); break; }
}
for (const r of runs) {
  const l = (r.sayLines || []).find(x => /Wave 4 talent has been released/i.test(x.text));
  if (l) { console.log(`\n  sample wave-4 release beat (s${r.seed}/${r.policyId} d${l.d}):\n  "${l.text}"`); break; }
}
console.log(`\n  sense: ${senseOk} runs with voiced gate states checked, ${senseBad} missing beats`);

if (process.argv.includes('--json')) {
  const rep = { runs: R.runs, attributed: R.attributed, unlocked: R.unlocked, bindingCounts: bc, gateReach: g,
    vetLeg: { vmU, vmL, nvmU, nvmL }, wall: { nat, tab, won, wr, medDays: med, causes } };
  fs.writeFileSync(path.join(DIR, 'w5gates-report.json'), JSON.stringify(rep, null, 1));
  console.log('\nwrote ' + path.join(DIR, 'w5gates-report.json'));
}
