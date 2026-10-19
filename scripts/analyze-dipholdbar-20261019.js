#!/usr/bin/env node
// analyze-dipholdbar-20261019.js — sim-diphold-bar pilot analysis (flesh-out loop A, 2026-10-19).
//
// PRIMARY (pre-registered): dip-days-held per seasoned belong bond =
//   the count of dip=1 days from the bond's first seasoned day
//   (age >= 30 && trust >= 40, the probe's `seasoned` flag) until the first
//   dip-0 day for that bond (a broken/vanished bond counts as dip-0 from the
//   break day), capped at run end.
//   GO: armed mean >= 1.3x control mean over seasoned belong bonds.
// Guardrails (pre-registered): national >= control-1, wave-4 unlocks within
// +/-2 of control, starvation deaths <= control+1, no new death channel,
// median survival not worse by >10d.
// Mechanism: grace-held days = bond-days with dip=1 && arrears>0 (the dip
// only survives arrears under the new bar), plus tribute totals.
// Control: the committed seasonblock corpus (fidelity-gated). Armed: the
// dipholdbar sweep (same composition, modified engine).
// Writes dipholdbar-corpus-summary.json next to the evidence.
//
// Usage: node scripts/analyze-dipholdbar-20261019.js [--out evidence/2026-10-19/dipholdbar-corpus-summary.json]
'use strict';
const fs = require('fs');
const path = require('path');

const REPO = path.join(__dirname, '..');
const CONTROL_DIR = path.join(REPO, 'evidence', '2026-10-19', 'perseed-seasonblock', 'belongfeast');
const ARMED_DIR = path.join(REPO, 'evidence', '2026-10-19', 'perseed-dipholdbar', 'belongfeast');
// DEATH-CONTROL PROVENANCE (documented, not a re-score): the seasonblock
// corpus has NO per-seed death lists (its probe predates the death-list
// instrument), so the starvation/new-death-channel guardrails cannot be read
// from it. The diphold arm's control corpus (perseed-diphold/belongfeast) is
// the same unmodified engine + same substrate + same seeds, WITH death lists
// (their FIDELITY gate pinned it byte-identical to the seasonblock corpus).
// Death guardrails read from there; everything else reads the seasonblock
// corpus per the pre-registration.
const DEATH_CONTROL_DIR = path.join(REPO, 'evidence', '2026-10-19', 'perseed-diphold', 'belongfeast');
const SEEDS = [64201, 64202, 64203, 64204, 64205, 64206, 64207, 64208];
const OUT = process.argv.includes('--out') ? process.argv[process.argv.indexOf('--out') + 1]
  : path.join(REPO, 'evidence', '2026-10-19', 'dipholdbar-corpus-summary.json');

function load(dir) {
  const rows = [];
  for (const seed of SEEDS) {
    const fp = path.join(dir, `s${seed}.json`);
    if (!fs.existsSync(fp)) throw new Error('missing sweep file: ' + fp);
    rows.push({ seed, r: JSON.parse(fs.readFileSync(fp, 'utf8')) });
  }
  return rows;
}

