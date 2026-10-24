#!/usr/bin/env node
// test-homecoming-tax-b.js — proof for scripts/homecoming-tax-b.js
// (sim-homecoming-tax-b, 2026-10-24). ALL GREEN required before the verdict.
//
// Proves:
//  (1) synthetic fixture channels attribute EXACTLY (blind dep corpus ->
//      corrected table recovers the known homecoming split; partition
//      conserved; claimed-vs-corrected deltas exact);
//  (2) corpus determinism: two analyzer runs on the real 128-config corpora
//      produce byte-identical outputs;
//  (3) corpus read-only: every corpus file hashes identical before/after;
//  (4) 100% of configs attributed, 0 unexplained (8 cells x 16 seeds, all 6
//      channels present and non-negative on every cell).
//
// Usage: node scripts/test-homecoming-tax-b.js   (exit 0 = ALL GREEN)
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const ANALYZER = path.join(__dirname, 'homecoming-tax-b.js');
const DEP_DIR = path.join(ROOT, 'evidence', '2026-10-23', 'depinteraction-b-corpus');
const EAS_DIR = path.join(ROOT, 'evidence', '2026-10-23', 'easingchannels-b-corpus');
const FIX = path.join(ROOT, 'evidence', '2026-10-24', 'homecoming-tax-b', 'fixtures');

let fails = 0;
const ok = (cond, msg) => { console.log((cond ? 'PASS' : 'FAIL') + ' ' + msg); if (!cond) fails++; };
const sha = (f) => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const hashDir = (dir) => {
  const h = {};
  for (const f of fs.readdirSync(dir).sort()) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isFile()) h[f] = sha(p);
  }
  return h;
};

// ------------------------------------------------ (1) synthetic fixtures
console.log('== (1) synthetic fixture: exact attribution ==');
const CHS = ['funnelShare', 'scholarHomecoming', 'tributeDeposit', 'awayReturn', 'ambientBighaul', 'other'];
// Known truth per (pd, dg): homecoming H, true away A, tribute T, funnel FS, ambient AM, other OT.
// dg1 halves homecoming (the keep-raise+holdback tax), everything else identical.
const TRUTH = {
  '0,0': { FS: 10000, H: 1000, T: 200, A: 500, AM: 300, OT: 100 },
  '1,0': { FS: 8000,  H: 600,  T: 200, A: 400, AM: 300, OT: 100 },
  '0,1': { FS: 9000,  H: 500,  T: 200, A: 500, AM: 300, OT: 100 },
  '1,1': { FS: 7000,  H: 300,  T: 200, A: 400, AM: 300, OT: 100 },
};
function mkDep(pd, dg, policy, seed) {
  const t = TRUTH[pd + ',' + dg];
  return { seed, policy, plentydepri: pd, depositgate: dg, daysAlive: 100, villageDays: 1000,
    rotFreshKcal: 1, rotPreservedKcal: 0, depriKcal: 0, easedKcal: 0,
    // BLIND instrument: homecoming lands in awayReturn (away_wild bucket)
    glutChannels: { funnelShare: t.FS, scholarHomecoming: 0, tributeDeposit: 0,
      awayReturn: t.A + t.H, ambientBighaul: t.AM, other: t.OT },
    freshDaysMedian: 5, deathCauses: {}, national: false, table: false, win: false,
    waveReach: [1, 2], medianSurvival: 100 };
}
function mkEas(pd, dg, policy, seed) {
  const t = TRUTH[pd + ',' + dg];
  return { seed, policy, plentydepri: pd, depositgate: dg, daysAlive: 100, villageDays: 1000,
    rotFreshKcal: 1, rotPreservedKcal: 0, depriKcal: 0, easedKcal: 0,
    // HONEST instrument: homecoming has its own channel
    glutChannels: { funnelShare: t.FS, scholarHomecoming: t.H, tributeDeposit: t.T,
      awayReturn: t.A, ambientBighaul: t.AM, other: t.OT },
    extra: { glutDays: 10, attribution: 1.0, returnEasedKcal: 0, bigHaulEasedKcal: 0, funnelShareEased: 0 },
    freshDaysMedian: 5, deathCauses: {}, national: false, table: false, win: false,
    waveReach: [1, 2], medianSurvival: 100 };
}
const fDep = path.join(FIX, 'dep'), fEas = path.join(FIX, 'eas'), fOut = path.join(FIX, 'out');
for (const d of [fDep, fEas, fOut]) { fs.mkdirSync(d, { recursive: true }); for (const f of fs.readdirSync(d)) fs.unlinkSync(path.join(d, f)); }
// Full 128-config design: 2 policies x 2 pd x 2 dg x 16 seeds = 128, 8 cells x 16.
for (const pol of ['leadfeast', 'belongfeast']) for (const pd of [0, 1]) for (const dg of [0, 1]) for (let s = 1; s <= 16; s++) {
  fs.writeFileSync(path.join(fDep, `depinteraction-b-pd${pd}-dg${dg}-${pol}-s${9000 + s}.json`), JSON.stringify(mkDep(pd, dg, pol, 9000 + s)));
  fs.writeFileSync(path.join(fEas, `easingchannels-b-pd${pd}dg${dg}-${pol}-s${9000 + s}.json`), JSON.stringify(mkEas(pd, dg, pol, 9000 + s)));
}
const env = Object.assign({}, process.env, { DEP_CORPUS_DIR: fDep, EAS_CORPUS_DIR: fEas, OUT_DIR: fOut });
execFileSync('node', [ANALYZER], { env, stdio: 'pipe' });
const ft = JSON.parse(fs.readFileSync(path.join(fOut, 'corrected-table.json'), 'utf8'));
ok(ft.verdict === 'DIAG-GO', 'fixture analyzer verdict DIAG-GO');
// expected per leg (16 seeds):
// dg0: hc PDd = 16*(600-1000) = -6400; claimed hc PDd = 0;
//      true away PDd = 16*(400-500) = -1600; blind away PDd = 16*((400+600)-(500+1000)) = -8000;
//      fs PDd = 16*(8000-10000) = -32000; tribute PDd = 0.
// dg1: hc PDd = 16*(300-500) = -3200; blind away PDd = 16*((400+300)-(500+500)) = -4800;
//      fs PDd = 16*(7000-9000) = -32000.
const EXP = {
  'leadfeast/dg0': { hc: -6400, awayC: -1600, awayBlind: -8000, fs: -32000 },
  'belongfeast/dg0': { hc: -6400, awayC: -1600, awayBlind: -8000, fs: -32000 },
  'leadfeast/dg1': { hc: -3200, awayC: -1600, awayBlind: -4800, fs: -32000 },
  'belongfeast/dg1': { hc: -3200, awayC: -1600, awayBlind: -4800, fs: -32000 },
};
for (const leg of Object.keys(EXP)) {
  const t = ft.legs[leg], e = EXP[leg];
  ok(t.corrected.scholarHomecoming === e.hc, `${leg} corrected homecoming PDd == ${e.hc} (got ${t.corrected.scholarHomecoming})`);
  ok(t.claimed.scholarHomecoming === 0, `${leg} claimed homecoming PDd == 0 (blindness reproduced)`);
  ok(t.corrected.awayReturn === e.awayC, `${leg} corrected true-away PDd == ${e.awayC} (got ${t.corrected.awayReturn})`);
  ok(t.claimed.awayReturn === e.awayBlind, `${leg} claimed blind away PDd == ${e.awayBlind} (homecoming-contaminated)`);
  ok(t.corrected.tributeDeposit === 0, `${leg} corrected tribute PDd == 0`);
  ok(t.corrected.funnelShare === e.fs, `${leg} corrected funnelShare PDd == ${e.fs}`);
}
for (const c of Object.keys(ft.cells).sort()) {
  const s = ft.cells[c].sum;
  const tot = CHS.reduce((a, ch) => a + s[ch], 0);
  ok(tot === ft.cells[c].total && tot > 0, `${c} partition conserved (total=${tot})`);
  ok(CHS.every(ch => s[ch] >= 0), `${c} all 6 channels >= 0`);
}
ok(Object.keys(ft.cells).length === 8, 'fixture: 8 cells in corrected table');

