// competent-retention-killerdeath-b.js — retention probe policy (arm
// sim-killerdeath-b, run fleshout-loop-b-20261105T0330Z). POLICY-SIDE ONLY,
// zero src/js. Competent verbatim EXCEPT on retention days: when the current
// scholar (Game.villagerId) is a fresh wave-4+ killer — a wave-4+ entry in
// state.waveKillLog by the scholar with 0 < (today - killDay) <= 30 — the
// day's outward legs are replaced by a haven day. Everything else
// (upkeep, fights, contests via harness fallback) is competent verbatim.
//
// HAVEN DAY (retention days only), each step try/catch-guarded, errors
// counted in ctx.retentionErrors, never thrown:
//   walk home if away (walkHome, haven coords DIR_FLEE_HAVEN), sortHaul,
//   armUp, keepKnife, donateHaul, talkRound, keepPromises, competentEat.
// SKIPPED on retention days (the outward legs of competent.daily):
//   stoneRun, forageTripSeedFirst, counterPlay, vinebank blind band,
//   workTrapline, lootCorpses, deepTalk, teachRound, answerAidBeats,
//   doorstepStep, goHomeStanding (subsumed by the walk-home step).
// NOT suppressed by this wrapper (stated limits, not oversights):
//   - upkeep runs verbatim 3x/day (eat/drink/gear/feasts/aid). The driver
//     sets COMPETENT_SEEK_FIGHTS=0 during probe runs, which makes
//     feastFightRoad return immediately (its own env gate) — so no feast
//     patrol sweeps to far tiles. Facing a feast draw at the haven's edge
//     (faceFeastDraw) still runs: that is home defense, not an outing.
//   - fights: competent.fight verbatim. A fight that starts at home (a
//     pending encounter on the haven tile, a feast draw, a lingerer
//     defense) is fought normally — retention removes EXPOSURE, not skill.
//   - pending encounters: competent defines no pending() hook, so the
//     harness fallback (startCombat) still faces them, home or wild.
//   - contests: harness-driven (contestChoose fallback), unavoidable by
//     design (contest interruption principle) — outside the probe.
//   - NPC killers: the engine's villager agency (expeditions, field
//     fights) is autonomous; no policy hook holds an NPC back. The probe
//     covers scholar-killers only. An NPC fresh killer stays exposed.
//   - lingerer sorties: competent never answers lingerer beats in sims
//     (no answerLingerer call site in the policy), so sorties are outside
//     both arms equally.
'use strict';
const C = require('./competent');
const competent = C.competent;

const WINDOW_DAYS = 30;

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

function latestKillDay(Game) {
  try {
    const log = ((Game.state || {}).waveKillLog) || [];
    const sid = Game.villagerId;
    let latest = null;
    log.forEach(function (e) {
      if (e && e.by === sid && ((e.w | 0) >= 4)) {
        if (latest == null || (e.d | 0) > latest) latest = (e.d | 0);
      }
    });
    return latest;
  } catch (e) { return null; }
}

function retentionActive(Game) {
  const latest = latestKillDay(Game);
  if (latest == null) return false;
  const gap = dayOf(Game) - latest;
  return gap > 0 && gap <= WINDOW_DAYS;
}

function havenDay(Game, ctx) {
  const steps = [
    ['walkHome', function () {
      try {
        if (typeof Game.playerAtHaven === 'function' && Game.playerAtHaven()) return;
        C.walkHome(Game, C.DIR_FLEE_HAVEN.x, C.DIR_FLEE_HAVEN.y);
      } catch (e) { throw e; }
    }],
    ['sortHaul', function () { C.sortHaul(Game, ctx); }],
    ['armUp', function () { C.armUp(Game, ctx); }],
    ['keepKnife', function () { C.keepKnife(Game, ctx); }],
    ['donateHaul', function () { C.donateHaul(Game, ctx); }],
    ['talkRound', function () { C.talkRound(Game, ctx); }],
    ['keepPromises', function () { C.keepPromises(Game, ctx); }],
    ['competentEat', function () { C.competentEat(Game); }],
  ];
  steps.forEach(function (pair) {
    try { pair[1](); } catch (e) {
      ctx.retentionErrors = ctx.retentionErrors || [];
      if (ctx.retentionErrors.length < 20) ctx.retentionErrors.push(pair[0] + ': ' + String(e && e.message).slice(0, 80));
    }
  });
}

const retention = Object.assign({}, competent, {
  id: 'competent-retention-killerdeath-b',
  desc: 'competent + 30d haven retention for fresh scholar wave-4 killers',
  daily: function (Game, ctx) {
    if (retentionActive(Game)) {
      ctx.retentionDays = (ctx.retentionDays || 0) + 1;
      ctx.retentionActiveDays = ctx.retentionActiveDays || [];
      if (ctx.retentionActiveDays.length < 400) ctx.retentionActiveDays.push(dayOf(Game));
      havenDay(Game, ctx);
      return;
    }
    return competent.daily(Game, ctx);
  },
});

module.exports = { retention: retention, retentionActive: retentionActive, latestKillDay: latestKillDay, WINDOW_DAYS: WINDOW_DAYS };
