// test-rageprecheck-b.js — proof test for the engine precheck (B)
// (arm sim-rageprecheck-b, run fleshout-loop-b-20261114T0330Z).
// Finding (sim-rageloop-b): lever (A) zeroed competent (62 -> 0) but the
// summed primary went 117 -> 7 — capable presses once through its own
// guard, then competent's fallback presses a second time through a
// separate once-per-fight map. Two maps, one fight, two presses.
// Lever (B): a single choke point in the ENGINE —
// ABILITY_ACTION_PRECHECKS['rage.unleash_rage'] refuses a re-press while
// rageActive is live (rounds > 0), before payment (haymaker shape), so
// no turn and no 60 kcal are charged on refusal. (A) is NOT resurrected:
// competent.js must show NO !pressed.rage guard.
// Run: node scripts/test-rageprecheck-b.js [--game]  (exit 0 = all green)
//   --game runs the engine legs (§2, staged fights) and the driver legs
//   (§3, one 150d sim per policy on seed 98801): successful
//   refresh-unspent presses -> 0.
// RED->GREEN: on the prereg commit the §1 precheck legs and the §2
// R1/R2 legs fail (no precheck; the engine re-arms every press). On the
// fix commit all legs pass.
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = path.join(__dirname, '..');

let pass = 0, fail = 0;
function t(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

const compText = (function () { try { return fs.readFileSync(path.join(REPO, 'scripts', 'policies', 'competent.js'), 'utf8'); } catch (e) { return ''; } })();
const capText = (function () { try { return fs.readFileSync(path.join(REPO, 'scripts', 'policies', 'capable.js'), 'utf8'); } catch (e) { return ''; } })();
const aaText = (function () { try { return fs.readFileSync(path.join(REPO, 'src', 'js', 'abilityActions.js'), 'utf8'); } catch (e) { return ''; } })();

// §1 — the precheck exists, in the haymaker shape, and (A) is NOT back.
t('precheck: rage.unleash_rage entry exists in ABILITY_ACTION_PRECHECKS',
  aaText.indexOf("'rage.unleash_rage': function (game)") !== -1);
t('precheck: refuses while rageActive.rounds > 0',
  aaText.indexOf('rageActive') !== -1 && /'rage\.unleash_rage': function \(game\)[\s\S]{0,2500}?\(ra\.rounds \|\| 0\) > 0/.test(aaText));
t('precheck: refusal why names the live buff (already down / already doubled)',
  /'rage\.unleash_rage': function \(game\)[\s\S]{0,2500}?already down/.test(aaText));
t('precheck: haymaker precheck intact (mirror)',
  aaText.indexOf("'haymaker.throw_haymaker': function (game)") !== -1 &&
  aaText.indexOf('Already wound up') !== -1);
t('engine: rage key appears exactly twice (precheck + impl), no third copy',
  (aaText.match(/'rage\.unleash_rage'/g) || []).length === 2);
t('impl: unleash_rage still arms 3 rounds (mechanic intact)',
  aaText.indexOf('s.rageActive = { rounds: 3, dmgMult: 2.0 };') !== -1);
t('impl: steeple once-per-fight SAY dedup untouched',
  aaText.indexOf('_rageAnnounced') !== -1);
t('no-(A): competent.js carries NO !pressed.rage guard (not resurrected)',
  compText.indexOf('pressed.rage') === -1);
t('control: capable already guards rage with n<1 (unchanged)',
  capText.indexOf("I.n('rage.unleash_rage') < 1") !== -1);
(function () {
  let ok = false, extra = '';
  try {
    const defs = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'abilities.json'), 'utf8'));
    const list = Array.isArray(defs) ? defs : (defs.abilities || []);
    const rage = list.find(function (a) { return a && a.id === 'rage'; });
    const act = rage && (rage.actions || []).find(function (a) { return a && a.id === 'unleash_rage'; });
    ok = !!(act && act.cost && act.cost.kcal === 60 && act.cost.turn === true);
    extra = 'cost=' + JSON.stringify(act && act.cost);
  } catch (e) { extra = String(e.message).slice(0, 80); }
  t('canon: rage/unleash_rage costs turn + 60 kcal (abilities.json)', ok, extra);
})();

