#!/usr/bin/env node
// test-synergydisc-b.js — dawn resonance for double-passive synergy discovery.
//
// Proves (sim-synergydisc-b, prereg evidence/2026-11-12/sim-synergydisc-b-prereg.md):
//   (a) the dawn trigger fires ONLY for the triggerless class: hold both legs
//       of a corrected-10 synergy, advance dawn, discovery progresses; hold a
//       synergy with an existing trigger (war_chest via blood_magic, ringcraft
//       via usable legs, closed_loop via camp_cook XP-tick / compost_king
//       legacy activation), its path is unchanged — no dawn progress, progress
//       only via its own trigger.
//   (b) no discovery progress for unheld legs.
//   (c) the stall script's verdict moves per the GO bar — run separately:
//       node scripts/test-synergy-stall.js (one harness per process; the
//       verdict is recorded in evidence/2026-11-12/sim-synergydisc-b.md).
// Run: node scripts/test-synergydisc-b.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
const failures = [];
function ok(cond, name, detail) {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; failures.push(name + (detail ? ' — ' + detail : '')); console.log('  FAIL ' + name + (detail ? ' — ' + detail : '')); }
}

// Corrected triggerless class (10) — re-derived from data this run; the 0230Z
// table's 11th entry, war_chest, is rescued by blood_magic's legacy activation.
const TEN = {
  critter_network: ['bird_whisperer', 'squirrel_friend'],
  cornered_fury: ['adrenaline_control', 'cornered_rat'],
  polyglots_ledger: ['translator', 'open_book'],
  everybodys_friend: ['silver_tongue', 'gossip_network'],
  farsight: ['eagle_eye', 'pathfinder'],
  owl_hours: ['eagle_eye', 'night_eyes'],
  tells: ['lie_detector', 'open_book'],
  string_wall: ['evidence_board', 'eagle_eye'],
  airtight: ['lie_detector', 'evidence_board'],
  stand_together: ['draw_fire', 'shield_wall'],
};

