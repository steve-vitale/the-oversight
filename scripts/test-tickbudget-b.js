#!/usr/bin/env node
// test-tickbudget-b.js — proof for the tick-budget census (sim-tickbudget-b).
// Pure unit tests (gate classification, attribution classes, own-cost
// decomposition, strand extraction) PLUS corpus checks on the judged
// confirm corpora (presence, errs, press ticksSpent == 17, reconciliation,
// pilot-vs-confirm determinism, src/ + scripts/policies/ byte-identical
// to the pinned base). Run: node scripts/test-tickbudget-b.js
// Exits nonzero on any failure. No game code, no RNG, no network.
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const PINNED = 'f52f08600550b0da8159849ffcfd5665c75e04f0';
const BANK = [15003, 15009, 15091, 15211, 15215, 15220, 15221, 15337, 15376, 15439];
const PILOT = [15003, 15009, 15091, 15211, 15215, 15220, 15221, 15337];
const LEGS = ['on-control', 'on-variant', 'guard-control', 'guard-variant'];

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; }
  else { fail++; console.log('FAIL: ' + name + (extra !== undefined ? ' — ' + JSON.stringify(extra) : '')); }
}

// ---- Pure: raw-gate classification (mirrors analyze-tickbudget-b.js) ----
function tickClassOf(wood, kcal, ticks) {
  const wg = wood >= 4, kg = kcal >= 60, tg = ticks >= 96;
  if (tg) return 'not-ticks-short';
  if (wg && kg) return 'ticks-short-alone';
  if (!wg && kg) return 'ticks-short-plus-wood';
  if (wg && !kg) return 'ticks-short-plus-kcal';
  return 'ticks-short-plus-both';
}
function expectedSkip(wood, kcal, ticks) {
  if (wood < 4) return 'wood-short';
  if (kcal < 60) return 'kcal-short';
  if (ticks < 96) return 'ticks-short';
  return null;
}
check('class alone (4,500,93)', tickClassOf(4, 500, 93) === 'ticks-short-alone');
check('class alone boundary (4,60,95)', tickClassOf(4, 60, 95) === 'ticks-short-alone');
check('class not-short boundary (4,60,96)', tickClassOf(4, 60, 96) === 'not-ticks-short');
check('class plus-wood (0,1246,93)', tickClassOf(0, 1246, 93) === 'ticks-short-plus-wood');
check('class plus-kcal (4,0,50)', tickClassOf(4, 0, 50) === 'ticks-short-plus-kcal');
check('class plus-both (0,0,50)', tickClassOf(0, 0, 50) === 'ticks-short-plus-both');
check('class plus-wood, ticks fine (2,500,200)', tickClassOf(2, 500, 200) === 'not-ticks-short');
check('skip alone agrees', expectedSkip(4, 500, 93) === 'ticks-short');
check('skip plus-wood hides ticks', expectedSkip(0, 1246, 93) === 'wood-short');
check('skip plus-kcal hides ticks', expectedSkip(4, 0, 50) === 'kcal-short');
check('skip all-pass null', expectedSkip(4, 500, 200) === null);
check('shortfall 93->3', 96 - 93 === 3);
check('shortfall 47->49', 96 - 47 === 49);

// ---- Pure: attribution classes (prereg rules) ----
function attribute(o) {
  // o: {tickClass, pressFired, ticksSpent, shortfall, counterpartStatus}
  if (o.tickClass === 'ticks-short-alone' && o.pressFired && o.ticksSpent !== null
    && o.shortfall !== null && o.ticksSpent >= o.shortfall && o.counterpartStatus === 'not-ticks-short')
    return 'PRESS-DECISIVE';
  if (o.pressFired && o.ticksSpent !== null && o.ticksSpent > 0) return 'PRESS-CONTRIBUTING';
  return 'ROUTINE-ONLY';
}
check('attr decisive (guard day10 shape)',
  attribute({ tickClass: 'ticks-short-alone', pressFired: true, ticksSpent: 17, shortfall: 3, counterpartStatus: 'not-ticks-short' }) === 'PRESS-DECISIVE');
