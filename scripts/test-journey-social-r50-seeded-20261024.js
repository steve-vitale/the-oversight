#!/usr/bin/env node
// test-journey-social-r50-seeded-20261024.js — SEEDED-CRACK premise proof
// (journey-social 2026-10-24 r50).
//
// r50 seeds one ambush-outcome grievance on the first depth>=2 NPC-NPC
// pair via Game.recordGrievance ('ambushed', 60) and watches crack +
// serve effects. This test proves the premise on current master, before
// the 4-seed run spends 140 days on it:
//   A. recordGrievance('ambushed', 60) drops the pair's bond warmth
//      (cruelty decay: bondAdd -min(12, severity/2)).
//   B. t2pickOther(speaker) then serves the pair with why='vgrievance'
//      (betrayal branch, second only to unresolved conflicts).
//   C. The r50 driver runs end to end on a 12d proof seed: smoke
//      self-test PASSes and the SEED line carries funnel + windows +
//      seeded fields (instrument proof, not a game proof).
// Usage: node scripts/test-journey-social-r50-seeded-20261024.js
//   (runs from the worktree root; cleans its proof output dir after).
'use strict';
const { loadGame, setupGame } = require('./sim-harness');
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

let pass = 0, fail = 0;
function ok(cond, name, extra) {
  if (cond) { pass++; console.log('  ok - ' + name); }
  else { fail++; console.log('  FAIL - ' + name + (extra ? ' (' + extra + ')' : '')); }
}

function setDepth(Game, a, b, depth) {
  for (let i = 0; i < depth * 5; i++) {
    Game.state.scholar.day += 1;
    Game.bondAdd(a, b, 6, 'proof');
  }
  return (Game.bondGet(a, b) || {}).depth || 0;
}

(async () => {
  const { Game } = await loadGame({ seed: 4645, mode: 'proof' });
  await setupGame(Game);
  const v = Game.state.village;
  const me = Game.villagerId;
  const npcs = Game.npcIds().filter(id => id !== me);
  ok(npcs.length >= 8, 'roster has NPCs', 'npcs=' + npcs.length);
  const living = (id) => { try { return !((Game.getPerson(id) || {}).dead); } catch (e) { return true; } };
  const inConflict = (id) => (v.conflicts || []).some(c => !c.resolved && (c.a === id || c.b === id));
  // A clean pair: living, no conflict, no pre-existing bond.
  let A = null, B = null;
  outer: for (const a of npcs) {
    if (!living(a) || inConflict(a)) continue;
    for (const b of npcs) {
      if (b === a || !living(b) || inConflict(b)) continue;
      if ((Game.bondGet(a, b) || {}).depth) continue;
      A = a; B = b; break outer;
    }
  }
  ok(!!A && !!B, 'found a clean pair', 'A=' + A + ' B=' + B);
  if (!A) { console.log(`RESULT: ${pass} passed, ${fail} failed`); process.exit(1); }

  const d0 = setDepth(Game, A, B, 2);
  ok(d0 >= 2, 'pair raised to depth>=2', 'depth=' + d0);
  // Snapshot NUMBERS, not the live bond object: bondGet returns the
  // stored object itself, so a pre/post object comparison always ties.
  const preV = (Game.bondGet(A, B) || {}).v || 0;
  const preD = (Game.bondGet(A, B) || {}).depth || 0;
  ok(typeof Game.recordGrievance === 'function', 'Game.recordGrievance exists');
  Game.recordGrievance(A, B, 'ambushed', 60);
  const post = Game.bondGet(A, B) || {};
  ok((post.v || 0) < preV, 'A: warmth drops on seeded grievance', 'v ' + preV + ' -> ' + post.v);
  console.log('  note - depth ' + preD + ' -> ' + (post.depth || 0) + ' on the warmth drop (sediment quirk: a downward crossing of a positive threshold banks +1 depth; tracked, not asserted)');
  const grs = (((v.betrayal || {}).grievances) || []).filter(g => g && g.by === A && g.against === B);
  ok(grs.length >= 1, 'A: betrayal grievance stored', 'entries=' + grs.length);
  const pick = Game.t2pickOther(A);
  ok(!!pick && pick.why === 'vgrievance' && String(pick.id) === String(B),
    'B: t2pickOther serves vgrievance naming the pair',
    'pick=' + JSON.stringify(pick));

  // C. Driver instrument proof: 12d proof seed through the real driver.
  // OUTROOT is pointed at a scratch sibling dir (never the real r50
  // date dir), so proof artifacts can never touch real evidence.
  const repo = path.resolve(__dirname, '..');
  const proofOut = path.join(repo, 'evidence', '2026-10-24-proof');
  try { fs.rmSync(proofOut, { recursive: true, force: true }); } catch (e) {}
  let out = '';
  try {
    out = execFileSync('node', [path.join(repo, 'scripts', 'journey-social-r50-20261024.js')], {
      cwd: repo, timeout: 600000, maxBuffer: 64 * 1024 * 1024,
      env: Object.assign({}, process.env, {
        SEEDS: '4605', DAYCAP: '12',
        OUTROOT: proofOut,
        REPO: repo,
      }),
    }).toString();
  } catch (e) {
    out = (e.stdout || '').toString() + (e.stderr || '').toString();
    console.log('  driver stderr/stdout tail: ' + out.slice(-2000));
  }
  ok(/SMOKE SELF-TEST: PASS/.test(out), 'C: driver smoke self-test PASSes');
  ok(/funnel=/.test(out) && /windows=/.test(out) && /seeded=/.test(out),
    'C: SEED line carries funnel + windows + seeded fields');
  try { fs.rmSync(proofOut, { recursive: true, force: true }); } catch (e) {}
  console.log(`RESULT: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
