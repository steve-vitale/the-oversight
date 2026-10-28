#!/usr/bin/env node
// scripts/test-w4tbkill-sense.js — NON-MEASURED replay only.
// Same say/sysSay tap pattern as test-w4convert-sense.js: loads a
// game at a seed, replays days, prints beats in a day window, and
// exits. Replay text NEVER enters any count, and the replay
// trajectory shift is stated, not hidden (the replay runs the
// policy without recorders, so its trajectory diverges from the
// corpus by construction).
// Usage: SEED=<seed> DAY0=<d0> DAY1=<d1> MODE=<control|a|b> node scripts/test-w4tbkill-sense.js
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { tableseatNowait } = require('./policies/tableseat-nowait');
const { w4tbkill } = require('./policies/w4tbkill');

async function main() {
  const seed = parseInt(process.env.SEED || '75103', 10);
  const d0 = parseInt(process.env.DAY0 || '110', 10);
  const d1 = parseInt(process.env.DAY1 || '130', 10);
  const mode = (process.env.MODE || 'control').toLowerCase();
  process.env.LEANLINKRESCUE = '1'; process.env.TABLESEATNOWAIT = '1';
  if (mode === 'a') process.env.W4TBKILL = '1'; else delete process.env.W4TBKILL;
  const base = (mode === 'a') ? w4tbkill : tableseatNowait;
  const { Game } = await loadGame({ seed, mode: 'w4tbkill-sense-' + mode, fullTelemetry: false });
  await setupGame(Game);
  const origSay = Game.say, origSys = Game.sysSay;
  const beats = [];
  Game.say = function (t) { try { const d = ((Game.state || {}).scholar || {}).day || 0; if (d >= d0 && d <= d1) beats.push(`d${d} SAY ${t}`); } catch (e) {} return origSay.apply(this, arguments); };
  if (typeof origSys === 'function') {
    Game.sysSay = function (t) { try { const d = ((Game.state || {}).scholar || {}).day || 0; if (d >= d0 && d <= d1) beats.push(`d${d} SYS ${t}`); } catch (e) {} return origSys.apply(this, arguments); };
  }
  const policy = Object.assign({}, base, {
    daily(G, ctx) { if (base.daily) return base.daily(G, ctx); },
  });
  await runDays(Game, policy, { days: d1, manifest: undefined, sampleEvery: 10 });
  console.log(`SENSE seed=${seed} window=d${d0}-d${d1} mode=${mode} beats=${beats.length} (NON-MEASURED replay; trajectory shifts vs corpus by construction)`);
  for (const b of beats.slice(0, 400)) console.log(b);
}
if (require.main === module) main().catch(e => { console.error('SENSE FAILED:', (e && e.stack) || e); process.exit(1); });
