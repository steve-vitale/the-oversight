#!/usr/bin/env node
// scripts/test-devotiongate-sweep.js — sim-devotiongate-a sweep
// (scale-onramp axis, 2026-10-26: observe the devotion gate.
// POLICY-SIDE ONLY, zero src/js changes.)
//
// TWO ARMS on identical seeds (73671-73678, 180d death-aware):
//   control = tableseat-nowait + feastdraw-diag +
//             nonworldkill-diag + devotiongate-diag
//             (recorders only; no staging)
//   devotiongate = devotiongate policy (DEVOTIONGATE=1:
//             stage one unarmed reactor-free feast per
//             affordable dusk) + the same three recorders
// The control side is this run's OWN baseline on current
// master — never a published band and never any sibling
// arm's corpus.
//
// Modes (read the argv handling here — do NOT probe with --help):
//   --one <pid> <seed> : run one seed, write its row.
//   --summary : build summary.json from the rows on disk, print
//     the comparison table + DIAG-GO verdict computation. Exit 1
//     on corpus failure (missing rows, recorder errors > 0).
//   --detgate : delegation-off proof on one seed (SEED env,
//     default 73671): plain tableseat-nowait vs the
//     devotiongate policy with DEVOTIONGATE unset +
//     recorders off must match on days/gameDays/ts, with no
//     ctx dg surface and no installed wraps.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { tableseatNowait } = require('./policies/tableseat-nowait');
const { devotiongate } = require('./policies/devotiongate');
const {
  newStore: newFdStore, installFeastdrawDiag, withFeastdrawDiag,
  analyzeFeastdraw,
} = require('./policies/feastdraw-diag');
const {
  newStore: newNwkStore, installNonworldkillDiag, withNonworldkillDiag,
  analyzeNonworldkill,
} = require('./policies/nonworldkill-diag');
const {
  newStore: newDgStore, installDevotiongateDiag, withDevotiongateDiag,
  analyzeDevotiongate, refusalReason,
} = require('./policies/devotiongate-diag');

const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
const STARV_RE = /starv|hunger/i;
const SEEDS = (process.env.SEEDS || '73671,73672,73673,73674,73675,73676,73677,73678')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
// Rebaseline authoritative table (sim-rebaseline-a, comparison
// only — diagnostic, never a gate; the own control side is the
// judge). Per-seed {days, won, deaths}.
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

