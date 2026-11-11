// vetfirst-analyze-20261111.js — veterans first-numbers analyzer
// (arm sim-vetfirst-b). Reads evidence/2026-11-11/perseed-vetfirst-b/
// vetfirst-s<seed>-vetfirst-pilot-{control,neutral}.json and prints the
// per-seed metric tables + GO verdict, writing a summary JSON.
// Usage: node scripts/vetfirst-analyze-20261111.js [--out <summary.json>]
'use strict';
const fs = require('fs');
const path = require('path');

const REPO = path.join(__dirname, '..');
const DIR = path.join(REPO, 'evidence', '2026-11-11', 'perseed-vetfirst-b');
const SEEDS = [190301, 190302, 190303, 190304, 190305, 190306, 190307, 190308];

let KIT = null;
try { KIT = require(path.join(REPO, 'scripts', 'sim-instrument-kit')); } catch (e) { KIT = null; }
function canonCause(raw) {
  try { if (KIT && typeof KIT.canonicalDeathCause === 'function') return KIT.canonicalDeathCause(raw); } catch (e) {}
  return String(raw || 'unknown');
}

let MONSTERS = {};
try {
  const defs = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'monsters.json'), 'utf8'));
  const list = Array.isArray(defs) ? defs : (defs.monsters || []);
  for (const m of list) if (m && m.id) MONSTERS[m.id] = m;
} catch (e) { console.error('monsters.json load failed: ' + e.message); }

function load(seed, mode) {
  const f = path.join(DIR, 'vetfirst-s' + seed + '-vetfirst-pilot-' + mode + '.json');
  return JSON.parse(fs.readFileSync(f, 'utf8'));
}

function scholarIdOnDay(daily, day) {
  // scholar vid on kill day: snapshot with that day, else nearest earlier.
  let best = null;
  for (const s of daily) {
    if (s.day <= day) best = s.scholarId;
    else break;
  }
  return best;
}

function reconcileWave(counters, log) {
  const logByWave = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const e of (log || [])) {
    if (!e) continue;
    const w = e.w | 0;
    if (logByWave[w] === undefined) logByWave[w] = 0;
    if (!e.pyrrhic) logByWave[w]++;
  }
  const out = {};
  for (let w = 1; w <= 5; w++) {
    const cnt = (counters || {})[w] || 0;
    const lg = logByWave[w] || 0;
    out[w] = { counter: cnt, log: lg, agree: cnt === lg };
  }
  return out;
}

function analyzeSeed(seed) {
  const c = load(seed, 'control');
  const n = load(seed, 'neutral');
  const daily = c.daily || [];
  const last = daily[daily.length - 1] || {};
  const log = last.waveKillLog || [];
  const counters = last.waveKills || {};

  // --- Metric 2: log vs counter, per wave ---
  const reconcile = reconcileWave(counters, log);
  let reconcileOk = true;
  for (let w = 1; w <= 5; w++) if (!reconcile[w].agree) reconcileOk = false;
  const logByWaveAll = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const e of log) { if (!e) continue; const w = e.w | 0; if (logByWaveAll[w] === undefined) logByWaveAll[w] = 0; logByWaveAll[w]++; }
  const dupCalls = (c.killCalls || []).filter(function (k) { return k.dup; });
  const pyrrhic = log.filter(function (e) { return e && e.pyrrhic; });
  const finalRoster = new Set(((last.roster || []).map(function (r) { return r.vid; })));
  const offRoster = log.filter(function (e) { return e && finalRoster.size && !finalRoster.has(e.by) && e.by !== last.scholarId; });

  // --- Metric 1: formation (kill-time-keyed) ---
  const killers = {};
  for (const e of log) {
    if (!e || !e.by) continue;
    const k = killers[e.by] || (killers[e.by] = {
      by: e.by, name: null, kills: 0, killsW3: 0, killsW4: 0,
      firstDay: e.d, lastDay: e.d, maxWave: 0, pyrrhic: 0,
      scholarAtKill: false, vias: {},
    });
    k.kills++;
    if ((e.w | 0) >= 3) k.killsW3++;
    if ((e.w | 0) >= 4) k.killsW4++;
    if (e.d < k.firstDay) k.firstDay = e.d;
    if (e.d > k.lastDay) k.lastDay = e.d;
    if ((e.w | 0) > k.maxWave) k.maxWave = (e.w | 0);
    if (e.pyrrhic) k.pyrrhic++;
    if (scholarIdOnDay(daily, e.d) === e.by) k.scholarAtKill = true;
    k.vias[e.via || 'unknown'] = (k.vias[e.via || 'unknown'] || 0) + 1;
  }
  // names from snapshots
  for (const s of daily) {
    for (const r of (s.roster || [])) {
      for (const by of Object.keys(killers)) if (by === r.vid && r.name) killers[by].name = r.name;
    }
    for (const k of ((s.vetsW3 || {}).killers || [])) if (killers[k.by] && !killers[k.by].name) killers[k.by].name = k.name;
  }
  const w3Killers = Object.keys(killers).filter(function (by) { return killers[by].killsW3 > 0; });
  const w4Killers = Object.keys(killers).filter(function (by) { return killers[by].killsW4 > 0; });
  // first veteran day / peak living veterans from daily series
  let firstVetDay = null, peakVetsW3 = 0, peakVetsW4 = 0;
  for (const s of daily) {
    const c3 = ((s.vetsW3 || {}).count) || 0;
    const c4 = ((s.vetsW4 || {}).count) || 0;
    if (c3 > 0 && firstVetDay === null) firstVetDay = s.day;
    if (c3 > peakVetsW3) peakVetsW3 = c3;
    if (c4 > peakVetsW4) peakVetsW4 = c4;
  }
  const livingEndW3 = ((last.vetsW3 || {}).count) || 0;
  const livingEndW4 = ((last.vetsW4 || {}).count) || 0;
  const scholarKillsW3 = Object.keys(killers).filter(function (by) { return killers[by].scholarAtKill && killers[by].killsW3 > 0; }).length;
  const scholarKillCount = log.filter(function (e) { return e && e.w >= 3 && scholarIdOnDay(daily, e.d) === e.by; }).length;

  // --- Metric 3: veteran deaths ---
  const vetDeaths = [];
  for (const by of w3Killers) {
    const k = killers[by];
    // death rows: registerDeath rows + driver death samples
    let deathDay = null, cause = null, deathKind = null, scholarAtDeath = null;
    for (const d of (c.regDeaths || [])) {
      if (d.villagerId === by) { deathDay = d.day; cause = d.cause; deathKind = d.kind; break; }
    }
    if (deathDay === null) {
      for (const d of (c.deaths || [])) {
        if (d.who === by || d.who === k.name) { deathDay = d.day; cause = d.cause; deathKind = d.kind; break; }
      }
    }
    // roster liveness at end + last-seen-alive from snapshots
    let aliveAtEnd = null, lastAliveDay = null;
    for (const s of daily) {
      const row = (s.roster || []).find(function (r) { return r.vid === by; });
      if (row) { if (!row.dead) lastAliveDay = s.day; aliveAtEnd = !row.dead; }
    }
    if (deathDay === null && aliveAtEnd === false && lastAliveDay !== null) deathDay = lastAliveDay + 1; // bounded: died after last alive snapshot
    if (deathDay !== null) {
      if (scholarAtDeath === null) scholarAtDeath = (scholarIdOnDay(daily, deathDay) === by);
      vetDeaths.push({
        by: by, name: k.name || by, firstKillDay: k.firstDay, lastKillDay: k.lastDay,
        deathDay: deathDay, daysAfterKill: deathDay - k.lastDay,
        cause: canonCause(cause), rawCause: cause, kind: deathKind,
        scholarAtDeath: !!scholarAtDeath, scholarAtKill: !!k.scholarAtKill,
        sameDay: deathDay === k.lastDay,
      });
    }
  }

  // --- Metric 4: monster veterans ---
  const casts = c.casts || [];
  const vetCasts = casts.filter(function (x) { return x.veteran; });
  const castsByWave = {};
  for (const x of casts) {
    const def = MONSTERS[x.id];
    const w = def ? (def.wave || 1) : 0;
    const row = castsByWave[w] || (castsByWave[w] = { total: 0, vet: 0 });
    row.total++;
    if (x.veteran) row.vet++;
  }
  const spawns = c.spawns || [];
  const vetSpawns = spawns.filter(function (x) { return x.veteran; });
  const fights = c.fights || [];
  const vetFights = fights.filter(function (f) { return f.veteran; });
  const variants = {};
  for (const f of vetFights) variants[f.veteranVariant || 'none'] = (variants[f.veteranVariant || 'none'] || 0) + 1;
  // veteran fighter stat check: hp within [defHp0*1.5, defHp1*1.5], speed = defSpeed+1
  let statOk = 0, statBad = 0, statUncheckable = 0;
  for (const f of vetFights) {
    if (!f.defHp || f.defSpeed === null || f.defSpeed === undefined) { statUncheckable++; continue; }
    const lo = Math.round(f.defHp[0] * 1.5), hi = Math.round(f.defHp[1] * 1.5);
    // world-HP lift does not apply to veterans (tbWorldHpFor returns null),
    // so a veteran fighter's hp is the rolled x1.5 value.
    const hpOk = f.hp >= lo && f.hp <= hi;
    const spdOk = f.speed === f.defSpeed + 1;
    if (hpOk && spdOk) statOk++; else statBad++;
  }
  // veteran-kill join (approximate): kill same day as a veteran TB fight of the same type
  const vetFightKeys = {};
  for (const f of vetFights) vetFightKeys[f.day + '|' + f.mid] = true;
  const vetJoinedKills = (c.killCalls || []).filter(function (k) { return !k.dup && vetFightKeys[k.day + '|' + k.mid]; });
  // base-wave check: every killCall's recorded wave == def wave
  let baseWaveOk = 0, baseWaveBad = 0;
  for (const k of (c.killCalls || [])) {
    const def = MONSTERS[k.mid];
    if (!def) { baseWaveBad++; continue; }
    if ((def.wave || 1) === k.wave) baseWaveOk++; else baseWaveBad++;
  }

  // --- Metric 5: veteran behavior ---
  const partyDays = {};
  const armorSeen = {};
  const weaponSeen = {};
  const assignCounts = {};
  for (const s of daily) {
    for (const row of (s.veteranRows || [])) {
      if (row.inParty) partyDays[row.by] = (partyDays[row.by] || 0) + 1;
      if (row.armorP !== null && row.armorP !== undefined) {
        if (armorSeen[row.by] === undefined || row.armorP > armorSeen[row.by]) armorSeen[row.by] = row.armorP;
      }
      if (row.weapon) weaponSeen[row.by] = row.weapon;
      if (row.assignment) assignCounts[row.assignment] = (assignCounts[row.assignment] || 0) + 1;
    }
  }
  const teachRows = (c.teleRows || []).filter(function (r) { return /teach|mentor/i.test(r.type || ''); });
  const partyRows = (c.teleRows || []).filter(function (r) { return /party|invite/i.test(r.type || ''); });

  // --- Metric 6: bar vs unlocks ---
  let firstReady4Day = null, firstReady5Day = null, vetShortDays4 = 0, vetShortDays5 = 0;
  for (const s of daily) {
    if (s.ready4 && s.ready4.ready && firstReady4Day === null) firstReady4Day = s.day;
    if (s.ready5 && s.ready5.ready && firstReady5Day === null) firstReady5Day = s.day;
    if (s.ready4 && (s.ready4.short || []).indexOf('veterans') >= 0) vetShortDays4++;
    if (s.ready5 && (s.ready5.short || []).indexOf('veterans') >= 0) vetShortDays5++;
  }
  const endReady4Vets = c.ready4 ? (c.ready4.veterans | 0) : null;
  const endReady5Vets = c.ready5 ? (c.ready5.veterans | 0) : null;
  const barAgree = (endReady4Vets === livingEndW3) && (endReady5Vets === livingEndW4) && (c.ladderVets4 === livingEndW4);
  // unlock days from say beats
  let unlock4Day = null, unlock5Day = null, unlock3Day = null;
  for (const s of (c.vetSays || [])) {
    if (unlock4Day === null && /MIRROR DRAFT/.test(s.line)) unlock4Day = s.day;
    if (unlock5Day === null && /PRODUCERS/.test(s.line)) unlock5Day = s.day;
    if (unlock3Day === null && /FINAL DRAFT/.test(s.line)) unlock3Day = s.day;
  }

  // --- Metric 7: wall ---
  const wall = {
    days: c.days, endReason: c.endReason, standing: c.standing, scaleRank: c.scaleRank,
    maxWave: c.maxWave, unlockedWave: c.unlockedWave, won: c.won,
    deaths: c.deaths.length, endPantryKcal: c.endPantryKcal,
  };

  // --- Neutrality ---
  const neutralOk = (c.days === n.days) && (c.endPantryKcal === n.endPantryKcal) && (c.deaths.length === n.deaths.length);

  // --- Classification completeness ---
  const unclassified = (c.killCalls || []).filter(function (k) { return !k.mid || !k.by || !k.via; }).length
    + (c.casts || []).filter(function (x) { return !x.id; }).length
    + (c.spawns || []).filter(function (x) { return !x.id; }).length;
  const wrapsLive = Object.keys(c.wrapLive || {}).sort();
  const errors = (c.instrumentErrors || []).length;

  return {
    seed: seed, neutralOk: neutralOk,
    neutral: { control: [c.days, c.endPantryKcal, c.deaths.length], neutral: [n.days, n.endPantryKcal, n.deaths.length] },
    reconcile: reconcile, reconcileOk: reconcileOk,
    dupCalls: dupCalls.length, pyrrhicLog: pyrrhic.length, offRosterLog: offRoster.length,
    m1: {
      w3Kills: log.filter(function (e) { return e && e.w >= 3; }).length,
      w4Kills: log.filter(function (e) { return e && e.w >= 4; }).length,
      w3Killers: w3Killers.length, w4Killers: w4Killers.length,
      firstVetDay: firstVetDay, peakVetsW3: peakVetsW3, peakVetsW4: peakVetsW4,
      livingEndW3: livingEndW3, livingEndW4: livingEndW4,
      scholarKillersW3: scholarKillsW3, scholarKillCountW3: scholarKillCount,
      killers: Object.keys(killers).map(function (by) { return killers[by]; }),
      vias: (function () { const v = {}; for (const e of log) { if (!e) continue; v[e.via || 'unknown'] = (v[e.via || 'unknown'] || 0) + 1; } return v; })(),
    },
    m3: { vetDeaths: vetDeaths },
    m4: {
      casts: casts.length, vetCasts: vetCasts.length, castsByWave: castsByWave,
      spawns: spawns.length, vetSpawns: vetSpawns.length,
      vetFights: vetFights.length, variants: variants,
      statOk: statOk, statBad: statBad, statUncheckable: statUncheckable,
      vetJoinedKills: vetJoinedKills.length, baseWaveOk: baseWaveOk, baseWaveBad: baseWaveBad,
    },
    m5: {
      partyDays: partyDays, armorSeen: armorSeen, weaponSeen: weaponSeen,
      assignCounts: assignCounts, teachRows: teachRows.length, partyRows: partyRows.length,
    },
    m6: {
      firstReady4Day: firstReady4Day, firstReady5Day: firstReady5Day,
      vetShortDays4: vetShortDays4, vetShortDays5: vetShortDays5,
      endReady4Vets: endReady4Vets, endReady5Vets: endReady5Vets, ladderVets4: c.ladderVets4,
      barAgree: barAgree, tribute: c.tribute, blooded: c.blooded,
      unlock3Day: unlock3Day, unlock4Day: unlock4Day, unlock5Day: unlock5Day,
    },
    wall: wall,
    unclassified: unclassified, wrapsLive: wrapsLive,
    wrapCount: wrapsLive.length, errors: errors,
    teleCounts: c.teleCounts || {},
    sayLines: (c.vetSays || []).length,
  };
}

