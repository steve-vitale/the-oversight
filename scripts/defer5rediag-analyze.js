#!/usr/bin/env node
// defer5rediag-analyze.js — RE-DIAG judge for the defer5 coincidence trap
// (arm sim-defer5-rediag, run fleshout-20261023T2217Z, axis scale-onramp).
//
// Reads evidence/2026-10-23/perseed-defer5rediag/*.json (w5gates-lib
// UNMODIFIED instrument) and re-attributes the defer5/defer4 bar outcomes
// to the pre-registered named channels:
//
//   never-met              — bar short at end, never met its demand all run
//                            (per-BAR flavor, in the `bars` map)
//   met-then-lost          — bar met at some point, short again at end
//                            (per-BAR flavor, in the `bars` map)
//   met-but-not-simultaneous — config-level: every bar met at some point,
//                            0 days of all-four coincidence
//                            (THE COINCIDENCE TRAP; subsumes met-then-lost)
//   bar-never-met:<bars>    — config-level: >=1 binding bar never met
//                            during the run (capacity shortfall)
//   overlap-before-standing — config-level: the bars DID coincide on >=1
//                            day, but standing was below the threshold on
//                            every coincidence day (the engine only releases
//                            when bars AND standing are live together)
//   gate-released          — defer4/defer5 bound mid-run but no longer the
//                            binding gate at end (door opened / standing
//                            fell / binding moved elsewhere)
//
// NOTE (E1-verified): for an end-binding defer4/defer5 config, engine truth
// (standing.js:184-196) forbids a coincidence day with standing live —
// that releases the hold and grandfathers it. The reachable config
// channels are {met-but-not-simultaneous, bar-never-met:<bars>,
// overlap-before-standing}; met-then-lost survives as the per-bar flavor.
//
// PRE-REGISTERED DIAG-GO (binding): >=90% of defer4/defer5-binding configs'
// bar outcomes attributed to the named channels above, 0 unexplained.
// A miss is DIAG-NO-GO, never re-scored.
//
// Also reports: the CURRENT binder bar-by-bar (which bar binds most often
// NOW), the coincidence overlap distribution, and whether the trap's shape
// changed vs the original defer5gate DIAG (armor leg filled? veterans still
// the universal binder?).
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const CORPUS = process.env.CORPUS || path.join(REPO, 'evidence', '2026-10-23', 'perseed-defer5rediag');
const G5 = require(path.join(REPO, 'scripts', 'w5gates-lib'));

// waveKillLog dedup on (d,mid,by,via,trick) per backlog #844.
function dedupKills(log) {
  const seen = new Set(), out = [];
  for (const e of (log || [])) {
    const k = [e.d, e.mid, e.by, e.via, e.trick].join('|');
    if (seen.has(k)) continue;
    seen.add(k); out.push(e);
  }
  return out;
}
function cfgId(c) { return `s${c.seed}-${c.base === 'belongfeast' ? 'belong' : 'lead'}`; }
const BARS4 = ['armored', 'armed', 'tricks', 'veterans'];
const DEM4 = { armored: 3, armed: 5, tricks: 3, veterans: 1 };
const DEM5 = { armored: 4, armed: 6, tricks: 3, veterans: 2 };

function load() {
  const out = [];
  for (const f of fs.readdirSync(CORPUS).filter(f => f.endsWith('.json'))) {
    out.push(JSON.parse(fs.readFileSync(path.join(CORPUS, f), 'utf8')));
  }
  out.sort((a, b) => a.seed - b.seed || (a.base < b.base ? -1 : 1));
  return out;
}

// Cross-check: recompute the end-of-run binding from the final trace row
// and compare with the stored gateVector attr binding.
function recomputeEndBinding(c) {
  const tr = c.gateTrace || [];
  if (!tr.length) return 'no-trace';
  const t = tr[tr.length - 1];
  const r4 = t.r4 || {}, r5 = t.r5 || {};
  const r4ready = !!r4.ready, r5ready = !!r5.ready;
  const capped = t.capped | 0, raw = t.raw | 0, peak = t.peak | 0;
  const w3met = (t.d | 0) >= 25 && (t.l2 | 0) >= 4;
  const unmet = [];
  if (!w3met) unmet.push('w3rung');
  if (raw < 200) unmet.push('stand-raw');
  if (raw >= 200 && capped < 200 && peak < 5) unmet.push('plenty-cap');
  if (raw >= 100 && !r4ready && peak < 4) unmet.push('defer4');
  if (capped >= 200 && !r5ready && peak < 5) unmet.push('defer5');
  if ((t.w4faced | 0) <= 0) unmet.push('w4faced');
  const unlocked = (t.uw | 0) >= 5;
  if (unlocked) return 'unlocked';
  for (const id of ['w3rung', 'stand-raw', 'plenty-cap', 'defer4', 'defer5', 'w4faced']) {
    if (unmet.indexOf(id) >= 0) return id;
  }
  return 'UNEXPLAINED:locked-no-unmet';
}

