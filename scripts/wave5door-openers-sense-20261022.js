#!/usr/bin/env node
// wave5door-openers-sense-20261022.js — SENSE-TESTING for
// sim-wave5door-openers: re-runs an unlocking seed with LIVE narration
// (loadGame {narration:true} — the harness's sanctioned path; the silenced
// sweep capture sees no voiced lines) and prints the System's voiced lines
// across the unlock window for judgment: did the readiness release beat
// land, did the fifth draft announce itself, does the window read as the
// village's fate changing?
//
// SENSE-TESTING LAW: the reader judges meaning, coherence, relevance —
// never the silenced sweep capture.
//
// This is a SEPARATE diagnostic run, not part of any corpus — no DET claim
// attaches to it. It runs to the same horizon as the census (180d).
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 VGEAR=1 KILLDISC=1 \
//   SEED=65428 POLICY=leadfeast DAYS=180 FROMDAY=55 node scripts/wave5door-openers-sense-20261022.js
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const VCE = require('./policies/vgearconfirm');

const SEED = parseInt(process.env.SEED || '65428', 10);
const POLICY = (process.env.POLICY || 'leadfeast').toLowerCase();
const DAYS = parseInt(process.env.DAYS || '180', 10);
const FROMDAY = parseInt(process.env.FROMDAY || '55', 10);
// The voiced lines that matter: readiness deferral/release beats,
// Producer announcements, the fifth draft, deaths of named villagers,
// wave-4/5 monster arrivals, table/win lines.
const LINE_RE = /fifth draft|fourth draft|producers|talent has been released|not bought with bread alone|stays in the wings|RATINGS ARE UP|not ready|armor the village|weapons in hands|cancellation|editor|rerun|spoiler|timeslot|nielsen|finale|network note|galactic table|table waiting|the table|you win|won |victory|died|funeral|has fallen|herald|titan/i;

(async () => {
  const base = VCE.armedFor(POLICY);
  const { Game } = await loadGame({ seed: SEED, mode: 'wave5door-openers-sense', fullTelemetry: false, narration: true });
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
  // POST-WIN CONTINUATION (the windowstay-r2 oneRun pattern, same as the
  // census sweep): the stock harness stops at the win flag while the
  // village is alive in memory. Flip Game.over=false (POSTWIN-ALLOW, the
  // one documented engine mutation) and re-drive for the remaining days,
  // so the transcript covers the post-win unlock window.
  let winDay = null;
  try {
    if (Game.over && Game.won) {
      winDay = ((Game.state || {}).scholar || {}).day || 0;
      const remaining = Math.max(0, DAYS - winDay);
      if (remaining > 0) {
        Game.over = false;
        await quietLog(async () => { await runDays(Game, policy, { days: remaining, manifest: undefined, sampleEvery: 30 }); });
      }
    }
  } catch (e) {}
  let uw = 1, won = false, path = null;
  try { uw = Game.unlockedWave ? Game.unlockedWave() : 1; } catch (e) {}
  try { won = !!Game.won; } catch (e) {}
  try { path = Game.tableState ? (Game.tableState().path || null) : null; } catch (e) {}
  console.log(`sense ${POLICY}/s${SEED}: maxWave=${uw} won=${won} path=${path} — ${lines.length} voiced lines d${FROMDAY}+:`);
  for (const l of lines) console.log(l + '\n');
})().catch(e => { console.error('FATAL', e && e.stack ? e.stack : e.message); process.exit(1); });
