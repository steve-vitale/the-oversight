#!/usr/bin/env node
// defcensus-analyze-20261018.js — analyzer for the sim-defercensus2 sweep.
// Reads evidence/2026-10-18/perseed-defercensus2/*.json, applies the
// wave4census-lib-20261017.js attribution, and emits:
//   - binding-bar counts per run (taxonomy: single bar | multi:a+b |
//     none-single | standing | unlocked)
//   - deferral-day anatomy (days in `short` per bar over all deferral days)
//   - medians: max living veterans over the run; armor margin at deferral
//   - armor-source breakdown over deferral-day margin pieces (SECONDARY)
//   - wall numbers (national / table / wave-4 / wins / median survival)
// Usage: node scripts/defcensus-analyze-20261018.js [--json]
'use strict';
const fs = require('fs');
const path = require('path');
const { attributeRun } = require('./wave4census-lib-20261017');

const EVID = path.join(__dirname, '..', 'evidence', '2026-10-18', 'perseed-defercensus2');
const T4 = 100;

// Armor-source channel map, verified on current master (2026-10-18):
// - gen:      take('clothing', 2) in villager gen (game.js:1852) is UNFILTERED
//             — any clothing-class item incl. lootTier-3/4 armor ("trophy
//             spawns"); wild-card (lootTier||1)<=2 pool adds the no-lootTier
//             armor (riot_gear, military_vest, swat_vest, leather_jacket).
// - craft:    recipes.json outputs — bark_armor, padded_cloth, hide_armor
//             (hide_armor = butchering-fed: 2 hides + vine).
// - salvage:  alien_helm/carapace/greaves/gauntlets/boots — alienPlayers.js
//             apOnCombatEnd: kill an alien player, 60% strip their armor.
// - godpath:  capstoneItems (godpaths.json): bloodplate, commanders_coat,
//             farstrider_boots, lifebound_vestments, worldroot_plate.
// - loot:     rollAlienLoot draws origin==='alien' items — NO armor in that
//             pool on current data (verified). Contest prizes use the same
//             pool — also no armor. Monster-loot does NOT feed armor.
// Every clothing-class armor id is gen-reachable; craft/salvage/godpath are
// additional channels. A piece is labeled by its highest-value channel set.
const CRAFT = new Set(['bark_armor', 'padded_cloth', 'hide_armor']);
const SALVAGE = new Set(['alien_helm', 'alien_carapace', 'alien_greaves', 'alien_gauntlets', 'alien_boots']);
const GODPATH = new Set(['bloodplate', 'commanders_coat', 'farstrider_boots', 'lifebound_vestments', 'worldroot_plate']);
function channelsOf(itemId) {
  const ch = ['gen']; // clothing jackpot: every clothing-class armor id
  if (CRAFT.has(itemId)) ch.push('craft');
  if (SALVAGE.has(itemId)) ch.push('salvage');
  if (GODPATH.has(itemId)) ch.push('godpath');
  return ch;
}
function channelLabel(itemId) {
  // primary (highest-value) channel for the margin read
  if (GODPATH.has(itemId)) return 'godpath|gen';
  if (SALVAGE.has(itemId)) return 'salvage';
  if (CRAFT.has(itemId)) return 'craft';
  return 'gen';
}

const files = fs.readdirSync(EVID).filter(f => f.endsWith('.json')).sort();
if (!files.length) { console.error('ANALYZER STOP: no per-seed JSONs in ' + EVID); process.exit(2); }

const rows = [];
for (const f of files) {
  const r = JSON.parse(fs.readFileSync(path.join(EVID, f), 'utf8'));
  let attr = null, attrErr = null;
  try { attr = attributeRun(r.snaps, { t4: T4 }); } catch (e) { attrErr = e.message; }
  rows.push({ file: f, run: r, attr, attrErr });
}

const bindingCounts = {};
for (const { attr, attrErr } of rows) {
  const k = attrErr ? 'ERROR:' + attrErr : attr.binding;
  bindingCounts[k] = (bindingCounts[k] || 0) + 1;
}

// Deferral-day anatomy: days in `short` per bar, over all deferral days.
const daysShort = { armor: 0, weapons: 0, tricks: 0, veterans: 0 };
let totalDeferDays = 0;
const perRunDefer = [];
for (const { run } of rows) {
  let dd = 0;
  const ds = { armor: 0, weapons: 0, tricks: 0, veterans: 0 };
  for (const s of (run.snaps || [])) {
    const deferred = (s.raw | 0) >= T4 && !s.ready && (s.peak | 0) < 4;
    if (!deferred) continue;
    dd++;
    for (const b of (s.short || [])) if (ds[b] !== undefined) ds[b]++;
  }
  totalDeferDays += dd;
  perRunDefer.push({ file: run.policyId + '-s' + run.seed, deferDays: dd, daysShort: ds });
  for (const b of Object.keys(ds)) daysShort[b] += ds[b];
}

