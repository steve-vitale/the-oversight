#!/usr/bin/env node
// vet2mfg-a-sweep.js — sim-vet2mfg-a wave-4 funnel sweep.
//
// Substrate (named exactly, see the prereg): tableseat-nowait
// (LEANLINKRESCUE=1, TABLESEATNOWAIT=1) + fullseat-diag + wavegate-diag
// + vet2-diag + vet2mfg-diag, all REUSED UNMODIFIED except the new
// vet2mfg layer. DIAG ONLY: no game change, no policy edit, no gate
// moved. Sweep-side wrappers are pure observation (call through with
// identical arguments and return values; instance identity by object
// reference in a sweep-local Map, never by mutating game state).
//
// STDOUT-RUNNER (vet2-a infrastructure lesson): the game-loaded
// process never writes a file — the frozen clock makes retry sleeps
// return instantly inside it, and the container EPERM flap eats
// direct writes. This script prints EXACTLY ONE JSON line per seed
// to stdout (progress to stderr). A separate idle process
// (scripts/vet2mfg-split.js, plain node, no game loaded) splits the
// stdout file into per-seed JSONs with a real-sleep retry loop.
//
//   LEANLINKRESCUE=1 TABLESEATNOWAIT=1 FULLSEAT=1 WAVEGATE=1 VET2=1 VET2MFG=1 \
//     SEEDS=95301,95302 node scripts/vet2mfg-a-sweep.js > out.jsonl 2> out.err
//   node scripts/vet2mfg-split.js out.jsonl <evid-dir>
//
// Legs: ON = all four recorder env vars set (judged corpus). OFF =
// all four unset (bare substrate; the recorder-neutrality leg's OFF
// side). Mixed recorder env is a STOP — it is neither leg.
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

