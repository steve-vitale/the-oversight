'use strict';
// durablepair-judge-20261106.js — durable-pair re-judge for the drive64
// 64-seed corpora (evidence/2026-11-06/sim-durablepair-a-prereg.md).
// The drive64 count bar (pairFormed) counts any same-day-or-later overlap
// while the first killer still lives, including gap-0 pairs where both
// killers die within days. A pair is DURABLE only if BOTH killers are
// alive 14 days after the second kill, or both are living at horizon end.
//   node scripts/durablepair-judge-20261106.js <off-panel.json> <on-panel.json>
//     [--transcripts <dir>] [--out <verdict.json>]
// Panel rows carry pairFormed / firstKillDay / secondKillDay /
// livingKillers; per-killer death days come from the pair-seed transcripts
// (drive64-transcript-<seed>.json: kills + killersDeathDay). A pair seed
// with no usable death-day source (no transcript AND livingKillers < 2) is
// UNJUDGED — reported as unknown, never counted durable, never fleeting.
// The judge never merges or modifies the drive branch; it reads the
// corpora as files.
const fs = require('fs');
const path = require('path');

const DURABLE_DAYS = 14;

function medianSweep(daysArr) {
  const a = daysArr.slice().sort((x, y) => x - y);
  return a.length ? a[Math.floor(a.length / 2)] : 0;
}

// First two distinct killers by first-kill day, from a transcript's kill
// log — the same ordering the drive-seek extraMetrics uses for pairFormed.
function firstTwoKillers(kills) {
  const byKiller = {};
  for (const k of (kills || [])) {
    if (!k || !k.by) continue;
    if (!byKiller[k.by]) byKiller[k.by] = { by: k.by, byName: k.byName || k.by, firstDay: k.day || 0 };
    else byKiller[k.by].firstDay = Math.min(byKiller[k.by].firstDay, k.day || 0);
  }
  return Object.values(byKiller).sort((a, b) => a.firstDay - b.firstDay).slice(0, 2);
}

function loadTranscript(dir, seed) {
  if (!dir) return null;
  const p = path.join(dir, 'drive64-transcript-' + seed + '.json');
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { return null; }
}

// Judge one pair seed. Returns { durable: true|false|null, reason, pair }.
// durable === null means UNJUDGED (no death-day source).
function judgePairSeed(row, transcript) {
  const secondKillDay = row.extra.secondKillDay || 0;
  const livingKillers = row.extra.livingKillers || 0;
  const pair = {
    seed: row.seed, days: row.days || 0, endReason: row.endReason || null,
    firstKillDay: row.extra.firstKillDay || 0, secondKillDay,
    livingKillers, w4Kills: row.extra.w4Kills || 0,
    w4Killers: row.extra.w4Killers || 0, killers: [], durable: null, reason: '',
  };
  // Living-at-end clause: both killers alive at horizon end.
  if (livingKillers >= 2) {
    pair.durable = true;
    pair.reason = 'both living at horizon end (livingKillers=' + livingKillers + ')';
    if (transcript) {
      pair.killers = firstTwoKillers(transcript.kills).map(k => ({
        by: k.by, byName: k.byName, firstKillDay: k.firstDay,
        deathDay: (transcript.killersDeathDay || {})[k.by] ?? null,
        survivedAfterSecondKill: ((transcript.killersDeathDay || {})[k.by] == null)
          ? 'alive' : ((transcript.killersDeathDay || {})[k.by] - secondKillDay),
      }));
    }
    return pair;
  }
  if (!transcript) {
    pair.durable = null;
    pair.reason = 'UNJUDGED: no transcript and livingKillers=' + livingKillers + ' < 2';
    return pair;
  }
  const killers = firstTwoKillers(transcript.kills);
  if (killers.length < 2) {
    pair.durable = null;
    pair.reason = 'UNJUDGED: transcript names fewer than 2 killers';
    pair.killers = killers;
    return pair;
  }
  const dd = transcript.killersDeathDay || {};
  pair.killers = killers.map(k => {
    const deathDay = (dd[k.by] == null) ? null : dd[k.by];
    return {
      by: k.by, byName: k.byName, firstKillDay: k.firstDay, deathDay,
      survivedAfterSecondKill: deathDay == null ? 'alive' : (deathDay - secondKillDay),
    };
  });
  // Durable iff BOTH killers are alive 14d after the second kill: no death
  // record (alive at end) or deathDay strictly more than 14 days after
  // the second kill. Death exactly on secondKillDay+14 is NOT durable:
  // the killer did not survive 14 full days past the kill.
  const alive14 = pair.killers.map(k =>
    (k.deathDay == null) || (k.deathDay - secondKillDay > DURABLE_DAYS));
  pair.durable = alive14[0] && alive14[1];
  pair.reason = pair.durable
    ? 'both alive 14d after second kill (survived ' + pair.killers.map(k => k.survivedAfterSecondKill).join('/') + 'd)'
    : 'fleeting: survived after second kill ' + pair.killers.map(k => k.survivedAfterSecondKill).join('/') + 'd (bar >' + DURABLE_DAYS + 'd)';
  return pair;
}

