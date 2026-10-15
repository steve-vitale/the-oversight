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
// One real counter batch per day, inside Haven with time/meal reserves.
// Cooking comes first: smoking cannot kill parasites or finish an undercook.
function preserveCounter(G, ctx) {
  const s = G.state.scholar;
  if (G.over || G.tbfight || G.state.activeContest || G.pendingEncounter ||
      G.havenStoresAccess() !== 'inside' || (s.kcal || 0) < 1800 ||
      s.health < 50 || (s.dayTicks || 0) > 384 || ctx._makerCounterDay === s.day) return;
  const stash = s.prepStash || [];
  const candidates = stash.filter(it => it && it.foodKind === 'meat' &&
    ['cleaned', 'cooked'].includes(it.foodState) && (it.units ?? 1) > 0 &&
    (it.kcalEach || 0) > 0 && it.edible !== false && it.safe !== false &&
    !it.poisonRisk && !/human/i.test(String(it.plantId || '') + ' ' + String(it.name || '')) &&
    !G.data.monsters.some(m => 'meat_' + m.id === it.plantId) && !G.isSpoiled(it));
  const item = candidates.sort((a, b) => (a.spoilDay ?? Infinity) - (b.spoilDay ?? Infinity))[0];
  if (!item || !G.nearFire()) return;
  ctx._makerCounterDay = s.day;
  const bearer = G.villagerId;
  if (item.foodState === 'cleaned' || item.undercooked) {
    const ticks = s.dayTicks;
    G.cookFood(stash.indexOf(item), stash);
    if (s.dayTicks !== ticks) ctx.livelihoodCounterCooks = (ctx.livelihoodCounterCooks || 0) + 1;
  }
  if (G.over || G.tbfight || G.state.activeContest || G.pendingEncounter || G.villagerId !== bearer ||
      !stash.includes(item) || G.isSpoiled(item) || item.foodState !== 'cooked' ||
      item.undercooked || item.parasiteRisk || item.diseaseRisk || item.safe === false) return;
  G.preserveFood(stash.indexOf(item), stash);
  if (item.foodState !== 'preserved') return;
  ctx.livelihoodCounterPreserves = (ctx.livelihoodCounterPreserves || 0) + 1;
  if (G.over || G.tbfight || G.pendingEncounter || G.villagerId !== bearer || G.havenStoresAccess() !== 'inside') return;
  // The UI shelves finished food in bulk. Do not also feed a dangerous
  // neighboring batch merely because this selected batch is ready.
  if (stash.some(it => G.isFinishedFood(it) && (it.safe === false || it.undercooked ||
      it.poisonRisk || it.parasiteRisk || it.diseaseRisk ||
      /human/i.test(String(it.plantId || '') + ' ' + String(it.name || '')) ||
      G.data.monsters.some(m => 'meat_' + m.id === it.plantId)))) return;
  G.putAwayFinished();
  if (!stash.includes(item)) ctx.livelihoodCounterStored = (ctx.livelihoodCounterStored || 0) + 1;
}
// Collect only the missing counter stock for one otherwise funded known
// gear recipe. Each transfer is the same deliberate paid action as the UI.
function collectPrepMaterials(G, ctx) {
  const s = G.state.scholar;
  if (G.over || G.tbfight || G.pendingEncounter || G.state.activeContest || !G.atCamp() ||
      (s.kcal || 0) < 1800 || (s.dayTicks || 0) > 384 || ctx._makerMaterialDay === s.day) return;
  const stash = s.prepStash || [], known = (G.state.codex || {}).recipes || {};
  const owned = new Set((s.inventory || []).concat(Object.values(s.equipped || {})).filter(Boolean).map(i => i.itemId || i.id));
  const loose = m => stash.filter(i => i.material === m && !i.bonded).reduce((n, i) => n + Math.max(0, i.units ?? 1), 0);
  const recipe = G.data.recipes.find(r => {
    const d = G.data.items.find(i => i.id === r.id), mats = Object.entries(r.materials || {});
    return d && (d.weapon || d.armor) && (known[r.id] || {}).level >= 2 && !owned.has(r.id) &&
      mats.some(([m,n]) => G.materialCount(m) < n) && mats.every(([m,n]) => G.materialCount(m) + loose(m) >= n);
  });
  if (!recipe) return;
  ctx._makerMaterialDay = s.day;
  const bearer = G.villagerId;
  for (const [m,n] of Object.entries(recipe.materials)) {
    for (const item of stash.filter(i => i.material === m && !i.bonded && (i.units ?? 1) > 0)) {
      const need = n - G.materialCount(m);
      if (need <= 0) break;
      const before = G.materialCount(m);
      G.takePrepMaterial(stash.indexOf(item), need);
      const got = G.materialCount(m) - before;
      if (got > 0) {
        ctx.livelihoodMaterialUnits = (ctx.livelihoodMaterialUnits || 0) + got;
        ctx.livelihoodMaterialTakes = (ctx.livelihoodMaterialTakes || 0) + 1;
      }
      if (G.over || G.tbfight || G.pendingEncounter || G.state.activeContest || G.villagerId !== bearer) return;
      if (got <= 0) break;
    }
  }
}
// Maker fieldwork: handle spare visible hide and try the earned L1 outline.
// Two panels plus any visible lashing are a player's guess, not a lookup of
// hidden recipe.materials. Wrong guesses receive the same blind refusal.
function experimentHideCraft(G, ctx) {
  const s = G.state.scholar, known = () => ((G.state.codex.recipes || {}).hide_armor || {}).level || 0;
  if (G.over || G.tbfight || G.pendingEncounter || G.state.activeContest || !G.atCamp() ||
      (s.kcal || 0) < 1800 || (s.dayTicks || 0) > 384 || known() >= 2 ||
      (ctx._makerHideTrialDay != null && s.day - ctx._makerHideTrialDay < 3)) return;
  if ((s.inventory || []).concat(Object.values(s.equipped || {})).some(i => i && (i.units ?? 1) > 0 && (i.itemId || i.id) === 'hide_armor')) return;
  const stash = s.prepStash || [], bearer = G.villagerId;
  if (ctx._makerHideHandleDay !== s.day && G.materialCount('hide') < 2) {
    ctx._makerHideHandleDay = s.day;
    for (const item of stash.filter(i => i.material === 'hide' && !i.bonded && (i.units ?? 1) > 0)) {
      const need = 2 - G.materialCount('hide');
      if (need <= 0) break;
      const before = G.materialCount('hide');
      G.takePrepMaterial(stash.indexOf(item), need);
      const got = G.materialCount('hide') - before;
      if (got > 0) ctx.livelihoodHideHandledUnits = (ctx.livelihoodHideHandledUnits || 0) + got;
      if (G.over || G.tbfight || G.pendingEncounter || G.state.activeContest || G.villagerId !== bearer || got <= 0) return;
    }
  }
  const lashing = (s.inventory || []).some(i => ['vine', 'fiber', 'cloth'].includes(i.material) && (i.units || 0) > 0);
  if (known() !== 1 || G.materialCount('hide') < 2 || !lashing) return;
  // Remember a rejected visible guess. More of the same stock may permit a
  // new guess, but passing days alone cannot make identical supplies work.
  // A funded failed roll consumes inputs, so it must remain retryable later.
  const guess = () => [bearer, ...['hide', 'vine', 'fiber', 'cloth'].map(m => G.materialCount(m))].join('/');
  const before = guess();
  if (ctx._makerHideRejectedGuess === before) return;
  ctx._makerHideTrialDay = s.day;
  ctx.livelihoodHideTrials = (ctx.livelihoodHideTrials || 0) + 1;
  const made = G.craft('hide_armor');
  if (made === true) ctx.livelihoodHideTrialSuccesses = (ctx.livelihoodHideTrialSuccesses || 0) + 1;
  ctx._makerHideRejectedGuess = made !== true && G.villagerId === bearer && known() === 1 && guess() === before ? before : null;
}
function make(G, ctx) {
  if (G.over || G.tbfight || G.state.activeContest) return;
  try {
    experimentHideCraft(G, ctx);
    if (G.over || G.tbfight || G.pendingEncounter || G.state.activeContest) return;
    collectPrepMaterials(G, ctx);
    if (G.over || G.tbfight || G.pendingEncounter || G.state.activeContest) return;
    const s = G.state.scholar;
    const inv = s.inventory || [], owned = new Set(inv.concat(Object.values(s.equipped || {})).filter(Boolean).map(it => it.itemId || it.id));
    const candidates = G.data.recipes.filter(r => {
      const k = (G.state.codex.recipes || {})[r.id];
      const d = G.data.items.find(d => d.id === r.id);
      return d && (d.armor || d.weapon) && k && k.level >= 2 && !owned.has(r.id)
        && Object.entries(r.materials || {}).every(([m, n]) => inv.filter(it => it.material === m).reduce((a, it) => a + (it.units || 0), 0) >= n);
    });
    if (candidates.length && G.craft(candidates[0].id)) ctx.livelihoodCrafts = (ctx.livelihoodCrafts || 0) + 1;
    preserveCounter(G, ctx);
    if (G.nearFire() && G.knowsTechnique('preserve') && inv.some(it => it.foodKind === 'meat' && it.foodState === 'cooked' && !G.isSpoiled(it))) {
      G.preserveFood(); ctx.livelihoodPreserves = (ctx.livelihoodPreserves || 0) + 1;
    }
  } catch (e) { err(ctx, 'make', e); }
}
function study(G, ctx) {
  if (G.over || G.tbfight || G.state.activeContest || G.pendingEncounter) return;
  try {
    const read = () => {
      const ids = new Set((G.state.scholar.inventory || []).filter(i => i.bookId).map(i => i.bookId));
      for (const id of ids) if (G.readBook(id)) ctx.livelihoodBooksRead = (ctx.livelihoodBooksRead || 0) + 1;
    };
    read();
    const s = G.state.scholar, known = (G.state.codex || {}).recipes || {};
    if (['bow', 'crossbow', 'arrow', 'bolt'].every(id => (known[id] || {}).level >= 2)) return;
    const today = s.day || 0;
    if (today - (ctx._makerKnowledgeDay == null ? -3 : ctx._makerKnowledgeDay) < 3 || (s.kcal || 0) < 1800 || s.health < 50 || (s.dayTicks || 0) > 128) return;
    const searched = ctx._makerSearched || (ctx._makerSearched = {});
    const blocked = ctx._makerBlocked || (ctx._makerBlocked = {});
    const here = { x: G.map.px, y: G.map.py, d: 0 };
    const reachable = (G.travelTargets() || []).filter(t => today - (blocked[t.x + ',' + t.y] == null ? -9 : blocked[t.x + ',' + t.y]) >= 9);
    // Seek known ruins first. Otherwise explore one nearby unknown tile
    // without inspecting its biome. A maker must actually look for books.
    const targets = [here].concat(reachable.filter(t => G.mapSeen(t.x, t.y)));
    const target = targets.sort((a, b) => a.d - b.d).find(t => !searched[t.x + ',' + t.y] && G.tileAt(t.x, t.y).type === 'ruin')
      || reachable.filter(t => !G.mapSeen(t.x, t.y)).sort((a, b) => a.d - b.d)[0];
    if (!target) return;
    ctx._makerKnowledgeDay = today;
    if (target.d) G.travelTo(target.x, target.y);
    if (G.over || G.tbfight || G.pendingEncounter) return;
    if (G.map.px !== target.x || G.map.py !== target.y) { blocked[target.x + ',' + target.y] = today; return; }
    ctx.livelihoodKnowledgeTrips = (ctx.livelihoodKnowledgeTrips || 0) + 1;
    if (G.playerTile().type === 'ruin' && !searched[target.x + ',' + target.y]) {
      searched[target.x + ',' + target.y] = true;
      G.doAction('forage'); ctx.livelihoodRuinSearches = (ctx.livelihoodRuinSearches || 0) + 1;
      if (G.over || G.tbfight || G.pendingEncounter) return;
      read();
    }
    if (target.d) G.travelTo(here.x, here.y);
  } catch (e) { err(ctx, 'study', e); }
}
function care(G, ctx) {
  if (!G.playerAtHaven() || G.over || G.tbfight || G.state.activeContest) return;
  try {
    const s = G.state.scholar;
    // Read the same known treatment and cooldown shown in the skills sheet.
    // Reserve dinner, and treat real wounds rather than farming a feast deed.
    if (!G.pendingEncounter && (s.kcal || 0) >= 1200 && G.maxHealth() - s.health >= 20) {
      const treatment = G.activatableAbilities().find(a => a.id === 'field_medicine' && a.available);
      if (treatment) {
        const before = s.health;
        G.activateAbility(treatment.id);
        if (s.health > before) ctx.livelihoodTreatments = (ctx.livelihoodTreatments || 0) + 1;
      }
    }
    if (G.over || G.tbfight || G.state.activeContest || !G.playerAtHaven()) return;
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
      return typeof capable.pending === 'function' ? quiet(() => capable.pending(G, ctx)) : false;
    },
  });
}
module.exports = {
  merchant: policy('merchant', trade),
  maker: policy('maker', (G, ctx) => { study(G, ctx); make(G, ctx); trade(G, ctx); }),
  caregiver: policy('caregiver', care),
  trade, make, care, quiet, study, preserveCounter, collectPrepMaterials, experimentHideCraft,
};
