#!/usr/bin/env node
// analyze-drinksafe-20261015.js — before/after + GO verdict for sim-drinksafe-b.
// Reads evidence/2026-10-15/drinksafe/run-*.json. Verdict per the
// pre-registered header in evidence/2026-10-15/sim-drinksafe-b.md (§14 binding).
// Usage: node scripts/analyze-drinksafe-20261015.js
'use strict';
const fs = require('fs');
const path = require('path');
const BASE = path.join(__dirname, '..', 'evidence', '2026-10-15', 'drinksafe');
const out = [];
const L = (s) => { out.push(s); console.log(s); };

function load(side) {
  const runs = [];
  for (const f of fs.readdirSync(BASE)) {
    const m = f.match(/^run-(leadcourt|belongseek)-s(\d+)-(control|armed)\.json$/);
    if (m && m[3] === side) runs.push(JSON.parse(fs.readFileSync(path.join(BASE, f), 'utf8')));
  }
  runs.sort((a, b) => (a.policyId + a.seed).localeCompare(b.policyId + b.seed));
  return runs;
}
const med = (a) => { const s = a.slice().sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };

function summarize(side, runs) {
  const s = { side, n: runs.length, runs };
  // route: wild shares + true-wild (dist>1) from visit rows (cap check)
  let tw = 0, tf = 0, capped = 0;
  s.route = { visits: 0, filled: 0, havenFills: 0, wildFills: 0, refused: 0, instrErrors: 0 };
  for (const r of runs) {
    const rt = r.route || {};
    s.route.visits += rt.nWaterTileVisits || 0;
    s.route.filled += rt.nFilledVisits || 0;
    s.route.havenFills += rt.havenFills || 0;
    s.route.wildFills += rt.wildFills || 0;
    s.route.refused += rt.refusedFills || 0;
    s.route.instrErrors += (rt.instrErrors || []).length;
    const rows = rt.visits || [];
    if (rows.length >= 300) capped++;
    const hv = rt.haven || { hx: 4, hy: 4 };
    for (const v of rows) {
      if (Math.abs(v.to.x - hv.hx) + Math.abs(v.to.y - hv.hy) > 1) { tw++; if (v.filled) tf++; }
    }
  }
  s.route.cappedRuns = capped;
  s.route.trueWildVisits = tw; s.route.trueWildFilled = tf;
  s.route.trueWildShare = tw ? tf / tw : null;
  s.route.wildShare = s.route.visits ? s.route.filled / s.route.visits : null;
  // dehy: ranging-dehydration = scholar dehydration death while ranging
  // (rec.ranging = away-from-haven at the death beat, the #292 definition)
  s.dehyTotal = 0; s.dehyRanging = 0;
  for (const r of runs) for (const d of ((r.dehy && r.dehy.deaths) || [])) {
    s.dehyTotal++;
    if (d.ranging === true) s.dehyRanging++;
  }
  // wall
  const days = runs.map(r => r.days);
  s.wall = {
    national: runs.filter(r => r.national).length,
    table: runs.filter(r => r.tableWaiting).length,
    won: runs.filter(r => r.won).length,
    w4: runs.filter(r => r.maxWave >= 4).length,
    w5: runs.filter(r => r.maxWave >= 5).length,
    medianDays: med(days), maxDays: Math.max(...days),
  };
  s.deaths = {};
  for (const r of runs) for (const [k, v] of Object.entries(r.deaths || {})) s.deaths[k] = (s.deaths[k] || 0) + v;
  return s;
}

