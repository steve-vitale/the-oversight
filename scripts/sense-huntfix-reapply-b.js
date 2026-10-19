#!/usr/bin/env node
// scripts/sense-huntfix-reapply-b.js — SENSE-TESTING sampler (Steve 2026-10-11):
// capture real hunt transcripts from a short layer-on sim and print them for
// meaning/coherence judgment. Not counts — read the lines.
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const HS = require('./policies/huntstaff');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { leadfeast } = require('./policies/feastscale');

const SEED = parseInt(process.env.SENSE_SEED || '31603', 10);
const DAYS = parseInt(process.env.SENSE_DAYS || '40', 10);

(async () => {
  process.env.HUNTSTAFF = '1'; process.env.FEASTSCALE_R13 = '1';
  const policy = HS.withHuntStaff(leadfeast, 'leadfeast+huntstaff', 'sense');
  const { Game } = await loadGame({ seed: SEED, mode: 'leanwinter', fullTelemetry: false });
  await setupGame(Game);
  const sayLines = [], huntLines = [];
  const oSay = Game.say.bind(Game);
  Game.say = function (s) {
    try { if (typeof s === 'string') { sayLines.push(`d${(Game.state.scholar || {}).day || 0}: ${s}`); if (/🏹|hunt|treeline|hunting/i.test(s)) huntLines.push(sayLines[sayLines.length - 1]); } } catch (e) {}
    return oSay.apply(this, arguments);
  };
  const oHunt = Game.villagerHuntResolve.bind(Game);
  const resolves = [];
  Game.villagerHuntResolve = function (vid, eff) {
    const r = oHunt.apply(this, arguments);
    try {
      const p = Game.getPerson(vid) || {};
      resolves.push({ day: (Game.state.scholar || {}).day || 0, who: p.name || vid, occ: p.formerOccupation || '', eff: Number(eff).toFixed(2), kcal: r.kcal, note: r.note || null, msg: r.msg });
    } catch (e) {}
    return r;
  };
  await quietLog(async () => { await runDays(Game, policy, { days: DAYS, sampleEvery: 30 }); });
  console.log(`=== sense-huntfix-reapply-b seed=${SEED} days=${DAYS} ===`);
  console.log(`--- hunt resolves: ${resolves.length} ---`);
  for (const r of resolves) {
    console.log(`d${r.day} ${r.who} (${r.occ}) eff=${r.eff} kcal=${r.kcal}${r.note ? ' [' + r.note + ']' : ''}`);
    console.log(`    ${r.msg}`);
  }
  console.log(`--- hunt-adjacent narration (${huntLines.length} lines) ---`);
  for (const l of huntLines.slice(0, 30)) console.log(l);
  // does the hunter read like a person? sample one hunter's deed ledger.
  try {
    const roster = ((Game.state || {}).village || {}).roster || [];
    console.log(`--- roster occupations (first 12) ---`);
    for (const vid of roster.slice(0, 12)) {
      const p = Game.getPerson(vid) || {};
      console.log(`  ${p.name || vid}: ${p.formerOccupation || '—'}`);
    }
  } catch (e) {}
})().catch(e => { console.error('SENSE FAILED', e); process.exit(1); });
