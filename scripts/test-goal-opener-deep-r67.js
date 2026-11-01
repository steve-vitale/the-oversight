// scripts/test-goal-opener-deep-r67.js — PROOF for journey-scale r67:
// the Deon d120 blank — a goal opener re-served verbatim as a goaldeep
// follow-up in the same sitting ("Watch — I'll get a real laugh out of
// this camp before the week is out." as opener, then again on "Tell me
// more"). Root cause: convoPick dedupes by exact string, but the goal
// opener pool (goalDef.lines, unquoted) and the goaldeep pool
// (goalFollow[goal], quoted variants) hold the SAME lines in different
// wrapping — so the cross-key "never resurfaces" promise fails on quote
// wrapping alone. The fix: convoPick compares lines quote-stripped, so a
// line said in one key never re-serves in another, whatever its quotes.
//
// RED on pre-fix code: draining the goaldeep pool after an opener pick
// serves the opener's quoted twin. GREEN: the twin is excluded, and the
// rest of the pool still drains.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

function norm(s) {
  let t = String(s == null ? '' : s).trim();
  if (t.length >= 2 && t.startsWith('"') && t.endsWith('"')) t = t.slice(1, -1);
  return t.trim().replace(/\s+/g, ' ');
}

async function main() {
  const { Game } = await loadGame({ seed: 424243, mode: 'mvc' });
  setupGame(Game);

  let pass = 0, fail = 0;
  const t = (name, cond, extra) => {
    if (cond) { pass++; }
    else { fail++; console.log('  FAIL: ' + name + (extra ? ' :: ' + extra : '')); }
  };

  const v = Game.state.village;
  const roster = (v.roster || []).filter(id => id !== Game.villagerId);
  t('roster has NPCs', roster.length >= 1);
  const vid = roster[0];
  Game.startConvo(vid);

  const cg = (Game.data.characterGen || {}).convo || {};
  const goals = Game.data.characterGen.goals || [];
  const goalDef = goals.find(g => g.id === 'joy');
  t('joy goal def exists', !!goalDef && Array.isArray(goalDef.lines) && goalDef.lines.length > 0);
  const openerPool = Game.convoGoalLines('joy', goalDef);
  const deepPool = (cg.goalFollow || {}).joy || [];
  t('joy deep pool exists', deepPool.length > 0);
  // The twin must exist in the data, or the test is vacuous.
  const twinRaw = deepPool.find(l => norm(l) === 'Watch — I\'ll get a real laugh out of this camp before the week is out.');
  const twinInOpener = openerPool.indexOf('Watch — I\'ll get a real laugh out of this camp before the week is out.') !== -1;
  t('quoted twin in deep pool AND unquoted twin in opener pool', !!twinRaw && twinInOpener);

  // Simulate the opener: pick from the opener pool under key 'goal',
  // forcing the twin by seeding said.goal so only it is fresh is NOT
  // possible (convoPick picks randomly among fresh) — instead seed the
  // said ledger directly with the twin, exactly as an opener pick would
  // record it, then drain the deep pool.
  const c = Game.convoGet(vid);
  c.said = c.said || {};
  c.said.goal = ['Watch — I\'ll get a real laugh out of this camp before the week is out.'];

  const drained = [];
  for (let i = 0; i < deepPool.length + 5; i++) {
    const l = Game.convoPick(vid, 'goaldeep', deepPool);
    if (!l) break;
    drained.push(l);
  }
  console.log('  drained ' + drained.length + ' of ' + deepPool.length + ' deep lines');
  const servedTwin = drained.some(l => norm(l) === 'Watch — I\'ll get a real laugh out of this camp before the week is out.');
  t('opener twin NEVER re-served by goaldeep drain', !servedTwin,
    'served: ' + drained.map(norm).join(' | ').slice(0, 300));
  t('deep pool still drains (at most the twin excluded)',
    drained.length >= deepPool.length - 1,
    'drained=' + drained.length + ' pool=' + deepPool.length);
  t('drained lines are all distinct by normalized text',
    new Set(drained.map(norm)).size === drained.length);

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('PROOF CRASH:', e); process.exit(2); });
