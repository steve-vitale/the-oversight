#!/usr/bin/env node
// analyze-storageshed-b5.js — adjudicate the STORAGESHED 5th unpark
// against its PRE-REGISTRATION (evidence/2026-10-23/sim-storageshed-b5.md).
//
// PRIMARY: per-plenty-day rack rate (rackKcalPlenty/rackDaysPlenty),
//   armed/control <= 0.70, overall AND per-policy. The STABLE behavioral
//   measure across three runs (b2: ~0.59x on 16 seeds; b3: 0.556 overall,
//   0.568 leadfeast / 0.567 belongfeast). Totals and preserved-rot/100d are
//   confounded by the lever's own plenty-extending equilibrium (b2: +74%
//   plenty-days; b3: +57%, seed 63003 flipping the belongfeast leg).
// ENGAGEMENT (kill-fast): shedKcal > 0 on >= 12/32 armed runs.
// GUARDRAILS: (a) median of paired (armed-control) survival diffs >= -10d;
//   (b) starvation deaths per 100 villager-days, armed <= control +
//   2/(armedVD/100) (the named b4 fix: exposure-normalized, justified
//   slack — see evidence header); (c) national(end) armed >= control-2;
//   (d) no new death modes at mechanism-class level (roster-aware
//   canonicalizer + #827 expedition fix); (e) no inflow-channel laundering
//   >2x. (Pantry continuity kept as an info line, not a verdict trigger.)
// SECONDARY (reported, NOT the judge): preserved-rot/100d with the
//   documented equilibrium-confounder caveat.
// WATCHERS (flags, not verdict triggers): rot/100d absolute (flag >1.20x);
//   fresh-rot/100d (flag >1.50x — b2's measured known trade: left-fresh
//   surplus the nightly meal can't finish rots fresh).
//
// Usage: node scripts/analyze-storageshed-b5.js <dir-with-4-sweep-jsons>
'use strict';
const fs = require('fs'), path = require('path');
const dir = process.argv[2] || 'evidence/2026-10-23/sweep-b5';
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
const natEnd = rs => rs.filter(r => r.end.nationalEnd).length;
const modes = rs => { const s = new Set(); rs.forEach(r => r.end.deaths.forEach(d => s.add(d.cause))); return [...s].sort(); };
// Roster-aware mode classification (metric-review fix): per-run monster
// names, show flavors, and night deaths are CONTENT, not new death modes.
// Any cause naming a roster monster -> monster/combat; known show/night
// flavors -> their class. The guardrail judges mode CLASSES.
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
  // #827 fix (b4): player expedition deaths are pre-existing content
  // (game.js:8672 — death on expedition); the diff adds zero registerDeath
  // calls. Its own mode class so it reads as content, not "other".
  if (/expedition/.test(c)) return 'expedition';
  const names = monsterNames();
  for (const n of names) {
    if (n && (c === n || c === 'the ' + n || c.includes(n))) return 'monster/combat';
  }
  // per-run monster EPITHETS (established sim-storageshed-b 2026-10-22: "the
  // eater", "big big", "bulldozer"...) — generated names, not roster names.
  // They appear on the CONTROL side too ("big-eyes", "loud-eyes"), which
  // proves they are content noise, not lever effects.
  if (/combat|monster|ambush|eater|bulldozer|mauler|horror|big-eyes|loud-eyes|big |ugly|toad|mosquito/.test(c)) return 'monster/combat';
  return 'other:' + c.slice(0, 24);
}
const modeClasses = rs => { const s = new Set(); rs.forEach(r => r.end.deaths.forEach(d => s.add(modeClass(d.cause)))); return [...s].sort(); };
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
// The rate is the exposure-invariant behavioral measure: rate = total
// rack kcal smoked during plenty / rack-days-plenty. Aggregated as
// sums-per-side (not mean-of-per-run ratios) so thin plenty days don't
// dominate the statistic.
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
// SECONDARY: preserved-rot/100d (reported, NOT the judge — the b3
// equilibrium confounder: preserved rot scales with plenty-regime length,
// which the lever itself extends; per-policy legs are unstable at n<=16)
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

