#!/usr/bin/env node
// Proof test: the learn aid quest surfaces run-state-derived "seek knowledge"
// suggestions (rogue P1 — audit T4 P4-3 "Seek knowledge" agenda, folded into
// the QUEST system per Steve: "Seek knowledge could be part of quest or favor
// system?", NOT standalone; the favor system is interpersonal promises, the
// aid-quest learn kind is literally "the System tells you what to learn").
//
// Usage: node scripts/test-seekquest-learn-20261022.js   (no env vars needed)
//
// RED (before change — run against master): _makeAidQuest('learn') always
//   returns the generic plantsGain quest. No learnGaps, no suggestion. This
//   script FAILS there (feature-detects Game._pickLearnGaps).
// GREEN (after change):
//   A. water state (codex.waterSickN=2; a villager knows purify_boil; the
//      player does not) -> learn quest with need.learnGaps=['purify_boil'],
//      names "Boiling Water", carries how-to-close, and the player still
//      lacks the skill (suggests, never grants).
//   B. the player really learns it through the one teaching mechanic
//      (teachSkill: trust 15+, shared language) -> accept -> aidQuestCheckLearn
//      completes the quest. Suggestion -> real learning -> completion.
//   C. all three signals at once -> up to 3 gaps surface, each with how-to.
//   D. food-only state (trialDeeds.hunger_trial=2) -> 'camp_cooking'.
//   E. wound-only state (trialDeeds.blood_trial=1) -> 'wound_care'.
//   F. no signals -> fallback plantsGain quest (old behavior preserved).
//   G. human≠alien boundary: every SEEK_GAPS id is a knowledge.json human
//      skill and NOT an abilities.json alien ability.
const { loadGame, setupGame } = require('./sim-harness');
const fs = require('fs');
const path = require('path');

let failures = 0;
function ok(cond, label) {
  console.log((cond ? '  ok: ' : '  FAIL: ') + label);
  if (!cond) failures++;
}

