// routstall-analyze-20261106.js — 159-round rout trace analyzer
// (arm sim-routstall-b, run fleshout-loop-b-20261106T2300Z). DIAG ONLY.
// Pure function over a routstall-driver corpus file: extracts the
// Congregation trace, censuses verbs/hits/turns round by round, names the
// repeating pattern, classifies the terminator from the driver's tbEndCalls
// (watchdog vs engine), and compares with the 121-round Strike standoff
// trace (fightinterior-b corpus). No game reads, no re-scoring.
// Usage: node scripts/routstall-analyze-20261106.js <corpus.json> [strike-trace.json]
'use strict';
const fs = require('fs');

function verbCensus(tr) {
  const byVerb = {}, byActor = {};
  (tr.verbs || []).forEach(function (v) {
    byVerb[v.verb] = (byVerb[v.verb] || 0) + 1;
    if (v.verb === 'move' && v.to) {
      const k = v.to.join(',');
      byActor['move->' + k] = (byActor['move->' + k] || 0) + 1;
    }
  });
  return { byVerb: byVerb, moveTargets: byActor };
}
function hitCensus(tr) {
  let dealt = 0, taken = 0, hits = 0, monsterHits = 0, scholarHitsTaken = 0;
  let firstHit = null, lastHit = null, lastScholarHitTaken = null, lastMonsterHpDrop = null;
  const perRound = {};
  (tr.hits || []).forEach(function (h) {
    hits++;
    const d = (h.dmg | 0) || 0;
    if (h.tgtKind === 'monster' || h.tgtKind === 'hostile') {
      dealt += d; monsterHits++;
      if (d > 0) { lastMonsterHpDrop = h.r; }
    }
    if (h.tgt === 'p') { taken += d; scholarHitsTaken++; if (d > 0) lastScholarHitTaken = h.r; }
    if (firstHit === null) firstHit = h.r;
    lastHit = h.r;
    perRound[h.r] = (perRound[h.r] || 0) + 1;
  });
  return { hits: hits, dealt: dealt, taken: taken, monsterHits: monsterHits,
    scholarHitsTaken: scholarHitsTaken, firstHitRound: firstHit, lastHitRound: lastHit,
    lastScholarHitTakenRound: lastScholarHitTaken, lastMonsterHpDropRound: lastMonsterHpDrop,
    roundsWithHits: Object.keys(perRound).length };
}
function turnCensus(tr) {
  const byActor = {}, byVerb = {};
  let monsterTurns = 0, allyTurns = 0, noDmgMonsterTurns = 0;
  (tr.turns || []).forEach(function (t) {
    byActor[t.actor] = (byActor[t.actor] || 0) + 1;
    byVerb[t.verb] = (byVerb[t.verb] || 0) + 1;
    if (t.verb === 'tbMonsterTurn') {
      monsterTurns++;
      if ((t.dealt | 0) === 0 && (t.struck | 0) === 0) noDmgMonsterTurns++;
    }
    if (t.verb === 'tbVillagerTurn') allyTurns++;
  });
  return { byActor: byActor, byVerb: byVerb, monsterTurns: monsterTurns,
    allyTurns: allyTurns, noDmgMonsterTurns: noDmgMonsterTurns };
}
function hpCurve(tr, step) {
  // Scholar HP and monster HP at end of each sampled round, from the hit log.
  const pts = [];
  let sHp = null, mHp = null;
  const hits = (tr.hits || []).slice().sort(function (a, b) { return (a.r || 0) - (b.r || 0); });
  const rounds = tr.rounds || 0;
  let hi = 0;
  for (let r = 1; r <= rounds; r++) {
    while (hi < hits.length && (hits[hi].r || 0) <= r) {
      const h = hits[hi++];
      if (h.tgt === 'p') sHp = h.hpAfter;
      if (h.tgtKind === 'monster' || h.tgtKind === 'hostile') mHp = h.hpAfter;
    }
    if (r % step === 0 || r === 1 || r === rounds) pts.push({ r: r, scholarHp: sHp, monsterHp: mHp });
  }
  return pts;
}
function lastRounds(tr, n) {
  const out = { verbs: [], hits: [], turns: [] };
  const from = (tr.rounds || 0) - n + 1;
  (tr.verbs || []).forEach(function (v) { if ((v.r || 0) >= from) out.verbs.push(v); });
  (tr.hits || []).forEach(function (h) { if ((h.r || 0) >= from) out.hits.push(h); });
  (tr.turns || []).forEach(function (t) { if ((t.r || 0) >= from) out.turns.push(t); });
  return out;
}
function classifyTerminator(corpus, congTrace) {
  const calls = (corpus.tbEndCalls || []).filter(function (c) {
    return c.day === congTrace.day && (c.round === congTrace.rounds || (c.round != null && Math.abs(c.round - (congTrace.rounds || 0)) <= 1));
  });
  const routed = calls.filter(function (c) { return c.result === 'routed'; });
  const out = { matchingTbEndCalls: calls, routedCalls: routed, verdict: 'unknown', evidence: [] };
  routed.forEach(function (c) {
    const stack = c.stack || '';
    if (/sim-harness/.test(stack)) { out.verdict = 'harness-watchdog'; out.evidence.push('tbEnd stack runs through sim-harness.js (TIME-FREEZE WATCHDOG) at loopDay ' + c.loopDay + ', frozenSleeps=' + c.frozenSleeps); }
    else if (/tbEndCheck|tbMonsterTurn|abilityActions|game\.js/.test(stack)) { out.verdict = 'engine'; out.evidence.push('tbEnd stack runs through game.js/abilityActions at loopDay ' + c.loopDay + ', frozenSleeps=' + c.frozenSleeps); }
    else { out.evidence.push('tbEnd stack unrecognized: ' + stack.slice(0, 200)); }
  });
  if (!routed.length) out.evidence.push('no tbEnd routed call matched the Congregation trace day/round in tbEndCalls');
  const streaks = (corpus.frozenStreaks || []).filter(function (s) { return s.sday === congTrace.day; });
  out.frozenStreaksOnFightDay = streaks;
  if (streaks.some(function (s) { return (s.frozen | 0) >= 8; })) out.evidence.push('frozen-sleep streak hit >=8 on the fight day (watchdog trigger)');
  return out;
}

