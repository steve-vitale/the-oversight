#!/usr/bin/env node
// test-trial-deeds-20261012.js — lever 9 r4 proof: trial deed grants.
// The 9 unlock.type === 'trial' abilities (win_a_fight -> adrenaline_control,
// intimidate_someone -> intimidating_presence, hear_10_rumors ->
// gossip_network, stop_a_fight -> peacemaker, discover_5_locations ->
// eagle_eye, catch_3_lies -> evidence_board, take_50_damage_in_one_fight ->
// trade_of_blows, hunger_trial -> iron_stomach, blood_trial ->
// adrenaline_surge) were data-declared but had NO player grant path — dead
// rungs on the unlock ladder. This test proves the deeds now grant.
//
// Mechanical: mapping correct, thresholds fire, pre-arrival pending,
// idempotent, 6-slot law honest, human-skills lane untouched, hook sites
// wired in source, pending pass fires on arrival.
// Sense: grant narration reads System voice, names the deed, no 'undefined'
// or raw ids.
//
// ABILITY LANES (2026-10-14, design change): intimidating_presence,
// gossip_network, peacemaker (-> mediate), eagle_eye (-> old_world_cache)
// and evidence_board (-> read_people) are human competences: the deed TEACHES
// the codex skill immediately (no System, no slot). adrenaline_control,
// trade_of_blows, iron_stomach and adrenaline_surge stay magic grants
// (arrival-gated, six-slot law). Sections 3, 4, 5, 9, 11 updated.
//
// UNIFIED TRACKS (2026-10-14, design change, Steve: "I intended abilities
// to be gained from a variety of related XP sources"): the four MAGIC trials
// no longer grant their ability. The deed credits its track once
// (tracks.json deedConversions: combat +3, hunger -> craft +3); the power
// comes from that track's level-up sheet. Sections 2, 3, 4, 5, 6, 9, 10
// assert the track credit instead of the grant.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
const notes = [];
function ok(cond, name, detail) {
  if (cond) { pass++; }
  else { fail++; notes.push(`FAIL: ${name}${detail ? ' — ' + detail : ''}`); }
  console.log(`${cond ? 'ok  ' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
}

function freshScholar(Game) {
  const s = Game.state.scholar;
  s.abilities = [];
  // clear background too: seed 4242's dispatcher_911 holds eagle_eye as a
  // background ability, which would make every eagle_eye assertion vacuous.
  // The background interaction gets its own explicit test below (section 11).
  s.backgroundAbilities = [];
  s.trialDeeds = {};
  s.integration = 100; // 6 slots
  Game.state.systemArrived = true;
  Game.state.codex.skills = {}; // skill-lane abilities are owned via codex skills
  s.tracks = null; s.deedConverted = {}; s.levelUpQueue = []; s.abilityChoices = null; // unified tracks
  return s;
}

(async () => {
  const { Game, loadFails } = await loadGame({ seed: 4242, mode: 'god', fullTelemetry: false });
  if (loadFails && loadFails.length) { console.log('load fails:', loadFails.join(';')); fail += loadFails.length; }
  await setupGame(Game);
  ok(typeof Game.noteTrialDeed === 'function', 'mixin: noteTrialDeed on Game');
  ok(typeof Game.trialDeedGrant === 'function', 'mixin: trialDeedGrant on Game');
  ok(typeof Game.checkPendingTrialDeeds === 'function', 'mixin: checkPendingTrialDeeds on Game');

  const said = [];
  Game.say = (m) => said.push(String(m));
  Game.sysSay = (m) => said.push(String(m));

  // ---------- 1. mapping: data-declared trials resolve to the right ids ----------
  const expected = {
    win_a_fight: 'adrenaline_control',
    intimidate_someone: 'intimidating_presence',
    hear_10_rumors: 'gossip_network',
    stop_a_fight: 'peacemaker',
    discover_5_locations: 'eagle_eye',
    catch_3_lies: 'evidence_board',
    take_50_damage_in_one_fight: 'trade_of_blows',
    hunger_trial: 'iron_stomach',
    blood_trial: 'adrenaline_surge',
  };
  for (const [key, id] of Object.entries(expected)) {
    const def = Game.trialGrantFor(key);
    ok(def && def.id === id, `mapping: ${key} -> ${id}`, def ? def.id : 'null');
    ok(def && def.unlock && def.unlock.type === 'trial', `lane: ${id} is unlock.type trial (alien ability)`);
  }
  ok(!Game.trialGrantFor('no_such_trial'), 'mapping: unknown trial key -> null');

  // ---------- 2. thresholds fire ----------
  freshScholar(Game);
  const cx = () => Game.playerTracks().combat.xp;
  const c2 = cx();
  Game.noteTrialDeed('win_a_fight', 1);
  ok(!Game.hasAbility('adrenaline_control') && cx() === c2 + 3, 'deed: win_a_fight x1 credits combat +3 (no direct grant)', `${c2} -> ${cx()}`);

  freshScholar(Game);
  Game.noteTrialDeed('catch_3_lies', 2);
  ok(!Game.hasAbility('evidence_board'), 'deed: catch_3_lies x2 does NOT grant yet');
  Game.noteTrialDeed('catch_3_lies', 1);
  ok(Game.hasAbility('evidence_board'), 'deed: catch_3_lies x3 grants evidence_board');

  freshScholar(Game);
  Game.noteTrialDeed('hear_10_rumors', 9);
  ok(!Game.hasAbility('gossip_network'), 'deed: hear_10_rumors x9 does NOT grant yet');
  Game.noteTrialDeed('hear_10_rumors', 1);
  ok(Game.hasAbility('gossip_network'), 'deed: hear_10_rumors x10 grants gossip_network');

  // ---------- 3. pre-arrival: deeds accrue, grants wait ----------
  freshScholar(Game);
  Game.state.systemArrived = false;
  Game.noteTrialDeed('win_a_fight', 1);
  ok(!Game.hasAbility('adrenaline_control'), 'pre-arrival: win_a_fight counted, no magic grant');
  ok(Game.state.scholar.trialDeeds.win_a_fight === 1, 'pre-arrival: deed counter accrued');
  Game.noteTrialDeed('stop_a_fight', 1);
  ok(Game.hasAbility('peacemaker') && (Game.state.codex.skills.mediate || {}).level === 1 && !Game.state.scholar.abilities.length,
    'pre-arrival: stop_a_fight teaches mediate (human skill) now, no slot');
  const c3 = cx();
  Game.state.systemArrived = true;
  Game.checkPendingTrialDeeds();
  ok(!Game.hasAbility('adrenaline_control') && cx() === c3, 'arrival: the pre-arrival deed was already credited (XP accrues from day one), no grant, no double count', `${c3} -> ${cx()}`);

  // ---------- 4. idempotent ----------
  const before = Game.state.scholar.abilities.length;
  Game.noteTrialDeed('win_a_fight', 5);
  Game.noteTrialDeed('stop_a_fight', 5);
  ok(Game.state.scholar.abilities.length === before, 'idempotent: re-deed does not duplicate');
  ok(Game.state.scholar.abilities.filter(a => a.id === 'adrenaline_control').length === 0 && cx() === c3, 'idempotent: the combat credit lands once');
  ok(Game.state.codex.skills.mediate.level === 1, 'idempotent: mediate stays L1 (no re-teach)');

  // ---------- 5. six-slot law: honest refusal, no overflow ----------
  freshScholar(Game);
  const s5 = Game.state.scholar;
  s5.abilities = ['a1','a2','a3','a4','a5','a6'].map(id => ({ id, name: id, level: 1, xp: 0 }));
  said.length = 0;
  Game.noteTrialDeed('discover_5_locations', 5);
  ok(Game.hasAbility('eagle_eye') && s5.abilities.length === 6, 'slots full: a human deed is still taught (skills take no slot)');
  said.length = 0;
  Game.noteTrialDeed('take_50_damage_in_one_fight', 1);
  ok(!Game.hasAbility('trade_of_blows'), 'slots full: no magic grant');
  ok(s5.abilities.length === 6, 'slots full: no overflow (still 6)');
  const refusal = said.join(' ');
  ok(Game.playerTracks().combat.xp >= 3, 'slots full: the deed still credits combat (track XP takes no slot)', String(Game.playerTracks().combat.xp));
  ok(!/undefined/.test(refusal), 'slots full: no undefined in the line');

  // ---------- 6. grant narration sense ----------
  freshScholar(Game);
  said.length = 0;
  Game.noteTrialDeed('take_50_damage_in_one_fight', 1);
  ok(!Game.hasAbility('trade_of_blows') && (Game.state.scholar.deedConverted || {}).take_50_damage_in_one_fight, 'deed: take_50_damage credits combat (no direct grant)');
  const narration = said.join('\n');
  ok(/TRIAL RECOGNIZED/.test(narration), 'sense: recognition beat fires');
  ok(/Combat track/.test(narration), 'sense: names the track it fed');
  ok(!/undefined/.test(narration), 'sense: no undefined in grant narration');
  ok(narration.length > 60, 'sense: narration is substantive, not a stub', `${narration.length} chars`);

  // ---------- 7. markSeen hook: 5 new visited tiles -> eagle_eye ----------
  freshScholar(Game);
  const s7 = Game.state.scholar;
  s7.seenTiles = {}; // reset map knowledge for a clean count
  for (let i = 0; i < 4; i++) Game.markSeen(100 + i, 200, 'visited');
  ok(!Game.hasAbility('eagle_eye'), 'markSeen: 4 new tiles, no grant yet');
  Game.markSeen(104, 200, 'visited');
  ok(Game.hasAbility('eagle_eye'), 'markSeen: 5th new tile grants eagle_eye');
  Game.markSeen(104, 200, 'visited'); // re-visit same tile
  ok(s7.trialDeeds.discover_5_locations === 5, 'markSeen: re-visit does not double-count');

  // ---------- 8. source wiring: all hook sites present ----------
  const gameSrc = fs.readFileSync(path.join(ROOT, 'src/js/game.js'), 'utf8');
  const truthSrc = fs.readFileSync(path.join(ROOT, 'src/js/truth.js'), 'utf8');
  ok(/noteTrialDeed\('win_a_fight', 1\)/.test(gameSrc), 'wiring: tbEnd win_a_fight');
  ok(/noteTrialDeed\('take_50_damage_in_one_fight', 1\)/.test(gameSrc), 'wiring: tbEnd take_50_damage');
  ok(/noteTrialDeed\('blood_trial', 1\)/.test(gameSrc), 'wiring: tbEnd blood_trial');
  ok(/t\._taken = \(t\._taken \|\| 0\) \+ final/.test(gameSrc), 'wiring: tbDamage player _taken ledger');
  ok(/noteTrialDeed\('intimidate_someone', 1\)/.test(gameSrc), 'wiring: intimidate');
  ok(/noteTrialDeed\('hear_10_rumors', 1\)/.test(gameSrc), 'wiring: gossip fragments');
  ok(/noteTrialDeed\('stop_a_fight', 1\)/.test(gameSrc), 'wiring: mediateConflict');
  ok(/noteTrialDeed\('discover_5_locations', 1\)/.test(gameSrc), 'wiring: markSeen');
  ok(/noteTrialDeed\('hunger_trial', 1\)/.test(gameSrc), 'wiring: unsafe-food eat');
  ok(/checkPendingTrialDeeds\(\)/.test(gameSrc), 'wiring: checkSystemArrival pending pass');
  ok(/noteTrialDeed\('catch_3_lies', 1\)/.test(truthSrc), 'wiring: truth.js confession');
  ok(/trial-deeds\.js/.test(fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')), 'wiring: index.html loads trial-deeds.js');

  // ---------- 9. human-skills lane: grants never touch human skills ----------
  // (also: the 6-slot law caps trial grants — 9 deeds, 6 slots; the 7th+
  // is refused honestly, not overflowed. Choices matter.)
  freshScholar(Game);
  said.length = 0;
  Game.state.scholar.abilities = ['a1', 'a2', 'a3'].map(id => ({ id, name: id, level: 1, xp: 0 }));
  const base9 = { combat: Game.playerTracks().combat.xp, craft: Game.playerTracks().craft.xp }; // occupation lean
  for (const key of Object.keys(expected)) Game.trialDeedGrant(key);
  const granted = Game.state.scholar.abilities.map(a => a.id);
  const humanSkillIds = ['herbal_remedy', 'intimidating_presence', 'gossip_network', 'peacemaker', 'eagle_eye', 'evidence_board'];
  ok(!granted.some(id => humanSkillIds.includes(id)), 'lane: no human skills slotted', granted.join(','));
  ok(humanSkillIds.slice(1).every(id => Game.hasAbility(id)), 'lane: the 5 human trial deeds are known as skills');
  ok(granted.length === 3, 'slots: the 4 magic deeds slot nothing (they feed tracks)', granted.join(','));
  ok(Game.playerTracks().combat.xp === base9.combat + 9 && Game.playerTracks().craft.xp === base9.craft + 3, 'tracks: 3 combat trials +9 combat, hunger +3 craft',
    JSON.stringify({ combat: Game.playerTracks().combat.xp, craft: Game.playerTracks().craft.xp }));

  // ---------- 10. trial gifts pay abilityOnAcquire + recompute synergies ----------
  // (mirrors the break-it r5 priced-gift rule — a grant must not skip costs)
  freshScholar(Game);
  Game.state.scholar.abilities = [{ id: 'adrenaline_surge', name: 'Adrenaline Surge', level: 1, xp: 0 }];
  let recomputed = false;
  const origRecompute = Game.recomputeActiveSynergies;
  Game.recomputeActiveSynergies = function () { recomputed = true; return origRecompute.call(this); };
  Game.noteTrialDeed('win_a_fight', 1);
  ok(!recomputed && (Game.state.scholar.deedConverted || {}).win_a_fight, 'no grant -> no synergy recompute; the conversion is recorded once');
  Game.recomputeActiveSynergies = origRecompute;

  // ---------- 11. background-held trial ability: no duplicate grant ----------
  freshScholar(Game);
  Game.state.codex.skills.old_world_cache = { level: 2, via: 'background' };
  const b11 = Game.state.scholar.abilities.length;
  Game.noteTrialDeed('discover_5_locations', 9);
  ok(Game.state.scholar.abilities.length === b11, 'background: trial deed does not duplicate an already-known skill');
  ok(Game.state.codex.skills.old_world_cache.level === 2, 'background: known skill untouched (no downgrade)');

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
