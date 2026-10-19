#!/usr/bin/env node
// scripts/analyze-wirewatch-b.js — pilot adjudication for sim-wirewatch-b.
// Reads the per-seed JSONs (both arms), prints the before/after table,
// the GO/NO-GO adjudication per the pre-registered header, guardrails,
// mechanism attribution, and wall numbers. TOOLING ONLY.
'use strict';
const fs = require('fs');
const path = require('path');

const PERSEED = path.join(__dirname, '..', 'evidence', '2026-10-19', 'perseed-wirewatch-b');
const SEEDS = [41711, 41713, 41714, 41715, 41716, 41718, 41719, 41720];
const POLICIES = ['leadfeast', 'belongfeast'];

function load(arm) {
  const rows = [];
  for (const p of POLICIES) for (const s of SEEDS) {
    const f = path.join(PERSEED, arm, `${p}-s${s}.json`);
    if (!fs.existsSync(f)) return null;
    rows.push(JSON.parse(fs.readFileSync(f, 'utf8')));
  }
  return rows;
}

const med = (vs) => { vs = vs.slice().sort((a, b) => a - b); return vs.length ? vs[Math.floor(vs.length / 2)] : null; };

function summarize(rows) {
  const learns = rows.filter(r => r.snareLearnDay != null);
  const wit = rows.filter(r => r.witnessRate != null).map(r => r.witnessRate);
  const causes = {};
  for (const r of rows) for (const [k, v] of Object.entries(r.deathCauses || {})) causes[k] = (causes[k] || 0) + v;
  return {
    n: rows.length,
    learnRate: learns.length,
    learnDays: learns.map(r => r.snareLearnDay),
    medianLearnDay: med(learns.map(r => r.snareLearnDay)),
    vias: learns.reduce((o, r) => { o[r.snareLearnVia] = (o[r.snareLearnVia] || 0) + 1; return o; }, {}),
    witnessMean: wit.length ? +(wit.reduce((a, b) => a + b, 0) / wit.length).toFixed(3) : null,
    awayReturns: rows.reduce((t, r) => t + (r.awayReturns || 0), 0),
    npcTrap: rows.reduce((t, r) => t + ((r.tele || {}).npc_trap || 0), 0),
    comeHomes: rows.reduce((t, r) => t + (r.driveComeHomes || 0), 0),
    medianSurv: med(rows.map(r => r.days)),
    maxSurv: Math.max.apply(null, rows.map(r => r.days).concat([0])),
    starv: rows.reduce((t, r) => t + (r.starvationDeaths || 0), 0),
    causes,
    national: rows.filter(r => (r.nationalHeldDays || 0) > 0).length,
    table: rows.filter(r => r.tableEntered).length,
    wins: rows.filter(r => r.won).length,
    waveMax: Math.max.apply(null, rows.map(r => r.unlockedWave || 1).concat([1])),
    wave4: rows.filter(r => (r.unlockedWave || 1) >= 4).length,
    wave5: rows.filter(r => (r.unlockedWave || 1) >= 5).length,
  };
}

// mechanism attribution: an armed learn is attributed iff via='taught',
// the layer held >=1 come-home night in the 7d before the learn, and the
// same-seed control run had the scholar away for >=1 npc_trap return in
// those 7d.
function attribute(armed, control) {
  const out = [];
  for (const a of armed) {
    if (a.snareLearnDay == null || a.snareLearnVia !== 'taught') continue;
    const holdDays = (a.driveComeHomeDays || []).filter(d => d <= a.snareLearnDay && d > a.snareLearnDay - 7);
    if (!holdDays.length) continue;
    const c = control.find(r => r.policy === a.policy && r.seed === a.seed);
    if (!c) continue;
    const cAway = (c.awayReturnDays || []).filter(d => d <= a.snareLearnDay && d > a.snareLearnDay - 7);
    out.push({ policy: a.policy, seed: a.seed, learnDay: a.snareLearnDay, holdDays, controlAwayDays: cAway, attributed: cAway.length > 0 });
  }
  return out;
}

