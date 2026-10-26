#!/usr/bin/env node
// test-preservesched-resid-b.js — proof for sim-preservesched-resid-b.
//
// sim-preservesched-resid-b, 2026-10-26, oversight-flesh-out-loop-b.
// Asserts, against the NEW corpus (evidence/2026-10-26/
// sim-preservesched-resid-b-corpus/):
//  1. CONTROL: the original 36/38 verdict re-derives exactly
//     (neutrality 327/289/38, lag 1x32/2x4/3x1/4x1, coverage 36/38,
//     residuals exactly (9750,83) and (9750,84)). This reproduces the
//     prior arm's verdict as a control; it does NOT re-judge the
//     SPOIL-CLOCK + RACKS-FULL rule, which stands.
//  2. INSTRUMENT: the resid capture joins cook lines with zero misses
//     and its per-stack eligible sums match the independent
//     recomputeContext on every line (zero mismatches).
//  3. DETERMINISM: the new corpus reproduces the COMMITTED inflow-b
//     corpus exactly on all 8 seeds (dayTable classes, attribution
//     flags, days alive, rank) — the instrument changed nothing about
//     the run.
//  4. RESIDUAL FACTS: the named per-stack evidence for seed 9750
//     days 83–84 (haven tier 3, day-79/80 stock records, dayPantry
//     transitions, exact eligible stacks at the bound lines).
//  5. VERDICT FLAG: the analyzer's literal pre-registered judgment is
//     DIAG-NO-GO (neither hypothesis fits literally) — asserting the
//     verdict logic, never re-scoring the bar.
// Exit 0 iff all checks pass; prints FAIL lines otherwise.
'use strict';
const fs = require('fs');
const path = require('path');
const { analyze } = require('./analyze-preservesched-resid-b');

const CORPUS = path.join(__dirname, '..', 'evidence', '2026-10-26', 'sim-preservesched-resid-b-corpus');
const OLD = path.join(__dirname, '..', 'evidence', '2026-10-26', 'sim-inflow-b-corpus');
const failures = [];
function check(name, cond, detail) {
  if (cond) console.log('PASS ' + name);
  else { console.log('FAIL ' + name + (detail ? ' :: ' + detail : '')); failures.push(name); }
}

const out = analyze();
check('control neutrality 327/289/38', out.neutrality.pass, JSON.stringify(out.neutrality));
check('control attrFlagMismatch 0', out.attrFlagMismatch === 0, String(out.attrFlagMismatch));
check('control lag distribution 1x32/2x4/3x1/4x1',
  JSON.stringify(out.lagDistribution) === JSON.stringify({ 1: 32, 2: 4, 3: 1, 4: 1 }),
  JSON.stringify(out.lagDistribution));
check('control median lag 1.0', out.medianLag === 1, String(out.medianLag));
check('control coverage 36/38', out.primary.explained === 36 && out.primary.total === 38,
  JSON.stringify(out.primary));
check('control residuals exactly (9750,83),(9750,84)',
  JSON.stringify(out.residuals) === JSON.stringify([{ seed: 9750, day: 83, lag: 3 }, { seed: 9750, day: 84, lag: 4 }]),
  JSON.stringify(out.residuals));
check('instrument ctxKcalMatch zero mismatches', out.instrument.ctxMismatch === 0 && out.instrument.ctxChecked > 0,
  JSON.stringify(out.instrument));
check('instrument resid join zero misses', out.instrument.residJoinMiss === 0,
  JSON.stringify(out.instrument));
check('corpus 8 files', out.files === 8, String(out.files));

// Corpus validity: no truncation flags on any file.
let truncBad = [];
for (const f of fs.readdirSync(CORPUS).filter(x => /^preservesched-resid-b-cap1-.*\.json$/.test(x))) {
  const d = JSON.parse(fs.readFileSync(path.join(CORPUS, f), 'utf8'));
  if (d.cookTruncated || d.eventTruncated || d.inflowTruncated || d.residTruncated) truncBad.push(f);
}
check('corpus no truncation flags', truncBad.length === 0, truncBad.join(','));

// Determinism vs the committed inflow-b corpus.
let detMiss = [];
for (const seed of [9750, 9751, 9752, 9753, 9754, 9755, 9756, 9757]) {
  const o = JSON.parse(fs.readFileSync(path.join(OLD, `inflow-b-cap1-pd0-dg1-competent-nofeast-s${seed}.json`), 'utf8'));
  const n = JSON.parse(fs.readFileSync(path.join(CORPUS, `preservesched-resid-b-cap1-pd0-dg1-competent-nofeast-s${seed}.json`), 'utf8'));
  const oDays = (o.dayTable || []).map(r => r.day + ':' + r.class).join(',');
  const nDays = (n.dayTable || []).map(r => r.day + ':' + r.class).join(',');
  const oAtt = (o.attributionTable || []).map(r => r.day + ':' + (r.attributed ? 1 : 0)).join(',');
  const nAtt = (n.attributionTable || []).map(r => r.day + ':' + (r.attributed ? 1 : 0)).join(',');
  if (!(oDays === nDays && oAtt === nAtt && o.daysAlive === n.daysAlive && o.rank === n.rank)) detMiss.push(seed);
}
check('determinism vs committed inflow-b corpus (8/8 seeds)', detMiss.length === 0, detMiss.join(','));

