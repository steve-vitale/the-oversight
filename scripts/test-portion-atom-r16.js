#!/usr/bin/env node
// PROOF (journey establishment r16, 2026-10-18): the pantry atom law — no
// unit over 500 kcal — must hold on every meat path.
//
// RED (pre-fix): three paths mint >500 atoms.
//   (a) carcassToMeat (food.js): units = round(net/500) — net=560 -> 1 unit
//       of 560. (r15 guardrail trip: a 560 "Unknown flesh" atom.)
//   (b) specialist butcher (food.js): same round() chunking.
//   (c) mapmemButcherForCarry (villager-mapmem.js): uunits = round(unet/500)
//       — gross=1400 monster carcass -> unet=700 -> 1 unit; the later
//       markMonsterFoodSafe reveal computes per = round(gross*0.40/1) = 560.
//   (d) markMonsterFoodSafe reveal (game.js): per = round(gross*0.40/rUnits)
//       with no 500 cap — any hauled single-unit flesh with gross in
//       1251..1749 mints a >500 atom.
// GREEN (post-fix): ceil() chunking everywhere + the reveal widens portions
// when net/1unit > 500 (cleaned-state only; carcass keeps its assumed-4).
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

async function main() {
  const { Game } = await loadGame({ seed: 7, mode: 'mvc', fullTelemetry: true });
  await setupGame(Game);
  const fails = [];
  const ok = (cond, label) => { console.log((cond ? 'PASS' : 'FAIL') + ' ' + label); if (!cond) fails.push(label); };

  // (a) carcassToMeat: gross 1400, yield 0.4 -> net 560 must chunk to 2x280
  {
    const inv = [{ hiddenKcal: 1867, plantId: 'meat_deer', foodKind: 'meat', foodState: 'carcass', kg: 30, units: 1, name: 'deer carcass', how: 'knife' }];
    Game.carcassToMeat(inv, 0, true);
    const it = inv[0];
    const atom = it.kcalEach || 0;
    ok(atom <= 500, `(a) carcassToMeat atom ${atom} <= 500 (RED: 560)`);
    ok((it.kcalEach || 0) * (it.units || 1) === 560, `(a) total preserved: ${(it.kcalEach||0)*(it.units||1)} == 560`);
  }

  // (b) specialist butcher (askSpecialist 'butcher' on a carcass) — same ceil law.
  // Grant a living villager a butcher occupation for the test.
  {
    let spec = null;
    try {
      const me = (() => { try { return Game.villagerId; } catch (e) { return null; } })();
      const cand = ((Game.state.village || {}).roster || []).find(id => {
        if (id === me) return false;
        try { return !(Game.getPerson(id) || {}).dead; } catch (e) { return false; }
      });
      if (cand) {
        // villagePeople reads rosterChars first (rc || getPerson) — set it there;
        // specialistsHere also requires the villager at the player's node.
        const rc = ((Game.state.village || {}).rosterChars || {})[cand];
        if (rc) rc.formerOccupation = 'hunter';
        else { const p = Game.getPerson(cand); if (p) p.formerOccupation = 'hunter'; }
        try { Game.npcSetNode(cand, Game.map.px, Game.map.py); } catch (e) { /* test-only */ }
      }
      spec = (Game.specialistsHere ? Game.specialistsHere('butcher') : [])[0] || null;
    } catch (e) { /* test-only */ }
    if (!spec) { console.log('SKIP (b): no butcher specialist could be staged'); }
    else {
      const inv = [{ hiddenKcal: 1400, plantId: 'meat_deer', foodKind: 'meat', foodState: 'carcass', kg: 30, units: 1, name: 'deer carcass', how: 'trapped' }];
      const os = Game.say; Game.say = () => {};
      try { Game.askSpecialist(spec.id, 0, inv, 'butcher'); } catch (e) { ok(false, '(b) threw: ' + e.message); }
      Game.say = os;
      const it = inv[0];
      const atom = (it && it.kcalEach) || 0;
      // specialist yield 44% (skill 3, no xp): net 616 -> must chunk; atom <= 500
      ok(atom <= 500, `(b) specialist butcher atom ${atom} <= 500 (RED: 616 as 1u)`);
    }
  }

  // (c) mapmemButcherForCarry: monster carcass gross 1400 -> unet 700 -> must chunk
  {
    const corpse = { kind: 'monster', items: [{ foodKind: 'meat', foodState: 'carcass', plantId: 'meat_highbeam_deer', hiddenKcal: 1400, kg: 40, units: 1 }] };
    let out = null;
    try { out = Game.mapmemButcherForCarry('player', corpse); } catch (e) { ok(false, '(c) threw: ' + e.message); }
    const unk = (out && out.unknown && out.unknown[0]) || null;
    ok(!!unk, '(c) unknown flesh produced');
    if (unk) ok((unk.units || 1) >= 2, `(c) hauled unknown chunks to ${(unk.units||1)}u (RED: 1u -> reveal 560)`);
  }

  // (d) markMonsterFoodSafe reveal: planted single-unit unknown flesh, gross 1400
  {
    const vv = Game.state.village; vv.pantry = vv.pantry || [];
    vv.pantry.push({ name: 'Unknown flesh', foodKind: 'meat', foodState: 'cleaned', plantId: 'meat_highbeam_deer', edible: false, kcalEach: 0, hiddenKcal: 1400, units: 1, unit: 'portion', kg: 5 });
    try { Game.markMonsterFoodSafe('highbeam_deer', 'tested'); } catch (e) { ok(false, '(d) threw: ' + e.message); }
    const it = vv.pantry.find(p => p.plantId === 'meat_highbeam_deer');
    const atom = (it && it.kcalEach) || 0;
    ok(atom <= 500, `(d) reveal atom ${atom} <= 500 (RED: 560)`);
    ok(!!(it && it.edible), '(d) revealed item is edible');
    if (it) vv.pantry.splice(vv.pantry.indexOf(it), 1);
  }

  // (e) boundary: net exactly 500 stays 1 unit; net 501 -> 2 units
  {
    const inv = [{ hiddenKcal: 1667, plantId: 'meat_deer', foodKind: 'meat', foodState: 'carcass', kg: 30, units: 1, name: 'deer carcass', how: 'knife' }];
    Game.carcassToMeat(inv, 0, true); // yield 0.4 -> 500
    ok(inv[0].units === 1 && inv[0].kcalEach === 500, `(e) net=500 stays 1x500 (got ${inv[0].units}x${inv[0].kcalEach})`);
    const inv2 = [{ hiddenKcal: 1670, plantId: 'meat_deer', foodKind: 'meat', foodState: 'carcass', kg: 30, units: 1, name: 'deer carcass', how: 'knife' }];
    Game.carcassToMeat(inv2, 0, true); // yield 0.4 -> 501
    ok((inv2[0].units || 1) === 2, `(e) net=501 chunks to 2u (got ${inv2[0].units}u)`);
  }

  console.log(fails.length ? `\n${fails.length} FAILURES` : '\nALL GREEN');
  process.exit(fails.length ? 1 : 0);
}

main().catch(e => { console.error('ERROR', e); process.exit(1); });
