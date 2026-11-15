// vetattrition-analyze-20261115.js — veteran-attrition DIAG for
// sim-vetattrition-a. Walks the 7 frozen corpora (see
// evidence/2026-11-15/sim-vetattrition-a-prereg.md) and emits per-seed
// veteran-death tables: every living-wave-4-killer exit classified by
// cause, wave, timing relative to wave-5 unlock, and party context.
// Two corpus classes:
//   T (transplant/vetfirst, daily snapshots) — EXACT: vetsW4 killers by
//     vid+name, regDeaths victim rows, waveKillLog, veteranRows inParty,
//     partyMembers, spawns/fights/killCalls per day.
//   G (gorgeprice2/balance-panel, series rows) — INFERRED: vet5 drops
//     matched to villager deaths in the inter-row window; AMBIGUOUS
//     drops count as UNCLASSIFIED per the prereg.
// Read-only over the corpora; prints JSON to stdout.
// Usage: node scripts/vetattrition-analyze-20261115.js <dir> [<dir> ...]
//   (class auto-detected per dir from the first file's shape)
'use strict';
const fs = require('fs');
const path = require('path');

function loadMonsterWaves(monstersPath) {
  const raw = JSON.parse(fs.readFileSync(monstersPath, 'utf8'));
  const list = raw.monsters || raw;
  const waveById = {};
  const w5 = [];
  const w4 = [];
  for (const m of list) {
    if (!m || !m.id) continue;
    waveById[m.id] = m.wave | 0;
    if (m.wave === 5) w5.push(m.id);
    if (m.wave === 4) w4.push(m.id);
  }
  return { waveById: waveById, w5: w5.sort(), w4: w4.sort() };
}

