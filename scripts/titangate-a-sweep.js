#!/usr/bin/env node
// titangate-a-sweep.js — sim-titangate-a titan-gate refusal + Game.say
// capture sweep.
//
// Substrate (named exactly, see the prereg): tableseat-nowait
// (LEANLINKRESCUE=1, TABLESEATNOWAIT=1) + fullseat-diag + wavegate-diag
// + vet2-diag + vet2mfg-diag, all REUSED UNMODIFIED. DIAG ONLY: no game
// change, no policy edit, no gate moved. Sweep-side wrappers are pure
// observation (call through with identical arguments and return
// values; instance identity by object reference in a sweep-local Map,
// never by mutating game state).
//
// The vet2mfg arm proved the refusal is SPOKEN via Game.say but left
// no sysSay footprint (the gate calls Game.say directly; sysSay is a
// wrapper around say, not the other way round). This sweep therefore
// wraps Game.say itself — upstream of sysSay, and upstream of emit's
// consecutive-duplicate dedup, so every spoken refusal is seen even
// when emit drops a repeat for display.
//
// STDOUT-RUNNER (vet2mfg infrastructure lesson): the game-loaded
// process never writes a file — the frozen clock makes retry sleeps
// return instantly inside it, and the container EPERM flap eats
// direct writes. This script prints EXACTLY ONE JSON line per seed
// to stdout (progress to stderr). The REUSED splitter
// (scripts/vet2mfg-split.js, plain node, no game loaded) splits the
// stdout file into per-seed JSONs with a real-sleep retry loop.
//
//   LEANLINKRESCUE=1 TABLESEATNOWAIT=1 FULLSEAT=1 WAVEGATE=1 VET2=1 VET2MFG=1 \
//     TITANGATE=1 SEEDS=95304 node scripts/titangate-a-sweep.js > out.jsonl 2> out.err
//   node scripts/vet2mfg-split.js out.jsonl <evid-dir>
//
// Legs: ON = TITANGATE=1 (capture installed). OFF = TITANGATE unset
// (same substrate + diag policies, capture NOT installed; the
// neutrality leg's OFF side). The four diag env vars are required =1
// on both legs (unlock day + end fields must be present either way).
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

