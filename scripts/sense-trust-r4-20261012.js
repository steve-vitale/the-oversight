#!/usr/bin/env node
// sense-trust-r4-20261012.js — SENSE-TESTING LAW for trust r4 (contender
// engagement). One 60-day run with the contender-engager policy; capture
// leadership lines (challenges, yields, stands, rallies, takeovers) and the
// two r2/r3-documented quirks ("telling Y about Y" fragment, "What I miss
// most? the noise") for in-fiction reading + sense confirmation.
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { contenderEngager } = require('./policies/contender-engager');

(async () => {
  const seed = parseInt(process.env.SEED || '424242', 10);
  const days = parseInt(process.env.DAYS || '60', 10);
  const { Game, manifest } = await loadGame({ seed, mode: 'sense', fullTelemetry: false });
  await setupGame(Game);
  const lines = [];
  Game.say = function (t) { lines.push('d' + (Game.state.scholar.day) + ':' + this.dayPart + ' ' + String(t)); };
  const ctx = {};
  let runCtx = null;
  const policy = Object.assign({}, contenderEngager);
  const origSetup = policy.setup;
  policy.setup = async (G, c) => { runCtx = c; if (origSetup) await origSetup(G, c); };
  const result = await runDays(Game, policy, { days, manifest, sampleEvery: 60 });
  console.log('days=' + result.days + ' endReason=' + result.endReason + ' captured=' + lines.length);
  console.log('leadEngage=' + JSON.stringify((runCtx && runCtx.leadEngage) || null));

  // leadership-specific markers
  const isLead = (l) =>
    l.includes('We need to talk') || l.includes('Good call') ||
    l.includes('Your funeral') || l.includes('stopped asking') ||
    l.includes('step closer') || l.includes("doesn't speak for me") ||
    l.includes("won't forget it") || l.includes('stood with you against') ||
    l.includes('considers it, then nods') || l.includes('stand up by the fire') ||
    l.includes("We're still here,") || l.includes('what you\'ve built together') ||
    l.includes('gave orders') || l.includes('Nobody asked me') ||
    l.includes('Why are YOU giving orders') || l.includes('Your call. For now');
  const lead = lines.filter(isLead);
  const frags = lines.filter(l =>
    l.includes('fragments by the fire') || l.includes('What I miss most'));
  console.log('--- leadership/challenge narrative (' + lead.length + ') ---');
  for (const l of lead.slice(0, 60)) console.log(l);
  console.log('--- gossip fragments / quirk watch (' + frags.length + ') ---');
  for (const l of frags.slice(0, 15)) console.log(l);
  const telling = lines.filter(l => l.includes('telling') && l.includes('fragments'));
  for (const l of telling.slice(0, 15)) console.log(l);
  console.log('tellingSelfCount=' + telling.filter(l => /telling (\w+) about \1\b/.test(l)).length);
  const reflex = telling.filter(l => /about (herself|himself|themself)\./.test(l));
  console.log('reflexiveCount=' + reflex.length);
  for (const l of reflex.slice(0, 5)) console.log('REFLEX: ' + l);
})();
