// w4convert-analyze-20261103.js — analyzer for the wave-4
// kill-conversion split (arm sim-w4convert-a). Pure functions over
// per-seed JSON (driver output); no harness, no Game. Classification
// rules are the prereg's (evidence/2026-11-03/sim-w4convert-a-prereg.md).
// An exposure with no readable outcome is an instrument error, not a
// bucket: classifyExposure returns 'UNCLASSIFIED' for it and the
// summary counts it against DIAG-GO.
'use strict';

const CENSUS = { spawns: 71, tbStarts: 37, fields: 33, kills: 5 };

function effRows(rows) { return (rows || []).filter(function (r) { return r.entryAdded !== false; }); }

function classifyExposure(ex) {
  if (!ex || !ex.type) return 'UNCLASSIFIED';
  const kills = effRows(ex.kills || []);
  const pyrrhicOnly = kills.length > 0 && kills.every(function (r) { return r.pyrrhic; });
  if (ex.type === 'tb') {
    if (!ex.end) return 'tb-unended';
    if (kills.length > 0) return pyrrhicOnly ? 'kill-pyrrhic' : 'kill';
    const res = ex.end.result || 'unknown';
    if (res === 'lost') return 'died';
    if (res === 'fled') return 'fled';
    if (res === 'routed') return 'routed';
    return 'tb-other:' + res;
  }
  if (ex.type === 'field') {
    if (!ex.end) return 'field-unended';
    if (kills.length > 0) return pyrrhicOnly ? 'kill-pyrrhic' : 'kill';
    const o = ex.end.outcome;
    if (o === 'vKill') return 'kill-unlinked';
    if (o === 'vDie') return 'died';
    if (o === 'vFlee') return 'fled';
    if (o === 'mFlee') return 'monster-fled';
    if (o === 'evade') return 'evaded';
    if (o === 'alreadyDead') return 'already-dead';
    if (o === 'threw') return 'field-threw';
    return 'field-unresolved';
  }
  return 'UNCLASSIFIED';
}

function isKillClass(c) { return c === 'kill' || c === 'kill-pyrrhic'; }

// Lead-gear buckets (prereg): armed vs unarmed; armored (armorP>0)
// vs unarmored; readiness-geared (armorP>=15 AND armed) vs not.
function gearBuckets(gear) {
  const g = gear || {};
  const armorP = (g.armorP | 0) || 0;
  const armed = !!g.armed;
  return {
    armed: armed ? 'armed' : 'unarmed',
    armored: armorP > 0 ? 'armored' : 'unarmored',
    readyGeared: (armorP >= 15 && armed) ? 'ready-geared' : 'not-ready-geared',
    armorP: armorP,
  };
}

function splitTable(exposures, keyFn) {
  const out = {};
  for (const ex of exposures) {
    const k = keyFn(ex);
    const c = classifyExposure(ex);
    const b = out[k] || (out[k] = { exposures: 0, kills: 0, killingExposures: 0, classes: {} });
    b.exposures++;
    b.classes[c] = (b.classes[c] || 0) + 1;
    const kr = effRows(ex.kills || []).length;
    b.kills += kr;
    if (isKillClass(c)) b.killingExposures++;
  }
  for (const k of Object.keys(out)) {
    const b = out[k];
    b.killRowsPerExposure = b.exposures ? +(b.kills / b.exposures).toFixed(4) : null;
    b.killingRate = b.exposures ? +(b.killingExposures / b.exposures).toFixed(4) : null;
  }
  return out;
}

