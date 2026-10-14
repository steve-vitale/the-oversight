#!/usr/bin/env node
// test-keepsake-growth-20261014.js — keepsakes compete for accessory slots
// and grow (docs/COHERENCE-SPINE.md "Keepsakes: the growth model").
//
// Steve (STEVE-ANSWERS.md): "Sentimental items need to compete with accessory
// gear for the extra slots available ... They start off doing nothing, they
// start doing a little, but they displace gear or accessories that would
// typically give other actions or boosts."
//
// Proves:
//   A. a keepsake equips into an accessory slot (acc1-acc4); unequip keeps bond
//   B. keepsakes and accessories compete for the same four slots
//   C. bond grows only while worn (pack = dormant)
//   D. L1 passive is real: resolve takes the edge off trauma (worn only)
//   E. L2 action: usable once per fight, costs kcal, listed with combat actions
//   F. L3: the enhancement offer comes at bond 50 (not 10/25) for keepsakes
//   G. the thread home: taken kin -> clue + Game.keepsakeTakenKin()
//   H. old-save migration keeps chosen enhancements and wears the keepsakes
'use strict';
const K = require('./godpath/lib');

(async () => {
  const T = K.reporter('keepsake-growth');
  const Game = await K.load({ seed: 20261014 });
  const s = K.newRun(Game);
  Game.state.systemArrived = true;
  s.kcal = 2000;
  const ACC = ['acc1', 'acc2', 'acc3', 'acc4'];
  const defOf = (id) => (Game.data.items || []).find(i => i.id === id) || {};
  const mk = (id, extra) => Object.assign({ itemId: id, units: 1, kcalEach: 0, kg: 0.2, name: defOf(id).name || id,
    owner: Game.villagerId, bonded: true, bond: 0, bondOffered: [], enhancements: [] }, extra || {});
  const clearAcc = () => { for (const sl of ACC) delete s.equipped[sl]; };
  const packIdx = (it) => s.inventory.indexOf(it);

  T.section('A. a keepsake wears in an accessory slot');
  T.ok('API exists (equipAccessory, keepsakeLevel, keepsakeTakenKin)',
    typeof Game.equipAccessory === 'function' && typeof Game.keepsakeLevel === 'function' && typeof Game.keepsakeTakenKin === 'function');
  if (typeof Game.equipAccessory !== 'function') { T.done(); return; }
  const wornAtStart = ACC.filter(sl => s.equipped[sl] && Game.isKeepsake(s.equipped[sl])).length;
  T.ok('a new run starts with its keepsakes worn', wornAtStart >= 1, 'worn=' + wornAtStart);
  clearAcc();
  s.inventory = s.inventory.filter(i => !Game.isKeepsake(i));
  const ring = mk('mothers_ring', { bond: 7 });
  s.inventory.push(ring);
  const slot = Game.equipAccessory(packIdx(ring));
  T.ok('equipAccessory puts it in acc1-acc4', ACC.includes(slot) && s.equipped[slot] && s.equipped[slot].itemId === 'mothers_ring', String(slot));
  T.ok('worn keepsake left the pack', !s.inventory.some(i => i.itemId === 'mothers_ring'));
  T.ok('Game.equip(idx, accN) routes to the same path', (() => {
    Game.unequip(slot);
    const i = s.inventory.findIndex(x => x.itemId === 'mothers_ring');
    Game.equip(i, 'acc3');
    return s.equipped.acc3 && s.equipped.acc3.itemId === 'mothers_ring';
  })());
  Game.unequip('acc3');
  const back = s.inventory.find(i => i.itemId === 'mothers_ring');
  T.ok('unequip keeps the bond (7) and the instance fields', back && back.bond === 7 && back.bonded === true && back.owner === Game.villagerId, JSON.stringify(back));

  T.section('B. four slots, shared with accessory gear');
  clearAcc();
  s.inventory = s.inventory.filter(i => !Game.isKeepsake(i) && defOf(i.itemId).slot !== 'acc');
  const ks = ['daughters_drawing', 'lucky_coin', 'locket', 'tote_bag'].map(id => mk(id));
  ks.forEach(k => s.inventory.push(k));
  for (const k of ks) Game.equipAccessory(packIdx(k));
  T.ok('four keepsakes fill acc1-acc4', ACC.every(sl => s.equipped[sl] && Game.isKeepsake(s.equipped[sl])));
  const horn = { itemId: 'beastcall_horn', name: defOf('beastcall_horn').name, units: 1, kcalEach: 0, kg: 0.5 };
  s.inventory.push(horn);
  const lines = K.captureSays(Game);
  T.ok('an accessory is refused when all four are full', Game.equipAccessory(packIdx(horn)) === null && s.inventory.includes(horn));
  T.ok('the refusal says why (shared four)', lines.some(l => /four/.test(l) && /take one off/i.test(l)), lines.slice(-1)[0]);
  lines.restore();
  Game.unequip('acc2');
  const hs = Game.equipAccessory(packIdx(horn));
  T.ok('take a keepsake off -> the accessory takes its slot', hs === 'acc2' && s.equipped.acc2.itemId === 'beastcall_horn');
  T.ok('never more than four accessories worn', ACC.filter(sl => s.equipped[sl]).length === 4);

  T.section('C. bond grows only while worn');
  clearAcc();
  s.inventory = s.inventory.filter(i => !Game.isKeepsake(i));
  const worn = mk('daughters_drawing', { bond: 2 });
  const packed = mk('lucky_coin', { bond: 2 });
  s.inventory.push(worn, packed);
  Game.equipAccessory(packIdx(worn));
  const wornNow = s.equipped.acc1;
  s.relicChoices = null;
  Game.accrueRelicBond();
  T.ok('worn keepsake +1/day', wornNow.bond === 3, 'bond=' + wornNow.bond);
  T.ok('pack keepsake dormant (no growth)', packed.bond === 2, 'bond=' + packed.bond);
  T.ok('story moment (+3) skips the pack too', Game.keepsakeGrow(packed, 3, 'test') === 0 && packed.bond === 2);
  T.ok('story moment (+3) lands on the worn one', Game.keepsakeGrow(wornNow, 3, 'test') === 3 && wornNow.bond === 6);

  T.section('D. L1 passive made real: resolve softens trauma (worn only)');
  clearAcc();
  s.inventory = s.inventory.filter(i => !Game.isKeepsake(i));
  const drawing = mk('daughters_drawing', { bond: 12 });
  s.inventory.push(drawing);
  T.ok('lane: daughters_drawing grows along resolve', Game.keepsakeLane(drawing) === 'resolve');
  s.trauma = 0;
  Game.addTrauma(8);
  T.ok('in the pack (L1 by bond): full trauma (8)', s.trauma === 8, 'trauma=' + s.trauma);
  Game.equipAccessory(packIdx(drawing));
  T.ok('worn at bond 12 = level 1', Game.keepsakeLevel(s.equipped.acc1) === 1);
  s.trauma = 0;
  Game.addTrauma(8);
  T.ok('worn L1 resolve: trauma 8 lands as 6', s.trauma === 6, 'trauma=' + s.trauma);
  s.equipped.acc1.bond = 5;
  s.trauma = 0;
  Game.addTrauma(8);
  T.ok('worn but L0 (bond 5): nothing mechanical', s.trauma === 8, 'trauma=' + s.trauma);

  T.section('E. L2 action: once per fight, small kcal cost');
  clearAcc();
  s.inventory = s.inventory.filter(i => !Game.isKeepsake(i));
  const d2 = mk('daughters_drawing', { bond: 26 });
  s.inventory.push(d2);
  Game.equipAccessory(packIdx(d2));
  s.kcal = 2000;
  K.fight(Game, 'hushwolf');
  T.ok('fight started', !!Game.tbfight);
  const acts = Game.activatableAbilities().filter(a => a.abilityId === 'keepsake');
  T.ok('Steady listed with the combat actions', acts.some(a => a.id === 'keepsake.steady' && a.combat && a.available), JSON.stringify(acts.map(a => [a.id, a.available, a.why])));
  const pf = Game.tbFighter('p');
  try { Game.applyStatus(pf, 'fear', { chance: 1, source: 'test' }); } catch (e) { console.log('applyStatus: ' + e.message); }
  T.ok('player is afraid before Steady', Game.hasStatus(pf, 'fear'));
  const k0 = s.kcal;
  const used = Game.useAbility('keepsake', 'steady');
  T.ok('Steady fires', used === true);
  T.ok('Steady cleared the fear', !Game.hasStatus(pf, 'fear'));
  T.ok('Steady cost kcal (40)', k0 - s.kcal === 40, 'spent=' + (k0 - s.kcal));
  pf.acted = false;
  const k1 = s.kcal;
  T.ok('second Steady this fight refused', Game.useAbility('keepsake', 'steady') === false && s.kcal === k1);
  T.ok('button shows it used up', Game.activatableAbilities().some(a => a.id === 'keepsake.steady' && !a.available));
  // Lucky Break (quiet luck) and Hold (anchor) through the same engine.
  clearAcc();
  const coin = mk('lucky_coin', { bond: 30 });
  const key = mk('home_key', { bond: 30 });
  s.inventory.push(coin, key);
  Game.equipAccessory(packIdx(coin)); Game.equipAccessory(packIdx(key));
  pf.acted = false;
  T.ok('Lucky Break fires', Game.useAbility('keepsake', 'lucky_break') === true && Game.tbfight.ksLucky === true);
  T.ok('the next miss becomes a hit (and only one)', Game.keepsakeLuckyBreak('test') === true && Game.tbfight.ksLucky === false);
  pf.acted = false;
  T.ok('Hold fires', Game.useAbility('keepsake', 'hold') === true);
  T.ok('Hold: forced movement refused for the player', Game.keepsakeHoldsGround(pf) === true);
  T.ok('Hold: flee cannot be cut off (pursuit drain)', Game.keepsakeAnchorPursuit() >= 99);
  Game.tbEnd('fled');
  K.fight(Game, 'hushwolf');
  T.ok('a new fight resets once-per-fight', Game.activatableAbilities().some(a => a.id === 'keepsake.lucky_break' && a.available));
  Game.tbEnd('fled');
  clearAcc();
  s.inventory.push(mk('lucky_coin', { bond: 30 }));
  K.fight(Game, 'hushwolf');
  T.ok('a keepsake in the pack grants no action', !Game.activatableAbilities().some(a => a.abilityId === 'keepsake'));
  T.ok('useAbility refuses a pack keepsake action', Game.useAbility('keepsake', 'lucky_break') === false);
  Game.tbEnd('fled');

  T.section('F. L3: the evolution offer comes at bond 50');
  clearAcc();
  s.inventory = s.inventory.filter(i => !Game.isKeepsake(i));
  const r9 = mk('mothers_ring', { bond: 9 });
  s.inventory.push(r9);
  Game.equipAccessory(packIdx(r9));
  s.relicChoices = null;
  Game.accrueRelicBond();
  T.ok('bond 10 no longer offers an enhancement for a keepsake', s.equipped.acc1.bond === 10 && !s.relicChoices);
  s.equipped.acc1.bond = 49;
  Game.accrueRelicBond();
  T.ok('bond 50: the System offers 1 of 3 (or the secret)', !!s.relicChoices && s.relicChoices.threshold === 50 && s.relicChoices.options.length >= 3,
    JSON.stringify(s.relicChoices && { t: s.relicChoices.threshold, n: s.relicChoices.options.length }));
  const pick = s.relicChoices && s.relicChoices.options[0].id;
  Game.chooseRelicEnhancement(pick);
  T.ok('choosing records the evolution on the worn keepsake', s.equipped.acc1.enhancements.includes(pick) && Game.keepsakeLevel(s.equipped.acc1) === 3);
  T.ok('the evolution works while worn', Game.hasRelicEnhancement(pick));
  Game.unequip('acc1');
  T.ok('...and goes quiet in the pack', !Game.hasRelicEnhancement(pick));

  T.section('G. the thread home: taken kin -> clue + keepsakeTakenKin()');
  clearAcc();
  s.inventory = s.inventory.filter(i => !Game.isKeepsake(i));
  const vp = Game.vpOf(Game.villagerId);
  vp.lifeseed.people = [
    { name: 'Danny Reyes', relation: 'brother', fate: 'went up in the Taking with the boring half. He was the funniest person I knew' },
    { name: 'Ruth Reyes', relation: 'grandmother', fate: 'was taken. Eighty-one years old and they called her boring' },
    { name: 'Carla Reyes', relation: 'sister', fate: 'runs a bakery two towns over' },
  ];
  const phone = mk('dead_phone', { bond: 9 });
  const locket = mk('locket', { bond: 9 });
  const album = mk('photo_album', { bond: 30 });
  s.inventory.push(phone, locket, album);
  Game.equipAccessory(packIdx(phone)); Game.equipAccessory(packIdx(locket));
  const tl = K.captureSays(Game);
  s.relicChoices = null;
  Game.accrueRelicBond(); // 9 -> 10: L1, the memory opens
  tl.restore();
  const clues = Game.keepsakeClues();
  T.ok('name reveal (dead_phone, brother Taken) -> seek-your-kin clue naming him',
    clues.some(c => c.kind === 'name' && c.itemId === 'dead_phone' && /Danny Reyes/.test(c.text)), JSON.stringify(clues));
  const seek = ((Game.progState().seeking) || []).find(x => x.id === 'brother');
  T.ok('the journal seeking entry names him', seek && seek.name === 'Danny Reyes' && seek.taken === true, JSON.stringify(seek));
  T.ok('place reveal (locket, grandmother Taken) -> place clue in the codex',
    clues.some(c => c.kind === 'place' && c.itemId === 'locket') &&
    ((Game.state.codex || {}).places || []).some(p => p.id === 'farmhouse' && p.clue && p.kin === 'Ruth Reyes'));
  T.ok('the thread home was said aloud', tl.some(l => /THE THREAD HOME/.test(l)));
  const tk = Game.keepsakeTakenKin();
  T.ok('keepsakeTakenKin lists both Taken relatives', tk.length === 2 &&
    tk.some(x => x.itemId === 'dead_phone' && x.name === 'Danny Reyes' && x.relation === 'brother' && x.bond === 10) &&
    tk.some(x => x.itemId === 'locket' && x.name === 'Ruth Reyes'), JSON.stringify(tk));
  T.ok('a keepsake whose relative was NOT Taken is not listed (sister)', !tk.some(x => x.itemId === 'photo_album'));
  T.ok('the link is recorded on the item', s.equipped.acc1.takenKin && s.equipped.acc1.takenKin.name === 'Danny Reyes');

  T.section('H. old-save migration');
  clearAcc();
  s.inventory = s.inventory.filter(i => !Game.isKeepsake(i));
  delete s.ksGrowthV;
  const old = mk('wedding_ring', { bond: 31, bondOffered: [10, 25], enhancements: ['resolve', 'anchor'] });
  const old2 = mk('mixtape', { bond: 4 });
  s.inventory.push(old, old2);
  s.relicChoices = null;
  T.ok('migration runs once', Game.migrateKeepsakes() === true && Game.migrateKeepsakes() === false);
  const wornOld = ACC.map(sl => s.equipped[sl]).find(x => x && x.itemId === 'wedding_ring');
  T.ok('old keepsakes are worn after load (free slots)', !!wornOld && ACC.some(sl => s.equipped[sl] && s.equipped[sl].itemId === 'mixtape'));
  T.ok('chosen enhancements survive', wornOld && wornOld.enhancements.join(',') === 'resolve,anchor' && wornOld.bondOffered.join(',') === '10,25');
  T.ok('the old flashback is not replayed', wornOld && wornOld.flashbackPlayed === true);
  T.ok('old enhancements still work (worn)', Game.hasRelicEnhancement('resolve') && Game.hasRelicEnhancement('anchor'));
  Game.accrueRelicBond();
  T.ok('no re-offer at 10/25; growth continues', !s.relicChoices && wornOld.bond === 32, 'bond=' + (wornOld && wornOld.bond));

  T.done();
})().catch(e => { console.error(e); process.exitCode = 1; });
