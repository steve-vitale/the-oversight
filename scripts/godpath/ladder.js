#!/usr/bin/env node
// scripts/godpath/ladder.js — the god-path acceptance ladder (2026-10-14
// redesign). Runtime contract checks: the ladder Job -> track -> CLASS ->
// GOD -> Table works for the player and villagers through the same
// functions, and the Table never reads godhood.
//
//   node scripts/godpath/ladder.js
//
// Behaviour details of each new ability live in
// scripts/test-godpath-unified-20261014.js.
'use strict';
const K = require('./lib');
const T = K.reporter('godpath-ladder');

(async () => {
  const GP = K.readJSON('src/data/godpaths.json');
  const gameSrc = K.readSrc('src/js/game.js');
  const baSrc = K.readSrc('src/js/buildarounds.js');
  const fs = require('fs');
  const path = require('path');
  const tableSrc = fs.readdirSync(path.join(K.ROOT, 'src/js')).filter(f => /^table.*\.js$/.test(f))
    .map(f => K.readSrc('src/js/' + f)).join('\n');

  T.section('foundations');
  T.ok('godpaths.json is in the data load list (game.js init)', /'godpaths\.json'/.test(gameSrc));
  T.ok('godhood.json is not loaded (retired)', !/'godhood\.json'/.test(gameSrc));
  T.ok('fusion code stays removed (rejected approach)', !/availableFusions|\bfuse\s*:/.test(baSrc));
  T.ok('use-count recognition stays removed (rejected: points/meter ascension)', !/onPathLived|uses\s*>=\s*50/.test(baSrc));
  T.ok('the Table never reads godhood or god-path state (prices the run, never gates on godhood)',
    !/Godhood\b|\.godhood\b|npcGodhood|godpath|classLine|godhoodBargaining|recognizeClass/.test(tableSrc));
  // ENDINGS BY BUILD (Steve 2026-10-14: "Each playstyle and godhood path,
  // moral choice version should have its own ending."): the build reaches the
  // Table only as the ending key, read by endingKey.js. It shapes the beat and
  // the ending text, never the seat or the doors.
  T.ok('the ending key never prices the seat or the doors (endingKey.js reads the build, the Table only reads the key)',
    !/tableSeat\(|tableEarnedPaths\(|minSeat/.test(K.readSrc('src/js/endingKey.js')));
  T.ok('godpath.js loads from index.html', /src\/js\/godpath\.js/.test(K.readSrc('index.html')));

  const Game = await K.load({ seed: 20261014 });
  T.ok('Game.data.godpaths is loaded at runtime', !!(Game.data && Game.data.godpaths && Game.data.godpaths.paths));
  T.ok('the god-path API exists (recognizeClass, classLine, pathLean, shapeOffers, buildScore)',
    ['recognizeClass', 'classLine', 'pathLean', 'shapeOffers', 'buildScore', 'abilityPaths'].every(n => typeof Game[n] === 'function'));

  T.section('class recognition: player');
  K.newRun(Game);
  const s = Game.state.scholar;
  Game.state.systemArrived = true;
  K.openSlots(Game, 6);
  K.giveAbility(Game, 'rage'); K.giveAbility(Game, 'blood_frenzy');
  Game.checkPlayerGodhoodAscension();
  T.ok('two brawler abilities: no class, no line ("If you don\'t know, it doesn\'t show")', Game.classLine('player') === null && !s.godpath);
  K.giveAbility(Game, 'cannibal_frenzy');
  Game.checkPlayerGodhoodAscension();
  T.ok('three: "Berserker of the One-Person Army", stored with path/subclass/since',
    Game.classLine('player') === 'Berserker of the One-Person Army' && s.godpath && s.godpath.path === 'brawler' && s.godpath.subclass === 'berserker' && s.godpath.since != null,
    Game.classLine('player'));
  T.ok('telemetry class_recognized fired', K.teleEvents(Game, 'class_recognized').some(e => (e.data || e).who === 'player' || e.who === 'player'));
  s.abilities = [];
  for (const id of ['trophy_room', 'static_toss', 'bloodhound', 'rage']) K.giveAbility(Game, id);
  Game.checkPlayerGodhoodAscension();
  T.ok('the build shifts: the class changes to Stalker of the Apex Predator', Game.classLine('player') === 'Stalker of the Apex Predator', Game.classLine('player'));

  T.section('offers lean to your path');
  s.abilities = [];
  for (const id of ['static_toss', 'bloodhound', 'lucky_rock']) K.giveAbility(Game, id); // stalker, none in the combat kit
  Game.checkPlayerGodhoodAscension();
  const lu = Game.levelUpOffers('combat').map(d => d.id);
  T.ok('a level-up sheet holds >=1 hunter ability when the kit has one', lu.some(id => (Game.abilityDef(id) || {}).path === 'hunter'), lu.join(','));
  const roles = lu.map(id => (Game.abilityDef(id) || {}).role);
  T.ok('the sheet\'s roles are distinct where the kit allows', new Set(roles).size === roles.length, roles.join(','));
  const lean = Game.pathLean('player', 'night_eyes');
  T.ok('pathLean scores an on-path ability above an off-path one', lean > Game.pathLean('player', 'green_thumb'), `${lean}`);
  T.ok('pathLean is knowledge-gated: an unknown ability scores 0', Game.pathLean('player', 'night_eyes', { knows: () => false }) === 0);
  s.abilityChoices = null;
  s.abilities = s.abilities.slice(0, 3);
  try { Game._cxPrizeAbilityOffer({ id: 'test', cat: 'moot' }); } catch (e) { T.ok('gift offer runs', false, e.message); }
  const gift = (s.abilityChoices || []).map(c => c.id);
  T.ok('a contest gift sheet holds >=1 hunter ability', gift.some(id => (Game.abilityDef(id) || {}).path === 'hunter'), gift.join(','));
  s.abilityChoices = null;

  T.section('class recognition: villagers (the same function)');
  const vid = (Game.state.village.roster || []).find(id => id !== Game.villagerId);
  Game.state.village.npcAbilities = Game.state.village.npcAbilities || {};
  Game.state.village.npcAbilities[vid] = [];
  for (const id of ['bird_strike', 'bird_whisperer']) Game.npcGrantAbility(vid, id);
  T.ok('two beastmaster abilities: no villager class', !Game.classLine(vid));
  Game.npcGrantAbility(vid, 'beast_calm');
  T.ok('three: the villager is named "Beastmaster of the Apex Predator"', Game.classLine(vid) === 'Beastmaster of the Apex Predator', String(Game.classLine(vid)));
  T.ok('stored on village.npcGodpath[vid]', ((Game.state.village.npcGodpath || {})[vid] || {}).subclass === 'beastmaster');

  T.section('capstone: reachable in a scripted build, same ceremony for both');
  const G = globalThis.Scattering.Godhood;
  s.abilities = [];
  for (const id of ['trophy_room', 'static_toss', 'bloodhound', 'lucky_rock']) K.giveAbility(Game, id);
  const apex = G.byId('apex_predator');
  s.activeSynergies = [apex.requires.synergies[0]];
  s.day = 85; Game.state.day = 85;
  s.godhood = { recognized: {}, active: [] };
  // Prepared ceremony fixture; test-apex-deed proves actual kill callers.
  Game.state.village.godpathDeeds = { [Game.villagerId]: { apex_hunt: { day: 84, monster: 'moderator', scene: 'tactical', method: 'solo', actorMaxHp: 100, openingHp: 160 } } };
  const tAsc = K.teleEvents(Game, 'ascension').length;
  Game.checkPlayerGodhoodAscension();
  T.ok('player ascends as the Apex Predator (class + payoff + 4 + deed, day 85)', (s.godhood.active || []).includes('apex_predator'), JSON.stringify(s.godhood));
  T.ok('the System gifts the capstone item at the ceremony', (s.inventory || []).some(i => (i.itemId || i.id) === 'apex_bow'));
  T.ok('ascension telemetry fires', K.teleEvents(Game, 'ascension').length > tAsc);
  const army = G.byId('one_person_army');
  Game.state.village.npcAbilities[vid] = [];
  for (const id of ['rage', 'blood_frenzy', 'cannibal_frenzy', 'blood_magic']) Game.npcGrantAbility(vid, id);
  Game.state.village.npcSynergies = Game.state.village.npcSynergies || {};
  Game.state.village.npcSynergies[vid] = [army.requires.synergies[0]];
  Game.checkVillagerGodhoodAscension(vid);
  T.ok('a villager ascends through the same requirement model', (((Game.state.village.npcGodhood || {})[vid] || {}).active || []).includes('one_person_army'));

  T.done();
})().catch(e => { console.error('LADDER HARNESS ERROR', e); process.exitCode = 2; });
