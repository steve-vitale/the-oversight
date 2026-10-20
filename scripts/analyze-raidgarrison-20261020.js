#!/usr/bin/env node
// analyze-raidgarrison-20261020.js — arm-shift comparison for sim-raidgarrison.
//
// Reads evidence/2026-10-20/perseed-raidgarrison/{control,armed}/{leadfeast,belongfeast}/s*.json
// Reuses attribute()/attemptsOf() from analyze-windowsurvive-20261019.js
// (identical window definitions — the w5census endRec-boundary fix carried
// over), and the death-channel classifier from the probe (identical by
// construction with sim-vetwindow/sim-raidwall).
//
// PRIMARY (pre-registered, binding §14): WINDOW RAID-DEATH SHARE —
// raid-channel deaths inside def5 'died' windows / all deaths inside def5
// 'died' windows, pooled per arm, armed vs control on IDENTICAL seeds,
// paired deltas per (policy, seed).
// GO: armed share <= 0.5 x control share.
// GUARDRAILS: starvation deaths <= control+2; median survival >=
// control-10d; wave-4 readiness-bar fill not worse than control (terminal
// short-bar mean armed <= control mean).
// SECONDARY (report): scholar vs villager window-raid deaths; wall
// numbers; garrison engagement (garrisonDays, musterDays, travelRefusals,
// defense/trade calls refused, beats).
//
// Writes evidence/2026-10-20/raidgarrison-corpus-summary.json and prints
// the verdict table (the balanced panel is the instrument via
// build-raidgarrison-panels.js; this header's threshold is the judge).
'use strict';
const fs = require('fs');
const path = require('path');
const { attribute } = require('./analyze-windowsurvive-20261019');

const EVID = path.join(__dirname, '..', 'evidence', '2026-10-20', 'perseed-raidgarrison');
const OUT = path.join(__dirname, '..', 'evidence', '2026-10-20', 'raidgarrison-corpus-summary.json');
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

