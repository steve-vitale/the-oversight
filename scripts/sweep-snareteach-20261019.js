#!/usr/bin/env node
// scripts/sweep-snareteach-20261019.js — snareteach teach-drive pilot.
// Before/after on IDENTICAL seeds (MEASUREMENT.md §§9-12, 14-15): pilot
// 8 seeds (11/22/33/44) x {leadfeast, belongfeast}, 180d death-aware,
// FEASTSCALE_R13=1 / SEATDRIVE=0 substrate. SNARETEACH=1 arms the drive;
// unset = byte-identical control.
//
// Per-run telemetry: scholar snare-recipe learns (day + via type from
// _grantRecipe), snare_wire skill learns, teach tele events (npc_trap,
// snare_lesson, snare_overhear, skill_lesson), knower census + trust
// trajectory, drive engagement (gifts/sits/lessons), downstream
// trapsCrafted/trapsSet, survival + scale-wall numbers (scale-repro).
//
// Usage:
//   LEVER=snareteach-baseline SEEDS="11,22,33,44" POLICIES="leadfeast,belongfeast" DAYS=180 \
//     FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/sweep-snareteach-20261019.js
//   ... SNARETEACH=1 LEVER=snareteach-armed ... (after side)
// Writes per-seed JSON to the evidence dir + prints a summary table.
//
// TOOLING ONLY — no game balance changes.
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { POLICY_REGISTRY } = require('./sweep-compare');
const { attachScale, scaleRow, finalizeScale } = require('./scale-repro-20261013');

const dayOf = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; }; };

