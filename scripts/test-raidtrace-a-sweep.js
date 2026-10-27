#!/usr/bin/env node
// scripts/test-raidtrace-a-sweep.js — sim-raidtrace-a sweep
// (scale-onramp axis, 2026-10-27, arm sim-raidtrace-a. DIAG /
// MEASUREMENT ONLY, zero src/js changes.)
//
// Census corpus: the seq51gap-a sweep reused VERBATIM
// (scripts/test-seq51gap-diag-sweep.js) with EVID redirected
// to evidence/2026-10-27/perseed-raidtrace-a/ — this script
// does NOT re-implement the census; it only adds the
// transcript corpus and the band-wide wall classification.
//
// Transcript corpus (--transcript <seed>): narration-on
// replay, armed recorders PLUS the raidtrace-diag emit
// recorder (RAIDTRACE=1, outermost daily). The transcript
// run derives its OWN wall list from its OWN ticks
// (self-consistent even if narration trajectories diverge
// from the census) and retains only raid-window lines
// (see the prereg for the window definition).
//
// Modes: --transcript <seed> | --transcript-all |
// --classify | --detgate. The binding pre-registration
// (wall denominator, raid window, traced/untraced rule,
// DIAG-GO bar) lives in
// evidence/2026-10-27/sim-raidtrace-a-prereg.md — read it
// before judging anything this script prints.
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
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
  newStore: newNwkStore, installNonworldkillDiag, withNonworldkillDiag,
} = require('./policies/nonworldkill-diag');
const {
  newStore: newGapStore, installSeq51gapDiag, withSeq51gapDiag, snapshotWorldForce,
} = require('./policies/seq51gap-diag');
const {
  newStore: newRaidStore, installRaidtraceDiag, withRaidtraceDiag, filterWindows,
} = require('./policies/raidtrace-diag');
const seq51 = require('./test-seq51gap-diag-sweep');
const { traceSeq, wave4Seqs, BAND1920 } = seq51;

