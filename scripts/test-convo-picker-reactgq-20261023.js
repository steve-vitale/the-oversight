// test-convo-picker-reactgq-20261023.js — proof test for the r16
// pickChoice Rule-4 fixes (M4 blank-adjacent: the sense-read instrument).
//
// BEFORE: the picker only recognized ans:, dlg:react and three gq:open: ids.
//   - A hanging reactiveQ offers answers as react:<qid>:<aid> — the picker
//     dropped them. Three seek_taken openers got zero-turn instant-leaves in
//     the r16 pilot (8901 d60, 8902 d45, 8902 d60), misread as a game defect.
//   - A hanging genericQ offers answers as gq:<kind>:<aid> for ANY kind.
//     "Have you heard anything?" classifies as yn, not open — the picker
//     dropped gq:yn: answers too (seed 8908 d45, second half of the fix).
//
// AFTER: any react: or gq: answer (except honest_pass) is an engagement —
// a direct question gets answered first (Steve's Rule 4), never left.
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { pickChoice } = require(path.join(ROOT, 'scripts', 'journey-deepening-r16-20261023.js'));

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log(`  PASS ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${extra ? ' — ' + extra : ''}`); }
}
const C = (id) => ({ id, label: id });

// 1. reactive answers are engaged (the pilot's zero-turn leaves)
{
  const list = [C('leave'), C('react:taken-ask:a_heard_nothing'), C('react:taken-ask:a_will_ask'), C('react:taken-ask:honest_pass')];
  const p = pickChoice(list, 0);
  ok('react: answer picked over leave', p && p.id.indexOf('react:') === 0 && p.id.indexOf('honest_pass') === -1, p && p.id);
}
// 2. generic-Q answers of ANY kind are engaged (8908 d45: yn, not open)
{
  const list = [C('leave'), C('gq:yn:a_yes'), C('gq:yn:a_no'), C('gq:yn:honest_pass')];
  const p = pickChoice(list, 0);
  ok('gq:yn: answer picked over leave', p && p.id.indexOf('gq:yn:') === 0 && p.id.indexOf('honest_pass') === -1, p && p.id);
}
// 3. want-menu engage ids still win over question answers (existing priority)
{
  const list = [C('leave'), C('dlg:commit'), C('react:taken-ask:a_heard_nothing')];
  const p = pickChoice(list, 0);
  ok('ENGAGE id still first', p && p.id === 'dlg:commit', p && p.id);
}
// 4. honest deflects still reachable when nothing engageable is offered
{
  const list = [C('leave'), C('gq:yn:honest_pass'), C('dlg:cant')];
  const p = pickChoice(list, 0);
  ok('deflect picked when no engage', p && (p.id === 'dlg:cant' || p.id.indexOf('honest_pass') >= 0), p && p.id);
}
// 5. leave-only menu still leaves (no fabricated engagement)
{
  const p = pickChoice([C('leave')], 0);
  ok('leave-only still leaves', p && p.id === 'leave', p && p.id);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
