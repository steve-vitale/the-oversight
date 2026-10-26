#!/usr/bin/env node
// scripts/test-transient2-a.js — proof test for sim-transient2-a.
// Reads ONLY the committed corpus under
// evidence/2026-10-26/perseed-sim-transient2-a/ (plus the sweep's
// own exported locateOvernightFall for unit cases). It does NOT
// re-run sims and does NOT judge the game — it checks the run's
// own pre-registered GO computation from the stored rows:
//   GO = (a genuine transient captured with BOTH rise day AND
//         overnight fall day snap-located) OR (a full-band
//         negative with snap coverage proven for all 8 seeds
//         plus the anchor table published).
// A genuine transient here means: class transient-ts-only or
// post-explained-transient AND overnightFallDay != null AND
// postNationalDay == tsNationalDay (rise inside daily, seat leg
// day) AND rankTrace shows pre>=2 never after the fall.
// Snap coverage for a negative means: every hunt row present,
// every row classified (not unclassified), every row's rankTrace
// covers its postNationalDay, and every ts-present row has its
// rise snap-located (postNationalDay != null).
// Exit 0 = GO computation holds on the stored corpus (either
// branch); exit 1 = corpus incomplete or neither branch holds.
// The verdict wording (captured vs proven negative) is printed
// for the evidence file; the test does not pick a branch.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const EVID = path.join(REPO, 'evidence', '2026-10-26', 'perseed-sim-transient2-a');
const { locateOvernightFall } = require('./test-transient2-sweep');

let pass = 0, fail = 0;
function check(name, ok, extra) {
  if (ok) { pass++; console.log(`  PASS ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${extra ? ' — ' + extra : ''}`); }
}
function readRow(pid, seed) {
  const p = path.join(EVID, `s${seed}-${pid}.json`);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}
