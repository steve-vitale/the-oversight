#!/usr/bin/env node
// wallseg-analyze.js — wall end-binding re-attribution judge (arm
// sim-wallseg, run fleshout-20261024T0215Z, axis scale-onramp).
//
// Reads evidence/2026-10-24/perseed-wallseg/*.json (w5gates-lib
// UNMODIFIED instrument, full landed substrate census) and:
//
//  1. Re-attributes every config's END BINDING with the defer5rediag
//     classify() (REQUIRED, not copied) — recomputeEndBinding from the
//     final trace row (w3rung / stand-raw / plenty-cap / defer4 / defer5 /
//     w4faced / unlocked), then the named channels for defer4/defer5
//     (bar-never-met:<bars> / met-but-not-simultaneous /
//     overlap-before-standing / gate-released).
//  2. Decomposes every stand-raw end-binding into the PRE-REGISTERED
//     dip/links sub-channels with the documented rule:
//
//     standing raw = war + diplomacy + min(plenty,cap) (standing.js:351);
//     diplomacy = 34 x seasoned regional+ links (standing.js:36,126-144).
//     The daily trace records t.dip (diplomacy points) and t.links.
//     dipPeak = max daily dip; endDip/endLinks = final-trace values;
//     dissolutionMag = dipPeak - endDip; dissolution events = single-day
//     dip drops with magnitude >= 102 (the trustbuffer revised classifier).
//       1. dissolutionMag >= 102 -> dip-driven: the village built the
//          diplomatic layer (>=3 links' worth) and LOST it post-formation
//          (the funeral correlated-shock / succession channel).
//       2. else, endLinks <= 0 AND dipPeak < 102 -> links-driven: the
//          village never built a seasoned regional+ diplomatic layer -
//          dip+links ~= zero all run.
//       3. else -> stand-other (war/plenty): diplomacy largely intact but
//          raw < 200 anyway - the shortfall sits in war/plenty.
//     Bar (b) of DIAG-GO passes iff every stand-raw config lands in
//     exactly one of the three - 0 unnamed.
//
//  3. Reports the wall numbers (national / table / wins, wave 4-5 unlocks,
//     median/max survival, death-cause shares), the defer5 binder ranking,
//     the coincidence overlap distribution, and wave-4+ kill formation.
//
// PRE-REGISTERED DIAG-GO (binding): (a) all 24 configs classified into end
// bindings with 0 unexplained; (b) the stand-raw dip/links split quantified
// with the rule documented; (c) a lever spec named for the binding segment
// (written in the evidence file, not by this script).
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const CORPUS = process.env.CORPUS || path.join(REPO, 'evidence', '2026-10-24', 'perseed-wallseg');
const { classify, dedupKills, cfgId, BARS4 } = require(path.join(REPO, 'scripts', 'defer5rediag-analyze'));

function load() {
  const out = [];
  for (const f of fs.readdirSync(CORPUS).filter(f => f.endsWith('.json'))) {
    out.push(JSON.parse(fs.readFileSync(path.join(CORPUS, f), 'utf8')));
  }
  out.sort((a, b) => a.seed - b.seed || (a.base < b.base ? -1 : 1));
  return out;
}

// Daily dip/links trajectory from the stored gate trace (t.dip = diplomacy
// points, t.links = seasoned regional+ link count; -1 is the w5gates-lib
// error sentinel and is skipped).
function dipTrajectory(c) {
  const out = [];
  for (const t of (c.gateTrace || [])) {
    const d = (t.dip | 0);
    if (d < 0) continue;
    out.push({ day: t.d | 0, dip: d, links: t.links | 0, raw: t.raw | 0 });
  }
  return out;
}

