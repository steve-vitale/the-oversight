#!/usr/bin/env node
// scripts/test-deferhold-20261021.js — backlog #734 FIX proof (2026-10-21).
//
// CANON CALL (documented for Steve's overrule): docs/MONSTER-WAVES.md,
// "Combat readiness gates the standing unlock" (design call #4, 2026-10-16):
//   "The wave's TITLE is never named in the hold (knowledge-gate
//    discipline) — the bar is the fiction: the village knows it's not
//    ready; the scouts report the horde."
// _readinessBarLine's comment already said exactly that — but
// _standingHoldBeat's defer5 FIRST-FIRE beat named "The Producers" (the
// wave-5 title, earned only when wave 5 lands — _standingReleaseBeat(5) /
// waveUnlockBeat(5)'s job). So: fix the TEXT (option a), the comment was
// right. Numbered drafts ("the fifth draft") stay; titles don't.
//
// Parts:
//  1. FIXTURE RED->GREEN: drive the defer5 hold via villageStandingTotal()
//     on a scripted village (w4 ready, w5 not, capped standing >= 200),
//     capture the first-fire beat.
//       default: assert the fixed beat — no "Producers", keeps "fifth
//         draft", names the short bars. FAILS on pristine (RED).
//       RED_PRISTINE=1: assert the BUG — the beat names "The Producers".
//         PASSES on pristine (bug confirmed), FAILS on fixed.
//  2. DET-GATE (default mode only): 4 paired seeds, fix ON vs fix OFF,
//     per-day state digests via det-gate.js dayHash (narration-excluded by
//     construction) must be BYTE-IDENTICAL. The fixture forces the defer5
//     hold to bite during the run, so the changed beat path executes; we
//     assert it fired in both runs and the ONLY differing narration line
//     is the first-fire beat. Narration-only change => no state perturb.
//  3. STATIC AUDIT (default mode only): no other caller of the beat
//     changes behavior — defer4 first-fire still gates wave-3's title on
//     earned (and never names wave-4's/5's); defer5 reminder unchanged;
//     cap beat unchanged; _standingReleaseBeat(5) STILL names the Producers
//     (that's the earn moment); _standingReleaseBeat(4) unchanged;
//     _readinessBarLine and standingLine() name no titles.
//
// The fix is narration-only: one sysSay string in _standingHoldBeat.
// No [needs-eyes] (no feel/combat/UI change).
//
// Usage:
//   node scripts/test-deferhold-20261021.js
//   RED_PRISTINE=1 node scripts/test-deferhold-20261021.js   (bug demo)
// New tests must not write into the repo — this one doesn't (evidence is
// written by the caller, not the test).
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');

const ROOT = path.join(__dirname, '..');
const STANDING = path.join(ROOT, 'src', 'js', 'standing.js');
const FIXED_SRC = fs.readFileSync(STANDING, 'utf8');
// pristineSrc(): the PRE-FIX standing.js. The fix may be committed (worktree
// HEAD carries it — the normal post-commit/landing state) or uncommitted
// (HEAD is the pre-fix base). Prefer HEAD^ when it still has the old line,
// else HEAD. Never invents: exactly one of the two real refs is used.
let PRISTINE_SRC = null;
function pristineSrc() {
  if (!PRISTINE_SRC) {
    const at = (ref) => {
      try {
        return execSync('git show ' + ref + ':src/js/standing.js',
          { cwd: ROOT, maxBuffer: 16 * 1024 * 1024 }).toString('utf8');
      } catch (e) { return null; }
    };
    const head = at('HEAD');
    const parent = at('HEAD^');
    PRISTINE_SRC = (parent && /The Producers want a village/.test(parent)) ? parent
      : (head && /The Producers want a village/.test(head)) ? head
      : (parent || head);
  }
  return PRISTINE_SRC;
}
function swapStanding(src) { fs.writeFileSync(STANDING, src); }
function restoreFixed() {
  swapStanding(FIXED_SRC);
  if (fs.readFileSync(STANDING, 'utf8') !== FIXED_SRC) throw new Error('restore of fixed standing.js failed');
}

