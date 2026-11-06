// gorgeharness-diag — firing-time atHaven classification + linger-endDay
// grouping (sim-gorgeharness-a, 2026-11-06, flesh-out loop, axis
// food-economy).
//
// WRAPPER ONLY: the judged instruments (strandnarr-diag,
// gossipcensus-diag, enddaybeats-diag, lingergorge-diag) are NOT
// modified. This module adds ONLY the revised-metric classification
// on top of the judged gorge classifiers (lingergorge-diag):
//
//   - FIRING-TIME POSITION: the nearest `pre-endday` marker at or
//     before the line's idx. The driver snaps one immediately
//     before each Game.endDay call, carrying atHaven =
//     Game.scholarAtHaven() at that moment. WHY a pre-endday marker
//     and not the nearest phase marker: a hall-sleep night runs
//     endDay inside sleep; a wild-sleep night runs it at the morning
//     boundary in the harness phase; a day-budget-exhaustion endDay
//     can fire inside the daily phase AFTER the scholar has travelled
//     during the day — so a daily-start marker (the scholar's
//     position at the START of the loop-day) is STALE for a
//     daily-phase firing. The pre-endday marker is exact for every
//     firing, because havenGrowthDaily runs ONLY via the progDaily
//     wrap, i.e. inside endDay.
//   - CROSS-CHECK: the old marker-based positionAt reading
//     (tile === 'haven' OR inside === true) is computed alongside
//     for every hit. A disagreement between the two readings is a
//     finding, never silently resolved.
//   - LINGER-ENDDAY grouping: lines belonging to one endDay pass,
//     keyed by their pre-endday marker's idx. One linger-endDay is
//     one endDay pass with >= 1 lingering raider present, measured
//     by >= 1 gorge or drift-off line fired in that pass.
//
// A gorge line with NO pre-endday marker before it is UNGROUPED
// (it should not happen — every havenGrowthDaily call is inside an
// endDay — and is reported, not dropped).
'use strict';

const lg = require('./lingergorge-diag');
const gc = require('./gossipcensus-diag');

// endDayMarkerAt(markers, idx): the pre-endday marker with the
// greatest idx <= the line's idx, else null.
function endDayMarkerAt(markers, idx) {
  let best = null;
  for (const m of markers || []) {
    if (m.kind !== 'pre-endday') continue;
    if (m.idx <= idx && (!best || m.idx >= best.idx)) best = m;
  }
  return best;
}

// atHavenAt(markers, idx): firing-time scholarAtHaven() for a line.
// Primary: the nearest pre-endday marker's atHaven (a boolean the
// driver snapshots from Game.scholarAtHaven()). Fallback (no
// pre-endday marker — pre-fix drivers, or a line outside endDay):
// the old positionAt reading. Returns true/false, or null when no
// marker precedes the line at all.
function atHavenAt(markers, idx) {
  const ed = endDayMarkerAt(markers, idx);
  if (ed && ed.atHaven !== undefined && ed.atHaven !== null) return !!ed.atHaven;
  const pos = gc.positionAt(markers, idx);
  if (!pos) return null;
  return pos.tile === 'haven' || pos.inside === true;
}

// crossCheckAtHaven(markers, idx): the old positionAt-based reading
// (tile === 'haven' OR inside === true), or null when no marker
// precedes the line. The pre-endday marker itself is EXCLUDED from
// this reading when it is the nearest marker, so the cross-check is
// genuinely independent: it uses the nearest NON-pre-endday marker
// (the phase marker the old arm would have used).
function crossCheckAtHaven(markers, idx) {
  let best = null;
  for (const m of markers || []) {
    if (m.kind === 'pre-endday') continue;
    if (m.idx <= idx && (!best || m.idx >= best.idx)) best = m;
  }
  if (!best) return null;
  return best.tile === 'haven' || best.inside === true;
}

