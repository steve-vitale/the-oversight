// competent-pairoverlap-b — yield-the-blow (arm sim-pairoverlap-b,
// run fleshout-loop-b-20261107T2130Z, axis scale-onramp / winnability
// chain).
//
// POLICY-SIDE ONLY. ZERO src/js changes, zero default flips, no
// changes to any existing policy file. Composes onto the FROZEN
// feast-drive substrate (scripts/policies/competent-feastdrive-b.js,
// unmodified, itself composing onto the FROZEN staged substrate).
// Prereg frozen in evidence/2026-11-07/sim-pairoverlap-b-prereg.md
// BEFORE any judged sim.
//
// THE BLANK (feastdrive → feastcost → feastcap → feaststopspend):
// three throttles in a row failed the same pair-days bar for the same
// reason — feast draws are the pair factory, and throttling feasts
// kills the pairs. The pair anatomy, read from the corpora: pair days
// need TWO LIVING wave-4+ killers at once; kills without overlap are
// not pairs; and on the feaststopspend re-baseline the scholar lands
// ~68% of wave-4+ killing blows (21 via player / 9 via companion /
// 1 via wild). Every scholar re-kill is a kill that made no second
// veteran.
//
// THE LEVER: in a wave-4+ turn-based fight the scholar joins, when
// the killing blow is the scholar's to take and a companion stands
// ready to take it instead, the scholar holds — the companion lands
// the blow and becomes the second living veteran beside the scholar,
// opening a pair window on the spot. It converts scholar-kills into
// companion-kills; it adds no feasts, draws, or fights, and it
// throttles nothing.
//
// WHAT IT CHANGES (all of it, nothing hidden): a thin wrapper
// overriding ONLY fight(); daily/upkeep delegate to the feastdrive
// policy unchanged (donate-down + feast-at-dusk run exactly as
// frozen). On each scholar turn, BEFORE delegating to the staged
// fight hook, it checks the yield condition — ALL of these, read
// only from the live fight in front of the scholar and the scholar's
// own state (the same inputs the rally reads):
//   1. the fight's weakest living monster (the one the base policy
//      would strike) is wave-4+, AND
//   2. that monster's HP <= 50 — the codebase's own killing-blow
//      proxy (competent.js in-fight recovery: "never eats instead
//      of a killing blow (weakest monster <= 50 HP: strike)"), AND
//   3. >= 1 living ally fighter is present (kind ally/villager,
//      alive, not fled, key != 'p'), AND
//   4. the scholar is in strike range of that monster, AND
//   5. the scholar's HP >= 50%, AND
//   6. this is not the fight's first player turn (per-fight turn
//      count keyed by fight OBJECT identity — so the round-1 rally
//      can never be intercepted, even for a pre-wounded beast), AND
//   7. this monster has been yielded at most 2 times in this fight.
// When all hold, the scholar WAITS (Game.tbPlayerWait — it
// auto-advances; never endTurn after it) instead of striking. If no
// ally lands the blow, the scholar strikes on a later turn (the cap
// bounds the delay). When any condition fails, the wrapper delegates
// to the staged fight hook unchanged (rally included).
//
// WHAT IT DOES NOT DO (stated so the census cannot be misread):
//   - No feast change, no donation change, no EAT FIRST bypass, no
//     reactor change, no channel change, no flee change, no ability
//     press, no rally change.
//   - No roster, no waveKillLog, no snapshot: the yield reads ONLY
//     the live fight (f.fighters, mdef waves, roster waves) and the
//     scholar's own HP/position/weapon. The policy NEVER reads
//     state.waveKillLog — pinned by a proof test with a poisoned log.
//   - It does NOT protect the first killer (no honest policy-side
//     mechanism exists — see the prereg), and it does NOT gate on
//     whether the scholar is already a veteran (the design needs no
//     kill history: a yielded kill makes a veteran either way).
//
// COUNTERS: per-run ctx counters (po*) plus module-level stats
// (resetPairoverlapStats / pairoverlapStats) so the driver can
// capture per-seed numbers without reaching into harness ctx.
'use strict';
const FD = require('./competent-feastdrive-b');
const feastdrive = FD.feastdrive;
const RALLY = require('./competent-rally-bankkiller-b');

