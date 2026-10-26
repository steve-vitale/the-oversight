#!/usr/bin/env node
// analyze-preservesched-resid-b.js — residual-pair analysis (DIAG only).
//
// sim-preservesched-resid-b, 2026-10-26, oversight-flesh-out-loop-b.
// Read-only analysis of the NEW corpus
// (evidence/2026-10-26/sim-preservesched-resid-b-corpus/,
// preservesched-resid-b-cap1 files, 8 seeds 9750-9757,
// competent-nofeast, 100d, SEATDRIVE=0 band).
//
// CONTROL (must pass before any residual judgment): re-derive the
// original 36/38 verdict with the IDENTICAL counting rules of
// analyze-preservesched-b.js (counted-inflow rule imported from it;
// lag in {1,2} + eligibleAny + first bound line racksFull recompute
// true). Expected: neutrality 327/289/38, lag 1x32/2x4/3x1/4x1,
// coverage 36/38, residuals exactly (9750,83) and (9750,84).
//
// RESIDUAL JUDGMENT (pre-registered in
// evidence/2026-10-26/sim-preservesched-resid-b-prereg.md): one
// hypothesis explains BOTH days with named per-stack evidence while
// the other is excluded by a stated observation, else DIAG-NO-GO.
'use strict';
const fs = require('fs');
const path = require('path');
const { counted, countedKcal } = require('./analyze-preservesched-b');

const CORPUS = path.join(__dirname, '..', 'evidence', '2026-10-26', 'sim-preservesched-resid-b-corpus');

