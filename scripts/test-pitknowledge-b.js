#!/usr/bin/env node
// scripts/test-pitknowledge-b.js — proof for the pit-trap knowledge channel
// (arm sim-pitknowledge-b, loop B food-economy axis, run
// fleshout-loop-b-20261018T175233Z).
//
// The pitstaff arm (sim-pitstaff-b, 2026-10-18) proved the boar channel is
// KNOWLEDGE-blocked: pit_trap recipe L0 on 8/8 baseline runs; the starting
// codex never carries it; the Trapper Handbook surfaced 0/8; 0 NPCs knew any
// trap recipe; the witnessed-catch L1 bootstrap is chicken-and-egg.
// Game.craft refuses honestly at L0 — and must keep refusing.
//
// This arm opens the channel with the smallest honest change, mirroring the
// PROVEN snare-knowledge channel (trapline 2026-10-13):
//   - characterGen.json: knowsPit on hunting_guide, trail_crew, rancher
//     (the trapper backgrounds; each already knowsSnare)
//   - game.js: knowsPit carried into villager profiles (both paths); a
//     scholar whose occupation knowsPit starts with pit_trap L3 (background,
//     like "Hunters start knowing the snare")
//   - villager-objectives.js: TRAPS purpose admits pit-knowing hands; the
//     'traps' return runs a pit line (18%/return, species from the
//     pit_trap table, 400-1000 kcal carried share, named by species); a
//     witnessed pit catch grants pit_trap L1 (the checkTraps learnability
//     beat, through the village's own hands — the bootstrap that doesn't
//     need a first pit of your own); a pit-knowing teacher SHOWS you once
//     (trust 15+, at haven, L0) -> L1 'taught'
//   - villager-agency.js: pit apprenticeship spreads knowsPit among
//     villagers (topic 'pit'), with the pit lesson's own chore line +
//     overhear beat
// All grants go through grantKnowledge at L1 (blind 35% craft, materials at
// risk) — the knowledge gate is never bypassed. L3 only for background.
// PITKNOWLEDGE=0 disables every reader for the det-gate control.
//
// PART A — fixture (RED/GREEN), real Game via sim-harness:
//   RED-1: knowsSnare-only teacher -> 10 'traps' returns -> pit_trap stays L0
//   RED-2: knowsPit teacher, trust 10 -> no 'taught' grant (regard gate)
//   RED-3: knowsPit teacher, player away from haven -> no 'taught' grant
//   RED-4: Game.craft('pit_trap') at L0 -> null + honest refusal (gate kept)
//   GREEN-1: knowsPit teacher, trust 20, at haven -> 1 return -> pit_trap L1
//            via 'taught', taughtPit set, exactly-once (2nd return: no refire)
//   GREEN-2: witnessed pit catch -> pit_trap L1 via 'witnessed' (loop returns
//            until an npc_pit tele fires; the catch beat narrates the species)
//   GREEN-3: pit_trap L1 + sticks -> Game.craft('pit_trap') attempts (no
//            refusal; materials consumed or trap made)
//   GREEN-4: pitLessonOverhear direct -> L1 'witnessed' at trust 15+;
//            refuses at trust 10
// PART B — det-gate: PITKNOWLEDGE=0 vs unset, 2 seeds x 2 policies x 40d,
//   per-day trajectory hashes byte-identical (proves the channel is the only
//   delta). Run as: node scripts/test-pitknowledge-b.js detgate
//   then: PITKNOWLEDGE=0 node scripts/test-pitknowledge-b.js detgate
//   and diff the DETGATE lines.
// PART C — smoke: 2 seeds x 60d leadfeast, channel on: report pit_trap
//   level/via, npc_pit/pit_teach/pit_overhear tele counts. Informational.
//
// Usage: FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/test-pitknowledge-b.js [part]
//   part: fixture (default) | detgate | smoke
'use strict';
const assert = require('assert');
const { loadGame, setupGame, quietLog } = require('./sim-harness');

const MODE = process.argv[2] || 'fixture';
const FLAG_OFF = process.env.PITKNOWLEDGE === '0';

async function newWorld(seed) {
  const { Game } = await loadGame({ seed, mode: 'leanwinter', fullTelemetry: false });
  await setupGame(Game);
  return Game;
}

function atHaven(Game) {
  const v = Game.state.village || {};
  Game.map.px = (v.px == null ? 4 : v.px);
  Game.map.py = (v.py == null ? 4 : v.py);
}

function awayFromHaven(Game) {
  const v = Game.state.village || {};
  Game.map.px = ((v.px == null ? 4 : v.px) + 3) % 9;
  Game.map.py = ((v.py == null ? 4 : v.py) + 3) % 9;
}

