#!/usr/bin/env node
// sense3-tierband-20261023.js — tier-5 fight narration regardless of
// outcome (the bypass route's fights are all lost — no kills to hook).
// Captures the last 40 narration lines before each wave-4 TB fight END,
// with the overtime tier sampled at fight start.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 \
//   ARMORYDRIVE=1 KILLDISC=1 SPLITCLOSE=1 TIERBAND=1 SEED=65611 BASE=lead \
//   node scripts/sense3-tierband-20261023.js
'use strict';
const path = require('path');
const REPO = process.env.REPO || path.join(__dirname, '..');
for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'ARMORYDRIVE', 'KILLDISC', 'SPLITCLOSE', 'TIERBAND']) {
  if (process.env[k] !== '1') { console.error(`SENSE3 STOP: ${k}=1 required.`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('SENSE3 STOP: SEATDRIVE=0 required.'); process.exit(2); }

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const TB = require(path.join(REPO, 'scripts', 'policies', 'tierband'));

const SEED = parseInt(process.env.SEED || '65611', 10);
const BASE = (process.env.BASE || 'lead').toLowerCase().startsWith('b') ? 'belongfeast' : 'leadfeast';

function waveOf(Game, mid) {
  try { const d = ((Game.data || {}).monsters || []).find(x => x && x.id === mid); return (d && d.wave) || 1; } catch (e) { return 1; }
}
function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

async function main() {
  const policy = TB.armedFor(BASE);
  const { Game } = await loadGame({ seed: SEED, mode: 'tierband-sense3', fullTelemetry: false });
  const lines = [];
  const oSay = Game.say ? Game.say.bind(Game) : null;
  if (typeof Game.say === 'function') {
    Game.say = function (x) {
      try { const s = String(x == null ? '' : x); if (s) lines.push(`d${gday(Game)} ${s.slice(0, 340)}`); } catch (e) {}
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
        if ((waveOf(Game, mid) | 0) === 4) {
          let tier = 0;
          try { tier = (typeof Game.overtimeTier === 'function') ? (Game.overtimeTier() | 0) : 0; } catch (e) {}
          cur = { day: gday(Game), mid, tier, startLine: lines.length };
        } else cur = null;
      } catch (e) { cur = null; }
      return r;
    };
  }
  const oEnd = Game.tbEnd;
  if (typeof oEnd === 'function') {
    Game.tbEnd = function (result) {
      const r = oEnd.apply(this, arguments);
      try {
        if (cur) ends.push({ ...cur, endLine: lines.length, outcome: String(result === undefined || result === null ? 'unknown' : result) });
      } catch (e) {}
      cur = null;
      return r;
    };
  }
  await setupGame(Game);
  await quietLog(async () => { await runDays(Game, policy, { days: 180, manifest: undefined, sampleEvery: 30 }); });
  const hi = ends.filter(e => e.tier >= 5);
  console.log(`sense3: seed=${SEED} base=${BASE} wave-4 fight ends=${ends.length} tier>=5 ends=${hi.length}`);
  for (const e of hi.slice(0, 3)) {
    console.log(`\n=== d${e.day} ${e.mid} tier=${e.tier} outcome=${e.outcome} (last ${Math.min(40, e.endLine - e.startLine)} lines) ===`);
    for (const l of lines.slice(Math.max(e.startLine, e.endLine - 40), e.endLine)) console.log(`  ${l}`);
  }
}
main().catch(e => { console.error('SENSE3 FAIL: ' + (e && e.stack || e)); process.exit(1); });
