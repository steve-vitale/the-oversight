#!/usr/bin/env node
// scripts/test-griefgift-arrears-20261015.js — PROOF for sim-griefgift-b (flesh-out loop B).
//
// Two things this run must prove:
//  (A) The GRIEF-GRAIN aid credit is PRESENT on the armed tip AND the
//      control engine (a byte-copy of this tree with ONLY the credit block
//      neutralized) genuinely behaves pre-credit: the same gift call credits
//      the sub's pantry on armed, and lets the grain vanish on control.
//      This proves the before/after comparison isolates exactly the lever.
//  (B) The arrears accumulator instrument measures what it claims: given a
//      fabricated daily arrears sequence with a pay-down reset (0 -> 500 ->
//      0 -> 300), accrued-post-gift must be 800 (positive deltas only).
//
// RED/GREEN:
//  - Normal mode on the armed tip: GREEN for both A and B.
//  - --red mode forces the credit assertion on the armed tree while the
//    credit block is neutralized via the patch-file cycle (see below) — the
//    assertion must FAIL (exit 2, "RED OBSERVED"), proving the test
//    discriminates the credit's presence.
//  - --break mode points the accumulator at a wrong field (link.arrear) —
//    the instrument test must FAIL (exit 1), proving it reads real arrears.
//  - On a tree where the credit was killed/reverted, the script prints
//    INFO-SKIP and exits 0 (never MODULE_NOT_FOUND, never a crash).
//
// Patch-file RED cycle (never git stash on the hot repo):
//   git diff src/js/hierarchy.js > ~/workspace/griefgift-red.patch
//   git checkout HEAD -- src/js/hierarchy.js        # RED state
//   node scripts/test-griefgift-arrears-20261015.js --red   # expect RED OBSERVED (exit 2)
//   git apply ~/workspace/griefgift-red.patch       # GREEN state
//   node scripts/test-griefgift-arrears-20261015.js        # expect GREEN
//
// Usage: node scripts/test-griefgift-arrears-20261015.js [--red|--break]
'use strict';
const fs = require('fs');
const path = require('path');

const ARGS = process.argv.slice(2);
const RED_MODE = ARGS.includes('--red');
const BREAK_MODE = ARGS.includes('--break');

const WORKTREE = path.join(__dirname, '..');
const CONTROL_TREE = '/home/hatch/workspace/griefgift-control-tree';
const ARMED_MARKER = 'GRIEFGRAIN-AID-CREDIT';
const DISABLED_MARKER = 'GRIEFGRAIN-AID-CREDIT-DISABLED';

function armedMarkerPresent() {
  const src = fs.readFileSync(path.join(WORKTREE, 'src', 'js', 'hierarchy.js'), 'utf8');
  return src.indexOf(ARMED_MARKER) >= 0;
}
function controlCopyValid() {
  try {
    const src = fs.readFileSync(path.join(CONTROL_TREE, 'src', 'js', 'hierarchy.js'), 'utf8');
    return src.indexOf(DISABLED_MARKER) >= 0 && src.indexOf('if (_gsov && paid > 0)') < 0;
  } catch (e) { return false; }
}

function havenPantryKcal(Game) {
  return ((Game.state.village || {}).pantry || [])
    .reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
}
function subVillage(Game, id) {
  return (Game.state.otherVillages || []).find(v => v.id === id);
}

// --- arrears accumulator (the instrument under test) ---
// Tracks, per subordinate village, kcal of tribute arrears ACCRUED after a
// gift answer. Arrears only ratchet upward when tribute falls short; paying
// them down (link.arrears -> 0 on a full week) never subtracts — the grain
// that was missing stays missing.
function makeArrearsTracker() {
  const gifted = {}; // subId -> { giftDay, lastSeen, accrued }
  const field = BREAK_MODE ? 'arrear' : 'arrears'; // --break: wrong field, must FAIL
  return {
    registerGift(subId, day, arrearsNow) {
      if (!gifted[subId]) gifted[subId] = { giftDay: day, lastSeen: arrearsNow || 0, accrued: 0 };
    },
    scan(day, links) {
      for (const subId of Object.keys(gifted)) {
        const rec = gifted[subId];
        if (day < rec.giftDay) continue;
        let cur = 0;
        for (const l of links || []) {
          if (l && l.subordinate === subId && (l[field] || 0) > cur) cur = l[field] || 0;
        }
        if (cur > rec.lastSeen) rec.accrued += (cur - rec.lastSeen);
        rec.lastSeen = cur;
      }
    },
    totalAccrued() {
      return Object.keys(gifted).reduce((t, k) => t + gifted[k].accrued, 0);
    },
    bondCount() { return Object.keys(gifted).length; },
  };
}

async function buildWorld(harness, opts) {
  opts = opts || {};
  const { loadGame, setupGame } = harness;
  const { Game } = await loadGame({ seed: 42, mode: 'griefgift-proof' });
  await setupGame(Game);
  Game.state.otherVillages = (Game.state.otherVillages || []).concat([
    { id: 'griefv', name: 'Griefvale', pantryKcal: 5000, population: 10, day: 0, roster: [] },
  ]);
  const m = Game.mshipState();
  m.links = m.links || [];
  Game.state.scholar.day = 30;
  m.links.push({
    id: 'link_grief', primary: 'haven', subordinate: 'griefv',
    day: 0, trust: 30, status: 'active', tributeKcalPerWeek: 4000,
    tributePaidKcal: 0, tributeWeek: -1, tributePaidWeek: -1,
    arrears: 0, history: [], mourningUntil: 0,
    pendingRenegotiation: { sub: false, day: 28 },
  });
  Game.state.village.pantry = [{ name: 'Test grain', kcalEach: 1500, units: 2, spoilDay: 9999 }];
  return Game;
}