function pickVillager(Game) {
  const roster = (Game.state.village || {}).roster || [];
  const me = Game.villagerId;
  const vid = roster.find(id => id !== me);
  assert(vid, 'no villager in roster');
  return vid;
}

function pitLevel(Game) { return (((Game.state.codex || {}).recipes || {}).pit_trap || {}).level || 0; }
function pitVia(Game) { return (((Game.state.codex || {}).recipes || {}).pit_trap || {}).via || null; }

let passed = 0;
function ok(name, cond, extra) {
  assert(cond, 'FAIL: ' + name + (extra ? ' — ' + extra : ''));
  passed++;
  console.log('  ok: ' + name);
}

async function partFixture() {
  console.log('PART A — fixture (real Game, seed 6601)');
  // ---- RED-1: snare-only teacher never teaches the pit
  {
    const Game = await newWorld(6601);
    const vid = pickVillager(Game);
    const vp = Game.vpOf(vid); vp.knowsSnare = true; vp.knowsPit = false;
    Game.state.village.trust = Game.state.village.trust || {};
    Game.state.village.trust[vid] = 20;
    atHaven(Game);
    await quietLog(async () => { for (let i = 0; i < 10; i++) Game.objReturnEffect(vid, 'traps'); });
    ok('RED-1 knowsSnare-only teacher: pit_trap stays L0 after 10 returns', pitLevel(Game) === 0);
  }
  // ---- RED-2: regard gate — trust 10, no taught grant
  {
    const Game = await newWorld(6601);
    const vid = pickVillager(Game);
    const vp = Game.vpOf(vid); vp.knowsPit = true;
    Game.state.village.trust = Game.state.village.trust || {};
    Game.state.village.trust[vid] = 10;
    atHaven(Game);
    await quietLog(async () => { Game.objReturnEffect(vid, 'traps'); });
    ok('RED-2 trust 10: no taughtPit flag', !vp.taughtPit);
    ok('RED-2 trust 10: no taught grant', pitVia(Game) !== 'taught');
  }
  // ---- RED-3: player away — no teach
  {
    const Game = await newWorld(6601);
    const vid = pickVillager(Game);
    const vp = Game.vpOf(vid); vp.knowsPit = true;
    Game.state.village.trust = Game.state.village.trust || {};
    Game.state.village.trust[vid] = 20;
    awayFromHaven(Game);
    await quietLog(async () => { Game.objReturnEffect(vid, 'traps'); });
    ok('RED-3 player away: no taughtPit flag', !vp.taughtPit);
    ok('RED-3 player away: pit_trap stays L0', pitLevel(Game) === 0);
  }
  // ---- RED-4: the honest refusal is kept
  {
    const Game = await newWorld(6601);
    Game.state.codex.recipes = Game.state.codex.recipes || {};
    delete Game.state.codex.recipes.pit_trap;
    let said = '';
    const oSay = Game.say; Game.say = (s) => { said += s + '\n'; };
    const r = Game.craft('pit_trap');
    Game.say = oSay;
    ok('RED-4 craft at L0 refuses (null)', r === null);
    ok('RED-4 refusal narrates honestly', /don't know how to make/i.test(said));
  }
  // ---- GREEN-1: the teach beat
  {
    const Game = await newWorld(6601);
    const vid = pickVillager(Game);
    const vp = Game.vpOf(vid); vp.knowsPit = true;
    Game.state.village.trust = Game.state.village.trust || {};
    Game.state.village.trust[vid] = 20;
    atHaven(Game);
    let said = '';
    const oSay = Game.say; Game.say = (s) => { said += s + '\n'; };
    await quietLog(async () => { Game.objReturnEffect(vid, 'traps'); });
    Game.say = oSay;
    ok('GREEN-1 teach: pit_trap L1', pitLevel(Game) === 1);
    ok('GREEN-1 teach: via taught', pitVia(Game) === 'taught');
    ok('GREEN-1 teach: taughtPit set', !!vp.taughtPit);
    ok('GREEN-1 teach: beat narrates the pit (not a flag flip)', /pit/i.test(said) && /stakes|depth/i.test(said));
    const lvlBefore = pitLevel(Game);
    await quietLog(async () => { Game.objReturnEffect(vid, 'traps'); });
    ok('GREEN-1 teach: exactly once (no refire)', pitLevel(Game) === lvlBefore && vp.taughtPit === true);
  }
  // ---- GREEN-2: witnessed pit catch
  {
    const Game = await newWorld(6602);
    const vid = pickVillager(Game);
    const vp = Game.vpOf(vid); vp.knowsPit = true;
    Game.state.village.trust = Game.state.village.trust || {};
    Game.state.village.trust[vid] = 10; // below teach gate: only the catch can teach
    atHaven(Game);
    // isolate the witnessed path: a scholar who doesn't already know the pit
    // (seed 6602's scholar may hold the background L3 from their occupation)
    Game.state.codex.recipes = Game.state.codex.recipes || {};
    Game.state.codex.recipes.pit_trap = { level: 0 };
    const teles = [];
    const oTele = Game.tele; Game.tele = (t, d) => { teles.push([t, d]); try { return oTele.call(Game, t, d); } catch (e) {} };
    let said = '';
    const oSay = Game.say; Game.say = (s) => { said += s + '\n'; };
    let fired = 0;
    await quietLog(async () => {
      for (let i = 0; i < 80 && fired === 0; i++) {
        Game.objReturnEffect(vid, 'traps');
        if (teles.some(x => x[0] === 'npc_pit')) fired = i + 1;
      }
    });
    Game.tele = oTele; Game.say = oSay;
    ok('GREEN-2 pit catch fires within 80 returns (18%/return)', fired > 0, 'fired=' + fired);
    ok('GREEN-2 witnessed catch grants pit_trap L1', pitLevel(Game) === 1);
    ok('GREEN-2 witnessed catch via witnessed', pitVia(Game) === 'witnessed');
    const sp = (teles.find(x => x[0] === 'npc_pit') || [])[1] || {};
    ok('GREEN-2 catch beat names a pit-table species', ['white_tailed_deer', 'wild_boar', 'raccoon', 'opossum'].includes(sp.species), JSON.stringify(sp));
    ok('GREEN-2 catch beat narrates honestly', new RegExp(sp.species === 'wild_boar' ? 'boar' : 'pit', 'i').test(said) || /pit/i.test(said));
  }
  // ---- GREEN-3: L1 -> craft attempts (blind, honest)
  {
    const Game = await newWorld(6601);
    Game.state.codex.recipes = Game.state.codex.recipes || {};
    Game.state.codex.recipes.pit_trap = { level: 1, via: 'witnessed' };
    Game.state.scholar.inventory.push({ name: 'stick', material: 'stick', units: 10, kcalEach: 0 });
    let said = '';
    const oSay = Game.say; Game.say = (s) => { said += s + '\n'; };
    const sticksBefore = Game.state.scholar.inventory.filter(i => i.material === 'stick').reduce((t, i) => t + i.units, 0);
    const r = await quietLog(async () => Game.craft('pit_trap'));
    Game.say = oSay;
    const sticksAfter = Game.state.scholar.inventory.filter(i => i.material === 'stick').reduce((t, i) => t + i.units, 0);
    const made = (Game.state.scholar.tools || []).some(t => t && t.recipeId === 'pit_trap');
    ok('GREEN-3 L1 craft attempts (materials consumed or trap made)', sticksAfter < sticksBefore || made === true, `sticks ${sticksBefore}->${sticksAfter}, made=${made}`);
    ok('GREEN-3 no L0-style refusal', !/don't know how to make/i.test(said));
  }
  // ---- GREEN-4: overhear beat direct
  {
    const Game = await newWorld(6601);
    const vid = pickVillager(Game);
    const vp = Game.vpOf(vid); vp.knowsPit = true;
    Game.state.village.trust = Game.state.village.trust || {};
    Game.state.village.trust[vid] = 20;
    atHaven(Game);
    const r = await quietLog(async () => Game.pitLessonOverhear(vid, true));
    ok('GREEN-4 overhear grants L1 at trust 20', r === true && pitLevel(Game) === 1 && pitVia(Game) === 'witnessed');
    const Game2 = await newWorld(6601);
    const vid2 = pickVillager(Game2);
    Game2.vpOf(vid2).knowsPit = true;
    Game2.state.village.trust = Game2.state.village.trust || {};
    Game2.state.village.trust[vid2] = 10;
    atHaven(Game2);
    const r2 = await quietLog(async () => Game2.pitLessonOverhear(vid2, true));
    ok('GREEN-4 overhear refuses at trust 10', r2 === false && ((((Game2.state.codex || {}).recipes || {}).pit_trap || {}).level || 0) === 0);
  }
  console.log(`PART A: ${passed} checks passed.`);
}

function trajHash(Game) {
  const s = Game.state.scholar || {};
  const v = Game.state.village || {};
  const cx = Game.state.codex || {};
  const parts = [
    s.day, Math.round(s.health || 0), Math.round(s.kcal || 0),
    (v.roster || []).length,
    ((v.roster || []).filter(id => { try { const p = Game.vpOf(id); return p && !p.dead; } catch (e) { return true; } })).length,
    Math.round((v.pantry || []).reduce((t, p) => t + (p.kcalEach || 0) * (p.units || 0), 0)),
    ((cx.recipes || {}).snare || {}).level || 0,
    ((cx.recipes || {}).pit_trap || {}).level || 0,
  ];
  return parts.join('|');
}

async function partDetgate() {
  // det-gate: PITKNOWLEDGE=0 vs unset must be byte-identical per-day — ON
  // SEEDS WHERE THE FEATURE CANNOT FIRE (no pit occupation in the starting
  // roster; scan-verified quiet: 6601, 6603, 6604, 6607, 6609). On
  // feature-live seeds (6602 scholar=guide, 6605 rancher, 6608
  // scholar=trail_crew) on≠off IS the treatment — the sweep measures it.
  // Run this file twice (with and without the env var) and diff DETGATE lines.
  const seeds = (process.env.DETSEEDS || '6601,6603').split(',').map(Number);
  console.log('PART B — det-gate (PITKNOWLEDGE=' + (FLAG_OFF ? '0' : 'unset') + ', seeds ' + seeds.join(',') + ')');
  const { belongfeast, leadfeast } = require('./policies/feastscale');
  for (const seed of seeds) {
    for (const [pid, base] of [['leadfeast', leadfeast], ['belongfeast', belongfeast]]) {
      const { Game } = await loadGame({ seed, mode: 'leanwinter', fullTelemetry: false });
      await setupGame(Game);
      const hashes = [];
      const policy = Object.assign({}, base);
      const oDaily = base.daily;
      let sawPit = 0;
      policy.daily = (G, ctx) => {
        const r = oDaily ? oDaily(G, ctx) : undefined;
        hashes.push(trajHash(G));
        try {
          const v = G.state.village || {};
          for (const id of (v.roster || [])) { const p = G.vpOf(id); if (p && p.knowsPit) { sawPit = 1; break; } }
          if ((((G.state.codex || {}).recipes || {}).pit_trap || {}).level > 0) sawPit = 1;
        } catch (e) {}
        return r;
      };
      const { runDays } = require('./sim-harness');
      await quietLog(async () => { await runDays(Game, policy, { days: 40 }); });
      const h = require('crypto').createHash('sha1').update(hashes.join('\n')).digest('hex');
      console.log(`DETGATE seed=${seed} policy=${pid} days=${hashes.length} hash=${h} pitSeen=${sawPit}`);
    }
  }
}

async function partSmoke() {
  console.log('PART C — smoke (channel on, 2 seeds x 60d leadfeast)');
  const { leadfeast } = require('./policies/feastscale');
  const { runDays } = require('./sim-harness');
  for (const seed of [6601, 6602]) {
    const { Game } = await loadGame({ seed, mode: 'leanwinter', fullTelemetry: false });
    await setupGame(Game);
    const counts = { npc_pit: 0, pit_teach: 0, pit_overhear: 0, pit_lesson: 0, boar: 0, pitKcal: 0 };
    const oTele = Game.tele;
    Game.tele = function (t, d) {
      try {
        if (t === 'npc_pit') { counts.npc_pit++; counts.pitKcal += (d && d.kcal) || 0; if (d && d.species === 'wild_boar') counts.boar++; }
        if (t === 'pit_teach') counts.pit_teach++;
        if (t === 'pit_overhear') counts.pit_overhear++;
        if (t === 'pit_lesson') counts.pit_lesson++;
      } catch (e) {}
      return oTele.apply(this, arguments);
    };
    let result;
    await quietLog(async () => { result = await runDays(Game, leadfeast, { days: 60 }); });
    const rk = ((Game.state.codex || {}).recipes || {}).pit_trap || {};
    console.log(`SMOKE seed=${seed} days=${result && result.days} pitL=${rk.level || 0} via=${rk.via || '-'} ` +
      `npc_pit=${counts.npc_pit} boar=${counts.boar} pitKcal=${counts.pitKcal} teaches=${counts.pit_teach} overhears=${counts.pit_overhear} lessons=${counts.pit_lesson}`);
  }
}

(async () => {
  try {
    if (MODE === 'detgate') await partDetgate();
    else if (MODE === 'smoke') await partSmoke();
    else await partFixture();
  } catch (e) {
    console.error('FATAL', e);
    process.exit(1);
  }
})();
