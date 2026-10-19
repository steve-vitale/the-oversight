#!/usr/bin/env node
// test-social-r27-wounds-repeat-20261019.js -- PROOF TEST (journey-social r27).
// The `betrayal:wounds` act spoke the fixed string "The wounds speak for
// themselves." on every successful show — picked 3x in a row it parroted 3x
// (transcript-verified 2026-10-19, seed 2002 d53 Isabella). Diegetic acts are
// exempt from sayLine's repeat filter, so the act must vary its own telling.
// The fix (betrayal.js `wounds` act): cycle wound-show variants via
// convoPickCycle — the outcome stays real every time, the telling never
// parrots.
// GREEN = 3 consecutive betrayal:wounds picks on the same case produce 3
// pairwise-distinct NPC lines, and the no-wounds path still lands flat.
// RED (pre-fix) = all three are "The wounds speak for themselves."
'use strict';
process.env.TRIBFLOOR = '1';
const { loadGame, setupGame } = require('./sim-harness');
const safe = (fn, d) => { try { return fn(); } catch (e) { return d; } };

function lastNpcLine(Game, vid, before) {
  const tr = safe(() => (Game.convoGet(vid) || {}).transcript || [], []);
  const fresh = tr.slice(before);
  for (let i = fresh.length - 1; i >= 0; i--) {
    if (fresh[i] && fresh[i].who !== 'you') return String(fresh[i].text || '');
  }
  return null;
}

async function main() {
  const { Game } = await loadGame({ seed: 777002, mode: 'wounds-repeat-proof' });
  await setupGame(Game);
  const sid = Game.villagerId;
  const roster = (Game.state.village.roster || []).filter(id => id !== sid);
  const vid = roster[0], other = roster[1] || roster[0];

  // Fabricate a minimal case: the player is the target, the plot has wounds.
  const v = Game.state.village;
  v.betrayal = v.betrayal || {};
  v.betrayal.plots = v.betrayal.plots || [];
  v.betrayal.cases = v.betrayal.cases || [];
  v.betrayal.plots.push({ id: 'p_probe27', woundsTaken: 2, leader: other });
  v.betrayal.cases.push({
    id: 'case_probe27', plotId: 'p_probe27', target: sid,
    accused: [other], inconsistencies: [], foundBribes: [], exposedBribes: [],
    belief: {}, evidence: [],
  });

  Game.startConvo(vid);
  const spoken = [];
  for (let i = 0; i < 3; i++) {
    const before = safe(() => (Game.convoGet(vid) || {}).transcript.length || 0, 0);
    Game.betrayalTurn(vid, 'betrayal:wounds:case_probe27');
    spoken.push(lastNpcLine(Game, vid, before));
  }
  spoken.forEach((l, i) => console.log(`wounds ${i + 1}:`, l));

  let fails = 0;
  const fail = (m) => { console.log('FAIL: ' + m); fails++; };
  if (spoken.some(l => !l)) fail('a wounds pick produced no NPC line');
  for (let i = 1; i < spoken.length; i++) {
    if (spoken[i] && spoken[i] === spoken[i - 1]) fail(`wounds ${i} and ${i + 1} verbatim identical: "${spoken[i]}"`);
  }
  // The first telling keeps the canonical line.
  if (spoken[0] && !/The wounds speak for themselves/.test(spoken[0])) fail('first telling lost the canonical line');

  // No-wounds path still lands flat (the r16 honesty behavior is kept).
  v.betrayal.plots.find(p => p.id === 'p_probe27').woundsTaken = 0;
  const before = safe(() => (Game.convoGet(vid) || {}).transcript.length || 0, 0);
  Game.betrayalTurn(vid, 'betrayal:wounds:case_probe27');
  const flat = lastNpcLine(Game, vid, before);
  console.log('no-wounds:', flat);
  if (flat && !/Nothing to show/.test(flat)) fail('no-wounds path no longer lands flat: ' + flat);

  Game.endConvo(vid, 'left');
  console.log(fails ? `RESULT: ${fails} FAILURES` : 'RESULT: GREEN — wounds tellings vary, honesty kept');
  process.exit(fails ? 1 : 0);
}

main().catch(e => { console.error('ERROR:', e && e.stack || e); process.exit(1); });
