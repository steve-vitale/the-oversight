#!/usr/bin/env node
// analyze-tablepaths-20261019.js — per-path table attribution analyzer
// (flesh-out loop arm sim-tablepaths, run fleshout-20261019T2226Z, axis
// scale-onramp).
//
// Reads the armed corpus at evidence/2026-10-19/perseed-tablepaths/
// (written by scripts/probe-tablepaths-20261019.js, SEATDRIVE=1 +
// TABLEPATHS=1) and the committed control corpus at
// evidence/2026-10-19/perseed-posttable-seatdrive/ (SEATDRIVE=1,
// TABLEPATHS=0 — the options[0] drain, exactly 1 path).
//
// Layers on the parent arm's seatAttribute(): per-run assigned door, walked
// paths (path/branch/day/fallback), trial resumes, finals, and the
// PATH-SPECIFIC mortality channels for seated deaths:
//   'trial-combat' — died while trialPending (the trial fight is the
//     table's own stake)
//   'seated-<classifier channel>' — seated deaths outside the trial
//   'pre-table' — deaths before sitting (not path-attributable; guardrail
//     surface)
// Writes evidence/2026-10-19/tablepaths-corpus-summary.json.
// Exports { analyzeRun, pathChannel, loadCorpus } for the proof test.
//
// Usage: node scripts/analyze-tablepaths-20261019.js [--out <dir>]
'use strict';
const fs = require('fs');
const path = require('path');
const PARENT = require('./analyze-seatdriveposttable-20261019');

const REPO = path.join(__dirname, '..');
const ARMED_DIR = path.join(REPO, 'evidence', '2026-10-19', 'perseed-tablepaths');
const CONTROL_DIR = path.join(REPO, 'evidence', '2026-10-19', 'perseed-posttable-seatdrive');
const POLICIES = ['leadfeast', 'belongfeast'];
const SEEDS = [64201, 64202, 64203, 64204, 64205, 64206, 64207, 64208];
const OUT_DIR = (process.argv.includes('--out') ? process.argv[process.argv.indexOf('--out') + 1]
  : path.join(REPO, 'evidence', '2026-10-19'));

function loadCorpus(dir) { return PARENT.loadCorpus(dir); }

// pathChannel(d, a): the path-specific mortality channel for one seated
// death. d = the parent's attributed death object (has tableAtDeath with
// trialPending, stamped by the probe). a = analyzeRun output.
function pathChannel(d, a) {
  if (!a || !a.sat || (d.day | 0) < (a.sittingDay | 0)) return 'pre-table';
  const tab = d.tableAtDeath || {};
  if (tab.trialPending) return 'trial-combat';
  return 'seated-' + (d.channel || 'other');
}

// analyzeRun(rec): the full per-run tablepaths attribution.
function analyzeRun(rec) {
  const sa = PARENT.seatAttribute(rec);
  const tp = rec.tp || null;
  const walked = ((tp && tp.walked) || []).map(w => ({
    day: w.day | 0, path: String(w.path), branch: w.branch != null ? String(w.branch) : null,
    door: w.door != null ? String(w.door) : null, fellBack: !!w.fellBack,
  }));
  const trialResumes = ((tp && tp.trialResumes) || []).map(t => ({
    day: t.day | 0, result: t.result != null ? String(t.result) : null,
    bearerDied: !!t.bearerDied, path: t.path != null ? String(t.path) : null,
  }));
  const finals = ((tp && tp.finalsEvents) || []).map(f => ({
    day: f.day | 0, path: f.path != null ? String(f.path) : null,
    branch: f.branch != null ? String(f.branch) : null,
    finalId: f.finalId != null ? String(f.finalId) : null,
  }));
  const doorEvents = ((tp && tp.doorEvents) || []).map(e => ({
    day: e.day | 0, picked: e.picked != null ? String(e.picked) : null,
    fellBack: !!e.fellBack, why: e.why != null ? String(e.why) : null,
  }));
  const allDeaths = (((rec.deathsAttributed || {}).attributed) || []);
  const sittingDay = rec.sittingDay;
  const sat = rec.satEver === true && sittingDay != null;
  const seatedDeaths = sat ? allDeaths.filter(d => (d.day | 0) >= (sittingDay | 0)) : [];
  const a = {
    seed: rec.seed, policyId: rec.policyId || rec.policy,
    complete: !!(rec.recs && rec.recs.length > 0),
    endReason: rec.endReason, gameDays: rec.gameDays | 0,
    won: !!rec.won, national: !!rec.national, table: !!rec.table,
    invited: rec.tableDay != null || sat, tableDay: rec.tableDay,
    sat, sittingDay, seat: rec.seatAtSit || null,
    maxWave: rec.maxWave | 0, wave4Day: rec.wave4Day, wave5Day: rec.wave5Day,
    deathsAttributed: rec.deathsAttributed || null,
    assigned: rec.tpAssigned != null ? String(rec.tpAssigned) : null,
    walked, trialResumes, finals, doorEvents,
    trialFired: trialResumes.length > 0,
    trialOptIn: !!(tp && tp.trial),
    tpAnswers: tp ? (tp.answers | 0) : 0,
    tpStalls: tp ? (tp.stalls | 0) : 0,
    drainErrors: tp ? (tp.drainErrors | 0) : 0,
  };
  a.seatedDeaths = seatedDeaths.map(d => ({
    day: d.day | 0, name: d.name, player: !!d.player, cause: d.cause,
    channel: d.channel, rule: d.rule,
    pathChannel: pathChannel(d, a),
    tablePhase: (d.tableAtDeath || {}).phase, tablePath: (d.tableAtDeath || {}).path,
    tableBranch: (d.tableAtDeath || {}).branch,
    trialPending: !!((d.tableAtDeath || {}).trialPending),
  }));
  return Object.assign({}, sa, a);
}

