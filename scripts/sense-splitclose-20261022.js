#!/usr/bin/env node
// sense-splitclose-20261022.js — SENSE-TESTING LAW transcript reader for
// sim-splitclose.
//
// Re-runs ONE deterministic armed config (the policy is deterministic per
// E4/D2) capturing narration around the wave-4 fights, so a human can
// read whether the companions close like people: meaning, coherence,
// consequences — not just counts.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 \
//   ARMORYDRIVE=1 KILLDISC=1 SPLITCLOSE=1 SEED=65612 BASE=lead \
//   node scripts/sense-splitclose-20261022.js
'use strict';
const path = require('path');
const REPO = process.env.REPO || path.join(__dirname, '..');
for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'ARMORYDRIVE', 'KILLDISC', 'SPLITCLOSE']) {
  if (process.env[k] !== '1') { console.error(`SENSE STOP: ${k}=1 required.`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('SENSE STOP: SEATDRIVE=0 required.'); process.exit(2); }

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const SC = require(path.join(REPO, 'scripts', 'policies', 'splitclose'));

const SEED = parseInt(process.env.SEED || '65612', 10);
const BASE = (process.env.BASE || 'lead').toLowerCase().startsWith('b') ? 'belongfeast' : 'leadfeast';

function waveOf(Game, mid) {
  try { const d = ((Game.data || {}).monsters || []).find(x => x && x.id === mid); return (d && d.wave) || 1; }
  catch (e) { return 1; }
}
function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

async function main() {
  const policy = SC.armedFor(BASE);
  const { Game } = await loadGame({ seed: SEED, mode: 'splitclose-sense', fullTelemetry: false });
  const lines = [];
  const oSay = Game.say ? Game.say.bind(Game) : null;
  if (typeof Game.say === 'function') {
    Game.say = function (x) {
      try {
        const s = String(x == null ? '' : x);
        if (s) lines.push(`d${gday(Game)} ${s.slice(0, 300)}`);
      } catch (e) {}
      return oSay.apply(this, arguments);
    };
  } else {
    console.log('NOTE: Game.say not a function — narration capture disabled');
  }
  // Track wave-4 fight starts/ends for framing.
  const fights = [];
  const oStart = Game.startCombat;
  if (typeof oStart === 'function') {
    Game.startCombat = function (mid) {
      const r = oStart.apply(this, arguments);
      try { if ((waveOf(Game, mid) | 0) === 4) fights.push({ day: gday(Game), mid, kind: 'start' }); } catch (e) {}
      return r;
    };
  }
  const oRWK = Game.recordWaveKill;
  if (typeof oRWK === 'function') {
    Game.recordWaveKill = function (mid, vid, via) {
      try { if ((waveOf(Game, mid) | 0) === 4) fights.push({ day: gday(Game), mid, kind: 'kill', by: vid, via }); } catch (e) {}
      return oRWK.apply(this, arguments);
    };
  }
  await setupGame(Game);
  await quietLog(async () => { await runDays(Game, policy, { days: 180, manifest: undefined, sampleEvery: 30 }); });
  console.log(`sense: seed=${SEED} base=${BASE}`);
  console.log(`captured ${lines.length} narration lines, ${fights.length} wave-4 fight events`);
  for (const f of fights) {
    if (f.kind !== 'kill') continue;
    console.log(`\n--- d${f.day} ${f.mid} KILL by=${f.by} via=${f.via} ---`);
    const rel = lines.filter(l => {
      const m = /^d(\d+)/.exec(l);
      return m && Math.abs(parseInt(m[1], 10) - f.day) <= 0;
    });
    for (const l of rel.slice(0, 60)) console.log(`  ${l}`);
    if (rel.length > 60) console.log(`  ... (${rel.length - 60} more lines)`);
  }
}
main().catch(e => { console.error('SENSE FAIL: ' + (e && e.stack || e)); process.exit(1); });
