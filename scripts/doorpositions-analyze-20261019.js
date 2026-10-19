#!/usr/bin/env node
// doorpositions-analyze-20261019.js — compare control vs armed sweeps.
//
// PRIMARY (pre-registered, BINDING): companion join-rate on wave-3 TB
// fight-starts, armed vs control, identical seeds.
//   GO: armed join-rate >= 2x control (absolute gain reported).
// Secondary: presence-channel (a+b) share of wave-3 killing fights.
// Guardrails: median survival >= control-10d; starvation deaths <=
// control+2; no new death mode. Wall numbers: national/table/wins,
// wave4/5, median survival.
//
// Usage: node scripts/doorpositions-analyze-20261019.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const EVID = path.join(REPO, 'evidence', '2026-10-18');

function loadArm(dir) {
  const rows = [];
  for (const f of fs.readdirSync(path.join(EVID, dir))) {
    if (!f.endsWith('.json') || f.startsWith('_')) continue;
    rows.push(JSON.parse(fs.readFileSync(path.join(EVID, dir, f), 'utf8')));
  }
  return rows.filter(r => !r.error);
}
function median(a) {
  const s = [...a].sort((x, y) => x - y);
  return s.length ? s[Math.floor(s.length / 2)] : 0;
}
function summarize(rows) {
  const fights = rows.flatMap(r => r.fights || []);
  const joiners = fights.reduce((a, f) => a + (f.joiners || []).length, 0);
  const joinRate = fights.length ? joiners / fights.length : 0;
  const kills = rows.flatMap(r => r.kills || []);
  const ab = kills.filter(k => k.channel === 'a' || k.channel === 'b').length;
  const survivals = rows.map(r => r.days);
  const starv = rows.reduce((a, r) => a + ((r.deathCauses || {}).starvation || 0), 0);
  const deathModes = {};
  for (const r of rows) for (const [k, v] of Object.entries(r.deathCauses || {})) deathModes[k] = (deathModes[k] || 0) + v;
  return {
    n: rows.length,
    w3Fights: fights.length, joiners, joinRate,
    w3Kills: kills.length, abShare: kills.length ? ab / kills.length : 0,
    medianSurvival: median(survivals), maxSurvival: Math.max(...survivals, 0),
    starvation: starv, deathModes,
    national: rows.filter(r => r.national).length,
    table: rows.filter(r => r.table).length,
    won: rows.filter(r => r.won).length,
    wave4: rows.filter(r => r.wave4).length,
    wave5: rows.filter(r => r.wave5).length,
  };
}
const ctrl = summarize(loadArm('perseed-doorpositions-control'));
const armed = summarize(loadArm('perseed-doorpositions-armed'));
const jr = c => (c * 100).toFixed(1) + '%';
console.log('=== CONTROL (pristine) ==='); console.log(JSON.stringify(ctrl, null, 1));
console.log('=== ARMED (fix) ==='); console.log(JSON.stringify(armed, null, 1));
const ratio = ctrl.joinRate > 0 ? (armed.joinRate / ctrl.joinRate) : (armed.joinRate > 0 ? Infinity : 0);
const go = ctrl.joinRate > 0 ? ratio >= 2 : armed.joinRate > 0.01;
const guardSurv = armed.medianSurvival >= ctrl.medianSurvival - 10;
const guardStarv = armed.starvation <= ctrl.starvation + 2;
const newModes = Object.keys(armed.deathModes).filter(m => !(m in ctrl.deathModes));
console.log('\n=== VERDICT ===');
console.log(`join-rate: control ${jr(ctrl.joinRate)} (${ctrl.joiners}/${ctrl.w3Fights}) vs armed ${jr(armed.joinRate)} (${armed.joiners}/${armed.w3Fights}) — ratio ${ratio === Infinity ? 'inf' : ratio.toFixed(2)}x`);
console.log(`(a+b) share of w3 kills: control ${jr(ctrl.abShare)} vs armed ${jr(armed.abShare)}`);
console.log(`GO (join-rate >= 2x control): ${go ? 'YES' : 'NO'}`);
console.log(`guardrail median survival >= ctrl-10d: ${guardSurv ? 'PASS' : 'FAIL'} (${armed.medianSurvival} vs ${ctrl.medianSurvival})`);
console.log(`guardrail starvation <= ctrl+2: ${guardStarv ? 'PASS' : 'FAIL'} (${armed.starvation} vs ${ctrl.starvation})`);
console.log(`new death modes: ${newModes.length ? newModes.join(', ') : 'none'}`);
console.log(`OVERALL: ${go && guardSurv && guardStarv && newModes.length === 0 ? 'GO' : 'KILLED-AT-PILOT'}`);