function main() {
  const ctrl = load('control'), armed = load('armed');
  if (!ctrl.length || !armed.length) { console.error('missing runs'); process.exit(2); }
  const cs = summarize('control', ctrl), as = summarize('armed', armed);
  L('=== sim-drinksafe-b verdict ===');
  L(`runs: control ${cs.n}, armed ${as.n}`);
  L('');
  L('--- MECHANISM: wild water-tile fill share ---');
  for (const s of [cs, as]) {
    const r = s.route;
    L(`[${s.side}] all-wild visits=${r.visits} filled=${r.filled} share=${r.wildShare == null ? 'n/a' : r.wildShare.toFixed(4)} | ` +
      `true-wild visits=${r.trueWildVisits} filled=${r.trueWildFilled} share=${r.trueWildShare == null ? 'n/a' : r.trueWildShare.toFixed(4)} | ` +
      `havenFills=${r.havenFills} wildFills=${r.wildFills} refused=${r.refused}`);
  }
  L(`row-cap hits (300 rows): control ${cs.route.cappedRuns}, armed ${as.route.cappedRuns}`);
  const goMech = cs.route.trueWildShare != null && cs.route.trueWildShare > 0 &&
    as.route.trueWildShare != null && as.route.trueWildShare >= 2 * cs.route.trueWildShare;
  L(`MECHANISM GO (armed true-wild share >= 2x control): ${goMech ? 'GO' : 'MISS'} ` +
    `(${(as.route.trueWildShare || 0).toFixed(4)} vs 2x${(cs.route.trueWildShare || 0).toFixed(4)}=${(2 * (cs.route.trueWildShare || 0)).toFixed(4)})`);
  L('');
  L('--- CO-PRIMARY: ranging-dehydration deaths ---');
  L(`control total=${cs.dehyTotal} ranging=${cs.dehyRanging} | armed total=${as.dehyTotal} ranging=${as.dehyRanging}`);
  const goDehy = as.dehyRanging <= cs.dehyRanging;
  L(`CO-PRIMARY (armed ranging-dehy <= control): ${goDehy ? 'HOLD' : 'MISS'}`);
  L('');
  L('--- GUARDRAILS ---');
  const gMed = as.wall.medianDays >= cs.wall.medianDays - 10;
  const gNat = as.wall.national >= cs.wall.national - 2;
  L(`(d) median survival: armed ${as.wall.medianDays}d vs control ${cs.wall.medianDays}d (bar >= ${cs.wall.medianDays - 10}) -> ${gMed ? 'HOLD' : 'MISS'}`);
  L(`(e) national: armed ${as.wall.national}/${as.n} vs control ${cs.wall.national}/${cs.n} (bar >= ${cs.wall.national - 2}) -> ${gNat ? 'HOLD' : 'MISS'}`);
  const newModes = [];
  for (const [k, v] of Object.entries(as.deaths)) {
    if (v >= 3 && !(cs.deaths[k] >= 1)) newModes.push(`${k} (armed ${v}, control ${cs.deaths[k] || 0})`);
  }
  L(`(f) new death modes (armed n>=3, control 0): ${newModes.length ? newModes.join('; ') : 'none'} -> ${newModes.length ? 'MISS' : 'HOLD'}`);
  L('');
  const go = goMech && goDehy && gMed && gNat && newModes.length === 0;
  L(`GO VERDICT: ${go ? 'GO — pilot qualifies for the 12-16 seed confirm' : 'MISS — revert competent.js byte-clean, evidence-only landing'}`);
  L('');
  L('--- WALL NUMBERS ---');
  for (const s of [cs, as]) {
    L(`[${s.side}] national ${s.wall.national}/${s.n} table ${s.wall.table}/${s.n} won ${s.wall.won}/${s.n} w4 ${s.wall.w4}/${s.n} w5 ${s.wall.w5}/${s.n} median ${s.wall.medianDays}d max ${s.wall.maxDays}d`);
  }
  L('');
  L('--- DEATH CAUSES ---');
  const causes = [...new Set([...Object.keys(cs.deaths), ...Object.keys(as.deaths)])].sort();
  for (const k of causes) L(`  ${k}: control ${cs.deaths[k] || 0} | armed ${as.deaths[k] || 0}`);
  L('');
  L(`instrument errors: control ${cs.route.instrErrors}, armed ${as.route.instrErrors}`);
  fs.writeFileSync(path.join(BASE, 'go-verdict.txt'), out.join('\n') + '\n');
}
main();
