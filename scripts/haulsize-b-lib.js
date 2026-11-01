'use strict';
// haulsize-b-lib.js — PURE decomposition helpers (sim-haulsize-b).
// No game state, no I/O: every function is unit-testable in
// scripts/test-haulsize-b.js. Formulas cite packcomp/shelling:
//   finishedKcal: kcalEach > 0 AND NOT isUnprocessed (haul-block def).
//   shelledNet per in-shell nut lot: units x round(hiddenKcal x 0.75)
//     (shellNuts engine formula; hiddenKcal falls back to kcalEach).
//   unknownValue per lump component: units x dataCal (plants.json
//     caloriesPerUnit); a lump item's own hiddenKcal is NOT double
//     counted — the analyzer passes lump components explicitly.
//   combined = finished + shelledNet + unknownValue.
const KEEP_KCAL = 2000;
const TICKS_PER_DAY = 512;

function shelledNetEach(hiddenKcal, kcalEach) {
  const gross = (hiddenKcal == null ? (kcalEach || 0) : hiddenKcal);
  return Math.round(gross * 0.75);
}

// summarizePack(items, isUnprocessed, lumpValueOf): items are plain
// rows {kcalEach, units, foodKind, foodState, hiddenKcal, lump}
// where lump is null or [{pid, units, dataCal}]. lumpValueOf is
// optional: (lumpComp) => kcal, used only when the caller supplies
// data calories; without it, unknown lump value is reported as null
// (never zero-filled) and excluded from combined.
function summarizePack(items, isUnprocessed, lumpValueOf) {
  let finishedKcal = 0, shelledNet = 0, unknownValue = null, nutUnits = 0, acornUnits = 0;
  const lots = [];
  for (let i = 0; i < (items || []).length; i++) {
    const it = items[i];
    if (!it) continue;
    const unproc = !!isUnprocessed(it);
    const kcal = (it.kcalEach || 0) * (it.units || 0);
    if ((it.kcalEach || 0) > 0 && !unproc) finishedKcal += kcal;
    if (it.foodKind === 'nut' && it.foodState === 'in_shell') {
      const netEach = shelledNetEach(it.hiddenKcal, it.kcalEach);
      shelledNet += netEach * (it.units || 0);
      nutUnits += it.units || 0;
      if ((it.plantId || '').indexOf('acorn') >= 0) acornUnits += it.units || 0;
      lots.push({ index: i, units: it.units || 0, netEach, plantId: it.plantId || null });
    }
    if (Array.isArray(it.lump) && it.lump.length) {
      if (typeof lumpValueOf === 'function') {
        const v = lumpValueOf(it.lump);
        if (typeof v === 'number' && isFinite(v)) {
          if (unknownValue === null) unknownValue = 0;
          unknownValue += v;
        }
      }
    }
  }
  finishedKcal = Math.round(finishedKcal);
  shelledNet = Math.round(shelledNet);
  const combined = finishedKcal + shelledNet + (unknownValue || 0);
  return { finishedKcal, shelledNet, unknownValue, combined, nutUnits, acornUnits, lots };
}

// classifyTripDay(day): day = {
//   forageSuccesses (n), forageFailures: [{say}], packKgAtTripEnd,
//   packCapAtTripEnd, stockedRemainingAtTripEnd,
//   ticksRemainingAtTripEnd, medianTripCost, secondTripAttempted (bool)
// }. Returns exactly one of PACK_FULL | NO_MORE_TARGETS | OUT_OF_TIME
// | POLICY_ONE_TRIP | NO_TRIP | UNCLASSIFIED. Priority order is the
// prereg's order; a day with no successful forage is NO_TRIP only when
// it also had no forage attempt at all, else UNCLASSIFIED (a failed
// trip day has no haul to cap and is not a stopping reason).
function classifyTripDay(day) {
  const d = day || {};
  if (!d.forageSuccesses && !d.forageAttempts) return 'NO_TRIP';
  if (!d.forageSuccesses) return 'UNCLASSIFIED';
  const fails = d.forageFailures || [];
  const packFullFail = fails.some((f) => /pack is full|still full/i.test(String((f && f.say) || '')));
  if (packFullFail) return 'PACK_FULL';
  if (d.packKgAtTripEnd != null && d.packCapAtTripEnd != null && d.packCapAtTripEnd > 0 &&
      d.packKgAtTripEnd >= 0.95 * d.packCapAtTripEnd) return 'PACK_FULL';
  if (d.stockedRemainingAtTripEnd === 0) return 'NO_MORE_TARGETS';
  const cost = (d.medianTripCost != null && isFinite(d.medianTripCost)) ? d.medianTripCost : 64;
  if (d.ticksRemainingAtTripEnd != null && d.ticksRemainingAtTripEnd < cost) return 'OUT_OF_TIME';
  if (d.secondTripAttempted) return 'UNCLASSIFIED'; // a second trip WAS tried: not a one-trip stop
  return 'POLICY_ONE_TRIP';
}

// attributeSeed(days): days = array of {category} for successful-trip
// days only. Returns {mechanism|null, share, n, counts}. Attributed
// iff modal share >= 0.5 AND n >= 5, per prereg.
function attributeSeed(days) {
  const counts = {};
  for (const d of (days || [])) {
    if (!d || !d.category || d.category === 'NO_TRIP' || d.category === 'UNCLASSIFIED') continue;
    counts[d.category] = (counts[d.category] || 0) + 1;
  }
  let mechanism = null, best = 0;
  for (const k of Object.keys(counts)) {
    if (counts[k] > best) { best = counts[k]; mechanism = k; }
  }
  const n = Object.values(counts).reduce((a, b) => a + b, 0);
  const share = n ? best / n : 0;
  const attributed = !!(mechanism && n >= 5 && share >= 0.5);
  return { mechanism: attributed ? mechanism : null, share: +share.toFixed(3), n, counts,
    unattributedReason: attributed ? null : (n < 5 ? 'too-few-trip-days' : 'no-modal-majority') };
}

// dominantMechanism(seedAttrs): seedAttrs = [{mechanism|null}].
// Returns {mechanism|null, count, attributedSeeds, scattered}.
function dominantMechanism(seedAttrs) {
  const counts = {};
  let attributedSeeds = 0;
  for (const s of (seedAttrs || [])) {
    if (s && s.mechanism) { attributedSeeds++; counts[s.mechanism] = (counts[s.mechanism] || 0) + 1; }
  }
  let mechanism = null, best = 0;
  for (const k of Object.keys(counts)) {
    if (counts[k] > best) { best = counts[k]; mechanism = k; }
  }
  return { mechanism, count: best, attributedSeeds,
    scattered: attributedSeeds >= 6 && best < 6, counts };
}

module.exports = { KEEP_KCAL, TICKS_PER_DAY, shelledNetEach, summarizePack, classifyTripDay, attributeSeed, dominantMechanism };