function summarize(recs) {
  const runs = recs.map(analyzeRun);
  const s = {
    n: runs.length,
    complete: runs.filter(r => r.complete).length,
    invited: runs.filter(r => r.invited).length,
    sat: runs.filter(r => r.sat).length,
    won: runs.filter(r => r.won).length,
    national: runs.filter(r => r.national).length,
    table: runs.filter(r => r.table).length,
    wave4: runs.filter(r => (r.maxWave | 0) >= 4).length,
    wave5: runs.filter(r => (r.maxWave | 0) >= 5).length,
    maxWave: Math.max.apply(null, runs.map(r => r.maxWave | 0).concat([0])),
    medianSurvival: 0, maxSurvival: 0,
    distinctPaths: [], branchCounts: {}, walkedRuns: 0,
    trialFired: 0, trialResumes: [],
    pathChannels: {},
    causeSpace: {},
    doorFallbacks: 0,
  };
  const days = runs.map(r => r.gameDays | 0).sort((a, b) => a - b);
  if (days.length) {
    s.medianSurvival = days[Math.floor(days.length / 2)];
    s.maxSurvival = days[days.length - 1];
  }
  const pathSet = new Set();
  for (const r of runs) {
    for (const w of r.walked) {
      pathSet.add(w.path);
      s.branchCounts[w.branch || 'none'] = (s.branchCounts[w.branch || 'none'] | 0) + 1;
      if (w.fellBack) s.doorFallbacks++;
    }
    if (r.walked.length) s.walkedRuns++;
    if (r.trialFired) s.trialFired++;
    for (const t of r.trialResumes) s.trialResumes.push(Object.assign({ seed: r.seed, policyId: r.policyId }, t));
    for (const d of r.seatedDeaths) {
      s.pathChannels[d.pathChannel] = (s.pathChannels[d.pathChannel] | 0) + 1;
    }
    const cs = (((r.deathsAttributed || {}).causeSpace) || {});
    for (const k of Object.keys(cs)) s.causeSpace[k] = (s.causeSpace[k] | 0) + cs[k];
  }
  s.distinctPaths = [...pathSet].sort();
  return { runs, s };
}

function verdict(armed, control) {
  const a = armed.s, c = control.s;
  const convA = a.invited ? a.sat / a.invited : null;
  const convC = c.invited ? c.sat / c.invited : null;
  const chans = Object.entries(a.pathChannels)
    .filter(([k]) => k !== 'pre-table')
    .sort((x, y) => y[1] - x[1]);
  const top = chans[0], second = chans[1];
  const margin = top && (!second || top[1] >= 2 * second[1]);
  // Guardrail: new death mode = a classifier channel present in armed
  // deaths but absent from control deaths (the parent arm's seated corpus
  // had 0 seated deaths — the vacuous case — so the guardrail compares
  // classifier channels on the FULL corpora).
  const armedFull = new Set(), controlFull = new Set();
  for (const r of armed.runs) for (const d of (((r.deathsAttributed || {}).attributed) || [])) armedFull.add(d.channel);
  for (const r of control.runs) for (const d of (((r.deathsAttributed || {}).attributed) || [])) controlFull.add(d.channel);
  const newModes = [...armedFull].filter(ch => !controlFull.has(ch));
  return {
    primary: {
      distinctPaths: a.distinctPaths.length,
      distinctPathsGo: a.distinctPaths.length >= 3,
      topChannel: top ? top[0] : null, topCount: top ? top[1] : 0,
      secondChannel: second ? second[0] : null, secondCount: second ? second[1] : 0,
      marginGo: !!margin,
      go: a.distinctPaths.length >= 3 && !!margin,
    },
    guardrails: {
      conversionArmed: convA, conversionControl: convC,
      conversionGo: convA != null && convA >= 0.70,
      nationalDelta: a.national - c.national,
      tableDelta: a.table - c.table,
      wallGo: Math.abs(a.national - c.national) <= 2 && Math.abs(a.table - c.table) <= 2,
      newDeathModes: newModes,
      deathModeGo: newModes.length === 0,
    },
  };
}

