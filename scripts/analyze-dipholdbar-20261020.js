#!/usr/bin/env node
// analyze-dipholdbar-20261020.js — sim-dipholdbar pilot analysis, SECOND VARIANT
// (flesh-out loop A, run fleshout-20261020T0015Z): the bill-current bar.
//
// PRIMARY (pre-registered): dip-days-held per seasoned belong bond =
//   the count of dip=1 days from the bond's first seasoned day
//   (age >= 30 && trust >= 40, the probe's `seasoned` flag) until the first
//   dip-0 day for that bond (a broken/vanished bond counts as dip-0 from the
//   break day), capped at run end.
//   GO: armed mean >= 1.3x control mean over seasoned belong bonds.
// Guardrails (pre-registered): national >= control-2, wave-4 >= control-2,
// no new death channel, median survival >= control-10d.
// Mechanism: current-held days = bond-days with dip=1 && arrears>0 (the dip
// only survives arrears under the new bar), billCurrentArrearsDays from the
// probe's daily _billCurrent read, tribute totals.
// Bond fate: bond-death vs village-death recorded as SEPARATE outcomes per
// bond (the recourt named next): 'bond-broke' | 'village-died' |
// 'survived-with-bond' | 'censored'.
// Control AND armed are fresh paired sweeps on identical seeds (the
// seasonblock corpus failed FIDELITY on current master — engine drifted
// since 8c055140a — so no corpus reuse).
// Writes dipholdbar-corpus-summary.json next to the evidence.
//
// Usage: node scripts/analyze-dipholdbar-20261020.js [--out evidence/2026-10-20/dipholdbar-corpus-summary.json]
'use strict';
const fs = require('fs');
const path = require('path');

const REPO = path.join(__dirname, '..');
const EVID = path.join(REPO, 'evidence', '2026-10-20', 'perseed-dipholdbar');
const SEEDS = [64201, 64202, 64203, 64204, 64205, 64206, 64207, 64208];
const POLICIES = ['leadfeast', 'belongfeast'];
const OUT = process.argv.includes('--out') ? process.argv[process.argv.indexOf('--out') + 1]
  : path.join(REPO, 'evidence', '2026-10-20', 'dipholdbar-corpus-summary.json');

function load(side, policy) {
  const rows = [];
  for (const seed of SEEDS) {
    const fp = path.join(EVID, side, policy, `s${seed}.json`);
    if (!fs.existsSync(fp)) throw new Error('missing sweep file: ' + fp);
    rows.push({ seed, r: JSON.parse(fs.readFileSync(fp, 'utf8')) });
  }
  return rows;
}

// Per-belong-bond dip-days-held from the bond census. A bond is keyed by its
// primary (a re-court to a new primary is a new bond); the probe's dip flag
// is the seasoned&&regionalPlus grant that day.
function bondStats(r) {
  const byPrim = new Map();
  for (const bc of (r.bond || [])) {
    for (const l of (bc.links || [])) {
      if (l.sub !== 'haven' || l.st !== 'active') continue;
      if (!byPrim.has(l.prim)) byPrim.set(l.prim, { prim: l.prim, days: [] });
      byPrim.get(l.prim).days.push({ d: bc.d, age: l.age, trust: l.trust, arrears: l.arrears, seasoned: !!l.seasoned, dip: l.dip | 0, fires: l.fires });
    }
  }
  const gameDays = r.gameDays | 0;
  const endReason = r.endReason || '?';
  const out = [];
  for (const b of byPrim.values()) {
    b.days.sort((a, c) => a.d - c.d);
    const sIdx = b.days.findIndex(x => x.seasoned);
    if (sIdx < 0) { out.push({ prim: b.prim, seasoned: false }); continue; }
    const seasonDay = b.days[sIdx].d;
    let held = 0, currentHeld = 0, firstZero = null, arrearsDay = null;
    const endTrust = b.days[b.days.length - 1].trust;
    const lastActiveDay = b.days[b.days.length - 1].d;
    for (let i = sIdx; i < b.days.length; i++) {
      const x = b.days[i];
      if (x.arrears > 0 && arrearsDay == null) arrearsDay = x.d;
      if (x.dip === 1) { held++; if (x.arrears > 0) currentHeld++; }
      else { firstZero = x.d; break; }
    }
    // Bond fate, separate from village fate: did the BOND die, or did the
    // VILLAGE die with the bond alive? (the recourt named next)
    let fate;
    if (lastActiveDay < gameDays - 2) fate = 'bond-broke';
    else if (/village-lost|village-dead|pop-zero/.test(endReason)) fate = 'village-died';
    else if (endReason === 'survived') fate = 'survived-with-bond';
    else fate = 'censored';
    out.push({ prim: b.prim, seasoned: true, seasonDay, dipDaysHeld: held, currentHeldDays: currentHeld,
      firstDipZero: firstZero, arrearsDay, endTrust, lastActiveDay, fate });
  }
  return out;
}

