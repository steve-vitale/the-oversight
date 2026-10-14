#!/usr/bin/env node
// test-evo-root-20261014.js — evolving an ability keeps its root for
// raw-id consumers.
//
// Bug: chooseEvolution sets ab.id = evoId (root kept only in evolvedFrom).
// godhood scholarAbilities (kit count), buildarounds baPathCount (assembly
// gate), progression completeTrial `owned` (re-gifts the root) and party-bond
// pathAnchor read raw ids, so evolving silently dropped the root.
//
// ABILITY LANES (2026-10-14): tracker and rally are human skills now (they
// never sit in a slot, so they never evolve there). The evolving roots are
// the magic hunter/shieldbearer abilities: echo_location and retribution.
'use strict';
const K = require('./godpath/lib');
const T = K.reporter('evo-root');

(async () => {
  const Game = await K.load({ seed: 1014 });
  K.newRun(Game);
  K.openSlots(Game, 6);
  const s = Game.state.scholar;
  for (const id of ['echo_location', 'patient_aim', 'game_sense', 'trophy_room']) K.giveAbility(Game, id, { level: 1 });
  const S = globalThis.Scattering;
  const gh = S.Godhood.godhoods().find(g => g.id === 'apex_predator');
  const BA = S.buildarounds;
  const target = { monsterType: 'hushwolf', name: 'hushwolf' };
  // Trophy assembly gate: hold ONLY echo_location + trophy_room (2 hunter abilities)
  // and no hunter skills (skill-lane abilities count toward paths too).
  const trophyOnly = () => {
    const all = s.abilities, sk = Game.state.codex.skills;
    Game.state.codex.skills = {};
    s.abilities = all.filter(a => a.id === 'trophy_room' || a.id === 'echo_location' || a.evolvedFrom === 'echo_location');
    const m = BA.trophyMult(Game, target);
    s.abilities = all; Game.state.codex.skills = sk;
    return m;
  };

  const kitBefore = S.Godhood.godhoodCloseness(s, gh, 1).kit;
  s.buildaround = s.buildaround || {};
  s.buildaround.trophyMark = 'hushwolf';
  const trophyBefore = trophyOnly();

  const ab = s.abilities.find(a => a.id === 'echo_location');
  Game.stageEvolution(ab);
  const choice = (s.evolutionChoices || [])[0];
  T.ok('echo_location has an evolution to choose', !!choice);
  Game.chooseEvolution(choice.id);
  T.ok('echo_location evolved (id replaced, evolvedFrom kept)', ab.id === choice.id && ab.evolvedFrom === 'echo_location');

  const kitAfter = S.Godhood.godhoodCloseness(s, gh, 1).kit;
  T.ok('godhood kit count unchanged by evolution', kitAfter === kitBefore, `${kitBefore} -> ${kitAfter}`);
  const trophyAfter = trophyOnly();
  T.ok('baPathCount (trophy assembly bonus) unchanged by evolution', trophyAfter === trophyBefore, `${trophyBefore} -> ${trophyAfter}`);

  // Party bond: hold all four shieldbearer abilities, evolve one -> anchor stays 1.
  for (const id of ['draw_fire', 'bodyguard', 'shield_wall', 'retribution']) K.giveAbility(Game, id, { level: 1, force: true });
  const anchorBefore = Game.pathAnchor();
  const sb = s.abilities.find(a => a.id === 'retribution');
  Game.stageEvolution(sb);
  const sbChoice = (s.evolutionChoices || [])[0];
  if (sbChoice) Game.chooseEvolution(sbChoice.id);
  T.ok('retribution evolved', !!sbChoice && sb.evolvedFrom === 'retribution');
  T.ok('party-bond path anchor unchanged by evolution', Game.pathAnchor() === anchorBefore, `${anchorBefore} -> ${Game.pathAnchor()}`);

  // Trial gift: with only echo_location on offer, an evolved echo_location must not be re-gifted.
  const realAbilities = Game.data.abilities;
  Game.data.abilities = realAbilities.filter(a => a.id === 'echo_location');
  const pg = Game.progState();
  pg.trial = { name: 'test trial', kind: 'pantry' };
  const before = s.abilities.length;
  K.openSlots(Game, 6);
  const realSlots = Game.abilitySlots;
  Game.abilitySlots = () => 99;
  Game.completeTrial();
  Game.abilitySlots = realSlots;
  Game.data.abilities = realAbilities;
  T.ok('trial does not re-gift the evolved root', s.abilities.length === before && !s.abilities.some(a => a.id === 'echo_location'),
    JSON.stringify(s.abilities.map(a => a.id)));
  T.done();
})().catch(e => { console.error(e); process.exitCode = 2; });
