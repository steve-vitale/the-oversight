#!/usr/bin/env node
// scripts/test-feastdraw-driveoff-sweep.js — sim-driveoff-a sweep
// (scale-onramp axis, 2026-10-26: price the face/decline choice.
// POLICY-SIDE ONLY, zero src/js changes.)
//
// TWO ARMS on identical seeds (73671-73678, 180d death-aware):
//   control  = tableseat-nowait + feastdraw-diag + nonworldkill-diag
//              (always-face via competent feastFightRoad)
//   driveoff = feastdraw-driveoff policy (FEASTDRAWDRIVEOFF=1,
//              COMPETENT_SEEK_FIGHTS=0) + the same two recorders
//              (every draw driven off explicitly, never left pending)
// The control side is this run's OWN baseline on current master —
// never the published control band (proven stale in feastdraw-a)
// and never any sibling arm's corpus.
//
// Modes (read the argv handling here — do NOT probe with --help):
//   --one <pid> <seed> : run one seed, write its row.
//   --summary : build summary.json from the rows on disk, print
//     the comparison table + GO verdict computation. Exit 1 on
//     corpus failure (missing rows, recorder errors > 0).
//   --detgate : delegation-off proof on one seed (SEED env,
//     default 73671): plain tableseat-nowait vs the drive-off
//     policy with FEASTDRAWDRIVEOFF unset + recorders off must
//     match on days/gameDays/ts, with no ctx fd surface and no
//     installed wraps.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { tableseatNowait } = require('./policies/tableseat-nowait');
const { feastdrawDriveoff } = require('./policies/feastdraw-driveoff');
const {
  newStore: newFdStore, installFeastdrawDiag, withFeastdrawDiag,
  analyzeFeastdraw,
} = require('./policies/feastdraw-diag');
const {
  newStore: newNwkStore, installNonworldkillDiag, withNonworldkillDiag,
  analyzeNonworldkill,
} = require('./policies/nonworldkill-diag');

const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
const STARV_RE = /starv|hunger/i;
const SEEDS = (process.env.SEEDS || '73671,73672,73673,73674,73675,73676,73677,73678')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
function medianOf(arr) {
  if (!arr.length) return 0;
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}
function sleepMs(ms) { try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); } catch (e) {} }
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
  try { out.won = !!Game.won; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; out.arc = pg.arc || 1; out.tableWaiting = !!pg.tableWaiting; out.tableEntered = !!pg.tableDone; } catch (e) {}
  try { out.rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) {}
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

