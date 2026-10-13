#!/usr/bin/env node
// scripts/diag-killroad-w3-20261013.js — why do the killroad after-seeds face
// wave-3 monsters but score zero wave-3 ledger kills? Fight-level census:
// every startCombat (player) and fieldFight (villager) vs every
// recordWaveKill, with wave attribution and outcome.
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { killroad } = require('./policies/killroad');

const SEED = parseInt(process.env.SEED || '44', 10);
const DAYS = parseInt(process.env.DAYS || '150', 10);

(async () => {
  process.env.KILLROAD_COURT = process.env.GATE || '1';
  const { Game } = await loadGame({ seed: SEED, mode: 'killroad-w3diag' });
  await setupGame(Game);
  const waveOf = (mid) => {
    try {
      const mdef = (Game.data.monsters || []).find(m => m.id === mid);
      return (mdef && mdef.wave) || 0;
    } catch (e) { return 0; }
  };
  const day = () => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
  const fights = []; // {day, who, mid, wave, outcome}
  const kills = [];  // {day, mid, wave}
  const origSC = Game.startCombat.bind(Game);
  Game.startCombat = function (...args) {
    const r = origSC(...args);
    try {
      const nf = Game.tbfight;
      const m = nf && (nf.fighters || []).find(f => f.kind === 'monster' && f.monsterId);
      if (m) fights.push({ day: day(), who: 'player', mid: m.monsterId, wave: waveOf(m.monsterId), outcome: 'started' });
    } catch (e) {}
    return r;
  };
  if (typeof Game.fieldFight === 'function') {
    const origFF = Game.fieldFight.bind(Game);
    Game.fieldFight = function (...args) {
      const r = origFF.apply(this, args);
      try {
        const mdef = args[1];
        if (mdef && mdef.id) fights.push({ day: day(), who: 'villager', mid: mdef.id, wave: waveOf(mdef.id), outcome: (r && r.outcome) || '?' });
      } catch (e) {}
      return r;
    };
  }
  const origK = Game.recordWaveKill.bind(Game);
  Game.recordWaveKill = function (mid, ...rest) {
    try { kills.push({ day: day(), mid, wave: waveOf(mid) }); } catch (e) {}
    return origK(mid, ...rest);
  };
  const result = await runDays(Game, killroad, { days: DAYS, sampleEvery: 10 });
  delete process.env.KILLROAD_COURT;
  const w3f = fights.filter(f => f.wave === 3);
  const w3k = kills.filter(k => k.wave === 3);
  console.log(`seed=${SEED} days=${result.days} ${result.endReason}`);
  console.log(`wave-3 fights: ${w3f.length} (player ${w3f.filter(f => f.who === 'player').length}, villager ${w3f.filter(f => f.who === 'villager').length})`);
  console.log(`wave-3 kills: ${w3k.length}`);
  const byMid = {};
  for (const f of w3f) { byMid[f.mid] = byMid[f.mid] || { fights: 0, player: 0, villager: 0, outcomes: {} }; byMid[f.mid].fights++; byMid[f.mid][f.who]++; byMid[f.mid].outcomes[f.outcome] = (byMid[f.mid].outcomes[f.outcome] || 0) + 1; }
  for (const k of w3k) { byMid[k.mid] = byMid[k.mid] || { fights: 0, player: 0, villager: 0, outcomes: {} }; byMid[k.mid].kills = (byMid[k.mid].kills || 0) + 1; }
  for (const [mid, s] of Object.entries(byMid)) console.log(`  ${mid}: fights=${s.fights} (p${s.player}/v${s.villager}) kills=${s.kills || 0} outcomes=${JSON.stringify(s.outcomes)}`);
  // wave-3 ledger points earned
  try { console.log('waveLedgerPoints(3) =', Game.waveLedgerPoints(3)); } catch (e) {}
  // when did wave 3 unlock?
  try { console.log('unlockedWave =', Game.unlockedWave ? Game.unlockedWave() : '?'); } catch (e) {}
})().catch(e => { console.error('FATAL', e); process.exit(1); });
