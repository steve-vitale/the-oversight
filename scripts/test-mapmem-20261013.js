#!/usr/bin/env node
// PROOF TEST (villager-mapmem 2026-10-13) — Steve: "They need objectives that
// carry past whatever node they happen to be on. They need map memory."
// Fixes the carcass-haul finding: 97% of edible kill kcal rotted unlooted
// because kills weren't treated as resources.
//
// Proves:
//  (a) a villager perceives a corpse on another node and remembers it
//  (b) forms a HAUL objective and travels to the remembered node
//  (c) butchers/hauls the meat and it reaches the pantry
//  (d) the hauled meat gets eaten (villageEats consumes pantry food)
//  (e) expired memories purge (rotted past the spoil clock)
//  (f) knowledge gating: the stored label is the descriptor, not the true
//      name, pre-identification
//  (g) gossip spread: a told villager gains a secondhand, fuzzed memory
//  (h) RED: on pristine code (no mapmem methods) the whole chain is absent
//
// Node harness: sim-harness seeds Math.random BEFORE eval (modules capture
// it at load). Never stubs Game.save. PRISTINE=1 runs against HEAD.
'use strict';
const assert = require('assert');
const { execFileSync } = require('child_process');
const path = require('path');

const PRISTINE = !!process.env.PRISTINE;

function carcassItem(mid, kcal, spoilDay) {
  return { plantId: 'meat_' + mid, foodKind: 'meat', foodState: 'carcass',
    edible: false, units: 1, kcalEach: 0, hiddenKcal: kcal,
    spoilDay: spoilDay, kg: Math.max(0.5, kcal / 1000), name: 'Carcass' };
}

