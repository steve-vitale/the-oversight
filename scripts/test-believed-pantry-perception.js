#!/usr/bin/env node
// Perception probe — VILLAGER-BRAIN seam 4 remainder (believed pantry/cistern).
// One objResourceBelief(vid) feeds food-security (vgoalGate), FORAGE/WATER
// urgency (objPick inputs), and village-resource favors (convoFindFavorNeed).
//
// Cases (fresh loadGame each, seed 4242 + offset):
//   home:      at haven → fromLive, matches live totals.
//   away:      leave with full pantry belief, drain live → belief stays full;
//              food_security stays baseline; favor skips forage_help;
//              FORAGE weight from believed pantry, not live empty.
//   stale:     force-stale seam (no away) same freeze.
//   control:   strip away/stale filter → away reacts to live empty again.
//   panel:     pre-registered errand-mix absDelta ≤ 0.08 vs extras-off baseline
//              (at-home path must stay live-equivalent / RNG-panel-safe).
'use strict';
const path = require('path');
const { spawnSync } = require('child_process');
const { loadGame } = require('./sim-harness');

const SEED = 4242;
const PANEL_SEED = 20261108;
const PICKS = 500;
const CORE_KINDS = ['FORAGE', 'WATER', 'VISIT', 'HAVEN_CHORE', 'TRAPS', 'SEEK', 'EXPLORE', 'HUNT', 'HAUL', 'REST', 'EAT', 'LEAVE'];
const TOLERANCE = 0.08;

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

async function stage(seedOff) {
  const { Game } = await loadGame({ seed: SEED + seedOff });
  await Game.init();
  Game.genRoster('Breaker');
  const rid = Game.generatedRoster[0].id;
  Game.newGame('Breaker', null, rid);
  Game.depart();
  const v = Game.state.village;
  const hx = v.px ?? 4, hy = v.py ?? 4;
  Game.map.px = hx; Game.map.py = hy;
  try { Game.stockPantry(20000, 'test'); } catch (e) {}
  v.water = v.water || {};
  v.water.clean = 2000;
  v.water.dirty = 0;
  // Burn history so pantryDaysEstimate is finite and comparable.
  v.burnHistory = [2000, 2000, 2000, 2000, 2000, 2000, 2000];
  const ids = (v.roster || []).filter(id => id !== Game.villagerId);
  for (const id of ids) {
    try {
      const n = Game.npcNeeds(id);
      n.hunger = 10; n.energy = 80; n.social = 40; n.fear = 10;
    } catch (e) {}
    try { Game.npcSetNode(id, hx, hy); } catch (e) {}
    try { Game.npcSetInside(id, true); } catch (e) {}
    try { const vp = Game.vpOf(id); if (vp) vp.hp = 100; } catch (e) {}
  }
  const day = (Game.state.scholar || {}).day || 0;
  return { Game, v, hx, hy, ids, day };
}

function drainPantry(Game, v) {
  v.pantry = [];
  try { v.pantryKcal = 0; } catch (e) {}
}

function markAway(Game, v, vid, hx, hy) {
  // Perception freeze then mark away — same order as objDepart.
  try { Game.objResourceSee(vid); } catch (e) {}
  v.away = v.away || {};
  v.away[vid] = {
    nx: hx + 2, ny: hy, purpose: 'forage',
    sinceDay: (Game.state.scholar || {}).day || 0,
    sincePart: 0, duration: 8,
  };
}

function forageWeightFromBelief(Game, vid) {
  // Mirror objPick FORAGE gate arithmetic without rolling the lottery.
  const bel = Game.objResourceBelief(vid) || {};
  const pantry = (typeof bel.pantryKcal === 'number') ? bel.pantryKcal : 0;
  const n = Game.npcNeeds(vid) || {};
  const goal = (typeof Game.npcGoal === 'function') ? Game.npcGoal(vid) : null;
  const feedDrive = (goal === 'feed');
  if (!(pantry < 4000 || (n.hunger || 0) > 50 || (feedDrive && pantry < 6000))) return 0;
  var w = pantry < 2000 ? 4 : pantry < 4000 ? 2.5 : 1.5;
  if (feedDrive) w += 1.5;
  return w;
}

function forageWeightFromLive(Game, vid) {
  const v = Game.state.village;
  var pantry = 0;
  try { pantry = Game.pantryKcalLive(v); } catch (e) {}
  const n = Game.npcNeeds(vid) || {};
  const goal = (typeof Game.npcGoal === 'function') ? Game.npcGoal(vid) : null;
  const feedDrive = (goal === 'feed');
  if (!(pantry < 4000 || (n.hunger || 0) > 50 || (feedDrive && pantry < 6000))) return 0;
  var w = pantry < 2000 ? 4 : pantry < 4000 ? 2.5 : 1.5;
  if (feedDrive) w += 1.5;
  return w;
}

