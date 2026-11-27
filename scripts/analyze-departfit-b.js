#!/usr/bin/env node
// analyze-departfit-b.js — paired departure-fitness analyzer (arm
// sim-departfit-b). Reads the ctl (baseline) and arm (lever) per-seed
// corpora, judges the frozen prereg bars B1–B5, and reports the
// distributions + the stamp-timing correction (pre- vs post-load
// loaded share) with numbers.
//
// Primary metric B1 is the POST-load loaded share on launches (the
// true departure loadout, after the departure loaders ran). The PRE-load
// share is reported alongside for comparability with launchfit's 57.1%.
//
// Usage:
//   node scripts/analyze-departfit-b.js --ctl <dir> --arm <dir> [--out <json>]
//   node scripts/analyze-departfit-b.js --ctl <dir> --arm <dir>
//       --ctl-rerun <dir> --arm-rerun <dir> [--out <json>]  (B5 determinism)
//   node scripts/analyze-departfit-b.js --selftest   (synthetic rows only)
'use strict';
const fs = require('fs');
const path = require('path');

function quartile(sorted, q) {
  if (!sorted.length) return null;
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sorted[base + 1] !== undefined) return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  return sorted[base];
}
function median(a) { const s = a.slice().sort(function (x, y) { return x - y; }); return quartile(s, 0.5); }

function legStats(files) {
  const seeds = [];
  let departs = [], launches = [], holds = [];
  let instrumentErrors = 0, errorDetail = [];
  let gameDays = [], wins = 0, nationals = 0, tables = 0, wave5 = 0, wave4 = 0;
  let deathsTotal = 0;
  const causeCounts = {};
  const craft = { ammo_craft: 0, ammo_craft_ok: 0, weapon_craft: 0, weapon_craft_ok: 0 };
  const departFit = { checked: 0, loadedByCheck: 0, heldNoAmmo: 0, heldUnarmed: 0 };
  const holdDaysBySeed = {};
  for (const f of files) {
    const j = JSON.parse(fs.readFileSync(f, 'utf8'));
    seeds.push(j.seed);
    (j.departs || []).forEach(function (d) { d._seed = j.seed; departs.push(d); });
    instrumentErrors += (j.instrumentErrors || []).length;
    (j.instrumentErrors || []).forEach(function (e) { errorDetail.push('s' + j.seed + ': ' + e); });
    gameDays.push(j.gameDays || 0);
    if (j.won) wins++;
    if (j.national) nationals++;
    if (j.table) tables++;
    if ((j.endUnlockedWave || j.maxWave || 1) >= 5) wave5++;
    if ((j.endUnlockedWave || j.maxWave || 1) >= 4) wave4++;
    const ds = j.deaths || [];
    deathsTotal += ds.length;
    for (const d of ds) {
      const c = (d && d.cause) || 'unknown';
      causeCounts[c] = (causeCounts[c] || 0) + 1;
    }
    const cc = j.craftCounts || {};
    craft.ammo_craft += cc.ammo_craft || 0;
    craft.ammo_craft_ok += cc.ammo_craft_ok || 0;
    craft.weapon_craft += cc.weapon_craft || 0;
    craft.weapon_craft_ok += cc.weapon_craft_ok || 0;
    const df = j.departFit || {};
    departFit.checked += df.checked || 0;
    departFit.loadedByCheck += df.loadedByCheck || 0;
    departFit.heldNoAmmo += df.heldNoAmmo || 0;
    departFit.heldUnarmed += df.heldUnarmed || 0;
  }
  launches = departs.filter(function (d) { return d.result === 'launch'; });
  holds = departs.filter(function (d) { return d.result === 'hold'; });
  for (const h of holds) holdDaysBySeed[h._seed] = (holdDaysBySeed[h._seed] || 0) + 1;

  // Loaded shares on launches, pre- and post-call stamps.
  function loadedShare(usePost) {
    let carriers = 0, loaded = 0, ammoZero = 0;
    let postComplete = 0, postTotal = 0;
    for (const d of launches) {
      const ms = usePost ? (d.membersPost || d.members) : (d.members || []);
      if (usePost) { postTotal++; if (d.completePost) postComplete++; }
      for (const m of ms) {
        if (!m.volley) continue;
        carriers++;
        if (m.loaded) loaded++;
        if ((m.ammoN || 0) === 0) ammoZero++;
      }
    }
    return { carriers: carriers, loaded: loaded,
      share: carriers ? loaded / carriers : null, ammoZero: ammoZero,
      postCoverage: usePost && postTotal ? postComplete / postTotal : null,
      postComplete: postComplete, postTotal: postTotal };
  }
  const pre = loadedShare(false);
  const post = loadedShare(true);

  // Per-launch armed share (post stamp) + HP context (post stamp).
  const armedShares = [];
  const hps = [];
  for (const d of launches) {
    const ms = d.membersPost || d.members || [];
    if (!ms.length) continue;
    armedShares.push(ms.filter(function (m) { return m.armed; }).length / ms.length);
    for (const m of ms) hps.push(m.hp);
  }
  const hpSorted = hps.slice().sort(function (a, b) { return a - b; });
  const armedSorted = armedShares.slice().sort(function (a, b) { return a - b; });
  const causeShares = {};
  for (const k of Object.keys(causeCounts)) causeShares[k] = deathsTotal ? causeCounts[k] / deathsTotal : 0;

  return {
    seeds: seeds.sort(function (a, b) { return a - b; }),
    departs: departs.length, launches: launches.length, holds: holds.length,
    stampedComplete: departs.filter(function (d) { return d.complete; }).length,
    stampedCompletePost: departs.filter(function (d) { return d.completePost; }).length,
    coverage: departs.length ? departs.filter(function (d) { return d.complete; }).length / departs.length : 0,
    coveragePost: departs.length ? departs.filter(function (d) { return d.completePost; }).length / departs.length : 0,
    preLoad: pre, postLoad: post,
    armedSharePost: { n: armedShares.length, median: median(armedShares),
      q1: quartile(armedSorted, 0.25), q3: quartile(armedSorted, 0.75),
      min: armedSorted.length ? armedSorted[0] : null },
    hpPost: { n: hps.length, median: median(hps),
      q1: quartile(hpSorted, 0.25), q3: quartile(hpSorted, 0.75),
      shareLt50: hps.length ? hps.filter(function (x) { return x < 50; }).length / hps.length : null },
    wall: { wins: wins, nationals: nationals, tables: tables, wave4: wave4, wave5: wave5,
      medianSurvival: median(gameDays), gameDays: gameDays.slice().sort(function (a, b) { return a - b; }) },
    deathsTotal: deathsTotal, causeCounts: causeCounts, causeShares: causeShares,
    craft: craft, departFit: departFit, holdDaysBySeed: holdDaysBySeed,
    instrumentErrors: instrumentErrors, errorDetail: errorDetail,
  };
}

function analyzePair(ctlFiles, armFiles, rerun) {
  const ctl = legStats(ctlFiles);
  const arm = legStats(armFiles);
  // B1: post-load loaded share on the arm leg.
  const b1 = arm.postLoad.share;
  // B2: launch count within ±25% of baseline.
  const b2ratio = ctl.launches ? arm.launches / ctl.launches : (arm.launches === 0 ? 1 : Infinity);
  // B3: median survival not worse than baseline by > 10d.
  const b3diff = (arm.wall.medianSurvival == null || ctl.wall.medianSurvival == null)
    ? null : arm.wall.medianSurvival - ctl.wall.medianSurvival;
  // B4: no death-cause share moves > 15pp.
  const causes = {};
  for (const k of Object.keys(ctl.causeShares)) causes[k] = true;
  for (const k of Object.keys(arm.causeShares)) causes[k] = true;
  let b4max = 0, b4worst = null;
  for (const k of Object.keys(causes)) {
    const d = Math.abs((arm.causeShares[k] || 0) - (ctl.causeShares[k] || 0));
    if (d > b4max) { b4max = d; b4worst = k; }
  }
  // B5: 0 instrument errors both legs + determinism (when rerun dirs given).
  let det = null, detDetail = null;
  if (rerun && rerun.ctlRerunFiles && rerun.armRerunFiles) {
    det = true; detDetail = [];
    const cmp = function (a, b) {
      const ta = fs.readFileSync(a, 'utf8'), tb = fs.readFileSync(b, 'utf8');
      return ta === tb;
    };
    for (let i = 0; i < ctlFiles.length; i++) {
      const ok = cmp(ctlFiles[i], rerun.ctlRerunFiles[i]);
      if (!ok) { det = false; detDetail.push('ctl s' + ctl.seeds[i] + ' differs'); }
    }
    for (let i = 0; i < armFiles.length; i++) {
      const ok = cmp(armFiles[i], rerun.armRerunFiles[i]);
      if (!ok) { det = false; detDetail.push('arm s' + arm.seeds[i] + ' differs'); }
    }
    if (det) detDetail = ['all per-seed files byte-identical on re-run'];
  }
  const errs = ctl.instrumentErrors + arm.instrumentErrors;
  const bars = {
    B1: { threshold: 'post-load loaded share (arm launches) >= 0.80', value: b1, pass: b1 != null && b1 >= 0.80,
      detail: arm.postLoad.loaded + '/' + arm.postLoad.carriers + ' ranged carriers loaded at departure (post-load); pre-load share ' + (arm.preLoad.share == null ? 'n/a' : arm.preLoad.share.toFixed(3)) + ' on ' + arm.preLoad.carriers + ' carriers' },
    B2: { threshold: 'launch count within ±25% of baseline', value: b2ratio, pass: b2ratio >= 0.75 && b2ratio <= 1.25,
      detail: arm.launches + ' launches vs ' + ctl.launches + ' baseline' },
    B3: { threshold: 'median survival not worse than baseline by > 10d', value: b3diff, pass: b3diff != null && b3diff >= -10,
      detail: 'median survival arm ' + arm.wall.medianSurvival + 'd vs ctl ' + ctl.wall.medianSurvival + 'd' },
    B4: { threshold: 'no death-cause share moves > 15pp', value: b4max, pass: b4max <= 0.15,
      detail: 'worst cause ' + b4worst + ' moves ' + (b4max * 100).toFixed(1) + 'pp; deaths ctl ' + ctl.deathsTotal + ' vs arm ' + arm.deathsTotal },
    B5: { threshold: '0 instrument errors both legs; determinism byte-identical on re-run', value: errs, pass: errs === 0 && det !== false,
      detail: errs + ' instrument errors; determinism ' + (det == null ? 'NOT YET VERIFIED (no rerun dirs)' : (det ? 'byte-identical' : detDetail.join('; '))) +
        (errs ? '; ' + ctl.errorDetail.concat(arm.errorDetail).slice(0, 10).join(' | ') : '') },
  };
  const verdict = (bars.B1.pass && bars.B2.pass && bars.B3.pass && bars.B4.pass && bars.B5.pass) ? 'GO' : 'NO-GO';
  return { ctl: ctl, arm: arm, bars: bars, verdict: verdict,
    baselinePostLoadShare: ctl.postLoad.share, baselinePreLoadShare: ctl.preLoad.share };
}

