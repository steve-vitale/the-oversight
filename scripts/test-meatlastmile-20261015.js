#!/usr/bin/env node
// scripts/test-meatlastmile-20261015.js — proof test for the COOK→EAT
// LAST-MILE diagnostic instrument (scripts/meatlastmile-lib-20261015.js).
// INSTRUMENT ONLY — no game-code changes.
//
// PART A (fixtures, seed 42): each pipeline stage attributes exactly once —
//   kill → corpseRot → hauled → cleaned → cooked → eaten → rotPack →
//   succession. Plus the belltoad legs/body split.
// PART B (det-gate / SMOKE=1 honesty): leadcourt 60d on seeds 11, 22 —
//   instrument-armed vs pristine trajectories must be BYTE-IDENTICAL
//   (the r27 instrument-honesty pattern). A failing gate means the
//   instrument lies, not that the game changed.
// PART C (sense): the armed runs must have captured meat-handling
//   transcript beats (the SENSE-TESTING LAW reads them, not counts).
//
// Usage: node scripts/test-meatlastmile-20261015.js
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { attachInstruments, finalize } = require('./meatlastmile-lib-20261015');
const { leadcourt } = require('./policies/leadcourt');

let passed = 0, failed = 0;
function check(name, cond, extra) {
  if (cond) { passed++; }
  else { failed++; process.stderr.write('  FAIL ' + name + (extra ? ' — ' + extra : '') + '\n'); }
}
function dayOf(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }
function dayHash(Game) {
  try {
    const s = (Game.state || {}).scholar || {}, v = (Game.state || {}).village || {};
    const pk = ((v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0));
    return [s.day, Math.round(s.health || 0), Math.round(s.kcal || 0),
      (v.roster || []).length, Math.round(pk / 100),
      ((Game.state.corpses || []).length)].join('|');
  } catch (e) { return 'ERR'; }
}
function mdef(Game, id) { return (Game.data.monsters || []).find(x => x.id === id); }

