#!/usr/bin/env node
// analyze-pressb-b.js — paired before/after analysis for sim-pressb-b
// (prereg: evidence/2026-10-30/sim-pressb-b-prereg.md).
// Pure reads; no game code. Also writes the §15 paired compare .md
// (official balance-panel driver deviation stated on its face:
// the strand stack is not a sweep-compare registry policy and the
// contract has no press/fire/banking metrics — same standing as
// sim-armorstock / sim-shellrevive-b).
// Usage: node scripts/analyze-pressb-b.js <controlDir> <variantDir>
//   [replayDir] [outJson] [compareMd]
// Control dir = PRESSB=0 ON legs; variant dir = PRESSB=1 ON legs.
// Replay dir = wakeforage-replay-b.js press files on the control
// trajectory (same base), one per control stranded field morning.
'use strict';
const fs = require('fs');
const path = require('path');

const controlDir = process.argv[2], variantDir = process.argv[3];
const replayDir = process.argv[4] || null;
const outJson = process.argv[5] || null;
const compareMd = process.argv[6] || null;
if (!controlDir || !variantDir) { console.error('usage: analyze-pressb-b.js <controlDir> <variantDir> [replayDir] [outJson] [compareMd]'); process.exit(2); }

function loadDir(dir) {
  const out = {};
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.json')).sort()) {
    try { const inst = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); out[inst.seed] = inst; }
    catch (e) { console.error('skip unreadable ' + f + ': ' + e.message); }
  }
  return out;
}
function loadReplay(dir) {
  const map = {};
  if (!dir || !fs.existsSync(dir)) return map;
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.json')).sort()) {
    try {
      const r = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
      if (r.mode === 'press') map[r.seed + '|' + r.targetDay] = r;
    } catch (e) { /* skip */ }
  }
  return map;
}
function wc(e) { return (e && e.woodcarry) || {}; }
function isCreekStill(e) { const w = wc(e); return w.bucket === 'creek' && !w.rescued; }
function morningByDay(inst) {
  const m = {};
  for (const x of (inst.mornings || [])) m[x.loopDay] = x;
  return m;
}
function eveningByDay(inst) {
  const m = {};
  for (const x of (inst.evenings || [])) m[x.loopDay] = x;
  return m;
}
function knownLiveCells(morning, eveningRow) {
  const sw = (morning && morning.sweepAnalysis) || (eveningRow && eveningRow.morningSweep) || null;
  if (!sw || sw.error || !Array.isArray(sw.cells)) return null;
  return sw.cells.filter((c) => c.forageable && (c.cell === 'plant' || c.cell === 'bush') && c.assigned && c.known === true);
}
function deathCauses(inst) {
  const d = inst.deaths || [];
  if (Array.isArray(d)) return d.map((x) => (typeof x === 'string' ? x : (x.cause || x.kind || JSON.stringify(x)))).sort();
  return [];
}
// Bearer deaths only (player:true): the played character's death
// line, across bearer changes. The deaths stream mixes monster
// kills, villager deaths, and bearer deaths; the prereg bar (c)
// guards the morning routine against killing the scholar/village
// (daysAlive loss, run-ending endReason, new bearer death cause),
// so the BAR pairs bearer causes. All-deaths counts are still
// reported per pair below, never hidden.
function bearerCauses(inst) {
  const d = inst.deaths || [];
  if (!Array.isArray(d)) return [];
  return d.filter((x) => x && x.player === true).map((x) => (x.cause || x.kind || JSON.stringify(x))).sort();
}

const control = loadDir(controlDir);
const variant = loadDir(variantDir);
const replay = loadReplay(replayDir);
const seeds = Object.keys(control).map(Number).sort((a, b) => a - b);
const variantSeeds = Object.keys(variant).map(Number).sort((a, b) => a - b);

const perSeed = {};
const denomMornings = [];
const controlStrandedField = [];
let controlErrs = 0, variantErrs = 0, offTargetFires = 0, totalAttempts = 0;
let controlCreek = 0, controlStill = 0, controlRescued = 0, variantCreek = 0, variantStill = 0, variantRescued = 0;

