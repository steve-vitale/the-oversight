#!/usr/bin/env node
// sense-pyrrhic-verify-20261017.js — SENSE-TESTING LAW for the verify run.
// Captures verbatim say/sysSay beats around the belongfeast-s1911 d101
// pyrrhic kill (ruth_goldstein vs ducks_in_a_row, strike_nonhead x4, 'lost')
// WITH the fix, for a human meaning-judgment: does the recovered ledger
// (codex 'slain' + villageSlain + trick) read coherently against the defeat
// narration — mourning that teaches?
// Usage: FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/sense-pyrrhic-verify-20261017.js
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(ROOT, 'scripts', 'sim-harness'));
const FS = require(path.join(ROOT, 'scripts', 'policies', 'feastscale'));

if (process.env.FEASTSCALE_R13 !== '1') { console.error('SENSE STOP: FEASTSCALE_R13=1 required.'); process.exit(2); }
if (process.env.SEATDRIVE !== '0') { console.error('SENSE STOP: SEATDRIVE=0 required.'); process.exit(2); }

(async () => {
  const { Game } = await loadGame({ seed: 1911, mode: 'pyrrhic-verify-sense', fullTelemetry: false });
  await setupGame(Game);
  const beats = [];
  const gday = () => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
  const _say = Game.say, _sys = Game.sysSay;
  Game.say = function (t) { try { const d = gday(); if (d >= 99 && d <= 103) beats.push({ d, who: 'say', t: String(t).slice(0, 300) }); } catch (e) {} return _say.apply(this, arguments); };
  Game.sysSay = function (t) { try { const d = gday(); if (d >= 99 && d <= 103) beats.push({ d, who: 'sys', t: String(t).slice(0, 300) }); } catch (e) {} return _sys.apply(this, arguments); };

  await quietLog(async () => { await runDays(Game, FS.belongfeast, { days: 110, manifest: undefined, sampleEvery: 30 }); });

  for (const b of beats) console.log(`[d${b.d} ${b.who}] ${b.t}`);
  const wkl = (Game.state.waveKillLog || []).filter(e => e.mid === 'ducks_in_a_row');
  console.log('--- ledger check ---');
  console.log('waveKillLog ducks_in_a_row:', JSON.stringify(wkl));
  console.log('codex stage:', (((Game.state.codex || {}).monsters || {}).ducks_in_a_row || {}).stage || null);
  console.log('villageSlain:', ((Game.state.villageSlain || {}).ducks_in_a_row | 0));
})().catch(e => { console.error('SENSE CRASH:', e); process.exit(2); });
