#!/usr/bin/env node
// probe-belong-20261012.js — BELONG-road reachability probe (lever 8 lens on
// the scale on-ramp). No game-code changes: new policy + instrumentation only.
//
// MODE=smoke : 2-3 seeds x 60d x belongseek. Verifies the code path fires:
//   proposeLink asSubordinate attempted/accepted-or-countered, weekly tribute
//   paid, region stirred. Kill-before-pilot gate.
// MODE=pilot : seeds 101,202,303,404 x 150d x (scalecourt | belongseek).
//   Death-aware (runDays breaks on Game.over / pop-zero). Primary metric:
//   BELONG national reach (belong beat staged + scaleRank national, or >=14d
//   good-standing subordination while a foreign 4-realm existed).
//
// Usage:
//   MODE=smoke SEEDS="101,202" DAYS=60 node scripts/probe-belong-20261012.js
//   MODE=pilot SEEDS="101,202,303,404" DAYS=150 POLICIES=both OUT=/tmp/belong-pilot.json node scripts/probe-belong-20261012.js
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { scalecourt } = require('./policies/scalecourt');
const { belongseek } = require('./policies/belongseek');

const MODE = (process.env.MODE || 'smoke').toLowerCase();
const SEEDS = (process.env.SEEDS || (MODE === 'smoke' ? '101,202' : '101,202,303,404'))
  .split(',').map(s => Number(s.trim())).filter(Boolean);
const DAYS = parseInt(process.env.DAYS || (MODE === 'smoke' ? '60' : '150'), 10);
const POLS = (process.env.POLICIES || (MODE === 'smoke' ? 'belongseek' : 'both')).toLowerCase();
const OUT = process.env.OUT || null;

const POLICY_SET = POLS === 'both' ? [scalecourt, belongseek]
  : POLS === 'scalecourt' ? [scalecourt] : [belongseek];

const sayOf = (Game) => {
  try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; }
};

