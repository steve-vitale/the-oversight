#!/usr/bin/env node
// scripts/sweep-snarecatch-b.js — sim-snarecatch-b pilot sweep.
// Before/after on IDENTICAL seeds (MEASUREMENT.md §§9-12, 14-15): pilot
// 8 fresh UNSCREENED seeds (42101-42108) x {leadfeast, belongfeast}, 180d
// death-aware, FEASTSCALE_R13=1 / SEATDRIVE=0 substrate. The lever is the
// game-code snare witnessed-catch bootstrap (src/js/villager-objectives.js);
// the before side runs the same tree with that block reverted.
//
// Per-run telemetry: scholar snare-recipe learns (day + via type from
// _grantRecipe), snare_catch_learn tele days (mechanism attribution),
// npc_trap witness instrumentation, teach-channel teles (snare_lesson,
// snare_overhear, skill_lesson_wire), knower census, death causes,
// scale-wall numbers (scale-repro).
//
// Usage:
//   LEVER=snarecatch-baseline SEEDS="42101,42102,..." POLICIES="leadfeast,belongfeast" DAYS=180 \
//     FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/sweep-snarecatch-b.js
// Writes per-seed JSON to evidence/2026-10-19/snarecatch-<label>/ + prints a
// summary table.
//
// TOOLING ONLY — no game balance changes.
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { POLICY_REGISTRY } = require('./sweep-compare');
const { attachScale, scaleRow, finalizeScale } = require('./scale-repro-20261013');

const dayOf = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; }; };

function attachTrapline(Game) {
  const t = {
    recipeLearns: [],   // {day, level, type, by} for recipe 'snare'
    catchLearnDays: [], // days of snare_catch_learn tele (mechanism attribution)
    tele: { npc_trap: 0, npc_trap_caught: 0, snare_catch_learn: 0, snare_lesson: 0, snare_overhear: 0, skill_lesson_wire: 0, teach_beat: 0 },
    knowers0: [],        // vids knowing the wire at setup
  };
  const origGR = Game._grantRecipe;
  if (typeof origGR === 'function') {
    Game._grantRecipe = function (id, level, src) {
      try {
        if (String(id) === 'snare') {
          t.recipeLearns.push({ day: dayOf(Game), level, type: String((src || {}).type || '?'), by: String((src || {}).by || '?').slice(0, 40) });
          if (String((src || {}).type) === 'taught') t.tele.teach_beat++;
        }
      } catch (e) {}
      return origGR.apply(this, arguments);
    };
  }
  const origTele = Game.tele;
  Game.tele = function (type, data) {
    try {
      if (type === 'npc_trap') { t.tele.npc_trap++; if (data && data.caught) t.tele.npc_trap_caught++; }
      else if (type === 'snare_catch_learn') { t.tele.snare_catch_learn++; t.catchLearnDays.push(dayOf(Game)); }
      else if (type === 'snare_lesson') t.tele.snare_lesson++;
      else if (type === 'snare_overhear') t.tele.snare_overhear++;
      else if (type === 'skill_lesson' && data && String(data.skill) === 'snare_wire') t.tele.skill_lesson_wire++;
    } catch (e) {}
    return origTele.apply(this, arguments);
  };
  try {
    const roster = ((Game.state.village || {}).roster || []);
    for (const vid of roster) {
      let vp = null;
      try { vp = Game.vpOf(vid); } catch (e) {}
      if (vp && vp.knowsSnare) t.knowers0.push(vid);
    }
  } catch (e) {}
  return t;
}

function snareLevelAt(Game) {
  try { return (((Game.state.codex || {}).recipes || {}).snare || {}).level || 0; }
  catch (e) { return 0; }
}

async function main() {
  const label = process.env.LEVER || 'snarecatch';
  const seeds = (process.env.SEEDS || '42101,42102,42103,42104,42105,42106,42107,42108').split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const policyIds = (process.env.POLICIES || 'leadfeast,belongfeast').split(',').map(s => s.trim()).filter(Boolean);
  const days = parseInt(process.env.DAYS || '180', 10);
  const outDir = process.env.OUTDIR || path.join(__dirname, '..', 'evidence', '2026-10-19', 'snarecatch-' + label);
  fs.mkdirSync(outDir, { recursive: true });
  const t0 = Date.now();
  const rows = [];
  for (const pid of policyIds) {
    const base = POLICY_REGISTRY[pid];
    if (!base) throw new Error('unknown policy: ' + pid);
    for (const seed of seeds) {
      const { Game } = await loadGame({ seed, mode: 'snarecatch-' + pid });
      await setupGame(Game);
      const m = {};
      try { attachScale(Game, m); } catch (e) {}
      const tr = attachTrapline(Game);
      const policy = Object.assign({}, base, {
        daily(G, ctx) {
          let r;
          if (base.daily) { try { r = base.daily(G, ctx); } catch (e) {} }
          try { if (m.scale && scaleRow) m.scale.daily.push(scaleRow(G)); } catch (e) {}
          return r;
        },
      });
      const result = await runDays(Game, policy, { days, sampleEvery: 10 });
      let wave = 1;
      try { wave = Game.unlockedWave ? Game.unlockedWave() : 1; } catch (e) {}
      let scale = {};
      try { if (m.scale && finalizeScale) scale = finalizeScale(Game, m) || {}; } catch (e) {}
      const firstLearn = tr.recipeLearns.find(l => l.level >= 1) || null;
      const attributed = !!(firstLearn && tr.catchLearnDays.indexOf(firstLearn.day) >= 0);
      const deaths = [];
      try {
        for (const d of ((result.samples || {}).deaths || [])) {
          deaths.push({ who: d.who || d.id || '?', cause: d.cause || d.how || '?' });
        }
      } catch (e) {}
      const starved = deaths.filter(d => /starv/i.test(String(d.cause))).length;
      const row = {
        label, policy: pid, seed,
        days: result.days, gameDays: result.gameDays, endReason: result.endReason,
        knowers0: tr.knowers0.length,
        snareLearnDay: firstLearn ? firstLearn.day : null,
        snareLearnVia: firstLearn ? firstLearn.type : null,
        snareLearnBy: firstLearn ? firstLearn.by : null,
        snareLearnAttributed: attributed, // mechanism attribution: catch-learn tele same day as the learn
        snareLevelEnd: snareLevelAt(Game),
        recipeLearns: tr.recipeLearns,
        catchLearnDays: tr.catchLearnDays,
        tele: tr.tele,
        deaths, starved,
        unlockedWave: wave,
      };
      Object.assign(row, scale);
      rows.push(row);
      fs.writeFileSync(path.join(outDir, `${pid}-s${seed}.json`), JSON.stringify(row, null, 1));
      const nat = (row.nationalHeldDays || 0) > 0 ? 1 : 0;
      console.log(`  [${pid} s${seed}] d=${row.days}/${row.gameDays} ${row.endReason} knowers0=${row.knowers0} learnDay=${row.snareLearnDay} via=${row.snareLearnVia} attr=${row.snareLearnAttributed} starved=${row.starved} npcTrap=${row.tele.npc_trap}/${row.tele.npc_trap_caught} catchLearns=${row.tele.snare_catch_learn} nat=${nat} wave=${row.unlockedWave}`);
    }
  }
  const agg = (fn) => rows.reduce((tt, r) => tt + fn(r), 0);
  const med = (vs) => { vs = vs.slice().sort((a, b) => a - b); return vs.length ? vs[Math.floor(vs.length / 2)] : null; };
  const learnDays = rows.filter(r => r.snareLearnDay != null).map(r => r.snareLearnDay);
  const deaths = {};
  for (const r of rows) for (const d of r.deaths) { const k = String(d.cause); deaths[k] = (deaths[k] || 0) + 1; }
  const s = {
    label, runs: rows.length,
    learnRate: rows.filter(r => r.snareLearnDay != null).length + '/' + rows.length,
    attributedLearns: rows.filter(r => r.snareLearnAttributed).length + '/' + rows.length,
    medianLearnDay: med(learnDays),
    learnVias: rows.filter(r => r.snareLearnVia).reduce((o, r) => { o[r.snareLearnVia] = (o[r.snareLearnVia] || 0) + 1; return o; }, {}),
    medianSurvival: med(rows.map(r => r.days)),
    maxSurvival: Math.max.apply(null, rows.map(r => r.days)),
    starvationDeaths: agg(r => r.starved),
    deathCauses: deaths,
    national: agg(r => ((r.nationalHeldDays || 0) > 0 ? 1 : 0)),
    table: agg(r => (r.tableEntered ? 1 : 0)),
    wins: agg(r => (r.won ? 1 : 0)),
    npcTrap: agg(r => r.tele.npc_trap),
    npcTrapCaught: agg(r => r.tele.npc_trap_caught),
    snareCatchLearns: agg(r => r.tele.snare_catch_learn),
    snareLessons: agg(r => r.tele.snare_lesson),
    snareOverhears: agg(r => r.tele.snare_overhear),
    skillLessonWire: agg(r => r.tele.skill_lesson_wire),
    waveMax: Math.max.apply(null, rows.map(r => r.unlockedWave || 1)),
    wave4: agg(r => ((r.unlockedWave || 1) >= 4 ? 1 : 0)),
    wave5: agg(r => ((r.unlockedWave || 1) >= 5 ? 1 : 0)),
    ms: Date.now() - t0,
  };
  fs.writeFileSync(path.join(outDir, 'summary.json'), JSON.stringify({ summary: s, rows }, null, 1));
  console.log('\nSUMMARY ' + label + ': ' + JSON.stringify(s, null, 1));
}

main().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
