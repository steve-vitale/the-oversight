// analyze-gap3-b.js — Stage 1 DIAG for sim-gap3-b.
// Reads a gap3-driver corpus dir (per-seed files with `deaths` + `diag`)
// and:
//   (a) computes P1 (scholar `the wild` deaths per national-day) and gap
//       shares, same method as analyze-successorcaution-ceiling-b.js;
//   (b) decomposes every gap-3+ scholar `the wild` death: location class,
//       allies, wave/species, gap, bearer kills, trip context, HP at fight
//       start, and what the bot knew (codex/counter per monster + the
//       policy's own live race verdict);
//   (c) computes the first-order ceiling for scoped map-decline-only
//       (destination-forage fights the race declines) and the
//       episode-truncation ceiling for the same mechanism.
// Read-only; prints JSON to stdout.
// Usage: node scripts/analyze-gap3-b.js <corpus-dir>
'use strict';
const fs = require('fs');
const path = require('path');

const dir = process.argv[2];
if (!dir) { console.error('usage: node scripts/analyze-gap3-b.js <corpus-dir>'); process.exit(2); }
const files = fs.readdirSync(dir).filter(function (f) { return f.endsWith('.json'); }).sort();

function median(a) {
  if (!a.length) return null;
  const s = a.slice().sort(function (x, y) { return x - y; });
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
}

let totWild = 0, totNatDays = 0, totWildNat = 0, totPlayerDeaths = 0;
const gaps = { 0: 0, 1: 0, 2: 0, '3+': 0 };
const perSeed = [];
const gap3rows = [];       // established-bearer gap-3+ `the wild` scholar deaths
const firstDeathRows = []; // first scholar death per seed (no predecessor)
const allWildRows = [];    // every scholar `the wild` death, classified
let unmatchedWild = 0, ambiguousWild = 0, noSameDayFight = 0, raceErrs = 0, noCtxRaces = 0;

