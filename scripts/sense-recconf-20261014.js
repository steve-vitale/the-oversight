#!/usr/bin/env node
// sense-recconf-20261014.js — SENSE-TESTING for the recovery throttle,
// stratified re-confirm: read the post-death recovery transcripts. Does
// the village read as mourning and regrouping, or as a throttle firing?
//
// SENSE-TESTING LAW: judge meaning, coherence, relevance — never just
// counts. The r35 sense pass caught the dead-paparazzo "After Someone's
// death…" line; this pass re-reads the 2-day-hold beats on the leadfeast
// road with the people-only trigger.
'use strict';
process.env.FEASTSCALE_R13 = '1';
process.env.RECCONF = '1';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { recconf } = require('./policies/recconf');

const SAYRE = /nobody ranges|holds Haven|sets a watch|mantle|died|dead|grief|funeral|🕯|Crews stay/i;

async function main() {
  const seed = parseInt(process.env.SEEDS || '44', 10);
  const { Game } = await loadGame({ seed, mode: 'recconf-sense', fullTelemetry: true });
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
  await quietLog(() => runDays(Game, recconf, { days: 150, sampleEvery: 10 }));
  console.log(`--- sense transcript: seed ${seed}, ${lines.length} lines ---`);
  for (const l of lines) console.log(`[d${l.day}] ${l.text}`);
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
