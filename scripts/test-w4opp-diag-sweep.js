#!/usr/bin/env node
// scripts/test-w4opp-diag-sweep.js — sim-w4opp-a sweep
// (scale-onramp axis, 2026-10-26, arm sim-w4opp-a. DIAG /
// MEASUREMENT ONLY, zero src/js changes.)
//
// Substrate: tableseat-nowait (LEANLINKRESCUE=1, TABLESEATNOWAIT=1),
// seeds 73671-73678, 180d death-aware horizon. One process per seed
// (default mode spawns --one children; a vanished parent cannot take
// the corpus with it — every row is written incrementally).
//
// Baseline: plain tableseat-nowait, post-run pure-read snapshot
// (deed feed wavesFaced + waveKillLog, no event lists).
// Armed: tableseat-nowait wrapped with five observational recorders
// (innermost first): wave4enc-diag (field-fight rows carrying the spawn
// sequence read off the entity), spawnsrc-diag (spawn births with
// _spawnSeq tags), fieldfinish-diag (field rows + tbEnd rows, verbatim
// reuse), nonworldkill-diag (tb starts with tile-monster seq + tb ends
// joined by fightId, verbatim reuse), w4opp-diag (spawn life-history
// snapshots + removal hints, outermost so its daily snapshot runs
// last). All recorders record after delegating, draw no RNG, never
// throw into the engine.
// Modes:
//   --one <pid> <seed> : run one seed, write s<seed>-<pid>.json.
//   (default)          : run all pids x seeds via --one children,
//                        then --summary.
//   --summary          : rebuild summary.json from the rows on disk
//                        (resume-safe; also the gate/verdict step).
//   --detgate          : recorder-unset == unwrapped on one seed.
//   --detail <seed>    : re-run armed on one seed, census-match check.
//   --sense <seed>     : NON-MEASURED narration replay (never census).
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const {
  newStore: newW4oppStore, installW4oppDiag, withW4oppDiag,
} = require('./policies/w4opp-diag');
const { tableseatNowait } = require('./policies/tableseat-nowait');
const { copyKillLog } = require('./policies/vetkill-diag');
const {
  newStore: newWaveStore, installWave4encDiag, withWave4encDiag,
} = require('./policies/wave4enc-diag');
const {
  newStore: newSpawnStore, installSpawnsrcDiag, withSpawnsrcDiag,
} = require('./policies/spawnsrc-diag');
const {
  newStore: newFFStore, installFieldfinishDiag, withFieldfinishDiag, analyzeFieldFights,
} = require('./policies/fieldfinish-diag');
const {
  newStore: newNwkStore, installNonworldkillDiag, withNonworldkillDiag, classifyStart,
} = require('./policies/nonworldkill-diag');
const PI = require('./postunlock-instrument');

const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
const STARV_RE = /starv|hunger/i;
const SEEDS = (process.env.SEEDS || '73671,73672,73673,73674,73675,73676,73677,73678')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
// 1920Z band table (the re-baseline judge, from sim-wave4enc-a.md:
// the 1920 run's own baseline column).
const BAND1816 = { wins: 2, nationalEver: 6, nationalFinal: 5, entered: 2, wave4: 6, wave5: 0, medianDays: 152, deaths: 307, starvation: 1 };
// 1920Z per-seed baseline (from sim-wave4enc-a.md 'this run (baseline)').
const BASE1920 = {
  73671: { days: 180, end: 'survived', wave: 4, deaths: 48 },
  73672: { days: 180, end: 'survived', wave: 4, deaths: 51 },
  73673: { days: 124, end: 'lost', wave: 4, deaths: 32, nationalFinal: 1, ranks: 'global/global' },
  73674: { days: 142, end: 'won-lesser', wave: 3, deaths: 28, won: 1, table: 1, entered: 1, ranks: 'national' },
  73675: { days: 180, end: 'survived', wave: 4, deaths: 26 },
  73676: { days: 144, end: 'won', wave: 4, deaths: 43 },
  73677: { days: 152, end: 'lost', wave: 4, deaths: 41, table: 1, entered: 0, ranks: 'regional/global' },
  73678: { days: 104, end: 'lost', wave: 3, deaths: 38, starvation: 1 },
};

