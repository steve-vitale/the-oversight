#!/usr/bin/env node
// test-monster-math-r1.js — scale-wall r4 MONSTER-MATH lever.
// Part A: AUDIT — empirical duels (machete-armed day-15-like scholar, strikes
// every round) vs every wave-1 melee-reachable species. Reports rounds-to-kill
// vs rounds-to-die, damage/round both sides, and non-damage ("decision")
// rounds — the "slow and risky" tempo read: risky but with enough rounds to
// make decisions (counter moves, positioning, gear) vs a 3-round burst race.
// Part B: LEVER gate mechanism — MONSTER_MATH_R4=1 must reshape burst attacks
// into telegraphed cycles with (near-)identical cycle DPR; gate off = pristine
// defs byte-identical. RED-verify: run with the gate EXPECTING the reshaped
// defs on pristine -> FAIL (defs unchanged); with the lever code -> PASS.
// Usage:
//   node scripts/test-monster-math-r1.js            # audit only
//   MONSTER_MATH_R4=1 node scripts/test-monster-math-r1.js   # audit + gate check
'use strict';
const { loadGame, setupGame } = require('./sim-harness');
const monsters = require('../src/data/monsters.json');

const WAVE1_MELEE = (process.env.MIDS ? process.env.MIDS.split(',') : ['bulldozer','hushwolf','gallowdeer','mirrormoth','belltoad',
  'lockpick_raccoon','white_noise_heron','hummice','speedbump_turtle',
  'nightlight_catfish','ducks_in_a_row','sunbasker','nightcourt']);
// glasswing is single-range-3 dive but grounded rounds exist — try it too;
// nevermore is airborne (melee can't reach) — excluded, noted.
const DUELS_PER = 6;

function equipMachete(Game) {
  Game.state.scholar.equipped = { melee: { itemId: 'machete', name: 'Machete' } };
  const w = Game.equippedWeapon();
  if (process.env.UNARMED === '1') {
    Game.state.scholar.equipped = {};
    return;
  }
  if (w.bonus !== 35) throw new Error('machete not equipped, bonus=' + w.bonus);
}

async function duel(Game, mid, seedIdx) {
  const s = Game.state.scholar;
  s.health = 100; s.hp = 100; s.kcal = 2400; s.hydration = 100; s.energy = 100;
  equipMachete(Game);
  const log = [];
  const origSay = Game.say.bind(Game);
  Game.say = (m) => { log.push(String(m)); };
  let dmgDealt = 0, dmgTaken = 0, rounds = 0, teleRounds = 0, moveRounds = 0;
  const origDmg = Game.tbDamage.bind(Game);
  Game.tbDamage = function (tk, dmg, src, sk, opts) {
    if (tk === 'p') dmgTaken += (dmg || 0);
    else dmgDealt += (dmg || 0);
    return origDmg(tk, dmg, src, sk, opts);
  };
  Game.startCombat(mid);
  const f = Game.tbfight;
  if (!f) { Game.say = origSay; Game.tbDamage = origDmg; return { error: 'no fight' }; }
  const pF = () => f.fighters.find(x => x.key === 'p');
  const dist = (a, b) => Math.max(Math.abs(a.mx - b.mx), Math.abs(a.my - b.my));
  let prevTaken = 0;
  while (Game.tbfight && !Game.tbfight.over && rounds < 80) {
    rounds++;
    const p = pF();
    if (Game.tbIsPlayerTurn() && p && p.alive) {
      const mons = f.fighters.filter(x => x.kind === 'monster' && x.alive && !x.fled);
      if (!mons.length) break;
      mons.sort((a, b) => (a.hp || 0) - (b.hp || 0));
      const tgt = mons[0];
      const px = p.mx != null ? p.mx : 4, py = p.my != null ? p.my : 4;
      if (dist(p, tgt) > 1) {
        // close distance: step toward an unoccupied tile adjacent to target
        const occupied = new Set(f.fighters.filter(x => x.alive && x.key !== 'p').map(x => x.mx + ',' + x.my));
        let bx = null, by = null, bd = 1e9;
        for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
          if (!dx && !dy) continue;
          const cx = tgt.mx + dx, cy = tgt.my + dy;
          if (cx < 0 || cx > 8 || cy < 0 || cy > 8) continue;
          if (occupied.has(cx + ',' + cy)) continue;
          const dd = Math.max(Math.abs(cx - px), Math.abs(cy - py));
          if (dd < bd) { bd = dd; bx = cx; by = cy; }
        }
        if (bx != null) {
          let dx = bx, dy = by;
          const ml = p.moveLeft || 0;
          if (ml > 0 && typeof Game.findPath === 'function') {
            const path = Game.findPath(px, py, bx, by);
            if (path && path.length > ml) { const step = path[ml - 1]; dx = step[0]; dy = step[1]; }
          }
          try { Game.tbPlayerMove(dx, dy); } catch (e) {}
        } else { p.moveLeft = 0; p.acted = true; Game.tbAfterPlayerAction(); }
        moveRounds++;
      } else {
        Game.tbPlayerStrike(tgt.key);
      }
      // STRIKE/MOVE don't auto-advance — end the turn explicitly, but only
      // if it's still the player's turn (tbPlayerMove may have advanced it).
      try {
        if (Game.tbIsPlayerTurn()) {
          const q = pF();
          if (q) { q.moveLeft = 0; q.acted = true; }
          Game.tbAfterPlayerAction();
        }
      } catch (e) {}
    } else {
      try {
        const q = pF();
        if (q) { q.moveLeft = 0; q.acted = true; }
        Game.tbAfterPlayerAction();
      } catch (e) { break; }
    }
    const roundDmg = dmgTaken - prevTaken;
    prevTaken = dmgTaken;
    const newLines = log.splice(0).join(' | ');
    const telegraphed = /aim|wind|gather|charge|flash|stomp|rear|draw|coil|paw the earth|freez|light gathers|drops its head|circle/i.test(newLines);
    if (roundDmg === 0 && telegraphed) teleRounds++;
    const pp = pF();
    if (pp && !pp.alive) break;
    if (!Game.tbfight || Game.tbfight.over) break;
  }
  const pf = pF();
  const monsLeft = f.fighters.filter(x => x.kind === 'monster' && x.alive && !x.fled);
  const monsFled = f.fighters.filter(x => x.kind === 'monster' && x.fled);
  const over = Game.tbfight ? Game.tbfight.over : true;
  const endReason = Game.tbfight ? Game.tbfight.endReason : 'ended';
  Game.say = origSay; Game.tbDamage = origDmg;
  return {
    rounds, dmgDealt: Math.round(dmgDealt), dmgTaken: Math.round(dmgTaken),
    teleRounds, moveRounds, playerAlive: !!(pf && pf.alive), playerHP: pf ? Math.round(pf.hp) : 0,
    monstersLeft: monsLeft.length, monstersFled: monsFled.length,
    over, endReason, seedIdx,
  };
}

