#!/usr/bin/env node
// analyze-preserveact-b.js — preserve-ACTION corpus analyzer
// (sim-preserveact-b, 2026-10-25, oversight-flesh-out-loop-b, arm
// sim-preserveact-b, axis food-economy).
//
// DECIDING QUESTION (evidence/2026-10-25/sim-preserveact-b.md): does
// preserver widening increase how much preserving villagers actually DO?
// Contrast: OFF vs ON (same HEAD base, only the two widening tables in
// food.js differ), policy leadfeast, dg1, FEASTSCALE_R13=1, SEATDRIVE=0,
// PLENTYDEPRI per side, 100d death-aware horizon, identical seeds.
//
// PRIMARY METRIC (binding): per-cell preserve-action count =
// preserveVillagerBatches (cook-duty smoke-rack stacks converted, live
// via the game.js HAULCOUNT TAP in both arms) + preserveAttempts
// (scholar preserveFood/renderFat/makePemmican calls). Read together:
// under leadfeast the policy never calls scholar verbs, so scholar
// attempts are EXPECTED 0 (backlog #1038) — a 0 there is never read as
// "nothing was preserved"; the villager batches carry the question.
// preserveVillagerResolutions (creditDeed 'preserving', one per cook
// resolution) is the CROSS-CHECK: batches >= resolutions per cell by
// construction (one resolution converts >= 1 stack); a violation is an
// instrument defect, reported, never averaged away.
//
// BINDING GO RULE (pre-registered, judge ONLY against it):
//   GO iff P1 AND C1 AND C2, where
//   P1: median total-action count ON >= 1.25 x median OFF (pooled over
//       both sides; per-side medians reported alongside). Edge cases:
//       OFF median 0 and ON median > 0 passes P1 (movement from
//       nothing); both medians 0 fails P1 (no movement to measure).
//   C1 (starvation guard): total starvation deaths ON <= OFF + 2
//       (pooled over both sides; sim-scalemetric cost bar).
//   C2 (survival guard): median daysAlive ON >= 0.8 x median OFF.
// Otherwise NO-GO with the failed condition(s) named (P1 / C1 / C2).
// No re-scoring mid-run; metric doubts go under "metric review" in the
// evidence file and apply to the NEXT run, never this verdict.
//
// SECONDARIES (diagnostic only, never the judge):
//   - preserved-kcal throughput: preserveVillagerKcal medians (+ scholar
//     success items / pemmican sets-bars reported separately, unit counts
//     not kcal, never summed into kcal).
//   - haul throughput: invHaul actions/kcal medians (PRIMARY haul measure
//     per haulinvert; census haul as cross-check).
//   - rot absolutes per side (pd0/pd1), classified per backlog #1049:
//     degenerate seeds are COUNTED in the abs medians and EXCLUDED from
//     any ratio only. Classification rules are the rotcompanion template
//     verbatim (genuine / denominator-driven / mixed / identical / up /
//     degenerate), with off/on in place of parent/commit. The rot verdict
//     from sim-rotdecide2-b (NO-GO on G1+G2) is NOT re-judged here.
//   - wall numbers: national / table / wins, wave reach, median survival,
//     death-cause totals. Table = win flag in these files; SEATDRIVE=0
//     makes the table unreachable by construction, not a finding.
//
// Reads ONLY per-seed files from a corpus dir (sweep-*.json summaries
// are never inputs). Recomputes every number from raw fields.
//
// Usage:
//   node scripts/analyze-preserveact-b.js --corpus evidence/2026-10-25/preserveact-b-corpus --seeds 9750-9757 --base <head-sha>
// Exits non-zero on any missing cell, tag mismatch, or unparseable file.
'use strict';
const fs = require('fs');
const path = require('path');

function totalRot(cell) {
  return (cell.rotFreshKcal || 0) + (cell.rotPreservedKcal || 0);
}

function absRot(cell) {
  if (!cell || cell.daysAlive === 0 || cell.daysAlive == null) return null;
  return totalRot(cell) / cell.daysAlive * 100;
}

function freshShare(cell) {
  const t = totalRot(cell);
  if (t === 0) return null;
  return (cell.rotFreshKcal || 0) / t;
}

