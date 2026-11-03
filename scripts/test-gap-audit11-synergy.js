#!/usr/bin/env node
// test-gap-audit11-synergy.js — leg 2 (synergy discovery) fixture proof.
// Claim: a co-held pair whose SECOND sequential leg is passive (no button,
// no engine logging path — e.g. steady_hands) stalls at 0 attempts forever
// under the old rule, because the trigger use can never happen. With
// trigger-side resonance, using the FIRST leg while holding the passive
// second leg counts as the combined use (still 3 to unlock; no power or
// threshold change).
// Also proves the negative: unrelated uses do not advance the pair, and a
// pair with NO logged use at all (both legs passive and unlogged) still
// stalls — that residual is reported, not forced.
// Usage: node scripts/test-gap-audit11-synergy.js
// Exit 0 on pass, 1 on any failed assertion.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

function check(name, cond, detail) {
  console.log((cond ? 'PASS' : 'FAIL') + ' ' + name + (detail !== undefined ? ' — ' + detail : ''));
  if (!cond) process.exitCode = 1;
}

(async () => {
  const { Game } = await loadGame({ seed: 9201 });
  await setupGame(Game);
  const s = Game.state.scholar;
  s.synergies = []; s.synergyAttempts = {}; s.abilityUseLog = [];
  s.abilities = [
    { id: 'triage', name: 'Triage', level: 1, xp: 0 },
    { id: 'steady_hands', name: 'Steady Hands', level: 1, xp: 0 },
  ];
  // Sanity: steady_hands really has no button (the premise of the fix).
  const def = (Game.data.abilities || []).find(a => a.id === 'steady_hands');
  check('steady_hands has no actions (passive leg)', !((def || {}).actions || []).length);

  // Control: unrelated uses do not advance surgeons_calm.
  Game.noteAbilityUse('green_thumb');
  Game.noteAbilityUse('green_thumb');
  check('unrelated uses leave surgeons_calm at 0 attempts',
    (s.synergyAttempts['surgeons_calm'] || 0) === 0,
    'attempts=' + (s.synergyAttempts['surgeons_calm'] || 0));

  // The fix: three first-leg (triage) uses while holding passive steady_hands.
  Game.noteAbilityUse('triage');
  Game.noteAbilityUse('triage');
  check('two triage uses = 2 attempts (not yet discovered)',
    (s.synergyAttempts['surgeons_calm'] || 0) === 2 && !(s.synergies || []).includes('surgeons_calm'),
    'attempts=' + (s.synergyAttempts['surgeons_calm'] || 0));
  Game.noteAbilityUse('triage');
  check('third triage use discovers surgeons_calm',
    (s.synergies || []).includes('surgeons_calm'),
    'discovered=' + JSON.stringify(s.synergies));

  // Residual, documented not forced: both legs passive and unlogged.
  s.synergies = []; s.synergyAttempts = {}; s.abilityUseLog = [];
  s.abilities = [
    { id: 'silver_tongue', name: 'Silver Tongue', level: 1, xp: 0 },
    { id: 'gossip_network', name: 'Gossip Network', level: 1, xp: 0 },
  ];
  Game.noteAbilityUse('green_thumb');
  check('everybodys_friend still stalls with no logged leg use (residual)',
    (s.synergyAttempts['everybodys_friend'] || 0) === 0 && !(s.synergies || []).includes('everybodys_friend'),
    'attempts=' + (s.synergyAttempts['everybodys_friend'] || 0));
  console.log(process.exitCode ? 'LEG2 FIXTURE: FAILED' : 'LEG2 FIXTURE: ALL PASS');
})().catch(e => { console.error('LEG2 FIXTURE FAIL', e && e.stack || e); process.exit(1); });
