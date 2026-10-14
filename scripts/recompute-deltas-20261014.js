#!/usr/bin/env node
// scripts/recompute-deltas-20261014.js — re-run the fixed delta layer on
// stored per-seed writes (no sim re-run). The sweep stored writes +
// trajectory; this rebuilds the census and recomputes successions,
// tenures, and ablations with the current instrument.
'use strict';
const fs = require('fs');
const path = require('path');
const td = require('./trustdeltas-20261014');

const dir = path.join(__dirname, '..', 'evidence', '2026-10-14', 'trustdeltas-perseed');
let n = 0;
for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith('.json') || f.includes('-i2')) continue;
  const p = path.join(dir, f);
  const r = JSON.parse(fs.readFileSync(p, 'utf8'));
  if (!r.writes || !r.trajectory) { console.log(`SKIP ${f}: no writes/trajectory`); continue; }
  const census = {
    writes: r.writes,
    daySamples: r.trajectory.map(t => ({ day: t.day, vid: t.vid, scholarTrust: t.trust, roster: t.roster })),
    progressive: [],
  };
  const scholarDayMap = new Map(census.daySamples.map(s => [s.day, String(s.vid)]));
  const successions = td.decomposeSuccessions(census);
  const tenures = td.buildTenures(census, successions);
  const ablations = tenures.map(t => Object.assign({ vid: t.vid, days: t.days.length,
    startTrust: t.startTrust, endTrust: t.endTrust, belowClass: t.belowClass,
    daysBelow30: t.daysBelow30, inherit: t.inherit }, td.ablateSting(t)));
  r.successions = successions.length;
  r.successionsDetail = successions;
  r.ablations = ablations;
  r.tenures = tenures.map(t => ({ vid: t.vid, days: t.days.length, startTrust: t.startTrust,
    endTrust: t.endTrust, maxTrust: t.maxTrust, minTrust: t.minTrust,
    daysBelow30: t.daysBelow30, daysAtOrAbove30: t.daysAtOrAbove30,
    belowClass: t.belowClass, drainTotal: +t.drainTotal.toFixed(1), gainTotal: +t.gainTotal.toFixed(1),
    setTotal: +t.setTotal.toFixed(1), drainByChannel: t.drainByChannel, gainByChannel: t.gainByChannel,
    inherit: t.inherit }));
  fs.writeFileSync(p, JSON.stringify(r, null, 1));
  n++;
  const bad = successions.filter(s => s.neu != null && s.check !== 'ok').length;
  const maxErr = Math.max.apply(null, ablations.map(a => a.replayError).concat([0]));
  console.log(`${f}: successions=${successions.length} checkFail=${bad} maxReplayErr=${maxErr} ablGained=${ablations.reduce((t,a)=>t+a.gained,0)}`);
}
console.log(`recomputed ${n} files`);
