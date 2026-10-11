#!/usr/bin/env node
// Break-it combat r11 (2026-10-11): hostile probes.
// P1: leech-stance trust farming — uncapped per-hit trust via chip damage.
// P2: leech intercept fires on PLAYER-sourced damage (own gristlefit lash).
// P3: armor-model numbers — player block, villager block, pierce hook.
// P4: belltoad chorus hold — fight with no live fighters + pending pack.
// P5: dead-code reachability + index.html script coverage + deer benchmark.
const H = require('./break-combat-harness-20261011.js');
const fs = require('fs'), path = require('path');
let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  PASS', name); }
  else { fail++; console.log('  FAIL', name, extra || ''); }
}

(async () => {
  const Game = await H.boot();
  const S = globalThis.Scattering;
  // silence drama/audio side effects that need DOM
  Game.drama = () => {}; Game.audioEvent = () => {};
  Game.passiveBonus = () => 0;
  Game.state.scholar.agi = 5;
  try { S.calories.burdenTier = () => ({ dodgePen: 0 }); } catch (e) {}

  const vid = Game.state.village.roster.find(id => id !== Game.villagerId) || Game.state.village.roster[0];
  Game.state.village.trust = Game.state.village.trust || {};

  console.log('P1: leech-stance trust — ONE debt per villager per fight (fix r11)');
  {
    H.sayLog.length = 0;
    const pf = H.synthFight(Game, [
      H.allyFighter(vid, 5, 4, 100, 40),          // ally adjacent, armored
      H.monFighter(Game, 'bulldozer', 'm1', 6, 4, 60),
    ], { php: 100 });
    pf.leechStance = true; // stance planted
    const ally = Game.tbFighter('v_' + vid);
    Game.state.village.trust[vid] = 10;
    const t0 = Game.state.village.trust[vid];
    const pHp0 = pf.hp;
    // 12 chip hits of 3 (armor eats most; redirect still fires per hit)
    for (let i = 0; i < 12; i++) {
      pf.leechStance = true; // re-planted each "round"
      Game.tbDamage(ally.key, 3, 'test chip', 'm1');
    }
    const t1 = Game.state.village.trust[vid];
    const oweLines = H.sayLog.filter(l => l.includes('They owe you')).length;
    const stanceLines = H.sayLog.filter(l => l.includes('step in front')).length;
    console.log(`  trust ${t0} -> ${t1} after 12 chip hits; "owe you" lines: ${oweLines}; intercepts: ${stanceLines}; player hp ${pHp0}->${pf.hp}`);
    const oneGrant = t0 + Game.trustGainProgressive(vid, 5); // disposition-scaled single debt
    ok('P1 FIXED: trust capped at one debt per fight', t1 === oneGrant, `got ${t1}, one grant = ${oneGrant}`);
    // a second volley grants nothing more
    for (let i = 0; i < 12; i++) { pf.leechStance = true; Game.tbDamage(ally.key, 3, 'test chip', 'm1'); }
    ok('P1 FIXED: second volley grants zero trust', Game.state.village.trust[vid] === t1);
    ok('P1 FIXED: "owe you" said once', oweLines === 1, `got ${oweLines}`);
    ok('P1 HELD: stance still drinks half of every hit (12 intercepts)', stanceLines === 12, `got ${stanceLines}`);
    ok('P1 HELD: player still pays the sacrifice', pf.hp < pHp0, `hp ${pHp0} -> ${pf.hp}`);
  }

  console.log('P2: leech does NOT intercept player-sourced damage (fix r11)');
  {
    H.sayLog.length = 0;
    const pf = H.synthFight(Game, [
      H.allyFighter(vid, 5, 4, 100, 0),
      H.monFighter(Game, 'bulldozer', 'm1', 6, 4, 60),
    ], { php: 100 });
    pf.leechStance = true;
    const ally = Game.tbFighter('v_' + vid);
    Game.state.village.trust[vid] = 40;
    const hpBefore = pf.hp, allyHpBefore = ally.hp;
    Game.tbDamage(ally.key, 8, 'your gristlefit', 'p', { quiet: true });
    const interceptLines = H.sayLog.filter(l => l.includes('step in front')).length;
    const trustAfter = Game.state.village.trust[vid];
    console.log(`  intercept lines: ${interceptLines}, player hp ${hpBefore}->${pf.hp}, ally hp ${allyHpBefore}->${ally.hp}, trust 40->${trustAfter}`);
    ok('P2 FIXED: no self-intercept narration', interceptLines === 0, `got ${interceptLines}`);
    ok('P2 FIXED: no trust gain from own blow', trustAfter === 40, `got ${trustAfter}`);
    ok('P2 FIXED: player takes none of own lash', pf.hp === hpBefore, `hp ${hpBefore} -> ${pf.hp}`);
    ok('P2 FIXED: ally takes the full lash', ally.hp === allyHpBefore - 8, `ally ${allyHpBefore} -> ${ally.hp}`);
  }

  console.log('P3: armor-model numbers (variant B, pierce hook, hit-1 clamp)');
  {
    // player block: prot=20, pierce=0.2 (gavel), incoming 30
    Game.armorBonus = () => 20;
    const pf = H.synthFight(Game, [H.monFighter(Game, 'gavel', 'm1', 6, 4, 60)], { php: 100 });
    const atk = Game.tbFighter('m1'); atk.mdef = Object.assign({}, atk.mdef, { pierce: 0.2 });
    const landed = Game.tbDamage('p', 30, 'test gavel hit', 'm1', { quiet: true, undodgeable: true });
    // effP=16, r=16/36=0.4444, absorb=min(29,round(13.333)=13)=13, final=17
    ok('player armor: 30 incoming, P=20, pierce 0.2 -> 17 lands', landed === 17, 'got ' + landed);
    // hit-1 clamp: 1-damage chip must land fully, no absorb narration
    H.sayLog.length = 0;
    const pf2 = Game.tbFighter('p'); pf2.hp = 100;
    const chip = Game.tbDamage('p', 1, 'chip', 'm1', { quiet: true, undodgeable: true });
    const absorbLines = H.sayLog.filter(l => /absorbs 0/.test(l)).length;
    ok('hit-1 clamp: 1-dmg chip lands as 1', chip === 1, 'got ' + chip);
    ok('no "absorbs 0" narration', absorbLines === 0);
    // villager block: varmor=54, pierce 0.2, incoming 25 -> effP=43.2 r=0.6835 absorb=min(24,17)=17 -> 8
    const pf3 = H.synthFight(Game, [
      H.allyFighter(vid, 5, 4, 100, 54),
      H.monFighter(Game, 'gavel', 'm2', 6, 4, 60),
    ], { php: 100 });
    const atk2 = Game.tbFighter('m2'); atk2.mdef = Object.assign({}, atk2.mdef, { pierce: 0.2 });
    const ally = Game.tbFighter('v_' + vid);
    const vlanded = Game.tbDamage(ally.key, 25, 'test gavel hit', 'm2', { quiet: true });
    ok('villager armor: 25 incoming, P=54, pierce 0.2 -> 8 lands', vlanded === 8, 'got ' + vlanded);
    // pierce default 0: monster without pierce vs player P=20, incoming 30 -> effP=20 r=0.5 absorb=min(29,15)=15 -> 15
    const pf4 = H.synthFight(Game, [H.monFighter(Game, 'bulldozer', 'm3', 6, 4, 60)], { php: 100 });
    const noPierce = Game.tbDamage('p', 30, 'plain hit', 'm3', { quiet: true, undodgeable: true });
    ok('no-pierce default: 30 incoming, P=20 -> 15 lands', noPierce === 15, 'got ' + noPierce);
    delete Game.armorBonus;
  }

  console.log('P4: belltoad chorus hold (no live fighters, pending pack)');
  {
    const pf = H.synthFight(Game, [H.monFighter(Game, 'bulldozer', 'm1', 6, 4, 60)], { php: 100 });
    const m = Game.tbFighter('m1'); m.alive = false; m.hp = 0; // all monsters dead
    Game._pendingPack = { id: 'bulldozer', count: 2, mdef: Game.data.monsters.find(x => x.id === 'bulldozer') };
    const held = Game.tbEndCheck();
    ok('fight held open while chorus pending', held === false && !Game.tbfight.over);
    // player still has a legal out: barrier exit function exists
    ok('tbBarrierExit reachable (flee path exists)', typeof Game.tbBarrierExit === 'function');
    Game._pendingPack = null;
  }

  console.log('P5: dead-code / wiring / benchmark');
  {
    const fns = ['tbDamage', 'tbAdvance', 'tbAdvanceAsync', 'tbBeginTurn', 'tbPlayerStrike',
      'tbPlayerWait', 'tbAfterPlayerAction', 'tbEndCheck', 'tbEnd', 'tbRoundWrap',
      'tbSnakeSplit', 'tbBarrierExit', 'spendCombatAction', 'addHealth',
      '_applyAbilityDefenseMods', 'tbMonsterTurn', 'tbVillagerTurn', 'rollAlienLoot'];
    const missing = fns.filter(f => typeof Game[f] !== 'function');
    ok('all combat fns reachable on Game', missing.length === 0, 'missing: ' + missing.join(','));
    // index.html covers every src/js file
    const html = fs.readFileSync(path.join(H.ROOT, 'index.html'), 'utf8');
    const files = fs.readdirSync(path.join(H.ROOT, 'src/js')).filter(f => f.endsWith('.js'));
    const uncovered = files.filter(f => !html.includes('src/js/' + f));
    ok('index.html loads every src/js/*.js', uncovered.length === 0, 'uncovered: ' + uncovered.join(','));
    // harness eval'd every file without EVAL FAIL (implicit) — count check
    const listed = fs.readFileSync('/tmp/harness-list.txt', 'utf8').trim().split('\n').length;
    ok('harness evals full list (' + listed + ' files)', listed >= 55);
    // Highbeam Deer benchmark: gallowdeer hp range contains 160
    const gd = Game.data.monsters.find(m => m.id === 'gallowdeer');
    const hp = gd && gd.hp;
    ok('gallowdeer (Highbeam Deer) hp band intact', Array.isArray(hp) && hp[0] <= 160 && hp[1] >= 160, JSON.stringify(hp));
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('PROBE CRASH', e); process.exit(1); });
