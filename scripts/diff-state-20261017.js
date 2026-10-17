#!/usr/bin/env node
// diff-state-20261017.js — run leadfeast-s1809 to N days under a
// recordPyrrhicKill variant (all|slain|none) and dump canonicalized state.
// Usage: FEASTSCALE_R13=1 TRIBFLOOR=1 SEATDRIVE=0 node scripts/diff-state-20261017.js <variant> <days> <out.json>
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(ROOT, 'scripts', 'sim-harness'));
const TF = require(path.join(ROOT, 'scripts', 'policies', 'tribfloor'));

const variant = process.argv[2] || 'none';
const days = parseInt(process.argv[3], 10) || 33;
const outPath = process.argv[4];

function canon(v, seen) {
  if (v === null || typeof v !== 'object') return v;
  if (seen.has(v)) return '[cycle]';
  seen.add(v);
  if (Array.isArray(v)) return v.map(x => canon(x, seen));
  if (v instanceof Date) return '[date]';
  const o = {};
  for (const k of Object.keys(v).sort()) {
    try { o[k] = canon(v[k], seen); } catch (e) { o[k] = '[err]'; }
  }
  return o;
}

(async () => {
  const { Game } = await loadGame({ seed: 1809, mode: 'pyrrhic-statediff', fullTelemetry: false });
  await setupGame(Game);
  const _rpk = Game.recordPyrrhicKill.bind(Game);
  Game.recordPyrrhicKill = function (monsterId, killerVid, via, detail) {
    if (variant === 'none') return;
    if (variant === 'slain') {
      const mdef = (Game.data.monsters || []).find(m => m.id === monsterId);
      if (!mdef) return;
      Game.state.villageSlain = Game.state.villageSlain || {};
      Game.state.villageSlain[monsterId] = (Game.state.villageSlain[monsterId] || 0) + 1;
      return;
    }
    return _rpk(monsterId, killerVid, via, detail);
  };
  await quietLog(async () => { await runDays(Game, TF.leadfeast, { days: days, manifest: undefined, sampleEvery: 30 }); });
  const st = canon(Game.state, new Set());
  require('fs').writeFileSync(outPath, JSON.stringify({ variant, day: (Game.state.scholar || {}).day, state: st }, null, 1));
  console.log(`wrote ${outPath} variant=${variant} at day ${Game.state.scholar.day}`);
})().catch(e => { console.error('STATEDIFF CRASH:', e); process.exit(2); });
