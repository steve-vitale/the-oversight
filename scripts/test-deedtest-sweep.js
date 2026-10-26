#!/usr/bin/env node
// scripts/test-deedtest-sweep.js — sim-deedtest-a sweep
// (scale-onramp axis, 2026-10-26: the Arc IV deed test.
// POLICY-SIDE ONLY, zero src/js changes.)
//
// TWO ARMS on identical seeds (73671-73678, 180d death-aware),
// both fresh in this sweep — never a copied sibling corpus:
//   control = tableseat-nowait + feastdraw-diag +
//             nonworldkill-diag + deedtest-diag (always-face)
//   clean   = feastdraw-driveoff-clean (FEASTDRAWCLEAN=1,
//             COMPETENT_SEEK_FIGHTS left ON) + the same three
//             recorders (every draw driven off, patrol on)
// The clean arm is reused verbatim as a diagnostic contrast,
// not a new lever: it is the only arm in which a driven-off
// beast can later be met in the world.
//
// Modes (read the argv handling here — do NOT probe with --help):
//   --one <pid> <seed> : run one seed, write its row.
//   --summary : build summary.json from the rows on disk, print
//     the comparison table + DIAG verdict computation. Exit 1 on
//     corpus failure (missing rows, recorder errors > 0).
//   --detgate : delegation-off proof on one seed (SEED env,
//     default 73671): plain tableseat-nowait vs the recorder
//     stack with all envs unset must match on days/gameDays/ts,
//     with no ctx deed surface and no installed wraps.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { tableseatNowait } = require('./policies/tableseat-nowait');
const { feastdrawDriveoffClean } = require('./policies/feastdraw-driveoff-clean');
const {
  newStore: newFdStore, installFeastdrawDiag, withFeastdrawDiag,
  analyzeFeastdraw,
} = require('./policies/feastdraw-diag');
const {
  newStore: newNwkStore, installNonworldkillDiag, withNonworldkillDiag,
  analyzeNonworldkill,
} = require('./policies/nonworldkill-diag');
const {
  newStore: newDtStore, installDeedtestDiag, withDeedtestDiag,
  analyzeDeed, snapFaced,
} = require('./policies/deedtest-diag');

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
  // Write-flap hardening (2026-10-26, sim-deedtest-a): evidence-dir
  // writes EPERM intermittently while /tmp stays flap-free. Write
  // the body to a /tmp staging file first (verified by size),
  // then copy into place with retries; the staging file is the
  // backup if the evidence copy still fails, and is copied in
  // the SAME process immediately — never left as the only copy.
  const staging = path.join('/tmp', 'deedtest-' + path.basename(p));
  let lastErr = null;
  try {
    fs.writeFileSync(staging, body);
    if (fs.statSync(staging).size !== Buffer.byteLength(body)) throw new Error('staging size mismatch');
  } catch (e) { console.log(`WRITE-STAGING-FAILED ${path.basename(p)} err=${String((e && e.message) || e).slice(0, 160)} — falling back to direct writes`); }
  for (let a = 1; a <= 8; a++) {
    try {
      fs.mkdirSync(path.dirname(p), { recursive: true });
      if (fs.existsSync(staging) && fs.statSync(staging).size === Buffer.byteLength(body)) fs.copyFileSync(staging, p);
      else fs.writeFileSync(p, body);
      if (fs.statSync(p).size === Buffer.byteLength(body)) {
        try { fs.unlinkSync(staging); } catch (e) {}
        return;
      }
      throw new Error('destination size mismatch');
    } catch (e) {
      lastErr = e;
      console.log(`WRITE-RETRY ${path.basename(p)} attempt=${a} err=${String((e && e.message) || e).slice(0, 160)}`);
      if (a < 8) sleepMs(Math.min(10000, 1000 * a));
    }
  }
  // CHILD-WRITE FALLBACK (2026-10-26, sim-deedtest-a): a node
  // process that hits the write flap once keeps failing every
  // direct write (20/20 EPERM in one process while fresh
  // processes wrote fine in between) — same-process retries
  // are futile. Each child below is a FRESH process whose file
  // write is a new lottery ticket; the body reaches it over a
  // stdin pipe, never through the poisoned parent's file write.
  for (let a = 1; a <= 10; a++) {
    try {
      fs.mkdirSync(path.dirname(p), { recursive: true });
      const cp = require('child_process');
      const r = cp.spawnSync('/bin/sh', ['-c', 'cat > "$0"', p], { input: body, maxBuffer: Buffer.byteLength(body) + 4096 });
      if (r.error) throw r.error;
      if (r.status !== 0) throw new Error('child status ' + r.status + ' ' + String(r.stderr || '').slice(0, 120));
      if (fs.statSync(p).size === Buffer.byteLength(body)) {
        console.log(`WRITE-CHILD-OK ${path.basename(p)} attempt=${a}`);
        try { fs.unlinkSync(staging); } catch (e) {}
        return;
      }
      throw new Error('child destination size mismatch');
    } catch (e) {
      lastErr = e;
      console.log(`WRITE-CHILD-RETRY ${path.basename(p)} attempt=${a} err=${String((e && e.message) || e).slice(0, 160)}`);
      if (a < 10) sleepMs(5000);
    }
  }
  console.log(`WRITE-FAILED-BACKUP-KEPT ${staging}`);
  throw lastErr;
}
function snap(Game) {
  const out = { won: false, arc: 1, tableWaiting: false, tableEntered: false, rank: 'village' };
  try { out.won = !!Game.won; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; out.arc = pg.arc || 1; out.tableWaiting = !!pg.tableWaiting; out.tableEntered = !!pg.tableDone; } catch (e) {}
  try { out.rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) {}
  return out;
}
function snapDeed(Game) {
  // Called only at arc>=4 first sighting and at run end, when
  // the engine itself has already run deedState()/tableSeat()
  // (checkArc calls tableSeat every day) — these reads add no
  // new state. Returns nulls, never throws, on any failure.
  const out = { wavesFaced: null, deedGate: null, tableSeat: null, rank: null, stage: null };
  try { out.wavesFaced = snapFaced(Game); } catch (e) {}
  try { out.deedGate = (typeof Game.deedGateReady === 'function') ? Game.deedGateReady() : null; } catch (e) {}
  try { out.tableSeat = (typeof Game.tableSeat === 'function') ? Game.tableSeat() : null; } catch (e) {}
  try { out.rank = (Game.scaleRank ? Game.scaleRank() : null); } catch (e) {}
  try { out.stage = (typeof Game.integrationStage === 'function') ? Game.integrationStage() : null; } catch (e) {}
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
function waveKillLogOf(Game) {
  try {
    return ((Game.state || {}).waveKillLog || []).map(e => ({
      d: (e && e.d) | 0, mid: (e && e.mid) || null, w: (e && e.w) | 0,
      by: (e && e.by !== undefined) ? e.by : null, via: (e && e.via) || null,
    }));
  } catch (e) { return []; }
}

async function runOne(pid, seed, days, evidDir) {
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  process.env.FEASTDRAW = '1';
  process.env.NONWORLDKILL = '1';
  process.env.DEEDTEST = '1';
  if (pid === 'clean') {
    process.env.FEASTDRAWCLEAN = '1';
    delete process.env.COMPETENT_SEEK_FIGHTS;
  } else {
    delete process.env.FEASTDRAWCLEAN;
    delete process.env.COMPETENT_SEEK_FIGHTS;
  }
  const fdStore = newFdStore(), nwkStore = newNwkStore(), dtStore = newDtStore();
  const inner = pid === 'clean' ? feastdrawDriveoffClean : tableseatNowait;
  const base = withDeedtestDiag(withFeastdrawDiag(withNonworldkillDiag(inner, 'nonworldkill-diag', 'deedtest sweep + TB initiation census', nwkStore), 'feastdraw-diag', 'deedtest sweep + feast-draw yield census', fdStore), 'deedtest-diag', 'deedtest sweep + deed census', dtStore);
  const { Game } = await loadGame({ seed, mode: 'deedtest-' + pid, fullTelemetry: false });
  await setupGame(Game);
  try { installNonworldkillDiag(Game, nwkStore); } catch (e) {}
  try { installFeastdrawDiag(Game, fdStore); } catch (e) {}
  try { installDeedtestDiag(Game, dtStore); } catch (e) {}
  const sayLines = [];
  try {
    const origSay = Game.say;
    if (typeof origSay === 'function') {
      Game.say = function () {
        try {
          const t = String((arguments.length ? arguments[0] : '') || '');
          if (/circling the edge|drove off|never brave|table is being set|gives up and moves on/i.test(t) && sayLines.length < 100) {
            sayLines.push({ day: ((Game.state || {}).scholar || {}).day || 0, text: t.slice(0, 400) });
          }
        } catch (e) {}
        return origSay.apply(this, arguments);
      };
    }
  } catch (e) {}
  const hist = { maxRank: 0, maxArc: 1, everTable: false, everEntered: false };
  let capturedCtx = null;
  let arc4Snapshot = null;
  const patrolByDay = {};
  const policy = Object.assign({}, base, {
    upkeep(G, ctx) {
      let r;
      try { r = base.upkeep ? base.upkeep(G, ctx) : undefined; } catch (e) { r = undefined; }
      try {
        const d = ctx && ctx._feastFightDay, sw = ctx && ctx._feastFightSweeps;
        if (d && (sw | 0) > 0) patrolByDay[d] = Math.max(patrolByDay[d] || 0, sw | 0);
      } catch (e) {}
      return r;
    },
    daily(G, ctx) {
      if (!capturedCtx) capturedCtx = ctx;
      try {
        const s = snap(G);
        hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[s.rank] || 0);
        hist.maxArc = Math.max(hist.maxArc, s.arc || 1);
        if (s.tableWaiting) hist.everTable = true;
        if (s.tableEntered) hist.everEntered = true;
        if (!arc4Snapshot && (s.arc || 1) >= 4) {
          arc4Snapshot = Object.assign({ day: ((G.state || {}).scholar || {}).day || 0 }, snapDeed(G));
        }
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
    nationalEverSeat: (Math.max(hist.maxRank, RANK_ORDER[end.rank] || 0) >= 2 || ctxFd.tsNationalDay != null) ? 1 : 0,
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
    patrol: { byDay: patrolByDay, total: Object.values(patrolByDay).reduce((t, v) => t + v, 0), days: Object.keys(patrolByDay).length },
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
    deedtest: {
      events: dtStore.events, kills: dtStore.kills,
      diag: { errs: dtStore.errs, errors: dtStore.errors, overflow: dtStore.overflow, installed: dtStore.installed },
    },
    waveKillLog: waveKillLogOf(Game),
    finalDeed: snapDeed(Game),
    arc4Snapshot: arc4Snapshot,
  };
  if (evidDir) {
    const fn = path.join(evidDir, `s${seed}-${pid}.json`);
    writeFileRetry(fn, JSON.stringify(row, null, 1) + '\n');
    row.corpusFile = fn;
  }
  return row;
}

function evidDirOf() { return process.env.EVID || path.join(REPO, 'evidence', '2026-10-26', 'perseed-sim-deedtest-a'); }

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
      ? `grants=${an.grants} fresh=${an.fresh} refused=${an.refused} spawned=${an.spawned} faced=${an.faced} driven=${an.drivenOff} unmet=${an.unmet} w4draws=${an.wave4Draws} w4kills=${an.wave4Kills} unclass=${an.unclassified} fdErrs=${row.feastdraw.diag.errs}`
      : `fdErrs=${row.feastdraw.diag.errs} (analyze failed)`;
  }
  let dtLine = 'deedtest=null';
  if (row.deedtest) {
    let an = null; try { an = analyzeDeed(row.deedtest, row.nonworldkill, row.waveKillLog); } catch (e) { an = null; }
    const strikes = (row.deedtest.events || []).filter(e => e.monsterId === 'strike').map(e => `d${e.day}:${e.added ? 'ADD' : 'dup'}`).join(',');
    dtLine = an
      ? `deedEvents=${an.events} added=${an.addedCount} distinct=${an.distinctAdded} tbKillDeeds=${an.tbKillDeeds.length} fieldKills=${an.fieldKills.length} strikeDeeds=[${strikes}] dtErrs=${row.deedtest.diag.errs}`
      : `dtErrs=${row.deedtest.diag.errs} (analyze failed)`;
  }
  console.log(`  [${pid} seed ${seed}] days=${row.days} gameDays=${row.gameDays} end=${row.endReason} wave=${row.waveReach} arc=${row.maxArc} finalRank=${row.finalRank} natEver=${row.nationalEver} natEverSeat=${row.nationalEverSeat} natFinal=${row.nationalFinal} table=${row.table} entered=${row.entered} won=${row.won} starv=${row.starvationDeaths} deaths=${row.deathTotal} patrol=${(row.patrol && row.patrol.total) || 0}/${(row.patrol && row.patrol.days) || 0}d sayLines=${row.sayLines.length} ${fdLine} ${dtLine}`);
}

// Deed attribution rollup for one arm: every feast-draw beast
// kill classified by source, deed movement per kill.
function rollupArm(pid, rows) {
  const band = {
    n: rows.length,
    won: rows.reduce((t, r) => t + r.won, 0),
    medianDays: medianOf(rows.map(r => r.days)),
    nationalEver: rows.reduce((t, r) => t + r.nationalEver, 0),
    nationalEverSeat: rows.reduce((t, r) => t + r.nationalEverSeat, 0),
    nationalFinal: rows.reduce((t, r) => t + r.nationalFinal, 0),
    table: rows.reduce((t, r) => t + r.table, 0),
    entered: rows.reduce((t, r) => t + r.entered, 0),
    arc4: rows.filter(r => (r.maxArc || 1) >= 4).length,
    wave3: rows.filter(r => (r.waveReach || 1) >= 3).length,
    wave4: rows.filter(r => (r.waveReach || 1) >= 4).length,
    wave5: rows.filter(r => (r.waveReach || 1) >= 5).length,
    starvationTotal: rows.reduce((t, r) => t + r.starvationDeaths, 0),
    deathTotal: rows.reduce((t, r) => t + r.deathTotal, 0),
  };
  const fd = { grants: 0, fresh: 0, refreshed: 0, refused: 0, spawned: 0, outcomes: {}, faced: 0, drivenOff: 0, unmet: 0, facedWithKill: 0, totalKills: 0, wave4Draws: 0, wave4Kills: 0, waveDist: {}, unclassified: 0, drawOutcomes: [] };
  const deed = { events: 0, added: 0, distinctAdded: 0, tbKillDeeds: 0, fieldKills: 0,
    killsByDoor: {}, deedStatusByDoor: {}, feastDrawKills: [], feastDrawKillsUnclassified: 0,
    strikeDeeds: [] };
  for (const r of rows) {
    let an = null;
    try { an = analyzeFeastdraw(r.feastdraw, r.nonworldkill); } catch (e) { console.log(`  FEASTDRAW ANALYZE FAILED ${pid} seed=${r.seed}: ${String((e && e.message) || e).slice(0, 120)}`); }
    if (an) {
      fd.grants += an.grants; fd.fresh += an.fresh; fd.refreshed += an.refreshed; fd.refused += an.refused;
      fd.spawned += an.spawned;
      for (const k of Object.keys(an.outcomes)) fd.outcomes[k] = (fd.outcomes[k] || 0) + an.outcomes[k];
      fd.faced += an.faced; fd.drivenOff += an.drivenOff; fd.unmet += an.unmet;
      fd.facedWithKill += an.facedWithKill; fd.totalKills += an.totalKills;
      fd.wave4Draws += an.wave4Draws; fd.wave4Kills += an.wave4Kills;
      for (const k of Object.keys(an.waveDist)) fd.waveDist[k] = (fd.waveDist[k] || 0) + an.waveDist[k];
      fd.unclassified += an.unclassified;
      for (const o of an.drawOutcomes) fd.drawOutcomes.push(Object.assign({ seed: r.seed }, o));
    }
    let dan = null;
    try { dan = analyzeDeed(r.deedtest, r.nonworldkill, r.waveKillLog); } catch (e) { console.log(`  DEED ANALYZE FAILED ${pid} seed=${r.seed}: ${String((e && e.message) || e).slice(0, 120)}`); }
    if (dan) {
      deed.events += dan.events; deed.added += dan.addedCount;
      deed.distinctAdded += dan.distinctAdded;
      deed.tbKillDeeds += dan.tbKillDeeds.length; deed.fieldKills += dan.fieldKills.length;
      for (const t of dan.tbKillDeeds) {
        deed.killsByDoor[t.door] = (deed.killsByDoor[t.door] || 0) + 1;
        const key = t.door + '/' + t.deedStatus;
        deed.deedStatusByDoor[key] = (deed.deedStatusByDoor[key] || 0) + 1;
      }
      // Feast-draw beast kills: draw outcomes with a kill,
      // joined to the TB kill deed by fightId (exact), with a
      // fallback join on (mid, kill day) when fightId is null.
      const byFightId = {};
      for (const t of dan.tbKillDeeds) if (t.fightId) byFightId[t.fightId] = t;
      const byMidDay = {};
      for (const t of dan.tbKillDeeds) {
        if (t.kill) byMidDay[t.kill.mid + '|' + t.kill.d] = t;
      }
      if (an) {
        for (const o of an.drawOutcomes) {
          if (!o.hasKill) continue;
          for (const k of (o.kills || [])) {
            let t = (o.fightId && byFightId[o.fightId]) || byMidDay[k.mid + '|' + k.d] || null;
            const rec = { seed: r.seed, drawDay: o.day, monsterId: o.monsterId, wave: o.wave,
              outcome: o.outcome, fightId: o.fightId || null, killDay: k.d, killMid: k.mid,
              killBy: k.by || null, killVia: k.via || null,
              door: t ? t.door : null, deedStatus: t ? t.deedStatus : null,
              deedFirstDay: t ? t.deedFirstDay : null };
            deed.feastDrawKills.push(rec);
            if (!t || t.door === 'other' || t.door === 'direct-build') deed.feastDrawKillsUnclassified++;
          }
        }
      }
      for (const ev of ((r.deedtest || {}).events || [])) {
        if (ev.monsterId === 'strike') deed.strikeDeeds.push({ seed: r.seed, day: ev.day, added: !!ev.added, wasPresent: !!ev.wasPresent, stack: ev.stack || '' });
      }
    }
  }
  return { band, feastdraw: fd, deed: deed };
}

async function summaryMode() {
  const evidDir = evidDirOf();
  const arms = {};
  let corpusOk = true;
  for (const pid of ['control', 'clean']) {
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
      && r.deedtest && Array.isArray(r.deedtest.events) && Array.isArray(r.deedtest.kills)
      && r.deedtest.diag.errs === 0 && Object.values(r.deedtest.diag.overflow || {}).every(v => (v | 0) === 0));
    if (!ok) corpusOk = false;
    arms[pid] = Object.assign({ rows }, rollupArm(pid, rows));
  }
  const c = arms.control, d = arms.clean;
  // 73678 focus: strike deed trace on both arms.
  function strikeFocus(arm) {
    const r = arm.rows.find(x => x.seed === 73678);
    if (!r) return null;
    let an = null; try { an = analyzeFeastdraw(r.feastdraw, r.nonworldkill); } catch (e) {}
    let dan = null; try { dan = analyzeDeed(r.deedtest, r.nonworldkill, r.waveKillLog); } catch (e) {}
    const strikes = (dan ? dan.tbKillDeeds : []).filter(t => t.mid === 'strike' || (t.kill && t.kill.mid === 'strike'));
    const fieldStrikes = (dan ? dan.fieldKills : []).filter(t => t.mid === 'strike');
    return { seed: 73678, days: r.days, won: r.won, maxArc: r.maxArc, finalRank: r.finalRank,
      table: r.table, entered: r.entered,
      draws: an ? an.drawOutcomes.filter(o => o.monsterId === 'strike') : [],
      strikeDeedEvents: ((r.deedtest || {}).events || []).filter(e => e.monsterId === 'strike'),
      tbStrikeKills: strikes, fieldStrikeKills: fieldStrikes,
      finalDeed: r.finalDeed || null, arc4Snapshot: r.arc4Snapshot || null,
      strikeWaveKills: (r.waveKillLog || []).filter(e => e.mid === 'strike') };
  }
  const focus = { control: strikeFocus(c), clean: strikeFocus(d) };
  // Leg (c): 73678 reproduced if control faced a strike draw, or
  // clean drove a strike draw off and later world-bump-killed it.
  const cFacedStrike = !!(focus.control && focus.control.draws.some(o => o.outcome === 'faced-face' || o.outcome === 'faced-harness'));
  const dDrivenStrike = !!(focus.clean && focus.clean.draws.some(o => o.outcome === 'driven-off'));
  const dWorldStrike = !!(focus.clean && focus.clean.tbStrikeKills.some(t => t.door === 'world-bump'));
  const legC = cFacedStrike || (dDrivenStrike && dWorldStrike);
  const legA = (c.deed.feastDrawKillsUnclassified === 0 && d.deed.feastDrawKillsUnclassified === 0
    && c.feastdraw.unclassified === 0 && d.feastdraw.unclassified === 0);
  // Leg (b): every feast-draw kill carries a deedStatus (not null).
  const legB = c.deed.feastDrawKills.every(k => k.deedStatus != null) && d.deed.feastDrawKills.every(k => k.deedStatus != null);
  // Candidate plain answer: if any world-bump feast-draw-beast
  // kill (or the clean 73678 world-bump strike kill) moved the
  // deed counter at its fight, the counter is shared, not
  // faced-only. 'never' on a world-bump kill would support
  // faced-only.
  const worldKills = c.deed.feastDrawKills.concat(d.deed.feastDrawKills).filter(k => k.door === 'world-bump');
  const cleanStrikeWorld = (focus.clean && focus.clean.tbStrikeKills.find(t => t.door === 'world-bump')) || null;
  const candidateAnswer = cleanStrikeWorld
    ? (cleanStrikeWorld.deedStatus === 'never' ? 'YES (faced-only, world-bump did not move the counter)' : 'NO (shared counter: world-bump kill deed status ' + cleanStrikeWorld.deedStatus + ')')
    : (worldKills.length && worldKills.every(k => k.deedStatus !== 'never') ? 'NO (shared counter, from other world-bump feast-beast kills)' : 'UNRESOLVED (no world-bump feast-beast kill to judge)');
  const verdict = (legA && legB && legC) ? 'DIAG-GO' : 'DIAG-NO-GO';
  const report = {
    label: 'sim-deedtest-a', seeds: SEEDS, days: 180,
    control: { band: c.band, feastdraw: c.feastdraw, deed: c.deed },
    clean: { band: d.band, feastdraw: d.feastdraw, deed: d.deed },
    focus73678: focus, legs: { a: legA, b: legB, c: legC, cDetail: { cFacedStrike: cFacedStrike, dDrivenStrike: dDrivenStrike, dWorldStrike: dWorldStrike } },
    candidateAnswer: candidateAnswer, verdict: verdict, corpusOk: corpusOk,
    generated: new Date().toISOString(),
  };
  const saved = JSON.parse(JSON.stringify(report));
  delete saved.control.rows; delete saved.clean.rows;
  const summaryPath = path.join(evidDir, 'summary.json');
  if (process.env.SUMMARY_STDOUT === '1') {
    // Flap-proof path: the caller pipes stdout through a sibling
    // cat into summary.json; this process writes no file. The
    // comparison tables below still print to stdout afterwards,
    // so callers must split on the SUMMARY-JSON marker lines.
    console.log('---SUMMARY-JSON-BEGIN---');
    console.log(JSON.stringify(saved));
    console.log('---SUMMARY-JSON-END---');
  } else {
    writeFileRetry(summaryPath, JSON.stringify(saved, null, 1) + '\n');
  }
  console.log('\n=== sim-deedtest-a ===');
  console.log(`  CONTROL band: n=${c.band.n} won=${c.band.won} medD=${c.band.medianDays} natEver=${c.band.nationalEver} natEverSeat=${c.band.nationalEverSeat} natFinal=${c.band.nationalFinal} table=${c.band.table} entered=${c.band.entered} arc4=${c.band.arc4} wave3=${c.band.wave3} wave4=${c.band.wave4} wave5=${c.band.wave5} starv=${c.band.starvationTotal} deaths=${c.band.deathTotal}`);
  console.log(`  CLEAN band: n=${d.band.n} won=${d.band.won} medD=${d.band.medianDays} natEver=${d.band.nationalEver} natEverSeat=${d.band.nationalEverSeat} natFinal=${d.band.nationalFinal} table=${d.band.table} entered=${d.band.entered} arc4=${d.band.arc4} wave3=${d.band.wave3} wave4=${d.band.wave4} wave5=${d.band.wave5} starv=${d.band.starvationTotal} deaths=${d.band.deathTotal}`);
  console.log(`  CONTROL feastdraw: grants=${c.feastdraw.grants} fresh=${c.feastdraw.fresh} refused=${c.feastdraw.refused} spawned=${c.feastdraw.spawned} faced=${c.feastdraw.faced} driven=${c.feastdraw.drivenOff} unmet=${c.feastdraw.unmet} facedWithKill=${c.feastdraw.facedWithKill} totalKills=${c.feastdraw.totalKills} w4draws=${c.feastdraw.wave4Draws} w4kills=${c.feastdraw.wave4Kills} waveDist=${JSON.stringify(c.feastdraw.waveDist)} outcomes=${JSON.stringify(c.feastdraw.outcomes)} unclass=${c.feastdraw.unclassified}`);
  console.log(`  CLEAN feastdraw: grants=${d.feastdraw.grants} fresh=${d.feastdraw.fresh} refused=${d.feastdraw.refused} spawned=${d.feastdraw.spawned} faced=${d.feastdraw.faced} driven=${d.feastdraw.drivenOff} unmet=${d.feastdraw.unmet} facedWithKill=${d.feastdraw.facedWithKill} totalKills=${d.feastdraw.totalKills} w4draws=${d.feastdraw.wave4Draws} w4kills=${d.feastdraw.wave4Kills} waveDist=${JSON.stringify(d.feastdraw.waveDist)} outcomes=${JSON.stringify(d.feastdraw.outcomes)} unclass=${d.feastdraw.unclassified}`);
  console.log(`  CONTROL deed: events=${c.deed.events} added=${c.deed.added} distinct=${c.deed.distinctAdded} tbKillDeeds=${c.deed.tbKillDeeds} fieldKills=${c.deed.fieldKills} killsByDoor=${JSON.stringify(c.deed.killsByDoor)} deedStatusByDoor=${JSON.stringify(c.deed.deedStatusByDoor)} feastDrawKills=${c.deed.feastDrawKills.length} unclass=${c.deed.feastDrawKillsUnclassified}`);
  console.log(`  CLEAN deed: events=${d.deed.events} added=${d.deed.added} distinct=${d.deed.distinctAdded} tbKillDeeds=${d.deed.tbKillDeeds} fieldKills=${d.deed.fieldKills} killsByDoor=${JSON.stringify(d.deed.killsByDoor)} deedStatusByDoor=${JSON.stringify(d.deed.deedStatusByDoor)} feastDrawKills=${d.deed.feastDrawKills.length} unclass=${d.deed.feastDrawKillsUnclassified}`);
  console.log(`  CONTROL feast-draw kills: ${c.deed.feastDrawKills.map(k => `s${k.seed}d${k.drawDay}:${k.monsterId}/w${k.wave}/${k.outcome}/door=${k.door}/deed=${k.deedStatus}/first=${k.deedFirstDay}`).join(' ') || 'none'}`);
  console.log(`  CLEAN feast-draw kills: ${d.deed.feastDrawKills.map(k => `s${k.seed}d${k.drawDay}:${k.monsterId}/w${k.wave}/${k.outcome}/door=${k.door}/deed=${k.deedStatus}/first=${k.deedFirstDay}`).join(' ') || 'none'}`);
  console.log(`  73678 CONTROL: ${focus.control ? `days=${focus.control.days} won=${focus.control.won} arc=${focus.control.maxArc} rank=${focus.control.finalRank} table=${focus.control.table} entered=${focus.control.entered} draws=${JSON.stringify(focus.control.draws.map(o => o.day + ':' + o.outcome + (o.hasKill ? ':kill' : '')))} deedEvents=${JSON.stringify(focus.control.strikeDeedEvents.map(e => 'd' + e.day + ':' + (e.added ? 'ADD' : 'dup')))} tbKills=${JSON.stringify(focus.control.tbStrikeKills.map(t => 'd' + t.startDay + ':' + t.door + ':' + t.deedStatus))} waveKills=${JSON.stringify(focus.control.strikeWaveKills)}` : 'missing'}`);
  console.log(`  73678 CLEAN: ${focus.clean ? `days=${focus.clean.days} won=${focus.clean.won} arc=${focus.clean.maxArc} rank=${focus.clean.finalRank} table=${focus.clean.table} entered=${focus.clean.entered} draws=${JSON.stringify(focus.clean.draws.map(o => o.day + ':' + o.outcome + (o.hasKill ? ':kill' : '')))} deedEvents=${JSON.stringify(focus.clean.strikeDeedEvents.map(e => 'd' + e.day + ':' + (e.added ? 'ADD' : 'dup')))} tbKills=${JSON.stringify(focus.clean.tbStrikeKills.map(t => 'd' + t.startDay + ':' + t.door + ':' + t.deedStatus))} waveKills=${JSON.stringify(focus.clean.strikeWaveKills)}` : 'missing'}`);
  console.log(`  LEGS: (a) classified=${legA} | (b) deed-attributed=${legB} | (c) 73678-reproduced=${legC} (controlFacedStrike=${cFacedStrike} cleanDrivenStrike=${dDrivenStrike} cleanWorldStrike=${dWorldStrike})`);
  console.log(`  CANDIDATE ANSWER: ${candidateAnswer}`);
  console.log(`  VERDICT: ${verdict} | CORPUS: ${corpusOk ? 'PASS' : 'FAIL'} -> ${summaryPath}`);
  if (!corpusOk) { console.error('PROOF GATE FAILURE'); process.exit(1); }
}