// Medians: max living veterans over the run; armor margin at deferral.
const maxVets = rows.map(({ run }) => Math.max(0, ...((run.snaps || []).map(s => s.veterans | 0))));
const median = (a) => { const s = a.slice().sort((x, y) => x - y); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const medMaxVets = median(maxVets);
// armor margin: on deferral days, armored count vs demand
const deferArmored = [];
for (const { run } of rows) {
  for (const d of (run.deferArmor || [])) deferArmored.push(d.armored | 0);
}
const medDeferArmored = deferArmored.length ? median(deferArmored) : null;

// Armor-source breakdown over deferral-day margin pieces.
const pieceCounts = {};   // itemId -> count of villager-days
const chanCounts = {};    // channel label -> count
const pieceDays = new Set();
for (const { run } of rows) {
  for (const d of (run.deferArmor || [])) {
    for (const v of (d.margin || [])) {
      for (const slot of Object.keys(v.pieces || {})) {
        const id = v.pieces[slot];
        pieceCounts[id] = (pieceCounts[id] || 0) + 1;
        const lab = channelLabel(id);
        chanCounts[lab] = (chanCounts[lab] || 0) + 1;
        pieceDays.add(d.day + ':' + run.seed + ':' + run.policyId);
      }
    }
  }
}
const pieceTable = Object.entries(pieceCounts).sort((a, b) => b[1] - a[1])
  .map(([id, n]) => ({ id, n, channels: channelsOf(id).join('+') }));

// Wall numbers
const wall = {
  n: rows.length,
  national: rows.filter(r => r.run.national).length,
  table: rows.filter(r => (r.run.table | 0) === 1).length,
  invites: rows.map(r => r.run.invites | 0),
  wave4: rows.filter(r => (r.run.maxWave | 0) >= 4).length,
  wave5: rows.filter(r => (r.run.maxWave | 0) >= 5).length,
  wins: rows.filter(r => r.run.won).length,
  lost: rows.filter(r => /lost/i.test(r.run.endReason || '')).length,
  medianSurvival: median(rows.map(r => r.run.gameDays | 0)),
};

const out = {
  runs: rows.length,
  bindingCounts,
  totalDeferDays,
  daysShort,
  daysShortShare: Object.fromEntries(Object.entries(daysShort).map(([b, n]) => [b, totalDeferDays ? +(n / totalDeferDays).toFixed(3) : 0])),
  medians: { maxLivingVeterans: medMaxVets, armoredAtDeferral: medDeferArmored, armorDemand: 4, armorP: 15 },
  maxVetsRange: [Math.min(...maxVets), Math.max(...maxVets)],
  armorChannels: chanCounts,
  pieceTable,
  wall,
  perRun: rows.map(({ file, run, attr, attrErr }) => ({
    file, seed: run.seed, policy: run.policyId,
    days: run.gameDays, end: run.endReason, won: !!run.won, maxWave: run.maxWave,
    binding: attrErr ? 'ERROR:' + attrErr : attr.binding,
    deferDays: attrErr ? -1 : attr.deferDays,
    maxVets: attrErr ? -1 : attr.maxVal.veterans, maxArmored: attrErr ? -1 : attr.maxVal.armor,
    instrumentErrors: run.instrumentErrors, censusErrors: run.censusErrors,
  })),
};

if (process.argv.includes('--json')) {
  console.log(JSON.stringify(out, null, 1));
} else {
  console.log(`runs: ${out.runs}`);
  console.log('binding counts:', JSON.stringify(bindingCounts, null, 1));
  console.log(`deferral days: ${totalDeferDays}`);
  console.log('days in short:', JSON.stringify(daysShort), 'shares:', JSON.stringify(out.daysShortShare));
  console.log('medians:', JSON.stringify(out.medians), 'maxVets range:', JSON.stringify(out.maxVetsRange));
  console.log('armor channels (margin pieces):', JSON.stringify(chanCounts, null, 1));
  console.log('top pieces:', JSON.stringify(pieceTable.slice(0, 15), null, 1));
  console.log('wall:', JSON.stringify(wall));
  console.log('\nper-run:');
  for (const p of out.perRun) console.log(`  ${p.policy}-s${p.seed} days=${p.days} end=${p.end} won=${p.won} w=${p.maxWave} binding=${p.binding} defer=${p.deferDays} maxVets=${p.maxVets} maxArmored=${p.maxArmored} ierr=${p.instrumentErrors}`);
}
