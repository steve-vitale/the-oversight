#!/usr/bin/env node
// scripts/test-w4dmg-diag-sweep.js — sim-w4dmg-a sweep
// (scale-onramp axis, 2026-10-26, arm sim-w4dmg-a. DIAG /
// MEASUREMENT ONLY, zero src/js changes.)
//
// Substrate: tableseat-nowait (LEANLINKRESCUE=1, TABLESEATNOWAIT=1),
// seeds 73671-73678, 180d death-aware horizon. One process per seed
// (default mode spawns --one children; every row is written
// incrementally).
//
// Baseline: plain tableseat-nowait, post-run pure-read snapshot.
// Armed: tableseat-nowait wrapped with five observational recorders
// (innermost first): w4dmg-diag (NEW: per-fight damage decomposition,
// field + tbEnd), wave4enc-diag, spawnsrc-diag, fieldfinish-diag,
// nonworldkill-diag (all verbatim reuses). All record after
// delegating (tbEnd pre-captures state the engine destroys), draw
// no RNG, never throw into the engine.
//
// Modes: --one <pid> <seed> | (default sweep) | --summary |
// --detgate | --detail <seed> | --sense <seed>. See the evidence
// pre-registration in evidence/2026-10-26/sim-w4dmg-a.md for the
// schema, limiter rules, and DIAG-GO bar.
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
const PI = require('./postunlock-instrument');

const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
const STARV_RE = /starv|hunger/i;
const SEEDS = (process.env.SEEDS || '73671,73672,73673,73674,73675,73676,73677,73678')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
// 1920Z band table (the re-baseline judge, from sim-wave4enc-a.md).
const BAND1920 = { wins: 2, nationalEver: 6, nationalFinal: 5, table: 4, entered: 2, wave4: 6, wave5: 0, medianDays: 152, deaths: 307, starvation: 1 };

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
function evidDirOf() { return process.env.EVID || path.join(REPO, 'evidence', '2026-10-26', 'perseed-w4dmg-a'); }
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

