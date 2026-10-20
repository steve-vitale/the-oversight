#!/usr/bin/env node
// vgearseat-transcripts-20261020.js — sense-testing probe for sim-vgearseat.
// Re-runs a sweep seed (deterministic) with Game.say wrapped and captures
// SAY lines around the run's wave-5 unlock window (or the first veterans-bar
// fill / first villager wave-4 kill if wave 5 was never reached), for a
// human read of whether staged villagers behave like people — or stat-bags
// (SENSE-TESTING LAW).
// READ-ONLY. Writes evidence/2026-10-20/vgearseat-transcripts/<arm>-<policy>-s<seed>.txt.
// Usage: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 \
//   WINDEFER=1 NODEWITNESS=1 KILLDISC=1 \
//   POLICY=leadfeast ARM=vgear SEED=64301 node scripts/vgearseat-transcripts-20261020.js
// (SEATDRIVE must be UNSET — default-on drives the seat; VGEAR=1 required
// when ARM=vgear.)
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');

const ENV_REQ = ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER', 'NODEWITNESS', 'KILLDISC'];
for (const k of ENV_REQ) if (process.env[k] !== '1') { console.error(`STOP: ${k}=1 required.`); process.exit(2); }
if ('SEATDRIVE' in process.env) { console.error('STOP: SEATDRIVE must be UNSET (default-on).'); process.exit(2); }
const POLICY = process.env.POLICY || 'leadfeast';
const ARM = process.env.ARM || 'vgear';
const SEED = parseInt(process.env.SEED || '64301', 10);
if (ARM === 'vgear' && process.env.VGEAR !== '1') { console.error('STOP: VGEAR=1 required for ARM=vgear.'); process.exit(2); }

const EVIDSEED = path.join(REPO, 'evidence', '2026-10-20', 'perseed-vgearseat',
  `${ARM}-${POLICY}${ARM === 'vgear' ? '-vgear' : ''}-s${SEED}.json`);
if (!fs.existsSync(EVIDSEED)) { console.error(`STOP: sweep JSON missing: ${EVIDSEED}`); process.exit(2); }
const seedRec = JSON.parse(fs.readFileSync(EVIDSEED, 'utf8'));
// KILL-PROTOCOL INFO-SKIP: if the layer is deleted (VGEARSEAT_KILLED=1 set by
// the coordinator after a killed arm), this probe exits green with an
// INFO-SKIP instead of FATAL-ing.
let VSE = null;
try { VSE = require(path.join(REPO, 'scripts', 'policies', 'vgearseat')); }
catch (e) {
  if (process.env.VGEARSEAT_KILLED === '1') {
    console.log('INFO-SKIP: scripts/policies/vgearseat.js deleted per kill protocol (sim-vgearseat NO-GO) — transcript probe not applicable.');
    process.exit(0);
  }
  throw e;
}
const kills = (seedRec.w4killsDetail || []).slice().sort((a, b) => a.d - b.d);
const vill = kills.find(k => k.by && k.via && k.via !== 'player');
// Anchor: the first day the run sat at maxWave 5 if known (we only stored
// maxWave, not the unlock day), else the first villager wave-4 kill, else
// the first wave-4 kill, else the run tail.
const anchor = vill ? vill.d : (kills.length ? kills[0].d : Math.max(1, (seedRec.gameDays || 60) - 15));
const keep = new Set();
for (let d = anchor - 2; d <= anchor + 5; d++) if (d >= 1) keep.add(d);

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));

(async () => {
  const policy = ARM === 'vgear' ? VSE.armedFor(POLICY) : VSE.seatStackFor(POLICY);
  const { Game } = await loadGame({ seed: SEED, mode: 'vgearseat-xscript', fullTelemetry: false });
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
  const dir = path.join(REPO, 'evidence', '2026-10-20', 'vgearseat-transcripts');
  fs.mkdirSync(dir, { recursive: true });
  const fp = path.join(dir, `${ARM}-${POLICY}-s${SEED}.txt`);
  const head = `# ${ARM} ${POLICY} s${SEED} — window d${anchor - 2}..d${anchor + 5} around ` +
    (vill ? `VILLAGER wave-4 kill (${vill.mid} by ${vill.byName} via=${vill.via} d${vill.d})` :
      kills.length ? `first wave-4 kill (${kills[0].mid} d${kills[0].d})` : 'run tail (no wave-4 kills)') +
    ` | maxWave=${seedRec.maxWave} national=${seedRec.national} table=${seedRec.table} won=${seedRec.won} w5vetsMax=${seedRec.w5vetsMax}\n\n`;
  fs.writeFileSync(fp, head + lines.join('\n') + '\n');
  console.log(`wrote ${fp} (${lines.length} lines, anchor d${anchor})`);
})().catch(e => { console.error('FATAL', e && e.stack ? e.stack : e); process.exit(1); });
