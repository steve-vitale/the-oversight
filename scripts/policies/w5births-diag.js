// w5births-diag — wave-5 birth-gate recorder for sim-w5births-a
// (2026-10-25, flesh-out loop, axis scale-onramp).
//
// QUESTION (not a claim): on the shared tableseat-nowait band, wave-5
// births are ZERO across all sources (sim-spawnsrc-a: 0 births, 0 pool
// entities in 1,494). WHY is wave 5 never even born? Candidates: (a)
// standing never reaches 200, (b) wave-4 never faced, (c) the veterans
// lock (readiness), (d) spawn targeting (spawnWaveTarget never selects
// wave 5 even when eligible). This recorder classifies, it does not fix.
//
// PURE-READ DISCIPLINE (vetkill discipline, kept): this recorder NEVER
// calls villageStandingTotal() or unlockedWave() during a run.
// villageStandingTotal() releases peaks and emits hold beats (side
// effects); unlockedWave() calls it. Daily points are pure reads only:
// villageStanding(), standingPlentyCappedTotal(), waveUnlockReady(4/5),
// waveLedgerPoints(2/3/4), waveEngaged(4/5), and a direct read of
// state._standingPeakWave. The gated total and the unlocked-wave proxy
// are RECONSTRUCTED in the analyzer (scripts/test-w5births-diag.js)
// from those pure reads: holds = {cap: raw>=t5 && capped<t5 && peak<5
// -> bound 199; defer4: raw>=t4 && !rd4.ready && peak<4 -> bound 99;
// defer5: capped>=t5 && !rd5.ready && peak<5 -> bound 199}; gated =
// min(raw, holds...); peak ratchet simulated forward day by day
// (gated>=t5 -> peak 5, gated>=t4 -> peak 4); effective = max(gated,
// peak>=5 ? t5 : peak>=4 ? t4 : 0). Proxy unlocked: w3 rung (day>=25 &&
// pts2>=4) + gated>=100 -> 4; + gated>=200 + w4faced>0 -> 5. The final
// harness unlockedWave() call (post-run, in the sweep row's waveReach)
// is the authoritative end-state check, not a mid-run call.
//
// SPAWN-TARGET WRAP: spawnWaveTarget is wrapped outer-only: it calls
// the original exactly once, records {day, poolTop, target, poolN},
// and returns the original value untouched. It draws no extra RNG
// (the original draws once, as before). Pool top is the max wave in
// the pool argument — for monsterWavePool() pools that IS the unlocked
// wave; for castMonster's water-filtered pool it can only be <= it.
// A call with poolTop 5 IS an eligible moment for wave-5 targeting,
// regardless of what the daily samples say (intra-day eligibility
// cannot hide from this log: every spawnWaveTarget call is logged).
// Wave-5 births themselves come from the spawnsrc census (spawns with
// wave 5); this recorder also tallies spawnWorldMonster calls by wave
// via its own outer wrap is NOT needed — spawnsrc already records
// every birth with wave. This recorder records targets only, so the
// two wraps never fight over spawnWorldMonster.
//
// OBSERVATIONAL ONLY. W5BIRTHS=1 is the only on-switch. Unset delegates
// byte-identically: no wraps installed, no ctx surface, no record.
// COMPOSE UPON (never edit): tableseat-nowait (via the spawnsrc sweep's
// composition: raftdraft + spawnsrc + w5births, outermost last).
// POLICY-SIDE ONLY — zero src/js changes, no default flips.
'use strict';

const MAX_TARGETS = 50000;

function layerOn() { try { return process.env.W5BIRTHS === '1'; } catch (e) { return false; } }
function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function n0(x) { const n = x | 0; return n > 0 ? n : 0; }

function newStore() {
  return {
    days: [], targets: [], errs: 0, errors: [], overflow: {}, installed: false,
    // Overflow-proof aggregates (the classification needs counts and
    // first-days, not every individual call): keyed "top:target".
    targetCounts: {}, targetCalls: 0, maxTop: 1, firstTop5Day: null, firstTarget5Day: null,
  };
}

function noteErr(store, where, e) {
  try {
    store.errs++;
    if (store.errors.length < 20) store.errors.push(where + ': ' + String((e && e.message) || e).slice(0, 120));
  } catch (e2) { /* error counting must never throw */ }
}

function pushCapped(store, list, item) {
  if (store[list].length >= MAX_TARGETS) { store.overflow[list] = (store.overflow[list] || 0) + 1; return false; }
  store[list].push(item);
  return true;
}

