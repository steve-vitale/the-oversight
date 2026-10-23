#!/usr/bin/env node
// diag-defer5gate-analyze.js — INSTRUMENT-ONLY DIAG (sim-defer5gate, axis
// scale-onramp). ZERO src/js changes, ZERO engine eval: PURE re-analysis
// of the sim-w5door-b census corpus (24 per-seed JSONs,
// evidence/2026-10-23/perseed-w5door-b/{control,armorydrive}/).
//
// Question: what IS the defer5 gate (the w5door census's dominant binding,
// 16/24)? Decompose each defer5 binding to NAMED sub-gates (the readiness
// bars: armor / weapons / tricks / veterans), find each seed's first-fire
// day (first window row with capped>=t5 && !r5.ready, peak<5 guaranteed
// since no door opened), and trace each bar's evolution.
//
// The analyzer is PURE over the corpus JSONs. w5gates-lib is UNMODIFIED
// (its attribute() recomputes the binding from the stored gateVector as a
// cross-check).
//
// Usage: node scripts/diag-defer5gate-analyze.js [--out <path>]
//   Prints the attribution table + mechanism table; writes the JSON
//   summary to <path> (default: evidence/2026-10-23/defer5gate-attribution.json).
//   Output is byte-deterministic: rerun identical => byte-identical.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const CORPUS = path.join(REPO, 'evidence', '2026-10-23', 'perseed-w5door-b');
const G5 = require(path.join(REPO, 'scripts', 'w5gates-lib'));

const BARS = ['armor', 'weapons', 'tricks', 'veterans'];

function loadConfig(arm, seed) {
  const p = path.join(CORPUS, arm, `s${seed}.json`);
  return { seed, arm, json: JSON.parse(fs.readFileSync(p, 'utf8')) };
}

function recomputeAttr(gv) {
  // Cross-check the stored attribution by recomputing from the vector
  // with the UNMODIFIED lib. attribute() is PURE on the vector object.
  try { return G5.attribute(gv); } catch (e) { return { error: String(e && e.message || e) }; }
}

function defer5SubAttribution(gv) {
  // Name the defer5 binding one level deeper: which readiness bars bind,
  // in the engine's own short-bar vocabulary + deficits.
  const r5 = (gv && gv.r5) || {};
  const dist = ((gv && gv.dist) || {}).defer5 || {};
  const short = Array.isArray(r5.short) ? r5.short.slice().sort() : ['no-read'];
  const detail = {
    bars: { armored: r5.armored | 0, armed: r5.armed | 0, tricks: r5.tricks | 0, veterans: r5.veterans | 0 },
    short,
    deficit: {
      armor: dist.armor | 0, weapons: dist.weapons | 0, tricks: dist.tricks | 0, veterans: dist.veterans | 0,
    },
  };
  const name = short.length === 0 ? 'defer5-ready' : ('defer5-' + short.join('+'));
  return { name, detail };
}

function firstFireDay(json) {
  // First window day with capped>=t5 && !r5.ready. Peak<5 holds on every
  // locked config (no door opened in this corpus), so this IS the defer5
  // first-fire day. Also returns the last-fire day and bar evolution.
  const rows = json.window || [];
  const t5 = ((json.gateVector || {}).t5 | 0) || 200;
  let first = null, last = null, everReady = false;
  const barFirstMet = { armor: null, weapons: null, tricks: null, veterans: null };
  const barEverShort = { armor: false, weapons: false, tricks: false, veterans: false };
  let firstCappedDay = null;
  for (const r of rows) {
    const d = r.day | 0;
    const capped = r.capped | 0;
    if (firstCappedDay == null && capped >= t5) firstCappedDay = d;
    const r5 = r.r5 || {};
    const short = Array.isArray(r5.short) ? r5.short : [];
    const ready = !!r5.ready;
    if (ready) everReady = true;
    for (const b of BARS) {
      if (short.indexOf(b) >= 0) barEverShort[b] = true;
      else if (barFirstMet[b] == null && d >= 2) barFirstMet[b] = d;
    }
    if (capped >= t5 && !ready) {
      if (first == null) first = { day: d, short: short.slice(), bars: { armored: r5.armored | 0, armed: r5.armed | 0, tricks: r5.tricks | 0, veterans: r5.veterans | 0 } };
      last = { day: d, short: short.slice() };
    }
  }
  const BAR_KEY = { armor: 'armored', weapons: 'armed', tricks: 'tricks', veterans: 'veterans' };
  const barPeaks = {};
  for (const b of BARS) {
    const key = BAR_KEY[b];
    let mx = -1, firstDay = null, lastDay = null, nDays = 0, everMet = false;
    for (const r of rows) {
      const r5 = r.r5 || {};
      const short = Array.isArray(r5.short) ? r5.short : [];
      const v = (r5[key] | 0);
      if (v > mx) { mx = v; firstDay = r.day | 0; lastDay = r.day | 0; }
      else if (v === mx) lastDay = r.day | 0;
    }
    for (const r of rows) {
      const r5 = r.r5 || {};
      const v = (r5[key] | 0);
      if (v === mx) nDays++;
      if (b === 'armor' || b === 'weapons' || b === 'tricks' || b === 'veterans') {
        const short = Array.isArray(r5.short) ? r5.short : [];
        if (short.indexOf(b) < 0) everMet = true;
      }
    }
    barPeaks[b] = { max: mx, maxFirstDay: firstDay, maxLastDay: lastDay, nDaysAtMax: nDays, everMet };
  }
  return { firstFireDay: first, lastFireDay: last, everReady, firstCappedDay, barFirstMet, barEverShort, barPeaks };
}

