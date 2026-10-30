#!/usr/bin/env node
// analyze-fedexile-b.js — fed-exile DIAG census for sim-fedexile-b
// (prereg: evidence/2026-10-30/sim-fedexile-b-prereg.md).
// Pure reads; no game code. Pairs PRESSB=0 (unfed) and PRESSB=1
// (fed) ON legs seed-by-seed on the pre-registered metrics:
// strand lengths in still evenings, death-delay, endReason /
// bearer-death pairing, and the wood-seeking conversion rate
// on fed mornings. Also writes the §15 paired compare .md
// (official balance-panel driver deviation stated on its face:
// the strand stack is not a sweep-compare registry policy and
// the contract has no strand-length / fed-morning /
// wood-seeking metrics — same standing as sim-pressb-b).
// Usage: node scripts/analyze-fedexile-b.js <controlDir> <variantDir>
//   [guardControlDir] [guardVariantDir] [outJson] [morningTableJson] [compareMd]
// Control dir = PRESSB=0 ON legs; variant dir = PRESSB=1 ON legs.
'use strict';
const fs = require('fs');
const path = require('path');

const controlDir = process.argv[2], variantDir = process.argv[3];
const guardControlDir = process.argv[4] || null;
const guardVariantDir = process.argv[5] || null;
const outJson = process.argv[6] || null;
const morningTableJson = process.argv[7] || null;
const compareMd = process.argv[8] || null;
if (!controlDir || !variantDir) { console.error('usage: analyze-fedexile-b.js <controlDir> <variantDir> [guardControlDir] [guardVariantDir] [outJson] [morningTableJson] [compareMd]'); process.exit(2); }

