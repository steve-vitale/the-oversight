#!/usr/bin/env node
// test-understudy-20261017.js — proof record for the sim-understudy arm
// (axis scale-onramp; findings #432a/#433): the fresh_weapon contact+execution
// gap on The Understudy (wave 2). The policy layer (scripts/policies/
// understudy.js, UNDERHUNT=1, default OFF) does the honest mid-fight switch:
// real Game.equip(idx, 'melee') (non-turn-costing) then delegate, so the
// base strikes with the fresh weapon and the engine's own checkMonsterCounter
// logs the performance on the real strike.
//
// Sections:
//   GATE         — RED: UNDERHUNT unset → layerOn() false (det-gate pins
//                gate-off byte-identical delegation).
//   FRESH_WEAPON — GREEN: real startCombat('understudy'), usSeen populated
//                (the switch trigger genuinely present), scholar carries an
//                unseen melee weapon, trick known, hp full → understudyPlay
//                switches via the real Game.equip (acted/moveLeft untouched)
//                and delegates (returns false); the real Game.tbPlayerStrike
//                then logs fresh_weapon in f.trickLogByMid.understudy.
//                NEGATIVES: usSeen empty (opener) → no switch; unknown trick
//                → no switch; hp<0.7 → no switch; no fresh weapon → no switch;
//                turn-1 outmatched → no switch (delegate for the flee).
//   DET          — gate-off wrapped policies byte-identical to the tribfloor
//                base (2 seeds x 60d via dayHash); gate-on deterministic.
//   SMOKE        — 20d pre-seat run with UNDERHUNT=1 completes green.
//
// Sim-harness rules honored: Math.random seeded BEFORE eval; child processes
// for process isolation; no Game.save stub; no hardcoded absolute paths
// (ROOT from __dirname); loads via sim-harness.js.
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const HARNESS = path.join(ROOT, 'scripts', 'sim-harness.js');
const LAYER = path.join(ROOT, 'scripts', 'policies', 'understudy.js');
// Post-kill: the layer was deleted zero-trace per the kill protocol.
// The proof INFO-SKIPs on the absent layer (established pattern).
if (!fs.existsSync(LAYER)) {
  console.log('INFO-SKIP: understudy.js layer absent (killed at pilot) — proof not applicable');
  process.exit(0);
}
const REPO = require(LAYER);

let pass = 0, fail = 0;
const fails = [];
function ok(cond, name) {
  if (cond) { pass++; }
  else { fail++; fails.push(name); console.log('  FAIL: ' + name); }
}

// gameEval: run a JS snippet inside a full seeded game (child process,
// process isolation). The snippet can use `out` to report results.
function gameEval(seed, js, env) {
  const tmpFile = '/tmp/us-synth-' + seed + '-' + process.pid + '.js';
  const envLines = Object.entries(env || {}).map(([k, v]) => `process.env.${k} = '${v}';`).join('\n');
  const code = `
${envLines}
const { loadGame, setupGame } = require('${HARNESS}');
const REPO = require('${LAYER}');
(async () => {
  const { Game } = await loadGame({ seed: ${seed}, mode: 'synth', fullTelemetry: false });
  await setupGame(Game);
  const out = {};
  try {
${js}
  } catch (e) { out.__err = String((e && e.stack) || e).slice(0, 500); }
  console.log('RESULTJSON:' + JSON.stringify(out));
})().catch(e => { console.log('RESULTJSON:' + JSON.stringify({ __err: String(e && e.stack || e).slice(0, 500) })); });
`;
  fs.writeFileSync(tmpFile, code);
  try {
    const res = execSync(`node ${tmpFile}`, { encoding: 'utf8', timeout: 120000 });
    const line = res.split('\n').find(l => l.startsWith('RESULTJSON:'));
    return line ? JSON.parse(line.slice('RESULTJSON:'.length)) : { __err: 'no result line' };
  } catch (e) {
    return { __err: 'exec failed: ' + String(e.message).slice(0, 200) };
  } finally { try { fs.unlinkSync(tmpFile); } catch (e) {} }
}

console.log('== GATE (RED) ==');
ok(REPO.layerOn() === false, 'RED: UNDERHUNT unset → layerOn() false (gate off by default)');

