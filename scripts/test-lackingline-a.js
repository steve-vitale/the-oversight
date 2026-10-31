#!/usr/bin/env node
// test-lackingline-a.js — proof for sim-lackingline-a (DIAG only).
// Unit cases for the raw-gate classifier (all eight gate
// combinations + nulls + kcal fallback), lackingLine template
// agreement (narration == template for its skip on every
// censused evening), and corpus checks recomputed from the
// judged corpora (strand sets, combo counts, skip agreement,
// warmth ledger, warmth-connection count, determinism).
// Reads only; writes nothing. Exits non-zero on any failure.
//
// Usage: node scripts/test-lackingline-a.js [corpusGuard]
//   [corpusOn] [corpusGuardVariant] [corpusOnVariant]
//   [determinismDir] — dirs default to this arm's evidence
//   corpora; missing optional dirs are skipped, never passed.
'use strict';
const fs = require('fs');
const path = require('path');
const { classifyEvening, analyzeCorpus } = require('./analyze-lackingline-a');
const { lackingLine } = require('./policies/woodcarry');

let pass = 0, fail = 0;
const failures = [];
function check(name, cond, extra) {
  if (cond) { pass++; }
  else { fail++; failures.push(name + (extra !== undefined ? ' :: ' + JSON.stringify(extra) : '')); }
}
function mkRow(day, cls, skip, narr, warmth) {
  return {
    loopDay: day, eveningSayTail: narr ? [narr] : [],
    woodcarry: { bucket: 'creek', rescued: false, classification: cls, bridge: { skip }, narration: narr },
    warmth: warmth || null,
  };
}

// ---- Unit: all eight gate combinations ----
const combos = [
  // [logs, kcal, ticks, expectedFailing, expectedSkip]
  [4, 60, 96, [], 'attempt'], [3, 60, 96, ['wood'], 'wood-short'],
  [4, 0, 96, ['kcal'], 'kcal-short'], [4, 60, 47, ['ticks'], 'ticks-short'],
  [3, 0, 96, ['wood', 'kcal'], 'wood-short'], [3, 60, 47, ['wood', 'ticks'], 'wood-short'],
  [4, 0, 47, ['kcal', 'ticks'], 'kcal-short'], [0, 0, 47, ['wood', 'kcal', 'ticks'], 'wood-short'],
];
combos.forEach(([logs, kcal, ticks, failing, skip], i) => {
  const c = classifyEvening(mkRow(7, { woodPlayer: logs, kcalLive: kcal, ticksToDayEnd: ticks }, skip, 'X'));
  check('combo ' + i + ' failing', JSON.stringify(c.failing) === JSON.stringify(failing), c);
  check('combo ' + i + ' combo-label', c.combo === (failing.length === 1 ? failing[0] + '-only' : (failing.length ? failing.join('+') : 'none')), c);
  if (failing.length) check('combo ' + i + ' skip-agrees-first', c.skipAgreesFirstFailing === true, c);
  check('combo ' + i + ' hidden', JSON.stringify(c.hidden) === JSON.stringify(failing.slice(1)), c);
});
// kcal fallback + nulls.
{
  const c = classifyEvening(mkRow(7, { woodPlayer: 4, kcalLive: null, kcal: 0, ticksToDayEnd: 96 }, 'kcal-short', 'X'));
  check('kcal-fallback used', c.kcalFallbackUsed === true && c.kcal === 0 && JSON.stringify(c.failing) === JSON.stringify(['kcal']), c);
  const n = classifyEvening(mkRow(7, { woodPlayer: null, kcalLive: 0, ticksToDayEnd: 96 }, 'wood-short', 'X'));
  check('null-wood unclassified', n.unclassified === true, n);
  const nc = classifyEvening({ loopDay: 7, woodcarry: { bucket: 'creek', rescued: false, classification: null, bridge: {}, narration: null } });
  check('null-classification unclassified', nc.unclassified === true, nc);
  const rescued = classifyEvening(mkRow(7, { woodPlayer: 0, kcalLive: 0, ticksToDayEnd: 0 }, 'wood-short', 'X'));
  rescued && null;
  const r2 = { loopDay: 7, woodcarry: { bucket: 'creek', rescued: true, classification: { woodPlayer: 0, kcalLive: 0, ticksToDayEnd: 0 }, bridge: { skip: null }, narration: null } };
  check('rescued evening excluded', classifyEvening(r2) === null);
}
// lackingLine templates contain no spend language (so the
// strict warmth-connection test cannot false-positive on a
// template line).
for (const skip of ['wood-short', 'kcal-short', 'ticks-short']) {
  const line = lackingLine(skip, { woodPlayer: 2, kcal: 0, ticksToDayEnd: 93 });
  check('template ' + skip + ' has no spend language', !/fire|warmth|burn|spent|spend/i.test(line), line);
  check('template ' + skip + ' starts No bridge', line.indexOf('No bridge tonight') === 0, line);
}

