#!/usr/bin/env node
// test-blitz-simpolicy.js — proof for the blitz simpolicy layers (2026-10-13).
//
// The gaps (parent brief): the competent policy throws 0 feasts ever (the
// food-deed chain — feasts, feastburn, the table food-deed rung — is
// unverifiable in sims), and the driverless player holds 0 real
// conversations (talkRound opens and walks out; the dialogue engine is
// unreachable by construction).
//
// The layers (scripts/policies/competent.js, policy-side only, zero
// game-code changes):
//   - surplusFeast (COMPETENT_SURPLUS_FEAST=1): feast at dusk at the haven
//     when the pantry holds a surplus (a full day of village food remains
//     after the feast) and nobody starves (engine's starvingVillage()).
//     All honest gates kept: affordability have>=cost*1.5, one feast/day,
//     fusion-reactor ceiling, armed 7d / unarmed 14d cadence.
//   - deepTalk (COMPETENT_TALK=1): up to two held sittings a day, up to 5
//     real turns each, meaning-first targets (unresolved want > grieving/
//     scared > stranger > least-talked-to), courtesy-first choices
//     (ans:* > teach > gq:* > ask), honest close via endConvo('left').
//
// Groups:
//   G0 pristine-fail: the new exports exist (FAILS on pristine
//       scripts/policies/ — the RED phase, verified via git stash).
//   G1 feast gate parity: gates unset -> surplusFeast is a strict no-op in
//       a feast-ready state (no hostFeast call, ctx untouched).
//   G2 feast GREEN: gate on + surplus + fed + dusk + haven + armed ->
//       feast HOSTED, ctx counted, real pantry cost drawn.
//   G3 honest refusals: thin pantry / starving village / wrong daypart /
//       away from haven / unaffordable / cadence -> NO feast; fusion
//       reactor online + armed -> feast hosts on the UNARMED cadence and
//       counts no armed feast.
//   G4 talk gate parity: gate off -> deepTalk is a strict no-op.
//   G5 talk GREEN: gate on -> held sittings: talkTo fires, the want-holder
//       is picked first, ans:* beats leave, turns are bounded, every
//       sitting closes (no active convo leaks), ctx counts.
//   G6 meat chain intact (r10): the cautious-test path works identically
//       with the new gates OFF and ON — no regression of meat discovery.
//
// SEED env override. Run: node scripts/test-blitz-simpolicy.js
'use strict';
const assert = require('assert');
const { loadGame, setupGame } = require('./sim-harness');
const competentMod = require('./policies/competent');
const { surplusFeast, surplusFeastOn, deepTalk, talkOn, pickTalkTargets,
  pickTalkChoice, holdConversation } = competentMod;
const { testUnknownMeat } = require('./policies/meatseek');

const SEED = parseInt(process.env.SEED || '20261013', 10);

let pass = 0, fail = 0;
function check(name, fn) {
  try { fn(); pass++; console.log('  ok -', name); }
  catch (e) { fail++; console.log('  FAIL -', name, '::', e.message); }
}

function richPantry() {
  const base = [
    { name: 'Smoked turkey leg', kcalEach: 100, units: 12, foodKind: 'meat', foodState: 'smoked' },
    { name: 'Dried berries', kcalEach: 100, units: 12, foodKind: 'plant', foodState: 'dried' },
    { name: 'Stewed roots', kcalEach: 150, units: 8, foodKind: 'plant', foodState: 'cooked' },
    { name: 'Travel bread', kcalEach: 200, units: 6, foodKind: 'plant', foodState: 'baked' },
  ];
  // NOTE: the engine's honest pantry measure (pantryKcalLive) reads ~2/3 of
  // the naive kcalEach*units sum, so this is ~38k live — comfortably over
  // the surplus bar (11 mouths * 2000 + ~5k feast cost).
  return base.concat(base).concat(base).concat(base)
    .concat(base).concat(base).concat(base).concat(base);
}
function unknownFlesh(mid, kcal) {
  return { plantId: 'meat_' + mid, foodKind: 'meat', foodState: 'cleaned',
    edible: false, units: 4, unit: 'portion', kcalEach: 0, hiddenKcal: kcal,
    spoilDay: 99, kg: 0.5, name: 'Unknown flesh (cleaned)',
    prep: 'Unknown flesh. Test it cautiously.' };
}
const pantryKcal = (v) => (v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);

