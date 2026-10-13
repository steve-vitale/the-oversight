// MEM-WIRE confrontation proof (2026-10-13). Usage: node scripts/test-mem-wire-confront-20261013.js
// Proves: (1) confronted_theft has a read site — convoMemoryAbout labels it,
// so the fresh-memories menu can surface "About when I called you out at the
// fire..."; (2) the moot case pipeline weighs prior warnings: a theft case
// against someone already warned hits harder (belief more negative), while a
// theft case against someone NEVER warned is harder to hold (belief less
// negative). Non-theft charges are untouched.
// RED-verified: on pristine the label is null and belief is warning-blind.
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(name, cond) {
  if (cond) { pass++; }
  else { fail++; console.log(`FAIL ${name}`); }
}

(async () => {
  let Game;
  try {
    const r = await loadGame({ seed: 11 });
    Game = r.Game;
    if (r.loadFails && r.loadFails.length) console.log('LOAD FAILURES:\n' + r.loadFails.join('\n'));
  } catch (e) { console.log('FATAL loadGame: ' + e.message); process.exit(2); }
  await setupGame(Game);

  const v = Game.state.village;
  const roster = v.roster.filter(id => id !== Game.villagerId);
  const confronter = roster[0], accuser = roster[1] || roster[0];

  // 1. the label read site exists (pristine: null → menu can never surface it)
  const label = (typeof Game.convoMemoryAbout === 'function') ? Game.convoMemoryAbout('confronted_theft') : null;
  ok('confronted_theft has a human label', !!label);

  // 2a. theft case, NEVER warned → baseline belief
  v.memory = {};
  const c1 = Game.openPlayerCase(accuser, 'theft', [], false);
  const b1 = Object.values(c1.belief);
  const mean1 = b1.reduce((a, x) => a + x, 0) / b1.length;

  // 2b. theft case, WARNED → hits harder
  Game.remember(confronter, 'confronted_theft', 'called you out for taking too much');
  const c2 = Game.openPlayerCase(accuser, 'theft', [], false);
  const b2 = Object.values(c2.belief);
  const mean2 = b2.reduce((a, x) => a + x, 0) / b2.length;
  ok('warned theft case hits harder', mean2 < mean1 - 5);

  // 2c. non-theft charge is warning-blind (murder case unaffected)
  v.memory = {};
  const c3 = Game.openPlayerCase(accuser, 'murder', [], false);
  const mean3 = Object.values(c3.belief).reduce((a, x) => a + x, 0) / Object.values(c3.belief).length;
  Game.remember(confronter, 'confronted_theft', 'called you out for taking too much');
  const c4 = Game.openPlayerCase(accuser, 'murder', [], false);
  const mean4 = Object.values(c4.belief).reduce((a, x) => a + x, 0) / Object.values(c4.belief).length;
  ok('murder case ignores theft warnings', Math.abs(mean4 - mean3) < 0.01);

  // 2d. the never-warned direction: unwarned theft belief is softer than warned
  ok('never-warned theft case is harder to hold', mean1 > mean2);

  console.log(`\nmem-wire confront: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.log('FATAL: ' + (e && e.stack || e)); process.exit(2); });
