#!/usr/bin/env node
// nowinwindow-sense-20261021.js — SENSE-TESTING for sim-nowinwindow:
// re-runs an unlocking seed with LIVE narration (loadGame {narration:true} —
// the harness's sanctioned path; the silenced sweep capture sees no voiced
// lines) and prints the System's voiced lines across the unlock + post-unlock
// window for judgment: did the unlock beat land, did wave-5 announce itself,
// does the window read as the village's fate changing?
//
// SENSE-TESTING LAW: the reader judges meaning, coherence, relevance — never
// the silenced sweep capture.
//
// This is a SEPARATE diagnostic run, not part of any corpus — no DET claim
// attaches to it. It runs to the same horizon as the phase-3 census (180d).
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 VGEAR=1 KILLDISC=1 NOWINWINDOW=1 \
//   SEED=65301 POLICY=belongfeast DAYS=180 FROMDAY=75 node scripts/nowinwindow-sense-20261021.js
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const NW = require('./policies/nowinwindow');

const SEED = parseInt(process.env.SEED || '64858', 10);
const POLICY = (process.env.POLICY || 'belongfeast').toLowerCase();
const DAYS = parseInt(process.env.DAYS || '180', 10);
const FROMDAY = parseInt(process.env.FROMDAY || '70', 10);
// The voiced lines that matter in the window: unlock/release beats,
// Producer announcements, table/win lines, death beats of named villagers,
// herald/titan acts, readiness hold beats.
const LINE_RE = /fifth draft|producers|talent has been released|not bought with bread alone|cancellation|editor|rerun|spoiler|timeslot|nielsen|finale|network note|galactic table|table waiting|the table|you win|won |victory|died|funeral|has fallen|herald|titan|not ready|armor the village|weapons in hands/i;

(async () => {
  if (process.env.NOWINWINDOW !== '1') { console.error('SENSE STOP: NOWINWINDOW=1 required.'); process.exit(2); }
  const base = NW.armedFor(POLICY);
  const { Game } = await loadGame({ seed: SEED, mode: 'nowinwindow-sense', fullTelemetry: false, narration: true });
  await setupGame(Game);
  const lines = [];
  const osay = Game.say.bind(Game);
  Game.say = function (x) {
    try {
      const s = String(x);
      if (LINE_RE.test(s)) {
        const day = ((Game.state || {}).scholar || {}).day || 0;
        if (day >= FROMDAY) lines.push(`[d${day}] ${s.slice(0, 600)}`);
      }
    } catch (e) {}
    return osay.apply(this, arguments);
  };
  const policy = Object.assign({}, base);
  await quietLog(async () => { await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  let uw = 1, won = false, path = null;
  try { uw = Game.unlockedWave ? Game.unlockedWave() : 1; } catch (e) {}
  try { won = !!Game.won; } catch (e) {}
  try { path = Game.tableState ? (Game.tableState().path || null) : null; } catch (e) {}
  console.log(`sense ${POLICY}/s${SEED}: maxWave=${uw} won=${won} path=${path} — ${lines.length} voiced lines d${FROMDAY}+:`);
  for (const l of lines) console.log(l + '\n');
})().catch(e => { console.error('FATAL', e && e.stack ? e.stack : e.message); process.exit(1); });
