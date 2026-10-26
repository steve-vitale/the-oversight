#!/usr/bin/env node
// scripts/test-qualityrefresh-sweep.js — sim-qualityrefresh-a sweep
// (scale-onramp axis, 2026-10-26: the QUALITY-STEP refresh question.
// POLICY-SIDE ONLY, zero src/js changes.)
//
// TWO ARMS on identical seeds (73671-73678, 180d death-aware):
//   control = tableseat-nowait + feastdraw-diag + nonworldkill-diag
//             + hostfeast recorder (measurement only, no steering;
//             always-face via competent feastFightRoad; 7-day feast
//             cadence — the refresh branch is unreachable here)
//   quality = qualityrefresh policy (QUALITYREFRESH=1,
//             HOSTFEASTREC=1, FEASTREFRESH=1,
//             FEASTDRAWDRIVEOFF=1, COMPETENT_SEEK_FIGHTS=0) +
//             the same recorders (daily feast cadence + drive-off
//             draws, so the devotion stays armed and a re-feast
//             inside the 2-dawn window CAN refresh; refresh feasts
//             are guest-steered to exclude reactor guests, lifting
//             quality via the documented cold-seat lever)
// The control side is this run's OWN baseline on current master —
// never the published control band and never any sibling corpus.
//
// Modes (read the argv handling here — do NOT probe with --help):
//   --one <pid> <seed> : run one seed, write its row.
//   --summary : build summary.json from the rows on disk, print
//     the comparison table + DIAG verdict computation. Exit 1
//     on corpus failure (missing rows, recorder errors > 0).
//   --detgate : delegation-off proof on one seed (SEED env,
//     default 73671): plain tableseat-nowait vs the quality
//     policy with all layer envs unset + recorders off must
//     match on days/gameDays/ts, with no ctx qr/hf/fr/fd
//     surface and no installed wraps.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { tableseatNowait } = require('./policies/tableseat-nowait');
const { qualityrefresh } = require('./policies/qualityrefresh');
const {
  newHostStore, installHostfeastRec, withHostfeastRec,
} = require('./policies/qualityrefresh');
const {
  newStore: newFdStore, installFeastdrawDiag, withFeastdrawDiag,
  analyzeFeastdraw,
} = require('./policies/feastdraw-diag');
const {
  newStore: newNwkStore, installNonworldkillDiag, withNonworldkillDiag,
  analyzeNonworldkill,
} = require('./policies/nonworldkill-diag');
const {
  analyzeRefresh, refusalReason, matchPostSnap, SEEDS, REBASELINE,
} = require('./test-feastrefresh-sweep');

const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
const STARV_RE = /starv|hunger/i;
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

