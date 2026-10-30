#!/usr/bin/env node
// scripts/test-uidmatcher-a.js — sim-uidmatcher-a proof tests.
// Fixtures for the uid-first matcher (synthetic events modeled on
// the named prior shapes, never on judged corpus verdicts) +
// determinism gate for seed 75102 (existing sweep-sameday-a,
// verbatim, re-run into a worktree-local scratch dir, compared to
// the committed sameday corpus; row compared with worktree-
// absolute harness paths normalized per prereg correction #1;
// census compared byte-identical unmodified; scratch removed in
// a finally block — never exit inside try).
// Usage:
//   node scripts/test-uidmatcher-a.js            (fixtures only)
//   node scripts/test-uidmatcher-a.js --determinism  (fixtures + determinism)
// When required as a module, main() does NOT run.
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const { resolveChainUid, linkFight, judgeChain } = require('./analyze-uidmatcher-a');
const { uidDrops, perIdDrops } = require('./analyze-removal-a');

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log(`PASS ${name}`); }
  else { fail++; console.log(`FAIL ${name} :: ${detail || ''}`); }
}
function censusOf(entriesByDay) {
  // entriesByDay: [{day, monsters:[{uid,id,tx,ty,hp,maxHp,wave,...}]}]
  return { seed: 0, snapshots: entriesByDay.map(s => ({ day: s.day, monsters: s.monsters })) };
}
function mon(uid, id, hp, maxHp, tx, ty) {
  return { uid, id, tx, ty, hp, maxHp, wave: 4, veteran: false, lingering: false, titan: false, stance: null, lostSight: 0, mx: 0, my: 0 };
}

