// choketrace-b-driver.js — kill choke-point trace census
// (arm sim-choketrace-b, Loop B run fleshout-loop-b-20261110T1445Z,
// axis scale-onramp / winnability chain; prereg
// evidence/2026-11-10/sim-choketrace-b-prereg.md).
// Derived from scripts/vetcount-b-driver.js (same daily census: plain
// competent policy, 150d death-aware, same seeds 140201-140208) PLUS
// per-call ATTRIBUTION of every recordWaveKill / recordPyrrhicKill call:
// caller path (from the call stack, mapped to the nine named call sites),
// settlement-invocation id (pass-through wrappers around the eight
// settlement functions), fight/monster-instance identity (tbfight object
// id for TB; fieldFight monster-object id for field paths), dead-fighter
// census by type at call time (TB), and per-call ledger scoring (ledger
// per-type before/after around the call, so each re-fire's add is known).
// DIAG ONLY — zero src/js changes; the recorder wraps Game methods with
// pure reads around the original calls and must not change trajectories
// (neutrality is a proof leg in scripts/test-choketrace-b.js, and the
// corpus is cross-checked against the vetcount after-leg).
// Usage:
//   SEEDS=140201..140208 DAYS=150 OUTDIR=evidence/2026-11-10/perseed-choketrace-b node scripts/choketrace-b-driver.js
// Writes evidence/2026-11-10/perseed-choketrace-b/choketrace-b-s<seed>.json
// (refuses to overwrite an existing per-seed file).
// CHOKE_RECORD=0 installs no wrappers (honesty control: trajectories must
// be byte-identical to the recorded run).
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

const RECORD = process.env.CHOKE_RECORD !== '0';

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
  if (!SEEDS.length) { console.error('CHOKETRACE-B STOP: SEEDS required (e.g. SEEDS=140201..140208).'); process.exit(2); }
  try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}
  outDir = process.env.OUTDIR || path.join(REPO, 'evidence', '2026-11-10', 'perseed-choketrace-b');
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) {
    const file = path.join(outDir, 'choketrace-b-s' + seed + '.json');
    if (fs.existsSync(file)) { console.error('CHOKETRACE-B STOP: refusing to overwrite ' + file); process.exit(3); }
  }
}

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

// --- attribution machinery (pure reads; no RNG, no game-state mutation) ---

// The nine named caller paths (prereg § Candidate caller paths). The stack
// parser maps the first known settlement frame to one of these; anything
// else is UNATTRIBUTED (honest fallback, never guessed).
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
  chokeRecordWaveKill: true, chokeRecordPyrrhicKill: true,
};

