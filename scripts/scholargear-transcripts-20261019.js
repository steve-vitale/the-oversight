#!/usr/bin/env node
// scholargear-transcripts-20261019.js — sense-testing probe for sim-scholargear.
// Re-runs a sweep seed with SCHOLARGEAR=1 (deterministic — DET-pinned),
// Game.say wrapped AND Game.sysSay restored (the w5census probe-artifact
// lesson), capturing SAY lines for a human read of the scholar gear-day
// (SENSE-TESTING LAW):
//   - does the dawn gear-up read as sensible preparation?
//   - does the scholar wear sensible gear (their own, best available)?
//   - does the fiction hold across mantles (successor's own kit)?
// READ-ONLY. Writes evidence/2026-10-19/scholargear-transcripts/<policy>-s<seed>.txt
// (full SAY stream) + <policy>-s<seed>-gear.txt (gear/weight-filtered).
// Usage: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 \
//   WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 VETREL=1 SCHOLARGEAR=1 \
//   POLICY=leadfeast SEED=63801 node scripts/scholargear-transcripts-20261019.js
'use strict';
const fs = require('fs');
const path = require('path');
const AP = require('./probe-scholargear-20261019');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

const ENV_REQ = ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER', 'NODEWITNESS', 'VETREL'];
for (const k of ENV_REQ) if (process.env[k] !== '1') { console.error(`STOP: ${k}=1 required.`); process.exit(2); }
if (process.env.SEATDRIVE !== '0') { console.error('STOP: SEATDRIVE=0 required.'); process.exit(2); }
if (process.env.SCHOLARGEAR !== '1') { console.error('STOP: SCHOLARGEAR=1 required (armed-arm transcripts).'); process.exit(2); }
const POLICY = process.env.POLICY || 'leadfeast';
const SEED = parseInt(process.env.SEED || '63801', 10);
const EVIDSEED = path.join(__dirname, '..', 'evidence', '2026-10-19', 'perseed-scholargear', 'armed', POLICY, `s${SEED}.json`);
if (!fs.existsSync(EVIDSEED)) { console.error(`STOP: armed sweep JSON missing: ${EVIDSEED}`); process.exit(2); }
const seedRec = JSON.parse(fs.readFileSync(EVIDSEED, 'utf8'));

const ARMOR_RE = /☀️ Dawn gear|armor|armour|too heavy|carrying .*kg|raid|RAID|wear|wears|wearing|equipped|unarmored|naked|crossbow|jacket|bark_armor|leather/i;

(async () => {
  const policy = AP.policyFor(POLICY);
  const { Game } = await loadGame({ seed: SEED, mode: 'scholargear', fullTelemetry: false });
  await setupGame(Game);
  const lines = [];
  const osay = Game.say.bind(Game);
  Game.say = function (x) {
    try {
      const day = (Game.state && Game.state.scholar && Game.state.scholar.day) | 0;
      lines.push(`[d${day}] SAY: ${String(x).slice(0, 700)}`);
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
  const dir = path.join(__dirname, '..', 'evidence', '2026-10-19', 'scholargear-transcripts');
  fs.mkdirSync(dir, { recursive: true });
  const sg = seedRec.sg || {};
  const head = `# scholargear transcript — w5path-vetrel1-scholargear/armed/${POLICY} seed ${SEED}\n` +
    `# sgDays=${sg.days} wornNew=${sg.equippedNew} stashFetched=${sg.stashFetched} tooHeavy=${seedRec.tooHeavy}\n` +
    `# end=${seedRec.endReason}:d${seedRec.gameDays} wave=${seedRec.maxWave} national=${seedRec.national} table=${seedRec.table}\n\n`;
  fs.writeFileSync(path.join(dir, `${POLICY}-s${SEED}.txt`), head + lines.join('\n') + '\n');
  const filtered = lines.filter(l => ARMOR_RE.test(l));
  fs.writeFileSync(path.join(dir, `${POLICY}-s${SEED}-armor.txt`),
    head + `# armor/raid/weight-filtered: ${filtered.length}/${lines.length} lines\n\n` + filtered.join('\n') + '\n');
  console.log(`transcript ${POLICY}-s${SEED}: ${lines.length} lines, ${filtered.length} armor-relevant`);
})().catch(e => { console.error('TRANSCRIPT FATAL:', e && e.message); process.exit(1); });