function fixtures() {
  // --- Fixture 1: uid resolution picks the uid trajectory whose
  // census hp matches the chain's meeting-day hp, not another
  // same-id trajectory.
  const census1 = censusOf([
    { day: 65, monsters: [mon(7, 'algorithm', 1000, 1000, 4, 4), mon(8, 'algorithm', 900, 1000, 5, 5)] },
    { day: 66, monsters: [mon(7, 'algorithm', 971, 1000, 4, 4), mon(8, 'algorithm', 900, 1000, 5, 5)] },
    { day: 71, monsters: [mon(7, 'algorithm', 959, 1000, 4, 4), mon(8, 'algorithm', 900, 1000, 5, 5)] },
  ]);
  const events1 = [
    { type: 'spawn', seq: 1, day: 59, monster: mon(7, 'algorithm', 1000, 1000, 5, 5) },
    { type: 'spawn', seq: 2, day: 60, monster: mon(8, 'algorithm', 900, 1000, 5, 5) },
  ];
  const chain1 = { seed: 0, mid: 'algorithm', meetings: [
    { day: 65, mHpStart: 1000, mHpLeft: 971 },
    { day: 71, mHpStart: 959, mHpLeft: 959 },
  ], lastDay: 71, remainingHp: 959 };
  const r1 = resolveChainUid(chain1, census1, events1);
  check('resolve-uid-picks-matching-trajectory', r1.status === 'RESOLVED' && r1.uid === 7, JSON.stringify(r1));

  // --- Fixture 2: drafted instance (suburb shape): chain hp 1285,
  // fight lift 960 via a removal event for the chain's uid at lift
  // hp — uid-first LINKS where hp-exact does NOT.
  const census2 = censusOf([
    { day: 158, monsters: [mon(29, 'suburb', 1285, 1300, 6, 4)] },
  ]);
  const events2 = [
    { type: 'spawn', seq: 1, day: 140, monster: mon(29, 'suburb', 1300, 1300, 6, 4) },
    { type: 'removal', seq: 59, day: 159, monster: mon(29, 'suburb', 960, 1300, 4, 4),
      stack: { funcs: ['startCombat', 'tickAction'] } },
  ];
  const chain2 = { seed: 0, mid: 'suburb', meetings: [
    { day: 140, mHpStart: 1300, mHpLeft: 1285 },
  ], lastDay: 140, remainingHp: 1285, windowUpper: 159 };
  const fight2 = { fightSeq: 23, dayStart: 159, lifted: true,
    lift: { id: 'suburb', hp: 960, tx: 4, ty: 4, lingering: true, titan: false },
    result: 'lost', restoredIdentity: false, restoredEntry: false, restoredHp: null };
  const link2 = linkFight(fight2, chain2, { uid: 29, maxHp: 1300 }, events2, { meetingStamp: null, fightStamp: null });
  check('drafted-uid-links', link2.linked === true, JSON.stringify(link2));
  check('drafted-bridge-toll-shaped', link2.bridge && link2.bridge.chainHp === 1285
    && link2.bridge.liftHp === 960 && link2.bridge.tollShaped === true, JSON.stringify(link2.bridge));
  check('drafted-hp-exact-would-miss', fight2.lift.hp !== chain2.remainingHp, 'lift 960 != chain 1285');

  // --- Fixture 3: twin pair (reunion shape): two same-id uids on
  // one day; per-id first-entry misses the 1200→1185 drop, uid finds it.
  const census3 = censusOf([
    { day: 10, monsters: [mon(11, 'reunion', 1200, 1500, 4, 4), mon(12, 'reunion', 1200, 1500, 5, 4)] },
    { day: 11, monsters: [mon(11, 'reunion', 1200, 1500, 4, 4), mon(12, 'reunion', 1185, 1500, 5, 4)] },
  ]);
  const ud = uidDrops(census3);
  const pd = perIdDrops(census3);
  check('twin-uid-finds-drop', ud.some(d => d.mid === 'reunion' && d.fromHp === 1200 && d.toHp === 1185), JSON.stringify(ud));
  check('twin-perid-misses-drop', !pd.some(d => d.mid === 'reunion' && d.fromHp === 1200 && d.toHp === 1185), JSON.stringify(pd));

  // --- Fixture 4: same-day stamp order reversed → NOT linked.
  const census4 = censusOf([
    { day: 71, monsters: [mon(26, 'algorithm', 959, 1000, 4, 4)] },
  ]);
  const events4 = [
    { type: 'spawn', seq: 1, day: 59, monster: mon(26, 'algorithm', 1000, 1000, 5, 5) },
    { type: 'removal', seq: 47, day: 71, monster: mon(26, 'algorithm', 959, 1000, 4, 4),
      stack: { funcs: ['startCombat'] } },
  ];
  const chain4 = { seed: 0, mid: 'algorithm', meetings: [
    { day: 71, mHpStart: 959, mHpLeft: 959 },
  ], lastDay: 71, remainingHp: 959, windowUpper: 72 };
  const fight4 = { fightSeq: 21, dayStart: 71, lifted: true,
    lift: { id: 'algorithm', hp: 959, tx: 4, ty: 4, lingering: false, titan: false },
    result: 'lost', restoredIdentity: false, restoredEntry: false, restoredHp: null };
  const link4 = linkFight(fight4, chain4, { uid: 26, maxHp: 1000 }, events4,
    { meetingStamp: { seq: 99, dayPart: 3 }, fightStamp: { seq: 98, dayPart: 3 } });
  check('same-day-reversed-order-not-linked', link4.linked === false
    && link4.failed.some(f => f.indexOf('same-day-order-reversed') >= 0), JSON.stringify(link4));
  const link4b = linkFight(fight4, chain4, { uid: 26, maxHp: 1000 }, events4,
    { meetingStamp: { seq: 98, dayPart: 3 }, fightStamp: { seq: 99, dayPart: 3 } });
  check('same-day-correct-order-linked', link4b.linked === true, JSON.stringify(link4b));

  // --- Fixture 5: ambiguous resolution (two uid trajectories both
  // matching) is reported, never picked by hp.
  const census5 = censusOf([
    { day: 71, monsters: [mon(26, 'algorithm', 959, 1000, 4, 4), mon(27, 'algorithm', 959, 1000, 4, 4)] },
  ]);
  const events5 = [
    { type: 'spawn', seq: 1, day: 59, monster: mon(26, 'algorithm', 1000, 1000, 5, 5) },
    { type: 'spawn', seq: 2, day: 59, monster: mon(27, 'algorithm', 1000, 1000, 5, 5) },
  ];
  const r5 = resolveChainUid(chain4, census5, events5);
  check('ambiguous-never-picked', r5.status === 'AMBIGUOUS' && r5.candidates.length === 2, JSON.stringify(r5));

  // --- Fixture 6: judgeChain on a synthetic lost-sight end
  // (no fight, uid removal monsterTurn lostSight > 6).
  const census6 = censusOf([
    { day: 59, monsters: [mon(25, 'eulogy', 900, 900, 4, 4)] },
    { day: 61, monsters: [mon(25, 'eulogy', 853, 900, 4, 4)] },
  ]);
  const events6 = [
    { type: 'spawn', seq: 1, day: 55, monster: mon(25, 'eulogy', 900, 900, 4, 4) },
    { type: 'removal', seq: 41, day: 62, monster: Object.assign(mon(25, 'eulogy', 853, 900, 4, 4), { lostSight: 7 }),
      stack: { funcs: ['monsterTurn', 'tickAction'] } },
  ];
  const chain6 = { seed: 0, mid: 'eulogy', meetings: [
    { day: 59, mHpStart: 900, mHpLeft: 853 },
  ], lastDay: 59, remainingHp: 853 };
  const j6 = judgeChain(chain6, { census: census6, events: events6, smFights: [], stampsFor: () => ({ meetingStamp: null, fightStamp: null }) });
  check('judge-lostsight-removal', j6.verdict === 'LOSTSIGHT-REMOVE', JSON.stringify(j6));

  // --- Fixture 8: spawn-day resolution (prereg correction #2):
  // single meeting on the beast's spawn day — no meeting-day
  // census, spawn hp == mHpStart, next-day census == mHpLeft.
  const census8 = censusOf([
    { day: 141, monsters: [mon(29, 'suburb', 1285, 1300, 4, 4)] },
  ]);
  const events8 = [
    { type: 'spawn', seq: 1, day: 140, monster: mon(29, 'suburb', 1300, 1300, 6, 4) },
  ];
  const chain8 = { seed: 0, mid: 'suburb', meetings: [
    { day: 140, mHpStart: 1300, mHpLeft: 1285 },
  ], lastDay: 140, remainingHp: 1285 };
  const r8 = resolveChainUid(chain8, census8, events8);
  check('spawn-day-resolution', r8.status === 'RESOLVED' && r8.uid === 29, JSON.stringify(r8));
  // arm's verdict/analysis file.
  const src = fs.readFileSync(path.join(__dirname, 'analyze-uidmatcher-a.js'), 'utf8');
  const banned = ['sim-scholarmelt-a-analysis', 'sim-removal-a-analysis', 'sim-sameday-a-analysis',
    'sim-draftflag-a-analysis', 'perseed-scholarmelt-a', 'perseed-removal-a', 'perseed-draftflag-a',
    'perseed-recurrence-a', 'sim-chainclose-a-analysis'];
  const hits = banned.filter(b => src.indexOf(b) >= 0);
  check('no-smuggling-source-check', hits.length === 0, 'banned strings present: ' + hits.join(','));
}

