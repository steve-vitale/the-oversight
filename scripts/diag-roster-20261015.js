#!/usr/bin/env node
// scripts/diag-roster-20261015.js — ROSTER DEATH CHANNEL DIAGNOSTIC.
//
// Control substrate only (leadfeast + FEASTSCALE_R13=1). Measures WHERE the
// post-unlock villager (non-scholar) combat deaths come from, so the
// siegeroster mechanism is designed to the measured channels, not to theory.
//
// Wraps (read-only, trajectory-identical by construction):
//   - Game.fieldFight: logs {day, vid, monsterId, wave, outcome, intent, channel}
//   - Game.resolvePatrol -> channel 'patrol'
//   - Game.resolveWildMonsterEncounter -> channel 'raid' (opts.raid) or 'wild'
// Post-unlock villager combat deaths: samples.deaths kind in
// (villager,person), !player, cause in (monster,combat), day >= unlockDay5.
//
// Usage: OUT=evidence/2026-10-15/diag-roster.json node scripts/diag-roster-20261015.js
'use strict';
process.env.FEASTSCALE_R13 = '1';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { leadfeast } = require('./policies/feastscale');

const SEEDS = [11, 22, 33, 44, 55, 66, 77, 88];
const DAYS = 180;

function monsterWave(Game, monsterId) {
  try {
    const md = (Game.data.monsters || []).find(m => m.id === monsterId);
    return md ? (md.wave || null) : null;
  } catch (e) { return null; }
}

async function runSeed(seed) {
  const { Game } = await loadGame({ seed, mode: 'diag-roster', fullTelemetry: true });
  await setupGame(Game);
  const fights = [];
  let channel = null;

  const origFF = Game.fieldFight.bind(Game);
  Game.fieldFight = function (vid, mdef, m, opts) {
    const ch = channel; channel = null;
    let rec = null;
    try { rec = origFF(vid, mdef, m, opts); }
    finally {
      try {
        fights.push({
          day: (Game.state.scholar || {}).day || 0,
          vid: String(vid || '?'), channel: ch || 'other',
          monsterId: (m && m.id) || (mdef && mdef.id) || '?',
          wave: monsterWave(Game, (m && m.id) || (mdef && mdef.id)),
          outcome: rec ? rec.outcome : 'threw',
          intent: rec ? rec.intent : null,
          rounds: rec ? rec.rounds : null,
        });
      } catch (e) {}
    }
    return rec;
  };
  const tagChannel = (name, ch) => {
    try {
      const orig = Game[name].bind(Game);
      Game[name] = function (...args) {
        const prev = channel;
        channel = ch === 'wild-or-raid'
          ? ((args[2] && args[2].raid) ? 'raid' : 'wild')
          : ch;
        try { return orig(...args); }
        finally { if (channel !== null) channel = prev; }
      };
    } catch (e) {}
  };
  tagChannel('resolvePatrol', 'patrol');
  tagChannel('resolveWildMonsterEncounter', 'wild-or-raid');

  const audit = { unlockDay5: null, maxUnlocked: 1, nationalDays: 0, tableEver: false };
  const policy = Object.assign({}, leadfeast);
  const origDaily = leadfeast.daily ? leadfeast.daily.bind(leadfeast) : null;
  policy.daily = (G, ctx) => {
    try {
      const day = (G.state.scholar || {}).day || 0;
      const uw = G.unlockedWave ? G.unlockedWave() : 1;
      if (uw > audit.maxUnlocked) audit.maxUnlocked = uw;
      if (uw >= 5 && audit.unlockDay5 == null) audit.unlockDay5 = day;
      const r = G.scaleRank ? G.scaleRank() : 'village';
      if (r === 'national' || r === 'global') audit.nationalDays++;
      const pg = G.progState ? G.progState() : {};
      if (pg.tableWaiting) audit.tableEver = true;
    } catch (e) {}
    return origDaily ? origDaily(G, ctx) : undefined;
  };

  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, sampleEvery: 10 }); });

  const deaths = (result.samples.deaths || []).filter(d =>
    (d.kind === 'villager' || d.kind === 'person') && !d.player &&
    (d.cause === 'monster' || d.cause === 'combat'));
  const postDeaths = audit.unlockDay5 != null
    ? deaths.filter(d => d.day >= audit.unlockDay5) : [];
  const postFights = audit.unlockDay5 != null
    ? fights.filter(f => f.day >= audit.unlockDay5) : [];

  return {
    seed, days: result.days, endReason: result.endReason,
    maxUnlocked: audit.maxUnlocked, unlockDay5: audit.unlockDay5,
    nationalDays: audit.nationalDays, tableEver: audit.tableEver,
    villagerCombatDeaths: deaths.length,
    postUnlockVillagerCombatDeaths: postDeaths.length,
    postDeaths: postDeaths.map(d => ({ day: d.day, kind: d.kind, who: d.who, cause: d.cause })),
    postFights,
  };
}

async function main() {
  const out = process.env.OUT;
  if (!out) { console.error('OUT required'); process.exit(2); }
  const rows = [];
  for (const seed of SEEDS) {
    const r = await runSeed(seed);
    rows.push(r);
    console.log(`seed ${seed}: days=${r.days} end=${r.endReason} wave<=${r.maxUnlocked} unlock=${r.unlockDay5 == null ? 'no' : 'd' + r.unlockDay5} villCombat=${r.villagerCombatDeaths} postUnlock=${r.postUnlockVillagerCombatDeaths}`);
  }
  // aggregate channels
  const unlockers = rows.filter(r => r.unlockDay5 != null);
  let postDeaths = 0;
  const byChannel = {}, byWave = {}, byOutcome = {};
  for (const r of unlockers) {
    postDeaths += r.postUnlockVillagerCombatDeaths;
    for (const f of r.postFights) {
      if (f.outcome !== 'vDie') continue;
      byChannel[f.channel] = (byChannel[f.channel] || 0) + 1;
      byWave['w' + (f.wave || '?')] = (byWave['w' + (f.wave || '?')] || 0) + 1;
    }
    for (const f of r.postFights) {
      const k = f.channel + ':' + f.outcome;
      byOutcome[k] = (byOutcome[k] || 0) + 1;
    }
  }
  const agg = {
    n: rows.length, unlockers: unlockers.length,
    postUnlockVillagerCombatDeaths: postDeaths,
    perUnlocker: unlockers.length ? +(postDeaths / unlockers.length).toFixed(2) : null,
    deathChannel: byChannel, deathWave: byWave, fightOutcomes: byOutcome,
    medianDays: rows.map(r => r.days).sort((a, b) => a - b)[Math.floor(rows.length / 2)],
    national: rows.filter(r => r.nationalDays > 0).length,
    table: rows.filter(r => r.tableEver).length,
  };
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify({ generated: new Date().toISOString(), seeds: SEEDS, days: DAYS, agg, rows }, null, 1));
  console.log('wrote ' + out);
  console.log(JSON.stringify(agg, null, 2));
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });
