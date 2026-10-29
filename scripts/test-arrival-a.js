#!/usr/bin/env node
// scripts/test-arrival-a.js — gaps-grudge EMPTY-TILE ARRIVAL diag probe
// (no src/js changes, no judged sim run). Questions from returns-a /
// funnel-a: what does a HUNT arrival actually do in code, what signal
// (if any) exists at the tile, what the villager does afterwards, and
// which departure gates DELAY a pick vs DESTROY it.
//   (1) EMPTY arrival: hunter steps onto the remembered tile, quarry
//       gone -> memory spent, NO say line, objective stays 'out'
//       (the trip is not closed by the empty arrival).
//   (2) PRESENT arrival: same beast on the tile -> memory KEPT.
//   (3) DIFFERENT-BEAST arrival: another beast on the tile -> memory
//       still spent (the id-mismatch branch), even though a beast IS
//       there.
//   (4) DEPARTURE GATES: danger 'ask'/'tighten' CONVERT a ready HUNT
//       to HAVEN_CHORE (pick destroyed, not delayed); a heal-gate
//       sat-out day and a sick day LEAVE the ready HUNT untouched
//       (pick delayed, not destroyed).
//   (5) WANDER: wanderWorldMonsters moves a beast 35%/tick; empirical
//       stay rate over 1000 ticks + the 0.65^k still-there table.
//   (6) NEEDS AT ARRIVAL: hunger +3 / energy -4 per away part, no
//       need re-check anywhere on the trip.
// Usage: node scripts/test-arrival-a.js
// Exits 0 with ARRIVAL-DIAG PASS when all shape assertions hold.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

function kitVillagers(G, vids) {
  const KIT = [['torso', 'hide_armor', 'Hide Armor'], ['head', 'skull_helm', 'Skull Helm'],
    ['legs', 'canvas_pants', 'Canvas Pants'], ['hands', 'work_gloves', 'Work Gloves'],
    ['feet', 'good_boots', 'Good Boots']];
  for (const vid of vids) {
    const vp = (G.data.villagers || []).find(x => x.id === vid) ||
               (G.data.background_survivors || []).find(x => x.id === vid);
    if (vp) {
      vp.items = ['hunting_spear', 'skull_helm', 'hide_armor', 'canvas_pants', 'work_gloves', 'good_boots'];
      vp.equipped = { melee: { itemId: 'hunting_spear', name: 'Hunting Spear' } };
      for (const [slot, iid, name] of KIT) vp.equipped[slot] = { itemId: iid, name };
    }
  }
  const vv = G.state.village || (G.state.village = {});
  vv.health = vv.health || {};
  for (const vid of vids) vv.health[vid] = 100;
}

async function fresh(narration) {
  const { Game: G, loadFails } = await loadGame({ seed: 75106, mode: 'arrival-a', fullTelemetry: false, narration: !!narration });
  if (loadFails.length) throw new Error('loadFails: ' + loadFails.join('; '));
  await setupGame(G);
  const v = G.state.village || {};
  const hx = (v.px != null) ? v.px : 4, hy = (v.py != null) ? v.py : 4;
  const roster = (v.roster || []).filter(id => id && id !== G.villagerId);
  if (!roster.length) throw new Error('no roster villagers');
  return { G, v, hx, hy, roster };
}

// First roster villager who can be offered a HUNT to (hx+1, hy).
function findHunter(G, v, hx, hy) {
  const tx = hx + 1, ty = hy;
  for (const vid of (v.roster || []).filter(id => id && id !== G.villagerId)) {
    kitVillagers(G, [vid]);
    const noted = G.objNoteMonsterSighting ? G.objNoteMonsterSighting(vid, 'influencer', tx, ty) : null;
    if (!noted) continue;
    const cand = G.objHuntCandidate ? G.objHuntCandidate(vid, hx, hy) : null;
    if (cand) return { vid, tx, ty, cand };
  }
  return null;
}

function sightingsOf(G, vid) {
  try { return (((G.state || {}).village || {}).monsterSightings || {})[vid] || []; } catch (e) { return []; }
}

