#!/usr/bin/env node
// test-crisis-r45-compound-labels-20261023.js — CRISIS LEG r45 (lane B).
// Blank filled: the r44 compound escalation line ("And now X, on top of it
// all") only names hunger/sickness — every other crisis kind (raid, storm)
// falls through to "And now this, on top of it all". Natural-play evidence
// (journey-crisis-r45, seeds 303/404): 4/6 compound firings said "this".
// Bindings:
//   B1 raid compound names the raid ("And now a raid, on top of it all")
//   B2 storm compound names the storm ("And now the storm, on top of it all")
//   B3 hunger/sickness labels unchanged
//   B4 the compound-once guard still holds (second compound rides silent)
// Usage: node scripts/test-crisis-r45-compound-labels-20261023.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(name, cond, detail) {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name + (detail ? ' — ' + detail : '')); }
}

async function main() {
  // B1/B2: direct compound invocations with an open relief of another kind
  for (const [toKind, want] of [['raid', 'a raid'], ['storm', 'the storm']]) {
    const { Game } = await loadGame({ seed: 777, mode: 'r45-label-' + toKind });
    await setupGame(Game);
    const lines = [];
    const _say = Game.say.bind(Game);
    Game.say = (m) => { lines.push(String(m)); return _say(m); };
    Game.state.relief = { kind: 'sickness', speaker: 'Test Speaker', sinceDay: 1, partsLeft: 6, used: {} };
    Game.raiseRelief(toKind, {});
    const comp = lines.find(l => /on top of it all/i.test(l)) || '';
    ok(`B1/B2 compound ${toKind} labels "${want}"`, comp.includes('And now ' + want + ','), comp.slice(0, 140));
    Game.say = _say;
  }
  // B3: hunger/sickness unchanged
  for (const [toKind, want] of [['hunger', 'hunger'], ['sickness', 'sickness']]) {
    const { Game } = await loadGame({ seed: 778, mode: 'r45-label-' + toKind });
    await setupGame(Game);
    const lines = [];
    const _say = Game.say.bind(Game);
    Game.say = (m) => { lines.push(String(m)); return _say(m); };
    Game.state.relief = { kind: toKind === 'hunger' ? 'sickness' : 'hunger', speaker: 'Test Speaker', sinceDay: 1, partsLeft: 6, used: {} };
    Game.raiseRelief(toKind, {});
    const comp = lines.find(l => /on top of it all/i.test(l)) || '';
    ok(`B3 compound ${toKind} label unchanged ("${want}")`, comp.includes('And now ' + want + ','), comp.slice(0, 140));
    Game.say = _say;
  }
  // B4: compound-once still holds — a second different-kind raise rides silent
  {
    const { Game } = await loadGame({ seed: 779, mode: 'r45-label-once' });
    await setupGame(Game);
    const lines = [];
    const _say = Game.say.bind(Game);
    Game.say = (m) => { lines.push(String(m)); return _say(m); };
    Game.state.relief = { kind: 'hunger', speaker: 'Test Speaker', sinceDay: 1, partsLeft: 6, used: {} };
    Game.raiseRelief('raid', {});
    Game.raiseRelief('storm', {});
    const comps = lines.filter(l => /on top of it all/i.test(l));
    ok('B4 second compound rides silent', comps.length === 1, comps.length + ' firings');
    Game.say = _say;
  }
  console.log(`\n${pass} pass, ${fail} fail`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('FATAL', e); process.exit(2); });
