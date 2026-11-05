// enddaybeats-diag — endDay haven-beats family classifiers
// (sim-enddaybeats-a, 2026-11-05, flesh-out loop, axis food-economy).
//
// The transcript recorder + window machinery is REUSED VERBATIM from
// scripts/policies/strandnarr-diag.js (sim-strandnarr-a, 2026-11-04);
// the burst/settle control classifiers are REUSED from
// scripts/policies/gossipcensus-diag.js. This module adds ONLY the
// endDay-beats classification on top of that judged instrument — no
// new wrapping, no new RNG, no state edits.
//
// THE FAMILY (all judged in stranded sleep windows; code facts in
// evidence/2026-11-05/sim-enddaybeats-a-prereg.md):
//   1. raid-call: '🚨 <name> is at Haven's door. The village looks
//      to you. Four ways to call: ...' (comms.js raiseAidCrisis).
//      Sibling context lines, same event, NOT separate events:
//      '🐗 RAID — N raiders hit Haven in the night...' (raid-line)
//      and '🕯️ The treeline is still torn up from the raid...'
//      (raid-aftermath).
//   2. overhear: 'You overhear it at the fire, and stop pretending
//      not to listen. ...' (ledger.js _fireBeat framing, first
//      gossip-kind legend beat).
//   3. fragments: 'You catch fragments by the fire — <teller>
//      telling <listener> about ...' (game.js spreadGossip).
//   4. pantry: the day-voice "full shelves" lines — deposit-gate
//      pool (game.js _depositGateDayVoice) and plenty pool (game.js
//      _plentyDepriDayVoice). Both say '🍽️ <first> <pool line>';
//      the classifier matches the pool phrases, not the bare 🍽️
//      prefix (the pantry-triage line '🍽️ <name> checks the pantry
//      before heading out — ~N days of fresh on hand...' at
//      game.js:6808 is a DIFFERENT beat and must NOT match: its
//      follow-on differs from the plenty-pool phrase).
//   5. tale: tellKillerTale fireside prose — '🔥 The fire settles.
//      <killer> has been quiet all evening, and now everyone knows
//      why. ...' (game.js tellKillerTale via sayHavenNews).
//   6. witness (control, relay-gated): '<who> came back from the
//      treeline white-faced. Saw it too. ...' (endDay witness
//      branch via sayHavenNews).
//   7. other: anything else haven-side in a stranded sleep window
//      is enumerated by READING the full stranded sleep windows
//      kept in the corpus — no regex can pre-list it.
//
// Position at fire time: the nearest marker at or before the
// line's idx (same positionAt as gossipcensus-diag).
'use strict';

const sn = require('./strandnarr-diag');
const gc = require('./gossipcensus-diag');

const RAID_CALL_RE = /Four ways to call:/;
const RAID_LINE_RE = /RAID — .*hit Haven in the night/;
const RAID_AFTERMATH_RE = /The treeline is still torn up from the raid/;
const OVERHEAR_RE = /You overhear it at the fire/;
const FRAGMENTS_RE = /You catch fragments by the fire/;
const TALE_RE = /The fire settles\. .+ has been quiet all evening/;
const WITNESS_RE = /came back from the treeline white-faced/;

// Day-voice pool phrases (game.js _depositGateDayVoice +
// _plentyDepriDayVoice). Each is the line's distinctive opening;
// the plenty "checks the pantry" phrase carries its ", then hangs
// back" follow-on so the pantry-triage line (game.js:6808, which
// continues "— ~N days of fresh on hand...") does NOT match.
const PANTRY_DEPOSIT_PHRASES = [
  "looks at the full shelves",
  "carries the day's surplus to the pantry door",
  "sets the sharing basket down by the fire instead of the pantry",
  "taps the pantry door — full to bursting",
  "watches another basket arrive and laughs",
  "leaves the surplus by the fire for whoever",
];
const PANTRY_PLENTY_PHRASES = [
  "eyes the groaning pantry shelves",
  "checks the pantry before heading out, then hangs back",
  "leaves the foraging basket at the door",
  "takes one look at the full shelves",
  "counts the pantry jars twice",
  "lingers by the full pantry",
  "peeks into the pantry, then turns the foraging party back",
  "rests a hand on the pantry door, satisfied",
  "surveys the stacked shelves",
  "taps the pantry's fullest jar",
  "stands in the pantry doorway a moment",
  "weighs the day's basket against the pantry shelves",
];

