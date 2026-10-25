#!/usr/bin/env node
// scripts/test-fieldfinish-diag-sweep.js — sim-fieldfinish-a pilot + proof
// (scale-onramp axis, 2026-10-24, the named next blank from
// sim-encounter-a: the wounded-repeat hypothesis behind villagers
// NEVER killing a wave-3+ monster in the field).
//
// QUESTION: on the tableseat-nowait substrate, villagers never killed
// a wave-3+ monster in the field (prior corpus: 0/87 field fights;
// all wave-3+ kills player tb kills). HYPOTHESIS (not a claim): the
// same wounded entity reappears at mHpLeft = 1 with rounds = 0 and
// outcome mFlee — below its break threshold it flees before the first
// strike every time, so a wounded monster can never be finished.
// This sweep RULES THAT HYPOTHESIS IN OR OUT from its own corpus.
//
// PAIRING (exact, identical seeds):
//   baseline = scripts/policies/tableseat-nowait.js (LEANLINKRESCUE=1,
//     TABLESEATNOWAIT=1, FIELDFINISH unset). Post-run rows carry a
//     pure-read snapshot only (deed feed wavesFaced + waveKillLog) —
//     no field-fight rows, by construction.
//   armed    = tableseat-nowait wrapped with scripts/policies/
//     fieldfinish-diag.js (FIELDFINISH=1): record-after-delegate
//     fieldFight wraps (start hp captured BEFORE delegating, end
//     hp/rounds from the RETURNED record) + tbEnd wraps (fight object
//     captured BEFORE delegating). Observational only.
//
// Modes:
//   default: pilot sweep. SEEDS (default 73671-73678), DAYS=180
//     (default), EVID=evidence/2026-10-24/perseed-fieldfinish-a.
//     Per-config INCREMENTAL corpus writes. Exit 0 on a completed
//     sweep regardless of IN/OUT (the verdict is data); exit 1 on
//     proof-gate failure (G2/G3).
//   --detgate: G1 delegation proof on one seed (SEED env, default
//     73671): tableseat-nowait vs fieldfinish-wrapped tableseat-nowait
//     with FIELDFINISH unset must match on days/gameDays/ts with no
//     _fieldfinishdiag surface and no installed wraps. Exit 1 on mismatch.
//   --detail SEED: re-run armed on ONE seed, dump its wave-3+
//     wounded-repeat rows + per-type sequences. Census-match check
//     (days/gameDays/ts/field counts/wounded-repeat counts) must pass
//     or exit 1 — the detail rows then describe the same trajectory.
//   --sense SEED: NON-MEASURED narration replay, written to
//     evidence/2026-10-24/sim-fieldfinish-a-sense.txt.
//
// Proof gates (failures exit 1 in sweep mode):
//   G1 det-gate: see --detgate (run separately).
//   G2 recorder neutrality: for ALL 8 seeds, baseline vs armed days,
//     gameDays, ts counters and starvation identical.
//   G3 corpus integrity: 16/16 rows, no zero-day rows, every armed row
//     carries persisted field-fight ROWS (not counts alone) + tb rows,
//     every baseline row carries the post-run pure-read snapshot.
//   G4 hypothesis decision: IN iff (a) >= 2 of focus seeds 73675,
//     73677, 73678 each carry >= 1 STRICT wave-3+ wounded-repeat AND
//     (b) band-wide >= 5 wave-3+ STRICT wounded-repeats. OUT otherwise.
//     The verdict is a FINDING, not a pass/fail; only G2/G3 failures
//     exit 1.
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { tableseatNowait } = require('./policies/tableseat-nowait');
const { copyKillLog } = require('./policies/vetkill-diag');
const {
  newStore, installFieldfinishDiag, withFieldfinishDiag, analyzeFieldFights,
} = require('./policies/fieldfinish-diag');
const PI = require('./postunlock-instrument');

const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
const STARV_RE = /starv|hunger/i;
const FOCUS_SEEDS = [73675, 73677, 73678];
function medianOf(arr) {
  if (!arr.length) return 0;
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}
function sleepMs(ms) { try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); } catch (e) { /* sleep best-effort */ } }
function snap(Game) {
  const out = { won: false, arc: 1, tableWaiting: false, tableEntered: false, rank: 'village' };
  try { out.won = !!Game.won; } catch (e) { /* snap best-effort */ }
  try { const pg = Game.progState ? Game.progState() : {}; out.arc = pg.arc || 1; out.tableWaiting = !!pg.tableWaiting; out.tableEntered = !!pg.tableDone; } catch (e) { /* snap best-effort */ }
  try { out.rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) { /* snap best-effort */ }
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
function writeRowViaWriter(p, body) {
  console.log('ROWJSON-BEGIN ' + path.basename(p) + '\n' + body + '\nROWJSON-END');
  let lastErr = null;
  for (let a = 1; a <= 8; a++) {
    try {
      const out = execFileSync('node', [path.join(REPO, 'scripts', 'sim-postunlock2-b-writer.js'), p],
        { input: body, cwd: REPO, encoding: 'utf8', timeout: 600000 });
      const m = /WROTE ([0-9a-f]{12})/.exec(out || '');
      if (!m) throw new Error('writer gave no WROTE line: ' + String(out).slice(0, 200));
      const sha = crypto.createHash('sha256').update(body).digest('hex').slice(0, 12);
      if (m[1] !== sha) throw new Error('writer sha mismatch');
      return sha;
    } catch (e) {
      lastErr = e;
      console.log(`WRITE-RETRY ${path.basename(p)} attempt=${a} err=${String((e && e.message) || e).slice(0, 160)}`);
      if (a < 8) sleepMs(Math.min(10000, 1000 * a));
    }
  }
  throw lastErr;
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

// fieldfinishSnapshot(Game, store): post-run field-finish state.
// Armed: full analysis over persisted ROWS. Baseline: snapshot only.
function fieldfinishSnapshot(Game, store) {
  const faced = copyFaced(Game);
  const log = copyKillLog(Game);
  const defById = {};
  try { for (const m of (Game.data && Game.data.monsters) || []) if (m && m.id) defById[m.id] = m.wave | 0; } catch (e) { /* def map best-effort */ }
  const waveOf = (mid) => (defById[mid] != null ? defById[mid] : 1);
  const snapOut = {
    faced: faced.faced, facedErrs: faced.errs, facedError: faced.error,
    logEntries: log.entries, logErrs: log.errs, logError: log.error,
  };
  if (!store) { snapOut.analysis = null; snapOut.note = 'snapshot-only: no field-fight rows on the baseline arm'; return snapOut; }
  const analysis = analyzeFieldFights(store.fieldFights);
  const ffW3 = store.fieldFights.filter(f => (f.wave | 0) >= 3);
  const analysisW3 = analyzeFieldFights(ffW3);
  const tbW3 = store.tbFights.filter(t => (t.monsterIds || []).some(mid => (waveOf(mid) | 0) >= 3));
  // Cross-check: kill-log entries by via, vs recorder rows.
  const killsByVia = {};
  for (const e of log.entries) killsByVia[e.via || 'null'] = (killsByVia[e.via || 'null'] || 0) + 1;
  const killsW3ByVia = {};
  for (const e of log.entries) if ((e.w | 0) >= 3) killsW3ByVia[e.via || 'null'] = (killsW3ByVia[e.via || 'null'] || 0) + 1;
  const fieldVKillsW3 = ffW3.filter(f => f.outcome === 'vKill').length;
  const tbKillsW3 = (log.entries || []).filter(e => (e.w | 0) >= 3 && String(e.via || '').indexOf('tb') >= 0).length;
  snapOut.fieldFights = store.fieldFights;
  snapOut.tbFights = store.tbFights;
  snapOut.analysis = {
    all: { byOutcome: analysis.byOutcome, woundedRepeatsStrict: analysis.woundedRepeats.length, woundedRepeatsAnyEarlier: analysis.woundedRepeatsAnyEarlier.length, volleyDriveOffs: analysis.volleyDriveOffs.length, evades: analysis.evades.length, inRoundMFlee: analysis.inRoundMFlee.length },
    w3: { fights: ffW3.length, byOutcome: analysisW3.byOutcome, woundedRepeatsStrict: analysisW3.woundedRepeats.length, woundedRepeatsAnyEarlier: analysisW3.woundedRepeatsAnyEarlier.length, volleyDriveOffs: analysisW3.volleyDriveOffs.length, evades: analysisW3.evades.length, inRoundMFlee: analysisW3.inRoundMFlee.length, perType: analysisW3.perType },
    woundedRepeatsW3: analysisW3.woundedRepeats,
    woundedRepeatsAnyEarlierW3: analysisW3.woundedRepeatsAnyEarlier,
    volleyDriveOffsW3: analysisW3.volleyDriveOffs,
    tbFightsW3: tbW3.length,
    crossCheck: { killsByVia, killsW3ByVia, fieldVKillsW3, tbKillsW3, fieldRowsW3: ffW3.length },
  };
  snapOut.diag = { errs: store.errs, errors: store.errors, overflow: store.overflow, installed: store.installed };
  return snapOut;
}

async function runOne(pid, seed, days, evidDir, storeHolder) {
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  let store = null;
  if (pid === 'armed') { process.env.FIELDFINISH = '1'; store = newStore(); if (storeHolder) storeHolder.store = store; }
  else delete process.env.FIELDFINISH;
  const base = pid === 'armed'
    ? withFieldfinishDiag(tableseatNowait, 'fieldfinish-diag', 'tableseat-nowait + wounded field-finish recorder', store)
    : tableseatNowait;
  const { Game } = await loadGame({ seed, mode: 'fieldfinish-diag-' + pid, fullTelemetry: false });
  await setupGame(Game);
  if (pid === 'armed') { try { installFieldfinishDiag(Game, store); } catch (e) { /* install best-effort; daily hook retries */ } }
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
  const ff = fieldfinishSnapshot(Game, store);
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
    fieldfinish: ff,
    diag: store ? { errs: store.errs, overflow: store.overflow } : null,
  };
  if (evidDir) {
    const fn = path.join(evidDir, `s${seed}-${pid}.json`);
    const body = JSON.stringify(row, null, 1) + '\n';
    const sha = writeRowViaWriter(fn, body);
    row.corpusFile = fn; row.corpusSha = sha;
  }
  return row;
}

function aggregate(rows, pid) {
  const rs = rows.filter(r => r.policy === pid);
  const wave = (n) => rs.filter(r => (r.waveReach || 1) >= n).length;
  const starvBySeed = {};
  for (const r of rs) starvBySeed[r.seed] = r.starvationDeaths;
  let ffW3 = 0, ffVKillW3 = 0, ffMFleeW3 = 0, ffR0MFleeW3 = 0, woundedStrictW3 = 0, volleyW3 = 0, evadesW3 = 0, tbW3 = 0, killsW3 = 0;
  const mHpAtMFlee = [], mHpAtVKill = [], startFracAtMFlee = [];
  for (const r of rs) {
    const a = r.fieldfinish && r.fieldfinish.analysis;
    if (!a) continue;
    ffW3 += a.w3.fights; ffVKillW3 += a.crossCheck.fieldVKillsW3; tbW3 += a.tbFightsW3 || 0;
    ffMFleeW3 += a.w3.byOutcome.mFlee || 0; woundedStrictW3 += a.w3.woundedRepeatsStrict;
    volleyW3 += a.w3.volleyDriveOffs; evadesW3 += a.w3.evades;
    killsW3 += Object.values(a.crossCheck.killsW3ByVia || {}).reduce((t, n) => t + n, 0);
    for (const f of (r.fieldfinish.fieldFights || [])) {
      if ((f.wave | 0) < 3) continue;
      if (f.outcome === 'mFlee') { if (f.endHp != null) mHpAtMFlee.push(f.endHp); if (f.startFrac != null) startFracAtMFlee.push(f.startFrac); if ((f.rounds | 0) === 0) ffR0MFleeW3++; }
      if (f.outcome === 'vKill' && f.endHp != null) mHpAtVKill.push(f.endHp);
    }
  }
  const dist = (arr) => {
    if (!arr.length) return { n: 0 };
    const s = arr.slice().sort((a, b) => a - b);
    return { n: arr.length, min: s[0], p25: s[Math.floor(s.length * 0.25)], median: s[Math.floor(s.length / 2)], p75: s[Math.floor(s.length * 0.75)], max: s[s.length - 1] };
  };
  return {
    n: rs.length,
    won: rs.reduce((t, r) => t + r.won, 0),
    medianDays: medianOf(rs.map(r => r.days)),
    medianGameDays: medianOf(rs.map(r => r.gameDays)),
    maxDays: Math.max.apply(null, rs.map(r => r.days).concat([0])),
    nationalEver: rs.reduce((t, r) => t + r.nationalEver, 0),
    nationalFinal: rs.reduce((t, r) => t + r.nationalFinal, 0),
    table: rs.reduce((t, r) => t + r.table, 0),
    entered: rs.reduce((t, r) => t + r.entered, 0),
    wave4: wave(4), wave5: wave(5),
    maxArc: Math.max.apply(null, rs.map(r => r.maxArc).concat([1])),
    starvationTotal: rs.reduce((t, r) => t + r.starvationDeaths, 0),
    starvationBySeed: starvBySeed,
    deathTotal: rs.reduce((t, r) => t + r.deathTotal, 0),
    seatTaken: rs.reduce((t, r) => t + (r.ts.tsSeatTaken || 0), 0),
    seatAttempts: rs.reduce((t, r) => t + (r.ts.tsSeatAttempts || 0), 0),
    seatFailed: rs.reduce((t, r) => t + (r.ts.tsSeatFailed || 0), 0),
    field: { ffW3, ffVKillW3, ffMFleeW3, ffR0MFleeW3, woundedStrictW3, volleyW3, evadesW3, tbW3, killsW3 },
    mHpAtMFlee: dist(mHpAtMFlee), mHpAtVKill: dist(mHpAtVKill), startFracAtMFlee: dist(startFracAtMFlee),
  };
}

async function sweepMode() {
  const seeds = (process.env.SEEDS || '73671,73672,73673,73674,73675,73676,73677,73678')
    .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const evidDir = process.env.EVID || path.join(REPO, 'evidence', '2026-10-24', 'perseed-fieldfinish-a');
  fs.mkdirSync(evidDir, { recursive: true });
  const rows = [];
  for (const pid of ['baseline', 'armed']) {
    for (const seed of seeds) {
      const row = await runOne(pid, seed, days, evidDir);
      const a = row.fieldfinish.analysis;
      const line = a
        ? `ffW3=${a.w3.fights} byOutcome=${JSON.stringify(a.w3.byOutcome)} woundedStrictW3=${a.w3.woundedRepeatsStrict} volleyW3=${a.w3.volleyDriveOffs} evadesW3=${a.w3.evades} tbW3=${a.w3.tbFightsW3} killsW3ByVia=${JSON.stringify(a.crossCheck.killsW3ByVia)} fieldVKillsW3=${a.crossCheck.fieldVKillsW3}`
        : `snapshot-only facedW3=${Object.keys(row.fieldfinish.faced || {}).filter(m => (row.fieldfinish.faced[m] | 0) >= 3).length} killsW3=${(row.fieldfinish.logEntries || []).filter(e => (e.w | 0) >= 3).length}`;
      console.log(`  [${pid} seed ${seed}] days=${row.days} gameDays=${row.gameDays} end=${row.endReason} wave=${row.waveReach} arc=${row.maxArc} finalRank=${row.finalRank} maxRank=${row.maxRank} natEver=${row.nationalEver} natFinal=${row.nationalFinal} table=${row.table} entered=${row.entered} won=${row.won} starv=${row.starvationDeaths} ${line} ts=${JSON.stringify(row.ts)}`);
      rows.push(row);
    }
  }
  const byPolicy = { baseline: aggregate(rows, 'baseline'), armed: aggregate(rows, 'armed') };
  const g2 = [];
  for (const seed of seeds) {
    const c = rows.find(r => r.policy === 'baseline' && r.seed === seed);
    const a = rows.find(r => r.policy === 'armed' && r.seed === seed);
    const ok = !!c && !!a && c.days === a.days && c.gameDays === a.gameDays
      && JSON.stringify(c.ts) === JSON.stringify(a.ts) && c.starvationDeaths === a.starvationDeaths;
    const facedOk = !!c && !!a && JSON.stringify(c.fieldfinish.faced) === JSON.stringify(a.fieldfinish.faced);
    const killsOk = !!c && !!a && JSON.stringify((c.fieldfinish.logEntries || []).map(e => [e.d, e.mid, e.w, e.by, e.via])) === JSON.stringify((a.fieldfinish.logEntries || []).map(e => [e.d, e.mid, e.w, e.by, e.via]));
    g2.push({ seed, ok, facedOk, killsOk, cDays: c ? c.days : null, aDays: a ? a.days : null, cGameDays: c ? c.gameDays : null, aGameDays: a ? a.gameDays : null });
  }
  const g2Pass = g2.every(x => x.ok);
  const armedRows = rows.filter(r => r.policy === 'armed');
  const baselineRows = rows.filter(r => r.policy === 'baseline');
  const g3Pass = rows.length === seeds.length * 2 && rows.every(r => r.days > 0 && r.fieldfinish && r.fieldfinish.faced && r.fieldfinish.logEntries)
    && armedRows.length === seeds.length && armedRows.every(r => Array.isArray(r.fieldfinish.fieldFights) && r.fieldfinish.analysis && r.fieldfinish.analysis.w3)
    && baselineRows.length === seeds.length && baselineRows.every(r => r.fieldfinish.analysis === null && !r.fieldfinish.fieldFights);
  const focusDetail = armedRows.filter(r => FOCUS_SEEDS.indexOf(r.seed) >= 0).map(r => ({
    seed: r.seed,
    woundedStrictW3: r.fieldfinish.analysis.w3.woundedRepeatsStrict,
    woundedRepeatsW3: r.fieldfinish.analysis.woundedRepeatsW3.map(w => ({ mid: w.fight.mid, day: w.fight.day, vid: w.fight.vid, startHp: w.fight.startHp, startFrac: w.fight.startFrac, endHp: w.fight.endHp, prevEndHp: w.prevEndHp, prevOutcome: w.prevOutcome, volleyDmg: w.fight.volleyDmg })),
    perTypeW3: Object.keys(r.fieldfinish.analysis.w3.perType || {}).map(mid => ({ mid, fights: r.fieldfinish.analysis.w3.perType[mid].fights, outcomes: r.fieldfinish.analysis.w3.perType[mid].outcomes, woundedRepeats: r.fieldfinish.analysis.w3.perType[mid].woundedRepeats })),
  }));
  const focusPassCount = focusDetail.filter(f => f.woundedStrictW3 >= 1).length;
  const bandStrict = byPolicy.armed.field.woundedStrictW3;
  const hypothesisIn = focusPassCount >= 2 && bandStrict >= 5;
  const report = {
    label: 'sim-fieldfinish-a pilot', seeds, days, rows, byPolicy,
    gates: { g2RecorderNeutrality: g2, g2Pass, g3CorpusIntegrity: g3Pass, focusDetail, focusPassCount, bandStrictW3: bandStrict },
    verdictInputs: { g2Pass, g3Pass, focusPassCount, bandStrictW3: bandStrict, focusBar: 2, bandBar: 5 },
    verdict: hypothesisIn ? 'HYPOTHESIS-IN' : 'HYPOTHESIS-OUT',
    verdictRule: 'IN iff >= 2 of focus seeds 73675/73677/73678 each carry >= 1 STRICT wave-3+ wounded-repeat AND band-wide >= 5 wave-3+ STRICT wounded-repeats. OUT otherwise.',
    generated: new Date().toISOString(),
  };
  const summaryPath = path.join(evidDir, 'summary.json');
  writeRowViaWriter(summaryPath, JSON.stringify(report, null, 1) + '\n');
  console.log('\n=== sim-fieldfinish-a pilot ===');
  for (const pid of ['baseline', 'armed']) {
    const b = byPolicy[pid];
    console.log(`  ${pid}: n=${b.n} won=${b.won} medD=${b.medianDays} medGameD=${b.medianGameDays} maxD=${b.maxDays} natEver=${b.nationalEver} natFinal=${b.nationalFinal} table=${b.table} entered=${b.entered} wave4=${b.wave4} wave5=${b.wave5} maxArc=${b.maxArc} starvTotal=${b.starvationTotal} deathTotal=${b.deathTotal} seatAttempts=${b.seatAttempts} seatTaken=${b.seatTaken} seatFailed=${b.seatFailed} field=${JSON.stringify(b.field)} mHpAtMFlee=${JSON.stringify(b.mHpAtMFlee)} mHpAtVKill=${JSON.stringify(b.mHpAtVKill)}`);
  }
  console.log(`  G2 recorder neutrality: ${g2Pass ? 'PASS' : 'FAIL'} (${g2.filter(x => x.ok).length}/${g2.length} seeds identical; faced-agree ${g2.filter(x => x.facedOk).length}/${g2.length}, kills-agree ${g2.filter(x => x.killsOk).length}/${g2.length})`);
  console.log(`  G3 corpus integrity: ${g3Pass ? 'PASS' : 'FAIL'}`);
  console.log(`  Focus (strict wounded-repeats): ${JSON.stringify(focusDetail.map(f => ({ seed: f.seed, n: f.woundedStrictW3 })))} -> ${focusPassCount}/3 seeds`);
  console.log(`  Band strict wounded-repeats W3: ${bandStrict} (bar 5)`);
  console.log(`  HYPOTHESIS: ${report.verdict} -> ${summaryPath}`);
  console.log('  NOTE: run --detgate separately for G1 (FIELDFINISH unset delegation).');
  if (!g2Pass || !g3Pass) { console.error('PROOF GATE FAILURE'); process.exit(1); }
}

async function detgateMode() {
  const seed = parseInt(process.env.SEED || '73671', 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const c = await runOne('baseline', seed, days, null);
  delete process.env.FIELDFINISH;
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  const wrapped = withFieldfinishDiag(tableseatNowait, 'fieldfinish-diag', 'tableseat-nowait + wounded field-finish recorder');
  const { Game } = await loadGame({ seed, mode: 'fieldfinish-diag-detgate', fullTelemetry: false });
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
  const hasDiagSurface = !!(capturedCtx && capturedCtx._fieldfinishdiag);
  const wrapsInstalled = !!Game._fieldfinishDiagInstalled;
  const ok = c.days === result.days && c.gameDays === result.gameDays
    && JSON.stringify(ts) === JSON.stringify(c.ts) && !hasDiagSurface && !wrapsInstalled;
  console.log(`DETGATE seed=${seed} baseline(tableseat-nowait) days=${c.days} gameDays=${c.gameDays} ts=${JSON.stringify(c.ts)} | wrapped(FIELDFINISH unset) days=${result.days} gameDays=${result.gameDays} ts=${JSON.stringify(ts)} diagSurface=${hasDiagSurface} wrapsInstalled=${wrapsInstalled} -> ${ok ? 'PASS' : 'FAIL'}`);
  if (!ok) process.exit(1);
}

async function detailMode(seedArg) {
  const seed = parseInt(process.env.DETAIL_SEED || seedArg || '73675', 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const evidDir = process.env.EVID || path.join(REPO, 'evidence', '2026-10-24', 'perseed-fieldfinish-a');
  let census = null;
  try { census = JSON.parse(fs.readFileSync(path.join(evidDir, `s${seed}-armed.json`), 'utf8')); } catch (e) { census = null; }
  const holder = {};
  const row = await runOne('armed', seed, days, null, holder);
  const store = holder.store;
  const a = row.fieldfinish.analysis;
  const same = !!census && census.days === row.days && census.gameDays === row.gameDays
    && JSON.stringify(census.ts) === JSON.stringify(row.ts)
    && census.fieldfinish.analysis.w3.fights === a.w3.fights
    && census.fieldfinish.analysis.w3.woundedRepeatsStrict === a.w3.woundedRepeatsStrict
    && JSON.stringify((census.fieldfinish.fieldFights || []).map(f => [f.day, f.mid, f.outcome, f.rounds, f.startHp, f.endHp])) === JSON.stringify((store.fieldFights || []).map(f => [f.day, f.mid, f.outcome, f.rounds, f.startHp, f.endHp]));
  console.log(`DETAIL-REPRO seed=${seed} days=${row.days} gameDays=${row.gameDays} censusMatch=${same} ffW3=${a.w3.fights} woundedStrictW3=${a.w3.woundedRepeatsStrict} byOutcomeW3=${JSON.stringify(a.w3.byOutcome)}`);
  if (!same) { console.error('DETAIL REPRODUCTION FAILURE: re-run does not match census row'); process.exit(1); }
  const analysisW3 = analyzeFieldFights(store.fieldFights.filter(f => (f.wave | 0) >= 3));
  console.log('DETAIL woundedRepeatsW3 (strict):');
  for (const w of analysisW3.woundedRepeats) {
    const f = w.fight;
    console.log(`DETAIL wr d${f.day} vid=${f.vid} mid=${f.mid} startHp=${f.startHp}/${f.startMax} startFrac=${f.startFrac != null ? f.startFrac.toFixed(3) : null} endHp=${f.endHp} rounds=${f.rounds} outcome=${f.outcome} prevEndHp=${w.prevEndHp} prevOutcome=${w.prevOutcome} volleyDmg=${f.volleyDmg} intent=${f.intent} hasRng=${f.hasRng}`);
  }
  console.log('DETAIL per-type wave-3+ sequences (day: outcome rounds start->end):');
  const byType = {};
  for (const f of store.fieldFights) {
    if ((f.wave | 0) < 3) continue;
    (byType[f.mid] = byType[f.mid] || []).push(f);
  }
  for (const mid of Object.keys(byType).sort()) {
    console.log(`DETAIL seq ${mid}: ` + byType[mid].map(f => `d${f.day}:${f.outcome}/r${f.rounds}/${f.startHp}->${f.endHp}${f.volleyDmg ? `(volley${f.volleyDmg})` : ''}`).join(' | '));
  }
  console.log('DETAIL killsW3 (kill log):');
  for (const e of row.fieldfinish.logEntries) {
    if ((e.w | 0) >= 3) console.log(`DETAIL kill d${e.d} mid=${e.mid} w=${e.w} by=${e.by} via=${e.via} trick=${e.trick}`);
  }
}

async function senseMode(seedArg) {
  const seed = parseInt(process.env.SENSE_SEED || seedArg || '73675', 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const out = process.env.SENSE_OUT || path.join(REPO, 'evidence', '2026-10-24', 'sim-fieldfinish-a-sense.txt');
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  process.env.FIELDFINISH = '1';
  const store = newStore();
  const armed = withFieldfinishDiag(tableseatNowait, 'fieldfinish-diag', 'tableseat-nowait + wounded field-finish recorder', store);
  const { Game } = await loadGame({ seed, mode: 'fieldfinish-diag-sense', fullTelemetry: false, narration: true });
  const t = {};
  const uninstall = PI.install(Game, t);
  await setupGame(Game);
  try { installFieldfinishDiag(Game, store); } catch (e) { /* install best-effort */ }
  let result;
  await quietLog(async () => { result = await runDays(Game, armed, { days, manifest: undefined, sampleEvery: 30 }); });
  try { uninstall(); } catch (e) { /* uninstall best-effort */ }
  const ring = t.sayRing || [];
  let pg = {};
  try { pg = Game.progState ? Game.progState() : {}; } catch (e) { /* prog best-effort */ }
  let ffLine = 'fieldfinish: unavailable';
  try {
    const ff = fieldfinishSnapshot(Game, store);
    const a = ff.analysis;
    ffLine = `fieldfinish: ffW3=${a.w3.fights} byOutcomeW3=${JSON.stringify(a.w3.byOutcome)} woundedStrictW3=${a.w3.woundedRepeatsStrict} volleyW3=${a.w3.volleyDriveOffs} evadesW3=${a.w3.evades} tbW3=${a.tbFightsW3} killsW3ByVia=${JSON.stringify(a.crossCheck.killsW3ByVia)} fieldVKillsW3=${a.crossCheck.fieldVKillsW3}`;
  } catch (e) { ffLine = 'fieldfinish error: ' + String((e && e.message) || e).slice(0, 160); }
  const header = [
    'SENSE-ONLY REPLAY — NON-MEASURED (narration shifts trajectories; never enters the census)',
    `seed=${seed} policy=tableseat-nowait+fieldfinish-diag days=${result.days} gameDays=${result.gameDays} endReason=${result.endReason} maxWave=${result.maxWaveUnlocked} sayLive=${!!t.sayLive} ringLines=${ring.length} tableWaiting=${!!pg.tableWaiting} tableDone=${!!pg.tableDone}`,
    ffLine,
    '',
  ].join('\n');
  const body = header + ring.map(s => `[d${s.day}] ${s.text}`).join('\n') + '\n';
  writeRowViaWriter(out, body);
  console.log(`SENSE-DONE seed=${seed} end=${result.endReason} ring=${ring.length} tableWaiting=${!!pg.tableWaiting} tableDone=${!!pg.tableDone} -> ${out}`);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--detgate')) return detgateMode();
  if (args.includes('--detail')) return detailMode(args[args.indexOf('--detail') + 1]);
  if (args.includes('--sense')) return senseMode(args[args.indexOf('--sense') + 1]);
  return sweepMode();
}
if (require.main === module) main().catch(e => { console.error('FIELDFINISH-DIAG SWEEP FAILED:', (e && e.stack) || e); process.exit(1); });
module.exports = { runOne, aggregate, writeRowViaWriter, fieldfinishSnapshot };
