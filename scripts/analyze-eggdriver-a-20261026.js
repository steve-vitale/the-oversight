#!/usr/bin/env node
// analyze-eggdriver-a-20261026.js — aggregate eggdriver per-seed JSONs
// into per-arm verdicts vs the pre-registered bars (sim-eggdriver-a.md).
//
// Usage: node scripts/analyze-eggdriver-a-20261026.js [arm ...]
//   Defaults: base p6 p10 p6p10. Reads evidence/2026-10-26/
//   perseed-eggdriver-a/<arm>-<seed>.json + pilot baseline
//   perseed-eggroad-a/<seed>.json + diagnostic perseed-eggroad-calldiag.
// Prints per-arm tables + bar verdicts. No game load, no RNG.
'use strict';
const fs = require('fs');
const path = require('path');
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-26');
const DDIR = path.join(EVID, 'perseed-eggdriver-a');
const PDIR = path.join(EVID, 'perseed-eggroad-a');
const CDIR = path.join(EVID, 'perseed-eggroad-calldiag');
const MATCHED = [88101, 88102, 88103, 88104, 88105, 88106, 88107, 88108, 88111];
const GATES = { herald: 10, nielsen: 12, finale: 20, the_network: 20 };

function load(p) { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { return null; } }
function driveOf(m) { return ((m && m.census) || {}).titanDrive || {}; }
function readyEver(s) { return !!(s && (s.ready || s.slain || (s.fights || 0) >= 1)); }

function armStats(arm) {
  const st = { arm, seeds: 0, ready: 0, nielsenReady: 0, slots: 0, fired: 0,
    calls: 0, recalls: 0, reCallPermitted: 0, standdowns: 0, defers: 0,
    topups: 0, topupKcal: 0, earlyStanddowns: 0, trustPairs: 0, trustKept: 0,
    censored: 0, rows: [] };
  for (const seed of MATCHED) {
    const m = load(path.join(DDIR, arm + '-' + seed + '.json'));
    if (!m) { st.rows.push({ seed, missing: true }); continue; }
    st.seeds++;
    const c = m.census || {};
    const drv = driveOf(m);
    // Trust-at-call sequence: all callRecords across titans, by day.
    const recs = [];
    for (const tid of Object.keys(drv)) {
      for (const r of (drv[tid].callRecords || [])) recs.push({ tid, day: r.day, kind: r.kind, links: r.links || [] });
    }
    recs.sort((a, b) => a.day - b.day);
    let prevLinks = null;
    for (const r of recs) {
      if (prevLinks) {
        const prev = {};
        for (const l of prevLinks) if (l && l.other) prev[l.other] = l;
        for (const l of r.links) {
          if (!l || !l.other || !prev[l.other]) continue;
          st.trustPairs++;
          if ((l.trust || 0) >= (prev[l.other].trust || 0)) st.trustKept++;
        }
      }
      prevLinks = r.links;
    }
    let seedReady = 0, seedSlots = 0, seedFired = 0;
    for (const tid of ['herald', 'nielsen', 'finale', 'the_network']) {
      const s = drv[tid];
      const endStage = ((c.titans || {})[tid] || {}).omenStage;
      const reached = !!(s && (s.called || s.stoodDown != null || s.slain || (endStage != null && endStage >= 2)));
      if (!reached) continue;
      seedSlots++;
      if (s && (s.called || (s.callRecords || []).length)) seedFired++;
      if (s && readyEver(s)) { seedReady++; if (tid === 'nielsen') st.nielsenReady++; }
      if (s) {
        st.calls += (s.callRecords || []).length;
        st.recalls += (s.reCalls || 0);
        st.reCallPermitted += (s.reCallReasons || []).length;
        if (s.stoodDown != null) st.standdowns++;
        st.defers += (s.deferDays || []).length;
        st.topups += (s.topups || []).length;
        st.topupKcal += (s.topups || []).reduce((n, t) => n + (t.tookKcal || 0), 0);
        st.earlyStanddowns += (s.earlyStanddowns || []).length;
      }
    }
    st.ready += seedReady; st.slots += seedSlots; st.fired += seedFired;
    const dead = /dead|lost/.test(c.endReason || '');
    if (seedSlots > seedFired && dead) st.censored += (seedSlots - seedFired);
    st.rows.push({ seed, seat: c.seat, tier: c.overtimeTier, wave: c.unlockedWave, scale: c.scaleRank,
      heraldSlain: (c.titans || {}).herald ? c.titans.herald.slain : null,
      nielsenSlain: (c.titans || {}).nielsen ? c.titans.nielsen.slain : null,
      network: c.networkSummoned, fallen: c.networkFallen, end: c.endReason,
      ready: seedReady, slots: seedSlots, fired: seedFired,
      calls: recs.length, recalls: recs.filter(r => r.kind === 'recall').length });
  }
  return st;
}

