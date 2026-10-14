#!/usr/bin/env node
// sim-unified-tracks-20261014.js — step-7 measurement for the unified track
// system (player and villagers share tracks/thresholds/kits).
//
// One seed per process (AGENTS.md: never two harnesses in one process):
//   SEED=7 DAYS=150 POLICY=capable node scripts/sim-unified-tracks-20261014.js
// prints one JSON line with the standard row + track metrics. Runs fine on
// pre-tracks code too (the villager counts read v.npcXp / v.npcAbilities,
// which both versions keep), so the same file measures before and after.
// Writes nothing into the repo; redirect stdout where you want it.
'use strict';
const { runComparison } = require('./sweep-compare');

function metrics(Game) {
  const out = {};
  const s = Game.state.scholar || {};
  const v = Game.state.village || {};
  const tracks = s.tracks || {};
  let lv = 0;
  for (const t of Object.keys(tracks)) { lv += (tracks[t] && tracks[t].level) || 0; out['p_' + t] = (tracks[t] && tracks[t].level) || 0; out['pxp_' + t] = (tracks[t] && tracks[t].xp) || 0; }
  out.playerLevelUps = lv;
  const st = s.trackStats || {};
  out.sheetsOffered = st.offered || 0;
  out.sheetsPicked = st.picked || 0;
  out.sheetsReplaced = st.replaced || 0;
  out.sheetsKept = st.kept || 0;
  out.levelUpQueued = (s.levelUpQueue || []).length;
  out.playerAbilities = (s.abilities || []).length;
  // villagers: every villager with a record (living or dead) — total grants
  let vGrants = 0, vSkills = 0, vRecs = 0, vHeldLiving = 0, vLiving = 0, vMagicHeld = 0;
  const npcXp = v.npcXp || {};
  for (const vid of Object.keys(npcXp)) {
    vRecs++;
    const g = npcXp[vid].granted || {};
    for (const t of Object.keys(g)) vGrants += g[t] || 0;
  }
  const abilities = (Game.data && Game.data.abilities) || [];
  const lane = (id) => ((abilities.find(a => a.id === id) || {}).lane) || '?';
  for (const vid of (v.roster || [])) {
    if (vid === Game.villagerId) continue;
    let dead = false;
    try { const p = Game.getPerson(vid); dead = !!(p && p.dead); } catch (e) { dead = false; }
    if (dead) continue;
    vLiving++;
    const held = (v.npcAbilities || {})[vid] || [];
    vHeldLiving += held.length;
    vMagicHeld += held.filter(id => lane(id) === 'magic').length;
  }
  for (const vid of Object.keys(v.npcSkills || {})) vSkills += (v.npcSkills[vid] || []).length;
  out.villagerGrantsTotal = vGrants;
  out.villagerRecords = vRecs;
  out.villagerLiving = vLiving;
  out.villagerAbilitiesLiving = vHeldLiving;
  out.villagerMagicLiving = vMagicHeld;
  out.villagerAbilitiesPerLiving = vLiving ? +(vHeldLiving / vLiving).toFixed(2) : 0;
  out.villagerSkillsTotal = vSkills;
  let vGods = 0;
  for (const vid of Object.keys(v.npcGodhood || {})) vGods += Object.keys(((v.npcGodhood[vid] || {}).recognized) || {}).length;
  out.villagerGodhoods = vGods;
  out.playerGodhoods = Object.keys(((s.godhood || {}).recognized) || {}).length;
  out.integration = Math.round(s.integration || 0);
  return out;
}

(async () => {
  const seed = parseInt(process.env.SEED || '7', 10);
  const rep = await runComparison({
    label: 'unified-tracks',
    seeds: [seed],
    policies: [process.env.POLICY || 'capable'],
    days: parseInt(process.env.DAYS || '150', 10),
    extraMetrics: (Game) => metrics(Game),
  });
  const r = rep.runs[0];
  console.log('RESULT ' + JSON.stringify({ seed, days: r.days, end: r.endReason, won: r.won, wave: r.waveReach, arc: r.maxArc, national: r.national, table: r.table, entered: r.entered, extra: r.extra }));
})().catch(e => { console.error('FATAL', e); process.exit(1); });
