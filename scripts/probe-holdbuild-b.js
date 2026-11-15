// probe-holdbuild-b.js — DIAGNOSTIC (not a judged run): what blocks the
// engine's own upkeep tending (winPlanBondsTick) on the never-re-climbed
// seeds 100203 / 100212 after dissolution?
//
// Wraps Game.winPlanBondsTick with a pure logging wrapper (delegates to the
// original, behavior unchanged) and records, per call: day, nationalLive,
// pendingNational, pantryDaysEstimate, pantry kcal, winPlan holder count,
// own-primary links below trust 50 / below 40, and the tick's return.
// By elimination: a call with nationalLive=false, >=2 prims, pantryDays>=3,
// links below 50 present, and tended=[] means the actor gate (no
// plan-holder at Haven, or all engaged) blocked it — not the pantry gate.
//
// Usage: node scripts/probe-holdbuild-b.js [seed] [policy] [days]
// Prints a JSON summary to stdout. Writes nothing into the repo.
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { scaleclimbPolicy } = require(path.join(REPO, 'scripts', 'policies', 'competent-scaleclimb-b'));
const { answercourtPolicy } = require(path.join(REPO, 'scripts', 'policies', 'competent-answercourt-b'));

const seed = parseInt(process.argv[2] || '100203', 10);
const policyName = process.argv[3] || 'competent-answercourt-b';
const DAYS = parseInt(process.argv[4] || '150', 10);
const policy = policyName === 'competent-answercourt-b' ? answercourtPolicy : scaleclimbPolicy;

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function pantryKcal(Game) {
  try {
    return ((Game.state.village || {}).pantry || [])
      .reduce(function (t, i) { return t + (i.kcalEach || 0) * (i.units || 1); }, 0);
  } catch (e) { return 0; }
}

(async function () {
  const { Game } = await loadGame({ seed: seed, mode: 'probe-holdbuild-' + policyName, fullTelemetry: false });
  const calls = [];
  const tendCalls = [];
  let inDaily = false;
  try {
    const origTick = Game.winPlanBondsTick;
    if (typeof origTick !== 'function') { console.log(JSON.stringify({ seed: seed, error: 'winPlanBondsTick not a function' })); process.exit(2); }
    Game.winPlanBondsTick = function (hx, hy) {
      const st = Game.state || {};
      let pd = null;
      try { pd = (typeof Game.pantryDaysEstimate === 'function') ? Game.pantryDaysEstimate() : null; } catch (e) { pd = null; }
      let holders = 0;
      try { holders = Object.keys((st.village || {}).winPlan || {}).length; } catch (e) { holders = 0; }
      let prims = [];
      try {
        prims = ((typeof Game.hierarchyState === 'function') ? (Game.hierarchyState() || []) : [])
          .filter(function (l) { return l && l.status === 'active' && l.primary === 'haven'; });
      } catch (e) { prims = []; }
      const lt50 = prims.filter(function (l) { return (l.trust || 0) < 50; }).length;
      const lt40 = prims.filter(function (l) { return (l.trust || 0) < 40; }).length;
      const rec = { day: dayOf(Game), nationalLive: !!st.nationalLive, pendingNational: !!st.pendingNational,
        pantryDays: pd, pantry: pantryKcal(Game), holders: holders, prims: prims.length,
        lt50: lt50, lt40: lt40, trusts: prims.map(function (l) { return l.trust | 0; }) };
      let ret = null;
      try { ret = origTick.apply(this, arguments); } catch (e) { rec.threw = String(e.message).slice(0, 80); }
      rec.tended = (ret && ret.tended) ? ret.tended.slice() : [];
      rec.returnNull = (ret === null || ret === undefined);
      calls.push(rec);
      return ret;
    };
  } catch (e) { console.log(JSON.stringify({ seed: seed, error: 'tick-wrap: ' + String(e.message) })); process.exit(2); }
  try {
    const origTend = Game.tendLink;
    if (typeof origTend === 'function') {
      Game.tendLink = function () {
        const ret = origTend.apply(this, arguments);
        tendCalls.push({ day: dayOf(Game), caller: inDaily ? 'policy' : 'engine', linkId: arguments[0] || null, paid: ret });
        return ret;
      };
    }
  } catch (e) {}
  const recPolicy = Object.assign({}, policy, {
    daily: function (G, ctx) {
      inDaily = true;
      let r;
      try { r = policy.daily ? policy.daily(G, ctx) : undefined; } catch (e) { inDaily = false; throw e; }
      inDaily = false;
      return r;
    },
  });
  await setupGame(Game);
  let result = null;
  await quietLog(async function () {
    result = await runDays(Game, recPolicy, { days: DAYS, manifest: undefined, sampleEvery: 1 });
  });
  const st = Game.state || {};
  // Dissolution days: nationalLive transitions in the call log are sparse
  // (tick calls only); derive from tend-call days + final state instead.
  // Aggregate the elimination read over post-dissolution days: calls where
  // the tick COULD have tended (not national, prims>=2, lt50>0).
  const could = calls.filter(function (c) { return !c.nationalLive && c.prims >= 2 && c.lt50 > 0; });
  const couldTended = could.filter(function (c) { return c.tended.length > 0; });
  const couldBlockedPantry = could.filter(function (c) { return c.tended.length === 0 && (c.pantryDays == null || c.pantryDays < 3); });
  const couldBlockedActors = could.filter(function (c) { return c.tended.length === 0 && c.pantryDays != null && c.pantryDays >= 3; });
  const couldNatBlocked = calls.filter(function (c) { return c.nationalLive && c.lt50 > 0; });
  console.log(JSON.stringify({
    seed: seed, policy: policyName, days: result.days, endReason: result.endReason,
    scaleRank: (typeof Game.scaleRank === 'function') ? Game.scaleRank() : null,
    nationalLiveEnd: !!st.nationalLive,
    tickCalls: calls.length,
    tendCalls: tendCalls,
    couldHaveTendedDays: could.length,
    couldTendedDays: couldTended.length,
    couldBlockedByPantryGateDays: couldBlockedPantry.length,
    couldBlockedByActorsDays: couldBlockedActors.length,
    nationalBlockedDays: couldNatBlocked.length,
    pantryDaysRangeOnCould: could.length ? { min: Math.min.apply(null, could.map(function (c) { return (c.pantryDays == null ? 999 : c.pantryDays); })), max: Math.max.apply(null, could.map(function (c) { return (c.pantryDays == null ? 999 : c.pantryDays); })) } : null,
    holdersRangeOnCould: could.length ? { min: Math.min.apply(null, could.map(function (c) { return c.holders; })), max: Math.max.apply(null, could.map(function (c) { return c.holders; })) } : null,
    // Per-day detail for the elimination read (only days with links below 50).
    couldDays: could.map(function (c) { return { d: c.day, pd: c.pantryDays, pantry: c.pantry, holders: c.holders, prims: c.prims, lt50: c.lt50, lt40: c.lt40, trusts: c.trusts, tended: c.tended }; }),
  }, null, 2));
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
