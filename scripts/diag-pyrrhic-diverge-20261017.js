#!/usr/bin/env node
// diag-pyrrhic-diverge-20261017.js — root-cause the leadfeast-s1913 det-gate
// divergence (nTbFights 53 vs 44, no trick-bearing pyrrhic in either).
// Hypothesis: a NON-trick-bearing monster died in a 'lost' fight, so
// recordPyrrhicKill fired (villageSlain++ -> beasttricks teaching) without
// appearing in the trick-focused pyrrhicRows.
// Logs every recordPyrrhicKill call and every 'lost' tbEnd with dead monsters.
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(ROOT, 'scripts', 'sim-harness'));
const FS = require(path.join(ROOT, 'scripts', 'policies', 'feastscale'));

async function oneRun(armed) {
  const { Game } = await loadGame({ seed: 1913, mode: 'pyrrhic-diag', fullTelemetry: false });
  await setupGame(Game);
  const PRISTINE = Game.recordPyrrhicKill;
  const rpkCalls = [];
  const lostFights = [];
  Game.recordPyrrhicKill = function (mid, vid, via, detail) {
    rpkCalls.push({ d: (Game.state.scholar || {}).day, mid, vid, via, trick: detail || null });
    return armed ? PRISTINE.apply(this, arguments) : undefined;
  };
  const _tbEnd = Game.tbEnd.bind(Game);
  Game.tbEnd = function (result) {
    try {
      const f = Game.tbfight;
      if (f && !f.over && result === 'lost') {
        const p = Game.tbFighter ? Game.tbFighter('p') : null;
        const deadM = (f.fighters || []).filter(x => x && x.kind === 'monster' && !x.alive && x.mdef);
        lostFights.push({ d: (Game.state.scholar || {}).day, pAlive: !!(p && p.alive),
          dead: deadM.map(m => m.mdef.id), trickMids: Object.keys(f.trickLogByMid || {}) });
      }
    } catch (e) {}
    return _tbEnd(result);
  };
  let result;
  await quietLog(async () => { result = await runDays(Game, FS.leadfeast, { days: 180, manifest: undefined, sampleEvery: 30 }); });
  Game.recordPyrrhicKill = PRISTINE;
  console.log(`=== ${armed ? 'ARMED' : 'CONTROL'} ===`);
  console.log('days', result.days, result.endReason);
  console.log('recordPyrrhicKill calls:', JSON.stringify(rpkCalls));
  console.log('lost fights with dead monsters:', JSON.stringify(lostFights.filter(l => l.dead.length)));
  console.log('total lost fights:', lostFights.length);
}

(async () => {
  await oneRun(true);
  await oneRun(false);
})().catch(e => { console.error('DIAG CRASH:', e); process.exit(2); });
