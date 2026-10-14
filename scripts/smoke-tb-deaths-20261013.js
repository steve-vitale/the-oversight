#!/usr/bin/env node
// smoke-tb-deaths-20261013.js — Stage-0 smoke for the combat-survival fixes.
// Player (unkillable) + 2 villagers (brave/helpful) vs a gavel pack, full
// turn loop, seeds 7/42/99. Primary metric: villager deaths per fight.
// Audit baseline (pre-fix): 11/80 dead (14%) vs gavel.
// Usage: SEED=7 N=40 MON=gavel node scripts/smoke-tb-deaths-20261013.js
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame } = require('./sim-harness');
const SEED = parseInt(process.env.SEED || '7', 10);
const N = parseInt(process.env.N || '40', 10);
const MON = process.env.MON || 'gavel';

(async () => {
  const { Game } = await loadGame({ seed: SEED, mode: 'tb-deaths-smoke' });
  await setupGame(Game, 'Columbus, Ohio');
  Game.say = () => {};
  const monsters = require('fs').readFileSync(ROOT + '/src/data/monsters.json', 'utf8');
  const mdef = JSON.parse(monsters).find(m => m.id === MON);
  if (!mdef) throw new Error('no mdef ' + MON);
  const C = globalThis.Scattering.combat;
  let deaths = 0, fled = 0, fights = 0;
  for (let i = 0; i < N; i++) {
    const vids = (Game.state.village.roster || []).filter(r => r !== Game.villagerId).slice(0, 2);
    if (vids.length < 2) break;
    const fighters = [
      { key: 'p', kind: 'player', mx: 4, my: 4, hp: 10000, maxHp: 10000, alive: true, speed: 3, moveLeft: 3, acted: false },
    ];
    vids.forEach((vid, j) => {
      fighters.push({
        key: 'v' + j, kind: 'villager', villagerId: vid, name: 'V' + j,
        mx: 2 + j, my: 5 - j, hp: 100, maxHp: 100, alive: true, speed: 3, moveLeft: 3, acted: false,
        ai: j === 0 ? 'brave' : 'helpful', wbonus: 0, fled: false,
      });
    });
    const packN = mdef.pack || 1;
    for (let k = 0; k < packN; k++) {
      const hp = Math.round((mdef.hp[0] + mdef.hp[1]) / 2);
      fighters.push({
        key: 'm' + k, kind: 'monster', monsterId: mdef.id, mdef, name: mdef.name,
        mx: 6, my: 3 + k, hp, maxHp: hp, alive: true, speed: mdef.speed || 3,
        moveLeft: 3, acted: false, fled: false, telegraph: null, stunned: 0, hesitate: 0,
      });
    }
    Game.tbfight = { id: 'smoke' + i, fighters, order: fighters.map(f => f.key), turnIdx: -1, round: 1, over: false };
    // Drive the fight the way the game does: tbAdvance() is the turn pump —
    // it executes every non-player turn itself and stops at the player's.
    // The harness only plays the player (strike nearest, end turn).
    Game.tbAdvance();
    let guard = 0;
    // 15-round cap: matches the audit probe's effective horizon (~60
    // fighter-turns / 4 fighters). Longer fights inflate exposure.
    while (Game.tbfight && !Game.tbfight.over && Game.tbfight.round <= 15 && guard++ < 300) {
      const f = Game.tbfight;
      const cur = f.fighters[f.order[f.turnIdx]];
      if (!cur || cur.kind !== 'player') { Game.tbAdvance(); continue; }
      if (cur.acted) { Game.tbAdvance(); continue; }
      try {
        const foe = C.nearestEnemy(f.fighters, cur);
        if (foe) Game.tbPlayerStrike(foe.f.key);
      } catch (e) {}
      if (Game.tbfight && !Game.tbfight.over) { cur.moveLeft = 0; cur.acted = true; Game.tbAfterPlayerAction(); }
    }
    fights++;
    for (const vf of fighters.filter(x => x.kind === 'villager')) {
      if (!vf.alive) deaths++;
      else if (vf.fled) fled++;
    }
    Game.tbfight = null;
  }
  console.log(JSON.stringify({ seed: SEED, mon: MON, fights, deaths, fled,
    deathRate: fights ? +(deaths / (fights * 2)).toFixed(4) : null }));
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });
