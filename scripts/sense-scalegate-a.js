#!/usr/bin/env node
// scripts/sense-scalegate-a.js — NON-MEASURED narration replay (never
// enters the census): tableseat-nowait on seed 74104 with Game.say
// captured, printing only TABLE/AUDIT/withdrawal lines. Narration
// capture does not change trajectories (say is output-only), but this
// replay is still reported as sense only, never as measurement.
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { tableseatNowait } = require('./policies/tableseat-nowait');
(async () => {
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  const { Game } = await loadGame({ seed: 74104, mode: 'scalegate-a-sense', fullTelemetry: false });
  await setupGame(Game);
  const lines = [];
  const origSay = Game.say.bind(Game);
  Game.say = function (txt) { try { lines.push(String(txt)); } catch (e) {} return origSay(txt); };
  const origSys = Game.sysSay ? Game.sysSay.bind(Game) : null;
  if (origSys) Game.sysSay = function (txt) { try { lines.push('[SYS] ' + String(txt)); } catch (e) {} return origSys(txt); };
  const result = await runDays(Game, tableseatNowait, { days: 180, manifest: undefined, sampleEvery: 10 });
  const seat = Game.tableSeat ? Game.tableSeat() : {};
  console.log('SENSE days=' + result.days + ' won=' + !!Game.won + ' finalSeat=' + (seat.seat || '?'));
  for (const l of lines) {
    if (/TABLE|AUDIT|seat|withdraw|reschedul/i.test(l)) console.log('SAY: ' + l.slice(0, 600));
  }
  console.log('SENSE-COUNT tableLines=' + lines.filter(l => /TABLE|AUDIT/i.test(l)).length + ' totalSay=' + lines.length);
})().catch(e => { console.error('SENSE FAIL', (e && e.stack) || e); process.exit(1); });
