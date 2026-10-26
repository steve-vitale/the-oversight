#!/usr/bin/env node
// test-fishfallback-unit-b.js — direct proof for the fish staffing
// fallback in scripts/policies/competent.js assignAnother
// (sim-fishfallback-b, 2026-10-26). No game load: stub Game with a roster,
// scored candidates, and scripted assignTask answers.
//   1. top scorer refuses, second accepts -> true, asked [top, second],
//      ctx.fishStaffFallback == 1.
//   2. all refuse -> false, every candidate asked exactly once, no
//      fallback count (honest, not forced).
//   3. top accepts -> true, only top asked, fallback 0.
//   4. top throws, second accepts -> true, fallback 1 (exception moves on).
//   5. top returns null, second accepts -> true, fallback 1 (null moves on).
// Exit 0 = all pass; nonzero + FAIL lines otherwise.
'use strict';
const { assignAnother } = require('./policies/competent');
let fails = 0;
const check = (name, cond, detail) => { if (cond) console.log(`OK ${name}`); else { fails += 1; console.log(`FAIL ${name}: ${detail}`); } };
function stubGame(answers) {
  const asked = [];
  const people = {
    rosa: { formerOccupation: 'fisherman', dead: false },
    omar: { formerOccupation: 'sailor', dead: false },
    lee: { formerOccupation: 'cook', dead: false },
  };
  const competence = { rosa: 9, omar: 5, lee: 1 }; // rosa top, omar second
  return { asked, Game: {
    villagerId: 'leader',
    state: { village: { roster: ['rosa', 'omar', 'lee'], assignments: {} } },
    getPerson: (id) => people[id] || {},
    villagerCompetence: (id) => competence[id] || 0,
    assignTask: (vid) => { asked.push(vid); const a = answers[vid]; if (a === 'throw') throw new Error('boom'); return a; },
  } };
}
{ const { asked, Game } = stubGame({ rosa: { ok: false, refused: true }, omar: { ok: true }, lee: { ok: true } });
  const ctx = {};
  const r = assignAnother(Game, 'fish', ['fisherman', 'fishing guide', 'sailor', 'hunter', 'cook'], ctx);
  check('refusal-falls-through', r === true && asked.join(',') === 'rosa,omar' && ctx.fishStaffFallback === 1, `r=${r} asked=${asked} fb=${ctx.fishStaffFallback}`); }
{ const { asked, Game } = stubGame({ rosa: { ok: false, refused: true }, omar: { ok: false, refused: true }, lee: { ok: false, refused: true } });
  const ctx = {};
  const r = assignAnother(Game, 'fish', ['fisherman', 'fishing guide', 'sailor', 'hunter', 'cook'], ctx);
  check('all-refuse-honest-false', r === false && asked.join(',') === 'rosa,omar,lee' && !ctx.fishStaffFallback, `r=${r} asked=${asked} fb=${ctx.fishStaffFallback}`); }
{ const { asked, Game } = stubGame({ rosa: { ok: true }, omar: { ok: true }, lee: { ok: true } });
  const ctx = {};
  const r = assignAnother(Game, 'fish', ['fisherman', 'fishing guide', 'sailor', 'hunter', 'cook'], ctx);
  check('top-accepts-no-fallback', r === true && asked.join(',') === 'rosa' && !ctx.fishStaffFallback, `r=${r} asked=${asked} fb=${ctx.fishStaffFallback}`); }
{ const { asked, Game } = stubGame({ rosa: 'throw', omar: { ok: true }, lee: { ok: true } });
  const ctx = {};
  const r = assignAnother(Game, 'fish', ['fisherman', 'fishing guide', 'sailor', 'hunter', 'cook'], ctx);
  check('exception-moves-on', r === true && asked.join(',') === 'rosa,omar' && ctx.fishStaffFallback === 1, `r=${r} asked=${asked} fb=${ctx.fishStaffFallback}`); }
{ const { asked, Game } = stubGame({ rosa: null, omar: { ok: true }, lee: { ok: true } });
  const ctx = {};
  const r = assignAnother(Game, 'fish', ['fisherman', 'fishing guide', 'sailor', 'hunter', 'cook'], ctx);
  check('null-moves-on', r === true && asked.join(',') === 'rosa,omar' && ctx.fishStaffFallback === 1, `r=${r} asked=${asked} fb=${ctx.fishStaffFallback}`); }
console.log(fails === 0 ? 'TEST PASS: fish fallback unit proof green' : `TEST FAIL: ${fails} failure(s)`);
process.exit(fails === 0 ? 0 : 1);
