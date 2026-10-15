#!/usr/bin/env node
// scripts/sense-raidassess-20261015.js — SENSE-TESTING for the raidassess arm.
// Re-runs one seed/policy with RAIDASSESS=1 and captures the FULL say log,
// then prints the window around each raid disengage (the layer's narration +
// what happened next: escape, chase, death, dawn return). A human reads the
// transcript and judges meaning/coherence — never just counts.
//
// Usage: FEASTSCALE_R13=1 SEED=44 POLICY=leadfeast node scripts/sense-raidassess-20261015.js
'use strict';
process.env.FEASTSCALE_R13 = '1';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast, belongfeast } = require('./policies/feastscale');
const { withRaidAssess } = require('./policies/raidassess');

const SEED = parseInt(process.env.SEED || '44', 10);
const PID = process.env.POLICY || 'leadfeast';
const DAYS = parseInt(process.env.DAYS || '180', 10);

(async () => {
  process.env.RAIDASSESS = '1';
  const base = PID === 'belongfeast' ? belongfeast : leadfeast;
  const { Game } = await loadGame({ seed: SEED, mode: 'raidassess-sense' });
  await setupGame(Game);

  const sayLog = [];
  const gday = () => ((Game.state || {}).scholar || {}).day || 0;
  const origSay = Game.say.bind(Game);
  Game.say = function (msg) {
    try {
      sayLog.push({ day: gday(), text: String((msg && (msg.text || msg.msg || msg.message)) || msg || '').replace(/<[^>]*>/g, '').slice(0, 220) });
      if (sayLog.length > 20000) sayLog.splice(0, 2000);
    } catch (e) {}
    return origSay(msg);
  };

  const policy = withRaidAssess(Object.assign({}, base));
  let ctx = null;
  const origDaily = policy.daily;
  policy.daily = (G, c) => { ctx = c; if (origDaily) { try { origDaily(G, c); } catch (e) {} } };

  await runDays(Game, policy, { days: DAYS, sampleEvery: 1 });

  const marks = sayLog.map((s, i) => ({ s, i })).filter(x => /Teeth at the door/.test(x.s.text));
  console.log(`seed=${SEED} policy=${PID} disengages=${marks.length}`);
  console.log('layer counters: ' + JSON.stringify({
    raAssessed: ctx.raAssessed || 0, raDeclined: ctx.raDeclined || 0,
    raFought: ctx.raFought || 0, raDisengaged: ctx.raDisengaged || 0,
    raPushBlocked: ctx.raPushBlocked || 0, raReturned: ctx.raReturned || 0,
    raNoExit: ctx.raNoExit || 0,
    raFirstDetail: ctx.raFirstDetail || null,
  }, null, 1));
  const WINDOW = 14;
  marks.slice(0, 6).forEach((m, k) => {
    console.log(`\n===== disengage #${k + 1} (day ${m.s.day}) =====`);
    const lo = Math.max(0, m.i - 4);
    const hi = Math.min(sayLog.length, m.i + WINDOW);
    for (let i = lo; i < hi; i++) {
      const e = sayLog[i];
      console.log(`  d${e.day} ${e.text}`);
    }
  });
  if (!marks.length) {
    // no disengage: print the last 25 lines so the reader sees what the run did
    console.log('\n(no disengage fired — tail of the run:)');
    sayLog.slice(-25).forEach(e => console.log(`  d${e.day} ${e.text}`));
  }
})().catch(e => { console.error('SENSE FATAL:', e && e.stack || e); process.exit(1); });
