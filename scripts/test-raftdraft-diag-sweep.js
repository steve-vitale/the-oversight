#!/usr/bin/env node
// scripts/test-raftdraft-diag-sweep.js — sim-raftdraft-a pilot + proof
// (scale-onramp axis, 2026-10-25: raid draft composition diag; DIAG
// ONLY, zero src/js changes).
//
// PAIRING (exact, identical seeds — the landed arrivaltrace /
// fieldfinish substrate invocation, unchanged):
//   baseline = scripts/policies/tableseat-nowait.js (LEANLINKRESCUE=1,
//     TABLESEATNOWAIT=1, RAFTDRAFT unset). Post-run rows carry a
//     pure-read snapshot only (deed feed wavesFaced + waveKillLog).
//   armed    = tableseat-nowait wrapped with scripts/policies/
//     raftdraft-diag.js (RAFTDRAFT=1): havenRaidTick pool-before /
//     post-after + fieldFight wraps. Observational only.
// Substrate: seeds 73671–73678, 180d death-aware (runDays stops on
// death/win; 180 is the cap, not a fixed horizon — MEASUREMENT §10).
// Invocation difference from the landed pattern: NONE except the
// recorder module itself (raftdraft-diag in place of
// arrivaltrace-diag) and the env on-switch (RAFTDRAFT in place of
// ARRIVATRACE). The policy, seeds, horizon, harness calls
// (loadGame seed/mode/fullTelemetry:false, setupGame, runDays
// sampleEvery 10) and the per-seed incremental row writer are the
// landed pattern verbatim.
//
// Modes (per-seed invocation preferred — a vanished long sweep lost
// work on a predecessor run; every row is written incrementally):
//   --one <baseline|armed> <seed> : run one seed, write its row.
//   --summary : build summary.json from the rows on disk, print gates.
//   --detgate : G1 delegation proof on one seed (SEED env, default
//     73671): tableseat-nowait vs raftdraft-wrapped tableseat-nowait
//     with RAFTDRAFT unset must match on days/gameDays/ts with no
//     _raftdraft surface and no installed wraps. Exit 1 on mismatch.
//   --detail <seed> : re-run armed on ONE seed, census-match check
//     (days/gameDays/ts/field counts/raid rows) must pass or exit 1.
//   --sense <seed> : NON-MEASURED narration replay, written to
//     evidence/2026-10-25/sim-raftdraft-a-sense.txt (narration shifts
//     trajectories; never enters the census).
//
// Proof gates (failures exit 1 in --summary mode):
//   G1 det-gate: see --detgate (run separately).
//   G2 recorder neutrality: for ALL 8 seeds, baseline vs armed days,
//     gameDays, ts counters and starvation identical; faced/kills agree.
//   G3 corpus integrity: 16/16 rows, no zero-day rows, every armed row
//     carries persisted raid rows + field rows, every baseline row
//     carries the post-run pure-read snapshot, zero recorder errors.
//   DIAG-GO (the pre-registered bar, judged only here): (a) census
//     complete on 8/8 seeds with zero recorder errors, (b) the summary
//     reports raider wave shares, exactly-1HP share, raid count and
//     pantry-tier mix, and a pool-vs-draft comparison answering
//     whether nearest-draft selection or pool composition explains
//     the wave-1/2 dominance, and (c) a lever is named with numbers
//     (or none is supported). A DIAG finding is not a lever GO.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { tableseatNowait } = require('./policies/tableseat-nowait');
const { copyKillLog } = require('./policies/vetkill-diag');
const {
  newStore, installRaftdraftDiag, withRaftdraftDiag,
} = require('./policies/raftdraft-diag');
const PI = require('./postunlock-instrument');

const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
const STARV_RE = /starv|hunger/i;
const SEEDS = (process.env.SEEDS || '73671,73672,73673,73674,73675,73676,73677,73678')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
function medianOf(arr) {
  if (!arr.length) return 0;
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}
function meanOf(arr) {
  if (!arr.length) return null;
  return arr.reduce((t, x) => t + x, 0) / arr.length;
}
function sleepMs(ms) { try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); } catch (e) { /* sleep best-effort */ } }
function writeFileRetry(p, body) {
  let lastErr = null;
  for (let a = 1; a <= 8; a++) {
    try { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, body); return; }
    catch (e) {
      lastErr = e;
      console.log(`WRITE-RETRY ${path.basename(p)} attempt=${a} err=${String((e && e.message) || e).slice(0, 160)}`);
      if (a < 8) sleepMs(Math.min(10000, 1000 * a));
    }
  }
  throw lastErr;
}
function snap(Game) {
  const out = { won: false, arc: 1, tableWaiting: false, tableEntered: false, rank: 'village' };
  try { out.won = !!Game.won; } catch (e) { /* best-effort */ }
  try { const pg = Game.progState ? Game.progState() : {}; out.arc = pg.arc || 1; out.tableWaiting = !!pg.tableWaiting; out.tableEntered = !!pg.tableDone; } catch (e) { /* best-effort */ }
  try { out.rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) { /* best-effort */ }
  return out;
}
function deathSummary(deaths) {
  const m = {};
  for (const d of (deaths || [])) {
    const k = (d.player ? 'player:' : 'villager:') + String(d.cause || 'unknown');
    m[k] = (m[k] || 0) + 1;
  }
  return m;
}
function copyFaced(Game) {
  const out = { faced: {}, errs: 0, error: null };
  try {
    const ds = (typeof Game.deedState === 'function') ? Game.deedState() : null;
    const faced = (ds && ds.wavesFaced) || {};
    for (const k of Object.keys(faced)) out.faced[k] = faced[k] | 0;
  } catch (e) { out.errs++; out.error = 'wavesFaced: ' + String((e && e.message) || e).slice(0, 100); }
  return out;
}

function raftdraftSnapshot(Game, store) {
  const faced = copyFaced(Game);
  const log = copyKillLog(Game);
  const snapOut = { faced: faced.faced, facedErrs: faced.errs, facedError: faced.error, logEntries: log.entries, logErrs: log.errs, logError: log.error };
  if (!store) { snapOut.analysis = null; snapOut.note = 'snapshot-only: no draft rows on the baseline arm'; return snapOut; }
  snapOut.raids = store.raids;
  snapOut.calls = store.calls;
  snapOut.fieldFights = store.fieldFights;
  snapOut.diag = { errs: store.errs, errors: store.errors, overflow: store.overflow, installed: store.installed };
  return snapOut;
}

async function runOne(pid, seed, days, evidDir, storeHolder) {
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  let store = null;
  if (pid === 'armed') { process.env.RAFTDRAFT = '1'; store = newStore(); if (storeHolder) storeHolder.store = store; }
  else delete process.env.RAFTDRAFT;
  const base = pid === 'armed'
    ? withRaftdraftDiag(tableseatNowait, 'raftdraft-diag', 'tableseat-nowait + raid draft census', store)
    : tableseatNowait;
  const { Game } = await loadGame({ seed, mode: 'raftdraft-diag-' + pid, fullTelemetry: false });
  await setupGame(Game);
  if (pid === 'armed') { try { installRaftdraftDiag(Game, store); } catch (e) { /* install best-effort; daily hook retries */ } }
  const hist = { maxRank: 0, maxArc: 1, everTable: false, everEntered: false };
  let capturedCtx = null;
  const policy = Object.assign({}, base, {
    daily(G, ctx) {
      if (!capturedCtx) capturedCtx = ctx;
      try {
        const s = snap(G);
        hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[s.rank] || 0);
        hist.maxArc = Math.max(hist.maxArc, s.arc || 1);
        if (s.tableWaiting) hist.everTable = true;
        if (s.tableEntered) hist.everEntered = true;
      } catch (e) { /* hist best-effort */ }
      if (base.daily) { try { return base.daily(G, ctx); } catch (e) { /* delegate best-effort */ } }
    },
  });
  const result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 10 });
  const end = snap(Game);
  const rd = raftdraftSnapshot(Game, store);
  const ts = {};
  const ctxExtra = {};
  if (capturedCtx) {
    for (const k of Object.keys(capturedCtx)) {
      if (k.indexOf('ts') === 0) ts[k] = capturedCtx[k];
      if (k.indexOf('court') === 0 || k === 'tended' || k === 'proposedLead' || k === 'defenseCalls') ctxExtra[k] = capturedCtx[k];
    }
  }
  const deaths = result.samples.deaths || [];
  const starv = deaths.filter(d => STARV_RE.test(String(d.cause || '')));
  const last = (arr) => (arr && arr.length ? arr[arr.length - 1][1] : null);
  const row = {
    policy: pid, seed,
    days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    won: end.won ? 1 : 0,
    waveReach: result.maxWaveUnlocked || 1,
    maxArc: hist.maxArc,
    finalRank: end.rank,
    maxRank: Object.keys(RANK_ORDER).find(k => RANK_ORDER[k] === hist.maxRank) || 'village',
    nationalEver: Math.max(hist.maxRank, RANK_ORDER[end.rank] || 0) >= 2 ? 1 : 0,
    nationalFinal: (RANK_ORDER[end.rank] || 0) >= 2 ? 1 : 0,
    table: (hist.everTable || end.tableWaiting) ? 1 : 0,
    entered: (hist.everEntered || end.tableEntered) ? 1 : 0,
    deaths: deathSummary(deaths),
    deathTotal: deaths.length,
    starvationDeaths: starv.length,
    starvationDetail: starv.map(d => ({ day: d.day, who: d.who, cause: d.cause, player: !!d.player })),
    ts, ctxExtra,
    finalPop: last(result.samples.pop), finalPantry: last(result.samples.pantry),
    finalKnown: last(result.samples.knowledge),
    raftdraft: rd,
    diag: store ? { errs: store.errs, overflow: store.overflow } : null,
  };
  if (evidDir) {
    const fn = path.join(evidDir, `s${seed}-${pid}.json`);
    writeFileRetry(fn, JSON.stringify(row, null, 1) + '\n');
    row.corpusFile = fn;
  }
  return row;
}

function evidDirOf() { return process.env.EVID || path.join(REPO, 'evidence', '2026-10-25', 'perseed-raftdraft-a'); }

async function oneMode(pid, seedArg) {
  const seed = parseInt(seedArg, 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const evidDir = evidDirOf();
  fs.mkdirSync(evidDir, { recursive: true });
  const row = await runOne(pid, seed, days, evidDir);
  const rd = row.raftdraft;
  const line = rd.raids
    ? `raids=${rd.raids.length} raiders=${rd.raids.reduce((t, r) => t + (r.raiders || []).length, 0)} calls=${rd.calls.length} field=${rd.fieldFights.length} errs=${rd.diag.errs}`
    : `snapshot-only faced=${Object.keys(rd.faced || {}).length} kills=${(rd.logEntries || []).length}`;
  console.log(`  [${pid} seed ${seed}] days=${row.days} gameDays=${row.gameDays} end=${row.endReason} wave=${row.waveReach} arc=${row.maxArc} finalRank=${row.finalRank} natEver=${row.nationalEver} natFinal=${row.nationalFinal} table=${row.table} entered=${row.entered} won=${row.won} starv=${row.starvationDeaths} ${line} ts=${JSON.stringify(row.ts)}`);
}

// ---- analysis (summary only; the recorder stores raw rows) ----
function analyzeDraft(armedRows) {
  const raids = [];
  for (const r of armedRows) for (const x of (r.raftdraft.raids || [])) raids.push(Object.assign({ seed: r.seed }, x));
  const field = [];
  for (const r of armedRows) for (const f of (r.raftdraft.fieldFights || [])) field.push(Object.assign({ seed: r.seed }, f));
  const raiders = [];
  for (const raid of raids) for (const x of (raid.raiders || [])) raiders.push(Object.assign({ seed: raid.seed, raidDay: raid.day, pantry: raid.pantry, raidN: raid.raidN }, x));
  const waveShare = (arr) => {
    const c = {};
    for (const x of arr) { const w = x.wave || 1; c[w] = (c[w] || 0) + 1; }
    const tot = arr.length || 1;
    const out = {};
    for (const k of Object.keys(c).sort((a, b) => a - b)) out[k] = { n: c[k], share: c[k] / arr.length };
    out._total = arr.length;
    return out;
  };
  // Pool composition pooled across raids: sum of per-raid pool counts.
  const poolByWave = {};
  let poolTotal = 0;
  for (const raid of raids) {
    for (const k of Object.keys(raid.poolByWave || {})) { poolByWave[k] = (poolByWave[k] || 0) + (raid.poolByWave[k] | 0); }
    poolTotal += raid.livingN || 0;
  }
  const farthestByWave = {};
  let farthestTotal = 0;
  for (const raid of raids) {
    for (const k of Object.keys(raid.farthestByWave || {})) { farthestByWave[k] = (farthestByWave[k] || 0) + (raid.farthestByWave[k] | 0); }
    farthestTotal += raid.raidN || 0;
  }
  const raidNDist = {};
  for (const raid of raids) raidNDist[raid.raidN] = (raidNDist[raid.raidN] || 0) + 1;
  // Palisade split of the exactly-1 population: post-toll 1s on
  // non-palisade raids ARE pre-existing 1s by construction (no toll).
  const palisadeRaids = raids.filter(r => r.palisade);
  const palRaiders = [];
  for (const raid of raids) if (raid.palisade) for (const x of (raid.raiders || [])) palRaiders.push(x);
  const nonPalRaiders = [];
  for (const raid of raids) if (!raid.palisade) for (const x of (raid.raiders || [])) nonPalRaiders.push(x);
  const perSeedRaids = {};
  for (const raid of raids) {
    perSeedRaids[raid.seed] = perSeedRaids[raid.seed] || { raids: 0, raiders: 0 };
    perSeedRaids[raid.seed].raids++;
    perSeedRaids[raid.seed].raiders += (raid.raiders || []).length;
  }
  const w3plusDraftedTypes = {};
  const w4plusDraftedTypes = {};
  for (const x of raiders) {
    if ((x.wave || 1) >= 3) w3plusDraftedTypes[x.type] = (w3plusDraftedTypes[x.type] || 0) + 1;
    if ((x.wave || 1) >= 4) w4plusDraftedTypes[x.type] = (w4plusDraftedTypes[x.type] || 0) + 1;
  }
  const livingNDist = raids.map(r => r.livingN);
  const pantryAtRaid = raids.map(r => r.pantry).filter(x => x != null);
  // Wave-3+ pool members: drafted fraction + rank-vs-cut position.
  let w3Pool = 0, w3Drafted = 0;
  const w3Ranks = [], w3DraftRanks = [], w3Dist = [], w3DraftDist = [], w3UndraftDist = [], w3UndraftRanks = [];
  for (const raid of raids) {
    for (const p of (raid.w3plusPool || [])) {
      w3Pool++;
      w3Ranks.push(p.rank);
      w3Dist.push(p.dist);
      if (p.inDraft) { w3Drafted++; w3DraftRanks.push(p.rank); w3DraftDist.push(p.dist); }
      else { w3UndraftDist.push(p.dist); w3UndraftRanks.push(p.rank); }
    }
  }
  // Per-raid: wave-3+ in pool vs drafted.
  const perRaidW3 = raids.map(r => ({
    seed: r.seed, day: r.day, raidN: r.raidN, poolN: r.livingN,
    poolW3: (r.w3plusPool || []).length, draftedW3: (r.raiders || []).filter(x => (x.wave || 1) >= 3).length,
  }));
  // Distance selection test: drafted mean dist vs pool mean dist, by wave.
  const draftedDistByWave = {}, poolDistByWave = {};
  for (const raid of raids) {
    for (const x of (raid.raiders || [])) {
      const w = x.wave || 1;
      (draftedDistByWave[w] = draftedDistByWave[w] || []).push(x.dist);
    }
  }
  // Field linkage: defender fight = raid-day fieldFight, same seed+type,
  // starting at post-toll hp. Later exact = later-day fieldFight, same
  // seed+type, starting at post-toll hp OR at the defender end hp.
  let exactMet = 0, typeOnlyMet = 0, neverMet = 0, ambiguousDefender = 0;
  const woundedLink = { exact: 0, typeOnly: 0, never: 0, total: 0 };
  const unwoundedLink = { exact: 0, typeOnly: 0, never: 0, total: 0 };
  const linkageDetail = [];
  for (const raid of raids) {
    for (const x of (raid.raiders || [])) {
      const wounded = x.postTollHp != null && x.maxHp != null && x.postTollHp < x.maxHp;
      const sameDay = field.filter(f => f.seed === raid.seed && f.day === raid.day && f.mid === x.type);
      const defenderHits = sameDay.filter(f => f.startHp === x.postTollHp);
      const defenderEnd = defenderHits.length === 1 ? defenderHits[0].endHp : null;
      if (defenderHits.length > 1) ambiguousDefender++;
      const later = field.filter(f => f.seed === raid.seed && f.day > raid.day && f.mid === x.type);
      const exactTargets = [x.postTollHp];
      if (defenderEnd != null) exactTargets.push(defenderEnd);
      const exact = later.filter(f => exactTargets.indexOf(f.startHp) >= 0);
      const status = exact.length ? 'exact' : (later.length ? 'type-only' : 'never');
      if (status === 'exact') exactMet++;
      else if (status === 'type-only') typeOnlyMet++;
      else neverMet++;
      const bucket = wounded ? woundedLink : unwoundedLink;
      bucket.total++;
      if (status === 'exact') bucket.exact++;
      else if (status === 'type-only') bucket.typeOnly++;
      else bucket.never++;
      linkageDetail.push({
        seed: raid.seed, raidDay: raid.day, type: x.type, wave: x.wave,
        postTollHp: x.postTollHp, defenderHits: defenderHits.length,
        defenderEnd: defenderEnd, laterExact: exact.length, laterTypeOnly: later.length,
        status: status,
        firstExactDay: exact.length ? exact[0].day : null,
        firstExactOutcome: exact.length ? exact[0].outcome : null,
      });
    }
  }
  return {
    raidCount: raids.length,
    raiderCount: raiders.length,
    raidNDist: raidNDist,
    pantryAtRaid: { n: pantryAtRaid.length, median: medianOf(pantryAtRaid), mean: meanOf(pantryAtRaid), gt12k: pantryAtRaid.filter(x => x > 12000).length, gt24k: pantryAtRaid.filter(x => x > 24000).length },
    raiderWaveShare: waveShare(raiders),
    raiderWave1234plus: {
      w1: raiders.filter(x => (x.wave || 1) === 1).length,
      w2: raiders.filter(x => (x.wave || 1) === 2).length,
      w3: raiders.filter(x => (x.wave || 1) === 3).length,
      w4plus: raiders.filter(x => (x.wave || 1) >= 4).length,
    },
    exactly1Hp: {
      postToll: raiders.filter(x => x.postTollHp === 1).length,
      postTollShare: raiders.length ? raiders.filter(x => x.postTollHp === 1).length / raiders.length : 0,
      preTollAlready1: raiders.filter(x => x.preHp === 1).length,
    },
    poolByWave: poolByWave, poolTotal: poolTotal,
    poolWaveShares: (() => { const o = {}; for (const k of Object.keys(poolByWave)) o[k] = poolTotal ? poolByWave[k] / poolTotal : 0; return o; })(),
    farthestByWave: farthestByWave, farthestTotal: farthestTotal,
    w3Pool: w3Pool, w3Drafted: w3Drafted,
    w3DraftShare: w3Pool ? w3Drafted / w3Pool : 0,
    w3RankMedian: medianOf(w3Ranks), w3DraftRankMedian: medianOf(w3DraftRanks),
    w3UndraftRankMedian: medianOf(w3UndraftRanks),
    w3UndraftMeanDist: meanOf(w3UndraftDist),
    w3MeanDist: meanOf(w3Dist), w3DraftMeanDist: meanOf(w3DraftDist),
    perRaidW3: perRaidW3,
    raidsWithW3InPool: perRaidW3.filter(r => r.poolW3 > 0).length,
    raidsWithW3Drafted: perRaidW3.filter(r => r.draftedW3 > 0).length,
    draftedMeanDist: meanOf(raids.map(r => r.draftedMeanDist).filter(x => x != null)),
    poolMeanDist: meanOf(raids.map(r => r.poolMeanDist).filter(x => x != null)),
    w3plusMeanDistPooled: meanOf(raids.map(r => r.w3plusMeanDist).filter(x => x != null)),
    w12MeanDistPooled: meanOf(raids.map(r => r.w12MeanDist).filter(x => x != null)),
    postMatchKinds: (() => { const c = {}; for (const x of raiders) c[x.postMatch] = (c[x.postMatch] || 0) + 1; return c; })(),
    fieldLinkage: { exactMet: exactMet, typeOnlyMet: typeOnlyMet, neverMet: neverMet, ambiguousDefender: ambiguousDefender, total: raiders.length, woundedLink: woundedLink, unwoundedLink: unwoundedLink },
    palisadeSplit: {
      palisadeRaids: palisadeRaids.length, palisadeRaiders: palRaiders.length,
      nonPalisadeRaids: raids.length - palisadeRaids.length, nonPalisadeRaiders: nonPalRaiders.length,
      tollCreated1: palRaiders.filter(x => x.preHp != null && x.preHp > 1 && x.postTollHp === 1).length,
      palisadePreExisting1: palRaiders.filter(x => x.preHp === 1).length,
      palisadePostToll1: palRaiders.filter(x => x.postTollHp === 1).length,
      nonPalisadePostToll1: nonPalRaiders.filter(x => x.postTollHp === 1).length,
    },
    perSeedRaids: perSeedRaids,
    w3plusDraftedTypes: w3plusDraftedTypes, w4plusDraftedTypes: w4plusDraftedTypes,
    livingN: { median: medianOf(livingNDist), mean: meanOf(livingNDist), min: Math.min.apply(null, livingNDist), max: Math.max.apply(null, livingNDist) },
    linkageDetail: linkageDetail,
    fieldFightCount: field.length,
  };
}

async function summaryMode() {
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const evidDir = evidDirOf();
  const rows = [];
  for (const pid of ['baseline', 'armed']) for (const seed of SEEDS) {
    const p = path.join(evidDir, `s${seed}-${pid}.json`);
    rows.push(JSON.parse(fs.readFileSync(p, 'utf8')));
  }
  const byPolicy = {};
  for (const pid of ['baseline', 'armed']) {
    const rs = rows.filter(r => r.policy === pid);
    byPolicy[pid] = {
      n: rs.length, won: rs.reduce((t, r) => t + r.won, 0),
      medianDays: medianOf(rs.map(r => r.days)), medianGameDays: medianOf(rs.map(r => r.gameDays)),
      maxDays: Math.max.apply(null, rs.map(r => r.days).concat([0])),
      nationalEver: rs.reduce((t, r) => t + r.nationalEver, 0), nationalFinal: rs.reduce((t, r) => t + r.nationalFinal, 0),
      table: rs.reduce((t, r) => t + r.table, 0), entered: rs.reduce((t, r) => t + r.entered, 0),
      wave4: rs.filter(r => (r.waveReach || 1) >= 4).length, wave5: rs.filter(r => (r.waveReach || 1) >= 5).length,
      wave3: rs.filter(r => (r.waveReach || 1) >= 3).length,
      maxArc: Math.max.apply(null, rs.map(r => r.maxArc).concat([1])),
      starvationTotal: rs.reduce((t, r) => t + r.starvationDeaths, 0),
      deathTotal: rs.reduce((t, r) => t + r.deathTotal, 0),
    };
  }
  const g2 = [];
  for (const seed of SEEDS) {
    const c = rows.find(r => r.policy === 'baseline' && r.seed === seed);
    const a = rows.find(r => r.policy === 'armed' && r.seed === seed);
    const ok = !!c && !!a && c.days === a.days && c.gameDays === a.gameDays
      && JSON.stringify(c.ts) === JSON.stringify(a.ts) && c.starvationDeaths === a.starvationDeaths;
    const facedOk = !!c && !!a && JSON.stringify(c.raftdraft.faced) === JSON.stringify(a.raftdraft.faced);
    const killsOk = !!c && !!a && JSON.stringify((c.raftdraft.logEntries || []).map(e => [e.d, e.mid, e.w, e.by, e.via])) === JSON.stringify((a.raftdraft.logEntries || []).map(e => [e.d, e.mid, e.w, e.by, e.via]));
    g2.push({ seed, ok, facedOk, killsOk, cDays: c ? c.days : null, aDays: a ? a.days : null, cGameDays: c ? c.gameDays : null, aGameDays: a ? a.gameDays : null });
  }
  const g2Pass = g2.every(x => x.ok);
  const armedRows = rows.filter(r => r.policy === 'armed');
  const baselineRows = rows.filter(r => r.policy === 'baseline');
  const g3Pass = rows.length === SEEDS.length * 2 && rows.every(r => r.days > 0 && r.raftdraft && r.raftdraft.faced && r.raftdraft.logEntries)
    && armedRows.length === SEEDS.length && armedRows.every(r => Array.isArray(r.raftdraft.raids) && Array.isArray(r.raftdraft.fieldFights) && r.diag && r.diag.errs === 0)
    && baselineRows.length === SEEDS.length && baselineRows.every(r => r.raftdraft.analysis === undefined || r.raftdraft.analysis === null);
  const analysis = analyzeDraft(armedRows);
  const diagGo = g3Pass && g2Pass
    && analysis.raidCount > 0 && analysis.raiderCount > 0;
  const report = {
    label: 'sim-raftdraft-a pilot', seeds: SEEDS, days, rows, byPolicy,
    gates: { g2RecorderNeutrality: g2, g2Pass, g3CorpusIntegrity: g3Pass },
    analysis: analysis,
    diagGo: diagGo,
    diagGoRule: 'DIAG-GO iff (a) census complete on 8/8 seeds with zero recorder errors, (b) wave shares + exactly-1HP share + raid count + pantry-tier mix + pool-vs-draft comparison reported, and (c) a lever named with numbers (or none supported). G2 neutrality is required for (a): a non-neutral recorder cannot be trusted.',
    generated: new Date().toISOString(),
  };
  const summaryPath = path.join(evidDir, 'summary.json');
  writeFileRetry(summaryPath, JSON.stringify(report, null, 1) + '\n');
  console.log('\n=== sim-raftdraft-a pilot ===');
  for (const pid of ['baseline', 'armed']) {
    const b = byPolicy[pid];
    console.log(`  ${pid}: n=${b.n} won=${b.won} medD=${b.medianDays} medGameD=${b.medianGameDays} maxD=${b.maxDays} natEver=${b.nationalEver} natFinal=${b.nationalFinal} table=${b.table} entered=${b.entered} wave3=${b.wave3} wave4=${b.wave4} wave5=${b.wave5} maxArc=${b.maxArc} starvTotal=${b.starvationTotal} deathTotal=${b.deathTotal}`);
  }
  console.log(`  G2 recorder neutrality: ${g2Pass ? 'PASS' : 'FAIL'} (${g2.filter(x => x.ok).length}/${g2.length} seeds identical; faced-agree ${g2.filter(x => x.facedOk).length}/${g2.length}, kills-agree ${g2.filter(x => x.killsOk).length}/${g2.length})`);
  console.log(`  G3 corpus integrity: ${g3Pass ? 'PASS' : 'FAIL'}`);
  const a = analysis;
  console.log(`  RAIDS: count=${a.raidCount} raiders=${a.raiderCount} raidN=${JSON.stringify(a.raidNDist)} pantryMedian=${a.pantryAtRaid.median} pantryMean=${a.pantryAtRaid.mean} gt12k=${a.pantryAtRaid.gt12k} gt24k=${a.pantryAtRaid.gt24k}`);
  console.log(`  RAIDER WAVES: ${JSON.stringify(a.raiderWave1234plus)} exactly1PostToll=${a.exactly1Hp.postToll}/${a.raiderCount} preTollAlready1=${a.exactly1Hp.preTollAlready1}`);
  console.log(`  POOL (pooled across raids): ${JSON.stringify(a.poolByWave)} total=${a.poolTotal} shares=${JSON.stringify(a.poolWaveShares)}`);
  console.log(`  FARTHEST-N: ${JSON.stringify(a.farthestByWave)} total=${a.farthestTotal}`);
  console.log(`  W3 POOL: members=${a.w3Pool} drafted=${a.w3Drafted} (${(a.w3DraftShare * 100).toFixed(1)}%) rankMed=${a.w3RankMedian} draftRankMed=${a.w3DraftRankMedian} raidsWithW3Pool=${a.raidsWithW3InPool}/${a.raidCount} raidsWithW3Drafted=${a.raidsWithW3Drafted}/${a.raidCount}`);
  console.log(`  DIST: draftedMean=${a.draftedMeanDist} poolMean=${a.poolMeanDist} w3Mean=${a.w3plusMeanDistPooled} w12Mean=${a.w12MeanDistPooled}`);
  console.log(`  FIELD LINKAGE: exact=${a.fieldLinkage.exactMet} typeOnly=${a.fieldLinkage.typeOnlyMet} never=${a.fieldLinkage.neverMet} ambiguousDefender=${a.fieldLinkage.ambiguousDefender} postMatch=${JSON.stringify(a.postMatchKinds)}`);
  console.log(`  DIAG-GO: ${diagGo ? 'GO' : 'NO-GO'} -> ${summaryPath}`);
  if (!g2Pass || !g3Pass) { console.error('PROOF GATE FAILURE'); process.exit(1); }
}

async function detgateMode() {
  const seed = parseInt(process.env.SEED || '73671', 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const c = await runOne('baseline', seed, days, null);
  delete process.env.RAFTDRAFT;
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  const wrapped = withRaftdraftDiag(tableseatNowait, 'raftdraft-diag', 'tableseat-nowait + raid draft census');
  const { Game } = await loadGame({ seed, mode: 'raftdraft-diag-detgate', fullTelemetry: false });
  await setupGame(Game);
  let capturedCtx = null;
  const policy = Object.assign({}, wrapped, {
    daily(G, ctx) {
      if (!capturedCtx) capturedCtx = ctx;
      try { return wrapped.daily(G, ctx); } catch (e) { /* delegate best-effort */ }
    },
  });
  const result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 10 });
  const ts = {};
  if (capturedCtx) for (const k of Object.keys(capturedCtx)) if (k.indexOf('ts') === 0) ts[k] = capturedCtx[k];
  const hasDiagSurface = !!(capturedCtx && capturedCtx._raftdraft);
  const wrapsInstalled = !!Game._raftdraftDiagInstalled;
  const ok = c.days === result.days && c.gameDays === result.gameDays
    && JSON.stringify(ts) === JSON.stringify(c.ts) && !hasDiagSurface && !wrapsInstalled;
  console.log(`DETGATE seed=${seed} baseline(tableseat-nowait) days=${c.days} gameDays=${c.gameDays} ts=${JSON.stringify(c.ts)} | wrapped(RAFTDRAFT unset) days=${result.days} gameDays=${result.gameDays} ts=${JSON.stringify(ts)} diagSurface=${hasDiagSurface} wrapsInstalled=${wrapsInstalled} -> ${ok ? 'PASS' : 'FAIL'}`);
  if (!ok) process.exit(1);
}

