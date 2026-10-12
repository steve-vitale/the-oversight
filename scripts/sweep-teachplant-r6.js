#!/usr/bin/env node
// sweep-teachplant-r6.js — agencyTeachPlant spoken-line measurement (longsim agency r6, 2026-10-12).
// Sub-lever: the PLAYER's teach-learn spoken surface (villager -> player plant lesson).
//
// The r6 dial is NARRATION-ONLY (zero RNG draws, no mechanic touched): the
// spoken line for agencyTeachPlant varies off the player's read need
// (wound/hunger/novice/general). This sweep proves the dial moves no number:
// identical seeds before/after must produce BIT-IDENTICAL metric records.
//
// Exercising: competent policy + askRound hook (from sweep-agency-lever.js) —
// pure competent never asks, so agencyTeachPlant fires 0 times without it.
// The askRound goes through the real conversation path (startConvo/convoTurn),
// bounded: one ask per villager with fresh explorerNews.
//
// Records per run: the mission metrics (win/arc/wave/taught breadth/lessons)
// + teach channels + death-cause shares. Also captures the actual
// agencyTeachPlant narration lines for sense-testing.
//
// Usage:
//   SEEDS="1,...,10" DAYS=200 OUT=/tmp/teachplant-before-r6.json \
//     node scripts/sweep-teachplant-r6.js
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

function parseList(env, def) {
  return (process.env[env] || def).split(',').map(s => s.trim()).filter(Boolean);
}

// ASK ROUND (from sweep-agency-lever.js): the player asks villagers with fresh
// explorer news about the wild, through the real conversation path.
function askRound(Game) {
  let n = 0;
  try {
    const v = Game.state.village || {};
    const news = v.explorerNews || {};
    const ids = Object.keys(news).filter(id => id !== Game.villagerId);
    for (const vid of ids) {
      try {
        if (!((v.roster || []).includes(vid))) continue;
        const st = Game.startConvo(vid);
        if (!st) continue;
        const choices = Game.convoChoices(vid) || [];
        const ac = choices.find(c => c.id && String(c.id).indexOf('agency:') === 0);
        if (ac) {
          try { Game.convoTurn(vid, ac.id); n++; } catch (e) {}
        }
        try { Game.endConvo(vid, 'left'); } catch (e) {}
      } catch (e) {}
    }
  } catch (e) {}
  return n;
}

(async () => {
  const seeds = parseList('SEEDS', Array.from({ length: 10 }, (_, i) => String(i + 1)).join(',')).map(Number);
  const days = parseInt(process.env.DAYS || '200', 10);
  const outFile = process.env.OUT || null;

  const runs = [];
  const teachPlantLines = []; // {seed, day, msg} — for sense-testing
  for (const seed of seeds) {
    const { Game, manifest } = await loadGame({ seed, mode: 'competent+ask', fullTelemetry: false });
    await setupGame(Game);

    // --- instrumentation (sweep tooling only, never game code) ---
    let plantTaught = 0, monsterTaught = 0;
    const deathCauses = {};
    const sayLines = [];
    try {
      const _tp = Game.agencyTeachPlant, _tm = Game.agencyTeachMonster;
      if (_tp) Game.agencyTeachPlant = function (vid) { const r = _tp.call(this, vid); if (r) plantTaught++; return r; };
      if (_tm) Game.agencyTeachMonster = function (vid) { const r = _tm.call(this, vid); if (r) monsterTaught++; return r; };
      const _rd = Game.registerDeath;
      if (_rd) Game.registerDeath = function (rec) {
        const r = _rd.call(this, rec);
        try { const c = (rec && rec.cause) || '?'; deathCauses[c] = (deathCauses[c] || 0) + 1; } catch (e) {}
        return r;
      };
      const _say = Game.say;
      Game.say = function (msg) {
        try {
          const m = String(msg);
          // plant-lesson lines only: "(Codex:" not "(Monster codex:"
          if (/📖/.test(m) && /\(Codex:/.test(m)) {
            sayLines.push({ seed, day: (Game.state.scholar || {}).day || 0, msg: m.slice(0, 300) });
          }
        } catch (e) {}
        return _say.call(this, msg);
      };
    } catch (e) { console.error('instrumentation failed: ' + e.message); }

    const policy = Object.assign({}, competent);
    const origDaily = competent.daily;
    policy.daily = (G, ctx) => {
      if (origDaily) { try { origDaily(G, ctx); } catch (e) {} }
      try { askRound(G); } catch (e) {}
    };
    const result = await runDays(Game, policy, { days, manifest, sampleEvery: 10 });

    // --- end-state reads ---
    let breadth = 0, maxArc = 1, won = false, tableWaiting = false;
    let taughtBreadth = [], lessonRecs = 0;
    try { breadth = Game.codexBreadth(); } catch (e) {}
    try { maxArc = (Game.progState() || {}).arc || 1; } catch (e) {}
    try { won = !!Game.won; } catch (e) {}
    try { tableWaiting = !!((Game.progState() || {}).tableWaiting); } catch (e) {}
    try {
      const v = Game.state.village || {};
      for (const vid of (v.roster || [])) taughtBreadth.push(((v.taught || {})[vid] || []).length);
      const a = Game.agencyState ? Game.agencyState() : {};
      for (const list of Object.values(a.lessons || {})) if (list && list.length) lessonRecs += list.length;
    } catch (e) {}

    const rec = {
      seed, days: result.days, endReason: result.endReason,
      maxArc, maxWaveUnlocked: result.maxWaveUnlocked, won, tableWaiting,
      breadth,
      plantTaught, monsterTaught,
      taughtBreadthMean: taughtBreadth.length ? +(taughtBreadth.reduce((a, b) => a + b, 0) / taughtBreadth.length).toFixed(1) : 0,
      lessonRecs,
      deathCauses,
      teachPlantLineCount: sayLines.length,
    };
    runs.push(rec);
    for (const l of sayLines) teachPlantLines.push(l);
    console.log(`done: seed=${seed} days=${result.days} end=${result.endReason} breadth=${breadth} plantTaught=${plantTaught} monsterTaught=${monsterTaught} lines=${sayLines.length}`);
  }

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
    plantTaught: sum(runs.map(r => r.plantTaught)),
    monsterTaught: sum(runs.map(r => r.monsterTaught)),
    meanTaughtBreadth: +(sum(runs.map(r => r.taughtBreadthMean)) / runs.length).toFixed(1),
    lessonRecs: sum(runs.map(r => r.lessonRecs)),
    deathCausesTotal: merge('deathCauses'),
    deathCausesShare: shareOf(merge('deathCauses')),
    teachPlantLineCount: sum(runs.map(r => r.teachPlantLineCount)),
  };
  console.log('\n=== AGGREGATE ===');
  console.log(JSON.stringify(agg, null, 2));
  if (outFile) {
    fs.writeFileSync(outFile, JSON.stringify({ meta: { days, date: '2026-10-12', policy: 'competent+ask', note: 'agencyTeachPlant spoken-line dial: narration-only, expect bit-identical' }, agg, runs, teachPlantLines }, null, 1));
    console.log('wrote ' + outFile);
  }

  // line-ending variety for sense-testing
  const endings = {};
  for (const l of teachPlantLines) {
    const parts = l.msg.split('—');
    const end = parts.length > 1 ? parts.slice(1).join('—').trim() : '(no em-dash)';
    endings[end] = (endings[end] || 0) + 1;
  }
  console.log('\n=== teach-plant line endings ===');
  for (const [e, c] of Object.entries(endings).sort((a, b) => b[1] - a[1])) console.log(`  [x${c}] — ${e}`);
})();
