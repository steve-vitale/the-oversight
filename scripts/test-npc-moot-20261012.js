#!/usr/bin/env node
// test-npc-moot-20261012.js — NPC-MOOT TICK proof (journey-social 2026-10-12 r7).
// Before: cases where an NPC stood accused (ambush plot sprung on a
// villager) had NO natural path to a moot. The village gossiped forever;
// caseDiscoveryTick promised "There's going to be a moot" and nothing ever
// convened one — r6 documented zero justice trials across ~300 village-days.
// After: npcMootTick() has the victim (or their closest, if dead) gather
// voices for 3 days, then call the moot through the same conductTrial
// machinery. The player is a juror — present, voting, remembered.
// This test proves: no premature moot, the moot convenes at day+3, the
// announcement is honest, the trial resolves through the standard backstop,
// and the case reaches a terminal state.
// Usage: node scripts/test-npc-moot-20261012.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(cond, name) {
  if (cond) { pass++; console.log('  ok - ' + name); }
  else { fail++; console.log('  FAIL - ' + name); }
}

(async () => {
  const { Game } = await loadGame({ seed: 777, mode: 'proof' });
  await setupGame(Game);
  const lines = [];
  Game.say = function (t) { lines.push(String(t)); };
  const v = Game.state.village;
  const npcs = (Game.npcIds() || []).filter(id => id !== Game.villagerId);
  ok(npcs.length >= 4, `enough villagers for a plot (n=${npcs.length})`);

  const [leader, accomplice, victim, witness] = npcs;
  // a sprung ambush plot, NPC-on-NPC, victim alive (the caller)
  const plot = {
    id: 'plot_npcmoot_test', day: Game.state.scholar.day,
    leader, accomplices: [accomplice], target: victim, weakest: accomplice,
    witnesses: [witness],
  };
  Game.betrayalState().plots.push(plot);
  const c = Game.openCase(plot, 'murder');
  ok(!!c && c.status === 'open', 'NPC-accused case opens');
  ok(c.accused[0] === leader && !Game.isPlayer(leader), 'accused is an NPC');
  const mark = lines.length;

  // ---- 1. no premature moot: the village gathers voices first ----
  Game.npcMootTick();
  ok(!c.trial, 'no moot on the day of the crime (voices still gathering)');
  ok(lines.length === mark, 'no announcement yet');

  // ---- 2. day+3: the victim calls the moot ----
  c.day = Game.state.scholar.day - 3;
  Game.npcMootTick();
  ok(!!c.trial, 'moot convened at day+3');
  const ann = lines.slice(mark).join('\n');
  ok(/tonight they call a moot/.test(ann), 'moot announced honestly');
  console.log('  -- announcement: ' + lines.slice(mark).find(l => /tonight they call a moot/.test(l)));
  ok(c.trial.awaitingPlayerVote || !c.trial.playerVoter,
    'player vote path set (voter or honestly absent)');

  // ---- 3. idempotent: a second tick does not re-convene ----
  const trialObj = c.trial;
  const mark2 = lines.length;
  Game.npcMootTick();
  ok(c.trial === trialObj, 'second tick does not re-tally the trial');
  ok(lines.slice(mark2).filter(l => /tonight they call a moot/.test(l)).length === 0,
    'no second announcement');

  // ---- 4. the trial resolves through the standard backstop ----
  if (c.trial.awaitingPlayerVote) {
    Game.state.scholar.day = c.trial.day + 2;
    Game.trialVoteTick();
  } else {
    // player wasn't seated; finish honestly
    Game.finishTrial(c, 0);
  }
  const terminal = ['convicted', 'acquitted', 'exile', 'weregild', 'schism', 'cold_war', 'resolved'];
  ok(terminal.includes(c.status) || c.resolution,
    `case reached a terminal state (status=${c.status}, resolution=${c.resolution})`);
  const verd = lines.slice(mark2).join('\n');
  ok(/Not guilty|take what you can carry|pays|schism|cold/i.test(verd),
    'verdict narrated in the open');

  // ---- 5. convicted NPC faces the sentence ----
  if (c.resolution === 'exile') {
    ok(!(v.roster || []).includes(leader), 'exiled NPC leaves the roster');
  } else {
    console.log(`  -- resolution was '${c.resolution}', not exile — no roster assertion`);
    pass++;
  }

  // ---- 6. conviction path: a guilty village exiles the NPC accused ----
  const Game2 = await (async () => {
    const g2 = await loadGame({ seed: 4242, mode: 'proof' });
    await setupGame(g2.Game);
    const l2 = [];
    g2.Game.say = function (t) { l2.push(String(t)); };
    return { Game: g2.Game, lines: l2 };
  })();
  const npcs2 = (Game2.Game.npcIds() || []).filter(id => id !== Game2.Game.villagerId);
  const [l2, a2, v2, w2] = npcs2;
  const plot2 = {
    id: 'plot_npcmoot_convict', day: Game2.Game.state.scholar.day,
    leader: l2, accomplices: [a2], target: v2, weakest: a2, witnesses: [w2],
  };
  Game2.Game.betrayalState().plots.push(plot2);
  const c2 = Game2.Game.openCase(plot2, 'murder');
  c2.day = Game2.Game.state.scholar.day - 3;
  for (const vid of npcs2) if (!c2.accused.includes(vid)) c2.belief[vid] = -100;
  Game2.Game.npcMootTick();
  ok(!!c2.trial, 'conviction scenario: moot convened');
  if (c2.trial.awaitingPlayerVote) Game2.Game.castPlayerVote(c2.id, true);
  ok(c2.resolution === 'exile', `guilty verdict -> exile (resolution=${c2.resolution})`);
  ok(!(Game2.Game.state.village.roster || []).includes(l2), 'convicted NPC leaves the roster');
  ok(Game2.lines.some(t => /take what you can carry/.test(t)), 'exile sentence narrated in the open');

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(2); });
