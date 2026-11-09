'use strict';
// test-journey-deepening-r122-analyzer-20261109.js -- R122 analyzer proof
// (runs the REAL driver helpers + analyzer on synthetic inputs).
// Analyzer summarizeSecret (r120 metric review #1 + #2 — addressing counts
// a secret: PICK anywhere in the sitting; CROWDED splits):
//   (1) no secretSittings -> NO-SECRET, openers 0;
//   (2) turn-2 answer after a betrayal menu (first menu has no secret:
//       id; picks betrayal:accept then secret:promise) -> addressing 1,
//       ANSWERED, teachBefore 0;
//   (3) teach picked twice BEFORE the answer -> teachCrowded 1;
//   (4) teach picked twice AFTER the answer -> teachCrowded 0 (the
//       r120 rule counted these as crowding — the split corrects it);
//   (5) secret: offered on the first menu but never picked -> addressing
//       0, UNANSWERED (addressing means answered, not merely offered);
//   (6) wantFinal 'promised' -> established 1, wantOpen 0; 'none' ->
//       established 0, wantOpen 1;
//   (7) never answered, teaches only -> UNANSWERED, teachCrowded 1
//       (teachBefore falls back to teachPicks when unanswered);
//   (8) isSecretOpener (driver helper, unchanged): lead-in confession
//       -> true; other opener -> false; null -> false.
// Analyzer summarizePostSecret (r122 Q2 — what comes after the answer):
//   (9) answered, 3 post-answer turns, one referencing 'read' ->
//       answered 1, median 3, dryFirst 0, referencing 1;
//   (10) first post-answer line is the generic dry line ->
//       dryFirst 1;
//   (11) answered then the sitting ends immediately (no post-answer
//       lines) -> dryFirst 1, turns 0;
//   (12) first post-answer line is a fizzle -> dryFirst 1;
//   (13) unanswered sitting is excluded from the answered count;
//   (14) median across sittings (1 and 3 turns) is 2;
//   (15) the resolve line itself carries no secret stem (it is the
//       answer, not the follow-up) -> referencing 0; a line with
//       'swim' -> referencing 1.
// Panel (real main() on synthetic seed JSONs in a temp dir):
//   (16) THIN panel: 2 answered sittings, median 1 turn, dry-first
//       on both -> Q2-POSTSECRET PANEL says POST-SECRET-THIN and
//       Q1-SECRET PANEL says SECRET-HOLDS;
//   (17) RICH panel: 2 answered sittings, 3 post-answer turns each,
//       referencing lines, no dry-first -> POST-SECRET-RICH.
// RED/FAILURE MODE: (2) fails while addressing counts first-menu-only
// (the r120 rule); (4) fails while teaches after the answer count as
// crowding (the r120 rule); (5) fails while offered-but-unpicked counts
// as addressed (the r120 rule); (9)-(15) fail while post-answer fields
// are not recorded or the dry/stem rules are wrong. Run RED with
// ANALYZER=./analyze-journey-deepening-r120-20261108.js — cases (2),
// (4), (5), (9)-(17) fail there (summarizePostSecret is undefined;
// the old summarizeSecret returns no teachCrowded/wantOpen fields).
const D = require('./journey-deepening-r122-20261109.js');
const A = require(process.env.ANALYZER || './analyze-journey-deepening-r122-20261109.js');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}
function seedJSON(over) {
  const base = { seed: 92001, census: [{ id: 'v_h1' }, { id: 'v_h2' }], deaths: [],
    bond: { tele: [], proposals: [], decisions: [], links: [], sayLines: [], daily: [], convoEvents: [], errors: [] },
    talkReqSnaps: [], langGateOffers: [], langGateDecisions: [],
    langArcSittings: [], langArcDays: [], talkedSittings: [], langGrants: [],
    langArcEnd: { langs: [], learned: {} }, goalSnaps: [], goalLineDays: [],
    goalLines: { counts: {}, total: 0 },
    ladderSnaps: [], trustSnaps: [], trustDeaths: [], secretSittings: [] };
  return Object.assign(base, over || {});
}
function secretSitting(over) {
  const base = { day: 45, vid: 'gen_u3pu7lo', secretLine: '"Can I tell you something? I can\'t read, and I\'m scared it matters now."',
    firstMenu: [{ id: 'dlg:react', label: '"Huh."' }, { id: 'dlg:doubt', label: '"That doesn\'t quite add up."' },
      { id: 'dlg:invite', label: '"Walk with me."' }, { id: 'teach', label: '"Watch — this is useful."' },
      { id: 'dlg:subject', label: '"Can I ask you something else?"' }, { id: 'leave', label: '"I should go."' }],
    picks: ['teach', 'goon', 'teach', 'teach', 'teach', 'teach', 'leave'], teachPicks: 5,
    wantFinal: { id: 'ask_favor', stage: 3, resolution: 'unestablished' },
    answerTurn: null, answerKind: null, postAnswerPicks: [], postAnswerThem: [] };
  return Object.assign(base, over || {});
}

