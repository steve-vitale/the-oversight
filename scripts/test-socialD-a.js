#!/usr/bin/env node
// scripts/test-socialD-a.js — proof validator + analyzer for
// sim-socialD-a (scale-onramp axis, 2026-10-27: SOCIAL-FAMILY (D)
// SEPARATION arm. DIAG ONLY, zero src/js changes.)
//
// Pure corpus analysis: no harness, no RNG, no game state. Reads
// evidence/2026-10-27/perseed-socialD-a/s<seed>-<arm>.json
// (arms: fallbackoff, socialDoff), re-derives per-seed metrics with
// the VERBATIM analyzer (scripts/test-w4funnel-diag.js, exported
// analyzeW4funnel), re-derives the fallback-off band and the
// fallback-off-vs-surgeconfirm comparison, checks corpus recorder
// errors, checks the five recorder sha256 values against the prereg,
// checks the D-off variant diffs (competent-nofallback-socialD
// differs from competent-nofallback ONLY in the header + the
// ask:others filter + the chooser call site; leanlink/tableseat
// variants differ only in the require line + policy id), checks the
// nofallback chain files and competent.js are untouched, checks
// D-off rows are identical to fallback-off rows modulo policy +
// corpusFile, and judges the BINDING VERDICT RULE from the prereg:
//
//   COST BAR (first): D starvation <= F starvation + 2 AND D median
//   survival >= 0.8 x F median survival. Fail => NO-GO.
//   D-EXPLAINS iff D arrivals <= 12 AND D median standing-100 >=
//   F median + 5. D-CONTRIBUTES iff D arrivals <= 14 (and not
//   EXPLAINS). D-RULED-OUT iff D arrivals >= 15 (incl. equality).
//
// Unit-tests the verdict function, the cost bar, the median, and
// the D-off filter (fail on old pickTalkChoice, pass on new) at the
// boundaries. Exit non-zero on any failed check. A fallback-off-vs-
// surgeconfirm difference is REPORTED, never a failure (base
// movement, prereg rule); the verdict itself is an output, never a
// failure.
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const { analyzeW4funnel } = require('./test-w4funnel-diag');

const REPO = path.join(__dirname, '..');
const DIR = process.argv[2] || path.join(REPO, 'evidence', '2026-10-27', 'perseed-socialD-a');
const SEEDS = [73671, 73672, 73673, 73674, 73675, 73676, 73677, 73678];
// Surgeconfirm FALLBACK-OFF table (sim-surgeconfirm-a, within-run):
// report-only reference for the re-run FALLBACKOFF arm.
const SURGE = {
  nationalEver: 5, nationalFinal: 4, table: 4, entered: 3, wins: 3,
  wave4: 3, wave5: 0, medianDays: 137, deaths: 295, starvation: 1,
  arrivals: 17, tileEntry: 15, scriptedTitan: 2, medStanding: 68, reached: 6,
};
const RECORDER_SHA = {
  'raftdraft-diag.js': '5aef723cb3c902bee6d03eb9b40f8194bbd616a7798049f226c1417194e10b97',
  'spawnsrc-diag.js': '31c496ac41e1213095b3b25854a6c7e584cc05c0bbb255e39c9376a0a3da4e17',
  'oldcore-diag.js': 'efedd0cd0999d9f1b4987671b1da791109579ebdf72bb97d7478dc85c6e706cd',
  'w5births-diag.js': 'b2f2d909f0bdc8a3d4bb2fd40e6d70d7a7a578da169e4b3d49ab63b7b0da1ebe',
  'defwound-diag.js': '3f3f8eed58bb1a4bf02e124ae47f0ff5255a059339898cc93b1231bcb1fd9401',
};
const SHA = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
function medianOf(arr) {
  if (!arr.length) return null;
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}
function costBarPass(dStarv, fStarv, dMed, fMed) {
  return dStarv <= fStarv + 2 && dMed >= 0.8 * fMed;
}
function verdictRule(dArrivals, dMedStanding, fMedStanding, costPass) {
  if (!costPass) return 'NO-GO';
  if (dArrivals <= 12 && dMedStanding !== null && fMedStanding !== null && dMedStanding >= fMedStanding + 5) return 'D-EXPLAINS';
  if (dArrivals <= 14) return 'D-CONTRIBUTES';
  return 'D-RULED-OUT';
}
let failures = 0;
function check(name, ok, extra) {
  console.log(`  ${ok ? 'PASS' : 'FAIL'} ${name}${extra !== undefined ? ' ' + extra : ''}`);
  if (!ok) failures++;
}

