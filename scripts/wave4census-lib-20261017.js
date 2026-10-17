'use strict';
// wave4census-lib-20261017.js — READ-ONLY wave-4 readiness census instrument
// (flesh-out loop, sim-wave4census, 2026-10-17, scale-onramp axis).
//
// READ-ONLY CONTRACT: zero src/js changes, zero scripts/policies changes.
// The instrument calls two engine readers once per day and writes nothing:
//   - Game.villageStanding()        — pure read (the honest breakdown)
//   - Game.waveUnlockReady(4)       — the engine's OWN four-bar readiness
//     reader (design call #4, 2026-10-16: armored/armed/tricks/veterans)
// plus a pure state read of state._standingPeakWave (the monotonic ratchet
// the gate itself writes; reading it perturbs nothing).
// No RNG draws, no policy verbs, no state writes. The det-gate in
// scripts/test-wave4census-20261017.js proves byte-identical trajectories
// with the instrument attached vs bare.
//
// ATTRIBUTION RULE (pre-registered, binding per MEASUREMENT.md §14):
// A "deferral day" mirrors the defer4 hold in villageStandingTotal()
// (src/js/standing.js): raw Standing >= t4 AND !ready AND peak < 4 — the
// Standing door is open and readiness alone holds it shut.
//   - deferral days exist and the engine's `short` set (failing bars) has a
//     non-empty intersection over all deferral days -> that bar (or
//     multi:a+b) binds.
//   - deferral days exist but the intersection is empty -> 'none-single'
//     (the binding bar rotates; documented, never re-scored).
//   - zero deferral days and wave 4 never released -> 'standing' (the
//     scale/on-ramp bar bound; readiness was never the constraint).
//   - wave 4 released during the run (peak >= 4) -> 'unlocked'.

const BARS = ['armor', 'weapons', 'tricks', 'veterans'];
// Snapshot keys (from the engine's waveUnlockReady) -> bar names.
const KEYMAP = { armor: 'armored', weapons: 'armed', tricks: 'tricks', veterans: 'veterans' };

// sampleReadiness(Game) -> snapshot. Never throws; counts its own errors so
// a broken read voids the run LOUD instead of silently dropping days.
function sampleReadiness(Game) {
  const snap = { err: 0 };
  try {
    const s = (Game.state && Game.state.scholar) || {};
    snap.day = s.day | 0;
  } catch (e) { snap.day = -1; snap.err++; }
  try {
    snap.raw = ((Game.villageStanding ? Game.villageStanding() : {}).total | 0) || 0;
  } catch (e) { snap.raw = 0; snap.err++; }
  try {
    snap.peak = (Game.state && Game.state._standingPeakWave) | 0 || 0;
  } catch (e) { snap.peak = 0; snap.err++; }
  try {
    const r = Game.waveUnlockReady ? Game.waveUnlockReady(4) : null;
    if (!r) throw new Error('no waveUnlockReady');
    snap.armored = r.armored | 0;
    snap.armed = r.armed | 0;
    snap.tricks = r.tricks | 0;
    snap.veterans = r.veterans | 0;
    snap.ready = !!r.ready;
    snap.short = Array.isArray(r.short) ? r.short.slice() : [];
    const dem = r.demand || {};
    snap.demand = {
      armored: dem.armored | 0, armorP: dem.armorP | 0,
      armed: dem.armed | 0, tricks: dem.tricks | 0, veterans: dem.veterans | 0,
    };
  } catch (e) {
    snap.armored = 0; snap.armed = 0; snap.tricks = 0; snap.veterans = 0;
    snap.ready = false; snap.short = ['read-error']; snap.demand = null; snap.err++;
  }
  return snap;
}

// attributeRun(snaps, opts) -> {binding, deferDays, daysShort, maxVal, demand,
// t4, evidence, maxRaw}. Pure: fixtures test every taxonomy branch.
// opts: {t4} (default 100). Throws on empty/void input (fail loud).
function attributeRun(snaps, opts) {
  opts = opts || {};
  const t4 = opts.t4 | 0 || 100;
  if (!Array.isArray(snaps) || snaps.length === 0) throw new Error('attributeRun: empty trajectory');
  const bad = snaps.filter(s => (s.err | 0) > 0);
  if (bad.length) throw new Error(`attributeRun: ${bad.length} errored snapshots (voided)`);
  const last = snaps[snaps.length - 1];
  const demand = (last.demand && last.demand.armored) ? last.demand : null;
  const daysShort = { armor: 0, weapons: 0, tricks: 0, veterans: 0, 'read-error': 0 };
  const maxVal = { armor: 0, weapons: 0, tricks: 0, veterans: 0 };
  // demandByBar: the engine's demand object uses snapshot keys
  // (armored/armed); re-key to bar names for the distance analysis.
  const demandByBar = {};
  if (demand) for (const b of BARS) demandByBar[b] = demand[KEYMAP[b]] | 0;
  let maxRaw = 0, deferDays = 0, firstDeferDay = null, lastDeferDay = null;
  let inter = null; // intersection of short-sets over deferral days
  const seenShortSets = [];
  for (const s of snaps) {
    if ((s.raw | 0) > maxRaw) maxRaw = s.raw | 0;
    for (const b of BARS) {
      const v = s[KEYMAP[b]] | 0;
      if (v > maxVal[b]) maxVal[b] = v;
    }
    const deferred = (s.raw | 0) >= t4 && !s.ready && (s.peak | 0) < 4;
    if (!deferred) continue;
    deferDays++;
    if (firstDeferDay === null) firstDeferDay = s.day;
    lastDeferDay = s.day;
    const sh = (s.short || []).filter(b => BARS.indexOf(b) >= 0);
    seenShortSets.push(sh.slice().sort().join('+') || '(empty)');
    for (const b of sh) daysShort[b]++;
    if (inter === null) inter = new Set(sh);
    else inter = new Set(sh.filter(b => inter.has(b)));
  }
  // Wave 4 released during the run: readiness was satisfied, not binding.
  if ((last.peak | 0) >= 4) {
    return { binding: 'unlocked', deferDays, daysShort, maxVal, demand, demandByBar, t4, maxRaw,
      evidence: { releasePeak: last.peak | 0 } };
  }
  // Zero deferral days: the Standing door never opened — the scale/on-ramp
  // bar bound, not readiness.
  if (deferDays === 0) {
    return { binding: 'standing', deferDays: 0, daysShort, maxVal, demand, demandByBar, t4, maxRaw,
      evidence: { maxRaw, t4, note: `raw Standing peaked at ${maxRaw} < t4=${t4}; readiness never evaluated` } };
  }
  const bars = inter ? Array.from(inter).sort() : [];
  const rotation = Array.from(new Set(seenShortSets));
  if (bars.length === 1) {
    return { binding: bars[0], deferDays, daysShort, maxVal, demand, demandByBar, t4, maxRaw,
      evidence: { firstDeferDay, lastDeferDay, daysShortOnBar: daysShort[bars[0]] } };
  }
  if (bars.length > 1) {
    return { binding: 'multi:' + bars.join('+'), deferDays, daysShort, maxVal, demand, demandByBar, t4, maxRaw,
      evidence: { firstDeferDay, lastDeferDay, coBars: bars } };
  }
  return { binding: 'none-single', deferDays, daysShort, maxVal, demand, demandByBar, t4, maxRaw,
    evidence: { firstDeferDay, lastDeferDay, rotation } };
}

module.exports = { BARS, sampleReadiness, attributeRun };
