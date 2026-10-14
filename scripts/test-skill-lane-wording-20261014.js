// TEST: a skill-lane grant is never narrated as a System offer.
// Since ability lanes + unified tracks (2026-10-14), skill-lane abilities
// (abilities.json lane:'skill') are villager SKILLS: learned, not offered.
// The shieldbearer path (draw_fire/bodyguard/shield_wall/rally) is skill-lane,
// so its bond grant must read as learning, and journal under the village.
// Usage: node scripts/test-skill-lane-wording-20261014.js
'use strict';
const K = require('./godpath/lib');

(async () => {
  const T = K.reporter('skill-lane-wording');
  const Game = await K.load({ seed: 20261014, narration: true });
  K.newRun(Game);
  Game.state.systemArrived = true;
  const ids = Game.state.village.roster.filter(id => id !== Game.villagerId);
  const [a, b] = ids;
  const v = Game.state.village;
  v.bonds = v.bonds || {};
  v.bonds[Game.bondKey ? Game.bondKey(a, b) : (a < b ? a + '|' + b : b + '|' + a)] = { v: 0, depth: 0, day: 0, dayGain: 0, combat: 30 };

  T.section('shieldbearer path is skill-lane');
  T.ok('draw_fire is skill-lane', Game.isSkillLane('draw_fire'));

  T.section('bond grant wording');
  const lines = K.captureSays(Game);
  const notesBefore = ((Game.state.codex || {}).notes || []).length;
  Game.noteShieldbearerOffer(a);
  lines.restore();
  const grant = lines.find(l => /draw_fire|Draw Fire/i.test(l)) || '';
  T.ok('a grant line was said', !!grant, JSON.stringify(lines));
  T.ok('skill was learned (npcHasAbility)', Game.npcHasAbility(a, 'draw_fire'));
  T.ok('grant line does not say the System offers it', !/SYSTEM|System|offers/.test(grant), grant);
  const notes = ((Game.state.codex || {}).notes || []).slice(notesBefore);
  const sysNote = notes.find(n => n.cat === 'system' && /draw_fire/.test(n.text));
  T.ok('journal does not file it as a System grant', !sysNote, sysNote && sysNote.text);
  T.ok('journal records the skill as learned', notes.some(n => /draw_fire|Draw Fire/i.test(n.text) && /learn/i.test(n.text)), JSON.stringify(notes));

  T.done();
})().catch(e => { console.error('CRASH:', e); process.exit(2); });
