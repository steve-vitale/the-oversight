// analyze-strandfix-combined-b.js — pure reads over strandfix
// corpora. No game loads, no RNG, no writes except the outputs
// the caller requests (census JSON + paired compare .md).
// Strand = maximal run of still-refused creek evenings on
// consecutive loop-days (same definition as analyze-woodday-b.js).
// Evening classes use RAW gates from the woodcarry
// classification (woodPlayer >= 4, kcal >= 60, ticksToDayEnd
// >= 96) — never the bridge skip line, which names only the
// first failing gate and cannot express "both" or "plus".
'use strict';
const fs = require('fs');
const path = require('path');

function loadCorpus(dir) {
  const out = {};
  for (const f of fs.readdirSync(dir).sort()) {
    if (!f.endsWith('.json')) continue;
    const m = f.match(/-s(\d+)\.json$/);
    if (!m) continue;
    out[parseInt(m[1], 10)] = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  }
  return out;
}
function isStillCreek(e) {
  const wc = e.woodcarry || null;
  return !!(wc && wc.bucket === 'creek' && wc.outcome === 'travel-refused' && wc.rescued === false);
}
function isCreek(e) {
  const wc = e.woodcarry || null;
  return !!(wc && wc.bucket === 'creek');
}
function isRescuedCreek(e) {
  const wc = e.woodcarry || null;
  return !!(wc && wc.bucket === 'creek' && wc.rescued === true);
}
function classifyEvening(e) {
  const c = (e.woodcarry && e.woodcarry.classification) || {};
  const wood = (c.woodPlayer === undefined || c.woodPlayer === null) ? null : c.woodPlayer;
  let kcal = (c.kcal === undefined || c.kcal === null) ? null : c.kcal;
  let kcalFallback = false;
  if (kcal === null && c.kcalLive !== undefined && c.kcalLive !== null) { kcal = c.kcalLive; kcalFallback = true; }
  const ticks = (c.ticksToDayEnd === undefined || c.ticksToDayEnd === null) ? null : c.ticksToDayEnd;
  if (wood === null || kcal === null || ticks === null) return { cls: 'unclassified', wood, kcal, kcalFallback, ticks, fails: [] };
  const fails = [];
  if (wood < 4) fails.push('wood');
  if (kcal < 60) fails.push('kcal');
  if (ticks < 96) fails.push('ticks');
  let cls;
  if (fails.length === 0) cls = 'pass';
  else if (fails.length === 1) cls = fails[0] + '-only';
  else if (fails.length === 2 && fails.includes('wood') && fails.includes('kcal')) cls = 'both';
  else cls = fails.join('+');
  return { cls, wood, kcal, kcalFallback, ticks, fails,
    woodDeficit: Math.max(0, 4 - wood), kcalGap: Math.max(0, 60 - kcal), ticksShortfall: Math.max(0, 96 - ticks) };
}
function extractStrands(evenings) {
  const stills = evenings.filter(isStillCreek).map((e) => e.loopDay).sort((a, b) => a - b);
  const runs = [];
  for (const d of stills) {
    const last = runs[runs.length - 1];
    if (last && d === last[last.length - 1] + 1) last.push(d);
    else runs.push([d]);
  }
  return runs;
}
function census(corpus) {
  const perSeed = {};
  let creek = 0, still = 0, rescued = 0;
  for (const [seed, inst] of Object.entries(corpus)) {
    const evs = inst.evenings || [];
    const c = evs.filter(isCreek).length;
    const s = evs.filter(isStillCreek).length;
    const r = evs.filter(isRescuedCreek).length;
    perSeed[seed] = { creek: c, still: s, rescued: r,
      strands: extractStrands(evs),
      daysAlive: inst.daysAlive, endReason: inst.endReason,
      maxWaveUnlocked: inst.maxWaveUnlocked, waveKills: inst.waveKills,
      deaths: (inst.deaths || []).length,
      playerDeathDays: (inst.deaths || []).filter((d) => d.player).map((d) => d.day),
      errs: (inst.strandfixStore && inst.strandfixStore.errs) || 0,
      sfAttempts: ((inst.strandfixStore && inst.strandfixStore.attempts) || []).length,
      warmthActed: (inst.warmthStore && inst.warmthStore.acted) || 0 };
    creek += c; still += s; rescued += r;
  }
  return { totals: { creek, still, rescued }, perSeed };
}
function eveningTable(corpus, seed) {
  const inst = corpus[seed];
  if (!inst) return [];
  return (inst.evenings || []).filter(isCreek).map((e) => {
    const g = classifyEvening(e);
    const w = e.warmth || {};
    return { loopDay: e.loopDay, still: isStillCreek(e), rescued: isRescuedCreek(e),
      cls: g.cls, fails: g.fails, wood: g.wood, kcal: g.kcal, kcalFallback: g.kcalFallback,
      ticks: g.ticks, woodDeficit: g.woodDeficit, kcalGap: g.kcalGap, ticksShortfall: g.ticksShortfall,
      pantryKcal: e.eveningPantryKcal, packFoodKcal: e.eveningPackFoodKcal,
      warmthActed: !!w.acted, warmthFireLit: !!w.fireLit, warmthLogSpent: (w.logSpent === undefined ? null : w.logSpent),
      skip: ((e.woodcarry && e.woodcarry.classification) || {}).binding || null };
  });
}
function morningTable(corpus, seed) {
  const inst = corpus[seed];
  if (!inst) return [];
  const byDay = {};
  for (const m of (inst.mornings || [])) byDay[m.loopDay] = m;
  return (inst.evenings || []).map((e) => {
    const a = e.strandfixAttempt || null;
    const s = e.strandfixSkip || null;
    const m = byDay[e.loopDay] || null;
    return { loopDay: e.loopDay,
      morningKcal: m ? m.kcal : null, morningWood: m ? m.morningWood : null,
      morningDayTicks: m ? m.morningDayTicks : null,
      wake: m ? [m.mx, m.my] : null, tile: m ? m.tile : null,
      attempt: a, skip: s,
      eveningStill: isStillCreek(e), eveningRescued: isRescuedCreek(e),
      eveningCls: classifyEvening(e).cls };
  });
}
// Warmfuel accounting on one leg's strand evenings (in order):
// preservedBefore = warmth logs spent on EARLIER strand evenings;
// cfLogs = observed logs + preservedBefore; independently rescued
// = wood-only class with cfLogs >= 4 and all gates passing.
function protectedCounterfactual(eveningRows) {
  let preserved = 0;
  let firstRescue = null;
  const rescued = [];
  const rows = [];
  for (const r of eveningRows) {
    const cfLogs = (r.wood === null ? null : r.wood + preserved);
    const indep = (r.cls === 'wood-only' && cfLogs !== null && cfLogs >= 4 && r.kcal >= 60 && r.ticks >= 96);
    if (indep) { rescued.push(r.loopDay); if (firstRescue === null) firstRescue = r.loopDay; }
    rows.push({ ...r, preservedBefore: preserved, cfLogs, independentlyRescued: indep });
    if (r.warmthLogSpent) preserved += r.warmthLogSpent;
  }
  return { rows, rescued, firstRescue,
    shortening: firstRescue === null ? 0 : (eveningRows[eveningRows.length - 1].loopDay - firstRescue + 1) };
}
// Paired conversion: for each CONTROL strand evening, the variant
// evening on the same seed + loop-day.
function pairedConversion(controlCorpus, variantCorpus, seed) {
  const cRows = eveningTable(controlCorpus, seed);
  const vByDay = {};
  for (const r of eveningTable(variantCorpus, seed)) vByDay[r.loopDay] = r;
  const vInst = variantCorpus[seed];
  const vStrands = vInst ? extractStrands(vInst.evenings || []) : [];
  const vStrandDays = new Set(vStrands.flat());
  const out = [];
  for (const c of cRows) {
    if (!c.still) continue;
    const v = vByDay[c.loopDay] || null;
    let verdict;
    if (v && v.rescued) verdict = (c.cls === 'both') ? 'both-converted' : 'single-converted';
    else if (v && v.still) verdict = 'still';
    else if (v && !v.still && !v.rescued) verdict = 'diverged-not-creek';
    else if (!v) verdict = 'no-variant-evening';
    else verdict = 'other';
    // Prevention: variant already home (its strand ended earlier).
    if ((verdict === 'diverged-not-creek' || verdict === 'no-variant-evening') && !vStrandDays.has(c.loopDay)) {
      const earlierEnd = vStrands.some((run) => run[run.length - 1] < c.loopDay);
      if (earlierEnd) verdict = 'prevented-early-rescue';
    }
    out.push({ loopDay: c.loopDay, controlCls: c.cls, variantCls: v ? v.cls : null,
      variantStill: v ? v.still : null, variantRescued: v ? v.rescued : null, verdict });
  }
  return out;
}
function median(xs) {
  if (!xs.length) return null;
  const s = xs.slice().sort((a, b) => a - b);
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
}
function wallNumbers(corpus) {
  const seeds = Object.values(corpus);
  const waves = {};
  for (const inst of seeds) {
    const w = inst.maxWaveUnlocked || 0;
    for (let i = 1; i <= 5; i++) { waves[i] = (waves[i] || 0) + (w >= i ? 1 : 0); }
  }
  return { seeds: seeds.length,
    national: 0, table: 0, wins: 0, nationalNote: 'not observable on 30d pre-seat evening legs (no national/table/win fields in corpora)',
    waveReach: waves, medianSurvival: median(seeds.map((i) => i.daysAlive)),
    allSurvived30: seeds.every((i) => i.daysAlive === 30) };
}

module.exports = { loadCorpus, isStillCreek, isCreek, isRescuedCreek, classifyEvening,
  extractStrands, census, eveningTable, morningTable, protectedCounterfactual,
  pairedConversion, median, wallNumbers };

if (require.main === module) {
  const [controlDir, variantDir] = process.argv.slice(2);
  const out = {};
  for (const [name, dir] of [['control', controlDir], ['variant', variantDir]]) {
    if (!dir) continue;
    const corpus = loadCorpus(dir);
    out[name] = { census: census(corpus), wall: wallNumbers(corpus),
      strand15215: eveningTable(corpus, 15215),
      mornings15215: morningTable(corpus, 15215).filter((m) => m.attempt || m.skip),
      counterfactual15215: protectedCounterfactual(eveningTable(corpus, 15215).filter((r) => r.still)) };
  }
  if (controlDir && variantDir) {
    const cc = loadCorpus(controlDir), vc = loadCorpus(variantDir);
    out.paired15215 = pairedConversion(cc, vc, 15215);
  }
  console.log(JSON.stringify(out, null, 2));
}
