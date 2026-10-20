#!/usr/bin/env node
// scripts/justiceladder-census-20261020.js — JUSTICE-LADDER WALKTHROUGH census.
//
// Backlog #79's named next (evidence/2026-10-14/sim-intraviol.md): the lethal
// justice lane NEVER fired in sims (0 betrayal ambushes, 0 uprisings, 0 moot
// executions across 24 runs). This arm walks the justice ladder rung by rung
// under the larceny-leaning policy (scripts/policies/larceny-leaning.js,
// competent base + steals when hungry and on day%5==0 schedule) with the
// PROVEN intraviol census instrument (scripts/intraviol-census-20261014.js,
// 37/37 proof) to observe whether moot verdicts / the lethal justice lane fire.
//
// REACHABILITY/DIAGNOSTIC arm: no balance layer to land. GO = the content is
// reachable (a moot verdict fires); NO-GO = decoration on the courtship road.
//
// INSTRUMENT-ONLY additions here (the ladder observer): pure harness-side
// wrappers — justiceTick snapshots, stealFrom outcome log, justiceDemandMoot /
// syncJusticeAfterMoot / startVillageUprising / exilePlayer / simNpcAmbush
// event logs, justice-adjacent say-line capture. No RNG consumed, no game
// state mutated; the intraviol instrument is REQUIRED UNCHANGED from the
// proven script (37/37 proof stays valid).
//
// The ladder rungs (src/js/justice.js justiceTick):
//   Rung A — crime booked: theft crime(s) in j.crimes (caught or noticed-later)
//   Rung B — cold shoulder: stage >= 1 (heat >= 25)
//   Rung C — confrontation: stage >= 2 (heat >= 50, confrontedBy set)
//   Rung D — moot: stage >= 3, moot demanded, then a VERDICT (syncJusticeAfterMoot
//            path: acquitted / weregild / schism / cold_war / player_exile / fled)
//   Rung E — lethal lane: stage 4 -> startVillageUprising('defied exile' or
//            'unforgivable'), or an NPC betrayal ambush death, or any
//            villager-on-villager death.
//
// Usage:
//   node scripts/justiceladder-census-20261020.js
//     OUT=evidence/2026-10-20/sim-justiceladder-20261020.json
//   SEEDS="11,22" POLICIES="larceny-leaning" — filters
//     (default: 8 seeds x {larceny-leaning, leadcourt})
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { attachIntraviol, buildRefs, classifyRecord, isVillagerOnVillager } = require('./intraviol-census-20261014');
const { larcenyLeaning } = require('./policies/larceny-leaning');
const { leadcourt } = require('./policies/leadcourt');

const POLICY_REGISTRY = { 'larceny-leaning': larcenyLeaning, leadcourt };
const DEFAULT_SEEDS = [11, 22, 33, 44, 55, 66, 77, 88];
const DAYS = 180; // death-aware: runDays stops at pop-zero (same as the intraviol census)

// RESUME/CHECKPOINT: after each run its row is appended to the checkpoint
// JSONL; on restart, completed (policy,seed) pairs are skipped. Survives
// service restarts (never /tmp — the 2026-10-14 wipe lesson).
const CHECKPOINT = process.env.JL_CHECKPOINT ||
  'evidence/2026-10-20/sim-justiceladder-20261020-checkpoint.jsonl';
function loadCheckpoint() {
  const rows = [], done = new Set();
  try {
    const p = path.resolve(CHECKPOINT);
    if (fs.existsSync(p)) {
      for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
        const t = line.trim();
        if (!t) continue;
        try {
          const r = JSON.parse(t);
          rows.push(r);
          done.add(r.policy + ':' + r.seed);
        } catch (e) {}
      }
    }
  } catch (e) {}
  return { rows, done };
}

const _seedF = (process.env.SEEDS || '').split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
const _polF = (process.env.POLICIES || '').split(',').map(s => s.trim()).filter(Boolean);

const JUSTICE_RE = /moot|justice|exil|confront|uprising|theft|steal|stolen|trial|verdict|weregild|cold shoulder|ambush|traitor|grievance|suspicion|ransom|reparations|amends/i;

function dayOf(Game) { try { return (((Game.state || {}).scholar || {}).day || 0); } catch (e) { return -1; } }

