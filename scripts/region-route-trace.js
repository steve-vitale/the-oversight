#!/usr/bin/env node
// Observe one normal comparison run. Never grant food, knowledge or actions.
'use strict';
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i < 0 ? d : process.argv[i + 1]; };
const root = path.resolve(arg('root', path.join(__dirname, '..')));
const H = require(path.join(root, 'scripts/sim-harness'));
const { runComparison, POLICY_REGISTRY: registry } = require(path.join(root, 'scripts/sweep-compare'));
const { gameplayHash } = require('./gear-usage-audit');
(async () => {
  const id = arg('policy', 'capable'), base = registry[id];
  if (!base) throw new Error('Unknown policy ' + id);
  const region = arg('region', 'eu_temperate'), origin = arg('origin', 'Columbus, Ohio');
  let G; const events = [], narration = [];
  const snapshot = () => {
    const s = G.state.scholar, v = G.state.village;
    return JSON.parse(JSON.stringify({ day: s.day, bearer: G.villagerId,
      ticks: s.dayTicks, health: s.health, kcal: s.kcal, insideHaven: s.insideHaven,
      map: { x: G.map.px, y: G.map.py }, population: v.roster.length,
      hungryDays: v.hungryDays || 0, pantryKcal: (v.pantry || []).reduce((n, i) => n + (i.units || 0) * (i.kcalEach || 0), 0),
      pantry: v.pantry, healthByPerson: v.health, roles: v.roles,
      over: !!G.over, villageLost: !!G.villageLost }));
  };
  registry[id] = Object.assign({}, base, { setup(g, ctx) {
    G = g;
    const say = G.say;
    G.say = function (text) { narration.push({ day: G.state.scholar.day, text: String(text) }); return say.apply(this, arguments); };
    for (const name of ['villageEats', 'endDay']) {
      const fn = G[name];
      if (typeof fn !== 'function') throw new Error('Missing trace method ' + name);
      G[name] = function (...args) {
        const event = { method: name, before: snapshot() }, start = narration.length;
        try { return fn.apply(this, args); }
        finally { event.after = snapshot(); event.narration = narration.slice(start); events.push(event); }
      };
    }
    if (base.setup) return base.setup(g, ctx);
  } });
  let report;
  try { report = await H.quietLog(() => runComparison({ region, origin, seeds: [Number(arg('seed', 777))], policies: [id], days: Number(arg('days', 150)) })); }
  finally { registry[id] = base; }
  const hashes = {};
  for (const rel of ['scripts/sweep-compare.js', 'scripts/sim-harness.js', 'scripts/policies/capable.js', 'scripts/policies/livelihood.js', 'src/js/game.js', 'src/data/regions.json']) hashes[rel] = crypto.createHash('sha256').update(fs.readFileSync(path.join(root, rel))).digest('hex');
  hashes['scripts/region-route-trace.js'] = crypto.createHash('sha256').update(fs.readFileSync(__filename)).digest('hex');
  const result = { driver: 'sweep-compare', root, sourceHashes: hashes, row: report.runs[0], stateHash: gameplayHash(G.state), events };
  const reference = arg('reference', null);
  if (reference) {
    const row = JSON.parse(fs.readFileSync(reference, 'utf8')).rows.find(r => r.policy === id && r.seed === result.row.seed && r.region === region && r.origin === origin);
    result.referenceHash = row && row.stateHash;
    result.matchesReference = !!row && row.stateHash === result.stateHash;
    if (!result.matchesReference) process.exitCode = 1;
  }
  if (arg('out', null)) fs.writeFileSync(arg('out'), JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify({ row: result.row, stateHash: result.stateHash, matchesReference: result.matchesReference, events: events.length }));
})().catch(e => { console.error(e.stack); process.exitCode = 1; });