// The PRE-REGISTERED stand-raw sub-classifier. Returns
// { sub, dipPeak, peakDay, endDip, endLinks, rawEnd, dissolutionMag, nDissEvents }.
function subClassifyStandRaw(c) {
  const tr = dipTrajectory(c);
  if (!tr.length) return { sub: 'UNNAMED', note: 'no dip trajectory' };
  let dipPeak = -1, peakDay = null;
  for (const r of tr) if (r.dip > dipPeak) { dipPeak = r.dip; peakDay = r.day; }
  const last = tr[tr.length - 1];
  const endDip = last.dip, endLinks = last.links, rawEnd = last.raw;
  const dissolutionMag = dipPeak - endDip;
  let nDissEvents = 0;
  for (let i = 1; i < tr.length; i++) {
    if (tr[i].dip - tr[i - 1].dip <= -102) nDissEvents++;
  }
  if (dissolutionMag >= 102) {
    return { sub: 'dip-driven', dipPeak, peakDay, endDip, endLinks, rawEnd, dissolutionMag, nDissEvents };
  }
  if (endLinks <= 0 && dipPeak < 102) {
    return { sub: 'links-driven', dipPeak, peakDay, endDip, endLinks, rawEnd, dissolutionMag, nDissEvents };
  }
  return { sub: 'stand-other', dipPeak, peakDay, endDip, endLinks, rawEnd, dissolutionMag, nDissEvents };
}

