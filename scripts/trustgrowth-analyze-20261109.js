// trustgrowth-analyze-20261109.js — trust-growth + polity probe analyzer,
// v2 (arm sim-trustgrowth-b, run fleshout-loop-b-20261110T0122Z). Pure
// analysis over per-seed JSON written by trustgrowth-driver-20261109.js.
// No game code, no sims.
//
// v2 (prereg amendment 1): trust deltas are reconciled against the
// UNIFIED event log — every write to link.trust, caught by the
// instrument's property setter, plus _trustGain-wrap events that have
// no setter twin (the formation-day gap). Events carry a global seq;
// each snapshot records seq, so an event belongs to the snapshot
// interval (prevSnap.seq, curSnap.seq] — exact, with no day arithmetic
// and no phase assumptions. Causes come from the event's caller stack
// (v2 cause map, grounded in comms.js / safetynets.js / titans.js /
// hierarchy.js call sites); history notes are a cross-check only.
// Anything that does not reconcile is listed as unattributed residue,
// never hidden.
// Usage:
//   node scripts/trustgrowth-analyze-20261109.js evidence/2026-11-09/perseed-trustgrowth-b trustgrowth-pilot-v2
// Prints a text summary and writes trustgrowth-summary-<RUN>.json next
// to the per-seed files.
'use strict';
const fs = require('fs');
const path = require('path');

