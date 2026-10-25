// scripts/test-journey-scale-r33-pickcap.js — proof for journey-scale r33.
// Extracts the ACTUAL pickChoice + choice lists from the r33 driver source
// (not a copy) and replays r32's failure traces through the same state
// machine runConversation uses: {consec, deflected}, updated per pick.
//   - r32 85003-d120: dlg:more 8 times running -> capped at 1 consecutive.
//   - r32 85002-d90: goon re-ask after a deflect -> never goon after deflect.
//   - Normal behavior preserved: first more still picked; substantive
//     ENGAGE options still beat more; react-first rule intact; leave fallback.
// Usage: node scripts/test-journey-scale-r33-pickcap.js
'use strict';
const fs = require('fs');
const path = require('path');
const driverSrc = fs.readFileSync(path.join(__dirname, 'journey-scale-r33-20261025.js'), 'utf8');

function extractConst(name) {
  const m = driverSrc.match(new RegExp('const ' + name + ' = \\[[^\\]]*\\];'));
  if (!m) throw new Error('const ' + name + ' not found in driver');
  return m[0];
}
const fnStart = driverSrc.indexOf('function pickChoice(');
const fnEnd = driverSrc.indexOf('function runConversation(');
if (fnStart < 0 || fnEnd < 0 || fnEnd <= fnStart) throw new Error('pickChoice not found in driver');
const fnSrc = driverSrc.slice(fnStart, fnEnd);
const sandboxSrc = [extractConst('ENGAGE'), extractConst('ENGAGE2'), extractConst('DEFLECT'), extractConst('GQYN'), fnSrc, 'module.exports = { pickChoice };'].join('\n');
const mod = { exports: {} };
new Function('module', 'exports', sandboxSrc)(mod, mod.exports);
const { pickChoice } = mod.exports;

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (detail ? ' — ' + detail : '')); }
}
const ch = (ids) => ids.map(id => ({ id, label: id }));
// Simulate runConversation's state updates around pickChoice.
function runTrace(turnChoices) {
  const st = { consec: 0, deflected: false };
  const picks = [];
  for (let t = 0; t < turnChoices.length; t++) {
    const pick = pickChoice(ch(turnChoices[t]), t, st);
    if (!pick || pick.id === 'leave') { picks.push('leave'); break; }
    picks.push(pick.id);
    if (pick.id === 'dlg:more' || pick.id === 'goon') st.consec += 1; else st.consec = 0;
    if (['dlg:cant', 'gq:open:honest_pass'].indexOf(pick.id) !== -1) st.deflected = true;
  }
  return picks;
}
function maxStretch(picks) {
  let m = 0, r = 0;
  for (const p of picks) { if (p === 'dlg:more' || p === 'goon') { r++; m = Math.max(m, r); } else r = 0; }
  return m;
}

// 1. r32's worst trace: only more + leave, 8 turns. Old picker: 8x more.
const loop = runTrace(Array(8).fill(['dlg:more', 'leave']));
check('more-loop capped: first pick still more', loop[0] === 'dlg:more', JSON.stringify(loop));
check('more-loop capped: max consecutive <= 1', maxStretch(loop) <= 1, JSON.stringify(loop));
check('more-loop capped: conversation ends (leave) by turn 2', loop.indexOf('leave') !== -1 && loop.indexOf('leave') <= 1, JSON.stringify(loop));

// 2. r32 Domfeh trace, faithful: details, then deflect (cant offered with NO
// goon on that turn — that is how cant got picked in r32), then goon offered
// again after the deflect. The deflect flag, not the stretch cap, must block it
// (consec reset to 0 when cant was picked).
const domfeh = runTrace([
  ['dlg:details', 'goon', 'leave'],
  ['dlg:cant', 'leave'],
  ['goon', 'leave'],
]);
check('post-deflect goon never picked', JSON.stringify(domfeh) === JSON.stringify(['dlg:details', 'dlg:cant', 'leave']), JSON.stringify(domfeh));
check('post-deflect conversation leaves instead of re-asking', domfeh[domfeh.length - 1] === 'leave', JSON.stringify(domfeh));

// 3. Goon first, then deflect, then goon again: the second goon must not fire.
const goonDeflect = runTrace([
  ['goon', 'leave'],
  ['dlg:cant', 'goon', 'leave'],
  ['goon', 'leave'],
]);
check('goon-after-deflect blocked even after an earlier goon', goonDeflect.filter(p => p === 'goon').length === 1, JSON.stringify(goonDeflect));

// 4. Normal behavior preserved.
const normal = runTrace([['dlg:commit', 'dlg:more', 'leave']]);
check('substantive ENGAGE option still beats more', normal[0] === 'dlg:commit', JSON.stringify(normal));
const react = runTrace([['dlg:react', 'teach', 'leave']]);
check('react-first rule intact', react[0] === 'dlg:react', JSON.stringify(react));
const onlyLeave = runTrace([['leave']]);
check('leave fallback intact', onlyLeave[0] === 'leave', JSON.stringify(onlyLeave));
const goonOnce = runTrace([['goon', 'leave'], ['dlg:details', 'leave']]);
check('a single goon is still allowed before a substantive pick', goonOnce[0] === 'goon' && goonOnce[1] === 'dlg:details', JSON.stringify(goonOnce));

// 5. Wiring: driver passes state, policy unchanged, standing policy untouched by name.
check('driver passes pickSt to pickChoice', /pickChoice\(choices, turn, pickSt\)/.test(driverSrc));
check('driver updates consec/deflected from picks', /pickSt\.consec \+= 1/.test(driverSrc) && /pickSt\.deflected = true/.test(driverSrc));
check('driver still uses the r32 nogate policy', driverSrc.indexOf("policies/scalecourt-nogate") !== -1);
check('driver does not import standing scalecourt alone', !/policies\/scalecourt'/.test(driverSrc));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
