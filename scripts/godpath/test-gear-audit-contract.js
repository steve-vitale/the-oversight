#!/usr/bin/env node
'use strict';
const K = require('./lib');
const { install, gameplayHash } = require('../gear-usage-audit');
const { execFileSync } = require('child_process');
const T = K.reporter('gear-usage-audit');
(async () => {
  const G = await K.load({ seed: 7 }); K.newRun(G);
  G.state.systemArrived = true;
  const s = G.state.scholar; s.inventory = [];
  G.state.notability = { player: { contestWin: 6 } };
  G.apState().fanClubs = { fight: 0, survival: 0, social: 0, showbiz: 70 };
  G.apState().lastPackageDay = -999;
  const rec = install(G);
  const ac = { contestId: 'box', participant: 'player', participants: ['player'], others: [], phase: 'intro', phaseIdx: 0 };
  const r = Math.random; Math.random = () => 0.3;
  try { G._contestEnd(ac, 'won', true); } finally { Math.random = r; }
  T.ok('real contest and nested fan package both grant', rec.grants.some(g => g.source === 'contest') && rec.grants.some(g => g.source === 'fan-package'));
  T.ok('nested rewards are counted exactly once', rec.grants.reduce((n, g) => n + g.n, 0) === s.inventory.reduce((n, it) => n + (it.units || 1), 0));
  T.ok('observer records real IDs, recipients and equipment fields', rec.grants.every(g => g.id && g.who === 'player' && g.tier === 3) && rec.grants.some(g => g.gear));
  const old = rec.grants.length;
  G._contestEnd(ac, 'won', true);
  T.ok('idempotent terminal is not a second acquisition', rec.grants.length === old);
  T.ok('observer reports no missing methods or swallowed wrapper errors', rec.missing.length === 0 && rec.errors.length === 0, JSON.stringify(rec.missing));
  G.learnRecipe('stone_knife', 3);
  s.inventory.push({ material: 'stone', units: 1 }, { material: 'vine', units: 1 });
  rec.sample();
  T.ok('recipe census separates knowledge from available materials', rec.recipeAccess.stone_knife.maxLevel === 3 && rec.recipeAccess.stone_knife.materialsReadySamples === 1);
  Math.random = () => 0.1;
  try { G.craft('stone_knife'); } finally { Math.random = r; }
  T.ok('craft census counts actual recipe attempts and successes', rec.crafts.stone_knife.attempts === 1 && rec.crafts.stone_knife.successes === 1);
  // Imported tooling must not dispatch the caller's --compare options.
  // The old bug tried reading nonexistent comparison files here.
  const out = execFileSync(process.execPath, ['-e', "process.argv.push('--compare','missing-before','missing-after'); require('./scripts/sweep-dashboard'); process.stdout.write('imported');"], { cwd: K.ROOT, encoding: 'utf8' });
  T.ok('dashboard imports ignore caller CLI arguments', out === 'imported');
  const run = observe => {
    const output = execFileSync(process.execPath, ['scripts/gear-usage-audit.js', '--child', '--seed', '7', '--days', '100', '--observe', observe], { cwd: K.ROOT, encoding: 'utf8', maxBuffer: 4 * 1024 * 1024 });
    return JSON.parse(output.split('@@GEAR@@').pop().trim());
  };
  const observed = run('1'), control = run('0');
  T.ok('hash identifies its normalization version', observed.stateHashVersion === 2 && control.stateHashVersion === 2);
  const a = { scholar: { day: 3 }, pacing: { lastTs: 10, dayMinutes: [0], totalMin: 0, futureField: 1 } };
  const b = { scholar: { day: 3 }, pacing: { lastTs: 900, dayMinutes: [0.01], totalMin: 0.01, futureField: 1 } };
  T.ok('machine-load timing diagnostics do not change the gameplay hash', gameplayHash(a) === gameplayHash(b));
  b.scholar.day++;
  T.ok('real gameplay changes still change the hash', gameplayHash(a) !== gameplayHash(b));
  b.scholar.day--; b.pacing.futureField++;
  T.ok('unknown pacing fields are retained in the hash', gameplayHash(a) !== gameplayHash(b));
  T.ok('100-day observed run preserves every gameplay-state field', observed.stateHash === control.stateHash, JSON.stringify({ observed: observed.stateHash, control: control.stateHash }));
  T.ok('observed trajectory matches the control ending and deaths', observed.won === control.won && observed.days === control.days && JSON.stringify(observed.deaths) === JSON.stringify(control.deaths));
  T.done();
})().catch(e => { console.error(e.stack); process.exitCode = 1; });
