#!/usr/bin/env node
// Armor + recruitment discovery fixes 2026-10-13.
// Proves the discovery graph is reachable: bark_armor L1 (old cuirass dawn
// beat + owner teach), hide_armor L1 (hide-handling beat), the stale DR
// comment fix, the dead items.json materials cleanup, and the village
// auto-recruit (thin villages recruit without the player).
//
// RED/GREEN: on pre-fix code every section FAILs (functions undefined /
// data present / comment stale). On fixed code all pass.
// Run: SEED=0x1 node scripts/proof-armor-recruit-20261013.js
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

let pass = 0, fail = 0;
const failures = [];
function ok(cond, name, detail) {
  if (cond) { pass++; }
  else { fail++; failures.push(name + (detail ? ' — ' + detail : '')); }
  console.log((cond ? '  ok  ' : '  FAIL') + ' ' + name + (detail && !cond ? ' — ' + detail : ''));
}

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const SEED = parseInt(process.env.SEED || process.argv[2] || '0x7E41', 16);
Math.random = mulberry32(SEED);

global.fetch = (f) => Promise.resolve({ json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'))) });
global.window = global;
const FILES = ['src/js/engine/state.js', 'src/js/engine/modifiers.js', 'src/js/engine/calories.js',
  'src/js/engine/day.js', 'src/js/engine/forage.js', 'src/js/engine/combat.js',
  'src/js/game.js', 'src/js/encounters.js', 'src/js/conversation.js', 'src/js/convo-mood.js',
  'src/js/convoTopics.js', 'src/js/convo-wants.js', 'src/js/convo-dialogue.js', 'src/js/convo-scene.js',
  'src/js/examine.js', 'src/js/equipment.js', 'src/js/journal.js',
  'src/js/party.js', 'src/js/party-formal.js', 'src/js/truth.js', 'src/js/contests.js',
  'src/js/broadcast.js', 'src/js/contestEngine.js', 'src/js/alienPlayers.js', 'src/js/storage.js',
  'src/js/perceive.js', 'src/js/carexplore.js', 'src/js/justice.js', 'src/js/food.js',
  'src/js/betrayal.js', 'src/js/corpses.js', 'src/js/corruption.js', 'src/js/lifeseed.js',
  'src/js/progression.js', 'src/js/ledger.js', 'src/js/abilityActions.js', 'src/js/monsterBehaviors.js',
  'src/js/statusEffects.js', 'src/js/villager-agency.js', 'src/js/fieldFights.js',
  'src/js/villager-objectives.js', 'src/js/codex-people.js', 'src/js/membership.js',
  'src/js/hierarchy.js', 'src/js/debug-scenarios.js', 'src/js/build.js'];
for (const f of FILES) { try { eval(fs.readFileSync(path.join(ROOT, f), 'utf8')); } catch (e) { console.log('EVAL FAIL', f, e.message); process.exit(2); } }
delete global.window;
const Game = globalThis.Scattering.Game;
const said = [];
Game.say = (m) => { said.push(String(m)); };
Game.sysSay = () => {};
Game.drama = () => {}; Game.audioEvent = () => {};

function withForcedRandom(value, fn) {
  const real = Math.random;
  Math.random = () => value;
  try { return fn(); } finally { Math.random = real; }
}
function recipeLevel(id) {
  return (((Game.state.codex || {}).recipes || {})[id] || {}).level || 0;
}
function clearRecipes() { Game.state.codex.recipes = {}; }
function atHaven() {
  const v = Game.state.village || {};
  Game.map.px = (v.px != null ? v.px : 4);
  Game.map.py = (v.py != null ? v.py : 4);
}
function freshGame() {
  said.length = 0;
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  said.length = 0;
}
function npcIds() {
  const v = Game.state.village || {};
  return (v.roster || []).filter(id => id !== Game.villagerId);
}
function setTemperaments(map) {
  const v = Game.state.village || {};
  for (const id of npcIds()) {
    v.rosterChars = v.rosterChars || {};
    v.rosterChars[id] = v.rosterChars[id] || {};
    v.rosterChars[id].temperament = map;
  }
}
function setTrustAll(t) {
  const v = Game.state.village || {};
  v.trust = v.trust || {};
  for (const id of npcIds()) v.trust[id] = t;
}
function thinRoster(n) {
  const v = Game.state.village || {};
  v.roster = (v.roster || []).slice(0, n);
}
// has: guard so RED fails cleanly (missing function = FAIL, not harness crash)
function has(fn) { return typeof Game[fn] === 'function'; }

(async () => {
  await Game.init();

  console.log('== A1. OLD CUIRASS — bark_armor L1, guaranteed ==');
  {
    freshGame();
    ok(Game.state.village.oldCuirass === true, 'founding sets oldCuirass flag');
    ok(has('oldCuirassBeat'), 'oldCuirassBeat exists');
    ok(recipeLevel('bark_armor') === 0, 'player starts L0 bark_armor');
    atHaven();
    const before = said.length;
    if (has('oldCuirassBeat')) Game.oldCuirassBeat();
    ok(recipeLevel('bark_armor') === 1, 'dawn beat grants bark_armor L1');
    const line = said.slice(before).find(m => /cuirass/i.test(m));
    ok(!!line, 'beat says its line aloud (never silently)');
    if (line) console.log('    SAY: ' + line.slice(0, 160) + '...');
    const n1 = said.length;
    if (has('oldCuirassBeat')) Game.oldCuirassBeat();
    ok(said.length === n1, 'beat fires once — no repeat line');
    ok(recipeLevel('bark_armor') === 1, 'no double grant');
    ok(Game.state.village.oldCuirassSeen === true, 'seen flag set');
  }
  {
    // away from haven: the beat waits
    freshGame();
    Game.map.px = 99; Game.map.py = 99;
    if (has('oldCuirassBeat')) Game.oldCuirassBeat();
    ok(recipeLevel('bark_armor') === 0, 'beat waits when player is not home');
    ok(!Game.state.village.oldCuirassSeen, 'not marked seen while away');
  }

  console.log('== A2. OWNER TEACH — lottery bark_armor made useful ==');
  {
    freshGame();
    atHaven();
    const vid = npcIds()[0];
    const vp = Game.vpOf(vid);
    vp.equipped = { torso: { itemId: 'bark_armor' } };
    Game.state.village.trust = Game.state.village.trust || {};
    Game.state.village.trust[vid] = 20;
    ok(recipeLevel('bark_armor') === 0, 'L0 before the lesson');
    const before = said.length;
    Game.objReturnEffect(vid, 'forage');
    ok(recipeLevel('bark_armor') === 1, 'worn-owner return teaches bark_armor L1');
    const line = said.slice(before).find(m => /bark plates/i.test(m));
    ok(!!line, 'teach says its line aloud');
    if (line) console.log('    SAY: ' + line.slice(0, 160) + '...');
    ok(vp.taughtBarkArmor === true, 'once per teacher');
    const teachLines = said.filter(mm => /bark plates/i.test(mm)).length;
    clearRecipes();
    Game.objReturnEffect(vid, 'water');
    ok(recipeLevel('bark_armor') === 0, 'second viewing adds nothing');
    ok(said.filter(mm => /bark plates/i.test(mm)).length === teachLines, 'no repeat teach line');
  }
  {
    // low trust: strangers don't hand over their craft
    freshGame();
    atHaven();
    const vid = npcIds()[0];
    Game.vpOf(vid).equipped = { torso: { itemId: 'bark_armor' } };
    Game.state.village.trust = Game.state.village.trust || {};
    Game.state.village.trust[vid] = 5;
    Game.objReturnEffect(vid, 'forage');
    ok(recipeLevel('bark_armor') === 0, 'trust < 15: no lesson');
  }

  console.log('== A3. HIDE-HANDLING — hide_armor L1, circular dependency broken ==');
  {
    freshGame();
    ok(has('noteHideHandled'), 'noteHideHandled exists');
    ok(recipeLevel('hide_armor') === 0, 'L0 before handling hide');
    const v = Game.state.village || {};
    atHaven();
    Game.state.scholar.mx = 4; Game.state.scholar.my = 4;
    Game.state.corpses = Game.state.corpses || [];
    const cid = 'test-animal-corpse';
    Game.state.corpses.push({
      id: cid, kind: 'animal', buried: false,
      node: { x: Game.map.px, y: Game.map.py }, mx: 4, my: 4,
      items: [{ plantId: 'animal_hide', material: 'hide', name: 'Hide', units: 1, kg: 1.0, kcalEach: 0, spoilDay: 9999 }],
    });
    const before = said.length;
    const took = Game.corpseTakeItem(cid, 0);
    ok(!!took, 'hide taken from the corpse');
    ok(recipeLevel('hide_armor') === 1, 'taking the hide teaches hide_armor L1');
    const line = said.slice(before).find(m => /shape of armor/i.test(m));
    ok(!!line, 'handling beat says its line aloud');
    if (line) console.log('    SAY: ' + line.slice(0, 160) + '...');
  }
  {
    // batch-loot path teaches too
    freshGame();
    atHaven();
    Game.state.scholar.mx = 4; Game.state.scholar.my = 4;
    Game.state.corpses = Game.state.corpses || [];
    const cid = 'test-animal-corpse-2';
    Game.state.corpses.push({
      id: cid, kind: 'animal', buried: false,
      node: { x: Game.map.px, y: Game.map.py }, mx: 4, my: 4,
      items: [{ plantId: 'animal_hide', material: 'hide', name: 'Hide', units: 1, kg: 1.0, kcalEach: 0, spoilDay: 9999 }],
    });
    Game.lootCorpse(cid, true);
    ok(recipeLevel('hide_armor') === 1, 'batch loot of the hide teaches L1 too');
  }
  {
    // non-hide loot teaches nothing
    freshGame();
    if (has('noteHideHandled')) Game.noteHideHandled({ plantId: 'some_berry', name: 'Berries' });
    ok(recipeLevel('hide_armor') === 0, 'non-hide items teach nothing');
  }

  console.log('== A4/A5. STALE COMMENT + DEAD DATA ==');
  {
    const ff = fs.readFileSync(path.join(ROOT, 'src/js/fieldFights.js'), 'utf8');
    const gearLine = ff.split('\n').find(l => l.includes('equipped armor absorbs via diminishing returns'));
    ok(!!gearLine && gearLine.includes('min(hit-1'), 'fieldFights ontology comment states the clamp: ' + (gearLine || '').trim().slice(0, 80));
  }
  {
    const items = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/items.json'), 'utf8'));
    for (const id of ['bark_armor', 'hide_armor', 'padded_cloth']) {
      const def = items.find(i => i.id === id);
      ok(def && !('materials' in def), id + ': dead materials field removed');
      ok(def && def.armor && def.armor.protection > 0, id + ': armor protection intact');
    }
  }

  console.log('== R1. AUTO-ACCEPT — thin village, warm room ==');
  ok(has('villageAutoRecruit'), 'villageAutoRecruit exists');
  {
    freshGame();
    thinRoster(5);
    setTemperaments('generous');
    setTrustAll(20);
    const m = Game.mshipState();
    const app = Game.genApplicant();
    app.reputation = 'good';
    m.applications.push(app);
    const trustBefore = Game.state.village.trust[npcIds()[0]];
    const before = said.length;
    if (has('villageAutoRecruit')) Game.villageAutoRecruit();
    ok(m.applications.length === 0, 'application accepted without the player');
    ok((m.arrivals || []).some(a => a.id === app.id), 'accepted app walks (arrivals)');
    const line = said.slice(before).find(mm => /didn't wait for you/i.test(mm));
    ok(!!line, 'auto-accept says its line aloud');
    if (line) console.log('    SAY: ' + line.slice(0, 160) + '...');
    ok(Game.state.village.trust[npcIds()[0]] === trustBefore, 'warm room: no trust cost');
  }

  console.log('== R1b. AUTO-ACCEPT — split room costs trust ==');
  {
    freshGame();
    thinRoster(5);
    const ids = npcIds();
    const v = Game.state.village;
    v.rosterChars = v.rosterChars || {};
    ids.forEach((id, k) => { v.rosterChars[id] = v.rosterChars[id] || {}; v.rosterChars[id].temperament = k < 2 ? 'generous' : 'suspicious'; });
    setTrustAll(20);
    const m = Game.mshipState();
    const app = Game.genApplicant();
    app.reputation = 'good';
    m.applications.push(app);
    if (has('villageAutoRecruit')) Game.villageAutoRecruit();
    ok(m.applications.length === 0, 'split room still auto-accepts (not hostile)');
    ok(Game.state.village.trust[ids[0]] === 19, 'split room: -1 trust (decided without you)', 'trust=' + Game.state.village.trust[ids[0]]);
  }

  console.log('== R2. AUTO-INVITE — waiting visitor, thin village ==');
  {
    freshGame();
    thinRoster(5);
    setTrustAll(20);
    const v = Game.state.village;
    v.visitors = [{ id: 'vis_test1', type: 'curious', name: 'a curious wanderer', day: 3, hostile: false, shady: false, leavesDay: 4 }];
    const r0 = v.roster.length;
    const before = said.length;
    if (has('villageAutoRecruit')) Game.villageAutoRecruit();
    ok((v.visitors || []).length === 0, 'visitor taken in (slot cleared)');
    ok(v.roster.length === r0 + 1 && v.roster.includes('visjoin_3'), 'joinable visitor joins the roster');
    ok(v.trust['visjoin_3'] === 20, 'newcomer starts at trust 20');
    const line = said.slice(before).find(mm => /taken in around the fire/i.test(mm));
    ok(!!line, 'auto-invite says its line aloud');
    if (line) console.log('    SAY: ' + line.slice(0, 160) + '...');
    ok(v.trust[npcIds()[0]] === 19, 'stranger intake without your word: -1 trust');
  }
  {
    // shady visitors are never auto-taken
    freshGame();
    thinRoster(5);
    const v = Game.state.village;
    v.visitors = [{ id: 'vis_test2', type: 'fleeing', name: 'a frightened family', day: 3, hostile: false, shady: true, leavesDay: 4 }];
    if (has('villageAutoRecruit')) Game.villageAutoRecruit();
    ok((v.visitors || []).length === 1, 'shady visitor NOT auto-taken');
  }

  console.log('== R3/R4/R6. GUARDS — healthy waits, hostile waits, no roof ==');
  {
    freshGame();
    thinRoster(5);
    const v = Game.state.village;
    v.roster = v.roster.concat(['fake_a', 'fake_b', 'fake_c', 'fake_d', 'fake_e']);
    const m = Game.mshipState();
    m.applications.push(Object.assign(Game.genApplicant(), { reputation: 'good' }));
    if (has('villageAutoRecruit')) Game.villageAutoRecruit();
    ok(m.applications.length === 1, 'healthy village (10): waits on the leader');
  }
  {
    freshGame();
    thinRoster(5);
    setTemperaments('suspicious');
    setTrustAll(20);
    const m = Game.mshipState();
    const app = Object.assign(Game.genApplicant(), { reputation: 'good' });
    m.applications.push(app);
    if (has('villageAutoRecruit')) Game.villageAutoRecruit();
    ok(m.applications.length === 1, 'hostile room: waits for the player');
    ok(app.autoConsidered === true, 'hostile app considered once (no daily debate spam)');
  }
  {
    freshGame();
    thinRoster(5);
    const m = Game.mshipState();
    m.housing = 5; // room = 0
    m.applications.push(Object.assign(Game.genApplicant(), { reputation: 'good' }));
    if (has('villageAutoRecruit')) Game.villageAutoRecruit();
    ok(m.applications.length === 1, 'no roof: no auto-recruit into homelessness');
  }

  console.log('== R5. DESPERATION FLOOR — arrivals below the notability gate ==');
  // NOTE: membership.js / betrayal.js capture R = Math.random at module load,
  // so withForcedRandom can't steer these rolls — loop days instead (p=0.08
  // fires in ~12 days; 300 is a hard ceiling, not an expectation).
  {
    freshGame();
    thinRoster(5);
    Game.state.scholar.day = 10; // notability 30 < 40
    const m = Game.mshipState();
    let tries = 0;
    while (m.applications.length === 0 && tries < 300) { Game.considerApplications(); tries++; }
    ok(m.applications.length === 1, 'thin village: application arrives at the 0.08 floor', 'fired after ' + tries + ' days');
  }
  {
    freshGame();
    thinRoster(5);
    Game.state.scholar.day = 10;
    const v = Game.state.village;
    let tries = 0;
    while ((v.visitors || []).length === 0 && tries < 300) { Game.considerStrangers(); tries++; }
    ok((v.visitors || []).length === 1, 'thin village: stranger arrives below the gate', 'fired after ' + tries + ' days');
    const t = (v.visitors || [])[0] && v.visitors[0].type;
    ok(t === 'curious' || t === 'fleeing', 'low-notability thin village draws the desperate, not traders', 'type=' + t);
  }

  console.log('\nseed=0x' + SEED.toString(16) + '  pass=' + pass + ' fail=' + fail);
  if (failures.length) { console.log('FAILURES:'); for (const f of failures) console.log('  - ' + f); }
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS CRASH', e); process.exit(2); });
