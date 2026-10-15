#!/usr/bin/env node
// scripts/tworung-lib-20261015.js — TWO-RUNG BIND RE-MEASUREMENT + NATIONAL
// HOLD-DURATION telemetry (sim-tworung2, 2026-10-15, scale-onramp axis).
//
// INSTRUMENT-ONLY: every function in this file READS game state and returns
// plain data. Nothing here writes state, calls verbs, consumes RNG, or calls
// Date.now(). Trajectory-neutrality of the sweep's sampling wrap is PROVEN
// in scripts/test-tworung-20261015.js (instrument ON/OFF byte-identical 60d,
// seed 33 leadfeast — the sampler's reads are trajectory-neutral).
//
// WHAT THIS MEASURES (on the current tip, post-readiness-gate-v3):
//   The wave-4 gate is now the Standing bar (src/js/standing.js): raw =
//   war (25 x wave-3+ ledger kill pts) + diplomacy (34 x seasoned regional+
//   links) + plenty (20 x major feasts); the gated total holds at t4-1
//   until readyFacedW3 (3) distinct wave-3 types are faced blow-by-blow,
//   at t5-1 until readyFacedW4 (2) distinct wave-4 types, plenty counts at
//   most 100 toward t5=200, and the monotonic peak ratchet never re-locks.
//   The r17 two-rung bind (4 wave-3 kill pts AND regional+, 0/16 met both)
//   is re-measured as rung bins on THIS gate:
//     - 'blood/faced-rung': the bonds/plenty side carries half a pure path
//       or more, but the blood side (war) is under half AND the faced-3
//       deferral bar is unmet — the old kill-side still binds.
//     - 'scale-rung': the blood side carries half a pure path or more, but
//       the bonds side is under half — the old scale-side still binds.
//     - 'both': neither the blood nor the bonds side reaches half a pure
//       path — neither old rung is cleared (includes plenty-only runs).
//     - 'neither': both old-rung sides reach half a pure path, or the raw
//       bar already clears 100 — the binding constraint is somewhere the
//       old two-rung shape cannot see (the faced deferral, the plenty cap,
//       or an unexplained hold — sub-attributed).
//   Plus wave-5 non-unlock attribution (cap-hold / defer5-hold /
//   raw-shortfall / unexplained) and national hold-duration + hold-loss
//   attribution (link-break / village-death / tribute-collapse /
//   succession-exile / unattributed).
'use strict';

function num(x, dflt) {
  const n = Number(x);
  return Number.isFinite(n) ? n : (dflt == null ? 0 : dflt);
}