// (1) no secretSittings -> NO-SECRET.
{
  const s = seedJSON();
  const r = A.summarizeSecret(s);
  ok('(1) no sittings -> NO-SECRET', r.verdict === 'NO-SECRET' && r.openers === 0, JSON.stringify(r));
}
// (2) turn-2 answer after a betrayal menu.
{
  const sit = secretSitting({
    firstMenu: [{ id: 'betrayal:accept', label: '"Walk with me?"' }, { id: 'betrayal:decline', label: '"Not now."' }],
    picks: ['betrayal:accept', 'secret:promise', 'dlg:more', 'leave'], teachPicks: 0,
    wantFinal: { id: 'ask_favor', stage: 3, resolution: 'promised' },
    answerTurn: 1, answerKind: 'secret:promise', postAnswerPicks: ['dlg:more', 'leave'], postAnswerThem: ['"The fire feels smaller without Nadia."'] });
  const r = A.summarizeSecret(seedJSON({ secretSittings: [sit] }));
  ok('(2) turn-2 answer counts as addressed', r.addressing === 1 && r.verdict === 'ANSWERED', JSON.stringify(r));
  ok('(2b) turn-2 answer has teachBefore 0', r.detail[0].teachBefore === 0, JSON.stringify(r.detail[0]));
}
// (3) teach twice BEFORE the answer -> teachCrowded.
{
  const sit = secretSitting({ picks: ['teach', 'teach', 'secret:promise', 'leave'], teachPicks: 2,
    wantFinal: { id: 'ask_favor', stage: 3, resolution: 'promised' },
    answerTurn: 2, answerKind: 'secret:promise', postAnswerPicks: ['leave'], postAnswerThem: [] });
  const r = A.summarizeSecret(seedJSON({ secretSittings: [sit] }));
  ok('(3) teach-before-answer crowds', r.teachCrowded === 1 && r.detail[0].teachBefore === 2, JSON.stringify(r));
}
// (4) teach twice AFTER the answer -> NOT teachCrowded.
{
  const sit = secretSitting({ picks: ['secret:promise', 'teach', 'teach', 'leave'], teachPicks: 2,
    wantFinal: { id: 'ask_favor', stage: 3, resolution: 'promised' },
    answerTurn: 0, answerKind: 'secret:promise', postAnswerPicks: ['teach', 'teach', 'leave'], postAnswerThem: ['"Thanks for not looking away."', '"I keep thinking about what you said."'] });
  const r = A.summarizeSecret(seedJSON({ secretSittings: [sit] }));
  ok('(4) teach-after-answer does not crowd', r.teachCrowded === 0 && r.detail[0].teachBefore === 0 && r.teachPicks === 2, JSON.stringify(r));
}
// (5) offered but never picked -> NOT addressed.
{
  const sit = secretSitting({
    firstMenu: [{ id: 'secret:promise', label: '"That stays between us."' }, { id: 'teach', label: '"Watch."' }, { id: 'leave', label: '"I should go."' }],
    picks: ['teach', 'leave'], teachPicks: 1,
    wantFinal: { id: 'ask_favor', stage: 3, resolution: 'unestablished' } });
  const r = A.summarizeSecret(seedJSON({ secretSittings: [sit] }));
  ok('(5) offered-but-unpicked is not addressed', r.addressing === 0 && r.verdict === 'UNANSWERED', JSON.stringify(r));
}
// (6) want split.
{
  const a = secretSitting({ picks: ['secret:promise', 'leave'], teachPicks: 0, wantFinal: { id: 'ask_favor', stage: 3, resolution: 'promised' }, answerTurn: 0, answerKind: 'secret:promise' });
  const b = secretSitting({ day: 60, picks: ['secret:comfort', 'leave'], teachPicks: 0, wantFinal: { id: 'ask_favor', stage: 3, resolution: 'none' }, answerTurn: 0, answerKind: 'secret:comfort' });
  const r = A.summarizeSecret(seedJSON({ secretSittings: [a, b] }));
  ok('(6) want established vs open split', r.wantEstablished === 1 && r.wantOpen === 1, JSON.stringify(r));
}
// (7) never answered, teaches only.
{
  const sit = secretSitting({ picks: ['teach', 'teach', 'leave'], teachPicks: 2 });
  const r = A.summarizeSecret(seedJSON({ secretSittings: [sit] }));
  ok('(7) unanswered teaches-only crowds (fallback)', r.verdict === 'UNANSWERED' && r.teachCrowded === 1, JSON.stringify(r));
}
// (8) isSecretOpener.
{
  ok('(8a) lead-in confession opens', D.isSecretOpener('I feel like — "Can I tell you something? I can\'t read."') === true);
  ok('(8b) other opener does not', D.isSecretOpener('"Hey — I found some blackberry today."') === false);
  ok('(8c) null does not crash', D.isSecretOpener(null) === false);
}
// (9) post-secret rich.
{
  const sit = secretSitting({ picks: ['secret:offer', 'dlg:more', 'dlg:more', 'dlg:more', 'leave'], teachPicks: 0,
    wantFinal: { id: 'ask_favor', stage: 3, resolution: 'promised' },
    answerTurn: 0, answerKind: 'secret:offer', postAnswerPicks: ['dlg:more', 'dlg:more', 'dlg:more', 'leave'],
    postAnswerThem: ['"Would you... teach me? Sometime."', '"I don\'t want to be the one who can\'t read the warnings anymore."', '"When there\'s time. I\'ll hold you to it."'] });
  const r = A.summarizePostSecret(seedJSON({ secretSittings: [sit] }));
  ok('(9) rich post-secret read', r.answered === 1 && r.medianPostAnswerTurns === 3 && r.dryFirst === 0 && r.referencing === 1, JSON.stringify(r));
}
// (10) dry-first.
{
  const sit = secretSitting({ picks: ['secret:promise', 'dlg:more', 'leave'], teachPicks: 0,
    wantFinal: { id: 'ask_favor', stage: 3, resolution: 'unestablished' },
    answerTurn: 0, answerKind: 'secret:promise', postAnswerPicks: ['dlg:more', 'leave'],
    postAnswerThem: ['"That\'s... pretty much all of it, honestly."', '"Well. That\'s where things stand."'] });
  const r = A.summarizePostSecret(seedJSON({ secretSittings: [sit] }));
  ok('(10) dry first line counts', r.dryFirst === 1 && r.medianPostAnswerTurns === 2, JSON.stringify(r));
}
// (11) answered then immediate end.
{
  const sit = secretSitting({ picks: ['secret:promise', 'leave'], teachPicks: 0,
    wantFinal: { id: 'ask_favor', stage: 3, resolution: 'unestablished' },
    answerTurn: 0, answerKind: 'secret:promise', postAnswerPicks: ['leave'], postAnswerThem: [] });
  const r = A.summarizePostSecret(seedJSON({ secretSittings: [sit] }));
  ok('(11) immediate end is dry', r.dryFirst === 1 && r.medianPostAnswerTurns === 0, JSON.stringify(r));
}
// (12) fizzle first.
{
  const sit = secretSitting({ picks: ['secret:promise', 'dlg:more', 'leave'], teachPicks: 0,
    wantFinal: { id: 'ask_favor', stage: 3, resolution: 'unestablished' },
    answerTurn: 0, answerKind: 'secret:promise', postAnswerPicks: ['dlg:more', 'leave'],
    postAnswerThem: ['"...Sorry, lost my train of thought."'] });
  const r = A.summarizePostSecret(seedJSON({ secretSittings: [sit] }));
  ok('(12) fizzle first line counts dry', r.dryFirst === 1, JSON.stringify(r));
}
// (13) unanswered excluded.
{
  const sit = secretSitting({ picks: ['teach', 'leave'], teachPicks: 1 });
  const r = A.summarizePostSecret(seedJSON({ secretSittings: [sit] }));
  ok('(13) unanswered excluded', r.answered === 0 && r.detail.length === 0, JSON.stringify(r));
}
// (14) median across sittings.
{
  const a = secretSitting({ picks: ['secret:promise', 'dlg:more', 'leave'], teachPicks: 0, wantFinal: { id: 'ask_favor', stage: 3, resolution: 'promised' }, answerTurn: 0, answerKind: 'secret:promise', postAnswerPicks: ['dlg:more', 'leave'], postAnswerThem: ['"Thanks."'] });
  const b = secretSitting({ day: 60, picks: ['secret:comfort', 'dlg:more', 'dlg:more', 'dlg:more', 'leave'], teachPicks: 0, wantFinal: { id: 'ask_favor', stage: 3, resolution: 'promised' }, answerTurn: 0, answerKind: 'secret:comfort', postAnswerPicks: ['dlg:more', 'dlg:more', 'dlg:more', 'leave'], postAnswerThem: ['"It helps."', '"Just saying it."', '"Thanks."'] });
  const r = A.summarizePostSecret(seedJSON({ secretSittings: [a, b] }));
  ok('(14) median across sittings is 2', r.medianPostAnswerTurns === 2, JSON.stringify(r));
}
// (15) resolve line has no stem; 'swim' references.
{
  const a = secretSitting({ picks: ['secret:promise', 'dlg:more', 'leave'], teachPicks: 0, wantFinal: { id: 'ask_favor', stage: 3, resolution: 'promised' }, answerTurn: 0, answerKind: 'secret:promise', postAnswerPicks: ['dlg:more', 'leave'], postAnswerThem: ['"Thank you. ...I needed someone to know, and I needed it to stop there."'] });
  const b = secretSitting({ day: 60, secretLine: '"Can I tell you something? I don\'t actually know how to swim and I\'m terrified someone will find out."', picks: ['secret:comfort', 'dlg:more', 'leave'], teachPicks: 0, wantFinal: { id: 'ask_favor', stage: 3, resolution: 'promised' }, answerTurn: 0, answerKind: 'secret:comfort', postAnswerPicks: ['dlg:more', 'leave'], postAnswerThem: ['"The water still scares me. I won\'t go near the deep part — I can\'t swim, and everyone would see."'] });
  const r = A.summarizePostSecret(seedJSON({ secretSittings: [a, b] }));
  ok('(15) resolve line unreferenced, swim line referenced', r.referencing === 1 && r.detail[0].references === false && r.detail[1].references === true, JSON.stringify(r));
}
// (16)/(17) real main() panel verdicts on synthetic seed JSONs.
function runPanel(name, seeds) {
  const dir = fs.mkdtempSync(path.join('/tmp', 'r122-panel-'));
  seeds.forEach((s, i) => fs.writeFileSync(path.join(dir, `journey-deepening-r122-seed${92001 + i}.json`), JSON.stringify(s)));
  const out = execFileSync('node', [path.join(__dirname, 'analyze-journey-deepening-r122-20261109.js'), dir], { encoding: 'utf8' });
  fs.rmSync(dir, { recursive: true, force: true });
  return out;
}
{
  const thin = secretSitting({ picks: ['secret:promise', 'dlg:more', 'leave'], teachPicks: 0, wantFinal: { id: 'ask_favor', stage: 3, resolution: 'promised' }, answerTurn: 0, answerKind: 'secret:promise', postAnswerPicks: ['dlg:more', 'leave'], postAnswerThem: ['"That\'s... pretty much all of it, honestly."'] });
  const thin2 = secretSitting({ day: 60, picks: ['secret:comfort', 'leave'], teachPicks: 0, wantFinal: { id: 'ask_favor', stage: 3, resolution: 'promised' }, answerTurn: 0, answerKind: 'secret:comfort', postAnswerPicks: ['leave'], postAnswerThem: [] });
  const out = runPanel('thin', [seedJSON({ secretSittings: [thin] }), seedJSON({ seed: 92002, secretSittings: [thin2] })]);
  ok('(16) THIN panel verdicts', /Q1-SECRET PANEL:.*SECRET-HOLDS/.test(out) && /Q2-POSTSECRET PANEL:.*POST-SECRET-THIN/.test(out), out.split('\n').filter(l => /PANEL:.*SECRET/.test(l)).join(' | '));
}
{
  const rich = secretSitting({ picks: ['secret:offer', 'dlg:more', 'dlg:more', 'dlg:more', 'leave'], teachPicks: 0, wantFinal: { id: 'ask_favor', stage: 3, resolution: 'promised' }, answerTurn: 0, answerKind: 'secret:offer', postAnswerPicks: ['dlg:more', 'dlg:more', 'dlg:more', 'leave'], postAnswerThem: ['"Would you... teach me? Sometime."', '"I don\'t want to be the one who can\'t read the warnings anymore."', '"When there\'s time."'] });
  const rich2 = secretSitting({ day: 60, secretLine: '"Can I tell you something? I don\'t actually know how to swim."', picks: ['secret:comfort', 'dlg:more', 'dlg:more', 'dlg:more', 'leave'], teachPicks: 0, wantFinal: { id: 'ask_favor', stage: 3, resolution: 'promised' }, answerTurn: 0, answerKind: 'secret:comfort', postAnswerPicks: ['dlg:more', 'dlg:more', 'dlg:more', 'leave'], postAnswerThem: ['"It helps, just saying it out loud."', '"The water still scares me — I can\'t swim."', '"Maybe one day I\'ll learn."'] });
  const out = runPanel('rich', [seedJSON({ secretSittings: [rich] }), seedJSON({ seed: 92002, secretSittings: [rich2] })]);
  ok('(17) RICH panel verdicts', /Q2-POSTSECRET PANEL:.*POST-SECRET-RICH/.test(out), out.split('\n').filter(l => /PANEL:.*SECRET/.test(l)).join(' | '));
}
console.log(`r122 analyzer proof: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
