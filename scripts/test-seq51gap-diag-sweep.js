#!/usr/bin/env node
// scripts/test-seq51gap-diag-sweep.js — sim-seq51gap-a sweep
// (scale-onramp axis, 2026-10-26, arm sim-seq51gap-a. DIAG /
// MEASUREMENT ONLY, zero src/js changes.)
//
// Substrate: tableseat-nowait (LEANLINKRESCUE=1, TABLESEATNOWAIT=1),
// seeds 73671-73678, 180d death-aware horizon. One process per seed
// (default mode spawns --one children; every row is written
// incrementally into the worktree evidence dir, never /tmp).
//
// Baseline: plain tableseat-nowait, post-run pure-read snapshot.
// Armed: tableseat-nowait wrapped with the five w4dmg-a recorders
// verbatim (w4dmg, wave4enc, spawnsrc, fieldfinish, nonworldkill)
// PLUS the NEW seq51gap-diag daily world-entity HP tick recorder
// (SEQ51GAP=1, composed outermost so its snapshot runs after the
// inner policy's daily work, still before sleep).
//
// Modes: --one <pid> <seed> | (default sweep) | --summary |
// --detgate | --detail <seed> | --sense <seed>. The binding
// pre-registration (candidate-cause set C1-C6, DIAG-GO bar) lives
// in evidence/2026-10-26/sim-seq51gap-a-prereg.md — read it
// before judging anything this script prints.
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
function evidDirOf() { return process.env.EVID || path.join(REPO, 'evidence', '2026-10-26', 'perseed-seq51gap-a'); }
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
  let w4dmgStore = null, waveStore = null, spawnStore = null, ffStore = null, nwkStore = null, gapStore = null;
  let base = tableseatNowait;
  if (pid === 'armed') {
    process.env.W4DMG = '1'; process.env.WAVE4ENC = '1'; process.env.SPAWNSRC = '1'; process.env.FIELDFINISH = '1'; process.env.NONWORLDKILL = '1'; process.env.SEQ51GAP = '1';
    w4dmgStore = newW4dmgStore(); waveStore = newWaveStore(); spawnStore = newSpawnStore(); ffStore = newFFStore(); nwkStore = newNwkStore(); gapStore = newGapStore();
    base = withSeq51gapDiag(
      withNonworldkillDiag(
        withFieldfinishDiag(
          withSpawnsrcDiag(
            withWave4encDiag(
              withW4dmgDiag(tableseatNowait, 'w4dmg-diag', 'tableseat-nowait + wave-4 damage decomposition recorder', w4dmgStore),
              'wave4enc-diag', 'tableseat-nowait + wave-4 field spawn-link recorder', waveStore),
            'spawnsrc-diag', 'tableseat-nowait + spawn-source census', spawnStore),
          'fieldfinish-diag', 'tableseat-nowait + wounded field-finish recorder', ffStore),
        'nonworldkill-diag', 'tableseat-nowait + TB initiation census', nwkStore),
      'seq51gap-diag', 'tableseat-nowait + daily world-entity HP tick recorder', gapStore);
  } else {
    delete process.env.W4DMG; delete process.env.WAVE4ENC; delete process.env.SPAWNSRC; delete process.env.FIELDFINISH; delete process.env.NONWORLDKILL; delete process.env.SEQ51GAP;
  }
  const { Game } = await loadGame({ seed, mode: 'seq51gap-diag-' + pid, fullTelemetry: false });
  await setupGame(Game);
  if (pid === 'armed') {
    try { installW4dmgDiag(Game, w4dmgStore); } catch (e) {}
    try { installWave4encDiag(Game, waveStore); } catch (e) {}
    try { installSpawnsrcDiag(Game, spawnStore); } catch (e) {}
    try { installFieldfinishDiag(Game, ffStore); } catch (e) {}
    try { installNonworldkillDiag(Game, nwkStore); } catch (e) {}
    try { installSeq51gapDiag(Game, gapStore); } catch (e) {}
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
    // Post-run pure-read tail tick (closes the tail even when the
    // scholar day did not advance after the last policy.daily).
    try { snapshotWorldForce(Game, gapStore); } catch (e) {}
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
    row.seq51gap = {
      ticks: gapStore.ticks,
      diag: { errs: gapStore.errs, errors: gapStore.errors, overflow: gapStore.overflow, installed: gapStore.installed, lastTickDay: gapStore.lastTickDay },
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

// ---- trace analysis (pure over one armed row) ----

function buildObservations(row, seq) {
  // Chronological chain, grouped by scholar day: within a day,
  // field fights (start/end pairs kept together, in row order)
  // sort before tb-start tile reads, and all of the day's events
  // sort before that day's policy.daily tick (the tick runs after
  // the day's actions, before sleep). A day's tick is the last
  // tick recorded for that day (a post-run duplicate for the
  // final day overwrites the regular tick — same day, later
  // state). Days with fights but no tick (harness day-jumps,
  // where the scholar day advances twice between daily phases)
  // still appear via their event rows, between the surrounding
  // ticks — so no change hides in a tick gap.
  const ticksByDay = new Map();
  const ticks = (row.seq51gap && row.seq51gap.ticks) || [];
  for (const t of ticks) {
    const ent = (t.entities || []).find(e => e.seq === seq);
    if (ent) ticksByDay.set(t.day, { day: t.day, kind: 'tick', hp: ent.hp, maxHp: ent.maxHp, tx: ent.tx, ty: ent.ty, lingering: ent.lingering, lingerSince: ent.lingerSince, lastRaidDay: t.lastRaidDay, havenTier: t.havenTier, hx: t.hx, hy: t.hy, source: t.source || null, id: ent.id });
  }
  const fieldByDay = new Map();
  for (const f of ((row.w4dmg && row.w4dmg.fieldFights) || [])) {
    if (f.seq !== seq || (f.wave | 0) !== 4) continue;
    const arr = fieldByDay.get(f.day) || [];
    if (f.startHp != null) arr.push({ day: f.day, kind: 'field-start', hp: f.startHp, maxHp: f.startMax, vid: f.vid, mid: f.mid });
    if (f.endHp != null) arr.push({ day: f.day, kind: 'field-end', hp: f.endHp, maxHp: f.startMax, vid: f.vid, mid: f.mid, outcome: f.outcome, dmg: f.totalDmg });
    fieldByDay.set(f.day, arr);
  }
  const tbByDay = new Map();
  let nullStarts = 0;
  for (const s of ((row.nonworldkill && row.nonworldkill.starts) || [])) {
    const cls = classifyStart(s);
    if (cls.excluded) continue;
    if (!s.tileMonster || s.tileMonster.seq !== seq) continue;
    // A start that built no fight (fightId null AND mid null —
    // e.g. the scripted-titan monsterTurn bumps on 73672 seq43,
    // which call startCombat but leave no fighters and no tbEnd
    // join) is NOT a tb fight: its tile read merely duplicates
    // the surrounding tick HP, and including it as a tb-start
    // observation manufactures phantom steps when a same-day
    // field fight moves the HP. Counted, never hidden.
    if (s.fightId == null && s.mid == null) { nullStarts++; continue; }
    const arr = tbByDay.get(s.day) || [];
    arr.push({ day: s.day, kind: 'tb-start-tile', hp: s.tileMonster.hp, maxHp: s.tileMonster.maxHp, fightId: s.fightId, mid: s.mid, door: cls.door, lingering: s.tileMonster.lingering, titan: !!s.tileMonster.titan });    tbByDay.set(s.day, arr);
  }
  const days = Array.from(new Set([...ticksByDay.keys(), ...fieldByDay.keys(), ...tbByDay.keys()])).sort((a, b) => a - b);
  const obs = [];
  for (const day of days) {
    obs.push(...(fieldByDay.get(day) || []));
    obs.push(...(tbByDay.get(day) || []));
    if (ticksByDay.has(day)) obs.push(ticksByDay.get(day));
  }
  return { obs, nullStarts };
}

// tb-end join: fightId -> tile seq (world entity) + end row.
// Each end also carries the start row's lingering/titan flags
// (the restore-eligibility inputs) for its fight.
function tbEndMap(row) {
  const fightSeq = {};
  const fightStart = {};
  for (const s of ((row.nonworldkill && row.nonworldkill.starts) || [])) {
    if (s.fightId && s.tileMonster && s.tileMonster.seq != null) {
      fightSeq[s.fightId] = s.tileMonster.seq;
      fightStart[s.fightId] = { lingering: !!s.tileMonster.lingering, titan: !!s.tileMonster.titan };
    }
  }
  const ends = [];
  for (const e of ((row.w4dmg && row.w4dmg.tbEnds) || [])) {
    if (!e.fightId || fightSeq[e.fightId] == null) continue;
    const fighters = (e.fighters || []).filter(x => x && x.kind === 'monster');
    const standing = fighters.filter(x => x.alive && (x.hp || 0) > 0);
    ends.push({ day: e.day, fightId: e.fightId, seq: fightSeq[e.fightId], result: e.result, round: e.round,
      standingHp: standing.length ? standing[0].hp : null, standingCount: standing.length, monsterCount: fighters.length,
      startLingering: (fightStart[e.fightId] || {}).lingering || false, startTitan: (fightStart[e.fightId] || {}).titan || false });
  }
  return ends;
}

// classifyStep(a, b, ctx): a,b consecutive observations of one
// seq, b.hp !== a.hp. Returns {cause, detail}. Causes are ONLY
// C1-C6 from the prereg; anything else is UNACCOUNTED.
function classifyStep(a, b, ctx) {
  const drop = (a.hp || 0) - (b.hp || 0);
  const maxHp = b.maxHp || a.maxHp || 0;
  const wall = maxHp ? Math.round(maxHp * 0.25) : null;
  // The wall formula floors at 1 HP (havenRaidTick: m.hp =
  // max(1, hp - wall)), so the predicted post-wall HP — not the
  // raw drop — is the exact check: when hp <= wall the drop is
  // wall - 1 short of the wall (e.g. 175 -> 1, not 175 -> 0).
  const wallHp = (maxHp && a.hp != null) ? Math.max(1, (a.hp || 0) - wall) : null;
  // C1: the step IS a field fight's end (its start is the
  // preceding observation in the chain by construction).
  if (b.kind === 'field-end') {
    return { cause: 'C1-field-fight', detail: `field end d${b.day} ${b.mid} ${b.vid} dmg=${b.dmg} outcome=${b.outcome}; start ${a.hp} (a.kind=${a.kind})` };
  }
  // Surrounding ticks for raid/restore checks.
  const obs = ctx.obs;
  const bi = obs.indexOf(b);
  let prevTick = null, nextTick = null;
  for (let i = bi - 1; i >= 0; i--) if (obs[i].kind === 'tick') { prevTick = obs[i]; break; }
  if (b.kind === 'tick') nextTick = b;
  else for (let i = bi + 1; i < obs.length; i++) if (obs[i].kind === 'tick') { nextTick = obs[i]; break; }
  const tileAtNext = nextTick ? [nextTick.tx, nextTick.ty] : null;
  const havenAtNext = nextTick ? [nextTick.hx, nextTick.hy] : null;
  // Raid detection from the tick ROWS (all days, not just days
  // this entity was present): a raid in the step's interval
  // moves lastRaidDay between the latest tick row at or before
  // a's day and the latest tick row at or before b's day. This
  // works even when the entity itself vanishes from later
  // ticks (lifted for a tb fight and never restored), where
  // entity-present ticks alone show no next tick at all.
  const tickRows = ctx.tickRows || [];
  let raidBefore = null, raidAfter = null, tierAfter = null;
  for (const tr of tickRows) {
    if (tr.day <= a.day) raidBefore = tr.lastRaidDay;
    if (tr.day <= b.day) { raidAfter = tr.lastRaidDay; tierAfter = tr.havenTier; }
  }
  const raidChanged = raidAfter != null && raidAfter !== raidBefore;
  const raidDay = raidChanged ? raidAfter : null;
  // C3: the tb end that explains b. When a IS a tb start, the
  // explaining end is a's own fight's end (same-day chains
  // have several ends; taking the latest same-day end, as an
  // earlier version did, misattributes every chained restore).
  // Otherwise the latest end in the step's day interval (an end
  // on a's own day does not count when a is a tick, because
  // that end preceded the tick). Eligibility mirrors the
  // restore code: titan + non-won, or lingerer + fled/lost.
  let c3 = null, c3Eligible = null;
  let ends = [];
  if (a.kind === 'tb-start-tile' && a.fightId) {
    ends = ctx.ends.filter(e => e.seq === ctx.seq && e.fightId === a.fightId);
  } else {
    ends = ctx.ends.filter(e => {
      if (e.seq !== ctx.seq) return false;
      if (e.day < a.day || e.day > b.day) return false;
      if (a.kind === 'tick' && e.day === a.day) return false;
      return true;
    });
  }
  if (ends.length) {
    const latest = ends[ends.length - 1];
    c3Eligible = (latest.startTitan && latest.result !== 'won')
      || (latest.startLingering && (latest.result === 'fled' || latest.result === 'lost'));
    if (c3Eligible && latest.standingHp != null) {
      const predicted = Math.max(1, Math.min(maxHp || latest.standingHp, latest.standingHp));
      if (predicted === b.hp) c3 = `tb end d${latest.day} fight ${latest.fightId} result=${latest.result} standingHp=${latest.standingHp} -> min(maxHp ${maxHp}, standing) = ${predicted}`;
    }
  }
  if (c3) return { cause: 'C3-tb-restore', detail: c3 };
  // C2: raid signature — a raid in the interval, b.hp exactly
  // the post-wall value, haven tier >= 2, and the raid's own
  // lingering stamp: the following entity-present tick shows
  // the entity lingering with lingerSince == the raid day (a
  // re-draft of an already-lingering raider keeps the old stamp
  // and still counts, noted as such), or — when the entity
  // never reappears in ticks — the tb-start tile read itself
  // shows it lingering at fight start. The tick-time tile is
  // NOT required to equal the Haven tile: the raid pins raiders
  // to Haven at dawn, but wanderWorldMonsters moves them off
  // again before the policy.daily tick, so the tick-time tile is
  // post-wander drift, not the raid pin — the lingerSince stamp
  // is the raid's fingerprint.
  const lingeringFlip = !!(prevTick && !prevTick.lingering && nextTick && nextTick.lingering && nextTick.lingerSince === raidDay);
  const alreadyLingering = !!(prevTick && prevTick.lingering);
  const tbStartLingering = (b.kind === 'tb-start-tile' && b.lingering === true);
  if (raidChanged && b.hp === wallHp && (tierAfter || 0) >= 2 && (lingeringFlip || alreadyLingering || tbStartLingering)) {
    return { cause: 'C2-palisade-wall', detail: `lastRaidDay ${raidBefore} -> ${raidAfter} (raid day ${raidDay}); post-wall HP ${wallHp} == b.hp (wall ${wall}, a.hp ${a.hp}); havenTier ${tierAfter}; lingering ${prevTick ? prevTick.lingering : null} -> ${nextTick ? nextTick.lingering : null} lingerSince ${nextTick ? nextTick.lingerSince : null}${alreadyLingering && !lingeringFlip ? ' (already-lingering re-draft)' : ''}${tbStartLingering && !lingeringFlip ? ' (lingering at tb-start tile read)' : ''}; tile at next tick ${tileAtNext} (post-wander drift, not the dawn pin)` };
  }
  if (raidChanged && b.hp === wallHp) {
    return { cause: 'C2?-wall-amount-only', detail: `post-wall HP ${wallHp} == b.hp and lastRaidDay changed (${raidBefore} -> ${raidAfter}) but the lingering signature is incomplete (prevTick lingering ${prevTick ? prevTick.lingering : null}, nextTick lingering ${nextTick ? nextTick.lingering : null} lingerSince ${nextTick ? nextTick.lingerSince : null}, havenTier ${tierAfter}, tile ${tileAtNext}, haven ${havenAtNext}); NOT claimed as C2` };
  }
  return { cause: 'UNACCOUNTED', detail: `change ${a.hp} -> ${b.hp} (${drop > 0 ? '-' + drop : '+' + (-drop)}) across ${a.kind} d${a.day} -> ${b.kind} d${b.day}; raidChanged=${raidChanged} raidBefore=${raidBefore} raidAfter=${raidAfter} wall=${wall} wallHp=${wallHp} c3=${c3 ? 'match' : (ends.length ? 'eligible=' + c3Eligible + ',no-match' : 'no-tb-end')} prevTickRaid=${prevTick ? prevTick.lastRaidDay : null} nextTickRaid=${nextTick ? nextTick.lastRaidDay : null}` };
}

function traceSeq(row, seq) {
  const built = buildObservations(row, seq);
  const obs = built.obs;
  const ends = tbEndMap(row);
  const tickRows = ((row.seq51gap && row.seq51gap.ticks) || []).map(t => ({ day: t.day, lastRaidDay: t.lastRaidDay, havenTier: t.havenTier, hx: t.hx, hy: t.hy }));
  const ctx = { obs, ends, seq, tickRows };
  const steps = [];
  for (let i = 1; i < obs.length; i++) {
    const a = obs[i - 1], b = obs[i];
    if (a.hp == null || b.hp == null || a.hp === b.hp) continue;
    const c = classifyStep(a, b, ctx);
    steps.push({ fromDay: a.day, fromKind: a.kind, fromHp: a.hp, toDay: b.day, toKind: b.kind, toHp: b.hp, delta: b.hp - a.hp, cause: c.cause, detail: c.detail });
  }
  // Presence: ticks where the seq is absent (C5 vanish / C4
  // reappearance handled descriptively, not as HP changes).
  const ticks = (row.seq51gap && row.seq51gap.ticks) || [];
  const presence = ticks.map(t => ({ day: t.day, present: (t.entities || []).some(e => e.seq === seq) }));
  const vanishDays = [];
  for (let i = 1; i < presence.length; i++) {
    if (presence[i - 1].present && !presence[i].present) vanishDays.push(presence[i].day);
  }
  const firstTickDay = presence.length ? presence[0].day : null;
  const lastTickDay = presence.length ? presence[presence.length - 1].day : null;
  const tickDaysPresent = presence.filter(p => p.present).map(p => p.day);
  const missingTickDays = [];
  if (firstTickDay != null && lastTickDay != null) {
    for (let d = firstTickDay; d <= lastTickDay; d++) if (!presence.some(p => p.day === d)) missingTickDays.push(d);
  }
  const counts = {};
  for (const s of steps) counts[s.cause] = (counts[s.cause] || 0) + 1;
  const unaccountedDrops = steps.filter(s => s.cause === 'UNACCOUNTED' && s.delta < 0);
  const unaccountedRises = steps.filter(s => s.cause === 'UNACCOUNTED' && s.delta > 0);
  return {
    seq, obs, steps, counts, nullStarts: built.nullStarts,
    unaccountedDrops: unaccountedDrops.length, unaccountedRises: unaccountedRises.length,
    vanishDays, firstTickDay, lastTickDay, missingTickDays,
    tickCount: ticks.length, presentTickCount: tickDaysPresent.length,
  };
}

function wave4Seqs(row) {
  const set = new Set();
  for (const t of ((row.seq51gap && row.seq51gap.ticks) || [])) {
    for (const e of (t.entities || [])) if (e.seq != null && (e.wave | 0) === 4) set.add(e.seq);
  }
  for (const f of ((row.w4dmg && row.w4dmg.fieldFights) || [])) if (f.seq != null && (f.wave | 0) === 4) set.add(f.seq);
  for (const s of ((row.nonworldkill && row.nonworldkill.starts) || [])) {
    if (s.tileMonster && s.tileMonster.seq != null && (s.wave | 0) === 4) set.add(s.tileMonster.seq);
  }
  return Array.from(set).sort((a, b) => a - b);
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
    const seqs = wave4Seqs(armed);
    const traces = {};
    for (const seq of seqs) traces[seq] = traceSeq(armed, seq);
    const w4field = (armed.w4dmg.fieldFights || []).filter(f => (f.wave | 0) === 4);
    const wvfield = (armed.wave4enc.fieldFights || []).filter(f => (f.wave | 0) === 4);
    const diagErrs = (armed.w4dmg.diag.errs | 0) + (armed.wave4enc.diag.errs | 0) + (armed.spawnsrc.diag.errs | 0) + (armed.fieldfinish.diag.errs | 0) + (armed.nonworldkill.diag.errs | 0) + (armed.seq51gap.diag.errs | 0);
    const overflowN = (armed.w4dmg.diag.overflow.fieldFights | 0) + (armed.w4dmg.diag.overflow.tbEnds | 0) + (armed.wave4enc.diag.overflow.fieldFights | 0) + (armed.fieldfinish.diag.overflow.fieldFights | 0) + (armed.fieldfinish.diag.overflow.tbFights | 0) + (armed.nonworldkill.diag.overflow.starts | 0) + (armed.nonworldkill.diag.overflow.ends | 0) + (armed.seq51gap.diag.overflow | 0);
    const sumFail = w4field.filter(f => {
      const volley = (f.volleyDmg | 0), ally = (f.allyDmg | 0), close = (f.closeInDmg | 0), total = (f.totalDmg | 0);
      return (volley + ally + close) !== total;
    }).length;
    // tb join: nonworldkill initiations (wave 4) vs w4dmg tbEnds.
    const inits4 = (armed.nonworldkill.starts || []).filter(s => { const c = classifyStart(s); return !c.excluded && (s.wave | 0) === 4; });
    const endIds = new Set((armed.w4dmg.tbEnds || []).map(e => e.fightId).filter(Boolean));
    const unjoined = inits4.filter(s => !s.fightId || !endIds.has(s.fightId)).map(s => ({ day: s.day, mid: s.mid, fightId: s.fightId }));
    // Wave-4 kills from the kill log (waveKillLog copies).
    const w4kills = (armed.logEntries || []).filter(e => (e.w | 0) === 4).length;
    // Tick gaps, listed not hidden: scholar-day jumps between
    // daily phases (the harness can advance the day twice
    // between policy.daily calls) and post-run duplicate days.
    const tickDays = (armed.seq51gap.ticks || []).map(t => t.day);
    const tickGaps = [], tickDupDays = [];
    for (let i = 1; i < tickDays.length; i++) {
      if (tickDays[i] > tickDays[i - 1] + 1) { const miss = []; for (let d = tickDays[i - 1] + 1; d < tickDays[i]; d++) miss.push(d); tickGaps.push({ from: tickDays[i - 1], to: tickDays[i], missing: miss }); }
      else if (tickDays[i] === tickDays[i - 1]) tickDupDays.push(tickDays[i]);
    }
    perSeed.push({
      seed,
      field4: w4field.length, waveField4: wvfield.length,
      fieldCountMatch: w4field.length === wvfield.length,
      tbInits4: inits4.length, tbUnjoined: unjoined,
      diagErrs, overflowN, sumFail,
      seqs, traces,
      bandUnaccountedDrops: seqs.reduce((t, q) => t + traces[q].unaccountedDrops, 0),
      bandUnaccountedRises: seqs.reduce((t, q) => t + traces[q].unaccountedRises, 0),
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
    && rows.filter(r => r.policy === 'armed').every(r => Array.isArray(r.w4dmg.fieldFights) && Array.isArray(r.w4dmg.tbEnds) && Array.isArray(r.seq51gap.ticks) && r.seq51gap.ticks.length > 0);
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
  // Target trace: seed 73672, seq51, window d143-d148.
  const target = perSeed.find(p => p.seed === 73672);
  const targetTrace = target ? target.traces[51] : null;
  const windowSteps = targetTrace ? targetTrace.steps.filter(s => s.toDay >= 143 && s.toDay <= 148) : [];
  const windowDaysPresent = targetTrace ? (() => {
    const days = new Set();
    for (const o of targetTrace.obs) if (o.day >= 143 && o.day <= 148) days.add(o.day);
    for (const t of ((rows.find(r => r.policy === 'armed' && r.seed === 73672) || {}).seq51gap || {}).ticks || []) if (t.day >= 143 && t.day <= 148) days.add(t.day);
    return Array.from(days).sort((a, b) => a - b);
  })() : [];
  const windowComplete = [143, 144, 145, 146, 147, 148].every(d => windowDaysPresent.indexOf(d) >= 0);
  const windowUnaccounted = windowSteps.filter(s => s.cause === 'UNACCOUNTED');
  const bandUnaccountedDrops = perSeed.reduce((t, p) => t + p.bandUnaccountedDrops, 0);
  const bandUnaccountedRises = perSeed.reduce((t, p) => t + p.bandUnaccountedRises, 0);
  const diagGo = windowComplete && windowUnaccounted.length === 0 && g2Pass
    && perSeed.every(p => p.diagErrs === 0 && p.overflowN === 0);
  // An honest unaccounted remainder with candidates still counts
  // as DIAG-GO ONLY if no change is silently dropped (window
  // complete + every step listed). verdictDetail distinguishes
  // fully-accounted from honest-remainder GO.
  const verdict = (windowComplete && g2Pass && perSeed.every(p => p.diagErrs === 0 && p.overflowN === 0)) ? 'DIAG-GO' : 'DIAG-NO-GO';
  const verdictDetail = verdict === 'DIAG-GO'
    ? (windowUnaccounted.length === 0 ? 'fully-accounted' : 'honest-remainder')
    : 'trace-incomplete-or-gates-failed';
  const report = {
    label: 'sim-seq51gap-a', seeds: SEEDS, days: 180, perSeed: perSeed,
    gates: { g2RecorderNeutrality: g2, g2Pass: g2Pass, corpusOk: corpusOk, rebaselineExact: rebaselineExact, diffVs1920: diff1920, costBar: costBar },
    baselineBand: baselineBand, armedBand: armedBand, band1920: BAND1920,
    target: { seed: 73672, seq: 51, windowSteps: windowSteps, windowDaysPresent: windowDaysPresent, windowComplete: windowComplete, windowUnaccounted: windowUnaccounted },
    bandUnaccountedDrops: bandUnaccountedDrops, bandUnaccountedRises: bandUnaccountedRises,
    verdict: verdict, verdictDetail: verdictDetail, diagGo: diagGo,
    verdictRule: 'DIAG-GO iff every d143-d148 day appears in the seq51 trace, every window change is listed (accounted to C1-C6 or explicitly UNACCOUNTED with amount + candidates), G2 neutrality holds, and recorder errors/overflow are zero. A trace with missing days or dropped changes is DIAG-NO-GO.',
    generated: new Date().toISOString(),
  };
  const summaryPath = path.join(evidDir, 'summary.json');
  writeFileRetry(summaryPath, JSON.stringify(report, null, 1) + '\n');
  console.log('\n=== sim-seq51gap-a ===');
  console.log(`  baseline: n=${baselineBand.n} won=${baselineBand.won} medD=${baselineBand.medianDays} natEver=${baselineBand.nationalEver} natFinal=${baselineBand.nationalFinal} table=${baselineBand.table} entered=${baselineBand.entered} wave4=${baselineBand.wave4} wave5=${baselineBand.wave5} starv=${baselineBand.starvationTotal} deaths=${baselineBand.deathTotal}`);
  console.log(`  armed:    n=${armedBand.n} won=${armedBand.won} medD=${armedBand.medianDays} natEver=${armedBand.nationalEver} natFinal=${armedBand.nationalFinal} table=${armedBand.table} entered=${armedBand.entered} wave4=${armedBand.wave4} wave5=${armedBand.wave5} starv=${armedBand.starvationTotal} deaths=${armedBand.deathTotal}`);
  console.log(`  rebaseline vs 1920Z: ${rebaselineExact ? 'EXACT' : 'DIFF ' + JSON.stringify(diff1920)}`);
  console.log(`  G2 recorder neutrality: ${g2Pass ? 'PASS' : 'FAIL'} (${g2.filter(x => x.ok).length}/${g2.length}; faced ${g2.filter(x => x.facedOk).length}/${g2.length}, kills ${g2.filter(x => x.killsOk).length}/${g2.length})`);
  console.log(`  corpus: ${corpusOk ? 'PASS' : 'FAIL'}; costBar starvationOk=${costBar.starvationOk} medianOk=${costBar.medianOk}`);
  for (const p of perSeed) {
    console.log(`  seed ${p.seed}: field4=${p.field4} waveField4=${p.waveField4} match=${p.fieldCountMatch} tbInits4=${p.tbInits4} unjoined=${p.tbUnjoined.length} diagErrs=${p.diagErrs} overflow=${p.overflowN} sumFail=${p.sumFail} seqs=${p.seqs.join(',')} unaccDrops=${p.bandUnaccountedDrops} unaccRises=${p.bandUnaccountedRises} w4kills=${p.w4kills}`);
  }
  console.log(`  TARGET 73672 seq51 window d143-d148: daysPresent=${JSON.stringify(windowDaysPresent)} complete=${windowComplete}`);
  for (const s of windowSteps) console.log(`    window step ${s.fromKind} d${s.fromDay} ${s.fromHp} -> ${s.toKind} d${s.toDay} ${s.toHp} (${s.delta}) ${s.cause} :: ${s.detail}`);
  if (targetTrace) {
    console.log(`  TARGET full seq51 obs (d131-d150):`);
    for (const o of targetTrace.obs) if (o.day >= 131 && o.day <= 150) console.log(`    obs d${o.day} ${o.kind} hp=${o.hp} maxHp=${o.maxHp} tile=${o.tx},${o.ty} ling=${o.lingering} raidDay=${o.lastRaidDay} tier=${o.havenTier}`);
    console.log(`  TARGET seq51 steps (all):`);
    for (const s of targetTrace.steps) console.log(`    step ${s.fromKind} d${s.fromDay} ${s.fromHp} -> ${s.toKind} d${s.toDay} ${s.toHp} (${s.delta}) ${s.cause}`);
  }
  console.log(`  band unaccounted: drops=${bandUnaccountedDrops} rises=${bandUnaccountedRises}`);
  console.log(`  VERDICT ${verdict} (${verdictDetail}) -> ${summaryPath}`);
  if (!g2Pass || !corpusOk) { console.error('PROOF GATE FAILURE'); process.exit(1); }
}

async function sweepMode() {
  const evidDir = evidDirOf();
  fs.mkdirSync(evidDir, { recursive: true });
  const pids = (process.env.PIDS || 'baseline,armed').split(',').map(s => s.trim()).filter(Boolean);
  for (const pid of pids) {
    for (const seed of SEEDS) {
      console.log(`--- ${pid} seed ${seed} ---`);
      const out = execFileSync('node', [path.join(REPO, 'scripts', 'test-seq51gap-diag-sweep.js'), '--one', pid, String(seed)],
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
    const t51 = traceSeq(row, 51);
    const wsteps = t51.steps.filter(s => s.toDay >= 143 && s.toDay <= 148);
    line += ` ticks=${row.seq51gap.ticks.length} seq51obs=${t51.obs.length} seq51steps=${t51.steps.length} windowSteps=${wsteps.length} unaccDrops=${t51.unaccountedDrops}`;
  }
  console.log(`  [${pid} seed ${seed}] ${line}`);
}

async function detgateMode() {
  const seed = parseInt(process.env.SEED || '73671', 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const c = await runOne('baseline', seed, days, null);
  delete process.env.W4DMG; delete process.env.WAVE4ENC; delete process.env.SPAWNSRC; delete process.env.FIELDFINISH; delete process.env.NONWORLDKILL; delete process.env.SEQ51GAP;
  process.env.LEANLINKRESCUE = '1'; process.env.TABLESEATNOWAIT = '1';
  const w4dmgStore = newW4dmgStore(), waveStore = newWaveStore(), spawnStore = newSpawnStore(), ffStore = newFFStore(), nwkStore = newNwkStore(), gapStore = newGapStore();
  const wrapped = withSeq51gapDiag(
    withNonworldkillDiag(
      withFieldfinishDiag(
        withSpawnsrcDiag(
          withWave4encDiag(
            withW4dmgDiag(tableseatNowait, 'w4dmg-diag', 'tableseat-nowait + wave-4 damage decomposition recorder', w4dmgStore),
            'wave4enc-diag', 'tableseat-nowait + wave-4 field spawn-link recorder', waveStore),
          'spawnsrc-diag', 'tableseat-nowait + spawn-source census', spawnStore),
        'fieldfinish-diag', 'tableseat-nowait + wounded field-finish recorder', ffStore),
      'nonworldkill-diag', 'tableseat-nowait + TB initiation census', nwkStore),
    'seq51gap-diag', 'tableseat-nowait + daily world-entity HP tick recorder', gapStore);
  const { Game } = await loadGame({ seed, mode: 'seq51gap-diag-detgate', fullTelemetry: false });
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
  const hasDiagSurface = !!(capturedCtx && (capturedCtx._w4dmg || capturedCtx._wave4enc || capturedCtx._spawnsrc || capturedCtx._fieldfinishdiag || capturedCtx._nonworldkill || capturedCtx._seq51gap));
  const wrapsInstalled = !!Game._w4dmgDiagInstalled || !!Game._wave4encDiagInstalled || !!Game._spawnsrcDiagInstalled || !!Game._fieldfinishDiagInstalled || !!Game._nonworldkillDiagInstalled || !!Game._seq51gapDiagInstalled;
  const gapTicks = gapStore.ticks.length;
  const ok = c.days === result.days && c.gameDays === result.gameDays
    && JSON.stringify(ts) === JSON.stringify(c.ts) && !hasDiagSurface && !wrapsInstalled && gapTicks === 0;
  console.log(`DETGATE seed=${seed} baseline days=${c.days} gameDays=${c.gameDays} ts=${JSON.stringify(c.ts)} | wrapped(recorders OFF) days=${result.days} gameDays=${result.gameDays} ts=${JSON.stringify(ts)} diagSurface=${hasDiagSurface} wrapsInstalled=${wrapsInstalled} gapTicks=${gapTicks} -> ${ok ? 'PASS' : 'FAIL'}`);
  if (!ok) process.exit(1);
}

async function detailMode(seedArg) {
  const seed = parseInt(process.env.DETAIL_SEED || seedArg || '73672', 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const evidDir = evidDirOf();
  let census = null;
  try { census = JSON.parse(fs.readFileSync(path.join(evidDir, `s${seed}-armed.json`), 'utf8')); } catch (e) { census = null; }
  const row = await runOne('armed', seed, days, null);
  const a = traceSeq(row, 51);
  const same = !!census && census.days === row.days && census.gameDays === row.gameDays
    && JSON.stringify(census.ts) === JSON.stringify(row.ts)
    && JSON.stringify(traceSeq(census, 51).steps) === JSON.stringify(a.steps);
  console.log(`DETAIL-REPRO seed=${seed} days=${row.days} gameDays=${row.gameDays} censusMatch=${same} seq51steps=${a.steps.length} unaccDrops=${a.unaccountedDrops}`);
  if (!same) { console.error('DETAIL REPRODUCTION FAILURE'); process.exit(1); }
  console.log('DETAIL seq51 obs:');
  for (const o of a.obs) console.log(`DETAIL obs d${o.day} ${o.kind} hp=${o.hp} maxHp=${o.maxHp} tile=${o.tx},${o.ty} ling=${o.lingering} raidDay=${o.lastRaidDay} tier=${o.havenTier}`);
  console.log('DETAIL seq51 steps:');
  for (const s of a.steps) console.log(`DETAIL step ${s.fromKind} d${s.fromDay} ${s.fromHp} -> ${s.toKind} d${s.toDay} ${s.toHp} (${s.delta}) ${s.cause} :: ${s.detail}`);
}

async function senseMode(seedArg) {
  const seed = parseInt(process.env.SENSE_SEED || seedArg || '73672', 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const out = process.env.SENSE_OUT || path.join(REPO, 'evidence', '2026-10-26', 'sim-seq51gap-a-sense.txt');
  process.env.LEANLINKRESCUE = '1'; process.env.TABLESEATNOWAIT = '1';
  process.env.W4DMG = '1'; process.env.WAVE4ENC = '1'; process.env.SPAWNSRC = '1'; process.env.FIELDFINISH = '1'; process.env.NONWORLDKILL = '1'; process.env.SEQ51GAP = '1';
  const w4dmgStore = newW4dmgStore(), waveStore = newWaveStore(), spawnStore = newSpawnStore(), ffStore = newFFStore(), nwkStore = newNwkStore(), gapStore = newGapStore();
  const armed = withSeq51gapDiag(
    withNonworldkillDiag(
      withFieldfinishDiag(
        withSpawnsrcDiag(
          withWave4encDiag(
            withW4dmgDiag(tableseatNowait, 'w4dmg-diag', 'tableseat-nowait + wave-4 damage decomposition recorder', w4dmgStore),
            'wave4enc-diag', 'tableseat-nowait + wave-4 field spawn-link recorder', waveStore),
          'spawnsrc-diag', 'tableseat-nowait + spawn-source census', spawnStore),
        'fieldfinish-diag', 'tableseat-nowait + wounded field-finish recorder', ffStore),
      'nonworldkill-diag', 'tableseat-nowait + TB initiation census', nwkStore),
    'seq51gap-diag', 'tableseat-nowait + daily world-entity HP tick recorder', gapStore);
  const { Game } = await loadGame({ seed, mode: 'seq51gap-diag-sense', fullTelemetry: false, narration: true });
  const t = {};
  const uninstall = PI.install(Game, t);
  await setupGame(Game);
  try { installW4dmgDiag(Game, w4dmgStore); } catch (e) {}
  try { installWave4encDiag(Game, waveStore); } catch (e) {}
  try { installSpawnsrcDiag(Game, spawnStore); } catch (e) {}
  try { installFieldfinishDiag(Game, ffStore); } catch (e) {}
  try { installNonworldkillDiag(Game, nwkStore); } catch (e) {}
  try { installSeq51gapDiag(Game, gapStore); } catch (e) {}
  let result;
  await quietLog(async () => { result = await runDays(Game, armed, { days, manifest: undefined, sampleEvery: 30 }); });
  try { uninstall(); } catch (e) {}
  const ring = t.sayRing || [];
  let pg = {};
  try { pg = Game.progState ? Game.progState() : {}; } catch (e) {}
  let dmgLine = 'seq51gap: unavailable';
  try {
    const tr = traceSeq({ seq51gap: { ticks: gapStore.ticks }, w4dmg: { fieldFights: w4dmgStore.fieldFights, tbEnds: w4dmgStore.tbEnds }, nonworldkill: { starts: nwkStore.starts } }, 51);
    dmgLine = `seq51gap (SENSE-ONLY, non-measured): seq51 obs=${tr.obs.length} steps=${tr.steps.length} unaccDrops=${tr.unaccountedDrops}`;
  } catch (e) { dmgLine = 'seq51gap error: ' + String((e && e.message) || e).slice(0, 160); }
  const header = [
    'SENSE-ONLY REPLAY — NON-MEASURED (narration shifts trajectories; never enters the census)',
    `seed=${seed} policy=tableseat-nowait+seq51gap-diag days=${result.days} gameDays=${result.gameDays} endReason=${result.endReason} maxWave=${result.maxWaveUnlocked} sayLive=${!!t.sayLive} ringLines=${ring.length} tableWaiting=${!!pg.tableWaiting} tableDone=${!!pg.tableDone}`,
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
if (require.main === module) main().catch(e => { console.error('SEQ51GAP-DIAG SWEEP FAILED:', (e && e.stack) || e); process.exit(1); });
module.exports = { runOne, traceSeq, buildObservations, classifyStep, wave4Seqs, bandOf, BAND1920, SEEDS };
