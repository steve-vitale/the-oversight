#!/usr/bin/env node
// sim-heraldplace-a-analyze.js — per-seed + pooled herald placement
// analysis. Reads the splitter output dir (s<seed>.json), prints a
// JSON summary to stdout and a human table to stderr. Pure
// aggregation: no game loaded, no policy, no RNG.
'use strict';
const fs = require('fs');
const path = require('path');
const HPL = require(path.join(__dirname, 'sim-heraldplace-a-lib'));

const dir = process.argv[2];
if (!dir) { console.error('Usage: node scripts/sim-heraldplace-a-analyze.js <corpus-dir>'); process.exit(2); }
const files = fs.readdirSync(dir).filter(f => /^s\d+\.json$/.test(f)).sort();

function analyzeSeed(seed) {
  const dawns = seed.dawns || [];
  const contacts = seed.contacts || [];
  const contactDays = {};
  contacts.forEach(function (c) { contactDays[c.day] = true; });
  const lairs = seed.lairs || [];
  const firstLair = lairs.length ? lairs[0] : null;
  const firstLairDay = firstLair ? firstLair.day : null;
  // Located days: dawns on/after first lair day while herald present.
  const locatedDawns = (firstLairDay == null) ? [] : dawns.filter(function (d) { return d.day >= firstLairDay && d.heraldTile; });
  const dayClasses = {};
  let prevTile = null, teleports = 0, prevDawn = null;
  const occupancy = {};
  let maxDispMan = 0, maxDispCheb = 0, minDistHaven = null, minDistScholar = null;
  locatedDawns.forEach(function (d) {
    const t = d.heraldTile;
    const k = t.x + ',' + t.y;
    occupancy[k] = (occupancy[k] || 0) + 1;
    if (firstLair) {
      const dm = HPL.manhattan(t, { x: firstLair.tx, y: firstLair.ty });
      const dc = HPL.chebyshev(t, { x: firstLair.tx, y: firstLair.ty });
      if (dm > maxDispMan) maxDispMan = dm;
      if (dc > maxDispCheb) maxDispCheb = dc;
    }
    if (d.distHavenMan != null && (minDistHaven == null || d.distHavenMan < minDistHaven)) minDistHaven = d.distHavenMan;
    if (d.distScholarMan != null && (minDistScholar == null || d.distScholarMan < minDistScholar)) minDistScholar = d.distScholarMan;
    let cls;
    if (prevDawn && prevDawn.heraldTile && HPL.chebyshev(prevDawn.heraldTile, t) > 1) teleports++;
    if (d.day === firstLairDay) cls = 'PLACEMENT';
    else cls = HPL.dayClass(prevTile, t, !!contactDays[d.day], d.scholarTile);
    dayClasses[cls] = (dayClasses[cls] || 0) + 1;
    prevTile = t; prevDawn = d;
  });
  const stepScholar = {}, stepHaven = {};
  (seed.steps || []).forEach(function (s) {
    stepScholar[s.classScholar] = (stepScholar[s.classScholar] || 0) + 1;
    stepHaven[s.classHaven] = (stepHaven[s.classHaven] || 0) + 1;
  });
  const scholarContacts = contacts.filter(c => c.channel === 'scholar');
  const villagerContacts = contacts.filter(c => c.channel === 'villager');
  const contacted = contacts.length > 0;
  const located = !!firstLair;
  let seedClass = 'NEVER-LOCATED';
  if (contacted) seedClass = 'CONTACTED';
  else if (located) seedClass = 'LOCATED-UNFACED';
  const window = located ? (seed.gameDays - firstLairDay) : null;
  const ct = (seed.musterDiag && seed.musterDiag.callTotals) || {};
  return {
    seed: seed.seed, days: seed.gameDays, endReason: seed.endReason,
    maxWave: seed.maxWave, national: seed.national, table: seed.table, won: seed.won,
    wonDay90: (seed.won === 1 && seed.gameDays === 90),
    endScaleRank: seed.endScaleRank, captureErrs: seed.captureErrs,
    mdErrs: seed.musterDiag ? seed.musterDiag.errs : null,
    seedClass: seedClass, window: window,
    lairs: lairs, lairCount: lairs.length, firstLairDay: firstLairDay,
    locatedDawns: locatedDawns.length, dayClasses: dayClasses,
    teleports: teleports, occupancy: occupancy,
    maxDispMan: maxDispMan, maxDispCheb: maxDispCheb,
    minDistHaven: minDistHaven, minDistScholar: minDistScholar,
    stepScholar: stepScholar, stepHaven: stepHaven,
    wanderCalls: seed.wanderCalls, worldTicks: seed.worldTickCount,
    vtTicksHeraldPresent: seed.vtTicksHeraldPresent, vtTicksNpcOnTile: seed.vtTicksNpcOnTile,
    vtNpcEvents: (seed.vtNpcEvents || []).length,
    contacts: contacts.length, scholarContacts: scholarContacts.length,
    villagerContacts: villagerContacts.length,
    contactDays: Object.keys(contactDays).map(Number).sort(function (a, b) { return a - b; }),
    contactOutcomes: contacts.map(function (c) { return c.channel + ':' + c.outcome; }),
    contactYields: contacts.map(function (c) { return c.yieldNow; }),
    verbs: ct, mdRefusalSnaps: seed.musterDiag ? seed.musterDiag.refusals.length : null,
    removals: (seed.removals || []).length, endHerald: seed.endHerald,
  };
}

