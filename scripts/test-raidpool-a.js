#!/usr/bin/env node
// scripts/test-raidpool-a.js — proof for sim-raidpool-a (DIAG ONLY).
// Proves, from the fresh corpus in
// evidence/2026-10-26/perseed-sim-raidpool-a/ (never from a
// copied sibling corpus):
//   1. Per-column det-gates: plain == wrapped == wrapped-rerun
//      on trajectory + full deaths map + tsNationalDay.
//   2. Band reproduction: colB == published 0126Z band
//      (260/6/9/85/352/1527) and colC == published 301 band
//      (301/8/2/91/404/1346) exactly, on counts AND control
//      fields; colA == driftwide true-current control fields
//      (294/8/2/3 entered/3 wins/4 wave-4) with raids/pool
//      measured (101/430/1423).
//   3. Wrapped rows == driftwide plain rows per seed on
//      trajectory + deaths map + ts (predecessor-corpus
//      cross-check, attributed, not copied).
//   4. Competent digests: one per column, matching the
//      pre-registered digests (colB 76abf6f3, colC 926f87f9,
//      colA b0adaacc).
//   5. Recorder hygiene: diag errs 0, no overflow, on every
//      wrapped row; detwrapped == main wrapped row.
//   6. Raid-line cross-check: per wrapped row, the number of
//      captured FIRING lines ('🐗 RAID — ...' from
//      havenRaidTick) equals the census raid count. The
//      'RAID at Haven last night' awayNews recap is not a
//      firing and is excluded (proof-leg correction, disclosed
//      in the evidence file; the rows were never edited).
//   Deaths maps are compared order-insensitively (same
//   disclosed class as driftwide's objEq fix).
// Exit 1 on any failure. No files are written.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const EVID = path.join(REPO, 'evidence', '2026-10-26', 'perseed-sim-raidpool-a');
const DRIFT = path.join(REPO, 'evidence', '2026-10-26', 'perseed-sim-driftwide-a');
const SEEDS = [73671, 73672, 73673, 73674, 73675, 73676, 73677, 73678];
const TRAJECTORY = ['days', 'gameDays', 'endReason', 'won', 'waveReach', 'maxArc',
  'finalRank', 'maxRank', 'nationalEver', 'nationalFinal', 'table', 'entered',
  'deathTotal', 'starvationDeaths'];
