#!/usr/bin/env node
// scripts/journey-scale-r50-compare.js — SCALE-PARITY compare, r50 vs r49.
// Usage: node scripts/journey-scale-r50-compare.js [85001,85003]
// Normalization (per r48 prereg): driver labels r46/r47, absolute worktree
// paths, and ISO dates are stripped before comparing. Trust JSONs are
// deep-compared after string normalization; text files are line-compared
// after the same normalization. Prints census scalars for both runs and
// the first diffs found per file. Exit 0 iff all compared files match.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SEEDS = (process.argv[2] || '85001,85003').split(',').map(s => parseInt(s, 10));
const R45 = path.join(ROOT, 'evidence', '2026-10-28', 'journey-scale-r49');
const R46 = path.join(ROOT, 'evidence', '2026-10-28', 'journey-scale-r50');

function normStr(s) {
  return s
    .replace(/journey-scale-r46/g, 'TAG')
    .replace(/journey-scale-r47/g, 'TAG')
    .replace(/journey-scale-r48/g, 'TAG')
    .replace(/journey-scale-r49/g, 'TAG')
    .replace(/journey-scale-r50/g, 'TAG')
    .replace(/\/home\/[^\s'"]*\/worktrees\/[^\s'"]*/g, 'PATH')
    .replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:?\d{2})?/g, 'DATE')
    .replace(/\d{4}-\d{2}-\d{2}/g, 'DATE');
}
function normVal(v) {
  if (typeof v === 'string') return normStr(v);
  if (Array.isArray(v)) return v.map(normVal);
  if (v && typeof v === 'object') {
    const o = {};
    for (const k of Object.keys(v).sort()) o[k] = normVal(v[k]);
    return o;
  }
  return v;
}
function diffLines(a, b) {
  const la = a.split('\n'), lb = b.split('\n');
  const out = [];
  for (let i = 0; i < Math.max(la.length, lb.length); i++) {
    if (la[i] !== lb[i]) out.push(`line ${i + 1}:\n  r49: ${la[i]}\n  r50: ${lb[i]}`);
    if (out.length >= 10) break;
  }
  return { n: out.length, sample: out, lenA: la.length, lenB: lb.length };
}
const SCALARS = ['day', 'over', 'popAlive', 'popTotal', 'pantryKcal', 'scaleRank',
  'nationalDay', 'globalDay', 'tableSeat', 'arcNow', 'maxWave', 'pilgrimages',
  'proposedLead', 'proposedPeer', 'firstCourtDay', 'leaguePoolKcal', 'tended',
  'courtNational', 'poolEverMax'];
let allMatch = true;
for (const seed of SEEDS) {
  console.log(`\n===== SEED ${seed} =====`);
  const c45 = JSON.parse(fs.readFileSync(path.join(R45, `journey-scale-r49-trust-${seed}.json`), 'utf8'));
  const c46 = JSON.parse(fs.readFileSync(path.join(R46, `journey-scale-r50-trust-${seed}.json`), 'utf8'));
  console.log('--- census scalars (r49 | r50) ---');
  for (const k of SCALARS) {
    const a = c45.census[k], b = c46.census[k];
    const mark = JSON.stringify(a) === JSON.stringify(b) ? '' : '  <-- DIFF';
    if (mark) allMatch = false;
    console.log(`  ${k}: ${JSON.stringify(a)} | ${JSON.stringify(b)}${mark}`);
  }
  console.log('--- covenant links (r49 | r50) ---');
  const covA = (c45.census.covLinks || []).map(l => `${l.other}:${l.trust}`).join(' ');
  const covB = (c46.census.covLinks || []).map(l => `${l.other}:${l.trust}`).join(' ');
  console.log(`  ${covA} | ${covB}${covA === covB ? '' : '  <-- DIFF'}`);
  if (covA !== covB) allMatch = false;
  const n45 = normVal(c45), n46 = normVal(c46);
  const same = JSON.stringify(n45) === JSON.stringify(n46);
  console.log(`--- trust JSON deep-compare (normalized): ${same ? 'IDENTICAL' : 'DIFFERS'}`);
  if (!same) {
    allMatch = false;
    const sa = JSON.stringify(n45, null, 1).split('\n');
    const sb = JSON.stringify(n46, null, 1).split('\n');
    let shown = 0;
    for (let i = 0; i < Math.max(sa.length, sb.length) && shown < 12; i++) {
      if (sa[i] !== sb[i]) { console.log(`  json line ${i + 1}:\n    r49: ${sa[i]}\n    r50: ${sb[i]}`); shown++; }
    }
  }
  const kinds = ['capture', 'beats', 'moments', 'want', 'gov', 'trust', 'trustevents',
    'trustset', 'hungerwatch', 'wantwatch', 'betray'];
  for (const k of kinds) {
    const f45 = path.join(R45, `journey-scale-r49-${k}-${seed}.txt`);
    const f46 = path.join(R46, `journey-scale-r50-${k}-${seed}.txt`);
    if (!fs.existsSync(f45) || !fs.existsSync(f46)) { console.log(`  ${k}: MISSING FILE (r49=${fs.existsSync(f45)} r50=${fs.existsSync(f46)})`); allMatch = false; continue; }
    const d = diffLines(normStr(fs.readFileSync(f45, 'utf8')), normStr(fs.readFileSync(f46, 'utf8')));
    const ok = d.n === 0 && d.lenA === d.lenB;
    if (!ok) allMatch = false;
    console.log(`  ${k}: ${ok ? 'IDENTICAL' : `DIFFERS (${d.lenA} vs ${d.lenB} lines, ${d.n} sampled)`}`);
    for (const s of d.sample) console.log('    ' + s.split('\n').join('\n    '));
  }
  for (const day of [90, 120]) {
    const f45 = path.join(R45, `journey-scale-r49-transcript-${seed}-day${day}.txt`);
    const f46 = path.join(R46, `journey-scale-r50-transcript-${seed}-day${day}.txt`);
    if (!fs.existsSync(f45) || !fs.existsSync(f46)) { console.log(`  transcript d${day}: MISSING (r49=${fs.existsSync(f45)} r50=${fs.existsSync(f46)})`); continue; }
    const d = diffLines(normStr(fs.readFileSync(f45, 'utf8')), normStr(fs.readFileSync(f46, 'utf8')));
    const ok = d.n === 0 && d.lenA === d.lenB;
    if (!ok) allMatch = false;
    console.log(`  transcript d${day}: ${ok ? 'IDENTICAL' : `DIFFERS (${d.lenA} vs ${d.lenB} lines)`}`);
    for (const s of d.sample) console.log('    ' + s.split('\n').join('\n    '));
  }
}
console.log(`\nOVERALL: ${allMatch ? 'PARITY (all compared files identical after normalization)' : 'DIVERGED — see diffs above'}`);
process.exit(allMatch ? 0 : 1);
