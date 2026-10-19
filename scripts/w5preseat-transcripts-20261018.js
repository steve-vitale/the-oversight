#!/usr/bin/env node
// w5preseat-transcripts-20261018.js — sense-testing probe for sim-w5preseat.
// Re-runs a sweep seed (deterministic) with Game.say wrapped and captures
// SAY lines in the window around the run's closest-to-door days, for a
// human read of whether the near-door stretch is meaningful (desperate,
// consequential, coherent) or arbitrary.
// READ-ONLY. Writes evidence/2026-10-18/w5preseat-transcripts/<policy>-s<seed>.txt.
// Usage: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 \
//   WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 \
//   POLICY=leadfeast SEED=66101 node scripts/w5preseat-transcripts-20261018.js
'use strict';
const fs = require('fs');
const path = require('path');
const SW = require('./w5preseat-sweep-20261018');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { attribute } = require('./w5preseat-analyze-20261018');

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER', 'NODEWITNESS']) {
  if (process.env[k] !== '1') { console.error(`STOP: ${k}=1 required (pre-seat).`); process.exit(2); }
}
if (process.env.SEATDRIVE === '1') { console.error('STOP: SEATDRIVE=0 required (pre-seat).'); process.exit(2); }
const POLICY = process.env.POLICY || 'leadfeast';
const SEED = parseInt(process.env.SEED || '66101', 10);
const EVIDSEED = path.join(__dirname, '..', 'evidence', '2026-10-18', 'perseed-w5preseat', POLICY, `s${SEED}.json`);
if (!fs.existsSync(EVIDSEED)) { console.error(`STOP: sweep JSON missing: ${EVIDSEED}`); process.exit(2); }
const seedRec = JSON.parse(fs.readFileSync(EVIDSEED, 'utf8'));
const attr = attribute(seedRec);

// Capture window: the closest-to-door stretch — from 3 days before the
// other4 joint day (the day the binding leg started keeping the door shut
// alone) through run end; for unlocked runs, 3 days before the unlock.
const anchor = attr.unlocked ? attr.wave5Day
  : (attr.other4FirstJointDay != null ? attr.other4FirstJointDay : Math.max(1, attr.endDay - 12));
const keep = new Set();
for (let d = anchor - 3; d <= attr.endDay; d++) if (d >= 1) keep.add(d);
const maxDay = 180;

(async () => {
  const policy = SW.policyFor(POLICY);
  const { Game } = await loadGame({ seed: SEED, mode: 'w5preseat-xscript', fullTelemetry: true });
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
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: maxDay, manifest: undefined, sampleEvery: 30 }); });
  const dir = path.join(__dirname, '..', 'evidence', '2026-10-18', 'w5preseat-transcripts');
  fs.mkdirSync(dir, { recursive: true });
  const fp = path.join(dir, `${POLICY}-s${SEED}.txt`);
  const head = `# w5preseat transcript — preseat/${POLICY} seed ${SEED}\n` +
    `# attribution: binding=${attr.bindingLeg} (set ${attr.bindingSet.join('+')}), unlocked=${attr.unlocked}, ` +
    `w5d=${attr.wave5Day == null ? '—' : 'd' + attr.wave5Day}, other4joint=${attr.other4FirstJointDay == null ? '—' : 'd' + attr.other4FirstJointDay}, ` +
    `end=${attr.endKind}:${attr.endDay}, gap=${attr.gap == null ? '—' : attr.gap + 'd'}\n` +
    `# say-lines captured d[anchor-3, end] (anchor=${anchor}): ${lines.length}\n\n`;
  fs.writeFileSync(fp, head + lines.join('\n') + '\n');
  console.log(`wrote ${fp} (${lines.length} say lines)`);
})().catch(e => { console.error('TRANSCRIPT CRASH:', e); process.exit(2); });
