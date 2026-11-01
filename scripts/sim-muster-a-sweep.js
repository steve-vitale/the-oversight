#!/usr/bin/env node
// sim-muster-a-sweep.js — MUSTER FORMATION census (DIAG ONLY).
//
// Substrate (named exactly, see the prereg): tableseat-nowait
// (LEANLINKRESCUE=1, TABLESEATNOWAIT=1) + fullseat-diag + wavegate-diag
// + vet2-diag + vet2mfg-diag, all REUSED UNMODIFIED, plus muster-diag
// (MUSTER=1, REUSED UNMODIFIED, herald refusal snapshots + verb
// counters). New capture (this arm) wraps ONLY: titanDawnTick
// (dawn trajectory snapshots), Game.say (call/omen/refusal lines +
// 12-line ring for first-event beats), startCombat (titan
// return-null cross-check vs titangate). Sweep-side wrappers are
// pure observation: call through with identical arguments and
// return values, never mutate game state, never draw RNG, never
// throw into the engine (recording errors are counted).
//
// STDOUT-RUNNER (titangate lesson): the game-loaded process never
// writes a file — it prints EXACTLY ONE JSON line per seed to
// stdout (progress to stderr). The REUSED splitter
// (scripts/vet2mfg-split.js, plain node, no game loaded) splits
// the stdout file into per-seed JSONs.
//
//   LEANLINKRESCUE=1 TABLESEATNOWAIT=1 FULLSEAT=1 WAVEGATE=1 VET2=1 VET2MFG=1 \
//     MUSTER=1 SIMMUSTERA=1 SEEDS=95304 node scripts/sim-muster-a-sweep.js > out.jsonl 2> out.err
//   node scripts/vet2mfg-split.js out.jsonl <evid-dir>
//
// Legs: ON = SIMMUSTERA=1 (this capture + muster-diag installed).
// OFF = SIMMUSTERA unset (same substrate + diag policies, neither
// capture installed; the neutrality leg's OFF side).
'use strict';
const path = require('path');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { tableseatNowait } = require(path.join(REPO, 'scripts', 'policies', 'tableseat-nowait'));
const WG = require(path.join(REPO, 'scripts', 'policies', 'wavegate-diag'));
const FD = require(path.join(REPO, 'scripts', 'policies', 'fullseat-diag'));
const V2 = require(path.join(REPO, 'scripts', 'policies', 'vet2-diag'));
const MFG = require(path.join(REPO, 'scripts', 'policies', 'vet2mfg-diag'));
const MD = require(path.join(REPO, 'scripts', 'policies', 'muster-diag'));
const LIB = require(path.join(REPO, 'scripts', 'sim-muster-a-lib'));

