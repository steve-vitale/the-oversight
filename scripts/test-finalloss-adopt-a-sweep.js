#!/usr/bin/env node
// scripts/test-finalloss-adopt-a-sweep.js — sim-finalloss-adopt-a sweep
// (scale-onramp axis, 2026-10-27, arm sim-finalloss-adopt-a.
// DIAG / MEASUREMENT ONLY, zero src/js changes.)
//
// Adoption of the dead sim-finalloss-a arm (run
// fleshout-20261027T0105Z) under run fleshout-20261027T0615Z
// with run-id adaptation ONLY. The binding pre-registration
// (candidate-cause set F1-F13, classification definitions,
// DIAG-GO threshold, G1/G2 gates, cost bar, cross-checks,
// re-derivation requirement) lives in
// evidence/2026-10-27/sim-finalloss-adopt-a-prereg.md — read
// it before judging anything this script prints.
//
// Substrate: tableseat-nowait (LEANLINKRESCUE=1,
// TABLESEATNOWAIT=1), seeds 73671-73678, 180d death-aware
// horizon. One process per seed (default mode spawns --one
// children; every row is written incrementally into the
// worktree evidence dir, never /tmp).
//
// Baseline: plain tableseat-nowait, post-run pure-read
// snapshot. Armed: tableseat-nowait wrapped with the five
// w4dmg-a recorders verbatim (w4dmg, wave4enc, spawnsrc,
// fieldfinish, nonworldkill) PLUS the seq51gap-a recorder
// verbatim (seq51gap-diag) PLUS the NEW finalloss-diag
// recorder (FINALLOSS=1): tbEnd wrap + removeWorldMonster
// wrap, installed before the inner policy's daily work.
//
// Modes: --one <pid> <seed> | (default sweep) | --summary |
// --detgate | --detail <seed> | --sense <seed>.
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { tableseatNowait } = require('./policies/tableseat-nowait');
const { copyKillLog } = require('./policies/vetkill-diag');
const {
  newStore: newW4dmgStore, installW4dmgDiag, withW4dmgDiag,
} = require('./policies/w4dmg-diag');
const {
  newStore: newWaveStore, installWave4encDiag, withWave4encDiag,
} = require('./policies/wave4enc-diag');
const {
  newStore: newSpawnStore, installSpawnsrcDiag, withSpawnsrcDiag,
} = require('./policies/spawnsrc-diag');
const {
  newStore: newFFStore, installFieldfinishDiag, withFieldfinishDiag,
} = require('./policies/fieldfinish-diag');
const {
  newStore: newNwkStore, installNonworldkillDiag, withNonworldkillDiag, classifyStart,
} = require('./policies/nonworldkill-diag');
const {
  newStore: newGapStore, installSeq51gapDiag, withSeq51gapDiag, snapshotWorldForce,
} = require('./policies/seq51gap-diag');
const {
  newStore: newFinStore, installFinallossDiag, withFinallossDiag,
} = require('./policies/finalloss-diag');
const PI = require('./postunlock-instrument');

const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
const STARV_RE = /starv|hunger/i;
const SEEDS = (process.env.SEEDS || '73671,73672,73673,73674,73675,73676,73677,73678')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
// 1920Z band table (the re-baseline judge, from sim-wave4enc-a.md).
const BAND1920 = { wins: 2, nationalEver: 6, nationalFinal: 5, table: 4, entered: 2, wave4: 6, wave5: 0, medianDays: 152, deaths: 307, starvation: 1 };
// 0525Z current-base band (coordinator-supplied, same policy/seeds).
const BAND0525 = { wins: 4, nationalEver: 7, nationalFinal: 5, table: 5, entered: 4, wave4: 5, wave5: 0, medianDays: 130, deaths: 284, starvation: 2 };

function medianOf(arr) {
  if (!arr.length) return 0;
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}
function sleepMs(ms) { try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); } catch (e) {} }
function writeFileRetry(p, body) {
  // Flap-hardened: the container EPERM flap (AGENTS.md 2026-10-24)
  // denies evidence writes, and sweep #4/#5 proved it is
  // PATH-STICKY plus LONG: 40 slow retries (2-15s backoff) to
  // one path all EPERM for ~10+ minutes, while fresh paths in
  // the same directory intermittently succeed — the outage has
  // brief good gaps, and a 15s-spaced retry misses them all.
  // So every attempt writes a FRESH temp name in the same
  // directory and renames it over the target (rename is
  // metadata, not a write), and retries RAPIDLY (300ms) so a
  // gap of any real length is caught: 1200 attempts ≈ 6 min of
  // gap-catching per file. A failed attempt unlinks its temp
  // so no litter survives. Logging is throttled (first 3,
  // every 50th, last) so a long outage doesn't flood the log.
  let lastErr = null;
  const MAX_ATTEMPTS = 1200;
  for (let a = 1; a <= MAX_ATTEMPTS; a++) {
    const tmp = p + '.tmp-' + process.pid + '-' + a + '-' + Date.now();
    try {
      fs.mkdirSync(path.dirname(p), { recursive: true });
      fs.writeFileSync(tmp, body);
      fs.renameSync(tmp, p);
      return;
    } catch (e) {
      lastErr = e;
      try { fs.unlinkSync(tmp); } catch (e2) {}
      if (a <= 3 || a % 50 === 0 || a === MAX_ATTEMPTS) {
        console.log(`WRITE-RETRY ${path.basename(p)} attempt=${a} err=${String((e && e.message) || e).slice(0, 160)}`);
      }
      if (a < MAX_ATTEMPTS) sleepMs(300);
    }
  }
  throw lastErr;
}
function evidDirOf() { return process.env.EVID || path.join(REPO, 'evidence', '2026-10-27', 'perseed-finalloss-adopt-a'); }
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
function copyFaced(Game) {
  const out = { faced: {}, errs: 0, error: null };
  try {
    const ds = (typeof Game.deedState === 'function') ? Game.deedState() : null;
    const faced = (ds && ds.wavesFaced) || {};
    for (const k of Object.keys(faced)) out.faced[k] = faced[k] | 0;
  } catch (e) { out.errs++; out.error = 'wavesFaced: ' + String((e && e.message) || e).slice(0, 100); }
  return out;
}

function wrapArmed() {
  const stores = {
    w4dmg: newW4dmgStore(), wave: newWaveStore(), spawn: newSpawnStore(),
    ff: newFFStore(), nwk: newNwkStore(), gap: newGapStore(), fin: newFinStore(),
  };
  const base = withFinallossDiag(
    withSeq51gapDiag(
      withNonworldkillDiag(
        withFieldfinishDiag(
          withSpawnsrcDiag(
            withWave4encDiag(
              withW4dmgDiag(tableseatNowait, 'w4dmg-diag', 'tableseat-nowait + wave-4 damage decomposition recorder', stores.w4dmg),
              'wave4enc-diag', 'tableseat-nowait + wave-4 field spawn-link recorder', stores.wave),
            'spawnsrc-diag', 'tableseat-nowait + spawn-source census', stores.spawn),
          'fieldfinish-diag', 'tableseat-nowait + wounded field-finish recorder', stores.ff),
        'nonworldkill-diag', 'tableseat-nowait + TB initiation census', stores.nwk),
      'seq51gap-diag', 'tableseat-nowait + daily world-entity HP tick recorder', stores.gap),
    'finalloss-diag', 'tableseat-nowait + final-loss restore-path recorder', stores.fin);
  return { base, stores };
}

async function runOne(pid, seed, days, evidDir) {
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  let stores = null;
  let base = tableseatNowait;
  if (pid === 'armed') {
    process.env.W4DMG = '1'; process.env.WAVE4ENC = '1'; process.env.SPAWNSRC = '1'; process.env.FIELDFINISH = '1'; process.env.NONWORLDKILL = '1'; process.env.SEQ51GAP = '1'; process.env.FINALLOSS = '1';
    const w = wrapArmed();
    base = w.base; stores = w.stores;
  } else {
    delete process.env.W4DMG; delete process.env.WAVE4ENC; delete process.env.SPAWNSRC; delete process.env.FIELDFINISH; delete process.env.NONWORLDKILL; delete process.env.SEQ51GAP; delete process.env.FINALLOSS;
  }
  const { Game } = await loadGame({ seed, mode: 'finalloss-diag-' + pid, fullTelemetry: false });
  await setupGame(Game);
  if (pid === 'armed') {
    try { installW4dmgDiag(Game, stores.w4dmg); } catch (e) {}
    try { installWave4encDiag(Game, stores.wave); } catch (e) {}
    try { installSpawnsrcDiag(Game, stores.spawn); } catch (e) {}
    try { installFieldfinishDiag(Game, stores.ff); } catch (e) {}
    try { installNonworldkillDiag(Game, stores.nwk); } catch (e) {}
    try { installSeq51gapDiag(Game, stores.gap); } catch (e) {}
    try { installFinallossDiag(Game, stores.fin); } catch (e) {}
  }
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
  const faced = copyFaced(Game);
  const log = copyKillLog(Game);
  const deaths = result.samples.deaths || [];
  const starv = deaths.filter(d => STARV_RE.test(String(d.cause || '')));
  const last = (arr) => (arr && arr.length ? arr[arr.length - 1][1] : null);
  const ts = {};
  if (capturedCtx) for (const k of Object.keys(capturedCtx)) if (k.indexOf('ts') === 0) ts[k] = capturedCtx[k];
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
    ts,
    finalPop: last(result.samples.pop), finalPantry: last(result.samples.pantry),
    finalKnown: last(result.samples.knowledge),
    faced: faced.faced, facedErrs: faced.errs, facedError: faced.error,
    logEntries: log.entries, logErrs: log.errs, logError: log.error,
  };
  if (pid === 'armed') {
    try { snapshotWorldForce(Game, stores.gap); } catch (e) {}
    row.w4dmg = {
      fieldFights: stores.w4dmg.fieldFights, tbEnds: stores.w4dmg.tbEnds,
      diag: { errs: stores.w4dmg.errs, errors: stores.w4dmg.errors, overflow: stores.w4dmg.overflow, installed: stores.w4dmg.installed },
    };
    row.wave4enc = {
      fieldFights: stores.wave.fieldFights,
      diag: { errs: stores.wave.errs, errors: stores.wave.errors, overflow: stores.wave.overflow, installed: stores.wave.installed },
    };
    row.spawnsrc = {
      spawns: stores.spawn.spawns, raids: stores.spawn.raids,
      diag: { errs: stores.spawn.errs, errors: stores.spawn.errors, overflow: stores.spawn.overflow, installed: stores.spawn.installed, seq: stores.spawn.seq },
    };
    row.fieldfinish = {
      fieldFights: stores.ff.fieldFights, tbFights: stores.ff.tbFights,
      diag: { errs: stores.ff.errs, errors: stores.ff.errors, overflow: stores.ff.overflow, installed: stores.ff.installed },
    };
    row.nonworldkill = {
      starts: stores.nwk.starts, ends: stores.nwk.ends,
      diag: { errs: stores.nwk.errs, errors: stores.nwk.errors, overflow: stores.nwk.overflow, installed: stores.nwk.installed },
    };
    row.seq51gap = {
      ticks: stores.gap.ticks,
      diag: { errs: stores.gap.errs, errors: stores.gap.errors, overflow: stores.gap.overflow, installed: stores.gap.installed, lastTickDay: stores.gap.lastTickDay },
    };
    row.finalloss = {
      tbEnds: stores.fin.tbEnds, removals: stores.fin.removals,
      diag: { errs: stores.fin.errs, errors: stores.fin.errors, overflow: stores.fin.overflow, installed: stores.fin.installed,
        tbEndSkipped: stores.fin.tbEndSkipped, tickEpoch: stores.fin.tickEpoch, tickEpochAfter: stores.fin.tickEpochAfter },
    };
  } else {
    row.note = 'snapshot-only: no event lists on the baseline arm';
  }
  if (evidDir) {
    const fn = path.join(evidDir, `s${seed}-${pid}.json`);
    writeFileRetry(fn, JSON.stringify(row, null, 1) + '\n');
    row.corpusFile = fn;
  }
  return row;
}

// ---- final-loss classification (pure over one armed row) ----

function fightSeqMap(row) {
  // fightId -> tileMonster seq (nonworldkill starts) for joining
  // no-origin tbEnd rows to their initiation.
  const m = {};
  for (const s of ((row.nonworldkill && row.nonworldkill.starts) || [])) {
    if (s.fightId && s.tileMonster && s.tileMonster.seq != null) m[s.fightId] = s.tileMonster.seq;
  }
  return m;
}

function verdictTickFor(row, tbEndRow) {
  // The verdict tick is the first tick RECORDED AFTER the tbEnd,
  // not merely the first tick with day >= tbEnd day. On a frozen
  // scholar day the harness can run a second daily phase after
  // that day's tick was already recorded; a tbEnd from that
  // second phase (tickEpoch == that day's epoch-after) must NOT
  // take the already-recorded same-day tick as its verdict tick
  // — that tick predates the fight, and taking it manufactures
  // false F11s (73671 seq51 day 167 in the smoke run: tbEnd
  // tickEpoch 165 == tickEpochAfter[167], with a startCombat
  // lift afterwards and tick 168 also absent). The post-run
  // force tick (source 'postrun') is always recorded after
  // everything, so it is always a valid verdict tick. A missing
  // epoch map falls back to day comparison (in practice every
  // tbEnd day has daily bookkeeping, since the tick and the
  // epoch both come from that day's daily call).
  const ticks = (row.seq51gap && row.seq51gap.ticks) || [];
  const tickEpochAfter = (row.finalloss && row.finalloss.diag && row.finalloss.diag.tickEpochAfter) || {};
  let staleSkipped = 0;
  for (let i = 0; i < ticks.length; i++) {
    const t = ticks[i];
    if (t.day < tbEndRow.day) continue;
    if (t.day > tbEndRow.day) return { tick: t, index: i, staleSkipped: staleSkipped };
    if (t.source === 'postrun') return { tick: t, index: i, staleSkipped: staleSkipped };
    const after = tickEpochAfter[t.day];
    if (after === undefined || tbEndRow.tickEpoch < after) return { tick: t, index: i, staleSkipped: staleSkipped };
    staleSkipped++;
  }
  return null;
}

function tickPresentFor(row, seqKey, verdictTick) {
  if (!verdictTick) return null;
  const ents = verdictTick.tick.entities || [];
  return ents.some(e => (e.seq != null ? e.seq : ('id:' + e.id)) === seqKey);
}