function snapLadder(Game) {
  const s = { stage: -9, heat: -9, crimes: 0, thefts: 0, murders: 0, mootDemanded: false, caseOpen: null, exiled: false };
  try {
    const j = Game.justiceState ? Game.justiceState() : null;
    if (j) {
      s.stage = (typeof j.stage === 'number') ? j.stage : 0;
      s.crimes = (j.crimes || []).length;
      for (const c of (j.crimes || [])) {
        if (c.type === 'theft') s.thefts++;
        else if (c.type === 'murder') s.murders++;
      }
      s.mootDemanded = !!j.mootDemanded;
      s.exiled = !!j.exiled;
    }
  } catch (e) {}
  try { s.heat = Game.justiceHeat ? Game.justiceHeat() : -1; } catch (e) {}
  try { s.caseOpen = Game.playerCaseOpen ? !!Game.playerCaseOpen() : null; } catch (e) {}
  return s;
}

function sigOf(s) {
  return [s.stage, s.heat, s.crimes, s.mootDemanded ? 1 : 0, s.caseOpen ? 1 : 0, s.exiled ? 1 : 0].join('|');
}

// attachJusticeLadder(Game) — pure observer wrappers. Returns the api object.
// Consumes no RNG; mutates no game state; all records live on Game._justladder.
function attachJusticeLadder(Game) {
  if (Game._justladder) return Game._justladder;
  const api = {
    ladder: [],        // {day, ...snap} on tuple-change or day-change (cap 2000)
    steals: [],        // {day, mark, result}
    mootDemands: [],   // {day}
    verdicts: [],     // {day, path}
    uprisings: [],     // {day, reason}
    exiles: [],        // {day, how}
    npcAmbushes: [],   // {day, target, leader, accomplices}
    lines: [],         // justice-adjacent transcript (cap 600)
  };
  let lastSig = null, lastDay = null;
  function maybeSnap() {
    try {
      const d = dayOf(Game), s = snapLadder(Game), sig = sigOf(s);
      if (sig !== lastSig || d !== lastDay) {
        lastSig = sig; lastDay = d;
        if (api.ladder.length < 2000) api.ladder.push(Object.assign({ day: d }, s));
      }
    } catch (e) {}
  }
  const wrap = (name, after) => {
    const orig = Game[name];
    if (typeof orig !== 'function') return;
    Game[name] = function () {
      const r = orig.apply(this, arguments);
      try { after.call(this, r, arguments); } catch (e) {}
      return r;
    };
  };
  wrap('justiceTick', function () { maybeSnap(); });
  wrap('stealFrom', function (r, args) {
    if (api.steals.length < 500) api.steals.push({ day: dayOf(Game), mark: (args && args[0]) || null, result: (typeof r === 'string') ? r : (r === false ? 'false' : 'other') });
  });
  wrap('justiceDemandMoot', function () {
    if (api.mootDemands.length < 50) api.mootDemands.push({ day: dayOf(Game) });
  });
  wrap('syncJusticeAfterMoot', function (r, args) {
    if (api.verdicts.length < 50) api.verdicts.push({ day: dayOf(Game), path: String((args && args[0]) || '?').slice(0, 32) });
  });
  wrap('startVillageUprising', function (r, args) {
    if (api.uprisings.length < 50) api.uprisings.push({ day: dayOf(Game), reason: String((args && args[0]) || '?').slice(0, 48) });
  });
  wrap('exilePlayer', function (r, args) {
    if (api.exiles.length < 50) api.exiles.push({ day: dayOf(Game), how: String((args && args[0]) || '?').slice(0, 32) });
  });
  wrap('simNpcAmbush', function (r, args) {
    try {
      const p = (args && args[0]) || {};
      if (api.npcAmbushes.length < 50) api.npcAmbushes.push({
        day: dayOf(Game),
        target: String(p.target || '?').slice(0, 32),
        leader: String(p.leader || '?').slice(0, 32),
        accomplices: (p.accomplices || []).length,
      });
    } catch (e) {}
  });
  const oSay = Game.say;
  if (typeof oSay === 'function') {
    Game.say = function (line) {
      const r = oSay.apply(this, arguments);
      try {
        const s = String(line == null ? '' : line);
        if (JUSTICE_RE.test(s) && api.lines.length < 600) api.lines.push({ day: dayOf(Game), line: s.slice(0, 220) });
      } catch (e) {}
      return r;
    };
  }
  Game._justladder = api;
  return api;
}

