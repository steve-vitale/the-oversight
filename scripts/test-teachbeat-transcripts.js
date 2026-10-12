#!/usr/bin/env node
// test-teachbeat-transcripts.js — sense-test the player->villager 'teach'
// conversation beat (SENSE-TESTING LAW). Wraps say() AND sayLine(), drives
// the real 'teach' choice with several villagers, prints the actual lines
// for human judgement.
// Usage: node scripts/test-teachbeat-transcripts.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

(async () => {
  const { Game } = await loadGame({ seed: 99, mode: 'test', fullTelemetry: false });
  await setupGame(Game);
  // the player must know plants to teach them: identify a few
  const pids = (Game.data.plants || []).slice(0, 6).map(p => p.id);
  for (const pid of pids) { try { Game.identifyPlant(pid, 'observation'); } catch (e) {} }
  console.log('player knows:', Object.keys(Game.state.codex.plants || {}).length);
  const cap = [];
  Game.say = function (m) { cap.push({ via: 'say', msg: String(m).slice(0, 300) }); };
  const _sl = Game.sayLine;
  Game.sayLine = function (vid, line, opts) {
    cap.push({ via: 'sayLine', msg: String(line).slice(0, 300) });
    return _sl ? _sl.call(this, vid, line, opts) : null;
  };

  const v = Game.state.village;
  const roster = (v.roster || []).filter(id => id !== Game.villagerId);
  let driven = 0;
  for (const vid of roster.slice(0, 6)) {
    try {
      if (!Game.startConvo(vid)) continue;
      const choices = Game.convoChoices(vid) || [];
      const t = choices.find(c => c.id === 'teach');
      if (t) { Game.convoTurn(vid, 'teach'); driven++; }
      try { Game.endConvo(vid, 'left'); } catch (e) {}
    } catch (e) {}
  }
  console.log(`teach choices driven: ${driven}`);
  console.log('=== captured lines ===');
  for (const l of cap) console.log(`[${l.via}] ${l.msg}`);
})().catch(e => { console.error(e); process.exit(1); });