async function runOne(pid, seed, days, evidDir) {
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  let w4dmgStore = null, waveStore = null, spawnStore = null, ffStore = null, nwkStore = null;
  let base = tableseatNowait;
  if (pid === 'armed') {
    process.env.W4DMG = '1'; process.env.WAVE4ENC = '1'; process.env.SPAWNSRC = '1'; process.env.FIELDFINISH = '1'; process.env.NONWORLDKILL = '1';
    w4dmgStore = newW4dmgStore(); waveStore = newWaveStore(); spawnStore = newSpawnStore(); ffStore = newFFStore(); nwkStore = newNwkStore();
    base = withNonworldkillDiag(
      withFieldfinishDiag(
        withSpawnsrcDiag(
          withWave4encDiag(
            withW4dmgDiag(tableseatNowait, 'w4dmg-diag', 'tableseat-nowait + wave-4 damage decomposition recorder', w4dmgStore),
            'wave4enc-diag', 'tableseat-nowait + wave-4 field spawn-link recorder', waveStore),
          'spawnsrc-diag', 'tableseat-nowait + spawn-source census', spawnStore),
        'fieldfinish-diag', 'tableseat-nowait + wounded field-finish recorder', ffStore),
      'nonworldkill-diag', 'tableseat-nowait + TB initiation census', nwkStore);
  } else {
    delete process.env.W4DMG; delete process.env.WAVE4ENC; delete process.env.SPAWNSRC; delete process.env.FIELDFINISH; delete process.env.NONWORLDKILL;
  }
  const { Game } = await loadGame({ seed, mode: 'w4dmg-diag-' + pid, fullTelemetry: false });
  await setupGame(Game);
  if (pid === 'armed') {
    try { installW4dmgDiag(Game, w4dmgStore); } catch (e) {}
    try { installWave4encDiag(Game, waveStore); } catch (e) {}
    try { installSpawnsrcDiag(Game, spawnStore); } catch (e) {}
    try { installFieldfinishDiag(Game, ffStore); } catch (e) {}
    try { installNonworldkillDiag(Game, nwkStore); } catch (e) {}
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
    row.w4dmg = {
      fieldFights: w4dmgStore.fieldFights, tbEnds: w4dmgStore.tbEnds,
      diag: { errs: w4dmgStore.errs, errors: w4dmgStore.errors, overflow: w4dmgStore.overflow, installed: w4dmgStore.installed },
    };
    row.wave4enc = {
      fieldFights: waveStore.fieldFights,
      diag: { errs: waveStore.errs, errors: waveStore.errors, overflow: waveStore.overflow, installed: waveStore.installed },
    };
    row.spawnsrc = {
      spawns: spawnStore.spawns, raids: spawnStore.raids,
      diag: { errs: spawnStore.errs, errors: spawnStore.errors, overflow: spawnStore.overflow, installed: spawnStore.installed, seq: spawnStore.seq },
    };
    row.fieldfinish = {
      fieldFights: ffStore.fieldFights, tbFights: ffStore.tbFights,
      diag: { errs: ffStore.errs, errors: ffStore.errors, overflow: ffStore.overflow, installed: ffStore.installed },
    };
    row.nonworldkill = {
      starts: nwkStore.starts, ends: nwkStore.ends,
      diag: { errs: nwkStore.errs, errors: nwkStore.errors, overflow: nwkStore.overflow, installed: nwkStore.installed },
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

// classifySeed(row): the pre-registered damage decomposition over one
// armed row. Field limiter: ZERO-HIT (total 0) else DPS-TOO-LOW
// (rounds-to-kill at observed DPS > 15, DPS = total/max(rounds,1))
// else TRUNCATED. Tb limiter: UNENDED (no tbEnd row) else
// UNMEASURED-END-MISSING (monster fighter absent at tbEnd) else
// DPS-TOO-LOW (net < 10% of start HP) else TRUNCATED.
function classifySeed(row) {
  const field4 = (row.w4dmg.fieldFights || []).filter(f => (f.wave | 0) === 4);
  const waveField4 = (row.wave4enc.fieldFights || []).filter(f => (f.wave | 0) === 4);
  // Prior-seq wound links: previous fight of the same seq, in day order.
  const bySeq = {};
  const fieldRows = field4.map(f => {
    const total = f.totalDmg | 0, volley = f.volleyDmg | 0, ally = f.allyDmg | 0, closeIn = f.closeInDmg | 0;
    const sumOk = (volley + ally + closeIn) === total;
    const rounds = f.rounds | 0;
    const dps = total / Math.max(rounds, 1);
    const rtk = (f.startHp != null && dps > 0) ? Math.ceil(f.startHp / dps) : null;
    let limiter;
    if (total === 0) limiter = 'ZERO-HIT';
    else if (rtk != null && rtk > 15) limiter = 'DPS-TOO-LOW';
    else limiter = 'TRUNCATED';
    let prev = null, prevMatch = null;
    if (f.seq != null) {
      const arr = bySeq[f.seq] || [];
      if (arr.length) { prev = arr[arr.length - 1]; prevMatch = (prev.endHp != null && f.startHp != null) ? (prev.endHp === f.startHp) : null; }
      arr.push(f); bySeq[f.seq] = arr;
    }
    return {
      day: f.day, vid: f.vid, mid: f.mid, seq: f.seq,
      startHp: f.startHp, startMax: f.startMax, woundsIn: f.woundsIn,
      prevFightDay: prev ? prev.day : null, prevEndHp: prev ? prev.endHp : null, prevMatch: prevMatch,
      endHp: f.endHp, totalDmg: total, volleyDmg: volley, allyDmg: ally, closeInDmg: closeIn,
      sumOk: sumOk, vHpEntry: f.vHpEntry, vHpLeft: f.vHpLeft, vTaken: f.vTaken,
      rounds: rounds, dps: Math.round(dps * 100) / 100, roundsToKill: rtk,
      outcome: f.outcome, intent: f.intent, calledHelp: f.calledHelp, allyVid: f.allyVid,
      optsAllies: f.optsAllies, packCount: f.packCount,
      mDmgRange: f.mDmgRange, mPierce: f.mPierce, mSpeed: f.mSpeed, mPack: f.mPack, mHpRange: f.mHpRange,
      wbMelee: f.wbMelee, wbRanged: f.wbRanged, armorP: f.armorP,
      abilitiesHeld: f.abilitiesHeld, personFound: f.personFound,
      limiter: limiter,
    };
  });
  const fieldLimiters = {};
  for (const r of fieldRows) fieldLimiters[r.limiter] = (fieldLimiters[r.limiter] || 0) + 1;
  // Tb join: nonworldkill initiations (wave 4) joined to w4dmg tbEnds.
  const classifiedStarts = (row.nonworldkill.starts || []).map(s => ({ start: s, cls: classifyStart(s) }));
  const initiations = classifiedStarts.filter(c => !c.cls.excluded);
  const inits4 = initiations.filter(c => ((c.start.wave | 0) === 4));
  const endByFightId = {};
  for (const e of (row.w4dmg.tbEnds || [])) if (e.fightId) endByFightId[e.fightId] = e;
  const nwkEndByFightId = {};
  for (const e of (row.nonworldkill.ends || [])) if (e.fightId) nwkEndByFightId[e.fightId] = e;
  const tbRows = [];
  const tbUnjoined = [];
  for (const c of inits4) {
    const s = c.start;
    // CORRECTION (pre-judgment, disclosed in the evidence): tb net
    // damage is summed across ALL monster fighters matched by key,
    // not the lead alone. The 73672 d148 influencer crew fight has
    // 4 monster fighters; lead-only net (0) hid 252 damage dealt to
    // a crew fighter. startHp/startMax/endHp below are therefore
    // TOTALS across the monster side; startMonsters/endMonsters
    // counts and any start-only keys are reported explicitly.
    const startMonsters = (s.fighters || []).filter(x => x && x.kind === 'monster');
    const sf = startMonsters[0] || null;
    const startHp = startMonsters.length ? startMonsters.reduce((t, f) => t + (f.hp | 0), 0) : null;
    const startMax = startMonsters.length ? startMonsters.reduce((t, f) => t + (f.maxHp | 0), 0) : null;
    const party = (s.fighters || []).filter(x => x && x.kind !== 'monster');
    const end = s.fightId ? endByFightId[s.fightId] : null;
    const nwkEnd = s.fightId ? nwkEndByFightId[s.fightId] : null;
    const endMonsters = end ? (end.fighters || []).filter(x => x && x.kind === 'monster') : [];
    const endByKey = {};
    for (const f of endMonsters) if (f.key) endByKey[f.key] = f;
    const endHp = endMonsters.length ? endMonsters.reduce((t, f) => t + (f.hp | 0), 0) : null;
    const startOnlyKeys = startMonsters.filter(f => !(f.key && endByKey[f.key])).map(f => f.key);
    // Net is measurable only when every start monster fighter is
    // still present at tbEnd (matched by key); a start-only key
    // (dead? fled? removed?) leaves the total unmeasured, counted
    // explicitly via the UNMEASURED-END-MISSING limiter.
    const netDmg = (end && endMonsters.length && startOnlyKeys.length === 0)
      ? startMonsters.reduce((t, f) => t + ((f.hp | 0) - ((endByKey[f.key].hp | 0))), 0)
      : null;
    void sf;
    const newW4 = nwkEnd ? (nwkEnd.newLog || []).filter(k => (k.w | 0) === 4) : [];
    let limiter, result;
    if (!end) { limiter = 'UNENDED'; result = null; }
    else if (netDmg == null) { limiter = 'UNMEASURED-END-MISSING'; result = end.result; }
    else if (startHp > 0 && netDmg < 0.10 * startHp) { limiter = 'DPS-TOO-LOW'; result = end.result; }
    else { limiter = 'TRUNCATED'; result = end.result; }
    tbRows.push({
      day: s.day, arg: s.arg, mid: s.mid, door: c.cls.door,
      tileSeq: (s.tileMonster && s.tileMonster.seq != null) ? s.tileMonster.seq : null,
      fightId: s.fightId, startHp: startHp, startMax: startMax,
      startMonsters: startMonsters.length, endMonsters: endMonsters.length,
      startOnlyKeys: startOnlyKeys,
      woundsIn: (startHp != null && startMax != null) ? (startMax - startHp) : null,
      endHp: endHp, netDmg: netDmg,
      netFrac: (netDmg != null && startHp > 0) ? Math.round((netDmg / startHp) * 1000) / 1000 : null,
      tbRounds: end ? end.round : null, result: result,
      killsW4: newW4.length, partySize: party.length,
      party: party.map(p => ({ key: p.key, kind: p.kind, villagerId: p.villagerId, hp: p.hp, maxHp: p.maxHp, wbonus: p.wbonus, varmor: p.varmor })),
      limiter: limiter, hasEndRow: !!end,
    });
    if (!end) tbUnjoined.push({ day: s.day, mid: s.mid, fightId: s.fightId, reason: 'no w4dmg tbEnd row' });
  }
  const tbLimiters = {};
  for (const r of tbRows) tbLimiters[r.limiter] = (tbLimiters[r.limiter] || 0) + 1;
  const diagErrs = (row.w4dmg.diag.errs | 0) + (row.wave4enc.diag.errs | 0) + (row.spawnsrc.diag.errs | 0) + (row.fieldfinish.diag.errs | 0) + (row.nonworldkill.diag.errs | 0);
  const overflowN = (row.w4dmg.diag.overflow.fieldFights | 0) + (row.w4dmg.diag.overflow.tbEnds | 0) + (row.wave4enc.diag.overflow.fieldFights | 0) + (row.spawnsrc.diag.overflow.spawns | 0) + (row.fieldfinish.diag.overflow.fieldFights | 0) + (row.fieldfinish.diag.overflow.tbFights | 0) + (row.nonworldkill.diag.overflow.starts | 0) + (row.nonworldkill.diag.overflow.ends | 0);
  const sumFail = fieldRows.filter(r => !r.sumOk).length;
  const checks = {
    fieldCountMatch: field4.length === waveField4.length,
    sourceSumOk: sumFail === 0,
    tbJoined: tbUnjoined.length === 0,
    diagClean: diagErrs === 0 && overflowN === 0,
  };
  const fullyDecomposed = checks.fieldCountMatch && checks.sourceSumOk && checks.tbJoined && checks.diagClean;
  const limiters = {};
  for (const k of Object.keys(fieldLimiters)) limiters['field:' + k] = (limiters['field:' + k] || 0) + fieldLimiters[k];
  for (const k of Object.keys(tbLimiters)) limiters['tb:' + k] = (limiters['tb:' + k] || 0) + tbLimiters[k];
  let dominant = null, dominantN = 0;
  for (const k of Object.keys(limiters)) if (limiters[k] > dominantN) { dominant = k; dominantN = limiters[k]; }
  const fieldDmgVals = fieldRows.map(r => r.totalDmg);
  const fieldStartHps = fieldRows.filter(r => r.startHp != null).map(r => r.startHp);
  const fieldDpsVals = fieldRows.filter(r => r.totalDmg > 0).map(r => r.dps);
  const fieldRtkVals = fieldRows.filter(r => r.roundsToKill != null).map(r => r.roundsToKill);
  const tbNetFracs = tbRows.filter(r => r.netFrac != null).map(r => r.netFrac);
  return {
    seed: row.seed,
    field4: field4.length, waveField4: waveField4.length,
    tbInits4: inits4.length, tbRows: tbRows.length,
    fieldRows: fieldRows, tbRowsDetail: tbRows, tbUnjoined: tbUnjoined,
    fieldLimiters: fieldLimiters, tbLimiters: tbLimiters, limiters: limiters,
    dominant: dominant, dominantN: dominantN,
    checks: checks, fullyDecomposed: fullyDecomposed,
    diagErrs: diagErrs, overflowN: overflowN, sumFail: sumFail,
    fieldStats: {
      dmgMin: fieldDmgVals.length ? Math.min.apply(null, fieldDmgVals) : null,
      dmgMax: fieldDmgVals.length ? Math.max.apply(null, fieldDmgVals) : null,
      dmgMedian: medianOf(fieldDmgVals),
      startHpMedian: medianOf(fieldStartHps),
      dpsMedian: medianOf(fieldDpsVals),
      rtkMedian: medianOf(fieldRtkVals),
      noAlly: fieldRows.filter(r => !r.calledHelp && !r.allyVid && (r.optsAllies | 0) === 0).length,
      volleyDmgTotal: fieldRows.reduce((t, r) => t + r.volleyDmg, 0),
      allyDmgTotal: fieldRows.reduce((t, r) => t + r.allyDmg, 0),
      closeInDmgTotal: fieldRows.reduce((t, r) => t + r.closeInDmg, 0),
      totalDmgTotal: fieldRows.reduce((t, r) => t + r.totalDmg, 0),
      intentLearn: fieldRows.filter(r => r.intent === 'learn').length,
      woundsInPositive: fieldRows.filter(r => (r.woundsIn || 0) > 0).length,
      unknownGear: fieldRows.filter(r => r.armorP == null && r.wbMelee == null).length,
      roundsMedian: medianOf(fieldRows.map(r => r.rounds)),
    },
    tbStats: {
      netDmgMedian: medianOf(tbRows.filter(r => r.netDmg != null).map(r => r.netDmg)),
      netFracMedian: medianOf(tbNetFracs),
      netFracMax: tbNetFracs.length ? Math.max.apply(null, tbNetFracs) : null,
      partySizeMedian: medianOf(tbRows.map(r => r.partySize)),
      roundsMedian: medianOf(tbRows.filter(r => r.tbRounds != null).map(r => r.tbRounds)),
    },
  };
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

async function summaryMode() {
  const evidDir = evidDirOf();
  const rows = [];
  for (const seed of SEEDS) {
    for (const pid of ['baseline', 'armed']) {
      const p = path.join(evidDir, `s${seed}-${pid}.json`);
      rows.push(JSON.parse(fs.readFileSync(p, 'utf8')));
    }
  }
  const perSeed = [];
  for (const seed of SEEDS) {
    const armed = rows.find(r => r.policy === 'armed' && r.seed === seed);
    perSeed.push(classifySeed(armed));
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
    && rows.filter(r => r.policy === 'armed').every(r => Array.isArray(r.w4dmg.fieldFights) && Array.isArray(r.w4dmg.tbEnds) && Array.isArray(r.wave4enc.fieldFights) && Array.isArray(r.nonworldkill.starts));
  const baselineBand = bandOf(rows, 'baseline');
  const armedBand = bandOf(rows, 'armed');
  const diff1920 = {
    wins: baselineBand.won - BAND1920.wins, nationalEver: baselineBand.nationalEver - BAND1920.nationalEver,
    nationalFinal: baselineBand.nationalFinal - BAND1920.nationalFinal, table: baselineBand.table - BAND1920.table,
    entered: baselineBand.entered - BAND1920.entered,
    wave4: baselineBand.wave4 - BAND1920.wave4, wave5: baselineBand.wave5 - BAND1920.wave5,
    medianDays: baselineBand.medianDays - BAND1920.medianDays, deaths: baselineBand.deathTotal - BAND1920.deaths,
    starvation: baselineBand.starvationTotal - BAND1920.starvation,
  };
  const rebaselineExact = Object.keys(diff1920).every(k => diff1920[k] === 0);
  const costBar = {
    starvationOk: armedBand.starvationTotal <= baselineBand.starvationTotal + 2,
    medianOk: armedBand.medianDays >= 0.8 * baselineBand.medianDays,
  };
  const fullyDecomposedSeeds = perSeed.filter(p => p.fullyDecomposed).length;
  const bandLimiters = {};
  for (const p of perSeed) for (const k of Object.keys(p.limiters)) bandLimiters[k] = (bandLimiters[k] || 0) + p.limiters[k];
  let bandDominant = null, bandDominantN = 0;
  for (const k of Object.keys(bandLimiters)) if (bandLimiters[k] > bandDominantN) { bandDominant = k; bandDominantN = bandLimiters[k]; }
  const allField = perSeed.flatMap(p => p.fieldRows);
  const allTb = perSeed.flatMap(p => p.tbRowsDetail);
  const bandFieldStats = {
    fights: allField.length,
    dmgMin: allField.length ? Math.min.apply(null, allField.map(r => r.totalDmg)) : null,
    dmgMax: allField.length ? Math.max.apply(null, allField.map(r => r.totalDmg)) : null,
    dmgMedian: medianOf(allField.map(r => r.totalDmg)),
    startHpMedian: medianOf(allField.filter(r => r.startHp != null).map(r => r.startHp)),
    dpsMedian: medianOf(allField.filter(r => r.totalDmg > 0).map(r => r.dps)),
    rtkMedian: medianOf(allField.filter(r => r.roundsToKill != null).map(r => r.roundsToKill)),
    volleyTotal: allField.reduce((t, r) => t + r.volleyDmg, 0),
    allyTotal: allField.reduce((t, r) => t + r.allyDmg, 0),
    closeInTotal: allField.reduce((t, r) => t + r.closeInDmg, 0),
    totalTotal: allField.reduce((t, r) => t + r.totalDmg, 0),
    noAlly: allField.filter(r => !r.calledHelp && !r.allyVid && (r.optsAllies | 0) === 0).length,
    intentLearn: allField.filter(r => r.intent === 'learn').length,
    woundsInPositive: allField.filter(r => (r.woundsIn || 0) > 0).length,
    unknownGear: allField.filter(r => r.armorP == null && r.wbMelee == null).length,
    sumFail: allField.filter(r => !r.sumOk).length,
  };
  const bandTbStats = {
    fights: allTb.length,
    netDmgMedian: medianOf(allTb.filter(r => r.netDmg != null).map(r => r.netDmg)),
    netFracMedian: medianOf(allTb.filter(r => r.netFrac != null).map(r => r.netFrac)),
    netFracMax: allTb.filter(r => r.netFrac != null).length ? Math.max.apply(null, allTb.filter(r => r.netFrac != null).map(r => r.netFrac)) : null,
    unmeasured: allTb.filter(r => r.limiter === 'UNMEASURED-END-MISSING' || r.limiter === 'UNENDED').length,
  };
  // Descriptive rounds-to-kill arithmetic at band medians (NOT a proposal).
  const rtkArithmetic = {
    medianStartHp: bandFieldStats.startHpMedian,
    medianDps: bandFieldStats.dpsMedian,
    roundsToKillAtMedians: (bandFieldStats.startHpMedian > 0 && bandFieldStats.dpsMedian > 0) ? Math.ceil(bandFieldStats.startHpMedian / bandFieldStats.dpsMedian) : null,
    medianPerFightRtk: bandFieldStats.rtkMedian,
    fieldRoundCap: 15,
  };
  const verdict = (fullyDecomposedSeeds >= 6 && bandDominant && rtkArithmetic.roundsToKillAtMedians != null) ? 'DIAG-GO' : 'DIAG-NO-GO';
  const report = {
    label: 'sim-w4dmg-a', seeds: SEEDS, days: 180, perSeed: perSeed,
    gates: { g2RecorderNeutrality: g2, g2Pass: g2Pass, corpusOk: corpusOk, rebaselineExact: rebaselineExact, diffVs1920: diff1920, costBar: costBar },
    baselineBand: baselineBand, armedBand: armedBand, band1920: BAND1920,
    bandLimiters: bandLimiters, bandDominant: bandDominant, bandDominantN: bandDominantN,
    bandFieldStats: bandFieldStats, bandTbStats: bandTbStats, rtkArithmetic: rtkArithmetic,
    fullyDecomposedSeeds: fullyDecomposedSeeds,
    verdict: verdict,
    verdictRule: 'DIAG-GO iff fully-decomposed seeds >= 6 (every wave-4 fight in a per-fight damage row, zero unattributed fights hidden, unattributed damage explicitly counted, recorder errors zero) AND dominant limiter named with per-seed counts and band totals AND rounds-to-kill arithmetic at observed DPS vs median wave-4 HP stated.',
    generated: new Date().toISOString(),
  };
  const summaryPath = path.join(evidDir, 'summary.json');
  writeFileRetry(summaryPath, JSON.stringify(report, null, 1) + '\n');
  console.log('\n=== sim-w4dmg-a ===');
  console.log(`  baseline: n=${baselineBand.n} won=${baselineBand.won} medD=${baselineBand.medianDays} natEver=${baselineBand.nationalEver} natFinal=${baselineBand.nationalFinal} table=${baselineBand.table} entered=${baselineBand.entered} wave4=${baselineBand.wave4} wave5=${baselineBand.wave5} starv=${baselineBand.starvationTotal} deaths=${baselineBand.deathTotal}`);
  console.log(`  armed:    n=${armedBand.n} won=${armedBand.won} medD=${armedBand.medianDays} natEver=${armedBand.nationalEver} natFinal=${armedBand.nationalFinal} table=${armedBand.table} entered=${armedBand.entered} wave4=${armedBand.wave4} wave5=${armedBand.wave5} starv=${armedBand.starvationTotal} deaths=${armedBand.deathTotal}`);
  console.log(`  rebaseline vs 1920Z: ${rebaselineExact ? 'EXACT' : 'DIFF ' + JSON.stringify(diff1920)}`);
  console.log(`  G2 recorder neutrality: ${g2Pass ? 'PASS' : 'FAIL'} (${g2.filter(x => x.ok).length}/${g2.length}; faced ${g2.filter(x => x.facedOk).length}/${g2.length}, kills ${g2.filter(x => x.killsOk).length}/${g2.length})`);
  console.log(`  corpus: ${corpusOk ? 'PASS' : 'FAIL'}; costBar starvationOk=${costBar.starvationOk} medianOk=${costBar.medianOk}`);
  for (const p of perSeed) {
    console.log(`  seed ${p.seed}: field4=${p.field4} tbInits4=${p.tbInits4} dominant=${p.dominant}(${p.dominantN}) fullyDecomposed=${p.fullyDecomposed} fieldDmg=${p.fieldStats.dmgMin}-${p.fieldStats.dmgMax} med=${p.fieldStats.dmgMedian} dpsMed=${p.fieldStats.dpsMedian} rtkMed=${p.fieldStats.rtkMedian} limiters=${JSON.stringify(p.limiters)}`);
  }
  console.log(`  band limiters: ${JSON.stringify(bandLimiters)} dominant=${bandDominant}(${bandDominantN})`);
  console.log(`  band field: ${JSON.stringify(bandFieldStats)}`);
  console.log(`  band tb: ${JSON.stringify(bandTbStats)}`);
  console.log(`  rtk arithmetic: ${JSON.stringify(rtkArithmetic)}`);
  console.log(`  fullyDecomposed seeds: ${fullyDecomposedSeeds}/8 -> VERDICT ${verdict}`);
  console.log(`  -> ${summaryPath}`);
  if (!g2Pass || !corpusOk) { console.error('PROOF GATE FAILURE'); process.exit(1); }
}

async function sweepMode() {
  const evidDir = evidDirOf();
  fs.mkdirSync(evidDir, { recursive: true });
  const pids = (process.env.PIDS || 'baseline,armed').split(',').map(s => s.trim()).filter(Boolean);
  for (const pid of pids) {
    for (const seed of SEEDS) {
      console.log(`--- ${pid} seed ${seed} ---`);
      const out = execFileSync('node', [path.join(REPO, 'scripts', 'test-w4dmg-diag-sweep.js'), '--one', pid, String(seed)],
        { cwd: REPO, encoding: 'utf8', timeout: 1200000, env: Object.assign({}, process.env, { EVID: evidDir }) });
      process.stdout.write(out);
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
    const c = classifySeed(row);
    line += ` field4=${c.field4} tbInits4=${c.tbInits4} dominant=${c.dominant}(${c.dominantN}) fullyDecomposed=${c.fullyDecomposed} diagErrs=${c.diagErrs} sumFail=${c.sumFail}`;
  }
  console.log(`  [${pid} seed ${seed}] ${line}`);
}

async function detgateMode() {
  const seed = parseInt(process.env.SEED || '73671', 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const c = await runOne('baseline', seed, days, null);
  delete process.env.W4DMG; delete process.env.WAVE4ENC; delete process.env.SPAWNSRC; delete process.env.FIELDFINISH; delete process.env.NONWORLDKILL;
  process.env.LEANLINKRESCUE = '1'; process.env.TABLESEATNOWAIT = '1';
  const w4dmgStore = newW4dmgStore(), waveStore = newWaveStore(), spawnStore = newSpawnStore(), ffStore = newFFStore(), nwkStore = newNwkStore();
  const wrapped = withNonworldkillDiag(
    withFieldfinishDiag(
      withSpawnsrcDiag(
        withWave4encDiag(
          withW4dmgDiag(tableseatNowait, 'w4dmg-diag', 'tableseat-nowait + wave-4 damage decomposition recorder', w4dmgStore),
          'wave4enc-diag', 'tableseat-nowait + wave-4 field spawn-link recorder', waveStore),
        'spawnsrc-diag', 'tableseat-nowait + spawn-source census', spawnStore),
      'fieldfinish-diag', 'tableseat-nowait + wounded field-finish recorder', ffStore),
    'nonworldkill-diag', 'tableseat-nowait + TB initiation census', nwkStore);
  const { Game } = await loadGame({ seed, mode: 'w4dmg-diag-detgate', fullTelemetry: false });
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
  const hasDiagSurface = !!(capturedCtx && (capturedCtx._w4dmg || capturedCtx._wave4enc || capturedCtx._spawnsrc || capturedCtx._fieldfinishdiag || capturedCtx._nonworldkill));
  const wrapsInstalled = !!Game._w4dmgDiagInstalled || !!Game._wave4encDiagInstalled || !!Game._spawnsrcDiagInstalled || !!Game._fieldfinishDiagInstalled || !!Game._nonworldkillDiagInstalled;
  const ok = c.days === result.days && c.gameDays === result.gameDays
    && JSON.stringify(ts) === JSON.stringify(c.ts) && !hasDiagSurface && !wrapsInstalled;
  console.log(`DETGATE seed=${seed} baseline days=${c.days} gameDays=${c.gameDays} ts=${JSON.stringify(c.ts)} | wrapped(recorders OFF) days=${result.days} gameDays=${result.gameDays} ts=${JSON.stringify(ts)} diagSurface=${hasDiagSurface} wrapsInstalled=${wrapsInstalled} -> ${ok ? 'PASS' : 'FAIL'}`);
  if (!ok) process.exit(1);
}

async function detailMode(seedArg) {
  const seed = parseInt(process.env.DETAIL_SEED || seedArg || '73671', 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const evidDir = evidDirOf();
  let census = null;
  try { census = JSON.parse(fs.readFileSync(path.join(evidDir, `s${seed}-armed.json`), 'utf8')); } catch (e) { census = null; }
  const row = await runOne('armed', seed, days, null);
  const a = classifySeed(row);
  const same = !!census && census.days === row.days && census.gameDays === row.gameDays
    && JSON.stringify(census.ts) === JSON.stringify(row.ts)
    && classifySeed(census).field4 === a.field4
    && classifySeed(census).tbInits4 === a.tbInits4
    && JSON.stringify(classifySeed(census).limiters) === JSON.stringify(a.limiters);
  console.log(`DETAIL-REPRO seed=${seed} days=${row.days} gameDays=${row.gameDays} censusMatch=${same} field4=${a.field4} tbInits4=${a.tbInits4} limiters=${JSON.stringify(a.limiters)}`);
  if (!same) { console.error('DETAIL REPRODUCTION FAILURE'); process.exit(1); }
  console.log('DETAIL field damage rows (wave 4):');
  for (const r of a.fieldRows) console.log(`DETAIL field d${r.day} ${r.mid} vid=${r.vid} ${r.startHp}->${r.endHp} dmg=${r.totalDmg}(volley ${r.volleyDmg}/ally ${r.allyDmg}/close ${r.closeInDmg}) rounds=${r.rounds} dps=${r.dps} rtk=${r.roundsToKill} outcome=${r.outcome} limiter=${r.limiter} woundsIn=${r.woundsIn} prevMatch=${r.prevMatch}`);
  console.log('DETAIL tb damage rows (wave 4):');
  for (const r of a.tbRowsDetail) console.log(`DETAIL tb d${r.day} ${r.mid} door=${r.door} ${r.startHp}->${r.endHp} net=${r.netDmg} frac=${r.netFrac} rounds=${r.tbRounds} result=${r.result} party=${r.partySize} limiter=${r.limiter}`);
}

async function senseMode(seedArg) {
  const seed = parseInt(process.env.SENSE_SEED || seedArg || '73671', 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const out = process.env.SENSE_OUT || path.join(REPO, 'evidence', '2026-10-26', 'sim-w4dmg-a-sense.txt');
  process.env.LEANLINKRESCUE = '1'; process.env.TABLESEATNOWAIT = '1';
  process.env.W4DMG = '1'; process.env.WAVE4ENC = '1'; process.env.SPAWNSRC = '1'; process.env.FIELDFINISH = '1'; process.env.NONWORLDKILL = '1';
  const w4dmgStore = newW4dmgStore(), waveStore = newWaveStore(), spawnStore = newSpawnStore(), ffStore = newFFStore(), nwkStore = newNwkStore();
  const armed = withNonworldkillDiag(
    withFieldfinishDiag(
      withSpawnsrcDiag(
        withWave4encDiag(
          withW4dmgDiag(tableseatNowait, 'w4dmg-diag', 'tableseat-nowait + wave-4 damage decomposition recorder', w4dmgStore),
          'wave4enc-diag', 'tableseat-nowait + wave-4 field spawn-link recorder', waveStore),
        'spawnsrc-diag', 'tableseat-nowait + spawn-source census', spawnStore),
      'fieldfinish-diag', 'tableseat-nowait + wounded field-finish recorder', ffStore),
    'nonworldkill-diag', 'tableseat-nowait + TB initiation census', nwkStore);
  const { Game } = await loadGame({ seed, mode: 'w4dmg-diag-sense', fullTelemetry: false, narration: true });
  const t = {};
  const uninstall = PI.install(Game, t);
  await setupGame(Game);
  try { installW4dmgDiag(Game, w4dmgStore); } catch (e) {}
  try { installWave4encDiag(Game, waveStore); } catch (e) {}
  try { installSpawnsrcDiag(Game, spawnStore); } catch (e) {}
  try { installFieldfinishDiag(Game, ffStore); } catch (e) {}
  try { installNonworldkillDiag(Game, nwkStore); } catch (e) {}
  let result;
  await quietLog(async () => { result = await runDays(Game, armed, { days, manifest: undefined, sampleEvery: 30 }); });
  try { uninstall(); } catch (e) {}
  const ring = t.sayRing || [];
  let pg = {};
  try { pg = Game.progState ? Game.progState() : {}; } catch (e) {}
  let dmgLine = 'w4dmg: unavailable';
  try {
    const field4 = w4dmgStore.fieldFights.filter(f => (f.wave | 0) === 4);
    const byO = {};
    for (const f of field4) byO[f.outcome || 'null'] = (byO[f.outcome || 'null'] || 0) + 1;
    dmgLine = `w4dmg (SENSE-ONLY, non-measured): field4=${field4.length} byOutcome=${JSON.stringify(byO)} totalDmg=${field4.reduce((t, f) => t + (f.mDealt | 0), 0)}`;
  } catch (e) { dmgLine = 'w4dmg error: ' + String((e && e.message) || e).slice(0, 160); }
  const header = [
    'SENSE-ONLY REPLAY — NON-MEASURED (narration shifts trajectories; never enters the census)',
    `seed=${seed} policy=tableseat-nowait+w4dmg-diag days=${result.days} gameDays=${result.gameDays} endReason=${result.endReason} maxWave=${result.maxWaveUnlocked} sayLive=${!!t.sayLive} ringLines=${ring.length} tableWaiting=${!!pg.tableWaiting} tableDone=${!!pg.tableDone}`,
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
if (require.main === module) main().catch(e => { console.error('W4DMG-DIAG SWEEP FAILED:', (e && e.stack) || e); process.exit(1); });
module.exports = { runOne, classifySeed, bandOf, BAND1920, SEEDS };
