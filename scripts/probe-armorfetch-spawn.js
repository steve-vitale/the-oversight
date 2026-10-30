#!/usr/bin/env node
// probe-armorfetch-spawn.js — SPAWN-ONLY inspection (not a judged leg):
// for each seed, load + setup, print the spawn vessel's stashed armor
// (id, slot via equipment.slotForItem, protection) vs what the scholar
// currently wears in that slot. No policy run, no days advanced.
// Usage: SEEDS=16101,... node scripts/probe-armorfetch-spawn.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');
const SEEDS = (process.env.SEEDS || '16101,16102,16103,16104,16105,16106,16107,16108,16109,16110,16111,16112,16113,16114,16115,16116')
  .split(',').map((s) => parseInt(s.trim(), 10)).filter(Boolean);
(async () => {
  for (const seed of SEEDS) {
    const { Game } = await loadGame({ seed, mode: 'nighttravel-b', fullTelemetry: false });
    await setupGame(Game);
    const vid = Game.villagerId;
    const person = Game.getPerson ? Game.getPerson(vid) : null;
    const sch = (Game.state || {}).scholar || {};
    const defs = Game.data.items || [];
    const defOf = (id) => defs.find((d) => d.id === id) || null;
    const S = (typeof globalThis !== 'undefined' ? globalThis.Scattering : null) || {};
    const slotFor = (def) => {
      try { if (S.equipment && S.equipment.slotForItem) return S.equipment.slotForItem(def); } catch (e) {}
      return null;
    };
    const idOf = (e) => (e && (e.itemId || e.id)) || (typeof e === 'string' ? e : null);
    const worn = {};
    for (const [slot, e] of Object.entries(sch.equipped || {})) {
      const id = idOf(e);
      const def = id && defOf(id);
      worn[slot] = { id, prot: (def && def.armor && def.armor.protection) || 0 };
    }
    const stashedArmor = (person.stashed || []).map(idOf).filter(Boolean)
      .map((id) => {
        const def = defOf(id);
        if (!def || !def.armor) return null;
        const slot = slotFor(def);
        const cur = slot ? worn[slot] : null;
        return { id, slot, prot: def.armor.protection || 0, wornId: cur ? cur.id : null, wornProt: cur ? cur.prot : 0,
          beats: slot ? (def.armor.protection || 0) > (cur ? cur.prot : 0) : false };
      }).filter(Boolean);
    console.log(JSON.stringify({ seed, vid, worn, stashedArmor }));
  }
})().catch((e) => { console.error('PROBE CRASH', e && (e.stack || e)); process.exit(2); });
