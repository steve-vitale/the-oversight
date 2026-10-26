#!/usr/bin/env node
// analyze-spoilvol-b.js — per-channel spoil-removal volume analysis.
//
// Reads evidence/2026-10-26/sim-spoilvol-b-corpus/*.json (pilot) or
// ...-corpus-confirm/*.json (confirm, --confirm) and prints: per-seed
// per-channel inflow / draws / sweep-removal / median post-arrival
// stock, the pre-registered GO legs, ledger residuals, bonus
// statistics, violation totals, appearance counts, the sense block,
// and wall numbers. No game code is loaded; this is pure JSON
// arithmetic over the committed corpus.
'use strict';
const fs = require('fs');
const path = require('path');

const confirm = process.argv.includes('--confirm');
const DIR = process.env.CORPUS_DIR || path.join(
  __dirname, '..', 'evidence', '2026-10-26',
  confirm ? 'sim-spoilvol-b-corpus-confirm' : 'sim-spoilvol-b-corpus');
const FOCAL = ["Lamb's Quarters", 'Cattail', 'Burdock'];

function medianOf(xs) {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}
function sum(xs) { return xs.reduce((t, x) => t + x, 0); }
function fmt(n) {
  if (n == null || !Number.isFinite(n)) return String(n);
  return Math.round(n).toLocaleString();
}

