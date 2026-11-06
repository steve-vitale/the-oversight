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
// (5) CROSS-STRUCTURE (r145 panel): goal-definition lines (goals[].lines,
// the opener pool) vs goalFollow[goal] (the depth pool) held the SAME beat
// in different words. The quote-normalized dedupe (conversation.js
// convoPick, r67) catches exact twins (j=1.00, quote-style only), but
// near-dupes (same beat, different wording) re-served in one goal thread
// (r145 wild: chloe_dubois alone, lena_ruiz remember, oliver_moore answers,
// lena_ruiz hunger is a single wants template, not this class). The 16
// near-duplicate follow lines below were rewritten to distinct beats.
// Exact twins are EXCLUDED from the same-beat check (j<0.99): they are
// handled by convoPick; the defect is the near-dupe band 0.5<=j<0.99.
const jaccard = (a, b) => {
  const A = new Set(norm(a).split(' ').filter(Boolean));
  const B = new Set(norm(b).split(' ').filter(Boolean));
  let inter = 0; for (const w of A) if (B.has(w)) inter++;
  return inter / (A.size + B.size - inter || 1);
};
const removedX = [
  '"It\'s not that I dislike people. It\'s that I like myself better at a distance."',
  '"I need the quiet the way other people need food. Don\'t worry about me."',
  '"Hungry people get mean. Scared people get mean. Fed people can think. It\'s that simple."',
  '"Everything\'s broken. People, things. I fix what I can reach."',
  '"I want a door I can close. Not to keep people out \u2014 just to know I could."',
  '"Four walls and a roof and I\'d make it a home in a week. Watch me."',
  '"Someone has to be the memory of this place. I\'ve volunteered. No take-backs."',
  '"I interrogate the world instead of praying to it. Different strategy, same silence."',
  '"When I\'m gone, I want the story to keep my name in it. That\'s all."',
  '"Do something worth retelling. That\'s the whole plan. The rest is logistics."',
  '"The world took a lot. It\'s not getting my sense of humor."',
  '"I miss laughing without checking over my shoulder first. I\'m working on it."',
  '"Joy is a resource. I\'m foraging for it. Some days the yield is terrible."',
  '"Somebody has to be the calm one. I\'ve taken the job. No one else applied."',
  '"I\'ve talked down fights before. It\'s a skill. A tiring one."',
  '"If we forget who we were, what exactly are we surviving for?"',
];
const addedX = [
  '"I can do one person. Two, maybe, on a good day. A whole camp talking at once and I stop hearing any of it."',
  '"When I\'m alone I\'m not lonely. I\'m recharging. Come find me when the fire\'s low and I\'ll be back."',
  '"I cook for the whole camp now. A fed camp argues less and laughs more."',
  '"I learned to set a bone before I learned to read. Hands first, always."',
  '"I found a loose floorboard yesterday and fixed it. That\'s the first thing that\'s felt like mine."',
  '"Give me a corner and a nail and I\'ll hang something that makes it ours."',
  '"I write down who laughed today. The arguments write themselves."',
  '"The System never answers, but it leaves fingerprints. I collect those."',
  '"Someday someone will tell my story wrong. I just hope they tell it funny."',
  '"A good story needs a fool who went first. I\'ve applied for the job."',
  '"I laugh at the System\'s expense. It\'s the only currency it can\'t tax."',
  '"The first time I laughed out here, I startled myself. Then I did it again on purpose."',
  '"I ration my jokes like trail food. A bad day costs extra."',
  '"Calm is a choice I make every morning. Some mornings it takes all day."',
  '"Most fights start because nobody asked what the other person actually wanted. I ask."',
  '"I keep a list of names. When I forget one, I carve it somewhere so the forgetting has to work for it."',
];
const gfAll = Object.values(convo.goalFollow || {}).flat().map(norm);
for (const l of removedX) {
  if (gfAll.includes(norm(l))) fail(`cross-structure removed line still present: ${l}`);
}
for (const l of addedX) {
  if (!gfAll.includes(norm(l))) fail(`cross-structure replacement missing: ${l}`);
}
for (const g of (cg.goals || [])) {
  const id = g.id || g.key;
  const defs = g.lines || [];
  const fol = (convo.goalFollow || {})[id] || [];
  for (const d of defs) for (const f of fol) {
    const j = jaccard(d, f);
    if (j >= 0.5 && j < 0.99) fail(`cross-structure same-beat ${id} j=${j.toFixed(2)}: DEF ${d} || FOL ${f}`);
  }
}
if (failures) { console.error(`RESULT: FAIL (${failures} defect(s) present)`); process.exit(1); }
console.log(`RESULT: PASS — ${pools.length} pools, no exact dupes, 13 removed lines gone, 13 replacements present, all fixed openings unique, 16 cross-structure lines gone, 16 replacements present, no def/follow same-beat pair`);
