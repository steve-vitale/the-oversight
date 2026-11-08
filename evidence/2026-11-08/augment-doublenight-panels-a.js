#!/usr/bin/env node
// augment-doublenight-panels-a.js — one-off demonstration step for
// sim-comparecontract-a (see evidence/2026-11-08/sim-comparecontract-a.md).
//
// Copies the doublenight branch panels (read-only; the branch is never
// merged, the originals are never modified) into evidence/2026-11-08/ and
// adds the ONE field the repair records at build time — registrationDigest
// — computed from the exact scripts/sweep-compare.js content at each
// panel's recorded sourceHead, with the panel's own policies. That is
// exactly what a build with the patched code would have recorded; nothing
// else in the panels is touched (rows, sources, digests, validity are
// copied verbatim, so the augmentation is verifiable by diff).
// Usage: node evidence/2026-11-08/augment-doublenight-panels-a.js
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process'), crypto = require('crypto'), zlib = require('zlib');
const { registrationNormalizedSource } = require('../../scripts/balance-panel');
const root = path.resolve(__dirname, '..', '..');
const branch = 'sim-doublenight-a';
const outDir = path.join(root, 'evidence', '2026-11-08');
function show(ref, p) { return cp.execFileSync('git', ['show', ref + ':' + p], { cwd: root, maxBuffer: 64 * 1024 * 1024 }); } // raw Buffer: panels are gzipped
function loadPanel(ref, p) { return JSON.parse(zlib.gunzipSync(show(ref, p)).toString('utf8')); }
const pairs = [];
for (const leg of ['before', 'after']) {
  const src = 'evidence/2026-11-07/doublenight-fix-a-panel-' + leg + '/panel.json.gz';
  const panel = loadPanel(branch, src);
  const harnessText = show(panel.sourceHeadStart, 'scripts/sweep-compare.js').toString('utf8');
  const reg = crypto.createHash('sha256').update(registrationNormalizedSource(harnessText, panel.options.policies)).digest('hex');
  const augmented = { ...panel, registrationDigest: reg };
  const dir = path.join(outDir, 'doublenight-fix-a-panel-' + leg);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'panel.json.gz'), zlib.gzipSync(JSON.stringify(augmented) + '\n'));
  // Also keep an un-augmented copy, so the original invalid decision is reproducible.
  const plainDir = path.join(outDir, 'doublenight-fix-a-panel-' + leg + '-orig');
  fs.mkdirSync(plainDir, { recursive: true });
  fs.writeFileSync(path.join(plainDir, 'panel.json.gz'), zlib.gzipSync(JSON.stringify(panel) + '\n'));
  console.log(leg + ': head ' + panel.sourceHeadStart.slice(0, 8) + ' policies ' + panel.options.policies.join(',') + ' registrationDigest ' + reg.slice(0, 16) + '...');
  pairs.push({ leg, reg });
}
// Sanity: the exemption fires only if both legs agree on the normalized digest.
if (pairs[0].reg !== pairs[1].reg) { console.error('REGISTRATION DIGESTS DIFFER — exemption does not fire'); process.exitCode = 1; }
else console.log('registration digests agree — the registration-only exemption fires for this pair.');
// Sanity: the exported builder agrees with this script's computation on the current tree.
const current = require('../../scripts/balance-panel').registrationDigest(root, ['competent']);
const recomputed = crypto.createHash('sha256').update(registrationNormalizedSource(fs.readFileSync(path.join(root, 'scripts/sweep-compare.js'), 'utf8'), ['competent'])).digest('hex');
if (current !== recomputed) { console.error('builder digest mismatch on current tree'); process.exitCode = 1; }
else console.log('builder digest self-check ok (' + current.slice(0, 16) + '...).');
