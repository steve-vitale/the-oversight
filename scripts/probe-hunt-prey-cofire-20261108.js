#!/usr/bin/env node
// probe-hunt-prey-cofire-20261108.js — OVE-78
// Measure-only: among hunt DUTY ads on the matched 16×2×80d recipe, what
// fraction carry known_prey vs pantry_protein? Also count dawn days with
// village.animals level≥1 when pantryLow, and contrast with player
// codex.animals (does knowledge land in the store dutyKnownPrey reads?).
//
// Harness rule: one loadGame per process — driver spawns one child per
// (policy, seed). Muse lanes untouched. No Game edits.
//
// Usage:
//   SEEDS=7,42,99,1234,555,777,2026,31337,1,2,3,4,5,6,8,9 \
//     POLICIES=capable,competent DAYS=80 PAR=8 \
//     OUT=evidence/2026-11-08/hunt-prey-cofire \
//     node scripts/probe-hunt-prey-cofire-20261108.js
//   POLICY=capable SEED=7 DAYS=80 node scripts/probe-hunt-prey-cofire-20261108.js --one
'use strict';
const path = require('path');
const fs = require('fs');
const { spawn, execSync } = require('child_process');
const REPO = path.join(__dirname, '..');

const DEFAULT_SEEDS = '7,42,99,1234,555,777,2026,31337,1,2,3,4,5,6,8,9';
const DEFAULT_POLICIES = 'capable,competent';

function shaFull() {
  try { return execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim(); }
  catch (e) { return 'unknown'; }
}
function sha12() { return shaFull().slice(0, 12); }

function nowDay(Game) {
  try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; }
}
function isDead(Game, id) {
  try { return !!(Game.getPerson(id) || {}).dead; } catch (e) { return false; }
}
function rosterOf(Game) {
  try { return ((Game.state.village || {}).roster || []).slice(); } catch (e) { return []; }
}

function animalLevelCount(map) {
  let n = 0, ge1 = 0, ids = [];
  if (!map || typeof map !== 'object') return { n: 0, ge1: 0, ids: [] };
  for (const aid of Object.keys(map)) {
    if (!Object.prototype.hasOwnProperty.call(map, aid)) continue;
    n++;
    const lvl = (map[aid] && (map[aid].level || 0)) || 0;
    if (lvl >= 1) { ge1++; ids.push(aid); }
  }
  return { n, ge1, ids };
}

function huntNoteOf(cand) {
  const cons = (cand && cand.considerations) || [];
  for (let i = 0; i < cons.length; i++) {
    const c = cons[i];
    if (c && c.id === 'believed_need' && c.note) return String(c.note);
  }
  return '?';
}

function sampleDawn(Game, acc) {
  const day = nowDay(Game);
  const me = String(Game.villagerId);
  let vAnimals = {};
  let codexAnimals = {};
  try { vAnimals = ((Game.state.village || {}).animals) || {}; } catch (e) { vAnimals = {}; }
  try { codexAnimals = ((Game.state.codex || {}).animals) || {}; } catch (e) { codexAnimals = {}; }
  const vStat = animalLevelCount(vAnimals);
  const cStat = animalLevelCount(codexAnimals);

  let pantryLowAny = false;
  let pantryVeryLowAny = false;
  let unknownAll = true;
  let huntAds = 0;
  let knownPreyAds = 0;
  let pantryProteinAds = 0;
  let otherNoteAds = 0;
  let forageAds = 0;
  let huntBeatsForage = 0;
  let huntUnderForage = 0;
  let unassigned = 0;

  for (const id of rosterOf(Game)) {
    const k = String(id);
    if (k === me || isDead(Game, id)) continue;
    let asg = null;
    try { asg = Game.assignmentFor ? Game.assignmentFor(id) : null; } catch (e) {}
    if (asg && asg.task && asg.task !== 'rest') continue;
    unassigned++;

    let needs = null;
    try {
      // Prefer brain helper if exposed; else reconstruct via feed notes.
      if (typeof Game.objResourceBelief === 'function') {
        const bel = Game.objResourceBelief(id);
        if (bel && !bel.unknown) {
          unknownAll = false;
          const kcal = bel.pantryKcal;
          const days = bel.pantryDays;
          const low = (typeof kcal === 'number' && kcal < 4000) || (typeof days === 'number' && days < 3);
          const very = (typeof kcal === 'number' && kcal < 2000) || (typeof days === 'number' && days < 1);
          if (low) pantryLowAny = true;
          if (very) pantryVeryLowAny = true;
        }
      }
    } catch (e) {}

    let feed = [];
    try { feed = Game.dutyFeedCands ? (Game.dutyFeedCands(id) || []) : []; } catch (e) { feed = []; }
    const hunt = feed.find(c => c && c.dutyTask === 'hunt');
    const forage = feed.find(c => c && c.dutyTask === 'forage');
    if (forage) forageAds++;
    if (!hunt) continue;
    huntAds++;
    const note = huntNoteOf(hunt);
    if (note === 'known_prey') knownPreyAds++;
    else if (note === 'pantry_protein') pantryProteinAds++;
    else otherNoteAds++;
    if (forage) {
      if (hunt.w > forage.w) huntBeatsForage++;
      else huntUnderForage++;
    }
  }

  // Drain vbrain logs for hunt pick / ad events with notes.
  let logs = [];
  try { logs = Game.vbrainLogs ? (Game.vbrainLogs() || []) : []; } catch (e) { logs = []; }
  const start = acc.logCursor || 0;
  for (let i = start; i < logs.length; i++) {
    const e = logs[i];
    if (!e) continue;
    acc.logsTotal++;
    const cands = e.candidates || [];
    const huntCands = cands.filter(c => c && (c.kind === 'DUTY' || c.vbrainSrc === 'duty') && c.dutyTask === 'hunt');
    for (const hc of huntCands) {
      const note = huntNoteOf(hc);
      acc.logHuntAds++;
      if (note === 'known_prey') acc.logKnownPrey++;
      else if (note === 'pantry_protein') acc.logPantryProtein++;
      else acc.logOtherNote++;
    }
    if ((e.pick === 'DUTY' || e.pickSrc === 'duty') && huntCands.length) {
      // pickByTask in census used first duty cand; here require hunt was the pick dutyTask via override/commit.
      const commitTask = (e.commit && e.commit.dutyTask) || e.dutyTask || null;
      const pickTask = e.pickDutyTask || commitTask;
      // Prefer: if override duty_top_score and any hunt cand, check if pick kind DUTY with hunt in samples.
      if (pickTask === 'hunt' || (e.override === 'duty_top_score' && e.pick === 'DUTY' && huntCands[0])) {
        // Conservative: only count when logged pick dutyTask is hunt, else inspect commit.
        let isHuntPick = pickTask === 'hunt';
        if (!isHuntPick && e.commit && e.commit.dutyTask === 'hunt') isHuntPick = true;
        if (isHuntPick) {
          acc.logHuntPicks++;
          const note = huntNoteOf(huntCands[0]);
          if (note === 'known_prey') acc.logHuntPicksKnownPrey++;
          else if (note === 'pantry_protein') acc.logHuntPicksPantryProtein++;
        }
      }
    }
  }
  acc.logCursor = logs.length;

  acc.daysSampled++;
  if (vStat.ge1 > 0) acc.daysVillageAnimalsGe1++;
  if (cStat.ge1 > 0) acc.daysCodexAnimalsGe1++;
  if (pantryLowAny) acc.daysPantryLow++;
  if (pantryVeryLowAny) acc.daysPantryVeryLow++;
  if (pantryLowAny && vStat.ge1 > 0) acc.daysPantryLowAndVillagePrey++;
  if (pantryLowAny && cStat.ge1 > 0) acc.daysPantryLowAndCodexPrey++;
  if (pantryLowAny && vStat.ge1 === 0 && cStat.ge1 > 0) acc.daysPantryLowCodexOnly++;
  if (huntAds > 0) acc.daysWithHuntFeed++;
  acc.huntFeedAds += huntAds;
  acc.knownPreyFeedAds += knownPreyAds;
  acc.pantryProteinFeedAds += pantryProteinAds;
  acc.otherNoteFeedAds += otherNoteAds;
  acc.forageFeedAds += forageAds;
  acc.huntBeatsForage += huntBeatsForage;
  acc.huntUnderForage += huntUnderForage;
  acc.unassignedSum += unassigned;

  if (acc.daySamples.length < 24 && (huntAds > 0 || vStat.ge1 > 0 || pantryLowAny)) {
    acc.daySamples.push({
      day, unassigned, huntAds, knownPreyAds, pantryProteinAds, otherNoteAds,
      forageAds, huntBeatsForage, huntUnderForage,
      pantryLowAny, pantryVeryLowAny, unknownAll,
      villageAnimalsGe1: vStat.ge1, villageAnimalIds: vStat.ids.slice(0, 6),
      codexAnimalsGe1: cStat.ge1, codexAnimalIds: cStat.ids.slice(0, 6),
    });
  }
}

