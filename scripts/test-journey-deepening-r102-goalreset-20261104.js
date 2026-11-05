// test-journey-deepening-r102-goalreset-20261104.js -- proof for the r102
// villager-goal stale-annotation fix (villager-objectives.js) + the r102
// analyzer G-scan fixtures. Tooling + one live-game proof, zero repo
// writes: prints PASS/FAIL lines, exit 0 = all pass, 1 = any fail.
//
// The defect (found by the r102 deepening panel, 19/19 mismatches on
// kinds that can never carry a fresh annotation): objPick resets stale
// hunt/chore tags on a fresh pick but never resets o.goal/o.goalLine,
// so a villager whose new objective was not goal-boosted keeps the
// previous errand's goal annotation — and the departure line appends
// obj.goalLine unconditionally. Early returns (REST/EAT/LEAVE/SEEK/
// HAUL) and the GUARD companion overwrite and the agency EXPLORE
// overwrite never set a goal either, so they inherit the same stale
// annotation. The fix clears goal/goalLine wherever a new errand is
// assigned (objPick top, GUARD overwrite, agency EXPLORE overwrite);
// the departure line then speaks a reason only when this errand's own
// pick earned one.
//
// Live proof pattern follows test-villager-goals-20261103.js (same
// fixture seed 98901, setNeeds with read-back). Pre-fix, cases
// EAT-clears and REST-clears FAIL (stale goal survives); post-fix all
// pass. The lottery sweep asserts the post-fix invariant on every pick:
// goal null, or the goal's kind set contains the picked kind.
// Usage: node scripts/test-journey-deepening-r102-goalreset-20261104.js
'use strict';
const fs = require('fs');
const path = require('path');
const repo = path.join(__dirname, '..');
const { loadGame, setupGame } = require(path.join(repo, 'scripts', 'sim-harness'));
const { summarizeGoals } = require('./analyze-journey-deepening-r102-20261104.js');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}
const GOAL_KINDS = {
  party_up: ['VISIT'], gear_up: ['FORAGE', 'TRAPS'], bank_veterans: ['HUNT'],
  build_standing: ['VISIT'], food_security: ['FORAGE', 'WATER', 'HAUL'],
  bonds: ['VISIT', 'HAVEN_CHORE'], knowledge: ['SEEK'], safety: ['HAVEN_CHORE'],
};