function classifyKiller(seed, by) {
  const rows = effRows(seed.killRows || []).filter(function (r) { return r.by === by; });
  if (!rows.length) return null;
  const firstKillDay = Math.min.apply(null, rows.map(function (r) { return r.day; }));
  const lastKillDay = Math.max.apply(null, rows.map(function (r) { return r.day; }));
  const deathDay = (seed.deathDays || {})[by] != null ? seed.deathDays[by] : null;
  const atEnd = rows.some(function (r) { return r.killerDeadAtRecord === true; });
  let aliveAtEnd = null;
  const snaps = seed.daily || [];
  for (let i = snaps.length - 1; i >= 0; i--) {
    if (snaps[i].killers && snaps[i].killers[by]) { aliveAtEnd = snaps[i].killers[by].aliveRecount; break; }
  }
  const dev = (seed.deathEvents || []).filter(function (e) { return e.who === by; });
  const cause = dev.length ? (dev[0].cause || 'UNRECORDED') : 'UNRECORDED';
  let cls, sub = null;
  if (deathDay == null) {
    cls = aliveAtEnd === true ? 'alive' : 'UNCLASSIFIED';
    if (aliveAtEnd === false) sub = 'dead-flag-without-deathDay';
  } else if (atEnd) { cls = 'same-fight'; sub = 'at-fight-end'; }
  else if (deathDay <= firstKillDay) { cls = 'same-fight'; sub = 'same-day-later'; }
  else { cls = 'later'; sub = null; }
  return {
    by: by, kills: rows.length, firstKillDay: firstKillDay, lastKillDay: lastKillDay,
    vias: rows.map(function (r) { return r.via; }),
    deathDay: deathDay, daysKillToDeath: deathDay != null ? (deathDay - firstKillDay) : null,
    killerDeadAtFightEnd: atEnd, aliveAtEnd: aliveAtEnd, class: cls, sub: sub,
    cause: cause, participation: 'UNRECORDED',
  };
}

function summarizeSeed(s) {
  const exposures = s.exposures || [];
  const withClass = exposures.map(function (ex) { return { ex: ex, cls: classifyExposure(ex) }; });
  const unclassified = withClass.filter(function (x) { return x.cls === 'UNCLASSIFIED'; }).length;
  const classes = {};
  withClass.forEach(function (x) { classes[x.cls] = (classes[x.cls] || 0) + 1; });
  const killRows = effRows(s.killRows || []);
  const droppedRows = (s.killRows || []).length - killRows.length;
  const killingExposures = withClass.filter(function (x) { return isKillClass(x.cls); }).length;
  const joined = exposures.filter(function (ex) { return effRows(ex.kills || []).some(function (r) { return r.linkSeq != null; }); }).length;
  const nonFight = withClass.filter(function (x) { return x.cls === 'evaded' || x.cls === 'already-dead'; }).length;
  const fought = exposures.length - nonFight;
  const killers = {};
  killRows.forEach(function (r) { if (r.by != null) killers[r.by] = true; });
  const perKiller = Object.keys(killers).map(function (by) { return classifyKiller(s, by); }).filter(Boolean);
  const unattributed = killRows.filter(function (r) { return r.by == null; }).length;
  const unclassifiedKillers = perKiller.filter(function (k) { return k.class === 'UNCLASSIFIED'; }).length;
  return {
    seed: s.seed, days: s.days, endReason: s.endReason,
    spawns: s.spawnsW4 != null ? s.spawnsW4 : (s.spawns || []).length,
    tbCalls: s.tbCalls, tbStarted: exposures.filter(function (e) { return e.type === 'tb'; }).length,
    fields: exposures.filter(function (e) { return e.type === 'field'; }).length,
    exposures: exposures.length, fought: fought, nonFight: nonFight,
    killRows: killRows.length, droppedRows: droppedRows,
    unlinkedKills: (s.unlinkedKills || []).length,
    killingExposures: killingExposures,
    killRowsPerExposure: exposures.length ? +(killRows.length / exposures.length).toFixed(4) : null,
    killRowsPerFought: fought ? +(killRows.length / fought).toFixed(4) : null,
    killingRate: exposures.length ? +(killingExposures / exposures.length).toFixed(4) : null,
    classes: classes, unclassified: unclassified,
    byType: splitTable(exposures, function (e) { return e.type; }),
    byParty: splitTable(exposures, function (e) { return (e.partySizeStart >= 2) ? '+ally' : 'solo'; }),
    byPartyAndType: splitTable(exposures, function (e) { return e.type + ':' + ((e.partySizeStart >= 2) ? '+ally' : 'solo'); }),
    byArmed: splitTable(exposures, function (e) { return gearBuckets(e.leadGear).armed; }),
    byArmored: splitTable(exposures, function (e) { return gearBuckets(e.leadGear).armored; }),
    byReadyGeared: splitTable(exposures, function (e) { return gearBuckets(e.leadGear).readyGeared; }),
    byMonster: splitTable(exposures, function (e) { return e.mid || 'unknown'; }),
    perKiller: perKiller, unattributedKills: unattributed, unclassifiedKillers: unclassifiedKillers,
    instrumentErrors: (s.instrumentErrors || []).length,
    orphanTbEnds: (s.orphanTbEnds || []).length,
    identity: s.identity || null, censusIdentity: s.censusIdentity || null,
  };
}

