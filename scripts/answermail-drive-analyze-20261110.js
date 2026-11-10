// answermail-drive-analyze-20261110.js — answer-the-mail DRIVE verdict analyzer
// (arm sim-answermail-drive-a, run fleshout-20261110T1215Z). Pure analysis
// over per-seed JSON written by answermail-drive-driver-20261110.js. No game
// code, no sims.
//
// Attribution/reconciliation come from the trustgrowth v3 analyzer
// (summarizeBand): trajectory classes, seasoned windows, polity blocking,
// gains/downs by cause, unattributed residue. This file adds only the
// JUDGEMENT: the preregged primary (GO candidate: seasoned >= 3/8 armed
// vs <= 1/8 control; NO-GO: armed <= control; anything else
// INCONCLUSIVE), the fidelity gates (including the drive-off proof: no
// drive stats on any control leg), and the scalemetric cost bar
// (starvation + median survival), plus the drive secondaries
// (accord-pending days from the unified event log, blocked-no-answerer
// days, answerer roster) and the wall numbers. Median is the STANDARD
// median (average of the two middle values for even n) — prereg
// amendment 1 of answermail-a; the TG upper-median figure is reported
// alongside for comparability only.
// Usage:
//   node scripts/answermail-drive-analyze-20261110.js [perseed-dir]
//     [base-run] [armed-run]
//   Defaults: evidence/2026-11-10/perseed-answermail-drive-a,
//     answermail-drive-base, answermail-drive-armed.
// Prints the verdict and writes answermail-drive-verdict.json next to
// the per-seed files. Exit 0 on GO candidate, 1 on NO-GO/INCONCLUSIVE,
// 2 on a failed fidelity gate (run-invalid).
'use strict';
const fs = require('fs');
const path = require('path');
const TG = require('./trustgrowth-analyze-20261109');

const DIR = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-11-10', 'perseed-answermail-drive-a');
const BASE_RUN = process.argv[3] || 'answermail-drive-base';
const ARMED_RUN = process.argv[4] || 'answermail-drive-armed';
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }).filter(Number.isFinite) : [150201, 150202, 150203, 150204, 150205, 150206, 150207, 150208]);

function loadLeg(run) {
  const rows = [];
  for (const seed of SEEDS) {
    const fp = path.join(DIR, 'answermail-drive-s' + seed + '-' + run + '.json');
    if (!fs.existsSync(fp)) throw new Error('missing per-seed file: ' + fp);
    rows.push(JSON.parse(fs.readFileSync(fp, 'utf8')));
  }
  return rows;
}
function starvation(r) { return ((r.teleDeaths || []).filter(function (e) { return e && e.cause === 'starvation'; })).length; }