// §1b — the prereg commit is an ancestor and the prereg file is the one
// this arm is bound by (a rebase rewrites the hash, so resolve by the
// exact commit message, as test-rageloop-b §1b does).
let head = 'unknown', preregSha = '', isAncestor = false, preregSame = false;
try { head = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim(); } catch (e) {}
try { preregSha = execSync("git log --format=%H --grep='^sim-rageprecheck-b prereg' -1 HEAD", { cwd: REPO }).toString().trim(); } catch (e) {}
try { execSync('git merge-base --is-ancestor ' + preregSha + ' HEAD', { cwd: REPO }); isAncestor = true; } catch (e) {}
try {
  const atCommit = execSync('git rev-parse ' + preregSha + ':evidence/2026-11-14/sim-rageprecheck-b-prereg.md', { cwd: REPO }).toString().trim();
  const working = execSync('git hash-object evidence/2026-11-14/sim-rageprecheck-b-prereg.md', { cwd: REPO }).toString().trim();
  preregSame = !!preregSha && atCommit === working;
} catch (e) {}
t('prereg commit (by message) is an ancestor of this HEAD', !!preregSha && isAncestor, 'prereg ' + preregSha.slice(0, 12) + ' HEAD ' + head.slice(0, 12));
t('prereg file at that commit matches the working prereg file', preregSame);

console.log('test-rageprecheck-b: ' + pass + ' passed, ' + fail + ' failed');
if (fail) process.exit(1);

