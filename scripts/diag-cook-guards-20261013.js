#!/usr/bin/env node
// scripts/diag-cook-guards-20261013.js — which guard stops the cook's smoke
// path? Captures the cook's say-lines per resolution and classifies:
// fired / racks-full / dinner-first (all eligible kept fresh) / no-eligible.
// Usage: SEEDS="11,22" DAYS=60 node scripts/diag-cook-guards-20261013.js
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

(async () => {
  const seeds = (process.env.SEEDS || '11,22').split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const days = parseInt(process.env.DAYS || '60', 10);
  for (const seed of seeds) {
    const { Game } = await loadGame({ seed, mode: 'cookguard' });
    await setupGame(Game);
    const stat = { res: 0, fired: 0, racksFull: 0, dinnerFirst: 0, noEligible: 0, other: 0 };
    const sayLines = [];
    const origSay = Game.say;
    Game.say = function (txt) { try { if (typeof txt === 'string' && (/smoke racks/.test(txt) || /racks are already full/.test(txt) || /cooked for the haven/.test(txt))) sayLines.push(txt); } catch (e) {} return origSay.apply(this, arguments); };
    const orig = Game.resolveOneAssignment;
    Game.resolveOneAssignment = function (vid, a) {
      const isCook = a && a.task === 'cook';
      const n0 = isCook ? sayLines.length : 0;
      const r = orig.apply(this, arguments);
      if (isCook) {
        try {
          stat.res++;
          const newLines = sayLines.slice(n0).join(' ');
          if (/preserved \(~/.test(newLines)) stat.fired++;
          else if (/racks are already full/.test(newLines)) stat.racksFull++;
          else if (/left the fresh pile for tonight/.test(newLines)) stat.racksFull++;
          else if (/cooked for the haven/.test(newLines)) {
            // no preservedNote at all: either no eligible or all kept fresh
            stat.dinnerFirst++;
          } else stat.other++;
        } catch (e) {}
      }
      return r;
    };
    const policy = Object.assign({}, competent);
    await runDays(Game, policy, { days });
    console.log(`seed ${seed}: res=${stat.res} fired=${stat.fired} racksFull=${stat.racksFull} dinnerFirst/noEligible=${stat.dinnerFirst} other=${stat.other}`);
    // show 2 sample racks-full lines for sense
    const rf = sayLines.filter(l => /racks are already full/.test(l)).slice(0, 2);
    for (const l of rf) console.log('  RF:', l.slice(0, 160));
  }
})().catch(e => { console.error('FATAL', e); process.exit(1); });