// ---------- FRESH_WEAPON ----------
console.log('== FRESH_WEAPON (GREEN + negatives) ==');
{
  const o = gameEval(3701, `
    Game.startCombat('understudy');
    const mf = Game.tbfight.fighters.find(x => x.kind === 'monster');
    const p = Game.tbFighter('p');
    p.hp = 100; p.maxHp = 100; p.moveLeft = 6; p.acted = false;
    mf.mx = 4; mf.my = 4; p.mx = 5; p.my = 4; // adjacent
    // THE SWITCH TRIGGER, GENUINELY PRESENT: the understudy has SEEN the
    // current weapon (the first strike of the fight already happened).
    const curName = Game.equippedWeapon().name;
    out.curName = curName;
    mf.usSeen = {}; mf.usSeen[curName] = { count: 1, dmg: 3 };
    // an unseen melee weapon in the pack
    const wdef = Game.data.items.find(i => i.weapon && (i.class === 'weapon' || i.class === 'sentimental') && i.name !== curName);
    out.wdefName = wdef && wdef.name;
    out.wdefSlot = null;
    try {
      const SC = globalThis.Scattering || {};
      out.wdefSlot = (SC.equipment && SC.equipment.slotForItem) ? SC.equipment.slotForItem(wdef) : 'n/a';
    } catch (e) {}
    Game.state.scholar.inventory.push({ itemId: wdef.id });
    // knowledge gate: fully discovered
    (Game.state.monsterCounters = Game.state.monsterCounters || {}).understudy = true;
    const actedBefore = !!p.acted, moveBefore = p.moveLeft;
    const ctx = {};
    const ret = REPO.understudyPlay(Game, ctx);
    out.ret = ret; // delegate: the base spends the turn striking
    out.switchedTo = Game.equippedWeapon().name;
    out.actedAfter = !!p.acted; out.moveAfter = p.moveLeft;
    out.nonTurnCosting = (out.actedAfter === actedBefore) && (out.moveAfter === moveBefore);
    out.attempts = ctx.usSwitches || 0;
    // the real engine path: the base's strike with the fresh weapon
    if (ret === false) Game.tbPlayerStrike(mf.key);
    const tl = ((Game.tbfight || {}).trickLogByMid || {}).understudy || [];
    out.perfs = tl.slice();
  `, { UNDERHUNT: '1' });
  if (o.__err) { ok(false, 'fresh_weapon GREEN: no engine error — ' + o.__err); }
  else {
    ok(o.wdefName && o.wdefSlot === 'melee', `fresh_weapon: unseen melee weapon found in data (${o.wdefName}, slot=${o.wdefSlot})`);
    ok(o.ret === false, 'fresh_weapon: layer delegates after the switch (returns false, base strikes)');
    ok(o.switchedTo === o.wdefName, `fresh_weapon: equipped switched to the unseen weapon (${o.switchedTo})`);
    ok(o.nonTurnCosting === true, `fresh_weapon: Game.equip non-turn-costing (acted ${o.actedAfter}, moveLeft ${o.moveAfter})`);
    ok(o.attempts === 1, 'fresh_weapon: exactly one switch attempt counted');
    ok(Array.isArray(o.perfs) && o.perfs.indexOf('fresh_weapon') >= 0,
      `fresh_weapon: real strike logged fresh_weapon in trickLogByMid (${JSON.stringify(o.perfs)})`);
  }
}
function freshNeg(seed, tweak) {
  return gameEval(seed, `
    Game.startCombat('understudy');
    const mf = Game.tbfight.fighters.find(x => x.kind === 'monster');
    const p = Game.tbFighter('p');
    p.hp = 100; p.maxHp = 100; p.moveLeft = 6;
    mf.mx = 4; mf.my = 4; p.mx = 5; p.my = 4;
    const curName = Game.equippedWeapon().name;
    mf.usSeen = {}; mf.usSeen[curName] = { count: 1, dmg: 3 };
    const wdef = Game.data.items.find(i => i.weapon && (i.class === 'weapon' || i.class === 'sentimental') && i.name !== curName);
    Game.state.scholar.inventory.push({ itemId: wdef.id });
    (Game.state.monsterCounters = Game.state.monsterCounters || {}).understudy = true;
    ${tweak}
    const before = Game.equippedWeapon().name;
    const ret = REPO.understudyPlay(Game, {});
    out.ret = ret;
    out.after = Game.equippedWeapon().name;
    out.unchanged = (before === out.after);
  `, { UNDERHUNT: '1' });
}
{
  const a = freshNeg(3702, `mf.usSeen = {}; // OPENER: nothing seen yet — the switch is not the trick`);
  ok(!a.__err && a.unchanged === true, 'fresh_weapon NEG (opener, usSeen empty): no switch');
  const b = freshNeg(3703, `delete Game.state.monsterCounters.understudy; // UNKNOWN: not ours to attempt`);
  ok(!b.__err && b.unchanged === true, 'fresh_weapon NEG (unknown trick): no switch');
  const c = freshNeg(3704, `p.hp = 50; // HURT: luxury move refused`);
  ok(!c.__err && c.unchanged === true, 'fresh_weapon NEG (hp<0.7): no switch');
  const d = freshNeg(3705, `Game.state.scholar.inventory = []; // NO FRESH WEAPON in the pack`);
  ok(!d.__err && d.unchanged === true, 'fresh_weapon NEG (no fresh weapon): no switch');
  const e = freshNeg(3706, `mf.maxHp = 300; mf.hp = 300; // OUTMATCHED on turn 1: delegate for the flee`);
  ok(!e.__err && e.ret === false && e.unchanged === true, 'fresh_weapon NEG (turn-1 outmatched): delegate, no switch');
  // Second call in the same fight: once per fight — no second switch even
  // with another fresh weapon available.
  const f = gameEval(3707, `
    Game.startCombat('understudy');
    const mf = Game.tbfight.fighters.find(x => x.kind === 'monster');
    const p = Game.tbFighter('p');
    p.hp = 100; p.maxHp = 100; p.moveLeft = 6;
    mf.mx = 4; mf.my = 4; p.mx = 5; p.my = 4;
    const curName = Game.equippedWeapon().name;
    mf.usSeen = {}; mf.usSeen[curName] = { count: 1, dmg: 3 };
    const wdefs = Game.data.items.filter(i => i.weapon && (i.class === 'weapon' || i.class === 'sentimental') && i.name !== curName).slice(0, 2);
    out.nFresh = wdefs.length;
    for (const w of wdefs) Game.state.scholar.inventory.push({ itemId: w.id });
    (Game.state.monsterCounters = Game.state.monsterCounters || {}).understudy = true;
    const ctx = {};
    const r1 = REPO.understudyPlay(Game, ctx);
    const afterFirst = Game.equippedWeapon().name;
    const r2 = REPO.understudyPlay(Game, ctx);
    out.r1 = r1; out.r2 = r2;
    out.afterFirst = afterFirst; out.afterSecond = Game.equippedWeapon().name;
    out.switches = ctx.usSwitches || 0;
  `, { UNDERHUNT: '1' });
  ok(!f.__err && f.switches === 1 && f.afterFirst === f.afterSecond,
    `fresh_weapon: once per fight (switches=${f.switches}, no second switch)`);
}

