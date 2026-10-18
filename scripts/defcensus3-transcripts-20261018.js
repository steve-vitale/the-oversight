#!/usr/bin/env node
// defcensus3-transcripts-20261018.js — sense-testing side-run for
// sim-defercensus2b: captures SAY lines (villager dialogue + narration) from
// the census policy substrates for human sense-reads. READ-ONLY.
// Runs one policy x seed x substrate, fullTelemetry, wraps G.say to capture
// every say line with its day. Writes a transcript txt to evidence.
// Usage: SUBSTRATE=courtship POLICY=leadfeast SEED=51331 DAYS=60 SEATDRIVE=0
//        FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 node scripts/defcensus3-transcripts-20261018.js
'use strict';
const fs = require('fs');
const path = require('path');
const TF = require('./policies/tribfloor');
const VR = require('./policies/vetrel');
const RP = require('./policies/reposition');
const WD = require('./policies/windefer');
const SD = require('./policies/seatdrive');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

const SUBSTRATE = process.env.SUBSTRATE || 'courtship';
const POLICY = process.env.POLICY || 'leadfeast';
const SEED = parseInt(process.env.SEED || '51331', 10);
const DAYS = parseInt(process.env.DAYS || '60', 10);

function policyFor() {
  const base = POLICY === 'leadfeast' ? TF.leadfeast : TF.belongfeast;
  const tag = POLICY === 'leadfeast' ? 'lead' : 'belong';
  if (SUBSTRATE === 'courtship') return base;
  const rp = RP.withReposition(base, `${tag}-rp`, `${POLICY} + reposition`);
  const vet = VR.withVetrel(rp, `${tag}-vetrel-rp`, `${POLICY} + reposition + VETREL`);
  if (SUBSTRATE === 'readiness') return vet;
  const wd = WD.withWinDefer(vet, `${tag}-windefer`, `${POLICY} + readiness + windefer`);
  return SD.withSeatDrive(wd, `${tag}-windefer`, `${POLICY} + winseat`);
}

(async () => {
  process.env.WINPURSUIT = '1'; process.env.WINDEFER = '1';
  const policy = policyFor();
  const { Game } = await loadGame({ seed: SEED, mode: 'defcensus3-xscript', fullTelemetry: true });
  await setupGame(Game);
  const lines = [];
  const osay = Game.say.bind(Game);
  Game.say = function (x) {
    try {
      const day = (Game.state && Game.state.scholar && Game.state.scholar.day) | 0;
      lines.push(`[d${day}] SAY: ${String(x).slice(0, 600)}`);
    } catch (e) {}
    return osay(x);
  };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  delete process.env.WINDEFER;
  const dir = path.join(__dirname, '..', 'evidence', '2026-10-18', 'defercensus2b-transcripts');
  fs.mkdirSync(dir, { recursive: true });
  const fp = path.join(dir, `${SUBSTRATE}-${POLICY}-s${SEED}.txt`);
  const head = `# defercensus2b transcript — ${SUBSTRATE}/${POLICY} seed ${SEED} (${DAYS}d)\n# days=${result.gameDays} end=${result.endReason} say-lines=${lines.length}\n\n`;
  fs.writeFileSync(fp, head + lines.join('\n') + '\n');
  console.log(`wrote ${fp} (${lines.length} say lines, ${result.gameDays}d)`);
})().catch(e => { console.error('TRANSCRIPT CRASH:', e); process.exit(2); });
