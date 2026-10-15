#!/usr/bin/env node
// scripts/mapmem-diag-20261015.js — where does the V1 haul chain break?
// Instruments (armed only): sites formed, eligibility hits, HAUL candidates,
// knowledge-gate openings, animal vs monster carcass counts.
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { applyMapmemGate } = require('./mapmem-gate-20261015');

const REG = {
  leadcourt: require('./policies/leadcourt').leadcourt,
  belongseek: require('./policies/belongseek').belongseek,
};
const SEEDS = (process.env.SEEDS || '11,22,33').split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '60', 10);

async function diagOne(pid, seed) {
  process.env.MAPMEM = '1';
  const { Game } = await loadGame({ seed, mode: 'ch-diag-' + pid });
  applyMapmemGate(Game);
  await setupGame(Game);
  const d = {
    sitesFormed: 0, siteLabels: {},
    bestHaulHits: 0, bestHaulNullFor: {},
    haulCandidates: 0, objPicks: 0,
    knownOpens: [], // monsterFoodSafe openings {day, mid, how}
    carcassKinds: {}, // kind -> count
    rememberNullFor: {},
  };
  const day = () => { try { return (Game.state.scholar || {}).day || 0; } catch (e) {} };
  // sites formed
  const origRemember = Game.mapmemRemember;
  Game.mapmemRemember = function (vid, corpse) {
    const r = origRemember.apply(this, arguments);
    try {
      const kind = (corpse && corpse.kind) || '?';
      d.carcassKinds[kind] = (d.carcassKinds[kind] || 0) + 1;
      if (r) {
        d.sitesFormed++;
        d.siteLabels[r.label] = (d.siteLabels[r.label] || 0) + 1;
      } else {
        const why = !corpse ? 'nocorpse' : (corpse.kind === 'person' || corpse.kind === 'villager') ? 'person' : 'nomeat';
        d.rememberNullFor[why] = (d.rememberNullFor[why] || 0) + 1;
      }
    } catch (e) {}
    return r;
  };
  // eligibility
  const origBest = Game.mapmemBestHaul;
  Game.mapmemBestHaul = function (vid, hx, hy) {
    d.objPicks++;
    const r = origBest.apply(this, arguments);
    try {
      if (r) d.bestHaulHits++;
      else {
        const mem = Game.mapmemOf(vid);
        const n = (mem.sites || []).length;
        d.bestHaulNullFor['sites=' + n] = (d.bestHaulNullFor['sites=' + n] || 0) + 1;
      }
    } catch (e) {}
    return r;
  };
  // knowledge gate openings
  const origMark = Game.markMonsterFoodSafe;
  if (typeof origMark === 'function') {
    Game.markMonsterFoodSafe = function (mid, how) {
      try { d.knownOpens.push({ day: day(), mid: String(mid), how: String(how || '?') }); } catch (e) {}
      return origMark.apply(this, arguments);
    };
  }
  // HAUL candidates in objPick
  const origPick = Game.objPick;
  Game.objPick = function (vid, hx, hy) {
    const r = origPick.apply(this, arguments);
    try { if (r && r.kind === 'HAUL') d.haulCandidates++; } catch (e) {}
    return r;
  };
  const policy = Object.assign({}, REG[pid]);
  await runDays(Game, policy, { days: DAYS });
  console.log(`[${pid}/s${seed}] sitesFormed=${d.sitesFormed} labels=${JSON.stringify(d.siteLabels)}`);
  console.log(`  rememberNull: ${JSON.stringify(d.rememberNullFor)} carcassKinds: ${JSON.stringify(d.carcassKinds)}`);
  console.log(`  bestHaul: hits=${d.bestHaulHits} of ${d.objPicks} picks; nullReasons: ${JSON.stringify(d.bestHaulNullFor)}`);
  console.log(`  haulCandidates(chosen)=${d.haulCandidates} knownOpens=${JSON.stringify(d.knownOpens)}`);
}

(async () => {
  for (const pid of Object.keys(REG)) for (const seed of SEEDS) await diagOne(pid, seed);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
