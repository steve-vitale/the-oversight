#!/usr/bin/env node
// sense-takedisc-20261014.js — sense-test transcript capture for takedisc.
// 2 short ARMED runs (TAKEDISC=1) with say-capture; prints eating-related
// beats for human reading (SENSE-TESTING LAW).
// Usage: node scripts/sense-takedisc-20261014.js
'use strict';
process.env.TAKEDISC = '1';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const td = require('./policies/takedisc');

const EAT_RE = /took|packed|meal|pantry|hunger|eat|starv|ration|full|cooke?d/i;

async function runOne(seed, policyId) {
  process.env.POLICY = policyId;
  const { Game } = await loadGame({ seed, mode: 'takedisc-sense' });
  await setupGame(Game);
  const beats = [];
  const origSay = Game.say.bind(Game);
  Game.say = function (msg) {
    try {
      const t = String((msg && (msg.text || msg.msg || msg.message)) || msg || '');
      if (EAT_RE.test(t)) {
        const day = ((Game.state || {}).scholar || {}).day || 0;
        beats.push(`d${day}: ${t.slice(0, 160)}`);
      }
    } catch (e) {}
    return origSay(msg);
  };
  const policy = td.policyForRun();
  await quietLog(() => runDays(Game, policy, { days: 15 }));
  Game.say = origSay;
  return beats;
}

(async () => {
  for (const [seed, policyId] of [[11, 'belongseek'], [33, 'leadcourt']]) {
    console.log(`\n===== ARMED ${policyId} s${seed} — eating beats (15d) =====`);
    const beats = await runOne(seed, policyId);
    // print a sample: first 30 + last 10 (avoid 200-line dump)
    const sample = beats.length > 40 ? [...beats.slice(0, 30), '...', ...beats.slice(-10)] : beats;
    for (const b of sample) console.log(b);
    console.log(`(${beats.length} eating beats total)`);
  }
})().catch(e => { console.error('FATAL', e); process.exit(1); });
