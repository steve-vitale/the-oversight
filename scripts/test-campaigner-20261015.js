#!/usr/bin/env node
'use strict';
const K = require('./godpath/lib'), P = require('./policies/campaigner'), C = require('./policies/competent');
const T = K.reporter('campaigner');
(async () => {
  const G = await K.load({ seed: 7 }); K.newRun(G);
  const s = G.state.scholar, ctx = { notes: [] };
  const meal = n => ({ name: 'Prepared campaign meals', units: n, kcalEach: 1000, foodKind: 'plant', foodState: 'cooked', safe: true, edible: true, kg: 0.01, spoilDay: 9999 });
  G.state.titans = { omens: { finale: { stage: 2, day: s.day } }, musters: {}, slain: {}, cast: null };
  const villages = G.state.otherVillages, links = G.hierarchyState(); links.length = 0;
  // Prepared 5/6/6-adult force; generated ages are not the behavior under test.
  for (const [i, v] of villages.entries()) {
    G.genVillageRoster(v); v.roster = v.roster.slice(0, i === 0 ? 5 : 6);
    for (const r of v.roster) { r.age = 35; r.alive = true; }
    v.opinion = 30;
    links.push({ primary: 'haven', subordinate: v.id, status: 'active', trust: 90, arrears: 0, theirSpeaker: { id: v.roster.find(r => r.age >= 18).id, name: 'Speaker' } });
  }
  const relationships = JSON.stringify(links);
  s.inventory = [];
  P.road(G, ctx);
  T.ok('hungry policy does not recruit an unfed army', !G.titanMusterState('finale') && ctx.campaignFoodBlocked === 1);
  s.inventory = [meal(30)];
  P.road(G, ctx);
  const m = G.titanMusterState('finale');
  T.ok('policy calls and confirms a real twenty-person coalition', m && m.allies.length === 17 && m.haven.length === 3 && G.titanMusterReady('finale'));
  T.ok('recruitment policy never grants relationships', JSON.stringify(links) === relationships);
  T.ok('policy does not invent a monster when announcement has none', ctx.campaignMissingTarget === 1 && !G.tbfight);
  const calls = ctx.campaignCalls; P.road(G, ctx);
  T.ok('ready army does not spam calls', ctx.campaignCalls === calls && m.allies.length === 17);
  const force = m.allies.filter(a => a.villageId === villages[0].id);
  s.inventory.push(...force.map(() => ({ itemId: 'stone_knife', units: 1 })));
  const before = s.inventory.length; P.outfit(G, ctx, 'finale', m);
  T.ok('outfitting transfers real spare weapons once', s.inventory.length === before - force.length && force.every(a => a.outfitted.some(i => i.itemId === 'stone_knife')));
  s.inventory.push(...force.map(() => ({ itemId: 'stone_knife', units: 1 })));
  const armed = s.inventory.length; P.outfit(G, ctx, 'finale', m);
  T.ok('policy never stacks a second weapon per soldier', s.inventory.length === armed);
  G.spawnWorldMonster('finale_crew', 8, 4, { mx: 4, my: 4, titan: true });
  const routeBefore = process.env.COMPETENT_ROUTE_AROUND, walk = C.walkTo;
  const routeCtx = { ...ctx, notes: [] }; let routeSeen = null;
  try {
    process.env.COMPETENT_ROUTE_AROUND = '0';
    C.walkTo = () => { routeSeen = process.env.COMPETENT_ROUTE_AROUND; throw new Error('prepared route sentinel'); };
    P.road(G, routeCtx);
    T.ok('campaign travel enables the existing paid route-around behavior', routeSeen === '1');
    T.ok('campaign restores route-around environment even on travel error', process.env.COMPETENT_ROUTE_AROUND === '0');
    T.ok('travel errors remain visible to the audit', routeCtx.notes.some(n => n.includes('prepared route sentinel')));
  } finally {
    C.walkTo = walk;
    if (routeBefore === undefined) delete process.env.COMPETENT_ROUTE_AROUND; else process.env.COMPETENT_ROUTE_AROUND = routeBefore;
  }
  const f = { fighters: Array.from({ length: 5 }, () => ({ kind: 'ally', alive: true })) }, p = { hp: 100, maxHp: 100 };
  ctx.campaignFight = f;
  T.ok('ordinary fight cannot use coalition commitment', !C.coalitionCommitted(G, ctx, f, p));
  G.state.titans._fight = { titan: 'finale' };
  T.ok('real marked campaign with living army holds at full HP', C.coalitionCommitted(G, ctx, f, p));
  p.hp = 49;
  T.ok('wounded bearer restores normal retreat decision', !C.coalitionCommitted(G, ctx, f, p));
  p.hp = 100; f.fighters[0].alive = false;
  T.ok('depleted army restores normal retreat decision', !C.coalitionCommitted(G, ctx, f, p));
  delete G.state.titans._fight;
  const envBefore = process.env.CAPABLE_GREEDY;
  P['campaigner-control'].pending(G, { notes: [] });
  T.ok('matched control restores environment after hook', process.env.CAPABLE_GREEDY === envBefore);
  K.newRun(G);
  G.state.scholar.inventory = [];
  G.state.village.pantry = [meal(40)];
  // The hall fixture is explicit; the take itself must obey normal access,
  // capacity, trust and conservation rules.
  G.state.scholar.insideHaven = true;
  const stock = G.pantryKcal(), reserve = 2 * G.villageDailyNeed();
  const priorProvision = ctx.campaignProvisionKcal || 0;
  P.provision(G, ctx, 30000);
  const carried = P.food(G);
  T.ok('provision uses real pantry transfers, conserving calories', carried > 0 && G.pantryKcal() + carried === stock);
  T.ok('provision leaves two days of village food', G.pantryKcal() >= reserve);
  T.ok('provision counter records actual gained food', ctx.campaignProvisionKcal - priorProvision === carried);
  T.ok('policy errors are surfaced', !ctx.campaignErrors && ctx.notes.length === 0);
  T.done();
})().catch(e => { console.error(e); process.exitCode = 1; });
