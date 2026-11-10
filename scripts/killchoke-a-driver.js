// killchoke-a-driver.js — kill choke-point trace census (REPLICATION)
// (arm sim-killchoke-a, Loop A run fleshout-20261110T1915Z,
// axis scale-onramp / winnability chain; prereg
// evidence/2026-11-10/sim-killchoke-a-prereg.md).
//
// INDEPENDENT REPLICATION of Loop B arm sim-choketrace-b (commit
// 74eccccd2, already on master), which answered this question on this
// band: 16/16 bursts attributed, no re-fire — the 32 "duplicate" calls
// are genuine bodies the dedupe key collapses. This arm re-derives the
// verdict with an INDEPENDENT implementation and adds settlement-
// invocation counting (how often each settlement function itself runs,
// so a zero-call path reads as "never ran" vs "ran but killed nothing").
//
// Method difference from choketrace-b (deliberate): the recorder stores
// the RAW call-stack function names in every call record and classifies
// the caller path OFFLINE in scripts/killchoke-a-analyze.js — the corpus
// is auditable and the classification can be re-derived without
// re-running. Settlement wrappers here do the minimum: count invocations
// and stamp the active invocation id (plus the contest id for _cxOther
// and the live tbfight id for tbEnd). No other game-state reads at
// wrap time.
//
// Derived from scripts/vetcount-b-driver.js (same daily census: plain
// competent policy, 150d death-aware, same seeds 140201-140208) PLUS
// per-call attribution: raw stack frames, settlement-invocation id,
// fight/monster-instance identity, dead-fighter census, per-call ledger
// scoring, and settlement-invocation totals.
// DIAG ONLY — zero src/js changes; the recorder wraps Game methods with
// pure reads around the original calls and must not change trajectories
// (neutrality is a proof leg in scripts/test-killchoke-a.js, and the
// corpus is cross-checked against the choketrace-b corpus).
// Usage:
//   SEEDS=140201..140208 DAYS=150 OUTDIR=evidence/2026-11-10/perseed-killchoke-a node scripts/killchoke-a-driver.js
// Writes evidence/2026-11-10/perseed-killchoke-a/killchoke-a-s<seed>.json
// (refuses to overwrite an existing per-seed file).
// KILLCHOKE_RECORD=0 installs no wrappers (honesty control: trajectories
// must be byte-identical to the recorded run).
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const COMPETENT = require(path.join(REPO, 'scripts', 'policies', 'competent'));
const CAP = require(path.join(REPO, 'scripts', 'capstoneready-b-driver'));
const VET = require(path.join(REPO, 'scripts', 'vetcount-b-driver'));
const snapshotLadder = CAP.snapshotLadder;
const summarize = CAP.summarize;
const buildKillers = VET.buildKillers;
const reconcile = VET.reconcile;

const RECORD = process.env.KILLCHOKE_RECORD !== '0';

const DEEDS = ['military_tribute', 'trade_charter', 'feast_embassy'];

function expandSeeds(raw) {
  const out = [];
  (raw || '').split(',').forEach(function (part) {
    const t = part.trim();
    if (!t) return;
    const m = t.match(/^(\d+)\.\.(\d+)$/);
    if (m) { for (let s = parseInt(m[1], 10); s <= parseInt(m[2], 10); s++) out.push(s); }
    else if (Number.isFinite(parseInt(t, 10))) out.push(parseInt(t, 10));
  });
  return out;
}

let SEEDS = [];
let DAYS = 150;
let ANCHOR = 'unknown';
let outDir = null;
function loadConfig() {
  SEEDS = expandSeeds(process.env.SEEDS);
  DAYS = parseInt(process.env.DAYS || '150', 10) || 150;
  if (!SEEDS.length) { console.error('KILLCHOKE-A STOP: SEEDS required (e.g. SEEDS=140201..140208).'); process.exit(2); }
  try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}
  outDir = process.env.OUTDIR || path.join(REPO, 'evidence', '2026-11-10', 'perseed-killchoke-a');
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) {
    const file = path.join(outDir, 'killchoke-a-s' + seed + '.json');
    if (fs.existsSync(file)) { console.error('KILLCHOKE-A STOP: refusing to overwrite ' + file); process.exit(3); }
  }
}

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

