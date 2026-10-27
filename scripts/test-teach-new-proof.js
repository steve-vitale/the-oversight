#!/usr/bin/env node
// test-teach-new-proof.js — PROOF TEST for tackle-teach (game change).
// Before/after behavior for the one game-code fix in this workstream:
// conversation ability-teaches are ledgered.
//
// FIX (villager-build.js npcLearnFromTalk): a villager who learns a new
// ability from a held conversation used to gain the knowledge silently —
// no tele event, no journal note, nothing any measurement could count.
// Now the teach writes tele 'villager_talk_teach' {vid, teacher, ability,
// level} and a codex journal note naming teacher, learner, and ability.
// The lesson itself is unchanged: same teacher-held-only pool, same L2,
// same systemArrived gate, same "already knows at L2+" skip. No ability
// is granted for free: the learner must be taught from something the
// teacher holds.
//
// BEFORE code fails assertions 1–3 (no tele event, no journal note).
// AFTER code passes all. Also asserts the guards that must NOT change:
// a villager who already knows the ability at L2+ learns nothing new
// (no tele event), and a teacher holding nothing teaches nothing.
//
// Usage: node scripts/test-teach-new-proof.js
const lib = require('./godpath/lib.js');

let failures = [];
function ok(name, cond, detail) {
  if (cond) console.log(`  PASS ${name}${detail ? ' — ' + detail : ''}`);
  else { console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); failures.push(name); }
}

async function main() {
  const Game = await lib.load({ seed: 71099 });
  lib.newRun(Game);
  const v = Game.state.village;
  Game.state.systemArrived = true;
  const hx = v.px ?? 4, hy = v.py ?? 4;
  Game.map.px = hx; Game.map.py = hy;
  const ids = (v.roster || []).filter(id => id !== Game.villagerId);
  for (const id of ids) {
    try { Game.npcSetNode(id, hx, hy); } catch (e) {}
    try { Game.npcSetInside(id, true); } catch (e) {}
  }

  // Bearer holds one magic ability; learners know nothing of it.
  const magic = ((Game.data || {}).abilities || []).find(a => a && a.id && a.lane === 'magic');
  if (!magic) throw new Error('no magic ability in data');
  lib.giveAbility(Game, magic.id);
  const learner = ids[0];
  const knowBefore = (Game.abilityKnowledge(learner, magic.id) || 0);
  ok('setup: learner does not know the ability yet', knowBefore < 2, `know=${knowBefore}`);

  // Drive a real held conversation to its end (transcript >= 4 is the
  // endConvo gate for npcLearnFromTalk).
  const sayLines = [];
  const origSay = Game.say;
  Game.say = function (m) { if (typeof m === 'string') sayLines.push(m); try { return origSay.apply(this, arguments); } catch (e) {} };
  const teleBase = lib.teleEvents(Game, 'villager_talk_teach').length;
  let r = null;
  try { r = Game.startConvo(learner); } catch (e) {}
  let turns = 0;
  while (r && !r.ended && turns < 8) {
    turns++;
    const choices = (r.choices && r.choices.length) ? r.choices : (Game.convoChoices ? Game.convoChoices(learner) : []);
    const pick = (choices || []).find(x => x && x.id === 'dlg:react') ||
      (choices || []).find(x => x && x.id && x.id !== 'leave' && x.id.indexOf('leave') !== 0);
    if (!pick) break;
    try { r = Game.convoTurn(learner, pick.id); } catch (e) { break; }
  }
  const c = Game.convoGet ? Game.convoGet(learner) : {};
  const transcriptLen = (c && c.transcript) ? c.transcript.length : 0;
  // NOTE: the conversation may auto-end during a turn (winddown calls
  // endConvo internally), so the baseline must predate the whole
  // conversation, not just the explicit endConvo call. teleBefore is
  // captured before startConvo above via closure order — see teleBase.
  const teleBefore = teleBase;
  const notesBefore = (((Game.state.codex || {}).notes) || []).length;
  try { Game.endConvo(learner, 'done'); } catch (e) {}
  Game.say = origSay;

  const knowAfter = Game.abilityKnowledge(learner, magic.id) || 0;
  const talkEvs = lib.teleEvents(Game, 'villager_talk_teach');
  const ev = talkEvs[talkEvs.length - 1] || {};
  const note = (((Game.state.codex || {}).notes) || []).find(n => n.key === 'talk-teach:' + learner + ':' + magic.id);
  const line = sayLines.find(l => l.indexOf('picked up') >= 0);

  ok('1. held conversation teaches a genuinely new ability', knowAfter >= 2 && knowBefore < 2,
    `transcript=${transcriptLen} know ${knowBefore}->${knowAfter} ability=${magic.id}`);
  ok('2. the teach is ledgered as a tele event', talkEvs.length > teleBefore &&
    ev.vid === learner && ev.ability === magic.id && ev.level === 2,
    `learner=${learner} n=${talkEvs.length} (before ${teleBefore}) ev=${JSON.stringify(ev)}`);
  ok('3. the teach is ledgered as a readable journal note', !!note &&
    note.text.indexOf(magic.name || magic.id) >= 0,
    note ? note.text : '(no note)');
  ok('4. the journal line reads as a person teaching another person', !!line,
    line || '(no line)');
  console.log(`  (ledger line: ${line || (note && note.text) || 'none'})`);

  // GUARD: a second held conversation teaches nothing new (already L2+)
  // and ledgers nothing new.
  const teleMid = lib.teleEvents(Game, 'villager_talk_teach').length;
  let r2 = null;
  try { r2 = Game.startConvo(learner); } catch (e) {}
  let t2 = 0;
  while (r2 && !r2.ended && t2 < 8) {
    t2++;
    const choices = (r2.choices && r2.choices.length) ? r2.choices : (Game.convoChoices ? Game.convoChoices(learner) : []);
    const pick = (choices || []).find(x => x && x.id === 'dlg:react') ||
      (choices || []).find(x => x && x.id && x.id !== 'leave' && x.id.indexOf('leave') !== 0);
    if (!pick) break;
    try { r2 = Game.convoTurn(learner, pick.id); } catch (e) { break; }
  }
  try { Game.endConvo(learner, 'done'); } catch (e) {}
  const knowAfter2 = Game.abilityKnowledge(learner, magic.id) || 0;
  const teleAfter2 = lib.teleEvents(Game, 'villager_talk_teach').length;
  ok('5. re-teach guard: knowing at L2+ adds no new teach and no new ledger entry',
    knowAfter2 === knowAfter && teleAfter2 === teleMid,
    `know ${knowAfter}->${knowAfter2}, tele ${teleMid}->${teleAfter2}`);
  void notesBefore;

  // GUARD: no free grants — a villager who knows nothing new from a
  // teacher holding nothing learns nothing from talk.
  const learner2 = ids[1];
  const heldSave = Game.state.scholar.abilities;
  Game.state.scholar.abilities = [];
  const got = Game.npcLearnFromTalk ? Game.npcLearnFromTalk(learner2, 'player') : null;
  Game.state.scholar.abilities = heldSave;
  ok('6. no free grant: a teacher holding nothing teaches nothing', got === null, `got=${got}`);

  if (failures.length) { console.log(`\nFAILURES: ${failures.join(', ')}`); process.exit(1); }
  console.log('\nALL PROOF CHECKS PASSED');
}
main().catch(e => { console.error(e); process.exit(1); });