// classifyStack(stack): first known settlement function in the stack wins.
// Returns {path, frames} — frames are the parsed function names (top 12)
// for diagnosis of UNATTRIBUTED calls.
function classifyStack(stack) {
  const frames = [];
  try {
    const lines = String(stack || '').split('\n').slice(1);
    for (const ln of lines) {
      if (frames.length >= 12) break;
      let m = ln.match(/at\s+(?:async\s+)?(?:[^\s(]+\.)?([A-Za-z_$][\w$]*)\s*\(/);
      if (!m) m = ln.match(/at\s+([^\s(]+)\s*\(/);
      if (!m) continue;
      const name = (m[1] || '').split('.').pop();
      if (name) frames.push(name);
    }
  } catch (e) {}
  for (const n of frames) {
    if (SKIP_FRAMES[n]) continue;
    if (SETTLEMENT_NAMES[n]) return { path: SETTLEMENT_NAMES[n], frames: frames };
  }
  return { path: 'UNATTRIBUTED', frames: frames };
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

// wrapChokeRecorder(Game, samples, calls, errors): the attribution
// recorder. Installs (a) pass-through wrappers around the eight settlement
// functions, stamping an invocation id + contest/fight context while they
// run; (b) a wrapper around fieldFight, stamping the fought monster
// object's identity on return; (c) wrappers around recordWaveKill /
// recordPyrrhicKill that classify the call from its stack, read the
// invocation context, the fight census, and the ledger before/after.
// Every wrapper is a pure pass-through plus module-local bookkeeping:
// no RNG consumed, no game state written, no return value changed.
function wrapChokeRecorder(Game, samples, calls, errors) {
  const ctx = {
    invSeq: { tbEnd: 0, patrol: 0, wild: 0, aid: 0, blood: 0, other: 0, sortie: 0, agency: 0 },
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
  // runs at entry (tbEnd: tag the live tbfight; _cxOther: contest id).
  const settlements = [
    { method: 'tbEnd', kind: 'tbEnd', extra: function () {
      let fid = null;
      try { fid = objId(ctx.fightIds, Game.tbfight, 'nextFightId'); } catch (e) {}
      return { fightId: fid };
    } },
    { method: 'resolvePatrol', kind: 'patrol' },
    { method: 'resolveWildMonsterEncounter', kind: 'wild' },
    { method: 'aidFight', kind: 'aid' },
    { method: '_cxBlood', kind: 'blood', extra: function (args) {
      let cid = null;
      try { cid = (args && args[1] && args[1].id) || null; } catch (e) {}
      return { contestId: cid };
    } },
    { method: '_cxOther', kind: 'other', extra: function (args) {
      let cid = null;
      try { cid = (args && args[1] && args[1].id) || null; } catch (e) {}
      return { contestId: cid };
    } },
    { method: 'lingererSortie', kind: 'sortie' },
    { method: 'expeditionMonster', kind: 'agency' },
  ];
  for (const s of settlements) {
    const orig = Game[s.method];
    if (typeof orig !== 'function') { errors.push('settlement wrap missing: ' + s.method); continue; }
    Game[s.method] = (function (origFn, def) {
      return function () {
        const id = ++ctx.invSeq[def.kind];
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
  // Kill-call wrappers.
  const methods = ['recordWaveKill', 'recordPyrrhicKill'];
  for (const name of methods) {
    const orig = Game[name];
    if (typeof orig !== 'function') { errors.push('kill wrap missing: ' + name); continue; }
    const wrapperName = name === 'recordWaveKill' ? 'chokeRecordWaveKill' : 'chokeRecordPyrrhicKill';
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
        let stackInfo = null;
        try { stackInfo = classifyStack(new Error('choke').stack); } catch (e) { stackInfo = { path: 'UNATTRIBUTED', frames: [] }; }
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
        // Contest refinement: _cxOther + contest id -> hide / beastmaster.
        let path = stackInfo.path;
        let contestId = null;
        try {
          const other = activeInv('other');
          if (other && other.extra) contestId = other.extra.contestId || null;
          const blood = activeInv('blood');
          if (blood && blood.extra && blood.extra.contestId) contestId = contestId || blood.extra.contestId;
        } catch (e) {}
        if (path === 'contest-other' && contestId) path = 'contest-' + contestId;
        // Ordinal of this call within its settlement invocation (blood
        // waves, sortie raiders, agency encounters: 1st, 2nd, ... kill
        // reported by this invocation).
        let ordInInv = 0;
        try {
          ordInInv = calls.filter(function (c) {
            return c._invKey === (path + '#' + (inv.tbEnd || inv.patrol || inv.wild || inv.aid || inv.blood || inv.other || inv.sortie || inv.agency));
          }).length + 1;
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
            path: path, stackFrames: stackInfo.frames,
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
            _invKey: path + '#' + (inv.tbEnd || inv.patrol || inv.wild || inv.aid || inv.blood || inv.other || inv.sortie || inv.agency),
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
      // Name the wrapper so the stack parser can skip it by name.
      try { Object.defineProperty(fn, 'name', { value: wrapperName }); } catch (e) {}
      return fn;
    })(orig, name);
    Game[name] = wrapped;
  }
  return ctx;
}

async function oneRun(seed) {
  const { Game } = await loadGame({ seed: seed, mode: 'choketrace-b', fullTelemetry: false });
  const rows = [];
  const errors = [];
  const killTimeSamples = [];
  const killCalls = [];
  let lastSnapDay = -1;
  await setupGame(Game);
  if (RECORD) wrapChokeRecorder(Game, killTimeSamples, killCalls, errors);
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
  summary.killCallsUnattributed = killCalls.filter(function (c) { return c.path === 'UNATTRIBUTED'; }).length;
  const out = {
    seed: seed, arm: 'choketrace-b', run: 'fleshout-loop-b-20261110T1445Z',
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
    const file = path.join(outDir, 'choketrace-b-s' + seed + '.json');
    fs.writeFileSync(file, JSON.stringify(out, null, 2) + '\n');
    const s = out.summary;
    console.log(JSON.stringify({
      seed: out.seed, days: out.resultDays, endReason: out.endReason, won: out.won,
      maxWave: out.maxWaveUnlocked, peakStage: s.peakLadderStage, peakScale: s.peakScaleRank,
      peakVets: s.peakLivingVeterans, killTimePeakVets: s.killTimePeakVeterans, killTimeEverTwo: s.killTimeEverTwoVeterans,
      everReady: s.everReady, firstReadyDay: s.firstReadyDay,
      everChartered: s.everCharteredLinks, everBundle: s.everFeastBundle,
      killCalls: s.killCalls, logged: s.killCallsLogged, dup: s.killCallsDup, pyrrhic: s.killCallsPyrrhic,
      unattributed: s.killCallsUnattributed,
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
  wrapChokeRecorder: wrapChokeRecorder, classifyStack: classifyStack, ledgerRead: ledgerRead, DEEDS: DEEDS,
};