function removerName(rem) {
  // The true caller is the first stack frame AFTER the recorder's
  // own wrapper frame (the finalloss-diag.js line). Reading the
  // fn-name list alone mislabels it: V8 names the wrapper frame
  // 'Game' (from "at Game.removeWorldMonster"), so the old code
  // reported remover 'Game'. Stack lines carry file:line, so the
  // wrapper line is identified exactly and skipped.
  const lines = rem.stackLines || [];
  for (const ln of lines) {
    if (!ln || ln === 'Error') continue;
    if (ln.indexOf('finalloss-diag') >= 0) continue;
    if (ln.indexOf('stackInfo') >= 0) continue;
    const m = ln.match(/at\s+(?:Object\.)?([A-Za-z_$][\w$]*)/);
    if (!m) continue;
    const fn = m[1];
    if (fn === 'Game') {
      const m2 = ln.match(/at\s+(?:Object\.)?[A-Za-z_$][\w$]*\.([A-Za-z_$][\w$]*)/);
      if (m2 && m2[1] !== 'removeWorldMonster') return m2[1];
      continue;
    }
    return fn;
  }
  const skip = new Set(['stackInfo', 'removeWorldMonster', 'Error', 'Game']);
  const names = (rem.stack || '').split(',').map(s => s.trim()).filter(Boolean);
  for (const n of names) if (!skip.has(n)) return n;
  return 'unknown';
}

function predictedRestore(pre) {
  // Mirrors the engine restore code (game.js tbEnd aftermath):
  // lingerer -> min(maxHp, standing[0].hp) floored at 1 (standing
  // empty -> 1 via the ||1 fallback); non-lingerer -> maxHp.
  // Tile: lingerer -> Haven tile; non-lingerer -> origin tile.
  const o = pre.origin;
  if (!o) return null;
  const isLingerer = !!(o.lingering && !o.titan);
  let hp;
  if (isLingerer) {
    const s0 = (pre.standing && pre.standing.length) ? pre.standing[0] : null;
    hp = Math.max(1, Math.min(o.maxHp != null ? o.maxHp : (s0 || 1), s0 != null ? s0 : 1));
  } else {
    hp = (o.maxHp != null) ? o.maxHp : o.hp;
  }
  const tile = isLingerer
    ? (pre.havenTile ? pre.havenTile.slice() : null)
    : [o.tx, o.ty];
  return { hp: hp, tile: tile, isLingerer: isLingerer };
}

function tbEndLeg(pre) {
  // tbEnd-time legs F1/F3/F4/F5 for one origin row (pre snapshot).
  const o = pre.origin;
  if (!o) return { leg: 'F5', detail: 'no worldOrigin at tbEnd' };
  const isLingerer = !!(o.lingering && !o.titan);
  if (isLingerer && !(pre.result === 'fled' || pre.result === 'lost')) {
    return { leg: 'F4', detail: `lingerer with result ${pre.result}: lingererKeeps false by design` };
  }
  if (pre.stillUp === false) {
    return { leg: 'F3', detail: `no live monster fighter of id ${o.id} at tbEnd (mine=${pre.mineCount}, standing=${JSON.stringify(pre.standing)})` };
  }
  if (pre.alreadyPresent) {
    return { leg: 'F2', detail: 'origin object already in world list at tbEnd (push skipped, entity present)' };
  }
  if (pre.originTileOccupant) {
    const occ = pre.originTileOccupant;
    return { leg: 'F1', detail: `origin tile (${o.tx},${o.ty}) occupied at tbEnd by id=${occ.id} seq=${occ.seq} hp=${occ.hp}` };
  }
  return { leg: 'ELIGIBLE', detail: 'eligible and unblocked at tbEnd' };
}

function removalBeforeVerdict(rem, verdictDay, tickEpochAfter) {
  if (rem.day < verdictDay) return { before: true, epochFallback: false };
  if (rem.day > verdictDay) return { before: false, epochFallback: false };
  // Same day as the verdict tick: the tick runs after all daily
  // work, so only removals with an epoch before the tick's
  // epoch-after count. Missing epoch map -> fallback: same-day
  // removals count as before-tick, flagged.
  const after = tickEpochAfter ? tickEpochAfter[verdictDay] : undefined;
  if (after === undefined) return { before: true, epochFallback: true };
  return { before: rem.tickEpoch < after, epochFallback: false };
}

