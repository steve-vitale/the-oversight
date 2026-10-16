#!/usr/bin/env node
// scripts/sense-holdspiral-20261016.js — SENSE-TEST for the sim-holdspiral-b
// arm (loop B, 2026-10-16, food-economy axis). Runs one seed x policy on the
// landed gate (control) and on gate+valve (armed), 120d, and prints the
// hold/release/feast beats WITH pantry-state context for a human read
// (SENSE-TESTING LAW: transcripts, not counts). The release valve should
// read as a village deciding to feast anyway after the pantry keeps saying
// not tonight — not as a counter tripping.
//
// Usage:
//   SEATDRIVE=0 FEASTSCALE_R13=1 ALLOWGATE2=1 SEED=101 POLICY=leadcourt node scripts/sense-holdspiral-20261016.js
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const AG2 = require('./policies/allowgate2');
let AG6;
try {
  AG6 = require('./policies/allowgate6');
} catch (e) {
  console.log('INFO-SKIP: allowgate6 layer absent (reverted per kill protocol)');
  process.exit(0);
}

const SEED = parseInt(process.env.SEED || '101', 10);
const PID = process.env.POLICY || 'leadcourt';
const DAYS = parseInt(process.env.DAYS || '120', 10);

async function oneSide(base, label) {
  const { Game } = await loadGame({ seed: SEED, mode: 'holdspiral-sense-' + label, fullTelemetry: false });
  await setupGame(Game);
  const said = [];
  const origSay = Game.say.bind(Game);
  Game.say = function (t) { said.push({ day: (Game.state.scholar || {}).day || 0, text: String(t) }); return origSay(t); };
  const feastCtx = [];
  const origHost = Game.hostFeast.bind(Game);
  Game.hostFeast = function (...a) {
    let fdBefore = -1, pantryBefore = 0, streak = 0;
    try { fdBefore = Game.pantryFreshDays(); } catch (e) {}
    try { pantryBefore = ((Game.state.village || {}).pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0); } catch (e) {}
    try { const pg = Game.progState ? Game.progState() : {}; streak = pg.hungryStreak || 0; } catch (e) {}
    const r = origHost(...a);
    if (r && r.ok) {
      let fdAfter = -1;
      try { fdAfter = Game.pantryFreshDays(); } catch (e) {}
      feastCtx.push({ day: (Game.state.scholar || {}).day || 0, fdBefore: +fdBefore.toFixed(1), fdAfter: +fdAfter.toFixed(1), pantryBefore: Math.round(pantryBefore), hungryStreak: streak });
    }
    return r;
  };
  const fdSamples = [];
  let runCtx = null;
  const policy = Object.assign({}, base);
  const origSetup = base.setup;
  policy.setup = (G, ctx) => { runCtx = ctx; if (origSetup) return origSetup(G, ctx); };
  const origDaily = base.daily;
  policy.daily = (G, ctx) => {
    try {
      const d = (G.state.scholar || {}).day || 0;
      if (d % 10 === 0) fdSamples.push({ day: d, fd: +G.pantryFreshDays().toFixed(1), hungryDays: (G.state.village || {}).hungryDays || 0, holds: (runCtx && runCtx.ag2GateHeld) || 0, releases: (runCtx && runCtx.ag6Releases) || 0 });
    } catch (e) {}
    return origDaily ? origDaily(G, ctx) : undefined;
  };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 10 }); });
  const keep = (re) => said.filter(s => re.test(s.text));
  console.log(`\n===== seed ${SEED} (${PID}) — ${label}: days=${result.days} end=${result.endReason} =====`);
  console.log(`allowance feasts: ${(runCtx && runCtx.fsFeasts) || 0}, gate-held (candidate-only): ${(runCtx && runCtx.ag2GateHeld) || 0}, valve releases: ${(runCtx && runCtx.ag6Releases) || 0}`);
  console.log('\n--- feast decision context (fresh-days before -> after, hungryStreak) ---');
  for (const f of feastCtx) console.log(`  d${f.day}: freshDays ${f.fdBefore} -> ${f.fdAfter} | pantry ${f.pantryBefore} kcal | hungryStreak ${f.hungryStreak}`);
  console.log('\n--- valve decision lines (the village deciding) ---');
  for (const s of keep(/decides to feast anyway/)) console.log(`  d${s.day}: ${s.text.slice(0, 220)}`);
  console.log('\n--- feast beats (human read; first 6) ---');
  for (const s of keep(/FEAST|feast is warm/).slice(0, 6)) console.log(`  d${s.day}: ${s.text.slice(0, 200)}`);
  console.log('\n--- pantry/hunger trace (every 10d) ---');
  for (const f of fdSamples) console.log(`  d${f.day}: freshDays=${f.fd} hungryDays=${f.hungryDays} holds=${f.holds} releases=${f.releases}`);
  return runCtx;
}

(async () => {
  const base = PID === 'belongseek' ? { c: AG2.belonggate2, a: AG6.belonggate6 } : { c: AG2.leadgate2, a: AG6.leadgate6 };
  await oneSide(base.c, 'CONTROL gate-only');
  await oneSide(base.a, 'ARMED gate+valve');
})().catch(e => { console.error('SENSE CRASH:', e); process.exit(2); });
