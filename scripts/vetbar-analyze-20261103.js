// vetbar-analyze-20261103.js — veterans-bar autopsy analyzer (arm
// sim-vetbar-a). Pure classification over per-seed driver JSON; no Game
// needed, so the proof test can run it on fixtures.
// Usage: node scripts/vetbar-analyze-20261103.js <per-seed-dir> [run-filter]
// Prints per-seed chains + aggregate loss-class table + discrepancy flags.
'use strict';
const fs = require('fs');
const path = require('path');

function classifySeed(s) {
  const rows = s.killRows || [];
  const daily = s.daily || [];
  const last = daily[daily.length - 1] || {};
  const lastKillers = last.killers || {};
  const gateSet = last.gateSet || [];
  const r5 = last.readiness5 || {};
  const byRows = {};
  rows.forEach(function (r) {
    const k = (r.by == null ? '__null__' : String(r.by));
    (byRows[k] || (byRows[k] = [])).push(r);
  });
  // Effective death day: instrument deathDays, else first snapshot day
  // where the killer appears already dead (kill-to-snapshot gap).
  function deathDayEff(by) {
    if (s.deathDays && s.deathDays[by] != null) return s.deathDays[by];
    for (const snap of daily) {
      if (snap.killers && snap.killers[by] && !snap.killers[by].aliveRecount) return snap.day;
    }
    return null;
  }
  const perKiller = [];
  Object.keys(byRows).forEach(function (k) {
    const krows = byRows[k];
    const by = (k === '__null__' ? null : k);
    const firstDay = Math.min.apply(null, krows.map(function (r) { return r.day; }));
    const lastDay = Math.max.apply(null, krows.map(function (r) { return r.day; }));
    const allPyrrhic = krows.every(function (r) { return r.pyrrhic; });
    const vias = {};
    krows.forEach(function (r) { vias[r.via] = (vias[r.via] || 0) + 1; });
    const dropped = krows.filter(function (r) { return !r.entryAdded; }).length;
    let cls, aliveAtEnd = null, dd = null, scholarSucc = false;
    if (by === null) {
      cls = 'unattributed';
    } else {
      const lk = lastKillers[by];
      aliveAtEnd = lk ? !!lk.aliveRecount : null;
      dd = deathDayEff(by);
      scholarSucc = krows.some(function (r) { return r.wasScholar; }) && last.scholarId !== by;
      if (aliveAtEnd) {
        cls = (gateSet.indexOf(by) >= 0) ? 'counted' : 'alive-but-uncounted';
      } else if (allPyrrhic) {
        cls = 'pyrrhic';
      } else if (dd != null && (dd - lastDay) <= 1) {
        cls = 'died-same-fight';
      } else if (dd != null) {
        cls = 'died-later';
      } else {
        cls = 'died-unknown-day';
      }
    }
    perKiller.push({
      by: by, kills: krows.length, firstDay: firstDay, lastDay: lastDay,
      vias: vias, allPyrrhic: allPyrrhic, droppedRows: dropped,
      aliveAtEnd: aliveAtEnd, deathDay: dd, scholarSuccession: scholarSucc,
      class: cls,
    });
  });
  const droppedTotal = rows.filter(function (r) { return !r.entryAdded; }).length;
  const logLen = (last.logW4 || []).length;
  const gateMismatchDays = daily.filter(function (snap) {
    return snap.gateCount != null && snap.readiness5 && snap.readiness5.veterans != null
      && snap.gateCount !== snap.readiness5.veterans;
  }).map(function (snap) { return { day: snap.day, gateCount: snap.gateCount, readiness: snap.readiness5.veterans }; });
  const readyDays = daily.filter(function (snap) { return snap.readiness5 && snap.readiness5.ready; }).length;
  const firstReadyDay = (daily.find(function (snap) { return snap.readiness5 && snap.readiness5.ready; }) || {}).day || null;
  return {
    seed: s.seed, run: s.run, days: s.days, endReason: s.endReason, won: s.won,
    maxWave: s.maxWave, standing: s.standing,
    w4kills: rows.length, droppedRows: droppedTotal, logLenEnd: logLen,
    logReconciled: (logLen === rows.length - droppedTotal),
    distinctKillers: perKiller.length,
    livingKillers: perKiller.filter(function (k) { return k.class === 'counted'; }).length,
    readinessVeterans: r5.veterans != null ? r5.veterans : null,
    gateMismatchDays: gateMismatchDays,
    ready5Days: readyDays, firstReadyDay: firstReadyDay,
    endReadiness5: r5,
    instrumentErrors: (s.instrumentErrors || []).length,
    perKiller: perKiller,
  };
}

function main() {
  const dir = process.argv[2];
  const filter = process.argv[3] || '';
  if (!dir) { console.error('VETBAR-ANALYZE STOP: per-seed dir required.'); process.exit(2); }
  const files = fs.readdirSync(dir).filter(function (f) { return f.endsWith('.json') && (!filter || f.indexOf(filter) >= 0); }).sort();
  const seeds = files.map(function (f) { return classifySeed(JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))); });
  const classes = ['counted', 'pyrrhic', 'died-same-fight', 'died-later', 'died-unknown-day', 'alive-but-uncounted', 'unattributed'];
  const agg = {};
  classes.forEach(function (c) { agg[c] = 0; });
  let totKills = 0, totKillers = 0, seedsGE2 = 0, mismatchSeeds = 0, unreconciled = 0;
  seeds.forEach(function (s) {
    totKills += s.w4kills; totKillers += s.distinctKillers;
    if (s.livingKillers >= 2) seedsGE2++;
    if (s.gateMismatchDays.length) mismatchSeeds++;
    if (!s.logReconciled) unreconciled++;
    s.perKiller.forEach(function (k) { agg[k.class] = (agg[k.class] || 0) + 1; });
    console.log(JSON.stringify({
      seed: s.seed, days: s.days, end: s.endReason, maxWave: s.maxWave, standing: s.standing,
      w4kills: s.w4kills, dropped: s.droppedRows, logLen: s.logLenEnd, reconciled: s.logReconciled,
      killers: s.distinctKillers, living: s.livingKillers, readinessVet: s.readinessVeterans,
      ready5Days: s.ready5Days, firstReady: s.firstReadyDay,
      gateMismatchDays: s.gateMismatchDays.length, errors: s.instrumentErrors,
      chain: s.perKiller.map(function (k) { return k.by + ':' + k.class + 'x' + k.kills + (k.scholarSuccession ? '(scholar-succ)' : ''); }).join(' '),
    }));
  });
  console.log(JSON.stringify({
    seeds: seeds.length, totW4kills: totKills, totDistinctKillers: totKillers,
    lossClasses: agg, seedsLivingGE2: seedsGE2,
    gateMismatchSeeds: mismatchSeeds, unreconciledSeeds: unreconciled,
  }));
}

if (require.main === module) main();
module.exports = { classifySeed: classifySeed };
