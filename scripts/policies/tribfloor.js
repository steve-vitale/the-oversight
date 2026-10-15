// tribfloor — the tribute-gate floor (sim-tribfloor, 2026-10-15, scale-onramp axis).
//
// ONE policy-side layer, opt-in via TRIBFLOOR=1 (default OFF — unset means
// the wrapper delegates to its parent byte-identically; the proof test's
// D0 pins that). Wraps leadfeast/belongfeast (the FEASTSCALE_R13=1
// courtship-road substrate). Zero src/js.
//
// THE FAILURE (sim-tribshield's s77-armed transcript, 2026-10-15): the
// base tribute gates are floor-less. scalecourt's all-links 15k gate and
// belongseek's trib-x2 gate call Game.payTribute(link.id) with no survival
// floor, and belongseek honors tribute demands "even on a thin pantry" —
// so a leveraged partial payment empties the pantry: "You send 3,468 of
// 12,657 kcal — all the pantry holds. They count the gap; the arrears grow
// teeth." The village pays itself into the starvation band, and the floor
// belongs on the PAYMENT, not in a shield.
//
// THE LEVER: the gate never lets a tribute payment leave the pantry below
// a pantry-day floor —
//   * Game.payTribute(linkId): when the full bill would breach the floor,
//     the payment is CAPPED at the largest kcal amount whose whole-unit
//     removal provably leaves the pantry at/above the floor
//     (pantry - floor - maxUnitKcal: the engine removes indivisible units,
//     so a kcal-exact cap over-removes — "over-removal is honest, callers
//     report actuals"). The engine's own linkTick posts the shortfall as
//     arrears at the week's end. The floor holds PAYMENT; it never touches
//     debt — arrears are posted, never forgiven (sim-findings #293: cut
//     terms never forgive posted debt).
//   * Game.answerDemand(linkId, true) on a tribute-kind demand: when
//     honoring would breach the floor, the demand is REFUSED via the
//     engine's honest path (trust -15, said aloud) instead of honored
//     into starvation. A village that cannot eat cannot pay — refusal is
//     the legible, people-shaped answer.
//
// THE FLOOR (one exact number, documented): FLOOR_DAYS = 2 pantry-days on
// the engine's canonical pantry-days — Game.pantryDaysEstimate() (rolling
// 7-day net burn from village.burnHistory, pop x 2000 fallback pre-endDay).
// floorKcal = 2 x dailyBurn, same burn convention as the engine. Why 2:
//   1. It is the engine's own pantry-floor convention: the feast verb's
//      affordability floor (cost <= fresh - 2xburn) and the overdraw
//      lineage's floor. One shared line.
//   2. A tribute floor ABOVE 2d would be undermined by the feast: tribute
//      payments count toward the r13 feast contribution gate
//      (recentTribute >= 1500), and the feast drains to its 2-day floor.
//      A floor BELOW 2d is meaningless. At exactly 2d the floor is a line
//      no verb crosses.
//   3. #200's ratchet (aid->feast ratcheting fragile pantries TO the
//      2-day floor) ends AT the floor, never below it. The tribute floor
//      keeps tribute from being the verb that pushes the pantry into the
//      tipping band in the first place.
// When dailyBurn <= 0 (the pantry is holding or growing — pde 999) the
// gate never binds: there is no floor to defend.
//
// RATCHET CHECK (#199/#200 caution): the capped payment must not arm
// another verb that drains back to the floor. Capped payments REDUCE
// tribute-paid totals, so they feed the r13 feast contribution gate LESS
// than the base's full payments — the tribute->feast ratchet weakens,
// never strengthens. The sweep measures fsFeasts and starvation deaths
// armed vs control to verify (starvation guardrail is binding).
//
// Deterministic: no RNG, no Date.now — pure reads of Game.state.
// Gate-off: pure delegation (byte-identical by construction, pinned by D0).
'use strict';
const FS = require('./feastscale');

function layerOn() { return process.env.TRIBFLOOR === '1'; }

// FLOOR_DAYS: the one exact number. See the header for why 2.
const FLOOR_DAYS = 2;

function pantryKcal(Game) {
  try {
    return ((Game.state.village || {}).pantry || [])
      .reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
  } catch (e) { return 0; }
}

// dailyBurn: the engine's pantryDaysEstimate burn convention — rolling
// 7-day net from village.burnHistory, pop x 2000 fallback pre-endDay.
// <= 0 means the pantry is holding or growing: the gate never binds.
function dailyBurn(Game) {
  try {
    const v = Game.state.village || {};
    const hist = v.burnHistory || [];
    if (!hist.length) {
      const pop = ((v.roster || []).length) || 12;
      return Math.max(1, pop * 2000);
    }
    return hist.reduce((a, b) => a + b, 0) / hist.length;
  } catch (e) { return 1; }
}

function floorKcal(Game) { return FLOOR_DAYS * dailyBurn(Game); }

function billFor(Game, linkId) {
  try {
    const ls = Game.hierarchyState() || [];
    for (const l of ls) {
      if (l && l.id === linkId && l.status === 'active') return l.tributeKcalPerWeek || 0;
    }
  } catch (e) {}
  return 0;
}

