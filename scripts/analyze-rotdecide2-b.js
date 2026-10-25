// analyze-rotdecide2-b.js — NEXT DECIDING rot corpus analyzer (sim-rotdecide2-b,
// 2026-10-25, oversight-flesh-out-loop-b, axis food-economy).
//
// Derived from scripts/analyze-rotcompanion-b.js (definitions UNCHANGED:
// abs rot per 100 village-days, daysAlive denominator, per-seed
// classification genuine / denominator-driven / mixed / identical / up /
// degenerate). Declared deltas vs the source analyzer:
//   1. Corpus filenames rotdecide2-b-<anchor8>-pd<0|1>-dg1-leadfeast-s<seed>.json.
//   2. REQUIRES the haul/preserve columns on every per-seed file
//      (invHaulActions/invHaulKcal as the PRIMARY haul measure per the
//      haulinvert adoption, census haul as cross-check, preserve
//      attempts/successes/villager resolutions); a file missing them is
//      FATAL, not silently zero.
//   3. Prints haul/preserve medians beside the rot medians, a per-seed
//      haul/preserve table, wall numbers (national/table/wins, wave
//      reach, median daysAlive, death-cause totals), and the BINDING
//      GO verdict from the pre-registration (evidence/2026-10-25/
//      sim-rotdecide2-b.md): GO iff G1 (median abs pd1 falls >=5%)
//      AND G2 (genuine down-moves >= denominator-driven + mixed)
//      AND G3 (median abs pd0 rises <=10%). Otherwise NO-GO with the
//      failed condition(s) named. Haul/preserve columns are
//      DIAGNOSTIC ONLY and can never overturn GO/NO-GO.
//   4. Also prints the rotcompanion companion word with governing=STEP
//      supplied, labeled DIAGNOSTIC (for comparability with the prior
//      DENOMINATOR-DRIVEN words); the binding verdict is the GO rule.
//
// analyze-rotcompanion-b.js — companion metric for the rot-ratio step.
//
// MEASUREMENT ONLY: zero src/js game-code changes. Reads ONLY per-seed
// files from a corpus dir (sweep-*.json summaries and govern-input.json
// are never inputs). Recomputes every number from raw rot/days fields;
// never trusts a prior run's printed ratio, step, or classification.
//
// The problem it addresses (tracker 1430Z next blank 3, rotragged-b):
// the governing ratio r = rot(pd1)/rot(pd0) rewards a denominator
// blowup — a village that rots far MORE without depri scores as an
// "improvement" when the ratio falls. The companion reports the
// ABSOLUTE rot rates beside the ratio and classifies each down-move
// as genuine (the depri side really rotted less), denominator-driven
// (the no-depri side rotted more, the depri side did not fall), or
// mixed (both sides pushed the ratio down). It QUALIFIES the
// govern-verdict.js verdict; it never replaces it.
//
// Pre-registration: evidence/2026-10-25/sim-rotcompanion-b.md.
// Definitions (exact, deterministic files -> exact equality, no band):
//   rot(A,S,s) = rotFreshKcal + rotPreservedKcal
//   abs(A,S,s) = rot / daysAlive * 100  ("absolute rot per 100
//     village-days"; daysAlive = the village's lived days, NOT the
//     villageDays field, matching the rotragged/govern convention)
//   r(A,s) = abs(pd1)/abs(pd0), undefined when abs(pd0) = 0
//   step(s) = r(commit)/r(parent) when defined and r(parent) != 0
// Classification (Np/Nc = abs pd1 parent/commit; Dp/Dc = abs pd0):
//   degenerate: (a) a ratio undefined (pd0 abs 0 either anchor), or
//     (b) pd1 rot 0 on BOTH anchors (both ratios 0, no step info)
//   identical: r(commit) == r(parent) exactly
//   up: step > 1, incl. up-from-zero (r(parent)=0, r(commit)>0)
//   down (step < 1, incl. down-to-zero):
//     genuine: Nc < Np AND Dc <= Dp
//     denominator-driven: Dc > Dp AND Nc >= Np
//     mixed: Nc < Np AND Dc > Dp
//     ambiguous: any other down combination (arithmetically
//       impossible; reported, never forced)
// "Flat" = exact equality of the abs rate. A daysAlive change
// parent->commit is flagged per seed (a rate can move on lifespan
// alone); classification is on the rate, raw rot printed beside it.
//
// Usage:
//   node scripts/analyze-rotcompanion-b.js --corpus evidence/2026-10-24/leg2decide-b-corpus --seeds 9266-9281 [--governing STEP]
// Exits non-zero on any missing cell, tag mismatch, or unparseable file.
'use strict';
const fs = require('fs');
const path = require('path');

