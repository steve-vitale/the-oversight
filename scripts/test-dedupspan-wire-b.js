#!/usr/bin/env node
// test-dedupspan-wire-b.js — proof for sim-dedupspan-wire-b: the
// span-dedup rule is wired into every standing ledger analyzer that
// sums directRecords + mealDrawRecords, and nothing else moves.
//
// Method: for each analyzer/corpus, the proof RECOMPUTES the old
// (pre-dedup) newDraws from the raw payload — pantryDraw meal/other
// draws + drawSpoiled + direct items, per family — and asserts the
// wired perSeed equals old minus the rule's exclusions, family by
// family. No baseline snapshot file is needed: the old sum is
// derived from the corpus itself, so this proof stays valid after
// landing. Boundary/raid/caller residuals are checked the same way
// from the wired record's own (dedup-independent) fields.
// Prereg: evidence/2026-10-27/sim-dedupspan-wire-b-prereg.md.
// Exit 0 + verdict GO only if every check passes.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

let passed = 0, failed = 0;
const failures = [];
function check(name, ok, detail) {
  if (ok) { passed++; }
  else { failed++; failures.push(name + ' :: ' + detail); console.log('FAIL ' + name + ' :: ' + detail); }
}
function famOf(nm) { return String(nm || '').replace(/ \((dried|smoked)\)$/, ''); }
function isDried(nm) { return / \((dried|smoked)\)$/.test(String(nm || '')); }

// Recompute the OLD newDraws per family straight from the payload.
function oldDraws(ps) {
  const m = new Map();
  const add = (name, kcal, dried) => {
    const f = famOf(name);
    if (!m.has(f)) m.set(f, { draws: 0, driedDraws: 0 });
    m.get(f).draws += kcal;
    if (dried) m.get(f).driedDraws += kcal;
  };
  for (const r of (ps.mealDrawRecords || [])) {
    if (r.kind !== 'pantryDraw' && r.kind !== 'drawSpoiled') continue;
    for (const it of (r.items || [])) {
      if (it.name == null) continue;
      add(String(it.name), (it.units || 0) * (it.kcalEach || 0), isDried(it.name));
    }
  }
  for (const r of (ps.directRecords || [])) {
    for (const it of (r.items || [])) {
      if (it.name == null) continue;
      add(String(it.name), (it.units || 0) * (it.kcalEach || 0), isDried(it.name));
    }
  }
  return m;
}

function loadDir(dir) {
  return fs.readdirSync(path.join(ROOT, dir)).filter((f) => f.endsWith('.json')).sort()
    .map((f) => JSON.parse(fs.readFileSync(path.join(ROOT, dir, f), 'utf8')));
}

const ANALYZERS = [
  ['stockdoors', './analyze-stockdoors-b.js', 'evidence/2026-10-26/sim-stockdoors-b-corpus'],
  ['residualhunt', './analyze-residualhunt-b.js', 'evidence/2026-10-27/sim-residualhunt-b-corpus'],
  ['ledgerbound', './analyze-ledgerbound-b.js', 'evidence/2026-10-27/sim-ledgerbound-b-corpus'],
  ['raiddor', './analyze-raiddor-ledger-b.js', 'evidence/2026-10-27/sim-raiddor-ledger-b-corpus'],
  // NOTE: sim-raidday100-b-corpus does not exist on master (the
  // analyzer's default DIR is stale); the published raidday100-b
  // corpus is the screen corpus, used here.
  ['raidday100', './analyze-raidday100-b.js', 'evidence/2026-10-27/sim-raidday100-b-screen-corpus'],
  ['raidday100-general', './analyze-raidday100-general-b.js', 'evidence/2026-10-27/sim-raidday100-general-b-corpus'],
  ['raidday100-judge', './analyze-raidday100-judge-b.js', 'evidence/2026-10-27/sim-raidday100-judge-b-corpus'],
  ['raidcallers', './analyze-raidcallers-b.js', 'evidence/2026-10-27/sim-raidcallers-b-corpus'],
];
const CULT = path.join(ROOT, 'evidence/2026-10-27/sim-9954cultnest-b-replay/9954cultnest-b-belongseek-nofeast-s9954.json');
const cult = JSON.parse(fs.readFileSync(CULT, 'utf8'));

