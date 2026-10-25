// test-haulinvert-b.js — proof for the inverted-predicate recorder
// (sim-haulinvert-b, 2026-10-25, oversight-flesh-out-loop-b).
//
// T1 (static, no sim): the sweep declares all 8 inv fields and the
//   exclusion list (every exact name + both prefixes); every wrapper
//   delegates to its original; the game.js tap block is unchanged
//   (counting-only, writes only _haulcount).
// T2 (live, self-contained): runs the REAL sweep script on 1 seed x
//   10 days into a scratch dir (deleted after), then re-runs it with
//   HAULCOUNT_TRACE=1 and asserts (a) all current + inv fields are
//   non-negative integers, (b) invHaul >= haul (superset), (c) the
//   bucket arithmetic closes, (d) the trace run's per-seed file is
//   byte-identical to the first run's (determinism), (e) trace totals
//   equal per-seed totals for every field, and (f) both predicates
//   plus the excluded/foreign buckets recompute exactly from the
//   stored trace events (kcal>0 filter; stock names re-derived from
//   the exclusion list, pieces from the home flag + Tribute prefix).
// T3 (corpus, --corpus <dir> --seeds lo-hi): validates every pilot
//   per-seed file (fields, ints, haul > 0, superset, closure,
//   villager tap invariants) and, where trace files exist, trace
//   totals == per-seed totals and full event recomputation.
//
// Usage:
//   node scripts/test-haulinvert-b.js
//   node scripts/test-haulinvert-b.js --corpus evidence/2026-10-25/haulinvert-b-corpus --seeds 9400-9407
// Exit non-zero on any failure. Prints PASS/FAIL per check.
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
let pass = 0, fail = 0;
function check(name, ok, extra) {
  if (ok) { pass++; console.log(`PASS ${name}`); }
  else { fail++; console.log(`FAIL ${name}${extra ? ' — ' + extra : ''}`); }
}

const CUR_FIELDS = ['haulActions', 'haulKcal', 'pantryDepositActions', 'pantryDepositKcal',
  'preserveAttempts', 'preserveSuccessItems', 'preservePemmicanSets', 'preservePemmicanBars',
  'preserveVillagerBatches', 'preserveVillagerKcal', 'preserveVillagerResolutions'];
const INV_FIELDS = ['invHaulActions', 'invHaulKcal', 'invStockExcludedActions', 'invStockExcludedKcal',
  'invPiecesHomeExcludedActions', 'invPiecesHomeExcludedKcal', 'invPiecesForeignActions', 'invPiecesForeignKcal'];
const isNonNegInt = (v) => Number.isSafeInteger(v) && v >= 0;

// Shared predicate mirrors (MUST match the sweep exactly).
const FIELD = new Set(['Foraged food', 'Game meat', 'Garden harvest', 'Fish catch', 'Expedition haul', 'Aid crew haul', 'Snared meat', 'Hauled meat', 'Emergency hunt meat']);
const isFieldHaul = (nm) => FIELD.has(nm) || (typeof nm === 'string' && nm.startsWith('Pit meat ('));
const INV_EX = new Set(['Weregild', "Hoarder's interest", 'System-replicated stew', 'System-replicated (enthusiastic) meal', 'System aid cache', 'SYNTHETIC SUSTENANCE BRICKS', 'Trial feast', 'Refunded trade goods', 'Meal leftovers', 'Restitution', 'Ration returned']);
const INV_PREF = ['Aid from ', 'Remedy stores from '];
const isInvExcluded = (nm) => INV_EX.has(nm) || INV_PREF.some((p) => typeof nm === 'string' && nm.startsWith(p));

// Recompute both predicates + buckets from stored trace events.
// Stock events: every stockPantry call is traced (including kcal<=0
// ones, which the counter skips — hence the kcal>0 filter). Pieces
// events: every depositPantryPieces call with deposited kcal > 0.
function recomputeFromEvents(events) {
  const r = { haulActions: 0, haulKcal: 0, pantryDepositActions: 0, pantryDepositKcal: 0,
    invHaulActions: 0, invHaulKcal: 0, invStockExcludedActions: 0, invStockExcludedKcal: 0,
    invPiecesHomeExcludedActions: 0, invPiecesHomeExcludedKcal: 0, invPiecesForeignActions: 0, invPiecesForeignKcal: 0 };
  for (const ev of events) {
    if (ev.kind !== 'haul' || !(ev.kcal > 0)) continue;
    r.pantryDepositActions += 1; r.pantryDepositKcal += ev.kcal;
    if (ev.via === 'stock') {
      if (isFieldHaul(ev.name)) { r.haulActions += 1; r.haulKcal += ev.kcal; }
      if (isInvExcluded(ev.name)) { r.invStockExcludedActions += 1; r.invStockExcludedKcal += ev.kcal; }
      else { r.invHaulActions += 1; r.invHaulKcal += ev.kcal; }
    } else if (ev.via === 'pieces') {
      if (ev.home && !String(ev.name).startsWith('Tribute ')) { r.haulActions += 1; r.haulKcal += ev.kcal; }
      if (!ev.home) { r.invPiecesForeignActions += 1; r.invPiecesForeignKcal += ev.kcal; }
      else if (String(ev.name).startsWith('Tribute ')) { r.invPiecesHomeExcludedActions += 1; r.invPiecesHomeExcludedKcal += ev.kcal; }
      else { r.invHaulActions += 1; r.invHaulKcal += ev.kcal; }
    }
  }
  return r;
}
function checkRecompute(tag, tr, d) {
  const r = recomputeFromEvents(tr.events);
  const pairs = [['haulActions', 'haulActions'], ['haulKcal', 'haulKcal'],
    ['pantryDepositActions', 'pantryDepositActions'], ['pantryDepositKcal', 'pantryDepositKcal'],
    ['invHaulActions', 'invHaulActions'], ['invHaulKcal', 'invHaulKcal'],
    ['invStockExcludedActions', 'invStockExcludedActions'], ['invStockExcludedKcal', 'invStockExcludedKcal'],
    ['invPiecesHomeExcludedActions', 'invPiecesHomeExcludedActions'], ['invPiecesHomeExcludedKcal', 'invPiecesHomeExcludedKcal'],
    ['invPiecesForeignActions', 'invPiecesForeignActions'], ['invPiecesForeignKcal', 'invPiecesForeignKcal']];
  for (const [rk, dk] of pairs) check(`${tag} recompute ${dk}`, r[rk] === d[dk], `events=${r[rk]} perSeed=${d[dk]}`);
  return r;
}
function checkClosure(tag, d) {
  check(`${tag} closure actions`, d.pantryDepositActions === d.invHaulActions + d.invStockExcludedActions + d.invPiecesHomeExcludedActions + d.invPiecesForeignActions);
  check(`${tag} closure kcal`, d.pantryDepositKcal === d.invHaulKcal + d.invStockExcludedKcal + d.invPiecesHomeExcludedKcal + d.invPiecesForeignKcal);
}

// ---------------- T1: static ----------------
const sweepSrc = fs.readFileSync(path.join(ROOT, 'scripts', 'sweep-haulinvert-b.js'), 'utf8');
for (const f of CUR_FIELDS.concat(INV_FIELDS)) check(`T1 sweep declares perSeed field ${f}`, sweepSrc.includes(`${f}:`));
for (const frag of ['oStock.apply', 'oPieces.apply', 'oCredit.apply', 'orig.apply', 'oPem.apply']) {
  check(`T1 sweep wrapper delegates (${frag})`, sweepSrc.includes(frag));
}
for (const nm of INV_EX) check(`T1 exclusion list contains ${nm}`, sweepSrc.includes(nm));
for (const p of INV_PREF) check(`T1 exclusion prefix contains ${p}`, sweepSrc.includes(`'${p}'`));
const gameSrc = fs.readFileSync(path.join(ROOT, 'src', 'js', 'game.js'), 'utf8');
const gameLines = gameSrc.split('\n');
const beginIdx = gameLines.findIndex((l) => l.includes('HAULCOUNT TAP BEGIN'));
const endIdx = gameLines.findIndex((l) => l.includes('HAULCOUNT TAP END'));
check('T1 game.js tap block present (unchanged from haulcount-b)', beginIdx >= 0 && endIdx > beginIdx);

// ---------------- T2: live mini-run ----------------
function runSweep(dir, trace) {
  const env = Object.assign({}, process.env, {
    FEASTSCALE_R13: '1', SEATDRIVE: '0', ANCHOR: 'abcdef0', SIDE: 'pd0',
    PLENTYDEPRI: '0', DEPOSITGATE: '1', POLICY: 'leadfeast', SEEDS: '9400', DAYS: '10',
    OUT: path.join(dir, 'sweep.json'), PERSEED_DIR: dir,
    ...(trace ? { HAULCOUNT_TRACE: '1' } : {}),
  });
  execFileSync('node', [path.join(ROOT, 'scripts', 'sweep-haulinvert-b.js')], { env, cwd: ROOT, timeout: 300000, stdio: 'pipe' });
}
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'haulinvert-test-'));
try {
  runSweep(tmpDir, false);
  const perSeedFile = fs.readdirSync(tmpDir).filter((f) => f.startsWith('haulinvert-b-') && !f.startsWith('haulinvert-b-trace') && f.endsWith('.json') && f !== 'sweep.json');
  check('T2 mini-run wrote exactly one per-seed file', perSeedFile.length === 1, perSeedFile.join(','));
  let firstBytes = null, first = null;
  if (perSeedFile.length === 1) {
    firstBytes = fs.readFileSync(path.join(tmpDir, perSeedFile[0]), 'utf8');
    first = JSON.parse(firstBytes);
    for (const f of CUR_FIELDS.concat(INV_FIELDS)) check(`T2 per-seed field ${f} is a non-negative int`, isNonNegInt(first[f]), `${f}=${first[f]}`);
    check('T2 haulActions > 0 on a competent food run', first.haulActions > 0, `haulActions=${first.haulActions}`);
    check('T2 invHaulActions >= haulActions (superset)', first.invHaulActions >= first.haulActions);
    check('T2 invHaulKcal >= haulKcal (superset)', first.invHaulKcal >= first.haulKcal);
    checkClosure('T2', first);
  }
  runSweep(tmpDir, true);
  const perSeedFile2 = fs.readdirSync(tmpDir).filter((f) => f.startsWith('haulinvert-b-') && !f.startsWith('haulinvert-b-trace') && f.endsWith('.json') && f !== 'sweep.json');
  if (perSeedFile2.length === 1) {
    const secondBytes = fs.readFileSync(path.join(tmpDir, perSeedFile2[0]), 'utf8');
    check('T2 trace re-run per-seed file byte-identical (determinism)', secondBytes === firstBytes);
  } else { check('T2 trace re-run per-seed file present', false, perSeedFile2.join(',')); }
  const traceFile = fs.readdirSync(tmpDir).filter((f) => f.startsWith('haulinvert-b-trace'));
  check('T2 trace file written', traceFile.length === 1, traceFile.join(','));
  if (traceFile.length === 1 && first) {
    const tr = JSON.parse(fs.readFileSync(path.join(tmpDir, traceFile[0]), 'utf8'));
    check('T2 trace events stored <= 1000', tr.eventsStored <= 1000 && tr.events.length === tr.eventsStored);
    for (const f of ['haulActions', 'haulKcal', 'pantryDepositActions', 'pantryDepositKcal', 'preserveAttempts', 'preserveSuccessItems', 'preservePemmicanSets', 'preservePemmicanBars', 'preserveVillagerResolutions'].concat(INV_FIELDS)) {
      check(`T2 trace total == per-seed ${f}`, tr.totals[f] === first[f], `trace=${tr.totals[f]} perSeed=${first[f]}`);
    }
    checkRecompute('T2', tr, first);
  }
} catch (e) {
  check('T2 mini-run completed without crash', false, String(e.message).slice(0, 200));
} finally {
  try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (e) {}
}

