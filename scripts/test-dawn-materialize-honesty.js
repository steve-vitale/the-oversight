#!/usr/bin/env node
// test-dawn-materialize-honesty.js — OVE-36 Candidate A
//
// Seeded conflict fixture (same as probe-dawn-pick-conflict-20261108):
// explorer + win-plan gear_hold. Proves live objective kind matches the dawn
// commitment after aimed override, narration fields read the commit chore,
// and a failing control (align stripped) restores materialize≠commit.
//
// Usage: node scripts/test-dawn-materialize-honesty.js
// Exit 0 = pass, 1 = fail, 2 = setup skip. No repo writes.
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame } = require(path.join(REPO, 'scripts', 'sim-harness'));

const SEED = 20261108;

function out(o) { console.log(JSON.stringify(o)); }
function fail(msg, extra) {
  out(Object.assign({ pass: false, fail: msg }, extra || {}));
  process.exit(1);
}

function livingIds(Game) {
  const me = Game.villagerId;
  const roster = (((Game.state || {}).village || {}).roster || []).filter(function (id) {
    return id && id !== me;
  });
  const outIds = [];
  for (let i = 0; i < roster.length; i++) {
    const id = roster[i];
    let dead = false;
    try {
      const p = Game.getPerson ? Game.getPerson(id) : (Game.vpOf ? Game.vpOf(id) : null);
      if (p && p.dead) dead = true;
    } catch (e) {}
    if (!dead) outIds.push(id);
  }
  return outIds;
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

function prepConflict(Game) {
  const v = Game.state.village;
  const hx = v.px ?? 4, hy = v.py ?? 4;
  Game.map.px = hx; Game.map.py = hy;
  try { Game.stockPantry(2500, 'probe'); } catch (e) {}
  v.water = v.water || {}; v.water.clean = 2000; v.water.dirty = 0;
  const ids = livingIds(Game);
  if (ids.length < 1) return null;
  const vid = ids[0];
  try {
    const n = Game.npcNeeds(vid);
    if (n) { n.hunger = 20; n.energy = 80; n.social = 40; n.fear = 10; }
  } catch (e) {}
  try { Game.npcSetNode(vid, hx, hy); } catch (e) {}
  try { Game.npcSetInside(vid, true); } catch (e) {}
  forceExplorer(Game, vid);
  forceWinPlanGear(Game, vid);
  return { v, hx, hy, vid };
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
    purpose: o.purpose,
    indoor: !!o.indoor,
    chore: o.chore || null,
    commitKind: commit ? commit.kind : null,
    winPlanAction: commit ? commit.winPlanAction : null,
    override: log ? (log.override || null) : null,
    corePick: log ? (log.corePick || null) : null,
    logPick: log ? log.pick : null,
  };
}

(async () => {
  const { Game } = await loadGame({ seed: SEED, mode: 'herald', fullTelemetry: false });
  await setupGame(Game);

  if (typeof Game.vbrainScorePick !== 'function' || typeof Game.vbrainAlignObjective !== 'function' ||
      !Game.vbrainOwnsDawn || !Game.vbrainOwnsDawn()) {
    out({ skip: 'villager-brain align API missing' });
    process.exit(2);
  }

  const prep = prepConflict(Game);
  if (!prep) { out({ skip: 'no living villagers' }); process.exit(2); }
  const { hx, hy, vid } = prep;

  // --- Honest path: materialize === commit on the conflict fixture ---
  const honest = livePick(Game, vid, hx, hy);
  if (!honest.override) {
    fail('fixture did not fire aimed override', { honest });
  }
  if (honest.commitKind !== honest.materialize) {
    fail('materialize≠commit on conflict fixture', { honest });
  }
  if (honest.winPlanAction !== 'gear_hold' || honest.commitKind !== 'HAVEN_CHORE') {
    fail('expected gear_hold → HAVEN_CHORE commit', { honest });
  }
  if (!honest.indoor || honest.purpose !== 'chore') {
    fail('narration fields must read commit chore hold', { honest });
  }
  if (honest.chore !== 'repair') {
    fail('gear_hold commit chore should be repair', { honest });
  }
  // Core lottery may still disagree — that is intentional stream stability.
  if (!honest.corePick) fail('corePick missing from log', { honest });

  // Agency still honors the commit hold.
  const depart = Game.vbrainExecuteDepart(vid, hx, hy, false);
  if (depart !== 'hold') fail('gear_hold commit should hold at agency', { depart, honest });

  // --- Failing control: strip align on a synthetic core VISIT stub ---
  // Commit/log from the honest pick still carry win_plan:gear_hold. Without
  // align, a core-lottery VISIT objective stays VISIT (the pre-OVE-36 seam).
  // With align restored, the same stub rewrites to the commit chore.
  if (!honest.corePick || honest.corePick === honest.commitKind) {
    // Fixture historically materializes VISIT under gear_hold; if a future
    // seed lands core===commit, the control stub still proves the hook.
  }
  const realAlign = Game.vbrainAlignObjective.bind(Game);
  Game.vbrainAlignObjective = function (id, o) { return o; };
  let controlMismatch = false;
  try {
    const bare = { kind: 'VISIT', purpose: 'visit', indoor: true, state: 'indoor', partsLeft: 2, chore: null };
    Game.vbrainAlignObjective(vid, bare, hx, hy);
    if (bare.kind === 'VISIT' && Game.vbrainCommit(vid) && Game.vbrainCommit(vid).kind === 'HAVEN_CHORE') {
      controlMismatch = true;
    } else {
      fail('control (align stripped) must leave VISIT ≠ HAVEN_CHORE commit', {
        bareKind: bare.kind,
        commit: Game.vbrainCommit(vid),
      });
    }
  } finally {
    Game.vbrainAlignObjective = realAlign;
  }
  const restoredStub = { kind: 'VISIT', purpose: 'visit', indoor: true, state: 'indoor', partsLeft: 2, chore: null };
  Game.vbrainAlignObjective(vid, restoredStub, hx, hy);
  if (restoredStub.kind !== 'HAVEN_CHORE' || restoredStub.purpose !== 'chore' || restoredStub.chore !== 'repair') {
    fail('align must rewrite VISIT stub to gear_hold chore', { restoredStub });
  }

  out({
    pass: true,
    seed: SEED,
    materializeNeqCommit: 0,
    honest: {
      materialize: honest.materialize,
      commit: honest.commitKind,
      override: honest.override,
      corePick: honest.corePick,
      purpose: honest.purpose,
      chore: honest.chore,
      indoor: honest.indoor,
    },
    controlMismatch: controlMismatch,
    depart: depart,
  });
})().catch(function (e) {
  console.error(e);
  process.exit(1);
});