function analyze() {
  const seeds = [];
  for (let s = 65511; s <= 65522; s++) seeds.push(s);
  const cfgs = [];
  for (const arm of ['control', 'armorydrive']) for (const seed of seeds) cfgs.push(loadConfig(arm, seed));

  const rows = [];
  const bindingCounts = {};
  const subCounts = {};
  let unexplained = 0, mismatch = 0, instrumentErrors = 0;
  for (const c of cfgs) {
    const j = c.json;
    const gv = j.gateVector;
    const stored = (gv && gv.attr) || {};
    const recomputed = recomputeAttr(gv);
    const binding = (recomputed && recomputed.binding) || null;
    const outcome = (recomputed && recomputed.outcome) || 'unknown';
    if ((recomputed.error) || !recomputed.attributed) unexplained++;
    if (binding !== (stored.binding || null)) mismatch++;
    bindingCounts[binding || 'unknown'] = (bindingCounts[binding || 'unknown'] | 0) + 1;
    const errs = (j.instrumentErrors || []).length;
    if (errs) instrumentErrors += errs;
    let sub = null;
    if (binding === 'defer5') {
      sub = defer5SubAttribution(gv);
      subCounts[sub.name] = (subCounts[sub.name] | 0) + 1;
    }
    const fire = firstFireDay(j);
    rows.push({
      arm: c.arm, seed: c.seed,
      outcome, binding,
      storedBinding: stored.binding || null, recomputeMatch: binding === (stored.binding || null),
      uw: gv.uw | 0, day: gv.day | 0,
      raw: gv.raw | 0, capped: gv.capped | 0, peak: gv.peak | 0,
      l4Ledger: gv.l4 | 0, l3Ledger: gv.l3 | 0, w4faced: gv.w4faced | 0,
      defer5Sub: sub ? sub.name : null,
      defer5Short: sub ? sub.detail.short : null,
      defer5Deficit: sub ? sub.detail.deficit : null,
      firstFire: fire.firstFireDay, lastFire: fire.lastFireDay,
      everReady: fire.everReady, firstCappedDay: fire.firstCappedDay,
      barEverShort: fire.barEverShort, barPeaks: fire.barPeaks,
    });
  }
  const total = rows.length;
  const attributed = rows.filter(r => r.binding && r.binding !== 'unknown').length;
  return {
    corpus: 'evidence/2026-10-23/perseed-w5door-b (seeds 65511-65522 x control,armorydrive)',
    censusAnchor: 'f5f19667ce19',
    total, attributed, unexplained, recomputeMismatch: mismatch, instrumentErrors,
    bindingCounts, defer5SubCounts: subCounts,
    rows,
  };
}

function main() {
  const outIdx = process.argv.indexOf('--out');
  const outPath = outIdx >= 0 && process.argv[outIdx + 1]
    ? process.argv[outIdx + 1]
    : path.join(REPO, 'evidence', '2026-10-23', 'defer5gate-attribution.json');
  const r = analyze();
  const s = JSON.stringify(r, null, 1) + '\n';
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, s);
  console.log(`attribution: ${r.total} configs, attributed ${r.attributed}/${r.total}, unexplained ${r.unexplained}, recompute-mismatch ${r.recomputeMismatch}, instrumentErrors ${r.instrumentErrors}`);
  console.log('bindings:', JSON.stringify(r.bindingCounts));
  console.log('defer5 sub-gates:', JSON.stringify(r.defer5SubCounts));
  console.log('wrote', outPath);
  // The mechanism table (human-readable): one line per defer5-bound config.
  console.log('\ndefer5 mechanism rows (arm seed | first-fire day | end short bars | end deficits):');
  for (const row of r.rows) {
    if (row.binding !== 'defer5') continue;
    const ff = row.firstFire ? `d${row.firstFire.day} short=[${row.firstFire.short.join(',')}]` : 'never-fired';
    const d = row.defer5Deficit;
    console.log(`  ${row.arm} s${row.seed} | ${ff} | end=[${(row.defer5Short || []).join(',')}] | armorDef=${d.armor} weaponsDef=${d.weapons} tricksDef=${d.tricks} vetsDef=${d.veterans} | everReady=${row.everReady} firstCapped=${row.firstCappedDay}`);
  }
}

if (require.main === module) main();
module.exports = { analyze, defer5SubAttribution, firstFireDay, loadConfig };
