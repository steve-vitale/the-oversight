// journey-social-r153-helpers.js -- pure helpers shared by the r153 social
// driver and analyzer (Lane B, 2026-11-07). No src/js changes, no Game calls.
//   aggregateNightlyNews(dayLines): per-day haven-news census from
//     emit-time classified lines. Each line: { kind, atHaven, atHavenGate }.
//     atHaven = scholarAtHaven() (on-tile, strict); atHavenGate =
//     playerAtHaven() (radius-1, the sim-awaynaming gate's definition).
//     Plain counts = delivered at Haven; *Away = strict-away (defect
//     under the old M6); *AwayGate = gate-away (defect under the re-aligned
//     M6 — a line emitted while the scholar is beyond radius-1 of Haven).
//   summarizeBondProposed(records): panel/seed rollup of bond_proposed
//     live-capture records { initiatorKind: 'scholar'|'villager', kind:
//     'person'|'link', outcome, initiator }. Reports counts by
//     initiatorKind, kind, outcome, per-initiator totals (amendment-5
//     cap: per-initiator <=8/90d), and link raises separately.
//   tallyOffered(transcripts): offered choice-id tally across transcripts
//     (goal-thread react surfacing: 'more' vs agree/joke/silence vs
//     follow:goal:0) + longest run of consecutive 'more' offers.
//   summarizeCounters(proposeCalls, counterSettles, counterAnswers,
//     pendingCounterEnd): r153 job B rollup — fresh vs blocked proposeLink
//     calls (pendingBefore), settles and links formed, answers by how.
//   tallyRecap(transcripts): r153 job C rollup — recap presses per
//     conversation, cap failures (6+ presses in one conversation) and
//     'recap' offered after the 5th press (spend-out not firing).
// Proof: scripts/test-journey-social-r153.js (fixture-driven, RED->GREEN).
'use strict';

function aggregateNightlyNews(dayLines) {
  const out = {
    burst: 0, settle: 0, witness: 0, tale: 0,
    burstAway: 0, settleAway: 0, witnessAway: 0, taleAway: 0,
    burstAwayGate: 0, settleAwayGate: 0, witnessAwayGate: 0, taleAwayGate: 0,
  };
  for (const l of dayLines || []) {
    if (!l || !l.kind) continue;
    const k = l.kind;
    if (k !== 'burst' && k !== 'settle' && k !== 'witness' && k !== 'tale') continue;
    out[k]++;
    // Strict (on-tile) classification: missing flag reads as at-Haven
    // (r141/r145 JSONs predate the gate flag — they must not inflate Away).
    if (l.atHaven === false) out[k + 'Away']++;
    // Gate (radius-1) classification: missing flag ALSO reads as at-Haven,
    // so old rows contribute 0 gate-away by construction.
    if (l.atHavenGate === false) out[k + 'AwayGate']++;
  }
  return out;
}

function summarizeBondProposed(records) {
  const recs = (records || []).filter(r => r && typeof r === 'object');
  const by = (key) => {
    const o = {};
    for (const r of recs) { const k = key(r); o[k] = (o[k] || 0) + 1; }
    return o;
  };
  const perInitiator = {};
  for (const r of recs) {
    const k = (r.initiatorKind || '?') + ':' + (r.initiator || '?');
    perInitiator[k] = (perInitiator[k] || 0) + 1;
  }
  const person = recs.filter(r => r.kind === 'person');
  const link = recs.filter(r => r.kind === 'link');
  return {
    total: recs.length,
    byInitiatorKind: by(r => r.initiatorKind || '?'),
    byKind: by(r => r.kind || '?'),
    byOutcome: by(r => r.outcome || '?'),
    byKindOutcome: by(r => (r.kind || '?') + ':' + (r.outcome || '?')),
    villagerPerson: person.filter(r => r.initiatorKind === 'villager').length,
    villagerPersonAccepted: person.filter(r => r.initiatorKind === 'villager' && r.outcome === 'accepted').length,
    scholarPerson: person.filter(r => r.initiatorKind === 'scholar').length,
    linkRaises: link.length,
    linkAccepted: link.filter(r => r.outcome === 'accepted').length,
    perInitiator,
    maxPerInitiator: Math.max(0, ...Object.values(perInitiator)),
  };
}

