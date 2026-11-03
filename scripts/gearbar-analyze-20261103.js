// gearbar-analyze-20261103.js — gear-bar autopsy analyzer (arm
// sim-gearbar-a). Pure classification over per-seed driver JSON; no Game
// needed, so the proof test can run it on fixtures.
// Usage: node scripts/gearbar-analyze-20261103.js <per-seed-dir> [run-filter]
// Prints per-seed end + transient-max bars, owns-vs-wears splits, reason
// class tables, reconciliation flags, and persistence runs.
'use strict';
const fs = require('fs');
const path = require('path');

const DEMAND = { armored: 4, armorP: 15, armed: 6 };
const MECH_CLASSES = ['owns-not-worn', 'stashed-not-fetched', 'communal-untaken'];

// Village-wide armor totals from one snapshot (fighter rows + communal).
function villageTotals(snap) {
  let worn = 0, pack = 0, stash = 0, weapons = 0;
  (snap.fighters || []).forEach(function (f) {
    worn += (f.wornArmor || []).length;
    pack += (f.packArmor || []).length;
    stash += (f.stashArmor || []).length;
    weapons += (f.equippedWeapons || []).length + (f.packWeapons || []).length + (f.stashWeapons || []).length;
  });
  const v = snap.village || {};
  return { armorWorn: worn, armorPack: pack, armorStash: stash,
    armorCommunal: v.communalArmorUnits || 0, armorTotal: worn + pack + stash + (v.communalArmorUnits || 0),
    weaponsTotal: weapons + (v.communalWeaponUnits || 0),
    communalWeaponUnits: v.communalWeaponUnits || 0, communalArmorUnits: v.communalArmorUnits || 0 };
}

function classifyArmor(f, snap, totals) {
  if (!f.living) return null;
  if (f.ap >= DEMAND.armorP) return 'meets';
  if ((f.packArmor || []).length > 0) return 'owns-not-worn';
  if ((f.stashArmor || []).length > 0) return 'stashed-not-fetched';
  if (f.ap >= 1) return 'wears-below-demand';
  const ownTotal = (f.wornArmor || []).length + (f.packArmor || []).length + (f.stashArmor || []).length;
  if (totals.armorTotal - ownTotal > 0) return 'no-armor-owned-exists-elsewhere';
  const v = snap.village || {};
  if ((v.codexBark || 0) >= 1 || (v.codexHide || 0) >= 1) return 'no-armor-not-crafted';
  return 'no-armor-recipe-unlearned';
}
function classifyArmed(f, snap) {
  if (!f.living) return null;
  if (f.armed) return 'meets';
  if ((f.stashWeapons || []).length > 0) return 'stashed-not-fetched';
  if (((snap.village || {}).communalWeaponUnits || 0) > 0) return 'communal-untaken';
  return 'no-weapon-anywhere';
}

// Max run of consecutive daily snapshots where a fighter is at home and in
// the SAME mechanism class (armor or armed side), and max run in ANY
// mechanism class. Home = not away on that snapshot (scholar excluded:
// gearDay skips the scholar, so scholar runs are never mechanism evidence).
function persistenceRuns(snapshots, vid) {
  let same = 0, bestSame = 0, any = 0, bestAny = 0, lastClass = null;
  snapshots.forEach(function (snap) {
    const f = (snap.fighters || []).find(function (x) { return x.vid === vid; });
    if (!f || !f.living || f.isScholar || f.away) { same = 0; any = 0; lastClass = null; return; }
    const totals = villageTotals(snap);
    const ac = classifyArmor(f, snap, totals);
    const wc = classifyArmed(f, snap);
    const mech = [ac, wc].filter(function (c) { return MECH_CLASSES.indexOf(c) >= 0; });
    if (!mech.length) { same = 0; any = 0; lastClass = null; return; }
    any++;
    if (any > bestAny) bestAny = any;
    const key = mech.slice().sort().join('+');
    same = (key === lastClass) ? same + 1 : 1;
    lastClass = key;
    if (same > bestSame) bestSame = same;
  });
  return { bestSameClassRun: bestSame, bestAnyMechRun: bestAny };
}

