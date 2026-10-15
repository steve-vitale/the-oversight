#!/usr/bin/env node
// sense-rangerefill2-20261015.js — sense-test probe (re-test): capture the actual
// fill/gate-haul say lines on the Violet Pang seed (s55) under RANGEREFILL=1,
// so the evidence file's sense-test reads REAL beats, not assertions.
// SENSE-TESTING LAW: fill beats must read as a person being careful, not a
// dispenser.
//
// Usage: RANGEREFILL=1 node scripts/sense-rangerefill2-20261015.js
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

async function main() {
  const RANGEREFILL = process.env.RANGEREFILL === '1';
  if (!RANGEREFILL) { console.error('run with RANGEREFILL=1'); process.exit(2); }
  const { rangerefillLeadcourt } = require('./policies/rangerefill');
  const { Game } = await loadGame({ seed: 55, mode: 'rangerefill-sense', fullTelemetry: false });
  await setupGame(Game);
  const sayLines = [];
  const origSay = Game.say.bind(Game);
  Game.say = function (msg) {
    try {
      const t = String(msg || '');
      if (/fill|Filled|cistern|bottle|haul|water/i.test(t)) sayLines.push({ day: (Game.state.scholar || {}).day, text: t.slice(0, 220) });
    } catch (e) {}
    return origSay(msg);
  };
  let savedCtx = null;
  const od = rangerefillLeadcourt.daily;
  const pwrap = Object.assign({}, rangerefillLeadcourt);
  pwrap.daily = (G, ctx) => { savedCtx = ctx; return od(G, ctx); };
  await quietLog(async () => { await runDays(Game, pwrap, { days: 20 }); });
  const perDay = {};
  for (const l of sayLines) perDay[l.day] = (perDay[l.day] || 0) + 1;
  console.log('--- water-line days:', JSON.stringify(perDay), '---');
  console.log('--- gate-haul / creek-fill beats ---');
  for (const l of sayLines) {
    if (/ranging out|Creek source|Wetland source|Pond source/i.test(l.text)) console.log(`d${l.day}: ${l.text}`);
  }
  const log = (savedCtx && savedCtx._rfDawnLog) || [];
  console.log('--- dawn log (pack/cistern/gate) ---');
  for (const e of log.slice(0, 20)) console.log(JSON.stringify(e));
  console.log(`gateTrips=${savedCtx.rf_gateTrips || 0} gateHauls=${savedCtx.rf_gateHauls || 0} unresolvable=${savedCtx.rf_gateUnresolvable || 0}`);
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
