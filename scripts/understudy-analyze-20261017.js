#!/usr/bin/env node
// understudy-analyze-20261017.js — analyze the sim-understudy pilot sweep.
//
// Reads evidence/2026-10-17/perseed-understudy/*.json, compares control vs
// armed against the pre-registered primary and guardrails.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const EVID = path.join(REPO, 'evidence', '2026-10-17', 'perseed-understudy');

function load(arm) {
  const rows = [];
  for (const fp of fs.readdirSync(EVID)) {
    if (!fp.startsWith(arm + '-') || fp.includes('summary')) continue;
    if (!fp.endsWith('.json')) continue;
    try { rows.push(JSON.parse(fs.readFileSync(path.join(EVID, fp), 'utf8'))); }
    catch (e) { console.error('bad json: ' + fp); }
  }
  return rows;
}

function median(xs) {
  if (!xs.length) return 0;
  const s = xs.slice().sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

function summarize(arm) {
  const rows = load(arm);
  const fw = rows.reduce((a, r) => a + (r.freshWeaponPerfs || 0), 0);
  const national = rows.reduce((a, r) => a + (r.national || 0), 0);
  const days = rows.map(r => r.days || 0);
  const scd = rows.reduce((a, r) => a + (r.scholarCombatDeaths || 0), 0);
  const deathModes = {};
  for (const r of rows) {
    for (const k of Object.keys(r.deaths || {})) {
      deathModes[k] = (deathModes[k] || 0) + r.deaths[k];
    }
  }
  return {
    arm, n: rows.length, freshWeapon: fw, national,
    medianDays: median(days), scholarCombatDeaths: scd,
    deathModes,
    rows: rows.map(r => ({
      seed: r.seed, policy: r.policy, days: r.days, end: r.endReason,
      fw: r.freshWeaponPerfs, national: r.national, scd: r.scholarCombatDeaths,
    })),
  };
}

const c = summarize('control');
const a = summarize('armed');

console.log('=== CONTROL (n=' + c.n + ') ===');
console.log('  fresh_weapon performances: ' + c.freshWeapon);
console.log('  national: ' + c.national + '/' + c.n);
console.log('  median survival: ' + c.medianDays + 'd');
console.log('  scholar combat deaths: ' + c.scholarCombatDeaths);
console.log('=== ARMED (n=' + a.n + ') ===');
console.log('  fresh_weapon performances: ' + a.freshWeapon);
console.log('  national: ' + a.national + '/' + a.n);
console.log('  median survival: ' + a.medianDays + 'd');
console.log('  scholar combat deaths: ' + a.scholarCombatDeaths);
console.log('=== DELTAS (armed - control) ===');
console.log('  PRIMARY fresh_weapon: ' + (a.freshWeapon - c.freshWeapon) + ' (bar: >= 4)');
console.log('  national: ' + (a.national - c.national) + ' (bar: >= -2)');
console.log('  median survival: ' + (a.medianDays - c.medianDays) + 'd (bar: >= -10)');
console.log('  scholar combat deaths: ' + (a.scholarCombatDeaths - c.scholarCombatDeaths) + ' (bar: <= +2)');
console.log('\n=== DEATH MODES (control) ===');
for (const k of Object.keys(c.deathModes).sort()) console.log('  ' + k + ': ' + c.deathModes[k]);
console.log('=== DEATH MODES (armed) ===');
for (const k of Object.keys(a.deathModes).sort()) console.log('  ' + k + ': ' + a.deathModes[k]);
const newModes = Object.keys(a.deathModes).filter(k => !c.deathModes[k]);
console.log('new modes in armed: ' + (newModes.length ? newModes.join(', ') : '(none)'));
console.log('\n=== PER-RUN (armed) ===');
for (const r of a.rows) console.log(`  s${r.seed}/${r.policy}: days=${r.days} end=${r.end} fw=${r.fw} nat=${r.national} scd=${r.scd}`);