// --- attribution machinery (pure reads; no RNG, no game-state mutation) ---

// The nine named caller paths (prereg § Candidate caller paths). The
// ANALYZER maps stored stack frames to these; anything else is
// UNATTRIBUTED (honest fallback, never guessed). This table is shared
// with the analyzer via module exports so the two cannot drift apart.
const SETTLEMENT_NAMES = {
  tbEnd: 'tb-end',
  resolvePatrol: 'patrol',
  resolveWildMonsterEncounter: 'wild',
  aidFight: 'aid-crisis',
  _cxBlood: 'contest-blood',
  _cxOther: 'contest-other', // refined by contest id to hide / beastmaster
  lingererSortie: 'sortie',
  expeditionMonster: 'agency',
};
const SKIP_FRAMES = {
  recordWaveKill: true, recordPyrrhicKill: true,
  killchokeRecordWaveKill: true, killchokeRecordPyrrhicKill: true,
};

// parseStackFrames(stack): function names from a V8 stack, top first,
// capped at 14. Stored verbatim in the corpus; the analyzer classifies
// from these offline.
function parseStackFrames(stack) {
  const frames = [];
  try {
    const lines = String(stack || '').split('\n').slice(1);
    for (const ln of lines) {
      if (frames.length >= 14) break;
      let m = ln.match(/at\s+(?:async\s+)?(?:[^\s(]+\.)?([A-Za-z_$][\w$]*)\s*\(/);
      if (!m) m = ln.match(/at\s+([^\s(]+)\s*\(/);
      if (!m) continue;
      const name = (m[1] || '').split('.').pop();
      if (name) frames.push(name);
    }
  } catch (e) {}
  return frames;
}

// classifyFrames(frames): first known settlement function in the frames
// wins (skipping the kill-call wrappers themselves). Returns a path or
// 'UNATTRIBUTED'.
function classifyFrames(frames) {
  for (const n of (frames || [])) {
    if (SKIP_FRAMES[n]) continue;
    if (SETTLEMENT_NAMES[n]) return SETTLEMENT_NAMES[n];
  }
  return 'UNATTRIBUTED';
}

// ledgerRead(Game, mid): pure read of the ledger state for one monster
// type — NO mutation (ledgerState() would init; read the raw state
// instead). Returns {wave, points, perType, cap, bar, counterKnown}.
function ledgerRead(Game, mid) {
  const out = { wave: 0, points: 0, perType: 0, cap: 2, bar: 0, counterKnown: false };
  try {
    const mdef = ((Game.data || {}).monsters || []).find(function (m) { return m && m.id === mid; });
    if (!mdef) return out;
    const wave = mdef.wave || 1;
    out.wave = wave;
    const L = ((Game.state || {}).waveLedger || {})[wave] || {};
    out.points = (L.points | 0) || 0;
    out.perType = ((L.perType || {})[mid] | 0) || 0;
    let cfg = null;
    try { cfg = (typeof Game.waveLedgerCfg === 'function') ? Game.waveLedgerCfg() : null; } catch (e) {}
    if (cfg) {
      out.cap = (cfg.perTypeCap | 0) || 0;
      out.bar = ((cfg.barsPerWave || {})[wave] | 0) || 0;
    }
    try { out.counterKnown = (typeof Game.monsterCounterKnown === 'function') ? !!Game.monsterCounterKnown(mid) : false; } catch (e) {}
  } catch (e) {}
  return out;
}

// wrapKillchokeRecorder(Game, samples, calls, errors): the attribution
// recorder. Installs (a) minimal pass-through wrappers around the eight
// settlement functions, counting invocations and stamping the active
// invocation id (+ contest id for _cxOther, + live tbfight id for
// tbEnd); (b) a wrapper around fieldFight, stamping the fought monster
// object's identity on return; (c) wrappers around recordWaveKill /
// recordPyrrhicKill that store the RAW stack frames, read the invocation
// context, the fight census, and the ledger before/after. Path
// classification is deliberately NOT done here — the analyzer does it
// offline from the stored frames.
// Every wrapper is a pure pass-through plus module-local bookkeeping:
// no RNG consumed, no game state written, no return value changed.
// Returns {invCounts} (per-path settlement-invocation totals) for the
// output summary.
function wrapKillchokeRecorder(Game, samples, calls, errors) {
  const ctx = {
    invSeq: { tbEnd: 0, patrol: 0, wild: 0, aid: 0, blood: 0, other: 0, sortie: 0, agency: 0 },
    invCounts: { 'tb-end': 0, patrol: 0, wild: 0, 'aid-crisis': 0, 'contest-blood': 0, 'contest-other': 0, sortie: 0, agency: 0 },
    active: [], // stack of {kind, id, extra} — synchronous, single-threaded
    fightIds: new WeakMap(), nextFightId: 1,
    monsterIds: new WeakMap(), nextMonsterId: 1,
    ffSeq: 0, lastFieldFight: null, // {seq, vid, mdefId, monsterObjId, outcome, rounds}
    callSeq: 0,
  };
  function objId(map, key, counterKey) {
    if (!key || (typeof key !== 'object' && typeof key !== 'function')) return null;
    let id = map.get(key);
    if (!id) { id = ctx[counterKey]++; map.set(key, id); }
    return id;
  }
  function activeInv(kind) {
    for (let i = ctx.active.length - 1; i >= 0; i--) {
      if (ctx.active[i].kind === kind) return ctx.active[i];
    }
    return null;
  }
  function activeSnapshot() {
    const snap = {};
    for (const kind of Object.keys(ctx.invSeq)) {
      const a = activeInv(kind);
      snap[kind] = a ? a.id : 0;
    }
    return snap;
  }
  // Settlement wrappers: kind, and an extra-context reader (args) that
  // runs at entry (tbEnd: tag the live tbfight; _cxOther/_cxBlood:
  // contest id). Each wrapper ALSO counts its own invocations — the
  // coverage extension (a path that never runs reads 0 here).
  const settlements = [
    { method: 'tbEnd', kind: 'tbEnd', path: 'tb-end', extra: function () {
      let fid = null;
      try { fid = objId(ctx.fightIds, Game.tbfight, 'nextFightId'); } catch (e) {}
      return { fightId: fid };
    } },
    { method: 'resolvePatrol', kind: 'patrol', path: 'patrol' },
    { method: 'resolveWildMonsterEncounter', kind: 'wild', path: 'wild' },
    { method: 'aidFight', kind: 'aid', path: 'aid-crisis' },
    { method: '_cxBlood', kind: 'blood', path: 'contest-blood', extra: function (args) {
      let cid = null;
      try { cid = (args && args[1] && args[1].id) || null; } catch (e) {}
      return { contestId: cid };
    } },
    { method: '_cxOther', kind: 'other', path: 'contest-other', extra: function (args) {
      let cid = null;
      try { cid = (args && args[1] && args[1].id) || null; } catch (e) {}
      return { contestId: cid };
    } },
    { method: 'lingererSortie', kind: 'sortie', path: 'sortie' },
    { method: 'expeditionMonster', kind: 'agency', path: 'agency' },
  ];
  for (const s of settlements) {
    const orig = Game[s.method];
    if (typeof orig !== 'function') { errors.push('settlement wrap missing: ' + s.method); continue; }
    Game[s.method] = (function (origFn, def) {
      return function () {
        const id = ++ctx.invSeq[def.kind];
        ctx.invCounts[def.path]++;
        let extra = null;
        try { extra = def.extra ? def.extra(arguments) : null; } catch (e) {}
        ctx.active.push({ kind: def.kind, id: id, extra: extra });
        try { return origFn.apply(Game, arguments); }
        finally { ctx.active.pop(); }
      };
    })(orig, s);
  }
  // fieldFight wrapper: stamp the fought monster object's identity on
  // return, so a later recordWaveKill can say whether the same world
  // monster object was fought twice (re-fire of one instance) or two
  // distinct objects were fought (genuine repeats). Contests pass m=null
  // (beast is a fresh mdef each wave) — monsterObjId stays null there and
  // the blood-invocation ordinal carries the wave identity instead.
  if (typeof Game.fieldFight === 'function') {
    const origFF = Game.fieldFight;
    Game.fieldFight = function (vid, mdef, m, opts) {
      let rec = null;
      try { rec = origFF.apply(Game, arguments); }
      catch (e) { throw e; }
      try {
        ctx.lastFieldFight = {
          seq: ++ctx.ffSeq,
          vid: vid || null,
          mdefId: (mdef && mdef.id) || null,
          monsterObjId: objId(ctx.monsterIds, m, 'nextMonsterId'),
          outcome: (rec && rec.outcome) || null,
          rounds: (rec && rec.rounds) || 0,
        };
      } catch (e) {}
      return rec;
    };
  } else {
    errors.push('fieldFight wrap missing');
  }
  // Kill-call wrappers. Path classification is NOT done here (offline in
  // the analyzer); the raw frames are stored verbatim.
  const methods = ['recordWaveKill', 'recordPyrrhicKill'];
  for (const name of methods) {
    const orig = Game[name];
    if (typeof orig !== 'function') { errors.push('kill wrap missing: ' + name); continue; }
    const wrapperName = name === 'recordWaveKill' ? 'killchokeRecordWaveKill' : 'killchokeRecordPyrrhicKill';
    const wrapped = (function (origFn, methodName) {
      const fn = function (monsterId, killerVid, via, detail) {
        const seq = ++ctx.callSeq;
        let beforeLen = -1;
        let beforeLog = null;
        try {
          beforeLog = ((Game.state || {}).waveKillLog) || [];
          beforeLen = beforeLog.length;
        } catch (e) {}
        // Stack FIRST (before orig runs — orig's narration can recurse).
        let frames = [];
        try { frames = parseStackFrames(new Error('killchoke').stack); } catch (e) { frames = []; }
        // Ledger snapshot before (pure read).
        const ledBefore = ledgerRead(Game, monsterId);
        // Invocation context + fight census at call time. The TB census
        // is read ONLY inside an active tbEnd invocation — outside it,
        // Game.tbfight may be a stale fight from an earlier combat and
        // must never be attributed to this kill.
        const inv = activeSnapshot();
        const inTb = !!activeInv('tbEnd');
        let fightId = null;
        let deadByType = null;
        try {
          const tb = activeInv('tbEnd');
          if (tb && tb.extra) fightId = tb.extra.fightId || null;
        } catch (e) {}
        try {
          const f = Game.tbfight;
          if (inTb && f && f.fighters) {
            deadByType = {};
            for (const x of f.fighters) {
              if (x && x.kind === 'monster' && !x.alive && x.mdef && x.mdef.id) {
                deadByType[x.mdef.id] = (deadByType[x.mdef.id] | 0) + 1;
              }
            }
          }
        } catch (e) {}
        // Contest id from the active _cxOther / _cxBlood invocation.
        let contestId = null;
        try {
          const other = activeInv('other');
          if (other && other.extra) contestId = other.extra.contestId || null;
          const blood = activeInv('blood');
          if (blood && blood.extra && blood.extra.contestId) contestId = contestId || blood.extra.contestId;
        } catch (e) {}
        // Ordinal of this call within its settlement invocation (blood
        // waves, sortie raiders, agency encounters: 1st, 2nd, ... kill
        // reported by this invocation). The invocation key is the
        // INNERMOST active settlement (kind + '#' + id), so ids from
        // different settlement kinds can never collide.
        let invKey = '';
        try {
          const top = ctx.active[ctx.active.length - 1];
          if (top) invKey = top.kind + '#' + top.id;
        } catch (e) {}
        let ordInInv = 0;
        try {
          ordInInv = calls.filter(function (c) { return c._invKey === invKey; }).length + 1;
        } catch (e) {}
        const ret = origFn.apply(Game, arguments);
        try {
          const ledAfter = ledgerRead(Game, monsterId);
          const log = ((Game.state || {}).waveKillLog) || [];
          const logged = beforeLen >= 0 && log.length > beforeLen;
          let dup = false;
          if (!logged && beforeLog) {
            const d = gday(Game);
            dup = beforeLog.some(function (e) {
              return e && e.d === d && e.mid === monsterId
                && (e.by || null) === (killerVid || null)
                && (e.via || 'unknown') === (via || 'unknown')
                && (e.trick || null) === (detail || null);
            });
          }
          // Last field fight: only attach when it matches this kill
          // (same killer + same monster type) — a stale entry from an
          // unrelated fight must never be attributed to this kill.
          let ff = null;
          try {
            const lf = ctx.lastFieldFight;
            if (lf && lf.vid === killerVid && lf.mdefId === monsterId) ff = lf;
          } catch (e) {}
          const call = {
            seq: seq, method: methodName, day: gday(Game), mid: monsterId,
            by: killerVid || null, via: via || 'unknown',
            trick: detail || null, logged: logged, dup: dup,
            stackFrames: frames,
            inv: inv, ordInInv: ordInInv,
            fightId: fightId, deadByType: deadByType,
            contestId: contestId,
            fieldFightSeq: ff ? ff.seq : null,
            monsterObjId: ff ? ff.monsterObjId : null,
            ledger: {
              wave: ledBefore.wave,
              pointsBefore: ledBefore.points, pointsAfter: ledAfter.points,
              perTypeBefore: ledBefore.perType, perTypeAfter: ledAfter.perType,
              add: (ledAfter.perType - ledBefore.perType) | 0,
              cap: ledBefore.cap, bar: ledBefore.bar,
              roomBefore: Math.max(0, ledBefore.cap - ledBefore.perType),
              counterKnown: ledBefore.counterKnown,
              crossedBar: ledBefore.bar > 0 && ledBefore.points < ledBefore.bar && ledAfter.points >= ledBefore.bar,
            },
            _invKey: invKey,
          };
          calls.push(call);
          if (logged) {
            const entry = log[log.length - 1];
            if (entry && entry.mid === monsterId && (entry.by || null) === (killerVid || null)) {
              let living = null;
              try { living = Game._ladderLivingVeterans(4); } catch (e) { errors.push(methodName + ' sample: ' + String(e.message).slice(0, 120)); }
              samples.push({
                day: gday(Game), mid: entry.mid, by: entry.by, w: entry.w | 0,
                via: entry.via || via || 'unknown', method: methodName,
                pyrrhic: entry.pyrrhic === true,
                livingVeteransAtKill: living,
                scholarIdAtKill: (function () { try { return Game.villagerId || null; } catch (e) { return null; } })(),
              });
            }
          }
        } catch (e) { errors.push(methodName + ' sample: ' + String(e.message).slice(0, 120)); }
        return ret;
      };
      // Name the wrapper so the offline classifier can skip it by name.
      try { Object.defineProperty(fn, 'name', { value: wrapperName }); } catch (e) {}
      return fn;
    })(orig, name);
    Game[name] = wrapped;
  }
  return ctx;
}

async function oneRun(seed) {
  const { Game } = await loadGame({ seed: seed, mode: 'killchoke-a', fullTelemetry: false });
  const rows = [];
  const errors = [];
  const killTimeSamples = [];
  const killCalls = [];
  let lastSnapDay = -1;
  let recorderCtx = null;
  await setupGame(Game);
  if (RECORD) recorderCtx = wrapKillchokeRecorder(Game, killTimeSamples, killCalls, errors);
  const wrapped = Object.assign({}, COMPETENT.competent, {
    daily: function (Gm, ctx) {
      try { return COMPETENT.competent.daily(Gm, ctx); } finally {
        try {
          const d = gday(Game);
          if (d !== lastSnapDay) { lastSnapDay = d; rows.push(snapshotLadder(Game)); }
        } catch (e) { errors.push('snapshot: ' + String(e.message).slice(0, 120)); }
      }
    },
  });
  let result = null;
  await quietLog(async function () { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { const d = gday(Game); if (d !== lastSnapDay) rows.push(snapshotLadder(Game)); } catch (e) { errors.push('final-snapshot: ' + String(e.message).slice(0, 120)); }
  const st = Game.state || {};
  const summary = summarize(rows);
  summary.killTimeSamples = killTimeSamples.length;
  summary.killTimePeakVeterans = killTimeSamples.reduce(function (m, s) { return (typeof s.livingVeteransAtKill === 'number' && s.livingVeteransAtKill > m) ? s.livingVeteransAtKill : m; }, 0);
  summary.killTimeEverTwoVeterans = killTimeSamples.some(function (s) { return (s.livingVeteransAtKill | 0) >= 2; });
  summary.killCalls = killCalls.length;
  summary.killCallsLogged = killCalls.filter(function (c) { return c.logged; }).length;
  summary.killCallsDup = killCalls.filter(function (c) { return c.dup; }).length;
  summary.killCallsPyrrhic = killCalls.filter(function (c) { return c.method === 'recordPyrrhicKill'; }).length;
  summary.settlementInvocations = recorderCtx ? recorderCtx.invCounts : null;
  const out = {
    seed: seed, arm: 'killchoke-a', run: 'fleshout-20261110T1915Z',
    policy: 'competent', anchorCommit: ANCHOR, days: DAYS,
    recorded: RECORD,
    resultDays: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost,
    maxWaveUnlocked: result.maxWaveUnlocked || 1,
    waveKills: result.waveKills || {},
    scaleTrajectory: (result.samples && result.samples.scale) || [],
    teleDeaths: (result.samples && result.samples.deaths) || [],
    summary: summary, killTimeSamples: killTimeSamples, killCalls: killCalls,
    killers: buildKillers(Game, rows),
    reconciliation: reconcile(Game),
    daily: rows, recorderErrors: errors,
  };
  return out;
}

async function main() {
  loadConfig();
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'killchoke-a-s' + seed + '.json');
    fs.writeFileSync(file, JSON.stringify(out, null, 2) + '\n');
    const s = out.summary;
    console.log(JSON.stringify({
      seed: out.seed, days: out.resultDays, endReason: out.endReason, won: out.won,
      maxWave: out.maxWaveUnlocked, peakStage: s.peakLadderStage, peakScale: s.peakScaleRank,
      peakVets: s.peakLivingVeterans, killTimePeakVets: s.killTimePeakVeterans, killTimeEverTwo: s.killTimeEverTwoVeterans,
      everReady: s.everReady, firstReadyDay: s.firstReadyDay,
      everChartered: s.everCharteredLinks, everBundle: s.everFeastBundle,
      killCalls: s.killCalls, logged: s.killCallsLogged, dup: s.killCallsDup, pyrrhic: s.killCallsPyrrhic,
      settlementInvocations: s.settlementInvocations,
      killers: out.killers.length,
      reconcile: out.reconciliation.allAgree, reconcileWaves: out.reconciliation.waves,
      rows: s.days, recorderErrors: out.recorderErrors.length, file: path.relative(REPO, file),
    }));
  }
}

if (require.main === module) {
  main().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
}

module.exports = {
  snapshotLadder: snapshotLadder, summarize: summarize, buildKillers: buildKillers, reconcile: reconcile,
  wrapKillchokeRecorder: wrapKillchokeRecorder, parseStackFrames: parseStackFrames, classifyFrames: classifyFrames, ledgerRead: ledgerRead,
  SETTLEMENT_NAMES: SETTLEMENT_NAMES, DEEDS: DEEDS,
};
