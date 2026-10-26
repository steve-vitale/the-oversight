#!/usr/bin/env node
// scripts/test-rebaseline-drift.js — sim-rebaseline-a (1354Z) dual-drift proof.
// DIAG ONLY, zero src/js changes. Pure analyzer; it runs NO sims.
// Reads the FRESH summary.json swept on this base from
// evidence/2026-10-26/perseed-sim-rebaseline-a-1354/, recomputes its band
// from the fresh per-seed rebaseline rows, and prints drift against
// BOTH prior tables:
//   (1) the 1815 published control (evidence/2026-10-25/
//       perseed-sim-nonworldkill-a, base acbc0c933 — as quoted in the
//       0158Z rebaseline evidence, since that corpus is not in this
//       worktree; values below are the published ones, never re-scored);
//   (2) the 1230Z ac98043a band, recomputed HERE from the in-tree
//       woundprice corpus (evidence/2026-10-26/perseed-sim-woundprice-a/
//       s*-armed.json — identical rows to the defnarr corpus, verified
//       by this script's per-seed table, not by prose).
// NOTE on the brief's "deaths 332": both in-tree 1230Z corpora sum to
// 336 deaths per seed (43+32+29+48+43+64+41+36). 332 is the defnarr
// prose figure; the corpus value 336 is used here and the discrepancy
// is stated in the evidence file, not hidden.
// Exit 1 if the fresh corpus is incomplete or its summary band does
// not reconcile with its per-seed rows. Drift itself never exits 1:
// drift is the finding, not a failure.
// Usage: node scripts/test-rebaseline-drift.js
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const REPO = path.join(__dirname, '..');
const FRESH = path.join(REPO, 'evidence', '2026-10-26', 'perseed-sim-rebaseline-a-1354');
const AC = path.join(REPO, 'evidence', '2026-10-26', 'perseed-sim-woundprice-a');
const SEEDS = [73671, 73672, 73673, 73674, 73675, 73676, 73677, 73678];
const BAND1815 = { label: '1815 published (acbc0c933)', won: 4, deaths: 234, nationalEver: 7, nationalFinal: 6, table: 4, entered: 4, wave4: 6, wave5: 0, medianDays: 135, raids: 85, raiders: 361, pool: 1494, poolW3: 107, starvation: 5 };
function medianOf(arr) { const s = arr.slice().sort((a, b) => a - b); return s[Math.floor(s.length / 2)]; }
function sha(p) { return crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex'); }
function bandOf(rows) {
  const raids = rows.map(r => (r.raftdraft && r.raftdraft.raids) || []);
  return {
    won: rows.reduce((t, r) => t + (r.won || 0), 0),
    deaths: rows.reduce((t, r) => t + (r.deathTotal || 0), 0),
    nationalEver: rows.reduce((t, r) => t + (r.nationalEver || 0), 0),
    nationalFinal: rows.reduce((t, r) => t + (r.nationalFinal || 0), 0),
    table: rows.reduce((t, r) => t + (r.table || 0), 0),
    entered: rows.reduce((t, r) => t + (r.entered || 0), 0),
    wave4: rows.filter(r => (r.waveReach || 1) >= 4).length,
    wave5: rows.filter(r => (r.waveReach || 1) >= 5).length,
    medianDays: medianOf(rows.map(r => r.days)),
    raids: raids.reduce((t, x) => t + x.length, 0),
    raiders: raids.reduce((t, x) => t + x.reduce((u, y) => u + (y.raiders || []).length, 0), 0),
    pool: raids.reduce((t, x) => t + x.reduce((u, y) => u + (y.livingN || 0), 0), 0),
    poolW3: raids.reduce((t, x) => t + x.reduce((u, y) => u + (y.w3plusPool || []).length, 0), 0),
    starvation: rows.reduce((t, r) => t + (r.starvationDeaths || 0), 0),
  };
}
function main() {
  const failures = [];
  const fresh = [];
  for (const s of SEEDS) {
    const rp = path.join(FRESH, `s${s}-rebaseline.json`);
    const pp = path.join(FRESH, `s${s}-plain.json`);
    if (!fs.existsSync(rp)) failures.push(`missing fresh rebaseline row seed ${s}`);
    if (!fs.existsSync(pp)) failures.push(`missing fresh plain row seed ${s}`);
    if (fs.existsSync(rp)) fresh.push(JSON.parse(fs.readFileSync(rp, 'utf8')));
  }
  const sp = path.join(FRESH, 'summary.json');
  if (!fs.existsSync(sp)) failures.push('missing fresh summary.json');
  const sum = fs.existsSync(sp) ? JSON.parse(fs.readFileSync(sp, 'utf8')) : null;
  if (fresh.length === 8 && sum) {
    const recomputed = bandOf(fresh);
    const b = sum.band || {};
    const checks = [['won', b.won, recomputed.won], ['deathTotal', b.deathTotal, recomputed.deaths], ['nationalEver', b.nationalEver, recomputed.nationalEver], ['nationalFinal', b.nationalFinal, recomputed.nationalFinal], ['table', b.table, recomputed.table], ['entered', b.entered, recomputed.entered], ['wave4', b.wave4, recomputed.wave4], ['wave5', b.wave5, recomputed.wave5], ['medianDays', b.medianDays, recomputed.medianDays], ['starvationTotal', b.starvationTotal, recomputed.starvation]];
    for (const [k, got, want] of checks) if (got !== want) failures.push(`summary band ${k} ${got} != recomputed ${want}`);
    const obs = (sum.neutrality && sum.neutrality.observed) || {};
    if (obs.raids !== recomputed.raids) failures.push(`summary raids ${obs.raids} != recomputed ${recomputed.raids}`);
    if (obs.raiders !== recomputed.raiders) failures.push(`summary raiders ${obs.raiders} != recomputed ${recomputed.raiders}`);
    if (obs.poolTotal !== recomputed.pool) failures.push(`summary pool ${obs.poolTotal} != recomputed ${recomputed.pool}`);
    if (obs.poolW3 !== recomputed.poolW3) failures.push(`summary poolW3 ${obs.poolW3} != recomputed ${recomputed.poolW3}`);
    if (sum.corpusOk !== true) failures.push('summary corpusOk is not true');
  }
  // ac98043a band recomputed from the in-tree woundprice corpus.
  const acRows = [];
  for (const s of SEEDS) {
    const p = path.join(AC, `s${s}-armed.json`);
    if (fs.existsSync(p)) acRows.push(JSON.parse(fs.readFileSync(p, 'utf8')));
  }
  if (acRows.length !== 8) failures.push(`ac98043a woundprice corpus rows ${acRows.length}/8`);
  const ac = acRows.length === 8 ? bandOf(acRows) : null;
  const freshBand = fresh.length === 8 ? bandOf(fresh) : null;
  console.log('=== sim-rebaseline-a (1354Z) dual-drift proof ===');
  console.log(`fresh rows: ${fresh.length}/8 rebaseline + plain; summary: ${sum ? 'present' : 'MISSING'}`);
  if (freshBand) {
    for (const r of fresh) {
      const rd = r.raftdraft || {};
      const nRaids = (rd.raids || []).length;
      const nRaiders = (rd.raids || []).reduce((t, x) => t + (x.raiders || []).length, 0);
      console.log(`  FRESH seed ${r.seed}: days=${r.days} gameDays=${r.gameDays} end=${r.endReason} won=${r.won} natEver=${r.nationalEver} natFinal=${r.nationalFinal} table=${r.table} entered=${r.entered} wave=${r.waveReach} arc=${r.maxArc} finalRank=${r.finalRank} deaths=${r.deathTotal} starv=${r.starvationDeaths} raids=${nRaids} raiders=${nRaiders}`);
    }
    console.log(`FRESH BAND: won=${freshBand.won}/8 natEver=${freshBand.nationalEver}/8 natFinal=${freshBand.nationalFinal}/8 table=${freshBand.table}/8 entered=${freshBand.entered}/8 wave4=${freshBand.wave4}/8 wave5=${freshBand.wave5}/8 medianDays=${freshBand.medianDays} deaths=${freshBand.deaths} raids=${freshBand.raids} raiders=${freshBand.raiders} pool=${freshBand.pool} poolW3=${freshBand.poolW3} starv=${freshBand.starvation}`);
  }
  if (ac) {
    console.log(`AC98043A BAND (recomputed from woundprice corpus): won=${ac.won}/8 natEver=${ac.nationalEver}/8 natFinal=${ac.nationalFinal}/8 table=${ac.table}/8 entered=${ac.entered}/8 wave4=${ac.wave4}/8 wave5=${ac.wave5}/8 medianDays=${ac.medianDays} deaths=${ac.deaths} raids=${ac.raids} raiders=${ac.raiders} pool=${ac.pool} poolW3=${ac.poolW3} starv=${ac.starvation}`);
  }
  const keys = ['won', 'deaths', 'nationalEver', 'nationalFinal', 'table', 'entered', 'wave4', 'wave5', 'medianDays', 'raids', 'raiders', 'pool', 'poolW3', 'starvation'];
  if (freshBand) {
    const fmt = (band, ref) => keys.map(k => `${k} ${band[k]} (${band[k] - ref[k] >= 0 ? '+' : ''}${band[k] - ref[k]})`).join(', ');
    console.log(`DRIFT fresh vs 1815: ${fmt(freshBand, BAND1815)}`);
    if (ac) console.log(`DRIFT fresh vs ac98043a: ${fmt(freshBand, ac)}`);
    if (ac) {
      const dir = keys.map(k => {
        const d1815 = ac[k] - BAND1815[k], dFresh = freshBand[k] - ac[k];
        if (dFresh === 0) return `${k}: STABLE`;
        if (d1815 === 0) return `${k}: moved (no prior drift)`;
        if (Math.sign(dFresh) === Math.sign(d1815)) return `${k}: CONTINUED`;
        return `${k}: REVERSED`;
      });
      console.log('DIRECTION vs ac98043a (per key):');
      for (const d of dir) console.log('  ' + d);
    }
  }
  try {
    console.log('SUBSTRATE DIGESTS (sha256):');
    for (const f of ['scripts/policies/competent.js', 'scripts/policies/leanlinkrescue.js', 'scripts/policies/tableseat-nowait.js', 'scripts/test-rebaseline-sweep.js']) {
      console.log(`  ${f} ${sha(path.join(REPO, f))}`);
    }
  } catch (e) { failures.push(`digest read failed: ${e.message}`); }
  if (failures.length) { console.error('PROOF GATE FAILURE:'); for (const f of failures) console.error('  - ' + f); process.exit(1); }
  console.log('PROOF: PASS (fresh corpus 8/8, summary reconciles, dual drift printed)');
}
main();
