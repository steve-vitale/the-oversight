// Non-hunting livelihoods on the SAME capable survival/choice brain.
// These are not pacifists: unavoidable fights and village defence remain.
// All work uses public verbs, real stock/food/materials, and visible needs.
'use strict';
const { capable } = require('./capable');
const C = require('./competent');
function quiet(fn, reserve) {
  const env = { CAPABLE_HUNT: '0', COMPETENT_FEAST: '1', COMPETENT_SEEK_FIGHTS: '0', COMPETENT_TRADE_RESERVE: reserve ? '1' : '0' }, old = {};
  for (const k of Object.keys(env)) { old[k] = process.env[k]; process.env[k] = env[k]; }
  try { return fn(); } finally { for (const k of Object.keys(env)) if (old[k] == null) delete process.env[k]; else process.env[k] = old[k]; }
}
function err(ctx, what, e) { const a = ctx.livelihoodErrors || (ctx.livelihoodErrors = []); if (a.length < 30) a.push(what + ': ' + e.message); }
function foodBudget(G) {
  return (G.state.scholar.inventory || []).reduce((n, it) => n + (G.isFinishedFood(it) ? (it.units || 0) * (it.kcalEach || 0) * (/smoked|dried|salted|pickled|cured/i.test(it.prep || it.name || '') ? 1.5 : 1) : 0), 0);
}
function trade(G, ctx) {
  if (!G.playerAtHaven() || G.over || G.tbfight || G.state.activeContest) return;
  try {
    const s = G.state.scholar;
    for (const vis of (G.state.village.visitors || []).filter(v => G.tradeSpirit(v) > 0)) {
      const wares = G.visitorWares(vis);
      const ids = new Set((s.inventory || []).concat(Object.values(s.equipped || {})).filter(Boolean).map(it => it.itemId || it.id));
      const idx = wares.findIndex(w => {
        if (w.sold || (w.kind !== 'alien' && w.kind !== 'tool') || ids.has(w.itemId)) return false;
        const d = G.data.items.find(d => d.id === w.itemId);
        return d && (d.weapon || d.armor || d.tool || d.healAmount || (d.fuelBurnMult && !G.state.fusionReactorHolder));
      });
      // Work for the purchase, rather than waiting for a policy whose only
      // food goal is dinner to accidentally leave a cart-price surplus.
      const today = s.day || 0;
      if (idx >= 0 && foodBudget(G) + (vis.credit || 0) < wares[idx].price + 1200 && ctx._tradeHarvestDay !== today && (s.kcal || 0) >= 1200) {
        ctx._tradeHarvestDay = today;
        quiet(() => { C.forageTripSeedFirst(G, ctx); C.sortHaul(G, ctx); C.cookHaul(G, ctx); }, true);
        ctx.livelihoodHarvestTrips = (ctx.livelihoodHarvestTrips || 0) + 1;
      }
      if (G.over || G.tbfight || !G.playerAtHaven()) return;
      if (idx >= 0 && foodBudget(G) + (vis.credit || 0) >= wares[idx].price + 1200) {
        if (G.visitorBuyWare(vis.id, idx)) ctx.livelihoodBuys = (ctx.livelihoodBuys || 0) + 1;
      }
      // Bank perishable surplus without selling the personal meal buffer.
      const inv = s.inventory || [];
      const sell = inv.findIndex(it => G.isFinishedFood(it) && (it.units || 0) > 0 && foodBudget(G) - (it.units || 0) * (it.kcalEach || 0) * 1.5 >= 1200);
      if (sell >= 0 && G.traderSell(vis.id, sell)) ctx.livelihoodSales = (ctx.livelihoodSales || 0) + 1;
      break; // one counter visit per day part
    }
  } catch (e) { err(ctx, 'trade', e); }
}
function make(G, ctx) {
  if (G.over || G.tbfight || G.state.activeContest) return;
  try {
    const s = G.state.scholar;
    const inv = s.inventory || [], owned = new Set(inv.concat(Object.values(s.equipped || {})).filter(Boolean).map(it => it.itemId || it.id));
    const candidates = G.data.recipes.filter(r => {
      const k = (G.state.codex.recipes || {})[r.id];
      const d = G.data.items.find(d => d.id === r.id);
      return d && (d.armor || d.weapon) && k && k.level >= 2 && !owned.has(r.id)
        && Object.entries(r.materials || {}).every(([m, n]) => inv.filter(it => it.material === m).reduce((a, it) => a + (it.units || 0), 0) >= n);
    });
    if (candidates.length && G.craft(candidates[0].id)) ctx.livelihoodCrafts = (ctx.livelihoodCrafts || 0) + 1;
    if (G.nearFire() && G.knowsTechnique('preserve') && inv.some(it => it.foodKind === 'meat' && it.foodState === 'cooked' && !G.isSpoiled(it))) {
      G.preserveFood(); ctx.livelihoodPreserves = (ctx.livelihoodPreserves || 0) + 1;
    }
  } catch (e) { err(ctx, 'make', e); }
}
function care(G, ctx) {
  if (!G.playerAtHaven() || G.over || G.tbfight || G.state.activeContest) return;
  try {
    for (const vid of (G.state.village.roster || []).filter(id => id !== G.villagerId)) {
      const mood = G.npcMood(vid);
      if (mood === 'scared' || mood === 'grieving') {
        G.comfort(vid, 'silent'); ctx.livelihoodComforts = (ctx.livelihoodComforts || 0) + 1; break;
      }
    }
  } catch (e) { err(ctx, 'care', e); }
}
function policy(id, work) {
  return Object.assign({}, capable, {
    id, desc: 'capable survival, no deliberate hunts or feast fights; ' + id,
    setup(G, ctx) { return quiet(() => capable.setup(G, ctx), id !== 'caregiver'); },
    upkeep(G, ctx) { work(G, ctx); return quiet(() => capable.upkeep(G, ctx), id !== 'caregiver'); },
    daily(G, ctx) { work(G, ctx); return quiet(() => capable.daily(G, ctx), id !== 'caregiver'); },
    fight(G, ctx) { return quiet(() => capable.fight(G, ctx)); },
    contest(G, ctx) { return quiet(() => capable.contest(G, ctx)); },
    pending(G, ctx) {
      const d = G.feastDrawPending && G.feastDrawPending();
      if (d && d.monsterId && G.driveOffFeastDraw) { const r = G.driveOffFeastDraw(); if (r && r.ok) return true; }
      return quiet(() => capable.pending(G, ctx));
    },
  });
}
module.exports = {
  merchant: policy('merchant', trade),
  maker: policy('maker', (G, ctx) => { make(G, ctx); trade(G, ctx); }),
  caregiver: policy('caregiver', care),
  trade, make, care, quiet,
};