async function detailMode(seedArg) {
  const seed = parseInt(seedArg, 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const evidDir = evidDirOf();
  let census = null;
  try { census = JSON.parse(fs.readFileSync(path.join(evidDir, `s${seed}-armed.json`), 'utf8')); } catch (e) { census = null; }
  const holder = {};
  const row = await runOne('armed', seed, days, null, holder);
  const store = holder.store;
  const raidKey = (r) => JSON.stringify((r.raftdraft.raids || []).map(x => [x.day, (x.raiders || []).map(y => [y.type, y.wave, y.preHp, y.postTollHp])]));
  const same = !!census && census.days === row.days && census.gameDays === row.gameDays
    && JSON.stringify(census.ts) === JSON.stringify(row.ts)
    && census.raftdraft.fieldFights.length === row.raftdraft.fieldFights.length
    && census.raftdraft.raids.length === row.raftdraft.raids.length
    && raidKey(census) === raidKey(row)
    && JSON.stringify((census.raftdraft.fieldFights || []).map(f => [f.day, f.mid, f.outcome, f.rounds, f.startHp, f.endHp])) === JSON.stringify((store.fieldFights || []).map(f => [f.day, f.mid, f.outcome, f.rounds, f.startHp, f.endHp]));
  console.log(`DETAIL-REPRO seed=${seed} days=${row.days} gameDays=${row.gameDays} censusMatch=${same} raids=${row.raftdraft.raids.length} raiders=${row.raftdraft.raids.reduce((t, r) => t + (r.raiders || []).length, 0)} field=${row.raftdraft.fieldFights.length}`);
  if (!same) { console.error('DETAIL REPRODUCTION FAILURE: re-run does not match census row'); process.exit(1); }
}

async function senseMode(seedArg) {
  const seed = parseInt(process.env.SENSE_SEED || seedArg || '73671', 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const out = process.env.SENSE_OUT || path.join(REPO, 'evidence', '2026-10-25', 'sim-raftdraft-a-sense.txt');
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  process.env.RAFTDRAFT = '1';
  const store = newStore();
  const armed = withRaftdraftDiag(tableseatNowait, 'raftdraft-diag', 'tableseat-nowait + raid draft census', store);
  const { Game } = await loadGame({ seed, mode: 'raftdraft-diag-sense', fullTelemetry: false, narration: true });
  const t = {};
  const uninstall = PI.install(Game, t);
  await setupGame(Game);
  try { installRaftdraftDiag(Game, store); } catch (e) { /* install best-effort */ }
  let result;
  await quietLog(async () => { result = await runDays(Game, armed, { days, manifest: undefined, sampleEvery: 30 }); });
  try { uninstall(); } catch (e) { /* uninstall best-effort */ }
  const ring = t.sayRing || [];
  let pg = {};
  try { pg = Game.progState ? Game.progState() : {}; } catch (e) { /* prog best-effort */ }
  const firstRaid = (store.raids || [])[0];
  const header = [
    'SENSE-ONLY REPLAY — NON-MEASURED (narration shifts trajectories; never enters the census)',
    `seed=${seed} policy=tableseat-nowait+raftdraft-diag days=${result.days} gameDays=${result.gameDays} endReason=${result.endReason} maxWave=${result.maxWaveUnlocked} sayLive=${!!t.sayLive} ringLines=${ring.length} tableWaiting=${!!pg.tableWaiting} tableDone=${!!pg.tableDone}`,
    `raftdraft: raids=${store.raids.length} raiders=${store.raids.reduce((t, r) => t + (r.raiders || []).length, 0)} firstRaid=${firstRaid ? JSON.stringify(firstRaid) : 'none'}`,
    '',
  ].join('\n');
  const body = header + ring.map(s => `[d${s.day}] ${s.text}`).join('\n') + '\n';
  writeFileRetry(out, body);
  console.log(`SENSE-DONE seed=${seed} end=${result.endReason} ring=${ring.length} tableWaiting=${!!pg.tableWaiting} tableDone=${!!pg.tableDone} -> ${out}`);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--detgate')) return detgateMode();
  if (args.includes('--one')) return oneMode(args[args.indexOf('--one') + 1], args[args.indexOf('--one') + 2]);
  if (args.includes('--summary')) return summaryMode();
  if (args.includes('--detail')) return detailMode(args[args.indexOf('--detail') + 1]);
  if (args.includes('--sense')) return senseMode(args[args.indexOf('--sense') + 1]);
  console.error('usage: --one <pid> <seed> | --summary | --detgate | --detail <seed> | --sense <seed>');
  process.exit(2);
}
if (require.main === module) main().catch(e => { console.error('RAFTDRAFT-DIAG SWEEP FAILED:', (e && e.stack) || e); process.exit(1); });
module.exports = { runOne, analyzeDraft, writeFileRetry, raftdraftSnapshot };