check('attr contributing: counterpart also short',
  attribute({ tickClass: 'ticks-short-alone', pressFired: true, ticksSpent: 17, shortfall: 3, counterpartStatus: 'ticks-short' }) === 'PRESS-CONTRIBUTING');
check('attr contributing: press smaller than shortfall',
  attribute({ tickClass: 'ticks-short-alone', pressFired: true, ticksSpent: 17, shortfall: 49, counterpartStatus: 'not-ticks-short' }) === 'PRESS-CONTRIBUTING');
check('attr contributing: plus evening with press',
  attribute({ tickClass: 'ticks-short-plus-wood', pressFired: true, ticksSpent: 17, shortfall: 3, counterpartStatus: 'not-ticks-short' }) === 'PRESS-CONTRIBUTING');
check('attr routine: no press day7',
  attribute({ tickClass: 'ticks-short-alone', pressFired: false, ticksSpent: null, shortfall: 49, counterpartStatus: 'ticks-short' }) === 'ROUTINE-ONLY');
check('attr missing counterpart never decisive',
  attribute({ tickClass: 'ticks-short-alone', pressFired: true, ticksSpent: 17, shortfall: 3, counterpartStatus: 'no-creek-evening' }) === 'PRESS-CONTRIBUTING');

// ---- Pure: own-cost decomposition ----
function decompose(morning, evening, probe) {
  const by = {};
  for (const p of probe) by[p.layer] = p.spent;
  const daily = evening - morning;
  return { daily, pressbOwn: daily - by.woodwarm, woodwarmOwn: by.woodwarm - by.woodcarry,
    woodcarryOwn: by.woodcarry - by.nighttravel, routine: by.nighttravel };
}
const dec = decompose(384, 419, [
  { layer: 'nighttravel', spent: 18 }, { layer: 'woodcarry', spent: 18 }, { layer: 'woodwarm', spent: 18 },
]);
check('decompose guard day10: daily 35', dec.daily === 35);
check('decompose guard day10: pressbOwn 17', dec.pressbOwn === 17);
check('decompose guard day10: routine 18', dec.routine === 18);
check('decompose guard day10: woodwarmOwn 0', dec.woodwarmOwn === 0);
check('decompose guard day10: woodcarryOwn 0', dec.woodcarryOwn === 0);
check('decompose sums to daily',
  dec.pressbOwn + dec.woodwarmOwn + dec.woodcarryOwn + dec.routine === dec.daily);
check('decompose decision sum excludes warmth',
  384 + dec.pressbOwn + dec.woodcarryOwn + dec.routine === 419);

// ---- Pure: strand extraction ----
function strandsOf(days) {
  const out = []; let cur = null;
  for (const d of days) {
    if (cur && d === cur.end + 1) cur.end = d;
    else { cur = { start: d, end: d }; out.push(cur); }
  }
  for (const s of out) s.length = s.end - s.start + 1;
  return out;
}
check('strand single run', JSON.stringify(strandsOf([7, 8, 9, 10])) === JSON.stringify([{ start: 7, end: 10, length: 4 }]));
check('strand gap splits', strandsOf([7, 8, 10, 11]).length === 2);
check('strand empty', strandsOf([]).length === 0);

