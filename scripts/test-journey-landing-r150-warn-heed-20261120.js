#!/usr/bin/env node
'use strict';
// Proof: warn_you heed never names the danger (journey-landing r150,
// Q2 people check — 4/4 warn_you sittings, 0 named a concrete danger).
// The warning content lives ONLY behind dlg:details -> convoWantWarning,
// and the natural first reply is dlg:heed ("I'll be careful.") — which
// answers with a content-free generic line and advances the stage, so
// the details option (stage<2 only) vanishes and the danger is never
// spoken. A villager who wants to warn you, when you promise to be
// careful, should SAY WHAT to be careful about.
// Fix: the FIRST heed of a warn_you sitting speaks the warning itself
// (convoWantWarning), once per sitting; later heeds fall back to the
// generic pool, and a details-first sitting does not double-deliver.
// RED: sitting 1's first dlg:heed is a generic line, not a warning.
// GREEN (post-fix): first heed speaks a real warning; second heed and
// details-first heed speak generic lines; the want still engages.
// Uses the shared harness (scripts/godpath/lib). Exits nonzero on failure.
const assert = require('assert');
const K = require('./godpath/lib');

let pass = 0;
function check(name, condition, extra) {
  assert(condition, name + (extra ? ' :: ' + extra : ''));
  pass++;
  console.log('  ok ' + name);
}

const DRY = /lost my train of thought|never mind — go on|actually, forget it|where was i\? gone|went clean out of my head|not coming back|lost it\. the thought|slipped away from me|wasn't important|i just said|we've covered this one/i;
// Warning-content markers: present in convoWantWarning pool lines, absent
// from the 3 generic dlg:heed lines ("Good. I mean it — watch yourself
// out there." / "Promise me that. Please." / "Thank you. I needed to
// hear you say it.").
const WARNING_CONTENT = /treeline|last night|come back|come through|moving out|don't go out alone|woods don't feel empty|stay where people can see you|it knows|get back inside/i;
const GENERIC_HEED = new Set([
  '"Good. I mean it — watch yourself out there."',
  '"Promise me that. Please."',
  '"Thank you. I needed to hear you say it."',
]);

function npcLast(Game, vid) {
  const c = Game.convoGet(vid);
  const npc = (c.transcript || []).filter(e => e.who !== 'you').map(e => String(e.text));
  return npc.length ? npc[npc.length - 1] : null;
}

function takeChoice(Game, vid, id) {
  for (let t = 0; t < 8; t++) {
    let choices = [];
    try { choices = Game.convoChoices(vid) || []; } catch (e) { return null; }
    if (!choices.length) return null;
    if (choices.find(ch => ch.id === id)) {
      Game.convoTurn(vid, id);
      return npcLast(Game, vid);
    }
    const next = choices.find(ch => !/^(leave|bye|goodbye)/.test(ch.id));
    if (!next) return null;
    Game.convoTurn(vid, next.id);
  }
  return null;
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
  v.recentAttacks = 1;
  console.log(`speaker=${Game.displayName(speaker)} day=${Game.state.scholar.day}`);

  let warnDef = null;
  try {
    const w = Game.convoSelectWant(speaker);
    if (w && w.id === 'warn_you') warnDef = w.def;
  } catch (e) { console.warn('[probe] convoSelectWant threw: ' + e.message); }
  check('warn_you is the natural want with recent attacks', !!warnDef);

  // ---- Sitting 1: heed FIRST (the natural reply) ----
  const opened = Game.startConvo(speaker);
  check('sitting 1 opens', !!(opened && !opened.refused && !opened.ended));
  const l1 = takeChoice(Game, speaker, 'dlg:heed');
  console.log('SITTING 1 first-heed reply: ' + (l1 || '(none)').slice(0, 200));
  check('sitting 1 first heed reaches a reply', !!l1);
  check('sitting 1 first heed names the danger', WARNING_CONTENT.test(l1 || ''), (l1 || '').slice(0, 160));
  check('sitting 1 first heed is not a generic line', !GENERIC_HEED.has(l1 || ''), (l1 || '').slice(0, 160));
  check('sitting 1 first heed is not a dry deflection', !DRY.test(l1 || ''), (l1 || '').slice(0, 160));
  const c1 = Game.convoGet(speaker);
  check('sitting 1 heed still engages the want', c1 && c1.want && (c1.want.stage || 0) >= 2, 'stage=' + ((c1.want && c1.want.stage) || 0));

  // Second heed in the same sitting: warning delivered once only.
  const l1b = takeChoice(Game, speaker, 'dlg:heed');
  console.log('SITTING 1 second-heed reply: ' + (l1b || '(none)').slice(0, 200));
  check('sitting 1 second heed reaches a reply', !!l1b);
  check('sitting 1 second heed is a generic line (no double warning)', GENERIC_HEED.has(l1b || ''), (l1b || '').slice(0, 160));
  try { Game.endConvo(speaker, 'left'); } catch (e) { console.warn('[probe] endConvo 1 threw: ' + e.message); }

  // ---- Sitting 2 (next day): details FIRST, then heed ----
  Game.state.scholar.day = (Game.state.scholar.day || 1) + 1;
  const opened2 = Game.startConvo(speaker);
  check('sitting 2 opens', !!(opened2 && !opened2.refused && !opened2.ended));
  const c2 = Game.convoGet(speaker);
  if (c2.want && c2.want.id !== 'warn_you' && warnDef) {
    c2.want = { id: 'warn_you', def: warnDef, stage: 1 };
    console.log('[probe] sitting 2 want re-hung to warn_you stage 1');
  }
  const l2 = takeChoice(Game, speaker, 'dlg:details');
  console.log('SITTING 2 details reply: ' + (l2 || '(none)').slice(0, 200));
  check('sitting 2 details still speaks the warning', WARNING_CONTENT.test(l2 || ''), (l2 || '').slice(0, 160));
  const l2b = takeChoice(Game, speaker, 'dlg:heed');
  console.log('SITTING 2 heed-after-details reply: ' + (l2b || '(none)').slice(0, 200));
  check('sitting 2 heed after details reaches a reply', !!l2b);
  check('sitting 2 heed after details is generic (no double warning)', GENERIC_HEED.has(l2b || ''), (l2b || '').slice(0, 160));
  try { Game.endConvo(speaker, 'left'); } catch (e) { console.warn('[probe] endConvo 2 threw: ' + e.message); }

  console.log(`\nRESULT: ${pass} pass, 0 fail`);
}

main().catch(error => { console.error(error.stack); process.exitCode = 1; });