// §2+§3 — GAME-LEVEL RED/GREEN (runs only with --game).
// R1: fresh press lands (rounds=3, -60 kcal, turn spent); an immediate
// re-press is refused (false, rounds still 3, kcal unchanged, turn NOT
// spent — p.acted stays false), and the refusal line says the red is
// already down. R2: after one strike (rounds 3->2) a re-press is still
// refused (partly-spent is still live). R3: after three strikes the
// buff is spent (rounds gone) and a fresh press lands again. R4: a new
// fight allows a fresh press. §3: the instrumented driver on seed
// 98801, 150d — successful refresh (rounds=3) presses -> 0 per policy,
// every rage call fresh (the availability gate stops re-press attempts
// before useAbility, so refused=0 in sims is correct — the refusal
// itself is proven by R1/R2), fighter actually struck.
async function gameLevel() {
  const { loadGame, setupGame, quietLog } = require('./sim-harness');
  const K = require('./godpath/lib');
  let gpass = 0, gfail = 0;
  function gok(name, cond, extra) {
    if (cond) { gpass++; console.log('PASS(game) ' + name); }
    else { gfail++; console.log('FAIL(game) ' + name + (extra ? ' — ' + extra : '')); }
  }

  async function newGame(seed) {
    const { Game } = await loadGame({ seed: seed, mode: 'rageprecheck-proof' });
    await setupGame(Game);
    return Game;
  }

  // One staged fight: bulked hushwolf (500 HP, so it survives the
  // enraged strikes), scholar adjacent. Helpers per test-rageloop-b P3:
  // K.fight stages the monster 4 tiles away, so step adjacent before
  // striking; reset the turn before pressing (a press while acted is
  // refused for a different reason).
  function stageFight(Game) {
    const mf = K.fight(Game, 'hushwolf');
    if (mf) { mf.hp = 500; mf.maxHp = 500; }
    return mf;
  }
  function resetTurn(Game) {
    const p = Game.tbFighter ? Game.tbFighter('p') : null;
    if (p) { p.acted = false; p.moveLeft = 1; }
    return p;
  }
  function stepAdjacent(Game, key) {
    const p = Game.tbFighter ? Game.tbFighter('p') : null;
    const m = Game.tbfight && Game.tbfight.fighters.find(function (x) { return x.key === key; });
    if (p && m) {
      for (let s = 0; s < 8; s++) {
        const d = Math.max(Math.abs((m.mx || 0) - (p.mx || 0)), Math.abs((m.my || 0) - (p.my || 0)));
        if (d <= 1) break;
        const nx = (p.mx || 0) + Math.sign((m.mx || 0) - (p.mx || 0));
        const ny = (p.my || 0) + Math.sign((m.my || 0) - (p.my || 0));
        Game.tbPlayerMove(nx, ny);
        p.acted = false; p.moveLeft = 1;
      }
    }
  }
  function rawPress(Game) {
    // Reset the turn FIRST, press WITHOUT resetting after, and report
    // what the press itself did to the turn/kcal/rounds.
    resetTurn(Game);
    const kcalBefore = Game.state.scholar.kcal;
    const ok = Game.useAbility('rage', 'unleash_rage');
    const p = Game.tbFighter ? Game.tbFighter('p') : null;
    const ra = Game.state.scholar.rageActive;
    return {
      ok: ok,
      actedAfter: !!(p && p.acted),
      kcalAfter: Game.state.scholar.kcal,
      kcalBefore: kcalBefore,
      rounds: ra ? (ra.rounds ?? null) : null,
    };
  }
  function strike(Game, key) {
    stepAdjacent(Game, key);
    resetTurn(Game);
    return Game.tbPlayerStrike(key);
  }

  // R1–R3 in one fight.
  {
    const Game = await newGame(21);
    K.giveAbility(Game, 'rage');
    Game.state.scholar.kcal = 5000;
    const mf = stageFight(Game);
    gok('R1 fight started (bulked hushwolf)', !!Game.tbfight && !!mf, 'no fight/monster');
    const key = mf.key;
    let said = [];
    const origSay = Game.say;
    Game.say = function (t) { said.push(String(t)); return origSay.apply(this, arguments); };
    let r1 = null, r1b = null, r2 = null, r3 = null, r3b = null;
    await quietLog(async () => {
      r1 = rawPress(Game);
      said = [];
      r1b = rawPress(Game);
      const refusalLine = said.join(' ');
      r1b.line = refusalLine;
      strike(Game, key);
      said = [];
      r2 = rawPress(Game);
      r2.line = said.join(' ');
      strike(Game, key);
      strike(Game, key);
      const ra = Game.state.scholar.rageActive;
      r3 = { spent: !ra || (ra.rounds || 0) <= 0, rounds: ra ? (ra.rounds ?? null) : null };
      r3b = rawPress(Game);
    });
    Game.say = origSay;
    gok('R1 fresh press lands', r1.ok === true, 'returned ' + r1.ok);
    gok('R1 fresh press arms 3 rounds', r1.rounds === 3, 'rounds=' + r1.rounds);
    gok('R1 fresh press charges 60 kcal', r1.kcalAfter === r1.kcalBefore - 60, 'kcal ' + r1.kcalBefore + ' -> ' + r1.kcalAfter);
    gok('R1 fresh press spends the turn', r1.actedAfter === true, 'acted=' + r1.actedAfter);
    gok('R1 re-press while live (rounds=3) is refused', r1b.ok === false, 'returned ' + r1b.ok);
    gok('R1 refusal leaves rounds at 3', r1b.rounds === 3, 'rounds=' + r1b.rounds);
    gok('R1 refusal charges no kcal', r1b.kcalAfter === r1b.kcalBefore, 'kcal ' + r1b.kcalBefore + ' -> ' + r1b.kcalAfter);
    gok('R1 refusal spends no turn', r1b.actedAfter === false, 'acted=' + r1b.actedAfter);
    gok('R1 refusal says the red is already down', /already down/i.test(r1b.line || ''), 'line=' + (r1b.line || '').slice(0, 120));
    gok('R2 re-press while partly spent (rounds=2) is refused', r2.ok === false, 'returned ' + r2.ok);
    gok('R2 refusal leaves rounds at 2', r2.rounds === 2, 'rounds=' + r2.rounds);
    gok('R2 refusal charges no kcal', r2.kcalAfter === r2.kcalBefore, 'kcal ' + r2.kcalBefore + ' -> ' + r2.kcalAfter);
    gok('R3 three strikes spend the buff (rounds 3 -> gone)', r3.spent === true, 'rounds=' + r3.rounds);
    gok('R3 fresh press allowed after spend', r3b.ok === true, 'returned ' + r3b.ok);
    gok('R3 fresh press re-arms 3 rounds', r3b.rounds === 3, 'rounds=' + r3b.rounds);
  }

  // R4: a new fight allows a fresh press (fight-end hygiene + precheck
  // scoped to the live buff, not to the day or the run).
  {
    const Game = await newGame(24);
    K.giveAbility(Game, 'rage');
    Game.state.scholar.kcal = 5000;
    const mf = stageFight(Game);
    gok('R4 new fight started', !!Game.tbfight && !!mf, 'no fight/monster');
    let r4 = null;
    await quietLog(async () => { r4 = rawPress(Game); });
    gok('R4 fresh press allowed in the new fight', r4.ok === true, 'returned ' + r4.ok);
    gok('R4 fresh press arms 3 rounds', r4.rounds === 3, 'rounds=' + r4.rounds);
  }

  // §3: driver legs — seed 98801, 150d, one sim per policy.
  {
    const D = require('./rageprecheck-driver-20261114');
    let c = null, k = null;
    await quietLog(async () => { c = await D.oneRun(98801, 'competent'); });
    await quietLog(async () => { k = await D.oneRun(98801, 'capable'); });
    gok('G1 competent seed 98801: successful refresh (rounds=3) presses -> 0', c.ragePressRefreshUnspent === 0,
      'refreshUnspent=' + c.ragePressRefreshUnspent + ' of ' + c.ragePressCount + ' calls');
    gok('G1 competent seed 98801: partly-spent refreshes -> 0', (c.ragePressRefreshPartly || 0) === 0,
      'refreshPartly=' + c.ragePressRefreshPartly);
    // The choke point fires at the AVAILABILITY gate in sims, not at
    // useAbility: competent's tryPress checks Game._actionAvailable
    // (which runs the same precheck) before calling useAbility, so no
    // re-press attempt ever reaches the engine — refused=0 is the
    // CORRECT outcome here, not a missed fire. The useAbility-level
    // refusal is proven directly by the R1/R2 legs above (rawPress
    // bypasses tryPress). What the sim must show: every useAbility
    // call was fresh (calls == fresh), i.e. no refresh attempt at all.
    gok('G1 competent seed 98801: every rage call was fresh (calls == fresh)', c.ragePressCount === c.ragePressFresh,
      'calls=' + c.ragePressCount + ' fresh=' + c.ragePressFresh + ' refused=' + c.ragePressRefused);
    gok('G1 competent seed 98801: fighter actually struck', (c.strikesLanded || 0) > 0,
      'strikes=' + c.strikesLanded);
    gok('G1 capable seed 98801: successful refresh presses -> 0', k.ragePressRefreshUnspent === 0,
      'refreshUnspent=' + k.ragePressRefreshUnspent + ' of ' + k.ragePressCount + ' calls');
    gok('G1 capable seed 98801: fighter actually struck', (k.strikesLanded || 0) > 0,
      'strikes=' + k.strikesLanded);
  }

  console.log('test-rageprecheck-b(game): ' + gpass + ' passed, ' + gfail + ' failed');
  if (gfail) process.exit(1);
}

if (require.main === module) {
  if (process.argv.indexOf('--game') !== -1) {
    gameLevel().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
  } else {
    console.log('test-rageprecheck-b: instrument legs only (pass --game for the game-level legs)');
  }
}
