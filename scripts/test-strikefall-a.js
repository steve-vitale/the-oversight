// test-strikefall-a.js — proof test for sim-strikefall-a (findings #2303
// strike-after-fall ordering + #2304 square screams twice). Proves the
// COUNTING instrument (regexes, label matching, adjacency judge, DIP
// grouping) plus the game-level RED/GREEN: on pre-fix code a killing
// player strike narrates "falls." BEFORE "You STRIKE ..." (G1 FAILS);
// on fixed code the STRIKE line comes first and the falls line follows
// (G1 PASSES), with the landed number still honest. The Static Kite dip
// game leg (G3) is added once the check leg names the mechanism (two
// kites vs one kite twice) — see the prereg.
// Run: node scripts/test-strikefall-a.js [--game]  (exit 0 = all green)
'use strict';
const path = require('path');
const fs = require('fs');
const REPO = path.join(__dirname, '..');
const D = require(path.join(REPO, 'scripts', 'strikefall-check-driver-20261113'));
const A = require(path.join(REPO, 'scripts', 'strikefall-check-analyze-20261113'));

let pass = 0, fail = 0;
function t(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

// §1 — the regexes match the exact finding lines.
t('falls-re matches congregation falls line', D.FALLS_RE.test('The RERUN \u00d71 The Congregation falls.'));
t('falls-re matches kite falls line', D.FALLS_RE.test('The Static Kite falls.'));
t('strike-re matches congregation strike line', D.STRIKE_RE.test('You STRIKE the congregation for 18 (Kitchen knife).'));
t('strike-re matches kite strike line', D.STRIKE_RE.test('You STRIKE the kite for 89 (Machete).'));
t('dip-re matches the square-scream DIP line', D.DIP_RE.test('The square SCREAMS \u2014 static made solid. And the kite DIPS, low, its screen strobing with footage of you. IT\u2019S YOURS. NOW.'));
t('dip-re does NOT match the short square line (different emit site)', !D.DIP_RE.test('\uD83D\uDCA5 The square SCREAMS \u2014 static made solid.'));
t('dip-short-re matches the short square line', D.DIP_SHORT_RE.test('\uD83D\uDCA5 The square SCREAMS \u2014 static made solid.'));
t('strike-re ignores villager strike lines', !D.STRIKE_RE.test('Catalina strikes the Scarred The Moderator.'));
t('falls-re ignores the player fall line', !D.FALLS_RE.test('You go down.'));

// §2 — label matching: encSubject (falls) vs encShortLabel (strike)
// differ by prefix/case ("The RERUN ×1 The Congregation" vs
// "congregation"; "The Static Kite" vs "the kite").
t('labels match: congregation', A.labelsMatch(A.fallsTokens('The RERUN \u00d71 The Congregation falls.'), A.strikeTokens('You STRIKE the congregation for 18 (Kitchen knife).')));
t('labels match: kite', A.labelsMatch(A.fallsTokens('The Static Kite falls.'), A.strikeTokens('You STRIKE the kite for 89 (Machete).')));
t('labels match: scarred prefix tolerated', A.labelsMatch(A.fallsTokens('The Scarred ducks in a row (head) falls.'), A.strikeTokens('You STRIKE the ducks in a row (head) for 12 (Spear).')));
t('labels do NOT match: different monsters', !A.labelsMatch(A.fallsTokens('The Static Kite falls.'), A.strikeTokens('You STRIKE the congregation for 18 (Kitchen knife).')));

// §3 — the judge on synthetic corpora: adjacency is the glitch.
function synthCorpus(fallsSeq, strikeSeq, fallsLine, strikeLine) {
  return {
    seed: 1, days: 10, endReason: 'x', won: false, maxWave: 1, standing: 0, scaleRank: 'village',
    fallsCount: 1, strikeCount: 1, dipCount: 0, dipShortCount: 0,
    freezelineCount: 0, applyCount: 0, bellowCount: 0, sayCount: 10, instrumentErrors: [],
    fallsLines: [{ seq: fallsSeq, day: 89, fight: 1, line: fallsLine, person: false, fighters: null }],
    strikeLines: [{ seq: strikeSeq, day: 89, fight: 1, line: strikeLine, fighters: null }],
    dipLines: [], dipShortLines: [], freezelineLines: [], applyLines: [], bellowLines: [],
  };
}
t('judge: falls seq 5 + strike seq 6 (adjacent, matched) counts 1',
  A.judgeOne(1, synthCorpus(5, 6, 'The Static Kite falls.', 'You STRIKE the kite for 89 (Machete).')).strikeAfterFall === 1);
t('judge: falls seq 5 + strike seq 7 (not adjacent) counts 0',
  A.judgeOne(1, synthCorpus(5, 7, 'The Static Kite falls.', 'You STRIKE the kite for 89 (Machete).')).strikeAfterFall === 0);
t('judge: adjacent but different monster counts 0 (listed, unmatched)',
  A.judgeOne(1, synthCorpus(5, 6, 'The Static Kite falls.', 'You STRIKE the congregation for 18 (Kitchen knife).')).strikeAfterFall === 0);
t('judge: person falls (☠) never counts',
  A.judgeOne(1, synthCorpus(5, 6, '☠ Ava falls.', 'You STRIKE the kite for 89 (Machete).')).strikeAfterFall === 0);

// §4 — DIP grouping: two DIP lines in one fight group; one line does not.
function synthDipCorpus(lines) {
  return {
    seed: 1, days: 10, endReason: 'x', won: false, maxWave: 1, standing: 0, scaleRank: 'village',
    fallsCount: 0, strikeCount: 0, dipCount: lines.length, dipShortCount: 0,
    freezelineCount: 0, applyCount: 0, bellowCount: 0, sayCount: 10, instrumentErrors: [],
    fallsLines: [], strikeLines: [], dipLines: lines, dipShortLines: [], freezelineLines: [], applyLines: [], bellowLines: [],
  };
}
const DIP = 'The square SCREAMS \u2014 static made solid. And the kite DIPS, low, its screen strobing with footage of you. IT\u2019S YOURS. NOW.';
t('judge: two DIP lines, one fight -> 1 dup group',
  A.judgeOne(1, synthDipCorpus([
    { seq: 5, day: 89, fight: 3, line: DIP, fighters: [{ key: 'm_0', monsterId: 'statickite', alive: true }] },
    { seq: 6, day: 89, fight: 3, line: DIP, fighters: [{ key: 'm_0', monsterId: 'statickite', alive: true }] },
  ])).dupDipGroups === 1);
t('judge: two DIP lines, two fights -> 0 dup groups',
  A.judgeOne(1, synthDipCorpus([
    { seq: 5, day: 89, fight: 3, line: DIP, fighters: [{ key: 'm_0', monsterId: 'statickite', alive: true }] },
    { seq: 9, day: 89, fight: 4, line: DIP, fighters: [{ key: 'm_0', monsterId: 'statickite', alive: true }] },
  ])).dupDipGroups === 0);
t('judge: one DIP line -> 0 dup groups',
  A.judgeOne(1, synthDipCorpus([{ seq: 5, day: 89, fight: 3, line: DIP, fighters: [{ key: 'm_0', monsterId: 'statickite', alive: true }] }])).dupDipGroups === 0);
t('judge: dup group records 1 kite (double-resolve shape)',
  A.judgeOne(1, synthDipCorpus([
    { seq: 5, day: 89, fight: 3, line: DIP, fighters: [{ key: 'm_0', monsterId: 'statickite', alive: true }] },
    { seq: 6, day: 89, fight: 3, line: DIP, fighters: [{ key: 'm_0', monsterId: 'statickite', alive: true }] },
  ])).dupDipDetail[0].kiteCounts.join(',') === '1,1');

// §5 — the prereg exists and pins the driver to an explicit anchor.
t('prereg file exists', fs.existsSync(path.join(REPO, 'evidence', '2026-11-13', 'sim-strikefall-a-prereg.md')));
let prereg = '';
try { prereg = fs.readFileSync(path.join(REPO, 'evidence', '2026-11-13', 'sim-strikefall-a-prereg.md'), 'utf8'); } catch (e) {}
t('prereg names the base master 48ed1ffd7', prereg.indexOf('48ed1ffd7') !== -1);
t('prereg states the GO bars (0 strike-after-fall, 0 duplicate screams)', prereg.indexOf('(a) STRIKE-AFTER-FALL count 0') !== -1 && prereg.indexOf('(b) DUPLICATE SQUARE-SCREAM count 0') !== -1);
let drv = '';
try { drv = fs.readFileSync(path.join(REPO, 'scripts', 'strikefall-check-driver-20261113.js'), 'utf8'); } catch (e) {}
t('driver refuses to run without EXPECTED_ANCHOR', drv.indexOf('EXPECTED_ANCHOR required') !== -1);

console.log('test-strikefall-a: ' + pass + ' passed, ' + fail + ' failed');
if (fail) process.exit(1);

// §6+ — GAME-LEVEL RED/GREEN (runs only with --game).
// G1 is the RED case: a killing player strike narrates "falls." BEFORE
// "You STRIKE ..." on pre-fix code (tbPlayerStrike composes its line
// after tbDamage, which says the falls line inline). G2 is the control:
// a non-killing strike is unchanged (STRIKE line, no falls line).
async function gameLevel() {
  const { loadGame, setupGame, quietLog } = require('./sim-harness');
  const K = require('./godpath/lib');
  let gpass = 0, gfail = 0;
  function gok(name, cond, extra) {
    if (cond) { gpass++; console.log('PASS(game) ' + name); }
    else { gfail++; console.log('FAIL(game) ' + name + (extra ? ' — ' + extra : '')); }
  }
  const idx = function (lines, re) {
    for (let i = 0; i < lines.length; i++) if (re.test(lines[i])) return i;
    return -1;
  };

  async function newGame(seed) {
    const { Game } = await loadGame({ seed: seed, mode: 'strikefall-proof' });
    await setupGame(Game);
    return Game;
  }

  // G1: killing strike — STRIKE line must precede the falls line.
  {
    const Game = await newGame(7);
    const lines = K.captureSays(Game);
    const mf = K.fight(Game, 'hushwolf', { mx: 3, my: 4 }); // adjacent: unarmed range 1
    gok('G1 fight started', !!Game.tbfight && !!mf, 'no fight/monster');
    if (mf) {
      mf.hp = 1; // one strike kills, whatever the landed number is
      let struck = false;
      await quietLog(async () => { struck = Game.tbPlayerStrike(mf.key); });
      const si = idx(lines, /^You STRIKE the /);
      const fi = idx(lines, / falls\.$/);
      gok('G1 strike landed', struck === true, 'tbPlayerStrike returned ' + struck);
      gok('G1 monster died from the strike', !mf.alive, 'alive=' + mf.alive + ' hp=' + mf.hp);
      gok('G1 STRIKE line present', si !== -1, 'lines=' + JSON.stringify(lines.slice(-6)));
      gok('G1 falls line present (the kill is still announced)', fi !== -1, 'lines=' + JSON.stringify(lines.slice(-6)));
      gok('G1 STRIKE line precedes falls line', si !== -1 && fi !== -1 && si < fi, 'strike@' + si + ' falls@' + fi);
    }
    lines.restore();
  }

  // G2: non-killing strike — STRIKE line, no falls line, unchanged.
  {
    const Game = await newGame(7);
    const lines = K.captureSays(Game);
    const mf = K.fight(Game, 'hushwolf', { mx: 3, my: 4 }); // adjacent: unarmed range 1
    gok('G2 fight started', !!Game.tbfight && !!mf, 'no fight/monster');
    if (mf) {
      mf.hp = 500; mf.maxHp = 500;
      let struck = false;
      await quietLog(async () => { struck = Game.tbPlayerStrike(mf.key); });
      const si = idx(lines, /^You STRIKE the /);
      const fi = idx(lines, / falls\.$/);
      gok('G2 strike landed', struck === true, 'tbPlayerStrike returned ' + struck);
      gok('G2 monster survived the strike', mf.alive, 'alive=' + mf.alive + ' hp=' + mf.hp);
      gok('G2 STRIKE line present', si !== -1, 'lines=' + JSON.stringify(lines.slice(-6)));
      gok('G2 no falls line', fi === -1, 'falls@' + fi);
    }
    lines.restore();
  }

  // G3 (Static Kite dip): added once the check leg names the mechanism
  // (two kites in one fight vs one kite resolving twice) — see prereg.

  console.log('test-strikefall-a(game): ' + gpass + ' passed, ' + gfail + ' failed');
  return gfail;
}

if (process.argv.indexOf('--game') !== -1) {
  gameLevel().then(function (gf) { process.exit(gf ? 1 : 0); }).catch(function (e) { console.error(e.stack); process.exit(1); });
} else {
  process.exit(0);
}