function analyze(corpusDir) {
  const dir = corpusDir || CORPUS;
  const files = fs.readdirSync(dir)
    .filter(f => /^preservesched-resid-b-cap1-.*\.json$/.test(f)).sort();
  const seeds = [];
  const rows38 = [];
  let totBound = 0, totAttr = 0, totUnattr = 0, attrFlagMismatch = 0;
  const wall = { national: 0, table: 0, win: 0, wave4: 0, wave5: 0,
    daysAlive: [], deaths: 0, deathCauses: {} };
  const lagDist = {};
  const resid = {};
  let ctxMismatch = 0, ctxChecked = 0, residJoinMiss = 0;
  for (const f of files) {
    const d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    const seed = d.seed;
    seeds.push(seed);
    const inflows = d.inflows || [];
    const byDay = new Map();
    for (const r of inflows) {
      const k = countedKcal(r);
      if (!byDay.has(r.day)) byDay.set(r.day, { kcal: 0, stock: 0, deposit: 0, pantryAdd: 0, recs: [] });
      const e = byDay.get(r.day);
      e.kcal += k; e.recs.push(r);
      if (r.door === 'stock') e.stock += k;
      else if (r.door === 'deposit') e.deposit += k;
      else if (r.door === 'pantryAdd') e.pantryAdd += k;
    }
    if (d.national) wall.national++;
    if (d.table) wall.table++;
    if (d.win) wall.win++;
    const wr = d.waveReach || [];
    if (wr.includes(4)) wall.wave4++;
    if (wr.includes(5)) wall.wave5++;
    wall.daysAlive.push(d.daysAlive || 0);
    wall.deaths += (d.deaths || 0);
    for (const [c, n] of Object.entries(d.deathCauses || {})) wall.deathCauses[c] = (wall.deathCauses[c] || 0) + n;
    const cookByDay = new Map();
    for (const c of (d.cookLines || [])) {
      if (!cookByDay.has(c.day)) cookByDay.set(c.day, []);
      cookByDay.get(c.day).push(c);
    }
    for (const arr of cookByDay.values()) arr.sort((a, b) => a.seq - b.seq);
    const residByKey = new Map();
    for (const r of (d.residLines || [])) residByKey.set(r.cook + '|' + r.day + '|' + r.resIndex, r);
    for (const c of (d.cookLines || [])) {
      const key = c.cook + '|' + c.day + '|' + c.resIndex;
      if (!residByKey.has(key)) residJoinMiss++;
    }
    for (const r of (d.residLines || [])) {
      if (r.ctxKcalMatch === false) ctxMismatch++;
      if (r.ctxKcalMatch !== null) ctxChecked++;
    }
    const dayRow = new Map();
    for (const r of (d.dayTable || [])) dayRow.set(r.day, r);
    const at = d.attributionTable || [];
    totBound += at.length;
    for (const r of at) {
      const D = r.day;
      const dayInfl = byDay.get(D);
      const hasInfl = !!(dayInfl && dayInfl.kcal > 0);
      if (hasInfl !== !!r.attributed) attrFlagMismatch++;
      if (r.attributed) totAttr++; else totUnattr++;
      if (r.attributed) continue;
      const priorDays = [...byDay.keys()].filter(x => x < D && (byDay.get(x).kcal > 0)).sort((a, b) => a - b);
      const lastDay = priorDays.length ? priorDays[priorDays.length - 1] : null;
      const lag = lastDay === null ? null : D - lastDay;
      lagDist[lag === null ? 'none' : lag] = (lagDist[lag === null ? 'none' : lag] || 0) + 1;
      const dr = dayRow.get(D) || {};
      const lines = cookByDay.get(D) || [];
      const boundLines = lines.filter(c => c.frame === 'racksFull' || (c.frame === 'plain' && c.racksFull === true));
      const firstBound = boundLines.length ? boundLines[0] : null;
      const explained = (lag === 1 || lag === 2) && !!dr.eligibleAny &&
        !!(firstBound && firstBound.racksFull === true);
      rows38.push({ seed, day: D, lag, explained,
        eligibleAny: !!dr.eligibleAny, firstBoundRacksFull: firstBound ? firstBound.racksFull : null });
    }
    if (seed === 9750) {
      resid.seed9750 = {
        inflowsByDay: [...byDay.entries()].map(([day, e]) => ({
          day, kcal: e.kcal, stock: e.stock, deposit: e.deposit, pantryAdd: e.pantryAdd,
          recs: e.recs.filter(counted).map(x => ({ door: x.door, name: x.name, kcal: x.kcal })),
        })).filter(e => e.day >= 70 && e.day <= 90),
        residDays: {},
        dayPantry: {},
      };
      for (const day of [83, 84]) {
        const lines = (d.residLines || []).filter(x => x.day === day);
        resid.seed9750.residDays[day] = lines.map(r => ({
          cook: r.cook, frame: r.frame, resIndex: r.resIndex,
          havenTier: r.havenTier, granaryBonus: r.granaryBonus,
          eligibleStacksKcal: r.eligibleStacksKcal, ctxEligibleKcal: r.ctxEligibleKcal,
          ctxKcalMatch: r.ctxKcalMatch, eligibleStacks: r.eligibleStacks,
        }));
      }
      for (const dp of (d.dayPantry || [])) {
        if (dp.day >= 75 && dp.day <= 90) resid.seed9750.dayPantry[dp.day] = dp;
      }
    }
  }
  rows38.sort((a, b) => (a.seed - b.seed) || (a.day - b.day));
  const explained = rows38.filter(r => r.explained);
  const residuals = rows38.filter(r => !r.explained);
  const med = (xs) => {
    const s = [...xs].sort((a, b) => a - b);
    if (!s.length) return null;
    const m = Math.floor(s.length / 2);
    return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
  };
  // Pre-registered residual judgment (literal application):
  // H1 needs, on BOTH days 83 and 84: havenTier >= 3 AND an eligible
  // stock-door Foraged food stack with spoilDay 85 (day-79 arrival)
  // carrying granaryDays 3. H2 needs, on BOTH days: havenTier < 3 AND
  // eligible stacks that are older non-stock items with no
  // spoilDay-85 stock stack present. The analyzer reports the raw
  // facts; the verdict flag follows the prereg literally.
  let verdict = { verdict: 'DIAG-NO-GO', reason: 'not-evaluated' };
  if (resid.seed9750) {
    const d83 = resid.seed9750.residDays[83] || [];
    const d84 = resid.seed9750.residDays[84] || [];
    const tierOk = d83.length && d84.length &&
      d83.every(r => r.havenTier >= 3) && d84.every(r => r.havenTier >= 3);
    const h1stack = (lines) => lines.some(r =>
      (r.eligibleStacks || []).some(s => s.name === 'Foraged food' &&
        s.spoilDay === 85 && s.granaryDays === 3));
    const h1 = tierOk && h1stack(d83) && h1stack(d84);
    const tierLow = d83.length && d84.length &&
      d83.every(r => (r.havenTier || 0) < 3) && d84.every(r => (r.havenTier || 0) < 3);
    const hasStock85 = (lines) => lines.some(r =>
      (r.eligibleStacks || []).some(s => s.name === 'Foraged food' && s.spoilDay === 85));
    const h2 = tierLow && !hasStock85(d83) && !hasStock85(d84) &&
      d83.some(r => (r.eligibleStacks || []).length > 0) &&
      d84.some(r => (r.eligibleStacks || []).length > 0);
    if (h1 && !h2) verdict = { verdict: 'GO', hypothesis: 'H1-granary-shifted-clock' };
    else if (h2 && !h1) verdict = { verdict: 'GO', hypothesis: 'H2-older-stock-ripening' };
    else if (h1 && h2) verdict = { verdict: 'DIAG-NO-GO', reason: 'both-hypotheses-fit' };
    else verdict = { verdict: 'DIAG-NO-GO', reason: 'neither-hypothesis-fits-literally', tierOk, h1stack83: h1stack(d83), h1stack84: h1stack(d84), tierLow };
  }
  return {
    seeds, files: files.length,
    neutrality: { bound: totBound, attributed: totAttr, unattributed: totUnattr,
      expected: [327, 289, 38], pass: totBound === 327 && totAttr === 289 && totUnattr === 38 },
    attrFlagMismatch,
    lagDistribution: lagDist,
    medianLag: med(rows38.map(r => r.lag).filter(x => x !== null)),
    primary: { explained: explained.length, total: rows38.length,
      coverage: rows38.length ? explained.length / rows38.length : 0, bar: 0.80,
      verdict: (rows38.length && explained.length / rows38.length >= 0.80) ? 'GO' : 'DIAG-NO-GO' },
    residuals: residuals.map(r => ({ seed: r.seed, day: r.day, lag: r.lag })),
    instrument: { ctxChecked, ctxMismatch, residJoinMiss },
    wall: { n: seeds.length, national: wall.national, table: wall.table, win: wall.win,
      wave4: wall.wave4, wave5: wall.wave5, medianDaysAlive: med(wall.daysAlive),
      daysAlive: wall.daysAlive, deaths: wall.deaths, deathCauses: wall.deathCauses },
    resid, verdict,
  };
}

