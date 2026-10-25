// wave2enc-diag — the wave-2 encounter/kill-opportunity recorder
// (sim-wave2enc-a, 2026-10-24, flesh-out loop, axis scale-onramp,
// the named next blank from sim-encounter-a: seed 73674 NEVER-FACED
// wave 3 in 180 days because its wave-2 ledger sat at 1 point (one
// heckler kill) vs the wave-3 gate bar of 4, day floor 25 long past).
//
// THE QUESTION: why does a 73674-class seed never get its second
// wave-2 kill — missing spawns, missing fights, or lost fights?
// Three very different failures hide behind "1 point":
//   (a) NEVER-SPAWNED — no wave-2 monster ever spawned near the village;
//   (b) SPAWNED-UNFOUGHT — wave-2 monsters spawned but no blow-by-blow
//       fight ever started (despawned, evaded, wandered off, refused);
//   (c) FOUGHT-LOST / FOUGHT-FLED / FOUGHT-DROVE-OFF — fights started
//       but ended without a kill (a combat-outcome failure);
//   (d) KILLED-BELOW-BAR — kills happened but the ledger stayed below
//       4 (too few kills, too narrow a breadth, or the per-type cap 2
//       eating repeat kills of the same type).
// A daily snapshot alone cannot separate (b) from (c): the deed feed
// (deedState().wavesFaced) records only that a fight STARTED, never its
// outcome, and fieldFight outcomes are returned to callers, never logged
// centrally. So this recorder has two layers, both observational:
//   LAYER 1 (daily pure-read): end-of-day copies of the deed feed, the
//     kill log, the wave-1/2 ledger points + per-type breakdown, and the
//     recomputed wave-3 gate (day >= 25 AND waveLedgerPoints(2) >= 4 —
//     exactly the wave-3 rung of unlockedWave(); standing gates only
//     waves 4-5 on top of this rung). It NEVER calls unlockedWave() or
//     villageStandingTotal() during a run (both have side effects).
//   LAYER 2 (call observation): wraps installed on the per-run Game
//     object that record AFTER delegating: spawnWorldMonster,
//     fieldFight, tbEnd. The wraps write NOTHING to game state, draw NO
//     RNG, never throw into the engine (recording errors are counted),
//     and return the original's value untouched.
// The corpus persists EVENT ROWS (capped, wave-2 only), not counts
// alone — counts-only censuses forced re-runs in encounter-a.
//
// WRAP PURITY (the encounter-a lesson, re-applied): tbEnd ends with
// `this.tbfight = null`, so the tbEnd wrap captures the fight OBJECT
// before delegating and checks `captured.over` afterwards — never a
// post-call Game.tbfight read. The sweep cross-checks every wrap
// against an independent engine source (the kill log's player/
// companion via values) before trusting a zero: tb fights 0 while
// player-via wave-2 kills exist is a recorder failure, not a finding.
//
// COMPOSE UPON (never edit): tableseat-nowait (which wraps
// leanlinkrescue). WAVE2ENC=1 is the only on-switch. Unset delegates
// byte-identically: no wraps installed, no daily record, no ctx surface.
//
// KNOWN LIMITS (stated, not hidden):
// - Fight-to-spawn linkage is by monster TYPE, not by entity instance:
//   world-monster entities carry no stable instance id, so a spawned
//   type that was never in the deed feed is "unfought" at type level.
// - Contest-arena tb fights share tbEnd with wild fights; the wrap
//   records a best-effort arena context flag, not a clean wild/contest
//   split. fieldFight rows record opts.rng presence as a contest-like
//   proxy — a proxy, never presented as a fact.
// - A fight that starts but never settles before the run ends has no
//   outcome row; the classifier reports it UNCLASSIFIED, never guessed.
// - Player tb 'won' with no kill means the monster was driven off /
//   fled (tbEndCheck ends 'won' when no monster fights on).
//
// POLICY-SIDE ONLY — zero src/js changes, no default flips.
'use strict';

const { copyKillLog } = require('./vetkill-diag');

const MAX_EVENTS = 20000;

function layerOn() { return process.env.WAVE2ENC === '1'; }
function n0(x) { const n = x | 0; return n > 0 ? n : 0; }
function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

function newStore() {
  return {
    spawns: [], fieldFights: [], tbFights: [], daily: [],
    errs: 0, errors: [], overflow: { spawns: 0, fieldFights: 0, tbFights: 0 },
    installed: false,
  };
}

function noteErr(store, where, e) {
  try {
    store.errs++;
    if (store.errors.length < 20) store.errors.push(where + ': ' + String((e && e.message) || e).slice(0, 120));
  } catch (e2) { /* error counting must never throw */ }
}

function pushCapped(store, list, item) {
  if (store[list].length >= MAX_EVENTS) { store.overflow[list]++; return false; }
  store[list].push(item);
  return true;
}

function copyWavesFaced(Game) {
  const out = { faced: {}, errs: 0, error: null };
  try {
    const ds = (typeof Game.deedState === 'function') ? Game.deedState() : null;
    const faced = (ds && ds.wavesFaced) || {};
    for (const k of Object.keys(faced)) out.faced[k] = faced[k] | 0;
  } catch (e) { out.errs++; out.error = 'wavesFaced: ' + String((e && e.message) || e).slice(0, 100); }
  return out;
}

// ledgerGateW3(Game): the wave-3 rung recomputed from pure reads.
// Returns {day, pts1, pts2, bar1, bar2, dayFloor, wave2DayFloor,
// w2gate, w3gate, perType2, errs, error}. waveLedgerPoints() reads
// ledgerState (idempotent init only); it scores nothing and announces
// nothing. The wave-2 unlock rung (day >= wave2DayFloor AND pts1 >=
// bar1) is reported for context, not judged.
function ledgerGateW3(Game) {
  const out = { day: dayOf(Game), pts1: null, pts2: null, bar1: null, bar2: null, dayFloor: null, wave2DayFloor: null, w2gate: false, w3gate: false, perType2: null, errs: 0, error: null };
  try {
    out.pts1 = (typeof Game.waveLedgerPoints === 'function') ? (Game.waveLedgerPoints(1) | 0) : null;
    out.pts2 = (typeof Game.waveLedgerPoints === 'function') ? (Game.waveLedgerPoints(2) | 0) : null;
  } catch (e) { out.errs++; out.error = 'ledgerPoints: ' + String((e && e.message) || e).slice(0, 100); }
  try {
    const cfg = (typeof Game.waveLedgerCfg === 'function') ? Game.waveLedgerCfg() : null;
    if (cfg) {
      if (cfg.barsPerWave) { out.bar1 = (cfg.barsPerWave[1] | 0) || null; out.bar2 = (cfg.barsPerWave[2] | 0) || null; }
      if (cfg.dayFloor != null) out.dayFloor = cfg.dayFloor | 0;
      if (cfg.wave2DayFloor != null) out.wave2DayFloor = cfg.wave2DayFloor | 0;
    }
  } catch (e) { out.errs++; out.error = (out.error ? out.error + '; ' : '') + 'ledgerCfg: ' + String((e && e.message) || e).slice(0, 100); }
  try {
    const L = (typeof Game.ledgerState === 'function') ? Game.ledgerState() : null;
    if (L && L[2]) out.perType2 = { points: L[2].points | 0, perType: Object.assign({}, L[2].perType || {}), perTypeX: Object.assign({}, L[2].perTypeX || {}) };
  } catch (e) { out.errs++; out.error = (out.error ? out.error + '; ' : '') + 'ledgerState: ' + String((e && e.message) || e).slice(0, 100); }
  const bar1 = out.bar1 != null ? out.bar1 : 5;
  const bar2 = out.bar2 != null ? out.bar2 : 4;
  const floor = out.dayFloor != null ? out.dayFloor : 25;
  const floor2 = out.wave2DayFloor != null ? out.wave2DayFloor : 8;
  out.w2gate = out.day >= floor2 && (out.pts1 != null ? out.pts1 : 0) >= bar1;
  out.w3gate = out.day >= floor && (out.pts2 != null ? out.pts2 : 0) >= bar2;
  return out;
}

// recordDaily(Game, ctx, store): one end-of-day point (LAYER 1). Lean
// by design: only the ledger + faced + log length, not the full world
// list — the event rows carry the wave-2 detail.
function recordDaily(Game, ctx, store) {
  const p = { day: dayOf(Game), errs: 0 };
  const faced = copyWavesFaced(Game);
  const facedW2 = {};
  for (const k of Object.keys(faced.faced)) if ((faced.faced[k] | 0) === 2) facedW2[k] = 2;
  p.facedW2 = facedW2; p.errs += faced.errs; if (faced.error) p.error = faced.error;
  const prev = store.daily.length ? store.daily[store.daily.length - 1] : null;
  const prevFaced = (prev && prev.facedW2) || {};
  p.facedNewW2 = Object.keys(facedW2).filter(mid => !(mid in prevFaced));
  const gate = ledgerGateW3(Game);
  p.ledger = { pts1: gate.pts1, pts2: gate.pts2, bar1: gate.bar1, bar2: gate.bar2, dayFloor: gate.dayFloor, wave2DayFloor: gate.wave2DayFloor, w2gate: gate.w2gate, w3gate: gate.w3gate, perType2: gate.perType2 };
  p.errs += gate.errs; if (gate.error) p.error = (p.error ? p.error + '; ' : '') + gate.error;
  const log = copyKillLog(Game);
  p.logLen = log.entries.length; p.errs += log.errs; if (log.error) p.error = (p.error ? p.error + '; ' : '') + log.error;
  store.daily.push(p);
  store.errs += p.errs;
  return p;
}

// installWave2EncDiag(Game, store): LAYER 2 wraps. Idempotent per
// (Game, store) pair. Returns an uninstall function. The wraps record
// AFTER delegating and never throw into the engine.
function installWave2EncDiag(Game, store) {
  if (!Game || !store) return function () {};
  if (Game._wave2encDiagStore === store && Game._wave2encDiagInstalled) return Game._wave2encDiagUninstall || function () {};
  const uninstalls = [];
  try {
    if (typeof Game.spawnWorldMonster === 'function') {
      const orig = Game.spawnWorldMonster;
      Game.spawnWorldMonster = function (mdef, tx, ty, opts) {
        const mon = orig.apply(this, arguments);
        try {
          if (mon) pushCapped(store, 'spawns', { day: dayOf(Game), mid: mon.id || null, wave: n0(mon.wave), tx: mon.tx != null ? (mon.tx | 0) : null, ty: mon.ty != null ? (mon.ty | 0) : null, veteran: !!mon.veteran });
        } catch (e) { noteErr(store, 'spawn.rec', e); }
        return mon;
      };
      uninstalls.push(() => { try { Game.spawnWorldMonster = orig; } catch (e) {} });
    } else { noteErr(store, 'spawn.missing', new Error('no spawnWorldMonster')); }
  } catch (e) { noteErr(store, 'spawn.wrap', e); }
  try {
    if (typeof Game.fieldFight === 'function') {
      const orig = Game.fieldFight;
      Game.fieldFight = function (vid, mdef, m, opts) {
        const rec = orig.apply(this, arguments);
        try {
          const md = mdef || {};
          pushCapped(store, 'fieldFights', {
            day: dayOf(Game), vid: vid != null ? String(vid) : null,
            mid: md.id || null, wave: (md.wave | 0) || 1,
            outcome: rec ? (rec.outcome || null) : null,
            rounds: rec ? (rec.rounds | 0) : null,
            vHpLeft: rec ? (rec.vHpLeft != null ? Math.round(rec.vHpLeft) : null) : null,
            mHpLeft: rec ? (rec.mHpLeft != null ? Math.round(rec.mHpLeft) : null) : null,
            allyVid: rec ? (rec.allyVid || null) : null,
            calledHelp: rec ? !!rec.calledHelp : false,
            intent: rec ? (rec.intent || null) : null,
            hasRng: !!(opts && opts.rng),
            hasAllies: !!(opts && opts.allies),
          });
        } catch (e) { noteErr(store, 'fieldFight.rec', e); }
        return rec;
      };
      uninstalls.push(() => { try { Game.fieldFight = orig; } catch (e) {} });
    } else { noteErr(store, 'fieldFight.missing', new Error('no fieldFight')); }
  } catch (e) { noteErr(store, 'fieldFight.wrap', e); }
  // tbEnd wrap: capture the fight OBJECT before delegating — tbEnd
  // ends with `this.tbfight = null`, so a post-call Game.tbfight read
  // always misses (the encounter-a first-sweep bug).
  try {
    if (typeof Game.tbEnd === 'function') {
      const orig = Game.tbEnd;
      Game.tbEnd = function (result) {
        let pre = null;
        try {
          const f = Game.tbfight;
          if (f && !f.over) {
            const monsterIds = [], villagerIds = [];
            let scholarIn = false;
            for (const fighter of (f.fighters || [])) {
              if (!fighter) continue;
              if (fighter.kind === 'monster' && fighter.monsterId) monsterIds.push(String(fighter.monsterId));
              if (fighter.kind === 'villager' && fighter.villagerId) villagerIds.push(String(fighter.villagerId));
              if (fighter.kind === 'player') scholarIn = true;
            }
            pre = { fight: f, monsterIds, villagerIds, scholarIn, arena: !!(f.coalitionArena || f.arena) };
          }
        } catch (e) { noteErr(store, 'tbEnd.pre', e); pre = null; }
        const r = orig.apply(this, arguments);
        try {
          if (pre && pre.fight.over) {
            pushCapped(store, 'tbFights', { day: dayOf(Game), result: pre.fight.result != null ? String(pre.fight.result) : (result != null ? String(result) : null), monsterIds: pre.monsterIds, villagerIds: pre.villagerIds, scholarIn: pre.scholarIn, arena: pre.arena });
          }
        } catch (e) { noteErr(store, 'tbEnd.rec', e); }
        return r;
      };
      uninstalls.push(() => { try { Game.tbEnd = orig; } catch (e) {} });
    } else { noteErr(store, 'tbEnd.missing', new Error('no tbEnd')); }
  } catch (e) { noteErr(store, 'tbEnd.wrap', e); }
  const uninstall = function () {
    for (let i = uninstalls.length - 1; i >= 0; i--) { try { uninstalls[i](); } catch (e) {} }
    try { Game._wave2encDiagInstalled = false; } catch (e) {}
  };
  try {
    Game._wave2encDiagStore = store;
    Game._wave2encDiagInstalled = true;
    Game._wave2encDiagUninstall = uninstall;
  } catch (e) { noteErr(store, 'install.flag', e); }
  store.installed = true;
  return uninstall;
}

