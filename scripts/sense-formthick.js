#!/usr/bin/env node
// sense-formthick.js — SENSE-TESTING for sim-formthick: replays an armed
// census seed with LIVE narration and prints (a) the pair-them beats
// ("Walk with us") with voiced context, (b) the formation-commit beats,
// and (c) the wave-4 fights/kills, so a reader can judge whether the
// paired drafting reads as people choosing to stand together —
// SENSE-TESTING LAW: meaning, coherence, relevance, never counts.
//
// The replay uses FT.thickFor(nb) — the EXACT sweep policy id (the
// vetstack lesson: a different policy id steers engine decisions and the
// replay diverges). Replaying the same seed+policy with narration on is
// trajectory-safe: the harness's sanctioned {narration:true} path is
// read-only output.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 \
//   KILLDISC=1 ARMORYDRIVE=1 VETFORMATION=1 FORMTHICK=1 \
//   SEED=68812 BASE=belong DAYS=180 node scripts/sense-formthick.js
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const FT = require(path.join(REPO, 'scripts', 'policies', 'formthick'));

const SEED = parseInt(process.env.SEED || '68812', 10);
const BASE = process.env.BASE || 'belong';
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;

(async () => {
  const nb = (BASE === 'belong' ? 'belongfeast' : 'leadfeast');
  const policy = FT.thickFor(nb); // EXACT sweep policy id
  const { Game } = await loadGame({ seed: SEED, mode: 'formthick-sense', fullTelemetry: false, narration: true });
  await setupGame(Game);
  const recent = [];
  const pairs = [];
  const commits = [];
  const kills = [];
  const osay = Game.say.bind(Game);
  Game.say = function (x) {
    try {
      const s = String(x);
      const day = ((Game.state || {}).scholar || {}).day || 0;
      recent.push(`[d${day}] ${s.slice(0, 300)}`);
      if (recent.length > 12) recent.shift();
      if (/Walk with us/.test(s)) pairs.push({ day, line: s.slice(0, 300), context: recent.slice(-6, -1) });
      else if (/pick up their edges/.test(s)) commits.push({ day, line: s.slice(0, 300), context: recent.slice(-6, -1) });
      if (/just put down/.test(s)) kills.push({ day, line: s.slice(0, 300), context: recent.slice(-6, -1) });
    } catch (e) {}
    return osay.apply(this, arguments);
  };
  await quietLog(async () => { await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  const st = Game.state || {};
  const w4kills = (st.waveKillLog || []).filter(e => e && (e.w | 0) >= 4);
  console.log(`=== sense-formthick: seed=${SEED} base=${BASE} FORMTHICK=1, ${pairs.length} pair-them beats, ${commits.length} formation commits, ${kills.length} voiced companion kills, ${w4kills.length} wave-4+ kills ===`);
  for (const c of pairs) {
    console.log(`\n--- PAIR-THEM beat d${c.day} ---`);
    for (const x of c.context) console.log('    ctx: ' + x);
    console.log('    BEAT: ' + c.line);
  }
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
