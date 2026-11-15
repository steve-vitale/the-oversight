// analyze-gap3-haven-timeline-b.js — follow-up to analyze-gap3-b.js.
// For every haven (grounds/inside) scholar `the wild` death, trace the
// killer species' first sighting ON the Haven tile (4,4) in the travelTo
// log (monAtDestBefore / monAtFromBefore), and what travel preceded it.
// Distinguishes: killer waiting on Haven for days (squatter) vs killer
// first seen the same day as the death (arrived with/after the scholar).
// Read-only; prints JSON to stdout.
// Usage: node scripts/analyze-gap3-haven-timeline-b.js <corpus-dir>
'use strict';
const fs = require('fs');
const path = require('path');

const dir = process.argv[2];
if (!dir) { console.error('usage: node scripts/analyze-gap3-haven-timeline-b.js <corpus-dir>'); process.exit(2); }
const files = fs.readdirSync(dir).filter(function (f) { return f.endsWith('.json'); }).sort();

const out = { corpus: dir, seeds: [] };
for (const f of files) {
  const r = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  const diag = r.diag || {};
  const travels = diag.travels || [];
  // Haven observations: every travelTo touching (4,4), in seq order.
  // {day, seq, dir: 'to'|'from', mon} where mon is the monster id seen
  // on (4,4) at that moment (null = none seen).
  const obs = [];
  for (const t of travels) {
    if (t.toX === 4 && t.toY === 4) obs.push({ day: t.day, seq: t.seq, dir: 'to', mon: t.monAtDestBefore || null, fromX: t.fromX, fromY: t.fromY, fromMon: t.monAtFromBefore || null, retKind: t.retKind, arrived: t.arrived });
    else if (t.fromX === 4 && t.fromY === 4) obs.push({ day: t.day, seq: t.seq, dir: 'from', mon: t.monAtFromBefore || null, toX: t.toX, toY: t.toY, retKind: t.retKind, arrived: t.arrived });
  }
  // First-sighting day per species on Haven.
  const firstSeen = {};
  for (const o of obs) {
    if (o.mon && firstSeen[o.mon] === undefined) firstSeen[o.mon] = { day: o.day, seq: o.seq, dir: o.dir };
  }
  // Haven deaths (from the main analyzer's classification, recomputed
  // cheaply here from diag deaths + fights).
  const fightsBySeq = {};
  for (const ft of (diag.fights || [])) fightsBySeq[ft.seq] = ft;
  const seedOut = { seed: r.seed, havenObs: obs.length, firstSeen: firstSeen, deaths: [] };
  const playerDeaths = (r.deaths || []).filter(function (d) { return d.player; }).sort(function (a, b) { return a.day - b.day; });
  const gapOf = {};
  let prev = null;
  for (const d of playerDeaths) { gapOf[d.day + '|' + d.who] = (prev === null) ? null : (d.day - prev); prev = d.day; }
  for (const dd of (diag.deaths || [])) {
    if (!dd.player || dd.cause !== 'the wild' || !dd.lastFight) continue;
    const ft = fightsBySeq[dd.lastFight.seq];
    if (!ft) continue;
    const isHaven = ft.insideHaven || (ft.px === 4 && ft.py === 4);
    if (!isHaven) continue;
    const keys = dd.lastFight.monsterKeys || [];
    const killer = keys[0] || null;
    const fs = killer ? firstSeen[killer] : null;
    // Observations of the killer on Haven strictly before the death day.
    const priorObs = obs.filter(function (o) { return o.mon === killer && (o.day < dd.day || (o.day === dd.day && o.seq < (ft.lastTravel ? ft.lastTravel.seq : 1e9))); });
    // The travel immediately before the killer's first Haven sighting.
    let arrivalCtx = null;
    if (fs) {
      const idx = obs.findIndex(function (o) { return o.seq === fs.seq; });
      const prevObs = idx > 0 ? obs[idx - 1] : null;
      arrivalCtx = { firstSeenDir: fs.dir, prevObs: prevObs ? { day: prevObs.day, seq: prevObs.seq, dir: prevObs.dir, mon: prevObs.mon } : null };
    }
    seedOut.deaths.push({ day: dd.day, gap: gapOf[dd.day + '|' + dd.who],
      gapClass: (gapOf[dd.day + '|' + dd.who] === null) ? 'first' : (gapOf[dd.day + '|' + dd.who] <= 0 ? '0' : (gapOf[dd.day + '|' + dd.who] <= 2 ? '1-2' : '3+')),
      killer: killer, monsterKeys: keys, wave: ft.wave, php: ft.php,
      loc: ft.insideHaven ? 'haven-inside' : 'haven-grounds',
      mech: ft.lastTravel ? undefined : undefined,
      havenMech: (function () {
        const lt = ft.lastTravel || {};
        if (lt.monAtDestBefore === undefined) return 'unknown-old-driver';
        if (lt.monAtDestBefore && keys.indexOf(lt.monAtDestBefore) >= 0) return 'waiting-on-tile';
        if (lt.monAtFromBefore && keys.indexOf(lt.monAtFromBefore) >= 0) return 'was-on-departure-tile';
        if (lt.monAtDestBefore) return 'other-monster-waiting';
        return 'arrived-after-scholar';
      })(),
      firstSeenDay: fs ? fs.day : null,
      daysOnHavenBeforeDeath: fs ? (dd.day - fs.day) : null,
      priorObsCount: priorObs.length,
      arrivalCtx: arrivalCtx,
      lastTravel: ft.lastTravel || null });
  }
  out.seeds.push(seedOut);
}
console.log(JSON.stringify(out, null, 2));
