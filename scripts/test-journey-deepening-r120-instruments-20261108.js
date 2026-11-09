'use strict';
// test-journey-deepening-r120-instruments-20261108.js -- R120 instrument proof
// (runs the REAL driver helpers + analyzer on synthetic inputs).
// Driver helper isSecretOpener (pure, r120):
//   (1) the confession line (every secret variant carries the phrase;
//       a voiceLine lead-in may precede it) -> true; (1b) lead-in
//       confessions -> true;
//   (2) any other opener line -> false;
//   (3) null / non-string -> false (never a crash).
// Analyzer summarizeSecret (synthetic seed JSONs):
//   (4) no secretSittings -> NO-SECRET, openers 0;
//   (5) the Exaucee shape — opener, first menu with no secret: id,
//       teachPicks 5, wantFinal resolution 'unestablished' ->
//       UNANSWERED, crowded 1, wantEstablished 0;
//   (6) a first menu offering secret:promise -> ANSWERED, addressing 1;
//   (7) teachPicks 1 + want established (resolution 'promised') -> NOT
//       crowded; teachPicks 2 + established -> crowded (teach clause);
//   (8) wantFinal resolution 'none' -> not established; 'promised' ->
//       established.
// Analyzer summarizeLadder, r120 additions (synthetic seed JSONs):
//   (9) peak 3, last 3 -> holds true; (10) peak 3, last 2 -> holds
//       false (a stage drop at the horizon);
//   (11) first snap day 14 at stage 1 -> firstStageDay 14, OPENS (the
//       uncensored read — r119's day-40 first snap could not see this).
// RED/FAILURE MODE: (1) fails while the opener detector matches the
// wrong prefix (or misses the quote); (5) fails while the addressing
// check counts generic dlg:react as an answer; (6) fails while a
// secret: id is not recognized; (9)/(10) fail while holds is not
// computed; (11) fails while firstStageDay is censored at the first
// snap. The r119 driver/analyzer lack isSecretOpener/summarizeSecret
// entirely (verified: both are undefined there), so every secret
// assertion is RED on the old code.
const D = require('./journey-deepening-r120-20261108.js');
const A = require('./analyze-journey-deepening-r120-20261108.js');
let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}
function seedJSON(over) {
  const base = { seed: 96801, census: [{ id: 'v_h1' }, { id: 'v_h2' }], deaths: [],
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
    wantFinal: { id: 'ask_favor', stage: 3, resolution: 'unestablished' } };
  return Object.assign(base, over || {});
}
function ladderSnap(day, stage, counted, cap, countedTracks, nextThreshold, peakStage) {
  return { day, stage, peakStage: peakStage == null ? stage : peakStage, counted, cap,
    tracks: { fight: 0, forage: 0, craft: 0, talk: 0, explore: 0 },
    countedTracks: countedTracks || { fight: 0, forage: 0, craft: 0, talk: 0, explore: 0 },
    capped: [], shortfall: nextThreshold == null ? null : nextThreshold - counted, nextThreshold,
    detail: {} };
}

