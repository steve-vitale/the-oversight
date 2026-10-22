#!/usr/bin/env node
// test-surplusfeed-b.js — removal proof (Steve 2026-10-21: SURPLUSFEED
// governor REMOVED, not parked; see docs/DECISIONS.md 2026-10-21).
//
// Was: proof for the surplus-share governor (arm sim-surplusfeed-b).
// Now: asserts the governor is GONE from the live game — the functions are
// unmounted, no source references remain in src/js/, and the env flag no
// longer changes any trajectory (gone, not parked).
//
// Assertions:
//   1. typeof Game.surplusFeedGovernor === 'undefined'
//   2. typeof Game._surplusFeedOn === 'undefined'
//   3. no SURPLUSFEED / surplusFeedGovernor / _surplusFeedOn matches in
//      src/js/ (source grep).
//   4. a 180d SURPLUSFEED=1 run and a 180d SURPLUSFEED-unset run produce
//      byte-identical canonical trajectories (flag has no effect).
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast } = require('./policies/feastscale');

const SEED = 6401;
let failures = 0;
function ok(name, cond, detail) {
  console.log((cond ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ' — ' + detail : ''));
  if (!cond) failures++;
}

function canon(Game) {
  const v = (Game.state || {}).village || {};
  const items = (v.pantry || [])
    .map(it => [it.name, it.kcalEach, it.units, it.spoilDay, it.foodState, it.safe ? 1 : 0].join('|'))
    .sort().join(';');
  const roster = (v.roster || []).join(',');
  const s = (Game.state || {}).scholar || {};
  const trimDays = Object.keys(v._surplusFeed ? (v._surplusFeed.days || {}) : {}).length;
  return JSON.stringify({
    d: s.day, pk: items, r: roster, hp: s.hp, hu: Math.round(s.hunger || 0),
    trimDays, trimState: v._surplusFeed === undefined ? 'none' : 'present',
  });
}

async function trajectory(env) {
  if (env) process.env.SURPLUSFEED = '1'; else delete process.env.SURPLUSFEED;
  const { Game } = await loadGame({ seed: SEED, mode: 'surplusfeed-removed-check', fullTelemetry: false });
  await setupGame(Game);
  await runDays(Game, leadfeast, { days: 180, manifest: null });
  delete process.env.SURPLUSFEED;
  return canon(Game);
}

(async () => {
  const { Game } = await loadGame({ seed: SEED, mode: 'surplusfeed-gone-probe', fullTelemetry: false });
  ok('Game.surplusFeedGovernor is gone', typeof Game.surplusFeedGovernor === 'undefined');
  ok('Game._surplusFeedOn is gone', typeof Game._surplusFeedOn === 'undefined');

  const srcDir = path.join(__dirname, '..', 'src', 'js');
  let hits = [];
  for (const f of fs.readdirSync(srcDir)) {
    if (!f.endsWith('.js')) continue;
    const t = fs.readFileSync(path.join(srcDir, f), 'utf8');
    for (const [i, line] of t.split('\n').entries()) {
      if (/surplusfeed|surplusFeedGovernor|_surplusFeedOn/i.test(line)) hits.push(f + ':' + (i + 1));
    }
  }
  ok('no surplusfeed references in src/js/', hits.length === 0, hits.slice(0, 5).join(' | '));

  // SURPLUSFEED=1 is a dead flag: trajectories must be identical.
  const a = await trajectory(false);
  const b = await trajectory(true);
  const pa = JSON.parse(a), pb = JSON.parse(b);
  ok('SURPLUSFEED=1 trajectory identical to unset', a === b);
  ok('no trim telemetry anywhere (trimDays=0)', pa.trimDays === 0 && pb.trimDays === 0,
    'flag-unset trimDays=' + pa.trimDays + ' flag-set trimDays=' + pb.trimDays);
  ok('no _surplusFeed state written', pa.trimState === 'none' && pb.trimState === 'none');

  console.log(failures === 0 ? 'ALL GREEN' : failures + ' FAILURES');
  process.exit(failures === 0 ? 0 : 1);
})().catch(e => { console.error('TEST CRASH', e); process.exit(2); });
