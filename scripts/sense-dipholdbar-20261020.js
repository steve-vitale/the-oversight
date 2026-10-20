#!/usr/bin/env node
// sense-dipholdbar-20261020.js — SENSE-TESTING LAW instrument for sim-dipholdbar,
// SECOND VARIANT (bill-current).
//
// Replays seed 64207 on the modified engine with a Game.say tap, printing
// every say-line mentioning arrears/tribute/the books from d106–d120 — the
// player-facing fiction at the exact moment the bill-current bar is tested
// (first arrears posting on the control run was d113). Read for meaning,
// coherence, relevance — not just counts.
'use strict';
const P = require('./probe-dipholdbar-20261020');
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
  await quietLog(async () => { await runDays(loaded.Game, policy, { days: 121, manifest: undefined, sampleEvery: 30 }); });
  const keep = said.filter(e => e.d >= 104 && e.d <= 120 && /arrears|tribute|oath|books|standing/i.test(e.s));
  console.log(`captured ${said.length} say-lines total; ${keep.length} in the d104-120 arrears window:`);
  for (const e of keep) console.log(`  [d${e.d}] ${e.s.slice(0, 220)}`);
}

main().catch(e => { console.error('FATAL', e); process.exit(2); });