async function main() {
  const { Game } = await loadGame({ seed: 777 });
  await setupGame(Game);

  const said = [];
  Game.sysSay = function (t) { said.push(String(t == null ? '' : t)); };
  Game.say = function (t) { said.push(String(t == null ? '' : t)); };

  // Feature detect: the fold must exist.
  if (typeof Game._pickLearnGaps !== 'function') {
    console.log('BEFORE (no seek-knowledge fold): Game._pickLearnGaps is not a function.');
    console.log('A learn quest here is always the generic plantsGain ask — no suggestions surface.');
    console.log('FAIL');
    process.exit(1);
  }
  ok(true, 'fold present: Game._pickLearnGaps is a function');

  // Stage the struggle gate: System arrived, mid-window day, hungry village.
  Game.state.systemArrived = true;
  Game.state.scholar.day = 10;
  const v = Game.state.village;
  v.pantry = [];
  try { Game.state.scholar.kcal = 200; } catch (e) {}

  // A teacher: living villager who knows all three gap skills.
  const teacher = (v.roster || []).find(id => id !== Game.villagerId);
  ok(!!teacher, 'a living villager exists to teach (teacher=' + teacher + ')');
  for (const sk of ['purify_boil', 'camp_cooking', 'wound_care']) Game.npcLearnSkill(teacher, sk);
  ok(Game.personKnowsSkill(teacher, 'purify_boil'), 'teacher knows purify_boil');

  const sg = Game.aidQuestStruggle();
  const playerLacks = id => ((((Game.state.codex || {}).skills || {})[id] || {}).level || 0) === 0;

  // ---- A. water signal -> purify_boil suggestion, nothing granted ----
  Game.state.codex = Game.state.codex || {};
  Game.state.codex.waterSickN = 2;
  const qa = Game._makeAidQuest('learn', false, sg, []);
  ok(qa && qa.kind === 'learn', 'A: learn quest built');
  ok(qa.need && Array.isArray(qa.need.learnGaps) && qa.need.learnGaps.indexOf('purify_boil') >= 0,
    'A: need.learnGaps includes purify_boil (got ' + JSON.stringify(qa.need && qa.need.learnGaps) + ')');
  ok(/Boiling Water/i.test(qa.ask) && /Teach me/i.test(qa.ask),
    'A: ask names "Boiling Water" and carries how-to-close ("Teach me?")');
  ok(/learn one of/i.test(qa.needText), 'A: needText is a learning ask: ' + qa.needText);
  ok(playerLacks('purify_boil'), 'A: player still lacks purify_boil — suggestion granted nothing');

  // ---- C. all three signals -> up to 3 gaps, each with how-to ----
  // (runs before B: B teaches the player purify_boil, which then correctly
  // drops out of the suggestions as known)
  Game.state.scholar.trialDeeds = { hunger_trial: 2, blood_trial: 1 };
  const qc = Game._makeAidQuest('learn', false, sg, []);
  const gapsC = (qc.need && qc.need.learnGaps) || [];
  ok(gapsC.length === 3, 'C: 3 gaps surface (got ' + JSON.stringify(gapsC) + ')');
  ok(gapsC.indexOf('purify_boil') >= 0 && gapsC.indexOf('camp_cooking') >= 0 && gapsC.indexOf('wound_care') >= 0,
    'C: the 3 gaps are purify_boil, camp_cooking, wound_care');
  ok(/Camp Cooking/i.test(qc.ask) && /Wound Care/i.test(qc.ask) && /Teach me/i.test(qc.ask),
    'C: ask names each gap with how-to-close');

  // ---- B. real teaching completes the quest ----
  v.trust = v.trust || {};
  v.trust[teacher] = 20;
  v.bgLangs = v.bgLangs || {};
  v.bgLangs[teacher] = { native: 'english', english: 2 };
  Game.state.scholar.languages = { english: 2 };
  const taught = Game.teachSkill(teacher, Game.villagerId, 'purify_boil');
  ok(taught === true, 'B: teachSkill via the one teaching mechanic succeeded (trust 15+, shared language)');
  ok(!playerLacks('purify_boil'), 'B: player now knows purify_boil at L1');
  qa.rewardKind = 'supply'; // keep the node run on the pantry path
  Game.state.pendingAidQuest = qa;
  const accepted = Game.answerAidQuest('accept');
  ok(accepted && accepted.kind === 'learn', 'B: quest accepted');
  Game.aidQuestCheckLearn();
  ok(Game.state.activeAidQuest == null, 'B: aidQuestCheckLearn completed the quest after real learning');
  ok((Game.state.aidQuestLedger || {}).done >= 1, 'B: ledger counts the completion');
  ok(said.join('\n').indexOf('NEVER SYSTEM TO SLOT') >= 0, 'B: completion line honors the human≠alien boundary');

  // ---- D. food-only signal -> camp_cooking ----
  Game.state.codex.waterSickN = 0;
  Game.state.scholar.trialDeeds = { hunger_trial: 2 };
  const qd = Game._makeAidQuest('learn', false, sg, []);
  ok(JSON.stringify((qd.need || {}).learnGaps) === JSON.stringify(['camp_cooking']),
    'D: food signal -> camp_cooking only (got ' + JSON.stringify((qd.need || {}).learnGaps) + ')');

  // ---- E. wound-only signal -> wound_care ----
  Game.state.scholar.trialDeeds = { blood_trial: 1 };
  const qe = Game._makeAidQuest('learn', false, sg, []);
  ok(JSON.stringify((qe.need || {}).learnGaps) === JSON.stringify(['wound_care']),
    'E: wound signal -> wound_care only (got ' + JSON.stringify((qe.need || {}).learnGaps) + ')');

  // ---- F. no signals -> plant fallback (old behavior preserved) ----
  Game.state.scholar.trialDeeds = {};
  const qf = Game._makeAidQuest('learn', false, sg, []);
  ok(qf.need && qf.need.plantsGain === 2 && !qf.need.learnGaps,
    'F: no signals -> fallback plantsGain quest (got ' + JSON.stringify(qf.need) + ')');

  // ---- G. human≠alien boundary audit on the real SEEK_GAPS table ----
  const src = fs.readFileSync(path.join(__dirname, '..', 'src', 'js', 'safetynets.js'), 'utf8');
  const tableMatch = src.match(/var SEEK_GAPS = \[([\s\S]*?)\];/);
  ok(!!tableMatch, 'G: SEEK_GAPS table found in source');
  const ids = [];
  const re = /id:\s*'([a-z_]+)'/g;
  let m;
  while ((m = re.exec(tableMatch ? tableMatch[1] : ''))) ids.push(m[1]);
  const knowledge = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'knowledge.json'), 'utf8'));
  const abilities = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'abilities.json'), 'utf8'));
  const kIds = new Set(knowledge.map(k => k.id));
  const aIds = new Set(abilities.map(a => a.id));
  ok(ids.length >= 2, 'G: table holds 2–3 gaps (got ' + ids.length + ': ' + ids.join(',') + ')');
  ok(ids.every(id => kIds.has(id)), 'G: every gap id is a knowledge.json HUMAN skill');
  ok(ids.every(id => !aIds.has(id)), 'G: no gap id is an abilities.json alien ability');

  console.log(failures === 0 ? 'PASS' : 'FAIL');
  process.exit(failures === 0 ? 0 : 1);
}
main().catch(e => { console.error('ERROR', e); process.exit(2); });