async function runOne(pid, seed, days, evidDir) {
  // Per-arm env, set explicitly every call (the process runs
  // seeds sequentially; a previous arm's value must never leak).
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  process.env.FEASTDRAW = '1';
  process.env.NONWORLDKILL = '1';
  if (pid === 'driveoff') {
    process.env.FEASTDRAWDRIVEOFF = '1';
    process.env.COMPETENT_SEEK_FIGHTS = '0';
  } else {
    delete process.env.FEASTDRAWDRIVEOFF;
    delete process.env.COMPETENT_SEEK_FIGHTS;
  }
  const fdStore = newFdStore(), nwkStore = newNwkStore();
  const inner = pid === 'driveoff' ? feastdrawDriveoff : tableseatNowait;
  const base = withFeastdrawDiag(withNonworldkillDiag(inner, 'nonworldkill-diag', 'feast-draw drive-off sweep + TB initiation census', nwkStore), 'feastdraw-diag', 'feast-draw drive-off sweep + feast-draw yield census', fdStore);
  const { Game } = await loadGame({ seed, mode: 'feastdraw-driveoff-' + pid, fullTelemetry: false });
  await setupGame(Game);
  try { installNonworldkillDiag(Game, nwkStore); } catch (e) {}
  try { installFeastdrawDiag(Game, fdStore); } catch (e) {}
  // Say-line capture (sweep-side instrumentation only: records
  // lines, writes no game state, draws no RNG). Only draw /
  // drive-off / expiry lines, capped — the sense read's raw
  // transcript, not a log dump.
  const sayLines = [];
  try {
    const origSay = Game.say;
    if (typeof origSay === 'function') {
      Game.say = function () {
        try {
          const t = String((arguments.length ? arguments[0] : '') || '');
          if (/circling the edge|drove off|never brave|gives up and moves on/i.test(t) && sayLines.length < 100) {
            sayLines.push({ day: ((Game.state || {}).scholar || {}).day || 0, text: t.slice(0, 400) });
          }
        } catch (e) {}
        return origSay.apply(this, arguments);
      };
    }
  } catch (e) {}
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
      } catch (e) {}
      if (base.daily) { try { return base.daily(G, ctx); } catch (e) {} }
    },
  });
  const result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 10 });
  const end = snap(Game);
  const deaths = result.samples.deaths || [];
  const starv = deaths.filter(d => STARV_RE.test(String(d.cause || '')));
  const last = (arr) => (arr && arr.length ? arr[arr.length - 1][1] : null);
  const ctxFd = {};
  if (capturedCtx) {
    for (const k of Object.keys(capturedCtx)) {
      if (k.indexOf('fd') === 0 || k.indexOf('ts') === 0) ctxFd[k] = capturedCtx[k];
    }
  }
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
    ts: ctxFd,
    finalPop: last(result.samples.pop), finalPantry: last(result.samples.pantry),
    finalKnown: last(result.samples.knowledge),
    ctxFd: ctxFd,
    sayLines: sayLines,
    feastdraw: {
      grants: fdStore.grants, draws: fdStore.draws, faces: fdStore.faces,
      driveoffs: fdStore.driveoffs, clears: fdStore.clears,
      diag: { errs: fdStore.errs, errors: fdStore.errors, overflow: fdStore.overflow, installed: fdStore.installed },
    },
    nonworldkill: {
      starts: nwkStore.starts, ends: nwkStore.ends,
      diag: { errs: nwkStore.errs, errors: nwkStore.errors, overflow: nwkStore.overflow, installed: nwkStore.installed },
    },
  };
  if (evidDir) {
    const fn = path.join(evidDir, `s${seed}-${pid}.json`);
    writeFileRetry(fn, JSON.stringify(row, null, 1) + '\n');
    row.corpusFile = fn;
  }
  return row;
}

function evidDirOf() { return process.env.EVID || path.join(REPO, 'evidence', '2026-10-26', 'perseed-sim-driveoff-a'); }

