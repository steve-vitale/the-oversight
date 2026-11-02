#!/usr/bin/env node
// audit-tbprobe-20261101.js — one-off probe: can the SCHOLAR use a
// combat activatable (bird_strike.call) inside a tb fight, and what does
// it change? Usage: node scripts/audit-tbprobe-20261101.js <with|without>
// NOT a verdict script.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');
(async () => {
  const arm = process.argv[2] || 'with';
  const { Game } = await loadGame({ seed: 9201 });
  await setupGame(Game);
  try { Game.state.scholar.day = 120; } catch (e) { console.warn('[audit] day set:', e && e.message); }
  try { if (typeof Game.pantryAdd === 'function') Game.pantryAdd(200000, 'tb probe top-up'); } catch (e) { console.warn('[audit] pantry:', e && e.message); }
  const s = Game.state.scholar;
  s.integration = 80;
  if (arm === 'with') s.abilities = [{ id: 'bird_strike', level: 1, xp: 0 }];
  else s.abilities = [];
  const says = [];
  const origSay = Game.say ? Game.say.bind(Game) : null;
  Game.say = function (m) { says.push(String(m)); try { return origSay ? origSay.apply(this, arguments) : undefined; } catch (e) { console.warn('[audit] say:', e && e.message); } };
  // lib.js fight() pattern, solo.
  if (Game.tbfight && !Game.tbfight.over) { try { Game.tbEnd('fled'); } catch (e) { Game.tbfight = null; } }
  Game.state.village.roster = [];
  const vpos = Game.state.village.positions || {};
  for (const k of Object.keys(vpos)) vpos[k] = { mx: 8, my: 8 };
  s.mx = 5; s.my = 4;
  if (Game.ensureVillagerPositions) Game.ensureVillagerPositions();
  s.monster = { id: 'bulldozer', mx: 6, my: 4 };
  Game.startCombat('bulldozer');
  const mf = Game.tbfight && Game.tbfight.fighters.find(f => f.kind === 'monster');
  if (mf) { mf.mx = 6; mf.my = 4; }
  const pf = Game.tbFighter && Game.tbFighter('p');
  if (pf) { pf.mx = 5; pf.my = 4; }
  if (!Game.tbfight) { console.log('NO TBFIGHT STARTED'); process.exit(1); }
  console.log('tbfight fighters:', JSON.stringify(Game.tbfight.fighters.map(f => ({ key: f.key, kind: f.kind, hp: f.hp, maxHp: f.maxHp }))));
  let useRet = null, useErr = null;
  if (arm === 'with' && mf) {
    try { useRet = Game.useAbility('bird_strike', 'call', mf.key); } catch (e) { useErr = e.message; }
    console.log('useAbility ret:', JSON.stringify(useRet), 'err:', useErr);
    try { Game.tbPlayerWait(); } catch (e) { console.log('wait err:', e.message); }
  }
  for (let r = 1; r <= 4; r++) {
    if (Game.tbfight.over) break;
    try { Game.tbPlayerStrike(mf.key); } catch (e) { console.log('strike err:', e.message); break; }
    const m2 = Game.tbfight.fighters.find(f => f.kind === 'monster');
    const p2 = Game.tbfight.fighters.find(f => f.kind === 'player');
    console.log(`after strike ${r}: monster hp=${m2 ? m2.hp : '?'} player hp=${p2 ? p2.hp : '?'} over=${!!Game.tbfight.over} says-tail=${JSON.stringify(says.slice(-2))}`);
    if (Game.tbfight.over) break;
    try { Game.tbPlayerWait(); } catch (e) { console.log('wait err:', e.message); }
  }
  console.log('bird lines:', JSON.stringify(says.filter(l => /bird|blind/i.test(l))));
})().catch(e => { console.error('TB PROBE FAIL', e && e.stack || e); process.exit(1); });
