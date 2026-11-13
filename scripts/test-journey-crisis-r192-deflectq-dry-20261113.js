#!/usr/bin/env node
'use strict';
// Proof: deflect_q dry-replacement defect (journey-crisis r192).
// RED (succession r187, seed 34234, Desmond d48): the deflect_q pick —
// "(change the subject)" — dry-replaced with "...Sorry, lost my train
// of thought." because the handler speaks ONE fixed line
// ('"Okay." Something shutters, just slightly.') and sayLine's 48-entry
// run ledger blocks it whenever any villager spoke it recently.
// Same class as the warn-details defect (r186) and the confront defect
// (r187), new surface (deflection answer, not warning/confrontation):
// a single fixed answer line whose text already sits in the no-repeat
// run ledger gets dry-replaced by sayLine, even though the dodge's
// consequences (trust -1, mood -1, cruel temper, escalation) still fire.
// GREEN (post-fix): the pick draws from a shuttering-variant pool via
// a ledger-aware picker — a blocked variant is skipped for a fresh one
// from the same pool, so the dodge always speaks honest content, never
// the dry line. With a clean ledger the ORIGINAL line still speaks
// (common-path preservation: no RNG, ordered pool, pure-read checks).
// Uses the shared harness (scripts/godpath/lib). Exits nonzero on failure.
const assert = require('assert');
const K = require('./godpath/lib');

const ORIG = '"Okay." Something shutters, just slightly.';
// Variant markers (distinct shuttering lines in the same register — the
// test accepts any of these as the honest post-fix answer).
const VARIANTS = [
  'closes like a door',
  'the question dies where it stood',
  'warmth drains out of their eyes',
  'A small silence, and then they move on',
  'fold their arms and the subject is gone',
  'steps back from you',
  'the door between you shuts a little',
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

  // ---- Open the sitting; the pendingQ must be live (deflect_q is only
  // offered while a question is pending) ----
  const opened = Game.startConvo(speaker);
  check('conversation opens', !!(opened && !opened.refused && !opened.ended), JSON.stringify(opened && opened.refused));
  const c = Game.convoGet(speaker);
  const choices = Game.convoChoices(speaker) || [];
  const deflect = choices.find(ch => ch.id === 'deflect_q');
  check('deflect_q offered while a question is pending', !!deflect, 'choices: ' + choices.map(x => x.id).join(','));

  // ---- Seed the run ledger with the exact deflect line (the wild
  // condition: another villager spoke it within the 48-entry window) ----
  const ledgerKey = Game.convoSplitBeats(ORIG)[0].trim();
  Game.convoRunLedger().push(ledgerKey);
  console.log('SEEDED ledger with deflect line: ' + ledgerKey);

  // ---- Drive the dodge ----
  const trustBefore = (Game.state.village.trust || {})[speaker];
  const prevLen = (c.transcript || []).length;
  Game.convoTurn(speaker, 'deflect_q');
  const turn = (c.transcript || []).slice(prevLen);
  console.log('TURN new entries:');
  for (const e of turn) console.log(`  ${e.who}: ${String(e.text).slice(0, 160)}`);
  const turnText = turn.map(e => String(e.text)).join(' ');
  const trustAfter = (Game.state.village.trust || {})[speaker];
  console.log('SAYTRACE fellBack entries: ' + JSON.stringify(sayTrace));
  check('deflect_q speaks no dry line', !/lost my train of thought/.test(turnText), turnText.slice(0, 300));
  check('deflect_q answers honestly (a shutter variant, not the seeded line)',
    VARIANTS.some(m => turnText.includes(m)) && !turnText.includes(ORIG),
    turnText.slice(0, 300));
  check('no sayLine fell back on the deflect turn', sayTrace.length === 0, JSON.stringify(sayTrace));
  check('dodge consequences still fire (trust -1)', trustAfter === trustBefore - 1, `trust ${trustBefore} -> ${trustAfter}`);

  // ---- Common path: clean ledger, a FRESH speaker's first sitting, original line speaks.
  // First sittings sometimes open on a secret thread instead of a question,
  // so scan roster speakers until one offers deflect_q. ----
  Game.convoRunLedger().length = 0;
  let speaker2 = null, c2 = null, choices2 = null;
  for (const id of roster) {
    if (id === speaker) continue;
    try { if (Game.commLevel(id).level !== 'full') continue; } catch (e) { continue; }
    v.trust[id] = 50;
    const o = Game.startConvo(id);
    if (!(o && !o.refused && !o.ended)) continue;
    const chs = Game.convoChoices(id) || [];
    if (chs.some(ch => ch.id === 'deflect_q')) { speaker2 = id; c2 = Game.convoGet(id); choices2 = chs; break; }
  }
  check('a fresh speaker offers deflect_q on a clean ledger', !!speaker2, 'no roster speaker offered it');
  console.log(`second speaker=${Game.displayName(speaker2)}`);
  check('second conversation opens', !!c2);
  const prevLen2 = (c2.transcript || []).length;
  Game.convoTurn(speaker2, 'deflect_q');
  const turn2 = (c2.transcript || []).slice(prevLen2);
  const turn2Text = turn2.map(e => String(e.text)).join(' ');
  console.log('TURN2 new entries:');
  for (const e of turn2) console.log(`  ${e.who}: ${String(e.text).slice(0, 160)}`);
  check('clean-ledger deflect speaks the original line verbatim', turn2Text.includes(ORIG), turn2Text.slice(0, 300));
  check('clean-ledger deflect speaks no dry line', !/lost my train of thought/.test(turn2Text), turn2Text.slice(0, 300));

  console.log(`\nRESULT: ${pass} pass, 0 fail`);
}

main().catch(error => { console.error(error.stack); process.exitCode = 1; });