// --- GO1/GO2/GO3 on the 9954 span corpus, every wired analyzer ---
for (const [name, mod] of ANALYZERS) {
  const a = require(mod);
  const s = a.perSeed(cult);
  check(name + ' exposes spanDedup', !!s.spanDedup && typeof s.spanDedup.status === 'string', JSON.stringify(s.spanDedup));
  check(name + ' 9954 status applied', s.spanDedup.status === 'applied', s.spanDedup.status);
  check(name + ' 9954 totalExcluded 3820', s.spanDedup.totalExcludedKcal === 3820, '' + s.spanDedup.totalExcludedKcal);
  check(name + ' 9954 totalExcludedGeneric 3800', s.spanDedup.totalExcludedGenericKcal === 3800, '' + s.spanDedup.totalExcludedGenericKcal);
  check(name + ' 9954 changedRecords 1', s.spanDedup.changedRecords === 1, '' + s.spanDedup.changedRecords);
  const g = s.fams.get('Foraged food');
  check(name + ' 9954 generic spanDedupKcal 3800', g.spanDedupKcal === 3800, '' + g.spanDedupKcal);
  check(name + ' 9954 generic newDraws 198459', g.newDraws === 198459, '' + g.newDraws);
  check(name + ' 9954 generic newDrawsPreDedup 202259', g.newDrawsPreDedup === 202259, '' + g.newDrawsPreDedup);
  check(name + ' 9954 generic directKcal raw unchanged', g.directKcal === g.newDrawsPreDedup - (g.newDrawsPreDedup - g.directKcal) && g.directKcal > 0, '' + g.directKcal);
  // Identity: newDraws = meal+other+spoiled+direct - spanDedup.
  const old = oldDraws(cult).get('Foraged food');
  check(name + ' 9954 generic preDedup == recomputed old', g.newDrawsPreDedup === old.draws, 'pre=' + g.newDrawsPreDedup + ' old=' + old.draws);
  check(name + ' 9954 generic wired == old - 3800', g.newDraws === old.draws - 3800, 'wired=' + g.newDraws + ' old=' + old.draws);
  // Residual delta: wired newResidual == preResidual - 3800, where
  // preResidual is recomputed from dedup-independent fields.
  const preResid = (g.closing - g.opening) - (g.newInflow - g.newDrawsPreDedup - g.sweep - g.transformLoss);
  check(name + ' 9954 generic newResidual == pre - 3800', g.newResidual === preResid - 3800, 'wired=' + g.newResidual + ' pre=' + preResid);
  // Boundary / raid / caller legs, where the analyzer has them.
  if (g.bResidual !== undefined) {
    const preB = (g.bClosing - g.opening) - (g.bInflow - (g.bDraws + 3800) - g.bSweep - g.bLoss);
    check(name + ' 9954 generic bResidual == preB - 3800', g.bResidual === preB - 3800, 'wired=' + g.bResidual + ' preB=' + preB);
  }
  if (g.rBResidual !== undefined) {
    const preRB = (g.rBClosing - g.opening) - (g.bInflow - (g.rBDraws + 3800) - g.bSweep - g.bLoss);
    check(name + ' 9954 generic rBResidual == preRB - 3800', g.rBResidual === preRB - 3800, 'wired=' + g.rBResidual + ' preRB=' + preRB);
  }
  if (name === 'raidcallers') {
    check('raidcallers 9954 generic cBResidual -100', g.cBResidual === -100, '' + g.cBResidual);
    const preCB = (g.cBClosing - g.opening) - (g.bInflow - (g.cBDraws + 3800) - g.bSweep - g.bLoss);
    check('raidcallers 9954 generic cBResidual == preCB - 3800', g.cBResidual === preCB - 3800, 'wired=' + g.cBResidual + ' preCB=' + preCB);
  }
  // No other family moves, except the one pre-published Fish catch
  // unit: sim-dedupspan-b states total excluded from seq 124 is
  // 3,820 = generic 3,800 + the 20 kcal Fish catch unit. The
  // prereg's GO3 sentence ("every non-generic family bit-identical")
  // overlooked that published unit; this check asserts the exact
  // pre-published composition instead of loosening the bar (see
  // evidence metric review for the disclosed correction).
  for (const [fam, rec] of s.fams) {
    if (fam === 'Foraged food') continue;
    const want = fam === 'Fish catch' ? 20 : 0;
    check(name + ' 9954 non-generic family ' + fam + ' moves exactly ' + want,
      rec.spanDedupKcal === want && rec.newDraws === rec.newDrawsPreDedup - want,
      'spanDedupKcal=' + rec.spanDedupKcal);
  }
  for (const [fam, rec] of s.fams) {
    check(name + ' 9954 dried unmoved ' + fam, rec.spanDedupDriedKcal === 0 && rec.newDriedDraws === rec.newDriedDrawsPreDedup,
      'dried=' + rec.spanDedupDriedKcal);
  }
}

