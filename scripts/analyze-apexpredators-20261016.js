#!/usr/bin/env node
'use strict';
// analyze-apexpredators-20261016.js — analyzer for the sim-apexpredators
// DIAGNOSTIC (flesh-out loop, 2026-10-16, scale-onramp axis).
//
// Reads evidence/2026-10-16/perseed-apexpredators/*.json and prints:
//   1. PRIMARY: attribution rate (species + context) on the post-invite
//      monster-verb villager death population (fieldfightsrc's 74/74 bar).
//   2. The ranked predator table: species x context x one-round-kill share
//      x kill share, plus wave rollups.
//   3. The counter-known share at death (does knowledge save lives?) and the
//      species-discovered (codex) share.
//   4. Days-since-wave4-unlock, roster-at-death, scholar-away distributions.
//   5. Wall numbers: national/table/wins, wave 4-5 unlocks, median/max
//      survival, death-cause shares.
// Writes evidence/2026-10-16/apexpredators-summary.json.
const fs = require('fs');
const path = require('path');
const AP = require('./apexpredators-20261016');

const DIR = path.join(__dirname, '..', 'evidence', '2026-10-16', 'perseed-apexpredators');
const OUT = path.join(__dirname, '..', 'evidence', '2026-10-16', 'apexpredators-summary.json');

