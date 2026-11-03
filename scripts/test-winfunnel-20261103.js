#!/usr/bin/env node
// test-winfunnel-20261103.js — proof test for the funnel analyzer only
// (no harness, no game load): builds a 2-seed synthetic corpus in /tmp,
// runs scripts/winfunnel-analyze-20261103.js on it, and asserts the
// arm-3 aggregates (releases, veterans banked, national reached,
// ally-join rate) and the wave-5 chain counts. Exits nonzero on any
// failed assertion; prints PASS counts.
'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');
const REPO = path.join(__dirname, '..');

function seedFile(o) {
  return {
    seed: o.seed, anchorCommit: 'test', days: o.days, endReason: 'village-lost',
    won: false, scaleRank: o.endRank, maxWave: o.maxWave, tableLatch: 0,
    tableWaiting: false, tableDone: false, tableSeat: null, endGate: { w4: 0, w5: o.faced },
    targetRows: [], castRows: [], spawnRows: o.spawns || [], triggerRows: [],
    startRows: o.starts || [], tbEndRows: [], fieldRows: o.fields || [],
    removeRows: [], daily: o.daily, instrumentErrors: [],
    extSenseCalls: o.sense || [], extAidRows: [], extAllyFieldRows: o.allyFields || [],
    extScaleDaily: o.scaleDaily || [],
  };
}
function dailyRow(day, opts) {
  return {
    day: day, unlocked: opts.unlocked || 0, standing: 0,
    readiness5: { ready: !!opts.ready, armored: opts.armored || 0, armed: opts.armed || 0, veterans: opts.vets || 0 },
    facedW4: [], facedW5: opts.facedW5 || [],
  };
}
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'winfunnel-proof-'));
// Seed A: releases on day 10 (vets 2), unlocks day 10, faces 1 kind, 1 kill via field vKill, national reached.
const seedA = seedFile({
  seed: 1, days: 50, endRank: 'village', maxWave: 5, faced: 1,
  daily: [dailyRow(9, { unlocked: 4, vets: 1 }), dailyRow(10, { unlocked: 5, ready: true, vets: 2, facedW5: ['editor'] })],
  scaleDaily: [{ day: 9, rank: 'village' }, { day: 20, rank: 'national' }, { day: 50, rank: 'village' }],
  spawns: [{ wave: 5, campaignOnly: false }],
  fields: [{ wave: 5, outcome: 'vKill', id: 'editor' }],
  allyFields: [
    { allies: 1, allyVids: 1 }, { allies: 0, allyVids: 0 }, { allies: 2, allyVids: 2 }, { allies: 0, allyVids: 0 },
  ],
  sense: [{ returned: 1 }, { returned: 0 }, { returned: 2 }],
});
// Seed B: never releases (vets max 1), never unlocks, no field fights.
const seedB = seedFile({
  seed: 2, days: 40, endRank: 'village', maxWave: 4, faced: 0,
  daily: [dailyRow(40, { unlocked: 4, vets: 1 })],
  scaleDaily: [{ day: 40, rank: 'village' }],
  allyFields: [], sense: [],
});
fs.writeFileSync(path.join(dir, 'a.json'), JSON.stringify(seedA) + '\n');
fs.writeFileSync(path.join(dir, 'b.json'), JSON.stringify(seedB) + '\n');
const out = execSync('node ' + path.join(REPO, 'scripts', 'winfunnel-analyze-20261103.js') + ' ' + dir, { encoding: 'utf8' });
const aggText = out.split('=== AGGREGATE (headline denominator = ALL runs) ===')[1];
if (!aggText) { console.error('PROOF FAIL: no aggregate block'); process.exit(1); }
const agg = JSON.parse(aggText);
let pass = 0;
function check(name, got, want) {
  if (JSON.stringify(got) === JSON.stringify(want)) { pass++; }
  else { console.error('PROOF FAIL: ' + name + ' got ' + JSON.stringify(got) + ' want ' + JSON.stringify(want)); process.exit(1); }
}
check('seeds', agg.seeds, 2);
check('released5', agg.released5, 1);
check('veteransBankedSeeds', agg.veteransBankedSeeds, 1);
check('maxVeteransDist', agg.maxVeteransDist, { 2: 1, 1: 1 });
check('unlockedW5', agg.unlockedW5, 1);
check('facedSeeds', agg.facedSeeds, 1);
check('fieldKillW5', agg.fieldKillW5, 1);
check('killedSeeds', agg.killedSeeds, 1);
check('nationalReached', agg.nationalReached, 1);
check('nationalAtEnd', agg.nationalAtEnd, 0);
check('fieldFights', agg.fieldFights, 4);
check('allyJoinFights', agg.allyJoinFights, 2);
check('allyJoinRate', agg.allyJoinRate, 0.5);
check('senseCalls', agg.senseCalls, 3);
check('senseHits', agg.senseHits, 2);
console.log('WINFUNNEL PROOF PASS: ' + pass + '/15');
