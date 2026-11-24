// vetpair-b-analyze-20261124.js — veterans-alive-together census analyzer
// (arm sim-vetpair-b). Pure functions over one per-seed run JSON
// (vetpair-b driver output, which reuses the standing-gearready
// instrument VERBATIM). Derives, per seed:
//  - every wave-4+ killer: blooding day (first wave-4+ kill), death
//    day + raw cause + frozen cause group, days alive after
//    blooding, terminal status (dead / alive-at-end / departed)
//  - overlap windows, event-level (alive windows from kill/death
//    EVENTS — sees sub-day pairs) and snapshot-level (daily
//    veteranVids length >= 2 — the gate's own daily view)
//  - classification completeness: 0 killers UNCLASSIFIED is the
//    frozen bar; orphans (log rows without a kill event) and
//    veteran-recount mismatches are reported, never hidden.
// Death-cause groups are the FROZEN map from the prereg
// (evidence/2026-11-24/sim-vetpair-b-prereg.md); the raw cause
// string is always kept alongside the group.
// Usage: const AN = require('./vetpair-b-analyze-20261124');
//   const s = AN.summarizeSeed(perSeedJson);
//   const all = AN.summarizeAll([perSeedJson, ...]);
'use strict';

function clone(o) { return JSON.parse(JSON.stringify(o)); }

// Frozen cause map (prereg). Any RECORDED cause not listed here
// lands in 'other' — still classified, never unclassified.
const CAUSE_GROUPS = {
  combat: ['villager combat', 'combat', 'monster', 'ambush', 'the arena',
    'contest', 'Gavel', 'Highbeam Deer', 'The Focus Group', 'The Redactor',
    'Buffering', 'experiment', 'Ad Break'],
  expedition: ['expedition', 'the expedition'],
  wild: ['the wild'],
  disease: ['sickness', "a wound that wouldn't close", 'lockjaw'],
  starvation: ['starvation', 'thirst'],
  stranger: ['a stranger'],
};
function causeGroup(raw) {
  if (raw == null) return null;
  const c = String(raw);
  for (const g of Object.keys(CAUSE_GROUPS)) {
    if (CAUSE_GROUPS[g].indexOf(c) >= 0) return g;
  }
  return 'other';
}

function windowsFromDays(days) {
  // days: sorted unique ints -> maximal consecutive runs.
  const out = [];
  let start = null, prev = null;
  for (const d of days) {
    if (start == null) { start = d; prev = d; continue; }
    if (d === prev + 1) { prev = d; continue; }
    out.push({ start: start, end: prev, days: prev - start + 1 });
    start = d; prev = d;
  }
  if (start != null) out.push({ start: start, end: prev, days: prev - start + 1 });
  return out;
}

function summarizeSeed(out) {
  const daily = out.daily || [];
  const killEvents = (out.killEvents || []).filter(function (k) { return k && (k.wave | 0) >= 4 && k.by != null; });
  const deathEvents = (out.deathEvents || []).filter(function (e) { return e && (e.kind === 'person' || e.kind === 'villager') && e.who != null; });
  const s = {
    seed: out.seed, days: out.days, gameDays: out.gameDays,
    endReason: out.endReason, won: !!out.won, scaleRank: out.scaleRank,
    maxWave: out.maxWave, endUnlockedWave: out.endUnlockedWave,
    peakBeforeEndCall: out.peakBeforeEndCall, peakAfterEndCall: out.peakAfterEndCall,
    endCallMovedPeak: !!out.endCallMovedPeak,
    killers: [], killerCount: 0,
    unclassifiedKillers: [],
    orphanLogRows: [], veteranMismatchDays: [],
    overlapDaysEvent: [], overlapWindowsEvent: [],
    overlapDaysSnap: [], overlapWindowsSnap: [],
    maxLivingVeteransEvent: 0, maxLivingVeteransSnap: 0,
    deathCauseSplit: {}, deathCauseRaw: {},
    instrumentErrors: (out.instrumentErrors || []).length,
    w4Faced: false, w5Faced: false, w4Kills: 0, w5Kills: 0,
    endDay: daily.length ? daily[daily.length - 1].day : (out.gameDays || 0),
  };
  for (const d of daily) {
    if ((d.w4faced | 0) > 0) s.w4Faced = true;
    if ((d.w5faced | 0) > 0) s.w5Faced = true;
    if (d.veteranMismatch) s.veteranMismatchDays.push(d.day);
    const snapVets = (d.veteranVids || []).length;
    if (snapVets > s.maxLivingVeteransSnap) s.maxLivingVeteransSnap = snapVets;
    if (snapVets >= 2) s.overlapDaysSnap.push(d.day);
  }
  s.overlapWindowsSnap = windowsFromDays(s.overlapDaysSnap.slice().sort(function (a, b) { return a - b; }));

  // --- deaths by killer vid (first record wins; the double-death
  // guard in registerDeath means one registration per villager, but
  // never trust that — a second record is flagged, not averaged).
  const deathByVid = {};
  const duplicateDeaths = [];
  for (const e of deathEvents) {
    const vid = String(e.who);
    if (deathByVid[vid]) { duplicateDeaths.push({ vid: vid, first: deathByVid[vid], second: e }); continue; }
    deathByVid[vid] = e;
  }
  s.duplicateDeaths = duplicateDeaths;

  // --- killers: blooding day = first wave-4+ kill (entryAdded rows
  // preferred; a non-added row can only repeat an added one).
  const byVid = {};
  for (const k of killEvents) {
    const vid = String(k.by);
    byVid[vid] = byVid[vid] || { vid: vid, kills: [], bloodDay: null };
    byVid[vid].kills.push({ day: k.day | 0, mid: k.mid, wave: k.wave | 0, via: k.via || 'unknown', entryAdded: !!k.entryAdded });
    if (k.entryAdded && (byVid[vid].bloodDay == null || (k.day | 0) < byVid[vid].bloodDay)) byVid[vid].bloodDay = k.day | 0;
  }
  // Cross-check against the final snapshot's waveKillLog rows
  // (logW4): every w4+ log row must have a matching kill event.
  const lastSnap = daily.length ? daily[daily.length - 1] : null;
  const logW4 = (lastSnap && lastSnap.logW4) || [];
  const eventKeys = {};
  for (const k of killEvents) eventKeys[(k.day | 0) + '|' + k.mid + '|' + String(k.by)] = true;
  for (const r of logW4) {
    if (!eventKeys[(r.d | 0) + '|' + r.mid + '|' + String(r.by)]) {
      s.orphanLogRows.push({ d: r.d, mid: r.mid, by: r.by, via: r.via });
    }
  }
  // A killer known ONLY from the log (no kill event at all — the
  // event wrap missed it) still counts as a killer, blooded on the
  // log row's day, and is flagged via orphanLogRows above.
  for (const r of logW4) {
    const vid = String(r.by);
    if (!byVid[vid]) {
      byVid[vid] = { vid: vid, kills: [], bloodDay: r.d | 0 };
      byVid[vid].kills.push({ day: r.d | 0, mid: r.mid, wave: r.w | 0, via: r.via || 'unknown', entryAdded: false, logOnly: true });
    }
  }

  const finalVets = new Set((lastSnap && lastSnap.veteranVids) || []);
  const finalRoster = new Set((lastSnap && lastSnap.roster) || []);
  const exiles = ((out.endState && out.endState.exiles) || []);
  const exileByVid = {};
  for (const x of exiles) { if (x && x.vid != null) exileByVid[String(x.vid)] = x; }

  for (const vid of Object.keys(byVid).sort()) {
    const rec = byVid[vid];
    const bloodDay = (rec.bloodDay != null) ? rec.bloodDay
      : Math.min.apply(null, rec.kills.map(function (k) { return k.day; }));
    const w4 = rec.kills.filter(function (k) { return k.wave === 4 && k.entryAdded; }).length;
    const w5 = rec.kills.filter(function (k) { return k.wave >= 5 && k.entryAdded; }).length;
    s.w4Kills += w4; s.w5Kills += w5;
    const death = deathByVid[vid] || null;
    let status, deathDay = null, causeRaw = null, group = null, aliveAfter = null;
    if (death) {
      status = 'dead';
      deathDay = death.day | 0;
      causeRaw = death.cause;
      group = causeGroup(causeRaw);
      aliveAfter = deathDay - bloodDay;
      s.deathCauseSplit[group] = (s.deathCauseSplit[group] || 0) + 1;
      s.deathCauseRaw[String(causeRaw)] = (s.deathCauseRaw[String(causeRaw)] || 0) + 1;
    } else if (finalVets.has(vid)) {
      status = 'alive-at-end';
      aliveAfter = null; // censored: still alive at the horizon
    } else if (!finalRoster.has(vid)) {
      status = 'departed';
      const ex = exileByVid[vid] || null;
      aliveAfter = null;
      rec.departEvidence = ex ? { day: ex.day | 0, how: ex.how || 'left' } : { day: null, how: 'roster-absent-no-exile-row' };
    } else {
      // In the final roster, not a living veteran, no death record:
      // the veteran flag derives from the log, so a logged killer in
      // the roster MUST be in veteranVids. This is unclassified and
      // means the snapshot derivation or the log disagrees.
      status = 'unclassified';
      s.unclassifiedKillers.push(vid);
    }
    const killer = {
      vid: vid, bloodDay: bloodDay, kills: rec.kills.length, w4Kills: w4, w5Kills: w5,
      status: status, deathDay: deathDay, causeRaw: causeRaw, causeGroup: group,
      aliveAfter: aliveAfter,
      firstKill: rec.kills.slice().sort(function (a, b) { return a.day - b.day; })[0] || null,
    };
    if (rec.departEvidence) killer.departEvidence = rec.departEvidence;
    if (rec.kills.some(function (k) { return k.logOnly; })) killer.logOnly = true;
    s.killers.push(killer);
  }
  s.killerCount = s.killers.length;

  // --- event-level alive windows + overlap ---
  const endDay = s.endDay;
  const aliveDays = {}; // vid -> Set of days alive
  for (const k of s.killers) {
    const last = (k.status === 'dead' && k.deathDay != null) ? k.deathDay : endDay;
    const set = new Set();
    for (let d = k.bloodDay; d <= last; d++) set.add(d);
    aliveDays[k.vid] = set;
  }
  const overlapSet = new Set();
  const dayCounts = {};
  for (const vid of Object.keys(aliveDays)) {
    for (const d of aliveDays[vid]) {
      dayCounts[d] = (dayCounts[d] || 0) + 1;
      if (dayCounts[d] === 2) overlapSet.add(d);
      if (dayCounts[d] > s.maxLivingVeteransEvent) s.maxLivingVeteransEvent = dayCounts[d];
    }
  }
  // A lone killer still sets the max to 1.
  if (s.killerCount > 0 && s.maxLivingVeteransEvent < 1) s.maxLivingVeteransEvent = 1;
  s.overlapDaysEvent = Array.from(overlapSet).sort(function (a, b) { return a - b; });
  s.overlapWindowsEvent = windowsFromDays(s.overlapDaysEvent);
  return s;
}

function summarizeAll(seeds) {
  const all = {
    seeds: seeds.length, killers: 0, unclassifiedKillers: 0,
    overlapWindowsEvent: 0, overlapDaysEvent: 0,
    overlapWindowsSnap: 0, overlapDaysSnap: 0,
    seedsWithEventOverlap: 0, seedsWithSnapOverlap: 0,
    maxLivingVeteransEvent: 0, maxLivingVeteransSnap: 0,
    deathCauseSplit: {}, deathCauseRaw: {},
    aliveAfterDays: [], aliveAfterMedian: null, aliveAfterMax: null,
    sameDayDeaths: 0, aliveAtEnd: 0, departed: 0, dead: 0,
    wins: 0, national: 0, w4Faced: 0, w5Unlocked: 0, w5Faced: 0,
    survivals: [], medianSurvival: null, maxSurvival: 0,
    instrumentErrors: 0, orphanLogRows: 0, veteranMismatchDays: 0,
    duplicateDeaths: 0,
  };
  for (const out of seeds) {
    const s = summarizeSeed(out);
    all.killers += s.killerCount;
    all.unclassifiedKillers += s.unclassifiedKillers.length;
    all.overlapWindowsEvent += s.overlapWindowsEvent.length;
    all.overlapDaysEvent += s.overlapDaysEvent.length;
    all.overlapWindowsSnap += s.overlapWindowsSnap.length;
    all.overlapDaysSnap += s.overlapDaysSnap.length;
    if (s.overlapWindowsEvent.length) all.seedsWithEventOverlap++;
    if (s.overlapWindowsSnap.length) all.seedsWithSnapOverlap++;
    if (s.maxLivingVeteransEvent > all.maxLivingVeteransEvent) all.maxLivingVeteransEvent = s.maxLivingVeteransEvent;
    if (s.maxLivingVeteransSnap > all.maxLivingVeteransSnap) all.maxLivingVeteransSnap = s.maxLivingVeteransSnap;
    for (const g of Object.keys(s.deathCauseSplit)) all.deathCauseSplit[g] = (all.deathCauseSplit[g] || 0) + s.deathCauseSplit[g];
    for (const c of Object.keys(s.deathCauseRaw)) all.deathCauseRaw[c] = (all.deathCauseRaw[c] || 0) + s.deathCauseRaw[c];
    for (const k of s.killers) {
      if (k.status === 'dead') {
        all.dead++;
        if (k.aliveAfter != null) {
          all.aliveAfterDays.push(k.aliveAfter);
          if (k.aliveAfter === 0) all.sameDayDeaths++;
        }
      } else if (k.status === 'alive-at-end') all.aliveAtEnd++;
      else if (k.status === 'departed') all.departed++;
    }
    if (s.won) all.wins++;
    if (s.scaleRank === 'national') all.national++;
    if (s.endUnlockedWave >= 5) all.w5Unlocked++;
    if (s.w4Faced) all.w4Faced++;
    if (s.w5Faced) all.w5Faced++;
    all.survivals.push(s.days);
    all.instrumentErrors += s.instrumentErrors;
    all.orphanLogRows += s.orphanLogRows.length;
    all.veteranMismatchDays += s.veteranMismatchDays.length;
    all.duplicateDeaths += (s.duplicateDeaths || []).length;
  }
  // Standard median (not upper-middle): sort, average the middle two
  // on even counts.
  const sorted = all.survivals.slice().sort(function (a, b) { return a - b; });
  if (sorted.length) {
    const mid = Math.floor(sorted.length / 2);
    all.medianSurvival = (sorted.length % 2)
      ? sorted[mid]
      : (sorted[mid - 1] + sorted[mid]) / 2;
    all.maxSurvival = sorted[sorted.length - 1];
  }
  const aa = all.aliveAfterDays.slice().sort(function (a, b) { return a - b; });
  if (aa.length) {
    const mid = Math.floor(aa.length / 2);
    all.aliveAfterMedian = (aa.length % 2) ? aa[mid] : (aa[mid - 1] + aa[mid]) / 2;
    all.aliveAfterMax = aa[aa.length - 1];
  }
  return all;
}

module.exports = { summarizeSeed: summarizeSeed, summarizeAll: summarizeAll, causeGroup: causeGroup, windowsFromDays: windowsFromDays, CAUSE_GROUPS: CAUSE_GROUPS };
