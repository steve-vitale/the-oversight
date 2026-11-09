#!/usr/bin/env node
// probe-phase6-role-census-20261108b.js — VILLAGER-BRAIN Phase 6 §8 re-census
// Matched panel after hunt DUTY dawn picks (OVE-76 / PR #59 @ ae3fb87c3).
// Same 16-seed capable/competent shape as #49 / OVE-72 / OVE-73 / OVE-75.
// Measurement only — no Game/policy edits. Muse off.
//
// Extends 20261108 sampling with pickOverride tallies (duty_top_score) so
// the after-panel can prove ads→picks without inventing new harness shape.
// OUT path is set per arm via DEFAULT_OUT / OUT (this arm: after-hunt-pick).
//
// Harness rule: one loadGame per process — driver spawns one child per
// (policy, seed).
//
// Usage:
//   SEEDS=7,42,99,1234,555,777,2026,31337,1,2,3,4,5,6,8,9 \
//     POLICIES=capable,competent DAYS=80 PAR=4 \
//     OUT=evidence/2026-11-08/phase6-role-census-after-hunt-pick \
//     node scripts/probe-phase6-role-census-20261108b.js
//   POLICY=capable SEED=7 DAYS=80 node scripts/probe-phase6-role-census-20261108b.js --one
'use strict';
const path = require('path');
const fs = require('fs');
const { spawn, execSync } = require('child_process');
const REPO = path.join(__dirname, '..');

const DEFAULT_SEEDS = '7,42,99,1234,555,777,2026,31337,1,2,3,4,5,6,8,9';
const DEFAULT_POLICIES = 'capable,competent';
const DEFAULT_OUT = path.join(REPO, 'evidence', '2026-11-08', 'phase6-role-census-after-hunt-pick');
const TASKS = ['hunt', 'forage', 'garden', 'fish', 'wood', 'stone', 'deadfall', 'water', 'scout', 'patrol', 'cook', 'tend', 'teach', 'mend'];
const SPECS = ['butcher', 'cook', 'preserver', 'spotter', 'builder'];
const TRACKS = ['combat', 'field', 'social', 'craft', 'strange'];

function shaFull() {
  try { return execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim(); }
  catch (e) { return 'unknown'; }
}
function sha12() { return shaFull().slice(0, 12); }

function nowDay(Game) {
  try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; }
}
function nameOf(Game, id) {
  try { return Game.displayName(id); } catch (e) { return String(id); }
}
function isDead(Game, id) {
  try { return !!(Game.getPerson(id) || {}).dead; } catch (e) { return false; }
}
function rosterOf(Game) {
  try { return ((Game.state.village || {}).roster || []).slice(); } catch (e) { return []; }
}

function wallSnap(Game) {
  const out = { won: false, arc: 1, rank: 'village', tableWaiting: false, tableEntered: false };
  try { out.won = !!Game.won; } catch (e) {}
  try {
    const pg = Game.progState ? Game.progState() : {};
    out.arc = pg.arc || 1;
    out.tableWaiting = !!pg.tableWaiting;
    out.tableEntered = !!pg.tableDone;
  } catch (e) {}
  try { out.rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) {}
  return out;
}
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

