'use strict';
// Named experiment, not a default-policy replacement. No kit/food/XP grants.
const { caregiver } = require('./livelihood');
function safe(G) { return !G.over && !G.tbfight && !G.pendingEncounter && !G.state.activeContest && G.playerAtHaven(); }
function work(G, ctx) {
  if (!safe(G)) return;
  try {
    const s = G.state.scholar, day = s.day, bearer = G.villagerId;
    if (s.kcal < 2200 || s.health < 50) return;
    const plots = G.gardenPlots();
    if (plots.some(p => G.plotRipe(p, day))) {
      G.harvestGarden(); ctx.feederHarvests = (ctx.feederHarvests || 0) + 1;
    } else if (plots.some(p => p.pid && !p.dead && p.lastTend < day)) {
      G.tendGarden(); ctx.feederTends = (ctx.feederTends || 0) + 1;
    } else if (s.dayTicks < 128) {
      const opts = G.sowOptions().slice().sort((a, b) => (b.kcalEach || 0) - (a.kcalEach || 0));
      if (opts.length && plots.some(p => !p.pid && !p.dead)) G.sowPlot(opts[0].pid);
      else if (plots.length < 6 && G.playerTile().type === 'haven') G.makePlot();
    }
    if (!safe(G) || G.villagerId !== bearer || s.day !== day) return;
    const v = G.state.village;
    ctx.feederGiven = ctx.feederGiven || {};
    if (ctx.feederGiftDay !== day) { ctx.feederGiftDay = day; ctx.feederGiven = {}; }
    const people = G.data.villagers;
    for (const vid of v.roster) {
      if (!safe(G) || G.villagerId !== bearer || s.day !== day) break;
      const p = people.find(p => p.id === vid), pos = v.positions?.[vid];
      if (vid === bearer || !p || p.dead || v.away?.[vid] || !pos ||
        Math.max(Math.abs(pos.mx - s.mx), Math.abs(pos.my - s.my)) > 3 || ctx.feederGiven[vid]) continue;
      if (G.npcNeeds(vid).hunger <= 40) continue; // The same 'could eat' threshold shown on the gift card.
      const food = s.inventory.filter(i => i.kcalEach > 0 && i.units > 0 && !i.bonded && !G.isSpoiled(i));
      if (!food.length || food.some(i => !G.isFinishedFood(i))) continue;
      const available = food.reduce((n, i) => n + i.units * i.kcalEach, 0);
      // Reserve dinner plus a conservative full gift and one whole-unit rounding.
      if (available < 2000 + 2500 + Math.max(...food.map(i => i.kcalEach))) continue;
      const result = G.giveFood(vid, 'full');
      if (result?.ok) { ctx.feederGiven[vid] = true; ctx.feederGifts = (ctx.feederGifts || 0) + 1; }
    }
  } catch (e) { console.warn('[garden-feeder] ' + e.message); }
}
const feeder = Object.assign({}, caregiver, {
  id: 'garden-feeder', desc: 'caregiver survival plus personal garden harvests and real food gifts to nearby visibly hungry residents',
  upkeep(G, ctx) { work(G, ctx); return caregiver.upkeep(G, ctx); },
  daily(G, ctx) { work(G, ctx); return caregiver.daily(G, ctx); },
});
module.exports = { feeder, work };