// --- unit checks: verdict rule + cost bar + median boundaries (no corpus) ---
check('unit: 12 arrivals + median+5 + cost pass => D-EXPLAINS', verdictRule(12, 73, 68, true) === 'D-EXPLAINS');
check('unit: 12 arrivals + median+4 + cost pass => D-CONTRIBUTES', verdictRule(12, 72, 68, true) === 'D-CONTRIBUTES');
check('unit: 14 arrivals + cost pass => D-CONTRIBUTES', verdictRule(14, 68, 68, true) === 'D-CONTRIBUTES');
check('unit: 15 arrivals + cost pass => D-RULED-OUT', verdictRule(15, 68, 68, true) === 'D-RULED-OUT');
check('unit: 17 arrivals (= equality) + cost pass => D-RULED-OUT', verdictRule(17, 68, 68, true) === 'D-RULED-OUT');
check('unit: 0 arrivals + cost FAIL => NO-GO (cost bar decides)', verdictRule(0, 200, 68, false) === 'NO-GO');
check('unit: 13 arrivals + null median + cost pass => D-CONTRIBUTES', verdictRule(13, null, 68, true) === 'D-CONTRIBUTES');
check('unit: cost bar 1<=3 and 137>=109.6 passes', costBarPass(1, 1, 137, 137) === true);
check('unit: cost bar starvation 4>3 fails', costBarPass(4, 1, 137, 137) === false);
check('unit: cost bar median 100<109.6 fails', costBarPass(1, 1, 100, 137) === false);
check('unit: median [65,57,72,68,66,155] => 68 (upper median)', medianOf([65, 57, 72, 68, 66, 155]) === 68);
check('unit: median [] => null', medianOf([]) === null);

// --- unit checks: D-off filter (fail on old, pass on new) ---
try {
  const oldMod = require('./policies/competent-nofallback');
  const newMod = require('./policies/competent-nofallback-socialD');
  const oldPick = oldMod.pickTalkChoice([{ id: 'ask:others' }], {});
  check('unit: OLD pickTalkChoice returns ask:others (fail-on-old)', oldPick && oldPick.id === 'ask:others', JSON.stringify(oldPick));
  const ctx = {};
  const newPick = newMod.pickTalkChoice([{ id: 'ask:others' }], {}, ctx);
  check('unit: NEW pickTalkChoice returns null for ask:others-only menu', newPick === null, JSON.stringify(newPick));
  check('unit: NEW filter counted the filtered candidate', ctx.askOthersFiltered === 1, `askOthersFiltered=${ctx.askOthersFiltered}`);
  const ctx2 = {};
  const newMixed = newMod.pickTalkChoice([{ id: 'ask:others' }, { id: 'teach' }], {}, ctx2);
  check('unit: NEW pickTalkChoice returns next-best (teach), never ask:others', newMixed && newMixed.id === 'teach', JSON.stringify(newMixed));
  check('unit: NEW 2-arg call still works (no ctx)', newMod.pickTalkChoice([{ id: 'leave' }, { id: 'ask' }], {}).id === 'ask');
} catch (e) { check('unit: filter fail-old/pass-new', false, String(e).slice(0, 200)); }

// --- recorder identity (verbatim claim) ---
for (const [file, want] of Object.entries(RECORDER_SHA)) {
  const got = SHA(path.join(REPO, 'scripts', 'policies', file));
  check(`recorder sha ${file}`, got === want, got === want ? '' : `got=${got}`);
}