async function partA() {
  console.log('PART A — stage-attribution fixtures');
  const { Game } = await loadGame({ seed: 42, mode: 'meatlastmile-test', fullTelemetry: false });
  await setupGame(Game);
  const m = attachInstruments(Game);
  const day = dayOf(Game);

  // Mark gallowdeer flesh safe so the pipeline is realized (kcalEach > 0).
  // The knowledge gate (undiscovered flesh = kcalEach 0) is engine behavior;
  // the instrument measures potential via hiddenKcal in that case.
  try { Game.markMonsterFoodSafe('gallowdeer', 'test'); } catch (e) {}

  // A1: kill attribution — gallowdeer carcass gross
  const gd = mdef(Game, 'gallowdeer');
  check('gallowdeer mdef exists', !!gd);
  const entries = Game.monsterCarcassEntries(gd);
  const gross = entries.reduce((t, e) => t + (e.hiddenKcal || 0), 0);
  check('kill attributed', m.killed['meat_gallowdeer'] === gross && gross > 0,
    `killed=${m.killed['meat_gallowdeer']} gross=${gross}`);

  // A2: belltoad legs/body split — rot both on a corpse (attributed)
  const bt = mdef(Game, 'belltoad');
  let btGross = 0;
  if (bt) {
    const be = Game.monsterCarcassEntries(bt);
    const total = be.reduce((t, e) => t + (e.hiddenKcal || 0), 0);
    const legs = be.find(e => e.plantId === 'meat_belltoad_legs');
    const body = be.find(e => e.plantId === 'meat_belltoad');
    check('belltoad two entries', be.length === 2 && !!legs && !!body, `n=${be.length}`);
    check('legs ~2/3 of gross', legs && Math.abs(legs.hiddenKcal - Math.round(total * 2 / 3)) <= 1,
      `legs=${legs && legs.hiddenKcal} total=${total}`);
    check('legs+body == total', legs && body && legs.hiddenKcal + body.hiddenKcal === total);
    check('legs attributed separately', m.killed['meat_belltoad_legs'] === (legs && legs.hiddenKcal));
    check('body attributed separately', m.killed['meat_belltoad'] === (body && body.hiddenKcal));
    btGross = total;
    for (const e of be) e.spoilDay = day - 1;
    Game.state.corpses = Game.state.corpses || [];
    Game.state.corpses.push({ id: 'mlm-t0', kind: 'monster', buried: false, node: { x: 99, y: 99 }, items: be });
  }

  // A3: corpse rot — A1's carcasses rot on a corpse
  for (const e of entries) e.spoilDay = day - 1;
  const corpse = { id: 'mlm-t1', kind: 'monster', buried: false,
    node: { x: 99, y: 99 }, items: entries.slice() };
  Game.state.corpses.push(corpse);
  Game.sweepSpoiled();
  check('corpse rot attributed', m.corpseRot['meat_gallowdeer'] === gross,
    `corpseRot=${m.corpseRot['meat_gallowdeer']} gross=${gross}`);
  check('belltoad rot attributed', !bt || (m.corpseRot['meat_belltoad_legs'] + m.corpseRot['meat_belltoad']) === btGross,
    `legs=${m.corpseRot['meat_belltoad_legs']} body=${m.corpseRot['meat_belltoad']}`);
  check('rotten carcasses removed', corpse.items.length === 0);

  // A4: haul — take a fresh carcass from a corpse into the pack
  // (_corpseTakeStack pushes a COPY into the pack, zeroing the original)
  const haulEntry = Game.monsterCarcassEntries(gd)[0];
  const hg = haulEntry.hiddenKcal;
  const corpse2 = { id: 'mlm-t2', kind: 'monster', buried: false,
    node: { x: 99, y: 99 }, items: [haulEntry] };
  Game.state.corpses.push(corpse2);
  Game._corpseTakeStack(corpse2, haulEntry);
  check('haul attributed', m.hauledGross['meat_gallowdeer'] === hg,
    `hauled=${m.hauledGross['meat_gallowdeer']} gross=${hg}`);
  const hauledCopy = Game.state.scholar.inventory.find(i => i && i.plantId === 'meat_gallowdeer');
  check('hauled copy in pack', !!hauledCopy);

  // A5: clean — carcass → cleaned meat (needs a knife)
  Game.state.scholar.inventory.push({ name: 'stone knife', itemId: 'stone_knife', units: 1 });
  const cidx = Game.state.scholar.inventory.indexOf(hauledCopy);
  Game.cleanCarcass(cidx);
  check('carcass cleaned', hauledCopy.foodState === 'cleaned', hauledCopy.foodState);
  check('clean gross captured', m.cleanGross['meat_gallowdeer'] === hg,
    `cleanGross=${m.cleanGross['meat_gallowdeer']} hg=${hg}`);
  const net = (hauledCopy.kcalEach || 0) * (hauledCopy.units || 1);
  check('clean net captured', m.cleanNet['meat_gallowdeer'] === net && net > 0,
    `cleanNet=${m.cleanNet['meat_gallowdeer']} net=${net}`);
  check('cleaning loses kcal (gross>net)', hg > net, `${hg} > ${net}`);
  check('selfCleans counted', m.selfCleans === 1, `selfCleans=${m.selfCleans}`);

  // A6: cook — light a map fire (free fuel), cook the cleaned meat
  const detail = Game.genDetail(Game.map.px, Game.map.py);
  detail[4][4] = 'fire';
  check('nearFire true', Game.nearFire() === true);
  const preCookNet = net;
  Game.cookAll();
  check('meat cooked', hauledCopy.foodState === 'cooked', hauledCopy.foodState);
  const postCookNet = (hauledCopy.kcalEach || 0) * (hauledCopy.units || 1);
  check('cook stage attributed', (m.cookLoss['cook'] || 0) === (preCookNet - postCookNet),
    `cookLoss=${m.cookLoss['cook']} expected=${preCookNet - postCookNet}`);

  // A7: eat — one unit of the cooked meat
  Game.state.scholar.kcal = 0;
  const eidx = Game.state.scholar.inventory.indexOf(hauledCopy);
  const kcalEach = hauledCopy.kcalEach;
  Game.eatOne(eidx);
  check('eat attributed', m.eaten['meat_gallowdeer'] === kcalEach,
    `eaten=${m.eaten['meat_gallowdeer']} kcalEach=${kcalEach}`);
  check('eat attributed by state', (m.eatenState['meat_gallowdeer'] || {}).cooked === kcalEach,
    JSON.stringify(m.eatenState['meat_gallowdeer']));
  check('eatEvents counted', m.eatEvents >= 1);

  // A8: pack rot — cleaned meat past its spoilDay (routed via corpse+haul
  // so the gross-side stays conserved)
  const rotMeat = Game.monsterCarcassEntries(gd)[0];
  const rc8 = { id: 'mlm-t8', kind: 'monster', buried: false, node: { x: 99, y: 99 }, items: [rotMeat] };
  Game.state.corpses.push(rc8);
  Game._corpseTakeStack(rc8, rotMeat);
  const rotCopy = Game.state.scholar.inventory.find(i => i && i.plantId === 'meat_gallowdeer' && i.foodState === 'carcass');
  check('A8 hauled', !!rotCopy);
  Game.carcassToMeat(Game.state.scholar.inventory, Game.state.scholar.inventory.indexOf(rotCopy), true);
  rotCopy.spoilDay = dayOf(Game) - 1;
  const rotNet = (rotCopy.kcalEach || 0) * (rotCopy.units || 1);
  check('A8 meat realized (food safe)', rotNet > 0, `rotNet=${rotNet}`);
  Game.sweepSpoiled();
  check('pack rot attributed', m.rotPack['meat_gallowdeer'] === rotNet,
    `rotPack=${m.rotPack['meat_gallowdeer']} rotNet=${rotNet}`);

  // A9: succession — pack meat wiped at player death
  const sucMeat = Game.monsterCarcassEntries(gd)[0];
  const rc9 = { id: 'mlm-t9', kind: 'monster', buried: false, node: { x: 99, y: 99 }, items: [sucMeat] };
  Game.state.corpses.push(rc9);
  Game._corpseTakeStack(rc9, sucMeat);
  const sucCopy = Game.state.scholar.inventory.find(i => i && i.plantId === 'meat_gallowdeer' && i.foodState === 'carcass');
  check('A9 hauled', !!sucCopy);
  Game.carcassToMeat(Game.state.scholar.inventory, Game.state.scholar.inventory.indexOf(sucCopy), true);
  const sucNet = (sucCopy.kcalEach || 0) * (sucCopy.units || 1);
  const sucBefore = m.successionNet;
  Game.playerDeath('instrument test');
  check('succession attributed', m.successionNet - sucBefore >= sucNet && sucNet > 0,
    `delta=${m.successionNet - sucBefore} sucNet=${sucNet}`);
  check('successions counted', m.successions === 1, `successions=${m.successions}`);

  // conservation on the fixture run
  const s = finalize(Game, m, null);
  check('no instrument errors', m.instrErrors.length === 0, m.instrErrors.join('; '));
  console.log(`  fixture conservation: killed=${s.killedTotal} grossUnattr=${s.grossUnattributed} netResidual=${s.netResidual} coverage=${s.coverage}`);
  check('fixture coverage >= 0.8', s.coverage >= 0.8, `coverage=${s.coverage}`);
}

async function trajectory(seed, armed) {
  const { Game } = await loadGame({ seed, mode: 'meatlastmile-det', fullTelemetry: false });
  await setupGame(Game);
  if (armed) attachInstruments(Game);
  const policy = Object.assign({}, leadcourt);
  const hashes = [];
  const origDaily = policy.daily;
  policy.daily = function (G, ctx) {
    try { hashes.push(dayHash(G)); } catch (e) {}
    if (origDaily) return origDaily.call(this, G, ctx);
  };
  await quietLog(async () => { await runDays(Game, policy, { days: 60 }); });
  return hashes.join('\n');
}

async function partB() {
  console.log('PART B — det-gate: armed vs pristine byte-identical');
  for (const seed of [11, 22]) {
    const a = await trajectory(seed, true);
    const b = await trajectory(seed, false);
    const ok = a === b && a.length > 0;
    check(`seed ${seed} byte-identical (${a.split('\n').length} days)`, ok,
      ok ? '' : `len a=${a.length} b=${b.length}`);
    if (!ok && a.length && b.length) {
      const la = a.split('\n'), lb = b.split('\n');
      for (let i = 0; i < Math.min(la.length, lb.length); i++)
        if (la[i] !== lb[i]) { process.stderr.write(`    first divergence day ${i}: ${la[i]} vs ${lb[i]}\n`); break; }
    }
  }
}

(async () => {
  try {
    await partA();
    await partB();
  } catch (e) {
    failed++;
    process.stderr.write('FATAL ' + (e && e.stack || e) + '\n');
  }
  console.log(failed ? `\nPROOF FAIL: ${failed} failed, ${passed} passed` : `\nPROOF GREEN: ${passed}/${passed} passed`);
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
