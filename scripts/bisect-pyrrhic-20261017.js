#!/usr/bin/env node
// bisect-pyrrhic-20261017.js — which of recordPyrrhicKill's three state
// writes moves the leadfeast-s1809 trajectory? Wraps (never edits) the
// method: variant = wkl | codex | slain | all | none.
// Usage: FEASTSCALE_R13=1 TRIBFLOOR=1 SEATDRIVE=0 node scripts/bisect-pyrrhic-20261017.js <variant>
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(ROOT, 'scripts', 'sim-harness'));
const TF = require(path.join(ROOT, 'scripts', 'policies', 'tribfloor'));

const variant = process.argv[2] || 'all';

(async () => {
  const { Game } = await loadGame({ seed: 1809, mode: 'pyrrhic-bisect', fullTelemetry: false });
  await setupGame(Game);
  const _rpk = Game.recordPyrrhicKill.bind(Game);
  Game.recordPyrrhicKill = function (monsterId, killerVid, via, detail) {
    if (variant === 'none') return;
    const mdef = (Game.data.monsters || []).find(m => m.id === monsterId);
    if (!mdef) return;
    const wave = mdef.wave || 1;
    if (variant === 'all' || variant === 'slain') {
      Game.state.villageSlain = Game.state.villageSlain || {};
      Game.state.villageSlain[monsterId] = (Game.state.villageSlain[monsterId] || 0) + 1;
    }
    if (variant === 'all' || variant === 'codex') {
      try {
        const ce = Game.ensureMonsterEntry(monsterId);
        if (ce) ce.stage = 'slain';
      } catch (e) {}
    }
    if (variant === 'all' || variant === 'wkl') {
      try {
        const log = Game.state.waveKillLog || (Game.state.waveKillLog = []);
        if (log.length < 1000) log.push({ d: (Game.state.scholar || {}).day || 0, mid: monsterId, w: wave, by: killerVid || null, via: via || 'unknown', trick: detail || null });
        const byCh = Game.state.waveKillByChannel || (Game.state.waveKillByChannel = {});
        const k = (via || 'unknown') + '.w' + wave;
        byCh[k] = (byCh[k] || 0) + 1;
      } catch (e) {}
    }
    void _rpk;
  };
  let result;
  await quietLog(async () => { result = await runDays(Game, TF.leadfeast, { days: 180, manifest: undefined, sampleEvery: 30 }); });
  console.log(`variant=${variant}: days=${result.days} end=${result.endReason}`);
})().catch(e => { console.error('BISECT CRASH:', e); process.exit(2); });
