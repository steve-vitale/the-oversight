#!/usr/bin/env node
// sense-dutyfish-b.js — transcript capture for the SENSE-TESTING LAW.
// Runs one 60d armed village (leaddutyfish s5601, DUTYFISH_B=1), captures the
// full say-stream with day stamps, and writes it for human reading. Read the
// staff-day neighborhoods: does the widening fiction cohere, do villagers
// act like people, is anything robotic?
//
// Usage: FEASTSCALE_R13=1 SEATDRIVE=0 DUTYFISH_B=1 node scripts/sense-dutyfish-b.js
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leaddutyfish } = require('./policies/dutyfish-b');

const SEED = parseInt(process.env.SEED || '5601', 10);
const DAYS = parseInt(process.env.DAYS || '60', 10);
const OUT = process.env.OUT || 'evidence/2026-10-20/sense-dutyfish-b-s5601.txt';

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

(async () => {
  if (process.env.DUTYFISH_B !== '1') { console.error('DUTYFISH_B=1 required'); process.exit(2); }
  if (process.env.FEASTSCALE_R13 !== '1') { console.error('FEASTSCALE_R13=1 required'); process.exit(2); }
  const { Game } = await loadGame({ seed: SEED, mode: 'sense-dutyfish-b', fullTelemetry: false });
  await setupGame(Game);
  const lines = [];
  const oSay = Game.say;
  Game.say = function (m) { try { lines.push(`[d${dayOf(Game)}] ${String(m)}`); } catch (e) {} return oSay.apply(this, arguments); };
  const P = Object.assign({}, leaddutyfish);
  const origDaily = P.daily;
  const staffDays = [];
  P.daily = (G, ctx) => {
    const r = origDaily(G, ctx);
    if ((ctx._dfStaffDays || 0) > staffDays.length) staffDays.push(dayOf(G));
    return r;
  };
  await runDays(Game, P, { days: DAYS, manifest: null, sampleEvery: 181 });
  const staffSet = new Set(staffDays);
  const out = [];
  out.push(`SENSE-CAPTURE leaddutyfish s${SEED} ${DAYS}d (DUTYFISH_B=1) — widening voiced on days: ${staffDays.join(',') || 'none'}`);
  out.push('='.repeat(70));
  let curDay = -1;
  for (const l of lines) {
    const m = l.match(/^\[d(\d+)\]/);
    const d = m ? parseInt(m[1], 10) : -1;
    if (d !== curDay) {
      curDay = d;
      out.push(`\n----- day ${d}${staffSet.has(d) ? '  [STAFF DAY]' : ''} -----`);
    }
    out.push(l);
  }
  fs.writeFileSync(OUT, out.join('\n'));
  console.log(`wrote ${OUT} (${lines.length} say lines, ${staffDays.length} staff days)`);
})().catch(e => { console.error('SENSE CRASH', e); process.exit(2); });