async function runOne() {
  const seed = parseInt(process.env.SEED || '7', 10);
  const days = parseInt(process.env.DAYS || '80', 10);
  const policyId = process.env.POLICY || 'capable';
  const outDir = process.env.OUT || path.join(REPO, 'evidence', '2026-11-08', 'hunt-prey-cofire');
  const { loadGame, setupGame, driveFights, driveContests } = require('./sim-harness');
  let policy;
  try { policy = require('./policies/' + policyId); }
  catch (e) {
    console.error('unknown policy', policyId, e.message);
    process.exit(2);
  }
  if (policy && policy.id !== policyId) {
    if (policy[policyId]) policy = policy[policyId];
    else if (policy.default) policy = policy.default;
  }

  const _warned = {};
  function warnOnce(k, e) {
    if (!_warned[k]) { _warned[k] = true; console.warn('[huntcofire:' + k + ']', (e && e.message) || e); }
  }

  const { Game } = await loadGame({ seed, mode: 'mvc', fullTelemetry: true });
  await setupGame(Game);
  const ctx = { policyId: policy.id || policyId, notes: [] };
  if (policy.setup) { try { await policy.setup(Game, ctx); } catch (e) { warnOnce('setup', e); } }

  const acc = {
    logCursor: 0, logsTotal: 0,
    logHuntAds: 0, logKnownPrey: 0, logPantryProtein: 0, logOtherNote: 0,
    logHuntPicks: 0, logHuntPicksKnownPrey: 0, logHuntPicksPantryProtein: 0,
    daysSampled: 0, daysVillageAnimalsGe1: 0, daysCodexAnimalsGe1: 0,
    daysPantryLow: 0, daysPantryVeryLow: 0,
    daysPantryLowAndVillagePrey: 0, daysPantryLowAndCodexPrey: 0, daysPantryLowCodexOnly: 0,
    daysWithHuntFeed: 0,
    huntFeedAds: 0, knownPreyFeedAds: 0, pantryProteinFeedAds: 0, otherNoteFeedAds: 0,
    forageFeedAds: 0, huntBeatsForage: 0, huntUnderForage: 0, unassignedSum: 0,
    daySamples: [],
  };

  // Start-of-run animal store snapshot (day 0 / after setup).
  const startVillage = animalLevelCount((((Game.state.village || {}).animals) || {}));
  const startCodex = animalLevelCount((((Game.state.codex || {}).animals) || {}));

  let deadTail = 0;
  for (let d = 1; d <= days; d++) {
    for (let p = 0; p < 3; p++) {
      if (policy.upkeep) { try { policy.upkeep(Game, ctx); } catch (e) { warnOnce('upkeep', e); } }
      try { driveFights(Game, policy, ctx); } catch (e) { warnOnce('fights', e); }
      try { driveContests(Game, policy, ctx); } catch (e) { warnOnce('contests', e); }
      if (Game.over) break;
      try { Game.doAction('wait'); } catch (e) { warnOnce('wait', e); }
      try { driveFights(Game, policy, ctx); } catch (e) { warnOnce('fights2', e); }
      try { driveContests(Game, policy, ctx); } catch (e) { warnOnce('contests2', e); }
      if (Game.over) break;
    }
    if (Game.over) break;
    if (policy.daily) { try { policy.daily(Game, ctx); } catch (e) { warnOnce('daily', e); } }
    try { Game.sleep(); } catch (e) { warnOnce('sleep', e); }
    sampleDawn(Game, acc);
    const alive = rosterOf(Game).filter(id => !isDead(Game, id)).length;
    if (alive === 0) { deadTail++; if (deadTail >= 10) break; }
    else deadTail = 0;
  }

  const endVillage = animalLevelCount((((Game.state.village || {}).animals) || {}));
  const endCodex = animalLevelCount((((Game.state.codex || {}).animals) || {}));

  const out = {
    seed, policy: policyId, days, endDay: nowDay(Game), gameOver: !!Game.over,
    commit: shaFull(), tipLabel: sha12(),
    startVillageAnimalsGe1: startVillage.ge1, startCodexAnimalsGe1: startCodex.ge1,
    endVillageAnimalsGe1: endVillage.ge1, endCodexAnimalsGe1: endCodex.ge1,
    endVillageAnimalIds: endVillage.ids, endCodexAnimalIds: endCodex.ids.slice(0, 12),
    acc,
  };
  fs.mkdirSync(outDir, { recursive: true });
  const fname = `huntcofire-${policyId}-seed${seed}.json`;
  fs.writeFileSync(path.join(outDir, fname), JSON.stringify(out));
  console.log(JSON.stringify({
    ok: true, seed, policy: policyId, endDay: out.endDay, gameOver: out.gameOver,
    huntFeedAds: acc.huntFeedAds,
    knownPrey: acc.knownPreyFeedAds,
    pantryProtein: acc.pantryProteinFeedAds,
    daysVillagePrey: acc.daysVillageAnimalsGe1,
    daysCodexPrey: acc.daysCodexAnimalsGe1,
    daysPantryLowAndVillagePrey: acc.daysPantryLowAndVillagePrey,
    daysPantryLowCodexOnly: acc.daysPantryLowCodexOnly,
    huntBeatsForage: acc.huntBeatsForage,
    huntUnderForage: acc.huntUnderForage,
    logHuntPicks: acc.logHuntPicks,
    file: fname,
  }));
}

