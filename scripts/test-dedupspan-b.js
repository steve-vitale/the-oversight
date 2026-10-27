#!/usr/bin/env node
// test-dedupspan-b.js — proof for sim-dedupspan-b (prereg:
// evidence/2026-10-27/sim-dedupspan-b-prereg.md). Judges ONLY the
// pre-registered GO1-GO5 thresholds. Exit 0 = GO, exit 1 = NO-GO.
// No jest. No src/js touched. No existing analyzer modified.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const read = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const { applySpanDedup } = require('./dedupspan-ledger-b.js');
const analyzer = require('./analyze-raidcallers-b.js');

let pass = 0, fail = 0;
const fails = [];
function check(name, ok, extra) {
  if (ok) { pass++; } else { fail++; fails.push(name + (extra ? ' :: ' + extra : '')); }
  console.log((ok ? 'PASS ' : 'FAIL ') + name + (extra && !ok ? ' :: ' + extra : ''));
}
function deepEq(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

// ---- Fidelity inputs (from cultnest, re-asserted, not re-judged) ----
const cult = read('evidence/2026-10-27/sim-9954cultnest-b-replay/9954cultnest-b-belongseek-nofeast-s9954.json');
const raid = read('evidence/2026-10-27/sim-raidcallers-b-corpus/raidcallers-b-belongseek-nofeast-s9954.json');
const d124 = (cult.directRecords || []).find((r) => r.seq === 124);
check('fidelity direct124 identity', !!d124 && d124.path === 'green_whisper.cultivate' && d124.day === 36 && d124.totalKcal === 3820,
  d124 ? JSON.stringify(d124) : 'missing');
check('fidelity direct124 items exact', !!d124 && deepEq(d124.items, [
  { name: 'Foraged food', kcalEach: 200, units: 12, kcal: 2400, spoilDay: 34, granaryDays: null, foodState: null },
  { name: 'Fish catch', kcalEach: 20, units: 1, kcal: 20, spoilDay: 36, granaryDays: 3, foodState: null },
  { name: 'Foraged food', kcalEach: 200, units: 7, kcal: 1400, spoilDay: 36, granaryDays: null, foodState: null },
]));
const meal = (seq) => (cult.mealDrawRecords || []).find((r) => r.seq === seq && r.kind === 'pantryDraw');
check('fidelity meal466/474 present', !!meal(466) && !!meal(474));
check('fidelity directRecords count 262', (cult.directRecords || []).length === 262,
  'len=' + (cult.directRecords || []).length);
check('fidelity nestEvents present', Array.isArray(cult.nestEvents) && cult.nestEvents.length === 464,
  'len=' + (cult.nestEvents || []).length);

// ---- Run the rule on the 9954 corpus (cultnest faithful replay) ----
const out = applySpanDedup(cult);
console.log('RULE spans=' + out.spans + ' creating=' + out.spansCreatingRecord + ' drawPairs=' + out.drawPairs +
  ' spanInternal=' + out.spanInternalDraws + ' unmatchedLinks=' + out.unmatchedDrawLinks +
  ' ambiguous=' + out.ambiguousSpans.length + ' excluded=' + out.totalExcludedKcal +
  ' excludedGeneric=' + out.totalExcludedGenericKcal + ' changed=' + out.changedRecords);
check('rule spans creating exactly 1 record', out.spansCreatingRecord === 1, 'creating=' + out.spansCreatingRecord);
check('rule all 206 draws linked to meal records', out.unmatchedDrawLinks === 0, 'unmatched=' + out.unmatchedDrawLinks);
check('rule no ambiguous spans', out.ambiguousSpans.length === 0, JSON.stringify(out.ambiguousSpans));
check('rule exactly 2 span-internal draws', out.spanInternalDraws === 2, 'n=' + out.spanInternalDraws);

// ---- GO1: seq 124 ----
const p124 = out.perDirect.find((p) => p.seq === 124);
check('GO1 seq124 excluded generic 3800', !!p124 && p124.excludedGenericKcal === 3800,
  p124 ? 'excludedGeneric=' + p124.excludedGenericKcal : 'missing');
check('GO1 seq124 summed generic 0', !!p124 && p124.summedGenericKcal === 0,
  p124 ? 'summedGeneric=' + p124.summedGenericKcal : 'missing');
check('GO1 seq124 retained + flagged + span identity', !!p124 && p124.flagged && p124.span &&
  p124.span.ability === 'green_whisper' && p124.span.action === 'cultivate' &&
  p124.span.enterEvt === 241 && p124.span.exitEvt === 246,
  p124 ? JSON.stringify(p124.span) : 'missing');
check('GO1 seq124 total excluded 3820 (incl Fish 20)', !!p124 && p124.excludedKcal === 3820,
  p124 ? 'excluded=' + p124.excludedKcal : 'missing');
check('GO1 seq124 summed total 0', !!p124 && p124.summedTotalKcal === 0,
  p124 ? 'summedTotal=' + p124.summedTotalKcal : 'missing');

// ---- GO2: no other record changed ----
const others = out.perDirect.filter((p) => p.seq !== 124);
check('GO2 only 1 changed record', out.changedRecords === 1, 'changed=' + out.changedRecords);
check('GO2 all other records unchanged', others.every((p) => p.excludedKcal === 0 &&
  p.summedTotalKcal === p.originalTotalKcal && p.summedGenericKcal === p.originalGenericKcal && !p.flagged),
  'bad=' + JSON.stringify(others.filter((p) => p.excludedKcal !== 0).map((p) => p.seq)));
check('GO2 exclusions all belong to seq124', out.exclusions.every((e) => e.directSeq === 124),
  'seqs=' + [...new Set(out.exclusions.map((e) => e.directSeq))].join(','));
// Exclusions are per ITEM, not per draw: meal 474 contributes 3 items,
// so its seq appears 3 times. The check is on the UNIQUE draw set.
check('GO2 exclusion draws are meal 466 + 474', deepEq([...new Set(out.exclusions.map((e) => e.mealSeq))].sort((a, b) => a - b), [466, 474]),
  'mealSeqs=' + JSON.stringify(out.exclusions.map((e) => e.mealSeq)));
check('GO2 exclusion item count 4 (466 x1 + 474 x3)', out.exclusions.length === 4,
  'n=' + out.exclusions.length);

// ---- GO3: residual arithmetic ----
const CORRECT_ALIGNMENT_INPUT = 3800; // perstack closed figure, input not re-judged
const dedupedCorrect = CORRECT_ALIGNMENT_INPUT - out.totalExcludedGenericKcal;
check('GO3 deduped correct-alignment generic residual 0', dedupedCorrect === 0,
  'dedupedCorrect=' + dedupedCorrect);
const fam = analyzer.perSeed(cult).fams.get('Foraged food');
console.log('ANALYZER generic old: newDraws=' + (fam && fam.newDraws) + ' cBResidual(boundary)=' + (fam && fam.cBResidual));
check('GO3 analyzer old boundary residual 3700 (consistency)', !!fam && fam.cBResidual === 3700,
  fam ? 'cBResidual=' + fam.cBResidual : 'no fam');
const dedupedBoundary = fam ? fam.cBResidual - out.totalExcludedGenericKcal : null;
check('GO3 boundary shifts by exactly -excludedGeneric', !!fam && dedupedBoundary === fam.cBResidual - out.totalExcludedGenericKcal,
  'dedupedBoundary=' + dedupedBoundary);
check('GO3 deduped boundary remainder -100 (proven day-100 timing only)', dedupedBoundary === -100,
  'dedupedBoundary=' + dedupedBoundary);
check('GO3 deduped generic newDraws = old - 3800', !!fam && fam.newDraws - out.totalExcludedGenericKcal === fam.newDraws - 3800,
  'old=' + (fam && fam.newDraws));

// ---- GO4: no-span-data guard on the bare raidcallers corpus ----
const bare = applySpanDedup(raid);
check('GO4 bare corpus has no span data', bare.hasSpanData === false, 'hasSpanData=' + bare.hasSpanData);
check('GO4 bare corpus 0 exclusions', bare.totalExcludedKcal === 0 && bare.exclusions.length === 0,
  'excluded=' + bare.totalExcludedKcal);
check('GO4 bare corpus 0 changed records', bare.changedRecords === 0, 'changed=' + bare.changedRecords);
check('GO4 bare corpus sums identical', bare.perDirect.every((p, i) =>
  p.summedTotalKcal === p.originalTotalKcal && p.summedGenericKcal === p.originalGenericKcal));

// ---- GO5: generality on synthetic payloads ----
function synth(directRecords, nestEvents, mealDrawRecords) {
  return applySpanDedup({ directRecords, nestEvents, mealDrawRecords });
}
const rec = (seq, items, total) => ({ seq, path: 'test.ability', day: 10, totalKcal: total, items });
const it = (name, kcalEach, units, spoilDay) => ({ name, kcalEach, units, spoilDay, foodState: null });
const drawRec = (seq, want, taken, items) => ({ kind: 'pantryDraw', seq, day: 10, want, taken, items });
// (a) partial match: draw takes 5u of 12u; remainder 7u stays counted.
{
  const o = synth([rec(1, [it('Foraged food', 200, 12, 34)], 2400)], [
    { evt: 1, kind: 'spanEnter', ability: 'a', action: 'b', depth: 0, directBefore: 0 },
    { evt: 2, kind: 'drawEnter', day: 10, want: 1000 },
    { evt: 3, kind: 'drawExit', day: 10, want: 1000, taken: 1000, items: [it('Foraged food', 200, 5, 34)] },
    { evt: 4, kind: 'spanExit', ability: 'a', action: 'b', depth: 0, directBefore: 0, directAfter: 1 },
  ], [drawRec(1, 1000, 1000, [it('Foraged food', 200, 5, 34)])]);
  check('GO5a partial match leaves remainder counted', o.perDirect[0].excludedGenericKcal === 1000 && o.perDirect[0].summedGenericKcal === 1400,
    JSON.stringify(o.perDirect[0]));
}
// (b) span creates no record: nothing excluded.
{
  const o = synth([rec(1, [it('Foraged food', 200, 12, 34)], 2400)], [
    { evt: 1, kind: 'spanEnter', ability: 'a', action: 'b', depth: 0, directBefore: 1 },
    { evt: 2, kind: 'drawEnter', day: 10, want: 1000 },
    { evt: 3, kind: 'drawExit', day: 10, want: 1000, taken: 1000, items: [it('Foraged food', 200, 5, 34)] },
    { evt: 4, kind: 'spanExit', ability: 'a', action: 'b', depth: 0, directBefore: 1, directAfter: 1 },
  ], [drawRec(1, 1000, 1000, [it('Foraged food', 200, 5, 34)])]);
  check('GO5b span with no created record excludes nothing', o.totalExcludedKcal === 0 && o.changedRecords === 0,
    'excluded=' + o.totalExcludedKcal);
}
// (c) draw outside any span: nothing excluded.
{
  const o = synth([rec(1, [it('Foraged food', 200, 12, 34)], 2400)], [
    { evt: 1, kind: 'drawEnter', day: 10, want: 1000 },
    { evt: 2, kind: 'drawExit', day: 10, want: 1000, taken: 1000, items: [it('Foraged food', 200, 5, 34)] },
    { evt: 3, kind: 'spanEnter', ability: 'a', action: 'b', depth: 0, directBefore: 0 },
    { evt: 4, kind: 'spanExit', ability: 'a', action: 'b', depth: 0, directBefore: 0, directAfter: 1 },
  ], [drawRec(1, 1000, 1000, [it('Foraged food', 200, 5, 34)])]);
  check('GO5c draw outside span excludes nothing', o.totalExcludedKcal === 0 && o.changedRecords === 0,
    'excluded=' + o.totalExcludedKcal);
}
// (d) span-internal draw matching no record item: nothing excluded.
{
  const o = synth([rec(1, [it('Foraged food', 200, 12, 34)], 2400)], [
    { evt: 1, kind: 'spanEnter', ability: 'a', action: 'b', depth: 0, directBefore: 0 },
    { evt: 2, kind: 'drawEnter', day: 10, want: 999 },
    { evt: 3, kind: 'drawExit', day: 10, want: 999, taken: 999, items: [it('Peanuts', 170, 1, 61)] },
    { evt: 4, kind: 'spanExit', ability: 'a', action: 'b', depth: 0, directBefore: 0, directAfter: 1 },
  ], [drawRec(1, 999, 999, [it('Peanuts', 170, 1, 61)])]);
  check('GO5d non-matching items exclude nothing', o.totalExcludedKcal === 0 && o.perDirect[0].summedGenericKcal === 2400,
    'excluded=' + o.totalExcludedKcal);
}
// (e) two independent spans exclude independently.
{
  const o = synth([
    rec(1, [it('Foraged food', 200, 10, 34)], 2000),
    rec(2, [it('Foraged food', 200, 10, 35)], 2000),
  ], [
    { evt: 1, kind: 'spanEnter', ability: 'a', action: 'b', depth: 0, directBefore: 0 },
    { evt: 2, kind: 'drawEnter', day: 10, want: 1000 },
    { evt: 3, kind: 'drawExit', day: 10, want: 1000, taken: 1000, items: [it('Foraged food', 200, 5, 34)] },
    { evt: 4, kind: 'spanExit', ability: 'a', action: 'b', depth: 0, directBefore: 0, directAfter: 1 },
    { evt: 5, kind: 'spanEnter', ability: 'c', action: 'd', depth: 0, directBefore: 1 },
    { evt: 6, kind: 'drawEnter', day: 10, want: 1000 },
    { evt: 7, kind: 'drawExit', day: 10, want: 1000, taken: 1000, items: [it('Foraged food', 200, 5, 35)] },
    { evt: 8, kind: 'spanExit', ability: 'c', action: 'd', depth: 0, directBefore: 1, directAfter: 2 },
  ], [
    drawRec(1, 1000, 1000, [it('Foraged food', 200, 5, 34)]),
    drawRec(2, 1000, 1000, [it('Foraged food', 200, 5, 35)]),
  ]);
  check('GO5e two spans exclude independently', o.perDirect[0].summedGenericKcal === 1000 &&
    o.perDirect[1].summedGenericKcal === 1000 && o.totalExcludedGenericKcal === 2000,
    JSON.stringify(o.perDirect.map((p) => p.summedGenericKcal)));
}

console.log('\n' + pass + '/' + (pass + fail) + ' checks PASS' + (fail ? ' — FAILURES: ' + fails.join(' | ') : ''));
console.log('VERDICT: ' + (fail === 0 ? 'GO' : 'NO-GO'));
process.exit(fail === 0 ? 0 : 1);
