// arrearsscreen-classify-20261102.js — pure arrears-only-block classifier
// for sim-arrearsscreen-a (Loop A 20261102T0725Z, axis scale-onramp).
// POLICY/INSTRUMENT ONLY: zero src/js changes. No game calls, no RNG,
// no mutation — safe to require from both the replay and the tests.
// Definition (frozen in evidence/2026-11-02/sim-arrearsscreen-a-prereg.md):
// a check row is an ARREARS-ONLY BLOCK iff ready is false AND at least
// one refusing link exists AND EVERY refusing link refuses SOLELY on
// arrears (trust >= 25 AND opinion >= -10 AND arrears > 0).
// Non-refusing links are not blockers. A not-ready row with no
// refusing link is 'not-ready-other', never arrears-blocked.
'use strict';

function classifyCheck(row) {
  const links = (row && row.links) || [];
  if (row && row.ready) return { blocked: false, blockKind: 'ready', blockers: [], refusing: [] };
  const refusing = links.filter(function (l) { return !!l.wouldRefuse; });
  if (!refusing.length) return { blocked: false, blockKind: 'not-ready-other', blockers: [], refusing: [] };
  const sole = refusing.filter(function (l) {
    return (l.trust || 0) >= 25 && (l.opinion || 0) >= -10 && (l.arrears || 0) > 0;
  });
  if (sole.length === refusing.length) {
    return { blocked: true, blockKind: 'arrears-only',
      blockers: sole.map(function (l) { return { villageId: l.villageId, name: l.name, direction: l.direction || null, trust: l.trust, opinion: l.opinion, arrears: l.arrears, quota: l.quota, contribution: l.contribution }; }),
      refusing: refusing.map(function (l) { return l.villageId; }) };
  }
  const mixed = refusing.filter(function (l) {
    return !((l.trust || 0) >= 25 && (l.opinion || 0) >= -10 && (l.arrears || 0) > 0);
  });
  const kinds = [];
  mixed.forEach(function (l) {
    if ((l.trust || 0) < 25) kinds.push('trust');
    if ((l.opinion || 0) < -10) kinds.push('opinion');
    if ((l.arrears || 0) <= 0) kinds.push('other-refusal');
  });
  return { blocked: false, blockKind: 'blocked-other:' + Array.from(new Set(kinds)).sort().join('+'),
    blockers: [], refusing: refusing.map(function (l) { return l.villageId; }) };
}

// Seed class from a seed's check rows + herald attempt count.
// Classes (prereg): no-herald-attempt | no-check | arrears-blocked |
// ready-at-first-check | blocked-other.
function classifySeed(checkRows, skippedRows, heraldAttemptCount) {
  const rows = checkRows || [];
  if (!rows.length) {
    if (!heraldAttemptCount) return 'no-herald-attempt';
    return 'no-check';
  }
  const blockedIdx = rows.findIndex(function (r) { return classifyCheck(r).blocked; });
  if (blockedIdx >= 0) return 'arrears-blocked';
  if (rows[0].ready) return 'ready-at-first-check';
  return 'blocked-other';
}

function firstBlockRow(checkRows) {
  const rows = checkRows || [];
  for (let i = 0; i < rows.length; i++) {
    if (classifyCheck(rows[i]).blocked) return { row: rows[i], index: i };
  }
  return null;
}

module.exports = { classifyCheck: classifyCheck, classifySeed: classifySeed, firstBlockRow: firstBlockRow };
