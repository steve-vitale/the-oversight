#!/usr/bin/env node
'use strict';
// Fast maintenance hook: collector/contract edits need a real retained proof.
// No gameplay is loaded. check.js discovers this in both quick and full runs.
const fs = require('fs'), path = require('path'), crypto = require('crypto'), zlib = require('zlib');
const T = require('./lib').reporter('measurement-workflow');
const root = path.resolve(__dirname, '../..');
const sha = b => crypto.createHash('sha256').update(b).digest('hex');
const textHash = f => sha(fs.readFileSync(path.join(root, f), 'utf8').replace(/\r\n/g, '\n'));
const proof = require('../balance-proof.json'), contract = require('../balance-metrics.json');
const bytes = fs.readFileSync(path.join(root, proof.panel));
const panel = JSON.parse(zlib.gunzipSync(bytes));
const ids = contract.metrics.map(m => m.id);
T.ok('metric IDs are unique and every contract declares units, direction and tolerance',
  ids.length > 0 && new Set(ids).size === ids.length && contract.metrics.every(m =>
    m.id && m.label && m.unit && ['higher', 'lower', 'neutral'].includes(m.direction) && Number.isFinite(m.tolerance) && m.tolerance >= 0));
T.ok('sampling and confirmation settings remain valid', Number.isSafeInteger(contract.minimumPairs) && contract.minimumPairs > 1 &&
  Number.isSafeInteger(contract.confirmationSeeds) && contract.confirmationSeeds >= contract.minimumPairs && Number.isSafeInteger(contract.bootstrapSamples) && contract.bootstrapSamples > 0);
T.ok('retained real panel matches its proof digest', sha(bytes) === proof.panelDigest);
T.ok('collector and contract have a current proof (see SIMULATING.md: Maintaining measurement)',
  Object.entries(proof.normalizedSources).every(([f, hash]) => textHash(f) === hash));
T.ok('every retained real observation emits exactly the contracted metrics, with explicit unknowns',
  panel.rows.length > 0 && panel.rows.every(r => Object.keys(r.metrics).sort().join(',') === ids.slice().sort().join(',') &&
    Object.values(r.metrics).every(v => v === null || Number.isFinite(v))));
T.ok('all retained policy cohorts have passing sampled observer neutrality and stable sources', panel.validity.sourcesStable &&
  panel.options.policies.every(p => panel.validity.neutrality.some(n => n.policy === p && n.match && !n.warnings)) &&
  panel.rows.every(r => !r.warnings.length && !r.observerErrors.length && !r.gear.errors.length));
T.done();
