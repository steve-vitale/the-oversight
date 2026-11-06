#!/usr/bin/env node
// test-crisis-r132-instruments.js — proof test for the r132 instrument fixes.
// (1) Driver transcript fix (slice(-2) -> slice(prevLen)): the pre-fix
//     seed-13301 output (r132-det, old driver) vs the post-fix output
//     (r132-fixtest, fixed driver) must differ ONLY in convosDriven[].npcLines
//     counts (up) and in transcript files by ADDED YOU:/NPC: lines only.
// (2) Analyzer killer-subject filter + C7b: a synthetic panel proves a
//     "Ruth killed the Herald" line is not a death mismatch, a real death
//     line still is, and C7b corpse-cause counts match the corpse record.
// No sim re-run: part (1) compares committed evidence; part (2) runs the
// analyzer on a synthetic record in os.tmpdir(). Exit non-zero on failure.
'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');

let failures = 0;
function check(cond, label) {
  console.log((cond ? 'PASS' : 'FAIL') + ' ' + label);
  if (!cond) failures++;
}

const GOAL_EVID = path.join(__dirname, '..', '..', '..', 'goals', 'the-scattering-roguelite-survival-game', 'hidden_files', 'evidence', '2026-11-06');
const DET = process.env.R132_DET_DIR || path.join(GOAL_EVID, 'r132-det');
const FIX = process.env.R132_FIXTEST_DIR || path.join(GOAL_EVID, 'r132-fixtest');

// ---- Part 1: driver transcript fix, before (r132-det) vs after (r132-fixtest)
const before = JSON.parse(fs.readFileSync(path.join(DET, 'journey-crisis-r132-delayed-seed13301.json'), 'utf8'));
const after = JSON.parse(fs.readFileSync(path.join(FIX, 'journey-crisis-r132-delayed-seed13301.json'), 'utf8'));
function jsonDiffs(a, b, p, out) {
  if (typeof a !== typeof b) { out.push(p + ':type'); return; }
  if (a && b && typeof a === 'object') {
    if (Array.isArray(a)) {
      if (a.length !== b.length) out.push(p + ':len');
      for (let i = 0; i < Math.min(a.length, b.length); i++) jsonDiffs(a[i], b[i], p + '[' + i + ']', out);
    } else {
      for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
        if (!(k in a) || !(k in b)) out.push(p + '/' + k + ':missing');
        else jsonDiffs(a[k], b[k], p + '/' + k, out);
      }
    }
  } else if (a !== b) out.push(p + ':value');
}
const diffs = [];
jsonDiffs(before, after, '', diffs);
const npcOnly = diffs.every(d => /^\/convosDriven\[\d+\]\/npcLines:value$/.test(d));
check(diffs.length > 0 && npcOnly, 'driver fix: JSON differs ONLY in convosDriven[].npcLines (' + diffs.length + ' diffs)');
check(before.convosDriven.every((c, i) => after.convosDriven[i].npcLines >= c.npcLines),
  'driver fix: every npcLines count rose or held');
check(before.convosDriven.some((c, i) => after.convosDriven[i].npcLines > c.npcLines),
  'driver fix: at least one npcLines count rose (previously-dropped lines now captured)');
let added = 0, removed = 0, badAdded = 0;
for (const f of fs.readdirSync(DET).filter(x => x.endsWith('.txt'))) {
  const oldLines = fs.readFileSync(path.join(DET, f), 'utf8').split('\n');
  const newLines = fs.readFileSync(path.join(FIX, f), 'utf8').split('\n');
  // additions-only: every old line must appear in the new file in order
  let j = 0;
  for (const l of newLines) { if (j < oldLines.length && l === oldLines[j]) j++; }
  if (j !== oldLines.length) removed++;
  const extra = newLines.filter(l => !oldLines.includes(l));
  added += extra.length;
  for (const l of extra) if (!/^(YOU|NPC): /.test(l)) badAdded++;
}
check(removed === 0, 'driver fix: zero transcript lines removed');
check(added > 0, 'driver fix: transcript lines added (' + added + ')');
check(badAdded === 0, 'driver fix: every added line is a YOU:/NPC: transcript line');

// ---- Part 2: analyzer killer-subject filter + C7b on a synthetic panel
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'r132-proof-'));
const rec = {
  seed: 99901, days: 20, endReason: 'game-over', raids: [], gorgeNights: [],
  sorties: [
    { day: 10, attempt: 1, nightsWaited: 4, targets: [{ id: 'herald', name: 'The Herald', hp: 100 }],
      ret: { ok: true, cleared: 0, broke: true, remaining: 1, paid: 2000, why: null },
      bench: {}, crisisBefore: null, crisisAfter: null, resolutionsDuring: [],
      pantryBefore: 5000, pantryAfter: 3000, pantryDelta: -2000,
      musterSize: 1, musterNames: ['Quinn', 'Miguel'], sortieLine: null,
      deathsDuring: [],
      deathsDuringSay: [{ line: 'Ruth killed the Herald and the Grief Counselor', names: ['Ruth'], namesRoster: ['Ruth'], namesMuster: [] }],
      episodeInfo: [{ id: 'herald', episode: 1 }], fights: [], after: [] },
    { day: 12, attempt: 2, nightsWaited: 3, targets: [{ id: 'eulogy', name: 'The Eulogy', hp: 200 }],
      ret: { ok: true, cleared: 0, broke: true, remaining: 1, paid: 2000, why: null },
      bench: {}, crisisBefore: null, crisisAfter: null, resolutionsDuring: [],
      pantryBefore: 3000, pantryAfter: 1000, pantryDelta: -2000,
      musterSize: 1, musterNames: ['Boris'], sortieLine: null,
      deathsDuring: [],
      deathsDuringSay: [{ line: "Aria faced The Eulogy at the treeline... and didn't come back.", names: ['Aria'], namesRoster: ['Aria'], namesMuster: [] }],
      episodeInfo: [{ id: 'eulogy', episode: 1 }], fights: [], after: [] },
  ],
  convosDriven: [], fabricHits: [], drifts: [], aidResolutions: [], clearedGorgeAfter: [],
  lingerBook: [], lingerTickParts: [], pantryDaily: [],
  deaths: [{ day: 5, name: 'Eve', cause: 'monster' }],
  census: { corpses: [
    { day: 10, name: 'A', cause: 'starvation' },
    { day: 11, name: 'B', cause: 'sickness' },
    { day: 12, name: 'C', cause: "a wound that wouldn't close" },
    { day: 13, name: 'D', cause: 'dehydration' },
  ], pantryKcal: 0, aliveCount: 1 },
  phoenixBurns: [], favorNoLongerCalls: [], instrumentErrors: [],
};
fs.writeFileSync(path.join(tmp, 'journey-crisis-r132-delayed-seed99901.json'), JSON.stringify(rec));
const out = execFileSync('node', [path.join(__dirname, 'analyze-crisis-r132-delayed-20261106.js'), tmp], { encoding: 'utf8' });
check(!/"name": "Ruth"/.test(out), 'analyzer: killer-subject Ruth is NOT a D3 mismatch');
check(/"name": "Aria"/.test(out), 'analyzer: real death Aria still IS a D3 mismatch');
const c7bLine = out.split('\n').find(l => l.indexOf('"famine":') !== -1 && l.indexOf('"corpseTotal"') !== -1);
let c7b = null;
try { c7b = JSON.parse(c7bLine); } catch (e) { c7b = null; }
check(!!c7b, 'analyzer: C7b line present');
if (c7b) {
  check(c7b.famine.feed === 0 && c7b.famine.corpse === 1, 'C7b famine feed 0 / corpse 1');
  check(c7b.disease.feed === 0 && c7b.disease.corpse === 1, 'C7b disease feed 0 / corpse 1');
  check(c7b.wound.feed === 0 && c7b.wound.corpse === 1, 'C7b wound feed 0 / corpse 1');
  check(c7b.thirst.feed === 0 && c7b.thirst.corpse === 1, 'C7b thirst feed 0 / corpse 1');
}
fs.rmSync(tmp, { recursive: true, force: true });

console.log(failures === 0 ? 'ALL PROOF CHECKS PASS' : failures + ' PROOF CHECKS FAILED');
process.exit(failures === 0 ? 0 : 1);
