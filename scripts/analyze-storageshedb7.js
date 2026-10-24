#!/usr/bin/env node
// analyze-storageshedb7.js — adjudicate the STORAGESHED 7th unpark
// against its PRE-REGISTRATION (evidence/2026-10-23/sim-storageshed-b7.md).
//
// PRIMARY: per-plenty-day rack rate (rackKcalPlenty/rackDaysPlenty),
//   armed/control <= 0.70, overall AND per-policy (sums-per-side).
// ENGAGEMENT (kill-fast): shedKcal > 0 on >= ENGAGE_NEED armed runs.
// GUARD (b) [binding, the named b6-metric-review next]: EXPOSURE-NORMALIZED
//   starvation — starvation deaths per 100 village-days (sums-per-side:
//   sum(starvDeaths)/sum(villagerDays)*100), armed <= control x 1.10,
//   OVERALL AND PER-POLICY. NOT raw counts (b4's exposure-bias autopsy).
// GUARD (c): median of PAIRED (armed−control) survival diffs >= -10d.
// GUARD (d): no new death kinds — mechanism-class set difference,
//   armed-new = [] after whitelisting pre-existing content classes
//   ('expedition', 'night') AND the >=2-event rule (a class appearing in
//   exactly 1 event total is content noise, not a new death kind).
// GUARD (e): national(end) armed >= control−2; no inflow-channel
//   laundering >2x.
// Pantry/rot channels: REPORT-ONLY (b6's (c) median endFreshDays and
//   watchers move to info lines — no verdict weight).
// Paired-direction starvation (b6's guard (a)): info-only this run.
//
// Usage: node scripts/analyze-storageshedb7.js <dir-with-4-sweep-jsons>
//   ENGAGE_NEED=6 node scripts/analyze-storageshedb7.js evidence/2026-10-23/sweep-storageshedb7
'use strict';
const fs = require('fs'), path = require('path');
const dir = process.argv[2] || 'evidence/2026-10-23/sweep-storageshedb7';
const ENGAGE_NEED = parseInt(process.env.ENGAGE_NEED || '12', 10);
const load = f => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
const files = {
  control: ['sweep-control-leadfeast.json', 'sweep-control-belongfeast.json'],
  armed: ['sweep-armed-leadfeast.json', 'sweep-armed-belongfeast.json'],
};
const rows = { control: [], armed: [] };
for (const side of ['control', 'armed'])
  for (const f of files[side])
    for (const r of load(f).rows) rows[side].push({ policy: load(f).meta.policy, ...r });

const med = a => { const s = a.slice().sort((x, y) => x - y); return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2; };
const mean = a => a.reduce((t, x) => t + x, 0) / Math.max(1, a.length);
const starvDeaths = rs => rs.reduce((t, r) => t + r.end.deaths.filter(d => /starv|hunger/i.test(d.cause)).length, 0);
const vdOf = rs => rs.reduce((t, r) => t + (r.end.villagerDays || 0), 0);
const starvRate100 = rs => starvDeaths(rs) / Math.max(1, vdOf(rs)) * 100;
const natEnd = rs => rs.filter(r => r.end.nationalEnd).length;
// Roster-aware mode classification (metric-review fix): per-run monster
// names, show flavors, and night deaths are CONTENT, not new death modes.
let _monsterNames = null;
function monsterNames() {
  if (!_monsterNames) {
    const m = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'monsters.json'), 'utf8'));
    const arr = Array.isArray(m) ? m : (m.monsters || m.roster || Object.values(m));
    _monsterNames = new Set(arr.map(x => String(x.name || x.id || '').toLowerCase()).filter(Boolean));
  }
  return _monsterNames;
}
function modeClass(cause) {
  const c = String(cause || '').toLowerCase();
  if (/dehydrat|thirst/.test(c)) return 'dehydration';
  if (/starv|hunger/.test(c)) return 'starvation';
  if (/sick|fever|disease|lockjaw/.test(c)) return 'sickness';
  if (/wound/.test(c)) return 'wound';
  if (/contest|gavel|understudy|paparazzo|performance review|static kite/.test(c)) return 'contest/show';
  if (/the night/.test(c)) return 'night';
  if (/expedition/.test(c)) return 'expedition';
  const names = monsterNames();
  for (const n of names) {
    if (n && (c === n || c === 'the ' + n || c.includes(n))) return 'monster/combat';
  }
  if (/combat|monster|ambush|eater|bulldozer|mauler|horror|big-eyes|loud-eyes|big |ugly|toad|mosquito/.test(c)) return 'monster/combat';
  return 'other:' + c.slice(0, 24);
}
const rot100 = r => ((r.end.rotFresh || 0) + (r.end.rotPreserved || 0)) / Math.max(1, r.end.days) * 100;
const presRot100 = r => (r.end.rotPreserved || 0) / Math.max(1, r.end.days) * 100;
const freshRot100 = r => (r.end.rotFresh || 0) / Math.max(1, r.end.days) * 100;