for (const f of files) {
  const r = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  const diag = r.diag || {};
  const fightsBySeq = {};
  for (const ft of (diag.fights || [])) fightsBySeq[ft.seq] = ft;
  const natDays = (r.series || []).filter(function (s) { return s.nationalLive; }).length;
  const natByDay = {};
  for (const s of (r.series || [])) natByDay[s.d] = !!s.nationalLive;
  // Haven occupancy runs from the daily series (v4 driver): consecutive
  // days the same species occupies (4,4) at snapshot time.
  const havenRuns = [];
  let curRun = null;
  for (const s of (r.series || [])) {
    const mon = s.havenMon || null;
    if (mon && curRun && curRun.species === mon && s.d === curRun.end + 1) curRun.end = s.d;
    else {
      if (curRun) havenRuns.push(curRun);
      curRun = mon ? { species: mon, start: s.d, end: s.d } : null;
    }
  }
  if (curRun) havenRuns.push(curRun);
  // GAP3 v5: raid drafts + daily lingerer lists (absent in v3/v4 files).
  const raids = (r.diag && r.diag.raids) || [];
  const lingerByDay = {};
  let hasLingerSeries = false;
  for (const s of (r.series || [])) {
    if (s.lingerers) { lingerByDay[s.d] = s.lingerers; hasLingerSeries = true; }
  }
  const playerDeaths = (r.deaths || []).filter(function (d) { return d.player; })
    .sort(function (a, b) { return (a.day - b.day); });
  const wild = playerDeaths.filter(function (d) { return d.cause === 'the wild'; });
  let wildNat = 0;
  for (const d of wild) if (natByDay[d.day]) wildNat += 1;
  // Gaps over ALL player deaths (any cause): succession follows every
  // scholar death. First death has no predecessor (original bearer).
  const gapOf = {};
  let prevDay = null;
  for (const d of playerDeaths) {
    gapOf[d.day + '|' + d.who + '|' + d.cause] = (prevDay === null) ? null : (d.day - prevDay);
    prevDay = d.day;
  }
  const seedGaps = { 0: 0, 1: 0, 2: 0, '3+': 0 };
  for (const d of wild) {
    const g = gapOf[d.day + '|' + d.who + '|' + d.cause];
    if (g === null) seedGaps['3+'] += 1;
    else if (g <= 0) seedGaps[0] += 1;
    else if (g === 1) seedGaps[1] += 1;
    else if (g === 2) seedGaps[2] += 1;
    else seedGaps['3+'] += 1;
  }
  for (const k of Object.keys(gaps)) gaps[k] += seedGaps[k];

  // Join each wild scholar death to its diag death row (same day+who+cause),
  // then to the full fight row via lastFight.seq.
  const diagDeaths = diag.deaths || [];
  for (const d of wild) {
    const cands = diagDeaths.filter(function (x) {
      return x.day === d.day && x.who === d.who && x.cause === d.cause;
    });
    let dd = null, match = 'unmatched';
    if (cands.length === 1) { dd = cands[0]; match = 'matched'; }
    else if (cands.length > 1) {
      const sameDay = cands.filter(function (x) { return x.lastFight && x.lastFight.day === d.day; });
      dd = (sameDay[0] || cands[0]); match = 'ambiguous'; ambiguousWild += 1;
    } else { unmatchedWild += 1; }
    const g = gapOf[d.day + '|' + d.who + '|' + d.cause];
    const gapClass = (g === null) ? 'first' : (g <= 0 ? '0' : (g === 1 ? '1' : (g === 2 ? '2' : '3+')));
    const lf = dd && dd.lastFight;
    const ft = (lf && lf.seq) ? fightsBySeq[lf.seq] : null;
    // Fights can span midnight (death day = fight day + 1); lastFight is by
    // construction the most recent combat_start before the death tele, so a
    // 1-day lag is a valid linkage, not a join failure.
    const dayLag = ft ? (d.day - ft.day) : null;
    const sameDayFight = dayLag === 0;
    if (dayLag === null || dayLag > 1 || dayLag < 0) noSameDayFight += 1;
    // Location class.
    let loc = 'unknown';
    let destKind = null;
    if (ft) {
      if (ft.insideHaven) loc = 'haven-inside';
      else if (ft.px === 4 && ft.py === 4) loc = 'haven-grounds';
      else if (ft.lastTravel && ft.px === ft.lastTravel.toX && ft.py === ft.lastTravel.toY) {
        loc = 'dest';
        destKind = (ft.tileType !== 'haven' && ft.tileType !== 'ruin' && (ft.tileStock || 0) > 0) ? 'forage' : 'other';
      } else if (ft.lastTravel && ft.lastTravel.retKind === 'null' && ft.px === ft.lastTravel.fromX && ft.py === ft.lastTravel.fromY) {
        loc = 'non-dest-parting'; // travel aborted (parting turn), fight on the tile left
      } else loc = 'non-dest';
    }
    // Race verdict + knowledge (from the full fight row).
    let raceDecline = null, raceDetail = null, raceErr = (ft && ft.raceErr) || (ft ? null : 'no-fight');
    if (ft && ft.race) { raceDecline = !!ft.race.decline; raceDetail = ft.race.detail || null; }
    if (raceErr === 'no-ctx') noCtxRaces += 1;
    if (raceErr && raceErr !== 'no-ctx' && raceErr !== 'no-fight') raceErrs += 1;
    const mons = (ft && ft.monsters) || [];
    const allKnown = mons.length ? mons.every(function (m) { return m.codexKnown; }) : null;
    const anyCounter = mons.length ? mons.some(function (m) { return m.counterKnown; }) : null;
    // Haven-arrival mechanism (haven-grounds / haven-inside fights only):
    // was the killer already ON the destination tile when the scholar's
    // last travel began (waiting), was it on the tile left (follower
    // candidate), or did it arrive after the scholar (chase/wander/spawn)?
    // monAtDestBefore is null in files from the pre-v2 driver (unknown).
    let havenMech = null;
    let havenOccDays = null, havenOccGap = null;
    let raidDraftLag = null, lingeringAtDeath = null, raidClass = null;
    if (ft && (loc === 'haven-grounds' || loc === 'haven-inside')) {
      const lt = ft.lastTravel || {};
      const keys = (lf && lf.monsterKeys) || [];
      if (lt.monAtDestBefore === undefined) havenMech = 'unknown-old-driver';
      else if (lt.monAtDestAfter && keys.indexOf(lt.monAtDestAfter) >= 0 && !(lt.monAtDestBefore && keys.indexOf(lt.monAtDestBefore) >= 0)) havenMech = 'restored-during-arrival';
      else if (lt.monAtDestBefore && keys.indexOf(lt.monAtDestBefore) >= 0) havenMech = 'waiting-on-tile';
      else if (lt.monAtFromBefore && keys.indexOf(lt.monAtFromBefore) >= 0) havenMech = 'was-on-departure-tile';
      else if (lt.monAtDestBefore) havenMech = 'other-monster-waiting';
      else havenMech = 'arrived-after-scholar';
      // Occupancy: latest run of the killer species ending on/before the
      // death day (series is end-of-day snapshots; the death day's own row
      // may be absent when the village died mid-day).
      if (keys.length) {
        let best = null;
        for (const run of havenRuns) {
          if (run.species === keys[0] && run.end <= d.day && (!best || run.end > best.end)) best = run;
        }
        if (best) { havenOccDays = best.end - best.start + 1; havenOccGap = d.day - best.end; }
      }
      // GAP3 v5: raid-born join. A raid drafts the nearest living world
      // monsters and teleports them onto Haven's tile; unmet raiders
      // linger ~6 nights. raidDraftLag = days from the most recent raid
      // draft containing the killer to the death; lingeringAtDeath =
      // killer in the daily lingerer list on the death day or the day
      // before. (v3/v4 files have no raids/series.lingerers: both stay
      // null and raidClass reads 'no-v5-data', never 'neither'.)
      if (keys.length) {
        const killer = keys[0];
        let bestLag = null;
        for (const rd of raids) {
          if ((rd.raiderIds || []).indexOf(killer) >= 0 && rd.day <= d.day) {
            const lag = d.day - rd.day;
            if (bestLag === null || lag < bestLag) bestLag = lag;
          }
        }
        raidDraftLag = bestLag;
        const ling = (lingerByDay[d.day] || []).concat(lingerByDay[d.day - 1] || []);
        lingeringAtDeath = ling.indexOf(killer) >= 0;
        if (raids.length === 0 && !hasLingerSeries) raidClass = 'no-v5-data';
        else if (raidDraftLag !== null && raidDraftLag <= 14 && lingeringAtDeath) raidClass = 'raid-born-lingering';
        else if (raidDraftLag !== null && raidDraftLag <= 14) raidClass = 'raid-born';
        else if (lingeringAtDeath) raidClass = 'lingering-only';
        else raidClass = 'neither';
      }
    }
    const row = {
      seed: r.seed, day: d.day, gap: g, gapClass: gapClass,
      victim: d.who, whileNational: !!natByDay[d.day],
      bearerKills: dd ? dd.bearerKills : null,
      bearerFighter: (dd && dd.bearerKills !== null && dd.bearerKills !== undefined) ? (dd.bearerKills > 0 ? 'fighter' : 'never-killed') : 'unknown',
      bearerAbilities: dd ? dd.bearerAbilities : null,
      match: match,
      fight: ft ? {
        seq: ft.seq, day: ft.day, sameDay: sameDayFight, dayLag: dayLag,
        havenMech: havenMech, havenOccDays: havenOccDays, havenOccGap: havenOccGap,
        raidDraftLag: raidDraftLag, lingeringAtDeath: lingeringAtDeath, raidClass: raidClass,
        vs: ft.vs, wave: ft.wave, pack: ft.pack, php: ft.php,
        scholarHp: ft.scholarHp, mx: ft.mx, my: ft.my, px: ft.px, py: ft.py,
        tileType: ft.tileType, tileRevealed: ft.tileRevealed, tileStock: ft.tileStock,
        insideHaven: ft.insideHaven,
        nFighters: Array.isArray(ft.fighters) ? ft.fighters.length : null,
        nAllies: Array.isArray(ft.fighters) ? ft.fighters.filter(function (x) { return x && (x.kind === 'villager' || x.kind === 'ally'); }).length : null,
        monsterKeys: Array.isArray(ft.fighters) ? ft.fighters.filter(function (x) { return x && x.kind === 'monster'; }).map(function (x) { return x.monsterId || x.name; }) : null,
        loc: loc, destKind: destKind,
        lastTravel: ft.lastTravel,
        raceDecline: raceDecline, raceErr: raceErr,
        raceDetail: raceDetail,
        monsters: mons.map(function (m) { return { mid: m.mid, hp: m.hp, stance: m.stance, codexStage: m.codexStage, codexKnown: m.codexKnown, counterKnown: m.counterKnown, dpr: m.dpr }; }),
        allCodexKnown: allKnown, anyCounterKnown: anyCounter,
      } : null,
      // Addressable flags (scoped map-decline-only family):
      // destination-forage fight the policy's own race declines.
      mapDeclineCandidate: (loc === 'dest' && destKind === 'forage' && raceDecline === true),
      mapDeclineKnownOnly: (loc === 'dest' && destKind === 'forage' && raceDecline === true && allKnown === true),
    };
    allWildRows.push(row);
    if (gapClass === '3+') gap3rows.push(row);
    else if (gapClass === 'first') firstDeathRows.push(row);
  }
  totWild += wild.length; totNatDays += natDays; totWildNat += wildNat;
  totPlayerDeaths += playerDeaths.length;
  perSeed.push({ seed: r.seed, days: r.days, endReason: r.endReason,
    natDays: natDays, playerDeaths: playerDeaths.length,
    wildScholar: wild.length, wildScholarNat: wildNat,
    p1: natDays ? +(wildNat / natDays).toFixed(3) : null,
    gaps: seedGaps,
    diagFights: (diag.fights || []).length, diagDeaths: diagDeaths.length,
    diagSuccessions: (diag.successions || []).length, diagTravels: (diag.travels || []).length,
    barrierExits: (diag.barrierExits | 0),
    instrumentErrors: (r.instrumentErrors || []).length });
}

