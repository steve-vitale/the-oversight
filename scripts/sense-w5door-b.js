#!/usr/bin/env node
// sense-w5door-b.js — SENSE-TESTING for sim-w5door-b: re-runs a seed with
// LIVE narration (loadGame {narration:true} — the harness's sanctioned
// path; the silenced sweep capture sees no voiced lines) and prints the
// System's voiced lines across the unlock window for judgment: did the
// readiness release beat land, did the fifth draft announce itself, does
// the window read as the village's fate changing?
//
// SENSE-TESTING LAW: the reader judges meaning, coherence, relevance —
// never the silenced sweep capture.
//
// This is a SEPARATE diagnostic run, not part of any corpus — no DET claim
// attaches to it. It runs to the same horizon as the census (180d).
//
// Substrate: the w5door-b pinned substrate (armorydrive; SEATDRIVE=0, so
// wins are structurally 0 and no postwin re-drive is needed).
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1 \
//   ARMORYDRIVE=1 SEED=65511 ARM=armorydrive DAYS=180 FROMDAY=55 node scripts/sense-w5door-b.js
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const AD = require(path.join(REPO, 'scripts', 'policies', 'armorydrive'));

const SEED = parseInt(process.env.SEED || '65511', 10);
const ARM = process.env.ARM || 'control';
const DAYS = parseInt(process.env.DAYS || '180', 10);
const FROMDAY = parseInt(process.env.FROMDAY || '55', 10);
// The voiced lines that matter: readiness deferral/release beats,
// Producer announcements, the fifth draft, deaths of named villagers,
// wave-4/5 monster arrivals, table lines.
const LINE_RE = /fifth draft|fourth draft|producers|talent has been released|not bought with bread alone|stays in the wings|RATINGS ARE UP|not ready|armor the village|weapons in hands|cancellation|editor|rerun|spoiler|timeslot|nielsen|finale|network note|galactic table|table waiting|the table|you win|won |victory|died|funeral|has fallen|herald|titan/i;

(async () => {
  const base = ARM === 'armorydrive' ? AD.armedFor('leadfeast') : AD.substrateFor('leadfeast');
  const { Game } = await loadGame({ seed: SEED, mode: 'w5door-b-sense', fullTelemetry: false, narration: true });
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
  console.log(`=== sense-w5door-b: seed=${SEED} arm=${ARM} (narration on, ${lines.length} matching voiced lines from d${FROMDAY}) ===`);
  for (const l of lines) console.log(l);
  // Trajectory check: is this the same trajectory as the silenced census
  // run? (Narration proved neutral on the 10-22 census seed; here it's a
  // separate diagnostic, reported as-is.)
  try {
    const st = Game.state || {};
    const uw = (typeof Game.unlockedWave === 'function') ? Game.unlockedWave() : null;
    console.log(`end: day=${(st.scholar || {}).day} over=${!!Game.over} unlockedWave=${uw}`);
  } catch (e) { console.log('end: ' + String(e && e.message)); }
})().catch(e => { console.error(e && e.stack || e); process.exit(1); });