function loadDir(dir) {
  const out = {};
  if (!dir || !fs.existsSync(dir)) return out;
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.json')).sort()) {
    try { const inst = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); out[inst.seed] = inst; }
    catch (e) { console.error('skip unreadable ' + f + ': ' + e.message); }
  }
  return out;
}
function wc(e) { return (e && e.woodcarry) || {}; }
function isCreekStill(e) { const w = wc(e); return w.bucket === 'creek' && !w.rescued; }
function eveningByDay(inst) {
  const m = {};
  for (const x of (inst.evenings || [])) m[x.loopDay] = x;
  return m;
}
function morningByDay(inst) {
  const m = {};
  for (const x of (inst.mornings || [])) m[x.loopDay] = x;
  return m;
}
// Maximal runs of consecutive loop-days with still evenings.
function extractStrands(inst) {
  const evs = (inst.evenings || []).slice().sort((a, b) => a.loopDay - b.loopDay);
  const strands = [];
  let cur = null;
  for (const e of evs) {
    if (isCreekStill(e)) {
      if (cur && e.loopDay === cur.endDay + 1) { cur.days.push(e.loopDay); cur.endDay = e.loopDay; }
      else { cur = { startDay: e.loopDay, endDay: e.loopDay, days: [e.loopDay] }; strands.push(cur); }
    } else { cur = null; }
  }
  for (const s of strands) s.length = s.days.length;
  return strands;
}
function censusCounts(inst) {
  let creek = 0, still = 0, rescued = 0;
  for (const e of (inst.evenings || [])) {
    const w = wc(e);
    if (w.bucket !== 'creek') continue;
    creek++;
    if (w.rescued) rescued++; else still++;
  }
  return { creek, still, rescued };
}
function bearerDeaths(inst) {
  const d = inst.deaths || [];
  if (!Array.isArray(d)) return [];
  return d.filter((x) => x && x.player === true).map((x) => ({ day: x.day ?? null, cause: x.cause || x.kind || null, who: x.who || null }));
}
function allDeathsCount(inst) {
  const d = inst.deaths || [];
  return Array.isArray(d) ? d.length : 0;
}
// Wood-seeking line scan (prereg-grounded engine narration).
// Gain lines: fell ("comes down with a crack that echoes. +N wood."),
// brush clear ("You clear the brush. +1 wood (brushwood)."),
// fallen-tree clear ("You cut through the fallen tree. +2 wood.").
// Attempt line: "Nothing to cut there." Refusal / fire / travel /
// forage lines never match these patterns, by construction.
const GAIN_RES = [
  /comes down with a crack that echoes\. \+\d+ wood\./,
  /You clear the brush\. \+1 wood \(brushwood\)\./,
  /You cut through the fallen tree\. \+2 wood\./,
];
const ATTEMPT_RES = [/Nothing to cut there\./];
function scanWoodSeeking(lines) {
  if (!Array.isArray(lines)) return { verdict: 'no-lines-recorded', matched: [], gain: false, attempt: false };
  const matched = [];
  let gain = false, attempt = false;
  for (const l of lines) {
    for (const re of GAIN_RES) if (re.test(l)) { matched.push(l); gain = true; }
    for (const re of ATTEMPT_RES) if (re.test(l)) { matched.push(l); attempt = true; }
  }
  const seeking = gain || attempt;
  return { verdict: seeking ? 'seeking' : 'not-seeking', matched, gain, attempt };
}
function median(nums) {
  if (!nums.length) return null;
  const s = nums.slice().sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

const control = loadDir(controlDir);
const variant = loadDir(variantDir);
const guardControl = loadDir(guardControlDir);
const guardVariant = loadDir(guardVariantDir);
const seeds = Object.keys(control).map(Number).sort((a, b) => a - b);
const variantSeeds = Object.keys(variant).map(Number).sort((a, b) => a - b);

const perSeed = {};
const morningRows = [];
let controlErrs = 0, variantErrs = 0;
let controlCreek = 0, controlStill = 0, controlRescued = 0;
let variantCreek = 0, variantStill = 0, variantRescued = 0;
let guardControlCreek = 0, guardControlStill = 0, guardControlRescued = 0;
let guardVariantCreek = 0, guardVariantStill = 0, guardVariantRescued = 0;
const pairedStrands = [];
const deltas = [];

function buildMorningRows(inst, leg, strands, controlStrandDays) {
  const evByDay = eveningByDay(inst);
  const moByDay = morningByDay(inst);
  const rows = [];
  const attemptByDay = {};
  for (const a of ((inst.pressbStore || {}).attempts || [])) attemptByDay[a.loopDay] = a;
  for (const st of strands) {
    for (const d of st.days) {
      const ev = evByDay[d] || null;
      const mo = moByDay[d] || null;
      const w = wc(ev);
      const cls = w.classification || {};
      const lines = ev ? (ev.fullDaySay || null) : null;
      const scan = scanWoodSeeking(lines);
      const nextEv = evByDay[d + 1] || null;
      const nextScan = scanWoodSeeking(nextEv ? (nextEv.fullDaySay || null) : null);
      const woodPlayer = (cls.woodPlayer === undefined ? null : cls.woodPlayer);
      const morningWood = mo ? (mo.morningWood ?? null) : null;
      const att = attemptByDay[d] || null;
      const variantOnly = controlStrandDays ? !controlStrandDays.has(d) : false;
      rows.push({
        seed: inst.seed, leg, loopDay: d,
        strandStart: st.startDay, strandEnd: st.endDay, strandLength: st.length,
        variantOnly,
        wakeTile: mo ? (mo.mapPx + ',' + mo.mapPy) : null, wakeTileType: mo ? (mo.tile || null) : null,
        wake: mo ? [mo.mx, mo.my] : null,
        morningKcal: mo ? (mo.kcal ?? null) : null, morningWood,
        morningRowPresent: !!mo, eveningRowPresent: !!ev, fullDaySayPresent: Array.isArray(lines),
        pressFired: !!att, pressE: att ? att.E : null, realizedNet: att ? att.realizedNet : null,
        kcalAfterEat: att ? att.kcalAfterEat : null,
        eveningBucket: w.bucket || null, eveningRescued: (w.rescued === undefined ? null : !!w.rescued),
        eveningBinding: cls.binding || null, eveningWoodPlayer: woodPlayer,
        eveningNarration: w.narration || null,
        warmthActed: ev && ev.warmth ? !!ev.warmth.acted : null,
        warmthLogSpent: ev && ev.warmth ? (ev.warmth.logSpent ?? null) : null,
        woodSeeking: scan.verdict, woodSeekingMatched: scan.matched,
        woodSeekingGain: scan.gain, woodSeekingAttempt: scan.attempt,
        daytimeWoodDelta: (woodPlayer !== null && morningWood !== null) ? (woodPlayer - morningWood) : null,
        nextDayWoodSeeking: nextScan.verdict, nextDayMatched: nextScan.matched,
        adjSources: mo ? (mo.adjSources || null) : null,
      });
    }
  }
  return rows;
}

for (const s of seeds) {
  const c = control[s], v = variant[s] || null;
  const cc = censusCounts(c);
  controlCreek += cc.creek; controlStill += cc.still; controlRescued += cc.rescued;
  controlErrs += ((c.pressbStore || {}).errs || 0) + ((c.woodcarryStore || {}).errs || 0);
  const cStrands = extractStrands(c);
  const cStrandDays = new Set();
  for (const st of cStrands) for (const d of st.days) cStrandDays.add(d);
  const cRows = buildMorningRows(c, 'control', cStrands, null);
  const rec = { seed: s, control: null, variant: null, controlStrands: cStrands, variantStrands: [], pairs: [] };
  rec.control = { evenings: (c.evenings || []).length, creek: cc.creek, still: cc.still, rescued: cc.rescued,
    daysAlive: c.daysAlive, endReason: c.endReason, maxWave: c.maxWaveUnlocked,
    bearerDeaths: bearerDeaths(c), allDeaths: allDeathsCount(c),
    pressbAttempts: ((c.pressbStore || {}).attempts || []).length,
    pressbErrs: ((c.pressbStore || {}).errs || 0) };
  for (const r of cRows) morningRows.push(r);
  if (v) {
    const vc = censusCounts(v);
    variantCreek += vc.creek; variantStill += vc.still; variantRescued += vc.rescued;
    variantErrs += ((v.pressbStore || {}).errs || 0) + ((v.woodcarryStore || {}).errs || 0);
    const vStrands = extractStrands(v);
    rec.variantStrands = vStrands;
    const vRows = buildMorningRows(v, 'variant', vStrands, cStrandDays);
    for (const r of vRows) morningRows.push(r);
    rec.variant = { evenings: (v.evenings || []).length, creek: vc.creek, still: vc.still, rescued: vc.rescued,
      daysAlive: v.daysAlive, endReason: v.endReason, maxWave: v.maxWaveUnlocked,
      bearerDeaths: bearerDeaths(v), allDeaths: allDeathsCount(v),
      pressbAttempts: ((v.pressbStore || {}).attempts || []).length,
      pressbErrs: ((v.pressbStore || {}).errs || 0),
      eveningLoopDays: (v.evenings || []).map((e) => e.loopDay) };
    // Pair strands by order of appearance.
    const n = Math.max(cStrands.length, vStrands.length);
    for (let i = 0; i < n; i++) {
      const cs = cStrands[i] || null, vs = vStrands[i] || null;
      const pair = { index: i, control: cs, variant: vs,
        paired: !!(cs && vs),
        delta: (cs && vs) ? (vs.length - cs.length) : null };
      if (pair.paired) deltas.push(pair.delta);
      rec.pairs.push(pair);
      pairedStrands.push({ seed: s, ...pair });
    }
  }
  perSeed[s] = rec;
}
// Guard band reproduction (census only, never judged).
for (const s of Object.keys(guardControl).map(Number).sort((a, b) => a - b)) {
  const g = censusCounts(guardControl[s]);
  guardControlCreek += g.creek; guardControlStill += g.still; guardControlRescued += g.rescued;
}
for (const s of Object.keys(guardVariant).map(Number).sort((a, b) => a - b)) {
  const g = censusCounts(guardVariant[s]);
  guardVariantCreek += g.creek; guardVariantStill += g.still; guardVariantRescued += g.rescued;
}
// Stall check: evening loopDays contiguous from 1.
const stalls = [];
for (const s of variantSeeds) {
  const days = (variant[s].evenings || []).map((e) => e.loopDay);
  for (let i = 0; i < days.length; i++) if (days[i] !== i + 1) { stalls.push({ seed: s, gapAt: i, days }); break; }
}
for (const s of seeds) {
  const days = (control[s].evenings || []).map((e) => e.loopDay);
  for (let i = 0; i < days.length; i++) if (days[i] !== i + 1) { stalls.push({ seed: s, leg: 'control', gapAt: i, days }); break; }
}
// Death-delay + endReason pairing per seed.
const deathPairs = [];
for (const s of seeds) {
  if (!variant[s]) continue;
  const cb = perSeed[s].control.bearerDeaths, vb = perSeed[s].variant.bearerDeaths;
  const cDay = cb.length ? cb[0].day : null, vDay = vb.length ? vb[0].day : null;
  deathPairs.push({ seed: s,
    controlBearer: cb, variantBearer: vb,
    controlFirstDay: cDay, variantFirstDay: vDay,
    deathDelay: (cDay !== null && vDay !== null) ? (vDay - cDay) : null,
    censored: !(cDay !== null && vDay !== null),
    sameCause: cb.length && vb.length ? (cb[0].cause === vb[0].cause) : null,
    endReasonControl: perSeed[s].control.endReason, endReasonVariant: perSeed[s].variant.endReason,
    daysAliveControl: perSeed[s].control.daysAlive, daysAliveVariant: perSeed[s].variant.daysAlive,
    maxWaveControl: perSeed[s].control.maxWave, maxWaveVariant: perSeed[s].variant.maxWave,
    allDeathsControl: perSeed[s].control.allDeaths, allDeathsVariant: perSeed[s].variant.allDeaths });
}
// Fed-morning conversion (primary denominator = fired mornings on variant strands).
const fedRows = morningRows.filter((r) => r.leg === 'variant' && r.pressFired);
const fedSeeking = fedRows.filter((r) => r.woodSeeking === 'seeking');
const fedSeekingGain = fedRows.filter((r) => r.woodSeekingGain);
const variantStrandRows = morningRows.filter((r) => r.leg === 'variant');
const variantSkippedRows = variantStrandRows.filter((r) => !r.pressFired);
const skippedSeeking = variantSkippedRows.filter((r) => r.woodSeeking === 'seeking');
const fedNextKnown = fedRows.filter((r) => r.nextDayWoodSeeking !== 'no-lines-recorded');
const fedNextSeeking = fedNextKnown.filter((r) => r.nextDayWoodSeeking === 'seeking');
const fedPositiveDelta = fedRows.filter((r) => r.daytimeWoodDelta !== null && r.daytimeWoodDelta > 0);
const fedDeltaDisagree = fedRows.filter((r) => (r.woodSeeking === 'seeking') !== (r.daytimeWoodDelta !== null && r.daytimeWoodDelta > 0));
// Evening binding mix on strand evenings.
function bindingMix(rows) {
  const mix = {};
  for (const r of rows) mix[r.eveningBinding || 'null'] = (mix[r.eveningBinding || 'null'] || 0) + 1;
  return mix;
}
const controlStrandRows = morningRows.filter((r) => r.leg === 'control');
const controlBindingMix = bindingMix(controlStrandRows);
const variantBindingMix = bindingMix(variantStrandRows);
// Wall numbers.
const daysAliveAll = seeds.map((s) => perSeed[s].control.daysAlive).concat(variantSeeds.map((s) => perSeed[s].variant.daysAlive));
const waveReach = {};
for (const s of seeds) {
  for (const w of [1, 2, 3, 4, 5]) {
    waveReach[w] = waveReach[w] || { control: 0, variant: 0 };
    if ((perSeed[s].control.maxWave || 0) >= w) waveReach[w].control++;
    if (perSeed[s].variant && (perSeed[s].variant.maxWave || 0) >= w) waveReach[w].variant++;
  }
}
// Bar (a): every strand morning on both legs has a table row with
// morning + evening rows present and day lines recorded.
const strandMorningTotal = morningRows.length;
const strandMorningComplete = morningRows.filter((r) => r.morningRowPresent && r.eveningRowPresent && r.fullDaySayPresent).length;
const strandMorningIncomplete = morningRows.filter((r) => !(r.morningRowPresent && r.eveningRowPresent && r.fullDaySayPresent));
const bars = {
  a_tableComplete: strandMorningIncomplete.length === 0 && strandMorningTotal > 0,
  b_deltaQuantified: pairedStrands.filter((p) => p.paired).length > 0 && deltas.length > 0 && deathPairs.length === seeds.filter((s) => variant[s]).length,
  c_conversionCounted: fedRows.length > 0,
  // (d) determinism + proof are judged by scripts/test-fedexile-b.js, not here.
};
const totals = {
  seeds: seeds.length, variantSeeds: variantSeeds.length,
  control: { creek: controlCreek, still: controlStill, rescued: controlRescued },
  variant: { creek: variantCreek, still: variantStill, rescued: variantRescued },
  guardControl: { creek: guardControlCreek, still: guardControlStill, rescued: guardControlRescued, seeds: Object.keys(guardControl).length },
  guardVariant: { creek: guardVariantCreek, still: guardVariantStill, rescued: guardVariantRescued, seeds: Object.keys(guardVariant).length },
  pairedStrands: pairedStrands.filter((p) => p.paired).length,
  unpairedStrands: pairedStrands.filter((p) => !p.paired).length,
  deltas, medianDelta: median(deltas),
  deathPairs, medianSurvival: median(daysAliveAll),
  waveReach,
  fedMornings: fedRows.length, fedSeeking: fedSeeking.length,
  conversionRate: fedRows.length ? fedSeeking.length / fedRows.length : null,
  fedSeekingGain: fedSeekingGain.length,
  variantStrandMornings: variantStrandRows.length, variantSkippedMornings: variantSkippedRows.length,
  skippedSeeking: skippedSeeking.length,
  fedNextKnown: fedNextKnown.length, fedNextSeeking: fedNextSeeking.length,
  fedPositiveDelta: fedPositiveDelta.length, fedDeltaDisagree: fedDeltaDisagree.length,
  controlBindingMix, variantBindingMix,
  strandMorningTotal, strandMorningComplete, strandMorningIncomplete: strandMorningIncomplete.length,
  controlErrs, variantErrs, stalls: stalls.length,
};
const result = { controlDir, variantDir, guardControlDir, guardVariantDir, totals, bars, perSeed, pairedStrands, deathPairs, morningRows, stalls };

console.log('seeds control ' + seeds.length + ' variant ' + variantSeeds.length);
console.log('control creek/still/rescued ' + controlCreek + '/' + controlStill + '/' + controlRescued + ' | variant ' + variantCreek + '/' + variantStill + '/' + variantRescued);
console.log('guard control creek/still/rescued ' + guardControlCreek + '/' + guardControlStill + '/' + guardControlRescued + ' | guard variant ' + guardVariantCreek + '/' + guardVariantStill + '/' + guardVariantRescued);
console.log('paired strands ' + pairedStrands.filter((p) => p.paired).length + ' unpaired ' + pairedStrands.filter((p) => !p.paired).length + ' deltas ' + JSON.stringify(deltas) + ' median ' + median(deltas));
for (const p of pairedStrands) console.log('  STRAND seed ' + p.seed + ' idx ' + p.index + ' control ' + (p.control ? p.control.startDay + '-' + p.control.endDay + ' len ' + p.control.length : 'none') + ' variant ' + (p.variant ? p.variant.startDay + '-' + p.variant.endDay + ' len ' + p.variant.length : 'none') + ' delta ' + p.delta + (p.paired ? '' : ' UNPAIRED'));
for (const d of deathPairs) console.log('  DEATH seed ' + d.seed + ' bearer day c/v ' + d.controlFirstDay + '/' + d.variantFirstDay + ' delay ' + d.deathDelay + (d.censored ? ' CENSORED' : '') + ' sameCause ' + d.sameCause + ' end c/v ' + d.endReasonControl + '/' + d.endReasonVariant + ' daysAlive c/v ' + d.daysAliveControl + '/' + d.daysAliveVariant + ' waves c/v ' + d.maxWaveControl + '/' + d.maxWaveVariant + ' allDeaths c/v ' + d.allDeathsControl + '/' + d.allDeathsVariant);
console.log('fed mornings ' + fedRows.length + ' seeking ' + fedSeeking.length + ' rate ' + (fedRows.length ? (fedSeeking.length / fedRows.length).toFixed(3) : 'n/a') + ' (gain-line ' + fedSeekingGain.length + ')');
for (const r of fedRows) console.log('  FED seed ' + r.seed + ' day ' + r.loopDay + ' kcal ' + r.morningKcal + ' wood ' + r.morningWood + ' E ' + r.pressE + ' seeking ' + r.woodSeeking + (r.woodSeekingMatched.length ? ' :: ' + JSON.stringify(r.woodSeekingMatched) : '') + ' delta ' + r.daytimeWoodDelta + ' nextDay ' + r.nextDayWoodSeeking + ' binding ' + r.eveningBinding);
console.log('variant strand mornings ' + variantStrandRows.length + ' skipped ' + variantSkippedRows.length + ' skipped-seeking ' + skippedSeeking.length + ' fed-next-known ' + fedNextKnown.length + ' fed-next-seeking ' + fedNextSeeking.length + ' fed-positive-delta ' + fedPositiveDelta.length + ' scan/delta disagreements ' + fedDeltaDisagree.length);
console.log('strand mornings total ' + strandMorningTotal + ' complete ' + strandMorningComplete + ' incomplete ' + strandMorningIncomplete.length + ' errs c/v ' + controlErrs + '/' + variantErrs + ' stalls ' + stalls.length);
console.log('BARS ' + JSON.stringify(bars));
if (outJson) { fs.mkdirSync(path.dirname(outJson), { recursive: true }); fs.writeFileSync(outJson, JSON.stringify(result, null, 2)); console.log('wrote ' + outJson); }
if (morningTableJson) { fs.mkdirSync(path.dirname(morningTableJson), { recursive: true }); fs.writeFileSync(morningTableJson, JSON.stringify(morningRows, null, 2)); console.log('wrote ' + morningTableJson); }
if (compareMd) {
  const L = [];
  L.push('# sim-fedexile-b — paired before/after (§15 compare)');
  L.push('');
  L.push('§15 DEVIATION (stated on its face): the official balance-panel driver cannot express this arm — its policies are sweep-compare registry policies, not the nighttravel+woodcarry+woodwarm strand stack, and the 23-metric contract has no strand-length / fed-morning / wood-seeking metrics (same standing as sim-pressb-b, sim-armorstock, sim-shellrevive-b). This compare pairs unfed control (PRESSB=0) and fed variant (PRESSB=1) legs seed-by-seed on the pre-registered metrics, plus guardrail metrics (survival, death causes, wave reach). The panel is the instrument here in paired form; the pre-registered DIAG-GO bars in the prereg are the judge. This is a DIAG census with a paired comparison, not a before/after lever claim — no behavior is landed by this arm.');
  L.push('');
  L.push('Pairs: ' + seeds.filter((s) => variant[s]).length + ' seeds (identical seeds, 30 loop-days, same base). Control creek/still/rescued ' + controlCreek + '/' + controlStill + '/' + controlRescued + '; variant ' + variantCreek + '/' + variantStill + '/' + variantRescued + '. Guard control ' + guardControlCreek + '/' + guardControlStill + '/' + guardControlRescued + '; guard variant ' + guardVariantCreek + '/' + guardVariantStill + '/' + guardVariantRescued + '.');
  L.push('');
  L.push('## PRIMARY: fed-vs-unfed strand-length delta (still evenings, paired per strand)');
  L.push('');
  L.push('- paired strands: ' + pairedStrands.filter((p) => p.paired).length + ' (unpaired: ' + pairedStrands.filter((p) => !p.paired).length + ')');
  L.push('- deltas (variant − control): ' + JSON.stringify(deltas) + ' — median ' + median(deltas));
  for (const p of pairedStrands) L.push('  - seed ' + p.seed + ' strand ' + p.index + ': control ' + (p.control ? p.control.startDay + '–' + p.control.endDay + ' (' + p.control.length + ')' : 'none') + ' → variant ' + (p.variant ? p.variant.startDay + '–' + p.variant.endDay + ' (' + p.variant.length + ')' : 'none') + ' — delta ' + p.delta + (p.paired ? '' : ' UNPAIRED'));
  L.push('');
  L.push('## PRIMARY: death-delay (bearer-death day, variant − control)');
  L.push('');
  for (const d of deathPairs) L.push('  - seed ' + d.seed + ': bearer day ' + d.controlFirstDay + ' → ' + d.variantFirstDay + ' — delay ' + d.deathDelay + (d.censored ? ' (CENSORED: a leg has no bearer death)' : '') + ' — same cause ' + d.sameCause + ' — end ' + d.endReasonControl + ' → ' + d.endReasonVariant + ' — daysAlive ' + d.daysAliveControl + ' → ' + d.daysAliveVariant + ' — waves ' + d.maxWaveControl + ' → ' + d.maxWaveVariant);
  L.push('');
  L.push('## PRIMARY: wood-seeking conversion on fed mornings (fired mornings → same-day wood-seeking)');
  L.push('');
  L.push('- fed mornings: ' + fedRows.length + ' — wood-seeking: ' + fedSeeking.length + ' — rate ' + (fedRows.length ? (fedSeeking.length / fedRows.length).toFixed(3) : 'n/a') + ' (gain-line mornings: ' + fedSeekingGain.length + ')');
  L.push('- variant strand mornings total: ' + variantStrandRows.length + ' — skipped mornings: ' + variantSkippedRows.length + ' — skipped-seeking: ' + skippedSeeking.length);
  L.push('- fed mornings with next-day lines recorded: ' + fedNextKnown.length + ' — next-day seeking: ' + fedNextSeeking.length);
  L.push('- fed mornings with positive daytime wood delta: ' + fedPositiveDelta.length + ' — scan/delta disagreements: ' + fedDeltaDisagree.length);
  for (const r of fedRows) L.push('  - seed ' + r.seed + ' day ' + r.loopDay + ': morning kcal ' + r.morningKcal + ', wood ' + r.morningWood + ', press E ' + r.pressE + ' — seeking ' + r.woodSeeking + (r.woodSeekingMatched.length ? ' — ' + JSON.stringify(r.woodSeekingMatched) : '') + ' — daytime delta ' + r.daytimeWoodDelta + ' — next-day ' + r.nextDayWoodSeeking + ' — evening binding ' + r.eveningBinding);
  L.push('');
  L.push('## GUARDRAILS');
  L.push('');
  L.push('- strand mornings in table: ' + strandMorningTotal + ' — complete (morning + evening + day lines): ' + strandMorningComplete + ' — incomplete: ' + strandMorningIncomplete.length);
  L.push('- recorder errors control/variant: ' + controlErrs + '/' + variantErrs + ' — stalls: ' + stalls.length);
  L.push('- evening binding mix, control strands: ' + JSON.stringify(controlBindingMix) + '; variant strands: ' + JSON.stringify(variantBindingMix));
  L.push('- median survival (all judged legs): ' + median(daysAliveAll) + ' days; wave reach (control/variant): ' + Object.keys(waveReach).map((w) => 'wave ' + w + ' ' + waveReach[w].control + '/' + waveReach[w].variant).join(', '));
  L.push('- national / table / wins: NOT OBSERVABLE on 30-day evening legs (pre-seat, no field) — structural 0 on this window, not a game verdict; see evidence file.');
  L.push('');
  L.push('## VERDICT (bars a–c here; bar d determinism + proof judged by scripts/test-fedexile-b.js)');
  L.push('');
  L.push('- (a) paired table complete: ' + (bars.a_tableComplete ? 'PASS' : 'FAIL'));
  L.push('- (b) delta quantified: ' + (bars.b_deltaQuantified ? 'PASS' : 'FAIL'));
  L.push('- (c) conversion counted: ' + (bars.c_conversionCounted ? 'PASS' : 'FAIL'));
  L.push('');
  fs.mkdirSync(path.dirname(compareMd), { recursive: true });
  fs.writeFileSync(compareMd, L.join('\n'));
  console.log('wrote ' + compareMd);
}
