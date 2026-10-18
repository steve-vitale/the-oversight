#!/usr/bin/env node
// scripts/sense-huntstaff-b3.js — SENSE-TESTING LAW capture for sim-huntstaff-b3.
//
// Re-runs one armed seed and captures the say-beat transcript of the FIRST
// day the hunt-staffing layer fires, plus the surrounding context. The
// transcript is read as a player, not counted: does the village's hunting
// talk now have an actor? Is the fiction coherent (the System orders hunts;
// does the village answer — with a name, a background, honest variance)?
//
// Usage: FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/sense-huntstaff-b3.js [seed] [policy]
//   (defaults: first firing seed found by scanning 7811-7818 x leadfeast, 60d)
'use strict';
const { belongfeast, leadfeast } = require('./policies/feastscale');
const HS = require('./policies/huntstaff');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

const SCAN_SEEDS = [8092, 8112, 8142, 8171, 8235, 8282, 8297, 8341];

async function findFiringSeed() {
  const seed = parseInt(process.argv[2] || '0', 10);
  const pid = process.argv[3] || 'leadfeast';
  if (seed) return { seed, pid };
  process.env.HUNTSTAFF = '1';
  for (const s of SCAN_SEEDS) {
    const pol = HS.withHuntStaff(leadfeast, 'leadfeast+huntstaff', 'sense-scan');
    const { Game } = await loadGame({ seed: s, mode: 'leanwinter', fullTelemetry: false, narration: true });
    await setupGame(Game);
    let runCtx = null;
    const wrapped = Object.assign({}, pol);
    const oDaily = pol.daily, oUpkeep = pol.upkeep;
    wrapped.daily = (G, c) => { runCtx = c; return oDaily(G, c); };
    wrapped.upkeep = (G, c) => { runCtx = c; return oUpkeep(G, c); };
    await quietLog(async () => { await runDays(Game, wrapped, { days: 60, sampleEvery: 60 }); });
    if (runCtx && (runCtx._hsAssignments || 0) > 0) { delete process.env.HUNTSTAFF; return { seed: s, pid: 'leadfeast' }; }
  }
  delete process.env.HUNTSTAFF;
  return null;
}

(async () => {
  for (const k of ['FEASTSCALE_R13']) {
    if (process.env[k] !== '1') { console.error('SENSE STOP: FEASTSCALE_R13=1 required.'); process.exit(2); }
  }
  if (process.env.SEATDRIVE !== '0') { console.error('SENSE STOP: SEATDRIVE=0 required.'); process.exit(2); }
  const found = await findFiringSeed();
  if (!found) { console.log('SENSE: no firing seed found in b3 seeds x leadfeast (60d) — nothing to read.'); process.exit(0); }
  console.log(`SENSE: capturing first hunt-day transcript on ${found.pid} s${found.seed}`);
  process.env.HUNTSTAFF = '1';
  const base = found.pid === 'leadfeast' ? leadfeast : belongfeast;
  const pol = HS.withHuntStaff(base, found.pid + '+huntstaff', 'sense');
  const { Game } = await loadGame({ seed: found.seed, mode: 'leanwinter', fullTelemetry: false, narration: true });
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
    const r = oDaily(G, c);
    const asg = (c && c._hsAssignLog) || [];
    if (asg.length && capturedDay == null) capturedDay = asg[0].day;
    return r;
  };
  await quietLog(async () => { await runDays(Game, wrapped, { days: capturedDay == null ? 60 : capturedDay + 2, sampleEvery: 60 }); });
  // Single 60d run with narration live: the first hunt day is found during
  // the run (capturedDay), and beats are filtered to targetDay ± 1 after.
  const targetDay = capturedDay != null ? capturedDay : 0;
  console.log(`SENSE: first hunt day = d${targetDay}; assignment log:`, JSON.stringify((runCtx && runCtx._hsAssignLog) || []));
  const dayBeats = beats.filter(b => b.day >= targetDay - 1 && b.day <= targetDay + 1);
  for (const b of dayBeats) console.log(`[d${b.day}] ${b.msg}`);
  delete process.env.HUNTSTAFF;
})().catch(e => { console.error('SENSE FAILED', e); process.exit(1); });
