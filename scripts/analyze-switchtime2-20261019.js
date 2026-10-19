#!/usr/bin/env node
// analyze-switchtime2-20261019.js — before/after comparison for the
// sim-switchtime-2 arm (flesh-out loop, 2026-10-19, axis scale-onramp).
//
// Corpora:
//   control = evidence/2026-10-19/perseed-seasonblock (the pre-registered
//             control: the seasonblock sweep, 8 seeds x {leadfeast,belongfeast},
//             feastgap substrate, fidelity-gated reuse)
//   fresh   = evidence/2026-10-19/perseed-switchtime2-control (this probe,
//             SWITCHTIME2 unset — the fidelity gate's gate-off re-sweep and the
//             same-probe source for the death-channel guardrails)
//   armed   = evidence/2026-10-19/perseed-switchtime2-armed (SWITCHTIME2=1)
//
// PRIMARY (pre-registered, §14 binding): belongfeast-ONLY mean
// seasoned-link-days per run >= 1.2x the control belongfeast mean. The
// switchtime arm's 1.25x 16-run bar oversampled the inert leadfeast side
// (leadfeast armed is byte-identical to control by design — the gate never
// engages on the lead road); 8 belongfeast runs, honest. Control belongfeast
// mean (seasonblock corpus) = 28.3 -> GO >= 33.96 (recomputed here, not
// hardcoded, so a corpus change can't silently move the bar).
//
// GUARDRAILS (pre-registered): national >= control-1 (count); wave-4
// unlocks within +/-2 of control (count); starvation <= fresh-control+1;
// no new death mode (vs the same-probe fresh control); median survival not
// worse by >10d.
//
// Writes evidence/2026-10-19/switchtime2-compare.json and prints the verdict.
'use strict';
const fs = require('fs');
const path = require('path');

const E = path.join(__dirname, '..', 'evidence', '2026-10-19');
const SEEDS = [64201, 64202, 64203, 64204, 64205, 64206, 64207, 64208];
const POLICIES = ['leadfeast', 'belongfeast'];
const GO_RATIO = 1.2; // belongfeast-only 1.2x bar

