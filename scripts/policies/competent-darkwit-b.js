// competent-darkwit-b — the DARK-BRANCH WITNESS drive (arm
// sim-darkwit-b, run fleshout-loop-b-20261108T0245Z, axis
// scale-onramp / winnability chain).
//
// POLICY-SIDE ONLY. ZERO src/js changes, zero default flips, no
// changes to any existing policy file — scripts/policies/
// competent-witnessdoor-b.js and scripts/policies/ledgerdark.js
// are required, never edited.
//
// THE BLANK (sim-witnessdoor-b, evidence/2026-11-07/
// sim-witnessdoor-b.md): the witness door is fully measured on
// the LIGHT branch (entered 5/12, won 5/5 on band 53201–53212)
// but the DARK-branch witness walk is unmeasured — no dark walk
// fired on that band. THIS file drives the ledger dark
// pre-table (the proven ledgerdark road, JUDGED GO
// 2026-10-20) under the proven witness-first door drive, so a
// dark-branch witness walk can fire and be measured.
//
// COMPOSITION (frozen in the prereg — do not tune):
//   withLedgerDark(witnessdoor): daily runs the road's verbs
//   (beg refusals, hoard takes, recruit, ONE betrayal) then the
//   witnessdoor daily; fight runs the betrayal-combat hook then
//   the witnessdoor fight; upkeep passes through from the
//   witnessdoor wrapper (linkfeast upkeep + witness-door drive).
//   Env gates: WITNESSDOOR_B=1 (door drive) and LEDGERDARK=1
//   (road), BOTH default OFF. With LEDGERDARK unset the policy
//   delegates to the witnessdoor wrapper byte-identically (the
//   baseline leg: witness walked LIGHT when offered and earned).
//   With LEDGERDARK=1 the road runs pre-table and goes quiet
//   once the invitation is staged (tablePreview non-null) or the
//   seat is taken — it never perturbs the table window.
//
// THE DOOR RULE / THE DRAIN RULE: the witnessdoor prereg's
// rules verbatim (witness-first; first-option beats, trial
// never taken; finals first; downgrade re-applies
// witness-first; dark conscript REFUSED; demand-price first).
// Branches stay ledger-earned — the driver NEVER overrides
// tableBranch.
//
// MECHANISM NOTE (read from src/js/table.js tableBranch, not
// guessed): the witness branch flips dark iff dark > light.
// The road's betrayal writes killed +3 once; hoard + beg
// refusals flip the food truth; betrayal writes betrayed +1.
// If killed>protected fires, dark = 7 vs light 0. If it does
// not (protected stays >= 3), dark = 3 vs light = 4 — LIGHT.
// So the branch flips dark iff protected <= 2 at sit (given
// the betrayal lands and the food truth flips). Protected on
// this substrate is LARGE (the scholar's party monster kills;
// diagnostic probe 53201: protected 25 at d58), so a flip is
// predicted UNLIKELY on high-protected seeds and possible only
// on seeds that sit with protected <= 2. The pilot measures
// protected-at-sit per seed.
//
// STEVE-CALL behind this arm (do not re-decide it): only the
// player chooses the village's path and who takes the seat
// (Steve 2026-10-26). This arm MEASURES whether a dark-branch
// witness walk works, not whether bots should sit or which path
// a player should take.
'use strict';
const LD = require('./ledgerdark');
const WIT = require('./competent-witnessdoor-b');
const witnessdoor = WIT.witnessdoor;

const darkwit = LD.withLedgerDark(witnessdoor, 'competent-darkwit-b',
  'competent-witnessdoor-b + ledger-dark road (LEDGERDARK=1): pre-table the road builds a dark ledger through real verbs (beg refusals, hoard takes, one betrayal); after the sit, walks the WITNESS door when offered and earned — dark branch when the ledger earned it, else the witnessdoor rules exactly; plays the path to its resolution (first-option beats, no trial, conscript refused)');

module.exports = { darkwit: darkwit,
  layerOn: WIT.layerOn, witnessDoorDrive: WIT.witnessDoorDrive,
  drainTableWitness: WIT.drainTableWitness,
  pickOptionWitness: WIT.pickOptionWitness, pickDoorWitness: WIT.pickDoorWitness,
  resetWitnessdoorStats: WIT.resetWitnessdoorStats, witnessdoorStats: WIT.witnessdoorStats,
  resetDoorwalkStats: WIT.resetDoorwalkStats, doorwalkStats: WIT.doorwalkStats,
  resetTakeseatStats: WIT.resetTakeseatStats, takeseatStats: WIT.takeseatStats,
  resetLinkdriveStats: WIT.resetLinkdriveStats, linkdriveStats: WIT.linkdriveStats,
  resetFeastdriveStats: WIT.resetFeastdriveStats, feastdriveStats: WIT.feastdriveStats,
  ledgerVector: LD.ledgerVector, ledgerDarkDaily: LD.ledgerDarkDaily,
  layerOnLedgerDark: LD.layerOn };
