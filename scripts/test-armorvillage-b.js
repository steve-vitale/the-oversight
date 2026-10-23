#!/usr/bin/env node
// test-armorvillage-b.js — sim-armorvillage-b structure + policy proof.
// (flesh-out loop arm sim-armorvillage-b, axis scale-onramp; completed by
// run fleshout-20261023T0713Z after the dead 0515Z run's worker died mid-build.)
//
// Gates:
//   E0 shape — policy module loads (namespace armorvillage); the engine verbs
//     (donateArmor/takeArmor/giftArmor/villagerArmorCraftDay) are wired on
//     Game; policy file requires no src/js.
//   E1 synthetic RED->GREEN — the structure's named outputs fire:
//     E1a (#806): equip-overwrite conserves the displaced piece (RED would
//         vanish it; GREEN returns it to the pack, units conserved).
//     E1b (pile): donateArmor lands armor in stashState().armor with an
//         'Armor' ledger give; takeArmor returns it.
//     E1c (gift): giftArmor hands a specific piece to a specific villager,
//         +2 trust, the piece becomes theirs (equipped when it's an upgrade).
//     E1d (craft): a villager wearing bark_armor with materials on hand
//         produces armor via villagerArmorCraftDay (craft tele ok:true).
//   E2 determinism — 30d ARMORVILLAGE=1 run, same seed twice -> identical
//     trajectory digests.
//   E3 det-gate — ARMORVILLAGE unset: armed-policy run == control run,
//     byte-identical digests (policy pure-delegates; engine systemic beats
//     inert; the #806 fix applies to both arms equally).
//   E4 mechanism-fire — 150d ARMORVILLAGE=1 run: at least one channel fires
//     (deposit, gift, pile-draw, or craft tele event) — mechanism proof,
//     not a wall bar. Horizon note (2026-10-23): 60d was calibrated on the
//     pre-playstyle-differentiation base's early spare pacing; on current
//     master scholars accumulate <2 armor spares by day 60 (the policy's
//     fire threshold), so 60d runs go quiet. 150d matches the observed
//     firing window (channels live by d101-132 on the new base).
//
// Usage env (pinned substrate, matches the pilot sweep):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 \
//   KILLDISC=1 ARMORYDRIVE=1 node scripts/test-armorvillage-b.js
'use strict';
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const REPO = process.env.REPO || path.join(__dirname, '..');
const AV = require(path.join(REPO, 'scripts', 'policies', 'armorvillage'));
const AD = require(path.join(REPO, 'scripts', 'policies', 'armorydrive'));
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));

let pass = 0, fail = 0;
function ok(cond, label) {
  if (cond) { pass++; console.log('  ok: ' + label); }
  else { fail++; console.log('  FAIL: ' + label); }
}

function digestOf(Game) {
  const st = Game.state || {};
  const canon = {
    day: (st.scholar || {}).day || 0,
    pop: ((st.village || {}).roster || []).length,
    wkl: (st.waveKillLog || []).length,
    deaths: (st.telemetry || []).filter(t => t.type === 'death').length,
    armorPile: ((st.village && st.village.stash && st.village.stash.armor) || []).length,
    standing: (function () { try { return Game.villageStandingTotal ? Game.villageStandingTotal() : 0; } catch (e) { return 0; } })(),
    maxWave: (function () { try { return Game.unlockedWave ? Game.unlockedWave() : 1; } catch (e) { return 1; } })(),
  };
  return crypto.createHash('sha256').update(JSON.stringify(canon)).digest('hex');
}

// Put the scholar physically at the haven (established test pattern).
function atHaven(Game) {
  Game.state.scholar.insideHaven = true;
  try { Game.map.px = Game.state.village.px ?? 4; Game.map.py = Game.state.village.py ?? 4; } catch (e) {}
  try { Game.state.scholar.tile = { type: 'haven' }; } catch (e) {}
}

function armorItem(id, units) {
  const defs = null;
  return { itemId: id, units: units || 1, kcalEach: 0, kg: 0.5 };
}

async function freshGame(seed) {
  const { Game } = await loadGame({ seed, mode: 'armorvillage-proof', fullTelemetry: false });
  await setupGame(Game);
  return Game;
}

async function runOnce(seed, days, policy) {
  const Game = await freshGame(seed);
  await quietLog(async () => { await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 30 }); });
  return { digest: digestOf(Game), days: (Game.state.scholar || {}).day || 0 };
}