// PRIMARY per-cell preserve-action count: villager smoke-rack batches +
// scholar preserve attempts (expected 0 under leadfeast; counted when
// present, never assumed).
function totalActions(cell) {
  return (cell.preserveVillagerBatches || 0) + (cell.preserveAttempts || 0);
}

function ratioOf(cells, arm) {
  const n = absRot(cells[arm + 'Pd1']);
  const d = absRot(cells[arm + 'Pd0']);
  if (n == null || d == null || d === 0) return null;
  return n / d;
}

function cellIdentical(a, b) {
  if (!a || !b) return false;
  const keys = ['rotFreshKcal', 'rotPreservedKcal', 'depriKcal', 'daysAlive', 'national'];
  for (const k of keys) if (a[k] !== b[k]) return false;
  if (JSON.stringify(a.waveReach) !== JSON.stringify(b.waveReach)) return false;
  return true;
}

// Rot classification, rotcompanion template verbatim (off/on naming).
// Degenerate seeds are classified here and COUNTED in abs medians by the
// caller; they are excluded from ratio medians only (backlog #1049).
function classifyRot(cells) {
  const rO = ratioOf(cells, 'off');
  const rN = ratioOf(cells, 'on');
  if (rO == null || rN == null) {
    return { cls: 'degenerate', reason: 'undefined-ratio', rOff: rO, rOn: rN, step: null };
  }
  if (totalRot(cells.offPd1) === 0 && totalRot(cells.onPd1) === 0) {
    return { cls: 'degenerate', reason: 'pd1-rot-zero-both', rOff: rO, rOn: rN, step: null };
  }
  if (rN === rO) return { cls: 'identical', rOff: rO, rOn: rN, step: 1 };
  if (rO === 0 && rN > 0) {
    return { cls: 'up', magnitude: 'up-from-zero', rOff: rO, rOn: rN, step: null };
  }
  const step = rN / rO;
  if (step > 1) {
    return { cls: 'up', magnitude: step <= 2 ? 'mild' : 'sharp', rOff: rO, rOn: rN, step };
  }
  const Np = absRot(cells.offPd1);
  const Nc = absRot(cells.onPd1);
  const Dp = absRot(cells.offPd0);
  const Dc = absRot(cells.onPd0);
  if (Nc < Np && Dc <= Dp) {
    return { cls: 'genuine', magnitude: step <= 0.5 ? 'sharp' : 'mild', rOff: rO, rOn: rN, step };
  }
  if (Dc > Dp && Nc >= Np) {
    return { cls: 'denominator-driven', magnitude: step <= 0.5 ? 'sharp' : 'mild', rOff: rO, rOn: rN, step };
  }
  if (Nc < Np && Dc > Dp) {
    return { cls: 'mixed', magnitude: step <= 0.5 ? 'sharp' : 'mild', rOff: rO, rOn: rN, step };
  }
  return { cls: 'ambiguous', reason: 'down-step matches no absolute-move rule', rOff: rO, rOn: rN, step };
}

