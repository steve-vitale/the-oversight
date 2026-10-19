#!/usr/bin/env node
// PROOF: topic-thread exhaustion fix (journey sociallife 2026-10-11).
//
// BUG (before): the mourning 'lately' thread's follow-up pools hold exactly
// one line per level (cope/next/part). "Tell me more" past exhaustion:
//   (1) topic2Beat's index clamp re-served the last level's line verbatim,
//   (2) t2pick's `|| pool[0]` fallback defeated the no-repeat ledger, and
//   (3) the dlg:more handler returned the composed line even when sayLine
//       blocked it — so the PLAYER SAW "My part? I remember them. Someone
//       has to do it properly." x3 while the transcript ledger stayed clean.
// The no-repeat invariant held in the ledger but not on the screen.
//
// FIX (convoTopics.js topic2Beat): return null when the opener + one beat
// per level are consumed (topic2HasMore's contract) — the caller says the
// honest "that's all of it" and the menu retires "tell me more".
// FIX (convo-dialogue.js dlg:more / dlg:react): respect sayLine's null — a
// blocked repeat is treated as dry, never shown.
//
// Seeded BEFORE eval. Full production script list (minus DOM-only + drama).
// Usage: node scripts/test-soc-thread-exhaustion-20261011.js [SEED=...]

const K = require('./godpath/lib');
let Game;

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log(`PASS: ${name}`); }
  else { fail++; console.log(`FAIL: ${name}` + (extra ? ` — ${extra}` : '')); }
}

async function main() {
  Game = await K.load({ seed: Number(process.env.SEED || 20261011) });
  K.newRun(Game);

  // Force a live mourning event (grief > 0 -> t2LatelyEvent returns mourning).
  Game.state.village.grief = 1;

  const roster = Game.state.village.roster.filter(id => id !== Game.villagerId);
  let vid = null, opened = null;
  for (const id of roster) {
    if (Game.commLevel(id).level !== 'full') continue;
    if (Game.t2LatelyEvent(id)?.kind !== 'mourning') continue;
    let current = Game.startConvo(id);
    // Follow the current offered route out of the grief opening.
    if (current.choices.some(choice => choice.id === 'dlg:subject')) {
      current = Game.convoTurn(id, 'dlg:subject');
    }
    const ids = current.choices.map(choice => choice.id);
    const pick = ids.includes('alive:event:mourning') ? 'alive:event:mourning'
      : ids.includes('ask:lately') ? 'ask:lately' : null;
    if (pick) {
      const next = Game.convoTurn(id, pick);
      if (next?.line && Game.convoGet(id).thread === 'lately' && Game.t2LatelyEvent(id)?.kind === 'mourning') {
        vid = id; opened = next; break;
      }
    }
    Game.endConvo(id, 'left');
  }
  ok('a mourning lately-thread opened', !!vid, vid || 'none qualified');
  if (!vid) { console.log('SETUP FAILED'); process.exit(2); }
  console.log(`thread opened: ${String(opened.line).slice(0, 90)}`);

  // Hammer "tell me more" 8 times — past the 3 follow-up beats.
  const seen = [];
  let retired = false;
  let dryAdmission = false;
  let r = opened;
  for (let t = 0; t < 8; t++) {
    const ids = (r.choices || []).map(c => c.id);
    if (!K.findConvoChoice(Game,vid,'dlg:more')) {
      retired = true;
      console.log(`turn ${t}: dlg:more retired from menu (ids: ${ids.slice(0, 6).join(',')})`);
      break;
    }
    r = Game.convoTurn(vid, 'dlg:more');
    if (r.line) {
      seen.push(String(r.line));
      console.log(`more#${t + 1}: ${String(r.line).slice(0, 80)}`);
      if (/pretty much all of it|more to tell|whole of it/i.test(r.line)) dryAdmission = true;
    }
    if (r.ended) break;
  }
  ok('three substantive follow-ups plus one dry admission delivered', seen.length === 4 && dryAdmission,
    'seen=' + seen.length + ' dry=' + dryAdmission);
  ok('tell-me-more retires after the dry admission', retired && !K.findConvoChoice(Game,vid,'dlg:more'));
  ok('exhausted generated thread stays dry on repeated engine queries', Array.from({ length: 8 }, () => Game.topic2Beat(vid)).every(line => line === null));
  Game.endConvo(vid, 'left');

  // THE PROOF: no verbatim repeat on the player-visible surface.
  const visible = [String(opened.line), ...seen];
  const dupes = visible.filter((x, i) => visible.indexOf(x) !== i);
  ok('zero verbatim repeats across offered follow-ups (player-visible)',
    dupes.length === 0, dupes.slice(0, 1).join(' | ').slice(0, 120));
  ok('the thread dries honestly (dry admission spoken or menu retired)',
    dryAdmission && retired,
    `seen=${seen.length} dryAdmission=${dryAdmission}`);
  // And the transcript ledger agrees (it always did — the bug was on screen).
  const t = (Game.convoGet(vid).transcript || []).filter(e => e.who === 'them').map(e => String(e.text));
  ok('every returned follow-up was actually recorded as speech', seen.every(line => t.includes(line)));
  const tdupes = t.filter((x, i) => t.indexOf(x) !== i);
  ok('zero verbatim repeats in the transcript ledger', tdupes.length === 0,
    tdupes.slice(0, 1).join(' | ').slice(0, 120));

  console.log(`\n=== RESULT: ${pass} pass, ${fail} fail ===`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