function pendingTributeDemand(Game, linkId) {
  try {
    const ls = Game.hierarchyState() || [];
    for (const l of ls) {
      if (l && l.id === linkId) {
        const d = l.pendingDemand;
        return (d && d.kind === 'tribute') ? d : null;
      }
    }
  } catch (e) {}
  return null;
}

// maxUnitKcal: the indivisibility tax. The engine's _removePantryKcal takes
// WHOLE units (break-it food r3 2026-10-10: "over-removal is honest,
// callers report actuals") — a kcal-exact cap can be over-removed by up to
// one max unit. Any floor computed in kcal must budget this tax or the
// guarantee is fiction (measured: 40 floor breaches on the armed side
// before the tax).
function maxUnitKcal(Game) {
  try {
    let m = 0;
    const pantry = ((Game.state.village || {}).pantry || []);
    for (const it of pantry) {
      if (it && (it.units || 0) > 0) m = Math.max(m, it.kcalEach || 0);
    }
    return m;
  } catch (e) { return 0; }
}

// wouldBreach: would paying `bill` kcal from the current pantry leave it
// below the floor? Counts the whole-unit overshoot: the engine can remove
// up to one max unit more than the billed kcal. Exported for the sweep's
// counterfactual primary.
function wouldBreach(Game, bill) {
  try {
    const burn = dailyBurn(Game);
    if (!(burn > 0) || !(bill > 0)) return false;
    const pk = pantryKcal(Game);
    return (pk - Math.min(bill, pk) - maxUnitKcal(Game)) < floorKcal(Game);
  } catch (e) { return false; }
}

// capKcal: the largest kcal request whose whole-unit removal provably
// leaves the pantry at or above the floor. removed < cap + maxPer, so
// pkAfter = pk - removed > pk - cap - maxPer = floor. Zero when not even
// one unit can go without breaching.
function capKcal(Game) {
  try {
    return Math.max(0, pantryKcal(Game) - floorKcal(Game) - maxUnitKcal(Game));
  } catch (e) { return 0; }
}

const fmtK = (n) => Math.round(n).toLocaleString();

// gateVerbs: wrap the two tribute-payment verbs for the parent's daily.
// Returns a restore function (finally-safe).
function gateVerbs(Game, ctx) {
  const op = Game.payTribute, oa = Game.answerDemand;
  if (typeof op === 'function') {
    Game.payTribute = function (linkId, kcal) {
      try {
        const bill = (kcal == null) ? billFor(Game, linkId) : kcal;
        if (wouldBreach(Game, bill)) {
          const cap = capKcal(Game);
          ctx.tfCapped = (ctx.tfCapped || 0) + 1;
          ctx.tfCappedKcal = (ctx.tfCappedKcal || 0) + (Math.min(bill, pantryKcal(Game)) - cap);
          try {
            Game.say(`🛡️ The pantry holds about ${FLOOR_DAYS} days of food at the current burn — tribute takes ${fmtK(cap)} of ${fmtK(bill)} kcal and no more. What isn't paid rides as arrears; the village eats first.`);
          } catch (e) {}
          return op.call(this, linkId, cap);
        }
      } catch (e) {}
      return op.apply(this, arguments);
    };
  }
  if (typeof oa === 'function') {
    Game.answerDemand = function (linkId, accept) {
      try {
        if (accept) {
          const d = pendingTributeDemand(Game, linkId);
          if (d && wouldBreach(Game, d.costKcal || 0)) {
            const pk = pantryKcal(Game);
            ctx.tfDemandRefused = (ctx.tfDemandRefused || 0) + 1;
            try {
              Game.say(`🛡️ Haven's pantry holds ${fmtK(pk)} kcal — about ${(pk / Math.max(1, dailyBurn(Game))).toFixed(1)} days at the current burn. The village must eat first: the demand is refused, not from defiance but from arithmetic.`);
            } catch (e) {}
            return oa.call(this, linkId, false);
          }
        }
      } catch (e) {}
      return oa.apply(this, arguments);
    };
  }
  return () => {
    if (typeof op === 'function') Game.payTribute = op;
    if (typeof oa === 'function') Game.answerDemand = oa;
  };
}

function withTribFloor(base, id, desc) {
  return Object.assign({}, base, {
    id,
    desc,
    daily(Game, ctx) {
      if (!layerOn()) return base.daily(Game, ctx); // gate off: pure delegation
      const restore = gateVerbs(Game, ctx);
      try { return base.daily(Game, ctx); }
      finally { restore(); }
    },
  });
}

const leadfeast = withTribFloor(
  FS.leadfeast, 'leadfeast',
  'leadfeast + tribfloor (TRIBFLOOR=1): tribute payments never leave the pantry below the 2-day floor (capped payTribute, refused thin-pantry demands)'
);
const belongfeast = withTribFloor(
  FS.belongfeast, 'belongfeast',
  'belongfeast + tribfloor (TRIBFLOOR=1): tribute payments never leave the pantry below the 2-day floor (capped payTribute, refused thin-pantry demands)'
);

// The sweep imports these ids ('leadfeast', 'belongfeast'); the TRIBFLOOR
// env var is the only switch — control and armed share the same objects.
module.exports = {
  leadfeast, belongfeast, withTribFloor, layerOn,
  FLOOR_DAYS, pantryKcal, dailyBurn, floorKcal, billFor, wouldBreach,
  maxUnitKcal, capKcal,
};
