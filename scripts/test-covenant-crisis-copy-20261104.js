// scripts/test-covenant-crisis-copy-20261104.js — proof for journey-scale r94.
// r93/r94 finding: a covenant link's trust fell 30 -> 14 across five
// "Conceded better terms; the league holds (trust +8)" lines, because the
// crisis itself charges -10 (covenantCrisis) and NO announcement named it,
// while the concede's +8 was said aloud. The fix names the -10 in the
// crisis announcement (all three variants) and in the council-book note.
// This test plays one real crisis cycle through the engine's own link
// factory and asserts: announcement names -10, concede names +8, the book
// note names -10, and net trust across the cycle is -2 (30 -> 20 -> 28).
// Usage: node scripts/test-covenant-crisis-copy-20261104.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(cond, label) {
  if (cond) { pass++; console.log('  ok   ' + label); }
  else { fail++; console.log('  FAIL ' + label); }
}

(async () => {
  const { Game } = await loadGame({ seed: 85301 });
  await setupGame(Game);
  Game.state.scholar.day = 10;
  Game.state.otherVillages = [{ id: 'vtest', name: 'Stonebridge', population: 10, day: 5, pantryKcal: 5000, viewership: 5, opinion: 40, generated: true }];
  const said = [];
  const realSay = Game.say;
  Game.say = function (t) { said.push(String(t)); try { return realSay.call(this, t); } catch (e) { return t; } };

  const link = Game._formPeerLink('vtest', { kind: 'covenant' });
  ok(!!link && link.kind === 'covenant' && link.status === 'active', 'covenant link formed via engine factory');
  ok(link.trust === 30, 'link starts at trust 30 (got ' + link.trust + ')');

  for (const why of ['strain', 'leader-death', 'their-speaker-died']) {
    said.length = 0;
    link.trust = 30;
    link.pendingCovenantCrisis = null;
    const r = Game.covenantCrisis(link.id, why);
    ok(r !== null && r !== 'pending', 'covenantCrisis(' + why + ') fires');
    ok(link.trust === 20, 'crisis charges -10 (got ' + link.trust + ')');
    ok(said.some(t => /Trust -10/.test(t)), 'crisis announcement (' + why + ') names -10: ' + JSON.stringify(said));
    const note = (link.history || []).find(h => h.kind === 'crisis');
    ok(!!note && /-10/.test(note.note || ''), 'council-book crisis note names -10 (' + why + ')');
    if (why === 'strain') {
      // Full cycle on the strain variant: concede buys the league back +8.
      said.length = 0;
      const res = Game.answerCovenantCrisis(link.id, 'concede');
      ok(res === 'conceded', 'concede resolves the crisis');
      ok(link.trust === 28, 'net across the cycle is -2: 30 -> 20 -> 28 (got ' + link.trust + ')');
      ok(said.some(t => /Trust \+8/.test(t)), 'concede announcement names +8');
    } else {
      link.pendingCovenantCrisis = null;
    }
  }
  console.log(`covenant-crisis-copy: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('ERROR ' + (e && e.stack || e)); process.exit(1); });
