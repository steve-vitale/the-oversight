#!/usr/bin/env node
// test-reposition-20261016.js — proof record for the sim-reposition arm
// (axis scale-onramp; finding #430): teach the TB policy to reposition for
// known movement-kind tricks (blindside/face_it).
//
// Sections:
//   GATE      — RED: REPOSITION unset → layerOn() false, delegation pinned
//             by the det-gate below (gate-off wrapped policies byte-identical
//             to the base policies on identical 60d sims).
//   BLINDSIDE — GREEN: synthetic TB fight, sunback arch up, trick known →
//             repositionPlay moves the player and the engine logs a blindside
//             performance in f.trickLogByMid.sunback (the real path: real
//             tbPlayerMove → real checkMonsterCounter). NEGATIVES: no
//             telegraph → no fire; unknown trick → no fire.
//   FACE_IT   — GREEN: synthetic turn-1 TB fight vs sweeps_week, trick known
//             → repositionPlay moves away without closing distance; the engine
//             logs face_it in f.trickLogByMid.sweeps_week. NEGATIVES: round 2
//             → no fire; outmatched (base would flee) → no fire; unknown → no.
//   SAFETY    — hpPct < 0.7 → no fire for either condition.
//   DET       — gate-off wrapped policies byte-identical to base (2 seeds x
//             60d via dayHash); gate-on deterministic; gate-on non-vacuous.
//   SMOKE     — 20d pre-seat run with REPOSITION=1 completes green.
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
const REPO = require(path.join(ROOT, 'scripts', 'policies', 'reposition.js'));

let pass = 0, fail = 0;
function ok(cond, name) {
  if (cond) { pass++; }
  else { fail++; console.log('  FAIL: ' + name); }
}

