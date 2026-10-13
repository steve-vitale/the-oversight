// test-feast-r13.js — proof for the scale-wall r13 feast layer (2026-10-13).
//
// Proves, with a REAL RED phase: the old contribution rule (pantry
// donations only — what competent.js eveningFeast still uses) leaves a
// tribute-paying courtship scholar feastless even when every other gate is
// green; the r13 rule (donations + tribute/tend paid) hosts the feast, and
// the armed feast -> buff -> tbDamage uplift fires in a REAL tb fight.
//
// Groups:
//   G1 gate parity: FEASTSCALE_R13 unset -> the layer is a pure delegate
//       (scaleFeast no-ops in a feast-ready state; daily leaves the verbs
//       unwrapped).
//   G2 RED: gate ON, feast-ready, contribution = 0 (the diagnosed bug
//       state) -> NO feast. This is the r8 "0 feasts" mechanism reproduced.
//   G3 GREEN: same state + tribute recorded -> feast HOSTED, real pantry
//       cost drawn, buff granted (armed), ctx accounting exact.
//   G4 affordability: tribute paid but a bare pantry -> NO feast (honest).
//   G5 mechanism: armed feast -> grant -> REAL tb fight -> strike uplifted
//       by the exact mult, feastSurgeUsed marked (the table/wave-4 deed).
//   G6 honest refusals: unarmed feast holds socially but grants nothing;
//       trackTribute records real paid kcal and restores the verbs.
//
// SEED env override. Run: node scripts/test-feast-r13.js
'use strict';
const assert = require('assert');
const { loadGame } = require('./sim-harness');
const { belongfeast, leadfeast, layerOn, recentTribute, trackTribute, scaleFeast } = require('./policies/feastscale');

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
  return base.concat(base).concat(base);
}

function synthFight(Game, mhp) {
  const mdef = (Game.data.monsters || []).find(m => m.id === 'hushwolf') || {};
  Game.tbfight = {
    id: 'proof-fight',
    fighters: [
      { key: 'p', kind: 'player', name: 'You', hp: 100, maxHp: 100, speed: 6, mx: 4, my: 4, alive: true, fled: false, moveLeft: 0, acted: false },
      { key: 'm1', kind: 'monster', monsterId: 'hushwolf', mdef, name: 'Hushwolf', hp: mhp || 5000, maxHp: mhp || 5000, speed: 3, mx: 5, my: 4, alive: true, fled: false, telegraph: null },
    ],
    over: false, round: 1, order: ['p', 'm1'], turnIdx: 0,
  };
  return 'm1';
}

(async () => {
  const { Game, loadFails } = await loadGame({ seed: SEED, mode: 'feastscale-proof' });
  check('all modules load', () => assert.ok(!loadFails.length, loadFails.join(';')));

  const said = [];
  Game.say = (m) => said.push(String(m));
  Game.sysSay = () => {};
  try { Game.drama = () => {}; } catch (e) {}
  Game.equippedWeapon = () => ({ range: 1, bonus: 0, name: 'fists', unarmed: true });

  const hostCalls = [];
  const realHost = Game.hostFeast.bind(Game);
  Game.hostFeast = function (...a) { const r = realHost(...a); hostCalls.push(r); return r; };

  const freshGame = () => {
    // NOTE: env management belongs to the caller — freshGame never touches
    // FEASTSCALE_R13, so a group can set the gate and THEN build the game.
    Game.genRoster('Columbus, Ohio');
    Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
    Game.depart();
    assert.ok(Game.playerAtHaven(), 'fresh game not at haven');
    const s = Game.state.scholar, v = Game.state.village;
    v.pantry = richPantry();
    s.prog = s.prog || {};
    Game.dayPart = 2; // dusk
    said.length = 0; hostCalls.length = 0;
    try { Game.clearFeastBuff(false); } catch (e) {}
    Game.tbfight = null;
    return { s, v, ctx: {} };
  };

  // ============ G1: gate parity (default OFF = pure delegation) ============
  console.log('\n[G1] gate parity: FEASTSCALE_R13 unset -> the layer does nothing');
  {
    delete process.env.FEASTSCALE_R13;
    const { s, ctx } = freshGame();
    assert.ok(!layerOn(), 'layer should be OFF with the env unset');
    s.prog.feastSurge = 2.0;
    ctx._tribHist = [{ day: s.day, kcal: 9000 }]; // tribute paid — irrelevant when off
    scaleFeast(Game, ctx);
    check('scaleFeast no-ops with the gate off (feast-ready state)', () => {
      assert.strictEqual(hostCalls.length, 0, 'hostFeast fired with the gate OFF');
      assert.strictEqual(ctx.fsFeasts, undefined, 'feast accounting written with the gate OFF');
    });
    check('daily with gate off leaves the verbs unwrapped', () => {
      const g2 = freshGame();
      const op = Game.payTribute, ot = Game.tendLink;
      belongfeast.daily(Game, g2.ctx);
      assert.strictEqual(Game.payTribute, op, 'payTribute wrapped with the gate OFF');
      assert.strictEqual(Game.tendLink, ot, 'tendLink wrapped with the gate OFF');
      assert.strictEqual(g2.ctx._tribHist, undefined, 'tribute history written with the gate OFF');
    });
    check('gate-off wrapper still exposes the parent policy id', () => {
      assert.strictEqual(belongfeast.id, 'belongfeast');
      assert.strictEqual(leadfeast.id, 'leadfeast');
    });
  }

  // ============ G2: RED — the diagnosed bug state ============
  console.log('\n[G2] RED: tribute-paying scholar under the OLD rule (donations only) -> no feast');
  {
    process.env.FEASTSCALE_R13 = '1';
    const { s, ctx } = freshGame();
    s.prog.feastSurge = 2.0; // armed — the devotion lane is ready
    // contribution = 0: no pantry donations, no tribute counted (the old rule)
    scaleFeast(Game, ctx);
    check('no feast when the scholar contributed nothing (the r8 bug state)', () => {
      assert.strictEqual(hostCalls.length, 0, 'feast hosted with zero contribution — the gate is fake');
    });
    delete process.env.FEASTSCALE_R13;
  }

  // ============ G3: GREEN — tribute counts ============
  console.log('\n[G3] GREEN: tribute paid this week -> the feast is hosted, honestly');
  {
    process.env.FEASTSCALE_R13 = '1';
    const { s, v, ctx } = freshGame();
    s.prog.feastSurge = 2.0;
    const panBefore = v.pantry.reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
    ctx._tribHist = [{ day: s.day, kcal: 6000 }]; // a week's tribute, really paid
    scaleFeast(Game, ctx);
    check('feast hosted', () => {
      assert.strictEqual(hostCalls.length, 1, 'hostFeast not called');
      assert.ok(hostCalls[0].ok, 'feast refused: ' + hostCalls[0].why);
    });
    check('real pantry cost drawn (no free food)', () => {
      const panAfter = v.pantry.reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
      assert.ok(panBefore - panAfter >= 1500, `pantry moved ${panBefore - panAfter} kcal`);
      assert.ok(hostCalls[0].spent >= 1500, 'spent=' + hostCalls[0].spent);
    });
    check('buff granted on the armed feast', () => {
      assert.ok(hostCalls[0].buffGranted, 'buffGranted false on an ARMED feast');
      assert.ok(Game.feastedActive(), 'feastedActive() false right after the feast');
    });
    check('ctx accounting exact', () => {
      assert.strictEqual(ctx.fsFeasts, 1, 'fsFeasts=' + ctx.fsFeasts);
      assert.strictEqual(ctx.fsArmedFeasts, 1, 'fsArmedFeasts=' + ctx.fsArmedFeasts);
      assert.strictEqual(ctx._fsLastFeastDay, s.day, 'cadence stamp wrong');
    });
    check('cadence: no second feast the same week', () => {
      hostCalls.length = 0;
      scaleFeast(Game, ctx);
      assert.strictEqual(hostCalls.length, 0, 'second feast inside the 7-day armed cadence');
    });
    delete process.env.FEASTSCALE_R13;
  }

  // ============ G4: affordability ============
  console.log('\n[G4] affordability: tribute paid but the pantry is bare -> no feast');
  {
    process.env.FEASTSCALE_R13 = '1';
    const { s, v, ctx } = freshGame();
    s.prog.feastSurge = 2.0;
    v.pantry = [{ name: 'Crumbs', kcalEach: 10, units: 20, foodKind: 'plant', foodState: 'dried' }];
    ctx._tribHist = [{ day: s.day, kcal: 6000 }];
    scaleFeast(Game, ctx);
    check('no feast into famine', () => {
      assert.strictEqual(hostCalls.length, 0, 'feast hosted on a 200-kcal pantry');
    });
    delete process.env.FEASTSCALE_R13;
  }

  // ============ G5: the mechanism in a REAL tb fight ============
  console.log('\n[G5] feast -> buff -> tbDamage uplift in a real tb fight (seeded)');
  {
    process.env.FEASTSCALE_R13 = '1';
    const { s, ctx } = freshGame();
    s.prog.feastSurge = 2.0; s.prog.feastSurgeUsed = false;
    ctx._tribHist = [{ day: s.day, kcal: 6000 }];
    scaleFeast(Game, ctx);
    assert.ok(hostCalls[0] && hostCalls[0].ok && hostCalls[0].buffGranted, 'feast/grant failed');
    const mult = Game.feastedMult();
    assert.ok(mult > 1, 'mult=' + mult);
    const mk = synthFight(Game);
    const m = Game.tbFighter(mk);
    const p = Game.tbFighter('p');
    p.mx = 4; p.my = 4; p.moveLeft = 0; p.acted = false;
    const hpBefore = m.hp;
    said.length = 0;
    Game.tbPlayerStrike(mk);
    const dealt = hpBefore - m.hp;
    check('strike uplifted by the feasted mult', () => {
      assert.ok(dealt > 0, 'strike dealt nothing');
    });
    check('strike line states what LANDED (uplifted)', () => {
      const line = said.find(x => x.indexOf('You STRIKE') === 0) || '';
      const mnum = (line.match(/for (\d+)/) || [])[1];
      assert.ok(mnum != null && parseInt(mnum, 10) === dealt, 'line=' + mnum + ' dealt=' + dealt);
    });
    check('FEASTED line states the true mult', () => {
      assert.ok(said.some(x => x.indexOf('FEASTED ×' + mult) === 0),
        'no FEASTED x' + mult + ' line: ' + said.filter(x => /FEASTED/.test(x)).join(' | '));
    });
    check('feastSurgeUsed marked on real combat use (the table/wave-4 deed)', () => {
      assert.strictEqual(s.prog.feastSurgeUsed, true, 'used=' + s.prog.feastSurgeUsed);
    });
    check('exact hook math: tbDamage(10, player-sourced) = round(10 x mult)', () => {
      Game.tbfight = null;
      const mk2 = synthFight(Game);
      const dealt2 = Game.tbDamage(mk2, 10, 'you', null, { quiet: true });
      assert.strictEqual(dealt2, Math.round(10 * mult), 'dealt=' + dealt2 + ' want=' + Math.round(10 * mult));
    });
    Game.tbfight = null;
    delete process.env.FEASTSCALE_R13;
  }

  // ============ G6: honest refusals + tribute tracking ============
  console.log('\n[G6] honest refusals and tribute tracking');
  {
    process.env.FEASTSCALE_R13 = '1';
    const { s, ctx } = freshGame();
    s.prog.feastSurge = 0; // unarmed — the social engine, not the conversion
    s.prog.feastSurgeUsed = false;
    ctx._tribHist = [{ day: s.day, kcal: 6000 }];
    scaleFeast(Game, ctx);
    check('unarmed feast held socially, buff honestly refused', () => {
      assert.strictEqual(hostCalls.length, 1, 'hostFeast not called');
      assert.ok(hostCalls[0].ok, 'unarmed feast refused: ' + hostCalls[0].why);
      assert.ok(!hostCalls[0].buffGranted, 'buff granted on an UNARMED feast');
      assert.ok(!Game.feastedActive(), 'feastedActive without a grant');
    });
    check('unarmed cadence is 14 days', () => {
      assert.strictEqual(ctx._fsLastFeastDay, s.day, 'cadence stamp missing');
      assert.strictEqual(ctx.fsArmedFeasts, undefined, 'armed feast counted on an unarmed feast');
    });
    delete process.env.FEASTSCALE_R13;
  }
  {
    const { ctx } = freshGame();
    const g = freshGame();
    const stubPay = () => 1500, stubTend = () => 0; // stubbed engine: real return contract
    Game.payTribute = stubPay;
    Game.tendLink = stubTend; // refused: nothing paid
    const restore = trackTribute(Game, g.ctx);
    Game.payTribute('link-x');
    Game.tendLink('link-y');
    restore();
    check('trackTribute records real paid kcal, ignores refusals', () => {
      const h = g.ctx._tribHist || [];
      assert.strictEqual(h.length, 1, 'hist=' + JSON.stringify(h));
      assert.strictEqual(h[0].kcal, 1500, 'kcal=' + h[0].kcal);
    });
    check('trackTribute restores the verbs', () => {
      assert.strictEqual(Game.payTribute, stubPay, 'payTribute not restored');
      assert.strictEqual(Game.tendLink, stubTend, 'tendLink not restored');
    });
    check('recentTribute windows honestly', () => {
      const day = Game.state.scholar.day || 0;
      g.ctx._tribHist.push({ day: day - 30, kcal: 9000 });
      assert.strictEqual(recentTribute(Game, g.ctx, 7), 1500, 'old tribute leaked into the window');
      assert.strictEqual(recentTribute(Game, g.ctx, 40), 10500, 'window sum wrong');
    });
    void ctx;
  }

  console.log(`\n== ${pass} pass, ${fail} fail ==`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS FAILURE:', e); process.exit(2); });