if (require.main === module) {
  const out = analyze();
  console.log('neutrality:', JSON.stringify(out.neutrality));
  console.log('attrFlagMismatch:', out.attrFlagMismatch);
  console.log('lagDistribution (38):', JSON.stringify(out.lagDistribution), 'median:', out.medianLag);
  console.log('PRIMARY:', JSON.stringify(out.primary));
  console.log('residuals:', JSON.stringify(out.residuals));
  console.log('instrument:', JSON.stringify(out.instrument));
  console.log('wall:', JSON.stringify(out.wall));
  console.log('verdict:', JSON.stringify(out.verdict));
  if (out.resid.seed9750) {
    for (const day of [83, 84]) {
      console.log('--- seed 9750 day', day, 'bound-line eligible stacks ---');
      for (const r of out.resid.seed9750.residDays[day]) {
        console.log(`  ${r.cook} ${r.frame} res${r.resIndex} tier=${r.havenTier} bonus=${r.granaryBonus} elig=${r.eligibleStacksKcal} ctxMatch=${r.ctxKcalMatch}`);
        for (const s of r.eligibleStacks) {
          console.log(`    ${s.name} ${s.kcalEach}x${s.units}=${s.kcal} spoilDay=${s.spoilDay} state=${s.foodState} kind=${s.foodKind} granaryDays=${s.granaryDays}`);
        }
      }
    }
    console.log('--- seed 9750 dayPantry 78-85 (Foraged food + Winner stacks only) ---');
    for (let day = 78; day <= 85; day++) {
      const dp = out.resid.seed9750.dayPantry[day];
      if (!dp) { console.log(`  d${day}: (no snapshot)`); continue; }
      const rel = dp.stacks.filter(s => /Foraged food|Winner/.test(s.name || ''));
      console.log(`  d${day} tier=${dp.havenTier} stacks=${dp.stacks.length}: ` +
        rel.map(s => `${s.name}|${s.kcalEach}x${s.units}@${s.spoilDay}${s.granaryDays != null ? 'g' + s.granaryDays : ''}`).join(' ; '));
    }
    console.log('--- seed 9750 inflows 78-85 ---');
    for (const e of out.resid.seed9750.inflowsByDay) {
      if (e.day < 78 || e.day > 85) continue;
      console.log(`  d${e.day} kcal=${e.kcal} stock=${e.stock} dep=${e.deposit} add=${e.pantryAdd} ` +
        e.recs.map(r => `${r.door}:${r.name}:${r.kcal}`).join(', '));
    }
  }
}

module.exports = { analyze };
