#!/usr/bin/env node
// test-kcalshort-b.js — proof suite for sim-kcalshort-b.
// Checks: classification unit cases (all eight classes + null
// handling + kcalLive fallback); census totals recomputed
// independently from the recorder corpora; equivalence of the
// recorder legs with the fresh master baselines (per-seed
// creek/still/rescued + strand nights + evening woods, via
// the woodday analyzer's census JSON); 100% classified;
// recorder + pantry/pack errors 0; determinism byte-identical;
// tracked-diff guard (src/ + scripts/policies/ clean vs HEAD).
// Usage: node scripts/test-kcalshort-b.js
// Exits non-zero with a FAIL list on any miss.
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { classify, median, analyzeDir } = require('./analyze-kcalshort-b');

const ROOT = path.join(__dirname, '..');
const EV = path.join(ROOT, 'evidence', '2026-10-30');
const fails = [];
const passes = [];
function check(name, cond, detail) {
  if (cond) passes.push(name);
  else fails.push(name + (detail ? ' :: ' + detail : ''));
}
function mkEvening(logs, kcalLive, kcal, ticks) {
  return { woodcarry: { bucket: 'creek', rescued: false,
    classification: { woodPlayer: logs, kcalLive, kcal, ticksToDayEnd: ticks },
    bridge: { skip: null, attempted: false }, narration: null } };
}

// --- 1. classification unit cases ---
const cases = [
  [mkEvening(4, 24, 24, 200), 'kcal-only'],
  [mkEvening(3, 240, 240, 200), 'wood-only'],
  [mkEvening(2, 30, 30, 200), 'both'],
  [mkEvening(4, 100, 100, 50), 'ticks-only'],
  [mkEvening(4, 30, 30, 50), 'kcal+ticks'],
  [mkEvening(3, 100, 100, 50), 'wood+ticks'],
  [mkEvening(1, 0, 0, 10), 'all-three'],
  [mkEvening(4, 60, 60, 96), 'neither/other'], // exact thresholds pass
  [mkEvening(4, 100, 100, 200), 'neither/other'],
];
for (const [ev, want] of cases) {
  const c = classify(ev);
  check('classify ' + want, !c.unclassified && c.mode === want, JSON.stringify(c));
}
{
  const c = classify(mkEvening(4, 24, 24, 200));
  check('kcalGap 24kcal -> 36', c.kcalGap === 36, 'got ' + c.kcalGap);
  const c2 = classify(mkEvening(1, 100, 100, 200));
  check('woodDeficit 1log -> 3', c2.woodDeficit === 3, 'got ' + c2.woodDeficit);
  const c3 = classify(mkEvening(3, null, 40, 200));
  check('kcalLive fallback used + named', !c3.unclassified && c3.kcal === 40 && c3.kcalFallbackUsed === true, JSON.stringify(c3));
  const c4 = classify(mkEvening(null, 100, 100, 200));
  check('null logs -> unclassified', c4.unclassified === true, JSON.stringify(c4));
  const c5 = classify(mkEvening(4, null, null, 200));
  check('null kcal both -> unclassified', c5.unclassified === true, JSON.stringify(c5));
  const c6 = classify({ woodcarry: { bucket: 'creek', rescued: false, classification: null } });
  check('null classification -> unclassified', c6.unclassified === true, JSON.stringify(c6));
  check('median odd', median([60, 10, 30]) === 30, '');
  check('median even', median([10, 20, 30, 40]) === 25, '');
  check('median empty -> null', median([]) === null, '');
}

// --- 2. censuses exist; recompute independently ---
function loadJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}
const cenOn = loadJson(path.join(EV, 'sim-kcalshort-b-census-on.json'));
const cenGuard = loadJson(path.join(EV, 'sim-kcalshort-b-census-guard.json'));
const baseOn = loadJson(path.join(EV, 'sim-kcalshort-b-census-base-on.json'));
const baseGuard = loadJson(path.join(EV, 'sim-kcalshort-b-census-base-guard.json'));