// Pure-read daily point. Every read failure is counted, never hidden;
// a missing function reads as null (the analyzer treats null as
// "not observed", never as 0 — a 0 that is really a read failure would
// fake a blocked gate).
function dailyPoint(Game, store) {
  const p = { day: dayOf(Game), errs: 0 };
  try {
    const s = (typeof Game.villageStanding === 'function') ? Game.villageStanding() : null;
    if (s) { p.raw = n0(s.total); p.war = n0(s.war); p.diplomacy = n0(s.diplomacy); p.plenty = n0(s.plenty); p.warPts = n0(s.warPts); p.links = n0(s.links); p.feasts = n0(s.feasts); }
    else { p.raw = null; p.errs++; }
  } catch (e) { p.raw = null; p.errs++; noteErr(store, 'standing', e); }
  try {
    p.capped = (typeof Game.standingPlentyCappedTotal === 'function') ? n0(Game.standingPlentyCappedTotal()) : null;
    if (p.capped === null) p.errs++;
  } catch (e) { p.capped = null; p.errs++; noteErr(store, 'capped', e); }
  try {
    p.peak = ((Game.state && Game.state._standingPeakWave) | 0) || 0;
  } catch (e) { p.peak = null; p.errs++; }
  for (const w of [4, 5]) {
    try {
      const rd = (typeof Game.waveUnlockReady === 'function') ? Game.waveUnlockReady(w) : null;
      if (rd) p['rd' + w] = { ready: !!rd.ready, armored: n0(rd.armored), armed: n0(rd.armed), tricks: n0(rd.tricks), veterans: n0(rd.veterans), short: (rd.short || []).slice() };
      else { p['rd' + w] = null; p.errs++; }
    } catch (e) { p['rd' + w] = null; p.errs++; noteErr(store, 'rd' + w, e); }
  }
  for (const w of [2, 3, 4]) {
    try {
      p['pts' + w] = (typeof Game.waveLedgerPoints === 'function') ? n0(Game.waveLedgerPoints(w)) : null;
      if (p['pts' + w] === null) p.errs++;
    } catch (e) { p['pts' + w] = null; p.errs++; noteErr(store, 'pts' + w, e); }
  }
  for (const w of [4, 5]) {
    try {
      p['faced' + w] = (typeof Game.waveEngaged === 'function') ? n0(Game.waveEngaged(w)) : null;
      if (p['faced' + w] === null) p.errs++;
    } catch (e) { p['faced' + w] = null; p.errs++; noteErr(store, 'faced' + w, e); }
  }
  try {
    const log = (Game.state && Game.state.waveKillLog) || [];
    let k4 = 0, k5 = 0;
    for (const e of log) { if (!e) continue; if ((e.w | 0) === 4) k4++; if ((e.w | 0) === 5) k5++; }
    p.kills4 = k4; p.kills5 = k5; p.logLen = log.length;
  } catch (e) { p.kills4 = null; p.kills5 = null; p.errs++; noteErr(store, 'killLog', e); }
  store.days.push(p);
  return p;
}

function installW5birthsDiag(Game, store) {
  if (!Game || !store) return function () {};
  if (Game._w5birthsDiagStore === store && Game._w5birthsDiagInstalled) return Game._w5birthsDiagUninstall || function () {};
  const uninstalls = [];
  const wrap = (name, fn) => {
    try {
      if (typeof Game[name] !== 'function') { noteErr(store, name + '.missing', new Error('no ' + name)); return; }
      const orig = Game[name];
      Game[name] = fn(orig);
      uninstalls.push(() => { try { Game[name] = orig; } catch (e) {} });
    } catch (e) { noteErr(store, name + '.wrap', e); }
  };
  // spawnWaveTarget: call original once, record, return untouched.
  wrap('spawnWaveTarget', (orig) => function (pool) {
    let target = null;
    try { target = orig.apply(this, arguments); } catch (e) { throw e; }
    try {
      let top = 1;
      for (const m of (pool || [])) top = Math.max(top, (m && m.wave) || 1);
      const d = dayOf(Game);
      store.targetCalls++;
      const key = top + ':' + target;
      store.targetCounts[key] = (store.targetCounts[key] || 0) + 1;
      if (top > store.maxTop) store.maxTop = top;
      if (top === 5 && store.firstTop5Day === null) store.firstTop5Day = d;
      if (target === 5 && store.firstTarget5Day === null) store.firstTarget5Day = d;
      pushCapped(store, 'targets', { day: d, poolTop: top, target: target, poolN: (pool || []).length });
    } catch (e) { noteErr(store, 'target.rec', e); }
    return target;
  });
  const uninstall = () => {
    for (let i = uninstalls.length - 1; i >= 0; i--) { try { uninstalls[i](); } catch (e) {} }
    try { Game._w5birthsDiagInstalled = false; } catch (e) {}
  };
  try {
    Game._w5birthsDiagStore = store;
    Game._w5birthsDiagInstalled = true;
    Game._w5birthsDiagUninstall = uninstall;
  } catch (e) { noteErr(store, 'install.flag', e); }
  store.installed = true;
  return uninstall;
}

function withW5birthsDiag(inner, id, desc, store) {
  const st = store || newStore();
  return Object.assign({}, inner, {
    id, desc,
    daily(Game, ctx) {
      // Delegate FIRST (the day's work); record after, as the other
      // recorders do — daily points are end-of-day state.
      const r = inner.daily ? inner.daily(Game, ctx) : undefined;
      if (layerOn()) {
        try { installW5birthsDiag(Game, st); } catch (e) { noteErr(st, 'daily.install', e); }
        try { dailyPoint(Game, st); } catch (e) { noteErr(st, 'daily.point', e); }
        try { ctx._w5births = st; } catch (e) { noteErr(st, 'daily.ctx', e); }
      }
      return r;
    },
  });
}

module.exports = { layerOn, newStore, installW5birthsDiag, withW5birthsDiag, dailyPoint, MAX_TARGETS };