function med(a) {
  if (!a.length) return null;
  const s = a.slice().sort(function (x, y) { return x - y; });
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

function seriesAt(series, day) {
  let best = null;
  for (const r of series || []) {
    if (r.d <= day) best = r;
    else break;
  }
  return best;
}

// ---------------- Class T (vetfirst instrument) ----------------

function analyzeTFile(d, monsters) {
  const errors = [];
  const seed = d.seed;
  const daily = Array.isArray(d.daily) ? d.daily.slice().sort(function (a, b) { return a.day - b.day; }) : null;
  if (!daily || !daily.length) errors.push('no-daily');
  if (Array.isArray(d.instrumentErrors) && d.instrumentErrors.length) {
    errors.push('instrumentErrors:' + d.instrumentErrors.length);
  }
  const regDeaths = Array.isArray(d.regDeaths) ? d.regDeaths : [];
  const spawns = Array.isArray(d.spawns) ? d.spawns : [];
  const fights = Array.isArray(d.fights) ? d.fights : [];
  const killCalls = Array.isArray(d.killCalls) ? d.killCalls : [];
  const teleRows = Array.isArray(d.teleRows) ? d.teleRows : [];

  // Wave-fight day map: day -> max wave with a spawn/fight/killCall.
  const fightWaveByDay = {};
  function noteFight(day, wave) {
    if (day == null || wave == null) return;
    if (!fightWaveByDay[day] || wave > fightWaveByDay[day]) fightWaveByDay[day] = wave;
  }
  spawns.forEach(function (s) { noteFight(s.day, s.wave); });
  fights.forEach(function (f) { noteFight(f.day, monsters.waveById[f.mid]); });
  killCalls.forEach(function (k) { noteFight(k.day, k.wave); });

  // Wave-gated spawn callers only (Correction 2): titanPlace and
  // finaleCampaignPlace place scripted monsters bypassing the wave-unlock
  // gate, so they never imply unlock. Gated: checkEncounter + maintainWorldMonsters.
  const GATED_SPAWN_CALLERS = new Set(['Object.checkEncounter', 'Object.maintainWorldMonsters']);
  const gatedSpawns = spawns.filter(function (s) { return GATED_SPAWN_CALLERS.has(s.caller); });
  const nonGatedW5Spawns = spawns.filter(function (s) { return s.wave === 5 && !GATED_SPAWN_CALLERS.has(s.caller); }).length;
  const firstW4SpawnDay = gatedSpawns.filter(function (s) { return s.wave === 4; })
    .reduce(function (a, s) { return a === null || s.day < a ? s.day : a; }, null);
  const firstW4KillDay = killCalls.filter(function (k) { return k.wave === 4; })
    .reduce(function (a, k) { return a === null || k.day < a ? k.day : a; }, null);
  const firstW4Day = firstW4SpawnDay !== null && firstW4KillDay !== null
    ? Math.min(firstW4SpawnDay, firstW4KillDay)
    : (firstW4SpawnDay !== null ? firstW4SpawnDay : firstW4KillDay);
  const firstW5SpawnDay = gatedSpawns.filter(function (s) { return s.wave === 5; })
    .reduce(function (a, s) { return a === null || s.day < a ? s.day : a; }, null);

  // Standing time series: [[day, value], ...]
  const standingSeries = ((d.samples || {}).standing || []).slice()
    .sort(function (a, b) { return a[0] - b[0]; });
  function standingAt(day) {
    let v = null;
    for (const p of standingSeries) { if (p[0] <= day) v = p[1]; else break; }
    return v;
  }

  // Derived unlock day (prereg + Correction 1b): first snapshot day with
  // ready5.ready AND standing >= 200 AND a wave-4 spawn/kill already
  // seen; the unlock is the EARLIER of that day and the first wave-5
  // spawn day (a spawn proves the gate was open that day; the gate can
  // open mid-day between snapshots, and snapshot days can be missing).
  let unlockDay = null;
  let derivedUnlockDay = null;
  let unlockLag = null;
  if (daily) {
    for (const snap of daily) {
      const r5 = snap.ready5 || null;
      if (!r5 || !r5.ready) continue;
      const st = standingAt(snap.day);
      if (st === null || st < 200) continue;
      if (firstW4Day === null || firstW4Day > snap.day) continue;
      derivedUnlockDay = snap.day;
      break;
    }
    if (derivedUnlockDay !== null && firstW5SpawnDay !== null) {
      unlockDay = Math.min(derivedUnlockDay, firstW5SpawnDay);
      unlockLag = derivedUnlockDay - firstW5SpawnDay;
    } else if (firstW5SpawnDay !== null) unlockDay = firstW5SpawnDay;
    else unlockDay = derivedUnlockDay;
  }

  // Walk snapshots: track vetsW4 set; exits, entries, vet4 pipeline.
  const exits = [];
  const entries = [];
  let vet4Exits = 0;
  let vet4Entries = 0;
  let transientReturns = 0;
  let partyNonEmptyDays = 0;
  let veteranDaysTotal = 0;
  let veteranDaysInParty = 0;
  let vet5AtUnlock = null;
  let vet5AtEnd = null;
  let vet4AtEnd = null;
  const everVetsW4 = {}; // vid -> true (appeared in any snapshot)
  const everVetsW3 = {};
  if (daily) {
    const lastSnap = daily[daily.length - 1];
    vet5AtEnd = lastSnap.vetsW4 ? (lastSnap.vetsW4.count || 0) : null;
    vet4AtEnd = lastSnap.vetsW3 ? (lastSnap.vetsW3.count || 0) : null;
    if (unlockDay !== null) {
      const atUnlock = seriesAt(daily.map(function (s) {
        return { d: s.day, vet5: s.vetsW4 ? (s.vetsW4.count || 0) : null };
      }), unlockDay);
      vet5AtUnlock = atUnlock ? atUnlock.vet5 : null;
    }
    for (let i = 0; i < daily.length; i++) {
      const snap = daily[i];
      if (Array.isArray(snap.partyMembers) && snap.partyMembers.length) partyNonEmptyDays += 1;
      const vrows = Array.isArray(snap.veteranRows) ? snap.veteranRows : [];
      veteranDaysTotal += vrows.length;
      vrows.forEach(function (r) { if (r && r.inParty) veteranDaysInParty += 1; });
      const w4 = snap.vetsW4 && Array.isArray(snap.vetsW4.killers) ? snap.vetsW4.killers : [];
      const w3 = snap.vetsW3 && Array.isArray(snap.vetsW3.killers) ? snap.vetsW3.killers : [];
      w4.forEach(function (k) { everVetsW4[k.by] = true; });
      w3.forEach(function (k) { everVetsW3[k.by] = true; });
      if (i === 0) {
        w4.forEach(function (k) { entries.push({ vid: k.by, name: k.name, day: snap.day, kind: 'initial' }); });
        continue;
      }
      const prev = daily[i - 1];
      const prevW4 = prev.vetsW4 && Array.isArray(prev.vetsW4.killers) ? prev.vetsW4.killers : [];
      const prevW3 = prev.vetsW3 && Array.isArray(prev.vetsW3.killers) ? prev.vetsW3.killers : [];
      const prevSet = {};
      prevW4.forEach(function (k) { prevSet[k.by] = k; });
      const curSet = {};
      w4.forEach(function (k) { curSet[k.by] = k; });
      const prevW3Set = {};
      prevW3.forEach(function (k) { prevW3Set[k.by] = k; });
      const curW3Set = {};
      w3.forEach(function (k) { curW3Set[k.by] = k; });
      // Entries.
      Object.keys(curSet).forEach(function (vid) {
        if (!prevSet[vid]) entries.push({ vid: vid, name: curSet[vid].name, day: snap.day, kind: 'entry' });
      });
      Object.keys(curW3Set).forEach(function (vid) { if (!prevW3Set[vid]) vet4Entries += 1; });
      // Exits.
      Object.keys(prevSet).forEach(function (vid) {
        if (curSet[vid]) return;
        // Transient check: does the vid return in any later snapshot?
        let returns = false;
        for (let j = i + 1; j < daily.length; j++) {
          const later = daily[j].vetsW4 && Array.isArray(daily[j].vetsW4.killers)
            ? daily[j].vetsW4.killers : [];
          if (later.some(function (k) { return k.by === vid; })) { returns = true; break; }
        }
        if (returns) { transientReturns += 1; return; }
        exits.push(classifyTExit({
          vid: vid, prevKiller: prevSet[vid], prevSnap: prev, exitSnap: snap,
          regDeaths: regDeaths, teleRows: teleRows, fightWaveByDay: fightWaveByDay,
          unlockDay: unlockDay, daily: daily
        }));
      });
      Object.keys(prevW3Set).forEach(function (vid) { if (!curW3Set[vid]) vet4Exits += 1; });
    }
  }

  // Born-dead veterans: pyrrhic wave-4+ log entries whose killer never
  // appears in any vetsW4 snapshot.
  const finalLog = daily && daily.length
    ? (daily[daily.length - 1].waveKillLog || []) : [];
  const bornDead = [];
  finalLog.forEach(function (e) {
    if (!e || (e.w | 0) < 4 || !e.pyrrhic) return;
    if (!everVetsW4[e.by]) {
      bornDead.push({ vid: e.by, day: e.d, mid: e.mid, wave: e.w, via: e.via || null });
    }
  });

  const w4Kills = finalLog.filter(function (e) { return e && (e.w | 0) >= 4 && !e.pyrrhic; }).length;
  const w4PyrrhicKills = finalLog.filter(function (e) { return e && (e.w | 0) >= 4 && !!e.pyrrhic; }).length;
  const w5Kills = finalLog.filter(function (e) { return e && (e.w | 0) === 5 && !e.pyrrhic; }).length;

  // Classification roll-up.
  const classCounts = {};
  exits.forEach(function (x) { classCounts[x.causeClass] = (classCounts[x.causeClass] || 0) + 1; });
  const classified = exits.filter(function (x) {
    return x.causeClass !== 'AMBIGUOUS' && x.causeClass !== 'NON-DEATH-EXIT';
  }).length;
  // NON-DEATH-EXIT with an explained investigation still counts as
  // residue per the prereg (unexplained OR explained-but-not-a-death);
  // the prereg's bar counts AMBIGUOUS + unexplained NON-DEATH-EXIT as
  // unclassified. Explained NON-DEATH-EXIT (tribute/roster-departure
  // with evidence) is reported separately and does NOT count as
  // classified either — the bar is about deaths classified.
  const unclassified = exits.length - classified;

  return {
    seed: seed, cls: 'T', errors: errors,
    days: d.days, endReason: d.endReason, maxWave: d.maxWave,
    unlocked: unlockDay !== null, unlockDay: unlockDay,
    derivedUnlockDay: derivedUnlockDay, unlockLag: unlockLag,
    firstW4Day: firstW4Day, firstW5SpawnDay: firstW5SpawnDay,
    nonGatedW5Spawns: nonGatedW5Spawns,
    vet5AtUnlock: vet5AtUnlock, vet5AtEnd: vet5AtEnd, vet4AtEnd: vet4AtEnd,
    entries: entries.length, exitsTotal: exits.length,
    exits: exits, bornDead: bornDead,
    w4Kills: w4Kills, w4PyrrhicKills: w4PyrrhicKills, w5Kills: w5Kills,
    vet4Exits: vet4Exits, vet4Entries: vet4Entries,
    transientReturns: transientReturns, partyNonEmptyDays: partyNonEmptyDays,
    veteranDaysTotal: veteranDaysTotal, veteranDaysInParty: veteranDaysInParty,
    classCounts: classCounts, classified: classified, unclassified: unclassified,
    tribute: d.tribute || null, ready5End: d.ready5 || null,
    blooded: !!d.blooded
  };
}

function classifyTExit(o) {
  const prevSnap = o.prevSnap;
  const exitSnap = o.exitSnap;
  const vid = o.vid;
  const k = o.prevKiller;
  // Death row: regDeaths with villagerId == vid in [prevSnap.day,
  // exitSnap.day] (Correction 1a: left-inclusive — snapshots are
  // start-of-day, so a death during the last-present day carries that
  // day; a vid has at most one regDeaths row, so widening cannot
  // misattribute).
  const death = (o.regDeaths || []).filter(function (r) {
    return r && r.villagerId === vid && r.day >= prevSnap.day && r.day <= exitSnap.day;
  });
  const base = {
    vid: vid, name: k.name || null,
    firstKillDay: k.firstDay, lastKillDay: k.lastDay, maxWave: k.maxWave,
    kills: k.kills, scholarAtKill: !!k.scholarAtKill, pyrrhicKills: k.pyrrhicKills || 0,
    lastSeenDay: prevSnap.day, exitDay: exitSnap.day,
    unlockDay: o.unlockDay,
    daysAfterUnlock: o.unlockDay !== null ? (exitSnap.day - o.unlockDay) : null,
    inPartyAtLastSeen: null, partyMembersAtLastSeen: null,
    scholarAtDeath: null, deathDay: null, deathCause: null, deathKillerId: null,
    deathKind: null, causeClass: null, fightWaveOnDeathDay: null,
    investigation: null
  };
  // Party context at last-seen snapshot.
  try {
    const rows = Array.isArray(prevSnap.veteranRows) ? prevSnap.veteranRows : [];
    const row = rows.filter(function (r) { return r && r.by === vid; })[0] || null;
    if (row) {
      base.inPartyAtLastSeen = !!row.inParty;
      base.armorPAtLastSeen = (row.armorP === undefined ? null : row.armorP);
      base.weaponAtLastSeen = row.weapon || null;
      base.assignmentAtLastSeen = row.assignment || null;
      base.hpAtLastSeen = (row.hp === undefined ? null : row.hp);
    }
    base.partyMembersAtLastSeen = Array.isArray(prevSnap.partyMembers)
      ? prevSnap.partyMembers.slice() : null;
  } catch (e) { base.inPartyAtLastSeen = null; }
  if (!death.length) {
    base.causeClass = 'NON-DEATH-EXIT';
    base.investigation = investigateTNonDeath(o, vid, prevSnap, exitSnap);
    return base;
  }
  const r = death[0];
  base.deathDay = r.day;
  base.deathCause = r.cause || null;
  base.deathKillerId = r.killerId || null;
  base.deathKind = r.kind || null;
  base.scholarAtDeath = (exitSnap.scholarId === vid) || (prevSnap.scholarId === vid && r.day <= exitSnap.day);
  // Wave-fight window: death day, else day before.
  const fw = o.fightWaveByDay[r.day] || o.fightWaveByDay[r.day - 1] || null;
  base.fightWaveOnDeathDay = fw;
  const cause = (r.cause || '').toLowerCase();
  if (cause === 'monster' || cause === 'the wild' || cause === 'the expedition') {
    if (cause === 'the wild') {
      base.causeClass = 'WILD';
    } else if (cause === 'the expedition') {
      base.causeClass = 'ROAD-EXPEDITION';
    } else if (fw === 5) base.causeClass = 'W5-FIGHT';
    else if (fw === 4) base.causeClass = 'W4-FIGHT';
    else if (fw !== null && fw <= 3) base.causeClass = 'W3-LOWER-FIGHT';
    else base.causeClass = 'MONSTER-UNKNOWN-WAVE';
  } else if (cause === 'the arena') base.causeClass = 'ARENA';
  else if (cause === 'contest') base.causeClass = 'CONTEST';
  else if (cause === 'ambush') base.causeClass = 'AMBUSH';
  else base.causeClass = 'OTHER:' + (r.cause || 'unknown');
  return base;
}

function investigateTNonDeath(o, vid, prevSnap, exitSnap) {
  // Look for tele rows mentioning the vid near the exit, and whether the
  // vid is on any later roster snapshot (roster departure vs death).
  const near = (o.teleRows || []).filter(function (t) {
    return t && Math.abs(t.day - exitSnap.day) <= 2 &&
      String(t.summary || '').indexOf(vid) >= 0;
  }).map(function (t) { return { day: t.day, type: t.type }; });
  let onLaterRoster = false;
  // (Roster is only in daily snapshots; the caller passes snapshots via o.)
  if (o.daily) {
    for (const s of o.daily) {
      if (s.day <= exitSnap.day) continue;
      if (Array.isArray(s.roster) && s.roster.some(function (r) { return r && r.vid === vid; })) {
        onLaterRoster = true; break;
      }
    }
  }
  return { nearTele: near.slice(0, 5), onLaterRoster: onLaterRoster };
}

// ---------------- Class G (balance-panel recorder) ----------------

function analyzeGFile(d, monsters) {
  const errors = [];
  const seed = d.seed;
  const w5set = new Set(monsters.w5);
  const series = Array.isArray(d.series) ? d.series.slice().sort(function (a, b) { return a.d - b.d; }) : null;
  if (!series || !series.length) errors.push('no-series');
  if (!d.waveKills || typeof d.waveKills !== 'object') errors.push('no-waveKills');
  if (Array.isArray(d.instrumentErrors) && d.instrumentErrors.length) {
    errors.push('instrumentErrors:' + d.instrumentErrors.length);
  }
  const ev = (d.events || []).filter(function (e) { return e.kind === 'unlockedWave' && e.wave === 5; });
  const unlockDay = ev.length ? ev[0].day : null;
  const unlockedByEvent = unlockDay !== null;
  const unlockedByMax = (d.maxWave || 0) >= 5;
  if (unlockedByMax && !unlockedByEvent) errors.push('maxWave5-no-unlock-event');
  const unlocked = unlockedByEvent || unlockedByMax;
  const last = series && series.length ? series[series.length - 1] : null;
  let firstFacedDay = null;
  if (series) {
    for (const r of series) { if ((r.w5 || 0) > 0) { firstFacedDay = r.d; break; } }
  }
  const kills5 = (d.waveKills && d.waveKills['5']) || 0;
  const kills4 = (d.waveKills && d.waveKills['4']) || 0;

  // Kind-filter correction check (frozen): wave5kill-b counted deaths rows
  // with who in the w5 set, no kind filter. Split them here.
  const w5rows = (d.deaths || []).filter(function (x) { return w5set.has(x.who); });
  const w5MonsterDeaths = w5rows.filter(function (x) { return x.kind === 'monster'; }).length;
  const w5VillagerDeaths = w5rows.filter(function (x) { return x.kind === 'villager' || x.kind === 'person'; }).length;
  const w5PlayerFlag = w5rows.filter(function (x) { return x.player; }).length;

  // vet5 drops.
  const drops = [];
  let rises = 0;
  let vet5AtUnlock = null;
  let vet5AtEnd = null;
  if (series) {
    if (last) vet5AtEnd = last.vet5 || 0;
    if (unlocked && unlockDay !== null) {
      const atUnlock = seriesAt(series, unlockDay);
      vet5AtUnlock = atUnlock ? (atUnlock.vet5 || 0) : null;
    }
    for (let i = 1; i < series.length; i++) {
      const prev = series[i - 1];
      const cur = series[i];
      const pv = prev.vet5 || 0;
      const cv = cur.vet5 || 0;
      if (cv > pv) rises += (cv - pv);
      if (cv >= pv) continue;
      const mag = pv - cv;
      const cands = (d.deaths || []).filter(function (x) {
        return (x.kind === 'villager' || x.kind === 'person') &&
          x.day >= prev.d && x.day <= cur.d;
      });
      const drop = {
        prevDay: prev.d, day: cur.d, magnitude: mag,
        unlockDay: unlockDay,
        daysAfterUnlock: unlockDay !== null ? (cur.d - unlockDay) : null,
        candidates: cands.map(function (x) {
          return { day: x.day, cause: x.cause || null, player: !!x.player };
        }),
        causeClass: null, deathDay: null, deathCause: null, scholarAtDeath: null,
        investigation: null
      };
      if (mag === 1 && cands.length === 1) {
        const c = cands[0];
        drop.deathDay = c.day;
        drop.deathCause = c.cause || null;
        drop.scholarAtDeath = !!c.player;
        const cause = (c.cause || '').toLowerCase();
        if (cause === 'monster') {
          drop.causeClass = (firstFacedDay !== null && c.day >= firstFacedDay) ? 'W5-ERA' : 'PRE-W5-ERA';
        } else if (cause === 'the wild') drop.causeClass = 'WILD';
        else if (cause === 'the expedition') drop.causeClass = 'ROAD-EXPEDITION';
        else if (cause === 'the arena') drop.causeClass = 'ARENA';
        else if (cause === 'contest') drop.causeClass = 'CONTEST';
        else if (cause === 'ambush') drop.causeClass = 'AMBUSH';
        else drop.causeClass = 'OTHER:' + (c.cause || 'unknown');
      } else if (cands.length === 0) {
        drop.causeClass = 'NON-DEATH-EXIT';
        drop.investigation = investigateGNonDeath(d, cur.d);
      } else {
        drop.causeClass = 'AMBIGUOUS';
      }
      drops.push(drop);
    }
  }
  const classCounts = {};
  drops.forEach(function (x) { classCounts[x.causeClass] = (classCounts[x.causeClass] || 0) + 1; });
  const classified = drops.filter(function (x) {
    return x.causeClass !== 'AMBIGUOUS' && x.causeClass !== 'NON-DEATH-EXIT';
  }).length;
  const unclassified = drops.length - classified;
  return {
    seed: seed, cls: 'G', errors: errors,
    days: d.days, endReason: d.endReason, maxWave: d.maxWave,
    unlocked: unlocked, unlockDay: unlockDay, firstFacedDay: firstFacedDay,
    facedDistinct: last ? (last.w5 || 0) : 0,
    kills5: kills5, kills4: kills4,
    w5rowsTotal: w5rows.length, w5MonsterDeaths: w5MonsterDeaths,
    w5VillagerDeaths: w5VillagerDeaths, w5PlayerFlag: w5PlayerFlag,
    vet5AtUnlock: vet5AtUnlock, vet5AtEnd: vet5AtEnd,
    vet5Rises: rises, dropsTotal: drops.length,
    drops: drops, classCounts: classCounts,
    classified: classified, unclassified: unclassified
  };
}

function investigateGNonDeath(d, day) {
  // A vet5 drop with no villager death in the window: look for a tribute
  // delivery / seat take near the day.
  const nearTable = ((d.tableChoices || []).filter(function (t) {
    return t && Math.abs((t.day | 0) - day) <= 2;
  }).map(function (t) { return { day: t.day, choice: t.choice || t.kind || null }; }));
  const nearSeat = ((d.seatTakes || []).filter(function (t) {
    return t && Math.abs((t.day | 0) - day) <= 2;
  }).map(function (t) { return { day: t.day }; }));
  return { nearTableChoices: nearTable.slice(0, 5), nearSeatTakes: nearSeat.slice(0, 5) };
}

// ---------------- driver ----------------

function analyzeDir(dir, monsters) {
  const files = fs.readdirSync(dir).filter(function (f) { return f.endsWith('.json'); }).sort();
  const perSeed = [];
  let parseErrors = 0;
  let cls = null;
  for (const f of files) {
    let d;
    try { d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); }
    catch (e) { parseErrors += 1; continue; }
    if (cls === null) cls = Array.isArray(d.daily) ? 'T' : 'G';
    if (cls === 'T') perSeed.push(analyzeTFile(d, monsters));
    else perSeed.push(analyzeGFile(d, monsters));
  }
  const pooled = poolLeg(perSeed, cls);
  return { dir: dir, cls: cls, files: files.length, parseErrors: parseErrors, perSeed: perSeed, pooled: pooled };
}

