// scholardrain-b-analyze.js — quantify the scholar drain on veteran-days
// (arm sim-scholardrain-b, Loop B run fleshout-loop-b-20261110T1248Z).
// Pure functions over a scholardrain-b per-seed corpus file
// (scripts/scholardrain-b-driver.js output). The KILL LOG is the source —
// kill-time samples (w>=4) plus the daily killerFates tables — never the
// waveKills counter (backlog #2077: log and counter disagree).
//
// Per killer, the veteran window runs from firstKillDay through the last
// recorded daily row day; each RECORDED day in the window classifies:
//   counted          — alive && !isScholar (the day counts toward the tribute)
//   lostSuccession   — alive && isScholar (lives, but holds the seat)
//   lostDeath        — !alive (dead)
// Days before the first kill and unrecorded days are never counted.
// A killer who kills and dies the same day counts that day as lostDeath;
// a killer who was scholar at kill time counts succession-lost from day one.
// Usage:
//   node scripts/scholardrain-b-analyze.js evidence/2026-11-10/perseed-scholardrain-b/scholardrain-b-s*.json
'use strict';
const fs = require('fs');
const path = require('path');

function w4Samples(out) {
  return ((out.killTimeSamples || []).filter(function (s) { return s && ((s.w | 0) >= 4); }));
}

