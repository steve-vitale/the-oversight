#!/usr/bin/env node
'use strict';
const K = require('./lib');
const T = K.reporter('crafted-ammo');
const fixed = (fn) => { const r = Math.random; Math.random = () => 0.1; try { return fn(); } finally { Math.random = r; } };
(async () => {
  const memory = new Map();
  globalThis.localStorage = {getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,String(v)),removeItem:k=>memory.delete(k),key:i=>[...memory.keys()][i]??null,get length(){return memory.size;}};
  const G = await K.load({ seed: Number(process.env.SEED || 42) }); K.newRun(G);
  const s = G.state.scholar;
  // Prepared knowledge/materials isolate the recipe -> usable shot route.
  // They do not establish organic discovery frequency or ending balance.
  for (const [weapon, ammo] of [['bow', 'arrow'], ['crossbow', 'bolt']]) {
    G.tbfight = null; G.over = false;
    s.equipped = {}; s.inventory = [];
    for (const id of [weapon, ammo]) {
      G.learnRecipe(id, 3);
      const recipe = G.data.recipes.find(r => r.id === id);
      for (const [material, units] of Object.entries(recipe.materials)) {
        s.inventory.push({ material, units, name: material, kg: 0.1 });
      }
      T.ok(id + ' actual recipe succeeds', fixed(() => G.craft(id)) === true);
    }
    T.ok(ammo + ' costs real materials', !s.inventory.some(i => i.material && !['arrow', 'bolt'].includes(i.material)));
    T.ok(ammo + ' batch is five usable rounds', G.ammoCount(ammo) === 5);
    const idx = s.inventory.findIndex(i => i.itemId === weapon);
    G.equip(idx, 'ranged');
    const m = K.fight(G, 'hushwolf', { px: 2, py: 4, mx: 4, my: 4, hp: 500 });
    const f = G.tbfight, p = G.tbFighter('p');
    T.ok(weapon + ' equipped in a real fight', !!m && G.equippedWeapon().ammo === ammo);
    f.turnIdx = f.order.indexOf('p'); p.acted = false;
    const beforeHP = m.hp;
    T.ok(weapon + ' actually fires crafted ammunition', fixed(() => G.tbPlayerStrike(m.key)) === true);
    T.ok(weapon + ' shot spends one round and hurts target', G.ammoCount(ammo) === 4 && m.hp < beforeHP);
    G.tbfight = null;
    G.spendAmmo(ammo, 4);
    T.ok(ammo + ' exhausted stack is removed', G.ammoCount(ammo) === 0 && !s.inventory.some(i => (i.itemId || i.id) === ammo));
  }
  // Old saves and loot can carry IDs without a material tag. No migration
  // or recipe re-craft should be needed to use rounds already owned.
  s.inventory = [{ itemId: 'arrow', units: 2 }, { id: 'bolt', units: 3 }, { material: 'stone', units: 4 }, { itemId: 'fusion_cell', units: 1 }];
  T.ok('existing itemId and id ammo stacks count', G.ammoCount('arrow') === 2 && G.ammoCount('bolt') === 3);
  T.ok('stones and energy cells use the same contract', G.ammoCount('stone') === 4 && G.ammoCount('fusion_cell') === 1);
  T.ok('spend honors existing ID-only stacks', G.spendAmmo('arrow', 2) && G.spendAmmo('bolt', 3) && G.spendAmmo('fusion_cell', 1));
  T.ok('spending ammo preserves unrelated inventory', s.inventory.length === 1 && s.inventory[0].material === 'stone' && s.inventory[0].units === 4);
  T.ok('no ammunition is conjured when empty', G.spendAmmo('arrow', 1) === false && G.ammoCount('arrow') === 0);
  s.inventory = [{ itemId: 'arrow', material: 'stone', units: 2 }];
  T.ok('explicit material wins over an inconsistent ID', G.ammoCount('arrow') === 0 && G.ammoCount('stone') === 2);
  s.inventory=[];G.learnRecipe('arrow',3);
  for(const[material,units]of Object.entries(G.data.recipes.find(r=>r.id==='arrow').materials))s.inventory.push({material,units});
  T.ok('fresh recipe makes the ammunition used by the persistence proof',fixed(()=>G.craft('arrow'))===true&&G.ammoCount('arrow')===5);
  const key=G.state.runKey;G.save();
  T.ok('real Continue preserves crafted rounds as usable ammunition',G.load(key)&&G.ammoCount('arrow')===5&&G.spendAmmo('arrow',1)&&G.ammoCount('arrow')===4);
  T.done();
})().catch(e => { console.error(e.stack); process.exitCode = 1; });
