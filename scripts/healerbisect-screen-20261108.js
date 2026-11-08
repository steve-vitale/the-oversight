// healerbisect-screen-20261108.js — screen-rule classifier + flip-interval
// logic for arm sim-healerbisect-b (prereg evidence/2026-11-08/
// sim-healerbisect-b-prereg.md, Amendment A1).
// Screen subset {53004,53005,53006,53008}: the four frozen-band seeds that
// flip death->survival+sit between the collapsed shape (C2: 73/54/66/92d,
// none sits) and the healed shape (fightloop baseline: all four 150d, all
// four sit). 53003/53007 die on both sides, 53001/53002 die on both sides —
// they cannot discriminate, so they are excluded from screens.
// Screen rule: HEALED if >=3/4 reach 150d; COLLAPSED if >=3/4 die before
// d100; anything else AMBIGUOUS (run the full 8 seeds at that point).
// Flip interval: first HEALED reading after the last COLLAPSED one.
// No game code, no harness load — pure functions over per-seed summaries.
'use strict';

const SCREEN_SEEDS = [53004, 53005, 53006, 53008];

function classifyScreen(summaries) {
  // summaries: {seed: {days, sat}} — sat is the sit day or null.
  const rows = SCREEN_SEEDS.map(function (s) { return summaries[s]; }).filter(Boolean);
  const healed = rows.filter(function (r) { return r.days >= 150; }).length;
  const collapsed = rows.filter(function (r) { return r.days < 100; }).length;
  let verdict = 'AMBIGUOUS';
  if (healed >= 3) verdict = 'HEALED';
  else if (collapsed >= 3) verdict = 'COLLAPSED';
  return { n: rows.length, healed: healed, collapsed: collapsed, verdict: verdict };
}

function flipInterval(readings) {
  // readings: [{sha, verdict}] in chronological order. Returns null when
  // no HEALED reading follows a COLLAPSED one; otherwise the interval
  // {from, to, ambiguous} where `from` is the last COLLAPSED reading and
  // `to` is the first HEALED reading after it, and `ambiguous` is true
  // when an AMBIGUOUS reading sits between them.
  let lastCollapsed = -1, firstHealed = -1;
  for (let i = 0; i < readings.length; i++) {
    if (readings[i].verdict === 'COLLAPSED') lastCollapsed = i;
    else if (readings[i].verdict === 'HEALED' && firstHealed === -1 && lastCollapsed !== -1) firstHealed = i;
  }
  if (firstHealed === -1) return null;
  let ambiguous = false;
  for (let i = lastCollapsed + 1; i < firstHealed; i++) {
    if (readings[i].verdict === 'AMBIGUOUS') ambiguous = true;
  }
  return { from: readings[lastCollapsed].sha, to: readings[firstHealed].sha, ambiguous: ambiguous };
}

module.exports = { SCREEN_SEEDS: SCREEN_SEEDS, classifyScreen: classifyScreen, flipInterval: flipInterval };