const SEEDS = (process.env.SEEDS || '73671,73672,73673,73674,73675,73676,73677,73678')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
const STARV_RE = /starv|hunger/i;

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
function evidDirOf() { return process.env.EVID || path.join(REPO, 'evidence', '2026-10-27', 'perseed-raidtrace-a'); }
function medianOf(arr) {
  if (!arr.length) return 0;
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
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
function copyFaced(Game) {
  const out = { faced: {}, errs: 0, error: null };
  try {
    const ds = (typeof Game.deedState === 'function') ? Game.deedState() : null;
    const faced = (ds && ds.wavesFaced) || {};
    for (const k of Object.keys(faced)) out.faced[k] = faced[k] | 0;
  } catch (e) { out.errs++; out.error = 'wavesFaced: ' + String((e && e.message) || e).slice(0, 100); }
  return out;
}
function armedPolicy() {
  process.env.LEANLINKRESCUE = '1'; process.env.TABLESEATNOWAIT = '1';
  process.env.W4DMG = '1'; process.env.WAVE4ENC = '1'; process.env.SPAWNSRC = '1';
  process.env.FIELDFINISH = '1'; process.env.NONWORLDKILL = '1'; process.env.SEQ51GAP = '1'; process.env.RAIDTRACE = '1';
  const w4dmgStore = newW4dmgStore(), waveStore = newWaveStore(), spawnStore = newSpawnStore(),
    ffStore = newFFStore(), nwkStore = newNwkStore(), gapStore = newGapStore(), raidStore = newRaidStore();
  const base = withRaidtraceDiag(
    withSeq51gapDiag(
      withNonworldkillDiag(
        withFieldfinishDiag(
          withSpawnsrcDiag(
            withWave4encDiag(
              withW4dmgDiag(tableseatNowait, 'w4dmg-diag', 'tableseat-nowait + wave-4 damage decomposition recorder', w4dmgStore),
              'wave4enc-diag', 'tableseat-nowait + wave-4 field spawn-link recorder', waveStore),
            'spawnsrc-diag', 'tableseat-nowait + spawn-source census', spawnStore),
          'fieldfinish-diag', 'tableseat-nowait + wounded field-finish recorder', ffStore),
        'nonworldkill-diag', 'tableseat-nowait + TB initiation census', nwkStore),
      'seq51gap-diag', 'tableseat-nowait + daily world-entity HP tick recorder', gapStore),
    'raidtrace-diag', 'tableseat-nowait + raid-window transcript recorder', raidStore);
  const stores = { w4dmgStore, waveStore, spawnStore, ffStore, nwkStore, gapStore, raidStore };
  const installAll = (Game) => {
    try { installW4dmgDiag(Game, w4dmgStore); } catch (e) {}
    try { installWave4encDiag(Game, waveStore); } catch (e) {}
    try { installSpawnsrcDiag(Game, spawnStore); } catch (e) {}
    try { installFieldfinishDiag(Game, ffStore); } catch (e) {}
    try { installNonworldkillDiag(Game, nwkStore); } catch (e) {}
    try { installSeq51gapDiag(Game, gapStore); } catch (e) {}
    try { installRaidtraceDiag(Game, raidStore); } catch (e) {}
  };
  return { base, stores, installAll };
}

async function runTranscript(seed, days, evidDir) {
  const { base, stores, installAll } = armedPolicy();
  const { Game } = await loadGame({ seed, mode: 'raidtrace-a-transcript', fullTelemetry: false, narration: true });
  await setupGame(Game);
  installAll(Game);
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
  try { snapshotWorldForce(Game, stores.gapStore); } catch (e) {}
  const row = {
    policy: 'transcript', seed,
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
    w4dmg: { fieldFights: stores.w4dmgStore.fieldFights, tbEnds: stores.w4dmgStore.tbEnds,
      diag: { errs: stores.w4dmgStore.errs, errors: stores.w4dmgStore.errors, overflow: stores.w4dmgStore.overflow, installed: stores.w4dmgStore.installed } },
    wave4enc: { fieldFights: stores.waveStore.fieldFights,
      diag: { errs: stores.waveStore.errs, errors: stores.waveStore.errors, overflow: stores.waveStore.overflow, installed: stores.waveStore.installed } },
    spawnsrc: { spawns: stores.spawnStore.spawns, raids: stores.spawnStore.raids,
      diag: { errs: stores.spawnStore.errs, errors: stores.spawnStore.errors, overflow: stores.spawnStore.overflow, installed: stores.spawnStore.installed, seq: stores.spawnStore.seq } },
    fieldfinish: { fieldFights: stores.ffStore.fieldFights, tbFights: stores.ffStore.tbFights,
      diag: { errs: stores.ffStore.errs, errors: stores.ffStore.errors, overflow: stores.ffStore.overflow, installed: stores.ffStore.installed } },
    nonworldkill: { starts: stores.nwkStore.starts, ends: stores.nwkStore.ends,
      diag: { errs: stores.nwkStore.errs, errors: stores.nwkStore.errors, overflow: stores.nwkStore.overflow, installed: stores.nwkStore.installed } },
    seq51gap: { ticks: stores.gapStore.ticks,
      diag: { errs: stores.gapStore.errs, errors: stores.gapStore.errors, overflow: stores.gapStore.overflow, installed: stores.gapStore.installed, lastTickDay: stores.gapStore.lastTickDay } },
  };
  // Raid days from the tick rows (lastRaidDay changes, in tick
  // order; the post-run duplicate day repeats the same value
  // and creates no spurious change).
  const raidDays = [];
  {
    let prev = null;
    for (const t of stores.gapStore.ticks) {
      if (t.lastRaidDay != null && t.lastRaidDay !== prev) {
        if (prev !== null || t.lastRaidDay !== 0) raidDays.push(t.lastRaidDay);
        prev = t.lastRaidDay;
      }
    }
  }
  const tickDays = [...new Set(stores.gapStore.ticks.map(t => t.day))].sort((a, b) => a - b);
  const raidDayRecs = raidDays.map(R => ({
    raidDay: R,
    nextTickDay: (tickDays.find(d => d > R) != null ? tickDays.find(d => d > R) : null),
  }));
  const filt = filterWindows(stores.raidStore.lines, stores.raidStore.tickEmitIndex, raidDayRecs);
  const lineCountsByDay = {};
  for (const l of stores.raidStore.lines) lineCountsByDay[l.day] = (lineCountsByDay[l.day] || 0) + 1;
  const windowIdxByRaidDay = {};
  for (const R of Object.keys(filt.windows)) windowIdxByRaidDay[R] = filt.windows[R].map(l => l.idx);
  row.raidtrace = {
    tickEmitIndex: stores.raidStore.tickEmitIndex,
    raidDays: raidDayRecs,
    windowIdxByRaidDay,
    lineCountsByDay,
    totalLines: stores.raidStore.lines.length,
    retainedWindowLines: Object.values(filt.windows).reduce((t, a) => t + a.length, 0),
    discardedLines: stores.raidStore.lines.length - Object.values(filt.windows).reduce((t, a) => t + a.length, 0),
    raidLines: filt.raidLines.length,
    palisadeRaidLines: filt.palisadeRaidLines.length,
    diag: { errs: stores.raidStore.errs, errors: stores.raidStore.errors, installed: stores.raidStore.installed, wrapped: stores.raidStore.wrapped },
  };
  const transcript = {
    seed, policy: 'transcript',
    days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    windows: filt.windows,
    raidLines: filt.raidLines,
    palisadeRaidLines: filt.palisadeRaidLines,
    lineCountsByDay,
    tickEmitIndex: stores.raidStore.tickEmitIndex,
    raidDays: raidDayRecs,
    totalLines: stores.raidStore.lines.length,
    diag: row.raidtrace.diag,
  };
  if (evidDir) {
    writeFileRetry(path.join(evidDir, `s${seed}-transcript-armed.json`), JSON.stringify(row, null, 1) + '\n');
    writeFileRetry(path.join(evidDir, `s${seed}-transcript.json`), JSON.stringify(transcript, null, 1) + '\n');
  }
  return { row, transcript };
}

async function transcriptMode(seedArg) {
  const seed = parseInt(seedArg, 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const evidDir = evidDirOf();
  fs.mkdirSync(evidDir, { recursive: true });
  const { row, transcript } = await runTranscript(seed, days, evidDir);
  const seqs = wave4Seqs(row);
  let walls = 0;
  for (const q of seqs) {
    const tr = traceSeq(row, q);
    walls += tr.steps.filter(s => s.cause === 'C2-palisade-wall' || s.cause === 'C2?-wall-amount-only').length;
  }
  console.log(`  [transcript seed ${seed}] days=${row.days} gameDays=${row.gameDays} end=${row.endReason} wave=${row.waveReach} won=${row.won} starv=${row.starvationDeaths} deaths=${row.deathTotal} ticks=${row.seq51gap.ticks.length} raidDays=${transcript.raidDays.length} totalLines=${transcript.totalLines} retainedWindowLines=${row.raidtrace.retainedWindowLines} palisadeRaidLines=${transcript.palisadeRaidLines.length} ownWalls=${walls} diagErrs=${row.raidtrace.diag.errs}`);
}

async function transcriptAllMode() {
  const evidDir = evidDirOf();
  fs.mkdirSync(evidDir, { recursive: true });
  for (const seed of SEEDS) {
    console.log(`--- transcript seed ${seed} ---`);
    const out = execFileSync('node', [path.join(REPO, 'scripts', 'test-raidtrace-a-sweep.js'), '--transcript', String(seed)],
      { cwd: REPO, encoding: 'utf8', timeout: 1200000, env: Object.assign({}, process.env, { EVID: evidDir }) });
    process.stdout.write(out);
  }
  await classifyMode();
}

// ---- classification (pure over corpus files) ----

function monsterDef(id) {
  try {
    const defs = require(path.join(REPO, 'src', 'data', 'monsters.json'));
    const list = Array.isArray(defs) ? defs : (defs.monsters || []);
    return list.find(d => d && d.id === id) || null;
  } catch (e) { return null; }
}
function parseRaidDay(step) {
  if (step.cause === 'C2-palisade-wall') {
    const m = /raid day (\d+)/.exec(step.detail || '');
    if (m) return parseInt(m[1], 10);
  }
  if (step.cause === 'C2?-wall-amount-only') {
    const m = /\((\d+) -> (\d+)\)/.exec(step.detail || '');
    if (m) return parseInt(m[2], 10);
  }
  return null;
}
function classifyWall(wall, windowLines) {
  const joined = (windowLines || []).map(l => l.text).join('\n');
  const low = joined.toLowerCase();
  const def = monsterDef(wall.monsterId);
  let nameMatch = false, nameVia = null;
  if (def) {
    const name = String(def.name || '').toLowerCase();
    const bare = name.replace(/^the\s+/, '');
    if (name && (low.includes(name) || (bare && low.includes(bare)))) { nameMatch = true; nameVia = 'true-name'; }
    else if (def.unknown && low.includes(String(def.unknown).toLowerCase())) { nameMatch = true; nameVia = 'unknown-descriptor'; }
  }
  const woundWords = ['palisade', 'stakes', 'toll', 'wall'];
  const woundHit = woundWords.find(w => low.includes(w)) || null;
  const woundMatch = woundHit != null;
  // TOLL-QUANTIFIED (strict, prereg definition): a window line
  // that NAMES this monster AND carries a number equal to the
  // wall amount (|delta|) or the post-wall HP (toHp) — a number
  // attached to THAT monster's wound. INSTRUMENT FIX
  // (2026-10-27): the first version counted any line with a
  // digit + a toll word, which fires on the RAID line itself
  // ("3 raiders ... stakes take their toll") — the digit there
  // is the RAIDER COUNT, not a wound amount, so every wall
  // falsely read tollQuantified=true. The strict form below
  // is what the prereg's secondary grading actually defines;
  // the primary traced/untraced rule is untouched by this fix.
  let tollQuantified = false;
  if (def) {
    const name = String(def.name || '').toLowerCase();
    const bare = name.replace(/^the\s+/, '');
    const nums = new Set();
    if (wall.delta != null) nums.add(String(Math.abs(wall.delta)));
    if (wall.toHp != null) nums.add(String(wall.toHp));
    for (const l of (windowLines || [])) {
      const lt = l.text.toLowerCase();
      const namesIt = (name && lt.includes(name)) || (bare && lt.includes(bare));
      if (!namesIt) continue;
      const tokens = lt.match(/\d[\d,]*/g) || [];
      if (tokens.some(t => nums.has(t.replace(/,/g, '')))) { tollQuantified = true; break; }
    }
  }
  const verdict = (nameMatch || woundMatch) ? 'traced' : 'untraced';
  const reason = verdict === 'traced'
    ? (nameMatch && woundMatch ? `name(${nameVia})+wound(${woundHit})` : nameMatch ? `name(${nameVia})` : `wound(${woundHit})`)
    : ((windowLines || []).length === 0 ? 'no window lines' : 'no name, no wound word');
  return { verdict, reason, nameMatch, nameVia, woundMatch, woundHit, tollQuantified,
    windowLines: (windowLines || []).length,
    windowIdx: (windowLines || []).map(l => l.idx),
    windowDays: [...new Set((windowLines || []).map(l => l.day))].sort((a, b) => a - b) };
}
function wallsOfRow(row) {
  const out = [];
  const seqs = wave4Seqs(row);
  for (const q of seqs) {
    const tr = traceSeq(row, q);
    // Monster id + maxHp from the seq's first tick observation.
    let monsterId = null, maxHp = null;
    for (const o of tr.obs) {
      if (o.kind === 'tick' && o.id) { monsterId = o.id; maxHp = o.maxHp; break; }
    }
    for (const s of tr.steps) {
      if (s.cause !== 'C2-palisade-wall' && s.cause !== 'C2?-wall-amount-only') continue;
      // havenTier at the wall: tick row at/after the step's toDay.
      let tier = null;
      const ticks = (row.seq51gap && row.seq51gap.ticks) || [];
      for (const t of ticks) if (t.day >= s.toDay) { tier = t.havenTier; break; }
      out.push({ seed: row.seed, seq: q, monsterId, maxHp,
        fromDay: s.fromDay, fromKind: s.fromKind, fromHp: s.fromHp,
        toDay: s.toDay, toKind: s.toKind, toHp: s.toHp, delta: s.delta,
        cause: s.cause, detail: s.detail, raidDay: parseRaidDay(s), havenTier: tier });
    }
  }
  return out;
}

async function classifyMode() {
  const evidDir = evidDirOf();
  const perSeed = [];
  for (const seed of SEEDS) {
    const tRow = JSON.parse(fs.readFileSync(path.join(evidDir, `s${seed}-transcript-armed.json`), 'utf8'));
    const tDoc = JSON.parse(fs.readFileSync(path.join(evidDir, `s${seed}-transcript.json`), 'utf8'));
    const tWalls = wallsOfRow(tRow);
    const classified = tWalls.map(w => {
      const win = (w.raidDay != null && tDoc.windows[String(w.raidDay)]) ? tDoc.windows[String(w.raidDay)] : [];
      const c = classifyWall(w, win);
      return Object.assign({}, w, { classification: c.verdict, classReason: c.reason,
        nameMatch: c.nameMatch, nameVia: c.nameVia, woundMatch: c.woundMatch, woundHit: c.woundHit,
        tollQuantified: c.tollQuantified, windowLines: c.windowLines, windowIdx: c.windowIdx, windowDays: c.windowDays });
    });
    let censusWalls = null;
    try {
      const cRow = JSON.parse(fs.readFileSync(path.join(evidDir, `s${seed}-armed.json`), 'utf8'));
      censusWalls = wallsOfRow(cRow).length;
    } catch (e) { censusWalls = null; }
    const traced = classified.filter(w => w.classification === 'traced').length;
    const untraced = classified.filter(w => w.classification === 'untraced').length;
    const unclassified = classified.filter(w => w.classification !== 'traced' && w.classification !== 'untraced').length;
    perSeed.push({ seed, transcriptWalls: classified, traced, untraced, unclassified,
      censusWalls, transcriptDays: tRow.days, transcriptGameDays: tRow.gameDays,
      transcriptWon: tRow.won, transcriptStarvation: tRow.starvationDeaths });
  }
  const totals = {
    walls: perSeed.reduce((t, p) => t + p.transcriptWalls.length, 0),
    traced: perSeed.reduce((t, p) => t + p.traced, 0),
    untraced: perSeed.reduce((t, p) => t + p.untraced, 0),
    unclassified: perSeed.reduce((t, p) => t + p.unclassified, 0),
    tollQuantified: perSeed.reduce((t, p) => t + p.transcriptWalls.filter(w => w.tollQuantified).length, 0),
    censusWalls: perSeed.reduce((t, p) => t + (p.censusWalls || 0), 0),
    censusWallsKnown: perSeed.every(p => p.censusWalls != null),
  };
  const byTier = {};
  for (const p of perSeed) for (const w of p.transcriptWalls) {
    const k = 'tier' + (w.havenTier == null ? '?' : w.havenTier);
    byTier[k] = byTier[k] || { walls: 0, traced: 0, untraced: 0 };
    byTier[k].walls++;
    if (w.classification === 'traced') byTier[k].traced++;
    if (w.classification === 'untraced') byTier[k].untraced++;
  }
  const report = { label: 'sim-raidtrace-a', seeds: SEEDS, perSeed, totals, byTier, generated: new Date().toISOString() };
  const outPath = path.join(evidDir, 'raidtrace-classification.json');
  writeFileRetry(outPath, JSON.stringify(report, null, 1) + '\n');
  console.log('\n=== sim-raidtrace-a classification ===');
  for (const p of perSeed) {
    console.log(`  seed ${p.seed}: transcriptWalls=${p.transcriptWalls.length} traced=${p.traced} untraced=${p.untraced} unclassified=${p.unclassified} censusWalls=${p.censusWalls} days=${p.transcriptDays}`);
    for (const w of p.transcriptWalls) {
      console.log(`    wall s${p.seed} seq${w.seq} ${w.monsterId} raidDay=${w.raidDay} tier=${w.havenTier} ${w.fromHp}->${w.toHp} (${w.delta}) ${w.cause} => ${w.classification} [${w.classReason}] windowLines=${w.windowLines} tollQuant=${w.tollQuantified}`);
    }
  }
  console.log(`  TOTALS walls=${totals.walls} traced=${totals.traced} untraced=${totals.untraced} unclassified=${totals.unclassified} tollQuantified=${totals.tollQuantified} censusWalls=${totals.censusWalls} byTier=${JSON.stringify(byTier)}`);
  console.log(`  -> ${outPath}`);
  return report;
}

async function detgateMode() {
  const seed = parseInt(process.env.SEED || '73671', 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  // Plain narration-on tableseat (no recorders at all).
  async function plainRun(wrapOff) {
    process.env.LEANLINKRESCUE = '1'; process.env.TABLESEATNOWAIT = '1';
    delete process.env.RAIDTRACE;
    const { Game } = await loadGame({ seed, mode: 'raidtrace-detgate', fullTelemetry: false, narration: true });
    await setupGame(Game);
    let raidStore = null;
    if (wrapOff) {
      raidStore = newRaidStore();
      const uninstall = installRaidtraceDiag(Game, raidStore);
      void uninstall;
    }
    const hist = { maxRank: 0, maxArc: 1, everTable: false, everEntered: false };
    let capturedCtx = null;
    const policy = Object.assign({}, tableseatNowait, {
      daily(G, ctx) {
        if (!capturedCtx) capturedCtx = ctx;
        try {
          const s = snap(G);
          hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[s.rank] || 0);
          hist.maxArc = Math.max(hist.maxArc, s.arc || 1);
          if (s.tableWaiting) hist.everTable = true;
          if (s.tableEntered) hist.everEntered = true;
        } catch (e) {}
        if (tableseatNowait.daily) { try { return tableseatNowait.daily(G, ctx); } catch (e) {} }
      },
    });
    const result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 10 });
    const deaths = result.samples.deaths || [];
    const starv = deaths.filter(d => STARV_RE.test(String(d.cause || '')));
    const ts = {};
    if (capturedCtx) for (const k of Object.keys(capturedCtx)) if (k.indexOf('ts') === 0) ts[k] = capturedCtx[k];
    return { days: result.days, gameDays: result.gameDays, ts, starvationDeaths: starv.length,
      wrapped: !!(Game._raidtraceDiagWrapped), installed: !!(Game._raidtraceDiagInstalled),
      lines: raidStore ? raidStore.lines.length : null };
  }
  const a = await plainRun(false);
  const b = await plainRun(true);
  const ok = a.days === b.days && a.gameDays === b.gameDays && JSON.stringify(a.ts) === JSON.stringify(b.ts)
    && a.starvationDeaths === b.starvationDeaths && !b.wrapped && !b.installed && b.lines === 0;
  console.log(`DETGATE-RAIDTRACE seed=${seed} plain days=${a.days} gameDays=${a.gameDays} ts=${JSON.stringify(a.ts)} starv=${a.starvationDeaths} | wrapOff days=${b.days} gameDays=${b.gameDays} ts=${JSON.stringify(b.ts)} starv=${b.starvationDeaths} wrapped=${b.wrapped} installed=${b.installed} lines=${b.lines} -> ${ok ? 'PASS' : 'FAIL'}`);
  if (!ok) process.exit(1);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--transcript')) return transcriptMode(args[args.indexOf('--transcript') + 1]);
  if (args.includes('--transcript-all')) return transcriptAllMode();
  if (args.includes('--classify')) return classifyMode();
  if (args.includes('--detgate')) return detgateMode();
  console.error('usage: --transcript <seed> | --transcript-all | --classify | --detgate');
  process.exit(2);
}
if (require.main === module) main().catch(e => { console.error('RAIDTRACE SWEEP FAILED:', (e && e.stack) || e); process.exit(1); });
module.exports = { runTranscript, classifyWall, wallsOfRow, parseRaidDay, filterWindows, SEEDS, BAND1920 };