function waveOfForFinal(m) {
  // spawnWorldMonster always sets m.wave (see game.js); no Game read
  // needed for the post-run pool check.
  try { if (m && m.wave != null && isFinite(m.wave)) return m.wave | 0; } catch (e) {}
  return 1;
}
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
function evidDirOf() { return process.env.EVID || path.join(REPO, 'evidence', '2026-10-26', 'perseed-w4opp-a'); }
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
  let waveStore = null, spawnStore = null, ffStore = null, nwkStore = null, w4oppStore = null;
  let base = tableseatNowait;
  if (pid === 'armed') {
    process.env.WAVE4ENC = '1'; process.env.SPAWNSRC = '1'; process.env.FIELDFINISH = '1'; process.env.NONWORLDKILL = '1'; process.env.W4OPP = '1';
    waveStore = newWaveStore(); spawnStore = newSpawnStore(); ffStore = newFFStore(); nwkStore = newNwkStore(); w4oppStore = newW4oppStore();
    base = withW4oppDiag(
      withNonworldkillDiag(
        withFieldfinishDiag(
          withSpawnsrcDiag(
            withWave4encDiag(tableseatNowait, 'wave4enc-diag', 'tableseat-nowait + wave-4 field spawn-link recorder', waveStore),
            'spawnsrc-diag', 'tableseat-nowait + spawn-source census', spawnStore),
          'fieldfinish-diag', 'tableseat-nowait + wounded field-finish recorder', ffStore),
        'nonworldkill-diag', 'tableseat-nowait + TB initiation census', nwkStore),
      'w4opp-diag', 'tableseat-nowait + wave-4 spawn opportunity recorder', w4oppStore);
  } else {
    delete process.env.WAVE4ENC; delete process.env.SPAWNSRC; delete process.env.FIELDFINISH; delete process.env.NONWORLDKILL; delete process.env.W4OPP; delete process.env.W4OPP;
  }
  const { Game } = await loadGame({ seed, mode: 'w4opp-diag-' + pid, fullTelemetry: false });
  await setupGame(Game);
  if (pid === 'armed') {
    try { installWave4encDiag(Game, waveStore); } catch (e) {}
    try { installSpawnsrcDiag(Game, spawnStore); } catch (e) {}
    try { installFieldfinishDiag(Game, ffStore); } catch (e) {}
    try { installNonworldkillDiag(Game, nwkStore); } catch (e) {}
    try { installW4oppDiag(Game, w4oppStore); } catch (e) {}
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
    row.w4opp = {
      snaps: w4oppStore.snaps, removals: w4oppStore.removals,
      diag: { errs: w4oppStore.errs, errors: w4oppStore.errors, overflow: w4oppStore.overflow, installed: w4oppStore.installed },
    };
    // Post-run pure read: which wave-4 entities are STILL on the board.
    // (Tags exist only on the armed arm — spawnsrc installed the tags.)
    try {
      const pool = (typeof Game.worldMonsters === 'function') ? Game.worldMonsters() : [];
      row.finalW4 = pool.filter(m => {
        try { return waveOfForFinal(m) === 4; } catch (e) { return false; }
      }).map(m => ({ seq: (m._spawnSeq != null) ? (m._spawnSeq | 0) : null, type: m.id || null, tx: m.tx, ty: m.ty }));
    } catch (e) { row.finalW4 = []; row.finalW4Error = String((e && e.message) || e).slice(0, 120); }
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

// classifySeed(row): the pre-registered partition over one armed row.
// Returns per-seed classification + cross-checks + fieldfinish counts.
function classifySeed(row) {
  const spawns4 = (row.spawnsrc.spawns || []).filter(s => (s.wave | 0) === 4);
  const field4 = (row.wave4enc.fieldFights || []).filter(f => (f.wave | 0) === 4);
  const ffField4 = (row.fieldfinish.fieldFights || []).filter(f => (f.wave | 0) === 4);
  // Join tb starts to tb ends by fightId (analyzeNonworldkill returns
  // counts only, so the join is built here from its classifyStart —
  // same precedence, same excluded set: table-trial/refused/thrown).
  const classifiedStarts = (row.nonworldkill.starts || []).map(s => ({ start: s, cls: classifyStart(s) }));
  const initiations = classifiedStarts.filter(c => !c.cls.excluded);
  const startByFightId = {};
  for (const c of initiations) if (c.start.fightId) startByFightId[c.start.fightId] = c;
  const endsJoined = (row.nonworldkill.ends || []).map(e => {
    const c = (e.fightId && startByFightId[e.fightId]) || null;
    return { end: e, start: c ? c.start : null, cls: c ? c.cls : null, directBuild: !c };
  });
  const nwk = { initiations: initiations, endsJoined: endsJoined };
  const inits4 = initiations.filter(c => ((c.start.wave | 0) === 4));
  const endByFightId = {};
  for (const j of endsJoined) if (j.end.fightId) endByFightId[j.end.fightId] = j;
  // Field classes.
  const fieldByOutcome = {};
  const fieldClasses = {};
  for (const f of field4) {
    let cls;
    if (f.outcome === 'vKill') cls = 'field-kill';
    else if (f.outcome === 'vDie') cls = 'field-lose';
    else if (f.outcome === 'vFlee') cls = 'field-flee-villager';
    else if (f.outcome === 'mFlee') cls = 'field-flee-monster';
    else if (f.outcome === 'evade') cls = 'field-evade';
    else cls = 'field-other:' + String(f.outcome);
    fieldByOutcome[f.outcome || 'null'] = (fieldByOutcome[f.outcome || 'null'] || 0) + 1;
    fieldClasses[cls] = (fieldClasses[cls] || 0) + 1;
  }
  // Field mFlee subcounts.
  const mflee = field4.filter(f => f.outcome === 'mFlee');
  const mfleeSub = {
    r0BelowLine: mflee.filter(f => (f.rounds | 0) === 0 && f.startFrac != null && f.startFrac < 0.15).length,
    r0Other: mflee.filter(f => (f.rounds | 0) === 0 && !(f.startFrac != null && f.startFrac < 0.15)).length,
    inRound: mflee.filter(f => (f.rounds | 0) >= 1).length,
    volleyDriveOff: mflee.filter(f => (f.rounds | 0) === 0 && f.startFrac != null && f.startFrac >= 0.15).length,
  };
  // Tb classes.
  const tbClasses = {};
  const tbDetail = [];
  for (const c of inits4) {
    const j = c.start.fightId ? endByFightId[c.start.fightId] : null;
    const end = j ? j.end : null;
    const newW4 = end ? (end.newLog || []).filter(k => (k.w | 0) === 4) : [];
    let cls;
    if (newW4.length) cls = 'player-tb-kill';
    else if (end && (end.result === 'lost' || end.result === 'fled' || end.result === 'routed')) cls = 'player-tb-lose-or-rout';
    else if (end) cls = 'player-tb-other:' + String(end.result);
    else cls = 'player-tb-unended';
    tbClasses[cls] = (tbClasses[cls] || 0) + 1;
    tbDetail.push({
      day: c.start.day, arg: c.start.arg, mid: c.start.mid, door: c.cls.door,
      tileSeq: (c.start.tileMonster && c.start.tileMonster.seq != null) ? c.start.tileMonster.seq : null,
      tileMid: (c.start.tileMonster && c.start.tileMonster.id) || null,
      fightId: c.start.fightId, endResult: end ? end.result : null,
      killsW4: newW4.length, cls: cls,
    });
  }
  // Direct-build tb ends with wave-4 kills but no start (fieldfinish
  // tbFights corroboration is separate; nonworldkill direct-build
  // ends are other-named tb events, never silently dropped).
  const directW4Ends = nwk.endsJoined.filter(j => j.directBuild && (j.end.newLog || []).some(k => (k.w | 0) === 4));
  for (const j of directW4Ends) {
    const cls = 'player-tb-other:direct-build';
    tbClasses[cls] = (tbClasses[cls] || 0) + 1;
    tbDetail.push({ day: j.end.day, arg: null, mid: null, door: 'direct-build', tileSeq: null, tileMid: null, fightId: j.end.fightId, endResult: j.end.result, killsW4: (j.end.newLog || []).filter(k => (k.w | 0) === 4).length, cls: cls });
  }
  // Spawn partition.
  const fieldSeqs = new Set(field4.filter(f => f.seq != null).map(f => f.seq));
  const tbTileSeqs = new Set(inits4.filter(c => c.start.tileMonster && c.start.tileMonster.seq != null).map(c => c.start.tileMonster.seq));
  const neverFought = spawns4.filter(s => !fieldSeqs.has(s.seq) && !tbTileSeqs.has(s.seq));
  const foughtSpawns = spawns4.filter(s => fieldSeqs.has(s.seq) || tbTileSeqs.has(s.seq));
  const fieldUnlinked = field4.filter(f => f.seq == null).length;
  // Same-type UNLINKED tb events after a never-fought spawn (the
  // unlinked limit, stated honestly: a tb event seq-linked to a
  // DIFFERENT spawn of the same type does not make this spawn
  // ambiguous — only a tileSeq-null tb event of the type could be
  // this spawn in disguise).
  const tbMidsAfter = {};
  for (const s of neverFought) {
    const hasTbOfType = inits4.some(c => c.start.mid === s.type && (c.start.day | 0) >= (s.day | 0)
      && !(c.start.tileMonster && c.start.tileMonster.seq != null));
    tbMidsAfter[s.seq] = !!hasTbOfType;
  }
  const neverFoughtWithTypeTb = neverFought.filter(s => tbMidsAfter[s.seq]).length;
  // Faced types + kill cross-checks.
  const faced4Types = Object.keys(row.faced || {}).filter(m => (row.faced[m] | 0) === 4);
  const facedCovered = {};
  for (const t of faced4Types) {
    facedCovered[t] = field4.some(f => f.mid === t) || inits4.some(c => c.start.mid === t);
  }
  const kills4 = (row.logEntries || []).filter(e => (e.w | 0) === 4);
  const killMatched = kills4.map(e => {
    const byField = field4.some(f => f.outcome === 'vKill' && (f.day | 0) === (e.d | 0) && f.mid === e.mid);
    const byTb = nwk.endsJoined.some(j => (j.end.newLog || []).some(k => (k.d | 0) === (e.d | 0) && k.mid === e.mid && (k.w | 0) === 4 && String(k.by) === String(e.by) && String(k.via) === String(e.via)));
    return { d: e.d, mid: e.mid, by: e.by, via: e.via, matched: !!(byField || byTb), byField: byField, byTb: byTb };
  });
  const killsUnmatched = killMatched.filter(k => !k.matched);
  // Fieldfinish question on the wave-4 subset.
  const ffAnalysis = analyzeFieldFights(field4);
  const belowLine = field4.filter(f => f.startFrac != null && f.startFrac < 0.15);
  const zeroRoundFlights = belowLine.filter(f => (f.rounds | 0) === 0 && f.outcome === 'mFlee');
  const oneHpArrivals = belowLine.filter(f => (f.startHp | 0) === 1);
  const oneHpZeroFlights = zeroRoundFlights.filter(f => (f.startHp | 0) === 1);
  const strictRepeats = ffAnalysis.woundedRepeats;
  // Partition totals (exactly-once accounting).
  const classes = Object.assign({}, fieldClasses, {});
  for (const k of Object.keys(tbClasses)) classes[k] = (classes[k] || 0) + tbClasses[k];
  classes['spawned-never-fought'] = neverFought.length;
  const partitionTotal = field4.length + inits4.length + directW4Ends.length + neverFought.length;
  // Dominant class over the full partition.
  let dominant = null, dominantN = 0;
  for (const k of Object.keys(classes)) if (classes[k] > dominantN) { dominant = k; dominantN = classes[k]; }
  const diagErrs = (row.wave4enc.diag.errs | 0) + (row.spawnsrc.diag.errs | 0) + (row.fieldfinish.diag.errs | 0) + (row.nonworldkill.diag.errs | 0);
  const overflowN = (row.wave4enc.diag.overflow.fieldFights | 0) + (row.spawnsrc.diag.overflow.spawns | 0) + (row.fieldfinish.diag.overflow.fieldFights | 0) + (row.fieldfinish.diag.overflow.tbFights | 0) + (row.nonworldkill.diag.overflow.starts | 0) + (row.nonworldkill.diag.overflow.ends | 0);
  const checks = {
    killsMatched: killsUnmatched.length === 0,
    facedCovered: faced4Types.every(t => facedCovered[t]),
    fieldCountMatch: field4.length === ffField4.length,
    diagClean: diagErrs === 0 && overflowN === 0,
  };
  const fullyTraced = checks.killsMatched && checks.facedCovered && checks.fieldCountMatch && checks.diagClean;
  // Per-type field sequences (for the evidence narrative).
  const perType = {};
  for (const f of field4) {
    (perType[f.mid] = perType[f.mid] || []).push(f);
  }
  const perTypeSummary = {};
  for (const mid of Object.keys(perType).sort()) {
    const rows = perType[mid];
    const byO = {};
    for (const f of rows) byO[f.outcome || 'null'] = (byO[f.outcome || 'null'] || 0) + 1;
    perTypeSummary[mid] = {
      fieldFights: rows.length, byOutcome: byO,
      spawns: spawns4.filter(s => s.type === mid).length,
      firstSpawnDay: (spawns4.filter(s => s.type === mid).map(s => s.day | 0).sort((a, b) => a - b)[0] ?? null),
      firstFightDay: rows.map(f => f.day | 0).sort((a, b) => a - b)[0],
      seqLinked: rows.filter(f => f.seq != null).length,
    };
  }
  return {
    seed: row.seed,
    spawns4: spawns4.length, field4: field4.length, ffField4: ffField4.length,
    tbInits4: inits4.length, directW4Ends: directW4Ends.length,
    neverFought: neverFought.length, neverFoughtWithTypeTb: neverFoughtWithTypeTb,
    foughtSpawns: foughtSpawns.length, fieldUnlinked: fieldUnlinked,
    fieldByOutcome: fieldByOutcome, mfleeSub: mfleeSub,
    fieldClasses: fieldClasses, tbClasses: tbClasses, classes: classes,
    partitionTotal: partitionTotal, dominant: dominant, dominantN: dominantN,
    faced4Types: faced4Types, facedCovered: facedCovered,
    kills4: kills4.length, killsUnmatched: killsUnmatched,
    fieldfinish: {
      belowLineArrivals: belowLine.length, zeroRoundFlights: zeroRoundFlights.length,
      oneHpArrivals: oneHpArrivals.length, oneHpZeroFlights: oneHpZeroFlights.length,
      strictWoundedRepeats: strictRepeats.length,
      strictDetail: strictRepeats.map(r => ({ day: r.fight.day, mid: r.fight.mid, vid: r.fight.vid, startHp: r.fight.startHp, startFrac: r.fight.startFrac, endHp: r.fight.endHp, prevEndHp: r.prevEndHp, prevOutcome: r.prevOutcome })),
      answerYes: zeroRoundFlights.length >= 1,
    },
    checks: checks, fullyTraced: fullyTraced,
    diagErrs: diagErrs, overflowN: overflowN,
    opp: classifyOpportunity({
      spawns4: spawns4, neverFought: neverFought, foughtSpawns: foughtSpawns,
      field4: field4, inits4: inits4,
      snaps: (row.w4opp && row.w4opp.snaps) || [],
      removals: (row.w4opp && row.w4opp.removals) || [],
      finalW4: row.finalW4 || [],
      horizonDays: row.days,
      w4oppDiag: (row.w4opp && row.w4opp.diag) || {},
    }),
    tbDetail: tbDetail,
    perTypeSummary: perTypeSummary,
    neverFoughtDetail: neverFought.map(s => ({ day: s.day, seq: s.seq, type: s.type, src: s.src, typeTbAfter: !!tbMidsAfter[s.seq] })),
    spawns4Detail: spawns4.map(s => ({ day: s.day, seq: s.seq, type: s.type, src: s.src })),
  };
}

// classifyOpportunity(input): the w4opp partition over the never-fought
// set. Primary classes (precedence order — first match wins, so the
// classes are disjoint and exhaustive over neverFought):
//   1. contact-without-fight: >= 1 post-tick snapshot in villager range
//      (that tick's villagerMonsterTick ran with them co-located and no
//      fight followed) OR >= 1 snapshot with player gridDist == 0.
//   2. in-range-never-met: in range (villager same-tile on daily
//      snapshots only, or player same tile with gridDist == 1) but never
//      contact as defined above.
//   3. never-in-range: no snapshot in villager range or player range.
// Removal cause, present-at-end, reappearance, and snapshot coverage
// are cross-tabs, NOT classes (a removal class would double-count).
// Fought-spawn contrast: for each fought spawn, spawn distance-to-
// Haven (first snapshot), days spawn -> first fight, range/contact
// seen before the first fight, and channel (field / tb / both).
function classifyOpportunity(input) {
  const spawns4 = input.spawns4 || [];
  const neverFought = input.neverFought || [];
  const foughtSpawns = input.foughtSpawns || [];
  const field4 = input.field4 || [];
  const inits4 = input.inits4 || [];
  const snaps = input.snaps || [];
  const removals = input.removals || [];
  const horizonDays = input.horizonDays || 0;
  const w4oppDiag = input.w4oppDiag || {};
  const finalSeqs = new Set((input.finalW4 || []).filter(f => f.seq != null).map(f => f.seq));
  const snapsBySeq = new Map();
  let nullSeqSnaps = 0;
  for (const sn of snaps) {
    if (sn.seq == null) { nullSeqSnaps++; continue; }
    if (!snapsBySeq.has(sn.seq)) snapsBySeq.set(sn.seq, []);
    snapsBySeq.get(sn.seq).push(sn);
  }
  const removalsBySeq = new Map();
  const removals4 = removals.filter(r => (r.wave | 0) === 4);
  for (const r of removals4) {
    if (r.seq == null) continue;
    if (!removalsBySeq.has(r.seq) || (r.day | 0) < (removalsBySeq.get(r.seq).day | 0)) removalsBySeq.set(r.seq, r);
  }
  const removalCauseOf = (r) => {
    if (!r) return null;
    const hint = String(r.hint || '');
    return hint ? hint.split(',')[0] : 'unknown';
  };
  const perSpawn = [];
  const classes = { 'contact-without-fight': 0, 'in-range-never-met': 0, 'never-in-range': 0 };
  const rangeKinds = {};
  const removalCauses = {};
  let removedNeverFought = 0, presentAtEnd = 0, reappeared = 0, zeroSnap = 0;
  let removedBeforeRange = 0;
  for (const s of neverFought) {
    const mySnaps = snapsBySeq.get(s.seq) || [];
    const everVillager = mySnaps.some(sn => !!sn.villagerRange);
    const everPlayer = mySnaps.some(sn => !!sn.playerRange);
    const contact = mySnaps.some(sn => !!sn.contactVillager || !!sn.contactPlayer);
    const tickVillager = mySnaps.some(sn => sn.source === 'tick' && !!sn.villagerRange);
    const dailyVillager = mySnaps.some(sn => sn.source === 'daily' && !!sn.villagerRange);
    let cls;
    if (contact) cls = 'contact-without-fight';
    else if (everVillager || everPlayer) cls = 'in-range-never-met';
    else cls = 'never-in-range';
    classes[cls]++;
    const rangeKind = !everVillager && !everPlayer ? 'none' : (everVillager && everPlayer ? 'both' : (everVillager ? 'villager-only' : 'player-only'));
    rangeKinds[rangeKind] = (rangeKinds[rangeKind] || 0) + 1;
    const removal = removalsBySeq.get(s.seq) || null;
    const cause = removalCauseOf(removal);
    if (removal) {
      removedNeverFought++;
      removalCauses[cause] = (removalCauses[cause] || 0) + 1;
      if (!everVillager && !everPlayer) removedBeforeRange++;
    }
    const present = finalSeqs.has(s.seq);
    if (present) presentAtEnd++;
    const reapp = !!(removal && (present || mySnaps.some(sn => (sn.day | 0) > (removal.day | 0))));
    if (reapp) reappeared++;
    if (!mySnaps.length) zeroSnap++;
    let minNearest = null, minPlayerTiles = null, firstSnapDay = null, lastSnapDay = null, spawnDistHaven = null;
    for (const sn of mySnaps) {
      if (firstSnapDay == null || (sn.day | 0) < firstSnapDay) { firstSnapDay = sn.day | 0; spawnDistHaven = sn.distHaven; }
      if (lastSnapDay == null || (sn.day | 0) > lastSnapDay) lastSnapDay = sn.day | 0;
      if (sn.nearestVillagerDist != null && (minNearest == null || sn.nearestVillagerDist < minNearest)) minNearest = sn.nearestVillagerDist;
      if (sn.distPlayerTiles != null && (minPlayerTiles == null || sn.distPlayerTiles < minPlayerTiles)) minPlayerTiles = sn.distPlayerTiles;
    }
    const endDay = present ? horizonDays : (lastSnapDay != null ? lastSnapDay : (removal ? (removal.day | 0) : (s.day | 0)));
    perSpawn.push({
      day: s.day, seq: s.seq, type: s.type, src: s.src, cls: cls, rangeKind: rangeKind,
      snaps: mySnaps.length, tickVillagerSnaps: mySnaps.filter(sn => sn.source === 'tick' && !!sn.villagerRange).length,
      dailyVillagerSnaps: mySnaps.filter(sn => sn.source === 'daily' && !!sn.villagerRange).length,
      contactVillager: mySnaps.some(sn => !!sn.contactVillager), contactPlayer: mySnaps.some(sn => !!sn.contactPlayer),
      tickVillager: tickVillager, dailyVillager: dailyVillager,
      everVillagerRange: everVillager, everPlayerRange: everPlayer,
      removalDay: removal ? (removal.day | 0) : null, removalCause: cause, removalHint: removal ? removal.hint : null,
      presentAtEnd: present, reappeared: reapp,
      spawnDistHaven: spawnDistHaven, daysPresent: endDay - (s.day | 0),
      minNearestVillager: minNearest, minPlayerTiles: minPlayerTiles,
    });
  }
  let dominantOpp = null, dominantOppN = 0;
  for (const k of Object.keys(classes)) if (classes[k] > dominantOppN) { dominantOpp = k; dominantOppN = classes[k]; }
  const classSum = classes['contact-without-fight'] + classes['in-range-never-met'] + classes['never-in-range'];
  const w4oppErrs = (w4oppDiag.errs | 0);
  const w4oppOverflow = (w4oppDiag.overflow ? ((w4oppDiag.overflow.snaps | 0) + (w4oppDiag.overflow.removals | 0)) : 0);
  const fullyClassified = (classSum === neverFought.length) && w4oppErrs === 0 && w4oppOverflow === 0;
  // Fought-spawn contrast (this run's own fought spawns).
  const contrast = [];
  for (const s of foughtSpawns) {
    const fieldDays = field4.filter(f => f.seq != null && f.seq === s.seq).map(f => f.day | 0);
    const tbDays = inits4.filter(c => c.start.tileMonster && c.start.tileMonster.seq != null && c.start.tileMonster.seq === s.seq).map(c => c.start.day | 0);
    const firstFight = Math.min.apply(null, fieldDays.concat(tbDays).concat([Infinity]));
    const channel = (fieldDays.length && tbDays.length) ? 'both' : (fieldDays.length ? 'field' : (tbDays.length ? 'tb' : 'unlinked'));
    const mySnaps = snapsBySeq.get(s.seq) || [];
    const before = mySnaps.filter(sn => firstFight !== Infinity && (sn.day | 0) < firstFight);
    let spawnDistHaven = null;
    for (const sn of mySnaps) { spawnDistHaven = sn.distHaven; break; }
    contrast.push({
      day: s.day, seq: s.seq, type: s.type, src: s.src, channel: channel,
      firstFightDay: firstFight === Infinity ? null : firstFight,
      daysToFight: firstFight === Infinity ? null : (firstFight - (s.day | 0)),
      rangeBeforeFight: before.some(sn => !!sn.villagerRange || !!sn.playerRange),
      contactBeforeFight: before.some(sn => !!sn.contactVillager || !!sn.contactPlayer),
      spawnDistHaven: spawnDistHaven, snaps: mySnaps.length,
    });
  }
  return {
    neverFought: neverFought.length, classes: classes, classSum: classSum,
    dominantOpp: dominantOpp, dominantOppN: dominantOppN,
    rangeKinds: rangeKinds, removalCauses: removalCauses,
    removedNeverFought: removedNeverFought, removedBeforeRange: removedBeforeRange,
    presentAtEnd: presentAtEnd, reappeared: reappeared, zeroSnap: zeroSnap,
    snapsTotal: snaps.length, nullSeqSnaps: nullSeqSnaps,
    tickSnaps: snaps.filter(sn => sn.source === 'tick').length,
    dailySnaps: snaps.filter(sn => sn.source === 'daily').length,
    removals4: removals4.length, finalW4Count: (input.finalW4 || []).length,
    w4oppErrs: w4oppErrs, w4oppOverflow: w4oppOverflow,
    fullyClassified: fullyClassified, perSpawn: perSpawn, contrast: contrast,
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
    && rows.filter(r => r.policy === 'armed').every(r => Array.isArray(r.wave4enc.fieldFights) && Array.isArray(r.spawnsrc.spawns) && Array.isArray(r.fieldfinish.fieldFights) && Array.isArray(r.nonworldkill.starts) && Array.isArray(r.w4opp.snaps) && Array.isArray(r.w4opp.removals));
  const baselineBand = bandOf(rows, 'baseline');
  const armedBand = bandOf(rows, 'armed');
  const diff1816 = {
    wins: baselineBand.won - BAND1816.wins, nationalEver: baselineBand.nationalEver - BAND1816.nationalEver,
    nationalFinal: baselineBand.nationalFinal - BAND1816.nationalFinal, entered: baselineBand.entered - BAND1816.entered,
    wave4: baselineBand.wave4 - BAND1816.wave4, wave5: baselineBand.wave5 - BAND1816.wave5,
    medianDays: baselineBand.medianDays - BAND1816.medianDays, deaths: baselineBand.deathTotal - BAND1816.deaths,
    starvation: baselineBand.starvationTotal - BAND1816.starvation,
  };
  const rebaselineExact = Object.keys(diff1816).every(k => diff1816[k] === 0);
  const costBar = {
    starvationOk: armedBand.starvationTotal <= baselineBand.starvationTotal + 2,
    medianOk: armedBand.medianDays >= 0.8 * baselineBand.medianDays,
    armedOnlyDeathsNote: 'armed vs baseline deaths are compared seed-by-seed in G2; identical trajectories imply zero armed-only deaths',
  };
  const fullyTracedSeeds = perSeed.filter(p => p.fullyTraced).length;
  const fullyClassifiedSeeds = perSeed.filter(p => p.opp && p.opp.fullyClassified).length;
  const bandOppClasses = { 'contact-without-fight': 0, 'in-range-never-met': 0, 'never-in-range': 0 };
  for (const p of perSeed) if (p.opp) for (const k of Object.keys(bandOppClasses)) bandOppClasses[k] += (p.opp.classes[k] || 0);
  let bandOppDominant = null, bandOppDominantN = 0;
  for (const k of Object.keys(bandOppClasses)) if (bandOppClasses[k] > bandOppDominantN) { bandOppDominant = k; bandOppDominantN = bandOppClasses[k]; }
  const contrastStated = perSeed.every(p => p.opp && Array.isArray(p.opp.contrast));
  const bandContrastFought = perSeed.reduce((t, p) => t + (p.opp ? p.opp.contrast.length : 0), 0);
  const bandOppUnclassified = perSeed.reduce((t, p) => t + (p.opp ? (p.opp.neverFought - p.opp.classSum) : 0), 0);
  const bandClasses = {};
  for (const p of perSeed) for (const k of Object.keys(p.classes)) bandClasses[k] = (bandClasses[k] || 0) + p.classes[k];
  let bandDominant = null, bandDominantN = 0;
  for (const k of Object.keys(bandClasses)) if (bandClasses[k] > bandDominantN) { bandDominant = k; bandDominantN = bandClasses[k]; }
  const ffTotals = {
    belowLineArrivals: perSeed.reduce((t, p) => t + p.fieldfinish.belowLineArrivals, 0),
    zeroRoundFlights: perSeed.reduce((t, p) => t + p.fieldfinish.zeroRoundFlights, 0),
    oneHpArrivals: perSeed.reduce((t, p) => t + p.fieldfinish.oneHpArrivals, 0),
    oneHpZeroFlights: perSeed.reduce((t, p) => t + p.fieldfinish.oneHpZeroFlights, 0),
    strictWoundedRepeats: perSeed.reduce((t, p) => t + p.fieldfinish.strictWoundedRepeats, 0),
  };
  const verdict = (fullyClassifiedSeeds >= 6 && bandOppDominant && contrastStated) ? 'DIAG-GO' : 'DIAG-NO-GO';
  const report = {
    label: 'sim-w4opp-a', seeds: SEEDS, days: 180, perSeed: perSeed,
    gates: { g2RecorderNeutrality: g2, g2Pass: g2Pass, corpusOk: corpusOk, rebaselineExact: rebaselineExact, diffVs1816: diff1816, costBar: costBar },
    baselineBand: baselineBand, armedBand: armedBand, band1816: BAND1816,
    bandClasses: bandClasses, bandDominant: bandDominant, bandDominantN: bandDominantN,
    bandOppClasses: bandOppClasses, bandOppDominant: bandOppDominant, bandOppDominantN: bandOppDominantN,
    fullyClassifiedSeeds: fullyClassifiedSeeds, bandOppUnclassified: bandOppUnclassified,
    contrastStated: contrastStated, bandContrastFought: bandContrastFought,
    ffTotals: ffTotals, fullyTracedSeeds: fullyTracedSeeds,
    verdict: verdict,
    verdictRule: 'DIAG-GO iff fully-classified seeds >= 6 (every wave-4 spawn in exactly one opportunity class, zero unclassified, recorder errors zero) AND dominant opportunity class named with per-seed counts AND fought-spawn contrast stated.',
    generated: new Date().toISOString(),
  };
  const summaryPath = path.join(evidDir, 'summary.json');
  writeFileRetry(summaryPath, JSON.stringify(report, null, 1) + '\n');
  console.log('\n=== sim-w4opp-a ===');
  console.log(`  baseline: n=${baselineBand.n} won=${baselineBand.won} medD=${baselineBand.medianDays} natEver=${baselineBand.nationalEver} natFinal=${baselineBand.nationalFinal} table=${baselineBand.table} entered=${baselineBand.entered} wave4=${baselineBand.wave4} wave5=${baselineBand.wave5} starv=${baselineBand.starvationTotal} deaths=${baselineBand.deathTotal}`);
  console.log(`  armed:    n=${armedBand.n} won=${armedBand.won} medD=${armedBand.medianDays} natEver=${armedBand.nationalEver} natFinal=${armedBand.nationalFinal} table=${armedBand.table} entered=${armedBand.entered} wave4=${armedBand.wave4} wave5=${armedBand.wave5} starv=${armedBand.starvationTotal} deaths=${armedBand.deathTotal}`);
  console.log(`  rebaseline vs 1920Z: ${rebaselineExact ? 'EXACT' : 'DIFF ' + JSON.stringify(diff1816)}`);
  console.log(`  G2 recorder neutrality: ${g2Pass ? 'PASS' : 'FAIL'} (${g2.filter(x => x.ok).length}/${g2.length}; faced ${g2.filter(x => x.facedOk).length}/${g2.length}, kills ${g2.filter(x => x.killsOk).length}/${g2.length})`);
  console.log(`  corpus: ${corpusOk ? 'PASS' : 'FAIL'}; costBar starvationOk=${costBar.starvationOk} medianOk=${costBar.medianOk}`);
  for (const p of perSeed) {
    console.log(`  seed ${p.seed}: spawns4=${p.spawns4} field4=${p.field4} tbInits4=${p.tbInits4} neverFought=${p.neverFought} dominant=${p.dominant}(${p.dominantN}) partition=${p.partitionTotal} fullyTraced=${p.fullyTraced} ff belowLine=${p.fieldfinish.belowLineArrivals} zeroFlights=${p.fieldfinish.zeroRoundFlights} 1hp=${p.fieldfinish.oneHpArrivals} strict=${p.fieldfinish.strictWoundedRepeats} classes=${JSON.stringify(p.classes)}`);
  }
  console.log(`  band classes: ${JSON.stringify(bandClasses)} dominant=${bandDominant}(${bandDominantN})`);
  console.log(`  fieldfinish totals: ${JSON.stringify(ffTotals)}`);
  console.log(`  fullyTraced seeds: ${fullyTracedSeeds}/8; fullyClassified (opp) seeds: ${fullyClassifiedSeeds}/8; bandOpp=${JSON.stringify(bandOppClasses)} dominantOpp=${bandOppDominant}(${bandOppDominantN}) contrastStated=${contrastStated} contrastFought=${bandContrastFought} unclassified=${bandOppUnclassified} -> VERDICT ${verdict}`);
  for (const p of perSeed) {
    console.log(`  opp seed ${p.seed}: neverFought=${p.opp ? p.opp.neverFought : '?'} classes=${p.opp ? JSON.stringify(p.opp.classes) : '?'} dominantOpp=${p.opp ? p.opp.dominantOpp : '?'} fullyClassified=${p.opp ? p.opp.fullyClassified : '?'} removed=${p.opp ? p.opp.removedNeverFought : '?'} presentAtEnd=${p.opp ? p.opp.presentAtEnd : '?'} zeroSnap=${p.opp ? p.opp.zeroSnap : '?'} contrastFought=${p.opp ? p.opp.contrast.length : '?'}`);
  }
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
      const out = execFileSync('node', [path.join(REPO, 'scripts', 'test-w4opp-diag-sweep.js'), '--one', pid, String(seed)],
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
    line += ` spawns4=${c.spawns4} field4=${c.field4} tbInits4=${c.tbInits4} neverFought=${c.neverFought} dominant=${c.dominant}(${c.dominantN}) fullyTraced=${c.fullyTraced} opp=${c.opp ? JSON.stringify(c.opp.classes) : '?'} oppFully=${c.opp ? c.opp.fullyClassified : '?'} diagErrs=${c.diagErrs}`;
  }
  console.log(`  [${pid} seed ${seed}] ${line}`);
}

async function detgateMode() {
  const seed = parseInt(process.env.SEED || '73671', 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const c = await runOne('baseline', seed, days, null);
  delete process.env.WAVE4ENC; delete process.env.SPAWNSRC; delete process.env.FIELDFINISH; delete process.env.NONWORLDKILL;
  process.env.LEANLINKRESCUE = '1'; process.env.TABLESEATNOWAIT = '1';
  const waveStore = newWaveStore(), spawnStore = newSpawnStore(), ffStore = newFFStore(), nwkStore = newNwkStore(), w4oppStore = newW4oppStore();
  const wrapped = withW4oppDiag(
    withNonworldkillDiag(
      withFieldfinishDiag(
        withSpawnsrcDiag(
          withWave4encDiag(tableseatNowait, 'wave4enc-diag', 'tableseat-nowait + wave-4 field spawn-link recorder', waveStore),
          'spawnsrc-diag', 'tableseat-nowait + spawn-source census', spawnStore),
        'fieldfinish-diag', 'tableseat-nowait + wounded field-finish recorder', ffStore),
      'nonworldkill-diag', 'tableseat-nowait + TB initiation census', nwkStore),
    'w4opp-diag', 'tableseat-nowait + wave-4 spawn opportunity recorder', w4oppStore);
  const { Game } = await loadGame({ seed, mode: 'w4opp-diag-detgate', fullTelemetry: false });
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
  const hasDiagSurface = !!(capturedCtx && (capturedCtx._wave4enc || capturedCtx._spawnsrc || capturedCtx._fieldfinishdiag || capturedCtx._nonworldkill || capturedCtx._w4opp));
  const wrapsInstalled = !!Game._wave4encDiagInstalled || !!Game._spawnsrcDiagInstalled || !!Game._fieldfinishDiagInstalled || !!Game._nonworldkillDiagInstalled || !!Game._w4oppDiagInstalled;
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
    && classifySeed(census).partitionTotal === a.partitionTotal
    && JSON.stringify(classifySeed(census).classes) === JSON.stringify(a.classes)
    && JSON.stringify(classifySeed(census).opp.classes) === JSON.stringify(a.opp.classes);
  console.log(`DETAIL-REPRO seed=${seed} days=${row.days} gameDays=${row.gameDays} censusMatch=${same} partition=${a.partitionTotal} classes=${JSON.stringify(a.classes)}`);
  if (!same) { console.error('DETAIL REPRODUCTION FAILURE'); process.exit(1); }
  console.log('DETAIL field sequences (wave 4, day: outcome rounds start->end seq):');
  const byType = {};
  for (const f of (row.wave4enc.fieldFights || [])) {
    if ((f.wave | 0) !== 4) continue;
    (byType[f.mid] = byType[f.mid] || []).push(f);
  }
  for (const mid of Object.keys(byType).sort()) {
    console.log(`DETAIL seq ${mid}: ` + byType[mid].map(f => `d${f.day}:${f.outcome}/r${f.rounds}/${f.startHp}->${f.endHp}${f.seq != null ? `(seq${f.seq})` : '(noseq)'}`).join(' | '));
  }
  console.log('DETAIL tb events (wave 4):');
  for (const t of a.tbDetail) console.log(`DETAIL tb d${t.day} arg=${t.arg} mid=${t.mid} door=${t.door} tileSeq=${t.tileSeq} result=${t.endResult} killsW4=${t.killsW4} cls=${t.cls}`);
  console.log('DETAIL opportunity classes: ' + JSON.stringify(a.opp.classes) + ' fullyClassified=' + a.opp.fullyClassified);
  for (const ps of a.opp.perSpawn) console.log(`DETAIL opp d${ps.day} seq${ps.seq} ${ps.type} cls=${ps.cls} range=${ps.rangeKind} snaps=${ps.snaps} tickVill=${ps.tickVillagerSnaps} dailyVill=${ps.dailyVillagerSnaps} contactV=${ps.contactVillager} contactP=${ps.contactPlayer} removal=${ps.removalCause}@d${ps.removalDay} presentEnd=${ps.presentAtEnd} reapp=${ps.reappeared} distHaven=${ps.spawnDistHaven} daysPresent=${ps.daysPresent} minNearest=${ps.minNearestVillager} minPlayerTiles=${ps.minPlayerTiles}`);
  console.log('DETAIL fought-spawn contrast:');
  for (const cf of a.opp.contrast) console.log(`DETAIL contrast d${cf.day} seq${cf.seq} ${cf.type} channel=${cf.channel} firstFight=d${cf.firstFightDay} daysToFight=${cf.daysToFight} rangeBefore=${cf.rangeBeforeFight} contactBefore=${cf.contactBeforeFight} distHaven=${cf.spawnDistHaven} snaps=${cf.snaps}`);
  console.log('DETAIL never-fought spawns:');
  for (const s of a.neverFoughtDetail) console.log(`DETAIL neverFought d${s.day} seq${s.seq} ${s.type} src=${s.src} typeTbAfter=${s.typeTbAfter}`);
}

async function senseMode(seedArg) {
  const seed = parseInt(process.env.SENSE_SEED || seedArg || '73671', 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const out = process.env.SENSE_OUT || path.join(REPO, 'evidence', '2026-10-26', 'sim-w4opp-a-sense.txt');
  process.env.LEANLINKRESCUE = '1'; process.env.TABLESEATNOWAIT = '1';
  process.env.WAVE4ENC = '1'; process.env.SPAWNSRC = '1'; process.env.FIELDFINISH = '1'; process.env.NONWORLDKILL = '1'; process.env.W4OPP = '1';
  const waveStore = newWaveStore(), spawnStore = newSpawnStore(), ffStore = newFFStore(), nwkStore = newNwkStore(), w4oppStore = newW4oppStore();
  const armed = withW4oppDiag(
    withNonworldkillDiag(
      withFieldfinishDiag(
        withSpawnsrcDiag(
          withWave4encDiag(tableseatNowait, 'wave4enc-diag', 'tableseat-nowait + wave-4 field spawn-link recorder', waveStore),
          'spawnsrc-diag', 'tableseat-nowait + spawn-source census', spawnStore),
        'fieldfinish-diag', 'tableseat-nowait + wounded field-finish recorder', ffStore),
      'nonworldkill-diag', 'tableseat-nowait + TB initiation census', nwkStore),
    'w4opp-diag', 'tableseat-nowait + wave-4 spawn opportunity recorder', w4oppStore);
  const { Game } = await loadGame({ seed, mode: 'w4opp-diag-sense', fullTelemetry: false, narration: true });
  const t = {};
  const uninstall = PI.install(Game, t);
  await setupGame(Game);
  try { installWave4encDiag(Game, waveStore); } catch (e) {}
  try { installSpawnsrcDiag(Game, spawnStore); } catch (e) {}
  try { installFieldfinishDiag(Game, ffStore); } catch (e) {}
  try { installNonworldkillDiag(Game, nwkStore); } catch (e) {}
  try { installW4oppDiag(Game, w4oppStore); } catch (e) {}
  let result;
  await quietLog(async () => { result = await runDays(Game, armed, { days, manifest: undefined, sampleEvery: 30 }); });
  try { uninstall(); } catch (e) {}
  const ring = t.sayRing || [];
  let pg = {};
  try { pg = Game.progState ? Game.progState() : {}; } catch (e) {}
  let oppLine = 'w4opp: unavailable';
  try {
    const senseRow = {
      seed: seed, days: result.days, faced: {}, logEntries: [],
      spawnsrc: { spawns: spawnStore.spawns, diag: { errs: spawnStore.errs, overflow: spawnStore.overflow } },
      wave4enc: { fieldFights: waveStore.fieldFights, diag: { errs: waveStore.errs, overflow: waveStore.overflow } },
      fieldfinish: { fieldFights: ffStore.fieldFights, diag: { errs: ffStore.errs, overflow: ffStore.overflow } },
      nonworldkill: { starts: nwkStore.starts, ends: nwkStore.ends, diag: { errs: nwkStore.errs, overflow: nwkStore.overflow } },
      w4opp: { snaps: w4oppStore.snaps, removals: w4oppStore.removals, diag: { errs: w4oppStore.errs, overflow: w4oppStore.overflow } },
      finalW4: (() => { try { return Game.worldMonsters().filter(m => waveOfForFinal(m) === 4).map(m => ({ seq: (m._spawnSeq != null) ? (m._spawnSeq | 0) : null, type: m.id || null })); } catch (e) { return []; } })(),
    };
    const sc = classifySeed(senseRow);
    oppLine = `w4opp (SENSE-ONLY, non-measured): neverFought=${sc.opp.neverFought} classes=${JSON.stringify(sc.opp.classes)} dominantOpp=${sc.opp.dominantOpp} contrastFought=${sc.opp.contrast.length}`;
  } catch (e) { oppLine = 'w4opp error: ' + String((e && e.message) || e).slice(0, 160); }
  let ffLine = 'wave4enc: unavailable';
  try {
    const spawns4 = spawnStore.spawns.filter(s => (s.wave | 0) === 4).length;
    const field4 = waveStore.fieldFights.filter(f => (f.wave | 0) === 4);
    const byO = {};
    for (const f of field4) byO[f.outcome || 'null'] = (byO[f.outcome || 'null'] || 0) + 1;
    ffLine = `wave4enc (SENSE-ONLY, non-measured): spawns4=${spawns4} field4=${field4.length} byOutcome=${JSON.stringify(byO)}`;
  } catch (e) { ffLine = 'wave4enc error: ' + String((e && e.message) || e).slice(0, 160); }
  const header = [
    'SENSE-ONLY REPLAY — NON-MEASURED (narration shifts trajectories; never enters the census)',
    `seed=${seed} policy=tableseat-nowait+wave4enc-diag days=${result.days} gameDays=${result.gameDays} endReason=${result.endReason} maxWave=${result.maxWaveUnlocked} sayLive=${!!t.sayLive} ringLines=${ring.length} tableWaiting=${!!pg.tableWaiting} tableDone=${!!pg.tableDone}`,
    ffLine,
    oppLine,
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
if (require.main === module) main().catch(e => { console.error('WAVE4ENC-DIAG SWEEP FAILED:', (e && e.stack) || e); process.exit(1); });
module.exports = { runOne, classifySeed, classifyOpportunity, bandOf, BAND1816, BASE1920, SEEDS };
