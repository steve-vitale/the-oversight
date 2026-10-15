#!/usr/bin/env node
// Proof test: the "I just said — did you miss it?" fallback only fires for
// within-sitting repeats (journey-social r16 2026-10-15).
// sayLine's no-repeat ledger (c.saidLines) persists across sittings by
// design, but the self-repeat fallback's contract is "the NPC already said
// the line in THIS conversation". Pre-fix, a line said in an EARLIER
// sitting (e.g. 'Nothing new.' about another case days ago) self-blocked
// and produced a FALSE accusation — caught in r16 grief transcripts where
// betrayal:askheard's reveal re-blocked across sittings:
//   YOU: "What have you heard?"
//   NPC: "I just said — did you miss it?"   <- the NPC never said it here
// Post-fix, cross-sitting blocks get the honest dry line; only genuine
// within-sitting repeats keep the accusation fallback.
//
// RED (pre-fix): cross-sitting repeat -> "I just said — did you miss it?"
// GREEN (post-fix): cross-sitting repeat -> dry line; same-sitting repeat
//   still -> the self-repeat pool.
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame } = require('./sim-harness');

const SEED = parseInt(process.env.SEED || '45', 10);
let pass = 0, fail = 0;
const ok = (cond, label) => {
  if (cond) { pass++; console.log('  PASS: ' + label); }
  else { fail++; console.log('  FAIL: ' + label); }
};
const ACCUSE = 'did you miss it';
const DRY_HINTS = ['lost my train', 'Never mind', 'forget it', 'Where was I', 'clean out of my head', 'slipped away', 'Wasn\'t important'];

function sayWithFallback(Game, vid, text) {
  // mirror betrayal's finish(): sayLine with the self-repeat fallback
  return Game.sayLine(vid, text, { fallback: () => Game.convoSelfRepeatLine(vid) });
}

async function main() {
  const lg = await loadGame({ seed: SEED, fullTelemetry: true });
  const Game = lg.Game;
  await setupGame(Game);
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  const vid = roster[0];
  const LINE = '"Nothing new."';

  // sitting 1: the NPC says the line once
  Game.startConvo(vid);
  const r1 = sayWithFallback(Game, vid, LINE);
  console.log(`  sitting 1 emission: ${String(r1).slice(0, 60)}`);
  ok(r1 && r1.indexOf('Nothing new') !== -1, 'sitting 1: line emitted normally');
  Game.endConvo(vid, 'done');

  // sitting 2 (a later sitting): the same line is requested again
  Game.startConvo(vid);
  const r2 = sayWithFallback(Game, vid, LINE);
  console.log(`  sitting 2 (cross-sitting repeat): ${String(r2).slice(0, 80)}`);
  ok(!r2 || r2.indexOf(ACCUSE) === -1, 'cross-sitting repeat does NOT accuse ("did you miss it?")');
  ok(!!r2 && DRY_HINTS.some(h => r2.indexOf(h) !== -1), 'cross-sitting repeat gets the honest dry line');
  Game.endConvo(vid, 'done');

  // same-sitting repeat: the accusation fallback is still honest here
  Game.startConvo(vid);
  const s1 = sayWithFallback(Game, vid, '"A fresh line, never said."');
  const s2 = sayWithFallback(Game, vid, '"A fresh line, never said."');
  console.log(`  same-sitting repeat: ${String(s2).slice(0, 80)}`);
  ok(!!s2 && (s2.indexOf(ACCUSE) !== -1 || s2.indexOf('just told you') !== -1 || s2.indexOf('covered this') !== -1),
    'within-sitting repeat keeps the self-repeat pool (accusation is true here)');
  Game.endConvo(vid, 'done');

  console.log(`\nRESULT: ${pass} pass, ${fail} fail`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('FATAL: ' + (e && e.stack || e)); process.exit(2); });