async function detgateMode() {
  const seed = parseInt(process.env.SEED || '73671', 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  delete process.env.FEASTDRAWCLEAN; delete process.env.COMPETENT_SEEK_FIGHTS;
  delete process.env.FEASTDRAW; delete process.env.NONWORLDKILL; delete process.env.DEEDTEST;
  process.env.LEANLINKRESCUE = '1'; process.env.TABLESEATNOWAIT = '1';
  const b = await (async () => {
    const { Game } = await loadGame({ seed, mode: 'deedtest-detgate-base', fullTelemetry: false });
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
    const { Game } = await loadGame({ seed, mode: 'deedtest-detgate-wrapped', fullTelemetry: false });
    await setupGame(Game);
    const fdStore = newFdStore(), nwkStore = newNwkStore(), dtStore = newDtStore();
    const base = withDeedtestDiag(withFeastdrawDiag(withNonworldkillDiag(tableseatNowait, 'nonworldkill-diag', 'detgate', nwkStore), 'feastdraw-diag', 'detgate', fdStore), 'deedtest-diag', 'detgate', dtStore);
    let capturedCtx = null;
    const policy = Object.assign({}, base, {
      daily(G, ctx) { if (!capturedCtx) capturedCtx = ctx; return base.daily(G, ctx); },
    });
    const result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 10 });
    const ts = {};
    if (capturedCtx) for (const k of Object.keys(capturedCtx)) if (k.indexOf('ts') === 0) ts[k] = capturedCtx[k];
    const hasSurface = !!(capturedCtx && (capturedCtx._deedtest || capturedCtx._feastdraw || capturedCtx._nonworldkill));
    const wrapsInstalled = !!Game._deedtestDiagInstalled || !!Game._feastdrawDiagInstalled || !!Game._nonworldkillDiagInstalled;
    return { days: result.days, gameDays: result.gameDays, ts: ts, hasSurface: hasSurface, wrapsInstalled: wrapsInstalled };
  })();
  const ok = b.days === w.days && b.gameDays === w.gameDays
    && JSON.stringify(b.ts) === JSON.stringify(w.ts) && !w.hasSurface && !w.wrapsInstalled;
  console.log(`DETGATE seed=${seed} baseline days=${b.days} gameDays=${b.gameDays} ts=${JSON.stringify(b.ts)} | wrapped(OFF) days=${w.days} gameDays=${w.gameDays} ts=${JSON.stringify(w.ts)} surface=${w.hasSurface} wrapsInstalled=${w.wrapsInstalled} -> ${ok ? 'PASS' : 'FAIL'}`);
  if (!ok) process.exit(1);
}