function starvationDeaths(r) {
  return ((r.deaths || []).filter(d => /starvation|thirst/i.test(d.cause || '')).length);
}
function deathChannels(r) {
  const s = new Set();
  for (const d of (r.deaths || [])) s.add(d.channel || '?');
  return [...s].sort();
}

function summarize(rows, label) {
  const bonds = [];
  let national = 0, table = 0, wave4 = 0, wave5 = 0, tribPaid = 0, currentHeld = 0, billCurArr = 0, starv = 0;
  const surv = [], channels = new Set();
  const perSeed = [];
  const fates = { 'bond-broke': 0, 'village-died': 0, 'survived-with-bond': 0, 'censored': 0 };
  for (const { seed, r } of rows) {
    if (r.national) national++;
    if (r.table) table++;
    if (r.wave45) wave4++;
    if (r.wave5) wave5++;
    surv.push(r.gameDays | 0);
    starv += starvationDeaths(r);
    for (const ch of deathChannels(r)) channels.add(ch);
    billCurArr += r.billCurrentArrearsDays | 0;
    const bs = bondStats(r);
    const seasoned = bs.filter(b => b.seasoned);
    for (const b of seasoned) {
      bonds.push({ seed, ...b });
      currentHeld += b.currentHeldDays | 0;
      if (fates[b.fate] != null) fates[b.fate]++;
    }
    if (r.flowAgg) tribPaid += r.flowAgg.tributePaid | 0;
    perSeed.push({ seed, gameDays: r.gameDays, endReason: r.endReason, national: r.national, wave: r.maxWave,
      successions: r.successions,
      bonds: bs.map(b => b.seasoned ? `${b.prim}:held${b.dipDaysHeld}/${b.fate}` : `${b.prim}:unseasoned`).join(' | ') || 'none' });
  }
  surv.sort((a, b) => a - b);
  const median = surv.length % 2 ? surv[surv.length >> 1] : (surv[surv.length / 2 - 1] + surv[surv.length / 2]) / 2;
  const held = bonds.map(b => b.dipDaysHeld);
  const mean = held.length ? held.reduce((a, b) => a + b, 0) / held.length : 0;
  return {
    label, n: rows.length, national, table, wave4, wave5,
    medianSurvival: median, maxSurvival: Math.max(...surv),
    starvation: starv, deathChannels: [...channels].sort(),
    seasonedBonds: bonds.length, meanDipDaysHeld: +mean.toFixed(2),
    dipDaysHeld: held, bonds, bondFates: fates,
    currentHeldDays: currentHeld, billCurrentArrearsDays: billCurArr, tribPaid,
    perSeed,
  };
}

const controlBelong = summarize(load('control', 'belongfeast'), 'control/belongfeast');
const armedBelong = summarize(load('armed', 'belongfeast'), 'armed/belongfeast');
const controlLead = summarize(load('control', 'leadfeast'), 'control/leadfeast');
const armedLead = summarize(load('armed', 'leadfeast'), 'armed/leadfeast');

const goRatio = controlBelong.meanDipDaysHeld > 0
  ? armedBelong.meanDipDaysHeld / controlBelong.meanDipDaysHeld
  : (armedBelong.meanDipDaysHeld > 0 ? Infinity : 1);
