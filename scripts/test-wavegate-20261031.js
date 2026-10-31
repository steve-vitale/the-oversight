#!/usr/bin/env node
// test-wavegate-20261031.js — sim-wavegate-a proof test.
//
// Part 1: SYNTHETIC fixtures only; no band seeds appear there, so
// proof runs are not judged sims. Part 2 (corpus leg, appended at
// resume): READS the judged corpus (read-only, creates no sims)
// and re-derives the prereg's corpus verdict gates from it:
// all 19 prereg seeds present and non-empty, prereg-base anchored,
// derived final unlocked wave == engine on every seed, recorder
// errors 0, decomposition complete on every national seed. The
// det-gate (recorder-on vs recorder-off trajectory neutrality)
// is proven by the det run recorded in the evidence file, not by
// this test — re-running 4 sims inside a proof test would itself
// be new judged-adjacent compute and is not done here.
//
// Covers: deriveWavegate (gated-total mirror incl. holds, cap,
// defer4/defer5, ratchet, w3 rung, w4-faced); classifyBlocker (all
// branches, waves 4 and 5); milestones first-day + ordering;
// fractions incl. 0/0 -> null; layer-off delegation (WAVEGATE
// unset delegates byte-identically); corpus verdict gates.
'use strict';
const assert = require('assert');
const WG = require('./policies/wavegate-diag');
const AN = require('./wavegate-analyze-20261031');

let n = 0;
function check(name, fn) { fn(); n++; console.log('ok - ' + name); }

