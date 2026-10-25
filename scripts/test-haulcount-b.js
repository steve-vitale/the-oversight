// test-haulcount-b.js — proof for the haul/preserve recorder
// (sim-haulcount-b, 2026-10-25, oversight-flesh-out-loop-b).
//
// T1 (static, no sim): the sweep declares all 11 haul/preserve fields;
//   the game.js tap block is counting-only (its only writes are to
//   Game._haulcount); no other src/js code writes _haulcount; every
//   sweep wrapper delegates to its original.
// T2 (live, self-contained): runs the REAL sweep script on 1 seed x
//   10 days into a /tmp scratch dir, then re-runs it with
//   HAULCOUNT_TRACE=1 and asserts (a) the per-seed file carries all
//   fields as non-negative integers, (b) haulActions/haulKcal > 0 on a
//   competent food run, (c) the trace run's per-seed file is
//   byte-identical to the first run's (determinism), and (d) trace
//   totals equal per-seed totals for every traced field.
// T3 (corpus, --corpus <dir> --seeds lo-hi): validates every pilot
//   per-seed file (fields, ints, haul > 0, deposit >= haul, villager
//   tap invariants: batches >= resolutions when resolutions > 0, and
//   kcal <= 4000 * resolutions — the cook's per-resolution budget
//   cap) and, where trace files exist, trace totals == per-seed totals.
//
// Usage:
//   node scripts/test-haulcount-b.js
//   node scripts/test-haulcount-b.js --corpus evidence/2026-10-25/haulcount-b-corpus --seeds 9400-9407
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

const FIELDS = ['haulActions', 'haulKcal', 'pantryDepositActions', 'pantryDepositKcal',
  'preserveAttempts', 'preserveSuccessItems', 'preservePemmicanSets', 'preservePemmicanBars',
  'preserveVillagerBatches', 'preserveVillagerKcal', 'preserveVillagerResolutions'];
const isNonNegInt = (v) => Number.isSafeInteger(v) && v >= 0;

// ---------------- T1: static ----------------
const sweepSrc = fs.readFileSync(path.join(ROOT, 'scripts', 'sweep-haulcount-b.js'), 'utf8');
for (const f of FIELDS) check(`T1 sweep declares perSeed field ${f}`, sweepSrc.includes(`${f}:`));
for (const frag of ['oStock.apply', 'oPieces.apply', 'oCredit.apply', 'orig.apply', 'oPem.apply']) {
  check(`T1 sweep wrapper delegates (${frag})`, sweepSrc.includes(frag));
}
const gameSrc = fs.readFileSync(path.join(ROOT, 'src', 'js', 'game.js'), 'utf8');
const gameLines = gameSrc.split('\n');
const beginIdx = gameLines.findIndex((l) => l.includes('HAULCOUNT TAP BEGIN'));
const endIdx = gameLines.findIndex((l) => l.includes('HAULCOUNT TAP END'));
check('T1 game.js tap block present', beginIdx >= 0 && endIdx > beginIdx);
if (beginIdx >= 0 && endIdx > beginIdx) {
  const codeLines = gameLines.slice(beginIdx + 1, endIdx).map((l) => l.trim()).filter((l) => l && !l.startsWith('//'));
  check('T1 tap block is a single try line', codeLines.length === 1, `got ${codeLines.length} lines`);
  const line = codeLines[0] || '';
  check('T1 tap writes only _haulcount', /this\._haulcount/.test(line) && !/this\.state/.test(line) && !/pantry|roster|kcalEach/.test(line.replace(/villagerPreserveKcal/g, '')),
    line.slice(0, 120));
  check('T1 tap increments batches + kcal', line.includes('villagerPreserveBatches += 1') && line.includes('villagerPreserveKcal +='));
}
// No other _haulcount writes anywhere in src/js.
const haulcountWrites = [];
for (const f of fs.readdirSync(path.join(ROOT, 'src', 'js'))) {
  if (!f.endsWith('.js')) continue;
  const src = fs.readFileSync(path.join(ROOT, 'src', 'js', f), 'utf8');
  const hits = (src.match(/_haulcount\s*=/g) || []).length;
  if (hits) haulcountWrites.push(`${f}:${hits}`);
}
check('T1 _haulcount written only by the game.js tap', haulcountWrites.length === 1 && haulcountWrites[0].startsWith('game.js:'),
  haulcountWrites.join(','));