let passed = 0, failed = 0;
function check(name, ok, detail) {
  if (ok) { passed++; }
  else { failed++; console.log(`FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}
function read(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }
function deathsEq(a, b) {
  // Order-insensitive: two maps built in different sample orders
  // hold the same counts (the driftwide proof's disclosed objEq
  // lesson — JSON.stringify is key-order sensitive, deaths maps
  // are not ordered data).
  const ka = Object.keys(a || {}).sort(), kb = Object.keys(b || {}).sort();
  if (JSON.stringify(ka) !== JSON.stringify(kb)) return false;
  return ka.every(k => (a[k] | 0) === (b[k] | 0));
}
function trajEq(a, b) {
  return TRAJECTORY.every(k => JSON.stringify(a[k]) === JSON.stringify(b[k]))
    && deathsEq(a.deaths, b.deaths)
    && JSON.stringify((a.ts || {}).tsNationalDay) === JSON.stringify((b.ts || {}).tsNationalDay);
}
function totals(rows) {
  let raids = 0, raiders = 0, pool = 0, poolW3 = 0, deaths = 0, starv = 0, natEver = 0;
  for (const r of rows) {
    deaths += r.deathTotal; starv += r.starvationDeaths; natEver += r.nationalEver;
    const rp = r.raidpool;
    raids += rp.raids.length;
    for (const x of rp.raids) {
      raiders += (x.raiders || []).length;
      pool += x.livingN || 0;
      const by = x.poolByWave || {};
      for (const k of Object.keys(by)) if ((parseInt(k, 10) || 1) >= 3) poolW3 += by[k] || 0;
    }
  }
  return { raids, raiders, pool, poolW3, deaths, starv, natEver,
    won: rows.reduce((t, r) => t + r.won, 0),
    entered: rows.reduce((t, r) => t + r.entered, 0),
    wave4: rows.filter(r => (r.waveReach || 1) >= 4).length };
}
const DIGEST = { colB: '76abf6f3', colC: '926f87f9', colA: 'b0adaacc' };
for (const col of ['colB', 'colC', 'colA']) {
  const rows = SEEDS.map(s => read(path.join(EVID, `s${s}-${col}.json`)));
  // Hygiene + digest.
  for (const r of rows) {
    check(`${col} ${r.seed} diag errs 0`, r.raidpool.diag.errs === 0, `errs=${r.raidpool.diag.errs}`);
    check(`${col} ${r.seed} no overflow`, Object.keys(r.raidpool.diag.overflow || {}).length === 0);
    check(`${col} ${r.seed} digest ${DIGEST[col]}`, (r.competentSha || '').startsWith(DIGEST[col]), r.competentSha);
  }
  check(`${col} single digest`, new Set(rows.map(r => r.competentSha)).size === 1);
  // Det-gate files.
  const plain = read(path.join(EVID, `s73671-${col}-plain.json`));
  const detw = read(path.join(EVID, `s73671-${col}-detwrapped.json`));
  const detr = read(path.join(EVID, `s73671-${col}-detrerun.json`));
  check(`${col} detgate plain==wrapped`, trajEq(plain, detw),
    `plain days=${plain.days} deaths=${plain.deathTotal} vs wrapped days=${detw.days} deaths=${detw.deathTotal}`);
  check(`${col} detgate wrapped==rerun`, trajEq(detw, detr));
  check(`${col} detgate wrapped==main row`, trajEq(detw, rows[0]),
    `detwrapped days=${detw.days} vs main days=${rows[0].days}`);
  // Driftwide plain cross-check per seed.
  for (const r of rows) {
    const d = read(path.join(DRIFT, `s${r.seed}-${col}.json`));
    check(`${col} ${r.seed} == driftwide plain trajectory`, trajEq(r, d),
      `mine days=${r.days} deaths=${r.deathTotal} vs drift days=${d.days} deaths=${d.deathTotal}`);
  }
  // Raid-line cross-check per seed. The FIRING line is the
  // '🐗 RAID — ...' line from havenRaidTick itself. A second
  // 'RAID at Haven last night' line exists (havenGrowth.js
  // awayNews, told to the scholar on return) — it is a recap,
  // not a firing, and must NOT be counted here (the first
  // proof run's 3 failures were exactly this filter bug plus
  // the deaths-map key-order bug, disclosed, not row edits).
  for (const r of rows) {
    const lines = (r.raidpool.raidLines || []).filter(l => (l.text || '').indexOf('RAID —') !== -1).length;
    check(`${col} ${r.seed} RAID firing lines == census raids`, lines === r.raidpool.raids.length,
      `firing lines=${lines} raids=${r.raidpool.raids.length}`);
  }
  const t = totals(rows);
  console.log(`  ${col}: deaths=${t.deaths} natEver=${t.natEver} starv=${t.starv} won=${t.won} entered=${t.entered} wave4=${t.wave4} raids=${t.raids} raiders=${t.raiders} pool=${t.pool} poolW3=${t.poolW3}`);
  if (col === 'colB') {
    check('colB band deaths 260', t.deaths === 260, `got ${t.deaths}`);
    check('colB band natEver 6', t.natEver === 6, `got ${t.natEver}`);
    check('colB band starv 9', t.starv === 9, `got ${t.starv}`);
    check('colB band raids 85', t.raids === 85, `got ${t.raids}`);
    check('colB band raiders 352', t.raiders === 352, `got ${t.raiders}`);
    check('colB band pool 1527', t.pool === 1527, `got ${t.pool}`);
  }
  if (col === 'colC') {
    check('colC band deaths 301', t.deaths === 301, `got ${t.deaths}`);
    check('colC band natEver 8', t.natEver === 8, `got ${t.natEver}`);
    check('colC band starv 2', t.starv === 2, `got ${t.starv}`);
    check('colC band raids 91', t.raids === 91, `got ${t.raids}`);
    check('colC band raiders 404', t.raiders === 404, `got ${t.raiders}`);
    check('colC band pool 1346', t.pool === 1346, `got ${t.pool}`);
  }
  if (col === 'colA') {
    check('colA band deaths 294', t.deaths === 294, `got ${t.deaths}`);
    check('colA band natEver 8', t.natEver === 8, `got ${t.natEver}`);
    check('colA band starv 2', t.starv === 2, `got ${t.starv}`);
    check('colA band entered 3', t.entered === 3, `got ${t.entered}`);
    check('colA band won 3', t.won === 3, `got ${t.won}`);
    check('colA band wave4 4', t.wave4 === 4, `got ${t.wave4}`);
    check('colA raids measured (101)', t.raids === 101, `got ${t.raids}`);
    check('colA raiders measured (430)', t.raiders === 430, `got ${t.raiders}`);
    check('colA pool measured (1423)', t.pool === 1423, `got ${t.pool}`);
  }
}
console.log(`\nraidpool proof: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