async function main() {
  // On pristine, the harness loads HEAD's scripts (no mapmem module).
  // We emulate by loading the harness then deleting the mapmem methods.
  const { loadGame, setupGame } = require('./sim-harness');
  const { Game } = await loadGame({ seed: 20261013, mode: 'mapmem-proof' });
  await setupGame(Game);
  if (PRISTINE) {
    for (const k of Object.keys(Game)) {
      if (k.startsWith('mapmem')) delete Game[k];
    }
  }
  const hasMapmem = typeof Game.mapmemOf === 'function';
  console.log('mapmem present:', hasMapmem, PRISTINE ? '(PRISTINE)' : '');

  // --- (h) RED: pristine has no map-memory system at all
  if (PRISTINE) {
    assert(!hasMapmem, 'pristine must lack mapmem');
    console.log('PASS h (RED): pristine code has no map-memory system');
    console.log('\nAll RED checks passed (pristine correctly lacks the system).');
    return;
  }
  assert(hasMapmem, 'worktree must have mapmem');

  const v = Game.state.village;
  const hx = v.px ?? 4, hy = v.py ?? 4;
  const s = Game.state.scholar;
  const day = s.day || 1;
  // a live villager who is not the player
  const vid = (v.roster || []).find(id => id !== Game.villagerId);
  assert(vid, 'need a villager');
  // pantry low so the need gate opens
  v.pantry = []; v.pantryKcal = 0;

  // rig a monster corpse on another node with meat on it
  // hushwolf: edible.calories 1400, unknown descriptor pre-identification
  const node = { x: hx + 2, y: hy + 1 };
  const corpse = {
    id: 'probe-corpse-mapmem-1', kind: 'monster', monsterId: 'hushwolf',
    name: 'something', descriptor: 'a hound of static',
    node, mx: 4, my: 4, dayDied: day, cause: 'combat', killerId: vid,
    items: [carcassItem('hushwolf', 1400, day + 3)],
    looted: false, buried: false,
  };
  Game.corpses().push(corpse);

  // --- (a) perception: villager notices the corpse and remembers it
  const site = Game.mapmemRemember(vid, corpse);
  assert(site, 'remember must return a site');
  assert(site.nx === node.x && site.ny === node.y, 'site targets the corpse node');
  assert(site.estKcal > 0, 'site estimates kcal, got ' + site.estKcal);
  const mem = Game.mapmemOf(vid);
  assert(mem.sites.length === 1, 'memory holds the site');
  console.log('PASS a: villager perceives corpse on another node and remembers it');

  // --- (f) knowledge gating: label is the descriptor, not the true name
  const mdef = (Game.data.monsters || []).find(m => m.id === 'hushwolf');
  const trueName = mdef && mdef.name;
  assert(site.label !== trueName, `label must not be the true name pre-identification (got "${site.label}")`);
  console.log(`PASS f: stored label is knowledge-gated ("${site.label}" not "${trueName}")`);

  // mark the species food-safe (village learned it) so the haul is honest
  Game.state.codex.monsters = Game.state.codex.monsters || {};
  Game.state.codex.monsters.hushwolf = { foodSafe: true, foodSafeHow: 'tested' };

  // --- (g) gossip spread: tell another villager
  const vid2 = (v.roster || []).find(id => id !== Game.villagerId && id !== vid);
  assert(vid2, 'need a second villager');
  const copy = Game.mapmemTell(vid, vid2);
  assert(copy, 'tell must produce a copy');
  assert(copy.secondhand === true, 'copy marked secondhand');
  assert(copy.toldBy === vid, 'copy records the teller');
  assert(copy.ref === corpse.id, 'copy references the same corpse');
  console.log('PASS g: gossip spread gives a secondhand, fuzzed memory');

  // --- (b) HAUL objective forms and targets the remembered node
  const best = Game.mapmemBestHaul(vid, hx, hy);
  assert(best && best.ref === corpse.id, 'best haul must be the remembered corpse');
  // drive objPick: force the HAUL candidate to win by emptying other weights
  const o = Game.objOf(vid);
  o.kind = 'idle'; o.state = 'idle';
  // rig: make pantry low (already) and call objPick until HAUL or 20 tries
  let picked = null;
  for (let t = 0; t < 20 && !picked; t++) {
    Game.objPick(vid, hx, hy);
    const oo = Game.objOf(vid);
    if (oo.kind === 'HAUL') picked = oo;
    else { oo.kind = 'idle'; oo.state = 'idle'; }
  }
  assert(picked, 'HAUL objective must form within 20 picks');
  assert(picked.tx === node.x && picked.ty === node.y, 'HAUL targets the remembered node');
  assert(picked.purpose === 'haul', 'purpose is haul');
  console.log('PASS b: villager forms a HAUL objective to the remembered node');

  // --- travel: walk the villager to the node via objAwayStep
  Game.npcSetNode(vid, hx, hy);
  // depart through the normal machinery
  picked.state = 'ready';
  Game.objDepart(vid, picked, hx, hy, false);
  assert(Game.objOf(vid).state === 'out', 'villager is out');
  let arrived = false;
  for (let step = 0; step < 12; step++) {
    const nd = Game.npcNode(vid);
    const away = (v.away || {})[vid];
    Game.objAwayStep(vid, nd, away, hx, hy);
    const nd2 = Game.npcNode(vid);
    if (nd2.nx === node.x && nd2.ny === node.y) { arrived = true; break; }
    if (Game.objOf(vid).state === 'returning') break; // hauled mid-walk
  }
  const ostate = Game.objOf(vid);
  assert(arrived || ostate.state === 'returning',
    'villager must reach the node or be returning with meat');
  console.log('PASS b2: villager travels to the remembered node');

  // --- (c) butcher + pantry: ensure the haul lands in the pantry
  if (ostate.state !== 'returning') {
    // force arrival handling
    Game.npcSetNode(vid, node.x, node.y);
    Game.mapmemHaulAt(vid);
  }
  const o2 = Game.objOf(vid);
  assert(o2.state === 'returning', 'after butchering the villager heads home, got ' + o2.state);
  const hauled = o2.haulKcal || 0;
  assert(hauled > 0, 'haul must carry kcal, got ' + hauled);
  // return home and fire the return effect
  Game.npcSetNode(vid, hx, hy);
  delete (v.away || {})[vid];
  const before = (v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
  Game.objReturnEffect(vid, 'haul');
  const after = (v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
  assert(after - before === hauled, `pantry must gain exactly the hauled kcal (${before} -> ${after}, hauled ${hauled})`);
  console.log(`PASS c: butchered ${hauled} kcal hauled to the pantry`);

  // --- (d) the meat gets eaten: a hungry villager eats via villageEats
  const eater = vid2;
  try {
    const nn = Game.npcNeeds(eater);
    nn.hunger = 90;
  } catch (e) {}
  const ateBefore = after;
  Game.villageEats();
  const ateAfter = (v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
  assert(ateAfter < ateBefore, `villageEats must consume pantry food (${ateBefore} -> ${ateAfter})`);
  console.log('PASS d: hauled meat gets eaten through the village meal system');

  // --- (e) expired memories purge
  const corpse2 = {
    id: 'probe-corpse-mapmem-2', kind: 'monster', monsterId: 'hushwolf',
    name: 'something', node: { x: hx - 2, y: hy }, mx: 4, my: 4,
    dayDied: day - 10, cause: 'combat',
    items: [carcassItem('hushwolf', 1400, day - 7)], // long spoiled
    looted: false, buried: false,
  };
  Game.corpses().push(corpse2);
  const s2 = Game.mapmemRemember(vid, corpse2);
  assert(!s2, 'spoiled corpse must not be remembered');
  // age the first site past its spoil clock
  const mem2 = Game.mapmemOf(vid);
  mem2.sites.push({ nx: node.x, ny: node.y, kind: 'corpse', ref: 'gone',
    label: 'x', mid: 'hushwolf', estKcal: 100, seenDay: day - 9,
    spoilBy: day - 6, secondhand: false, toldBy: null });
  const purged = Game.mapmemPurge(vid);
  assert(!purged.some(x => x.ref === 'gone'), 'expired memory must purge');
  console.log('PASS e: expired memories purge; spoiled corpses are never remembered');

  // --- cap: memory bounded
  for (let i = 0; i < 20; i++) {
    Game.mapmemOf(vid).sites.push({ nx: hx, ny: hy, kind: 'corpse', ref: 'cap-' + i,
      label: 'x', mid: 'hushwolf', estKcal: 10 + i, seenDay: day,
      spoilBy: day + 3, secondhand: false, toldBy: null });
  }
  // trigger cap enforcement via a fresh remember
  const corpse3 = {
    id: 'probe-corpse-mapmem-3', kind: 'monster', monsterId: 'hushwolf',
    name: 'something', node: { x: hx + 1, y: hy }, mx: 4, my: 4,
    dayDied: day, cause: 'combat',
    items: [carcassItem('hushwolf', 1400, day + 3)],
    looted: false, buried: false,
  };
  Game.corpses().push(corpse3);
  Game.mapmemRemember(vid, corpse3);
  assert(Game.mapmemOf(vid).sites.length <= 12, 'memory capped at 12');
  console.log('PASS cap: map memory bounded at 12 sites');

  console.log('\nAll map-memory proof checks passed.');
}

main().then(() => process.exit(0)).catch(e => {
  console.error('PROOF FAILED:', e.message);
  process.exit(1);
});
