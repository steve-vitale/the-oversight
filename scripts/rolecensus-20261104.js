#!/usr/bin/env node
// Role-differentiation census (2026-11-04, measurement only).
// Competent-policy villages, 120 days. Records per-villager lived behavior
// (resolved tasks per day, deeds, lessons, tracks, skills) plus start/end
// snapshots of villagerCompetence / specialistSkill / foodXp, so the
// analysis can ask whether profiles cluster into roles or trace back to
// formerOccupation. All instruments are read-only wraps: the original is
// called exactly once and its return value is passed through unchanged.
// Usage: SEEDS=61001,61002 DAYS=120 node scripts/rolecensus-20261104.js
//   EVID defaults to evidence/2026-11-04 in this checkout.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EVID = process.env.EVID || path.join(ROOT, 'evidence', '2026-11-04');
const { loadGame, setupGame, driveFights, driveContests } = require('./sim-harness');
const { competent } = require('./policies/competent');

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [61001]);
const DAYS = parseInt(process.env.DAYS || '120', 10);
const TASKS = ['hunt', 'forage', 'garden', 'fish', 'wood', 'stone', 'deadfall', 'water', 'scout', 'patrol', 'cook', 'tend', 'teach', 'mend'];
const SPECS = ['butcher', 'cook', 'preserver', 'spotter', 'builder'];
const TRACKS = ['combat', 'field', 'social', 'craft', 'strange'];
const _warned = {};
function warnOnce(k, e) { if (!_warned[k]) { _warned[k] = true; console.warn('[rolecensus:' + k + ']', (e && e.message) || e); } }
const nowDay = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
function nameOf(Game, id) { try { return Game.displayName(id); } catch (e) { return String(id); } }
function isDead(Game, id) { try { return !!(Game.getPerson(id) || {}).dead; } catch (e) { return false; } }
function rosterOf(Game) { try { return ((Game.state.village || {}).roster || []).slice(); } catch (e) { return []; } }

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
  for (const t of TASKS) { try { out.competence[t] = Game.villagerCompetence(id, t); } catch (e) { out.competence[t] = null; } }
  out.specialist = {};
  for (const t of SPECS) { try { out.specialist[t] = Game.specialistSkill ? Game.specialistSkill(p || {}, t) : null; } catch (e) { out.specialist[t] = null; } }
  // foodXp lives on the villagePeople _src record.
  out.foodXp = {};
  try {
    const vp = (Game.villagePeople ? Game.villagePeople() : []).find(x => String(x.id) === String(id));
    const fx = (vp && vp._src && vp._src.foodXp) || {};
    for (const t of SPECS) out.foodXp[t] = fx[t] || 0;
  } catch (e) {}
  // Raw track record only — never npcXp(), which would create + seed a
  // record for villagers who never earned a deed.
  try {
    const rec = ((Game.state.village || {}).npcXp || {})[id] || null;
    out.tracks = rec ? { xp: Object.fromEntries(TRACKS.map(t => [t, rec[t] || 0])), granted: Object.assign({}, rec.granted || {}), skilled: Object.assign({}, rec.skilled || {}) } : null;
  } catch (e) { out.tracks = null; }
  try { out.npcSkills = (((Game.state.village || {}).npcSkills || {})[id] || []).slice(); } catch (e) { out.npcSkills = []; }
  try { out.npcAbilities = (((Game.state.village || {}).npcAbilities || {})[id] || []).slice(); } catch (e) { out.npcAbilities = []; }
  try { const nk = ((Game.state.village || {}).npcKnow || {})[id] || {}; out.npcKnow = Object.keys(nk); } catch (e) { out.npcKnow = []; }
  return out;
}

