#!/usr/bin/env node
// sweep-w5census-r27-20261014.js — wave-5 census EXTENSION (scale-onramp r27,
// ARM 3 diagnostic instrument, loop A, 2026-10-14).
//
// INSTRUMENT ONLY — no game-code changes. Extends the r26 census with:
//   (HOLLOW UNLOCK #134) VILLAGER-level post-unlock rows: roster size over
//   time, villager deaths by cause in the post-unlock window, pantry/food
//   state, trust bands — answering WHY the roster collapses when the mantle
//   survives (s88: village-lost d87 with the scholar alive).
//   (48H CHAINS #90) "combat succession within 48h of the previous" chain
//   metric on the scholar census rows — the same-day multi-death metric
//   misses d91->d92->d93 and d75->d76 chains (same pathology, different
//   clock).
//   (PERSON-FIGHT SPLITS) tbEnd instrument wrap snapshots the LIVE tbfight
//   object (uprising/betrayal/aggressor flags, alienPid fighters) so the
//   alien-duel vs uprising vs betrayal split is determinable from existing
//   telemetry where the flags are readable. Read-only: proven byte-identical
//   by scripts/test-hollow-instrument-20261014.js (PART B).
//
// Policy: leadfeast (leadcourt + FEASTSCALE_R13=1). Seeds 11..88, 180d
// death-aware (same as r26 so the two censuses are comparable). DIAGNOSTIC —
// no before/after comparison: per-run nondeterminism (r25) makes
// identical-seed before/after unmeasurable for this question.
//
// Usage:
//   SEEDS="11,22,33,44,55,66,77,88" DAYS=180 OUT=evidence/2026-10-14/w5census-r27.json \
//     node scripts/sweep-w5census-r27-20261014.js
'use strict';
process.env.FEASTSCALE_R13 = '1';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { leadfeast } = require('./policies/feastscale');
const { stdSnapshot } = require('./sweep-compare');
const { buildCensusRows, pairFights, findChains, aggregateRows,
  buildVillagerRows, aggregateVillagerRows, classifyPersonFight,
  findCombatChains48, buildVillageProfile } = require('./w5census-lib');

const MONSTERS = require('../src/data/monsters.json');
const NAME_OF = {};
const MONSTER_NAMES = new Set();
for (const m of MONSTERS) {
  const n = m.name || m.id;
  NAME_OF[m.id] = n;
  MONSTER_NAMES.add(n);
  MONSTER_NAMES.add(m.id);
}
const nameOf = (mid) => NAME_OF[mid] || mid || '?';

const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

// Hollow-focused say filter: the deaths, the hunger, the leaving. Bounded.
const SAYRE = /died|dead|starv|hunger|grief|moot|funeral|scholar|mantle|left the|walked away|gone|🕯|💀|exil/i;

// dayHash (same shape as scripts/det-gate.js): coarse per-day state identity
// for the instrument-honesty check (opts.collectHashes). Read-only.
function dayHash(Game) {
  try {
    const s = (Game.state || {}).scholar || {}, v = (Game.state || {}).village || {};
    let standing = 0;
    try { standing = Math.round(((Game.villageStanding ? Game.villageStanding() : null) || {}).total || 0); } catch (e) {}
    return [s.day, Math.round(s.health || 0), Math.round(s.kcal || 0),
      (v.roster || []).length,
      Math.round(((v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0)) / 100),
      standing].join('|');
  } catch (e) { return 'ERR'; }
}

