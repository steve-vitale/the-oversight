#!/usr/bin/env node
// test-strandloss-b.js — proof for the strand-loss restoration bisection
// (sim-strandloss-b, DIAG ONLY). Pure checks always run; corpus checks
// run with --corpus after the basecheck / equivalence / baseline /
// restoration legs exist.
//
// Pure: (a) haven-checked census on synthetic evening sequences
// (consecutive-run breaks, rescued interleaves, haven evenings
// breaking runs, non-creek buckets); (b) awayWoodShort counting.
// Corpus: (c) basecheck 15215 guard+ON are [] / [] with errs 0;
// (d) runner equivalence — stdout-runner 15215 legs deep-equal the
// basecheck legs on evenings, mornings, nights, errs, daysAlive,
// endReason; (e) every judged stage dir present has one file per
// expected seed, errs 0, 30 evenings, survived; (f) census
// recomputation matches each stored stage census JSON; (g) every
// restoration manifest's restored file hashes to the daabd0e2d blob
// and every unrestored file hashes to the pinned-base blob;
// (h) diff guard — no src/ or scripts/policies/ change vs the pinned
// base at evidence time (restorations reverted); (i) det-gate —
// any det rerun file is byte-identical to its quoted leg file.
// Usage: node scripts/test-strandloss-b.js [--corpus]
'use strict';
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { strandChecked, awayWoodShort, analyzeSeed, loadDir } = require('./analyze-strandbank-b');

