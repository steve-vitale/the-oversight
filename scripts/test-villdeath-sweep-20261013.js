#!/usr/bin/env node
// scripts/test-villdeath-sweep-20261013.js — villager death-census wall suite
// (flesh-out scale-wall r16, arm C, 2026-10-13).
//
// 4 seeds (11/22/33/44) x POLICIES (default belongseek,leadcourt), 150d
// death-aware. Instruments: villdeath census (fights + deaths) + scale wall
// numbers (national/table/win via scale-repro, max wave unlocked).
//
// Usage:
//   LABEL=villdeath-base OUT=/tmp/villdeath-base.json node scripts/test-villdeath-sweep-20261013.js
//   LABEL=armory-after POLICIES=armoryguard OUT=/tmp/armory-after.json node scripts/test-villdeath-sweep-20261013.js
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { belongseek } = require('./policies/belongseek');
const { leadcourt } = require('./policies/leadcourt');
const { attachCensus, finalizeCensus } = require('./villdeath-census-20261013');
const { attachScale, scaleRow, finalizeScale } = require('./scale-repro-20261013');

const POLICY_REGISTRY = { belongseek, leadcourt };
try { POLICY_REGISTRY.armoryguard = require('./policies/armoryguard').armoryguard; } catch (e) {}

function maxWaveUnlocked(Game) {
  try {
    if (Game.unlockedWave) return Game.unlockedWave();
  } catch (e) {}
  return null;
}

// wall flags: national (ever held), table (ever waiting), win
function wallFlags(Game, scaleOut) {
  let rank = 'village';
  try { rank = Game.scaleRank ? (Game.scaleRank() || 'village') : 'village'; } catch (e) {}
  const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
  const national = (((RANK_ORDER[rank] || 0) >= 2) || (scaleOut && scaleOut.nationalHeldDays > 0)) ? 1 : 0;
  let table = 0;
  try { const pg = Game.progState ? Game.progState() : {}; table = pg.tableWaiting ? 1 : 0; } catch (e) {}
  return { rank, national, table, won: Game.won ? 1 : 0 };
}

async function main() {
  const label = process.env.LABEL || 'villdeath-sweep';
  const outPath = process.env.OUT || '/tmp/villdeath-sweep.json';
  const seeds = (process.env.SEEDS || '11,22,33,44').split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const policyIds = (process.env.POLICIES || 'belongseek,leadcourt').split(',').map(s => s.trim()).filter(Boolean);
  const days = parseInt(process.env.DAYS || '150', 10);
  const rows = [];
  for (const pid of policyIds) {
    const base = POLICY_REGISTRY[pid];
    if (!base) throw new Error('unknown policy: ' + pid);
    for (const seed of seeds) {
      const { Game } = await loadGame({ seed, mode: 'villdeath-' + pid });
      await setupGame(Game);
      const m = attachCensus(Game);
      attachScale(Game, m);
      const policy = Object.assign({}, base);
      const origSetup = base.setup, origDaily = base.daily;
      const ctx = { policyId: pid };
      policy.setup = (G) => { if (origSetup) { try { origSetup(G, ctx); } catch (e) {} } };
      policy.daily = (G) => {
        try { m.scale.daily.push(scaleRow(G)); } catch (e) {}
        if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
      };
      let result;
      await quietLog(async () => { result = await runDays(Game, policy, { days, sampleEvery: 10 }); });
      const row = Object.assign({ label, policy: pid, seed },
        { maxWaveUnlocked: maxWaveUnlocked(Game) },
        finalizeCensus(Game, m, result));
      const scaleOut = finalizeScale(Game, m);
      Object.assign(row, scaleOut, wallFlags(Game, scaleOut));
      rows.push(row);
      const dc = row.deathClasses;
      console.log(`[${pid} s${seed}] d=${row.days} ${row.endReason} vdeaths=${row.villagerDeaths} ` +
        `classes=${JSON.stringify(dc)} vMonsterShare=${row.villMonsterShare} ` +
        `fights=${row.fieldFights} contact=${row.contactFights} vDie=${row.vDie} vKill=${row.vKill} ` +
        `nat=${row.national} table=${row.table} won=${row.won} maxWave=${row.maxWaveUnlocked}` +
        ` npcD=${row.npcDeaths} npcClasses=${JSON.stringify(row.npcDeathClasses)}`);
    }
  }
  require('fs').writeFileSync(outPath, JSON.stringify(rows, null, 1));
  console.log('wrote ' + outPath + ' (' + rows.length + ' rows)');
}

main().catch(e => { console.error(e); process.exit(1); });
