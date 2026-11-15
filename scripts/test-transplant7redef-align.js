#!/usr/bin/env node
// test-transplant7redef-align.js — targeted family-test leg for the
// REDEFINED family-7 ablation (arm sim-transplant7redef-a).
//
// Proves, through live objPick on one staged villager per case, whether
// the align effect is present: when an aimed override wins the dawn
// commitment, does finishLottery leave the live objective at the CORE
// lottery kind (align inert) or rewrite it to the COMMIT kind (align
// active)? Four cases, one per align branch in the CURRENT
// vbrainAlignObjective (villager-brain.js:892-1006, incl. DUTY/ASSIGN):
//   gear_hold   — win-plan hold → HAVEN_CHORE/chore (honesty fixture)
//   expedition  — EXPEDITION hash → EXPEDITION/chore hold
//   duty        — DUTY top-score (forage, pantry very low) → FORAGE
//   assign      — ASSIGN standing order (forage) → FORAGE
//
// EXPECTED polarity is tree-dependent and is judged by the CALLER
// (scripts/test-transplant7redef.js), which detects the ablation from
// the source: on the BASELINE tree every firing case must show
// materialize === expectAlignKind (align active) AND (for gear_hold,
// where the core pick can coincide with the commit kind) the chore
// reading the commit chore; on the SUBJECT tree every firing case must
// show materialize === corePick (align inert — finishLottery returns
// the core objective unchanged) while the commit still carries the
// override. A case whose target override does not fire on the given
// seed is a setup skip (exit 2), not a pass or a fail — the proof tries
// the prereg's fixed seed list in order.
//
// Usage: node scripts/test-transplant7redef-align.js --case <name> [--seed N]
// Exit 0 = target override fired (JSON on stdout), 2 = did not fire.
// No repo writes.
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame } = require(path.join(REPO, 'scripts', 'sim-harness'));

const CASE = (process.argv.find(function (a) { return a.indexOf('--case=') === 0; }) || '--case=gear_hold').slice(7);
const SEED = parseInt((process.argv.find(function (a) { return a.indexOf('--seed=') === 0; }) || '--seed=20261108').slice(7), 10) || 20261108;
const CASES = ['gear_hold', 'expedition', 'duty', 'assign'];
const WANT_OVERRIDE = { gear_hold: 'win_plan:gear_hold', expedition: 'expedition_hash', duty: 'duty_top_score', assign: 'assign_standing' };
// The kind the align function maps each override onto (the live objective
// kind when align is ACTIVE). DUTY/ASSIGN map onto the dutyTask's real
// kind, not onto 'DUTY'/'ASSIGN' themselves.
const EXPECT_ALIGN_KIND = { gear_hold: 'HAVEN_CHORE', expedition: 'EXPEDITION', duty: 'FORAGE', assign: 'FORAGE' };

function out(o) { console.log(JSON.stringify(o)); }

function livingIds(Game) {
  const me = Game.villagerId;
  const roster = (((Game.state || {}).village || {}).roster || []).filter(function (id) {
    return id && id !== me;
  });
  const ids = [];
  for (let i = 0; i < roster.length; i++) {
    const id = roster[i];
    let dead = false;
    try {
      const p = Game.getPerson ? Game.getPerson(id) : (Game.vpOf ? Game.vpOf(id) : null);
      if (p && p.dead) dead = true;
    } catch (e) {}
    if (!dead) ids.push(id);
  }
  return ids;
}

function forceExplorer(Game, vid) {
  try {
    const a = Game.agencyState();
    a.profiles = a.profiles || {};
    a.profiles[vid] = 'explorer';
  } catch (e) {}
}

function forceWinPlanGear(Game, vid) {
  const v = Game.state.village;
  v.winPlan = v.winPlan || {};
  v.winPlan[vid] = {
    stage: 'gear',
    target: 'fixture_beast',
    node: { nx: (v.px ?? 4) + 2, ny: (v.py ?? 4) },
    party: null,
    sinceDay: ((Game.state.scholar || {}).day || 0),
  };
  try {
    const p = Game.getPerson ? Game.getPerson(vid) : null;
    if (p) {
      p.equipped = {};
      if (Array.isArray(p.items)) {
        const items = (Game.data && Game.data.items) || [];
        const defs = {};
        for (let j = 0; j < items.length; j++) if (items[j]) defs[items[j].id] = items[j];
        p.items = p.items.filter(function (it) {
          const iid = it && (it.itemId || it.id || it);
          const def = defs[iid];
          if (!def) return true;
          if (def.weapon) return false;
          if (def.armor) return false;
          return true;
        });
      }
    }
  } catch (e) {}
}

function stageVillager(Game, vid, hx, hy) {
  try {
    const n = Game.npcNeeds(vid);
    if (n) { n.hunger = 20; n.energy = 80; n.social = 40; n.fear = 10; }
  } catch (e) {}
  try { Game.npcSetNode(vid, hx, hy); } catch (e) {}
  try { Game.npcSetInside(vid, true); } catch (e) {}
}

