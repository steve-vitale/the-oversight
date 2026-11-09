#!/usr/bin/env node
// probe-hunt-empty-store-classify-20261108.js — OVE-85
// Measurement-only: classify capable/seed7 hunt ads-without-picks residual
// after OVE-78 (dutyKnownPrey ← village.animals ∪ codex.animals).
//
// Per dawn logs: prey-store counts, hunt cand note/weight, forage weight,
// whether hunt beat forage, whether any villager duty_top_score-committed hunt.
// Contrast residual seed (default 7) vs hunt-pick control (default 5).
//
// Harness rule: one loadGame per process — driver spawns one child per seed.
// Muse lanes untouched. No Game/brain/policy edits.
//
// Usage:
//   SEEDS=7,5 POLICY=capable DAYS=80 PAR=2 \
//     OUT=evidence/2026-11-08/hunt-empty-store-classify \
//     node scripts/probe-hunt-empty-store-classify-20261108.js
//   POLICY=capable SEED=7 DAYS=80 node scripts/probe-hunt-empty-store-classify-20261108.js --one
'use strict';
const path = require('path');
const fs = require('fs');
const { spawn, execSync } = require('child_process');
const REPO = path.join(__dirname, '..');

const DEFAULT_SEEDS = '7,5';
const DEFAULT_POLICY = 'capable';

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
  const preyKnown = vStat.ge1 > 0 || cStat.ge1 > 0;

  let huntAds = 0;
  let knownPreyAds = 0;
  let pantryProteinAds = 0;
  let otherNoteAds = 0;
  let forageAds = 0;
  let huntBeatsForage = 0;
  let huntUnderForage = 0;
  let huntWMax = null;
  let forageWMax = null;
  let notes = {};
  let emptyStoreKnownPreyAds = 0;
  let emptyStorePantryAds = 0;
  let preyStoreKnownPreyAds = 0;

  for (const id of rosterOf(Game)) {
    const k = String(id);
    if (k === me || isDead(Game, id)) continue;
    let asg = null;
    try { asg = Game.assignmentFor ? Game.assignmentFor(id) : null; } catch (e) {}
    if (asg && asg.task && asg.task !== 'rest') continue;

    let feed = [];
    try { feed = Game.dutyFeedCands ? (Game.dutyFeedCands(id) || []) : []; } catch (e) { feed = []; }
    const hunt = feed.find(c => c && c.dutyTask === 'hunt');
    const forage = feed.find(c => c && c.dutyTask === 'forage');
    if (forage) {
      forageAds++;
      if (forageWMax == null || forage.w > forageWMax) forageWMax = forage.w;
    }
    if (!hunt) continue;
    huntAds++;
    const note = huntNoteOf(hunt);
    notes[note] = (notes[note] || 0) + 1;
    if (note === 'known_prey') knownPreyAds++;
    else if (note === 'pantry_protein') pantryProteinAds++;
    else otherNoteAds++;
    if (huntWMax == null || hunt.w > huntWMax) huntWMax = hunt.w;
    if (!preyKnown) {
      if (note === 'known_prey') emptyStoreKnownPreyAds++;
      else if (note === 'pantry_protein') emptyStorePantryAds++;
    } else if (note === 'known_prey') {
      preyStoreKnownPreyAds++;
    }
    if (forage) {
      if (hunt.w > forage.w) huntBeatsForage++;
      else huntUnderForage++;
    }
  }

  let logs = [];
  try { logs = Game.vbrainLogs ? (Game.vbrainLogs() || []) : []; } catch (e) { logs = []; }
  const start = acc.logCursor || 0;
  let logHuntAds = 0;
  let logKnownPrey = 0;
  let logPantryProtein = 0;
  let logOther = 0;
  let logHuntPicks = 0;
  let logHuntPicksKnownPrey = 0;
  let logHuntPicksPantry = 0;
  let logDutyTopScore = 0;
  let logDutyTopScoreHunt = 0;
  for (let i = start; i < logs.length; i++) {
    const e = logs[i];
    if (!e) continue;
    acc.logsTotal++;
    const cands = e.candidates || [];
    const huntCands = cands.filter(c => c && (c.kind === 'DUTY' || c.vbrainSrc === 'duty') && c.dutyTask === 'hunt');
    for (const hc of huntCands) {
      const note = huntNoteOf(hc);
      logHuntAds++;
      if (note === 'known_prey') logKnownPrey++;
      else if (note === 'pantry_protein') logPantryProtein++;
      else logOther++;
    }
    if (e.override === 'duty_top_score') logDutyTopScore++;
    // Census-compatible: when DUTY wins, attribute pick to first DUTY cand's
    // dutyTask (same as probe-phase6-role-census-20261108.js).
    if (e.pick === 'DUTY' || e.pickSrc === 'duty') {
      const dutyCands = cands.filter(c => c && (c.kind === 'DUTY' || c.vbrainSrc === 'duty'));
      const firstTask = (dutyCands[0] && dutyCands[0].dutyTask) || null;
      if (firstTask === 'hunt') {
        logHuntPicks++;
        const note = huntNoteOf(dutyCands[0]);
        if (note === 'known_prey') logHuntPicksKnownPrey++;
        else if (note === 'pantry_protein') logHuntPicksPantry++;
      }
      const commitTask = (e.commit && e.commit.dutyTask) || e.dutyTask || e.pickDutyTask || null;
      if (commitTask === 'hunt') logDutyTopScoreHunt++;
    }
  }
  acc.logCursor = logs.length;

  acc.daysSampled++;
  if (vStat.ge1 > 0) acc.daysVillageAnimalsGe1++;
  if (cStat.ge1 > 0) acc.daysCodexAnimalsGe1++;
  if (preyKnown) acc.daysPreyKnown++;
  else acc.daysPreyEmpty++;
  if (huntAds > 0) {
    acc.daysWithHuntFeed++;
    if (!preyKnown) acc.daysHuntAdEmptyStore++;
    else acc.daysHuntAdWithPrey++;
  }
  acc.huntFeedAds += huntAds;
  acc.knownPreyFeedAds += knownPreyAds;
  acc.pantryProteinFeedAds += pantryProteinAds;
  acc.otherNoteFeedAds += otherNoteAds;
  acc.forageFeedAds += forageAds;
  acc.huntBeatsForage += huntBeatsForage;
  acc.huntUnderForage += huntUnderForage;
  acc.emptyStoreKnownPreyAds += emptyStoreKnownPreyAds;
  acc.emptyStorePantryAds += emptyStorePantryAds;
  acc.preyStoreKnownPreyAds += preyStoreKnownPreyAds;
  acc.logHuntAds += logHuntAds;
  acc.logKnownPrey += logKnownPrey;
  acc.logPantryProtein += logPantryProtein;
  acc.logOther += logOther;
  acc.logHuntPicks += logHuntPicks;
  acc.logHuntPicksKnownPrey += logHuntPicksKnownPrey;
  acc.logHuntPicksPantry += logHuntPicksPantry;
  acc.logDutyTopScore += logDutyTopScore;
  acc.logDutyTopScoreHunt += logDutyTopScoreHunt;

  if (huntAds > 0 || logHuntPicks > 0 || preyKnown) {
    acc.daySamples.push({
      day,
      villageAnimalsGe1: vStat.ge1,
      villageAnimalIds: vStat.ids.slice(0, 8),
      codexAnimalsGe1: cStat.ge1,
      codexAnimalIds: cStat.ids.slice(0, 8),
      preyKnown,
      huntAds, knownPreyAds, pantryProteinAds, otherNoteAds, notes,
      forageAds, huntWMax, forageWMax, huntBeatsForage, huntUnderForage,
      emptyStoreKnownPreyAds, emptyStorePantryAds, preyStoreKnownPreyAds,
      logHuntAds, logKnownPrey, logPantryProtein, logOther,
      logHuntPicks, logHuntPicksKnownPrey, logHuntPicksPantry,
      logDutyTopScore, logDutyTopScoreHunt,
    });
  }
}