const perSeed = files.map(function (f) {
  return analyzeSeed(JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
});
const contacted = perSeed.filter(s => s.seedClass === 'CONTACTED');
const locatedUnfaced = perSeed.filter(s => s.seedClass === 'LOCATED-UNFACED');
const neverLocated = perSeed.filter(s => s.seedClass === 'NEVER-LOCATED');
const summary = {
  seeds: perSeed.length,
  contactedSeeds: contacted.length,
  locatedUnfacedSeeds: locatedUnfaced.length,
  neverLocatedSeeds: neverLocated.length,
  totalContacts: perSeed.reduce(function (n, s) { return n + s.contacts; }, 0),
  totalScholarContacts: perSeed.reduce(function (n, s) { return n + s.scholarContacts; }, 0),
  totalVillagerContacts: perSeed.reduce(function (n, s) { return n + s.villagerContacts; }, 0),
  wonDay90: perSeed.filter(s => s.wonDay90).length,
  won: perSeed.filter(s => s.won === 1).length,
  survivedUnwonPast120: perSeed.filter(s => s.won !== 1 && s.days > 120).length,
  perSeed: perSeed,
};
process.stdout.write(JSON.stringify(summary, null, 1) + '\n');
perSeed.forEach(function (s) {
  const l = s.lairs.length ? ('lair(' + s.lairs[0].tx + ',' + s.lairs[0].ty + ') d' + s.firstLairDay + ' dHaven' + s.lairs[0].distHavenMan + '/' + s.lairs[0].tileType) : 'no-lair';
  console.error(`s${s.seed}: ${s.seedClass} ${l} win=${s.window} contacts=${s.contacts}(S${s.scholarContacts}/V${s.villagerContacts}) days=${s.days} ${s.endReason} wave=${s.maxWave} steps=${JSON.stringify(s.stepScholar)} dayCls=${JSON.stringify(s.dayClasses)} maxDisp=${s.maxDispMan} minDH=${s.minDistHaven} minDS=${s.minDistScholar} vtNpc=${s.vtTicksNpcOnTile}/${s.vtTicksHeraldPresent}`);
});
console.error(`POOLED: seeds=${perSeed.length} contacted=${contacted.length} locatedUnfaced=${locatedUnfaced.length} neverLocated=${neverLocated.length} contacts=${summary.totalContacts} wonDay90=${summary.wonDay90}`);
