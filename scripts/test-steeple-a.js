// test-steeple-a.js — proof test for the Unleash Rage + Steeple narration
// dedup (arm sim-steeple-a). Proves the COUNTING instrument, not the
// game: the regexes and the per-(fight, monster) grouping must count
// exactly the lines the check leg shows, so a verdict of GO-FIX or
// CHECK-NO-GO rests on a true count. The game-level RED/GREEN (line
// fires N times pre-fix, once post-fix) is the step-2 proof and runs
// only with --game.
// Run: node scripts/test-steeple-a.js [--game]  (exit 0 = all green)
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const D = require(path.join(REPO, 'scripts', 'steeple-check-driver-20261113'));

let pass = 0, fail = 0;
function t(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

const RAGE_LINE = 'The red comes down. Your next 3 strikes deal +100% damage. (Unleash Rage — hold on.)';
const STEEPLE_LINE = '\uD83D\uDD14 The steeple RINGS — the bell is the telegraph. ABSOLUTION falls like a beam.';
const INVITE_LINE = '\uD83D\uDD14 The steeple RINGS — one clear note. The chapel doors swing wide. "Come. Be washed. Trauma, grief, the whole weight — laid down. The price is obedience, a little geas, nothing you\'d miss." (Accept: heal 40 + cleanse. Refuse: no leash, but no washing.)';

// §1 — the regexes match the exact finding lines (both legs agree).
t('rage-re matches finding line', D.RAGE_RE.test(RAGE_LINE));
t('steeple-re matches finding line', D.STEEPLE_RE.test(STEEPLE_LINE));
t('invite-re matches invite line', D.INVITE_RE.test(INVITE_LINE));
t('ignite-absolution-re matches ignition beat', D.IGNITE_ABSOLUTION_RE.test('\uD83D\uDCA5 Absolution! A ray of light lances FROM ITS EYES — and it\'s swinging toward you. MOVE.'));
t('ignite-excomm-re matches excomm ignition', D.IGNITE_EXCOMM_RE.test('\uD83D\uDCA5 Excommunication! A ray of light lances FROM ITS EYES — and it\'s swinging toward you. MOVE.'));

// §2 — the regexes do NOT match the sibling lines: different families,
// counted separately, never folded into the count.
t('rage-re ignores steeple line', !D.RAGE_RE.test(STEEPLE_LINE));
t('rage-re ignores bellow line', !D.RAGE_RE.test('You BELLOW — raw, wordless, from the gut. 2 of them flinch, losing their next turn. (War Cry)'));
t('steeple-re ignores invite line', !D.STEEPLE_RE.test(INVITE_LINE));
t('steeple-re ignores ignition beat', !D.STEEPLE_RE.test('\uD83D\uDCA5 Absolution! A ray of light lances FROM ITS EYES — and it\'s swinging toward you. MOVE.'));
t('invite-re ignores steeple line', !D.INVITE_RE.test(STEEPLE_LINE));
t('freezeline-re still matches its own line (control)', D.FREEZELINE_RE.test('The Big Loud is still frozen from your scream.'));
t('apply-re still matches its own line (control)', D.APPLY_RE.test('The Big Loud is frozen — War Cry. (stunned: no movement)'));

// §3 — maxGroup aggregation: the repeat metric groups identical text
// on one day. Two different monsters sharing a day with DIFFERENT
// text are not a repeat; the same text twice is.
t('maxGroup: same text twice on one day groups to 2',
  D.maxGroup([{ day: 130, line: RAGE_LINE }, { day: 130, line: RAGE_LINE }]).size === 2);
t('maxGroup: same text on different days does not group',
  D.maxGroup([{ day: 89, line: RAGE_LINE }, { day: 130, line: RAGE_LINE }]).size === 1);
t('maxGroup: empty -> 0', D.maxGroup([]).size === 0);
t('countByDay aggregates mixed days', JSON.stringify(D.countByDay([{ day: 5 }, { day: 5 }, { day: 7 }])) === JSON.stringify({ 5: 2, 7: 1 }));

// §4 — the prereg decision rules, on synthetic inputs (the rules the
// check leg is judged by — not the data itself).
function rageGoFix(worstFightLines, refreshPresses) {
  return worstFightLines >= 2 && refreshPresses >= 1;
}
function steepleGoFix(steeplePerFightMonster, ignitionsInFight) {
  return steeplePerFightMonster > ignitionsInFight;
}
t('judge rage: 17 lines + 16 refreshes -> GO-FIX', rageGoFix(17, 16));
t('judge rage: 32 lines + 31 refreshes -> GO-FIX', rageGoFix(32, 31));
t('judge rage: 2 lines, 0 refreshes (all fresh) -> CHECK-NO-GO', !rageGoFix(2, 0));
t('judge rage: 1 line -> CHECK-NO-GO', !rageGoFix(1, 0));
t('judge steeple: 19 lines vs 7 ignitions -> GO-FIX', steepleGoFix(19, 7));
t('judge steeple: 9 lines vs 2 ignitions -> GO-FIX', steepleGoFix(9, 2));
t('judge steeple: 7 lines vs 7 ignitions (one per beam) -> CHECK-NO-GO', !steepleGoFix(7, 7));
t('judge steeple: 1 line vs 1 ignition -> CHECK-NO-GO', !steepleGoFix(1, 1));

// §5 — the anchor guard pins the check to the prereg commit.
// The check leg ran when HEAD was the prereg commit 05b9bb45 (base
// master 48ed1ffd7; D.EXPECTED_ANCHOR still records that hash).
// A rebase rewrites the prereg commit's hash (05b9bb45 ->
// 6ae69b5d6 on the rebase onto 05aa4ce5a) without changing its
// content, so the ancestry check resolves the prereg commit by its
// exact message on this branch instead of pinning the pre-rebase
// hash — and verifies the prereg file it carries is byte-identical
// to the working prereg file, so a dropped or altered prereg still
// fails. (Adoption fix 2026-11-13: the hardcoded hash failed 30/1
// on the rebased tip although every other leg was green.)
t('expected anchor is the prereg commit 05b9bb45', D.EXPECTED_ANCHOR.indexOf('05b9bb45') === 0);
let head = 'unknown', preregSha = '', isAncestor = false, preregSame = false;
try { head = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim(); } catch (e) {}
try { preregSha = execSync("git log --format=%H --grep='^sim-steeple-a: prereg' -1 HEAD", { cwd: REPO }).toString().trim(); } catch (e) {}
try { execSync('git merge-base --is-ancestor ' + preregSha + ' HEAD', { cwd: REPO }); isAncestor = true; } catch (e) {}
try {
  const atCommit = execSync('git rev-parse ' + preregSha + ':evidence/2026-11-13/sim-steeple-a-prereg.md', { cwd: REPO }).toString().trim();
  const working = execSync('git hash-object evidence/2026-11-13/sim-steeple-a-prereg.md', { cwd: REPO }).toString().trim();
  preregSame = !!preregSha && atCommit === working;
} catch (e) {}
t('prereg commit (by message) is an ancestor of this HEAD', !!preregSha && isAncestor, 'prereg ' + preregSha.slice(0, 12) + ' HEAD ' + head.slice(0, 12));
t('prereg file at that commit matches the working prereg file', preregSame);

// §6 — the emit sites still exist, and the measured mechanism is what
// the check leg assumed: rage has NO precheck (re-press while live is
// allowed), the steeple say lives in the absolve branch, and that
// branch resets offered/refused (the invite/absolve alternation).
let aaText = '', sigText = '';
try { aaText = fs.readFileSync(path.join(REPO, 'src', 'js', 'abilityActions.js'), 'utf8'); } catch (e) {}
try { sigText = fs.readFileSync(path.join(REPO, 'src', 'js', 'sigW4.js'), 'utf8'); } catch (e) {}
t('rage impl present in abilityActions.js', aaText.indexOf('The red comes down. Your next 3 strikes deal +100% damage.') !== -1);
const rageKeyCount = (aaText.match(/'rage\.unleash_rage'/g) || []).length;
t('rage has no precheck: key appears exactly once (the impl)', rageKeyCount === 1, 'occurrences=' + rageKeyCount);
t('steeple say present in sigW4.js absolve branch', sigText.indexOf('ABSOLUTION falls like a beam.') !== -1);
t('absolve branch resets offered/refused (alternation mechanism)', sigText.indexOf('C.offered = false; C.refused = false; C.phase = \'absolve\';') !== -1);
t('congregation hook registered as preTurnHook', sigText.indexOf('sigCongregation: function (game, m)') !== -1);

console.log('test-steeple-a: ' + pass + ' passed, ' + fail + ' failed');
if (fail) process.exit(1);

// §7+ — GAME-LEVEL RED/GREEN (step 2 proof; runs only with --game).
// RAGE: the policy presses rage every winning turn, re-applying a
// wholly unspent buff (221/242 presses on the check band were
// refreshes at rounds=3). The observable effect: 3 presses in one
// fight announce the line ONCE, while the buff still refreshes every
// press (mechanic intact).
// STEEPLE: the hook runs every Congregation monster-turn, so the line
// fired up to 19x per (fight, monster) while the beam ignited ~7x.
// The observable effect: N monster turns announce the line ONCE per
// (fight, monster), while the beam still ignites per cycle (telegraph
// preserved) and the hook still returns false on absolve turns.
async function gameLevel() {
  const { loadGame, setupGame, quietLog } = require('./sim-harness');
  const K = require('./godpath/lib');
  let gpass = 0, gfail = 0;
  function gok(name, cond, extra) {
    if (cond) { gpass++; console.log('PASS(game) ' + name); }
    else { gfail++; console.log('FAIL(game) ' + name + (extra ? ' — ' + extra : '')); }
  }
  const countRage = (lines) => lines.filter(function (l) { return D.RAGE_RE.test(l); }).length;
  const countSteeple = (lines) => lines.filter(function (l) { return D.STEEPLE_RE.test(l); }).length;
  const countInvite = (lines) => lines.filter(function (l) { return D.INVITE_RE.test(l); }).length;
  const countIgnite = (lines) => lines.filter(function (l) { return D.IGNITE_ABSOLUTION_RE.test(l) || D.IGNITE_EXCOMM_RE.test(l); }).length;

  async function newGame(seed) {
    const { Game } = await loadGame({ seed: seed, mode: 'steeple-proof' });
    await setupGame(Game);
    return Game;
  }
  // One rage press through the real entry point. useAbility spends the
  // player turn, so the fixture resets acted/moveLeft between presses
  // to simulate the next player turn (the press itself, not turn
  // advancement, is under test).
  function pressRage(Game) {
    const ok = Game.useAbility('rage', 'unleash_rage');
    const p = Game.tbFighter ? Game.tbFighter('p') : null;
    if (p) { p.acted = false; p.moveLeft = 1; }
    return ok;
  }

  // R1: one fight, three presses -> one line, buff refreshed every time.
  {
    const Game = await newGame(7);
    const lines = K.captureSays(Game);
    K.giveAbility(Game, 'rage');
    Game.state.scholar.kcal = 5000;
    const mf = K.fight(Game, 'hushwolf');
    gok('R1 fight started', !!Game.tbfight && !!mf, 'no fight/monster');
    const kcal0 = Game.state.scholar.kcal;
    let okCount = 0;
    await quietLog(async () => {
      for (let i = 0; i < 3; i++) { if (pressRage(Game)) okCount++; }
    });
    gok('R1 all three presses land', okCount === 3, 'landed ' + okCount + '/3');
    gok('R1 rage line fires once for 3 presses', countRage(lines) === 1, 'fired ' + countRage(lines) + 'x');
    const ra = Game.state.scholar.rageActive;
    gok('R1 mechanic intact: rageActive live, 3 rounds', !!(ra && ra.rounds === 3 && ra.dmgMult === 2.0), 'rageActive=' + JSON.stringify(ra));
    gok('R1 mechanic intact: 60 kcal paid per press', Game.state.scholar.kcal === kcal0 - 180, 'kcal ' + kcal0 + ' -> ' + Game.state.scholar.kcal);
  }

  // R2: a second fight re-announces once (the flag is per-fight).
  {
    const Game = await newGame(8);
    const lines = K.captureSays(Game);
    K.giveAbility(Game, 'rage');
    Game.state.scholar.kcal = 5000;
    K.fight(Game, 'hushwolf');
    await quietLog(async () => { pressRage(Game); pressRage(Game); });
    gok('R2 first fight: one line for two presses', countRage(lines) === 1, 'fired ' + countRage(lines) + 'x');
    K.fight(Game, 'hushwolf');
    await quietLog(async () => { pressRage(Game); });
    gok('R2 second fight re-announces once', countRage(lines) === 2, 'total fired ' + countRage(lines) + 'x');
  }

  // R3: out of combat the press is refused before payment — no line,
  // no buff (fail-closed, never silent about the refusal).
  {
    const Game = await newGame(9);
    const lines = K.captureSays(Game);
    K.giveAbility(Game, 'rage');
    Game.state.scholar.kcal = 5000;
    const kcal0 = Game.state.scholar.kcal;
    let ok = null;
    await quietLog(async () => { ok = Game.useAbility('rage', 'unleash_rage'); });
    gok('R3 out-of-combat press refused', ok === false, 'returned ' + ok);
    gok('R3 no rage line out of combat', countRage(lines) === 0, 'fired ' + countRage(lines) + 'x');
    gok('R3 no buff granted out of combat', !Game.state.scholar.rageActive, 'rageActive=' + JSON.stringify(Game.state.scholar.rageActive));
    gok('R3 no kcal paid on refusal', Game.state.scholar.kcal === kcal0, 'kcal ' + kcal0 + ' -> ' + Game.state.scholar.kcal);
  }

  // S1: direct hook calls — 4 monster turns (invite, absolve, invite,
  // absolve) -> one steeple line, two invite lines (the alternation is
  // the measured behavior; the invite line is NOT deduped here), hook
  // still returns false on absolve turns so the beam runs.
  {
    const Game = await newGame(11);
    const lines = K.captureSays(Game);
    const HB = (typeof global !== 'undefined' && global.MonsterBehaviorHooks) || null;
    gok('S1 hook table present', !!(HB && typeof HB.sigCongregation === 'function'), 'MonsterBehaviorHooks.sigCongregation missing');
    const mf = K.fight(Game, 'congregation');
    gok('S1 Congregation fight started', !!Game.tbfight && !!mf && mf.mdef && mf.mdef.id === 'congregation', 'mdef=' + JSON.stringify(mf && mf.mdef && mf.mdef.id));
    let rets = [];
    await quietLog(async () => {
      for (let i = 0; i < 4; i++) rets.push(HB.sigCongregation(Game, mf));
    });
    gok('S1 steeple line fires once for 4 hook calls', countSteeple(lines) === 1, 'fired ' + countSteeple(lines) + 'x');
    gok('S1 invite line fires twice (alternation, untouched)', countInvite(lines) === 2, 'fired ' + countInvite(lines) + 'x');
    gok('S1 hook still alternates invite/absolve', JSON.stringify(rets) === JSON.stringify([true, false, true, false]), 'returns=' + JSON.stringify(rets));
    const C = mf.sigCong || {};
    gok('S1 mechanic intact: phase absolve after 4 calls', C.phase === 'absolve', 'phase=' + C.phase);
    gok('S1 mechanic intact: cycle counted 4 turns', C.cycle === 4, 'cycle=' + C.cycle);
  }

  // S2: tbMonsterTurn-driven — the beam still ignites per cycle while
  // the steeple line stays at one per (fight, monster). The scholar
  // is beefed up so the beams cannot end the fixture fight.
  {
    const Game = await newGame(12);
    const lines = K.captureSays(Game);
    const mf = K.fight(Game, 'congregation', { hp: 5000 });
    gok('S2 Congregation fight started', !!Game.tbfight && !!mf, 'no fight/monster');
    await quietLog(async () => {
      for (let i = 0; i < 14; i++) {
        const p = Game.tbFighter ? Game.tbFighter('p') : null;
        if (p) { p.hp = p.maxHp; }
        try { Game.tbMonsterTurn(mf); } catch (e) {}
        if (!Game.tbfight || Game.tbfight.over) break;
      }
    });
    gok('S2 steeple line fires once across driven monster turns', countSteeple(lines) === 1, 'fired ' + countSteeple(lines) + 'x');
    gok('S2 beam still ignites per cycle (telegraph preserved)', countIgnite(lines) >= 1, 'ignitions=' + countIgnite(lines));
  }

  // S3: a second Congregation fight re-announces once (per-fight flag).
  {
    const Game = await newGame(13);
    const lines = K.captureSays(Game);
    const HB = (typeof global !== 'undefined' && global.MonsterBehaviorHooks) || null;
    let mf = K.fight(Game, 'congregation');
    await quietLog(async () => { HB.sigCongregation(Game, mf); HB.sigCongregation(Game, mf); });
    gok('S3 first fight: one steeple line', countSteeple(lines) === 1, 'fired ' + countSteeple(lines) + 'x');
    mf = K.fight(Game, 'congregation');
    await quietLog(async () => { HB.sigCongregation(Game, mf); HB.sigCongregation(Game, mf); });
    gok('S3 second fight re-announces once', countSteeple(lines) === 2, 'total fired ' + countSteeple(lines) + 'x');
  }

  console.log('test-steeple-a(game): ' + gpass + ' passed, ' + gfail + ' failed');
  if (gfail) process.exit(1);
}

if (require.main === module) {
  if (process.argv.indexOf('--game') !== -1) {
    gameLevel().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
  } else {
    console.log('test-steeple-a: instrument legs only (pass --game for the game-level legs)');
  }
}