function huntObjective(G, vid, hx, hy, site) {
  const o = G.objOf(vid);
  // objPick sets o.kind = chosen.kind BEFORE calling objHuntFromSite
  // (which sets purpose/state/tx/ty/clock but NOT kind); the arrival
  // block keys on o.kind === 'HUNT', so a fixture-built objective must
  // set kind exactly as objPick does, or the block silently skips.
  o.kind = 'HUNT';
  G.objHuntFromSite(vid, hx, hy, o, site);
  return o;
}

// Drive objAwayStep until an arrival-block step fires (post-step node
// == target, which is exactly the block's own condition) or max steps.
// Returns { steps, needsAtArrival, partsLeftAtArrival }.
function stepToTarget(G, vid, hx, hy, tx, ty, maxSteps) {
  const v = G.state.village || {};
  const away = (v.away || {})[vid];
  let steps = 0, needsAtArrival = null, partsLeftAtArrival = null;
  while (steps < maxSteps) {
    const before = G.npcNode(vid);
    G.objAwayStep(vid, before, away, hx, hy);
    steps++;
    const after = G.npcNode(vid);
    if (after.nx === tx && after.ny === ty) {
      needsAtArrival = JSON.parse(JSON.stringify(G.npcNeeds(vid)));
      partsLeftAtArrival = (G.objOf(vid) || {}).partsLeft;
      break;
    }
  }
  return { steps, needsAtArrival, partsLeftAtArrival };
}

function captureEmit(G, fn) {
  const lines = [];
  const orig = G.emit;
  G.emit = function (text, surface) {
    try { lines.push(String(text)); } catch (e) {}
    return orig.apply(this, arguments);
  };
  try { fn(); } finally { G.emit = orig; }
  return lines;
}

