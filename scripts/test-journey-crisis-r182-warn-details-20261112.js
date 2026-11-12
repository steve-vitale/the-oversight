#!/usr/bin/env node
'use strict';
// Proof: warn-details dry line (journey-succession r183, Naran d94 seed 34224).
// The sitting opens on the stale opener "About that warning — I keep
// turning it over." (every fresh warn opener variant already ledgered),
// the player picks dlg:details ("Tell me."), and the NPC answers
// "...Sorry, lost my train of thought." instead of a warning.
// Cause: convoWantWarning returns one of 3 fixed strings; after one
// delivery the run-ledger no-repeat block refuses it and sayLine dry-
// replaces it. (The opener is stale for the same reason — 3 fixed strings
// and no pool — but this probe pins the DETAILS step; the fix pools the
// warning itself.)
// RED: sitting 2's dlg:details is the dry deflection, and a second
// convoWantWarning call is wouldBlock-true.
// GREEN (post-fix): sitting 2's dlg:details still speaks a REAL warning —
// a different pool variant, never the dry deflection, never the
// "It's... complicated" dry pool — and the second convoWantWarning call
// is wouldBlock-false.
// Sitting 2 re-hangs warn_you at stage 1 when the weighted want pick
// drifts (the pick is a lottery across wants; the r183 transcript is the
// evidence this state occurs in the wild). The re-hang mirrors Naran's
// state exactly: opener spoken, menu live, warning already ledgered.
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
const DRY_POOL = /it's\.\.\. complicated/i;
const WARNING = /come back|come through|treeline|don't go out|eyes up|moving out|watch yourself|be careful|stay inside|stay close|stay where|danger|don't try|woods don't feel empty|wasn't a one-off|get back inside/i;

function driveDetails(Game, vid) {
  // One sitting: open, steer to dlg:details, return the NPC reply.
  const opened = Game.startConvo(vid);
  if (!opened || opened.refused || opened.ended) return null;
  for (let t = 0; t < 8; t++) {
    let choices = [];
    try { choices = Game.convoChoices(vid) || []; } catch (e) { return null; }
    if (!choices.length) return null;
    const details = choices.find(ch => ch.id === 'dlg:details');
    if (details) {
      Game.convoTurn(vid, 'dlg:details');
      const c = Game.convoGet(vid);
      const npc = (c.transcript || []).filter(e => e.who !== 'you').map(e => String(e.text));
      return npc.length ? npc[npc.length - 1] : null;
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
  // Recent attacks pin the warning to the attack variant (deterministic
  // content for sitting 1) and make warn_you the heavyweight want.
  v.recentAttacks = 1;
  console.log(`speaker=${Game.displayName(speaker)} day=${Game.state.scholar.day}`);

  // Capture the warn_you def from the natural want pick, so sitting 2 can
  // re-hang the same want even if the weighted pick drifts.
  let warnDef = null;
  try {
    const w = Game.convoSelectWant(speaker);
    if (w && w.id === 'warn_you') warnDef = w.def;
  } catch (e) { console.warn('[probe] convoSelectWant threw: ' + e.message); }
  check('warn_you is the natural want with recent attacks', !!warnDef);

  // ---- Sitting 1: the warning lands (real sayLine ledgering) ----
  const l1 = driveDetails(Game, speaker);
  console.log('SITTING 1 details reply: ' + (l1 || '(none)').slice(0, 200));
  check('sitting 1 dlg:details reaches a reply', !!l1);
  check('sitting 1 reply is a real warning', WARNING.test(l1 || ''), (l1 || '').slice(0, 160));
  check('sitting 1 reply is not a dry deflection', !DRY.test(l1 || ''), (l1 || '').slice(0, 160));
  try { Game.endConvo(speaker, 'left'); } catch (e) { console.warn('[probe] endConvo 1 threw: ' + e.message); }

  // ---- Unit arm: a second warning right now must not be blocked ----
  const w2 = Game.convoWantWarning(speaker);
  console.log('SECOND convoWantWarning: ' + (w2 || '(none)').slice(0, 160));
  check('second warning is a real warning', WARNING.test(w2 || ''), (w2 || '').slice(0, 160));
  check('second warning is NOT run-ledger-blocked', !Game.convoWouldBlock(speaker, w2), 'wouldBlock true for: ' + (w2 || '').slice(0, 120));
  check('second warning is not a verbatim repeat', w2 !== l1, (w2 || '').slice(0, 120));

  // ---- Sitting 2: same villager, next day, same want ----
  Game.state.scholar.day = (Game.state.scholar.day || 1) + 1;
  const opened2 = Game.startConvo(speaker);
  let l2 = null;
  if (opened2 && !opened2.refused && !opened2.ended) {
    const c = Game.convoGet(speaker);
    console.log('SITTING 2 natural want: ' + ((c.want && c.want.id) || '(none)') + ' stage ' + ((c.want && c.want.stage) || 0) + ' opener: ' + (opened2.line || '').slice(0, 120));
    if (c.want && c.want.id !== 'warn_you' && warnDef) {
      // Re-hang warn_you at stage 1: opener spoken, menu live — Naran's state.
      c.want = { id: 'warn_you', def: warnDef, stage: 1 };
      console.log('[probe] sitting 2 want re-hung to warn_you stage 1');
    }
    for (let t = 0; t < 8 && !l2; t++) {
      let choices = [];
      try { choices = Game.convoChoices(speaker) || []; } catch (e) { break; }
      if (!choices.length) break;
      const details = choices.find(ch => ch.id === 'dlg:details');
      if (details) {
        Game.convoTurn(speaker, 'dlg:details');
        const cc = Game.convoGet(speaker);
        const npc = (cc.transcript || []).filter(e => e.who !== 'you').map(e => String(e.text));
        l2 = npc.length ? npc[npc.length - 1] : null;
      } else {
        const next = choices.find(ch => !/^(leave|bye|goodbye)/.test(ch.id));
        if (!next) break;
        Game.convoTurn(speaker, next.id);
      }
    }
  }
  try { Game.endConvo(speaker, 'left'); } catch (e) { console.warn('[probe] endConvo 2 threw: ' + e.message); }
  console.log('SITTING 2 details reply: ' + (l2 || '(none)').slice(0, 200));
  check('sitting 2 dlg:details reaches a reply', !!l2);
  check('sitting 2 reply is NOT the dry deflection', !DRY.test(l2 || ''), (l2 || '').slice(0, 160));
  check('sitting 2 reply is NOT the dry pool', !DRY_POOL.test(l2 || ''), (l2 || '').slice(0, 160));
  check('sitting 2 reply is still a real warning', WARNING.test(l2 || ''), (l2 || '').slice(0, 160));
  check('sitting 2 warning is not a verbatim repeat of sitting 1', l2 !== l1, (l2 || '').slice(0, 120));

  console.log(`\nRESULT: ${pass} pass, 0 fail`);
}

main().catch(error => { console.error(error.stack); process.exitCode = 1; });
