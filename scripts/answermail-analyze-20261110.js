// answermail-analyze-20261110.js — answer-the-mail verdict analyzer
// (arm sim-answermail-a, run fleshout-20261110T0615Z). Pure analysis
// over per-seed JSON written by answermail-driver-20261110.js. No game
// code, no sims.
//
// Attribution/reconciliation come from the trustgrowth v2 analyzer
// (required as a library — summarizeBand): trajectory classes,
// seasoned windows, polity blocking, gains/downs by cause, unattributed
// residue. This file adds only the JUDGEMENT: the preregged primary
// (seasoned links >= 5/8 on the armed leg), the fidelity gates, and
// the scalemetric cost bar (starvation + median survival), plus the
// wall numbers. Median is the STANDARD median (average of the two
// middle values for even n) — prereg amendment 1, correcting the
// trustgrowth text's 132 (the analyzer's upper median) to 120.5 on
// the control day list. The TG upper-median figure is reported
// alongside for comparability only.
// Usage:
//   node scripts/answermail-analyze-20261110.js [perseed-dir]
//     [base-run] [armed-run]
//   Defaults: evidence/2026-11-10/perseed-answermail-a,
//     answermail-base, answermail-armed.
// Prints the verdict and writes answermail-verdict.json next to the
// per-seed files. Exit 0 on GO, 1 on NO-GO, 2 on a failed fidelity
// gate (run-invalid).
'use strict';
const fs = require('fs');
const path = require('path');
const TG = require('./trustgrowth-analyze-20261109');

const DIR = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-11-10', 'perseed-answermail-a');
const BASE_RUN = process.argv[3] || 'answermail-base';
const ARMED_RUN = process.argv[4] || 'answermail-armed';
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }).filter(Number.isFinite) : [99101, 99102, 99103, 99104, 99105, 99106, 99107, 99108]);

function loadLeg(run) {
  const rows = [];
  for (const seed of SEEDS) {
    const fp = path.join(DIR, 'answermail-s' + seed + '-' + run + '.json');
    if (!fs.existsSync(fp)) throw new Error('missing per-seed file: ' + fp);
    rows.push(JSON.parse(fs.readFileSync(fp, 'utf8')));
  }
  return rows;
}
function starvation(r) { return ((r.teleDeaths || []).filter(function (e) { return e && e.cause === 'starvation'; })).length; }