const ROOT = path.join(__dirname, '..');
const EV = path.join(ROOT, 'evidence', '2026-10-31');
const PINNED = 'a3e57bfc17a95d90773634d24f7d39b8c34123c3';
const STRAND_ERA = 'daabd0e2d33827763ed10d359eb3f081ea4ad3a5';
const PILOT = [15003, 15009, 15091, 15211, 15215, 15220, 15221, 15337];
const BANK = [15003, 15009, 15091, 15211, 15215, 15220, 15221, 15337, 15376, 15439];
const FRESH = [16501, 16502, 16503, 16504, 16505, 16506, 16507, 16508];

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra !== undefined ? ' :: ' + JSON.stringify(extra) : '')); }
}
function ev(loopDay, bucket, rescued, inside, tile, eveningWood) {
  return { loopDay, woodcarry: { bucket, rescued: !!rescued }, inside, tile, eveningWood };
}
function gitBlob(rev, file) {
  const r = spawnSync('git', ['rev-parse', rev + ':' + file], { cwd: ROOT, encoding: 'utf8' });
  return r.status === 0 ? r.stdout.trim() : null;
}
function deepEq(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

function pure() {
  let d = { evenings: [
    ev(1, 'creek', false), ev(2, 'creek', false), ev(3, 'haven', false),
    ev(4, 'creek', false), ev(5, 'creek', true), ev(6, 'creek', false),
    ev(7, 'creek', false),
  ] };
  let s = strandChecked(d);
  check('runs split by haven + rescued', deepEq(s.runs, [[1, 2], [4], [6, 7]]), s.runs);
  check('still list', deepEq(s.still, [1, 2, 4, 6, 7]), s.still);
  check('rescued list', deepEq(s.rescued, [5]), s.rescued);
  d = { evenings: [ev(25, 'creek', true, true, 'haven', 4), ev(26, 'creek', false)] };
  s = strandChecked(d);
  check('haven evening excluded from creek + breaks run', deepEq(s.creek, [26]) && deepEq(s.rescued, []) && deepEq(s.runs, [[26]]), s);
  d = { evenings: [ev(10, 'forest', false, false, 'forest_floor', 2), ev(11, 'creek', false, false, 'creek', 0)] };
  check('awayWoodShort counts non-haven wood<4 only', deepEq(awayWoodShort(d), [10, 11]), awayWoodShort(d));
  d = { evenings: [ev(10, 'creek', false, true, 'haven', 0)] };
  check('awayWoodShort skips haven evenings', deepEq(awayWoodShort(d), []), awayWoodShort(d));
}

function readJson(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }
function corpusFile(dir, seed) {
  const f = path.join(dir, 'morningcarry-b-nighttravel-s' + seed + '.json');
  return fs.existsSync(f) ? f : null;
}
function checkStage(stage, guardDir, onDir, seeds, censusPath) {
  let ok = true;
  for (const seed of seeds) {
    for (const [leg, dir] of [['guard', guardDir], ['on', onDir]]) {
      const f = corpusFile(dir, seed);
      check(stage + ' seed ' + seed + ' ' + leg + ' file exists', !!f);
      if (!f) { ok = false; continue; }
      const a = analyzeSeed(f);
      check(stage + ' seed ' + seed + ' ' + leg + ' errs 0', a.errs === 0, a.errs);
      check(stage + ' seed ' + seed + ' ' + leg + ' 30 evenings', a.evenings === 30, a.evenings);
      check(stage + ' seed ' + seed + ' ' + leg + ' survived', a.endReason === 'survived' && a.daysAlive === 30, a.endReason + '/' + a.daysAlive);
      if (a.errs !== 0 || a.evenings !== 30) ok = false;
    }
  }
  if (censusPath && fs.existsSync(censusPath)) {
    const stored = readJson(censusPath);
    const g = loadDir(guardDir), o = loadDir(onDir);
    let totalStill = 0, totalCreek = 0, seedsWithStrand = 0;
    for (const seed of seeds) {
      if (!g[seed] || !o[seed]) continue;
      totalStill += g[seed].still.length + o[seed].still.length;
      totalCreek += g[seed].creek.length + o[seed].creek.length;
      if (g[seed].runs.length || o[seed].runs.length) seedsWithStrand++;
    }
    check(stage + ' census recomputation matches stored', stored.totalStill === totalStill && stored.totalCreek === totalCreek && stored.seedsWithStrand === seedsWithStrand,
      { stored: [stored.totalStill, stored.totalCreek, stored.seedsWithStrand], recomputed: [totalStill, totalCreek, seedsWithStrand] });
    for (const seed of seeds) {
      if (stored.perSeed && stored.perSeed[seed]) {
        check(stage + ' census seed ' + seed + ' matches analyzer', deepEq(stored.perSeed[seed].guard.still, g[seed].still) && deepEq(stored.perSeed[seed].on.still, o[seed].still));
      }
    }
  }
  return ok;
}
function checkManifest(stage, leg, restoredFile) {
  const mPath = path.join(EV, 'sim-strandloss-b-manifest-' + stage + '-' + leg + '.json');
  check(stage + '-' + leg + ' manifest exists', fs.existsSync(mPath));
  if (!fs.existsSync(mPath)) return;
  const m = readJson(mPath);
  const eraFF = gitBlob(STRAND_ERA, 'src/js/fieldFights.js');
  const eraVB = gitBlob(STRAND_ERA, 'src/js/villager-build.js');
  const pinFF = gitBlob(PINNED, 'src/js/fieldFights.js');
  const pinVB = gitBlob(PINNED, 'src/js/villager-build.js');
  check(stage + '-' + leg + ' manifest pinned head', m.pinnedHead === PINNED, m.pinnedHead);
  if (restoredFile === 'fieldFights') {
    check(stage + '-' + leg + ' fieldFights restored to era blob', m.fieldFightsBlob === eraFF, m.fieldFightsBlob);
    check(stage + '-' + leg + ' villager-build untouched (pinned blob)', m.villagerBuildBlob === pinVB, m.villagerBuildBlob);
  } else if (restoredFile === 'villagerBuild') {
    check(stage + '-' + leg + ' villager-build restored to era blob', m.villagerBuildBlob === eraVB, m.villagerBuildBlob);
    check(stage + '-' + leg + ' fieldFights untouched (pinned blob)', m.fieldFightsBlob === pinFF, m.fieldFightsBlob);
  } else if (restoredFile === 'both') {
    check(stage + '-' + leg + ' fieldFights restored to era blob', m.fieldFightsBlob === eraFF, m.fieldFightsBlob);
    check(stage + '-' + leg + ' villager-build restored to era blob', m.villagerBuildBlob === eraVB, m.villagerBuildBlob);
  } else {
    check(stage + '-' + leg + ' fieldFights pinned blob', m.fieldFightsBlob === pinFF, m.fieldFightsBlob);
    check(stage + '-' + leg + ' villager-build pinned blob', m.villagerBuildBlob === pinVB, m.villagerBuildBlob);
  }
}
function eqFields(a, b) {
  return ['evenings', 'mornings', 'nights', 'errCount', 'daysAlive', 'endReason'].every((k) => deepEq(a[k], b[k]));
}

function corpus() {
  // (c) basecheck
  for (const leg of ['guard', 'on']) {
    const dir = path.join(EV, 'sim-strandloss-b-basecheck-' + leg);
    const f = corpusFile(dir, 15215);
    check('basecheck ' + leg + ' file exists', !!f);
    if (f) {
      const s = strandChecked(readJson(f));
      check('basecheck ' + leg + ' still []', deepEq(s.still, []), s.still);
      check('basecheck ' + leg + ' creek []', deepEq(s.creek, []), s.creek);
      check('basecheck ' + leg + ' rescued []', deepEq(s.rescued, []), s.rescued);
    }
  }
  // (d) runner equivalence
  for (const leg of ['guard', 'on']) {
    const base = corpusFile(path.join(EV, 'sim-strandloss-b-basecheck-' + leg), 15215);
    const eq = corpusFile(path.join(EV, 'sim-strandloss-b-equiv-' + leg), 15215);
    check('equiv ' + leg + ' file exists', !!eq);
    if (base && eq) check('equiv ' + leg + ' deep-equals basecheck', eqFields(readJson(base), readJson(eq)));
  }
  // (e,f) stages
  checkStage('baseline', path.join(EV, 'sim-strandloss-b-baseline-guard'), path.join(EV, 'sim-strandloss-b-baseline-on'), PILOT,
    path.join(EV, 'sim-strandloss-b-census-baseline.json'));
  checkManifest('baseline', 'guard', null);
  checkManifest('baseline', 'on', null);
  checkStage('r1', path.join(EV, 'sim-strandloss-b-r1-guard'), path.join(EV, 'sim-strandloss-b-r1-on'), PILOT,
    path.join(EV, 'sim-strandloss-b-census-r1.json'));
  checkManifest('r1', 'guard', 'fieldFights');
  checkManifest('r1', 'on', 'fieldFights');
  checkStage('r2', path.join(EV, 'sim-strandloss-b-r2-guard'), path.join(EV, 'sim-strandloss-b-r2-on'), PILOT,
    path.join(EV, 'sim-strandloss-b-census-r2.json'));
  checkManifest('r2', 'guard', 'villagerBuild');
  checkManifest('r2', 'on', 'villagerBuild');
  const r3g = path.join(EV, 'sim-strandloss-b-r3-guard');
  if (fs.existsSync(r3g)) {
    checkStage('r3', r3g, path.join(EV, 'sim-strandloss-b-r3-on'), PILOT,
      path.join(EV, 'sim-strandloss-b-census-r3.json'));
    checkManifest('r3', 'guard', 'both');
    checkManifest('r3', 'on', 'both');
  } else {
    console.log('SKIP r3 (not run — conditional stage)');
  }
  const cfm = path.join(EV, 'sim-strandloss-b-confirm-guard');
  if (fs.existsSync(cfm)) {
    checkStage('confirm', cfm, path.join(EV, 'sim-strandloss-b-confirm-on'), BANK.concat(FRESH),
      path.join(EV, 'sim-strandloss-b-census-confirm.json'));
  } else {
    console.log('SKIP confirm (not run — conditional stage)');
  }
  // (i) det-gate: any det dir present must be byte-identical to its quoted dir
  for (const entry of fs.readdirSync(EV)) {
    const m = entry.match(/^sim-strandloss-b-(.+)-det-(guard|on)$/);
    if (!m) continue;
    const detDir = path.join(EV, entry);
    const srcDir = path.join(EV, 'sim-strandloss-b-' + m[1] + '-' + m[2]);
    for (const f of fs.readdirSync(detDir).filter((x) => x.endsWith('.json')).sort()) {
      const det = fs.readFileSync(path.join(detDir, f), 'utf8');
      const src = fs.existsSync(path.join(srcDir, f)) ? fs.readFileSync(path.join(srcDir, f), 'utf8') : null;
      check('det-gate ' + entry + '/' + f + ' byte-identical', src !== null && det === src);
    }
  }
  // (h) diff guard
  const r = spawnSync('git', ['diff', '--name-only', PINNED, '--', 'src/', 'scripts/policies/'], { cwd: ROOT, encoding: 'utf8' });
  const names = (r.stdout || '').trim();
  check('diff guard: no src/ or scripts/policies/ change vs pinned base', names === '', names);
}

pure();
if (process.argv.includes('--corpus')) corpus();
console.log(pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
