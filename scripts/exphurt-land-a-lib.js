'use strict';
// exphurt-land-a-lib.js — fixed closing-part capture + LAND judgment
// for sim-exphurt-land-a (oversight-flesh-out-loop, run
// fleshout-20261104T1933Z, axis food-economy). Companion to the
// UNCHANGED prior-arm libs (hurthome-b-lib, exphurt-a-lib,
// exphurt-confirm-a-lib): this file adds ONLY the capture fix the
// Bill s99946 case forced, and the LAND judgment rule. No RNG reads,
// no game-value writes: inputs are only read, never mutated.
//
// THE CAPTURE GAP (STEP 0, verified independently from the corpus
// transcript, not taken on trust): Bill s99946, day-4-part-1 hurt
// event (hp 2, monster), closed day 4 part 2 with
// playerAtHavenAtClose=true, was recorded with closingLines=[]
// — yet the stored transcript for day 4 part 2 DOES contain both
// return lines:
//   "🧭 A man, maybe 40s, with a limp returns from the wilds hurt
//    (health 2/100) — the trip cut short."
//   "🧭 A man, maybe 40s, with a limp is back from far past the
//    west (strange meat (unknown flesh — test it cautiously),
//    4 stories, a new scar) (Ask them what they saw.)"
// The old capture (exphurt-a-lib closingReturnLines) matches on the
// villager's FIRST NAME ("Bill"), but displayName renders a villager
// the player does not know yet in DESCRIPTION form ("A man, maybe
// 40s, with a limp") — so the name filter missed both lines and the
// case read as a silent return. The "silence" was a capture gap,
// not a real silence branch: the return WAS announced, and its
// homecoming line (as usual) does NOT mention hurt — it supports
// the blank, it does not contradict it.
//
// FIXED CAPTURE (template/emoji + close-part window, not name
// alone): per seed, (1) keep the name-matched lines wherever they
// exist (a known villager renders by name — precise, unchanged);
// (2) for a returned case with NO name-matched line in its closing
// part, fall back to the closing part's UNCLAIMED 🧭 return lines,
// but only when they form a coherent hurt-return pair (at least one
// hurthome line AND at least one expeditionReturn line) and this is
// the ONLY unmatched returned case closing in that part — otherwise
// the case stays silent and is flagged ambiguous, never guessed.
// The pair requirement ties the fallback to a hurt return (a
// healthy return fires no hurthome line), and the uniqueness
// requirement refuses to attribute one pair to two cases. Lines
// already claimed by another case's name match in the same part are
// never re-assigned.
const exlib = require('./exphurt-a-lib');

function isCompassReturnLine(line) {
  return typeof line === 'string' && line.indexOf('🧭') !== -1 && exlib.isReturnLine(line);
}

// Fixed closing lines for every case of ONE seed. `cases` are the
// seed's case objects (with closeDay/closePart/name/outcome);
// `transcript` is the seed's [{day, part, line}] capture. Returns
// new case objects (inputs untouched) with `fixedClosingLines` and
// `fixedClosingAmbiguous` added; `closingLines` is left as stored.
//
// SCOPE: only RETURNED cases (outcome 'returned-*') have closing
// return lines at all — their close tick IS a return tick. A
// healed-away/died/censored case's close part is a scan tick, not a
// return, so it gets fixedClosingLines=[] even if that part happens
// to contain a return-sounding line for the same name (gossip,
// a later trip's return, a forage line). The sweep's attachClose
// likewise only ever ran for returns; this keeps the fix from
// inventing closing lines where the old instrument stored none
// by design.
function isReturnedCase(c) {
  return !!c && typeof c.outcome === 'string' && c.outcome.indexOf('returned') === 0;
}