function isRaidCallLine(text) { return RAID_CALL_RE.test(text || ''); }
function isRaidLine(text) { return RAID_LINE_RE.test(text || ''); }
function isRaidAftermathLine(text) { return RAID_AFTERMATH_RE.test(text || ''); }
function isOverhearLine(text) { return OVERHEAR_RE.test(text || ''); }
function isFragmentsLine(text) { return FRAGMENTS_RE.test(text || ''); }
function isTaleLine(text) { return TALE_RE.test(text || ''); }
function isWitnessLine(text) { return WITNESS_RE.test(text || ''); }
// pantryKind(text): 'deposit' | 'plenty' | null. Requires the 🍽️
// day-voice prefix AND one pool phrase.
function pantryKind(text) {
  if (!text || text.indexOf('🍽️') !== 0) return null;
  for (const p of PANTRY_DEPOSIT_PHRASES) if (text.indexOf(p) !== -1) return 'deposit';
  for (const p of PANTRY_PLENTY_PHRASES) if (text.indexOf(p) !== -1) return 'plenty';
  return null;
}
function isPantryLine(text) { return pantryKind(text) !== null; }
// kindOf(text): 'raid-call' | 'raid-line' | 'raid-aftermath' |
// 'overhear' | 'fragments' | 'pantry-deposit' | 'pantry-plenty' |
// 'tale' | 'witness' | null.
function kindOf(text) {
  if (!text) return null;
  if (isRaidCallLine(text)) return 'raid-call';
  if (isRaidLine(text)) return 'raid-line';
  if (isRaidAftermathLine(text)) return 'raid-aftermath';
  if (isOverhearLine(text)) return 'overhear';
  if (isFragmentsLine(text)) return 'fragments';
  const pk = pantryKind(text);
  if (pk) return 'pantry-' + pk;
  if (isTaleLine(text)) return 'tale';
  if (isWitnessLine(text)) return 'witness';
  return null;
}

// BEAT_KINDS: the judged family (primary metric) + controls.
const BEAT_KINDS = ['raid-call', 'overhear', 'fragments', 'pantry-deposit', 'pantry-plenty', 'tale'];
const CONTROL_KINDS = ['raid-line', 'raid-aftermath', 'witness'];

// classifyEnddayWindow(lines, markers): every family/control line
// in one window, with kind, verbatim text, and fire-time position.
// perKind[k] = { lines, windows: 0|1 } — windows is 1 when the
// window holds >= 1 line of that kind (the primary metric counts
// WINDOWS, not lines). raid events collapse further: a window
// holding the 🐗 line and/or the 🚨 call scores 1 raid event.
function classifyEnddayWindow(lines, markers) {
  const hits = [];
  for (const l of lines || []) {
    const kind = kindOf(l.text);
    if (!kind) continue;
    hits.push({ idx: l.idx, loopDay: l.loopDay, phase: l.phase,
      part: l.part, kind, text: l.text,
      position: gc.positionAt(markers, l.idx) });
  }
  const perKind = {};
  for (const k of BEAT_KINDS.concat(CONTROL_KINDS)) perKind[k] = { lines: 0, windows: 0 };
  for (const h of hits) {
    perKind[h.kind].lines++;
    perKind[h.kind].windows = 1;
  }
  // Raid event: the 🐗 line + the 🚨 call in one window = 1 event.
  const raidEvent = (perKind['raid-call'].windows || perKind['raid-line'].windows
    || perKind['raid-aftermath'].windows) ? 1 : 0;
  // Burst/settle control, same window, gossipcensus classifiers.
  const gossip = gc.classifyGossipWindow(lines, markers);
  return { n: (lines || []).length, hits, perKind, raidEvent,
    burstEvents: gossip.events, burstLines: gossip.burstLines,
    settleLines: gossip.settleLines, gossipHits: gossip.hits };
}

module.exports = { isRaidCallLine, isRaidLine, isRaidAftermathLine,
  isOverhearLine, isFragmentsLine, isTaleLine, isWitnessLine,
  pantryKind, isPantryLine, kindOf, classifyEnddayWindow,
  BEAT_KINDS, CONTROL_KINDS, PANTRY_DEPOSIT_PHRASES,
  PANTRY_PLENTY_PHRASES,
  RAID_CALL_RE, RAID_LINE_RE, RAID_AFTERMATH_RE, OVERHEAR_RE,
  FRAGMENTS_RE, TALE_RE, WITNESS_RE };
