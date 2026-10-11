// PROOF: the feast -> feasted-damage chain is REACHABLE through hostFeast
// (longsim food 2026-10-11, lever 0 blank #1).
//
// The bug (fixed in this change): hostFeast cleared scholar.prog.feastSurge
// and marked feastSurgeUsed BEFORE calling grantFeastBuff — whose devotion
// gate then refused every armed feast. An armed player feasting got two
// contradictory lines in one evening ("the feast was the weapon ... spent"
// AND "no keepsake was channeled ... the surge must be armed") and never
// the damage buff. The food->damage loop could never fire.
//
// Fixed contract (canon: progression.js x2 comments + feastBuff.js
// noteFeastedCombatUse): the feast CARRIES the arming into the buff
// (feast.surge); consumption happens on first REAL combat use. A feast that
// warms no blades spends no devotion.
//
// Groups:
//   F1 armed feast grants the buff through hostFeast (mult math exact)
//   F2 unarmed feast: social engine still works, buff honestly refused
//   F3 arming is CARRIED, not spent, at feast time
//   F4 first real combat use spends the arming + exact strike uplift
//   F5 a feast that warms no blades leaves the devotion armed
// SEED env override. Run: node scripts/test-feastburn-20261011.js
'use strict';
const assert = require('assert');
const { loadGame, setupGame } = require('./sim-harness');

const SEED = parseInt(process.env.SEED || '20261011', 10);

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
  // triple it: a full-roster feast draws ~5,200 kcal
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
  const { Game, loadFails } = await loadGame({ seed: SEED, mode: 'feastburn-proof' });
  check('all modules load', () => assert.ok(!loadFails.length, loadFails.join('; ')));

  const said = [];
  Game.say = (m) => said.push(String(m));
  Game.sysSay = () => {};
  try { Game.drama = () => {}; } catch (e) {}
  Game.equippedWeapon = () => ({ range: 1, bonus: 0, name: 'fists', unarmed: true });

  // capture the REAL grantFeastBuff's return through hostFeast
  const grantReturns = [];
  const realGrant = Game.grantFeastBuff.bind(Game);
  Game.grantFeastBuff = function (feast) {
    const r = realGrant(feast);
    grantReturns.push(r);
    return r;
  };

  const freshGame = () => {
    Game.genRoster('Columbus, Ohio');
    Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
    Game.depart();
    assert.ok(Game.playerAtHaven(), 'fresh game not at haven');
    const s = Game.state.scholar, v = Game.state.village;
    v.pantry = richPantry();
    s.prog = s.prog || {};
    said.length = 0; grantReturns.length = 0;
    return { s, v };
  };

  // ============ F1: armed feast GRANTS the buff ============
  console.log('\n[F1] armed feast grants the feasted buff through hostFeast');
  {
    const { s } = freshGame();
    s.prog.feastSurge = 2.0; s.prog.feastSurgeUsed = false;
    const rep = Game.hostFeast();
    check('feast held', () => assert.ok(rep.ok, rep.why));
    check('buff granted through the contract', () => {
      assert.strictEqual(rep.buffGranted, true, 'buffGranted=' + rep.buffGranted);
      assert.ok(grantReturns.length === 1 && grantReturns[0].granted === true,
        'grant returned: ' + JSON.stringify(grantReturns[0]));
    });
    check('mult math exact: uplift(quality) x surge', () => {
      const q = rep.quality;
      const uplift = { 0: 1.2, 1: 1.35, 2: 1.5 }[q];
      const want = Math.round(uplift * 2.0 * 100) / 100;
      assert.ok(Math.abs(grantReturns[0].mult - want) < 1e-9,
        `q${q}: ${uplift} x 2.0 = ${want}, got ${grantReturns[0].mult}`);
    });
    check('feasted window live until dawn', () => {
      assert.ok(Game.feastedActive(), 'feastedActive() false right after the feast');
      assert.ok(Math.abs(Game.feastedMult() - grantReturns[0].mult) < 1e-9, 'feastedMult matches the grant');
    });
    check('no contradictory devotion-gate refusal line', () => {
      assert.ok(!said.some(m => /no keepsake was channeled/.test(m)),
        'refusal line fired on an ARMED feast: ' + said.filter(m => /keepsake/.test(m)).join(' | '));
    });
    Game.clearFeastBuff(false);
  }

  // ============ F2: unarmed feast ============
  console.log('\n[F2] unarmed feast: the social engine works, the buff is honestly refused');
  {
    const { s } = freshGame();
    s.prog.feastSurge = false; s.prog.feastSurgeUsed = false;
    const rep = Game.hostFeast();
    check('feast held without arming', () => assert.ok(rep.ok, rep.why));
    check('buff refused honestly', () => {
      assert.ok(grantReturns.length === 1 && grantReturns[0].granted === false,
        'grant returned: ' + JSON.stringify(grantReturns[0]));
      assert.ok(said.some(m => /devotion gate/.test(m)), 'refusal does not name the gate');
      assert.strictEqual(rep.buffGranted, false, 'rep.buffGranted lied on a refused grant');
    });
    check('no buff state set', () => assert.ok(!Game.feastedActive(), 'feasted while unarmed'));
  }

  // ============ F3: arming CARRIED, not spent, at feast time ============
  console.log('\n[F3] the feast carries the arming — it is not spent at feast time');
  {
    const { s } = freshGame();
    s.prog.feastSurge = 2.0; s.prog.feastSurgeUsed = false;
    const rep = Game.hostFeast();
    check('feast held', () => assert.ok(rep.ok, rep.why));
    check('arming still live after the feast', () => {
      assert.strictEqual(s.prog.feastSurge, 2.0, 'feastSurge=' + s.prog.feastSurge);
      assert.ok(s.prog.feastSurgeUsed !== true, 'feastSurgeUsed marked at feast time');
    });
    check('payoff narration keeps the weapon line', () => {
      assert.ok(/the feast was the weapon/.test(said.join(' ')), 'no payoff narration');
    });
    Game.clearFeastBuff(false);
  }

  // ============ F4: first real combat use spends + exact uplift ============
  console.log('\n[F4] first real combat use spends the arming; strike uplift exact');
  {
    const { s } = freshGame();
    s.prog.feastSurge = 2.0; s.prog.feastSurgeUsed = false;
    const rep = Game.hostFeast();
    assert.ok(rep.ok && grantReturns[0].granted, 'feast/grant failed: ' + rep.why);
    const mult = grantReturns[0].mult;
    const mk = synthFight(Game);
    const m = Game.tbFighter(mk);
    const p = Game.tbFighter('p');
    p.mx = 4; p.my = 4; p.moveLeft = 0; p.acted = false;
    const hpBefore = m.hp;
    said.length = 0;
    Game.tbPlayerStrike(mk);
    const dealt = hpBefore - m.hp;
    check('strike line states what LANDED (uplifted)', () => {
      const line = said.find(x => x.indexOf('You STRIKE') === 0) || '';
      const mnum = (line.match(/for (\d+)/) || [])[1];
      assert.ok(mnum != null && parseInt(mnum, 10) === dealt, 'line=' + mnum + ' dealt=' + dealt);
    });
    check('FEASTED line states the true mult', () => {
      assert.ok(said.some(x => x.indexOf('FEASTED ×' + mult) === 0),
        'no FEASTED x' + mult + ' line: ' + said.filter(x => /FEASTED/.test(x)).join(' | '));
    });
    check('feastSurgeUsed marked on real combat use', () => assert.strictEqual(s.prog.feastSurgeUsed, true, 'used=' + s.prog.feastSurgeUsed));
    check('devotion arming consumed by the use', () => assert.ok(!s.prog.feastSurge, 'feastSurge=' + s.prog.feastSurge));
    check('exact hook math: tbDamage(10, player-sourced) = round(10 x mult)', () => {
      // fresh monster, still feasted, still in combat
      Game.tbfight = null;
      const mk2 = synthFight(Game);
      const dealt2 = Game.tbDamage(mk2, 10, 'you', null, { quiet: true });
      assert.strictEqual(dealt2, Math.round(10 * mult), 'dealt=' + dealt2 + ' want=' + Math.round(10 * mult));
    });
    Game.tbfight = null;
  }

  // ============ F5: a feast that warms no blades spends nothing ============
  console.log('\n[F5] feast with no combat: devotion stays armed past the buff expiry');
  {
    const { s } = freshGame();
    s.prog.feastSurge = 2.0; s.prog.feastSurgeUsed = false;
    const rep = Game.hostFeast();
    assert.ok(rep.ok && grantReturns[0].granted, 'feast/grant failed');
    const b = s.feastBuff;
    assert.ok(b && b.untilDay, 'no buff state');
    // let dawn come: the buff expires lazily
    s.day = b.untilDay;
    assert.ok(!Game.feastedActive(), 'buff should have expired at dawn');
    check('arming survives an unused buff', () => {
      assert.strictEqual(s.prog.feastSurge, 2.0, 'feastSurge=' + s.prog.feastSurge);
      assert.ok(s.prog.feastSurgeUsed !== true, 'feastSurgeUsed marked without combat');
    });
  }

  console.log(`\n== ${pass} pass, ${fail} fail ==`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS FAILURE:', e); process.exit(2); });