// ------------------------------------------------ (2) determinism on real corpora
console.log('== (2) corpus determinism: two runs byte-identical ==');
const OUT = path.join(ROOT, 'evidence', '2026-10-24', 'homecoming-tax-b');
const FILES = ['corrected-table.json', 'corrected-table.md', 'run-log.txt'];
const before = {};
for (const f of fs.readdirSync(DEP_DIR).sort()) before['dep/' + f] = sha(path.join(DEP_DIR, f));
for (const f of fs.readdirSync(EAS_DIR).sort()) before['eas/' + f] = sha(path.join(EAS_DIR, f));
execFileSync('node', [ANALYZER], { stdio: 'pipe' });
const run1 = FILES.map(f => sha(path.join(OUT, f)));
execFileSync('node', [ANALYZER], { stdio: 'pipe' });
const run2 = FILES.map(f => sha(path.join(OUT, f)));
FILES.forEach((f, i) => ok(run1[i] === run2[i], `determinism: ${f} byte-identical across runs`));

// ------------------------------------------------ (3) corpora untouched
console.log('== (3) corpora read-only ==');
const after = {};
for (const f of fs.readdirSync(DEP_DIR).sort()) after['dep/' + f] = sha(path.join(DEP_DIR, f));
for (const f of fs.readdirSync(EAS_DIR).sort()) after['eas/' + f] = sha(path.join(EAS_DIR, f));
ok(Object.keys(before).length === Object.keys(after).length &&
  Object.keys(before).every(k => before[k] === after[k]),
  `corpus files unchanged (${Object.keys(before).length} files hashed before/after)`);

// ------------------------------------------------ (4) 100% attributed, 0 unexplained
console.log('== (4) 100% configs attributed, 0 unexplained ==');
const rt = JSON.parse(fs.readFileSync(path.join(OUT, 'corrected-table.json'), 'utf8'));
ok(rt.verdict === 'DIAG-GO', 'real-corpus analyzer verdict DIAG-GO');
ok(rt.meta.configs === 128, 'meta: 128 configs');
ok(Object.keys(rt.cells).length === 8, '8 cells');
let cellsOk = 0, unexplained = 0;
for (const c of Object.keys(rt.cells)) {
  const s = rt.cells[c].sum;
  if (CHS.every(ch => typeof s[ch] === 'number' && s[ch] >= 0) && rt.cells[c].total > 0) cellsOk++;
  else unexplained++;
}
ok(cellsOk === 8 && unexplained === 0, `8/8 cells fully attributed (6 channels, >=0, total>0), 0 unexplained`);
let legsOk = 0;
for (const l of Object.keys(rt.legs)) {
  const t = rt.legs[l];
  if (CHS.every(ch => typeof t.corrected[ch] === 'number' && typeof t.claimed[ch] === 'number')) legsOk++;
}
ok(legsOk === 4, '4/4 legs have full claimed+corrected decompositions');
ok(rt.meta.blindness_verified === 'scholarHomecoming==0 on 128/128 depinteraction configs',
  'blindness verified string present');

console.log(fails === 0 ? '\nALL GREEN' : `\n${fails} FAILURES`);
process.exit(fails === 0 ? 0 : 1);
