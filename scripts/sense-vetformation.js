#!/usr/bin/env node
// sense-vetformation.js — SENSE-TESTING for sim-vetformation: replays an
// armed census seed with LIVE narration and prints (a) the formation-commit
// beats ("pick up their edges") with voiced context, and (b) the wave-4
// fights where the finishing discipline held, so a reader can judge
// whether companions read as people doing brave things — SENSE-TESTING
// LAW: meaning, coherence, relevance, never counts.
//
// Replaying the SAME seed+policy with narration on is trajectory-safe: the
// harness's sanctioned {narration:true} path is read-only output.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 \
//   KILLDISC=1 ARMORYDRIVE=1 VETFORMATION=1 \
//   SEED=68803 BASE=lead DAYS=180 node scripts/sense-vetformation.js
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const VF = require(path.join(REPO, 'scripts', 'policies', 'vetformation'));

const SEED = parseInt(process.env.SEED || '68805', 10);
const BASE = process.env.BASE || 'lead';
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const CTX_RE = /pick up their edges|veteran kill|just put down|has fallen|died|funeral|wave.?4|fourth draft|mirror draft|readiness|armor the village|hold the line|stand with|beside you/i;

(async () => {
  const nb = (BASE === 'belong' ? 'belongfeast' : 'leadfeast');
  const policy = VF.formedFor(nb);
  const { Game } = await loadGame({ seed: SEED, mode: 'vetformation-sense', fullTelemetry: false, narration: true });
  await setupGame(Game);
  const recent = [];
  const commits = [];
  const kills = [];
  const osay = Game.say.bind(Game);
  Game.say = function (x) {
    try {
      const s = String(x);
      const day = ((Game.state || {}).scholar || {}).day || 0;
      recent.push(`[d${day}] ${s.slice(0, 300)}`);
      if (recent.length > 12) recent.shift();
      if (/pick up their edges/.test(s)) commits.push({ day, line: s.slice(0, 300), context: recent.slice(-6, -1) });
      if (/just put down/.test(s)) kills.push({ day, line: s.slice(0, 300), context: recent.slice(-6, -1) });
    } catch (e) {}
    return osay.apply(this, arguments);
  };
  await quietLog(async () => { await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  const st = Game.state || {};
  const w4kills = (st.waveKillLog || []).filter(e => e && (e.w | 0) >= 4);
  console.log(`=== sense-vetformation: seed=${SEED} base=${BASE} VETFORMATION=1, ${commits.length} formation commits, ${kills.length} voiced companion kills, ${w4kills.length} wave-4+ kills in waveKillLog ===`);
  for (const c of commits) {
    console.log(`\n--- formation commit d${c.day} ---`);
    for (const x of c.context) console.log('    ctx: ' + x);
    console.log('    BEAT: ' + c.line);
  }
  for (const k of kills) {
    console.log(`\n--- companion kill beat d${k.day} ---`);
    for (const x of k.context) console.log('    ctx: ' + x);
    console.log('    BEAT: ' + k.line);
  }
  console.log('\n--- wave-4+ kills (waveKillLog) ---');
  for (const e of w4kills) console.log(`    d${e.d} ${e.mid} by=${e.by} via=${e.via}`);
})().catch(e => { console.error('SENSE FAILED:', (e && e.stack) || e); process.exit(1); });