function listDir(dir, prefix) {
  return fs.readdirSync(dir).filter(function (f) { return new RegExp('^' + prefix + '-s\\d+\\.json$').test(f); })
    .map(function (f) { return path.join(dir, f); }).sort();
}

function main() {
  const args = process.argv.slice(2);
  if (args.indexOf('--selftest') !== -1) { console.log(JSON.stringify({ selftest: 'use scripts/test-departfit-b.js' })); return; }
  const val = function (flag) { const i = args.indexOf(flag); return i !== -1 ? args[i + 1] : null; };
  const ctlDir = val('--ctl'), armDir = val('--arm');
  if (!ctlDir || !armDir) { console.error('ANALYZE-DEPARTFIT-B STOP: --ctl <dir> --arm <dir> required.'); process.exit(2); }
  const ctlFiles = listDir(ctlDir, 'departfit-b');
  const armFiles = listDir(armDir, 'departfit-b');
  if (!ctlFiles.length || !armFiles.length) { console.error('ANALYZE-DEPARTFIT-B STOP: no per-seed files.'); process.exit(2); }
  let rerun = null;
  const ctlRerun = val('--ctl-rerun'), armRerun = val('--arm-rerun');
  if (ctlRerun && armRerun) {
    rerun = { ctlRerunFiles: listDir(ctlRerun, 'departfit-b'), armRerunFiles: listDir(armRerun, 'departfit-b') };
  }
  const res = analyzePair(ctlFiles, armFiles, rerun);
  const out = val('--out');
  if (out) fs.writeFileSync(out, JSON.stringify(res, null, 2) + '\n');
  console.log(JSON.stringify(res, null, 2));
}

if (require.main === module) main();
module.exports = { analyzePair: analyzePair, legStats: legStats, median: median, quartile: quartile };
