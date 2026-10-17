#!/usr/bin/env node
// test-trickreach-20261017.js — proof record for the sim-trickreach arm
// (axis scale-onramp; finding #432a): teach the TB policy the two remaining
// bot-unreachable trick kinds — fresh_weapon (understudy: mid-fight weapon
// switch) and keep_distance (murkcap/living_wire: end the turn at range).
//
// Sections:
//   GATE         — RED: TRICKREACH unset → layerOn() false (det-gate pins
//                gate-off byte-identical delegation).
//   FRESH_WEAPON — GREEN: real startCombat('understudy'), usSeen populated
//                (the switch trigger genuinely present), scholar carries an
//                unseen melee weapon, trick known, hp full → trickreachPlay
//                switches via the real Game.equip and delegates (returns
//                false); the real Game.tbPlayerStrike then logs fresh_weapon
//                in f.trickLogByMid.understudy (the real engine path: real
//                equip → real strike → real checkMonsterCounter).
//                NEGATIVES: usSeen empty (opener) → no switch; unknown trick
//                → no switch; hp<0.7 → no switch; no fresh weapon → no switch.
//   KEEP_DISTANCE— GREEN: real startCombat('murkcap'), trick known, scholar
//                adjacent, hp full → trickreachPlay moves to >=3 chebyshev
//                and ends the turn; the real tbAfterPlayerAction round_end
//                check logs keep_distance in f.trickLogByMid.murkcap.
//                NEGATIVES: already >=3 away → no fire; unknown → no fire;
//                hp<0.7 → no fire; turn-1 outmatched → no fire (delegate).
//   DET          — gate-off wrapped policies byte-identical to base (2 seeds
//                x 60d via dayHash); gate-on deterministic.
//   SMOKE        — 20d pre-seat run with TRICKREACH=1 completes green.
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
const REPO = require(path.join(ROOT, 'scripts', 'policies', 'trickreach.js'));

let pass = 0, fail = 0;
const fails = [];
function ok(cond, name) {
  if (cond) { pass++; }
  else { fail++; fails.push(name); console.log('  FAIL: ' + name); }
}