for (const s of seeds) {
  const c = control[s], v = variant[s] || null;
  const cEv = eveningByDay(c), cMo = morningByDay(c);
  const rec = { seed: s, control: null, variant: null, controlStrandedField: [], denom: [] };
  let creek = 0, still = 0, rescued = 0;
  for (const e of (c.evenings || [])) {
    const w = wc(e);
    if (w.bucket !== 'creek') continue;
    creek++;
    if (w.rescued) rescued++; else still++;
  }
  controlCreek += creek; controlStill += still; controlRescued += rescued;
  for (const e of (c.evenings || [])) {
    if (!isCreekStill(e)) continue;
    const m = cMo[e.loopDay] || null;
    const field = !!m && m.tile !== 'haven';
    if (field) {
      const row = { seed: s, loopDay: e.loopDay, wakeTile: m ? (m.mapPx + ',' + m.mapPy) : null, wake: m ? [m.mx, m.my] : null, morningKcal: m ? m.kcal : null };
      const rp = replay[s + '|' + e.loopDay] || null;
      row.provenE = rp ? ((rp.totals || {}).knownEdibleKcal ?? null) : null;
      row.replayDiffs = rp ? (rp.judgedDiffs || null) : null;
      controlStrandedField.push(row); rec.controlStrandedField.push(row);
    }
  }
  rec.control = { evenings: (c.evenings || []).length, creek, still, rescued, daysAlive: c.daysAlive, endReason: c.endReason, deaths: deathCauses(c), bearerDeaths: bearerCauses(c), maxWave: c.maxWaveUnlocked, pressbAttempts: ((c.pressbStore || {}).attempts || []).length, pressbErrs: ((c.pressbStore || {}).errs || 0) };
  controlErrs += rec.control.pressbErrs;
  if (v) {
    const vEv = eveningByDay(v), vMo = morningByDay(v);
    let vcreek = 0, vstil = 0, vrescued = 0;
    for (const e of (v.evenings || [])) {
      const w = wc(e);
      if (w.bucket !== 'creek') continue;
      vcreek++;
      if (w.rescued) vrescued++; else vstil++;
    }
    variantCreek += vcreek; variantStill += vstil; variantRescued += vrescued;
    const attempts = (v.pressbStore || {}).attempts || [];
    totalAttempts += attempts.length;
    const attemptByDay = {};
    for (const a of attempts) attemptByDay[a.loopDay] = a;
    // Off-target: any attempt whose previous evening is not stranded
    // or whose wake tile is haven (gate must prevent both).
    for (const a of attempts) {
      const prevEv = vEv[a.loopDay - 1] || null;
      const prevStranded = !!(prevEv && isCreekStill(prevEv));
      const m = vMo[a.loopDay] || null;
      const field = !!m && m.tile !== 'haven';
      if (!prevStranded || !field) offTargetFires++;
    }
    // Denominator mornings (independent of the policy's decision):
    // previous evening stranded + field wake + live known cell.
    for (const m of (v.mornings || [])) {
      if (m.loopDay <= 1) continue;
      const prevEv = vEv[m.loopDay - 1] || null;
      if (!(prevEv && isCreekStill(prevEv))) continue;
      const field = m.tile !== 'haven' && !m.inside;
      if (!field) continue;
      const known = knownLiveCells(m, vEv[m.loopDay] || null);
      if (known === null || known.length < 1) continue;
      const att = attemptByDay[m.loopDay] || null;
      const sameDayEv = vEv[m.loopDay] || null;
      const boundary = !(sameDayEv && isCreekStill(sameDayEv));
      const rp = replay[s + '|' + m.loopDay] || null;
      const row = { seed: s, loopDay: m.loopDay, wakeTile: (m.mapPx + ',' + m.mapPy), wake: [m.mx, m.my],
        morningKcal: m.kcal, knownSpecies: known.map((k) => k.species), knownCells: known.length,
        fired: !!att, variantE: att ? att.E : 0, realizedNet: att ? att.realizedNet : null,
        kcalAfterEat: att ? att.kcalAfterEat : null, pressErr: att ? att.pressErr : null, eatErr: att ? att.eatErr : null,
        boundary, provenE: rp ? ((rp.totals || {}).knownEdibleKcal ?? null) : null,
        replayDiffs: rp ? (rp.judgedDiffs || null) : null, comparator: !!rp };
      denomMornings.push(row); rec.denom.push(row);
    }
    rec.variant = { evenings: (v.evenings || []).length, creek: vcreek, still: vstil, rescued: vrescued, daysAlive: v.daysAlive, endReason: v.endReason, deaths: deathCauses(v), bearerDeaths: bearerCauses(v), maxWave: v.maxWaveUnlocked, pressbAttempts: attempts.length, pressbErrs: ((v.pressbStore || {}).errs || 0), eveningLoopDays: (v.evenings || []).map((e) => e.loopDay) };
    variantErrs += rec.variant.pressbErrs;
  }
  perSeed[s] = rec;
}