// standingSample(Game): the gate state, read through the engine's own
// functions. villageStandingTotal() is the only engine reader the unlock
// gate uses (unlockedWave); the sampler's daily call is proven trajectory-
// neutral in the proof test (the hold/release beats throttle by day and
// fire identically on the engine's own daily reads).
function standingSample(Game) {
  const out = {
    day: 0, raw: 0, gated: 0, capped: 0, war: 0, diplomacy: 0, plenty: 0,
    warPts: 0, links: 0, feasts: 0, peak: 0, t4: 100, t5: 200,
    faced3: 0, faced3Need: 3, faced4: 0, faced4Need: 2,
    defer4: false, defer5: false, capBinds: false, unlockedWave: 1,
    rank: 'village', tableSeat: 'none',
  };
  try { out.day = num((Game.state.scholar || {}).day, 0); } catch (e) {}
  try { const cfg = (Game.standingCfg || (() => null)).call(Game) || {}; out.t4 = num(cfg.t4, 100); out.t5 = num(cfg.t5, 200); } catch (e) {}
  try {
    const s = (Game.villageStanding || (() => null)).call(Game) || {};
    out.war = num(s.war, 0); out.diplomacy = num(s.diplomacy, 0); out.plenty = num(s.plenty, 0);
    out.warPts = num(s.warPts, 0); out.links = num(s.links, 0); out.feasts = num(s.feasts, 0);
    out.raw = num(s.total, out.war + out.diplomacy + out.plenty);
  } catch (e) {}
  try { out.gated = num((Game.villageStandingTotal || (() => out.raw)).call(Game), 0); } catch (e) { out.gated = out.raw; }
  try { out.capped = num((Game.standingPlentyCappedTotal || (() => out.raw)).call(Game), 0); } catch (e) { out.capped = out.raw; }
  try { out.peak = num((Game._standingPeakWave || (() => 0)).call(Game), 0); } catch (e) {}
  try {
    const r4 = (Game.waveUnlockReady || (() => ({ ready: true, faced: 99, need: 3 }))).call(Game, 4) || {};
    const r5 = (Game.waveUnlockReady || (() => ({ ready: true, faced: 99, need: 2 }))).call(Game, 5) || {};
    out.faced3 = num(r4.faced, 0); out.faced3Need = num(r4.need, 3);
    out.faced4 = num(r5.faced, 0); out.faced4Need = num(r5.need, 2);
  } catch (e) {}
  try {
    const d4 = (Game.standingDeferral || (() => ({ deferred: false }))).call(Game, 4) || {};
    const d5 = (Game.standingDeferral || (() => ({ deferred: false }))).call(Game, 5) || {};
    out.defer4 = !!d4.deferred; out.defer5 = !!d5.deferred;
    out.capBinds = (out.raw >= out.t5 && out.capped < out.t5 && out.peak < 5);
  } catch (e) {}
  try { out.unlockedWave = num((Game.unlockedWave || (() => 1)).call(Game), 1); } catch (e) {}
  try { out.rank = (Game.scaleRank || (() => 'village')).call(Game) || 'village'; } catch (e) {}
  try {
    const s = (Game.tableSeat || (() => null)).call(Game);
    out.tableSeat = (s && s.seat) || 'none';
  } catch (e) {}
  return out;
}

// trackStanding(track, sample): best-ever tracking for rung-bin inputs.
// Keeps the max of every Standing component plus the max unlocked wave —
// Standing can decay (link breaks) but the gate's monotonic ratchet is
// sticky, and the bind question is "did the run ever clear the rungs?".
function newStandingTrack() {
  return {
    n: 0, bestRaw: 0, bestGated: 0, bestWar: 0, bestDip: 0, bestPlenty: 0,
    bestWarPts: 0, bestLinks: 0, bestFeasts: 0, bestFaced3: 0, bestFaced4: 0,
    bestRawDay: null, peak: 0, maxWave: 1, samples: [],
  };
}
function trackStanding(track, sample) {
  track.n++;
  if (sample.raw > track.bestRaw) { track.bestRaw = sample.raw; track.bestRawDay = sample.day; }
  ['gated', 'war', 'dip', 'plenty', 'warPts', 'links', 'feasts', 'faced3', 'faced4'].forEach((k) => {
    const bk = { gated: 'bestGated', war: 'bestWar', dip: 'bestDip', plenty: 'bestPlenty', warPts: 'bestWarPts', links: 'bestLinks', feasts: 'bestFeasts', faced3: 'bestFaced3', faced4: 'bestFaced4' }[k];
    const sk = { gated: 'gated', war: 'war', dip: 'diplomacy', plenty: 'plenty', warPts: 'warPts', links: 'links', feasts: 'feasts', faced3: 'faced3', faced4: 'faced4' }[k];
    if (num(sample[sk], 0) > track[bk]) track[bk] = num(sample[sk], 0);
  });
  if (sample.peak > track.peak) track.peak = sample.peak;
  if (sample.unlockedWave > track.maxWave) track.maxWave = sample.unlockedWave;
  if (sample.day % 5 === 0) track.samples.push(sample);
  return track;
}