function baseEquiv() {
  const out = [];
  const cmp = (a, b) => (a === b ? 'same' : 'DIFF(' + JSON.stringify(a) + ' vs ' + JSON.stringify(b) + ')');
  for (const seed of [88101, 88111]) {
    const m = load(path.join(DDIR, 'base-' + seed + '.json'));
    const p = seed === 88111 ? load(path.join(CDIR, seed + '.json')) : load(path.join(PDIR, seed + '.json'));
    if (!m || !p) { out.push({ seed, missing: !m ? 'no-base' : 'no-baseline' }); continue; }
    const c = m.census, pc = p.census;
    const d = driveOf(m), pd = (pc || {}).titanDrive || {};
    const row = { seed };
    row.announce = cmp(c.announceDay, pc.announceDay);
    row.seat = cmp(c.seat, pc.seat);
    row.tier = cmp(c.overtimeTier, pc.overtimeTier);
    row.end = cmp(c.endReason, pc.endReason);
    for (const tid of ['herald', 'nielsen']) {
      const s = d[tid] || {}, ps = pd[tid] || {};
      row[tid + '.called'] = cmp(!!s.called, !!ps.called);
      row[tid + '.callDay'] = cmp(s.callDay, ps.callDay);
      row[tid + '.stoodDown'] = cmp(s.stoodDown, ps.stoodDown);
      row[tid + '.slain'] = cmp(!!s.slain, !!ps.slain);
    }
    out.push(row);
  }
  return out;
}

function main() {
  const arms = process.argv.slice(2).length ? process.argv.slice(2) : ['base', 'p6', 'p10', 'p6p10'];
  console.log('=== base equivalence (base arm vs pilot/diag) ===');
  for (const r of baseEquiv()) console.log(JSON.stringify(r));
  for (const arm of arms) {
    const st = armStats(arm);
    console.log(`\n=== arm ${arm} (seeds ${st.seeds}/9) ===`);
    for (const r of st.rows) console.log(' ' + JSON.stringify(r));
    console.log(` ready=${st.ready} (nielsenReady=${st.nielsenReady}) slots=${st.slots} fired=${st.fired} fireRate=${st.slots ? (st.fired / st.slots).toFixed(2) : 'n/a'}`);
    console.log(` calls=${st.calls} recalls=${st.recalls} reCallPermitted=${st.reCallPermitted} standdowns=${st.standdowns} defers=${st.defers} topups=${st.topups} topupKcal=${st.topupKcal} earlyStanddowns=${st.earlyStanddowns}`);
    console.log(` trustPairs=${st.trustPairs} trustKept=${st.trustKept} keptRate=${st.trustPairs ? (st.trustKept / st.trustPairs).toFixed(2) : 'n/a'} censored=${st.censored}`);
    if (arm !== 'base') {
      const primary = st.ready >= 3 && st.nielsenReady >= 1;
      const fireOk = st.slots === 0 || (st.fired / st.slots) >= 0.5;
      const trustOk = st.trustPairs > 0 && (st.trustKept / st.trustPairs) >= 0.5;
      console.log(` PRIMARY(>=3 ready + >=1 nielsen): ${primary ? 'GO' : 'NO-GO'} | combined-fire(>=0.5): ${arm === 'p6p10' ? (fireOk ? 'OK' : 'OVER-GATED') : 'n/a'} | P10-trust(>=0.5): ${arm !== 'p6' ? (trustOk ? 'MET' : 'NOT-MET') : 'n/a'}`);
    }
  }
}
if (require.main === module) main();
module.exports = { armStats, baseEquiv };
