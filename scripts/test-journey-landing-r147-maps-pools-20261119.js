#!/usr/bin/env node
// test-journey-landing-r147-maps-pools-20261119.js — proof test for the r147
// MAPS-POOL fix (journey-landing r147 2026-11-19).
//
// The defect (panel r146, seeds 1248 d6 and 1250 d10): a bare `THEM: "..."`
// line after a compare_maps pick with nothing new. Root cause: the
// compare_maps branch (src/js/conversation.js) picks the even-maps line
// from a 2-line pool (`maps:nonenew`) via convoPick, which filters
// against EVERYTHING ever said to that villager (cross-sitting
// persistence). After both lines are used — in 1250 d10 by turn 12, in
// 1248 d6 by turn 12 — the third pick returns null and the NULL-LINE
// CLASS GUARD (conversation.js:8130, r16) replaces it with bare `"..."`.
// The villager asked to compare maps says nothing at all. The same
// defect class lives in the `maps:shared` pool (3 lines): a sitting
// comparing maps 4+ times with new ground each time dries the same way.
//
// The fix (src/js/conversation.js, compare_maps branch): expand
// `maps:nonenew` 2 -> 6 and `maps:shared` 3 -> 6, existing lines kept
// first, same voice. A sitting now needs seven compares before any
// repeat — same remedy as the r124 small-pool and r146 want-bridge
// expansions.
//
// The pools live inline in the branch (not in data), so the test reads
// them from the live source file and serves them through the real
// convoPick — on unfixed code the extracted pools hold 2/3 lines and
// the 3rd/4th call returns null -> FAIL. No hardcoded pool copy: a
// stale test list could pass against a regressed pool.
//
// Cases (each in its own process — never two harnesses in one process):
//   nonenew : convoPick(vid, 'maps:nonenew', pool) 6 times — all 6 serve
//             a known line, all distinct, none null. On unfixed code:
//             3rd call null -> FAIL.
//   shared  : same for 'maps:shared', 6 times. On unfixed code: 4th call
//             null -> FAIL.
//   sitting3: convoPick(vid, 'maps:nonenew', pool) 3 times — all distinct
//             non-null. The exact panel shape (1248 d6 / 1250 d10 dried
//             on the 3rd nonenew pick). On unfixed code: 3rd null -> FAIL.
//   control : the extracted pools contain the original lines verbatim
//             (the fix added lines, it did not drop or rewrite any), and
//             the shared pool still interpolates the new-place count.
//
// Usage: node scripts/test-journey-landing-r147-maps-pools-20261119.js [nonenew|shared|sitting3|control]
//   Default (no arg): runs all four cases, spawning children for the
//   non-default cases (separate processes).
'use strict';
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame } = require('./sim-harness');

let fails = 0;
function check(name, cond, detail) {
  console.log((cond ? 'PASS ' : 'FAIL ') + name + (detail ? ' — ' + detail : ''));
  if (!cond) fails++;
}

// The original pool lines, verbatim — the fix must keep all of them.
const ORIG_NONENEW = [
  '"Huh. We\'ve walked the same ground, you and I."',
  '"Let me see... no, you\'ve got everything I\'ve got. We\'re even."',
];
const ORIG_SHARED_FRAGMENTS = [
  '"Here — and here."',
  '"I\'ve been all through here."',
  'Your map grows by 2 places.',
];

// Extract the two `spots` arrays from the compare_maps branch of the
// live source, and evaluate them with the branch's own variables in
// scope (vname, cmp). Returns { shared, nonenew } as string arrays.
function extractMapsPools() {
  const src = fs.readFileSync(path.join(__dirname, '..', 'src', 'js', 'conversation.js'), 'utf8');
  const anchor = src.indexOf("choiceId === 'compare_maps'");
  if (anchor === -1) throw new Error('compare_maps branch not found in conversation.js');
  const block = src.slice(anchor, anchor + 4000);
  const re = /const spots = \[([\s\S]*?)\n\s*\];/g;
  const arrays = [];
  let m;
  while ((m = re.exec(block)) !== null) arrays.push(m[1]);
  if (arrays.length < 2) throw new Error(`expected 2 spots arrays after compare_maps, found ${arrays.length}`);
  const evalArray = (body) => {
    const fn = new Function('vname', 'cmp', 'return [' + body + '];');
    const out = fn('Test', { newCount: 2 });
    if (!Array.isArray(out) || out.some(l => typeof l !== 'string')) {
      throw new Error('extracted spots array did not evaluate to string[]');
    }
    return out;
  };
  // First array in the branch is the newCount > 0 (shared) pool, second
  // is the else (nonenew) pool.
  return { shared: evalArray(arrays[0]), nonenew: evalArray(arrays[1]) };
}

function pickVillager(Game) {
  const v = Game.state.village || {};
  const roster = (v.roster || []).filter(id => id !== Game.villagerId);
  return roster[0] || null;
}

async function runCase(mode) {
  const seed = { nonenew: 5914, shared: 5915, sitting3: 5916, control: 5917 }[mode] || 5914;
  const pools = extractMapsPools();
  check(`${mode}: extracted shared pool has >= 3 lines`, pools.shared.length >= 3,
    `shared=${pools.shared.length}`);
  check(`${mode}: extracted nonenew pool has >= 2 lines`, pools.nonenew.length >= 2,
    `nonenew=${pools.nonenew.length}`);
  const { Game } = await loadGame({ seed, mode: 'landing-r147-maps-pools-proof', fullTelemetry: true });
  await setupGame(Game);
  const vid = pickVillager(Game);
  check(`${mode}: roster villager exists`, !!vid);
  if (!vid) return;

  if (mode === 'nonenew' || mode === 'shared') {
    const key = mode === 'nonenew' ? 'maps:nonenew' : 'maps:shared';
    const pool = pools[mode];
    const served = [];
    for (let i = 0; i < 6; i++) {
      let line = null;
      try { line = Game.convoPick(vid, key, pool); } catch (e) { line = null; }
      served.push(line);
    }
    check(`${mode}: all 6 calls serve a line (no null — null renders as bare "...")`,
      served.every(s => s !== null), `served=${JSON.stringify(served)}`);
    check(`${mode}: all 6 served lines are known pool lines`,
      served.every(s => s !== null && pool.indexOf(s) !== -1),
      `served=${JSON.stringify(served)}`);
    check(`${mode}: all 6 served lines distinct (no-repeat)`,
      new Set(served.filter(s => s !== null)).size === 6,
      `distinct=${new Set(served.filter(s => s !== null)).size} served=${JSON.stringify(served)}`);
    return;
  }

  if (mode === 'sitting3') {
    const served = [];
    for (let i = 0; i < 3; i++) {
      let line = null;
      try { line = Game.convoPick(vid, 'maps:nonenew', pools.nonenew); } catch (e) { line = null; }
      served.push(line);
    }
    check('sitting3: all 3 nonenew picks serve a line (the exact panel shape)',
      served.every(s => s !== null), `served=${JSON.stringify(served)}`);
    check('sitting3: all 3 served lines distinct',
      new Set(served.filter(s => s !== null)).size === 3,
      `distinct=${new Set(served.filter(s => s !== null)).size} served=${JSON.stringify(served)}`);
    return;
  }

  if (mode === 'control') {
    for (const frag of ORIG_NONENEW) {
      check(`control: nonenew pool keeps original line ${frag.slice(0, 28)}…`,
        pools.nonenew.some(l => l.indexOf(frag) !== -1));
    }
    for (const frag of ORIG_SHARED_FRAGMENTS) {
      check(`control: shared pool keeps original fragment ${frag.slice(0, 28)}…`,
        pools.shared.some(l => l.indexOf(frag) !== -1));
    }
    check('control: nonenew pool has 6 lines', pools.nonenew.length === 6,
      `nonenew=${pools.nonenew.length}`);
    check('control: shared pool has 6 lines', pools.shared.length === 6,
      `shared=${pools.shared.length}`);
    return;
  }
}

async function main() {
  const mode = process.argv[2];
  if (mode && ['nonenew', 'shared', 'sitting3', 'control'].includes(mode)) {
    await runCase(mode);
  } else {
    await runCase('nonenew');
    for (const m of ['shared', 'sitting3', 'control']) {
      try {
        const out = execFileSync('node', [path.join(__dirname, 'test-journey-landing-r147-maps-pools-20261119.js'), m],
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
