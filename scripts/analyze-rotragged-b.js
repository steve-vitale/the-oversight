// analyze-rotragged-b.js — DIAG analyzer for the ragged preserver step.
//
// Reads ONLY per-seed files from a corpus dir (sweep-*.json summaries and
// govern-input.json are never inputs). Recomputes every ratio from raw
// rot/days fields. Implements exactly the pre-registered classification
// and attribution rules in evidence/2026-10-25/sim-rotragged-b.md.
//
// Usage:
//   node scripts/analyze-rotragged-b.js --corpus evidence/2026-10-24/leg2decide-b-corpus --seeds 9266-9281
// Exits non-zero on any missing cell, tag mismatch, or unparseable file.
'use strict';
const fs = require('fs');
const path = require('path');

const PARENT = '1f24a4ef04a857d33138fd0845cfa83df688285c';
const COMMIT = '75fdd92587ad9d83bb12f05da535cdfb49255835';
const PARENT_SHORT = '1f24a4ef';
const COMMIT_SHORT = '75fdd925';

function rot100d(cell) {
  if (!cell || cell.daysAlive === 0 || cell.daysAlive == null) return null;
  return ((cell.rotFreshKcal || 0) + (cell.rotPreservedKcal || 0)) / cell.daysAlive * 100;
}
function totalRot(cell) {
  return (cell.rotFreshKcal || 0) + (cell.rotPreservedKcal || 0);
}
function freshShare(cell) {
  const t = totalRot(cell);
  if (t === 0) return null;
  return (cell.rotFreshKcal || 0) / t;
}

// Classify one seed from its four cells. Returns {cls, rParent, rCommit,
// step, stepLabel} where cls is one of identical|down|up|degenerate.
function classifySeed(cells) {
  // cells: {parentPd0, parentPd1, commitPd0, commitPd1}
  const nP = rot100d(cells.parentPd1);
  const dP = rot100d(cells.parentPd0);
  const nC = rot100d(cells.commitPd1);
  const dC = rot100d(cells.commitPd0);
  const rP = (nP == null || dP == null || dP === 0) ? null : nP / dP;
  const rC = (nC == null || dC == null || dC === 0) ? null : nC / dC;
  // Degenerate (a): a ratio undefined because pd0 rot is 0 (or days bad).
  if (rP == null || rC == null) {
    return { cls: 'degenerate', reason: 'undefined-ratio', rParent: rP, rCommit: rC, step: null };
  }
  // Degenerate (b): pd1 rot 0 on BOTH anchors -> both ratios 0.
  if (totalRot(cells.parentPd1) === 0 && totalRot(cells.commitPd1) === 0) {
    return { cls: 'degenerate', reason: 'pd1-rot-zero-both', rParent: rP, rCommit: rC, step: null };
  }
  if (rC === rP) return { cls: 'identical', rParent: rP, rCommit: rC, step: 1 };
  if (rP === 0 && rC > 0) {
    return { cls: 'up', magnitude: 'up-from-zero', rParent: rP, rCommit: rC, step: null };
  }
  const step = rC / rP;
  if (step < 1) {
    return { cls: 'down', magnitude: step <= 0.5 ? 'sharp' : 'mild', rParent: rP, rCommit: rC, step };
  }
  return { cls: 'up', magnitude: step <= 2 ? 'mild' : 'sharp', rParent: rP, rCommit: rC, step };
}

// Attribute one moved seed. Returns a string label.
function attributeSeed(cells, cls) {
  if (cls !== 'down' && cls !== 'up') return 'n/a';
  const nP = rot100d(cells.parentPd1);
  const nC = rot100d(cells.commitPd1);
  const dP = rot100d(cells.parentPd0);
  const dC = rot100d(cells.commitPd0);
  const dir = cls === 'down' ? -1 : 1; // ratio-move direction in log space
  // Zero-crossing handling: a zero rate on one anchor kills the log.
  const zeroSide = [];
  if (nP === 0 || nC === 0) zeroSide.push('N');
  if (dP === 0 || dC === 0) zeroSide.push('D');
  if (zeroSide.length > 0) {
    // Direction each side pushes, ignoring the zero side's log.
    // N pushes ratio-move way if (Nc-Np) has sign dir (with zero treated
    // as the extreme); D pushes ratio-move way if (Dp-Dc) has sign dir.
    const nPush = Math.sign((nC || 0) - (nP || 0)) === dir;
    const dPush = Math.sign((dP || 0) - (dC || 0)) === dir;
    if (nPush && dPush) return 'both (zero-crossing)';
    if (nPush) return 'numerator-driven (zero-crossing)';
    if (dPush) return 'denominator-driven (zero-crossing)';
    return 'ambiguous (zero-crossing)';
  }
  const logN = Math.log(nC / nP);
  const logD = Math.log(dC / dP);
  // logN pushes ratio-move way if sign(logN) === dir (logN 0 = neutral).
  // -logD pushes ratio-move way if sign(-logD) === dir.
  const nPush = Math.sign(logN) === dir;
  const dPush = Math.sign(-logD) === dir;
  const nNeutral = logN === 0;
  const dNeutral = logD === 0;
  if (nPush && dPush) return 'both';
  if (nPush && (dNeutral || !dPush)) return 'numerator-driven';
  if (dPush && (nNeutral || !nPush)) return 'denominator-driven';
  if (!nPush && !dPush) return 'ambiguous';
  // One side pushes, the other resists, but the pusher is named by the
  // branch above; this line is unreachable except via float edge cases.
  return 'ambiguous';
}

