'use strict';
// test-exphurt-a.js — proof for scripts/exphurt-a-lib.js (pure logic
// for sim-exphurt-a). No game load, no RNG: fixtures only.
// Run: node scripts/test-exphurt-a.js
const lib = require('./exphurt-a-lib');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass += 1; console.log('ok - ' + name); }
  else { fail += 1; console.log('FAIL - ' + name + (extra ? ' :: ' + extra : '')); }
}

{ // disconnect boundary: gap >= 2 disconnects, gap < 2 does not
  const d1 = lib.disconnectOf(2, 14);
  check('Aki case 2 vs 14 disconnects, exped shorter, gap 12',
    d1.bothPresent && d1.disconnected && d1.expedShorter && d1.gap === 12);
  check('gap exactly 2 disconnects', lib.disconnectOf(10, 12).disconnected);
  check('gap 1 does not disconnect', !lib.disconnectOf(10, 11).disconnected);
  check('equal durations do not disconnect', !lib.disconnectOf(14, 14).disconnected);
  check('exped longer than away disconnects when gap >= 2 (signed gap negative)',
    lib.disconnectOf(20, 14).disconnected && !lib.disconnectOf(20, 14).expedShorter && lib.disconnectOf(20, 14).gap === -6);
  check('missing exped duration is not a disconnect, not counted',
    !lib.disconnectOf(null, 14).bothPresent && !lib.disconnectOf(null, 14).disconnected);
  check('missing away duration is not a disconnect',
    !lib.disconnectOf(2, null).bothPresent && !lib.disconnectOf(2, null).disconnected);
}
{ // line classification: exact current templates
  const expLine = '🧭 Aurora is back from past the west (+1592 kcal for the pantry, 2 stories, a new scar) (Ask them what they saw.)';
  const c1 = lib.classifyReturnLine(expLine);
  check('current expeditionReturn line is a return + expedition line, mentions no hurt',
    c1.isReturn && c1.isExpeditionReturn && !c1.isHurthome && !c1.mentionsHurt);
  const farLine = '🧭 Desmond is back from far past the east (4 stories, a new scar) (Ask them what they saw.)';
  check('far-past variant also classifies as expedition return',
    lib.classifyReturnLine(farLine).isExpeditionReturn);
  const hurtLine = '🧭 Aki returns from the wilds hurt (health 5/100) — the trip cut short.';
  const c2 = lib.classifyReturnLine(hurtLine);
  check('landed hurthome line is a return + hurthome line, mentions hurt',
    c2.isReturn && c2.isHurthome && c2.mentionsHurt && !c2.isExpeditionReturn);
  const forageLine = '🌿 Sam returns from foraging the wilds: +300 kcal to the pantry.';
  const c3 = lib.classifyReturnLine(forageLine);
  check('forage return is a return line but not expedition, mentions no hurt',
    c3.isReturn && !c3.isExpeditionReturn && !c3.mentionsHurt);
  check('non-return line is not a return line',
    !lib.classifyReturnLine('Aurora eats away from the haven — 1459 kcal — while hurt (health 1/100).').isReturn);
}
{ // closing-part filtering: day+part+name must all match
  const transcript = [
    { day: 25, part: 2, line: '🧭 Aurora returns from the wilds hurt (health 5/100) — the trip cut short.' },
    { day: 25, part: 2, line: '🧭 Aurora is back from past the west (+1592 kcal for the pantry, 2 stories, a new scar) (Ask them what they saw.)' },
    { day: 25, part: 1, line: '🧭 Aurora is back from past the west (+100 kcal) (Ask them what they saw.)' },
    { day: 25, part: 2, line: '🧭 Desmond is back from past the east (4 stories) (Ask them what they saw.)' },
    { day: 25, part: 2, line: 'Aurora eats away from the haven — 100 kcal — while hurt (health 5/100).' },
  ];
  const lines = lib.closingReturnLines(transcript, 25, 2, 'Aurora');
  check('closing-part filter keeps exactly the same-tick Aurora return lines',
    lines.length === 2 && lines.some((l) => l.isHurthome) && lines.some((l) => l.isExpeditionReturn));
  check('Someone matches nothing (unattributed lines never counted)',
    lib.closingReturnLines(transcript, 25, 2, 'Someone').length === 0);
  check('other villager same tick does not leak in',
    lib.closingReturnLines(transcript, 25, 2, 'Desmond').length === 1);
}
{ // pooled summary: M1/M2/M3/D on fixtures
  const expLine = (hurt) => ({ line: 'x', isReturn: true, isExpeditionReturn: true, isHurthome: false, mentionsHurt: hurt });
  const hurtLine = { line: 'x', isReturn: true, isExpeditionReturn: false, isHurthome: true, mentionsHurt: true };
  const cases = [
    { purpose: 'expedition', expedDurationAtOpen: 2, awayDuration: 14, outcome: 'returned-hurt', closingLines: [hurtLine, expLine(false)] },
    { purpose: 'expedition', expedDurationAtOpen: 10, awayDuration: 11, outcome: 'returned-hurt', closingLines: [expLine(false)] },
    { purpose: 'expedition', expedDurationAtOpen: 6, awayDuration: 6, outcome: 'returned-hurt', closingLines: [] },
    { purpose: 'expedition', expedDurationAtOpen: null, awayDuration: 14, outcome: 'returned-hurt', closingLines: [hurtLine] },
    { purpose: 'forage', expedDurationAtOpen: 2, awayDuration: 14, outcome: 'returned-hurt', closingLines: [hurtLine] },
    { purpose: 'expedition', expedDurationAtOpen: 2, awayDuration: 20, outcome: 'died', closingLines: [] },
  ];
  const s = lib.summarize(cases);
  check('D counts only expedition cases with both durations: 2/4 disconnected (incl. died case)',
    s.disconnectDenom === 4 && s.disconnected === 2 && s.D === 0.5);
  check('expedShorter counts gap > 0 only: 3/4',
    s.expedShorter === 3 && s.expedShorterShare === 0.75);
  check('M1: 0/2 expedition lines mention hurt',
    s.returnedHurtExpedition === 4 && s.rhWithExpeditionLine === 2 && s.M1 === 0);
  check('M2: 2/4 returned-hurt cases have any hurt-mentioning line',
    s.M2 === 0.5);
  check('M3: 3/4 returned-hurt cases announced at all',
    s.M3 === 0.75);
  check('empty case list yields null shares, not NaN',
    lib.summarize([]).M1 === null && lib.summarize([]).D === null);
}

console.log(`\ntest-exphurt-a: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