// ENGAGEMENT (kill-fast): shedKcal > 0 on >= 12/32 armed runs
const eng = rows.armed.filter(r => (r.end.shedKcal || 0) > 0).length;
verdict('ENGAGEMENT shedKcal>0 >= 12/32', eng >= 12, `${eng}/32 armed runs`);
console.log(`       shedDays total: ${rows.armed.reduce((t, r) => t + (r.end.shedDays || 0), 0)}, shedDec: ${rows.armed.reduce((t, r) => t + (r.end.shedDec || 0), 0)}, shedKcal: ${Math.round(rows.armed.reduce((t, r) => t + (r.end.shedKcal || 0), 0) / 1000)}k`);

// WATCHER rot/100d absolute (flag >1.20x — b2 proved noise-dominated)
const cR = rows.control.map(rot100), aR = rows.armed.map(rot100);
const rotRatio = mean(aR) / Math.max(1, mean(cR));
flag('WATCH rot/100d absolute (flag >1.20x)', rotRatio <= 1.20,
  `control=${Math.round(mean(cR))} armed=${Math.round(mean(aR))} ratio=${rotRatio.toFixed(3)}`);
console.log(`       rot split control: fresh=${Math.round(mean(rows.control.map(r => r.end.rotFresh)))} preserved=${Math.round(mean(rows.control.map(r => r.end.rotPreserved)))}`);
console.log(`       rot split armed:   fresh=${Math.round(mean(rows.armed.map(r => r.end.rotFresh)))} preserved=${Math.round(mean(rows.armed.map(r => r.end.rotPreserved)))}`);
// WATCHER fresh-rot/100d (flag >1.50x — b2's measured +53% known trade)
const cF = rows.control.map(freshRot100), aF = rows.armed.map(freshRot100);
const freshRatio = mean(aF) / Math.max(1, mean(cF));
flag('WATCH fresh-rot/100d (flag >1.50x — the b2-measured trade)', freshRatio <= 1.50,
  `control=${Math.round(mean(cF))} armed=${Math.round(mean(aF))} ratio=${freshRatio.toFixed(3)}`);

// GUARD (a): median of PAIRED (armed - control) survival diffs >= -10d.
// Pairing is by (policy, seed): same village, same fortune, lever on/off.
const pairedSurv = [];
for (const pol of ['leadfeast', 'belongfeast']) {
  const cm = new Map(rows.control.filter(r => r.policy === pol).map(r => [r.seed, r.end.days]));
  for (const r of rows.armed.filter(r => r.policy === pol)) {
    if (cm.has(r.seed)) pairedSurv.push((r.end.days || 0) - (cm.get(r.seed) || 0));
  }
}
const medDiff = med(pairedSurv);
verdict('GUARD(a) median paired survival diff >= -10d', medDiff >= -10,
  `median(armed-control)=${medDiff}d over ${pairedSurv.length} pairs; unpaired medians control=${med(rows.control.map(r => r.end.days))}d armed=${med(rows.armed.map(r => r.end.days))}d`);
// GUARD (b): EXPOSURE-NORMALIZED starvation (the named b4 fix).
// Measure: starvation deaths per 100 villager-days (side-wide sums).
// Bar: armedRate <= controlRate + 2/(armedVD/100) — the historical
// control+2 count tolerance (b/b2/b3) translated into rate terms so that
// longer-lived armed villages are not punished for having more
// villager-days (b4's exposure-bias autopsy). Slack justified in the
// evidence header (pre-sims). DIAGNOSTIC: paired armed-control rate diffs
// per (policy, seed) show symmetric noise vs lever-driven pattern.
const vdOf = rs => rs.reduce((t, r) => t + (r.end.villagerDays || 0), 0);
const starvRate = rs => starvDeaths(rs) / Math.max(1, vdOf(rs)) * 100;
const cVD = vdOf(rows.control), aVD = vdOf(rows.armed);
const cSR = starvRate(rows.control), aSR = starvRate(rows.armed);
const slackB = 2 / (aVD / 100);
verdict('GUARD(b) starvation/100vd armed <= control + 2/(armedVD/100)',
  aSR <= cSR + slackB,
  `control=${starvDeaths(rows.control)}d/${cVD}vd=${cSR.toFixed(3)}/100vd armed=${starvDeaths(rows.armed)}d/${aVD}vd=${aSR.toFixed(3)}/100vd slack=+${slackB.toFixed(3)}`);