(async () => {
  const { Game } = await loadGame({ seed: 98901, mode: 'herald', fullTelemetry: false });
  await setupGame(Game);
  if (typeof Game.objPick !== 'function' || typeof Game.objOf !== 'function') {
    console.log('SKIP goals API or objPick missing'); process.exit(2);
  }
  const v = Game.state.village || {};
  const hx = (v.px == null ? 4 : v.px), hy = (v.py == null ? 4 : v.py);
  const npcs = (v.roster || []).filter(id => id !== Game.villagerId);
  const alive = npcs.filter(id => { try { const p = Game.getPerson(id); return p && !p.dead; } catch (e) { return false; } });
  if (!alive.length) { console.log('SKIP roster empty'); process.exit(2); }
  // Prefer a villager whose npcGoal is not 'escape' (LEAVE path skips the
  // lottery but still must clear — covered by the same top-of-pick reset).
  let vid = null;
  for (const id of alive) { try { if (Game.npcGoal(id) !== 'escape') { vid = id; break; } } catch (e) {} }
  if (!vid) vid = alive[0];
  const setNeeds = (o) => {
    try {
      const n = Game.npcNeeds(vid);
      if (!n) return false;
      Object.assign(n, o);
      const back = Game.npcNeeds(vid);
      for (const k of Object.keys(o)) if (back[k] !== o[k]) return false;
      return true;
    } catch (e) { return false; }
  };
  // Pantry must clear 500 kcal for the EAT early return.
  try {
    const pk = (typeof Game.pantryKcalLive === 'function') ? Game.pantryKcalLive(v) : 0;
    if (!(pk > 500)) {
      (v.pantry = v.pantry || []).push({ id: 'proof_pantry', kcalEach: 5000, units: 1 });
    }
  } catch (e) {}

  // Case 1: EAT early return clears a stale goal.
  Game.objOf(vid).goal = 'party_up';
  Game.objOf(vid).goalLine = 'Company makes the road shorter.';
  if (!setNeeds({ hunger: 90, energy: 100, fear: 0 })) { console.log('SKIP needs mutation did not read back'); process.exit(2); }
  let o = null;
  try { o = Game.objPick(vid, hx, hy); } catch (e) { check('EAT pick does not throw', false, String(e && e.message)); }
  check('EAT pick kind', o && o.kind === 'EAT', o && o.kind);
  check('EAT pick clears goal', o && o.goal == null, o && JSON.stringify(o.goal));
  check('EAT pick clears goalLine', o && o.goalLine == null, o && JSON.stringify(o.goalLine));

  // Case 2: REST early return clears a stale goal.
  Game.objOf(vid).goal = 'food_security';
  Game.objOf(vid).goalLine = "The pantry won't fill itself.";
  setNeeds({ hunger: 0, energy: 10, fear: 0 });
  try { o = Game.objPick(vid, hx, hy); } catch (e) { check('REST pick does not throw', false, String(e && e.message)); }
  check('REST pick kind', o && o.kind === 'REST', o && o.kind);
  check('REST pick clears goal', o && o.goal == null, o && JSON.stringify(o.goal));
  check('REST pick clears goalLine', o && o.goalLine == null, o && JSON.stringify(o.goalLine));

  // Case 3: lottery invariant sweep — 20 fresh picks, each either
  // unannotated or annotated with a goal covering the picked kind.
  setNeeds({ hunger: 0, energy: 100, fear: 0 });
  let sweepBad = [];
  for (let i = 0; i < 20; i++) {
    Game.objOf(vid).goal = 'safety';
    Game.objOf(vid).goalLine = 'Better close to the fire today.';
    try { o = Game.objPick(vid, hx, hy); } catch (e) { sweepBad.push('throw:' + (e && e.message)); break; }
    if (!o) { sweepBad.push('null-objective'); break; }
    if (o.goal != null && !(GOAL_KINDS[o.goal] || []).includes(o.kind)) {
      sweepBad.push(o.kind + '+' + o.goal);
    }
    if (o.goal == null && o.goalLine != null) sweepBad.push(o.kind + '+null-goal-with-line');
  }
  check('lottery sweep invariant (20 picks)', sweepBad.length === 0, sweepBad.slice(0, 5).join(','));

  // Case 4: source markers for all three fix sites.
  const src = fs.readFileSync(path.join(repo, 'src', 'js', 'villager-objectives.js'), 'utf8');
  const pickAt = src.indexOf('objPick(vid, hx, hy) {');
  const pickBlock = pickAt === -1 ? '' : src.slice(pickAt, pickAt + 1200);
  check('fix site objPick clears goal', /o\.goal = null; o\.goalLine = null;/.test(pickBlock), 'objPick head lacks reset');
  const guardAt = src.indexOf("co2.kind = 'GUARD'");
  const guardBlock = guardAt === -1 ? '' : src.slice(guardAt, guardAt + 400);
  check('fix site GUARD clears goal', /co2\.goal = null; co2\.goalLine = null;/.test(guardBlock), 'GUARD overwrite lacks reset');
  const expAt = src.indexOf("o.kind = 'EXPLORE'; o.purpose = 'expedition'");
  const expBlock = expAt === -1 ? '' : src.slice(expAt, expAt + 400);
  check('fix site agency EXPLORE clears goal', /o\.goal = null; o\.goalLine = null;/.test(expBlock), 'agency EXPLORE overwrite lacks reset');

  // Case 5: analyzer G-scan fixtures (assigned / annotated / mismatch /
  // stale-done / returning / stick / churn).
  const fixSeed = {
    goalSnaps: [
      { day: 45, villagers: [
        { vid: 'a', name: 'A', top: 'party_up', weights: { party_up: 2 }, objKind: 'VISIT', objState: 'out', objGoal: 'party_up', objGoalLine: 'x' },
        { vid: 'b', name: 'B', top: 'food_security', weights: { food_security: 2 }, objKind: 'EXPLORE', objState: 'out', objGoal: 'food_security', objGoalLine: 'x' },
        { vid: 'c', name: 'C', top: null, weights: {}, objKind: 'idle', objState: 'done', objGoal: 'safety', objGoalLine: 'x' },
        { vid: 'd', name: 'D', top: 'party_up', weights: { party_up: 2 }, objKind: 'VISIT', objState: 'returning', objGoal: 'party_up', objGoalLine: 'x' },
      ] },
      { day: 60, villagers: [
        { vid: 'a', name: 'A', top: 'party_up', weights: { party_up: 2 }, objKind: 'FORAGE', objState: 'out', objGoal: null, objGoalLine: null },
        { vid: 'b', name: 'B', top: 'food_security', weights: { food_security: 2 }, objKind: 'HUNT', objState: 'out', objGoal: 'food_security', objGoalLine: 'x' },
      ] },
      { day: 80, villagers: [
        { vid: 'a', name: 'A', top: 'party_up', weights: { party_up: 2 }, objKind: 'VISIT', objState: 'out', objGoal: 'party_up', objGoalLine: 'x' },
        { vid: 'b', name: 'B', top: 'safety', weights: { safety: 2 }, objKind: 'HAVEN_CHORE', objState: 'ready', objGoal: 'safety', objGoalLine: 'x' },
      ] },
    ],
    goalLines: { counts: { party_up: 3 }, total: 3 },
  };
  const g = summarizeGoals(fixSeed);
  check('G-scan day45 assigned', g.days[0].assigned === 3, JSON.stringify(g.days[0]));
  check('G-scan day45 annotated', g.days[0].annotated === 2, JSON.stringify(g.days[0]));
  check('G-scan day45 mismatch EXPLORE', g.days[0].mismatched === 1, JSON.stringify(g.days[0]));
  check('G-scan day45 stale is done/idle only', g.days[0].stale === 1, JSON.stringify(g.days[0]));
  check('G-scan day45 returning separate', g.days[0].returning === 1, JSON.stringify(g.days[0]));
  check('G-scan day60 mismatch HUNT', g.days[1].mismatched === 1, JSON.stringify(g.days[1]));
  check('G-scan stick A only', g.stick && g.stick.nAllDays === 2 && g.stick.stuck === 1, JSON.stringify(g.stick));
  check('G-scan churn B tops', g.stick && JSON.stringify(g.stick.churnDetail) === JSON.stringify([{ name: 'B', tops: ['food_security', 'food_security', 'safety'] }]), JSON.stringify(g.stick));

  console.log(`\nRESULT pass=${pass} fail=${fail}`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.log('ERROR ' + (e && e.stack || e)); process.exit(1); });