function armStats(report, transcriptsDir) {
  const rows = (report.runs || []).filter(r => r && r.extra);
  const sum = k => rows.reduce((a, r) => a + (r.extra[k] || 0), 0);
  const pairRows = rows.filter(r => r.extra.pairFormed);
  const pairs = pairRows.map(r => judgePairSeed(r, loadTranscript(transcriptsDir, r.seed)));
  const durable = pairs.filter(p => p.durable === true);
  const unjudged = pairs.filter(p => p.durable === null);
  return {
    n: rows.length,
    pairs: pairRows.length,
    pairSeeds: pairRows.map(r => r.seed),
    durablePairs: durable.length,
    durableSeeds: durable.map(p => p.seed),
    unjudgedPairs: unjudged.length,
    unjudgedSeeds: unjudged.map(p => p.seed),
    pairRows: pairs,
    w4Kills: sum('w4Kills'),
    w4Killers: sum('w4Killers'),
    livingKillersEnd: sum('livingKillers'),
    fallen: sum('fallen'),
    aliveEnd: sum('aliveEnd'),
    meanDays: rows.length ? +(rows.reduce((a, r) => a + (r.days || 0), 0) / rows.length).toFixed(1) : 0,
    medianDays: medianSweep(rows.map(r => r.days || 0)),
    won: rows.reduce((a, r) => a + (r.won || 0), 0),
    national: rows.reduce((a, r) => a + (r.national || 0), 0),
    table: rows.reduce((a, r) => a + (r.table || 0), 0),
    wave4reach: rows.filter(r => (r.waveReach || 1) >= 4).length,
    wave5reach: rows.filter(r => (r.waveReach || 1) >= 5).length,
    dsTold: sum('dsTold'), dsSeeks: sum('dsSeeks'),
    dsScoutSeen: sum('dsScoutSeen'), dsScoutEmpty: sum('dsScoutEmpty'),
  };
}

function judge(offReport, onReport, transcriptsDir) {
  const off = armStats(offReport, transcriptsDir);
  const on = armStats(onReport, transcriptsDir);
  // Gate: reproduce the published drive64 pair lists and pooled counts
  // before judging durability. A mismatch means this judge is not reading
  // the corpus the drive64 run judged.
  const gate = {
    offPairSeedsEmpty: JSON.stringify(off.pairSeeds) === '[]',
    onPairSeeds: JSON.stringify(on.pairSeeds) === '[99063,99091,99854,99866]',
    offW4Kills25: off.w4Kills === 25,
    onW4Kills25: on.w4Kills === 25,
    offPairs0: off.pairs === 0,
    onPairs4: on.pairs === 4,
  };
  gate.all = Object.values(gate).every(Boolean);
  const checks = {
    durableSeparates: on.durablePairs >= 2 && off.durablePairs === 0,
    noUnjudged: on.unjudgedPairs === 0 && off.unjudgedPairs === 0,
    gate: gate.all,
  };
  const verdict = (checks.durableSeparates && checks.noUnjudged && checks.gate) ? 'GO' : 'NO-GO';
  return { off, on, gate, checks, verdict, durableDays: DURABLE_DAYS };
}

function fmtStats(s) {
  return `n=${s.n} countPairs=${s.pairs} [${s.pairSeeds.join(',')}] durable=${s.durablePairs} [${s.durableSeeds.join(',')}] ` +
    `unjudged=${s.unjudgedPairs} w4kills=${s.w4Kills} killers=${s.w4Killers} livingEnd=${s.livingKillersEnd} ` +
    `fallen=${s.fallen} aliveEnd=${s.aliveEnd} meanD=${s.meanDays} medD=${s.medianDays} ` +
    `won=${s.won} nat=${s.national} table=${s.table} w4reach=${s.wave4reach} w5reach=${s.wave5reach}`;
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const offPath = args[0], onPath = args[1];
  if (!offPath || !onPath) {
    console.error('usage: node scripts/durablepair-judge-20261106.js <off-panel.json> <on-panel.json> [--transcripts <dir>] [--out <verdict.json>]');
    process.exit(2);
  }
  let transcriptsDir = null, outPath = null;
  for (let i = 2; i < args.length; i++) {
    if (args[i] === '--transcripts') transcriptsDir = args[++i];
    else if (args[i] === '--out') outPath = args[++i];
  }
  const off = JSON.parse(fs.readFileSync(offPath, 'utf8'));
  const on = JSON.parse(fs.readFileSync(onPath, 'utf8'));
  const j = judge(off, on, transcriptsDir);
  console.log('OFF pooled : ' + fmtStats(j.off));
  console.log('ON  pooled : ' + fmtStats(j.on));
  for (const p of j.on.pairRows.concat(j.off.pairRows)) {
    console.log('pair seed ' + p.seed + ': secondKill d' + p.secondKillDay +
      ' durable=' + p.durable + ' — ' + p.reason +
      (p.killers.length ? ' | ' + p.killers.map(k => (k.byName || k.by) + ' d' + k.firstKillDay + '->' + (k.deathDay == null ? 'alive' : 'd' + k.deathDay)).join('; ') : ''));
  }
  console.log('gate: ' + JSON.stringify(j.gate));
  console.log('checks: durableSeparates=' + j.checks.durableSeparates +
    ' (ON durable ' + j.on.durablePairs + ' >= 2, OFF durable ' + j.off.durablePairs + ' == 0)' +
    ' noUnjudged=' + j.checks.noUnjudged + ' gate=' + j.checks.gate);
  console.log('count-bar over-credit: ON ' + j.on.pairs + ' count pairs -> ' + j.on.durablePairs + ' durable' +
    ' (ratio ' + (j.on.pairs ? (j.on.durablePairs / j.on.pairs).toFixed(2) : 'n/a') + ')');
  console.log('VERDICT (durable bar): ' + j.verdict);
  if (outPath) fs.writeFileSync(outPath, JSON.stringify(j, null, 1) + '\n');
  process.exit(j.gate.all ? 0 : 1);
}

module.exports = { judge, armStats, judgePairSeed, firstTwoKillers, DURABLE_DAYS, fmtStats };
