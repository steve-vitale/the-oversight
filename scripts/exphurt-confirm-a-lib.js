'use strict';
// exphurt-confirm-a-lib.js — pure confirm metrics for sim-exphurt-confirm-a
// (oversight-flesh-out-loop, run fleshout-20261104T1647Z, axis
// food-economy). Companion to scripts/exphurt-a-lib.js (UNCHANGED):
// this file adds ONLY the two metrics the prior arm's metric review
// pre-registered for the next run — D-at-last-hurt and M1-all.
// No RNG reads, no game-value writes: inputs are only read, never mutated.
//
// D-last: like D in exphurt-a-lib, but the expedition duration is the
// AT-LAST-HURT snapshot (expedDurationAtLastHurt), because the
// expedHurt cap lands DURING the episode (prior arm: Abderrazak open
// 20 vs 20, last-hurt 12 vs 20). Denominator: expedition-purpose cases
// with BOTH durations present at last hurt. A case whose exped record
// was absent at last hurt (duration null) is excluded from the
// denominator, never counted as connected or disconnected.
// M1-all: among ALL returned-hurt expedition cases, the share whose
// expeditionReturn line in the closing part mentions hurt. Unlike M1
// (denominator: announced expedition returns only), silent returns
// count as misses here, so the player-away silence branch is inside
// the metric instead of beside it.
const DISCONNECT_MIN_GAP = 2;

function disconnectOfLastHurt(expedDurationAtLastHurt, awayDuration) {
  const bothPresent = typeof expedDurationAtLastHurt === 'number' && typeof awayDuration === 'number';
  if (!bothPresent) return { bothPresent: false, gap: null, absGap: null, disconnected: false, expedShorter: false };
  const gap = awayDuration - expedDurationAtLastHurt;
  return { bothPresent: true, gap, absGap: Math.abs(gap), disconnected: Math.abs(gap) >= DISCONNECT_MIN_GAP, expedShorter: gap > 0 };
}

function summarizeLastHurt(cases) {
  const xs = (cases || []).filter((c) => c && c.purpose === 'expedition');
  const denom = xs.filter((c) => disconnectOfLastHurt(c.expedDurationAtLastHurt, c.awayDuration).bothPresent);
  const disc = denom.filter((c) => disconnectOfLastHurt(c.expedDurationAtLastHurt, c.awayDuration).disconnected);
  const shorter = denom.filter((c) => disconnectOfLastHurt(c.expedDurationAtLastHurt, c.awayDuration).expedShorter);
  const gaps = denom.map((c) => disconnectOfLastHurt(c.expedDurationAtLastHurt, c.awayDuration).gap).sort((a, b) => a - b);
  const medianGap = gaps.length ? gaps[Math.floor(gaps.length / 2)] : null;
  const share = (n, d) => (d ? n / d : null);
  return {
    expeditionCases: xs.length,
    disconnectDenomLastHurt: denom.length,
    disconnectedLastHurt: disc.length,
    DLast: share(disc.length, denom.length),
    expedShorterLastHurt: shorter.length,
    expedShorterShareLastHurt: share(shorter.length, denom.length),
    medianGapLastHurt: medianGap,
  };
}

function m1All(cases) {
  const rh = (cases || []).filter((c) => c && c.purpose === 'expedition' && c.outcome === 'returned-hurt');
  const hit = rh.filter((c) => (c.closingLines || []).some((l) => l.isExpeditionReturn && l.mentionsHurt));
  return {
    returnedHurtExpedition: rh.length,
    rhExpeditionLineMentionsHurtAll: hit.length,
    M1All: rh.length ? hit.length / rh.length : null,
  };
}

module.exports = { DISCONNECT_MIN_GAP, disconnectOfLastHurt, summarizeLastHurt, m1All };
