#!/usr/bin/env node
// sweep-teach-r4.js — teach/learn channel measurement (longsim agency r4, 2026-10-11).
// Sub-lever: VILLAGER TEACH/LEARN BEHAVIOR.
//
// Measurement only: no game balance changes. Wraps sim-harness (shared infra
// untouched) with the competent policy (behavior untouched) and instruments
// the teaching primitives with source counting:
//
//   villagerLearnsPlant(vid, pid, source)  — the knowledge-growth primitive
//       -> count by source: 'word of mouth','taught','fireside','fieldwork',
//          'foraging','tested','traded','working','mentored','observed',...
//   identifyPlant(pid, source, teacherName) — the player-side identification
//       -> count by source + teacher name when source is 'taught'
//   agencyTeachVillager(teacher, learner)  -> taught true/false
//   agencyTeachPlant / agencyTeachMonster   -> villager->player lessons
//   teachPlant(vid, plantId)               -> player-initiated ask teaching
//
// Per run records the standard mission metrics plus teach-specific metrics:
// knowledge events/day (new villagerLearnsPlant per day), codex breadth
// growth, per-villager taught[] breadth, lessons by channel.
//
// Usage:
//   SEEDS="1,...,10" DAYS=200 OUT=/tmp/teach-before.json \
//     node scripts/sweep-teach-r4.js
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

function parseList(env, def) {
  return (process.env[env] || def).split(',').map(s => s.trim()).filter(Boolean);
}

