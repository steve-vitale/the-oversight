// test-foreign-react-fragframe-r97.js -- journey-scale r97 Q3 proof.
// r97 carried item: 85503 d90 Yoleida (Spanish-only, nonverbal sitting) —
// the Mario-moment fragment fires inside a nod exchange as a BARE quote:
//   "They answer at length. They nod back, a little quicker this time. "Fuck you.""
// Read cold, that is hostility, not the designed moment. The VERBAL path
// frames the same fragment ("— they grin, proud of the one English they
// know."), but the nonverbal react path (Game.nvRespond, react branch)
// appends the fragment with no framing at all. This test drives nvRespond
// directly for a foreign speaker with a forced fragment and asserts the
// react line carries the proud framing whenever it carries a fragment.
// RED on current code (bare quote); GREEN after the framing fix.
// Fragment SELECTION (random pool pick, 35% gate, once per convo) is existing
// behavior and is NOT under test here — the fragment is forced so the test
// judges framing only.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  PASS', name); }
  else { fail++; console.log('  FAIL', name, extra ? '-- ' + extra : ''); }
}

(async () => {
  const { Game } = await loadGame({ seed: 7773, mode: 'test-foreign-react-fragframe-r97' });
  await setupGame(Game);
  Game.say = () => {}; Game.sysSay = () => {}; Game.emit = () => {};
  const v = Game.state.village;
  const s = Game.state.scholar;
  const vid = (v.roster || []).find(id => id !== Game.villagerId);
  ok('setup: roster villager found', !!vid);
  v.bgLangs = v.bgLangs || {};
  v.bgLangs[vid] = { native: 'italian', levels: { italian: 2 } };
  s.languages = { native: 'english', levels: { english: 2 } };
  s.langExposure = {};
  s.abilities = (s.abilities || []).filter(a => ((a && a.id) || a) !== 'translator');
  s.integration = 10;
  const c = Game.convoGet(vid);
  c._mediatedReacted = true; // suppress the once-per-convo mediated note
  // Force the fragment (framing under test, not selection).
  Game.maybeEnglishFragment = () => 'Fuck you.';
  for (const kind of ['nod', 'smile']) {
    const line = String(Game.nvRespond(vid, kind));
    console.log(`  ${kind}: ${line.slice(0, 220)}`);
    ok(`${kind}: react line carries the fragment`, line.includes('"Fuck you."'), line.slice(0, 220));
    ok(`${kind}: fragment is framed as pride, not bare hostility`,
      line.includes('proud of the one English they know'), line.slice(0, 220));
  }
  console.log(`\n${pass}/${pass + fail} ${fail ? 'RED' : 'GREEN'}`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(1); });
