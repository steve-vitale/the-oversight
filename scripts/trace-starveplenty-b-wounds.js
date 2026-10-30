#!/usr/bin/env node
// scripts/trace-starveplenty-b-wounds.js — follow-up probe INSIDE the
// sim-starveplenty-b trace leg (same seed/policy/horizon): attribute every
// hurtVillager hit on the starving villager's final stretch, to explain the
// health steps the meal trace shows but cannot attribute (79 -> 39 between
// day-31 and day-32 meals; -5/day across days 37-39). Record-only wrapper;
// same determinism guard (death sequence must still match the wall corpus).
// Usage: node scripts/trace-starveplenty-b-wounds.js <seed> <days> <out.json>
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

async function main() {
  const seed = parseInt(process.argv[2], 10);
  const days = parseInt(process.argv[3], 10) || 180;
  const out = process.argv[4];
  if (!Number.isFinite(seed) || !out) { console.error('usage: trace-starveplenty-b-wounds.js <seed> <days> <out.json>'); process.exit(2); }
  const { Game, manifest } = await loadGame({ seed, mode: 'trace-starveplenty-b-wounds' });
  await setupGame(Game);
  const rows = [];
  const dayOf = () => (Game.state.scholar || {}).day || 0;
  const orig = Game.hurtVillager;
  if (typeof orig === 'function') {
    Game.hurtVillager = function (vid, damage, cause, result, opts) {
      const v = this.state.village;
      const hBefore = v && v.health && v.health[vid] !== undefined ? v.health[vid] : null;
      const sBefore = this.state.scholar ? this.state.scholar.health : null;
      const r = orig.apply(this, arguments);
      const hAfter = v && v.health && v.health[vid] !== undefined ? v.health[vid] : null;
      let dead = null;
      try { const p = this.vpOf(vid); dead = !!(p && p.dead); } catch (e) {}
      rows.push({ day: dayOf(), vid, damage, cause: String(cause), healthBefore: hBefore, healthAfter: hAfter, scholarHealthBefore: sBefore, died: dead, scholarVid: vid === this.villagerId });
      return r;
    };
  }
  const policy = Object.assign({}, competent);
  const result = await runDays(Game, policy, { days, manifest });
  fs.mkdirSync(require('path').dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify({ seed, days: result.days, endReason: result.endReason, deaths: (result.samples && result.samples.deaths) || [], hurtRows: rows }, null, 2));
  console.log(JSON.stringify({ seed, days: result.days, endReason: result.endReason, deaths: ((result.samples && result.samples.deaths) || []).length, hurtRows: rows.length, out }));
}
main().catch(e => { console.error(e && e.stack || e); process.exit(1); });
