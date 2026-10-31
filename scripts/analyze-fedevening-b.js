// analyze-fedevening-b.js — pure reads over fedevening corpora.
// Compares control (trace driver) vs variant vs OFF (fedevening driver)
// legs on identical seeds for ONE woodwarm leg (guard or ON), and judges
// the prereg's census bars (strand counts, runs, det-gate, guardrails,
// and the JOINT causal-link clause: a rescued evening inside the control
// still range, wooded (4 logs), preceded by a still evening whose
// fedevening record shows branchesAfter >= 2 with no log spent that
// night — i.e., the substitution demonstrably blocked the log fire).
// Also checks pre-first-still-evening identity on 15215 (mornings 1-7
// fully identical on shared fields; evening inner records 1-7 identical;
// the day-7 evening divergence must equal exactly the recorded gather/
// fire costs) and the instrument rule (no fedevening fire ever spends
// a log).
// Usage: node scripts/analyze-fedevening-b.js <guard|on> <controlDir>
//   <variantDir> <offDir> <outJson>
'use strict';
const fs = require('fs');
const path = require('path');

function strandOf(d) {
  const creek = [], still = [], rescued = [];
  const runs = [];
  let run = [];
  const flush = () => { if (run.length) runs.push(run); run = []; };
  for (const e of (d.evenings || [])) {
    const wc = e.woodcarry || {};
    if (wc.bucket !== 'creek') { flush(); continue; }
    creek.push(e.loopDay);
    if (wc.rescued) { rescued.push(e.loopDay); flush(); }
    else { still.push(e.loopDay); run.push(e.loopDay); }
  }
  flush();
  return { creek, still, rescued, runs };
}
function ticksShortCount(d) {
  let n = 0;
  for (const e of (d.evenings || [])) {
    const b = (e.woodcarry && e.woodcarry.bridge) || {};
    if (b.skip === 'ticks-short') n++;
  }
  return n;
}
function starvationCount(deaths) {
  let n = 0;
  for (const de of (deaths || [])) {
    try { if (JSON.stringify(de).toLowerCase().includes('starv')) n++; } catch (e) {}
  }
  return n;
}
function deathCauses(deaths) {
  const out = new Set();
  for (const de of (deaths || [])) {
    if (de && typeof de === 'object') {
      for (const k of ['cause', 'kind', 'reason', 'how']) if (de[k]) out.add(String(de[k]));
    } else if (typeof de === 'string') out.add(de);
  }
  return [...out].sort();
}
function successionDays(d) {
  const out = [];
  let prev = (d.spawn && d.spawn.pos) ? d.spawn.pos.vesselId : null;
  for (const m of (d.mornings || [])) {
    const v = m.vesselId;
    if (v !== undefined && v !== null && prev !== null && prev !== undefined && v !== prev) out.push(m.loopDay);
    if (v !== undefined && v !== null) prev = v;
  }
  return out;
}
function analyzeSeed(filePath) {
  const d = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const s = strandOf(d);
  const byDay = {};
  for (const e of (d.evenings || [])) {
    byDay[e.loopDay] = {
      loopDay: e.loopDay, bucket: (e.woodcarry || {}).bucket || null,
      rescued: !!((e.woodcarry || {}).rescued),
      wood: (e.woodcarry && e.woodcarry.classification) ? e.woodcarry.classification.woodPlayer : null,
      fe: e.fedevening || null, warmth: e.warmth || null,
    };
  }
  const feNights = [];
  let firesLit = 0, firesAttempted = 0, gathersTotal = 0, woodFuelSpends = 0;
  for (const e of (d.evenings || [])) {
    const fe = e.fedevening || null;
    if (!fe || !fe.acted) continue;
    const w = e.warmth || {};
    feNights.push({
      loopDay: e.loopDay, gathers: (fe.gathers || []).length,
      branchesBefore: fe.branchesBefore, branchesAfter: fe.branchesAfter,
      walkStop: fe.walkStop || null,
      fireAttempted: !!(fe.fire && fe.fire.attempted),
      fireLit: !!(fe.fire && fe.fire.fireLit),
      fireSkip: (fe.fire && !fe.fire.attempted) ? fe.fire.skip : null,
      fireFuelKind: (fe.fire && fe.fire.fuelKind) || null,
      warmthActed: !!w.acted, warmthMiss: w.miss || null, warmthLogSpent: (w.logSpent === undefined ? null : w.logSpent),
      woodAfter: fe.woodAfter,
    });
    gathersTotal += (fe.gathers || []).length;
    if (fe.fire && fe.fire.attempted) firesAttempted++;
    if (fe.fire && fe.fire.fireLit) firesLit++;
    if (fe.fire && fe.fire.fuelKind === 'wood') woodFuelSpends++;
  }
  const evenings = (d.evenings || []).map((e) => ({
    loopDay: e.loopDay, bucket: (e.woodcarry || {}).bucket || null,
    rescued: !!((e.woodcarry || {}).rescued),
    wood: (e.woodcarry && e.woodcarry.classification) ? e.woodcarry.classification.woodPlayer : null,
    kcal: e.kcal || null, dayTicks: e.dayTicks,
    ticksShort: ((e.woodcarry && e.woodcarry.bridge) || {}).skip === 'ticks-short',
    fe: e.fedevening || null, warmth: e.warmth || null,
  }));
  return {
    seed: d.seed, arm: d.arm || null, errs: d.errCount,
    daysAlive: d.daysAlive, endReason: d.endReason, maxWaveUnlocked: d.maxWaveUnlocked,
    waveKills: d.waveKills, deaths: d.deaths || [],
    creek: s.creek, still: s.still, rescued: s.rescued, runs: s.runs,
    ticksShort: ticksShortCount(d), starvation: starvationCount(d.deaths || []),
    causes: deathCauses(d.deaths || []),
    succession: successionDays(d),
    feNights, firesLit, firesAttempted, gathersTotal, woodFuelSpends,
    evenings, byDay,
  };
}
// Linked rescue (JOINT gate): D in the control still range, variant
// evening D rescued with wood 4, and some still evening E < D on the
// same leg with fedevening branchesAfter >= 2 and no log spent that
// night (guard: no warmth spend is possible, branches alone link).
function linkedRescues(controlStill, variant, leg) {
  const out = [];
  for (const D of variant.rescued) {
    if (!controlStill.includes(D)) continue;
    const evD = variant.byDay[D];
    const woodD = evD ? evD.wood : null;
    if (woodD !== 4) continue;
    let link = null;
    for (const E of variant.still) {
      if (E >= D) continue;
      const evE = variant.byDay[E];
      const fe = evE && evE.fe;
      if (!fe || !(fe.branchesAfter >= 2)) continue;
      if (leg === 'guard') { link = { day: D, linkEvening: E, branchesAfter: fe.branchesAfter }; break; }
      const w = evE.warmth || {};
      const noSpend = (w.logSpent === 0 || w.logSpent === null) &&
        (w.miss === 'branches-available' || w.miss === 'fire-near' || w.acted === false);
      if (noSpend) { link = { day: D, linkEvening: E, branchesAfter: fe.branchesAfter, warmthMiss: w.miss || null }; break; }
    }
    if (link) out.push(link);
  }
  return out;
}
// Pre-first-still-evening identity on 15215 (see prereg clause (d) and
// the evidence file's operational reading): mornings 1-7 identical on
// shared fields; evening inner records (woodcarry + outcome) 1-7
// identical; the day-7 evening row divergence must equal exactly the
// recorded fedevening action costs.
function preStrandIdentity(control, variant) {
  const sharedMorning = ['loopDay', 'inside', 'insideTent', 'mx', 'my', 'tile', 'mapPx', 'mapPy', 'kcal', 'dayTicks', 'vesselId', 'morningWood'];
  const mC = {}, mV = {};
  for (const m of (control.mornings || [])) mC[m.loopDay] = m;
  for (const m of (variant.mornings || [])) mV[m.loopDay] = m;
  const morningDiffs = [];
  for (let ld = 1; ld <= 7; ld++) {
    const a = mC[ld], b = mV[ld];
    if (!a || !b) { morningDiffs.push({ loopDay: ld, missing: true }); continue; }
    for (const k of sharedMorning) {
      if (JSON.stringify(a[k]) !== JSON.stringify(b[k])) morningDiffs.push({ loopDay: ld, field: k, control: a[k], variant: b[k] });
    }
  }
  const eC = {}, eV = {};
  for (const e of (control.evenings || [])) eC[e.loopDay] = e;
  for (const e of (variant.evenings || [])) eV[e.loopDay] = e;
  const innerDiffs = [];
  for (let ld = 1; ld <= 7; ld++) {
    const a = eC[ld], b = eV[ld];
    if (!a || !b) { innerDiffs.push({ loopDay: ld, missing: true }); continue; }
    if (JSON.stringify(a.woodcarry) !== JSON.stringify(b.woodcarry)) innerDiffs.push({ loopDay: ld, field: 'woodcarry' });
    if (a.eveningOutcome !== b.eveningOutcome) innerDiffs.push({ loopDay: ld, field: 'eveningOutcome', control: a.eveningOutcome, variant: b.eveningOutcome });
    if (!!a.travelledHome !== !!b.travelledHome) innerDiffs.push({ loopDay: ld, field: 'travelledHome' });
  }
  // Day-7 divergence accounting: variant minus control must equal the
  // fedevening record's action costs on evening 7.
  let day7Accounting = null;
  const fe7 = (eV[7] && eV[7].fedevening) || null;
  if (fe7 && eC[7] && eV[7]) {
    const expKcal = (fe7.kcalAfter === null || fe7.kcalAfter === undefined || fe7.kcalBefore === null || fe7.kcalBefore === undefined)
      ? null : (fe7.kcalAfter - fe7.kcalBefore);
    const expTicks = (fe7.ticksAfter === null || fe7.ticksAfter === undefined || fe7.ticksBefore === null || fe7.ticksBefore === undefined)
      ? null : (fe7.ticksBefore - fe7.ticksAfter);
    day7Accounting = {
      kcalDelta: (eV[7].kcal || 0) - (eC[7].kcal || 0), kcalExpected: expKcal,
      ticksDelta: (eV[7].dayTicks || 0) - (eC[7].dayTicks || 0), ticksExpected: expTicks,
      kcalMatch: expKcal !== null && ((eV[7].kcal || 0) - (eC[7].kcal || 0)) === expKcal,
      ticksMatch: expTicks !== null && ((eV[7].dayTicks || 0) - (eC[7].dayTicks || 0)) === expTicks,
    };
  }
  return { morningDiffs, innerDiffs, day7Accounting };
}

