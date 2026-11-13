#!/usr/bin/env node
'use strict';
// Proof: agency closer dry-replacement defect (journey-succession r193).
// RED (panel seed 34242, Carlos d48): agency:ask_field with nothing left
// to teach speaks a closer; the FIRST closer ('"There's more, but that's
// for another fire."') was already in the 48-entry run ledger (spoken by
// another villager recently), so sayLine dry-replaced it — but sayLine
// RETURNS the dry line, a truthy value the closer loop mistook for
// success, so the transcript got "...Sorry, lost my train of thought."
// while the handler reported the closer as spoken (view/transcript
// disagreement — the exact sense-caught failure the closer comment claims
// to prevent). Same class as warn-details (r186), confront (r187),
// deflect_q (r192 F1) and dlg:doubt (r192 F3): a single fixed line
// dry-replaced by the run ledger whenever it already sits there.
// GREEN (post-fix): the closer loop pre-checks each closer with
// convoWouldBlock and speaks the first one the ledger would NOT refuse;
// all blocked falls through to the honest noop below (player echo pulled
// back), never the dry line. Ordered pool, original first, no RNG — the
// clean-ledger common path still speaks the original closer verbatim.
// Uses the shared harness (scripts/godpath/lib). Exits nonzero on failure.
const assert = require('assert');
const K = require('./godpath/lib');

const CLOSER0 = '"There\'s more, but that\'s for another fire."';
const CLOSER1 = '"That\'s everything I brought back. The rest is just walking."';
const CLOSER2 = '"I\'ve told you everything I know about that."';
const DRY = 'lost my train of thought';

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

  // ---- Force the wild turn-time state: the villager has NOTHING left to
  // teach (no fought monsters, no teachable plants, no places), so
  // agencyTurn reaches the closer loop. (In the wild the menu offered the
  // ask because lessons existed at menu time; by turn time they were
  // spent — the defect is in the closer loop, not the menu.) ----
  const st = Game.agencyState();
  st.know[speaker] = { plants: 0, monsters: 0, places: [], fought: [] };
  st.teachable[speaker] = [];
  if (v.explorerNews) delete v.explorerNews[speaker];

  // ---- Open the sitting ----
  const opened = Game.startConvo(speaker);
  check('conversation opens', !!(opened && !opened.refused && !opened.ended), JSON.stringify(opened && opened.refused));
  const c = Game.convoGet(speaker);

  // ---- Seed the run ledger with the FIRST closer (the wild condition:
  // another villager spoke it within the 48-entry window) ----
  const ledgerKey = Game.convoSplitBeats(CLOSER0)[0].trim();
  Game.convoRunLedger().push(ledgerKey);
  console.log('SEEDED ledger with closer[0]: ' + ledgerKey);

  // ---- Drive the ask ----
  const prevLen = (c.transcript || []).length;
  const ret = Game.convoTurn(speaker, 'agency:ask_field');
  const turn = (c.transcript || []).slice(prevLen);
  console.log('TURN new entries:');
  for (const e of turn) console.log(`  ${e.who}: ${String(e.text).slice(0, 160)}`);
  const turnText = turn.map(e => String(e.text)).join(' ');
  console.log('SAYTRACE fellBack entries: ' + JSON.stringify(sayTrace));
  console.log('RETURN line: ' + JSON.stringify(ret && ret.line));
  check('agency ask speaks no dry line', !new RegExp(DRY).test(turnText), turnText.slice(0, 300));
  check('agency ask speaks an honest closer (the first unblocked one)',
    turnText.includes(CLOSER1) && !turnText.includes(CLOSER0),
    turnText.slice(0, 300));
  check('no sayLine fell back on the agency turn', sayTrace.length === 0, JSON.stringify(sayTrace));
  check('returned line agrees with the transcript (no view/transcript split)',
    ret && ret.line === CLOSER1, JSON.stringify(ret && ret.line));

  // ---- All three closers blocked: the honest noop, never the dry line ----
  sayTrace.length = 0;
  Game.convoRunLedger().push(Game.convoSplitBeats(CLOSER1)[0].trim());
  Game.convoRunLedger().push(Game.convoSplitBeats(CLOSER2)[0].trim());
  console.log('SEEDED ledger with closer[1] + closer[2] as well (all three blocked)');
  const prevLen3 = (c.transcript || []).length;
  const ret3 = Game.convoTurn(speaker, 'agency:ask_field');
  const turn3 = (c.transcript || []).slice(prevLen3);
  const turn3Text = turn3.map(e => String(e.text)).join(' ');
  console.log('TURN3 new entries: ' + JSON.stringify(turn3.map(e => e.who + ': ' + String(e.text).slice(0, 80))));
  console.log('SAYTRACE fellBack entries: ' + JSON.stringify(sayTrace));
  check('all-blocked ask speaks no dry line', !new RegExp(DRY).test(turn3Text), turn3Text.slice(0, 300));
  check('all-blocked ask falls to the honest noop (no line, no naked echo)',
    ret3 && ret3.noop === true, JSON.stringify(ret3 && { noop: ret3.noop, line: ret3.line }));
  check('no sayLine fell back on the all-blocked turn', sayTrace.length === 0, JSON.stringify(sayTrace));

  // ---- Common path: clean ledger, a FRESH speaker's first sitting, the
  // original closer speaks verbatim. ----
  Game.convoRunLedger().length = 0;
  let speaker2 = null, c2 = null;
  for (const id of roster) {
    if (id === speaker) continue;
    try { if (Game.commLevel(id).level !== 'full') continue; } catch (e) { continue; }
    v.trust[id] = 50;
    const st2 = Game.agencyState();
    st2.know[id] = { plants: 0, monsters: 0, places: [], fought: [] };
    st2.teachable[id] = [];
    if (v.explorerNews) delete v.explorerNews[id];
    const o = Game.startConvo(id);
    if (!(o && !o.refused && !o.ended)) continue;
    speaker2 = id; c2 = Game.convoGet(id); break;
  }
  check('a fresh speaker opens on a clean ledger', !!speaker2, 'no roster speaker opened');
  console.log(`second speaker=${Game.displayName(speaker2)}`);
  const prevLen2 = (c2.transcript || []).length;
  const ret2 = Game.convoTurn(speaker2, 'agency:ask_field');
  const turn2 = (c2.transcript || []).slice(prevLen2);
  const turn2Text = turn2.map(e => String(e.text)).join(' ');
  console.log('TURN2 new entries:');
  for (const e of turn2) console.log(`  ${e.who}: ${String(e.text).slice(0, 160)}`);
  check('clean-ledger ask speaks the original closer verbatim', turn2Text.includes(CLOSER0), turn2Text.slice(0, 300));
  check('clean-ledger ask speaks no dry line', !new RegExp(DRY).test(turn2Text), turn2Text.slice(0, 300));
  check('clean-ledger return agrees with the transcript',
    ret2 && ret2.line === CLOSER0, JSON.stringify(ret2 && ret2.line));

  console.log(`\nRESULT: ${pass} pass, 0 fail`);
}

main().catch(error => { console.error(error.stack); process.exitCode = 1; });