const guardrails = {
  national: { armed: armedBelong.national + armedLead.national, control: controlBelong.national + controlLead.national,
    pass: (armedBelong.national + armedLead.national) >= (controlBelong.national + controlLead.national) - 2 },
  wave4: { armed: armedBelong.wave4 + armedLead.wave4, control: controlBelong.wave4 + controlLead.wave4,
    pass: (armedBelong.wave4 + armedLead.wave4) >= (controlBelong.wave4 + controlLead.wave4) - 2 },
  newDeathChannel: { armed: [...new Set([...armedBelong.deathChannels, ...armedLead.deathChannels])].sort(),
    control: [...new Set([...controlBelong.deathChannels, ...controlLead.deathChannels])].sort(),
    pass: [...new Set([...armedBelong.deathChannels, ...armedLead.deathChannels])]
      .every(c => [...new Set([...controlBelong.deathChannels, ...controlLead.deathChannels])].includes(c)) },
  medianSurvival: { armed: [armedBelong.medianSurvival, armedLead.medianSurvival],
    control: [controlBelong.medianSurvival, controlLead.medianSurvival],
    pass: armedBelong.medianSurvival >= controlBelong.medianSurvival - 10 &&
           armedLead.medianSurvival >= controlLead.medianSurvival - 10 },
};
const primary = {
  metric: 'mean dip-days-held per seasoned belong bond',
  control: controlBelong.meanDipDaysHeld, armed: armedBelong.meanDipDaysHeld,
  controlN: controlBelong.seasonedBonds, armedN: armedBelong.seasonedBonds,
  ratio: goRatio === Infinity ? 'inf' : +goRatio.toFixed(3),
  goThreshold: '>= 1.3x control mean',
  go: controlBelong.meanDipDaysHeld > 0 ? goRatio >= 1.3 : false,
};
const allPass = Object.values(guardrails).every(g => g.pass);
const verdict = { primary, guardrails, allGuardrailsPass: allPass, verdict: (primary.go && allPass) ? 'GO' : 'NO-GO' };

const summary = {
  generated: new Date().toISOString(),
  variant: 'bill-current-7d (trailing-7d tribute paid >= 1x weekly bill; legacy arrears may stand)',
  controlProvenance: 'fresh paired sweep on pristine hierarchy.js (seasonblock corpus failed FIDELITY on current master — engine drifted since 8c055140a)',
  controlBelong, armedBelong, controlLead, armedLead, verdict,
};
fs.writeFileSync(OUT, JSON.stringify(summary, null, 2));

console.log('=== sim-dipholdbar (bill-current variant) pilot: fresh paired control vs armed ===');
console.log(`PRIMARY dip-days-held: control ${controlBelong.meanDipDaysHeld} (n=${controlBelong.seasonedBonds}) | armed ${armedBelong.meanDipDaysHeld} (n=${armedBelong.seasonedBonds}) | ratio ${verdict.primary.ratio} (GO bar 1.3x) -> ${primary.go ? 'GO' : 'NO-GO'}`);
console.log(`bond fates control: ${JSON.stringify(controlBelong.bondFates)} | armed: ${JSON.stringify(armedBelong.bondFates)}`);
console.log(`guardrails: national ${guardrails.national.armed} vs ${guardrails.national.control} ${guardrails.national.pass ? 'ok' : 'MISS'}; wave4 ${guardrails.wave4.armed} vs ${guardrails.wave4.control} ${guardrails.wave4.pass ? 'ok' : 'MISS'}; new death channel ${guardrails.newDeathChannel.pass ? 'none' : 'FOUND: ' + guardrails.newDeathChannel.armed.filter(c => !guardrails.newDeathChannel.control.includes(c)).join(',')}; median survival belong ${armedBelong.medianSurvival} vs ${controlBelong.medianSurvival}, lead ${armedLead.medianSurvival} vs ${controlLead.medianSurvival} ${guardrails.medianSurvival.pass ? 'ok' : 'MISS'}`);
console.log(`mechanism: currentHeldDays control=${controlBelong.currentHeldDays} armed=${armedBelong.currentHeldDays} | billCurrentArrearsDays control=${controlBelong.billCurrentArrearsDays} armed=${armedBelong.billCurrentArrearsDays} | tributePaid control=${controlBelong.tribPaid} armed=${armedBelong.tribPaid}`);
console.log(`VERDICT: ${verdict.verdict}`);
console.log('--- per-seed armed belongfeast ---');
for (const s of armedBelong.perSeed) console.log(`  s${s.seed}: ${s.gameDays}d ${s.endReason} nat=${s.national} w${s.wave} succ=${s.successions} | ${s.bonds}`);
console.log('wrote', OUT);
