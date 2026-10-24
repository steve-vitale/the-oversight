// standing99-diag — the standing-trajectory recorder (sim-standing99-diag-a,
// 2026-10-24, flesh-out loop, axis scale-onramp, ARM 1: decompose the
// standing-99 pin and the wave-5 unlock block).
//
// THE QUESTION: the prior run (sim-fullseat-diag-a, seeds 73641-73648,
// tableseat-nowait substrate) found FOUR seeds pinned at standing exactly 99
// (one point below t4=100), standing max 172, wave-5 fights 0/8, and reported
// hold kind `below-bar` everywhere. But its own corpus shows gated < raw on
// pinned seeds (73641: raw 102, gated 99; 73648: raw 182, gated 99) — and
// src/js/standing.js villageStandingTotal() itself clamps the gated total to
// t4-1 = 99 while the wave-4 readiness bar is unmet (defer4 hold). So "99"
// may be a HOLD, not a sum that stopped. The prior recorder cannot test that:
// it stores no trajectory, records no wave-4 readiness bars, and its hold
// inference omits defer4 entirely (hence `below-bar`). This recorder is the
// instrument that can: a DAILY trajectory of war/diplomacy/plenty, raw,
// capped, computed-gated, peak, and the rd4/rd5 readiness bars.
//
// PURE-READ DISCIPLINE (stricter than fullseat-diag): this recorder NEVER
// calls villageStandingTotal() during a run — that function releases peaks
// (writes state._standingPeakWave) and emits hold beats, i.e. it has side
// effects. Instead the gated total is COMPUTED from pure reads with the
// standing.js formula (see gatedComputed below), and validated against the
// engine's gated total only AFTER runDays (trajectory-safe). It writes
// nothing to game state, draws no RNG, and every read failure is counted
// (no silent empty catches) rather than hidden.
//
// COMPOSE UPON (never edit): tableseat-nowait (which wraps leanlinkrescue).
// STANDING99=1 is the only on-switch. Unset delegates byte-identically.
//
// POLICY-SIDE ONLY — zero src/js changes.
'use strict';

function layerOn() { return process.env.STANDING99 === '1'; }

function n0(x) { const n = x | 0; return n > 0 ? n : 0; }
function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

// gatedComputed: the villageStandingTotal() formula, recomputed from pure
// reads — no engine call, no side effects. Inputs: raw breakdown {war,
// diplomacy, plenty}, readiness {rd4ready, rd5ready}, peak, cfg {t4, t5,
// plentyCapT5}. Returns {gated, capped, holds: {cap, defer4, defer5},
// holdKind}. holdKind names the BINDING hold (tightest bound below raw),
// or 'floor' when only the peak ratchet lifts the total, else 'none'.
function gatedComputed(vs, rd4ready, rd5ready, peak, cfg) {
  const t4 = (cfg.t4 | 0) || 100, t5 = (cfg.t5 | 0) || 200;
  const cap = (cfg.plentyCapT5 | 0) || 100;
  const war = n0(vs.war), diplomacy = n0(vs.diplomacy), plenty = n0(vs.plenty);
  const raw = war + diplomacy + plenty;
  const capped = war + diplomacy + Math.min(plenty, cap);
  const holds = {
    cap: raw >= t5 && capped < t5 && peak < 5,
    defer4: raw >= t4 && !rd4ready && peak < 4,
    defer5: capped >= t5 && !rd5ready && peak < 5,
  };
  let gated = raw;
  if (holds.cap && 199 < gated) gated = 199;
  if (holds.defer4 && 99 < gated) gated = 99;
  if (holds.defer5 && 199 < gated) gated = 199;
  const floor = peak >= 5 ? t5 : peak >= 4 ? t4 : 0;
  if (floor > gated) gated = floor;
  let holdKind = 'none';
  if (gated < raw) {
    const binding = [];
    if (holds.defer4 && gated === 99) binding.push('defer4');
    if ((holds.cap || holds.defer5) && gated === 199) binding.push(holds.cap ? 'cap' : 'defer5');
    holdKind = binding.length ? binding.join('+') : 'held';
  } else if (floor > 0 && gated === floor && raw < floor) {
    holdKind = 'floor';
  }
  return { gated, raw, capped, war, diplomacy, plenty, holds, holdKind, floor };
}

