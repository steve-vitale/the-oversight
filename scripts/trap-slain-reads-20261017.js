#!/usr/bin/env node
// trap-slain-reads-20261017.js — who reads state.villageSlain on the
// divergent seed? Traps reads via getter/setter with stack capture.
// Usage: FEASTSCALE_R13=1 TRIBFLOOR=1 SEATDRIVE=0 node scripts/trap-slain-reads-20261017.js
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(ROOT, 'scripts', 'sim-harness'));
const TF = require(path.join(ROOT, 'scripts', 'policies', 'tribfloor'));

(async () => {
  const { Game } = await loadGame({ seed: 1809, mode: 'pyrrhic-trap', fullTelemetry: false });
  await setupGame(Game);

  // Force the slain-variant state (as the fix would): belltoad slain at d26.
  // Then trap every read of state.villageSlain with a stack sample.
  const reads = {};
  function armTrap() {
    try {
      const st = Game.state;
      if (!st || st.__slainTrapped) return;
      const vs = st.villageSlain;
      Object.defineProperty(st, 'villageSlain', {
        configurable: true, enumerable: true,
        get() {
          try {
            const stack = (new Error().stack || '').split('\n').slice(2, 6).join(' <- ');
            reads[stack] = (reads[stack] || 0) + 1;
          } catch (e) {}
          return vs;
        },
        set(v) { try { Object.defineProperty(st, 'villageSlain', { configurable: true, enumerable: true, writable: true, value: v }); } catch (e) {} },
      });
      st.__slainTrapped = true;
    } catch (e) {}
  }

  // Simulate the fix's d26 write, then arm the trap immediately after.
  const _rpk = Game.recordPyrrhicKill.bind(Game);
  Game.recordPyrrhicKill = function (mid, vid, via, detail) {
    const r = _rpk(mid, vid, via, detail);
    armTrap();
    return r;
  };

  await quietLog(async () => { await runDays(Game, TF.leadfeast, { days: 40, manifest: undefined, sampleEvery: 30 }); });
  const keys = Object.keys(reads).sort((a, b) => reads[b] - reads[a]);
  console.log(`villageSlain read sites (${keys.length} unique):`);
  for (const k of keys.slice(0, 15)) console.log(`  ${reads[k]}x: ${k}`);
})().catch(e => { console.error('TRAP CRASH:', e); process.exit(2); });