let fails = 0;
const verdict = (name, cond, detail) => {
  console.log(`${cond ? 'GO  ' : 'NO-GO'} ${name}${detail ? ' — ' + detail : ''}`);
  if (!cond) fails++;
};
const flag = (name, cond, detail) => {
  console.log(`${cond ? 'ok  ' : 'FLAG'} ${name}${detail ? ' — ' + detail : ''}`);
};

// PRIMARY (overall + per-policy): per-plenty-day rack rate <= 0.70.
const rateOf = rs => {
  const kcal = rs.reduce((t, r) => t + (r.end.rackKcalPlenty || 0), 0);
  const days = rs.reduce((t, r) => t + (r.end.rackDaysPlenty || 0), 0);
  return kcal / Math.max(1, days);
};
for (const pol of [null, 'leadfeast', 'belongfeast']) {
  const c = rows.control.filter(r => !pol || r.policy === pol);
  const a = rows.armed.filter(r => !pol || r.policy === pol);
  const ratio = rateOf(a) / Math.max(1, rateOf(c));
  verdict(`PRIMARY per-plenty-day rack rate${pol ? ' [' + pol + ']' : ' [all]'} <= 0.70`,
    ratio <= 0.70,
    `control=${Math.round(rateOf(c))}/d armed=${Math.round(rateOf(a))}/d ratio=${ratio.toFixed(3)} (rackDaysPlenty c=${c.reduce((t, r) => t + (r.end.rackDaysPlenty || 0), 0)} a=${a.reduce((t, r) => t + (r.end.rackDaysPlenty || 0), 0)})`);
}
// SECONDARY: preserved-rot/100d (reported, NOT the judge — equilibrium confounder)
for (const pol of [null, 'leadfeast', 'belongfeast']) {
  const c = rows.control.filter(r => !pol || r.policy === pol).map(presRot100);
  const a = rows.armed.filter(r => !pol || r.policy === pol).map(presRot100);
  const ratio = mean(a) / Math.max(1, mean(c));
  console.log(`info   SECONDARY preserved-rot/100d${pol ? ' [' + pol + ']' : ' [all]'} (caveat: exposure-confounded): control=${Math.round(mean(c))} armed=${Math.round(mean(a))} ratio=${ratio.toFixed(3)}`);
}
// SECONDARY: rack-kcal-smoked-during-plenty TOTAL (reported — same confounder)
for (const pol of [null, 'leadfeast', 'belongfeast']) {
  const c = rows.control.filter(r => !pol || r.policy === pol).map(r => r.end.rackKcalPlenty || 0);
  const a = rows.armed.filter(r => !pol || r.policy === pol).map(r => r.end.rackKcalPlenty || 0);
  const ratio = mean(a) / Math.max(1, mean(c));
  console.log(`info   SECONDARY rack-kcal-smoked-during-plenty total${pol ? ' [' + pol + ']' : ' [all]'} (caveat: exposure-confounded): control=${Math.round(mean(c) / 1000)}k armed=${Math.round(mean(a) / 1000)}k ratio=${ratio.toFixed(3)}`);
}

// ENGAGEMENT (kill-fast): shedKcal > 0 on >= ENGAGE_NEED armed runs
const eng = rows.armed.filter(r => (r.end.shedKcal || 0) > 0).length;
verdict(`ENGAGEMENT shedKcal>0 >= ${ENGAGE_NEED}/${rows.armed.length}`, eng >= ENGAGE_NEED, `${eng}/${rows.armed.length} armed runs`);
console.log(`       shedDays total: ${rows.armed.reduce((t, r) => t + (r.end.shedDays || 0), 0)}, shedDec: ${rows.armed.reduce((t, r) => t + (r.end.shedDec || 0), 0)}, shedKcal: ${Math.round(rows.armed.reduce((t, r) => t + (r.end.shedKcal || 0), 0) / 1000)}k`);