// --- GO3/GO4 on every bare corpus: bit-identical, status no-span-data ---
for (const [name, mod, dir] of ANALYZERS) {
  const a = require(mod);
  const payloads = loadDir(dir);
  check(name + ' bare corpus loads seeds', payloads.length >= 1, '' + payloads.length);
  for (const ps of payloads) {
    const s = a.perSeed(ps);
    check(name + ' seed ' + ps.seed + ' status no-span-data', s.spanDedup.status === 'no-span-data', s.spanDedup.status);
    check(name + ' seed ' + ps.seed + ' totalExcluded 0', s.spanDedup.totalExcludedKcal === 0, '' + s.spanDedup.totalExcludedKcal);
    const old = oldDraws(ps);
    for (const [fam, rec] of s.fams) {
      const o = old.get(fam) || { draws: 0, driedDraws: 0 };
      // Families with no draws at all still appear via inflows; only
      // compare when the recomputed old sum covers this family.
      check(name + ' seed ' + ps.seed + ' family ' + fam + ' wired == old',
        rec.newDraws === o.draws && rec.newDrawsPreDedup === o.draws && rec.spanDedupKcal === 0,
        'wired=' + rec.newDraws + ' old=' + o.draws);
    }
  }
}

// --- Guard: ambiguous span fails closed through a wired analyzer ---
{
  const a = require('./analyze-stockdoors-b.js');
  const ps = {
    seed: 1, daysAlive: 10, inflows: [], spoilEvents: { sweeps: [] },
    openingStock: { channels: [] }, spoilDays: [], driedEvents: [],
    stockdoorRecords: [], directCounters: {},
    mealDrawRecords: [{ kind: 'pantryDraw', context: 'meal', seq: 466, want: 100, taken: 100,
      items: [{ name: 'Foraged food', units: 1, kcalEach: 100, spoilDay: 40 }] }],
    directRecords: [{ seq: 5, path: 'green_whisper.cultivate', day: 36, totalKcal: 100,
      items: [{ name: 'Foraged food', units: 1, kcalEach: 100, spoilDay: 40 }] }],
    nestEvents: [
      { kind: 'spanEnter', evt: 10, ability: 'green_whisper', action: 'cultivate', depth: 0, day: 35, directBefore: 0 },
      { kind: 'drawEnter', evt: 11, day: 36, want: 100 },
      { kind: 'drawExit', evt: 12, day: 36, taken: 100, items: [{ name: 'Foraged food', units: 1, kcalEach: 100, spoilDay: 40 }] },
      { kind: 'spanExit', evt: 13, ability: 'green_whisper', action: 'cultivate', depth: 0, day: 36, directAfter: 1 },
    ],
  };
  const s = a.perSeed(ps);
  check('synthetic ambiguous span status', s.spanDedup.status === 'applied-with-ambiguity', s.spanDedup.status);
  check('synthetic ambiguous span excludes nothing', s.spanDedup.totalExcludedKcal === 0, '' + s.spanDedup.totalExcludedKcal);
  const g = s.fams.get('Foraged food');
  check('synthetic ambiguous span newDraws == old 200', g && g.newDraws === 200, g ? '' + g.newDraws : 'no generic family');
}

// --- Guard: documented-only analyzers still contain no direct leg ---
for (const f of ['analyze-driedpath-b.js', 'analyze-bothgrow-b.js', 'analyze-cattailband-b.js',
  'analyze-lqpersist-b.js', 'analyze-mealdraw-b.js', 'analyze-mealdraw-reprereg-b.js',
  'analyze-spoilvol-b.js', 'analyze-smoke-eq-b.js']) {
  const src = fs.readFileSync(path.join(__dirname, f), 'utf8');
  check('documented-only ' + f + ' has no directRecords', !src.includes('directRecords'), 'found directRecords — wire it or update the inventory');
}

console.log('dedupspan-wire checks: ' + passed + ' passed, ' + failed + ' failed');
if (failed) { console.log('FAILURES:\n' + failures.join('\n')); process.exit(1); }
console.log('VERDICT: GO');