// ---------- DET ----------
console.log('== DET ==');
(async () => {
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  const { dayHash } = require('./det-gate');
  const { leadfeast, belongfeast } = require('./policies/tribfloor');
  async function trajectory(seed, usOn, policyObj) {
    if (usOn) process.env.UNDERHUNT = '1'; else delete process.env.UNDERHUNT;
    const { Game } = await loadGame({ seed, mode: 'understudy-det', fullTelemetry: false });
    await setupGame(Game);
    const hs = [];
    const oDaily = policyObj.daily;
    const policy = Object.assign({}, policyObj, {
      daily(G, ctx) { if (oDaily) { try { oDaily(G, ctx); } catch (e) {} } try { hs.push(G.state.scholar.day + ':' + dayHash(G)); } catch (e) {} },
    });
    await quietLog(async () => { await runDays(Game, policy, { days: 60, sampleEvery: 30 }); });
    return hs.join('|');
  }
  const tOff1 = await trajectory(204, false, REPO.understudyLead);
  const tOff2 = await trajectory(204, false, leadfeast);
  ok(tOff1 === tOff2 && tOff1.length > 0, `RED det-gate: gate-off understudy-lead byte-identical to tribfloor leadfeast (s204) len=${tOff1.length}`);
  const tOff3 = await trajectory(205, false, REPO.understudyBelong);
  const tOff4 = await trajectory(205, false, belongfeast);
  ok(tOff3 === tOff4 && tOff3.length > 0, `RED det-gate: gate-off understudy-belong byte-identical to tribfloor belongfeast (s205) len=${tOff3.length}`);
  const tOn1 = await trajectory(204, true, REPO.understudyLead);
  const tOn2 = await trajectory(204, true, REPO.understudyLead);
  ok(tOn1 === tOn2 && tOn1.length > 0, 'gate-on deterministic (identical armed 60d byte-identical)');
  delete process.env.UNDERHUNT;

  // ---------- SMOKE ----------
  console.log('== SMOKE ==');
  {
    process.env.UNDERHUNT = '1';
    process.env.SEATDRIVE = '0';
    process.env.FEASTSCALE_R13 = '1';
    process.env.TRIBFLOOR = '1';
    const { Game } = await loadGame({ seed: 3708, mode: 'understudy-smoke', fullTelemetry: false });
    await setupGame(Game);
    let days = 0, err = null;
    try {
      await quietLog(async () => {
        const r = await runDays(Game, REPO.understudyLead, { days: 20, sampleEvery: 30 });
        days = r.days;
      });
    } catch (e) { err = String(e && e.message || e).slice(0, 200); }
    ok(err === null && days >= 20, `smoke: 20d pre-seat UNDERHUNT=1 run completes (days=${days}${err ? ' err=' + err : ''})`);
    delete process.env.UNDERHUNT;
  }

  console.log(`\n${pass} passed, ${fail} failed${fails.length ? ' — ' + fails.join(' | ') : ''}`);
  process.exit(fail ? 1 : 0);
})();
