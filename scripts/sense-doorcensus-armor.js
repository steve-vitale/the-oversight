#!/usr/bin/env node
// sense-doorcensus-armor.js — SENSE-TESTING for sim-doorcensus-armor: re-runs
// a seed with LIVE narration (loadGame {narration:true} — the harness's
// sanctioned path) and prints the System's voiced lines across the unlock
// window for judgment: did the readiness release beat land, did the fifth
// draft announce itself, does the window read as the village's fate changing?
//
// SENSE-TESTING LAW: the reader judges meaning, coherence, relevance —
// never the silenced sweep capture.
//
// This is a SEPARATE diagnostic run, not part of any corpus — no DET claim
// attaches to it. Substrate: the doorcensus-armor pinned substrate with
// ARMORYDRIVE=1 + ARMORVILLAGE=1 (the armed leg).
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1 \
//   ARMORYDRIVE=1 ARMORVILLAGE=1 SEED=65515 DAYS=180 FROMDAY=135 node scripts/sense-doorcensus-armor.js
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const AV = require(path.join(REPO, 'scripts', 'policies', 'armorvillage'));

const SEED = parseInt(process.env.SEED || '65515', 10);
const DAYS = parseInt(process.env.DAYS || '180', 10);
const FROMDAY = parseInt(process.env.FROMDAY || '55', 10);
const LINE_RE = /fifth draft|fourth draft|producers|talent has been released|not bought with bread alone|stays in the wings|RATINGS ARE UP|not ready|armor the village|weapons in hands|cancellation|editor|rerun|spoiler|timeslot|nielsen|finale|network note|galactic table|table waiting|the table|you win|won |victory|died|funeral|has fallen|herald|titan/i;

(async () => {
  const base = AV.armedFor('leadfeast');
  const { Game } = await loadGame({ seed: SEED, mode: 'doorcensus-armor-sense', fullTelemetry: false, narration: true });
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
  console.log(`=== sense-doorcensus-armor: seed=${SEED} armed (narration on, ${lines.length} matching voiced lines from d${FROMDAY}) ===`);
  for (const l of lines) console.log(l);
  try {
    const st = Game.state || {};
    const uw = (typeof Game.unlockedWave === 'function') ? Game.unlockedWave() : null;
    console.log(`end: day=${(st.scholar || {}).day} over=${!!Game.over} unlockedWave=${uw}`);
  } catch (e) { console.log('end: ' + String(e && e.message)); }
})().catch(e => { console.error(e && e.stack || e); process.exit(1); });
