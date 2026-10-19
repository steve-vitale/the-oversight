#!/usr/bin/env node
// probe-wirepack-20261019.js — day-0 wire census on the wirebootstrap arm seeds.
// Reports, per seed: scholar occupation, scholar pack (wire present?),
// knower census (vp.knowsSnare), and itemBias-tool draws. READ-ONLY instrument.
'use strict';
const path = require('path');
const { loadGame, setupGame } = require('./sim-harness');

const SEEDS = [31701, 31702, 31703, 31704, 31705, 31706, 31707, 31708];

async function main() {
  for (const seed of SEEDS) {
    const { Game } = await loadGame({ seed, mode: 'wireprobe' });
    await setupGame(Game);
    const s = Game.state.scholar;
    const inv = (s.inventory || []).map(i => i.itemId || i.id);
    const wire = inv.filter(id => id === 'snare_wire').length;
    let knowers = 0;
    try {
      const roster = ((Game.state.village || {}).roster || []);
      for (const vid of roster) {
        let vp = null;
        try { vp = Game.vpOf(vid); } catch (e) {}
        if (vp && vp.knowsSnare) knowers++;
      }
    } catch (e) {}
    let occ = '?';
    try {
      const p = Game.getPerson ? Game.getPerson(Game.villagerId) : null;
      occ = (p && (p.formerOccupation || p.occupation)) || '?';
    } catch (e) {}
    console.log(`s${seed} scholar=${occ} wireInPack=${wire} knowers=${knowers} tools=[${inv.join(',')}]`);
  }
}
main().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
