'use strict';
// scripts/analyze-riskdeath-b.js — panel-only death-cause read on the flippanel panels.
//
// Reads the committed §15 panels (evidence/2026-11-08/panel-flippanel-b/
// {before,after}/panel.json.gz), aggregates row.deaths (kind:cause -> count)
// kind-aware (never cause-only: r21 trap), and judges the prereg bar:
// one named cause / pre-registered family accounts for >=2/3 of the paired
// risk-aware player-death increase (+12 over 8 seeds) or the village-death
// increase (+34) WITH a paired 95% t-interval (7 df) excluding 0.
//
// Family table (prereg evidence/2026-11-08/sim-riskdeath-b-prereg.md):
//   violent: the wild | the expedition | the arena | contest | a stranger |
//     monster | ambush | combat (cause strings, any person kind)
//   sickness: sickness | lockjaw (REGISTERED: named disease)
//   thirst: thirst | dehydration (REGISTERED per sim-53007-a)
//   starvation: starvation
//   wound: a wound that wouldn't close
//   alien: alien | alien_beam
//   other: the night | the phoenix link | Big-Eyes | Buffering |
//     Sweeps Week | The Moderator | anything unlisted (never silently bucketed)
//   monsterKill: kind monster, any cause (a rise is kills, not deaths)
// Human deaths = kinds player + villager + person. villageDeaths (panel
// metric) = ALL row.deaths values INCLUDING monster kills (ruling 753).
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

const VIOLENT = new Set(['the wild', 'the expedition', 'the arena', 'contest', 'a stranger', 'monster', 'ambush', 'combat']);
const SICKNESS = new Set(['sickness', 'lockjaw']);
const THIRST = new Set(['thirst', 'dehydration']);
const STARVATION = new Set(['starvation']);
const WOUND = new Set(["a wound that wouldn't close"]);
const ALIEN = new Set(['alien', 'alien_beam']);

// familyOf(kind, cause) — kind-aware. Monster kinds are kills, never human deaths.
function familyOf(kind, cause) {
  if (kind === 'monster') return 'monsterKill';
  if (VIOLENT.has(cause)) return 'violent';
  if (SICKNESS.has(cause)) return 'sickness';
  if (THIRST.has(cause)) return 'thirst';
  if (STARVATION.has(cause)) return 'starvation';
  if (WOUND.has(cause)) return 'wound';
  if (ALIEN.has(cause)) return 'alien';
  return 'other';
}

function loadPanel(p) {
  const raw = fs.readFileSync(p);
  return JSON.parse(zlib.gunzipSync(raw).toString('utf8'));
}

// Aggregate one row's deaths map into raw-cause and family counts, split by
// victim class. Returns { raw, fam, playerTotal, humanTotal, monsterTotal, total }.
function aggregateRow(deaths) {
  const raw = {}, fam = {};
  let playerTotal = 0, humanTotal = 0, monsterTotal = 0, total = 0;
  for (const [key, v] of Object.entries(deaths || {})) {
    const n = Number(v) || 0;
    const idx = key.indexOf(':');
    const kind = idx >= 0 ? key.slice(0, idx) : '?';
    const cause = idx >= 0 ? key.slice(idx + 1) : key;
    raw[key] = (raw[key] || 0) + n;
    const famKey = familyOf(kind, cause);
    fam[famKey] = (fam[famKey] || 0) + n;
    total += n;
    if (kind === 'monster') monsterTotal += n;
    else { humanTotal += n; if (kind === 'player') playerTotal += n; }
  }
  return { raw, fam, playerTotal, humanTotal, monsterTotal, total };
}

// Paired stats over per-seed diffs (after - before), same seed order both legs.
function pairedStats(diffs) {
  const n = diffs.length;
  const mean = diffs.reduce((a, b) => a + b, 0) / n;
  const sd = n > 1 ? Math.sqrt(diffs.reduce((a, d) => a + (d - mean) * (d - mean), 0) / (n - 1)) : 0;
  const se = sd / Math.sqrt(n);
  const t = 2.365; // t(0.975, df=7)
  return { n, mean, sd, se, tLo: mean - t * se, tHi: mean + t * se, total: diffs.reduce((a, b) => a + b, 0) };
}

