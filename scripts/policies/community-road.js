'use strict';
const competent = require('./competent');
// Shared primary-policy relationship intent. This first port handles actual
// ready council opportunities; below-bar travel remains an explicit blocker.
// It never changes Game methods, opinions, resources, links or positions.
function pantry(G) {
  return (G.state.village?.pantry || []).reduce((n, i) => n + (i.kcalEach || 0) * (i.units ?? 1), 0);
}
function living(G) {
  const v = G.state.village || {};
  return (v.roster || []).filter(id => (v.health?.[id] ?? 100) > 0 && !v.away?.[id]).length;
}
function intent(G, ctx, links) {
  if (process.env.COMMUNITY_PLANNER === 'legacy') return null; // explicit comparison control, shared planner is default
  if (!ctx.communityProfile) return null; // dedicated historical road controls
  if (ctx.communityRoad) return ctx.communityRoad;
  const active = links.filter(l => l?.status === 'active');
  if (!active.length && (G.state.scholar.day || 0) < 25) return null;
  // Existing obligations take priority over a new profession preference.
  const existing = active.find(l => l.kind === 'trade' || l.kind === 'covenant' || l.primary === 'haven');
  ctx.communityRoad = existing ? (['trade', 'covenant'].includes(existing.kind) ? existing.kind : 'lead')
    : ['merchant', 'maker'].includes(ctx.communityProfile) ? 'trade'
      : ctx.communityProfile === 'caregiver' ? (living(G) >= 5 ? 'covenant' : 'trade') : 'lead';
  return ctx.communityRoad;
}
function record(ctx, row) {
  const rows = ctx.communityDecisions || (ctx.communityDecisions = []);
  if (rows.length >= 100) rows.shift();
  rows.push({...row, result: row.result && typeof row.result === 'object'
    ? {id:row.result.id, kind:row.result.kind, status:row.result.status} : row.result});
}
function peerCouncil(G, ctx, links, road) {
  if (!road || road === 'lead') return false;
  const s = G.state.scholar, st = G.state, day = s.day || 0;
  const blocked = reason => { ctx.communityBlocked = reason; return true; };
  if (G.over || G.inCombat() || G.pendingEncounter || st.activeContest) return blocked('engaged');
  if (s.exiled || s.joinedVillage) return blocked('not-haven-member');
  if (s.health < 50 || s.kcal < 1200) return blocked('body-needs');
  // Council work is considered at Haven, never from another world node.
  const home = G.state.village || {};
  if (G.map.px !== (home.px ?? 4) || G.map.py !== (home.py ?? 4)) return blocked('return-to-haven');
  for (const link of links.filter(l => l?.status === 'active')) {
    if (link.pendingTradeCall && G.answerTradeCall) {
      const choice = living(G) >= 5 && pantry(G) > 10000 ? 'send' : 'refuse';
      const result = G.answerTradeCall(link.id, choice);
      record(ctx, {day, road, action:'trade-call', id:link.id, choice, result});
      return true;
    }
    if (link.pendingCovenantCrisis && G.answerCovenantCrisis) {
      const result = G.answerCovenantCrisis(link.id, 'concede');
      record(ctx, {day, road, action:'crisis', id:link.id, choice:'concede', result});
      return true;
    }
  }
  if (st.pendingCounter || st.pendingAccord || st.pendingNational || st.pendingGlobal) return blocked('pending-choice');
  if (day < 25 || pantry(G) <= 12000) return blocked('reserve-or-time');
  if (links.filter(l => l?.status === 'active' && l.kind === road).length >= 3) return blocked('relationships-established');
  if (ctx.communityAskDay === day) return blocked('asked-today');
  const cooldown = ctx.communityAskDays || (ctx.communityAskDays = {});
  const candidates = (st.otherVillages || []).filter(v => v && v.id !== 'haven' && G.knowsVillage(v) && !G.linkWith(v.id));
  const target = candidates.find(v => (v.opinion || 0) >= 10 && day - (cooldown[v.id] ?? -Infinity) >= 7);
  if (!target) return blocked(candidates.some(v => (v.opinion || 0) < 10 && !v._codexOpinionGiven) ? 'courtship-needs-visit' : 'no-ready-partner');
  const method = road === 'trade' ? 'proposeTrade' : 'proposeCovenant';
  // Only an actual ask starts the cooldown. Result is retained verbatim;
  // an attempted proposal is never counted as an accepted relationship.
  const result = G[method](target.id);
  ctx.communityAskDay = day;
  cooldown[target.id] = day;
  ctx.communityBlocked = null;
  record(ctx, {day, road, action:method, id:target.id, result, linked:!!G.linkWith(target.id)});
  return true;
}
function contributeForFeast(G, ctx) {
  if (process.env.COMMUNITY_PLANNER === 'legacy' || !['trade','covenant'].includes(ctx.communityRoad)) return;
  const s=G.state.scholar, v=G.state.village, bearer=G.villagerId, day=s.day||0;
  if (G.over || G.inCombat() || G.pendingEncounter || G.state.activeContest ||
      G.state.pendingCounter || G.state.pendingAccord || G.state.pendingNational || G.state.pendingGlobal ||
      s.exiled || s.joinedVillage || s.health<50 || s.kcal<1800 || s.hydration<30 ||
      G.map.px!==(v.px??4) || G.map.py!==(v.py??4)) return;
  // A real missing food-thesis step: contribute before asking the village
  // to spend its stores on the armed feast. Trade income is not a gift.
  if (!s.prog?.feastSurge || s.prog.feastSurgeUsed || !G.sentimentTaught()) return;
  const key=bearer+':'+day;
  if (ctx.communityFoodPlanDay===key) return;
  ctx.communityFoodPlanDay=key;
  try {
    const recent=competent.recentGives(G,ctx,7);
    if (recent>=1500) {ctx.communityFoodBlocked=null;return;}
    const plan=G.feastPlan();
    if (!plan.ok || plan.have<plan.cost*1.5) {ctx.communityFoodBlocked='feast-not-affordable';return;}
    const before=(v.gives||{})[bearer]||0;
    // This is a voluntary use of working capital for a named unmet goal.
    // Preserve a full day of safe personal food; retain ordinary trade
    // reserves on all other days. Public donation verifies real moved units
    // and the actual giver's ledger, including partial stacks and refusals.
    // Only this bearer's unmixed actual harvest funds this new goal.
    // Unattributed pantry stock and another resident's work do not become
    // personal production merely by appearing in the pack.
    competent.donateSurplus(G,ctx,{keepKcal:G.kcalCap(),maxTransfers:1,
      targetKcal:1500-recent,accept:item=>item.harvestShares?.[bearer]===1});
    const paid=((v.gives||{})[bearer]||0)-before;
    ctx.communityFoodBlocked=paid>0?null:'produce-safe-shareable-food';
    if(paid>0)record(ctx,{day,road:ctx.communityRoad,action:'feast-contribution',bearer,kcal:paid});
  }catch(e){
    (ctx.capErrors||(ctx.capErrors=[])).push('community food plan: '+e.message);
    console.warn('[community food plan]',e.message);
  }
}
module.exports = {intent, peerCouncil, contributeForFeast, pantry, living};
