#!/usr/bin/env node
// scripts/test-ledgerreset-20261016.js — sim-findings #16 PROOF (loop B, 2026-10-16).
//
// Finding: "Ledger doesn't reset on succession: successors' NPC-era takes
// persist as 'mystery takes'" (r7 selfeed arm, 2026-10-13).
//
// INVESTIGATION RESULT (see evidence/2026-10-16/sim-ledgerreset-b.md):
// the r8 arm (commit 26c1ac56, 2026-10-13) ALREADY landed the fix —
// playerDeath (src/js/ledger.js, FRESH SOCIAL LEDGER block) resets
// v.takes[newId], v.gives[newId], v.takeHist[newId], v.giveHist[newId]
// (r9 added giveHist) on every scholar-death succession. This proof
// therefore verifies the fix is LIVE and load-bearing, rather than
// introducing a new one:
//
//   RED   — with ONLY the reset block neutralized (string-surgical,
//           hash-verified restore), the succession fixture shows the
//           "mystery takes" persisting: the bug reproduces on demand,
//           proving the test is not a tautology and the reset is the
//           load-bearing ingredient.
//   GREEN — on current HEAD the successor's personal take history starts
//           clean (takes/gives/takeHist/giveHist zeroed) while village-level
//           ledger state (the leadership vector, ledger events) persists and
//           the office trust inheritance still applies.
//
// No canon doc covers the ledger (CANON.md has no ledger entry) — the
// semantics below follow the freeloader clock's purpose (fair-share
// accounting per person) and the r8 design notes, documented in the
// evidence file instead of invented.
//
// Usage: node scripts/test-ledgerreset-20261016.js
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const { loadGame, setupGame } = require('./sim-harness');

const ROOT = path.join(__dirname, '..');
const LEDGER = path.join(ROOT, 'src/js/ledger.js');