function median(xs) {
  const s = [...xs].sort((a, b) => a - b);
  if (!s.length) return null;
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
}

function main() {
  const leg = process.argv[2];
  const controlDir = process.argv[3];
  const variantDir = process.argv[4];
  const offDir = process.argv[5];
  const out = process.argv[6] || null;
  if (!leg || !controlDir || !variantDir || !offDir) {
    console.error('usage: analyze-fedevening-b.js <guard|on> <controlDir> <variantDir> <offDir> <outJson>');
    process.exit(2);
  }
  const load = (dir) => {
    const o = {};
    for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.json')).sort()) {
      const a = analyzeSeed(path.join(dir, f));
      o[a.seed] = a;
    }
    return o;
  };
  const control = load(controlDir);
  const variant = load(variantDir);
  const off = load(offDir);
  const seeds = Object.keys(control).map(Number).sort((a, b) => a - b);
  const perSeed = {};
  let detMatch = true;
  const detMismatches = [];
  for (const seed of seeds) {
    const c = control[seed], v = variant[seed], o = off[seed];
    if (!v || !o) { console.error('MISSING leg for seed ' + seed); process.exit(2); }
    const detOk = JSON.stringify([o.creek, o.still, o.rescued]) === JSON.stringify([c.creek, c.still, c.rescued]);
    if (!detOk) { detMatch = false; detMismatches.push(seed); }
    const vWith = Object.assign({}, v, { byDay: v.byDay });
    const links = linkedRescues(c.still, vWith, leg);
    perSeed[seed] = { control: c, variant: v, off: o, detOk, linkedRescues: links };
  }
  // Pre-strand identity on 15215 (variant vs control full corpora).
  let preStrand = null;
  try {
    const cFull = JSON.parse(fs.readFileSync(path.join(controlDir, fs.readdirSync(controlDir).filter((x) => x.includes('15215'))[0]), 'utf8'));
    const vFull = JSON.parse(fs.readFileSync(path.join(variantDir, fs.readdirSync(variantDir).filter((x) => x.includes('15215'))[0]), 'utf8'));
    preStrand = preStrandIdentity(cFull, vFull);
  } catch (e) { preStrand = { error: String(e && e.message).slice(0, 200) }; }
  const ctrlDays = seeds.map((s) => perSeed[s].control.daysAlive);
  const varDays = seeds.map((s) => perSeed[s].variant.daysAlive);
  const ctrlStarv = seeds.reduce((a, s) => a + perSeed[s].control.starvation, 0);
  const varStarv = seeds.reduce((a, s) => a + perSeed[s].variant.starvation, 0);
  const result = {
    leg, seeds, perSeed, detMatch, detMismatches, preStrand,
    medianControl: median(ctrlDays), medianVariant: median(varDays),
    starvationControl: ctrlStarv, starvationVariant: varStarv,
  };
  if (out) fs.writeFileSync(out, JSON.stringify(result, null, 2));
  for (const seed of seeds) {
    const { control: c, variant: v, off: o, detOk, linkedRescues: links } = perSeed[seed];
    console.log('seed ' + seed + ' det=' + detOk);
    console.log('  control still=' + JSON.stringify(c.still) + ' runs=' + JSON.stringify(c.runs) + ' days=' + c.daysAlive + ' ticksShort=' + c.ticksShort + ' maxWave=' + c.maxWaveUnlocked + ' starv=' + c.starvation + ' succession=' + JSON.stringify(c.succession));
    console.log('  variant still=' + JSON.stringify(v.still) + ' runs=' + JSON.stringify(v.runs) + ' days=' + v.daysAlive + ' ticksShort=' + v.ticksShort + ' maxWave=' + v.maxWaveUnlocked + ' starv=' + v.starvation + ' succession=' + JSON.stringify(v.succession));
    console.log('  variant feNights=' + JSON.stringify(v.feNights) + ' firesLit=' + v.firesLit + ' firesAttempted=' + v.firesAttempted + ' gathers=' + v.gathersTotal + ' woodFuelSpends=' + v.woodFuelSpends);
    console.log('  variant linkedRescues=' + JSON.stringify(links) + ' rescued=' + JSON.stringify(v.rescued));
    console.log('  causes control=' + JSON.stringify(c.causes) + ' variant=' + JSON.stringify(v.causes));
  }
  console.log('det-gate match=' + detMatch + ' mismatches=' + JSON.stringify(detMismatches));
  console.log('median control=' + result.medianControl + ' variant=' + result.medianVariant);
  console.log('starvation control=' + ctrlStarv + ' variant=' + varStarv);
  console.log('preStrand=' + JSON.stringify(preStrand));
}

if (require.main === module) main();
module.exports = { strandOf, ticksShortCount, starvationCount, deathCauses, successionDays, analyzeSeed, linkedRescues, preStrandIdentity, median };
