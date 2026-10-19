// policies/murder-spree.js — the murder-spree probe policy (crisis leg r29, 2026-10-19).
//
// Built for the crisis leg's named next question (from r28): the
// moot-conviction exile route is unproven (0/51 cases produced an 'exile'
// verdict). A murder conviction norms to exile at avgBelief < -5
// (betrayal.js sentenceCase) — but does the belief ever bite?
//
// Same competent survival base, but the scholar commits a witnessed murder at
// Haven about weekly — on the first day per 7-day cycle when the conditions
// hold (at Haven, ≥1 witness, healthy, village ≥5 alive) — via the real
// playerAttacks verb → real betrayal combat (fight hook strikes the hostile)
// → real villageEvent ('murder') → real crime recording → the real justice
// ladder (confrontation → silence counts as refusal → moot demand →
// forcePlayerAccusation charges the witnessed murder → moot trial).
//
// Deterministic: murder schedule is day-modulo, victim is the first living
// roster member (stable order), no unseeded randomness beyond the engine's.
// Silence on confrontation is deliberate: the ladder's own 2-day timeout
// turns it into refusal, which is the honest route to the moot.
'use strict';
const { competent } = require('./competent');

// Murder cadence: at most one murder per 7-day cycle, taken on the FIRST day
// in the cycle when the conditions hold (at Haven, witnessed, healthy).
// A single fixed day kept missing (player out foraging, or nobody near) —
// the window preserves the weekly cadence without the brittleness.
const CYCLE = 7, FIRST_DAY = 12;

function murderDue(day, ctx) {
  if (day < FIRST_DAY) return false;
  const last = ctx.lastMurderDay == null ? -99 : ctx.lastMurderDay;
  return (day - last) >= CYCLE;
}

function livingVictim(Game) {
  try {
    const vv = Game.state.village || {};
    const me = Game.villagerId;
    for (const id of (vv.roster || [])) {
      if (id === me) continue;
      const rc = ((vv.rosterChars || {})[id]);
      if (rc && rc.alive === false) continue;
      return id;
    }
  } catch (e) {}
  return null;
}

function murderSpreeDaily(Game, ctx) {
  try {
    const s = Game.state.scholar || {};
    if (s.exiled || Game.over) return;
    if (Game.tbfight) return; // mid-fight: the fight hook owns it
    const day = s.day || 0;
    if (!murderDue(day, ctx)) return;
    // don't grind to extinction: need a village left to judge you
    const alive = ((Game.state.village || {}).roster || []).length;
    if (alive < 5) { ctx.murderSkippedFew = (ctx.murderSkippedFew || 0) + 1; return; }
    // the player should survive the fight: skip when badly hurt
    const hp = s.health == null ? 100 : s.health;
    const maxHp = Game.maxHealth ? Game.maxHealth() : 100;
    if (hp < maxHp * 0.5) { ctx.murderSkippedHurt = (ctx.murderSkippedHurt || 0) + 1; return; }
    // at Haven, with witnesses — the formal track needs provable crimes
    let atHaven = false;
    try { atHaven = Game.playerAtHaven ? Game.playerAtHaven() : false; } catch (e) {}
    if (!atHaven) { ctx.murderSkippedAway = (ctx.murderSkippedAway || 0) + 1; return; }
    let wits = 0;
    try { wits = (Game.witnesses(6) || []).length; } catch (e) {}
    if (wits < 1) { ctx.murderSkippedAlone = (ctx.murderSkippedAlone || 0) + 1; return; }
    const victim = livingVictim(Game);
    if (!victim) return;
    try {
      const r = Game.playerAttacks(victim);
      if (r) { ctx.murders = (ctx.murders || 0) + 1; ctx.lastMurderDay = day; }
      else ctx.murderRefused = (ctx.murderRefused || 0) + 1;
    } catch (e) { ctx.murderThrew = (ctx.murderThrew || 0) + 1; }
  } catch (e) {}
}

const murderSpree = Object.assign({}, competent, {
  id: 'murder-spree',
  desc: 'competent base + weekly witnessed murder at Haven via real playerAttacks: probes the moot-conviction exile route (crisis leg r29)',
  daily(Game, ctx) {
    try { competent.daily(Game, ctx); } catch (e) {}
    murderSpreeDaily(Game, ctx);
  },
  fight(Game, ctx) {
    // Own every player turn of betrayal combat: strike the hostile villager,
    // closing distance first. Return false when there's nothing hostile to
    // fight so the default driver handles monster fights.
    try {
      const f = Game.tbfight;
      if (!f || f.over) return false;
      if (!Game.tbIsPlayerTurn || !Game.tbIsPlayerTurn()) return false;
      const hostile = (f.fighters || []).find(x => x && x.kind === 'hostile' && x.alive && !x.fled);
      if (!hostile) return false;
      const p = Game.tbFighter('p');
      if (!p || p.acted) return false;
      const w = Game.equippedWeapon ? Game.equippedWeapon() : null;
      const range = (w && w.range) || 1;
      let d = 99;
      try { d = Game.fighterDistTo(hostile, p.mx, p.my); } catch (e) {}
      if (d <= range) {
        Game.tbPlayerStrike(hostile.key);
        return true;
      }
      // close in: step toward the hostile (adjacent tile, not onto them)
      try {
        const tx = hostile.mx + Math.sign(p.mx - hostile.mx);
        const ty = hostile.my + Math.sign(p.my - hostile.my);
        Game.tbPlayerMove(tx, ty);
        return true;
      } catch (e) { return false; }
    } catch (e) { return false; }
  },
});

module.exports = { murderSpree };