// --- deriveWavegate ---
check('derive: below-bar, no holds', () => {
  const d = WG.deriveWavegate({ raw: 60, capped: 60, peak: 0, rd4ready: false, rd5ready: false, t4: 100, t5: 200, day: 30, d2: 8, dN: 25, bar1: 5, bar2: 4, p1: 5, p2: 4, w4faced: false });
  assert.strictEqual(d.gated, 60); assert.strictEqual(d.holdLabel, 'below');
  assert.strictEqual(d.w3rung, true); assert.strictEqual(d.unlockedWave, 3);
});
check('derive: defer4 holds at 99', () => {
  const d = WG.deriveWavegate({ raw: 120, capped: 120, peak: 0, rd4ready: false, rd5ready: false, t4: 100, t5: 200, day: 40, d2: 8, dN: 25, bar1: 5, bar2: 4, p1: 5, p2: 4, w4faced: false });
  assert.strictEqual(d.gated, 99); assert.deepStrictEqual(d.binding, ['defer4']);
  assert.strictEqual(d.holdLabel, 'defer4'); assert.strictEqual(d.unlockedWave, 3);
});
check('derive: defer4 releases when ready', () => {
  const d = WG.deriveWavegate({ raw: 120, capped: 120, peak: 0, rd4ready: true, rd5ready: false, t4: 100, t5: 200, day: 40, d2: 8, dN: 25, bar1: 5, bar2: 4, p1: 5, p2: 4, w4faced: false });
  assert.strictEqual(d.gated, 120); assert.strictEqual(d.unlockedWave, 4);
});
check('derive: cap holds t5 at 199, defer5 coexists, tightest bound wins', () => {
  const d = WG.deriveWavegate({ raw: 260, capped: 150, peak: 0, rd4ready: true, rd5ready: false, t4: 100, t5: 200, day: 60, d2: 8, dN: 25, bar1: 5, bar2: 4, p1: 5, p2: 4, w4faced: true });
  assert.strictEqual(d.gated, 199); assert.deepStrictEqual(d.binding, ['cap']);
  assert.strictEqual(d.unlockedWave, 4);
});
check('derive: defer5 alone holds at 199', () => {
  const d = WG.deriveWavegate({ raw: 210, capped: 210, peak: 0, rd4ready: true, rd5ready: false, t4: 100, t5: 200, day: 60, d2: 8, dN: 25, bar1: 5, bar2: 4, p1: 5, p2: 4, w4faced: true });
  assert.strictEqual(d.gated, 199); assert.deepStrictEqual(d.binding, ['defer5']);
  assert.strictEqual(d.unlockedWave, 4);
});
check('derive: wave5 releases when ready + faced', () => {
  const d = WG.deriveWavegate({ raw: 210, capped: 210, peak: 0, rd4ready: true, rd5ready: true, t4: 100, t5: 200, day: 60, d2: 8, dN: 25, bar1: 5, bar2: 4, p1: 5, p2: 4, w4faced: true });
  assert.strictEqual(d.gated, 210); assert.strictEqual(d.unlockedWave, 5);
});
check('derive: wave5 blocked by w4-faced even at 200+', () => {
  const d = WG.deriveWavegate({ raw: 210, capped: 210, peak: 0, rd4ready: true, rd5ready: true, t4: 100, t5: 200, day: 60, d2: 8, dN: 25, bar1: 5, bar2: 4, p1: 5, p2: 4, w4faced: false });
  assert.strictEqual(d.unlockedWave, 4);
});
check('derive: ratchet floors gated at released threshold', () => {
  const d = WG.deriveWavegate({ raw: 40, capped: 40, peak: 4, rd4ready: false, rd5ready: false, t4: 100, t5: 200, day: 60, d2: 8, dN: 25, bar1: 5, bar2: 4, p1: 5, p2: 4, w4faced: false });
  assert.strictEqual(d.gated, 100); assert.strictEqual(d.holdLabel, 'ratchet4');
  assert.strictEqual(d.unlockedWave, 4);
});
check('derive: w3 rung day floor blocks wave 3', () => {
  const d = WG.deriveWavegate({ raw: 0, capped: 0, peak: 0, rd4ready: false, rd5ready: false, t4: 100, t5: 200, day: 20, d2: 8, dN: 25, bar1: 5, bar2: 4, p1: 5, p2: 4, w4faced: false });
  assert.strictEqual(d.w3rung, false); assert.strictEqual(d.unlockedWave, 2);
});
check('derive: wave 2 needs day 8 + 5 w1 points', () => {
  const d = WG.deriveWavegate({ raw: 0, capped: 0, peak: 0, rd4ready: false, rd5ready: false, t4: 100, t5: 200, day: 7, d2: 8, dN: 25, bar1: 5, bar2: 4, p1: 5, p2: 0, w4faced: false });
  assert.strictEqual(d.unlockedWave, 1);
  const d2 = WG.deriveWavegate({ raw: 0, capped: 0, peak: 0, rd4ready: false, rd5ready: false, t4: 100, t5: 200, day: 8, d2: 8, dN: 25, bar1: 5, bar2: 4, p1: 5, p2: 0, w4faced: false });
  assert.strictEqual(d2.unlockedWave, 2);
});

// --- classifyBlocker wave 4 ---
const base4 = { uw: 3, w3rung: true, raw: 60, t4: 100, t5: 200, binding: [], hold: 'below', day: 40, dN: 25 };
check('blocker4: UNLOCKED', () => { assert.strictEqual(AN.classifyBlocker({ ...base4, uw: 4 }, 4), 'UNLOCKED'); });
check('blocker4: W3-RUNG-DAY', () => { assert.strictEqual(AN.classifyBlocker({ ...base4, w3rung: false, day: 20 }, 4), 'W3-RUNG-DAY'); });
check('blocker4: W3-RUNG-BAR', () => { assert.strictEqual(AN.classifyBlocker({ ...base4, w3rung: false, day: 40 }, 4), 'W3-RUNG-BAR'); });
check('blocker4: STANDING-BELOW', () => { assert.strictEqual(AN.classifyBlocker({ ...base4 }, 4), 'STANDING-BELOW'); });
check('blocker4: DEFER4', () => { assert.strictEqual(AN.classifyBlocker({ ...base4, raw: 120, binding: ['defer4'], hold: 'defer4' }, 4), 'DEFER4'); });
check('blocker4: no-row', () => { assert.strictEqual(AN.classifyBlocker(null, 4), 'NO-ROW'); });