async function oneMode(pid, seedArg) {
  const seed = parseInt(seedArg, 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const evidDir = evidDirOf();
  fs.mkdirSync(evidDir, { recursive: true });
  const row = await runOne(pid, seed, days, evidDir);
  let fdLine = 'feastdraw=null';
  if (row.feastdraw) {
    let an = null; try { an = analyzeFeastdraw(row.feastdraw, row.nonworldkill); } catch (e) { an = null; }
    fdLine = an
      ? `grants=${an.grants} fresh=${an.fresh} refreshed=${an.refreshed} refused=${an.refused} spawned=${an.spawned} faced=${an.faced} driven=${an.drivenOff} unmet=${an.unmet} w4draws=${an.wave4Draws} w4kills=${an.wave4Kills} unclass=${an.unclassified} fdErrs=${row.feastdraw.diag.errs}`
      : `fdErrs=${row.feastdraw.diag.errs} (analyze failed)`;
  }
  let nkLine = 'nonworldkill=null';
  if (row.nonworldkill) {
    let an = null; try { an = analyzeNonworldkill(row.nonworldkill); } catch (e) { an = null; }
    nkLine = an
      ? `tbStarts=${row.nonworldkill.starts.length} tbEnds=${row.nonworldkill.ends.length} init=${an.initiations} other=${an.unclassifiedInitiations} w4kills=${an.wave4Kills.length} nwkErrs=${row.nonworldkill.diag.errs}`
      : `tbStarts=${row.nonworldkill.starts.length} tbEnds=${row.nonworldkill.ends.length} nwkErrs=${row.nonworldkill.diag.errs} (analyze failed)`;
  }
  const fd = row.ctxFd || {};
  console.log(`  [${pid} seed ${seed}] days=${row.days} gameDays=${row.gameDays} end=${row.endReason} wave=${row.waveReach} arc=${row.maxArc} finalRank=${row.finalRank} natEver=${row.nationalEver} natFinal=${row.nationalFinal} table=${row.table} entered=${row.entered} won=${row.won} starv=${row.starvationDeaths} deaths=${row.deathTotal} fdAttempts=${fd.fdDriveoffAttempts || 0} fdOk=${fd.fdDriveoffOk || 0} fdChecks=${(fd.fdDriveoffChecks || []).length} fdPhantom=${(fd.fdDriveoffChecks || []).filter(c => c.phantom).length} sayLines=${row.sayLines.length} ${nkLine} ${fdLine}`);
}

// Band rollup for one arm + the driven-off phantom cross-checks.
function rollupArm(pid, rows) {
  const band = {
    n: rows.length,
    won: rows.reduce((t, r) => t + r.won, 0),
    medianDays: medianOf(rows.map(r => r.days)),
    nationalEver: rows.reduce((t, r) => t + r.nationalEver, 0),
    nationalFinal: rows.reduce((t, r) => t + r.nationalFinal, 0),
    table: rows.reduce((t, r) => t + r.table, 0),
    entered: rows.reduce((t, r) => t + r.entered, 0),
    wave3: rows.filter(r => (r.waveReach || 1) >= 3).length,
    wave4: rows.filter(r => (r.waveReach || 1) >= 4).length,
    wave5: rows.filter(r => (r.waveReach || 1) >= 5).length,
    starvationTotal: rows.reduce((t, r) => t + r.starvationDeaths, 0),
    deathTotal: rows.reduce((t, r) => t + r.deathTotal, 0),
  };
  const fd = { grants: 0, fresh: 0, refreshed: 0, refused: 0, spawned: 0, notSpawned: 0, notSpawnedByWhy: {}, outcomes: {}, faced: 0, facedFace: 0, facedHarness: 0, drivenOff: 0, unmet: 0, facedWithKill: 0, totalKills: 0, wave4Draws: 0, wave4Kills: 0, castVeteranDraws: 0, waveDist: {}, unclassified: 0, drawOutcomes: [], drivenOffWithFight: 0, fallbackForDrivenOff: 0 };
  const phantomChecks = [];
  for (const r of rows) {
    let an = null;
    try { an = analyzeFeastdraw(r.feastdraw, r.nonworldkill); } catch (e) { console.log(`  FEASTDRAW ANALYZE FAILED ${pid} seed=${r.seed}: ${String((e && e.message) || e).slice(0, 120)}`); }
    if (!an) continue;
    fd.grants += an.grants; fd.fresh += an.fresh; fd.refreshed += an.refreshed; fd.refused += an.refused;
    fd.spawned += an.spawned; fd.notSpawned += an.notSpawned;
    for (const k of Object.keys(an.notSpawnedByWhy)) fd.notSpawnedByWhy[k] = (fd.notSpawnedByWhy[k] || 0) + an.notSpawnedByWhy[k];
    for (const k of Object.keys(an.outcomes)) fd.outcomes[k] = (fd.outcomes[k] || 0) + an.outcomes[k];
    fd.faced += an.faced; fd.facedFace += an.facedFace; fd.facedHarness += an.facedHarness;
    fd.drivenOff += an.drivenOff; fd.unmet += an.unmet;
    fd.facedWithKill += an.facedWithKill; fd.totalKills += an.totalKills;
    fd.wave4Draws += an.wave4Draws; fd.wave4Kills += an.wave4Kills; fd.castVeteranDraws += an.castVeteranDraws;
    for (const k of Object.keys(an.waveDist)) fd.waveDist[k] = (fd.waveDist[k] || 0) + an.waveDist[k];
    fd.unclassified += an.unclassified;
    for (const o of an.drawOutcomes) {
      fd.drawOutcomes.push(Object.assign({ seed: r.seed }, o));
      if (o.outcome === 'driven-off' && o.fightId) fd.drivenOffWithFight++;
    }
    // Cross-check: any nonworldkill feast-draw start matching a
    // driven-off draw's key is a fallback fight for that draw,
    // even if the analyzer's outcome precedence hid it.
    const drivenKeys = new Set(an.drawOutcomes.filter(o => o.outcome === 'driven-off').map(o => o.monsterId + '|' + o.day));
    if (drivenKeys.size) {
      try {
        const mod = require('./policies/nonworldkill-diag');
        for (const s of (r.nonworldkill.starts || [])) {
          const cls = mod.classifyStart(s);
          if (!cls.excluded && cls.door === 'feast-draw' && s.feastDraw && s.feastDraw.monsterId) {
            if (drivenKeys.has(s.feastDraw.monsterId + '|' + s.feastDraw.day)) fd.fallbackForDrivenOff++;
          }
        }
      } catch (e) {}
    }
    for (const c of ((r.ctxFd || {}).fdDriveoffChecks || [])) phantomChecks.push(Object.assign({ seed: r.seed }, c));
  }
  fd.drawsPerFreshGrant = fd.fresh ? fd.spawned / fd.fresh : null;
  fd.facedRate = fd.spawned ? fd.faced / fd.spawned : null;
  fd.drivenOffRate = fd.spawned ? fd.drivenOff / fd.spawned : null;
  fd.killRate = fd.faced ? fd.facedWithKill / fd.faced : null;
  fd.veteransPerDraw = fd.spawned ? fd.wave4Kills / fd.spawned : null;
  fd.phantomChecks = phantomChecks;
  fd.phantomCount = phantomChecks.filter(c => c.phantom).length;
  return { band, feastdraw: fd };
}

// Subsequent-grant effect: for each driven-off draw, the next
// grant on the same seed after the draw day — fresh or refresh?
function subsequentGrants(rows, drawOutcomes) {
  const out = { afterDrivenOff: [], afterFaced: [] };
  const bySeed = {};
  for (const r of rows) bySeed[r.seed] = r;
  for (const o of drawOutcomes) {
    const r = bySeed[o.seed];
    if (!r) continue;
    const grants = (r.feastdraw.grants || []);
    const next = grants.find(g => g.day > o.day);
    const rec = { seed: o.seed, drawDay: o.day, monsterId: o.monsterId, outcome: o.outcome, nextGrantDay: next ? next.day : null, nextFresh: next ? (!!next.granted && !next.refreshed) : null, nextRefreshed: next ? (!!next.granted && !!next.refreshed) : null, nextGranted: next ? !!next.granted : null };
    if (o.outcome === 'driven-off') out.afterDrivenOff.push(rec);
    else if (o.outcome === 'faced-face' || o.outcome === 'faced-harness') out.afterFaced.push(rec);
  }
  return out;
}

async function summaryMode() {
  const evidDir = evidDirOf();
  const arms = {};
  let corpusOk = true;
  for (const pid of ['control', 'driveoff']) {
    const rows = [];
    for (const seed of SEEDS) {
      const p = path.join(evidDir, `s${seed}-${pid}.json`);
      if (!fs.existsSync(p)) { console.log(`  MISSING ROW ${p}`); corpusOk = false; continue; }
      rows.push(JSON.parse(fs.readFileSync(p, 'utf8')));
    }
    const ok = rows.length === SEEDS.length && rows.every(r => r.days > 0 && r.feastdraw
      && Array.isArray(r.feastdraw.grants) && Array.isArray(r.feastdraw.draws)
      && r.feastdraw.diag.errs === 0 && Object.values(r.feastdraw.diag.overflow || {}).every(v => (v | 0) === 0)
      && r.nonworldkill && Array.isArray(r.nonworldkill.starts) && Array.isArray(r.nonworldkill.ends)
      && r.nonworldkill.diag.errs === 0 && Object.values(r.nonworldkill.diag.overflow || {}).every(v => (v | 0) === 0));
    if (!ok) corpusOk = false;
    arms[pid] = Object.assign({ rows }, rollupArm(pid, rows));
  }
  const c = arms.control, d = arms.driveoff;
  const sub = subsequentGrants(d.rows, d.feastdraw.drawOutcomes);
  const subC = subsequentGrants(c.rows, c.feastdraw.drawOutcomes);
  // Cost bar (pre-registered): starvation total + per-seed excess,
  // median ratio, wins guard, national-ever guard.
  const perSeedStarvExcess = SEEDS.map(s => {
    const cr = c.rows.find(r => r.seed === s), dr = d.rows.find(r => r.seed === s);
    return { seed: s, control: cr ? cr.starvationDeaths : null, driveoff: dr ? dr.starvationDeaths : null, excess: (cr && dr) ? dr.starvationDeaths - cr.starvationDeaths : null };
  });
  const maxExcess = Math.max.apply(null, perSeedStarvExcess.map(x => (x.excess == null ? -999 : x.excess)));
  const cost = {
    starvTotalOk: d.band.starvationTotal <= c.band.starvationTotal + 2,
    starvPerSeedOk: maxExcess <= 2,
    medianOk: d.band.medianDays >= 0.8 * c.band.medianDays,
    winsOk: d.band.won >= c.band.won - 1,
    nationalOk: d.band.nationalEver >= c.band.nationalEver - 1,
  };
  cost.allOk = cost.starvTotalOk && cost.starvPerSeedOk && cost.medianOk && cost.winsOk && cost.nationalOk;
  const funnel = {
    unclassifiedOk: d.feastdraw.unclassified === 0,
    drivenOffRateOk: d.feastdraw.spawned > 0 && d.feastdraw.drivenOff === d.feastdraw.spawned,
    facedZeroOk: d.feastdraw.faced === 0,
    fallbackOk: d.feastdraw.fallbackForDrivenOff === 0,
    drivenFightOk: d.feastdraw.drivenOffWithFight === 0,
    phantomOk: d.feastdraw.phantomCount === 0,
    errsOk: d.rows.every(r => r.feastdraw.diag.errs === 0 && r.nonworldkill.diag.errs === 0)
      && c.rows.every(r => r.feastdraw.diag.errs === 0 && r.nonworldkill.diag.errs === 0),
  };
  funnel.allOk = funnel.unclassifiedOk && funnel.drivenOffRateOk && funnel.facedZeroOk && funnel.fallbackOk && funnel.drivenFightOk && funnel.phantomOk && funnel.errsOk;
  const verdict = funnel.allOk && cost.allOk ? 'GO'
    : funnel.allOk ? 'NO-GO (funnel priced, cost bar missed)'
    : 'NO-GO (funnel legs missed)';
  const report = {
    label: 'sim-driveoff-a', seeds: SEEDS, days: 180,
    control: { band: c.band, feastdraw: c.feastdraw },
    driveoff: { band: d.band, feastdraw: d.feastdraw },
    subsequent: { driveoff: sub, control: subC },
    perSeedStarvExcess: perSeedStarvExcess, maxExcess: maxExcess,
    cost: cost, funnel: funnel, verdict: verdict, corpusOk: corpusOk,
    generated: new Date().toISOString(),
  };
  // Strip raw rows from the saved summary (they live in the
  // per-seed files); keep the rollups.
  const saved = JSON.parse(JSON.stringify(report));
  delete saved.control.rows; delete saved.driveoff.rows;
  const summaryPath = path.join(evidDir, 'summary.json');
  writeFileRetry(summaryPath, JSON.stringify(saved, null, 1) + '\n');
  console.log('\n=== sim-driveoff-a ===');
  console.log(`  CONTROL band: n=${c.band.n} won=${c.band.won} medD=${c.band.medianDays} natEver=${c.band.nationalEver} natFinal=${c.band.nationalFinal} table=${c.band.table} entered=${c.band.entered} wave3=${c.band.wave3} wave4=${c.band.wave4} wave5=${c.band.wave5} starv=${c.band.starvationTotal} deaths=${c.band.deathTotal}`);
  console.log(`  DRIVEOFF band: n=${d.band.n} won=${d.band.won} medD=${d.band.medianDays} natEver=${d.band.nationalEver} natFinal=${d.band.nationalFinal} table=${d.band.table} entered=${d.band.entered} wave3=${d.band.wave3} wave4=${d.band.wave4} wave5=${d.band.wave5} starv=${d.band.starvationTotal} deaths=${d.band.deathTotal}`);
  console.log(`  CONTROL feastdraw: grants=${c.feastdraw.grants} fresh=${c.feastdraw.fresh} refreshed=${c.feastdraw.refreshed} refused=${c.feastdraw.refused} spawned=${c.feastdraw.spawned} faced=${c.feastdraw.faced} driven=${c.feastdraw.drivenOff} unmet=${c.feastdraw.unmet} killRate=${c.feastdraw.killRate} totalKills=${c.feastdraw.totalKills} w4draws=${c.feastdraw.wave4Draws} w4kills=${c.feastdraw.wave4Kills} vetPerDraw=${c.feastdraw.veteransPerDraw} waveDist=${JSON.stringify(c.feastdraw.waveDist)} outcomes=${JSON.stringify(c.feastdraw.outcomes)} unclass=${c.feastdraw.unclassified}`);
  console.log(`  DRIVEOFF feastdraw: grants=${d.feastdraw.grants} fresh=${d.feastdraw.fresh} refreshed=${d.feastdraw.refreshed} refused=${d.feastdraw.refused} spawned=${d.feastdraw.spawned} faced=${d.feastdraw.faced} driven=${d.feastdraw.drivenOff} unmet=${d.feastdraw.unmet} drivenRate=${d.feastdraw.drivenOffRate} fallbackForDriven=${d.feastdraw.fallbackForDrivenOff} drivenWithFight=${d.feastdraw.drivenOffWithFight} phantom=${d.feastdraw.phantomCount}/${d.feastdraw.phantomChecks.length} w4draws=${d.feastdraw.wave4Draws} w4kills=${d.feastdraw.wave4Kills} waveDist=${JSON.stringify(d.feastdraw.waveDist)} outcomes=${JSON.stringify(d.feastdraw.outcomes)} unclass=${d.feastdraw.unclassified}`);
  console.log(`  CONTROL draws: ${c.feastdraw.drawOutcomes.map(o => `s${o.seed}d${o.day}:${o.monsterId}/w${o.wave}/${o.outcome}${o.endResult ? '/' + o.endResult : ''}${o.killCount ? '/k' + o.killCount : ''}`).join(' ')}`);
  console.log(`  DRIVEOFF draws: ${d.feastdraw.drawOutcomes.map(o => `s${o.seed}d${o.day}:${o.monsterId}/w${o.wave}/${o.outcome}`).join(' ')}`);
  console.log(`  SUBSEQUENT after driven-off: ${sub.afterDrivenOff.map(x => `s${x.seed}d${x.drawDay}->${x.nextGrantDay == null ? 'none' : ('d' + x.nextGrantDay + ':' + (x.nextRefreshed ? 'refresh' : x.nextFresh ? 'fresh' : 'refused'))}`).join(' ') || 'none'}`);
  console.log(`  SUBSEQUENT after faced (control): ${subC.afterFaced.map(x => `s${x.seed}d${x.drawDay}->${x.nextGrantDay == null ? 'none' : ('d' + x.nextGrantDay + ':' + (x.nextRefreshed ? 'refresh' : x.nextFresh ? 'fresh' : 'refused'))}`).join(' ') || 'none'}`);
  console.log(`  COST: starv ${d.band.starvationTotal} vs ${c.band.starvationTotal}+2 -> ${cost.starvTotalOk} | per-seed max excess ${maxExcess} -> ${cost.starvPerSeedOk} | median ${d.band.medianDays} vs 0.8x${c.band.medianDays}=${0.8 * c.band.medianDays} -> ${cost.medianOk} | wins ${d.band.won} vs ${c.band.won}-1 -> ${cost.winsOk} | natEver ${d.band.nationalEver} vs ${c.band.nationalEver}-1 -> ${cost.nationalOk} | ALL ${cost.allOk}`);
  console.log(`  FUNNEL: unclass ${funnel.unclassifiedOk} | drivenRate ${funnel.drivenOffRateOk} | facedZero ${funnel.facedZeroOk} | fallback ${funnel.fallbackOk} | drivenFight ${funnel.drivenFightOk} | phantom ${funnel.phantomOk} | errs ${funnel.errsOk} | ALL ${funnel.allOk}`);
  console.log(`  VERDICT: ${verdict} | CORPUS: ${corpusOk ? 'PASS' : 'FAIL'} -> ${summaryPath}`);
  if (!corpusOk) { console.error('PROOF GATE FAILURE'); process.exit(1); }
}

async function detgateMode() {
  const seed = parseInt(process.env.SEED || '73671', 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  delete process.env.FEASTDRAWDRIVEOFF; delete process.env.COMPETENT_SEEK_FIGHTS;
  delete process.env.FEASTDRAW; delete process.env.NONWORLDKILL;
  process.env.LEANLINKRESCUE = '1'; process.env.TABLESEATNOWAIT = '1';
  // Baseline: plain tableseat-nowait.
  const b = await (async () => {
    const { Game } = await loadGame({ seed, mode: 'driveoff-detgate-base', fullTelemetry: false });
    await setupGame(Game);
    let capturedCtx = null;
    const policy = Object.assign({}, tableseatNowait, {
      daily(G, ctx) { if (!capturedCtx) capturedCtx = ctx; return tableseatNowait.daily(G, ctx); },
    });
    const result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 10 });
    const ts = {};
    if (capturedCtx) for (const k of Object.keys(capturedCtx)) if (k.indexOf('ts') === 0) ts[k] = capturedCtx[k];
    return { days: result.days, gameDays: result.gameDays, ts: ts };
  })();
  // Wrapped but OFF: drive-off policy with the layer env unset,
  // recorders off — must delegate byte-identically.
  const w = await (async () => {
    const { Game } = await loadGame({ seed, mode: 'driveoff-detgate-wrapped', fullTelemetry: false });
    await setupGame(Game);
    const fdStore = newFdStore(), nwkStore = newNwkStore();
    const base = withFeastdrawDiag(withNonworldkillDiag(feastdrawDriveoff, 'nonworldkill-diag', 'detgate', nwkStore), 'feastdraw-diag', 'detgate', fdStore);
    let capturedCtx = null;
    const policy = Object.assign({}, base, {
      daily(G, ctx) { if (!capturedCtx) capturedCtx = ctx; return base.daily(G, ctx); },
    });
    const result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 10 });
    const ts = {};
    if (capturedCtx) for (const k of Object.keys(capturedCtx)) if (k.indexOf('ts') === 0) ts[k] = capturedCtx[k];
    const hasFdSurface = !!(capturedCtx && (capturedCtx.fdDriveoffAttempts != null || capturedCtx.fdDriveoffOk != null || capturedCtx._feastdraw || capturedCtx._nonworldkill));
    const wrapsInstalled = !!Game._feastdrawDiagInstalled || !!Game._nonworldkillDiagInstalled;
    return { days: result.days, gameDays: result.gameDays, ts: ts, hasFdSurface: hasFdSurface, wrapsInstalled: wrapsInstalled };
  })();
  const ok = b.days === w.days && b.gameDays === w.gameDays
    && JSON.stringify(b.ts) === JSON.stringify(w.ts) && !w.hasFdSurface && !w.wrapsInstalled;
  console.log(`DETGATE seed=${seed} baseline days=${b.days} gameDays=${b.gameDays} ts=${JSON.stringify(b.ts)} | wrapped(OFF) days=${w.days} gameDays=${w.gameDays} ts=${JSON.stringify(w.ts)} fdSurface=${w.hasFdSurface} wrapsInstalled=${w.wrapsInstalled} -> ${ok ? 'PASS' : 'FAIL'}`);
  if (!ok) process.exit(1);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--one')) return oneMode(args[args.indexOf('--one') + 1], args[args.indexOf('--one') + 2]);
  if (args.includes('--summary')) return summaryMode();
  if (args.includes('--detgate')) return detgateMode();
  console.error('usage: --one <pid> <seed> | --summary | --detgate');
  process.exit(2);
}
if (require.main === module) main().catch(e => { console.error('FEASTDRAW-DRIVEOFF SWEEP FAILED:', (e && e.stack) || e); process.exit(1); });
module.exports = { runOne, rollupArm, subsequentGrants, SEEDS };
