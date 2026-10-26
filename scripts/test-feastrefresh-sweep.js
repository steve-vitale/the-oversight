#!/usr/bin/env node
// scripts/test-feastrefresh-sweep.js — sim-feastrefresh-a sweep
// (scale-onramp axis, 2026-10-26: exercise the feast refresh branch.
// POLICY-SIDE ONLY, zero src/js changes.)
//
// TWO ARMS on identical seeds (73671-73678, 180d death-aware):
//   control = tableseat-nowait + feastdraw-diag + nonworldkill-diag
//             (always-face via competent feastFightRoad; 7-day feast
//             cadence — the refresh branch is unreachable here)
//   refresh = feastrefresh policy (FEASTREFRESH=1,
//             FEASTDRAWDRIVEOFF=1, COMPETENT_SEEK_FIGHTS=0) + the
//             same two recorders (daily feast cadence + drive-off
//             draws, so the devotion stays armed and a re-feast
//             inside the 2-dawn window CAN refresh)
// The control side is this run's OWN baseline on current master —
// never the published control band (proven stale in feastdraw-a)
// and never any sibling arm's corpus.
//
// Modes (read the argv handling here — do NOT probe with --help):
//   --one <pid> <seed> : run one seed, write its row.
//   --summary : build summary.json from the rows on disk, print
//     the comparison table + DIAG-GO verdict computation. Exit 1
//     on corpus failure (missing rows, recorder errors > 0).
//   --detgate : delegation-off proof on one seed (SEED env,
//     default 73671): plain tableseat-nowait vs the refresh
//     policy with FEASTREFRESH/FEASTDRAWDRIVEOFF unset +
//     recorders off must match on days/gameDays/ts, with no ctx
//     fr/fd surface and no installed wraps.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { tableseatNowait } = require('./policies/tableseat-nowait');
const { feastrefresh } = require('./policies/feastrefresh');
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
// Rebaseline authoritative table (sim-rebaseline-a, base 8ea64d848):
// per-seed {days, won, deaths} for the control-agreement check only
// (diagnostic, never a gate — the own control side is the judge).
const REBASELINE = {
  73671: { days: 180, won: 0, deaths: 31 },
  73672: { days: 97, won: 1, deaths: 25 },
  73673: { days: 124, won: 1, deaths: 28 },
  73674: { days: 163, won: 1, deaths: 30 },
  73675: { days: 180, won: 0, deaths: 38 },
  73676: { days: 70, won: 0, deaths: 31 },
  73677: { days: 143, won: 0, deaths: 43 },
  73678: { days: 116, won: 1, deaths: 34 },
};
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

// refusalReason: classify a refused grant's why-text. 'other' is a
// real class (listed individually by the caller), never a silent bucket.
function refusalReason(whyText) {
  const t = String(whyText || '');
  if (/reactor/i.test(t)) return 'reactor';
  if (/devotion|keepsake/i.test(t)) return 'devotion';
  return 'other';
}

// matchPostSnap: the first post-upkeep snapshot at/after the grant.
// A dusk grant lands at dayPart 2, so same-day snapshots with
// part < 2 precede the grant and must not match.
function matchPostSnap(snaps, grantDay) {
  for (const s of (snaps || [])) {
    if (s.where !== 'post') continue;
    if (s.day > grantDay) return s;
    if (s.day === grantDay && (s.part == null || s.part >= 2)) return s;
  }
  return null;
}

