// bond-initiation-analyze-20261105.js — bond-initiation build analyzer
// (Steve ruling 2026-11-04 22:32: villagers initiate bonds).
// summarizeSeed(out) reads one driver JSON; judgePanel(rows) judges
// the prereg bars across the panel. No re-scoring: bars are judged
// exactly as pre-registered in evidence/2026-11-05/
// bond-initiation-prereg.md.
'use strict';

function summarizeSeed(out) {
  const tele = out.bondTeleEvents || [];
  const props = out.proposalEvents || [];
  const decisions = out.decisionEvents || [];
  const daily = out.daily || [];
  const last = daily.length ? daily[daily.length - 1] : null;
  // An expiry is the lifecycle of an already-counted ask, not a new
  // ask — counting it doubled every unanswered proposal (pilot 2:
  // 12 staged read as 24 "proposals"). Bars count asks.
  const personProps = tele.filter(function (e) { return e.kind === 'person' && e.outcome !== 'expired'; });
  const linkRaises = tele.filter(function (e) { return e.kind === 'link' && e.outcome !== 'expired'; });
  const accepted = personProps.filter(function (e) { return e.outcome === 'accepted'; }).length;
  const refused = personProps.filter(function (e) { return e.outcome === 'refused'; }).length;
  const personDecided = accepted + refused;
  // Perception: every DECIDED proposeBond return must carry gate=true.
  // Guard returns (not-perceived, cooldown, already-bonded,
  // scholar-decides, invalid) never decided anything — they are not
  // gate failures. ok:true means the verb decided.
  const verbRows = props.filter(function (e) { return e.fn === 'proposeBond'; });
  const gateFails = verbRows.filter(function (e) { return e.ret && e.ret.ok === true && e.ret.gate !== true; });
  // NPC-initiated person proposals: initiator is a villager (not the scholar).
  // Scholar at EVENT time (per-event stamp; falls back to the final
  // scholarId for rows written before the stamp existed) — succession
  // otherwise misattributes a stager who later became scholar.
  const scholarId = last ? last.scholarId : null;
  function eventScholar(e) { return (e.scholarId != null ? e.scholarId : scholarId); }
  const npcPerson = personProps.filter(function (e) { return e.initiator && e.initiator !== eventScholar(e); });
  return {
    seed: out.seed, days: out.days, endReason: out.endReason,
    won: !!out.won, over: !!out.over, villageLost: !!out.villageLost,
    proposalsPerson: personProps.length,
    proposalsPersonNpc: npcPerson.length,
    proposalsPersonScholarTarget: personProps.filter(function (e) { return e.target === eventScholar(e); }).length,
    accepted: accepted, refused: refused,
    acceptRate: personDecided ? (accepted / personDecided) : null,
    linkRaises: linkRaises.length,
    linkRaisesStaged: linkRaises.filter(function (e) { return e.outcome === 'staged' || e.outcome === 'raised'; }).length,
    proposeLinkCalls: (out.linkEvents || []).length,
    bondsInitiated: last ? (last.bondsInitiated || 0) : 0,
    bondsTotal: last ? (last.bondsTotal || 0) : 0,
    bondsAccumulated: last ? (last.bondsAccumulated || 0) : 0,
    bondProposalPairs: last ? (last.bondProposalPairs || 0) : 0,
    bondRequestsStaged: last ? (last.bondRequestsStaged || 0) : 0,
    linkRaisesStagedSnap: last ? (last.linkRaisesStaged || 0) : 0,
    livingCount: last ? last.livingCount : null,
    decisionsBond: decisions.length,
    decisionAccepts: decisions.filter(function (d) { return d.accept; }).length,
    gateFails: gateFails.length,
    verbRows: verbRows.length,
    talkTo: (out.wrapCounts || {}).talkTo || 0,
    errors: (out.instrumentErrors || []).length,
  };
}

// judgePanel(rows): rows are summarizeSeed outputs, paired baseline/armed
// by seed (each row carries .leg 'baseline'|'armed' — set by the panel
// builder, not the driver). Returns {decision, bars, notes}.
function judgePanel(rows) {
  const armed = rows.filter(function (r) { return r.leg === 'armed'; });
  const base = rows.filter(function (r) { return r.leg === 'baseline'; });
  const bars = {};
  const seedsWithNpc = armed.filter(function (r) { return r.proposalsPersonNpc >= 1; }).length;
  const pooledProps = armed.reduce(function (a, r) { return a + r.proposalsPerson; }, 0);
  bars.M1 = (seedsWithNpc >= 4 && pooledProps >= 8);
  const pooledAcc = armed.reduce(function (a, r) { return a + r.accepted; }, 0);
  const pooledDec = armed.reduce(function (a, r) { return a + r.accepted + r.refused; }, 0);
  bars.M2 = (pooledDec >= 8) ? ((pooledAcc / pooledDec) >= 0.10 && (pooledAcc / pooledDec) <= 0.90) : false;
  bars.M2insufficient = pooledDec < 8;
  const pooledInitiated = armed.reduce(function (a, r) { return a + r.bondsInitiated; }, 0);
  const maxPerSeed = armed.reduce(function (a, r) { return Math.max(a, r.proposalsPerson); }, 0);
  bars.M3 = (pooledInitiated >= 4 && maxPerSeed <= 12);
  const pooledLinkRaises = armed.reduce(function (a, r) { return a + r.linkRaises; }, 0);
  bars.M4 = pooledLinkRaises >= 2;
  // M5: accumulation-formed bonds and survival vs baseline, paired by seed.
  let m5 = true;
  const notes = [];
  const baseBySeed = {};
  base.forEach(function (r) { baseBySeed[r.seed] = r; });
  armed.forEach(function (r) {
    const b = baseBySeed[r.seed];
    if (!b) { m5 = false; notes.push('seed ' + r.seed + ': no baseline pair'); return; }
    if (b.bondsAccumulated > 0 && r.bondsAccumulated < b.bondsAccumulated * 0.75) {
      m5 = false; notes.push('seed ' + r.seed + ': accumulated bonds ' + r.bondsAccumulated + ' vs baseline ' + b.bondsAccumulated);
    }
    if (b.days > 0 && r.days < b.days * 0.90) {
      m5 = false; notes.push('seed ' + r.seed + ': days ' + r.days + ' vs baseline ' + b.days);
    }
  });
  bars.M5 = m5;
  const gateFails = armed.reduce(function (a, r) { return a + r.gateFails; }, 0);
  bars.M6 = gateFails === 0;
  const errors = armed.reduce(function (a, r) { return a + r.errors; }, 0);
  const decision = (bars.M1 && bars.M2 && bars.M3 && bars.M4 && bars.M5 && bars.M6) ? 'GO' : 'NO-GO';
  return { decision: decision, bars: bars,
    pooled: { proposalsPerson: pooledProps, accepted: pooledAcc, decided: pooledDec,
      initiated: pooledInitiated, linkRaises: pooledLinkRaises, gateFails: gateFails, errors: errors },
    notes: notes };
}

module.exports = { summarizeSeed: summarizeSeed, judgePanel: judgePanel };
