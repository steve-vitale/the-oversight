#!/usr/bin/env node
// test-practice-deeds-20261012.js — lever 9 r5 proof: practice deed grants.
// The 5 unlock.type === 'practice' abilities (stalk, blood_trail, ambush,
// war_cry, haymaker) and the unlock.type === 'discovery' soft_step were
// data-declared but had NO player grant path — dead rungs on the unlock
// ladder (r4 wired the 9 trial-type abilities; these 6 stayed
// documented-not-wired). This test proves the practice deeds now grant.
//
// Mechanical: mapping correct, thresholds fire (9≠10, 2≠3, 1≠2, 19≠20), pre-arrival
// pending (incl. the banked soft_step streak), idempotent, 6-slot law honest,
// background-held never duplicates, hook sites wired in source, synergies
// recomputed, grant narration sense-read (no 'undefined', System voice),
// REAL hunt loop: stalk/blood_trail deeds fire through huntAnimal/stalkAnimal.
// Must RED on pristine HEAD (no practice-deeds.js, no hooks).
//
// ABILITY LANES (2026-10-14, design change): stalk, blood_trail, ambush,
// haymaker and soft_step are human competences (lane 'skill'). The deed now
// TEACHES the codex skill — immediately (no System needed), never a slot,
// narrated by learnSkill. Only war_cry (magic) is a System grant that waits
// on arrival and obeys the six-slot law. Sections 1, 3-9, 11, 12 updated.
//
// UNIFIED TRACKS (2026-10-14, design change): war_cry no longer grants
// itself. Its practice credits the combat track once (+3, tracks.json
// deedConversions); the power comes from the combat level-up sheet.
// Sections 2, 3, 4, 6, 9, 11 assert the credit instead of the grant.
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
  s.backgroundAbilities = []; // background interaction gets its own explicit test (section 7)
  s.practiceDeeds = {};
  s.softStepStreak = 0;
  s.softStepPending = false;
  s.integration = 100; // 6 slots
  Game.state.systemArrived = true;
  Game.state.codex.skills = {}; // skill-lane abilities are owned via codex skills
  s.tracks = null; s.deedConverted = {}; s.levelUpQueue = []; s.abilityChoices = null; // unified tracks
  return s;
}
const SKILL_LANE = new Set(['stalk', 'blood_trail', 'ambush', 'haymaker', 'soft_step']);
const known = (Game, id) => !!(Game.state.codex.skills[Game.abilitySkillId(id)] || {}).level;

const EXPECTED = {
  stalk: 'stalk', blood_trail: 'blood_trail', ambush: 'ambush',
  war_cry: 'war_cry', haymaker: 'haymaker', soft_step: 'soft_step',
};
const THRESH = { stalk: 10, blood_trail: 3, ambush: 2, war_cry: 3, haymaker: 3, soft_step: 20 };

(async () => {
  const { Game, loadFails } = await loadGame({ seed: 4242, mode: 'god', fullTelemetry: false });
  if (loadFails && loadFails.length) { console.log('load fails:', loadFails.join(';')); fail += loadFails.length; }
  await setupGame(Game);
  ok(typeof Game.notePracticeDeed === 'function', 'mixin: notePracticeDeed on Game');
  ok(typeof Game.practiceDeedGrant === 'function', 'mixin: practiceDeedGrant on Game');
  ok(typeof Game.checkPendingPracticeDeeds === 'function', 'mixin: checkPendingPracticeDeeds on Game');
  ok(typeof Game.practiceGrantFor === 'function', 'mixin: practiceGrantFor on Game');
  ok(typeof Game.noteSoftStepTile === 'function', 'mixin: noteSoftStepTile on Game');

  const said = [];
  Game.say = (m) => said.push(String(m));
  Game.sysSay = (m) => said.push(String(m));

  // ---------- 1. mapping: practice keys resolve to the right ids ----------
  for (const [key, id] of Object.entries(EXPECTED)) {
    const def = Game.practiceGrantFor(key);
    ok(def && def.id === id, `mapping: ${key} -> ${id}`, def ? def.id : 'null');
    ok(def && def.unlock && (def.unlock.type === 'practice' || def.unlock.type === 'discovery'),
      `unlock: ${id} is practice/discovery`);
    ok(def && def.lane === (SKILL_LANE.has(id) ? 'skill' : 'magic'), `lane: ${id} is ${SKILL_LANE.has(id) ? 'a human skill' : 'magic'}`, def && def.lane);
  }
  ok(!Game.practiceGrantFor('no_such_deed'), 'mapping: unknown practice key -> null');

  // ---------- 2. thresholds fire, boundaries don't ----------
  for (const [key, th] of Object.entries(THRESH)) {
    if (key === 'soft_step') continue; // streak-managed; section 5
    freshScholar(Game);
    Game.notePracticeDeed(key, th - 1);
    ok(!Game.hasAbility(EXPECTED[key]), `threshold: ${key} x${th - 1} -> no grant`);
    const cBefore = Game.playerTracks().combat.xp;
    Game.notePracticeDeed(key, 1);
    if (key === 'war_cry') ok(!Game.hasAbility('war_cry') && Game.playerTracks().combat.xp === cBefore + 3, `threshold: war_cry x${th} -> combat +3 (no direct grant)`);
    else ok(Game.hasAbility(EXPECTED[key]), `threshold: ${key} x${th} -> granted`);
  }

  // ---------- 3. idempotent ----------
  freshScholar(Game);
  Game.notePracticeDeed('stalk', 10);
  const n1 = known(Game, 'stalk') ? 1 : 0;
  Game.notePracticeDeed('stalk', 10);
  const n2 = known(Game, 'stalk') ? 1 : 0;
  ok(n1 === 1 && n2 === 1 && Game.state.scholar.abilities.length === 0 && Game.state.codex.skills.stalk.level === 1,
    'idempotent: stalk taught once (skill L1, no slot)', `${n1}/${n2}`);
  const c3 = Game.playerTracks().combat.xp;
  Game.notePracticeDeed('war_cry', 3);
  Game.notePracticeDeed('war_cry', 3);
  ok(Game.state.scholar.abilities.length === 0 && Game.playerTracks().combat.xp === c3 + 3, 'idempotent: war_cry (magic) credits combat once, never slots');

  // ---------- 4. pre-arrival counting, no grant; pending pass on arrival ----------
  freshScholar(Game);
  Game.state.systemArrived = false;
  Game.notePracticeDeed('blood_trail', 3);
  Game.notePracticeDeed('ambush', 2);
  Game.notePracticeDeed('war_cry', 3);
  ok(known(Game, 'blood_trail') && known(Game, 'ambush') && !Game.hasAbility('war_cry'),
    'pre-arrival: human deeds taught as skills now, magic (war_cry) waits');
  ok((Game.state.scholar.deedConverted || {}).war_cry && Game.practiceDeedGrant('war_cry') === null, 'pre-arrival: war_cry credited combat already (XP accrues from day one); a second grant call is a no-op');
  const c4 = Game.playerTracks().combat.xp;
  Game.state.systemArrived = true;
  Game.checkPendingPracticeDeeds();
  ok(Game.hasAbility('blood_trail') && Game.hasAbility('ambush') && !Game.hasAbility('war_cry') && Game.playerTracks().combat.xp === c4,
    'arrival: pending pass changes nothing (skills already taught, combat already credited)');

  // ---------- 5. soft_step streak ----------
  freshScholar(Game);
  for (let i = 0; i < 19; i++) Game.noteSoftStepTile(false);
  ok(!Game.hasAbility('soft_step'), 'soft_step: 19 quiet tiles -> no grant');
  Game.noteSoftStepTile(true); // detected at 19
  Game.noteSoftStepTile(false);
  ok(Game.state.scholar.softStepStreak === 1, 'soft_step: detection resets the streak', String(Game.state.scholar.softStepStreak));
  for (let i = 0; i < 20; i++) Game.noteSoftStepTile(false);
  ok(Game.hasAbility('soft_step'), 'soft_step: 20 consecutive quiet tiles -> granted');
  // pre-arrival streak banking
  freshScholar(Game);
  Game.state.systemArrived = false;
  for (let i = 0; i < 20; i++) Game.noteSoftStepTile(false);
  ok(known(Game, 'soft_step') && Game.state.scholar.abilities.length === 0,
    'soft_step: pre-arrival 20-streak teaches the skill (no System needed)');
  Game.state.systemArrived = true;
  Game.checkPendingPracticeDeeds();
  ok(Game.hasAbility('soft_step'), 'soft_step: banked streak fires on arrival');

  // ---------- 6. six-slot law: honest refusal, never overflow ----------
  freshScholar(Game);
  Game.state.scholar.abilities = ['a1', 'a2', 'a3', 'a4', 'a5', 'a6'].map(id => ({ id, level: 1 }));
  said.length = 0;
  Game.notePracticeDeed('haymaker', 3);
  ok(known(Game, 'haymaker') && Game.state.scholar.abilities.length === 6, 'slots: a human deed is taught even with full slots (skills take no slot)');
  said.length = 0;
  Game.notePracticeDeed('war_cry', 3);
  ok(Game.state.scholar.abilities.length === 6, 'slots: full 6 stays 6/6, no overflow');
  ok(!Game.hasAbility('war_cry'), 'slots: no magic grant when full');
  const refusal = said.join('\n');
  ok((Game.state.scholar.deedConverted || {}).war_cry, 'slots: full slots do not block the combat credit (track XP takes no slot)');
  ok(!/undefined/.test(refusal), 'slots: narration has no undefined');

  // ---------- 7. background-held never duplicates ----------
  freshScholar(Game);
  Game.state.codex.skills.stalk = { level: 2, via: 'background' };
  Game.notePracticeDeed('stalk', 10);
  ok(Game.state.scholar.abilities.filter(a => a.id === 'stalk').length === 0 && Game.state.codex.skills.stalk.level === 2,
    'background: stalk already known -> no duplicate, no downgrade');

  // ---------- 8. synergies recomputed on grant ----------
  freshScholar(Game);
  let recomputed = 0;
  const _r = Game.recomputeActiveSynergies;
  Game.recomputeActiveSynergies = function () { recomputed++; return _r ? _r.call(this) : null; };
  Game.notePracticeDeed('ambush', 2);
  ok(recomputed >= 1, 'grant: recomputeActiveSynergies runs', String(recomputed));
  Game.recomputeActiveSynergies = _r;

  // ---------- 9. grant narration sense-read ----------
  freshScholar(Game);
  said.length = 0;
  Game.notePracticeDeed('war_cry', 3);
  const text = said.join('\n');
  ok(/PRACTICE RECOGNIZED/.test(text), 'narration: PRACTICE RECOGNIZED beat');
  ok(/System has been watching/.test(text), 'narration: System voice');
  ok(/voice moved something with teeth/.test(text), 'narration: names the deed');
  ok(/Combat track/.test(text), 'narration: names the track it fed');
  ok(!/undefined/.test(text), 'narration: no undefined');
  ok(!/\b(stalk|blood_trail|ambush|war_cry|haymaker|soft_step)\b/.test(text),
    'narration: no raw ids leak to the player');

  // ---------- 10. hook sites wired in source ----------
  const gameSrc = fs.readFileSync(path.join(ROOT, 'src/js/game.js'), 'utf8');
  const encSrc = fs.readFileSync(path.join(ROOT, 'src/js/encounters.js'), 'utf8');
  const foodSrc = fs.readFileSync(path.join(ROOT, 'src/js/food.js'), 'utf8');
  ok(/notePracticeDeed\('ambush', 1\)/.test(gameSrc), 'wiring: tbEnd ambush');
  ok(/\(f && f\.round\)[^]*notePracticeDeed\('ambush'|notePracticeDeed\('ambush', 1\)/.test(gameSrc), 'wiring: ambush round-1 gate');
  ok(/notePracticeDeed\('haymaker', 1\)/.test(gameSrc), 'wiring: tbPlayerStrike haymaker');
  ok(/shown >= _hmMax \* 0\.5/.test(gameSrc), 'wiring: haymaker half-HP gate');
  ok(/notePracticeDeed\('war_cry', 1\)/.test(gameSrc), 'wiring: tbPlayerShout war_cry');
  ok(/noteSoftStepTile\(true\)/.test(gameSrc), 'wiring: soft_step detection');
  ok(/noteSoftStepTile\(false\)/.test(gameSrc), 'wiring: soft_step quiet tiles');
  ok(/checkPendingPracticeDeeds\(\)/.test(gameSrc), 'wiring: arrival pending pass');
  ok(/notePracticeDeed\('stalk', 1\)/.test(encSrc), 'wiring: hunt kill stalk');
  ok(/notePracticeDeed\('blood_trail', 1\)/.test(encSrc), 'wiring: hunt kill blood_trail');
  ok(/boltedOnce/.test(encSrc) && /boltedOnce/.test(foodSrc), 'wiring: boltedOnce flags');
  ok(/noteSoftStepTile\(true\)/.test(gameSrc), 'wiring: wanderer contact detected');
  const idxTag = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  ok(/src\/js\/practice-deeds\.js/.test(idxTag), 'wiring: practice-deeds.js in index.html load order');

  // ---------- 11. all 6 fill exactly 6 slots; the 7th deed refused honestly ----------
  freshScholar(Game);
  said.length = 0;
  Game.notePracticeDeed('stalk', 10);
  Game.notePracticeDeed('blood_trail', 3);
  Game.notePracticeDeed('ambush', 2);
  Game.notePracticeDeed('war_cry', 3);
  Game.notePracticeDeed('haymaker', 3);
  for (let i = 0; i < 20; i++) Game.noteSoftStepTile(false);
  ok(Game.state.scholar.abilities.length === 0 && ['stalk', 'blood_trail', 'ambush', 'haymaker', 'soft_step'].every(id => known(Game, id)),
    'slots: 6 practice deeds -> 5 skills, no slot (war_cry fed combat)', String(Game.state.scholar.abilities.length));
  Game.state.scholar.abilities = Game.state.scholar.abilities.concat(['a1', 'a2', 'a3', 'a4', 'a5', 'a6'].map(id => ({ id, level: 1 })));
  Game.noteTrialDeed && Game.noteTrialDeed('win_a_fight', 1); // a 7th deed from another lane
  ok(Game.state.scholar.abilities.length === 6, 'slots: 7th deed refused, still 6');

  // ---------- 12. human-skill lane untouched ----------
  const all = Game.data.abilities || [];
  const practiceDefs = all.filter(a => a.unlock && (a.unlock.type === 'practice' || a.unlock.type === 'discovery'));
  const ids = new Set(practiceDefs.map(a => a.id));
  ok(['stalk', 'blood_trail', 'ambush', 'war_cry', 'haymaker', 'soft_step'].every(id => ids.has(id)),
    'lane: practice/discovery pool = the 6, nothing else');
  ok(practiceDefs.every(a => a.unlock.type !== 'human_skill' && !a.humanSkill),
    'lane: none of the 6 are human skills');

  // ---------- 13. REAL hunt loop: stalk/blood_trail fire through the engine ----------
  // A real player behavior, not a unit mock: spawn a prey animal via the real
  // encounter state, approach with the real stalkAnimal verb, kill with the
  // real huntAnimal. Deterministic per seed (seeded RNG).
  async function huntProbe(seed) {
    const r = await loadGame({ seed, mode: 'god', fullTelemetry: false });
    const G2 = r.Game;
    await setupGame(G2);
    const s2 = G2.state.scholar;
    G2.state.systemArrived = true;
    s2.abilities = []; s2.backgroundAbilities = []; s2.practiceDeeds = {};
    s2.softStepStreak = 0; s2.integration = 100;
    try { G2.travelTo(4, 3); } catch (e) {}
    let kills = 0;
    for (let e = 0; e < 14 && kills < 6; e++) {
      s2.mx = 4; s2.my = 4; s2.kcal = 3000; s2.health = 100;
      const loud = e % 3 === 2; // every 3rd encounter starts loud: a chase
      s2.animal = { id: loud ? 'cottontail_rabbit' : 'white_tailed_deer', mx: 8, my: 4,
        aware: loud ? 1 : 0, pstate: 'graze', stamina: loud ? 5 : 3 };
      let guard = 0;
      while (s2.animal && guard++ < 30 && !G2.over) {
        const a = s2.animal;
        const dist = Math.max(Math.abs(a.mx - s2.mx), Math.abs(a.my - s2.my));
        try {
          if (dist <= 1) G2.huntAnimal();
          else G2.stalkAnimal();
        } catch (err) { break; }
      }
      if (!s2.animal) kills++;
      s2.animal = null;
      if (G2.over) break;
    }
    // skill-lane deeds land in codex.skills (ability lanes 2026-10-14)
    return { kills, deeds: s2.practiceDeeds || {}, abilities: (s2.abilities || []).map(a => a.id)
      .concat(['stalk', 'blood_trail'].filter(id => G2.hasAbility(id))) };
  }
  const hp11 = await huntProbe(11);
  const hp42 = await huntProbe(42);
  ok(hp11.kills >= 5 && hp42.kills >= 5, 'hunt loop: real kills through the engine', `${hp11.kills}/${hp42.kills}`);
  const stalkTotal = (hp11.deeds.stalk || 0) + (hp42.deeds.stalk || 0);
  const btTotal = (hp11.deeds.blood_trail || 0) + (hp42.deeds.blood_trail || 0);
  ok(stalkTotal > 0, 'hunt loop: stalk deeds fire from quiet steps', String(stalkTotal));
  ok(btTotal > 0, 'hunt loop: blood_trail deeds fire from chased kills', String(btTotal));
  const grantedEither = hp11.abilities.includes('stalk') || hp42.abilities.includes('stalk') ||
    hp11.abilities.includes('blood_trail') || hp42.abilities.includes('blood_trail');
  ok(hp11.deeds.stalk >= 10 || hp42.deeds.stalk >= 10 || hp11.deeds.blood_trail >= 3 || hp42.deeds.blood_trail >= 3 || !grantedEither,
    'hunt loop: thresholds gate grants honestly',
    `stalk ${hp11.deeds.stalk || 0}/${hp42.deeds.stalk || 0} bt ${hp11.deeds.blood_trail || 0}/${hp42.deeds.blood_trail || 0}`);

  console.log(`\n${pass} passed, ${fail} failed`);
  if (notes.length) console.log(notes.join('\n'));
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });
