// test-journey-social-r159-narr.js -- proof for the r159 (B) NARR-line fix.
// The r154 driver flattened every non-'you' transcript entry to 'NPC',
// so truth.js codex-gated coaching beats ({ who: 'narr', text: '*...*' })
// printed as NPC speech in M4 candidates. The r159 fix maps transcript
// entries through helpers.mapTranscriptEntry (you->YOU, narr->NARR,
// anything else->NPC) at all three driver transcript sites.
//   (1) Mapper unit cases: you / narr / villager-id / missing-who,
//       text truncation at 400 chars.
//   (2) Defect specimen: the OLD inline expression, quoted verbatim from
//       the r154 driver (line 105), maps a narr entry to 'NPC' — the
//       flattening this fix removes. Asserted as the old behavior, so a
//       future reader can see exactly what was wrong.
//   (3) Fix-landing guard: the r159 driver source contains no remaining
//       copy of the old flattening expression and uses mapTranscriptEntry
//       at the three transcript sites.
// Usage: node scripts/test-journey-social-r159-narr.js
// RED: run against helpers without mapTranscriptEntry (require fails), or
//      against a driver that still carries the old expression (guard 3).
// GREEN: all assertions pass.
'use strict';
const fs = require('fs');
const path = require('path');
const { mapTranscriptEntry } = require('./journey-social-r167-helpers');
let failures = 0;
const fail = (m) => { console.error(`FAIL: ${m}`); failures++; };
const ok = (cond, what) => { if (cond) console.log(`PASS ${what}`); else fail(what); };
const eq = (got, want, what) => { if (got === want) console.log(`PASS ${what}`); else fail(`${what}: got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`); };

// (1) Mapper unit cases.
eq(mapTranscriptEntry({ who: 'you', text: 'Hello?' }).who, 'YOU', 'you maps to YOU');
eq(mapTranscriptEntry({ who: 'narr', text: '*Confessions need weight*' }).who, 'NARR', 'narr maps to NARR');
eq(mapTranscriptEntry({ who: 'narr', text: '*Confessions need weight*' }).text, '*Confessions need weight*', 'narr text preserved verbatim');
eq(mapTranscriptEntry({ who: 'v_12', text: 'I took the stone.' }).who, 'NPC', 'villager id maps to NPC');
eq(mapTranscriptEntry({ who: 'abigail', text: '...' }).who, 'NPC', 'villager name maps to NPC');
eq(mapTranscriptEntry({ text: 'no who at all' }).who, 'NPC', 'missing who maps to NPC');
eq(mapTranscriptEntry(null).who, 'NPC', 'null entry maps to NPC');
eq(mapTranscriptEntry({ who: 'you', text: 'x'.repeat(500) }).text.length, 400, 'text truncates at 400 chars');
eq(mapTranscriptEntry({ who: 'narr', text: '' }).who, 'NARR', 'empty narr text still NARR');

// (2) Defect specimen — the OLD r154 driver expression, verbatim.
// On the old code this is what ran at driver lines 105/113/141:
const oldMap = (e) => ({ who: e.who === 'you' ? 'YOU' : 'NPC', text: String(e.text || '').slice(0, 400) });
eq(oldMap({ who: 'narr', text: '*Confessions need weight*' }).who, 'NPC',
  'OLD expression flattens narr to NPC (defect specimen — this is what r159 removes)');
eq(oldMap({ who: 'you', text: 'hi' }).who, 'YOU', 'OLD expression keeps YOU (sanity)');

// (3) Fix-landing guard on the r167 driver source (same mapper, carried forward).
const driverSrc = fs.readFileSync(path.join(__dirname, 'journey-social-life-r167-20261110.js'), 'utf8');
const oldExpr = "e.who === 'you' ? 'YOU' : 'NPC'";
ok(!driverSrc.includes(oldExpr), 'r167 driver carries no copy of the old flattening expression');
const uses = (driverSrc.match(/\.map\(mapTranscriptEntry\)/g) || []).length;
eq(uses, 3, 'r167 driver maps transcripts through mapTranscriptEntry at 3 sites');
ok(driverSrc.includes("mapTranscriptEntry } = require('./journey-social-r167-helpers')"),
  'r167 driver imports mapTranscriptEntry from the r167 helpers');

if (failures) { console.error(`${failures} FAILURES`); process.exit(1); }
console.log('ALL NARR CHECKS PASSED');
