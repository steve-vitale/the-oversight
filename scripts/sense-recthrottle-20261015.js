#!/usr/bin/env node
// sense-recthrottle-20261015.js — SENSE-TESTING for the rebuilt recovery
// throttle on the courtship road: read the post-death recovery transcripts.
// Does the village read as mourning and regrouping, or as a throttle firing?
//
// SENSE-TESTING LAW: judge meaning, coherence, relevance — never just
// counts. The r35 sense pass caught the dead-paparazzo "After Someone's
// death…" line; this pass re-reads the 2-day-hold beats on the courtship
// road with the people-only trigger in the spec from the start.
'use strict';
process.env.FOURTHLINK = '1';
process.env.RECOVERYLEVER = '1';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { recoverylever } = require('./policies/recoverylever');

const SAYRE = /nobody ranges|holds Haven|sets a watch|mantle|died|dead|grief|funeral|🕯|Crews stay/i;

async function main() {
  const seed = parseInt(process.env.SEEDS || '66', 10);
  const { Game } = await loadGame({ seed, mode: 'recthrottle-sense', fullTelemetry: true });
  await setupGame(Game);
  const gday = () => ((Game.state || {}).scholar || {}).day || 0;
  const lines = [];
  const origSay = Game.say.bind(Game);
  Game.say = function (msg) {
    try {
      const text = String((msg && (msg.text || msg.msg || msg.message)) || msg || '');
      if (SAYRE.test(text) && lines.length < 120) {
        lines.push({ day: gday(), text: text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').slice(0, 260) });
      }
    } catch (e) {}
    return origSay(msg);
  };
  await quietLog(() => runDays(Game, recoverylever, { days: 150, sampleEvery: 10 }));
  console.log(`--- sense transcript: seed ${seed}, ${lines.length} lines ---`);
  for (const l of lines) console.log(`[d${l.day}] ${l.text}`);
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
