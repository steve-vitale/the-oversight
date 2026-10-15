#!/usr/bin/env node
// Read-only processing trace on the standard seeded comparison driver.
// node scripts/maker-counter-trace.js --seed 5 --out <evidence.json>
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i < 0 ? d : process.argv[i + 1]; };
const root = path.resolve(arg('root', path.join(__dirname, '..')));
const H = require(path.join(root, 'scripts/sim-harness'));
const { POLICY_REGISTRY: registry, runComparison } = require(path.join(root, 'scripts/sweep-compare'));
const { gameplayHash } = require('./gear-usage-audit');
(async () => {
  const seed = Number(arg('seed', 5)), id = arg('policy', 'maker'), base = registry[id];
  if (!base) throw new Error('Unknown policy ' + id);
  const mode = arg('mode', 'counter');
  if (!['counter', 'gear'].includes(mode)) throw new Error('Unknown trace mode ' + mode);
  let G; const events = [], lines = [];
  const snapshot = () => {
    const s = G.state.scholar;
    return JSON.parse(JSON.stringify({ bearer: G.villagerId, day: s.day, ticks: s.dayTicks,
      kcal: s.kcal, health: s.health, integration: s.integration, insideHaven: s.insideHaven,
      exiled: s.exiled, map: { x: G.map.px, y: G.map.py }, over: !!G.over,
      fight: !!G.tbfight, encounter: !!G.pendingEncounter, contest: !!G.state.activeContest,
      ...(mode === 'counter' ? { pantryCap: G.state.village.pantryCapKcal, pantry: G.state.village.pantry, counter: s.prepStash || [] }
        : { pack: s.inventory, equipped: s.equipped, recipe: (G.state.codex.recipes || {}).hide_armor, counterMaterials: (s.prepStash || []).filter(i => i.material) }) }));
  };
  registry[id] = Object.assign({}, base, { setup(g, ctx) {
    G = g;
    const say = G.say;
    G.say = function(t) { lines.push(String(t)); return say.apply(this, arguments); };
    const methods = mode === 'counter' ? ['cookFood', 'preserveFood', 'putAwayFinished'] : ['takePrepMaterial', 'craft', 'equip'];
    for (const name of methods) {
      const fn = G[name];
      G[name] = function(...args) {
        const trace = mode === 'gear' || name === 'putAwayFinished' || args[1] === G.state.scholar.prepStash;
        if (!trace) return fn.apply(this, args);
        const event = { method: name, index: typeof args[0] === 'object' ? null : args[0],
          args: args.map(a => a === G.state.scholar.prepStash ? 'prep-counter' :
            a == null || ['string', 'number', 'boolean'].includes(typeof a) ? a : '[container]'), before: snapshot() }, n = lines.length;
        try { const result = fn.apply(this, args); event.returnedTrue = result === true; event.returnKind = result === null ? 'null' : typeof result; return result; }
        finally { event.after = snapshot(); event.narration = lines.slice(n); events.push(event); }
      };
    }
    if (base.setup) return base.setup(g, ctx);
  } });
  let report;
  try { report = await H.quietLog(() => runComparison({ seeds: [seed], policies: [id], days: Number(arg('days', 150)) })); }
  finally { registry[id] = base; }
  const row = report.runs[0], stateHash = gameplayHash(G.state);
  const referencePath = path.resolve(arg('reference', 'evidence/2026-10-15/gear-usage-maker-counter-after-64.json'));
  const reference = JSON.parse(fs.readFileSync(referencePath, 'utf8')).rows.find(r => r.seed === seed && r.policy === id);
  const sourceHashes = {};
  for (const rel of ['src/js/game.js', 'src/js/corpses.js', 'src/js/food.js', 'src/js/storage.js', 'src/js/app.js', 'scripts/policies/competent.js', 'scripts/policies/livelihood.js', 'scripts/maker-counter-trace.js']) {
    sourceHashes[rel] = require('crypto').createHash('sha256').update(fs.readFileSync(rel === 'scripts/maker-counter-trace.js' ? __filename : path.join(H.ROOT, rel))).digest('hex');
  }
  const result = { seed, policy: id, mode, sourceHashes, sourceRoot: root, sourceHead: cp.execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(),
    driver: 'sweep-compare', days: row.days, won: !!row.won, deaths: row.deaths, stateHash, referencePath,
    referenceHash: reference && reference.stateHash, matchesReference: !!reference && stateHash === reference.stateHash, events };
  const out = arg('out', null);
  if (out) fs.writeFileSync(out, JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify({ seed, events: events.length, stateHash, matchesReference: result.matchesReference }));
  if (!result.matchesReference) process.exitCode = 1;
})().catch(e => { console.error(e); process.exitCode = 1; });
