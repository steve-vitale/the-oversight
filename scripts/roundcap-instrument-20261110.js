// roundcap-instrument-20261110.js — round-cap walk-away recorder (arm
// sim-roundcap-b, run fleshout-loop-b-20261110T0626Z). Scripts only, zero src/js.
//
// Layers on the finishersize instrument (which layers grind) and decorates
// each field-fight row with the round-cap fields the engine records on `rec`
// (see fieldFights.js, sim-roundcap-b):
//   roundCap — engine-set when the 15-round cap ends the fight
//     (fieldFights.js:2578, `if (_flOn) rec.roundCap = true`).
//   vHpStart — the fighter's HP at fight entry (state.village.health[vid]
//     read before the call; read-only).
//   vStrikeMin / vStrikeMax — the fighter's close-in strike range
//     [4+wb, 8+wb], wb = round((meleeBonus + rangedBonus) / 2), computed
//     AFTER the fight with the same equipment helpers the engine uses
//     (fieldFights.js:612-614). Gear-up happens at fight entry and
//     nothing re-equips mid-fight, so post-fight equipment IS entry
//     equipment; computing after the call is exact, not an estimate.
//   oneStrike — roundCap && mHpLeft <= vStrikeMax: the beast dies to the
//     fighter's best possible single strike (the 99596 shape: 10 HP left,
//     fighter at 56 HP). oneStrikeStrict — mHpLeft <= vStrikeMin (dies to
//     the fighter's WORST single strike).
//   vWeapon — equipped melee/ranged weapon ids, for the sense-test read.
//
// The wrapper adds zero RNG draws and zero game-state writes; a recording
// failure is counted in instrumentErrors and the original result is
// returned untouched. Usage mirrors finishersize-instrument: install(Game)
// returns the base (with .t); snapshot/finalize/uninstall are the base's.
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const FSINST = require(path.join(REPO, 'scripts', 'finishersize-instrument-20261106'));

function install(Game) {
  const base = FSINST.install(Game);
  const t = base.t;
  const innerFF = Game.fieldFight;
  if (typeof innerFF !== 'function') { t.instrumentErrors.push('fieldFight-missing-rc'); return base; }
  Game.fieldFight = function (vid, mdef, m, opts) {
    const before = (t.fieldFights || []).length;
    let vHpStart = null;
    try {
      const h = ((Game.state || {}).village || {}).health || {};
      if (vid != null && h[vid] !== undefined) vHpStart = h[vid];
    } catch (e) {}
    let rec = null;
    try { rec = innerFF.apply(this, arguments); }
    catch (e) { throw e; }
    try {
      const rows = t.fieldFights || [];
      if (rows.length > before) {
        const row = rows[rows.length - 1];
        row.roundCap = !!(rec && rec.roundCap);
        row.vHpStart = vHpStart;
        // Fighter strike range, engine formula (fieldFights.js:612-614).
        let wb = null, vWep = null;
        try {
          const S = (globalThis.S || ((globalThis.Scattering || {}).S)) || {};
          const data = Game.data || {};
          const vp = ((data.villagers || []).find(function (x) { return x.id === vid; }) ||
                      (data.background_survivors || []).find(function (x) { return x.id === vid; })) || {};
          if (S.equipment && S.equipment.weaponBonusOf) {
            const mb = S.equipment.weaponBonusOf(vp, data.items, 'melee') || 0;
            const rb = S.equipment.weaponBonusOf(vp, data.items, 'ranged') || 0;
            wb = Math.round((mb + rb) / 2);
          }
          const eq = vp.equipped || {};
          vWep = { melee: eq.melee || eq.weapon || null, ranged: eq.ranged || null };
        } catch (e) { t.instrumentErrors.push('roundcap-wb: ' + String(e.message).slice(0, 80)); }
        row.vWb = wb;
        row.vStrikeMin = (wb == null) ? null : 4 + wb;
        row.vStrikeMax = (wb == null) ? null : 8 + wb;
        row.vWeapon = vWep;
        row.oneStrike = !!(row.roundCap && row.mHpLeft != null && row.vStrikeMax != null && row.mHpLeft <= row.vStrikeMax);
        row.oneStrikeStrict = !!(row.roundCap && row.mHpLeft != null && row.vStrikeMin != null && row.mHpLeft <= row.vStrikeMin);
      }
    } catch (e) { t.instrumentErrors.push('fieldFight-rc-row: ' + String(e.message).slice(0, 80)); }
    return rec;
  };

  const origUninstall = base.uninstall;
  base.uninstall = function () {
    try { Game.fieldFight = innerFF; } catch (e) {}
    try { origUninstall(); } catch (e) {}
  };
  return base;
}

module.exports = { install: install };