(async () => {
  const { Game } = await loadGame({ seed: 20261112, mode: 'god' });
  await setupGame(Game);
  const s = Game.state.scholar;

  // Capture say lines (tease/unlock voice) without stubbing Game.save.
  const said = [];
  const origSay = Game.say.bind(Game);
  Game.say = (...a) => { try { said.push(a.join(' ')); } catch (e) {} return origSay(...a); };

  function topUp() {
    try { s.health = Game.maxHealth(); } catch (e) {}
    try { s.kcal = Game.kcalCap(); } catch (e) {}
    try { s.dayTicks = 0; } catch (e) {}
  }
  function setAbilities(ids) {
    s.abilities = ids.map(id => ({ id, name: id, level: 1, xp: 0 }));
    s.synergies = [];
    s.synergyAttempts = {};
    s.abilityUseLog = [];
    said.length = 0;
  }
  function progress(id) {
    const a = s.synergyAttempts || {};
    return (a[id] || 0) + (a[id + '_days'] || 0);
  }
  function dawn(n) {
    for (let i = 0; i < n; i++) { topUp(); Game.endDay(); }
  }

  console.log('== (a) cornered_fury: simultaneous, both legs passive, triggerless ==');
  setAbilities(TEN.cornered_fury);
  ok(progress('cornered_fury') === 0, 'cornered_fury starts at 0 attempts');
  dawn(1);
  ok(progress('cornered_fury') === 1, 'dawn 1: exactly 1 attempt', 'attempts=' + JSON.stringify(s.synergyAttempts));
  ok(!s.synergies.includes('cornered_fury'), 'dawn 1: not yet discovered');
  ok(said.some(l => l.includes('hands stopped shaking')), 'dawn 1: tease1 spoken (System notices the pair)', 'said=' + JSON.stringify(said.slice(-3)));
  ok(!(s.abilityUseLog || []).some(u => u.id === 'adrenaline_control' || u.id === 'cornered_rat'),
    'dawn note is a resonance check, not a use (no use-log entry for either leg)');
  dawn(2);
  ok(progress('cornered_fury') === 3, 'dawn 3: 3 attempts total', 'attempts=' + JSON.stringify(s.synergyAttempts));
  ok(s.synergies.includes('cornered_fury'), 'dawn 3: cornered_fury DISCOVERED');
  ok(said.some(l => l.includes('SURROUND you ON PURPOSE')), 'unlock line spoken');

  console.log('== (a) owl_hours: sustained streak counts dawns ==');
  setAbilities(TEN.owl_hours);
  dawn(1);
  ok((s.synergyAttempts['owl_hours_days'] || 0) === 1, 'dawn 1: streak day 1', 'attempts=' + JSON.stringify(s.synergyAttempts));
  ok(!s.synergies.includes('owl_hours'), 'dawn 1: not yet discovered');
  dawn(2);
  ok(s.synergies.includes('owl_hours'), 'dawn 3: owl_hours DISCOVERED via 3-dawn streak');

  console.log('== (a) all 10 triggerless synergies progress on one dawn ==');
  for (const [id, legs] of Object.entries(TEN)) {
    setAbilities(legs);
    dawn(1);
    ok(progress(id) === 1, id + ': 1 dawn = 1 progress', 'attempts=' + JSON.stringify(s.synergyAttempts));
    ok(!s.synergies.includes(id), id + ': not discovered after 1 dawn');
  }

  console.log('== (a) war_chest: NOT dawn-covered (blood_magic legacy activation rescues it) ==');
  setAbilities(['deep_reserves', 'blood_magic']);
  ok(Game.activatableAbilities().some(a => (a.abilityId || a.id) === 'blood_magic'),
    'blood_magic IS in the live activatable list (legacy activatable)');
  dawn(3);
  ok(progress('war_chest') === 0, 'war_chest: 3 dawns = 0 attempts (dawn must not cover it)', 'attempts=' + JSON.stringify(s.synergyAttempts));
  ok(!s.synergies.includes('war_chest'), 'war_chest: not discovered by dawn');
  topUp();
  // Legacy buttons are NOT invoked via useAbility (it needs a data-driven
  // action def — blood_magic has none, so useAbility returns false with
  // "That action doesn't exist"). The live path is activateAbility, which
  // routes non-composite ids to _activateAbilityInner, then gainAbilityXP
  // -> noteAbilityUse. (Note: the stall script's god policy only ever calls
  // useAbility, so it never presses Blood Price — war_chest's trigger is
  // real for a human player but invisible to that policy.)
  Game.activateAbility('blood_magic');
  ok((s.bloodPriceUses || 0) >= 1, 'blood_magic activation fires (Blood Price)', 'bloodPriceUses=' + (s.bloodPriceUses || 0));
  ok(progress('war_chest') === 1, 'war_chest: 1 blood use = 1 attempt via its own trigger', 'attempts=' + JSON.stringify(s.synergyAttempts));

  console.log('== (a) ringcraft: NOT dawn-covered (usable legs) ==');
  setAbilities(['brawler_instinct', 'intimidating_presence']);
  dawn(3);
  ok(progress('ringcraft') === 0, 'ringcraft: 3 dawns = 0 attempts', 'attempts=' + JSON.stringify(s.synergyAttempts));

  console.log('== (a) closed_loop: NOT dawn-covered (camp_cook XP-tick / compost_king button) ==');
  setAbilities(['camp_cook', 'compost_king']);
  dawn(3);
  ok(progress('closed_loop') === 0, 'closed_loop: 3 dawns = 0 attempts', 'attempts=' + JSON.stringify(s.synergyAttempts));

  console.log('== (b) unheld legs: no progress ==');
  setAbilities(['adrenaline_control']);
  dawn(3);
  ok(progress('cornered_fury') === 0, 'cornered_fury: 3 dawns with only one leg = 0 attempts', 'attempts=' + JSON.stringify(s.synergyAttempts));
  ok(!s.synergies.includes('cornered_fury'), 'cornered_fury: not discovered with one leg');
  setAbilities([]);
  dawn(1);
  ok(progress('cornered_fury') === 0, 'cornered_fury: 1 dawn with no legs = 0 attempts');

  console.log(`\n${pass} passed, ${fail} failed`);
  if (fail) { console.log('FAILURES:\n- ' + failures.join('\n- ')); process.exitCode = 1; }
})();
