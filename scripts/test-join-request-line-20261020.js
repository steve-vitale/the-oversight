#!/usr/bin/env node
// test-join-request-line-20261020.js — journey-social r34 blank:
// the "pull you in" overheard beat (game.js overheardDiscussion) speaks a
// specific invitation ("You. Yeah, you. What do you make of this?") but the
// stored talkRequest line was the generic "__NAME__ wants you to join the
// conversation." — the sit-down's opener carried no actual question, so the
// conversation had nothing to engage (Debbie d19, seed 3201: a grieving NPC
// who pulled the player in, then deflected everything — the promised
// discussion never existed).
// RED (pre-fix): the stored line is the generic one.
// GREEN (post-fix): the stored line carries the spoken invitation verbatim.
// Usage: node scripts/test-join-request-line-20261020.js
'use strict';
process.env.TRIBFLOOR = '1';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

const INVITE_QS = [
  'Hey — come here. You should hear this.',
  'You. Yeah, you. What do you make of this?',
  "Don't just stand there — you've got opinions, right?",
];

(async () => {
  const { Game, manifest } = await loadGame({ seed: 4242, mode: 'test-join-req', fullTelemetry: false });
  await setupGame(Game);
  // A lived-in world: positions, day-parts, and NPCs near the player — the
  // overheard beat needs all three.
  const quiet = Object.assign({}, competent, { id: 'test-join-req-quiet' });
  await runDays(Game, quiet, { days: 4, manifest });
  // The campaign can finish its iteration at night. This proof exercises a
  // daytime invitation, whose production guard deliberately refuses night.
  // Keep the played residents; establish the probe's stated opportunity.
  Game.dayPart = 1;
  Game.state.village.engaged = {};
  Game.returnToVillage();
  const residents = Game.state.village.roster.filter(id => id !== Game.villagerId && !Game.getPerson(id).dead).slice(0,2);
  for (const id of residents) {
    Game.npcSetNode(id, Game.map.px, Game.map.py);
    Game.npcSetInside(id, Game.state.scholar.insideHaven !== false);
  }
  Game.ensureVillagerPositions();
  const beats = [];
  const origSay = Game.say;
  Game.say = function (m) { beats.push(String(m)); return origSay.call(this, m); };

  let found = null;
  for (let i = 0; i < 400 && !found; i++) {
    try { Game.overheardDiscussion(); } catch (e) {}
    const reqs = (Game.state.village || {}).talkRequests || {};
    for (const vid of Object.keys(reqs)) {
      const line = String((reqs[vid] || {}).line || '');
      if (/join the conversation/i.test(line) || INVITE_QS.some(q => line.includes(q))) {
        found = { vid, line };
        break;
      }
    }
  }
  Game.say = origSay;
  let pass = 0, fail = 0;
  const check = (name, cond, detail) => {
    if (cond) { pass++; console.log(`  ok: ${name}`); }
    else { fail++; console.log(`  FAIL: ${name}${detail ? ' — ' + detail : ''}`); }
  };
  check('a join-request was created by overheardDiscussion', !!found, 'no request fired in 400 calls: '+JSON.stringify({night:Game.isNight(),sleeping:!!Game._sleeping,fight:!!Game.tbfight,positions:Object.keys(Game.state.village.positions||{}),overheard:!!Game.data.characterGen?.overheard}));
  if (found) {
    const name = (() => { try { return Game.displayName(found.vid); } catch (e) { return found.vid; } })();
    console.log(`  stored line: ${found.line.slice(0, 110)}`);
    const spoken = beats.find(b => b.includes(name) && INVITE_QS.some(q => b.includes(q)));
    check('the beat spoke a specific invitation', !!spoken, 'beat stream has no invite line');
    const carriesQuestion = INVITE_QS.some(q => found.line.includes(q));
    check('stored request line carries the spoken invitation (not the generic line)', carriesQuestion,
      `line was: ${found.line.slice(0, 90)}`);
    check('no fabricated content: the stored line matches a beat-spoken invite',
      !spoken || INVITE_QS.some(q => found.line.includes(q) && spoken.includes(q)),
      'stored question differs from the spoken one');
    // The opener path: sitting down must surface the question as the opener.
    try {
      Game.startConvo(found.vid);
      const c = Game.convoGet(found.vid);
      const opener = ((c.transcript || []).map(e => String(e.text || '')).join(' '));
      check('conversation opener carries the invitation question',
        INVITE_QS.some(q => opener.includes(q)), `opener: ${opener.slice(0, 90)}`);
      check('opener thread is request', c.thread === 'request', `thread=${c.thread}`);
      try { Game.endConvo(found.vid, 'left'); } catch (e) {}
    } catch (e) { check('startConvo works on the join request', false, String(e.message).slice(0, 80)); }
  }
  console.log(`RESULT: ${fail === 0 ? 'GREEN' : 'RED'} — ${pass} passed, ${fail} failed`);
  process.exit(fail === 0 ? 0 : 1);
})();