function snapVillager(Game, id) {
  const out = { id: String(id) };
  try { out.name = nameOf(Game, id); } catch (e) { out.name = String(id); }
  let p = null;
  try { p = Game.getPerson ? Game.getPerson(id) : null; } catch (e) {}
  out.occ = (p && (p.formerOccupation || p.occupation)) || '?';
  out.occupationId = (p && p.occupationId) || null;
  out.temperament = (p && p.personality && p.personality.temperament) || null;
  out.dead = isDead(Game, id);
  out.competence = {};
  for (const t of TASKS) {
    try { out.competence[t] = Game.villagerCompetence(id, t); }
    catch (e) { out.competence[t] = null; }
  }
  out.specialist = {};
  for (const t of SPECS) {
    try { out.specialist[t] = Game.specialistSkill ? Game.specialistSkill(p || {}, t) : null; }
    catch (e) { out.specialist[t] = null; }
  }
  out.foodXp = {};
  try {
    const vp = (Game.villagePeople ? Game.villagePeople() : []).find(x => String(x.id) === String(id));
    const fx = (vp && vp._src && vp._src.foodXp) || {};
    for (const t of SPECS) out.foodXp[t] = fx[t] || 0;
  } catch (e) {}
  out.practice = {};
  try {
    const pr = (p && p.practice) || {};
    for (const t of TASKS) out.practice[t] = pr[t] || 0;
  } catch (e) {}
  try {
    const vp = (Game.villagePeople ? Game.villagePeople() : []).find(x => String(x.id) === String(id));
    const pr2 = (vp && vp._src && vp._src.practice) || {};
    for (const t of TASKS) if (!out.practice[t] && pr2[t]) out.practice[t] = pr2[t];
  } catch (e) {}
  try {
    const rec = ((Game.state.village || {}).npcXp || {})[id] || null;
    out.tracks = rec
      ? {
          xp: Object.fromEntries(TRACKS.map(t => [t, rec[t] || 0])),
          granted: Object.assign({}, rec.granted || {}),
          skilled: Object.assign({}, rec.skilled || {}),
        }
      : null;
  } catch (e) { out.tracks = null; }
  try { out.npcSkills = (((Game.state.village || {}).npcSkills || {})[id] || []).slice(); }
  catch (e) { out.npcSkills = []; }
  try { out.npcAbilities = (((Game.state.village || {}).npcAbilities || {})[id] || []).slice(); }
  catch (e) { out.npcAbilities = []; }
  try {
    const nk = ((Game.state.village || {}).npcKnow || {})[id] || {};
    out.npcKnow = Object.keys(nk);
  } catch (e) { out.npcKnow = []; }
  return out;
}

function sampleDutyLogs(Game, duty) {
  let logs = [];
  try { logs = Game.vbrainLogs ? (Game.vbrainLogs() || []) : []; } catch (e) { return; }
  const start = duty.logCursor || 0;
  for (let i = start; i < logs.length; i++) {
    const e = logs[i];
    if (!e) continue;
    duty.logsTotal++;
    const cands = e.candidates || [];
    const dutyCands = cands.filter(c => c && (c.kind === 'DUTY' || c.vbrainSrc === 'duty'));
    if (dutyCands.length) {
      duty.adEvents++;
      duty.adCandCount += dutyCands.length;
      for (const c of dutyCands) {
        const t = c.dutyTask || '?';
        duty.adByTask[t] = (duty.adByTask[t] || 0) + 1;
      }
      duty.adSamples.push({
        day: e.day, vid: e.vid, pick: e.pick, pickSrc: e.pickSrc,
        override: e.override || null, corePick: e.corePick || null,
        dutyTasks: dutyCands.map(c => c.dutyTask || '?'),
        dutyScores: dutyCands.map(c => c.score),
      });
      if (duty.adSamples.length > 40) duty.adSamples.shift();
    }
    if (e.pick === 'DUTY' || e.pickSrc === 'duty') {
      duty.pickEvents++;
      const dt = (dutyCands[0] && dutyCands[0].dutyTask) || null;
      if (dt) duty.pickByTask[dt] = (duty.pickByTask[dt] || 0) + 1;
      const ov = e.override || 'none';
      duty.pickByOverride[ov] = (duty.pickByOverride[ov] || 0) + 1;
      if (ov === 'duty_top_score') duty.dutyTopScorePicks++;
    }
  }
  duty.logCursor = logs.length;

  // Opportunity: unassigned villagers with dutyFeedCands non-empty today.
  try {
    const day = nowDay(Game);
    const me = String(Game.villagerId);
    let opp = 0, unassigned = 0, assigned = 0;
    for (const id of rosterOf(Game)) {
      const k = String(id);
      if (k === me || isDead(Game, id)) continue;
      let asg = null;
      try {
        asg = Game.assignmentFor ? Game.assignmentFor(id) : null;
      } catch (e) {}
      const task = asg && asg.task;
      if (task && task !== 'rest') { assigned++; continue; }
      unassigned++;
      let feed = [];
      try { feed = Game.dutyFeedCands ? (Game.dutyFeedCands(id) || []) : []; } catch (e) {}
      if (feed.length) {
        opp++;
        for (const c of feed) {
          const t = c.dutyTask || '?';
          duty.oppByTask[t] = (duty.oppByTask[t] || 0) + 1;
        }
      }
    }
    duty.dailyOpp.push({ day, unassigned, assigned, oppWithDutyFeed: opp });
    if (opp > 0) duty.daysWithOpp++;
    duty.daysSampled++;
  } catch (e) {}
}

