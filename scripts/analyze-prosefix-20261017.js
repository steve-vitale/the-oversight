#!/usr/bin/env node
// scripts/analyze-prosefix-20261017.js — det-gate + variety + wall metrics for
// the sim-prosefix-b sweep (control vs armed, identical seeds).
//
// Reads evidence/2026-10-17/perseed-prosefix/<side>-<pid>-s<seed>.{json,hashes.json}
// and prints:
//   1. DET-GATE: per-dawn extHash byte-identical armed vs control, 16/16 pairs.
//   2. VARIETY (armed): feast registers, spoil forms, bowl-assertion count,
//      eat sharing lines. GO: fixtures green (test-prosefix) + det-gate pass
//      + sense PASS + these instruments showing the new voice in the wild.
//   3. WALL METRICS: national/table/wins/wave45/median survival/death causes,
//      IDENTICAL both sides (pre-registered PRIMARY).
// Usage: node scripts/analyze-prosefix-20261017.js
'use strict';
const fs = require('fs');
const path = require('path');
const DIR = path.join(__dirname, '..', 'evidence', '2026-10-17', 'perseed-prosefix');
const SEEDS = [141, 252, 363, 474, 585, 696, 807, 918];
const PIDS = ['leadfeast', 'belongfeast'];

let fails = [];
function read(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }
function median(xs) {
  if (!xs.length) return 0;
  const s = xs.slice().sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

// 1. DET-GATE
console.log('== 1. DET-GATE: per-dawn trajectory hash, armed vs control ==');
let detPass = 0, detTotal = 0;
const detFails = [];
for (const seed of SEEDS) for (const pid of PIDS) {
  detTotal++;
  const hc = read(path.join(DIR, `control-${pid}-s${seed}.hashes.json`));
  const ha = read(path.join(DIR, `armed-${pid}-s${seed}.hashes.json`));
  const ok = hc.length === ha.length && hc.length > 0 && hc.every((h, i) => h === ha[i]);
  if (ok) detPass++; else detFails.push(`${pid}-s${seed} (n=${hc.length}/${ha.length})`);
  console.log(`  ${ok ? 'PASS' : 'FAIL'} ${pid} s${seed} — ${hc.length} dawn hashes`);
}
console.log(`DET-GATE: ${detPass}/${detTotal} byte-identical`);
if (detFails.length) { fails.push('det-gate'); console.log('  failures: ' + detFails.join(', ')); }

// 2. VARIETY (armed)
console.log('\n== 2. VARIETY (armed) ==');
const regs = {}, forms = {}, regSamples = {};
let feastN = 0, spoilN = 0, shareN = 0, bowlAssert = 0, spoilFirstFull = 0;
for (const seed of SEEDS) for (const pid of PIDS) {
  const j = read(path.join(DIR, `armed-${pid}-s${seed}.json`));
  const p = j.prose || {};
  feastN += p.feastN || 0; spoilN += p.spoilN || 0;
  shareN += p.shareN || 0; bowlAssert += p.bowlAssertN || 0;
  for (const [k, v] of Object.entries(p.feastRegs || {})) {
    regs[k] = (regs[k] || 0) + v;
    if (!regSamples[k] && (p.feastSamples || []).length) {
      const s = (p.feastSamples || []).find(x => x.reg === k);
      if (s) regSamples[k] = `[d${s.day}] ${s.text.slice(0, 120)}...`;
    }
  }
  for (const [k, v] of Object.entries(p.spoilForms || {})) forms[k] = (forms[k] || 0) + v;
}
console.log(`  feast voicings: ${feastN}, registers: ${JSON.stringify(regs)}`);
for (const [k, s] of Object.entries(regSamples)) console.log(`    [${k}] ${s}`);
console.log(`  spoil voicings: ${spoilN}, forms: ${JSON.stringify(forms)}`);
console.log(`  eat sharing lines: ${shareN}; bowl private-eating assertions: ${bowlAssert}`);
const distinctRegs = Object.keys(regs).filter(k => k !== 'other').length;
console.log(`  distinct feast registers: ${distinctRegs} (control baseline: exactly 1 — the fixed line)`);
if (bowlAssert > 0) { fails.push('bowl-assertion'); console.log('  FAIL: the old private-eating assertion still fired'); }

// control baselines (the robotic pre-fix state)
console.log('\n-- control baselines --');
const cRegs = {}, cForms = {};
let cFeastN = 0, cSpoilN = 0, cBowl = 0;
for (const seed of SEEDS) for (const pid of PIDS) {
  const j = read(path.join(DIR, `control-${pid}-s${seed}.json`));
  const p = j.prose || {};
  cFeastN += p.feastN || 0; cSpoilN += p.spoilN || 0; cBowl += p.bowlAssertN || 0;
  for (const [k, v] of Object.entries(p.feastRegs || {})) cRegs[k] = (cRegs[k] || 0) + v;
  for (const [k, v] of Object.entries(p.spoilForms || {})) cForms[k] = (cForms[k] || 0) + v;
}
console.log(`  control feast voicings: ${cFeastN}, registers: ${JSON.stringify(cRegs)}`);
console.log(`  control spoil voicings: ${cSpoilN}, forms: ${JSON.stringify(cForms)}`);
console.log(`  control bowl assertions: ${cBowl}`);

// 3. WALL METRICS — must be IDENTICAL both sides
console.log('\n== 3. WALL METRICS (must be identical) ==');
function wall(side) {
  const js = [];
  for (const seed of SEEDS) for (const pid of PIDS) js.push(read(path.join(DIR, `${side}-${pid}-s${seed}.json`)));
  const deaths = {};
  for (const j of js) for (const [k, v] of Object.entries(j.deaths || {})) deaths[k] = (deaths[k] || 0) + v;
  return {
    national: js.filter(j => j.national).length,
    table: js.filter(j => j.table).length,
    wins: js.filter(j => j.wins).length,
    wave45: js.filter(j => j.wave45).length,
    exiled: js.filter(j => j.exiled).length,
    medianDays: median(js.map(j => j.gameDays)),
    maxDays: Math.max(...js.map(j => j.gameDays)),
    maxArc: Math.max(...js.map(j => j.maxArc)),
    maxWave: Math.max(...js.map(j => j.maxWave)),
    sayHookErr: js.reduce((t, j) => t + (j.sayHookErr || 0), 0),
    deaths,
  };
}
const wc = wall('control'), wa = wall('armed');
const keys = ['national', 'table', 'wins', 'wave45', 'exiled', 'medianDays', 'maxDays', 'maxArc', 'maxWave', 'sayHookErr'];
let wallOk = true;
for (const k of keys) {
  const same = wc[k] === wa[k];
  if (!same) wallOk = false;
  console.log(`  ${same ? 'SAME' : 'DIFF'} ${k}: control=${wc[k]} armed=${wa[k]}`);
}
const dc = Object.keys(wc.deaths).sort(), da = Object.keys(wa.deaths).sort();
const deathSame = JSON.stringify(wc.deaths) === JSON.stringify(wa.deaths);
if (!deathSame) wallOk = false;
console.log(`  ${deathSame ? 'SAME' : 'DIFF'} death-cause shares`);
if (!deathSame) {
  const all = new Set([...dc, ...da]);
  for (const k of all) if (wc.deaths[k] !== wa.deaths[k]) console.log(`    ${k}: control=${wc.deaths[k] || 0} armed=${wa.deaths[k] || 0}`);
}
if (!wallOk) fails.push('wall-metrics');
console.log(`\nWALL: ${wallOk ? 'IDENTICAL' : 'DIFFERENT'}`);

console.log(`\n${fails.length ? 'FAIL: ' + fails.join(', ') : 'ALL GREEN'}`);
process.exit(fails.length ? 1 : 0);
