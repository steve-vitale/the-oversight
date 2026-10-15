// TEST: human skills are learnable before the System shows up; magic is not.
// Steve 2026-10-14 (docs/godpath/STEVE-ANSWERS.md): "Human skills should be
// learnable before the system shows up. Do a quick audit for exceptions."
// Audit: evidence/2026-10-14/skills-pre-system.md.
// Everything here runs on day 1 with systemArrived === false.
// Usage: node scripts/test-skills-pre-system-20261014.js
'use strict';
const K = require('./godpath/lib');

(async () => {
  const T = K.reporter('skills-pre-system');
  const Game = await K.load({ seed: 20261014 });
  K.newRun(Game);
  const s = Game.state.scholar;
  const v = Game.state.village;
  Game.state.systemArrived = false;
  const skillLvl = (sid) => (((Game.state.codex || {}).skills || {})[sid] || {}).level || 0;
  const vids = v.roster.filter(id => id !== Game.villagerId);
  const [a, b, c] = vids;
  const slotIds = () => (s.abilities || []).map(x => (x && x.id) || x);
  const slotsBefore = slotIds().slice();

  T.section('pre-System');
  T.ok('the System has not arrived', !Game.state.systemArrived && (s.day || 0) < 7, 'day ' + s.day);

  // ---- the fixed exception: the shieldbearer path (party-bond.js) ----
  T.section('shieldbearer path: villagers learn it beside each other (was System-gated)');
  T.ok('draw_fire is skill-lane', Game.isSkillLane('draw_fire'));
  Game.combatBondAdd(a, b, 30);
  const knack = ((v.npcKnacks || {})[a]);
  const slotsA = () => ((v.npcAbilities || {})[a] || []).filter(id => id !== knack);
  Game.noteShieldbearerOffer(a);
  T.ok('bond 30 pre-System: draw_fire learned', Game.npcHasAbility(a, 'draw_fire'), 'owned=' + (Game.npcOwnedIds(a) || []).join(','));
  T.ok('learned as a villager skill (npcSkills), no slot', Game.npcKnowsSkill(a, 'draw_fire') && slotsA().indexOf('draw_fire') < 0, 'slots=' + slotsA().join(','));
  Game.combatBondAdd(a, b, 20);
  Game.noteShieldbearerOffer(a);
  T.ok('bond 50 pre-System: bodyguard follows', Game.npcHasAbility(a, 'bodyguard'));
  T.ok('no magic slot taken by the path', slotsA().length === 0, 'slots=' + slotsA().join(','));

  // ---- regression net: the other human routes stay open pre-System ----
  T.section('player human routes (already open; kept open)');
  Game.notePracticeDeed('stalk', 10);
  T.ok('practice deed teaches stalk', skillLvl(Game.abilitySkillId('stalk')) >= 1);
  Game.noteTrialDeed('intimidate_someone', 1);
  T.ok('trial deed teaches intimidating_presence', skillLvl(Game.abilitySkillId('intimidating_presence')) >= 1);
  s.softStepStreak = 0;
  for (let i = 0; i < 20; i++) Game.noteSoftStepTile(false);
  T.ok('20 quiet tiles teach soft_step', skillLvl(Game.abilitySkillId('soft_step')) >= 1 && !s.softStepPending);
  T.ok('occupation teaches its skills', Game.grantOccupationSkills({ granted: ['pathfinder'] }) === 1 && skillLvl('pathfinder') >= 1);
  const book = (Game.data.books || []).find(x => x.id === 'trappers_handbook');
  T.ok('a book teaches its skill', !!book && Game.jackpotBook(book) && skillLvl('snare_wire') >= 1);
  for (let i = 0; i < 3; i++) Game.nightHuntPractice();
  T.ok('night hunting practice teaches night_hunting', skillLvl('night_hunting') >= 1);
  T.ok('aid-quest style teach works pre-System (teachAbilitySkill)', Game.teachAbilitySkill('scrounger', 1, 'test') && skillLvl(Game.abilitySkillId('scrounger')) >= 1);

  T.section('villager track skills (already open; kept open)');
  const TD = Game.trackData();
  const lvl2 = TD.thresholds[1];
  Game.gainTrackXP(c, 'field', lvl2, 'test');
  const firstField = TD.skills.field[0];
  T.ok('villager field level 2 pre-System: learns ' + firstField, Game.npcKnowsSkill(c, Game.abilitySkillId(firstField) || firstField));

  // ---- magic stays gated ----
  T.section('magic stays gated on the System');
  const knackC = ((v.npcKnacks || {})[c]);
  const magicC = ((v.npcAbilities || {})[c] || []).filter(id => id !== knackC);
  T.ok('villager level-up sheet waits (no magic pre-System)', magicC.length === 0 && !(Game.npcXp(c).sheets || []).length, 'magic=' + magicC.join(','));
  Game.notePracticeDeed('war_cry', 3);
  T.ok('war_cry (magic practice) not granted pre-System', slotIds().indexOf('war_cry') < 0 && !Game.hasAbility('war_cry'));
  Game.gainTrackXP('player', 'combat', TD.thresholds[0], 'test');
  T.ok('player level-up queued, no sheet pre-System', !(s.abilityChoices || []).length && (s.levelUpQueue || []).length >= 1);
  T.ok('no magic entered the player slots', slotIds().filter(id => slotsBefore.indexOf(id) < 0).length === 0, 'slots=' + slotIds().join(','));

  // ---- the Skills panel shows pre-System ----
  T.section('Skills panel (app.js) is not System-gated');
  const app = K.readSrc('src/js/app.js').replace(/\r\n/g, '\n');
  const i0 = app.indexOf('function renderSkillsSection()');
  const body = i0 >= 0 ? app.slice(i0, app.indexOf('\n  }\n', i0)) : '';
  T.ok('renderSkillsSection found', !!body);
  T.ok('renderSkillsSection has no systemArrived early return', !/if\s*\([^)]*systemArrived[^)]*\)\s*return/.test(body));
  T.ok('renderCharacterInline renders the Skills section', /\$\{renderSkillsSection\(\)\}/.test(app));

  T.done();
})().catch(e => { console.error('CRASH:', e); process.exit(2); });