async function main() {
  const fail = (msg) => { console.log('ARRIVAL-DIAG FAIL: ' + msg); process.exit(1); };

  // ---- Case 1: EMPTY arrival ----
  {
    const { G, v, hx, hy } = await fresh(true);
    G.state.worldMonsters = [];
    const h = findHunter(G, v, hx, hy);
    if (!h) fail('case1: no HUNT candidate villager');
    const memDay = (G.state.scholar || {}).day || 0;
    const o = huntObjective(G, h.vid, hx, hy, { mid: 'influencer', tx: h.tx, ty: h.ty, day: memDay });
    const needsBefore = JSON.parse(JSON.stringify(G.npcNeeds(h.vid)));
    const depLines = captureEmit(G, () => G.objDepart(h.vid, o, hx, hy, true));
    const away = (v.away || {})[h.vid];
    if (!away) fail('case1: objDepart did not set away entry');
    const nodeAfterDep = G.npcNode(h.vid);
    const duration = away.duration;
    const partsLeftAtDepart = o.partsLeft;
    let stepRes = null;
    const stepLines = captureEmit(G, () => { stepRes = stepToTarget(G, h.vid, hx, hy, h.tx, h.ty, 20); });
    const memAfter = sightingsOf(G, h.vid);
    const memSpent = !memAfter.some(s => s.mid === 'influencer' && s.tx === h.tx && s.ty === h.ty);
    const objAfter = G.objOf(h.vid);
    const needsAfter = G.npcNeeds(h.vid);
    console.log(`CASE1 EMPTY: hunter=${h.vid} target=(${h.tx},${h.ty}) nodeAfterDepart=(${nodeAfterDep.nx},${nodeAfterDep.ny}) duration=${duration} partsLeftAtDepart=${partsLeftAtDepart} arrivalSteps=${stepRes ? stepRes.steps : null} partsLeftAtArrival=${stepRes ? stepRes.partsLeftAtArrival : null}`);
    console.log(`  departure lines: ${JSON.stringify(depLines)}`);
    console.log(`  arrival-step lines (must contain NO empty-arrival beat): ${JSON.stringify(stepLines)}`);
    console.log(`  memorySpent=${memSpent} sightingsAfter=${JSON.stringify(memAfter)} objectiveStateAfter=${objAfter.state} (must stay 'out')`);
    console.log(`  needs depart=${JSON.stringify({ hunger: needsBefore.hunger, energy: needsBefore.energy })} arrival=${JSON.stringify({ hunger: needsAfter.hunger, energy: needsAfter.energy })} (walk charge is +3 hunger / -4 energy per away part)`);
    if (!memSpent) fail('case1: empty arrival did not spend the memory');
    if (objAfter.state !== 'out') fail('case1: empty arrival changed objective state (expected still out)');
    if (stepLines.some(l => /gone|empty|nothing|no sign|vanished|left/i.test(l))) fail('case1: an empty-arrival line exists — contradicts the silent-arrival reading');
    if (nodeAfterDep.nx !== h.tx || nodeAfterDep.ny !== h.ty) fail('case1: objDepart did not place the hunter on the target tile');
  }

  // ---- Case 2: PRESENT arrival (memory kept) ----
  {
    const { G, v, hx, hy } = await fresh(true);
    const h = findHunter(G, v, hx, hy);
    if (!h) fail('case2: no HUNT candidate villager');
    G.state.worldMonsters = [{ id: 'influencer', tx: h.tx, ty: h.ty, mx: 0, my: 0, hp: 900, maxHp: 900 }];
    const memDay = (G.state.scholar || {}).day || 0;
    const o = huntObjective(G, h.vid, hx, hy, { mid: 'influencer', tx: h.tx, ty: h.ty, day: memDay });
    G.objDepart(h.vid, o, hx, hy, false);
    G.objAwayStep(h.vid, G.npcNode(h.vid), (v.away || {})[h.vid], hx, hy);
    const memAfter = sightingsOf(G, h.vid);
    const kept = memAfter.some(s => s.mid === 'influencer' && s.tx === h.tx && s.ty === h.ty);
    console.log(`CASE2 PRESENT: memoryKept=${kept} sightingsAfter=${JSON.stringify(memAfter)}`);
    if (!kept) fail('case2: present arrival spent the memory (expected kept)');
  }

  // ---- Case 3: DIFFERENT-BEAST arrival (memory spent anyway) ----
  {
    const { G, v, hx, hy } = await fresh(true);
    const h = findHunter(G, v, hx, hy);
    if (!h) fail('case3: no HUNT candidate villager');
    G.state.worldMonsters = [{ id: 'gallowdeer', tx: h.tx, ty: h.ty, mx: 0, my: 0, hp: 100, maxHp: 100 }];
    const memDay = (G.state.scholar || {}).day || 0;
    const o = huntObjective(G, h.vid, hx, hy, { mid: 'influencer', tx: h.tx, ty: h.ty, day: memDay });
    G.objDepart(h.vid, o, hx, hy, false);
    G.objAwayStep(h.vid, G.npcNode(h.vid), (v.away || {})[h.vid], hx, hy);
    const memAfter = sightingsOf(G, h.vid);
    const spent = !memAfter.some(s => s.mid === 'influencer' && s.tx === h.tx && s.ty === h.ty);
    console.log(`CASE3 DIFFERENT-BEAST: memorySpent=${spent} (id-mismatch branch spends even though a beast IS on the tile)`);
    if (!spent) fail('case3: different-beast arrival kept the memory (expected spent)');
  }

  // ---- Case 4: departure gates — danger KILLS, heal/sick DELAY ----
  {
    const { G, v, hx, hy } = await fresh(true);
    const h = findHunter(G, v, hx, hy);
    if (!h) fail('case4: no HUNT candidate villager');
    const day = (G.state.scholar || {}).day || 0;
    const memDay = day;
    // 4a TIGHTEN: gossip attacks (cap 4) + rain (+1) = 5 -> 'tighten'.
    v.gossip = v.gossip || [];
    for (let i = 0; i < 3; i++) v.gossip.push({ action: 'attack', day });
    G.state.weather = 'rain';
    const dg = G.objDanger(h.vid, h.tx, h.ty, hx, hy);
    let o = huntObjective(G, h.vid, hx, hy, { mid: 'influencer', tx: h.tx, ty: h.ty, day: memDay });
    G.objMaybeDepart(h.vid, G.npcNode(h.vid), true, hx, hy);
    o = G.objOf(h.vid);
    console.log(`CASE4a DANGER: verdict=${dg.verdict} score=${dg.score} objectiveAfter=${o.kind}/${o.state} indoor=${!!o.indoor} (HUNT must be CONVERTED to HAVEN_CHORE, not delayed)`);
    if (o.kind !== 'HAVEN_CHORE') fail('case4a: danger verdict did not convert the HUNT pick (expected HAVEN_CHORE)');
    // 4b HEAL sat-out day: hurtGate satOut blocks objMaybeDepart, pick survives.
    v.gossip = [];
    G.state.weather = 'clear';
    o = huntObjective(G, h.vid, hx, hy, { mid: 'influencer', tx: h.tx, ty: h.ty, day: memDay });
    v.hurtGate = v.hurtGate || {};
    v.hurtGate[h.vid] = { day, satOut: true };
    delete (v.away || {})[h.vid];
    G.objMaybeDepart(h.vid, G.npcNode(h.vid), true, hx, hy);
    o = G.objOf(h.vid);
    const awayAfterHeal = (v.away || {})[h.vid];
    console.log(`CASE4b HEAL-SATOUT: objectiveAfter=${o.kind}/${o.state} away=${!!awayAfterHeal} (ready HUNT must SURVIVE a sat-out day)`);
    if (o.kind !== 'HUNT' || o.state !== 'ready' || awayAfterHeal) fail('case4b: sat-out day destroyed or departed the HUNT pick (expected ready + still home)');
    // 4c SICK day: same survival.
    delete v.hurtGate[h.vid];
    o = huntObjective(G, h.vid, hx, hy, { mid: 'influencer', tx: h.tx, ty: h.ty, day: memDay });
    v.sick = v.sick || {};
    v.sick[h.vid] = true;
    G.objMaybeDepart(h.vid, G.npcNode(h.vid), true, hx, hy);
    o = G.objOf(h.vid);
    const awayAfterSick = (v.away || {})[h.vid];
    console.log(`CASE4c SICK: objectiveAfter=${o.kind}/${o.state} away=${!!awayAfterSick} (ready HUNT must SURVIVE a sick day)`);
    if (o.kind !== 'HUNT' || o.state !== 'ready' || awayAfterSick) fail('case4c: sick day destroyed or departed the HUNT pick');
    // 4d: what the heal check itself does to a hurt villager in this fixture (reported, not asserted).
    delete v.sick[h.vid];
    v.health[h.vid] = 40;
    let stashMed = null;
    try { const st = G.stashState ? G.stashState() : null; stashMed = st ? st.medicine : null; if (Array.isArray(stashMed)) stashMed.length = 0; } catch (e) {}
    const healer = (() => { try { return G.campHealerId ? G.campHealerId('haven') : null; } catch (e) { return null; } })();
    const satOut = G.villagerHealCheck ? G.villagerHealCheck(h.vid, 'Someone', {}) : null;
    console.log(`CASE4d HEAL-CHECK: hp=40 medicineEmptied=${Array.isArray(stashMed)} healer=${healer} satOut=${satOut} (true = rests today, pick delayed; false = patched or walked out hurt)`);
  }

  // ---- Case 5: wander rate ----
  {
    const { G } = await fresh(false);
    G.state.worldMonsters = [];
    const m = { id: 'influencer', tx: 6, ty: 5, mx: 0, my: 0, hp: 900, maxHp: 900 };
    G.state.worldMonsters.push(m);
    let stays = 0;
    const N = 1000;
    for (let i = 0; i < N; i++) {
      m.tx = 6; m.ty = 5;
      G.wanderWorldMonsters();
      if (m.tx === 6 && m.ty === 5) stays++;
    }
    console.log(`CASE5 WANDER: stays=${stays}/${N} (${(100 * stays / N).toFixed(1)}%; code rate is 35% move/tick, so ~65% stay when all 4 neighbours are valid)`);
    if (stays < 580 || stays > 720) fail('case5: wander stay rate outside 58-72% (expected ~65%)');
    const table = [1, 2, 4, 8, 16, 32].map(k => `k=${k}: ${(100 * Math.pow(0.65, k)).toFixed(2)}%`).join('  ');
    console.log(`  P(beast still on the remembered tile after k worldTicks) = 0.65^k (upper bound — blocked/edge moves only raise it): ${table}`);
    console.log('  NOTE: worldTicks run ONLY on player tile entry (checkEncounter -> worldTick), NOT once per day-part. So "days since the fight" is the wrong clock: the beast\'s move count is the player-bot\'s step count.');
  }

  console.log('ARRIVAL-DIAG PASS — empty arrival silent + memory spent; present arrival keeps memory; different-beast arrival spends; danger converts, heal/sick delay; wander 35%/player-step-tick');
}
main().catch(e => { console.error('ARRIVAL-DIAG FAIL', e && e.stack || e); process.exit(1); });