function analyze(corpusPath, strikePath) {
  const corpus = JSON.parse(fs.readFileSync(corpusPath, 'utf8'));
  const cong = (corpus.traces || []).filter(function (t) { return t.mid === 'congregation'; });
  const report = { corpus: corpusPath, seed: corpus.seed, policy: corpus.policy,
    anchorCommit: corpus.anchorCommit, days: corpus.days, endReason: corpus.endReason,
    instrumentErrors: corpus.instrumentErrors, congTraces: [] };
  cong.forEach(function (tr) {
    const vc = verbCensus(tr);
    const hc = hitCensus(tr);
    const tc = turnCensus(tr);
    const entryDmg = (tr.entryHp != null && tr.mHpLeft != null) ? (tr.entryHp - tr.mHpLeft) : null;
    report.congTraces.push({
      day: tr.day, rounds: tr.rounds, ending: tr.ending, outcome: tr.outcome,
      entryHp: tr.entryHp, entryFrac: tr.entryFrac, mHpLeft: tr.mHpLeft, mHpLeftFrac: tr.mHpLeftFrac,
      scholarHpEnd: tr.scholarHpEnd, scholarHpFracEnd: tr.scholarHpFracEnd,
      alliesAtEntry: tr.alliesAtEntry, partyAtEntry: tr.partyAtEntry, fighters: tr.fighters,
      rallyRound: tr.rallyRound, scholarStruckRallyRound: tr.scholarStruckRallyRound,
      entryDamageDealt: entryDmg,
      verbCensus: vc.byVerb, moveTargets: vc.moveTargets,
      hitCensus: hc, turnCensus: tc,
      hpCurveEvery10: hpCurve(tr, 10),
      last10Rounds: lastRounds(tr, 10),
      first10Rounds: { verbs: (tr.verbs || []).filter(function (v) { return (v.r || 0) <= 10; }),
        hits: (tr.hits || []).filter(function (h) { return (h.r || 0) <= 10; }) },
      terminator: classifyTerminator(corpus, tr),
    });
  });
  if (strikePath) {
    try {
      const sc = JSON.parse(fs.readFileSync(strikePath, 'utf8'));
      const st = (sc.traces || []).find(function (t) { return t.mid === 'strike' && (t.rounds || 0) > 100; });
      if (st) {
        report.strikeComparison = {
          day: st.day, rounds: st.rounds, ending: st.ending,
          verbCensus: verbCensus(st).byVerb, moveTargets: verbCensus(st).moveTargets,
          hitCensus: hitCensus(st), turnCensus: turnCensus(st),
          mHpLeftFrac: st.mHpLeftFrac, scholarHpFracEnd: st.scholarHpFracEnd,
        };
      }
    } catch (e) { report.strikeComparisonError = String(e.message); }
  }
  return report;
}

if (require.main === module) {
  const corpusPath = process.argv[2];
  const strikePath = process.argv[3] || null;
  if (!corpusPath) { console.error('ROUTSTALL-ANALYZE STOP: corpus path required.'); process.exit(2); }
  const report = analyze(corpusPath, strikePath);
  console.log(JSON.stringify(report, null, 2));
}

module.exports = { analyze: analyze, verbCensus: verbCensus, hitCensus: hitCensus,
  turnCensus: turnCensus, hpCurve: hpCurve, classifyTerminator: classifyTerminator };
