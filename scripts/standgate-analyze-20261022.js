#!/usr/bin/env node
// standgate-analyze-20261022.js — corpus analysis for the sim-standgate arm.
// Reads evidence/2026-10-22/perseed-standgate/{leadfeast,belongfeast}/s*.json.
//
// Reports:
//   1. PRIMARY (DIAG-GO): share of standing gains attributed to named
//      channels (blood/bonds/bread), unexplained residual count.
//   2. Channel table + blood grain (gains by wave), losses by channel.
//   3. Earnable vs win-proxy: gains by context (pre-win/post-win, pre-table,
//      rank), standing trajectory vs win state.
//   4. Wall numbers: national/table/wins, wave 4-5 unlocks, median survival,
//      death-cause shares.
//   5. SENSE-TESTING: transcript lines around the 3 largest single-day
//      standing gains.
//
// Usage: node scripts/standgate-analyze-20261022.js [--top <n>]
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const EVID = path.join(REPO, 'evidence', '2026-10-22', 'perseed-standgate');
const SG = require('./standgate-lib');

function loadAll() {
  const runs = [];
  for (const pol of fs.readdirSync(EVID)) {
    const d = path.join(EVID, pol);
    if (!fs.statSync(d).isDirectory()) continue;
    for (const f of fs.readdirSync(d)) {
      if (!/\.json$/.test(f)) continue;
      runs.push(JSON.parse(fs.readFileSync(path.join(d, f), 'utf8')));
    }
  }
  return runs;
}

function rel(line, day) {
  return /feast|standing|draft|veteran|kill|slain|link|bond|court|allied|bread|harvest|hunt|tribute|polity|realm|wave/i.test(line);
}

function senseWindow(r, day) {
  const out = [];
  for (const l of (r.sayLines || [])) {
    if (Math.abs((l.d | 0) - day) <= 1 && rel(l.text, day)) out.push(l);
  }
  return out.slice(0, 14);
}

