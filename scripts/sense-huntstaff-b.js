#!/usr/bin/env node
// scripts/sense-huntstaff-b.js — SENSE-TESTING LAW capture for sim-huntstaff-b.
//
// Re-runs one armed seed and captures the full say-beat transcript of the
// FIRST day the hunt layer fires (assignment + resolution), plus the days
// around it. The transcript is read as a player, not counted: does the
// village's hunting talk now have an actor? Is the fiction coherent (the
// System orders hunts; does the village answer)?
//
// Usage: FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/sense-huntstaff-b.js [seed] [policy]
//   (defaults: s7804 belongfeast — first hunt fires d24, 18,000 kcal)
'use strict';
const { belongfeast, leadfeast } = require('./policies/feastscale');
let HS;
try {
  HS = require('./policies/huntstaff');
} catch (e) {
  // INFO-SKIP (kill protocol, sim-huntstaff-b NO-GO 2026-10-17): the layer
  // was deleted zero-trace per the killed-arm protocol
  // (evidence/2026-10-17/sim-huntstaff-b.md). This sense capture is kept as
  // the instrument; it skips honestly instead of crashing. The re-run
  // (sim-huntstaff-b2) rebuilds the layer from the evidence spec.
  console.log('INFO-SKIP: scripts/policies/huntstaff.js absent (layer killed per sim-huntstaff-b verdict) — nothing to capture.');
  process.exit(0);
}
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

const SEED = parseInt(process.argv[2] || '7804', 10);
const PID = process.argv[3] || 'belongfeast';

(async () => {
  for (const k of ['FEASTSCALE_R13']) {
    if (process.env[k] !== '1') { console.error('SENSE STOP: FEASTSCALE_R13=1 required.'); process.exit(2); }
  }
  if (process.env.SEATDRIVE !== '0') { console.error('SENSE STOP: SEATDRIVE=0 required.'); process.exit(2); }
  process.env.HUNTSTAFF = '1';
  const base = PID === 'leadfeast' ? leadfeast : belongfeast;
  const pol = HS.withHuntStaff(base, PID + '+huntstaff', 'sense');
  const { Game } = await loadGame({ seed: SEED, mode: 'leanwinter', fullTelemetry: false });
  await setupGame(Game);
  const beats = [];
  const oSay = Game.say.bind(Game);
  Game.say = (m) => { try { beats.push({ day: (Game.state.scholar || {}).day, msg: String(m) }); } catch (e) {} return oSay(m); };
  const assigned = [];
  const oAssign = Game.assignTask.bind(Game);
  Game.assignTask = function (vid, task, opts) {
    try { if (task === 'hunt') { const p = Game.getPerson(vid) || {}; assigned.push({ day: (Game.state.scholar || {}).day, who: p.name || vid, occ: p.formerOccupation || '?' }); } } catch (e) {}
    return oAssign.apply(this, arguments);
  };
  const ctx = {};
  await quietLog(async () => { await runDays(Game, pol, { days: 60, sampleEvery: 60 }); });
  delete process.env.HUNTSTAFF;
  if (!assigned.length) { console.log('SENSE: layer never fired — nothing to read.'); process.exit(0); }
  const firstDay = assigned[0].day;
  console.log(`SENSE: first hunt assignment d${firstDay} — ${assigned[0].who} (${assigned[0].occ})`);
  console.log(`SENSE: all assignments: ${JSON.stringify(assigned)}`);
  const HUNT_RE = /🏹|hunt/i;
  for (const b of beats) {
    if (b.day >= firstDay - 1 && b.day <= firstDay + 2 && HUNT_RE.test(b.msg))
      console.log(`[d${b.day}] ${b.msg}`);
  }
  console.log('\n--- full d' + firstDay + ' transcript (all beats) ---');
  for (const b of beats.filter(x => x.day === firstDay))
    console.log(`[d${b.day}] ${b.msg}`);
})().catch(e => { console.error('SENSE FAILED', e); process.exit(1); });