// Regression pairing (seeds present on both sides).
const pairs = [];
for (const s of seeds) {
  if (!variant[s]) continue;
  const c = perSeed[s].control, v = perSeed[s].variant;
  const daysDelta = (v.daysAlive || 0) - (c.daysAlive || 0);
  // BAR (c) pairs bearer death causes (see bearerCauses note).
  // All-deaths cause sets are reported, not barred: a behavior
  // arm reshuffles RNG, so village/monster background churn
  // (e.g. the fed scholar killing monsters the control scholar
  // never fought) is not a morning-routine regression signal.
  const newCauses = v.bearerDeaths.filter((d) => !c.bearerDeaths.includes(d));
  const endWorsened = (v.endReason !== c.endReason) && (v.endReason !== 'survived') && (c.endReason === 'survived');
  pairs.push({ seed: s, daysAliveControl: c.daysAlive, daysAliveVariant: v.daysAlive, daysDelta,
    endReasonControl: c.endReason, endReasonVariant: v.endReason, deathsControl: c.deaths, deathsVariant: v.deaths,
    bearerDeathsControl: c.bearerDeaths, bearerDeathsVariant: v.bearerDeaths,
    newCauses, endWorsened, maxWaveControl: c.maxWave, maxWaveVariant: v.maxWave });
}
const regressionFail = pairs.filter((p) => p.daysDelta < -10 || p.newCauses.length > 0 || p.endWorsened);
// Stall check: evening loopDays must be contiguous from 1.
const stalls = [];
for (const s of variantSeeds) {
  const v = variant[s];
  const days = (v.evenings || []).map((e) => e.loopDay);
  for (let i = 0; i < days.length; i++) if (days[i] !== i + 1) { stalls.push({ seed: s, gapAt: i, days }); break; }
}
const fired = denomMornings.filter((m) => m.fired);
const fireRate = denomMornings.length ? fired.length / denomMornings.length : null;
const withComp = denomMornings.filter((m) => m.comparator);
const coverage = denomMornings.length ? withComp.length / denomMornings.length : null;
const sumVariantE = withComp.reduce((t, m) => t + (m.variantE || 0), 0);
const sumProvenE = withComp.reduce((t, m) => t + (m.provenE || 0), 0);
const bankingRatio = sumProvenE ? sumVariantE / sumProvenE : null;
const replayMismatch = withComp.filter((m) => m.replayDiffs && m.replayDiffs.length).length
  + controlStrandedField.filter((m) => m.replayDiffs && m.replayDiffs.length).length;
const naiveControlTotal = controlStrandedField.reduce((t, m) => t + (m.provenE || 0), 0);
const naiveControlWithComp = controlStrandedField.filter((m) => m.provenE !== null && m.provenE !== undefined).length;
const variantTotalE = denomMornings.reduce((t, m) => t + (m.variantE || 0), 0)
  + 0; // attempts outside the denominator would be off-target; counted separately below