// ---- tallies over gap-3+ established-bearer deaths ----
function tally(rows, keyFn) {
  const t = {};
  for (const row of rows) {
    const k = keyFn(row);
    t[k] = (t[k] || 0) + 1;
  }
  return t;
}
const g3 = gap3rows;
const g3Nat = g3.filter(function (x) { return x.whileNational; });
const locTally = tally(g3, function (x) { return x.fight ? (x.fight.loc + (x.fight.destKind ? ':' + x.fight.destKind : '')) : 'no-fight'; });
const waveTally = tally(g3, function (x) { return x.fight ? ('w' + x.fight.wave) : 'no-fight'; });
const alliesTally = tally(g3, function (x) { return x.fight ? ('allies=' + x.fight.nAllies) : 'no-fight'; });
const fighterTally = tally(g3, function (x) { return x.bearerFighter; });
const speciesTally = tally(g3, function (x) {
  return (x.fight && x.fight.monsterKeys) ? x.fight.monsterKeys.join('+') : 'no-fight';
});
const raceTally = tally(g3, function (x) {
  if (!x.fight) return 'no-fight';
  if (x.fight.raceErr) return 'race-err:' + x.fight.raceErr;
  return x.fight.raceDecline ? 'decline' : 'hold';
});
const knownTally = tally(g3, function (x) {
  if (!x.fight || !x.fight.monsters || !x.fight.monsters.length) return 'no-monsters';
  return x.fight.allCodexKnown ? 'all-known' : (x.fight.monsters.some(function (m) { return m.codexKnown; }) ? 'some-known' : 'none-known');
});
const havenMechTally = tally(g3, function (x) {
  if (!x.fight) return 'no-fight';
  if (x.fight.loc !== 'haven-grounds' && x.fight.loc !== 'haven-inside') return 'not-haven';
  return x.fight.havenMech || 'unknown';
});
const allWildHavenMech = tally(allWildRows, function (x) {
  if (!x.fight) return 'no-fight';
  if (x.fight.loc !== 'haven-grounds' && x.fight.loc !== 'haven-inside') return 'not-haven';
  return x.fight.havenMech || 'unknown';
});
const raidClassTally = tally(g3, function (x) {
  if (!x.fight) return 'no-fight';
  if (x.fight.loc !== 'haven-grounds' && x.fight.loc !== 'haven-inside') return 'not-haven';
  return x.fight.raidClass || 'unknown';
});
const allWildRaidClass = tally(allWildRows, function (x) {
  if (!x.fight) return 'no-fight';
  if (x.fight.loc !== 'haven-grounds' && x.fight.loc !== 'haven-inside') return 'not-haven';
  return x.fight.raidClass || 'unknown';
});
const allWildLoc = tally(allWildRows, function (x) { return x.fight ? (x.fight.loc + (x.fight.destKind ? ':' + x.fight.destKind : '')) : 'no-fight'; });
const hpList = g3.map(function (x) { return (x.fight && x.fight.php !== null && x.fight.php !== undefined) ? x.fight.php : null; }).filter(function (x) { return x !== null; }).sort(function (a, b) { return a - b; });
const gapList = g3.map(function (x) { return x.gap; }).sort(function (a, b) { return a - b; });

