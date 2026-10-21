// vgearconfirm — VGEAR composition for the SEATDRIVE=1 WINNING substrate
// (flesh-out loop, 2026-10-21, arm sim-vgearconfirm, axis scale-onramp,
// backlog #739: does VGEAR manufacture veterans on the winning substrate?).
//
// SUBSTRATE (pinned): the winning substrate from sim-fullseat (13/16 wins,
// wave-5 never opens): FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1
// SEATDRIVE=1. Control = seatdrive's prebuilt leadseat/belongseat
// (withSeatDrive(withWinDefer(TF leadfeast/belongfeast)) — the objects
// test-vgearseat E2 proved byte-identical to the winning stack). Armed =
// VG.withVillagerGear OUTSIDE the same stack (VGEAR=1). Both share the
// composition module; the VGEAR env gate is the only switch.
//
// LINEAGE: replaces the zero-trace-deleted scripts/policies/vgearseat.js
// (killed at pilot on the seatdrive-default-on substrate, NO-GO, 0/16 both
// arms). That substrate was SEATDRIVE unset (default-on) — behaviorally
// identical to SEATDRIVE=1 for the driver (seatdrive.js layerOn():
// `process.env.SEATDRIVE !== '0'`; det-gate proved unset == explicit
// SEATDRIVE=1 byte-identical) — but THIS arm pins the exact winning
// substrate env (no SUCCGRACE/RAIDDENSITY/NODEWITNESS; FULLSEAT diag
// instrument dropped for the KILLDISC + w5census instrument package) and
// 16 FRESH seeds. The question stands: does the channel fire where wins
// happen and wave-5 never opens?
//
// POLICY-SIDE ONLY — zero src/js changes. VGEAR=1 default-OFF; unset =
// pure delegation to the seat stack (E3 det-gate).
//
// Composition honesty is proved BEFORE any sweep by
// scripts/test-vgearconfirm-20261021.js (E0-E4 + D2 + det-gate). If any
// gate fails, this arm FAILS LOUDLY and stops.
//
// KILL PROTOCOL: if the arm is NO-GO at confirm, this module is deleted
// zero-trace (verify zero refs); instruments + evidence + proof land with
// the KILLED-VERDICT. Killed arms leave no trace in game code.
'use strict';
const SD = require('./seatdrive');
const VG = require('./villagergear');

function vgearOn() { return process.env.VGEAR === '1'; }

function normBase(base) {
  const b = String(base || '').toLowerCase();
  if (b === 'lead' || b === 'leadfeast') return 'leadfeast';
  if (b === 'belong' || b === 'belongfeast') return 'belongfeast';
  throw new Error('vgearconfirm: unknown base ' + base);
}

// The winning seat stack (SEATDRIVE=1): seatdrive's prebuilt objects.
function seatStackFor(base) {
  const b = normBase(base);
  return b === 'leadfeast' ? SD.leadseat : SD.belongseat;
}

// VGEAR=1 wraps the SAME stack OUTSIDE; unset = pure delegation.
function armedFor(base) {
  const b = normBase(base);
  const tag = b === 'leadfeast' ? 'lead' : 'belong';
  const inner = seatStackFor(b);
  return VG.withVillagerGear(inner,
    `${tag}-vgearconfirm`,
    `${b} + win-side layers + seatdrive (SEATDRIVE=1) + VILLAGERGEAR (VGEAR=1): the winning substrate's veteran-manufacturing confirm`);
}

module.exports = {
  vgearOn, normBase, seatStackFor, armedFor,
};