function fixedClosingLinesForSeed(cases, transcript) {
  const cs = (cases || []).map((c) => Object.assign({}, c));
  const byPart = new Map();
  for (const c of cs) {
    if (!isReturnedCase(c)) continue;
    if (c.closeDay == null || c.closePart == null) continue;
    const k = c.closeDay + '|' + c.closePart;
    if (!byPart.has(k)) byPart.set(k, []);
    byPart.get(k).push(c);
  }
  // Claimed lines per part: exact line strings name-matched by any
  // case closing in that part.
  const claimedByPart = new Map();
  const nameLinesByCase = new Map();
  for (const c of cs) {
    let nl = [];
    if (isReturnedCase(c) && c.closeDay != null && c.closePart != null) {
      nl = exlib.closingReturnLines(transcript, c.closeDay, c.closePart, c.name || null);
    }
    nameLinesByCase.set(c, nl);
    if (nl.length) {
      const k = c.closeDay + '|' + c.closePart;
      if (!claimedByPart.has(k)) claimedByPart.set(k, new Set());
      for (const l of nl) claimedByPart.get(k).add(l.line);
    }
  }
  for (const c of cs) {
    if (!isReturnedCase(c)) { c.fixedClosingLines = []; c.fixedClosingAmbiguous = false; continue; }
    const nl = nameLinesByCase.get(c) || [];
    if (nl.length) {
      c.fixedClosingLines = nl;
      c.fixedClosingAmbiguous = false;
      continue;
    }
    c.fixedClosingAmbiguous = false;
    if (c.closeDay == null || c.closePart == null) { c.fixedClosingLines = []; continue; }
    const k = c.closeDay + '|' + c.closePart;
    const partCases = byPart.get(k) || [];
    const unmatchedInPart = partCases.filter((o) => (nameLinesByCase.get(o) || []).length === 0);
    if (unmatchedInPart.length !== 1) {
      // Either this case is not the only unmatched closer in its
      // part (cannot attribute), or the part has no unmatched
      // closers at all — either way, stay silent, flag it.
      if (unmatchedInPart.length > 1) c.fixedClosingAmbiguous = true;
      c.fixedClosingLines = [];
      continue;
    }
    const claimed = claimedByPart.get(k) || new Set();
    const candidates = [];
    for (const t of (transcript || [])) {
      if (t.day !== c.closeDay || t.part !== c.closePart) continue;
      if (!isCompassReturnLine(t.line)) continue;
      if (claimed.has(t.line)) continue;
      candidates.push(exlib.classifyReturnLine(t.line));
    }
    const hasHurt = candidates.some((l) => l.isHurthome);
    const hasExp = candidates.some((l) => l.isExpeditionReturn);
    if (hasHurt && hasExp) {
      c.fixedClosingLines = candidates;
    } else {
      c.fixedClosingLines = [];
    }
  }
  return cs;
}

// Cases with closingLines replaced by their fixed lines, ready for
// the unchanged exlib.summarize / confirm-lib m1All judges.
function withFixedLines(cases, transcript) {
  return fixedClosingLinesForSeed(cases, transcript).map((c) => {
    const out = Object.assign({}, c);
    out.closingLines = c.fixedClosingLines;
    return out;
  });
}

// LAND judgment, verbatim from sim-exphurt-land-a-prereg.md:
// GO iff (a) M1 >= 0.80 among announced expedition returns,
// (b) median daysAlive delta (matched seeds, post minus pre) >= -5,
// (c) instrument errors 0, (d) node scripts/check.js --quick green,
// (e) hook diff touches ONLY expeditionReturn's line block in
// src/js/villager-agency.js, (f) healthy returns byte-identical
// (proof test). Instrument failure (errors > 0) is
// INSUFFICIENT-DATA, never a scored verdict; any other missed leg
// is NO-GO.
function judgeLand(legs) {
  const l = legs || {};
  if (l.errors != null && l.errors > 0) return 'INSUFFICIENT-DATA';
  if (l.M1 == null) return 'INSUFFICIENT-DATA';
  if (l.M1 < 0.80) return 'NO-GO';
  if (l.medianDelta == null || l.medianDelta < -5) return 'NO-GO';
  if (!l.checkQuickGreen) return 'NO-GO';
  if (!l.diffOnlyLineBlock) return 'NO-GO';
  if (!l.healthyByteIdentical) return 'NO-GO';
  return 'GO';
}

module.exports = { isCompassReturnLine, fixedClosingLinesForSeed, withFixedLines, judgeLand };