function cellIdentical(a, b) {
  if (!a || !b) return false;
  const keys = ['rotFreshKcal', 'rotPreservedKcal', 'depriKcal', 'daysAlive', 'national'];
  for (const k of keys) if (a[k] !== b[k]) return false;
  if (JSON.stringify(a.waveReach) !== JSON.stringify(b.waveReach)) return false;
  return true;
}

function loadCorpus(corpusDir, seedLo, seedHi) {
  const files = fs.readdirSync(corpusDir)
    .filter((f) => f.endsWith('.json') && !f.startsWith('sweep-') && f !== 'govern-input.json')
    .sort();
  const cells = {}; // seed -> {parentPd0, parentPd1, commitPd0, commitPd1}
  const errors = [];
  for (const f of files) {
    const m = f.match(/-(1f24a4ef|75fdd925)-pd([01])-dg1-leadfeast-s(\d+)\.json$/);
    if (!m) { errors.push(`unexpected filename (ignored, not a per-seed file): ${f}`); continue; }
    const [, short, pd, seedStr] = m;
    const seed = Number(seedStr);
    if (seed < seedLo || seed > seedHi) continue;
    let d;
    try { d = JSON.parse(fs.readFileSync(path.join(corpusDir, f), 'utf8')); }
    catch (e) { errors.push(`unparseable ${f}: ${e.message}`); continue; }
    if (d.seed !== seed) errors.push(`seed mismatch ${f}: file seed ${d.seed}`);
    const expectHash = short === PARENT_SHORT ? PARENT : COMMIT;
    if (d.anchorCommit !== expectHash) errors.push(`anchor tag mismatch ${f}`);
    if (d.policy !== 'leadfeast' || d.plentydepri !== Number(pd) || d.depositgate !== 1) {
      errors.push(`contrast mismatch ${f}: policy=${d.policy} pd=${d.plentydepri} dg=${d.depositgate}`);
    }
    const anchor = short === PARENT_SHORT ? 'parent' : 'commit';
    const key = anchor + 'Pd' + pd;
    if (!cells[seed]) cells[seed] = {};
    if (cells[seed][key]) errors.push(`duplicate cell ${f}`);
    cells[seed][key] = d;
  }
  const missing = [];
  for (let s = seedLo; s <= seedHi; s++) {
    if (!cells[s]) { missing.push(`seed ${s}: no cells`); continue; }
    for (const k of ['parentPd0', 'parentPd1', 'commitPd0', 'commitPd1']) {
      if (!cells[s][k]) missing.push(`seed ${s}: missing ${k}`);
    }
  }
  return { cells, errors, missing, fileCount: files.length };
}

function median(nums) {
  const a = nums.filter((x) => x != null).sort((x, y) => x - y);
  if (a.length === 0) return null;
  const mid = Math.floor(a.length / 2);
  return a.length % 2 ? a[mid] : (a[mid - 1] + a[mid]) / 2;
}

function analyze(corpusDir, seedLo, seedHi) {
  const { cells, errors, missing } = loadCorpus(corpusDir, seedLo, seedHi);
  const fatal = errors.filter((e) => !e.startsWith('unexpected filename')).concat(missing);
  const rows = [];
  for (let s = seedLo; s <= seedHi; s++) {
    if (!cells[s] || !cells[s].parentPd0) continue;
    const c = cells[s];
    const cl = classifySeed(c);
    const attr = attributeSeed(c, cl.cls);
    rows.push({
      seed: s,
      cls: cl.cls, magnitude: cl.magnitude || null, reason: cl.reason || null,
      rParent: cl.rParent, rCommit: cl.rCommit, step: cl.step,
      attr,
      parentPd0: c.parentPd0, parentPd1: c.parentPd1,
      commitPd0: c.commitPd0, commitPd1: c.commitPd1,
      cellsIdentical: cellIdentical(c.parentPd0, c.commitPd0) && cellIdentical(c.parentPd1, c.commitPd1),
      pd0Identical: cellIdentical(c.parentPd0, c.commitPd0),
      pd1Identical: cellIdentical(c.parentPd1, c.commitPd1),
    });
  }
  const mP = median(rows.filter((r) => r.rParent != null).map((r) => r.rParent));
  const mC = median(rows.filter((r) => r.rCommit != null).map((r) => r.rCommit));
  // Wall numbers from corpus cells only.
  let national = 0, table = 0, win = 0, total = 0;
  const waveMax = {};
  const daysList = [];
  const deaths = {};
  for (const r of rows) {
    for (const cell of [r.parentPd0, r.parentPd1, r.commitPd0, r.commitPd1]) {
      total++;
      if (cell.national) national++;
      if (cell.table) table++;
      if (cell.win) win++;
      const w = Array.isArray(cell.waveReach) && cell.waveReach.length
        ? Math.max(...cell.waveReach) : null;
      if (w != null) waveMax[w] = (waveMax[w] || 0) + 1;
      daysList.push(cell.daysAlive);
      for (const [k, v] of Object.entries(cell.deathCauses || {})) deaths[k] = (deaths[k] || 0) + v;
    }
  }
  return { rows, mP, mC, step: (mP && mC) ? mC / mP : null, fatal, wall: { total, national, table, win, waveMax, medianDays: median(daysList), deaths } };
}

