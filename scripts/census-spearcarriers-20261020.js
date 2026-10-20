#!/usr/bin/env node
// scripts/census-spearcarriers-20261020.js — day-0/30 census: do any villagers
// carry hunting_spears (equipped/carried/stashed), and does the village
// ever hold one? Informs the spearfund channel choice (corpse-loot vs
// contest vs borrow).
//
// Usage: node scripts/census-spearcarriers-20261020.js
//   SEEDS="64001,64002" DAYS=30 node scripts/census-spearcarriers-20261020.js
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadcourt } = require('./policies/leadcourt');

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10))
  : [64001, 64002, 64003, 64004]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '30', 10);

function carriers(Game) {
  const out = [];
  try {
    const v = Game.state.village || {};
    for (const rid of (v.roster || [])) {
      const p = Game.getPerson ? Game.getPerson(rid) : null;
      if (!p || p.dead) continue;
      const hits = [];
      for (const k of Object.keys(p.equipped || {})) {
        const it = p.equipped[k];
        if (it && (it.itemId === 'hunting_spear' || it.id === 'hunting_spear')) hits.push('eq:' + k);
      }
      for (const it of (p.items || [])) { const id = (it && (it.itemId || it.id)) || it; if (id === 'hunting_spear') hits.push('carried'); }
      for (const it of (p.stashed || [])) { const id = (it && (it.itemId || it.id)) || it; if (id === 'hunting_spear') hits.push('stashed'); }
      // any weapon at all (for context)
      const wnames = [];
      for (const k of Object.keys(p.equipped || {})) {
        const it = p.equipped[k], id = it && (it.itemId || it.id);
        const def = (Game.data.items || []).find(d => d.id === id);
        if (def && def.class === 'weapon') wnames.push(id + '@' + k);
      }
      if (hits.length || wnames.length) out.push({ vid: rid, spear: hits, weapons: wnames });
    }
  } catch (e) {}
  return out;
}
function hunterGuides(Game) {
  const out = [];
  try {
    const v = Game.state.village || {};
    for (const rid of (v.roster || [])) {
      const p = Game.getPerson ? Game.getPerson(rid) : null;
      if (!p || p.dead) continue;
      const occ = (p.formerOccupation || p.occupation || '').toLowerCase();
      if (/hunt/.test(occ)) out.push({ vid: rid, occ: p.formerOccupation || p.occupation });
    }
  } catch (e) {}
  return out;
}

(async () => {
  for (const seed of SEEDS) {
    const { Game } = await loadGame({ seed, mode: 'spear-census' });
    await setupGame(Game);
    const d0 = { hunters: hunterGuides(Game), carriers: carriers(Game) };
    await runDays(Game, leadcourt, { days: DAYS, sampleEvery: 30 });
    const dN = { hunters: hunterGuides(Game), carriers: carriers(Game) };
    console.log(`[s${seed}] d0 hunters=${JSON.stringify(d0.hunters.map(h => h.occ))} carriers=${JSON.stringify(d0.carriers)}`);
    console.log(`[s${seed}] d${DAYS} hunters=${dN.hunters.length} carriers=${JSON.stringify(dN.carriers)}`);
  }
})().catch(e => { console.error('CENSUS FAIL', e); process.exit(2); });