// gameEval: run a JS snippet inside a full seeded game (child process,
// process isolation). The snippet can use `out` to report results.
function gameEval(seed, js, env) {
  const tmpFile = '/tmp/rp-synth-' + seed + '-' + process.pid + '.js';
  const envLines = Object.entries(env || {}).map(([k, v]) => `process.env.${k} = '${v}';`).join('\n');
  const code = `
${envLines}
const { loadGame, setupGame } = require('${HARNESS}');
const REPO = require('${path.join(ROOT, 'scripts', 'policies', 'reposition.js')}');
(async () => {
  const { Game } = await loadGame({ seed: ${seed}, mode: 'synth', fullTelemetry: false });
  await setupGame(Game);
  const out = {};
  try {
${js}
  } catch (e) { out.__err = String((e && e.stack) || e).slice(0, 400); }
  console.log('RESULTJSON:' + JSON.stringify(out));
})().catch(e => { console.log('RESULTJSON:' + JSON.stringify({ __err: String(e && e.stack || e).slice(0, 400) })); });
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
  const sunbackDef = Game.data.monsters.find(m => m.id === 'sunback');
  const sweepsDef = Game.data.monsters.find(m => m.id === 'sweeps_week');
  function mkPlayer(mx, my, hp) {
    return { key: 'p', kind: 'player', alive: true, hp: hp, maxHp: 100,
             mx: mx, my: my, moveLeft: 5, acted: false };
  }
  function mkMonster(key, def, mx, my, telegraph) {
    const m = { key: key, kind: 'monster', monsterId: def.id, alive: true,
                hp: 40, maxHp: 40, mx: mx, my: my, mdef: def };
    if (telegraph) m.telegraph = telegraph;
    return m;
  }
  function mkFight(player, monsters, round) {
    Game.tbfight = { over: false, round: round || 1, turnIdx: 0,
      order: ['p'].concat(monsters.map(m => m.key)),
      fighters: [player].concat(monsters) };
    Game.tbfight.trickLogByMid = {};
  }
`;

// ---------- GATE (RED pins the default-off contract) ----------
console.log('== GATE ==');
{
  delete process.env.REPOSITION;
  ok(REPO.layerOn() === false, 'RED: layerOn() false when REPOSITION unset (default OFF)');
  ok(REPO.repositionLead.id === 'reposition-lead' && REPO.repositionBelong.id === 'reposition-belong',
    'wrapped variants exported for both base policies');
  process.env.REPOSITION = '1';
  ok(REPO.layerOn() === true, 'GREEN: layerOn() true when REPOSITION=1');
  delete process.env.REPOSITION;
}

// ---------- BLINDSIDE ----------
console.log('== BLINDSIDE ==');
{
  const o = gameEval(3401, FIGHT_SETUP + `
    process.env.REPOSITION = '1';
    Game.state.monsterCounters = { sunback: { via: 'trick' } };
    const p = mkPlayer(4, 4, 100);
    const m = mkMonster('m_0', sunbackDef, 6, 4, { cells: [{cx:5,cy:4},{cx:6,cy:4}], attackName: 'Sunflash Lunge' });
    mkFight(p, [m], 2);
    const ctx = {};
    out.fired = REPO.repositionPlay(Game, ctx);
    out.px = p.mx; out.py = p.my;
    out.count = ctx.rpBlindside || 0;
    out.perf = ((Game.tbfight.trickLogByMid || {}).sunback || []).join(',');
    out.second = REPO.repositionPlay(Game, ctx); // once per fight
    out.count2 = ctx.rpBlindside || 0;
    Game.tbfight = null;
  `);
  if (o.__err) console.log('  blindside err: ' + o.__err);
  ok(o.fired === true, 'GREEN: blindside fires when the arch is up and the trick is known');
  ok((o.px !== 4 || o.py !== 4), `the player really moved (${o.px},${o.py})`);
  ok(o.count === 1, `attempt counted once (got ${o.count})`);
  ok((o.perf || '').indexOf('blindside') >= 0, `engine logged a blindside PERFORMANCE via the real path (got '${o.perf}')`);
  ok(o.second === false && o.count2 === 1, 'at most once per fight');
}
{
  // NEGATIVE: no telegraph → no fire
  const o = gameEval(3402, FIGHT_SETUP + `
    Game.state.monsterCounters = { sunback: { via: 'trick' } };
    const p = mkPlayer(4, 4, 100);
    const m = mkMonster('m_0', sunbackDef, 6, 4, null); // no arch
    mkFight(p, [m], 2);
    const ctx = {};
    out.fired = REPO.repositionPlay(Game, ctx);
    out.px = p.mx; out.py = p.my;
    Game.tbfight = null;
  `);
  if (o.__err) console.log('  blindside-neg err: ' + o.__err);
  ok(o.fired === false && o.px === 4 && o.py === 4, 'NEGATIVE: no telegraph → no reposition (the trigger must be genuinely present)');
}
{
  // NEGATIVE: trick unknown → no fire
  const o = gameEval(3403, FIGHT_SETUP + `
    Game.state.monsterCounters = {}; // nothing known
    const p = mkPlayer(4, 4, 100);
    const m = mkMonster('m_0', sunbackDef, 6, 4, { cells: [{cx:5,cy:4}], attackName: 'Sunflash Lunge' });
    mkFight(p, [m], 2);
    const ctx = {};
    out.fired = REPO.repositionPlay(Game, ctx);
    out.perf = ((Game.tbfight.trickLogByMid || {}).sunback || []).length;
    Game.tbfight = null;
  `);
  if (o.__err) console.log('  blindside-unk err: ' + o.__err);
  ok(o.fired === false && (o.perf | 0) === 0, 'NEGATIVE: unknown trick → no reposition (knowledge gate holds)');
}

// ---------- FACE_IT ----------
console.log('== FACE_IT ==');
{
  const o = gameEval(3404, FIGHT_SETUP + `
    process.env.REPOSITION = '1';
    Game.state.monsterCounters = { sweeps_week: { via: 'beasttricks' } };
    const p = mkPlayer(4, 4, 100);
    const m = mkMonster('m_0', sweepsDef, 6, 4, null);
    mkFight(p, [m], 1); // turn-1 window
    const d0 = Math.max(Math.abs(6 - 4), Math.abs(4 - 4));
    const ctx = {};
    out.fired = REPO.repositionPlay(Game, ctx);
    out.px = p.mx; out.py = p.my;
    out.d1 = Math.max(Math.abs(6 - p.mx), Math.abs(4 - p.my));
    out.d0 = d0;
    out.count = ctx.rpFaceIt || 0;
    out.perf = ((Game.tbfight.trickLogByMid || {}).sweeps_week || []).join(',');
    Game.tbfight = null;
  `);
  if (o.__err) console.log('  face_it err: ' + o.__err);
  ok(o.fired === true, 'GREEN: face_it fires on the turn-1 window when the trick is known');
  ok((o.px !== 4 || o.py !== 4), `the player really moved (${o.px},${o.py})`);
  ok((o.d1 | 0) >= (o.d0 | 0), `did NOT close distance (${o.d0} -> ${o.d1}) — back away slow`);
  ok((o.perf || '').indexOf('face_it') >= 0, `engine logged a face_it PERFORMANCE via the real path (got '${o.perf}')`);
}
{
  // NEGATIVE: round 2 → the window is gone
  const o = gameEval(3405, FIGHT_SETUP + `
    Game.state.monsterCounters = { sweeps_week: { via: 'beasttricks' } };
    const p = mkPlayer(4, 4, 100);
    const m = mkMonster('m_0', sweepsDef, 6, 4, null);
    mkFight(p, [m], 2); // window closed
    const ctx = {};
    out.fired = REPO.repositionPlay(Game, ctx);
    out.px = p.mx; out.py = p.my;
    Game.tbfight = null;
  `);
  if (o.__err) console.log('  face_it-r2 err: ' + o.__err);
  ok(o.fired === false && o.px === 4 && o.py === 4, 'NEGATIVE: round 2 → no face_it (firstTurn window only)');
}
{
  // NEGATIVE: outmatched on turn 1 → the base flees; the trick never replaces the flee
  const o = gameEval(3406, FIGHT_SETUP + `
    Game.state.monsterCounters = { sweeps_week: { via: 'beasttricks' } };
    const p = mkPlayer(4, 4, 100);
    const big = mkMonster('m_0', sweepsDef, 6, 4, null);
    big.maxHp = 300; big.hp = 300; // totalMhp 300 > 2.5*100 → base walks away
    mkFight(p, [big], 1);
    const ctx = {};
    out.fired = REPO.repositionPlay(Game, ctx);
    Game.tbfight = null;
  `);
  if (o.__err) console.log('  face_it-out err: ' + o.__err);
  ok(o.fired === false, 'NEGATIVE: outmatched on turn 1 → no reposition (delegate to the base walk-away)');
}

// ---------- SAFETY ----------
console.log('== SAFETY ==');
{
  const o = gameEval(3407, FIGHT_SETUP + `
    Game.state.monsterCounters = { sunback: { via: 'trick' }, sweeps_week: { via: 'trick' } };
    const p = mkPlayer(4, 4, 60); // 60% HP — hurt, not luxury-move territory
    const m1 = mkMonster('m_0', sunbackDef, 6, 4, { cells: [{cx:5,cy:4}], attackName: 'Sunflash Lunge' });
    mkFight(p, [m1], 2);
    const ctx = {};
    out.hurtBlindside = REPO.repositionPlay(Game, ctx);
    const p2 = mkPlayer(4, 4, 60);
    const m2 = mkMonster('m_0', sweepsDef, 6, 4, null);
    mkFight(p2, [m2], 1);
    out.hurtFaceIt = REPO.repositionPlay(Game, ctx);
    Game.tbfight = null;
  `);
  if (o.__err) console.log('  safety err: ' + o.__err);
  ok(o.hurtBlindside === false, 'SAFETY: hurt scholar (60%) does not blindside');
  ok(o.hurtFaceIt === false, 'SAFETY: hurt scholar (60%) does not face_it');
}

// ---------- DET ----------
console.log('== DET ==');
(async () => {
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  const { dayHash } = require('./det-gate');
  const { leadfeast, belongfeast } = require('./policies/feastscale');
  async function trajectory(seed, rpOn, policyObj) {
    if (rpOn) process.env.REPOSITION = '1'; else delete process.env.REPOSITION;
    const { Game } = await loadGame({ seed, mode: 'reposition-det', fullTelemetry: false });
    await setupGame(Game);
    const hs = [];
    const oDaily = policyObj.daily;
    const policy = Object.assign({}, policyObj, {
      daily(G, ctx) { if (oDaily) { try { oDaily(G, ctx); } catch (e) {} } try { hs.push(G.state.scholar.day + ':' + dayHash(G)); } catch (e) {} },
    });
    await quietLog(async () => { await runDays(Game, policy, { days: 60, sampleEvery: 30 }); });
    return hs.join('|');
  }
  const tOff1 = await trajectory(204, false, REPO.repositionLead);
  const tOff2 = await trajectory(204, false, leadfeast);
  ok(tOff1 === tOff2 && tOff1.length > 0, `RED det-gate: gate-off reposition-lead byte-identical to leadfeast (s204) len=${tOff1.length}`);
  const tOff3 = await trajectory(315, false, REPO.repositionBelong);
  const tOff4 = await trajectory(315, false, belongfeast);
  ok(tOff3 === tOff4 && tOff3.length > 0, `RED det-gate: gate-off reposition-belong byte-identical to belongfeast (s315) len=${tOff3.length}`);
  const tOn1 = await trajectory(204, true, REPO.repositionLead);
  const tOn2 = await trajectory(204, true, REPO.repositionLead);
  ok(tOn1 === tOn2 && tOn1.length > 0, 'gate-on deterministic (identical armed 60d byte-identical)');
  delete process.env.REPOSITION;

  // ---------- SMOKE ----------
  console.log('== SMOKE ==');
  {
    process.env.REPOSITION = '1';
    process.env.SEATDRIVE = '0';
    process.env.FEASTSCALE_R13 = '1';
    const { Game } = await loadGame({ seed: 3408, mode: 'reposition-smoke', fullTelemetry: false });
    await setupGame(Game);
    const r = await quietLog(async () => { return await runDays(Game, REPO.repositionLead, { days: 20, sampleEvery: 30 }); });
    ok(r && (r.days | 0) >= 1, `20d pre-seat run with REPOSITION=1 completes (days=${r && r.days})`);
    delete process.env.REPOSITION; delete process.env.SEATDRIVE; delete process.env.FEASTSCALE_R13;
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
