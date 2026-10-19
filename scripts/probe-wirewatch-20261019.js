#!/usr/bin/env node
// probe-wirewatch-20261019.js — witness-beat census for the WIREWATCH arm.
// Answers, per run: (a) share of npc_trap returns witnessed (playerAtHaven
// true at the tele), (b) agencyTeachVillager calls with a knowsSnare teacher
// and their witness share, (c) day-0 composition (scholar snare L0? knower
// count?) for seed screening. READ-ONLY instrument: wrappers record and
// delegate; no RNG, no Date.now in the instrument.
'use strict';
process.env.FEASTSCALE_R13 = '1';
process.env.SEATDRIVE = '0';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const f = require('./policies/feastscale');

const SEEDS = [41711, 41712, 41713, 41714];
const POLICIES = { leadfeast: f.leadfeast, belongfeast: f.belongfeast };

function atHaven(Game) {
  try { return !!Game.playerAtHaven(); } catch (e) {
    try {
      const v = Game.state.village || {};
      return Game.map.px === (v.px ?? 4) && Game.map.py === (v.py ?? 4);
    } catch (e2) { return false; }
  }
}

async function probe(seed, pid) {
  const { Game } = await loadGame({ seed, mode: 'wirewatch-probe' });
  await setupGame(Game);
  const rec = { returns: 0, witnessedReturns: 0, teachCalls: 0, knowerTeachCalls: 0,
    witnessedKnowerTeach: 0, snareLessons: 0, witnessedSnareLessons: 0 };
  // day-0 composition
  let scholarL0 = true, knowers0 = 0;
  try {
    scholarL0 = ((((Game.state.codex || {}).recipes || {}).snare || {}).level || 0) < 1;
    for (const vid of ((Game.state.village || {}).roster || [])) {
      let vp = null;
      try { vp = Game.vpOf(vid); } catch (e) {}
      if (vp && vp.knowsSnare && !vp.dead) knowers0++;
    }
  } catch (e) {}
  const origTele = Game.tele;
  Game.tele = function (key, data) {
    try {
      if (key === 'npc_trap') {
        rec.returns++;
        if (atHaven(Game)) rec.witnessedReturns++;
      }
    } catch (e) {}
    return origTele.call(this, key, data);
  };
  const origTeach = Game.agencyTeachVillager;
  if (typeof origTeach === 'function') {
    Game.agencyTeachVillager = function (teacherVid, learnerVid) {
      let lesson = null;
      try { lesson = origTeach.call(this, teacherVid, learnerVid); } catch (e) {}
      try {
        rec.teachCalls++;
        let knows = false;
        try { const tvp = Game.vpOf ? Game.vpOf(teacherVid) : null; knows = !!(tvp && tvp.knowsSnare); } catch (e) {}
        if (knows) {
          rec.knowerTeachCalls++;
          if (atHaven(Game)) rec.witnessedKnowerTeach++;
        }
        if (lesson && lesson.taught && lesson.topic === 'snare') {
          rec.snareLessons++;
          if (atHaven(Game)) rec.witnessedSnareLessons++;
        }
      } catch (e) {}
      return lesson;
    };
  }
  const base = POLICIES[pid];
  const policy = Object.assign({}, base);
  await runDays(Game, policy, { days: 60 });
  const r = Object.assign({ seed, pid, scholarL0, knowers0 }, rec);
  console.log(JSON.stringify(r));
  return r;
}

async function main() {
  const rows = [];
  for (const seed of SEEDS) for (const pid of Object.keys(POLICIES)) rows.push(await probe(seed, pid));
  const ret = rows.reduce((a, r) => a + r.returns, 0);
  const wret = rows.reduce((a, r) => a + r.witnessedReturns, 0);
  const tc = rows.reduce((a, r) => a + r.teachCalls, 0);
  const ktc = rows.reduce((a, r) => a + r.knowerTeachCalls, 0);
  const wktc = rows.reduce((a, r) => a + r.witnessedKnowerTeach, 0);
  const sl = rows.reduce((a, r) => a + r.snareLessons, 0);
  const wsl = rows.reduce((a, r) => a + r.witnessedSnareLessons, 0);
  console.log(`RETURNS ${ret} witnessed ${wret} (${ret ? (100 * wret / ret).toFixed(1) : 0}%)`);
  console.log(`TEACHCALLS ${tc}; knower-teacher ${ktc} witnessed ${wktc} (${ktc ? (100 * wktc / ktc).toFixed(1) : 0}%)`);
  console.log(`SNARE-LESSONS ${sl} witnessed ${wsl}`);
  console.log(`COMPOSITION: ${rows.map(r => `${r.pid.slice(0,4)}${r.seed}:L0=${r.scholarL0},k=${r.knowers0}`).join(' ')}`);
}
main().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
