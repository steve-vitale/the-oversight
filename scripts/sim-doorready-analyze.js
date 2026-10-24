#!/usr/bin/env node
// sim-doorready-analyze.js — matched before/after analysis for sim-doorready.
// Reads evidence/2026-10-24/perseed-doorready/s<seed>-<base>.json (16 pilot
// configs), pairs by seed, and judges the PRE-REGISTERED GO BAR:
//   (1) >= 2 matched door-open configs (same seed, both arms open wave 5), AND
//   (2) armed mean post-door survival >= baseline mean post-door survival + 20d
// Post-door survival = endDay - w5Day, where endDay = gameDays (180 cap for
// survived runs = right-censored; flagged as such). Means are over MATCHED
// seeds only. A miss is NO-GO, never re-scored.
// Also reports: wall numbers per arm (national/table/wins, wave 4/5 unlocks,
// median survival), door-timing shift (armed w5Day - baseline w5Day),
// feast/deferral counters, death-cause shares.
// Usage: node scripts/sim-doorready-analyze.js [EVIDDIR] [--json-out path]
// Exits 0 on GO, 2 on NO-GO (verdict still printed + written), 1 on missing data.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const EVID = process.argv[2] || path.join(REPO, 'evidence', '2026-10-24', 'perseed-doorready');
const SEEDS = [71901, 71902, 71903, 71904, 71905, 71906, 71907, 71908];
const BASES = ['competent', 'doorready'];

function median(xs) {
  if (!xs.length) return null;
  const s = xs.slice().sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
function mean(xs) {
  if (!xs.length) return null;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}
function load(seed, base) {
  const fn = path.join(EVID, `s${seed}-${base}.json`);
  if (!fs.existsSync(fn)) return null;
  try { return JSON.parse(fs.readFileSync(fn, 'utf8')); } catch (e) { return null; }
}

const missing = [];
const rows = [];
for (const s of SEEDS) {
  const b = load(s, 'competent');
  const a = load(s, 'doorready');
  if (!b) missing.push(`s${s}-competent.json`);
  if (!a) missing.push(`s${s}-doorready.json`);
  if (!b || !a) continue;
  // endDay = result.days (the run's day count; gameDays runs one past the
  // cap on survived runs — 181 vs the 180 cap — so days is the convention
  // matching postunlock2-b's "survived d180" / "lost d141" reporting).
  const endDay = (r) => (r.days | 0) || (r.gameDays | 0);
  const postDoor = (r) => (r.unlock.w5Day == null ? null : endDay(r) - (r.unlock.w5Day | 0));
  rows.push({
    seed: s,
    base: { w4: b.unlock.w4Day, w5: b.unlock.w5Day, end: endDay(b), endReason: b.endReason, postDoor: postDoor(b), national: b.national, table: b.table, won: b.won, maxWave: b.maxWave, feasts: b.doorready.feastsFinal },
    armed: { w4: a.unlock.w4Day, w5: a.unlock.w5Day, end: endDay(a), endReason: a.endReason, postDoor: postDoor(a), national: a.national, table: a.table, won: a.won, maxWave: a.maxWave, feasts: a.doorready.feastsFinal, deferStart: a.doorready.deferStartDay, release: a.doorready.releaseDay, nSnapshots: a.doorready.nSnapshots },
    matchedDoor: b.unlock.w5Day != null && a.unlock.w5Day != null,
    doorShift: (b.unlock.w5Day != null && a.unlock.w5Day != null) ? ((a.unlock.w5Day | 0) - (b.unlock.w5Day | 0)) : null,
  });
}
if (missing.length) {
  console.error('ANALYZE STOP: missing per-seed files: ' + missing.join(', '));
  process.exit(1);
}
const matched = rows.filter(r => r.matchedDoor);
const basePost = matched.map(r => r.base.postDoor);
const armedPost = matched.map(r => r.armed.postDoor);
const baseMean = mean(basePost), armedMean = mean(armedPost);
const goDoors = matched.length >= 2;
const goSurv = baseMean != null && armedMean != null && armedMean >= baseMean + 20;
const verdict = (goDoors && goSurv) ? 'GO' : 'NO-GO';

function causeShares(base) {
  const tot = {};
  let n = 0;
  for (const s of SEEDS) {
    const d = load(s, base);
    for (const [k, v] of Object.entries(d.deaths || {})) { tot[k] = (tot[k] || 0) + v; n += v; }
  }
  return Object.entries(tot).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, v]) => ({ cause: k, n: v, share: n ? +(v / n).toFixed(3) : 0 }));
}
const out = {
  verdict, goDoors, goSurv, matchedDoors: matched.length,
  baseMeanPostDoor: baseMean, armedMeanPostDoor: armedMean,
  deltaPostDoor: (baseMean != null && armedMean != null) ? +(armedMean - baseMean).toFixed(1) : null,
  bar: 'matched>=2 AND armedMean>=baseMean+20',
  doorShiftDays: matched.map(r => ({ seed: r.seed, shift: r.doorShift })),
  rows, causeShares: { baseline: causeShares('competent'), armed: causeShares('doorready') },
};
out.wall = {
  baseline: {
    national: rows.reduce((a, r) => a + r.base.national, 0), table: rows.reduce((a, r) => a + r.base.table, 0),
    wins: rows.reduce((a, r) => a + r.base.won, 0),
    wave4: rows.filter(r => r.base.w4 != null).length, wave5: rows.filter(r => r.base.w5 != null).length,
    medianSurvival: median(rows.map(r => r.base.end)), maxSurvival: Math.max(...rows.map(r => r.base.end)),
  },
  armed: {
    national: rows.reduce((a, r) => a + r.armed.national, 0), table: rows.reduce((a, r) => a + r.armed.table, 0),
    wins: rows.reduce((a, r) => a + r.armed.won, 0),
    wave4: rows.filter(r => r.armed.w4 != null).length, wave5: rows.filter(r => r.armed.w5 != null).length,
    medianSurvival: median(rows.map(r => r.armed.end)), maxSurvival: Math.max(...rows.map(r => r.armed.end)),
  },
};
console.log(`VERDICT: ${verdict} (matched doors ${matched.length}/8; base mean post-door ${baseMean} vs armed ${armedMean}; delta ${out.deltaPostDoor})`);
console.log('seed | base w4/w5/end/post | armed w4/w5/end/post | shift | matched');
for (const r of rows) {
  const f = (x) => (x == null ? '--' : x);
  console.log(`${r.seed} | ${f(r.base.w4)}/${f(r.base.w5)}/${r.base.end}/${f(r.base.postDoor)} | ${f(r.armed.w4)}/${f(r.armed.w5)}/${r.armed.end}/${f(r.armed.postDoor)} | ${f(r.doorShift)} | ${r.matchedDoor ? 'YES' : 'no'}`);
}
console.log('WALL baseline: ' + JSON.stringify(out.wall.baseline));
console.log('WALL armed: ' + JSON.stringify(out.wall.armed));
console.log('CAUSES baseline: ' + JSON.stringify(out.causeShares.baseline));
console.log('CAUSES armed: ' + JSON.stringify(out.causeShares.armed));
const jsonOut = process.argv.includes('--json-out') ? process.argv[process.argv.indexOf('--json-out') + 1] : path.join(EVID, 'sim-doorready-analysis.json');
try { fs.writeFileSync(jsonOut, JSON.stringify(out, null, 1) + '\n'); console.log('WROTE ' + jsonOut); } catch (e) { console.log('JSON-OUT-FAILED ' + String((e && e.message) || e)); }
process.exit(verdict === 'GO' ? 0 : 2);
