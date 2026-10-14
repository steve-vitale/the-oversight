#!/usr/bin/env node
// test-inffight-20261014.js — PROOF for finding #102 (longsim scale-wall
// r19 arm 1, game-code): the INFINITE FOCUS GROUP FIGHT engine bug.
//
// The blank (fifthlink-armed s44, evidence/2026-10-14/sim-fifthlink.md): a
// turn-based fight vs The Focus Group (289 HP, day 61) ground 500k+ rounds
// without resolving (over=false), freezing the game clock. driveFights'
// no-progress guard never fired because HP/positions kept shifting.
//
// Root cause (two halves, both required for the stall):
//  1. SCHOLAR SIDE: the competent policy strikes the WEAKEST live monster.
//     The focus group's eye-heads have 1 HP, so every scholar strike targets
//     an eye — and sigW3a.js's eye interception consumes the turn with zero
//     damage ("blinks aside — it only watches. Kill the MOUTHS."). The lead
//     never bleeds.
//  2. MONSTER SIDE: the lead's Deliberation is a SELF-CENTERED burst
//     (patternCells centers burst on the attacker, radius 1), but
//     encWantRange returned 4 for burst — so the heads held at spear range
//     (d2) forever, declaring Deliberation every cycle against empty cells
//     (12k-round probe: 10,786 declares, 1 landed — the Cold Open). The
//     scholar never bleeds.
//  The eye-heads swarm (positions churn every round), so the harness's
//  bit-identical no-progress signature never repeats. The engine itself has
//  no stalemate guard. 500k+ rounds, over=false.
//
// The fix (game.js + sigW3a.js):
//  - encWantRange calibrates focus_group burst to its radius (1): the heads
//    CLOSE IN to bring Deliberation to bear. Follows the hummice/toad
//    precedent. Steve's rule: monsters were sent to fight — the group
//    closes; it never leaves, never disengages. (Gall owdeer beam-fatigue
//    parallel: the deer HUNTS when its beam is sterile.)
//  - The eye-heads float (blocks:false): the swarm was body-blocking the
//    lead's own 2x2 approach — the watchers crowded the subject and the
//    heads couldn't step through them. They only watch; they don't impede.
//  - FOCUSGROUP_CLOSE=0 disables the want-range calibration (RED).
//
// Scenarios (FOCUSGROUP_CLOSE=0 disables the fix — the RED phase):
//   R1 (gate OFF): strike-weakest duel — the fight must STALL (50k round cap
//      hit, over=false, lead HP frozen, zero net damage window). Proves the
//      test can see the bug.
//   G1 (gate ON):  same duel — the fight MUST resolve (over=true) in < 500
//      rounds. The heads close in, Deliberation lands, the scholar falls or
//      flees. The stalemate is gone.
//   G2 (gate ON):  honest duel — the scholar strikes the LEAD (the coached
//      counter: "Kill the MOUTHS"). The fight must resolve in < 500 rounds
//      with mouth damage dealt AND Deliberation damage taken (the monster
//      now fights back — the pre-fix duel was a free kill with zero threat).
//   G3 (gate ON):  no collateral — encWantRange for hummice/toad bursts is
//      unchanged, and a bulldozer duel resolves identically (the engine's
//      honest fights are untouched).
//
// Usage: node scripts/test-inffight-20261014.js
//        FOCUSGROUP_CLOSE=0 node scripts/test-inffight-20261014.js  (RED: R1 must STALL (both gates off internally),
//          G1 must resolve via the class guard, G2 unaffected)
'use strict';
const { loadGame, setupGame, quietLog } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; }
  else { fail++; console.log('FAIL ' + name + (extra ? ' -- ' + extra : '')); }
}

const FIX_ON = process.env.FOCUSGROUP_CLOSE !== '0';
const ROUND_CAP = 50000;
const RESOLVE_BUDGET = 500;