const offTargetAttemptsE = (() => {
  let t = 0;
  for (const s of variantSeeds) for (const a of ((variant[s].pressbStore || {}).attempts || [])) {
    const inDenom = denomMornings.some((m) => m.seed === s && m.loopDay === a.loopDay);
    if (!inDenom) t += (a.E || 0);
  }
  return t;
})();
const totals = {
  seeds: seeds.length, variantSeeds: variantSeeds.length,
  control: { creek: controlCreek, still: controlStill, rescued: controlRescued },
  variant: { creek: variantCreek, still: variantStill, rescued: variantRescued },
  controlStrandedField: controlStrandedField.length, naiveControlWithComp, naiveControlTotal,
  denominator: denomMornings.length, fired: fired.length, fireRate,
  comparatorCoverage: coverage, comparators: withComp.length,
  sumVariantE, sumProvenE, bankingRatio,
  variantTotalE, offTargetAttemptsE,
  totalAttempts, offTargetFires, controlErrs, variantErrs, stalls: stalls.length, replayMismatch,
  regressionFail: regressionFail.length,
};
const bars = {
  fireRate: fireRate !== null && fireRate >= 0.8,
  bankingRatio: bankingRatio !== null && bankingRatio >= 0.8,
  coverage100: coverage === 1,
  regression: regressionFail.length === 0,
  offTarget0: offTargetFires === 0,
  errs0: variantErrs === 0 && controlErrs === 0,
  stalls0: stalls.length === 0,
  replayMatch: replayMismatch === 0,
};
const GO = Object.values(bars).every(Boolean);
const result = { controlDir, variantDir, replayDir, totals, bars, GO, perSeed, denomMornings, controlStrandedField, pairs, stalls };

