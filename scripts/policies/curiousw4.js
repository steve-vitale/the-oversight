// policies/curiousw4.js — curious-default escalation for wave 4
// (sim-curiousw4-a, Loop A 20261103T0518Z, axis scale-onramp).
//
// ONE layer, POLICY-SIDE ONLY, zero src/js changes. It overrides ONLY
// fight(). Everything else delegates to the wrapped base byte-identically.
//
// THE IDEA: the baseline stack's curious default asks at the fire about
// old beasts (the askAbout beasttricks block in competent.js, gated by
// counterTeachable). Wave-4 beasts carry no teachable counter field, so
// asking can never teach a wave-4 trick; wave-4 trick knowledge is banked
// only by surviving wave-4 fights (two survived encounters per type).
// Escalation therefore moves curiosity INTO the fight: when the scholar
// stands in a turn-based fight with a live wave-4 beast, this layer
// presses the fight's OWN offered signature verbs — the buttons the
// phone itself shows for this fight (Game.sigW4CombatButtons, the
// capable.js-proven pattern: parse the enabled buttons, press by
// priority, never a disabled one) — instead of the baseline's generic
// strike that turn. Trying the offered verb is the experiment; surviving
// the fight banks the observation. The base fight runs whenever no
// signature verb is pressed, and whenever a pressed verb does not spend
// the turn. Assessment, fleeing, strikes, and abilities are untouched.
//
// DECISION INPUTS ONLY (perception law, Steve 2026-10-28):
//   - the fight the scholar is standing in, and the live beasts in it
//     (read off the fight's own fighters — the player's own senses);
//   - the fight's own offered buttons (the phone's affordance);
//   - the village's own unlock + deed record, and day / game-over guards.
// No other channel is read. In particular this file never consults any
// outside list of beasts, places, or people, and never consumes RNG:
// verb order is a fixed priority table, ties keep first-seen order.
'use strict';

const SIG_PREF = {
  tbEulogyRewrite: [10, 1],
  tbCongRefuse: [9, 1],
  tbStrikeMeet: [9, 2],
  tbCongHeresy: [8, 2],
  tbSuburbLeave: [8, 4],
  tbEulogyContradict: [7, 4],
  tbEaterPoison: [7, 1],
  tbInflOutentertain: [6, 2],
  tbAlgoTank: [6, 2],
  tbAuditRead: [5, 1],
  tbSuburbRest: [7, 2],
};

function scholarDay(Game) {
  try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; }
}

function liveWave4Mids(Game, f) {
  try {
    const defs = ((Game.data || {}).monsters || []);
    const out = [];
    for (const x of (f.fighters || [])) {
      if (!x || x.kind !== 'monster' || !x.alive || x.fled) continue;
      const mid = x.monsterId || (x.mdef && x.mdef.id) || x.id || null;
      if (!mid) continue;
      const def = defs.find(d => d && d.id === mid);
      if (def && (def.wave | 0) === 4) out.push(mid);
    }
    return out;
  } catch (e) { return []; }
}

function offeredVerbs(Game) {
  // Parse the fight's own button HTML. Skip any button carrying a
  // disabled marker; return data-sigw4 verb names in document order.
  try {
    if (typeof Game.sigW4CombatButtons !== 'function') return [];
    const html = Game.sigW4CombatButtons() || '';
    if (!html) return [];
    const out = [];
    const re = /<button([^>]*)>/g;
    let m;
    while ((m = re.exec(html))) {
      const attrs = m[1] || '';
      if (/\sdisabled\b/.test(attrs)) continue;
      const r = /data-sigw4="([^"]*)"/.exec(attrs);
      if (r && r[1] && out.indexOf(r[1]) < 0) out.push(r[1]);
    }
    return out;
  } catch (e) { return []; }
}

function turnSpent(Game, p) {
  try {
    if (!Game.tbfight || Game.tbfight.over) return true;
    if (!Game.tbIsPlayerTurn()) return true;
    const q = Game.tbFighter('p');
    return !q || q !== p || !!q.acted;
  } catch (e) { return true; }
}

function trySigVerb(Game, ctx, f, p) {
  try {
    if (typeof Game.unlockedWave === 'function' && (Game.unlockedWave() | 0) < 4) return false;
    const mids = liveWave4Mids(Game, f);
    if (!mids.length) return false;
    if (ctx._curiousFight !== f) { ctx._curiousFight = f; ctx._curiousCounts = {}; }
    const counts = ctx._curiousCounts || (ctx._curiousCounts = {});
    const verbs = offeredVerbs(Game);
    if (!verbs.length) return false;
    let best = null, bestScore = -1;
    for (const v of verbs) {
      const pref = SIG_PREF[v];
      if (!pref) continue;
      if ((counts[v] || 0) >= pref[1]) continue;
      if (v === 'tbSuburbRest') {
        const frac = (p.hp || 0) / Math.max(1, p.maxHp || p.hp || 1);
        if (frac >= 0.5) continue;
      }
      if (pref[0] > bestScore) { bestScore = pref[0]; best = v; }
    }
    if (!best) return false;
    if (typeof Game[best] !== 'function') return false;
    try { Game[best](); } catch (e) { return false; }
    counts[best] = (counts[best] || 0) + 1;
    const rec = (ctx.curious || (ctx.curious = { uses: [] }));
    rec.uses.push({ day: scholarDay(Game), verb: best, mids: mids.slice() });
    const ids = (ctx._curiousSigFightIds || (ctx._curiousSigFightIds = []));
    if (f.id != null && ids.indexOf(f.id) < 0) ids.push(f.id);
    return turnSpent(Game, p);
  } catch (e) { return false; }
}

function withCuriousW4(base, id, desc) {
  return Object.assign({}, base, {
    id: id || 'closecommit-curiousw4',
    desc: desc || 'closecommit + curiousw4: press offered wave-4 signature verbs in player fights',
    fight(Game, ctx) {
      try {
        const f = Game.tbfight;
        if (f && !f.over && Game.tbIsPlayerTurn && Game.tbIsPlayerTurn()) {
          const p = Game.tbFighter ? Game.tbFighter('p') : null;
          if (p && !p.acted) {
            if (trySigVerb(Game, ctx, f, p)) return true;
          }
        }
      } catch (e) {}
      try { return base.fight(Game, ctx); } catch (e) { return false; }
    },
  });
}

module.exports = { withCuriousW4, SIG_PREF };
