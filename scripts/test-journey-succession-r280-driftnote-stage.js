// Proof: journey-succession r280 — drift-note stage directions bypass the
// repeat ledger (r279 DRY-CENSUS finding).
//
// r279 found 1 dry hit: seed 34547 d35 Benoit, drift note "Benoit has an edge
// today — something curdled." was run-blocked (the identical sentence had
// been served in an earlier sitting), so sayLine served the dry line
// "...Sorry, lost my train of thought." instead. A drift note is a
// stage direction about how the person is TODAY — it is not a line the
// person "says" twice, and blocking it costs the one read on their arc.
//
// Fix (conversation.js): a `stageDirection: true` opt on sayLine, exempt
// from the self/run blocks and from the run-ledger feed (parallel to
// `structural`). The opener serves the drift note with it, the held-beats
// push carries it, and the goon continuer passes it through.
//
// Cases (each in its own process; never two harnesses in one process):
//   direct  — poison the run ledger with the villager's own drift-note line,
//             open a conversation: FIXED the note IS served, no dry line;
//             UNFIXED the dry line is served instead (RED).
//   held    — same poisoning, plus a pending invite so the note is held
//             behind the opener-owned reply: FIXED the continuer serves the
//             note, never a substitute; UNFIXED the continuer substitutes
//             a thread beat / unfinished-engage line (RED).
//   control — same staging, NO poisoning: the note serves normally and no
//             dry line appears (guards the fix against breaking the
//             unblocked path; passes on base too).
//
// Usage: node scripts/test-journey-succession-r280-driftnote-stage.js [case]
//   case: direct | held | control | all (default: all, sequential children)
'use strict';
const { execFileSync } = require('child_process');
const CASE = process.argv[2] || 'all';
const CASES = ['direct', 'held', 'control'];
const SEED = { direct: 5702, held: 5703, control: 5704 };