(async () => {
  const seeds = parseList('SEEDS', Array.from({ length: 10 }, (_, i) => String(i + 1)).join(',')).map(Number);
  const days = parseInt(process.env.DAYS || '200', 10);
  const outFile = process.env.OUT || null;

  const runs = [];
  for (const seed of seeds) {
    const { Game, manifest } = await loadGame({ seed, mode: 'competent', fullTelemetry: false });
    await setupGame(Game);

    // --- instrumentation (sweep tooling only, never game code) ---
    const learnBySource = {};       // villagerLearnsPlant: source -> new lessons
    let learnDupes = 0;             // already-known writes (no-op)
    const idBySource = {};          // identifyPlant: source -> new identifications
    const idTaughtBy = {};          // identifyPlant 'taught': teacher name -> count
    let tvCalls = 0, tvTaught = 0;  // agencyTeachVillager
    let plantTaught = 0, monsterTaught = 0;
    let teachPlantCalls = 0, teachPlantOk = 0;

    try {
      const _vlp = Game.villagerLearnsPlant;
      Game.villagerLearnsPlant = function (vid, pid, source) {
        const r = _vlp.call(this, vid, pid, source);
        if (r) learnBySource[source || '?'] = (learnBySource[source || '?'] || 0) + 1;
        else learnDupes++;
        return r;
      };
      const _id = Game.identifyPlant;
      Game.identifyPlant = function (pid, source, teacherName) {
        const r = _id.call(this, pid, source, teacherName);
        if (r) {
          idBySource[source || '?'] = (idBySource[source || '?'] || 0) + 1;
          if (source === 'taught' && teacherName) {
            const k = String(teacherName).slice(0, 24);
            idTaughtBy[k] = (idTaughtBy[k] || 0) + 1;
          }
        }
        return r;
      };
      const _tv = Game.agencyTeachVillager;
      if (_tv) Game.agencyTeachVillager = function (t, l) {
        tvCalls++;
        const r = _tv.call(this, t, l);
        if (r && r.taught) tvTaught++;
        return r;
      };
      const _tp = Game.agencyTeachPlant, _tm = Game.agencyTeachMonster;
      if (_tp) Game.agencyTeachPlant = function (vid) { const r = _tp.call(this, vid); if (r) plantTaught++; return r; };
      if (_tm) Game.agencyTeachMonster = function (vid) { const r = _tm.call(this, vid); if (r) monsterTaught++; return r; };
      const _tp2 = Game.teachPlant;
      if (_tp2) Game.teachPlant = function (vid, pid) {
        teachPlantCalls++;
        const r = _tp2.call(this, vid, pid);
        if (r) teachPlantOk++;
        return r;
      };
    } catch (e) { console.error('instrumentation failed: ' + e.message); }

    const policy = Object.assign({}, competent);
    const result = await runDays(Game, policy, { days, manifest, sampleEvery: 10 });

    // --- end-state reads ---
    let breadth = 0, stage = 0, maxArc = 1, won = false, tableWaiting = false;
    let skillsLearned = [];
    let taughtBreadth = [], villagerCount = 0, lessonRecs = 0, learners = 0, teachers = new Set();
    try { breadth = Game.codexBreadth(); } catch (e) {}
    try { stage = Game.integrationStage(); } catch (e) {}
    try { maxArc = (Game.progState() || {}).arc || 1; } catch (e) {}
    try { won = !!Game.won; } catch (e) {}
    try { tableWaiting = !!((Game.progState() || {}).tableWaiting); } catch (e) {}
    try { skillsLearned = Object.keys((Game.state.codex || {}).skills || {}); } catch (e) {}
    try {
      const v = Game.state.village || {};
      const roster = v.roster || [];
      villagerCount = roster.length;
      for (const vid of roster) {
        const tb = (v.taught || {})[vid] || [];
        taughtBreadth.push(tb.length);
      }
      const a = Game.agencyState ? Game.agencyState() : {};
      for (const [lid, list] of Object.entries(a.lessons || {})) {
        if (list && list.length) { learners++; lessonRecs += list.length; }
        for (const l of (list || [])) if (l && l.from) teachers.add(l.from);
      }
    } catch (e) {}

    const totalLessons = Object.values(learnBySource).reduce((a, b) => a + b, 0);
    const gameDays = result.gameDays || result.days || 1;
    const rec = {
      seed, days: result.days, endReason: result.endReason,
      maxArc, maxWaveUnlocked: result.maxWaveUnlocked, won, tableWaiting,
      breadth, stage, skillsLearned: skillsLearned.length,
      // teaching channels
      learnBySource, learnDupes, totalLessons,
      knowledgeEventsPerDay: +(totalLessons / gameDays).toFixed(3),
      idBySource, idTaughtByCount: Object.keys(idTaughtBy).length,
      tvCalls, tvTaught,
      plantTaught, monsterTaught,
      teachPlantCalls, teachPlantOk,
      // villager knowledge spread
      villagerCount,
      taughtBreadthMean: taughtBreadth.length ? +(taughtBreadth.reduce((a, b) => a + b, 0) / taughtBreadth.length).toFixed(1) : 0,
      taughtBreadthMax: taughtBreadth.length ? Math.max.apply(null, taughtBreadth) : 0,
      lessonRecs, learners, teachers: teachers.size,
      // pacing
      meanVerbsPerDay: result.pacing ? result.pacing.meanVerbsPerDay : 0,
      ms: result.ms,
    };
    runs.push(rec);
    console.log(`done: seed=${seed} days=${result.days} end=${result.endReason} breadth=${breadth} kEv/day=${rec.knowledgeEventsPerDay} lessons=${JSON.stringify(learnBySource)} tv=${tvTaught}/${tvCalls} taughtBy=${rec.idTaughtByCount}`);
  }

  // ---- aggregate ----
  const sum = (a) => a.reduce((x, y) => x + y, 0);
  const ds = runs.map(r => r.days).sort((a, b) => a - b);
  const merge = (key) => { const o = {}; for (const r of runs) for (const [k, v] of Object.entries(r[key] || {})) o[k] = (o[k] || 0) + v; return o; };
  const shareOf = (o) => { const t = sum(Object.values(o)) || 1; const s = {}; for (const [k, v] of Object.entries(o)) s[k] = +(100 * v / t).toFixed(1); return s; };
  const agg = {
    n: runs.length, days,
    medianDays: ds[Math.floor(ds.length / 2)], maxDays: ds[ds.length - 1],
    endReasons: runs.reduce((o, r) => { o[r.endReason] = (o[r.endReason] || 0) + 1; return o; }, {}),
    won: runs.filter(r => r.won).length, tableWaiting: runs.filter(r => r.tableWaiting).length,
    maxArcDist: runs.reduce((o, r) => { o[r.maxArc] = (o[r.maxArc] || 0) + 1; return o; }, {}),
    maxWaveDist: runs.reduce((o, r) => { o[r.maxWaveUnlocked] = (o[r.maxWaveUnlocked] || 0) + 1; return o; }, {}),
    meanBreadth: +(sum(runs.map(r => r.breadth)) / runs.length).toFixed(1),
    meanStage: +(sum(runs.map(r => r.stage)) / runs.length).toFixed(1),
    meanSkills: +(sum(runs.map(r => r.skillsLearned)) / runs.length).toFixed(1),
    meanKnowledgeEventsPerDay: +(sum(runs.map(r => r.knowledgeEventsPerDay)) / runs.length).toFixed(3),
    learnBySourceTotal: merge('learnBySource'),
    learnBySourceShare: shareOf(merge('learnBySource')),
    learnDupes: sum(runs.map(r => r.learnDupes)),
    idBySourceTotal: merge('idBySource'),
    idBySourceShare: shareOf(merge('idBySource')),
    tvCalls: sum(runs.map(r => r.tvCalls)), tvTaught: sum(runs.map(r => r.tvTaught)),
    plantTaught: sum(runs.map(r => r.plantTaught)),
    monsterTaught: sum(runs.map(r => r.monsterTaught)),
    teachPlantCalls: sum(runs.map(r => r.teachPlantCalls)), teachPlantOk: sum(runs.map(r => r.teachPlantOk)),
    meanTaughtBreadth: +(sum(runs.map(r => r.taughtBreadthMean)) / runs.length).toFixed(1),
    maxTaughtBreadth: Math.max.apply(null, runs.map(r => r.taughtBreadthMax)),
    lessonRecs: sum(runs.map(r => r.lessonRecs)), learners: sum(runs.map(r => r.learners)), teachers: sum(runs.map(r => r.teachers)),
    meanVerbsPerDay: +(sum(runs.map(r => r.meanVerbsPerDay)) / runs.length).toFixed(1),
  };
  console.log('\n=== AGGREGATE ===');
  console.log(JSON.stringify(agg, null, 2));
  if (outFile) {
    fs.writeFileSync(outFile, JSON.stringify({ meta: { days, date: new Date().toISOString().slice(0, 10), policy: 'competent', note: 'teach/learn channel baseline' }, agg, runs }, null, 1));
    console.log('wrote ' + outFile);
  }
})();
