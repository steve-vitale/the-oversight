// scripts/test-ability-lanes-20261014.js — ABILITY LANES proof.
//
// Steve 2026-10-14: "Things acquired from events and other meaningful
// experiences, knowledge learned etc should be typically ending up in
// skills, unless it fits the magic power theme." Abilities = magic only
// (the 6 slots); human competences are skills (codex), which still carry
// their ability's mechanics (modifiers + actions).
//
// Proves:
//   - every abilities.json entry has a lane; ids are unique; every
//     skill-lane entry resolves to a knowledge.json skill
//   - no skill-lane id is ever offered (arrival, contest prize, trial gift,
//     poison aid, aid quest sheet, spawn knack) across many seeds
//   - a known skill-lane ability's modifier applies and its action is usable
//   - learning herbal_medicine grants herbal_remedy's mechanics
//   - deeds/aid quests that granted human abilities now teach the skill
//   - save migration moves skill-lane slot entries into codex.skills
//   - occupation background grants skills, never slot/background abilities
'use strict';
const K = require('./godpath/lib');
// in-memory localStorage for the save/load round trip (node has none)
const _store = {};
globalThis.localStorage = globalThis.localStorage || {
  getItem: (k) => (k in _store ? _store[k] : null),
  setItem: (k, v) => { _store[k] = String(v); },
  removeItem: (k) => { delete _store[k]; },
  key: (i) => Object.keys(_store)[i] || null,
  get length() { return Object.keys(_store).length; },
};
const T = K.reporter('test-ability-lanes-20261014');

const abilities = K.readJSON('src/data/abilities.json');
const knowledge = K.readJSON('src/data/knowledge.json');
const kIds = new Set(knowledge.map(k => k.id));

function choiceIds(list) { return (list || []).map(c => (c && c.id) || c); }

