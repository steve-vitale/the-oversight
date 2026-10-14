#!/usr/bin/env node
// Probe: deterministic whiff geometry — player pinned at grid edge (8,2),
// Focus Group lead 2x2 anchored at (6,1) (can't close further), player
// strikes weakest (eye-heads -> interception, 0 dmg). Deliberation (self-
// centered r1, anchor-centered) must miss forever. WHIFFGUARD=0.
'use strict';
process.env.WHIFFGUARD = '0';
const { loadGame, setupGame, quietLog } = require('./sim-harness');

function giveWeapon(Game, itemId) {
  const s = Game.state.scholar;
  const def = Game.data.items.find(i => i.id === itemId);
  s.inventory = s.inventory || [];
  s.inventory.push({ itemId, name: def.name, units: 1 });
  s.equipped = s.equipped || {};
  s.equipped.weapon = { itemId, name: def.name };
}

(async () => {
  const { Game } = await loadGame({ seed: 44, mode: 'whiff-probe' });
  await setupGame(Game);
  const s = Game.state.scholar;
  s.health = 100;
  giveWeapon(Game, 'fire_hardened_spear');
  try {
    for (const rid of Object.keys((Game.state.village || {}).positions || {})) {
      Game.state.village.positions[rid] = { mx: 0, my: 0 };
    }
  } catch (e) {}
  Game.dayPart = 3;
  Game.genDetail = function () { return Array.from({ length: 9 }, () => Array(9).fill('grass')); };
  s.mx = 8; s.my = 2;
  s.monster = { id: 'focus_group', mx: 6, my: 1 };
  await quietLog(async () => { Game.startCombat('focus_group'); });
  const p0 = Game.tbFighter('p');
  if (p0) { p0.mx = 8; p0.my = 2; p0.hp = 100; p0.maxHp = 100; }
  const lead = Game.tbfight.fighters.find(x => x.kind === 'monster' && x.mdef && x.mdef.id === 'focus_group');
  if (lead) { lead.mx = 6; lead.my = 1; }
  const leadHp0 = Math.round(lead.hp);
  const pHp0 = Math.round(p0.hp);
  let iters = 0, maxRound = 0;
  let dmgToLead = 0, dmgToPlayer = 0;
  const origDmg = Game.tbDamage.bind(Game);
  Game.tbDamage = function (tk, dmg) {
    const r = origDmg.apply(this, arguments);
    try { if (r > 0) { if (tk === 'p') dmgToPlayer += r; else { dmgToLead += r; if (dmgToLead < 30) console.error("DMG-LEAD r=" + r + " src=" + sl + " round=" + (Game.tbfight?Game.tbfight.round:"?")); } } } catch (e) {}
    return r;
  };
  await quietLog(async () => {
    while (Game.tbfight && !Game.tbfight.over && iters++ < 200000) {
      const cur = Game.tbCurrent();
      if (!cur) break;
      if (cur.kind === 'player') {
        // strike weakest (the competent policy's targeting)
        const f = Game.tbfight;
        const alive = f.fighters.filter(x => x.kind === 'monster' && (x.hp || 0) > 0 && !x.fled);
        alive.sort((a, b) => (a.hp || 0) - (b.hp || 0));
        try { Game.tbPlayerStrike(alive[0].key); } catch (e) {}
        if (Game.tbfight && !Game.tbfight.over && Game.tbIsPlayerTurn()) {
          try { const p = Game.tbFighter('p'); p.moveLeft = 0; p.acted = true; Game.tbAfterPlayerAction(); } catch (e) { break; }
        }
      } else { try { Game.tbAdvance(); } catch (e) { break; } }
      const f = Game.tbfight;
      if (!f || f.over) break;
      maxRound = Math.max(maxRound, f.round);
      if (f.round >= 3000) break;
      if (Game.over) break;
    }
  });
  Game.tbDamage = origDmg;
  const f = Game.tbfight;
  console.log(`over=${!f || f.over} maxRound=${maxRound} leadHp=${lead ? Math.round(lead.hp) : '?'} (was ${leadHp0}) playerHp=${p0 ? Math.round(Game.tbFighter('p').hp) : '?'} (was ${pHp0})`);
  console.log(`dmgToLead=${Math.round(dmgToLead)} dmgToPlayer=${Math.round(dmgToPlayer)} leadPos=${lead ? lead.mx + ',' + lead.my : '?'}`);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