// WATCHER rot/100d absolute (flag >1.20x)
const cR = rows.control.map(rot100), aR = rows.armed.map(rot100);
const rotRatio = mean(aR) / Math.max(1, mean(cR));
flag('WATCH rot/100d absolute (flag >1.20x)', rotRatio <= 1.20,
  `control=${Math.round(mean(cR))} armed=${Math.round(mean(aR))} ratio=${rotRatio.toFixed(3)}`);
console.log(`       rot split control: fresh=${Math.round(mean(rows.control.map(r => r.end.rotFresh)))} preserved=${Math.round(mean(rows.control.map(r => r.end.rotPreserved)))}`);
console.log(`       rot split armed:   fresh=${Math.round(mean(rows.armed.map(r => r.end.rotFresh)))} preserved=${Math.round(mean(rows.armed.map(r => r.end.rotPreserved)))}`);
// WATCHER fresh-rot/100d (flag >1.50x)
const cF = rows.control.map(freshRot100), aF = rows.armed.map(freshRot100);
const freshRatio = mean(aF) / Math.max(1, mean(cF));
flag('WATCH fresh-rot/100d (flag >1.50x — the b2-measured trade)', freshRatio <= 1.50,
  `control=${Math.round(mean(cF))} armed=${Math.round(mean(aF))} ratio=${freshRatio.toFixed(3)}`);

// GUARD (b) [BINDING]: EXPOSURE-NORMALIZED starvation — starvation deaths
// per 100 village-days (sums-per-side), armed <= control x 1.10, overall
// AND per-policy. NOT raw counts (b4's exposure-bias autopsy: raw-count
// guardrails miscalibrate under chaos exposure).
for (const pol of [null, 'leadfeast', 'belongfeast']) {
  const c = rows.control.filter(r => !pol || r.policy === pol);
  const a = rows.armed.filter(r => !pol || r.policy === pol);
  const cr = starvRate100(c), ar = starvRate100(a);
  const ratio = ar / Math.max(1e-9, cr);
  verdict(`GUARD(b) exposure-normalized starvation armed <= control x 1.10${pol ? ' [' + pol + ']' : ' [all]'}`,
    ratio <= 1.10,
    `control=${cr.toFixed(3)}/100vd (${starvDeaths(c)}d/${vdOf(c)}vd) armed=${ar.toFixed(3)}/100vd (${starvDeaths(a)}d/${vdOf(a)}vd) ratio=${ratio.toFixed(3)}`);
}
// INFO: paired-direction starvation (b6's guard (a)) — shape comparability only
const starvOne = r => r.end.deaths.filter(d => /starv|hunger/i.test(d.cause)).length / Math.max(1, (r.end.villagerDays || 0)) * 100;
const pairedStarvDiffs = [];
for (const pol of ['leadfeast', 'belongfeast']) {
  const cm = new Map(rows.control.filter(r => r.policy === pol).map(r => [r.seed, r]));
  for (const r of rows.armed.filter(r => r.policy === pol)) {
    const c = cm.get(r.seed);
    if (c) pairedStarvDiffs.push(starvOne(r) - starvOne(c));
  }
}
console.log(`info   paired-direction starvation (b6's (a), INFO ONLY): median(armed-control)=${med(pairedStarvDiffs).toFixed(3)}/100vd over ${pairedStarvDiffs.length} pairs; armed-worse pairs ${pairedStarvDiffs.filter(d => d > 0).length}, armed-better ${pairedStarvDiffs.filter(d => d < 0).length}`);

// GUARD (c): median of PAIRED (armed − control) survival diffs >= -10d.
const pairedSurv = [];
for (const pol of ['leadfeast', 'belongfeast']) {
  const cm = new Map(rows.control.filter(r => r.policy === pol).map(r => [r.seed, r.end.days]));
  for (const r of rows.armed.filter(r => r.policy === pol)) {
    if (cm.has(r.seed)) pairedSurv.push((r.end.days || 0) - (cm.get(r.seed) || 0));
  }
}
const medDiff = med(pairedSurv);
verdict('GUARD(c) median paired survival diff >= -10d', medDiff >= -10,
  `median(armed-control)=${medDiff}d over ${pairedSurv.length} pairs; unpaired medians control=${med(rows.control.map(r => r.end.days))}d armed=${med(rows.armed.map(r => r.end.days))}d`);