function classifyFinalLoss(row, chain) {
  // chain: {seqKey, seq, id, day, rows} with rows in rowIdx order.
  const finalRow = chain.rows[chain.rows.length - 1];
  const pre = finalRow;
  const post = finalRow.post || {};
  const ticks = (row.seq51gap && row.seq51gap.ticks) || [];
  const vt = verdictTickFor(row, finalRow);
  const verdictDay = vt ? vt.tick.day : null;
  const tickPresent = vt ? tickPresentFor(row, chain.seqKey, vt) : null;
  const tickEpochAfter = (row.finalloss && row.finalloss.diag && row.finalloss.diag.tickEpochAfter) || {};
  const leg = tbEndLeg(pre);
  const pred = predictedRestore(pre);
  const out = {
    seed: row.seed, seqKey: chain.seqKey, seq: chain.seq, id: chain.id, day: finalRow.day,
    fightId: finalRow.fightId, result: finalRow.result, round: finalRow.round,
    chainLength: chain.rows.length,
    chainResults: chain.rows.map(r => r.result),
    chainFightIds: chain.rows.map(r => r.fightId),
    leg: leg.leg, legDetail: leg.detail,
    predicted: pred, postPresent: post.present,
    postHp: post.origin ? post.origin.hp : null, postTile: post.origin ? [post.origin.tx, post.origin.ty] : null,
    titanWarns: post.titanWarns || [],
    verdictTickDay: verdictDay, tickPresent: tickPresent, staleTickSkipped: vt ? vt.staleSkipped : 0,
    verdict: null, verdictDetail: null, mismatch: false, epochFallback: false,
    removal: null, intermediate: null,
  };
  // Intermediate lost rows (chain links, not final losses).
  out.intermediate = chain.rows.slice(0, -1).filter(r => r.result === 'lost').map(r => {
    const l = tbEndLeg(r);
    const p = predictedRestore(r);
    const rp = r.post || {};
    const match = rp.present && p && rp.origin && rp.origin.hp === p.hp
      && rp.origin.tx === p.tile[0] && rp.origin.ty === p.tile[1];
    return { fightId: r.fightId, result: r.result, leg: l.leg, predicted: p,
      postPresent: rp.present, postHp: rp.origin ? rp.origin.hp : null,
      postTile: rp.origin ? [rp.origin.tx, rp.origin.ty] : null,
      restoredExact: match === true };
  });
  if (leg.leg === 'F3') {
    out.verdict = 'EXPECTED-NO-RESTORE (F10)';
    out.verdictDetail = 'F3 final row: no live fighter, restore never runs by design; recorded, counted, never a final-loss failure (prereg F10).';
    return out;
  }
  if (leg.leg === 'F4') {
    out.verdict = 'EXPECTED-NO-RESTORE (F10)';
    out.verdictDetail = 'F4 final row: lingerer with non-kept result, restore never runs by design (prereg F10).';
    return out;
  }
  if (leg.leg === 'F1') {
    out.verdict = 'BLOCKED (F1)';
    out.verdictDetail = leg.detail + (tickPresent === true ? '; NOTE: verdict tick shows the seq present — re-added after the blocked tbEnd by another path (see removal/tbEnd rows after this tbEnd).' : tickPresent === false ? '; verdict tick absent, as expected for a blocked restore.' : '; no verdict tick found.');
    return out;
  }
  // Eligible or F2 at tbEnd: the post snapshot decides.
  if (post.present == null) {
    out.verdict = 'UNEXPLAINED (F12)';
    out.verdictDetail = 'post-tbEnd presence unknown (world-list read failed); full pre snapshot in this record.';
    return out;
  }
  if (post.present) {
    const match = pred && post.origin && post.origin.hp === pred.hp
      && post.origin.tx === pred.tile[0] && post.origin.ty === pred.tile[1];
    if (!match) out.mismatch = true;
    if (tickPresent === true) {
      if (match) {
        out.verdict = 'RESTORED (F6)';
        out.verdictDetail = 'post-tbEnd present at predicted HP/tile and verdict tick present — not a disappearance.';
      } else {
        out.verdict = 'RESTORED-PRESENT-MISMATCH (F13)';
        out.verdictDetail = `post-tbEnd present but predicted hp=${pred ? pred.hp : null} tile=${pred ? JSON.stringify(pred.tile) : null} vs observed hp=${post.origin ? post.origin.hp : null} tile=${JSON.stringify(out.postTile)}; verdict tick present. Prediction model suspect (metric review).`;
      }
      return out;
    }
    if (tickPresent === false) {
      // Disappearance between tbEnd and verdict tick: removal evidence decides.
      const rems = ((row.finalloss && row.finalloss.removals) || []).filter(rem => {
        if (rem.rowIdx <= finalRow.rowIdx) return false;
        const ent = rem.entity || {};
        if (chain.seq != null) return ent.seq === chain.seq;
        return ent.id === chain.id;
      }).map(rem => {
        const b = removalBeforeVerdict(rem, verdictDay, tickEpochAfter);
        return { rem: rem, before: b.before, epochFallback: b.epochFallback };
      });
      const before = rems.filter(r => r.before);
      if (before.length) out.epochFallback = before.some(r => r.epochFallback);
      if (before.length) {
        const chosen = before[before.length - 1].rem;
        const stack = chosen.stack || '';
        const isLift = stack.split(',').map(s => s.trim()).indexOf('startCombat') >= 0;
        // F9 needs NO tbEnd row for this seq afterwards before the tick.
        const fmap = fightSeqMap(row);
        const tbAfter = ((row.finalloss && row.finalloss.tbEnds) || []).filter(t => {
          if (t.rowIdx <= chosen.rowIdx) return false;
          if (t.origin && ((t.origin.seq != null ? t.origin.seq : ('id:' + t.origin.id)) === chain.seqKey)) return true;
          if (t.fightId && fmap[t.fightId] != null && fmap[t.fightId] === chain.seq) return true;
          return false;
        });
        const tbBeforeTick = tbAfter.filter(t => {
          if (t.day < verdictDay) return true;
          if (t.day > verdictDay) return false;
          const after = tickEpochAfter[verdictDay];
          if (after === undefined) return true;
          return t.tickEpoch < after;
        });
        out.removal = { day: chosen.day, rowIdx: chosen.rowIdx, stack: chosen.stack,
          stackLines: chosen.stackLines, remover: removerName(chosen),
          entity: chosen.entity, stillPresent: chosen.stillPresent };
        if (isLift && tbBeforeTick.length === 0) {
          out.verdict = 'LIFTED-WITHOUT-TBEND (F9)';
          out.verdictDetail = `removal day ${chosen.day} stack names startCombat (lift for a new fight) with no tbEnd row for this seq afterwards before the verdict tick; remover=${out.removal.remover}.` + (out.mismatch ? ' Post-tbEnd HP/tile also mismatched prediction (flagged, not the verdict).' : '');
        } else {
          out.verdict = 'REMOVED-AFTERWARDS (F8)';
          out.verdictDetail = `removal day ${chosen.day} stack=${chosen.stack} lines=${JSON.stringify(chosen.stackLines)} remover=${out.removal.remover}.` + (isLift ? ` A tbEnd row for this seq follows the removal before the tick (${tbBeforeTick.map(t => t.fightId + ':' + t.result).join(',')}), so this is F8 not F9.` : '') + (out.mismatch ? ' Post-tbEnd HP/tile also mismatched prediction (flagged, not the verdict).' : '');
        }
        return out;
      }
      // Post present, tick absent, no removal row in between.
      if (match) {
        out.verdict = 'UNOBSERVABLE-REMOVAL (F11)';
        out.verdictDetail = 'post-tbEnd present at predicted HP/tile, verdict tick absent, NO removeWorldMonster row for this seq in between (expected empty: no world-list assignment outside initialization/debug-scenarios).';
      } else {
        out.verdict = 'RESTORED-PRESENT-MISMATCH (F13)';
        out.verdictDetail = `post-tbEnd present but predicted hp=${pred ? pred.hp : null} tile=${pred ? JSON.stringify(pred.tile) : null} vs observed hp=${post.origin ? post.origin.hp : null} tile=${JSON.stringify(out.postTile)}; verdict tick absent with no removal row — mismatch is the recorded anomaly.`;
      }
      return out;
    }
    // tickPresent null: no verdict tick at all.
    out.verdict = 'UNEXPLAINED (F12)';
    out.verdictDetail = 'no verdict tick found (no seq51gap tick on or after the tbEnd day); cannot judge presence at day end.';
    return out;
  }
  // Post absent, eligible (or F2 — F2 post-present would have taken
  // the branch above; F2 post-absent means it left after tbEnd
  // without a restore push, i.e. the same removal analysis as
  // post-present, but the prereg says F2 alone is never a final
  // verdict: fall through to removal evidence with post-absent
  // noted).
  if ((post.titanWarns || []).length > 0) {
    out.verdict = 'THROWN (F7)';
    out.verdictDetail = `post-tbEnd absent despite eligible/unblocked tbEnd AND '[titan] piece restore' warn captured during that exact tbEnd call: ${JSON.stringify(post.titanWarns)}`;
    return out;
  }
  // Post absent with no warn: check removal evidence anyway —
  // a removal row after an absent post is contradictory (nothing
  // to remove) unless the entity was re-added and removed again;
  // report it in the detail but the verdict stays F12 per the
  // prereg (post absent + eligible + no warn = F12).
  out.verdict = 'UNEXPLAINED (F12)';
  out.verdictDetail = 'post-tbEnd absent despite unblocked tbEnd (leg=' + leg.leg + ', F1/F3/F4 negative or F2-present-then-absent) and NO F7 warn captured. Full pre snapshot: origin=' + JSON.stringify(pre.origin)
    + ' originTileOccupant=' + JSON.stringify(pre.originTileOccupant)
    + ' havenTileOccupant=' + JSON.stringify(pre.havenTileOccupant)
    + ' alreadyPresent=' + pre.alreadyPresent + ' standing=' + JSON.stringify(pre.standing)
    + ' predicted=' + JSON.stringify(pred) + '.';
  return out;
}

