// feastseek — competent + the devotion engine (longsim food 2026-10-11).
// Identical daily/upkeep/fight core as competent, plus the feast->damage
// conversion playstyle:
//  - channels a keepsake daily once the System teaches sentiment (arms the
//    surge via the mastery lane or the devotion lane; focused practice also
//    builds surgeResonance)
//  - fights WITH ability actions, not just strikes (each use builds
//    surgeResonance — the devotion lane's fuel — and feasted twists ride on
//    real resolutions)
//  - hosts a feast at DUSK at the haven when the surge is ARMED and the
//    pantry can carry it (the buff window covers the night's fights)
//
// The comparison competent-vs-feastseek on identical seeds measures whether
// the food->damage loop ever matters: arm rate, feast rate, grant rate,
// feasted extra damage, and survival/win deltas.
'use strict';
const { competent } = require('./competent');

function channelKeepsake(Game, ctx) {
  try {
    const s = Game.state.scholar || {};
    const day = s.day || 0;
    if (ctx._chanDay === day) return; // one channel a day — devotion, not spam
    if (!Game.sentimentTaught || !Game.sentimentTaught()) return;
    const ready = Game.channelReadyKeepsakes ? Game.channelReadyKeepsakes() : [];
    if (!ready.length) return;
    Game.channelSentiment(ready[0]);
    ctx._chanDay = day;
  } catch (e) {}
}

function eveningFeast(Game, ctx) {
  try {
    if (Game.dayPart !== 2) return; // dusk: the buff rides into the night's fights
    const s = Game.state.scholar || {};
    if (!(s.prog && s.prog.feastSurge)) return; // armed feasts only — the conversion, not the social call
    if (s.feastDay === (s.day || 0)) return;
    if (!Game.playerAtHaven || !Game.playerAtHaven()) return;
    const plan = Game.feastPlan();
    if (!plan.ok) return;
    if (plan.have < plan.cost * 1.5) return; // never bankrupt the pantry for the buff
    const rep = Game.hostFeast();
    if (rep && !rep.ok && ctx) ctx._feastWhy = rep.why;
  } catch (e) {}
}

function combatAbility(Game, ctx) {
  // one ability attempt per player turn, keyed on the fight's turn cursor
  try {
    const f = Game.tbfight;
    if (!f || f.over || !Game.tbIsPlayerTurn || !Game.tbIsPlayerTurn()) return;
    const turnKey = f.id + ':' + f.round + ':' + f.turnIdx;
    if (ctx._abTurn === turnKey) return;
    ctx._abTurn = turnKey;
    const acts = Game.activatableAbilities ? Game.activatableAbilities() : [];
    const ab = acts.find(a => a.combat && a.available);
    if (!ab) return;
    Game.useAbility(ab.abilityId, ab.actionId, null);
  } catch (e) {}
}

const feastseek = Object.assign({}, competent, {
  id: 'feastseek',
  desc: 'competent + devotion engine: channels keepsakes, fights with abilities, feasts at dusk when armed',
  upkeep(Game, ctx) {
    competent.upkeep(Game, ctx);
    channelKeepsake(Game, ctx);
    eveningFeast(Game, ctx);
  },
  fight(Game, ctx) {
    combatAbility(Game, ctx);
    // the ability may have ended the fight (kill, rout, escape) — nothing
    // left to delegate
    try { if (!Game.tbfight || Game.tbfight.over) return true; } catch (e) {}
    return competent.fight(Game, ctx);
  },
});

module.exports = { feastseek };
