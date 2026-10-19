#!/usr/bin/env node
// sense-doomeddraw-b.js — SENSE-TESTING LAW for sim-doomeddraw-b.
//
// Re-runs the highest-engagement armed seed, prints the seconds beats with
// day context, plus a villager talk sample and a roster sample. Read for
// meaning, coherence, relevance — never just counts.
// Usage: node scripts/sense-doomeddraw-b.js [seed]
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast } = require('./policies/feastscale');
let withDoomedDraw;
try { ({ withDoomedDraw } = require('./policies/doomeddraw')); }
catch (e) {
  if (e && e.code === 'MODULE_NOT_FOUND') {
    console.log('INFO-SKIP: sim-doomeddraw-b layer killed per protocol; sense vacuous, exit 0.');
    process.exit(0);
  }
  throw e;
}

const SEED = parseInt(process.argv[2] || '6561', 10);

(async () => {
  process.env.FEASTSCALE_R13 = '1';
  process.env.SEATDRIVE = '0';
  process.env.DOOMEDDRAW = '1';
  const { Game } = await loadGame({ seed: SEED, mode: 'sense-doomeddraw', fullTelemetry: false });
  await setupGame(Game);
  const beats = [];
  const oSay = Game.say;
  Game.say = function (st) {
    try {
      const day = (Game.state.scholar || {}).day || 0;
      if (/seconds all round/.test(String(st))) beats.push({ day, line: String(st) });
    } catch (e) {}
    return oSay.apply(this, arguments);
  };
  const policy = withDoomedDraw(leadfeast, 'leaddoomeddraw', 'sense');
  let capturedCtx = null;
  const origSetup = policy.setup;
  const p2 = Object.assign({}, policy);
  p2.setup = (G, ctx) => { capturedCtx = ctx; return origSetup(G, ctx); };
  const r = await runDays(Game, p2, { days: 60, manifest: null });
  console.log(`seed=${SEED} days=${r.days} end=${r.endReason}`);
  console.log(`fires=${(capturedCtx && capturedCtx._ddNights) || 0} glutNights=${(capturedCtx && capturedCtx._ddGlutNights) || 0}`);
  console.log('\n--- seconds beats (first 12) ---');
  for (const b of beats.slice(0, 12)) console.log(`d${b.day}: ${b.line}`);
  if (beats.length > 12) console.log(`... and ${beats.length - 12} more`);
  // lever-name leak scan across ALL voiced lines would need full capture;
  // the proof pins the single line shape. Here: coherence of the beat.
  console.log('\n--- roster sample (who is at the fire) ---');
  try {
    const v = Game.state.village || {};
    for (const id of (v.roster || []).slice(0, 6)) {
      const p = Game.getPerson ? Game.getPerson(id) : null;
      if (p) console.log(`  ${String(p.name || id).slice(0, 28)}${p.dead ? ' (dead)' : ''}`);
    }
  } catch (e) { console.log('  (roster unreadable)'); }
  console.log('\nSENSE-TEST: read the beats above for meaning/coherence. PASS = a person making a sensible call, no dev leakage.');
})().catch(e => { console.error('SENSE ERROR', e); process.exit(2); });
