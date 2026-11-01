// test-build-armor-lesson-20261101.js -- PROOF for build-armor-lesson
// (armor lesson-offer rate, 2026-11-01).
//
// Finding: armor recipes (bark_armor, hide_armor) are NOT knowledge skills,
// so convoSkillChoices — which only offers knowledge skills — could never
// offer an armor lesson. That is the 0/24 in the deepening r80+r81 pooled
// sittings (3 sittings/seed x 8 seeds): a structural zero, not a bad dice
// roll, so no probability retune could have fixed it. The fix under test:
// armor recipes become teachable conversation topics in their own slot
// beside the skill pick, taught to recipe L2 (materials known) by a teacher
// at L2+, through the same one-lesson-a-day / trust-15 / language gates,
// and a taught villager's bark level counts for the villager craft beat
// (which previously read avCraft only for hide).
//
// Usage: node scripts/test-build-armor-lesson-20261101.js
// Exit 0: all pass. Exit 1: any fail. Writes nothing.
'use strict';
const K = require('./godpath/lib');
(async () => {
  const T = K.reporter('build-armor-lesson');
  const Game = await K.load({ seed: 20261015 });
  K.newRun(Game);
  const v = Game.state.village;
  const s = Game.state.scholar;
  Game.state.systemArrived = false;
  const lvlR = (rid) => (((Game.state.codex || {}).recipes || {})[rid] || {}).level || 0;
  const avLvl = (vid, rid) => (((v.avCraft || {})[vid] || {})[rid] || 0);
  const vids = (v.roster || []).filter(id => id !== Game.villagerId && !(Game.vpOf(id) || {}).dead);
  const talkers = vids.filter(id => { try { return Game.commLevel(id).level !== 'none'; } catch (e) { return false; } });
  console.log('roster=' + vids.length + ' talkers=' + talkers.length + ' ' + talkers.join(','));
  const [a, b, c, e, f, g, h] = talkers;
  if (!h) { console.log('FAIL not enough talkers'); process.exit(1); }
  v.trust = v.trust || {};
  for (const id of [a, b, c, f, g, h]) v.trust[id] = 25;
  v.trust[e] = 5;
  // fixtures
  Game.state.codex.recipes = Game.state.codex.recipes || {};
  Game.state.codex.recipes.bark_armor = { level: 1 }; // player has SEEN bark
  Game.state.codex.recipes.hide_armor = { level: 2 }; // player knows hide materials (teacher + guardrail B)
  v.avCraft = v.avCraft || {};
  v.avCraft[a] = { bark_armor: 2, hide_armor: 2 }; // a can teach both armors
  v.avCraft[e] = { bark_armor: 2 }; // e can teach bark but is low-trust
  // c wears bark (L1 seen only) but has no taught level
  const pc = Game.getPerson ? Game.getPerson(c) : null;
  if (pc) { pc.equipped = pc.equipped || {}; pc.equipped.torso = { itemId: 'bark_armor' }; }
  const choices = (vid) => { try { return Game.convoSkillChoices(vid) || []; } catch (err) { return []; } };
  const hasLearn = (vid, rid) => choices(vid).some(ch => ch.id === 'skill_learn:' + rid);
  const hasTeach = (vid, rid) => choices(vid).some(ch => ch.id === 'skill_teach:' + rid);

  // guardrail: wearing-only teacher (L1) offers no bark lesson
  Game.startConvo(c);
  T.ok('wearing-only teacher offers no bark lesson', !hasLearn(c, 'bark_armor'), JSON.stringify(choices(c).map(x => x.id)));
  try { Game.endConvo(c, 'left'); } catch (err) {}
  // guardrail: learner already L2 gets no offer
  Game.startConvo(a);
  T.ok('learner already at L2 gets no hide offer', !hasLearn(a, 'hide_armor'));
  try { Game.endConvo(a, 'left'); } catch (err) {}
  // guardrail: low trust offers no lesson
  Game.startConvo(e);
  T.ok('low-trust teacher offers no bark lesson', !hasLearn(e, 'bark_armor'));
  try { Game.endConvo(e, 'left'); } catch (err) {}
  // skill regression first (different learner, so it cannot eat the player's day lesson)
  Game.learnSkill('shield_wall', 1, 'test');
  Game.startConvo(h);
  const skillTeach = choices(h).filter(ch => ch.id.indexOf('skill_teach:') === 0);
  T.ok('skill teach offer still present', skillTeach.length >= 1, JSON.stringify(skillTeach.map(x => x.id)));
  if (skillTeach.length) {
    Game.convoTurn(h, skillTeach[0].id);
    T.ok('skill lesson still lands', Game.personKnowsSkill(h, skillTeach[0].id.split(':')[1]));
  }
  try { Game.endConvo(h, 'left'); } catch (err) {}
  // player -> villager hide lesson FIRST: the armor slot offers one recipe,
  // bark before hide, so once the player learns bark below, bark would
  // crowd hide out of b's slot. Hide is teachable from the fixture (player
  // hide L2) before any bark lesson, so it is offered here on its own.
  Game.startConvo(b);
  T.ok('hide lesson offered to villager', hasTeach(b, 'hide_armor'), JSON.stringify(choices(b).map(x => x.id)));
  Game.convoTurn(b, 'skill_teach:hide_armor');
  T.ok('villager hide level reaches 2', avLvl(b, 'hide_armor') === 2, 'level ' + avLvl(b, 'hide_armor'));
  try { Game.endConvo(b, 'left'); } catch (err) {}
  // main: villager -> player bark lesson, alongside a skill offer
  Game.npcLearnSkill(a, 'hogtie');
  Game.startConvo(a);
  const chA = choices(a);
  T.ok('bark lesson offered to player (own slot)', hasLearn(a, 'bark_armor'), JSON.stringify(chA.map(x => x.id)));
  T.ok('skill offer still present beside armor offer', chA.some(x => x.id.indexOf('skill_learn:') === 0 && x.id !== 'skill_learn:bark_armor'));
  Game.convoTurn(a, 'skill_learn:bark_armor');
  T.ok('player bark recipe reaches L2 after lesson', lvlR('bark_armor') === 2, 'level ' + lvlR('bark_armor'));
  T.ok('armor lesson recorded with armor id', (v.skillLessons || []).some(l => l.skill === 'bark_armor' && l.learner === 'player'));
  T.ok('no second armor offer in same conversation', !hasLearn(a, 'bark_armor'));
  try { Game.endConvo(a, 'left'); } catch (err) {}
  T.ok('one lesson per learner per day still holds', !Game.teachSkill(a, 'player', 'bark_armor'));
  // player -> villager bark lesson (player now L2, so can teach)
  Game.startConvo(f);
  T.ok('bark lesson offered to villager', hasTeach(f, 'bark_armor'));
  Game.convoTurn(f, 'skill_teach:bark_armor');
  T.ok('villager bark level reaches 2', avLvl(f, 'bark_armor') === 2);
  try { Game.endConvo(f, 'left'); } catch (err) {}
  // taught bark level alone makes a villager craft-eligible (build fix, isolated)
  v.avCraft[g] = { bark_armor: 2 };
  v.avCraftCd = v.avCraftCd || {};
  for (const id of vids) if (id !== g) v.avCraftCd[id] = (s.day || 0);
  v.avCraftCd[g] = -99;
  v.stash = v.stash || {}; v.stash.materials = { bark: 3, vine: 2, hide: 0 };
  const barkBefore = v.stash.materials.bark;
  let made = 0;
  try { made = Game.villagerArmorCraftDay() || 0; } catch (err) { console.log('craft day threw: ' + err.message); }
  T.ok('taught-bark villager attempts a bark craft (materials spent)', (v.stash.materials.bark || 0) < barkBefore, 'bark ' + barkBefore + '->' + (v.stash.materials.bark || 0) + ' made=' + made);
  T.done();
})();