(async () => {
  // ============ G0: pristine-fail (the RED phase) ============
  console.log('\n[G0] new exports exist (fails on pristine scripts/policies/)');
  for (const k of ['surplusFeast', 'surplusFeastOn', 'deepTalk', 'talkOn',
                   'pickTalkTargets', 'pickTalkChoice', 'holdConversation']) {
    check('export ' + k, () => assert.strictEqual(typeof competentMod[k], 'function', k + ' missing'));
  }

  const { Game } = await loadGame({ seed: SEED, mode: 'blitz-proof' });
  const said = [];
  Game.say = (m) => said.push(String(m));
  Game.sysSay = () => {};
  try { Game.drama = () => {}; } catch (e) {}

  const hostCalls = [];
  const realHost = Game.hostFeast.bind(Game);
  Game.hostFeast = function (...a) { const r = realHost(...a); hostCalls.push(r); return r; };
  const talkCalls = [];
  const realTalk = Game.talkTo.bind(Game);
  Game.talkTo = function (...a) { talkCalls.push(a[0]); return realTalk.apply(this, a); };
  const endCalls = [];
  const realEnd = Game.endConvo.bind(Game);
  Game.endConvo = function (...a) { endCalls.push(a[0]); return realEnd.apply(this, a); };

  const freshGame = () => {
    // NOTE: env management belongs to the caller — freshGame never touches
    // the gates, so a group can set them and THEN build the game.
    Game.genRoster('Columbus, Ohio');
    Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
    Game.depart();
    assert.ok(Game.playerAtHaven(), 'fresh game not at haven');
    const s = Game.state.scholar, v = Game.state.village;
    v.pantry = richPantry();
    s.prog = s.prog || {};
    Game.dayPart = 2; // dusk
    Game.tbfight = null;
    said.length = 0; hostCalls.length = 0; talkCalls.length = 0; endCalls.length = 0;
    return { s, v, ctx: {} };
  };
  const living = (v) => (v.roster || []).filter(id => {
    if (id === Game.villagerId) return false;
    try { const p = Game.getPerson(id); return p && !p.dead; } catch (e) { return true; }
  });

  // ============ G1: feast gate parity ============
  console.log('\n[G1] feast gate parity: gates unset -> surplusFeast is a strict no-op');
  {
    delete process.env.COMPETENT_SURPLUS_FEAST; delete process.env.COMPETENT_TALK;
    const { s, v, ctx } = freshGame();
    assert.ok(!surplusFeastOn(), 'gate should be OFF with the env unset');
    s.prog.feastSurge = 2.0; // armed — irrelevant when off
    const pk0 = pantryKcal(v);
    surplusFeast(Game, ctx);
    check('no hostFeast call with the gate off (feast-ready state)', () => assert.strictEqual(hostCalls.length, 0));
    check('ctx untouched with the gate off', () => assert.deepStrictEqual(ctx, {}));
    check('pantry untouched with the gate off', () => assert.strictEqual(pantryKcal(v), pk0));
  }

  // ============ G2: feast GREEN ============
  console.log('\n[G2] feast GREEN: surplus + fed + dusk + haven + armed -> feast hosted');
  {
    process.env.COMPETENT_SURPLUS_FEAST = '1';
    const { s, v, ctx } = freshGame();
    assert.ok(!Game.starvingVillage(), 'pre: fresh village is fed');
    s.prog.feastSurge = 2.0;
    const pk0 = pantryKcal(v);
    const plan = Game.feastPlan();
    assert.ok(plan.ok, 'pre: feastPlan ok, why=' + plan.why);
    surplusFeast(Game, ctx);
    check('hostFeast called once', () => assert.strictEqual(hostCalls.length, 1));
    check('report ok', () => assert.ok(hostCalls[0] && hostCalls[0].ok, 'rep not ok'));
    check('ctx.surplusFeasts counted', () => assert.strictEqual(ctx.surplusFeasts, 1));
    check('ctx.surplusArmedFeasts counted', () => assert.strictEqual(ctx.surplusArmedFeasts, 1));
    check('real pantry cost drawn', () => assert.ok(pantryKcal(v) < pk0, 'pantry did not shrink'));
    check('cadence: second call same day no-ops', () => {
      surplusFeast(Game, ctx);
      assert.strictEqual(hostCalls.length, 1, 'second feast hosted!');
    });
    delete process.env.COMPETENT_SURPLUS_FEAST;
  }

  // ============ G3: honest refusals ============
  console.log('\n[G3] honest refusals');
  {
    process.env.COMPETENT_SURPLUS_FEAST = '1';
    // thin pantry
    let g = freshGame();
    g.v.pantry = [{ name: 'crumbs', kcalEach: 100, units: 5, foodKind: 'plant', foodState: 'cooked' }];
    surplusFeast(Game, g.ctx);
    check('thin pantry -> no feast', () => assert.strictEqual(hostCalls.length, 0));

    // starving village (a starvation death this week)
    g = freshGame();
    g.v.fallen = g.v.fallen || [];
    g.v.fallen.push({ cause: 'starved', day: g.s.day || 1 });
    assert.ok(Game.starvingVillage(), 'pre: village reads as starving');
    surplusFeast(Game, g.ctx);
    check('starving village -> no feast', () => assert.strictEqual(hostCalls.length, 0));

    // wrong daypart
    g = freshGame();
    Game.dayPart = 0; // morning
    surplusFeast(Game, g.ctx);
    check('morning -> no feast', () => assert.strictEqual(hostCalls.length, 0));
    Game.dayPart = 2;

    // away from haven
    g = freshGame();
    const opah = Game.playerAtHaven;
    Game.playerAtHaven = () => false;
    try { surplusFeast(Game, g.ctx); } finally { Game.playerAtHaven = opah; }
    check('away from haven -> no feast', () => assert.strictEqual(hostCalls.length, 0));

    // unaffordable (have < cost*1.5 but plan ok): pantry just under the bar
    g = freshGame();
    const pl = Game.feastPlan();
    assert.ok(pl.ok, 'pre: plan ok');
    const target = Math.floor(pl.cost * 1.4);
    g.v.pantry = [{ name: 'meal', kcalEach: target, units: 1, foodKind: 'plant', foodState: 'cooked' }];
    surplusFeast(Game, g.ctx);
    check('below the honest buffer -> no feast', () => assert.strictEqual(hostCalls.length, 0));

    // fusion reactor online + armed -> feast hosts on the UNARMED cadence
    g = freshGame();
    g.s.prog.feastSurge = 2.0;
    const ofr = Game.fusionReactorOnline;
    Game.fusionReactorOnline = () => true;
    try { surplusFeast(Game, g.ctx); } finally { Game.fusionReactorOnline = ofr; }
    check('reactor-armed feast still hosts socially', () => assert.strictEqual(hostCalls.length, 1));
    check('reactor-armed feast counts no armed feast', () => assert.strictEqual(g.ctx.surplusArmedFeasts || 0, 0));
    check('reactor-armed feast sets the unarmed cadence', () => {
      const d0 = g.ctx._sfLastFeastDay;
      surplusFeast(Game, g.ctx); // same day: engine one-feast/day anyway
      assert.strictEqual(hostCalls.length, 1);
      assert.ok(d0 != null, 'cadence day recorded');
    });
    delete process.env.COMPETENT_SURPLUS_FEAST;
  }

  // ============ G4: talk gate parity ============
  console.log('\n[G4] talk gate parity: gate off -> deepTalk is a strict no-op');
  {
    delete process.env.COMPETENT_SURPLUS_FEAST; delete process.env.COMPETENT_TALK;
    const { ctx } = freshGame();
    assert.ok(!talkOn(), 'gate should be OFF with the env unset');
    deepTalk(Game, ctx);
    check('no talkTo calls with the gate off', () => assert.strictEqual(talkCalls.length, 0));
    check('ctx untouched with the gate off', () => assert.deepStrictEqual(ctx, {}));
  }

  // ============ G5: talk GREEN ============
  console.log('\n[G5] talk GREEN: held sittings with meaning-first targets and courtesy-first choices');
  {
    process.env.COMPETENT_TALK = '1';
    const { v, ctx } = freshGame();
    const roster = living(v);
    assert.ok(roster.length >= 3, 'pre: need villagers to talk to');

    // choice picker unit checks (no engine needed)
    check('pickTalkChoice answers their question first', () => {
      const p = pickTalkChoice([
        { id: 'leave', label: 'go' }, { id: 'teach', label: 't' }, { id: 'ans:q1:a2', label: 'a' },
      ]);
      assert.ok(p && p.id === 'ans:q1:a2', 'picked ' + (p && p.id));
    });
    check('pickTalkChoice never picks structural ids', () => {
      const p = pickTalkChoice([{ id: 'leave' }, { id: 'deflect_q' }, { id: 'goon' }, { id: 'ask', label: 'a' }]);
      assert.ok(p && p.id === 'ask', 'picked ' + (p && p.id));
    });
    check('pickTalkChoice returns null when only structural', () => {
      assert.strictEqual(pickTalkChoice([{ id: 'leave' }, { id: 'subject' }]), null);
    });
    check('pickTalkChoice never repeats a choice id within a sitting', () => {
      const seen = { teach: 1 };
      const p = pickTalkChoice([{ id: 'teach', label: 't' }, { id: 'ask', label: 'a' }], seen);
      assert.ok(p && p.id === 'ask', 'picked ' + (p && p.id));
      assert.strictEqual(pickTalkChoice([{ id: 'teach', label: 't' }], seen), null);
    });

    // target picking: plant an unresolved want on one villager
    const wanty = roster[0];
    let wc = null;
    try { wc = Game.convoGet(wanty); } catch (e) {}
    if (wc) wc.want = { id: 'probe_want', stage: 0 };
    const targets = pickTalkTargets(Game, ctx, roster);
    check('want-holder is picked first', () => assert.strictEqual(targets[0], wanty));
    if (wc) wc.want = null;

    // the real thing: two held sittings, bounded turns, honest closes
    deepTalk(Game, ctx);
    check('held at least one sitting', () => assert.ok((ctx.deepConvos || 0) >= 1, 'deepConvos=' + ctx.deepConvos));
    check('took real turns', () => assert.ok((ctx.deepTurns || 0) >= 1, 'deepTurns=' + ctx.deepTurns));
    check('turns bounded (2 sittings x 5)', () => assert.ok((ctx.deepTurns || 0) <= 10, 'deepTurns=' + ctx.deepTurns));
    check('every sitting closed honestly', () => {
      assert.strictEqual(talkCalls.length, endCalls.length, `talkTo=${talkCalls.length} endConvo=${endCalls.length}`);
      for (const vid of talkCalls) {
        const c = Game.convoGet(vid);
        assert.ok(!c || !c.active, vid + ' left an active conversation open');
      }
    });
    delete process.env.COMPETENT_TALK;
  }

  // ============ G6: meat chain intact (r10) ============
  console.log('\n[G6] meat chain intact: cautious-test works with the new gates OFF and ON');
  {
    await setupGame(Game);
    const s = Game.state.scholar;
    const runMeat = (feastGate, talkGate) => {
      if (feastGate) process.env.COMPETENT_SURPLUS_FEAST = '1'; else delete process.env.COMPETENT_SURPLUS_FEAST;
      if (talkGate) process.env.COMPETENT_TALK = '1'; else delete process.env.COMPETENT_TALK;
      s.day = (s.day || 0) + 1; // fresh day: the one-test/day budget resets
      s.inventory.push(unknownFlesh('hushwolf', 1400));
      const c = {};
      testUnknownMeat(Game, c);
      const ok = c.meatTests === 1 && Game.monsterFoodSafe('hushwolf');
      // reset for the next leg: undiscover hushwolf again
      try { delete (Game.state.codex.monsters || {}).hushwolf; } catch (e) {}
      return ok;
    };
    // pre: undiscovered
    try { delete (Game.state.codex.monsters || {}).hushwolf; } catch (e) {}
    check('gates OFF: cautious test discovers hushwolf', () => assert.ok(runMeat(false, false)));
    check('gates ON: cautious test still discovers hushwolf', () => assert.ok(runMeat(true, true)));
    delete process.env.COMPETENT_SURPLUS_FEAST; delete process.env.COMPETENT_TALK;
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('PROOF FAILED:', e); process.exit(1); });