function summarizeAll(seeds) {
  const per = seeds.map(summarizeSeed);
  const sum = function (f) { return per.reduce(function (a, s) { return a + (f(s) || 0); }, 0); };
  const exposures = [];
  seeds.forEach(function (s) { (s.exposures || []).forEach(function (e) { exposures.push(e); }); });
  const killerClasses = {};
  per.forEach(function (s) { s.perKiller.forEach(function (k) { killerClasses[k.class] = (killerClasses[k.class] || 0) + 1; }); });
  const classes = {};
  per.forEach(function (s) { Object.keys(s.classes).forEach(function (c) { classes[c] = (classes[c] || 0) + (s.classes[c] || 0); }); });
  const totalExposures = exposures.length;
  const totalKills = sum(function (s) { return s.killRows; });
  const totalFought = sum(function (s) { return s.fought; });
  return {
    seeds: per.length, perSeed: per,
    totals: {
      spawns: sum(function (s) { return s.spawns; }), tbCalls: sum(function (s) { return s.tbCalls; }),
      tbStarted: sum(function (s) { return s.tbStarted; }), fields: sum(function (s) { return s.fields; }),
      exposures: totalExposures, fought: totalFought,
      killRows: totalKills, killingExposures: sum(function (s) { return s.killingExposures; }),
      unlinkedKills: sum(function (s) { return s.unlinkedKills; }),
      droppedRows: sum(function (s) { return s.droppedRows; }),
      killRowsPerExposure: totalExposures ? +(totalKills / totalExposures).toFixed(4) : null,
      killRowsPerFought: totalFought ? +(totalKills / totalFought).toFixed(4) : null,
      instrumentErrors: sum(function (s) { return s.instrumentErrors; }),
      unclassified: sum(function (s) { return s.unclassified; }),
      unclassifiedKillers: sum(function (s) { return s.unclassifiedKillers; }),
      orphanTbEnds: sum(function (s) { return s.orphanTbEnds; }),
    },
    classes: classes, killerClasses: killerClasses,
    byType: splitTable(exposures, function (e) { return e.type; }),
    byParty: splitTable(exposures, function (e) { return (e.partySizeStart >= 2) ? '+ally' : 'solo'; }),
    byPartyAndType: splitTable(exposures, function (e) { return e.type + ':' + ((e.partySizeStart >= 2) ? '+ally' : 'solo'); }),
    byArmed: splitTable(exposures, function (e) { return gearBuckets(e.leadGear).armed; }),
    byArmored: splitTable(exposures, function (e) { return gearBuckets(e.leadGear).armored; }),
    byReadyGeared: splitTable(exposures, function (e) { return gearBuckets(e.leadGear).readyGeared; }),
    byMonster: splitTable(exposures, function (e) { return e.mid || 'unknown'; }),
    census: CENSUS,
  };
}

module.exports = { classifyExposure: classifyExposure, classifyKiller: classifyKiller, gearBuckets: gearBuckets, splitTable: splitTable, summarizeSeed: summarizeSeed, summarizeAll: summarizeAll, CENSUS: CENSUS, effRows: effRows };
