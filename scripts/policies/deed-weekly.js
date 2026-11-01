// policies/deed-weekly.js — PATROLSCHED VARIANT (measurement 2026-11-01).
//
// sim-patrolsched-b variant of deed-seeking, differing in EXACTLY ONE
// parameter: the patrol schedule. Everything else is deed-seeking
// verbatim: the competent survival base, the farthest-first patrol
// (up to 4 far wild tiles, forage on each), the 40%-of-kcal-cap gate,
// the once-per-day guard, the keepsake surge (surgeUpkeep imported,
// not copied), and NO evening return step.
//
//   deed-seeking: patrols on day % 7 in [1, 3, 5]  (3x/week)
//   deed-weekly:  patrols on day % 7 in [1]        (1x/week)
//
// The patrol body below is deedPatrol from scripts/policies/
// deed-seeking.js with only the day list changed; it is copied
// rather than parameterized because deed-seeking.js hard-codes
// [1, 3, 5] and this arm's scope is new-files-only (no edits to
// any existing policy file). If this variant ever lands, the
// honest landing is a schedule parameter on deedPatrol, not a
// second patrol implementation — this file is the measurement
// instrument, not the proposed final shape.
'use strict';
const { competent } = require('./competent');
const { surgeUpkeep } = require('./deed-seeking');

const PATROL_DAYS = [1];

function isPatrolDay(day) {
  return PATROL_DAYS.includes(day % 7);
}

function weeklyPatrol(Game, ctx) {
  try {
    if (Game.over || Game.tbfight) return;
    const s = Game.state.scholar || {};
    const day = s.day || 1;
    if (!isPatrolDay(day)) return;
    if (ctx._patrolDay === day) return; // once per day (upkeep runs 3x/day)
    ctx._patrolDay = day;
    if ((s.kcal || 0) < (Game.kcalCap ? Game.kcalCap() * 0.4 : 800)) return;
    const cands = [];
    const targets = (Game.travelTargets ? Game.travelTargets() : []) || [];
    for (const tt of targets) {
      let t = null;
      try { t = Game.tileAt(tt.x, tt.y); } catch (e) {}
      if (!t || t.type === 'haven') continue;
      cands.push({ x: tt.x, y: tt.y, d: tt.d || 0 });
    }
    cands.sort((a, b) => b.d - a.d); // far tiles first: different ground
    let visited = 0;
    for (const c of cands.slice(0, 4)) {
      if (Game.over || Game.tbfight) break;
      try { Game.travelTo(c.x, c.y); } catch (e) { break; }
      if (Game.over || Game.tbfight) break;
      visited++;
      try { Game.doAction('forage', {}); } catch (e) {}
      if (Game.over || Game.tbfight) break;
    }
    if (visited) ctx.patrols = (ctx.patrols || 0) + 1;
  } catch (e) {}
}

const deedWeekly = Object.assign({}, competent, {
  id: 'deed-weekly',
  desc: 'deed-seeking with a 1x/week patrol schedule (day%7==1 only): same competent base, same farthest-first patrol, same kcal gate, no evening return step',
  daily(Game, ctx) {
    try { competent.daily(Game, ctx); } catch (e) {}
    weeklyPatrol(Game, ctx);
    surgeUpkeep(Game, ctx);
  },
});

module.exports = { deedWeekly, weeklyPatrol, isPatrolDay, PATROL_DAYS };