// Bootstrap interval via the compare tool's own method (same seeded code path
// as the published compare intervals) — cross-check only; the prereg binds
// the t-interval.
function bootstrapInterval(diffs, key) {
  try {
    const sc = require('./lib/balance-scorecard.js');
    return sc.interval(diffs, key);
  } catch (e) { return [null, null]; }
}

function analyze(beforePath, afterPath) {
  const before = loadPanel(beforePath), after = loadPanel(afterPath);
  const byKey = (doc) => {
    const m = new Map();
    for (const r of doc.rows || []) m.set(r.row.policy + ':' + r.row.seed, r);
    return m;
  };
  const bm = byKey(before), am = byKey(after);
  const policies = [...new Set([...bm.keys(), ...am.keys()].map(k => k.split(':')[0]))];
  const out = { policies: {}, rows: [] };
  for (const policy of policies) {
    const seeds = [...new Set([...bm.keys(), ...am.keys()].filter(k => k.startsWith(policy + ':')).map(k => Number(k.split(':')[1])))].sort((a, b) => a - b);
    const perSeed = [];
    let wall = { national: [0, 0], table: [0, 0], wins: [0, 0], entered: [0, 0], days: [[], []] };
    for (const seed of seeds) {
      const b = bm.get(policy + ':' + seed), a = am.get(policy + ':' + seed);
      if (!b || !a) continue;
      const ba = aggregateRow(b.row.deaths), aa = aggregateRow(a.row.deaths);
      // Metric cross-check: map sums must reproduce the panel metrics.
      if (ba.playerTotal !== b.metrics.playerDeaths || ba.total !== b.metrics.villageDeaths ||
          aa.playerTotal !== a.metrics.playerDeaths || aa.total !== a.metrics.villageDeaths) {
        throw new Error('metric mismatch ' + policy + ':' + seed);
      }
      wall.national[0] += b.row.national ? 1 : 0; wall.national[1] += a.row.national ? 1 : 0;
      // Ruling 665: sittings = row.entered, not row.table (row.table counts
      // 7/8 here while entered counts the 6/8 sittings the compare publishes).
      wall.table[0] += b.row.entered ? 1 : 0; wall.table[1] += a.row.entered ? 1 : 0;
      wall.tableFlag = wall.tableFlag || [0, 0];
      wall.tableFlag[0] += b.row.table ? 1 : 0; wall.tableFlag[1] += a.row.table ? 1 : 0;
      wall.wins[0] += b.row.won ? 1 : 0; wall.wins[1] += a.row.won ? 1 : 0;
      wall.entered[0] += b.row.entered ? 1 : 0; wall.entered[1] += a.row.entered ? 1 : 0;
      wall.days[0].push(b.row.gameDays); wall.days[1].push(a.row.gameDays);
      perSeed.push({ seed, before: ba, after: aa,
        beforeRow: b.row, afterRow: a.row,
        beforeMetrics: b.metrics, afterMetrics: a.metrics,
        beforeSamples: b.samples, afterSamples: a.samples });
    }
    const sumKey = (rows, side, key) => rows.reduce((n, r) => n + (r[side].raw[key] || 0), 0);
    const sumFam = (rows, side, famKey) => rows.reduce((n, r) => n + (r[side].fam[famKey] || 0), 0);
    const sumField = (rows, side, f) => rows.reduce((n, r) => n + r[side][f], 0);
    const allRawKeys = [...new Set(perSeed.flatMap(r => [...Object.keys(r.before.raw), ...Object.keys(r.after.raw)]))].sort();
    const allFams = [...new Set(perSeed.flatMap(r => [...Object.keys(r.before.fam), ...Object.keys(r.after.fam)]))].sort();
    const causeTable = allRawKeys.map(k => {
      const diffs = perSeed.map(r => (r.after.raw[k] || 0) - (r.before.raw[k] || 0));
      return { key: k, before: sumKey(perSeed, 'before', k), after: sumKey(perSeed, 'after', k),
        delta: sumKey(perSeed, 'after', k) - sumKey(perSeed, 'before', k), paired: pairedStats(diffs),
        boot: bootstrapInterval(diffs, policy + '/cause/' + k) };
    });
    const famTable = allFams.map(f => {
      const diffs = perSeed.map(r => (r.after.fam[f] || 0) - (r.before.fam[f] || 0));
      return { family: f, before: sumFam(perSeed, 'before', f), after: sumFam(perSeed, 'after', f),
        delta: sumFam(perSeed, 'after', f) - sumFam(perSeed, 'before', f), paired: pairedStats(diffs),
        boot: bootstrapInterval(diffs, policy + '/family/' + f) };
    });
    const totals = {
      playerDeaths: { before: sumField(perSeed, 'before', 'playerTotal'), after: sumField(perSeed, 'after', 'playerTotal') },
      humanDeaths: { before: sumField(perSeed, 'before', 'humanTotal'), after: sumField(perSeed, 'after', 'humanTotal') },
      monsterKills: { before: sumField(perSeed, 'before', 'monsterTotal'), after: sumField(perSeed, 'after', 'monsterTotal') },
      villageDeaths: { before: sumField(perSeed, 'before', 'total'), after: sumField(perSeed, 'after', 'total') },
    };
    // First-bearer split: survival30/60 are the panel's first-bearer survival
    // (finish(): firstDeath day vs 30/60). First-bearer deaths per row are
    // <=1 (the first player death IS the first bearer); the rest are successors.
    const firstBearer = {
      surv30: [perSeed.reduce((n, r) => n + (r.beforeMetrics.survival30 ? 1 : 0), 0), perSeed.reduce((n, r) => n + (r.afterMetrics.survival30 ? 1 : 0), 0)],
      surv60: [perSeed.reduce((n, r) => n + (r.beforeMetrics.survival60 ? 1 : 0), 0), perSeed.reduce((n, r) => n + (r.afterMetrics.survival60 ? 1 : 0), 0)],
      firstBearerDeaths: [perSeed.reduce((n, r) => n + Math.min(1, r.before.playerTotal), 0), perSeed.reduce((n, r) => n + Math.min(1, r.after.playerTotal), 0)],
      successorDeaths: [perSeed.reduce((n, r) => n + Math.max(0, r.before.playerTotal - 1), 0), perSeed.reduce((n, r) => n + Math.max(0, r.after.playerTotal - 1), 0)],
      bearerChanges: [perSeed.reduce((n, r) => n + (r.beforeMetrics.bearerChanges || 0), 0), perSeed.reduce((n, r) => n + (r.afterMetrics.bearerChanges || 0), 0)],
    };
    const median = xs => { const s = xs.slice().sort((a, b) => a - b); return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2; };
    const waveReach = [0, 0].map((_, i) => ({
      w4: perSeed.filter(r => (i ? r.afterRow : r.beforeRow).waveReach >= 4).length,
      w5: perSeed.filter(r => (i ? r.afterRow : r.beforeRow).waveReach >= 5).length,
      maxArc: Math.max(...perSeed.map(r => (i ? r.afterRow : r.beforeRow).maxArc)),
    }));
    out.policies[policy] = { seeds, perSeed, causeTable, famTable, totals, firstBearer,
      wall: { national: wall.national, table: wall.table, tableFlag: wall.tableFlag, wins: wall.wins,
        medianDays: [median(wall.days[0]), median(wall.days[1])], waveReach } };
  }
  out.rows = [];
  return out;
}

