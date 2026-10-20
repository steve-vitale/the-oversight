#!/usr/bin/env node
// test-lure-instrument-20261020.js — journey landing r28 blank fix proof.
//
// The r27 instrument's lure (spoken/gestured/silent) check is exercised
// against the REAL mechanism found by re-investigating the r27 "false
// positive" (r27 run note, seed 97 day 10). r27's own diagnosis — "allText
// includes player choice labels" — proved WRONG: the NPC genuinely voices
// the invitation as a second opener beat INSIDE startConvo (INVITATION
// HONESTY, conversation.js: an unvoiced pending invite is spoken as its own
// beat before the menu is offered). The r27 harness logged only r0.line
// (the opener), so:
//
//   RED (r27 instrument): the scan fires SPOKEN from a transcript entry
//     the r27 sense-read log never shows. Scan and sense-read disagree —
//     the analyst read the file, saw no lure, and wrongly concluded "the
//     NPC never voiced a lure" (the r27 misdiagnosis). The scan's verdict
//     is unverifiable from the evidence the harness saved.
//
// The r28 fix (journey-landing-r28-20261020.js, instrument-only, no game
// behavior at stake): log EVERY fresh 'them' transcript entry startConvo
// pushes (opener beats complete — the invite beat is now in the file), and
// scan this sitting's THEM text only (identity-diff on the transcript
// array; the engine resets it per sitting, the early-refuse path excepted).
//
//   GREEN (fixed instrument): the sense-read log contains the invite beat
//     AND the scan fires SPOKEN — consistent and verifiable.
//   CONTROL: when the invite was already voiced on an earlier day
//     (inv.spoken=true), no invite beat is spoken this sitting and the
//     fixed scan honestly reports SILENT for today's menu.
//
// Instrument-only: no src/js changes. Seeds 7, 42, 97 (MEASUREMENT.md §3).
// Writes nothing to the repo.
const { loadGame, setupGame } = require('./sim-harness');

const SEEDS = process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [7, 42, 97];
const LURE_RE = /walk with me|haul something|get air|come see what i found|trap line|extra hands|another pair of eyes/i;
const GESTURE_RE = /\(.*(mime|mimes|gesture|gestures|points? at|toward the|unmistakable).*\)/is;

// --- verbatim r27 instrument logic (RED side) ---
function r27Classify(transcriptThemTexts, r27LoggedLines) {
  const allText = transcriptThemTexts.join('\n') + '\n' + r27LoggedLines.join('\n');
  const spoken = LURE_RE.test(allText) && !GESTURE_RE.test(allText);
  const gesture = GESTURE_RE.test(allText);
  return spoken ? 'SPOKEN' : gesture ? 'GESTURED' : 'SILENT';
}
// --- r28 fixed instrument logic (GREEN side), mirroring the harness fix ---
function fixedClassify(freshThemTexts, sittingLoggedLines) {
  const sittingText = freshThemTexts.join('\n') + '\n' + sittingLoggedLines.join('\n');
  const spoken = LURE_RE.test(sittingText) && !GESTURE_RE.test(sittingText);
  const gesture = GESTURE_RE.test(sittingText);
  return spoken ? 'SPOKEN' : gesture ? 'GESTURED' : 'SILENT';
}
// The r28 harness's fresh-entry capture, verbatim in behavior.
function freshThemOf(Game, vid, preStartT) {
  const now = Game.convoGet(vid).transcript || [];
  const base = (now === preStartT) ? preStartT.length : 0;
  return now.slice(base).filter(e => e && e.who === 'them').map(e => String(e.text));
}

function plantInvite(Game, vid, defId, spoken) {
  const bs = Game.betrayalState();
  bs.invites = bs.invites || {};
  bs.invites[vid] = bs.invites[vid] || { count: 0, accepted: 0, outcomes: [], pending: null };
  bs.invites[vid].pending = { defId: defId || 'show', day: (Game.state.scholar && Game.state.scholar.day) || 1, spoken: !!spoken };
}
function menuOffered(r0) {
  return (r0.choices || []).some(c => c && /^betrayal:(accept|decline)$/.test(c.id));
}
function pickTwo(Game) {
  const roster = (Game.state.village.roster || []).filter(id => !((Game.getPerson(id) || {}).dead));
  if (roster.length < 2) throw new Error('need 2 living villagers');
  return [roster[0], roster[1]];
}

