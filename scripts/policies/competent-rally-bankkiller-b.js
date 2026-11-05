// competent-rally-bankkiller-b — rally the line (arm sim-bankkiller-b,
// Loop B run fleshout-loop-b-20261105T2130Z, axis winnability chain).
//
// POLICY-SIDE ONLY. ZERO src/js changes, zero default flips, no changes
// to any existing policy file. This is a measurement instrument, not a
// play recommendation: it isolates the RALLY half of the wild-death /
// second-killer-production blank (does calling the line together at the
// start of a wave-4+ TB fight — hold the line 3 rounds + focus fire —
// produce a second wave-4 killer while the first still lives?), paired
// on identical seeds with the competent-verbatim baseline.
//
// WHAT IT CHANGES (all of it, nothing hidden):
//   - fight hook ONLY. On the scholar's FIRST turn of a TB fight that
//     contains a LIVE wave-4+ monster AND >= 1 living ally fighter in
//     the fight, the scholar calls the engine-honest rally verb
//     (Game.tbPlayerRally — regroup on the scholar, stun clears,
//     rallied=3 holds the hopeless-flee line, coordKey focuses ally
//     damage on the foe nearest the scholar) ONCE, then fights normally
//     via competent.fight on every later turn. Every other hook (daily,
//     upkeep, pending, contest, ...) is the base competent policy's
//     object, unchanged, and every non-wave-4+ fight, every ally-less
//     fight, and every turn after the first delegates to base.fight
//     untouched. No env gates are set by requiring this file. No
//     pending-encounter handling of any kind: startCombat is the single
//     pending-clearer and this policy never touches it.
//   - TRIGGER (frozen in the prereg — do not tune): first player turn of
//     the fight (the policy's own per-fight turn counter, not f.round),
//     live wave-4+ monster in the fight, >= 1 living ally fighter
//     (kind 'ally' or 'villager', alive, not fled, key != 'p'). No HP
//     gate, no killer-window gate: the mechanism is fight-level, and
//     restricting it to the ~9.5-day median killer window would starve
//     the denominator. The chain outcome (second-killer production) is
//     the judged primary; the killer-window question is answered by the
//     secondaries, not by narrowing the trigger.
//   - ONE rally per fight, engine-enforced (f.rallyUsed) and
//     policy-tracked (per-fight state keyed by fight OBJECT identity, so
//     state can never leak across fights). A rally that returns false
//     (no allies, already used, not the player's turn) falls through to
//     base.fight — the turn is still the player's.
//   - RALLY IS NOT A FLEE: it is a stand-and-fight verb. It fires in
//     sealed arena fights exactly like wild ones (the engine puts no
//     sealed guard on it, and this layer adds none). It never moves the
//     scholar, never exits the fight, never touches the barrier.
//
// WHAT IT DOES NOT DO (stated so the census cannot be misread):
//   - Villager field fights: the engine drives them, not the player.
//     This policy cannot touch a field fight's flee line. Field fights
//     are the untouched control channel in this arm.
//   - No hold-for-finish discipline (this is NOT splitkill): the scholar
//     strikes normally after rallying. No yield band, no soften/hold, no
//     killing-blow management — the rally is a round-1 setup verb, and
//     whoever lands the killing blow lands it.
//   - No ability press: rally is a human leadership verb, not a System
//     ability. The ability-use game-code follow-up (main session's arm)
//     is untouched; base.fight's own ability presses are unchanged.
//   - No flee, no retreat, no disengage: the opposite direction from the
//     tbretreat-refind lever (sibling confirm arm) — stand and rally.
//   - No roster, no waveKillLog, no snapshot: the rally reads ONLY the
//     fight in front of the scholar (living allies and live monsters in
//     f.fighters, the nearest foe). The policy never reads
//     state.waveKillLog — pinned by a proof test with a poisoned log.
//
// COUNTERS: per-run ctx counters (bk*) plus module-level stats
// (resetBankkillerStats / bankkillerStats) so the driver can capture
// per-seed numbers without reaching into harness ctx.
'use strict';
const base = require('./competent');
const competent = base.competent;

const STATS = { w4plusFights: 0, alliesPresentFights: 0, rallyFires: 0,
  rallyOk: 0, rallyFalse: 0, rallyErrors: 0, events: [] };
function resetBankkillerStats() {
  STATS.w4plusFights = 0; STATS.alliesPresentFights = 0; STATS.rallyFires = 0;
  STATS.rallyOk = 0; STATS.rallyFalse = 0; STATS.rallyErrors = 0;
  STATS.events = [];
}
function bankkillerStats() { return JSON.parse(JSON.stringify(STATS)); }

// Wave of a monster id from the data roster (pure read; null when the
// roster has no such id — an unknown wave is NEVER treated as wave 4+).
// Same convention as scripts/policies/w4abstain.js and tbretreat-refind.js.
function waveOfMonster(Game, mid) {
  try {
    const list = ((Game.data || {}).monsters || []);
    const m = list.find(function (x) { return x && x.id === mid; });
    if (m && m.wave != null) return (m.wave | 0);
  } catch (e) {}
  return null;
}

