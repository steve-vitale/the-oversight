// test-endgame-r152-deathdedupe.js — proof for the r152 death-dedupe fix
// (r124 proposal, proven live by the r152 pilot: 89705's Sam Wilson
// recorded TWICE in deathRecords — once via tbVillagerFalls, once via
// registerDeath, same vid+day+cause — so the pilot counted 9 deaths
// for 8 dead villagers).
//
// The fix lives in scripts/probe-endgame-r152-20261107.js recordDeath:
// a record for a vid+day already present is the same death through the
// other channel, and is skipped (first channel wins). A villager dies
// once, so vid+day identifies a death.
//
// This test verifies the fix on the two committed corpora, which must
// be byte-identical trajectories (the fix touches no game code and no
// RNG — only the probe's recording):
//   evidence/2026-11-07/perseed-endgame-r152-prefix/  (pre-fix pilot)
//   evidence/2026-11-07/perseed-endgame-r152/          (post-fix pilot)
// Checks, per seed:
//   1. every post-fix deathRecords entry has a unique (vid, day);
//   2. the post-fix deathRecords are exactly the pre-fix ones minus
//      exact duplicates (same vid+day+name+cause as a kept record);
//   3. every other field of the per-seed JSON is byte-identical
//      pre/post (the fix changed no trajectory);
//   4. the transcripts are byte-identical pre/post.
// Exit 0 = all checks pass; exit 1 = any failure (with the failure named).
'use strict';
const fs = require('fs');
const path = require('path');

const PRE = path.join(__dirname, '..', 'evidence', '2026-11-07', 'perseed-endgame-r152-prefix');
const POST = path.join(__dirname, '..', 'evidence', '2026-11-07', 'perseed-endgame-r152');

let failures = 0;
function check(ok, label) {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${label}`);
  if (!ok) failures++;
}

const seeds = fs.readdirSync(POST).filter(f => /^endgame-r152-\d+\.json$/.test(f))
  .map(f => f.match(/^endgame-r152-(\d+)\.json$/)[1]).sort();
check(seeds.length === 5, `5 post-fix seeds present (got ${seeds.length})`);

for (const seed of seeds) {
  const pre = JSON.parse(fs.readFileSync(path.join(PRE, `endgame-r152-${seed}.json`), 'utf8'));
  const post = JSON.parse(fs.readFileSync(path.join(POST, `endgame-r152-${seed}.json`), 'utf8'));

  // 1. post-fix uniqueness by (vid, day)
  const postDrs = post.deathRecords || [];
  const keys = postDrs.map(d => `${d.vid}|${d.day | 0}`);
  check(new Set(keys).size === keys.length,
    `${seed}: post-fix deathRecords unique by vid+day (${postDrs.length} records)`);

  // 2. post-fix == pre-fix minus exact duplicates
  const preDrs = pre.deathRecords || [];
  const kept = [];
  const seen = new Set();
  for (const d of preDrs) {
    const k = `${d.vid}|${d.day | 0}|${d.name || ''}|${d.cause || ''}`;
    if (!seen.has(k)) { seen.add(k); kept.push(d); }
  }
  const same = kept.length === postDrs.length &&
    kept.every((d, i) => d.vid === postDrs[i].vid && (d.day | 0) === (postDrs[i].day | 0) &&
      d.channel === postDrs[i].channel && d.name === postDrs[i].name && d.cause === postDrs[i].cause);
  check(same, `${seed}: post-fix deathRecords == pre-fix minus exact duplicates (pre ${preDrs.length} -> post ${postDrs.length})`);

  // 3. everything else byte-identical
  const preCopy = Object.assign({}, pre, { deathRecords: null });
  const postCopy = Object.assign({}, post, { deathRecords: null });
  check(JSON.stringify(preCopy) === JSON.stringify(postCopy),
    `${seed}: all non-deathRecords JSON identical pre/post`);

  // 4. transcripts byte-identical
  const preT = fs.readFileSync(path.join(PRE, `endgame-r152-${seed}-transcript.txt`), 'utf8');
  const postT = fs.readFileSync(path.join(POST, `endgame-r152-${seed}-transcript.txt`), 'utf8');
  check(preT === postT, `${seed}: transcript byte-identical pre/post`);
}

// The headline case: Sam Wilson (sam_wilson) d44 on 89705 recorded once.
const post89705 = JSON.parse(fs.readFileSync(path.join(POST, 'endgame-r152-89705.json'), 'utf8'));
const sams = (post89705.deathRecords || []).filter(d => d.vid === 'sam_wilson');
check(sams.length === 1, `89705: Sam Wilson recorded exactly once post-fix (got ${sams.length})`);
const pre89705 = JSON.parse(fs.readFileSync(path.join(PRE, 'endgame-r152-89705.json'), 'utf8'));
const preSams = (pre89705.deathRecords || []).filter(d => d.vid === 'sam_wilson');
check(preSams.length === 2, `89705: Sam Wilson recorded twice pre-fix (control, got ${preSams.length})`);

if (failures) { console.log(`DEATHDEDUP: ${failures} FAILURE(S)`); process.exit(1); }
console.log('DEATHDEDUP: all checks passed');
