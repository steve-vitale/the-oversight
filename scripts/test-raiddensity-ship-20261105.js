#!/usr/bin/env node
// scripts/test-raiddensity-ship-20261105.js — pins the SHIPPED raid-cooldown
// behavior (build-smallfixes, 2026-11-05): the Oct 15 cooldown is live with
// NO env var set. RED on gated code: on pristine master (RAIDDENSITY gate
// still present) the first checks fail, because _rdOn() is false without
// the env var (verified by running against master:src/js/game.js — see
// evidence/2026-11-05/smallfixes-raiddensity.md).
//
// Env: FEASTSCALE_R13=1 node scripts/test-raiddensity-ship-20261105.js
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame } = require('./sim-harness');

if (process.env.FEASTSCALE_R13 !== '1') {
  console.error('RAIDSHIP FATAL: FEASTSCALE_R13=1 required (leadfeast/belongfeast are feastscale policies, #312 lesson).');
  process.exit(2);
}
delete process.env.RAIDDENSITY; // shipped behavior must not need the env var

let pass = 0, fail = 0;
const chk = (name, cond, extra) => {
  if (cond) { pass++; console.log('  ok  ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
};
const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) {} return 0; };
function captureSay(Game, fn) {
  const lines = [];
  const orig = Game.say;
  Game.say = function (msg) { lines.push(String((msg && (msg.text || msg.msg || msg.message)) || msg || '')); return orig ? orig.call(Game, msg) : msg; };
  try { fn(); } finally { Game.say = orig; }
  return lines;
}
function mkRaider(Game, seedN) {
  const ovs = Game.state.otherVillages || [];
  const ov = ovs[seedN % Math.max(1, ovs.length)] || { id: 'v-test', name: 'Testfire', x: 8, y: 4 };
  ov.commons = { strainUs: 0, strainThem: 0, tension: 70, deal: null, depleteMult: 1, strainTiles: [], rumorStage: 0 };
  ov.trust = 10;
  return ov;
}

async function main() {
  // _rdOn() is true with no env var at all (the gate is gone).
  {
    const { Game } = await loadGame({ seed: 21, mode: 'rd-ship-on' });
    await setupGame(Game);
    chk('shipped: _rdOn() true with NO env var set', Game._rdOn() === true);
    chk('shipped: RAIDDENSITY env var is absent in this process',
      process.env.RAIDDENSITY == null);
  }

  // End-to-end through the commons roll site: a raid inside the window is
  // blocked with fiction, never silent, costs no trust, stages no raid.
  {
    const { Game } = await loadGame({ seed: 22, mode: 'rd-ship-commons' });
    await setupGame(Game);
    const day = gday(Game);
    Game.state.nationalLive = true;
    Game.state.nationalDay = day - 5;
    Game.state.nationalFirstDay = day - 5;
    const ov = mkRaider(Game, 0);
    Game._raidCooldownSet(); // a raid staged today
    const trustBefore = ov.trust;
    const realRandom = Math.random;
    Math.random = () => 0.05; // force the 0.08 raid roll to trip
    let lines;
    try { lines = captureSay(Game, () => Game.commonsTick()); } finally { Math.random = realRandom; }
    chk('shipped: blocked commons night says the doubled-watch line',
      lines.some(l => l.includes('doubled watch turned it')), 'lines=' + lines.length);
    chk('shipped: blocked commons night stages NO raid beat',
      !lines.some(l => l.includes('🌙 Raid —')));
    chk('shipped: blocked commons night costs no trust',
      ov.trust === trustBefore, 'trust ' + trustBefore + '->' + ov.trust);
  }

  // The formation stamp is unconditional: hierarchy.js stamps
  // nationalFirstDay at the court-sat point with no env guard.
  {
    const src = fs.readFileSync(path.join(__dirname, '..', 'src', 'js', 'hierarchy.js'), 'utf8');
    const stampIdx = src.indexOf('this.state.nationalFirstDay = day;');
    chk('shipped: hierarchy.js stamps nationalFirstDay at formation',
      stampIdx >= 0);
    const window = src.slice(Math.max(0, stampIdx - 600), stampIdx);
    chk('shipped: the stamp carries no RAIDDENSITY guard',
      !window.includes('RAIDDENSITY'), 'guard found near stamp');
    const gameSrc = fs.readFileSync(path.join(__dirname, '..', 'src', 'js', 'game.js'), 'utf8');
    const rdOn = gameSrc.slice(gameSrc.indexOf('_rdOn()'), gameSrc.indexOf('_rdOn()') + 200);
    chk('shipped: game.js _rdOn() has no process.env gate',
      !rdOn.includes('process.env'), rdOn.slice(0, 120));
  }

  console.log(`\nRAIDSHIP PROOF: ${pass} pass, ${fail} fail`);
  if (fail) { console.error('PROOF FAILED'); process.exit(1); }
  console.log('PROOF GREEN');
}

main().catch(e => { console.error('RAIDSHIP FATAL:', e && e.stack || e); process.exit(1); });
