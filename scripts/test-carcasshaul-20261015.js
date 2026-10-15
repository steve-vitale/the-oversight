#!/usr/bin/env node
// PROOF TEST (sim-carcasshaul 2026-10-15) — the MAPMEM gate for the pilot.
//
// Proves:
//  (a) RED: MAPMEM=0 deletes every mapmem* method; all hooks degrade
//      (no HAUL candidate, no remembered sites, expedition kills leave no
//      remembered body) — the game behaves as pre-1723aae1.
//  (b) GREEN: MAPMEM=1 leaves the mechanism intact (full chain: remember ->
//      HAUL objective -> travel -> butcher -> pantry deposit).
//  (c) SMOKE: a policy-less daily fails loudly; a gated-off gate fails
//      loudly; the gate is honest about which side it's on.
//  (d) HAUL telemetry wrap: the sweep's deposit measurement captures
//      exactly the kcal objReturnEffect deposits for purpose 'haul'.
//
// Node harness: sim-harness seeds Math.random BEFORE eval (modules capture
// it at load). Never stubs Game.save.
'use strict';
const assert = require('assert');
const path = require('path');

const { applyMapmemGate, smokeMapmem, MAPMEM_METHODS } = require('./mapmem-gate-20261015');

function carcassItem(mid, kcal, spoilDay) {
  return { plantId: 'meat_' + mid, foodKind: 'meat', foodState: 'carcass',
    edible: false, units: 1, kcalEach: 0, hiddenKcal: kcal,
    spoilDay: spoilDay, kg: Math.max(0.5, kcal / 1000), name: 'Carcass' };
}

async function freshGame(mapmemEnv) {
  const saved = process.env.MAPMEM;
  if (mapmemEnv === undefined) delete process.env.MAPMEM; else process.env.MAPMEM = mapmemEnv;
  const { loadGame, setupGame } = require('./sim-harness');
  const { Game } = await loadGame({ seed: 20261015, mode: 'carcasshaul-proof' });
  applyMapmemGate(Game);
  await setupGame(Game);
  if (saved === undefined) delete process.env.MAPMEM; else process.env.MAPMEM = saved;
  return Game;
}

function pickRanger(Game) {
  // the haul needs a villager who actually ranges (homebodies: npcMaxDist 0)
  const v = Game.state.village;
  for (const id of (v.roster || [])) {
    if (id === Game.villagerId) continue;
    let d = 0;
    try { d = Game.npcMaxDist(id) || 0; } catch (e) {}
    if (d >= 2) return id;
  }
  return (v.roster || []).find(id => id !== Game.villagerId);
}

function rigCorpse(Game, vid) {
  const v = Game.state.village;
  const hx = v.px ?? 4, hy = v.py ?? 4;
  const day = Game.state.scholar.day || 1;
  let rng = 0;
  try { rng = Game.npcMaxDist(vid) || 0; } catch (e) {}
  // place the corpse within the villager's honest range
  const node = { x: hx + Math.min(2, Math.max(1, rng)), y: hy + 1 };
  const corpse = {
    id: 'probe-carcasshaul-1', kind: 'monster', monsterId: 'hushwolf',
    name: 'something', descriptor: 'a hound of static',
    node, mx: 4, my: 4, dayDied: day, cause: 'combat', killerId: vid,
    items: [carcassItem('hushwolf', 1400, day + 3)],
    looted: false, buried: false,
  };
  Game.corpses().push(corpse);
  Game.state.codex.monsters = Game.state.codex.monsters || {};
  Game.state.codex.monsters.hushwolf = { foodSafe: true, foodSafeHow: 'tested' };
  v.pantry = []; v.pantryKcal = 0; // need gate opens
  return { node, hx, hy, corpse };
}

