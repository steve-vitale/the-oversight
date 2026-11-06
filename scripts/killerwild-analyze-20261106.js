// killerwild-analyze-20261106.js — wild-death channel diag + killer-aware
// lever judge (arm sim-killerwild-b, run fleshout-loop-b-20261106T0730Z).
// Pure function over corpus JSON; no game reads, no re-scoring. Reuses
// killerdeath-analyze-20261105's classifySeed/killerFates (death-cause
// split, alive-at-end from deadMap, pair snapshot) and adds:
//  (1) DEATH CHANNEL per dead wave-4 killer: TB-wild / TB-home / field /
//      arena / expedition / contest / other:<detail> / alive, from the
//      scholarDeath wrap (causeArg + at-haven + in-combat) first, then the
//      fallen monsterId/monsterName thread (NPC field death), then the
//      literal fallen cause. 'the wild' with no split evidence stays
//      'the wild (unsplit residual)' and is NEVER cited as a cause.
//  (2) RETREAT-TRIGGER COVERAGE per dead killer whose channel is TB:
//      joins refindStats.events (day + fighterVid + mid + result) to the
//      fatal fight: fired-exited / haven-hold / died-mid-retreat /
//      no-fire / no-tb-fight-near-death. NPC killers are
//      'npc-policy-blind' (the refind trigger is scholar-only); non-TB
//      channels are 'n/a (non-TB channel)'. The join is day+fighterVid
//      (+mid where the fight rows name it); a same-day fire by ANOTHER
//      fighter is reported as no-fire with a note, never silently
//      counted as coverage.
//  (3) STAGE-1 PRIMARY: per seed, the FIRST wave-4 killer blooded
//      (earliest firstDay) alive 14d after first blood (aliveAtEnd, or
//      killToDeathDays > 14). GO iff armed count >= baseline count + 2
//      (8 seeds). Guards: total wave-4 kills armed >= 1/2 baseline;
//      median survival armed >= 0.8x baseline.
// Usage:
//   node scripts/killerwild-analyze-20261106.js <per-seed-dir> [run]
//   node scripts/killerwild-analyze-20261106.js <baseline-dir> <armed-dir> --judge
//     (prints a JSON summary to stdout)
'use strict';
const fs = require('fs');
const path = require('path');
const KD = require(path.join(__dirname, 'killerdeath-analyze-20261105'));

function channelOf(k) {
  if (k.deathDay == null) return 'alive';
  const ctx = k.scholarDeathCtx;
  if (ctx) {
    if (ctx.inCombat) return ctx.atHaven ? 'TB-home' : 'TB-wild';
    const c = String(ctx.causeArg || k.deathCauseRaw || '?');
    if (c === 'the arena') return 'arena';
    if (c === 'the expedition') return 'expedition';
    if (/contest/i.test(c)) return 'contest';
    return 'other:' + c + ':' + (ctx.atHaven ? 'at-haven' : 'away') + ':not-in-combat';
  }
  const split = String(k.deathCauseSplit || '');
  if (split.indexOf('monster:') === 0) return 'field';
  const raw = String(k.deathCauseRaw || '');
  if (raw === 'the arena') return 'arena';
  if (raw === 'the expedition') return 'expedition';
  if (/contest/i.test(raw)) return 'contest';
  if (raw && raw !== 'the wild') return 'other:' + raw;
  if (raw === 'the wild') return 'the wild (unsplit residual)';
  return 'unknown (no fallen entry)';
}

// Fatal TB fight mid, from the instrument's startCombat rows: the last
// player-tb wave-4+ fight on or before the death day.
function fatalFightMid(row, deathDay) {
  let best = null;
  (row.fights || []).forEach(function (f) {
    if (f.channel !== 'player-tb' || ((f.wave | 0) < 4)) return;
    if ((f.day | 0) > (deathDay | 0)) return;
    if (!best || (f.day | 0) >= (best.day | 0)) best = f;
  });
  return best ? { day: best.day, mid: best.mid } : null;
}

function coverageOf(row, k, channel) {
  if (k.deathDay == null) return 'n/a (alive)';
  if (channel !== 'TB-wild' && channel !== 'TB-home') {
    if ((k.channels || []).indexOf('player') < 0 && (k.channels || []).indexOf('npc') >= 0) return 'npc-policy-blind';
    return 'n/a (non-TB channel)';
  }
  const events = ((row.refindStats || {}).events) || [];
  const sameDayOwn = events.filter(function (e) { return (e.day | 0) === (k.deathDay | 0) && e.fighterVid === k.by; });
  const sameDayOther = events.filter(function (e) { return (e.day | 0) === (k.deathDay | 0) && e.fighterVid !== k.by; });
  if (sameDayOwn.length) {
    const e = sameDayOwn[sameDayOwn.length - 1];
    if (e.result === 'exited') return 'fired-exited';
    if (e.result === 'haven-hold') return 'haven-hold';
    return 'died-mid-retreat:' + (e.result || 'open');
  }
  const ff = fatalFightMid(row, k.deathDay);
  const note = sameDayOther.length ? 'other-fighter-fire-same-day(' + sameDayOther.length + ')' : null;
  if (ff && (k.deathDay - ff.day) <= 2) return note ? 'no-fire (' + note + ')' : 'no-fire';
  return note ? 'no-tb-fight-near-death (' + note + '; last w4 TB fight ' + (ff ? 'd' + ff.day + ' ' + ff.mid : 'none') + ')' :
    'no-tb-fight-near-death (last w4 TB fight ' + (ff ? 'd' + ff.day + ' ' + ff.mid : 'none') + ')';
}

