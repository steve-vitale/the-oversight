// test-freezeline-a.js — proof test for the freeze-line check instrument
// (arm sim-freezeline-a). Proves the COUNTING instrument, not the game:
// the regexes and the per-day aggregation must count exactly the lines
// the old-base corpus shows, so a check verdict of REPRODUCES or
// KILLED-ON-CHECK rests on a true count. The game-level RED/GREEN
// (line fires N times pre-fix, once post-fix) is the step-2 proof and
// is added only if the check reproduces.
// Run: node scripts/test-freezeline-a.js  (exit 0 = all green)
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const D = require(path.join(REPO, 'scripts', 'freezeline-check-driver-20261113'));
const A = require(path.join(REPO, 'scripts', 'freezeline-check-analyze-20261113'));

let pass = 0, fail = 0;
function t(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

// §1 — the freeze regex matches the exact old-base line (both legs agree).
const OLD_LINE = 'The Pack-leader The Focus Group is still frozen from your scream.';
t('freeze-re matches old-base line', D.FREEZE_RE.test(OLD_LINE));
t('freeze-re matches a bare monster name', D.FREEZE_RE.test('The Moderator is still frozen from your scream.'));
t('freeze-re matches lowercase', D.FREEZE_RE.test('the focus group is still frozen from your scream.'));

// §2 — the freeze regex does NOT match the sibling stun-family lines
// (Freeze Tag rooted, Bind strains, worn-off lines): different family,
// counted separately, never folded into the freeze count.
t('freeze-re ignores freeze-tag line', !D.FREEZE_RE.test('The Focus Group strains against the tag — rooted! (Freeze Tag: 2 rounds left)'));
t('freeze-re ignores bind line', !D.FREEZE_RE.test('The Focus Group strains against the rope — hogtied! (Bind: 2 rounds left)'));
t('freeze-re ignores worn-off line', !D.FREEZE_RE.test('The Focus Group shakes off the tag — it can move again. (Freeze Tag worn off.)'));
t('freeze-re ignores bellow line', !D.FREEZE_RE.test('You BELLOW — raw, wordless, from the gut. 2 of them flinch, losing their next turn. (War Cry)'));
t('sibling-re catches freeze-tag line', D.SIBLING_RE.test('The Focus Group strains against the tag — rooted! (Freeze Tag: 2 rounds left)'));
t('sibling-re catches bind line', D.SIBLING_RE.test('The Focus Group strains against the rope — hogtied! (Bind: 2 rounds left)'));

// §3 — per-day aggregation reproduces the old-base shape exactly:
// 64 lines, all on one day (190407 d72), from the tendexact corpus.
const corpus = path.join(REPO, 'evidence', '2026-11-13', 'perseed-tendexact-confirm-a-baseline',
  'tendexact-confirm-s190407-tendexact-confirm-pilot-fix.json');
let counted = 0, byDay = null;
try {
  const d = JSON.parse(fs.readFileSync(corpus, 'utf8'));
  const lines = (d.vetSays || []).filter(function (s) { return D.FREEZE_RE.test(s.line); });
  counted = lines.length;
  byDay = D.countByDay(lines);
} catch (e) { counted = -1; }
t('old-base corpus recounts 64 freeze lines on 190407', counted === 64, 'got ' + counted);
t('old-base corpus: all 64 on one day (d72)', byDay && byDay[72] === 64 && Object.keys(byDay).length === 1, JSON.stringify(byDay));
t('countByDay aggregates mixed days', JSON.stringify(D.countByDay([{ day: 5 }, { day: 5 }, { day: 7 }])) === JSON.stringify({ 5: 2, 7: 1 }));

// §4 — the judge rule from the prereg: maxPerDay >= 2 reproduces,
// maxPerDay <= 1 kills the check. Boundary cases explicit.
t('judge: 64 reproduces', A.judge(64) === 'REPRODUCES');
t('judge: 2 reproduces (boundary)', A.judge(2) === 'REPRODUCES');
t('judge: 1 kills the check (boundary)', A.judge(1) === 'KILLED-ON-CHECK');
t('judge: 0 kills the check', A.judge(0) === 'KILLED-ON-CHECK');

// §5 — the anchor guard pins the check to the preregistered tip.
t('expected anchor is f7352f946', D.EXPECTED_ANCHOR.indexOf('f7352f946') === 0);
let head = 'unknown';
try { head = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim(); } catch (e) {}
t('worktree HEAD is the preregistered tip', head === D.EXPECTED_ANCHOR, 'HEAD ' + head.slice(0, 12));

// §6 — the emit site still exists on this tip (the line the check counts).
let gameText = '';
try { gameText = fs.readFileSync(path.join(REPO, 'src', 'js', 'game.js'), 'utf8'); } catch (e) {}
t('emit site present in game.js', gameText.indexOf('is still frozen from your scream.') !== -1);

console.log('test-freezeline-a: ' + pass + ' passed, ' + fail + ' failed');
if (fail) process.exit(1);

// §7+ — GAME-LEVEL RED/GREEN (step 2 proof; runs only with --game).
// The observable effect: a monster re-stunned round after round by War
// Cry says the freeze line ONCE per fight, not once per round — while
// the stun itself still eats its turn every round (mechanic intact).
// G1 is the RED case: on pre-fix code the line fires 3x for 3 stunned
// turns; on fixed code it fires once.
async function gameLevel() {
  const { loadGame, setupGame, quietLog } = require('./sim-harness');
  const K = require('./godpath/lib');
  let gpass = 0, gfail = 0;
  function gok(name, cond, extra) {
    if (cond) { gpass++; console.log('PASS(game) ' + name); }
    else { gfail++; console.log('FAIL(game) ' + name + (extra ? ' — ' + extra : '')); }
  }
  const countFreeze = (lines) => lines.filter(function (l) { return D.FREEZE_RE.test(l); }).length;

  async function newGame(seed) {
    const { Game } = await loadGame({ seed: seed, mode: 'freezeline-proof' });
    await setupGame(Game);
    return Game;
  }

  // G1: one monster, stunned 3 turns in a row -> line fires ONCE.
  {
    const Game = await newGame(7);
    const lines = K.captureSays(Game);
    const mf = K.fight(Game, 'hushwolf');
    gok('G1 fight started', !!Game.tbfight && !!mf, 'no fight/monster');
    const p0 = Game.tbFighter('p');
    const scholarHp0 = p0 ? p0.hp : null;
    const pos0 = mf ? (mf.mx + ',' + mf.my) : null;
    mf.stunned = 3;
    await quietLog(async () => {
      Game.tbMonsterTurn(mf);
      Game.tbMonsterTurn(mf);
      Game.tbMonsterTurn(mf);
    });
    const n = countFreeze(lines);
    gok('G1 freeze line fires once for 3 stunned turns', n === 1, 'fired ' + n + 'x');
    gok('G1 stun consumed (3 -> 0)', mf.stunned === 0, 'stunned=' + mf.stunned);
    const p1 = Game.tbFighter('p');
    gok('G1 mechanic intact: scholar unhurt while monster frozen', p1 && p1.hp === scholarHp0, 'hp ' + scholarHp0 + ' -> ' + (p1 && p1.hp));
    gok('G1 mechanic intact: monster did not move while frozen', (mf.mx + ',' + mf.my) === pos0, 'moved ' + pos0 + ' -> ' + mf.mx + ',' + mf.my);
    lines.restore();
  }

  // G2: two monsters in one fight (pack-leader + packmate, via the
  // engine-real feast-draw veteran path), each stunned -> one line EACH.
  // Seed 7 draws veteranVariant 'pack-leader' deterministically.
  {
    const Game = await newGame(7);
    const lines = K.captureSays(Game);
    Game.state.scholar.feastDraw = { veteran: true, monsterId: 'focus_group' };
    const mf = K.fight(Game, 'focus_group');
    gok('G2 pack-leader fight started', !!Game.tbfight && !!mf && mf.veteranVariant === 'pack-leader', 'variant=' + (mf && mf.veteranVariant));
    const monsters = Game.tbfight.fighters.filter(function (f) { return f.kind === 'monster' && f.alive && !f.fled; });
    gok('G2 fight has lead + packmate', monsters.length >= 2 && monsters.some(function (f) { return f.key === 'm_packmate'; }), 'monsters=' + monsters.length + ' keys=' + monsters.map(function (f) { return f.key; }).join(','));
    if (monsters.length >= 2) {
      monsters[0].stunned = 2;
      monsters[1].stunned = 2;
      await quietLog(async () => {
        Game.tbMonsterTurn(monsters[0]);
        Game.tbMonsterTurn(monsters[0]);
        Game.tbMonsterTurn(monsters[1]);
        Game.tbMonsterTurn(monsters[1]);
      });
      const n = countFreeze(lines);
      gok('G2 two stunned monsters -> two lines (once each)', n === 2, 'fired ' + n + 'x');
    }
    lines.restore();
  }

  // G2b: re-stun AFTER recovery in the same fight stays silent — the
  // dedup is once per monster per fight, not once per stun application.
  // (Per-application dedup could not fix this defect anyway: every
  // War Cry stun is 1 turn, so each round IS a fresh application.)
  {
    const Game = await newGame(7);
    const lines = K.captureSays(Game);
    const mf = K.fight(Game, 'hushwolf');
    mf.stunned = 2;
    await quietLog(async () => { Game.tbMonsterTurn(mf); Game.tbMonsterTurn(mf); });
    const n1 = countFreeze(lines);
    await quietLog(async () => { Game.tbMonsterTurn(mf); }); // recovery: acts a normal turn
    mf.stunned = 2;
    await quietLog(async () => { Game.tbMonsterTurn(mf); Game.tbMonsterTurn(mf); });
    const n2 = countFreeze(lines);
    gok('G2b first stun: one line', n1 === 1, 'fired ' + n1 + 'x');
    gok('G2b re-stun after recovery: still one line total', n2 === 1, 'fired ' + n2 + 'x total');
    lines.restore();
  }

  // G3: a NEW fight re-announces (dedup is per-fight, not global).
  {
    const Game = await newGame(7);
    const lines = K.captureSays(Game);
    let mf = K.fight(Game, 'hushwolf');
    mf.stunned = 2;
    await quietLog(async () => { Game.tbMonsterTurn(mf); Game.tbMonsterTurn(mf); });
    const n1 = countFreeze(lines);
    try { Game.tbEnd('fled'); } catch (e) { Game.tbfight = null; }
    mf = K.fight(Game, 'hushwolf');
    mf.stunned = 1;
    await quietLog(async () => { Game.tbMonsterTurn(mf); });
    const n2 = countFreeze(lines) - n1;
    gok('G3 first fight: one line', n1 === 1, 'fired ' + n1 + 'x');
    gok('G3 second fight re-announces once', n2 === 1, 'fired ' + n2 + 'x');
    lines.restore();
  }

  console.log('test-freezeline-a(game): ' + gpass + ' passed, ' + gfail + ' failed');
  return gfail;
}

if (process.argv.indexOf('--game') !== -1) {
  gameLevel().then(function (gf) { process.exit(gf ? 1 : 0); }).catch(function (e) { console.error(e.stack); process.exit(1); });
} else {
  process.exit(0);
}
