#!/usr/bin/env node
// probe-dawn-pick-conflict-20261108.js — OVE-34 / game-gaps §2.3
// Measure-only: show that the three legacy dawn voices (goals+obj lottery,
// win-plan depart, agency expedition chance) still *recommend* contradictory
// lead actions on one seeded fixture — and what the live phase-1 brain
// (vbrainScorePick) actually picks when those feeders bid together.
//
// Does NOT implement IAUS curves / ×1.15 / top-3. No policy/food/Loop B edits.
// One loadGame per process. Exit 0 always when the fixture runs; prints JSON.
//
// Usage:
//   node scripts/probe-dawn-pick-conflict-20261108.js
//   SEED=20261108 node scripts/probe-dawn-pick-conflict-20261108.js
'use strict';
const path = require('path');
const { execSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame } = require(path.join(REPO, 'scripts', 'sim-harness'));

const SEED = parseInt(process.env.SEED || '20261108', 10);

function sha12() {
  try { return execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); }
  catch (e) { return 'unknown'; }
}

function dayOf(Game) {
  try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; }
}

function livingIds(Game) {
  const me = Game.villagerId;
  const roster = (((Game.state || {}).village || {}).roster || []).filter(function (id) {
    return id && id !== me;
  });
  const out = [];
  for (let i = 0; i < roster.length; i++) {
    const id = roster[i];
    let dead = false;
    try {
      const p = Game.getPerson ? Game.getPerson(id) : (Game.vpOf ? Game.vpOf(id) : null);
      if (p && p.dead) dead = true;
    } catch (e) {}
    if (!dead) out.push(id);
  }
  return out;
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
    sinceDay: dayOf(Game),
  };
  // Ensure unarmed + unarmored so gear_hold is live (brain feeder and
  // winPlanDepart both require !armed && !armored). Protection is read from
  // person.equipped body slots (equipment.armorOf), not only the items bag.
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

function agencyShadowWouldRange(Game, vid) {
  let prof = null;
  try { prof = Game.npcRangeProfile ? Game.npcRangeProfile(vid) : null; } catch (e) {}
  if (prof !== 'wanderer' && prof !== 'explorer') {
    return { voice: 'agency_expedition', pick: 'stay', reason: 'profile_' + String(prof) };
  }
  let night = false;
  try { night = !!Game.isNight(); } catch (e) {}
  if (night) return { voice: 'agency_expedition', pick: 'stay', reason: 'night' };
  try {
    if (Game.npcTrigger && Game.npcTrigger(vid, 'expedition_launch')) {
      return { voice: 'agency_expedition', pick: 'stay', reason: 'danger_gate' };
    }
  } catch (e) {}
  let chance = prof === 'explorer' ? 0.09 : 0.045;
  try {
    const a = Game.agencyState();
    if (a && a.potential && a.potential[vid]) chance *= 1.6;
  } catch (e) {}
  // Shadow: report the chance voice, not a roll — "would bid EXPEDITION".
  return {
    voice: 'agency_expedition',
    pick: 'EXPEDITION',
    reason: 'chance_bid',
    chance: chance,
    profile: prof,
  };
}

function winPlanShadow(Game, vid, hx, hy) {
  const plan = (((Game.state || {}).village || {}).winPlan || {})[vid] || null;
  if (!plan || !plan.stage) {
    return { voice: 'win_plan', pick: 'normal', reason: 'no_plan' };
  }
  if (plan.stage === 'gear') {
    return { voice: 'win_plan', pick: 'hold', reason: 'gear_hold', stage: plan.stage };
  }
  if (plan.stage === 'party') {
    return { voice: 'win_plan', pick: 'hold_or_launch', reason: 'party_stage', stage: plan.stage };
  }
  if (plan.stage === 'table') {
    return { voice: 'win_plan', pick: 'hold_or_launch', reason: 'table_stage', stage: plan.stage };
  }
  return { voice: 'win_plan', pick: 'normal', reason: 'stage_' + plan.stage, stage: plan.stage };
}

