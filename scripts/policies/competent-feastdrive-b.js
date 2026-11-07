// competent-feastdrive-b — the feast drive (arm sim-feastdrive-b,
// run fleshout-loop-b-20261107T1049Z, axis scale-onramp / winnability
// chain).
//
// POLICY-SIDE ONLY. ZERO src/js changes, zero default flips, no
// changes to any existing policy file. Composes onto the FROZEN
// staged substrate (scripts/policies/competent-stageally-a.js,
// unmodified). Prereg v2 freezes this composition.
//
// THE BLANK (diag, prereg v1.1): on band 53001–53008 the devotion
// arms on day 14–25 on all 8 seeds (surgeResonance 99–318 vs 35
// needed) — arming is NOT the blocker — but the feast surge is
// spent on 1/8 seeds. The dusk probe (454 armed dusks, 5 seeds)
// names the blocker: competent's EAT FIRST gate (recent gives ≥
// 1500 kcal/week) is never met — recent gives are 0 on essentially
// every armed dusk (median 0, max 1340). The scholar donates
// ~nothing because the base donateHaul keeps a 2400-kcal personal
// buffer and the daily identified surplus rarely exceeds it. The
// chain works end-to-end when it runs (53005: arm d16 → feast d20
// → grant → draw → face → spend the same day).
//
// WHAT IT CHANGES (all of it, nothing hidden):
//   - daily hook, AFTER staged.daily: DONATE-DOWN. When the
//     devotion is armed AND no feast buff is live AND recent gives
//     (7d) < 1500, donate identified surplus down to a keep of
//     0.5 × kcalCap (vs the base 2400) through the engine verb
//     Game.donateToPantry — the same readiness rules as the base
//     donateSurplus (identified, edible, safe, unspoiled). Skipped
//     when the scholar's own kcal < 0.5 × cap (eat first, honestly)
//     and when the gate is already met. Once gives reach 1500/week
//     the base keep applies again.
//   - upkeep hook, AFTER staged.upkeep: FEAST-AT-DUSK. At dusk, if
//     armed AND no live buff AND no reactor online AND feastPlan
//     ok AND have ≥ cost × 1.5 AND recent gives (7d) ≥ 1500 AND no
//     feast today → hostFeast(). No 7-day cadence: the base cadence
//     is the other half of the never-feast (a 2-dawn window with a
//     7-day cadence leaves most fights unbuffed); the no-live-buff
//     check is the cadence.
//   - Fight side: inherited, unchanged — rally + competent fight +
//     feastFightRoad (faces the draw, patrols while feasted); the
//     harness faces any pending draw. 53005 proves face → spend
//     works through the existing path.
// WHAT IT DOES NOT DO (stated so the census cannot be misread):
//   - No EAT FIRST bypass: the gate stays; the drive meets it by
//     giving, not by skipping it.
//   - No feast while the reactor hums (the grant is refused by
//     design — feasting then wastes pantry) and no feast while a
//     buff is live (a refresh draws nothing and wastes pantry).
//   - No channel change: arming already works (day 14–25).
//   - No roster, no kill log, no snapshot: arming, gives, plan,
//     buff, and haven are all scholar-knowable state. The policy
//     NEVER reads the kill log — pinned by a proof test with a
//     poisoned log.
//
// COUNTERS: per-run ctx counters (fd*) plus module-level stats
// (resetFeastdriveStats / feastdriveStats) so the driver can capture
// per-seed numbers without reaching into harness ctx.
'use strict';
const base = require('./competent-stageally-a');
const staged = base.stagedPolicy;
const COMP = require('./competent');
const recentGives = COMP.recentGives;

const FEAST_GIVES_NEED = 1500;
const FEAST_KEEP_FRAC = 0.5;
const FEAST_BUFFER = 1.5;

const STATS = { donateDownDays: 0, donateAttempts: 0, donatedKcal: 0,
  donateRefusals: 0, donateErrors: 0, feastAttempts: 0, feastsHosted: 0,
  feastSkips: {}, errors: 0, events: [] };
