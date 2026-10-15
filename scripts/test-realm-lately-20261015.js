#!/usr/bin/env node
// test-realm-lately-20261015.js — PROOF for journey-scale r1 (2026-10-15).
//
// THE BLANK: after the national beat's one-shot echo
// (scaleDiscovery._sdNationalBeatEcho), the village's conversations never
// carried the realm as a topic — t2LatelyEvent had no realm kind, so the
// biggest political transformation of the run was conversation-silent.
// (41 wants, zero realm-related; lately kinds: outbreak/weirdness/naming/
// mourning/threat/defense/betrayal/table — no realm.)
//
// THE FIX (src/js/convoTopics.js): a `realm` lately kind, live while
// nationalLive and day-nationalDay in [0,10] (the mantle's 10-day tail),
// shape-aware (lead/belong/covenant/trade/conquest), the primary's name
// knowledge-gated. Priority: below the table (the System's summons outranks
// the village's own politics), the sick, and the dead — above defense and
// the debate.
//
// COMPANION FIX (src/js/scaleDiscovery.js): the echo's once-only gate was
// consumed BEFORE the say() — a throw in _sdName/pick/say (swallowed by
// scaleDiscoveryDaily's try/catch) permanently silenced the echo. Gate now
// marks only after the line goes out, so a failed attempt retries tomorrow.
//
// RED: t2LatelyEvent returns null in the post-national window (pre-fix).
// GREEN: returns {kind:'realm'} with shape-aware lines; priority respected.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log(`  PASS ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

function forceNational(Game, shape, dayAgo) {
  // Realistic clock: national happens ~day 70+, not day 1.
  Game.state.scholar.day = 80;
  Game.state.nationalLive = true;
  Game.state.nationalDay = 80 - dayAgo;
  Game.state.nationalShape = shape;
  Game.state.nationalPrimary = null;
}

function firstVillager(Game) {
  const roster = (Game.state.village.roster || []).filter(id => {
    try { return !Game.getPerson(id).dead; } catch (e) { return false; }
  });
  return roster[0];
}

(async () => {
  // --- realm lately kind ---
  {
    const { Game } = await loadGame({ seed: 777001, mode: 'realm-lately', fullTelemetry: false });
    await setupGame(Game);
    const vid = firstVillager(Game);
    forceNational(Game, 'lead', 3); // 3 days after the court sat

    const ev = Game.t2LatelyEvent(vid);
    check('lately event is realm in the post-national window', ev && ev.kind === 'realm', 'got ' + JSON.stringify(ev));
    check('realm event carries the shape', ev && ev.shape === 'lead', 'got ' + JSON.stringify(ev));

    const lines = Game.t2gen_lately(vid);
    check('realm generates talk lines', Array.isArray(lines) && lines.length >= 2, 'got ' + lines.length);
    check('realm lines name the realm/court', lines.some(l => /realm|court|tribute|fires/i.test(l)), lines[0]);

    // window: 11 days out is old news
    forceNational(Game, 'lead', 11);
    const evOld = Game.t2LatelyEvent(vid);
    check('realm expires after 10 days', !evOld || evOld.kind !== 'realm', 'got ' + JSON.stringify(evOld && evOld.kind));

    // not national: no realm
    Game.state.nationalLive = false;
    const evNo = Game.t2LatelyEvent(vid);
    check('no realm when not national', !evNo || evNo.kind !== 'realm', 'got ' + JSON.stringify(evNo && evNo.kind));

    // belong shape: primary name gated, oath language
    Game.state.nationalLive = true;
    forceNational(Game, 'belong', 2);
    const evB = Game.t2LatelyEvent(vid);
    check('belong shape detected', evB && evB.kind === 'realm' && evB.shape === 'belong', JSON.stringify(evB));
    const linesB = Game.t2gen_lately(vid);
    check('belong lines swear the oath', linesB.some(l => /swore|oath/i.test(l)), linesB[0]);

    // priority: table outranks realm; realm outranks defense
    forceNational(Game, 'lead', 2);
    try {
      // plant a defended memory (7-day window) — realm should win
      const mem = Game.t2mem(vid);
      mem.push({ t: 'defended', note: 'test defense', day: (Game.state.scholar || {}).day });
      const evP = Game.t2LatelyEvent(vid);
      check('realm outranks defense memory', evP && evP.kind === 'realm', 'got ' + JSON.stringify(evP && evP.kind));
    } catch (e) { check('realm outranks defense memory', false, 'mem plant: ' + e.message); }
  }

  // --- echo gate-after-say ---
  {
    const { Game } = await loadGame({ seed: 777002, mode: 'realm-echo', fullTelemetry: false });
    await setupGame(Game);
    const said = [];
    const origSay = Game.say.bind(Game);
    Game.say = (m) => { said.push(String((m && (m.text || m)) || m)); return origSay(m); };
    Game.state.nationalLive = true;
    Game.state.nationalDay = ((Game.state.scholar || {}).day || 0) - 3;
    Game.state.nationalShape = 'covenant';
    Game.state.scaleDiscover = {};

    Game._sdNationalBeatEcho();
    const echoLine = said.find(s => /not quite believing it/.test(s));
    check('echo still fires normally', !!echoLine, 'said ' + said.length + ' lines');
    check('echo is covenant-shaped', !!echoLine && /no head|pool's open|circle|no thrones/i.test(echoLine), echoLine);
    check('gate marked after fire', !!(Game.state.scaleDiscover || {}).natBeatEcho);

    // a failing say must NOT consume the gate (the 1717-class silent miss)
    Game.state.scaleDiscover = {};
    said.length = 0;
    Game.say = () => { throw new Error('boom'); };
    try { Game._sdNationalBeatEcho(); } catch (e) { /* direct call propagates; scaleDiscoveryDaily swallows */ }
    check('failed say does not consume the gate', !(Game.state.scaleDiscover || {}).natBeatEcho,
      'gate=' + !!((Game.state.scaleDiscover || {}).natBeatEcho));
    // and the retry succeeds
    Game.say = (m) => { said.push(String((m && (m.text || m)) || m)); return origSay(m); };
    Game._sdNationalBeatEcho();
    check('retry after failure fires', said.some(s => /not quite believing it/.test(s)) &&
      !!((Game.state.scaleDiscover || {}).natBeatEcho));
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e && e.stack || e); process.exit(1); });
