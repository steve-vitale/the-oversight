// firstkiller-analyze-20261107.js — first-killer death classification
// (arm sim-firstkiller-b, run fleshout-loop-b-20261107T0530Z). Pure
// function over stageally-shaped per-seed corpus JSON (the
// firstkiller-driver replays band 53001-53008 with the stageally
// instrument verbatim). For EVERY first killer (first wave-4+ kill by
// that villager, per seed, per leg) it records: kill day / wave /
// monster / via, death day, death cause channel WITH the quoted death
// record, kill-to-death days, scholar-at-death or not, scholar-at-kill
// or not, alive-at-horizon (censored). Plus second-killer production
// timing (gap first kill -> first kill by a different killer).
//
// RECORDER RULE (pyrrhic lesson, sim-pyrrhic-b): fates are built from
// state.waveKillLog read at finalize — the authoritative log, which
// INCLUDES the pyrrhic direct-write path (recordPyrrhicKill bypasses
// recordWaveKill) and kills whose fight never closed through tbEnd.
// NEVER from killsLive or tbEnd outcomes alone. A kill in the log with
// no live row still makes its killer a first killer; liveMissing is
// reported, never silently filled.
//
// CHANNEL TAXONOMY (priority order — the arena and starvation splits
// are this arm's additions over killersurvive-analyze-20261106, which
// folded arena bouts into TB-fight):
//   arena-bout:<mid>        scholarDeaths causeArg 'the arena'
//   TB-fight:<mid>           TB fight row, scholar died in it
//   field-fight:<mid>        field fight row in which this villager died
//   contest                  scholarDeaths causeArg 'contest', not in combat
//   starvation                causeArg / fallen cause naming starvation|hunger|thirst
//   at-home-not-combat / on-road-not-combat
//   fallen-monster:<name> / fallen:<cause>
//   unmatched                 no record explains the death day (counts against coverage)
//   alive-at-end              censored, not a death
// NOTE on coverage: through analyzeRow, 'unmatched' is near-unreachable
// — killerFates derives deathDay FROM the fallen record, so a dead killer
// always has a fallen row and the fallen rule fires before the unmatched
// fallback. The coverage bar therefore guards the analyzer against a NEW
// recorder failure mode rather than discriminating on this corpus; see
// the evidence file's metric review for the proposed revision.
// Usage:
//   node scripts/firstkiller-analyze-20261107.js <corpusDir> [prefix]
//   prefix defaults to 'firstkiller-s' (matches
//   firstkiller-s<seed>-firstkiller-<policy>.json).
// Prints a JSON summary. Exits 1 on instrument errors; unmatched deaths
// do NOT exit 1 — they count against the preregged coverage metric.
'use strict';
const fs = require('fs');
const path = require('path');
const KD = require('./killerdeath-analyze-20261105');
const KS = require('./killersurvive-analyze-20261106');

function median(nums) {
  if (!nums.length) return null;
  const s = nums.slice().sort(function (a, b) { return a - b; });
  return (s[Math.floor((s.length - 1) / 2)] + s[Math.ceil((s.length - 1) / 2)]) / 2;
}

function filesFor(dir, prefix) {
  return fs.readdirSync(dir).filter(function (f) {
    return f.indexOf(prefix) === 0 && f.endsWith('.json');
  }).sort().map(function (f) { return path.join(dir, f); });
}

const STARVE_RE = /starv|hunger|thirst/i;

function starveHit(row, fate, base) {
  const cands = [];
  if (base.scholarCtx && base.scholarCtx.causeArg) cands.push(base.scholarCtx.causeArg);
  if (base.fallenRow && base.fallenRow.cause) cands.push(base.fallenRow.cause);
  if (fate.deathCauseRaw) cands.push(fate.deathCauseRaw);
  for (let i = 0; i < cands.length; i++) {
    if (STARVE_RE.test(String(cands[i]))) return String(cands[i]);
  }
  return null;
}

