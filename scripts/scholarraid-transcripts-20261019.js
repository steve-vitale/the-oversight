#!/usr/bin/env node
// scholarraid-transcripts-20261019.js — sense-testing probe for sim-scholarraid.
// Re-runs a sweep seed (deterministic) with Game.say wrapped AND
// Game.sysSay restored (the w5census probe-artifact lesson) and captures
// SAY lines around the run's raid events, for a human read of the
// doctrine: do defenders behave sensibly, does hold-Haven read as real
// defense or cowardice, do villagers react to the alarm like people?
// (SENSE-TESTING LAW.)
//
// Capture set: {first shelter day ±2d} ∪ {each raid-channel death day ±2d}
// (armed arm), or {each raid-channel death day ±2d} (control).
// READ-ONLY. Writes evidence/2026-10-19/scholarraid-transcripts/<arm>-<policy>-s<seed>.txt.
// Usage: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 \
//   WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 VETREL=1 \
//   ARM=armed POLICY=leadfeast SEED=63801 node scripts/scholarraid-transcripts-20261019.js
'use strict';
const fs = require('fs');
const path = require('path');
const SR_probe = require('./probe-scholarraid-20261019');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { attribute } = require('./analyze-windowsurvive-20261019');

const ENV_REQ = ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER', 'NODEWITNESS', 'VETREL'];
for (const k of ENV_REQ) if (process.env[k] !== '1') { console.error(`STOP: ${k}=1 required.`); process.exit(2); }
if (process.env.SEATDRIVE !== '0') { console.error('STOP: SEATDRIVE=0 required.'); process.exit(2); }
const ARM = (process.env.ARM || 'armed').toLowerCase();
if (!['control', 'armed'].includes(ARM)) { console.error('STOP: ARM=control|armed required.'); process.exit(2); }
const POLICY = process.env.POLICY || 'leadfeast';
const SEED = parseInt(process.env.SEED || '63801', 10);
const EVIDSEED = path.join(__dirname, '..', 'evidence', '2026-10-19', 'perseed-scholarraid', ARM, POLICY, `s${SEED}.json`);
if (!fs.existsSync(EVIDSEED)) { console.error(`STOP: sweep JSON missing: ${EVIDSEED}`); process.exit(2); }
const seedRec = JSON.parse(fs.readFileSync(EVIDSEED, 'utf8'));
const attr = attribute(seedRec);

const keep = new Set();
function addWindow(day, radius) {
  for (let d = day - radius; d <= day + radius; d++) if (d >= 1) keep.add(d);
}
// Raid-channel death days.
const raidDeaths = (((seedRec.deathsAttributed || {}).attributed) || []).filter(d => d.channel === 'raid');
for (const d of raidDeaths) addWindow(d.day, 2);
// Armed arm: the first shelter day (the alarm + muster beat).
let firstShelter = null;
try {
  const sh = ((seedRec.srLedger || {}).shelters) || [];
  if (sh.length) { firstShelter = sh[0].day; addWindow(firstShelter, 2); }
} catch (e) {}
if (!keep.size) { for (let d = 1; d <= 15; d++) keep.add(d); }

(async () => {
  if (ARM === 'armed') process.env.SCHOLARRAID = '1'; else delete process.env.SCHOLARRAID;
  const policy = SR_probe.policyFor(POLICY, ARM);
  const { Game } = await loadGame({ seed: SEED, mode: 'scholarraid', fullTelemetry: false });
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
  delete process.env.SCHOLARRAID;
  const dir = path.join(__dirname, '..', 'evidence', '2026-10-19', 'scholarraid-transcripts');
  fs.mkdirSync(dir, { recursive: true });
  const fp = path.join(dir, `${ARM}-${POLICY}-s${SEED}.txt`);
  const rdLines = raidDeaths.map(d => `d${d.day} ${d.name} (${d.player ? 'scholar' : 'villager'}) — ${d.cause}/${d.rule}`).join('; ');
  const head = `# scholarraid transcript — ${ARM}/${POLICY} seed ${SEED}\n` +
    `# end=${attr.endReason}:d${attr.endDay}, firstShelter=${firstShelter == null ? '—' : 'd' + firstShelter}\n` +
    `# raid deaths: ${raidDeaths.length}${rdLines ? ' — ' + rdLines : ''}\n` +
    `# say-lines captured d[${[...keep].sort((a, b) => a - b).join(',')}]: ${lines.length}\n\n`;
  fs.writeFileSync(fp, head + lines.join('\n') + '\n');
  console.log(`wrote ${fp} (${lines.length} say lines)`);
})().catch(e => { console.error('TRANSCRIPT CRASH:', e); process.exit(2); });
