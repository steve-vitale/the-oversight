#!/usr/bin/env node
// scripts/sense-wirewatch-b.js — SENSE-TESTING for the wirewatch arm.
// Captures the watch/learn transcript on armed seeds: every say line
// mentioning snares, traps, wire, or teaching, plus the learn beats.
// Read them like a player: does the learn read as earned? Is the watch
// legible? Any robotic repetition?
//
// Usage: SEEDS="41713,41714" POLICIES="leadfeast" DAYS=40 WIREWATCH=1 \
//   FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/sense-wirewatch-b.js
// Writes evidence/2026-10-19/wirewatch-sense-b/<pid>-s<seed>.txt
// TOOLING ONLY.
'use strict';
process.env.FEASTSCALE_R13 = '1';
process.env.SEATDRIVE = '0';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { POLICY_REGISTRY } = require('./sweep-compare');

const SEEDS = (process.env.SEEDS || '41713,41714').split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
const PIDS = (process.env.POLICIES || 'leadfeast,belongfeast').split(',').map(s => s.trim()).filter(Boolean);
const DAYS = parseInt(process.env.DAYS || '40', 10);
const OUTDIR = path.join(__dirname, '..', 'evidence', '2026-10-19', 'wirewatch-sense-b');
const KEYS = ['snare', 'trap', 'wire', 'teach', '🪤', 'haven-hours', 'come home', 'heading home'];

async function main() {
  if (process.env.WIREWATCH !== '1') { console.error('SENSE STOP: WIREWATCH=1 required'); process.exit(2); }
  fs.mkdirSync(OUTDIR, { recursive: true });
  for (const pid of PIDS) {
    const base = POLICY_REGISTRY[pid];
    if (!base) throw new Error('unknown policy: ' + pid);
    for (const seed of SEEDS) {
      const { Game } = await loadGame({ seed, mode: 'wirewatch-sense', narration: true });
      await setupGame(Game);
      const lines = [];
      const cap = (fn) => function () {
        try {
          const text = Array.prototype.map.call(arguments, String).join(' ');
          const low = text.toLowerCase();
          if (KEYS.some(k => low.includes(k.toLowerCase()))) {
            const day = ((Game.state || {}).scholar || {}).day;
            lines.push(`[d${day}] ${text.slice(0, 300)}`);
          }
        } catch (e) {}
        return fn.apply(this, arguments);
      };
      Game.say = cap(Game.say.bind(Game));
      if (Game.sysSay) Game.sysSay = cap(Game.sysSay.bind(Game));
      // mark the learn beat precisely
      const origGR = Game._grantRecipe;
      if (typeof origGR === 'function') {
        Game._grantRecipe = function (id, level, src) {
          try {
            if (String(id) === 'snare') {
              const day = ((Game.state || {}).scholar || {}).day;
              lines.push(`[d${day}] ★ RECIPE LEARN: snare L${level} via=${(src || {}).type} by=${(src || {}).by}`);
            }
          } catch (e) {}
          return origGR.apply(this, arguments);
        };
      }
      const policy = Object.assign({}, base);
      await runDays(Game, policy, { days: DAYS });
      const f = path.join(OUTDIR, `${pid}-s${seed}.txt`);
      fs.writeFileSync(f, lines.join('\n') + '\n');
      console.log(`wrote ${f} (${lines.length} lines)`);
    }
  }
}
main().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
