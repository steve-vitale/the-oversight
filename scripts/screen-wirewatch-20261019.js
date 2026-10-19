#!/usr/bin/env node
// screen-wirewatch-20261019.js — seed composition screen for the WIREWATCH
// arm. Design-only (no measurement): loadGame+setupGame, report scholar
// snare level + living knower count. Takes the first 8 seeds from
// 41711–41730 with scholar L0 + >=1 living knower (knowsSnare).
'use strict';
process.env.FEASTSCALE_R13 = '1';
process.env.SEATDRIVE = '0';
const { loadGame, setupGame } = require('./sim-harness');

async function main() {
  const picked = [];
  for (let seed = 41711; seed <= 41730 && picked.length < 8; seed++) {
    const { Game } = await loadGame({ seed, mode: 'wirewatch-screen' });
    await setupGame(Game);
    let scholarL0 = true, knowers = 0;
    try {
      scholarL0 = ((((Game.state.codex || {}).recipes || {}).snare || {}).level || 0) < 1;
      for (const vid of ((Game.state.village || {}).roster || [])) {
        if (vid === Game.villagerId) continue;
        let vp = null, dead = false;
        try { vp = Game.vpOf(vid); } catch (e) {}
        try { const pp = (Game.getPerson && Game.getPerson(vid)) || {}; dead = !!pp.dead; } catch (e) {}
        if (vp && vp.knowsSnare && !dead) knowers++;
      }
    } catch (e) {}
    const ok = scholarL0 && knowers >= 1;
    console.log(`s${seed}: L0=${scholarL0} knowers=${knowers} ${ok ? 'PICK' : 'skip'}`);
    if (ok) picked.push(seed);
  }
  console.log('PICKED: ' + picked.join(','));
}
main().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