function ensureWave2Enc(ctx, store) {
  let D = ctx._wave2encdiag;
  if (!D) D = ctx._wave2encdiag = { store: store };
  return D;
}

function withWave2EncDiag(inner, id, desc, store) {
  const st = store || newStore();
  return Object.assign({}, inner, {
    id, desc,
    daily(Game, ctx) {
      const r = inner.daily ? inner.daily(Game, ctx) : undefined;
      if (layerOn()) {
        try { installWave2EncDiag(Game, st); } catch (e) { noteErr(st, 'daily.install', e); }
        try { ensureWave2Enc(ctx, st); recordDaily(Game, ctx, st); } catch (e) { noteErr(st, 'daily.rec', e); }
      }
      return r;
    },
  });
}

// classifyWave2(input): the per-seed verdict. input: {spawns,
// fieldFights, tbFights, faced, killEntries, waveOf, daily, perType2,
// bar2, dayFloor} where waveOf(mid) resolves a monster id to its wave.
// Labels (fixed before sweeping, priority GATE-OPEN > KILLED-BELOW-BAR
// > NEVER-SPAWNED > SPAWNED-UNFOUGHT > FOUGHT-LOST > FOUGHT-FLED >
// FOUGHT-DROVE-OFF > UNCLASSIFIED):
//   GATE-OPEN: end pts2 >= bar2 (and the day floor passed) — no stall.
//   KILLED-BELOW-BAR: wave-2 kills exist but end pts2 < bar2.
//   NEVER-SPAWNED: no wave-2 spawn, fight, or kill.
//   SPAWNED-UNFOUGHT: wave-2 spawn exists, no wave-2 fight started.
//   FOUGHT-LOST: a wave-2 fight ended tb lost, or field vDie.
//   FOUGHT-FLED: a wave-2 fight ended tb fled/routed, or field vFlee
//     (and no LOST fight — LOST outranks FLED).
//   FOUGHT-DROVE-OFF: wave-2 fights happened, none lost/fled, at least
//     one ended tb won-no-kill or field mFlee/evade.
//   UNCLASSIFIED: a wave-2 fight is in the deed feed but no fight row
//     and no spawn row explains it, or a fight row carries no outcome.
function classifyWave2(input) {
  const inp = input || {};
  const waveOf = (typeof inp.waveOf === 'function') ? inp.waveOf : function () { return 1; };
  const isW2 = (w) => (w | 0) === 2;
  const spawns = (inp.spawns || []).filter(s => s && (isW2(s.wave) || (s.mid && isW2(waveOf(s.mid)))));
  const ff = (inp.fieldFights || []).filter(f => f && isW2(f.wave));
  const tb = (inp.tbFights || []).filter(t => t && (t.monsterIds || []).some(mid => isW2(waveOf(mid))));
  const faced = inp.faced || {};
  const facedW2 = Object.keys(faced).filter(mid => isW2(faced[mid]));
  const kills = (inp.killEntries || []).filter(e => e && isW2(e.w));
  const bar2 = inp.bar2 != null ? (inp.bar2 | 0) : 4;
  const dayFloor = inp.dayFloor != null ? (inp.dayFloor | 0) : 25;
  const endPts2 = inp.endPts2 != null ? (inp.endPts2 | 0)
    : (inp.perType2 && inp.perType2.points != null ? (inp.perType2.points | 0) : 0);
  const endDay = inp.endDay != null ? (inp.endDay | 0) : 0;
  // Gate trajectory from the daily ledger points (change points only).
  const traj = [];
  let prevPts = null, firstGateDay = null, firstPtsDay = {};
  for (const p of (inp.daily || [])) {
    const pts = (p.ledger && p.ledger.pts2 != null) ? (p.ledger.pts2 | 0) : null;
    if (pts == null) continue;
    if (pts !== prevPts) { traj.push({ day: p.day | 0, pts2: pts, perType: (p.ledger && p.ledger.perType2 && p.ledger.perType2.perType) ? Object.assign({}, p.ledger.perType2.perType) : {} }); prevPts = pts; }
    if (firstPtsDay[pts] == null) firstPtsDay[pts] = p.day | 0;
    if (firstGateDay == null && (p.day | 0) >= dayFloor && pts >= bar2) firstGateDay = p.day | 0;
  }
  const firstSpawnDay = spawns.length ? Math.min.apply(null, spawns.map(s => s.day | 0)) : null;
  const firstFightDay = (ff.length || tb.length) ? Math.min.apply(null, ff.concat([]).map(f => f.day | 0).concat(tb.map(t => t.day | 0))) : null;
  const firstKillDay = kills.length ? Math.min.apply(null, kills.map(e => e.d | 0)) : null;
  const outcomeCounts = { tbWon: 0, tbWonKill: 0, tbWonNoKill: 0, tbLost: 0, tbFled: 0, tbRouted: 0, tbOther: 0, fieldVKill: 0, fieldVDie: 0, fieldVFlee: 0, fieldMFlee: 0, fieldEvade: 0, fieldOther: 0, fieldNoOutcome: 0 };
  const killDaysByMid = {};
  for (const e of kills) { if (!killDaysByMid[e.mid]) killDaysByMid[e.mid] = []; killDaysByMid[e.mid].push(e.d | 0); }
  for (const t of tb) {
    const mids = (t.monsterIds || []).filter(mid => isW2(waveOf(mid)));
    const killed = mids.some(mid => (killDaysByMid[mid] || []).some(d => d >= (t.day | 0)));
    if (t.result === 'won') { outcomeCounts.tbWon++; if (killed) outcomeCounts.tbWonKill++; else outcomeCounts.tbWonNoKill++; }
    else if (t.result === 'lost') outcomeCounts.tbLost++;
    else if (t.result === 'fled') outcomeCounts.tbFled++;
    else if (t.result === 'routed') outcomeCounts.tbRouted++;
    else outcomeCounts.tbOther++;
  }
  for (const f of ff) {
    if (f.outcome === 'vKill') outcomeCounts.fieldVKill++;
    else if (f.outcome === 'vDie') outcomeCounts.fieldVDie++;
    else if (f.outcome === 'vFlee') outcomeCounts.fieldVFlee++;
    else if (f.outcome === 'mFlee') outcomeCounts.fieldMFlee++;
    else if (f.outcome === 'evade') outcomeCounts.fieldEvade++;
    else if (f.outcome == null) outcomeCounts.fieldNoOutcome++;
    else outcomeCounts.fieldOther++;
  }
  let tbPlayerOnly = 0, tbWithVillager = 0, tbScholarAbsent = 0;
  for (const t of tb) {
    if (!t.scholarIn) tbScholarAbsent++;
    else if ((t.villagerIds || []).length) tbWithVillager++;
    else tbPlayerOnly++;
  }
  const fieldWithAlly = ff.filter(f => f.allyVid || f.calledHelp).length;
  const killsByType = {};
  for (const e of kills) killsByType[e.mid] = (killsByType[e.mid] || 0) + 1;
  const pointsByType = (inp.perType2 && inp.perType2.perType) ? Object.assign({}, inp.perType2.perType) : {};
  const perTypeCap = inp.perTypeCap != null ? (inp.perTypeCap | 0) : 2;
  const typesAtCap = Object.keys(pointsByType).filter(mid => (pointsByType[mid] | 0) >= perTypeCap);
  const spawnedTypes = [];
  { const seen = {}; for (const s of spawns) { if (s.mid && !seen[s.mid]) { seen[s.mid] = true; spawnedTypes.push(s.mid); } } }
  const facedSet = {}; for (const mid of facedW2) facedSet[mid] = true;
  const unfoughtSpawnTypes = spawnedTypes.filter(mid => !facedSet[mid] && !(killDaysByMid[mid] || []).length);
  const foughtTypes = facedW2.slice();
  const nFights = ff.length + tb.length;
  const hasSpawn = spawns.length > 0;
  const hasFight = nFights > 0 || facedW2.length > 0;
  const hasKill = kills.length > 0;
  const hasUnknownOutcome = outcomeCounts.fieldNoOutcome > 0 || outcomeCounts.tbOther > 0;
  const gateOpen = endPts2 >= bar2 && endDay >= dayFloor;
  let label, reason;
  if (gateOpen) { label = 'GATE-OPEN'; reason = 'wave-2 ledger ' + endPts2 + '/' + bar2 + ' at day ' + endDay + ' (first gate day ' + firstGateDay + ') — no wave-2 stall'; }
  else if (hasKill) { label = 'KILLED-BELOW-BAR'; reason = kills.length + ' wave-2 kill(s) in ' + Object.keys(killsByType).length + ' type(s) but ledger ' + endPts2 + '/' + bar2 + ' (points by type ' + JSON.stringify(pointsByType) + ', kills by type ' + JSON.stringify(killsByType) + ')'; }
  else if (!hasSpawn && !hasFight) { label = 'NEVER-SPAWNED'; reason = 'no wave-2 spawn, no wave-2 fight, no wave-2 kill'; }
  else if (hasSpawn && !hasFight) { label = 'SPAWNED-UNFOUGHT'; reason = spawns.length + ' wave-2 spawn(s), 0 wave-2 fights started'; }
  else if (outcomeCounts.tbLost > 0 || outcomeCounts.fieldVDie > 0) { label = 'FOUGHT-LOST'; reason = 'wave-2 fight(s) ended lost/vDie (tbLost=' + outcomeCounts.tbLost + ', fieldVDie=' + outcomeCounts.fieldVDie + ')'; }
  else if (outcomeCounts.tbFled > 0 || outcomeCounts.tbRouted > 0 || outcomeCounts.fieldVFlee > 0) { label = 'FOUGHT-FLED'; reason = 'wave-2 fight(s) ended fled/routed/vFlee (tbFled=' + outcomeCounts.tbFled + ', tbRouted=' + outcomeCounts.tbRouted + ', fieldVFlee=' + outcomeCounts.fieldVFlee + ')'; }
  else if (outcomeCounts.tbWonNoKill > 0 || outcomeCounts.fieldMFlee > 0 || outcomeCounts.fieldEvade > 0) { label = 'FOUGHT-DROVE-OFF'; reason = 'wave-2 fight(s) ended with the monster leaving (tbWonNoKill=' + outcomeCounts.tbWonNoKill + ', fieldMFlee=' + outcomeCounts.fieldMFlee + ', fieldEvade=' + outcomeCounts.fieldEvade + ')'; }
  else if (hasFight && nFights === 0) { label = 'UNCLASSIFIED'; reason = 'deed feed shows ' + facedW2.length + ' wave-2 fought type(s) but no fight row or spawn row explains the outcome'; }
  else if (hasUnknownOutcome) { label = 'UNCLASSIFIED'; reason = 'wave-2 fight row(s) carry no usable outcome'; }
  else if (hasFight) { label = 'UNCLASSIFIED'; reason = 'wave-2 fights exist but none matches a labeled outcome'; }
  else { label = 'UNCLASSIFIED'; reason = 'no rule matched'; }
  return {
    label, reason,
    counts: {
      spawnsW2: spawns.length, fieldFightsW2: ff.length, tbFightsW2: tb.length,
      facedTypesW2: facedW2.length, killsW2: kills.length,
      tbPlayerOnly, tbWithVillager, tbScholarAbsent, fieldWithAlly,
    },
    outcomeCounts, killsByType, pointsByType, typesAtCap, perTypeCap,
    spawnedTypes, unfoughtSpawnTypes, foughtTypes,
    firstSpawnDay, firstFightDay, firstKillDay, firstGateDay, firstPtsDay,
    traj, endPts2, bar2, gateOpen,
  };
}

module.exports = { layerOn, newStore, installWave2EncDiag, withWave2EncDiag, recordDaily, copyWavesFaced, ledgerGateW3, classifyWave2, MAX_EVENTS };