function fmt(x, dp) {
  if (x == null) return 'n/a';
  return x.toFixed(dp == null ? 3 : dp);
}

function main() {
  const args = process.argv.slice(2);
  const get = (flag, def) => {
    const i = args.indexOf(flag);
    return i >= 0 && args[i + 1] ? args[i + 1] : def;
  };
  const corpus = get('--corpus', null);
  const seeds = get('--seeds', '9266-9281').split('-').map(Number);
  if (!corpus) { console.error('FATAL: --corpus required'); process.exit(1); }
  const { rows, mP, mC, step, fatal, wall } = analyze(corpus, seeds[0], seeds[1]);
  if (fatal.length) {
    for (const f of fatal) console.error('FATAL: ' + f);
    process.exit(1);
  }
  console.log(`CORPUS ${corpus} seeds ${seeds[0]}-${seeds[1]}: ${rows.length} seeds classified`);
  console.log(`M(parent)=${fmt(mP)} M(commit)=${fmt(mC)} median-step=${fmt(step)}`);
  const counts = {};
  for (const r of rows) counts[r.cls] = (counts[r.cls] || 0) + 1;
  console.log('CLASS COUNTS ' + JSON.stringify(counts));
  console.log('seed | class | magnitude | rParent | rCommit | step | attribution | cellsIdentical');
  for (const r of rows) {
    console.log(`${r.seed} | ${r.cls} | ${r.magnitude || r.reason || ''} | ${fmt(r.rParent)} | ${fmt(r.rCommit)} | ${fmt(r.step)} | ${r.attr} | ${r.cellsIdentical}`);
  }
  console.log('--- per-seed cell detail: pd0 rot100d parent->commit | pd1 rot100d parent->commit | pd0 freshShare | pd1 freshShare | depri pd0 | depri pd1 | days pd0 | days pd1 | national pd0 | national pd1 | waveMax pd0 | waveMax pd1');
  for (const r of rows) {
    const wmax = (c) => (Array.isArray(c.waveReach) && c.waveReach.length ? Math.max(...c.waveReach) : 'n/a');
    console.log(`${r.seed} | ${fmt(rot100d(r.parentPd0), 0)}->${fmt(rot100d(r.commitPd0), 0)} | ${fmt(rot100d(r.parentPd1), 0)}->${fmt(rot100d(r.commitPd1), 0)} | ${fmt(freshShare(r.parentPd0), 2)}->${fmt(freshShare(r.commitPd0), 2)} | ${fmt(freshShare(r.parentPd1), 2)}->${fmt(freshShare(r.commitPd1), 2)} | ${r.parentPd0.depriKcal}->${r.commitPd0.depriKcal} | ${r.parentPd1.depriKcal}->${r.commitPd1.depriKcal} | ${r.parentPd0.daysAlive}->${r.commitPd0.daysAlive} | ${r.parentPd1.daysAlive}->${r.commitPd1.daysAlive} | ${r.parentPd0.national}->${r.commitPd0.national} | ${r.parentPd1.national}->${r.commitPd1.national} | ${wmax(r.parentPd0)}->${wmax(r.commitPd0)} | ${wmax(r.parentPd1)}->${wmax(r.commitPd1)}`);
  }
  console.log(`WALL total=${wall.total} national=${wall.national} table=${wall.table} win=${wall.win} waveMax=${JSON.stringify(wall.waveMax)} medianDays=${wall.medianDays}`);
  console.log('DEATHS ' + JSON.stringify(wall.deaths));
}

if (require.main === module) main();
module.exports = { classifySeed, attributeSeed, rot100d, freshShare, totalRot, loadCorpus, analyze, median, cellIdentical };
