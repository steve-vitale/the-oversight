// diplo-analyze-20261104.js — diplomacy-pipeline analyzer (arm sim-diplo-b).
// Pure functions over a per-seed JSON corpus: no Game, no harness.
// Stage key: S0 villages exist, S1 known, S2 opinion>=10 (or any
// nonzero opinion), S3 village-tile day or codex study, S4 proposal
// attempted, S5 proposal judged (accept/counter/decline, i.e. not
// gate-refused), S6 link formed, S7 seasoned, S8 regional+.
// Proposal outcome classification (from returns + state, never from
// a say-line alone): a proposal is ACCEPTED if a new link naming
// its target appears within 2 days; COUNTERED if a pendingCounter /
// pendingAccord appears within 2 days; DECLINED if the verb returned
// a non-null judged result and neither appeared; REFUSED if the verb
// returned null and no link/counter followed (knowledge or opinion
// gate — the return carries no gate label, so refused is reported
// as one bucket, with the target's known/opinion state alongside).
// 'use strict';
function linkTargets(link) {
  const out = [];
  if (!link || typeof link !== 'object') return out;
  if (link.primary && link.primary !== 'haven') out.push(link.primary);
  if (link.subordinate && link.subordinate !== 'haven') out.push(link.subordinate);
  if (link.a && link.a !== 'haven') out.push(link.a);
  if (link.b && link.b !== 'haven') out.push(link.b);
  return out;
}

function classifyProposal(ev, out) {
  const day = ev.day;
  const target = ev.target;
  const formed = (out.linkFormedEvents || []).filter(function (f) {
    return f.day >= day && f.day <= day + 2 && linkTargets(f.link).indexOf(target) >= 0;
  });
  if (formed.length) return 'accepted';
  const countered = (out.daily || []).some(function (s) {
    return s.day >= day && s.day <= day + 2 && s.pending && (s.pending.counter || s.pending.accord);
  });
  if (countered) return 'countered';
  if (ev.ret == null) return 'refused';
  return 'declined';
}

