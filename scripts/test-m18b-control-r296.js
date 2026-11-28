// test-m18b-control-r296.js — M18b ghost-say positive control (lane B, r296).
// The r275 F-item: Rosa (alien contact) died d90 in the betrayal fight and
// spoke the next dawn ("💬 Rosa says: 'They said you're doing well...'").
// This test runs the r296 M18b regex + identity-aware classifier (copied
// verbatim from probe-endgame-r296-20261128.js) over the FROZEN r275 corpus
// (evidence/2026-11-23/perseed-endgame-r275/endgame-r275-107583.{json,txt})
// and asserts: exactly 2 ambient says-lines (Rosa d91, Leonor d91); Rosa
// classifies CONFIRMED (died d90 < 91, no later Rosa death, no final-alive
// Rosa); Leonor classifies clean (no death record); no other confirmed hit.
// finalAliveFirst is approximated from the corpus: first names that speak
// as living people AFTER the ghost line's day (colon-form chatter lines,
// ghost line itself excluded) with no death record — the same semantics as
// the probe's live-roster read (dead villagers are not on the final roster).
// Run: node scripts/test-m18b-control-r296.js
'use strict';
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'evidence', '2026-11-23', 'perseed-endgame-r275');
const rec = JSON.parse(fs.readFileSync(path.join(DIR, 'endgame-r275-107583.json'), 'utf8'));
const transcript = fs.readFileSync(path.join(DIR, 'endgame-r275-107583-transcript.txt'), 'utf8');
const deathRecords = rec.deathRecords || [];

// Day tracking from transcript headers ("— DAY 91 DAWN —").
const lines = transcript.split('\n');
let day = null;
const sayLines = [];
for (const raw of lines) {
  const dm = /^— DAY (\d+) /.exec(raw);
  if (dm) day = parseInt(dm[1], 10);
  const m = /💬\s*([A-Z][a-z]+)\s+says:/.exec(raw);
  if (m) sayLines.push({ day, companion: m[1], line: raw.slice(0, 300) });
}

// finalAliveFirst approximation: living speakers after day 91 (colon form),
// ghost line excluded, minus anyone with a death record.
const deadFirst = new Set(deathRecords.map(dr => String(dr.name || '').split(' ')[0]));
const finalAliveFirst = new Set();
let curDay = null;
for (const raw of lines) {
  const dm = /^— DAY (\d+) /.exec(raw);
  if (dm) curDay = parseInt(dm[1], 10);
  if (curDay == null || curDay <= 91) continue;
  const m = /💬\s*([A-Z][a-z]+):/.exec(raw);
  if (m && !/says:/.test(raw) && !deadFirst.has(m[1])) finalAliveFirst.add(m[1]);
}

// Classifier copied verbatim from the r296 probe (classifyGhost).
const classifyGhost = (gl) => {
  const first = gl.companion;
  const earlier = deathRecords.filter(dr => dr && dr.name && String(dr.name).split(' ')[0] === first && (dr.day | 0) < (gl.day | 0));
  const aliveLater = deathRecords.some(dr => dr && dr.name && String(dr.name).split(' ')[0] === first && (dr.day | 0) >= (gl.day | 0));
  const aliveAtEnd = finalAliveFirst.has(first);
  return { day: gl.day, companion: first, line: gl.line,
    hit: earlier.length > 0 && !aliveLater && !aliveAtEnd,
    firstNameHit: earlier.length > 0,
    deathDay: earlier.length ? earlier[0].day : null,
    deathCause: earlier.length ? earlier[0].cause : null,
    aliveCandidate: aliveLater || aliveAtEnd };
};

const hits = sayLines.map(classifyGhost);
let failures = 0;
const check = (name, cond, detail) => {
  console.log((cond ? 'ok   ' : 'FAIL ') + name + (detail ? ' — ' + detail : ''));
  if (!cond) failures++;
};

check('exactly 2 ambient says-lines in the 107583 transcript', sayLines.length === 2,
  `found ${sayLines.length}: ${sayLines.map(s => 'd' + s.day + ':' + s.companion).join(', ')}`);
const rosa = hits.find(h => h.companion === 'Rosa');
const leonor = hits.find(h => h.companion === 'Leonor');
check('Rosa says-line is on day 91', rosa && rosa.day === 91, rosa ? 'd' + rosa.day : 'missing');
check('Rosa classifies CONFIRMED', rosa && rosa.hit === true,
  rosa ? `hit=${rosa.hit} deathDay=${rosa.deathDay} cause=${rosa.deathCause}` : 'missing');
check('Rosa death is d90 combat (r275 record)', rosa && rosa.deathDay === 90 && rosa.deathCause === 'combat');
check('Leonor says-line is on day 91', leonor && leonor.day === 91, leonor ? 'd' + leonor.day : 'missing');
check('Leonor classifies clean (no earlier death)', leonor && leonor.hit === false && leonor.firstNameHit === false,
  leonor ? `hit=${leonor.hit} firstNameHit=${leonor.firstNameHit}` : 'missing');
check('no other confirmed hits', hits.filter(h => h.hit).length === 1,
  `confirmed: ${hits.filter(h => h.hit).map(h => h.companion).join(',') || 'none'}`);

if (failures) { console.log(`M18b CONTROL: ${failures} FAILURE(S)`); process.exit(1); }
console.log('M18b CONTROL: all passed (Rosa CONFIRMED, Leonor clean)');