let failures = 0;
function check(name, cond, detail) {
  if (cond) console.log(`  ok: ${name}`);
  else { failures++; console.log(`  FAIL: ${name}${detail ? ' — ' + detail : ''}`); }
}

(async () => {
  for (const seed of SEEDS) {
    console.log(`\n=== seed ${seed} ===`);
    const lg = await loadGame({ seed });
    const Game = lg.Game;
    await setupGame(Game);
    const [vidA, vidB] = pickTwo(Game);
    const nm = (v) => { try { return Game.displayName(v) || v; } catch (e) { return v; } };

    // ---------- CASE A: invite voiced as second opener beat (RED / GREEN)
    plantInvite(Game, vidA, 'show', false);
    const preA = Game.convoGet(vidA).transcript || [];
    const r0A = Game.startConvo(vidA);
    const r27LoggedA = [String(r0A.line || '')];       // r27: sayThem(r0.line) only
    const fixedLoggedA = freshThemOf(Game, vidA, preA); // r28: every fresh 'them' beat
    check('A: betrayal menu offered', menuOffered(r0A),
      JSON.stringify((r0A.choices || []).map(c => c.id)));
    const r27A = r27Classify(
      (Game.convoGet(vidA).transcript || []).filter(e => e && e.who === 'them').map(e => String(e.text)),
      r27LoggedA);
    const lureInR27Log = r27LoggedA.some(t => LURE_RE.test(t));
    console.log(`  A r27: scan=${r27A}, r27 log shows lure=${lureInR27Log}`);
    // RED: the r27 scan fires SPOKEN while the r27 sense-read log contains
    // no lure — the verdict is unverifiable from the saved evidence. This
    // disagreement is what misled the r27 analysis into "the NPC never
    // voiced a lure" (and the wrong "choice labels" diagnosis).
    check('A RED: r27 scan fires SPOKEN from an entry the r27 log never shows',
      r27A === 'SPOKEN' && !lureInR27Log,
      `scan=${r27A} lureInR27Log=${lureInR27Log}`);
    const fixedA = fixedClassify(fixedLoggedA, fixedLoggedA.slice());
    const lureInFixedLog = fixedLoggedA.some(t => LURE_RE.test(t));
    console.log(`  A fixed: log shows lure=${lureInFixedLog}, scan=${fixedA}`);
    // GREEN: the fixed log contains the invite beat and the scan agrees.
    check('A GREEN: fixed log shows the voiced lure and fixed scan fires SPOKEN',
      lureInFixedLog && fixedA === 'SPOKEN',
      `lureInFixedLog=${lureInFixedLog} scan=${fixedA}`);
    console.log(`  (A was ${nm(vidA)}; r27 hid the beat, fixed shows: "${(fixedLoggedA.find(t => LURE_RE.test(t)) || '').slice(0, 80)}")`);
    try { Game.endConvo(vidA, 'done'); } catch (e) {}

    // ---------- CASE B (control): invite already voiced earlier (spoken=true)
    // No invite beat this sitting; the menu is still offered. The fixed
    // scan must honestly report SILENT for today's menu.
    plantInvite(Game, vidB, 'show', true);
    const preB = Game.convoGet(vidB).transcript || [];
    const r0B = Game.startConvo(vidB);
    check('B: betrayal menu offered', menuOffered(r0B),
      JSON.stringify((r0B.choices || []).map(c => c.id)));
    const fixedLoggedB = freshThemOf(Game, vidB, preB);
    const fixedB = fixedClassify(fixedLoggedB, fixedLoggedB.slice());
    const lureInFixedLogB = fixedLoggedB.some(t => LURE_RE.test(t));
    console.log(`  B fixed: log shows lure=${lureInFixedLogB}, scan=${fixedB}`);
    check('B GREEN (control): no lure voiced this sitting, fixed scan reports SILENT',
      !lureInFixedLogB && fixedB === 'SILENT',
      `lureInFixedLogB=${lureInFixedLogB} scan=${fixedB}`);
    try { Game.endConvo(vidB, 'done'); } catch (e) {}
  }
  console.log(failures ? `\n${failures} FAILURES` : '\nALL GREEN');
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error('PROOF ERROR: ' + (e && e.stack || e)); process.exit(2); });
