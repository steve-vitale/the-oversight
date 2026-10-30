// PROOF for journey establishment r61: a villager who taught the player in
// one sitting must offer again in a later sitting (documented rule,
// skill-teaching.js:21: "one lesson per learner per day and one per
// conversation"). Deepening r67 found the rule behaving as one lesson per
// villager EVER: startConvo resets every other per-sitting ledger but never
// skillLessonDone, so convoSkillChoices returns [] forever after the first
// lesson. The r61 panel probe reproduced it on a live run (seed 321:
// Brianna taught herbal_medicine day 43, day-44 sitting offered [] while
// foraging was teachable and ok).
//
// The fix (startConvo resets skillLessonDone) must preserve the two halves
// the rule actually promises, both asserted here:
//   (1) one per conversation: within the SAME sitting, after a lesson,
//       convoSkillChoices offers no further skill_learn;
//   (2) one per learner per day: enforced by canTeachSkill 'today' via
//       skillLessonDay, untouched by this fix (also covered by
//       test-skill-teaching-20261014.js).
// The next-day sitting is simulated by advancing scholar.day by 1, which is
// exactly the value the 'today' gate reads; the test asserts the gate
// itself still fires by checking canTeachSkill on the original day first.
// Run with SEED=42 and SEED=321 (two separate processes; the harness is
// single-run per process).
'use strict';
const K = require('./godpath/lib');
(async () => {
  const T = K.reporter('r61-lesson-repeat');
  const SEED = Number(process.env.SEED || 42);
  const G = await K.load({ seed: SEED, narration: false });
  K.newRun(G);
  const s = G.state.scholar, v = G.state.village;
  const lvl = (sid) => (((G.state.codex || {}).skills || {})[sid] || {}).level || 0;
  const vids = v.roster.filter(id => id !== G.villagerId && !(G.vpOf(id) || {}).dead);
  const talkers = vids.filter(id => { try { return G.commLevel(id).level !== 'none'; } catch (e) { return false; } });
  const a = talkers.length ? talkers[0] : vids[0];
  v.trust = v.trust || {};
  v.trust[a] = 25;
  T.ok('fixture villager talks to the player', !!a && G.commLevel(a).level !== 'none', 'vid=' + a);
  G.npcLearnSkill(a, 'hogtie');
  G.npcLearnSkill(a, 'tripwire');
  T.ok('hogtie/tripwire unknown to the player at fixture start', lvl('hogtie') === 0 && lvl('tripwire') === 0);

  // ---- Sitting 1: take one lesson. ----
  G.startConvo(a);
  let menu = G.buildMenu(a, true) || [];
  for (let i = 0; i < 4 && !menu.some(ch => ch && String(ch.id).indexOf('skill_learn:') === 0); i++) {
    const ans = menu.find(ch => ch && /^(ans:|gq:|react:)/.test(ch.id)) || menu.find(ch => ch && ['dlg:subject', 'subject'].includes(ch.id));
    if (!ans) break;
    G.convoTurn(a, ans.id);
    menu = G.buildMenu(a) || [];
  }
  let learnCh = menu.find(ch => ch && String(ch.id).indexOf('skill_learn:') === 0);
  if (!learnCh) {
    const direct = (G.convoSkillChoices(a) || []).find(ch => ch.id.indexOf('skill_learn:') === 0);
    T.ok('sitting 1 offers a lesson (menu or direct choices)', !!direct, 'menu=' + menu.map(c => c && c.id).join(','));
    learnCh = direct;
  } else {
    T.ok('sitting 1 menu offers "Teach me <skill>?"', true, learnCh.id);
  }
  const sid1 = learnCh ? learnCh.id.split(':')[1] : null;
  // The pick is whatever _skillPick ranks first (ability-carrying skills
  // first, e.g. wound_care on seed 42) — the test takes it, whichever it
  // is, and proves the SECOND sitting offers again.
  T.ok('sitting 1 lesson target is a real skill', !!sid1, String(sid1));
  if (sid1) G.convoTurn(a, 'skill_learn:' + sid1);
  T.ok('player learned sitting-1 skill at L1', !!sid1 && lvl(sid1) === 1, sid1 + ' level=' + (sid1 && lvl(sid1)));
  T.ok('one per conversation: no second skill_learn in the SAME sitting',
    !(G.convoSkillChoices(a) || []).some(ch => ch.id.indexOf('skill_learn:') === 0),
    JSON.stringify((G.convoSkillChoices(a) || []).map(ch => ch.id)));
  T.ok('skillLessonDone is set after the sitting-1 lesson', !!(G.convoGet(a) || {}).skillLessonDone);
  try { G.endConvo(a, 'done'); } catch (e) {}

  // ---- Same-day re-open: the 'today' gate must still say no. ----
  const remainingSameDay = (G.teachableSkills(a, 'player') || []).filter(sid => sid !== sid1);
  const gateSid = remainingSameDay.length ? remainingSameDay[0] : null;
  T.ok('per-day gate still fires on the same day',
    !!gateSid && !G.canTeachSkill(a, 'player', gateSid).ok && G.canTeachSkill(a, 'player', gateSid).why === 'today',
    gateSid + ' ' + JSON.stringify(gateSid && G.canTeachSkill(a, 'player', gateSid)));

  // ---- Sitting 2, next day: the lesson must be offered again. ----
  s.day = (s.day || 0) + 1;
  G.startConvo(a);
  T.ok('startConvo resets skillLessonDone for the new sitting',
    !(G.convoGet(a) || {}).skillLessonDone, 'flag=' + ((G.convoGet(a) || {}).skillLessonDone));
  const again = (G.convoSkillChoices(a) || []).filter(ch => ch.id.indexOf('skill_learn:') === 0);
  T.ok('next-day sitting offers a lesson again (the r61 fix)', again.length > 0,
    JSON.stringify((G.convoSkillChoices(a) || []).map(ch => ch.id)));
  const sid2 = again.length ? again[0].id.split(':')[1] : null;
  T.ok('next-day offer is a different, still-untaught skill', !!sid2 && sid2 !== sid1 && lvl(sid2) === 0, String(sid2));
  if (sid2) G.convoTurn(a, 'skill_learn:' + sid2);
  T.ok('player learned sitting-2 skill at L1', !!sid2 && lvl(sid2) === 1, sid2 + ' level=' + (sid2 && lvl(sid2)));
  try { G.endConvo(a, 'done'); } catch (e) {}
  T.done();
})().catch(e => { console.error(e.stack || e); process.exitCode = 1; });
