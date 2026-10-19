#!/usr/bin/env node
// scripts/sense-snarecatch-b.js — SENSE-TESTING for the sim-snarecatch-b arm.
// Captures the trapline/learn transcript on armed seeds: every say line
// mentioning snares, traps, wire, or teaching, plus the learn beats and
// the snare_catch_learn markers. Read them like a player: does the
// witnessed-catch learn read as earned? Who caught, who watched — people,
// not counters?
//
// Usage: SEEDS="42101,42102" POLICIES="leadfeast" DAYS=40 \
//   FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/sense-snarecatch-b.js
// Writes evidence/2026-10-19/snarecatch-sense-b/<pid>-s<seed>.txt
// TOOLING ONLY. Run on the PATCHED tree (the hook must exist).
'use strict';
process.env.FEASTSCALE_R13 = '1';
process.env.SEATDRIVE = '0';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { POLICY_REGISTRY } = require('./sweep-compare');

const SEEDS = (process.env.SEEDS || '42101').split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
const PIDS = (process.env.POLICIES || 'leadfeast,belongfeast').split(',').map(s => s.trim()).filter(Boolean);
const DAYS = parseInt(process.env.DAYS || '40', 10);
const OUTDIR = path.join(__dirname, '..', 'evidence', '2026-10-19', 'snarecatch-sense-b');
const KEYS = ['snare', 'trap', 'wire', 'teach', '🪤', 'shape of it'];

async function main() {
  fs.mkdirSync(OUTDIR, { recursive: true });
  for (const pid of PIDS) {
    const base = POLICY_REGISTRY[pid];
    if (!base) throw new Error('unknown policy: ' + pid);
    for (const seed of SEEDS) {
      const { Game } = await loadGame({ seed, mode: 'snarecatch-sense', narration: true });
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
      const origTele = Game.tele;
      Game.tele = function (type, data) {
        try {
          if (type === 'snare_catch_learn') {
            const day = ((Game.state || {}).scholar || {}).day;
            lines.push(`[d${day}] ★ CATCH-LEARN HOOK: teacher=${(data || {}).teacher}`);
          }
        } catch (e) {}
        return origTele.apply(this, arguments);
      };
      const policy = Object.assign({}, base);
      await runDays(Game, policy, { days: DAYS });
      const f = path.join(OUTDIR, `${pid}-s${seed}.txt`);
      fs.writeFileSync(f, lines.join('\n') + '\n');
      console.log(`wrote ${f} (${lines.length} lines)`);
    }
  }
}
main().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