function median(xs) {
  const s = xs.slice().sort((a, b) => a - b);
  if (!s.length) return 0;
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

// Window attribution per run: raid-channel deaths inside def5 'died'
// windows, and all deaths inside those windows.
function windowStats(rec) {
  const att = attribute(rec);
  const wd = att.windowDeaths || [];
  const raid = wd.filter(d => d.channel === 'raid');
  const scholarRaid = raid.filter(d => d.player);
  const villagerRaid = raid.filter(d => !d.player);
  const starv = wd.filter(d => /starvation/i.test(d.cause || ''));
  return {
    seed: rec.seed, policyId: rec.policyId,
    def5ever: att.def5ever, firstDef5Day: att.firstDef5Day,
    windowDeaths: wd.length, windowRaid: raid.length,
    windowScholarRaid: scholarRaid.length, windowVillagerRaid: villagerRaid.length,
    windowStarvation: starv.length,
    shortBars: ((att.r5term || {}).short || []).length,
    rdy: !!((att.r5term || {}).rdy),
    rule: {},
  };
}

function summarize(armRecs) {
  const n = armRecs.length;
  const ws = armRecs.map(windowStats);
  const windowDeaths = ws.reduce((t, w) => t + w.windowDeaths, 0);
  const windowRaid = ws.reduce((t, w) => t + w.windowRaid, 0);
  const share = windowDeaths ? windowRaid / windowDeaths : null;
  const surv = armRecs.map(r => r.gameDays || 0);
  const starvation = ws.reduce((t, w) => t + w.windowStarvation, 0);
  const shortMean = n ? ws.reduce((t, w) => t + w.shortBars, 0) / n : 0;
  const rdyCount = ws.filter(w => w.rdy).length;
  const causeSpace = {};
  for (const w of ws) {
    const rec = armRecs.find(r => r.seed === w.seed && r.policyId === w.policyId);
    for (const d of ((rec.deathsAttributed || {}).attributed || [])) {
      const k = String(d.cause || 'unknown');
      causeSpace[k] = (causeSpace[k] || 0) + 1;
    }
  }
  // Doctrine engagement (armed arm): the ctx ledger.
  let doctrine = null;
  if (armRecs.length && armRecs[0].winarm === 'armed') {
    doctrine = { garrisonDays: 0, musterDays: 0, travelRefusals: 0, defenseCallsSeen: 0, defenseCallsRefused: 0, tradeCallsSeen: 0, tradeCallsRefused: 0, beats: 0, runsEngaged: 0 };
    for (const r of armRecs) {
      const L = r.rgLedger;
      if (!L) continue;
      if (((L.garrisonDays | 0) > 0) || ((L.travelRefusals | 0) > 0) || ((L.defenseCallsRefused | 0) > 0)) doctrine.runsEngaged++;
      doctrine.garrisonDays += (L.garrisonDays | 0);
      doctrine.musterDays += (L.musterDays | 0);
      doctrine.travelRefusals += (L.travelRefusals | 0);
      doctrine.defenseCallsSeen += (L.defenseCallsSeen | 0);
      doctrine.defenseCallsRefused += (L.defenseCallsRefused | 0);
      doctrine.tradeCallsSeen += (L.tradeCallsSeen | 0);
      doctrine.tradeCallsRefused += (L.tradeCallsRefused | 0);
      doctrine.beats += (L.beats | 0);
    }
  }
  return {
    n, ws,
    windowDeaths, windowRaid, share,
    windowScholarRaid: ws.reduce((t, w) => t + w.windowScholarRaid, 0),
    windowVillagerRaid: ws.reduce((t, w) => t + w.windowVillagerRaid, 0),
    national: armRecs.filter(r => r.national).length,
    table: armRecs.filter(r => r.table).length,
    wins: armRecs.filter(r => r.won).length,
    wave4: armRecs.filter(r => r.wave45).length,
    wave5: armRecs.filter(r => r.wave5).length,
    exiled: armRecs.filter(r => r.exiled).length,
    medianSurvival: median(surv), surv,
    starvation, shortMean, rdyCount,
    causeSpace, doctrine,
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
  const primaryGo = c.share != null && a.share != null && a.share <= 0.5 * c.share;
  const shareRatio = (c.share != null && c.share > 0 && a.share != null) ? a.share / c.share : null;
  // Paired deltas: per (policy, seed) pair, armed minus control window-raid share.
  const pairedDeltas = [];
  for (const w of a.ws) {
    const cw = c.ws.find(x => x.policyId === w.policyId && x.seed === w.seed);
    const aShare = w.windowDeaths ? w.windowRaid / w.windowDeaths : null;
    const cShare = cw && cw.windowDeaths ? cw.windowRaid / cw.windowDeaths : null;
    pairedDeltas.push({
      policy: w.policyId, seed: w.seed,
      aShare: aShare == null ? null : +aShare.toFixed(3),
      cShare: cShare == null ? null : +cShare.toFixed(3),
      aRaid: w.windowRaid, cRaid: cw ? cw.windowRaid : null,
      aDeaths: w.windowDeaths, cDeaths: cw ? cw.windowDeaths : null,
    });
  }

  // Guardrails.
  const gStarv = a.starvation <= c.starvation + 2;
  const gSurv = a.medianSurvival >= c.medianSurvival - 10;
  const gRdy = a.shortMean <= c.shortMean + 0.5;
  const newCauses = Object.keys(a.causeSpace).filter(k => !c.causeSpace[k] && (a.causeSpace[k] | 0) >= 2);
  const gNewMode = newCauses.length === 0;
  const guardrailsHold = gStarv && gSurv && gRdy && gNewMode;

  const verdict = !primaryGo ? 'NO-GO (primary miss)'
    : !guardrailsHold ? 'NO-GO (guardrail breach)' : 'GO';

  const out = {
    generated: new Date().toISOString(),
    bad,
    arms: { control: Object.assign({}, sum.control, { ws: undefined }), armed: Object.assign({}, sum.armed, { ws: undefined }) },
    perRun: { control: c.ws, armed: a.ws },
    primary: {
      control: { windowRaid: c.windowRaid, windowDeaths: c.windowDeaths, share: c.share },
      armed: { windowRaid: a.windowRaid, windowDeaths: a.windowDeaths, share: a.share },
      shareRatio, go: primaryGo, threshold: 'armed <= 0.5x control',
      pairedDeltas,
      scholarContext: { control: c.windowScholarRaid, armed: a.windowScholarRaid },
      villagerContext: { control: c.windowVillagerRaid, armed: a.windowVillagerRaid },
    },
    guardrails: {
      starvation: { control: c.starvation, armed: a.starvation, pass: gStarv, band: 'control+2' },
      medianSurvival: { control: c.medianSurvival, armed: a.medianSurvival, pass: gSurv, floor: 'control-10d' },
      readinessFill: { controlShortMean: +c.shortMean.toFixed(2), armedShortMean: +a.shortMean.toFixed(2), rdyControl: c.rdyCount, rdyArmed: a.rdyCount, pass: gRdy, band: 'armed mean shorts <= control+0.5' },
      newDeathModes: { pass: gNewMode, newCauses },
      allHold: guardrailsHold,
    },
    verdict,
  };
  fs.writeFileSync(OUT, JSON.stringify(out, null, 1));

  const pc = s => s == null ? 'n/a' : (s * 100).toFixed(1) + '%';
  console.log('=== sim-raidgarrison pilot: window raid-death share (control -> armed) ===');
  console.log(`runs: control ${c.n}, armed ${a.n}; bad files: ${bad.length}`);
  console.log(`PRIMARY window raid-death share: control ${c.windowRaid}/${c.windowDeaths} = ${pc(c.share)} -> armed ${a.windowRaid}/${a.windowDeaths} = ${pc(a.share)}`);
  console.log(`  ratio armed/control: ${shareRatio == null ? 'n/a' : shareRatio.toFixed(2) + 'x'} (GO <= 0.50x): ${primaryGo ? 'GO' : 'NO-GO'}`);
  console.log('  paired per-run:', JSON.stringify(pairedDeltas.map(d => `${d.policy[0]}${d.seed}:${d.cRaid}/${d.cDeaths}->${d.aRaid}/${d.aDeaths}`)));
  console.log(`context window scholar raid deaths: ${c.windowScholarRaid} -> ${a.windowScholarRaid}; villager: ${c.windowVillagerRaid} -> ${a.windowVillagerRaid}`);
  console.log(`wall: national ${c.national}->${a.national} | table ${c.table}->${a.table} | wins ${c.wins}->${a.wins} | wave4 ${c.wave4}->${a.wave4} | wave5 ${c.wave5}->${a.wave5} | exiled ${c.exiled}->${a.exiled}`);
  console.log(`median survival: ${c.medianSurvival}d -> ${a.medianSurvival}d (guardrail >= ${c.medianSurvival - 10}d): ${gSurv ? 'PASS' : 'FAIL'}`);
  console.log(`window starvation deaths: ${c.starvation} -> ${a.starvation} (guardrail <= ${c.starvation + 2}): ${gStarv ? 'PASS' : 'FAIL'}`);
  console.log(`readiness fill (terminal mean short bars): ${c.shortMean.toFixed(2)} -> ${a.shortMean.toFixed(2)} (guardrail armed <= control+0.5): ${gRdy ? 'PASS' : 'FAIL'}; rdy runs: ${c.rdyCount} -> ${a.rdyCount}`);
  console.log(`new death modes (>=2 events): ${newCauses.length ? newCauses.join(', ') : 'none'}: ${gNewMode ? 'PASS' : 'FAIL'}`);
  console.log('doctrine (armed):', JSON.stringify(a.doctrine));
  console.log(`unattributed: control ${c.unattributed}, armed ${a.unattributed}`);
  console.log('VERDICT: ' + verdict);
  if (bad.length) { console.log('BAD FILES:'); for (const b of bad) console.log('  ' + b); }
}

if (require.main === module) main();
module.exports = { loadValid, summarize, windowStats };