// Live fighters in the current TB fight, split by side. Reads ONLY the
// fight in front of the scholar: f.fighters, mdef waves, roster waves.
function fightSides(Game) {
  const out = { w4plus: [], waves: [], allies: [], unknown: [] };
  try {
    const f = Game.tbfight;
    if (!f || f.over || !Array.isArray(f.fighters)) return out;
    for (const o of f.fighters) {
      if (!o || !o.alive || o.fled) continue;
      if (o.kind === 'monster' || o.kind === 'hostile') {
        let w = null;
        if (o.mdef && o.mdef.wave != null) w = (o.mdef.wave | 0);
        else if (o.monsterId) w = waveOfMonster(Game, o.monsterId);
        if (w == null) out.unknown.push(o.key || o.monsterId || '?');
        else {
          out.waves.push(w);
          if (w >= 4) out.w4plus.push(o);
        }
      } else if ((o.kind === 'ally' || o.kind === 'villager') && o.key !== 'p') {
        out.allies.push(o);
      }
    }
  } catch (e) {}
  return out;
}

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

// Per-fight rally state on ctx (keyed by fight OBJECT identity — fight
// ids are not guaranteed — so state can never leak across fights). Never
// on Game.state — policy bookkeeping only.
function fightState(ctx, f) {
  if (!ctx._bkFight || ctx._bkFight.for !== f) {
    ctx._bkFight = { for: f, turns: 0, seen: false, rallied: false, event: null };
  }
  return ctx._bkFight;
}

const rallyPolicy = Object.assign({}, competent, {
  id: 'competent-rally-bankkiller-b',
  desc: 'competent + round-1 rally in wave-4+ TB fights with allies present (policy-side probe only)',
  fight(Game, ctx) {
    try {
      const f = Game.tbfight;
      if (f && !f.over && Game.tbIsPlayerTurn()) {
        const st = fightState(ctx, f);
        st.turns += 1;
        const sides = fightSides(Game);
        if (sides.w4plus.length) {
          if (!st.seen) {
            st.seen = true;
            ctx.bkW4plusFights = (ctx.bkW4plusFights || 0) + 1;
            STATS.w4plusFights += 1;
            if (sides.allies.length) {
              ctx.bkAlliesPresent = (ctx.bkAlliesPresent || 0) + 1;
              STATS.alliesPresentFights += 1;
            }
          }
          // FIRST TURN ONLY, allies present, rally not yet used here.
          // The rally verb itself enforces once-per-fight (f.rallyUsed)
          // and the allies requirement; this gate is the trigger, the
          // verb is the authority — a false return falls through.
          if (st.turns === 1 && !st.rallied && sides.allies.length) {
            st.rallied = true;
            ctx.bkRallyFires = (ctx.bkRallyFires || 0) + 1;
            STATS.rallyFires += 1;
            const p = Game.tbFighter('p');
            const sFrac = p ? (p.hp || 0) / Math.max(1, p.maxHp || p.hp || 1) : null;
            let mHp = 0, mMax = 0;
            for (const o of sides.w4plus) { mHp += Math.max(0, o.hp || 0); mMax += Math.max(0, o.maxHp || o.hp || 0); }
            const wave = Math.max.apply(null, sides.waves.filter(function (x) { return x >= 4; }).concat([4]));
            const mid = (sides.w4plus[0].mdef && sides.w4plus[0].mdef.id) || sides.w4plus[0].monsterId || null;
            const ev = { day: dayOf(Game), mid: mid, wave: wave, allies: sides.allies.length,
              turn: st.turns, scholarHpFrac: sFrac != null ? +sFrac.toFixed(3) : null,
              monsterHpFrac: mMax > 0 ? +(mHp / mMax).toFixed(3) : null,
              result: 'open' };
            st.event = ev;
            STATS.events.push(ev);
            let ok = false;
            try {
              ok = Game.tbPlayerRally();
            } catch (e) {
              ctx.bkRallyErrors = (ctx.bkRallyErrors || 0) + 1;
              STATS.rallyErrors += 1;
              ev.result = 'error';
              return (typeof competent.fight === 'function') ? competent.fight(Game, ctx) : false;
            }
            if (ok) {
              ctx.bkRallyOk = (ctx.bkRallyOk || 0) + 1;
              STATS.rallyOk += 1;
              ev.result = 'rallied';
              // The verb advanced the turn itself (tbAfterPlayerAction);
              // handled — never endTurn after it.
              return true;
            }
            ctx.bkRallyFalse = (ctx.bkRallyFalse || 0) + 1;
            STATS.rallyFalse += 1;
            ev.result = 'rally-false';
            // The turn is still the player's — fall through to base.
          }
        }
      }
    } catch (e) {}
    return (typeof competent.fight === 'function') ? competent.fight(Game, ctx) : false;
  },
});

module.exports = { rallyPolicy: rallyPolicy,
  resetBankkillerStats: resetBankkillerStats, bankkillerStats: bankkillerStats,
  waveOfMonster: waveOfMonster, fightSides: fightSides, fightState: fightState };