function main() {
  const runs = loadAll();
  if (!runs.length) { console.error('ANALYZE: no per-seed JSONs.'); process.exit(2); }
  console.log(`runs: ${runs.length}`);
  // Dedupe by (policyId, seed), keep the longest horizon (phase reruns are
  // deterministic extensions, not new runs — same rule as sim-windowreach-r3).
  const key = (r) => r.policyId + '/' + r.seed;
  const byKey = new Map();
  for (const r of runs) {
    const k = key(r);
    if (!byKey.has(k) || (r.gameDays | 0) > (byKey.get(k).gameDays | 0)) byKey.set(k, r);
  }
  const dedup = [...byKey.values()];
  console.log(`deduped runs: ${dedup.length}`);

  // 1. PRIMARY — corpus attribution.
  const traces = dedup.map(r => ({ seed: r.seed, policyId: r.policyId, samples: r.samples || [] }));
  const c = SG.sgAttributeCorpus(traces);
  console.log('\n=== PRIMARY (DIAG-GO) ===');
  console.log(`attributed pts=${c.attributedPts} residual pts=${c.residualPts} residual events=${c.residualEvents}`);
  console.log(`share attributed=${(c.shareAttributed * 100).toFixed(2)}%`);
  console.log(`DIAG-GO: ${c.diagGo ? 'GO' : 'NO-GO'} (threshold: >=95%, 0 unexplained)`);
  if (c.residList.length) { console.log('residuals:'); for (const x of c.residList.slice(0, 10)) console.log('  ', JSON.stringify(x)); }

  // 2. Channel table + blood grain.
  console.log('\n=== CHANNEL TABLE (positive gains, pts) ===');
  for (const ch of SG.CHANNELS) {
    const b = c.byChannel[ch.id];
    console.log(`${ch.id.padEnd(6)} gains=${b.gains} pts=${b.pts} losses=${b.losses}`);
  }
  // Blood grain: gains split by wave from per-wave ledger points.
  const waveGains = { 3: 0, 4: 0, 5: 0 };
  const waveGainEvents = { 3: 0, 4: 0, 5: 0 };
  for (const t of traces) {
    for (let i = 1; i < t.samples.length; i++) {
      const p = t.samples[i - 1], q = t.samples[i];
      for (const w of [3, 4, 5]) {
        const dw = ((q['w' + w] | 0) - (p['w' + w] | 0));
        if (dw > 0) { waveGains[w] += dw * 25; waveGainEvents[w]++; }
      }
    }
  }
  console.log(`blood by wave: w3=${waveGains[3]}pts (${waveGainEvents[3]} events) w4=${waveGains[4]}pts (${waveGainEvents[4]} events) w5=${waveGains[5]}pts (${waveGainEvents[5]} events)`);

  // 3. Earnable vs win-proxy: attribute each gain's pts to context.
  const ctx = {
    preWin: 0, postWin: 0, noWin: 0, preTable: 0, postTable: 0,
    byRank: { 0: 0, 1: 0, 2: 0, 3: 0 }, byChannelCtx: {},
    firstGainDay: [], maxRaw: [], maxRawWon: [],
  };
  for (const r of dedup) {
    const ss = r.samples || [];
    let sawFirst = false;
    let maxR = 0;
    for (let i = 1; i < ss.length; i++) {
      const p = ss[i - 1], q = ss[i];
      maxR = Math.max(maxR, q.raw | 0);
      const g = SG.sgDailyGain(p, q);
      const pts = g.gains.filter(x => x.dPoints > 0).reduce((a, x) => a + x.dPoints, 0);
      if (pts <= 0) continue;
      if (!sawFirst) { ctx.firstGainDay.push(q.day | 0); sawFirst = true; }
      const won = (q.won | 0) === 1;
      const table = (q.table | 0) === 1;
      const rank = (q.rank | 0);
      if (r.won && won) ctx.postWin += pts; else if (r.won && !won) ctx.preWin += pts; else ctx.noWin += pts;
      if (table) ctx.postTable += pts; else ctx.preTable += pts;
      ctx.byRank[rank] = (ctx.byRank[rank] || 0) + pts;
      for (const x of g.gains) if (x.dPoints > 0) {
        ctx.byChannelCtx[x.channel] = ctx.byChannelCtx[x.channel] || { preWin: 0, postWin: 0, noWin: 0 };
        const e = ctx.byChannelCtx[x.channel];
        if (r.won && won) e.postWin += x.dPoints; else if (r.won && !won) e.preWin += x.dPoints; else e.noWin += x.dPoints;
      }
    }
    ctx.maxRaw.push({ seed: r.seed, pol: r.policyId, max: maxR, won: r.won, table: r.table, national: r.national });
  }
  const tot = ctx.preWin + ctx.postWin + ctx.noWin;
  console.log('\n=== EARNABLE vs WIN-PROXY ===');
  console.log(`gain-pts: preWin=${ctx.preWin} postWin=${ctx.postWin} noWin=${ctx.noWin} (total ${tot})`);
  console.log(`preTable=${ctx.preTable} postTable=${ctx.postTable}`);
  console.log(`by rank: village=${ctx.byRank[0] || 0} regional=${ctx.byRank[1] || 0} national=${ctx.byRank[2] || 0} global=${ctx.byRank[3] || 0}`);
  for (const ch of SG.CHANNELS) {
    const e = ctx.byChannelCtx[ch.id] || { preWin: 0, postWin: 0, noWin: 0 };
    console.log(`  ${ch.id}: preWin=${e.preWin} postWin=${e.postWin} noWin=${e.noWin}`);
  }
  const fd = ctx.firstGainDay.slice().sort((a, b) => a - b);
  const med = fd.length ? fd[fd.length >> 1] : -1;
  console.log(`median first-gain day=${med} (n=${fd.length})`);
  const preShare = tot > 0 ? (ctx.preWin + ctx.noWin) / tot : 0;
  console.log(`pre-win share of gains=${(preShare * 100).toFixed(1)}%`);
  // Standing vs win state.
  const highNoWin = ctx.maxRaw.filter(x => x.max >= 150 && !x.won);
  console.log(`runs reaching standing>=150 without winning: ${highNoWin.length}/${ctx.maxRaw.length} ${highNoWin.length ? JSON.stringify(highNoWin.slice(0, 6)) : ''}`);
  const gateHitNoUnlock = ctx.maxRaw.filter(x => x.max >= 200);
  console.log(`runs reaching raw>=200: ${gateHitNoUnlock.length}`);

  // 4. Wall numbers.
  const n = dedup.length;
  const nNational = dedup.filter(r => r.national).length;
  const nTable = dedup.filter(r => r.table).length;
  const nWins = dedup.filter(r => r.won).length;
  const nExiled = dedup.filter(r => r.exiled).length;
  const nW4 = dedup.filter(r => r.wave4).length;
  const nW5 = dedup.filter(r => r.wave5).length;
  const surv = dedup.map(r => r.gameDays | 0).sort((a, b) => a - b);
  const medS = surv.length ? surv[surv.length >> 1] : 0;
  const deathCauses = {};
  for (const r of dedup) for (const k of Object.keys(r.deaths || {})) deathCauses[k] = (deathCauses[k] || 0) + r.deaths[k];
  const dcTop = Object.entries(deathCauses).sort((a, b) => b[1] - a[1]).slice(0, 6);
  console.log('\n=== WALL NUMBERS ===');
  console.log(`n=${n} national=${nNational} table=${nTable} wins=${nWins} exiled=${nExiled} wave4=${nW4} wave5=${nW5}`);
  console.log(`median survival=${medS}d max=${surv[surv.length - 1]}d min=${surv[0]}d`);
  console.log(`top death causes: ${dcTop.map(([k, v]) => k + '=' + v).join(' ')}`);

  // 5. Sense-testing: 3 largest single-day gains.
  const evts = [];
  for (const r of dedup) {
    const ss = r.samples || [];
    for (let i = 1; i < ss.length; i++) {
      const p = ss[i - 1], q = ss[i];
      const g = SG.sgDailyGain(p, q);
      const pts = g.gains.filter(x => x.dPoints > 0).reduce((a, x) => a + x.dPoints, 0);
      if (pts > 0) evts.push({ seed: r.seed, pol: r.policyId, day: q.day | 0, pts, ch: g.gains.filter(x => x.dPoints > 0).map(x => x.channel + (x.dPoints > 0 ? '+' + x.dPoints : x.dPoints)).join(','), run: r });
    }
  }
  evts.sort((a, b) => b.pts - a.pts);
  const topN = parseInt((process.argv.find(a => a.startsWith('--top=')) || '--top=3').split('=')[1], 10) || 3;
  console.log(`\n=== SENSE-TESTING (top ${topN} single-day gains) ===`);
  for (const e of evts.slice(0, topN)) {
    console.log(`\n--- ${e.pol}/s${e.seed} day ${e.day}: +${e.pts} (${e.ch}) ---`);
    const win = senseWindow(e.run, e.day);
    if (!win.length) { console.log('(no relevant lines in window)'); continue; }
    for (const l of win) console.log(`  d${l.d}: ${l.text.slice(0, 220)}`);
  }
  if (!evts.length) console.log('(no positive standing gains in corpus)');
}

if (require.main === module) main();
module.exports = { loadAll };
