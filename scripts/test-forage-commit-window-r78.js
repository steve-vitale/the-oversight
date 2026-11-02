#!/usr/bin/env node
// Proof test for the r78 forage/water commit-window fix (convo-wants.js):
// a meet-based promise keeps a TWO-dawn window (meetDay..meetDay+1) even
// when the ask aged for days before the commit. Before the fix, an aged
// ask collapsed the window to one dawn (meetDay == dueDay) and the promise
// rotted even with the partner waiting.
// Usage: node scripts/test-forage-commit-window-r78.js
const { loadGame, setupGame } = require('./sim-harness');
let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}
async function main() {
  const { Game } = await loadGame({ seed: 381, mode: 'mvc', fullTelemetry: true });
  await setupGame(Game);
  const day = (Game.state.scholar || {}).day || 0;
  const living = ((Game.state.village || {}).roster || []).filter(id => {
    if (String(id) === String(Game.villagerId)) return false;
    try { return !(Game.getPerson(id) || {}).dead; } catch (e) { return true; }
  });
  if (living.length < 3) { console.log('FAIL setup: fewer than 3 living villagers'); process.exit(1); }
  function agedFavor(vid, kind, askedAgo) {
    const f = { id: 'test-' + kind + '-' + String(vid), vid, kind, goal: kind, task: 'test ' + kind,
      state: 'asked', askedDay: day - askedAgo, deadline: (day - askedAgo) + 2,
      line: '"test"', short: 'test' };
    Game.convoStoreFavor(f);
    return f;
  }
  // Case 1 (the bug): forage ask aged 7 days, committed today.
  const v1 = living[0];
  const f1 = agedFavor(v1, 'forage_help', 7);
  const r1 = Game.convoFavorCommit(v1, f1);
  const p1 = ((Game.state.village || {}).promises || {})[v1] || {};
  const due1 = Game.promiseDueDay ? Game.promiseDueDay(p1) : null;
  check('aged forage commit ok', !!(r1 && r1.ok), JSON.stringify(r1));
  check('aged forage meetDay = commitDay+1', f1.meetDay === day + 1, 'meetDay=' + f1.meetDay + ' day=' + day);
  check('aged forage window is 2 dawns (dueDay = meetDay+1)', due1 === f1.meetDay + 1, 'dueDay=' + due1 + ' meetDay=' + f1.meetDay);
  check('aged forage favor.deadline widened', f1.deadline >= f1.meetDay + 1, 'deadline=' + f1.deadline);
  check('aged forage promise favorDeadline widened', (p1.favorDeadline || 0) >= f1.meetDay + 1, 'favorDeadline=' + p1.favorDeadline);
  // Case 2: water_haul, same aged shape.
  const v2 = living[1];
  const f2 = agedFavor(v2, 'water_haul', 5);
  const r2 = Game.convoFavorCommit(v2, f2);
  const p2 = ((Game.state.village || {}).promises || {})[v2] || {};
  const due2 = Game.promiseDueDay ? Game.promiseDueDay(p2) : null;
  check('aged water commit ok', !!(r2 && r2.ok), JSON.stringify(r2));
  check('aged water window is 2 dawns', due2 === f2.meetDay + 1, 'dueDay=' + due2 + ' meetDay=' + f2.meetDay);
  // Case 3 (no regression): fresh forage ask committed same day keeps its shape.
  const v3 = living[2];
  const f3 = agedFavor(v3, 'forage_help', 0);
  const r3 = Game.convoFavorCommit(v3, f3);
  const p3 = ((Game.state.village || {}).promises || {})[v3] || {};
  const due3 = Game.promiseDueDay ? Game.promiseDueDay(p3) : null;
  check('fresh forage commit ok', !!(r3 && r3.ok), JSON.stringify(r3));
  check('fresh forage dueDay = askDay+2 (unchanged)', due3 === day + 2, 'dueDay=' + due3 + ' day=' + day);
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error(e); process.exit(1); });
