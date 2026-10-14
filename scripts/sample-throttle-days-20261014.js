#!/usr/bin/env node
// SENSE-TEST: what do redirected villagers DO all day (throttled vs unthrottled)?
// Runs one seed/policy both sides (side = current tree state), wraps
// Game.say to capture redirect narration, and aggregates the act mix over
// the run from pacing rows. Usage:
//   SIDE=off node scripts/sample-throttle-days-20261014.js leadcourt 202 80
//   SIDE=on  node scripts/sample-throttle-days-20261014.js leadcourt 202 80
// Output: JSON to stdout + first 12 redirect lines.
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const [policyId, seedRaw, daysRaw] = process.argv.slice(2);
const seed = parseInt(seedRaw, 10), days = parseInt(daysRaw || '80', 10);
const policy = require('./policies/' + policyId)[policyId];

(async () => {
  const { Game } = await loadGame({ seed, mode: 'throttle-sense-' + policyId, fullTelemetry: false });
  await setupGame(Game);
  const says = [];
  const origSay = Game.say;
  Game.say = function (t) { const s = String(t); if (/leaves the/.test(s) && /pantry/.test(s)) says.push(s); try { return origSay.apply(this, arguments); } catch (e) {} };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 10 }); });
  const mix = { forage: 0, garden: 0, fish: 0, wood: 0, water: 0, stone: 0 };
  const keyTotals = {};
  for (const row of (result.pacing.perDay || [])) {
    for (const k of Object.keys(row.acts || {})) {
      const n = row.acts[k];
      keyTotals[k] = (keyTotals[k] || 0) + n;
      for (const t of Object.keys(mix)) if (new RegExp('(^|:)' + t + '(\\\\b|:|$)').test(k)) mix[t] += n;
    }
  }
  const topKeys = Object.entries(keyTotals).sort((a, b) => b[1] - a[1]).slice(0, 25)
    .map(([k, n]) => k + '=' + n);
  const v = Game.state.village || {};
  const dead = result.samples.deaths || [];
  const causes = {};
  for (const d of dead) { const k = String(d.cause || d.kind || 'unknown'); causes[k] = (causes[k] || 0) + 1; }
  console.log(JSON.stringify({
    side: process.env.SIDE || 'unknown', policy: policyId, seed, days: result.days,
    endReason: result.endReason, redirects: v.throttleRedirects || 0,
    actMix: mix, deaths: causes, hungryDays: v.hungryDays || 0,
    topActKeys: topKeys,
    sampleRedirects: says.slice(0, 12),
  }, null, 1));
})().catch(e => { console.error('FATAL', e); process.exit(1); });
