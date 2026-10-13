#!/usr/bin/env node
// dump-fight-r4.js — one full say-transcript duel for SENSE-TESTING (r4).
// Usage: node scripts/dump-fight-r4.js <monsterId> <seed>
'use strict';
const { loadGame, setupGame } = require('./sim-harness');
(async () => {
  const mid = process.argv[2] || 'gallowdeer';
  const seed = parseInt(process.argv[3] || '1000', 10);
  const { loadGame: lg, setupGame: sg } = require('./sim-harness');
  const { Game } = await lg({ seed, mode: 'r4dump' });
  await sg(Game);
  const s = Game.state.scholar;
  s.health = 100; s.hp = 100; s.kcal = 2400; s.hydration = 100; s.energy = 100;
  Game.state.scholar.equipped = { melee: { itemId: 'machete', name: 'Machete' } };
  const lines = [];
  Game.say = (m) => lines.push(String(m));
  let taken = 0, dealt = 0;
  const origDmg = Game.tbDamage.bind(Game);
  Game.tbDamage = function (tk, dmg, src, sk, opts) {
    if (tk === 'p') { taken += dmg || 0; }
    else { dealt += dmg || 0; }
    return origDmg(tk, dmg, src, sk, opts);
  };
  Game.startCombat(mid);
  const f = Game.tbfight;
  const pF = () => f.fighters.find(x => x.key === 'p');
  const dist = (a, b) => Math.max(Math.abs(a.mx - b.mx), Math.abs(a.my - b.my));
  let rounds = 0, prevTaken = 0;
  while (Game.tbfight && !Game.tbfight.over && rounds < 30) {
    rounds++;
    const p = pF();
    console.log(`\n--- round ${rounds} (player ${Math.round(p ? p.hp : 0)} HP, dealt ${Math.round(dealt)}, taken ${Math.round(taken)}) ---`);
    if (Game.tbIsPlayerTurn() && p && p.alive) {
      const mons = f.fighters.filter(x => x.kind === 'monster' && x.alive && !x.fled);
      if (!mons.length) break;
      mons.sort((a, b) => (a.hp || 0) - (b.hp || 0));
      const tgt = mons[0];
      console.log(`  monster ${tgt.monsterId} hp=${Math.round(tgt.hp)} pos=(${tgt.mx},${tgt.my}) player=(${p.mx},${p.my}) dist=${dist(p, tgt)}`);
      if (dist(p, tgt) > 1) {
        const occupied = new Set(f.fighters.filter(x => x.alive && x.key !== 'p').map(x => x.mx + ',' + x.my));
        let bx = null, by = null, bd = 1e9;
        for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
          if (!dx && !dy) continue;
          const cx = tgt.mx + dx, cy = tgt.my + dy;
          if (cx < 0 || cx > 8 || cy < 0 || cy > 8) continue;
          if (occupied.has(cx + ',' + cy)) continue;
          const dd = Math.max(Math.abs(cx - p.mx), Math.abs(cy - p.my));
          if (dd < bd) { bd = dd; bx = cx; by = cy; }
        }
        if (bx != null) { try { Game.tbPlayerMove(bx, by); } catch (e) { console.log('  move err', e.message); } }
      } else {
        Game.tbPlayerStrike(tgt.key);
      }
      try { if (Game.tbIsPlayerTurn()) { const q = pF(); if (q) { q.moveLeft = 0; q.acted = true; } Game.tbAfterPlayerAction(); } } catch (e) {}
    } else {
      try { const q = pF(); if (q) { q.moveLeft = 0; q.acted = true; } Game.tbAfterPlayerAction(); } catch (e) { break; }
    }
    const newLines = lines.splice(0);
    for (const l of newLines.slice(0, 14)) console.log('  | ' + l.slice(0, 160));
    if (newLines.length > 14) console.log(`  | ... (${newLines.length - 14} more lines)`);
    const pp = pF();
    if (pp && !pp.alive) { console.log('  ** PLAYER DOWN **'); break; }
    if (!Game.tbfight || Game.tbfight.over) break;
  }
  const pf = pF();
  const monsLeft = f.fighters.filter(x => x.kind === 'monster' && x.alive && !x.fled);
  console.log(`\nEND: playerAlive=${!!(pf && pf.alive)} hp=${pf ? Math.round(pf.hp) : '?'} monstersLeft=${monsLeft.length} dealt=${Math.round(dealt)} taken=${Math.round(taken)} over=${Game.tbfight ? Game.tbfight.over : 'cleared'} reason=${Game.tbfight ? Game.tbfight.endReason : '-'}`);
})();
