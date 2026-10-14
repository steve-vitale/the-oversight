#!/usr/bin/env node
// scripts/sense-allowancegate-r15-20261014.js — SENSE-TEST for the r15
// pantry-state gate arm (loop B, 2026-10-14, food-economy axis,
// sim-findings #187 claimed: FEASTDOOR'S CALIBRATED PRICE next arm). Runs
// an armed 120d seed and prints the allowance's feast beats WITH their
// pantry-state context for a human read (SENSE-TESTING LAW: transcripts,
// not counts). The gate should read as postponement — held feasts on thin
// pantries, fired feasts on surplus, never blind spending.
//
// Usage: FEASTSCALE_R13=1 ALLOWANCEGATE=1 SEED=22 POLICY=leadcourt node scripts/sense-allowancegate-r15-20261014.js
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const AG = require('./policies/allowancegate');

const SEED = parseInt(process.env.SEED || '22', 10);
const PID = process.env.POLICY || 'leadcourt';
const DAYS = parseInt(process.env.DAYS || '120', 10);

(async () => {
  const base = PID === 'belongseek' ? AG.belonggate : AG.leadgate;
  const { Game } = await loadGame({ seed: SEED, mode: 'allowancegate-r15-sense', fullTelemetry: false });
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
      if (d % 10 === 0) fdSamples.push({ day: d, fd: +G.pantryFreshDays().toFixed(1), hungryDays: (G.state.village || {}).hungryDays || 0, holds: (runCtx && runCtx.agGateHeld) || 0 });
    } catch (e) {}
    return origDaily ? origDaily(G, ctx) : undefined;
  };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 10 }); });
  console.log(`seed ${SEED} (${PID}, armed r15 gate): days=${result.days} end=${result.endReason}`);
  console.log(`allowance feasts: ${runCtx.fsFeasts || 0} (armed ${runCtx.fsArmedFeasts || 0}), gate-held: ${runCtx.agGateHeld || 0}`);
  console.log('\n--- feast decision context (fresh-days before -> after, hungryStreak) ---');
  for (const f of feastCtx) console.log(`  d${f.day}: freshDays ${f.fdBefore} -> ${f.fdAfter} | pantry ${f.pantryBefore} kcal | hungryStreak ${f.hungryStreak}`);
  console.log('\n--- feast beats (human read) ---');
  for (const s of said) {
    if (/🍖|FEAST/.test(s.text)) console.log(`[d${s.day}] ${s.text.slice(0, 340)}`);
  }
  console.log('\n--- hunger/starvation beats ---');
  for (const s of said) {
    if (/hunger|starv|empty (pantry|shelves)|nothing (to eat|left)/i.test(s.text)) console.log(`[d${s.day}] ${s.text.slice(0, 240)}`);
  }
  console.log('\n--- fresh-days trajectory + cumulative holds (10d samples) ---');
  console.log(fdSamples.map(x => `${x.day}:${x.fd}(h${x.holds})`).join(' '));
  console.log('\n--- deed state ---');
  try {
    const pg = Game.progState ? Game.progState() : {};
    const sp = (Game.state.scholar || {}).prog || {};
    console.log(`sentimentTaught=${!!pg.sentimentTaught} feastSurgeUsed=${!!sp.feastSurgeUsed} hungryDays=${(Game.state.village || {}).hungryDays || 0}`);
  } catch (e) { console.log('deed read failed: ' + e.message); }
})().catch(e => { console.error('SENSE CRASH:', e); process.exit(2); });