// analyzeSeed(out): the drain quantification for one per-seed corpus.
// Returns a plain object; never reads out.waveKills (the counter).
function analyzeSeed(out) {
  const rows = out.daily || [];
  const samples = w4Samples(out);
  const tele = out.teleDeaths || [];
  const lastDay = rows.length ? rows[rows.length - 1].day : null;

  // --- killer roster, from the kill log (samples) ---
  const killerIds = {};
  for (const s of samples) { if (s.by) killerIds[s.by] = true; }
  // Cross-check: killers in daily killerFates tables but not in samples.
  const fateIds = {};
  for (const r of rows) {
    for (const f of (r.killerFates || [])) { if (f.vid) fateIds[f.vid] = true; }
  }
  const sampleOnly = Object.keys(killerIds).filter(function (id) { return !fateIds[id]; });
  const fateOnly = Object.keys(fateIds).filter(function (id) { return !killerIds[id]; });

  // --- per-killer fates, from the daily killerFates tables ---
  const killers = Object.keys(killerIds).map(function (vid) {
    const ks = samples.filter(function (s) { return s.by === vid; });
    const scholarKills = ks.filter(function (s) { return s.by === s.scholarIdAtKill; }).length;
    const firstKillDay = ks.reduce(function (m, s) { return (m == null || s.day < m) ? s.day : m; }, null);
    const lastKillDay = ks.reduce(function (m, s) { return (m == null || s.day > m) ? s.day : m; }, null);
    const name = (function () {
      for (const r of rows) {
        const f = (r.killerFates || []).find(function (x) { return x.vid === vid; });
        if (f && f.name) return f.name;
      }
      return null;
    })();
    // Veteran-day classification over recorded rows in the window.
    const vd = { counted: 0, succession: 0, death: 0, unknown: 0 };
    let daysToSeat = null;
    let firstFateDay = null;
    for (const r of rows) {
      if (firstKillDay == null || r.day < firstKillDay) continue;
      const f = (r.killerFates || []).find(function (x) { return x.vid === vid; });
      if (!f) continue; // killer not yet in any fate table on this row; window days with no fate row are unrecorded, not counted
      if (firstFateDay == null) firstFateDay = r.day;
      if (daysToSeat == null && f.isScholar) daysToSeat = r.day - firstKillDay;
      if (f.alive === true && !f.isScholar) vd.counted++;
      else if (f.alive === true && f.isScholar) vd.succession++;
      else if (f.alive === false) vd.death++;
      else vd.unknown++;
    }
    const scholarAtKill = ks.some(function (s) { return s.by === s.scholarIdAtKill; });
    if (scholarAtKill && daysToSeat == null) daysToSeat = 0;
    // Death day + cause from the death telemetry (day granularity).
    const dt = tele.filter(function (d) { return d && d.kind === 'villager' && d.who === vid; });
    const death = dt.length ? dt[dt.length - 1] : null;
    return {
      vid: vid, name: name, kills: ks.length, scholarKills: scholarKills,
      nonScholarKills: ks.length - scholarKills,
      firstKillDay: firstKillDay, lastKillDay: lastKillDay,
      scholarAtKill: scholarAtKill, daysToSeat: daysToSeat,
      deathDay: death ? death.day : null, deathCause: death ? death.cause : null,
      deathAsScholar: death ? !!death.player : null,
      veteranDays: vd, firstFateDay: firstFateDay,
    };
  });
  killers.sort(function (a, b) { return (a.firstKillDay || 0) - (b.firstKillDay || 0); });

  const veteranDays = killers.reduce(function (t, k) {
    t.counted += k.veteranDays.counted; t.succession += k.veteranDays.succession;
    t.death += k.veteranDays.death; t.unknown += k.veteranDays.unknown; return t;
  }, { counted: 0, succession: 0, death: 0, unknown: 0 });
  const lostDays = veteranDays.succession + veteranDays.death;
  const totalDays = veteranDays.counted + lostDays + veteranDays.unknown;

  // --- kills made as scholar ---
  const scholarKills = samples.filter(function (s) { return s.by === s.scholarIdAtKill; }).length;

  // --- ready windows for military_tribute ---
  const windows = [];
  let cur = null;
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const ready = !!((r.deeds || {}).military_tribute || {}).ready;
    if (ready && !cur) cur = { startDay: r.day, startIdx: i, endDay: r.day, endIdx: i };
    else if (ready && cur) { cur.endDay = r.day; cur.endIdx = i; }
    else if (!ready && cur) { windows.push(closeWindow(rows, cur, i)); cur = null; }
  }
  if (cur) windows.push({ startDay: cur.startDay, endDay: cur.endDay, days: cur.endIdx - cur.startIdx + 1, closedBy: 'censored', leavers: [] });
  const closedBySuccession = windows.filter(function (w) { return w.closedBy === 'succession'; }).length;
  const closedByDeath = windows.filter(function (w) { return w.closedBy === 'death'; }).length;
  const closedByMixed = windows.filter(function (w) { return w.closedBy === 'mixed'; }).length;

  // --- peaks ---
  const peakDaily = rows.reduce(function (m, r) { return (typeof r.livingVeterans === 'number' && r.livingVeterans > m) ? r.livingVeterans : m; }, 0);
  const peakKillTime = samples.reduce(function (m, s) { return (typeof s.livingVeteransAtKill === 'number' && s.livingVeteransAtKill > m) ? s.livingVeteransAtKill : m; }, 0);

  // --- scholar turnover ---
  const changes = out.scholarChanges || [];
  let promotedKiller = 0, promotedNonKiller = 0, promotedUnknown = 0;
  for (const c of changes) {
    if (!c.from) continue; // initial scholar, not a succession
    const toWasKiller = samples.some(function (s) { return s.by === c.to && s.day <= c.day; });
    if (toWasKiller) promotedKiller++;
    else if (c.to) promotedNonKiller++;
    else promotedUnknown++;
  }

  // --- primary metric: both drain numbers named ---
  const named = Number.isInteger(veteranDays.succession) && Number.isInteger(veteranDays.death);
  return {
    seed: out.seed, resultDays: out.resultDays, endReason: out.endReason, won: !!out.won,
    maxWave: out.maxWaveUnlocked, days: rows.length, lastDay: lastDay,
    killers: killers, killerCount: killers.length,
    sampleOnlyKillers: sampleOnly, fateOnlyKillers: fateOnly,
    veteranDays: veteranDays, lostDays: lostDays, totalDays: totalDays,
    successionShareOfLost: lostDays ? +(veteranDays.succession / lostDays).toFixed(3) : null,
    countedShare: totalDays ? +(veteranDays.counted / totalDays).toFixed(3) : null,
    scholarKills: { count: scholarKills, total: samples.length, share: samples.length ? +(scholarKills / samples.length).toFixed(3) : null },
    readyWindows: windows,
    closedBySuccession: closedBySuccession, closedByDeath: closedByDeath, closedByMixed: closedByMixed,
    censoredWindows: windows.filter(function (w) { return w.closedBy === 'censored'; }).length,
    peakVeterans: { daily: peakDaily, killTime: peakKillTime },
    scholarChanges: { total: changes.length, successions: changes.filter(function (c) { return !!c.from; }).length, promotedKiller: promotedKiller, promotedNonKiller: promotedNonKiller, promotedUnknown: promotedUnknown },
    named: named, noKillers: killers.length === 0,
  };
}