// ---- Corpus checks (judged confirm corpora) ----
const corpusPrefix = 'evidence/2026-10-30/sim-tickbudget-b-corpus';
const pilotPrefix = 'evidence/2026-10-30/sim-tickbudget-b-corpus-pilot';
let census = null;
try { census = JSON.parse(fs.readFileSync(path.join(ROOT, 'evidence/2026-10-30/sim-tickbudget-b-census.json'), 'utf8')); }
catch (e) { check('census file present', false, String(e)); }
if (census) {
  for (const leg of LEGS) {
    for (const seed of BANK) {
      const f = path.join(ROOT, corpusPrefix + '-' + leg, 'tickbudget-b-nighttravel-s' + seed + '.json');
      check('confirm file present ' + leg + ' s' + seed, fs.existsSync(f));
      if (!fs.existsSync(f)) continue;
      const inst = JSON.parse(fs.readFileSync(f, 'utf8'));
      const errs = (inst.woodcarryStore ? inst.woodcarryStore.errs : 0)
        + (inst.warmthStore ? inst.warmthStore.errs : 0)
        + (inst.pressbStore ? inst.pressbStore.errs : 0);
      check('errs 0 ' + leg + ' s' + seed, errs === 0, errs);
      check('evenings 30 ' + leg + ' s' + seed, inst.evenings.length === 30, inst.evenings.length);
      for (const a of (inst.pressbStore.attempts || []))
        check('press ticksSpent 17 ' + leg + ' s' + seed + ' day' + a.loopDay, a.ticksSpent === 17, a.ticksSpent);
    }
    for (const seed of PILOT) {
      const a = path.join(ROOT, pilotPrefix + '-' + leg, 'tickbudget-b-nighttravel-s' + seed + '.json');
      const b = path.join(ROOT, corpusPrefix + '-' + leg, 'tickbudget-b-nighttravel-s' + seed + '.json');
      check('pilot==confirm byte-identical ' + leg + ' s' + seed,
        fs.existsSync(a) && fs.existsSync(b) && fs.readFileSync(a, 'utf8') === fs.readFileSync(b, 'utf8'));
    }
  }
  check('census reconciliation mismatches 0', census.summary.reconciliationMismatches === 0,
    census.reconciliationMismatches);
  if (census.reconciliationMismatches) {
    for (const m of census.reconciliationMismatches.slice(0, 5))
      check('mismatch named ' + m.leg + ' s' + m.seed + ' day' + m.loopDay, false, m.problems);
  }
  for (const rec of census.ticksShort) {
    check('skip agrees with raw gates ' + rec.leg + ' s' + rec.seed + ' day' + rec.loopDay,
      rec.skipAgrees === true, { skip: rec.skip, gates: rec.gates, tickClass: rec.tickClass });
    check('ticksLeft arithmetic ' + rec.leg + ' s' + rec.seed + ' day' + rec.loopDay,
      rec.classificationDayTicks !== null && (512 - rec.classificationDayTicks) === rec.ticksToDayEnd,
      { classificationDayTicks: rec.classificationDayTicks, ticksToDayEnd: rec.ticksToDayEnd });
    if (rec.attribution === 'PRESS-DECISIVE') {
      check('decisive has press>=shortfall + counterpart ok ' + rec.leg + ' s' + rec.seed + ' day' + rec.loopDay,
        rec.pressFired && rec.pressTicksSpent >= rec.shortfall && rec.counterpartStatus === 'not-ticks-short',
        { pressTicksSpent: rec.pressTicksSpent, shortfall: rec.shortfall, counterpartStatus: rec.counterpartStatus });
    }
  }
  check('morning table rows > 0', census.morningTable && census.morningTable.length > 0,
    census.morningTable ? census.morningTable.length : 0);
  // Every strand morning in the morning table carries press + carry + evening class.
  // (Control legs record no pressb store entries by design — the wrapper
  // delegates untouched when PRESSB=0 — so the press-completeness check
  // applies to variant legs only.)
  for (const r of (census.morningTable || [])) {
    const pressOk = r.leg.endsWith('-variant') ? (r.pressFired === true || r.pressSkip !== null) : true;
    check('morning row complete ' + r.leg + ' s' + r.seed + ' day' + r.loopDay,
      r.morningTicksLeft !== null && r.eveningTickClass !== null && pressOk
      && (r.carryActed !== null), r);
  }
}
// Guard: src/ + scripts/policies/ byte-identical to pinned base.
try {
  const diff = execSync('git diff ' + PINNED + ' -- src/ scripts/policies/', { cwd: ROOT, encoding: 'utf8' });
  check('src/ + scripts/policies/ diff empty vs pinned base', diff.trim() === '', diff.slice(0, 200));
} catch (e) { check('src/ + policies/ diff empty vs pinned base', false, String(e).slice(0, 200)); }
try {
  const st = execSync('git status --short', { cwd: ROOT, encoding: 'utf8' });
  const trackedDirty = st.split('\n').filter((l) => l && !l.startsWith('??'));
  check('no tracked modifications left', trackedDirty.length === 0, trackedDirty.slice(0, 10));
} catch (e) { check('no tracked modifications left', false, String(e).slice(0, 200)); }

console.log('test-tickbudget-b: ' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