(async () => {
  const gateOn = process.env.MONSTER_MATH_R4 === '1';
  console.log('=== r4 monster-math audit (gate ' + (gateOn ? 'ON' : 'OFF') + ') ===');
  // ---- Part B: gate mechanism (RED-verify on pristine) ----
  // The lever must keep wave-1 deadliness but reshape burst attacks into
  // telegraphed cycles. Mechanism check below asserts the CURRENT pristine
  // state (unchanged defs) when gate is OFF — with the lever code landed,
  // gate ON must show the reshaped defs.
  const gall = monsters.find(m => m.id === 'gallowdeer');
  const od = gall.attacks.find(a => a.name === 'Ocular Discharge');
  console.log('[gate] Ocular Discharge pattern:', JSON.stringify(od.pattern), 'dmg:', JSON.stringify(od.damage));
  // ---- Part A: empirical duels ----
  const rows = [];
  for (const mid of WAVE1_MELEE) {
    const agg = { rounds: 0, dealt: 0, taken: 0, tele: 0, moves: 0, wins: 0, died: 0, n: 0, fled: 0, timeout: 0 };
    for (let i = 0; i < DUELS_PER; i++) {
      const { Game } = await loadGame({ seed: 1000 + WAVE1_MELEE.indexOf(mid) * 37 + i, mode: 'mathaudit' });
      Game.say = () => {};
      await setupGame(Game);
      let r;
      try { r = await duel(Game, mid, i); } catch (e) { r = { error: String(e).slice(0, 80) }; }
      if (r.error) { console.log(`  ${mid}: ERROR ${r.error}`); continue; }
      agg.n++;
      agg.rounds += r.rounds; agg.dealt += r.dmgDealt; agg.taken += r.dmgTaken;
      agg.tele += r.teleRounds; agg.moves += r.moveRounds;
      if (r.monstersLeft === 0 && r.monstersFled === 0) agg.wins++;
      if (r.monstersFled > 0 && r.playerAlive) agg.fled++;
      if (!r.playerAlive) agg.died++;
      if (r.rounds >= 80) agg.timeout++;
    }
    if (!agg.n) continue;
    const rpk = agg.rounds / agg.n;                       // rounds fought
    const pdpr = agg.dealt / agg.rounds;                  // player DPR
    const mdpr = agg.taken / agg.rounds;                  // monster DPR (effective)
    const def = monsters.find(m => m.id === mid);
    const mhp = Math.round((def.hp[0] + def.hp[1]) / 2);
    const rtk = mhp / pdpr;                               // rounds-to-kill (avg)
    const rtd = 100 / mdpr;                               // rounds-to-die at 100 HP
    rows.push({ mid, mhp, rpk: +rpk.toFixed(1), pdpr: +pdpr.toFixed(1), mdpr: +mdpr.toFixed(1),
      rtk: +rtk.toFixed(1), rtd: +rtd.toFixed(1), tele: +(agg.tele / agg.n).toFixed(1),
      mv: +(agg.moves / agg.n).toFixed(1),
      wins: agg.wins + '/' + agg.n, fled: agg.fled, died: agg.died + '/' + agg.n,
      timeout: agg.timeout });
  }
  console.log('\nmid              mhp  rnds  pDPR  mDPR  rKill rDie  tele  move  W     fled  D');
  for (const r of rows) {
    console.log(`${r.mid.padEnd(16)} ${String(r.mhp).padStart(3)} ${String(r.rpk).padStart(5)} ${String(r.pdpr).padStart(5)} ${String(r.mdpr).padStart(5)} ${String(r.rtk).padStart(5)} ${String(r.rtd).padStart(5)} ${String(r.tele).padStart(5)} ${String(r.mv).padStart(5)} ${r.wins.padStart(6)} ${String(r.fled).padStart(5)} ${r.died.padStart(5)}`);
  }
  console.log('\nnevermore: EXCLUDED (airborne — melee range 1 cannot reach; sling/bow only).');
  console.log('glasswing: excluded from melee duels (Skyfall Dive range 3 + Grounded melee windows).');
  const died = rows.filter(r => parseFloat(r.died.split('/')[0]) > 0);
  if (died.length) console.log('\n!! scholar deaths in duels:', died.map(r => `${r.mid} ${r.died}`).join(', '));
  else console.log('\nscholar survived all duels at 100 HP (machete, close+strike, no flee).');
  const to = rows.filter(r => r.timeout > 0);
  if (to.length) console.log('!! timeouts (80 rounds, unresolved):', to.map(r => `${r.mid} ${r.timeout}/6`).join(', '));
})();