// --- variant diff checks (git diff --no-index) ---
function diffLines(a, b) {
  const out = execSync(`git diff --no-index -- ${a} ${b} || true`, { cwd: REPO, encoding: 'utf8' });
  return out.split('\n').filter(l => (l.startsWith('-') && !l.startsWith('---')) || (l.startsWith('+') && !l.startsWith('+++')));
}
try {
  const lines = diffLines('scripts/policies/competent-nofallback.js', 'scripts/policies/competent-nofallback-socialD.js');
  const removed = lines.filter(l => l.startsWith('-'));
  const added = lines.filter(l => l.startsWith('+'));
  const removedOk = removed.length === 4
    && removed.some(l => l.includes('function pickTalkChoice(choices, seen) {'))
    && removed.some(l => l.includes('const live = (choices || []).filter(c =>'))
    && removed.some(l => l.includes('c && c.id && !TALK_STRUCTURAL'))
    && removed.some(l => l.includes('pickTalkChoice(choices,seen),ctx'));
  const addedOk = added.length === 16
    && added.filter(l => l.startsWith('+//')).length === 6
    && added.some(l => l.includes('function pickTalkChoice(choices, seen, ctx)'))
    && added.some(l => l.includes("c.id === 'ask:others'"))
    && added.some(l => l.includes('ctx.askOthersFiltered'))
    && added.some(l => l.includes('pickTalkChoice(choices,seen,ctx)'));
  check('variant: competent-nofallback-socialD diff is header+filter+callsite only', removedOk && addedOk, `removed=${removed.length} added=${added.length}`);
} catch (e) { check('variant: competent-nofallback-socialD diff', false, String(e).slice(0, 160)); }
try {
  const ll = diffLines('scripts/policies/leanlinkrescue-nofallback.js', 'scripts/policies/leanlinkrescue-nofallback-socialD.js');
  check('variant: leanlinkrescue-socialD diff is require+id only', ll.length === 4
    && ll.some(l => l.includes("require('./competent-nofallback-socialD')"))
    && ll.some(l => l.includes('leanlinkrescue-nofallback-socialD')), JSON.stringify(ll));
} catch (e) { check('variant: leanlinkrescue-socialD diff', false, String(e).slice(0, 160)); }
try {
  const ts = diffLines('scripts/policies/tableseat-nowait-nofallback.js', 'scripts/policies/tableseat-nowait-nofallback-socialD.js');
  check('variant: tableseat-socialD diff is require line only', ts.length === 2
    && ts.some(l => l.includes("require('./leanlinkrescue-nofallback-socialD')")), JSON.stringify(ts));
} catch (e) { check('variant: tableseat-socialD diff', false, String(e).slice(0, 160)); }
for (const f of ['scripts/policies/competent.js', 'scripts/policies/competent-nofallback.js', 'scripts/policies/leanlinkrescue-nofallback.js', 'scripts/policies/tableseat-nowait-nofallback.js']) {
  try {
    const status = execSync(`git status --porcelain -- ${f}`, { cwd: REPO, encoding: 'utf8' }).trim();
    check(`variant: ${f} untouched by this run`, status === '', status ? `status=${status}` : '');
  } catch (e) { check(`variant: ${f} untouched`, false, String(e).slice(0, 120)); }
}