function loadCorpus(corpusDir, seedLo, seedHi, baseSha) {
  const files = fs.readdirSync(corpusDir)
    .filter((f) => f.endsWith('.json') && !f.startsWith('sweep-') && !f.startsWith('preserveact-b-trace-'))
    .sort();
  const cells = {};
  const errors = [];
  const violations = [];
  for (const f of files) {
    const m = f.match(/preserveact-b-(off|on)-pd([01])-dg1-leadfeast-s(\d+)\.json$/);
    if (!m) { errors.push(`unexpected filename (ignored, not a per-seed file): ${f}`); continue; }
    const [, arm, pd, seedStr] = m;
    const seed = Number(seedStr);
    if (seed < seedLo || seed > seedHi) continue;
    let d;
    try { d = JSON.parse(fs.readFileSync(path.join(corpusDir, f), 'utf8')); }
    catch (e) { errors.push(`unparseable ${f}: ${e.message}`); continue; }
    if (d.seed !== seed) errors.push(`seed mismatch ${f}: file seed ${d.seed}`);
    if (d.arm !== arm) errors.push(`arm tag mismatch ${f}: file arm ${d.arm}`);
    if (baseSha && d.baseCommit !== baseSha) errors.push(`base tag mismatch ${f}`);
    if (d.policy !== 'leadfeast' || d.plentydepri !== Number(pd) || d.depositgate !== 1) {
      errors.push(`contrast mismatch ${f}: policy=${d.policy} pd=${d.plentydepri} dg=${d.depositgate}`);
    }
    for (const hf of ['invHaulActions', 'invHaulKcal', 'pantryDepositActions', 'pantryDepositKcal',
      'preserveAttempts', 'preserveSuccessItems', 'preserveVillagerBatches', 'preserveVillagerKcal',
      'preserveVillagerResolutions']) {
      if (d[hf] == null || !Number.isInteger(d[hf]) || d[hf] < 0) errors.push(`missing/invalid field ${hf} in ${f}`);
    }
    const depA = d.pantryDepositActions, depK = d.pantryDepositKcal;
    const sumA = (d.invHaulActions || 0) + (d.invStockExcludedActions || 0) + (d.invPiecesHomeExcludedActions || 0) + (d.invPiecesForeignActions || 0);
    const sumK = (d.invHaulKcal || 0) + (d.invStockExcludedKcal || 0) + (d.invPiecesHomeExcludedKcal || 0) + (d.invPiecesForeignKcal || 0);
    if (depA !== sumA || depK !== sumK) errors.push(`bucket closure break ${f}: deposits ${depA}/${depK} vs buckets ${sumA}/${sumK}`);
    // Cross-check invariant (not a loader fatal; the proof test fails on
    // it): one cook resolution converts >= 1 stack, so batches >=
    // resolutions per cell. A violation is an instrument defect.
    if ((d.preserveVillagerBatches || 0) < (d.preserveVillagerResolutions || 0)) {
      violations.push(`batches < resolutions ${f}: batches=${d.preserveVillagerBatches} resolutions=${d.preserveVillagerResolutions}`);
    }
    const key = arm + 'Pd' + pd;
    if (!cells[seed]) cells[seed] = {};
    if (cells[seed][key]) errors.push(`duplicate cell ${f}`);
    cells[seed][key] = d;
  }
  const missing = [];
  for (let s = seedLo; s <= seedHi; s++) {
    if (!cells[s]) { missing.push(`seed ${s}: no cells`); continue; }
    for (const k of ['offPd0', 'offPd1', 'onPd0', 'onPd1']) {
      if (!cells[s][k]) missing.push(`seed ${s}: missing ${k}`);
    }
  }
  return { cells, errors, missing, violations, fileCount: files.length };
}

function median(nums) {
  const a = nums.filter((x) => x != null).sort((x, y) => x - y);
  if (a.length === 0) return null;
  const mid = Math.floor(a.length / 2);
  return a.length % 2 ? a[mid] : (a[mid - 1] + a[mid]) / 2;
}

// Binding GO rule (pre-registered). Returns {verdict, failed, ratio}.
// P1: median total actions ON >= 1.25 x OFF (OFF 0 + ON > 0 passes;
// both 0 fails). C1: starvation ON <= OFF + 2. C2: median days ON >=
// 0.8 x median days OFF.
function goVerdict(medOff, medOn, starvOff, starvOn, daysOff, daysOn) {
  const failed = [];
  let ratio = null;
  if (medOff == null || medOn == null) { failed.push('P1'); }
  else if (medOff === 0) { if (!(medOn > 0)) failed.push('P1'); }
  else { ratio = medOn / medOff; if (!(medOn >= 1.25 * medOff)) failed.push('P1'); }
  if (!(starvOn <= starvOff + 2)) failed.push('C1');
  if (!(daysOff > 0) || !(daysOn >= 0.8 * daysOff)) failed.push('C2');
  return { verdict: failed.length ? 'NO-GO' : 'GO', failed, ratio };
}