async function runSeed(seed) {
  const { Game } = await loadGame({ seed, mode: 'mvc', fullTelemetry: true });
  await setupGame(Game);
  const policy = competent;
  const ctx = { policyId: policy.id, notes: [] };
  if (policy.setup) { try { await policy.setup(Game, ctx); } catch (e) { warnOnce('setup', e); } }

  // Instruments (read-only wraps).
  const resolved = []; // {day, vid, task} — one entry per resolved assignment incl. task leads
  const assigned = []; // {day, vid, task, ok}
  const deeds = [];    // {day, who, deed}
  // PRODTHROTTLE correction: a forage/garden/fish resolution that redirects
  // recurses into resolveOneAssignment with the alt task (wood/water/stone).
  // Recording every call would double-count (fish + wood for one job) and
  // inflate wood/stone. So only the OUTERMOST call records, with the
  // INNERMOST (final) task — the work actually done.
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
      try { assigned.push({ day: nowDay(Game), vid: String(vid), task: String(task), ok: !!(r && r.ok) }); } catch (e) {}
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

  const startSnap = {};
  for (const id of rosterOf(Game)) startSnap[String(id)] = snapVillager(Game, id);
  const startRoster = rosterOf(Game).map(String);
  const playerId = String(Game.villagerId);

  const daily = []; // {day, alive, rosterN, taskLeads:{task:vid}, leadsChanged}
  const seenDays = {}; // vid -> days present (alive or dead, in roster at dawn snapshot)
  const firstSeen = {};
  const lastSeen = {};
  const scholarIds = [String(Game.villagerId)]; // every bearer, incl. mantle successors
  const periodicSnap = {}; // day -> {vid: snap} for roster members (catches villagers who later die/drop off roster)
  let prevLeads = null;
  let deadTail = 0;
  for (let d = 1; d <= DAYS; d++) {
    for (const id of rosterOf(Game)) {
      const k = String(id);
      seenDays[k] = (seenDays[k] || 0) + 1;
      if (firstSeen[k] == null) firstSeen[k] = nowDay(Game);
      lastSeen[k] = nowDay(Game);
    }
    try { const sv = String(Game.villagerId); if (scholarIds.indexOf(sv) < 0) scholarIds.push(sv); } catch (e) {}
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
    let leads = null;
    try { leads = Object.assign({}, ((Game.state.village || {}).taskLeads || {})); } catch (e) { leads = {}; }
    const changed = prevLeads === null ? false : (JSON.stringify(leads) !== JSON.stringify(prevLeads));
    prevLeads = leads;
    const roster = rosterOf(Game);
    daily.push({ day: nowDay(Game), alive: roster.filter(id => !isDead(Game, id)).length, rosterN: roster.length, taskLeads: leads, leadsChanged: changed, over: !!Game.over, scholarId: String(Game.villagerId), rosterIds: roster.map(String) });
    if ([30, 60, 90].indexOf(nowDay(Game)) >= 0) {
      periodicSnap[nowDay(Game)] = {};
      for (const id of roster) { try { periodicSnap[nowDay(Game)][String(id)] = snapVillager(Game, id); } catch (e) {} }
    }
    const alive = roster.filter(id => !isDead(Game, id)).length;
    if (alive === 0) { deadTail++; if (deadTail >= 10) break; } else deadTail = 0;
  }

  const endSnap = {};
  for (const id of rosterOf(Game)) endSnap[String(id)] = snapVillager(Game, id);
  // Villagers who left/died and dropped off the roster: keep their start
  // snapshot + last-known state via seenDays; they have no end snapshot.
  const tele = (() => { try { return (Game.state.telemetry || []).slice(); } catch (e) { return []; } })();
  const teleTypes = {};
  for (const t of tele) { const k = (t && t.type) || '?'; teleTypes[k] = (teleTypes[k] || 0) + 1; }
  const skillRows = [];
  for (const t of tele) {
    if (!t) continue;
    if (['skill_lesson', 'villager_skill', 'villager_seek_knowledge', 'villager_level_up', 'villager_grant', 'skill_taught', 'killer_tale', 'death'].indexOf(t.type) < 0) continue;
    skillRows.push({ day: t.day, type: t.type, vid: t.vid != null ? String(t.vid) : null, teacher: t.teacher != null ? String(t.teacher) : null, learner: t.learner != null ? String(t.learner) : null, killer: t.killer != null ? String(t.killer) : null, who: t.who != null ? String(t.who) : null, skill: t.skill || t.ability || t.track || null, cause: t.cause || null });
  }
  const out = { seed, days: DAYS, endDay: nowDay(Game), gameOver: !!Game.over, playerId,
    scholarIds, startRoster, startSnap, endSnap, periodicSnap, seenDays, firstSeen, lastSeen, daily,
    resolved, assigned, deeds, teleTypes, skillRows,
    commit: null };
  try { out.commit = require('child_process').execSync('git rev-parse HEAD', { cwd: ROOT }).toString().trim(); } catch (e) {}
  fs.mkdirSync(EVID, { recursive: true });
  fs.writeFileSync(path.join(EVID, `rolecensus-20261104-seed${seed}.json`), JSON.stringify(out, null, 2));
  const resByTask = {};
  for (const r of resolved) resByTask[r.task] = (resByTask[r.task] || 0) + 1;
  console.log(`SEED ${seed}: endDay=${out.endDay} over=${out.gameOver} aliveEnd=${daily.length ? daily[daily.length - 1].alive : '?'} rosterEnd=${daily.length ? daily[daily.length - 1].rosterN : '?'} resolved=${resolved.length} assigned=${assigned.length} deeds=${deeds.length} tasks=${JSON.stringify(resByTask)}`);
  return out;
}

(async () => {
  for (const s of SEEDS) { try { await runSeed(s); } catch (e) { console.error(`SEED ${s} CRASH:`, e && e.stack || e); process.exitCode = 1; } }
})();