// gameEval: run a JS snippet inside a full seeded game (child process,
// process isolation). The snippet can use `out` to report results.
function gameEval(seed, js, env) {
  const tmpFile = '/tmp/tr-synth-' + seed + '-' + process.pid + '.js';
  const envLines = Object.entries(env || {}).map(([k, v]) => `process.env.${k} = '${v}';`).join('\n');
  const code = `
${envLines}
const { loadGame, setupGame } = require('${HARNESS}');
const REPO = require('${path.join(ROOT, 'scripts', 'policies', 'trickreach.js')}');
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

const FIGHT_SETUP = `
  function cheatDist(Game, p, m, dx, dy) {
    p.mx = Math.min(7, Math.max(1, m.mx + dx));
    p.my = Math.min(7, Math.max(1, m.my + dy));
  }
`;

console.log('== GATE (RED) ==');
ok(REPO.layerOn() === false, 'RED: TRICKREACH unset → layerOn() false (gate off by default)');

// ---------- FRESH_WEAPON ----------
console.log('== FRESH_WEAPON (GREEN + negatives) ==');
{
  const o = gameEval(3601, `
    ${FIGHT_SETUP}
    // real fight vs the understudy
    Game.startCombat('understudy');
    const mf = Game.tbfight.fighters.find(x => x.kind === 'monster');
    const p = Game.tbFighter('p');
    p.hp = 100; p.maxHp = 100; p.moveLeft = 6;
    cheatDist(Game, p, mf, 1, 0); // adjacent: the strike is genuinely attemptable
    // THE SWITCH TRIGGER, GENUINELY PRESENT: the understudy has SEEN the
    // current weapon (simulating the first strike of the fight).
    const curName = Game.equippedWeapon().name;
    mf.usSeen = {}; mf.usSeen[curName] = { count: 1, dmg: 3 };
    // an unseen melee weapon in the pack
    const wdef = Game.data.items.find(i => i.class === 'weapon' && i.weapon && i.weapon.type === 'melee' && i.name !== curName);
    out.wdefName = wdef && wdef.name;
    Game.state.scholar.inventory.push({ itemId: wdef.id });
    // knowledge gate: fully discovered
    (Game.state.monsterCounters = Game.state.monsterCounters || {}).understudy = true;
    const ctx = {};
    const ret = REPO.trickreachPlay(Game, ctx);
    out.ret = ret; // delegate: the base spends the turn striking
    out.switchedTo = Game.equippedWeapon().name;
    out.attempts = ctx.trFreshWeapon || 0;
    // the real engine path: the base's strike with the fresh weapon
    if (ret === false) Game.tbPlayerStrike(mf.key);
    const tl = ((Game.tbfight || {}).trickLogByMid || {}).understudy || [];
    out.perfs = tl.slice();
    out.err = out.__err || null;
  `, { TRICKREACH: '1' });
  if (o.__err) { ok(false, 'fresh_weapon GREEN: no engine error — ' + o.__err); }
  else {
    ok(o.wdefName && o.wdefName !== 'none', 'fresh_weapon: unseen melee weapon found in data (' + o.wdefName + ')');
    ok(o.ret === false, 'fresh_weapon: layer delegates after the switch (returns false, base strikes)');
    ok(o.switchedTo === o.wdefName, `fresh_weapon: equipped switched to the unseen weapon (${o.switchedTo})`);
    ok(o.attempts === 1, 'fresh_weapon: exactly one switch attempt counted');
    ok(Array.isArray(o.perfs) && o.perfs.indexOf('fresh_weapon') >= 0,
      `fresh_weapon: real strike logged fresh_weapon in trickLogByMid (${JSON.stringify(o.perfs)})`);
  }
}
function freshNeg(seed, tweak, wantName) {
  return gameEval(seed, `
    ${FIGHT_SETUP}
    Game.startCombat('understudy');
    const mf = Game.tbfight.fighters.find(x => x.kind === 'monster');
    const p = Game.tbFighter('p');
    p.hp = 100; p.maxHp = 100; p.moveLeft = 6;
    cheatDist(Game, p, mf, 1, 0);
    const curName = Game.equippedWeapon().name;
    out.curName = curName;
    mf.usSeen = {}; mf.usSeen[curName] = { count: 1, dmg: 3 };
    const wdef = Game.data.items.find(i => i.class === 'weapon' && i.weapon && i.weapon.type === 'melee' && i.name !== curName);
    Game.state.scholar.inventory.push({ itemId: wdef.id });
    (Game.state.monsterCounters = Game.state.monsterCounters || {}).understudy = true;
    ${tweak}
    const before = Game.equippedWeapon().name;
    const ret = REPO.trickreachPlay(Game, {});
    out.ret = ret;
    out.after = Game.equippedWeapon().name;
    out.unchanged = (before === out.after);
  `, { TRICKREACH: '1' });
}
{
  const a = freshNeg(3602, `mf.usSeen = {}; // OPENER: nothing seen yet — the switch is not the trick`, 'opener');
  ok(!a.__err && a.unchanged === true, 'fresh_weapon NEG (opener, usSeen empty): no switch');
  const b = freshNeg(3603, `if (Game.state.monsterCounters) delete Game.state.monsterCounters.understudy; // UNKNOWN: not ours to attempt`, 'unknown');
  ok(!b.__err && b.unchanged === true, 'fresh_weapon NEG (unknown trick): no switch');
  const c = freshNeg(3604, `p.hp = 50; // HURT: luxury move refused`, 'hurt');
  ok(!c.__err && c.unchanged === true, 'fresh_weapon NEG (hp<0.7): no switch');
  const d = freshNeg(3605, `Game.state.scholar.inventory = []; // NO FRESH WEAPON in the pack`, 'nopick');
  ok(!d.__err && d.unchanged === true, 'fresh_weapon NEG (no fresh weapon): no switch');
}