let pass = 0, fail = 0;
function ok(name, cond, detail) {
  if (cond) { pass++; console.log(`  PASS ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}
function sha(p) { return crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex'); }

// Neutralize ONLY the succession reset block (the four store writes).
// Everything else in playerDeath — corpse, trust inheritance, mantle —
// stays identical, so RED isolates exactly the reset's contribution.
const RESET_RE = /(\s+)if \(v\.takes\) v\.takes\[newId\] = 0;\n(\s+)if \(v\.gives\) v\.gives\[newId\] = 0;\n(\s+)if \(v\.takeHist\) v\.takeHist\[newId\] = \[\];\n(\s+)if \(v\.giveHist\) v\.giveHist\[newId\] = \[\]; \/\/ r9: [^\n]*\n/;
function neutralized(src) {
  if (!RESET_RE.test(src)) throw new Error('reset block pattern not found — ledger.js changed?');
  return src.replace(RESET_RE,
    '$1// RED-NEUTRALIZED (test only): succession reset disabled —\n$1// reproduces the pre-r8 "mystery takes" bug on current code.\n');
}

// The succession fixture: crown an NPC with a loaded NPC-era book, kill the
// scholar, return the observed post-succession ledger state.
async function successionFixture() {
  const { Game } = await loadGame({ seed: 4242, mode: 'ledgerreset-proof' });
  await setupGame(Game);
  const v = Game.state.village;
  const oldVid = Game.villagerId;
  const rosterNPCs = (v.roster || []).filter(id => id !== oldVid).slice(0, 3);
  if (rosterNPCs.length < 2) throw new Error('need 2+ NPCs');
  const nid = rosterNPCs[0];
  // crown the NPC: top trust so the trust-sorted candidate pick takes them
  v.trust = v.trust || {};
  for (const id of (v.roster || [])) v.trust[id] = 1;
  v.trust[nid] = 100;
  // NPC-era book: communal meals + voluntary takes accrued as a villager
  v.takes = v.takes || {}; v.gives = v.gives || {};
  v.takes[nid] = 12345; v.gives[nid] = 678;
  // dated entries inside the trailing-7d window of the death day (60)
  v.takeHist = v.takeHist || {}; v.takeHist[nid] = [{ day: 57, kcal: 100 }, { day: 59, kcal: 200 }];
  v.giveHist = v.giveHist || {}; v.giveHist[nid] = [{ day: 58, kcal: 50 }];
  // another villager's book must be untouched by the succession
  const other = rosterNPCs[1];
  v.takes[other] = 777; v.takeHist[other] = [{ day: 40, kcal: 77 }];
  // village-level (office) ledger state that MUST persist
  const pg = Game.progState();
  const L = Game.ledger();
  L.foodShared = 7; L.might = 3;
  pg.ledgerEvents = pg.ledgerEvents || [];
  const evBefore = pg.ledgerEvents.length;
  Game.state.scholar.day = 60;
  try { Game.playerDeath('test-succession'); } catch (e) { console.log('  (playerDeath threw: ' + e.message + ')'); }
  const newVid = Game.villagerId;
  return {
    Game, v, pg, oldVid, newVid, nid, other, evBefore,
    takes: (v.takes || {})[nid] || 0,
    gives: (v.gives || {})[nid] || 0,
    takeHist: ((v.takeHist || {})[nid] || []).slice(),
    giveHist: ((v.giveHist || {})[nid] || []).slice(),
    takeRate: Game.takeRate7(nid),
    giveRate: Game.giveRate7(nid),
    foodShared: Game.ledger().foodShared,
    might: Game.ledger().might,
    evAfter: (pg.ledgerEvents || []).length,
    trustNew: (v.trust || {})[nid],
    otherTakes: (v.takes || {})[other] || 0,
    otherHist: (((v.takeHist || {})[other]) || []).length,
  };
}

async function main() {
  const beforeHash = sha(LEDGER);
  console.log('ledger.js sha256 (pre-test): ' + beforeHash.slice(0, 16) + '…');

  // ================= RED =================
  console.log('== RED: reset neutralized — the bug must reproduce ==');
  const origSrc = fs.readFileSync(LEDGER, 'utf8');
  try {
    fs.writeFileSync(LEDGER, neutralized(origSrc));
    const r = await successionFixture();
    ok('red: successor is the crowned NPC', r.newVid === r.nid, `newVid=${r.newVid} want=${r.nid}`);
    if (r.newVid === r.nid) {
      ok('red: NPC-era takes PERSIST (the bug)', r.takes === 12345, `takes=${r.takes}`);
      ok('red: NPC-era gives persist', r.gives === 678, `gives=${r.gives}`);
      ok('red: NPC-era takeHist persists', r.takeHist.length === 2, `len=${r.takeHist.length}`);
      ok('red: dated take rate still reads the NPC-era book', r.takeRate > 0, `takeRate7=${r.takeRate}`);
    }
  } finally {
    // hash-verified restore: the tree must be byte-identical afterwards
    execSync('git checkout HEAD -- src/js/ledger.js', { cwd: ROOT });
    const afterHash = sha(LEDGER);
    if (afterHash !== beforeHash) {
      console.log('FATAL: ledger.js restore mismatch — tree left dirty, investigate before continuing');
      process.exit(3);
    }
    console.log('  (ledger.js restored byte-identical)');
  }

  // ================= GREEN =================
  console.log('== GREEN: current HEAD — the successor starts a clean book ==');
  const g = await successionFixture();
  ok('green: successor is the crowned NPC', g.newVid === g.nid, `newVid=${g.newVid} want=${g.nid}`);
  if (g.newVid === g.nid) {
    ok('green: takes reset to 0', g.takes === 0, `takes=${g.takes}`);
    ok('green: gives reset to 0', g.gives === 0, `gives=${g.gives}`);
    ok('green: takeHist reset to []', g.takeHist.length === 0, `len=${g.takeHist.length}`);
    ok('green: giveHist reset to []', g.giveHist.length === 0, `len=${g.giveHist.length}`);
    ok('green: dated take rate reads clean', g.takeRate === 0, `takeRate7=${g.takeRate}`);
    ok('green: dated give rate reads clean', g.giveRate === 0, `giveRate7=${g.giveRate}`);
    // village-level (office) state persists — the reset is personal, not global
    ok('green: leadership vector persists (foodShared)', g.foodShared === 7, `foodShared=${g.foodShared}`);
    ok('green: leadership vector persists (might)', g.might === 3, `might=${g.might}`);
    ok('green: ledger events not wiped', g.evAfter >= g.evBefore, `${g.evBefore} -> ${g.evAfter}`);
    // the office's trust still transfers (discounted): office=1, own=100, no vouchers -> 40
    ok('green: office trust inheritance applied', g.trustNew === 40, `trust=${g.trustNew} want=40`);
    // other villagers' books untouched
    ok('green: other villager takes untouched', g.otherTakes === 777, `takes=${g.otherTakes}`);
    ok('green: other villager takeHist untouched', g.otherHist === 1, `len=${g.otherHist}`);
  }

  // tree-clean check: the proof must leave no MODIFIED tracked files behind
  // (new untracked proof/sweep/evidence files are the deliverable, committed
  // separately — they are not "leftovers").
  const dirty = execSync('git status --short', { cwd: ROOT }).toString().trim()
    .split('\n').filter(l => l && !l.startsWith('??')).join('\n');
  ok('green: no modified tracked files after proof', dirty === '', dirty.split('\n').slice(0, 5).join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => {
  console.error('HARNESS FAIL', e);
  try { execSync('git checkout HEAD -- src/js/ledger.js', { cwd: ROOT }); } catch (e2) {}
  process.exit(2);
});