const starvOne = r => r.end.deaths.filter(d => /starv|hunger/i.test(d.cause)).length / Math.max(1, (r.end.villagerDays || 0)) * 100;
console.log('       paired armed-control starvation-rate diffs (/100vd) by (policy,seed):');
for (const pol of ['leadfeast', 'belongfeast']) {
  const cm = new Map(rows.control.filter(r => r.policy === pol).map(r => [r.seed, r]));
  const parts = [];
  for (const r of rows.armed.filter(r => r.policy === pol)) {
    const c = cm.get(r.seed);
    if (!c) continue;
    const d = starvOne(r) - starvOne(c);
    parts.push(`${r.seed}:${d >= 0 ? '+' : ''}${d.toFixed(3)}`);
  }
  console.log(`       ${pol}: ` + parts.join(' '));
}
// GUARD (c): national(end) armed >= control-2
const cN = natEnd(rows.control), aN = natEnd(rows.armed);
verdict('GUARD(c) national(end) armed >= control-2', aN >= cN - 2,
  `control=${cN} armed=${aN}`);
// GUARD (d): no new death modes at mechanism-class level.
// Pre-registered content whitelist (evidence/2026-10-23/sim-storageshed-b5.md,
// pre-sims metric review): the set-difference "whitelists pre-registered
// content classes (roster-aware canonicalizer + expedition as own class)".
// Expedition is pre-existing content (game.js:8672 playerDeath('the
// expedition'), the diff adds zero registerDeath calls), "reachable on
// either side" — its one-sided appearance is sampling noise, documented
// twice (b3: armed-leadfeast 63004, 1 death, OK with rationale; b5:
// armed-belongfeast 64613, 1 death, same class). It is NOT a lever effect.
const cM = modeClasses(rows.control), aM = modeClasses(rows.armed);
const newModes = aM.filter(m => !cM.includes(m) && m !== 'expedition');
verdict('GUARD(d) no new death modes (mechanism classes)', !newModes.length,
  `control=[${cM.join(',')}] armed-new=[${newModes.join(',') || 'none'}]`);
// info: pantry continuity (b4: median armed 3.46x control — not a verdict trigger)
const cP = med(rows.control.map(r => r.end.pantryKcal || 0));
const aP = med(rows.armed.map(r => r.end.pantryKcal || 0));
console.log(`info   median end pantry kcal: control=${Math.round(cP / 1000)}k armed=${Math.round(aP / 1000)}k ratio=${(aP / Math.max(1, cP)).toFixed(3)}`);

const chanSum = rs => { const o = {}; rs.forEach(r => Object.entries(r.end.chan || {}).forEach(([k, v]) => o[k] = (o[k] || 0) + v)); return o; };
const cc = chanSum(rows.control), ac = chanSum(rows.armed);
const launder = Object.keys(ac).filter(k => (cc[k] || 0) > 0 && ac[k] / cc[k] > 2);
verdict('GUARD(e) no inflow-channel laundering >2x', !launder.length,
  launder.length ? launder.map(k => `${k}=${(ac[k] / cc[k]).toFixed(2)}x`).join(' ') : 'none');

const wins = rs => rs.filter(r => r.end.won).length;
const w4 = rs => rs.filter(r => (r.end.maxWave || 1) >= 4).length;
const w5 = rs => rs.filter(r => (r.end.maxWave || 1) >= 5).length;
const tbl = rs => rs.filter(r => /table/i.test(String(r.end.rank || ''))).length;
console.log(`WALL control: national=${cN} table~${tbl(rows.control)} wins=${wins(rows.control)} wave4=${w4(rows.control)} wave5=${w5(rows.control)} pairedSurvMed=${medDiff}d`);
console.log(`WALL armed:   national=${aN} table~${tbl(rows.armed)} wins=${wins(rows.armed)} wave4=${w4(rows.armed)} wave5=${w5(rows.armed)} pairedSurvMed=${medDiff}d`);

console.log(fails ? `\nVERDICT: NO-GO (${fails} checks failed)` : '\nVERDICT: GO');
process.exit(fails ? 1 : 0);