function rungMilestones(api) {
  const m = { crimeDay: null, stage1Day: null, stage2Day: null, stage3Day: null, stage4Day: null,
              maxStage: 0, maxHeat: 0, maxThefts: 0, maxMurders: 0, mootDemands: api.mootDemands.length,
              verdicts: api.verdicts.map(v => v.path), uprisings: api.uprisings.length,
              npcAmbushes: api.npcAmbushes.length, exiles: api.exiles.length, steals: api.steals.length,
              stealsCaught: api.steals.filter(s => s.result === 'caught').length,
              stealsUnseen: api.steals.filter(s => s.result === 'unseen').length };
  for (const t of api.ladder) {
    if (t.stage > m.maxStage) m.maxStage = t.stage;
    if (t.heat > m.maxHeat) m.maxHeat = t.heat;
    if (t.thefts > m.maxThefts) m.maxThefts = t.thefts;
    if (t.murders > m.maxMurders) m.maxMurders = t.murders;
    if (m.crimeDay == null && t.thefts > 0) m.crimeDay = t.day;
    if (m.stage1Day == null && t.stage >= 1) m.stage1Day = t.day;
    if (m.stage2Day == null && t.stage >= 2) m.stage2Day = t.day;
    if (m.stage3Day == null && t.stage >= 3) m.stage3Day = t.day;
    if (m.stage4Day == null && t.stage >= 4) m.stage4Day = t.day;
  }
  return m;
}