// --- corpus analysis ---
const perArm = {};
for (const arm of ['fallbackoff', 'socialDoff']) {
  const rows = [];
  for (const seed of SEEDS) {
    const p = path.join(DIR, `s${seed}-${arm}.json`);
    check(`corpus: ${arm} seed ${seed} row exists`, fs.existsSync(p));
    if (!fs.existsSync(p)) continue;
    rows.push(JSON.parse(fs.readFileSync(p, 'utf8')));
  }
  const analyzed = rows.map(r => analyzeW4funnel(r));
  const arrivals = analyzed.reduce((t, a) => t + a.arrivals, 0);
  const srcCounts = {};
  for (const a of analyzed) for (const [k, v] of Object.entries(a.arrivalSrcCounts || {})) srcCounts[k] = (srcCounts[k] || 0) + v;
  const kills = analyzed.reduce((t, a) => t + (a.killed || 0), 0);
  const corpusOk = rows.every(r => r.days > 0 && r.spawnsrc && r.spawnsrc.diag.errs === 0
    && r.raftdraft && r.raftdraft.diag.errs === 0 && r.oldcore && r.oldcore.diag.errs === 0
    && r.w5births && r.w5births.diag.errs === 0 && r.defwound && r.defwound.diag.errs === 0
    && (r.surge.standingErrs | 0) === 0 && (r.surge.readinessErrs | 0) === 0
    && ((r.ctxCounters.cookStaffed | 0) + (r.ctxCounters.fishStaffed | 0)) > 0
    && (r.ctxCounters.cookStaffFallback | 0) === 0 && (r.ctxCounters.fishStaffFallback | 0) === 0);
  check(`corpus: ${arm} recorder errors 0 + surge reads clean + idle guards pass`, corpusOk);
  const band = {
    won: rows.reduce((t, r) => t + r.won, 0),
    medianDays: medianOf(rows.map(r => r.days)),
    nationalEver: rows.reduce((t, r) => t + r.nationalEver, 0),
    nationalFinal: rows.reduce((t, r) => t + r.nationalFinal, 0),
    table: rows.reduce((t, r) => t + r.table, 0),
    entered: rows.reduce((t, r) => t + r.entered, 0),
    wave4: rows.filter(r => (r.waveReach || 1) >= 4).length,
    wave5: rows.filter(r => (r.waveReach || 1) >= 5).length,
    deaths: rows.reduce((t, r) => t + r.deathTotal, 0),
    starvation: rows.reduce((t, r) => t + r.starvationDeaths, 0),
  };
  const talk = {
    talked: rows.reduce((t, r) => t + ((r.ctxCounters.talked) | 0), 0),
    deepConvos: rows.reduce((t, r) => t + ((r.ctxCounters.deepConvos) | 0), 0),
    deepTurns: rows.reduce((t, r) => t + ((r.ctxCounters.deepTurns) | 0), 0),
    askOthersFiltered: rows.reduce((t, r) => t + ((r.ctxCounters.askOthersFiltered) | 0), 0),
  };
  const deathAgg = {};
  for (const r of rows) for (const [k, v] of Object.entries(r.deaths || {})) deathAgg[k] = (deathAgg[k] || 0) + v;
  const metrics = rows.map((r, i) => ({
    seed: r.seed, days: r.days, endReason: r.endReason, won: r.won, waveReach: r.waveReach,
    arrivals: analyzed[i].arrivals,
    arrivalDetail: (analyzed[i].detail || []).map(d => `${d.type}@d${d.arrivalDay}:${d.src}->${d.outcome}`),
    firstStanding100Day: r.surge.firstStanding100Day,
    firstReadinessDay: r.surge.firstReadinessDay,
    derivedOpenDay: r.surge.derivedOpenDay,
    feasts: (r.surge.endStanding || {}).feasts,
    endStandingTotal: (r.surge.endStanding || {}).total,
    cookStaffed: r.ctxCounters.cookStaffed, fishStaffed: r.ctxCounters.fishStaffed,
    cookStaffFallback: r.ctxCounters.cookStaffFallback, fishStaffFallback: r.ctxCounters.fishStaffFallback,
    talked: r.ctxCounters.talked, deepConvos: r.ctxCounters.deepConvos,
    deepTurns: r.ctxCounters.deepTurns, askOthersFiltered: r.ctxCounters.askOthersFiltered,
  }));
  const reachDays = metrics.map(m => m.firstStanding100Day).filter(d => d !== null);
  const medStanding = medianOf(reachDays);
  perArm[arm] = { rows, analyzed, arrivals, srcCounts, kills, band, metrics, medStanding, reachCount: reachDays.length, talk, deathAgg };
  console.log(`\n  --- ${arm}: arrivals=${arrivals} src=${JSON.stringify(srcCounts)} kills4=${kills} band won=${band.won}/${rows.length} medD=${band.medianDays} natEver=${band.nationalEver} natFinal=${band.nationalFinal} table=${band.table} entered=${band.entered} wave4=${band.wave4} wave5=${band.wave5} deaths=${band.deaths} starv=${band.starvation} medianStanding100d=${medStanding} (reached ${reachDays.length}/8) talk=${JSON.stringify(talk)} ---`);
  for (const m of metrics) console.log(`    seed ${m.seed}: days=${m.days} ${m.endReason} wave=${m.waveReach} won=${m.won} arrivals=${m.arrivals} [${m.arrivalDetail.join('; ')}] standing100d=${m.firstStanding100Day} readinessd=${m.firstReadinessDay} opend=${m.derivedOpenDay} feasts=${m.feasts} endStanding=${m.endStandingTotal} cook=${m.cookStaffed} fish=${m.fishStaffed} cookFB=${m.cookStaffFallback} fishFB=${m.fishStaffFallback} talked=${m.talked} deepConvos=${m.deepConvos} deepTurns=${m.deepTurns} askOthersFiltered=${m.askOthersFiltered}`);
}

