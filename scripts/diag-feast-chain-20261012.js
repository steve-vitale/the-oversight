#!/usr/bin/env node
// diag-feast-chain-20261012.js — WHY does armed->granted collapse?
// winseek, seeds 1-8, 200d. Wraps hostFeast (calls + ok/why) and samples the
// feastRoad blocker state daily: armed, atHaven, drain, pantry vs cost,
// days-since-last-feast.
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { winseek } = require('./policies/winseek');

function parseSeeds(s) {
  const out = [];
  for (const part of String(s || '1-8').split(',')) {
    const m = part.trim().match(/^(\d+)-(\d+)$/);
    if (m) { for (let i = +m[1]; i <= +m[2]; i++) out.push(i); }
    else if (part.trim() !== '') out.push(+part.trim());
  }
  return out;
}

(async () => {
  const seeds = parseSeeds(process.env.SEEDS || '1-8');
  const days = parseInt(process.env.DAYS || '200', 10);
  for (const seed of seeds) {
    const { Game } = await loadGame({ seed, mode: 'winseek' });
    await setupGame(Game);
    const diag = { feastCalls: [], grants: 0, uses: 0, arms: 0,
                   blockers: { feastDay: 0, drain: 0, pantry: 0, cadence: 0, haven: 0, eligible: 0 } };
    const p = Object.assign({}, winseek);
    // wrap grant/use for counting
    const ogGrant = Game.grantFeastBuff.bind(Game);
    Game.grantFeastBuff = function (feast) {
      const r = ogGrant(feast);
      if (r && r.granted) diag.grants++;
      else { diag.refusals = (diag.refusals || 0) + 1; diag.refusalWhy = String((r && r.why) || '?').slice(0, 80); }
      return r;
    };
    const ogNote = Game.noteFeastedCombatUse.bind(Game);
    Game.noteFeastedCombatUse = function () {
      let mark = false;
      try {
        const b = ((Game.state || {}).scholar || {}).feastBuff;
        mark = !!(b && !b.used && Game.inCombat && Game.inCombat());
      } catch (e) {}
      const r = ogNote();
      if (mark) diag.uses++;
      return r;
    };
    const ogHost = Game.hostFeast.bind(Game);
    Game.hostFeast = function () {
      const r = ogHost();
      try {
        diag.feastCalls.push({ day: ((Game.state || {}).scholar || {}).day || 0,
                               ok: !!(r && r.ok), why: String((r && r.why) || '').slice(0, 60),
                               buffGranted: !!(r && r.buffGranted) });
      } catch (e) {}
      return r;
    };
    const ogChan = Game.channelSentiment.bind(Game);
    Game.channelSentiment = function (idx) {
      const r = ogChan(idx);
      try {
        if ((((Game.state || {}).scholar || {}).prog || {}).feastSurge) diag.arms++;
      } catch (e) {}
      return r;
    };
    // sample feastRoad blockers once per day, inside policy daily
    const origDaily = p.daily;
    p.daily = (G, ctx) => {
      if (origDaily) { try { origDaily(G, ctx); } catch (e) {} }
      try {
        const s = G.state.scholar || {};
        const pg = s.prog || {};
        if (pg.feastSurgeUsed) return;
        const day = s.day || 1;
        const armed = !!pg.feastSurge;
        if (!armed) return; // only care about armed-days
        let atHaven = false;
        try { atHaven = G.playerAtHaven && G.playerAtHaven(); } catch (e) {}
        if (!atHaven) { diag.blockers.haven++; return; }
        let drain = 0;
        try {
          const vv = G.state.village || {};
          const me = G.villagerId;
          drain = ((vv.takes || {})[me] || 0) - ((vv.gives || {})[me] || 0);
        } catch (e) {}
        if (drain > 3000) { diag.blockers.drain++; return; }
        let have = 0;
        try { have = G.pantryKcalLive ? G.pantryKcalLive(G.state.village || {}) : 0; } catch (e) {}
        const present = ((G.state.village.roster || []).filter(id => id !== G.villagerId)).length;
        const cost = Math.max(1500, 400 * (present + 1));
        if (have < cost * 1.5) { diag.blockers.pantry++; return; }
        if ((day - (ctx._lastFeastDay || 0)) < 7) { diag.blockers.cadence++; return; }
        if (s.feastDay === day) { diag.blockers.feastDay++; return; }
        diag.blockers.eligible++;
      } catch (e) {}
    };
    await runDays(Game, p, { days });
    console.log(`seed ${seed}: arms=${diag.arms} grants=${diag.grants} uses=${diag.uses} refusals=${diag.refusals||0} feastCalls=${diag.feastCalls.length}`);
    if (diag.refusalWhy) console.log(`  last refusal: ${diag.refusalWhy}`);
    console.log(`  armed-day blockers: ${JSON.stringify(diag.blockers)}`);
    const oks = diag.feastCalls.filter(c => c.ok).length;
    const whys = {};
    for (const c of diag.feastCalls) if (!c.ok) whys[c.why] = (whys[c.why] || 0) + 1;
    console.log(`  feast ok=${oks}/${diag.feastCalls.length} refusal-whys: ${JSON.stringify(whys).slice(0, 200)}`);
  }
})();