function analyze(corpusDir, seedLo, seedHi, baseSha) {
  const { cells, errors, missing, violations } = loadCorpus(corpusDir, seedLo, seedHi, baseSha);
  const fatal = errors.filter((e) => !e.startsWith('unexpected filename')).concat(missing);
  const rows = [];
  for (let s = seedLo; s <= seedHi; s++) {
    if (!cells[s] || !cells[s].offPd0) continue;
    const c = cells[s];
    const cl = classifyRot(c);
    rows.push({
      seed: s,
      cls: cl.cls, magnitude: cl.magnitude || null, reason: cl.reason || null,
      rOff: cl.rOff, rOn: cl.rOn, step: cl.step,
      offPd0: c.offPd0, offPd1: c.offPd1,
      onPd0: c.onPd0, onPd1: c.onPd1,
      absOffPd0: absRot(c.offPd0), absOffPd1: absRot(c.offPd1),
      absOnPd0: absRot(c.onPd0), absOnPd1: absRot(c.onPd1),
      cellsIdentical: cellIdentical(c.offPd0, c.onPd0) && cellIdentical(c.offPd1, c.onPd1),
      daysChanged: c.offPd0.daysAlive !== c.onPd0.daysAlive
        || c.offPd1.daysAlive !== c.onPd1.daysAlive,
    });
  }
  const cellsOf = (arm) => {
    const out = [];
    for (const r of rows) for (const c of [r[arm + 'Pd0'], r[arm + 'Pd1']]) out.push(c);
    return out;
  };
  // Pooled medians over ALL cells per arm (both sides together).
  const pooled = (arm, f) => median(cellsOf(arm).map((c) => f(c)));
  const perSide = (side, arm, f) => median(rows.map((r) => f(r[arm + 'Pd' + side])));
  const med = {
    actionsPooledOff: pooled('off', totalActions),
    actionsPooledOn: pooled('on', totalActions),
    actionsPd0Off: perSide(0, 'off', totalActions),
    actionsPd0On: perSide(0, 'on', totalActions),
    actionsPd1Off: perSide(1, 'off', totalActions),
    actionsPd1On: perSide(1, 'on', totalActions),
    batchesPooledOff: pooled('off', (c) => c.preserveVillagerBatches),
    batchesPooledOn: pooled('on', (c) => c.preserveVillagerBatches),
    batchesPd0Off: perSide(0, 'off', (c) => c.preserveVillagerBatches),
    batchesPd0On: perSide(0, 'on', (c) => c.preserveVillagerBatches),
    batchesPd1Off: perSide(1, 'off', (c) => c.preserveVillagerBatches),
    batchesPd1On: perSide(1, 'on', (c) => c.preserveVillagerBatches),
    attemptsPooledOff: pooled('off', (c) => c.preserveAttempts),
    attemptsPooledOn: pooled('on', (c) => c.preserveAttempts),
    successPooledOff: pooled('off', (c) => c.preserveSuccessItems),
    successPooledOn: pooled('on', (c) => c.preserveSuccessItems),
    resolutionsPooledOff: pooled('off', (c) => c.preserveVillagerResolutions),
    resolutionsPooledOn: pooled('on', (c) => c.preserveVillagerResolutions),
    villKcalPooledOff: pooled('off', (c) => c.preserveVillagerKcal),
    villKcalPooledOn: pooled('on', (c) => c.preserveVillagerKcal),
    invHaulKcalPooledOff: pooled('off', (c) => c.invHaulKcal),
    invHaulKcalPooledOn: pooled('on', (c) => c.invHaulKcal),
    invHaulActionsPooledOff: pooled('off', (c) => c.invHaulActions),
    invHaulActionsPooledOn: pooled('on', (c) => c.invHaulActions),
  };
  // Rot-abs medians over ALL seeds per column (degenerate seeds counted;
  // ratio medians below exclude degenerate seeds, backlog #1049).
  const medAbs = {
    pd0Off: median(rows.map((r) => r.absOffPd0)),
    pd0On: median(rows.map((r) => r.absOnPd0)),
    pd1Off: median(rows.map((r) => r.absOffPd1)),
    pd1On: median(rows.map((r) => r.absOnPd1)),
  };
  const mP = median(rows.filter((r) => r.rOff != null).map((r) => r.rOff));
  const mC = median(rows.filter((r) => r.rOn != null).map((r) => r.rOn));
  const counts = {};
  for (const r of rows) counts[r.cls] = (counts[r.cls] || 0) + 1;
  const down = {
    genuine: counts.genuine || 0,
    'denominator-driven': counts['denominator-driven'] || 0,
    mixed: counts.mixed || 0,
  };
  // Cost guard inputs (pooled over both sides per arm).
  const deathSum = (arm, cause) => cellsOf(arm).reduce((t, c) => t + ((c.deathCauses || {})[cause] || 0), 0);
  const starv = { off: deathSum('off', 'starvation'), on: deathSum('on', 'starvation') };
  const medDays = {
    off: median(cellsOf('off').map((c) => c.daysAlive)),
    on: median(cellsOf('on').map((c) => c.daysAlive)),
  };
  const go = goVerdict(med.actionsPooledOff, med.actionsPooledOn, starv.off, starv.on, medDays.off, medDays.on);
  // Wall numbers over all cells (table = win flag; SEATDRIVE=0 makes the
  // table unreachable by construction).
  const wallCells = [];
  for (const r of rows) for (const c of [r.offPd0, r.offPd1, r.onPd0, r.onPd1]) wallCells.push(c);
  const waveMax = (c) => (Array.isArray(c.waveReach) && c.waveReach.length ? Math.max(...c.waveReach) : 0);
  const waveDist = {};
  for (const c of wallCells) { const w = waveMax(c); waveDist[w] = (waveDist[w] || 0) + 1; }
  const deathTotals = {};
  for (const c of wallCells) for (const [k, v] of Object.entries(c.deathCauses || {})) deathTotals[k] = (deathTotals[k] || 0) + v;
  const wall = {
    configs: wallCells.length,
    national: wallCells.filter((c) => c.national).length,
    table: wallCells.filter((c) => c.table).length,
    wins: wallCells.filter((c) => c.win).length,
    waveDist,
    medianDaysAlive: median(wallCells.map((c) => c.daysAlive)),
    maxDaysAlive: Math.max(...wallCells.map((c) => c.daysAlive)),
    totalDeaths: Object.values(deathTotals).reduce((a, b) => a + b, 0),
    deathTotals,
  };
  return { rows, med, medAbs, mP, mC, step: (mP && mC) ? mC / mP : null,
    counts, down, fatal, violations, go, starv, medDays, wall };
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
  const seeds = get('--seeds', '9750-9757').split('-').map(Number);
  const base = get('--base', null);
  if (!corpus) { console.error('FATAL: --corpus required'); process.exit(1); }
  const res = analyze(corpus, seeds[0], seeds[1], base);
  if (res.fatal.length) {
    for (const f of res.fatal) console.error('FATAL: ' + f);
    process.exit(1);
  }
  if (res.violations.length) {
    for (const v of res.violations) console.error('VIOLATION (batches < resolutions): ' + v);
  }
  const m = res.med;
  console.log(`CORPUS ${corpus} seeds ${seeds[0]}-${seeds[1]}: ${res.rows.length} seeds, ${res.rows.length * 4} cells`);
  console.log(`PRIMARY total-action medians (batches + scholar attempts) pooled OFF=${fmt(m.actionsPooledOff, 1)} ON=${fmt(m.actionsPooledOn, 1)} ratio=${res.go.ratio == null ? 'n/a (OFF median 0)' : res.go.ratio.toFixed(3)} | pd0 ${fmt(m.actionsPd0Off, 1)}->${fmt(m.actionsPd0On, 1)} | pd1 ${fmt(m.actionsPd1Off, 1)}->${fmt(m.actionsPd1On, 1)}`);
  console.log(`COMPONENT batches pooled OFF=${fmt(m.batchesPooledOff, 1)} ON=${fmt(m.batchesPooledOn, 1)} | pd0 ${fmt(m.batchesPd0Off, 1)}->${fmt(m.batchesPd0On, 1)} | pd1 ${fmt(m.batchesPd1Off, 1)}->${fmt(m.batchesPd1On, 1)} ; scholar attempts pooled OFF=${fmt(m.attemptsPooledOff, 1)} ON=${fmt(m.attemptsPooledOn, 1)} ; scholar success items pooled OFF=${fmt(m.successPooledOff, 1)} ON=${fmt(m.successPooledOn, 1)}`);
  console.log(`CROSS-CHECK resolutions pooled OFF=${fmt(m.resolutionsPooledOff, 1)} ON=${fmt(m.resolutionsPooledOn, 1)} ; villager preserved-kcal pooled OFF=${fmt(m.villKcalPooledOff, 0)} ON=${fmt(m.villKcalPooledOn, 0)} ; invHaul kcal pooled OFF=${fmt(m.invHaulKcalPooledOff, 0)} ON=${fmt(m.invHaulKcalPooledOn, 0)} ; invHaul actions pooled OFF=${fmt(m.invHaulActionsPooledOff, 1)} ON=${fmt(m.invHaulActionsPooledOn, 1)}`);
  console.log(`COST GUARD starvation totals OFF=${res.starv.off} ON=${res.starv.on} (bar ON <= OFF+2) ; median daysAlive OFF=${res.medDays.off} ON=${res.medDays.on} (bar ON >= 0.8x OFF)`);
  console.log(`GO VERDICT (binding P1 + C1 + C2): ${res.go.verdict}${res.go.failed.length ? ' failed=' + res.go.failed.join(',') : ' all conditions hold'}`);
  console.log(`ROT-ABS (diagnostic only) medians pd0 ${fmt(res.medAbs.pd0Off, 0)}->${fmt(res.medAbs.pd0On, 0)} | pd1 ${fmt(res.medAbs.pd1Off, 0)}->${fmt(res.medAbs.pd1On, 0)} ; ratio medians (non-degenerate seeds only) OFF=${fmt(res.mP)} ON=${fmt(res.mC)} median-step=${fmt(res.step)} ; CLASS COUNTS ${JSON.stringify(res.counts)} ; DOWN SPLIT genuine=${res.down.genuine} denominator-driven=${res.down['denominator-driven']} mixed=${res.down.mixed}`);
  console.log(`WALL configs=${res.wall.configs} national=${res.wall.national} table=${res.wall.table} wins=${res.wall.wins} waveDist=${JSON.stringify(res.wall.waveDist)} medianDaysAlive=${res.wall.medianDaysAlive} maxDaysAlive=${res.wall.maxDaysAlive} totalDeaths=${res.wall.totalDeaths}`);
  console.log(`DEATH-TOTALS ${JSON.stringify(res.wall.deathTotals)}`);
  console.log('--- per-seed PRESERVE (batches / resolutions / scholar attempts | pd0 OFF->ON | pd1 OFF->ON | total actions pd0 OFF->ON | pd1 OFF->ON | days pd0 | days pd1 | national pd1 OFF->ON | wave pd1 OFF->ON');
  for (const r of rows) {
    const wmax = (c) => (Array.isArray(c.waveReach) && c.waveReach.length ? Math.max(...c.waveReach) : 'n/a');
    console.log(`${r.seed} | ${r.cls} | ${r.offPd0.preserveVillagerBatches}/${r.offPd0.preserveVillagerResolutions}/${r.offPd0.preserveAttempts} -> ${r.onPd0.preserveVillagerBatches}/${r.onPd0.preserveVillagerResolutions}/${r.onPd0.preserveAttempts} | ${r.offPd1.preserveVillagerBatches}/${r.offPd1.preserveVillagerResolutions}/${r.offPd1.preserveAttempts} -> ${r.onPd1.preserveVillagerBatches}/${r.onPd1.preserveVillagerResolutions}/${r.onPd1.preserveAttempts} | ${totalActions(r.offPd0)}->${totalActions(r.onPd0)} | ${totalActions(r.offPd1)}->${totalActions(r.onPd1)} | ${r.offPd0.daysAlive}->${r.onPd0.daysAlive} | ${r.offPd1.daysAlive}->${r.onPd1.daysAlive} | ${r.offPd1.national}->${r.onPd1.national} | ${wmax(r.offPd1)}->${wmax(r.onPd1)}`);
  }
  console.log('--- per-seed ROT-ABS (diagnostic): pd0 OFF->ON | pd1 OFF->ON | raw rot pd0 OFF->ON | pd1 OFF->ON | class | cellsIdentical | daysChanged');
  for (const r of rows) {
    console.log(`${r.seed} | ${fmt(r.absOffPd0, 0)}->${fmt(r.absOnPd0, 0)} | ${fmt(r.absOffPd1, 0)}->${fmt(r.absOnPd1, 0)} | ${totalRot(r.offPd0)}->${totalRot(r.onPd0)} | ${totalRot(r.offPd1)}->${totalRot(r.onPd1)} | ${r.cls} | ${r.cellsIdentical} | ${r.daysChanged}`);
  }
}

if (require.main === module) main();
module.exports = { classifyRot, absRot, totalRot, freshShare, totalActions, loadCorpus, analyze, median, goVerdict };
