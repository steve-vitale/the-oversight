#!/usr/bin/env node
// analyze-awayration2-b.js — aggregate the awayration2-b instrument.
//
// Pure function aggregate(perSeeds) is exported for the proof test; the
// CLI reads per-seed JSONs from a corpus dir, prints the human summary,
// and writes analysis-<label>.json beside them.
//
// DEFINITIONS (fixed before sims, see sweep header):
//   packMeal row = one packMeal call (no dedupe). Primary rows = the
//   FIRST call per (vid,day); later same-day calls are dup calls,
//   reported separately, never pooled into the primary rates.
//   want    = packMeal's want arg (dayWant = need - ownEat)
//   dawn    = p.dawnKcal at meal time (the dawn-drawn ration)
//   topUp   = pantryDraw kcal inside packMeal phased as top-up
//   take    = packMeal return; shortfall = want - take
//   dawnGap  = want - dawn
//   topUpGap = max(0, dawnGap - topUp)   [pantry limit at meal time]
//   theftGap = (topUpDoneBefore ? 0 : max(0, dawn - poolBefore))
//   residual = shortfall - topUpGap - theftGap (signed; negative =
//     piece/ceil overshoot covered more than the gaps, e.g. a slab
//     drawn whole for a small top-up request)
// HARD FAILS (exit 2, no rates published): take > want, take < 0,
// want <= 50 (packMeal only runs when dayWant > 50), or a primary
// row missing dawnKcal. Residual outliers are REPORTED, never failed:
// a slab drawn whole legitimately overshoots.
'use strict';
const fs = require('fs');
const path = require('path');

const med = xs => { const s = xs.slice().sort((a, b) => a - b); return s.length ? (s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2) : null; };
const mean = xs => xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null;
const share = (xs, pred) => xs.length ? xs.filter(pred).length / xs.length : null;
// r1 for kcal means (1 decimal is fine); r3 for SHARES — r1 turned
// 11/417 = 0.026 into a printed 0, hiding the whole shortfall story.
const r1 = x => x == null ? null : Math.round(x * 10) / 10;
const r3 = x => x == null ? null : Math.round(x * 1000) / 1000;

function aggregate(perSeeds) {
  const errors = [];
  const wall = [];
  const primary = []; // enriched first-call rows
  const dups = [];
  const selfFed = []; // away meal rows with drawn == 0, not fasting
  const fastingAway = [];
  const deaths = [];
  const reseedParts = [];
  const awayLines = [];
  for (const ps of perSeeds) {
    const mealByKey = new Map();
    for (const m of (ps.mealRows || [])) mealByKey.set(m.vid + '|' + m.day, m);
    for (const m of (ps.mealRows || [])) {
      if (!m.away) continue;
      if (m.fasting) fastingAway.push({ seed: ps.seed, ...m });
      else if ((m.drawn || 0) === 0) selfFed.push({ seed: ps.seed, ...m });
    }
    for (const d of (ps.deathRows || [])) {
      if (/starv/i.test(d.cause || '')) deaths.push({ seed: ps.seed, ...d });
    }
    for (const p of (ps.packRows || [])) reseedParts.push(p.dayPart);
    for (const l of (ps.awayLines || [])) awayLines.push('s' + ps.seed + ' ' + l);
    const groups = new Map();
    for (const pm of (ps.packMealRows || [])) {
      const k = pm.vid + '|' + pm.day;
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k).push(pm);
    }
    for (const [k, calls] of groups) {
      const first = calls[0];
      if (calls.length > 1) dups.push({ seed: ps.seed, key: k, calls: calls.map(c => ({ take: c.take, want: c.want, poolBefore: c.poolBefore, topUpDoneBefore: c.topUpDoneBefore })) });
      // Structural assertions (hard fail, no rates on violation).
      if (!(first.want > 50)) errors.push(`want<=50 seed=${ps.seed} ${k} want=${first.want}`);
      if (first.take == null || first.take < 0 || first.take > first.want) errors.push(`take out of [0,want] seed=${ps.seed} ${k} take=${first.take} want=${first.want}`);
      if (first.dawnKcal == null) errors.push(`missing dawnKcal seed=${ps.seed} ${k}`);
      const meal = mealByKey.get(k);
      const dawnGap = first.want - first.dawnKcal;
      const topUpGap = Math.max(0, dawnGap - (first.topUpDrawn || 0));
      // RESEED (see sweep header + diag note): theftGap is meaningful
      // ONLY when the pack was NOT reseeded inside this call. A fresh
      // pack's poolBefore is yesterday's remainder, not a theft loss.
      // Flag-first when present; legacy fallback (exact in a no-dup
      // corpus): no pre entry, or topUpDone already true, proves the
      // entry predates today — today's entry with topUpDone true
      // would be a second packMeal call, i.e. a dup group.
      let reseeded;
      if (first.reseeded === true || first.reseeded === false) reseeded = first.reseeded;
      else reseeded = (first.poolBefore == null) || (first.topUpDoneBefore === true);
      const theftGap = reseeded ? 0 : Math.max(0, first.dawnKcal - (first.poolBefore == null ? first.dawnKcal : first.poolBefore));
      const shortfall = first.want - first.take;
      const residual = shortfall - topUpGap - theftGap;
      // PANTRY AT TOP-UP: pantryBefore is measured BEFORE the whole
      // packMeal call, so on reseed calls it still holds the kcal the
      // dawn draw itself took. The top-up faces pantryBefore minus
      // the dawn draw, not pantryBefore.
      const pantryAtTopUp = (first.pantryBefore == null) ? null
        : (reseeded ? first.pantryBefore - (first.dawnDrawn || 0) : first.pantryBefore);
      const packRow = (ps.packRows || []).find(p => p.vid === first.vid && p.day === first.day);
      primary.push({ seed: ps.seed, vid: first.vid, day: first.day, want: first.want,
        dawn: first.dawnKcal, dawnDrawn: first.dawnDrawn, topUp: first.topUpDrawn,
        take: first.take, shortfall, dawnGap, topUpGap, theftGap, residual,
        poolBefore: first.poolBefore, pantryBefore: first.pantryBefore, pantryAfter: first.pantryAfter,
        pantryAtTopUp, reseeded,
        hungerAtMeal: first.hungerAtMeal, healthAtMeal: first.healthAtMeal,
        rosterPos: first.rosterPos, hungerAtPack: packRow ? packRow.hungerAtPack : null,
        temper: packRow ? packRow.temper : null,
        ownEat: meal ? ((meal.ate ?? 0) - (meal.drawn ?? 0)) : null,
        ate: meal ? meal.ate : null, needEst: meal ? meal.needEst : null,
        adequate: meal && meal.ate != null && meal.needEst ? (meal.ate >= 0.6 * meal.needEst) : null,
        pantryCouldCoverTopUp: pantryAtTopUp == null ? null : (pantryAtTopUp >= Math.max(0, dawnGap)),
      });
    }
    wall.push({ seed: ps.seed, daysAlive: ps.daysAlive, endReason: ps.endReason || (ps._wallEndReason) || null,
      rank: ps.rank || null, wave: (ps.waveReach || []).length, arc: ps.arc || (ps._wallArc) || null,
      win: !!ps.win, national: !!ps.national, deaths: Object.entries(ps.deathCauses || {}).reduce((a, [, v]) => a + v, 0),
      meals: (ps.mealRows || []).length, packMeals: (ps.packMealRows || []).length });
  }
  const shortfalls = primary.map(p => p.shortfall);
  const takes = primary.map(p => p.take / p.want);
  const res = {
    seeds: perSeeds.map(p => p.seed),
    wall,
    nPrimary: primary.length,
    nDupGroups: dups.length,
    dups: dups.slice(0, 20),
    shortfall: { mean: r1(mean(shortfalls)), median: med(shortfalls),
      shareGt0: r3(share(shortfalls, x => x > 0)), shareGe100: r3(share(shortfalls, x => x >= 100)),
      shareGe500: r3(share(shortfalls, x => x >= 500)), max: shortfalls.length ? Math.max(...shortfalls) : null },
    takeWant: { mean: r3(mean(takes)), median: r3(med(takes)), shareFull: r3(share(takes, x => x >= 1)) },
    dawnGap: { mean: r1(mean(primary.map(p => p.dawnGap))), median: med(primary.map(p => p.dawnGap)) },
    topUp: { mean: r1(mean(primary.map(p => p.topUp))), median: med(primary.map(p => p.topUp)) },
    dawn: { mean: r1(mean(primary.map(p => p.dawn))), median: med(primary.map(p => p.dawn)) },
    want: { mean: r1(mean(primary.map(p => p.want))), median: med(primary.map(p => p.want)) },
    // Decomposition: how much of the total shortfall each mechanism explains.
    decomposition: (() => {
      const tot = primary.reduce((a, p) => a + Math.max(0, p.shortfall), 0);
      const top = primary.reduce((a, p) => a + Math.min(Math.max(0, p.shortfall), p.topUpGap), 0);
      const thf = primary.reduce((a, p) => a + Math.min(Math.max(0, p.shortfall - p.topUpGap), p.theftGap), 0);
      const res2 = tot - top - thf;
      return { totalShortfallKcal: tot,
        topUpGapShare: tot ? r3(top / tot) : null, theftGapShare: tot ? r3(thf / tot) : null,
        residualShare: tot ? r3(res2 / tot) : null,
        meanTopUpGap: r1(mean(primary.map(p => p.topUpGap))),
        meanTheftGap: r1(mean(primary.map(p => p.theftGap))),
        meanResidual: r1(mean(primary.map(p => p.residual))),
        nTopUpBinding: primary.filter(p => p.topUpGap > 0).length,
        nTheftBinding: primary.filter(p => p.theftGap > 0).length,
        nResidualLtNeg100: primary.filter(p => p.residual < -100).length,
        nResidualGt100: primary.filter(p => p.residual > 100).length };
    })(),
    hunger: { meanAtPack: r1(mean(primary.map(p => p.hungerAtPack).filter(x => x != null))),
      shareGe70AtPack: r3(share(primary.map(p => p.hungerAtPack).filter(x => x != null), x => x >= 70)),
      meanDawnGapHungry: r1(mean(primary.filter(p => (p.hungerAtPack ?? 0) >= 70).map(p => p.dawnGap))),
      meanDawnGapNotHungry: r1(mean(primary.filter(p => (p.hungerAtPack ?? 0) < 70).map(p => p.dawnGap))) },
    pantry: { meanBefore: r1(mean(primary.map(p => p.pantryBefore).filter(x => x != null))),
      shortfallWithPantryShort: primary.filter(p => p.shortfall > 0 && p.pantryCouldCoverTopUp === false).length,
      shortfallWithPantryEnough: primary.filter(p => p.shortfall > 0 && p.pantryCouldCoverTopUp === true).length,
      shortfallPantryUnknown: primary.filter(p => p.shortfall > 0 && p.pantryCouldCoverTopUp == null).length,
      meanPantryBeforeShort: r1(mean(primary.filter(p => p.shortfall > 0).map(p => p.pantryBefore).filter(x => x != null))),
      meanPantryBeforeFull: r1(mean(primary.filter(p => p.shortfall === 0).map(p => p.pantryBefore).filter(x => x != null))) },
    roster: { meanPantryBeforeFirstHalf: r1(mean(primary.filter(p => p.rosterPos != null && p.rosterPos >= 0 && p.rosterPos < 6).map(p => p.pantryBefore).filter(x => x != null))),
      meanPantryBeforeSecondHalf: r1(mean(primary.filter(p => p.rosterPos != null && p.rosterPos >= 6).map(p => p.pantryBefore).filter(x => x != null))),
      shortfallRateFirstHalf: r3(share(primary.filter(p => p.rosterPos != null && p.rosterPos < 6).map(p => p.shortfall), x => x > 0)),
      shortfallRateSecondHalf: r3(share(primary.filter(p => p.rosterPos != null && p.rosterPos >= 6).map(p => p.shortfall), x => x > 0)) },
    adequacy: { packDayAdequate: r3(share(primary.map(p => p.adequate).filter(x => x != null), x => x === true)),
      selfFedAwayDays: selfFed.length,
      selfFedAdequate: r3(share(selfFed.map(m => (m.ate != null && m.needEst) ? (m.ate >= 0.6 * m.needEst) : null).filter(x => x != null), x => x === true)),
      fastingAwayDays: fastingAway.length },
    reseedDayParts: (() => { const c = {}; for (const dp of reseedParts) c[String(dp)] = (c[String(dp)] || 0) + 1; return c; })(),
    starvationDeaths: deaths.map(d => ({ seed: d.seed, day: d.day, who: d.whoName || d.who, awayAtDeath: d.ctx ? d.ctx.awayAtDeath : null, pantry: d.ctx ? d.ctx.pantryKcal : null, fresh: d.ctx ? d.ctx.freshDays : null })),
    nStarvationDeaths: deaths.length,
    awayLinesSample: awayLines.slice(0, 12),
    nAwayLines: awayLines.length,
    errors,
  };
  return res;
}