// --- event-cause classification from the caller stack -------------------
// Caller map grounded in the _trustGain call sites (hierarchy.js) and
// the direct link.trust writers found by the v1 pilot (comms.js,
// safetynets.js, titans.js). `delta` is the signed trust move.
// Ambiguities (documented, not hidden): answerAccord +8 is visit/sit,
// but a gift of >=1,600 kcal also pays +8 — classified accord-visit;
// answerNationalChoice +3/+6/+8 is a court answer, anything else an
// oath; linkTick direct writes are told apart by delta alone
// (-1 thin / -2 nothing / -6 arrears-short / -4 sabotage).
function classifyEvent(stack, delta) {
  if (!stack) return 'unattributed';
  const s = stack;
  if (/tendLink/.test(s)) return 'tend';
  if (/answerAccord/.test(s)) {
    if (delta === 4) return 'accord-word';
    if (delta === 8) return 'accord-visit';
    return 'accord-gift';
  }
  if (/payTribute/.test(s)) return 'paytribute-full';
  if (/forgiveArrears/.test(s)) return 'arrears-forgive';
  if (/answerDemand/.test(s)) return delta > 0 ? 'demand-honor' : 'demand-refused';
  if (/proveWorth/.test(s)) return 'prove-worth';
  if (/answerRenegotiation/.test(s)) return 'renegotiation-answer';
  if (/_resolveRenegotiation/.test(s)) return 'renegotiation-silence';
  if (/answerNationalChoice/.test(s)) {
    if (delta === 3 || delta === 6 || delta === 8) return 'national-choice';
    return 'oath';
  }
  if (/successionCrisis/.test(s)) return 'succession-haircut';
  if (/theirLeaderDied/.test(s)) return 'their-speaker-died';
  if (/aidAskVillage/.test(s)) return 'aid-accept';
  if (/aidHelpArrived/.test(s)) return 'aid-arrived';
  if (/repayAidDebt/.test(s)) return 'aid-debt-repaid';
  if (/answerAidOffer/.test(s)) return delta > 0 ? 'aid-offer-accept' : 'aid-offer-refuse';
  if (/answerAidBeg/.test(s)) {
    if (delta === 4) return 'aid-beg-give';
    if (delta === -2) return 'aid-beg-short';
    return 'aid-beg-refuse';
  }
  if (/resolveAidOut/.test(s)) return delta > 0 ? 'aid-out-accept' : 'aid-out-refused';
  if (/titan/i.test(s)) return 'titan-event';
  if (/linkTick/.test(s)) {
    if (delta === 3) return 'arrears-settle';
    if (delta === 1) return 'tribute-weekly';
    if (delta === -1) return 'tribute-thin';
    if (delta === -2) return 'tribute-nothing';
    if (delta === -6) return 'arrears-short';
    if (delta === -4) return 'sabotage';
    return 'linkTick-other:' + delta;
  }
  const m = s.match(/at (?:[A-Za-z_$][\w$]*\.)?([A-Za-z_$][\w$]*)\s*\(/);
  if (m && m[1] && m[1] !== 'trustGrowthTrustGain' && !/_trustGain/.test(m[1])) return 'other-named:' + m[1];
  return 'unattributed';
}

// Back-compat alias (v1 name): gains are positive events; `n` is the
// applied amount.
function classifyGain(stack, n) { return classifyEvent(stack, n); }

// --- down-magnitude map from link history notes (hierarchy.js) ---------
// Retained ONLY as the cross-check/fallback for events whose stack is
// unattributed: a same-interval history note can still name the cause.
// Magnitudes are code-grounded; notes that carry no trust move map to 0
// and are never counted as a cause. Kind alone is NOT trusted for
// succession/renegotiation (see the amendment): the note text decides.
function downMagnitude(kind, note) {
  const t = String(note || '');
  if (kind === 'tribute') {
    if (/paid thin/.test(t)) return { mag: 1, cause: 'tribute-thin' };
    if (/paid nothing/.test(t)) return { mag: 2, cause: 'tribute-nothing' };
    return { mag: 0, cause: null };
  }
  if (kind === 'arrears') {
    if (/Tribute short/.test(t)) return { mag: 6, cause: 'arrears-short' };
    return { mag: 0, cause: null };
  }
  if (kind === 'sabotage') return { mag: 4, cause: 'sabotage' };
  if (kind === 'succession') {
    if (/grief delays the verdict/.test(t)) return { mag: 8, cause: 'succession-haircut' };
    return { mag: 0, cause: null }; // 'Another death while the link already grieves' etc: no move
  }
  if (kind === 'demand') {
    if (/REFUSED/.test(t)) return { mag: 15, cause: 'demand-refused' };
    return { mag: 0, cause: null };
  }
  if (kind === 'renegotiation') {
    const m = t.match(/trust -(\d+)/);
    if (m) return { mag: parseInt(m[1], 10), cause: 'renegotiation-silence' };
    return { mag: 5, cause: 'renegotiation' };
  }
  if (kind === 'flipped') return { mag: 10, cause: 'primacy-flip' };
  if (kind === 'pool') return { mag: 4, cause: 'pool-short' };
  if (kind === 'titan') {
    const m = t.match(/trust [−\-](\d+)/);
    if (m) return { mag: parseInt(m[1], 10), cause: 'titan-event' };
    return { mag: 0, cause: null };
  }
  if (kind === 'aid') {
    const m = t.match(/Trust \+(\d+)/);
    if (m) return { mag: -parseInt(m[1], 10), cause: 'aid-gain' }; // negative mag = a gain, not a down
    return { mag: 0, cause: null };
  }
  return { mag: 0, cause: null };
}

// --- unified event log ----------------------------------------------------
// Setter events are authoritative. A _trustGain-wrap event is kept only
// when no setter event exists for the same link + day with a _trustGain
// frame in its stack (the formation-day gap). Twins are consumed in
// DESCENDING seq order within each (link, day) group (amendment 5):
// the setter is installed once per link and stays installed, so within
// one day all twinless wraps precede all twinned calls — the latest
// wraps are the twinned ones. Ascending consumption misattributes on
// a formation day that mixes pre-setter calls with a post-setter call
// (120104 d28: the single twin was eaten by the accord wrap, leaving
// the tribute wrap double-counted against its setter twin).
function unifyEvents(out) {
  const setters = (out.events || []).slice();
  const wraps = (out.gains || []).slice();
  const kept = [];
  const twinKey = function (e) { return (e.linkId || '?') + '|' + e.day; };
  const setterTwins = {};
  setters.forEach(function (e) {
    if (/trustGrowthTrustGain|_trustGain/.test(e.stack || '')) {
      const k = twinKey(e);
      setterTwins[k] = (setterTwins[k] || 0) + 1;
    }
  });
  const wrapKept = [];
  const wrapsDesc = wraps.slice().sort(function (a, b) { return ((b.seq == null ? -1 : b.seq) - (a.seq == null ? -1 : a.seq)); });
  wrapsDesc.forEach(function (g) {
    // Blocked gains (applied 0) moved no trust: they are counted via
    // blockedGains, not kept as trust events.
    if (!(g.applied > 0)) return;
    const k = twinKey(g);
    if ((setterTwins[k] || 0) > 0) { setterTwins[k]--; return; } // setter twin exists: drop the wrap duplicate (latest wrap first: amendment 5)
    wrapKept.push({ seq: g.seq != null ? g.seq : -1, day: g.day, linkId: g.linkId, other: g.other, old: null, new: null, delta: g.applied | 0, stack: g.stack, via: 'trustgain-wrap', requested: g.requested });
  });
  setters.forEach(function (e) {
    kept.push({ seq: e.seq, day: e.day, linkId: e.linkId, other: e.other, old: e.old, new: e.new, delta: e.delta, stack: e.stack, via: 'setter' });
  });
  wrapKept.forEach(function (e) { kept.push(e); });
  kept.sort(function (a, b) { return (a.seq | 0) - (b.seq | 0); });
  return kept;
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
      if ((l.id || l.key) === linkId) rows.push({ day: snap.day, seq: (snap.seq != null ? snap.seq : null), link: l, snap: snap });
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

// Reconcile one link's daily deltas against the unified event log.
// An interval is (prevSnap.seq, curSnap.seq]; the event sum must equal
// the trust delta. Cap effects cannot occur here (setter deltas are
// actual applied moves, already capped at the write).
function reconcileLink(out, linkId, unified) {
  const rows = linkTimeline(out, linkId);
  const events = (unified || unifyEvents(out)).filter(function (e) { return e.linkId === linkId; });
  const days = [];
  let unattributedUp = 0, unattributedDown = 0, reconciled = 0;
  let totalEvents = 0;
  const gainByCause = {}, downByCause = {};
  events.forEach(function (e) {
    if (e.delta === 0) return;
    totalEvents++;
    const cause = classifyEvent(e.stack, e.delta);
    if (e.delta > 0) gainByCause[cause] = (gainByCause[cause] || 0) + e.delta;
    else downByCause[cause] = (downByCause[cause] || 0) + (-e.delta);
  });
  for (let i = 1; i < rows.length; i++) {
    const prev = rows[i - 1], cur = rows[i];
    if (prev.link.status !== 'active' || cur.link.status !== 'active') continue;
    const delta = (cur.link.trust | 0) - (prev.link.trust | 0);
    if (delta === 0) continue;
    if (prev.seq == null || cur.seq == null) {
      days.push({ day: cur.day, delta: delta, gainsSum: null, downSum: null, residual: delta, status: 'unattributed-no-seq', eventCauses: [], historyKinds: (cur.link.historyNew || []).map(function (h) { return h.kind; }) });
      if (delta > 0) unattributedUp += delta; else unattributedDown += -delta;
      continue;
    }
    const ivEvents = events.filter(function (e) { return e.seq > prev.seq && e.seq <= cur.seq && e.delta !== 0; });
    const evSum = ivEvents.reduce(function (t, e) { return t + e.delta; }, 0);
    const residual = delta - evSum;
    let status = 'reconciled';
    if (residual === 0) { reconciled++; }
    else if (residual < 0) { unattributedDown += -residual; status = 'unattributed-down:' + (-residual); }
    else { unattributedUp += residual; status = 'unattributed-up:' + residual; }
    days.push({
      day: cur.day, delta: delta, evSum: evSum, residual: residual, status: status,
      eventCauses: ivEvents.map(function (e) { return classifyEvent(e.stack, e.delta) + (e.delta > 0 ? '+' : '') + e.delta + (e.via === 'trustgain-wrap' ? '(wrap)' : ''); }),
      historyKinds: (cur.link.historyNew || []).map(function (h) { return h.kind; }),
    });
  }
  return {
    linkId: linkId, days: days, reconciled: reconciled,
    unattributedUp: unattributedUp, unattributedDown: unattributedDown,
    gainByCause: gainByCause, downByCause: downByCause,
    totalEvents: totalEvents,
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
  const unified = unifyEvents(out);
  const ids = allLinkIds(out);
  const links = ids.map(function (id) {
    const rows = linkTimeline(out, id);
    const cls = classifyLink(rows);
    const rec = reconcileLink(out, id, unified);
    return Object.assign({ linkId: id }, cls, { reconciliation: rec });
  });
  const polity = polityBlocking(out);
  const days = dedupeDaily(out.daily || []);
  const last = days[days.length - 1] || {};
  const endStanding = last.standing || null;
  const tendCalls = unified.filter(function (e) { return e.delta > 0 && classifyEvent(e.stack, e.delta) === 'tend'; }).length;
  const blockedGains = (out.gains || []).filter(function (g) { return (g.requested > 0) && !(g.applied > 0); });
  const nullIdEvents = unified.filter(function (e) { return !e.linkId; });
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
    blockedGainCauses: blockedGains.map(function (g) { return classifyEvent(g.stack, g.requested); }),
    nullIdEvents: nullIdEvents.length, pendingDays: pendingDays,
    totalEvents: unified.length,
    sayLines: (out.trustSays || []).length, sayCount: out.sayCount || 0,
  };
}

function summarizeBand(files) {
  const seeds = files.map(function (f) { return summarizeSeed(JSON.parse(fs.readFileSync(f, 'utf8'))); });
  const classes = {};
  let totalEvents = 0, unattributedUp = 0, unattributedDown = 0, reconciledDays = 0;
  const gainByCause = {}, downByCause = {};
  seeds.forEach(function (s) {
    s.links.forEach(function (l) {
      classes[l.class] = (classes[l.class] || 0) + 1;
      const r = l.reconciliation;
      totalEvents += r.totalEvents;
      unattributedUp += r.unattributedUp;
      unattributedDown += r.unattributedDown;
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
    totalEvents: totalEvents,
    gainByCause: gainByCause, downByCause: downByCause,
    unattributedUp: unattributedUp, unattributedDown: unattributedDown,
    reconciledDays: reconciledDays,
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
  const run = process.argv[3] || 'trustgrowth-pilot-v2';
  if (!dir) { console.error('usage: node scripts/trustgrowth-analyze-20261109.js <perseed-dir> [run]'); process.exit(2); }
  const files = fs.readdirSync(dir).filter(function (f) { return f.indexOf('-' + run + '.json') !== -1; }).sort().map(function (f) { return path.join(dir, f); });
  if (!files.length) { console.error('no per-seed files for run ' + run + ' in ' + dir); process.exit(2); }
  const band = summarizeBand(files);
  band.seeds.forEach(function (s) {
    console.log('seed ' + s.seed + ' days=' + s.days + ' end=' + s.endReason + ' scale=' + s.scaleRank + ' w' + s.maxWave + '/unlock' + s.unlockedWave + ' standing=' + s.standing + ' gated=' + s.endGated + ' dip=' + s.endDiplomacy + ' links=' + s.links.length + ' polity=' + (s.polity.polityEver ? (s.polity.polityEver.shape + ' d' + s.polity.polityFirstDay) : s.polity.reason) + ' tend=' + s.tendCalls + ' blockedGains=' + s.blockedGains + ' events=' + s.totalEvents + ' errors=' + s.instrumentErrors.length);
    s.links.forEach(function (l) {
      console.log('  link ' + (l.other || '?') + ' ' + l.direction + '/' + (l.kind || '?') + ' born d' + l.formedDay + ' trust ' + l.born + '->peak ' + l.peak + '->end ' + l.end + ' class=' + l.class + ' seasoned=' + l.seasonedEver + ' broke=' + (l.broke ? 'd' + l.brokeDay : 'no') + ' arrears=' + l.finalArrears);
      console.log('    gains: ' + JSON.stringify(l.reconciliation.gainByCause) + ' downs: ' + JSON.stringify(l.reconciliation.downByCause) + ' reconciledDays=' + l.reconciliation.reconciled + ' unattUp=' + l.reconciliation.unattributedUp + ' unattDown=' + l.reconciliation.unattributedDown + ' events=' + l.reconciliation.totalEvents);
      l.reconciliation.days.filter(function (d) { return d.status !== 'reconciled'; }).forEach(function (d) {
        console.log('    UNRESOLVED d' + d.day + ' delta=' + d.delta + ' evSum=' + d.evSum + ' status=' + d.status + ' causes=' + JSON.stringify(d.eventCauses) + ' hist=' + JSON.stringify(d.historyKinds));
      });
    });
  });
  console.log('BAND classes=' + JSON.stringify(band.classes) + ' events=' + band.totalEvents + ' gainsByCause=' + JSON.stringify(band.gainByCause) + ' downsByCause=' + JSON.stringify(band.downByCause));
  console.log('BAND reconciledDays=' + band.reconciledDays + ' unattUp=' + band.unattributedUp + ' unattDown=' + band.unattributedDown);
  console.log('WALL wins=' + band.wins + '/' + band.seeds.length + ' national=' + band.national + ' table=' + band.table + ' w4unlocks=' + band.wave4unlocks + ' w5unlocks=' + band.wave5unlocks + ' medianSurvival=' + band.medianSurvival + ' survivors=' + band.survivors);
  const outFile = path.join(dir, 'trustgrowth-summary-' + run + '.json');
  fs.writeFileSync(outFile, JSON.stringify(band, null, 2) + '\n');
  console.log('wrote ' + outFile);
}

module.exports = {
  classifyEvent: classifyEvent, classifyGain: classifyGain,
  downMagnitude: downMagnitude, unifyEvents: unifyEvents,
  classifyLink: classifyLink, reconcileLink: reconcileLink,
  polityBlocking: polityBlocking, summarizeSeed: summarizeSeed,
  summarizeBand: summarizeBand, linkTimeline: linkTimeline, allLinkIds: allLinkIds,
};
