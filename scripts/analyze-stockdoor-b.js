#!/usr/bin/env node
// analyze-stockdoor-b.js — fourth-door re-judgment (DIAG only).
//
// sim-stockdoor-b, 2026-10-26, oversight-flesh-out-loop-b.
// Read-only analysis of the NEW corpus
// (evidence/2026-10-26/sim-stockdoor-b-corpus/,
// stockdoor-b-cap1 files, 8 seeds 9750-9757, competent-nofeast,
// 100d, SEATDRIVE=0 band) plus the committed resid-b corpus for
// the determinism leg.
//
// CONTROL (must pass before any residual judgment): the
// PRE-FOURTH-DOOR view — counting only the stock, deposit, and
// pantryAdd doors, with the IDENTICAL counting rules of
// analyze-preservesched-b.js — re-derives 327/289/38, lag
// 1x32/2x4/3x1/4x1, coverage 36/38, residuals exactly (9750,83)
// and (9750,84).
//
// PRIMARY (pre-registered in
// evidence/2026-10-26/sim-stockdoor-b-prereg.md): the fourth-door
// record names the day-82 stockSurplus stack for seed 9750 day 83
// AND the day-84 suppliers, accounting for BOTH residual days,
// with the determinism leg clean. GO iff control + fourth-door +
// day-83 + day-84 + determinism all pass; any miss is NO-GO.
'use strict';
const fs = require('fs');
const path = require('path');
const { counted, countedKcal } = require('./analyze-preservesched-b');

const CORPUS = path.join(__dirname, '..', 'evidence', '2026-10-26', 'sim-stockdoor-b-corpus');
const OLD = path.join(__dirname, '..', 'evidence', '2026-10-26', 'sim-preservesched-resid-b-corpus');
const THREE_DOORS = new Set(['stock', 'deposit', 'pantryAdd']);

function loadCorpus(dir, pattern) {
  const files = fs.readdirSync(dir).filter(f => pattern.test(f)).sort();
  const bySeed = new Map();
  for (const f of files) {
    const d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    bySeed.set(d.seed, d);
  }
  return { files: files.length, bySeed };
}

function stackKey(s) {
  return [s.name, s.kcalEach, s.units, s.spoilDay, (s.granaryDays == null ? null : s.granaryDays)].join('|');
}