function main() {
  const { recs: armedRecs, bad: armedBad } = loadCorpus(ARMED_DIR);
  const { recs: controlRecs, bad: controlBad } = loadCorpus(CONTROL_DIR);
  const pilot = process.env.PILOT === '1';
  const armedBadReal = pilot ? armedBad.filter(b => !/<missing-dir>$/.test(b)) : armedBad;
  if (armedBadReal.length) { console.error('ARMED BAD FILES:', armedBadReal.join(' ')); process.exit(2); }
  if (controlBad.length) { console.error('CONTROL BAD FILES:', controlBad.join(' ')); process.exit(2); }
  if (!armedRecs.length) { console.error('ARMED: no runs loaded'); process.exit(2); }
  const armed = summarize(armedRecs);
  const control = summarize(controlRecs);
  const v = verdict(armed, control);
  console.log('=== per-run (armed) ===');
  for (const r of armed.runs) {
    const walked = r.walked.map(w => `${w.path}/${w.branch || '?'}`).join(',') || '—';
    const trials = r.trialResumes.map(t => t.result).join(',') || '—';
    console.log(`  [${r.policyId} s${r.seed}] end=${r.endReason} won=${r.won} sat=${r.sat} door=${r.assigned} walked=[${walked}] trial=[${trials}] sdeaths=${r.seatedDeaths.length} days=${r.gameDays}`);
  }
  console.log('=== corpus (armed) ===');
  const a = armed.s;
  console.log(`  runs=${a.n} complete=${a.complete} invited=${a.invited} sat=${a.sat} conversion=${a.invited ? (a.sat / a.invited).toFixed(3) : 'n/a'}`);
  console.log(`  national=${a.national} table=${a.table} wins=${a.won} wave4=${a.wave4} wave5=${a.wave5} median=${a.medianSurvival} max=${a.maxSurvival}`);
  console.log(`  distinctPaths=[${a.distinctPaths.join(',')}] branches=${JSON.stringify(a.branchCounts)} fallbacks=${a.doorFallbacks}`);
  console.log(`  trialsFired=${a.trialFired} resumes=${JSON.stringify(a.trialResumes.map(t => t.result + (t.bearerDied ? '/died' : '')))}`);
  console.log(`  pathChannels=${JSON.stringify(a.pathChannels)}`);
  console.log('=== control (parent corpus) ===');
  const c = control.s;
  console.log(`  runs=${c.n} invited=${c.invited} sat=${c.sat} conversion=${c.invited ? (c.sat / c.invited).toFixed(3) : 'n/a'} national=${c.national} table=${c.table} wins=${c.won}`);
  console.log('=== verdict ===');
  console.log(`  PRIMARY distinctPaths=${v.primary.distinctPaths} (GO>=3: ${v.primary.distinctPathsGo})`);
  console.log(`  PRIMARY topChannel=${v.primary.topChannel} x${v.primary.topCount} vs ${v.primary.secondChannel} x${v.primary.secondCount} (margin>=2x: ${v.primary.marginGo})`);
  console.log(`  PRIMARY GO: ${v.primary.go}`);
  console.log(`  guardrails: conversion=${v.guardrails.conversionArmed != null ? v.guardrails.conversionArmed.toFixed(3) : 'n/a'} (GO>=0.70: ${v.guardrails.conversionGo}), nationalDelta=${v.guardrails.nationalDelta}, tableDelta=${v.guardrails.tableDelta} (wall GO: ${v.guardrails.wallGo}), newDeathModes=[${v.guardrails.newDeathModes.join(',')}] (GO: ${v.guardrails.deathModeGo})`);
  const summary = { armed: armed.s, control: control.s, verdict: v, runs: armed.runs.map(r => ({
    seed: r.seed, policyId: r.policyId, endReason: r.endReason, gameDays: r.gameDays,
    won: r.won, national: r.national, table: r.table, invited: r.invited, sat: r.sat,
    sittingDay: r.sittingDay, seat: r.seat, assigned: r.assigned,
    walked: r.walked, trialResumes: r.trialResumes, finals: r.finals,
    doorEvents: r.doorEvents, seatedDeaths: r.seatedDeaths,
  })) };
  fs.writeFileSync(path.join(OUT_DIR, 'tablepaths-corpus-summary.json'), JSON.stringify(summary, null, 1) + '\n');
  console.log('wrote tablepaths-corpus-summary.json');
}

if (require.main === module) main();
module.exports = { analyzeRun, pathChannel, loadCorpus, summarize, verdict };
