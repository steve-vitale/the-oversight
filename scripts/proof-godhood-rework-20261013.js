#!/usr/bin/env node
// PROOF: godhood requirements (Steve 2026-10-13), REWRITTEN for the god-path
// redesign (2026-10-14). The capstones are no longer a separate pool list
// (godhood.json, retired): each of the 10 god paths in src/data/godpaths.json
// has ONE god, and src/js/godhood.js derives its requirements from the path
// tags on abilities.json. Ascension = recognised class on the path + the
// subclass payoff held + 4 magic abilities of the path + the deed (day 80+
// and a discovered synergy that uses a path ability). The capstone item is
// the System's gift, not a gate. Villagers: the same function.
//
// Design change on purpose (same commit as the redesign): the old T1-T17
// asserted the retired model (skill pools, tier-4 item gate, the relay
// office path). This file keeps the same questions against the new model.
'use strict';
const K = require('./godpath/lib');
const T = K.reporter('proof-godhood-rework-20261013');

(async () => {
  const Game = await K.load({ seed: Number(process.env.SEED || 7) });
  K.newRun(Game);
  const S = globalThis.Scattering;
  const G = S.Godhood;
  const GP = K.readJSON('src/data/godpaths.json');
  const ABIL = K.readJSON('src/data/abilities.json');
  const SYN = K.readJSON('src/data/synergies.json');
  const byAb = Object.fromEntries(ABIL.map(a => [a.id, a]));

  const apex = G.byId('apex_predator');
  const stalker = ['trophy_room', 'static_toss', 'bloodhound', 'lucky_rock'];
  const deed = apex.requires.synergies[0];
  const build = (ids, syns) => ({ abilities: ids.map(id => ({ id })), activeSynergies: syns || [deed], inventory: [], godhood: { recognized: {}, active: [] } });

  T.section('player: the four gates');
  const t1 = G.godhoodCloseness(build(stalker), apex, 85);
  T.ok('T1 stalker build completes: class + payoff + 4 path + deed @ day 85', t1.complete === true, JSON.stringify(t1));
  T.ok('T2 day gate: no godhood before day 80', G.godhoodCloseness(build(stalker), apex, 79).complete === false);
  const noPay = ['static_toss', 'bloodhound', 'lucky_rock', 'night_eyes'];
  const t3 = G.godhoodCloseness(build(noPay), apex, 85);
  T.ok('T3 payoff required: 4 stalker abilities without Trophy Room fail', t3.complete === false && t3.coreHit === false && t3.classOk === true);
  // abilitiesNeeded is data (godpaths.json rules.capstone; 3 since
  // godpath-buff 2026-10-14): exactly that many completes, one fewer doesn't.
  const need = apex.requires.abilitiesNeeded;
  const t4 = G.godhoodCloseness(build(stalker.slice(0, need)), apex, 85);
  T.ok(`T4 ${need} path abilities (abilitiesNeeded) with payoff + deed: complete`, t4.close === true && t4.complete === true, JSON.stringify(t4));
  const t4b = G.godhoodCloseness(build(stalker.slice(0, need - 1)), apex, 85);
  T.ok(`T4b ${need - 1} path abilities: not complete`, t4b.complete === false);
  const split = stalker.concat(['rage', 'blood_frenzy', 'cannibal_frenzy', 'blood_magic']);
  const t5 = G.godhoodCloseness(build(split), apex, 85);
  T.ok('T5 class required: a 4/4 hunter-brawler tie names no class and does not ascend', t5.classOk === false && t5.complete === false);
  T.ok('T5b no class: the god stays unknown (close false)', t5.close === false);
  const t6 = G.godhoodCloseness(build(stalker, []), apex, 85);
  T.ok('T6 deed required: no synergy fails', t6.complete === false && t6.synergy === false);
  T.ok('T7 the item is not a gate; a complete build is ready for the System\'s gift', t1.item === true && t1.readyForCapstone === true);
  T.ok('T7b capstoneItemFor still names the gift', G.capstoneItemFor(apex) === 'apex_bow');
  const t8 = G.godhoodCloseness(build(stalker.concat(['echo_location'])), apex, 85);
  T.ok('T8 alsoPath abilities count toward the pool (echo_location is explorer, alsoPath hunter)', t8.kit === 5, 'kit=' + t8.kit);

  T.section('villagers: the same function');
  const vid = (Game.state.village.roster || []).find(id => id !== Game.villagerId);
  const army = G.byId('one_person_army');
  const vset = (ids, syns) => { Game.state.village.npcAbilities = Game.state.village.npcAbilities || {}; Game.state.village.npcAbilities[vid] = ids.slice(); Game.state.village.npcSynergies = Game.state.village.npcSynergies || {}; Game.state.village.npcSynergies[vid] = syns; };
  Game.state.scholar.day = 90; Game.state.day = 90;
  vset(['rage', 'blood_frenzy', 'cannibal_frenzy', 'blood_magic'], [army.requires.synergies[0]]);
  const t9 = G.villagerGodhoodCloseness(Game, vid, army);
  T.ok('T9 villager berserker completes the One-Person Army', t9.complete === true, JSON.stringify(t9));
  vset(['rage', 'blood_frenzy', 'cannibal_frenzy', 'blood_magic'], []);
  T.ok('T10 villager without the deed does not', G.villagerGodhoodCloseness(Game, vid, army).complete === false);
  vset(['rage', 'blood_frenzy', 'cannibal_frenzy', 'blood_magic'], [army.requires.synergies[0]]);
  Game.state.village.npcGodhood = {};
  const fresh1 = G.checkVillagerGodhood(Game, vid);
  T.ok('T11a first check returns the army', fresh1.includes('one_person_army'), fresh1.join(','));
  Game.state.village.npcGodhood[vid] = { recognized: { one_person_army: 90 }, active: ['one_person_army'] };
  T.ok('T11b second check returns nothing (fires once)', G.checkVillagerGodhood(Game, vid).length === 0);
  const sch = build(stalker);
  T.ok('T12a player check returns apex_predator', G.checkGodhood(sch, 85).includes('apex_predator'));
  sch.godhood.recognized.apex_predator = 85; sch.godhood.active.push('apex_predator');
  T.ok('T12b player re-check returns nothing', G.checkGodhood(sch, 86).length === 0);

  T.section('data: one god per path, derived from godpaths.json');
  const relay = G.byId('voice_of_the_relay');
  T.ok('T13 the Relay is the Socialite\'s god; the office is its required fitting deed', relay.path === 'socialite' && relay.requires.deed?.event === 'relay_office' && relay.requires.minDay === 80);
  const ghs = G.godhoods();
  T.ok('T14 ten reachable gods, one per path', ghs.length === 10 && new Set(ghs.map(g => g.path)).size === 10, ghs.map(g => g.id).join(','));
  const sIds = new Set(SYN.map(s => s.id));
  const bad = [];
  for (const gh of ghs) {
    const r = gh.requires;
    for (const a of r.abilityPool) if (!byAb[a] || byAb[a].lane !== 'magic') bad.push(gh.id + ':pool:' + a);
    for (const c of r.coreAbilities) if (!byAb[c] || byAb[c].role !== 'payoff') bad.push(gh.id + ':core:' + c);
    for (const s of r.synergies) if (!sIds.has(s)) bad.push(gh.id + ':syn:' + s);
    if (!r.synergies.length) bad.push(gh.id + ':no-deed-synergy');
    if (r.abilityPool.length < r.abilitiesNeeded) bad.push(gh.id + ':pool<need');
  }
  T.ok('T14b pools are magic, cores are payoffs, every god has a deed synergy', bad.length === 0, bad.join('; '));
  const far = G.byId('farstrider');
  T.ok('T15 old saves: the retired Farstrider still resolves (ceremony, mythic) but is never reachable',
    !!(far && far.retired && G.mythicSprite('farstrider') && !ghs.some(g => g.id === 'farstrider')));
  T.ok('T15b godhood.json is gone (one source of truth)', !require('fs').existsSync(require('path').join(K.ROOT, 'src/data/godhood.json')));
  T.ok('T15c every path\'s god id is a godhood the verbs know', Object.keys(GP.paths).every(p => !!G.byId(GP.paths[p].god.id)));

  T.section('sense-read');
  const beats = G.ceremonyBeats(apex, [{ name: 'Mara', line: 'I saw it happen. I was THERE.' }], 'dusk');
  for (const b of beats) console.log(`  [${b.beat}/${b.kind}] ${b.text.slice(0, 140)}${b.text.length > 140 ? '…' : ''}`);
  T.done();
})().catch(e => { console.error('HARNESS ERROR', e); process.exitCode = 2; });
