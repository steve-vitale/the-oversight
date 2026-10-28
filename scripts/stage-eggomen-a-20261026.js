#!/usr/bin/env node
// stage-eggomen-a-20261026.js — staged omen cohort instrument (sim-eggomen-a).
//
// One staged village per process (one harness per child, per repo rule).
// Loads a real game, stages ONLY the two gate inputs titanDawnTick reads
// (Game.unlockedWave / Game.scaleRank), then ticks dawn until the watched
// titan's omen appears or STAGE_TICKS run out. All other titan machinery
// (omen staging, advance, placement, upkeep) runs real.
//
// Why staging: no natural village reaches wave 5 (kill-conversion wall),
// so the finale omen's scale leg is unobservable on natural seeds. The
// variant's content IS the titanDawnTick branch condition, so staging the
// branch inputs measures exactly what changed.
//
// Env: STAGE_SEED (default 88201), STAGE_WAVE (5), STAGE_RANK (regional),
//   STAGE_APOC (finale), STAGE_TID (finale), STAGE_TICKS (60).
// Output: one JSON line on stdout. Writes nothing into the repo.
'use strict';
const H = require('./sim-harness');
const SEED = parseInt(process.env.STAGE_SEED || '88201', 10);
const WAVE = parseInt(process.env.STAGE_WAVE || '5', 10);
const RANK = process.env.STAGE_RANK || 'regional';
const APOC = process.env.STAGE_APOC || 'finale';
const TID = process.env.STAGE_TID || 'finale';
const TICKS = parseInt(process.env.STAGE_TICKS || '60', 10);

(async () => {
  const { Game: G } = await H.loadGame({ seed: SEED });
  await H.setupGame(G);
  try { G.depart(); } catch (e) {}
  G.state.titans = { omens: {}, musters: {}, slain: {}, cast: { herald: 'herald', apocalypse: APOC } };
  G.state.scholar.day = 100;
  G.unlockedWave = () => WAVE;
  G.scaleRank = () => RANK;
  let omenTick = -1, omenStage = null;
  for (let i = 0; i < TICKS; i++) {
    G.state.scholar.day = 100 + i;
    G.titanDawnTick();
    const o = ((G.state.titans || {}).omens || {})[TID];
    if (o) { omenTick = i + 1; omenStage = o.stage; break; }
  }
  console.log(JSON.stringify({ seed: SEED, wave: WAVE, rank: RANK, apoc: APOC, tid: TID, ticks: TICKS, omenTick, omenStage }));
  process.exit(0);
})().catch((e) => { console.error('STAGE ERROR', e && e.stack || e); process.exit(1); });
