#!/usr/bin/env node
// windowreach-sense-20261021.js — SENSE-TESTING for sim-windowreach-r2:
// re-runs the unlocking seed (belongfeast s64858, unlock d81) with LIVE
// narration (loadGame {narration:true} — the harness's sanctioned path;
// the silenced sweep capture sees no voiced lines) and prints the System's
// voiced lines across the unlock + post-unlock window (d75-95) for
// judgment: did the unlock beat land, did wave-5 announce itself, does the
// window read as the village's fate changing?
//
// This is a SEPARATE diagnostic run, not part of the 32-run corpus — no
// DET claim attaches to it.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 VGEAR=1 KILLDISC=1 \
//   SEED=64858 POLICY=belongfeast DAYS=95 node scripts/windowreach-sense-20261021.js
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const VCE = require('./policies/vgearconfirm');

const SEED = parseInt(process.env.SEED || '64858', 10);
const POLICY = (process.env.POLICY || 'belongfeast').toLowerCase();
const DAYS = parseInt(process.env.DAYS || '95', 10);
// The voiced lines that matter in the window: unlock/release beats,
// Producer announcements, table/win lines, death beats of named villagers.
const LINE_RE = /fifth draft|producers|talent has been released|not bought with bread alone|cancellation|editor|rerun|spoiler|timeslot|nielsen|finale|network note|galactic table|table waiting|the table|you win|won |victory|died|funeral|has fallen/i;

(async () => {
  const base = VCE.armedFor(POLICY);
  const { Game } = await loadGame({ seed: SEED, mode: 'windowreach-sense', fullTelemetry: false, narration: true });
  await setupGame(Game);
  const lines = [];
  const osay = Game.say.bind(Game);
  Game.say = function (x) {
    try {
      const s = String(x);
      if (LINE_RE.test(s)) {
        const day = ((Game.state || {}).scholar || {}).day || 0;
        if (day >= 70) lines.push(`[d${day}] ${s.slice(0, 500)}`);
      }
    } catch (e) {}
    return osay.apply(this, arguments);
  };
  const policy = Object.assign({}, base);
  await quietLog(async () => { await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  console.log(`sense ${POLICY}/s${SEED}: ${lines.length} voiced lines d70+:`);
  for (const l of lines) console.log(l + '\n');
})().catch(e => { console.error('FATAL', e && e.stack ? e.stack : e.message); process.exit(1); });
