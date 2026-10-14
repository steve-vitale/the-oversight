#!/usr/bin/env node
// test-capable-bot-20261014.js — proof that the CAPABLE bot's behaviours fire
// (Steve 2026-10-14: "Build a bot"; evidence/2026-10-14/simulator-audit.md §2).
//
// Scenario checks (one process, one load, fresh run per check):
//   1. REAL FLEE: hurt scholar away from Haven vs a strong monster -> the bot
//      walks to the havenward edge and pushes THROUGH (fight ends, node changes).
//   2. ABILITIES: a held combat action fires through Game.useAbility
//      (ability_used telemetry), and never below the hunger gate.
//   3. CHOICES: ability offer scored (synergy leg beats card 0); Table seat
//      taken when tablePreview().ready; trial-by-combat never picked; path by
//      strength, not position; contest phase by reward-vs-harm.
//   4. CONVERSATION: a held sitting with real turns, target by need.
//   5. competent.beastStrikeTarget: steps within moveLeft (was a "Too far" no-op).
// Short sims (2 seeds x 40 days): contests answered, conversations held, no
// policy-side errors.
'use strict';
const K = require('./godpath/lib');
const H = K.H;
const { capable, capableSummary, scoreOffer, scoreTableOption } = require('./policies/capable');
const C = require('./policies/competent');

const T = K.reporter('test-capable-bot-20261014');

function drive(Game, ctx, maxIter) {
  // the harness's fight driver, with our policy
  H.driveFights(Game, capable, ctx);
  let n = 0;
  while (Game.tbfight && !Game.tbfight.over && n++ < (maxIter || 20)) H.driveFights(Game, capable, ctx);
}

