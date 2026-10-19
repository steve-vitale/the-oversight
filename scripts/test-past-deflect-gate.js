// Verify: deflected 'past' ask no longer journals occupation/backstory,
// while a real 'past' answer still teaches. (Steve 2026-10-06)
const K = require('./godpath/lib');
let pass = 0, fail = 0;
const ok = (n, c, x) => { c ? pass++ : (fail++, console.log(`FAIL ${n}${x ? ' — ' + x : ''}`)); };

(async () => {
  const Game = await K.load({ seed: Number(process.env.SEED || 20261006) });
  K.newRun(Game);
  Game.state.systemArrived = false;
  Game.state.codex.people = {};
  const vid = Game.npcIds()[0], person = Game.getPerson(vid);
  person.formerOccupation = 'librarian';
  person.personality = { ...person.personality, temperament: 'withdrawn' };
  person.lies = {};
  ok('setup: prepared guarded occupation subject', Game.npcTemper(vid) === 'withdrawn' && person.formerOccupation === 'librarian');
  const realRandom = Math.random;
  // --- deflected ask ---
  Game.state.village.trust[vid] = 10;
  Game.startConvo(vid);
  Math.random = () => 0.1; // force the <0.55 deflect roll
  let line;
  try { line = Game.convoAskTopic(vid, 'past'); } finally { Math.random = realRandom; }
  ok('deflect: got a shutdown line', /before|talk about/i.test(String(line)), String(line).slice(0, 80));
  const e = (Game.state.codex.people || {})[vid];
  ok('deflect: no occupation journaled', !(e && e.occupation && e.occupation.value));
  ok('deflect: no backstory journaled', !(e && e.backstory && e.backstory.value));
  ok('deflect: occupationLabel still null', Game.occupationLabel(vid) === null);

  // --- genuine ask (high trust, fresh convo) ---
  Game.endConvo(vid, 'left');
  Game.state.village.trust[vid] = 90;
  Game.startConvo(vid);
  const line2 = Game.convoAskTopic(vid, 'past');
  const e2 = (Game.state.codex.people || {})[vid];
  ok('genuine: occupation journaled', !!(e2 && e2.occupation && e2.occupation.value), String(line2).slice(0, 80));
  ok('genuine: occupationLabel shows it', Game.occupationLabel(vid) === e2.occupation.value);

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });
