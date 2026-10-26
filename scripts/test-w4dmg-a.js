#!/usr/bin/env node
// scripts/test-w4dmg-a.js — proof for sim-w4dmg-a (2026-10-26).
// Re-derives EVERY number in evidence/2026-10-26/sim-w4dmg-a.md
// from the per-seed rows in evidence/2026-10-26/perseed-w4dmg-a/
// (never from the summary alone): re-baseline diffs, G2 identity,
// cost bar, per-seed field/tb decompositions, limiter counts,
// band totals, field/tb stats, rounds-to-kill arithmetic, and the
// DIAG verdict rule. The summary.json is then checked field-by-
// field against the fresh recomputation, so a hand-edited summary
// cannot pass. Exits non-zero on any failure.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { classifySeed, bandOf, BAND1920, SEEDS } = require('./test-w4dmg-diag-sweep');
const EVID = path.join(REPO, 'evidence', '2026-10-26', 'perseed-w4dmg-a');
let PASS = 0, FAIL = 0;
function check(name, cond, extra) {
  if (cond) { PASS++; }
  else { FAIL++; console.log(`FAIL ${name}${extra !== undefined ? ' :: ' + JSON.stringify(extra) : ''}`); }
}
function eq(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
function medianOf(arr) {
  if (!arr.length) return 0;
  const s = arr.slice().sort((x, y) => x - y);
  return s[Math.floor(s.length / 2)];
}

const rows = [];
for (const seed of SEEDS) for (const pid of ['baseline', 'armed']) {
  const p = path.join(EVID, `s${seed}-${pid}.json`);
  check(`row file exists ${pid} ${seed}`, fs.existsSync(p));
  if (fs.existsSync(p)) rows.push(JSON.parse(fs.readFileSync(p, 'utf8')));
}
check('corpus size 16', rows.length === 16, rows.length);
const perSeed = SEEDS.map(seed => classifySeed(rows.find(r => r.policy === 'armed' && r.seed === seed)));
const summary = JSON.parse(fs.readFileSync(path.join(EVID, 'summary.json'), 'utf8'));

// Re-baseline bands + diffs vs 1920Z.
const baselineBand = bandOf(rows, 'baseline');
const armedBand = bandOf(rows, 'armed');
check('summary baseline band', eq(summary.baselineBand, baselineBand), { summary: summary.baselineBand, recomputed: baselineBand });
check('summary armed band', eq(summary.armedBand, armedBand));
const diff1920 = {
  wins: baselineBand.won - BAND1920.wins, nationalEver: baselineBand.nationalEver - BAND1920.nationalEver,
  nationalFinal: baselineBand.nationalFinal - BAND1920.nationalFinal, table: baselineBand.table - BAND1920.table,
  entered: baselineBand.entered - BAND1920.entered,
  wave4: baselineBand.wave4 - BAND1920.wave4, wave5: baselineBand.wave5 - BAND1920.wave5,
  medianDays: baselineBand.medianDays - BAND1920.medianDays, deaths: baselineBand.deathTotal - BAND1920.deaths,
  starvation: baselineBand.starvationTotal - BAND1920.starvation,
};
check('summary diff vs 1920Z', eq(summary.gates.diffVs1920, diff1920), { summary: summary.gates.diffVs1920, recomputed: diff1920 });
check('summary rebaselineExact flag', summary.gates.rebaselineExact === Object.keys(diff1920).every(k => diff1920[k] === 0));
// G2 identity per seed.
for (const seed of SEEDS) {
  const c = rows.find(r => r.policy === 'baseline' && r.seed === seed);
  const a = rows.find(r => r.policy === 'armed' && r.seed === seed);
  check(`G2 ${seed} days/gameDays/ts/starvation`, c.days === a.days && c.gameDays === a.gameDays && eq(c.ts, a.ts) && c.starvationDeaths === a.starvationDeaths);
  check(`G2 ${seed} faced`, eq(c.faced, a.faced));
  check(`G2 ${seed} kill log`, eq((c.logEntries || []).map(e => [e.d, e.mid, e.w, e.by, e.via]), (a.logEntries || []).map(e => [e.d, e.mid, e.w, e.by, e.via])));
}
check('summary g2Pass', summary.gates.g2Pass === true);
// Cost bar.
check('cost bar starvation', armedBand.starvationTotal <= baselineBand.starvationTotal + 2);
check('cost bar median', armedBand.medianDays >= 0.8 * baselineBand.medianDays);
check('summary costBar', eq(summary.gates.costBar, { starvationOk: true, medianOk: true }) || (summary.gates.costBar.starvationOk === true && summary.gates.costBar.medianOk === true));
// Per-seed decompositions vs summary perSeed.
for (let i = 0; i < SEEDS.length; i++) {
  const p = perSeed[i], s = summary.perSeed[i];
  check(`perSeed ${p.seed} field4`, s.field4 === p.field4);
  check(`perSeed ${p.seed} tbInits4`, s.tbInits4 === p.tbInits4);
  check(`perSeed ${p.seed} limiters`, eq(s.limiters, p.limiters), { summary: s.limiters, recomputed: p.limiters });
  check(`perSeed ${p.seed} dominant`, s.dominant === p.dominant && s.dominantN === p.dominantN);
  check(`perSeed ${p.seed} fullyDecomposed`, s.fullyDecomposed === p.fullyDecomposed);
  check(`perSeed ${p.seed} checks`, eq(s.checks, p.checks));
  check(`perSeed ${p.seed} field rows sum identity`, p.fieldRows.every(r => r.sumOk));
  check(`perSeed ${p.seed} field rows source identity numeric`, p.fieldRows.every(r => (r.volleyDmg + r.allyDmg + r.closeInDmg) === r.totalDmg));
  check(`perSeed ${p.seed} tb rows count`, s.tbRowsDetail.length === p.tbRowsDetail.length);
  // Independent limiter spot re-derivation on field rows.
  for (const r of p.fieldRows) {
    let expected;
    if (r.totalDmg === 0) expected = 'ZERO-HIT';
    else if (r.roundsToKill != null && r.roundsToKill > 15) expected = 'DPS-TOO-LOW';
    else expected = 'TRUNCATED';
    check(`field limiter ${p.seed} d${r.day} ${r.mid}`, r.limiter === expected, { row: r.limiter, expected });
  }
  for (const r of p.tbRowsDetail) {
    let expected;
    if (!r.hasEndRow) expected = 'UNENDED';
    else if (r.netDmg == null) expected = 'UNMEASURED-END-MISSING';
    else if (r.startHp > 0 && r.netDmg < 0.10 * r.startHp) expected = 'DPS-TOO-LOW';
    else expected = 'TRUNCATED';
    check(`tb limiter ${p.seed} d${r.day} ${r.mid}`, r.limiter === expected, { row: r.limiter, expected });
  }
}
// Band totals.
const bandLimiters = {};
for (const p of perSeed) for (const k of Object.keys(p.limiters)) bandLimiters[k] = (bandLimiters[k] || 0) + p.limiters[k];
check('summary bandLimiters', eq(summary.bandLimiters, bandLimiters), { summary: summary.bandLimiters, recomputed: bandLimiters });
let bd = null, bn = 0;
for (const k of Object.keys(bandLimiters)) if (bandLimiters[k] > bn) { bd = k; bn = bandLimiters[k]; }
check('summary bandDominant', summary.bandDominant === bd && summary.bandDominantN === bn);
const fullyDecomposedSeeds = perSeed.filter(p => p.fullyDecomposed).length;
check('summary fullyDecomposedSeeds', summary.fullyDecomposedSeeds === fullyDecomposedSeeds);
const allField = perSeed.flatMap(p => p.fieldRows);
const allTb = perSeed.flatMap(p => p.tbRowsDetail);
const bfs = summary.bandFieldStats;
check('band field fights', bfs.fights === allField.length);
check('band field dmg range', bfs.dmgMin === Math.min.apply(null, allField.map(r => r.totalDmg)) && bfs.dmgMax === Math.max.apply(null, allField.map(r => r.totalDmg)));
check('band field dmg median', bfs.dmgMedian === medianOf(allField.map(r => r.totalDmg)));
check('band field startHp median', bfs.startHpMedian === medianOf(allField.filter(r => r.startHp != null).map(r => r.startHp)));
check('band field dps median', bfs.dpsMedian === medianOf(allField.filter(r => r.totalDmg > 0).map(r => r.dps)));
check('band field rtk median', bfs.rtkMedian === medianOf(allField.filter(r => r.roundsToKill != null).map(r => r.roundsToKill)));
check('band field source totals', bfs.volleyTotal === allField.reduce((t, r) => t + r.volleyDmg, 0) && bfs.allyTotal === allField.reduce((t, r) => t + r.allyDmg, 0) && bfs.closeInTotal === allField.reduce((t, r) => t + r.closeInDmg, 0) && bfs.totalTotal === allField.reduce((t, r) => t + r.totalDmg, 0));
check('band field noAlly', bfs.noAlly === allField.filter(r => !r.calledHelp && !r.allyVid && (r.optsAllies | 0) === 0).length);
check('band field intentLearn', bfs.intentLearn === allField.filter(r => r.intent === 'learn').length);
check('band field woundsInPositive', bfs.woundsInPositive === allField.filter(r => (r.woundsIn || 0) > 0).length);
check('band field unknownGear', bfs.unknownGear === allField.filter(r => r.armorP == null && r.wbMelee == null).length);
check('band field sumFail', bfs.sumFail === allField.filter(r => !r.sumOk).length);
const bts = summary.bandTbStats;
check('band tb fights', bts.fights === allTb.length);
check('band tb netFrac median', bts.netFracMedian === medianOf(allTb.filter(r => r.netFrac != null).map(r => r.netFrac)));
check('band tb unmeasured', bts.unmeasured === allTb.filter(r => r.limiter === 'UNMEASURED-END-MISSING' || r.limiter === 'UNENDED').length);
// Rounds-to-kill arithmetic.
const rtk = summary.rtkArithmetic;
check('rtk medians', rtk.medianStartHp === bfs.startHpMedian && rtk.medianDps === bfs.dpsMedian);
check('rtk at medians', rtk.roundsToKillAtMedians === ((bfs.startHpMedian > 0 && bfs.dpsMedian > 0) ? Math.ceil(bfs.startHpMedian / bfs.dpsMedian) : null));
check('rtk per-fight median', rtk.medianPerFightRtk === bfs.rtkMedian);
check('rtk cap', rtk.fieldRoundCap === 15);
// Verdict rule.
const expectedVerdict = (fullyDecomposedSeeds >= 6 && bd && rtk.roundsToKillAtMedians != null) ? 'DIAG-GO' : 'DIAG-NO-GO';
check('verdict', summary.verdict === expectedVerdict, { summary: summary.verdict, expected: expectedVerdict });
// No unattributed fights hidden: every tb initiation has a row; every
// field fight counted; unattributed damage counted (tb net + close-in).
const tbInitTotal = perSeed.reduce((t, p) => t + p.tbInits4, 0);
check('tb rows cover initiations', allTb.length === tbInitTotal);
const fieldTotal = perSeed.reduce((t, p) => t + p.field4, 0);
check('field rows cover wave4enc count', allField.length === fieldTotal);
console.log(`\ntest-w4dmg-a: ${PASS} PASS, ${FAIL} FAIL`);
if (FAIL) process.exit(1);