// --- classifyBlocker wave 5 ---
const base5 = { uw: 4, w3rung: true, raw: 210, capped: 210, t4: 100, t5: 200, binding: [], hold: 'released4', day: 60, dN: 25, w4faced: true };
check('blocker5: UNLOCKED', () => { assert.strictEqual(AN.classifyBlocker({ ...base5, uw: 5 }, 5), 'UNLOCKED'); });
check('blocker5: W4-FACED', () => { assert.strictEqual(AN.classifyBlocker({ ...base5, w4faced: false }, 5), 'W4-FACED'); });
check('blocker5: CAP', () => { assert.strictEqual(AN.classifyBlocker({ ...base5, capped: 150, binding: ['cap'], hold: 'cap' }, 5), 'CAP'); });
check('blocker5: DEFER5', () => { assert.strictEqual(AN.classifyBlocker({ ...base5, binding: ['defer5'], hold: 'defer5' }, 5), 'DEFER5'); });
check('blocker5: BELOW', () => { assert.strictEqual(AN.classifyBlocker({ ...base5, raw: 150, capped: 150, hold: 'below' }, 5), 'BELOW'); });

// --- milestones / ordering / fractions ---
function row(day, o) { return Object.assign({ day, rank: 'village', uw: 1, tableWaiting: false, tableDone: false, won: false, raw: 0, gated: 0, hold: 'below', w3rung: true, t4: 100, t5: 200, binding: [], dN: 25, p2: 4, bar2: 4, war: 0, dip: 0, plenty: 0, warPts: 0, links: 0, feasts: 0, rd4: null }, o); }
check('milestones: first days + pre-wave-4 flags', () => {
  const rows = [row(1), row(30, { rank: 'regional' }), row(50, { rank: 'national', uw: 3 }), row(80, { rank: 'national', uw: 4 }), row(90, { rank: 'national', uw: 4, tableWaiting: true }), row(100, { rank: 'national', uw: 4, tableWaiting: true, won: true })];
  const m = AN.milestones(rows);
  assert.strictEqual(m.regionalDay, 30); assert.strictEqual(m.nationalDay, 50);
  assert.strictEqual(m.wave4Day, 80); assert.strictEqual(m.tableDay, 90); assert.strictEqual(m.winDay, 100);
  const per = AN.analyzeSeed({ seed: 1, rows, recorderErrs: 0, endReason: 'won', won: true, table: true, gameDays: 100, endScaleRank: 'national', maxWave: 4, derivedFinalUw: 4, engineFinalUw: 4 });
  assert.strictEqual(per.roadStall, 'ROAD');
  assert.strictEqual(per.preW4AtNational, 1); assert.strictEqual(per.preW4AtTable, 0); assert.strictEqual(per.preW4AtWin, 0); assert.strictEqual(per.preW4AtEnd, 0);
});
check('road/stall: stall-win-lesser + stall-death', () => {
  const rows = [row(1), row(50, { rank: 'national', uw: 2 })];
  const w = AN.analyzeSeed({ seed: 2, rows, recorderErrs: 0, endReason: 'won', won: true, table: true, gameDays: 50, endScaleRank: 'national', maxWave: 2, derivedFinalUw: 2, engineFinalUw: 2 });
  assert.strictEqual(w.roadStall, 'STALL-WIN-LESSER');
  const d = AN.analyzeSeed({ seed: 3, rows, recorderErrs: 0, endReason: 'wiped', won: false, table: false, gameDays: 50, endScaleRank: 'national', maxWave: 2, derivedFinalUw: 2, engineFinalUw: 2 });
  assert.strictEqual(d.roadStall, 'STALL-WIPED');
});
check('frac: 0/0 is null, never 100%', () => {
  assert.deepStrictEqual(AN.frac(0, 0), { num: 0, den: 0, pct: null });
  assert.deepStrictEqual(AN.frac(2, 8), { num: 2, den: 8, pct: 25 });
});
check('layer-off delegates byte-identically', () => {
  delete process.env.WAVEGATE;
  assert.strictEqual(WG.layerOn(), false);
  const calls = [];
  const inner = { id: 'inner', daily() { calls.push('daily'); return 'r'; } };
  const wrapped = WG.withWavegateDiag(inner, 'w', 'd');
  assert.strictEqual(wrapped.daily({}, {}), 'r');
  assert.deepStrictEqual(calls, ['daily']);
  assert.strictEqual(wrapped.wavegateStore.rows.length, 0);
});
check('copyRd: null-safe + demand copy', () => {
  const c = WG.copyRd(null);
  assert.strictEqual(c.ready, false); assert.deepStrictEqual(c.short, ['read-error']);
  const c2 = WG.copyRd({ ready: true, armored: 3, armed: 5, tricks: 3, veterans: 1, short: [], demand: { armored: 3, armorP: 10, armed: 5, tricks: 3, veterans: 1 } });
  assert.strictEqual(c2.ready, true); assert.strictEqual(c2.demand.armorP, 10);
});

