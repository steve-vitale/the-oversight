#!/usr/bin/env node
// sense-recoverthrottle-20261015.js — SENSE-TESTING for the recoverthrottle
// arm: read the guard-posture transcript. Does it read as people grieving
// and regrouping, or as a robot hiding? SENSE-TESTING LAW: judge meaning,
// coherence, consequences — never just counts.
//
// Kill-protocol graceful degradation: INFO-SKIP when the layer is absent.
'use strict';
let W = null;
try {
  process.env.FOURTHLINK = '1';
  process.env.RECOVERTHROTTLE = '1';
  W = require('./policies/recoverthrottle');
} catch (e) {
  if (e.code === 'MODULE_NOT_FOUND' && /recoverthrottle/.test(e.message || '')) { /* deleted per kill protocol */ }
  else throw e;
}
if (!W) {
  console.log('INFO-SKIP: recoverthrottle layer deleted per kill protocol; sense transcript kept in evidence/2026-10-15/sim-recoverthrottle.md');
  process.exit(0);
}
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

const SAYRE = /holds Haven|stands down|mantle|🕯|fortif/i;

async function main() {
  const seed = parseInt(process.env.SEEDS || '44', 10);
  const { Game } = await loadGame({ seed, mode: 'recoverthrottle-sense', fullTelemetry: true });
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
  await quietLog(() => runDays(Game, W.recoverthrottle, { days: 150, sampleEvery: 10 }));
  console.log(`--- sense transcript: seed ${seed}, ${lines.length} posture lines ---`);
  for (const l of lines) console.log(`[d${l.day}] ${l.text}`);
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