(async () => {
  T.section('data');
  const ids = abilities.map(a => a.id);
  T.ok('every ability has lane magic|skill', abilities.every(a => a.lane === 'magic' || a.lane === 'skill'),
    abilities.filter(a => a.lane !== 'magic' && a.lane !== 'skill').map(a => a.id).join(','));
  T.ok('ability ids unique (night_eyes/pathfinder/iron_gut merged)', new Set(ids).size === ids.length);
  const skillLane = abilities.filter(a => a.lane === 'skill');
  const SKILL = new Set(skillLane.map(a => a.id));
  T.ok('every skill-lane entry resolves to a knowledge skill',
    skillLane.every(a => kIds.has(a.skillId || a.id)), skillLane.filter(a => !kIds.has(a.skillId || a.id)).map(a => a.id).join(','));
  T.ok('merged skills list their ability mechanics',
    skillLane.every(a => (knowledge.find(k => k.id === (a.skillId || a.id)).abilityMechanics || []).includes(a.id)));
  T.ok('human examples are skill-lane', ['triage', 'tracker', 'haymaker', 'hogtie', 'tripwire', 'herbal_remedy', 'camp_cook', 'wanderer'].every(i => SKILL.has(i)));
  T.ok('magic examples stay magic', ['purify', 'photosynthesis', 'night_eyes', 'iron_stomach', 'hoarder', 'loud_chewer', 'rage'].every(i => !SKILL.has(i)));
  const ist = abilities.find(a => a.id === 'iron_stomach');
  T.ok('iron_gut is an alias of iron_stomach', (ist.aliases || []).includes('iron_gut'));
  const lc = abilities.find(a => a.id === 'loud_chewer');
  T.ok('loud_chewer has a real social upside (trust.gain_mult > 1)', (lc.modifiers || []).some(m => m.target === 'trust.gain_mult' && m.value > 1));
  const occ = K.readJSON('src/data/characterGen.json').occupations;

  T.section('offers never include skill-lane ids (many seeds)');
  const offered = [];
  let sheets = 0;
  for (const seed of [1, 2, 3, 4, 5, 6, 7, 8]) {
    const Game = await K.load({ seed });
    K.newRun(Game);
    const s = Game.state.scholar;
    // arrival: every week-1 profile (including the old human conds)
    for (const w1 of [{}, { hunt: 5 }, { talk: 9, donate: 3 }, { cook: 3, scavenge: 4, forage: 5 }, { langStruggle: 3, hunt: 4 }]) {
      s.week1 = w1;
      offered.push(...choiceIds(Game.firstAbilityChoices())); sheets++;
    }
    s.poisons = [{ id: 'x' }];
    offered.push(...choiceIds(Game.poisonAidChoices())); sheets++;
    s.poisons = [];
    // contest prize (all categories)
    K.openSlots(Game, 6);
    for (const cat of ['blood', 'moot', 'wit', '']) {
      s.abilityChoices = null;
      Game._cxPrizeAbilityOffer({ id: 'x', cat });
      offered.push(...choiceIds(s.abilityChoices)); sheets++;
    }
    // audience trial gift
    s.abilityChoices = null;
    const pg = Game.progState();
    pg.trial = { kind: 'pantry', text: 'test', need: 1, start: 0, expires: 999 };
    Game.completeTrial();
    offered.push(...choiceIds(s.abilityChoices)); sheets++;
    // aid quest ability sheet (third kind = magic pool)
    for (const kind of ['fetch', 'treat', 'learn']) {
      s.abilityChoices = null;
      Game.state.activeAidQuest = { kind, rewardKind: 'ability' };
      Game._completeAidQuest(true);
      offered.push(...choiceIds(s.abilityChoices)); sheets++;
    }
    // spawn knack
    offered.push(...choiceIds(Game.knackChoicesFor({ lifeseed: { skillOrigins: { navigation: 1, sewing: 1, forecast: 1, butchery: 1 } } }))); sheets++;
  }
  const bad = offered.filter(id => SKILL.has(id));
  T.ok(`no skill-lane id in ${sheets} offer sheets (${offered.length} options)`, bad.length === 0, [...new Set(bad)].join(','));
  T.ok('offers are not empty overall', offered.length > 50, 'n=' + offered.length);

  T.section('mechanics ride on skills');
  {
    const Game = await K.load({ seed: 11 });
    K.newRun(Game);
    Game.state.codex.skills = {};
    Game.state.scholar.backgroundAbilities = [];
    const base = Game.modTarget('hunt.find_chance', 1);
    T.ok('tracker not owned without the skill', !Game.hasAbility('tracker'));
    Game.learnSkill('track_read', 1, 'test');
    T.ok('knowing track_read owns tracker/game_sense/blood_trail',
      Game.hasAbility('tracker') && Game.hasAbility('game_sense') && Game.hasAbility('blood_trail'));
    const withSkill = Game.modTarget('hunt.find_chance', 1);
    T.ok('game_sense hunt.find_chance modifier applies via the skill', withSkill > base * 1.3, base + ' -> ' + withSkill);
    Game.learnSkill('track_read', 2, 'test');
    T.ok('abilityLevel follows the skill level', Game.abilityLevel('tracker') === 2);
    T.ok('scale:level uses the skill level', Game.modTarget('hunt.find_chance', 1) > withSkill * 1.3);
    T.ok('skill-lane abilities never sit in slots', !K.abilityIds(Game).some(i => SKILL.has(i)));
    // herbal_medicine carries herbal_remedy
    T.ok('herbal_remedy not owned before', !Game.hasAbility('herbal_remedy'));
    Game.learnSkill('herbal_medicine', 1, 'test');
    T.ok('learning herbal_medicine grants herbal_remedy mechanics', Game.hasAbility('herbal_remedy'));
    // XP: using a skill-lane ability deepens the SKILL
    Game.learnSkill('steady_hands', 1, 'test');
    for (let i = 0; i < 6; i++) Game.gainAbilityXP('steady_hands', 1);
    T.ok('6 uses of steady_hands -> skill L2 (not a slot entry)', (Game.state.codex.skills.steady_hands || {}).level === 2 && !K.abilityIds(Game).includes('steady_hands'));
    // action: haymaker is usable in a fight once the skill is known
    Game.learnSkill('haymaker', 1, 'test');
    Game.state.scholar.kcal = 3000;
    K.fight(Game, 'hushwolf', { hp: 200 });
    const acts = Game.activatableAbilities().map(a => a.id);
    T.ok('haymaker action offered in combat', acts.includes('haymaker.throw_haymaker'), acts.join(','));
    const said = K.captureSays(Game);
    const r = Game.useAbility('haymaker', 'throw_haymaker');
    said.restore();
    T.ok('haymaker action executes', r !== false && !said.some(l => /don't have that ability/.test(l)), said.slice(-3).join(' | '));
  }

  T.section('magic fixes: hoarder carry, loud_chewer upside');
  {
    const Game = await K.load({ seed: 15 });
    K.newRun(Game);
    K.openSlots(Game, 6);
    Game.state.scholar.abilities = [];
    const cap0 = Game.carryCapacity();
    const tr0 = Game.modTarget('trust.gain_mult', 1);
    K.giveAbility(Game, 'hoarder');
    T.ok('hoarder: +10kg carry is real', Game.carryCapacity() === cap0 + 10, cap0 + ' -> ' + Game.carryCapacity());
    Game.state.scholar.abilities = [];
    K.giveAbility(Game, 'loud_chewer');
    T.ok('loud_chewer: trust builds 10% faster', Math.abs(Game.modTarget('trust.gain_mult', 1) - tr0 * 1.1) < 1e-9);
    T.ok('loud_chewer: monsters still hear you 2x', Game.modTarget('monster.hear_mult', 1) >= 2);
  }

  T.section('grant paths teach skills');
  {
    const Game = await K.load({ seed: 12 });
    K.newRun(Game);
    Game.state.systemArrived = true;
    K.openSlots(Game, 6);
    Game.state.codex.skills = {};
    const slots0 = K.abilityIds(Game).length;
    Game.practiceDeedGrant('haymaker');
    T.ok('practice deed haymaker teaches the skill, no slot', Game.hasAbility('haymaker') && (Game.state.codex.skills.haymaker || {}).level >= 1 && K.abilityIds(Game).length === slots0);
    Game.trialDeedGrant('stop_a_fight');
    T.ok('trial deed peacemaker teaches mediate', (Game.state.codex.skills.mediate || {}).level >= 1 && Game.hasAbility('peacemaker'));
    Game.state.activeAidQuest = { kind: 'treat', rewardKind: 'ability' };
    const ar = Game._completeAidQuest(true);
    T.ok('treat aid quest teaches wound_care', ar === 'reward-skill' && Game.hasAbility('triage'), 'ar=' + ar);
    // a slipped-through pending sheet with a skill-lane id teaches instead
    Game.state.scholar.abilityChoices = [{ id: 'hogtie', name: 'Hogtie' }];
    Game.chooseAbility('hogtie');
    T.ok('chooseAbility on a skill-lane id teaches, never slots', Game.hasAbility('hogtie') && !K.abilityIds(Game).includes('hogtie'));
  }

  T.section('save migration');
  {
    const Game = await K.load({ seed: 13 });
    K.newRun(Game);
    const s = Game.state.scholar;
    Game.state.codex.skills = {};
    s.abilities = [{ id: 'triage', level: 2, xp: 1 }, { id: 'purify', level: 1 }, { id: 'tracker', level: 1 }, { id: 'iron_gut', level: 1 }];
    s.backgroundAbilities = [{ id: 'steady_hands', level: 3, background: true }, { id: 'green_thumb', level: 1, background: true }];
    const moved = Game.migrateAbilityLanes();
    const slotIds = K.abilityIds(Game);
    T.ok('slots hold no skill-lane ids after migration', !slotIds.some(i => SKILL.has(i)), slotIds.join(','));
    T.ok('magic stays in slots (purify) and iron_gut -> iron_stomach', slotIds.includes('purify') && slotIds.includes('iron_stomach') && !slotIds.includes('iron_gut'));
    T.ok('levels kept: wound_care L2, steady_hands L3', (Game.state.codex.skills.wound_care || {}).level === 2 && (Game.state.codex.skills.steady_hands || {}).level === 3);
    T.ok('migrated abilities still owned', Game.hasAbility('triage') && Game.hasAbility('tracker') && Game.hasAbility('steady_hands'));
    T.ok('migration idempotent', Game.migrateAbilityLanes() === 0 && moved > 0);
    // round trip through a real save/load
    s.abilities.push({ id: 'haymaker', level: 2 });
    Game.state.runKey = 'lanes-test';
    const saved = Game.save();
    const loaded = Game.load('lanes-test');
    T.ok('save/load round trip', saved === true && loaded !== false, `save=${saved} load=${loaded}`);
    T.ok('load() migrates slot human abilities', !K.abilityIds(Game).includes('haymaker') && Game.abilityLevel('haymaker') === 2);
  }

  T.section('occupations grant skills only');
  {
    const Game = await K.load({ seed: 14 });
    // er_nurse grants triage + steady_hands
    let hit = 0;
    for (let i = 0; i < 6 && !hit; i++) {
      Game.genRoster('Columbus, Ohio');
      for (const v of Game.generatedRoster) {
        const o = occ.find(x => x.id === v.occupationId);
        if (!o || !(o.granted || []).some(g => SKILL.has(g))) continue;
        Game.newGame('Columbus, Ohio', null, v.id);
        const s = Game.state.scholar;
        T.ok(`${o.id}: no background/slot abilities`, (s.backgroundAbilities || []).length === 0 && (s.abilities || []).length === 0);
        const taught = o.granted.filter(g => SKILL.has(g));
        T.ok(`${o.id}: granted human competences known as skills (${taught.join(',')})`, taught.every(g => Game.hasAbility(g)));
        hit++;
        break;
      }
    }
    T.ok('found an occupation with human grants', hit > 0);
  }

  T.done();
})().catch(e => { console.error(e); process.exitCode = 1; });
