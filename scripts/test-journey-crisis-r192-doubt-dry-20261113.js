#!/usr/bin/env node
'use strict';
// Proof: dlg:doubt dry-replacement defect (journey-crisis r192, F3 —
// found on the r192 pilot panel: seed 14432 d26, June Cohen).
// RED: the soft probe "That doesn't quite add up." answers from THREE
// branch lines (one per prod count: first prod, second prod, rattled),
// each a SINGLE fixed string. Whenever the branch line already sits in
// the 48-entry run ledger (spoken by any villager recently), sayLine
// dry-replaces it with "...Sorry, lost my train of thought." — right
// after the probe's consequences fired (mood -1, 'prodded' evidence
// mounted on the first open doubt). Same class as warn-details (r186),
// confront (r187), deflect_q (r192 F1) and refusal (r192 F2): a small
// fixed pool + the no-repeat ledger = a dry line. The handler DOES pass
// a fallback ('They shake their head — not no, not yes...'), but
// sayLine only uses opts.fallback for within-sitting self-blocks;
// run-blocks get the dry line instead.
// GREEN (post-fix): each prod branch draws from a variant pool via a
// ledger-aware picker — a blocked variant is skipped for a fresh one,
// so the probe always speaks honest rattled content, never the dry
// line. With a clean ledger the ORIGINAL branch line still speaks
// (common-path preservation: no RNG, ordered pool, pure-read checks).
// The handler is driven directly (convoTurn with 'dlg:doubt' inside an
// open conversation): the menu only offers the probe on news/small
// threads, but the handler itself is the unit under test.
// Uses the shared harness (scripts/godpath/lib). Exits nonzero on failure.
const assert = require('assert');
const K = require('./godpath/lib');

const ORIG1 = '"...What\'s that supposed to mean?" Their voice goes careful.';
// Variant markers for the first-prod branch (the test accepts any).
const VARIANTS1 = [
  'Say that again',
  'goes still',
  'What are you saying',
];

let pass = 0;
function check(name, condition, extra) {
  assert(condition, name + (extra ? ' :: ' + extra : ''));
  pass++;
  console.log('  ok ' + name);
}