for (const k of ['LEANLINKRESCUE', 'TABLESEATNOWAIT', 'FULLSEAT', 'WAVEGATE', 'VET2', 'VET2MFG']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required.`); process.exit(2); }
}
const CAP_ON = process.env.TITANGATE === '1';

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

const SAY_NEEDLES = ['does not notice you', 'This is not courage', 'allied blades', 'sound the call', 'muster'];

// installTitanGateCapture(Game, store): sweep-side wrappers. All
// wrappers call through with identical arguments and return values.
function installTitanGateCapture(Game, store) {
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
    try {
      const td = (typeof Game.titanDef === 'function') ? Game.titanDef(id) : null;
      if (td && td.wave) return td.wave | 0;
    } catch (e) {}
    return 1;
  };
  const kindOf = (id) => {
    if (!id) return 'other';
    if (id === 'herald') return 'herald';
    try { if (typeof Game.isTitan === 'function' && Game.isTitan(id)) return id; } catch (e) {}
    return 'other';
  };
  const isTitanKind = (k) => k !== 'other';
  let eseq = 0;
  const nextEseq = () => ++eseq;
  const instSeq = new Map();
  let nextSeq = 1;
  const seqOf = (m) => {
    if (!m) return null;
    if (!instSeq.has(m)) instSeq.set(m, nextSeq++);
    return instSeq.get(m);
  };
  let fightSeq = 0;
  let inRouter = false;

  // ---- Game.say capture ----
  // currentCall: { seq, lines: [] } while inside a startCombat call.
  // ring: last 12 say lines (any text) for the sense-test beats.
  let currentCall = null;
  const ring = [];
  const firstRefusalBeats = {}; // kind -> beat (first refusal only)
  wrap('say', (orig) => function () {
    try {
      const raw = (arguments.length && arguments[0] != null) ? String(arguments[0]) : '';
      const line = raw.length > 500 ? raw.slice(0, 500) : raw;
      const d = dayOf();
      ring.push({ day: d, line });
      if (ring.length > 12) ring.shift();
      if (currentCall) currentCall.lines.push({ day: d, line });
      if (SAY_NEEDLES.some(n => raw.indexOf(n) >= 0) && store.sayNeedle.length < 5000) {
        store.sayNeedle.push({ day: d, line, callSeq: currentCall ? currentCall.seq : null });
      }
    } catch (e) { store.captureErrs = (store.captureErrs || 0) + 1; }
    return orig.apply(this, arguments);
  });

  // ---- startCombat: refusal from the return value (vet2mfg amendment) ----
  wrap('startCombat', (orig) => function (monsterId, options) {
    let entryRefused = false;
    try { entryRefused = !!(this.tbfight && !this.tbfight.over); } catch (e) {}
    if (!entryRefused) fightSeq++;
    const mySeq = entryRefused ? null : fightSeq;
    const ringBefore = ring.slice();
    const callCtx = { seq: mySeq, lines: [] };
    const prevCall = currentCall;
    currentCall = callCtx;
    let r, thrownErr = null;
    try { r = orig.apply(this, arguments); } catch (e) { thrownErr = e; }
    currentCall = prevCall;
    try {
      const mid = monsterId || this.pendingMonsterId || null;
      const kind = kindOf(mid);
      const refused = entryRefused || (r == null) || !!thrownErr;
      const rec = {
        eseq: nextEseq(), day: dayOf(), fightSeq: mySeq, type: mid, kind,
        wave: mid ? defWave(mid) : null,
        refused,
        refusedHow: !refused ? null : (entryRefused ? 'entry' : (thrownErr ? 'threw' : 'return-null')),
        threw: thrownErr ? String((thrownErr && thrownErr.message) || thrownErr).slice(0, 120) : null,
        sayDuring: callCtx.lines.slice(),
        sayDuringCount: callCtx.lines.length,
        muster: null, outcomeEntry: null, worldPresent: null,
      };
      if (refused) {
        // Muster snapshot at refusal time (pure reads only).
        try {
          const tit = ((Game.state || {}).titans) || {};
          const mus = (tit.musters || {})[mid];
          let need = null;
          try { const td = (typeof Game.titanDef === 'function') ? Game.titanDef(mid) : null; if (td && td.minAllies) need = td.minAllies | 0; } catch (e) {}
          if (mus) {
            rec.muster = {
              allies: Array.isArray(mus.allies) ? mus.allies.length : 0,
              allyVillages: Array.isArray(mus.allies) ? Array.from(new Set(mus.allies.map(a => a && a.villageId).filter(Boolean))).length : 0,
              haven: Array.isArray(mus.haven) ? mus.haven.length : 0,
              need,
            };
          } else {
            rec.muster = { allies: 0, allyVillages: 0, haven: 0, need, noMuster: true };
          }
        } catch (e) { store.captureErrs = (store.captureErrs || 0) + 1; }
        // The gate's own outcome record, if it appended one (pure read).
        try {
          const outs = (((Game.state || {}).titans || {}).outcomes) || [];
          for (let i = outs.length - 1; i >= 0; i--) {
            const o = outs[i];
            if (o && o.titan === mid && o.outcome === 'refused' && o.day === rec.day) { rec.outcomeEntry = o; break; }
          }
        } catch (e) { store.captureErrs = (store.captureErrs || 0) + 1; }
        // World-monster presence of this id at refusal time (pure read).
        try {
          const wm = Array.isArray((Game.state || {}).worldMonsters) ? Game.state.worldMonsters : [];
          const mine = wm.filter(m => m && m.id === mid);
          rec.worldPresent = mine.map(m => ({ tx: m.tx, ty: m.ty, hp: m.hp, maxHp: m.maxHp }));
        } catch (e) { store.captureErrs = (store.captureErrs || 0) + 1; }
        // Sense-test beat: first refusal of each kind only.
        if (!firstRefusalBeats[kind]) {
          firstRefusalBeats[kind] = { kind, day: rec.day, type: mid, ringBefore, refusalLines: callCtx.lines.slice() };
        }
      }
      store.tbStarts.push(rec);
    } catch (e) { store.captureErrs = (store.captureErrs || 0) + 1; }
    if (thrownErr) throw thrownErr;
    return r;
  });

  wrap('tbEnd', (orig) => function (result) {
    let r;
    try { r = orig.apply(this, arguments); } finally {}
    try { store.tbEnds.push({ eseq: nextEseq(), day: dayOf(), fightSeq, result: result || null }); } catch (e) { store.captureErrs = (store.captureErrs || 0) + 1; }
    return r;
  });

  // Minimal router records — only what the "what happens next"
  // classification needs (channel, day, type, wave, outcome).
  const routerWrap = (channelOf) => (orig) => function (vid, m, opts) {
    const seq = seqOf(m);
    inRouter = true;
    let rec = null;
    try { rec = orig.apply(this, arguments); } finally { inRouter = false; }
    try {
      store.fights.push({
        eseq: nextEseq(), ch: channelOf(opts), day: dayOf(), seq, type: (m && m.id) || null,
        wave: (m && m.wave !== undefined && m.wave !== null) ? (m.wave | 0) : defWave(m && m.id),
        vid: vid || null, outcome: rec ? (rec.outcome || null) : null,
      });
    } catch (e) { store.captureErrs = (store.captureErrs || 0) + 1; }
    return rec;
  };
  wrap('resolveWildMonsterEncounter', routerWrap(opts => (opts && opts.raid) ? 'raid' : 'wild'));
  wrap('resolvePatrol', routerWrap(() => 'patrol'));
  wrap('aidFight', (orig) => function (vid, mdef, m, opts) {
    if (inRouter) return orig.apply(this, arguments);
    inRouter = true;
    let rec = null;
    try { rec = orig.apply(this, arguments); } finally { inRouter = false; }
    try {
      store.fights.push({
        eseq: nextEseq(), ch: 'aid', day: dayOf(), seq: seqOf(m),
        type: (mdef && mdef.id) || (m && m.id) || null,
        wave: (mdef && mdef.wave) ? (mdef.wave | 0) : defWave((mdef && mdef.id) || (m && m.id)),
        vid: vid || null, outcome: rec ? (rec.outcome || null) : null,
      });
    } catch (e) { store.captureErrs = (store.captureErrs || 0) + 1; }
    return rec;
  });
  wrap('fieldFight', (orig) => function (vid, mdef, m, opts) {
    if (inRouter) return orig.apply(this, arguments);
    let rec = null;
    try { rec = orig.apply(this, arguments); } finally {}
    try {
      store.fights.push({
        eseq: nextEseq(), ch: 'other-field', day: dayOf(), seq: seqOf(m),
        type: (mdef && mdef.id) || null,
        wave: (mdef && mdef.wave) ? (mdef.wave | 0) : defWave(mdef && mdef.id),
        vid: vid || null, outcome: rec ? (rec.outcome || null) : null,
      });
    } catch (e) { store.captureErrs = (store.captureErrs || 0) + 1; }
    return rec;
  });

  wrap('removeWorldMonster', (orig) => function (m) {
    try {
      if (m) {
        store.removals.push({ eseq: nextEseq(), day: dayOf(), type: m.id || null,
          wave: (m.wave !== undefined && m.wave !== null) ? (m.wave | 0) : defWave(m.id) });
      }
    } catch (e) { store.captureErrs = (store.captureErrs || 0) + 1; }
    return orig.apply(this, arguments);
  });

  store.refusalBeats = firstRefusalBeats;
  return function uninstall() {
    for (const m of Object.keys(origs)) { try { Game[m] = origs[m]; } catch (e) {} }
  };
}

function newStore() {
  return {
    tbStarts: [], tbEnds: [], fights: [], removals: [], sayNeedle: [],
    refusalBeats: {}, captureErrs: 0,
  };
}

async function oneRun(seed) {
  const policy = policyFor();
  const wg = policy.wavegateStore || null;
  const v2 = policy.vet2Store || null;
  const mfg = policy.vet2mfgStore || null;
  const store = newStore();
  const { Game } = await loadGame({ seed, mode: 'herald', fullTelemetry: false });
  await setupGame(Game);
  let uninstall = function () {};
  if (CAP_ON) uninstall = installTitanGateCapture(Game, store);
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
  let finalTitans = null;
  try {
    const tit = st.titans || {};
    finalTitans = {
      outcomes: Array.isArray(tit.outcomes) ? tit.outcomes.slice() : [],
      musters: {},
      slain: tit.slain || {},
      cast: tit.cast || null,
    };
    const mus = tit.musters || {};
    for (const k of Object.keys(mus)) {
      const m = mus[k] || {};
      finalTitans.musters[k] = {
        allies: Array.isArray(m.allies) ? m.allies.length : 0,
        allyVillages: Array.isArray(m.allies) ? Array.from(new Set(m.allies.map(a => a && a.villageId).filter(Boolean))) : [],
        haven: Array.isArray(m.haven) ? m.haven.length : 0,
        havenVids: Array.isArray(m.haven) ? m.haven.map(h => h && h.vid).filter(Boolean) : [],
      };
    }
  } catch (e) { finalTitans = { error: String((e && e.message) || e).slice(0, 120) }; }
  let finalWorldTypes = [];
  try { finalWorldTypes = (Array.isArray(st.worldMonsters) ? st.worldMonsters : []).map(m => m && m.id).filter(Boolean); } catch (e) {}
  let endSnap = null;
  try { endSnap = FD.snapFullSeat(Game); } catch (e) { endSnap = { error: String((e && e.message) || e).slice(0, 120) }; }

  const out = {
    seed, instrument: CAP_ON ? 'titangate-v1' : 'substrate-only',
    substrate: 'withVet2mfgDiag(withVet2Diag(withFullseatDiag(withWavegateDiag(tableseatNowait))))' + (CAP_ON ? ' + sweep titangate capture' : ' (capture off)'),
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
    tbStarts: store.tbStarts, tbEnds: store.tbEnds, fights: store.fights,
    removals: store.removals, sayNeedle: store.sayNeedle,
    refusalBeats: store.refusalBeats, captureErrs: store.captureErrs,
    finalTitans, finalWorldTypes,
  };
  process.stdout.write(JSON.stringify(out) + '\n');
  const nRef = store.tbStarts.filter(s => s.refused).length;
  console.error(`done s${seed}: tbStarts=${store.tbStarts.length} refused=${nRef} tbEnds=${store.tbEnds.length} fights=${store.fights.length} removals=${store.removals.length} sayNeedle=${store.sayNeedle.length} maxWave=${maxWave} nat=${national} table=${table} won=${won} end=${result.endReason} days=${gameDays} rank=${out.endScaleRank} wgErrs=${out.recorderErrs} vetErrs=${out.vetErrs} mfgErrs=${out.mfgErrs} capErrs=${store.captureErrs}`);
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
