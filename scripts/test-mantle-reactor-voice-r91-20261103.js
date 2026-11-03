#!/usr/bin/env node
// test-mantle-reactor-voice-r91-20261103.js — PROOF for journey-scale r91 Q2.
//
// BLANK (carried from r90): the fusion pellet's install line promises
// "You will never be hungry again. ... It does not come out." But the
// benefit is per-bearer: mantleBecome replaces the scholar's abilities
// with the successor's own, so at the first succession after an install
// fusionReactorOnline() goes dark — while the world's installed flag
// stays set (no second reactor ever rises). Nothing tells the new bearer
// the hum died with the old one: a silent promise-breaking, against the
// no-silent-actions law. The fix voices the transition in playerDeath
// (ledger.js), narration only — mechanism, flags, and gates untouched.
//
// RED on pristine HEAD: no reactor-voice line at either death (the only
// reactor lines are install/offer lines, never a mantle line).
// GREEN post-fix: exactly one voice line at the first mantle (bearer held
// reactor + installed, successor lacks it), online() false after, the
// installed flag still true, and no second line at the next death
// (the next bearer never held it).
//
// Usage: node scripts/test-mantle-reactor-voice-r91-20261103.js
'use strict';
const { loadGame, setupGame, runDays, mulberry32 } = require('./sim-harness');
const { competent } = require('./policies/competent');

let pass = 0, fail = 0;
function check(id, ok, detail) {
  if (ok) { pass++; console.log(`  [OK] ${id}`); }
  else { fail++; console.log(`  [FAIL] ${id}${detail ? ' — ' + detail : ''}`); }
}
const hasReactor = (abs) => (abs || []).some(a => ((a && a.id) || a) === 'fusion_reactor');
const VOICE_RX = /The warm hum behind your ribs is gone/;

async function main() {
  Math.random = mulberry32(777);
  const { Game } = await loadGame({ seed: 777, mode: 'mantle-reactor-voice', fullTelemetry: false });
  const says = [];
  Game.say = (t) => { says.push(String(t)); };
  Game.sysSay = (t) => { says.push(String(t)); };
  await setupGame(Game);
  await runDays(Game, competent, { days: 6 });

  const s0 = Game.state.scholar, v0 = Game.state.village;
  const oldId = Game.villagerId;
  const oldName = ((Game.data.villagers || []).find(x => x.id === oldId) || {}).name || 'bearer';
  const oldFirst = oldName.split(' ')[0];
  // Model a real install on the bearer, and a successor who does not hold it:
  // strip fusion_reactor from every villager's npcAbilities (test setup —
  // mantleBecome reads the successor's own npcAbilities, so this pins the
  // silent-loss case instead of the successor-holds-it case).
  const npcAbs = v0.npcAbilities || {};
  for (const vid of Object.keys(npcAbs)) npcAbs[vid] = (npcAbs[vid] || []).filter(id => id !== 'fusion_reactor');
  if (!hasReactor(s0.abilities)) s0.abilities.push({ id: 'fusion_reactor', name: 'Fusion Reactor', desc: '', level: 1, xp: 0 });
  s0.fusionReactor = { installed: true, online: true };
  Game.state.fusionReactorHolder = { who: 'player', vid: oldId, day: s0.day || 0 };
  console.log(`bearer: ${oldName} (${oldId}), day ${s0.day}, roster ${(v0.roster || []).length}`);
  check('online-before', typeof Game.fusionReactorOnline === 'function' && Game.fusionReactorOnline() === true,
    `online=${typeof Game.fusionReactorOnline === 'function' ? Game.fusionReactorOnline() : 'n/a'}`);

  // ---- the first death: bearer held the reactor, successor does not ----
  const mark1 = says.length;
  Game.playerDeath('the hunt');
  const beat1 = says.slice(mark1).join('\n');
  const s1 = Game.state.scholar;
  const newId = Game.villagerId;
  check('mantle-passes', !Game.over && newId !== oldId, `over=${Game.over} newId=${newId}`);
  check('reactor-line-fired', VOICE_RX.test(beat1) && beat1.includes(`went with ${oldFirst}`),
    beat1.slice(0, 200) || 'no beat lines');
  check('online-false-after', typeof Game.fusionReactorOnline === 'function' && Game.fusionReactorOnline() === false,
    `online=${typeof Game.fusionReactorOnline === 'function' ? Game.fusionReactorOnline() : 'n/a'}`);
  check('flag-still-set', !!((s1.fusionReactor || {}).installed),
    `fusionReactor=${JSON.stringify(s1.fusionReactor)}`);
  check('ability-not-inherited', !hasReactor(s1.abilities),
    `abilities=[${(s1.abilities || []).map(a => (a && a.id) || a).join(',')}]`);

  // ---- the second death: this bearer never held it, so no second line ----
  const mark2 = says.length;
  const secondName = ((Game.data.villagers || []).find(x => x.id === newId) || {}).name || 'second';
  Game.playerDeath('the wild');
  const beat2 = says.slice(mark2).join('\n');
  const voiceCount = says.filter(s => VOICE_RX.test(s)).length;
  check('second-mantle-passes', !Game.over && Game.villagerId !== newId,
    `over=${Game.over} bearer=${secondName} newId=${Game.villagerId}`);
  check('no-second-line', voiceCount === 1, `voiceCount=${voiceCount} beat2=${beat2.slice(0, 160)}`);

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('TEST ERROR:', e && e.stack || e); process.exit(2); });
