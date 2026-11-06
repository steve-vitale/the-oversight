// journey-social-r149-helpers.js -- pure helpers shared by the r149 social
// driver and analyzer (Lane B, 2026-11-06). No src/js changes, no Game calls.
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
// Proof: scripts/test-journey-social-r149.js (fixture-driven, RED->GREEN).
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

module.exports = { aggregateNightlyNews, summarizeBondProposed, tallyOffered };