function main() {
  const outIdx = process.argv.indexOf('--out');
  const outFile = outIdx >= 0 ? process.argv[outIdx + 1] : null;
  const rows = SEEDS.map(analyzeSeed);

  console.log('NEUTRALITY (control days / endPantryKcal / deaths vs neutral)');
  for (const r of rows) console.log('  ' + r.seed + ': ' + JSON.stringify(r.neutral.control) + ' vs ' + JSON.stringify(r.neutral.neutral) + ' -> ' + (r.neutralOk ? 'exact' : 'MISMATCH'));
  console.log('neutrality: ' + rows.filter(function (r) { return r.neutralOk; }).length + '/8 exact');

  console.log('\nM1 FORMATION (per seed: w3kills/w4kills, w3killers, firstVetDay, peakW3/peakW4, livingEndW3/W4, scholarKillersW3, scholarKillCountW3)');
  for (const r of rows) {
    const m = r.m1;
    console.log('  ' + r.seed + ': ' + m.w3Kills + '/' + m.w4Kills + ' kills, ' + m.w3Killers + ' w3-killers, firstVet d' + m.firstVetDay + ', peak ' + m.peakVetsW3 + '/' + m.peakVetsW4 + ', livingEnd ' + m.livingEndW3 + '/' + m.livingEndW4 + ', scholarKillers ' + m.scholarKillersW3 + ', scholarKills ' + m.scholarKillCountW3);
  }

  console.log('\nM2 RECONCILE (per wave: counter vs non-pyrrhic log)');
  for (const r of rows) {
    const parts = [1, 2, 3, 4, 5].map(function (w) { return 'w' + w + ' ' + r.reconcile[w].counter + 'v' + r.reconcile[w].log; }).join(', ');
    console.log('  ' + r.seed + ': ' + parts + ' | dupCalls ' + r.dupCalls + ' pyrrhicLog ' + r.pyrrhicLog + ' offRoster ' + r.offRosterLog + ' -> ' + (r.reconcileOk ? 'agree' : 'DISAGREE'));
  }

  console.log('\nM3 VETERAN DEATHS');
  for (const r of rows) {
    if (!r.m3.vetDeaths.length) { console.log('  ' + r.seed + ': none'); continue; }
    for (const d of r.m3.vetDeaths) {
      console.log('  ' + r.seed + ': ' + (d.name || d.by) + ' killed d' + d.lastKillDay + ', died d' + d.deathDay + ' (' + d.daysAfterKill + 'd after, ' + (d.sameDay ? 'SAME DAY' : 'later') + ') cause=' + d.cause + ' scholarAtDeath=' + d.scholarAtDeath + ' scholarAtKill=' + d.scholarAtKill);
    }
  }

  console.log('\nM4 MONSTER VETERANS (casts vet/total, spawns vet/total, vetFights, statOk/Bad/Uncheck, vetJoinedKills, baseWaveOk/Bad)');
  for (const r of rows) {
    const m = r.m4;
    console.log('  ' + r.seed + ': casts ' + m.vetCasts + '/' + m.casts + ', spawns ' + m.vetSpawns + '/' + m.spawns + ', vetFights ' + m.vetFights + ' ' + JSON.stringify(m.variants) + ', stats ' + m.statOk + '/' + m.statBad + '/' + m.statUncheckable + ', vetJoinedKills ' + m.vetJoinedKills + ', baseWave ' + m.baseWaveOk + '/' + m.baseWaveBad);
  }

  console.log('\nM5 VETERAN BEHAVIOR (partyDays, maxArmorP, weapon, assignments, teachRows, partyRows)');
  for (const r of rows) {
    console.log('  ' + r.seed + ': partyDays ' + JSON.stringify(r.m5.partyDays) + ' armor ' + JSON.stringify(r.m5.armorSeen) + ' weapons ' + JSON.stringify(r.m5.weaponSeen) + ' assign ' + JSON.stringify(r.m5.assignCounts) + ' teach ' + r.m5.teachRows + ' partyTele ' + r.m5.partyRows);
  }

  console.log('\nM6 BAR VS UNLOCKS (firstReady4/5 day, vetShortDays 4/5, endReady vets 4/5, ladderVets4, barAgree, tribute, blooded, unlock days 3/4/5)');
  for (const r of rows) {
    const m = r.m6;
    console.log('  ' + r.seed + ': ready4 d' + m.firstReady4Day + ' ready5 d' + m.firstReady5Day + ' vetShort ' + m.vetShortDays4 + '/' + m.vetShortDays5 + ' endVets ' + m.endReady4Vets + '/' + m.endReady5Vets + ' ladder4 ' + m.ladderVets4 + ' barAgree ' + m.barAgree + ' tribute ' + JSON.stringify(m.tribute && (m.tribute.ready !== undefined ? m.tribute.ready : m.tribute)) + ' blooded ' + m.blooded + ' unlock ' + m.unlock3Day + '/' + m.unlock4Day + '/' + m.unlock5Day);
  }

  console.log('\nM7 WALL (days, standing, scale, maxWave, unlocked, won, deaths)');
  for (const r of rows) {
    const w = r.wall;
    console.log('  ' + r.seed + ': ' + w.days + 'd ' + w.endReason + ' standing ' + w.standing + ' ' + w.scaleRank + ' maxWave ' + w.maxWave + ' unlocked ' + w.unlockedWave + ' won ' + w.won + ' deaths ' + w.deaths);
  }

  console.log('\nGO CHECKS');
  const go = {
    classified: rows.every(function (r) { return r.unclassified === 0; }),
    wrapsLive: rows.every(function (r) { return r.wrapCount >= 7; }),
    reconcile: rows.every(function (r) { return r.reconcileOk; }),
    barAgree: rows.every(function (r) { return r.m6.barAgree; }),
    neutrality: rows.every(function (r) { return r.neutralOk; }),
    errors: rows.every(function (r) { return r.errors === 0; }),
    capture: rows.every(function (r) { return r.sayLines !== undefined; }),
  };
  console.log('  classified 0-unclassified: ' + (go.classified ? 'GO' : 'NO-GO') + ' (per-seed: ' + rows.map(function (r) { return r.unclassified; }).join(',') + ')');
  console.log('  wraps live (>=7 of 7): ' + (go.wrapsLive ? 'GO' : 'NO-GO') + ' (per-seed: ' + rows.map(function (r) { return r.wrapCount + ':' + r.wrapsLive.join(','); }).join(' | ') + ')');
  console.log('  reconcile 8/8: ' + (go.reconcile ? 'GO' : 'NO-GO'));
  console.log('  bar agreement 8/8: ' + (go.barAgree ? 'GO' : 'NO-GO'));
  console.log('  neutrality 8/8: ' + (go.neutrality ? 'GO' : 'NO-GO'));
  console.log('  errors 0: ' + (go.errors ? 'GO' : 'NO-GO') + ' (per-seed: ' + rows.map(function (r) { return r.errors; }).join(',') + ')');
  const allGo = Object.keys(go).every(function (k) { return go[k]; });
  console.log('VERDICT: ' + (allGo ? 'GO' : 'NO-GO'));

  if (outFile) {
    fs.writeFileSync(outFile, JSON.stringify({ seeds: SEEDS, rows: rows, go: go, verdict: allGo ? 'GO' : 'NO-GO' }, null, 2) + '\n');
    console.log('wrote ' + outFile);
  }
  if (!allGo) process.exitCode = 1;
}

if (require.main === module) main();
module.exports = { reconcileWave: reconcileWave, analyzeSeed: analyzeSeed, scholarIdOnDay: scholarIdOnDay };
