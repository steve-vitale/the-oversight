// test-convo-dedupe-r145.js — proof for the r145 full-pool convo dedupe fix.
// The r145 scan (scripts/scan-convo-dupes-r145-20261106.js) found 13 true
// same-beat pairs across ALL convo pools in src/data/characterGen.json
// (goalFollow x4, pastFollow x1, plansFollow x3, exits x4, openers x1):
// two different strings carrying one beat in one pool, which the text-based
// repeat ledger (CONVERSATIONS.md "No repeats, ever") cannot catch.
// Each pair's second line was rewritten to a distinct beat on the same theme.
// Data-only checks (no game load); RED on the pre-fix file, GREEN post-fix.
// Usage: node scripts/test-convo-dedupe-r145.js [path-to-characterGen.json]
//   (default: the repo's src/data/characterGen.json)
'use strict';
const fs = require('fs'), path = require('path');
const target = process.argv[2] || path.join(__dirname, '..', 'src', 'data', 'characterGen.json');
const cg = JSON.parse(fs.readFileSync(target, 'utf8'));
const convo = cg.convo || {};
const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
const firstN = (s, n) => norm(s).split(' ').slice(0, n).join(' ');
let failures = 0;
const fail = (m) => { console.error(`FAIL: ${m}`); failures++; };

// --- collect pools (same walk as the scan) ---
const pools = [];
for (const [key, val] of Object.entries(convo)) {
  if (key === 'questions' && Array.isArray(val)) {
    pools.push({ name: 'questions.q', lines: val.map((q) => q.q).filter(Boolean) });
    pools.push({ name: 'questions.follow', lines: val.map((q) => q.follow).filter(Boolean) });
    pools.push({ name: 'questions.deeper', lines: val.map((q) => q.deeper).filter(Boolean) });
    const reacts = [];
    for (const q of val) for (const a of (q.answers || [])) if (a.react) reacts.push(a.react);
    pools.push({ name: 'questions.answers.react', lines: reacts });
    // NOTE: questions.answers.label is EXCLUDED from the exact-dupe check:
    // the label "Yes." is offered by two DIFFERENT questions (q_trust,
    // q_left_behind) — same word, different menus, never co-present. Not a
    // defect (r145 scan adjudication).
    continue;
  }
  if (Array.isArray(val)) pools.push({ name: key, lines: val });
  else if (val && typeof val === 'object') {
    for (const [sub, lines] of Object.entries(val)) {
      if (Array.isArray(lines)) pools.push({ name: `${key}.${sub}`, lines });
    }
  }
}
const byName = new Map(pools.map((p) => [p.name, p.lines]));

// (1) No exact-duplicate line inside any NPC-spoken pool.
for (const p of pools) {
  const seen = new Map();
  for (const l of p.lines) {
    const k = norm(l);
    if (seen.has(k)) fail(`exact-duplicate in ${p.name}: ${l}`);
    else seen.set(k, l);
  }
}

// (2) The 13 removed lines are gone; (3) the 13 new lines are present.
const removed = [
  '"Back home I was background. Here, I get to be foreground. I\'m taking it."',
  '"There\'s a way out. There\'s always a way out. I just haven\'t found the door yet."',
  '"I do what the day requires. Some days that\'s ugly. I live with it."',
  '"One more day. That\'s the goal. Just one more, repeated until it isn\'t."',
  '"I kept a journal. Stopped when things got bad. Maybe I should start again."',
  '"I want to build something. Not for survival \u2014 just to prove I still can make a thing that wasn\'t here before."',
  '"I want to go further tomorrow. Not far. Further. There\'s a difference."',
  '"I\'m going to learn everyone\'s name by heart. Starting with the hard ones."',
  '"Take care of yourself. I mean that."',
  '"Good talk. Now let\'s go DO something."',
  '"Alright. Back to it."',
  '"Sorry. I need a minute. This was... thank you. I need a minute."',
  '"Do you ever get the feeling we\'re being watched? ...Stupid question. Of course we are."',
];
const added = [
  '"I never finished anything I started back home. Here, finishing is survival \u2014 and I\'m going to finish things."',
  '"I watch the birds. They leave and come back. If they can find the way, so can I."',
  '"I count what we have every morning. Numbers don\'t lie to you the way hope does."',
  '"I stopped counting days. I count meals now. A meal is a day you won."',
  '"There\'s a list in my pocket \u2014 everyone I owed a call. I check it sometimes."',
  '"I want to make something beautiful. Not useful \u2014 just beautiful. Proof we didn\'t lose that part."',
  '"I want to sleep through a whole night. Just once. No watch, no worry, just sleep."',
  '"I\'m going to mend the torn packs before they fall apart. Small repairs, big difference."',
  '"Get some rest tonight, yeah? You look like you need it. We all do."',
  '"Good talk. Don\'t let it go to your head."',
  '"Alright. Same time tomorrow, if the world allows."',
  '"I need to walk a bit. I\'ll be by the fire when I\'m ready."',
  '"I miss noise. Real noise \u2014 traffic, crowds, all of it. The quiet here is loud."',
];
const allLines = pools.flatMap((p) => p.lines.map(norm));
for (const l of removed) {
  if (allLines.includes(norm(l))) fail(`removed line still present: ${l}`);
}
for (const l of added) {
  if (!allLines.includes(norm(l))) fail(`replacement line missing: ${l}`);
}

// (4) At most one line per fixed (pool, opening) key. plansFollow uses the
// first FOUR words (the whole pool opens "I want to..." / "I'm going to...").
// Includes the r144 regression: goalFollow.lead "someone asked me" <= 1.
const keys = [
  ['goalFollow.prove', 3, 'back home i'],
  ['goalFollow.escape', 3, 'theres a way'],
  ['goalFollow.survive', 3, 'i do what'],
  ['goalFollow.survive', 3, 'one more day'],
  ['goalFollow.lead', 3, 'someone asked me'], // r144 regression
  ['pastFollow', 3, 'i kept a'],
  ['plansFollow', 4, 'i want to build'],
  ['plansFollow', 4, 'i want to go'],
  ['plansFollow', 4, 'im going to learn'],
  ['exits.warm', 3, 'take care of'],
  ['exits.bold', 3, 'good talk now'],
  ['exits.steady', 3, 'alright back to'],
  ['exits.grieving', 3, 'sorry i need'],
  ['openers', 3, 'do you ever'],
];
for (const [pool, n, key] of keys) {
  const lines = byName.get(pool) || [];
  const hits = lines.filter((l) => firstN(l, n) === key);
  if (hits.length > 1) fail(`${pool} [${key}] still x${hits.length}: ${hits.join(' || ')}`);
}
if (failures) { console.error(`RESULT: FAIL (${failures} defect(s) present)`); process.exit(1); }
console.log(`RESULT: PASS — ${pools.length} pools, no exact dupes, 13 removed lines gone, 13 replacements present, all fixed openings unique`);
