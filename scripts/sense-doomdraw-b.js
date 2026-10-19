#!/usr/bin/env node
// sense-doomdraw-b.js — SENSE-TESTING LAW for the doomed-only draw discipline.
//
// Finds the highest-engagement armed seed (max floor-bound draws) from the
// pilot sweep, re-runs it armed, and prints the bound-night beats with
// context: the floor voice line, hunger lines, spoil lines, and a sample of
// villager dialogue/beats around them. The bar: does the floor read as a
// cook making a sensible call (keep two days' food back; tonight we eat
// what won't keep), do villagers react like people to short meals, and is
// anything robotic, static, or repeated?
//
// Also samples villager behavior directly: roster status, hunger/health,
// and recent dialogue beats — flag anything robotic.
//
// Usage: SEED=<n> POLICY=leaddoomdraw|belongdoomdraw DAYS=90 node scripts/sense-doomdraw-b.js
// Defaults: top-engagement seed/policy from the pilot sweep.
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
let L;
try { L = require('./policies/doomdraw'); }
catch (e) {
  if (e && e.code === 'MODULE_NOT_FOUND') {
    console.log('INFO-SKIP: sim-doomdraw-b layer killed per protocol; sense capture vacuous, exit 0.');
    process.exit(0);
  }
  throw e;
}
const { withDoomDraw } = L;
const { leadfeast, belongfeast } = require('./policies/feastscale');

const DIR = process.env.SWEEP_DIR || '/tmp/sim-doomdraw-b';

function topEngagement() {
  let best = null;
  for (const p of ['leaddoomdraw', 'belongdoomdraw']) {
    const f = path.join(DIR, `sweep-armed-${p}.json`);
    if (!fs.existsSync(f)) continue;
    for (const r of JSON.parse(fs.readFileSync(f, 'utf8')).rows) {
      const b = (r.end && r.end.ddBound) || 0;
      if (!best || b > best.bound) best = { seed: r.seed, policy: p, bound: b };
    }
  }
  return best;
}

const pick = topEngagement();
const SEED = parseInt(process.env.SEED || (pick && pick.seed) || '6551', 10);
const POLICY_ID = process.env.POLICY || (pick && pick.policy) || 'leaddoomdraw';
const DAYS = parseInt(process.env.DAYS || '90', 10);
const wrapped = withDoomDraw(POLICY_ID === 'belongdoomdraw' ? belongfeast : leadfeast, POLICY_ID, 'sense');

(async () => {
  process.env.DOOMDRAW = '1';
  process.env.FEASTSCALE_R13 = '1';
  process.env.SEATDRIVE = '0';
  const { Game } = await loadGame({ seed: SEED, mode: 'sense-doomdraw', fullTelemetry: false });
  await setupGame(Game);
  const beats = [];
  const oSay = Game.say;
  Game.say = function (s) {
    const str = String(s);
    const day = (Game.state.scholar || {}).day || 0;
    if (/keeps .* days' food back|went to sleep hungry|threw out spoiled|spoiled stores|Nothing fresh left/i.test(str)) {
      beats.push({ day, kind: /keeps .* days' food back/.test(str) ? 'FLOOR' : /hungry/.test(str) ? 'HUNGER' : 'SPOIL', text: str.slice(0, 300) });
    } else if (/says|tells|asks|mutters|laughs|shouts|whispers/i.test(str) && beats.length < 400) {
      beats.push({ day, kind: 'TALK', text: str.slice(0, 220) });
    }
    return oSay.apply(this, arguments);
  };
  const policy = Object.assign({}, wrapped);
  let ctxCap = null;
  const oUp = policy.upkeep;
  policy.upkeep = (G, ctx) => { ctxCap = ctx; if (oUp) return oUp(G, ctx); };
  await runDays(Game, policy, { days: DAYS, manifest: null });
  const tele = (ctxCap && ctxCap._ddTele) || {};
  console.log(`seed=${SEED} policy=${POLICY_ID} days=${DAYS} bound=${tele.bound || 0} withheld=${Math.round(tele.withheld || 0)} voiced=${tele.voiced || 0} doomedShare=${tele.drawnTotal ? Math.round(100 * (tele.doomedDrawn || 0) / tele.drawnTotal) : '-'}%`);
  console.log('\n--- FLOOR beats (the discipline speaking) ---');
  for (const b of beats.filter(x => x.kind === 'FLOOR').slice(0, 12)) console.log(`d${b.day}: ${b.text}`);
  console.log('\n--- HUNGER beats near bound nights ---');
  const floorDays = new Set(beats.filter(x => x.kind === 'FLOOR').map(x => x.day));
  for (const b of beats.filter(x => x.kind === 'HUNGER').slice(0, 12)) {
    const near = [...floorDays].some(d => Math.abs(d - b.day) <= 1) ? ' [~floor]' : '';
    console.log(`d${b.day}${near}: ${b.text}`);
  }
  console.log('\n--- SPOIL beats (did the floor manufacture rot?) ---');
  for (const b of beats.filter(x => x.kind === 'SPOIL').slice(0, 8)) console.log(`d${b.day}: ${b.text}`);
  console.log('\n--- TALK sample (do villagers sound like people?) ---');
  const talk = beats.filter(x => x.kind === 'TALK');
  const step = Math.max(1, Math.floor(talk.length / 12));
  for (let i = 0; i < talk.length && i < 12 * step; i += step) console.log(`d${talk[i].day}: ${talk[i].text}`);
  console.log('\n--- roster sample (hunger/health/roles) ---');
  try {
    const v = Game.state.village || {};
    const ids = (v.roster || []).slice(0, 6);
    for (const id of ids) {
      const p = Game.getPerson ? Game.getPerson(id) : null;
      const n = Game.npcNeeds ? Game.npcNeeds(id) : {};
      const name = p ? String(p.name || id).split(' ')[0] : id;
      console.log(`${name}: hunger=${Math.round(n.hunger || 0)} health=${(v.health && v.health[id]) || '?'} occ=${(p && p.formerOccupation) || '?'}`);
    }
    console.log(`roster=${(v.roster || []).length} day=${(Game.state.scholar || {}).day}`);
  } catch (e) { console.log('(roster read failed: ' + e.message + ')'); }
  process.exit(0);
})().catch(e => { console.error(e); process.exit(2); });