// Standard median (average of the two middle values for even n).
// The trustgrowth analyzer's medianSurvival is the UPPER median
// (sorted[floor(n/2)]), which misreports this band as 132 where the
// per-seed list sorts to 120.5 (secondlink-a metric review). The cost
// bar uses the standard median; the TG figure is reported alongside
// for comparability only.
function medianStd(days) {
  const s = days.slice().sort(function (a, b) { return a - b; });
  if (!s.length) return null;
  const mid = Math.floor(s.length / 2);
  return (s.length % 2) ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

function legSummary(rows, run) {
  const files = rows.map(function (r) { return path.join(DIR, 'answermail-s' + r.seed + '-' + run + '.json'); });
  const band = TG.summarizeBand(files.map(function (f) { return f; }));
  // summarizeBand re-reads the files; use its output for classes/wall.
  const perSeed = rows.map(function (r, i) {
    const s = band.seeds[i];
    return {
      seed: r.seed, days: r.days, gameDays: r.gameDays, endReason: r.endReason,
      won: !!r.won, scaleRank: r.scaleRank, maxWave: r.maxWave, unlockedWave: r.unlockedWave,
      standing: r.standing, starvation: starvation(r), deaths: (r.teleDeaths || []).length,
      links: s.links.map(function (l) { return { other: l.other, class: l.class, born: l.born, peak: l.peak, end: l.end, seasonedEver: l.seasonedEver, formedDay: l.formedDay }; }),
      seasoned: s.links.filter(function (l) { return l.seasonedEver; }).length,
      polity: s.polity.polityEver ? (s.polity.polityEver.shape + ' d' + s.polity.polityFirstDay) : s.polity.reason,
      accordAnswers: ((r.answermailStats || {}).accordAnswers | 0),
      tends: ((r.answermailStats || {}).tends | 0),
      renegAnswers: ((r.answermailStats || {}).renegotiationAnswers | 0),
      demandAnswers: ((r.answermailStats || {}).demandAnswers | 0),
      instrumentErrors: (r.instrumentErrors || []).length,
    };
  });
  return {
    run: run, band: band, perSeed: perSeed,
    median: medianStd(rows.map(function (r) { return r.days; })),
    medianTG: band.medianSurvival,
    seasoned: perSeed.reduce(function (t, s) { return t + s.seasoned; }, 0),
    linksFormed: perSeed.reduce(function (t, s) { return t + s.links.length; }, 0),
    polities: perSeed.filter(function (s) { return s.polity !== 'never-seasoned' && s.polity !== 'seasoned-but-no-polity'; }).length,
    starvationTotal: perSeed.reduce(function (t, s) { return t + s.starvation; }, 0),
    accordAnswers: perSeed.reduce(function (t, s) { return t + s.accordAnswers; }, 0),
    tends: perSeed.reduce(function (t, s) { return t + s.tends; }, 0),
    renegAnswers: perSeed.reduce(function (t, s) { return t + s.renegAnswers; }, 0),
    demandAnswers: perSeed.reduce(function (t, s) { return t + s.demandAnswers; }, 0),
    instrumentErrors: perSeed.reduce(function (t, s) { return t + s.instrumentErrors; }, 0),
  };
}

function main() {
  const base = legSummary(loadLeg(BASE_RUN), BASE_RUN);
  const armed = legSummary(loadLeg(ARMED_RUN), ARMED_RUN);
  const armOnlyStarv = armed.perSeed.reduce(function (t, s, i) { return t + (base.perSeed[i].starvation === 0 ? s.starvation : 0); }, 0);
  const medianBar = 0.8 * (base.median || 0);
  const fidelity = {
    // Amendment 3: the gate is "every staged accord answered", i.e.
    // accord answers == links formed on the armed leg (a seed that
    // dies before any link forms stages no accord; 120116 forms 0).
    accordAnswersGeLinks: armed.accordAnswers >= armed.linksFormed && armed.accordAnswers > 0,
    tendsGt0: armed.tends > 0,
    renegSilenceZero: ((armed.band.downByCause || {})['renegotiation-silence'] || 0) === 0,
    instrumentErrorsZero: base.instrumentErrors === 0 && armed.instrumentErrors === 0,
    unattributedZero: (base.band.unattributedUp + base.band.unattributedDown + armed.band.unattributedUp + armed.band.unattributedDown) === 0,
  };
  const fidelityPass = Object.keys(fidelity).every(function (k) { return fidelity[k]; });
  const primaryThreshold = parseInt(process.env.PRIMARY_THRESHOLD || '5', 10) || 5;
  const primaryPass = armed.seasoned >= primaryThreshold;
  const costPass = armed.starvationTotal <= base.starvationTotal + 2
    && armOnlyStarv <= 2
    && (armed.median || 0) >= medianBar;
  const verdict = !fidelityPass ? 'INVALID (fidelity gate failed)'
    : (primaryPass && costPass ? 'GO' : 'NO-GO');

  const out = {
    baseRun: BASE_RUN, armedRun: ARMED_RUN, seeds: SEEDS,
    primary: { seasonedBase: base.seasoned, seasonedArmed: armed.seasoned, threshold: primaryThreshold, pass: primaryPass },
    costBar: {
      starvationBase: base.starvationTotal, starvationArmed: armed.starvationTotal,
      starvationCap: base.starvationTotal + 2, starvationArmOnly: armOnlyStarv, starvationArmOnlyCap: 2,
      medianBase: base.median, medianArmed: armed.median, medianBar: medianBar,
      medianTGBase: base.medianTG, medianTGArmed: armed.medianTG,
      pass: costPass,
    },
    fidelity: fidelity, fidelityPass: fidelityPass,
    wall: {
      base: { wins: base.band.wins, national: base.band.national, table: base.band.table, w4: base.band.wave4unlocks, w5: base.band.wave5unlocks, median: base.median, medianTG: base.medianTG, polities: base.polities },
      armed: { wins: armed.band.wins, national: armed.band.national, table: armed.band.table, w4: armed.band.wave4unlocks, w5: armed.band.wave5unlocks, median: armed.median, medianTG: armed.medianTG, polities: armed.polities },
    },
    gainsByCause: { base: base.band.gainByCause, armed: armed.band.gainByCause },
    downsByCause: { base: base.band.downByCause, armed: armed.band.downByCause },
    classes: { base: base.band.classes, armed: armed.band.classes },
    perSeed: { base: base.perSeed, armed: armed.perSeed },
    verdict: verdict,
  };

  console.log('BASE  ' + BASE_RUN + ': seasoned=' + base.seasoned + '/' + base.linksFormed + ' links, polities=' + base.polities
    + ', starvation=' + base.starvationTotal + ', median=' + base.median + ' (TG upper ' + base.medianTG + ')'
    + ', wins=' + base.band.wins + ' national=' + base.band.national + ' w4=' + base.band.wave4unlocks + ' w5=' + base.band.wave5unlocks);
  console.log('ARMED ' + ARMED_RUN + ': seasoned=' + armed.seasoned + '/' + armed.linksFormed + ' links, polities=' + armed.polities
    + ', starvation=' + armed.starvationTotal + ' (arm-only ' + armOnlyStarv + '), median=' + armed.median + ' (TG upper ' + armed.medianTG + ')'
    + ', wins=' + armed.band.wins + ' national=' + armed.band.national + ' w4=' + armed.band.wave4unlocks + ' w5=' + armed.band.wave5unlocks);
  console.log('FIDELITY accordAnswers=' + armed.accordAnswers + ' linksFormed=' + armed.linksFormed + ' (all staged answered: ' + fidelity.accordAnswersGeLinks + ')'
    + ' tends=' + armed.tends + ' (>0: ' + fidelity.tendsGt0 + ')'
    + ' renegSilence=' + ((armed.band.downByCause || {})['renegotiation-silence'] || 0) + ' (=0: ' + fidelity.renegSilenceZero + ')'
    + ' instrErrors=' + (base.instrumentErrors + armed.instrumentErrors) + ' unattributed=' + (base.band.unattributedUp + base.band.unattributedDown + armed.band.unattributedUp + armed.band.unattributedDown));
  console.log('GAINS base=' + JSON.stringify(base.band.gainByCause) + ' armed=' + JSON.stringify(armed.band.gainByCause));
  console.log('DOWNS base=' + JSON.stringify(base.band.downByCause) + ' armed=' + JSON.stringify(armed.band.downByCause));
  armed.perSeed.forEach(function (s, i) {
    const b = base.perSeed[i];
    console.log('seed ' + s.seed + ' base days=' + b.days + ' seasoned=' + b.seasoned + ' starv=' + b.starvation
      + ' | armed days=' + s.days + ' seasoned=' + s.seasoned + ' starv=' + s.starvation
      + ' accord=' + s.accordAnswers + ' tend=' + s.tends + ' reneg=' + s.renegAnswers + ' demand=' + s.demandAnswers
      + ' links=' + JSON.stringify(s.links.map(function (l) { return l.other + ':' + l.class + '(' + l.born + '->' + l.peak + '->' + l.end + ')'; })));
  });
  console.log('VERDICT: ' + verdict + ' (primary ' + (primaryPass ? 'PASS' : 'FAIL') + ' ' + armed.seasoned + '>=' + primaryThreshold + '; cost ' + (costPass ? 'PASS' : 'FAIL') + ')');
  const outFile = path.join(DIR, 'answermail-verdict.json');
  fs.writeFileSync(outFile, JSON.stringify(out, null, 2) + '\n');
  console.log('wrote ' + outFile);
  if (!fidelityPass) process.exitCode = 2;
  else if (!(primaryPass && costPass)) process.exitCode = 1;
}

if (require.main === module) main();
module.exports = { legSummary: legSummary };