async function main() {
  const Game = await K.load({ seed: 4242 });
  K.newRun(Game);
  const v = Game.state.village;
  const oldId = Game.villagerId;
  const roster = (v.roster || []).filter(id => id !== oldId);
  const speaker = roster.find(id => {
    try { return Game.commLevel(id).level === 'full'; } catch (e) { return false; }
  }) || roster[0];
  v.trust = v.trust || {};
  v.trust[speaker] = 50;
  console.log(`speaker=${Game.displayName(speaker)} day=${Game.state.scholar.day}`);

  // ---- Plant a lie + slip doubt (the probe mounts evidence on doubts[0]) ----
  const vp = Game.vpOf(speaker);
  const lieO = Game.makeLie(vp, 'origin', 'shame');
  lieO.confessed = false;
  vp.lies = { origin: lieO };
  Game.truthSlip(speaker, lieO);
  const doubts = Game.getDoubts(speaker);
  check('one open slip doubt planted', doubts.length === 1, 'got ' + doubts.length);

  // ---- SAYTRACE: record every sayLine fallback with pre-call ledger state ----
  const sayTrace = [];
  const sayOrig = Game.sayLine.bind(Game);
  Game.sayLine = function (vid, line, opts) {
    let key = null, preSelf = false, preRun = false;
    try {
      const c = Game.convoGet(vid);
      const chunks = Game.convoSplitBeats(String(line == null ? '' : line));
      key = (chunks[0] || '').trim();
      preSelf = !!(c && (c.saidLinesConvo || []).indexOf(key) !== -1);
      const rl = (typeof Game.convoRunLedger === 'function') ? Game.convoRunLedger() : [];
      preRun = !!(rl && rl.indexOf(key) !== -1);
    } catch (e) {}
    const r = sayOrig(vid, line, opts);
    try {
      const c = Game.convoGet(vid);
      const fellBack = !!(c && c._sayFellBack);
      if (fellBack || (r == null && key)) {
        sayTrace.push({ key: (key || '').slice(0, 120), preSelf, preRun, fellBack, nullReturn: r == null });
      }
    } catch (e) {}
    return r;
  };

  // ---- Open the sitting ----
  const opened = Game.startConvo(speaker);
  check('conversation opens', !!(opened && !opened.refused && !opened.ended), JSON.stringify(opened && opened.refused));
  const c = Game.convoGet(speaker);

  // ---- Seed the run ledger with the first-prod branch line (the wild
  // condition: another villager was probed recently) ----
  const ledgerKey = Game.convoSplitBeats(ORIG1)[0].trim();
  Game.convoRunLedger().push(ledgerKey);
  console.log('SEEDED ledger with first-prod line: ' + ledgerKey);

  // ---- Drive the probe (first prod) ----
  const prodsBefore = (Game.getDoubts(speaker)[0].evidence || []).filter(e => String(e).indexOf('prodded') === 0).length;
  const prevLen = (c.transcript || []).length;
  Game.convoTurn(speaker, 'dlg:doubt');
  const turn = (c.transcript || []).slice(prevLen);
  const turnText = turn.map(e => String(e.text)).join(' ');
  console.log('TURN new entries:');
  for (const e of turn) console.log(`  ${e.who}: ${String(e.text).slice(0, 160)}`);
  const prodsAfter = (Game.getDoubts(speaker)[0].evidence || []).filter(e => String(e).indexOf('prodded') === 0).length;
  console.log('SAYTRACE fellBack entries: ' + JSON.stringify(sayTrace));
  check('probe speaks no dry line', !/lost my train of thought/.test(turnText), turnText.slice(0, 300));
  check('probe answers honestly (a first-prod variant, not the seeded line)',
    VARIANTS1.some(m => turnText.includes(m)) && !turnText.includes(ORIG1),
    turnText.slice(0, 300));
  check('no sayLine fell back on the probe turn', sayTrace.length === 0, JSON.stringify(sayTrace));
  check('probe mechanics still fire (prodded evidence mounts)', prodsAfter === prodsBefore + 1, `prods ${prodsBefore} -> ${prodsAfter}`);

  // ---- Common path: clean ledger, a FRESH speaker's first sitting, original line speaks ----
  Game.convoRunLedger().length = 0;
  let speaker2 = null, c2 = null;
  for (const id of roster) {
    if (id === speaker) continue;
    try { if (Game.commLevel(id).level !== 'full') continue; } catch (e) { continue; }
    v.trust[id] = 50;
    const vp2 = Game.vpOf(id);
    const lie2 = Game.makeLie(vp2, 'origin', 'shame');
    lie2.confessed = false;
    vp2.lies = { origin: lie2 };
    Game.truthSlip(id, lie2);
    const o = Game.startConvo(id);
    if (!(o && !o.refused && !o.ended)) continue;
    speaker2 = id; c2 = Game.convoGet(id); break;
  }
  check('a fresh speaker with a fresh doubt opens', !!speaker2, 'no roster speaker worked');
  console.log(`second speaker=${Game.displayName(speaker2)}`);
  const prevLen2 = (c2.transcript || []).length;
  Game.convoTurn(speaker2, 'dlg:doubt');
  const turn2 = (c2.transcript || []).slice(prevLen2);
  const turn2Text = turn2.map(e => String(e.text)).join(' ');
  console.log('TURN2 new entries:');
  for (const e of turn2) console.log(`  ${e.who}: ${String(e.text).slice(0, 160)}`);
  check('clean-ledger probe speaks the original line verbatim', turn2Text.includes(ORIG1), turn2Text.slice(0, 300));
  check('clean-ledger probe speaks no dry line', !/lost my train of thought/.test(turn2Text), turn2Text.slice(0, 300));

  console.log(`\nRESULT: ${pass} pass, 0 fail`);
}

main().catch(error => { console.error(error.stack); process.exitCode = 1; });