// analyzeQuality(feastStore, hostStore, snaps): pure over one seed's
// stores + buff snapshots. Joins refresh grants to the same-day
// hostFeast record (one feast/day, so the join is unique) and
// classifies every refresh grant as a step, a hold, or a mult
// change; prices refused feasts from host reports.
function analyzeQuality(feastStore, hostStore, snaps) {
  const grants = (feastStore && feastStore.grants) || [];
  const feasts = (hostStore && hostStore.feasts) || [];
  const byDay = {};
  for (const f of feasts) { if (f.ok) byDay[f.day] = f; }
  const refreshGrants = [];
  let stepCount = 0, holdCount = 0, multChangeCount = 0;
  let hostQualityMismatch = 0;
  for (let i = 0; i < grants.length; i++) {
    const g = grants[i];
    if (!g.granted || !g.refreshed) continue;
    const post = matchPostSnap(snaps || [], g.day);
    const preQ = (g.preBuff && g.preBuff.quality != null) ? g.preBuff.quality : null;
    const postQ = (post && post.buff && post.buff.quality != null) ? post.buff.quality : null;
    const grantQ = (g.quality != null) ? g.quality : null;
    const step = (preQ != null && grantQ != null) ? (grantQ > preQ) : null;
    const stepByPost = (preQ != null && postQ != null) ? (postQ > preQ) : null;
    const stepAgree = (step === stepByPost);
    const multChange = (g.preBuff && g.preBuff.mult != null && g.mult != null) ? (g.mult !== g.preBuff.mult) : null;
    if (step === true) stepCount++;
    else if (step === false) holdCount++;
    if (multChange === true) multChangeCount++;
    const host = byDay[g.day] || null;
    if (host && host.quality != null && grantQ != null && host.quality !== grantQ) hostQualityMismatch++;
    refreshGrants.push({
      idx: i, day: g.day, preQuality: preQ, grantQuality: grantQ, postQuality: postQ,
      preMult: (g.preBuff && g.preBuff.mult != null) ? g.preBuff.mult : null, mult: g.mult,
      step: step, stepByPost: stepByPost, stepAgree: stepAgree, multChange: multChange,
      preUntil: (g.preBuff && g.preBuff.untilDay != null) ? g.preBuff.untilDay : null,
      postUntil: (post && post.buff && post.buff.untilDay != null) ? post.buff.untilDay : null,
      extended: (g.preBuff && g.preBuff.untilDay != null && post && post.buff && post.buff.untilDay != null) ? (post.buff.untilDay > g.preBuff.untilDay) : null,
      resetToFreshLength: (post && post.buff && post.buff.untilDay != null) ? (post.buff.untilDay === g.day + 2) : null,
      host: host ? {
        steered: !!host.steered, coldSeats: host.coldSeats, quality: host.quality,
        spent: host.spent, surgeSpent: host.surgeSpent, buffGranted: host.buffGranted,
        invitedN: (host.factors && host.factors.invitedN != null) ? host.factors.invitedN : (host.invited ? host.invited.length : null),
        showedN: (host.factors && host.factors.showedN != null) ? host.factors.showedN : (host.showed ? host.showed.length : null),
        variety: (host.factors ? host.factors.variety : null),
        centerpiece: (host.factors ? !!host.factors.centerpiece : null),
        turnout: (host.factors ? host.factors.turnout : null),
        perHead: (host.factors ? host.factors.perHead : null),
        score: host.score,
      } : null,
      matchedHost: !!host,
    });
  }
  // Refused-feast pricing: host reports with ok true and buffGranted
  // false, joined to the same-day grant row for the refusal reason.
  // Armed = surgeSpent > 0. A host report with no same-day grant row
  // is priced separately (never merged silently).
  const grantByDay = {};
  for (const g of grants) grantByDay[g.day] = g;
  const refusedCosts = [];
  let refusedTotal = 0, refusedArmedTotal = 0, refusedUnarmedTotal = 0;
  const refusedByReason = {};
  for (const f of feasts) {
    if (!f.ok || f.buffGranted !== false) continue;
    const g = grantByDay[f.day] || null;
    const reason = g && !g.granted ? refusalReason(g.why) : (g ? 'granted-mismatch' : 'no-grant-row');
    const armed = (f.surgeSpent != null && f.surgeSpent > 0);
    const spent = (f.spent != null ? f.spent : 0);
    refusedTotal += spent;
    if (armed) refusedArmedTotal += spent; else refusedUnarmedTotal += spent;
    refusedByReason[reason] = (refusedByReason[reason] || 0) + 1;
    refusedCosts.push({ day: f.day, spent: spent, armed: armed, reason: reason, quality: f.quality, steered: !!f.steered, grantIdx: g ? grants.indexOf(g) : null });
  }
  // Quality census over ALL granted feasts (fresh + refresh): the
  // substrate-invariance evidence for leg (a)'s alternative.
  const qualityCensus = {};
  const multCensus = {};
  for (const g of grants) {
    if (!g.granted) continue;
    const k = 'q' + g.quality;
    qualityCensus[k] = (qualityCensus[k] || 0) + 1;
    const m = 'm' + g.mult;
    multCensus[m] = (multCensus[m] || 0) + 1;
  }
  // Steered-feast census + reactor-guest census over host records.
  const steeredFeasts = feasts.filter(f => f.ok && f.steered);
  const coldSeatDays = feasts.filter(f => f.ok && (f.coldSeats || 0) > 0).map(f => ({ day: f.day, coldSeats: f.coldSeats, quality: f.quality, buffGranted: f.buffGranted }));
  const grantsWithoutHost = grants.filter(g => g.granted && !byDay[g.day]).map(g => ({ day: g.day, refreshed: !!g.refreshed, quality: g.quality }));
  return {
    refreshCount: refreshGrants.length, refreshGrants: refreshGrants,
    stepCount: stepCount, holdCount: holdCount, multChangeCount: multChangeCount,
    stepAgreeFailures: refreshGrants.filter(r => !r.stepAgree).length,
    hostQualityMismatch: hostQualityMismatch,
    unmatchedHost: refreshGrants.filter(r => !r.matchedHost).length,
    extendedCount: refreshGrants.filter(r => r.extended === true).length,
    resetCount: refreshGrants.filter(r => r.resetToFreshLength === true).length,
    qualityCensus: qualityCensus, multCensus: multCensus,
    steeredCount: steeredFeasts.length,
    steeredDays: steeredFeasts.map(f => ({ day: f.day, quality: f.quality, coldSeats: f.coldSeats, spent: f.spent })),
    coldSeatDays: coldSeatDays,
    refusedCosts: refusedCosts, refusedTotal: refusedTotal,
    refusedArmedTotal: refusedArmedTotal, refusedUnarmedTotal: refusedUnarmedTotal,
    refusedByReason: refusedByReason,
    grantsWithoutHost: grantsWithoutHost,
  };
}

