#!/usr/bin/env node
// sim-parity-20261014.js — before/after measurement for player/villager
// parity (one XP scale, villagers choosing like players, the mantle keeping
// the new bearer's own build, villager gear).
//
// One seed per process (AGENTS.md: never two harnesses in one process):
//   SEED=7 DAYS=150 POLICY=capable node scripts/sim-parity-20261014.js
// prints one JSON line (RESULT {...}). Reads only fields both the old and the
// new code keep (telemetry track_level, village maps, person.equipped), so the
// same file measures before and after. Writes nothing into the repo.
'use strict';
// sweep-compare keeps the phone's 300-event telemetry ring, so count the
// events we need live: wrap Game.tele before sweep-compare binds loadGame.
const harness = require('./sim-harness');
const COUNTS = { playerLevelUps: 0, villagerLevelUps: 0, villagerSeeks: 0, villagerSheetsKept: 0, villagerSheetsSwapped: 0, villagerSheetsPicked: 0, villagersLeveled: new Set() };
const GEAR = { sum: 0, armed: 0, n: 0 };
const _loadGame = harness.loadGame;
harness.loadGame = async function (opts) {
  const r = await _loadGame.apply(this, arguments);
  const G = r.Game;
  const _tele = G.tele;
  G.tele = function (type, data) {
    try {
      const d = data || {};
      if (type === 'track_level') {
        if (d.who === 'player') COUNTS.playerLevelUps++;
        else { COUNTS.villagerLevelUps++; COUNTS.villagersLeveled.add(d.who); }
      } else if (type === 'villager_seek_knowledge') COUNTS.villagerSeeks++;
      else if (type === 'villager_level_up') {
        if (d.kept) COUNTS.villagerSheetsKept++;
        else if (d.replaced) COUNTS.villagerSheetsSwapped++;
        else COUNTS.villagerSheetsPicked++;
      }
    } catch (e) { console.warn('[sim-parity] count', e.message); }
    return _tele.apply(this, arguments);
  };
  // villager gear, sampled at every day's end (most villages are gone by the
  // last day, so an end-of-run read would be mostly zeros)
  const _endDay = G.endDay;
  G.endDay = function () {
    try { const g = gearSample(G); if (g) { GEAR.sum += g.mean; GEAR.armed += g.armed; GEAR.n++; } } catch (e) { console.warn('[sim-parity] gear', e.message); }
    return _endDay.apply(this, arguments);
  };
  return r;
};
const { runComparison } = require('./sweep-compare');

function gearOf(Game, vid) {
  const S = globalThis.Scattering || {};
  const eq = S.equipment;
  const p = Game.getPerson ? Game.getPerson(vid) : null;
  if (!p || !eq) return 0;
  let w = 0, a = 0;
  try { w = eq.weaponBonusOf(p, Game.data.items) || 0; } catch (e) { w = 0; }
  try { a = eq.armorOf(p, Game.data.items) || 0; } catch (e) { a = 0; }
  return w + a;
}

function gearSample(Game) {
  const v = Game.state.village || {};
  let living = 0, gear = 0, armed = 0;
  for (const vid of (v.roster || [])) {
    if (vid === Game.villagerId) continue;
    const p = Game.getPerson ? Game.getPerson(vid) : null;
    if (!p || p.dead) continue;
    living++;
    const g = gearOf(Game, vid);
    gear += g;
    if (g > 0) armed++;
  }
  return living ? { mean: gear / living, armed: armed / living } : null;
}

function metrics(Game) {
  const out = {};
  for (const k of Object.keys(COUNTS)) out[k] = k === 'villagersLeveled' ? COUNTS[k].size : COUNTS[k];
  out.villagerGearDaily = GEAR.n ? +(GEAR.sum / GEAR.n).toFixed(2) : 0;
  out.villagerArmedDaily = GEAR.n ? +(GEAR.armed / GEAR.n).toFixed(2) : 0;
  const v = Game.state.village || {};
  let living = 0, gear = 0, armed = 0;
  for (const vid of (v.roster || [])) {
    if (vid === Game.villagerId) continue;
    let dead = false;
    try { const p = Game.getPerson(vid); dead = !!(p && p.dead); } catch (e) { dead = false; }
    if (dead) continue;
    living++;
    const g = gearOf(Game, vid);
    gear += g;
    if (g > 0) armed++;
  }
  out.villagerLiving = living;
  out.villagerGearMean = living ? +(gear / living).toFixed(2) : 0;
  out.villagerGeared = living ? +(armed / living).toFixed(2) : 0;
  let held = 0;
  for (const vid of Object.keys(v.npcAbilities || {})) held += (v.npcAbilities[vid] || []).length;
  out.villagerAbilitiesHeld = held;
  let vGods = 0;
  for (const vid of Object.keys(v.npcGodhood || {})) vGods += Object.keys(((v.npcGodhood[vid] || {}).recognized) || {}).length;
  out.villagerGodhoods = vGods;
  out.mantles = (v.mantleOf || []).length;
  return out;
}

(async () => {
  const seed = parseInt(process.env.SEED || '7', 10);
  const rep = await runComparison({
    label: 'parity',
    seeds: [seed],
    policies: [process.env.POLICY || 'capable'],
    days: parseInt(process.env.DAYS || '150', 10),
    extraMetrics: (Game) => metrics(Game),
  });
  const r = rep.runs[0];
  console.log('RESULT ' + JSON.stringify({ seed, days: r.days, end: r.endReason, won: r.won, table: r.table, entered: r.entered, extra: r.extra }));
})().catch(e => { console.error('FATAL', e); process.exit(1); });
