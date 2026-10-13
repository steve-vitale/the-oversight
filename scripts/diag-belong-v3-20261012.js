#!/usr/bin/env node
// diag-belong-v3-20261012.js — DIAGNOSIS tool for BELONG v3 (policy-side only).
// Runs one seed with belongseek (v2 baseline, BELONG_V3 off) and records the
// judgeLink decomposition of EVERY proposal: score, the input components
// (base, rep standing, opinion/2, subordinate bonus, generosity bonus, noise),
// and the outcome. Used to explain seeds 606/707's decline spiral.
//
// Usage: node scripts/diag-belong-v3-20261012.js 606
//        SEEDS="303,606,707,101" node scripts/diag-belong-v3-20261012.js
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { belongseek } = require('./policies/belongseek');

const SEEDS = (process.env.SEEDS || (process.argv[2] || '606'))
  .split(',').map(s => Number(s.trim())).filter(Boolean);
const DAYS = parseInt(process.env.DAYS || '150', 10);

async function oneRun(seed) {
  process.env.BELONG_V3 = '0';
  const { Game } = await loadGame({ seed, mode: 'belong-diag' });
  await setupGame(Game);
  const evts = [];
  const dayOf = () => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };

  const origJudge = Game.judgeLink;
  if (typeof origJudge === 'function') {
    Game.judgeLink = function (targetId, opts) {
      const j = origJudge.apply(this, arguments);
      try {
        const ov = (Game.state.otherVillages || []).find(v => v && v.id === targetId);
        const opinion = ov ? (ov.opinion || 0) : 0;
        let repS = 0, repName = '?';
        try {
          const rep = Game.representative ? Game.representative() : null;
          repName = rep ? (Game.displayName ? String(Game.displayName(rep.id)).split(' ')[0] : '?') : 'none';
          repS = Game.linkStanding ? Game.linkStanding(rep.id) : 0;
        } catch (e) {}
        let ourS = 0, theirS = 0;
        try { ourS = Game.regionalStanding(); theirS = Game.villageStandingOf(targetId); } catch (e) {}
        evts.push({
          day: dayOf(), kind: 'judge', target: targetId,
          score: j.score, reasons: j.reasons,
          opinion, repName, repS, ourS, theirS,
          opts: { asSubordinate: !!(opts && opts.asSubordinate), trib: (opts && opts.tributeKcalPerWeek) || 0 },
          pantry: (() => { try { return ((Game.state.village || {}).pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0); } catch (e) { return 0; } })(),
        });
      } catch (e) {}
      return j;
    };
  }
  const origPropose = Game.proposeLink;
  if (typeof origPropose === 'function') {
    Game.proposeLink = function (targetId, opts) {
      const r = origPropose.apply(this, arguments);
      try {
        const ov = (Game.state.otherVillages || []).find(v => v && v.id === targetId);
        evts.push({ day: dayOf(), kind: 'propose', target: targetId, outcome: r, opinionAfter: ov ? (ov.opinion || 0) : null });
      } catch (e) {}
      return r;
    };
  }
  const origBreak = Game.breakLink;
  if (typeof origBreak === 'function') {
    Game.breakLink = function (id, how) {
      try {
        const links = Game.hierarchyState() || [];
        const l = links.find(x => x && String(x.id) === String(id));
        evts.push({ day: dayOf(), kind: 'break', target: l ? l.primary : '?', how: String(how || '') });
      } catch (e) {}
      return origBreak.apply(this, arguments);
    };
  }

  const policy = Object.assign({}, belongseek);
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS }); });

  return { seed, endReason: result.endReason, gameDays: result.gameDays, evts };
}

(async () => {
  const out = [];
  for (const seed of SEEDS) {
    console.error(`[diag] seed=${seed} ...`);
    out.push(await oneRun(seed));
    console.error(`[diag] seed=${seed} done`);
  }
  console.log(JSON.stringify(out, null, 1));
})();
