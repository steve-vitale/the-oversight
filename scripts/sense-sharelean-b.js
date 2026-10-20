#!/usr/bin/env node
// sense-sharelean-b.js — transcript capture for the SENSE-TESTING LAW.
// Runs one 60d armed village (leadsharelean s5201, SHARELEAN=1), captures the
// full say-stream with day stamps, and writes it for human reading. Read the
// valve-day neighborhoods: does the fiction cohere, do villagers act like
// people, is anything robotic?
//
// Usage: FEASTSCALE_R13=1 SEATDRIVE=0 SHARELEAN=1 node scripts/sense-sharelean-b.js
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadsharelean } = require('./policies/sharelean');

const SEED = parseInt(process.env.SEED || '5201', 10);
const DAYS = parseInt(process.env.DAYS || '60', 10);
const OUT = process.env.OUT || '/tmp/sense-sharelean-b.txt';

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

(async () => {
  if (process.env.SHARELEAN !== '1') { console.error('SHARELEAN=1 required'); process.exit(2); }
  const { Game } = await loadGame({ seed: SEED, mode: 'sense-sharelean-b', fullTelemetry: false });
  await setupGame(Game);
  const lines = [];
  const oSay = Game.say;
  Game.say = function (m) { try { lines.push(`[d${dayOf(Game)}] ${String(m)}`); } catch (e) {} return oSay.apply(this, arguments); };
  const P = Object.assign({}, leadsharelean);
  const origDaily = P.daily;
  const valveDays = [];
  P.daily = (G, ctx) => {
    const r = origDaily(G, ctx);
    if (ctx._slValveDays > valveDays.length) valveDays.push(dayOf(G));
    return r;
  };
  await runDays(Game, P, { days: DAYS, manifest: null, sampleEvery: 181 });
  const valveSet = new Set(valveDays);
  const out = [];
  out.push(`SENSE-CAPTURE leadsharelean s${SEED} ${DAYS}d — valve voiced on days: ${valveDays.join(',') || 'none'}`);
  out.push('='.repeat(70));
  let curDay = -1;
  for (const l of lines) {
    const m = l.match(/^\[d(\d+)\]/);
    const d = m ? parseInt(m[1], 10) : -1;
    if (d !== curDay) {
      curDay = d;
      out.push(`\n----- day ${d}${valveSet.has(d) ? '  [VALVE DAY]' : ''} -----`);
    }
    out.push(l);
  }
  fs.writeFileSync(OUT, out.join('\n'));
  console.log(`wrote ${OUT} (${lines.length} lines, valve on ${valveDays.length}d)`);
})().catch(e => { console.error('SENSE CRASH', e); process.exit(2); });
