#!/usr/bin/env node
// analyze-driedhunt-b.js — per-stack dried-residual hunt (DIAG only,
// sim-driedhunt-b). Judged ONLY against
// evidence/2026-10-27/sim-driedhunt-b-prereg.md.
//
// Reads the EXISTING stockdoors corpora (never modified) and, per seed
// in hunt order (9738, 9735, 9825), decomposes the generic-family
// boundary-aware dried residual into per-stack identities
// (kcalEach, spoilDay) of 'Foraged food (dried)' stacks:
//   created = driedEvents after-stacks; consumed = pantryDraw items +
//   directRecords items; swept = spoil sweep pantry detail entries.
// Headline residuals come from the REUSED analyzers
// (analyze-stockdoors-b.js perSeed + analyze-stockdoors-b-2030.js
// perSeedBa), never from this script's own arithmetic.
// Optionally reads the step-2 re-run corpus (second argv) and matches
// its _removePantryKcal take records to tail identities for the
// mechanism leg.
// Usage: node scripts/analyze-driedhunt-b.js [rerunDir]
// When required, exports { identityLedger, judgeSeed }.
'use strict';
const fs = require('fs');
const path = require('path');
const { perSeed } = require('./analyze-stockdoors-b');
const { perSeedBa } = require('./analyze-stockdoors-b-2030');

const CONFIRM_DIR = path.join(__dirname, '..', 'evidence', '2026-10-27', 'sim-stockdoors-b-confirm-corpus');
const PILOT_DIR = path.join(__dirname, '..', 'evidence', '2026-10-27', 'sim-stockdoors-b-corpus');
const SEEDS = [
  { seed: 9738, dir: CONFIRM_DIR },
  { seed: 9735, dir: CONFIRM_DIR },
  { seed: 9825, dir: PILOT_DIR },
];
const CH = 'Foraged food (dried)';

function loadSeed(seed, dir) {
  const f = path.join(dir, `stockdoors-b-competent-nofeast-s${seed}.json`);
  return JSON.parse(fs.readFileSync(f, 'utf8'));
}

function identityLedger(ps) {
  const M = new Map();
  const get = (ke, sd) => {
    const k = ke + '|' + sd;
    if (!M.has(k)) M.set(k, { kcalEach: ke, spoilDay: sd, createdK: 0, createdU: 0, consumedK: 0, consumedU: 0, sweptK: 0, sweptU: 0, createDays: [] });
    return M.get(k);
  };
  for (const ev of (ps.driedEvents || [])) {
    const a = ev.after || {};
    if (a.channel === CH) {
      const e = get(a.kcalEach, a.spoilDay);
      e.createdK += a.kcal || 0; e.createdU += a.units || 0;
      if (e.createDays.indexOf(ev.day) < 0) e.createDays.push(ev.day);
    }
  }
  for (const r of (ps.mealDrawRecords || [])) {
    if (r.kind !== 'pantryDraw') continue;
    for (const it of (r.items || [])) {
      if (it.name === CH) {
        const e = get(it.kcalEach, it.spoilDay);
        e.consumedK += (it.units || 0) * (it.kcalEach || 0); e.consumedU += it.units || 0;
      }
    }
  }
  for (const r of (ps.directRecords || [])) {
    for (const it of (r.items || [])) {
      if (it.name === CH) {
        const e = get(it.kcalEach, it.spoilDay);
        e.consumedK += (it.units || 0) * (it.kcalEach || 0); e.consumedU += it.units || 0;
      }
    }
  }
  for (const sw of ((ps.spoilEvents || {}).sweeps || [])) {
    for (const d of ((sw.removed || {}).pantry || {}).detail || []) {
      if (d.channel === CH) {
        const e = get(d.kcalEach, d.spoilDay);
        e.sweptK += d.kcal || 0; e.sweptU += d.units || 0;
      }
    }
  }
  const rows = [];
  for (const e of M.values()) {
    e.resid = e.createdK - e.consumedK - e.sweptK;
    e.residU = e.createdU - e.consumedU - e.sweptU;
    e.live = (e.spoilDay || 0) > 100;
    rows.push(e);
  }
  rows.sort((a, b) => (a.spoilDay - b.spoilDay) || (a.kcalEach - b.kcalEach));
  const closingCh = ((ps.finalPantry || {}).channels || []).find(c => c.channel === CH);
  const closing = closingCh ? (closingCh.freshKcal || 0) : 0;
  const liveSum = rows.filter(r => r.live).reduce((t, r) => t + r.resid, 0);
  const tails = rows.filter(r => !r.live && r.resid !== 0);
  const tailSum = tails.reduce((t, r) => t + r.resid, 0);
  const neg = rows.filter(r => r.resid < 0);
  return { rows, closing, liveSum, tails, tailSum, neg,
    predicted: rows.reduce((t, r) => t + r.resid, 0) };
}

