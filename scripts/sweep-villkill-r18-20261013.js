#!/usr/bin/env node
// scripts/sweep-villkill-r18-20261013.js — VILLKILL sweep (scale-wall r18,
// ARM 3 — DIAGNOSTIC, no game changes).
//
// 8 seeds (11/22/33/44/55/66/77/88) x leadcourt/belongseek (the courtship
// road), 150d death-aware. Attaches the villkill instrument
// (scripts/villkill-20261013.js) plus the r17 table-recon instrument for
// wall numbers, and answers: on the courtship road, does the VILLAGE (NPCs)
// kill wave-3 monsters at all, and does the ledger's kill-only rung count
// those kills?
//
// Per seed: villager wave-3 kills by type x source (scholar-tb /
// field-vessel / field-npc), waveLedgerPoints(3) deltas tied to each kill,
// whether any wave-3 kills occurred, and whether the kill rung (4 pts) closed
// via village action. Wall numbers every run: national / table / wins,
// wave 4-5 unlocks, median survival.
//
// Usage:
//   SEEDS="11,22,33,44,55,66,77,88" POLICIES="leadcourt,belongseek" DAYS=150 \
//   OUT=evidence/2026-10-13/sim-scale-wall-r18-villkill.json \
//   node scripts/sweep-villkill-r18-20261013.js
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { leadcourt } = require('./policies/leadcourt');
const { belongseek } = require('./policies/belongseek');
const vk = require('./villkill-20261013');
const tr = require('./sweep-tablerecon-20261013');

const POLICY_REGISTRY = { leadcourt, belongseek };
const day = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };

async function runSweep(opts) {
  opts = opts || {};
  const label = opts.label || process.env.LEVER || 'villkill-r18';
  const seeds = opts.seeds || (process.env.SEEDS || '11,22,33,44,55,66,77,88').split(',').map(x => parseInt(x.trim(), 10)).filter(Number.isFinite);
  const policyIds = opts.policies || (process.env.POLICIES || 'leadcourt,belongseek').split(',').map(x => x.trim()).filter(Boolean);
  const days = opts.days || parseInt(process.env.DAYS || '150', 10);
  const commit = (() => { try { return require('child_process').execSync('git rev-parse --short HEAD', { cwd: __dirname + '/..' }).toString().trim(); } catch (e) { return 'unknown'; } })();
  const rows = [];
  for (const pid of policyIds) {
    const base = POLICY_REGISTRY[pid];
    if (!base) throw new Error('unknown policy: ' + pid);
    for (const seed of seeds) {
      const { Game } = await loadGame({ seed, mode: 'villkill-' + pid });
      await setupGame(Game);
      const m = {};
      vk.attachVillKill(Game, m);
      const t = tr.attachTable(Game, m);
      let maxWave = 1, maxArc = 1;
      const policy = Object.assign({}, base);
      const origDaily = base.daily;
      policy.daily = (G, ctx) => {
        try {
          const d = day(G);
          if (d % 5 === 0) { const r = tr.tableRow(G); t.rows.push(r); tr.trackBest(t, r); }
          try { const wv = (G.unlockedWave && G.unlockedWave()) || 1; if (wv > maxWave) maxWave = wv; } catch (e) {}
          try { const a = (G.progState && G.progState().arc) || 1; if (a > maxArc) maxArc = a; } catch (e) {}
        } catch (e) {}
        if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
      };
      const result = await quietLog(() => runDays(Game, policy, { days, sampleEvery: 10 }));
      let won = false;
      try { won = !!Game.won; } catch (e) {}
      const v = vk.finalizeVillKill(Game, m);
      const row = {
        label, policy: pid, seed, commit,
        days: result.days, endReason: result.endReason, won: won ? 1 : 0,
        waveReach: maxWave, maxArc,
        nationalFirstDay: t.nationalFirstDay,
        national: t.nationalFirstDay != null ? 1 : 0,
        tableWaiting: t.waitingDay != null ? 1 : 0,
        tableDone: t.doneDay != null ? 1 : 0,
        arc4: t.arc4Day != null ? 1 : 0,
        wave3Kills: v.wave3Kills,
        scholarKills: v.scholarKills, vesselKills: v.vesselKills, npcKills: v.npcKills,
        villageKills: v.villageKills,
        scholarPts: v.scholarPts, villagePts: v.villagePts,
        ledgerPtsFinal: v.ledgerPtsFinal,
        rungClosed: v.rungClosed ? 1 : 0,
        rungCloseDay: v.rungCloseDay, rungCloseSrc: v.rungCloseSrc,
        rungClosedViaVillage: v.rungClosedViaVillage ? 1 : 0,
        byType: v.byType,
        killLog: v.killLog,
        nonWave3Kills: v.nonWave3Kills,
        deaths: (t.deaths || []).length,
      };
      rows.push(row);
      const kt = Object.entries(v.byType).map(([id, e]) => `${id.split('_')[0]}:s${e.scholar}/v${e.vessel}/n${e.npc}/+${e.pts}`).join(' ');
      console.log(`  [${pid} s${seed}] d=${row.days} ${row.endReason} nat=${row.nationalFirstDay == null ? '-' : row.nationalFirstDay} won=${row.won} w3kills=${v.wave3Kills}(s/v/n=${v.scholarKills}/${v.vesselKills}/${v.npcKills}) w3pts=${v.ledgerPtsFinal}(village+${v.villagePts}) rung=${v.rungClosed ? 'CLOSED' + (v.rungClosedViaVillage ? '-VILLAGE' : '') : 'open'} ${kt}`);
    }
  }
  const agg = (fn) => rows.reduce((x, r) => x + (fn(r) || 0), 0);
  const med = (vs) => { vs = vs.slice().sort((a, b) => a - b); return vs.length ? vs[Math.floor(vs.length / 2)] : 0; };
  const summary = {
    label, seeds, policies: policyIds, days, runs: rows.length, commit,
    national: agg(r => r.national), tableWaiting: agg(r => r.tableWaiting),
    tableDone: agg(r => r.tableDone), arc4: agg(r => r.arc4), won: agg(r => r.won),
    wave4unlock: agg(r => r.waveReach >= 4 ? 1 : 0),
    wave5unlock: agg(r => r.waveReach >= 5 ? 1 : 0),
    medianDays: med(rows.map(r => r.days)), maxDays: Math.max(0, ...rows.map(r => r.days)),
    // the arm's answer, aggregated
    wave3Kills: agg(r => r.wave3Kills),
    scholarKills: agg(r => r.scholarKills), vesselKills: agg(r => r.vesselKills), npcKills: agg(r => r.npcKills),
    scholarPts: agg(r => r.scholarPts), villagePts: agg(r => r.villagePts),
    rungClosed: agg(r => r.rungClosed), rungClosedViaVillage: agg(r => r.rungClosedViaVillage),
    seedsWithVillagerW3Kill: agg(r => r.villageKills > 0 ? 1 : 0),
    nonWave3Kills: agg(r => r.nonWave3Kills),
  };
  return { summary, rows };
}

if (require.main === module) {
  (async () => {
    const t0 = Date.now();
    const rep = await runSweep({});
    const s = rep.summary;
    console.log(`\n=== ${s.label} === policies=[${s.policies.join(',')}] seeds=[${s.seeds.join(',')}] days=${s.days} (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
    console.log(`wall: national ${s.national}/${s.runs} tableWaiting ${s.tableWaiting}/${s.runs} tableDone ${s.tableDone}/${s.runs} arc4 ${s.arc4}/${s.runs} won ${s.won}/${s.runs} wave4unlock ${s.wave4unlock}/${s.runs} wave5unlock ${s.wave5unlock}/${s.runs} medianDays ${s.medianDays} maxDays ${s.maxDays}`);
    console.log(`VILLKILL ANSWER: wave-3 kills total ${s.wave3Kills} (scholar ${s.scholarKills} / vessel ${s.vesselKills} / npc ${s.npcKills}); ledger pts scholar+${s.scholarPts} village+${s.villagePts}; kill rung closed ${s.rungClosed}/${s.runs} (via village ${s.rungClosedViaVillage}/${s.runs}); seeds with any villager wave-3 kill ${s.seedsWithVillagerW3Kill}/${s.runs}`);
    const out = process.env.OUT;
    if (out) { fs.writeFileSync(out, JSON.stringify(rep, null, 1)); console.error('wrote ' + out); }
  })().catch(e => { console.error('FATAL', e); process.exit(1); });
}

module.exports = { runSweep };