async function runOne(pid, seed, days, evidDir) {
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  process.env.FEASTDRAW = '1';
  process.env.NONWORLDKILL = '1';
  process.env.HOSTFEASTREC = '1';
  if (pid === 'quality') {
    process.env.QUALITYREFRESH = '1';
    process.env.FEASTREFRESH = '1';
    process.env.FEASTDRAWDRIVEOFF = '1';
    process.env.COMPETENT_SEEK_FIGHTS = '0';
  } else {
    delete process.env.QUALITYREFRESH;
    delete process.env.FEASTREFRESH;
    delete process.env.FEASTDRAWDRIVEOFF;
    delete process.env.COMPETENT_SEEK_FIGHTS;
  }
  const fdStore = newFdStore(), nwkStore = newNwkStore(), hfStore = newHostStore();
  const inner = pid === 'quality' ? qualityrefresh : tableseatNowait;
  const base = withHostfeastRec(withFeastdrawDiag(withNonworldkillDiag(inner, 'nonworldkill-diag', 'qualityrefresh sweep + TB initiation census', nwkStore), 'feastdraw-diag', 'qualityrefresh sweep + feast-draw yield census', fdStore), 'hostfeast-rec', 'qualityrefresh sweep + host-feast report census', hfStore);
  const { Game } = await loadGame({ seed, mode: 'qualityrefresh-' + pid, fullTelemetry: false });
  await setupGame(Game);
  try { installNonworldkillDiag(Game, nwkStore); } catch (e) {}
  try { installFeastdrawDiag(Game, fdStore); } catch (e) {}
  try { installHostfeastRec(Game, hfStore); } catch (e) {}
  const sayLines = [];
  try {
    const origSay = Game.say;
    if (typeof origSay === 'function') {
      Game.say = function () {
        try {
          const t = String((arguments.length ? arguments[0] : '') || '');
          if (/stoked higher|LEGENDARY/i.test(t) && sayLines.length < 200) {
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
      if (k.indexOf('fd') === 0 || k.indexOf('ts') === 0 || k.indexOf('fr') === 0 || k.indexOf('qr') === 0) ctxFd[k] = capturedCtx[k];
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
    hostfeast: {
      feasts: hfStore.feasts,
      diag: { errs: hfStore.errs, errors: hfStore.errors, overflow: hfStore.overflow, installed: hfStore.installed },
    },
  };
  if (evidDir) {
    const fn = path.join(evidDir, `s${seed}-${pid}.json`);
    writeFileRetry(fn, JSON.stringify(row, null, 1) + '\n');
    row.corpusFile = fn;
  }
  return row;
}

function evidDirOf() { return process.env.EVID || path.join(REPO, 'evidence', '2026-10-26', 'perseed-sim-qualityrefresh-a'); }

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
  let qLine = 'quality=null';
  if (row.feastdraw && row.hostfeast) {
    try {
      const qa = analyzeQuality(row.feastdraw, row.hostfeast, (row.ctxFd || {}).frBuffSnaps || []);
      const ra = analyzeRefresh(row.feastdraw, (row.ctxFd || {}).frBuffSnaps || []);
      qLine = `refresh=${qa.refreshCount} steps=${qa.stepCount} holds=${qa.holdCount} multChanges=${qa.multChangeCount} steered=${qa.steeredCount} coldDays=${qa.coldSeatDays.length} refusedCost=${qa.refusedTotal} (armed=${qa.refusedArmedTotal} unarmed=${qa.refusedUnarmedTotal} reasons=${JSON.stringify(qa.refusedByReason)}) qcensus=${JSON.stringify(qa.qualityCensus)} unmatchedHost=${qa.unmatchedHost} hostMismatch=${qa.hostQualityMismatch} hfErrs=${row.hostfeast.diag.errs} frRefresh=${ra.refreshCount}`;
    } catch (e) { qLine = `quality analyze failed: ${String((e && e.message) || e).slice(0, 120)}`; }
  }
  console.log(`  [${pid} seed ${seed}] days=${row.days} gameDays=${row.gameDays} end=${row.endReason} wave=${row.waveReach} arc=${row.maxArc} finalRank=${row.finalRank} natEver=${row.nationalEver} natFinal=${row.nationalFinal} table=${row.table} entered=${row.entered} won=${row.won} starv=${row.starvationDeaths} deaths=${row.deathTotal} sayLines=${row.sayLines.length} ${fdLine} ${qLine}`);
}

function rollupArm(pid, rows) {
  const band = {
    n: rows.length,
    won: rows.reduce((t, r) => t + r.won, 0),
    medianDays: medianOf(rows.map(r => r.days)),
    medianNonWonDays: medianOf(rows.filter(r => !r.won).map(r => r.days)),
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
  const fd = { grants: 0, fresh: 0, refreshed: 0, refused: 0, spawned: 0, notSpawned: 0, notSpawnedByWhy: {}, outcomes: {}, faced: 0, facedFace: 0, facedHarness: 0, drivenOff: 0, unmet: 0, facedWithKill: 0, totalKills: 0, wave4Draws: 0, wave4Kills: 0, castVeteranDraws: 0, waveDist: {}, unclassified: 0, drawOutcomes: [] };
  const qa = { refreshCount: 0, refreshGrants: [], stepCount: 0, holdCount: 0, multChangeCount: 0, stepAgreeFailures: 0, hostQualityMismatch: 0, unmatchedHost: 0, extendedCount: 0, resetCount: 0, qualityCensus: {}, multCensus: {}, steeredCount: 0, steeredDays: [], coldSeatDays: [], refusedCosts: [], refusedTotal: 0, refusedArmedTotal: 0, refusedUnarmedTotal: 0, refusedByReason: {}, grantsWithoutHost: [] };
  const fr = { refreshCount: 0, unmatched: 0, drawsOnRefresh: 0, reasonCounts: {} };
  for (const r of rows) {
    let an = null;
    try { an = analyzeFeastdraw(r.feastdraw, r.nonworldkill); } catch (e) { console.log(`  FEASTDRAW ANALYZE FAILED ${pid} seed=${r.seed}: ${String((e && e.message) || e).slice(0, 120)}`); }
    if (an) {
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
      for (const o of an.drawOutcomes) fd.drawOutcomes.push(Object.assign({ seed: r.seed }, o));
    }
    let q = null;
    try { q = analyzeQuality(r.feastdraw, r.hostfeast, (r.ctxFd || {}).frBuffSnaps || []); } catch (e) { console.log(`  QUALITY ANALYZE FAILED ${pid} seed=${r.seed}: ${String((e && e.message) || e).slice(0, 120)}`); }
    if (q) {
      qa.refreshCount += q.refreshCount; qa.stepCount += q.stepCount; qa.holdCount += q.holdCount;
      qa.multChangeCount += q.multChangeCount; qa.stepAgreeFailures += q.stepAgreeFailures;
      qa.hostQualityMismatch += q.hostQualityMismatch; qa.unmatchedHost += q.unmatchedHost;
      qa.extendedCount += q.extendedCount; qa.resetCount += q.resetCount;
      for (const k of Object.keys(q.qualityCensus)) qa.qualityCensus[k] = (qa.qualityCensus[k] || 0) + q.qualityCensus[k];
      for (const k of Object.keys(q.multCensus)) qa.multCensus[k] = (qa.multCensus[k] || 0) + q.multCensus[k];
      qa.steeredCount += q.steeredCount;
      for (const g of q.refreshGrants) qa.refreshGrants.push(Object.assign({ seed: r.seed }, g));
      for (const d of q.steeredDays) qa.steeredDays.push(Object.assign({ seed: r.seed }, d));
      for (const d of q.coldSeatDays) qa.coldSeatDays.push(Object.assign({ seed: r.seed }, d));
      for (const c of q.refusedCosts) qa.refusedCosts.push(Object.assign({ seed: r.seed }, c));
      qa.refusedTotal += q.refusedTotal; qa.refusedArmedTotal += q.refusedArmedTotal; qa.refusedUnarmedTotal += q.refusedUnarmedTotal;
      for (const k of Object.keys(q.refusedByReason)) qa.refusedByReason[k] = (qa.refusedByReason[k] || 0) + q.refusedByReason[k];
      for (const g of q.grantsWithoutHost) qa.grantsWithoutHost.push(Object.assign({ seed: r.seed }, g));
    }
    let ra = null;
    try { ra = analyzeRefresh(r.feastdraw, (r.ctxFd || {}).frBuffSnaps || []); } catch (e) { console.log(`  REFRESH ANALYZE FAILED ${pid} seed=${r.seed}: ${String((e && e.message) || e).slice(0, 120)}`); }
    if (ra) {
      fr.refreshCount += ra.refreshCount; fr.unmatched += ra.unmatched; fr.drawsOnRefresh += ra.drawsOnRefresh;
      for (const k of Object.keys(ra.reasonCounts)) fr.reasonCounts[k] = (fr.reasonCounts[k] || 0) + ra.reasonCounts[k];
    }
  }
  fd.drawsPerFreshGrant = fd.fresh ? fd.spawned / fd.fresh : null;
  fd.facedRate = fd.spawned ? fd.faced / fd.spawned : null;
  fd.drivenOffRate = fd.spawned ? fd.drivenOff / fd.spawned : null;
  fd.killRate = fd.faced ? fd.facedWithKill / fd.faced : null;
  fd.veteransPerDraw = fd.spawned ? fd.wave4Kills / fd.spawned : null;
  return { band, feastdraw: fd, quality: qa, refresh: fr };
}

async function summaryMode() {
  const evidDir = evidDirOf();
  const arms = {};
  let corpusOk = true;
  for (const pid of ['control', 'quality']) {
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
      && r.nonworldkill.diag.errs === 0 && Object.values(r.nonworldkill.diag.overflow || {}).every(v => (v | 0) === 0)
      && r.hostfeast && Array.isArray(r.hostfeast.feasts)
      && r.hostfeast.diag.errs === 0 && Object.values(r.hostfeast.diag.overflow || {}).every(v => (v | 0) === 0));
    if (!ok) corpusOk = false;
    arms[pid] = Object.assign({ rows }, rollupArm(pid, rows));
  }
  const c = arms.control, d = arms.quality;
  const agreement = SEEDS.map(s => {
    const r = c.rows.find(x => x.seed === s), b = REBASELINE[s];
    const agree = !!(r && b && r.days === b.days && r.won === b.won && r.deathTotal === b.deaths);
    return { seed: s, control: r ? { days: r.days, won: r.won, deaths: r.deathTotal } : null, rebaseline: b, agree: agree };
  });
  const agreeCount = agreement.filter(a => a.agree).length;
  // Per-seed refused-cost table (quality arm + control).
  const refusedPerSeed = SEEDS.map(s => {
    const cr = c.rows.find(r => r.seed === s), dr = d.rows.find(r => r.seed === s);
    const cq = cr ? analyzeQuality(cr.feastdraw, cr.hostfeast, (cr.ctxFd || {}).frBuffSnaps || []) : null;
    const dq = dr ? analyzeQuality(dr.feastdraw, dr.hostfeast, (dr.ctxFd || {}).frBuffSnaps || []) : null;
    return {
      seed: s,
      control: cq ? { refusedTotal: cq.refusedTotal, refusedArmed: cq.refusedArmedTotal, refusedUnarmed: cq.refusedUnarmedTotal, n: cq.refusedCosts.length, byReason: cq.refusedByReason } : null,
      quality: dq ? { refusedTotal: dq.refusedTotal, refusedArmed: dq.refusedArmedTotal, refusedUnarmed: dq.refusedUnarmedTotal, n: dq.refusedCosts.length, byReason: dq.refusedByReason } : null,
    };
  });
  // DIAG legs (pre-registered): (a) step observed OR corpus holds
  // (step 0 AND mult-change 0 over all refresh grants — the
  // evidence then combines this with the method proof + the
  // substrate mechanism for leg (a)'s alternative); (b) window
  // re-confirmed (extended == reset == refreshCount on the
  // quality arm, or zero refresh grants with method proof noted).
  const legs = {
    a_stepObserved: d.quality.stepCount >= 1,
    a_corpusHolds: d.quality.refreshCount > 0 && d.quality.stepCount === 0 && d.quality.multChangeCount === 0,
    b_windowReconfirmed: d.quality.refreshCount > 0 && d.quality.extendedCount === d.quality.refreshCount && d.quality.resetCount === d.quality.refreshCount,
    c_classified: c.feastdraw.unclassified === 0 && d.feastdraw.unclassified === 0 && d.quality.unmatchedHost === 0 && d.quality.hostQualityMismatch === 0 && d.quality.stepAgreeFailures === 0,
  };
  legs.a_either = legs.a_stepObserved || legs.a_corpusHolds;
  legs.allOk = legs.a_either && legs.b_windowReconfirmed && legs.c_classified;
  const verdict = !corpusOk ? 'NO-GO (corpus)' : (legs.a_stepObserved && legs.b_windowReconfirmed && legs.c_classified) ? 'DIAG-GO (step observed)' : (legs.a_corpusHolds && legs.b_windowReconfirmed && legs.c_classified) ? 'DIAG-HOLD (corpus holds; leg (a) alternative needs method proof + substrate mechanism in evidence)' : 'NO-GO';
  const summary = {
    arms: {
      control: { band: c.band, feastdraw: c.feastdraw, quality: { refreshCount: c.quality.refreshCount, stepCount: c.quality.stepCount, qualityCensus: c.quality.qualityCensus, refusedTotal: c.quality.refusedTotal } },
      quality: { band: d.band, feastdraw: d.feastdraw, quality: d.quality, refresh: d.refresh },
    },
    agreement: agreement, agreeCount: agreeCount,
    refusedPerSeed: refusedPerSeed,
    legs: legs, verdict: verdict,
    corpusOk: corpusOk,
  };
  const summaryPath = path.join(evidDir, 'summary.json');
  writeFileRetry(summaryPath, JSON.stringify(summary, null, 1) + '\n');
  console.log(`  CONTROL band: won=${c.band.won}/8 median=${c.band.medianDays}d medianNonWon=${c.band.medianNonWonDays}d natEver=${c.band.nationalEver} natFinal=${c.band.nationalFinal} table=${c.band.table} entered=${c.band.entered} wave4=${c.band.wave4} wave5=${c.band.wave5} starv=${c.band.starvationTotal} deaths=${c.band.deathTotal}`);
  console.log(`  QUALITY band: won=${d.band.won}/8 median=${d.band.medianDays}d medianNonWon=${d.band.medianNonWonDays}d natEver=${d.band.nationalEver} natFinal=${d.band.nationalFinal} table=${d.band.table} entered=${d.band.entered} wave4=${d.band.wave4} wave5=${d.band.wave5} starv=${d.band.starvationTotal} deaths=${d.band.deathTotal}`);
  console.log(`  CONTROL grants: ${c.feastdraw.grants} (fresh=${c.feastdraw.fresh} refreshed=${c.feastdraw.refreshed} refused=${c.feastdraw.refused}) draws=${c.feastdraw.spawned} faced=${c.feastdraw.faced} driven=${c.feastdraw.drivenOff} kills=${c.feastdraw.totalKills} w4draws=${c.feastdraw.wave4Draws} w4kills=${c.feastdraw.wave4Kills} unclass=${c.feastdraw.unclassified}`);
  console.log(`  QUALITY grants: ${d.feastdraw.grants} (fresh=${d.feastdraw.fresh} refreshed=${d.feastdraw.refreshed} refused=${d.feastdraw.refused}) draws=${d.feastdraw.spawned} faced=${d.feastdraw.faced} driven=${d.feastdraw.drivenOff} kills=${d.feastdraw.totalKills} w4draws=${d.feastdraw.wave4Draws} w4kills=${d.feastdraw.wave4Kills} unclass=${d.feastdraw.unclassified}`);
  console.log(`  QUALITY refresh: refreshCount=${d.quality.refreshCount} steps=${d.quality.stepCount} holds=${d.quality.holdCount} multChanges=${d.quality.multChangeCount} steered=${d.quality.steeredCount} coldDays=${d.quality.coldSeatDays.length} extended=${d.quality.extendedCount} reset=${d.quality.resetCount} unmatchedHost=${d.quality.unmatchedHost} hostMismatch=${d.quality.hostQualityMismatch} stepAgreeFailures=${d.quality.stepAgreeFailures} drawsOnRefresh=${d.refresh.drawsOnRefresh}`);
  console.log(`  QUALITY census: granted quality=${JSON.stringify(d.quality.qualityCensus)} mult=${JSON.stringify(d.quality.multCensus)} | CONTROL census: quality=${JSON.stringify(c.quality.qualityCensus)} mult=${JSON.stringify(c.quality.multCensus)}`);
  console.log(`  STEERED: ${d.quality.steeredDays.map(x => `s${x.seed}d${x.day}:q${x.quality},cold${x.coldSeats}`).join(' ') || 'none'}`);
  console.log(`  COLD-SEAT days (quality arm): ${d.quality.coldSeatDays.map(x => `s${x.seed}d${x.day}:cold${x.coldSeats},q${x.quality}`).join(' ') || 'none'}`);
  console.log(`  REFUSED COST per seed (control -> quality): ${refusedPerSeed.map(x => `s${x.seed}:${x.control ? x.control.refusedTotal : '?'}->${x.quality ? x.quality.refusedTotal : '?'}`).join(' ')} | totals control=${c.quality.refusedTotal} quality=${d.quality.refusedTotal} | quality armed=${d.quality.refusedArmedTotal} unarmed=${d.quality.refusedUnarmedTotal} reasons=${JSON.stringify(d.quality.refusedByReason)}`);
  console.log(`  CONTROL-AGREEMENT vs rebaseline: ${agreeCount}/8 agree — ${agreement.map(a => `s${a.seed}:${a.agree ? 'agree' : ('DEVIATE c=' + JSON.stringify(a.control) + ' r=' + JSON.stringify(a.rebaseline))}`).join(' ')}`);
  console.log(`  LEGS: (a)step ${legs.a_stepObserved} (${d.quality.stepCount}) | (a)holds ${legs.a_corpusHolds} | (b)window ${legs.b_windowReconfirmed} (${d.quality.extendedCount}/${d.quality.resetCount}/${d.quality.refreshCount}) | (c)classified ${legs.c_classified} | ALL ${legs.allOk}`);
  console.log(`  VERDICT: ${verdict} | CORPUS: ${corpusOk ? 'PASS' : 'FAIL'} -> ${summaryPath}`);
  if (!corpusOk) { console.error('PROOF GATE FAILURE'); process.exit(1); }
}

async function detgateMode() {
  const seed = parseInt(process.env.SEED || '73671', 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  delete process.env.QUALITYREFRESH; delete process.env.HOSTFEASTREC;
  delete process.env.FEASTREFRESH; delete process.env.FEASTDRAWDRIVEOFF; delete process.env.COMPETENT_SEEK_FIGHTS;
  delete process.env.FEASTDRAW; delete process.env.NONWORLDKILL;
  process.env.LEANLINKRESCUE = '1'; process.env.TABLESEATNOWAIT = '1';
  const b = await (async () => {
    const { Game } = await loadGame({ seed, mode: 'qualityrefresh-detgate-base', fullTelemetry: false });
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
  const w = await (async () => {
    const { Game } = await loadGame({ seed, mode: 'qualityrefresh-detgate-wrapped', fullTelemetry: false });
    await setupGame(Game);
    const fdStore = newFdStore(), nwkStore = newNwkStore(), hfStore = newHostStore();
    const base = withHostfeastRec(withFeastdrawDiag(withNonworldkillDiag(qualityrefresh, 'nonworldkill-diag', 'detgate', nwkStore), 'feastdraw-diag', 'detgate', fdStore), 'hostfeast-rec', 'detgate', hfStore);
    let capturedCtx = null;
    const policy = Object.assign({}, base, {
      daily(G, ctx) { if (!capturedCtx) capturedCtx = ctx; return base.daily(G, ctx); },
    });
    const result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 10 });
    const ts = {};
    if (capturedCtx) for (const k of Object.keys(capturedCtx)) if (k.indexOf('ts') === 0) ts[k] = capturedCtx[k];
    const hasQrSurface = !!(capturedCtx && (capturedCtx.qrInterventions != null || capturedCtx.qrHostErr != null || capturedCtx.qrSteerErr != null || capturedCtx._qrHostDay != null));
    const hasHfSurface = !!(capturedCtx && (capturedCtx._hostfeast != null));
    const hasFrSurface = !!(capturedCtx && (capturedCtx.frBuffSnaps != null || capturedCtx.frBuffSnapsOverflow != null || capturedCtx.frSnapErr != null));
    const hasFdSurface = !!(capturedCtx && (capturedCtx._feastdraw != null || capturedCtx._nonworldkill != null || capturedCtx.fdDriveoffAttempts != null));
    const wrapsInstalled = !!Game._hostfeastRecInstalled || !!Game._feastdrawDiagInstalled || !!Game._nonworldkillDiagInstalled;
    return { days: result.days, gameDays: result.gameDays, ts: ts, hasQrSurface: hasQrSurface, hasHfSurface: hasHfSurface, hasFrSurface: hasFrSurface, hasFdSurface: hasFdSurface, wrapsInstalled: wrapsInstalled };
  })();
  const ok = b.days === w.days && b.gameDays === w.gameDays
    && JSON.stringify(b.ts) === JSON.stringify(w.ts) && !w.hasQrSurface && !w.hasHfSurface && !w.hasFrSurface && !w.hasFdSurface && !w.wrapsInstalled;
  console.log(`DETGATE seed=${seed} baseline days=${b.days} gameDays=${b.gameDays} ts=${JSON.stringify(b.ts)} | wrapped(OFF) days=${w.days} gameDays=${w.gameDays} ts=${JSON.stringify(w.ts)} qrSurface=${w.hasQrSurface} hfSurface=${w.hasHfSurface} frSurface=${w.hasFrSurface} fdSurface=${w.hasFdSurface} wrapsInstalled=${w.wrapsInstalled} -> ${ok ? 'PASS' : 'FAIL'}`);
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
if (require.main === module) main().catch(e => { console.error('QUALITYREFRESH SWEEP FAILED:', (e && e.stack) || e); process.exit(1); });
module.exports = { runOne, rollupArm, analyzeQuality, SEEDS, REBASELINE };
