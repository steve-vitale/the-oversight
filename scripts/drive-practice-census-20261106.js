#!/usr/bin/env node
// Practice-moves-competence census (2026-11-06, sim-drive-practice-a).
// Competent-policy villages, death-aware to 80d max. Start/end snapshots of
// villagerCompetence per task + practice reps, so the analysis can ask
// whether doing real work moves competence off its occupation baseline.
// Reuses the rolecensus-20261104 instrument shape (read-only wraps;
// resolveOneAssignment recorded outermost-only with the final task, so a
// prod-throttle redirect counts once as the work actually done).
// Usage: SEEDS=99451,99452 DAYS=80 LEG=baseline node scripts/drive-practice-census-20261106.js
//   EVID defaults to evidence/2026-11-06 in this checkout.
//   Writes drive-practice-a-<LEG>-seed<seed>.json per seed.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EVID = process.env.EVID || path.join(ROOT, 'evidence', '2026-11-06');
const LEG = process.env.LEG || 'baseline';
const { loadGame, setupGame, driveFights, driveContests } = require('./sim-harness');
const { competent } = require('./policies/competent');

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [99451]);
const DAYS = parseInt(process.env.DAYS || '80', 10);
const TASKS = ['hunt', 'forage', 'garden', 'fish', 'wood', 'stone', 'deadfall', 'water', 'scout', 'patrol', 'cook', 'tend', 'teach', 'mend'];
const _warned = {};
function warnOnce(k, e) { if (!_warned[k]) { _warned[k] = true; console.warn('[drivepractice:' + k + ']', (e && e.message) || e); } }
const nowDay = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
function nameOf(Game, id) { try { return Game.displayName(id); } catch (e) { return String(id); } }
function isDead(Game, id) { try { return !!(Game.getPerson(id) || {}).dead; } catch (e) { return false; } }
function rosterOf(Game) { try { return ((Game.state.village || {}).roster || []).slice(); } catch (e) { return []; } }

// Wall snapshot: won / arc / scale rank / table — history matters, so the
// daily loop tracks maxima and the end snapshot records the final state.
function wallSnap(Game) {
  const out = { won: false, arc: 1, rank: 'village', tableWaiting: false, tableEntered: false };
  try { out.won = !!Game.won; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; out.arc = pg.arc || 1; out.tableWaiting = !!pg.tableWaiting; out.tableEntered = !!pg.tableDone; } catch (e) {}
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
  out.temperament = (p && p.personality && p.personality.temperament) || null;
  out.dead = isDead(Game, id);
  out.competence = {};
  for (const t of TASKS) { try { out.competence[t] = Game.villagerCompetence(id, t); } catch (e) { out.competence[t] = null; } }
  // Practice reps live on the villager person record (vp.practice), same
  // pattern as foodXp on the villagePeople _src record.
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
  return out;
}

async function runSeed(seed) {
  const { Game } = await loadGame({ seed, mode: 'mvc', fullTelemetry: true });
  await setupGame(Game);
  const policy = competent;
  const ctx = { policyId: policy.id, notes: [] };
  if (policy.setup) { try { await policy.setup(Game, ctx); } catch (e) { warnOnce('setup', e); } }

  const resolved = []; // {day, vid, task} — outermost call only, final task
  const practiceLines = []; // say lines carrying a practice rung gain
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
  if (typeof Game.say === 'function') {
    const _s = Game.say.bind(Game);
    Game.say = function (msg) {
      try {
        if (typeof msg === 'string' && /getting the hang|practice/i.test(msg)) {
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
  let deadTail = 0;
  for (let d = 1; d <= DAYS; d++) {
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
    const roster = rosterOf(Game);
    const w = wallSnap(Game);
    wall.maxRank = Math.max(wall.maxRank, RANK_ORDER[w.rank] || 0);
    wall.maxArc = Math.max(wall.maxArc, w.arc || 1);
    if (w.tableWaiting) wall.everTable = true;
    if (w.tableEntered) wall.everEntered = true;
    if (w.won) wall.everWon = true;
    daily.push({ day: nowDay(Game), alive: roster.filter(id => !isDead(Game, id)).length, rosterN: roster.length, over: !!Game.over, scholarId: String(Game.villagerId) });
    const alive = roster.filter(id => !isDead(Game, id)).length;
    if (alive === 0) { deadTail++; if (deadTail >= 10) break; } else deadTail = 0;
  }

  const endSnap = {};
  for (const id of rosterOf(Game)) endSnap[String(id)] = snapVillager(Game, id);
  // Wave-4 kills (second-kill timing, context only): waveKillLog if present.
  let waveKillLog = null;
  try { waveKillLog = (Game.state.village || {}).waveKillLog || Game.state.waveKillLog || null; } catch (e) {}
  const out = { seed, leg: LEG, days: DAYS, endDay: nowDay(Game), gameOver: !!Game.over, playerId,
    startRoster, startSnap, endSnap, daily, resolved, practiceLines, wall,
    waveKillLog: waveKillLog ? JSON.parse(JSON.stringify(waveKillLog)) : null,
    commit: null };
  try { out.commit = require('child_process').execSync('git rev-parse HEAD', { cwd: ROOT }).toString().trim(); } catch (e) {}
  fs.mkdirSync(EVID, { recursive: true });
  fs.writeFileSync(path.join(EVID, `drive-practice-a-${LEG}-seed${seed}.json`), JSON.stringify(out, null, 2));
  const resByTask = {};
  for (const r of resolved) resByTask[r.task] = (resByTask[r.task] || 0) + 1;
  console.log(`SEED ${seed} [${LEG}]: endDay=${out.endDay} over=${out.gameOver} aliveEnd=${daily.length ? daily[daily.length - 1].alive : '?'} resolved=${resolved.length} practiceLines=${practiceLines.length} maxRank=${wall.maxRank} maxArc=${wall.maxArc} table=${wall.everTable} won=${wall.everWon} tasks=${JSON.stringify(resByTask)}`);
  return out;
}

(async () => {
  for (const s of SEEDS) { try { await runSeed(s); } catch (e) { console.error(`SEED ${s} CRASH:`, e && e.stack || e); process.exitCode = 1; } }
})();
