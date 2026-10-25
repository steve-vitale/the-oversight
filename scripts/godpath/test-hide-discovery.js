#!/usr/bin/env node
'use strict';
const K = require('./lib'), T = K.reporter('hide-discovery');
(async () => {
  const G = await K.load({ seed: Number(process.env.SEED || 7) }); K.newRun(G);
  const s = G.state.scholar; s.insideHaven = true; s.kcal = 4000;
  const level = () => ((G.state.codex.recipes || {}).hide_armor || {}).level || 0;
  const forget = () => { delete G.state.codex.recipes.hide_armor; };
  const hide = units => ({ material: 'hide', name: 'Prepared hide', units, kg: 0.8, kcalEach: 0, spoilDay: 9999 });
  const stash = G.prepStash(); stash.length = 0; stash.push(hide(2)); s.inventory = [];
  forget(); T.ok('counter stock alone does not grant knowledge', level() === 0);
  G.takePrepMaterial(0, 1);
  T.ok('actual counter pickup teaches the existing L1 outline only', level() === 1);
  const learned = JSON.stringify(G.state.codex.recipes.hide_armor); G.takePrepMaterial(0, 1);
  T.ok('repeat handling neither promotes nor rewrites the known outline', JSON.stringify(G.state.codex.recipes.hide_armor) === learned);
  forget(); G.noteHideHandled({ plantId: 'animal_hide', units: 0 });
  T.ok('an empty legacy hide cannot teach through nonexistent handling', level() === 0);
  forget(); G.noteHideHandled({ plantId: 'animal_hide', units: Infinity });
  T.ok('nonfinite hide stock cannot teach through nonexistent handling', level() === 0);
  forget(); G.noteHideHandled({ material: 'bone', units: 1 });
  T.ok('unrelated material does not teach hide armor', level() === 0);
  forget(); G.addMaterial('hide', 1);
  T.ok('ordinary real material acquisition teaches the same L1 outline', level() === 1);
  forget(); s.inventory = []; const shared = G.stashState(); shared.materials.hide = 1; G.takeMaterial('hide', 1);
  T.ok('public communal take has the same handling lesson', level() === 1);
  const body = id => ({ id, kind: 'animal', name: 'Prepared animal body', dayDied: s.day, node: { x: G.map.px, y: G.map.py }, mx: s.mx || 4, my: s.my || 4, items: [{ plantId: 'animal_hide', material: 'hide', name: 'Prepared legacy hide', units: 1, kg: 1, kcalEach: 0, spoilDay: 9999 }] });
  forget(); G.state.corpses = [body('prepared_single')]; G.corpseTakeItem('prepared_single', 0);
  T.ok('actual single corpse take still teaches after its source is emptied', level() === 1);
  forget(); G.state.corpses = [body('prepared_batch')]; G.corpseLootAll('prepared_batch');
  T.ok('actual batch corpse take still teaches after its source is emptied', level() === 1);
  forget(); G.state.corpses = [body('prepared_legacy')]; G.lootCorpse('prepared_legacy', true);
  T.ok('legacy corpse take also teaches for the one real unit transferred', level() === 1);
  forget(); s.inventory = []; G.state.corpses = [body('prepared_empty')]; G.state.corpses[0].items[0].units = 0; G.lootCorpse('prepared_empty', true);
  T.ok('legacy looting cannot take or learn from explicit empty hide', level() === 0 && !s.inventory.length);
  forget(); s.inventory = []; G.state.corpses = [body('prepared_unitless')]; delete G.state.corpses[0].items[0].units; G.lootCorpse('prepared_unitless', true); G.lootCorpse('prepared_unitless', true);
  T.ok('legacy singleton body stock is consumed once without becoming NaN loot', s.inventory.reduce((n,i)=>n+(i.units||0),0) === 1 && G.state.corpses[0].items[0].units === 0);
  G.learnRecipe('hide_armor', 2); G.noteHideHandled(hide(1));
  T.ok('handling never downgrades or bypasses existing higher knowledge', level() === 2);
  const animal = G.data.animals.find(a => (a.butcher || {}).hide > 0 && !(a.butcher || {}).fat);
  const carcass = () => ({ plantId: 'meat_' + animal.id, animalId: animal.id, name: 'Prepared carcass', foodKind: 'meat', foodState: 'carcass', units: 1, hiddenKcal: 1000, kcalEach: 0, spoilDay: s.day + 2, kg: 1 });
  G.state.codex.techniques = { clean: true, shell: true, cook: true, preserve: true };
  forget(); s.inventory = [{ itemId: 'stone_knife', units: 1, kg: 0.4 }, carcass()]; G.cleanCarcass();
  T.ok('direct pack butchering teaches when the actual hide reaches hands', level() === 1);
  const teacher = G.state.village.roster.find(id => id !== G.villagerId);
  for (const p of [(G.state.village.rosterChars || {})[teacher], G.getPerson(teacher), G.data.villagers.find(p => p.id === teacher)]) if (p) p.formerOccupation = 'butcher';
  G.npcSetNode(teacher, G.map.px, G.map.py);
  forget(); s.inventory = [carcass()]; G.askSpecialist(teacher, 0, undefined, 'butcher');
  T.ok('real specialist pack butchering follows the same handling lesson', level() === 1 && s.inventory.some(i => i.material === 'hide'));
  forget(); s.inventory = [{ itemId: 'stone_knife', units: 1, kg: 0.4 }]; stash.length = 0; stash.push(carcass()); G.cleanCarcass(undefined, stash);
  // R44 (journey-deepening r44): counter butchering IS handling the hide —
  // the beat fires when the hide lands on the scholar's own prep counter,
  // so the lesson is taught at the counter; only the MATERIAL waits for
  // pickup. The old expectation (lesson deferred until pickup) encoded the
  // pre-r44 wiring limit, not a design law.
  T.ok('counter butchering teaches at the counter (r44 hide beat)', level() === 1);
  T.ok('butchered hide stays on the counter until pickup', stash.some(i => i.material === 'hide') && !s.inventory.some(i => i.material === 'hide'));
  G.takePrepMaterial(stash.findIndex(i => i.material === 'hide'), 1);
  T.ok('taking the real butchered hide completes the discovery path', level() === 1);
  forget(); G.noteHideHandled({ plantId: 'animal_hide', units: 1 });
  s.inventory = [hide(2), { material: 'vine', units: 1, kg: 0.1 }];
  const made = G.craft('hide_armor');
  T.ok('blind public trial risks actual hide and lashing supplies', G.materialCount('hide') === 0 && G.materialCount('vine') === 0);
  T.ok('only a real successful trial advances the outline to L2', made === true ? level() === 2 && s.inventory.some(i => i.itemId === 'hide_armor') : level() === 1 && !s.inventory.some(i => i.itemId === 'hide_armor'));
  // Visible fiber is a plausible lashing guess, but the hidden recipe needs
  // vine. The maker must receive the same blind refusal as a human, not peek.
  forget(); s.equipped.torso = null; s.inventory = [{ material: 'fiber', units: 1, kg: 0.1 }]; stash.length = 0; stash.push(hide(2));
  const ctx = {}, said = K.captureSays(G); require('../policies/livelihood').make(G, ctx);
  T.ok('maker handles visible spare hide then attempts its earned outline', ctx.livelihoodHideTrials === 1 && level() === 1);
  T.ok('wrong visible lashing guess preserves stock and reveals no hidden ingredient list', G.materialCount('hide') === 2 && G.materialCount('fiber') === 1 && said.some(x => /best guess|not really/i.test(x)) && !said.some(x => /Need 1 vine/.test(x)));
  require('../policies/livelihood').make(G, ctx);
  T.ok('repeated upkeep cannot spam blind recipe probes', ctx.livelihoodHideTrials === 1);
  s.day += 3; s.dayTicks = 0;
  require('../policies/livelihood').make(G, ctx);
  T.ok('passing days does not repeat an unchanged rejected guess', ctx.livelihoodHideTrials === 1);
  G.addMaterial('vine', 1);
  require('../policies/livelihood').make(G, ctx);
  T.ok('new visible supplies permit a real funded trial without a skipped-probe cooldown', ctx.livelihoodHideTrials === 2 && G.materialCount('hide') === 0 && G.materialCount('vine') === 0);
  // A real failed roll must not permanently blacklist its now-consumed kit.
  if (level() === 1) {
    s.day += 3; s.dayTicks = 0; G.addMaterial('hide', 2); G.addMaterial('vine', 1);
    require('../policies/livelihood').make(G, ctx);
    T.ok('restocking a funded failed trial permits another real roll', ctx.livelihoodHideTrials === 3 && G.materialCount('hide') === 0 && G.materialCount('vine') === 0);
  }
  T.done();
})().catch(e => { console.error(e); process.exitCode = 1; });