// ---- ceilings for scoped map-decline-only ----
// First-order: directly-preventable while-national deaths (dest-forage +
// race declines), and the codex-known-only subset. Assumes NO replacement
// (successorcaution showed gap-0 replacement — the honest ceiling notes it).
const prevNat = g3Nat.filter(function (x) { return x.mapDeclineCandidate; }).length;
const prevKnownNat = g3Nat.filter(function (x) { return x.mapDeclineKnownOnly; }).length;
const prevAll = g3.filter(function (x) { return x.mapDeclineCandidate; }).length;
// Episode-truncation: preventing a death also prevents every later `the
// wild` death in the same episode (episode breaks at gap >= 3). Computed
// over ALL wild scholar deaths per seed, in day order.
let epPrevNat = 0, epPrevKnownNat = 0;
const bySeed = {};
for (const row of allWildRows) { (bySeed[row.seed] = bySeed[row.seed] || []).push(row); }
for (const seed of Object.keys(bySeed)) {
  const rows = bySeed[seed].sort(function (a, b) { return a.day - b.day; });
  let ep = [];
  const flush = function () {
    if (!ep.length) return;
    const idx = ep.findIndex(function (x) { return x.mapDeclineCandidate; });
    if (idx >= 0) for (let i = idx; i < ep.length; i++) if (ep[i].whileNational) epPrevNat += 1;
    const idxK = ep.findIndex(function (x) { return x.mapDeclineKnownOnly; });
    if (idxK >= 0) for (let i = idxK; i < ep.length; i++) if (ep[i].whileNational) epPrevKnownNat += 1;
    ep = [];
  };
  for (const row of rows) {
    if (ep.length && row.gap !== null && row.gap >= 3) flush();
    if (ep.length && row.gapClass === 'first') flush();
    ep.push(row);
  }
  flush();
}

console.log(JSON.stringify({
  corpus: dir, seeds: files.length,
  pooledP1: totNatDays ? +(totWildNat / totNatDays).toFixed(4) : null,
  totalWildScholar: totWild, totalWildScholarNat: totWildNat, totalNatDays: totNatDays,
  totalPlayerDeaths: totPlayerDeaths,
  gaps: gaps,
  gapShare: { gap0: +(gaps[0] / Math.max(1, totWild)).toFixed(3),
    gap12: +((gaps[1] + gaps[2]) / Math.max(1, totWild)).toFixed(3),
    gap3plus: +(gaps['3+'] / Math.max(1, totWild)).toFixed(3) },
  joinQuality: { unmatchedWild: unmatchedWild, ambiguousWild: ambiguousWild,
    noSameDayFight: noSameDayFight, raceErrs: raceErrs, noCtxRaces: noCtxRaces },
  perSeed: perSeed,
  gap3: {
    n: g3.length, nNat: g3Nat.length,
    firstDeathsWild: firstDeathRows.length,
    loc: locTally, wave: waveTally, allies: alliesTally,
    bearer: fighterTally, species: speciesTally, race: raceTally, knowledge: knownTally,
    havenMech: havenMechTally, allWildLoc: allWildLoc, allWildHavenMech: allWildHavenMech,
    raidClass: raidClassTally, allWildRaidClass: allWildRaidClass,
    php: { n: hpList.length, min: hpList[0] !== undefined ? hpList[0] : null,
      median: hpList.length ? hpList[Math.floor(hpList.length / 2)] : null,
      max: hpList.length ? hpList[hpList.length - 1] : null,
      fullHp98plus: hpList.filter(function (x) { return x >= 98; }).length },
    gapDays: { min: gapList[0], median: gapList.length ? gapList[Math.floor(gapList.length / 2)] : null, max: gapList[gapList.length - 1] },
    mapDeclineCandidates: g3.filter(function (x) { return x.mapDeclineCandidate; }).length,
    mapDeclineKnownOnly: g3.filter(function (x) { return x.mapDeclineKnownOnly; }).length,
  },
  ceiling: {
    // First-order (no replacement assumed; successorcaution showed
    // replacement happens — treat as optimistic).
    preventableNat: prevNat, preventableKnownOnlyNat: prevKnownNat, preventableAll: prevAll,
    ceilingP1: totNatDays ? +((totWildNat - prevNat) / totNatDays).toFixed(4) : null,
    ceilingP1xControl: totWildNat ? +((totWildNat - prevNat) / totWildNat).toFixed(3) : null,
    ceilingKnownOnlyP1: totNatDays ? +((totWildNat - prevKnownNat) / totNatDays).toFixed(4) : null,
    ceilingKnownOnlyP1xControl: totWildNat ? +((totWildNat - prevKnownNat) / totWildNat).toFixed(3) : null,
    // Episode-truncation (preventing one death prevents its episode followers).
    episodePreventableNat: epPrevNat, episodePreventableKnownOnlyNat: epPrevKnownNat,
    episodeCeilingP1: totNatDays ? +((totWildNat - epPrevNat) / totNatDays).toFixed(4) : null,
    episodeCeilingP1xControl: totWildNat ? +((totWildNat - epPrevNat) / totWildNat).toFixed(3) : null,
    episodeKnownOnlyCeilingP1: totNatDays ? +((totWildNat - epPrevKnownNat) / totNatDays).toFixed(4) : null,
    episodeKnownOnlyCeilingP1xControl: totWildNat ? +((totWildNat - epPrevKnownNat) / totWildNat).toFixed(3) : null,
    goBar: 0.6,
    firstOrderMeetsBar: totWildNat ? (((totWildNat - prevNat) / totWildNat) <= 0.6) : null,
    knownOnlyMeetsBar: totWildNat ? (((totWildNat - prevKnownNat) / totWildNat) <= 0.6) : null,
    episodeMeetsBar: totWildNat ? (((totWildNat - epPrevNat) / totWildNat) <= 0.6) : null,
  },
  gap3rows: g3,
  allWildRows: allWildRows,
}, null, 2));