function main() {
  const base = load('wirewatch-baseline');
  const armed = load('wirewatch-armed');
  if (!base || !armed) { console.error('ANALYZE STOP: per-seed JSONs incomplete'); process.exit(2); }
  const B = summarize(base), A = summarize(armed);
  console.log('=== PILOT (16 runs/side: 8 seeds x {leadfeast,belongfeast}, 180d) ===');
  console.log(`learn rate:      baseline ${B.learnRate}/16  armed ${A.learnRate}/16`);
  console.log(`median learn day: baseline ${B.medianLearnDay}  armed ${A.medianLearnDay}`);
  console.log(`learn vias:       baseline ${JSON.stringify(B.vias)}  armed ${JSON.stringify(A.vias)}`);
  console.log(`witness rate:     baseline ${B.witnessMean}  armed ${A.witnessMean} (away returns ${B.awayReturns} -> ${A.awayReturns} / ${B.npcTrap} -> ${A.npcTrap})`);
  console.log(`drive come-homes: armed ${A.comeHomes} nights`);
  console.log(`median survival:  baseline ${B.medianSurv}d  armed ${A.medianSurv}d (max ${B.maxSurv}/${A.maxSurv})`);
  console.log(`starvation:       baseline ${B.starv}  armed ${A.starv}`);
  console.log(`wall: national ${B.national}->${A.national} table ${B.table}->${A.table} wins ${B.wins}->${A.wins} wave4 ${B.wave4}->${A.wave4} wave5 ${B.wave5}->${A.wave5} (max ${B.waveMax}/${A.waveMax})`);
  const attr = attribute(armed, base);
  const attrYes = attr.filter(x => x.attributed);
  console.log(`\nmechanism attribution: ${attr.length} armed 'taught' learns on held nights; ${attrYes.length} with control-side away evidence`);
  for (const x of attr) console.log(`  ${x.policy} s${x.seed} d${x.learnDay} holdDays=[${x.holdDays}] controlAway=[${x.controlAwayDays}] -> ${x.attributed ? 'ATTRIBUTED' : 'not (control witnessed too)'}`);
  // guardrails
  const newModes = Object.keys(A.causes).filter(k => !(k in B.causes));
  const newModes2 = newModes.filter(k => {
    // >=2 armed runs with this cause = investigation item (>=2-event rule)
    let runs = 0;
    for (const r of armed) if ((r.deathCauses || {})[k]) runs++;
    return runs >= 2;
  });
  console.log(`\nnew death modes (>=2 armed runs, absent from control): ${newModes2.length ? newModes2.join(', ') : 'none'}`);
  // GO adjudication
  const goRate = (A.learnRate - B.learnRate) >= 2 && A.learnRate >= 5 && attrYes.length >= 2;
  console.log(`\nGO (rate +2 [${A.learnRate}-${B.learnRate}=${A.learnRate - B.learnRate}], armed>=5/16 [${A.learnRate}], >=2 attributed [${attrYes.length}]): ${goRate ? 'GO' : 'NO-GO'}`);
  const gSurv = A.medianSurv >= B.medianSurv - 10;
  const gStarv = A.starv <= B.starv + 1;
  console.log(`guardrails: survival ${gSurv ? 'PASS' : 'MISS'} (${A.medianSurv} vs ${B.medianSurv}-10=${B.medianSurv - 10}), starvation ${gStarv ? 'PASS' : 'MISS'} (${A.starv} vs ${B.starv}+1), new-mode ${newModes2.length ? 'INVESTIGATE' : 'PASS'}`);
  // paired starvation (per run)
  let pairedFails = 0;
  for (const a of armed) {
    const c = base.find(r => r.policy === a.policy && r.seed === a.seed);
    if (c && a.starvationDeaths > c.starvationDeaths + 1) { pairedFails++; console.log(`  paired-starv FAIL: ${a.policy} s${a.seed} armed ${a.starvationDeaths} vs control ${c.starvationDeaths}`); }
  }
  if (!pairedFails) console.log('  paired starvation: all pairs within +1');
}
main();