const PARENT = '1f24a4ef04a857d33138fd0845cfa83df688285c';
const COMMIT = '75fdd92587ad9d83bb12f05da535cdfb49255835';
const PARENT_SHORT = '1f24a4ef';
const COMMIT_SHORT = '75fdd925';

function totalRot(cell) {
  return (cell.rotFreshKcal || 0) + (cell.rotPreservedKcal || 0);
}

// Absolute rot per 100 village-days. Null when daysAlive is missing/0.
function absRot(cell) {
  if (!cell || cell.daysAlive === 0 || cell.daysAlive == null) return null;
  return totalRot(cell) / cell.daysAlive * 100;
}

function freshShare(cell) {
  const t = totalRot(cell);
  if (t === 0) return null;
  return (cell.rotFreshKcal || 0) / t;
}

function ratioOf(cells, anchor) {
  const n = absRot(cells[anchor + 'Pd1']);
  const d = absRot(cells[anchor + 'Pd0']);
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

// Classify one seed from its four cells. Returns {cls, step, rParent,
// rCommit, reason, magnitude} where cls is one of
// degenerate|identical|genuine|denominator-driven|mixed|up|ambiguous.
// genuine/denominator-driven/mixed are down-step subclasses; the
// caller counts them under "down" as well.
function classifyCompanion(cells) {
  const rP = ratioOf(cells, 'parent');
  const rC = ratioOf(cells, 'commit');
  // Degenerate (a): a ratio undefined because pd0 abs is 0 (or days bad).
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
  if (step > 1) {
    return { cls: 'up', magnitude: step <= 2 ? 'mild' : 'sharp', rParent: rP, rCommit: rC, step };
  }
  // Down step (step < 1, including down-to-zero where rC === 0).
  const Np = absRot(cells.parentPd1);
  const Nc = absRot(cells.commitPd1);
  const Dp = absRot(cells.parentPd0);
  const Dc = absRot(cells.commitPd0);
  if (Nc < Np && Dc <= Dp) {
    return { cls: 'genuine', magnitude: step <= 0.5 ? 'sharp' : 'mild', rParent: rP, rCommit: rC, step };
  }
  if (Dc > Dp && Nc >= Np) {
    return { cls: 'denominator-driven', magnitude: step <= 0.5 ? 'sharp' : 'mild', rParent: rP, rCommit: rC, step };
  }
  if (Nc < Np && Dc > Dp) {
    return { cls: 'mixed', magnitude: step <= 0.5 ? 'sharp' : 'mild', rParent: rP, rCommit: rC, step };
  }
  return { cls: 'ambiguous', reason: 'down-step matches no absolute-move rule', rParent: rP, rCommit: rC, step };
}

function loadCorpus(corpusDir, seedLo, seedHi) {
  const files = fs.readdirSync(corpusDir)
    .filter((f) => f.endsWith('.json') && !f.startsWith('sweep-') && f !== 'govern-input.json')
    .sort();
  const cells = {};
  const errors = [];
  for (const f of files) {
    const m = f.match(/rotdecide2-b-(1f24a4ef|75fdd925)-pd([01])-dg1-leadfeast-s(\d+)\.json$/);
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
    for (const hf of ['invHaulActions', 'invHaulKcal', 'pantryDepositActions', 'pantryDepositKcal', 'preserveAttempts', 'preserveSuccessItems', 'preserveVillagerResolutions']) {
      if (d[hf] == null || !Number.isInteger(d[hf]) || d[hf] < 0) errors.push(`missing/invalid haul-preserve field ${hf} in ${f}`);
    }
    // Bucket closure (inverted predicate, disjoint buckets): every
    // pantry deposit is invHaul, stock-excluded, home-excluded, or
    // foreign. A closure break is an instrument defect, not a finding.
    const depA = d.pantryDepositActions, depK = d.pantryDepositKcal;
    const sumA = (d.invHaulActions || 0) + (d.invStockExcludedActions || 0) + (d.invPiecesHomeExcludedActions || 0) + (d.invPiecesForeignActions || 0);
    const sumK = (d.invHaulKcal || 0) + (d.invStockExcludedKcal || 0) + (d.invPiecesHomeExcludedKcal || 0) + (d.invPiecesForeignKcal || 0);
    if (depA !== sumA || depK !== sumK) errors.push(`bucket closure break ${f}: deposits ${depA}/${depK} vs buckets ${sumA}/${sumK}`);
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

// Corpus companion verdict, given the governing verdict's class.
// governingStep: true when scripts/govern-verdict.js returned STEP
// (standing verdicts are supplied externally, never recomputed here
// as a verdict — the medians below are a reproduction CHECK only).
// down: {genuine, 'denominator-driven', mixed} counts among down-moves.
function companionVerdict(governingStep, medPd1Parent, medPd1Commit, down) {
  if (!governingStep) return 'n/a (governing verdict not STEP)';
  if (medPd1Parent == null || medPd1Commit == null) return 'n/a (median pd1 abs undefined)';
  if (medPd1Commit >= medPd1Parent) return 'DENOMINATOR-DRIVEN';
  const denom = (down['denominator-driven'] || 0) + (down.mixed || 0);
  if ((down.genuine || 0) >= denom) return 'GENUINE';
  return 'MIXED';
}

// Binding GO rule (pre-registration, evidence/2026-10-25/sim-rotdecide2-b.md).
// Returns {verdict: 'GO'|'NO-GO', failed: ['G1'|'G2'|'G3']}.
// G1: median abs pd1 falls >=5%. G2: genuine >= denom + mixed.
// G3: median abs pd0 rises <=10% (denominator guard).
function goVerdict(medPd1Parent, medPd1Commit, medPd0Parent, medPd0Commit, down) {
  const failed = [];
  if (!(medPd1Parent > 0) || !(medPd1Commit <= 0.95 * medPd1Parent)) failed.push('G1');
  const denom = (down['denominator-driven'] || 0) + (down.mixed || 0);
  if (!((down.genuine || 0) >= denom)) failed.push('G2');
  if (!(medPd0Parent > 0) || !(medPd0Commit <= 1.10 * medPd0Parent)) failed.push('G3');
  return { verdict: failed.length ? 'NO-GO' : 'GO', failed };
}

function analyze(corpusDir, seedLo, seedHi) {
  const { cells, errors, missing } = loadCorpus(corpusDir, seedLo, seedHi);
  const fatal = errors.filter((e) => !e.startsWith('unexpected filename')).concat(missing);
  const rows = [];
  for (let s = seedLo; s <= seedHi; s++) {
    if (!cells[s] || !cells[s].parentPd0) continue;
    const c = cells[s];
    const cl = classifyCompanion(c);
    rows.push({
      seed: s,
      cls: cl.cls, magnitude: cl.magnitude || null, reason: cl.reason || null,
      rParent: cl.rParent, rCommit: cl.rCommit, step: cl.step,
      parentPd0: c.parentPd0, parentPd1: c.parentPd1,
      commitPd0: c.commitPd0, commitPd1: c.commitPd1,
      absParentPd0: absRot(c.parentPd0), absParentPd1: absRot(c.parentPd1),
      absCommitPd0: absRot(c.commitPd0), absCommitPd1: absRot(c.commitPd1),
      cellsIdentical: cellIdentical(c.parentPd0, c.commitPd0) && cellIdentical(c.parentPd1, c.commitPd1),
      daysChanged: c.parentPd0.daysAlive !== c.commitPd0.daysAlive
        || c.parentPd1.daysAlive !== c.commitPd1.daysAlive,
    });
  }
  // Ratio medians (governing reproduction CHECK; degenerate ratios excluded).
  const mP = median(rows.filter((r) => r.rParent != null).map((r) => r.rParent));
  const mC = median(rows.filter((r) => r.rCommit != null).map((r) => r.rCommit));
  // Absolute medians over ALL seeds (abs is defined for every cell
  // with daysAlive > 0, so degenerate seeds contribute real values).
  const medAbs = {
    pd0Parent: median(rows.map((r) => r.absParentPd0)),
    pd0Commit: median(rows.map((r) => r.absCommitPd0)),
    pd1Parent: median(rows.map((r) => r.absParentPd1)),
    pd1Commit: median(rows.map((r) => r.absCommitPd1)),
  };
  const counts = {};
  for (const r of rows) counts[r.cls] = (counts[r.cls] || 0) + 1;
  const down = {
    genuine: counts.genuine || 0,
    'denominator-driven': counts['denominator-driven'] || 0,
    mixed: counts.mixed || 0,
  };
  // Haul/preserve medians (PRIMARY haul = invHaul; census haul = cross-check).
  // Medians over all seeds per column, same convention as abs medians.
  const medOf = (f) => median(rows.map((r) => f(r)));
  const medHaul = {
    invHaulActionsPd0Parent: medOf((r) => r.parentPd0.invHaulActions),
    invHaulActionsPd0Commit: medOf((r) => r.commitPd0.invHaulActions),
    invHaulActionsPd1Parent: medOf((r) => r.parentPd1.invHaulActions),
    invHaulActionsPd1Commit: medOf((r) => r.commitPd1.invHaulActions),
    invHaulKcalPd0Parent: medOf((r) => r.parentPd0.invHaulKcal),
    invHaulKcalPd0Commit: medOf((r) => r.commitPd0.invHaulKcal),
    invHaulKcalPd1Parent: medOf((r) => r.parentPd1.invHaulKcal),
    invHaulKcalPd1Commit: medOf((r) => r.commitPd1.invHaulKcal),
    censusHaulKcalPd0Parent: medOf((r) => r.parentPd0.haulKcal),
    censusHaulKcalPd0Commit: medOf((r) => r.commitPd0.haulKcal),
    censusHaulKcalPd1Parent: medOf((r) => r.parentPd1.haulKcal),
    censusHaulKcalPd1Commit: medOf((r) => r.commitPd1.haulKcal),
  };
  const medPreserve = {
    attemptsPd0Parent: medOf((r) => r.parentPd0.preserveAttempts),
    attemptsPd0Commit: medOf((r) => r.commitPd0.preserveAttempts),
    attemptsPd1Parent: medOf((r) => r.parentPd1.preserveAttempts),
    attemptsPd1Commit: medOf((r) => r.commitPd1.preserveAttempts),
    successPd0Parent: medOf((r) => r.parentPd0.preserveSuccessItems),
    successPd0Commit: medOf((r) => r.commitPd0.preserveSuccessItems),
    successPd1Parent: medOf((r) => r.parentPd1.preserveSuccessItems),
    successPd1Commit: medOf((r) => r.commitPd1.preserveSuccessItems),
    villResPd0Parent: medOf((r) => r.parentPd0.preserveVillagerResolutions),
    villResPd0Commit: medOf((r) => r.commitPd0.preserveVillagerResolutions),
    villResPd1Parent: medOf((r) => r.parentPd1.preserveVillagerResolutions),
    villResPd1Commit: medOf((r) => r.commitPd1.preserveVillagerResolutions),
    villBatchPd0Parent: medOf((r) => r.parentPd0.preserveVillagerBatches),
    villBatchPd0Commit: medOf((r) => r.commitPd0.preserveVillagerBatches),
    villBatchPd1Parent: medOf((r) => r.parentPd1.preserveVillagerBatches),
    villBatchPd1Commit: medOf((r) => r.commitPd1.preserveVillagerBatches),
  };
  // Wall numbers over all 64 cells (table = win flag in these files;
  // SEATDRIVE=0 makes the table unreachable by construction).
  const wallCells = [];
  for (const r of rows) for (const c of [r.parentPd0, r.parentPd1, r.commitPd0, r.commitPd1]) wallCells.push(c);
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
  const go = goVerdict(medAbs.pd1Parent, medAbs.pd1Commit, medAbs.pd0Parent, medAbs.pd0Commit, down);
  return { rows, mP, mC, step: (mP && mC) ? mC / mP : null, medAbs, counts, down, fatal, medHaul, medPreserve, wall, go };
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
  const governing = get('--governing', 'STEP');
  if (!corpus) { console.error('FATAL: --corpus required'); process.exit(1); }
  const { rows, mP, mC, step, medAbs, counts, down, fatal, medHaul, medPreserve, wall, go } = analyze(corpus, seeds[0], seeds[1]);
  if (fatal.length) {
    for (const f of fatal) console.error('FATAL: ' + f);
    process.exit(1);
  }
  console.log(`CORPUS ${corpus} seeds ${seeds[0]}-${seeds[1]}: ${rows.length} seeds classified`);
  console.log(`RATIO-CHECK M(parent)=${fmt(mP)} M(commit)=${fmt(mC)} median-step=${fmt(step)} (reproduction check only; standing verdicts not re-judged)`);
  console.log(`ABS-MEDIANS pd0 ${fmt(medAbs.pd0Parent, 0)}->${fmt(medAbs.pd0Commit, 0)} (x${medAbs.pd0Parent ? (medAbs.pd0Commit / medAbs.pd0Parent).toFixed(3) : 'n/a'}) | pd1 ${fmt(medAbs.pd1Parent, 0)}->${fmt(medAbs.pd1Commit, 0)} (x${medAbs.pd1Parent ? (medAbs.pd1Commit / medAbs.pd1Parent).toFixed(3) : 'n/a'})`);
  console.log('CLASS COUNTS ' + JSON.stringify(counts));
  console.log(`DOWN SPLIT genuine=${down.genuine} denominator-driven=${down['denominator-driven']} mixed=${down.mixed}`);
  console.log(`COMPANION VERDICT (governing=${governing}, supplied externally): ${companionVerdict(governing === 'STEP', medAbs.pd1Parent, medAbs.pd1Commit, down)}`);
  console.log(`GO VERDICT (binding, pre-registered G1+G2+G3): ${go.verdict}${go.failed.length ? ' failed=' + go.failed.join(',') : ' all conditions hold'}`);
  console.log(`HAUL-MEDIANS (PRIMARY invHaul) actions pd0 ${fmt(medHaul.invHaulActionsPd0Parent, 0)}->${fmt(medHaul.invHaulActionsPd0Commit, 0)} | pd1 ${fmt(medHaul.invHaulActionsPd1Parent, 0)}->${fmt(medHaul.invHaulActionsPd1Commit, 0)} ; kcal pd0 ${fmt(medHaul.invHaulKcalPd0Parent, 0)}->${fmt(medHaul.invHaulKcalPd0Commit, 0)} | pd1 ${fmt(medHaul.invHaulKcalPd1Parent, 0)}->${fmt(medHaul.invHaulKcalPd1Commit, 0)} ; census cross-check kcal pd0 ${fmt(medHaul.censusHaulKcalPd0Parent, 0)}->${fmt(medHaul.censusHaulKcalPd0Commit, 0)} | pd1 ${fmt(medHaul.censusHaulKcalPd1Parent, 0)}->${fmt(medHaul.censusHaulKcalPd1Commit, 0)}`);
  console.log(`PRESERVE-MEDIANS scholar attempts pd0 ${fmt(medPreserve.attemptsPd0Parent, 0)}->${fmt(medPreserve.attemptsPd0Commit, 0)} | pd1 ${fmt(medPreserve.attemptsPd1Parent, 0)}->${fmt(medPreserve.attemptsPd1Commit, 0)} ; success items pd0 ${fmt(medPreserve.successPd0Parent, 0)}->${fmt(medPreserve.successPd0Commit, 0)} | pd1 ${fmt(medPreserve.successPd1Parent, 0)}->${fmt(medPreserve.successPd1Commit, 0)} ; villager resolutions pd0 ${fmt(medPreserve.villResPd0Parent, 0)}->${fmt(medPreserve.villResPd0Commit, 0)} | pd1 ${fmt(medPreserve.villResPd1Parent, 0)}->${fmt(medPreserve.villResPd1Commit, 0)} ; villager batches (tap-absent at anchors, expect 0) pd0 ${fmt(medPreserve.villBatchPd0Parent, 0)}->${fmt(medPreserve.villBatchPd0Commit, 0)} | pd1 ${fmt(medPreserve.villBatchPd1Parent, 0)}->${fmt(medPreserve.villBatchPd1Commit, 0)}`);
  console.log(`WALL configs=${wall.configs} national=${wall.national} table=${wall.table} wins=${wall.wins} waveDist=${JSON.stringify(wall.waveDist)} medianDaysAlive=${wall.medianDaysAlive} maxDaysAlive=${wall.maxDaysAlive} totalDeaths=${wall.totalDeaths}`);
  console.log(`DEATH-TOTALS ${JSON.stringify(wall.deathTotals)}`);
  console.log('--- per-seed HAUL/PRESERVE (PRIMARY invHaul): seed | class | invHaulKcal pd0 parent->commit | pd1 parent->commit | invHaulActions pd1 parent->commit | scholar success pd1 parent->commit | villager resolutions pd1 parent->commit | depri pd1 parent->commit');
  for (const r of rows) {
    console.log(`${r.seed} | ${r.cls} | ${r.parentPd0.invHaulKcal}->${r.commitPd0.invHaulKcal} | ${r.parentPd1.invHaulKcal}->${r.commitPd1.invHaulKcal} | ${r.parentPd1.invHaulActions}->${r.commitPd1.invHaulActions} | ${r.parentPd1.preserveSuccessItems}->${r.commitPd1.preserveSuccessItems} | ${r.parentPd1.preserveVillagerResolutions}->${r.commitPd1.preserveVillagerResolutions} | ${r.parentPd1.depriKcal}->${r.commitPd1.depriKcal}`);
  }
  console.log('seed | class | magnitude/reason | rParent | rCommit | step | cellsIdentical | daysChanged');
  for (const r of rows) {
    console.log(`${r.seed} | ${r.cls} | ${r.magnitude || r.reason || ''} | ${fmt(r.rParent)} | ${fmt(r.rCommit)} | ${fmt(r.step)} | ${r.cellsIdentical} | ${r.daysChanged}`);
  }
  console.log('--- per-seed absolute rot per 100 village-days: pd0 parent->commit | pd1 parent->commit | raw rot pd0 parent->commit | raw rot pd1 parent->commit | pd0 freshShare | pd1 freshShare | depri pd1 parent->commit | days pd0 | days pd1');
  for (const r of rows) {
    const wmax = (c) => (Array.isArray(c.waveReach) && c.waveReach.length ? Math.max(...c.waveReach) : 'n/a');
    void wmax;
    console.log(`${r.seed} | ${fmt(r.absParentPd0, 0)}->${fmt(r.absCommitPd0, 0)} | ${fmt(r.absParentPd1, 0)}->${fmt(r.absCommitPd1, 0)} | ${totalRot(r.parentPd0)}->${totalRot(r.commitPd0)} | ${totalRot(r.parentPd1)}->${totalRot(r.commitPd1)} | ${fmt(freshShare(r.parentPd0), 2)}->${fmt(freshShare(r.commitPd0), 2)} | ${fmt(freshShare(r.parentPd1), 2)}->${fmt(freshShare(r.commitPd1), 2)} | ${r.parentPd1.depriKcal}->${r.commitPd1.depriKcal} | ${r.parentPd0.daysAlive}->${r.commitPd0.daysAlive} | ${r.parentPd1.daysAlive}->${r.commitPd1.daysAlive}`);
  }
}

if (require.main === module) main();
module.exports = { classifyCompanion, absRot, totalRot, freshShare, ratioOf, cellIdentical, loadCorpus, analyze, median, companionVerdict, goVerdict };