function resetFeastdriveStats() {
  STATS.donateDownDays = 0; STATS.donateAttempts = 0; STATS.donatedKcal = 0;
  STATS.donateRefusals = 0; STATS.donateErrors = 0; STATS.feastAttempts = 0;
  STATS.feastsHosted = 0; STATS.feastSkips = {}; STATS.errors = 0;
  STATS.events = [];
}
function feastdriveStats() { return JSON.parse(JSON.stringify(STATS)); }
function noteErr(where, e) {
  try {
    STATS.errors += 1;
    if (STATS.events.length < 200) STATS.events.push({ day: -1, what: 'error:' + where, detail: String((e && e.message) || e).slice(0, 120) });
  } catch (e2) {}
}
function skip(reason) {
  try { STATS.feastSkips[reason] = (STATS.feastSkips[reason] || 0) + 1; } catch (e) {}
}

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function scholarOf(Game) { try { return (Game.state || {}).scholar || {}; } catch (e) { return {}; } }
function progOf(Game) { try { return ((Game.state || {}).scholar || {}).prog || {}; } catch (e) { return {}; } }
function kcalCap(Game) {
  try { const c = (typeof Game.kcalCap === 'function') ? Game.kcalCap() : 2400; return (Number.isFinite(c) && c > 0) ? c : 2400; } catch (e) { return 2400; }
}
function armed(Game) {
  try { const a = progOf(Game).feastSurge; return !!a && a !== false; } catch (e) { return false; }
}
// Buff liveness from RAW state (day < untilDay) — never feastedActive(),
// which self-cleans, fires the fade line, and clears the pending draw.
function buffLive(Game) {
  try {
    const s = scholarOf(Game);
    const b = s.feastBuff || null;
    return !!(b && (s.day || 0) < (b.untilDay || 0));
  } catch (e) { return false; }
}
function reactorOnline(Game) {
  try { return (typeof Game.fusionReactorOnline === 'function') ? !!Game.fusionReactorOnline() : false; } catch (e) { return false; }
}
function atHaven(Game) {
  try { return (typeof Game.playerAtHaven === 'function') ? !!Game.playerAtHaven() : false; } catch (e) { return false; }
}

// Donation readiness — the base donateSurplus's rule, verbatim in
// effect (scripts/policies/competent.js donationFoodReady): identified
// edible food, safe, not needing cooking, not in shell, no disease /
// poison / parasite risk, not spoiled, not bonded.
function donationFoodReady(Game, it) {
  try {
    return !!it && Number.isFinite(it.kcalEach) && it.kcalEach > 0 &&
      Number.isFinite(it.units == null ? 1 : it.units) && (it.units == null ? 1 : it.units) > 0 &&
      !it.bonded && it.edible !== false && it.safe !== false && !it.needsCooking &&
      it.foodState !== 'in_shell' && !it.diseaseRisk && !it.poisonRisk &&
      !it.parasiteRisk && !(typeof Game.isSpoiled === 'function' && Game.isSpoiled(it));
  } catch (e) { return false; }
}

// donateDownToKeep(Game, ctx, keepKcal): donate identified surplus
// above keepKcal through the engine verb, mirroring the base
// donateSurplus loop (same pantry-cap room check, same
// pantryDonationOptions cap, same gives-ledger verification).
// Returns { transferred, kcal, refusals } — never throws.
function donateDownToKeep(Game, ctx, keepKcal) {
  const out = { transferred: 0, kcal: 0, refusals: 0 };
  try {
    if (typeof Game.donateToPantry !== 'function') return out;
    if (Game.havenStoresAccess && Game.havenStoresAccess() === 'none') return out;
    const s = scholarOf(Game);
    const inv = s.inventory || [];
    if (!Number.isFinite(keepKcal) || keepKcal < 0) return out;
    for (let i = inv.length - 1; i >= 0; i--) {
      const it = inv[i];
      if (!donationFoodReady(Game, it)) continue;
      const have = (it.units == null ? 1 : it.units);
      let available = 0;
      try {
        available = inv.reduce(function (n, item) {
          return n + (donationFoodReady(Game, item) ? item.kcalEach * (item.units == null ? 1 : item.units) : 0);
        }, 0);
      } catch (e) { continue; }
      let room = Infinity;
      try { room = Game.pantryCapKcal() - Game.pantryKcal(); } catch (e) { room = Infinity; }
      if (!Number.isFinite(room)) continue;
      let amount = have;
      if (typeof Game.pantryDonationOptions === 'function') {
        let choice = null;
        try { choice = Game.pantryDonationOptions(i); } catch (e) { choice = null; }
        if (!choice || !choice.ok) continue;
        amount = Math.min(have, choice.maxUnits, Math.floor(Math.max(0, available - keepKcal) / it.kcalEach));
        if (!Number.isSafeInteger(amount) || amount <= 0) continue;
      } else if (available - have * it.kcalEach < keepKcal || room < have * it.kcalEach) {
        continue;
      }
      const kcal = it.kcalEach * amount;
      const vid = Game.villagerId;
      const before = (((Game.state || {}).village || {}).gives || {})[vid] || 0;
      try { ctx.fdDonationAttempts = (ctx.fdDonationAttempts || 0) + 1; } catch (e) {}
      STATS.donateAttempts += 1;
      try { Game.donateToPantry(i, amount); } catch (e) { STATS.donateErrors += 1; noteErr('donateToPantry', e); continue; }
      let credited = 0;
      try { credited = ((((Game.state || {}).village || {}).gives || {})[vid] || 0) - before; } catch (e) {}
      const moved = have - ((inv.includes(it) ? (it.units == null ? 1 : it.units) : 0));
      if (moved === amount && Math.abs(credited - kcal) < 1e-6) {
        out.transferred += 1; out.kcal += credited;
        STATS.donatedKcal += credited;
        try { ctx.fdDonatedKcal = (ctx.fdDonatedKcal || 0) + credited; } catch (e) {}
      } else if (moved === 0 && credited === 0) {
        out.refusals += 1; STATS.donateRefusals += 1;
      } else {
        STATS.donateErrors += 1;
        noteErr('donate-ledger', new Error('Donation removal and gift credit disagree'));
      }
    }
  } catch (e) { STATS.donateErrors += 1; noteErr('donateDown', e); }
  return out;
}

