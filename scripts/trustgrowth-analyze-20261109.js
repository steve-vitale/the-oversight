// trustgrowth-analyze-20261109.js — trust-growth + polity probe analyzer
// (arm sim-trustgrowth-b, run fleshout-loop-b-20261110T0122Z). Pure
// analysis over per-seed JSON written by trustgrowth-driver-20261109.js.
// No game code, no sims. Trust deltas are derived from consecutive daily
// snapshots; gains are attributed from the live _trustGain log (cause
// from the caller stack); losses are attributed from the link's same-day
// history notes (magnitudes grounded in hierarchy.js). Anything that
// does not reconcile is listed as unattributed residue, never hidden.
// Usage:
//   node scripts/trustgrowth-analyze-20261109.js evidence/2026-11-09/perseed-trustgrowth-b trustgrowth-pilot
// Prints a text summary and writes trustgrowth-summary-<RUN>.json next
// to the per-seed files.
'use strict';
const fs = require('fs');
const path = require('path');

// --- gain-cause classification from the _trustGain caller stack --------
// Caller map grounded in hierarchy.js _trustGain call sites (verified by
// grep before the prereg): tendLink +8; answerAccord gift 2..10 / word
// +4 / visit +8; payTribute +3; forgiveArrears +6; answerDemand
// (proportional); proveWorth +1..6; answerRenegotiation +2/+5;
// answerNationalChoice oath +2..12 / fixed +3/+6/+8; linkTick +1
// (tribute full pay or deposit-gate waiver) / +3 (arrears settled).
// Ambiguities (documented, not hidden): answerAccord +8 is visit/sit,
// but a gift of >=1,600 kcal also pays +8 — classified accord-visit;
// answerNationalChoice +3/+6/+8 is a court answer, anything else an oath.
function classifyGain(stack, requested) {
  if (!stack) return 'unattributed';
  if (/tendLink/.test(stack)) return 'tend';
  if (/answerAccord/.test(stack)) {
    if (requested === 4) return 'accord-word';
    if (requested === 8) return 'accord-visit';
    return 'accord-gift';
  }
  if (/payTribute/.test(stack)) return 'paytribute-full';
  if (/forgiveArrears/.test(stack)) return 'arrears-forgive';
  if (/answerDemand/.test(stack)) return 'demand-honor';
  if (/proveWorth/.test(stack)) return 'prove-worth';
  if (/answerRenegotiation/.test(stack)) return 'renegotiation-answer';
  if (/answerNationalChoice/.test(stack)) {
    if (requested === 3 || requested === 6 || requested === 8) return 'national-choice';
    return 'oath';
  }
  if (/linkTick/.test(stack)) {
    if (requested === 3) return 'arrears-settle';
    return 'tribute-weekly';
  }
  const m = stack.match(/at (?:[A-Za-z_$][\w$]*\.)?([A-Za-z_$][\w$]*)\s*\(/);
  if (m && m[1] && m[1] !== 'trustGrowthTrustGain') return 'other-named:' + m[1];
  return 'unattributed';
}

// --- down-magnitude map from link history notes (hierarchy.js) ---------
// Each magnitude is the code-grounded trust move for that note. Notes
// that carry no trust move map to 0 and are never counted as a cause.
function downMagnitude(kind, note) {
  const t = String(note || '');
  if (kind === 'tribute') {
    if (/paid thin/.test(t)) return { mag: 1, cause: 'tribute-thin' };
    if (/paid nothing/.test(t)) return { mag: 2, cause: 'tribute-nothing' };
    return { mag: 0, cause: null }; // full pay / waiver: the +1 is a gain, logged live
  }
  if (kind === 'arrears') {
    if (/Tribute short/.test(t)) return { mag: 6, cause: 'arrears-short' };
    return { mag: 0, cause: null }; // call-in staged / back-paid / forgiven: no down move
  }
  if (kind === 'sabotage') return { mag: 4, cause: 'sabotage' };
  if (kind === 'succession') return { mag: 8, cause: 'succession' };
  if (kind === 'demand') {
    if (/REFUSED/.test(t)) return { mag: 15, cause: 'demand-refused' };
    return { mag: 0, cause: null };
  }
  if (kind === 'renegotiated') return { mag: 5, cause: 'renegotiation' };
  if (kind === 'flipped') return { mag: 10, cause: 'primacy-flip' };
  if (kind === 'pool') return { mag: 4, cause: 'pool-short' };
  // drift / formed / accord / tended / broken / worth / revolt: no direct
  // trust magnitude (revolt ends the link; drift is a note only).
  return { mag: 0, cause: null };
}

// --- per-link timeline ----------------------------------------------------
function dedupeDaily(daily) {
  const byDay = {};
  daily.forEach(function (s) { byDay[s.day] = s; });
  return Object.keys(byDay).map(Number).sort(function (a, b) { return a - b; }).map(function (d) { return byDay[d]; });
}

function linkTimeline(out, linkId) {
  const days = dedupeDaily(out.daily || []);
  const rows = [];
  days.forEach(function (snap) {
    (snap.links || []).forEach(function (l) {
      if ((l.id || l.key) === linkId) rows.push({ day: snap.day, link: l, snap: snap });
    });
  });
  return rows;
}

function allLinkIds(out) {
  const ids = {};
  (out.daily || []).forEach(function (snap) {
    (snap.links || []).forEach(function (l) { ids[l.id || l.key] = true; });
  });
  return Object.keys(ids);
}

// Trajectory class per the prereg precedence: seasoned > rises > decays > holds.
function classifyLink(rows) {
  if (!rows.length) return null;
  const born = rows[0].link.trust | 0;
  let peak = born, end = born, seasonedEver = false, seasonedPolityEver = false, broke = false, brokeDay = null;
  let lastActiveDay = rows[0].day;
  rows.forEach(function (r) {
    const tr = r.link.trust | 0;
    if (r.link.status === 'active') { lastActiveDay = r.day; end = tr; if (tr > peak) peak = tr; }
    if (r.link.seasoned) seasonedEver = true;
    if (r.link.seasonedPolity) seasonedPolityEver = true;
    if (r.link.status !== 'active' && !broke) { broke = true; brokeDay = r.day; }
  });
  let cls = 'holds';
  if (seasonedEver) cls = 'seasoned';
  else if (peak >= born + 10) cls = 'rises';
  else if (end <= born - 10) cls = 'decays';
  return {
    class: cls, born: born, peak: peak, end: end,
    formedDay: rows[0].day, lastDay: rows[rows.length - 1].day, lastActiveDay: lastActiveDay,
    other: rows[0].link.other, kind: rows[0].link.kind,
    direction: (rows[0].link.primary === 'haven' ? 'LEAD' : (rows[0].link.subordinate === 'haven' ? 'BELONG' : (rows[0].link.kind || 'peer'))),
    seasonedEver: seasonedEver, seasonedPolityEver: seasonedPolityEver,
    broke: broke, brokeDay: brokeDay,
    maxAge: Math.max.apply(null, rows.map(function (r) { return r.link.age | 0; })),
    finalArrears: rows[rows.length - 1].link.arrears | 0,
  };
}

// Reconcile one link's daily deltas against live gains + history notes.
function reconcileLink(out, linkId) {
  const rows = linkTimeline(out, linkId);
  const gains = (out.gains || []).filter(function (g) { return g.linkId === linkId; });
  const days = [];
  let unattributedUp = 0, unattributedDown = 0, capAdjust = 0, reconciled = 0, totalGainEvents = 0, totalDownEvents = 0;
  const gainByCause = {}, downByCause = {};
  gains.forEach(function (g) {
    if (!(g.applied > 0)) return;
    const cause = classifyGain(g.stack, g.requested);
    gainByCause[cause] = (gainByCause[cause] || 0) + g.applied;
    totalGainEvents++;
  });
  for (let i = 1; i < rows.length; i++) {
    const prev = rows[i - 1], cur = rows[i];
    if (prev.link.status !== 'active' || cur.link.status !== 'active') continue;
    const delta = (cur.link.trust | 0) - (prev.link.trust | 0);
    if (delta === 0) continue;
    // Gains in (prev.day, cur.day] — normally just cur.day; the range
    // keeps reconciliation honest if a snapshot day is ever skipped.
    const dayGains = gains.filter(function (g) { return g.day > prev.day && g.day <= cur.day && g.applied > 0; });
    const gainsSum = dayGains.reduce(function (t, g) { return t + (g.applied | 0); }, 0);
    // History notes new on this snapshot day that carry a down move.
    // (historyNew is per-snapshot; a note dated an earlier day can surface
    // late only if the link was not snapshotted — snapshots are daily, so
    // same-day is the rule; notes dated != cur.day are still counted when
    // they surface, and flagged.)
    let downSum = 0;
    const downCauses = [];
    (cur.link.historyNew || []).forEach(function (h) {
      const dm = downMagnitude(h.kind, h.note);
      if (dm.mag > 0) {
        downSum += dm.mag;
        downCauses.push(dm.cause + (h.day !== cur.day ? '@d' + h.day : ''));
        downByCause[dm.cause] = (downByCause[dm.cause] || 0) + dm.mag;
        totalDownEvents++;
      }
    });
    const expected = gainsSum - downSum;
    const residual = delta - expected;
    let status = 'reconciled';
    if (residual === 0) { reconciled++; }
    else if (residual < 0 && (cur.link.trust | 0) === 100) { capAdjust += -residual; status = 'cap-100'; }
    else if (residual < 0) { unattributedDown += -residual; status = 'unattributed-down:' + (-residual); }
    else { unattributedUp += residual; status = 'unattributed-up:' + residual; }
    days.push({
      day: cur.day, delta: delta, gainsSum: gainsSum, downSum: downSum,
      residual: residual, status: status,
      gainCauses: dayGains.map(function (g) { return classifyGain(g.stack, g.requested) + '+' + g.applied; }),
      downCauses: downCauses,
    });
  }
  return {
    linkId: linkId, days: days, reconciled: reconciled,
    unattributedUp: unattributedUp, unattributedDown: unattributedDown, capAdjust: capAdjust,
    gainByCause: gainByCause, downByCause: downByCause,
    totalGainEvents: totalGainEvents, totalDownEvents: totalDownEvents,
  };
}

function polityBlocking(out) {
  const days = dedupeDaily(out.daily || []);
  let polityEver = null, polityFirstDay = null;
  days.forEach(function (snap) {
    const p = snap.polity || {};
    const any = p.haven || p.lead || p.belong || p.covenant || p.trade;
    if (any && !polityEver) { polityEver = any; polityFirstDay = snap.day; }
  });
  const ids = allLinkIds(out);
  let seasonedCount = 0;
  ids.forEach(function (id) {
    const c = classifyLink(linkTimeline(out, id));
    if (c && c.seasonedEver) seasonedCount++;
  });
  let reason = 'polity-formed';
  if (!polityEver) {
    if (ids.length === 0) reason = 'no-links';
    else if (seasonedCount === 0) reason = 'never-seasoned';
    else reason = 'seasoned-but-no-polity';
  }
  return {
    polityEver: polityEver, polityFirstDay: polityFirstDay,
    linksFormed: ids.length, seasonedCount: seasonedCount, reason: reason,
  };
}

function summarizeSeed(out) {
  const ids = allLinkIds(out);
  const links = ids.map(function (id) {
    const rows = linkTimeline(out, id);
    const cls = classifyLink(rows);
    const rec = reconcileLink(out, id);
    return Object.assign({ linkId: id }, cls, { reconciliation: rec });
  });
  const polity = polityBlocking(out);
  const days = dedupeDaily(out.daily || []);
  const last = days[days.length - 1] || {};
  const endStanding = last.standing || null;
  const tendCalls = (out.gains || []).filter(function (g) { return g.applied > 0 && classifyGain(g.stack, g.requested) === 'tend'; }).length;
  const blockedGains = (out.gains || []).filter(function (g) { return (g.requested > 0) && !(g.applied > 0); });
  const nullIdGains = (out.gains || []).filter(function (g) { return !g.linkId; });
  const pendingDays = days.filter(function (s) { return s.pending && (s.pending.counter || s.pending.accord || s.pending.national || s.pending.global); }).length;
  return {
    seed: out.seed, days: out.days, gameDays: out.gameDays, endReason: out.endReason,
    won: !!out.won, scaleRank: out.scaleRank, maxWave: out.maxWave, unlockedWave: out.unlockedWave,
    standing: out.standing, endGated: last.gated != null ? last.gated : null,
    endRaw: endStanding ? endStanding.total : null,
    endDiplomacy: endStanding ? endStanding.diplomacy : null,
    instrumentErrors: out.instrumentErrors || [],
    links: links, polity: polity,
    tendCalls: tendCalls, blockedGains: blockedGains.length,
    blockedGainCauses: blockedGains.map(function (g) { return classifyGain(g.stack, g.requested); }),
    nullIdGains: nullIdGains.length, pendingDays: pendingDays,
    sayLines: (out.trustSays || []).length, sayCount: out.sayCount || 0,
  };
}

function summarizeBand(files) {
  const seeds = files.map(function (f) { return summarizeSeed(JSON.parse(fs.readFileSync(f, 'utf8'))); });
  const classes = {};
  let totalGainEvents = 0, unattributedUp = 0, unattributedDown = 0, capAdjust = 0, reconciledDays = 0;
  const gainByCause = {}, downByCause = {};
  seeds.forEach(function (s) {
    s.links.forEach(function (l) {
      classes[l.class] = (classes[l.class] || 0) + 1;
      const r = l.reconciliation;
      totalGainEvents += r.totalGainEvents;
      unattributedUp += r.unattributedUp;
      unattributedDown += r.unattributedDown;
      capAdjust += r.capAdjust;
      reconciledDays += r.reconciled;
      Object.keys(r.gainByCause).forEach(function (k) { gainByCause[k] = (gainByCause[k] || 0) + r.gainByCause[k]; });
      Object.keys(r.downByCause).forEach(function (k) { downByCause[k] = (downByCause[k] || 0) + r.downByCause[k]; });
    });
  });
  const daysList = seeds.map(function (s) { return s.days; }).sort(function (a, b) { return a - b; });
  const medianSurvival = daysList.length ? daysList[Math.floor(daysList.length / 2)] : null;
  return {
    seeds: seeds,
    classes: classes,
    totalGainEvents: totalGainEvents,
    gainByCause: gainByCause, downByCause: downByCause,
    unattributedUp: unattributedUp, unattributedDown: unattributedDown,
    capAdjust: capAdjust, reconciledDays: reconciledDays,
    wins: seeds.filter(function (s) { return s.won; }).length,
    national: seeds.filter(function (s) { return s.scaleRank === 'national' || s.scaleRank === 'global'; }).length,
    table: seeds.filter(function (s) { return s.won; }).length,
    wave4unlocks: seeds.filter(function (s) { return (s.unlockedWave | 0) >= 4; }).length,
    wave5unlocks: seeds.filter(function (s) { return (s.unlockedWave | 0) >= 5; }).length,
    medianSurvival: medianSurvival,
    survivors: seeds.filter(function (s) { return s.days >= 150; }).length,
  };
}

if (require.main === module) {
  const dir = process.argv[2];
  const run = process.argv[3] || 'trustgrowth-pilot';
  if (!dir) { console.error('usage: node scripts/trustgrowth-analyze-20261109.js <perseed-dir> [run]'); process.exit(2); }
  const files = fs.readdirSync(dir).filter(function (f) { return f.indexOf('-' + run + '.json') !== -1; }).sort().map(function (f) { return path.join(dir, f); });
  if (!files.length) { console.error('no per-seed files for run ' + run + ' in ' + dir); process.exit(2); }
  const band = summarizeBand(files);
  band.seeds.forEach(function (s) {
    console.log('seed ' + s.seed + ' days=' + s.days + ' end=' + s.endReason + ' scale=' + s.scaleRank + ' w' + s.maxWave + '/unlock' + s.unlockedWave + ' standing=' + s.standing + ' gated=' + s.endGated + ' dip=' + s.endDiplomacy + ' links=' + s.links.length + ' polity=' + (s.polity.polityEver ? (s.polity.polityEver.shape + ' d' + s.polity.polityFirstDay) : s.polity.reason) + ' tend=' + s.tendCalls + ' blockedGains=' + s.blockedGains + ' errors=' + s.instrumentErrors.length);
    s.links.forEach(function (l) {
      console.log('  link ' + (l.other || '?') + ' ' + l.direction + '/' + (l.kind || '?') + ' born d' + l.formedDay + ' trust ' + l.born + '->peak ' + l.peak + '->end ' + l.end + ' class=' + l.class + ' seasoned=' + l.seasonedEver + ' broke=' + (l.broke ? 'd' + l.brokeDay : 'no') + ' arrears=' + l.finalArrears);
      console.log('    gains: ' + JSON.stringify(l.reconciliation.gainByCause) + ' downs: ' + JSON.stringify(l.reconciliation.downByCause) + ' reconciledDays=' + l.reconciliation.reconciled + ' unattUp=' + l.reconciliation.unattributedUp + ' unattDown=' + l.reconciliation.unattributedDown + ' cap=' + l.reconciliation.capAdjust);
    });
  });
  console.log('BAND classes=' + JSON.stringify(band.classes) + ' gainEvents=' + band.totalGainEvents + ' gainsByCause=' + JSON.stringify(band.gainByCause) + ' downsByCause=' + JSON.stringify(band.downByCause));
  console.log('BAND reconciledDays=' + band.reconciledDays + ' unattUp=' + band.unattributedUp + ' unattDown=' + band.unattributedDown + ' cap=' + band.capAdjust);
  console.log('WALL wins=' + band.wins + '/' + band.seeds.length + ' national=' + band.national + ' table=' + band.table + ' w4unlocks=' + band.wave4unlocks + ' w5unlocks=' + band.wave5unlocks + ' medianSurvival=' + band.medianSurvival + ' survivors=' + band.survivors);
  const outFile = path.join(dir, 'trustgrowth-summary-' + run + '.json');
  fs.writeFileSync(outFile, JSON.stringify(band, null, 2) + '\n');
  console.log('wrote ' + outFile);
}

module.exports = {
  classifyGain: classifyGain, downMagnitude: downMagnitude,
  classifyLink: classifyLink, reconcileLink: reconcileLink,
  polityBlocking: polityBlocking, summarizeSeed: summarizeSeed,
  summarizeBand: summarizeBand, linkTimeline: linkTimeline, allLinkIds: allLinkIds,
};
