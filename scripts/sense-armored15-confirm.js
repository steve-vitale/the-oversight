#!/usr/bin/env node
// sense-armored15-confirm.js — ONE armed 60d run with say-line capture for the
// SENSE-TESTING LAW read of the armor beats (gift/deposit/draw).
// Reads the transcript for meaning, not counts.
// Usage: FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 \
//   KILLDISC=1 ARMORYDRIVE=1 ARMORVILLAGE=1 SEED=68303 POLICY=leadfeast \
//   node scripts/sense-armored15-confirm.js
'use strict';
const path = require('path');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const AV = require(path.join(REPO, 'scripts', 'policies', 'armorvillage'));
const AD = require(path.join(REPO, 'scripts', 'policies', 'armorydrive'));

const SEED = parseInt(process.env.SEED || '68303', 10);
const POLICY = process.env.POLICY || 'leadfeast';

(async () => {
  const { Game } = await loadGame({ seed: SEED, mode: 'armored15-sense', fullTelemetry: false });
  const sayLines = [];
  const oSay = Game.say.bind(Game);
  Game.say = function (...a) {
    try {
      const day = ((Game.state || {}).scholar || {}).day || 0;
      sayLines.push(`[d${day}] SAY: ${a.map(String).join(' ')}`);
    } catch (e) {}
    return oSay(...a);
  };
  const base = AV.armedFor(AD.normBase(POLICY));
  await setupGame(Game);
  const result = await quietLog(async () => runDays(Game, base, { days: 60, manifest: undefined, sampleEvery: 30 }));
  const kw = /armor|armory|pile|gift|donat|equip|straps|fits|wear/i;
  const hits = sayLines.filter(l => kw.test(l));
  console.log(`SEED ${SEED} POLICY ${POLICY} days=${(Game.state.scholar || {}).day} end=${result.endReason} sayLines=${sayLines.length} armorHits=${hits.length}`);
  for (const l of hits.slice(0, 60)) console.log(l);
})().catch(e => { console.error('SENSE FAIL:', e); process.exit(2); });