const files = fs.readdirSync(DIR).filter(f => f.endsWith('.json')).sort();
const runs = files.map(f => JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')));

function wave4DayOf(run) {
  for (const r of (run.dayTiers || [])) if ((r.wave | 0) >= 4) return r.day;
  return null;
}

let target = [];           // every post-invite monster-verb villager death
const wall = { national: 0, table: 0, wins: 0, exiled: 0, wave4: 0, wave5: 0, survivals: [], maxSurvival: 0, deathCause: {} };
for (const run of runs) {
  wall.national += run.national | 0;
  wall.table += run.table | 0;
  wall.wins += run.wins | 0;
  wall.exiled += run.exiled | 0;
  if ((run.maxWave | 0) >= 4) wall.wave4++;
  if ((run.maxWave | 0) >= 5) wall.wave5++;
  const surv = run.gameDays || run.days || 0;
  wall.survivals.push(surv);
  if (surv > wall.maxSurvival) wall.maxSurvival = surv;
  for (const d of (run.deaths || [])) {
    const k = (d.family || '?') + '/' + (d.cause || '?').slice(0, 40);
    wall.deathCause[k] = (wall.deathCause[k] || 0) + 1;
  }
  const w4d = wave4DayOf(run);
  for (const d of (run.deaths || [])) {
    if (!AP.isTargetDeath(d, run.inviteDay)) continue;
    target.push(Object.assign({}, d, {
      run: `${run.policyId}-s${run.seed}`,
      wave4Day: w4d,
      daysSinceWave4: w4d == null ? null : d.day - w4d,
    }));
  }
}
wall.survivals.sort((a, b) => a - b);
wall.medianSurvival = wall.survivals.length ? wall.survivals[Math.floor(wall.survivals.length / 2)] : 0;

// PRIMARY
const attributed = target.filter(d => d.species != null && d.src && d.src !== 'unattributed');
const unattributed = target.filter(d => !(d.species != null && d.src && d.src !== 'unattributed'));
const primary = target.length ? attributed.length / target.length : 1;

// Predator table: species x context
const table = {};
for (const d of target) {
  const key = (d.species || '?') + ' | ' + (d.src || '?');
  const t = table[key] || (table[key] = { species: d.species || '?', src: d.src || '?', wave: d.wave, kills: 0, ork: 0, orkKnown: 0, counterKnown: 0, discovered: 0, scholarAway: 0, rosterSum: 0, rosterN: 0, dsw4Sum: 0, dsw4N: 0 });
  t.kills++;
  if (d.fightRounds != null) { t.orkKnown++; if (d.oneRoundKill) t.ork++; }
  if (d.counterKnown) t.counterKnown++;
  if (d.speciesDiscovered) t.discovered++;
  if (d.scholarAway) t.scholarAway++;
  if (d.rosterAtDeath != null) { t.rosterSum += d.rosterAtDeath; t.rosterN++; }
  if (d.daysSinceWave4 != null) { t.dsw4Sum += d.daysSinceWave4; t.dsw4N++; }
}
const ranked = Object.values(table).sort((a, b) => b.kills - a.kills).map(t => ({
  species: t.species, context: t.src, wave: t.wave,
  kills: t.kills, killShare: +(t.kills / target.length).toFixed(3),
  orkShare: t.orkKnown ? +(t.ork / t.orkKnown).toFixed(3) : null,
  orkKnown: `${t.ork}/${t.orkKnown}`,
  counterKnownShare: +(t.counterKnown / t.kills).toFixed(3),
  discoveredShare: +(t.discovered / t.kills).toFixed(3),
  scholarAwayShare: +(t.scholarAway / t.kills).toFixed(3),
  meanRoster: t.rosterN ? +(t.rosterSum / t.rosterN).toFixed(1) : null,
  meanDaysSinceWave4: t.dsw4N ? +(t.dsw4Sum / t.dsw4N).toFixed(1) : null,
}));

// Wave rollup
const byWave = {};
for (const d of target) {
  const w = d.wave == null ? '?' : 'wave-' + d.wave;
  const t = byWave[w] || (byWave[w] = { kills: 0, ork: 0, orkKnown: 0, counterKnown: 0, discovered: 0 });
  t.kills++;
  if (d.fightRounds != null) { t.orkKnown++; if (d.oneRoundKill) t.ork++; }
  if (d.counterKnown) t.counterKnown++;
  if (d.speciesDiscovered) t.discovered++;
}
// Context rollup
const bySrc = {};
for (const d of target) {
  const s = d.src || '?';
  const t = bySrc[s] || (bySrc[s] = { kills: 0, ork: 0, orkKnown: 0 });
  t.kills++;
  if (d.fightRounds != null) { t.orkKnown++; if (d.oneRoundKill) t.ork++; }
}
// Knowledge reads across the population
const ck = target.filter(d => d.counterKnown).length;
const sd = target.filter(d => d.speciesDiscovered).length;
const fr = target.filter(d => d.fightRounds != null);
const orkAll = fr.filter(d => d.oneRoundKill).length;
const away = target.filter(d => d.scholarAway).length;
const dsw4 = target.map(d => d.daysSinceWave4).filter(x => x != null).sort((a, b) => a - b);
const roster = target.map(d => d.rosterAtDeath).filter(x => x != null).sort((a, b) => a - b);
const med = (a) => a.length ? a[Math.floor(a.length / 2)] : null;

const summary = {
  runs: runs.length,
  targetDeaths: target.length,
  primary: { attributed: attributed.length, total: target.length, rate: +primary.toFixed(4), unattributed: unattributed.map(d => ({ run: d.run, day: d.day, cause: d.cause, via: d.via, src: d.src, monsterId: d.monsterId })) },
  predatorTable: ranked,
  byWave, bySrc,
  knowledge: {
    counterKnownShare: target.length ? +(ck / target.length).toFixed(3) : 0,
    counterKnownN: ck,
    speciesDiscoveredShare: target.length ? +(sd / target.length).toFixed(3) : 0,
    speciesDiscoveredN: sd,
  },
  lethality: {
    orkShare: fr.length ? +(orkAll / fr.length).toFixed(3) : null,
    orkN: `${orkAll}/${fr.length}`,
    roundsUnknown: target.length - fr.length,
  },
  context: {
    scholarAwayShare: target.length ? +(away / target.length).toFixed(3) : 0,
    medianDaysSinceWave4: med(dsw4),
    medianRosterAtDeath: med(roster),
  },
  wall: {
    national: `${wall.national}/${runs.length}`, table: `${wall.table}/${runs.length}`,
    wins: `${wall.wins}/${runs.length}`, exiled: `${wall.exiled}/${runs.length}`,
    wave4: `${wall.wave4}/${runs.length}`, wave5: `${wall.wave5}/${runs.length}`,
    medianSurvival: wall.medianSurvival, maxSurvival: wall.maxSurvival,
    deathCauseShares: Object.entries(wall.deathCause).sort((a, b) => b[1] - a[1]).slice(0, 12)
      .map(([k, n]) => ({ cause: k, n })),
  },
};

fs.writeFileSync(OUT, JSON.stringify(summary, null, 1));

console.log(`runs=${runs.length} targetDeaths=${target.length}`);
console.log(`PRIMARY: attributed ${attributed.length}/${target.length} = ${(primary * 100).toFixed(1)}% (bar >=95%) ${primary >= 0.95 ? 'GO' : 'NO-GO'}`);
if (unattributed.length) { console.log('UNATTRIBUTED:'); for (const d of summary.primary.unattributed) console.log('  ', JSON.stringify(d)); }
console.log('\nRANKED PREDATOR TABLE (species | context | wave | kills | killShare | orkShare (n) | counterKnown | discovered):');
for (const t of ranked) {
  console.log(`  ${t.kills}x ${t.species} | ${t.context} | w${t.wave} | share ${t.killShare} | ork ${t.orkShare} (${t.orkKnown}) | ck ${t.counterKnownShare} | disc ${t.discoveredShare}`);
}
console.log('\nBY WAVE:', JSON.stringify(byWave));
console.log('BY CONTEXT:', JSON.stringify(bySrc));
console.log(`\nKNOWLEDGE: counterKnown ${ck}/${target.length}, speciesDiscovered ${sd}/${target.length}`);
console.log(`LETHALITY: one-round-kill ${orkAll}/${fr.length}${target.length - fr.length ? ` (${target.length - fr.length} rounds-unknown)` : ''}`);
console.log(`CONTEXT: scholarAway ${away}/${target.length}, medianDaysSinceWave4 ${med(dsw4)}, medianRosterAtDeath ${med(roster)}`);
console.log(`\nWALL: national ${summary.wall.national} table ${summary.wall.table} wins ${summary.wall.wins} wave4 ${summary.wall.wave4} wave5 ${summary.wall.wave5} median ${wall.medianSurvival}d max ${wall.maxSurvival}d`);
console.log('TOP DEATH CAUSES:', JSON.stringify(summary.wall.deathCauseShares));
console.log('\nsummary ->', OUT);
