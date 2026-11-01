#!/usr/bin/env node
// analyze-gatecover-b.js — MARGIN RE-SCORING analyzer for sim-gatecover-b.
// (DIAG ONLY.) Reads depositgate-b-driver .jsonl on stdin (one JSON
// object per line, one seed per line, armed arm) and prints a JSON
// summary to stdout. No game load, no file writes, no RNG. Pure
// functions are exported for scripts/test-gatecover-b.js.
//
// This analyzer REUSES scripts/analyze-falsefire-b.js verbatim
// (candidate/eligibility/final-run counting, tolerance confirmation,
// settled false-fire classification, recovery scan) and adds ONLY
// the margin-recovery layer fixed in
// evidence/2026-11-01/sim-gatecover-b-prereg.md:
//
//   MARGIN RECOVERY in C+1..C+10 (C = confirmedDay, L = candidate
//   level) iff EITHER (a) some evening P >= 1.05 * L (margin breach,
//   the tolerance rule's 105% threshold), OR (b) two consecutive
//   evenings (by loopDay) both with P >= L (sustained at-level
//   pair, the tolerance rule's durability test). A single evening
//   at or above L, below 1.05 * L, undone the next evening, is
//   NOISE, not a recovery. Margin recovery is a SUBSET of settled
//   recovery (any evening >= L): it can only flip false -> true,
//   never true -> false, and never changes confirmation.
//   Margin class: collapsed -> true; margin recovery -> false;
//   else -> true. Margin censoring mirrors the settled rule:
//   fewer than 10 observed evenings and no margin recovery seen
//   = true as observed, flagged censored, excluded from the
//   judged denominator (falsefire conservative rule).
//
// Gate-condition helper (pure, for the proof test and the Q1
// trace reading): gateEngaged(on, freshDays, hungryStreak) =
// on && freshDays > 4 && hungryStreak < 3, i.e. _depositGateOn
// AND prodThrottleEngaged as coded in src/js/game.js.
'use strict';

const { analyzeSeedFalsefire, recoveryAfterConfirmation } = require('./analyze-falsefire-b');

const MARGIN = 1.05;
const RECOVERY_HORIZON = 10;

// Margin recovery scan over an evening series [{loopDay, pantryKcal}].
// Returns {recovered, recoveryDay, reason, observedEvenings, censored}.
// reason: null | 'margin' | 'sustained'. recoveryDay is the day the
// rule first trips: the breach day for (a), the second day of the
// pair for (b). Null/missing evenings are skipped (they cannot show
// a recovery) and BREAK consecutiveness for (b), exactly as the
// tolerance rule treats window rows.
function marginRecovery(series, confirmedDay, level) {
  const out = { recovered: false, recoveryDay: null, reason: null, observedEvenings: 0, censored: false };
  if (confirmedDay == null || typeof level !== 'number') return out;
  let prev = null; // {loopDay, pantryKcal} of the previous OBSERVED evening in the horizon
  for (let d = confirmedDay + 1; d <= confirmedDay + RECOVERY_HORIZON; d++) {
    const row = (series || []).find((r) => r != null && r.loopDay === d);
    if (row == null || typeof row.pantryKcal !== 'number') { prev = null; continue; }
    out.observedEvenings++;
    if (row.pantryKcal >= MARGIN * level) {
      out.recovered = true; out.recoveryDay = d; out.reason = 'margin'; return out;
    }
    if (prev != null && prev.loopDay + 1 === d &&
        prev.pantryKcal >= level && row.pantryKcal >= level) {
      out.recovered = true; out.recoveryDay = d; out.reason = 'sustained'; return out;
    }
    prev = row;
  }
  out.censored = out.observedEvenings < RECOVERY_HORIZON;
  return out;
}

function gateEngagedFromConditions(gateOn, freshDays, hungryStreak) {
  if (!gateOn) return false;
  if (typeof freshDays !== 'number' || typeof hungryStreak !== 'number') return false;
  return freshDays > 4 && hungryStreak < 3;
}

// Which gate condition fails? Returns 'engaged' | 'gate-off' |
// 'not-plenty' (freshDays <= 4) | 'hunger-exempt' (streak >= 3).
// Plenty is checked first only for reporting order; when both fail
// (fresh <= 4 AND streak >= 3) the label is 'not-plenty+exempt'.
function gateFailReason(gateOn, freshDays, hungryStreak) {
  if (!gateOn) return 'gate-off';
  const notPlenty = !(typeof freshDays === 'number' && freshDays > 4);
  const exempt = typeof hungryStreak === 'number' && hungryStreak >= 3;
  if (notPlenty && exempt) return 'not-plenty+exempt';
  if (notPlenty) return 'not-plenty';
  if (exempt) return 'hunger-exempt';
  return 'engaged';
}