// First-killer death channel: KS.deathChannel plus the arena and
// starvation splits. Returns { channel, detail, quote } where quote
// carries the raw death record(s) for the evidence file.
function firstKillerChannel(row, fate) {
  const base = KS.deathChannel(row, fate);
  const quote = { scholarDeath: base.scholarCtx || null, fallen: base.fallenRow || null,
    tbRow: base.tbRow || null, fieldRow: base.fieldRow || null };
  if (base.channel === 'alive-at-end') {
    return { channel: 'alive-at-end', detail: base.detail, quote: quote,
      partyAtDeath: base.partyAtDeath, scholarCtx: base.scholarCtx,
      tbRow: base.tbRow, fieldRow: base.fieldRow, fallenRow: base.fallenRow };
  }
  // 1. Arena bout: the scholarDeaths causeArg says 'the arena'. The tb
  // row (when present) names the bout's monster; without one the mid
  // is unknown but the channel is still the arena.
  if (base.scholarCtx && base.scholarCtx.causeArg === 'the arena') {
    const mid = base.tbRow ? base.tbRow.mid : (base.fieldRow ? base.fieldRow.mid : '?');
    return { channel: 'arena-bout:' + mid,
      detail: 'arena bout day ' + base.deathDay + ' vs ' + mid +
        ', causeArg=' + JSON.stringify(base.scholarCtx.causeArg) +
        ', inCombat=' + base.scholarCtx.inCombat + ', atHaven=' + base.scholarCtx.atHaven,
      quote: quote, partyAtDeath: base.partyAtDeath, scholarCtx: base.scholarCtx,
      tbRow: base.tbRow, fieldRow: base.fieldRow, fallenRow: base.fallenRow };
  }
  // 2. Starvation: a starvation-family cause on the scholar-death record
  // or the fallen record. Checked before the at-home/on-road rules,
  // which would otherwise swallow it (a starving scholar dies not-in-combat).
  const starve = starveHit(row, fate, base);
  if (starve) {
    return { channel: 'starvation',
      detail: 'starvation-family death day ' + base.deathDay + ', cause=' + JSON.stringify(starve) +
        (base.scholarCtx ? ', inCombat=' + base.scholarCtx.inCombat + ', atHaven=' + base.scholarCtx.atHaven : ''),
      quote: quote, partyAtDeath: base.partyAtDeath, scholarCtx: base.scholarCtx,
      tbRow: base.tbRow, fieldRow: base.fieldRow, fallenRow: base.fallenRow };
  }
  return { channel: base.channel, detail: base.detail, quote: quote,
    partyAtDeath: base.partyAtDeath, scholarCtx: base.scholarCtx,
    tbRow: base.tbRow, fieldRow: base.fieldRow, fallenRow: base.fallenRow };
}

function channelTop(channel) {
  if (!channel) return '?';
  if (channel === 'alive-at-end') return 'alive-at-end';
  return channel.split(':')[0];
}