function buildChains(row) {
  // Chains of origin tbEnd rows, grouped by (seq-or-id, day), in rowIdx order.
  const map = new Map();
  const noOrigin = [];
  for (const t of ((row.finalloss && row.finalloss.tbEnds) || [])) {
    if (!t.origin) { noOrigin.push(t); continue; }
    const seqKey = t.origin.seq != null ? t.origin.seq : ('id:' + t.origin.id);
    const key = seqKey + '@' + t.day;
    if (!map.has(key)) map.set(key, { seqKey: seqKey, seq: t.origin.seq, id: t.origin.id, day: t.day, rows: [] });
    map.get(key).rows.push(t);
  }
  const chains = Array.from(map.values());
  for (const c of chains) c.rows.sort((a, b) => (a.rowIdx || 0) - (b.rowIdx || 0));
  return { chains: chains, noOrigin: noOrigin };
}

function finalLossInstances(row) {
  const { chains, noOrigin } = buildChains(row);
  const finals = [];
  for (const c of chains) {
    const f = c.rows[c.rows.length - 1];
    if (f.result === 'lost') finals.push(classifyFinalLoss(row, c));
  }
  return { finals: finals, chains: chains, noOrigin: noOrigin };
}

function waveOfRow(row, seq) {
  // Wave for a seq from ticks / field rows / starts (best effort).
  for (const t of ((row.seq51gap && row.seq51gap.ticks) || [])) {
    const e = (t.entities || []).find(x => x.seq === seq);
    if (e && e.wave != null) return e.wave;
  }
  for (const f of ((row.w4dmg && row.w4dmg.fieldFights) || [])) if (f.seq === seq) return f.wave;
  for (const s of ((row.nonworldkill && row.nonworldkill.starts) || [])) if (s.tileMonster && s.tileMonster.seq === seq) return s.wave;
  return null;
}

function bandOf(rows, pid) {
  const rs = rows.filter(r => r.policy === pid);
  const wave = (n) => rs.filter(r => (r.waveReach || 1) >= n).length;
  return {
    n: rs.length,
    won: rs.reduce((t, r) => t + r.won, 0),
    medianDays: medianOf(rs.map(r => r.days)),
    maxDays: Math.max.apply(null, rs.map(r => r.days).concat([0])),
    nationalEver: rs.reduce((t, r) => t + r.nationalEver, 0),
    nationalFinal: rs.reduce((t, r) => t + r.nationalFinal, 0),
    table: rs.reduce((t, r) => t + r.table, 0),
    entered: rs.reduce((t, r) => t + r.entered, 0),
    wave3: wave(3), wave4: wave(4), wave5: wave(5),
    maxArc: Math.max.apply(null, rs.map(r => r.maxArc).concat([1])),
    starvationTotal: rs.reduce((t, r) => t + r.starvationDeaths, 0),
    deathTotal: rs.reduce((t, r) => t + r.deathTotal, 0),
  };
}

function diffBand(band, ref) {
  return {
    wins: band.won - ref.wins, nationalEver: band.nationalEver - ref.nationalEver,
    nationalFinal: band.nationalFinal - ref.nationalFinal, table: band.table - ref.table,
    entered: band.entered - ref.entered,
    wave4: band.wave4 - ref.wave4, wave5: band.wave5 - ref.wave5,
    medianDays: band.medianDays - ref.medianDays, deaths: band.deathTotal - ref.deaths,
    starvation: band.starvationTotal - ref.starvation,
  };
}

