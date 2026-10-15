#!/usr/bin/env node
// scripts/dump-succgrace-beats-20261015.js — re-run two armed seeds with
// full beat capture for the sense test (deterministic: same seed+policy+
// gate replays the sweep trajectory).
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast } = require('./policies/feastscale');
if (process.env.FEASTSCALE_R13 !== '1') { console.error('need FEASTSCALE_R13=1'); process.exit(2); }
const RE = /dead hold no treaties|bond is fraying|realm came apart|silence answered|grief met with grain|speaker rides|tribute|succession/i;

async function dump(seed) {
  process.env.SUCCGRACE = '1';
  const { Game } = await loadGame({ seed, mode: 'succgrace-beatdump' });
  await setupGame(Game);
  const beats = [];
  const gday = () => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
  const origSay = Game.say.bind(Game);
  Game.say = function (msg) {
    try {
      const t = String((msg && (msg.text || msg.msg || msg.message)) || msg || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ');
      if (RE.test(t)) beats.push({ day: gday(), text: t.slice(0, 320) });
    } catch (e) {}
    return origSay(msg);
  };
  const policy = Object.assign({}, leadfeast);
  await runDays(Game, policy, { days: 180, sampleEvery: 10 });
  delete process.env.SUCCGRACE;
  console.log(`\n===== leadfeast s${seed} armed — succession/grace beats =====`);
  for (const b of beats) console.log(`d${b.day}: ${b.text}`);
}

(async () => {
  await dump(44);
  await dump(22);
})().catch(e => { console.error('FATAL', e); process.exit(2); });