async function runOne(seed, opts) {
  opts = opts || {};
  const days = opts.days || 180;
  const wraps = opts.wraps || 'all'; // 'none' = instrument-honesty control
  const instrErrors = [];
  const { Game } = await loadGame({ seed, mode: 'w5census', fullTelemetry: true });
  await setupGame(Game);

  const track = {
    unlockDay: {},            // wave -> first day seen
    w5Standing: null,
    w5Rank: null,
    tableDays: [],
    tenures: [],
    maxRank: 0, maxArc: 1,
    exiledEver: false,
    firstW5Fight: null,
    villageCurve: [],         // r27: per-day roster/pantry/trust/standing
    personFights: [],         // r27: tbEnd instrument captures
    sayLines: [],             // r27: hollow-filtered transcript lines
    dayHashes: [],            // r27: per-day state hashes (collectHashes only)
  };
  const gday = (G) => ((G && G.state && G.state.scholar) || {}).day || 0;

  // --- instrument wraps (all read-only; proof test proves byte-identical) ---
  if (wraps === 'all') {
    // tbEnd snapshot: capture the LIVE tbfight person-fight flags before
    // call-through. This is the ONLY determinable source for the
    // alien-duel/uprising/betrayal split (#133 stays open in the engine).
    try {
      const origTbEnd = Game.tbEnd.bind(Game);
      Game.tbEnd = function (result) {
        try {
          const f = this.tbfight;
          if (f && f.fighters && !f.over) {
            const fighters = f.fighters || [];
            const hasMonster = fighters.some(x => x && (x.monsterId || x.kind === 'monster'));
            if (!hasMonster) {
              const hasAlienPid = fighters.some(x => x && x.kind === 'hostile' && x.alienPid);
              track.personFights.push({
                day: gday(this),
                uprising: !!f.uprising, betrayal: !!f.betrayal,
                aggressor: f.aggressor || null,
                hasAlienPid,
                result: result || null,
                hostileNames: fighters.filter(x => x && x.kind === 'hostile')
                  .map(x => String(x.name || x.key || '?')).slice(0, 6),
              });
            }
          }
        } catch (e) { instrErrors.push('tbEndSnap: ' + e.message); }
        return origTbEnd(result);
      };
    } catch (e) { instrErrors.push('tbEndWrap: ' + e.message); }
    // say capture for sense-testing (SENSE-TESTING LAW): bounded, read-only.
    try {
      const origSay = Game.say ? Game.say.bind(Game) : null;
      Game.say = function (msg) {
        try {
          const text = String((msg && (msg.text || msg.msg || msg.message)) || msg || '');
          if (SAYRE.test(text) && track.sayLines.length < 800) {
            track.sayLines.push({ day: gday(Game),
              text: text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').slice(0, 240) });
          }
        } catch (e) {}
        return origSay ? origSay(msg) : msg;
      };
    } catch (e) { instrErrors.push('sayWrap: ' + e.message); }
  }

  let lastVid = null;
  const origDaily = leadfeast.daily;
  const policy = Object.assign({}, leadfeast);
  policy.daily = (G, ctx) => {
    try {
      const day = gday(G);
      const s = (G.state || {}).scholar || {};
      const wv = (G.unlockedWave && G.unlockedWave()) || 1;
      for (let w = 1; w <= wv; w++) {
        if (track.unlockDay[w] == null) {
          track.unlockDay[w] = day;
          if (w === 5) {
            try { track.w5Standing = G.villageStanding ? ((G.villageStanding() || {}).total | 0) : null; } catch (e) {}
            try { track.w5Rank = G.scaleRank ? G.scaleRank() : null; } catch (e) {}
          }
        }
      }
      try { const pg = G.progState ? G.progState() : {}; if (pg.tableWaiting) track.tableDays.push(day); } catch (e) {}
      try {
        const vid = G.villagerId != null ? G.villagerId : s.villagerId;
        if (vid != null && vid !== lastVid) {
          track.tenures.push({ vid, startDay: day });
          lastVid = vid;
        }
      } catch (e) {}
      try { const s2 = stdSnapshot(G); track.maxRank = Math.max(track.maxRank, RANK_ORDER[s2.rank] || 0); track.maxArc = Math.max(track.maxArc, s2.arc || 1); } catch (e) {}
      try { if (G.state && G.state.exiled) track.exiledEver = true; } catch (e) {}
      if (opts.collectHashes) { try { track.dayHashes.push(day + ':' + dayHash(G)); } catch (e) {} }
      if (wraps === 'all') {
        // r27 village curve: roster, pantry kcal, trust bands, standing —
        // keyed by game-day; the lib dedupes (last write per game-day wins).
        try {
          const v = (G.state || {}).village || {};
          const tvals = Object.values(v.trust || {});
          let tmean = null, tmin = null, low = 0, mid = 0, high = 0;
          if (tvals.length) {
            tmean = +(tvals.reduce((a, b) => a + b, 0) / tvals.length).toFixed(1);
            tmin = Math.min.apply(null, tvals);
            for (const t of tvals) { if (t < 30) low++; else if (t <= 60) mid++; else high++; }
          }
          let standing = null;
          try { standing = G.villageStanding ? ((G.villageStanding() || {}).total | 0) : null; } catch (e) {}
          track.villageCurve.push({
            day,
            roster: ((v.roster) || []).length,
            pantryKcal: Math.round(((v.pantry || []).reduce((a, i) => a + ((i.kcalEach || 0) * (i.units || 1)), 0))),
            trustMean: tmean, trustMin: tmin, trustN: tvals.length,
            low, mid, high, standing,
          });
        } catch (e) { instrErrors.push('curve: ' + e.message); }
      }
    } catch (e) { instrErrors.push('daily: ' + e.message); }
    if (origDaily) { try { return origDaily(G, ctx); } catch (e) { instrErrors.push('origDaily: ' + e.message); } }
  };

  const result = await quietLog(() => runDays(Game, policy, { days, sampleEvery: 10 }));
  const end = stdSnapshot(Game);

  // --- post-run census assembly ---
  const tele = (Game.state || {}).telemetry || [];
  const playerDeaths = [];
  const villagerDeaths = [];
  for (const d of (result.samples.deaths || [])) {
    if (d.player) playerDeaths.push({ day: d.day, who: d.who, cause: d.cause });
    else if (d.kind === 'villager' || d.kind === 'person') villagerDeaths.push({ day: d.day, who: d.who, cause: d.cause, kind: d.kind });
  }
  const combatStarts = tele
    .filter(e => e.type === 'combat_start')
    .map(e => ({ day: e.day, mid: e.vs, wave: e.wave || null, pack: e.pack || 1 }));
  for (const c of combatStarts) {
    if (c.wave >= 5 && (track.firstW5Fight == null || c.day < track.firstW5Fight)) track.firstW5Fight = c.day;
  }
  const combatEnds = tele
    .filter(e => e.type === 'combat_end')
    .map(e => ({ day: e.day, result: e.result || null }));
  const pairs = pairFights(combatStarts, combatEnds);
  const U = track.unlockDay[5] != null ? track.unlockDay[5] : null;

  // r26 scholar census (unchanged) + r27 person-fight subtype attachment
  const { rows, reconciliation } = buildCensusRows({
    unlockDayW5: U,
    playerDeaths,
    tenures: track.tenures,
    combatStarts,
    pairs,
    nameOf,
    tableDays: track.tableDays,
    monsterNames: MONSTER_NAMES,
  });
  let subtypeAttached = 0;
  for (const r of rows) {
    if (r.pairedFight && r.pairedFight.personFight) {
      let best = null, bestD = 2;
      for (const pf of track.personFights) {
        const dd = Math.abs(pf.day - (r.pairedFight.endDay != null ? r.pairedFight.endDay : r.deathDay));
        if (dd <= 1 && dd < bestD) { bestD = dd; best = pf; }
      }
      r.pairedFight.subtype = best ? classifyPersonFight(best) : 'unknown-person';
      r.pairedFight.subtypeDay = best ? best.day : null;
      if (best) r.pairedFight.hostileNames = best.hostileNames;
      subtypeAttached += 1;
    }
  }

  // r27 villager-level post-unlock census (HOLLOW UNLOCK #134)
  const { rows: vrows, reconciliation: vrecon } = buildVillagerRows({
    unlockDayW5: U,
    villagerDeaths,
    tenures: track.tenures,
    monsterNames: MONSTER_NAMES,
  });
  const villagerReconciled = vrecon.rows === vrecon.postUnlockVillagerDeaths;
  const reconciled = reconciliation.rows === reconciliation.postUnlockDeaths;

  // r27 48h combat-succession chains (#90) + village profile (per unlocker)
  const chains48 = findCombatChains48(rows);
  const profile = U != null ? buildVillageProfile(track.villageCurve, vrows, U) : null;

  const row = {
    seed, days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    wave5Unlocked: U != null, unlockDayW5: U, unlockDay: track.unlockDay,
    w5Standing: track.w5Standing, w5Rank: track.w5Rank,
    firstW5Fight: track.firstW5Fight,
    maxArc: track.maxArc,
    maxRank: Object.keys(RANK_ORDER).find(k => RANK_ORDER[k] === track.maxRank) || 'village',
    tableDays: track.tableDays.length, firstTableDay: track.tableDays.length ? track.tableDays[0] : null,
    exiled: track.exiledEver,
    tenures: track.tenures.length,
    tenureVids: track.tenures.map(t => t.vid),
    playerDeaths: playerDeaths.length,
    instrErrors: instrErrors.length,
    reconciliation: Object.assign({}, reconciliation, { reconciled }),
    census: rows,
    chains: findChains(rows),
    // r27
    villagerDeathsTotal: villagerDeaths.length,
    villagerRows: vrows,
    villagerReconciliation: Object.assign({}, vrecon, { reconciled: villagerReconciled }),
    villagerAgg: aggregateVillagerRows(vrows),
    chains48,
    personFightCaptures: track.personFights.length,
    subtypeAttached,
    villageProfile: profile,
    storyLines: track.sayLines, // full bounded capture (<=800) — late collapse needs the tail, not the head
    storyLineCount: track.sayLines.length,
    dayHashes: track.dayHashes,
  };
  if (opts.verbose !== false) {
    console.log(`  [leadfeast seed ${seed}] days=${row.days} end=${row.endReason} ` +
      `w5=${row.wave5Unlocked ? 'd' + U : 'no'} w5stand=${row.w5Standing} ` +
      `censusRows=${rows.length} recon=${reconciled ? 'OK' : 'FAIL'} ` +
      `villRows=${vrows.length} villRecon=${villagerReconciled ? 'OK' : 'FAIL'} ` +
      `chains48=${chains48.length} pfCapt=${track.personFights.length} ` +
      `instrErr=${instrErrors.length}`);
  }
  return row;
}

async function main() {
  const seeds = (process.env.SEEDS || '11,22,33,44,55,66,77,88').split(',')
    .map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const days = parseInt(process.env.DAYS || '180', 10);
  const out = process.env.OUT || 'evidence/2026-10-14/w5census-r27.json';
  const commit = (() => { try { return require('child_process').execSync('git rev-parse --short HEAD', { cwd: __dirname + '/..' }).toString().trim(); } catch (e) { return 'unknown'; } })();
  const runs = [];
  for (const seed of seeds) runs.push(await runOne(seed, { days }));
  const allRows = runs.flatMap(r => r.census.map(c => Object.assign({ seed: r.seed }, c)));
  const allVRows = runs.flatMap(r => r.villagerRows.map(c => Object.assign({ seed: r.seed }, c)));
  const agg = aggregateRows(allRows);
  const vagg = aggregateVillagerRows(allVRows);
  // chains are per-seed (a pooled chain mixes seeds); replace the pooled one
  agg.chains = runs.filter(r => r.chains && r.chains.length)
    .map(r => ({ seed: r.seed, chains: r.chains }));
  // per-seed 48h chains — report the suite-wide chain count and depths
  const chains48Suite = runs.filter(r => r.chains48 && r.chains48.length)
    .map(r => ({ seed: r.seed, chains: r.chains48 }));
  const maxDepth48 = chains48Suite.length
    ? Math.max.apply(null, chains48Suite.flatMap(r => r.chains.map(c => c.depth))) : 0;
  const chainRuns48 = chains48Suite.length;
  const unlockers = runs.filter(r => r.wave5Unlocked).length;
  const report = {
    label: 'w5census-r27', policy: 'leadfeast', seeds, days, commit,
    generated: new Date().toISOString(),
    note: 'DIAGNOSTIC ARM — instrument-only extension of r26. No before/after: per-run nondeterminism (r25) makes identical-seed before/after unmeasurable for this question. Villager rows + 48h chains + person-fight subtypes added.',
    runs,
    censusAggregate: agg,
    villagerAggregate: vagg,
    chains48Suite, maxDepth48, chainRuns48,
    unlockers, censusRows: allRows.length, villagerRows: allVRows.length,
    reconFailures: runs.filter(r => !r.reconciliation.reconciled).map(r => r.seed),
    villagerReconFailures: runs.filter(r => !r.villagerReconciliation.reconciled).map(r => r.seed),
  };
  fs.writeFileSync(path.resolve(__dirname, '..', out), JSON.stringify(report, null, 1));
  console.log(`wrote ${out}`);
  console.log(`unlockers: ${unlockers}/${seeds.length}  census rows: ${allRows.length}  villager rows: ${allVRows.length}  ` +
    `recon failures: ${report.reconFailures.length ? report.reconFailures.join(',') : 'none'}  ` +
    `villager recon failures: ${report.villagerReconFailures.length ? report.villagerReconFailures.join(',') : 'none'}`);
  console.log('top villager causes:', vagg.top3.map(c => `${c.cause}:${c.n} (${(c.share * 100).toFixed(0)}%)`).join('  '));
  console.log(`48h combat chains: ${chainRuns48} runs with chains, max depth ${maxDepth48}`);
  return report;
}

if (require.main === module) {
  main().catch(e => { console.error('FATAL', e); process.exit(1); });
}

module.exports = { runOne, SEEDS: '11,22,33,44,55,66,77,88', POLICY: 'leadfeast' };
