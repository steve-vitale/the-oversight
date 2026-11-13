// test-combatdedup-b.js — proof test for combat-line dedup
// (arm sim-combatdedup-b, run fleshout-loop-b-20261113T0830Z).
// §1–§3 prove the COUNTING instrument (regexes + per-day/per-fight
// aggregation + emit sites) without loading the game. §4 (game level,
// --game only) proves the OBSERVABLE effect: a villager striking the
// same monster round after round says the strike line ONCE per fight
// (not once per round), an ambush monster says SNAPS once per fight,
// while the hits themselves still land and still voice (tbDamage's
// "hits X for Y" line) and distinct attackers/targets still voice.
// RED before the fix (G1/G2 fire 3x), GREEN after (1x).
// Run: node scripts/test-combatdedup-b.js [--game]  (exit 0 = all green)
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const D = require(path.join(REPO, 'scripts', 'combatdedup-driver-20261113'));

let pass = 0, fail = 0;
function t(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

// §1 — the class regexes match the exact filed lines, and nothing else
// in the same families.
const FILED_STRIKE_1 = 'Catalina strikes the Scarred The Moderator.';
const FILED_STRIKE_2 = 'Ava strikes the Scarred ducks in a row (head).';
const FILED_STRIKE_3 = 'Priya strikes the Pack-leader Big Big.';
const FILED_FALLS = 'The Scarred ducks in a row (head) falls.';
const FILED_SNAPS = '💥 The Elder Buffering SNAPS! No warning. There never is.';
const FILED_FREEZE = 'The Pack-leader The Focus Group is still frozen from your scream.';
t('strike-re matches filed strike x14', D.STRIKE_RE.test(FILED_STRIKE_1));
t('strike-re matches filed strike x5', D.STRIKE_RE.test(FILED_STRIKE_2));
t('strike-re matches filed strike x3', D.STRIKE_RE.test(FILED_STRIKE_3));
t('strike-re matches harry variant', D.STRIKE_RE.test('Ava harries the Scarred ducks in a row (head).'));
t('strike-re ignores player strike line (has damage, varies)', !D.STRIKE_RE.test('You STRIKE the Scarred The Moderator for 12.'));
t('strike-re ignores tbDamage hit line', !D.STRIKE_RE.test('Catalina hits the Scarred The Moderator for 9.'));
t('strike-re ignores rage line', !D.STRIKE_RE.test("Catalina strikes through the red haze — RAGE! (9)"));
t('falls-re matches filed falls x7', D.FALLS_RE.test(FILED_FALLS));
t('falls-re matches villager falls', D.FALLS_RE.test('☠ Ava falls.'));
t('falls-re matches plain monster falls', D.FALLS_RE.test('The Hushwolf falls.'));
t('falls-re ignores hammer line', !D.FALLS_RE.test('"DEPLATFORMED." The hammer falls lighter than it could.'));
t('falls-re ignores windup line', !D.FALLS_RE.test('"DEPLATFORMED." The hammer RISES — slowly, savoring it. It falls next round.'));
t('snaps-re matches filed snaps x6', D.SNAPS_RE.test(FILED_SNAPS));
t('snaps-re matches turtle variant', D.SNAPS_RE.test('💥 The Speedbump SNAPS! Its head is suddenly somewhere else.'));
t('snaps-re ignores snap-decision telegraph', !D.SNAPS_RE.test("It doesn't move. It hasn't moved in an hour. Its head is suddenly somewhere else."));
t('freeze-re matches freeze line (control)', D.FREEZE_RE.test(FILED_FREEZE));
t('freeze-re ignores strike line', !D.FREEZE_RE.test(FILED_STRIKE_1));

// §2 — groupStats aggregation: per-day max, per-fight max, repeat
// lines, and the fight attribution that decides the falls rule.
const synth = [
  { day: 27, fight: 1, line: 'Catalina strikes the Scarred The Moderator.' },
  { day: 27, fight: 1, line: 'Catalina strikes the Scarred The Moderator.' },
  { day: 27, fight: 1, line: 'Catalina strikes the Scarred The Moderator.' },
  { day: 27, fight: 2, line: 'Catalina strikes the Scarred The Moderator.' },
  { day: 63, fight: 5, line: 'Catalina strikes the Elder Loud-Eyes.' },
  { day: 63, fight: 5, line: 'Catalina strikes the Elder Loud-Eyes.' },
];
const gs = D.groupStats(synth);
t('groupStats total', gs.total === 6, 'got ' + gs.total);
t('groupStats distinct', gs.distinct === 2, 'got ' + gs.distinct);
t('groupStats maxPerDay 4 (d27, across 2 fights)', gs.maxPerDay === 4 && gs.maxPerDayDay === 27, JSON.stringify({ m: gs.maxPerDay, d: gs.maxPerDayDay }));
t('groupStats maxPerFight 3 (fight 1)', gs.maxPerFight === 3, 'got ' + gs.maxPerFight);
t('groupStats repeatLines 4 (3 on d27 + 1 on d63)', gs.repeatLines === 4, 'got ' + gs.repeatLines);
t('groupStats worst group fights=2', gs.groups[0].count === 4 && gs.groups[0].fights === 2, JSON.stringify(gs.groups[0]));
t('groupStats empty list is zero', (function () { const e = D.groupStats([]); return e.total === 0 && e.maxPerDay === 0 && e.repeatLines === 0; })());

// §3 — the emit sites still exist on this tip (the lines the check
// counts), and the branch descends from the preregistered base.
let gameText = '';
try { gameText = fs.readFileSync(path.join(REPO, 'src', 'js', 'game.js'), 'utf8'); } catch (e) {}
t('emit site: villager strike line present', gameText.indexOf("a.type === 'strike' ? 'strikes' : 'harries'") !== -1);
t('emit site: monster falls line present', gameText.indexOf('encSubject(t)} falls.') !== -1);
t('emit site: ambush SNAPS line present', gameText.indexOf('SNAPS! No warning. There never is.') !== -1);
t('emit site: tbDamage hit line present', gameText.indexOf("hit${sourceLabel === 'you' ? '' : 's'} ${t.kind === 'player' ? 'you' : (this.encShortLabel(t) || t.name)} for ${final}.") !== -1);
let isDesc = false;
try { execSync('git merge-base --is-ancestor 85f9cbff6 HEAD', { cwd: REPO, stdio: 'ignore' }); isDesc = true; } catch (e) {}
t('HEAD descends from prereg base 85f9cbff6', isDesc);

console.log('test-combatdedup-b (instrument): ' + pass + ' passed, ' + fail + ' failed');
if (fail) process.exit(1);

// §4 — GAME-LEVEL RED/GREEN (runs only with --game).
// G0: the mechanism (sayOncePerFight) is intact — exact text once per
// fight, distinct text voices, new fight re-voices, refusals still
// dedup. Passes pre- AND post-fix (regression guard for the
// generalization, not the wiring proof).
// G1: villager strikes the same monster 3+ times in one fight — the
// strike line fires ONCE (RED pre-fix: 3x), the hits still land and
// still voice (hit lines >= strikes).
// G2: ambush monster (Buffering) adjacent 3 turns — SNAPS fires ONCE
// (RED pre-fix: 3x), the snap damage still lands each turn.
async function gameLevel() {
  const { loadGame, setupGame, quietLog } = require('./sim-harness');
  const K = require('./godpath/lib');
  let gpass = 0, gfail = 0;
  function gok(name, cond, extra) {
    if (cond) { gpass++; console.log('PASS(game) ' + name); }
    else { gfail++; console.log('FAIL(game) ' + name + (extra ? ' — ' + extra : '')); }
  }
  const countRe = (lines, re) => lines.filter(function (l) { return re.test(l); }).length;

  async function newGame(seed) {
    const { Game } = await loadGame({ seed: seed, mode: 'combatdedup-proof' });
    await setupGame(Game);
    return Game;
  }

  // G0 — mechanism intact (sayOncePerFight, fight-scoped exact text).
  {
    const Game = await newGame(7);
    const lines = K.captureSays(Game);
    const mf = K.fight(Game, 'hushwolf');
    gok('G0 fight started', !!Game.tbfight && !!mf, 'no fight/monster');
    const strikeText = 'Catalina strikes the Scarred The Moderator.';
    Game.sayOncePerFight(strikeText);
    Game.sayOncePerFight(strikeText);
    Game.sayOncePerFight(strikeText);
    gok('G0 same text 3x -> 1 line in a fight', countRe(lines, new RegExp(strikeText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))) === 1, 'got ' + countRe(lines, /Catalina strikes/));
    Game.sayOncePerFight('Priya strikes the Pack-leader Big Big.');
    gok('G0 distinct text still voices', countRe(lines, /Priya strikes/) === 1);
    Game.sayOncePerFight('Not mid-fight — finish it first.');
    Game.sayOncePerFight('Not mid-fight — finish it first.');
    gok('G0 refusal texts still dedup', countRe(lines, /Not mid-fight — finish it first\./) === 1);
    try { Game.tbEnd('fled'); } catch (e) {}
    const mf2 = K.fight(Game, 'hushwolf');
    gok('G0 second fight started', !!Game.tbfight && !!mf2, 'no second fight');
    Game.sayOncePerFight(strikeText);
    gok('G0 new fight re-voices the same text', countRe(lines, /Catalina strikes/) === 2, 'got ' + countRe(lines, /Catalina strikes/));
    try { Game.tbEnd('fled'); } catch (e) {}
    lines.restore();
  }

  // G1 — villager strike line: one fight, same attacker + target.
  {
    const Game = await newGame(11);
    const lines = K.captureSays(Game);
    const mf = K.fight(Game, 'hushwolf', { party: true, hp: 500 });
    gok('G1 fight started', !!Game.tbfight && !!mf, 'no fight/monster');
    if (mf) { mf.hp = 500; mf.maxHp = 500; }
    const pf = Game.tbFighter('p');
    if (pf) { pf.hp = 500; pf.maxHp = 500; }
    const vf = (Game.tbfight.fighters || []).find(function (f) { return f.kind === 'villager' && f.alive && !f.fled; });
    gok('G1 villager fighter present', !!vf, 'no villager fighter (roster empty?)');
    let strikes = 0, hits = 0, turns = 0;
    if (vf && mf) {
      vf.hp = vf.maxHp || 100;
      // RALLY HOLD (game.js tbVillagerTurn): rallied > 0 skips the hopeless
      // flee check — the driven villager holds the line. Ticks down
      // 1/turn: 20 lasts the loop.
      // KNOWS THE SPECIES (villager-agency.js fighterState): a naive
      // villager (speciesFought=false) with fighterFear >= 0.35 decides
      // 'flee' every turn, and rallied converts that to a wait line — so
      // no strike ever happens. The knowledge lives in the agency
      // ledger (know[vid].fought), NOT on the fighter: applyFighterState
      // re-stamps ai/fleeLine/fighterFear/speciesFought from the ledger
      // at the top of every tbVillagerTurn, so direct field sets are
      // clobbered. Grant the lived knowledge properly: this villager HAS
      // fought hushwolves before — fear drops, the flee line drops, the
      // AI tag goes brave, and an adjacent villager strikes.
      vf.rallied = 20;
      try {
        const ag = Game.agencyState();
        ag.know = ag.know || {};
        const rec = ag.know[vf.villagerId] || (ag.know[vf.villagerId] = { plants: 0, monsters: 0, places: [], fought: [] });
        rec.fought = rec.fought || [];
        if (rec.fought.indexOf('hushwolf') === -1) rec.fought.push('hushwolf');
      } catch (e) { console.log('G1 know-grant failed: ' + String(e && e.message)); }
      vf.mx = mf.mx - 1; vf.my = mf.my; // adjacent: in strike reach
      await quietLog(async function () {
        for (let i = 0; i < 12 && hits < 3; i++) {
          if (!Game.tbfight || Game.tbfight.over || !mf.alive || !vf.alive || vf.fled) break;
          const before = lines.length;
          try { Game.tbVillagerTurn(vf); } catch (e) { console.log('G1 tbVillagerTurn threw: ' + String(e && e.message)); break; }
          turns++;
          const fresh = lines.slice(before);
          strikes += countRe(fresh, D.STRIKE_RE);
          hits += countRe(fresh, / hits .* for \d+\./);
          // The villager may move; keep them adjacent for the next turn.
          if (vf.alive && !vf.fled && mf.alive) { vf.mx = mf.mx - 1; vf.my = mf.my; }
        }
      });
    }
    console.log('G1 observed: turns=' + turns + ' strikeLines=' + strikes + ' hitLines=' + hits);
    gok('G1 villager struck 3+ times (drive valid)', hits >= 3, 'hits=' + hits + ' — drive did not produce 3 strikes');
    gok('G1 strike line fires ONCE per fight (not per strike)', strikes === 1, 'got ' + strikes + ' strike lines for ' + hits + ' hits');
    gok('G1 hits still voice (no outcome loss)', hits >= 3, 'got ' + hits);
    try { Game.tbEnd('fled'); } catch (e) {}
    lines.restore();
  }

  // G2 — ambush SNAPS: Buffering adjacent, 3 monster turns.
  {
    const Game = await newGame(13);
    const lines = K.captureSays(Game);
    const mf = K.fight(Game, 'buffering', { hp: 500 });
    gok('G2 fight started', !!Game.tbfight && !!mf, 'no fight/monster');
    if (mf) { mf.hp = 500; mf.maxHp = 500; }
    const pf = Game.tbFighter('p');
    if (pf) { pf.hp = 500; pf.maxHp = 500; pf.mx = mf.mx - 1; pf.my = mf.my; }
    let snaps = 0, turns = 0;
    const php0 = pf ? pf.hp : null;
    if (mf && pf) {
      // Buffering snaps roughly every 3rd turn (telegraph cycle: it
      // declares a step, steps, then snaps when a foe is adjacent), so
      // 9 turns yield ~3 snaps pre-fix. Post-fix the announcement fires
      // once while the snap DAMAGE still lands every cycle.
      await quietLog(async function () {
        for (let i = 0; i < 9; i++) {
          if (!Game.tbfight || Game.tbfight.over || !mf.alive) break;
          // Keep the player adjacent: the snap needs a foe within 1.
          if (pf.alive) { pf.mx = mf.mx - 1; pf.my = mf.my; }
          const before = lines.length;
          try { Game.tbMonsterTurn(mf); } catch (e) { console.log('G2 tbMonsterTurn threw: ' + String(e && e.message)); break; }
          turns++;
          snaps += countRe(lines.slice(before), D.SNAPS_RE);
        }
      });
    }
    console.log('G2 observed: turns=' + turns + ' snapsLines=' + snaps + ' php ' + php0 + '->' + (pf && pf.hp));
    gok('G2 monster took 6+ turns (drive valid)', turns >= 6, 'turns=' + turns);
    gok('G2 SNAPS fires ONCE per fight (not per cycle)', snaps === 1, 'got ' + snaps + ' SNAPS lines in ' + turns + ' turns');
    gok('G2 snap damage still lands (no outcome loss)', pf && php0 != null && pf.hp < php0, 'php ' + php0 + '->' + (pf && pf.hp));
    try { Game.tbEnd('fled'); } catch (e) {}
    lines.restore();
  }

  console.log('test-combatdedup-b (game): ' + gpass + ' passed, ' + gfail + ' failed');
  if (gfail) process.exit(1);
}

if (process.argv.indexOf('--game') !== -1) {
  gameLevel().catch(function (e) { console.error(e.stack); process.exit(1); });
}