// ---------------- T2: live mini-run ----------------
function runSweep(dir, trace) {
  const env = Object.assign({}, process.env, {
    FEASTSCALE_R13: '1', SEATDRIVE: '0', ANCHOR: 'abcdef0', SIDE: 'pd0',
    PLENTYDEPRI: '0', DEPOSITGATE: '1', POLICY: 'leadfeast', SEEDS: '9400', DAYS: '10',
    OUT: path.join(dir, 'sweep.json'), PERSEED_DIR: dir,
    ...(trace ? { HAULCOUNT_TRACE: '1' } : {}),
  });
  execFileSync('node', [path.join(ROOT, 'scripts', 'sweep-haulcount-b.js')], { env, cwd: ROOT, timeout: 300000, stdio: 'pipe' });
}
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'haulcount-test-'));
try {
  runSweep(tmpDir, false);
  const perSeedFile = fs.readdirSync(tmpDir).filter((f) => f.startsWith('haulcount-b-') && !f.startsWith('haulcount-b-trace') && f.endsWith('.json') && f !== 'sweep.json');
  check('T2 mini-run wrote exactly one per-seed file', perSeedFile.length === 1, perSeedFile.join(','));
  let firstBytes = null, first = null;
  if (perSeedFile.length === 1) {
    firstBytes = fs.readFileSync(path.join(tmpDir, perSeedFile[0]), 'utf8');
    first = JSON.parse(firstBytes);
    for (const f of FIELDS) check(`T2 per-seed field ${f} is a non-negative int`, isNonNegInt(first[f]), `${f}=${first[f]}`);
    check('T2 haulActions > 0 on a competent food run', first.haulActions > 0, `haulActions=${first.haulActions}`);
    check('T2 haulKcal > 0', first.haulKcal > 0, `haulKcal=${first.haulKcal}`);
    check('T2 deposits >= hauls', first.pantryDepositActions >= first.haulActions && first.pantryDepositKcal >= first.haulKcal);
  }
  runSweep(tmpDir, true);
  const perSeedFile2 = fs.readdirSync(tmpDir).filter((f) => f.startsWith('haulcount-b-') && !f.startsWith('haulcount-b-trace') && f.endsWith('.json') && f !== 'sweep.json');
  if (perSeedFile2.length === 1) {
    const secondBytes = fs.readFileSync(path.join(tmpDir, perSeedFile2[0]), 'utf8');
    check('T2 trace re-run per-seed file byte-identical (determinism)', secondBytes === firstBytes);
  } else { check('T2 trace re-run per-seed file present', false, perSeedFile2.join(',')); }
  const traceFile = fs.readdirSync(tmpDir).filter((f) => f.startsWith('haulcount-b-trace'));
  check('T2 trace file written', traceFile.length === 1, traceFile.join(','));
  if (traceFile.length === 1 && first) {
    const tr = JSON.parse(fs.readFileSync(path.join(tmpDir, traceFile[0]), 'utf8'));
    check('T2 trace events stored <= 500', tr.eventsStored <= 500 && tr.events.length === tr.eventsStored);
    for (const f of ['haulActions', 'haulKcal', 'pantryDepositActions', 'pantryDepositKcal', 'preserveAttempts', 'preserveSuccessItems', 'preservePemmicanSets', 'preservePemmicanBars', 'preserveVillagerResolutions']) {
      check(`T2 trace total == per-seed ${f}`, tr.totals[f] === first[f], `trace=${tr.totals[f]} perSeed=${first[f]}`);
    }
    // Stock events are pushed for every stockPantry call including
    // kcal<=0 ones, but the kcal>0 filter below matches the counter;
    // pieces events are pushed only for counted home-pantry hauls.
    // This predicate MUST mirror the sweep's isFieldHaul exactly.
    const FIELD = new Set(['Foraged food', 'Game meat', 'Garden harvest', 'Fish catch', 'Expedition haul', 'Aid crew haul', 'Snared meat', 'Hauled meat', 'Emergency hunt meat']);
    const isFieldHaul = (nm) => FIELD.has(nm) || (typeof nm === 'string' && nm.startsWith('Pit meat ('));
    let evHaulA = 0, evHaulK = 0;
    for (const ev of tr.events) {
      if (ev.kind !== 'haul' || !(ev.kcal > 0)) continue;
      if (ev.via === 'pieces') { evHaulA += 1; evHaulK += ev.kcal; }
      else if (isFieldHaul(ev.name)) { evHaulA += 1; evHaulK += ev.kcal; }
    }
    // Note: the stock trace pushes for every stockPantry call including
    // kcal<=0 ones, but the kcal>0 filter above matches the counter.
    // The pieces trace pushes only home-village non-tribute deposits.
    check('T2 haul totals recomputed from trace events', evHaulA === first.haulActions && evHaulK === first.haulKcal,
      `events=${evHaulA}/${evHaulK} perSeed=${first.haulActions}/${first.haulKcal}`);
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
    .filter((f) => f.startsWith('haulcount-b-') && !f.startsWith('haulcount-b-trace') && f.endsWith('.json') && f !== 'sweep.json')
    .sort();
  let nChecked = 0;
  for (const f of perSeedFiles) {
    const d = JSON.parse(fs.readFileSync(path.join(corpusDir, f), 'utf8'));
    if (d.seed < seedsArg[0] || d.seed > seedsArg[1]) continue;
    nChecked++;
    for (const fld of FIELDS) check(`T3 ${f} field ${fld} non-neg int`, isNonNegInt(d[fld]), `${fld}=${d[fld]}`);
    check(`T3 ${f} haulActions > 0`, d.haulActions > 0, `haulActions=${d.haulActions}`);
    check(`T3 ${f} haulKcal > 0`, d.haulKcal > 0, `haulKcal=${d.haulKcal}`);
    check(`T3 ${f} deposits >= hauls`, d.pantryDepositActions >= d.haulActions && d.pantryDepositKcal >= d.haulKcal);
    if (d.preserveVillagerResolutions > 0) {
      check(`T3 ${f} villager batches >= resolutions`, d.preserveVillagerBatches >= d.preserveVillagerResolutions,
        `${d.preserveVillagerBatches} vs ${d.preserveVillagerResolutions}`);
      check(`T3 ${f} villager kcal <= 4000 * resolutions`, d.preserveVillagerKcal <= 4000 * d.preserveVillagerResolutions,
        `${d.preserveVillagerKcal} vs ${4000 * d.preserveVillagerResolutions}`);
    }
    const traceName = f.replace('haulcount-b-', 'haulcount-b-trace-');
    const tracePath = path.join(corpusDir, traceName);
    if (fs.existsSync(tracePath)) {
      const tr = JSON.parse(fs.readFileSync(tracePath, 'utf8'));
      for (const fld of ['haulActions', 'haulKcal', 'pantryDepositActions', 'pantryDepositKcal', 'preserveAttempts', 'preserveSuccessItems', 'preservePemmicanSets', 'preservePemmicanBars', 'preserveVillagerResolutions']) {
        check(`T3 ${f} trace total == per-seed ${fld}`, tr.totals[fld] === d[fld], `trace=${tr.totals[fld]} perSeed=${d[fld]}`);
      }
    }
  }
  check('T3 corpus files checked > 0', nChecked > 0, `nChecked=${nChecked}`);
}

console.log(`\n${pass} PASS, ${fail} FAIL`);
process.exit(fail ? 1 : 0);