(async () => {
  console.log('E0 shape');
  ok(typeof AV.armedFor === 'function' && typeof AV.withArmorVillage === 'function', 'policy exports armedFor/withArmorVillage');
  const src = fs.readFileSync(path.join(REPO, 'scripts', 'policies', 'armorvillage.js'), 'utf8');
  ok(!/require\(['"][^'"]*src\/js/.test(src), 'policy requires no src/js');
  {
    const Game = await freshGame(4242);
    ok(typeof Game.donateArmor === 'function', 'Game.donateArmor wired');
    ok(typeof Game.takeArmor === 'function', 'Game.takeArmor wired');
    ok(typeof Game.giftArmor === 'function', 'Game.giftArmor wired');
    ok(typeof Game.villagerArmorCraftDay === 'function', 'Game.villagerArmorCraftDay wired');
    ok(typeof Game.isStashableArmor === 'function', 'Game.isStashableArmor wired');
  }

  console.log('E1 synthetic RED->GREEN (structure verbs)');
  // --- E1a: #806 displaced-piece conservation ---
  {
    const Game = await freshGame(4243);
    atHaven(Game);
    const inv = Game.state.scholar.inventory;
    // scholar wears bark_armor (P10); pack holds leather_jacket (P15)
    Game.state.scholar.equipped = Game.state.scholar.equipped || {};
    Game.state.scholar.equipped.torso = { itemId: 'bark_armor', name: 'Bark armor', units: 1 };
    inv.push(armorItem('leather_jacket'));
    const nBefore = inv.length;
    const idx = inv.findIndex(i => (i.itemId || i.id) === 'leather_jacket');
    let r = 'unset';
    try { r = Game.equip(idx, 'torso'); } catch (e) { r = 'threw:' + e.message; }
    const backInPack = inv.some(i => (i.itemId || i.id) === 'bark_armor');
    ok(r === null, 'equip leather_jacket executes (returns null on success)');
    ok(backInPack, '#806 GREEN: displaced bark_armor returns to the pack (no vanish)');
    ok(inv.length === nBefore, '#806 GREEN: pack entry count conserved (one out, one in)');
    ok((Game.state.scholar.equipped.torso || {}).itemId === 'leather_jacket', 'leather_jacket is now worn');
  }
  // --- E1b: pile deposit + take ---
  {
    const Game = await freshGame(4244);
    atHaven(Game);
    Game.state.scholar.inventory.push(armorItem('bark_armor'));
    const idx = Game.state.scholar.inventory.findIndex(i => (i.itemId || i.id) === 'bark_armor');
    let r = null;
    try { r = Game.donateArmor(idx); } catch (e) { r = 'threw:' + e.message; }
    const pile = (Game.stashState && Game.stashState().armor) || [];
    ok(r !== null && r !== undefined && !String(r).startsWith('threw'), 'donateArmor executes');
    ok(pile.some(e => (e.itemId || e.id) === 'bark_armor'), 'GREEN: bark_armor lands in the armory armor section');
    let t = null;
    try { t = Game.takeArmor('bark_armor'); } catch (e) { t = 'threw:' + e.message; }
    ok(t !== null && t !== undefined && !String(t).startsWith('threw'), 'takeArmor executes');
    ok(Game.state.scholar.inventory.some(i => (i.itemId || i.id) === 'bark_armor'), 'GREEN: bark_armor returns to the pack on take');
  }
  // --- E1c: gift ---
  {
    const Game = await freshGame(4245);
    atHaven(Game);
    Game.state.scholar.inventory.push(armorItem('hide_armor')); // P20
    const idx = Game.state.scholar.inventory.findIndex(i => (i.itemId || i.id) === 'hide_armor');
    const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
    const vid = roster[0];
    const person = Game.getPerson(vid);
    const trustOf = () => { const t = (Game.state.village.trust || {})[vid]; return t === undefined ? 10 : t; };
    const trustBefore = trustOf();
    const events = [];
    const origTele = Game.tele;
    Game.tele = function (ev, data) { events.push([ev, data]); try { return origTele.call(this, ev, data); } catch (e) {} };
    let r = null;
    try { r = Game.giftArmor(idx, vid); } catch (e) { r = 'threw:' + e.message; }
    Game.tele = origTele;
    const trustAfter = trustOf();
    const hasIt = (person.items || []).some(i => (i.itemId || i.id) === 'hide_armor') ||
      Object.values(person.equipped || {}).some(e => e && (e.itemId || e.id) === 'hide_armor');
    ok(r !== null && r !== undefined && !String(r).startsWith('threw'), 'giftArmor executes');
    ok(hasIt, 'GREEN: hide_armor is the villagers (carried or worn)');
    ok(events.some(e => e[0] === 'armor_gift' && e[1] && e[1].item === 'hide_armor'), 'GREEN: armor_gift tele fires');
    ok(trustAfter > trustBefore, 'GREEN: gift grants trust (delta +' + (trustAfter - trustBefore).toFixed(1) + ')');
  }
  // --- E1d: NPC craft beat ---
  {
    const Game = await freshGame(4246);
    const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
    const vid = roster[0];
    const person = Game.getPerson(vid);
    // villager demonstrably knows bark_armor (wears it), materials on hand
    person.equipped = person.equipped || {};
    person.equipped.torso = { itemId: 'bark_armor', name: 'Bark armor', units: 1 };
    const v = Game.state.village;
    v.stash = v.stash || {};
    v.stash.materials = Object.assign({}, v.stash.materials, { bark: 20, vine: 20, hide: 20 });
    v.avCraft = v.avCraft || {};
    v.avCraft[vid] = { bark_armor: 2 }; // practiced hands: 85% odds, near-deterministic over attempts
    const events = [];
    const origTele = Game.tele;
    Game.tele = function (ev, data) { events.push([ev, data]); try { return origTele.call(this, ev, data); } catch (e) {} };
    process.env.ARMORVILLAGE = '1';
    let made = 0;
    for (let d = 0; d < 30; d++) {
      try { Game.state.scholar.day = d; made += (Game.villagerArmorCraftDay() || 0); } catch (e) {}
      if (events.some(e => e[0] === 'armor_craft' && e[1] && e[1].ok === true)) break;
    }
    delete process.env.ARMORVILLAGE;
    Game.tele = origTele;
    ok(made >= 1, 'GREEN: NPC craft beat produces armor (' + made + ' pieces in 30d at L2 odds)');
    ok(events.some(e => e[0] === 'armor_craft' && e[1] && e[1].ok === true), 'GREEN: armor_craft ok tele fires');
  }

  console.log('E2 determinism (ARMORVILLAGE=1, 30d, seed 4242 x2)');
  process.env.ARMORVILLAGE = '1';
  const polA = AV.armedFor('leadfeast');
  const r1 = await runOnce(4242, 30, polA);
  const r2 = await runOnce(4242, 30, polA);
  delete process.env.ARMORVILLAGE;
  ok(r1.digest === r2.digest, 'identical seeds -> identical digests (' + r1.digest.slice(0, 12) + ')');

  console.log('E3 det-gate (ARMORVILLAGE unset: armed policy == control)');
  delete process.env.ARMORVILLAGE;
  const polOff = AV.armedFor('leadfeast'); // gate off -> pure delegation
  const ctl = AD.armedFor('leadfeast');
  const rOff = await runOnce(4242, 30, polOff);
  const rCtl = await runOnce(4242, 30, ctl);
  ok(rOff.digest === rCtl.digest, 'gate off: byte-identical to control (' + rCtl.digest.slice(0, 12) + ')');

  console.log('E4 mechanism-fire (150d ARMORVILLAGE=1 run)');
  {
    process.env.ARMORVILLAGE = '1';
    const Game = await freshGame(4247);
    const seen = { deposit: 0, gift: 0, pileTake: 0, craft: 0 };
    const origTele = Game.tele;
    Game.tele = function (ev, data) {
      if (ev === 'armor_gift') seen.gift++;
      if (ev === 'villager_gear' && data && data.via === 'armor_pile') seen.pileTake++;
      if (ev === 'armor_craft' && data && data.ok) seen.craft++;
      try { return origTele.call(this, ev, data); } catch (e) {}
    };
    const origDonate = Game.donateArmor.bind(Game);
    Game.donateArmor = function (idx) { seen.deposit++; return origDonate(idx); };
    const pol = AV.armedFor('leadfeast');
    await quietLog(async () => { await runDays(Game, pol, { days: 150, manifest: undefined, sampleEvery: 30 }); });
    delete process.env.ARMORVILLAGE;
    Game.tele = origTele;
    const fired = Object.entries(seen).filter(([k, n]) => n > 0).map(([k, n]) => k + '=' + n).join(', ');
    ok(fired.length > 0, 'at least one channel fires in 150d (' + (fired || 'none') + ')');
    console.log('    channels: ' + JSON.stringify(seen));
  }

  console.log('\n' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS FAIL:', e); process.exit(2); });