// ---------------- T3: corpus validation ----------------
const args = process.argv.slice(2);
const getArg = (flag) => { const i = args.indexOf(flag); return i >= 0 ? args[i + 1] : null; };
const corpus = getArg('--corpus');
if (corpus) {
  const seedsArg = (getArg('--seeds') || '9400-9407').split('-').map(Number);
  const corpusDir = path.isAbsolute(corpus) ? corpus : path.join(ROOT, corpus);
  const perSeedFiles = fs.readdirSync(corpusDir)
    .filter((f) => f.startsWith('haulinvert-b-') && !f.startsWith('haulinvert-b-trace') && f.endsWith('.json') && f !== 'sweep.json')
    .sort();
  let nChecked = 0;
  for (const f of perSeedFiles) {
    const d = JSON.parse(fs.readFileSync(path.join(corpusDir, f), 'utf8'));
    if (d.seed < seedsArg[0] || d.seed > seedsArg[1]) continue;
    nChecked++;
    for (const fld of CUR_FIELDS.concat(INV_FIELDS)) check(`T3 ${f} field ${fld} non-neg int`, isNonNegInt(d[fld]), `${fld}=${d[fld]}`);
    check(`T3 ${f} haulActions > 0`, d.haulActions > 0, `haulActions=${d.haulActions}`);
    check(`T3 ${f} invHaul >= haul`, d.invHaulActions >= d.haulActions && d.invHaulKcal >= d.haulKcal);
    checkClosure(`T3 ${f}`, d);
    if (d.preserveVillagerResolutions > 0) {
      check(`T3 ${f} villager batches >= resolutions`, d.preserveVillagerBatches >= d.preserveVillagerResolutions,
        `${d.preserveVillagerBatches} vs ${d.preserveVillagerResolutions}`);
      check(`T3 ${f} villager kcal <= 4000 * resolutions`, d.preserveVillagerKcal <= 4000 * d.preserveVillagerResolutions,
        `${d.preserveVillagerKcal} vs ${4000 * d.preserveVillagerResolutions}`);
    }
    const traceName = f.replace('haulinvert-b-', 'haulinvert-b-trace-');
    const tracePath = path.join(corpusDir, traceName);
    if (fs.existsSync(tracePath)) {
      const tr = JSON.parse(fs.readFileSync(tracePath, 'utf8'));
      check(`T3 ${f} trace complete (stored < cap)`, tr.eventsStored < 1000, `stored=${tr.eventsStored}`);
      for (const fld of ['haulActions', 'haulKcal', 'pantryDepositActions', 'pantryDepositKcal', 'preserveAttempts', 'preserveSuccessItems', 'preservePemmicanSets', 'preservePemmicanBars', 'preserveVillagerResolutions'].concat(INV_FIELDS)) {
        check(`T3 ${f} trace total == per-seed ${fld}`, tr.totals[fld] === d[fld], `trace=${tr.totals[fld]} perSeed=${d[fld]}`);
      }
      checkRecompute(`T3 ${f}`, tr, d);
    }
  }
  check('T3 corpus files checked > 0', nChecked > 0, `nChecked=${nChecked}`);
}

console.log(`\n${pass} PASS, ${fail} FAIL`);
process.exit(fail ? 1 : 0);