// ---- Corpus checks ----
const HERE = path.join(__dirname, '..');
const argv = process.argv.slice(2);
const guardDir = argv[0] || path.join(HERE, 'evidence', '2026-10-31', 'sim-lackingline-a-corpus-guard');
const onDir = argv[1] || path.join(HERE, 'evidence', '2026-10-31', 'sim-lackingline-a-corpus-on');
const gvDir = argv[2] || null;
const ovDir = argv[3] || null;
const detDir = argv[4] || null;

function checkCorpus(dir, leg, expect) {
  if (!fs.existsSync(dir)) { check(leg + ' corpus exists', false, dir); return null; }
  const a = analyzeCorpus(dir, leg);
  check(leg + ' files', a.files === 10, a.files);
  check(leg + ' strand seeds', JSON.stringify(a.strandSeeds) === JSON.stringify(expect.strandSeeds), a.strandSeeds);
  check(leg + ' non-strand still', a.nonStrandStill.length === 0, a.nonStrandStill);
  check(leg + ' unclassified', a.unclassified.length === 0, a.unclassified);
  check(leg + ' skip mismatches', a.skipAgreementMismatches.length === 0, a.skipAgreementMismatches);
  check(leg + ' anomalies', a.anomalies.length === 0, a.anomalies);
  check(leg + ' evenings', a.evenings.length === expect.evenings, a.evenings.length);
  check(leg + ' combo counts', JSON.stringify(a.comboCounts) === JSON.stringify(expect.comboCounts), a.comboCounts);
  for (const s of Object.values(a.seeds)) {
    check(leg + ' seed evenings 30', s.evenings === 30, s);
    check(leg + ' seed errs 0', s.errs === 0 && s.wwErrs === 0, s);
    check(leg + ' seed survived 30', s.daysAlive === 30, s);
  }
  // Every censused narration equals its lackingLine template.
  for (const e of a.evenings) {
    const want = lackingLine(e.skip, { woodPlayer: e.logs, kcal: e.kcal, ticksToDayEnd: e.ticks });
    if (e.narration !== want) { check(leg + ' narration==template day ' + e.loopDay, false, { seed: e.seed, got: e.narration, want }); }
  }
  check(leg + ' all narrations == templates', a.evenings.every((e) =>
    e.narration === lackingLine(e.skip, { woodPlayer: e.logs, kcal: e.kcal, ticksToDayEnd: e.ticks })));
  return a;
}