// Trace-derived bar sensors (self-consistent: recomputed from the stored
// daily trace with the run's live demands, as a cross-check on the sweep's
// sensors). Returns per-bar {peak, release, lastMet} and overlap stats:
// allDays (all four bars met), withStanding (all four met AND the standing
// threshold live that day — the only days the engine could have released).
function traceSensors(c, rkey, dem, standKey, standNeed) {
  const per = {};
  for (const b of BARS4) per[b] = { peak: -1, release: null, lastMet: null };
  let allDays = 0, withStanding = 0, firstWithStanding = null;
  const tr = c.gateTrace || [];
  for (const t of tr) {
    const bars = t[rkey] || {};
    const met = {};
    let all = true;
    for (const b of BARS4) {
      const bv = (bars[b] | 0), need = (dem && (dem[b] | 0)) || 0;
      met[b] = need > 0 && bv >= need;
      if (bv > per[b].peak) per[b].peak = bv;
      if (per[b].release == null && met[b]) per[b].release = t.d | 0;
      if (met[b]) per[b].lastMet = t.d | 0;
      if (!met[b]) all = false;
    }
    if (all) {
      allDays++;
      if (((t[standKey] | 0) >= standNeed)) {
        withStanding++;
        if (firstWithStanding == null) firstWithStanding = t.d | 0;
      }
    }
  }
  return { per, allDays, withStanding, firstWithStanding };
}

function classify(c) {
  // Returns { channel, bars: {bar: channel}, note } or { channel:'UNEXPLAINED', note }.
  const binding = (c.gateVector && c.gateVector.attr && c.gateVector.attr.binding) || null;
  const outcome = (c.gateVector && c.gateVector.attr && c.gateVector.attr.outcome) || null;
  const recomputed = recomputeEndBinding(c);
  // attribute() leaves binding null when the door is unlocked (outcome
  // 'unlocked', 'all gates met' / grandfathered) — agreement, not mismatch.
  const mismatch = outcome === 'unlocked' ? (recomputed !== 'unlocked') : (binding !== recomputed);
  const endDay = (((c.gateTrace || [])[(c.gateTrace || []).length - 1] || {}).d | 0);
  const midDefer5 = (c.defer5HeldDays | 0) > 0;
  const midDefer4 = (c.defer4HeldDays | 0) > 0;
  const midBound = midDefer5 || midDefer4;
  const uw5 = (c.maxWave | 0) >= 5;

  if (binding === 'defer5' || binding === 'defer4') {
    const is5 = binding === 'defer5';
    const dem = is5 ? (c.demand5 || DEM5) : (c.demand4 || DEM4);
    const rkey = is5 ? 'r5' : 'r4';
    // Deferral fires only when the standing threshold is live: capped>=200
    // for defer5 (standing.js:184), raw>=100 for defer4.
    const ts = traceSensors(c, rkey, dem, is5 ? 'capped' : 'raw', is5 ? 200 : 100);
    const deficit = (c.gateVector && c.gateVector.dist && c.gateVector.dist[binding]) || {};
    const bars = {};
    const shortBars = [];
    for (const b of BARS4) {
      const key = b === 'armored' ? 'armor' : (b === 'armed' ? 'weapons' : b);
      const s = ts.per[b];
      const need = (dem && (dem[b] | 0)) || 0;
      const shortNow = (deficit[key] | 0) > 0;
      if (!shortNow) { bars[b] = 'met (non-binding)'; continue; }
      shortBars.push(b);
      bars[b] = (s.release == null || s.peak < need) ? 'never-met' : 'met-then-lost';
    }
    const neverMetBinding = shortBars.filter(b => bars[b] === 'never-met');
    const allMetEver = BARS4.every(b => ts.per[b].release != null);
    let channel;
    if (neverMetBinding.length) {
      channel = 'bar-never-met:' + neverMetBinding.join(',');
    } else if (ts.withStanding > 0) {
      // Engine truth (standing.js:184-196): a day with all four bars met
      // AND capped>=200 releases the hold and grandfathers it (peak=5).
      // Binding defer5 at end is impossible — genuinely unexplained.
      return { channel: 'UNEXPLAINED', note: `binding ${binding} but ${ts.withStanding} coincidence day(s) with standing live (first d${ts.firstWithStanding})`, bars, binding, recomputed, mismatch };
    } else if (ts.allDays > 0) {
      channel = 'overlap-before-standing';
    } else if (allMetEver) {
      channel = 'met-but-not-simultaneous';
    } else {
      return { channel: 'UNEXPLAINED', note: `binding ${binding} but no short bars classified (short=${shortBars})`, bars, binding, recomputed, mismatch };
    }
    return { channel, bars, binding, recomputed, mismatch, shortBars,
      overlapDays: ts.allDays, overlapWithStanding: ts.withStanding, endDay };
  }
  if (midBound) {
    // The defer4/defer5 hold fired mid-run but is not the end binding.
    const releasedWhy = uw5 ? 'door-opened' : (binding ? `binding-moved-to:${binding}` : 'hold-lapsed');
    return { channel: 'gate-released', sub: releasedWhy, binding, recomputed, mismatch, midDefer5, midDefer4 };
  }
  return { channel: 'never-bound', binding, recomputed, mismatch };
}