// Bearer-change days from samples (each change implies the previous bearer
// died the day before, ±1 sample day). Coarse proxy for day-of-death.
function bearerChangeDays(samples) {
  const days = [];
  const arr = Object.values(samples || {}).sort((a, b) => (a.day || 0) - (b.day || 0));
  for (let i = 1; i < arr.length; i++) {
    if (arr[i].bearer && arr[i - 1].bearer && arr[i].bearer !== arr[i - 1].bearer) days.push(arr[i].day);
  }
  return days;
}

// Net human-death days from livingNpcs drops (joins can mask a death; drops
// are a lower bound per day). Coarse proxy.
function livingDropDays(samples) {
  const days = [];
  const arr = Object.values(samples || {}).sort((a, b) => (a.day || 0) - (b.day || 0));
  for (let i = 1; i < arr.length; i++) {
    const d = (arr[i - 1].livingNpcs || 0) - (arr[i].livingNpcs || 0);
    if (d > 0) days.push({ day: arr[i].day, drop: d });
  }
  return days;
}

function verdict(result) {
  const ra = result.policies['risk-aware'];
  if (!ra) return { verdict: 'DIAG-NO-GO', reason: 'no risk-aware policy in panels' };
  const pDelta = ra.totals.playerDeaths.after - ra.totals.playerDeaths.before;
  const vDelta = ra.totals.villageDeaths.after - ra.totals.villageDeaths.before;
  const named = ra.causeTable.filter(c => c.key.startsWith('player:') && c.delta >= (2 / 3) * pDelta && c.paired.tLo > 0);
  const famV = ra.famTable.find(f => f.family === 'monsterKill');
  const vExplained = famV && vDelta > 0 && famV.delta >= (2 / 3) * vDelta && famV.paired.tLo > 0;
  const hits = [];
  for (const c of named) hits.push({ what: 'player cause ' + c.key, delta: c.delta, of: pDelta, share: c.delta / pDelta, tInterval: [c.paired.tLo, c.paired.tHi], boot: c.boot });
  if (vExplained) hits.push({ what: 'villageDeaths via monsterKill family', delta: famV.delta, of: vDelta, share: famV.delta / vDelta, tInterval: [famV.paired.tLo, famV.paired.tHi], boot: famV.boot });
  if (hits.length) return { verdict: 'DIAG-GO', reason: 'named cause/family explains >=2/3 with excluding-0 t-interval', hits, playerDelta: pDelta, villageDelta: vDelta };
  return { verdict: 'DIAG-NO-GO', reason: 'no cause/family explains >=2/3 of either increase with an excluding-0 interval', playerDelta: pDelta, villageDelta: vDelta,
    bestPlayer: ra.causeTable.filter(c => c.key.startsWith('player:')).sort((a, b) => b.delta - a.delta)[0] || null,
    bestVillage: ra.famTable.sort((a, b) => b.delta - a.delta)[0] || null };
}