// GUARD (d): no new death kinds. Mechanism-class set difference; whitelist
// pre-existing content ('expedition' game.js:8672, 'night'
// engine/calories.js:100,146 — the patch adds zero registerDeath calls);
// >=2-EVENT RULE: a class appearing in exactly 1 event total is content
// noise, not a new death kind.
const classEvents = rs => {
  const o = {};
  rs.forEach(r => r.end.deaths.forEach(d => {
    const mc = modeClass(d.cause);
    o[mc] = (o[mc] || 0) + 1;
  }));
  return o;
};
const WHITELIST = new Set(['expedition', 'night']);
const cCE = classEvents(rows.control), aCE = classEvents(rows.armed);
const newModes = Object.keys(aCE).filter(m => !cCE[m] && !WHITELIST.has(m) && (aCE[m] || 0) >= 2);
const oneEventArmedNew = Object.keys(aCE).filter(m => !cCE[m] && !WHITELIST.has(m) && (aCE[m] || 0) === 1);
verdict('GUARD(d) no new death kinds (>=2 events, pre-existing content whitelisted)',
  !newModes.length,
  `armed-new(>=2)=[${newModes.join(',') || 'none'}]; armed-new(1-event, noise)=[${oneEventArmedNew.map(m => m + '×' + aCE[m]).join(',') || 'none'}]; whitelisted seen: ${[...WHITELIST].filter(m => aCE[m] || cCE[m]).map(m => m + '(c:' + (cCE[m] || 0) + ',a:' + (aCE[m] || 0) + ')').join(' ') || 'none'}`);

// GUARD (e): national(end) armed >= control−2; no inflow-channel laundering >2x
const cN = natEnd(rows.control), aN = natEnd(rows.armed);
verdict('GUARD(e) national(end) armed >= control-2', aN >= cN - 2,
  `control=${cN} armed=${aN}`);
const chanSum = rs => { const o = {}; rs.forEach(r => Object.entries(r.end.chan || {}).forEach(([k, v]) => o[k] = (o[k] || 0) + v)); return o; };
const cc = chanSum(rows.control), ac = chanSum(rows.armed);
const launder = Object.keys(ac).filter(k => (cc[k] || 0) > 0 && ac[k] / cc[k] > 2);
verdict('GUARD(e) no inflow-channel laundering >2x', !launder.length,
  launder.length ? launder.map(k => `${k}=${(ac[k] / cc[k]).toFixed(2)}x`).join(' ') : 'none');

// REPORT-ONLY: pantry/rot channels (no verdict weight)
const cP = med(rows.control.map(r => r.end.pantryKcal || 0));
const aP = med(rows.armed.map(r => r.end.pantryKcal || 0));
console.log(`info   median end pantry kcal (report-only): control=${Math.round(cP / 1000)}k armed=${Math.round(aP / 1000)}k ratio=${(aP / Math.max(1, cP)).toFixed(3)}`);
console.log(`info   median endFreshDays (report-only): control=${med(rows.control.map(r => r.end.endFreshDays || 0))}d armed=${med(rows.armed.map(r => r.end.endFreshDays || 0))}d`);

const wins = rs => rs.filter(r => r.end.won).length;
const w4 = rs => rs.filter(r => (r.end.maxWave || 1) >= 4).length;
const w5 = rs => rs.filter(r => (r.end.maxWave || 1) >= 5).length;
const tbl = rs => rs.filter(r => /table/i.test(String(r.end.rank || ''))).length;
console.log(`WALL control: national=${cN} table~${tbl(rows.control)} wins=${wins(rows.control)} wave4=${w4(rows.control)} wave5=${w5(rows.control)} pairedSurvMed=${medDiff}d`);
console.log(`WALL armed:   national=${aN} table~${tbl(rows.armed)} wins=${wins(rows.armed)} wave4=${w4(rows.armed)} wave5=${w5(rows.armed)} pairedSurvMed=${medDiff}d`);

console.log(fails ? `\nVERDICT: NO-GO (${fails} checks failed)` : '\nVERDICT: GO');
process.exit(fails ? 1 : 0);