// closeWindow(rows, win, firstUnreadyIdx): classify what closed a ready
// window by which counted veterans left between the last ready row and
// the first unready row. A leaver alive && scholar on the first unready
// row closed it by succession; a leaver dead closed it by death.
function closeWindow(rows, win, firstUnreadyIdx) {
  const lastReady = rows[win.endIdx];
  const firstUnready = rows[firstUnreadyIdx];
  const readyVets = ((lastReady.veterans || []).map(function (v) { return v.vid; }));
  const unreadyVets = {};
  for (const v of (firstUnready.veterans || [])) unreadyVets[v.vid] = true;
  const leavers = [];
  for (const vid of readyVets) {
    if (unreadyVets[vid]) continue;
    const fate = (firstUnready.killerFates || []).find(function (x) { return x.vid === vid; });
    const name = (lastReady.veterans || []).find(function (v) { return v.vid === vid; });
    let cause = 'unknown';
    if (fate) {
      if (fate.alive === true && fate.isScholar) cause = 'succession';
      else if (fate.alive === false) cause = 'death';
      else if (fate.alive === true) cause = 'unknown-alive-nonscholar';
    }
    leavers.push({ vid: vid, name: name ? name.name : (fate ? fate.name : null), cause: cause });
  }
  const causes = leavers.map(function (l) { return l.cause; });
  let closedBy = 'unknown';
  if (leavers.length === 0) closedBy = 'unknown-no-leaver';
  else if (causes.every(function (c) { return c === 'succession'; })) closedBy = 'succession';
  else if (causes.every(function (c) { return c === 'death'; })) closedBy = 'death';
  else if (causes.some(function (c) { return c === 'succession'; }) && causes.some(function (c) { return c === 'death'; })) closedBy = 'mixed';
  return {
    startDay: win.startDay, endDay: win.endDay,
    days: win.endIdx - win.startIdx + 1, closedBy: closedBy, leavers: leavers,
  };
}

