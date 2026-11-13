// test-applystatus-a.js — proof test for the applyStatus freeze-line
// dedup (arm sim-applystatus-a). Proves the COUNTING instrument, not the
// game: the regexes and the per-(day,text) grouping must count exactly
// the lines the check leg shows, so a verdict of REPRODUCES or
// KILLED-ON-CHECK rests on a true count. The game-level RED/GREEN
// (line fires N times pre-fix, once post-fix) is the step-2 proof and
// runs only with --game.
// Run: node scripts/test-applystatus-a.js [--game]  (exit 0 = all green)
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const D = require(path.join(REPO, 'scripts', 'applystatus-check-driver-20261113'));
const A = require(path.join(REPO, 'scripts', 'applystatus-check-analyze-20261113'));

let pass = 0, fail = 0;
function t(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

// §1 — the apply regex matches the exact finding line (both legs agree).
const FINDING_LINE = 'The Big Loud is frozen \u2014 War Cry. (stunned: no movement)';
t('apply-re matches finding line', D.APPLY_RE.test(FINDING_LINE));
t('apply-re matches congregation line', D.APPLY_RE.test('The RERUN \u00d71 The Congregation is frozen \u2014 War Cry. (stunned: no movement)'));
t('apply-re matches tripwire line (no source name)', D.APPLY_RE.test('The Hushwolf is frozen \u2014 something in the dark. (stunned: no movement)'));
t('apply-re matches lowercase', D.APPLY_RE.test('the big loud is frozen \u2014 war cry. (stunned: no movement)'));

// §2 — the apply regex does NOT match the sibling lines: the
// tbMonsterTurn freeze line, the bellow line, the expire/cure lines.
// Different families, counted separately, never folded into the count.
t('apply-re ignores tbMonsterTurn freeze line', !D.APPLY_RE.test('The Big Loud is still frozen from your scream.'));
t('apply-re ignores bellow line', !D.APPLY_RE.test('You BELLOW \u2014 raw, wordless, from the gut. 2 of them flinch, losing their next turn. (War Cry)'));
t('apply-re ignores expire line', !D.APPLY_RE.test('The Big Loud is shaking it off.'));
t('apply-re ignores stun_full line', !D.APPLY_RE.test('You are reeling \u2014 the belltoad croak. (full turn lost)'));
t('freezeline-re still matches its own line (control)', D.FREEZELINE_RE.test('The Big Loud is still frozen from your scream.'));
t('bellow-re catches bellow line', D.BELLOW_RE.test('You BELLOW \u2014 raw, wordless, from the gut. 2 of them flinch, losing their next turn. (War Cry)'));

// §3 — maxGroup aggregation: the repeat metric groups identical text
// on one day. Two different monsters sharing a day with DIFFERENT
// text are not a repeat; the same text twice is.
t('maxGroup: same text twice on one day groups to 2',
  D.maxGroup([{ day: 89, line: FINDING_LINE }, { day: 89, line: FINDING_LINE }]).size === 2);
t('maxGroup: different monsters, different text, same day -> 1',
  D.maxGroup([{ day: 89, line: FINDING_LINE },
    { day: 89, line: 'The RERUN \u00d71 The Congregation is frozen \u2014 War Cry. (stunned: no movement)' }]).size === 1);
t('maxGroup: same text on different days does not group',
  D.maxGroup([{ day: 89, line: FINDING_LINE }, { day: 130, line: FINDING_LINE }]).size === 1);
t('maxGroup: empty -> 0', D.maxGroup([]).size === 0);
t('countByDay aggregates mixed days', JSON.stringify(D.countByDay([{ day: 5 }, { day: 5 }, { day: 7 }])) === JSON.stringify({ 5: 2, 7: 1 }));

// §4 — the judge rule from the prereg: an identical-text group >= 2
// on one seed-day reproduces; groups of <= 1 kill the check.
t('judge: group 10 reproduces', A.judge(10) === 'REPRODUCES');
t('judge: group 2 reproduces (boundary)', A.judge(2) === 'REPRODUCES');
t('judge: group 1 kills the check (boundary)', A.judge(1) === 'KILLED-ON-CHECK');
t('judge: group 0 kills the check', A.judge(0) === 'KILLED-ON-CHECK');

// §5 — the anchor guard pins the check to the prereg commit
// (e7188607b = rebased prereg commit; original 77d468d8b rewritten by the rebase onto 42024a8de, prereg file content-identical).
t('expected anchor is the prereg commit e7188607b', D.EXPECTED_ANCHOR.indexOf('e7188607b') === 0);
let head = 'unknown', isAncestor = false;
try { head = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim(); } catch (e) {}
try { execSync('git merge-base --is-ancestor e7188607b HEAD', { cwd: REPO }); isAncestor = true; } catch (e) {}
t('prereg commit is an ancestor of this HEAD', isAncestor, 'HEAD ' + head.slice(0, 12));

// §6 — the emit site still exists: stun.applyText in statusEffects.json
// and the applyStatus say in statusEffects.js.
let seJson = '', seText = '';
try { seJson = fs.readFileSync(path.join(REPO, 'src', 'data', 'statusEffects.json'), 'utf8'); } catch (e) {}
try { seText = fs.readFileSync(path.join(REPO, 'src', 'js', 'statusEffects.js'), 'utf8'); } catch (e) {}
t('stun applyText present in statusEffects.json', seJson.indexOf('(stunned: no movement)') !== -1);
t('applyStatus says def.applyText', seText.indexOf('def.applyText') !== -1);

console.log('test-applystatus-a: ' + pass + ' passed, ' + fail + ' failed');
if (fail) process.exit(1);

// §7+ — GAME-LEVEL RED/GREEN (step 2 proof; runs only with --game).
// The observable effect: a monster re-stunned round after round by War
// Cry announces the applyStatus freeze line ONCE per fight, not once
// per bellow — while the stun itself still eats its turn every round
// (mechanic intact). G1 is the RED case: on pre-fix code the line
// fires 3x for 3 applications; on fixed code it fires once.
async function gameLevel() {
  const { loadGame, setupGame, quietLog } = require('./sim-harness');
  const K = require('./godpath/lib');
  let gpass = 0, gfail = 0;
  function gok(name, cond, extra) {
    if (cond) { gpass++; console.log('PASS(game) ' + name); }
    else { gfail++; console.log('FAIL(game) ' + name + (extra ? ' — ' + extra : '')); }
  }
  const countApply = (lines) => lines.filter(function (l) { return D.APPLY_RE.test(l); }).length;

  async function newGame(seed) {
    const { Game } = await loadGame({ seed: seed, mode: 'applystatus-proof' });
    await setupGame(Game);
    return Game;
  }
  // One War Cry bellow against one monster: exactly what the competent
  // policy does every round (~10x per fight in the wild).
  function bellowOnce(Game, m) {
    Game.applyStatus(m, 'stun', { turns: 1, source: 'War Cry' });
  }

  // G1: one monster, stunned 3 bellows in a row -> line fires ONCE.
  {
    const Game = await newGame(7);
    const lines = K.captureSays(Game);
    const mf = K.fight(Game, 'hushwolf');
    gok('G1 fight started', !!Game.tbfight && !!mf, 'no fight/monster');
    const p0 = Game.tbFighter('p');
    const scholarHp0 = p0 ? p0.hp : null;
    const pos0 = mf ? (mf.mx + ',' + mf.my) : null;
    await quietLog(async () => { bellowOnce(Game, mf); bellowOnce(Game, mf); bellowOnce(Game, mf); });
    const n = countApply(lines);
    gok('G1 applyStatus freeze line fires once for 3 bellows', n === 1, 'fired ' + n + 'x');
    gok('G1 mechanic intact: stun entry present, 1 turn', (mf.statuses || []).some(function (s) { return s.id === 'stun' && s.turnsLeft === 1; }), 'statuses=' + JSON.stringify(mf.statuses));
    gok('G1 mechanic intact: legacy bridge m.stunned set', mf.stunned === 1, 'stunned=' + mf.stunned);
    await quietLog(async () => { Game.tbMonsterTurn(mf); });
    gok('G1 mechanic intact: stunned turn consumed', mf.stunned === 0, 'stunned=' + mf.stunned);
    const p1 = Game.tbFighter('p');
    gok('G1 mechanic intact: scholar unhurt while monster frozen', p1 && p1.hp === scholarHp0, 'hp ' + scholarHp0 + ' -> ' + (p1 && p1.hp));
    gok('G1 mechanic intact: monster did not move while frozen', (mf.mx + ',' + mf.my) === pos0, 'moved ' + pos0 + ' -> ' + mf.mx + ',' + mf.my);
    lines.restore();
  }

  // G2: two monsters in one fight (pack-leader + packmate, via the
  // engine-real feast-draw veteran path), each bellowed -> one line EACH.
  {
    const Game = await newGame(7);
    const lines = K.captureSays(Game);
    Game.state.scholar.feastDraw = { veteran: true, monsterId: 'focus_group' };
    const mf = K.fight(Game, 'focus_group');
    gok('G2 pack-leader fight started', !!Game.tbfight && !!mf && mf.veteranVariant === 'pack-leader', 'variant=' + (mf && mf.veteranVariant));
    const monsters = Game.tbfight.fighters.filter(function (f) { return f.kind === 'monster' && f.alive && !f.fled; });
    gok('G2 fight has lead + packmate', monsters.length >= 2 && monsters.some(function (f) { return f.key === 'm_packmate'; }), 'monsters=' + monsters.length + ' keys=' + monsters.map(function (f) { return f.key; }).join(','));
    if (monsters.length >= 2) {
      await quietLog(async () => {
        bellowOnce(Game, monsters[0]); bellowOnce(Game, monsters[0]);
        bellowOnce(Game, monsters[1]); bellowOnce(Game, monsters[1]);
      });
      const n = countApply(lines);
      gok('G2 two bellowed monsters -> two lines (once each)', n === 2, 'fired ' + n + 'x');
    }
    lines.restore();
  }

  // G2b: re-stun AFTER the stun expires in the same fight stays silent
  // — the dedup is once per monster per fight, not once per application.
  // (Per-application dedup could not fix this defect anyway: every War
  // Cry stun is 1 turn, so each round IS a fresh application.)
  {
    const Game = await newGame(7);
    const lines = K.captureSays(Game);
    const mf = K.fight(Game, 'hushwolf');
    await quietLog(async () => { bellowOnce(Game, mf); });
    const n1 = countApply(lines);
    await quietLog(async () => { Game.tickStatuses(mf, 'combat'); }); // stun expires ("shaking it off")
    const expired = !(mf.statuses || []).some(function (s) { return s.id === 'stun'; });
    await quietLog(async () => { bellowOnce(Game, mf); bellowOnce(Game, mf); });
    const n2 = countApply(lines);
    gok('G2b first stun: one line', n1 === 1, 'fired ' + n1 + 'x');
    gok('G2b stun expired between bellows', expired, 'statuses=' + JSON.stringify(mf.statuses));
    gok('G2b re-stun after expiry: still one line total', n2 === 1, 'fired ' + n2 + 'x total');
    gok('G2b mechanic intact: re-stun still applies', mf.stunned === 1, 'stunned=' + mf.stunned);
    lines.restore();
  }

  // G3: a NEW fight re-announces (dedup is per-fight, not global).
  {
    const Game = await newGame(7);
    const lines = K.captureSays(Game);
    let mf = K.fight(Game, 'hushwolf');
    await quietLog(async () => { bellowOnce(Game, mf); bellowOnce(Game, mf); });
    const n1 = countApply(lines);
    try { Game.tbEnd('fled'); } catch (e) { Game.tbfight = null; }
    mf = K.fight(Game, 'hushwolf');
    await quietLog(async () => { bellowOnce(Game, mf); });
    const n2 = countApply(lines) - n1;
    gok('G3 first fight: one line', n1 === 1, 'fired ' + n1 + 'x');
    gok('G3 second fight re-announces once', n2 === 1, 'fired ' + n2 + 'x');
    lines.restore();
  }

  // G4: scholar / out-of-combat applications still narrate every time
  // — the never_silent rule holds outside fights. (Note the scholar
  // form is "You ARE frozen" — the monster-form APPLY_RE does not
  // match it, so count the shared "(stunned: no movement)" tail here.)
  {
    const Game = await newGame(7);
    const lines = K.captureSays(Game);
    gok('G4 no live fight', !Game.tbfight, 'tbfight present');
    await quietLog(async () => {
      Game.applyStatus('scholar', 'stun', { turns: 1, source: 'War Cry' });
      Game.applyStatus('scholar', 'stun', { turns: 1, source: 'War Cry' });
    });
    const n = lines.filter(function (l) { return /\(stunned: no movement\)/i.test(l); }).length;
    const youForm = lines.some(function (l) { return /You are frozen \u2014 War Cry\. \(stunned: no movement\)/.test(l); });
    gok('G4 scholar stun outside combat: narrated twice', n === 2, 'fired ' + n + 'x');
    gok('G4 scholar line uses the You-form ("You are frozen")', youForm, 'lines=' + JSON.stringify(lines.slice(-4)));
    lines.restore();
  }

  console.log('test-applystatus-a(game): ' + gpass + ' passed, ' + gfail + ' failed');
  return gfail;
}

if (process.argv.indexOf('--game') !== -1) {
  gameLevel().then(function (gf) { process.exit(gf ? 1 : 0); }).catch(function (e) { console.error(e.stack); process.exit(1); });
} else {
  process.exit(0);
}