function poolLeg(perSeed, cls) {
  const classCounts = {};
  let exitsTotal = 0, classified = 0, unclassified = 0;
  let unlocked = 0, vet5AtUnlock2 = 0, vet5AtEnd0 = 0;
  let bornDead = 0, partyNonEmptyDays = 0;
  let veteranDaysTotal = 0, veteranDaysInParty = 0;
  let inPartyDeaths = 0, scholarDeaths = 0;
  const daysAfterUnlock = [];
  perSeed.forEach(function (s) {
    Object.keys(s.classCounts || {}).forEach(function (k) {
      classCounts[k] = (classCounts[k] || 0) + s.classCounts[k];
    });
    if (cls === 'T') {
      exitsTotal += s.exitsTotal;
      bornDead += s.bornDead.length;
      partyNonEmptyDays += s.partyNonEmptyDays || 0;
      veteranDaysTotal += s.veteranDaysTotal || 0;
      veteranDaysInParty += s.veteranDaysInParty || 0;
      s.exits.forEach(function (x) {
        if (x.inPartyAtLastSeen) inPartyDeaths += 1;
        if (x.scholarAtDeath) scholarDeaths += 1;
        if (x.daysAfterUnlock !== null && x.daysAfterUnlock !== undefined) {
          daysAfterUnlock.push(x.daysAfterUnlock);
        }
      });
    } else {
      exitsTotal += s.dropsTotal;
      s.drops.forEach(function (x) {
        if (x.scholarAtDeath) scholarDeaths += 1;
        if (x.daysAfterUnlock !== null && x.daysAfterUnlock !== undefined) {
          daysAfterUnlock.push(x.daysAfterUnlock);
        }
      });
    }
    classified += s.classified;
    unclassified += s.unclassified;
    if (s.unlocked) unlocked += 1;
    if (s.vet5AtUnlock === 2) vet5AtUnlock2 += 1;
    if (s.vet5AtEnd === 0) vet5AtEnd0 += 1;
  });
  return {
    seeds: perSeed.length, cls: cls, unlocked: unlocked,
    exitsTotal: exitsTotal, classified: classified, unclassified: unclassified,
    classifiedShare: exitsTotal ? +(classified / exitsTotal).toFixed(3) : null,
    classCounts: classCounts, bornDead: bornDead,
    vet5AtUnlock2: vet5AtUnlock2, vet5AtEnd0: vet5AtEnd0,
    partyNonEmptyDays: partyNonEmptyDays, inPartyDeaths: inPartyDeaths,
    veteranDaysTotal: veteranDaysTotal, veteranDaysInParty: veteranDaysInParty,
    scholarDeaths: scholarDeaths,
    medianDaysAfterUnlock: med(daysAfterUnlock),
    daysAfterUnlock: daysAfterUnlock.slice().sort(function (a, b) { return a - b; }),
    instrumentErrors: perSeed.reduce(function (a, s) { return a + (s.errors || []).length; }, 0)
  };
}