function main() {
  const corpus = load();
  if (!corpus.length) { console.error('ANALYZER STOP: empty corpus at ' + CORPUS); process.exit(2); }
  // Anchor check: all configs on one anchor.
  const anchors = new Set(corpus.map(c => c.anchorCommit));
  if (anchors.size > 1) { console.error('ANALYZER STOP: corpus spans multiple anchors: ' + [...anchors].join(',')); process.exit(2); }
  const anchor = [...anchors][0];

  const rows = corpus.map(c => {
    const attr = (c.gateVector && c.gateVector.attr) || {};
    const binding = attr.binding || (attr.outcome === 'unlocked' ? 'unlocked' : 'null');
    return { id: cfgId(c), cls: classify(c), binding };
  });
  const denom = rows.filter(r => r.cls.channel !== 'never-bound');
  const named = denom.filter(r => r.cls.channel !== 'UNEXPLAINED');
  const unexplained = denom.filter(r => r.cls.channel === 'UNEXPLAINED');
  const mismatches = rows.filter(r => r.cls.mismatch);

  // Cross-check: stored attribution vs recompute.
  const crossCheck = rows.filter(r => r.cls.recomputed === 'UNEXPLAINED:locked-no-unmet');

  // ---- Binder ranking (defer5-binding configs, per bar) ----
  const defer5Rows = rows.filter(r => r.binding === 'defer5');
  const binderCounts = { armored: 0, armed: 0, tricks: 0, veterans: 0 };
  const neverMetCounts = { armored: 0, armed: 0, tricks: 0, veterans: 0 };
  for (const r of defer5Rows) {
    const bars = (r.cls.bars || {});
    for (const b of BARS4) {
      if (bars[b] === 'never-met' || bars[b] === 'met-then-lost') binderCounts[b]++;
      if (bars[b] === 'never-met') neverMetCounts[b]++;
    }
  }
  const defer4Rows = rows.filter(r => r.binding === 'defer4');
  const binderCounts4 = { armored: 0, armed: 0, tricks: 0, veterans: 0 };
  for (const r of defer4Rows) {
    const bars = (r.cls.bars || {});
    for (const b of BARS4) {
      if (bars[b] === 'never-met' || bars[b] === 'met-then-lost') binderCounts4[b]++;
    }
  }

  // ---- Coincidence overlap distribution ----
  const overlaps = corpus.map(c => c.overlapDays | 0);
  const overlapHist = {};
  for (const o of overlaps) overlapHist[o === 0 ? '0' : (o <= 7 ? '1-7' : (o <= 30 ? '8-30' : '31+'))] = (overlapHist[o === 0 ? '0' : (o <= 7 ? '1-7' : (o <= 30 ? '8-30' : '31+'))] || 0) + 1;

  // ---- Wall block ----
  let national = 0, table = 0, wins = 0, wave4 = 0, wave5 = 0;
  const surv = [];
  const deathKinds = {};
  for (const c of corpus) {
    if (c.national) national++; if (c.table) table++; if (c.won) wins++;
    if ((c.maxWave | 0) >= 4) wave4++; if ((c.maxWave | 0) >= 5) wave5++;
    surv.push(c.gameDays | 0);
    for (const k of Object.keys(c.deaths || {})) deathKinds[k] = (deathKinds[k] || 0) + (c.deaths[k] | 0);
  }
  surv.sort((a, b) => a - b);
  const medSurv = surv.length ? surv[Math.floor(surv.length / 2)] : 0;
  const bindings = {};
  for (const r of rows) bindings[r.binding || 'null'] = (bindings[r.binding || 'null'] || 0) + 1;

  // ---- wave-4+ killer formation (veterans substrate context) ----
  let w4kills = 0; const w4vids = new Set();
  for (const c of corpus) {
    for (const e of dedupKills(c.waveKillLog)) {
      if ((e.w | 0) >= 4) { w4kills++; if (e.by) w4vids.add(e.by); }
    }
  }

  const diagGo = denom.length > 0 && (named.length / denom.length) >= 0.9 && unexplained.length === 0;
  const verdict = diagGo ? 'DIAG-GO' : 'DIAG-NO-GO';

  const report = {
    verdict,
    diagGoRatio: denom.length ? `${named.length}/${denom.length}` : '0/0 (empty denominator)',
    anchor, n: corpus.length,
    channels: {},
    binderRankingDefer5: binderCounts,
    neverMetCountsDefer5: neverMetCounts,
    binderRankingDefer4: binderCounts4,
    overlap: { per: corpus.map(c => ({ id: cfgId(c), overlapDays: c.overlapDays | 0, first: c.firstOverlapDay })), hist: overlapHist },
    bindings,
    wall: { national, table, wins, wave4, wave5, medSurv, maxSurv: Math.max(...surv) },
    deathKinds,
    wave4plusKills: w4kills, wave4plusKillerVids: w4vids.size,
    defer5HeldDays: corpus.map(c => ({ id: cfgId(c), held: c.defer5HeldDays | 0, first: c.firstDefer5Day })),
    firstDefer5DayMedian: (() => { const a = corpus.map(c => c.firstDefer5Day).filter(x => x != null).sort((x, y) => x - y); return a.length ? a[Math.floor(a.length / 2)] : null; })(),
    recomputeMismatches: mismatches.map(r => ({ id: r.id, stored: r.binding, recomputed: r.cls.recomputed })),
    instrumentErrors: corpus.filter(c => (c.instrumentErrors || []).length).map(c => ({ id: cfgId(c), errs: c.instrumentErrors })),
    configs: rows.map(r => ({ id: r.id, binding: r.binding, channel: r.cls.channel, sub: r.cls.sub || null, bars: r.cls.bars || null, overlapDays: r.cls.overlapDays != null ? r.cls.overlapDays : null })),
  };
  for (const r of denom) {
    const ch = r.cls.channel;
    if (!report.channels[ch]) report.channels[ch] = [];
    report.channels[ch].push(r.id);
  }

  const outPath = path.join(REPO, 'evidence', '2026-10-23', 'defer5rediag-attribution.json');
  fs.writeFileSync(outPath, JSON.stringify(report, null, 1) + '\n');

  console.log(`=== defer5rediag attribution (${anchor}, n=${corpus.length}) ===`);
  console.log(`DIAG-GO bar: >=90% of defer4/defer5-binding configs named, 0 unexplained`);
  console.log(`Denominator: ${denom.length} configs | named: ${named.length} | unexplained: ${unexplained.length}`);
  console.log(`VERDICT: ${verdict} (${report.diagGoRatio})`);
  console.log('--- channels ---');
  for (const [ch, ids] of Object.entries(report.channels)) console.log(`  ${ch}: ${ids.length} [${ids.join(' ')}]`);
  console.log('--- end bindings ---');
  console.log('  ' + Object.entries(bindings).map(([k, v]) => `${k}:${v}`).join(' '));
  console.log('--- defer5 binder ranking (bar short at end) ---');
  for (const b of BARS4) console.log(`  ${b}: binds ${binderCounts[b]}/${defer5Rows.length} (never-met ${neverMetCounts[b]})`);
  console.log('--- defer4 binder ranking ---');
  for (const b of BARS4) console.log(`  ${b}: binds ${binderCounts4[b]}/${defer4Rows.length}`);
  console.log('--- coincidence overlap (days all four r5 bars simultaneous) ---');
  console.log('  hist: ' + JSON.stringify(overlapHist));
  console.log('--- wall ---');
  console.log(`  national ${national}/${corpus.length} table ${table}/${corpus.length} wins ${wins}/${corpus.length} wave4 ${wave4}/${corpus.length} wave5 ${wave5}/${corpus.length} medSurv ${medSurv}d`);
  console.log('--- death kinds ---');
  console.log('  ' + Object.entries(deathKinds).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}:${v}`).join(' '));
  console.log(`--- wave-4+ kills ${w4kills} by ${w4vids.size} distinct vids ---`);
  console.log(`--- recompute mismatches: ${mismatches.length} | instrument errors: ${report.instrumentErrors.length} ---`);
  console.log('attribution JSON: ' + outPath);
}

if (require.main === module) main();
module.exports = { classify, dedupKills, cfgId, BARS4, DEM4, DEM5, load };
