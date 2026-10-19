#!/usr/bin/env node
// scripts/test-trapvoice-b.js — trapvoice proof (RED -> GREEN).
// backlog #641: checkTraps() narration never reflected the snare_wire rank.
//
// PART 0 (RED, pre-fix tree): driving the real checkTraps() at ranks L0/L1/L2/L3
//   yields the BYTE-IDENTICAL flat catch line at every rank (fiction-invisible).
//   Run with TRAPVOICE_RED=1 on the unmodified tree.
// PART A (GREEN): rank-differentiated lines fire; L0 byte-identical to the flat
//   line; L3 honors "rarely sit empty" without promising future catches;
//   kcal/rot core preserved; anti-stat-readout pins.
// PART B (det-gate, 16/16): L0 vs L1 is the voice-only pair — trapChance is
//   0.4 at BOTH ranks (sim-snaremech-b pinned: L1 is unlock-only), so mechanics
//   are identical and only narration differs. 8 seeds x 2 trap types: state hash
//   (excl. the rank input itself) identical + Math.random draw count identical
//   + lines differ per design. Narration provably draws zero RNG, writes zero state.
// PART C (live scenario): scripted trapline dawns through the real checkTraps()
//   at each rank -> >=1 catch line per rank present (L0..L3); quiet-line variants
//   fire on dead ground.
// PART D (sense): prints the actual lines for human judgment.
//
// Usage: node scripts/test-trapvoice-b.js [--red-only]
//   TRAPVOICE_RED=1 node scripts/test-trapvoice-b.js --red-only   (pre-fix tree)
// Exit 0 only when every applicable part passes.
'use strict';
const crypto = require('crypto');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, quietLog } = require('./sim-harness');

