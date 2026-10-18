#!/usr/bin/env node
// scripts/sense-huntstaff-b5.js — SENSE-TESTING LAW capture for sim-huntstaff-b5.
//
// Re-runs armed seeds and captures the say-beat transcripts around the
// boar/bear engagement windows. Read as a player, not counted:
//   read 1: armed-leadfeast-s105104 d9-d24 — Theo's bear stalk-kills
//     (layer-staffed) and Ruby's task-lead bear hunts + wounding.
//   read 2: armed-belongfeast-s107201 d158-d178 — Teresa's late wound-heavy
//     hunts and the starvation window.
// The question: do the hunts read like people hunting? And does the
// wound-chain read as a village losing its hunter to the wild's interest
// payments — or as robot labor?
//
// Usage: FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/sense-huntstaff-b5.js
'use strict';
const { belongfeast, leadfeast } = require('./policies/feastscale');
const HS = require('./policies/huntstaff');
const HE = require('./policies/huntengage');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

const READS = [
  { seed: 105104, pid: 'leadfeast', d0: 9, d1: 24, label: 'theo-ruby bear window' },
  { seed: 107201, pid: 'belongfeast', d0: 158, d1: 178, label: 'teresa late wound window' },
];
// One read per process: the harness forbids two games in one node process
// (shared module state leaks between runs and long trajectories diverge).
const ONLY = parseInt(process.env.READ || '0', 10);

async function readOne({ seed, pid, d0, d1, label }) {
  console.log(`\n===== SENSE read: ${label} (${pid} s${seed}, d${d0}-d${d1}) =====`);
  process.env.HUNTSTAFF = '1';
  const base = pid === 'leadfeast' ? leadfeast : belongfeast;
  const pol = HS.withHuntStaff(base, pid + '+huntstaff', 'sense');
  const { Game } = await loadGame({ seed, mode: 'leanwinter', fullTelemetry: false, narration: true });
  await setupGame(Game);
  const t = {};
  HE.observeGame(Game, t);
  const beats = [];
  const oSay = Game.say.bind(Game);
  Game.say = (m) => { beats.push({ day: (Game.state.scholar || {}).day, msg: String(m) }); return oSay(m); };
  const wrapped = Object.assign({}, pol);
  const oDaily = pol.daily, oUpkeep = pol.upkeep;
  wrapped.upkeep = (G, c) => (oUpkeep ? oUpkeep(G, c) : undefined);
  wrapped.daily = (G, c) => (oDaily ? oDaily(G, c) : undefined);
  await quietLog(async () => { await runDays(Game, wrapped, { days: d1, sampleEvery: 60 }); });
  const pick = (re) => beats.filter(b => b.day >= d0 && b.day <= d1 && re.test(b.msg));
  const huntBeats = pick(/🏹|hunt|Hunt|bear|Bear|boar|Boar|wound|Wound|🩹|🤒|💀|dead|Dead|succumbed/);
  for (const b of huntBeats) console.log(`[d${b.day}] ${b.msg}`);
  console.log(`--- engagements in window: ${JSON.stringify((t.bbEngagements || []).filter(e => e.day >= d0 && e.day <= d1))}`);
  console.log(`--- wounds in window: ${JSON.stringify((t.huntWounds || []).filter(w => w.day >= d0 && w.day <= d1))}`);
  delete process.env.HUNTSTAFF;
}

(async () => {
  for (const k of ['FEASTSCALE_R13']) {
    if (process.env[k] !== '1') { console.error('SENSE STOP: FEASTSCALE_R13=1 required.'); process.exit(2); }
  }
  if (process.env.SEATDRIVE !== '0') { console.error('SENSE STOP: SEATDRIVE=0 required.'); process.exit(2); }
  const reads = ONLY >= 1 && ONLY <= READS.length ? [READS[ONLY - 1]] : READS;
  for (const r of reads) await readOne(r);
})().catch(e => { console.error('SENSE FAILED', e); process.exit(1); });
