#!/usr/bin/env node
// audit-panel-20261101.js — competent-policy panel instrument for the
// loot/abilities efficacy audit. One seed per process (never two
// harnesses in one process). Usage:
//   node scripts/audit-panel-20261101.js <seed> [days] [outdir]
// Instruments: useAbility wrap, tele wrap (loot_dropped,
// broadcast_item_prize, deaths), 10-day snapshots (abilities,
// activeSynergies, discovered synergies, integration, equipped,
// inventory, pantry). Zero src/js changes.
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

const seed = parseInt(process.argv[2], 10);
const days = parseInt(process.argv[3] || '120', 10);
const outdir = process.argv[4] || 'evidence/2026-11-01/audit-panel-20261101';
if (!seed) { console.error('usage: audit-panel-20261101.js <seed> [days] [outdir]'); process.exit(2); }

function snap(Game) {
  const s = Game.state.scholar || {};
  const v = Game.state.village || {};
  let pantry = null;
  try { pantry = typeof Game.pantryKcal === 'function' ? Game.pantryKcal() : (v.pantry && (v.pantry.kcal ?? null)); } catch (e) { console.warn("[audit] swallowed:", e && e.message); }
  const inv = (s.inventory || []).map(i => ({
    id: i.itemId || i.id, units: i.units || 1,
    hidden: !!i.alienEffectHidden, alien: !!i.alienLoot,
  }));
  const eq = {};
  try {
    for (const [k, val] of Object.entries(s.equipped || {})) eq[k] = (val && (val.itemId || val.id)) || null;
  } catch (e) { console.warn("[audit] swallowed:", e && e.message); }
  const villEq = {};
  try {
    for (const vid of ((v.roster || []).slice(0, 6))) {
      const p = Game.getPerson ? Game.getPerson(vid) : null;
      const rec = (Game.data.villagers || []).find(x => x.id === vid) || {};
      const e = (p && p.equipped) || rec.equipped || {};
      const o = {};
      for (const [k, val] of Object.entries(e || {})) o[k] = (val && (val.itemId || val.id)) || null;
      if (Object.keys(o).length) villEq[vid] = o;
    }
  } catch (e) { console.warn("[audit] swallowed:", e && e.message); }
  return {
    day: s.day || 0,
    alive: !(Game.over),
    abilities: (s.abilities || []).map(a => (a && a.id) || a),
    abilityLevels: (s.abilities || []).map(a => ({ id: (a && a.id) || a, level: (a && a.level) || 1 })),
    activeSynergies: (s.activeSynergies || []).slice(),
    discoveredSynergies: (s.synergies || []).slice(),
    integration: s.integration || 0,
    slots: (typeof Game.abilitySlots === 'function') ? Game.abilitySlots() : null,
    equipped: eq, inventory: inv, villagerEquipped: villEq,
    pantry, population: (v.roster || []).length,
  };
}

(async () => {
  const { Game } = await loadGame({ seed });
  await setupGame(Game);
  const useCounts = {};
  const useRefused = {};
  const teleCounts = {};
  const lootDropped = [];
  const prizes = [];
  const deaths = [];
  const origUse = Game.useAbility ? Game.useAbility.bind(Game) : null;
  if (origUse) {
    Game.useAbility = function (aid, actionId, target) {
      let r;
      try { r = origUse(aid, actionId, target); } catch (e) { useRefused[aid] = (useRefused[aid] || 0) + 1; throw e; }
      const ok = r !== false && r !== null && r !== undefined;
      useCounts[aid] = useCounts[aid] || { calls: 0, ok: 0 };
      useCounts[aid].calls++;
      if (ok) useCounts[aid].ok++;
      return r;
    };
  }
  const origTele = Game.tele ? Game.tele.bind(Game) : null;
  if (origTele) {
    Game.tele = function (type, data) {
      const r = origTele.apply(this, arguments);
      try {
        teleCounts[type] = (teleCounts[type] || 0) + 1;
        if (type === 'loot_dropped') lootDropped.push({ day: (Game.state.scholar || {}).day || 0, id: data && data.id, tier: data && data.tier, to: data && data.to });
        if (type === 'broadcast_item_prize') prizes.push({ day: (Game.state.scholar || {}).day || 0, id: data && data.id, tier: data && data.tier });
        if (type === 'death') deaths.push({ day: (Game.state.scholar || {}).day || 0, who: data && data.who, cause: data && data.cause, player: !!(data && data.player) });
      } catch (e) { console.warn("[audit] swallowed:", e && e.message); }
      return r;
    };
  }
  const policy = Object.assign({ id: 'competent' }, competent);
  const snapshots = [];
  let dayCount = 0;
  const origUpkeep = policy.upkeep;
  policy.upkeep = function (G, ctx) {
    if (origUpkeep) { try { origUpkeep(G, ctx); } catch (e) { console.warn("[audit] swallowed:", e && e.message); } }
    try {
      const d = (G.state.scholar || {}).day || 0;
      dayCount = d;
      if (d % 10 === 0 || d === 1) snapshots.push(snap(G));
    } catch (e) { console.warn("[audit] swallowed:", e && e.message); }
  };
  const result = await runDays(Game, policy, { days, sampleEvery: 10 });
  const final = snap(Game);
  const out = {
    seed, days, endReason: result.endReason, gameDays: result.gameDays,
    useCounts, useRefused, teleCounts, lootDropped, prizes, deaths,
    snapshots, final,
  };
  fs.mkdirSync(path.join(__dirname, '..', outdir), { recursive: true });
  const fp = path.join(__dirname, '..', outdir, `seed-${seed}.json`);
  fs.writeFileSync(fp, JSON.stringify(out, null, 1));
  console.log(`SEED ${seed} end=${result.endReason} days=${result.gameDays} useAbilities=${Object.keys(useCounts).length} lootDropped=${lootDropped.length} prizes=${prizes.length} deaths=${deaths.length} snapshots=${snapshots.length} -> ${fp}`);
})().catch(e => { console.error('PANEL FAIL', e && e.stack || e); process.exit(1); });
