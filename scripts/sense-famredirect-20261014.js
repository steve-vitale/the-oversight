#!/usr/bin/env node
// Sense-test: collect famine-redirect beats from armed runs.
// Runs 3 seeds known-starving in control (leadcourt 77, belongseek 33/77)
// with FAMINEREDIRECT=1, capturing Game.say output, and prints the
// redirect beats for human judgment (SENSE-TESTING LAW).
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
process.env.FAMINEREDIRECT = '1';
const leadcourt = require('./policies/leadcourt').leadcourt;
const belongseek = require('./policies/belongseek').belongseek;

async function one(seed, pid, policyBase, days) {
  const { Game } = await loadGame({ seed, mode: 'famredirect-sense-' + pid, fullTelemetry: false });
  await setupGame(Game);
  const beats = [];
  const origSay = Game.say;
  Game.say = function (t) { beats.push(String(t)); return origSay.apply(this, arguments); };
  const policy = Object.assign({}, policyBase);
  const origDaily = policyBase.daily;
  policy.daily = (G, ctx) => { if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} } };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 10 }); });
  const redir = beats.filter(s => s.indexOf('⚠️') >= 0);
  const redirN = (Game.state.village || {}).famineRedirects || 0;
  console.log(`=== ${pid} seed ${seed}: days=${result.days} end=${result.endReason} famineRedirects=${redirN} beats=${redir.length}`);
  redir.forEach((b, i) => console.log(`  [${i + 1}] ${b}`));
  // context: beats around the redirect (what happened just before)
  return { pid, seed, redirN, beats: redir.length };
}

async function main() {
  const picks = [
    [77, 'leadcourt', leadcourt, 80],
    [33, 'belongseek', belongseek, 60],
    [77, 'belongseek', belongseek, 60],
  ];
  for (const [seed, pid, pol, days] of picks) await one(seed, pid, pol, days);
}
if (require.main === module) main().catch(e => { console.error('FATAL', e); process.exit(1); });