async function runOne() {
  const seed = parseInt(process.env.SEED || '7', 10);
  const days = parseInt(process.env.DAYS || '80', 10);
  const policyId = process.env.POLICY || 'capable';
  const outDir = process.env.OUT || DEFAULT_OUT;
  const { loadGame, setupGame, driveFights, driveContests } = require('./sim-harness');
  let policy;
  try { policy = require('./policies/' + policyId); }
  catch (e) {
    console.error('unknown policy', policyId, e.message);
    process.exit(2);
  }
  // policies export either the object or {capable}/{competent}
  if (policy && policy.id !== policyId) {
    if (policy[policyId]) policy = policy[policyId];
    else if (policy.default) policy = policy.default;
  }

  const _warned = {};
  function warnOnce(k, e) {
    if (!_warned[k]) { _warned[k] = true; console.warn('[p6role:' + k + ']', (e && e.message) || e); }
  }

  const { Game } = await loadGame({ seed, mode: 'mvc', fullTelemetry: true });
  await setupGame(Game);
  const ctx = { policyId: policy.id || policyId, notes: [] };
  if (policy.setup) { try { await policy.setup(Game, ctx); } catch (e) { warnOnce('setup', e); } }

  const resolved = [];
  const assigned = [];
  const deeds = [];
  const practiceLines = [];
  const duty = {
    logCursor: 0, logsTotal: 0, adEvents: 0, adCandCount: 0, pickEvents: 0,
    dutyTopScorePicks: 0, adByTask: {}, pickByTask: {}, pickByOverride: {},
    oppByTask: {}, daysSampled: 0, daysWithOpp: 0, dailyOpp: [], adSamples: [],
  };

  if (typeof Game.resolveOneAssignment === 'function') {
    const _r = Game.resolveOneAssignment.bind(Game);
    const _depth = {}, _lastTask = {};
    Game.resolveOneAssignment = function (vid, a) {
      const k = String(vid);
      _depth[k] = (_depth[k] || 0) + 1;
      _lastTask[k] = String((a && a.task) || '?');
      try { return _r.apply(this, arguments); }
      finally {
        _depth[k]--;
        if (_depth[k] <= 0) {
          try { resolved.push({ day: nowDay(Game), vid: k, task: _lastTask[k] }); } catch (e) {}
          delete _depth[k];
        }
      }
    };
  }
  if (typeof Game.assignTask === 'function') {
    const _a = Game.assignTask.bind(Game);
    Game.assignTask = function (vid, task, opts) {
      const r = _a.apply(this, arguments);
      try {
        assigned.push({
          day: nowDay(Game), vid: String(vid), task: String(task),
          ok: !!(r && r.ok), via: (opts && opts.via) || null,
        });
      } catch (e) {}
      return r;
    };
  }
  if (typeof Game.creditDeed === 'function') {
    const _d = Game.creditDeed.bind(Game);
    Game.creditDeed = function (who, deedId) {
      const r = _d.apply(this, arguments);
      try { deeds.push({ day: nowDay(Game), who: String(who), deed: String(deedId) }); } catch (e) {}
      return r;
    };
  }
  if (typeof Game.say === 'function') {
    const _s = Game.say.bind(Game);
    Game.say = function (msg) {
      try {
        if (typeof msg === 'string' && /getting the hang/i.test(msg)) {
          practiceLines.push({ day: nowDay(Game), line: msg });
        }
      } catch (e) {}
      return _s.apply(this, arguments);
    };
  }

  const startSnap = {};
  for (const id of rosterOf(Game)) startSnap[String(id)] = snapVillager(Game, id);
  const startRoster = rosterOf(Game).map(String);
  const playerId = String(Game.villagerId);
  const wall = { maxRank: 0, maxArc: 1, everTable: false, everEntered: false, everWon: false };
  const daily = [];
  const seenDays = {};
  const firstSeen = {};
  const lastSeen = {};
  const scholarIds = [String(Game.villagerId)];
  const periodicSnap = {};
  let prevLeads = null;
  let deadTail = 0;

  for (let d = 1; d <= days; d++) {
    for (const id of rosterOf(Game)) {
      const k = String(id);
      seenDays[k] = (seenDays[k] || 0) + 1;
      if (firstSeen[k] == null) firstSeen[k] = nowDay(Game);
      lastSeen[k] = nowDay(Game);
    }
    try {
      const sv = String(Game.villagerId);
      if (scholarIds.indexOf(sv) < 0) scholarIds.push(sv);
    } catch (e) {}
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

    // After dawn settle: sample duty ads/picks + opportunity.
    sampleDutyLogs(Game, duty);

    let leads = null;
    try { leads = Object.assign({}, ((Game.state.village || {}).taskLeads || {})); }
    catch (e) { leads = {}; }
    const changed = prevLeads === null ? false : (JSON.stringify(leads) !== JSON.stringify(prevLeads));
    prevLeads = leads;
    const roster = rosterOf(Game);
    const w = wallSnap(Game);
    wall.maxRank = Math.max(wall.maxRank, RANK_ORDER[w.rank] || 0);
    wall.maxArc = Math.max(wall.maxArc, w.arc || 1);
    if (w.tableWaiting) wall.everTable = true;
    if (w.tableEntered) wall.everEntered = true;
    if (w.won) wall.everWon = true;
    daily.push({
      day: nowDay(Game),
      alive: roster.filter(id => !isDead(Game, id)).length,
      rosterN: roster.length,
      taskLeads: leads,
      leadsChanged: changed,
      over: !!Game.over,
      scholarId: String(Game.villagerId),
      rosterIds: roster.map(String),
    });
    if ([30, 60].indexOf(nowDay(Game)) >= 0) {
      periodicSnap[nowDay(Game)] = {};
      for (const id of roster) {
        try { periodicSnap[nowDay(Game)][String(id)] = snapVillager(Game, id); } catch (e) {}
      }
    }
    const alive = roster.filter(id => !isDead(Game, id)).length;
    if (alive === 0) { deadTail++; if (deadTail >= 10) break; }
    else deadTail = 0;
  }

  // Final drain of any remaining logs.
  sampleDutyLogs(Game, duty);

  const endSnap = {};
  for (const id of rosterOf(Game)) endSnap[String(id)] = snapVillager(Game, id);
  const tele = (() => { try { return (Game.state.telemetry || []).slice(); } catch (e) { return []; } })();
  const teleTypes = {};
  for (const t of tele) {
    const k = (t && t.type) || '?';
    teleTypes[k] = (teleTypes[k] || 0) + 1;
  }
  const skillRows = [];
  for (const t of tele) {
    if (!t) continue;
    if (['skill_lesson', 'villager_skill', 'villager_seek_knowledge', 'villager_level_up', 'villager_grant', 'skill_taught', 'killer_tale', 'death'].indexOf(t.type) < 0) continue;
    skillRows.push({
      day: t.day, type: t.type,
      vid: t.vid != null ? String(t.vid) : null,
      teacher: t.teacher != null ? String(t.teacher) : null,
      learner: t.learner != null ? String(t.learner) : null,
      killer: t.killer != null ? String(t.killer) : null,
      who: t.who != null ? String(t.who) : null,
      skill: t.skill || t.ability || t.track || null,
      cause: t.cause || null,
    });
  }
  let waveKillLog = null;
  try { waveKillLog = (Game.state.village || {}).waveKillLog || Game.state.waveKillLog || null; } catch (e) {}

  const out = {
    seed, policy: policyId, days, endDay: nowDay(Game), gameOver: !!Game.over,
    playerId, scholarIds, startRoster, startSnap, endSnap, periodicSnap,
    seenDays, firstSeen, lastSeen, daily, resolved, assigned, deeds, practiceLines,
    wall, waveKillLog: waveKillLog ? JSON.parse(JSON.stringify(waveKillLog)) : null,
    teleTypes, skillRows, duty, commit: shaFull(), tipLabel: sha12(),
  };
  fs.mkdirSync(outDir, { recursive: true });
  const fname = `rolecensus-p6-${policyId}-seed${seed}.json`;
  fs.writeFileSync(path.join(outDir, fname), JSON.stringify(out));
  const resByTask = {};
  for (const r of resolved) resByTask[r.task] = (resByTask[r.task] || 0) + 1;
  console.log(JSON.stringify({
    ok: true, seed, policy: policyId, endDay: out.endDay, gameOver: out.gameOver,
    resolved: resolved.length, practiceLines: practiceLines.length,
    dutyAds: duty.adEvents, dutyPicks: duty.pickEvents,
    dutyTopScorePicks: duty.dutyTopScorePicks,
    daysWithDutyOpp: duty.daysWithOpp, file: fname,
    tasks: resByTask,
  }));
}

