#!/usr/bin/env node
// scripts/hash-runner-butcharmor.js — extended day-hash runner for the
// butcharmor det-gate (one invocation = one 60d run, prints JSON).
// REPO/HASHREPO env selects which tree to load; BUTCHARMOR=0 gates the layer.
// Usage: HASHREPO=<tree> BUTCHARMOR=0 node scripts/hash-runner-butcharmor.js <seed> <policy> <days>
'use strict';
const path = require('path');
const REPO = process.env.HASHREPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const TF = require(path.join(REPO, 'scripts', 'policies', 'tribfloor'));

function h(Game) {
  const s = Game.state.scholar || {}, v = Game.state.village || {};
  let mats = {};
  try { mats = (Game.stashState().materials) || {}; } catch (e) {}
  const matStr = Object.keys(mats).sort().map(k => k + '=' + mats[k]).join(',');
  let wornHide = 0, wornP15 = 0;
  try {
    const eq = (globalThis.Scattering || {}).equipment;
    for (const rid of (v.roster || [])) {
      const p = (typeof Game.vpOf === 'function') ? Game.vpOf(rid) : null;
      if (!p || p.dead) continue;
      const te = (p.equipped || {}).torso;
      if (te && te.itemId === 'hide_armor') wornHide++;
      if (eq && eq.armorOf) { try { if ((eq.armorOf(p, Game.data.items) || 0) >= 15) wornP15++; } catch (e) {} }
    }
  } catch (e) {}
  let counterHides = 0;
  try { counterHides = ((s.prepStash) || []).filter(i => i && i.material === 'hide').reduce((t, i) => t + (i.units || 0), 0); } catch (e) {}
  const pantry = Math.round(((v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0)) / 100);
  return [s.day, Math.round(s.health || 0), Math.round(s.kcal || 0), (v.roster || []).length,
    Game.map.px, Game.map.py, Game.unlockedWave ? Game.unlockedWave() : 0, pantry,
    matStr, 'wh' + wornHide, 'w15' + wornP15, 'ch' + counterHides].join('|');
}

(async () => {
  const seed = parseInt(process.argv[2], 10), policyId = process.argv[3], days = parseInt(process.argv[4], 10);
  const policy = policyId === 'leadfeast' ? TF.leadfeast : TF.belongfeast;
  const { Game } = await loadGame({ seed, mode: 'butcharmor-detgate', fullTelemetry: false });
  await setupGame(Game);
  const hashes = [];
  const wrapped = Object.assign({}, policy);
  const base = policy.daily;
  wrapped.daily = (G, ctx) => { hashes.push(Game.state.scholar.day + ':' + h(Game)); return base ? base(G, ctx) : undefined; };
  let r;
  await quietLog(async () => { r = await runDays(Game, wrapped, { days, manifest: undefined, sampleEvery: 1 }); });
  console.log(JSON.stringify({ hashes, days: r.days, endReason: r.endReason }));
})().catch(e => { console.error('HASHRUNNER CRASH', e); process.exit(2); });