function judgeSeed(ps) {
  const base = perSeed(ps);
  const ba = perSeedBa(ps, base);
  const row = ba.rows.find(x => x.family === 'Foraged food');
  const headline = row ? row.driedResidualBa : null;
  const led = identityLedger(ps);
  const accounting = headline != null && Math.abs(led.tailSum) >= 0.90 * Math.abs(headline)
    && Math.abs(led.liveSum - led.closing) <= led.rows.filter(r => r.live).length;
  return { seed: ps.seed, headline, headlineControl: row ? row.driedResidualControl : null,
    closingDried: led.closing, liveSum: led.liveSum, tailSum: led.tailSum,
    tails: led.tails, neg: led.neg, predicted: led.predicted, accounting, led };
}

function main() {
  const rerunDir = process.argv[2] || null;
  let rerun = null;
  if (rerunDir) {
    rerun = {};
    for (const f of fs.readdirSync(rerunDir).filter(x => x.endsWith('.json')).sort()) {
      try { const p = JSON.parse(fs.readFileSync(path.join(rerunDir, f), 'utf8')); rerun[p.seed] = p; } catch (e) {}
    }
  }
  for (const { seed, dir } of SEEDS) {
    const ps = loadSeed(seed, dir);
    const j = judgeSeed(ps);
    console.log(`\n=== seed ${seed} ===`);
    console.log(`headline BA dried residual: ${j.headline} (control ${j.headlineControl}) closing dried fresh: ${j.closingDried} liveSum: ${j.liveSum} tailSum: ${j.tailSum} predicted: ${j.predicted} negative identities: ${j.neg.length}`);
    console.log(`ACCOUNTING leg (>=90% of |residual| in expired tails + live sums to closing): ${j.accounting ? 'PASS' : 'FAIL'}`);
    console.log('expired tails (resid != 0):');
    for (const t of j.tails) {
      console.log(`  ${t.kcalEach}|${t.spoilDay}: created ${t.createdK} (${t.createdU}u, days ${t.createDays.join(',')}) consumed ${t.consumedK} (${t.consumedU}u) swept ${t.sweptK} (${t.sweptU}u) TAIL ${t.resid} (${t.residU}u)`);
    }
    if (rerun && rerun[seed]) {
      const rp = rerun[seed];
      const takes = rp.driedhuntTakes || [];
      let onTails = 0, total = 0;
      const byIdent = {};
      for (const tk of takes) {
        for (const it of (tk.items || [])) {
          if (it.name !== CH) continue;
          total += it.kcal || 0;
          const isTail = j.tails.some(t => t.kcalEach === it.kcalEach && t.spoilDay === it.spoilDay);
          if (isTail) {
            onTails += it.kcal || 0;
            const k = it.kcalEach + '|' + it.spoilDay;
            byIdent[k] = (byIdent[k] || 0) + (it.kcal || 0);
          }
        }
      }
      console.log(`MECHANISM leg (re-run _removePantryKcal takes): ${takes.length} take calls, ${total} kcal total, ${onTails} kcal on tail identities (${j.tailSum > 0 ? (100 * onTails / j.tailSum).toFixed(1) : 'n/a'}% of tail kcal)`);
      for (const tk of takes) {
        if (!tk.items || !tk.items.some(i => i.name === CH)) continue;
        console.log(`  take day ${tk.day} caller ${tk.caller || '?'} ret ${tk.ret} items: ${tk.items.filter(i => i.name === CH).map(i => `${i.units}u x ${i.kcalEach} spoilDay ${i.spoilDay} = ${i.kcal}`).join(', ')}`);
        if (tk.stack) console.log(`    stack: ${tk.stack.slice(2, 5).join(' | ')}`);
      }
      console.log(`  take kcal by tail identity: ${JSON.stringify(byIdent)}`);
    } else {
      console.log('MECHANISM leg: no re-run corpus supplied (mechanism unattributed from corpora alone)');
    }
  }
}

if (require.main === module) main();
module.exports = { identityLedger, judgeSeed, SEEDS };