// rungBin4(track): the bind shape of a wave-4 NON-UNLOCK on the current tip.
// Inputs are best-ever progress (the generous read — a run that cleared a
// rung at any point and lost it counts as having cleared it).
// Old-rung successors: blood side = war/100 >= 0.5 (half a pure-war path);
// scale side = diplomacy/100 >= 0.5 (half a pure-diplomacy path).
function rungBin4(track) {
  const ws = track.bestWar / 100, ds = track.bestDip / 100, ps = track.bestPlenty / 100;
  const bloodUp = ws >= 0.5;
  const scaleUp = ds >= 0.5;
  const rawClears = track.bestRaw >= 100;
  if (track.maxWave >= 4 || track.peak >= 4) return { bin: 'unlocked', sub: 'wave-4 released (peak ratchet or gated>=100)' };
  if (rawClears) {
    if (track.bestFaced3 < 3) return { bin: 'neither', sub: `deferral-hold: raw ${track.bestRaw} >= 100 but faced-3 ${track.bestFaced3}/3 — neither old rung binds, the faced deferral does` };
    return { bin: 'neither', sub: `unexplained: raw ${track.bestRaw} >= 100 and faced-3 ${track.bestFaced3}/3 yet wave 4 never released — gate anomaly` };
  }
  if (!bloodUp && !scaleUp) {
    const carrier = ps >= 0.5 ? 'plenty-only (bread carries alone, neither old rung near)' : 'nothing carries';
    return { bin: 'both', sub: `neither old-rung side reaches half a pure path — war ${track.bestWar}/100, bonds ${track.bestDip}/100 (${carrier})` };
  }
  if (scaleUp && !bloodUp) {
    return { bin: 'blood/faced-rung', sub: `bonds carry (>=50: ${track.bestDip}, ${track.bestLinks} regional+ links) but blood under half (${track.bestWar}, ${track.bestWarPts} kill pts) and faced-3 ${track.bestFaced3}/3 — the old kill-side still binds` };
  }
  if (bloodUp && !scaleUp) {
    return { bin: 'scale-rung', sub: `blood carries (>=50: ${track.bestWar}, ${track.bestWarPts} kill pts) but bonds under half (${track.bestDip}, ${track.bestLinks} regional+ links) — the old scale-side still binds` };
  }
  // bloodUp && scaleUp, raw < 100: both old-rung sides are up — the bind is
  // a third-path shortfall (raw 100 needs 50+50; half-paths don't sum).
  return { bin: 'neither', sub: `both old-rung sides >= half path (war ${track.bestWar}, bonds ${track.bestDip}) but raw ${track.bestRaw} < 100 — the hybrid gap, neither old rung binds` };
}

// rungBin5(track): wave-5 non-unlock attribution for runs that unlocked wave 4.
function rungBin5(track) {
  if (track.maxWave >= 5 || track.peak >= 5) return { bin: 'unlocked', sub: 'wave 5 released' };
  if (track.maxWave < 4) return { bin: 'n/a', sub: 'wave 4 never unlocked — not a wave-5 candidate' };
  const capped = track.bestWar + track.bestDip + Math.min(track.bestPlenty, 100);
  const raw = track.bestRaw;
  if (capped >= 200 && track.bestFaced4 >= 2) return { bin: 'unexplained', sub: `capped ${capped} >= 200 and faced-4 ${track.bestFaced4}/2 yet wave 5 never released — gate anomaly` };
  if (capped >= 200 && track.bestFaced4 < 2) return { bin: 'defer5-hold', sub: `capped ${capped} >= 200 but faced-4 ${track.bestFaced4}/2 — the wave-4-faced deferral holds` };
  if (raw >= 200 && capped < 200) return { bin: 'cap-hold', sub: `raw ${raw} >= 200 but plenty capped (plenty ${track.bestPlenty}, cap 100) -> capped ${capped} < 200 — bread cannot buy the fifth draft alone` };
  return { bin: 'raw-shortfall', sub: `raw ${raw} < 200 (war ${track.bestWar} + bonds ${track.bestDip} + plenty ${track.bestPlenty}) — the T5 bar not reached` };
}

const NATL = { national: true, global: true };