function summarizeSeed(out) {
  const daily = out.daily || [];
  const first = daily[0] || null;
  const last = daily[daily.length - 1] || null;
  const s = {
    seed: out.seed, policy: out.policy, run: out.run, anchorCommit: out.anchorCommit,
    days: out.days, endReason: out.endReason, won: out.won, villageLost: out.villageLost,
    scaleRank: out.scaleRank, maxWave: out.maxWave, endUnlockedWave: out.endUnlockedWave,
    endCallMovedPeak: out.endCallMovedPeak, instrumentErrors: (out.instrumentErrors || []).length,
  };
  // S0/S1/S2 across all snapshots.
  let ovEver = 0, knownEver = 0, knownNames = [], bestOpinion = null, bestOpinionVillage = null;
  let nonzeroOpinionVillages = 0, opinion10Villages = 0;
  const seenKnown = {}, seenNonzero = {}, seen10 = {};
  for (const snap of daily) {
    for (const ov of (snap.ovs || [])) {
      ovEver = Math.max(ovEver, 0);
      if (ov.known && !seenKnown[ov.id]) { seenKnown[ov.id] = true; knownNames.push(ov.id); }
      if (ov.opinion != null) {
        if (bestOpinion == null || ov.opinion > bestOpinion) { bestOpinion = ov.opinion; bestOpinionVillage = ov.id; }
        if (ov.opinion !== 0 && !seenNonzero[ov.id]) seenNonzero[ov.id] = true;
        if (ov.opinion >= 10 && !seen10[ov.id]) seen10[ov.id] = true;
      }
    }
  }
  ovEver = first ? (first.ovs || []).length : 0;
  const ovMax = daily.reduce(function (m, snap) { return Math.max(m, (snap.ovs || []).length); }, 0);
  knownEver = Object.keys(seenKnown).length;
  nonzeroOpinionVillages = Object.keys(seenNonzero).length;
  opinion10Villages = Object.keys(seen10).length;
  s.ovAtDay1 = ovEver; s.ovMax = ovMax; s.knownEver = knownEver; s.knownNames = knownNames;
  s.bestOpinion = bestOpinion; s.bestOpinionVillage = bestOpinionVillage;
  s.nonzeroOpinionVillages = nonzeroOpinionVillages; s.opinion10Villages = opinion10Villages;
  // S3 travel / codex.
  const tileDays = daily.filter(function (snap) { return !!snap.onVillageTile; });
  const distinctTiles = {};
  tileDays.forEach(function (snap) { distinctTiles[snap.onVillageTile] = true; });
  const codexCalls = (out.courtshipEvents || []).filter(function (e) { return e.fn === 'studyVillageCodex'; });
  s.villageTileDays = tileDays.length; s.distinctVillageTiles = Object.keys(distinctTiles);
  s.villageTileVillages = Object.keys(distinctTiles); s.codexStudyCalls = codexCalls.length;
  s.codexStudyTargets = codexCalls.map(function (e) { return e.target; });
  s.travelToCalls = (out.travelCalls || []).length;
  s.travelVillageHits = (out.travelCalls || []).filter(function (c) { return !!c.onVillageTile; }).length;
  // S4/S5 proposals.
  const props = (out.proposalEvents || []).filter(function (e) { return e.fn !== 'proposeAlliance'; });
  const alliances = (out.proposalEvents || []).filter(function (e) { return e.fn === 'proposeAlliance'; });
  const classified = props.map(function (ev) { return { day: ev.day, fn: ev.fn, target: ev.target, outcome: classifyProposal(ev, out), retNull: ev.ret == null }; });
  const outcomes = {};
  classified.forEach(function (c) { outcomes[c.outcome] = (outcomes[c.outcome] || 0) + 1; });
  s.proposalCalls = props.length; s.proposalByFn = {};
  props.forEach(function (e) { s.proposalByFn[e.fn] = (s.proposalByFn[e.fn] || 0) + 1; });
  s.proposalOutcomes = outcomes; s.proposals = classified;
  s.allianceCalls = alliances.length;
  s.allianceOutcomes = {};
  alliances.forEach(function (e) { const o = classifyProposal(e, out); s.allianceOutcomes[o] = (s.allianceOutcomes[o] || 0) + 1; });
  // S6/S7/S8 links.
  s.linksFormed = (out.linkFormedEvents || []).length;
  s.linksFormedDetail = (out.linkFormedEvents || []).map(function (f) { return { day: f.day, link: f.link }; });
  const finalFunnel = last ? last.linkFunnel : null;
  s.finalFunnel = finalFunnel ? { total: finalFunnel.total, active: finalFunnel.active, seasoned: finalFunnel.seasoned, regionalPlus: finalFunnel.regionalPlus, seasonedNotRegional: finalFunnel.seasonedNotRegional } : null;
  // Seasoned / regional+ at ANY snapshot (a link can season then break
  // before the end; end-state alone would erase it).
  s.seasonedEver = daily.some(function (snap) { return snap.linkFunnel && snap.linkFunnel.seasoned > 0; });
  s.regionalEver = daily.some(function (snap) { return snap.linkFunnel && snap.linkFunnel.regionalPlus > 0; });
  s.peak = last ? last.peak : null;
  s.finalCapped = last ? last.capped : null;
  s.finalStanding = last ? last.standing : null;
  s.finalLiving = last ? last.livingCount : null;
  s.readyDays = daily.filter(function (snap) { return snap.readiness5 && snap.readiness5.ready; }).length;
  s.w4faced = last ? !!last.w4faced : false; s.w5faced = last ? !!last.w5faced : false;
  s.deathCauses = {};
  (out.deathEvents || []).forEach(function (d) { const k = d.cause || d.kind || 'unknown'; s.deathCauses[k] = (s.deathCauses[k] || 0) + 1; });
  s.deathTotal = (out.deathEvents || []).length;
  s.saySample = (out.sayLines || []).slice(0, 40);
  // Furthest stage = highest stage with its own evidence. Stages are
  // NOT strictly ordered (travel does not require opinion >= 10), so
  // the furthest stage is the max reached, and the stall is the next
  // stage without evidence — reported per seed in the evidence file
  // alongside the nonzero-opinion / known counts, not folded into
  // the label.
  const has = {
    S0: ovMax > 0,
    S1: knownEver > 0,
    S2: opinion10Villages > 0,
    S2any: nonzeroOpinionVillages > 0,
    S3: (tileDays.length > 0 || codexCalls.length > 0),
    S4: props.length > 0,
    S5: classified.some(function (c) { return c.outcome === 'accepted' || c.outcome === 'countered' || c.outcome === 'declined'; }),
    S6: (out.linkFormedEvents || []).length > 0,
    S7: s.seasonedEver,
    S8: s.regionalEver,
  };
  const order = ['S0', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8'];
  let furthest = 'S0-none';
  if (!has.S0) furthest = 'S0-none';
  else {
    furthest = 'S0';
    for (const st of order.slice(1)) { if (has[st]) furthest = st; }
    if (furthest === 'S4' && !has.S5) furthest = 'S4-refused-only';
  }
  s.furthest = furthest;
  s.stageFlags = has;
  return s;
}

function judgeGo(summaries) {
  const counts = {};
  summaries.forEach(function (s) { counts[s.furthest] = (counts[s.furthest] || 0) + 1; });
  let best = null, bestN = 0;
  Object.keys(counts).forEach(function (k) { if (counts[k] > bestN) { bestN = counts[k]; best = k; } });
  const bad = summaries.filter(function (s) { return (s.instrumentErrors || 0) > 0 || (s.ovMax || 0) === 0; }).length;
  return { counts: counts, majorityStage: best, majorityN: bestN, total: summaries.length,
    insufficientData: bad > 2, badSeeds: bad,
    verdict: bad > 2 ? 'INSUFFICIENT-DATA' : (bestN >= 6 ? 'DIAG-GO' : 'DIAG-NO-CANDIDATE') };
}

module.exports = { summarizeSeed: summarizeSeed, classifyProposal: classifyProposal, judgeGo: judgeGo };