// Residual facts.
const r = out.resid.seed9750;
check('residual corpus present for seed 9750', !!r, 'missing');
if (r) {
  const d83 = r.residDays[83] || [];
  const d84 = r.residDays[84] || [];
  check('residual haven tier 3 on both days',
    d83.length > 0 && d84.length > 0 &&
    d83.every(x => x.havenTier === 3) && d84.every(x => x.havenTier === 3),
    JSON.stringify({ d83: d83.map(x => x.havenTier), d84: d84.map(x => x.havenTier) }));
  check('residual granary bonus 3 on both days',
    d83.every(x => x.granaryBonus === 3) && d84.every(x => x.granaryBonus === 3));
  const stackKey = (lines) => lines.length ? lines[0].eligibleStacks.map(s =>
    `${s.name}|${s.kcalEach}x${s.units}@${s.spoilDay}g${s.granaryDays === null ? 'null' : s.granaryDays}`).join(';') : '(none)';
  const allSameDay = (lines) => lines.every(x => stackKey([x]) === stackKey([lines[0]]));
  check('day 83 bound lines share one eligible pile', allSameDay(d83));
  check('day 84 bound lines share one eligible pile', allSameDay(d84));
  check('day 83 eligible pile exactly 200x10@85 granaryDays null',
    stackKey(d83) === 'Foraged food|200x10@85gnull', stackKey(d83));
  check('day 84 eligible pile exactly Winnerx2 + day-80 stock + 200-stack',
    stackKey(d84) === "Winner's share (alien rations)|300x2@86g3;Winner's share (alien rations)|300x2@86g3;Foraged food|178x1@86g3;Foraged food|189x1@86g3;Foraged food|200x10@85gnull",
    stackKey(d84));
  const infl = (day) => (r.inflowsByDay.find(e => e.day === day) || { recs: [] }).recs;
  const stockKcal = (day) => infl(day).filter(x => x.door === 'stock').map(x => x.kcal).sort((a, b) => a - b).join(',');
  check('day-79 stock records 122+220', stockKcal(79) === '122,220', stockKcal(79));
  check('day-80 stock records 178+189', stockKcal(80) === '178,189', stockKcal(80));
  const has = (day, pred) => ((r.dayPantry[day] || {}).stacks || []).some(pred);
  const d79stock = s => s.name === 'Foraged food' && s.spoilDay === 85 && s.granaryDays === 3;
  check('day-79 stock present in pantry d80, d81, d82',
    has(80, d79stock) && has(81, d79stock) && has(82, d79stock));
  check('day-79 stock gone from pantry by d83', !has(83, d79stock) && !has(84, d79stock));
  const stack200 = s => s.name === 'Foraged food' && s.kcalEach === 200 && s.units === 10 && s.spoilDay === 85 && s.granaryDays === null;
  check('200-stack @85 absent d82, present d83+d84',
    !has(82, stack200) && has(83, stack200) && has(84, stack200));
  const d80stock = s => s.name === 'Foraged food' && s.spoilDay === 86 && s.granaryDays === 3 && (s.kcalEach === 178 || s.kcalEach === 189);
  check('day-80 stock present in pantry d81+ and eligible d84',
    has(81, d80stock) && has(84, d80stock));
}

// Verdict flag (literal pre-registered judgment).
check('verdict DIAG-NO-GO neither-hypothesis-fits-literally',
  out.verdict.verdict === 'DIAG-NO-GO' && out.verdict.reason === 'neither-hypothesis-fits-literally',
  JSON.stringify(out.verdict));

// Wall numbers (same band as the prior arm).
check('wall national/table/win 0/0/0', out.wall.national === 0 && out.wall.table === 0 && out.wall.win === 0,
  JSON.stringify(out.wall));
check('wall wave4/wave5 0/0', out.wall.wave4 === 0 && out.wall.wave5 === 0);
check('wall median survival 100d', out.wall.medianDaysAlive === 100, String(out.wall.medianDaysAlive));
check('wall deaths 43', out.wall.deaths === 43, String(out.wall.deaths));

if (failures.length) {
  console.log('FAILURES: ' + failures.length);
  process.exit(1);
}
console.log('ALL CHECKS PASS');
