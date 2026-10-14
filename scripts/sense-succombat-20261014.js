#!/usr/bin/env node
// scripts/sense-succombat-20261014.js — sense-test the succession-day
// transcript under SUCCOMBAT=1 (SENSE-TESTING LAW: read the transcript,
// judge meaning — the successor must read as desperate-but-sensible).
//
// Runs leadcourt+succombat on a chain-heavy seed, captures Game.say lines
// with day stamps, and dumps the narrative window around each succession
// plus the sc* counter firings.
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadcourt } = require('./policies/leadcourt');
let wrapSuccombat;
try { ({ wrapSuccombat } = require('./policies/succombat')); }
catch (e) { console.error('SKIP: ./policies/succombat was deleted per kill protocol (arm killed at pilot) — sense script retained as the durable record'); process.exit(0); }

const SEED = parseInt(process.env.SEED || '88', 10);
const DAYS = parseInt(process.env.DAYS || '60', 10);

(async () => {
  process.env.SUCCOMBAT = '1';
  const { Game, manifest } = await loadGame({ seed: SEED, mode: 'sc-sense' });
  await setupGame(Game);
  const said = [];
  const origSay = Game.say.bind(Game);
  Game.say = (t) => { try { said.push(`[d${(Game.state.scholar || {}).day}] ${String(t)}`); } catch (e) {} return origSay(t); };
  const policy = wrapSuccombat(leadcourt);
  const ctx = { policyId: policy.id, notes: [] };
  await policy.setup(Game, ctx);
  const p = Object.assign({}, policy);
  let ctxRef = null;
  const origDaily = policy.daily;
  p.daily = function (G, C) { ctxRef = C; if (origDaily) { try { return origDaily(G, C); } catch (e) {} } };
  const result = await runDays(Game, p, { days: DAYS, manifest, sampleEvery: 10 });
  delete process.env.SUCCOMBAT;

  const deaths = (result.samples.deaths || []).filter(d => d.player);
  console.log(`seed=${SEED} days=${result.days} end=${result.endReason}`);
  console.log('player deaths:', deaths.map(d => `d${d.day}:${d.cause}`).join(' '));
  console.log('sc counters:', JSON.stringify(Object.fromEntries(
    Object.entries(ctxRef || {}).filter(([k, v]) => /^sc[A-Z]/.test(k) && typeof v === 'number'))));

  // dump narrative windows around each succession day (±1 day)
  const succDays = new Set((ctxRef.scSuccessionDays || []));
  const keep = said.filter(line => {
    const m = line.match(/^\[d(\d+)\]/);
    if (!m) return false;
    const d = parseInt(m[1], 10);
    for (const s of succDays) if (Math.abs(d - s) <= 1) return true;
    return false;
  });
  // trim to the interesting beats: death, mantle, heal, hold, fight, rally
  const interesting = keep.filter(l =>
    /dead|dies|mantle|successor|🕯️|hold at haven|heal|first aid|Field medicine|rally|RALLY|ON ME|You go down|strikes|fled|flee/i.test(l));
  console.log(`\n--- succession windows (${interesting.length} beats) ---`);
  for (const l of interesting.slice(0, 120)) console.log(l);
  if (interesting.length > 120) console.log(`... (${interesting.length - 120} more)`);
})().catch(e => { console.error('SENSE ERROR', e); process.exit(2); });