function load(dir, policy, seed) {
  const p = path.join(E, dir, policy, `s${seed}.json`);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function seasonedLinkDays(run) {
  let sd = 0;
  for (const b of (run.bond || [])) for (const l of (b.links || [])) {
    if (l.seasoned && l.st === 'active') sd++;
  }
  return sd;
}

function row(run) {
  if (!run) return null;
  return {
    sd: seasonedLinkDays(run),
    gameDays: run.gameDays, end: run.endReason, won: !!run.won,
    national: !!run.national, table: !!run.table, maxWave: run.maxWave,
    succ: run.successions, switch2Gate: run.switch2Gate || null,
    deathChannels: run.deathChannels || null,
  };
}

function median(a) { const s = [...a].sort((x, y) => x - y); return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2; }
function mean(a) { return a.reduce((t, x) => t + x, 0) / a.length; }

function analyze() {
  const out = { primary: {}, guardrails: {}, perSeed: {} };
  for (const pol of POLICIES) {
    const ctrl = SEEDS.map(s => row(load('perseed-seasonblock', pol, s)));
    const armed = SEEDS.map(s => row(load('perseed-switchtime2-armed', pol, s)));
    const fresh = SEEDS.map(s => row(load('perseed-switchtime2-control', pol, s)));
    if (ctrl.some(r => !r) || armed.some(r => !r)) {
      console.log(`MISSING FILES for ${pol} — sweep incomplete`); process.exit(2);
    }
    const cSD = ctrl.map(r => r.sd), aSD = armed.map(r => r.sd);
    // Keep full-precision means for the primary threshold (display is 1dp).
    const rawC = mean(cSD), rawA = mean(aSD);
    out.primary[pol] = { controlMean: +rawC.toFixed(1), armedMean: +rawA.toFixed(1),
      ratio: +(rawA / (rawC || 1)).toFixed(2), _rawControl: rawC, _rawArmed: rawA };

    const cNat = ctrl.filter(r => r.national).length, aNat = armed.filter(r => r.national).length;
    const cW4 = ctrl.filter(r => r.maxWave >= 4).length, aW4 = armed.filter(r => r.maxWave >= 4).length;
    const cWins = ctrl.filter(r => r.won).length, aWins = armed.filter(r => r.won).length;
    const cMed = median(ctrl.map(r => r.gameDays)), aMed = median(armed.map(r => r.gameDays));
    // ... starvation / death modes vs the same-probe gate-off fresh control.
    const starv = (rows) => rows.reduce((t, r) => t + ((r.deathChannels || {}).haven || 0), 0);
    const chans = (rows) => { const s = new Set(); for (const r of rows) for (const k of Object.keys(r.deathChannels || {})) s.add(k); return s; };
    const fRows = fresh.filter(r => r && r.deathChannels);
    const starvOk = fRows.length ? (starv(armed.filter(r => r.deathChannels)) <= starv(fRows) + 1) : null;
    const newModes = fRows.length
      ? [...chans(armed.filter(r => r.deathChannels))].filter(c => !chans(fRows).has(c)) : null;
    const g = {
      national: { control: cNat, armed: aNat, ok: aNat >= cNat - 1 },
      wave4: { control: cW4, armed: aW4, ok: Math.abs(aW4 - cW4) <= 2 },
      wins: { control: cWins, armed: aWins },
      medianSurvival: { control: cMed, armed: aMed, ok: aMed >= cMed - 10 },
      starvation: { freshControl: fRows.length ? starv(fRows) : null, armed: starv(armed.filter(r => r.deathChannels)), ok: starvOk },
      newDeathModes: { modes: newModes, ok: newModes ? newModes.length === 0 : null },
    };
    g.allOk = g.national.ok && g.wave4.ok && g.medianSurvival.ok && g.starvation.ok !== false && g.newDeathModes.ok !== false;
    out.guardrails[pol] = g;
    out.perSeed[pol] = SEEDS.map((s, i) => ({ seed: s, controlSD: cSD[i], armedSD: aSD[i],
      controlNat: ctrl[i].national, armedNat: armed[i].national,
      controlWave: ctrl[i].maxWave, armedWave: armed[i].maxWave,
      armedGate: armed[i].switch2Gate }));
  }
  fs.writeFileSync(path.join(E, 'switchtime2-compare.json'), JSON.stringify(out, null, 1));

  // PRIMARY: belongfeast only. Threshold from the FULL-precision corpus mean
  // (exact-cent rounding: 28.25 x 1.2 = 33.90).
  const bp = out.primary.belongfeast;
  const goThreshold = Math.round(bp._rawControl * GO_RATIO * 100) / 100;
  const goVerdict = bp._rawArmed >= goThreshold;
  out.primary.belongfeast.goThreshold = goThreshold;
  out.primary.belongfeast.GO = goVerdict;
  fs.writeFileSync(path.join(E, 'switchtime2-compare.json'), JSON.stringify(out, null, 1));

  console.log('=== sim-switchtime-2: before/after (primary = belongfeast-only mean seasoned-link-days per run) ===');
  console.log(`PRIMARY belongfeast: control ${bp.controlMean} -> armed ${bp.armedMean} (x${bp.ratio}) | GO>=${goThreshold} (1.2x): ${goVerdict ? 'GO' : 'NO-GO'}`);
  for (const pol of POLICIES) {
    const p = out.primary[pol];
    console.log(`${pol}: control mean ${p.controlMean} -> armed mean ${p.armedMean} (x${p.ratio})`);
    const g = out.guardrails[pol];
    console.log(`  guardrails: national ${g.national.armed} vs ${g.national.control} (ok=${g.national.ok}) | ` +
      `wave4 ${g.wave4.armed} vs ${g.wave4.control} (ok=${g.wave4.ok}) | ` +
      `wins ${g.wins.armed}/${g.wins.control} | medianSurv ${g.medianSurvival.armed} vs ${g.medianSurvival.control} (ok=${g.medianSurvival.ok}) | ` +
      `starvation armed=${g.starvation.armed} freshCtrl=${g.starvation.freshControl} (ok=${g.starvation.ok}) | ` +
      `newDeathModes=${JSON.stringify(g.newDeathModes.modes)} (ok=${g.newDeathModes.ok}) | ALL=${g.allOk}`);
  }
  console.log('\nper-seed seasoned-link-days (control -> armed):');
  for (const pol of POLICIES) {
    console.log(`  ${pol}: ` + out.perSeed[pol].map(r => `s${r.seed}:${r.controlSD}->${r.armedSD}`).join(' '));
  }
  // Gate activity on the stall seeds (belongfeast armed).
  console.log('\ngate decisions on stall seeds (belongfeast armed):');
  for (const s of [64201, 64202, 64207]) {
    const r = out.perSeed.belongfeast.find(x => x.seed === s);
    console.log(`  s${s}: ${JSON.stringify(r.armedGate)}`);
  }
  console.log('\nwrote evidence/2026-10-19/switchtime2-compare.json');
}

module.exports = { seasonedLinkDays, GO_RATIO };
if (require.main === module) analyze();