function loadCorpus() {
  const files = fs.readdirSync(DIR).filter(f => f.endsWith('.json')).sort();
  return files.map(f => ({ file: f, data: JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')) }));
}

function channelStats(ps) {
  // Returns Map channel -> {inflow, mealDrawn, otherDrawn, sweep, firstDay, stocks[]}
  const m = new Map();
  const get = (c) => {
    if (!m.has(c)) m.set(c, { inflow: 0, mealDrawn: 0, otherDrawn: 0, sweep: 0, firstDay: null, stocks: [] });
    return m.get(c);
  };
  for (const r of (ps.inflows || [])) {
    if (r.door === 'stock' && !(r.kcal > 0)) continue;
    if (r.door === 'pantryAdd' && !r.added) continue;
    if (r.name == null) continue;
    const b = get(String(r.name));
    b.inflow += r.kcal || 0;
    if (b.firstDay == null || r.day < b.firstDay) b.firstDay = r.day;
  }
  for (const r of (ps.mealDrawRecords || [])) {
    if (r.kind !== 'pantryDraw') continue;
    for (const it of (r.items || [])) {
      if (it.name == null) continue;
      const b = get(String(it.name));
      const kcal = (it.units || 0) * (it.kcalEach || 0);
      if (r.context === 'other') b.otherDrawn += kcal; else b.mealDrawn += kcal;
    }
  }
  for (const sw of ((ps.spoilEvents || {}).sweeps || [])) {
    const pan = (sw.removed || {}).pantry || {};
    for (const bc of (pan.byChannel || [])) {
      const b = get(String(bc.channel));
      b.sweep += bc.kcal || 0;
    }
  }
  for (const sd of (ps.spoilDays || [])) {
    for (const ch of (sd.channels || [])) {
      const b = get(String(ch.channel));
      b.stocks.push({ day: sd.day, fresh: ch.freshKcal || 0 });
    }
  }
  for (const b of m.values()) {
    const post = b.stocks.filter(s => b.firstDay != null && s.day >= b.firstDay).map(s => s.fresh);
    b.medianPostStock = medianOf(post);
    b.postN = post.length;
    const first = b.stocks.find(s => b.firstDay != null && s.day < b.firstDay);
    const last = b.stocks[b.stocks.length - 1];
    b.firstStock = first ? first.fresh : 0;
    b.lastStock = last ? last.fresh : 0;
    b.residual = (b.lastStock - b.firstStock) - (b.inflow - b.mealDrawn - b.otherDrawn - b.sweep);
  }
  return m;
}

function main() {
  const corpus = loadCorpus();
  console.log(`corpus: ${DIR} (${corpus.length} seeds)`);
  let totSweeps = 0, violRemoved = 0, violKept = 0, bonusVals = [];
  let bonusSaved = {}; // NOTE: per-sweep STANDING piles, not flows — summed
  // only to derive per-sweep medians below, never reported as a total.
  const bonusSavedPerSweep = [];
  let packKcal = 0, prepKcal = 0, corpseKcal = 0;
  const pooled = new Map(); // channel -> {inflow, draws, sweep, seeds}
  const appearances = new Map();
  const wall = { national: 0, table: 0, wins: 0, wave45: 0, survival: [], deaths: 0, causes: {} };
  const perSeed = [];
  for (const { file, data: ps } of corpus) {
    const ch = channelStats(ps);
    const sweeps = ((ps.spoilEvents || {}).sweeps || []);
    totSweeps += sweeps.length;
    for (const sw of sweeps) {
      const v = ((sw.violations || {}).pantry || {});
      violRemoved += v.removedNotSpoiledKcal || 0;
      violKept += v.keptSpoiledKcal || 0;
      if (sw.bonus != null) bonusVals.push(sw.bonus);
      let sweepSaved = 0;
      for (const bc of (((sw.bonusSaved || {}).pantry || {}).byChannel || [])) {
        bonusSaved[bc.channel] = (bonusSaved[bc.channel] || 0) + (bc.kcal || 0);
        sweepSaved += bc.kcal || 0;
      }
      bonusSavedPerSweep.push(sweepSaved);
      for (const cont of ['pack', 'prep', 'corpse']) {
        const k = ((sw.removed || {})[cont] || {}).totalKcal || 0;
        if (cont === 'pack') packKcal += k;
        if (cont === 'prep') prepKcal += k;
        if (cont === 'corpse') corpseKcal += k;
      }
    }
    for (const [c, b] of ch) {
      if (!pooled.has(c)) pooled.set(c, { inflow: 0, draws: 0, sweep: 0, seeds: 0 });
      const p = pooled.get(c);
      p.inflow += b.inflow; p.draws += b.mealDrawn + b.otherDrawn; p.sweep += b.sweep;
      if (b.inflow > 0) {
        p.seeds += 1;
        appearances.set(c, (appearances.get(c) || 0) + 1);
      }
    }
    wall.national += ps.national ? 1 : 0;
    wall.table += ps.table ? 1 : 0;
    wall.wins += ps.win ? 1 : 0;
    if ((ps.waveReach || []).includes(4) || (ps.waveReach || []).includes(5)) wall.wave45 += 1;
    wall.survival.push(ps.daysAlive || 0);
    wall.deaths += ps.deaths || 0;
    for (const [k, v] of Object.entries(ps.deathCauses || {})) wall.causes[k] = (wall.causes[k] || 0) + v;
    perSeed.push({ seed: ps.seed, days: ps.daysAlive, rank: ps.rank, wave: (ps.waveReach || []).length,
      deaths: ps.deaths, sweeps: sweeps.length, ch });
  }
  for (const s of perSeed) {
    console.log(`\nseed ${s.seed}: days=${s.days} rank=${s.rank} wave=${s.wave} deaths=${s.deaths} sweeps=${s.sweeps}`);
    for (const [c, b] of [...s.ch.entries()].sort((a, b) => b[1].inflow - a[1].inflow)) {
      if (b.inflow < 10000 && !FOCAL.includes(c)) continue;
      console.log(`  ${c}: in=${fmt(b.inflow)} meal=${fmt(b.mealDrawn)} other=${fmt(b.otherDrawn)} sweep=${fmt(b.sweep)} medPost=${fmt(b.medianPostStock)} (n=${b.postN}) firstDay=${b.firstDay} resid=${fmt(b.residual)}`);
    }
  }
  console.log('\nPOOLED (pilot band):');
  for (const c of FOCAL) {
    const p = pooled.get(c) || { inflow: 0, draws: 0, sweep: 0, seeds: 0 };
    console.log(`  ${c}: seedsGrowing=${p.seeds} inflow=${fmt(p.inflow)} draws=${fmt(p.draws)} sweep=${fmt(p.sweep)} netMinusDraw=${fmt(p.inflow - p.draws)}`);
  }
  const lq = pooled.get("Lamb's Quarters") || { sweep: 0, inflow: 0, draws: 0 };
  const cat = pooled.get('Cattail') || { sweep: 0, inflow: 0, draws: 0 };
  const ratio = lq.sweep > 0 ? cat.sweep / lq.sweep : null;
  const share = (cat.inflow - cat.draws) > 0 ? cat.sweep / (cat.inflow - cat.draws) : null;
  console.log(`\nGO LEGS:`);
  console.log(`  leg2 integrity: removedNotSpoiledKcal=${fmt(violRemoved)} keptSpoiledKcal=${fmt(violKept)} (bar: both 0)`);
  console.log(`  leg3 appearance: LQ seeds=${appearances.get("Lamb's Quarters") || 0} Cattail seeds=${appearances.get('Cattail') || 0} (bar: each >= 2)`);
  console.log(`  leg4a ratio: Cattail sweep / LQ sweep = ${ratio == null ? 'n/a' : ratio.toFixed(2)} (bar: >= 1.50)`);
  console.log(`  leg4b share: Cattail sweep / (Cattail inflow - draws) = ${share == null ? 'n/a' : share.toFixed(3)} (bar: >= 0.50)`);
  console.log(`\nBONUS: sweeps=${totSweeps} bonus median=${medianOf(bonusVals)} min=${bonusVals.length ? Math.min(...bonusVals) : null} max=${bonusVals.length ? Math.max(...bonusVals) : null}`);
  const bonusDist = {};
  for (const b of bonusVals) bonusDist[b] = (bonusDist[b] || 0) + 1;
  console.log(`  bonus distribution (sweeps by spoilBonusDays): ${JSON.stringify(bonusDist)}`);
  console.log(`  bonus-saved standing pantry pile per sweep: median=${fmt(medianOf(bonusSavedPerSweep))} max=${fmt(Math.max(...bonusSavedPerSweep))} (a STANDING pile re-counted each sweep, NOT a flow — never summed as volume)`);
  // Family ledgers: base channel + its ' (dried)' variant combined.
  console.log(`\nFAMILY LEDGERS (base + ' (dried)' variant, pooled):`);
  for (const c of FOCAL) {
    const a = pooled.get(c) || { inflow: 0, draws: 0, sweep: 0 };
    const d = pooled.get(c + ' (dried)') || { inflow: 0, draws: 0, sweep: 0 };
    console.log(`  ${c}: inflow=${fmt(a.inflow + d.inflow)} draws=${fmt(a.draws + d.draws)} sweep=${fmt(a.sweep + d.sweep)} (dried-variant inflow=${fmt(d.inflow)} — dried stock enters with NO door record)`);
  }
  console.log(`  secondary sweep totals: pack=${fmt(packKcal)} prep=${fmt(prepKcal)} corpse=${fmt(corpseKcal)}`);
  console.log(`\nWALL: national=${wall.national}/${corpus.length} table=${wall.table}/${corpus.length} wins=${wall.wins}/${corpus.length} wave45=${wall.wave45}/${corpus.length} medianSurvival=${medianOf(wall.survival)} maxSurvival=${Math.max(...wall.survival)} deaths=${wall.deaths}`);
  console.log(`  deathCauses: ${JSON.stringify(wall.causes)}`);
  // Sense: first spoil voice line in the corpus.
  for (const { data: ps } of corpus) {
    const line = (ps.spoilSayLines || [])[0];
    if (line) { console.log(`\nSENSE seed ${ps.seed} day ${line.day}: ${line.line}`); break; }
  }
}

main();