function analyze(corpusDir, oldDir) {
  const dir = corpusDir || CORPUS;
  const old = oldDir || OLD;
  const { files, bySeed } = loadCorpus(dir, /^stockdoor-b-cap1-.*\.json$/);
  const seeds = [...bySeed.keys()].sort((a, b) => a - b);
  let totBound = 0, totAttr = 0, totUnattr = 0, attrFlagMismatch = 0;
  const lagDist = {};
  const rows38 = [];
  const wall = { national: 0, table: 0, win: 0, wave4: 0, wave5: 0,
    daysAlive: [], deaths: 0, deathCauses: {} };
  let ctxMismatch = 0, ctxChecked = 0, residJoinMiss = 0;
  let truncBad = [];
  const piles = {};
  const fourth = {};
  for (const seed of seeds) {
    const d = bySeed.get(seed);
    if (d.inflowTruncated || d.residTruncated || d.stockdoorTruncated ||
        d.cookTruncated || d.eventTruncated) truncBad.push(seed);
    const inflows = (d.inflows || []).filter(r => THREE_DOORS.has(r.door));
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
      if (!residByKey.has(c.cook + '|' + c.day + '|' + c.resIndex)) residJoinMiss++;
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
      rows38.push({ seed, day: D, lag, explained });
    }
    if (seed === 9750) {
      // Fourth-door records, by day (all records; counted = kcal > 0).
      const sd = d.stockdoorRecords || [];
      const sdByDay = new Map();
      for (const r of sd) {
        if (!sdByDay.has(r.day)) sdByDay.set(r.day, []);
        sdByDay.get(r.day).push(r);
      }
      const day82 = sdByDay.get(82) || [];
      const day82Stored = day82.filter(r => Math.round(r.kcal || 0) > 0)
        .reduce((a, r) => a + Math.round(r.kcal || 0), 0);
      fourth.day82 = {
        records: day82,
        storedTotal: day82Stored,
        allSpoil85: day82.length > 0 && day82.every(r => r.spoilDay === 85),
        allVDay82: day82.length > 0 && day82.every(r => r.vDay === 82),
        allClockOk: day82.every(r => r.vDay == null || r.spoilDay === r.vDay + 3),
        allForaged: day82.every(r => r.name === 'Foraged food'),
      };
      fourth.clockOkAll = sd.every(r => r.vDay == null || r.spoilDay === r.vDay + 3);
      fourth.totalRecords = sd.length;
      // Three-door source records for the day-84 components.
      const stock80 = inflows.filter(r => r.day === 80 && r.door === 'stock');
      const add74 = inflows.filter(r => r.day === 74 && r.door === 'pantryAdd');
      fourth.stock80Total = stock80.reduce((a, r) => a + countedKcal(r), 0);
      fourth.stock80 = stock80.map(r => ({ name: r.name, kcal: r.kcal }));
      fourth.add74WinnerTotal = add74.filter(r => r.name === "Winner's share (alien rations)")
        .reduce((a, r) => a + countedKcal(r), 0);
      fourth.add74 = add74.map(r => ({ name: r.name, kcal: r.kcal, added: r.added }));
      // Bound-line eligible piles for days 83/84: resid lines joined
      // to bound cook lines only (worked first resolutions excluded —
      // they face the pre-smoking pile, not the bound remainder).
      for (const day of [83, 84]) {
        const lines = cookByDay.get(day) || [];
        const bound = lines.filter(c => c.frame === 'racksFull' || (c.frame === 'plain' && c.racksFull === true));
        piles[day] = bound.map(c => {
          const r = residByKey.get(c.cook + '|' + c.day + '|' + c.resIndex);
          return r ? {
            cook: r.cook, frame: r.frame, resIndex: r.resIndex,
            text: r.text, havenTier: r.havenTier, granaryBonus: r.granaryBonus,
            eligibleStacksKcal: r.eligibleStacksKcal,
            eligibleStacks: (r.eligibleStacks || []).map(s => ({
              name: s.name, kcalEach: s.kcalEach, units: s.units, kcal: s.kcal,
              spoilDay: s.spoilDay, foodState: s.foodState, foodKind: s.foodKind,
              granaryDays: s.granaryDays,
            })),
          } : null;
        });
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
  const control = {
    neutrality: { bound: totBound, attributed: totAttr, unattributed: totUnattr },
    neutralityPass: totBound === 327 && totAttr === 289 && totUnattr === 38,
    attrFlagMismatch,
    lagDistribution: lagDist,
    lagPass: JSON.stringify(lagDist) === JSON.stringify({ 1: 32, 2: 4, 3: 1, 4: 1 }),
    medianLag: med(rows38.map(r => r.lag).filter(x => x !== null)),
    coverage: { explained: explained.length, total: rows38.length },
    coveragePass: explained.length === 36 && rows38.length === 38,
    residuals: residuals.map(r => ({ seed: r.seed, day: r.day, lag: r.lag })),
    residualsPass: JSON.stringify(residuals.map(r => [r.seed, r.day])) === JSON.stringify([[9750, 83], [9750, 84]]),
  };
  control.pass = control.neutralityPass && control.attrFlagMismatch === 0 && control.lagPass &&
    control.medianLag === 1 && control.coveragePass && control.residualsPass;
  // Day-83 pile check: every bound line exactly the 200x10@85 stack.
  const pile83ok = piles[83] && piles[83].length > 0 && piles[83].every(p => p &&
    p.eligibleStacksKcal === 2000 && p.eligibleStacks.length === 1 &&
    p.eligibleStacks[0].name === 'Foraged food' && p.eligibleStacks[0].kcalEach === 200 &&
    p.eligibleStacks[0].units === 10 && p.eligibleStacks[0].spoilDay === 85 &&
    p.eligibleStacks[0].granaryDays == null);
  // Day-84 pile check: exactly the 5-stack decomposition, total 3567.
  const want84 = ['Foraged food|200|10|85|', 'Foraged food|178|1|86|3',
    'Foraged food|189|1|86|3', "Winner's share (alien rations)|300|2|86|3",
    "Winner's share (alien rations)|300|2|86|3"].sort();
  const pile84ok = piles[84] && piles[84].length > 0 && piles[84].every(p => p &&
    p.eligibleStacksKcal === 3567 &&
    JSON.stringify(p.eligibleStacks.map(stackKey).sort()) === JSON.stringify(want84));
  const fourthPass = !!fourth.day82 && fourth.day82.storedTotal === 2000 &&
    fourth.day82.allSpoil85 && fourth.day82.allVDay82 && fourth.day82.allClockOk &&
    fourth.day82.allForaged && fourth.clockOkAll;
  const day84SourcesPass = fourth.stock80Total === 367 &&
    fourth.add74WinnerTotal === 2400;
  // Determinism leg vs the resid-b corpus.
  const oldC = loadCorpus(old, /^preservesched-resid-b-cap1-.*\.json$/);
  const detMismatches = [];
  for (const seed of seeds) {
    const n = bySeed.get(seed), o = oldC.bySeed.get(seed);
    if (!o) { detMismatches.push(seed + ':missing-old'); continue; }
    const same = (a, b, label) => {
      if (JSON.stringify(a) !== JSON.stringify(b)) detMismatches.push(seed + ':' + label);
    };
    same((n.dayTable || []).map(r => [r.day, r.class]), (o.dayTable || []).map(r => [r.day, r.class]), 'dayTable');
    same((n.attributionTable || []).map(r => [r.day, r.attributed]), (o.attributionTable || []).map(r => [r.day, r.attributed]), 'attribution');
    same(n.daysAlive, o.daysAlive, 'daysAlive');
    same(n.deaths, o.deaths, 'deaths');
    same(n.deathCauses, o.deathCauses, 'deathCauses');
    same(n.rank, o.rank, 'rank');
    same(n.waveReach, o.waveReach, 'waveReach');
    same(n.national, o.national, 'national');
    same(n.table, o.table, 'table');
    same(n.win, o.win, 'win');
    same(n.endReason, o.endReason, 'endReason');
  }
  const detPass = detMismatches.length === 0;
  const verdict = (control.pass && fourthPass && pile83ok && pile84ok && day84SourcesPass && detPass)
    ? 'GO' : 'NO-GO';
  return {
    seeds, files,
    control, instrument: { ctxChecked, ctxMismatch, residJoinMiss, truncBad },
    wall: { n: seeds.length, national: wall.national, table: wall.table, win: wall.win,
      wave4: wall.wave4, wave5: wall.wave5, medianDaysAlive: med(wall.daysAlive),
      daysAlive: wall.daysAlive, deaths: wall.deaths, deathCauses: wall.deathCauses },
    fourth, piles,
    checks: { fourthPass, pile83ok: !!pile83ok, pile84ok: !!pile84ok,
      day84SourcesPass, detPass, detMismatches },
    verdict,
  };
}

if (require.main === module) {
  const out = analyze();
  console.log('control:', JSON.stringify(out.control, null, 1));
  console.log('instrument:', JSON.stringify(out.instrument));
  console.log('wall:', JSON.stringify(out.wall));
  console.log('checks:', JSON.stringify(out.checks));
  console.log('fourth day82:', JSON.stringify(out.fourth.day82));
  console.log('fourth stock80:', out.fourth.stock80Total, JSON.stringify(out.fourth.stock80));
  console.log('fourth add74:', out.fourth.add74WinnerTotal, JSON.stringify(out.fourth.add74));
  console.log('VERDICT:', out.verdict);
  for (const day of [83, 84]) {
    console.log('--- seed 9750 day', day, 'bound-line piles ---');
    for (const p of (out.piles[day] || [])) {
      console.log(`  ${p.cook} ${p.frame} res${p.resIndex} tier=${p.havenTier} bonus=${p.granaryBonus} elig=${p.eligibleStacksKcal} :: ${p.text}`);
      for (const s of p.eligibleStacks) {
        console.log(`    ${s.name} ${s.kcalEach}x${s.units}=${s.kcal} spoilDay=${s.spoilDay} granaryDays=${s.granaryDays}`);
      }
    }
  }
}

module.exports = { analyze };