if (require.main === module) {
  const base = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-11-08', 'panel-flippanel-b');
  const res = analyze(path.join(base, 'before', 'panel.json.gz'), path.join(base, 'after', 'panel.json.gz'));
  console.log(JSON.stringify({ verdict: verdict(res), policies: Object.fromEntries(Object.entries(res.policies).map(([k, v]) => [k, { totals: v.totals, firstBearer: v.firstBearer, wall: v.wall }])) }, null, 1));
  for (const [policy, p] of Object.entries(res.policies)) {
    console.log('\n=== ' + policy + ' cause table (before -> after, delta, paired t-95%) ===');
    for (const c of p.causeTable) console.log('  ' + c.key + ': ' + c.before + ' -> ' + c.after + ' (Δ' + (c.delta >= 0 ? '+' : '') + c.delta + ') t95 [' + c.paired.tLo.toFixed(2) + ', ' + c.paired.tHi.toFixed(2) + '] boot [' + c.boot.map(x => x == null ? 'null' : x.toFixed(2)).join(', ') + ']');
    console.log('=== ' + policy + ' family table ===');
    for (const f of p.famTable) console.log('  ' + f.family + ': ' + f.before + ' -> ' + f.after + ' (Δ' + (f.delta >= 0 ? '+' : '') + f.delta + ') t95 [' + f.paired.tLo.toFixed(2) + ', ' + f.paired.tHi.toFixed(2) + '] boot [' + f.boot.map(x => x == null ? 'null' : x.toFixed(2)).join(', ') + ']');
  }
}

module.exports = { analyze, verdict, aggregateRow, familyOf, pairedStats, bearerChangeDays, livingDropDays };