// One seed's first-killer table + second-killer production timing.
// Built ONLY from the waveKillLog (authoritative) + fallen /
// scholarDeaths / deadMap / killerTrack — never from killsLive alone.
function analyzeRow(row) {
  const fates = KD.killerFates(row);
  const w4 = (row.waveKillLog || []).filter(function (e) { return (e.w | 0) >= 4; });
  const firstBloodDay = w4.length ? Math.min.apply(null, w4.map(function (e) { return e.d | 0; })) : null;
  const firstKiller = firstBloodDay != null ?
    (w4.filter(function (e) { return (e.d | 0) === firstBloodDay; })[0] || {}).by : null;
  // First-kill info per killer, from the LOG (pyrrhic-safe).
  const firstKillInfo = {};
  w4.forEach(function (e) {
    const cur = firstKillInfo[e.by];
    if (!cur || (e.d | 0) < (cur.day | 0)) {
      firstKillInfo[e.by] = { day: e.d | 0, wave: e.w | 0, mid: e.mid, via: e.via };
    }
  });
  // killsLive lookup for scholar-at-kill (live rows only; a pyrrhic kill
  // has no live row — fall back to via 'player', which means the scholar
  // landed it, and flag the fallback).
  const liveByKey = {};
  (row.killsLive || []).forEach(function (k) {
    if (((k.wave | 0) >= 4)) liveByKey[k.day + '|' + k.mid + '|' + k.by] = k;
  });
  const firstKillers = fates.filter(function (fate) { return fate.by === firstKiller; }).map(function (fate) {
    const info = firstKillInfo[fate.by] || { day: fate.firstDay, wave: null, mid: null, via: null };
    const ch = firstKillerChannel(row, fate);
    const liveRow = liveByKey[info.day + '|' + info.mid + '|' + fate.by] || null;
    const scholarAtKill = liveRow ? !!liveRow.scholarChannel : (info.via === 'player');
    const scholarAtKillViaLive = liveRow != null;
    const scholarAtDeath = ch.scholarCtx != null;
    return {
      seed: row.seed, policy: row.policy || null, by: fate.by,
      killDay: info.day, killWave: info.wave, killMid: info.mid, killVia: info.via,
      kills: fate.kills, lastKillDay: fate.lastDay,
      deathDay: fate.deathDay, killToDeathDays: fate.killToDeathDays,
      aliveAtEnd: fate.aliveAtEnd,
      scholarAtKill: scholarAtKill, scholarAtKillViaLive: scholarAtKillViaLive,
      scholarAtDeath: scholarAtDeath,
      channel: ch.channel, channelTop: channelTop(ch.channel), channelDetail: ch.detail,
      deathQuote: ch.quote, partyAtDeath: ch.partyAtDeath,
      deathCauseRaw: fate.deathCauseRaw, deathCauseSplit: fate.deathCauseSplit,
      liveMissing: fate.liveMissing,
    };
  });
  // Second-killer production timing: distinct killers by first-kill day.
  const distinctFirsts = Object.keys(firstKillInfo).map(function (by) {
    return { by: by, day: firstKillInfo[by].day };
  }).sort(function (a, b) { return a.day - b.day; });
  const sortedKills = w4.slice().sort(function (a, b) { return (a.d | 0) - (b.d | 0); });
  const secondKillerGap = distinctFirsts.length >= 2 ? distinctFirsts[1].day - distinctFirsts[0].day : null;
  const secondKillGap = sortedKills.length >= 2 ? (sortedKills[1].d | 0) - (sortedKills[0].d | 0) : null;
  return {
    seed: row.seed, policy: row.policy || null, run: row.run || null,
    days: row.days, endReason: row.endReason, won: !!row.won,
    scaleRank: row.scaleRank, maxWave: row.maxWave, unlockedWave: row.unlockedWave,
    standing: row.standing,
    w4kills: w4.length,
    w5kills: (row.waveKillLog || []).filter(function (e) { return (e.w | 0) === 5; }).length,
    firstKillers: firstKillers,
    firstKillerCount: firstKillers.length,
    secondKillerGap: secondKillerGap,
    secondKillGap: secondKillGap,
    distinctKillers: distinctFirsts.length,
    instrumentErrors: (row.instrumentErrors || []).length,
  };
}

function analyzeLeg(rows) {
  const seeds = rows.map(analyzeRow);
  const firsts = [];
  seeds.forEach(function (s) { s.firstKillers.forEach(function (k) { firsts.push(k); }); });
  const dead = firsts.filter(function (k) { return !k.aliveAtEnd && k.killToDeathDays != null; });
  const censored = firsts.filter(function (k) { return k.aliveAtEnd; });
  const classified = dead.filter(function (k) { return k.channel !== 'unmatched'; });
  const channelCounts = {}, topCounts = {};
  dead.forEach(function (k) {
    channelCounts[k.channel] = (channelCounts[k.channel] | 0) + 1;
    topCounts[k.channelTop] = (topCounts[k.channelTop] | 0) + 1;
  });
  let top = null, topN = 0;
  Object.keys(topCounts).forEach(function (c) {
    if (topCounts[c] > topN) { top = c; topN = topCounts[c]; }
  });
  const gaps = seeds.map(function (s) { return s.secondKillerGap; }).filter(function (g) { return g != null; });
  const killGaps = seeds.map(function (s) { return s.secondKillGap; }).filter(function (g) { return g != null; });
  const wall = { wins: 0, national: 0, table: 0, wave4unlocks: 0, wave5unlocks: 0,
    wave4faced: 0, wave5faced: 0, medianDays: null };
  rows.forEach(function (r) {
    if (r.won) wall.wins++;
    if (r.scaleRank === 'national' || r.scaleRank === 'global') wall.national++;
    if ((r.unlockedWave | 0) >= 4) wall.wave4unlocks++;
    if ((r.unlockedWave | 0) >= 5) wall.wave5unlocks++;
    if ((r.fights || []).some(function (f) { return (f.wave | 0) >= 4; })) wall.wave4faced++;
    if ((r.fights || []).some(function (f) { return (f.wave | 0) >= 5; })) wall.wave5faced++;
  });
  wall.medianDays = median(seeds.map(function (s) { return s.days; }));
  return {
    n: seeds.length,
    instrumentErrors: seeds.reduce(function (m, s) { return m + s.instrumentErrors; }, 0),
    firstKillers: firsts.length,
    firstKillerDeaths: dead.length,
    firstKillerCensored: censored.length,
    classified: classified.length,
    coverage: dead.length ? classified.length / dead.length : null,
    channelCounts: channelCounts, topCounts: topCounts,
    dominantTop: top, dominantTopCount: topN,
    dominantTopShare: classified.length ? topN / classified.length : null,
    killToDeathMedian: median(dead.map(function (k) { return k.killToDeathDays; })),
    killToDeathDays: dead.map(function (k) { return k.killToDeathDays; }).sort(function (a, b) { return a - b; }),
    scholarAtDeathCount: dead.filter(function (k) { return k.scholarAtDeath; }).length,
    scholarAtKillCount: firsts.filter(function (k) { return k.scholarAtKill; }).length,
    secondKillerGaps: gaps.sort(function (a, b) { return a - b; }),
    secondKillerGapMedian: median(gaps),
    secondKillGapMedian: median(killGaps),
    seedsWithSecondKiller: gaps.length,
    wall: wall,
    seeds: seeds, firstKillersTable: firsts,
  };
}

