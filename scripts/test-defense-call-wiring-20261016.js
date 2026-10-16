#!/usr/bin/env node
// test-defense-call-wiring-20261016.js — proof for the covenant defense-call
// wiring bug found in the journey-scale R3 run (2026-10-16).
//
// THE BUG: the engine stages a covenant defense call as `link.pendingDefense`
// (src/js/hierarchy.js:2970 — `link.pendingDefense = {day: day}`, read by
// answerDefenseCall at :3126, rendered by app.js:17015). Four bot policies
// (scalecourt, leadcourt, fourthlink, killroad) and three old journey test
// scripts checked `link.pendingDefenseCall` — a field the engine NEVER sets.
// So in every prior journey sim, an engine-staged defense call was invisible
// to the bots: never answered, never refused, just sat. A human player is
// unaffected (the UI uses the engine's name), but all sim measurements of
// covenant defense mechanics were reading 0 answers for a harness reason,
// not a game reason.
//
// BEFORE (RED, pre-fix files): the verbatim old predicate evaluates false on
// an engine-staged call — the call is never answered.
// AFTER (GREEN, fixed files): the corrected predicate reaches
// answerDefenseCall through the real engine path — villagers sent 3 days,
// trust +8, the copy spoken aloud.
//
// Run RED:  git checkout HEAD -- scripts/policies/*.js scripts/test-journey-*.js
//           node scripts/test-defense-call-wiring-20261016.js   (expect FAIL)
// Run GREEN: restore fixed files (patch), re-run                    (expect PASS)
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(cond, label) {
  if (cond) { pass++; console.log('  PASS: ' + label); }
  else { fail++; console.log('  FAIL: ' + label); }
}

async function main() {
  const { Game } = await loadGame({ seed: 8501, mode: 'test-defense-call-wiring' });
  await setupGame(Game);
  const G = Game;
  let said = [];
  const _say = G.say;
  G.say = function (s) { said.push(String(s)); return _say.apply(this, arguments); };

  // ---- stage an engine-identical covenant defense call ----
  const links = G.hierarchyState();
  const link = {
    id: 'link_proofcov', kind: 'covenant', a: 'haven', b: 'ov_far',
    primary: null, subordinate: null, trust: 50, history: [],
    status: 'active', day: 0, warOath: true, poolLive: true,
  };
  links.push(link);
  // exactly what hierarchy.js:2970 produces when the treeline burns:
  link.pendingDefense = { day: (G.state.scholar || {}).day || 0 };
  console.log('staged: link.pendingDefense =', JSON.stringify(link.pendingDefense));

  // ---- BEFORE: the verbatim OLD policy predicate ----
  const oldSeesIt = !!(link.pendingDefenseCall && G.answerDefenseCall);
  console.log('OLD predicate (link.pendingDefenseCall):', oldSeesIt);
  ok(!oldSeesIt, 'OLD predicate is blind to the engine-staged call (the bug)');

  // ---- AFTER: the corrected predicate + the real engine answer ----
  const newSeesIt = !!(link.pendingDefense && G.answerDefenseCall);
  ok(newSeesIt, 'NEW predicate (link.pendingDefense) sees the engine-staged call');

  const trust0 = link.trust;
  const awayList = () => { try { return (G.mshipState() || {}).awayParties || []; } catch (e) { return []; } };
  const away0 = awayList().length;
  const day0 = (G.state.scholar || {}).day || 0;
  said = [];
  const res = G.answerDefenseCall(link.id, 'send');
  ok(res === 'sent', 'answerDefenseCall("send") resolves through the engine (got ' + res + ')');
  ok(link.pendingDefense == null, 'pendingDefense cleared after answering');
  ok(link.trust > trust0, 'trust rose on a kept war-pact (' + trust0 + ' -> ' + link.trust + ')');
  const saidAll = said.join('\n');
  ok(/Haven answers/.test(saidAll), 'the answer is said aloud ("Haven answers…")');
  console.log('  copy: ' + saidAll.split('\n').filter(l => /Haven answers/.test(l))[0]);
  const away1 = awayList().length;
  ok(away1 === away0 + 1, 'an away party actually forms (away parties ' + away0 + ' -> ' + away1 + ')');
  const party = awayList()[away0];
  ok(party && (party.vids || []).length === 2 && party.kind === 'defense' && party.untilDay === day0 + 3,
     'away party is 2 villagers, defense, 3 days (' + JSON.stringify(party && { n: (party.vids || []).length, kind: party.kind, untilDay: party.untilDay }) + ')');

  // ---- source regression guard: no policy/test still uses the stale name ----
  const fs = require('fs'), path = require('path');
  const files = ['scripts/policies/scalecourt.js', 'scripts/policies/leadcourt.js',
    'scripts/policies/fourthlink.js', 'scripts/policies/killroad.js',
    'scripts/test-journey-endgame-20261011.js', 'scripts/test-journey-scale-20261011.js',
    'scripts/test-journey-scale-20261012.js'];
  let stale = [];
  for (const f of files) {
    try {
      const t = fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
      if (t.indexOf('pendingDefenseCall') >= 0) stale.push(f);
    } catch (e) { stale.push(f + ' (unreadable)'); }
  }
  ok(stale.length === 0, 'no stale pendingDefenseCall left in policies/tests' + (stale.length ? ': ' + stale.join(', ') : ''));

  console.log('\n' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('PROOF ERROR:', e); process.exit(2); });