async function runOne(pid, seed, days, evidDir) {
  // Per-arm env, set explicitly every call (the process runs
  // seeds sequentially; a previous arm's value must never leak).
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  process.env.FEASTDRAW = '1';
  process.env.NONWORLDKILL = '1';
  process.env.DEVOTIONGATEDIAG = '1';
  if (pid === 'devotiongate') {
    process.env.DEVOTIONGATE = '1';
  } else {
    delete process.env.DEVOTIONGATE;
  }
  const fdStore = newFdStore(), nwkStore = newNwkStore(), dgStore = newDgStore();
  const inner = pid === 'devotiongate' ? devotiongate : tableseatNowait;
  const base = withDevotiongateDiag(withFeastdrawDiag(withNonworldkillDiag(inner, 'nonworldkill-diag', 'devotiongate sweep + TB initiation census', nwkStore), 'feastdraw-diag', 'devotiongate sweep + feast-draw yield census', fdStore), 'devotiongate-diag', 'devotiongate sweep + gate decision census', dgStore);
  const { Game } = await loadGame({ seed, mode: 'devotiongate-' + pid, fullTelemetry: false });
  await setupGame(Game);
  try { installNonworldkillDiag(Game, nwkStore); } catch (e) {}
  try { installFeastdrawDiag(Game, fdStore); } catch (e) {}
  try { installDevotiongateDiag(Game, dgStore); } catch (e) {}
  // Say-line capture (sweep-side instrumentation only: records
  // lines, writes no game state, draws no RNG). Grant / refusal
  // lines, capped — the sense read's raw transcript.
  const sayLines = [];
  try {
    const origSay = Game.say;
    if (typeof origSay === 'function') {
      Game.say = function () {
        try {
          const t = String((arguments.length ? arguments[0] : '') || '');
          if (/circling the edge|drove off|never brave|gives up and moves on|stoked higher|carries you on|FEASTED|devotion gate|reactor is a ceiling|Feast buff refused/i.test(t) && sayLines.length < 200) {
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
      if (k.indexOf('fd') === 0 || k.indexOf('ts') === 0 || k.indexOf('fr') === 0 || k.indexOf('dg') === 0) ctxFd[k] = capturedCtx[k];
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
    devotiongate: {
      gates: dgStore.gates,
      diag: { errs: dgStore.errs, errors: dgStore.errors, overflow: dgStore.overflow, installed: dgStore.installed },
    },
  };
  if (evidDir) {
    const fn = path.join(evidDir, `s${seed}-${pid}.json`);
    writeFileRetry(fn, JSON.stringify(row, null, 1) + '\n');
    row.corpusFile = fn;
  }
  return row;
}

function evidDirOf() { return process.env.EVID || path.join(REPO, 'evidence', '2026-10-26', 'perseed-sim-devotiongate-a'); }

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
  let dgLine = 'devotiongate=null';
  if (row.devotiongate) {
    try {
      const da = analyzeDevotiongate(row.devotiongate, row.feastdraw);
      dgLine = `gates=${da.gates} joinMismatch=${da.joinMismatch} contradictions=${da.contradictionCount} decisions=${JSON.stringify(da.counts)} devotionRefusals=${da.devotionRefusalCount} gatePassReactorFree=${da.gatePassReactorFreeCount} dgErrs=${row.devotiongate.diag.errs}`;
    } catch (e) { dgLine = `devotiongate analyze failed: ${String((e && e.message) || e).slice(0, 120)}`; }
  }
  const fd = row.ctxFd || {};
  const dg = { attempts: fd.dgAttempts || 0, staged: fd.dgStaged || 0, skips: fd.dgSkips || {} };
  console.log(`  [${pid} seed ${seed}] days=${row.days} gameDays=${row.gameDays} end=${row.endReason} wave=${row.waveReach} arc=${row.maxArc} finalRank=${row.finalRank} natEver=${row.nationalEver} natFinal=${row.nationalFinal} table=${row.table} entered=${row.entered} won=${row.won} starv=${row.starvationDeaths} deaths=${row.deathTotal} sayLines=${row.sayLines.length} tsNationalDay=${fd.tsNationalDay != null ? fd.tsNationalDay : 'null'} ${fdLine} ${dgLine} staging=${JSON.stringify(dg)}`);
}

// Band rollup for one arm + the devotiongate analysis.
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
    arc4: rows.filter(r => (r.maxArc || 1) >= 4).length,
    wave3: rows.filter(r => (r.waveReach || 1) >= 3).length,
    wave4: rows.filter(r => (r.waveReach || 1) >= 4).length,
    wave5: rows.filter(r => (r.waveReach || 1) >= 5).length,
    starvationTotal: rows.reduce((t, r) => t + r.starvationDeaths, 0),
    deathTotal: rows.reduce((t, r) => t + r.deathTotal, 0),
  };
  const fd = { grants: 0, fresh: 0, refreshed: 0, refused: 0, spawned: 0, notSpawned: 0, notSpawnedByWhy: {}, outcomes: {}, faced: 0, facedFace: 0, facedHarness: 0, drivenOff: 0, unmet: 0, facedWithKill: 0, totalKills: 0, wave4Draws: 0, wave4Kills: 0, castVeteranDraws: 0, waveDist: {}, unclassified: 0, drawOutcomes: [] };
  const dg = { gates: 0, joinMismatch: 0, contradictionCount: 0, contradictions: [], counts: {}, devotionRefusals: [], gatePassReactorFree: 0, otherRefusals: [], attempts: 0, staged: 0, stageDays: [], skips: {} };
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
    let da = null;
    try { da = analyzeDevotiongate(r.devotiongate, r.feastdraw); } catch (e) { console.log(`  DEVOTIONGATE ANALYZE FAILED ${pid} seed=${r.seed}: ${String((e && e.message) || e).slice(0, 120)}`); }
    if (da) {
      dg.gates += da.gates; dg.joinMismatch += da.joinMismatch; dg.contradictionCount += da.contradictionCount;
      for (const c of da.contradictions) dg.contradictions.push(Object.assign({ seed: r.seed }, c));
      for (const k of Object.keys(da.counts)) dg.counts[k] = (dg.counts[k] || 0) + da.counts[k];
      for (const d of da.devotionRefusals) dg.devotionRefusals.push(Object.assign({ seed: r.seed }, { idx: d.idx, day: d.gate.day, pre: d.gate.pre, why: d.gate.why }));
      dg.gatePassReactorFree += da.gatePassReactorFreeCount;
      for (const d of da.otherRefusals) dg.otherRefusals.push(Object.assign({ seed: r.seed }, { idx: d.idx, day: d.gate.day, why: d.gate.why }));
    }
    const cfd = r.ctxFd || {};
    dg.attempts += (cfd.dgAttempts || 0);
    dg.staged += (cfd.dgStaged || 0);
    for (const d of (cfd.dgStageDays || [])) dg.stageDays.push({ seed: r.seed, day: d });
    for (const k of Object.keys(cfd.dgSkips || {})) dg.skips[k] = (dg.skips[k] || 0) + cfd.dgSkips[k];
  }
  fd.drawsPerFreshGrant = fd.fresh ? fd.spawned / fd.fresh : null;
  fd.facedRate = fd.spawned ? fd.faced / fd.spawned : null;
  fd.drivenOffRate = fd.spawned ? fd.drivenOff / fd.spawned : null;
  fd.killRate = fd.faced ? fd.facedWithKill / fd.faced : null;
  fd.veteransPerDraw = fd.spawned ? fd.wave4Kills / fd.spawned : null;
  return { band, feastdraw: fd, devotiongate: dg };
}

