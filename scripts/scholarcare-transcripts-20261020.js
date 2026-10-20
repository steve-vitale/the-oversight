#!/usr/bin/env node
// scholarcare-transcripts-20261020.js — sense-testing probe for arm
// sim-scholarcare. Re-runs an ARMED sweep seed (deterministic) with
// Game.say wrapped and captures SAY lines in the window around the run's
// self-care episodes, for a human read of whether the scholar's self-care
// reads as a person recovering (SENSE-TESTING LAW).
// READ-ONLY (the re-run draws no new game state; it replays the seed).
// Writes evidence/2026-10-20/scholarcare-transcripts/<policy>-s<seed>.txt.
// Usage: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 \
//   WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 SCHOLARCARE=1 \
//   POLICY=belongfeast SEED=64007 node scripts/scholarcare-transcripts-20261020.js
'use strict';
const fs = require('fs');
const path = require('path');
const SW = require('./probe-w5path-20261019');
const SC = require('./policies/scholarcare');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

const ENV_REQ = ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER', 'NODEWITNESS'];
for (const k of ENV_REQ) if (process.env[k] !== '1') { console.error(`STOP: ${k}=1 required.`); process.exit(2); }
if (process.env.SEATDRIVE !== '0') { console.error('STOP: SEATDRIVE=0 required.'); process.exit(2); }
if (process.env.SCHOLARCARE !== '1') { console.error('STOP: SCHOLARCARE=1 required (armed re-run).'); process.exit(2); }
const POLICY = process.env.POLICY || 'belongfeast';
const SEED = parseInt(process.env.SEED || '64007', 10);
const EVIDSEED = path.join(__dirname, '..', 'evidence', '2026-10-20', 'perseed-scholarcare', 'armed', POLICY, `s${SEED}.json`);
if (!fs.existsSync(EVIDSEED)) { console.error(`STOP: sweep JSON missing: ${EVIDSEED}`); process.exit(2); }
const seedRec = JSON.parse(fs.readFileSync(EVIDSEED, 'utf8'));

// Capture window: wave-4 scholar-kill days ±5d/+10d (the kill, the care
// drive, the aftermath). Also capture the run's richest care stretch: the
// first day where the scholar woke wounded after a kill.
const killDays = [];
for (const r of (seedRec.recs || [])) {
  for (const k of (r.newKills || [])) {
    if ((k.w | 0) >= 4 && k.ch === 'player') killDays.push(r.d);
  }
}
if (!killDays.length) { console.error('STOP: no armed wave-4 player kills in this seed run — pick a seed with one.'); process.exit(2); }
const keep = new Set();
for (const kd of killDays) for (let d = kd - 5; d <= kd + 10; d++) if (d >= 1) keep.add(d);
const OUTDIR = path.join(__dirname, '..', 'evidence', '2026-10-20', 'scholarcare-transcripts');
fs.mkdirSync(OUTDIR, { recursive: true });

(async () => {
  const policy = SC.withScholarcare(SW.policyFor(POLICY), `${POLICY}-sc`, 'armed re-run');
  const { Game } = await loadGame({ seed: SEED, mode: 'scholarcare-xscript', fullTelemetry: false });
  await setupGame(Game);
  const lines = [];
  const osay = Game.say.bind(Game);
  Game.say = function (x) {
    try {
      const day = (Game.state && Game.state.scholar && Game.state.scholar.day) | 0;
      if (keep.has(day)) lines.push(`[d${day}] SAY: ${String(x).slice(0, 700)}`);
    } catch (e) {}
    return osay.apply(this, arguments);
  };
  // The harness stubs G.sysSay to a no-op (sim-harness.js). Restore the
  // engine's format (game.js sysSay) so the transcript hears the System,
  // routed through the capture above. Probe-only.
  Game.sysSay = function (text) {
    try {
      if (!((Game.state || {}).systemArrived)) return;
      const shown = String(text == null ? '' : text).replace(/^📺\s*/, '');
      return Game.say(`📺 SYSTEM: "${shown}"`);
    } catch (e) {}
  };
  let runCtx = null;
  const p2 = Object.assign({}, policy);
  const oSetup = policy.setup;
  p2.setup = (G, ctx) => { runCtx = ctx; if (oSetup) return oSetup(G, ctx); };
  const oUpkeep = p2.upkeep;
  p2.upkeep = (G, ctx) => {
    const prev = {};
    for (const k of Object.keys(ctx || {})) if (/^sc/.test(k)) prev[k] = ctx[k];
    let r;
    if (oUpkeep) { try { r = oUpkeep(G, ctx); } catch (e) {} }
    try {
      const day = (G.state && G.state.scholar && G.state.scholar.day) | 0;
      const fired = ['scSickDays', 'scWoundedDays', 'scTreated', 'scPills', 'scFolkFluids', 'scFolkTea', 'scFolkRest', 'scFirstAid', 'scRests', 'scExamined']
        .filter(k => (ctx[k] | 0) > (prev[k] | 0));
      if (fired.length) {
        let hp = '?', sick = '?';
        try { hp = (G.state.scholar.health !== undefined ? G.state.scholar.health : G.state.scholar.hp); } catch (e) {}
        try { sick = ((G.sickDiseases && G.sickDiseases()) || []).length; } catch (e) {}
        lines.push(`[d${day}] CARE: ${fired.join(',')} (hp=${hp} sick=${sick})`);
      }
    } catch (e) {}
    return r;
  };
  await quietLog(async () => { await runDays(Game, p2, { days: 180, manifest: undefined, sampleEvery: 30 }); });
  const out = path.join(OUTDIR, `${POLICY}-s${SEED}.txt`);
  fs.writeFileSync(out, `seed ${SEED} policy ${POLICY} (armed); wave-4 kill days ${killDays.join(',')}; window ±5/+10d\n` +
    `layer counters: ${JSON.stringify(runCtx ? Object.fromEntries(Object.entries(runCtx).filter(([k]) => /^sc/.test(k))) : {})}\n\n` +
    lines.join('\n') + '\n');
  console.log(`wrote ${out} (${lines.length} lines)`);
})().catch(e => { console.error(e.stack); process.exit(1); });