// DONATE-DOWN (daily, after staged.daily): when the devotion is
// armed and no buff is live, give the surplus above a feast-week
// keep so the EAT FIRST gate can open. The base keep (2400) leaves
// the scholar giving ~0/week on this band; the feast keep (half a
// day's food in the pack) turns the same hauls into real gives.
function donateStep(Game, ctx) {
  try {
    if (!armed(Game)) return;
    if (buffLive(Game)) return;
    const s = scholarOf(Game);
    const cap = kcalCap(Game);
    if ((s.kcal || 0) < cap * 0.5) return; // eat first, honestly
    if (!atHaven(Game)) return;
    let rg = 0;
    try { rg = recentGives(Game, ctx, 7); } catch (e) { rg = 0; }
    if (rg >= FEAST_GIVES_NEED) return; // gate already met — base keep applies
    const keep = Math.round(cap * FEAST_KEEP_FRAC);
    const before = STATS.donatedKcal;
    const res = donateDownToKeep(Game, ctx, keep);
    if (res.transferred > 0) {
      STATS.donateDownDays += 1;
      try { ctx.fdDonateDownDays = (ctx.fdDonateDownDays || 0) + 1; } catch (e) {}
      if (STATS.events.length < 200) {
        STATS.events.push({ day: dayOf(Game), what: 'donate-down', detail: 'gave ' + (STATS.donatedKcal - before) + ' kcal in ' + res.transferred + ' transfer(s), keep ' + keep });
      }
    }
  } catch (e) { noteErr('donateStep', e); }
}

// FEAST-AT-DUSK (upkeep, after staged.upkeep): at dusk, when armed
// and unbuffed, the pantry can carry it and the week's giving opens
// the gate — light the fire. The no-live-buff check is the cadence.
function feastStep(Game, ctx) {
  try {
    if (Game.dayPart !== 2) return;
    const s = scholarOf(Game);
    const day = s.day || 0;
    if (s.feastDay === day) return; // already feasted today (base or mine)
    if (!armed(Game)) return;
    if (buffLive(Game)) { skip('buff-live'); return; }
    if (reactorOnline(Game)) { skip('reactor'); return; }
    if (!atHaven(Game)) { skip('away'); return; }
    let rg = 0;
    try { rg = recentGives(Game, ctx, 7); } catch (e) { rg = 0; }
    if (rg < FEAST_GIVES_NEED) { skip('gives-short'); return; }
    let plan = null;
    try { plan = (typeof Game.feastPlan === 'function') ? Game.feastPlan() : null; } catch (e) { plan = null; }
    if (!plan || !plan.ok) { skip('plan'); return; }
    if (plan.have < plan.cost * FEAST_BUFFER) { skip('thin'); return; }
    STATS.feastAttempts += 1;
    let rep = null;
    try { rep = Game.hostFeast(); } catch (e) { noteErr('hostFeast', e); return; }
    if (rep && rep.ok) {
      STATS.feastsHosted += 1;
      try { ctx.fdFeasts = (ctx.fdFeasts || 0) + 1; } catch (e) {}
      if (STATS.events.length < 200) {
        STATS.events.push({ day: day, what: 'feast', detail: 'hosted armed feast, cost ' + (plan.cost | 0) + ', have ' + (plan.have | 0) });
      }
    } else {
      skip('host-refused');
      if (STATS.events.length < 200) {
        STATS.events.push({ day: day, what: 'feast-refused', detail: String((rep && rep.why) || 'no reason').slice(0, 120) });
      }
    }
  } catch (e) { noteErr('feastStep', e); }
}

const feastdrive = Object.assign({}, staged, {
  id: 'competent-feastdrive-b',
  desc: 'competent-stageally-a + feast drive: donate surplus down to a feast-week keep when armed, feast at dusk when armed and the giving gate is met (policy-side probe only)',
  daily(Game, ctx) {
    try { staged.daily(Game, ctx); } catch (e) { noteErr('daily-base', e); }
    donateStep(Game, ctx);
  },
  upkeep(Game, ctx) {
    try { if (typeof staged.upkeep === 'function') staged.upkeep(Game, ctx); } catch (e) { noteErr('upkeep-base', e); }
    feastStep(Game, ctx);
  },
});

module.exports = { feastdrive: feastdrive,
  resetFeastdriveStats: resetFeastdriveStats, feastdriveStats: feastdriveStats,
  donateDownToKeep: donateDownToKeep, recentGivesFeastdrive: recentGives,
  buffLive: buffLive, armed: armed,
  FEAST_GIVES_NEED: FEAST_GIVES_NEED, FEAST_KEEP_FRAC: FEAST_KEEP_FRAC,
  FEAST_BUFFER: FEAST_BUFFER };