const YIELD_HP = 50;
const YIELD_MIN_SCHOLAR_HP = 0.5;
const YIELD_CAP_PER_MONSTER = 2;

const STATS = { yields: 0, yieldFights: 0, yieldsCapped: 0,
  firstYieldDay: null, yieldDays: {}, errors: 0, events: [] };
function resetPairoverlapStats() {
  STATS.yields = 0; STATS.yieldFights = 0; STATS.yieldsCapped = 0;
  STATS.firstYieldDay = null; STATS.yieldDays = {}; STATS.errors = 0;
  STATS.events = [];
}
function pairoverlapStats() { return JSON.parse(JSON.stringify(STATS)); }
function noteErr(where, e) {
  try {
    STATS.errors += 1;
    if (STATS.events.length < 200) STATS.events.push({ day: -1, what: 'error:' + where, detail: String((e && e.message) || e).slice(0, 120) });
  } catch (e2) {}
}
function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

// Per-fight yield state on ctx (keyed by fight OBJECT identity — fight
// ids are not guaranteed — so state can never leak across fights).
// Never on Game.state — policy bookkeeping only.
function fightState(ctx, f) {
  if (!ctx._poFight || ctx._poFight.for !== f) {
    ctx._poFight = { for: f, turns: 0, yieldsByKey: {}, countedFight: false };
  }
  return ctx._poFight;
}

// waveOf: monster wave from the live fighter first (mdef), else the
// roster — the rally's convention (waveOfMonster), never a guess.
function waveOf(Game, o) {
  try {
    if (o && o.mdef && o.mdef.wave != null) return (o.mdef.wave | 0);
    if (o && o.monsterId) return RALLY.waveOfMonster(Game, o.monsterId);
  } catch (e) {}
  return null;
}

function distTo(Game, m, px, py) {
  try {
    if (typeof Game.fighterDistTo === 'function') {
      const d = Game.fighterDistTo(m, px, py);
      if (d != null) return d;
    }
  } catch (e) {}
  return Math.max(Math.abs((m.mx != null ? m.mx : 4) - px), Math.abs((m.my != null ? m.my : 4) - py));
}

// yieldCheck(Game, ctx): the frozen seven-condition gate. Returns
// { action: 'yield', target, key, wave, allies, state } when the
// scholar should hold, { action: 'cap', key, state } when the ONLY
// failing condition is the per-monster yield cap (so the fight hook
// can count it once), else null. Pure read (plus per-fight turn
// bookkeeping on ctx) — never acts.
function yieldCheck(Game, ctx) {
  try {
    const f = Game.tbfight;
    if (!f || f.over) return null;
    if (typeof Game.tbIsPlayerTurn !== 'function' || !Game.tbIsPlayerTurn()) return null;
    const st = fightState(ctx, f);
    st.turns += 1;
    if (st.turns < 2) return null; // never intercept the round-1 rally
    const p = (typeof Game.tbFighter === 'function') ? Game.tbFighter('p') : null;
    if (!p) return null;
    const hpPct = (p.hp || 0) / Math.max(1, p.maxHp || p.hp || 1);
    if (hpPct < YIELD_MIN_SCHOLAR_HP) return null;
    const fighters = Array.isArray(f.fighters) ? f.fighters : [];
    let weakest = null, allies = 0;
    for (const o of fighters) {
      if (!o || !o.alive || o.fled) continue;
      if (o.kind === 'ally' || o.kind === 'villager') {
        if (o.key !== 'p') allies += 1;
      } else if (o.kind === 'monster' || o.kind === 'hostile') {
        if ((o.hp || 0) <= 0) continue;
        if (!weakest || (o.hp || 0) < (weakest.hp || 0)) weakest = o;
      }
    }
    if (!weakest) return null;
    if (allies < 1) return null;
    const w = waveOf(Game, weakest);
    if (w == null || w < 4) return null;
    if ((weakest.hp || 0) > YIELD_HP) return null;
    let range = 1;
    try {
      const eq = (Game.equippedWeapon && Game.equippedWeapon()) || { range: 1 };
      range = eq.range || 1;
    } catch (e) { range = 1; }
    const px = p.mx != null ? p.mx : 4, py = p.my != null ? p.my : 4;
    if (distTo(Game, weakest, px, py) > range) return null;
    const key = weakest.key || weakest.monsterId || '?';
    const used = st.yieldsByKey[key] || 0;
    if (used >= YIELD_CAP_PER_MONSTER) return { action: 'cap', key: key, state: st };
    return { action: 'yield', target: weakest, key: key, wave: w, allies: allies, state: st };
  } catch (e) { noteErr('yieldCheck', e); return null; }
}

const pairoverlap = Object.assign({}, feastdrive, {
  id: 'competent-pairoverlap-b',
  desc: 'competent-feastdrive-b + yield-the-blow: in a wave-4+ TB fight, when the weakest monster is one strike from death and an ally stands ready, the scholar holds so the ally lands the killing blow (policy-side probe only)',
  fight(Game, ctx) {
    try {
      const hit = yieldCheck(Game, ctx);
      if (hit && hit.action === 'yield') {
        const st = hit.state;
        st.yieldsByKey[hit.key] = (st.yieldsByKey[hit.key] || 0) + 1;
        const day = dayOf(Game);
        STATS.yields += 1;
        if (!st.countedFight) { st.countedFight = true; STATS.yieldFights += 1; }
        if (STATS.firstYieldDay == null) STATS.firstYieldDay = day;
        STATS.yieldDays[day] = (STATS.yieldDays[day] || 0) + 1;
        try { ctx.poYields = (ctx.poYields || 0) + 1; } catch (e) {}
        if (STATS.events.length < 200) {
          STATS.events.push({ day: day, what: 'yield', detail: 'held the blow on wave-' + hit.wave + ' ' + (hit.target.monsterId || hit.key) + ' at ' + (hit.target.hp || 0) + ' HP, ' + hit.allies + ' ally(ies) ready' });
        }
        if (typeof Game.tbPlayerWait === 'function') {
          try { Game.tbPlayerWait(); } catch (e) { noteErr('tbPlayerWait', e); }
          return true; // tbPlayerWait auto-advances — never endTurn after it
        }
        // No wait verb: fall through to the base fight unchanged.
      } else if (hit && hit.action === 'cap') {
        // Count each capped monster once per fight (the gate runs
        // every turn; the count must not grow with turns).
        const st = hit.state;
        st.cappedCounted = st.cappedCounted || {};
        if (!st.cappedCounted[hit.key]) {
          st.cappedCounted[hit.key] = true;
          STATS.yieldsCapped += 1;
          try { ctx.poYieldsCapped = (ctx.poYieldsCapped || 0) + 1; } catch (e) {}
        }
      }
    } catch (e) {
      noteErr('fight', e);
    }
    return (typeof feastdrive.fight === 'function') ? feastdrive.fight(Game, ctx) : false;
  },
});

module.exports = { pairoverlap: pairoverlap,
  resetPairoverlapStats: resetPairoverlapStats, pairoverlapStats: pairoverlapStats,
  yieldCheck: yieldCheck, YIELD_HP: YIELD_HP,
  YIELD_MIN_SCHOLAR_HP: YIELD_MIN_SCHOLAR_HP,
  YIELD_CAP_PER_MONSTER: YIELD_CAP_PER_MONSTER };