function readJson(name) {
  const p = path.join(EVID, name);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

const SEEDS = [73901, 73902, 73903, 73904, 73905, 73906, 73907, 73908];
const summary = readJson('summary.json');
check('summary.json present and corpusOk', !!summary && summary.corpusOk === true);
const detA = readJson('detgate-anchor.json');
const detH = readJson('detgate-hunt.json');
check('anchor detgate present and MATCH', !!detA && detA.match === true, detA ? `match=${detA.match}` : 'missing');
check('hunt detgate present and MATCH', !!detH && detH.match === true, detH ? `match=${detH.match}` : 'missing');

const anchorRows = [], huntRows = [];
for (const s of SEEDS) {
  const a = readRow('transient2-anchor', s);
  const h = readRow('transient2-hunt', s);
  check(`anchor row s${s} present, days>0, classified`, !!a && a.days > 0 && !!a.pairing && a.pairing.cls !== 'unclassified');
  check(`hunt row s${s} present, days>0, classified`, !!h && h.days > 0 && !!h.pairing && h.pairing.cls !== 'unclassified');
  if (a) anchorRows.push(a);
  if (h) huntRows.push(h);
}
// NEWPAIRED rule spot checks on stored rows (coerce both sides
// to 0/1; the old strict number-vs-boolean check is never used).
for (const r of anchorRows.concat(huntRows)) {
  const expect = (r.nationalEver === (r.tsNationalDay != null ? 1 : 0));
  check(`s${r.seed}/${r.policy} newPaired recomputes`, r.pairing.newPaired === expect, `stored=${r.pairing.newPaired} recomputed=${expect}`);
  if (r.tsNationalDay != null) {
    check(`s${r.seed}/${r.policy} rise snap-located (postNatDay present)`, r.postNationalDay != null, `ts=${r.tsNationalDay} postNat=${r.postNationalDay}`);
  }
}
// locateOvernightFall unit cases (synthetic traces).
check('fall unit: rise D post2, D+1 pre1 => D+1',
  locateOvernightFall([{ day: 10, pre: 1, post: 2 }, { day: 11, pre: 1, post: 1 }], 10) === 11);
check('fall unit: re-appearance at pre snap => null',
  locateOvernightFall([{ day: 10, pre: 1, post: 2 }, { day: 11, pre: 2, post: 2 }], 10) === null);
check('fall unit: no rise day => null',
  locateOvernightFall([{ day: 10, pre: 1, post: 1 }], null) === null);
check('fall unit: rise but trace ends before any morning => null',
  locateOvernightFall([{ day: 10, pre: 1, post: 2 }], 10) === null);

// GO branches, computed from stored hunt rows (anchor rows are
// the comparison base, hunt rows are the transient search).
function isGenuineTransient(r) {
  if (!r || !r.pairing) return false;
  const clsOk = r.pairing.cls === 'transient-ts-only' || r.pairing.cls === 'post-explained-transient';
  if (!clsOk) return false;
  if (r.overnightFallDay == null) return false;
  if (r.postNationalDay == null || r.postNationalDay !== r.tsNationalDay) return false;
  // No pre>=2 after the fall day in the stored trace.
  const after = (r.rankTrace || []).filter(t => t.day > r.overnightFallDay && t.pre >= 2);
  return after.length === 0;
}
const captured = huntRows.filter(isGenuineTransient);
const anchorCaptured = anchorRows.filter(isGenuineTransient);
const snapCoverage = huntRows.length === 8 && huntRows.every(r =>
  r.rankTrace && r.rankTrace.length > 0 &&
  (r.tsNationalDay == null || r.postNationalDay != null) &&
  (r.tsNationalDay == null || (r.rankTrace.find(t => t.day === r.postNationalDay) || {}).post >= 2));
const provenNegative = huntRows.length === 8 && captured.length === 0 && snapCoverage;
const go = captured.length >= 1 || provenNegative;
check('GO branch: transient captured (rise+fall snap-located) OR proven full-band negative',
  go, `huntCaptured=${captured.length} anchorCaptured=${anchorCaptured.length} provenNegative=${provenNegative} snapCoverage=${snapCoverage}`);
if (captured.length) {
  console.log(`  CAPTURED (hunt): ${captured.map(r => `s${r.seed} rise=${r.postNationalDay} fall=${r.overnightFallDay} ts=${r.tsNationalDay} class=${r.pairing.cls}`).join('; ')}`);
}
if (anchorCaptured.length) {
  console.log(`  CAPTURED (anchor): ${anchorCaptured.map(r => `s${r.seed} rise=${r.postNationalDay} fall=${r.overnightFallDay} ts=${r.tsNationalDay} class=${r.pairing.cls}`).join('; ')}`);
}
if (anchorRows.length === 8) {
  const band = {
    won: anchorRows.reduce((t, r) => t + r.won, 0),
    natEver: anchorRows.reduce((t, r) => t + r.nationalEver, 0),
    natFinal: anchorRows.reduce((t, r) => t + r.nationalFinal, 0),
    table: anchorRows.reduce((t, r) => t + r.table, 0),
    entered: anchorRows.reduce((t, r) => t + r.entered, 0),
    wave4: anchorRows.filter(r => (r.waveReach || 1) >= 4).length,
    wave5: anchorRows.filter(r => (r.waveReach || 1) >= 5).length,
    arc4: anchorRows.filter(r => (r.maxArc || 1) >= 4).length,
    deaths: anchorRows.reduce((t, r) => t + r.deathTotal, 0),
    starv: anchorRows.reduce((t, r) => t + r.starvationDeaths, 0),
  };
  console.log(`  ANCHOR BAND (published): won=${band.won}/8 natEver=${band.natEver} natFinal=${band.natFinal} table=${band.table} entered=${band.entered} wave4=${band.wave4} wave5=${band.wave5} arc4=${band.arc4} deaths=${band.deaths} starv=${band.starv}`);
  for (const r of anchorRows) {
    console.log(`    s${r.seed}: days=${r.days} won=${r.won} wave=${r.waveReach} arc=${r.maxArc} final=${r.finalRank} max=${r.maxRank} natEver=${r.nationalEver} natFinal=${r.nationalFinal} table=${r.table} entered=${r.entered} ts=${r.tsNationalDay} preNat=${r.preNationalDay} postNat=${r.postNationalDay} fall=${r.overnightFallDay} class=${r.pairing.cls} deaths=${r.deathTotal} starv=${r.starvationDeaths}`);
  }
}
console.log(`\n  ${pass} passed / ${fail} failed`);
process.exit(fail ? 1 : 0);