async function summaryMode() {
  const evidDir = evidDirOf();
  const rows = [];
  for (const seed of SEEDS) {
    for (const pid of ['baseline', 'armed']) {
      const p = path.join(evidDir, `s${seed}-${pid}.json`);
      rows.push(JSON.parse(fs.readFileSync(p, 'utf8')));
    }
  }
  let detgate = null;
  try { detgate = JSON.parse(fs.readFileSync(path.join(evidDir, 'detgate.json'), 'utf8')); } catch (e) { detgate = null; }
  const perSeed = [];
  let allFinals = [];
  for (const seed of SEEDS) {
    const armed = rows.find(r => r.policy === 'armed' && r.seed === seed);
    const fl = finalLossInstances(armed);
    const verdictCounts = {};
    for (const f of fl.finals) verdictCounts[f.verdict] = (verdictCounts[f.verdict] || 0) + 1;
    const w4field = (armed.w4dmg.fieldFights || []).filter(f => (f.wave | 0) === 4);
    const wvfield = (armed.wave4enc.fieldFights || []).filter(f => (f.wave | 0) === 4);
    const diagErrs = (armed.w4dmg.diag.errs | 0) + (armed.wave4enc.diag.errs | 0) + (armed.spawnsrc.diag.errs | 0) + (armed.fieldfinish.diag.errs | 0) + (armed.nonworldkill.diag.errs | 0) + (armed.seq51gap.diag.errs | 0) + (armed.finalloss.diag.errs | 0);
    const overflowN = (armed.w4dmg.diag.overflow.fieldFights | 0) + (armed.w4dmg.diag.overflow.tbEnds | 0) + (armed.wave4enc.diag.overflow.fieldFights | 0) + (armed.fieldfinish.diag.overflow.fieldFights | 0) + (armed.fieldfinish.diag.overflow.tbFights | 0) + (armed.nonworldkill.diag.overflow.starts | 0) + (armed.nonworldkill.diag.overflow.ends | 0) + (armed.seq51gap.diag.overflow | 0) + (armed.finalloss.diag.overflow.tbEnds | 0) + (armed.finalloss.diag.overflow.removals | 0);
    const sumFail = w4field.filter(f => ((f.volleyDmg | 0) + (f.allyDmg | 0) + (f.closeInDmg | 0)) !== (f.totalDmg | 0)).length;
    const inits4 = (armed.nonworldkill.starts || []).filter(s => { const c = classifyStart(s); return !c.excluded && (s.wave | 0) === 4; });
    const endIds = new Set((armed.w4dmg.tbEnds || []).map(e => e.fightId).filter(Boolean));
    const unjoined = inits4.filter(s => !s.fightId || !endIds.has(s.fightId)).map(s => ({ day: s.day, mid: s.mid, fightId: s.fightId }));
    // Cross-check (e): finalloss tbEnd rows with a fightId join to a
    // nonworldkill start or a w4dmg tbEnd.
    const startIds = new Set((armed.nonworldkill.starts || []).map(s => s.fightId).filter(Boolean));
    const finUnjoined = ((armed.finalloss && armed.finalloss.tbEnds) || []).filter(t => t.fightId && !startIds.has(t.fightId) && !endIds.has(t.fightId))
      .map(t => ({ day: t.day, fightId: t.fightId, result: t.result, originSeq: t.origin ? t.origin.seq : null }));
    const w4kills = (armed.logEntries || []).filter(e => (e.w | 0) === 4).length;
    const tickDays = (armed.seq51gap.ticks || []).map(t => t.day);
    const tickGaps = [], tickDupDays = [];
    for (let i = 1; i < tickDays.length; i++) {
      if (tickDays[i] > tickDays[i - 1] + 1) { const miss = []; for (let d = tickDays[i - 1] + 1; d < tickDays[i]; d++) miss.push(d); tickGaps.push({ from: tickDays[i - 1], to: tickDays[i], missing: miss }); }
      else if (tickDays[i] === tickDays[i - 1]) tickDupDays.push(tickDays[i]);
    }
    const finalsWithWave = fl.finals.map(f => Object.assign({}, f, { wave: waveOfRow(armed, f.seq) }));
    allFinals = allFinals.concat(finalsWithWave.map(f => Object.assign({}, f, { seed: seed })));
    perSeed.push({
      seed,
      field4: w4field.length, waveField4: wvfield.length,
      fieldCountMatch: w4field.length === wvfield.length,
      tbInits4: inits4.length, tbUnjoined: unjoined,
      finUnjoined: finUnjoined,
      diagErrs, overflowN, sumFail,
      finTbEnds: (armed.finalloss.tbEnds || []).length,
      finRemovals: (armed.finalloss.removals || []).length,
      finNoOrigin: fl.noOrigin.length,
      chains: fl.chains.length,
      finals: finalsWithWave, verdictCounts: verdictCounts,
      w4kills, tickGaps, tickDupDays,
    });
  }
  const g2 = [];
  for (const seed of SEEDS) {
    const c = rows.find(r => r.policy === 'baseline' && r.seed === seed);
    const a = rows.find(r => r.policy === 'armed' && r.seed === seed);
    const ok = !!c && !!a && c.days === a.days && c.gameDays === a.gameDays
      && JSON.stringify(c.ts) === JSON.stringify(a.ts) && c.starvationDeaths === a.starvationDeaths;
    const facedOk = !!c && !!a && JSON.stringify(c.faced) === JSON.stringify(a.faced);
    const killsOk = !!c && !!a && JSON.stringify((c.logEntries || []).map(e => [e.d, e.mid, e.w, e.by, e.via])) === JSON.stringify((a.logEntries || []).map(e => [e.d, e.mid, e.w, e.by, e.via]));
    g2.push({ seed, ok, facedOk, killsOk, cDays: c ? c.days : null, aDays: a ? a.days : null, cGameDays: c ? c.gameDays : null, aGameDays: a ? a.gameDays : null });
  }
  const g2Pass = g2.every(x => x.ok);
  const corpusOk = rows.length === SEEDS.length * 2 && rows.every(r => r.days > 0 && r.faced && r.logEntries)
    && rows.filter(r => r.policy === 'armed').every(r => Array.isArray(r.w4dmg.fieldFights) && Array.isArray(r.w4dmg.tbEnds) && Array.isArray(r.seq51gap.ticks) && r.seq51gap.ticks.length > 0 && Array.isArray(r.finalloss.tbEnds));
  const baselineBand = bandOf(rows, 'baseline');
  const armedBand = bandOf(rows, 'armed');
  const diff1920 = diffBand(baselineBand, BAND1920);
  const diff0525 = diffBand(baselineBand, BAND0525);
  const rebaselineExact1920 = Object.keys(diff1920).every(k => diff1920[k] === 0);
  const rebaselineExact0525 = Object.keys(diff0525).every(k => diff0525[k] === 0);
  const costBar = {
    starvationOk: armedBand.starvationTotal <= baselineBand.starvationTotal + 2,
    medianOk: armedBand.medianDays >= 0.8 * baselineBand.medianDays,
  };
  // Known-instance re-derivation: seq51/73672 day 148 (influencer,
  // maxHp 850) and seq45/73673 day 112 (algorithm, maxHp 1000).
  // Identity is (seed, day, origin maxHp); seq numbers are
  // reported, not assumed — base movement may have renumbered
  // spawns.
  function findKnown2(seed, day, maxHp) {
    const armed = rows.find(r => r.policy === 'armed' && r.seed === seed);
    if (!armed) return [];
    const fl = finalLossInstances(armed);
    return fl.finals.filter(f => {
      if (f.day !== day) return false;
      const chain = fl.chains.find(c => c.day === day && c.rows[c.rows.length - 1].fightId === f.fightId);
      return chain && chain.rows[chain.rows.length - 1].origin && chain.rows[chain.rows.length - 1].origin.maxHp === maxHp;
    });
  }
  const known51 = findKnown2(73672, 148, 850);
  const known45 = findKnown2(73673, 112, 1000);
  const known = {
    seq51: { seed: 73672, day: 148, maxHp: 850, found: known51 },
    seq45: { seed: 73673, day: 112, maxHp: 1000, found: known45 },
  };
  const knownOk = known51.length >= 1 && known51.every(f => !!f.verdict) && known45.length >= 1 && known45.every(f => !!f.verdict);
  const allClassified = allFinals.every(f => !!f.verdict);
  const detPass = !!(detgate && detgate.pass);
  const verdict = (allClassified && knownOk && g2Pass && detPass
    && perSeed.every(p => p.diagErrs === 0 && p.overflowN === 0)) ? 'DIAG-GO' : 'DIAG-NO-GO';
  const verdictDetail = verdict === 'DIAG-GO' ? 'all-final-loss-classified+known-rederived+gates-pass'
    : ('allClassified=' + allClassified + ' knownOk=' + knownOk + ' g2Pass=' + g2Pass + ' detPass=' + detPass);
  const report = {
    label: 'sim-finalloss-adopt-a', seeds: SEEDS, days: 180, perSeed: perSeed,
    gates: { g2RecorderNeutrality: g2, g2Pass: g2Pass, corpusOk: corpusOk,
      rebaselineExact1920: rebaselineExact1920, diffVs1920: diff1920,
      rebaselineExact0525: rebaselineExact0525, diffVs0525: diff0525,
      costBar: costBar, detgate: detgate, detPass: detPass },
    baselineBand: baselineBand, armedBand: armedBand, band1920: BAND1920, band0525: BAND0525,
    known: known, knownOk: knownOk, allClassified: allClassified,
    allFinals: allFinals,
    verdict: verdict, verdictDetail: verdictDetail,
    verdictRule: 'DIAG-GO iff every FINAL-LOSS INSTANCE is classified into exactly one verdict (RESTORED / BLOCKED / THROWN / REMOVED-AFTERWARDS / UNOBSERVABLE-REMOVAL / UNEXPLAINED / RESTORED-PRESENT-MISMATCH / EXPECTED-NO-RESTORE-F10), BOTH known instances are re-derived and classified from this corpus, G2 neutrality holds, G1 det-gate passes, and recorder errors/overflow are zero. An honest F11/F12 remainder still counts as classified only with its full pre snapshot reported and no instance dropped.',
    generated: new Date().toISOString(),
  };
  const summaryPath = path.join(evidDir, 'summary.json');
  writeFileRetry(summaryPath, JSON.stringify(report, null, 1) + '\n');
  console.log('\n=== sim-finalloss-adopt-a ===');
  console.log(`  baseline: n=${baselineBand.n} won=${baselineBand.won} medD=${baselineBand.medianDays} natEver=${baselineBand.nationalEver} natFinal=${baselineBand.nationalFinal} table=${baselineBand.table} entered=${baselineBand.entered} wave4=${baselineBand.wave4} wave5=${baselineBand.wave5} starv=${baselineBand.starvationTotal} deaths=${baselineBand.deathTotal}`);
  console.log(`  armed:    n=${armedBand.n} won=${armedBand.won} medD=${armedBand.medianDays} natEver=${armedBand.nationalEver} natFinal=${armedBand.nationalFinal} table=${armedBand.table} entered=${armedBand.entered} wave4=${armedBand.wave4} wave5=${armedBand.wave5} starv=${armedBand.starvationTotal} deaths=${armedBand.deathTotal}`);
  console.log(`  rebaseline vs 1920Z: ${rebaselineExact1920 ? 'EXACT' : 'DIFF ' + JSON.stringify(diff1920)}`);
  console.log(`  rebaseline vs 0525Z: ${rebaselineExact0525 ? 'EXACT' : 'DIFF ' + JSON.stringify(diff0525)}`);
  console.log(`  G2 recorder neutrality: ${g2Pass ? 'PASS' : 'FAIL'} (${g2.filter(x => x.ok).length}/${g2.length}; faced ${g2.filter(x => x.facedOk).length}/${g2.length}, kills ${g2.filter(x => x.killsOk).length}/${g2.length})`);
  console.log(`  detgate: ${detPass ? 'PASS' : 'FAIL'} (${detgate ? JSON.stringify(detgate) : 'no detgate.json'})`);
  console.log(`  corpus: ${corpusOk ? 'PASS' : 'FAIL'}; costBar starvationOk=${costBar.starvationOk} medianOk=${costBar.medianOk}`);
  for (const p of perSeed) {
    console.log(`  seed ${p.seed}: field4=${p.field4} waveField4=${p.waveField4} match=${p.fieldCountMatch} tbInits4=${p.tbInits4} unjoined=${p.tbUnjoined.length} finUnjoined=${p.finUnjoined.length} diagErrs=${p.diagErrs} overflow=${p.overflowN} sumFail=${p.sumFail} finTbEnds=${p.finTbEnds} finRemovals=${p.finRemovals} finNoOrigin=${p.finNoOrigin} chains=${p.chains} finals=${p.finals.length} verdicts=${JSON.stringify(p.verdictCounts)} w4kills=${p.w4kills}`);
  }
  console.log(`  KNOWN 73672 d148 maxHp850: found=${known51.length} verdicts=${known51.map(f => f.verdict).join('|')}`);
  console.log(`  KNOWN 73673 d112 maxHp1000: found=${known45.length} verdicts=${known45.map(f => f.verdict).join('|')}`);
  console.log(`  ALL FINALS (${allFinals.length}):`);
  for (const f of allFinals) console.log(`    seed ${f.seed} seq=${f.seq} id=${f.id} d${f.day} fight=${f.fightId} chain=${f.chainLength} results=${f.chainResults.join(',')} leg=${f.leg} verdict=${f.verdict} tickDay=${f.verdictTickDay} tickPresent=${f.tickPresent} postPresent=${f.postPresent} pred=${f.predicted ? f.predicted.hp + '@' + JSON.stringify(f.predicted.tile) : null} post=${f.postHp}@${JSON.stringify(f.postTile)}`);
  console.log(`  VERDICT ${verdict} (${verdictDetail}) -> ${summaryPath}`);
  if (!g2Pass || !corpusOk) { console.error('PROOF GATE FAILURE'); process.exit(1); }
}