for (const k of ['LEANLINKRESCUE', 'TABLESEATNOWAIT', 'FULLSEAT', 'WAVEGATE', 'VET2', 'VET2MFG']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required.`); process.exit(2); }
}
const CAP_ON = process.env.SIMMUSTERA === '1';
if (CAP_ON && process.env.MUSTER !== '1') { console.error('SWEEP STOP: MUSTER=1 is required on the ON leg.'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : []).filter(Number.isFinite);
if (!SEEDS.length) { console.error('SWEEP STOP: SEEDS required.'); process.exit(2); }
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

function policyFor() {
  const wg = WG.withWavegateDiag(tableseatNowait, 'wavegate-diag', 'tableseat-nowait + wave-gate recorder');
  const fd = FD.withFullseatDiag(wg, 'fullseat-diag', 'tableseat-nowait + full-seat recorder');
  const v2 = V2.withVet2Diag(fd, 'vet2-diag', 'tableseat-nowait + veteran recorder');
  return MFG.withVet2mfgDiag(v2, 'vet2mfg-diag', 'tableseat-nowait + wave-4 funnel recorder');
}

const TITAN_IDS = ['herald', 'nielsen', 'finale', 'the_network'];

function installMusterACapture(Game, store) {
  const dayOf = () => { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } };
  const titanDefs = () => { try { return (Game.data && Game.data.titans) || {}; } catch (e) { return {}; } };
  const needOf = (tid) => { try { const d = titanDefs()[tid]; return (d && d.minAllies) || null; } catch (e) { return null; } };
  const musterOf = (tid) => { try { return (((Game.state || {}).titans || {}).musters || {})[tid] || null; } catch (e) { return null; } };
  const omenOf = (tid) => { try { return (((Game.state || {}).titans || {}).omens || {})[tid] || null; } catch (e) { return null; } };
  const slainOf = (tid) => { try { return !!(((Game.state || {}).titans || {}).slain || {})[tid]; } catch (e) { return false; } };

  // Pure-read link table + hypothetical yield for one titan (replicates
  // soundTitanCall's per-link rules via the shared lib; never calls it).
  function linkTable(tid) {
    const out = { links: [], yield: null, yieldErr: null };
    try {
      const muster = musterOf(tid);
      const already = {};
      (muster && muster.allies || []).forEach(function (a) { if (a && a.villageId) already[a.villageId] = (already[a.villageId] || 0) + 1; });
      let links = [];
      try { links = (typeof Game.hierarchyState === 'function') ? Game.hierarchyState() : []; } catch (e) { links = []; }
      const committed = {};
      try {
        const allM = ((Game.state || {}).titans || {}).musters || {};
        Object.keys(allM).forEach(function (t2) {
          if (slainOf(t2)) return;
          (allM[t2] && allM[t2].allies || []).forEach(function (a) { if (a && a.vid) committed[a.villageId + ':' + a.vid] = true; });
        });
      } catch (e) {}
      const plain = [];
      (links || []).filter(function (l) { return l && l.status === 'active'; }).forEach(function (link) {
        try {
          let vid = null;
          try { vid = (typeof Game._linkOther === 'function') ? Game._linkOther(link, 'haven') : (link.primary === 'haven' ? link.subordinate : link.primary); } catch (e) { vid = null; }
          let ov = null;
          try { ov = (typeof Game._otherVillage === 'function') ? Game._otherVillage(vid) : null; } catch (e) { ov = null; }
          let facesFree = 0;
          try {
            facesFree = ((ov && ov.roster) || []).filter(function (r) {
              return r && r.alive && (r.age == null || r.age >= 18) && (r.health === undefined || r.health > 0) && !committed[vid + ':' + r.id];
            }).length;
          } catch (e) { facesFree = 0; }
          plain.push({ villageId: vid, trust: link.trust || 0, opinion: (ov && ov.opinion) || 0, arrears: link.arrears || 0, facesFree: facesFree });
        } catch (e) {}
      });
      out.links = plain;
      const cfg = (titanDefs()._coalition || {});
      out.yield = LIB.hypotheticalYield(plain, cfg, already);
    } catch (e) { out.yieldErr = String((e && e.message) || e).slice(0, 120); }
    return out;
  }

  function titanSnap(tid) {
    const muster = musterOf(tid);
    let alliesRaw = 0, havenRaw = 0, alliesUnique = 0, havenValid = 0;
    try { alliesRaw = muster ? (muster.allies || []).length : 0; } catch (e) {}
    try { havenRaw = muster ? (muster.haven || []).length : 0; } catch (e) {}
    try { if (muster) alliesUnique = MD.uniqueAllies(Game, muster).length; } catch (e) {}
    try { if (muster) havenValid = MD.havenBlades(Game, muster).length; } catch (e) {}
    const omen = omenOf(tid);
    const lt = linkTable(tid);
    return {
      tid: tid, day: dayOf(), need: needOf(tid), slain: slainOf(tid),
      omenStage: omen ? (omen.stage != null ? omen.stage : null) : null,
      omenDay: omen ? (omen.day != null ? omen.day : null) : null,
      musterExists: !!muster, alliesRaw: alliesRaw, alliesUnique: alliesUnique,
      havenRaw: havenRaw, havenValid: havenValid,
      size: alliesUnique + havenValid,
      linksActive: lt.links.length, yieldTotal: lt.yield ? lt.yield.total : null,
      yieldLinks: lt.yield ? lt.yield.links : [], yieldErr: lt.yieldErr,
      offered: !!(omen && omen.stage >= 2 && !slainOf(tid)),
    };
  }

  const lastSnap = {}; // tid -> last trajectory signature
  function dawnSnapshot() {
    try {
      const day = dayOf();
      TITAN_IDS.forEach(function (tid) {
        const s = titanSnap(tid);
        const sig = [s.omenStage, s.alliesUnique, s.havenValid, s.linksActive, s.yieldTotal, s.offered].join('|');
        if (lastSnap[tid] !== sig) {
          store.trajectory.push(s);
          lastSnap[tid] = sig;
        }
        // First-event bookkeeping (per titan).
        const fe = store.firstEvents[tid] || (store.firstEvents[tid] = {});
        if (fe.firstOmen2Day == null && s.omenStage >= 2) {
          fe.firstOmen2Day = day;
          fe.yieldAtFirstOmen2 = s.yieldTotal;
          fe.linksAtFirstOmen2 = s.linksActive;
          fe.beatOmen2 = store.ring.slice();
        }
        if (s.size > 0 && fe.firstPositiveDay == null) fe.firstPositiveDay = day;
      });
    } catch (e) { store.captureErrs++; if (store.errors.length < 20) store.errors.push('dawn: ' + String((e && e.message) || e).slice(0, 120)); }
  }

  const origs = {};
  const wrap = (method, fn) => {
    const orig = Game[method];
    if (typeof orig !== 'function') { store.captureErrs++; return; }
    origs[method] = orig;
    Game[method] = fn(orig);
  };

  // titanDawnTick: snapshot AFTER the tick (omen advance + upkeep applied).
  wrap('titanDawnTick', (orig) => function () {
    const r = orig.apply(this, arguments);
    dawnSnapshot();
    return r;
  });

  // Game.say: needles + ring. NOTE: muster-diag wraps say first when
  // installed before this capture; wrapping again chains correctly
  // (each wrapper calls its orig). This wrapper only reads.
  const NEEDLES = [
    ['call', /THE CALL GOES OUT/],
    ['call-answer', /answers! .* will march/],
    ['call-refuse', /REFUSES\./],
    ['omen2', /Scouts found its lair/],
    ['refusal', /does not notice you/],
    ['council', /WAR COUNCIL/],
    ['commit', /Haven commits its own/],
    ['standdown', /muster against .* stood down|No muster stands/],
    ['omen0', /Scouts come back pale/],
    ['omen1', /They name it/],
  ];
  wrap('say', (orig) => function () {
    try {
      const raw = (arguments.length && arguments[0] != null) ? String(arguments[0]) : '';
      store.ring.push({ day: dayOf(), text: raw.slice(0, 500) });
      if (store.ring.length > 12) store.ring.shift();
      NEEDLES.forEach(function (spec) {
        if (spec[1].test(raw)) {
          store.sayLines.push({ day: dayOf(), kind: spec[0], text: raw.slice(0, 500) });
          // First-event beats: first refusal / first call per seed.
          if (spec[0] === 'refusal' && !store.firstEvents._refusalBeat) store.firstEvents._refusalBeat = store.ring.slice();
          if (spec[0] === 'call' && !store.firstEvents._callBeat) store.firstEvents._callBeat = store.ring.slice();
        }
      });
    } catch (e) { store.captureErrs++; }
    return orig.apply(this, arguments);
  });

  // startCombat: titan return-null cross-check (titangate semantics,
  // minimal: kind + day + null + outcomes-detail have/need when present).
  wrap('startCombat', (orig) => function () {
    let r, threw = null;
    try { r = orig.apply(this, arguments); } catch (e) { threw = e; throw e; }
    try {
      const mid = arguments.length ? arguments[0] : null;
      const isTitan = TITAN_IDS.indexOf(mid) >= 0 ||
        (function () { try { return typeof Game.isTitan === 'function' && Game.isTitan(mid); } catch (e) { return false; } })();
      if (isTitan && (r === null || r === undefined)) {
        let have = null, need = needOf(mid), gate = null;
        try {
          const outs = ((Game.state || {}).titans || {}).outcomes || [];
          for (let i = outs.length - 1; i >= 0; i--) {
            const o = outs[i];
            if (o && o.titan === mid && o.outcome === 'refused') { have = (o.detail && o.detail.have != null) ? o.detail.have : null; gate = (o.detail && o.detail.gate) || null; break; }
          }
        } catch (e) {}
        store.refusals.push({ day: dayOf(), mid: mid, have: have, need: need, gate: gate });
      }
    } catch (e) { store.captureErrs++; }
    return r;
  });

  // Verb-triggered same-day notes (guard against intra-day muster
  // changes missed by dawn snapshots): muster-diag already counts
  // the verbs; here we only snapshot sizes around each verb call.
  // To avoid double-wrapping the verbs (muster-diag wraps them),
  // we do NOT re-wrap them — instead the analyzer joins verb
  // counts (muster-diag store) with dawn trajectory + end state.
  // This comment is the guard: no second verb wrap exists.

  return function uninstall() {
    Object.keys(origs).forEach(function (m) { try { Game[m] = origs[m]; } catch (e) {} });
  };
}

async function oneRun(seed) {
  const policy = policyFor();
  const wg = policy.wavegateStore || null;
  const v2 = policy.vet2Store || null;
  const mfg = policy.vet2mfgStore || null;
  const { Game } = await loadGame({ seed, mode: 'herald', fullTelemetry: false });
  await setupGame(Game);
  const store = {
    trajectory: [], sayLines: [], refusals: [], ring: [],
    firstEvents: {}, captureErrs: 0, errors: [],
  };
  let mstore = null, uninstall = function () {};
  if (CAP_ON) {
    mstore = MD.newStore();
    MD.installMusterDiag(Game, mstore);
    uninstall = installMusterACapture(Game, store);
  }
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  // End snapshots (generic, all titans) + end fields.
  const endSnaps = {};
  if (CAP_ON) {
    // Reuse the capture's snapshot logic via a fresh dawn-style pass:
    // trajectory's last entry per titan is the last change; end state
    // is read directly here (pure reads, same fields).
    TITAN_IDS.forEach(function (tid) {
      try {
        const muster = (((Game.state || {}).titans || {}).musters || {})[tid] || null;
        const omen = (((Game.state || {}).titans || {}).omens || {})[tid] || null;
        const slain = !!(((Game.state || {}).titans || {}).slain || {})[tid];
        let alliesUnique = 0, havenValid = 0;
        try { if (muster) alliesUnique = MD.uniqueAllies(Game, muster).length; } catch (e) {}
        try { if (muster) havenValid = MD.havenBlades(Game, muster).length; } catch (e) {}
        endSnaps[tid] = {
          musterExists: !!muster, alliesRaw: muster ? (muster.allies || []).length : 0,
          alliesUnique: alliesUnique, havenRaw: muster ? (muster.haven || []).length : 0,
          havenValid: havenValid, size: alliesUnique + havenValid,
          omenStage: omen ? (omen.stage != null ? omen.stage : null) : null, slain: slain,
        };
      } catch (e) { endSnaps[tid] = { error: String((e && e.message) || e).slice(0, 120) }; }
    });
  }
  try { uninstall(); } catch (e) {}
  const st = Game.state || {};
  let national = 0, table = 0;
  try { const r = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; if (r === 'national' || r === 'global') national = 1; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; if (pg.tableWaiting || pg.tableDone) table = 1; } catch (e) {}
  const maxWave = result.maxWaveUnlocked || 1;
  let won = 0;
  try { won = !!Game.won ? 1 : 0; } catch (e) {}
  let gameDays = 0;
  try { gameDays = (st.scholar && st.scholar.day) || 0; } catch (e) {}
  let endSnap = null;
  try { endSnap = FD.snapFullSeat(Game); } catch (e) { endSnap = { error: String((e && e.message) || e).slice(0, 120) }; }

  const out = {
    seed, instrument: CAP_ON ? 'muster-a-v1+muster-diag' : 'substrate-only',
    substrate: 'withVet2mfgDiag(withVet2Diag(withFullseatDiag(withWavegateDiag(tableseatNowait))))' + (CAP_ON ? ' + muster-diag + sim-muster-a capture' : ' (capture off)'),
    anchorCommit: ANCHOR,
    maxWave, wave4: maxWave >= 4 ? 1 : 0, wave5: maxWave >= 5 ? 1 : 0,
    national, table, won,
    days: result.days, gameDays, endReason: result.endReason,
    endScaleRank: (function () { try { return Game.scaleRank ? Game.scaleRank() : null; } catch (e) { return null; } })(),
    endSnap,
    rows: wg ? wg.rows : [], recorderErrs: wg ? wg.errs : 0,
    vetRows: v2 ? v2.rows : [], vetErrs: v2 ? v2.errs : 0,
    mfgRows: mfg ? mfg.rows : [], mfgErrs: mfg ? mfg.errs : 0,
    trajectory: store.trajectory, sayLines: store.sayLines,
    refusals: store.refusals, firstEvents: store.firstEvents,
    captureErrs: store.captureErrs, captureErrors: store.errors,
    musterDiag: mstore ? { calls: mstore.calls, callTotals: mstore.callTotals, commitReturns: mstore.commitReturns, refusals: mstore.refusals, errs: mstore.errs, errors: mstore.errors } : null,
    endSnaps: endSnaps,
  };
  process.stdout.write(JSON.stringify(out) + '\\n');
  const nRef = store.refusals.length;
  const verbs = mstore ? JSON.stringify(mstore.callTotals) : 'off';
  console.error(`done s${seed}: refusals=${nRef} verbs=${verbs} traj=${store.trajectory.length} sayLines=${store.sayLines.length} maxWave=${maxWave} nat=${national} table=${table} won=${won} end=${result.endReason} days=${gameDays} rank=${out.endScaleRank} capErrs=${store.captureErrs} mdErrs=${mstore ? mstore.errs : 'off'}`);
  return out;
}

(async () => {
  for (const seed of SEEDS) {
    try { await oneRun(seed); }
    catch (e) { console.error(`ERROR s${seed}: ${e && e.message}`); process.exitCode = 1; }
  }
})();