function parseList(s, fallback) {
  return (s || fallback).split(',').map(x => x.trim()).filter(Boolean);
}

function runDriver() {
  const seeds = parseList(process.env.SEEDS, DEFAULT_SEEDS).map(s => parseInt(s, 10));
  const policies = parseList(process.env.POLICIES, DEFAULT_POLICIES);
  const days = process.env.DAYS || '80';
  const outDir = process.env.OUT || path.join(REPO, 'evidence', '2026-11-08', 'hunt-prey-cofire');
  const par = Math.max(1, parseInt(process.env.PAR || '8', 10));
  fs.mkdirSync(outDir, { recursive: true });

  const jobs = [];
  for (const policy of policies) {
    for (const seed of seeds) jobs.push({ policy, seed });
  }
  let next = 0, alive = 0, failed = 0;
  const results = [];

  function launch() {
    while (alive < par && next < jobs.length) {
      const job = jobs[next++];
      alive++;
      const child = spawn(process.execPath, [__filename, '--one'], {
        cwd: REPO,
        env: Object.assign({}, process.env, {
          POLICY: job.policy, SEED: String(job.seed), DAYS: String(days), OUT: outDir,
        }),
        stdio: ['ignore', 'pipe', 'pipe'],
      });
      let buf = '', err = '';
      child.stdout.on('data', d => { buf += d.toString(); });
      child.stderr.on('data', d => { err += d.toString(); });
      child.on('close', code => {
        alive--;
        let parsed = null;
        try {
          const lines = buf.trim().split(/\n/).filter(Boolean);
          parsed = JSON.parse(lines[lines.length - 1] || '{}');
        } catch (e) { parsed = null; }
        if (code !== 0 || !parsed || !parsed.ok) {
          failed++;
          console.error(JSON.stringify({
            ok: false, policy: job.policy, seed: job.seed, code,
            err: err.slice(-800), out: buf.slice(-400),
          }));
        } else {
          results.push(parsed);
          console.log(JSON.stringify(parsed));
        }
        launch();
        if (alive === 0 && next >= jobs.length) summarize();
      });
    }
  }

  function summarize() {
    const byPol = {};
    for (const r of results) {
      const p = r.policy;
      byPol[p] = byPol[p] || {
        cases: 0, huntFeedAds: 0, knownPrey: 0, pantryProtein: 0,
        daysVillagePrey: 0, daysCodexPrey: 0,
        daysPantryLowAndVillagePrey: 0, daysPantryLowCodexOnly: 0,
        huntBeatsForage: 0, huntUnderForage: 0, logHuntPicks: 0,
        seedsWithKnownPrey: 0, seedsWithVillagePrey: 0, seedsWithCodexPrey: 0,
      };
      const b = byPol[p];
      b.cases++;
      b.huntFeedAds += r.huntFeedAds || 0;
      b.knownPrey += r.knownPrey || 0;
      b.pantryProtein += r.pantryProtein || 0;
      b.daysVillagePrey += r.daysVillagePrey || 0;
      b.daysCodexPrey += r.daysCodexPrey || 0;
      b.daysPantryLowAndVillagePrey += r.daysPantryLowAndVillagePrey || 0;
      b.daysPantryLowCodexOnly += r.daysPantryLowCodexOnly || 0;
      b.huntBeatsForage += r.huntBeatsForage || 0;
      b.huntUnderForage += r.huntUnderForage || 0;
      b.logHuntPicks += r.logHuntPicks || 0;
      if ((r.knownPrey || 0) > 0) b.seedsWithKnownPrey++;
      if ((r.daysVillagePrey || 0) > 0) b.seedsWithVillagePrey++;
      if ((r.daysCodexPrey || 0) > 0) b.seedsWithCodexPrey++;
    }
    const summary = {
      tip: sha12(), commit: shaFull(),
      days: parseInt(days, 10), seeds: seeds.length, policies,
      cases: results.length, failed,
      byPolicy: byPol,
    };
    fs.writeFileSync(path.join(outDir, 'summary.json'), JSON.stringify(summary, null, 2));
    console.log(JSON.stringify({ summary: true, tip: summary.tip, cases: summary.cases, failed, byPolicy: byPol }));
    process.exit(failed ? 1 : 0);
  }

  launch();
}

if (process.argv.indexOf('--one') >= 0) {
  runOne().catch(e => { console.error(e); process.exit(1); });
} else {
  runDriver();
}
