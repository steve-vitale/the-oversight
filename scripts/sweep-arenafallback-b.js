#!/usr/bin/env node
// sweep-arenafallback-b.js — judged band instrument for sim-arenafallback-b.
// One fresh harness game per (seed, origin) instance; the fight is started
// through its real entry point and the loss is forced the arenalabel way
// (player fighter HP -> 0, tbEndCheck, then tbEnd('lost')).
//   node scripts/sweep-arenafallback-b.js <outDir> <seedStart> <seedEnd>
// Writes <outDir>/<seed>-<origin>.json per instance. Repo-relative paths only.
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame } = require('./sim-harness');

const ORIGINS = ['arena-pit', 'arena-gauntlet', 'betrayal', 'tableTrial', 'coalition', 'alien', 'wild'];

async function oneInstance(seed, origin) {
  const { Game } = await loadGame({ seed });
  await setupGame(Game);
  const deaths = [];
  const regDeaths = [];
  const sayLines = [];
  const origPD = Game.playerDeath;
  Game.playerDeath = function (...a) { deaths.push(a[0]); return origPD.apply(this, a); };
  const origRD = Game.registerDeath;
  if (typeof origRD === 'function') {
    Game.registerDeath = function (rec) {
      try { if (rec && rec.villagerId === Game.villagerId) regDeaths.push(rec.cause); } catch (e) {}
      return origRD.apply(this, arguments);
    };
  }
  const origSay = Game.say;
  Game.say = function (...a) { try { sayLines.push(String(a[0] || '')); } catch (e) {} return origSay.apply(this, a); };
  const s = Game.state.scholar;
  s.abilities = [];
  Game.state.phoenixLink = null;
  const bearerBefore = Game.villagerId;
  let started = null;
  let startError = null;
  try {
    if (origin === 'arena-pit' || origin === 'arena-gauntlet') {
      const cid = origin === 'arena-gauntlet' ? 'gauntlet' : 'pit';
      const ac = { contestId: cid, arenaSuspended: false, phases: [], phaseIdx: 0 };
      Game.state.activeContest = ac;
      const r = Game._contestArena(ac, { waves: cid === 'gauntlet' ? 3 : 1 }, []);
      started = 'arena:' + cid + ':' + JSON.stringify(r && r.log) + ':arc=' + JSON.stringify(Game.state.arenaContest);
    } else if (origin === 'betrayal') {
      const roster = (Game.state.village && Game.state.village.roster) || [];
      const vid = roster.find((x) => x !== Game.villagerId);
      const r = Game.startBetrayalCombat(vid);
      started = 'betrayal:vid=' + vid + ':ret=' + !!r;
    } else if (origin === 'tableTrial') {
      Game.startCombat('finale', { tableTrial: true });
      started = 'tableTrial:' + (typeof Game.tableTrialFight === 'function' ? Game.tableTrialFight() : '?');
    } else if (origin === 'coalition') {
      Game.state.titans = Game.state.titans || {};
      Game.state.titans.musters = Game.state.titans.musters || {};
      const allies = [];
      for (let i = 0; i < 10; i++) allies.push({ vid: 'ally_' + i, villageId: 'ally-village-' + i, name: 'Ally ' + i, hp: 100 });
      Game.state.titans.musters.herald = { allies, haven: [] };
      Game.startCombat('herald');
      started = 'coalition:musterReady=' + (typeof Game.titanMusterReady === 'function' ? Game.titanMusterReady('herald') : '?');
    } else if (origin === 'alien') {
      const ok = Game.apStartEncounter('pip_quindle');
      started = 'alien:apStart=' + ok;
    } else if (origin === 'wild') {
      Game.startCombat('bulldozer');
      started = 'wild:bulldozer';
    }
  } catch (e) { startError = String(e && e.stack || e).slice(0, 500); }
  const f = Game.tbfight;
  const fight = f ? {
    betrayal: !!f.betrayal, tableTrial: !!f.tableTrial, coalitionArena: !!f.coalitionArena,
    arenaContest: !!Game.state.arenaContest,
    fighterKinds: (f.fighters || []).map((x) => x.key + ':' + x.kind + (x.alienPid ? ':' + x.alienPid : '') + (x.monsterId ? ':' + x.monsterId : '')),
  } : null;
  let labelAtLoss = null;
  try { labelAtLoss = typeof Game.tbFightDeathCause === 'function' ? Game.tbFightDeathCause(f) : null; } catch (e) { labelAtLoss = 'ERR:' + e.message; }
  if (f) {
    const p = Game.tbFighter('p');
    if (p) { p.hp = 0; p.alive = false; }
    s.health = 0;
    try { Game.tbEndCheck(); } catch (e) {}
    if (Game.tbfight && !Game.tbfight.over) { try { Game.tbEnd('lost'); } catch (e) {} }
  }
  const fallenAll = ((Game.state.village || {}).fallen || []).filter((x) => x.villagerId === bearerBefore);
  const teleAll = (Game.state.telemetry || []).filter((t) => t && t.type === 'death' && String(t.who) === String(bearerBefore));
  let lineage = null;
  try {
    const lin = typeof Game.lineage === 'function' ? Game.lineage() : [];
    const mine = lin.filter((x) => x.villagerId === bearerBefore);
    lineage = mine.length ? mine[mine.length - 1].cause : null;
  } catch (e) { lineage = 'ERR'; }
  const deathLines = sayLines.filter((l) => /is dead —/.test(l));
  return {
    seed, origin, started, startError, fight, labelAtLoss, bearerBefore,
    deaths, regDeaths,
    fallen: fallenAll.length ? fallenAll[fallenAll.length - 1] : null,
    telemetry: teleAll.length ? teleAll[teleAll.length - 1] : null,
    lineage,
    deathLine: deathLines.length ? deathLines[deathLines.length - 1] : null,
  };
}

(async () => {
  const outDir = process.argv[2];
  const seedStart = Number(process.argv[3]);
  const seedEnd = Number(process.argv[4]);
  if (!outDir || !Number.isFinite(seedStart) || !Number.isFinite(seedEnd)) {
    console.error('usage: node scripts/sweep-arenafallback-b.js <outDir> <seedStart> <seedEnd>');
    process.exit(2);
  }
  fs.mkdirSync(outDir, { recursive: true });
  let n = 0;
  for (let seed = seedStart; seed <= seedEnd; seed++) {
    for (const origin of ORIGINS) {
      const rec = await oneInstance(seed, origin);
      fs.writeFileSync(path.join(outDir, seed + '-' + origin + '.json'), JSON.stringify(rec, null, 1) + '\n');
      n++;
      console.log('wrote ' + seed + '-' + origin + ' started=' + !!rec.started + ' deaths=' + JSON.stringify(rec.deaths));
    }
  }
  console.log('DONE ' + n + ' instances -> ' + outDir);
})().catch((e) => { console.error('SWEEP CRASH', e && e.stack || e); process.exit(2); });