for (const [label, cen] of [['ON', cenOn], ['guard', cenGuard]]) {
  check(label + ' table == strand evenings summed',
    cen.table.length === cen.strandEvenings
    && cen.table.length === cen.strands.reduce((a, s) => a + s.length, 0),
    'table ' + cen.table.length + ' strandEvenings ' + cen.strandEvenings);
  check(label + ' 0 unclassified', cen.unclassifiedCount === 0 && cen.unclassified.length === 0,
    JSON.stringify(cen.unclassified));
  check(label + ' 0 recorder errs', cen.recorderErrs === 0, 'got ' + cen.recorderErrs);
  check(label + ' 0 pantryPackErrs', cen.pantryPackErrs === 0, 'got ' + cen.pantryPackErrs);
  check(label + ' 0 pantry-pack nulls on strand evenings', cen.ppNull.length === 0,
    JSON.stringify(cen.ppNull));
  // Independent recount from raw corpus files.
  const dir = path.join(EV, 'sim-kcalshort-b-corpus-' + (label === 'ON' ? 'on' : 'guard'));
  let still = 0, strandEvs = 0;
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.json')).sort()) {
    const inst = loadJson(path.join(dir, f));
    const evs = (inst.evenings || []).sort((a, b) => a.loopDay - b.loopDay);
    let run = 0;
    const flush = () => { strandEvs += run; run = 0; };
    for (const e of evs) {
      const wc = e.woodcarry || {};
      if (wc.bucket === 'creek' && !wc.rescued) {
        still++;
        if (run > 0 && e.loopDay !== prevDay + 1) flush();
        run++;
        var prevDay = e.loopDay;
      } else flush();
    }
    flush();
  }
  check(label + ' independent still recount == census still', still === cen.stillRefused,
    'recount ' + still + ' census ' + cen.stillRefused);
  check(label + ' independent strand-evening recount == census', strandEvs === cen.strandEvenings,
    'recount ' + strandEvs + ' census ' + cen.strandEvenings);
  // Per-class recount + median recomputation from the census table itself.
  const byClass = {};
  for (const r of cen.table) { if (!r.unclassified) byClass[r.mode] = (byClass[r.mode] || 0) + 1; }
  check(label + ' byClass recount matches', JSON.stringify(byClass) === JSON.stringify(cen.byClass),
    JSON.stringify(byClass) + ' vs ' + JSON.stringify(cen.byClass));
  const kcalRows = cen.table.filter((r) => !r.unclassified && r.kcalShort);
  check(label + ' median kcalGap recomputed', median(kcalRows.map((r) => r.kcalGap)) === cen.medianKcalGap,
    'recomputed ' + median(kcalRows.map((r) => r.kcalGap)) + ' census ' + cen.medianKcalGap);
  const woodRows = cen.table.filter((r) => !r.unclassified && r.woodShort);
  check(label + ' median woodDeficit recomputed', median(woodRows.map((r) => r.woodDeficit)) === cen.medianWoodDeficit, '');
  // Every strand evening carries gap numbers + pricing numbers.
  const missing = cen.table.filter((r) => r.unclassified
    || r.logs === undefined || r.kcal === undefined || r.ticks === undefined
    || r.eveningPantryKcal === null || r.eveningPackFoodKcal === null);
  check(label + ' every strand evening fully priced', missing.length === 0,
    JSON.stringify(missing.slice(0, 3)));
  // Neither/other evenings must carry an explaining skip or narration.
  const unexplained = cen.table.filter((r) => !r.unclassified && r.mode === 'neither/other'
    && !r.bridgeSkip && !r.narration && !r.bridgeAttempted);
  check(label + ' neither/other evenings explained', unexplained.length === 0,
    JSON.stringify(unexplained));
  // All 10 seeds survived 30 days.
  check(label + ' all seeds 30 days alive', cen.wall.every((w) => w.daysAlive === 30),
    JSON.stringify(cen.wall.filter((w) => w.daysAlive !== 30)));
}

// --- 3. equivalence: recorder == fresh master baselines ---
for (const [label, cen, base] of [['ON', cenOn, baseOn], ['guard', cenGuard, baseGuard]]) {
  let ok = true; const det = [];
  for (const seed of Object.keys(base.perSeed)) {
    const a = cen.perSeed[seed], b = base.perSeed[seed];
    if (!a || a.creek !== b.creek || a.still !== b.still || a.rescued !== b.rescued) {
      ok = false; det.push(seed + ': recorder ' + JSON.stringify(a) + ' base ' + JSON.stringify(b));
    }
    const aStr = JSON.stringify((a.strands || []).map((s) => s.nights));
    const bStr = JSON.stringify((b.strands || []).map((s) => s.nights));
    if (aStr !== bStr) { ok = false; det.push(seed + ': strand nights recorder ' + aStr + ' base ' + bStr); }
    const aWood = JSON.stringify((a.strands || []).map((s) => s.eveningWoods));
    const bWood = JSON.stringify((b.strands || []).map((s) => s.eveningWoods));
    if (aWood !== bWood) { ok = false; det.push(seed + ': evening woods recorder ' + aWood + ' base ' + bWood); }
  }
  check(label + ' equivalence recorder == fresh master baseline', ok, det.join(' | '));
  check(label + ' baseline totals match census totals',
    base.creekEvenings === cen.creekEvenings && base.stillRefused === cen.stillRefused && base.rescued === cen.rescued,
    'base ' + base.creekEvenings + '/' + base.stillRefused + '/' + base.rescued
    + ' census ' + cen.creekEvenings + '/' + cen.stillRefused + '/' + cen.rescued);
}

// --- 4. determinism byte-identical ---
{
  const judged = fs.readFileSync(path.join(EV, 'sim-kcalshort-b-corpus-on', 'kcalshort-b-nighttravel-s15003.json'), 'utf8');
  const rerun = fs.readFileSync(path.join(EV, 'sim-kcalshort-b-corpus-determinism', 'kcalshort-b-nighttravel-s15003.json'), 'utf8');
  check('determinism 15003 ON byte-identical', judged === rerun, 'lengths ' + judged.length + ' vs ' + rerun.length);
}

// --- 5. tracked-diff guard: src/ + scripts/policies/ clean vs HEAD ---
{
  let out = '';
  try { out = execSync('git status --porcelain -- src/ scripts/policies/', { cwd: ROOT, encoding: 'utf8' }); } catch (e) { out = 'ERROR ' + e.message; }
  check('src/ + scripts/policies/ clean vs HEAD', out.trim() === '', out.trim().slice(0, 500));
}

// --- 6. recorder source honesty: no verb calls ---
{
  const src = fs.readFileSync(path.join(ROOT, 'scripts', 'kcalshort-trace-b.js'), 'utf8');
  const verbs = ['buildBridge(', 'travelTo(', 'addWood(', 'tickAction(', 'doAction('];
  const hits = verbs.filter((v) => src.includes(v));
  check('recorder source contains no engine verb calls', hits.length === 0, hits.join(','));
  check('recorder reads pantry + pack', src.includes('pantryKcal()') && src.includes('eveningPackFoodKcal'), '');
}

console.log('PASS ' + passes.length + ' / FAIL ' + fails.length);
for (const p of passes) console.log('  PASS ' + p);
for (const f of fails) console.log('  FAIL ' + f);
if (fails.length) process.exit(1);