const RED_ONLY = process.argv.includes('--red-only') || process.env.TRAPVOICE_RED === '1';
let fails = [];
function ok(cond, name, extra) {
  console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${extra ? ' — ' + extra : ''}`);
  if (!cond) fails.push(name);
}

// Flat (pre-fix) lines — the RED anchor, copied from the base call sites.
const FLAT_CATCH = (name, dir, animal, kcal) =>
  `🪤 TRAP: Your ${name} ${dir} caught a ${animal}! About ${kcal} kcal on the bone — clean it quickly (knife). It rots fast.`;
const FLAT_QUIET = (name, dir) =>
  `Your ${name} ${dir} sits empty — nothing it can catch is moving on this ground. Try another tile.`;

function kcalOf(Game, speciesId) {
  const a = (Game.data.animals || []).find(x => x.id === speciesId);
  return a ? a.calories : 0;
}

async function freshGame(seed) {
  const { Game } = await loadGame({ seed, mode: 'trapvoice-proof' });
  await setupGame(Game);
  return Game;
}

function setRank(Game, r) {
  Game.state.codex = Game.state.codex || {};
  Game.state.codex.skills = Game.state.codex.skills || {};
  Game.state.codex.skills.snare_wire = { level: r, learnedDay: Game.state.scholar.day, via: 'test' };
}

// Plant a one-trap trapline on tile (2,2): deterministic, game-rich ground.
function plantTrapline(Game, recipeId, speciesId) {
  const t = Game.tileAt(2, 2);
  const day = Game.state.scholar.day;
  t.wildlife = {};
  t.wildlife[speciesId] = 4;
  t.traps = [{ recipeId, setDay: day, uses: 10, quietTold: false }];
  t.trapShy = {};
  return t;
}

function resetTrapline(Game, t, speciesId) {
  t.wildlife = {};
  t.wildlife[speciesId] = 4;
  for (const tr of (t.traps || [])) { tr.uses = 10; tr.quietTold = false; }
  t.trapShy = {};
}

// Wrap Game.say (capture) + global Math.random (draw count). game.js makes no
// captured-RNG aliases (verified: no `= Math.random` in src/js/game.js), so a
// post-eval wrapper sees every draw the narration could make.
function instrument(Game) {
  const cap = { lines: [], draws: 0 };
  const oSay = Game.say;
  Game.say = function (msg) { try { cap.lines.push(String(msg)); } catch (e) {} return oSay.apply(this, arguments); };
  const oRand = Math.random;
  Math.random = function () { cap.draws++; return oRand(); };
  cap.restore = () => { Game.say = oSay; Math.random = oRand; };
  return cap;
}

function stableStringify(v) {
  const seen = new Set();
  function s(x) {
    if (x === null || x === undefined) return 'null';
    if (typeof x === 'function') return '"[fn]"';
    if (typeof x !== 'object') return JSON.stringify(x);
    if (seen.has(x)) return '"[circ]"';
    seen.add(x);
    if (Array.isArray(x)) return '[' + x.map(s).join(',') + ']';
    const ks = Object.keys(x).sort();
    return '{' + ks.map(k => JSON.stringify(k) + ':' + s(x[k])).join(',') + '}';
  }
  return s(v);
}

// State hash EXCLUDING the rank input itself (codex.skills.snare_wire) — the
// only intended pre-state difference between the L0/L1 pair members.
function stateHash(Game) {
  const st = JSON.parse(stableStringify(Game.state));
  try { if (st.codex && st.codex.skills) delete st.codex.skills.snare_wire; } catch (e) {}
  return crypto.createHash('sha256').update(stableStringify(st)).digest('hex');
}

function trapLines(cap) {
  return {
    catch: cap.lines.filter(l => l.includes('🪤 TRAP:')),
    quiet: cap.lines.filter(l => l.includes('sits empty')),
  };
}

// ---------------- PART 0: RED (pre-fix tree) ----------------
async function part0() {
  console.log('== PART 0: RED — flat line at every rank (pre-fix tree) ==');
  for (const rank of [0, 1, 2, 3]) {
    const Game = await freshGame(41101);
    setRank(Game, rank);
    const t = plantTrapline(Game, 'snare', 'cottontail_rabbit');
    const kcal = kcalOf(Game, 'cottontail_rabbit');
    const cap = instrument(Game);
    await quietLog(async () => { for (let i = 0; i < 40; i++) { resetTrapline(Game, t, 'cottontail_rabbit'); Game.checkTraps(); } });
    cap.restore();
    const { catch: cl } = trapLines(cap);
    ok(cl.length > 0, `RED rank L${rank}: catch lines fired`, `${cl.length} catches/40 dawns`);
    const flat = cl.every(l => /^🪤 TRAP: Your Snare .*? caught a .*?! About \d+ kcal on the bone — clean it quickly \(knife\)\. It rots fast\.$/.test(l));
    ok(flat, `RED rank L${rank}: every catch line matches the flat template (no rank voice)`);
    const voiceMarkers = ['old way worked', 'anchored solid', 'rarely sit empty', 'no sign, no promise', 'read the sign first', 'read the trail like a book'];
    ok(!cl.some(l => voiceMarkers.some(m => l.includes(m))), `RED rank L${rank}: no rank-voice markers present`);
  }
}

// Drive N dawns at a rank; return captured trap lines.
async function driveRank(seed, rank, recipeId, speciesId, dawns) {
  const Game = await freshGame(seed);
  setRank(Game, rank);
  const t = plantTrapline(Game, recipeId, speciesId);
  const cap = instrument(Game);
  await quietLog(async () => { for (let i = 0; i < dawns; i++) { resetTrapline(Game, t, speciesId); Game.checkTraps(); } });
  cap.restore();
  return { Game, lines: trapLines(cap), cap };
}

// ---------------- PART A: GREEN ----------------
async function partA() {
  console.log('== PART A: GREEN — rank-differentiated lines ==');
  const kcal = 800; // cottontail_rabbit (pinned at runtime too)
  // L0: byte-identical to flat.
  {
    const { Game, lines } = await driveRank(41101, 0, 'snare', 'cottontail_rabbit', 40);
    ok(kcalOf(Game, 'cottontail_rabbit') === kcal, 'GREEN L0: kcal pin 800 (cottontail_rabbit)');
    ok(lines.catch.length > 0, 'GREEN L0: catch lines fired', `${lines.catch.length}/40`);
    ok(lines.catch.every(l => /^🪤 TRAP: Your Snare .*? caught a .*?! About 800 kcal on the bone — clean it quickly \(knife\)\. It rots fast\.$/.test(l)),
      'GREEN L0: every line byte-matches the flat template');
  }
  // L1: craft note, fits any trap.
  {
    const { lines } = await driveRank(41101, 1, 'snare', 'cottontail_rabbit', 40);
    ok(lines.catch.length > 0, 'GREEN L1: catch lines fired');
    ok(lines.catch.every(l => l.includes('set it, waited, and the old way worked.')), 'GREEN L1: craft note present on every line');
    ok(lines.catch.every(l => l.includes('About 800 kcal on the bone — clean it quickly (knife). It rots fast.')), 'GREEN L1: kcal/rot core preserved');
    const { lines: bx } = await driveRank(41102, 1, 'box_trap', 'raccoon', 40);
    ok(bx.catch.length > 0 && bx.catch.every(l => l.includes('set it, waited, and the old way worked.')), 'GREEN L1 box_trap: same generic note (recipe-honest)');
  }
  // L2: wire-snare vs general voicing.
  {
    const { lines } = await driveRank(41101, 2, 'snare', 'cottontail_rabbit', 40);
    ok(lines.catch.length > 0, 'GREEN L2 snare: catch lines fired');
    ok(lines.catch.every(l => l.includes('head-high on the trail, anchored solid, wire near-invisible.')), 'GREEN L2 snare: wire-craft note');
    const { lines: bx } = await driveRank(41102, 2, 'box_trap', 'raccoon', 40);
    ok(bx.catch.length > 0 && bx.catch.every(l => l.includes('read the sign first, set it where the trail says.')), 'GREEN L2 box_trap: general trapper note (no wire lie)');
  }
  // L3: honors "rarely sit empty" at the demonstrated moment, promises nothing future.
  {
    const { lines } = await driveRank(41101, 3, 'snare', 'cottontail_rabbit', 60);
    ok(lines.catch.length > 0, 'GREEN L3 snare: catch lines fired');
    ok(lines.catch.every(l => l.includes('read the trail like a book, set the snare like punctuation. They rarely sit empty.')), 'GREEN L3 snare: codex-promise line');
    ok(!lines.catch.some(l => /always|every time|never empty|guaranteed/i.test(l)), 'GREEN L3: no absolute-future promise');
    const { lines: bx } = await driveRank(41102, 3, 'box_trap', 'raccoon', 60);
    ok(bx.catch.length > 0 && bx.catch.every(l => l.includes('read the ground like a book; the trap was punctuation. They rarely sit empty.')), 'GREEN L3 box_trap: general variant');
  }
  // Anti-stat-readout pins across all ranks.
  {
    const seen = new Set();
    for (const r of [0, 1, 2, 3]) {
      const { lines } = await driveRank(41103 + r, r, 'snare', 'cottontail_rabbit', 25);
      lines.catch.forEach(l => seen.add(l));
    }
    const arr = [...seen];
    ok(arr.length >= 4, 'GREEN: >=4 distinct rank lines observed', `${arr.length} distinct`);
    ok(!arr.some(l => /\+0\.\d|rank|bonus|trap_success/i.test(l)), 'GREEN: no stat-readout tokens (+0.x/rank/bonus/trap_success)');
    ok(arr.every(l => l.startsWith('🪤 TRAP:')), 'GREEN: 🪤 TRAP: prefix preserved on every line');
  }
  // Quiet line: flat at L0/L1, quieter variant at L2+.
  {
    async function quietAt(rank) {
      const Game = await freshGame(41104);
      setRank(Game, rank);
      const t = plantTrapline(Game, 'snare', 'cottontail_rabbit');
      t.wildlife = {}; // dead ground -> quiet branch
      const cap = instrument(Game);
      await quietLog(async () => { Game.checkTraps(); Game.checkTraps(); });
      cap.restore();
      return trapLines(cap).quiet;
    }
    const q0 = await quietAt(0), q1 = await quietAt(1), q2 = await quietAt(2), q3 = await quietAt(3);
    ok(q0.length === 1 && /^Your Snare .*? sits empty — nothing it can catch is moving on this ground\. Try another tile\.$/.test(q0[0]), 'GREEN quiet L0: flat line, said once');
    ok(q1.length === 1 && q1[0] === q0[0].replace(/Snare/, 'Snare'), 'GREEN quiet L1: flat line kept (nudge retained)');
    ok(q2.length === 1 && /sits empty\. You read the ground on the way in — no sign, no promise\.$/.test(q2[0]), 'GREEN quiet L2: quieter variant');
    ok(q3.length === 1 && q3[0] === q2[0], 'GREEN quiet L3: same quiet variant as L2');
    ok(!q2[0].includes('Try another tile'), 'GREEN quiet L2+: tutorial nudge gone (knowledge-gating)');
  }
}

// ---------------- PART B: det-gate 16/16 ----------------
async function partB() {
  console.log('== PART B: det-gate 16/16 — L0 vs L1 (identical mechanics, voice differs) ==');
  const SEEDS = [41101, 41102, 41103, 41104, 41105, 41106, 41107, 41108];
  const TRAPS = [['snare', 'cottontail_rabbit'], ['box_trap', 'raccoon']];
  let pass = 0, total = 0;
  for (const seed of SEEDS) for (const [recipeId, speciesId] of TRAPS) {
    total++;
    const runs = [];
    for (const rank of [0, 1]) {
      const Game = await freshGame(seed);
      setRank(Game, rank);
      const t = plantTrapline(Game, recipeId, speciesId);
      const cap = instrument(Game);
      await quietLog(async () => { for (let i = 0; i < 10; i++) { resetTrapline(Game, t, speciesId); Game.checkTraps(); } });
      cap.restore();
      runs.push({ hash: stateHash(Game), draws: cap.draws, lines: trapLines(cap) });
    }
    const [a, b] = runs;
    const hOk = a.hash === b.hash;
    const dOk = a.draws === b.draws;
    const vOk = b.lines.catch.length > 0 && b.lines.catch.every(l => l.includes('set it, waited, and the old way worked.'))
      && a.lines.catch.every(l => !l.includes('old way worked'));
    if (hOk && dOk && vOk) pass++;
    else console.log(`  PAIR-FAIL seed=${seed} trap=${recipeId}: hash=${hOk} draws=${dOk}(${a.draws}/${b.draws}) voice=${vOk}`);
  }
  ok(pass === total, `det-gate ${pass}/${total} byte-identical trajectories (narration-only)`, 'hash+draws equal, voice differs per design');
}

// ---------------- PART C: live scenario — every rank fires ----------------
async function partC() {
  console.log('== PART C: live scenario — >=1 catch line per rank L0..L3 ==');
  for (const rank of [0, 1, 2, 3]) {
    const { lines } = await driveRank(41101, rank, 'snare', 'cottontail_rabbit', 60);
    ok(lines.catch.length > 0, `rank L${rank}: catch line fired in live checkTraps`, `${lines.catch.length}/60 dawns`);
  }
}

// ---------------- PART D: sense print ----------------
async function partD() {
  console.log('== PART D: sense read — the actual lines ==');
  for (const rank of [0, 1, 2, 3]) {
    const { lines } = await driveRank(41105, rank, 'snare', 'cottontail_rabbit', 30);
    const sample = lines.catch[0] || '(no catch)';
    console.log(`  L${rank} catch: ${sample}`);
  }
  const Game = await freshGame(41105);
  setRank(Game, 2);
  const t = plantTrapline(Game, 'snare', 'cottontail_rabbit');
  t.wildlife = {};
  const cap = instrument(Game);
  await quietLog(async () => Game.checkTraps());
  cap.restore();
  console.log(`  L2 quiet: ${trapLines(cap).quiet[0] || '(none)'}`);
}

async function main() {
  if (RED_ONLY) { await part0(); }
  else { await partA(); await partB(); await partC(); await partD(); }
  if (fails.length) { console.log(`\nRESULT: FAIL (${fails.length}): ${fails.join('; ')}`); process.exit(1); }
  console.log('\nRESULT: ALL GREEN');
}
main().catch(e => { console.error('TEST CRASHED:', e); process.exit(2); });