// analyzeRefresh(feastStore, snaps): pure over one seed's stores +
// buff snapshots. Classifies every refresh grant: window semantics,
// draws on refresh, circling draws, refusal reasons, chains.
function analyzeRefresh(feastStore, snaps) {
  const fs = feastStore || {};
  const grants = fs.grants || [];
  const draws = fs.draws || [];
  const snapArr = snaps || [];
  const refreshGrants = [];
  const refusalReasons = [];
  let drawsOnRefresh = 0;
  for (let i = 0; i < grants.length; i++) {
    const g = grants[i];
    if (!g.granted) {
      refusalReasons.push({ idx: i, day: g.day, reason: refusalReason(g.why), why: (g.why || '').slice(0, 120) });
      continue;
    }
    if (!g.refreshed) continue;
    const drawsHere = draws.filter(d => d.grantIdx === i);
    const drawnHere = drawsHere.filter(d => d.drawn);
    drawsOnRefresh += drawnHere.length;
    const post = matchPostSnap(snapArr, g.day);
    const preUntil = (g.preBuff && g.preBuff.untilDay != null) ? g.preBuff.untilDay : null;
    const postUntil = (post && post.buff && post.buff.untilDay != null) ? post.buff.untilDay : null;
    refreshGrants.push({
      idx: i, day: g.day, quality: g.quality, mult: g.mult,
      preBuff: g.preBuff, preDraw: g.preDraw, postDraw: g.postDraw,
      drawsHere: drawsHere.length, drawnHere: drawnHere.length,
      postSnap: post ? { day: post.day, part: post.part, buff: post.buff, draw: post.draw } : null,
      postUntil: postUntil,
      extended: (preUntil != null && postUntil != null) ? (postUntil > preUntil) : null,
      resetToFreshLength: (postUntil != null) ? (postUntil === g.day + 2) : null,
      qualityBest: (post && post.buff && g.preBuff && g.preBuff.quality != null && g.quality != null)
        ? (post.buff.quality === Math.max(g.preBuff.quality, g.quality)) : null,
      circling: g.preDraw != null,
      drawSurvived: (g.preDraw && g.postDraw) ? (g.postDraw.monsterId === g.preDraw.monsterId) : null,
      matched: !!post,
    });
  }
  const unmatched = refreshGrants.filter(r => !r.matched);
  // Chains over GRANTED grants in order: a fresh grant opens a
  // segment; a refresh appends iff its day is the previous granted
  // grant's day + 1, else it starts a detached segment.
  const chains = [];
  let cur = null, prevGrantedDay = null;
  for (const g of grants) {
    if (!g.granted) continue;
    if (!g.refreshed) {
      if (cur) chains.push(cur);
      cur = { freshDay: g.day, refreshDays: [], detached: false };
    } else if (cur && prevGrantedDay != null && g.day === prevGrantedDay + 1) {
      cur.refreshDays.push(g.day);
    } else {
      if (cur) chains.push(cur);
      cur = { freshDay: null, refreshDays: [g.day], detached: true };
    }
    prevGrantedDay = g.day;
  }
  if (cur) chains.push(cur);
  const reasonCounts = {};
  for (const r of refusalReasons) reasonCounts[r.reason] = (reasonCounts[r.reason] || 0) + 1;
  return {
    refreshCount: refreshGrants.length,
    refreshGrants: refreshGrants,
    unmatched: unmatched.length,
    unmatchedList: unmatched.map(r => ({ idx: r.idx, day: r.day })),
    drawsOnRefresh: drawsOnRefresh,
    circlingCount: refreshGrants.filter(r => r.circling).length,
    circlingSurvived: refreshGrants.filter(r => r.circling && r.drawSurvived).length,
    extendedCount: refreshGrants.filter(r => r.extended === true).length,
    resetCount: refreshGrants.filter(r => r.resetToFreshLength === true).length,
    qualityBestCount: refreshGrants.filter(r => r.qualityBest === true).length,
    chains: chains,
    chainCount: chains.length,
    longestChain: chains.reduce((m, c) => Math.max(m, (c.freshDay != null ? 1 : 0) + c.refreshDays.length), 0),
    refusalReasons: refusalReasons,
    reasonCounts: reasonCounts,
  };
}

// subsequentAfterRefresh: for each refresh grant, the next grant on
// the same seed after that day — fresh / refreshed / refused / none.
// What breaks a chain is data, not a guess.
function subsequentAfterRefresh(rows, refreshGrantsBySeed) {
  const out = [];
  const bySeed = {};
  for (const r of rows) bySeed[r.seed] = r;
  for (const rg of refreshGrantsBySeed) {
    const r = bySeed[rg.seed];
    if (!r) continue;
    const next = (r.feastdraw.grants || []).find(g => g.day > rg.day);
    out.push({
      seed: rg.seed, refreshDay: rg.day,
      nextGrantDay: next ? next.day : null,
      nextFresh: next ? (!!next.granted && !next.refreshed) : null,
      nextRefreshed: next ? (!!next.granted && !!next.refreshed) : null,
      nextGranted: next ? !!next.granted : null,
      nextReason: next && !next.granted ? refusalReason(next.why) : null,
    });
  }
  return out;
}

