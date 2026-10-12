#!/usr/bin/env node
// sense-trust-r5-20261012.js — SENSE-TESTING LAW for trust r5 (contender arc + line pools
// engagement). One 80-day run with the contender-engager policy; capture
// leadership lines (challenges, yields, stands, rallies, takeovers) and the
// two r2/r3-documented quirks ("telling Y about Y" fragment, "What I miss
// most? the noise") for in-fiction reading + sense confirmation.
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { contenderEngager } = require('./policies/contender-engager');

(async () => {
  const seed = parseInt(process.env.SEED || '424242', 10);
  const days = parseInt(process.env.DAYS || '80', 10);
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
    l.includes('Why are YOU giving orders') || l.includes('Your call. For now') ||
    // r5 pools
    l.includes('Who put YOU in charge') || l.includes('plants themself in front') ||
    l.includes('A real say') || l.includes('Your crew, your mess') ||
    l.includes('until it isn') || l.includes("Leaders who don't listen") ||
    l.includes("I've said my piece") || l.includes('Watch me work') ||
    l.includes('Mine now') || l.includes('About time someone said it') ||
    l.includes("don't make me regret it") || l.includes('Picking sides already') ||
    l.includes('arms crossed, until you finish') || l.includes('Orders are orders') ||
    l.includes('last word: "again."') || l.includes('We carry them') ||
    l.includes('stand with each other') ||
    // r5 arc beats: tone tiers + resolutions
    l.includes('Still?') || l.includes('You keep winning these') ||
    l.includes('Not worth it. Not today') || l.includes('why I bother anymore') ||
    l.includes('Fine. Again. Fine') || l.includes("tired of this") ||
    l.includes('single slow nod') || l.includes('They won. Fair') ||
    l.includes('closest thing to respect') || l.includes("I'm done with this") ||
    l.includes('out of the running') || l.includes('packs a bag at dusk') ||
    l.includes("I'll run mine") || l.includes('walked away from Haven');
  const lead = lines.filter(isLead);
  const frags = lines.filter(l =>
    l.includes('fragments by the fire') || l.includes('What I miss most'));
  console.log('--- leadership/challenge narrative (' + lead.length + ') ---');
  for (const l of lead.slice(0, 90)) console.log(l);
  // r5: arc state at end
  try {
    const arc = (Game.state.village || {}).contendArc || {};
    console.log('contendArc=' + JSON.stringify(arc));
  } catch (e) {}
  console.log('--- gossip fragments / quirk watch (' + frags.length + ') ---');
  for (const l of frags.slice(0, 15)) console.log(l);
  const telling = lines.filter(l => l.includes('telling') && l.includes('fragments'));
  for (const l of telling.slice(0, 15)) console.log(l);
  console.log('tellingSelfCount=' + telling.filter(l => /telling (\w+) about \1\b/.test(l)).length);
  const reflex = telling.filter(l => /about (herself|himself|themself)\./.test(l));
  console.log('reflexiveCount=' + reflex.length);
  for (const l of reflex.slice(0, 5)) console.log('REFLEX: ' + l);
})();