// --- D-off rows identical to fallback-off rows (modulo policy + corpusFile) ---
let identicalSeeds = 0;
for (const seed of SEEDS) {
  const a = JSON.parse(JSON.stringify(perArm.fallbackoff.rows.find(r => r.seed === seed)));
  const b = JSON.parse(JSON.stringify(perArm.socialDoff.rows.find(r => r.seed === seed)));
  delete a.policy; delete b.policy; delete a.corpusFile; delete b.corpusFile;
  const same = JSON.stringify(a) === JSON.stringify(b);
  if (same) identicalSeeds++;
  console.log(`  row-equality seed ${seed}: ${same ? 'IDENTICAL' : 'DIFFERS'}`);
}
check('rows: D-off identical to fallback-off on all 8 seeds (modulo policy/corpusFile)', identicalSeeds === 8, `${identicalSeeds}/8 identical`);

// --- fallback-off vs surgeconfirm per-seed (trajectory fields) ---
const SHARED = ['days', 'gameDays', 'endReason', 'won', 'waveReach', 'maxArc', 'finalRank', 'maxRank', 'nationalEver', 'nationalFinal', 'entered', 'deathTotal', 'starvationDeaths'];
for (const seed of SEEDS) {
  const sgPath = path.join(REPO, 'evidence', '2026-10-27', 'perseed-surgeconfirm-a', `s${seed}-fallbackoff.json`);
  const sg = JSON.parse(fs.readFileSync(sgPath, 'utf8'));
  const nw = perArm.fallbackoff.rows.find(r => r.seed === seed);
  const trajDiffs = SHARED.filter(f => JSON.stringify(sg[f]) !== JSON.stringify(nw[f]));
  const tsSame = JSON.stringify(sg.ts || {}) === JSON.stringify(nw.ts || {});
  const facedSame = JSON.stringify((sg.raftdraft || {}).faced || {}) === JSON.stringify((nw.raftdraft || {}).faced || {});
  const logSame = JSON.stringify((sg.raftdraft || {}).logEntries || []) === JSON.stringify((nw.raftdraft || {}).logEntries || []);
  console.log(`  surgeconfirm-vs-rerun seed ${seed}: trajectory diffs=[${trajDiffs.join(',') || 'none'}] table surge=${sg.table} new=${nw.table} tsSame=${tsSame} facedSame=${facedSame} logSame=${logSame}`);
}