async function runOne() {
  const seed = parseInt(process.env.SEED || '7', 10);
  const days = parseInt(process.env.DAYS || '80', 10);
  const policyId = process.env.POLICY || DEFAULT_POLICY;
  const outDir = process.env.OUT || path.join(REPO, 'evidence', '2026-11-08', 'hunt-empty-store-classify');
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
    if (!_warned[k]) { _warned[k] = true; console.warn('[huntempty:' + k + ']', (e && e.message) || e); }
  }

  const { Game } = await loadGame({ seed, mode: 'mvc', fullTelemetry: true });
  await setupGame(Game);
  const ctx = { policyId: policy.id || policyId, notes: [] };
  if (policy.setup) { try { await policy.setup(Game, ctx); } catch (e) { warnOnce('setup', e); } }

  const acc = {
    logCursor: 0, logsTotal: 0,
    daysSampled: 0, daysVillageAnimalsGe1: 0, daysCodexAnimalsGe1: 0,
    daysPreyKnown: 0, daysPreyEmpty: 0,
    daysWithHuntFeed: 0, daysHuntAdEmptyStore: 0, daysHuntAdWithPrey: 0,
    huntFeedAds: 0, knownPreyFeedAds: 0, pantryProteinFeedAds: 0, otherNoteFeedAds: 0,
    forageFeedAds: 0, huntBeatsForage: 0, huntUnderForage: 0,
    emptyStoreKnownPreyAds: 0, emptyStorePantryAds: 0, preyStoreKnownPreyAds: 0,
    logHuntAds: 0, logKnownPrey: 0, logPantryProtein: 0, logOther: 0,
    logHuntPicks: 0, logHuntPicksKnownPrey: 0, logHuntPicksPantry: 0,
    logDutyTopScore: 0, logDutyTopScoreHunt: 0,
    daySamples: [],
  };

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

  let classifyHint = 'INCONCLUSIVE';
  if (acc.emptyStoreKnownPreyAds > 0) classifyHint = 'HUNT_EMPTY_STORE_AD_BUG';
  else if (acc.knownPreyFeedAds > 0 && acc.logHuntPicks === 0 && acc.huntBeatsForage > 0) {
    classifyHint = 'HUNT_EMPTY_STORE_PICK_BUG';
  } else if (
    acc.huntFeedAds > 0 &&
    acc.knownPreyFeedAds === 0 &&
    acc.emptyStoreKnownPreyAds === 0 &&
    acc.logHuntPicks === 0 &&
    (acc.pantryProteinFeedAds === acc.huntFeedAds || acc.emptyStorePantryAds === acc.huntFeedAds) &&
    acc.huntUnderForage >= acc.huntBeatsForage
  ) {
    classifyHint = 'HUNT_EMPTY_STORE_HONEST_OPP';
  } else if (acc.knownPreyFeedAds > 0 && acc.logHuntPicks > 0) {
    classifyHint = 'CONTROL_KNOWN_PREY_PICKS';
  }

  const out = {
    seed, policy: policyId, days, endDay: nowDay(Game), gameOver: !!Game.over,
    commit: shaFull(), tipLabel: sha12(),
    startVillageAnimalsGe1: startVillage.ge1, startCodexAnimalsGe1: startCodex.ge1,
    endVillageAnimalsGe1: endVillage.ge1, endCodexAnimalsGe1: endCodex.ge1,
    endVillageAnimalIds: endVillage.ids, endCodexAnimalIds: endCodex.ids.slice(0, 12),
    classifyHint,
    acc,
  };
  fs.mkdirSync(outDir, { recursive: true });
  const fname = `huntempty-${policyId}-seed${seed}.json`;
  fs.writeFileSync(path.join(outDir, fname), JSON.stringify(out));
  console.log(JSON.stringify({
    ok: true, seed, policy: policyId, endDay: out.endDay, gameOver: out.gameOver,
    tip: out.tipLabel, classifyHint,
    huntFeedAds: acc.huntFeedAds,
    knownPrey: acc.knownPreyFeedAds,
    pantryProtein: acc.pantryProteinFeedAds,
    emptyStoreKnownPreyAds: acc.emptyStoreKnownPreyAds,
    emptyStorePantryAds: acc.emptyStorePantryAds,
    daysPreyEmpty: acc.daysPreyEmpty,
    daysPreyKnown: acc.daysPreyKnown,
    daysHuntAdEmptyStore: acc.daysHuntAdEmptyStore,
    huntBeatsForage: acc.huntBeatsForage,
    huntUnderForage: acc.huntUnderForage,
    logHuntAds: acc.logHuntAds,
    logHuntPicks: acc.logHuntPicks,
    logDutyTopScoreHunt: acc.logDutyTopScoreHunt,
    endVillageAnimalsGe1: endVillage.ge1,
    endCodexAnimalsGe1: endCodex.ge1,
    daySamples: acc.daySamples.length,
    file: fname,
  }));
}