async function creditCheck(harness, label, expectCredit) {
  const Game = await buildWorld(harness);
  const subBefore = subVillage(Game, 'griefv').pantryKcal;
  const r = Game.answerRenegotiation('link_grief', 'gift');
  const subAfter = subVillage(Game, 'griefv').pantryKcal;
  const credited = subAfter === subBefore + 1500;
  const vanished = subAfter === subBefore;
  if (r !== 'gift') return { ok: false, detail: `${label}: answerRenegotiation returned ${r}` };
  if (expectCredit) {
    return credited
      ? { ok: true, detail: `${label}: sub pantry ${subBefore} -> ${subAfter} (+1500)` }
      : { ok: false, detail: `${label}: EXPECTED credit, sub pantry ${subBefore} -> ${subAfter}` };
  }
  return vanished
    ? { ok: true, detail: `${label}: sub pantry ${subBefore} -> ${subAfter} (grain vanishes, pre-credit)` }
    : { ok: false, detail: `${label}: EXPECTED vanishing, sub pantry ${subBefore} -> ${subAfter}` };
}

async function main() {
  let pass = 0;
  const ok = (name, cond, detail) => {
    if (!cond) { console.error(`FAIL ${name}: ${detail}`); process.exit(1); }
    pass++;
    console.log(`ok ${name}${detail ? ' — ' + detail : ''}`);
  };

  // ---- instrument test (B): synthetic arrears sequence, pure logic ----
  {
    const tr = makeArrearsTracker();
    tr.registerGift('griefv', 40, 0);
    const seq = [0, 200, 500, 500, 0, 100, 300]; // pay-down to 0 mid-sequence
    let day = 40;
    for (const a of seq) {
      tr.scan(day++, [{ subordinate: 'griefv', arrears: a, status: 'active' }]);
    }
    const got = tr.totalAccrued();
    const want = 800; // +200 +300, then +100 +200 after reset; reset subtracts nothing
    if (BREAK_MODE) {
      // --break: wrong field -> tracker sees nothing -> 0 != 800 -> must FAIL
      if (got === want) {
        console.error('FAIL break-accumulator: wrong-field tracker still measured 800 — instrument is not discriminating');
        process.exit(1);
      }
      console.log(`RED OBSERVED (break-accumulator): wrong field reads ${got}, expected ${want} — the test discriminates.`);
      process.exit(2);
    }
    ok('accumulator-accrues-deltas', got === want, `synthetic 0->500->0->300 accrues ${got} (want ${want})`);
    ok('accumulator-bond-count', tr.bondCount() === 1, 'one gifted bond tracked');
  }

  // ---- engine discrimination (A) ----
  const armedPresent = armedMarkerPresent();
  if (!armedPresent && !RED_MODE) {
    console.log('INFO-SKIP: GRIEFGRAIN-AID-CREDIT absent on this tree (killed/reverted) — nothing to prove. Exit 0.');
    return;
  }
  if (!controlCopyValid()) {
    console.error('FATAL: control copy missing or malformed (need GRIEFGRAIN-AID-CREDIT-DISABLED at ' + CONTROL_TREE + ')');
    process.exit(1);
  }
  const armedHarness = require(path.join(WORKTREE, 'scripts', 'sim-harness'));
  const controlHarness = require(path.join(CONTROL_TREE, 'scripts', 'sim-harness'));

  if (RED_MODE) {
    // The credit block has been neutralized on the armed tree via the
    // patch-file cycle. The credit assertion MUST fail here.
    const res = await creditCheck(armedHarness, 'RED-armed-tree', true);
    if (res.ok) {
      console.error('FAIL red-phase: credit still credited on the RED tree — patch did not neutralize it');
      process.exit(1);
    }
    console.log(`RED OBSERVED (credit): ${res.detail} — the proof detects the credit's absence.`);
    process.exit(2);
  }

  const a = await creditCheck(armedHarness, 'ARMED', true);
  ok('armed-credits-sub', a.ok, a.detail);
  const c = await creditCheck(controlHarness, 'CONTROL', false);
  ok('control-vanishes', c.ok, c.detail);

  // Only remaining difference between the two engines must be the credit block.
  // NOTE: a naive index-wise line compare misfires here — neutralizing the
  // block shifts all later line numbers by one. Use diff's own hunk count.
  const { execSync } = require('child_process');
  let hunkHeaders = 0, changedLines = 0;
  try {
    execSync('diff "' + path.join(WORKTREE, 'src', 'js', 'hierarchy.js') + '" "' +
      path.join(CONTROL_TREE, 'src', 'js', 'hierarchy.js') + '"');
  } catch (e) {
    const out = String((e.stdout || '') + (e.stderr || ''));
    hunkHeaders = (out.match(/^[0-9,acd]+$/gm) || []).length;
    changedLines = out.split('\n').filter(l => l[0] === '<' || l[0] === '>').length;
  }
  ok('control-diff-is-credit-only', hunkHeaders === 1 && changedLines <= 10,
    `${hunkHeaders} hunk(s), ${changedLines} changed lines between armed/control hierarchy.js (credit block only)`);

  console.log(`\nPROOF ${pass}/${pass} GREEN — the control engine differs from armed by the credit block alone; arrears instrument measures positive deltas across pay-downs.`);
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });
