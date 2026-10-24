#!/usr/bin/env node
// scripts/test-gapw3-grant-skill.js — proof for gap-closure findings #640
// (phase 2 bundle W3-food-villager-social, sim-findings.md line 640):
// grantKnowledge('skill', ...) existed as a case delegating to learnSkill
// but had ZERO callers in src/js. The fix routes the player side of
// teachSkill (skill-teaching.js) through grantKnowledge('skill', ...),
// so the unified path finally has a real caller — with identical gain
// semantics (grantKnowledge's skill case IS learnSkill, via 'taught').
//
// Proof: a villager who knows a skill teaches the player via teachSkill;
// the player gains L1 with via 'taught', and the grant path's own
// skill case grants the same way when called directly.
//
// Usage: node scripts/test-gapw3-grant-skill.js
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, quietLog } = require('./sim-harness');

(async () => {
  // static: the caller exists in src/js now
  const src = fs.readFileSync(path.join(__dirname, '..', 'src', 'js', 'skill-teaching.js'), 'utf8');
  assert(/grantKnowledge\('skill'/.test(src), 'skill-teaching.js has no grantKnowledge(skill) caller');

  const { Game } = await loadGame({ seed: 64001, mode: 'leanwinter', fullTelemetry: false });
  await setupGame(Game);
  const v = Game.state.village || {};
  const lvl = (sid) => (((Game.state.codex || {}).skills || {})[sid] || {}).level || 0;
  const via = (sid) => (((Game.state.codex || {}).skills || {})[sid] || {}).via || null;

  // direct grant path: still the one path, gains like learnSkill
  await quietLog(async () => { Game.grantKnowledge('skill', 'herbal_medicine', 1, { type: 'taught', by: 'test' }); });
  assert(lvl('herbal_medicine') === 1, 'direct grantKnowledge skill case did not grant L1');
  assert(via('herbal_medicine') === 'taught', 'direct grant via should be taught, got ' + via('herbal_medicine'));

  // teachSkill path: villager -> player, through the new caller
  const roster = (v.roster || []).filter(id => id !== Game.villagerId && !(Game.vpOf(id) || {}).dead);
  assert(roster.length >= 1, 'need a live villager');
  const teacher = roster.find(id => { try { return Game.commLevel(id).level !== 'none'; } catch (e) { return false; } }) || roster[0];
  v.trust = v.trust || {}; v.trust[teacher] = 25;
  // pick a skill the player does not know yet (seed scholars vary) that
  // the teacher can hold and that is teachable
  const candidates = (Game.data.knowledge || []).map(k => k.id).filter(id => lvl(id) === 0);
  let sid = null;
  for (const id of candidates) {
    try { Game.npcLearnSkill(teacher, id); } catch (e) { continue; }
    try { if (Game.skillTeachable(id) && Game.personKnowsSkill(teacher, id)) { sid = id; break; } } catch (e) {}
  }
  assert(sid, 'no teachable unknown skill found for the teachSkill path');
  let ok = false;
  await quietLog(async () => { ok = Game.teachSkill(teacher, 'player', sid); });
  assert(ok === true, 'teachSkill villager->player failed for ' + sid + ' (check gates)');
  assert(lvl(sid) === 1, 'teachSkill via grantKnowledge did not grant player L1 for ' + sid);
  assert(via(sid) === 'taught', 'teachSkill via should be taught, got ' + via(sid) + ' for ' + sid);
  console.log('PASS test-gapw3-grant-skill: skill case has a live caller; teachSkill grants L1 via taught');
})().catch(e => { console.error('FAIL test-gapw3-grant-skill: ' + (e && e.message)); process.exit(1); });