function classifyRow(row) {
  const base = KD.classifySeed(row);
  const killers = (base.killers || []).map(function (k) {
    const channel = channelOf(k);
    return Object.assign({}, k, { channel: channel, triggerCoverage: coverageOf(row, k, channel) });
  });
  const first = killers.length ? killers[0] : null;
  const firstAlive14 = !!(first && (first.aliveAtEnd || (first.killToDeathDays != null && first.killToDeathDays > 14)));
  const rf = row.refindStats || {};
  const ka = row.killerawareStats || null;
  return Object.assign({}, base, {
    killers: killers,
    firstKiller: first ? { by: first.by, firstDay: first.firstDay, channel: first.channel, triggerCoverage: first.triggerCoverage, aliveAtEnd: first.aliveAtEnd, killToDeathDays: first.killToDeathDays } : null,
    firstKillerAlive14d: firstAlive14,
    refindFires: rf.triggerFires || 0, refindExits: rf.exits || 0,
    refindHavenHolds: rf.havenHolds || 0, refindEvents: (rf.events || []).length,
    killerawareFires: ka ? (ka.killerFires || 0) : null,
  });
}

function median(nums) { return KD.median(nums); }

function analyzeDir(dir, run) {
  const files = fs.readdirSync(dir).filter(function (f) {
    return f.indexOf('killerwild-s') === 0 && f.endsWith('.json') && (!run || f.indexOf('-' + run + '.json') >= 0);
  }).sort();
  const rows = files.map(function (f) { return JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); });
  const seeds = rows.map(classifyRow);
  const kdBase = KD.analyzeDir(dir, 'killerwild-s');
  const channelShares = {};
  const coverageShares = {};
  const firstChannels = {};
  seeds.forEach(function (s) {
    s.killers.forEach(function (k) {
      if (k.deathDay == null) return;
      channelShares[k.channel] = (channelShares[k.channel] | 0) + 1;
      coverageShares[k.triggerCoverage] = (coverageShares[k.triggerCoverage] | 0) + 1;
    });
    if (s.firstKiller) firstChannels[s.firstKiller.channel] = (firstChannels[s.firstKiller.channel] | 0) + 1;
  });
  const firstAlive14 = seeds.filter(function (s) { return s.firstKillerAlive14d; }).length;
  const totalW4kills = seeds.reduce(function (m, s) { return m + s.w4kills; }, 0);
  return {
    n: seeds.length, run: run || null,
    firstKillerAlive14d: firstAlive14,
    totalW4kills: totalW4kills,
    medianDays: median(seeds.map(function (s) { return s.days; })),
    channelShares: channelShares, coverageShares: coverageShares,
    firstKillerChannels: firstChannels,
    wall: kdBase.wall, pairSnapshotSeeds: kdBase.pairSnapshotSeeds,
    reconPairSeeds: kdBase.reconPairSeeds,
    totalInstrumentErrors: kdBase.totalInstrumentErrors,
    killToDeathMedian: kdBase.killToDeathMedian,
    deadKillers: kdBase.deadKillers, killersEver: kdBase.killersEver,
    seeds: seeds,
  };
}

function judge(baselineDir, armedDir) {
  const b = analyzeDir(baselineDir, 'killerwild-baseline');
  const a = analyzeDir(armedDir, 'killerwild-armed');
  const primaryDiff = a.firstKillerAlive14d - b.firstKillerAlive14d;
  const killRatio = b.totalW4kills > 0 ? a.totalW4kills / b.totalW4kills : (a.totalW4kills > 0 ? Infinity : 1);
  const survRatio = (b.medianDays && b.medianDays > 0) ? a.medianDays / b.medianDays : null;
  const goPrimary = primaryDiff >= 2;
  const guardKills = killRatio >= 0.5;
  const guardSurv = survRatio != null && survRatio >= 0.8;
  return {
    verdict: (goPrimary && guardKills && guardSurv) ? 'GO' : 'NO-GO',
    primary: { baseline: b.firstKillerAlive14d, armed: a.firstKillerAlive14d, diff: primaryDiff, bar: 'armed >= baseline + 2', holds: goPrimary },
    guardKills: { baseline: b.totalW4kills, armed: a.totalW4kills, ratio: killRatio, bar: 'armed >= 1/2 baseline', holds: guardKills },
    guardSurvival: { baselineMedian: b.medianDays, armedMedian: a.medianDays, ratio: survRatio, bar: 'armed >= 0.8x baseline', holds: guardSurv },
    baseline: b, armed: a,
  };
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args[2] === '--judge') {
    console.log(JSON.stringify(judge(args[0], args[1]), null, 2));
  } else if (args[0]) {
    console.log(JSON.stringify(analyzeDir(args[0], args[1] || null), null, 2));
  } else {
    console.error('usage: killerwild-analyze-20261106.js <per-seed-dir> [run] | <baseline-dir> <armed-dir> --judge');
    process.exit(2);
  }
}

module.exports = { classifyRow: classifyRow, channelOf: channelOf, coverageOf: coverageOf, analyzeDir: analyzeDir, judge: judge };