async function summaryMode() {
  const evidDir = evidDirOf();
  const arms = {};
  let corpusOk = true;
  for (const pid of ['control', 'devotiongate']) {
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
      && r.devotiongate && Array.isArray(r.devotiongate.gates)
      && r.devotiongate.diag.errs === 0 && Object.values(r.devotiongate.diag.overflow || {}).every(v => (v | 0) === 0));
    if (!ok) corpusOk = false;
    arms[pid] = Object.assign({ rows }, rollupArm(pid, rows));
  }
  const c = arms.control, d = arms.devotiongate;
  const agreement = SEEDS.map(s => {
    const r = c.rows.find(x => x.seed === s), b = REBASELINE[s];
    const agree = !!(r && b && r.days === b.days && r.won === b.won && r.deathTotal === b.deaths);
    return { seed: s, control: r ? { days: r.days, won: r.won, deaths: r.deathTotal } : null, rebaseline: b, agree: agree };
  });
  const agreeCount = agreement.filter(a => a.agree).length;
  // National pairing per seed: tsNationalDay present AND maxRank national+?
  const nationalPairing = SEEDS.map(s => {
    const r = c.rows.find(x => x.seed === s);
    const tsDay = r && r.ctxFd ? r.ctxFd.tsNationalDay : null;
    return { seed: s, control: { nationalEver: r ? r.nationalEver : null, maxRank: r ? r.maxRank : null, tsNationalDay: tsDay != null ? tsDay : null, paired: !!((r && r.nationalEver) === (tsDay != null)) } };
  });
  const nationalPairingDev = SEEDS.map(s => {
    const r = d.rows.find(x => x.seed === s);
    const tsDay = r && r.ctxFd ? r.ctxFd.tsNationalDay : null;
    return { seed: s, devotiongate: { nationalEver: r ? r.nationalEver : null, maxRank: r ? r.maxRank : null, tsNationalDay: tsDay != null ? tsDay : null, paired: !!((r && r.nationalEver) === (tsDay != null)) } };
  });
  // Per-seed table for the evidence file.
  const perSeed = SEEDS.map(s => {
    const cr = c.rows.find(r => r.seed === s), dr = d.rows.find(r => r.seed === s);
    return {
      seed: s,
      control: cr ? { days: cr.days, won: cr.won, wave: cr.waveReach, arc: cr.maxArc, finalRank: cr.finalRank, maxRank: cr.maxRank, natEver: cr.nationalEver, natFinal: cr.nationalFinal, table: cr.table, entered: cr.entered, starv: cr.starvationDeaths, deaths: cr.deathTotal, grants: (cr.feastdraw.grants || []).length, tsNationalDay: (cr.ctxFd || {}).tsNationalDay != null ? cr.ctxFd.tsNationalDay : null } : null,
      devotiongate: dr ? { days: dr.days, won: dr.won, wave: dr.waveReach, arc: dr.maxArc, finalRank: dr.finalRank, maxRank: dr.maxRank, natEver: dr.nationalEver, natFinal: dr.nationalFinal, table: dr.table, entered: dr.entered, starv: dr.starvationDeaths, deaths: dr.deathTotal, grants: (dr.feastdraw.grants || []).length, tsNationalDay: (dr.ctxFd || {}).tsNationalDay != null ? dr.ctxFd.tsNationalDay : null, staged: (dr.ctxFd || {}).dgStaged || 0, attempts: (dr.ctxFd || {}).dgAttempts || 0 } : null,
    };
  });
  // DIAG-GO legs (pre-registered, computable legs): (a) a
  // devotion-gate decision observed — a devotion refusal, OR a
  // gate pass with the reactor provably not binding (pre
  // reactorOnline false); (c) classification complete —
  // unclassified 0 both arms, contradictions 0 both arms,
  // joinMismatch 0 both arms; (d) join completeness —
  // gates == grants on every seed, both arms. Leg (b), the
  // check order stated from code with exact conditions
  // quoted, is an evidence-text leg, judged when the
  // evidence file is read — the summary reports it as
  // manual and does NOT auto-pass it.
  const legs = {
    a_decisionObserved: (c.devotiongate.devotionRefusals.length + d.devotiongate.devotionRefusals.length > 0)
      || (c.devotiongate.gatePassReactorFree + d.devotiongate.gatePassReactorFree > 0),
    c_classified: c.feastdraw.unclassified === 0 && d.feastdraw.unclassified === 0
      && c.devotiongate.contradictionCount === 0 && d.devotiongate.contradictionCount === 0
      && c.devotiongate.joinMismatch === 0 && d.devotiongate.joinMismatch === 0,
    d_joinComplete: c.rows.every(r => (r.devotiongate.gates || []).length === (r.feastdraw.grants || []).length)
      && d.rows.every(r => (r.devotiongate.gates || []).length === (r.feastdraw.grants || []).length),
  };
  legs.allComputableOk = legs.a_decisionObserved && legs.c_classified && legs.d_joinComplete;
  const verdict = (corpusOk && legs.allComputableOk) ? 'DIAG-GO (computable legs; leg (b) check-order text judged in evidence)' : 'NO-GO';
  const summary = {
    arms: {
      control: { band: c.band, feastdraw: c.feastdraw, devotiongate: c.devotiongate },
      devotiongate: { band: d.band, feastdraw: d.feastdraw, devotiongate: d.devotiongate },
    },
    agreement: agreement, agreeCount: agreeCount,
    nationalPairing: nationalPairing, nationalPairingDev: nationalPairingDev,
    perSeed: perSeed,
    legs: legs, verdict: verdict, corpusOk: corpusOk,
  };
  const summaryPath = path.join(evidDir, 'summary.json');
  writeFileRetry(summaryPath, JSON.stringify(summary, null, 1) + '\n');
  console.log(`  CONTROL band: won=${c.band.won}/8 median=${c.band.medianDays}d medianNonWon=${c.band.medianNonWonDays}d natEver=${c.band.nationalEver} natFinal=${c.band.nationalFinal} table=${c.band.table} entered=${c.band.entered} arc4=${c.band.arc4} wave4=${c.band.wave4} wave5=${c.band.wave5} starv=${c.band.starvationTotal} deaths=${c.band.deathTotal}`);
  console.log(`  DEVOTIONGATE band: won=${d.band.won}/8 median=${d.band.medianDays}d medianNonWon=${d.band.medianNonWonDays}d natEver=${d.band.nationalEver} natFinal=${d.band.nationalFinal} table=${d.band.table} entered=${d.band.entered} arc4=${d.band.arc4} wave4=${d.band.wave4} wave5=${d.band.wave5} starv=${d.band.starvationTotal} deaths=${d.band.deathTotal}`);
  console.log(`  CONTROL grants: ${c.feastdraw.grants} (fresh=${c.feastdraw.fresh} refreshed=${c.feastdraw.refreshed} refused=${c.feastdraw.refused}) draws=${c.feastdraw.spawned} faced=${c.feastdraw.faced} driven=${c.feastdraw.drivenOff} kills=${c.feastdraw.totalKills} w4draws=${c.feastdraw.wave4Draws} w4kills=${c.feastdraw.wave4Kills} unclass=${c.feastdraw.unclassified}`);
  console.log(`  DEVOTIONGATE grants: ${d.feastdraw.grants} (fresh=${d.feastdraw.fresh} refreshed=${d.feastdraw.refreshed} refused=${d.feastdraw.refused}) draws=${d.feastdraw.spawned} faced=${d.feastdraw.faced} driven=${d.feastdraw.drivenOff} kills=${d.feastdraw.totalKills} w4draws=${d.feastdraw.wave4Draws} w4kills=${d.feastdraw.wave4Kills} unclass=${d.feastdraw.unclassified}`);
  console.log(`  DEVOTIONGATE decisions control: ${JSON.stringify(c.devotiongate.counts)} devotionRefusals=${c.devotiongate.devotionRefusals.length} gatePassReactorFree=${c.devotiongate.gatePassReactorFree} joinMismatch=${c.devotiongate.joinMismatch} contradictions=${c.devotiongate.contradictionCount}`);
  console.log(`  DEVOTIONGATE decisions devotiongate-arm: ${JSON.stringify(d.devotiongate.counts)} devotionRefusals=${d.devotiongate.devotionRefusals.length} gatePassReactorFree=${d.devotiongate.gatePassReactorFree} joinMismatch=${d.devotiongate.joinMismatch} contradictions=${d.devotiongate.contradictionCount}`);
  console.log(`  STAGING devotiongate-arm: attempts=${d.devotiongate.attempts} staged=${d.devotiongate.staged} stageDays=${JSON.stringify(d.devotiongate.stageDays)} skips=${JSON.stringify(d.devotiongate.skips)}`);
  console.log(`  DEVOTION REFUSALS: ${JSON.stringify(c.devotiongate.devotionRefusals.concat(d.devotiongate.devotionRefusals))}`);
  console.log(`  CONTROL-AGREEMENT vs rebaseline: ${agreeCount}/8 agree — ${agreement.map(a => `s${a.seed}:${a.agree ? 'agree' : ('DEVIATE c=' + JSON.stringify(a.control) + ' r=' + JSON.stringify(a.rebaseline))}`).join(' ')}`);
  console.log(`  NATIONAL PAIRING control: ${nationalPairing.map(x => `s${x.seed}:${x.control.paired ? 'paired' : 'MISMATCH'} (natEver=${x.control.nationalEver}, maxRank=${x.control.maxRank}, tsDay=${x.control.tsNationalDay})`).join(' ')}`);
  console.log(`  NATIONAL PAIRING devotiongate-arm: ${nationalPairingDev.map(x => `s${x.seed}:${x.devotiongate.paired ? 'paired' : 'MISMATCH'} (natEver=${x.devotiongate.nationalEver}, maxRank=${x.devotiongate.maxRank}, tsDay=${x.devotiongate.tsNationalDay})`).join(' ')}`);
  console.log(`  LEGS: (a)decisionObserved ${legs.a_decisionObserved} | (c)classified ${legs.c_classified} | (d)joinComplete ${legs.d_joinComplete} | ALL-COMPUTABLE ${legs.allComputableOk} | (b)check-order-text MANUAL (see evidence)`);
  console.log(`  VERDICT: ${verdict} | CORPUS: ${corpusOk ? 'PASS' : 'FAIL'} -> ${summaryPath}`);
  if (!corpusOk) { console.error('PROOF GATE FAILURE'); process.exit(1); }
}