// Trapline instruments: recipe learns, skill learns, teach tele events,
// knower census + trust trajectory, drive engagement.
function attachTrapline(Game, m) {
  const t = {
    recipeLearns: [],   // {day, level, type, by} for recipe 'snare'
    skillLearns: [],    // {day, via} for skill 'snare_wire'
    tele: { npc_trap: 0, npc_trap_caught: 0, snare_lesson: 0, snare_overhear: 0, skill_lesson_wire: 0, teach_beat: 0 },
    knowers0: [],       // vids knowing the wire at setup
    trustSeries: [],    // [day, {vid: trust}] sampled
    gifts: 0, sits: 0, wireAsked: 0,
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
  const origLS = Game.learnSkill;
  if (typeof origLS === 'function') {
    Game.learnSkill = function (id, level, via) {
      try {
        if (String(id) === 'snare_wire') t.skillLearns.push({ day: dayOf(Game), level, via: String(via || '?') });
      } catch (e) {}
      return origLS.apply(this, arguments);
    };
  }
  const origTele = Game.tele;
  Game.tele = function (type, data) {
    try {
      if (type === 'npc_trap') { t.tele.npc_trap++; if (data && data.caught) t.tele.npc_trap_caught++; }
      else if (type === 'snare_lesson') t.tele.snare_lesson++;
      else if (type === 'snare_overhear') t.tele.snare_overhear++;
      else if (type === 'skill_lesson' && data && String(data.skill) === 'snare_wire') t.tele.skill_lesson_wire++;
    } catch (e) {}
    return origTele.apply(this, arguments);
  };
  const origGF = Game.giveFood;
  if (typeof origGF === 'function') {
    Game.giveFood = function (vid) {
      try {
        const vp = Game.vpOf ? Game.vpOf(vid) : null;
        if (vp && vp.knowsSnare) t.gifts++;
      } catch (e) {}
      return origGF.apply(this, arguments);
    };
  }
  // knower census at setup
  try {
    const roster = ((Game.state.village || {}).roster || []);
    for (const vid of roster) {
      let vp = null;
      try { vp = Game.vpOf(vid); } catch (e) {}
      if (vp && vp.knowsSnare) t.knowers0.push(vid);
    }
  } catch (e) {}
  t.sampleTrust = () => {
    const row = {};
    try {
      const roster = ((Game.state.village || {}).roster || []);
      for (const vid of t.knowers0) {
        if (roster.indexOf(vid) < 0) { row[vid] = 'dead'; continue; }
        const tr = (Game.state.village.trust || {})[vid];
        row[vid] = tr === undefined ? 10 : Math.round(tr * 10) / 10;
      }
    } catch (e) {}
    t.trustSeries.push([dayOf(Game), row]);
  };
  return t;
}

function snareLevelAt(Game) {
  try { return (((Game.state.codex || {}).recipes || {}).snare || {}).level || 0; }
  catch (e) { return 0; }
}

async function main() {
  const label = process.env.LEVER || 'snareteach';
  const seeds = (process.env.SEEDS || '11,22,33,44').split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const policyIds = (process.env.POLICIES || 'leadfeast,belongfeast').split(',').map(s => s.trim()).filter(Boolean);
  const days = parseInt(process.env.DAYS || '180', 10);
  const outDir = process.env.OUTDIR || path.join(__dirname, '..', 'evidence', '2026-10-19', 'snareteach-' + label);
  fs.mkdirSync(outDir, { recursive: true });
  const t0 = Date.now();
  const rows = [];
  for (const pid of policyIds) {
    const base = POLICY_REGISTRY[pid];
    if (!base) throw new Error('unknown policy: ' + pid);
    for (const seed of seeds) {
      const { Game } = await loadGame({ seed, mode: 'snareteach-' + pid });
      await setupGame(Game);
      const m = {};
      try { attachScale(Game, m); } catch (e) {}
      const tr = attachTrapline(Game, m);
      tr.sampleTrust();
      let ctxRef = null;
      const policy = Object.assign({}, base, {
        setup(G, ctx) { ctxRef = ctx; if (base.setup) return base.setup(G, ctx); },
        daily(G, ctx) {
          if (!ctxRef) ctxRef = ctx;
          let r;
          if (base.daily) { try { r = base.daily(G, ctx); } catch (e) {} }
          try { if (m.scale && scaleRow) m.scale.daily.push(scaleRow(Game)); } catch (e) {}
          if ((dayOf(G) % 10) === 0) { try { tr.sampleTrust(); } catch (e) {} }
          return r;
        },
      });
      const result = await runDays(Game, policy, { days, sampleEvery: 10 });
      tr.sampleTrust();
      let wave = 1;
      try { wave = Game.unlockedWave ? Game.unlockedWave() : 1; } catch (e) {}
      let scale = {};
      try { if (m.scale && finalizeScale) scale = finalizeScale(Game, m) || {}; } catch (e) {}
      const firstLearn = tr.recipeLearns.find(l => l.level >= 1) || null;
      const row = {
        label, policy: pid, seed,
        days: result.days, gameDays: result.gameDays, endReason: result.endReason,
        knowers0: tr.knowers0.length,
        snareLearnDay: firstLearn ? firstLearn.day : null,
        snareLearnVia: firstLearn ? firstLearn.type : null,
        snareLearnBy: firstLearn ? firstLearn.by : null,
        snareLevelEnd: snareLevelAt(Game),
        recipeLearns: tr.recipeLearns,
        skillLearns: tr.skillLearns,
        tele: tr.tele,
        trustSeries: tr.trustSeries,
        driveGifts: (ctxRef && ctxRef.snareteachGifts) || 0,
        driveSits: (ctxRef && ctxRef.snareteachSits) || 0,
        driveWireAsked: (ctxRef && ctxRef.snareteachWireAsked) || 0,
        driveWireOffered: (ctxRef && ctxRef.snareteachWireOffered) || 0,
        trapsCrafted: (ctxRef && ctxRef.trapsCrafted) || 0,
        trapsSet: (ctxRef && ctxRef.trapsSet) || 0,
        trapsWireSet: (ctxRef && ctxRef.trapsWireSet) || 0,
        unlockedWave: wave,
      };
      Object.assign(row, scale);
      rows.push(row);
      fs.writeFileSync(path.join(outDir, `${pid}-s${seed}.json`), JSON.stringify(row, null, 1));
      const nat = (row.nationalHeldDays || 0) > 0 ? 1 : 0;
      console.log(`  [${pid} s${seed}] d=${row.days}/${row.gameDays} ${row.endReason} knowers0=${row.knowers0} learnDay=${row.snareLearnDay} via=${row.snareLearnVia} gifts=${row.driveGifts} sits=${row.driveSits} wireAsked=${row.driveWireAsked} crafts=${row.trapsCrafted} sets=${row.trapsSet + row.trapsWireSet} npcTrap=${row.tele.npc_trap} lessons=${row.tele.snare_lesson}/${row.tele.snare_overhear}/${row.tele.skill_lesson_wire} nat=${nat} wave=${row.unlockedWave}`);
    }
  }
  const agg = (fn) => rows.reduce((tt, r) => tt + fn(r), 0);
  const med = (vs) => { vs = vs.slice().sort((a, b) => a - b); return vs.length ? vs[Math.floor(vs.length / 2)] : null; };
  const learnDays = rows.filter(r => r.snareLearnDay != null).map(r => r.snareLearnDay);
  const s = {
    label, runs: rows.length,
    learnRate: rows.filter(r => r.snareLearnDay != null).length + '/' + rows.length,
    medianLearnDay: med(learnDays),
    learnVias: rows.filter(r => r.snareLearnVia).reduce((o, r) => { o[r.snareLearnVia] = (o[r.snareLearnVia] || 0) + 1; return o; }, {}),
    medianSurvival: med(rows.map(r => r.days)),
    national: agg(r => ((r.nationalHeldDays || 0) > 0 ? 1 : 0)),
    table: agg(r => (r.tableEntered ? 1 : 0)),
    wins: agg(r => (r.won ? 1 : 0)),
    npcTrap: agg(r => r.tele.npc_trap),
    npcTrapCaught: agg(r => r.tele.npc_trap_caught),
    snareLessons: agg(r => r.tele.snare_lesson),
    snareOverhears: agg(r => r.tele.snare_overhear),
    skillLessonWire: agg(r => r.tele.skill_lesson_wire),
    driveGifts: agg(r => r.driveGifts),
    driveSits: agg(r => r.driveSits),
    driveWireAsked: agg(r => r.driveWireAsked),
    trapsCrafted: agg(r => r.trapsCrafted),
    trapsSet: agg(r => r.trapsSet + r.trapsWireSet),
    waveMax: Math.max.apply(null, rows.map(r => r.unlockedWave || 1)),
    ms: Date.now() - t0,
  };
  fs.writeFileSync(path.join(outDir, 'summary.json'), JSON.stringify({ summary: s, rows }, null, 1));
  console.log('\nSUMMARY ' + label + ': ' + JSON.stringify(s, null, 1));
}

main().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