async function runOne(pid, seed, days, evidDir) {
  // Per-arm env, set explicitly every call (the process runs
  // seeds sequentially; a previous arm's value must never leak).
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  process.env.FEASTDRAW = '1';
  process.env.NONWORLDKILL = '1';
  if (pid === 'refresh') {
    process.env.FEASTREFRESH = '1';
    process.env.FEASTDRAWDRIVEOFF = '1';
    process.env.COMPETENT_SEEK_FIGHTS = '0';
  } else {
    delete process.env.FEASTREFRESH;
    delete process.env.FEASTDRAWDRIVEOFF;
    delete process.env.COMPETENT_SEEK_FIGHTS;
  }
  const fdStore = newFdStore(), nwkStore = newNwkStore();
  const inner = pid === 'refresh' ? feastrefresh : tableseatNowait;
  const base = withFeastdrawDiag(withNonworldkillDiag(inner, 'nonworldkill-diag', 'feast refresh sweep + TB initiation census', nwkStore), 'feastdraw-diag', 'feast refresh sweep + feast-draw yield census', fdStore);
  const { Game } = await loadGame({ seed, mode: 'feastrefresh-' + pid, fullTelemetry: false });
  await setupGame(Game);
  try { installNonworldkillDiag(Game, nwkStore); } catch (e) {}
  try { installFeastdrawDiag(Game, fdStore); } catch (e) {}
  // Say-line capture (sweep-side instrumentation only: records
  // lines, writes no game state, draws no RNG). Refresh + draw /
  // drive-off / expiry lines, capped — the sense read's raw
  // transcript, not a log dump.
  const sayLines = [];
  try {
    const origSay = Game.say;
    if (typeof origSay === 'function') {
      Game.say = function () {
        try {
          const t = String((arguments.length ? arguments[0] : '') || '');
          if (/circling the edge|drove off|never brave|gives up and moves on|stoked higher|carries you on|FEASTED/i.test(t) && sayLines.length < 120) {
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
      if (k.indexOf('fd') === 0 || k.indexOf('ts') === 0 || k.indexOf('fr') === 0) ctxFd[k] = capturedCtx[k];
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

function evidDirOf() { return process.env.EVID || path.join(REPO, 'evidence', '2026-10-26', 'perseed-sim-feastrefresh-a'); }

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
  let frLine = 'refresh=null';
  if (row.feastdraw) {
    try {
      const ra = analyzeRefresh(row.feastdraw, (row.ctxFd || {}).frBuffSnaps || []);
      frLine = `refresh=${ra.refreshCount} drawsOnRefresh=${ra.drawsOnRefresh} circling=${ra.circlingCount} extended=${ra.extendedCount} reset=${ra.resetCount} unmatched=${ra.unmatched} snaps=${((row.ctxFd || {}).frBuffSnaps || []).length} reasons=${JSON.stringify(ra.reasonCounts)}`;
    } catch (e) { frLine = `refresh analyze failed: ${String((e && e.message) || e).slice(0, 120)}`; }
  }
  const fd = row.ctxFd || {};
  console.log(`  [${pid} seed ${seed}] days=${row.days} gameDays=${row.gameDays} end=${row.endReason} wave=${row.waveReach} arc=${row.maxArc} finalRank=${row.finalRank} natEver=${row.nationalEver} natFinal=${row.nationalFinal} table=${row.table} entered=${row.entered} won=${row.won} starv=${row.starvationDeaths} deaths=${row.deathTotal} sayLines=${row.sayLines.length} ${fdLine} ${frLine}`);
}

// Band rollup for one arm + the refresh analysis.
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
  const fr = { refreshCount: 0, refreshGrants: [], unmatched: 0, drawsOnRefresh: 0, circlingCount: 0, circlingSurvived: 0, extendedCount: 0, resetCount: 0, qualityBestCount: 0, chains: [], reasonCounts: {}, refusalList: [] };
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
    let ra = null;
    try { ra = analyzeRefresh(r.feastdraw, (r.ctxFd || {}).frBuffSnaps || []); } catch (e) { console.log(`  REFRESH ANALYZE FAILED ${pid} seed=${r.seed}: ${String((e && e.message) || e).slice(0, 120)}`); }
    if (ra) {
      fr.refreshCount += ra.refreshCount; fr.unmatched += ra.unmatched;
      fr.drawsOnRefresh += ra.drawsOnRefresh; fr.circlingCount += ra.circlingCount;
      fr.circlingSurvived += ra.circlingSurvived; fr.extendedCount += ra.extendedCount;
      fr.resetCount += ra.resetCount; fr.qualityBestCount += ra.qualityBestCount;
      for (const g of ra.refreshGrants) fr.refreshGrants.push(Object.assign({ seed: r.seed }, g));
      for (const c of ra.chains) fr.chains.push(Object.assign({ seed: r.seed }, c));
      for (const k of Object.keys(ra.reasonCounts)) fr.reasonCounts[k] = (fr.reasonCounts[k] || 0) + ra.reasonCounts[k];
      for (const x of ra.refusalReasons) fr.refusalList.push(Object.assign({ seed: r.seed }, x));
    }
  }
  fd.drawsPerFreshGrant = fd.fresh ? fd.spawned / fd.fresh : null;
  fd.facedRate = fd.spawned ? fd.faced / fd.spawned : null;
  fd.drivenOffRate = fd.spawned ? fd.drivenOff / fd.spawned : null;
  fd.killRate = fd.faced ? fd.facedWithKill / fd.faced : null;
  fd.veteransPerDraw = fd.spawned ? fd.wave4Kills / fd.spawned : null;
  return { band, feastdraw: fd, refresh: fr };
}

async function summaryMode() {
  const evidDir = evidDirOf();
  const arms = {};
  let corpusOk = true;
  for (const pid of ['control', 'refresh']) {
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
  const c = arms.control, d = arms.refresh;
  // Control-agreement check vs the rebaseline table (diagnostic only).
  const agreement = SEEDS.map(s => {
    const r = c.rows.find(x => x.seed === s), b = REBASELINE[s];
    const agree = !!(r && b && r.days === b.days && r.won === b.won && r.deathTotal === b.deaths);
    return { seed: s, control: r ? { days: r.days, won: r.won, deaths: r.deathTotal } : null, rebaseline: b, agree: agree };
  });
  const agreeCount = agreement.filter(a => a.agree).length;
  // Subsequent grants after each refresh (chain-break data).
  const sub = subsequentAfterRefresh(d.rows, d.refresh.refreshGrants);
  // Guardrails (reported, NOT verdict-flipping for this DIAG arm).
  const perSeedStarvExcess = SEEDS.map(s => {
    const cr = c.rows.find(r => r.seed === s), dr = d.rows.find(r => r.seed === s);
    return { seed: s, control: cr ? cr.starvationDeaths : null, refresh: dr ? dr.starvationDeaths : null, excess: (cr && dr) ? dr.starvationDeaths - cr.starvationDeaths : null };
  });
  const maxExcess = Math.max.apply(null, perSeedStarvExcess.map(x => (x.excess == null ? -999 : x.excess)));
  const guards = {
    starvTotalOk: d.band.starvationTotal <= c.band.starvationTotal + 2,
    starvPerSeedOk: maxExcess <= 2,
    medianNonWonOk: d.band.medianNonWonDays >= 0.8 * c.band.medianNonWonDays,
    winsOk: d.band.won >= c.band.won - 1,
    nationalOk: d.band.nationalEver >= c.band.nationalEver - 1,
  };
  guards.allOk = guards.starvTotalOk && guards.starvPerSeedOk && guards.medianNonWonOk && guards.winsOk && guards.nationalOk;
  // DIAG-GO legs (pre-registered): (a) classification complete,
  // (b) refresh exercised >= 10, (c) draws-on-refresh counted,
  // (d) refusal reasons classified.
  const legs = {
    a_classified: c.feastdraw.unclassified === 0 && d.feastdraw.unclassified === 0 && d.refresh.unmatched === 0,
    b_exercised: d.refresh.refreshCount >= 10,
    c_drawsCounted: Number.isInteger(d.refresh.drawsOnRefresh),
    d_reasonsClassified: d.refresh.refusalList.length === d.feastdraw.refused,
  };
  legs.allOk = legs.a_classified && legs.b_exercised && legs.c_drawsCounted && legs.d_reasonsClassified;
  const verdict = (corpusOk && legs.allOk) ? 'DIAG-GO' : 'NO-GO';
  const headerContradiction = d.refresh.drawsOnRefresh > 0;
  const summary = {
    arms: {
      control: { band: c.band, feastdraw: c.feastdraw, refresh: { refreshCount: c.refresh.refreshCount, drawsOnRefresh: c.refresh.drawsOnRefresh, reasonCounts: c.refresh.reasonCounts } },
      refresh: { band: d.band, feastdraw: d.feastdraw, refresh: d.refresh },
    },
    agreement: agreement, agreeCount: agreeCount,
    subsequentAfterRefresh: sub,
    perSeedStarvExcess: perSeedStarvExcess,
    guards: guards, legs: legs, verdict: verdict,
    headerContradictionDrawsOnRefresh: headerContradiction,
    corpusOk: corpusOk,
  };
  const summaryPath = path.join(evidDir, 'summary.json');
  writeFileRetry(summaryPath, JSON.stringify(summary, null, 1) + '\n');
  console.log(`  CONTROL band: won=${c.band.won}/8 median=${c.band.medianDays}d medianNonWon=${c.band.medianNonWonDays}d natEver=${c.band.nationalEver} natFinal=${c.band.nationalFinal} table=${c.band.table} entered=${c.band.entered} wave4=${c.band.wave4} wave5=${c.band.wave5} starv=${c.band.starvationTotal} deaths=${c.band.deathTotal}`);
  console.log(`  REFRESH band: won=${d.band.won}/8 median=${d.band.medianDays}d medianNonWon=${d.band.medianNonWonDays}d natEver=${d.band.nationalEver} natFinal=${d.band.nationalFinal} table=${d.band.table} entered=${d.band.entered} wave4=${d.band.wave4} wave5=${d.band.wave5} starv=${d.band.starvationTotal} deaths=${d.band.deathTotal}`);
  console.log(`  CONTROL grants: ${c.feastdraw.grants} (fresh=${c.feastdraw.fresh} refreshed=${c.feastdraw.refreshed} refused=${c.feastdraw.refused}) draws=${c.feastdraw.spawned} faced=${c.feastdraw.faced} driven=${c.feastdraw.drivenOff} kills=${c.feastdraw.totalKills} w4draws=${c.feastdraw.wave4Draws} w4kills=${c.feastdraw.wave4Kills} unclass=${c.feastdraw.unclassified}`);
  console.log(`  REFRESH grants: ${d.feastdraw.grants} (fresh=${d.feastdraw.fresh} refreshed=${d.feastdraw.refreshed} refused=${d.feastdraw.refused}) draws=${d.feastdraw.spawned} faced=${d.feastdraw.faced} driven=${d.feastdraw.drivenOff} kills=${d.feastdraw.totalKills} w4draws=${d.feastdraw.wave4Draws} w4kills=${d.feastdraw.wave4Kills} unclass=${d.feastdraw.unclassified}`);
  console.log(`  REFRESH branch: refreshCount=${d.refresh.refreshCount} drawsOnRefresh=${d.refresh.drawsOnRefresh} circling=${d.refresh.circlingCount} circlingSurvived=${d.refresh.circlingSurvived} extended=${d.refresh.extendedCount} resetToFreshLength=${d.refresh.resetCount} qualityBest=${d.refresh.qualityBestCount} unmatched=${d.refresh.unmatched} chains=${d.refresh.chains.length} longestChain=${Math.max.apply(null, d.refresh.chains.map(ch => (ch.freshDay != null ? 1 : 0) + ch.refreshDays.length))} reasons=${JSON.stringify(d.refresh.reasonCounts)}`);
  console.log(`  REFRESH chains: ${d.refresh.chains.map(ch => `s${ch.seed}:${ch.detached ? 'detached' : ('fresh d' + ch.freshDay)}+refresh[${ch.refreshDays.join(',')}]`).join(' ')}`);
  console.log(`  SUBSEQUENT after refresh: ${sub.map(x => `s${x.seed}d${x.refreshDay}->${x.nextGrantDay == null ? 'none' : ('d' + x.nextGrantDay + ':' + (x.nextRefreshed ? 'refresh' : x.nextFresh ? 'fresh' : ('refused:' + x.nextReason)))}`).join(' ')}`);
  console.log(`  CONTROL-AGREEMENT vs rebaseline: ${agreeCount}/8 agree — ${agreement.map(a => `s${a.seed}:${a.agree ? 'agree' : ('DEVIATE c=' + JSON.stringify(a.control) + ' r=' + JSON.stringify(a.rebaseline))}`).join(' ')}`);
  console.log(`  GUARDS (diagnostic, not verdict-flipping): starv ${d.band.starvationTotal} vs ${c.band.starvationTotal}+2 -> ${guards.starvTotalOk} | per-seed max excess ${maxExcess} -> ${guards.starvPerSeedOk} | medianNonWon ${d.band.medianNonWonDays} vs 0.8x${c.band.medianNonWonDays}=${0.8 * c.band.medianNonWonDays} -> ${guards.medianNonWonOk} | wins ${d.band.won} vs ${c.band.won}-1 -> ${guards.winsOk} | natEver ${d.band.nationalEver} vs ${c.band.nationalEver}-1 -> ${guards.nationalOk} | ALL ${guards.allOk}`);
  console.log(`  LEGS: (a)classified ${legs.a_classified} | (b)exercised>=10 ${legs.b_exercised} (${d.refresh.refreshCount}) | (c)drawsCounted ${legs.c_drawsCounted} (${d.refresh.drawsOnRefresh}) | (d)reasonsClassified ${legs.d_reasonsClassified} (${d.refresh.refusalList.length}/${d.feastdraw.refused}) | ALL ${legs.allOk}`);
  if (headerContradiction) console.log(`  HEADER CONTRADICTION: draws on refresh = ${d.refresh.drawsOnRefresh} — the header rule "never a refresh draws" is contradicted by the corpus; see refreshGrants for the rows.`);
  console.log(`  VERDICT: ${verdict} | CORPUS: ${corpusOk ? 'PASS' : 'FAIL'} -> ${summaryPath}`);
  if (!corpusOk) { console.error('PROOF GATE FAILURE'); process.exit(1); }
}

async function detgateMode() {
  const seed = parseInt(process.env.SEED || '73671', 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  delete process.env.FEASTREFRESH; delete process.env.FEASTDRAWDRIVEOFF; delete process.env.COMPETENT_SEEK_FIGHTS;
  delete process.env.FEASTDRAW; delete process.env.NONWORLDKILL;
  process.env.LEANLINKRESCUE = '1'; process.env.TABLESEATNOWAIT = '1';
  // Baseline: plain tableseat-nowait.
  const b = await (async () => {
    const { Game } = await loadGame({ seed, mode: 'feastrefresh-detgate-base', fullTelemetry: false });
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
  // Wrapped but OFF: refresh policy with the layer envs unset,
  // recorders off — must delegate byte-identically.
  const w = await (async () => {
    const { Game } = await loadGame({ seed, mode: 'feastrefresh-detgate-wrapped', fullTelemetry: false });
    await setupGame(Game);
    const fdStore = newFdStore(), nwkStore = newNwkStore();
    const base = withFeastdrawDiag(withNonworldkillDiag(feastrefresh, 'nonworldkill-diag', 'detgate', nwkStore), 'feastdraw-diag', 'detgate', fdStore);
    let capturedCtx = null;
    const policy = Object.assign({}, base, {
      daily(G, ctx) { if (!capturedCtx) capturedCtx = ctx; return base.daily(G, ctx); },
    });
    const result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 10 });
    const ts = {};
    if (capturedCtx) for (const k of Object.keys(capturedCtx)) if (k.indexOf('ts') === 0) ts[k] = capturedCtx[k];
    const hasFrSurface = !!(capturedCtx && (capturedCtx.frBuffSnaps != null || capturedCtx.frBuffSnapsOverflow != null || capturedCtx.frSnapErr != null));
    const hasFdSurface = !!(capturedCtx && (capturedCtx.fdDriveoffAttempts != null || capturedCtx.fdDriveoffOk != null || capturedCtx._feastdraw || capturedCtx._nonworldkill));
    const wrapsInstalled = !!Game._feastdrawDiagInstalled || !!Game._nonworldkillDiagInstalled;
    return { days: result.days, gameDays: result.gameDays, ts: ts, hasFrSurface: hasFrSurface, hasFdSurface: hasFdSurface, wrapsInstalled: wrapsInstalled };
  })();
  const ok = b.days === w.days && b.gameDays === w.gameDays
    && JSON.stringify(b.ts) === JSON.stringify(w.ts) && !w.hasFrSurface && !w.hasFdSurface && !w.wrapsInstalled;
  console.log(`DETGATE seed=${seed} baseline days=${b.days} gameDays=${b.gameDays} ts=${JSON.stringify(b.ts)} | wrapped(OFF) days=${w.days} gameDays=${w.gameDays} ts=${JSON.stringify(w.ts)} frSurface=${w.hasFrSurface} fdSurface=${w.hasFdSurface} wrapsInstalled=${w.wrapsInstalled} -> ${ok ? 'PASS' : 'FAIL'}`);
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
if (require.main === module) main().catch(e => { console.error('FEASTREFRESH SWEEP FAILED:', (e && e.stack) || e); process.exit(1); });
module.exports = { runOne, rollupArm, subsequentAfterRefresh, analyzeRefresh, refusalReason, matchPostSnap, SEEDS, REBASELINE };