async function oneRun(seed, basePolicy) {
  const { Game } = await loadGame({ seed, mode: 'belong-probe' });
  await setupGame(Game);
  const T = {
    sayLines: [],          // rolling buffer (last 1500) — the game is chatty early
    scaleLines: [],        // keyword matches for sense-testing — the signal
    stir: 0, stirKinds: {},
    linkEvents: [],        // {day, ev, primary, sub, trust, trib, how}
    nationalStages: [],    // {day, shape, primary}
    days: {},              // day -> {rank, subTrust, subArrears, subAge, good, foreign4, maxForeignSize}
    goodDays: 0, goodDaysWith4: 0,
    maxSubTrust: 0, maxForeignSize: 0, maxForeignPrimary: null, subPrimary: null,
    tributeWeeks: 0,
  };
  const SCALE_RE = /brings it home|Tribute paid|walks out of the pantry|calls on the obligation|has bound|have bound|swears the oath|The Binding|kneels at|arrears|shortfall|missing tribute|breaks with|walks from the table|swear|oath/i;
  const origSay = Game.say;
  if (typeof origSay === 'function') {
    Game.say = function (msg) {
      try {
        const line = String(msg).slice(0, 300);
        const day = sayOf(Game);
        T.sayLines.push({ day, line });
        if (T.sayLines.length > 1500) T.sayLines.shift();
        if (SCALE_RE.test(line) && T.scaleLines.length < 600) T.scaleLines.push({ day, line });
      } catch (e) {}
      return origSay.apply(this, arguments);
    };
  }
  const origStir = Game.stirRegion;
  if (typeof origStir === 'function') {
    Game.stirRegion = function (kind) {
      try { T.stir++; T.stirKinds[kind] = (T.stirKinds[kind] || 0) + 1; } catch (e) {}
      return origStir.apply(this, arguments);
    };
  }
  const origForm = Game._formLink;
  if (typeof origForm === 'function') {
    Game._formLink = function (targetId, opts) {
      const l = origForm.apply(this, arguments);
      try {
        T.linkEvents.push({ day: sayOf(Game), ev: 'formed', primary: l && l.primary, sub: l && l.subordinate, trust: l && l.trust, trib: l && l.tributeKcalPerWeek });
      } catch (e) {}
      return l;
    };
  }
  const origBreak = Game.breakLink;
  if (typeof origBreak === 'function') {
    Game.breakLink = function (id, how) {
      try { T.linkEvents.push({ day: sayOf(Game), ev: 'broke', linkId: String(id).slice(0, 24), how: String(how || '') }); } catch (e) {}
      return origBreak.apply(this, arguments);
    };
  }
  const origStage = Game.stageNationalBeat;
  if (typeof origStage === 'function') {
    Game.stageNationalBeat = function (p) {
      try { T.nationalStages.push({ day: sayOf(Game), shape: p && p.shape, primary: p && p.primary }); } catch (e) {}
      return origStage.apply(this, arguments);
    };
  }
  const origPay = Game.payTribute;
  if (typeof origPay === 'function') {
    Game.payTribute = function (linkId) {
      const r = origPay.apply(this, arguments);
      try {
        if (r > 0) T.tributeWeeks++;
      } catch (e) {}
      return r;
    };
  }

  const policy = Object.assign({}, basePolicy);
  const origDaily = basePolicy.daily;
  const FORENSIC = process.env.FORENSIC === '1';
  policy.daily = (G, ctx) => {
    try {
      const day = sayOf(G);
      let rank = '?';
      try { rank = G.scaleRank ? G.scaleRank() : '?'; } catch (e) {}
      let sub = null;
      try {
        for (const l of (G.hierarchyState() || [])) {
          if (l && l.status === 'active' && l.subordinate === 'haven' && !l.kind) { sub = l; break; }
        }
      } catch (e) {}
      let fps = [];
      try { fps = (G.foreignPolities && G.foreignPolities()) || []; } catch (e) {}
      let maxFS = 0, foreign4 = false, foreign4primary = null, subFpSize = null;
      const fpList = [];
      for (const f of fps) {
        const sz = 2 + ((f && f.subs) || []).length;
        fpList.push({ primary: f.primary, size: sz, subs: (f.subs || []).slice() });
        if (sz > maxFS) { maxFS = sz; foreign4primary = f.primary; }
        if (sz >= 4) foreign4 = true;
        if (sub && f.primary === sub.primary) subFpSize = sz;
      }
      if (maxFS > T.maxForeignSize) { T.maxForeignSize = maxFS; T.maxForeignPrimary = foreign4primary; }
      let good = false;
      if (sub) {
        if (!T.subPrimary) T.subPrimary = sub.primary;
        const age = day - (sub.day || 0);
        good = (sub.trust || 0) >= 50 && (sub.arrears || 0) === 0 && age >= 14;
        if ((sub.trust || 0) > T.maxSubTrust) T.maxSubTrust = sub.trust;
        if (good) { T.goodDays++; if (foreign4) T.goodDaysWith4++; }
      }
      const row = {
        rank, foreign4, maxForeignSize: maxFS, good,
        subTrust: sub ? sub.trust : null, subArrears: sub ? (sub.arrears || 0) : null,
        subAge: sub ? (day - (sub.day || 0)) : null, subFpSize,
      };
      if (FORENSIC) {
        row.fpList = fpList;
        row.pendingNational = (G.state.pendingNational && G.state.pendingNational.shape) || null;
        row.nationalLive = !!G.state.nationalLive;
        row.networkLiveDay = G.state.networkLiveDay || null;
        row.knownVills = ((G.state.otherVillages || []).filter(v => { try { return G.knowsVillage(v); } catch (e) { return false; } })).length;
      }
      T.days[day] = row;
    } catch (e) {}
    if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
  };

  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, sampleEvery: 10 }); });

  const belongBeat = T.nationalStages.find(s => s.shape === 'belong');
  const end = {
    rank: (() => { try { return Game.scaleRank(); } catch (e) { return '?'; } })(),
    roster: (() => { try { return ((Game.state.village || {}).roster || []).length; } catch (e) { return 0; } })(),
    nationalLive: !!Game.state.nationalLive,
  };
  const deaths = (result.samples && result.samples.deaths) || [];
  const deathCauses = {};
  for (const d of deaths) deathCauses[d.cause || d.kind || '?'] = (deathCauses[d.cause || d.kind || '?'] || 0) + 1;

  return {
    seed, policy: policy.id, mode: MODE,
    endReason: result.endReason, gameDays: result.gameDays,
    dawnDay: Game.state.networkLiveDay || null,
    linkEvents: T.linkEvents,
    nationalStages: T.nationalStages,
    belongBeatDay: belongBeat ? belongBeat.day : null,
    goodDays: T.goodDays, goodDaysWith4: T.goodDaysWith4,
    maxSubTrust: T.maxSubTrust, maxForeignSize: T.maxForeignSize,
    maxForeignPrimary: T.maxForeignPrimary, subPrimary: T.subPrimary,
    tributeWeeks: T.tributeWeeks, stir: T.stir, stirKinds: T.stirKinds,
    end, deathCauses, deathCount: deaths.length,
    days: T.days,
    sayTail: T.sayLines.slice(-120),   // last 120 lines — endgame flavor
    scaleLines: T.scaleLines,          // keyword matches across the whole run
  };
}

(async () => {
  const rows = [];
  for (const seed of SEEDS) {
    for (const pol of POLICY_SET) {
      console.error(`[belong-probe] ${MODE} seed=${seed} policy=${pol.id} days=${DAYS} ...`);
      const t0 = Date.now();
      const row = await oneRun(seed, pol);
      // sense-testing material: scale-line matches across the run + tail
      const { sayTail, scaleLines, ...summary } = row;
      summary.saySample = (scaleLines || []).slice(0, 60);
      summary.sayTail = (sayTail || []).slice(-30);
      rows.push(summary);
      console.error(`[belong-probe]   done in ${((Date.now() - t0) / 1000).toFixed(0)}s: ` +
        `end=${summary.endReason} d${summary.gameDays} rank=${summary.end.rank} ` +
        `subLinks=${summary.linkEvents.filter(e => e.ev === 'formed').length} ` +
        `goodDays=${summary.goodDays} goodW4=${summary.goodDaysWith4} maxT=${summary.maxSubTrust} ` +
        `maxForeign=${summary.maxForeignSize} beats=${summary.nationalStages.map(s => s.shape + '@' + s.day).join(',') || 'none'} ` +
        `tribute=${summary.tributeWeeks} stir=${summary.stir}`);
    }
  }
  const out = { mode: MODE, seeds: SEEDS, days: DAYS, policies: POLICY_SET.map(p => p.id), rows };
  if (OUT) { fs.writeFileSync(OUT, JSON.stringify(out, null, 1)); console.error('[belong-probe] wrote ' + OUT); }
  else console.log(JSON.stringify(out, null, 1));
})();
