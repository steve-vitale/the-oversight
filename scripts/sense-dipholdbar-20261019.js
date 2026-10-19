#!/usr/bin/env node
// sense-dipholdbar-20261019.js — SENSE-TESTING LAW instrument for sim-diphold-bar.
//
// Replays seed 64207 on the modified engine to day 116 with a Game.say tap,
// printing every say-line mentioning arrears/tribute/the grace from d108–d116
// — the player-facing fiction at the exact moment the grace sustains the dip.
// Read for meaning, coherence, relevance — not just counts.
'use strict';
const P = require('./probe-dipholdbar-20261019');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

async function main() {
  const said = [];
  const policy = P.policyFor('belongfeast');
  const oDaily = policy.daily;
  let Game = null;
  policy.daily = (G, ctx) => {
    if (!Game) {
      Game = G;
      const oSay = G.say.bind(G);
      G.say = (s) => { try { said.push({ d: (G.state.scholar || {}).day || 0, s: String(s) }); } catch (e) {} return oSay(s); };
    }
    return oDaily ? oDaily(G, ctx) : undefined;
  };
  const loaded = await loadGame({ seed: 64207, mode: 'feastgap', fullTelemetry: false });
  await setupGame(loaded.Game);
  await quietLog(async () => { await runDays(loaded.Game, policy, { days: 116, manifest: undefined, sampleEvery: 30 }); });
  const keep = said.filter(e => e.d >= 106 && e.d <= 116 && /arrears|seven days|tribute|oath|books/i.test(e.s));
  console.log(`captured ${said.length} say-lines total; ${keep.length} in the d106-116 arrears window:`);
  for (const e of keep) console.log(`  [d${e.d}] ${e.s.slice(0, 200)}`);
}

main().catch(e => { console.error('FATAL', e); process.exit(2); });