function tallyOffered(transcripts) {
  const counts = {};
  let moreOffers = 0, reactOffers = 0, goalFollowOffers = 0;
  for (const t of transcripts || []) {
    const offered = (t && t.offered) || [];
    for (const turn of offered) {
      for (const id of (Array.isArray(turn) ? turn : [])) {
        counts[id] = (counts[id] || 0) + 1;
        if (id === 'more') moreOffers++;
        if (id === 'agree' || id === 'joke' || id === 'silence') reactOffers++;
        if (id === 'follow:goal:0') goalFollowOffers++;
      }
    }
  }
  // Longest run of consecutive player continuer presses ('more' picks) in
  // any transcript: the YOU lines that are continuer labels (convoMoreLabel
  // pools + dlg:more variants). The follow-up label ('Tell me more about
  // what you want to do.') is NOT a continuer — it ends the run.
  const CONTINUER = /tell me more\.?["”]?$|^["“]go on|take your time|and then\?|what happened next|then what|i'?m listening|don'?t stop there|what were you going to say/i;
  let longestMoreRun = 0;
  for (const t of transcripts || []) {
    let run = 0;
    for (const e of (t.transcript || [])) {
      if (e.who !== 'YOU') continue;
      if (CONTINUER.test(String(e.text || ''))) { run++; if (run > longestMoreRun) longestMoreRun = run; }
      else run = 0;
    }
  }
  return { counts, moreOffers, reactOffers, goalFollowOffers, longestMoreRun };
}

module.exports = { aggregateNightlyNews, summarizeBondProposed, tallyOffered, summarizeCounters, tallyRecap };

function summarizeCounters(proposeCalls, counterSettles, counterAnswers, pendingCounterEnd) {
  const calls = (proposeCalls || []).filter(c => c && typeof c === 'object');
  const links = calls.filter(c => (c.method || 'proposeLink') === 'proposeLink');
  const isCounter = (c) => String(c.result || '') === '"counter"';
  const fresh = links.filter(c => c.pendingBefore === false);
  const blocked = links.filter(c => c.pendingBefore === true);
  const unknown = links.filter(c => c.pendingBefore !== false && c.pendingBefore !== true);
  const settles = (counterSettles || []).filter(s => s && typeof s === 'object');
  const answers = (counterAnswers || []).filter(a => a && typeof a === 'object');
  const byHow = {};
  for (const a of answers) { const k = a.how || '?'; byHow[k] = (byHow[k] || 0) + 1; }
  return {
    proposeLinkCalls: links.length,
    proposeLinkCounter: links.filter(isCounter).length,
    freshCalls: fresh.length,
    freshCounter: fresh.filter(isCounter).length,
    blockedCalls: blocked.length,
    blockedCounter: blocked.filter(isCounter).length,
    unknownPendingCalls: unknown.length,
    settles: settles.length,
    settlesLinkFormed: settles.filter(s => s.linkFormed === true).length,
    settlesLinkFailed: settles.filter(s => s.linkFormed === false).length,
    settlesUnknown: settles.filter(s => s.linkFormed !== true && s.linkFormed !== false).length,
    answers: answers.length,
    answersByHow: byHow,
    answersLinkFormed: answers.filter(a => a.linkFormed === true).length,
    minPantryAtSettle: (() => { const ps = settles.map(s => s.pantryKcalAtSettle).filter(v => v != null); return ps.length ? Math.min(...ps) : null; })(),
    tributes: settles.map(s => s.tribute).filter(t => t != null),
    pendingCounterEnd: pendingCounterEnd || null,
  };
}

function tallyRecap(transcripts) {
  let maxRecapPresses = 0, totalPresses = 0, offeredAfterCap = 0;
  const capFailures = [];
  for (const t of transcripts || []) {
    if (!t || typeof t !== 'object') continue;
    let presses = (typeof t.recapPresses === 'number') ? t.recapPresses : null;
    if (presses == null) {
      // Fallback for transcripts without the driver field: count YOU lines
      // carrying the recap label.
      presses = ((t.transcript || []).filter(e => e.who === 'YOU' && /what were we talking about/i.test(String(e.text || '')))).length;
    }
    totalPresses += presses;
    if (presses > maxRecapPresses) maxRecapPresses = presses;
    if (t.recapOfferedAfterCap) offeredAfterCap++;
    if (presses >= 6) capFailures.push({ tag: t.tag || '?', vid: t.vid || '?', day: t.day == null ? null : t.day, presses, offeredAfterCap: !!t.recapOfferedAfterCap });
  }
  return { maxRecapPresses, totalPresses, offeredAfterCap, capFailures };
}