(async () => {
  console.log('== helpers present ==');
  {
    const { Game } = await stage(0);
    check('objResourceBelief present', typeof Game.objResourceBelief === 'function');
    check('objResourceSee present', typeof Game.objResourceSee === 'function');
    check('objResourceLiveSnap present', typeof Game.objResourceLiveSnap === 'function');
  }

  console.log('== at-haven sees live ==');
  {
    const { Game, v, ids } = await stage(1);
    const vid = ids[0];
    check('probe villager', !!vid);
    const live = Game.objResourceLiveSnap();
    const bel = Game.objResourceBelief(vid);
    check('home: fromLive', !!bel.fromLive && !bel.unknown, JSON.stringify(bel));
    check('home: pantry matches live', bel.pantryKcal === live.pantryKcal,
      'bel=' + bel.pantryKcal + ' live=' + live.pantryKcal);
    check('home: waterDays matches live', Math.abs((bel.waterDays || 0) - (live.waterDays || 0)) < 1e-9,
      'bel=' + bel.waterDays + ' live=' + live.waterDays);
    const gate = Game.vgoalGate(vid, 'food_security');
    check('home: food_security baseline (stocked)', gate === 0.4, 'gate=' + gate);
  }

  console.log('== away freezes last-seen (gap closed) ==');
  {
    const { Game, v, hx, hy, ids } = await stage(2);
    const vid = ids[0];
    const before = Game.objResourceBelief(vid);
    const stockedKcal = before.pantryKcal;
    check('pre-away stocked', stockedKcal >= 15000, 'kcal=' + stockedKcal);
    markAway(Game, v, vid, hx, hy);
    const frozen = Game.objResourceBelief(vid);
    check('away: not fromLive', !frozen.fromLive && !frozen.unknown, JSON.stringify(frozen));
    check('away: belief still stocked', frozen.pantryKcal === stockedKcal,
      'bel=' + frozen.pantryKcal + ' stocked=' + stockedKcal);

    drainPantry(Game, v);
    v.water.clean = 0; v.water.dirty = 0;
    const liveAfter = Game.objResourceLiveSnap();
    check('live pantry drained', liveAfter.pantryKcal === 0, 'live=' + liveAfter.pantryKcal);
    const still = Game.objResourceBelief(vid);
    check('away after drain: belief unchanged', still.pantryKcal === stockedKcal,
      'bel=' + still.pantryKcal);
    check('away after drain: waterDays frozen', still.waterDays === frozen.waterDays,
      'bel=' + still.waterDays + ' was=' + frozen.waterDays);

    // food_security must not flip to 1 from live empty (hunger kept low).
    const n = Game.npcNeeds(vid); n.hunger = 10;
    const gate = Game.vgoalGate(vid, 'food_security');
    check('away: food_security ignores live empty', gate === 0.4, 'gate=' + gate);

    // Favor village-resource scan must not invent forage_help from live empty.
    const need = Game.convoFindFavorNeed(vid);
    const badFavor = need && (need.kind === 'forage_help' || need.kind === 'water_haul');
    check('away: favor skips live resource need', !badFavor,
      need ? JSON.stringify(need) : 'null');

    const wBel = forageWeightFromBelief(Game, vid);
    const wLive = forageWeightFromLive(Game, vid);
    check('away: FORAGE weight from belief not live empty', wBel === 0 && wLive >= 4,
      'wBel=' + wBel + ' wLive=' + wLive);
  }

  console.log('== forced stale (no away) ==');
  {
    const { Game, v, ids } = await stage(3);
    const vid = ids[0];
    Game.objResourceSee(vid);
    const stocked = (Game.state.village.resourceBelief[vid] || {}).pantryKcal;
    Game._resourceBeliefForceStale = {};
    Game._resourceBeliefForceStale[vid] = true;
    drainPantry(Game, v);
    const bel = Game.objResourceBelief(vid);
    check('stale: not fromLive', !bel.fromLive && bel.pantryKcal === stocked,
      JSON.stringify(bel));
    const n = Game.npcNeeds(vid); n.hunger = 10;
    check('stale: food_security baseline', Game.vgoalGate(vid, 'food_security') === 0.4);
    const need = Game.convoFindFavorNeed(vid);
    const badFavor = need && (need.kind === 'forage_help' || need.kind === 'water_haul');
    check('stale: favor skips live empty', !badFavor, need ? JSON.stringify(need) : 'null');
  }

  console.log('== failing control: strip filter → away uses live ==');
  {
    const { Game, v, hx, hy, ids } = await stage(4);
    const vid = ids[0];
    markAway(Game, v, vid, hx, hy);
    drainPantry(Game, v);
    // Keep cistern stocked so the village-resource favor lands on forage_help
    // (water_haul outranks forage when clean < 10).
    v.water.clean = 2000; v.water.dirty = 0;
    const n = Game.npcNeeds(vid); n.hunger = 10;
    // Control: belief always returns live snap (the pre-fix omniscience).
    const _orig = Game.objResourceBelief.bind(Game);
    Game.objResourceBelief = function () {
      const snap = this.objResourceLiveSnap();
      return Object.assign({}, snap, {
        seenDay: (this.state.scholar || {}).day || 0,
        staleDays: 0, fromLive: true, unknown: false,
      });
    };
    const gateLive = Game.vgoalGate(vid, 'food_security');
    const needLive = Game.convoFindFavorNeed(vid);
    const wLive = forageWeightFromBelief(Game, vid);
    check('control: food_security heats on live empty', gateLive === 1, 'gate=' + gateLive);
    check('control: favor sees forage_help', !!(needLive && needLive.kind === 'forage_help'),
      needLive ? JSON.stringify(needLive) : 'null');
    check('control: FORAGE weight urgent', wLive >= 4, 'w=' + wLive);
    Game.objResourceBelief = _orig;
    const gateRestored = Game.vgoalGate(vid, 'food_security');
    check('control restored: food_security baseline again', gateRestored === 0.4, 'gate=' + gateRestored);
  }

  console.log('== pre-registered errand-mix panel (absDelta ≤ 0.08) ==');
  {
    const repo = path.join(__dirname, '..');
    function panelArm(disableExtras) {
      const code = `
        const path = require('path');
        const { loadGame, setupGame } = require(path.join(${JSON.stringify(repo)}, 'scripts', 'sim-harness'));
        (async () => {
          const { Game } = await loadGame({ seed: ${PANEL_SEED}, mode: 'herald', fullTelemetry: false });
          await setupGame(Game);
          const v = Game.state.village; const hx = v.px ?? 4, hy = v.py ?? 4;
          try { Game.stockPantry(20000, 'test'); } catch (e) {}
          v.water = v.water || {}; v.water.clean = 2000; v.water.dirty = 0;
          const ids = (v.roster || []).filter(id => id !== Game.villagerId);
          for (const id of ids) {
            try { const n = Game.npcNeeds(id); if (n) { n.hunger = 10; n.energy = 80; n.social = 40; n.fear = 10; } } catch (e) {}
            try { Game.npcSetNode(id, hx, hy); } catch (e) {}
            v.trust = v.trust || {}; v.trust[id] = 50;
          }
          const vid = ids[0];
          Game.vbrainDisableExtras = ${disableExtras ? 'true' : 'false'};
          const kinds = [];
          for (let i = 0; i < ${PICKS}; i++) {
            const o = Game.objOf(vid); o.kind = 'idle'; o.state = 'idle';
            Game.objPick(vid, hx, hy);
            const last = Game.vbrainLastLog(vid);
            kinds.push((last && (last.corePick || last.pick)) || o.kind);
          }
          const shares = {};
          for (const k of kinds) shares[k] = (shares[k] || 0) + 1;
          for (const k of Object.keys(shares)) shares[k] /= kinds.length;
          process.stdout.write(JSON.stringify({ shares, n: kinds.length }));
        })().catch(e => { console.error(e); process.exit(2); });
      `;
      const r = spawnSync(process.execPath, ['-e', code], { encoding: 'utf8', maxBuffer: 5e6 });
      if (r.status !== 0) {
        check('panel arm ok', false, (r.stderr || '').slice(0, 400));
        return null;
      }
      return JSON.parse(r.stdout.trim().split('\n').pop());
    }
    const baseArm = panelArm(true);
    const treatArm = panelArm(false);
    if (baseArm && treatArm) {
      const violations = [];
      const drifts = {};
      for (const k of CORE_KINDS) {
        const b = baseArm.shares[k] || 0;
        const t = treatArm.shares[k] || 0;
        const d = Math.abs(t - b);
        drifts[k] = { base: +b.toFixed(4), treat: +t.toFixed(4), absDelta: +d.toFixed(4) };
        if (d > TOLERANCE) violations.push({ kind: k, absDelta: d, tol: TOLERANCE });
      }
      check('errand-mix absDelta within pre-registered ±0.08', violations.length === 0,
        JSON.stringify({ violations, drifts }));
    }
  }

  console.log('== result ==');
  console.log(pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
})().catch(e => {
  console.error(e);
  process.exit(2);
});
