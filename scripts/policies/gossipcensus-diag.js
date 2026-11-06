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

// ---- catch-up summaries (sim-catchup-summary-a 2026-11-06) ----
// The summary arm replaces verbatim held-line delivery with at most
// three lines per return: the framing line (unchanged from the rereg
// fix) + one burst summary + one settle summary. These classifiers
// are the SINGLE source of truth for the summary text formats — the
// driver, the compare, and the proof test all parse through here, so
// a wording change in game.js that breaks the parse fails the run
// instead of silently unaccounting lines. Pure string functions: no
// state, no RNG. The formats are preregistered in
// evidence/2026-11-06/sim-catchup-summary-a-prereg.md — the code in
// game.js must emit exactly these templates.
//
// Framing (verbatim rereg line):
//   While you were away, the haven argued over what to call it — they catch you up at the fire:
// Burst summary (one line per return, >= 1 held burst line):
//   They argued over names for 4 beasts — 4 words, 4 debates: "The Loud Beast" (2), "The Ugly Beast" (2).
//   Header carries the word count and the debate count SEPARATELY
//   (per-kind ledger); each clause is "FirstProposal" (n) with n =
//   that monster's held burst lines (normally 2 = 1 word + 1 debate).
// Settle summary (one line per return, >= 1 held settle line):
//   They settled names for 5 beasts: "Big-Eyes", "Ugly-Eyes".
//   Beast count == names listed == held settle lines (1 per beast).
const FRAMING_RE = /^While you were away, the haven argued over what to call it — they catch you up at the fire:$/;
const BURST_SUMMARY_RE = /^They argued over names for (\d+) beasts? — (\d+) words?, (\d+) debates?: (.*)\.$/;
const SETTLE_SUMMARY_RE = /^They settled names for (\d+) beasts?: (.*)\.$/;
const SUMMARY_CLAUSE_RE = /"([^"]*)" \((\d+)\)/g;
const SUMMARY_NAME_RE = /"([^"]*)"/g;

function isFramingLine(text) { return FRAMING_RE.test(text || ''); }
function isBurstSummaryLine(text) { return BURST_SUMMARY_RE.test(text || ''); }
function isSettleSummaryLine(text) { return SETTLE_SUMMARY_RE.test(text || ''); }
function isSummaryLine(text) {
  return isFramingLine(text) || isBurstSummaryLine(text) || isSettleSummaryLine(text);
}
// parseSummaryLine(text): {kind:'framing'} | {kind:'burst', beasts,
// words, debates, clauses:[{name, n}]} | {kind:'settle', beasts,
// names:[...]} | null. Returns null (not an error) for non-summary
// text. A burst summary whose clause counts do not sum to
// words+debates, or a settle summary whose names do not number
// `beasts`, parses with `inconsistent: true` — the compare fails the
// run on it; the parser never silently repairs counts.
function parseSummaryLine(text) {
  if (!text) return null;
  if (FRAMING_RE.test(text)) return { kind: 'framing' };
  let m = BURST_SUMMARY_RE.exec(text);
  if (m) {
    const beasts = parseInt(m[1], 10), words = parseInt(m[2], 10), debates = parseInt(m[3], 10);
    const clauses = [];
    let cm;
    SUMMARY_CLAUSE_RE.lastIndex = 0;
    while ((cm = SUMMARY_CLAUSE_RE.exec(m[4])) !== null) clauses.push({ name: cm[1], n: parseInt(cm[2], 10) });
    const clauseSum = clauses.reduce((t, c) => t + c.n, 0);
    return { kind: 'burst', beasts, words, debates, clauses,
      inconsistent: clauses.length !== beasts || clauseSum !== words + debates };
  }
  m = SETTLE_SUMMARY_RE.exec(text);
  if (m) {
    const beasts = parseInt(m[1], 10);
    const names = [];
    let nm;
    SUMMARY_NAME_RE.lastIndex = 0;
    while ((nm = SUMMARY_NAME_RE.exec(m[2])) !== null) names.push(nm[1]);
    return { kind: 'settle', beasts, names, inconsistent: names.length !== beasts };
  }
  return null;
}

module.exports = { isGossipWordLine, isDebateLine, isSettleLine,
  isGossipBurstLine, kindOf, scholarPos, positionAt,
  classifyGossipWindow,
  isFramingLine, isBurstSummaryLine, isSettleSummaryLine,
  isSummaryLine, parseSummaryLine,
  GOSSIP_WORD_RE, GOSSIP_DEBATE_RE, SETTLE_RE };
