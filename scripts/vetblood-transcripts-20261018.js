#!/usr/bin/env node
// vetblood-transcripts-20261018.js — sense-testing probe for sim-vetblood.
// Re-runs an armed sweep seed (deterministic) with Game.say wrapped and
// captures SAY lines in windows around each VILLAGER wave-3+ kill day, for
// human reads of whether the blood-list staffing production is sensible
// (collective fiction, consequences) or noise. READ-ONLY.
// Writes evidence/2026-10-18/vetblood-transcripts/<policy>-s<seed>.txt.
// Usage: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 \
//        WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 VETBLOOD=1 \
//        POLICY=belongfeast SEED=57106 node scripts/vetblood-transcripts-20261018.js
'use strict';
// POST-KILL INFO-SKIP: the vetblood layer was deleted per the kill protocol
// (KILLED-AT-PILOT, 2026-10-18). Kept as historical record; exit 0 instead
// of crashing on the missing module.
const fs0 = require('fs'), path0 = require('path');
if (!fs0.existsSync(path0.join(__dirname, 'policies', 'vetblood.js'))) {
  console.log('INFO-SKIP: vetblood-transcripts-20261018.js — layer deleted per kill protocol (KILLED-AT-PILOT 2026-10-18).');
  process.exit(0);
}
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const TF = require('./policies/tribfloor');
const VB = require('./policies/vetblood');

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER', 'VETBLOOD']) {
  if (process.env[k] !== '1') { console.error(`STOP: ${k}=1 required.`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('STOP: SEATDRIVE=0 required.'); process.exit(2); }
if (process.env.NODEWITNESS !== '1') { console.error('STOP: NODEWITNESS=1 required.'); process.exit(2); }
const POLICY = process.env.POLICY || 'belongfeast';
const SEED = parseInt(process.env.SEED || '57106', 10);
const policy = POLICY === 'leadfeast' ? VB.vetbloodLead : VB.vetbloodBelong;

(async () => {
  const { Game } = await loadGame({ seed: SEED, mode: 'vetblood', fullTelemetry: false });
  await setupGame(Game);
  const lines = [];
  const osay = Game.say.bind(Game);
  Game.say = function (x) {
    try {
      const day = (Game.state && Game.state.scholar && Game.state.scholar.day) | 0;
      lines.push(`[d${day}] ${String(x).slice(0, 500)}`);
    } catch (e) {}
    return osay.apply(this, arguments);
  };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: 180, manifest: undefined, sampleEvery: 30 }); });
  // Villager wave-3+ kills with days, from the engine's own log.
  let scholarVid = null;
  try { scholarVid = Game.villagerId || null; } catch (e) {}
  const kills = [];
  try {
    for (const e of (Game.state.waveKillLog || [])) {
      if (!e || (e.w | 0) < 3) continue;
      kills.push({ d: e.d | 0, mid: e.mid, by: String(e.by || '').slice(0, 14), via: e.via, scholar: e.by === scholarVid });
    }
  } catch (e) {}
  kills.sort((a, b) => a.d - b.d);
  const keep = new Set();
  for (const k of kills) for (let d = k.d - 2; d <= k.d + 2; d++) if (d >= 1) keep.add(d);
  const win = lines.filter(l => {
    const m = /^\[d(\d+)\]/.exec(l);
    return m && keep.has(parseInt(m[1], 10));
  });
  const dir = path.join(__dirname, '..', 'evidence', '2026-10-18', 'vetblood-transcripts');
  fs.mkdirSync(dir, { recursive: true });
  const fp = path.join(dir, `${POLICY}-s${SEED}.txt`);
  const head = `# vetblood transcript — ${POLICY} seed ${SEED} (armed)\n# wave-3+ kills in run:\n` +
    kills.map(k => `d${k.d} ${k.mid} by=${k.by} via=${k.via}${k.scholar ? ' (SCHOLAR)' : ' (villager)'}`).join('\n') +
    `\n# say-lines in d[kill-2, kill+2] windows: ${win.length} (of ${lines.length} total)\n\n`;
  fs.writeFileSync(fp, head + win.join('\n') + '\n');
  console.log(`wrote ${fp} (${win.length} window lines, ${kills.length} w3+ kills)`);
})().catch(e => { console.error('TRANSCRIPT CRASH:', e); process.exit(2); });
