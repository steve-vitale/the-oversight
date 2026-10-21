#!/usr/bin/env node
// vgearconfirm-transcripts-20261021.js — sense-testing probe for sim-vgearconfirm.
// Re-runs a sweep seed (deterministic) with Game.say wrapped and captures
// SAY lines around the run's first veterans-bar fill (or first villager
// wave-4 kill, else the first wave-4 kill, else the run tail), for a human
// read of whether staged villagers behave like people — or stat-bags
// (SENSE-TESTING LAW).
// READ-ONLY. Writes evidence/2026-10-21/vgearconfirm-transcripts/<arm>-<policy>-s<seed>.txt.
// Usage: FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 KILLDISC=1 \
//   POLICY=leadfeast ARM=vgear VGEAR=1 SEED=64701 node scripts/vgearconfirm-transcripts-20261021.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'KILLDISC']) {
  if (process.env[k] !== '1') { console.error(`STOP: ${k}=1 required (winning substrate).`); process.exit(2); }
}
for (const k of ['SUCCGRACE', 'RAIDDENSITY', 'NODEWITNESS', 'FULLSEAT']) {
  if (k in process.env) { console.error(`STOP: ${k} must be unset (winning substrate).`); process.exit(2); }
}
const POLICY = process.env.POLICY || 'leadfeast';
const ARM = process.env.ARM || 'vgear';
const SEED = parseInt(process.env.SEED || '64701', 10);
if (ARM === 'vgear' && process.env.VGEAR !== '1') { console.error('STOP: VGEAR=1 required for ARM=vgear.'); process.exit(2); }
if (ARM === 'control' && ('VGEAR' in process.env)) { console.error('STOP: VGEAR must be unset for ARM=control.'); process.exit(2); }

const EVIDSEED = path.join(REPO, 'evidence', '2026-10-21', 'perseed-vgearconfirm',
  `${ARM}-${POLICY}${ARM === 'vgear' ? '-vgear' : ''}-s${SEED}.json`);
if (!fs.existsSync(EVIDSEED)) { console.error(`STOP: sweep JSON missing: ${EVIDSEED}`); process.exit(2); }
const seedRec = JSON.parse(fs.readFileSync(EVIDSEED, 'utf8'));

let VCE = null;
try { VCE = require(path.join(REPO, 'scripts', 'policies', 'vgearconfirm')); }
catch (e) {
  if (process.env.VGEARCONFIRM_KILLED === '1') {
    console.log('INFO-SKIP: scripts/policies/vgearconfirm.js deleted per kill protocol (sim-vgearconfirm NO-GO) — transcript probe not applicable.');
    process.exit(0);
  }
  throw e;
}
const kills = (seedRec.w4killsDetail || []).slice().sort((a, b) => a.d - b.d);
const vill = kills.find(k => k.by && k.via && k.via !== 'player' && k.via !== 'scholar');
// Anchor: first villager wave-4 kill (the veteran-manufacturing moment), else
// first wave-4 kill, else the run tail.
const anchor = vill ? vill.d : (kills.length ? kills[0].d : Math.max(1, (seedRec.gameDays || 60) - 15));
const keep = new Set();
for (let d = anchor - 2; d <= anchor + 5; d++) if (d >= 1) keep.add(d);

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));

(async () => {
  const policy = ARM === 'vgear' ? VCE.armedFor(POLICY) : VCE.seatStackFor(POLICY);
  const { Game } = await loadGame({ seed: SEED, mode: 'vgearconfirm-xscript', fullTelemetry: false });
  await setupGame(Game);
  const lines = [];
  const osay = Game.say.bind(Game);
  Game.say = function (x) {
    try {
      const day = (Game.state && Game.state.scholar && Game.state.scholar.day) | 0;
      if (keep.has(day)) lines.push(`[d${day}] SAY: ${String(x).slice(0, 700)}`);
    } catch (e) {}
    return osay.apply(this, arguments);
  };
  Game.sysSay = function (text) {
    try {
      if (!((Game.state || {}).systemArrived)) return;
      const shown = String(text == null ? '' : text).replace(/^📺\s*/, '');
      return Game.say(`📺 SYSTEM: "${shown}"`);
    } catch (e) {}
  };
  await quietLog(async () => { await runDays(Game, policy, { days: 180, manifest: undefined, sampleEvery: 30 }); });
  const dir = path.join(REPO, 'evidence', '2026-10-21', 'vgearconfirm-transcripts');
  fs.mkdirSync(dir, { recursive: true });
  const fp = path.join(dir, `${ARM}-${POLICY}-s${SEED}.txt`);
  const head = `# ${ARM} ${POLICY} s${SEED} — window d${anchor - 2}..d${anchor + 5} around ` +
    (vill ? `VILLAGER wave-4 kill (${vill.mid} by ${vill.byName} via=${vill.via} d${vill.d})` :
      kills.length ? `first wave-4 kill (${kills[0].mid} d${kills[0].d})` : 'run tail (no wave-4 kills)') +
    ` | maxWave=${seedRec.maxWave} national=${seedRec.national} table=${seedRec.table} won=${seedRec.won} w5vetsMax=${seedRec.w5vetsMax}\n\n`;
  fs.writeFileSync(fp, head + lines.join('\n') + '\n');
  console.log(`wrote ${fp} (${lines.length} lines, anchor d${anchor})`);
})().catch(e => { console.error('FATAL', e && e.stack ? e.stack : e); process.exit(1); });
