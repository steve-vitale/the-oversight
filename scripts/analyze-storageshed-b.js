#!/usr/bin/env node
// analyze-storageshed-b.js — adjudicate the STORAGESHED pilot against its
// pre-registered thresholds (evidence/2026-10-22/sim-storageshed-b.md).
// Usage: node scripts/analyze-storageshed-b.js <dir-with-4-sweep-jsons>
'use strict';
const fs = require('fs'), path = require('path');
const dir = process.argv[2] || '/tmp/sim-storageshed-b';
const load = f => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
const files = {
  control: ['sweep-control-leadfeast.json', 'sweep-control-belongfeast.json'],
  armed: ['sweep-armed-leadfeast.json', 'sweep-armed-belongfeast.json'],
};
const rows = { control: [], armed: [] };
for (const side of ['control', 'armed'])
  for (const f of files[side])
    for (const r of load(f).rows) rows[side].push({ policy: load(f).meta.policy, ...r });

const rot100 = r => ((r.end.rotFresh || 0) + (r.end.rotPreserved || 0)) / Math.max(1, r.end.days) * 100;
const med = a => { const s = a.slice().sort((x, y) => x - y); return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2; };
const starvDeaths = rs => rs.reduce((t, r) => t + r.end.deaths.filter(d => /starv|hunger/i.test(d.cause)).length, 0);
const natEnd = rs => rs.filter(r => r.end.nationalEnd).length;
const modes = rs => { const s = new Set(); rs.forEach(r => r.end.deaths.forEach(d => s.add(d.cause))); return [...s].sort(); };

const cR = rows.control.map(rot100), aR = rows.armed.map(rot100);
const mean = a => a.reduce((t, x) => t + x, 0) / Math.max(1, a.length);
const ratio = mean(aR) / Math.max(1, mean(cR));
console.log(`PRIMARY rot/100d: control=${Math.round(mean(cR))} armed=${Math.round(mean(aR))} ratio=${ratio.toFixed(3)} (GO<=0.80) -> ${ratio <= 0.80 ? 'GO' : 'NO-GO'}`);
console.log(`  per-seed ratios: ${rows.control.map((r, i) => (aR[i] / Math.max(1, cR[i])).toFixed(2)).join(' ')}`);

const eng = rows.armed.filter(r => (r.end.shedKcal || 0) > 0).length;
console.log(`ENGAGEMENT shedKcal>0: ${eng}/16 (need >=6) -> ${eng >= 6 ? 'OK' : 'KILL-AT-PILOT'}`);
console.log(`  shedDays total: ${rows.armed.reduce((t, r) => t + (r.end.shedDays || 0), 0)}, shedDec: ${rows.armed.reduce((t, r) => t + (r.end.shedDec || 0), 0)}, shedKcal: ${rows.armed.reduce((t, r) => t + (r.end.shedKcal || 0), 0)}`);

const cMed = med(rows.control.map(r => r.end.days)), aMed = med(rows.armed.map(r => r.end.days));
console.log(`GUARD median survival: control=${cMed}d armed=${aMed}d (need >= control-10d=${cMed - 10}d) -> ${aMed >= cMed - 10 ? 'OK' : 'VIOLATION'}`);
const cS = starvDeaths(rows.control), aS = starvDeaths(rows.armed);
console.log(`GUARD starvation deaths: control=${cS} armed=${aS} (need <= control+2=${cS + 2}) -> ${aS <= cS + 2 ? 'OK' : 'VIOLATION'}`);
const cN = natEnd(rows.control), aN = natEnd(rows.armed);
console.log(`GUARD national(end): control=${cN} armed=${aN} (need >= control-2=${cN - 2}) -> ${aN >= cN - 2 ? 'OK' : 'VIOLATION'}`);
const cM = modes(rows.control), aM = modes(rows.armed);
const newModes = aM.filter(m => !cM.includes(m));
console.log(`GUARD death modes: control=[${cM.join(',')}] armed-new=[${newModes.join(',') || 'none'}] -> ${newModes.length ? 'VIOLATION' : 'OK'}`);

const chanSum = rs => { const o = {}; rs.forEach(r => Object.entries(r.end.chan || {}).forEach(([k, v]) => o[k] = (o[k] || 0) + v)); return o; };
const cc = chanSum(rows.control), ac = chanSum(rows.armed);
const launder = Object.keys(ac).filter(k => (cc[k] || 0) > 0 && ac[k] / cc[k] > 2);
console.log(`GUARD channel laundering >2x: ${launder.length ? launder.map(k => `${k}=${(ac[k] / cc[k]).toFixed(2)}x`).join(' ') : 'none'} -> ${launder.length ? 'VIOLATION' : 'OK'}`);

const wins = rs => rs.filter(r => r.end.won).length;
const w4 = rs => rs.filter(r => (r.end.maxWave || 1) >= 4).length;
const w5 = rs => rs.filter(r => (r.end.maxWave || 1) >= 5).length;
const tbl = rs => rs.filter(r => /table/i.test(String(r.end.rank || ''))).length;
console.log(`WALL control: national=${cN} table~${tbl(rows.control)} wins=${wins(rows.control)} wave4=${w4(rows.control)} wave5=${w5(rows.control)} medSurv=${cMed}d`);
console.log(`WALL armed:   national=${aN} table~${tbl(rows.armed)} wins=${wins(rows.armed)} wave4=${w4(rows.armed)} wave5=${w5(rows.armed)} medSurv=${aMed}d`);
console.log(`rot split control: fresh=${Math.round(mean(rows.control.map(r => r.end.rotFresh)))} preserved=${Math.round(mean(rows.control.map(r => r.end.rotPreserved)))}`);
console.log(`rot split armed:   fresh=${Math.round(mean(rows.armed.map(r => r.end.rotFresh)))} preserved=${Math.round(mean(rows.armed.map(r => r.end.rotPreserved)))}`);
