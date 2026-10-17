#!/usr/bin/env node
// scripts/test-performretire-20261017.js — proof for the performretire layer
// (flesh-out loop, sim-performretire arm: PERFORM-THEN-DISENGAGE on the
// trick-execution window).
//
//   RED    — gate OFF: unit reads (trickPerfSummary channel, wave gate,
//            companion/overmatch helpers), no retire even with a performance
//            registered, det-gate byte-identical trajectories (gate-off
//            performretire-lead vs leadfeast, gate-off performretire-belong
//            vs belongfeast).
//   GREEN  — gate ON: real startCombat('hushwolf') fight, injected engine-
//            channel performance + round>=2 -> retire fires (the REAL
//            tbBarrierExit flee verb observed); guards: round 1 -> silent,
//            no performance -> silent, hpPct<0.35 -> silent (base eject),
//            engaged companion with overmatch -> silent, <=1 retire/fight.
//   SMOKE  — 20d pre-seat run with PERFORMRETIRE=1 completes.
//
// Sim-harness rules honored: Math.random seeded BEFORE eval (sim-harness does
// it); child processes for process isolation (never two harnesses in one
// process); no Game.save stub; no hardcoded absolute paths (ROOT derived from
// __dirname); loads via sim-harness.js; no concurrent jest.
'use strict';
const fs = require('fs');
const path = require('path');
// KILL-PROTOCOL INFO-SKIP: if the layer is deleted (PERFORMRETIRE_KILLED=1
// set by the coordinator after a killed arm), this proof exits green with an
// INFO-SKIP instead of FATAL-ing. Without the layer and without the flag,
// absence is RED (exit 1). (Precedent: test-perfsurvive-20261017.js.)
if (!fs.existsSync(path.join(__dirname, 'policies', 'performretire.js'))) {
  if (process.env.PERFORMRETIRE_KILLED === '1') {
    console.log('INFO-SKIP: performretire layer deleted per kill protocol (sim-performretire PRIMARY NO-GO) — proof not applicable.');
    process.exit(0);
  }
  console.error('RED: scripts/policies/performretire.js missing and PERFORMRETIRE_KILLED not set.');
  process.exit(1);
}
const { execSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const HARNESS = path.join(ROOT, 'scripts', 'sim-harness.js');
const PR = path.join(ROOT, 'scripts', 'policies', 'performretire.js');

let pass = 0, fail = 0;
const fails = [];
function ok(cond, name) {
  if (cond) { pass++; }
  else { fail++; fails.push(name); console.log('  FAIL: ' + name); }
}

function gameEval(seed, js, env) {
  const tmpFile = '/tmp/prt-synth-' + seed + '-' + process.pid + '.js';
  const envLines = Object.entries(env || {}).map(([k, v]) => `process.env.${k} = '${v}';`).join('\n');
  const code = `
${envLines}
const { loadGame, setupGame } = require('${HARNESS}');
(async () => {
  const { Game } = await loadGame({ seed: ${seed}, mode: 'synth', fullTelemetry: true });
  await setupGame(Game);
  const out = {};
  try { await (async () => { ${js} })(); } catch (e) { out.__err = String(e && e.stack || e).slice(0, 900); }
  console.log(JSON.stringify(out));
})().catch(e => { console.log(JSON.stringify({ __crash: String(e).slice(0, 300) })); });
`;
  fs.writeFileSync(tmpFile, code);
  try {
    const r = execSync(`node ${tmpFile}`, {
      cwd: path.join(ROOT, 'scripts'), maxBuffer: 32 * 1024 * 1024,
      env: { ...process.env, FEASTSCALE_R13: '1', SEATDRIVE: '0' },
    }).toString();
    return JSON.parse(r.split('\n').pop() || r);
  } finally { try { fs.unlinkSync(tmpFile); } catch (e) {} }
}

// Shared fixture: haven, day 10, scholar mid-grid. A real TB fight is opened
// with Game.startCombat('hushwolf'); the scholar's turn is forced via turnIdx.
// A "registered performance" is an engine-channel entry in f.trickLogByMid —
// the channel's WRITE path is funnel-corpus-proven; the layer's contract is
// the READ path (trickSummaryFor / trickLogByMid).
const FIGHT_FIXTURE = `
  const PR = require('${PR}');
  Game.state.scholar.day = 10;
  Game.state.scholar.mx = 4; Game.state.scholar.my = 4;
  Game.state.village.party = [];
  Game.startCombat('hushwolf');
  const F = () => Game.tbfight;
  const scholarTurn = () => { try { F().turnIdx = F().order.indexOf('p'); } catch (e) {} };
  const P = () => Game.tbFighter('p');
  const perf = (mid, kind) => { F().trickLogByMid = F().trickLogByMid || {}; (F().trickLogByMid[mid] || (F().trickLogByMid[mid] = [])).push(kind); };
`;

(async () => {
// ---------- RED ----------
console.log('== RED ==');
{
  // 1. unit: trickPerfSummary reads the landed tricktag channel
  const o = gameEval(9951, `
    ${FIGHT_FIXTURE}
    const r = {};
    r.empty0 = PR.trickPerfSummary(Game, F()).length === 0;
    perf('hushwolf', 'strike_lead');
    const s = PR.trickPerfSummary(Game, F());
    r.onePerf = s.length === 1 && s[0].mid === 'hushwolf' && s[0].summary === 'strike_lead';
    r.channelFn = typeof Game.trickSummaryFor === 'function'; // landed tricktag channel present
    const s2 = (function () { try { return Game.trickSummaryFor(F(), 'hushwolf'); } catch (e) { return null; } })();
    r.channelAgrees = s2 === 'strike_lead';
    r.redactorW3 = (function () { const d = Game.data.monsters.find(m => m.id === 'redactor'); return (d && d.wave) || 0; })();
    out.r = r;
  `);
  if (o.__err) console.log('  red-unit err: ' + o.__err);
  const r = o.r || {};
  ok(r.empty0 === true, 'RED: no performance registered -> empty summary');
  ok(r.onePerf === true, 'RED: injected trickLogByMid entry -> one perf summary (hushwolf:strike_lead)');
  ok(r.channelFn === true && r.channelAgrees === true, 'RED: landed trickSummaryFor(f, mid) present and agrees with the raw channel');
  ok(r.redactorW3 === 3, 'RED fixture: redactor is wave 3 (counter-less by canon)');
}
{
  // 2. RED: gate OFF — no retire even with performance + round>=2 (pure delegation)
  const o = gameEval(9952, `
    ${FIGHT_FIXTURE}
    scholarTurn(); F().round = 2;
    perf('hushwolf', 'strike_lead');
    const ctx = {};
    PR.performretireLead.fight(Game, ctx); // gate OFF
    const r = { noRetireFlag: ctx.prRetires == null && ctx._prFight == null };
    out.r = r;
  `);
  if (o.__err) console.log('  red-gateoff err: ' + o.__err);
  const r = o.r || {};
  ok(r.noRetireFlag === true, 'RED: gate OFF — no retire flag despite registered performance (delegation is structural; byte-identity pinned by the det-gate below)');
}
{
  // 3. det-gate: gate-off trajectories byte-identical to the base policies
  const { dayHash } = require('./det-gate');
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  const { leadfeast, belongfeast } = require('./policies/feastscale');
  const PRP = require('./policies/performretire');
  async function trajectory(seed, prOn, policyObj) {
    if (prOn) process.env.PERFORMRETIRE = '1'; else delete process.env.PERFORMRETIRE;
    const { Game } = await loadGame({ seed, mode: 'performretire-det', fullTelemetry: false });
    await setupGame(Game);
    const hs = [];
    const oDaily = policyObj.daily;
    const policy = Object.assign({}, policyObj, {
      daily(G, ctx) { if (oDaily) { try { oDaily(G, ctx); } catch (e) {} } try { hs.push(G.state.scholar.day + ':' + dayHash(G)); } catch (e) {} },
    });
    await quietLog(async () => { await runDays(Game, policy, { days: 60, sampleEvery: 30 }); });
    return hs.join('|');
  }
  const tOff1 = await trajectory(204, false, PRP.performretireLead);
  const tOff2 = await trajectory(204, false, leadfeast);
  ok(tOff1 === tOff2 && tOff1.length > 0, `RED det-gate: gate-off performretire-lead byte-identical to leadfeast (s204) len=${tOff1.length}`);
  const tOff3 = await trajectory(204, false, PRP.performretireBelong);
  const tOff4 = await trajectory(204, false, belongfeast);
  ok(tOff3 === tOff4 && tOff3.length > 0, `RED det-gate: gate-off performretire-belong byte-identical to belongfeast (s204) len=${tOff3.length}`);
  const tOn1 = await trajectory(204, true, PRP.performretireLead);
  const tOn2 = await trajectory(204, true, PRP.performretireLead);
  ok(tOn1 === tOn2 && tOn1.length > 0, 'gate-on deterministic (identical armed 60d byte-identical)');
  delete process.env.PERFORMRETIRE;
}

// ---------- GREEN ----------
console.log('== GREEN ==');
{
  // 4. retire fires: performance + round>=2, hp healthy -> the REAL flee verb observed
  const o = gameEval(9953, `
    ${FIGHT_FIXTURE}
    scholarTurn(); F().round = 2;
    perf('hushwolf', 'strike_lead');
    const p = P(); p.hp = p.maxHp; // healthy
    // put the scholar ON the edge so the retire is a barrier push
    p.mx = 0; p.my = 4;
    let barrierPushes = 0;
    const origExit = Game.tbBarrierExit.bind(Game);
    Game.tbBarrierExit = function (dx, dy) { barrierPushes++; return origExit(dx, dy); };
    const ctx = {};
    const mapBefore = [Game.map.px, Game.map.py];
    const roundBefore = F().round;
    PR.performretireLead.fight(Game, ctx); // gate ON
    const r = {
      retireFired: ctx.prRetires === 1,
      fightMarked: ctx._prFight === F(),
      midsLogged: (ctx.prRetireMids || []).join('|'),
      realVerb: barrierPushes === 1,
      // the disengage is the PUSH, not the fight end: the relentless hushwolf
      // chases through the barrier (engine-honest — "monsters follow
      // through"), so the observable is the crossing, not f.over.
      disengaged: (Game.map.px !== mapBefore[0] || Game.map.py !== mapBefore[1]) || F().over === true || Game.tbfight !== F(),
      // the turn was spent iff the engine advanced the round past the
      // scholar's turn (sync harness: the monster acts during the advance and
      // the turn cycles back to the scholar — so turnIdx is NOT the
      // observable; the round number is).
      turnSpent: F().round > roundBefore || F().over === true || Game.tbfight !== F(),
    };
    out.r = r;
  `, { PERFORMRETIRE: '1' });
  if (o.__err) console.log('  green-fire err: ' + o.__err);
  const r = o.r || {};
  ok(r.retireFired === true, 'GREEN: performance + round>=2 + healthy -> retire fires exactly once');
  ok(r.fightMarked === true, 'GREEN: the fight is marked (<=1 retire per fight)');
  ok(r.midsLogged === 'hushwolf:strike_lead', `GREEN: the banked performance is logged (mids=${r.midsLogged})`);
  ok(r.realVerb === true, 'GREEN: the REAL flee verb fired (Game.tbBarrierExit observed, 1 push)');
  ok(r.disengaged === true, 'GREEN: the scholar crossed the barrier (disengage = the push; the chaser follows honestly)');
  ok(r.turnSpent === true, 'GREEN: the turn was honestly spent (engine advanced past the scholar)');
}
{
  // 5. guard: round 1 -> silent (base's turn-1 outmatched walk-away keeps its turn)
  const o = gameEval(9954, `
    ${FIGHT_FIXTURE}
    scholarTurn(); F().round = 1;
    perf('hushwolf', 'strike_lead');
    const ctx = {};
    PR.performretireLead.fight(Game, ctx); // gate ON
    out.r = { silent: ctx.prRetires == null };
  `, { PERFORMRETIRE: '1' });
  if (o.__err) console.log('  green-r1 err: ' + o.__err);
  ok((o.r || {}).silent === true, 'GREEN guard: round 1 — no retire (base turn-1 assessment authoritative)');
}
{
  // 6. guard: no performance registered -> silent (nothing to bank)
  const o = gameEval(9955, `
    ${FIGHT_FIXTURE}
    scholarTurn(); F().round = 3;
    const ctx = {};
    PR.performretireLead.fight(Game, ctx); // gate ON
    out.r = { silent: ctx.prRetires == null };
  `, { PERFORMRETIRE: '1' });
  if (o.__err) console.log('  green-noperf err: ' + o.__err);
  ok((o.r || {}).silent === true, 'GREEN guard: no registered performance — no retire');
}
{
  // 7. guard: hpPct < 0.35 -> silent (base's 0.35 eject authoritative — never rescue)
  const o = gameEval(9956, `
    ${FIGHT_FIXTURE}
    scholarTurn(); F().round = 2;
    perf('hushwolf', 'strike_lead');
    const p = P(); p.hp = Math.floor(p.maxHp * 0.2);
    const ctx = {};
    PR.performretireLead.fight(Game, ctx); // gate ON
    out.r = { silent: ctx.prRetires == null, hpPct: (p.hp / p.maxHp).toFixed(2) };
  `, { PERFORMRETIRE: '1' });
  if (o.__err) console.log('  green-lowhp err: ' + o.__err);
  const r = o.r || {};
  ok(r.silent === true, `GREEN guard: hpPct=${r.hpPct} < 0.35 — no retire (base eject keeps its turn)`);
}
{
  // 8. guard: engaged companion with an overmatch cancels the retire
  const o = gameEval(9957, `
    ${FIGHT_FIXTURE}
    // a companion joins the real fight (proximity join, the perfsurvive precedent)
    const roster = (Game.state.village.roster || []).filter(id => id && id !== Game.villagerId);
    const comp = roster[0];
    Game.state.village.party = [comp];
    Game.state.village.positions = Game.state.village.positions || {};
    Game.state.village.positions[comp] = { mx: 4, my: 4 };
    Game.startCombat('hushwolf');
    const vf = Game.tbfight.fighters.find(x => x.villagerId === comp);
    scholarTurn(); Game.tbfight.round = 2;
    const tl = Game.tbfight.trickLogByMid || (Game.tbfight.trickLogByMid = {});
    (tl.hushwolf || (tl.hushwolf = [])).push('strike_lead');
    // overmatch: companion vastly out-HPs the pack
    if (vf) { vf.maxHp = 100000; vf.hp = 100000; }
    const ctx = {};
    PR.performretireBelong.fight(Game, ctx); // gate ON
    out.r = { compInFight: !!(vf && vf.alive), silent: ctx.prRetires == null };
  `, { PERFORMRETIRE: '1' });
  if (o.__err) console.log('  green-comp err: ' + o.__err);
  const r = o.r || {};
  ok(r.compInFight === true, 'GREEN fixture: companion engaged in the real TB fight');
  ok(r.silent === true, 'GREEN guard: engaged companion with overmatch — retire cancelled');
}
{
  // 9. guard: <=1 retire per fight (second turn on the same fight -> base)
  const o = gameEval(9958, `
    ${FIGHT_FIXTURE}
    scholarTurn(); F().round = 2;
    perf('hushwolf', 'strike_lead');
    const p = P(); p.hp = p.maxHp;
    const ctx = {};
    // fight continues after the first retire (non-chaser disengages): re-open the turn on the same fight
    PR.performretireLead.fight(Game, ctx); // gate ON — may or may not end the fight
    let secondSilent = null;
    if (!F().over) {
      F().turnIdx = F().order.indexOf('p');
      F().round = 3;
      PR.performretireLead.fight(Game, ctx);
      secondSilent = (ctx.prRetires === 1);
    } else {
      secondSilent = (ctx.prRetires === 1); // fight ended: only one retire total
    }
    out.r = { firstFired: ctx.prRetires === 1, secondSilent };
  `, { PERFORMRETIRE: '1' });
  if (o.__err) console.log('  green-once err: ' + o.__err);
  const r = o.r || {};
  ok(r.firstFired === true && r.secondSilent === true, 'GREEN guard: at most one retire per fight');
}
{
  // 10. walk-to-edge path: scholar NOT on the edge -> moves toward the edge, turn spent
  const o = gameEval(9959, `
    ${FIGHT_FIXTURE}
    scholarTurn(); F().round = 2;
    perf('hushwolf', 'strike_lead');
    const p = P(); p.hp = p.maxHp; p.mx = 4; p.my = 4; // mid-grid
    let barrierPushes = 0;
    const origExit = Game.tbBarrierExit.bind(Game);
    Game.tbBarrierExit = function (dx, dy) { barrierPushes++; return origExit(dx, dy); };
    const ctx = {};
    const roundBefore = F().round;
    PR.performretireLead.fight(Game, ctx); // gate ON
    out.r = { retireFired: ctx.prRetires === 1, noPushYet: barrierPushes === 0, turnSpent: F().round > roundBefore || F().over === true || Game.tbfight !== F() };
  `, { PERFORMRETIRE: '1' });
  if (o.__err) console.log('  green-walk err: ' + o.__err);
  const r = o.r || {};
  ok(r.retireFired === true && r.noPushYet === true && r.turnSpent === true, 'GREEN: mid-grid scholar — retire fires, walks toward the edge (push lands when the edge is reached), turn honestly spent');
}

// ---------- SMOKE ----------
console.log('== SMOKE ==');
{
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  const PRP = require('./policies/performretire');
  process.env.PERFORMRETIRE = '1';
  const { Game } = await loadGame({ seed: 9950, mode: 'performretire-smoke', fullTelemetry: false });
  await setupGame(Game);
  const r = await quietLog(async () => runDays(Game, PRP.performretireLead, { days: 20, sampleEvery: 10 }));
  delete process.env.PERFORMRETIRE;
  ok(r && r.days >= 20, `SMOKE: 20d pre-seat run with PERFORMRETIRE=1 completes (days=${r && r.days})`);
}

console.log(`\n== RESULT: ${pass} pass, ${fail} fail ==`);
if (fail) { console.log('failed: ' + fails.join('; ')); process.exit(1); }
})();
