#!/usr/bin/env node
// transcript-fightopen4-20261018.js — SAY-line transcript side-run for
// sim-fightopen4 (SENSE-TESTING LAW): one 130d run on leadfeast-s52005
// (the wave-4 unlock seed, FIGHTOPEN=1) capturing Game.say lines around
// the unlock/learning window (d~105-119).
//
// Usage: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 \
//   SEATDRIVE=0 VETREL=1 REPOSITION=1 NODEWITNESS=1 node scripts/transcript-fightopen4-20261018.js
'use strict';
const fs = require('fs');
const path = require('path');
const TF = require('./policies/tribfloor');
const VR = require('./policies/vetrel');
const RP = require('./policies/reposition');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

const SEED = parseInt(process.env.SEED || '52005', 10);
const DAYS = parseInt(process.env.DAYS || '130', 10);

(async () => {
  process.env.WINPURSUIT = '1'; process.env.WINDEFER = '1';
  process.env.FIGHTOPEN = '1';
  const base = TF.leadfeast;
  const rp = RP.withReposition(base, 'fo4t-rp', 'transcript');
  const policy = VR.withVetrel(rp, 'fo4t-rp-vetrel', 'transcript');
  const { Game } = await loadGame({ seed: SEED, mode: 'fightopen4t', fullTelemetry: false });
  await setupGame(Game);
  const lines = [];
  const oSay = Game.say.bind(Game);
  Game.say = function (x) { try { const d = (Game.state && Game.state.scholar && Game.state.scholar.day) | 0; lines.push(`[d${d}] ${x}`); } catch (e) {} return oSay(x); };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  delete process.env.FIGHTOPEN;
  const dir = path.join(__dirname, '..', 'evidence', '2026-10-18', 'fightopen4-transcripts');
  fs.mkdirSync(dir, { recursive: true });
  const fp = path.join(dir, `readiness-leadfeast-s${SEED}.txt`);
  const head = `# fightopen4 transcript — readiness/leadfeast seed ${SEED} (${DAYS}d, FIGHTOPEN=1)\n# end=${result.endReason} say-lines=${lines.length}\n\n`;
  fs.writeFileSync(fp, head + lines.join('\n') + '\n');
  console.log(`wrote ${fp} (${lines.length} say lines)`);
})().catch(e => { console.error('TRANSCRIPT CRASH:', e); process.exit(2); });
