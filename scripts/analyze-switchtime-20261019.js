#!/usr/bin/env node
// analyze-switchtime-20261019.js — before/after comparison for the
// sim-switchtime arm (flesh-out loop, run fleshout-20261019T2115Z, axis
// scale-onramp).
//
// Corpora:
//   control = evidence/2026-10-19/perseed-seasonblock  (the pre-registered
//             control: the seasonblock sweep, 8 seeds x {leadfeast,belongfeast},
//             feastgap substrate, current master)
//   armed   = evidence/2026-10-19/perseed-switchtime-armed (SWITCHTIME=1)
//   (a fresh control, perseed-switchtime-control, is swept too — as a drift
//   check against the pre-registered corpus, and as the same-probe source
//   for the death-channel guardrails)
//
// PRIMARY (pre-registered): mean seasoned-link-days per run across the
// 16-run corpus (8 seeds x {leadfeast,belongfeast}) >= 1.25x the control
// corpus mean. Control corpus mean = 107.4 -> GO >= 134.2. The lever only
// engages on the belong road (leadfeast armed is byte-identical to
// control), so all movement must come from belongfeast; per-policy means
// are reported as supporting detail.
//
// GUARDRAILS (pre-registered): national >= control-1 (count), wave-4
// unlocks within +/-2 of control (count), starvation <= control+1 (armed vs
// fresh control, same probe), no new death mode (armed channel set ==
// control channel set), median survival not worse by >10d.
//
// Writes evidence/2026-10-19/switchtime-compare.json and prints the verdict.
'use strict';
const fs = require('fs');
const path = require('path');

const E = path.join(__dirname, '..', 'evidence', '2026-10-19');
const SEEDS = [64201, 64202, 64203, 64204, 64205, 64206, 64207, 64208];
const POLICIES = ['leadfeast', 'belongfeast'];
const GO_OVERALL = 134.2; // 1.25x the control corpus mean (107.4)

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
    succ: run.successions, switchGate: run.switchGate || null,
    deathChannels: run.deathChannels || null,
  };
}

function median(a) { const s = [...a].sort((x, y) => x - y); return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2; }
function mean(a) { return a.reduce((t, x) => t + x, 0) / a.length; }

function analyze() {
  const out = { primary: {}, guardrails: {}, perSeed: {} };
  for (const pol of POLICIES) {
    const ctrl = SEEDS.map(s => row(load('perseed-seasonblock', pol, s)));
    const armed = SEEDS.map(s => row(load('perseed-switchtime-armed', pol, s)));
    const fctrl = SEEDS.map(s => row(load('perseed-switchtime-control', pol, s)));
    if (ctrl.some(r => !r) || armed.some(r => !r)) {
      console.log(`MISSING FILES for ${pol} — sweep incomplete`); process.exit(2);
    }
    const cSD = ctrl.map(r => r.sd), aSD = armed.map(r => r.sd);
    out.primary[pol] = { controlMean: +mean(cSD).toFixed(1), armedMean: +mean(aSD).toFixed(1),
      ratio: +(mean(aSD) / (mean(cSD) || 1)).toFixed(2) };

    // Guardrails vs the pre-registered control (corpus) ...
    const cNat = ctrl.filter(r => r.national).length, aNat = armed.filter(r => r.national).length;
    const cW4 = ctrl.filter(r => r.maxWave >= 4).length, aW4 = armed.filter(r => r.maxWave >= 4).length;
    const cWins = ctrl.filter(r => r.won).length, aWins = armed.filter(r => r.won).length;
    const cMed = median(ctrl.map(r => r.gameDays)), aMed = median(armed.map(r => r.gameDays));
    // ... starvation / death modes vs the fresh same-probe control.
    const starv = (rows) => rows.reduce((t, r) => t + ((r.deathChannels || {}).haven || 0), 0);
    const chans = (rows) => { const s = new Set(); for (const r of rows) for (const k of Object.keys(r.deathChannels || {})) s.add(k); return s; };
    const fcRows = fctrl.filter(r => r && r.deathChannels);
    const starvOk = fcRows.length ? (starv(armed.filter(r => r.deathChannels)) <= starv(fcRows) + 1) : null;
    const newModes = fcRows.length
      ? [...chans(armed.filter(r => r.deathChannels))].filter(c => !chans(fcRows).has(c)) : null;
    const g = {
      national: { control: cNat, armed: aNat, ok: aNat >= cNat - 1 },
      wave4: { control: cW4, armed: aW4, ok: Math.abs(aW4 - cW4) <= 2 },
      wins: { control: cWins, armed: aWins },
      medianSurvival: { control: cMed, armed: aMed, ok: aMed >= cMed - 10 },
      starvation: { freshControl: fcRows.length ? starv(fcRows) : null, armed: starv(armed.filter(r => r.deathChannels)), ok: starvOk },
      newDeathModes: { modes: newModes, ok: newModes ? newModes.length === 0 : null },
    };
    g.allOk = g.national.ok && g.wave4.ok && g.medianSurvival.ok && g.starvation.ok !== false && g.newDeathModes.ok !== false;
    out.guardrails[pol] = g;
    out.perSeed[pol] = SEEDS.map((s, i) => ({ seed: s, controlSD: cSD[i], armedSD: aSD[i],
      controlNat: ctrl[i].national, armedNat: armed[i].national,
      controlWave: ctrl[i].maxWave, armedWave: armed[i].maxWave,
      armedGate: armed[i].switchGate }));
  }
  fs.writeFileSync(path.join(E, 'switchtime-compare.json'), JSON.stringify(out, null, 1));

  const allC = POLICIES.flatMap(pol => SEEDS.map((s, i) => out.perSeed[pol][i].controlSD));
  const allA = POLICIES.flatMap(pol => SEEDS.map((s, i) => out.perSeed[pol][i].armedSD));
  const goOverall = mean(allA) >= GO_OVERALL;
  out.primary.overall = { controlMean: +mean(allC).toFixed(1), armedMean: +mean(allA).toFixed(1),
    goThreshold: GO_OVERALL, GO: goOverall, ratio: +(mean(allA) / (mean(allC) || 1)).toFixed(2) };
  console.log('=== sim-switchtime: before/after (primary = mean seasoned-link-days per run, 16-run corpus) ===');
  console.log(`OVERALL: control ${out.primary.overall.controlMean} -> armed ${out.primary.overall.armedMean} (x${out.primary.overall.ratio}) | GO>=${GO_OVERALL}: ${goOverall ? 'GO' : 'NO-GO'}`);
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
  // Gate activity on the stall seeds (belongfeast).
  console.log('\ngate decisions on stall seeds (belongfeast armed):');
  for (const s of [64201, 64202, 64207]) {
    const r = out.perSeed.belongfeast.find(x => x.seed === s);
    console.log(`  s${s}: ${JSON.stringify(r.armedGate)}`);
  }
  console.log('\nwrote evidence/2026-10-19/switchtime-compare.json');
}

module.exports = { seasonedLinkDays, GO_OVERALL };
if (require.main === module) analyze();