// Standard median (average of the two middle values for even n).
function medianStd(days) {
  const s = days.slice().sort(function (a, b) { return a - b; });
  if (!s.length) return null;
  const mid = Math.floor(s.length / 2);
  return (s.length % 2) ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

// Accord-pending days per link: formation day (TG link timeline) to the
// day the unified event log shows the accord gift landing (any unified
// event whose caller stack runs through the accord verb — the stack test
// dodges the cause map's gift/visit ambiguity at delta 8). Unanswered
// links report pendingDays null and unansweredDays = last day - formed.
function accordPendingDays(row, tgLink) {
  try {
    const unified = TG.unifyEvents(row);
    const formed = tgLink.formedDay;
    let answerDay = null;
    for (const ev of unified) {
      if (!ev || ev.linkId !== tgLink.id) continue;
      if (typeof ev.stack === 'string' && /answerAccord/.test(ev.stack)) {
        if (answerDay == null || ev.day < answerDay) answerDay = ev.day;
      }
    }
    if (answerDay == null) {
      const lastDay = row.gameDays || row.days || 0;
      return { pendingDays: null, unansweredDays: lastDay - formed, answered: false };
    }
    return { pendingDays: answerDay - formed, unansweredDays: 0, answered: true };
  } catch (e) { return { pendingDays: null, unansweredDays: null, answered: false, error: String(e.message).slice(0, 80) }; }
}

function legSummary(rows, run) {
  const files = rows.map(function (r) { return path.join(DIR, 'answermail-drive-s' + r.seed + '-' + run + '.json'); });
  const band = TG.summarizeBand(files);
  const perSeed = rows.map(function (r, i) {
    const s = band.seeds[i];
    const ds = r.driveStats || null;
    const links = s.links.map(function (l) {
      const ap = accordPendingDays(r, l);
      return { id: l.id || null, other: l.other, class: l.class, born: l.born, peak: l.peak, end: l.end, seasonedEver: l.seasonedEver, formedDay: l.formedDay, accordPendingDays: ap.pendingDays, accordUnansweredDays: ap.unansweredDays, accordAnswered: ap.answered };
    });
    return {
      seed: r.seed, days: r.days, gameDays: r.gameDays, endReason: r.endReason,
      won: !!r.won, scaleRank: r.scaleRank, maxWave: r.maxWave, unlockedWave: r.unlockedWave,
      standing: r.standing, starvation: starvation(r), deaths: (r.teleDeaths || []).length,
      links: links,
      seasoned: s.links.filter(function (l) { return l.seasonedEver; }).length,
      polity: s.polity.polityEver ? (s.polity.polityEver.shape + ' d' + s.polity.polityFirstDay) : s.polity.reason,
      driveStatsPresent: !!ds,
      accordAnswers: ds ? (ds.accordAnswers | 0) : 0,
      tends: ds ? (ds.tends | 0) : 0,
      renegAnswers: ds ? (ds.renegotiationAnswers | 0) : 0,
      demandAnswers: ds ? (ds.demandAnswers | 0) : 0,
      blockedNoAnswerer: ds ? (((ds.blockedDays || {}).noAnswerer | 0)) : 0,
      tendsBlockedPantry: ds ? (ds.tendsBlockedPantry | 0) : 0,
      driveErrors: ds ? (ds.errors | 0) : 0,
      answerers: ds ? (ds.answerers || {}) : {},
      answererNames: ds ? (ds.answererNames || {}) : {},
      instrumentErrors: (r.instrumentErrors || []).length,
    };
  });
  return {
    run: run, band: band, perSeed: perSeed,
    median: medianStd(rows.map(function (r) { return r.days; })),
    medianTG: band.medianSurvival,
    seasoned: perSeed.reduce(function (t, s) { return t + s.seasoned; }, 0),
    linksFormed: perSeed.reduce(function (t, s) { return t + s.links.length; }, 0),
    polities: perSeed.filter(function (s) { return / d\d+$/.test(s.polity); }).length,
    starvationTotal: perSeed.reduce(function (t, s) { return t + s.starvation; }, 0),
    accordAnswers: perSeed.reduce(function (t, s) { return t + s.accordAnswers; }, 0),
    tends: perSeed.reduce(function (t, s) { return t + s.tends; }, 0),
    renegAnswers: perSeed.reduce(function (t, s) { return t + s.renegAnswers; }, 0),
    demandAnswers: perSeed.reduce(function (t, s) { return t + s.demandAnswers; }, 0),
    blockedNoAnswerer: perSeed.reduce(function (t, s) { return t + s.blockedNoAnswerer; }, 0),
    driveErrors: perSeed.reduce(function (t, s) { return t + s.driveErrors; }, 0),
    instrumentErrors: perSeed.reduce(function (t, s) { return t + s.instrumentErrors; }, 0),
    driveStatsPresent: perSeed.filter(function (s) { return s.driveStatsPresent; }).length,
  };
}

function main() {
  const base = legSummary(loadLeg(BASE_RUN), BASE_RUN);
  const armed = legSummary(loadLeg(ARMED_RUN), ARMED_RUN);
  const armOnlyStarv = armed.perSeed.reduce(function (t, s, i) { return t + (base.perSeed[i].starvation === 0 ? s.starvation : 0); }, 0);
  const medianBar = 0.8 * (base.median || 0);
  const fidelity = {
    // Every staged accord answered by the drive: accord answers ==
    // links formed on the armed leg (a seed that dies before any link
    // forms stages no accord).
    accordAnswersEqLinks: armed.accordAnswers === armed.linksFormed && armed.linksFormed > 0,
    tendsGt0: armed.tends > 0,
    renegSilenceZero: ((armed.band.downByCause || {})['renegotiation-silence'] || 0) === 0,
    instrumentErrorsZero: base.instrumentErrors === 0 && armed.instrumentErrors === 0,
    unattributedZero: (base.band.unattributedUp + base.band.unattributedDown + armed.band.unattributedUp + armed.band.unattributedDown) === 0,
    // Drive-off proof: no drive stats object on ANY control leg.
    driveOffOnControl: base.driveStatsPresent === 0,
    driveErrorsZero: armed.driveErrors === 0,
  };
  const fidelityPass = Object.keys(fidelity).every(function (k) { return fidelity[k]; });
  // Prereg primary: GO candidate iff armed >= 3/8 AND control <= 1/8;
  // NO-GO iff armed <= control; anything else INCONCLUSIVE.
  const goCandidate = armed.seasoned >= 3 && base.seasoned <= 1;
  const noGo = armed.seasoned <= base.seasoned;
  const costPass = armed.starvationTotal <= base.starvationTotal + 2
    && armOnlyStarv <= base.starvationTotal
    && (armed.median || 0) >= medianBar;
  const primaryPass = goCandidate && costPass;
  const verdict = !fidelityPass ? 'INVALID (fidelity gate failed)'
    : (primaryPass ? 'GO candidate'
    : (noGo ? 'NO-GO' : 'INCONCLUSIVE'));

  const out = {
    baseRun: BASE_RUN, armedRun: ARMED_RUN, seeds: SEEDS,
    primary: { seasonedBase: base.seasoned, seasonedArmed: armed.seasoned, goCandidate: goCandidate, noGo: noGo, costPass: costPass, pass: primaryPass },
    costBar: {
      starvationBase: base.starvationTotal, starvationArmed: armed.starvationTotal,
      starvationCap: base.starvationTotal + 2, starvationArmOnly: armOnlyStarv, starvationArmOnlyCap: base.starvationTotal,
      medianBase: base.median, medianArmed: armed.median, medianBar: medianBar,
      medianTGBase: base.medianTG, medianTGArmed: armed.medianTG,
      pass: costPass,
    },
    fidelity: fidelity, fidelityPass: fidelityPass,
    drive: {
      blockedNoAnswerer: armed.blockedNoAnswerer,
      answerers: armed.perSeed.map(function (s) { return { seed: s.seed, answerers: s.answerers, names: s.answererNames }; }),
      accordPendingDays: armed.perSeed.map(function (s) { return { seed: s.seed, links: s.links.map(function (l) { return { other: l.other, formedDay: l.formedDay, pendingDays: l.accordPendingDays, unansweredDays: l.accordUnansweredDays }; }) }; }),
      accordPendingDaysBase: base.perSeed.map(function (s) { return { seed: s.seed, links: s.links.map(function (l) { return { other: l.other, formedDay: l.formedDay, pendingDays: l.accordPendingDays, unansweredDays: l.accordUnansweredDays }; }) }; }),
    },
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
    + ', wins=' + base.band.wins + ' national=' + base.band.national + ' w4=' + base.band.wave4unlocks + ' w5=' + base.band.wave5unlocks
    + ', driveStatsPresent=' + base.driveStatsPresent + '/8 (must be 0)');
  console.log('ARMED ' + ARMED_RUN + ': seasoned=' + armed.seasoned + '/' + armed.linksFormed + ' links, polities=' + armed.polities
    + ', starvation=' + armed.starvationTotal + ' (arm-only ' + armOnlyStarv + '), median=' + armed.median + ' (TG upper ' + armed.medianTG + ')'
    + ', wins=' + armed.band.wins + ' national=' + armed.band.national + ' w4=' + armed.band.wave4unlocks + ' w5=' + armed.band.wave5unlocks
    + ', blockedNoAnswerer=' + armed.blockedNoAnswerer + ' days');
  console.log('FIDELITY accordAnswers=' + armed.accordAnswers + ' linksFormed=' + armed.linksFormed + ' (==: ' + fidelity.accordAnswersEqLinks + ')'
    + ' tends=' + armed.tends + ' (>0: ' + fidelity.tendsGt0 + ')'
    + ' renegSilence=' + ((armed.band.downByCause || {})['renegotiation-silence'] || 0) + ' (=0: ' + fidelity.renegSilenceZero + ')'
    + ' instrErrors=' + (base.instrumentErrors + armed.instrumentErrors) + ' unattributed=' + (base.band.unattributedUp + base.band.unattributedDown + armed.band.unattributedUp + armed.band.unattributedDown)
    + ' driveOffControl=' + fidelity.driveOffOnControl + ' driveErrors=' + armed.driveErrors);
  console.log('GAINS base=' + JSON.stringify(base.band.gainByCause) + ' armed=' + JSON.stringify(armed.band.gainByCause));
  console.log('DOWNS base=' + JSON.stringify(base.band.downByCause) + ' armed=' + JSON.stringify(armed.band.downByCause));
  armed.perSeed.forEach(function (s, i) {
    const b = base.perSeed[i];
    console.log('seed ' + s.seed + ' base days=' + b.days + ' seasoned=' + b.seasoned + ' starv=' + b.starvation
      + ' | armed days=' + s.days + ' seasoned=' + s.seasoned + ' starv=' + s.starvation
      + ' accord=' + s.accordAnswers + ' tend=' + s.tends + ' reneg=' + s.renegAnswers + ' demand=' + s.demandAnswers
      + ' blocked=' + s.blockedNoAnswerer
      + ' links=' + JSON.stringify(s.links.map(function (l) { return l.other + ':' + l.class + '(' + l.born + '->' + l.peak + '->' + l.end + ',pend' + (l.accordPendingDays == null ? 'NA' : l.accordPendingDays) + 'd)'; })));
  });
  console.log('VERDICT: ' + verdict + ' (GO candidate ' + (goCandidate ? 'YES' : 'no') + ' ' + armed.seasoned + '>=3 & ' + base.seasoned + '<=1; cost ' + (costPass ? 'PASS' : 'FAIL') + ')');
  const outFile = path.join(DIR, 'answermail-drive-verdict.json');
  fs.writeFileSync(outFile, JSON.stringify(out, null, 2) + '\n');
  console.log('wrote ' + outFile);
  if (!fidelityPass) process.exitCode = 2;
  else if (!primaryPass) process.exitCode = 1;
}

if (require.main === module) main();
module.exports = { legSummary: legSummary, accordPendingDays: accordPendingDays };
