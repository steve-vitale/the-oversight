#!/usr/bin/env node
// run-drinksafe-20261015.js — one sweep run (child process).
// Usage: node scripts/run-drinksafe-20261015.js <policyId> <seed> <side> <days> <outPath> [pristine]
//   side: control | armed. control loads HEAD bytes of competent.js
//   (DRINKSAFE_CONTROL) via a Module._resolveFilename hook; armed loads the
//   worktree file. Each child is a fresh process: no shared require cache.
//   Instruments: routetile + rangedehy (skipped when pristine=1).
//   Writes JSON to outPath, including competentPath (which competent.js was
//   actually loaded — per-run A/B honesty) and per-day hashes.
'use strict';
const fs = require('fs');
const path = require('path');
const Module = require('module');

const ROOT = path.join(__dirname, '..');
const [policyId, seedArg, side, daysArg, outPath, pristineArg] = process.argv.slice(2);
const seed = parseInt(seedArg, 10);
const days = parseInt(daysArg, 10) || 180;
const pristine = pristineArg === '1';
const CONTROL_PATH = process.env.DRINKSAFE_CONTROL;
if (side === 'control' && !CONTROL_PATH) {
  console.error('DRINKSAFE_CONTROL not set for control run'); process.exit(2);
}

const origResolve = Module._resolveFilename;
Module._resolveFilename = function (request, parent, isMain, options) {
  const pf = (parent && parent.filename) || '';
  if (side === 'control') {
    if (request === './competent' && /scripts[\\/]policies[\\/]/.test(pf)) return CONTROL_PATH;
    if (pf === CONTROL_PATH && request.startsWith('./')) {
      const abs = path.join(ROOT, 'scripts', 'policies', request.slice(2));
      return abs.endsWith('.js') ? abs : abs + '.js';
    }
  }
  return origResolve.call(this, request, parent, isMain, options);
};

function dayHash(Game) {
  const s = Game.state.scholar || {}, v = Game.state.village || {};
  const vw = v.water || {};
  return [s.day, Math.round(s.health || 0), Math.round(s.kcal || 0), Math.round(s.hydration || 0),
    (s.water || []).length, Math.floor(vw.clean || 0), Math.floor(vw.dirty || 0),
    (v.roster || []).length, Game.villagerId].join('|');
}
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

async function main() {
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  const policyMod = require('./policies/' + policyId);
  const policy = policyMod[policyId];
  if (!policy || typeof policy.daily !== 'function') {
    console.error(`policy ${policyId} has no daily`); process.exit(2);
  }
  const loadedKeys = Object.keys(require.cache);
  const competentPath = loadedKeys.includes(CONTROL_PATH) ? CONTROL_PATH
    : (loadedKeys.find(k => k.endsWith('scripts/policies/competent.js')) || null);

  const { Game } = await loadGame({ seed, mode: `drinksafe-${policyId}-${side}`, fullTelemetry: false });
  await setupGame(Game);
  let routeTrack = null, dehyTrack = null;
  if (!pristine) {
    routeTrack = require('./routetile-lib-20261015').installRouteTile(Game);
    dehyTrack = require('./rangedehy-lib-20261015').installRangeDehy(Game);
  }
  const hs = [];
  const oed = Game.endDay.bind(Game);
  Game.endDay = function () {
    const r = oed.apply(this, arguments);
    try { hs.push(dayHash(this)); } catch (e) { hs.push('ERR'); }
    return r;
  };
  let result = null;
  await quietLog(async () => { result = await runDays(Game, policy, { days, sampleEvery: 10 }); });

  const m = { won: false, rank: 'village', tableWaiting: false, maxWave: 1, gameDays: 0, deaths: {} };
  try { m.won = !!Game.won; } catch (e) {}
  try { m.rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) {}
  try { m.tableWaiting = !!(Game.progState ? Game.progState() : {}).tableWaiting; } catch (e) {}
  try { m.maxWave = Game.unlockedWave ? Game.unlockedWave() : 1; } catch (e) {}
  try { m.gameDays = Game.state.scholar.day || 0; } catch (e) {}
  try {
    for (const d of ((result && result.samples && result.samples.deaths) || [])) {
      const k = (d.kind || 'unknown') + ':' + (d.cause || 'unknown');
      m.deaths[k] = (m.deaths[k] || 0) + 1;
    }
  } catch (e) {}
  m.national = (RANK_ORDER[m.rank] || 0) >= 2 ? 1 : 0;

  const route = routeTrack ? routeTrack.finalize() : null;
  let dehy = null;
  if (dehyTrack) {
    const fin = dehyTrack.finalize();
    dehy = {
      nDehydration: fin.nDehydration,
      deaths: (fin.deaths || []).map(d => ({
        day: d.day,
        ranging: !!d.ranging,
        atHaven: d.atHaven,
        mapDist: d.mapDist,
        scholarName: d.scholarName,
        fullyAttributed: !!d.fullyAttributed,
      })),
      instrErrors: fin.instrErrors,
    };
  }
  const row = {
    seed, policyId, side, days: m.gameDays, requestedDays: days, pristine,
    won: m.won, rank: m.rank, national: m.national, tableWaiting: m.tableWaiting,
    maxWave: m.maxWave, deaths: m.deaths,
    hashes: hs, competentPath,
    route: route ? {
      nWaterTileVisits: route.nWaterTileVisits, nFilledVisits: route.nFilledVisits,
      nUnfilledVisits: route.nUnfilledVisits, wildFillShareOfVisits: route.wildFillShareOfVisits,
      havenFills: route.havenFills, wildFills: route.wildFills, nFills: route.nFills,
      nFillCalls: route.nFillCalls, refusedFills: route.refusedFills,
      haven: route.haven, visits: route.visits, instrErrors: route.instrErrors,
    } : null,
    dehy,
  };
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(row));
  const r = row.route || {};
  process.stderr.write(`done ${policyId} s${seed} ${side}${pristine ? ' pristine' : ''}: days=${row.days} ` +
    `visits=${r.nWaterTileVisits} filled=${r.nFilledVisits} dehy=${dehy ? dehy.nDehydration : '-'} ` +
    `competent=${competentPath ? path.basename(competentPath) : '?'}\n`);
}
main().catch(e => { console.error('CHILD HARNESS ERROR', e); process.exit(2); });
