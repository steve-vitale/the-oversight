'use strict';
// packcomp-b-count.js — return-pack counterfactual arithmetic (DIAG ONLY).
// sim-packcomp-b; rules fixed in evidence/2026-11-01/sim-packcomp-b-prereg.md
// BEFORE any judged sim. Pure function: no Game, no I/O, shared by the
// analyzer and the proof test so both judge by identical code.
//
// Input: one return's packBefore items as recorded by packcomp-b-driver.js.
// Each item: { name, plantId, lumpForm, units, kcalEach, hiddenKcal,
//   dataCal, edibility, foodKind, foodState, edible, needsCooking,
//   unprocessed (bool|null), finished (bool), lumpComp: null |
//   [{ pid, units, calPerUnit, edibility, isNut, mustCook }] }.
//
// Rules (code citations in the prereg):
// - finished = kcalEach > 0 AND NOT isUnprocessed (haul block's definition).
// - unknown value: non-lump unknown -> hiddenKcal (else dataCal) per unit,
//   avoid-edibility -> 0; lump unknown -> sum over components of
//   units x caloriesPerUnit, avoid -> 0. Missing per-unit value ->
//   incomplete (never guessed, never zero-filled).
// - shelled value: in_shell items -> units x round(hiddenKcal x 0.75)
//   (shellNuts), hiddenKcal falling back to dataCal. Missing -> incomplete.
// - everything else (materials/tools/relics, carcasses, cleaned meat,
//   needsCooking non-unknown/non-in-shell) counts 0 in all channels;
//   the kcalEach>0 unprocessed residual is reported, not pooled.
// - (a) = finished + unknown; (b) = finished + shelled;
//   (c) = finished + unknown + shelled. foodState is single-valued, so
//   no item is counted twice.
// - would-unload iff channel pack STRICTLY > 2000 (a pack at exactly
//   2000 unloads 0: the keep swallows whole stacks up to the keep).
function countReturn(items) {
  const out = {
    finished: 0, unknownValue: 0, shelledValue: 0,
    nutUnknownValue: 0, mustCookUnknownValue: 0,
    residualUnprocKcal: 0, materialsUnits: 0,
    incomplete: false, incompleteReasons: [],
    a: 0, b: 0, c: 0,
    aNoNut: 0, aNoMustCook: 0,
    wouldA: false, wouldB: false, wouldC: false,
  };
  const list = Array.isArray(items) ? items : [];
  for (const it of list) {
    const units = it.units || 0;
    if (it.finished === true) {
      out.finished += units * (it.kcalEach || 0);
      continue;
    }
    if (it.foodState === 'unknown') {
      if (Array.isArray(it.lumpComp)) {
        for (const comp of it.lumpComp) {
          if (comp.edibility === 'avoid') continue;
          if (comp.calPerUnit == null) {
            out.incomplete = true;
            out.incompleteReasons.push('lump component ' + comp.pid + ' missing calPerUnit');
            continue;
          }
          const v = (comp.units || 0) * comp.calPerUnit;
          out.unknownValue += v;
          if (comp.isNut) out.nutUnknownValue += v;
          if (comp.mustCook) out.mustCookUnknownValue += v;
        }
      } else {
        if (it.edibility === 'avoid') continue;
        const per = (it.hiddenKcal != null) ? it.hiddenKcal : it.dataCal;
        if (per == null) {
          out.incomplete = true;
          out.incompleteReasons.push('unknown item ' + (it.name || it.plantId) + ' missing per-unit value');
          continue;
        }
        const v = units * per;
        out.unknownValue += v;
        if (it.isNut) out.nutUnknownValue += v;
        if (it.mustCook) out.mustCookUnknownValue += v;
      }
      continue;
    }
    if (it.foodState === 'in_shell') {
      const per = (it.hiddenKcal != null) ? it.hiddenKcal : it.dataCal;
      if (per == null) {
        out.incomplete = true;
        out.incompleteReasons.push('in_shell item ' + (it.name || it.plantId) + ' missing per-unit value');
        continue;
      }
      out.shelledValue += units * Math.round(per * 0.75);
      continue;
    }
    if (it.unprocessed === true) {
      out.residualUnprocKcal += units * (it.kcalEach || 0);
      continue;
    }
    // Materials / tools / relics / kcalEach-0 items: 0 in every channel.
    out.materialsUnits += units;
  }
  out.a = out.finished + out.unknownValue;
  out.b = out.finished + out.shelledValue;
  out.c = out.finished + out.unknownValue + out.shelledValue;
  out.aNoNut = out.finished + (out.unknownValue - out.nutUnknownValue);
  out.aNoMustCook = out.finished + (out.unknownValue - out.mustCookUnknownValue);
  out.wouldA = out.a > 2000;
  out.wouldB = out.b > 2000;
  out.wouldC = out.c > 2000;
  out.finished = Math.round(out.finished);
  out.unknownValue = Math.round(out.unknownValue);
  out.shelledValue = Math.round(out.shelledValue);
  out.nutUnknownValue = Math.round(out.nutUnknownValue);
  out.mustCookUnknownValue = Math.round(out.mustCookUnknownValue);
  out.residualUnprocKcal = Math.round(out.residualUnprocKcal);
  out.a = Math.round(out.a);
  out.b = Math.round(out.b);
  out.c = Math.round(out.c);
  out.aNoNut = Math.round(out.aNoNut);
  out.aNoMustCook = Math.round(out.aNoMustCook);
  return out;
}

module.exports = { countReturn };