const RED_MODE = process.env.RED_PRISTINE === '1';
const fails = [];
const pass = [];
function check(name, cond, detail) {
  const ok = !!cond;
  (ok ? pass : fails).push(name);
  console.log(`  ${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
}

// ---- sanity: we are testing what we think we are ----
check('worktree standing.js carries the FIX (no "The Producers want a village")',
  !/The Producers want a village/.test(FIXED_SRC) && /It wants a village that can fight/.test(FIXED_SRC));
check('HEAD standing.js is PRISTINE (has the old "The Producers want a village" line)',
  /The Producers want a village/.test(pristineSrc()));

function ledger(points) { return { points, perType: { x: 2, y: 2 }, perTypeX: {} }; }
function feast(n, day) {
  const log = [];
  for (let i = 0; i < n; i++) log.push({ day: day - i, quality: 1 });
  return log;
}

async function buildGame(seed) {
  const { Game } = await loadGame({ seed, mode: 'deferhold-proof' });
  await quietLog(async () => { await setupGame(Game); });
  Game._beatLines = [];
  const origSysSay = Game.sysSay, origSay = Game.say;
  Game.sysSay = function (t) { try { Game._beatLines.push(t); } catch (e) {} if (origSysSay) return origSysSay.call(Game, t); };
  Game.say = function (t) { try { Game._beatLines.push(t); } catch (e) {} if (origSay) return origSay.call(Game, t); };
  Game.state.systemArrived = true; // fixtures jump to day 60; say it arrived
  return Game;
}

function vpOf(Game, vid) { return (typeof Game.vpOf === 'function') ? Game.vpOf(vid) : null; }
function livingFighters(Game, n) {
  const out = [];
  for (const vid of ((Game.state.village || {}).roster || [])) {
    if (vid === Game.villagerId) continue;
    const vp = vpOf(Game, vid);
    if (vp && !vp.dead) out.push(vid);
    if (out.length >= n) break;
  }
  return out;
}
function stripVillage(Game) {
  const sch = Game.state.scholar || {};
  sch.equipped = {};
  const roster = ((Game.state.village || {}).roster || []);
  for (const vid of roster) {
    if (vid === Game.villagerId) continue;
    const vp = vpOf(Game, vid);
    if (!vp || vp.dead) continue;
    vp.equipped = {};
    vp.items = [];
  }
  Game.state.monsterCounters = {};
  Game.state.waveKillLog = [];
}

// defer5-hold fixture: wave 4 ready, wave 5 NOT (armor + veterans short),
// capped standing = 200 (war 100 + plenty capped 100) => defer5 binds.
function defer5Fixture(Game) {
  Game.state.scholar.day = 60;
  Game.state.waveLedger = Game.state.waveLedger || {};
  Game.state.waveLedger[1] = ledger(5);
  Game.state.waveLedger[2] = ledger(4);
  Game.state.waveLedger[3] = ledger(4); // war = 4*25 = 100
  Game.state.waveLedger[4] = ledger(0);
  Game.state.waveLedger[5] = ledger(0);
  Game.state.feastLog = feast(10, 55);   // plenty = 200, capped 100 toward T5
  try { Game.deedState().wavesFaced = { eater: 4 }; } catch (e) {} // wave-4 faced (w5 door)
  delete Game.state._standingDeferBeat;
  delete Game.state._standingPlentyCapBeat;
  delete Game.state._standingPeakWave;
  if (Game._beatLines) Game._beatLines.length = 0;
  stripVillage(Game);
  const vids = livingFighters(Game, 8);
  // w4: 3 armored @P>=10 OK | w5: needs 4 @P>=15 -> SHORT (3 hide_armor P=20)
  for (let i = 0; i < 3 && i < vids.length; i++) {
    const vp = vpOf(Game, vids[i]);
    vp.equipped = Object.assign(vp.equipped || {}, { torso: { itemId: 'hide_armor' } });
  }
  // armed: 5 fighters + scholar = 6 (w4: 5 OK, w5: 6 OK)
  for (let i = 0; i < 5 && i < vids.length; i++) {
    const vp = vpOf(Game, vids[i]);
    vp.equipped = Object.assign(vp.equipped || {}, { melee: { itemId: 'hunting_spear' } });
  }
  Game.state.scholar.equipped = { melee: { itemId: 'hunting_spear' } }; // armed, not armored
  Game.state.monsterCounters = { bulldozer: true, hushwolf: true, voice_mimic_radio: true }; // tricks 3: both OK
  // veterans: 1 wave-3 kill (w4: 1 w3+ OK | w5: needs 2 w4+ -> SHORT)
  Game.state.waveKillLog = [{ d: 50, mid: 'redactor', w: 3, by: vids[0], via: 'agency' }];
}

function firstFireLine(Game) {
  return (Game._beatLines || []).find(l => /fifth draft stays in the wings\./.test(l)) || '';
}

(async () => {
  // In RED mode, load the PRISTINE standing.js so the fixture demonstrates
  // the bug; the fixed source is restored immediately after load.
  if (RED_MODE) {
    swapStanding(pristineSrc());
    try {
      const Game = await buildGame(4242);
      defer5Fixture(Game);
      const total = Game.villageStandingTotal();
      check('RED fixture: defer5 hold binds (total held at 199)', total === 199, 'total=' + total);
      const line = firstFireLine(Game);
      check('BUG DEMONSTRATED: defer5 first-fire names the wave-5 title "The Producers"',
        /The Producers/.test(line), line.slice(0, 120));
    } finally { restoreFixed(); }
    console.log(`\n${pass.length} passed, ${fails.length} failed`);
    process.exit(fails.length ? 1 : 0);
  }

  // ================= PART 1: fixture RED->GREEN (fixed tree) =================
  {
    const Game = await buildGame(4242);
    defer5Fixture(Game);
    check('fixture: wave-4 readiness met (door open, no defer4 hold)',
      Game.waveUnlockReady(4).ready === true && Game.standingDeferral(4).deferred === false);
    check('fixture: wave-5 readiness NOT met (armor + veterans short)',
      Game.waveUnlockReady(5).ready === false &&
      (Game.waveUnlockReady(5).short || []).includes('armor') &&
      (Game.waveUnlockReady(5).short || []).includes('veterans'),
      JSON.stringify(Game.waveUnlockReady(5).short));
    check('fixture: defer5 hold binds', Game.standingDeferral(5).deferred === true);
    const total = Game.villageStandingTotal();
    check('fixture: total held at 199 (defer5 binding)', total === 199, 'total=' + total);
    const line = firstFireLine(Game);
    check('FIX: first-fire beat FIRED', line.length > 0, 'beats=' + Game._beatLines.length);
    check('FIX: beat does NOT name the wave-5 title "The Producers"', !/producers/i.test(line), line.slice(0, 140));
    check('FIX: beat keeps the numbered draft ("the fifth draft")', /fifth draft/i.test(line));
    check('FIX: beat keeps the System voice ("wants a village that can fight")',
      /It wants a village that can fight/.test(line), line.slice(0, 140));
    check('FIX: beat still names the short bars (armor + veterans)',
      /armor the village \(3 of 4/.test(line) && /blood your fighters \(0 of 2/.test(line), line.slice(0, 200));
    check('FIX: standingLine names no wave titles', !/producers|mirror draft|final draft/i.test(Game.standingLine()),
      Game.standingLine().slice(0, 160));
  }

  // ================= PART 2: det-gate, 4 paired seeds, fix ON vs OFF =================
  // The fixture above forces the defer5 hold to bite during the run, so the
  // changed beat path executes. Digests use det-gate.js dayHash — game state
  // only, narration-excluded by construction.
  async function trajectory(seed, usePristine) {
    swapStanding(usePristine ? pristineSrc() : FIXED_SRC);
    let Game;
    try {
      const loaded = await loadGame({ seed, mode: 'deferhold-detgate' });
      Game = loaded.Game;
    } finally { restoreFixed(); } // modules already eval'd; restore immediately
    let firstFireText = '';
    await quietLog(async () => { await setupGame(Game); });
    const origSysSay = Game.sysSay;
    Game.sysSay = function (t) {
      try {
        if (!firstFireText && /fifth draft stays in the wings\. (It wants|The Producers)/.test(t)) firstFireText = t;
      } catch (e) {}
      if (origSysSay) return origSysSay.call(Game, t);
    };
    Game.state.systemArrived = true;
    defer5Fixture(Game);
    const hashes = [];
    const policy = { daily: (G) => { hashes.push(G.state.scholar.day + ':' + dayHash(G)); } };
    await quietLog(async () => { await runDays(Game, policy, { days: 40 }); });
    return { digest: hashes.join('\n'), days: hashes.length, firstFireText };
  }
  {
    const seeds = [101, 202, 303, 404];
    for (const seed of seeds) {
      const off = await trajectory(seed, true);   // pristine standing.js
      const on = await trajectory(seed, false);   // fixed standing.js
      check(`det-gate s${seed}: changed beat path EXECUTED in both runs`,
        off.firstFireText.length > 0 && on.firstFireText.length > 0,
        `off=${off.firstFireText.slice(0, 60)}...`);
      check(`det-gate s${seed}: only the first-fire TEXT differs (narration-only)`,
        off.firstFireText !== on.firstFireText &&
        /The Producers/.test(off.firstFireText) && !/Producers/.test(on.firstFireText));
      check(`det-gate s${seed}: BYTE-IDENTICAL state trajectories (${on.days}d, narration excluded)`,
        on.digest === off.digest && on.days === off.days && on.days > 0,
        `${on.days}d on vs ${off.days}d off`);
    }
  }

  // ================= PART 3: static audit — no other caller changes =================
  {
    const Game = await buildGame(777);
    const rdOf = (w) => Game.waveUnlockReady(w);

    // defer4, wave-3 NOT earned: "the next act", no titles at all
    Game.state.scholar.day = 60;
    Game.state.waveLedger = { 1: ledger(5), 2: ledger(0), 3: ledger(0), 4: ledger(0), 5: ledger(0) };
    Game.state.feastLog = feast(5, 55); // standing 100 via plenty only
    delete Game.state._standingDeferBeat; delete Game.state._standingPeakWave;
    Game._beatLines.length = 0;
    stripVillage(Game);
    Game.villageStandingTotal();
    const d4un = (Game._beatLines || []).find(l => /next act/.test(l)) || '';
    check('audit: defer4 first-fire (w3 unearned) still gates the title', d4un.length > 0 &&
      !/final draft|mirror draft|producers/i.test(d4un), d4un.slice(0, 120));

    // defer4, wave-3 earned: names "the Final Draft" (earned), nothing else
    Game.state.waveLedger[2] = ledger(4);
    delete Game.state._standingDeferBeat;
    Game._beatLines.length = 0;
    Game.villageStandingTotal();
    const d4e = (Game._beatLines || []).find(l => /next act/.test(l)) || '';
    check('audit: defer4 first-fire (w3 earned) still names the earned wave-3 title',
      /Final Draft/.test(d4e) && !/Mirror Draft|Producers/.test(d4e), d4e.slice(0, 140));

    // defer5 reminder (7d later): unchanged template, no title
    defer5Fixture(Game);
    Game.villageStandingTotal(); // first fire
    Game.state.scholar.day += 7;
    Game._beatLines.length = 0;
    Game.villageStandingTotal(); // reminder
    const rem = (Game._beatLines || []).find(l => /fifth draft stays in the wings/.test(l)) || '';
    check('audit: defer5 reminder beat UNCHANGED (no title, same template)',
      rem.length > 0 && !/producers/i.test(rem) && /fifth draft stays in the wings — /.test(rem), rem.slice(0, 140));

    // plenty-cap beat: unchanged, no title
    Game.state.scholar.day = 60;
    Game.state.waveLedger = { 1: ledger(5), 2: ledger(4), 3: ledger(0), 4: ledger(0), 5: ledger(0) };
    Game.state.feastLog = feast(10, 55); // raw 200 >= t5, capped 100 < t5
    delete Game.state._standingDeferBeat; delete Game.state._standingPlentyCapBeat; delete Game.state._standingPeakWave;
    Game._beatLines.length = 0;
    stripVillage(Game);
    // gear for w4 readiness so the CAP (not defer4) is the binding tooth
    const vids = livingFighters(Game, 8);
    for (let i = 0; i < 3 && i < vids.length; i++) {
      const vp = vpOf(Game, vids[i]);
      vp.equipped = Object.assign(vp.equipped || {}, { torso: { itemId: 'hide_armor' } });
    }
    for (let i = 0; i < 5 && i < vids.length; i++) {
      const vp = vpOf(Game, vids[i]);
      vp.equipped = Object.assign(vp.equipped || {}, { melee: { itemId: 'hunting_spear' } });
    }
    Game.state.scholar.equipped = { torso: { itemId: 'hide_armor' }, melee: { itemId: 'hunting_spear' } };
    Game.state.monsterCounters = { bulldozer: true, hushwolf: true, voice_mimic_radio: true };
    Game.state.waveKillLog = [{ d: 50, mid: 'redactor', w: 3, by: vids[0], via: 'agency' }];
    Game.villageStandingTotal();
    const cap = (Game._beatLines || []).find(l => /not bought with bread/.test(l)) || '';
    check('audit: plenty-cap beat UNCHANGED (no title)', cap.length > 0 && !/producers/i.test(cap), cap.slice(0, 120));

    // release beats: STILL name the titles (that's the earn moment)
    Game._beatLines.length = 0;
    Game._standingReleaseBeat(4);
    Game._standingReleaseBeat(5);
    const rel = Game._beatLines.join('\n');
    check('audit: release beat 4 still names "The Mirror Draft"', /Mirror Draft opens/.test(rel));
    check('audit: release beat 5 still names "the Producers" (earn moment)', /the Producers have greenlit/.test(rel));

    // _readinessBarLine itself names no titles
    const barline = Game._readinessBarLine(rdOf(5));
    check('audit: _readinessBarLine names no wave titles', !/producers|mirror draft|final draft/i.test(barline), barline);
  }

  console.log(`\n${pass.length} passed, ${fails.length} failed`);
  // worktree must be left with the FIXED file, whatever happened
  try { restoreFixed(); } catch (e) { console.error('RESTORE FAILED:', e.message); process.exit(2); }
  process.exit(fails.length ? 1 : 0);
})().catch(e => {
  try { restoreFixed(); } catch (e2) {}
  console.error('FATAL', e);
  process.exit(1);
});
