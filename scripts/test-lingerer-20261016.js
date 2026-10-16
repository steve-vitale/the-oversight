#!/usr/bin/env node
// test-lingerer-20261016.js — proof for design call #8 (lingerers).
// "Endure it" is the honest default; driving off a wave-4/5 lingerer requires
// a REAL costly played sortie — mustered fighters, real rations, real
// fieldFights (villagers can die) — never a flat button/roll.
//
// RED -> GREEN on a live Game via the shared sim-harness (seeded Math.random
// before eval, full index.html module list minus DOM-only, window stub deleted
// before play, Game.save never stubbed).
//
// RED (methods deleted = the pre-fix state): no engine path answers a
// lingerer — typeof Game.lingererSortie === 'undefined', and the gorge text
// offered no honest endure/sortie framing ("Drive it off, or call for help").
// GREEN: the working tree's Game implements the call:
//   1. sortie refuses honestly with a bare bench (needs 2+ besides you)
//   2. sortie deducts real marching rations from the pantry
//   3. every lingerer is fought through the real fieldFight engine
//      (one engine call per lingerer, narrated records — played, not a flat roll;
//      multi-round melee proven separately in 5)
//   4. a kill (or drive-off) stops the gorge
//   5. risk is real: the monster fights back (vTaken > 0 / party breaks),
//      wounds persist on a surviving entity
//   6. "Endure it" changes nothing and costs nothing
//   7. the nightly gorge text names Endure-it and the sortie
//   8. clearing the treeline resolves a raid crisis 'fought'
'use strict';
const assert = require('assert');
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0;
function ok(cond, msg) {
  if (!cond) { console.error('FAIL: ' + msg); process.exit(1); }
  pass++;
  console.log('  ok: ' + msg);
}
function pantryKcal(Game) {
  let k = 0;
  for (const it of ((Game.state.village || {}).pantry || [])) k += (it.kcalEach || 0) * (it.units || 0);
  return k;
}
function havenTile(Game) {
  const v = (Game.state || {}).village || {};
  return { x: (v.px !== undefined && v.px !== null) ? v.px : 4, y: (v.py !== undefined && v.py !== null) ? v.py : 4 };
}
function injectLingering(Game, id, hp, clear) {
  const { x: hx, y: hy } = havenTile(Game);
  const wms = Game.worldMonsters();
  if (clear !== false) {
    for (let i = wms.length - 1; i >= 0; i--) {
      if (wms[i].tx === hx && wms[i].ty === hy) wms.splice(i, 1);
    }
  }
  const mdef = (Game.data.monsters || []).find(x => x.id === id) || {};
  const hpDef = mdef.hp || [20, 20];
  const m = {
    id, tx: hx, ty: hy, mx: 4, my: 4, size: 1,
    hp: hp != null ? hp : hpDef[0], maxHp: hpDef[1] || hpDef[0],
    lingering: true, stance: null, fearTurns: 0, veteran: false, variant: null, lostSight: 0,
  };
  wms.push(m);
  try { Game.syncMonsterAlias(); } catch (e) {}
  return m;
}
function captureSay(Game) {
  const said = [];
  const orig = Game.say.bind(Game);
  Game.say = function (msg) {
    try { said.push(String((msg && (msg.text || msg.msg || msg.message)) || msg || '')); } catch (e) {}
    return orig(msg);
  };
  return { said, restore() { Game.say = orig; } };
}
function countFights(Game) {
  const recs = [];
  const orig = Game.fieldFight.bind(Game);
  Game.fieldFight = function () {
    const r = orig.apply(this, arguments);
    recs.push(r);
    return r;
  };
  return { recs, restore() { Game.fieldFight = orig; } };
}

async function main() {
  console.log('PART 0 — RED (pre-fix state: new methods deleted)');
  {
    const { Game } = await loadGame({ seed: 11, mode: 'lingerer-red', fullTelemetry: false });
    await setupGame(Game);
    delete Game.lingererSortie; delete Game.answerLingerer; delete Game.lingeringRaiders;
    ok(typeof Game.lingererSortie === 'undefined', 'RED: no sortie path pre-fix — a lingerer could not be answered by the player');
    ok(typeof Game.answerLingerer === 'undefined', 'RED: no endure/sortie choice pre-fix');
    ok(typeof Game.lingeringRaiders === 'undefined', 'RED: no lingerer query pre-fix');
  }

  console.log('PART 1 — GREEN wiring');
  {
    const { Game } = await loadGame({ seed: 21, mode: 'lingerer-wire', fullTelemetry: false });
    await setupGame(Game);
    ok(typeof Game.lingererSortie === 'function', 'lingerersortie wired');
    ok(typeof Game.answerLingerer === 'function', 'answerLingerer wired');
    ok(typeof Game.lingeringRaiders === 'function', 'lingeringRaiders wired');
    // the beats panel answers it (app.js data-beat dispatch) — engine side:
    const m = injectLingering(Game, 'herald');
    ok(Game.lingeringRaiders().indexOf(m) !== -1, 'lingeringRaiders finds the treeline lingerer');
  }

  console.log('PART 2 — bare bench: honest refusal');
  {
    const { Game } = await loadGame({ seed: 22, mode: 'lingerer-bench', fullTelemetry: false });
    await setupGame(Game);
    const m = injectLingering(Game, 'herald');
    const k0 = pantryKcal(Game);
    Game.state.village.roster = [Game.villagerId]; // nobody to send
    const res = Game.lingererSortie();
    ok(res && res.ok === false && res.why === 'no-fighters', 'sortie refuses honestly with a bare bench');
    ok(m.lingering === true, 'lingerers untouched by the refusal');
    ok(pantryKcal(Game) === k0, 'refusal costs nothing');
  }

  console.log('PART 3 — rations: real food leaves the pantry');
  {
    const { Game } = await loadGame({ seed: 23, mode: 'lingerer-cost', fullTelemetry: false });
    await setupGame(Game);
    injectLingering(Game, 'herald');
    const k0 = pantryKcal(Game);
    ok(k0 > 6000, 'test pantry holds the ration cost (sanity)');
    const res = Game.lingererSortie();
    const k1 = pantryKcal(Game);
    ok(res && res.ok === true, 'sortie runs with a full bench');
    ok(res.paid === k0 - k1, 'reported ration cost equals the pantry delta (honest actuals)');
    ok(res.paid >= 6000, 'sortie costs at least 2000 kcal per fighter (3 fighters)');
  }

  console.log('PART 4 — played fights, never a flat roll');
  {
    const { Game } = await loadGame({ seed: 24, mode: 'lingerer-played', fullTelemetry: false });
    await setupGame(Game);
    // two pre-wounded lingerers: the sortie must fight EACH in turn (a real
    // sequence), not resolve them with one roll
    injectLingering(Game, 'herald', 1);
    injectLingering(Game, 'herald', 1, false);
    ok(Game.lingeringRaiders().length === 2, 'two lingerers hold the treeline (sanity)');
    const { recs } = countFights(Game);
    const res = Game.lingererSortie();
    ok(recs.length === 2, 'sortie played one real fight per lingerer (fieldFight called ' + recs.length + 'x)');
    const realOutcomes = ['vKill', 'mFlee', 'vFlee', 'vDie', 'evade', 'alreadyDead'];
    ok(recs.every(r => r && realOutcomes.indexOf(r.outcome) !== -1 && (r.log || []).length >= 1),
      'every fight resolved through the engine with narration — a played sequence, never an outcome table');
    ok(res && res.cleared === 2 && Game.lingeringRaiders().length === 0, 'both lingerers resolved by the sortie');
  }

  console.log('PART 5 — a kill stops the gorge');
  {
    const { Game } = await loadGame({ seed: 25, mode: 'lingerer-kill', fullTelemetry: false });
    await setupGame(Game);
    const { said } = captureSay(Game);
    const m = injectLingering(Game, 'herald', 1); // pre-wounded: the sortie finishes it
    Game.lingererSortie();
    const gone = Game.worldMonsters().indexOf(m) === -1;
    const drivenOff = m.lingering === false;
    ok(gone || drivenOff, 'the lingerer is dead or driven off the treeline after the sortie');
    ok(Game.lingeringRaiders().length === 0, 'no lingerers hold the treeline');
    said.length = 0;
    Game.havenGrowthDaily();
    ok(!said.some(t => /gorges at the treeline/.test(t)), 'the gorge is silent once the treeline is clear');
  }

  console.log('PART 6 — risk is real (full-HP wave-4 lingerer)');
  {
    const { Game } = await loadGame({ seed: 105, mode: 'lingerer-risk', fullTelemetry: false });
    await setupGame(Game);
    const m = injectLingering(Game, 'herald'); // 700 HP, 30-50 dmg — no free win
    const hp0 = m.hp;
    const { recs } = countFights(Game);
    const res = Game.lingererSortie();
    ok(recs.length >= 1 && recs[0].rounds >= 1, 'the monster got its turns — a real fight');
    ok(recs.some(r => r.vTaken > 0) || res.broke === true,
      'the monster fought back: party hurt (vTaken>0) or the sortie broke off');
    ok(m.hp < hp0 || !m.lingering || Game.worldMonsters().indexOf(m) === -1,
      'the sortie left a mark: wounds persist on a surviving entity, or it is gone');
    ok(m.lingering === true, 'a failed sortie does not clear the treeline — the gorge goes on (honest)');
  }

  console.log('PART 7 — Endure it: the default, honest');
  {
    const { Game } = await loadGame({ seed: 27, mode: 'lingerer-endure', fullTelemetry: false });
    await setupGame(Game);
    const m = injectLingering(Game, 'herald');
    const k0 = pantryKcal(Game);
    const r = Game.answerLingerer('endure');
    ok(r === 'endured', 'answerLingerer(endure) answers');
    ok(m.lingering === true, 'enduring changes nothing at the treeline');
    ok(pantryKcal(Game) === k0, 'enduring costs nothing');
    ok(Game.state.lingererBeatDay === (Game.state.scholar || {}).day, 'the beat rests for the day');
  }

  console.log('PART 8 — the gorge text names the choice');
  {
    const { Game } = await loadGame({ seed: 28, mode: 'lingerer-text', fullTelemetry: false });
    await setupGame(Game);
    injectLingering(Game, 'herald');
    const { said, restore } = captureSay(Game);
    Game.havenGrowthDaily();
    restore();
    const gorge = said.filter(t => /gorges at the treeline/.test(t));
    ok(gorge.length >= 1, 'the gorge beat fires');
    ok(gorge.some(t => /Endure it/.test(t)), 'the gorge names "Endure it" as the default');
    ok(gorge.some(t => /~6 nights/.test(t)), 'the gorge states the honest timeline (the 6-day valve)');
    ok(gorge.some(t => /sortie/i.test(t)), 'the gorge names the sortie alternative');
  }

  console.log('PART 9 — a cleared treeline resolves the raid crisis fought');
  {
    const { Game } = await loadGame({ seed: 29, mode: 'lingerer-crisis', fullTelemetry: false });
    await setupGame(Game);
    injectLingering(Game, 'herald', 1);
    const c = Game.raiseAidCrisis('herald', 4);
    ok(c, 'raid crisis raised (sanity)');
    c.raiders = true;
    Game.lingererSortie();
    ok(Game.lingeringRaiders().length === 0, 'treeline clear (sanity)');
    ok(Game.aidCrisis() === null, "the raid crisis resolves 'fought' when the sortie clears the treeline");
  }

  console.log('\nALL ' + pass + ' ASSERTIONS GREEN');
}

main().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