const DRY = [
  '...Sorry, lost my train of thought.',
  '...Hm. What was I saying?',
  '...Never mind. It slipped away.',
  '...Lost it. The thought, I mean.',
  '...Sorry — that was nothing. Forget I said anything.',
  '...I had something. It\'s gone now.',
  '...Where was I? Never mind.',
  '...That came out wrong. Forget it.',
];
function isDry(t) { return DRY.some(d => t.indexOf(d) !== -1); }
function firstChunk(line) {
  try { return String(Game.convoSplitBeats(line)[0]).trim(); } catch (e) { return String(line); }
}
function poisonRunLedger(text) {
  // Same helper as the r267 mourning-dry proof: push the first chunk into
  // the run ledger (cap 48), as if the line had been said in an earlier
  // sitting of this run.
  try {
    const ledger = Game.convoRunLedger();
    const chunk = firstChunk(text);
    if (chunk) { ledger.push(chunk); while (ledger.length > 48) ledger.shift(); }
  } catch (e) {}
}
function transcriptText(c) {
  return ((c && c.transcript) || []).map(t => (t && t.text) || '').join('\n');
}
async function runCase(name) {
  const { loadGame, setupGame } = require('./sim-harness.js');
  const { Game } = await loadGame({ seed: SEED[name], mode: 'succession-r280-driftnote-stage-proof', fullTelemetry: true });
  await setupGame(Game);
  Game.state.scholar.day = 40;
  const roster = ((Game.state.village || {}).roster || []).filter(id => id !== Game.villagerId);
  if (roster.length < 1) { console.log('FAIL no roster villagers'); process.exit(1); }
  const v = Game.state.village || {};
  v.trust = v.trust || {};
  for (const id of roster) v.trust[id] = 90;
  // Pick a non-trader speaker so no trader-intro beat joins the held queue.
  let speaker = roster.find(id => { try { return !Game.isKnowledgeTrader(id); } catch (e) { return true; } }) || roster[0];
  const vp = Game.vpOf(speaker) || {};
  // Stage bitterness >= 2 (two betrayal memories inside 14 days) so the
  // drift note fires on the bitterness channel.
  Game.remember(speaker, 'promise_broken', 'proof-test betrayal');
  Game.remember(speaker, 'theft_victim', 'proof-test theft');
  try { delete vp.convoDrift; } catch (e) {}
  try { delete vp.convoDriftNoted; } catch (e) {}
  // The drift note is keyed to the speaker's TRUE name — but displayName
  // returns a descriptor ("A person, maybe 20s") until the opener
  // introduces them, so a note built from displayName BEFORE startConvo
  // ("A has an edge today...") never matches the note the opener serves
  // ("Gus has an edge today..."). Read the true name off the roster
  // record (same pattern as the r267 proof test) and build the note from it.
  let trueName = null;
  try { const rc = ((Game.state.village || {}).rosterChars || {})[speaker]; if (rc && rc.name) trueName = rc.name; } catch (e) {}
  if (!trueName) { try { const ch = (Game.data.villagers || []).find(x => x.id === speaker); if (ch && ch.name) trueName = ch.name; } catch (e) {} }
  if (!trueName) trueName = String(Game.displayName(speaker) || 'they');
  const first = String(trueName).split(' ')[0];
  const note = first + ' has an edge today — something curdled.';
  const results = [];
  function ok(label, cond, detail) { results.push([label, !!cond, String(detail == null ? '' : detail)]); }
  const poisoned = (name === 'direct' || name === 'held');
  if (poisoned) poisonRunLedger(note);
  if (name === 'held') {
    // A pending invite forces the drift note onto heldBeats (the opener
    // owns the reply, or the invite beat does): the note is held, not
    // served, until the continuer taps it through.
    const bs = Game.betrayalState();
    bs.invites = bs.invites || {};
    bs.invites[speaker] = { pending: { defId: 'air' } };
  }
  const opened = Game.startConvo(speaker);
  const c = Game.convoGet(speaker);
  ok('conversation opened', !!opened && !!c, String(opened && opened.line ? opened.line.slice(0, 60) : opened));
  if (name === 'held') {
    const held = (c.heldBeats || []).map(h => h.text || '');
    ok('held: drift note held behind the opener', held.indexOf(note) !== -1, JSON.stringify(held));
    ok('held: note NOT yet spoken in the opener', transcriptText(c).indexOf(note) === -1, '');
    // Tap the continuer until the note appears (one beat per tap).
    let taps = 0;
    while (transcriptText(c).indexOf(note) === -1 && taps < 5) {
      try { Game.convoTurn(speaker, 'goon'); } catch (e) { break; }
      taps++;
    }
    ok('held: continuer serves the drift note', transcriptText(c).indexOf(note) !== -1, 'taps=' + taps);
    ok('held: no dry line in transcript', !isDry(transcriptText(c)), '');
  } else {
    // The note is served in the opener OR held behind an opener-owned
    // reply (seed-dependent: a question opener owns the reply). Either
    // way it must reach the transcript — directly, or via the continuer.
    let taps = 0;
    while (transcriptText(c).indexOf(note) === -1 && taps < 5) {
      const held = (c.heldBeats || []).map(h => h.text || '');
      if (held.indexOf(note) === -1) break; // not held: served (or dried) already
      try { Game.convoTurn(speaker, 'goon'); } catch (e) { break; }
      taps++;
    }
    ok(name + ': drift note served in transcript', transcriptText(c).indexOf(note) !== -1, 'taps=' + taps);
    ok(name + ': no dry line in transcript', !isDry(transcriptText(c)), '');
  }
  let fails = 0;
  for (const [label, pass, detail] of results) {
    console.log((pass ? 'PASS' : 'FAIL') + ' ' + label + (detail ? ' — ' + detail : ''));
    if (!pass) fails++;
  }
  console.log(name.toUpperCase() + ' ' + (fails === 0 ? 'PASS' : 'FAIL') + ' (' + (results.length - fails) + '/' + results.length + ')');
  process.exit(fails === 0 ? 0 : 1);
}
if (CASE === 'all') {
  let fails = 0;
  for (const name of CASES) {
    try {
      execFileSync(process.execPath, [__filename, name], { stdio: 'inherit' });
    } catch (e) { fails++; }
  }
  console.log('ALL ' + (fails === 0 ? 'PASS' : 'FAIL'));
  process.exit(fails === 0 ? 0 : 1);
}
runCase(CASE).catch(e => { console.error(e); process.exit(1); });
