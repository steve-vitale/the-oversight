// Shared 99767-shape state builder for the pellet-pass proof + panel.
// (evidence/2026-11-07/sim-pelletpass-prereg.md, amendment A1.)
//
// The 99767 shape: day 181, strong village, bearer pellet-fed, every deed
// done EXCEPT the food deed the pellet blocks (no feast can carry the surge
// while the reactor is online). Constructed directly — SIMULATING.md: pin
// state, don't hunt for a seed that reaches it.
//
// buildShape(Game, {fed}) -> { roster, scholar, pg, village }
//   fed:false — 6 villagers at hunger 95..90, the rest at 30 (hungry village)
//   fed:true  — every villager at hunger 20 (fed village control)
// Pantry is stocked generously (60x500 kcal cooked meat): the hunger stamp
// is the test input, and a stocked pantry keeps the famine/scattering clock
// out of the way. nationalLive is set here but endDay's hierarchy tick
// recomputes it from real links (a constructed state has none) — callers
// that read the seat AFTER endDay ticks must re-assert it.
'use strict';

function buildShape(G, opts) {
  opts = opts || {};
  G.state.systemArrived = true;
  const s = G.state.scholar;
  s.day = 181;
  s.integration = 80; // stage 3
  s.kcal = 2000; s.hydration = 80; s.health = 100;
  s.fusionReactor = { installed: true, online: true };
  s.abilities = s.abilities || [];
  if (!s.abilities.some(a => ((a && a.id) || a) === 'fusion_reactor')) s.abilities.push({ id: 'fusion_reactor' });
  G.state.fusionReactorHolder = { who: 'player', vid: G.villagerId, day: 150 };
  G.state.nationalLive = true;
  const pg = G.progState();
  pg.crises = { 'first-grave': 1, 'hunger-winter': 1, 'first-raid': 1 };
  pg.sentimentTaught = true;
  s.prog = s.prog || {};
  s.prog.feastSurge = 1.5; // armed devotion, waiting for a feast that can carry it
  s.prog.feastSurgeUsed = false;
  const d = G.deedState();
  d.contestsSurvived = 3;
  d.wavesFaced = { a: 1, b: 1, c: 1, e: 1, f: 1, g: 2, h: 2, i: 2, j: 2, k: 2, l: 3, m: 3, n: 3, o: 3, p: 4, q: 4, r: 4, s: 5, t: 5, u: 5 };
  const v = G.state.village;
  v.pantry = [{ itemId: 'cooked_meat', name: 'Cooked meat', units: 60, kcalEach: 500, foodState: 'cooked', foodKind: 'meat' }];
  const roster = (v.roster || []).filter(id => id !== G.villagerId);
  roster.forEach((vid, i) => {
    const n = G.npcNeeds(vid);
    n.hunger = opts.fed ? 20 : (i < 6 ? (95 - i) : 30);
    n.fear = 10; n.social = 40; n.energy = 70;
  });
  return { roster, scholar: s, pg, village: v };
}

module.exports = { buildShape, driveSpend };

// driveSpend(Game) — fight one real monster and land a feasted blow.
// Moves adjacent when out of range (tbPlayerMove), strikes when in range.
// The fighter is given 500 HP: this proves the SPEND mechanic (a landed
// feasted blow marks feastSurgeUsed), not the scholar's survivability —
// a day-181 scholar would carry real gear, and the fixture scholar does
// not. Returns true when prog.feastSurgeUsed becomes true.
function driveSpend(G) {
  const K = require('../godpath/lib');
  K.fight(G, 'hushwolf', { party: true, hp: 500 });
  for (let i = 0; i < 80; i++) {
    if (!G.tbfight || G.tbfight.over || G.over) break;
    if (((G.state.scholar || {}).prog || {}).feastSurgeUsed) break;
    try {
      if (G.tbIsPlayerTurn && G.tbIsPlayerTurn()) {
        const p = G.tbFighter('p');
        const mf = G.tbfight.fighters.find(f => (f.kind === 'monster' || f.kind === 'hostile') && f.alive && !f.fled);
        if (!mf || !p) { if (G.tbPlayerWait) G.tbPlayerWait(); continue; }
        const dist = Math.abs(p.mx - mf.mx) + Math.abs(p.my - mf.my);
        if (dist > 1) {
          // Step to the monster-adjacent tile closest to the player.
          const cands = [[mf.mx - 1, mf.my], [mf.mx + 1, mf.my], [mf.mx, mf.my - 1], [mf.mx, mf.my + 1]];
          let best = null, bestD = Infinity;
          for (const [cx, cy] of cands) {
            const dd = Math.abs(p.mx - cx) + Math.abs(p.my - cy);
            if (dd < bestD) { bestD = dd; best = [cx, cy]; }
          }
          const moved = best ? G.tbPlayerMove(best[0], best[1]) : false;
          if (!moved) { if (G.tbPlayerWait) G.tbPlayerWait(); continue; }
          const p2 = G.tbFighter('p');
          if (Math.abs(p2.mx - mf.mx) + Math.abs(p2.my - mf.my) <= 1) G.tbPlayerStrike(mf.key || 'm_0');
          else if (G.tbPlayerWait) G.tbPlayerWait();
        } else {
          G.tbPlayerStrike(mf.key || 'm_0');
        }
        // NOTE: no tbAdvance() after a strike or a wait — both advance the
        // round themselves; an extra advance would skip the player's turn.
      } else if (G.tbAdvance) G.tbAdvance();
    } catch (e) { break; }
  }
  try { if (G.tbfight && !G.tbfight.over) G.tbEnd('fled'); } catch (e) {}
  return !!(((G.state.scholar || {}).prog || {}).feastSurgeUsed);
}