// (1) The confession line is a secret opener (all six secret variants
// share the phrase — the line is built as '"Can I tell you something? '
// + secret in conversation.js). CONTAINS, not starts-with: voiceLine
// prepends a discourse lead-in before the confession (r120 proof-test
// debug), so the phrase sits mid-line.
{
  ok('SECRET-OPENER (1) literacy confession detected',
    D.isSecretOpener('"Can I tell you something? I can\'t read, and I\'m scared it matters now."') === true);
  ok('SECRET-OPENER (1) swim confession detected',
    D.isSecretOpener('"Can I tell you something? I don\'t actually know how to swim and I\'m terrified someone will find out."') === true);
  ok('SECRET-OPENER (1) medicine confession detected',
    D.isSecretOpener('"Can I tell you something? I stole medicine from the stash once and never confessed."') === true);
  ok('SECRET-OPENER (1b) lead-in confession detected ("I feel like — ")',
    D.isSecretOpener('"I feel like — Can I tell you something? I can\'t read, and I\'m scared it matters now."') === true);
  ok('SECRET-OPENER (1b) lead-in confession detected ("Mm. ")',
    D.isSecretOpener('"Mm. Can I tell you something? I stole medicine from the stash once and never confessed."') === true);
}
// (2) Other opener lines are not secret openers.
{
  ok('SECRET-OPENER (2) taught-plant opener is not a secret',
    D.isSecretOpener('"Hey — I found some Lamb\'s Quarters today. You were right, it was right where you said."') === false);
  ok('SECRET-OPENER (2) want opener is not a secret',
    D.isSecretOpener('"I\'m running low on bandages. It\'s the kind of thing you don\'t miss until it\'s gone."') === false);
  ok('SECRET-OPENER (2) a bare question is not a secret',
    D.isSecretOpener('"Can I ask you something?"') === false);
}
// (3) Null / non-string never crashes, never matches.
{
  let threw = false, r1 = null, r2 = null;
  try { r1 = D.isSecretOpener(null); r2 = D.isSecretOpener(42); } catch (e) { threw = true; }
  ok('SECRET-OPENER (3) null/non-string safe + false', !threw && r1 === false && r2 === false, JSON.stringify([r1, r2]));
}
// (4) No secret sittings -> NO-SECRET.
{
  const r = A.summarizeSecret(seedJSON({}));
  ok('Q1-SECRET (4) verdict NO-SECRET with no openers', r.verdict === 'NO-SECRET', r.verdict);
  ok('Q1-SECRET (4) openers 0', r.openers === 0, JSON.stringify(r));
}
// (5) The Exaucee shape: opener, no addressing choice, 5 teaches,
// want unestablished -> UNANSWERED + CROWDED.
{
  const r = A.summarizeSecret(seedJSON({ secretSittings: [secretSitting({})] }));
  ok('Q1-SECRET (5) verdict UNANSWERED', r.verdict === 'UNANSWERED', r.verdict);
  ok('Q1-SECRET (5) addressing 0 despite dlg:react offered', r.addressing === 0, JSON.stringify(r));
  ok('Q1-SECRET (5) teach flood counted', r.teachPicks === 5, JSON.stringify(r));
  ok('Q1-SECRET (5) want not established', r.wantEstablished === 0, JSON.stringify(r));
  ok('Q1-SECRET (5) sitting crowded', r.crowded === 1 && r.detail[0].crowded === true, JSON.stringify(r.detail));
}
// (6) A first menu offering secret:promise -> ANSWERED.
{
  const sitting = secretSitting({ firstMenu: [
    { id: 'secret:promise', label: '"That stays between us."' },
    { id: 'secret:comfort', label: '"Thank you for trusting me with that."' },
    { id: 'secret:offer', label: '"Is there anything I can do?"' },
    { id: 'secret:silence', label: '(say nothing — just sit with them)' },
    { id: 'deflect', label: '(change the subject)' },
    { id: 'leave', label: '"I should go."' }],
    picks: ['secret:promise'], teachPicks: 0,
    wantFinal: { id: 'ask_favor', stage: 3, resolution: 'promised' } });
  const r = A.summarizeSecret(seedJSON({ secretSittings: [sitting] }));
  ok('Q1-SECRET (6) verdict ANSWERED', r.verdict === 'ANSWERED', r.verdict);
  ok('Q1-SECRET (6) addressing 1', r.addressing === 1, JSON.stringify(r));
  ok('Q1-SECRET (6) answered sitting not crowded', r.crowded === 0 && r.wantEstablished === 1, JSON.stringify(r.detail));
}
// (7) Crowded is teach>=2 OR want unestablished — each clause alone.
{
  const establishedOneTeach = secretSitting({ teachPicks: 1, picks: ['teach', 'leave'],
    wantFinal: { id: 'ask_favor', stage: 3, resolution: 'promised' } });
  const r1 = A.summarizeSecret(seedJSON({ secretSittings: [establishedOneTeach] }));
  ok('Q1-SECRET (7) 1 teach + established -> NOT crowded', r1.crowded === 0, JSON.stringify(r1.detail));
  const establishedTwoTeach = secretSitting({ teachPicks: 2, picks: ['teach', 'teach', 'leave'],
    wantFinal: { id: 'ask_favor', stage: 3, resolution: 'promised' } });
  const r2 = A.summarizeSecret(seedJSON({ secretSittings: [establishedTwoTeach] }));
  ok('Q1-SECRET (7) 2 teaches + established -> crowded (teach clause)', r2.crowded === 1, JSON.stringify(r2.detail));
}
// (8) Want establishment reads the resolution, not the stage.
{
  const rNone = A.summarizeSecret(seedJSON({ secretSittings: [secretSitting({
    teachPicks: 0, picks: ['leave'], wantFinal: { id: 'ask_favor', stage: 0, resolution: 'none' } })] }));
  ok('Q1-SECRET (8) resolution none -> not established', rNone.wantEstablished === 0, JSON.stringify(rNone.detail));
  const rProm = A.summarizeSecret(seedJSON({ secretSittings: [secretSitting({
    teachPicks: 0, picks: ['leave'], wantFinal: { id: 'ask_favor', stage: 3, resolution: 'promised' } })] }));
  ok('Q1-SECRET (8) resolution promised -> established', rProm.wantEstablished === 1, JSON.stringify(rProm.detail));
}
// (9) holds: peak == last -> true.
{
  const s = seedJSON({ ladderSnaps: [
    ladderSnap(14, 1, 13, 7, { fight: 2, forage: 3, craft: 2, talk: 3, explore: 3 }, 26),
    ladderSnap(40, 3, 46, 24, { fight: 5, forage: 21, craft: 12, talk: 16, explore: 24 }, 40, 3),
    ladderSnap(80, 3, 62, 24, { fight: 5, forage: 21, craft: 12, talk: 16, explore: 24 }, 40, 3),
  ] });
  const r = A.summarizeLadder(s);
  ok('Q2-LADDER (9) holds when last == peak', r.holds === true, JSON.stringify(r));
}
// (10) holds: peak 3, last 2 -> false.
{
  const s = seedJSON({ ladderSnaps: [
    ladderSnap(14, 1, 13, 7, { fight: 2, forage: 3, craft: 2, talk: 3, explore: 3 }, 26),
    ladderSnap(40, 3, 46, 24, { fight: 5, forage: 21, craft: 12, talk: 16, explore: 24 }, 40, 3),
    ladderSnap(80, 2, 37, 24, { fight: 5, forage: 16, craft: 7, talk: 9, explore: 23 }, 40, 3),
  ] });
  const r = A.summarizeLadder(s);
  ok('Q2-LADDER (10) no hold when last < peak', r.holds === false, JSON.stringify(r));
  ok('Q2-LADDER (10) the drop is still recorded', r.stageDrops.length === 1 && r.stageDrops[0].day === 80, JSON.stringify(r.stageDrops));
}
// (11) First snap day 14 at stage 1 -> firstStageDay 14, OPENS.
{
  const s = seedJSON({ ladderSnaps: [
    ladderSnap(14, 1, 13, 7, { fight: 2, forage: 3, craft: 2, talk: 3, explore: 3 }, 26),
    ladderSnap(40, 2, 34, 24, { fight: 5, forage: 16, craft: 7, talk: 9, explore: 23 }, 40),
    ladderSnap(80, 3, 62, 24, { fight: 5, forage: 21, craft: 12, talk: 16, explore: 24 }, 40),
  ] });
  const r = A.summarizeLadder(s);
  ok('Q2-LADDER (11) firstStageDay 14 (uncensored)', r.firstStageDay === 14, JSON.stringify(r));
  ok('Q2-LADDER (11) verdict OPENS', r.verdict === 'OPENS', r.verdict);
}
console.log(fail === 0 ? `R120 instruments: ${pass} passed` : `R120 instruments: ${pass} passed, ${fail} FAILED`);
process.exit(fail === 0 ? 0 : 1);
