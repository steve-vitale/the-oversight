#!/usr/bin/env node
'use strict';
// Prepared ceiling probe: real recruitment/gear/food/path/combat after
// explicit relationship, pantry, loadout and announced-location fixtures.
// Never evidence of natural reach or a campaign win rate.
const K = require('./godpath/lib'), H = require('./sim-harness'), P = require('./policies/campaigner');
const C = require('./policies/competent'), { sigButtons } = require('./policies/capable');
const bump = (ctx, key) => { ctx['campaign' + key] = (ctx['campaign' + key] || 0) + 1; };
// Prepared experiments call this explicitly; promotion into the ordinary
// campaign policy requires a matched screen. All movement/waits are paid.
function preparedGuard(G, ctx, rally = false) {
  const f = G.tbfight, p = f && G.tbFighter('p');
  if (!p || !G.tbIsPlayerTurn() || p.acted || !C.coalitionCommitted(G, ctx, f, p)) return false;
  const enemies = f.fighters.filter(a => (a.kind === 'monster' || a.kind === 'hostile') && a.alive && !a.fled);
  const allies = f.fighters.filter(a => a.kind === 'ally' && a.alive && !a.fled);
  if (!enemies.length) return false;
  const danger = G.tbDangerCells(), detail = G.genDetail(G.map.px, G.map.py);
  const score = (x, y) => {
    const distance = Math.min(...enemies.map(m => G.fighterDistTo(m, x, y)));
    const close = Math.min(...allies.map(a => Math.max(Math.abs(a.mx - x), Math.abs(a.my - y))));
    return Math.min(distance, 5) * 4 - close * 0.5 + allies.filter(a => Math.max(Math.abs(a.mx - x), Math.abs(a.my - y)) <= 3).length * 0.2 - (danger.has(x + ',' + y) ? 100 : 0);
  };
  let best = { x: p.mx, y: p.my, score: score(p.mx, p.my) };
  const reach = p.moveLeft || 0, max = G.tbGridMax();
  for (let y = Math.max(0, p.my - reach); y <= Math.min(max, p.my + reach); y++) for (let x = Math.max(0, p.mx - reach); x <= Math.min(max, p.mx + reach); x++) {
    if (!G.tbCanOccupy(p, x, y)) continue;
    const value = score(x, y);
    if (value <= best.score + 0.01) continue;
    const path = G.findPath(p.mx, p.my, x, y);
    if (!path || !path.length || path.some(([px, py]) => danger.has(px + ',' + py) || (detail[py] || [])[px] === 'door')) continue;
    if (path.reduce((n, t) => n + G.tbTerrainCost(t[0], t[1]), 0) > reach) continue;
    best = { x, y, score: value };
  }
  if (best.x !== p.mx || best.y !== p.my) {
    if (G.tbPlayerMove(best.x, best.y)) bump(ctx, 'GuardMoves');
    if (G.tbfight !== f || G.over) return true;
  }
  if (!G.tbIsPlayerTurn() || p.acted) return true;
  const finish = () => { if (G.tbfight === f && G.tbIsPlayerTurn() && p.acted) G.tbPlayerEndTurn(); };
  const buttons = sigButtons(G, f, p, enemies, ctx);
  const binding = buttons.find(b => b.key === 'tbSpAsk');
  if (binding && binding.call()) { bump(ctx, 'GuardBindings'); finish(); return true; }
  const spoil = ['tbFiRedPen', 'tbFiLeakedScript', 'tbFiBadNote'].map(key => buttons.find(b => b.key === key)).find(Boolean);
  if (spoil && spoil.call()) { bump(ctx, 'GuardCrewTools'); finish(); return true; }
  if (rally && !f.rallyUsed && G.tbPlayerRally()) { bump(ctx, 'GuardRallies'); finish(); return true; }
  G.tbPlayerWait(); bump(ctx, 'GuardWaits'); return true;
}
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i < 0 ? d : process.argv[i + 1]; };
(async () => {
  const seed = Number(arg('seed', 7)), tid = arg('titan', 'herald');
  const G = await K.load({ seed }); K.newRun(G);
  const s = G.state.scholar, ctx = { notes: [] }, links = G.hierarchyState(); links.length = 0;
  const trace = arg('trace', '0') === '1' ? [] : null;
  if (trace) {
    const damage = G.tbDamage;
    G.tbDamage = function(key, amount, source, sourceKey) {
      const f = this.tbfight, target = f && this.tbFighter(key), actor = f && this.tbFighter(sourceKey);
      const before = target && target.hp;
      const result = damage.apply(this, arguments);
      if (target && trace.length < 500) trace.push({ round: f.round, target: key, kind: target.kind, name: target.name, sourceKey, source, raw: amount, returned: result, before, after: target.hp, at: [target.mx, target.my], from: actor ? [actor.mx, actor.my] : null });
      return result;
    };
  }
  for (const v of G.state.otherVillages) {
    G.genVillageRoster(v); v.opinion = 30;
    links.push({ primary: 'haven', subordinate: v.id, status: 'active', trust: 90, arrears: 0, theirSpeaker: { id: v.roster.find(r => r.age >= 18).id, name: 'Speaker' } });
  }
  G.state.titans = { omens: { [tid]: { stage: 2, day: s.day } }, musters: {}, slain: {}, cast: null };
  const meal = { name: 'Prepared campaign meals', units: 400, kcalEach: 1000, foodKind: 'plant', foodState: 'cooked', safe: true, edible: true, kg: 0.01, spoilDay: 9999 };
  s.inventory = [meal];
  // Modest, actual item definitions. No inflated HP, damage, or ally stats.
  const loadout = arg('loadout', 'armed');
  if (loadout === 'armed') s.inventory.push(...Array.from({ length: 25 }, () => ({ itemId: 'stone_knife', units: 1 })), ...Array.from({ length: 25 }, () => ({ itemId: 'padded_cloth', units: 1 })));
  if (loadout === 'advanced') s.inventory.push(...Array.from({ length: 25 }, () => ({ itemId: 'phase_blade', units: 1 })), ...Array.from({ length: 25 }, () => ({ itemId: 'alien_carapace', units: 1 })), ...['alien_helm', 'alien_greaves', 'alien_gauntlets', 'alien_boots'].map(itemId => ({ itemId, units: 1 })));
  const initialHealth = s.health, initialMaxHealth = G.maxHealth();
  // Prepared arena geometry only. Approach still walks through the normal
  // local path API; subsequent fights must follow real campaign ordering.
  const mids = tid === 'finale' ? ['finale_crew', 'finale_opening', 'finale'] : [tid];
  G.spawnWorldMonster(mids[0], G.map.px, G.map.py, { mx: 5, my: 4, titan: true });
  const fights = [];
  const tactic = arg('tactic', 'baseline');
  const policy = { ...P.campaigner, fight(game, context) {
    const f = game.tbfight;
    if (tactic.includes('guard') && preparedGuard(game, context, tactic.includes('rally'))) return true;
    if (f && game.tbIsPlayerTurn() && f.fighters.some(a => a.kind === 'ally' && a.alive && !a.fled)) {
      if (tactic.includes('rally') && !f.rallyUsed && game.tbPlayerRally()) return true;
      if (tactic.includes('cry') && !f.warCryUsed && game.tbPlayerWarCry()) return true;
    }
    return P.campaigner.fight(game, context);
  } };
  const orig = G.tbEnd;
  G.tbEnd = function(result) {
    const f = this.tbfight, tf = (this.state.titans || {})._fight;
    if (f && tf) fights.push({ result, mark: { ...tf }, rounds: f.round, playerHp: (this.tbFighter('p') || {}).hp, aliveAllies: f.fighters.filter(a => a.kind === 'ally' && a.alive && !a.fled).length, monsters: f.fighters.filter(m => m.kind === 'monster').map(m => ({ id: m.monsterId, hp: m.hp, alive: m.alive })) });
    return orig.apply(this, arguments);
  };
  for (let node = 0; node < mids.length && !G.over; node++) {
    P.road(G, ctx);
    if (!G.tbfight) break;
    H.driveFights(G, policy, ctx);
    if (G.tbfight && !G.tbfight.over) break;
    const st = G.state.titans || {};
    if (fights.length && fights[fights.length - 1].result !== 'won') break;
    if (st.slain[tid]) break;
  }
  const st = G.state.titans || {};
  const row = { kind: 'prepared campaign probe; not natural acquisition or win-rate evidence', seed, tid, loadout, tactic, initialHealth, initialMaxHealth, counters: Object.fromEntries(Object.entries(ctx).filter(([k, v]) => k.startsWith('campaign') && typeof v !== 'object')), notes: ctx.notes, fights, slain: st.slain, campaigns: st.campaigns || {}, remainingFood: P.food(G), currentHealth: G.state.scholar.health, over: !!G.over, liveFight: !!G.tbfight, trace, stateHash: require('./gear-usage-audit').gameplayHash(G.state) };
  row.location = { x: G.map.px, y: G.map.py };
  row.nextTargets = G.worldMonsters().filter(m => mids.includes(m.id)).map(m => ({ id: m.id, x: m.tx, y: m.ty }));
  console.log(JSON.stringify(row, null, 2));
})().catch(e => { console.error(e); process.exitCode = 1; });