function classifySeed(s) {
  const daily = s.daily || [];
  // END SNAPSHOT (instrument correction, not a metric change): the final
  // snapshot of a lost village is post-collapse (roster wiped, 0 living
  // fighters), so "end" means the last snapshot with >= 1 living fighter;
  // only if no snapshot has a living fighter do we fall back to the last.
  let endIdx = daily.length - 1;
  for (let i = daily.length - 1; i >= 0; i--) {
    if ((daily[i].fighters || []).some(function (f) { return f.living; })) { endIdx = i; break; }
  }
  const last = daily[endIdx] || {};
  const totalsEnd = villageTotals(last);
  const gateMismatchDays = daily.filter(function (snap) {
    return snap.readiness5 && (snap.recountArmored != null) &&
      (snap.readiness5.armored !== snap.recountArmored || snap.readiness5.armed !== snap.recountArmed);
  }).map(function (snap) { return { day: snap.day, gate: [snap.readiness5.armored, snap.readiness5.armed], recount: [snap.recountArmored, snap.recountArmed] }; });
  const apMissedDays = daily.filter(function (snap) { return (snap.apMissedFighters || []).length > 0; })
    .map(function (snap) { return { day: snap.day, fighters: snap.apMissedFighters }; });
  let maxArmored = -1, maxArmoredDay = null, maxArmed = -1, maxArmedDay = null;
  daily.forEach(function (snap) {
    if (snap.readiness5) {
      if (snap.readiness5.armored > maxArmored) { maxArmored = snap.readiness5.armored; maxArmoredDay = snap.day; }
      if (snap.readiness5.armed > maxArmed) { maxArmed = snap.readiness5.armed; maxArmedDay = snap.day; }
    }
  });
  const r5 = last.readiness5 || {};
  const fightersEnd = (last.fighters || []).filter(function (f) { return f.living; }).map(function (f) {
    return { vid: f.vid, isScholar: !!f.isScholar, ap: f.ap, manualAp: f.manualAp,
      armed: !!f.armed, armorClass: classifyArmor(f, last, totalsEnd),
      armedClass: classifyArmed(f, last),
      wornArmor: f.wornArmor, packArmor: f.packArmor, stashArmor: f.stashArmor,
      equippedWeapons: f.equippedWeapons, packWeapons: f.packWeapons, stashWeapons: f.stashWeapons };
  });
  const armorClasses = {}, armedClasses = {};
  fightersEnd.forEach(function (f) {
    armorClasses[f.armorClass] = (armorClasses[f.armorClass] || 0) + 1;
    armedClasses[f.armedClass] = (armedClasses[f.armedClass] || 0) + 1;
  });
  const rosterIds = [];
  daily.forEach(function (snap) { (snap.fighters || []).forEach(function (f) { if (rosterIds.indexOf(f.vid) < 0) rosterIds.push(f.vid); }); });
  const persist = {};
  rosterIds.forEach(function (vid) { persist[vid] = persistenceRuns(daily, vid); });
  const apDist = fightersEnd.map(function (f) { return f.ap; }).sort(function (a, b) { return a - b; });
  return {
    seed: s.seed, run: s.run, days: s.days, endReason: s.endReason, won: s.won,
    maxWave: s.maxWave, standing: s.standing,
    endArmored: r5.armored != null ? r5.armored : null, endArmed: r5.armed != null ? r5.armed : null,
    endRecountArmored: last.recountArmored != null ? last.recountArmored : null,
    endRecountArmed: last.recountArmed != null ? last.recountArmed : null,
    maxArmored: maxArmored, maxArmoredDay: maxArmoredDay,
    maxArmed: maxArmed, maxArmedDay: maxArmedDay,
    demand: DEMAND, ready5Days: daily.filter(function (x) { return x.readiness5 && x.readiness5.ready; }).length,
    endReadiness5: r5, endVillage: last.village || null, endTotals: totalsEnd,
    apDistEnd: apDist, maxApEnd: apDist.length ? apDist[apDist.length - 1] : null,
    armorClasses: armorClasses, armedClasses: armedClasses,
    gateMismatchDays: gateMismatchDays, apMissedDays: apMissedDays,
    instrumentErrors: (s.instrumentErrors || []).length,
    fightersEnd: fightersEnd, persist: persist,
    unclassifiedArmor: fightersEnd.filter(function (f) { return !f.armorClass; }).length,
    unclassifiedArmed: fightersEnd.filter(function (f) { return !f.armedClass; }).length,
  };
}

function main() {
  const dir = process.argv[2];
  const filter = process.argv[3] || '';
  if (!dir) { console.error('GEARBAR-ANALYZE STOP: per-seed dir required.'); process.exit(2); }
  const files = fs.readdirSync(dir).filter(function (f) { return f.endsWith('.json') && (!filter || f.indexOf(filter) >= 0); }).sort();
  const seeds = files.map(function (f) { return classifySeed(JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))); });
  const aggArmor = {}, aggArmed = {};
  let mismatchSeeds = 0, missedSeeds = 0, errSeeds = 0, unclassSeeds = 0;
  seeds.forEach(function (s) {
    Object.keys(s.armorClasses).forEach(function (c) { aggArmor[c] = (aggArmor[c] || 0) + s.armorClasses[c]; });
    Object.keys(s.armedClasses).forEach(function (c) { aggArmed[c] = (aggArmed[c] || 0) + s.armedClasses[c]; });
    if (s.gateMismatchDays.length) mismatchSeeds++;
    if (s.apMissedDays.length) missedSeeds++;
    if (s.instrumentErrors) errSeeds++;
    if (s.unclassifiedArmor || s.unclassifiedArmed) unclassSeeds++;
    const mechPersist = Object.keys(s.persist).filter(function (vid) { return s.persist[vid].bestSameClassRun >= 7; });
    console.log(JSON.stringify({
      seed: s.seed, days: s.days, end: s.endReason, maxWave: s.maxWave, standing: s.standing,
      endArmored: s.endArmored, endArmed: s.endArmed, recount: [s.endRecountArmored, s.endRecountArmed],
      maxArmored: s.maxArmored, maxArmoredDay: s.maxArmoredDay, maxArmed: s.maxArmed, maxArmedDay: s.maxArmedDay,
      demand: '4/6', maxApEnd: s.maxApEnd, apDistEnd: s.apDistEnd,
      armorClasses: s.armorClasses, armedClasses: s.armedClasses,
      totalsEnd: s.endTotals, villageEnd: s.endVillage,
      ready5Days: s.ready5Days, mismatchDays: s.gateMismatchDays.length, missedDays: s.apMissedDays.length,
      errors: s.instrumentErrors, unclassified: [s.unclassifiedArmor, s.unclassifiedArmed],
      mechPersist7: mechPersist,
    }));
  });
  console.log(JSON.stringify({
    seeds: seeds.length, aggArmorClasses: aggArmor, aggArmedClasses: aggArmed,
    gateMismatchSeeds: mismatchSeeds, apMissedSeeds: missedSeeds,
    errorSeeds: errSeeds, unclassifiedSeeds: unclassSeeds,
  }));
}

if (require.main === module) main();
module.exports = { classifySeed: classifySeed, classifyArmor: classifyArmor, classifyArmed: classifyArmed, persistenceRuns: persistenceRuns, villageTotals: villageTotals, DEMAND: DEMAND };