// ---------- KEEP_DISTANCE ----------
// ENGINE GEOMETRY (verified 2026-10-17 vs tbEndCheck): the break-it disengage
// rule ends the fight BEFORE the round_end counter check when every living
// monster is beyond its own striking distance and none chases. The trick is
// only observable in the ring tiles <= d <= max(2, reach) (chaser or active
// telegraph removes the upper bound). Rings: turtle [2..2], catfish [2..3],
// radio [3..inf), tick [2..3]; murkcap/living_wire/bright_idea EMPTY
// (tiles=3 > reach 2) — telegraph path only.
console.log('== KEEP_DISTANCE (GREEN + negatives) ==');
// GREEN (a): ring species — speedbump_turtle tiles=2, reach=1, follows=false
// → observable ring is exactly d=2. Scholar adjacent (d=1) → the layer
// moves into the ring; the real round_end check logs the performance.
{
  const o = gameEval(3606, `
    Game.startCombat('speedbump_turtle');
    const mf = Game.tbfight.fighters.find(x => x.kind === 'monster');
    const p = Game.tbFighter('p');
    p.hp = 100; p.maxHp = 100; p.moveLeft = 6;
    mf.mx = 4; mf.my = 4; p.mx = 5; p.my = 4; // d0 = 1
    out.d0 = Math.max(Math.abs(mf.mx - p.mx), Math.abs(mf.my - p.my));
    out.reach = Game.tbMonsterReach(mf);
    (Game.state.monsterCounters = Game.state.monsterCounters || {}).speedbump_turtle = true;
    const ctx = {};
    const ret = REPO.trickreachPlay(Game, ctx);
    out.ret = ret;
    const d1 = Math.max(Math.abs(mf.mx - p.mx), Math.abs(mf.my - p.my));
    out.d1 = d1;
    out.attempts = ctx.trKeepDistance || 0;
    out.onInterior = p.mx >= 1 && p.mx <= 7 && p.my >= 1 && p.my <= 7;
    const tl = ((Game.tbfight || {}).trickLogByMid || {}).speedbump_turtle || [];
    out.perfs = tl.slice();
  `, { TRICKREACH: '1' });
  if (o.__err) { ok(false, 'keep_distance GREEN (turtle ring): no engine error — ' + o.__err); }
  else {
    ok(o.d0 === 1, `keep_distance: started adjacent (d0=${o.d0})`);
    ok(o.ret === true, 'keep_distance: turn consumed (returns true)');
    ok(o.d1 === 2, `keep_distance: moved into the observable ring (d1=${o.d1} == 2 == tiles, reach=${o.reach})`);
    ok(o.onInterior === true, 'keep_distance: stayed on interior tiles (never the flee-by-barrier)');
    ok(o.attempts === 1, 'keep_distance: exactly one attempt counted');
    ok(Array.isArray(o.perfs) && o.perfs.indexOf('keep_distance') >= 0,
      `keep_distance: real round_end logged keep_distance in trickLogByMid (${JSON.stringify(o.perfs)})`);
  }
}
// GREEN (b): empty-ring species — murkcap tiles=3 > reach 2. With the
// Sporefall telegraph UP the disengage is blocked (a committed attack holds
// the fight), so d>=3 is observable. The documented geometry path.
{
  const o = gameEval(3611, `
    Game.startCombat('murkcap');
    const mf = Game.tbfight.fighters.find(x => x.kind === 'monster');
    const p = Game.tbFighter('p');
    p.hp = 100; p.maxHp = 100; p.moveLeft = 6;
    mf.mx = 4; mf.my = 4; p.mx = 5; p.my = 4; // d0 = 1
    mf.telegraph = { cells: [{ cx: 5, cy: 4 }] }; // the sporefall is breathing
    (Game.state.monsterCounters = Game.state.monsterCounters || {}).murkcap = true;
    const f0 = Game.tbfight; // capture: the fight disengages after the monster's turn
    const ctx = {};
    const ret = REPO.trickreachPlay(Game, ctx);
    out.ret = ret;
    const d1 = Math.max(Math.abs(mf.mx - p.mx), Math.abs(mf.my - p.my));
    out.d1 = d1;
    const tl = ((f0 || {}).trickLogByMid || {}).murkcap || [];
    out.perfs = tl.slice();
  `, { TRICKREACH: '1' });
  if (o.__err) { ok(false, 'keep_distance GREEN (murkcap telegraph path): no engine error — ' + o.__err); }
  else {
    ok(o.ret === true && o.d1 >= 3,
      `keep_distance: telegraph up → backed out of the cloud (ret=${o.ret}, d1=${o.d1} >= 3)`);
    ok(Array.isArray(o.perfs) && o.perfs.indexOf('keep_distance') >= 0,
      `keep_distance: telegraph-path round_end logged keep_distance (${JSON.stringify(o.perfs)})`);
  }
}
function kdNeg(seed, mid, setupTweak, tweak) {
  return gameEval(seed, `
    Game.startCombat('${mid}');
    const mf = Game.tbfight.fighters.find(x => x.kind === 'monster');
    const p = Game.tbFighter('p');
    p.hp = 100; p.maxHp = 100; p.moveLeft = 6;
    mf.mx = 4; mf.my = 4; p.mx = 5; p.my = 4; // d0 = 1
    ${setupTweak || ''}
    (Game.state.monsterCounters = Game.state.monsterCounters || {}).${mid} = true;
    ${tweak || ''}
    const bx = p.mx, by = p.my;
    const ret = REPO.trickreachPlay(Game, {});
    out.ret = ret;
    out.moved = (p.mx !== bx || p.my !== by);
  `, { TRICKREACH: '1' });
}
{
  // murkcap, NO telegraph: ring empty (tiles=3 > reach 2) → no observable window → no fire
  const a = kdNeg(3607, 'murkcap', '', '');
  ok(!a.__err && a.ret === false && a.moved === false, 'keep_distance NEG (murkcap, no telegraph, empty ring): no fire, no move');
  // voice_mimic_radio (follows=true → ring [3,inf)): already at d=3 → nothing honest to do
  const b = kdNeg(3608, 'voice_mimic_radio', `p.mx = 1; p.my = 4; // d0 = 3, inside the window`, '');
  ok(!b.__err && b.ret === false && b.moved === false, 'keep_distance NEG (radio, already in window): no fire');
  const c = kdNeg(3609, 'speedbump_turtle', '', `if (Game.state.monsterCounters) delete Game.state.monsterCounters.speedbump_turtle; // UNKNOWN`);
  ok(!c.__err && c.ret === false && c.moved === false, 'keep_distance NEG (unknown trick): no fire');
  const d = kdNeg(3610, 'speedbump_turtle', '', `p.hp = 60; // HURT`);
  ok(!d.__err && d.ret === false && d.moved === false, 'keep_distance NEG (hp<0.7): no fire');
  const e = kdNeg(3612, 'speedbump_turtle', `mf.maxHp = 300; mf.hp = 300; // OUTMATCHED on turn 1`, '');
  ok(!e.__err && e.ret === false && e.moved === false, 'keep_distance NEG (turn-1 outmatched): delegate, no trick');
  // HONESTY: d0 > hi is disengage territory (turtle ring [2..2], d0=3) — the
  // trigger is NOT genuinely present; stepping closer to manufacture a
  // performance would be metric-farming. No fire, no move.
  const f = kdNeg(3613, 'speedbump_turtle', `p.mx = 1; p.my = 4; // d0 = 3 > hi = 2`, '');
  ok(!f.__err && f.ret === false && f.moved === false, 'keep_distance NEG (d0 > hi, disengage territory): no fire, no move');
}

