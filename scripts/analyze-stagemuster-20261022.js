#!/usr/bin/env node
// analyze-stagemuster-20261022.js — judge the sim-stagemuster pilot
// against the binding pre-registration in evidence/2026-10-22/
// sim-stagemuster.md (§14). The panel is the instrument; this header is
// the judge.
//
// Usage: node scripts/analyze-stagemuster-20261022.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = process.env.REPO || path.join(__dirname, '..');
const DIR = path.join(REPO, 'evidence', '2026-10-22', 'perseed-stagemuster');

function load(dir) {
  const rows = [];
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith('.json')) continue;
    rows.push(JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
  }
  return rows;
}
const rows = load(DIR);
const control = rows.filter(r => r.arm === 'control');
const armed = rows.filter(r => r.arm === 'stagemuster');
console.log(`configs: control=${control.length} armed=${armed.length}`);

const sum = (rs, k) => rs.reduce((t, r) => t + ((r[k] | 0) || 0), 0);
// Damage-majority villager wave-4 kills: kill-time villager credit AND
// >=50% of the kill's fight damage from non-scholar sources.
function dmgMajKills(r) {
  return (r.w4killRows || []).filter(k => k.killTimeVillager && k.dmgMaj).length;
}
function killTimeKills(r) {
  return (r.w4killRows || []).filter(k => k.killTimeVillager).length;
}

// ---------- PRIMARY (mechanism, binding) ----------
// Armed wave-4 TB fights with engagedCompanions() non-empty >= 8 across
// the pilot sweep.
const armedStaged = sum(armed, 'nW4StagedFights');
const controlStaged = sum(control, 'nW4StagedFights');
const armedTb = sum(armed, 'nW4TbFights');
const controlTb = sum(control, 'nW4TbFights');
const primaryGo = armedStaged >= 8;
console.log(`PRIMARY: armed staged wave-4 TB fights = ${armedStaged}/${armedTb} (bar >= 8) -> ${primaryGo ? 'GO' : 'NO-GO'}`);
console.log(`         control staged = ${controlStaged}/${controlTb}`);

// ---------- DELTA (layer-judging, binding) ----------
// The redesign must ADD staging beyond the fire-side baseline:
// armed staged >= control staged + 4.
const deltaGo = armedStaged >= controlStaged + 4;
console.log(`DELTA: armed ${armedStaged} vs control ${controlStaged} (bar >= control+4) -> ${deltaGo ? 'GO' : 'NO-GO'}`);

// ---------- SECONDARY (capability, binding, conditional on staging) ----------
// Villager wave-4 kills, damage-majority: armed >= control + 2.
// Also report kill-time numbers (finding (b): report both).
const armedDm = armed.reduce((t, r) => t + dmgMajKills(r), 0);
const controlDm = control.reduce((t, r) => t + dmgMajKills(r), 0);
const armedKt = armed.reduce((t, r) => t + killTimeKills(r), 0);
const controlKt = control.reduce((t, r) => t + killTimeKills(r), 0);
const secondaryGo = armedDm >= controlDm + 2;
console.log(`SECONDARY: villager wave-4 kills damage-majority armed=${armedDm} control=${controlDm} (bar >= control+2) -> ${secondaryGo ? 'GO' : 'NO-GO'}`);
console.log(`           kill-time villager wave-4 kills armed=${armedKt} control=${controlKt}`);

