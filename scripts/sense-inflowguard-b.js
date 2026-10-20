#!/usr/bin/env node
// scripts/sense-inflowguard-b.js — SENSE-TESTING transcript capture for the
// INFLOW-GUARD arm (fleshout loop B, 2026-10-20).
//
// Re-runs one pilot config with Game.say captured, then prints the say
// transcript for (a) fragile-day windows and (b) hunger-day windows, so a
// human can judge meaning/coherence/relevance — not just counts.
//
// Usage:
//   FEASTSCALE_R13=1 [INFLOWGUARD=1] SEED=4901 POLICY=belongfeast DAYS=180 \
//     node scripts/sense-inflowguard-b.js
'use strict';
process.env.FEASTSCALE_R13 = '1';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const FS = require('./policies/feastscale');
const IG = require('./policies/inflowguard');

const SEED = Number(process.env.SEED || 4901);
const POLICY = process.env.POLICY || 'belongfeast';
const DAYS = Number(process.env.DAYS || 180);
const ARMED = process.env.INFLOWGUARD === '1';
const BASE = { leadfeast: FS.leadfeast, belongfeast: FS.belongfeast };
const APOL = { leadfeast: IG.iglead, belongfeast: IG.igbelong };

(async () => {
  const { Game } = await loadGame({ seed: SEED, mode: `igsense-${POLICY}` });
  await setupGame(Game);
  const sayLog = [];
  const rawSay = Game.say.bind(Game);
  Game.say = function (text) {
    try { sayLog.push({ day: (Game.state.scholar || {}).day || 0, text: String(text).slice(0, 300) }); } catch (e) {}
    return rawSay(text);
  };
  let runCtx = null;
  const base = ARMED ? APOL[POLICY] : BASE[POLICY];
  const policy = Object.assign({}, base);
  const oSetup = base.setup, oDaily = base.daily;
  const fragileDays = [];
  policy.setup = (G, ctx) => { runCtx = ctx; if (oSetup) return oSetup(G, ctx); };
  policy.daily = (G, ctx) => {
    const d = (G.state.scholar || {}).day || 0;
    const wasFragile = ARMED ? (ctx.igFragileDays || 0) : null;
    const r = oDaily ? oDaily(G, ctx) : undefined;
    if (ARMED && (ctx.igFragileDays || 0) > (wasFragile || 0)) fragileDays.push(d);
    return r;
  };
  let result = null;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 181 }); });
  const hungryDays = [];
  try {
    for (const s of sayLog) {
      if (/day \d+ of hunger/i.test(s.text) && !hungryDays.includes(s.day)) hungryDays.push(s.day);
    }
  } catch (e) {}
  console.log(`seed=${SEED} policy=${POLICY} armed=${ARMED} days=${result.days} end=${result.endReason}`);
  console.log(`fragile days (${fragileDays.length}): ${fragileDays.slice(0, 40).join(',')}${fragileDays.length > 40 ? '...' : ''}`);
  console.log(`hunger days detected: ${hungryDays.join(',') || 'none'}`);
  const ig = runCtx ? { igFragileDays: runCtx.igFragileDays || 0, igForcedHaul: runCtx.igForcedHaul || 0, igDonatedDeep: runCtx.igDonatedDeep || 0 } : {};
  console.log('ig counters: ' + JSON.stringify(ig));
  // print windows: for each fragile/hunger day, the day's say lines
  const interesting = [...new Set([...fragileDays.slice(0, 6), ...hungryDays])].sort((a, b) => a - b);
  for (const d of interesting.slice(0, 10)) {
    console.log(`\n===== DAY ${d} =====`);
    for (const s of sayLog.filter(x => x.day === d).slice(0, 40)) {
      console.log(`  ${s.text}`);
    }
  }
})().catch(e => { console.error('FATAL', e); process.exit(2); });