async function sweepMode() {
  const evidDir = evidDirOf();
  fs.mkdirSync(evidDir, { recursive: true });
  // Det-gate first (its result is read by --summary). Retry the
  // whole det-gate up to 3 times: a flap-window failure must not
  // silently void the G1 gate record.
  console.log('--- detgate ---');
  let detOk = false;
  for (let attempt = 1; attempt <= 3 && !detOk; attempt++) {
    try {
      const out = execFileSync('node', [path.join(REPO, 'scripts', 'test-finalloss-adopt-a-sweep.js'), '--detgate'],
        { cwd: REPO, encoding: 'utf8', timeout: 1200000, env: Object.assign({}, process.env, { EVID: evidDir }) });
      process.stdout.write(out);
      detOk = true;
    } catch (e) {
      process.stdout.write((e.stdout || '') + (e.stderr || ''));
      console.error(`DETGATE attempt ${attempt} FAILED — ${attempt < 3 ? 'retrying' : 'continuing to sweep so the corpus still records the failure mode'}`);
    }
  }
  const pids = (process.env.PIDS || 'baseline,armed').split(',').map(s => s.trim()).filter(Boolean);
  for (const pid of pids) {
    for (const seed of SEEDS) {
      console.log(`--- ${pid} seed ${seed} ---`);
      let done = false;
      for (let attempt = 1; attempt <= 3 && !done; attempt++) {
        try {
          const out = execFileSync('node', [path.join(REPO, 'scripts', 'test-finalloss-adopt-a-sweep.js'), '--one', pid, String(seed)],
            { cwd: REPO, encoding: 'utf8', timeout: 1200000, env: Object.assign({}, process.env, { EVID: evidDir }) });
          process.stdout.write(out);
          done = true;
        } catch (e) {
          process.stdout.write((e.stdout || '') + (e.stderr || ''));
          console.error(`SEED ${pid} ${seed} attempt ${attempt} FAILED`);
          if (attempt === 3) throw e;
        }
      }
    }
  }
  await summaryMode();
}

async function oneMode(pid, seedArg) {
  const seed = parseInt(seedArg, 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const evidDir = evidDirOf();
  fs.mkdirSync(evidDir, { recursive: true });
  const row = await runOne(pid, seed, days, evidDir);
  let line = `days=${row.days} gameDays=${row.gameDays} end=${row.endReason} wave=${row.waveReach} arc=${row.maxArc} finalRank=${row.finalRank} natEver=${row.nationalEver} natFinal=${row.nationalFinal} table=${row.table} entered=${row.entered} won=${row.won} starv=${row.starvationDeaths} deaths=${row.deathTotal}`;
  if (pid === 'armed') {
    const fl = finalLossInstances(row);
    line += ` ticks=${row.seq51gap.ticks.length} finTbEnds=${row.finalloss.tbEnds.length} finRemovals=${row.finalloss.removals.length} chains=${fl.chains.length} finals=${fl.finals.length} verdicts=${JSON.stringify(fl.finals.reduce((m, f) => { m[f.verdict] = (m[f.verdict] || 0) + 1; return m; }, {}))}`;
  }
  console.log(`  [${pid} seed ${seed}] ${line}`);
}

async function detgateMode() {
  const seed = parseInt(process.env.SEED || '73671', 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const evidDir = evidDirOf();
  fs.mkdirSync(evidDir, { recursive: true });
  const c = await runOne('baseline', seed, days, null);
  delete process.env.W4DMG; delete process.env.WAVE4ENC; delete process.env.SPAWNSRC; delete process.env.FIELDFINISH; delete process.env.NONWORLDKILL; delete process.env.SEQ51GAP; delete process.env.FINALLOSS;
  process.env.LEANLINKRESCUE = '1'; process.env.TABLESEATNOWAIT = '1';
  const w = wrapArmed();
  const wrapped = w.base; const stores = w.stores;
  const { Game } = await loadGame({ seed, mode: 'finalloss-diag-detgate', fullTelemetry: false });
  await setupGame(Game);
  let capturedCtx = null;
  const policy = Object.assign({}, wrapped, {
    daily(G, ctx) {
      if (!capturedCtx) capturedCtx = ctx;
      try { return wrapped.daily(G, ctx); } catch (e) {}
    },
  });
  const result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 10 });
  const ts = {};
  if (capturedCtx) for (const k of Object.keys(capturedCtx)) if (k.indexOf('ts') === 0) ts[k] = capturedCtx[k];
  const hasDiagSurface = !!(capturedCtx && (capturedCtx._w4dmg || capturedCtx._wave4enc || capturedCtx._spawnsrc || capturedCtx._fieldfinishdiag || capturedCtx._nonworldkill || capturedCtx._seq51gap || capturedCtx._finalloss));
  const wrapsInstalled = !!Game._w4dmgDiagInstalled || !!Game._wave4encDiagInstalled || !!Game._spawnsrcDiagInstalled || !!Game._fieldfinishDiagInstalled || !!Game._nonworldkillDiagInstalled || !!Game._seq51gapDiagInstalled || !!Game._finallossDiagInstalled;
  const finRows = stores.fin.tbEnds.length + stores.fin.removals.length;
  const gapTicks = stores.gap.ticks.length;
  const ok = c.days === result.days && c.gameDays === result.gameDays
    && JSON.stringify(ts) === JSON.stringify(c.ts) && !hasDiagSurface && !wrapsInstalled && gapTicks === 0 && finRows === 0;
  const det = { seed: seed, pass: ok, baselineDays: c.days, baselineGameDays: c.gameDays, wrappedDays: result.days, wrappedGameDays: result.gameDays,
    tsEqual: JSON.stringify(ts) === JSON.stringify(c.ts), diagSurface: hasDiagSurface, wrapsInstalled: wrapsInstalled, gapTicks: gapTicks, finRows: finRows };
  writeFileRetry(path.join(evidDir, 'detgate.json'), JSON.stringify(det, null, 1) + '\n');
  console.log(`DETGATE seed=${seed} baseline days=${c.days} gameDays=${c.gameDays} ts=${JSON.stringify(c.ts)} | wrapped(recorders OFF) days=${result.days} gameDays=${result.gameDays} ts=${JSON.stringify(ts)} diagSurface=${hasDiagSurface} wrapsInstalled=${wrapsInstalled} gapTicks=${gapTicks} finRows=${finRows} -> ${ok ? 'PASS' : 'FAIL'}`);
  if (!ok) process.exit(1);
}

