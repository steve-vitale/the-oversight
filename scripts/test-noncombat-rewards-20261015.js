#!/usr/bin/env node
'use strict';
const K = require('./godpath/lib');
const T = K.reporter('noncombat-rewards');
const fixed = (n, f) => { const r = Math.random; Math.random = () => n; try { return f(); } finally { Math.random = r; } };
(async () => {
  const G = await K.load({ seed: 42 });
  K.newRun(G); G.state.systemArrived = true;
  const s = G.state.scholar;
  const byId = id => G.data.items.find(d => d.id === id);
  const cfg = G.data.rewardEconomy;
  const bars = xs => Array.isArray(xs) && xs.length === 3 && xs[0] === 0 && xs.every((n, i) => Number.isFinite(n) && n >= 0 && (!i || n > xs[i - 1]));
  T.ok('reward data has increasing three-tier career thresholds', bars(cfg.broadcast.winsForTier) && bars(cfg.broadcast.favorForTier) && bars(cfg.trade.tradesForTier));
  T.ok('reward probabilities are bounded', [cfg.broadcast.apexChance, cfg.broadcast.showGiftChance, ...cfg.broadcast.starterGiftChance].every(n => Number.isFinite(n) && n >= 0 && n <= 1));
  T.ok('apex mastery and trade prices require real achievements', cfg.broadcast.apexWins > cfg.broadcast.winsForTier[2] && cfg.broadcast.apexFavor >= cfg.broadcast.favorForTier[2] && cfg.trade.pricePerTier > 0);
  const ac = (id = 'box', who = 'player') => ({ contestId: id, participant: who, participants: [who], others: [], phase: 'intro', phaseIdx: 0 });
  const count = () => (s.inventory || []).length;
  const initialWave = G.unlockedWave();
  T.ok('fresh specialist has not unlocked monster progression', initialWave === 1);
  G.state.notability = { player: { contestWin: 6 } };
  G.apState().fanClubs = { fight: 0, survival: 0, social: 0, showbiz: 0 };
  T.ok('six noncombat wins earn tier 3 at wave 1', G.broadcastRewardTier('player') === 3 && G.unlockedWave() === 1);
  const win = ac(); const before = count();
  fixed(0.1, () => G._contestEnd(win, 'won', true));
  const gifts = s.inventory.slice(before).map(it => byId(it.itemId || it.id)).filter(Boolean);
  T.ok('actual puzzle-win terminal grants a good item with no monster gate', gifts.some(d => d.lootTier === 3));
  const after = count(); fixed(0.1, () => G._contestEnd(win, 'won', true));
  T.ok('re-entering one contest cannot duplicate its prize', count() === after);
  T.ok('broadcast items preserve discovery rather than revealing effects', s.inventory.slice(before).filter(it => it.alienLoot).every(it => it.alienEffectHidden));

  const cat = G.contestPool().find(c => c.id === 'price');
  G.state.notability.player.contestWin = 8;
  const apexItems = new Set();
  for (let i = 0; i < 256; i++) {
    const n = count(); G._cxItemPrize(ac('price'), cat, 'player');
    s.inventory.slice(n).forEach(it => { const d = byId(it.itemId); if (d && d.lootTier === 4) apexItems.add(d.id); });
  }
  T.ok('expert social contest can earn apex gear without wave 4', apexItems.size > 0 && G.unlockedWave() === 1);
  T.ok('that route reaches functional beam-resistant armor', [...apexItems].some(id => (byId(id).armor || {}).beamResist));
  const medium = G.contestPool().find(c => c.id === 'box');
  const n0 = count();
  for (let i = 0; i < 64; i++) G._cxItemPrize(ac(), medium, 'player');
  T.ok('ordinary wins never hand out apex gear even to a celebrity', s.inventory.slice(n0).every(it => byId(it.itemId).lootTier <= 3));
  const monster = { wave: 1, loot: { chance: 1, tier: 4 } };
  T.ok('ordinary wave-1 monster drop cap remains in force', Array.from({ length: 32 }, () => byId(G.rollAlienLoot(monster)).lootTier).every(t => t <= 2));

  const vid = G.state.village.roster.find(id => id !== G.villagerId), p = G.getPerson(vid);
  G.state.notability[vid] = { contestWin: 6 };
  const invBefore = count(), npcBefore = (p.items || []).length;
  const watched = ac('box', vid);
  fixed(0.1, () => G._contestEnd(watched, 'won', true));
  T.ok('watched winner receives the same personal gear roll', (p.items || []).length === npcBefore + 1);
  T.ok('villager prize is not silently redirected into the player pack', count() === invBefore);
  fixed(0.1, () => G._contestEnd(watched, 'won', true));
  T.ok('villager gear grant is idempotent too', p.items.length === npcBefore + 1);

  G.apState().fanClubs = { fight: 0, survival: 0, social: 0, showbiz: 70 };
  G.state.notability.player.contestWin = 0;
  T.ok('TV audience alone unlocks good gifts', G.broadcastRewardTier('player') === 3);
  const curio = Array.from({ length: 128 }, () => G.apWackyGift(3));
  T.ok('hot packages usually deliver earned quality', curio.filter(d => d.lootTier === 3).length > 64);
  T.ok('small fuel/medicine gifts remain in circulation', curio.some(d => d.lootTier === 1));
  T.ok('TV gift pool contains useful defensive gear', curio.some(d => d.armor && d.armor.protection >= 20));
  T.ok('fan gifts never replace dinner or bypass reactor singularity', curio.every(d => !d.kcalEach && d.class !== 'food'));
  const sn = count();
  const show = { kind: 'show', participant: 'player', showId: 'tiny_door', showName: 'Tiny Door', phase: 0 };
  fixed(0.32, () => G._showEnd(show, 'won', false));
  T.ok('an actual successful TV terminal can pay gear without an authored prize flag', s.inventory.slice(sn).some(it => byId(it.itemId).lootTier === 3));
  const sa = count(); fixed(0.1, () => G._showEnd(show, 'won', false));
  T.ok('TV reward cannot be repeated by terminal re-entry', count() === sa);
  const refuseBefore = count();
  fixed(0.1, () => G._showEnd({ kind: 'show', participant: 'player', showId: 'refusal' }, 'refused', false));
  T.ok('refusal does not farm the new performance gift', count() === refuseBefore);

  // The actual counter transaction pays finished food and consumes stock.
  const visitor = { id: 'audit_merchant', name: 'Auditor', entrepreneurial: true, credit: 0 };
  G.state.village.visitors = [visitor]; s.tradesDone = 8;
  const ware = G.visitorWares(visitor)[0]; const wd = byId(ware.itemId);
  T.ok('repeat trade opens tier-3 stock at wave 1', wd.lootTier === 3 && ware.price >= 3600);
  const unpaid = count(); const unsold = G.visitorBuyWare(visitor.id, 0);
  T.ok('unaffordable stock cannot be taken for free', !unsold && !ware.sold && count() === unpaid);
  s.inventory.push({ name: 'Smoked supper', kcalEach: 1000, units: 10, spoilDay: 9999, safe: true, foodState: 'cooked', prep: 'smoked', kg: 0.5 });
  const foodBefore = s.inventory.find(it => it.name === 'Smoked supper').units;
  const bought = G.visitorBuyWare(visitor.id, 0);
  T.ok('food-producing play actually purchases good gear', bought && ware.sold && s.inventory.some(it => it.itemId === ware.itemId));
  T.ok('purchase really spends food', (s.inventory.find(it => it.name === 'Smoked supper') || {}).units < foodBefore);
  const twice = count(); G.visitorBuyWare(visitor.id, 0);
  T.ok('sold stock cannot be bought twice', count() === twice);

  for (const [tier, ids] of Object.entries(G.data.rewardEconomy.extraItems)) {
    T.ok('all tier-' + tier + ' additions have real equipment fields', ids.every(id => { const d = byId(id); return d && d.lootTier === Number(tier) && (d.armor || d.weapon); }));
  }
  // Current Pack reads canonical rows; the HUD status inventory is deliberately
  // thin. Prove live metadata and real equip/use here. Actual mobile Pack
  // controls and copy isolation are a separate browser boundary proof.
  K.newRun(G);
  const uiScholar = G.state.scholar;
  G.alienLootGrant('wardens_cloak');
  G.alienLootGrant('phase_blade');
  G.apGrantItem('medfoam_canister');
  const view = uiScholar.inventory;
  const cloak = view.find(it => it.itemId === 'wardens_cloak');
  T.ok('delivered reward retains its ID, weight and discovery flags', cloak && cloak.kg === byId('wardens_cloak').kg && cloak.alienEffectHidden);
  T.ok('real prize is recognized as wearable armor', G.isArmor(cloak));
  T.ok('real weapon is recognized as equipable', G.isWeapon(view.find(it => it.itemId === 'phase_blade')));
  T.ok('real medicine gift is usable', G.isUsable(view.find(it => it.itemId === 'medfoam_canister')));
  uiScholar.equipped = {};
  const armorBefore = G.armorBonus();
  G.equip(uiScholar.inventory.indexOf(cloak), 'torso');
  T.ok('real Wear changes effective protection and preserves hidden discovery',
    G.armorBonus() > armorBefore && uiScholar.equipped.torso?.itemId === 'wardens_cloak' && uiScholar.equipped.torso.alienEffectHidden);
  const weaponIndex = uiScholar.inventory.findIndex(it => it.itemId === 'phase_blade');
  G.equip(weaponIndex, 'melee');
  T.ok('real Equip installs the delivered weapon', uiScholar.equipped.melee?.itemId === 'phase_blade');
  uiScholar.health = 30;
  const medIndex = uiScholar.inventory.findIndex(it => it.itemId === 'medfoam_canister');
  G.useItem(medIndex);
  T.ok('real medicine Use heals a wounded bearer and consumes the delivery',
    uiScholar.health > 30 && uiScholar.health <= 100 && !uiScholar.inventory.some(it => it.itemId === 'medfoam_canister'));
  let badKin = 0;
  for (let i = 0; i < 100; i++) {
    const ids = G.genItemCandidates({}, { age: 19, name: 'Young survivor' });
    badKin += ids.filter(id => !G.kinAgeOk((byId(id) || {}).kin || 'none', 19)).length;
  }
  T.ok('100 full candidate sheets respect the same kin age gate', badKin === 0);
  T.done();
})().catch(e => { console.error(e.stack); process.exitCode = 1; });