// --- fallback-off vs surgeconfirm (report-only) ---
const fb = perArm.fallbackoff.band;
const fbExact = fb.nationalEver === SURGE.nationalEver && fb.nationalFinal === SURGE.nationalFinal
  && fb.table === SURGE.table && fb.entered === SURGE.entered && fb.won === SURGE.wins
  && fb.wave4 === SURGE.wave4 && fb.wave5 === SURGE.wave5 && fb.medianDays === SURGE.medianDays
  && fb.deaths === SURGE.deaths && fb.starvation === SURGE.starvation
  && perArm.fallbackoff.arrivals === SURGE.arrivals
  && (perArm.fallbackoff.srcCounts['tile-entry'] || 0) === SURGE.tileEntry
  && (perArm.fallbackoff.srcCounts['scripted-titan'] || 0) === SURGE.scriptedTitan
  && perArm.fallbackoff.medStanding === SURGE.medStanding && perArm.fallbackoff.reachCount === SURGE.reached;
console.log(`\n  FALLBACKOFF-vs-SURGECONFIRM (report-only): ${fbExact ? 'EXACT' : 'MOVED'} — rerun won=${fb.won} natEver=${fb.nationalEver} natFinal=${fb.nationalFinal} table=${fb.table} entered=${fb.entered} wave4=${fb.wave4} wave5=${fb.wave5} medD=${fb.medianDays} deaths=${fb.deaths} starv=${fb.starvation} arrivals=${perArm.fallbackoff.arrivals} src=${JSON.stringify(perArm.fallbackoff.srcCounts)} medStanding=${perArm.fallbackoff.medStanding} (reached ${perArm.fallbackoff.reachCount}/8)`);
console.log(`  SURGE reference: wins=${SURGE.wins} natEver=${SURGE.nationalEver} natFinal=${SURGE.nationalFinal} table=${SURGE.table} entered=${SURGE.entered} wave4=${SURGE.wave4} wave5=${SURGE.wave5} medD=${SURGE.medianDays} deaths=${SURGE.deaths} starv=${SURGE.starvation} arrivals=${SURGE.arrivals} tile-entry=${SURGE.tileEntry} scripted-titan=${SURGE.scriptedTitan} medStanding=${SURGE.medStanding} reached=${SURGE.reached}/8`);

// --- binding verdict (prereg rule) ---
const F = perArm.fallbackoff, D = perArm.socialDoff;
const costPass = costBarPass(D.band.starvation, F.band.starvation, D.band.medianDays, F.band.medianDays);
console.log(`\n  COST BAR: D starvation=${D.band.starvation} <= F starvation+2=${F.band.starvation + 2} ${D.band.starvation <= F.band.starvation + 2 ? 'PASS' : 'FAIL'}; D median=${D.band.medianDays} >= 0.8xF median=${0.8 * F.band.medianDays} ${D.band.medianDays >= 0.8 * F.band.medianDays ? 'PASS' : 'FAIL'} => ${costPass ? 'PASS' : 'FAIL'}`);
const verdict = verdictRule(D.arrivals, D.medStanding, F.medStanding, costPass);
console.log(`  VERDICT RULE: D arrivals=${D.arrivals} (EXPLAINS needs <=12, CONTRIBUTES needs <=14, RULED-OUT >=15); D median standing-100 day=${D.medStanding} vs F median=${F.medStanding} (EXPLAINS needs >= F+5 = ${F.medStanding === null ? 'n/a' : F.medStanding + 5}); reaching counts F=${F.reachCount}/8 D=${D.reachCount}/8; talk census F=${JSON.stringify(F.talk)} D=${JSON.stringify(D.talk)}`);
console.log(`  VERDICT: ${verdict}`);
console.log(`  DEATH-CAUSE SHARES F (${F.band.deaths} deaths): ${JSON.stringify(F.deathAgg)}`);
console.log(`  DEATH-CAUSE SHARES D (${D.band.deaths} deaths): ${JSON.stringify(D.deathAgg)}`);

console.log(`\nSOCIALD PROOF: ${failures === 0 ? 'ALL CHECKS PASS' : failures + ' CHECK(S) FAILED'} (verdict: ${verdict})`);
if (failures) process.exit(1);
