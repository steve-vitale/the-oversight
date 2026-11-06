// lingergorge-diag — lingerer-gorge family classifiers
// (sim-lingergorge-a, 2026-11-06, flesh-out loop, axis food-economy).
//
// WRAPPER ONLY: the judged endDay-beats instrument
// (scripts/policies/enddaybeats-diag.js) is NOT modified. This module
// adds ONLY the gorge-family classification on top of it — two regexes
// for the two say sites in havenGrowthDaily (src/js/havenGrowth.js):
//   1. gorge (nightly report, both variants): '🌙 Night. The
//      lingering <name> gorges at the treeline — <N> kcal gone from
//      the stores. ...' (got > 0) and '🌙 Night. The lingering
//      <name> circles the treeline, sniffing at empty stores —
//      nothing left to take. ...' (got == 0, empty-pantry re-voice,
//      master r143). One say site each, same nightly report + the
//      same sortie invitation.
//   2. gorge-driftoff (one-time, when the ~6-night clock expires):
//      '🌙 The lingering <name> paces the treeline one last night,
//      then melts back into the dark. The gorge is over — the
//      village outlasted it.'
//
// NON-MATCHES (deliberate): the havenRaidTick "Nobody met <name> —
// it's still out there at the treeline. It'll gorge every night
// until it's driven off." line says "gorge" but never "gorges at
// the treeline" — it is the already-relayed linger notice, not the
// nightly report, and must NOT classify as gorge. The endure-action
// response ("You endure it. The treeline holds its shape...") and
// the sortie-resolution line ("N still hold the treeline — the
// gorge goes on") likewise do not match. The village-raid 🌙 line
// ("🌙 Raid — <village> came in the night...") is a different beat
// (commonsRaid, already relayed) and does not match either regex.
//
// Position at fire time: the nearest marker at or before the
// line's idx (same positionAt as gossipcensus-diag).
'use strict';

const eb = require('./enddaybeats-diag');
const gc = require('./gossipcensus-diag');

const GORGE_RE = /gorges at the treeline|circles the treeline, sniffing at empty stores/;
const DRIFTOFF_RE = /paces the treeline one last night/;

function isGorgeLine(text) { return GORGE_RE.test(text || ''); }
function isDriftOffLine(text) { return DRIFTOFF_RE.test(text || ''); }
// gorgeKind(text): 'gorge' | 'gorge-driftoff' | null.
function gorgeKind(text) {
  if (!text) return null;
  if (isGorgeLine(text)) return 'gorge';
  if (isDriftOffLine(text)) return 'gorge-driftoff';
  return null;
}
// kindOfAll(text): the parent family kind, else the gorge kind,
// else null. Used by the driver for allFamily + trim keep rules.
function kindOfAll(text) {
  return eb.kindOf(text) || gorgeKind(text);
}

// classifyGorgeWindow(lines, markers): the parent classification
// plus gorge hits and perKind entries for 'gorge' and
// 'gorge-driftoff'. perKind[k] = { lines, windows: 0|1 } — windows
// is 1 when the window holds >= 1 line of that kind (the primary
// metric counts WINDOWS, not lines).
function classifyGorgeWindow(lines, markers) {
  const base = eb.classifyEnddayWindow(lines, markers);
  const gorgeHits = [];
  for (const l of lines || []) {
    const k = gorgeKind(l.text);
    if (!k) continue;
    gorgeHits.push({ idx: l.idx, loopDay: l.loopDay, phase: l.phase,
      part: l.part, kind: k, text: l.text,
      position: gc.positionAt(markers, l.idx) });
  }
  base.perKind['gorge'] = { lines: 0, windows: 0 };
  base.perKind['gorge-driftoff'] = { lines: 0, windows: 0 };
  for (const h of gorgeHits) {
    base.perKind[h.kind].lines++;
    base.perKind[h.kind].windows = 1;
  }
  base.gorgeHits = gorgeHits;
  return base;
}

module.exports = { isGorgeLine, isDriftOffLine, gorgeKind, kindOfAll,
  classifyGorgeWindow,
  GORGE_KINDS: ['gorge', 'gorge-driftoff'],
  GORGE_RE, DRIFTOFF_RE };
