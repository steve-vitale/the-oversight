#!/usr/bin/env node
// sense-feastdisc-confirm-20261022.js — SENSE-TESTING LAW probe for the
// sim-feastdiscipline CONFIRM. Re-runs a chosen armed config
// deterministically with Game.say wrapped, and dumps the narration window
// around the kill. READ-ONLY: stdout only, no writes.
//
// Usage: FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 \
//        KILLDISC=1 ARMORYDRIVE=1 FEASTDISC=1 \
//        SEED=66111 BASE=leadfeast DSTART=1 DEND=180 \
//        node scripts/sense-feastdisc-confirm-20261022.js
'use strict';
const path = require('path');
const REPO = process.env.REPO || path.join(__dirname, '..');
for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'KILLDISC', 'ARMORYDRIVE', 'FEASTDISC']) {
  if (process.env[k] !== '1') { console.error(`STOP: ${k}=1 required.`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('STOP: SEATDRIVE=0 required.'); process.exit(2); }

const SEED = parseInt(process.env.SEED || '66111', 10);
const BASE = process.env.BASE || 'leadfeast';
const DSTART = parseInt(process.env.DSTART || '1', 10);
const DEND = parseInt(process.env.DEND || '180', 10);
const NAMEF = process.env.NAMEF || '';

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const FD = require(path.join(REPO, 'scripts', 'policies', 'feastdiscipline'));

(async () => {
  const { Game } = await loadGame({ seed: SEED, mode: 'feastdisc-confirm-sense', fullTelemetry: false });
  await setupGame(Game);
  const lines = [];
  const osay = Game.say.bind(Game);
  const rx = new RegExp(NAMEF || 'FEAST|feast|veteran|falls|kill|draw', 'i');
  Game.say = function (x) {
    try {
      const d = (Game.state && Game.state.scholar && Game.state.scholar.day) | 0;
      const s = String(x).replace(/\s+/g, ' ');
      if (rx.test(s)) lines.push(`[d${d}] ${s.slice(0, 500)}`);
    } catch (e) {}
    return osay.apply(this, arguments);
  };
  await quietLog(async () => { await runDays(Game, FD.disciplinedFor(BASE), { days: DEND + 1 }); });
  for (const l of lines) {
    const m = /^\[d(\d+)\]/.exec(l);
    if (m && +m[1] >= DSTART && +m[1] <= DEND) console.log(l);
  }
})().catch(e => { console.error('SENSE FATAL', e); process.exit(1); });
