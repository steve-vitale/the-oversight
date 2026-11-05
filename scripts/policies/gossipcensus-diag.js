// gossipcensus-diag — haven-gossip burst classifiers + fire-time
// position reader (sim-gossipcensus-a, 2026-11-05, flesh-out loop,
// axis food-economy).
//
// The transcript recorder + window machinery is REUSED VERBATIM from
// scripts/policies/strandnarr-diag.js (sim-strandnarr-a, 2026-11-04):
// the full-transcript wrap (Game.say/sysSay), phase markers, and the
// sleep/upkeep window slicers. This module adds ONLY the gossip
// classification on top of that judged instrument — no new wrapping,
// no new RNG, no state edits.
//
// THE BURST (game.js monsterNewsCheck -> kickMonsterNaming ->
// seedMonsterNames): when enough villagers know of a reported
// monster, the engine says BOTH lines in one burst, with NO position
// gate anywhere in the chain:
//   1. 'Word gets around the haven. Whatever that thing was — ...'
//      (3 rotLine variants, monsterReaction pool)
//   2. 'Back at the haven the argument starts: <who> is calling it
//      "<name>." ...' (3 rotLine variants, monsterDebate pool)
// One burst = two lines = ONE gossip event. The census counts events
// per window (a window with both lines scores 1 event, 2 line hits).
//
// EXCLUSIONS (never counted): teachGossip 'Word gets around.'
// (game.js:18151), 'You back "<name>." Word gets around.'
// (game.js:23142), '(Word gets around: Haven feeds travelers. ...)'
// (game.js:26477), hierarchy 'Word gets around <village>:' and truth
// 'Word gets around the fire:'. The classifier matches ONLY the two
// burst templates above — the bare 'Word gets around' prefix is
// deliberately NOT a match on its own.
//
// SECONDARY (reported, never in the primary numerator): the
// naming-settle line "It's settled. The village is calling it
// '<name>.'" (monsterNamingCheck) — the argument's conclusion, a
// different beat from the burst.
//
// Position at fire time: the nearest marker at or before the line's
// idx (markers carry insideHaven, mx/my, tile, access, pantryKcal).
// Inside a sleep window the scholar does not move, so the sleep-start
// marker IS the fire-time position; inside an upkeep window the
// scholar does not travel either. Daily-window bursts resolve to the
// nearest preceding marker and are labelled as such.
'use strict';

const sn = require('./strandnarr-diag');

const GOSSIP_WORD_RE = /Word gets around the haven/;
const GOSSIP_DEBATE_RE = /Back at the haven the argument starts:/;
const SETTLE_RE = /It's settled\. The village is calling it/;

function isGossipWordLine(text) { return GOSSIP_WORD_RE.test(text || ''); }
function isDebateLine(text) { return GOSSIP_DEBATE_RE.test(text || ''); }
function isSettleLine(text) { return SETTLE_RE.test(text || ''); }
// isGossipBurstLine: either half of the monsterNewsCheck burst.
function isGossipBurstLine(text) {
  return isGossipWordLine(text) || isDebateLine(text);
}
// kindOf(text): 'word' | 'debate' | 'settle' | null.
function kindOf(text) {
  if (!text) return null;
  if (isGossipWordLine(text)) return 'word';
  if (isDebateLine(text)) return 'debate';
  if (isSettleLine(text)) return 'settle';
  return null;
}

// scholarPos(Game): fire-time position snapshot — insideHaven, map
// coordinates, tile type. Reads only; never edits state.
function scholarPos(Game) {
  try {
    const s = (Game.state || {}).scholar || {};
    return {
      inside: (s.insideHaven === undefined ? null : !!s.insideHaven),
      mx: (s.mx === undefined || s.mx === null ? null : s.mx),
      my: (s.my === undefined || s.my === null ? null : s.my),
      tile: sn.tileOf(Game),
    };
  } catch (e) { return { inside: null, mx: null, my: null, tile: null }; }
}

// positionAt(markers, idx): the marker with the greatest idx <= the
// line's idx (the window-start marker for sleep/upkeep lines). Returns
// null when no marker precedes the line.
function positionAt(markers, idx) {
  let best = null;
  for (const m of markers || []) {
    if (m.idx <= idx && (!best || m.idx >= best.idx)) best = m;
  }
  if (!best) return null;
  return { kind: best.kind, loopDay: best.loopDay, part: best.part,
    inside: best.inside, mx: (best.mx === undefined ? null : best.mx),
    my: (best.my === undefined ? null : best.my), tile: best.tile,
    access: best.access };
}

// classifyGossipWindow(lines, markers): every burst/settle line in
// one window, with kind, verbatim text, and fire-time position.
// events counts bursts: a window holding both halves of one burst
// scores 1 event (the two halves always fire adjacently from one
// monsterNewsCheck call, so consecutive word+debate lines collapse
// to one event; a lone half still scores 1).
function classifyGossipWindow(lines, markers) {
  const hits = [];
  for (const l of lines || []) {
    const kind = kindOf(l.text);
    if (!kind) continue;
    hits.push({ idx: l.idx, loopDay: l.loopDay, phase: l.phase,
      part: l.part, kind, text: l.text,
      position: positionAt(markers, l.idx) });
  }
  const burstHits = hits.filter((h) => h.kind === 'word' || h.kind === 'debate');
  let events = 0;
  for (let i = 0; i < burstHits.length; i++) {
    // A debate line immediately following a word line (same burst,
    // adjacent idx) is the second half, not a new event.
    if (burstHits[i].kind === 'debate' && i > 0 && burstHits[i - 1].kind === 'word'
      && burstHits[i].idx === burstHits[i - 1].idx + 1) continue;
    events++;
  }
  return { n: (lines || []).length, hits, burstHits,
    burstLines: burstHits.length, events,
    settleLines: hits.filter((h) => h.kind === 'settle').length };
}

module.exports = { isGossipWordLine, isDebateLine, isSettleLine,
  isGossipBurstLine, kindOf, scholarPos, positionAt,
  classifyGossipWindow,
  GOSSIP_WORD_RE, GOSSIP_DEBATE_RE, SETTLE_RE };
