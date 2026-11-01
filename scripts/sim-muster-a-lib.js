'use strict';
// sim-muster-a-lib — pure helpers shared by the sim-muster-a sweep and
// its proof test. NO game state, NO IO: every function takes plain data
// and returns plain data, so the proof test can exercise the exact
// counting/classification rules on fixtures.
//
// Rules transcribed from src/js/titans.js (soundTitanCall, 2026-10-13
// haven note, titanSelfActions offer condition) — NOT designed here:
//   refuse a link iff trust < 25 OR opinion < -10 OR arrears > 0
//   quota = 6 iff trust >= trustedAt (70) AND opinion >= trustedOpinion (10), else 2
//   yield per link = min(quota - already, facesFree), floored at 0; refused links yield 0
//   call offered iff omen stage >= 2 and titan not slain
//   muster size = alliesUnique + havenValid
function hypotheticalYield(links, cfg, alreadyByVillage) {
  const c = cfg || {};
  const base = (c.baseBlades == null ? 2 : c.baseBlades);
  const trusted = (c.trustedBlades == null ? 6 : c.trustedBlades);
  const trustedAt = (c.trustedAt == null ? 70 : c.trustedAt);
  const trustedOpinion = (c.trustedOpinion == null ? 10 : c.trustedOpinion);
  const out = { links: [], total: 0 };
  (links || []).forEach(function (l) {
    if (!l) return;
    const trust = l.trust || 0, opinion = l.opinion || 0, arrears = l.arrears || 0;
    const wouldRefuse = (trust < 25 || opinion < -10 || arrears > 0);
    const quota = (trust >= trustedAt && opinion >= trustedOpinion) ? trusted : base;
    const already = (alreadyByVillage && alreadyByVillage[l.villageId]) || 0;
    const facesFree = l.facesFree || 0;
    const wouldYield = wouldRefuse ? 0 : Math.max(0, Math.min(quota - already, facesFree));
    const reason = wouldRefuse
      ? (trust < 25 ? 'trust' : (opinion < -10 ? 'opinion' : 'arrears'))
      : (facesFree <= 0 ? 'no-free-faces' : (quota - already <= 0 ? 'quota-filled' : 'would-answer'));
    out.links.push({ villageId: l.villageId, trust: trust, opinion: opinion, arrears: arrears,
      quota: quota, facesFree: facesFree, already: already, wouldRefuse: wouldRefuse,
      wouldYield: wouldYield, refuseReason: wouldRefuse ? reason : null });
    out.total += wouldYield;
  });
  return out;
}

// Summarize a dawn-change trajectory (step function: each entry holds
// from that dawn until the next change) into max/end/first-positive.
function summarizeTrajectory(changes, endSize) {
  let max = 0, firstPositiveDay = null;
  (changes || []).forEach(function (c) {
    if (c.size > max) max = c.size;
    if (firstPositiveDay == null && c.size > 0) firstPositiveDay = c.day;
  });
  if (endSize != null && endSize > max) max = endSize;
  return { maxSize: max, endSize: (endSize == null ? null : endSize), firstPositiveDay: firstPositiveDay };
}

// First-blade blocker classification (prereg priority order).
// seed: { callsSounded, commits, titans: [{ tid, omenStageMax, musterMax, need,
//   firstOmen2Day, yieldAtFirstOmen2, yieldAtEnd, refusals }] }
// Returns { cls, detail } with cls in A-NO-OPPORTUNITY, B-OFFERED-NOT-SOUNDED,
// C-CALLED-NO-ANSWERS, D-PARTIAL-THEN-LOST, E-FORMED-THEN-STOOD-DOWN, LIVE-READY.
function classifySeed(s) {
  const titans = s.titans || [];
  const anyPositive = titans.some(function (t) { return (t.musterMax || 0) > 0; });
  const anyReady = titans.some(function (t) { return (t.musterMax || 0) >= (t.need || 999); });
  if (anyReady) return { cls: 'E-FORMED-THEN-STOOD-DOWN', detail: 'a muster reached need at some dawn (see trajectory for whether it still stands at end)' };
  if (anyPositive) return { cls: 'D-PARTIAL-THEN-LOST', detail: 'a muster formed above 0 but never reached need' };
  if ((s.callsSounded || 0) > 0) return { cls: 'C-CALLED-NO-ANSWERS', detail: 'call sounded but zero joins on every call' };
  const anyOffered = titans.some(function (t) { return (t.omenStageMax || 0) >= 2; });
  if (anyOffered) return { cls: 'B-OFFERED-NOT-SOUNDED', detail: 'call offered (omen stage >= 2) but never sounded, no commits' };
  return { cls: 'A-NO-OPPORTUNITY', detail: 'no titan ever reached omen stage >= 2 and no refusal occurred' };
}

module.exports = { hypotheticalYield, summarizeTrajectory, classifySeed };
