#!/usr/bin/env node
// analyze-doorcensus-armor.js — tabulate the wave-5 DOOR census re-run
// (flesh-out loop arm sim-doorcensus-armor, run fleshout-20261023T1115Z).
// DIAG analyzer: reads per-seed JSONs ONCE, attributes via the stored
// w5gates-lib gateVector (UNMODIFIED lib, computed at sweep time), and
// compares against the retained historical census (perseed-w5door-b/).
//
// Usage: node scripts/analyze-doorcensus-armor.js
//   env override: DCARMOR_EVID=<dir> (defaults to evidence/2026-10-23/perseed-doorcensus-armor)
// Writes: stdout summary + evidence/2026-10-23/doorcensus-armor-summary.json
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = process.env.REPO || path.join(__dirname, '..');
const EVID = process.env.DCARMOR_EVID || path.join(REPO, 'evidence', '2026-10-23', 'perseed-doorcensus-armor');
const HIST = path.join(REPO, 'evidence', '2026-10-23', 'perseed-w5door-b');

function loadDir(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const f of fs.readdirSync(dir)) {
    if (!/^s\d+\.json$/.test(f)) continue;
    try { out.push(JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))); } catch (e) {}
  }
  return out.sort((a, b) => a.seed - b.seed);
}

function median(xs) {
  if (!xs.length) return null;
  const s = xs.slice().sort((a, b) => a - b);
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
}

// Defer5 coincidence metric: days where armor AND veterans bars are
// co-satisfied on the r5 readiness board (the census's "window" condition).
function defer5CoincidentDays(rec) {
  const dem = rec.demand5 || {};
  const needA = (dem.armored | 0) || 4, needV = (dem.veterans | 0) || 2;
  let days = 0, first = null;
  for (const w of (rec.window || [])) {
    const b = w.r5 || {};
    if (((b.armored | 0) >= needA) && ((b.veterans | 0) >= needV)) { days++; if (first == null) first = w.day; }
  }
  return { days, first };
}

function summarize(recs, label) {
  const ok = recs.filter(r => !r.error);
  const doors = ok.filter(r => r.w5Day != null);
  const w4 = ok.filter(r => r.w4Day != null);
  const bindings = {};
  const unattributed = [];
  for (const r of ok) {
    const attr = (r.gateVector && r.gateVector.attr) || null;
    if (r.w5Day != null) {
      bindings['opened'] = (bindings['opened'] | 0) + 1;
    } else if (attr && attr.attributed) {
      const b = String(attr.binding || 'unknown');
      bindings[b] = (bindings[b] | 0) + 1;
    } else {
      unattributed.push(r.seed);
    }
  }
  const surv = ok.map(r => r.gameDays | 0).filter(Number.isFinite);
  const starv = ok.reduce((a, r) => a + ((r.deaths && r.deaths.starvation) | 0), 0);
  const deathKeys = new Set();
  for (const r of ok) for (const k of Object.keys(r.deaths || {})) deathKeys.add(k);
  const coincident = ok.map(r => ({ seed: r.seed, ...defer5CoincidentDays(r) }));
  const anyCoincident = coincident.filter(c => c.days > 0);
  const armorReleaseDays = ok.map(r => ({ seed: r.seed, day: (r.barRelease && r.barRelease.armored) != null ? r.barRelease.armored : null }));
  const vetsReleaseDays = ok.map(r => ({ seed: r.seed, day: (r.barRelease && r.barRelease.veterans) != null ? r.barRelease.veterans : null }));
  return {
    label, n: ok.length, errors: recs.length - ok.length,
    doors: doors.map(r => r.seed),
    doorsCount: doors.length,
    w4Count: w4.length,
    bindings, unattributed,
    national: ok.filter(r => r.national).length,
    table: ok.filter(r => r.table).length,
    won: ok.filter(r => r.won).length,
    wave5reach: doors.length,
    medianSurvival: median(surv), maxSurvival: surv.length ? Math.max(...surv) : null,
    starvationDeaths: starv,
    deathModes: Array.from(deathKeys).sort(),
    coincidentConfigs: anyCoincident.length,
    coincident,
    armorReleaseDays,
    vetsReleaseDays,
    anchors: Array.from(new Set(ok.map(r => r.anchorCommit))),
  };
}

function main() {
  const control = summarize(loadDir(path.join(EVID, 'control')), 'control (ARMORYDRIVE=1)');
  const armed = summarize(loadDir(path.join(EVID, 'armed')), 'armed (ARMORYDRIVE=1+ARMORVILLAGE=1)');
  const histControl = summarize(loadDir(path.join(HIST, 'control')), 'HISTORICAL census control (f5f19667ce19, no ARMORYDRIVE)');
  const histArmed = summarize(loadDir(path.join(HIST, 'armorydrive')), 'HISTORICAL census armorydrive (f5f19667ce19)');
  const out = {
    generatedUtc: new Date().toISOString(),
    primary: {
      armed: armed.doorsCount, control: control.doorsCount,
      goThreshold: 'armed >= control+2',
      verdict: (armed.doorsCount >= control.doorsCount + 2) ? 'GO' : 'NO-GO',
    },
    control, armed, histControl, histArmed,
  };
  const outPath = path.join(REPO, 'evidence', '2026-10-23', 'doorcensus-armor-summary.json');
  fs.writeFileSync(outPath, JSON.stringify(out, null, 1) + '\n');
  const L = [];
  L.push(`doorcensus-armor: armed ${armed.doorsCount}/${armed.n} vs control ${control.doorsCount}/${control.n} (GO bar: armed >= control+2) → ${out.primary.verdict}`);
  L.push(`historical: census-armed ${histArmed.doorsCount}/${histArmed.n} (anchor ${histArmed.anchors.join(',')||'?'})`);
  for (const [nm, s] of [['control', control], ['armed', armed]]) {
    L.push(`  ${nm}: bindings ${JSON.stringify(s.bindings)} unattributed=${JSON.stringify(s.unattributed)} w4=${s.w4Count} national=${s.national} table=${s.table} won=${s.won} medianSurv=${s.medianSurvival} starv=${s.starvationDeaths} coincident=${s.coincidentConfigs}`);
  }
  console.log(L.join('\n'));
  console.log('wrote', outPath);
  return out;
}

if (require.main === module) main();
module.exports = { summarize, defer5CoincidentDays, loadDir, main };
