#!/usr/bin/env node
// test-theft-grievance-r21.js — PROOF: theft records a grievance (rivalry path).
// r21 finding: 18 thefts across 3 runs moved victim TRUST to ~0 but bonds
// stayed 0 — the ONLY negative-bond source is recordGrievance (moot machinery),
// and theft never called it. A robbed villager could never become your enemy.
// RED (pre-fix): stealFrom(caught) -> no 'stolen_from' grievance, bond 0.
// GREEN (post-fix): grievance recorded, bond -10; theftNoticeSweep ->
// 'suspected_theft' grievance, bond -6. Motive rises (grievanceBetween).
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame } = require('./sim-harness');

function bondOf(Game, a, b) { try { return (Game.bondGet(a, b) || {}).v || 0; } catch (e) { return 0; } }
function grievances(Game, by, against) {
  try {
    const bs = Game.betrayalState();
    return (bs.grievances || []).filter(g => (!by || g.by === by) && (!against || g.against === against));
  } catch (e) { return []; }
}

(async () => {
  const { Game } = await loadGame({ seed: 424242, mode: 'theft-grievance-r21' });
  await setupGame(Game);
  const me = Game.villagerId;
  const roster = (Game.state.village.roster || []).filter(id => id !== me);
  if (roster.length < 2) { console.log('SKIP: roster too small'); process.exit(2); }
  // pick two victims with full packs
  const victims = roster.filter(id => { try { return Game.packKcal(id) >= 100; } catch (e) { return false; } });
  if (victims.length < 2) { console.log('SKIP: no stocked victims'); process.exit(2); }
  const [vCaught, vSuspect] = victims;

  let pass = 0, fail = 0;
  const check = (name, cond) => { if (cond) { pass++; console.log('  PASS', name); } else { fail++; console.log('  FAIL', name); } };

  // --- A: caught theft ---
  let res = null, tries = 0;
  const b0 = bondOf(Game, vCaught, me);
  while (tries++ < 40 && res !== 'caught') {
    try { res = Game.stealFrom(vCaught); } catch (e) { break; }
    if (res === 'unseen') { /* try again next "night" — reset pack via direct top-up */ 
      try { Game.packSpend(vCaught, -500); } catch (e) {}
    }
  }
  check('A1 caught theft eventually fires (deterministic seed)', res === 'caught');
  const gA = grievances(Game, vCaught, me).filter(g => g.kind === 'stolen_from');
  check('A2 caught theft records stolen_from grievance (victim -> scholar)', gA.length >= 1);
  const b1 = bondOf(Game, vCaught, me);
  check(`A3 bond moved negative (was ${b0}, now ${b1})`, b1 < b0);
  try {
    const mot = Game.motiveBetween(vCaught, me);
    check(`A4 motiveBetween victim->scholar > 0 (${mot.score})`, mot.score > 0);
  } catch (e) { check('A4 motiveBetween callable', false); }

  // --- B: unseen-but-noticed theft ---
  const b2 = bondOf(Game, vSuspect, me);
  try {
    const day = Game.state.scholar.day;
    Game.state.village.packTheft = Game.state.village.packTheft || {};
    Game.state.village.packTheft[vSuspect] = { day: day - 1, part: 0, kcal: 400, noticed: false };
    Game.theftNoticeSweep();
  } catch (e) { console.log('  sweep threw:', e.message); }
  const gB = grievances(Game, vSuspect, me).filter(g => g.kind === 'suspected_theft');
  check('B1 noticed theft records suspected_theft grievance', gB.length >= 1);
  const b3 = bondOf(Game, vSuspect, me);
  check(`B2 bond moved negative (was ${b2}, now ${b3})`, b3 < b2);

  // --- C: narrative surface exists for the new kinds ---
  try {
    const p1 = Game.grievanceSay('stolen_from');
    const p2 = Game.grievanceSay('suspected_theft');
    check(`C1 grievanceSay phrases exist ("${p1}" / "${p2}")`,
      p1 !== 'stolen from' && p2 !== 'suspected theft' && p1.length > 3 && p2.length > 3);
  } catch (e) { check('C1 grievanceSay callable', false); }

  console.log(`\n${pass}/${pass + fail} GREEN`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