function goalsObjShadow(Game, vid, hx, hy) {
  // Disable brain extras so the core lottery voice is audible alone, then
  // restore. Same objPick path; no second harness.
  const prev = Game.vbrainDisableExtras;
  Game.vbrainDisableExtras = true;
  const o = Game.objOf(vid);
  o.kind = 'idle'; o.state = 'idle'; o.indoor = false; o.goal = null; o.goalLine = null;
  Game.objPick(vid, hx, hy);
  const log = Game.vbrainLastLog ? Game.vbrainLastLog(vid) : null;
  const top = (Game.vgoalState && Game.vgoalState(vid) && Game.vgoalState(vid).top) || null;
  const shadow = {
    voice: 'goals_obj_lottery',
    pick: o.kind,
    reason: (log && log.mode === 'gate') ? ('gate:' + log.gate) : 'lottery',
    corePick: log ? (log.corePick || log.pick) : o.kind,
    vgoalTop: top,
    goalLine: o.goalLine || null,
    indoor: !!o.indoor,
  };
  Game.vbrainDisableExtras = prev;
  return shadow;
}

function brainLivePick(Game, vid, hx, hy) {
  Game.vbrainDisableExtras = false;
  const o = Game.objOf(vid);
  o.kind = 'idle'; o.state = 'idle'; o.indoor = false; o.goal = null; o.goalLine = null;
  // Clear prior commit so this call owns the record.
  try {
    const br = Game.state.village.vbrain;
    if (br && br.commit) delete br.commit[vid];
  } catch (e) {}
  Game.objPick(vid, hx, hy);
  const log = Game.vbrainLastLog(vid);
  const commit = Game.vbrainCommit(vid);
  return {
    voice: 'vbrain_live',
    materialize: o.kind,
    commitKind: commit ? commit.kind : null,
    commitSrc: commit ? commit.vbrainSrc : null,
    winPlanAction: commit ? commit.winPlanAction : null,
    logPick: log ? log.pick : null,
    corePick: log ? (log.corePick || null) : null,
    override: log ? (log.override || null) : null,
    mode: log ? log.mode : null,
    indoor: !!o.indoor,
    extras: (log && log.candidates)
      ? log.candidates.filter(function (c) { return c.vbrainSrc; }).map(function (c) {
        return { kind: c.kind, src: c.vbrainSrc, action: c.winPlanAction || null, score: c.score };
      })
      : [],
  };
}

function classifyConflict(goals, win, agency, brain) {
  // Three legacy voices: map to coarse lead actions for comparison.
  const g = goals.pick; // objective kind
  const w = win.pick;   // hold | normal | hold_or_launch
  const a = agency.pick; // EXPEDITION | stay
  const contradictions = [];
  // goals wants outdoor errand while win-plan holds home
  const outdoor = { FORAGE: 1, WATER: 1, TRAPS: 1, EXPLORE: 1, HUNT: 1, HAUL: 1, VISIT: 1 };
  if (outdoor[g] && w === 'hold') {
    contradictions.push({ pair: 'goals_vs_winplan', goals: g, winPlan: w });
  }
  // goals wants indoor/hall while agency bids expedition
  if ((g === 'HAVEN_CHORE' || g === 'REST' || g === 'EAT' || g === 'SEEK') && a === 'EXPEDITION') {
    contradictions.push({ pair: 'goals_vs_agency', goals: g, agency: a });
  }
  // win-plan holds while agency bids leave
  if (w === 'hold' && a === 'EXPEDITION') {
    contradictions.push({ pair: 'winplan_vs_agency', winPlan: w, agency: a });
  }
  // Live brain: materialize ≠ commit (aimed override honesty seam)
  if (brain.commitKind && brain.materialize && brain.commitKind !== brain.materialize) {
    contradictions.push({
      pair: 'materialize_vs_commit',
      materialize: brain.materialize,
      commit: brain.commitKind,
      override: brain.override,
    });
  }
  return {
    legacyThreeDisagree: contradictions.some(function (c) {
      return c.pair === 'goals_vs_winplan' || c.pair === 'goals_vs_agency' || c.pair === 'winplan_vs_agency';
    }),
    contradictions: contradictions,
  };
}

