#!/usr/bin/env node
// test-watchers-champion-loan-20261020.js — proof for journey-scale r15.
// The Watchers' CHAMPION answer (docs/SCALE.md §4) loans the speaker for
// seven days ("into the light"); the homecoming is voiced by
// loanedReturnTick (membership.js). Two claims:
//   (1) the champion loan lands: m.loaned = {vid, untilDay: day+7,
//       to: 'the world feed'} and the departure line fires.
//   (2) the homecoming line reads sensibly for non-village postings.
//       BUG (RED): _ovName('the world feed') -> 'them', so the return reads
//       "days at them's fire, served" — broken copy. Same for the First
//       Court's 'the first court' loan. GREEN: "days in the light, served"
//       / "days in the first court, served".
// Usage: node scripts/test-watchers-champion-loan-20261020.js
// RED check (patch-file round trip, never stash on the hot tree):
//   git diff src/js/membership.js > /tmp/champion.patch && git checkout HEAD -- src/js/membership.js
//   node scripts/test-watchers-champion-loan-20261020.js   # expect RED (part B/C)
//   git apply /tmp/champion.patch
//   node scripts/test-watchers-champion-loan-20261020.js   # expect GREEN
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

const SEED = 15002;
let failures = 0;
function check(name, cond, detail) {
  console.log(`  [${cond ? 'PASS' : 'FAIL'}] ${name}${detail ? ' — ' + detail : ''}`);
  if (!cond) failures++;
}

async function main() {
  console.log('=== test-watchers-champion-loan (journey-scale r15) ===');
  const { Game } = await loadGame({ seed: SEED, mode: 'watchers-champion-proof', fullTelemetry: false });
  const said = [];
  const _say = Game.say;
  Game.say = function (...a) { try { said.push(String(a[0])); } catch (e) {} try { return _say.apply(this, a); } catch (e2) { return a[0]; } };
  await setupGame(Game);
  const day0 = (Game.state.scholar || {}).day || 0;

  // A. the champion answer lands the 7-day loan, voiced.
  Game.state.nationalLive = true;
  Game.stageGlobalBeat(36);
  check('A1 watchers staged', !!Game.state.pendingGlobal, 'pendingGlobal set');
  const markA = said.length;
  const r = Game.answerGlobalChoice('champion');
  const aLines = said.slice(markA).map(String).join(' | ');
  check('A2 answer returns true', r === true, 'return=' + r);
  let loan = null;
  try { const m = Game.mshipState(); loan = m && m.loaned ? JSON.parse(JSON.stringify(m.loaned)) : null; } catch (e) {}
  check('A3 loan to the world feed', !!(loan && loan.to === 'the world feed'),
    'loan=' + JSON.stringify(loan));
  check('A4 loan is 7 days', !!(loan && loan.untilDay === day0 + 7),
    `untilDay=${loan && loan.untilDay} day0=${day0}`);
  check('A5 global live', !!Game.state.globalLive, 'globalLive=' + !!Game.state.globalLive);
  check('A6 departure voiced', /walks into the light for seven days/.test(aLines),
    aLines.slice(0, 160));

  // B. the homecoming line for the world-feed posting.
  const loanVid = loan && loan.vid;
  try { Game.state.scholar.day = (loan ? loan.untilDay : day0 + 7); } catch (e) {}
  const markB = said.length;
  Game.loanedReturnTick();
  const bLines = said.slice(markB).map(String).join(' | ');
  check('B1 return voiced', /walks back in/.test(bLines), bLines.slice(0, 160));
  check('B2 no "them\'s fire"', !/them's fire/.test(bLines), bLines.slice(0, 160));
  check('B3 reads "in the light"', /in the light/.test(bLines), bLines.slice(0, 160));

  // C. the homecoming line for the first-court posting (same wart class).
  let m2 = null;
  try { m2 = Game.mshipState(); } catch (e) {}
  if (m2 && loanVid) {
    m2.loaned = { vid: loanVid, untilDay: Game.state.scholar.day, to: 'the first court' };
    const markC = said.length;
    Game.loanedReturnTick();
    const cLines = said.slice(markC).map(String).join(' | ');
    check('C1 first-court return voiced', /walks back in/.test(cLines), cLines.slice(0, 160));
    check('C2 no "them\'s fire"', !/them's fire/.test(cLines), cLines.slice(0, 160));
    check('C3 reads "in the first court"', /in the first court/.test(cLines), cLines.slice(0, 160));
  } else {
    check('C1 first-court return voiced', false, 'no loan vid / mshipState');
    failures += 2;
  }

  // D. control: a village posting still reads "at <name>'s fire".
  try {
    const mm = Game.mshipState();
    const ovs = (Game.state.otherVillages || []).filter(v => v && v.id && v.name);
    if (mm && loanVid && ovs.length) {
      mm.loaned = { vid: loanVid, untilDay: Game.state.scholar.day, to: ovs[0].id };
      const markD = said.length;
      Game.loanedReturnTick();
      const dLines = said.slice(markD).map(String).join(' | ');
      check('D1 village posting keeps "fire" copy', new RegExp("days at " + ovs[0].name + "'s fire").test(dLines), dLines.slice(0, 160));
    } else {
      check('D1 village posting keeps "fire" copy', false, 'no other village available');
    }
  } catch (e) { check('D1 village posting keeps "fire" copy', false, String(e && e.message)); }

  console.log(failures === 0 ? 'ALL GREEN' : `${failures} FAILURES`);
  process.exit(failures === 0 ? 0 : 1);
}
main().catch(e => { console.error('PROOF ERROR:', e); process.exit(2); });
