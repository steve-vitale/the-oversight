#!/usr/bin/env node
// PROOF (journey establishment r15, 2026-10-18): _contestEnd records lines must
// name the contest AND the champion — never the "the Bearer ... a contest"
// fallback when both are knowable.
//
// RED (pre-fix): champion lines read "the Bearer won a contest under the
//   cameras" — person and contest both dropped, and notePublic's idempotent
//   key ('champion_' + cname) collapses EVERY win onto one entry.
// GREEN (post-fix): "You won The Pit under the cameras" / "<villager> won
//   Duel under the cameras", one entry per contest id.
//
// NOTE on display redaction: this repo's content pipeline redacts the word
// after "Bearer" in tool output ("bearer <X>" looks like an OAuth token), so
// the test never prints the raw line — it prints verdicts and hex. The
// assertions run on exact node-side string bytes.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

const hex = (s) => Buffer.from(String(s), 'utf8').toString('hex');

async function main() {
  const { Game } = await loadGame({ seed: 7, mode: 'mvc', fullTelemetry: true });
  await setupGame(Game);
  try { Game.state.scholar.day = 20; } catch (e) { /* test-only */ }

  // a living villager for the watch-mode win
  let vid = null;
  try {
    const roster = (Game.state.village || {}).roster || [];
    vid = roster.find(id => { try { return !(Game.getPerson(id) || {}).dead; } catch (e) { return false; } }) || null;
  } catch (e) { /* test-only */ }
  if (!vid) { console.log('SKIP: no living villager'); process.exit(2); }
  const vname = (() => { try { return Game.displayName(vid); } catch (e) { return '?'; } })();

  // drive the REAL end path, twice: player win + villager win
  Game._contestEnd({ contestId: 'pit', participant: 'player', participants: ['player'], phases: [], phaseIdx: 0, variant: null }, 'won', false);
  Game._contestEnd({ contestId: 'duel', participant: vid, participants: [vid], phases: [], phaseIdx: 0, variant: null }, 'won', false);

  const RR = globalThis.Scattering.RunRecords;
  const champs = (RR.publicLines(Game) || []).filter(l => (l.id || '').indexOf('champion_') === 0);

  let failures = 0;
  const check = (label, cond, detailHex) => {
    console.log((cond ? 'PASS' : 'FAIL') + ' ' + label + (detailHex ? ' hex:' + detailHex.slice(0, 120) : ''));
    if (!cond) failures++;
  };

  check('two champion lines recorded (one per contest)', champs.length === 2, '');
  const pit = champs.find(l => (l.id || '').indexOf('pit') >= 0);
  const duel = champs.find(l => (l.id || '').indexOf('duel') >= 0);
  check('pit win recorded under its own id', !!pit, '');
  check('duel win recorded under its own id', !!duel, '');

  for (const [label, line, wantName, wantWho] of [
    ['pit names the contest', pit, 'The Pit', null],
    ['pit names the player', pit, null, 'You'],
    ['duel names the contest', duel, 'Duel', null],
    ['duel names the villager', duel, null, vname],
  ]) {
    if (!line) { check(label + ' (missing line)', false, ''); continue; }
    const tx = line.text || '';
    const noBearerFallback = tx.indexOf('the Bearer') === -1;
    const noContestFallback = tx.indexOf('a contest') === -1;
    const hasName = wantName ? tx.indexOf(wantName) !== -1 : true;
    const hasWho = wantWho ? tx.indexOf(wantWho) !== -1 : true;
    check(label + ' [no "the Bearer" fallback]', noBearerFallback, hex(tx));
    check(label + ' [no "a contest" fallback]', noContestFallback, '');
    if (wantName) check(label + ' [contains "' + wantName + '"]', hasName, '');
    if (wantWho) check(label + ' [contains "' + wantWho + '"]', hasWho, '');
  }

  console.log(failures === 0 ? 'GREEN: champion records name contest + champion' : 'RED: ' + failures + ' failing assertion(s)');
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });
