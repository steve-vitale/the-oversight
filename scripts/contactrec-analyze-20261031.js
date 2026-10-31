#!/usr/bin/env node
// contactrec-analyze-20261031.js — sim-contactrec-a analyzer.
//
// Runs the contactbreak classifier (imported unchanged from
// scripts/contactbreak-analyze-20261031.js) on a corpus dir and
// adds: evade-row HP capture rate, missing-HP breakdown by
// caller/outcome, and the count of contact-shaped unclassified
// rows (outcome in {mFlee, evade}, rounds <= 1, mDealt == 0, HP
// missing). With --backfill, evade rows with missing HP are
// filled by the engine-proven equalities (mHpStart := mHpLeft,
// mMaxHp := the monster's hp[1] band top from src/data/monsters.json)
// and classified on the filled values; backfilled results are
// reported under a separate key, never merged into the measured
// counts. Reads corpus files only; loads no game code, runs no sims.
//
// Usage: node scripts/contactrec-analyze-20261031.js <dir> [--backfill] [--out <file>]
//   dir holds leadfeast/s<seed>.json splitter output.
'use strict';
const fs = require('fs');
const path = require('path');
const CB = require(path.join(__dirname, 'contactbreak-analyze-20261031.js'));

function isNum(v) { return typeof v === 'number' && Number.isFinite(v); }

function loadRows(dir) {
  const files = fs.readdirSync(dir).filter(f => /^s\d+\.json$/.test(f)).sort();
  const rows = [];
  for (const fn of files) {
    const obj = JSON.parse(fs.readFileSync(path.join(dir, fn), 'utf8'));
    for (const f of (obj.fieldFights || [])) {
      if (f.wave === 3) rows.push(Object.assign({ _seed: String(obj.seed) }, f));
    }
  }
  return rows;
}

function bandTop(mid) {
  try {
    const defs = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'monsters.json'), 'utf8'));
    const def = (Array.isArray(defs) ? defs : []).find(d => d && d.id === mid);
    if (def && Array.isArray(def.hp) && def.hp.length === 2 && Number.isFinite(def.hp[1])) return def.hp[1] | 0;
  } catch (e) { /* null */ }
  return null;
}

function captureStats(rows) {
  const evades = rows.filter(r => r.outcome === 'evade');
  const evadeCaptured = evades.filter(r => isNum(r.mHpStart) && isNum(r.mMaxHp)).length;
  const missing = rows.filter(r => !isNum(r.mHpStart) || !isNum(r.mMaxHp));
  const byCaller = {}, byOutcome = {};
  for (const r of missing) {
    byCaller[r.caller || 'null'] = (byCaller[r.caller || 'null'] || 0) + 1;
    byOutcome[r.outcome || 'null'] = (byOutcome[r.outcome || 'null'] || 0) + 1;
  }
  const contactShaped = missing.filter(r =>
    (r.outcome === 'mFlee' || r.outcome === 'evade') &&
    isNum(r.rounds) && r.rounds <= 1 && r.mDealt === 0);
  return {
    total: rows.length,
    evadeRows: evades.length,
    evadeCaptured,
    evadeCaptureRate: evades.length ? evadeCaptured / evades.length : null,
    missingHpRows: missing.length,
    missingByCaller: byCaller,
    missingByOutcome: byOutcome,
    contactShapedUnclassified: contactShaped.length,
    contactShapedDetail: contactShaped.map(r => ({ seed: r._seed, day: r.day, mid: r.mid, outcome: r.outcome, rounds: r.rounds, mDealt: r.mDealt, mHpLeft: r.mHpLeft, caller: r.caller })),
  };
}

function classifyRows(rows) {
  const out = { total: rows.length, contact: 0, fought: 0, unclassified: 0, contactRows: [], unclassifiedRows: [] };
  for (const r of rows) {
    const c = CB.classifyRow(r);
    if (c.cls === 'CONTACT') { out.contact += 1; out.contactRows.push(r); }
    else if (c.cls === 'FOUGHT') out.fought += 1;
    else { out.unclassified += 1; out.unclassifiedRows.push({ seed: r._seed, day: r.day, mid: r.mid, outcome: r.outcome, reason: c.reason }); }
  }
  out.reconciles = (out.contact + out.fought + out.unclassified) === out.total;
  out.shares = { contact: out.total ? out.contact / out.total : null, fought: out.total ? out.fought / out.total : null, unclassified: out.total ? out.unclassified / out.total : null };
  return out;
}

function backfill(rows) {
  // Evade rows only, both HP fields missing: mHpStart := mHpLeft
  // (evade returns before any damage), mMaxHp := band top.
  // Rows with only one field missing, or non-evade rows, are
  // left untouched — the equalities do not cover them.
  let filled = 0;
  const out = rows.map(r => {
    if (r.outcome === 'evade' && !isNum(r.mHpStart) && !isNum(r.mMaxHp) && isNum(r.mHpLeft)) {
      const top = bandTop(r.mid);
      if (top != null) { filled += 1; return Object.assign({}, r, { mHpStart: r.mHpLeft, mMaxHp: top, _backfilled: true }); }
    }
    return r;
  });
  return { rows: out, filled };
}

function analyzeDir(dir, doBackfill) {
  const rows = loadRows(dir);
  const result = { dir, measured: classifyRows(rows), capture: captureStats(rows) };
  if (doBackfill) {
    const bf = backfill(rows);
    result.backfill = Object.assign({ filledRows: bf.filled }, classifyRows(bf.rows));
  }
  return result;
}

function main() {
  const args = process.argv.slice(2);
  const doBackfill = args.indexOf('--backfill') >= 0;
  const outIdx = args.indexOf('--out');
  const outFile = outIdx >= 0 ? args[outIdx + 1] : null;
  const dirs = args.filter((a, i) => a !== '--backfill' && i !== outIdx && i !== outIdx + 1);
  if (dirs.length !== 1) {
    console.error('usage: node scripts/contactrec-analyze-20261031.js <dir> [--backfill] [--out <file>]');
    process.exit(2);
  }
  const result = analyzeDir(dirs[0], doBackfill);
  console.log(JSON.stringify(result, null, 2));
  if (outFile) fs.writeFileSync(outFile, JSON.stringify(result, null, 2));
}

if (require.main === module) main();
module.exports = { analyzeDir, captureStats, classifyRows, backfill, bandTop, loadRows };