function parseList(s, fallback) {
  return (s || fallback).split(',').map(x => x.trim()).filter(Boolean);
}

function runDriver() {
  const seeds = parseList(process.env.SEEDS, DEFAULT_SEEDS).map(s => parseInt(s, 10));
  const policy = process.env.POLICY || DEFAULT_POLICY;
  const days = process.env.DAYS || '80';
  const outDir = process.env.OUT || path.join(REPO, 'evidence', '2026-11-08', 'hunt-empty-store-classify');
  const par = Math.max(1, parseInt(process.env.PAR || '2', 10));
  fs.mkdirSync(outDir, { recursive: true });

  const jobs = seeds.map(seed => ({ policy, seed }));
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
    const bySeed = {};
    for (const r of results) bySeed[String(r.seed)] = r;
    const residual = bySeed['7'] || results.find(r => r.seed === 7) || null;
    const control = bySeed['5'] || bySeed['42'] || results.find(r => r.seed !== 7) || null;

    let verdict = 'INCONCLUSIVE';
    let reason = 'missing residual or control case';
    if (residual) {
      if ((residual.emptyStoreKnownPreyAds || 0) > 0) {
        verdict = 'HUNT_EMPTY_STORE_AD_BUG';
        reason = 'hunt ads tagged known_prey while both prey stores empty';
      } else if (
        (residual.knownPrey || 0) > 0 &&
        (residual.logHuntPicks || 0) === 0 &&
        (residual.huntBeatsForage || 0) > 0
      ) {
        verdict = 'HUNT_EMPTY_STORE_PICK_BUG';
        reason = 'known_prey ads beat forage but never duty_top_score-committed hunt';
      } else if (
        (residual.huntFeedAds || 0) > 0 &&
        (residual.knownPrey || 0) === 0 &&
        (residual.emptyStoreKnownPreyAds || 0) === 0 &&
        (residual.logHuntPicks || 0) === 0 &&
        (residual.pantryProtein || 0) === (residual.huntFeedAds || 0) &&
        (residual.huntUnderForage || 0) >= (residual.huntBeatsForage || 0)
      ) {
        verdict = 'HUNT_EMPTY_STORE_HONEST_OPP';
        reason = 'empty-store hunt ads are soft pantry_protein under forage; picks correctly absent';
      } else {
        reason = 'residual counters did not match a clean label; inspect daySamples';
      }
    }

    const summary = {
      tip: sha12(), commit: shaFull(),
      days: parseInt(days, 10), seeds, policy, cases: results.length, failed,
      verdict, reason,
      residual, control,
      bySeed,
    };
    fs.writeFileSync(path.join(outDir, 'summary.json'), JSON.stringify(summary, null, 2));
    console.log(JSON.stringify({
      summary: true, tip: summary.tip, cases: summary.cases, failed,
      verdict, reason,
      residual: residual && {
        seed: residual.seed, classifyHint: residual.classifyHint,
        huntFeedAds: residual.huntFeedAds, knownPrey: residual.knownPrey,
        pantryProtein: residual.pantryProtein,
        emptyStoreKnownPreyAds: residual.emptyStoreKnownPreyAds,
        logHuntPicks: residual.logHuntPicks,
        endCodexAnimalsGe1: residual.endCodexAnimalsGe1,
        endVillageAnimalsGe1: residual.endVillageAnimalsGe1,
      },
      control: control && {
        seed: control.seed, classifyHint: control.classifyHint,
        huntFeedAds: control.huntFeedAds, knownPrey: control.knownPrey,
        pantryProtein: control.pantryProtein,
        logHuntPicks: control.logHuntPicks,
        endCodexAnimalsGe1: control.endCodexAnimalsGe1,
        endVillageAnimalsGe1: control.endVillageAnimalsGe1,
      },
    }));
    process.exit(failed ? 1 : 0);
  }

  launch();
}

if (process.argv.indexOf('--one') >= 0) {
  runOne().catch(e => { console.error(e); process.exit(1); });
} else {
  runDriver();
}