// snapStanding(Game): one pure-read trajectory point. Never calls
// villageStandingTotal(). Read errors are counted on the returned point
// (errs) so a blind recorder can never pass as a seeing one.
function snapStanding(Game) {
  const p = { day: dayOf(Game), errs: 0 };
  try {
    const vs = (typeof Game.villageStanding === 'function') ? Game.villageStanding() : null;
    if (!vs) { p.errs++; p.error = 'no-villageStanding'; return p; }
    p.war = n0(vs.war); p.diplomacy = n0(vs.diplomacy); p.plenty = n0(vs.plenty);
    p.warPts = n0(vs.warPts); p.links = n0(vs.links); p.feasts = n0(vs.feasts);
  } catch (e) { p.errs++; p.error = 'villageStanding: ' + String((e && e.message) || e).slice(0, 100); return p; }
  try {
    const cfg = (typeof Game.standingCfg === 'function') ? Game.standingCfg() : {};
    p.t4 = (cfg.t4 | 0) || 100; p.t5 = (cfg.t5 | 0) || 200; p.plentyCap = (cfg.plentyCapT5 | 0) || 100;
    p.peak = (Game.state && (Game.state._standingPeakWave | 0)) || 0;
    const rd4 = (typeof Game.waveUnlockReady === 'function') ? Game.waveUnlockReady(4) : null;
    const rd5 = (typeof Game.waveUnlockReady === 'function') ? Game.waveUnlockReady(5) : null;
    const bar = (rd) => (rd ? { ready: !!rd.ready, armored: n0(rd.armored), armed: n0(rd.armed), tricks: n0(rd.tricks), veterans: n0(rd.veterans), demand: rd.demand || null, short: (rd.short || []).slice() } : null);
    p.rd4 = bar(rd4); p.rd5 = bar(rd5);
    const g = gatedComputed(p, !!(rd4 && rd4.ready), !!(rd5 && rd5.ready), p.peak, cfg);
    p.raw = g.raw; p.capped = g.capped; p.gated = g.gated; p.holdKind = g.holdKind;
    p.defer4 = !!g.holds.defer4; p.defer5 = !!g.holds.defer5; p.capHold = !!g.holds.cap;
    p.floor = g.floor;
  } catch (e) { p.errs++; p.error = 'cfg/ready: ' + String((e && e.message) || e).slice(0, 100); }
  try { p.unlockedWave = (typeof Game.unlockedWave === 'function') ? (Game.unlockedWave() | 0) : null; } catch (e) { p.errs++; p.unlockedWave = null; }
  return p;
}

function ensureSD(ctx) {
  let D = ctx._standing99diag;
  if (!D) {
    D = ctx._standing99diag = { days: 0, errs: 0, traj: [] };
  }
  return D;
}

function recordDaily(Game, ctx) {
  const D = ensureSD(ctx);
  const p = snapStanding(Game);
  D.days++;
  D.errs += p.errs;
  D.traj.push(p);
  return D;
}

function withStanding99Diag(inner, id, desc) {
  return Object.assign({}, inner, {
    id, desc,
    daily(Game, ctx) {
      // PURE-READ discipline: record AFTER the inner daily runs, and the
      // record path performs no writes to game state and draws no RNG.
      const r = inner.daily(Game, ctx);
      if (layerOn()) recordDaily(Game, ctx);
      return r;
    },
  });
}

