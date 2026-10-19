#!/usr/bin/env node
// analyze-raidwall-20261019.js — arm-shift comparison for sim-raidwall.
//
// Reads evidence/2026-10-19/perseed-raidwall/{control,armed}/{leadfeast,belongfeast}/s*.json
// Reuses attribute() from analyze-windowsurvive-20261019.js (identical
// window definitions — the w5census endRec-boundary fix carried over).
//
// PRIMARY (pre-registered): raid-channel deaths per run, armed vs control.
// GO: >=30% fewer raid-channel deaths on the armed arm.
// GUARDRAILS: wave-4 unlocks within ±2/16 of control; median survival no
// worse than -10d; no new death mode (a new cause counts at >=2 events —
// the winsupport-decomp metric-review revision, applying to this next run);
// starvation deaths <= control+1.
//
// Writes evidence/2026-10-19/raidwall-corpus-summary.json and prints the
// verdict table (the panel is the instrument via build-raidwall-panels.js;
// this header's threshold is the judge).
'use strict';
const fs = require('fs');
const path = require('path');
const { attribute } = require('./analyze-windowsurvive-20261019');

const EVID = path.join(__dirname, '..', 'evidence', '2026-10-19', 'perseed-raidwall');
const OUT = path.join(__dirname, '..', 'evidence', '2026-10-19', 'raidwall-corpus-summary.json');
const ARMS = ['control', 'armed'];
const POLICIES = ['leadfeast', 'belongfeast'];

function loadValid() {
  const recs = [];
  const bad = [];
  for (const arm of ARMS) {
    for (const policyId of POLICIES) {
      const dir = path.join(EVID, arm, policyId);
      if (!fs.existsSync(dir)) { bad.push(`${arm}/${policyId}/: MISSING DIR`); continue; }
      for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort()) {
        const p = path.join(dir, f);
        const stat = fs.statSync(p);
        if (stat.size === 0) { bad.push(`${arm}/${policyId}/${f}: 0 BYTES`); continue; }
        let rec;
        try { rec = JSON.parse(fs.readFileSync(p, 'utf8')); }
        catch (e) { bad.push(`${arm}/${policyId}/${f}: UNPARSEABLE (${e.message})`); continue; }
        if (!rec || !Array.isArray(rec.recs) || !rec.deathsAttributed) {
          bad.push(`${arm}/${policyId}/${f}: INCOMPLETE`); continue;
        }
        if (rec.winarm !== arm) { bad.push(`${arm}/${policyId}/${f}: ARM TAG MISMATCH (winarm=${rec.winarm})`); continue; }
        if ((rec.instrumentErrors | 0) !== 0) bad.push(`${arm}/${policyId}/${f}: NOTE instrumentErrors=${rec.instrumentErrors}`);
        recs.push(rec);
      }
    }
  }
  return { recs, bad };
}

function raidDeaths(rec) {
  // All attributed deaths with channel 'raid' (the primary metric surface).
  const ds = ((rec.deathsAttributed || {}).attributed || []);
  return ds.filter(d => d.channel === 'raid');
}

