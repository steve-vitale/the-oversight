#!/usr/bin/env node
// analyze-storageshed-b3.js — adjudicate the STORAGESHED unpark pilot
// against its TRACKER-NAMED pre-registration
// (evidence/2026-10-22/sim-storageshed-b3.md).
//
// PRIMARY: preserved-rot/100d, armed/control <= 0.80 — the storage half's
//   design purpose (reduce preserved waste). Calibrated: b2 measured
//   preserved rot -28% aggregate (0.716), mechanistically consistent with
//   less smoking. (The 2026-10-22 pilot's rot/100d absolute primary missed
//   at 0.983x (b) / 1.378x (b2): rot is ~90% inflow-driven fresh rot the
//   storage half cannot touch, and it penalizes longer survival.)
// ENGAGEMENT (kill-fast): shedKcal > 0 on >= 6/16 armed runs.
// GUARDRAILS: median survival >= control-10d; starvation deaths <= control+2;
//   national(end) >= control-2; no new death modes (roster-aware
//   canonicalization); no inflow-channel laundering >2x.
// WATCHERS (flags, not verdict triggers — b2 proved these noise-dominated or
//   known trades): rot/100d absolute (flag >1.20x); fresh-rot/100d
//   (flag >1.50x — b2's measured +53% known trade: left-fresh surplus the
//   nightly meal can't finish rots fresh).
// SECONDARIES (reported): rack-kcal-smoked-during-plenty total + per-plenty-
//   day rack rate (b2 measured ~0.59x — mechanism health check).
//
// Usage: node scripts/analyze-storageshed-b3.js <dir-with-4-sweep-jsons>
'use strict';
const fs = require('fs'), path = require('path');
const dir = process.argv[2] || '/tmp/sim-storageshed-b3';
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

// PRIMARY (overall + per-policy): preserved-rot/100d <= 0.80
for (const pol of [null, 'leadfeast', 'belongfeast']) {
  const c = rows.control.filter(r => !pol || r.policy === pol).map(presRot100);
  const a = rows.armed.filter(r => !pol || r.policy === pol).map(presRot100);
  const ratio = mean(a) / Math.max(1, mean(c));
  verdict(`PRIMARY preserved-rot/100d${pol ? ' [' + pol + ']' : ' [all]'} <= 0.80`,
    ratio <= 0.80, `control=${Math.round(mean(c))} armed=${Math.round(mean(a))} ratio=${ratio.toFixed(3)}`);
}

// SECONDARY: rack economics (mechanism health check — b2 measured ~0.59x rate)
for (const pol of [null, 'leadfeast', 'belongfeast']) {
  const c = rows.control.filter(r => !pol || r.policy === pol).map(r => r.end.rackKcalPlenty || 0);
  const a = rows.armed.filter(r => !pol || r.policy === pol).map(r => r.end.rackKcalPlenty || 0);
  const ratio = mean(a) / Math.max(1, mean(c));
  console.log(`info   rack-kcal-smoked-during-plenty${pol ? ' [' + pol + ']' : ' [all]'} ratio=${ratio.toFixed(3)} (control=${Math.round(mean(c) / 1000)}k armed=${Math.round(mean(a) / 1000)}k)`);
  const cpd = rows.control.filter(r => !pol || r.policy === pol);
  const apd = rows.armed.filter(r => !pol || r.policy === pol);
  const cRate = cpd.reduce((t, r) => t + (r.end.rackKcalPlenty || 0), 0) / Math.max(1, cpd.reduce((t, r) => t + (r.end.rackDaysPlenty || 0), 0));
  const aRate = apd.reduce((t, r) => t + (r.end.rackKcalPlenty || 0), 0) / Math.max(1, apd.reduce((t, r) => t + (r.end.rackDaysPlenty || 0), 0));
  console.log(`info   per-plenty-day rack rate${pol ? ' [' + pol + ']' : ' [all]'}: control=${Math.round(cRate)} armed=${Math.round(aRate)} ratio=${(aRate / Math.max(1, cRate)).toFixed(3)}`);
  const cp = rows.control.filter(r => !pol || r.policy === pol).map(r => r.end.rackDaysPlenty || 0);
  const ap = rows.armed.filter(r => !pol || r.policy === pol).map(r => r.end.rackDaysPlenty || 0);
  console.log(`info   rack-days-plenty${pol ? ' [' + pol + ']' : ' [all]'}: control=${Math.round(mean(cp))} armed=${Math.round(mean(ap))} (regime exposure check)`);
}

// ENGAGEMENT
const eng = rows.armed.filter(r => (r.end.shedKcal || 0) > 0).length;
verdict('ENGAGEMENT shedKcal>0 >= 6/16', eng >= 6, `${eng}/16 armed runs`);
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

const cMed = med(rows.control.map(r => r.end.days)), aMed = med(rows.armed.map(r => r.end.days));
verdict('GUARD median survival >= control-10d', aMed >= cMed - 10, `control=${cMed}d armed=${aMed}d`);
const cS = starvDeaths(rows.control), aS = starvDeaths(rows.armed);
verdict('GUARD starvation deaths <= control+2', aS <= cS + 2, `control=${cS} armed=${aS}`);
const cN = natEnd(rows.control), aN = natEnd(rows.armed);
verdict('GUARD national(end) >= control-2', aN >= cN - 2, `control=${cN} armed=${aN}`);
const cM = modeClasses(rows.control), aM = modeClasses(rows.armed);
const newModes = aM.filter(m => !cM.includes(m));
verdict('GUARD no new death modes (mode classes)', !newModes.length,
  `control=[${cM.join(',')}] armed-new=[${newModes.join(',') || 'none'}]`);

const chanSum = rs => { const o = {}; rs.forEach(r => Object.entries(r.end.chan || {}).forEach(([k, v]) => o[k] = (o[k] || 0) + v)); return o; };
const cc = chanSum(rows.control), ac = chanSum(rows.armed);
const launder = Object.keys(ac).filter(k => (cc[k] || 0) > 0 && ac[k] / cc[k] > 2);
verdict('GUARD no inflow-channel laundering >2x', !launder.length,
  launder.length ? launder.map(k => `${k}=${(ac[k] / cc[k]).toFixed(2)}x`).join(' ') : 'none');

const wins = rs => rs.filter(r => r.end.won).length;
const w4 = rs => rs.filter(r => (r.end.maxWave || 1) >= 4).length;
const w5 = rs => rs.filter(r => (r.end.maxWave || 1) >= 5).length;
const tbl = rs => rs.filter(r => /table/i.test(String(r.end.rank || ''))).length;
console.log(`WALL control: national=${cN} table~${tbl(rows.control)} wins=${wins(rows.control)} wave4=${w4(rows.control)} wave5=${w5(rows.control)} medSurv=${cMed}d`);
console.log(`WALL armed:   national=${aN} table~${tbl(rows.armed)} wins=${wins(rows.armed)} wave4=${w4(rows.armed)} wave5=${w5(rows.armed)} medSurv=${aMed}d`);

console.log(fails ? `\nVERDICT: NO-GO (${fails} checks failed)` : '\nVERDICT: GO');
process.exit(fails ? 1 : 0);