function summarize(a) {
  const L = [];
  L.push(`seeds: ${a.seeds.join(',')} (${a.seeds.length})`);
  L.push(`wall: ${a.wall.map(w => `s${w.seed}:${w.daysAlive}d/${w.endReason || '?'} w${w.wave} arc${w.arc} ${w.national ? 'NATIONAL ' : ''}${w.win ? 'WIN ' : ''}${w.deaths} deaths`).join(' | ')}`);
  L.push(`primary pack meals: ${a.nPrimary} (dup groups: ${a.nDupGroups})`);
  L.push(`shortfall: mean ${a.shortfall.mean} median ${a.shortfall.median} max ${a.shortfall.max}; share>0 ${a.shortfall.shareGt0} share>=100 ${a.shortfall.shareGe100} share>=500 ${a.shortfall.shareGe500}`);
  L.push(`take/want: mean ${a.takeWant.mean} median ${a.takeWant.median} shareFull ${a.takeWant.shareFull}`);
  L.push(`want mean ${a.want.mean} median ${a.want.median}; dawn mean ${a.dawn.mean} median ${a.dawn.median}; dawnGap mean ${a.dawnGap.mean} median ${a.dawnGap.median}; topUp mean ${a.topUp.mean} median ${a.topUp.median}`);
  L.push(`DECOMPOSITION of ${a.decomposition.totalShortfallKcal} total shortfall kcal: topUpGap ${a.decomposition.topUpGapShare} theftGap ${a.decomposition.theftGapShare} residual ${a.decomposition.residualShare}; meanTopUpGap ${a.decomposition.meanTopUpGap} meanTheftGap ${a.decomposition.meanTheftGap} meanResidual ${a.decomposition.meanResidual}; binding: topUp ${a.decomposition.nTopUpBinding} theft ${a.decomposition.nTheftBinding} residual<-100 ${a.decomposition.nResidualLtNeg100} residual>100 ${a.decomposition.nResidualGt100}`);
  L.push(`hunger at pack: mean ${a.hunger.meanAtPack} share>=70 ${a.hunger.shareGe70AtPack}; meanDawnGap hungry ${a.hunger.meanDawnGapHungry} notHungry ${a.hunger.meanDawnGapNotHungry}`);
  L.push(`pantry at meal: mean ${a.pantry.meanBefore}; shortfall meals with pantry SHORT for top-up request ${a.pantry.shortfallWithPantryShort} vs pantry ENOUGH ${a.pantry.shortfallWithPantryEnough} unknown ${a.pantry.shortfallPantryUnknown}; meanPantry short-meals ${a.pantry.meanPantryBeforeShort} full-meals ${a.pantry.meanPantryBeforeFull}`);
  L.push(`roster order: meanPantry first-half ${a.roster.meanPantryBeforeFirstHalf} second-half ${a.roster.meanPantryBeforeSecondHalf}; shortfall rate first-half ${a.roster.shortfallRateFirstHalf} second-half ${a.roster.shortfallRateSecondHalf}`);
  L.push(`adequacy: pack-day ${a.adequacy.packDayAdequate}; self-fed away days ${a.adequacy.selfFedAwayDays} adequate ${a.adequacy.selfFedAdequate}; fasting away days ${a.adequacy.fastingAwayDays}`);
  L.push(`reseed dayParts: ${JSON.stringify(a.reseedDayParts)}`);
  L.push(`starvation deaths: ${a.nStarvationDeaths} ${JSON.stringify(a.starvationDeaths)}`);
  L.push(`away-voice lines: ${a.nAwayLines}`);
  if (a.errors.length) L.push(`ERRORS: ${a.errors.slice(0, 10).join(' ; ')}`);
  return L.join('\n');
}

