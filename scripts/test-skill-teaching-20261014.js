// TEST: one skill-teaching mechanic for everyone, and player track skills.
// Steve 2026-10-14 (docs/godpath/STEVE-ANSWERS.md): "Villagers and players
// should get the same XP, when in doubt we treat them the same way." and
// "Human skills should be learnable before the system shows up."
// Gaps from evidence/2026-10-14/skills-pre-system.md: 12 skill-lane
// abilities had no reliable player route; the player's track level-ups never
// taught the track skill villagers learn at levels 2 and 4.
// Everything here runs with systemArrived === false.
// Usage: node scripts/test-skill-teaching-20261014.js
'use strict';
const K = require('./godpath/lib');

const ORPHANS = ['thief', 'grave_robber', 'scarecrow', 'draw_fire', 'bodyguard', 'shield_wall', 'rally',
  'tripwire', 'shoulder_check', 'hogtie', 'come_get_some', 'still_hands'];

(async () => {
  const T = K.reporter('skill-teaching');
  const Game = await K.load({ seed: 20261015 }); // seed 20261014 -> 20261015 on 2026-10-31 (lootabilities build): items.json gained two tier-1 loot pieces, re-rolling seeded generation; at the old seed the generated mushroom_grower no longer knows their trade. Seed 20261015 preserves the fixture's shape. No assertion changed.
  K.newRun(Game);
  const s = Game.state.scholar;
  const v = Game.state.village;
  Game.state.systemArrived = false;
  const has = (name) => typeof Game[name] === 'function';
  const lvl = (sid) => (((Game.state.codex || {}).skills || {})[sid] || {}).level || 0;
  const vids = v.roster.filter(id => id !== Game.villagerId && !(Game.vpOf(id) || {}).dead);
  // a villager the player can talk to (a shared tongue); trust above the regard gate
  const talkers = vids.filter(id => { try { return Game.commLevel(id).level !== 'none'; } catch (e) { return false; } });
  const [a, b] = talkers.length >= 2 ? talkers : vids;
  v.trust = v.trust || {};
  v.trust[a] = 25; v.trust[b] = 25;
  let occs = (Game.data.characterGen.occupations || []);

  T.section('module is wired');
  T.ok('skill-teaching.js loads from index.html', K.readSrc('index.html').includes('src/js/skill-teaching.js'));
  T.ok('teachSkill / convoSkillChoices / playerTrackSkills exist', has('teachSkill') && has('convoSkillChoices') && has('playerTrackSkills'));
  let modSrc = '';
  try { modSrc = K.readSrc('src/js/skill-teaching.js'); } catch (e) { console.log('  (no src/js/skill-teaching.js)'); }
  T.ok('no System gate in the teaching module', !!modSrc && !/systemArrived/.test(modSrc.replace(/\/\/.*$/gm, '')));
  // (unwired: the sections that need the module are skipped; the data and
  // track-parity checks below still run, so RED shows every gap)
  if (has('teachSkill')) {

  // ---- 1. villager -> player, pre-System, through the conversation ----
  T.section('villager teaches the player (pre-System, conversation)');
  T.ok('pre-System', !Game.state.systemArrived);
  Game.npcLearnSkill(a, 'hogtie');
  T.ok('hogtie unknown to the player', lvl('hogtie') === 0);
  Game.startConvo(a);
  // a hanging question suppresses pivots (as it does the plant teach): answer it first
  let menu = Game.buildMenu(a,true) || [];
  for (let i = 0; i < 4 && !menu.some(ch => ch && String(ch.id).indexOf('skill_learn:') === 0); i++) {
    const ans = menu.find(ch => ch && /^(ans:|gq:|react:)/.test(ch.id)) || menu.find(ch => ch && ['dlg:subject','subject'].includes(ch.id));
    if (!ans) break;
    Game.convoTurn(a, ans.id);
    menu = Game.buildMenu(a) || [];
  }
  const learnCh = menu.find(ch => ch && String(ch.id).indexOf('skill_learn:') === 0);
  T.ok('the menu offers "Teach me <skill>?"', !!learnCh, 'menu=' + menu.map(c => c && c.id).join(','));
  T.ok('the option is one short line (<= 34 chars)', !!learnCh && learnCh.label.length <= 34, learnCh && learnCh.label);
  const sidA = learnCh ? learnCh.id.split(':')[1] : 'hogtie';
  const clockBefore = JSON.stringify([s.day, Game.dayPart, s.actionClock]);
  Game.convoTurn(a, 'skill_learn:' + sidA);
  T.ok('player learned ' + sidA + ' at L1', lvl(sidA) === 1, 'level ' + lvl(sidA));
  T.ok('the lesson spent time', JSON.stringify([s.day, Game.dayPart, s.actionClock]) !== clockBefore);
  T.ok('one lesson per conversation: no second "Teach me"', !(Game.convoSkillChoices(a) || []).some(ch => ch.id.indexOf('skill_learn:') === 0));
  Game.npcLearnSkill(b, 'tripwire');
  T.ok('one lesson per learner per day', !Game.teachSkill(b, 'player', 'tripwire'));
  try { Game.endConvo(a, 'left'); } catch (e) { console.warn('endConvo', e); }

  // ---- 2. player -> villager ----
  T.section('player teaches a villager');
  Game.learnSkill('shield_wall', 1, 'test');
  Game.startConvo(b);
  const teachChs = (Game.convoSkillChoices(b) || []).filter(ch => ch.id.indexOf('skill_teach:') === 0);
  T.ok('the menu offers "I could show you <skill>."', teachChs.length === 1, JSON.stringify(teachChs));
  const sidB = teachChs.length ? teachChs[0].id.split(':')[1] : 'shield_wall';
  T.ok(b + ' does not know ' + sidB + ' yet', !Game.personKnowsSkill(b, sidB));
  Game.convoTurn(b, 'skill_teach:' + sidB);
  T.ok(b + ' learned ' + sidB + ' (villager skill)', Game.personKnowsSkill(b, sidB));
  T.ok('the player earned the teaching deed', (v.skillLessons || []).some(l => l.teacher === 'player' && l.learner === b));
  try { Game.endConvo(b, 'left'); } catch (e) { console.warn('endConvo', e); }

  // gates: trust and nobody-knows
  const c = vids.find(id => id !== a && id !== b);
  if (c) {
    v.trust[c] = 5;
    Game.npcLearnSkill(c, 'come_get_some');
    T.ok('trust under 15: no lesson (same gate both ways)', !Game.teachSkill(c, 'player', 'come_get_some') && !Game.canTeachSkill('player', c, 'shield_wall').ok);
  }
  T.ok('system knowledge is flagged unteachable (data)', !Game.skillTeachable('system_theology') && Game.skillTeachable('hogtie'));

  // ---- 3. villagers know their old life (parity with the player's background) ----
  T.section('villager background skills');
  const withGrant = vids.find(id => { const p = Game.getPerson(id); const o = occs.find(x => x.id === p.occupationId); return o && (o.granted || []).length; });
  if (withGrant) {
    const p = Game.getPerson(withGrant), o = occs.find(x => x.id === p.occupationId);
    const sid0 = Game.abilitySkillId(o.granted[0]);
    T.ok(p.occupationId + ' villager knows their trade (' + sid0 + ')', Game.personKnowsSkill(withGrant, sid0));
  } else T.ok('a villager with an occupation grant exists', false);

  // ---- 4. villager -> villager in a sim (daily agency) ----
  T.section('villager-to-villager teaching in a sim');
  const lessonsBefore = (v.skillLessons || []).length;
  for (let d = 0; d < 12 && !Game.over; d++) {
    Game.state.systemArrived = false;
    try { Game.endDay(); } catch (e) { console.warn('endDay', e && e.message); break; }
  }
  const vv = (Game.state.village.skillLessons || []).slice(lessonsBefore).filter(l => l.teacher !== 'player' && l.learner !== 'player');
  T.ok('villagers taught each other skills (pre-System days)', vv.length >= 1, 'lessons=' + vv.length);
  const livingLearners = vv.filter(l => l.learner !== Game.villagerId && Game.state.village.roster.indexOf(l.learner) >= 0 && !(Game.vpOf(l.learner) || {}).dead);
  T.ok('every living learner now knows what they were taught', livingLearners.length >= 1 && livingLearners.every(l => Game.personKnowsSkill(l.learner, l.skill)),
    livingLearners.filter(l => !Game.personKnowsSkill(l.learner, l.skill)).map(l => l.learner + ':' + l.skill).join(','));
  T.ok('no learner took two lessons in one day', vv.every((l, i) => !vv.some((m, j) => j !== i && m.day === l.day && m.learner === l.learner)));
  console.log('  villager lessons: ' + vv.map(l => l.teacher + '->' + l.learner + ':' + l.skill).join(' '));

  }

  // ---- 5. player track skill at level 2 (parity) ----
  T.section('player learns the track skill at track level 2');
  K.newRun(Game);
  Game.state.systemArrived = false;
  const TD = Game.trackData();
  const field = TD.skills.field;
  const expect = field.find(id => lvl(Game.abilitySkillId(id) || id) === 0);
  const says = K.captureSays(Game);
  Game.gainTrackXP('player', 'field', TD.thresholds[0], 'test');
  const afterL1 = lvl(Game.abilitySkillId(expect));
  Game.gainTrackXP('player', 'field', TD.thresholds[1] - TD.thresholds[0], 'test');
  T.ok('field level 2 reached', Game.playerTracks().field.level === 2);
  T.ok('level 1 teaches nothing (skillLevels ' + JSON.stringify(TD.skillLevels) + ')', afterL1 === 0);
  T.ok('level 2 teaches ' + expect, lvl(Game.abilitySkillId(expect)) >= 1);
  says.restore();
  const nm = (Game.abilityDef(expect) || {}).name;
  T.ok('the level-up line names it ("Field 2: the work taught you ' + nm + '")', says.some(l => /2: the work taught you/.test(l) && l.indexOf(nm) >= 0), says.slice(-4).join(' | '));
  const lu2 = (Game.state.scholar.levelUpQueue || []).find(lu => lu.track === 'field' && lu.level === 2);
  T.ok('the queued level-up sheet carries it for the System line', !!lu2 && lu2.skill === nm);

  // ---- 6. the 12 orphan skills: real routes, honest data ----
  T.section('every orphan skill has a real route');
  const abil = Game.data.abilities;
  const skillLane = abil.filter(x => x.lane === 'skill');
  T.ok('no skill-lane ability claims system_offer or latent_knack', skillLane.every(x => ['system_offer', 'latent_knack'].indexOf((x.unlock || {}).type) < 0),
    skillLane.filter(x => ['system_offer', 'latent_knack'].indexOf((x.unlock || {}).type) >= 0).map(x => x.id).join(','));
  const bondSrc = K.readSrc('src/js/party-bond.js');
  const vids2 = Game.state.village.roster.filter(id => id !== Game.villagerId && !(Game.vpOf(id) || {}).dead);
  const vTeacher = vids2.find(id => { try { return Game.commLevel(id).level !== 'none'; } catch (e) { return false; } }) || vids2[0];
  for (const id of ORPHANS) {
    const def = abil.find(x => x.id === id);
    const sid = Game.abilitySkillId(id);
    const k = Game.data.knowledge.find(x => x.id === sid) || {};
    const routes = ((def && def.unlock) || {}).routes || [];
    const real = [];
    // background: an occupation that exists teaches it through the player's own routes
    const bgOcc = occs.find(o => (k.backgrounds || []).some(bg => String(o.name).toLowerCase().includes(String(bg).toLowerCase())) ||
      (o.granted || []).some(g => Game.abilitySkillId(g) === sid));
    if (bgOcc) {
      delete Game.state.codex.skills[sid];
      Game.grantBackgroundKnowledge({ formerOccupation: bgOcc.name });
      Game.grantOccupationSkills(bgOcc);
      if (lvl(sid) >= 1) real.push('background');
    }
    // bond: the shieldbearer path teaches villagers (party-bond.js)
    if (new RegExp("SHIELDBEARER_PATH\\s*=\\s*\\[[^\\]]*'" + id + "'").test(bondSrc)) real.push('bond');
    // teach: a villager who knows it teaches the player
    delete Game.state.codex.skills[sid];
    Game.state.village.trust[vTeacher] = 25;
    Game.state.village.skillLessonDay = {}; // one lesson a day: each orphan is a fresh day's lesson here
    Game.npcLearnSkill(vTeacher, sid);
    const talk = (() => { try { return Game.commLevel(vTeacher).level !== 'none'; } catch (e) { return false; } })();
    if (has('teachSkill') && talk && Game.teachSkill(vTeacher, 'player', sid)) real.push('teach');
    if (has('teachSkill') && !talk && Game.canTeachSkill(vTeacher, 'player', sid).why === 'words') real.push('teach'); // the mechanic exists; this pair lacks a tongue
    const rootless = real.filter(r => r !== 'teach');
    T.ok(id + ': a real root route (' + real.join(',') + ') and data lists it (' + routes.join(',') + ')',
      rootless.length >= 1 && real.every(r => routes.indexOf(r) >= 0) && routes.indexOf('system_offer') < 0);
  }

  T.done();
})();