const isMain = require.main === module;
if (isMain) {
  const dirs = process.argv.slice(2);
  if (!dirs.length) {
    console.error('usage: node scripts/vetattrition-analyze-20261115.js <dir> [<dir> ...]');
    process.exit(2);
  }
  const monstersPath = path.join(__dirname, '..', 'src', 'data', 'monsters.json');
  const monsters = loadMonsterWaves(monstersPath);
  const out = { w5Ids: monsters.w5, w4Ids: monsters.w4, legs: [] };
  for (const dir of dirs) out.legs.push(analyzeDir(dir, monsters));
  // Grand pooled across legs.
  const grand = { exitsTotal: 0, classified: 0, unclassified: 0, classCounts: {} };
  out.legs.forEach(function (leg) {
    grand.exitsTotal += leg.pooled.exitsTotal;
    grand.classified += leg.pooled.classified;
    grand.unclassified += leg.pooled.unclassified;
    Object.keys(leg.pooled.classCounts).forEach(function (k) {
      grand.classCounts[k] = (grand.classCounts[k] || 0) + leg.pooled.classCounts[k];
    });
  });
  grand.classifiedShare = grand.exitsTotal ? +(grand.classified / grand.exitsTotal).toFixed(3) : null;
  out.grand = grand;
  console.log(JSON.stringify(out, null, 2));
}

module.exports = {
  loadMonsterWaves: loadMonsterWaves, analyzeTFile: analyzeTFile,
  analyzeGFile: analyzeGFile, analyzeDir: analyzeDir, poolLeg: poolLeg, med: med
};
