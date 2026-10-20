// dutyfish-b — the duty_fish scale-up arm (food-economy, loop B 2026-10-20).
//
// Canon note: no fishing canon doc exists (CANON.md + PRESERVATION.md read;
// fishing is a tool-action like any duty — the lever plays with ASSIGNMENT
// breadth, not the fishing mechanic, so no canon is invented).
//
// The sim-prodrebound-b DIAG (evidence/2026-10-20/sim-prodrebound-b.md,
// DIAG-GO f3b91aa85) measured duty_fish as the ONE lean-responsive inflow
// channel: lean 371 vs fat 12 kcal/day = 31.46x, fires on 42.3% of lean days,
// ~879 kcal/day when firing — driven by the PRODTHROTTLE disengage leg
// (game.js prodThrottleEngaged() = pantryFreshDays() > 4; duty
// forage/garden/fish fire through when <= 4). The sharelean kill
// (evidence/2026-10-20/sim-sharelean-b.md, findings #691) proved the lean
// collapse is a PRODUCTION blank, not a sharing blank: there is no hidden
// trust-hoard to unlock (crisis sharing already opens the gate). This arm is
// the DIAG's second candidate: widen fish-duty assignment when lean — more
// villagers on the nets on the days the engine already lets them fire.
//
// Policy-side, zero src/js. Wraps feastscale's leadfeast/belongfeast.
// DUTYFISH_B=1 arms it; unset -> pure delegation, byte-identical (pinned by
// the proof's RED phase). Requires FEASTSCALE_R13=1 — a loud DUTYFISH STOP
// otherwise, so the arm can never silently run on the wrong substrate
// (sharelean D2 precedent).
//
// Mechanic: in policy.daily (evening posture, before sleep — the sharelean D1
// convention), if Game.pantryFreshDays() <= 4 (the PRODTHROTTLE threshold),
// top up 'fish' assignments to WANT_FISHERS=5 total from FREE villagers
// only — never re-tasks hunt/patrol/cook/water/wood/stone/garden/...
// (defense, cooking, and the throttle's own alt-work keep their people;
// the widening is ADDITIVE labor). Occupation-preferred
// (fisherman/fishing guide/sailor/hunter/cook/forager), deterministic roster
// order. One deduped say line per lean day when >=1 fisher was actually
// staffed (no silent actions, no spam).
//
// THROTTLE STACK: prodThrottleEngaged() is literally pantryFreshDays() > 4,
// so our <= 4 gate is its disengage leg — the extra duties fire through as
// fish, never as alt-tasks. The arm stacks on the engine's disengage leg,
// never fights it. (If hungryStreak >= 3 the hunger-exempt leg keeps them
// through as well.)
//
// WATER-ACCESS CAP: none coded — the engine resolves fishing honestly
// (a fished-out creek says so; stock regrows at the ecology's pace).
// Overfishing is measured, not fought.
'use strict';
const { leadfeast, belongfeast } = require('./feastscale');

// == PRODTHROTTLE's threshold by construction (game.js prodThrottleEngaged) ==
const LEAN_THRESHOLD = 4;
// base competent staffs at most 3 fishers (pantryKcal < 15000); the widening
const WANT_FISHERS = 5;
const OCC_PREF = ['fisherman', 'fishing guide', 'sailor', 'hunter', 'cook', 'forager'];

function layerOn() { return process.env.DUTYFISH_B === '1'; }

function assertSubstrate() {
  if (layerOn() && process.env.FEASTSCALE_R13 !== '1')
    throw new Error('DUTYFISH STOP: DUTYFISH_B=1 requires FEASTSCALE_R13=1 (the arm can never silently run on the wrong substrate)');
}

function occOf(Game, vid) {
  try {
    const p = Game.getPerson ? Game.getPerson(vid) : null;
    return String((p && (p.occupationId || p.formerOccupation || p.occupation)) || '').toLowerCase();
  } catch (e) { return ''; }
}

function freeVillagers(Game) {
  const v = Game.state.village || {};
  const asg = v.assignments || {};
  const out = [];
  for (const id of (v.roster || [])) {
    if (id === Game.villagerId) continue;
    if (asg[id]) continue; // never pull anyone off an existing assignment
    try { const p = Game.getPerson(id); if (!p || p.dead) continue; } catch (e) { continue; }
    out.push(id);
  }
  return out;
}

// widenFish: top up 'fish' to WANT_FISHERS from free villagers, occupation-
// preferred, deterministic. Returns the number actually staffed.
function widenFish(Game) {
  const v = Game.state.village || {};
  const asg = v.assignments || {};
  let have = 0;
  for (const a of Object.values(asg)) if (a && a.task === 'fish') have++;
  if (have >= WANT_FISHERS) return 0;
  const free = freeVillagers(Game);
  free.sort((a, b) => {
    const pa = OCC_PREF.findIndex(o => occOf(Game, a).indexOf(o) >= 0);
    const pb = OCC_PREF.findIndex(o => occOf(Game, b).indexOf(o) >= 0);
    return (pa < 0 ? 99 : pa) - (pb < 0 ? 99 : pb); // stable: ties keep roster order
  });
  let staffed = 0;
  for (const id of free) {
    if (have + staffed >= WANT_FISHERS) break;
    try {
      // NOTE: assignTask returns a truthy {ok:false, refused:true} on
      // refusal — count ONLY real ok assignments.
      const r = Game.assignTask(id, 'fish', { via: 'in-person' });
      if (r && r.ok) staffed++;
    } catch (e) {}
  }
  return staffed;
}

function withDutyFish(base, id, desc) {
  return Object.assign({}, base, {
    id,
    desc,
    daily(Game, ctx) {
      // gate-off: the armed path never runs; assert AFTER the gate so an
      // unset DUTYFISH_B is pure delegation even without FEASTSCALE_R13.
      const armed = layerOn();
      if (armed) assertSubstrate(); // loud stop on wrong substrate
      // LEAN POSTURE (dutyfish-b D2): read BEFORE base.daily runs. The base
      // policy's evening routine donates the scholar's haul into the pantry,
      // so a post-base reading is the fed posture, not the lean one. The
      // leader's call is made on the thin pantry they actually see; the
      // voice line reports the decision-time reading (same value).
      let lean = false, leanReading = 0;
      if (armed) {
        try { leanReading = Game.pantryFreshDays(); lean = leanReading <= LEAN_THRESHOLD; }
        catch (e) { lean = false; }
        ctx._dfLeanDay = lean;
      }
      const r = base.daily(Game, ctx);
      if (!armed) return r; // gate off: pure delegation, byte-identical
      try {
        if (lean) {
          const n = widenFish(Game);
          if (n > 0) {
            ctx._dfStaffed = (ctx._dfStaffed || 0) + n;
            ctx._dfStaffDays = (ctx._dfStaffDays || 0) + 1;
            // stack proof: the throttle should NOT be redirecting on our days
            try { if (Game.prodThrottleEngaged && Game.prodThrottleEngaged()) ctx._dfThrottleHit = (ctx._dfThrottleHit || 0) + 1; } catch (e) {}
            const day = (Game.state.scholar || {}).day || 0;
            if (ctx._dfVoiceDay !== day) {
              ctx._dfVoiceDay = day;
              const fd = Math.round(leanReading);
              try {
                Game.say(`\u{1F3A3} The pantry is thin (~${fd} day${fd === 1 ? '' : 's'} of fresh left). The creek crew doubles up — ${n} more ${n === 1 ? 'hand' : 'hands'} to the nets. What the water gives, the village keeps.`);
              } catch (e) {}
            }
          }
        }
      } catch (e) {}
      return r;
    },
  });
}

const leaddutyfish = withDutyFish(
  leadfeast, 'leaddutyfish',
  'leadfeast + dutyfish-b widening (DUTYFISH_B=1): more fishers on lean days'
);
const belongdutyfish = withDutyFish(
  belongfeast, 'belongdutyfish',
  'belongfeast + dutyfish-b widening (DUTYFISH_B=1): more fishers on lean days'
);

module.exports = { leaddutyfish, belongdutyfish, withDutyFish, layerOn, widenFish, freeVillagers, LEAN_THRESHOLD, WANT_FISHERS };
