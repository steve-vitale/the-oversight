'use strict';
// test-journey-deepening-r125-analyzer-20261110.js -- R125 analyzer proof
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
// R124 RED: run with ANALYZER=./analyze-journey-deepening-r122-20261109.js
// — cases (18)-(21) crash (summarizeWantAfterSecret is not a function),
// (22) fails (confrontRides undefined), (23)-(24) fail ('night'/'keep'
// are not stems there), (25) fails (no Q1-WANT / Q2-CONFRONT lines).
// Analyzer summarizeSecretVariety (r125 Q1 — does the confession's own
// reply line repeat verbatim, and does the teach frame repeat?):
//   (26) 3 answered, same promise answerLine -> maxRepeat 3,
//       distinct 1 -> REPETITIVE;
//   (27) 3 answered, 3 distinct answer lines -> VARIED;
//   (28) one sitting, 3 teach lines, same old frame, different plants
//       -> maxSameFrame 3 -> REPETITIVE;
//   (29) teach lines matching no known frame -> unknown:<prefix>,
//       counted as distinct frames, maxSameFrame 1;
//   (30) 1 answered sitting -> THIN-PROBE;
//   (31) answered sitting with no answerLine (foreign driver data) ->
//       NO-DATA.
// Analyzer summarizeWantAfterSecret outcome split (r125 Q2):
//   (32) 2 established, both promised -> outcome LANDS;
//   (33) 2 established, deflected + unresolved -> SURFACES-ONLY;
//   (34) 3 established, promised + deflected + unresolved -> MIXED
//       (landed 1/3, below half).
// Panel (real main() on synthetic seed JSONs in a temp dir):
//   (35) VARIETY + OUTCOME panel lines: 3 answered across 2 seeds
//       sharing one answer line -> Q1-VARIETY PANEL says REPETITIVE;
//   (36) same panel: both wants promised -> Q1-WANT-OUTCOME PANEL
//       says LANDS.
// R125 RED: run with ANALYZER=./analyze-journey-deepening-r124-20261109.js
// — cases (26)-(31) crash (summarizeSecretVariety is not a function),
// (32)-(34) fail (no landed/surfacedOnly/outcome fields), (35)-(36)
// fail (no Q1-VARIETY / Q1-WANT-OUTCOME panel lines).
const D = require('./journey-deepening-r125-20261110.js');
const A = require(process.env.ANALYZER || './analyze-journey-deepening-r125-20261110.js');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}
function seedJSON(over) {
  const base = { seed: 44001, census: [{ id: 'v_h1' }, { id: 'v_h2' }], deaths: [],
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
    wantStart: { id: 'ask_favor', stage: 3, resolution: 'unestablished' },
    wantFinal: { id: 'ask_favor', stage: 3, resolution: 'unestablished' },
    answerTurn: null, answerKind: null, secretMenu: null, confrontOnSecretMenu: false, postAnswerPicks: [], postAnswerThem: [] };
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
  const dir = fs.mkdtempSync(path.join('/tmp', 'r125-panel-'));
  seeds.forEach((s, i) => fs.writeFileSync(path.join(dir, `journey-deepening-r125-seed${45001 + i}.json`), JSON.stringify(s)));
  const out = execFileSync('node', [path.join(__dirname, 'analyze-journey-deepening-r125-20261110.js'), dir], { encoding: 'utf8' });
  fs.rmSync(dir, { recursive: true, force: true });
  return out;
}
{
  const thin = secretSitting({ picks: ['secret:promise', 'dlg:more', 'leave'], teachPicks: 0, wantFinal: { id: 'ask_favor', stage: 3, resolution: 'promised' }, answerTurn: 0, answerKind: 'secret:promise', postAnswerPicks: ['dlg:more', 'leave'], postAnswerThem: ['"That\'s... pretty much all of it, honestly."'] });
  const thin2 = secretSitting({ day: 60, picks: ['secret:comfort', 'leave'], teachPicks: 0, wantFinal: { id: 'ask_favor', stage: 3, resolution: 'promised' }, answerTurn: 0, answerKind: 'secret:comfort', postAnswerPicks: ['leave'], postAnswerThem: [] });
  const out = runPanel('thin', [seedJSON({ secretSittings: [thin] }), seedJSON({ seed: 44002, secretSittings: [thin2] })]);
  ok('(16) THIN panel verdicts', /Q1-SECRET PANEL:.*SECRET-HOLDS/.test(out) && /Q2-POSTSECRET PANEL:.*POST-SECRET-THIN/.test(out), out.split('\n').filter(l => /PANEL:.*SECRET/.test(l)).join(' | '));
}
{
  const rich = secretSitting({ picks: ['secret:offer', 'dlg:more', 'dlg:more', 'dlg:more', 'leave'], teachPicks: 0, wantFinal: { id: 'ask_favor', stage: 3, resolution: 'promised' }, answerTurn: 0, answerKind: 'secret:offer', postAnswerPicks: ['dlg:more', 'dlg:more', 'dlg:more', 'leave'], postAnswerThem: ['"Would you... teach me? Sometime."', '"I don\'t want to be the one who can\'t read the warnings anymore."', '"When there\'s time."'] });
  const rich2 = secretSitting({ day: 60, secretLine: '"Can I tell you something? I don\'t actually know how to swim."', picks: ['secret:comfort', 'dlg:more', 'dlg:more', 'dlg:more', 'leave'], teachPicks: 0, wantFinal: { id: 'ask_favor', stage: 3, resolution: 'promised' }, answerTurn: 0, answerKind: 'secret:comfort', postAnswerPicks: ['dlg:more', 'dlg:more', 'dlg:more', 'leave'], postAnswerThem: ['"It helps, just saying it out loud."', '"The water still scares me — I can\'t swim."', '"Maybe one day I\'ll learn."'] });
  const out = runPanel('rich', [seedJSON({ secretSittings: [rich] }), seedJSON({ seed: 44002, secretSittings: [rich2] })]);
  ok('(17) RICH panel verdicts', /Q2-POSTSECRET PANEL:.*POST-SECRET-RICH/.test(out), out.split('\n').filter(l => /PANEL:.*SECRET/.test(l)).join(' | '));
}
// Analyzer summarizeWantAfterSecret (r124 Q1 — does the want surface
// after the confession is answered):
//   (18) 2 answered, both established, one newly (wantStart
//       unestablished -> wantFinal promised) -> SURFACES, established
//       2, newlyEstablished 1;
//   (19) 2 answered, 0 established -> STAYS-BURIED;
//   (20) 1 answered, established -> THIN-PROBE (pool < 2);
//   (21) wantStart already established -> established 1,
//       newlyEstablished 0.
// Analyzer summarizeSecret confront count (r124 Q2):
//   (22) secretMenu carrying a confront:* id -> confrontRides 1;
//       a secret menu without one -> 0.
// Analyzer stem widening (r124 instrument — night + kept-secret
// follow-up lines must count as referencing):
//   (23) night follow-up "The nights are still long..." ->
//       referencing 1;
//   (24) kept-secret follow-up "I still keep it to myself..." ->
//       referencing 1.
// Panel (real main() on synthetic seed JSONs in a temp dir):
//   (25) WANT panel: 2 answered, 1 established -> Q1-WANT PANEL says
//       SURFACES and Q2-CONFRONT PANEL counts the riding confront.
// RED/FAILURE MODE: (18)-(25) fail on the r122 analyzer
// (summarizeWantAfterSecret is not a function; confrontRides is
// undefined; 'night'/'keep' are not stems — the night and kept-secret
// follow-up lines read unreferenced there).
{
  const a = secretSitting({ picks: ['secret:promise', 'dlg:more', 'leave'], teachPicks: 0,
    wantStart: { id: 'seek_taken', stage: 3, resolution: 'unestablished' },
    wantFinal: { id: 'seek_taken', stage: 3, resolution: 'promised' },
    answerTurn: 0, answerKind: 'secret:promise', postAnswerPicks: ['dlg:more', 'leave'], postAnswerThem: ['"Thanks."'] });
  const b = secretSitting({ day: 60, picks: ['secret:comfort', 'dlg:more', 'leave'], teachPicks: 0,
    wantStart: { id: 'ask_favor', stage: 3, resolution: 'promised' },
    wantFinal: { id: 'ask_favor', stage: 3, resolution: 'promised' },
    answerTurn: 0, answerKind: 'secret:comfort', postAnswerPicks: ['dlg:more', 'leave'], postAnswerThem: ['"It helps."'] });
  const r = A.summarizeWantAfterSecret(seedJSON({ secretSittings: [a, b] }));
  ok('(18) want surfaces on both answered', r.verdict === 'SURFACES' && r.established === 2 && r.newlyEstablished === 1, JSON.stringify(r));
}
{
  const a = secretSitting({ picks: ['secret:promise', 'leave'], teachPicks: 0,
    wantStart: { id: 'seek_taken', stage: 3, resolution: 'unestablished' },
    wantFinal: { id: 'seek_taken', stage: 3, resolution: 'unestablished' },
    answerTurn: 0, answerKind: 'secret:promise', postAnswerPicks: ['leave'], postAnswerThem: [] });
  const b = secretSitting({ day: 60, picks: ['secret:comfort', 'leave'], teachPicks: 0,
    wantStart: { id: 'ask_favor', stage: 3, resolution: 'unestablished' },
    wantFinal: { id: 'ask_favor', stage: 3, resolution: 'none' },
    answerTurn: 0, answerKind: 'secret:comfort', postAnswerPicks: ['leave'], postAnswerThem: [] });
  const r = A.summarizeWantAfterSecret(seedJSON({ secretSittings: [a, b] }));
  ok('(19) want stays buried on both answered', r.verdict === 'STAYS-BURIED' && r.established === 0, JSON.stringify(r));
}
{
  const a = secretSitting({ picks: ['secret:promise', 'leave'], teachPicks: 0,
    wantStart: { id: 'ask_favor', stage: 3, resolution: 'unestablished' },
    wantFinal: { id: 'ask_favor', stage: 3, resolution: 'promised' },
    answerTurn: 0, answerKind: 'secret:promise', postAnswerPicks: ['leave'], postAnswerThem: [] });
  const r = A.summarizeWantAfterSecret(seedJSON({ secretSittings: [a] }));
  ok('(20) one answered sitting is a thin probe', r.verdict === 'THIN-PROBE' && r.established === 1, JSON.stringify(r));
}
{
  const a = secretSitting({ picks: ['secret:promise', 'leave'], teachPicks: 0,
    wantStart: { id: 'ask_favor', stage: 3, resolution: 'promised' },
    wantFinal: { id: 'ask_favor', stage: 3, resolution: 'promised' },
    answerTurn: 0, answerKind: 'secret:promise', postAnswerPicks: ['leave'], postAnswerThem: [] });
  const b = secretSitting({ day: 60, picks: ['secret:comfort', 'leave'], teachPicks: 0,
    wantStart: { id: 'ask_favor', stage: 3, resolution: 'unestablished' },
    wantFinal: { id: 'ask_favor', stage: 3, resolution: 'unestablished' },
    answerTurn: 0, answerKind: 'secret:comfort', postAnswerPicks: ['leave'], postAnswerThem: [] });
  const r = A.summarizeWantAfterSecret(seedJSON({ secretSittings: [a, b] }));
  ok('(21) already-established want is not newly established', r.established === 1 && r.newlyEstablished === 0 && r.verdict === 'SURFACES', JSON.stringify(r));
}
{
  const withConfront = secretSitting({ picks: ['secret:promise', 'leave'], teachPicks: 0,
    wantFinal: { id: 'ask_favor', stage: 3, resolution: 'promised' },
    answerTurn: 0, answerKind: 'secret:promise',
    secretMenu: [{ id: 'secret:promise', label: '"That stays between us."' }, { id: 'confront:d_abc1234', label: '"You told me one thing, then another."' }, { id: 'leave', label: '"I should go."' }],
    confrontOnSecretMenu: true });
  const withoutConfront = secretSitting({ day: 60, picks: ['secret:comfort', 'leave'], teachPicks: 0,
    wantFinal: { id: 'ask_favor', stage: 3, resolution: 'promised' },
    answerTurn: 0, answerKind: 'secret:comfort',
    secretMenu: [{ id: 'secret:comfort', label: '"Thank you for trusting me."' }, { id: 'leave', label: '"I should go."' }],
    confrontOnSecretMenu: false });
  const r = A.summarizeSecret(seedJSON({ secretSittings: [withConfront, withoutConfront] }));
  ok('(22) confront riding the secret menu is counted', r.confrontRides === 1 && r.detail[0].confrontOnSecretMenu === true && r.detail[1].confrontOnSecretMenu === false, JSON.stringify(r));
}
{
  const night = secretSitting({ secretLine: '"Can I tell you something? At night I cry quietly so no one hears."', picks: ['secret:promise', 'dlg:more', 'leave'], teachPicks: 0,
    wantFinal: { id: 'ask_favor', stage: 3, resolution: 'promised' },
    answerTurn: 0, answerKind: 'secret:promise', postAnswerPicks: ['dlg:more', 'leave'],
    postAnswerThem: ['"The nights are still long. But it\'s easier, now that someone knows."'] });
  const r = A.summarizePostSecret(seedJSON({ secretSittings: [night] }));
  ok('(23) night follow-up counts as referencing', r.referencing === 1 && r.detail[0].references === true, JSON.stringify(r));
}
{
  const kept = secretSitting({ secretLine: '"Can I tell you something? I stole medicine from the stash once and never confessed."', picks: ['secret:promise', 'dlg:more', 'leave'], teachPicks: 0,
    wantFinal: { id: 'ask_favor', stage: 3, resolution: 'promised' },
    answerTurn: 0, answerKind: 'secret:promise', postAnswerPicks: ['dlg:more', 'leave'],
    postAnswerThem: ['"I still keep it to myself. But it doesn\'t sit quite so heavy, now that someone knows I\'m keeping it."'] });
  const r = A.summarizePostSecret(seedJSON({ secretSittings: [kept] }));
  ok('(24) kept-secret follow-up counts as referencing', r.referencing === 1 && r.detail[0].references === true, JSON.stringify(r));
}
{
  const w1 = secretSitting({ picks: ['secret:promise', 'dlg:more', 'leave'], teachPicks: 0,
    wantStart: { id: 'seek_taken', stage: 3, resolution: 'unestablished' },
    wantFinal: { id: 'seek_taken', stage: 3, resolution: 'promised' },
    answerTurn: 0, answerKind: 'secret:promise', postAnswerPicks: ['dlg:more', 'leave'], postAnswerThem: ['"Thanks."'],
    secretMenu: [{ id: 'secret:promise', label: '"That stays between us."' }, { id: 'confront:d_abc1234', label: '"You told me one thing, then another."' }, { id: 'leave', label: '"I should go."' }],
    confrontOnSecretMenu: true });
  const w2 = secretSitting({ day: 60, picks: ['secret:comfort', 'leave'], teachPicks: 0,
    wantStart: { id: 'ask_favor', stage: 3, resolution: 'unestablished' },
    wantFinal: { id: 'ask_favor', stage: 3, resolution: 'unestablished' },
    answerTurn: 0, answerKind: 'secret:comfort', postAnswerPicks: ['leave'], postAnswerThem: [] });
  const out = runPanel('want', [seedJSON({ secretSittings: [w1] }), seedJSON({ seed: 44002, secretSittings: [w2] })]);
  ok('(25) WANT + CONFRONT panel lines', /Q1-WANT PANEL:.*SURFACES/.test(out) && /Q2-CONFRONT PANEL:.*confrontRides=1/.test(out), out.split('\n').filter(l => /Q1-WANT PANEL|Q2-CONFRONT PANEL/.test(l)).join(' | '));
}
// R125 A1 TEACHFRAME cases (37)-(40): panel-wide transcript scan.
//   (37) one sitting, 3x the old frame (different plants) -> REPETITIVE;
//   (38) one sitting, 2x the old frame -> VARIED (max same-frame 2);
//   (39) no teach-frame lines at all -> NO-FRAMES;
//   (40) real main() panel line: a temp dir with a transcript carrying
//       3x the old frame -> Q1-TEACHFRAME PANEL says REPETITIVE.
// RED/FAILURE MODE: (37)-(40) fail on the r124 analyzer
// (summarizeTeachFrames is not a function; no TEACHFRAME panel line).
{
  const t = { seed: '45011', day: 80, vid: 'desmond_clarke', text: [
    '=== seed 45011 day 80 — conversation with Desmond (desmond_clarke) ===',
    'THEM: "This one — Tucumã. Leaf, stem, smell. You won\'t forget it now."',
    'THEM: "This one — American Persimmon. Leaf, stem, smell. You won\'t forget it now."',
    'THEM: "This one — Inajá. Leaf, stem, smell. You won\'t forget it now."',
  ].join('\n') };
  const r = A.summarizeTeachFrames([t]);
  ok('(37) same teach frame 3x in one sitting is repetitive', r.verdict === 'REPETITIVE' && r.frames === 3 && r.maxSameFrame === 3 && r.distinctFrames === 1, JSON.stringify(r));
}
{
  const t = { seed: '45011', day: 80, vid: 'desmond_clarke', text: [
    'THEM: "This one — Tucumã. Leaf, stem, smell. You won\'t forget it now."',
    'THEM: "This one — American Persimmon. Leaf, stem, smell. You won\'t forget it now."',
    'THEM: "Something else entirely."',
  ].join('\n') };
  const r = A.summarizeTeachFrames([t]);
  ok('(38) same teach frame 2x is varied', r.verdict === 'VARIED' && r.frames === 2 && r.maxSameFrame === 2, JSON.stringify(r));
}
{
  const t = { seed: '45011', day: 80, vid: 'desmond_clarke', text: 'THEM: "Something else entirely."\nTHEM: "And another line."\n' };
  const r = A.summarizeTeachFrames([t]);
  ok('(39) no teach frames is no-frames', r.verdict === 'NO-FRAMES' && r.frames === 0, JSON.stringify(r));
}
{
  const dir = fs.mkdtempSync(path.join('/tmp', 'r125-teachframe-'));
  fs.writeFileSync(path.join(dir, 'journey-deepening-r125-seed45011.json'), JSON.stringify(seedJSON({ seed: 45011 })));
  fs.writeFileSync(path.join(dir, 'journey-deepening-r125-transcript-45011-day80-desmond_clarke.txt'), [
    '=== seed 45011 day 80 — conversation with Desmond (desmond_clarke) ===',
    'THEM: "This one — Tucumã. Leaf, stem, smell. You won\'t forget it now."',
    'THEM: "This one — American Persimmon. Leaf, stem, smell. You won\'t forget it now."',
    'THEM: "This one — Inajá. Leaf, stem, smell. You won\'t forget it now."',
  ].join('\n'));
  const out = execFileSync('node', [path.join(__dirname, 'analyze-journey-deepening-r125-20261110.js'), dir], { encoding: 'utf8' });
  fs.rmSync(dir, { recursive: true, force: true });
  ok('(40) TEACHFRAME panel line says repetitive', /Q1-TEACHFRAME PANEL:.*frames=3.*maxSameFrame=3.*REPETITIVE/.test(out), out.split('\n').filter(l => /TEACHFRAME PANEL/.test(l)).join(' | '));
}
// R125 fix-variant frame cases (41)-(42): the analyzer must normalize the
// three NEW teach frames the fix adds, not read them as unknown.
//   (41) teachFrameId maps each new frame shape to its id;
//   (42) a sitting with one of each new frame -> distinct 3, VARIED.
{
  ok('(41) new teach frames normalize to their ids',
    A.teachFrameId('"Mugwort — crush the leaf, smell it, taste the stem. That\'s how you know it."') === 'teachplant-crushtaste' &&
    A.teachFrameId('"This one is Yarrow. Look at the leaf, feel the stem, breathe it in. It\'ll stick."') === 'teachplant-lookfeel' &&
    A.teachFrameId('"Chicory. Remember the leaf, the stem, the smell — that\'s the whole of it."') === 'teachplant-remember',
    JSON.stringify([A.teachFrameId('"Mugwort — crush the leaf, smell it, taste the stem. That\'s how you know it."')]));
}
{
  const t = { seed: '45011', day: 80, vid: 'desmond_clarke', text: [
    'THEM: "This one — Tucumã. Leaf, stem, smell. You won\'t forget it now."',
    'THEM: "Mugwort — crush the leaf, smell it, taste the stem. That\'s how you know it."',
    'THEM: "This one is Yarrow. Look at the leaf, feel the stem, breathe it in. It\'ll stick."',
    'THEM: "Chicory. Remember the leaf, the stem, the smell — that\'s the whole of it."',
  ].join('\n') };
  const r = A.summarizeTeachFrames([t]);
  ok('(42) one of each frame is varied, not unknown', r.verdict === 'VARIED' && r.frames === 4 && r.distinctFrames === 4 && r.maxSameFrame === 1, JSON.stringify(r));
}
console.log(`r125 analyzer proof: ${pass} passed, ${fail} failed`);
// R125 Q1-VARIETY cases (26)-(31). The promise answer line below is the
// engine's current fixed sentence (conversation.js); the teach lines use
// the current fixed frame with different plants swapped in.
const PROMISE_LINE = '"Thank you. ...I needed someone to know, and I needed it to stop there."';
const COMFORT_LINE = '"It helps, just saying it out loud. ...Thanks for not looking away."';
const TEACH_FRAME = (plant) => `"This one — ${plant}. Leaf, stem, smell. You won't forget it now."`;
{
  const mk = (day, line) => secretSitting({ day, picks: ['secret:promise', 'leave'], teachPicks: 0,
    wantFinal: { id: 'ask_favor', stage: 3, resolution: 'promised' },
    answerTurn: 0, answerKind: 'secret:promise', answerLine: line, teachLines: [], postAnswerPicks: ['leave'], postAnswerThem: [] });
  const r = A.summarizeSecretVariety(seedJSON({ secretSittings: [mk(45, PROMISE_LINE), mk(60, PROMISE_LINE), mk(80, PROMISE_LINE)] }));
  ok('(26) same promise line 3x is repetitive', r.verdict === 'REPETITIVE' && r.maxRepeat === 3 && r.distinctAnswers === 1, JSON.stringify(r));
}
{
  const mk = (day, line) => secretSitting({ day, picks: ['secret:promise', 'leave'], teachPicks: 0,
    wantFinal: { id: 'ask_favor', stage: 3, resolution: 'promised' },
    answerTurn: 0, answerKind: 'secret:promise', answerLine: line, teachLines: [], postAnswerPicks: ['leave'], postAnswerThem: [] });
  const r = A.summarizeSecretVariety(seedJSON({ secretSittings: [mk(45, PROMISE_LINE), mk(60, COMFORT_LINE), mk(80, '"Just knowing someone knows helps."')] }));
  ok('(27) three distinct answer lines is varied', r.verdict === 'VARIED' && r.maxRepeat === 1 && r.distinctAnswers === 3, JSON.stringify(r));
}
{
  const sit = secretSitting({ picks: ['secret:promise', 'teach', 'teach', 'teach', 'leave'], teachPicks: 3,
    wantFinal: { id: 'ask_favor', stage: 3, resolution: 'promised' },
    answerTurn: 0, answerKind: 'secret:promise', answerLine: PROMISE_LINE,
    teachLines: [TEACH_FRAME('yarrow'), TEACH_FRAME('mugwort'), TEACH_FRAME('chicory')],
    postAnswerPicks: ['teach', 'teach', 'teach', 'leave'], postAnswerThem: [] });
  const r = A.summarizeSecretVariety(seedJSON({ secretSittings: [sit, secretSitting({ day: 60, picks: ['secret:comfort', 'leave'], teachPicks: 0, wantFinal: { id: 'ask_favor', stage: 3, resolution: 'promised' }, answerTurn: 0, answerKind: 'secret:comfort', answerLine: COMFORT_LINE, teachLines: [] })] }));
  ok('(28) same teach frame 3x in one sitting is repetitive', r.verdict === 'REPETITIVE' && r.maxSameFrame === 3 && r.teachFramesDistinct === 1, JSON.stringify(r));
}
{
  const sit = secretSitting({ picks: ['secret:promise', 'teach', 'teach', 'leave'], teachPicks: 2,
    wantFinal: { id: 'ask_favor', stage: 3, resolution: 'promised' },
    answerTurn: 0, answerKind: 'secret:promise', answerLine: PROMISE_LINE,
    teachLines: ['"Yarrow — crush the leaf, smell it. That is how you know it."', '"Mugwort. Remember the leaf, the stem, the smell — that is the whole of it."'],
    postAnswerPicks: ['teach', 'teach', 'leave'], postAnswerThem: [] });
  const r = A.summarizeSecretVariety(seedJSON({ secretSittings: [sit, secretSitting({ day: 60, picks: ['secret:comfort', 'leave'], teachPicks: 0, wantFinal: { id: 'ask_favor', stage: 3, resolution: 'promised' }, answerTurn: 0, answerKind: 'secret:comfort', answerLine: COMFORT_LINE, teachLines: [] })] }));
  ok('(29) unknown teach frames count as distinct frames', r.teachFramesDistinct === 2 && r.maxSameFrame === 1 && r.detail[0].teachFrames[0].indexOf('unknown:') === 0, JSON.stringify(r));
}
{
  const sit = secretSitting({ picks: ['secret:promise', 'leave'], teachPicks: 0,
    wantFinal: { id: 'ask_favor', stage: 3, resolution: 'promised' },
    answerTurn: 0, answerKind: 'secret:promise', answerLine: PROMISE_LINE, teachLines: [], postAnswerPicks: ['leave'], postAnswerThem: [] });
  const r = A.summarizeSecretVariety(seedJSON({ secretSittings: [sit] }));
  ok('(30) one answered sitting is a thin probe', r.verdict === 'THIN-PROBE' && r.answered === 1, JSON.stringify(r));
}
{
  const a = secretSitting({ picks: ['secret:promise', 'leave'], teachPicks: 0,
    wantFinal: { id: 'ask_favor', stage: 3, resolution: 'promised' },
    answerTurn: 0, answerKind: 'secret:promise', postAnswerPicks: ['leave'], postAnswerThem: [] });
  const b = secretSitting({ day: 60, picks: ['secret:comfort', 'leave'], teachPicks: 0,
    wantFinal: { id: 'ask_favor', stage: 3, resolution: 'promised' },
    answerTurn: 0, answerKind: 'secret:comfort', postAnswerPicks: ['leave'], postAnswerThem: [] });
  const r = A.summarizeSecretVariety(seedJSON({ secretSittings: [a, b] }));
  ok('(31) answered sitting without an answerLine is no-data', r.verdict === 'NO-DATA' && r.missingAnswer === 2, JSON.stringify(r));
}
// R125 Q2-WANT-OUTCOME cases (32)-(34).
{
  const a = secretSitting({ picks: ['secret:promise', 'leave'], teachPicks: 0,
    wantStart: { id: 'seek_taken', stage: 3, resolution: 'unestablished' },
    wantFinal: { id: 'seek_taken', stage: 3, resolution: 'promised' },
    answerTurn: 0, answerKind: 'secret:promise', postAnswerPicks: ['leave'], postAnswerThem: [] });
  const b = secretSitting({ day: 60, picks: ['secret:comfort', 'leave'], teachPicks: 0,
    wantStart: { id: 'ask_favor', stage: 3, resolution: 'unestablished' },
    wantFinal: { id: 'ask_favor', stage: 3, resolution: 'stated' },
    answerTurn: 0, answerKind: 'secret:comfort', postAnswerPicks: ['leave'], postAnswerThem: [] });
  const r = A.summarizeWantAfterSecret(seedJSON({ secretSittings: [a, b] }));
  ok('(32) both established wants land', r.outcome === 'LANDS' && r.landed === 2 && r.surfacedOnly === 0, JSON.stringify(r));
}
{
  const a = secretSitting({ picks: ['secret:promise', 'leave'], teachPicks: 0,
    wantStart: { id: 'seek_taken', stage: 3, resolution: 'unestablished' },
    wantFinal: { id: 'seek_taken', stage: 3, resolution: 'deflected' },
    answerTurn: 0, answerKind: 'secret:promise', postAnswerPicks: ['leave'], postAnswerThem: [] });
  const b = secretSitting({ day: 60, picks: ['secret:comfort', 'leave'], teachPicks: 0,
    wantStart: { id: 'ask_favor', stage: 3, resolution: 'unestablished' },
    wantFinal: { id: 'ask_favor', stage: 3, resolution: 'unresolved' },
    answerTurn: 0, answerKind: 'secret:comfort', postAnswerPicks: ['leave'], postAnswerThem: [] });
  const r = A.summarizeWantAfterSecret(seedJSON({ secretSittings: [a, b] }));
  ok('(33) established but refused/unresolved only surfaces', r.outcome === 'SURFACES-ONLY' && r.landed === 0 && r.surfacedOnly === 2, JSON.stringify(r));
}
{
  const mk = (day, res) => secretSitting({ day, picks: ['secret:promise', 'leave'], teachPicks: 0,
    wantStart: { id: 'ask_favor', stage: 3, resolution: 'unestablished' },
    wantFinal: { id: 'ask_favor', stage: 3, resolution: res },
    answerTurn: 0, answerKind: 'secret:promise', postAnswerPicks: ['leave'], postAnswerThem: [] });
  const r = A.summarizeWantAfterSecret(seedJSON({ secretSittings: [mk(45, 'promised'), mk(60, 'deflected'), mk(80, 'unresolved')] }));
  ok('(34) one of three established landing is mixed', r.outcome === 'MIXED' && r.landed === 1 && r.surfacedOnly === 2, JSON.stringify(r));
}
// R125 panel cases (35)-(36): real main() on synthetic seed JSONs.
{
  const mk = (day, line) => secretSitting({ day, picks: ['secret:promise', 'leave'], teachPicks: 0,
    wantStart: { id: 'ask_favor', stage: 3, resolution: 'unestablished' },
    wantFinal: { id: 'ask_favor', stage: 3, resolution: 'promised' },
    answerTurn: 0, answerKind: 'secret:promise', answerLine: line, teachLines: [], postAnswerPicks: ['leave'], postAnswerThem: [] });
  const out = runPanel('variety', [
    seedJSON({ secretSittings: [mk(45, PROMISE_LINE), mk(60, PROMISE_LINE)] }),
    seedJSON({ seed: 45002, secretSittings: [mk(80, PROMISE_LINE)] }),
  ]);
  ok('(35) VARIETY panel line says repetitive', /Q1-VARIETY PANEL:.*maxRepeat=3.*REPETITIVE/.test(out), out.split('\n').filter(l => /Q1-VARIETY PANEL/.test(l)).join(' | '));
  ok('(36) WANT-OUTCOME panel line says lands', /Q1-WANT-OUTCOME PANEL:.*landed=3.*LANDS/.test(out), out.split('\n').filter(l => /Q1-WANT-OUTCOME PANEL/.test(l)).join(' | '));
}
console.log(`r125 analyzer proof: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
