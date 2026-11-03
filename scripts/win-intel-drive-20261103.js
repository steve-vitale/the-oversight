#!/usr/bin/env node
// win-intel-drive-20261103.js — panel driver for the win-intel proof.
// Usage: node scripts/win-intel-drive-20261103.js <repo-root> <out-json>
// Runs every fixture x seed as a separate process (harness rule) using
// this tree's proof script, but loading the TARGET repo's game code via
// WININTEL_REPO (so a before-run against master uses master code with
// the same fixtures). Prints a per-fixture summary; writes full rows.
'use strict';
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const repo = process.argv[2];
const outFile = process.argv[3] || null;
const script = path.join(__dirname, 'test-win-intel-20261103.js');
const seeds = [11, 22, 33, 44, 55, 66, 77, 88];
const fixtures = ['party', 'gear', 'avoid', 'seek', 'guard', 'standing', 'tend', 'standdown', 'trickhold', 'trickseek', 'engage', 'partial', 'control'];
const rows = [];
for (const fx of fixtures) {
  for (const s of seeds) {
    const r = spawnSync('node', [script, String(s), fx], { encoding: 'utf8', timeout: 120000, env: Object.assign({}, process.env, { WININTEL_REPO: repo }) });
    let row = null;
    try { row = JSON.parse((r.stdout || '').trim().split('\n').filter(Boolean).pop()); } catch (e) { row = null; }
    rows.push({ fixture: fx, seed: s, ok: r.status === 0, row, stderr: (r.stderr || '').slice(-300) });
  }
}
function pass(fx, row) {
  if (!row || row.skip) return false;
  switch (fx) {
    case 'party': return row.apiPresent && row.verdict === 'launch' && row.partyDepartures >= 1 && row.sameTarget;
    case 'gear': return row.apiPresent && row.verdict === 'hold' && row.gearHolds >= 1 && !row.departed;
    case 'avoid': return row.apiPresent && row.ffCalls === 0 && row.statsDelta.avoidances >= 1;
    case 'seek': return row.apiPresent && row.ffCalls >= 1 && row.ffAwareness === false && row.statsDelta.seekContacts >= 1;
    case 'guard': return row.apiPresent && row.verdict1 === 'hold' && row.veteranGuardHolds >= 1 && row.verdict2 === 'launch' && row.sameTarget2;
    case 'standing': return row.apiPresent && row.ffCalls >= 1 && row.ffAwareness === false && row.statsDelta.standingContacts >= 1;
    case 'trickhold': return row.apiPresent && row.statsDelta.trickHolds >= 1 && row.statsDelta.seekContacts === 0 && row.ffAwareness !== false;
    case 'trickseek': return row.apiPresent && row.ffCalls >= 1 && row.ffAwareness === false && row.statsDelta.seekContacts >= 1;
    case 'engage': return row.apiPresent && !row.prePlan && row.planStage === 'party' && row.planSeeds >= 1 && row.stageAdvances >= 1;
    case 'partial': return row.apiPresent && row.verdict !== 'launch' && !row.awayFighter && !row.awayCompanion && row.partyInvites === 0 && row.partyDepartures === 0;
    case 'tend': return row.apiPresent && row.bondTends >= 2 && row.trustA > 42 && row.trustB > 45 && row.phase2Tends === 0;
    case 'standdown': return row.apiPresent && row.res && row.musterStanddowns >= 1 && row.musterGone1 && row.trustAfter1 === 40 && row.phase2Standdowns === 0 && row.musterStands2;
    case 'control': return row.ffCalls >= 1 && row.ffAwareness === true && Object.values(row.statsDelta || {}).every(n => n === 0);
    default: return false;
  }
}
const summary = {};
for (const fx of fixtures) {
  const rs = rows.filter(r => r.fixture === fx);
  summary[fx] = { n: rs.length, pass: rs.filter(r => r.ok && pass(fx, r.row)).length,
    rows: rs.map(r => ({ seed: r.seed, ok: r.ok, pass: r.ok && pass(fx, r.row), row: r.row, err: r.ok ? undefined : r.stderr })) };
}
console.log(JSON.stringify(summary, null, 2));
if (outFile) fs.writeFileSync(outFile, JSON.stringify({ repo, rows, summary }, null, 2));