(async () => {
  const { Game } = await loadGame({ seed: SEED, mode: 'herald', fullTelemetry: false });
  await setupGame(Game);

  if (typeof Game.vbrainScorePick !== 'function' || !Game.vbrainOwnsDawn || !Game.vbrainOwnsDawn()) {
    console.log(JSON.stringify({
      pass: false,
      fail: 'villager-brain phase-1 entry missing on tip — cannot measure residual vs live brain',
      sha: sha12(),
      seed: SEED,
    }));
    process.exit(1);
  }

  const v = Game.state.village;
  const hx = v.px ?? 4, hy = v.py ?? 4;
  Game.map.px = hx; Game.map.py = hy;
  try { Game.stockPantry(2500, 'probe'); } catch (e) {} // low-ish → forage voice
  v.water = v.water || {}; v.water.clean = 2000; v.water.dirty = 0;

  const ids = livingIds(Game);
  if (ids.length < 1) {
    console.log(JSON.stringify({ skip: 'no living villagers', sha: sha12(), seed: SEED }));
    process.exit(2);
  }
  const vid = ids[0];

  try {
    const n = Game.npcNeeds(vid);
    if (n) { n.hunger = 20; n.energy = 80; n.social = 40; n.fear = 10; }
  } catch (e) {}
  try { Game.npcSetNode(vid, hx, hy); } catch (e) {}
  try { Game.npcSetInside(vid, true); } catch (e) {}

  forceExplorer(Game, vid);
  forceWinPlanGear(Game, vid);

  // Pure-read shadows first (no RNG). Then goals-only lottery and live brain
  // each get their own objPick; accept that goals vs brain draws differ —
  // the legacy three-way claim uses goals + win + agency only.
  const agency = agencyShadowWouldRange(Game, vid);
  const win = winPlanShadow(Game, vid, hx, hy);
  // Confirm feeder list includes gear_hold before any lottery draw.
  const feedCheck = [{ kind: 'HAVEN_CHORE', w: 1.4 }];
  Game.vbrainFeedExtras(vid, feedCheck, hx, hy);
  const fedKinds = feedCheck.map(function (c) {
    return { kind: c.kind, src: c.vbrainSrc || null, action: c.winPlanAction || null, w: c.w };
  });
  const goals = goalsObjShadow(Game, vid, hx, hy);
  const brain = brainLivePick(Game, vid, hx, hy);
  const verdict = classifyConflict(goals, win, agency, brain);
  verdict.feedExtras = fedKinds;
  verdict.winPlanFeederPresent = fedKinds.some(function (c) {
    return c.action === 'gear_hold' || c.src === 'win_plan';
  });

  // Agency source still contains the chance-roll fallback (for unloaded brain).
  const agencySrc = require('fs').readFileSync(path.join(REPO, 'src/js/villager-agency.js'), 'utf8');
  const agencyHonorsBrain = /vbrainOwnsDawn/.test(agencySrc) && /vbrainExecuteDepart/.test(agencySrc);
  const chanceRollStillPresent = /R\(\) < chance/.test(agencySrc);

  const out = {
    probe: 'dawn-pick-conflict',
    date: '2026-11-08',
    task: 'OVE-34',
    sha: sha12(),
    seed: SEED,
    vid: vid,
    fixture: {
      profileForced: 'explorer',
      winPlanStageForced: 'gear',
      pantryKcalTarget: 2500,
      note: 'Three legacy voices bid on one person/day; live brain is the fourth column.',
    },
    shadows: { goals: goals, winPlan: win, agency: agency },
    liveBrain: brain,
    verdict: verdict,
    architecture: {
      phase1Landed: true,
      vbrainOwnsDawn: true,
      agencyHonorsBrain: agencyHonorsBrain,
      chanceRollFallbackStillInSource: chanceRollStillPresent,
      note: 'Chance roll runs only when vbrainOwnsDawn is absent; with brain loaded, agencyTick honors commitment.',
    },
    // Explicit claim for the doc: legacy three disagree on this fixture.
    contradictoryPicksShown: !!verdict.legacyThreeDisagree,
  };

  console.log(JSON.stringify(out, null, 2));
  if (!out.contradictoryPicksShown) process.exitCode = 1;
})().catch(function (e) {
  console.error(e);
  process.exit(1);
});
