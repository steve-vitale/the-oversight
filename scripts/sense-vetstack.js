#!/usr/bin/env node
// sense-vetstack.js — SENSE-TESTING for sim-vetstack: replays a stack census
// seed with LIVE narration and prints (a) veteran kill beats ("just put
// down"), (b) retention beats (blooded/shield/shelter/release), and (c) the
// wave-5 door / defer5-bar beats, so a reader can judge whether the
// composition reads as people protecting people — SENSE-TESTING LAW:
// meaning, coherence, relevance, never counts.
//
// Replaying the SAME seed+policy with narration on is trajectory-safe: the
// harness's sanctioned {narration:true} path is read-only output.
// The stack policy is composed here (retention OUTSIDE formation OUTSIDE
// armorydrive); scripts/policies/vetretention.js is the sweep-only
// dependency.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 \
//   KILLDISC=1 ARMORYDRIVE=1 VETFORMATION=1 VETRETENTION=1 \
//   SEED=68812 BASE=lead DAYS=180 node scripts/sense-vetstack.js
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const AD = require(path.join(REPO, 'scripts', 'policies', 'armorydrive'));
const VF = require(path.join(REPO, 'scripts', 'policies', 'vetformation'));
const VR = require(path.join(REPO, 'scripts', 'policies', 'vetretention'));

const SEED = parseInt(process.env.SEED || '68812', 10);
const BASE = process.env.BASE || 'lead';
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;

(async () => {
  const nb = (BASE === 'belong' ? 'belongfeast' : 'leadfeast');
  const tag = BASE === 'belong' ? 'belong' : 'lead';
  const policy = VR.withVetRetention(VF.formedFor(nb), `${tag}-vetstack-sense`, 'sense replay of the composition stack');
  const { Game } = await loadGame({ seed: SEED, mode: 'vetstack-sense', fullTelemetry: false, narration: true });
  await setupGame(Game);
  const recent = [];
  const kills = [];
  const retention = [];
  const doors = [];
  const osay = Game.say.bind(Game);
  Game.say = function (x) {
    try {
      const s = String(x);
      const day = ((Game.state || {}).scholar || {}).day || 0;
      recent.push(`[d${day}] ${s.slice(0, 300)}`);
      if (recent.length > 14) recent.shift();
      if (/just put down/.test(s)) kills.push({ day, line: s.slice(0, 300), context: recent.slice(-8, -1) });
      if (/blooded|shielded|bars the hall door|unbars for them|back on their feet|chair/i.test(s) && s.length < 400) retention.push({ day, line: s.slice(0, 300), context: recent.slice(-6, -1) });
      if (/fifth draft|the producers|wave.?5|readiness|veterans.*(bar|door)|door.*open/i.test(s)) doors.push({ day, line: s.slice(0, 300), context: recent.slice(-8, -1) });
    } catch (e) {}
    return osay.apply(this, arguments);
  };
  await quietLog(async () => { await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  const st = Game.state || {};
  const w4kills = (st.waveKillLog || []).filter(e => e && (e.w | 0) >= 4);
  console.log(`=== sense-vetstack: seed=${SEED} base=${BASE} stack, ${kills.length} voiced kills, ${retention.length} retention beats, ${doors.length} door beats ===`);
  for (const k of kills) {
    console.log(`\n--- veteran kill beat d${k.day} ---`);
    for (const x of k.context) console.log('    ctx: ' + x);
    console.log('    BEAT: ' + k.line);
  }
  for (const r of retention) {
    console.log(`\n--- retention beat d${r.day} ---`);
    for (const x of r.context) console.log('    ctx: ' + x);
    console.log('    BEAT: ' + r.line);
  }
  for (const d of doors) {
    console.log(`\n--- door/bar beat d${d.day} ---`);
    for (const x of d.context) console.log('    ctx: ' + x);
    console.log('    BEAT: ' + d.line);
  }
  console.log('\n--- wave-4+ kills (waveKillLog) ---');
  for (const e of w4kills) console.log(`    d${e.d} ${e.mid} by=${e.by} via=${e.via}`);
})().catch(e => { console.error('SENSE FAILED:', (e && e.stack) || e); process.exit(1); });
