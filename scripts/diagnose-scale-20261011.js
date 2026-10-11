#!/usr/bin/env node
// diagnose-scale-20261011.js — why does the winseek policy never reach national?
// Instruments link lifecycle on the CURRENT engine: formLink initial trust,
// weekly trust trajectory of Haven-subordinate links, breakLink reasons,
// decline counts + opinion values, demand answers, mourning blocks on gains.
// SEEDS="5" DAYS=200 OUT=/tmp/diag5.json node scripts/diagnose-scale-20261011.js
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { winseek } = require('./policies/winseek');

const DAYS = parseInt(process.env.DAYS || '200', 10);
const SEEDS = (process.env.SEEDS || '5').split(',').map(x => parseInt(x, 10));
const OUT = process.env.OUT || '/tmp/diag-scale.json';

function instrument(Game, ctx) {
  const D = ctx.diag = {
    links: {}, // linkId -> {birthDay, initTrust, weeklyTrust: [], broke: null|{day,reason}, primary}
    declines: [], counters: 0, demands: 0, demandAnswers: 0,
    sayLines: [], mourningGains: 0,
  };
  const wrap = (name, fn) => {
    const o = Game[name];
    if (typeof o !== 'function') return false;
    Game[name] = function () { return fn.call(this, o, Array.prototype.slice.call(arguments)); };
    return true;
  };
  const dayOf = () => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
  wrap('_formLink', function (orig, a) {
    const r = orig.apply(this, a);
    try {
      if (r && r.id) {
        D.links[r.id] = {
          birthDay: dayOf(), initTrust: r.trust, primary: r.primary, subordinate: r.subordinate,
          weeklyTrust: [[dayOf(), r.trust]], broke: null, arrears: r.arrears || 0,
        };
      }
    } catch (e) {}
    return r;
  });
  wrap('breakLink', function (orig, a) {
    const id = a[0], why = a[1];
    const r = orig.apply(this, a);
    try { if (D.links[id]) D.links[id].broke = { day: dayOf(), reason: why || '?' }; } catch (e) {}
    return r;
  });
  wrap('_trustGain', function (orig, a) {
    const before = a[0] ? (a[0].trust || 0) : 0;
    const r = orig.apply(this, a);
    try { if (a[0] && (a[0].trust || 0) === before) D.mourningGains++; } catch (e) {}
    return r;
  });
  // decline + counter lines come through say()
  const osay = Game.say;
  Game.say = function (msg) {
    try {
      if (typeof msg === 'string') {
        if (/declines/.test(msg)) { D.declines.push({ day: dayOf(), msg: String(msg).slice(0, 220) }); }
        if (/doesn't say no/.test(msg)) D.counters++;
        if (/demands?|demand/i.test(msg)) D.demands++;
      }
    } catch (e) {}
    return osay.apply(this, arguments);
  };
  wrap('answerDemand', function (orig, a) {
    const r = orig.apply(this, a);
    try { D.demandAnswers++; } catch (e) {}
    return r;
  });
}

const policy = Object.assign({}, winseek, {
  id: 'diagwinseek',
  setup(Game, ctx) {
    try { if (winseek.setup) winseek.setup(Game, ctx); } catch (e) {}
    instrument(Game, ctx);
  },
  daily(Game, ctx) {
    try { if (winseek.daily) winseek.daily(Game, ctx); } catch (e) {}
    try {
      const D = ctx.diag; if (!D) return;
      const day = (Game.state.scholar || {}).day || 0;
      if (day % 7 !== 0) return;
      const hs = Game.hierarchyState ? Game.hierarchyState() : [];
      for (const l of hs) {
        const rec = D.links[l.id];
        if (rec && !rec.broke) {
          rec.weeklyTrust.push([day, l.trust, l.arrears || 0, l.status]);
          rec.arrears = l.arrears || 0;
        }
      }
    } catch (e) {}
  },
});

async function main() {
  const rows = [];
  for (const seed of SEEDS) {
    const { Game } = await loadGame({ seed, mode: 'diag', fullTelemetry: false });
    await setupGame(Game);
    let diag = null;
    const res = await runDays(Game, Object.assign({}, policy, {
      daily(G, ctx) { policy.daily(G, ctx); diag = ctx.diag; },
    }), { days: DAYS });
    rows.push({ seed, days: res.days, endReason: res.endReason, diag });
  }
  fs.writeFileSync(OUT, JSON.stringify(rows, null, 1));
  console.log('wrote ' + OUT);
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
