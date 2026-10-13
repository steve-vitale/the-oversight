#!/usr/bin/env node
// test-trapline-20261013.js — trapline arm (flesh-out loop A, 2026-10-13).
// The finding (hidden_files/sim-findings.md): the trapline never fires in
// establishment sims — 0 traps crafted/set in 12/12 (player and NPC). The
// chicken-and-egg: the player needs snare L1+ (taught by a knowsSnare
// villager at trust 15+, or witnessing a catch); the NPC TRAPS objective
// needs knowsSnare (5 of 55 occupations — rare in casts). When no cast
// member knows the wire, the whole trap economy is unreachable, and no
// villager can EVER learn it (the teach chore only teaches plants; the
// snare teach beat teaches only the player).
//
// Two arms, non-overlapping files:
//   SEED (data, src/data/characterGen.json): widen who can seed the wire —
//     soldier (canon: knowledge.json snare_wire backgrounds), farmer,
//     exterminator, bush_pilot join the 5 snare occupations.
//   APPRENTICE (code, villager-agency.js + villager-objectives.js): a
//     knowsSnare villager can take a snare apprentice through the honest
//     teach chore (word of mouth is the canon pre-codex channel); a player
//     at haven who has earned the teacher's regard (trust 15+, same gate as
//     the existing player teach beat) overhears the lesson and gains
//     recipe L1 (seen — blind 35% craft, materials at risk). Craft economy
//     untouched: traps are never free or cheap.
//
//   E1: cast scan — documents dead casts (0 knowers) on the pilot seeds.
//   E2: SEED — the 4 new occupations carry knowsSnare. RED on pristine.
//   E3: APPRENTICE — agencyTeachVillager teaches the wire villager to
//       villager (learner.knowsSnare flips true). RED on pristine.
//   E4: OVERHEAR — snareLessonOverhear grants the player recipe L1 when
//       the regard gate holds. RED on pristine.
// Usage: node scripts/test-trapline-20261013.js  (SEED env override)
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame } = require('./sim-harness');

const SEED = parseInt(process.env.SEED || '20261013', 10);
const SCAN_SEEDS = [11, 22, 33, 44];
let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log(`ok   ${name}`); }
  else { fail++; console.log(`FAIL ${name}${extra ? ' — ' + extra : ''}`); }
}
function knowerCount(Game) {
  const v = Game.state.village || {};
  let n = 0;
  for (const vid of (v.roster || [])) {
    try { if (Game.vpOf && Game.vpOf(vid) && Game.vpOf(vid).knowsSnare) n++; } catch (e) {}
  }
  return n;
}

(async () => {
  // ============ E1: cast scan (documents the gap; passes either way) ============
  console.log('--- E1: cast scan (knowsSnare holders per cast) ---');
  let deadCasts = 0;
  for (const s of SCAN_SEEDS) {
    const { Game } = await loadGame({ seed: s, mode: 'test' });
    await setupGame(Game);
    const n = knowerCount(Game);
    const occ = (Game.vpOf && Game.vpOf(Game.villagerId) || {}).occupationId || '?';
    console.log(`seed ${s}: cast knowers=${n}, scholar occupation=${occ}`);
    if (n === 0) deadCasts++;
  }
  ok('E1 dead casts exist on the pilot seeds (the gap is real)', deadCasts >= 1,
    `deadCasts=${deadCasts}/4`);

  // ============ E2: SEED arm — occupation data ============
  console.log('--- E2: seed occupations ---');
  const cg = JSON.parse(fs.readFileSync(
    path.join(__dirname, '..', 'src', 'data', 'characterGen.json'), 'utf8'));
  const occById = {};
  for (const o of (cg.occupations || [])) occById[o.id] = o;
  for (const id of ['soldier', 'farmer', 'exterminator', 'pilot']) {
    ok(`E2 occupation ${id} carries knowsSnare`, !!(occById[id] && occById[id].knowsSnare));
  }
  const total = (cg.occupations || []).filter(o => o.knowsSnare).length;
  console.log(`knowsSnare occupations: ${total}/55`);

  // ============ E3: APPRENTICE arm — villager teaches villager ============
  console.log('--- E3: snare apprenticeship (NPC -> NPC) ---');
  {
    const { Game } = await loadGame({ seed: SEED, mode: 'test' });
    await setupGame(Game);
    const roster = (Game.state.village || {}).roster || [];
    ok('E3 roster non-empty', roster.length >= 2, `n=${roster.length}`);
    if (roster.length >= 2) {
      const teacherVid = roster[0], learnerVid = roster[1];
      const tvp = Game.vpOf(teacherVid), lvp = Game.vpOf(learnerVid);
      tvp.knowsSnare = true;            // the wire-holder
      lvp.knowsSnare = false;            // the apprentice-to-be
      delete lvp.snareTaught;
      Game.state.village.trust = Game.state.village.trust || {};
      Game.state.village.trust[teacherVid] = 20; // regard gate: 15+
      try { Game.npcNeeds(learnerVid).hunger = 70; } catch (e) {} // need-driven
      let landed = false;
      for (let i = 0; i < 6 && !landed; i++) {
        try {
          const r = Game.agencyTeachVillager(teacherVid, learnerVid);
          if (r && r.taught && (r.topic === 'snare' || Game.vpOf(learnerVid).knowsSnare)) landed = true;
        } catch (e) { console.log('E3 lesson threw: ' + e.message); break; }
      }
      ok('E3 learner gains knowsSnare from a wire-knowing teacher',
        landed && !!Game.vpOf(learnerVid).knowsSnare,
        `landed=${landed} knowsSnare=${!!Game.vpOf(learnerVid).knowsSnare}`);
      // once-only: a second learner... the same learner is not re-taught
      const lvp2 = Game.vpOf(learnerVid);
      ok('E3 lesson recorded once (snareTaught marker)', !!lvp2.snareTaught);
    }
  }

  // ============ E4: OVERHEAR — player learns by watching the lesson ============
  console.log('--- E4: player overhears the snare lesson ---');
  {
    const { Game } = await loadGame({ seed: SEED, mode: 'test' });
    await setupGame(Game);
    ok('E4 snareLessonOverhear exists', typeof Game.snareLessonOverhear === 'function');
    if (typeof Game.snareLessonOverhear === 'function') {
      const roster = (Game.state.village || {}).roster || [];
      const teacherVid = roster[0];
      Game.vpOf(teacherVid).knowsSnare = true;
      Game.state.village.trust = Game.state.village.trust || {};
      Game.state.village.trust[teacherVid] = 20;
      // player at haven, recipe unknown
      const v = Game.state.village;
      Game.map.px = v.px ?? 4; Game.map.py = v.py ?? 4;
      Game.state.codex = Game.state.codex || {};
      Game.state.codex.recipes = Game.state.codex.recipes || {};
      delete Game.state.codex.recipes.snare;
      Game.snareLessonOverhear(teacherVid);
      const lvl = ((Game.state.codex.recipes || {}).snare || {}).level || 0;
      ok('E4 player gains snare recipe L1 from the overheard lesson', lvl >= 1, 'level=' + lvl);
      // regard gate: untrusted teacher teaches nothing
      delete Game.state.codex.recipes.snare;
      Game.state.village.trust[teacherVid] = 10;
      Game.snareLessonOverhear(teacherVid);
      const lvl2 = ((Game.state.codex.recipes || {}).snare || {}).level || 0;
      ok('E4 regard gate holds (trust 10: no lesson)', lvl2 < 1, 'level=' + lvl2);
    }
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