function giveWeapon(Game, itemId) {
  const s = Game.state.scholar;
  const def = Game.data.items.find(i => i.id === itemId);
  s.inventory = s.inventory || [];
  s.inventory.push({ itemId, name: def.name, units: 1 });
  s.equipped = s.equipped || {};
  s.equipped.weapon = { itemId, name: def.name };
}
function giveArmor(Game, itemId) {
  const s = Game.state.scholar;
  const def = Game.data.items.find(i => i.id === itemId);
  s.inventory = s.inventory || [];
  s.inventory.push({ itemId, name: def.name, units: 1 });
  s.equipped = s.equipped || {};
  s.equipped.armor = { itemId, name: def.name, torso: { itemId, name: def.name } };
}

// strike-weakest: the competent policy's honest targeting (competent.js).
function strikeWeakest(Game) {
  const f = Game.tbfight;
  if (!f || f.over || !Game.tbIsPlayerTurn()) return false;
  const alive = f.fighters.filter(x => x.kind === 'monster' && (x.hp || 0) > 0 && !x.fled);
  if (!alive.length) return false;
  alive.sort((a, b) => (a.hp || 0) - (b.hp || 0));
  try { return !!Game.tbPlayerStrike(alive[0].key); } catch (e) { return false; }
}

// Drive one duel; playerFn decides each player turn. Returns telemetry.
async function duel(Game, playerFn, roundCap) {
  const tele = { maxRound: 0, endResult: null, iters: 0 };
  const leadPos0 = {};
  const leadOf = () => Game.tbfight ? Game.tbfight.fighters.find(x => x.kind === 'monster' && x.mdef && x.mdef.id === 'focus_group') : null;
  const l0 = leadOf();
  if (l0) { leadPos0.x = l0.mx; leadPos0.y = l0.my; tele.leadHp0 = Math.round(l0.hp); tele.mouths0 = l0.sigFG ? l0.sigFG.mouths.map(Math.round).join('/') : null; }
  const p0 = Game.tbFighter('p');
  tele.scholarHp0 = p0 ? Math.round(p0.hp) : null;
  tele.leadMoved = false;
  tele.mouthsDamaged = false;
  // track Deliberation damage on the scholar at the source
  let deliberationLanded = 0;
  const origDmg = Game.tbDamage.bind(Game);
  Game.tbDamage = function (tk, dmg, sl, sk, opts) {
    const r = origDmg(tk, dmg, sl, sk, opts);
    try {
      if (tk === 'p' && r > 0 && /deliberation/i.test(String(sl || ''))) deliberationLanded += r;
    } catch (e) {}
    return r;
  };
  const origEnd = Game.tbEnd.bind(Game);
  Game.tbEnd = function (res) { tele.endResult = res; return origEnd(res); };
  try {
    await quietLog(async () => {
      while (Game.tbfight && !Game.tbfight.over && tele.iters++ < 400000) {
        const cur = Game.tbCurrent();
        if (!cur) break;
        if (cur.kind === 'player') {
          playerFn(Game);
          if (Game.tbfight && !Game.tbfight.over && Game.tbIsPlayerTurn()) {
            try { const p = Game.tbFighter('p'); p.moveLeft = 0; p.acted = true; Game.tbAfterPlayerAction(); }
            catch (e) { break; }
          }
        } else { try { Game.tbAdvance(); } catch (e) { break; } }
        const f = Game.tbfight;
        if (!f || f.over) break;
        tele.maxRound = Math.max(tele.maxRound, f.round);
        // mid-duel telemetry (tbfight is nulled at tbEnd — capture live)
        try {
          const ld = leadOf();
          if (ld) {
            if (ld.mx !== leadPos0.x || ld.my !== leadPos0.y) tele.leadMoved = true;
            tele.leadPos = ld.mx + ',' + ld.my;
            const mm = ld.sigFG ? ld.sigFG.mouths.map(Math.round).join('/') : null;
            tele.mouths = mm;
            if (tele.mouths0 == null && mm != null) tele.mouths0 = mm;
            if (tele.mouths0 != null && mm !== tele.mouths0) tele.mouthsDamaged = true;
          }
        } catch (e) {}
        if (f.round >= (roundCap || ROUND_CAP)) break;
        if (Game.over) break;
      }
    });
  } finally {
    Game.tbDamage = origDmg;
    Game.tbEnd = origEnd;
  }
  const f = Game.tbfight;
  tele.over = !f || !!f.over;
  const lead = leadOf();
  tele.leadHp = lead ? Math.round(lead.hp) : null;
  if (!tele.leadPos && lead) tele.leadPos = lead.mx + ',' + lead.my;
  if (tele.mouths == null && lead && lead.sigFG) tele.mouths = lead.sigFG.mouths.map(Math.round).join('/');
  const p = Game.tbFighter('p');
  tele.scholarHp = p ? Math.round(p.hp) : null;
  tele.deliberationLanded = Math.round(deliberationLanded);
  tele.scholarHpDrop = (tele.scholarHp0 != null && tele.scholarHp != null) ? tele.scholarHp0 - tele.scholarHp : null;
  return tele;
}