console.log('seeds control ' + seeds.length + ' variant ' + variantSeeds.length);
console.log('control creek/still/rescued ' + controlCreek + '/' + controlStill + '/' + controlRescued + ' | variant ' + variantCreek + '/' + variantStill + '/' + variantRescued);
console.log('control stranded field mornings ' + controlStrandedField.length + ' (with comparator ' + naiveControlWithComp + ', proven total ' + naiveControlTotal + ')');
console.log('denominator ' + denomMornings.length + ' fired ' + fired.length + ' fireRate ' + fireRate + ' coverage ' + coverage);
console.log('banking: variantE ' + sumVariantE + ' provenE ' + sumProvenE + ' ratio ' + bankingRatio);
console.log('naive: variant total E ' + variantTotalE + ' (off-target E ' + offTargetAttemptsE + ') vs control total ' + naiveControlTotal);
console.log('off-target fires ' + offTargetFires + ' errs c/v ' + controlErrs + '/' + variantErrs + ' stalls ' + stalls.length + ' replay mismatch ' + replayMismatch + ' regression fails ' + regressionFail.length);
for (const m of denomMornings) {
  console.log('  DENOM seed ' + m.seed + ' day ' + m.loopDay + ' wake ' + m.wakeTile + ' ' + JSON.stringify(m.wake) + ' kcal ' + m.morningKcal + ' known ' + JSON.stringify(m.knownSpecies) + ' fired ' + m.fired + ' variantE ' + m.variantE + ' provenE ' + m.provenE + (m.boundary ? ' BOUNDARY' : '') + (m.pressErr ? ' PRESS-ERR ' + m.pressErr : '') + (m.eatErr ? ' EAT-ERR ' + m.eatErr : ''));
}
for (const p of pairs) {
  console.log('  PAIR seed ' + p.seed + ' daysAlive c/v ' + p.daysAliveControl + '/' + p.daysAliveVariant + ' end c/v ' + p.endReasonControl + '/' + p.endReasonVariant + ' bearerDeaths c/v ' + JSON.stringify(p.bearerDeathsControl) + '/' + JSON.stringify(p.bearerDeathsVariant) + ' allDeaths n c/v ' + p.deathsControl.length + '/' + p.deathsVariant.length + ' waves c/v ' + p.maxWaveControl + '/' + p.maxWaveVariant + (p.newCauses.length ? ' NEW-BEARER-CAUSES ' + JSON.stringify(p.newCauses) : '') + (p.endWorsened ? ' END-WORSENED' : ''));
}
console.log('BARS ' + JSON.stringify(bars) + ' GO ' + GO);
if (outJson) { fs.mkdirSync(path.dirname(outJson), { recursive: true }); fs.writeFileSync(outJson, JSON.stringify(result, null, 2)); console.log('wrote ' + outJson); }
if (compareMd) {
  const L = [];
  L.push('# sim-pressb-b — paired before/after (§15 compare)');
  L.push('');
  L.push('§15 DEVIATION (stated on its face): the official balance-panel driver cannot express this arm — its policies are sweep-compare registry policies, not the nighttravel+woodcarry+woodwarm strand stack, and the 23-metric contract has no press/fire/banking metrics (same standing as sim-armorstock / sim-shellrevive-b). This compare pairs control (PRESSB=0) and variant (PRESSB=1) legs seed-by-seed on the pre-registered metrics, plus guardrail metrics (survival, death causes, wave reach). The panel is the instrument here in paired form; the pre-registered thresholds in the prereg are the judge.');
  L.push('');
  L.push('Pairs: ' + pairs.length + ' seeds (identical seeds, 30 loop-days, same base). Control creek/still/rescued ' + controlCreek + '/' + controlStill + '/' + controlRescued + '; variant ' + variantCreek + '/' + variantStill + '/' + variantRescued + '.');
  L.push('');
  L.push('## PRIMARY: fire rate (GO >= 0.80)');
  L.push('');
  L.push('- denominator mornings (actionable stranded + field + live known kcal): ' + denomMornings.length);
  L.push('- fired: ' + fired.length + ' — rate ' + (fireRate === null ? 'n/a' : fireRate.toFixed(3)) + ' — ' + (bars.fireRate ? 'GO' : 'NO-GO'));
  L.push('');
  L.push('## PRIMARY: banking ratio (GO >= 0.80, comparator coverage must be 100%)');
  L.push('');
  L.push('- variant pressE over denominator mornings with comparator: ' + sumVariantE);
  L.push('- same-base proven E over corresponding control mornings: ' + sumProvenE);
  L.push('- ratio: ' + (bankingRatio === null ? 'n/a' : bankingRatio.toFixed(3)) + ' — coverage ' + (coverage === null ? 'n/a' : coverage.toFixed(3)) + ' — ' + (bars.bankingRatio && bars.coverage100 ? 'GO' : 'NO-GO'));
  L.push('');
  L.push('## SECONDARY (reported, no bar): naive depletion table');
  L.push('');
  L.push('- control stranded field mornings: ' + controlStrandedField.length + ' (with comparator ' + naiveControlWithComp + '), proven total ' + naiveControlTotal + ' kcal');
  L.push('- variant total pressE (denominator mornings): ' + variantTotalE + ' kcal; off-target pressE: ' + offTargetAttemptsE + ' kcal');
  L.push('- naive ratio (variant denominator total / control total): ' + (naiveControlTotal ? (variantTotalE / naiveControlTotal).toFixed(3) : 'n/a') + ' — consecutive-east second mornings are SKIPs by depletion (patch harvested into dirt + day+2 regrow), not missed fires; see evidence file.');
  L.push('');
  L.push('## GUARDRAILS: regression bars (all must hold)');
  L.push('');
  L.push('- off-target fires: ' + offTargetFires + ' (bar 0) — ' + (bars.offTarget0 ? 'pass' : 'FAIL'));
  L.push('- recorder/variant errors control/variant: ' + controlErrs + '/' + variantErrs + ' (bar 0) — ' + (bars.errs0 ? 'pass' : 'FAIL'));
  L.push('- stalls (non-contiguous evening loopDays): ' + stalls.length + ' (bar 0) — ' + (bars.stalls0 ? 'pass' : 'FAIL'));
  L.push('- replay snap mismatches: ' + replayMismatch + ' (bar 0) — ' + (bars.replayMatch ? 'pass' : 'FAIL'));
  L.push('- regression fails (daysAlive loss > 10 or new death cause): ' + regressionFail.length + ' — ' + (bars.regression ? 'pass' : 'FAIL'));
  for (const p of pairs) L.push('  - seed ' + p.seed + ': daysAlive ' + p.daysAliveControl + ' -> ' + p.daysAliveVariant + ', end ' + p.endReasonControl + ' -> ' + p.endReasonVariant + ', waves ' + p.maxWaveControl + ' -> ' + p.maxWaveVariant + ', bearer deaths ' + JSON.stringify(p.bearerDeathsControl) + ' -> ' + JSON.stringify(p.bearerDeathsVariant) + ', all deaths n ' + p.deathsControl.length + ' -> ' + p.deathsVariant.length);
  L.push('');
  L.push('## VERDICT');
  L.push('');
  L.push(GO ? 'GO — all bars hold.' : 'NO-GO — at least one bar failed; see BARS above and the evidence file for the exact blocker.');
  L.push('');
  fs.mkdirSync(path.dirname(compareMd), { recursive: true });
  fs.writeFileSync(compareMd, L.join('\n'));
  console.log('wrote ' + compareMd);
}