// Per-belong-bond dip-days-held from the bond census. A bond is keyed by its
// primary (a re-court to a new primary is a new bond); the probe's dip flag
// is the seasoned&&regionalPlus grant that day.
function bondStats(r) {
  const byPrim = new Map(); // prim -> {seasonDay, dipDays: [{d, dip}], ...}
  for (const bc of (r.bond || [])) {
    for (const l of (bc.links || [])) {
      if (l.sub !== 'haven' || l.st !== 'active') continue;
      if (!byPrim.has(l.prim)) byPrim.set(l.prim, { prim: l.prim, days: [] });
      byPrim.get(l.prim).days.push({ d: bc.d, age: l.age, trust: l.trust, arrears: l.arrears, seasoned: !!l.seasoned, dip: l.dip | 0, fires: l.fires });
    }
  }
  const out = [];
  for (const b of byPrim.values()) {
    b.days.sort((a, c) => a.d - c.d);
    const sIdx = b.days.findIndex(x => x.seasoned);
    if (sIdx < 0) { out.push({ prim: b.prim, seasoned: false }); continue; }
    const seasonDay = b.days[sIdx].d;
    let held = 0, graceHeld = 0, firstZero = null, arrearsDay = null, endTrust = b.days[b.days.length - 1].trust;
    for (let i = sIdx; i < b.days.length; i++) {
      const x = b.days[i];
      if (x.arrears > 0 && arrearsDay == null) arrearsDay = x.d;
      if (x.dip === 1) { held++; if (x.arrears > 0) graceHeld++; }
      else { firstZero = x.d; break; }
    }
    out.push({ prim: b.prim, seasoned: true, seasonDay, dipDaysHeld: held, graceHeldDays: graceHeld, firstDipZero: firstZero, arrearsDay, endTrust, lastDay: b.days[b.days.length - 1].d });
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
  let national = 0, table = 0, wave4 = 0, wave5 = 0, tribPaid = 0, graceHeld = 0;
  const surv = [];
  const perSeed = [];
  for (const { seed, r } of rows) {
    if (r.national) national++;
    if (r.table) table++;
    if (r.wave45) wave4++;
    if (r.wave5) wave5++;
    surv.push(r.gameDays | 0);
    const bs = bondStats(r);
    const seasoned = bs.filter(b => b.seasoned);
    for (const b of seasoned) { bonds.push({ seed, ...b }); graceHeld += b.graceHeldDays | 0; }
    if (r.flowAgg) tribPaid += r.flowAgg.tributePaid | 0;
    perSeed.push({ seed, gameDays: r.gameDays, endReason: r.endReason, national: r.national, wave: r.maxWave, successions: r.successions, bonds: bs.map(b => b.seasoned ? `${b.prim}:held${b.dipDaysHeld}` : `${b.prim}:unseasoned`).join(' | ') || 'none' });
  }
  surv.sort((a, b) => a - b);
  const median = surv.length % 2 ? surv[surv.length >> 1] : (surv[surv.length / 2 - 1] + surv[surv.length / 2]) / 2;
  const held = bonds.map(b => b.dipDaysHeld);
  const mean = held.length ? held.reduce((a, b) => a + b, 0) / held.length : 0;
  return {
    label, n: rows.length, national, table, wave4, wave5,
    medianSurvival: median, maxSurvival: Math.max(...surv),
    seasonedBonds: bonds.length, meanDipDaysHeld: +mean.toFixed(2),
    dipDaysHeld: held, bonds,
    graceHeldDays: graceHeld, tribPaid,
    perSeed,
  };
}

// Death-list guardrails read from corpora that HAVE death lists (see
// DEATH_CONTROL_DIR provenance above).
function deathStats(rows, label) {
  let starv = 0;
  const channels = new Set();
  for (const { r } of rows) {
    starv += starvationDeaths(r);
    for (const ch of deathChannels(r)) channels.add(ch);
  }
  return { label, starvation: starv, channels: [...channels].sort() };
}

const control = summarize(load(CONTROL_DIR), 'control');
const armed = summarize(load(ARMED_DIR), 'armed');
const deathControl = deathStats(load(DEATH_CONTROL_DIR), 'death-control (perseed-diphold/belongfeast)');
const deathArmed = deathStats(load(ARMED_DIR), 'armed');

const goRatio = control.meanDipDaysHeld > 0 ? armed.meanDipDaysHeld / control.meanDipDaysHeld : (armed.meanDipDaysHeld > 0 ? Infinity : 1);
const guardrails = {
  national: { armed: armed.national, control: control.national, pass: armed.national >= control.national - 1 },
  wave4: { armed: armed.wave4, control: control.wave4, pass: Math.abs(armed.wave4 - control.wave4) <= 2 },
  starvation: { armed: deathArmed.starvation, control: deathControl.starvation, controlProvenance: deathControl.label, pass: deathArmed.starvation <= deathControl.starvation + 1 },
  newDeathChannel: { armed: deathArmed.channels, control: deathControl.channels, controlProvenance: deathControl.label, pass: deathArmed.channels.every(c => deathControl.channels.includes(c)) },
  medianSurvival: { armed: armed.medianSurvival, control: control.medianSurvival, pass: armed.medianSurvival >= control.medianSurvival - 10 },
};
const primary = {
  metric: 'mean dip-days-held per seasoned belong bond',
  control: control.meanDipDaysHeld, armed: armed.meanDipDaysHeld,
  controlN: control.seasonedBonds, armedN: armed.seasonedBonds,
  ratio: goRatio === Infinity ? 'inf' : +goRatio.toFixed(3),
  goThreshold: '>= 1.3x control mean',
  go: control.meanDipDaysHeld > 0 ? goRatio >= 1.3 : false,
};
const verdict = {
  primary, guardrails,
  allGuardrailsPass: Object.values(guardrails).every(g => g.pass),
  verdict: (primary.go && Object.values(guardrails).every(g => g.pass)) ? 'GO' : 'NO-GO',
};

const summary = {
  generated: new Date().toISOString(),
  controlProvenance: {
    primary: 'evidence/2026-10-19/perseed-seasonblock/belongfeast (fidelity-gated, byte-identical)',
    deathGuardrails: 'evidence/2026-10-19/perseed-diphold/belongfeast (unmodified engine, same substrate+seeds; the seasonblock corpus has no per-seed death lists)',
  },
  control, armed, deathControl, deathArmed, verdict,
};
fs.writeFileSync(OUT, JSON.stringify(summary, null, 2));

console.log('=== sim-diphold-bar pilot: control (seasonblock corpus) vs armed (engine bar) ===');
console.log(`PRIMARY dip-days-held: control ${control.meanDipDaysHeld} (n=${control.seasonedBonds}) | armed ${armed.meanDipDaysHeld} (n=${armed.seasonedBonds}) | ratio ${verdict.primary.ratio} (GO bar 1.3x) -> ${primary.go ? 'GO' : 'NO-GO'}`);
console.log(`guardrails: national ${armed.national} vs ${control.national} ${guardrails.national.pass ? 'ok' : 'MISS'}; wave4 ${armed.wave4} vs ${control.wave4} ${guardrails.wave4.pass ? 'ok' : 'MISS'}; starvation ${deathArmed.starvation} vs ${deathControl.starvation} (death-control corpus) ${guardrails.starvation.pass ? 'ok' : 'MISS'}; new death channel ${guardrails.newDeathChannel.pass ? 'none' : 'FOUND'}; median survival ${armed.medianSurvival} vs ${control.medianSurvival} ${guardrails.medianSurvival.pass ? 'ok' : 'MISS'}`);
console.log(`mechanism: graceHeldDays control=${control.graceHeldDays} armed=${armed.graceHeldDays} | tributePaid control=${control.tribPaid} armed=${armed.tribPaid}`);
console.log(`VERDICT: ${verdict.verdict}`);
console.log('--- per-seed armed ---');
for (const s of armed.perSeed) console.log(`  s${s.seed}: ${s.gameDays}d ${s.endReason} nat=${s.national} w${s.wave} succ=${s.successions} | ${s.bonds}`);
console.log('wrote', OUT);
