#!/usr/bin/env node
'use strict';
// Prepared ceiling probe: real recruitment/gear/food/path/combat after
// explicit relationship, pantry, loadout and announced-location fixtures.
// Never evidence of natural reach or a campaign win rate.
const K = require('./godpath/lib'), H = require('./sim-harness'), P = require('./policies/campaigner');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i < 0 ? d : process.argv[i + 1]; };
(async () => {
  const seed = Number(arg('seed', 7)), tid = arg('titan', 'herald');
  const G = await K.load({ seed }); K.newRun(G);
  const s = G.state.scholar, ctx = { notes: [] }, links = G.hierarchyState(); links.length = 0;
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
  for (const mid of mids) G.spawnWorldMonster(mid, G.map.px, G.map.py, { mx: 5, my: 4, titan: true });
  const fights = [];
  const orig = G.tbEnd;
  G.tbEnd = function(result) {
    const f = this.tbfight, tf = (this.state.titans || {})._fight;
    if (f && tf) fights.push({ result, mark: { ...tf }, rounds: f.round, playerHp: (this.tbFighter('p') || {}).hp, aliveAllies: f.fighters.filter(a => a.kind === 'ally' && a.alive && !a.fled).length, monsters: f.fighters.filter(m => m.kind === 'monster').map(m => ({ id: m.monsterId, hp: m.hp, alive: m.alive })) });
    return orig.apply(this, arguments);
  };
  for (let node = 0; node < mids.length && !G.over; node++) {
    P.road(G, ctx);
    if (!G.tbfight) break;
    H.driveFights(G, P.campaigner, ctx);
    if (G.tbfight && !G.tbfight.over) break;
    const st = G.state.titans || {};
    if (fights.length && !['won', 'routed'].includes(fights[fights.length - 1].result)) break;
    if (st.slain[tid]) break;
  }
  const st = G.state.titans || {};
  const row = { kind: 'prepared campaign probe; not natural acquisition or win-rate evidence', seed, tid, loadout, initialHealth, initialMaxHealth, counters: Object.fromEntries(Object.entries(ctx).filter(([k, v]) => k.startsWith('campaign') && typeof v !== 'object')), notes: ctx.notes, fights, slain: st.slain, campaigns: st.campaigns || {}, remainingFood: P.food(G), currentHealth: G.state.scholar.health, over: !!G.over, liveFight: !!G.tbfight };
  console.log(JSON.stringify(row, null, 2));
})().catch(e => { console.error(e); process.exitCode = 1; });
