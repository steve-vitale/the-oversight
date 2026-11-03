// tbhold.js — TB-HOLD policy variant (arm sim-tbpolicy-a, 2026-11-03).
// A policy-side lever for turn-based wave-4+ fights ONLY, on the
// scale-onramp axis. Competent verbatim everywhere else (daily, upkeep,
// contest, pending, and fight() for non-wave-4+ fights all delegate by
// object spread), and verbatim inside wave-4+ fights except for ONE rule:
//
//   HOLD: in a turn-based fight containing a wave-4+ monster, NEVER take
//   the flee path — neither the start-of-fight walk-away (competent's
//   outmatched assessment) nor the mid-fight 35% eject. Fight it out:
//   press combat abilities (same cascade order/guards as competent's
//   abilityPressPlay) then strike the weakest live monster (via
//   competent's exported beastStrikeTarget, which closes distance on
//   interior tiles only and never steps onto a flee-by-barrier edge).
//
// Why this is the lever the code actually offers (baseline read,
// evidence/2026-11-03/sim-tbpolicy-a-prereg.md): in the 99101-99108
// baseline band, competent spends 71 of 224 player turns in wave-4 TB
// fights fleeing (ctx.fled), every substantive fight opens with the
// walk-away (fledBad = 1), yet ZERO fights end fled and ZERO barrier
// pushes ever fire — the default-env flee() never pushes through the
// barrier (its push is gated on COMPETENT_DPS_RACE), so flee turns are
// spent walking to the edge and back while the monster hits. Four audit
// fights end with 0 strikes landed. HOLD converts those turns to strikes.
// Wave-4 monsters carry NO counters (src/data/monsters.json), so beast
// tricks are vacuous here and are not part of this variant; target
// selection is vacuous too (all 26 baseline TB fights are single-monster).
// No src/js change, no gear change, no ally-join change, no field-fight
// change, no gate/price change. Field fights never call policy.fight.
'use strict';
const { competent, beastStrikeTarget } = require('./competent');

function waveOf(Game, mid) {
  try {
    const def = ((Game.data || {}).monsters || []).find(function (d) { return d && d.id === mid; });
    if (def) return def.wave || 1;
  } catch (e) {}
  return null;
}

function monsterMidOf(m) {
  try { return m.monsterId || (m.mdef || {}).id || null; } catch (e) { return null; }
}

// Same cascade order/guards as competent's abilityPressPlay (gap audit
// leg 1): turncoat split, losing rally, bird strike once per fight,
// losing controls, winning rage — dinner reserve 200 kcal, one press
// per turn max, counted into the shared ctx.abilityPresses counter so
// measurement stays comparable with the competent baseline.
function holdAbilityPress(Game, f, ctx, p, endTurn) {
  try {
    if (ctx._holdAbFight !== f) { ctx._holdAbFight = f; ctx._holdAbPressed = {}; }
    const pressed = ctx._holdAbPressed;
    const live = (f.fighters || []).filter(function (x) { return x && x.kind === 'monster' && (x.hp || 0) > 0 && !x.fled; });
    if (!live.length) return false;
    const hpPct = (p.hp || 0) / Math.max(1, p.maxHp || p.hp || 1);
    const losing = hpPct < 0.5;
    const totalMaxHp = live.reduce(function (s, m) { return s + (m.maxHp || m.hp || 0); }, 0);
    const nontrivial = totalMaxHp >= 40 || live.length >= 2 || losing;
    const scholar = (Game.state || {}).scholar || {};
    const DINNER_RESERVE = 200;
    const tryPress = function (aid, act) {
      try {
        if (!Game.hasAbility(aid)) return false;
        const def = ((Game.data || {}).abilities || []).find(function (a) { return a.id === aid; });
        const action = def && (def.actions || []).find(function (a) { return a.id === act; });
        if (!action) return false;
        const avail = Game._actionAvailable(aid, action);
        if (!avail || !avail.ok) return false;
        if ((scholar.kcal || 0) - ((action.cost || {}).kcal || 0) < DINNER_RESERVE) return false;
        const ok = Game.useAbility(aid, act);
        const pf = Game.tbFighter ? Game.tbFighter('p') : p;
        if (pf && pf.acted) {
          if (ok) { ctx.abilityPresses = ctx.abilityPresses || {}; ctx.abilityPresses[aid] = (ctx.abilityPresses[aid] || 0) + 1; }
          if (Game.tbfight && !Game.tbfight.over && Game.tbIsPlayerTurn()) endTurn();
          return true;
        }
        if (!Game.tbfight || Game.tbfight.over || !Game.tbIsPlayerTurn()) return true;
        return false;
      } catch (e) { return false; }
    };
    if (live.length >= 2 && tryPress('turncoat', 'persuade')) return true;
    if (losing && tryPress('war_cry', 'bellow')) return true;
    if (!pressed.bird_strike && nontrivial && tryPress('bird_strike', 'call')) { pressed.bird_strike = 1; return true; }
    if (losing) {
      if (tryPress('pocket_sand', 'throw_sand')) return true;
      if (tryPress('freeze_tag', 'tag')) return true;
      if (tryPress('fear_aura', 'loom')) return true;
    }
    if (!losing && nontrivial && tryPress('rage', 'unleash_rage')) return true;
    return false;
  } catch (e) { return false; }
}

function holdFight(Game, ctx) {
  try {
    const f = Game.tbfight;
    if (!f || f.over || !Game.tbIsPlayerTurn()) return false;
    const live = (f.fighters || []).filter(function (x) { return x && x.kind === 'monster' && (x.hp || 0) > 0 && !x.fled; });
    if (!live.length) return false;
    let maxWave = 1;
    for (const m of live) {
      const w = waveOf(Game, monsterMidOf(m));
      if (w) maxWave = Math.max(maxWave, w);
    }
    // Not a wave-4+ fight: competent verbatim, flee included.
    if (maxWave < 4) return competent.fight(Game, ctx);
    // HOLD: no flee branch exists on this path at all.
    const p = Game.tbFighter('p');
    if (!p) return false;
    const endTurn = function () {
      try {
        const q = Game.tbFighter('p');
        q.moveLeft = 0; q.acted = true;
        Game.tbAfterPlayerAction();
      } catch (e) {}
    };
    if (holdAbilityPress(Game, f, ctx, p, endTurn)) return true;
    const sorted = live.slice().sort(function (a, b) { return (a.hp || 0) - (b.hp || 0); });
    const tgt = sorted[0];
    const px = p.mx != null ? p.mx : 4, py = p.my != null ? p.my : 4;
    const r = beastStrikeTarget(Game, f, ctx, p, px, py, tgt, endTurn);
    if (r === 'moved' || r === 'struck') return true;
    // beastStrikeTarget could not act (defensive fallback): the driver
    // default strike+wait still fights, never flees. Return false so it
    // runs; HOLD's guarantee is "no flee turn", not "this function acts".
    return false;
  } catch (e) { return false; }
}

const tbhold = Object.assign({}, competent, { id: 'tbhold', fight: holdFight });

module.exports = { tbhold: tbhold, holdFight: holdFight };