// analyzeTrajectory(traj): the pin decomposition for one run. Returns null
// on an empty trajectory. Definitions (fixed before sweeping):
// - pin day: first day with gated === 99 AND defer4 active (the hold, not
//   a coincidence: a day at gated 99 with raw < 100 is just a sum, not a pin).
// - daysPinned: count of days with gated === 99 and defer4 active.
// - stall: per component, lastIncreaseDay (last day its value rose vs the
//   previous trajectory point) and delta from first-pin day to end.
// - maxRaw / maxGated points: the trajectory points attaining them.
// - t5 approach: max capped, and whether capped ever reached 200.
function analyzeTrajectory(traj) {
  if (!traj || !traj.length) return null;
  const first = traj[0], last = traj[traj.length - 1];
  let firstPin = null, daysPinned = 0;
  let maxRaw = first, maxGated = first, maxCapped = first;
  const lastInc = { war: first.day, diplomacy: first.day, plenty: first.day };
  for (let i = 0; i < traj.length; i++) {
    const p = traj[i];
    if (p.gated === 99 && p.defer4) {
      if (!firstPin) firstPin = p;
      daysPinned++;
    }
    if ((p.raw | 0) > (maxRaw.raw | 0)) maxRaw = p;
    if ((p.gated | 0) > (maxGated.gated | 0)) maxGated = p;
    if ((p.capped | 0) > (maxCapped.capped | 0)) maxCapped = p;
    if (i > 0) {
      const prev = traj[i - 1];
      for (const k of ['war', 'diplomacy', 'plenty']) if ((p[k] | 0) > (prev[k] | 0)) lastInc[k] = p.day;
    }
  }
  // Best-readiness points: fewest short bars (tie: latest day) — the closest
  // the village ever came to clearing each readiness bar.
  let bestRd4 = null, bestRd5 = null;
  for (const p of traj) {
    if (p.rd4) {
      const score = (p.rd4.short || []).length;
      if (!bestRd4 || score < (bestRd4.rd4.short || []).length) bestRd4 = p;
    }
    if (p.rd5) {
      const score = (p.rd5.short || []).length;
      if (!bestRd5 || score < (bestRd5.rd5.short || []).length) bestRd5 = p;
    }
  }
  const atPin = firstPin || null;
  const stalled = [];
  for (const k of ['war', 'diplomacy', 'plenty']) {
    stalled.push({
      component: k,
      atPin: atPin ? (atPin[k] | 0) : null,
      atEnd: last[k] | 0,
      deltaPinToEnd: atPin ? ((last[k] | 0) - (atPin[k] | 0)) : null,
      lastIncreaseDay: lastInc[k],
      stalledSince: lastInc[k],
    });
  }
  // Which component stopped growing: the one whose last increase is
  // earliest AND whose pin-to-end delta is 0 (a component still growing
  // at end is not the stall, however small its delta).
  const dead = stalled.filter(s => s.deltaPinToEnd === 0 && firstPin);
  dead.sort((a, b) => a.lastIncreaseDay - b.lastIncreaseDay);
  return {
    nPoints: traj.length,
    firstDay: first.day, lastDay: last.day,
    firstPinDay: firstPin ? firstPin.day : null,
    daysPinned,
    pinned: !!firstPin,
    atPin: atPin ? { day: atPin.day, war: atPin.war, diplomacy: atPin.diplomacy, plenty: atPin.plenty, raw: atPin.raw, capped: atPin.capped, gated: atPin.gated, rd4: atPin.rd4, rd5: atPin.rd5, unlockedWave: atPin.unlockedWave } : null,
    atEnd: { day: last.day, war: last.war, diplomacy: last.diplomacy, plenty: last.plenty, raw: last.raw, capped: last.capped, gated: last.gated, holdKind: last.holdKind, rd4: last.rd4, rd5: last.rd5, unlockedWave: last.unlockedWave, peak: last.peak },
    maxRaw: { day: maxRaw.day, raw: maxRaw.raw, gated: maxRaw.gated, war: maxRaw.war, diplomacy: maxRaw.diplomacy, plenty: maxRaw.plenty, rd4: maxRaw.rd4, rd5: maxRaw.rd5 },
    maxGated: { day: maxGated.day, gated: maxGated.gated, raw: maxGated.raw },
    maxCapped: { day: maxCapped.day, capped: maxCapped.capped, raw: maxCapped.raw, gated: maxCapped.gated, rd4: maxCapped.rd4, rd5: maxCapped.rd5 },
    bestRd4: bestRd4 ? { day: bestRd4.day, rd4: bestRd4.rd4, gated: bestRd4.gated, raw: bestRd4.raw } : null,
    bestRd5: bestRd5 ? { day: bestRd5.day, rd5: bestRd5.rd5, gated: bestRd5.gated, raw: bestRd5.raw } : null,
    t5Approach: { maxCapped: maxCapped.capped, distToT5: Math.max(0, 200 - (maxCapped.capped | 0)), everCapped200: (maxCapped.capped | 0) >= 200 },
    components: stalled,
    stalledFirst: dead.length ? dead[0].component : null,
    stalledAll: dead.map(d => d.component),
    errs: traj.reduce((t, p) => t + (p.errs | 0), 0),
  };
}

module.exports = { layerOn, withStanding99Diag, snapStanding, gatedComputed, recordDaily, ensureSD, analyzeTrajectory };