function parseList(s, fallback) {
  return (s || fallback).split(',').map(x => x.trim()).filter(Boolean);
}

async function runDriver() {
  const seeds = parseList(process.env.SEEDS, DEFAULT_SEEDS).map(s => parseInt(s, 10));
  const policies = parseList(process.env.POLICIES, DEFAULT_POLICIES);
  const days = process.env.DAYS || '80';
  const par = Math.max(1, parseInt(process.env.PAR || '4', 10));
  const outDir = process.env.OUT || DEFAULT_OUT;
  fs.mkdirSync(outDir, { recursive: true });
  const tip = shaFull();
  const jobs = [];
  for (const policy of policies) {
    for (const seed of seeds) jobs.push({ policy, seed });
  }
  console.log(JSON.stringify({
    phase: 'phase6-role-census-after-hunt-pick', tip, tip12: tip.slice(0, 12),
    seeds, policies, days: +days, cases: jobs.length, par, outDir,
    baselineCompare: 'evidence/2026-11-08/phase6-role-census-after-duty-practice (OVE-75 / tip 11a8d2582)',
  }));

  const results = [];
  let i = 0;
  async function worker() {
    while (i < jobs.length) {
      const job = jobs[i++];
      const env = Object.assign({}, process.env, {
        SEED: String(job.seed), POLICY: job.policy, DAYS: String(days), OUT: outDir,
      });
      const child = spawn(process.execPath, [__filename, '--one'], {
        cwd: REPO, env, stdio: ['ignore', 'pipe', 'pipe'],
      });
      let stdout = '', stderr = '';
      child.stdout.on('data', d => { stdout += d; });
      child.stderr.on('data', d => { stderr += d; });
      const code = await new Promise(res => child.on('close', res));
      let parsed = null;
      try {
        const lines = stdout.trim().split('\n').filter(Boolean);
        parsed = JSON.parse(lines[lines.length - 1]);
      } catch (e) {}
      const row = {
        seed: job.seed, policy: job.policy, code, ok: code === 0 && parsed && parsed.ok,
        summary: parsed, stderrTail: stderr.slice(-400),
      };
      results.push(row);
      console.log(JSON.stringify({
        done: results.length, total: jobs.length,
        seed: job.seed, policy: job.policy, ok: row.ok,
        dutyAds: parsed && parsed.dutyAds, dutyPicks: parsed && parsed.dutyPicks,
        dutyTopScorePicks: parsed && parsed.dutyTopScorePicks,
        practiceLines: parsed && parsed.practiceLines,
      }));
    }
  }
  const workers = [];
  for (let w = 0; w < Math.min(par, jobs.length); w++) workers.push(worker());
  await Promise.all(workers);

  const panel = {
    tip, tip12: tip.slice(0, 12),
    seeds, policies, days: +days, cases: jobs.length,
    ok: results.filter(r => r.ok).length,
    failed: results.filter(r => !r.ok).length,
    results,
  };
  fs.writeFileSync(path.join(outDir, 'panel.json'), JSON.stringify(panel, null, 2));
  console.log(JSON.stringify({ panelOk: panel.ok, panelFailed: panel.failed, outDir }));
  if (panel.failed) process.exitCode = 1;
}

if (process.argv.includes('--one')) {
  runOne().catch(e => { console.error(e && e.stack || e); process.exit(1); });
} else {
  runDriver().catch(e => { console.error(e && e.stack || e); process.exit(1); });
}
