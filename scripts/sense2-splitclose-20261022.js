#!/usr/bin/env node
// sense2-splitclose-20261022.js — one-off follow-up to sense-splitclose: prints
// the narration AROUND each wave-4 fight END (the close), not just the first
// 60 lines of the day. SENSE-TESTING LAW: do companions read as people
// closing a fight?
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 \
//   ARMORYDRIVE=1 KILLDISC=1 SPLITCLOSE=1 SEED=65612 BASE=belong \
//   node scripts/sense2-splitclose-20261022.js
'use strict';
const path = require('path');
const REPO = process.env.REPO || path.join(__dirname, '..');
for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'ARMORYDRIVE', 'KILLDISC', 'SPLITCLOSE']) {
  if (process.env[k] !== '1') { console.error(`SENSE2 STOP: ${k}=1 required.`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('SENSE2 STOP: SEATDRIVE=0 required.'); process.exit(2); }

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const SC = require(path.join(REPO, 'scripts', 'policies', 'splitclose'));

const SEED = parseInt(process.env.SEED || '65612', 10);
const BASE = (process.env.BASE || 'belong').toLowerCase().startsWith('b') ? 'belongfeast' : 'leadfeast';

function waveOf(Game, mid) {
  try { const d = ((Game.data || {}).monsters || []).find(x => x && x.id === mid); return (d && d.wave) || 1; } catch (e) { return 1; }
}
function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

async function main() {
  const policy = SC.armedFor(BASE);
  const { Game } = await loadGame({ seed: SEED, mode: 'splitclose-sense2', fullTelemetry: false });
  const lines = [];
  const oSay = Game.say ? Game.say.bind(Game) : null;
  if (typeof Game.say === 'function') {
    Game.say = function (x) {
      try { const s = String(x == null ? '' : x); if (s) lines.push(`d${gday(Game)} ${s.slice(0, 320)}`); } catch (e) {}
      return oSay.apply(this, arguments);
    };
  }
  const ends = [];
  let cur = null;
  const oStart = Game.startCombat;
  if (typeof oStart === 'function') {
    Game.startCombat = function (mid) {
      const r = oStart.apply(this, arguments);
      try {
        if ((waveOf(Game, mid) | 0) === 4) cur = { day: gday(Game), mid, startLine: lines.length };
        else cur = null;
      } catch (e) { cur = null; }
      return r;
    };
  }
  const oRWK = Game.recordWaveKill;
  if (typeof oRWK === 'function') {
    Game.recordWaveKill = function (mid, vid, via) {
      try {
        if ((waveOf(Game, mid) | 0) === 4 && cur) ends.push({ ...cur, endLine: lines.length, by: vid, via });
      } catch (e) {}
      return oRWK.apply(this, arguments);
    };
  }
  await setupGame(Game);
  await quietLog(async () => { await runDays(Game, policy, { days: 180, manifest: undefined, sampleEvery: 30 }); });
  console.log(`sense2: seed=${SEED} base=${BASE} wave-4 kills=${ends.length}`);
  for (const e of ends) {
    console.log(`\n=== d${e.day} ${e.mid} KILL by=${e.by} via=${e.via} (last ${Math.min(35, e.endLine - e.startLine)} lines of fight) ===`);
    for (const l of lines.slice(Math.max(e.startLine, e.endLine - 35), e.endLine)) console.log(`  ${l}`);
  }
}
main().catch(e => { console.error('SENSE2 FAIL: ' + (e && e.stack || e)); process.exit(1); });