function analyzeSeedGatecover(seedJson) {
  const a = analyzeSeedFalsefire(seedJson);
  const series = a.pantrySeries || [];
  const margin = a.confirmedDay != null
    ? marginRecovery(series, a.confirmedDay, a.candidateLevel)
    : { recovered: false, recoveryDay: null, reason: null, observedEvenings: 0, censored: false };
  let marginClass = null, marginReason = null;
  if (a.confirmedDay != null) {
    if (a.collapsed) { marginClass = 'true'; marginReason = 'collapsed'; }
    else if (margin.recovered) { marginClass = 'false'; marginReason = 'margin-recovery-' + margin.reason; }
    else { marginClass = 'true'; marginReason = 'sustained-slide'; }
  }
  const marginCensored = a.confirmedDay != null && marginClass === 'true' && margin.censored;
  return Object.assign({}, a, {
    marginRecovered: margin.recovered,
    marginRecoveryDay: margin.recoveryDay,
    marginRecoveryReason: margin.reason,
    marginObservedEvenings: margin.observedEvenings,
    marginCensored,
    marginClass, marginReason,
    marginFlipsSettled: a.fireClass != null && marginClass != null && a.fireClass !== marginClass,
  });
}

function summarizeGatecover(allSeeds) {
  const seeds = allSeeds.map((sj) => analyzeSeedGatecover(sj));
  const confirmed = seeds.filter((s) => s.confirmedDay != null);
  const settledFalse = confirmed.filter((s) => s.fireClass === 'false');
  const marginFalse = confirmed.filter((s) => s.marginClass === 'false');
  const marginCensoredTrue = confirmed.filter((s) => s.marginClass === 'true' && s.marginCensored);
  const settledCensoredTrue = confirmed.filter((s) => s.fireClass === 'true' && s.recoveryCensored);
  const judgedDenomMargin = confirmed.length - marginCensoredTrue.length;
  const judgedDenomSettled = confirmed.length - settledCensoredTrue.length;
  const rate = (num, den) => (den === 0 ? null : num / den);
  return {
    seeds,
    bars: {
      confirmedCount: confirmed.length,
      confirmedSeeds: confirmed.map((s) => s.seed),
      settledFalseSeeds: settledFalse.map((s) => s.seed),
      settledJudgedRate: rate(settledFalse.length, judgedDenomSettled),
      settledJudgedDenom: judgedDenomSettled,
      settledObservedRate: confirmed.length === 0 ? null : settledFalse.length / confirmed.length,
      marginFalseSeeds: marginFalse.map((s) => s.seed),
      marginJudgedRate: rate(marginFalse.length, judgedDenomMargin),
      marginJudgedDenom: judgedDenomMargin,
      marginObservedRate: confirmed.length === 0 ? null : marginFalse.length / confirmed.length,
      marginCensoredTrueSeeds: marginCensoredTrue.map((s) => s.seed),
      flippedSeeds: confirmed.filter((s) => s.marginFlipsSettled).map((s) => ({
        seed: s.seed, settledClass: s.fireClass, marginClass: s.marginClass,
        settledRecoveryDay: s.recoveryDay, marginRecoveryDay: s.marginRecoveryDay,
        marginRecoveryReason: s.marginRecoveryReason, candidateLevel: s.candidateLevel,
      })),
      extensionRestingCount: confirmed.filter((s) => s.extensionResting).length,
      extensionRestingSeeds: confirmed.filter((s) => s.extensionResting).map((s) => s.seed),
      sensitivityExcludingExtension: confirmed.length - confirmed.filter((s) => s.extensionResting).length,
    },
  };
}

if (require.main === module) {
  let text = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (c) => { text += c; });
  process.stdin.on('end', () => {
    const seeds = text.split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l));
    process.stdout.write(JSON.stringify(summarizeGatecover(seeds), null, 2) + '\n');
  });
}

module.exports = { MARGIN, RECOVERY_HORIZON, marginRecovery, gateEngagedFromConditions, gateFailReason, analyzeSeedGatecover, summarizeGatecover };