function analyzeDir(dir, prefix) {
  const files = filesFor(dir, prefix);
  const rows = files.map(function (f) { return JSON.parse(fs.readFileSync(f, 'utf8')); });
  const byPolicy = {};
  rows.forEach(function (r) {
    const p = r.policy || '?';
    (byPolicy[p] = byPolicy[p] || []).push(r);
  });
  const legs = {};
  Object.keys(byPolicy).sort().forEach(function (p) { legs[p] = analyzeLeg(byPolicy[p]); });
  const allFirsts = [];
  Object.keys(legs).forEach(function (p) { legs[p].firstKillersTable.forEach(function (k) { allFirsts.push(k); }); });
  const allDead = allFirsts.filter(function (k) { return !k.aliveAtEnd && k.killToDeathDays != null; });
  const allClassified = allDead.filter(function (k) { return k.channel !== 'unmatched'; });
  const pooledTop = {};
  allDead.forEach(function (k) { pooledTop[k.channelTop] = (pooledTop[k.channelTop] | 0) + 1; });
  let pTop = null, pTopN = 0;
  Object.keys(pooledTop).forEach(function (c) {
    if (pooledTop[c] > pTopN) { pTop = c; pTopN = pooledTop[c]; }
  });
  const pooledChannelCounts = {};
  allDead.forEach(function (k) { pooledChannelCounts[k.channel] = (pooledChannelCounts[k.channel] | 0) + 1; });
  return {
    corpusDir: dir, n: rows.length,
    instrumentErrors: rows.reduce(function (m, r) { return m + (r.instrumentErrors || []).length; }, 0),
    legs: legs,
    pooled: {
      firstKillers: allFirsts.length,
      firstKillerDeaths: allDead.length,
      firstKillerCensored: allFirsts.filter(function (k) { return k.aliveAtEnd; }).length,
      classified: allClassified.length,
      coverage: allDead.length ? allClassified.length / allDead.length : null,
      channelCounts: pooledChannelCounts, topCounts: pooledTop,
      dominantTop: pTop, dominantTopCount: pTopN,
      dominantTopShare: allClassified.length ? pTopN / allClassified.length : null,
      killToDeathMedian: median(allDead.map(function (k) { return k.killToDeathDays; })),
      unmatched: allDead.filter(function (k) { return k.channel === 'unmatched'; }).map(function (k) { return k.seed + ':' + k.policy + ':' + k.by; }),
    },
    firstKillersTable: allFirsts,
  };
}

function main() {
  const dir = process.argv[2];
  const prefix = process.argv[3] || 'firstkiller-s';
  if (!dir) { console.error('usage: firstkiller-analyze-20261107.js <corpusDir> [prefix]'); process.exit(2); }
  const out = analyzeDir(dir, prefix);
  console.log(JSON.stringify(out, null, 2));
  if (out.instrumentErrors > 0) { console.error('FIRSTKILLER STOP: instrument errors=' + out.instrumentErrors); process.exit(1); }
}

if (require.main === module) main();
module.exports = { analyzeRow: analyzeRow, analyzeLeg: analyzeLeg, analyzeDir: analyzeDir,
  firstKillerChannel: firstKillerChannel, channelTop: channelTop, median: median };
