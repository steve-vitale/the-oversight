#!/usr/bin/env node
// sense-tierband-20261023.js — SENSE-TESTING LAW instrument for
// sim-overtime-yield-b.
//
// Prints narration AROUND each wave-4 TB fight END, with the overtime tier
// sampled at fight start. SENSE QUESTION: on a tier>=5 fight where the
// scholar takes the kill (the tierband bypass — no soften/hold) vs a
// tier<=1 fight where the discipline holds and a companion closes — do the
// beats read as a person making a judgment call, or as mode-flipping?
//
// Usage (full substrate env + both discipline gates):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 \
//   ARMORYDRIVE=1 KILLDISC=1 SPLITCLOSE=1 TIERBAND=1 SEED=65612 BASE=belong \
//   node scripts/sense-tierband-20261023.js
// Detail mode (narration around one fight): add FIGHTDAY=<day> (the fight
// that started that day).
'use strict';
const path = require('path');
const REPO = process.env.REPO || path.join(__dirname, '..');
for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'ARMORYDRIVE', 'KILLDISC', 'SPLITCLOSE', 'TIERBAND']) {
  if (process.env[k] !== '1') { console.error(`SENSE STOP: ${k}=1 required.`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('SENSE STOP: SEATDRIVE=0 required.'); process.exit(2); }

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const TB = require(path.join(REPO, 'scripts', 'policies', 'tierband'));

const SEED = parseInt(process.env.SEED || '65612', 10);
const BASE = (process.env.BASE || 'belong').toLowerCase().startsWith('b') ? 'belongfeast' : 'leadfeast';
const FIGHTDAY = process.env.FIGHTDAY ? parseInt(process.env.FIGHTDAY, 10) : null;

function waveOf(Game, mid) {
  try { const d = ((Game.data || {}).monsters || []).find(x => x && x.id === mid); return (d && d.wave) || 1; } catch (e) { return 1; }
}
function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function nameOf(Game, vid) {
  try { const p = Game.getPerson ? Game.getPerson(vid) : null; if (p && p.name) return String(p.name).split(' ')[0]; } catch (e) {}
  return String(vid || '?').slice(0, 16);
}

async function main() {
  const policy = TB.armedFor(BASE);
  const { Game } = await loadGame({ seed: SEED, mode: 'tierband-sense', fullTelemetry: false });
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
  const oRWK = Game.recordWaveKill;
  if (typeof oRWK === 'function') {
    Game.recordWaveKill = function (mid, vid, via) {
      try {
        if ((waveOf(Game, mid) | 0) === 4 && cur) ends.push({ ...cur, endLine: lines.length, by: vid, byName: nameOf(Game, vid), via });
      } catch (e) {}
      return oRWK.apply(this, arguments);
    };
  }
  // Also record fight ENDS without kills (lost/fled) via tbEnd.
  const oEnd = Game.tbEnd;
  if (typeof oEnd === 'function') {
    Game.tbEnd = function (result) {
      try {
        if (cur && !ends.length) {} // no-op; ends come from recordWaveKill
      } catch (e) {}
      return oEnd.apply(this, arguments);
    };
  }
  await setupGame(Game);
  await quietLog(async () => { await runDays(Game, policy, { days: 180, manifest: undefined, sampleEvery: 30 }); });
  console.log(`sense: seed=${SEED} base=${BASE} wave-4 kills=${ends.length}`);
  for (const e of ends) {
    console.log(`  d${e.day} ${e.mid} tier=${e.tier} KILL by=${e.byName} via=${e.via}`);
  }
  if (FIGHTDAY != null) {
    for (const e of ends.filter(x => x.day === FIGHTDAY)) {
      console.log(`\n=== d${e.day} ${e.mid} tier=${e.tier} KILL by=${e.byName} via=${e.via} (last ${Math.min(40, e.endLine - e.startLine)} lines) ===`);
      for (const l of lines.slice(Math.max(e.startLine, e.endLine - 40), e.endLine)) console.log(`  ${l}`);
    }
  }
}
main().catch(e => { console.error('SENSE FAIL: ' + (e && e.stack || e)); process.exit(1); });
