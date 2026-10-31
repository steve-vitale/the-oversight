#!/usr/bin/env node
// test-strandfix-ticks-b.js — proof for sim-strandfix-ticks-b
// (prereg: evidence/2026-10-30/sim-strandfix-ticks-b-prereg.md).
// Pure unit tests always run. Corpus checks run when the
// corpora exist; before legs exist they are reported SKIPPED
// (not passed). A final green run requires zero skips.
// Usage: node scripts/test-strandfix-ticks-b.js [--pure-only]
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { holdDecision } = require('./policies/strandfix-ticks-diag');
const { gates, ticksClass, attribute, strandDays } = require('./analyze-strandfix-ticks-b');

let pass = 0, fail = 0, skip = 0;
const fails = [];
function check(name, cond, extra) {
  if (cond) { pass++; }
  else { fail++; fails.push(name + (extra ? ' :: ' + extra : '')); console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}
function ev(wood, kcal, ticks, rescued, bucket) {
  return { woodcarry: { bucket: bucket || 'creek', rescued: !!rescued,
    classification: { woodPlayer: wood, kcalLive: kcal, ticksToDayEnd: ticks }, bridge: { skip: null, built: rescued || null } } };
}
function pressEv(wood, kcal, ticks, ticksSpent) {
  const e = ev(wood, kcal, ticks, false);
  e.pressbAttempt = { ticksSpent };
  return e;
}

// --- holdDecision gate ---
check('hold: creek wake 384 fires', holdDecision({ gameOver: false, combatLive: false, insideTent: false, wakeTileType: 'creek', insideHaven: false, morningDayTicks: 384 }).fire === true);
check('hold: creek wake 256 skips day-not-short', holdDecision({ gameOver: false, combatLive: false, insideTent: false, wakeTileType: 'creek', insideHaven: false, morningDayTicks: 256 }).skip === 'day-not-short');
check('hold: creek wake 128 skips', holdDecision({ gameOver: false, combatLive: false, insideTent: false, wakeTileType: 'creek', insideHaven: false, morningDayTicks: 128 }).skip === 'day-not-short');
check('hold: haven wake skips', holdDecision({ gameOver: false, combatLive: false, insideTent: false, wakeTileType: 'haven', insideHaven: true, morningDayTicks: 384 }).skip !== undefined && holdDecision({ gameOver: false, combatLive: false, insideTent: false, wakeTileType: 'haven', insideHaven: true, morningDayTicks: 384 }).fire === false);
check('hold: wetland wake skips not-creek', holdDecision({ gameOver: false, combatLive: false, insideTent: false, wakeTileType: 'wetland', insideHaven: false, morningDayTicks: 384 }).skip === 'not-creek-wake');
check('hold: tent skips', holdDecision({ gameOver: false, combatLive: false, insideTent: true, wakeTileType: 'creek', insideHaven: false, morningDayTicks: 384 }).skip === 'in-tent');
check('hold: combat skips', holdDecision({ gameOver: false, combatLive: true, insideTent: false, wakeTileType: 'creek', insideHaven: false, morningDayTicks: 384 }).skip === 'combat');
check('hold: game-over skips', holdDecision({ gameOver: true, combatLive: false, insideTent: false, wakeTileType: 'creek', insideHaven: false, morningDayTicks: 384 }).skip === 'game-over');
check('hold: null morningDayTicks skips', holdDecision({ gameOver: false, combatLive: false, insideTent: false, wakeTileType: 'creek', insideHaven: false, morningDayTicks: null }).fire === false);
check('hold: 385 fires (boundary inclusive)', holdDecision({ gameOver: false, combatLive: false, insideTent: false, wakeTileType: 'creek', insideHaven: false, morningDayTicks: 385 }).fire === true);
check('hold: 383 skips', holdDecision({ gameOver: false, combatLive: false, insideTent: false, wakeTileType: 'creek', insideHaven: false, morningDayTicks: 383 }).skip === 'day-not-short');

// --- raw gates + ticks classes ---
check('class alone', ticksClass(ev(4, 2254, 47, false)) === 'alone');
check('class plus-wood', ticksClass(ev(0, 1246, 93, false)) === 'plus-wood');
check('class plus-kcal', ticksClass(ev(4, 0, 50, false)) === 'plus-kcal');
check('class plus-both', ticksClass(ev(2, 0, 95, false)) === 'plus-both');
check('class pass', ticksClass(ev(4, 500, 111, false)) === 'pass');
check('class boundary 96 passes', ticksClass(ev(4, 60, 96, false)) === 'pass');
check('class boundary 95 alone', ticksClass(ev(4, 60, 95, false)) === 'alone');
check('gates kcalLive fallback', (() => { const e = ev(4, null, 47, false); e.woodcarry.classification.kcalLive = null; e.woodcarry.classification.kcal = 2254; return gates(e).kcal === 2254; })());

// --- attribution (tickbudget definitions) ---
check('attr decisive', attribute(pressEv(4, 500, 93, 17), ev(4, 500, 110, true)).cls === 'PRESS-DECISIVE');
check('attr decisive needs shortfall covered', attribute(pressEv(4, 500, 93, 2), ev(4, 500, 110, true)).cls === 'PRESS-CONTRIBUTING');
check('attr plus never decisive', attribute(pressEv(0, 1246, 93, 17), ev(0, 1246, 110, true)).cls === 'PRESS-CONTRIBUTING');
check('attr missing counterpart never decisive', attribute(pressEv(4, 500, 93, 17), null).cls === 'PRESS-CONTRIBUTING');
check('attr counterpart also ticks-short', attribute(pressEv(4, 500, 93, 17), ev(4, 500, 90, false)).cls === 'PRESS-CONTRIBUTING');
check('attr routine-only', attribute(ev(4, 2254, 47, false), ev(4, 2254, 110, true)).cls === 'ROUTINE-ONLY');

// --- strand extraction ---
check('strand runs', JSON.stringify(strandDays({ evenings: [7, 8, 9, 11, 12].map((d) => ({ loopDay: d, woodcarry: { bucket: 'creek', rescued: false } })) })) === JSON.stringify([[7, 8, 9], [11, 12]]));
check('strand rescued breaks', JSON.stringify(strandDays({ evenings: [{ loopDay: 7, woodcarry: { bucket: 'creek', rescued: false } }, { loopDay: 8, woodcarry: { bucket: 'creek', rescued: true } }, { loopDay: 9, woodcarry: { bucket: 'creek', rescued: false } }] })) === JSON.stringify([[7], [9]]));
check('strand non-creek breaks', JSON.stringify(strandDays({ evenings: [{ loopDay: 7, woodcarry: { bucket: 'creek', rescued: false } }, { loopDay: 8, woodcarry: { bucket: 'other', rescued: false } }] })) === JSON.stringify([[7]]));

// --- conversion classes (evidence-side logic, mirrored) ---
function conversionClass(controlEv, instrEv) {
  if (!instrEv) return 'no-instrument-evening';
  const wc = instrEv.woodcarry || {};
  if (wc.bucket === 'creek' && wc.rescued && wc.bridge && wc.bridge.built) return 'converted-rescued';
  if (wc.bucket === 'creek' && !wc.rescued && gates(instrEv).ticksGate) return 'ticks-cleared-not-rescued';
  if (wc.bucket === 'creek' && !wc.rescued && !gates(instrEv).ticksGate) return 'still-ticks-short';
  if (wc.bucket === 'creek' && wc.rescued) return 'rescued-other';
  return 'no-creek-evening';
}
check('conv rescued', conversionClass(ev(4, 500, 93, false), ev(4, 500, 111, true)) === 'converted-rescued');
check('conv rescued requires built', conversionClass(ev(4, 500, 93, false), (() => { const e = ev(4, 500, 111, true); e.woodcarry.bridge.built = null; return e; })()) === 'rescued-other');
check('conv ticks-cleared', conversionClass(ev(0, 1246, 93, false), ev(0, 1246, 128, false)) === 'ticks-cleared-not-rescued');
check('conv still-ticks-short', conversionClass(ev(4, 2254, 47, false), ev(4, 2254, 47, false)) === 'still-ticks-short');
check('conv avoided is not conversion', conversionClass(ev(4, 2254, 47, false), { eveningOutcome: 'completed', woodcarry: null }) === 'no-creek-evening');

// --- reconciliation arithmetic fixture (guard day-10 shape) ---
check('recon day-10 shape', 512 - (384 + 17 + 18 + 0) === 93);
check('recon day-7 shape', 512 - (384 + 0 + 81 + 0) === 47);
check('recon hold shape', 512 - (384 + 17 + 0 + 0) === 111);

// --- corpus checks ---
const pureOnly = process.argv.includes('--pure-only');
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-30');
const PIN = '52df7e732d7e31c8cb6aae92c778f00cdebf8294';
function corpusCheck() {
  const need = [];
  const pilotLegs = ['control-variant-guard', 'control-variant-on', 'instrument-guard', 'instrument-on'];
  const confirmLegs = ['control-variant-guard', 'control-variant-on', 'instrument-guard', 'instrument-on', 'control-control-guard', 'control-control-on', 'detgate-guard', 'detgate-on'];
  for (const l of pilotLegs) need.push(['pilot', path.join(EVID, `sim-strandfix-ticks-b-corpus-pilot-${l}`), 8]);
  for (const l of confirmLegs) need.push(['confirm', path.join(EVID, `sim-strandfix-ticks-b-corpus-${l}`), 10]);
  let anyMissing = false;
  for (const [stage, dir, n] of need) {
    if (!fs.existsSync(dir)) { anyMissing = true; continue; }
    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'));
    check(`corpus ${stage} ${path.basename(dir)} file count ${n}`, files.length === n, `found ${files.length}`);
    for (const f of files) {
      let inst;
      try { inst = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); } catch (e) { check(`corpus parse ${f}`, false, String(e)); continue; }
      const wc = inst.woodcarryStore || {}, ww = inst.warmthStore || {}, pb = inst.pressbStore || {}, sf = inst.strandfixStore || {};
      check(`corpus errs ${stage}/${f}`, (wc.errs || 0) + (ww.errs || 0) + (pb.errs || 0) + (sf.errs || 0) === 0, `wc ${wc.errs} ww ${ww.errs} pb ${pb.errs} sf ${sf.errs}`);
      for (const a of (pb.attempts || [])) check(`press ticksSpent==17 ${f} d${a.loopDay}`, a.ticksSpent === 17, String(a.ticksSpent));
      // Instrument legs: every loop-day has a hold or skip row.
      if (dir.includes('-instrument-')) {
        const rows = (sf.holds || []).length + (sf.skips || []).length;
        check(`strandfix rows cover loop-days ${f}`, rows === (inst.evenings || []).length, `rows ${rows} evenings ${(inst.evenings || []).length}`);
        for (const e of (inst.evenings || [])) {
          if (e.strandfixHold) {
            const ntProbe = (e.tickProbe || []).find((p) => p.layer === 'nighttravel');
            check(`hold has no nighttravel probe ${f} d${e.loopDay}`, !ntProbe);
          }
        }
      }
      // Det-gate legs: strandfix store must be all skips (lever off).
      if (dir.includes('-detgate-')) {
        check(`detgate no holds ${f}`, (sf.holds || []).length === 0);
      }
    }
  }
  if (anyMissing) { skip++; console.log('SKIP corpus checks: some corpus dirs missing (pre-leg state)'); }
  // Pilot-vs-confirm byte identity (same driver legs only).
  const pairs = [
    ['sim-strandfix-ticks-b-corpus-pilot-control-variant-guard', 'sim-strandfix-ticks-b-corpus-control-variant-guard', 'tickbudget-b-nighttravel-s'],
    ['sim-strandfix-ticks-b-corpus-pilot-control-variant-on', 'sim-strandfix-ticks-b-corpus-control-variant-on', 'tickbudget-b-nighttravel-s'],
    ['sim-strandfix-ticks-b-corpus-pilot-instrument-guard', 'sim-strandfix-ticks-b-corpus-instrument-guard', 'strandfix-ticks-b-nighttravel-s'],
    ['sim-strandfix-ticks-b-corpus-pilot-instrument-on', 'sim-strandfix-ticks-b-corpus-instrument-on', 'strandfix-ticks-b-nighttravel-s'],
  ];
  const pilotSeeds = [15003, 15009, 15091, 15211, 15215, 15220, 15221, 15337];
  for (const [pd, cd, prefix] of pairs) {
    const pdir = path.join(EVID, pd), cdir = path.join(EVID, cd);
    if (!fs.existsSync(pdir) || !fs.existsSync(cdir)) continue;
    for (const s of pilotSeeds) {
      const pf = path.join(pdir, `${prefix}${s}.json`), cf = path.join(cdir, `${prefix}${s}.json`);
      if (!fs.existsSync(pf) || !fs.existsSync(cf)) { check(`pilot==confirm present ${cd} s${s}`, false, 'missing file'); continue; }
      check(`pilot==confirm byte-identical ${cd} s${s}`, fs.readFileSync(pf, 'utf8') === fs.readFileSync(cf, 'utf8'));
    }
  }
  // Tracked diff guard vs pinned base: src/ empty; only allowed
  // new files under scripts/ and evidence/ may differ.
  try {
    const out = execSync(`git diff ${PIN} --name-only`, { cwd: path.join(__dirname, '..'), encoding: 'utf8' });
    const changed = out.split('\n').filter(Boolean);
    const allowed = (f) => f.startsWith('evidence/2026-10-30/sim-strandfix-ticks-b-')
      || f === 'scripts/policies/strandfix-ticks-diag.js'
      || f === 'scripts/strandfix-ticks-trace-b.js'
      || f === 'scripts/analyze-strandfix-ticks-b.js'
      || f === 'scripts/test-strandfix-ticks-b.js';
    const bad = changed.filter((f) => !allowed(f));
    check('diff guard: src/ empty', !changed.some((f) => f.startsWith('src/')), changed.filter((f) => f.startsWith('src/')).join(','));
    check('diff guard: no pre-existing policy/script modified', !bad.some((f) => f.startsWith('scripts/policies/') || f.startsWith('scripts/')), bad.join(','));
    // Untracked files under scripts/ must also be only the new ones.
    const untracked = execSync('git status --porcelain', { cwd: path.join(__dirname, '..'), encoding: 'utf8' }).split('\n').filter(Boolean);
    const badUntracked = untracked.filter((l) => { const f = l.slice(3); return (f.startsWith('scripts/') || f.startsWith('src/')) && !allowed(f); });
    check('diff guard: no stray untracked scripts/src', badUntracked.length === 0, badUntracked.join(','));
  } catch (e) { check('diff guard ran', false, String(e && e.message)); }
  // Analyzer outputs exist (confirm).
  for (const f of ['sim-strandfix-ticks-b-census.json', 'sim-strandfix-ticks-b-hold-table.json', 'sim-strandfix-ticks-b-compare.md']) {
    check(`analyzer output ${f}`, fs.existsSync(path.join(EVID, f)));
  }
}
if (!pureOnly) corpusCheck();
console.log(`test-strandfix-ticks-b: pass=${pass} fail=${fail} skip=${skip}`);
if (fails.length) { console.log('failures:'); for (const f of fails) console.log(' - ' + f); }
process.exit(fail ? 1 : 0);