async function main() {
  const t0 = Date.now();
  const seeds = _seedF.length ? _seedF : DEFAULT_SEEDS;
  const pids = _polF.length ? _polF : Object.keys(POLICY_REGISTRY);
  const rows = [];
  const ck = loadCheckpoint();
  for (const r of ck.rows) rows.push(r);
  if (ck.done.size) console.log('checkpoint: resuming, ' + ck.done.size + ' runs already done');
  for (const pid of pids) {
    const base = POLICY_REGISTRY[pid];
    if (!base) { console.error('unknown policy ' + pid); process.exit(2); }
    delete process.env.FEASTSCALE_R13;
    for (const seed of seeds) {
      if (ck.done.has(pid + ':' + seed)) { console.log('  [skip ' + pid + ' s' + seed + '] in checkpoint'); continue; }
      const { Game } = await loadGame({ seed, mode: 'justladder-' + pid, fullTelemetry: true });
      await setupGame(Game);
      const iv = attachIntraviol(Game);          // PROVEN instrument, unchanged
      const jl = attachJusticeLadder(Game);      // new ladder observer
      try { iv.initialRoster = (((Game.state || {}).village || {}).roster || []).slice(); } catch (e) {}
      const result = await runDays(Game, base, { days: DAYS, sampleEvery: 30 });
      const refs = buildRefs(Game);
      const deaths = iv.log.map(rec => Object.assign({}, rec, classifyRecord(rec, refs)));
      const vv = deaths.filter(d => isVillagerOnVillager(d));
      const m = rungMilestones(jl);
      let national = false, table = false, won = false, maxWaveUnlocked = 1;
      try { national = ['national', 'global'].includes(Game.scaleRank ? Game.scaleRank() : 'village'); } catch (e) {}
      try { table = !!(((Game.state || {}).table || {}).seat || ((Game.state || {}).table || {}).waiting); } catch (e) {}
      try { won = !!Game.won; } catch (e) {}
      try { maxWaveUnlocked = Game.unlockedWave ? Game.unlockedWave() : 1; } catch (e) {}
      const row = {
        label: 'justiceladder-20261020', policy: pid, seed,
        days: result.days, endReason: result.endReason,
        national, table, won, maxWaveUnlocked,
        deathTotal: deaths.length,
        villagerDeaths: deaths.filter(d => d.victimKind === 'villager').length,
        playerDeaths: deaths.filter(d => d.victimKind === 'player-vessel').length,
        vvDeaths: vv.length,
        ladder: m,
        justiceLines: jl.lines,
        ladderSeries: jl.ladder,
        npcAmbushEvents: jl.npcAmbushes,
        uprisingEvents: jl.uprisings,
        verdictEvents: jl.verdicts,
        mootDemandEvents: jl.mootDemands,
        exileEvents: jl.exiles,
        stealEvents: jl.steals,
        deaths, sayLines: iv.sayLines,
      };
      rows.push(row);
      try { fs.appendFileSync(path.resolve(CHECKPOINT), JSON.stringify(row) + '\n'); } catch (e) { console.error('checkpoint write failed: ' + e.message); }
      console.log(`  [${pid} s${seed}] d=${row.days} ${row.endReason} ` +
        `stage${m.maxStage} thefts=${m.maxThefts} moots=${m.mootDemands} verdicts=[${m.verdicts.join(',')}] ` +
        `uprisings=${m.uprisings} npcAmbush=${m.npcAmbushes} vv=${row.vvDeaths} nat=${national} w${maxWaveUnlocked}`);
    }
  }
  const agg = { byPolicy: {} };
  for (const r of rows) {
    const p = agg.byPolicy[r.policy] || (agg.byPolicy[r.policy] = { runs: 0, rungA: 0, rungB: 0, rungC: 0, rungD: 0, rungE: 0,
      mootDemands: 0, verdictPaths: {}, uprisings: 0, npcAmbushes: 0, vvDeaths: 0, nationals: 0, tables: 0, wins: 0,
      wave4: 0, wave5: 0, survivals: [] });
    p.runs++;
    const m = r.ladder;
    if (m.maxThefts > 0) p.rungA++;
    if (m.maxStage >= 1) p.rungB++;
    if (m.maxStage >= 2) p.rungC++;
    if (m.verdicts.length > 0) p.rungD++;
    if (m.uprisings > 0 || r.npcAmbushEvents.length > 0 || r.vvDeaths > 0) p.rungE++;
    p.mootDemands += m.mootDemands;
    for (const v of m.verdicts) p.verdictPaths[v] = (p.verdictPaths[v] || 0) + 1;
    p.uprisings += m.uprisings;
    p.npcAmbushes += m.npcAmbushes;
    p.vvDeaths += r.vvDeaths;
    if (r.national) p.nationals++;
    if (r.table) p.tables++;
    if (r.won) p.wins++;
    if (r.maxWaveUnlocked >= 4) p.wave4++;
    if (r.maxWaveUnlocked >= 5) p.wave5++;
    p.survivals.push(r.days);
  }
  for (const k of Object.keys(agg.byPolicy)) {
    const p = agg.byPolicy[k];
    p.survivals.sort((a, b) => a - b);
    p.medianSurvival = p.survivals[Math.floor(p.survivals.length / 2)];
  }
  const rep = { label: 'justiceladder-20261020', seeds, policies: pids, days: DAYS, runs: rows.length, agg, rows, ms: Date.now() - t0 };
  console.log('\n=== JUSTICELADDER ===');
  for (const k of Object.keys(agg.byPolicy)) {
    const p = agg.byPolicy[k];
    console.log(`  ${k}: runs=${p.runs} A=${p.rungA} B=${p.rungB} C=${p.rungC} D=${p.rungD} E=${p.rungE} ` +
      `verdicts=${JSON.stringify(p.verdictPaths)} uprisings=${p.uprisings} npcAmbush=${p.npcAmbushes} vv=${p.vvDeaths} ` +
      `nat=${p.nationals} table=${p.tables} wins=${p.wins} med=${p.medianSurvival}`);
  }
  const out = process.env.OUT || 'evidence/2026-10-20/sim-justiceladder-20261020.json';
  fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
  fs.writeFileSync(path.resolve(out), JSON.stringify(rep, null, 1));
  console.error('wrote ' + out);
  if (!_seedF.length && !_polF.length) {
    try { fs.unlinkSync(path.resolve(CHECKPOINT)); console.error('checkpoint cleared (full sweep complete)'); } catch (e) {}
  }
}

if (require.main === module) {
  main().catch(e => { console.error('FATAL', e); process.exit(1); });
}

module.exports = { attachJusticeLadder, snapLadder, rungMilestones };
