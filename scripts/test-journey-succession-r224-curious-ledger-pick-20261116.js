#!/usr/bin/env node
// test-journey-succession-r224-curious-ledger-pick-20261116.js — proof test
// for the r224 F4a fix (journey-succession r224, the r218-leftover seam).
//
// The r218 panel's DRY CENSUS failed on 2 other-class hits: seed 34291
// d71, Benjamin + Carolina, pick `alive:want:curious`, key "Teach me
// something. Anything you know that I don't." (characterGen.json:6022,
// `q_teach_me`). The question is a SINGLETON — one `q` line in the def.
// It was asked in an unsampled sitting earlier in the run, consuming the
// line in the 48-entry run ledger; both sampled d71 sittings then drew
// the same question and went dry ("...Sorry, lost my train of thought.").
//
// Root cause (traced this run): `convoPickUnaskedQuestion`
// (convo-wants.js) filters by askedQs / village-wide askedAny but NEVER
// checks `convoWouldBlock` — and its fallback branch
// (per-villager-unasked when the village-wide pool is exhausted)
// deliberately re-serves already-asked questions. Fix: make the pick
// ledger-aware — filter BOTH branches by `!convoWouldBlock(vid, q.q)`,
// so a question whose line was recently spoken is skipped and another
// is picked (or the want can't open, honestly). This fixes the whole
// singleton-question class, not just q_teach_me — so no data variants
// are added.
//
// Cases (each in its own process — never two harnesses in one process):
//   pick-skips-blocked: every question but q_teach_me marked asked,
//     q_teach_me's line poisoned in the run ledger through the real
//     sayLine choke point — the pick must return null (fixed) instead
//     of q_teach_me (unfixed: the dry line's cause).
//   pick-returns-unblocked: same staging, no poison — the pick returns
//     q_teach_me (the filter must not over-block).
//   pool-exhausted-null: every question asked — the pick returns null
//     on both codes (control: the exhausted path is unchanged).
//   control: fresh state — the pick returns a question whose line
//     does not block (the want can still open).
// Usage: node scripts/test-journey-succession-r224-curious-ledger-pick-20261116.js [pick-skips-blocked|pick-returns-unblocked|pool-exhausted-null|control]
//   Default (no arg): runs all four cases, spawning children for the
//   three non-default cases (separate processes).
'use strict';
const { execFileSync } = require('child_process');
const path = require('path');
const { loadGame, setupGame } = require('./sim-harness');

let fails = 0;
function check(name, cond, detail) {
  console.log((cond ? 'PASS ' : 'FAIL ') + name + (detail ? ' — ' + detail : ''));
  if (!cond) fails++;
}

const TEACH_ID = 'q_teach_me';

function allQuestions(Game) {
  return (((Game.data || {}).characterGen || {}).convo || {}).questions || [];
}

// Stage the roster healthy + trusting, so no acute need interferes
// with the question pick (trust gates the bespoke questions).
async function setupBase(Game) {
  const v = Game.state.village || {};
  const roster = (v.roster || []).filter(id => id !== Game.villagerId);
  v.trust = v.trust || {};
  for (const vid of roster) v.trust[vid] = 90;
  return roster;
}

// Mark every question asked village-wide + per-villager, except
// q_teach_me — so the pick's pool is exactly [q_teach_me].
function markOthersAsked(Game, vid) {
  const c = Game.convoGet(vid);
  c.askedQs = c.askedQs || [];
  for (const q of allQuestions(Game)) {
    if (q.id === TEACH_ID) continue;
    try { Game.noteAskedQ(q.id); } catch (e) {}
    if (c.askedQs.indexOf(q.id) === -1) c.askedQs.push(q.id);
  }
}

async function runCase(mode) {
  const seed = { 'pick-skips-blocked': 5561, 'pick-returns-unblocked': 5562, 'pool-exhausted-null': 5563, control: 5564 }[mode] || 5561;
  const { Game } = await loadGame({ seed, mode: 'succession-r224-curious-ledger-pick-proof', fullTelemetry: true });
  await setupGame(Game);
  const roster = await setupBase(Game);
  const teach = allQuestions(Game).find(q => q.id === TEACH_ID);
  check(`${mode}: q_teach_me def exists with its singleton line`, !!teach && !!teach.q, teach && teach.q);
  if (!teach) return;
  const vidB = roster[0];
  const vidA = roster[1];
  markOthersAsked(Game, vidB);

  if (mode === 'pick-skips-blocked') {
    // Poison the run ledger with the question line, through the real
    // emission choke point (sayLine ledgers what it speaks).
    const said = Game.sayLine(vidA, teach.q);
    check(`${mode}: the poison line speaks (ledger now holds it)`, !!said, String(said).slice(0, 80));
    check(`${mode}: the question line IS run-blocked for the next villager`, Game.convoWouldBlock(vidB, teach.q) === true);
    const picked = Game.convoPickUnaskedQuestion(vidB);
    check(`${mode}: the pick SKIPS the ledger-blocked question (null — the want can't open honestly)`, picked === null, 'picked=' + (picked && picked.id));
    return;
  }

  if (mode === 'pick-returns-unblocked') {
    const picked = Game.convoPickUnaskedQuestion(vidB);
    check(`${mode}: the pick RETURNS q_teach_me when its line is not blocked`, !!picked && picked.id === TEACH_ID, 'picked=' + (picked && picked.id));
    return;
  }

  if (mode === 'pool-exhausted-null') {
    try { Game.noteAskedQ(TEACH_ID); } catch (e) {}
    const c = Game.convoGet(vidB);
    if (c.askedQs.indexOf(TEACH_ID) === -1) c.askedQs.push(TEACH_ID);
    const picked = Game.convoPickUnaskedQuestion(vidB);
    check(`${mode}: the pick returns null when every question is asked`, picked === null, 'picked=' + (picked && picked.id));
    return;
  }

  if (mode === 'control') {
    const picked = Game.convoPickUnaskedQuestion(vidB);
    check(`${mode}: the pick returns a question on fresh state`, !!picked && !!picked.q, 'picked=' + (picked && picked.id));
    check(`${mode}: the picked question's line does not block`, !!picked && Game.convoWouldBlock(vidB, picked.q) === false, picked && picked.q);
    return;
  }
}

async function main() {
  const mode = process.argv[2];
  if (mode && ['pick-skips-blocked', 'pick-returns-unblocked', 'pool-exhausted-null', 'control'].includes(mode)) {
    await runCase(mode);
  } else {
    await runCase('pick-skips-blocked');
    for (const m of ['pick-returns-unblocked', 'pool-exhausted-null', 'control']) {
      try {
        const out = execFileSync('node', [path.join(__dirname, 'test-journey-succession-r224-curious-ledger-pick-20261116.js'), m],
          { timeout: 300000, maxBuffer: 64 * 1024 * 1024 }).toString();
        console.log(out.split('\n').filter(l => l.startsWith('PASS') || l.startsWith('FAIL')).join('\n'));
        if (/FAIL/.test(out)) fails++;
      } catch (e) {
        check(`${m} child run passes`, false, String((e.stdout || e.message || e)).slice(0, 300));
      }
    }
  }
  if (fails) { console.log(`\n${fails} FAILURES`); process.exit(1); }
  console.log('\nALL GREEN');
}

main().catch(e => { console.error('THREW', e); process.exit(1); });