if (require.main === module) {
  const dir = process.argv[2];
  const label = process.argv[3] || 'analysis';
  if (!dir) { console.error('usage: analyze-awayration2-b.js <corpus-dir> [label]'); process.exit(2); }
  const files = fs.readdirSync(dir).filter(f => /^awayration2-b-competent-s\d+\.json$/.test(f)).sort();
  if (!files.length) { console.error('no per-seed files in ' + dir); process.exit(2); }
  const perSeeds = files.map(f => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
  // Wall fallback for corpora written before perSeed carried endReason/arc:
  // the sweep summary in the same dir holds each row's diag.
  try {
    const summaryPath = path.join(dir, 'sweep-competent.json');
    if (fs.existsSync(summaryPath)) {
      const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
      const bySeed = new Map((summary.rows || []).map(r => [r.seed, r.diag || {}]));
      for (const ps of perSeeds) {
        const d = bySeed.get(ps.seed);
        if (d) { if (ps.endReason == null) ps._wallEndReason = d.endReason || null; if (ps.arc == null) ps._wallArc = d.arc || null; }
      }
    }
  } catch (e) {}
  const a = aggregate(perSeeds);
  console.log(summarize(a));
  fs.writeFileSync(path.join(dir, 'analysis-' + label + '.json'), JSON.stringify(a, null, 2) + '\n');
  console.log('wrote ' + path.join(dir, 'analysis-' + label + '.json'));
  if (a.errors.length) { console.error('HARD FAIL: structural errors above'); process.exit(2); }
}

module.exports = { aggregate, summarize };
