#!/usr/bin/env node
// sense-heraldsplit-20261021.js — SENSE-TESTING for sim-heraldsplit: re-runs
// a corpus seed with LIVE narration (loadGame {narration:true} — the
// harness's sanctioned path) and prints the voiced lines around (a) a
// herald encounter (the refusal) and (b) a wave-4 monster fight, for
// judgment against the instrument's census: do the villagers' approaches
// to a wave-4 fight read like people (dread, bravado, reluctance)?
//
// This is a SEPARATE diagnostic run, not part of the 16-run corpus — no
// DET claim attaches to it.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 VGEAR=1 KILLDISC=1 \
//   SEED=64871 POLICY=leadfeast DAYS=180 node scripts/sense-heraldsplit-20261021.js
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const VCE = require('./policies/vgearconfirm');
const HS = require('./instr-heraldsplit-20261021');

const SEED = parseInt(process.env.SEED || '64871', 10);
const POLICY = (process.env.POLICY || 'leadfeast').toLowerCase();
const DAYS = parseInt(process.env.DAYS || '180', 10);

const LINE_RE = /herald|⛔|does not notice you|muster|congregation|strike|influencer|audit|reunion|suburb|eulogy|algorithm|eater|omen|titan|wave.?4|fourth draft|mirror draft/i;

(async () => {
  const { Game } = await loadGame({ seed: SEED, mode: 'heraldsplit-sense', fullTelemetry: false, narration: true });
  await setupGame(Game);
  const lines = [];
  const osay = Game.say.bind(Game);
  Game.say = function (x) {
    try {
      const s = String(x);
      if (LINE_RE.test(s)) {
        const day = ((Game.state || {}).scholar || {}).day || 0;
        lines.push(`[d${day}] ${s.replace(/\s+/g, ' ').slice(0, 500)}`);
      }
    } catch (e) {}
    return osay.apply(this, arguments);
  };
  const t = { kills: [], engagements: [], fieldFights: [], spawns: [], tbOutcomes: {}, census: [], dmg: {}, refusals: [], instrumentErrors: [] };
  const uninstall = HS.install(Game, t);
  const policy = VCE.armedFor(POLICY);
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  const attr = HS.attributeRun(Game, t);
  try { uninstall(); } catch (e) {}
  console.log(`sense ${POLICY}/s${SEED}: end=${result.endReason} days=${result.days} maxWave=${result.maxWaveUnlocked}`);
  console.log(`census: ${attr.units.length} units, ${attr.unexplained} unexplained, heraldEng=${attr.units.filter(u => u.kind === 'engagement' && u.cls === 'herald').length}`);
  console.log(`\n${lines.length} voiced herald/wave-4 lines:`);
  for (const l of lines) console.log('  ' + l);
})().catch(e => { console.error('FATAL', e && e.stack ? e.stack : e.message); process.exit(1); });