// ---------- GUARDRAILS (binding) ----------
// median survival (non-winning, per-seed matched)
function medSurv(rs) {
  const ds = rs.filter(r => !r.won && (r.gameDays | 0) > 0).map(r => r.gameDays).sort((a, b) => a - b);
  return ds.length ? ds[Math.floor(ds.length / 2)] : null;
}
const mc = medSurv(control), ma = medSurv(armed);
const survOk = mc != null && ma != null && Math.abs(ma - mc) <= 10;
console.log(`guardrail median survival: control=${mc} armed=${ma} (|diff|<=10) -> ${survOk ? 'PASS' : 'FAIL'}`);
const sc = sum(control, 'starvationDeaths'), sa = sum(armed, 'starvationDeaths');
console.log(`guardrail starvation: control=${sc} armed=${sa} (bar <= ${sc + 2}) -> ${sa <= sc + 2 ? 'PASS' : 'FAIL'}`);
// new death mode: >=2 events on armed, 0 on control
const dcC = {}, dcA = {};
for (const r of control) for (const [k, v] of Object.entries(r.deathCauses || {})) dcC[k] = (dcC[k] || 0) + v;
for (const r of armed) for (const [k, v] of Object.entries(r.deathCauses || {})) dcA[k] = (dcA[k] || 0) + v;
const newModes = Object.keys(dcA).filter(k => (dcA[k] | 0) >= 2 && !(dcC[k] | 0));
console.log(`guardrail new death mode: ${newModes.length ? newModes.join(', ') : 'none'} -> ${newModes.length ? 'FAIL' : 'PASS'}`);
// scholar-combat-mortality/100d (paired per seed)
function schMort100(rs) {
  return rs.map(r => ({ seed: r.seed + '|' + (r.policy || '').split('-')[0], v: ((r.scholarCombatDeaths | 0) * 100) / Math.max(1, r.gameDays || 0) }));
}
const cmC = schMort100(control), cmA = schMort100(armed);
let diffSum = 0, n = 0;
for (const a of cmA) {
  const c = cmC.find(x => x.seed === a.seed);
  if (c) { diffSum += a.v - c.v; n++; }
}
const mortDiff = n ? diffSum / n : null;
console.log(`guardrail scholar-combat-mortality/100d paired diff: ${mortDiff == null ? 'n/a' : mortDiff.toFixed(2)} (bar <= +2) -> ${mortDiff != null && mortDiff <= 2 ? 'PASS' : 'FAIL'}`);
// wave-4 unlocks not reduced
const w4c = sum(control, 'wave4'), w4a = sum(armed, 'wave4');
console.log(`guardrail wave-4 unlocks: control=${w4c} armed=${w4a} (armed >= control) -> ${w4a >= w4c ? 'PASS' : 'FAIL'}`);

// ---------- mechanism telemetry ----------
function teleSum(rs) {
  const t = {};
  for (const r of rs) for (const [k, v] of Object.entries(r.smTele || {})) t[k] = (t[k] | 0) + (v | 0);
  return t;
}
console.log('armed smTele:', JSON.stringify(teleSum(armed)));
console.log('control smTele:', JSON.stringify(teleSum(control)));

// ---------- wall numbers ----------
function wall(rs, label) {
  const ds = rs.map(r => r.gameDays || 0).sort((a, b) => a - b);
  const med = ds.length ? ds[Math.floor(ds.length / 2)] : 0;
  console.log(`${label}: n=${rs.length} national=${sum(rs, 'national')} table=${sum(rs, 'table')} won=${sum(rs, 'won')} wave4=${sum(rs, 'wave4')} wave5=${sum(rs, 'wave5')} exiled=${sum(rs, 'exiled')} medSurv=${med} maxSurv=${ds[ds.length - 1] || 0} w5vets2=${rs.filter(r => (r.w5vetsMax | 0) >= 2).length} w4kills=${sum(rs, 'w4kills')}`);
}
wall(control, 'control');
wall(armed, 'armed  ');

// ---------- death-cause shares ----------
const tot = {};
let totN = 0;
for (const r of rows) for (const [k, v] of Object.entries(r.deathCauses || {})) { tot[k] = (tot[k] | 0) + v; totN += v; }
console.log(`deaths n=${totN}:`, Object.entries(tot).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, v]) => `${k} ${(100 * v / totN).toFixed(1)}%`).join(', '));

// ---------- verdict (matches the binding pre-registration: GO-to-confirm =
// primary AND delta; a secondary miss with primary+delta GO is a capability
// question for the confirm, not a pilot kill) ----------
const goToConfirm = primaryGo && deltaGo;
console.log(`\nVERDICT: primary ${primaryGo ? 'GO' : 'NO-GO'} | delta ${deltaGo ? 'GO' : 'NO-GO'} | secondary ${secondaryGo ? 'GO' : 'NO-GO'} -> pilot ${goToConfirm ? 'GO-to-confirm' : 'NO-GO'}${goToConfirm && !secondaryGo ? ' (capability question for confirm: kills are rare at n=8 seeds)' : ''}`);
if (armedStaged === 0) console.log('KILL AT PILOT: zero staged fights — the staging channel cannot be manufactured policy-side.');