// classifyGorgeDelivery(lines, markers): every gorge /
// gorge-driftoff line in the transcript with its firing-time
// position. Returns { hits, ungrouped } where each hit is
// { idx, loopDay, phase, part, kind, text, atHaven,
//   atHavenCross, agree, endDayIdx, endDayLoopDay }.
function classifyGorgeDelivery(lines, markers) {
  const hits = [];
  const ungrouped = [];
  for (const l of lines || []) {
    const k = lg.gorgeKind(l.text);
    if (!k) continue;
    const ed = endDayMarkerAt(markers, l.idx);
    const atHaven = atHavenAt(markers, l.idx);
    const cross = crossCheckAtHaven(markers, l.idx);
    const hit = { idx: l.idx, loopDay: l.loopDay, phase: l.phase,
      part: l.part, kind: k, text: l.text, atHaven,
      atHavenCross: cross,
      agree: (cross === null || atHaven === null) ? null : (atHaven === cross),
      endDayIdx: ed ? ed.idx : null,
      endDayLoopDay: ed ? ed.loopDay : null };
    hits.push(hit);
    if (!ed) ungrouped.push(hit);
  }
  return { hits, ungrouped };
}

// lingerEndDays(delivery): group gorge/drift-off hits by endDay pass.
// Each group: { key, endDayIdx, loopDay, phase, atHaven,
// gorgeLines, driftOffLines, hits }. Ungrouped hits are returned
// separately (they belong to no endDay pass).
function lingerEndDays(delivery) {
  const groups = {};
  const order = [];
  for (const h of delivery.hits) {
    if (h.endDayIdx === null || h.endDayIdx === undefined) continue;
    const key = 'ed' + h.endDayIdx;
    if (!groups[key]) {
      groups[key] = { key, endDayIdx: h.endDayIdx, loopDay: h.loopDay,
        phase: h.phase, atHaven: h.atHaven, gorgeLines: 0,
        driftOffLines: 0, hits: [] };
      order.push(key);
    }
    groups[key].hits.push(h);
    if (h.kind === 'gorge') groups[key].gorgeLines++;
    else if (h.kind === 'gorge-driftoff') groups[key].driftOffLines++;
  }
  return { groups: order.map((k) => groups[k]), ungrouped: delivery.ungrouped };
}

// summarizeGorgeDelivery(delivery): the revised primary metric and
// its denominators. awayGorgeLines is the PRIMARY count: gorge
// lines delivered while scholarAtHaven() was false at firing time.
function summarizeGorgeDelivery(delivery) {
  const led = lingerEndDays(delivery);
  let awayGorgeLines = 0, havenGorgeLines = 0;
  let awayDriftOffLines = 0, havenDriftOffLines = 0;
  let awayLingerEndDays = 0, havenLingerEndDays = 0;
  for (const h of delivery.hits) {
    if (h.kind === 'gorge') { if (h.atHaven === false) awayGorgeLines++; else if (h.atHaven === true) havenGorgeLines++; }
    if (h.kind === 'gorge-driftoff') { if (h.atHaven === false) awayDriftOffLines++; else if (h.atHaven === true) havenDriftOffLines++; }
  }
  for (const g of led.groups) {
    if (g.atHaven === false) awayLingerEndDays++;
    else if (g.atHaven === true) havenLingerEndDays++;
  }
  const disagreements = delivery.hits.filter((h) => h.agree === false);
  return { awayGorgeLines, havenGorgeLines,
    awayDriftOffLines, havenDriftOffLines,
    totalGorgeLines: awayGorgeLines + havenGorgeLines,
    totalDriftOffLines: awayDriftOffLines + havenDriftOffLines,
    awayLingerEndDays, havenLingerEndDays,
    totalLingerEndDays: led.groups.length,
    ungroupedLines: delivery.ungrouped.length,
    disagreements: disagreements.map((h) => ({ idx: h.idx, loopDay: h.loopDay,
      phase: h.phase, kind: h.kind, atHaven: h.atHaven,
      atHavenCross: h.atHavenCross, text: h.text })),
    lingerEndDays: led.groups };
}

module.exports = { endDayMarkerAt, atHavenAt, crossCheckAtHaven,
  classifyGorgeDelivery, lingerEndDays, summarizeGorgeDelivery };