// --- corpus leg (judged corpus, read-only) ---
check('corpus: 19 prereg seeds, anchored, derived==engine, decomp complete', () => {
  const fs = require('fs'); const path = require('path');
  const dir = path.join(__dirname, '..', 'evidence', '2026-10-31', 'perseed-wavegate', 'leadfeast');
  const PREREG = [87104, 87115, 87119, 87127, 87137, 87140, 87109, 87120,
    87121, 87124, 87126, 87134, 87107, 87135, 87132, 87123, 87103, 87138, 87128];
  const files = [];
  for (const s of PREREG) {
    const fp = path.join(dir, `s${s}.json`);
    const st = fs.statSync(fp);
    assert.ok(st.size > 0, `s${s} must be non-empty (a 0-byte JSON is never data)`);
    const j = JSON.parse(fs.readFileSync(fp, 'utf8'));
    assert.strictEqual(j.seed, s);
    assert.ok(String(j.anchorCommit).startsWith('4c92bbb04'), `s${s} anchor must be the prereg base`);
    assert.strictEqual(j.instrument, 'wavegate-v1');
    files.push(fp);
  }
  const band = AN.analyzeBand(files);
  assert.strictEqual(band.usable, 19);
  assert.strictEqual(band.derivedMatchesEngine, '19/19');
  assert.strictEqual(band.recorderErrsTotal, 0);
  assert.strictEqual(band.decompComplete, band.national + '/' + band.national);
  // Row-series audit (disclosed in evidence, machine-checked here):
  // harness daily calls start at scholar day 2 and the day clock
  // jumps 2->4 at run start on every seed, so calendar days 1 and
  // 3 are never observed at a daily call. Milestones use first
  // occurrence and all sit >= day 77, so no milestone, blocker,
  // or ordering value can move on this pattern.
  for (const fp of files) {
    const j = JSON.parse(fs.readFileSync(fp, 'utf8'));
    assert.strictEqual(j.rows[0].day, 2);
    assert.deepStrictEqual(j.rows.slice(0, 5).map(r => r.day), [2, 2, 4, 4, 5]);
  }
  console.log(`   corpus band: usable=${band.usable} national=${band.national} table=${band.table} won=${band.won} wave4=${band.wave4} wave5=${band.wave5} road=${band.road} stall=${band.stall} medianSurvival=${band.medianSurvival} decomp=${band.decompComplete} derived=${band.derivedMatchesEngine}`);
  console.log('   corpus-derived verdict gates: PASS (DIAG-GO on corpus gates; det-gate proven separately in evidence)');
});

console.log(`\n${n} checks green (synthetic fixtures + corpus leg).`);
