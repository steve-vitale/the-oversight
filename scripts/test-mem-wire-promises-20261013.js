// MEM-WIRE promises proof (2026-10-13). Usage: node scripts/test-mem-wire-promises-20261013.js
// Proves: (1) a broken promise is READ by makePromise — the villager refuses
// a new vow citing the rotted one; (2) amends reopen the door; (3) the
// promise_broken memory feeds behaviorCheck's words-vs-deeds doubt, honestly
// attributed (the SCHOLAR's word rotted, not the villager's).
// RED-verified: on pristine these fail (refusal absent, no doubt planted).
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(name, cond) {
  if (cond) { pass++; }
  else { fail++; console.log(`FAIL ${name}`); }
}

(async () => {
  let Game;
  try {
    const r = await loadGame({ seed: 7 });
    Game = r.Game;
    if (r.loadFails && r.loadFails.length) console.log('LOAD FAILURES:\n' + r.loadFails.join('\n'));
  } catch (e) { console.log('FATAL loadGame: ' + e.message); process.exit(2); }
  await setupGame(Game);

  const v = Game.state.village;
  const vid = v.roster.find(id => id !== Game.villagerId);
  // give them a keepable goal (feed → kept by 'food' actions); npcGoal reads
  // the data villager first, so override there.
  const dv = (Game.data.villagers || []).find(x => x.id === vid);
  if (dv) dv.goal = 'feed';
  const said = [];
  const origSay = Game.say.bind(Game);
  Game.say = (t) => { said.push(String(t)); try { return origSay(t); } catch (e) {} };

  // 1. make a promise, then rot it
  const mk = Game.promiseHelp(vid);
  ok('promise made', !!(mk && mk.ok));
  v.promises[vid].day = (Game.state.scholar.day || 1) - 8; // age past the window
  Game.checkPromises('__no_such_kind__', vid);
  const mems = (v.memory[vid] || []).map(m => m.t);
  ok('promise_broken written', mems.includes('promise_broken'));

  // 2. a new vow is refused — and cites the rotted one
  said.length = 0;
  const mk2 = Game.promiseHelp(vid);
  ok('second vow refused', mk2 === null);
  ok('refusal cites the broken word', said.some(s => s.includes('You said that before')));

  // 3. amends reopen the door
  Game.remember(vid, 'amends', 'apologized for honest');
  said.length = 0;
  const mk3 = Game.promiseHelp(vid);
  ok('vow accepted after amends', !!(mk3 && mk3.ok));

  // 4. behaviorCheck plants an honest doubt about the SCHOLAR's word
  v.truthClaims = v.truthClaims || {};
  v.truthClaims[vid] = { goal: [{ claim: 'belong', day: 1, via: 'talk' }] };
  Game.state.codex = Game.state.codex || {}; Game.state.codex.doubts = [];
  Game.behaviorCheck(vid);
  const doubts = (Game.state.codex.doubts || []).filter(d => d.kind === 'behavior');
  ok('doubt planted for broken word', doubts.length > 0);
  ok('doubt is honest about whose word rotted',
    doubts.some(d => /you broke your word/i.test(d.text || '')));

  console.log(`\nmem-wire promises: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.log('FATAL: ' + (e && e.stack || e)); process.exit(2); });
