// deadfall-b — the deadfall-duty staffing layer (scale-onramp, loop B 2026-10-31).
//
// Canon note: no canon doc covers a villager stick/fiber source duty
// (CANON.md read; see sim-deadfall-b-prereg.md). This layer invents no
// mechanic: it staffs the game-code 'deadfall' duty (game.js
// delegateTasks + resolveOneAssignment, stone-duty shape) through the
// leader's own assign verb, the way dutyfish-b.js staffs 'fish' and
// workWater staffs 'wood'/'water'. The shipped game change is the duty
// itself (staffed in real play through the delegateTasks UI); this
// layer is the sim's stand-in for a leader who staffs it.
//
// DEADFALL_B=1 arms it; unset -> pure delegation, byte-identical
// (the armed path never runs, and the unassigned duty code is inert:
// delegateTasks entries and unreachable resolve branches draw no RNG
// and touch no state). Requires FEASTSCALE_R13=1 — a loud DEADFALL
// STOP otherwise, so the arm can never silently run on the wrong
// substrate (dutyfish-b precedent).
//
// Mechanic: in policy.daily, when the scholar is at Haven, if the
// communal pile holds fewer than PILE_STICK_WANT = 6 sticks and
// fewer than WANT_DEADFALL = 2 villagers are currently assigned
// 'deadfall', top up from FREE villagers only — never pull anyone
// off an existing assignment, never the scholar, never the dead.
// Occupation-preferred (forager/lumberjack/carpenter/handyman/
// builder/farmer/gardener), deterministic roster order. Silent
// staffing: the engine's own assign line + duty return line narrate;
// this layer adds no line of its own (no narration spam by design).
// The pile threshold is Haven stash the leader can see, not a
// roster-fed "who needs what" list (perception law, Steve 2026-10-28).
'use strict';
const { leadfeast, belongfeast } = require('./feastscale');

const PILE_STICK_WANT = 6;
const WANT_DEADFALL = 2;
// PILOT FIX (sim-deadfall-b, after the first pilot run): the first
// layer walked the WHOLE free roster every day until 2 accepted — on
// low-trust days that was ~10 refusal lines in one day (one per
// candidate), which reads as the leader badgering the village. A
// leader asks a few people, not everybody: at most 3 attempts per
// day. On low-trust days staffing may simply fail that day —
// honest, and the engine's refusal lines stay at duty cadence.
const MAX_ATTEMPTS_PER_DAY = 3;
const OCC_PREF = ['forager', 'lumberjack', 'carpenter', 'handyman', 'builder', 'farmer', 'gardener'];

function layerOn() { return process.env.DEADFALL_B === '1'; }

function assertSubstrate() {
  if (layerOn() && process.env.FEASTSCALE_R13 !== '1')
    throw new Error('DEADFALL STOP: DEADFALL_B=1 requires FEASTSCALE_R13=1 (the arm can never silently run on the wrong substrate)');
}

function occOf(Game, vid) {
  try {
    const p = Game.getPerson ? Game.getPerson(vid) : null;
    return String((p && (p.occupationId || p.formerOccupation || p.occupation)) || '').toLowerCase();
  } catch (e) { return ''; }
}

function pileSticks(Game) {
  try { const st = Game.stashState ? Game.stashState() : null; return (st && st.materials && st.materials.stick) || 0; }
  catch (e) { return 0; }
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

// staffDeadfall: top up 'deadfall' assignments to WANT_DEADFALL from
// free villagers, occupation-preferred. Returns the number actually
// staffed (assignTask {ok:true} only — refusals do not count).
function staffDeadfall(Game) {
  const v = Game.state.village || {};
  const asg = v.assignments || {};
  let have = 0;
  for (const a of Object.values(asg)) if (a && a.task === 'deadfall') have++;
  if (have >= WANT_DEADFALL) return 0;
  if (pileSticks(Game) >= PILE_STICK_WANT) return 0;
  const free = freeVillagers(Game);
  free.sort((a, b) => {
    const pa = OCC_PREF.findIndex(o => occOf(Game, a).indexOf(o) >= 0);
    const pb = OCC_PREF.findIndex(o => occOf(Game, b).indexOf(o) >= 0);
    return (pa < 0 ? 99 : pa) - (pb < 0 ? 99 : pb); // stable: ties keep roster order
  });
  let staffed = 0, attempts = 0;
  for (const id of free) {
    if (have + staffed >= WANT_DEADFALL) break;
    if (attempts >= MAX_ATTEMPTS_PER_DAY) break;
    attempts++;
    try {
      const r = Game.assignTask(id, 'deadfall', { via: 'in-person' });
      if (r && r.ok) staffed++;
    } catch (e) {}
  }
  return staffed;
}

function withDeadfall(base, id, desc) {
  return Object.assign({}, base, {
    id,
    desc,
    daily(Game, ctx) {
      const armed = layerOn();
      if (armed) assertSubstrate();
      // Staff BEFORE base.daily: the assignment must exist before the
      // day's resolutions, and the pile reading is the leader's
      // decision-time reading (dutyfish-b D2 convention).
      let staffed = 0;
      if (armed) {
        try { if (Game.playerAtHaven && Game.playerAtHaven()) staffed = staffDeadfall(Game); } catch (e) {}
      }
      const r = base.daily(Game, ctx);
      if (ctx) ctx.deadfallStaffed = (ctx.deadfallStaffed || 0) + staffed;
      return r;
    },
  });
}

module.exports = { layerOn, assertSubstrate, staffDeadfall, pileSticks, freeVillagers, withDeadfall, PILE_STICK_WANT, WANT_DEADFALL, MAX_ATTEMPTS_PER_DAY, leadfeast, belongfeast };