async function detailMode(seedArg) {
  const seed = parseInt(process.env.DETAIL_SEED || seedArg || '73672', 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const evidDir = evidDirOf();
  let census = null;
  try { census = JSON.parse(fs.readFileSync(path.join(evidDir, `s${seed}-armed.json`), 'utf8')); } catch (e) { census = null; }
  const row = await runOne('armed', seed, days, null);
  const a = finalLossInstances(row);
  const same = !!census && census.days === row.days && census.gameDays === row.gameDays
    && JSON.stringify(census.ts) === JSON.stringify(row.ts)
    && JSON.stringify(finalLossInstances(census).finals.map(f => f.verdict)) === JSON.stringify(a.finals.map(f => f.verdict));
  console.log(`DETAIL-REPRO seed=${seed} days=${row.days} gameDays=${row.gameDays} censusMatch=${same} finals=${a.finals.length} verdicts=${JSON.stringify(a.finals.map(f => f.verdict))}`);
  if (!same) { console.error('DETAIL REPRODUCTION FAILURE'); process.exit(1); }
  console.log('DETAIL finals:');
  for (const f of a.finals) console.log(`DETAIL final seed=${seed} seq=${f.seq} id=${f.id} d${f.day} fight=${f.fightId} chain=${f.chainLength} leg=${f.leg} verdict=${f.verdict} :: ${f.verdictDetail}`);
}

async function senseMode(seedArg) {
  const seed = parseInt(process.env.SENSE_SEED || seedArg || '73672', 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const out = process.env.SENSE_OUT || path.join(REPO, 'evidence', '2026-10-27', `sim-finalloss-adopt-a-sense-${seed}.txt`);
  process.env.LEANLINKRESCUE = '1'; process.env.TABLESEATNOWAIT = '1';
  process.env.W4DMG = '1'; process.env.WAVE4ENC = '1'; process.env.SPAWNSRC = '1'; process.env.FIELDFINISH = '1'; process.env.NONWORLDKILL = '1'; process.env.SEQ51GAP = '1'; process.env.FINALLOSS = '1';
  const w = wrapArmed();
  const armed = w.base; const stores = w.stores;
  const { Game } = await loadGame({ seed, mode: 'finalloss-diag-sense', fullTelemetry: false, narration: true });
  const t = {};
  const uninstall = PI.install(Game, t);
  await setupGame(Game);
  try { installW4dmgDiag(Game, stores.w4dmg); } catch (e) {}
  try { installWave4encDiag(Game, stores.wave); } catch (e) {}
  try { installSpawnsrcDiag(Game, stores.spawn); } catch (e) {}
  try { installFieldfinishDiag(Game, stores.ff); } catch (e) {}
  try { installNonworldkillDiag(Game, stores.nwk); } catch (e) {}
  try { installSeq51gapDiag(Game, stores.gap); } catch (e) {}
  try { installFinallossDiag(Game, stores.fin); } catch (e) {}
  let result;
  await quietLog(async () => { result = await runDays(Game, armed, { days, manifest: undefined, sampleEvery: 30 }); });
  try { uninstall(); } catch (e) {}
  const ring = t.sayRing || [];
  let pg = {};
  try { pg = Game.progState ? Game.progState() : {}; } catch (e) {}
  let dmgLine = 'finalloss: unavailable';
  try {
    const fl = finalLossInstances({ seed: seed, finalloss: { tbEnds: stores.fin.tbEnds, removals: stores.fin.removals, diag: { tickEpochAfter: stores.fin.tickEpochAfter } }, seq51gap: { ticks: stores.gap.ticks }, nonworldkill: { starts: stores.nwk.starts } });
    dmgLine = `finalloss (SENSE-ONLY, non-measured): chains=${fl.chains.length} finals=${fl.finals.length} verdicts=${JSON.stringify(fl.finals.map(f => f.verdict))}`;
  } catch (e) { dmgLine = 'finalloss error: ' + String((e && e.message) || e).slice(0, 160); }
  const header = [
    'SENSE-ONLY REPLAY — NON-MEASURED (narration shifts trajectories; never enters the census)',
    `seed=${seed} policy=tableseat-nowait+finalloss-diag days=${result.days} gameDays=${result.gameDays} endReason=${result.endReason} maxWave=${result.maxWaveUnlocked} sayLive=${!!t.sayLive} ringLines=${ring.length} tableWaiting=${!!pg.tableWaiting} tableDone=${!!pg.tableDone}`,
    dmgLine,
    '',
  ].join('\n');
  const body = header + ring.map(s => `[d${s.day}] ${s.text}`).join('\n') + '\n';
  writeFileRetry(out, body);
  console.log(`SENSE-DONE seed=${seed} end=${result.endReason} ring=${ring.length} tableWaiting=${!!pg.tableWaiting} tableDone=${!!pg.tableDone} -> ${out}`);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--one')) return oneMode(args[args.indexOf('--one') + 1], args[args.indexOf('--one') + 2]);
  if (args.includes('--summary')) return summaryMode();
  if (args.includes('--detgate')) return detgateMode();
  if (args.includes('--detail')) return detailMode(args[args.indexOf('--detail') + 1]);
  if (args.includes('--sense')) return senseMode(args[args.indexOf('--sense') + 1]);
  return sweepMode();
}
if (require.main === module) main().catch(e => { console.error('FINALLOSS-DIAG SWEEP FAILED:', (e && e.stack) || e); process.exit(1); });
module.exports = { runOne, wrapArmed, finalLossInstances, buildChains, classifyFinalLoss, tbEndLeg, predictedRestore, verdictTickFor, bandOf, BAND1920, BAND0525, SEEDS };