async function onePrintMode(pid, seedArg) {
  // Flap-proof row delivery (2026-10-26, sim-deedtest-a): a sim
  // process that hits the regular-file write flap once keeps
  // failing every file write AND every spawned child's file
  // write (EPIPE), but its STDOUT pipe writes still work (the
  // retry lines themselves reached the caller). So this mode
  // never writes a file: it prints the row JSON to stdout and
  // lets the CALLING SHELL redirect it into the corpus file —
  // the shell process never hit the flap. Callers must verify
  // the file afterwards (size > 0 and JSON.parse succeeds).
  const seed = parseInt(seedArg, 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const row = await runOne(pid, seed, days, null);
  process.stdout.write(JSON.stringify(row) + '\n');
}

async function summaryPrintMode() {
  // Flap-proof summary delivery (same pattern as onePrintMode):
  // sets SUMMARY_STDOUT so summaryMode prints the report JSON
  // to stdout instead of writing summary.json itself; the
  // calling shell pipes it through a sibling cat into the file.
  process.env.SUMMARY_STDOUT = '1';
  return summaryMode();
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--summary-print')) return summaryPrintMode();
  if (args.includes('--one-print')) return onePrintMode(args[args.indexOf('--one-print') + 1], args[args.indexOf('--one-print') + 2]);
  if (args.includes('--one')) return oneMode(args[args.indexOf('--one') + 1], args[args.indexOf('--one') + 2]);
  if (args.includes('--summary')) return summaryMode();
  if (args.includes('--detgate')) return detgateMode();
  console.error('usage: --one <pid> <seed> | --summary | --detgate');
  process.exit(2);
}
if (require.main === module) main().catch(e => { console.error('DEEDTEST SWEEP FAILED:', (e && e.stack) || e); process.exit(1); });
module.exports = { runOne, rollupArm, SEEDS };