function determinism() {
  const scratch = path.join(REPO, 'scratch-uidmatcher-a');
  let rowIdentical = false, censusIdentical = false, normalizedIdentical = false, rawIdentical = false, scratchRemoved = false;
  let normDiffLines = 0, rawDiffDetail = '';
  try {
    fs.rmSync(scratch, { recursive: true, force: true });
    fs.mkdirSync(scratch, { recursive: true });
    const env = Object.assign({}, process.env, { EVID: scratch });
    execSync(`node scripts/sweep-sameday-a.js --one 75102`, { cwd: REPO, env, stdio: 'pipe', timeout: 600000 });
    const mineRow = fs.readFileSync(path.join(scratch, 's75102-fresh.json'), 'utf8');
    const theirRow = fs.readFileSync(path.join(REPO, 'evidence', '2026-10-30', 'perseed-sameday-a', 's75102-fresh.json'), 'utf8');
    const mineCen = fs.readFileSync(path.join(scratch, 'census-s75102.json'), 'utf8');
    const theirCen = fs.readFileSync(path.join(REPO, 'evidence', '2026-10-30', 'perseed-sameday-a', 'census-s75102.json'), 'utf8');
    rawIdentical = (mineRow === theirRow);
    censusIdentical = (mineCen === theirCen);
    const normalize = (s) => s.split('worktrees/sim-sameday-a').join('worktrees/WORKTREE')
      .split('worktrees/sim-uidmatcher-a').join('worktrees/WORKTREE');
    normalizedIdentical = (normalize(mineRow) === normalize(theirRow));
    if (!rawIdentical) {
      // Every raw difference must be a worktree-path difference:
      // compare line by line after stripping the two path strings.
      const aLines = normalize(mineRow).split('\n'), bLines = normalize(theirRow).split('\n');
      normDiffLines = aLines.reduce((t, line, i) => t + (line !== bLines[i] ? 1 : 0), 0) + Math.abs(aLines.length - bLines.length);
      const rawA = mineRow.split('\n'), rawB = theirRow.split('\n');
      const diffIdx = [];
      for (let i = 0; i < Math.max(rawA.length, rawB.length); i++) if (rawA[i] !== rawB[i]) diffIdx.push(i);
      rawDiffDetail = `rawDiffLines=${diffIdx.length} firstLines=${diffIdx.slice(0, 5).join(',')}`;
      const allPathOnly = diffIdx.every(i => {
        const a = rawA[i] || '', b = rawB[i] || '';
        return normalize(a) === normalize(b);
      });
      check('determinism-raw-diffs-are-path-only', allPathOnly, rawDiffDetail);
    }
    rowIdentical = normalizedIdentical;
  } finally {
    try { fs.rmSync(scratch, { recursive: true, force: true }); } catch (e) {}
    scratchRemoved = !fs.existsSync(scratch);
  }
  check('determinism-row-normalized-identical', rowIdentical, `rawIdentical=${rawIdentical} normalized=${normalizedIdentical}`);
  check('determinism-census-byte-identical', censusIdentical, '');
  check('determinism-scratch-removed', scratchRemoved, '');
  console.log(`DETERMINISM rowRaw=${rawIdentical} rowNormalized=${normalizedIdentical} census=${censusIdentical} scratchRemoved=${scratchRemoved} ${rawDiffDetail}`);
}

function main() {
  const args = process.argv.slice(2);
  fixtures();
  if (args.indexOf('--determinism') >= 0) determinism();
  console.log(`FIXTURES ${fail === 0 ? 'PASS' : 'FAIL'} ${pass}/${pass + fail}`);
  if (fail > 0) process.exit(1);
}
if (require.main === module) main();
module.exports = { fixtures, determinism };
