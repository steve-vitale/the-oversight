// competent-tbretreat-b — TB retreat-and-refind policy driver
// (arm sim-tbretreat-b, Loop B run fleshout-loop-b-20261105T1423Z,
// axis scale-onramp / winnability chain).
//
// POLICY-SIDE DRIVER ONLY. This file re-exports
// flee-when-losing.js VERBATIM — the frozen 50/50 trigger from
// sim-staypolicy-a (Loop A, 2026-11-05, 17/17 corpus firings on the
// line): scholar HP fraction < 0.50 AND live wave-4 monsters'
// remaining HP fraction > 0.50, nearest-edge barrier exit, stuck /
// sealed guards unchanged. NO trigger tuning: the earlier-line
// variant is staypolicy-a's named follow-up, not this arm's.
//
// The arm's lever lives in src/js/game.js behind the default-OFF
// TBRETREAT_RESTORE=1 flag (tbRetreatOrigin record + tbEnd restore
// of a withdrawn-from wave-4+ wild tile monster at its wounded HP).
// This driver is only the retreat DECISION — the same decision
// staypolicy-a measured — so the armed leg is identical to
// staypolicy-a's armed leg except the flag, and the delta against
// its published armed numbers isolates the restore.
//
// The monster never flees (Steve 2026-11-02): only the fighter
// withdraws. No gate/price/deed/readiness/XP/gear change, no
// competent.js change, no fleerepair file touched.
'use strict';
const swl = require('./flee-when-losing');

module.exports = {
  tbRetreat: swl.fleeWhenLosing,
  competent: swl.fleeWhenLosing,
  competentEat: swl.competentEat,
  resetStayStats: swl.resetStayStats,
  stayStats: swl.stayStats,
  SWL_SCHOLAR_HP: swl.SWL_SCHOLAR_HP,
  SWL_MONSTER_HP: swl.SWL_MONSTER_HP,
  SWL_STUCK_TURNS: swl.SWL_STUCK_TURNS,
  fightWaves: swl.fightWaves,
  monsterHpFrac: swl.monsterHpFrac,
  disengageStep: swl.disengageStep,
};