function livePick(Game, vid, hx, hy) {
  Game.vbrainDisableExtras = false;
  const o = Game.objOf(vid);
  o.kind = 'idle'; o.state = 'idle'; o.indoor = false; o.goal = null; o.goalLine = null;
  o.chore = null; o.purpose = null;
  try {
    const br = Game.state.village.vbrain;
    if (br && br.commit) delete br.commit[vid];
  } catch (e) {}
  Game.objPick(vid, hx, hy);
  const log = Game.vbrainLastLog(vid);
  const commit = Game.vbrainCommit(vid);
  return {
    materialize: o.kind,
    purpose: o.purpose || null,
    indoor: !!o.indoor,
    chore: o.chore || null,
    commitKind: commit ? commit.kind : null,
    commitChore: commit ? (commit.chore || null) : null,
    winPlanAction: commit ? (commit.winPlanAction || null) : null,
    dutyTask: commit ? (commit.dutyTask || null) : null,
    assignTask: commit ? (commit.assignTask || null) : null,
    override: log ? (log.override || null) : null,
    corePick: log ? (log.corePick || null) : null,
    logPick: log ? log.pick : null,
  };
}

(async () => {
  if (CASES.indexOf(CASE) === -1) {
    out({ pass: false, fail: 'unknown case ' + CASE, cases: CASES });
    process.exit(1);
  }
  const { Game } = await loadGame({ seed: SEED, mode: 'herald', fullTelemetry: false });
  await setupGame(Game);

  const v = Game.state.village;
  const hx = v.px ?? 4, hy = v.py ?? 4;
  Game.map.px = hx; Game.map.py = hy;
  v.water = v.water || {}; v.water.clean = 2000; v.water.dirty = 0;
  const ids = livingIds(Game);
  if (ids.length < 1) { out({ skip: 'no living villagers', seed: SEED, case: CASE }); process.exit(2); }

  // Per-case world staging (before any objPick).
  if (CASE === 'duty') {
    // Pantry very low (0 kcal) so the forage DUTY ad weighs 3.2 and
    // top-scores over any core pick (core weights top out at 3.0 for a
    // homebody HAVEN_CHORE). Water kept high so no water DUTY competes.
    try { v.pantry = []; v.pantryKcal = 0; } catch (e) {}
  } else {
    // Pantry full so no survival DUTY ad fires and duty_top_score
    // cannot pre-empt the case under test (kcal >= 4000 → not low).
    try { Game.stockPantry(8000, 'probe'); } catch (e) {}
  }
  if (CASE === 'expedition') {
    // Isolate the EXPEDITION hash path: the duty pick hook is a probe
    // seam (ads still score); the align effect under test is downstream
    // of which override won, not of the override selection. The
    // 'potential' boost raises the hash chance (w 0.55 -> 0.88, chance
    // 0.275 -> 0.44) so a firing villager is found without scanning
    // dozens of seeds; it only feeds expeditionCand's weight.
    Game.vbrainDisableDutyPick = true;
    try {
      const a = Game.agencyState();
      a.potential = a.potential || {};
      for (let pi = 0; pi < ids.length; pi++) a.potential[ids[pi]] = true;
    } catch (e) {}
  }

  const want = WANT_OVERRIDE[CASE];
  const attempts = [];
  for (let i = 0; i < ids.length; i++) {
    const vid = ids[i];
    try {
      stageVillager(Game, vid, hx, hy);
      forceExplorer(Game, vid);
      if (CASE === 'gear_hold') forceWinPlanGear(Game, vid);
      if (CASE === 'assign') {
        v.assignments = v.assignments || {};
        v.assignments[vid] = { task: 'forage', via: 'assignTask' };
      }
      const r = livePick(Game, vid, hx, hy);
      attempts.push({ vid: vid, override: r.override, corePick: r.corePick, commitKind: r.commitKind });
      if (r.override === want) {
        out({
          pass: true, seed: SEED, case: CASE, vid: vid,
          alignPresent: typeof Game.vbrainAlignObjective === 'function',
          materialize: r.materialize, purpose: r.purpose, indoor: r.indoor, chore: r.chore,
          commitKind: r.commitKind, commitChore: r.commitChore, winPlanAction: r.winPlanAction,
          dutyTask: r.dutyTask, assignTask: r.assignTask,
          override: r.override, corePick: r.corePick, logPick: r.logPick,
          expectAlignKind: EXPECT_ALIGN_KIND[CASE],
          aligned: r.materialize === EXPECT_ALIGN_KIND[CASE],
          atCore: r.materialize === r.corePick,
          choreIsCommitChore: r.chore !== null && r.chore === r.commitChore,
        });
        process.exit(0);
      }
    } catch (e) {
      attempts.push({ vid: vid, error: String(e && e.message || e) });
    }
  }
  out({ skip: 'target override ' + want + ' did not fire', seed: SEED, case: CASE, attempts: attempts });
  process.exit(2);
})().catch(function (e) {
  console.error(e);
  process.exit(1);
});