function main() {
  const corpus = load();
  if (!corpus.length) { console.error('ANALYZER STOP: empty corpus at ' + CORPUS); process.exit(2); }
  const anchors = new Set(corpus.map(c => c.anchorCommit));
  if (anchors.size > 1) { console.error('ANALYZER STOP: corpus spans multiple anchors: ' + [...anchors].join(',')); process.exit(2); }
  const anchor = [...anchors][0];

  const rows = corpus.map(c => {
    const attr = (c.gateVector && c.gateVector.attr) || {};
    const binding = attr.binding || (attr.outcome === 'unlocked' ? 'unlocked' : 'null');
    const cls = classify(c);
    const row = { id: cfgId(c), cls, binding };
    // End-binding for the census: the trace-recomputed binding (engine
    // truth from the final row), with stored-vs-recomputed agreement as a
    // cross-check.
    const endBinding = cls.recomputed && !String(cls.recomputed).startsWith('UNEXPLAINED') ? cls.recomputed : binding;
    row.endBinding = endBinding;
    if (endBinding === 'stand-raw') row.standSub = subClassifyStandRaw(c);
    return row;
  });

  const denom = rows; // every config ends bound to something (or unlocked)
  const unexplainedEnd = rows.filter(r => r.cls.channel === 'UNEXPLAINED' || String(r.endBinding).startsWith('UNEXPLAINED'));
  const named = rows.filter(r => r.cls.channel !== 'UNEXPLAINED' && !String(r.endBinding).startsWith('UNEXPLAINED'));

  const standRows = rows.filter(r => r.endBinding === 'stand-raw');
  const unnamedStand = standRows.filter(r => !r.standSub || r.standSub.sub === 'UNNAMED');
  const standSubs = {};
  for (const r of standRows) {
    const s = (r.standSub && r.standSub.sub) || 'UNNAMED';
    if (!standSubs[s]) standSubs[s] = [];
    standSubs[s].push(r.id);
  }

  const mismatches = rows.filter(r => r.cls.mismatch);

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
  const overlapHist = {};
  for (const c of corpus) {
    const o = c.overlapDays | 0;
    const k = o === 0 ? '0' : (o <= 7 ? '1-7' : (o <= 30 ? '8-30' : '31+'));
    overlapHist[k] = (overlapHist[k] || 0) + 1;
  }

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

  const endBindings = {};
  for (const r of rows) endBindings[r.endBinding || 'null'] = (endBindings[r.endBinding || 'null'] || 0) + 1;

  const channels = {};
  for (const r of denom) {
    const ch = r.cls.channel;
    if (!channels[ch]) channels[ch] = [];
    channels[ch].push(r.id);
  }

  // ---- wave-4+ killer formation ----
  let w4kills = 0; const w4vids = new Set();
  for (const c of corpus) {
    for (const e of dedupKills(c.waveKillLog)) {
      if ((e.w | 0) >= 4) { w4kills++; if (e.by) w4vids.add(e.by); }
    }
  }

  const diagGoA = unexplainedEnd.length === 0;
  const diagGoB = unnamedStand.length === 0;
  const verdict = (diagGoA && diagGoB) ? 'DIAG-GO' : 'DIAG-NO-GO';

  const report = {
    verdict,
    diagGo: { a_endBindingsNamed: `${named.length}/${denom.length}`, b_standSubNamed: `${standRows.length - unnamedStand.length}/${standRows.length}` },
    anchor, n: corpus.length,
    endBindings,
    channels,
    standRawSub: Object.fromEntries(Object.entries(standSubs).map(([k, v]) => [k, { n: v.length, ids: v }])),
    standRawDetail: standRows.map(r => Object.assign({ id: r.id }, r.standSub)),
    binderRankingDefer5: binderCounts,
    neverMetCountsDefer5: neverMetCounts,
    binderRankingDefer4: binderCounts4,
    overlap: { per: corpus.map(c => ({ id: cfgId(c), overlapDays: c.overlapDays | 0, first: c.firstOverlapDay })), hist: overlapHist },
    wall: { national, table, wins, wave4, wave5, medSurv, maxSurv: surv.length ? Math.max(...surv) : 0 },
    deathKinds,
    wave4plusKills: w4kills, wave4plusKillerVids: w4vids.size,
    defer5HeldDays: corpus.map(c => ({ id: cfgId(c), held: c.defer5HeldDays | 0, first: c.firstDefer5Day })),
    firstDefer5DayMedian: (() => { const a = corpus.map(c => c.firstDefer5Day).filter(x => x != null).sort((x, y) => x - y); return a.length ? a[Math.floor(a.length / 2)] : null; })(),
    recomputeMismatches: mismatches.map(r => ({ id: r.id, stored: r.binding, recomputed: r.cls.recomputed })),
    instrumentErrors: corpus.filter(c => (c.instrumentErrors || []).length).map(c => ({ id: cfgId(c), errs: c.instrumentErrors })),
    configs: rows.map(r => ({ id: r.id, endBinding: r.endBinding, binding: r.binding, channel: r.cls.channel, sub: r.cls.sub || null, standSub: (r.standSub && r.standSub.sub) || null, bars: r.cls.bars || null })),
  };

  const outPath = path.join(REPO, 'evidence', '2026-10-24', 'wallseg-attribution.json');
  fs.writeFileSync(outPath, JSON.stringify(report, null, 1) + '\n');

  console.log(`=== wallseg attribution (${anchor}, n=${corpus.length}) ===`);
  console.log(`DIAG-GO bar: (a) all 24 end-bindings named, 0 unexplained | (b) stand-raw dip/links split quantified | (c) lever spec in evidence`);
  console.log(`(a) named end-bindings: ${named.length}/${denom.length} | unexplained: ${unexplainedEnd.length}`);
  console.log(`(b) stand-raw sub-classified: ${standRows.length - unnamedStand.length}/${standRows.length} | unnamed: ${unnamedStand.length}`);
  console.log(`VERDICT: ${verdict}`);
  console.log('--- end bindings ---');
  console.log('  ' + Object.entries(endBindings).map(([k, v]) => `${k}:${v}`).join(' '));
  console.log('--- stand-raw dip/links split ---');
  for (const [s, ids] of Object.entries(standSubs)) console.log(`  ${s}: ${ids.length} [${ids.join(' ')}]`);
  console.log('--- defer4/defer5 channels ---');
  for (const [ch, ids] of Object.entries(channels)) console.log(`  ${ch}: ${ids.length}`);
  console.log('--- defer5 binder ranking (bar short at end) ---');
  for (const b of BARS4) console.log(`  ${b}: binds ${binderCounts[b]}/${defer5Rows.length} (never-met ${neverMetCounts[b]})`);
  console.log('--- coincidence overlap (days all four r5 bars simultaneous) ---');
  console.log('  hist: ' + JSON.stringify(overlapHist));
  console.log('--- wall ---');
  console.log(`  national ${national}/${corpus.length} table ${table}/${corpus.length} wins ${wins}/${corpus.length} wave4 ${wave4}/${corpus.length} wave5 ${wave5}/${corpus.length} medSurv ${medSurv}d maxSurv ${report.wall.maxSurv}d`);
  console.log('--- death kinds ---');
  console.log('  ' + Object.entries(deathKinds).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}:${v}`).join(' '));
  console.log(`--- wave-4+ kills ${w4kills} by ${w4vids.size} distinct vids ---`);
  console.log(`--- recompute mismatches: ${mismatches.length} | instrument errors: ${report.instrumentErrors.length} ---`);
  console.log('attribution JSON: ' + outPath);
}

if (require.main === module) main();
module.exports = { classify, subClassifyStandRaw, dipTrajectory, cfgId, load };