(async () => {
  global.__policyRandom = H.mulberry32(12345);
  const Game = await K.load({ seed: 7 });

  // ---------- 1. real flee ----------
  T.section('1. real flee exits the fight');
  {
    K.newRun(Game);
    Game.map.px = 4; Game.map.py = 6; // two nodes south of Haven: havenward = north
    const mid = (Game.data.monsters || []).filter(m => (m.wave || 1) >= 2).sort((a, b) => (b.hp || 0) - (a.hp || 0))[0].id;
    K.fight(Game, mid, { px: 4, py: 4, mx: 4, my: 7, hp: 100 });
    const pf = Game.tbFighter('p'); pf.hp = 30; // hurt: < 35%
    const ctx = { notes: [] };
    const from = [Game.map.px, Game.map.py];
    let guard = 0;
    while (Game.tbfight && !Game.tbfight.over && guard++ < 30) {
      if (Game.tbIsPlayerTurn()) { if (!capable.fight(Game, ctx)) break; }
      else break;
    }
    const s = capableSummary(ctx);
    T.ok('flee decided', s.capFleeDecisions >= 1, JSON.stringify(s));
    T.ok('pushed through the barrier', s.capFleePushes >= 1, JSON.stringify(s));
    T.ok('fight exited (not just walked to the edge)', s.capFleeExits >= 1 || !Game.tbfight || Game.tbfight.over, JSON.stringify(s));
    T.ok('left the node havenward', Game.map.py < from[1], `from ${from} now ${[Game.map.px, Game.map.py]}`);
    T.ok('no policy errors', !(ctx.capErrors || []).length, JSON.stringify(ctx.capErrors));
  }

  // ---------- 2. abilities in combat ----------
  T.section('2. abilities fire in combat through useAbility');
  {
    K.newRun(Game);
    K.openSlots(Game, 6);
    K.giveAbility(Game, 'pocket_sand', { force: true });
    K.giveAbility(Game, 'static_toss', { force: true });
    Game.state.scholar.kcal = 2000;
    const before = K.teleEvents(Game, 'ability_used').length;
    K.fight(Game, 'hushwolf', { px: 3, py: 4, mx: 5, my: 4, hp: 200 });
    const ctx = { notes: [] };
    drive(Game, ctx, 6);
    const after = K.teleEvents(Game, 'ability_used').length;
    T.ok('capAbilityUses > 0', (ctx.capAbilityUses || 0) > 0, JSON.stringify(ctx.capAbilityById || {}));
    T.ok('ability_used telemetry > 0', after > before, `before ${before} after ${after}`);
    // hunger gate: below 500 kcal the bot never taps an ability
    K.newRun(Game);
    K.openSlots(Game, 6);
    K.giveAbility(Game, 'static_toss', { force: true });
    Game.state.scholar.kcal = 300;
    K.fight(Game, 'hushwolf', { px: 3, py: 4, mx: 5, my: 4, hp: 200 });
    const ctx2 = { notes: [] };
    if (Game.tbIsPlayerTurn()) capable.fight(Game, ctx2);
    T.ok('hunger gate respected (no use at kcal 300)', !(ctx2.capAbilityUses > 0) && (ctx2.capAbilityHungerSkips || 0) >= 1, JSON.stringify(capableSummary(ctx2)));
    try { if (Game.tbfight) Game.tbEnd('fled'); } catch (e) { Game.tbfight = null; }
  }

  // ---------- 3. choices by scoring ----------
  T.section('3. choices are scored, not option 0');
  {
    K.newRun(Game);
    K.openSlots(Game, 6);
    // a synergy leg: hold one half of a two-leg synergy, offer the other half second
    const syn = (Game.data.synergies || []).find(x => Array.isArray(x.requires) && x.requires.length === 2 &&
      x.requires.every(id => (Game.data.abilities || []).some(a => a.id === id)));
    const [legA, legB] = syn.requires;
    K.giveAbility(Game, legA, { force: true });
    const filler = (Game.data.abilities || []).find(a => a.id !== legA && a.id !== legB && !(Game.data.synergies || []).some(y => (y.requires || []).includes(a.id)));
    const held = [legA];
    T.ok(`offer scoring: synergy leg ${legB} beats ${filler.id}`, scoreOffer(Game, { id: legB }, held) > scoreOffer(Game, { id: filler.id }, held) + 1);
    Game.state.scholar.abilityChoices = [{ id: filler.id, name: filler.name }, { id: legB, name: legB }];
    const ctx = { notes: [] };
    capable.upkeep(Game, ctx);
    T.ok('upkeep took the synergy leg (not card 0)', Game.hasAbility(legB) && (ctx.capOffersNotFirst || 0) >= 1, JSON.stringify(capableSummary(ctx)));

    // Table seat: stub the preview the way table.js shapes it (ready at day >= 90)
    const realPrev = Game.tablePreview, realSeat = Game.tableTakeSeat;
    let sat = 0;
    Game.tablePreview = () => ({ seat: 'lesser', doors: ['The Feared'], day: 95, ready: true });
    Game.tableTakeSeat = () => { sat++; return { ok: true }; };
    capable.daily(Game, { notes: [] });
    T.ok('Table seat taken when tablePreview().ready', sat === 1);
    Game.tablePreview = () => ({ seat: 'lesser', doors: [], day: 60, ready: false });
    capable.daily(Game, { notes: [] });
    T.ok('Table seat NOT taken before day 90 (ready=false)', sat === 1);
    Game.tablePreview = realPrev; Game.tableTakeSeat = realSeat;
    // Table options: the trial is never volunteered; paths priced by strength
    const trial = scoreTableOption(Game, { id: 'beat:trial', label: 'Demand the champion. (TRIAL BY COMBAT — real fight, real death)' }, {});
    const calm = scoreTableOption(Game, { id: 'beat:mercy', label: 'Show mercy.' }, { branch: 'light' });
    T.ok('trial by combat scored below every other beat', trial < calm && trial < 0);
    const realEP = Game.tableEarnedPaths, realBr = Game.tableBranch;
    Game.tableEarnedPaths = () => [{ id: 'feared', earned: true, strength: 10 }, { id: 'beloved', earned: true, strength: 60 }];
    Game.tableBranch = () => ({ branch: 'light' });
    T.ok('path scored by earned strength, not position', scoreTableOption(Game, { id: 'path:beloved' }, {}) > scoreTableOption(Game, { id: 'path:feared' }, {}));
    Game.tableEarnedPaths = realEP; Game.tableBranch = realBr;
  }

  // ---------- 4. a held conversation ----------
  T.section('4. a conversation is held (real turns), target by need');
  {
    K.newRun(Game);
    const ctx = { notes: [] };
    const realBase = capable.daily;
    // only the talk layer: call daily, count held sittings
    realBase.call(capable, Game, ctx);
    T.ok('held at least one conversation', (ctx.capConvosHeld || 0) >= 1, JSON.stringify(capableSummary(ctx)));
    T.ok('real exchanges taken (deepTurns > 0)', (ctx.deepTurns || 0) > 0);
  }

  // ---------- 5. beastStrikeTarget clamp (competent fix) ----------
  T.section('5. competent.beastStrikeTarget steps within moveLeft');
  {
    const moves = [];
    const fake = {
      equippedWeapon: () => ({ range: 1 }),
      findPath: (sx, sy, tx, ty) => { const out = []; let x = sx; while (x !== tx) { x += Math.sign(tx - x); out.push([x, sy]); } return out; },
      tbTerrainCost: () => 1,
      tbPlayerMove: (x, y) => { moves.push([x, y]); return true; },
      tbPlayerStrike: () => true,
    };
    const f = { fighters: [{ key: 'm1', alive: true, mx: 7, my: 4 }] };
    const p = { mx: 1, my: 4, moveLeft: 3 };
    C.beastStrikeTarget(fake, f, {}, p, 1, 4, f.fighters[0], () => {});
    T.ok('moved', moves.length === 1, JSON.stringify(moves));
    T.ok('destination within this turn\'s 3 squares (was 5 away: "Too far" no-op)', moves[0] && Math.abs(moves[0][0] - 1) <= 3, JSON.stringify(moves));
  }

  // ---------- short sims ----------
  T.section('short sims: 2 seeds x 40 days');
  {
    let contests = 0, held = 0, errs = [], days = 0;
    for (const seed of [42, 1234]) {
      const { Game: G } = await H.quietLog(() => H.loadGame({ seed, mode: 'test-capable' }));
      await H.setupGame(G);
      let cx = null;
      const pol = Object.assign({}, capable, { setup(g, c) { cx = c; return capable.setup(g, c); } });
      const r = await H.runDays(G, pol, { days: 40 });
      days += r.days;
      contests += cx.capContestChoices || 0;
      held += cx.capConvosHeld || 0;
      errs = errs.concat(cx.capErrors || []);
    }
    T.ok('runs completed', days > 40, String(days));
    T.ok('contest choices taken by scoring', contests > 0, String(contests));
    T.ok('conversations held in-sim', held > 0, String(held));
    T.ok('no policy-side errors', errs.length === 0, JSON.stringify(errs.slice(0, 5)));
  }

  T.done();
})().catch(e => { console.error(e); process.exitCode = 1; });