for (const k of ['LEANLINKRESCUE', 'TABLESEATNOWAIT']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate).`); process.exit(2); }
}
const REC = ['FULLSEAT', 'WAVEGATE', 'VET2', 'VET2MFG'];
const recOn = REC.filter(k => process.env[k] === '1');
const MFG_ON = process.env.VET2MFG === '1';
if (MFG_ON && recOn.length !== 4) { console.error('SWEEP STOP: VET2MFG=1 requires FULLSEAT=WAVEGATE=VET2=1.'); process.exit(2); }
if (!MFG_ON && recOn.length !== 0) { console.error('SWEEP STOP: mixed recorder env is neither the ON leg nor the OFF leg.'); process.exit(2); }

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

const SAY_NEEDLES = ['muster', 'shelter', 'barricad', 'hall door', 'next act', 'fifth draft', 'RATINGS ARE UP', 'not bought with bread'];

// installFunnelCapture(Game, store): sweep-side wrappers. All wrappers
// call through with identical arguments and return values. Kill
// attribution is EXACT, not joined by day/type guesswork: each fight
// wrapper slices the kill-capture array around its original call, so
// the kills scored inside that fight belong to that fight.
function installFunnelCapture(Game, store) {
  const origs = {};
  const wrap = (method, fn) => {
    const orig = Game[method];
    if (typeof orig !== 'function') { store.captureErrs = (store.captureErrs || 0) + 1; return; }
    origs[method] = orig;
    Game[method] = fn(orig);
  };
  const dayOf = () => { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } };
  const defWave = (id) => {
    try {
      const defs = (Game.data && Game.data.monsters) || [];
      const d = defs.find(m => m && m.id === id);
      if (d && d.wave) return d.wave | 0;
    } catch (e) {}
    return 1;
  };
  const instSeq = new Map();
  let nextSeq = 1;
  const seqOf = (m) => {
    if (!m) return null;
    if (!instSeq.has(m)) instSeq.set(m, nextSeq++);
    return instSeq.get(m);
  };
  let inMaint = false;
  let inRouter = false;
  let tickId = 0;
  let tickCalls = []; // {tickId, seq} for the current tick wrapper
  let fightSeq = 0; // last non-refused startCombat sequence

  // Kill capture — BOTH writers (vet2-a amendment, carried from start).
  const capKill = (method, src) => (orig) => function (monsterId, killerVid, via, detail) {
    try {
      const defs = (this.data && this.data.monsters) || [];
      const def = defs.find(m => m && m.id === monsterId);
      if (def) {
        store.kills.push({
          idx: store.kills.length,
          d: ((this.state || {}).scholar || {}).day || 0,
          mid: monsterId, w: (def.wave | 0) || 0,
          by: killerVid || null, via: via || 'unknown',
          trick: detail || null, src,
          scholarVid: this.villagerId || null,
        });
      }
    } catch (e) { store.captureErrs = (store.captureErrs || 0) + 1; }
    return orig.apply(this, arguments);
  };
  wrap('recordWaveKill', capKill('recordWaveKill', 'wavekill'));
  wrap('recordPyrrhicKill', capKill('recordPyrrhicKill', 'pyrrhic'));

  wrap('maintainWorldMonsters', (orig) => function () {
    inMaint = true;
    try { return orig.apply(this, arguments); } finally { inMaint = false; }
  });

  wrap('spawnWorldMonster', (orig) => function (mdef, tx, ty, opts) {
    const mon = orig.apply(this, arguments);
    try {
      if (mon) {
        const seq = seqOf(mon);
        let px = null, py = null;
        try { px = Game.map ? Game.map.px : null; py = Game.map ? Game.map.py : null; } catch (e) {}
        const wave = (mon.wave !== undefined && mon.wave !== null) ? (mon.wave | 0) : defWave(mon.id);
        store.spawns.push({ seq, day: dayOf(), type: mon.id || null, wave, tx: mon.tx, ty: mon.ty, inMaint, playerTile: (px != null && mon.tx === px && mon.ty === py) });
      }
    } catch (e) { store.captureErrs = (store.captureErrs || 0) + 1; }
    return mon;
  });

  wrap('removeWorldMonster', (orig) => function (m) {
    try {
      if (m) {
        const wave = (m.wave !== undefined && m.wave !== null) ? (m.wave | 0) : defWave(m.id);
        store.removals.push({ seq: instSeq.has(m) ? instSeq.get(m) : null, day: dayOf(), type: m.id || null, wave, tx: m.tx, ty: m.ty });
      }
    } catch (e) { store.captureErrs = (store.captureErrs || 0) + 1; }
    return orig.apply(this, arguments);
  });

  // Router wrappers share the kill-slice + fight-record shape.
  const routerWrap = (channelOf) => (orig) => function (vid, m, opts) {
    const seq = seqOf(m);
    let resting = false;
    try { resting = !!(Game.isPostFleeResting && Game.isPostFleeResting(vid)); } catch (e) {}
    const before = store.kills.length;
    inRouter = true;
    let rec = null;
    try { rec = orig.apply(this, arguments); } finally { inRouter = false; }
    try {
      const killIdx = store.kills.slice(before).map(k => k.idx);
      const outcome = rec ? (rec.outcome || null) : (resting ? 'blocked-rest' : null);
      store.fights.push({
        ch: channelOf(opts), day: dayOf(), seq, type: (m && m.id) || null,
        wave: (m && m.wave !== undefined && m.wave !== null) ? (m.wave | 0) : defWave(m && m.id),
        vid: vid || null, outcome, kills: killIdx,
        allyVid: (rec && rec.allyVid) || null,
      });
      if (tickId) tickCalls.push({ tickId, seq });
    } catch (e) { store.captureErrs = (store.captureErrs || 0) + 1; }
    return rec;
  };
  wrap('resolveWildMonsterEncounter', routerWrap(opts => (opts && opts.raid) ? 'raid' : 'wild'));
  wrap('resolvePatrol', routerWrap(() => 'patrol'));

  wrap('aidFight', (orig) => function (vid, mdef, m, opts) {
    if (inRouter) return orig.apply(this, arguments);
    const before = store.kills.length;
    inRouter = true;
    let rec = null;
    try { rec = orig.apply(this, arguments); } finally { inRouter = false; }
    try {
      const killIdx = store.kills.slice(before).map(k => k.idx);
      store.fights.push({
        ch: 'aid', day: dayOf(), seq: seqOf(m), type: (mdef && mdef.id) || (m && m.id) || null,
        wave: (mdef && mdef.wave) ? (mdef.wave | 0) : defWave((mdef && mdef.id) || (m && m.id)),
        vid: vid || null, outcome: rec ? (rec.outcome || null) : null, kills: killIdx,
        allyVid: (rec && rec.allyVid) || null,
      });
    } catch (e) { store.captureErrs = (store.captureErrs || 0) + 1; }
    return rec;
  });

  wrap('fieldFight', (orig) => function (vid, mdef, m, opts) {
    if (inRouter) return orig.apply(this, arguments);
    const before = store.kills.length;
    let rec = null;
    try { rec = orig.apply(this, arguments); } finally {}
    try {
      const killIdx = store.kills.slice(before).map(k => k.idx);
      const sub = (opts && opts.awareness) ? 'agency' : 'other-unknown';
      store.fights.push({
        ch: 'other-field', sub, day: dayOf(), seq: seqOf(m),
        type: (mdef && mdef.id) || null,
        wave: (mdef && mdef.wave) ? (mdef.wave | 0) : defWave(mdef && mdef.id),
        vid: vid || null, outcome: rec ? (rec.outcome || null) : null, kills: killIdx,
        allyVid: (rec && rec.allyVid) || null, worldPresent: !!(m && m.tx !== undefined),
      });
    } catch (e) { store.captureErrs = (store.captureErrs || 0) + 1; }
    return rec;
  });

  // startCombat wrapper (amended after the first pilot, see the prereg
  // amendment): a start is REFUSED when no fight is created. The
  // live-fight check is only one refusal path — the TITAN GATE
  // (titans.js, "no_solo_titans") hard-refuses startCombat on a titan
  // without a mustered coalition by returning null WITHOUT creating a
  // fight and WITHOUT throwing. The first pilot recorded 29 herald
  // starts with no tbEnd because it only checked the live-fight
  // condition. Refusal is therefore read from the RETURN VALUE
  // (null/undefined = no fight created), plus the live-fight entry
  // check, plus a throw capture (a throwing start also creates no
  // fight; the original error is rethrown unchanged). Refused starts
  // are classified 'refused' events, never fights and never
  // UNCLASSIFIED. fightSeq advances only on non-entry-refused starts;
  // a return-refused start consumes its sequence harmlessly (the
  // analyzer excludes refused starts from the unresolved check, and
  // tbEnd joins by sequence equality).
  wrap('startCombat', (orig) => function (monsterId, options) {
    let entryRefused = false;
    try { entryRefused = !!(this.tbfight && !this.tbfight.over); } catch (e) {}
    if (!entryRefused) fightSeq++;
    let r, thrownErr = null;
    try { r = orig.apply(this, arguments); } catch (e) { thrownErr = e; }
    try {
      const mid = monsterId || this.pendingMonsterId || null;
      let worldWave = null;
      try {
        const sm = (this.state || {}).scholar || {};
        if (sm.monster && sm.monster.id === mid && sm.monster.wave !== undefined) worldWave = sm.monster.wave | 0;
      } catch (e) {}
      store.tbStarts.push({
        day: dayOf(), fightSeq: entryRefused ? null : fightSeq, type: mid,
        wave: mid ? defWave(mid) : null, worldWave,
        refused: entryRefused || (r == null) || !!thrownErr,
        threw: thrownErr ? String((thrownErr && thrownErr.message) || thrownErr).slice(0, 120) : null,
      });
    } catch (e) { store.captureErrs = (store.captureErrs || 0) + 1; }
    if (thrownErr) throw thrownErr;
    return r;
  });

  wrap('tbEnd', (orig) => function (result) {
    const before = store.kills.length;
    let r;
    try { r = orig.apply(this, arguments); } finally {}
    try {
      // tbEnd may already have cleared the fight, so monster waves are
      // NOT read here: the analyzer joins tbEnd -> tbStart by fightSeq
      // (start type + wave) and takes killed types/waves from the slice.
      const killIdx = store.kills.slice(before).map(k => k.idx);
      store.tbEnds.push({ day: dayOf(), fightSeq, result: result || null, kills: killIdx });
    } catch (e) { store.captureErrs = (store.captureErrs || 0) + 1; }
    return r;
  });

  wrap('villagerMonsterTick', (orig) => function () {
    tickId++;
    const myTick = tickId;
    tickCalls = tickCalls.filter(c => c.tickId === myTick);
    const pre = { day: dayOf(), ticks: 1, w4monsters: 0, opps: 0, shelterBlocked: 0, restBlocked: 0, scholarTile: 0, rollSkipped: 0, availTotal: 0 };
    const availSeqs = [];
    try {
      const st = Game.state || {};
      const vil = st.village || {};
      const sch = st.scholar || {};
      const day = sch.day || 0;
      const roster = Array.isArray(vil.roster) ? vil.roster : [];
      const np = vil.nodePos || {};
      const sheltered = vil.sheltered || {};
      const rest = Game._postFleeRest || {};
      const scholarVid = Game.villagerId || null;
      let px = null, py = null;
      try { px = Game.map ? Game.map.px : null; py = Game.map ? Game.map.py : null; } catch (e) {}
      const wm = Array.isArray(st.worldMonsters) ? st.worldMonsters : [];
      for (const m of wm) {
        const wave = (m.wave !== undefined && m.wave !== null) ? (m.wave | 0) : defWave(m.id);
        if (wave !== 4) continue;
        pre.w4monsters++;
        if (px != null && m.tx === px && m.ty === py) { pre.scholarTile++; continue; }
        let avail = 0, sh = 0, rs = 0;
        for (const rid of roster) {
          if (rid === scholarVid) continue;
          const n = np[rid];
          if (!n || n.nx !== m.tx || n.ny !== m.ty) continue;
          if (sheltered[rid]) { sh++; continue; }
          if (rest[rid] === day) { rs++; continue; }
          avail++;
        }
        if (avail > 0) { pre.opps++; pre.availTotal += avail; availSeqs.push(seqOf(m)); }
        else if (sh > 0) pre.shelterBlocked++;
        else if (rs > 0) pre.restBlocked++;
      }
    } catch (e) { store.captureErrs = (store.captureErrs || 0) + 1; }
    let r;
    try { r = orig.apply(this, arguments); } finally {}
    try {
      const calledSeqs = new Set(tickCalls.filter(c => c.tickId === myTick).map(c => c.seq));
      const wm = Array.isArray((Game.state || {}).worldMonsters) ? Game.state.worldMonsters : [];
      const stillPresent = new Set(wm.map(m => instSeq.get(m)));
      for (const s of availSeqs) {
        if (!calledSeqs.has(s) && stillPresent.has(s)) pre.rollSkipped++;
      }
      const d = pre.day;
      const agg = store.tickDaily[d] || (store.tickDaily[d] = { day: d, ticks: 0, w4monsters: 0, opps: 0, shelterBlocked: 0, restBlocked: 0, scholarTile: 0, rollSkipped: 0, availTotal: 0 });
      for (const k of ['ticks', 'w4monsters', 'opps', 'shelterBlocked', 'restBlocked', 'scholarTile', 'rollSkipped', 'availTotal']) agg[k] += pre[k] || 0;
    } catch (e) { store.captureErrs = (store.captureErrs || 0) + 1; }
    tickId = 0;
    return r;
  });

  wrap('sysSay', (orig) => function () {
    try {
      const line = (arguments.length && arguments[0] != null) ? String(arguments[0]) : '';
      if (SAY_NEEDLES.some(n => line.indexOf(n) >= 0) && store.sayLines.length < 5000) {
        store.sayLines.push({ day: dayOf(), line });
      }
    } catch (e) {}
    return orig.apply(this, arguments);
  });

  // Seed monsters already on the board (e.g. spawned during setupGame,
  // before this install): they get synthetic spawn records flagged
  // seeded, so the spawn census never silently undercounts.
  try {
    const wm = Array.isArray((Game.state || {}).worldMonsters) ? Game.state.worldMonsters : [];
    for (const m of wm) {
      const seq = seqOf(m);
      const wave = (m.wave !== undefined && m.wave !== null) ? (m.wave | 0) : defWave(m.id);
      store.spawns.push({ seq, day: dayOf(), type: m.id || null, wave, tx: m.tx, ty: m.ty, inMaint: false, playerTile: false, seeded: true });
    }
  } catch (e) { store.captureErrs = (store.captureErrs || 0) + 1; }

  return function uninstall() {
    for (const m of Object.keys(origs)) { try { Game[m] = origs[m]; } catch (e) {} }
  };
}

function newFunnelStore() {
  return {
    spawns: [], removals: [], fights: [], tbStarts: [], tbEnds: [],
    kills: [], sayLines: [], tickDaily: {}, captureErrs: 0,
  };
}

async function oneRun(seed) {
  const policy = policyFor();
  const wg = policy.wavegateStore || null;
  const v2 = policy.vet2Store || null;
  const mfg = policy.vet2mfgStore || null;
  const fstore = newFunnelStore();
  const { Game } = await loadGame({ seed, mode: 'herald', fullTelemetry: false });
  await setupGame(Game);
  let uninstall = function () {};
  if (MFG_ON) uninstall = installFunnelCapture(Game, fstore);
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  let engineFinalUw = null, engineFinalStanding = null;
  try { engineFinalUw = (typeof Game.unlockedWave === 'function') ? (Game.unlockedWave() | 0) : null; } catch (e) {}
  try { engineFinalStanding = (typeof Game.villageStandingTotal === 'function') ? (Game.villageStandingTotal() | 0) : null; } catch (e) {}
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
  let deaths = [];
  try { deaths = ((result.samples || {}).deaths || []).slice(); } catch (e) {}
  let finalWaveKillLog = [];
  try { finalWaveKillLog = ((st.waveKillLog || []).map(e => ({ d: e.d, mid: e.mid, w: e.w, by: e.by, via: e.via, trick: e.trick || null }))); } catch (e) {}
  let endSnap = null;
  try { endSnap = FD.snapFullSeat(Game); } catch (e) { endSnap = { error: String((e && e.message) || e).slice(0, 120) }; }

  const out = {
    seed, instrument: MFG_ON ? 'vet2mfg-v1' : 'substrate-only',
    substrate: 'withVet2mfgDiag(withVet2Diag(withFullseatDiag(withWavegateDiag(tableseatNowait))))' + (MFG_ON ? ' + sweep funnel capture' : ' (recorders unset)'),
    anchorCommit: ANCHOR,
    maxWave, wave4: maxWave >= 4 ? 1 : 0, wave5: maxWave >= 5 ? 1 : 0,
    national, table, won,
    days: result.days, gameDays, endReason: result.endReason,
    endScaleRank: (function () { try { return Game.scaleRank ? Game.scaleRank() : null; } catch (e) { return null; } })(),
    engineFinalUw, engineFinalStanding,
    endSnap,
    rows: wg ? wg.rows : [], recorderErrs: wg ? wg.errs : 0,
    vetRows: v2 ? v2.rows : [], vetErrs: v2 ? v2.errs : 0,
    mfgRows: mfg ? mfg.rows : [], mfgErrs: mfg ? mfg.errs : 0,
    spawns: fstore.spawns, removals: fstore.removals, fights: fstore.fights,
    tbStarts: fstore.tbStarts, tbEnds: fstore.tbEnds, kills: fstore.kills,
    captureErrs: fstore.captureErrs, sayLines: fstore.sayLines,
    tickDaily: Object.keys(fstore.tickDaily).map(k => fstore.tickDaily[k]).sort((a, b) => a.day - b.day),
    finalWaveKillLog, deaths,
  };
  process.stdout.write(JSON.stringify(out) + '\n');
  console.error(`done s${seed}: wgRows=${out.rows.length} vetRows=${out.vetRows.length} mfgRows=${out.mfgRows.length} spawns=${fstore.spawns.length} fights=${fstore.fights.length} tbEnds=${fstore.tbEnds.length} kills=${fstore.kills.length} logLen=${finalWaveKillLog.length} maxWave=${maxWave} nat=${national} table=${table} won=${won} end=${result.endReason} days=${gameDays} rank=${out.endScaleRank} wgErrs=${out.recorderErrs} vetErrs=${out.vetErrs} mfgErrs=${out.mfgErrs} capErrs=${fstore.captureErrs}`);
  return out;
}

(async () => {
  for (const seed of SEEDS) {
    try {
      await oneRun(seed);
    } catch (e) {
      console.error(`ERROR s${seed}: ${e && e.message}`);
      console.error(e && e.stack);
    }
  }
})();