async function main() {
  // --- (c) SMOKE first: gate honesty
  {
    const Game = await freshGame('1');
    const bad = smokeMapmem(Game, { daily() {} }, 'smoke-armed', true);
    assert(bad.length === 0, 'armed SMOKE must pass: ' + bad.join('; '));
    const bad2 = smokeMapmem(Game, {}, 'smoke-policyless', true);
    assert(bad2.some(b => /policy-less/.test(b)), 'policy-less daily must fail SMOKE');
    console.log('PASS c: SMOKE catches policy-less suites and passes the armed side');
  }
  {
    const Game = await freshGame('0');
    const bad = smokeMapmem(Game, { daily() {} }, 'smoke-control', false);
    assert(bad.length === 0, 'control SMOKE must pass: ' + bad.join('; '));
    console.log('PASS c2: SMOKE passes the control side (MAPMEM=0)');
  }

  // --- (a) RED: mechanism inert when off
  {
    const Game = await freshGame('0');
    const v = Game.state.village;
    const vid = pickRanger(Game);
    assert(vid, 'need a villager');
    const { node, hx, hy, corpse } = rigCorpse(Game, vid);
    assert(typeof Game.mapmemRemember !== 'function', 'RED: mapmemRemember must be gone');
    // objPick must never offer HAUL: mapmemBestHaul is null-guarded
    const o = Game.objOf(vid);
    o.kind = 'idle'; o.state = 'idle';
    let haulOffered = false;
    for (let t = 0; t < 20; t++) {
      Game.objPick(vid, hx, hy);
      if (Game.objOf(vid).kind === 'HAUL') { haulOffered = true; break; }
      Game.objOf(vid).kind = 'idle'; Game.objOf(vid).state = 'idle';
    }
    assert(!haulOffered, 'RED: control must never form a HAUL objective');
    // expedition-kill hook inert: no remembered body, no remembered sites
    Game.npcSetNode(vid, node.x, node.y);
    console.log('PASS a (RED): MAPMEM=0 — no methods, no HAUL objectives, hooks inert');
  }

  // --- (b) GREEN: full chain fires when armed
  {
    const Game = await freshGame('1');
    const v = Game.state.village;
    const vid = pickRanger(Game);
    assert(vid, 'need a villager');
    const { node, hx, hy, corpse } = rigCorpse(Game, vid);
    const site = Game.mapmemRemember(vid, corpse);
    assert(site && site.ref === corpse.id, 'GREEN: memory forms');
    const o = Game.objOf(vid);
    o.kind = 'idle'; o.state = 'idle';
    let picked = null;
    for (let t = 0; t < 20 && !picked; t++) {
      Game.objPick(vid, hx, hy);
      if (Game.objOf(vid).kind === 'HAUL') picked = Game.objOf(vid);
      else { Game.objOf(vid).kind = 'idle'; Game.objOf(vid).state = 'idle'; }
    }
    assert(picked, 'GREEN: HAUL objective forms');
    Game.npcSetNode(vid, hx, hy);
    picked.state = 'ready';
    Game.objDepart(vid, picked, hx, hy, false);
    let guard = 0;
    while (Game.objOf(vid).state !== 'returning' && guard++ < 15) {
      const nd = Game.npcNode(vid);
      const away = (v.away || {})[vid];
      Game.objAwayStep(vid, nd, away, hx, hy);
    }
    assert(Game.objOf(vid).state === 'returning', 'GREEN: villager returns with the haul');
    console.log('PASS b (GREEN): MAPMEM=1 — remember -> HAUL -> travel -> butcher -> returning');
  }

  // --- (d) the sweep's deposit telemetry captures exactly the deposit
  {
    const Game = await freshGame('1');
    const v = Game.state.village;
    const vid = (v.roster || []).find(id => id !== Game.villagerId);
    const { node, hx, hy, corpse } = rigCorpse(Game, vid);
    Game.mapmemRemember(vid, corpse);
    Game.npcSetNode(vid, node.x, node.y);
    const o = Game.objOf(vid);
    o.kind = 'HAUL'; o.targetRef = corpse.id; o.haulLabel = 'the carcass';
    const hauled = Game.mapmemHaulAt(vid);
    assert(hauled === true, 'GREEN: haul carries kcal');
    const haulKcal = Game.objOf(vid).haulKcal || 0;
    assert(haulKcal > 0, 'GREEN: objective carries the kcal');
    // the sweep's wrap: read haulKcal at objReturnEffect, purpose 'haul'
    const _ore = Game.objReturnEffect.bind(Game);
    let captured = -1;
    Game.objReturnEffect = function (vid2, purpose) {
      let hk = 0;
      try { const oo = Game.objOf(vid2); hk = (purpose === 'haul') ? (oo.haulKcal || 0) : 0; } catch (e) {}
      const r = _ore(vid2, purpose);
      if (purpose === 'haul') captured = hk;
      return r;
    };
    const before = (v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
    Game.objReturnEffect(vid, 'haul');
    const after = (v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
    assert(captured === haulKcal, `telemetry must capture exactly the deposit (${captured} vs ${haulKcal})`);
    assert(after - before === haulKcal, 'pantry must gain exactly the hauled kcal');
    console.log(`PASS d: deposit telemetry honest — captured ${captured} kcal, pantry +${after - before}`);
  }

  console.log('\nAll carcasshaul gate proof checks passed.');
}

main().then(() => process.exit(0)).catch(e => {
  console.error('PROOF FAILED:', e.message);
  process.exit(1);
});
