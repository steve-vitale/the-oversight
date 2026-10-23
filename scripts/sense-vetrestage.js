#!/usr/bin/env node
// sense-vetrestage.js — SENSE-TESTING for sim-vetrestage: replays an
// ARMED (VETRESTAGE=1) seed with LIVE narration and prints the retention
// beats (shield/shelter/release/heal/escort) plus the death beats of
// blooded vids, with voiced context lines around them, so a reader can
// judge whether the protection reads as people protecting people —
// coherence, meaning, relevance, never counts (SENSE-TESTING LAW).
//
// Replaying the SAME seed+policy with narration on is trajectory-safe: the
// harness's sanctioned {narration:true} path is read-only output.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1 ARMORYDRIVE=1 VETRESTAGE=1 \
//   SEED=65511 ARM=lead DAYS=180 node scripts/sense-vetrestage.js
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const VS = require(path.join(REPO, 'scripts', 'policies', 'vetrestage'));

const SEED = parseInt(process.env.SEED || '65511', 10);
const ARM = process.env.ARM || 'lead';
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const KEEP_RE = /🛡️|🚪|📯|🎒|🩹|blooded|shielded|escort|died|has fallen|funeral|killed|slain|mantle|succession|raid|muster|treeline/i;

(async () => {
  const policy = ARM === 'belong' ? VS.armedFor('belongfeast') : VS.armedFor('leadfeast');
  const { Game } = await loadGame({ seed: SEED, mode: 'vetrestage-sense', fullTelemetry: false, narration: true });
  await setupGame(Game);
  const beats = [];
  const osay = Game.say.bind(Game);
  Game.say = function (x) {
    try {
      const s = String(x);
      const day = ((Game.state || {}).scholar || {}).day || 0;
      if (KEEP_RE.test(s)) { beats.push(`[d${day}] ${s.slice(0, 300)}`); if (beats.length > 400) beats.shift(); }
    } catch (e) {}
    return osay.apply(this, arguments);
  };
  let capturedCtx = null;
  const wrapped = Object.assign({}, policy, {
    daily(Gm, ctx) { capturedCtx = ctx; return policy.daily(Gm, ctx); },
  });
  await quietLog(async () => runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }));
  const trace = (capturedCtx && capturedCtx.vsTrace) || [];
  console.log(`=== sense-vetrestage seed=${SEED} arm=${ARM} trace=${trace.length} ===`);
  const byVid = {};
  for (const t of trace) {
    byVid[t.vid] = byVid[t.vid] || [];
    byVid[t.vid].push(t);
  }
  for (const vid of Object.keys(byVid)) {
    let name = vid;
    try { name = Game.displayName ? Game.displayName(vid) : vid; } catch (e) {}
    console.log(`\n-- blooded vid ${vid} (${name}) --`);
    for (const t of byVid[vid]) console.log(`   d${t.day} ${t.action}${t.killDay != null ? ' killDay=' + t.killDay : ''}${t.hp != null ? ' hp=' + t.hp : ''}${t.why ? ' why=' + t.why : ''}`);
  }
  console.log('\n=== retention + death beats (narration) ===');
  for (const b of beats.slice(-120)) console.log(b);
})().catch(e => { console.error('SENSE FAILED:', (e && e.stack) || e); process.exit(1); });