function median(xs) {
  const s = xs.slice().sort((a, b) => a - b);
  if (!s.length) return 0;
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

function summarize(armRecs) {
  const n = armRecs.length;
  const raidPerRun = armRecs.map(r => raidDeaths(r).length);
  const raidTotal = raidPerRun.reduce((a, b) => a + b, 0);
  const surv = armRecs.map(r => r.gameDays || 0);
  const causeSpace = {};
  const starvation = armRecs.map(r =>
    (((r.deathsAttributed || {}).attributed) || []).filter(d => /starvation/i.test(d.cause || '')).length
  ).reduce((a, b) => a + b, 0);
  for (const r of armRecs) {
    for (const d of ((r.deathsAttributed || {}).attributed || [])) {
      const k = String(d.cause || 'unknown');
      causeSpace[k] = (causeSpace[k] || 0) + 1;
    }
  }
  // Mechanism split: raid deaths by rule (scholar-fight-at-haven vs aid-crisis).
  const raidByRule = {};
  const aidCrisisAtHaven = { atHaven: 0, inField: 0 };
  for (const r of armRecs) {
    for (const d of raidDeaths(r)) {
      raidByRule[d.rule] = (raidByRule[d.rule] || 0) + 1;
      if (d.rule === 'ctx:aid-crisis') {
        if (d.ctx && d.ctx.atHaven) aidCrisisAtHaven.atHaven++;
        else aidCrisisAtHaven.inField++;
      }
    }
  }
  // Doctrine attribution (armed arm): the rwLedger.
  let doctrine = null;
  if (armRecs.length && armRecs[0].winarm === 'armed') {
    doctrine = { holdDays: 0, travelRefusals: 0, shelters: 0, releases: 0, runsEngaged: 0 };
    for (const r of armRecs) {
      const L = r.rwLedger;
      if (!L) continue;
      if ((L.holdDays | 0) > 0) doctrine.runsEngaged++;
      doctrine.holdDays += (L.holdDays | 0);
      doctrine.travelRefusals += (L.travelRefusals | 0);
      doctrine.shelters += (L.shelters || []).length;
      doctrine.releases += (L.releases || []).length;
    }
  }
  return {
    n,
    raidTotal, raidPerRun, raidMean: n ? raidTotal / n : 0,
    raidByRule, aidCrisisAtHaven,
    national: armRecs.filter(r => r.national).length,
    table: armRecs.filter(r => r.table).length,
    wins: armRecs.filter(r => r.won).length,
    wave4: armRecs.filter(r => r.wave45).length,
    wave5: armRecs.filter(r => r.wave5).length,
    exiled: armRecs.filter(r => r.exiled).length,
    medianSurvival: median(surv), surv,
    starvation,
    causeSpace,
    doctrine,
    unattributed: armRecs.map(r => (r.deathsAttributed.unattributedCount | 0) || 0).reduce((a, b) => a + b, 0),
  };
}

function main() {
  const { recs, bad } = loadValid();
  const byArm = {};
  for (const arm of ARMS) byArm[arm] = recs.filter(r => r.winarm === arm);
  const sum = {};
  for (const arm of ARMS) sum[arm] = summarize(byArm[arm]);

  const c = sum.control, a = sum.armed;
  const raidDelta = c.raidTotal === 0 ? null : (c.raidTotal - a.raidTotal) / c.raidTotal;
  const primaryGo = raidDelta != null && raidDelta >= 0.30;

  // Guardrails.
  const gWave4 = Math.abs(a.wave4 - c.wave4) <= 2;
  const gSurv = a.medianSurvival >= c.medianSurvival - 10;
  const newCauses = Object.keys(a.causeSpace).filter(k => !c.causeSpace[k] && (a.causeSpace[k] | 0) >= 2);
  const gNewMode = newCauses.length === 0;
  const gStarv = a.starvation <= c.starvation + 1;
  const guardrailsHold = gWave4 && gSurv && gNewMode && gStarv;

  const verdict = !primaryGo ? 'NO-GO (primary miss)'
    : !guardrailsHold ? 'NO-GO (guardrail breach)' : 'GO';

  const out = {
    generated: new Date().toISOString(),
    bad,
    arms: sum,
    primary: { controlRaid: c.raidTotal, armedRaid: a.raidTotal, delta: raidDelta, go: primaryGo, threshold: 0.30 },
    guardrails: {
      wave4: { control: c.wave4, armed: a.wave4, pass: gWave4, band: '±2' },
      medianSurvival: { control: c.medianSurvival, armed: a.medianSurvival, pass: gSurv, floor: 'control-10d' },
      newDeathModes: { pass: gNewMode, newCauses },
      starvation: { control: c.starvation, armed: a.starvation, pass: gStarv, band: 'control+1' },
      allHold: guardrailsHold,
    },
    verdict,
  };
  fs.writeFileSync(OUT, JSON.stringify(out, null, 1));

  console.log('=== sim-raidwall pilot: arm shift (control -> armed) ===');
  console.log(`runs: control ${c.n}, armed ${a.n}; bad files: ${bad.length}`);
  console.log(`PRIMARY raid-channel deaths: control ${c.raidTotal} (${c.raidMean.toFixed(2)}/run) -> armed ${a.raidTotal} (${a.raidMean.toFixed(2)}/run)`);
  console.log(`  delta: ${raidDelta == null ? 'n/a' : (raidDelta * 100).toFixed(1) + '%'} (GO >= 30%): ${primaryGo ? 'GO' : 'NO-GO'}`);
  console.log('raid by rule (control):', JSON.stringify(c.raidByRule));
  console.log('raid by rule (armed):  ', JSON.stringify(a.raidByRule));
  console.log('aid-crisis split control (atHaven/inField):', JSON.stringify(c.aidCrisisAtHaven));
  console.log('aid-crisis split armed   (atHaven/inField):', JSON.stringify(a.aidCrisisAtHaven));
  console.log(`wall: national ${c.national}->${a.national} | table ${c.table}->${a.table} | wins ${c.wins}->${a.wins} | wave4 ${c.wave4}->${a.wave4} | wave5 ${c.wave5}->${a.wave5} | exiled ${c.exiled}->${a.exiled}`);
  console.log(`median survival: ${c.medianSurvival}d -> ${a.medianSurvival}d (guardrail >= ${c.medianSurvival - 10}d): ${gSurv ? 'PASS' : 'FAIL'}`);
  console.log(`starvation deaths: ${c.starvation} -> ${a.starvation} (guardrail <= ${c.starvation + 1}): ${gStarv ? 'PASS' : 'FAIL'}`);
  console.log(`new death modes (>=2 events): ${newCauses.length ? newCauses.join(', ') : 'none'}: ${gNewMode ? 'PASS' : 'FAIL'}`);
  console.log('doctrine (armed):', JSON.stringify(a.doctrine));
  console.log(`unattributed: control ${c.unattributed}, armed ${a.unattributed}`);
  console.log('VERDICT: ' + verdict);
  if (bad.length) { console.log('BAD FILES:'); for (const b of bad) console.log('  ' + b); }
}

if (require.main === module) main();
module.exports = { loadValid, summarize };