// nationalHold(dailyRows, extra): hold-duration + hold-loss attribution for
// the national scale. dailyRows: [{day, rank}...] from the scale instrument.
// extra: {breaks:[{day, link}], endReason, finalDay, exiledEver, tributeArrears}.
function nationalHold(dailyRows, extra) {
  extra = extra || {};
  const natRows = (dailyRows || []).filter(r => NATL[r.rank]);
  if (!natRows.length) return { reached: false };
  const firstDay = Math.min.apply(null, natRows.map(r => r.day));
  const lastNatDay = Math.max.apply(null, natRows.map(r => r.day));
  const holdDays = natRows.length;
  const lastRow = (dailyRows || [])[(dailyRows || []).length - 1] || {};
  const er = extra.endReason || '?';
  const fDay = num(extra.finalDay, -1);
  const diedAtEnd = (er === 'village-dead' || er === 'village-lost');
  // The village can die AT national: the last daily row is national, but the
  // run ended in village death. That is a hold LOSS (village-death), not a
  // hold to the horizon. Only endReason 'survived' with the rank still
  // national is a genuine held-to-end.
  const heldToEnd = !!NATL[lastRow.rank] && !diedAtEnd;
  const out = {
    reached: true, firstDay, lastNatDay, holdDays,
    endState: heldToEnd ? 'held-to-end' : 'lost',
    lossDay: heldToEnd ? null : (NATL[lastRow.rank] ? fDay : lastNatDay + 1),
    lossMode: heldToEnd ? 'held-to-end' : 'unattributed',
    lossEvidence: [],
  };
  if (heldToEnd) return out;
  const ld = out.lossDay;
  const near = (d) => Math.abs(num(d, 0) - ld) <= 3;
  // 1. the village died at national (rank never fell — the run ended under it)
  if (diedAtEnd && NATL[lastRow.rank]) {
    out.lossMode = 'village-death';
    out.lossEvidence = [`endReason=${er} finalDay=${fDay} — the village died holding national (rank never fell)`];
    return out;
  }
  // 2. link break near the loss day
  const brk = (extra.breaks || []).filter(b => near(b.day));
  if (brk.length) {
    out.lossMode = 'link-break';
    out.lossEvidence = brk.map(b => `breakLink d${b.day} link=${b.link}`);
    return out;
  }
  // 3. the village died as the rank fell (rank can't outlive the village)
  if (diedAtEnd && Math.abs(fDay - ld) <= 5) {
    out.lossMode = 'village-death';
    out.lossEvidence = [`endReason=${er} finalDay=${fDay} (rank fell as the village died)`];
    return out;
  }
  // 3. succession exile — the scholar lost the village by law
  if (extra.exiledEver) {
    out.lossMode = 'succession-exile';
    out.lossEvidence = [`scholar.exiled fired (day ${extra.exiledDay != null ? extra.exiledDay : '?'})`];
    return out;
  }
  // 4. tribute collapse — arrears spiking on the home links before the loss
  if (extra.arrearsSpike) {
    out.lossMode = 'tribute-collapse';
    out.lossEvidence = [extra.arrearsSpike];
    return out;
  }
  // 5. succession collapse — a person/scholar death within +-3d of the loss
  //    day and nothing else fired. The engine's succession beat dissolves
  //    the polity ("the dead hold no treaties" -> "the realm came apart") —
  //    the rank loss is the realm's, not a link's. Checked last: break /
  //    exile / arrears are more specific causes.
  const dd = (extra.deathDays || []).filter(d => {
    if (Math.abs(num(d.day, 0) - ld) > 3) return false;
    return /player|scholar|villager|person/i.test(d.kind || '');
  });
  if (dd.length) {
    out.lossMode = 'succession-collapse';
    out.lossEvidence = dd.map(d => `d${d.day} ${d.name || '?'} died (${(d.cause || '?').slice(0, 50)}) — polity dissolved on succession`);
    return out;
  }
  return out;
}

module.exports = {
  standingSample, newStandingTrack, trackStanding,
  rungBin4, rungBin5, nationalHold,
};