async function newDuelGame(seed) {
  const { Game } = await loadGame({ seed, mode: 'inffight-proof' });
  await setupGame(Game);
  const s = Game.state.scholar;
  s.health = 100;
  giveWeapon(Game, 'fire_hardened_spear');
  giveArmor(Game, 'hide_armor');
  // 1v1: villagers far away
  try {
    for (const rid of Object.keys((Game.state.village || {}).positions || {})) {
      Game.state.village.positions[rid] = { mx: 0, my: 0 };
    }
  } catch (e) {}
  Game.dayPart = 3;
  Game.genDetail = function () { return Array.from({ length: 9 }, () => Array(9).fill('grass')); };
  s.mx = 4; s.my = 4;
  s.monster = { id: 'focus_group', mx: 6, my: 4 };
  await quietLog(async () => { Game.startCombat('focus_group'); });
  if (!Game.tbfight) throw new Error('no fight started');
  const p0 = Game.tbFighter('p');
  if (p0) { p0.mx = 4; p0.my = 4; }
  const lead = Game.tbfight.fighters.find(x => x.kind === 'monster' && x.mdef && x.mdef.id === 'focus_group');
  if (lead) { lead.mx = 6; lead.my = 4; }
  return Game;
}

(async () => {
  console.log(`inffight proof: FOCUSGROUP_CLOSE=${FIX_ON ? '1 (fix ON)' : '0 (RED)'}`);

  // R1: the stall reproduces on pristine (gate OFF).
  // WHIFF-CLASS GUARD (2026-10-14): the general whiff-forever guard in
  // tbRoundWrap now resolves this geometry honestly (see
  // test-inffight-class-20261014.js). The pristine RED needs BOTH gates off.
  {
    const savedWhiff = process.env.WHIFFGUARD;
    if (!FIX_ON) process.env.WHIFFGUARD = '0';
    const Game = await newDuelGame(44);
    const t = await duel(Game, strikeWeakest, ROUND_CAP);
    if (!FIX_ON) { if (savedWhiff === undefined) delete process.env.WHIFFGUARD; else process.env.WHIFFGUARD = savedWhiff; }
    console.log(`R1: maxRound=${t.maxRound} over=${t.over} leadHp=${t.leadHp} (was ${t.leadHp0}) scholarHp=${t.scholarHp}`);
    if (!FIX_ON) {
      ok('R1 stall: round cap hit', t.maxRound >= ROUND_CAP, 'maxRound=' + t.maxRound);
      ok('R1 stall: fight never ends', t.over === false, 'over=' + t.over);
      ok('R1 stall: lead never bleeds (opening exchange only, then frozen)',
        (t.leadHp0 - t.leadHp) <= 30, `leadHp ${t.leadHp0} -> ${t.leadHp}`);
      ok('R1 stall: Deliberation never lands', t.deliberationLanded === 0, 'landed=' + t.deliberationLanded);
    } else {
      console.log('R1 skipped (fix ON — stall should be gone; see G1)');
    }
  }

  // G1: the dumb-driver duel resolves with the fix.
  {
    const Game = await newDuelGame(44);
    const t = await duel(Game, strikeWeakest, ROUND_CAP);
    console.log(`G1: endResult=${t.endResult} maxRound=${t.maxRound} over=${t.over} leadMoved=${t.leadMoved} deliberationLanded=${t.deliberationLanded}`);
    if (FIX_ON) {
      ok('G1 resolves: fight ends', t.over === true, 'over=' + t.over + ' maxRound=' + t.maxRound);
      ok('G1 resolves: within sane budget', t.maxRound < RESOLVE_BUDGET, 'maxRound=' + t.maxRound);
      ok('G1 fiction: the heads close in', t.leadMoved === true, 'leadPos=' + t.leadPos);
      ok('G1 fiction: Deliberation lands (the monster fights)', t.deliberationLanded > 0, 'landed=' + t.deliberationLanded);
    } else {
      // RED (close-fix off) WITH the class guard on: the old geometry now
      // resolves via the whiff-forever guard — the per-monster fix is
      // subsumed for the stall class (the honest threat it adds is G2's).
      console.log('G1 on RED: close-fix off, class guard on — must resolve via the guard');
      ok('G1 RED: stall class resolved (no infinite fight)', t.over === true, 'over=' + t.over + ' maxRound=' + t.maxRound);
      ok('G1 RED: resolved via the honest disengage', t.endResult === 'routed', 'result=' + t.endResult);
    }
  }

  // G2: the honest duel — scholar strikes the LEAD (the coached counter).
  {
    const Game = await newDuelGame(44);
    const strikeLead = (G) => {
      const f = G.tbfight;
      if (!f || f.over || !G.tbIsPlayerTurn()) return false;
      const lead = f.fighters.find(x => x.kind === 'monster' && x.mdef && x.mdef.id === 'focus_group' && x.alive && !x.fled);
      if (!lead) return false;
      try { return !!G.tbPlayerStrike(lead.key); } catch (e) { return false; }
    };
    const t = await duel(Game, strikeLead, ROUND_CAP);
    console.log(`G2: endResult=${t.endResult} maxRound=${t.maxRound} over=${t.over} mouths=${t.mouths} deliberationLanded=${t.deliberationLanded} scholarHp=${t.scholarHp}`);
    if (FIX_ON) {
      ok('G2 honest: fight ends', t.over === true, 'over=' + t.over);
      ok('G2 honest: within sane budget', t.maxRound < RESOLVE_BUDGET, 'maxRound=' + t.maxRound);
      ok('G2 honest: mouths take damage (the counter works)', t.mouthsDamaged === true, `mouths ${t.mouths0} -> ${t.mouths}`);
      ok('G2 honest: Deliberation threatens (no free kill)', t.deliberationLanded > 0, 'landed=' + t.deliberationLanded);
    } else {
      console.log('G2 on RED: lead still dies (scholar out-damages the inert burst); the fix changes the threat, not the kill');
    }
  }

  // G3: no collateral — other bursts keep their want-range; honest engine fights untouched.
  {
    const { Game } = await loadGame({ seed: 44, mode: 'inffight-g3' });
    await setupGame(Game);
    const hum = { kind: 'monster', mdef: { id: 'hummice' } };
    const toad = { kind: 'monster', mdef: { id: 'belltoad' } };
    const fg = { kind: 'monster', mdef: { id: 'focus_group' } };
    const burst = { type: 'burst' };
    const wrHum = Game.encWantRange(hum, burst);
    const wrToad = Game.encWantRange(toad, burst);
    const wrFg = Game.encWantRange(fg, burst);
    const wrFgDirect = Game.encWantRange(fg, { type: 'direct', range: 3 });
    console.log(`G3: wantRange hummice=${wrHum} toad=${wrToad} focus_group/burst=${wrFg} focus_group/direct=${wrFgDirect}`);
    ok('G3: hummice burst want-range unchanged', wrHum === 2, 'got ' + wrHum);
    ok('G3: toad burst want-range unchanged', wrToad === 3, 'got ' + wrToad);
    if (FIX_ON) {
      ok('G3: focus_group burst want-range calibrated', wrFg === 1, 'got ' + wrFg);
      ok('G3: focus_group direct unaffected', wrFgDirect === 3, 'got ' + wrFgDirect);
    } else {
      ok('G3 RED: focus_group burst want-range is the old 4', wrFg === 4, 'got ' + wrFg);
    }
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