function printReport(results) {
  console.log('seed | days | killers | w4+ kills (scholar) | veteran-days counted/succ/death | ready windows (closed S/D/mixed/cens) | peak vets d/kt | scholar changes (promoted killer)');
  for (const r of results) {
    console.log(r.seed + ' | ' + r.resultDays + ' | ' + r.killerCount + (r.noKillers ? ' NO-KILLERS' : '') +
      ' | ' + r.scholarKills.total + ' (' + r.scholarKills.count + ')' +
      ' | ' + r.veteranDays.counted + '/' + r.veteranDays.succession + '/' + r.veteranDays.death +
      (r.veteranDays.unknown ? ' (+' + r.veteranDays.unknown + ' unk)' : '') +
      ' | ' + r.readyWindows.length + ' (' + r.closedBySuccession + '/' + r.closedByDeath + '/' + r.closedByMixed + '/' + r.censoredWindows + ')' +
      ' | ' + r.peakVeterans.daily + '/' + r.peakVeterans.killTime +
      ' | ' + r.scholarChanges.successions + ' (' + r.scholarChanges.promotedKiller + ')');
  }
  const pooled = results.reduce(function (t, r) {
    t.counted += r.veteranDays.counted; t.succession += r.veteranDays.succession;
    t.death += r.veteranDays.death; t.unknown += r.veteranDays.unknown;
    t.scholarKills += r.scholarKills.count; t.kills += r.scholarKills.total;
    t.killers += r.killerCount; return t;
  }, { counted: 0, succession: 0, death: 0, unknown: 0, scholarKills: 0, kills: 0, killers: 0 });
  const pooledLost = pooled.succession + pooled.death;
  console.log('POOLED veteran-days counted/succ/death: ' + pooled.counted + '/' + pooled.succession + '/' + pooled.death +
    (pooled.unknown ? ' (+' + pooled.unknown + ' unk)' : '') +
    ' | succession share of lost: ' + (pooledLost ? (pooled.succession / pooledLost).toFixed(3) : 'n/a') +
    ' | scholar kills: ' + pooled.scholarKills + '/' + pooled.kills +
    (pooled.kills ? ' (' + (pooled.scholarKills / pooled.kills).toFixed(3) + ')' : '') +
    ' | killers: ' + pooled.killers);
  console.log('PRIMARY (both drain numbers named on 8/8): ' +
    results.filter(function (r) { return r.named; }).length + '/' + results.length + ' named' +
    (results.some(function (r) { return r.noKillers; }) ? ' — seeds with no killers: ' + results.filter(function (r) { return r.noKillers; }).map(function (r) { return r.seed; }).join(',') : ''));
  const disc = results.filter(function (r) { return r.sampleOnlyKillers.length || r.fateOnlyKillers.length; });
  if (disc.length) console.log('DISCREPANCY sample-vs-fate killer sets: ' + JSON.stringify(disc.map(function (r) { return { seed: r.seed, sampleOnly: r.sampleOnlyKillers, fateOnly: r.fateOnlyKillers }; })));
  else console.log('DISCREPANCY sample-vs-fate killer sets: none on any seed');
}

if (require.main === module) {
  const files = process.argv.slice(2);
  if (!files.length) { console.error('usage: node scripts/scholardrain-b-analyze.js <per-seed json...>'); process.exit(2); }
  const results = files.map(function (f) { return analyzeSeed(JSON.parse(fs.readFileSync(f, 'utf8'))); });
  for (const r of results) {
    console.log('--- seed ' + r.seed + ' ---');
    for (const k of r.killers) {
      console.log('  killer ' + (k.name || k.vid) + ' (' + k.vid + '): kills ' + k.kills + ' (scholar ' + k.scholarKills + '), firstKill d' + k.firstKillDay + ', lastKill d' + k.lastKillDay +
        ', daysToSeat ' + (k.daysToSeat == null ? 'never' : k.daysToSeat) + (k.scholarAtKill ? ' (scholar at kill)' : '') +
        ', death d' + (k.deathDay == null ? '—' : k.deathDay) + ' ' + (k.deathCause || '') + (k.deathAsScholar ? ' as-scholar' : '') +
        ', veteran-days counted/succ/death ' + k.veteranDays.counted + '/' + k.veteranDays.succession + '/' + k.veteranDays.death);
    }
    for (const w of r.readyWindows) {
      console.log('  ready window d' + w.startDay + '–d' + w.endDay + ' (' + w.days + 'd) closed by ' + w.closedBy +
        (w.leavers.length ? ' — leavers: ' + w.leavers.map(function (l) { return (l.name || l.vid) + ':' + l.cause; }).join(', ') : ''));
    }
  }
  printReport(results);
}

module.exports = { analyzeSeed: analyzeSeed, closeWindow: closeWindow, w4Samples: w4Samples };