async function detgateMode() {
  const seed = parseInt(process.env.SEED || '73671', 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  delete process.env.DEVOTIONGATE; delete process.env.DEVOTIONGATEDIAG;
  delete process.env.FEASTDRAW; delete process.env.NONWORLDKILL;
  process.env.LEANLINKRESCUE = '1'; process.env.TABLESEATNOWAIT = '1';
  // Baseline: plain tableseat-nowait.
  const b = await (async () => {
    const { Game } = await loadGame({ seed, mode: 'devotiongate-detgate-base', fullTelemetry: false });
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
  // Wrapped but OFF: devotiongate policy with the layer env
  // unset, recorders off — must delegate byte-identically.
  const w = await (async () => {
    const { Game } = await loadGame({ seed, mode: 'devotiongate-detgate-wrapped', fullTelemetry: false });
    await setupGame(Game);
    const fdStore = newFdStore(), nwkStore = newNwkStore(), dgStore = newDgStore();
    const base = withDevotiongateDiag(withFeastdrawDiag(withNonworldkillDiag(devotiongate, 'nonworldkill-diag', 'detgate', nwkStore), 'feastdraw-diag', 'detgate', fdStore), 'devotiongate-diag', 'detgate', dgStore);
    let capturedCtx = null;
    const policy = Object.assign({}, base, {
      daily(G, ctx) { if (!capturedCtx) capturedCtx = ctx; return base.daily(G, ctx); },
    });
    const result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 10 });
    const ts = {};
    if (capturedCtx) for (const k of Object.keys(capturedCtx)) if (k.indexOf('ts') === 0) ts[k] = capturedCtx[k];
    const hasDgSurface = !!(capturedCtx && (capturedCtx.dgAttempts != null || capturedCtx.dgSkips != null || capturedCtx.dgStaged != null || capturedCtx.dgErr != null || capturedCtx._dgDay != null));
    const hasFdSurface = !!(capturedCtx && (capturedCtx._feastdraw || capturedCtx._nonworldkill || capturedCtx._devotiongate));
    const wrapsInstalled = !!Game._feastdrawDiagInstalled || !!Game._nonworldkillDiagInstalled || !!Game._devotiongateDiagInstalled;
    return { days: result.days, gameDays: result.gameDays, ts: ts, hasDgSurface: hasDgSurface, hasFdSurface: hasFdSurface, wrapsInstalled: wrapsInstalled };
  })();
  const ok = b.days === w.days && b.gameDays === w.gameDays
    && JSON.stringify(b.ts) === JSON.stringify(w.ts) && !w.hasDgSurface && !w.hasFdSurface && !w.wrapsInstalled;
  console.log(`DETGATE seed=${seed} baseline days=${b.days} gameDays=${b.gameDays} ts=${JSON.stringify(b.ts)} | wrapped(OFF) days=${w.days} gameDays=${w.gameDays} ts=${JSON.stringify(w.ts)} dgSurface=${w.hasDgSurface} fdSurface=${w.hasFdSurface} wrapsInstalled=${w.wrapsInstalled} -> ${ok ? 'PASS' : 'FAIL'}`);
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
if (require.main === module) main().catch(e => { console.error('DEVOTIONGATE SWEEP FAILED:', (e && e.stack) || e); process.exit(1); });
module.exports = { runOne, rollupArm, SEEDS, REBASELINE };
