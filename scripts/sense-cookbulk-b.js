#!/usr/bin/env node
// scripts/sense-cookbulk-b.js — SENSE-TESTING LAW capture for sim-cookbulk-b.
//
// Re-runs one armed seed and captures the full say-beat transcript of the
// FIRST day the cook layer fires, plus the surrounding context (scholar
// kcal, containers, water, fire). The transcript is read as a player, not
// counted: does it read like a person feeding their village, or a robot?
//
// Usage: FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/sense-cookbulk-b.js [seed] [policy]
//   (defaults: first firing seed found by scanning 7901-7908 x leadfeast, 60d)
'use strict';
const { belongfeast, leadfeast } = require('./policies/feastscale');
const CB = require('./policies/cookbulk-b');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

const SCAN_SEEDS = [7901, 7902, 7903, 7904, 7905, 7906, 7907, 7908];

async function findFiringSeed() {
  const seed = parseInt(process.argv[2] || '0', 10);
  const pid = process.argv[3] || 'leadfeast';
  if (seed) return { seed, pid };
  process.env.COOKBULK = '1';
  for (const s of SCAN_SEEDS) {
    const base = leadfeast;
    const pol = CB.withCookBulk(base, 'leadfeast+cookbulk', 'sense-scan');
    const { Game } = await loadGame({ seed: s, mode: 'leanwinter', fullTelemetry: false });
    await setupGame(Game);
    let runCtx = null;
    const wrapped = Object.assign({}, pol);
    const oDaily = pol.daily, oUpkeep = pol.upkeep;
    wrapped.daily = (G, c) => { runCtx = c; return oDaily(G, c); };
    wrapped.upkeep = (G, c) => { runCtx = c; return oUpkeep(G, c); };
    await quietLog(async () => { await runDays(Game, wrapped, { days: 60, sampleEvery: 60 }); });
    if (runCtx && (runCtx._cbCookDays || 0) > 0) { delete process.env.COOKBULK; return { seed: s, pid: 'leadfeast' }; }
  }
  delete process.env.COOKBULK;
  return null;
}

(async () => {
  for (const k of ['FEASTSCALE_R13']) {
    if (process.env[k] !== '1') { console.error('SENSE STOP: FEASTSCALE_R13=1 required.'); process.exit(2); }
  }
  if (process.env.SEATDRIVE !== '0') { console.error('SENSE STOP: SEATDRIVE=0 required.'); process.exit(2); }
  const found = await findFiringSeed();
  if (!found) { console.log('SENSE: no firing seed found in 7901-7908 x leadfeast (60d) — nothing to read.'); process.exit(0); }
  console.log(`SENSE: capturing first cook-day transcript on ${found.pid} s${found.seed}`);
  process.env.COOKBULK = '1';
  const base = found.pid === 'leadfeast' ? leadfeast : belongfeast;
  const pol = CB.withCookBulk(base, found.pid + '+cookbulk', 'sense');
  const { Game } = await loadGame({ seed: found.seed, mode: 'leanwinter', fullTelemetry: false });
  await setupGame(Game);
  const beats = [];
  const oSay = Game.say.bind(Game);
  Game.say = (m) => { beats.push({ day: (Game.state.scholar || {}).day, msg: String(m) }); return oSay(m); };
  const ctx = {};
  let capturedDay = null, runCtx = null;
  const wrapped = Object.assign({}, pol);
  const oDaily = pol.daily, oUpkeep = pol.upkeep;
  wrapped.upkeep = (G, c) => { runCtx = c; return oUpkeep(G, c); };
  wrapped.daily = (G, c) => {
    runCtx = c;
    const before = (runCtx._cbCookDays || 0);
    const r = oDaily(G, c);
    if ((runCtx._cbCookDays || 0) > before && capturedDay == null) {
      capturedDay = (G.state.scholar || {}).day;
      // snapshot context
      const s = G.state.scholar || {};
      beats.push({ day: capturedDay, msg: `--- CONTEXT day ${capturedDay}: scholar kcal=${Math.round(s.kcal)}/${G.kcalCap ? G.kcalCap() : '?'} dayTicks=${s.dayTicks} atHaven=${G.havenStoresAccess ? G.havenStoresAccess() : '?'} fire=${G.nearFire ? G.nearFire() : '?'} water=${G.cleanWaterForCooking ? G.cleanWaterForCooking() : '?'}` });
      try {
        const pantry = ((G.state.village || {}).pantry || []).filter(i => i && (i.needsCooking || i.rawKcal));
        beats.push({ day: capturedDay, msg: `--- pantry cookables: ${pantry.map(i => `${i.units}u ${i.name} (kcalEach=${i.kcalEach}${i.needsCooking ? ',needsCooking' : ''}${i.safe ? '' : ',UNSAFE'})`).join(' | ') || 'none'}` });
      } catch (e) {}
    }
    return r;
  };
  await quietLog(async () => { await runDays(Game, wrapped, { days: 180, sampleEvery: 60 }); });
  delete process.env.COOKBULK;
  Game.say = oSay;
  if (capturedDay == null) { console.log('SENSE: layer never fired in 180d — nothing to read.'); process.exit(0); }
  const dayBeats = beats.filter(b => b.day === capturedDay);
  console.log(`\n===== COOK-DAY TRANSCRIPT (day ${capturedDay}, ${found.pid} s${found.seed}) =====`);
  for (const b of dayBeats) console.log(`[d${b.day}] ${b.msg}`);
  console.log('===== END =====\n');
  const fs = require('fs'), path = require('path');
  const out = path.join(__dirname, '..', 'evidence', '2026-10-17', `sense-cookbulk-s${found.seed}.txt`);
  fs.writeFileSync(out, dayBeats.map(b => `[d${b.day}] ${b.msg}`).join('\n') + '\n');
  console.log('wrote', out);
})().catch(e => { console.error('SENSE FAILED', e); process.exit(1); });
