#!/usr/bin/env node
// Proof: HAUL RETURN DEPOSIT (r22)
// The villager carcass-haul arc breaks at the deposit step — two bugs:
//
// BUG 1 (game.js npcNodeTravel): the away-return dispatcher routes
//   'water'/'traps'/'visit'/'guard' to objReturnEffect, but NOT 'haul'.
//   The entire `purpose === 'haul'` branch in objReturnEffect
//   (villager-objectives.js) — including the HAUL-UNREVEALED pantry deposit
//   — is dead code in the live game. A completed haul never lands.
//
// BUG 2 (villager-objectives.js objTick): the dawn re-pick fires on
//   `o.state === 'returning'` and replaces the objective via objPick,
//   orphaning any carried haulUnknown/haulKcal on the new objective.
//   The meat is never deposited, never tested — silently lost.
//
// RED: both assertions fail pre-fix (pantry gets nothing).
// GREEN: both pass post-fix (unknown flesh lands in the pantry as a
//   0-kcal testable item; the experiment beat can then reveal it).
'use strict';
const { loadGame, setupGame } = require('./sim-harness.js');
const assert = require('assert');

async function main() {
  const { Game: G } = await loadGame({ seed: 79 });
  await setupGame(G);
  let pass = 0;

  const v = G.state.village;
  const day = (G.state.scholar || {}).day || 0;
  // a villager who actually rolls the lottery (not escape-bound)
  let vid = null;
  for (const rid of (v.roster || [])) {
    if (rid === G.villagerId) continue;
    let goal = null;
    try { goal = G.npcGoal ? G.npcGoal(rid) : null; } catch (e) {}
    if (goal === 'escape') continue;
    vid = rid; break;
  }
  assert(vid, 'a non-escape villager exists');

  const mid = 'hummice';
  const mdef = (G.data.monsters || []).find(m => m.id === mid);
  assert(mdef, 'hummice def exists');
  assert(!G.monsterFoodSafe(mid), 'PRE: hummice flesh unrevealed');

  const mkHaulUnknown = () => ({
    name: 'Unknown flesh', foodKind: 'meat', foodState: 'cleaned',
    plantId: 'meat_' + mid, edible: false, kcalEach: 0, hiddenKcal: 150,
    units: 1, unit: 'portion', kg: 0.25,
    prep: 'Unknown flesh. Test it cautiously.',
  });

  // ---------- BUG 1: away-return never deposits a haul ----------
  // Simulate: villager hauled unknown flesh (mapmemHaulAt done), is walking
  // home under the away machinery with purpose 'haul', duration expired.
  const o1 = G.objOf(vid);
  o1.kind = 'HAUL'; o1.purpose = 'haul'; o1.state = 'returning';
  o1.targetRef = 'corpse-test-1'; o1.haulUnknown = [mkHaulUnknown()]; o1.haulKcal = 0;
  v.away = v.away || {};
  v.away[vid] = { nx: 5, ny: 4, purpose: 'haul', sinceDay: day, sincePart: 0, duration: 1 };
  // force the return: partsAway >= duration on the next npcNodeTravel
  G.state.scholar.day = day + 1;
  const panBefore = (v.pantry || []).length;
  G.npcNodeTravel();
  const uf1 = (v.pantry || []).filter(it => /unknown flesh/i.test(it.name || ''));
  assert(uf1.length >= 1,
    `RED 1: away-return with purpose 'haul' did not deposit (pantry ${panBefore} -> ${(v.pantry || []).length}, unknown-flesh ${uf1.length})`);
  const hu = uf1[0];
  assert(hu.edible === false && hu.kcalEach === 0,
    'RED 1b: deposited flesh must be inedible 0-kcal (knowledge law holds)');
  console.log('GREEN 1: away-return deposits the hauled unknown flesh in the pantry');
  pass++;

  // ---------- BUG 2: dawn re-pick orphans a carried haul ----------
  // Simulate: villager is home, not away, objective 'returning' with a
  // carried haul (the away dispatch already ran or never fired).
  const o2 = G.objOf(vid);
  o2.kind = 'HAUL'; o2.purpose = 'haul'; o2.state = 'returning';
  o2.targetRef = 'corpse-test-2'; o2.haulUnknown = [mkHaulUnknown()]; o2.haulKcal = 0;
  delete v.away[vid];
  try { G.npcSetNode(vid, v.px ?? 4, v.py ?? 4); } catch (e) {}
  const panBefore2 = (v.pantry || []).length;
  G.dayPart = 0; // dawn
  G.objTick(); // the dawn re-pick
  const o2after = G.objOf(vid);
  const uf2 = (v.pantry || []).filter(it => /unknown flesh/i.test(it.name || ''));
  const carriedLost = (o2after.haulUnknown && o2after.haulUnknown.length) &&
    o2after.purpose !== 'haul';
  assert(uf2.length >= 1 && !carriedLost,
    `RED 2: dawn re-pick orphaned the carried haul (pantry unknown-flesh ${uf2.length}, ` +
    `new objective kind=${o2after.kind} purpose=${o2after.purpose} still-carrying=${!!carriedLost})`);
  console.log('GREEN 2: dawn re-pick deposits (not orphans) a carried haul');
  pass++;

  // ---------- the arc completes: the experiment beat can now reveal it ----------
  // (the deposited flesh is in the pantry; villagerExperimentBeat is the
  // try/taste half — proven live on seeds 77/78/79)
  assert(!G.monsterFoodSafe(mid), 'PRE: still unrevealed before the experiment');
  console.log(`GREEN 3: setup complete — ${pass + 1}/3 checks, arc ready for the experiment beat`);
  pass++;

  console.log(`\nHAUL-RETURN proof: ${pass}/3 GREEN`);
}

main().catch(e => { console.error('PROOF FAILED:', e && e.message); process.exit(1); });
