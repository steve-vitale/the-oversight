// Peer-route probes on the same capable survival brain. No game-state grants.
'use strict';
const { capable } = require('./capable');
const { quiet } = require('./livelihood');

function pantryKcal(G) {
  return ((G.state.village || {}).pantry || []).reduce((n, i) => n + Math.max(0, i.units ?? 1) * (i.kcalEach || 0), 0);
}
function count(ctx, key, n = 1) { ctx['livelihoodPeer' + key] = (ctx['livelihoodPeer' + key] || 0) + n; }
function hostPeerFeast(G, ctx) {
  const s = G.state.scholar;
  if (G.over || G.tbfight || G.pendingEncounter || G.state.activeContest || s.exiled ||
      !G.playerAtHaven() || G.dayPart !== 2 || !(s.prog || {}).feastSurge || s.feastDay === s.day) return;
  if (G.fusionReactorOnline && G.fusionReactorOnline()) return;
  const last = Math.max(ctx._peerLastFeastDay ?? -7, ctx._fsLastFeastDay ?? -7, ctx._lastFeastDay ?? -7);
  if (s.day - last < 7) return;
  try {
    const plan = G.feastPlan();
    if (!plan.ok || plan.have < plan.cost * 1.5) return;
    const r = G.hostFeast();
    if (r && r.ok) {
      ctx._peerLastFeastDay = ctx._fsLastFeastDay = ctx._lastFeastDay = s.day;
      count(ctx, 'Feasts');
    }
  } catch (e) {
    const errors = ctx.livelihoodPeerErrors || (ctx.livelihoodPeerErrors = []);
    if (errors.length < 30) errors.push('feast: ' + e.message);
  }
}
function peerWork(G, ctx, kind) {
  const s = G.state.scholar;
  if (!kind || G.over || G.tbfight || G.pendingEncounter || G.state.activeContest || !G.playerAtHaven() || s.exiled) return;
  try {
    const day = s.day || 0;
    const links = G.hierarchyState().filter(l => l.status === 'active');
    const peers = links.filter(l => l.kind === kind);
    ctx.livelihoodPeerPeakLinks = Math.max(ctx.livelihoodPeerPeakLinks || 0, peers.length);
    ctx.livelihoodPeerPeakLive = Math.max(ctx.livelihoodPeerPeakLive || 0, peers.filter(l => l.poolLive || l.chartered).length);
    ctx.livelihoodPeerPeakPool = Math.max(ctx.livelihoodPeerPeakPool || 0, G.leaguePool());
    // Resolve the visible offer first, without an unsolicited sweetening cost.
    if (G.state.pendingCounter) { G.answerCounter('accept'); count(ctx, 'Counters'); }
    if (G.state.pendingAccord) { G.answerAccord(pantryKcal(G) > 15000 ? 'gift' : 'visit'); count(ctx, 'Accords'); }
    for (const l of peers) {
      const enoughHands = (G.state.village.roster || []).length >= 6;
      if (l.pendingDefense) { const r = G.answerDefenseCall(l.id, enoughHands ? 'send' : 'refuse'); if (r === 'sent') count(ctx, 'DefenseSent'); else if (r) count(ctx, 'DefenseOther'); }
      if (l.pendingTradeCall) { const r = G.answerTradeCall(l.id, enoughHands ? 'send' : 'refuse'); if (r === 'sent') count(ctx, 'FavorSent'); else if (r) count(ctx, 'FavorOther'); }
      if (l.pendingCovenantCrisis) { if (G.answerCovenantCrisis(l.id, 'concede')) count(ctx, 'Crises'); }
    }
    // Bounded famine draw, never a fabricated food grant or a full-pool drain.
    if (kind === 'covenant' && ctx._peerDrawDay !== day && pantryKcal(G) < 12000 && G.leaguePool() > 0) {
      ctx._peerDrawDay = day;
      const drawn = G.drawLeaguePool(Math.min(4000, 12000 - pantryKcal(G)));
      if (drawn > 0) count(ctx, 'DrawKcal', drawn);
    }
    if (day < 25 || peers.length >= 3 || pantryKcal(G) <= 12000 || ctx._peerProposalDay === day ||
        G.state.pendingCounter || G.state.pendingAccord || G.state.pendingNational) return;
    const cool = ctx._peerCool || (ctx._peerCool = {});
    const target = (G.state.otherVillages || []).find(v => v && v.id !== 'haven' && G.knowsVillage(v) &&
      !G.linkWith(v.id) && (v.opinion || 0) >= 10 && day - (cool[v.id] ?? -7) >= 7);
    if (!target) return;
    ctx._peerProposalDay = day; cool[target.id] = day;
    const r = kind === 'covenant' ? G.proposeCovenant(target.id) : G.proposeTrade(target.id);
    count(ctx, 'Proposals');
    if (r && r.kind === kind) count(ctx, 'Formed');
  } catch (e) {
    const errors = ctx.livelihoodPeerErrors || (ctx.livelihoodPeerErrors = []);
    if (errors.length < 30) errors.push(e.message);
  }
}
// The inherited LEAD courtship still handles national/global beats and feasts,
// but cannot form subordinate links during any peer/control callback.
function withoutLead(G, fn) {
  const original = G.proposeLink;
  G.proposeLink = () => null;
  try { return quiet(fn); } finally { G.proposeLink = original; }
}
function policy(id, kind) {
  const p = { ...capable, id, desc: 'capable, no deliberate hunts; ' + (kind || 'no peer proposals') };
  for (const hook of ['setup', 'upkeep', 'daily', 'fight', 'contest', 'pending']) {
    p[hook] = (G, ctx) => withoutLead(G, () => {
      if (hook === 'upkeep' || hook === 'daily') { peerWork(G, ctx, kind); hostPeerFeast(G, ctx); }
      if (hook === 'pending') {
        const draw = G.feastDrawPending && G.feastDrawPending();
        if (draw && draw.monsterId && G.driveOffFeastDraw) { const r = G.driveOffFeastDraw(); if (r && r.ok) return true; }
      }
      return capable[hook] ? capable[hook](G, ctx) : undefined;
    });
  }
  return p;
}
module.exports = { peerWork, hostPeerFeast, pantryKcal, withoutLead,
  covenanter: policy('covenanter', 'covenant'), charterer: policy('charterer', 'trade'),
  'peer-control': policy('peer-control', null) };