const guard = checkCorpus(guardDir, 'guard', {
  strandSeeds: [15215], evenings: 3,
  comboCounts: { 'ticks-only': 1, 'kcal-only': 2 },
});
const on = checkCorpus(onDir, 'on', {
  strandSeeds: [15215], evenings: 10,
  comboCounts: { 'ticks-only': 1, 'kcal-only': 2, 'wood-only': 2, 'wood+kcal': 5 },
});
if (guard && on) {
  const pooled = {};
  for (const a of [guard, on]) for (const [k, v] of Object.entries(a.comboCounts)) pooled[k] = (pooled[k] || 0) + v;
  check('pooled combo counts', JSON.stringify(pooled) === JSON.stringify({ 'ticks-only': 2, 'kcal-only': 4, 'wood-only': 2, 'wood+kcal': 5 }), pooled);
  check('primary multi-gate evenings', guard.evenings.length + on.evenings.length === 13);
  const multi = guard.evenings.concat(on.evenings).filter((e) => e.failing.length > 1);
  check('primary multi-gate count 5', multi.length === 5, multi.length);
  check('primary hidden-gate evenings 5', multi.every((e) => e.hidden.length >= 1));
  // Warmth connection, primary ON leg.
  check('ON spend nights 4', on.spendNights.length === 4, on.spendNights);
  check('ON spend nights are 9,11,12,13', JSON.stringify(on.spendNights.map((s) => s.loopDay)) === JSON.stringify([9, 11, 12, 13]), on.spendNights);
  check('ON warmth following 4', on.warmthConnection.following === 4, on.warmthConnection);
  check('ON warmth connected 0', on.warmthConnection.connected === 0, on.warmthConnection);
  check('guard warmth following 0', guard.warmthConnection.following === 0, guard.warmthConnection);
  check('guard spend nights 0', guard.spendNights.length === 0, guard.spendNights);
}
// Variant legs (optional): reported separately, never pooled.
let gv = null, ov = null;
if (gvDir && fs.existsSync(gvDir)) gv = analyzeCorpus(gvDir, 'guard-variant');
if (ovDir && fs.existsSync(ovDir)) ov = analyzeCorpus(ovDir, 'on-variant');
if (gv) {
  check('guard-variant strand seeds', JSON.stringify(gv.strandSeeds) === JSON.stringify([15215]), gv.strandSeeds);
  check('guard-variant unclassified 0', gv.unclassified.length === 0, gv.unclassified);
  check('guard-variant anomalies 0', gv.anomalies.length === 0, gv.anomalies);
  check('guard-variant skip mismatches 0', gv.skipAgreementMismatches.length === 0, gv.skipAgreementMismatches);
}
if (ov) {
  check('on-variant strand seeds', JSON.stringify(ov.strandSeeds) === JSON.stringify([15215]), ov.strandSeeds);
  check('on-variant unclassified 0', ov.unclassified.length === 0, ov.unclassified);
  check('on-variant anomalies 0', ov.anomalies.length === 0, ov.anomalies);
  check('on-variant skip mismatches 0', ov.skipAgreementMismatches.length === 0, ov.skipAgreementMismatches);
  const ticksPlus = ov.evenings.filter((e) => e.failing.indexOf('ticks') !== -1 && e.failing.length > 1);
  check('on-variant ticks-plus evenings >= 1', ticksPlus.length >= 1, ticksPlus.length);
  check('on-variant ticks-plus never named ticks', ticksPlus.every((e) => e.named !== 'ticks'), ticksPlus);
}
// Determinism: re-run dir file must be byte-identical to judged ON 15215 file.
if (detDir && fs.existsSync(detDir)) {
  const detFiles = fs.readdirSync(detDir).filter((f) => f.endsWith('.json'));
  const judged = fs.readFileSync(path.join(onDir, 'kcalshort-b-nighttravel-s15215.json'));
  let matched = 0;
  for (const f of detFiles) {
    if (fs.readFileSync(path.join(detDir, f)).equals(judged)) matched++;
  }
  check('determinism 15215 ON byte-identical', matched === 1, { detFiles, matched });
}

console.log('lackingline-a proof: ' + pass + ' pass, ' + fail + ' fail');
if (failures.length) { for (const f of failures) console.log('FAIL: ' + f); process.exit(1); }
