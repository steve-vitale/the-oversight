// Preserved original creekpath Arm C standing-go-home variant (killed at pilot).
// Source: sim-creekpath-armc-b worktree, scripts/policies/competent.js (uncommitted variant).
// Live rule on master is the RETRY (d122dcdda); this original differs ONLY by the atHaven guard.
// Historical evidence only — do NOT land as a policy change without a new prereg.

// STANDING GO-HOME (creekpath Arm C, gate COMPETENT_STANDING_HOME=1,
// default off): Arm B proved trips home detour, but the policy had NO
// standing "go home" rule — a villager who ends the day away (no trip
// fired, trip returned to an away origin, trip return failed) simply stays
// away, even starving with a clear hop home (10772 day 11). This step runs
// at the END of daily(): still away from haven -> walk home via walkHome
// (Arm B's detour HOW, this step's WHEN). Guards: already home (tile or
// playerAtHaven) -> skip; game over / combat -> skip; inside a tent (a
// deliberate camp) -> skip; haven tile not on this board (player traveled
// to another node) -> skip. Perception-lawful: own tile, home haven
// (lived in), engine-offered adjacent steps only. Banks ctx counters the
// census reads (standingHomeDays, standingHomeDetours).
function standingHomeOn() { return process.env.COMPETENT_STANDING_HOME === '1'; }
function goHomeStanding(Game, ctx) {
  try {
    if (!standingHomeOn()) return 0;
    if (!Game || Game.over || Game.tbfight) return 0;
    const v = (Game.state || {}).village || {};
    const hx = (v.px === undefined ? 4 : v.px), hy = (v.py === undefined ? 4 : v.py);
    if (Game.map && Game.map.px === hx && Game.map.py === hy) return 0;
    let atHaven = false;
    try { atHaven = !!(Game.playerAtHaven && Game.playerAtHaven()); } catch (e) { atHaven = false; }
    if (atHaven) return 0;
    const s = (Game.state || {}).scholar || {};
    if (s.insideTent) return 0;
    let ht = null;
    try { ht = Game.tileAt(hx, hy); } catch (e) { return 0; }
    if (!ht || ht.type !== 'haven') return 0;
    const d = walkHome(Game, hx, hy);
    if (ctx) { ctx.standingHomeDays = (ctx.standingHomeDays || 0) + 1; ctx.standingHomeDetours = (ctx.standingHomeDetours || 0) + d; }
    return d;
  } catch (e) { return 0; }
}