// ---------- DET ----------
console.log('== DET ==');
(async () => {
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  const { dayHash } = require('./det-gate');
  const { leadfeast, belongfeast } = require('./policies/feastscale');
  async function trajectory(seed, trOn, policyObj) {
    if (trOn) process.env.TRICKREACH = '1'; else delete process.env.TRICKREACH;
    const { Game } = await loadGame({ seed, mode: 'trickreach-det', fullTelemetry: false });
    await setupGame(Game);
    const hs = [];
    const oDaily = policyObj.daily;
    const policy = Object.assign({}, policyObj, {
      daily(G, ctx) { if (oDaily) { try { oDaily(G, ctx); } catch (e) {} } try { hs.push(G.state.scholar.day + ':' + dayHash(G)); } catch (e) {} },
    });
    await quietLog(async () => { await runDays(Game, policy, { days: 60, sampleEvery: 30 }); });
    return hs.join('|');
  }
  const tOff1 = await trajectory(204, false, REPO.trickreachLead);
  const tOff2 = await trajectory(204, false, leadfeast);
  ok(tOff1 === tOff2 && tOff1.length > 0, `RED det-gate: gate-off trickreach-lead byte-identical to leadfeast (s204) len=${tOff1.length}`);
  const tOff3 = await trajectory(205, false, REPO.trickreachBelong);
  const tOff4 = await trajectory(205, false, belongfeast);
  ok(tOff3 === tOff4 && tOff3.length > 0, `RED det-gate: gate-off trickreach-belong byte-identical to belongfeast (s205) len=${tOff3.length}`);
  const tOn1 = await trajectory(204, true, REPO.trickreachLead);
  const tOn2 = await trajectory(204, true, REPO.trickreachLead);
  ok(tOn1 === tOn2 && tOn1.length > 0, 'gate-on deterministic (identical armed 60d byte-identical)');
  delete process.env.TRICKREACH;
  // LIVE-PROBE (informational, not binding): 60d armed run — does the layer
  // fire at all on live data? The pilot sweep (16x180d) is the real
  // non-vacuity measure; this is early signal only.
  {
    process.env.TRICKREACH = '1';
    process.env.SEATDRIVE = '0';
    process.env.FEASTSCALE_R13 = '1';
    const { Game } = await loadGame({ seed: 204, mode: 'trickreach-probe', fullTelemetry: false });
    await setupGame(Game);
    const probeCtx = {};
    // count attempts via the ctx counters trickreachPlay maintains (the
    // policy ctx is shared across fight/daily — same shape as the sweep)
    const baseDaily = REPO.trickreachLead.daily;
    const wrapped = Object.assign({}, REPO.trickreachLead, {
      daily(G, ctx) {
        if (baseDaily) { try { baseDaily(G, ctx); } catch (e) {} }
        try {
          probeCtx.fw = Math.max(probeCtx.fw || 0, ctx.trFreshWeapon || 0);
          probeCtx.kd = Math.max(probeCtx.kd || 0, ctx.trKeepDistance || 0);
        } catch (e) {}
      },
    });
    await quietLog(async () => { await runDays(Game, wrapped, { days: 60, sampleEvery: 30 }); });
    console.log(`  LIVE-PROBE: 60d armed s204 — fresh_weapon attempts=${probeCtx.fw || 0}, keep_distance attempts=${probeCtx.kd || 0} (informational)`);
    delete process.env.TRICKREACH;
  }

  // ---------- SMOKE ----------
  console.log('== SMOKE ==');
  {
    process.env.TRICKREACH = '1';
    process.env.SEATDRIVE = '0';
    process.env.FEASTSCALE_R13 = '1';
    const { Game } = await loadGame({ seed: 3608, mode: 'trickreach-smoke', fullTelemetry: false });
    await setupGame(Game);
    let days = 0, err = null;
    try {
      await quietLog(async () => {
        const r = await runDays(Game, REPO.trickreachLead, { days: 20, sampleEvery: 30 });
        days = r.days;
      });
    } catch (e) { err = String(e && e.message || e).slice(0, 200); }
    ok(err === null && days >= 20, `smoke: 20d pre-seat TRICKREACH=1 run completes (days=${days}${err ? ' err=' + err : ''})`);
    delete process.env.TRICKREACH;
  }

  console.log(`\n${pass} passed, ${fail} failed${fails.length ? ' — ' + fails.join(' | ') : ''}`);
  process.exit(fail ? 1 : 0);
})();
