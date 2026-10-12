#!/usr/bin/env node
// test-feast-competent-r7-20261012.js — PROOF for longsim food r7.
//
// The blank: the Arc-IV feast gate (feastSurgeUsed) missed on 12/12 r6
// runs. Instrumented chain breaks (12 seeds x 200d, competent policy):
//   (1) the policy never hosted feasts (0 calls on 648 affordable days);
//   (2) its only keepsake channel was trauma-routed, so the devotion lane
//       never armed (0 arms, though surgeResonance crossed 35 on 9/12);
//   (3) [found mid-round] winseek's lifetime (takes-gives)>3000 freeload
//       check blocks feasting forever (lifetime counters; seed 22: 86/141
//       armed days) — replaced with a 7-day contribution check;
//   (4) [found mid-round] the FUSION REACTOR CEILING honestly refuses armed
//       grants (seed 222: 6 refused) — the policy now feasts socially.
// The fix (scripts/policies/competent.js, gate COMPETENT_FEAST, default
// ON): channelDevotion (calm-day keepsake channel -> devotion lane),
// eveningFeast (dusk, at haven, have>=cost*1.5, gives7>=1500, cadence 7d
// armed / 14d unarmed, reactor-aware), feastFightRoad (face the feast
// draw while feasted, else patrol the 2-dawn window).
//
// Usage: node scripts/test-feast-competent-r7-20261012.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const H = ROOT + '/scripts/';
const { loadGame, setupGame, runDays } = require(H + 'sim-harness');

let pass = 0, fail = 0;
const check = (name, cond) => {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name); }
};

// ---------- PART A: unit tests on stub Games ----------

function stubGame(over) {
  const calls = [];
  const G = {
    calls,
    state: { scholar: { day: 5, trauma: 0, inventory: [], prog: {} }, village: { roster: ['a', 'b', 'c', 'd'] } },
    villagerId: 'me',
    dayPart: 2,
    map: { px: 0, py: 0 },
    sentimentTaught() { return !!G._taught; },
    channelReadyKeepsakes() { calls.push('readyKeepsakes'); return G._ready || []; },
    channelSentiment(idx) { calls.push('channelSentiment:' + idx); },
    playerAtHaven() { return G._atHaven !== false; },
    feastPlan() { calls.push('feastPlan'); return G._plan || null; },
    hostFeast() { calls.push('hostFeast'); return G._feastRep || { ok: true }; },
    feastedActive() { return !!G._feasted; },
    feastDrawPending() { return G._draw || null; },
    faceFeastDraw() { calls.push('faceFeastDraw'); return { ok: true }; },
    fusionReactorOnline() { return !!G._reactor; },
    travelTargets() { return G._targets || []; },
    tileAt() { return { type: 'meadow' }; },
    travelBlockage() { return false; },
    travelTo(x, y) { calls.push(`travelTo:${x},${y}`); G.map.px = x; G.map.py = y; },
    doAction() { calls.push('doAction'); },
  };
  return G;
}

function withGateOff(fn) {
  const prev = process.env.COMPETENT_FEAST;
  process.env.COMPETENT_FEAST = '0';
  try { fn(); } finally {
    if (prev === undefined) delete process.env.COMPETENT_FEAST;
    else process.env.COMPETENT_FEAST = prev;
  }
}

function runUnit() {
  console.log('-- PART A: unit tests --');
  const pol = require(H + 'policies/competent');

  // A1: gate-off restores legacy (no-ops, even with throwing Games)
  withGateOff(() => {
    const boom = { state: {} };
    let threw = false;
    try {
      pol.channelDevotion(boom, {}); pol.eveningFeast(boom, {}); pol.feastFightRoad(boom, {});
    } catch (e) { threw = true; }
    check('A1 gate-off: all three feast functions no-op', !threw);
  });
  check('A1b gate-on by default', pol.feastOn() === true);

  // A2: channelDevotion
  {
    const G = stubGame(); G._taught = true; G._ready = [3];
    G.state.scholar.trauma = 9;
    pol.channelDevotion(G, {});
    check('A2a trauma>=8: no devotion channel (soothe owns it)',
      !G.calls.some(c => c.startsWith('channelSentiment')));
    G.state.scholar.trauma = 0; G._taught = false;
    pol.channelDevotion(G, {});
    check('A2b not taught: no channel', !G.calls.some(c => c.startsWith('channelSentiment')));
    G._taught = true; G._ready = [];
    pol.channelDevotion(G, {});
    check('A2c no keepsake: no channel', !G.calls.some(c => c.startsWith('channelSentiment')));
    G._ready = [3];
    const ctx = {};
    pol.channelDevotion(G, ctx);
    check('A2d calm day: channels first ready keepsake',
      G.calls.includes('channelSentiment:3') && ctx.devotionChannels === 1);
    const n = G.calls.length;
    pol.channelDevotion(G, ctx);
    check('A2e once per day only', G.calls.length === n);
    G.state.scholar.day = 6;
    pol.channelDevotion(G, ctx);
    check('A2f next day channels again', G.calls.length > n && ctx.devotionChannels === 2);
  }

  // A3: recentGives window math
  {
    const G = stubGame();
    G.state.village.gives = { me: 1000 };
    const ctx = {};
    G.state.scholar.day = 1; pol.recentGives(G, ctx, 7);
    G.state.scholar.day = 4; G.state.village.gives.me = 2500; pol.recentGives(G, ctx, 7);
    G.state.scholar.day = 8; G.state.village.gives.me = 4000;
    const g7 = pol.recentGives(G, ctx, 7);
    check('A3a 7-day window gives delta (4000-1000=3000)', Math.abs(g7 - 3000) < 1e-9);
    G.state.scholar.day = 20; G.state.village.gives.me = 9000;
    const g7b = pol.recentGives(G, ctx, 7);
    check('A3b old snapshots fall out (9000-4000=5000)', Math.abs(g7b - 5000) < 1e-9);
  }

  // A4: eveningFeast guards
  const feastCtx = () => ({});
  // seed a 7-day donation history into ctx (a fresh ctx has no history,
  // so gives7=0 and the contribute-first gate correctly blocks)
  const seedGives = (G, ctx, day, total) => {
    G.state.scholar.day = 1; G.state.village.gives = { me: 0 };
    pol.recentGives(G, ctx, 7);
    G.state.scholar.day = day; G.state.village.gives = { me: total };
    return pol.recentGives(G, ctx, 7);
  };
  {
    const G = stubGame();
    G._atHaven = true; G._plan = { ok: true, cost: 2000, have: 20000 };
    G.dayPart = 1;
    pol.eveningFeast(G, feastCtx());
    check('A4a not dusk: no feast', !G.calls.includes('hostFeast'));
    G.dayPart = 2; G._atHaven = false;
    pol.eveningFeast(G, feastCtx());
    check('A4b not at haven: no feast', !G.calls.includes('hostFeast'));
    G._atHaven = true; G.state.scholar.feastDay = 5;
    pol.eveningFeast(G, feastCtx());
    check('A4c already feasted today: no feast', !G.calls.includes('hostFeast'));
    delete G.state.scholar.feastDay; G._plan = { ok: false, why: 'x' };
    pol.eveningFeast(G, feastCtx());
    check('A4d plan not ok: no feast', !G.calls.includes('hostFeast'));
    G._plan = { ok: true, cost: 2000, have: 2000 };
    pol.eveningFeast(G, feastCtx());
    check('A4e have < cost*1.5: no feast (honest buffer)', !G.calls.includes('hostFeast'));
    G._plan = { ok: true, cost: 2000, have: 20000 };
    G.state.village.gives = { me: 0 };
    pol.eveningFeast(G, feastCtx());
    check('A4f gives7 < 1500: no feast (contribute first)', !G.calls.includes('hostFeast'));
    G.state.village.gives = { me: 5000 };
    const ctx = feastCtx(); ctx._lastFeastDay = 1; // 4 days ago, unarmed cadence 14
    pol.eveningFeast(G, ctx);
    check('A4g unarmed cadence 14d: no feast 4 days later', !G.calls.includes('hostFeast'));
    const ctx2 = feastCtx(); ctx2._lastFeastDay = 1;
    G.state.scholar.prog.feastSurge = 1.5; // armed -> cadence 7, 4 days is too soon
    pol.eveningFeast(G, ctx2);
    check('A4h armed cadence 7d: no feast 4 days later', !G.calls.includes('hostFeast'));
    const ctx3 = feastCtx(); // armed, 8 days since last -> fires
    ctx3._lastFeastDay = -3;
    seedGives(G, ctx3, 5, 5000);
    pol.eveningFeast(G, ctx3);
    check('A4i armed + 8d + affordable: hosts', G.calls.includes('hostFeast') && ctx3.feasts === 1 && ctx3.armedFeasts === 1);
    // reactor ceiling: armed but refused by design -> social cadence
    const G2 = stubGame();
    G2._atHaven = true; G2._plan = { ok: true, cost: 2000, have: 20000 };
    G2.state.village.gives = { me: 5000 };
    G2.state.scholar.prog.feastSurge = 1.5; G2._reactor = true;
    const ctx4 = feastCtx(); ctx4._lastFeastDay = -3;
    seedGives(G2, ctx4, 5, 5000);
    pol.eveningFeast(G2, ctx4);
    check('A4j reactor online + armed: falls back to social cadence (no feast 8d after)',
      !G2.calls.includes('hostFeast'));
    const ctx5 = feastCtx(); ctx5._lastFeastDay = -10;
    seedGives(G2, ctx5, 5, 5000);
    pol.eveningFeast(G2, ctx5);
    check('A4k reactor online + 15d: social feast fires, not counted armed',
      G2.calls.includes('hostFeast') && (ctx5.armedFeasts || 0) === 0 && ctx5.feasts === 1);
  }

  // A5: feastFightRoad
  {
    const G = stubGame();
    pol.feastFightRoad(G, {});
    check('A5a no buff: no-op', !G.calls.some(c => c.startsWith('travelTo') || c === 'faceFeastDraw'));
    G._feasted = true; G.state.scholar.feastBuff = { used: true };
    pol.feastFightRoad(G, {});
    check('A5b buff used: no-op', !G.calls.some(c => c.startsWith('travelTo') || c === 'faceFeastDraw'));
    G.state.scholar.feastBuff = { used: false };
    G._draw = { monsterId: 'hushwolf' };
    pol.feastFightRoad(G, {});
    check('A5c draw pending: faces it', G.calls.includes('faceFeastDraw'));
    G._draw = null; G._targets = [{ x: 5, y: 5, d: 10 }];
    const n = G.calls.length;
    pol.feastFightRoad(G, {});
    check('A5d feasted, no draw: patrols', G.calls.length > n && G.calls.some(c => c.startsWith('travelTo')));
  }
}

// ---------- PART B: identical-seed before/after ----------

function pristinePolicy() {
  const src = execSync('git -C ' + ROOT + ' show HEAD:scripts/policies/competent.js', { encoding: 'utf8' });
  const fixed = src.replace("require('./idle')", "require('" + H + "policies/idle')");
  const tmp = '/tmp/pristine-competent-r7.js';
  fs.writeFileSync(tmp, fixed);
  delete require.cache[tmp];
  return require(tmp).competent;
}

function instrument(Game, st) {
  const ogGrant = Game.grantFeastBuff.bind(Game);
  Game.grantFeastBuff = function (feast) {
    const r = ogGrant(feast);
    if (r && r.granted) st.grants++;
    return r;
  };
  const ogNote = Game.noteFeastedCombatUse.bind(Game);
  Game.noteFeastedCombatUse = function () {
    let mark = false;
    try {
      const b = ((Game.state || {}).scholar || {}).feastBuff;
      mark = !!(b && !b.used && Game.inCombat && Game.inCombat());
    } catch (e) {}
    const r = ogNote();
    if (mark) st.uses++;
    return r;
  };
  const ogHost = Game.hostFeast.bind(Game);
  Game.hostFeast = function () {
    const r = ogHost();
    if (r && r.ok) st.feasts++;
    return r;
  };
}

async function runOne(policy, seed, label, days) {
  const { Game } = await loadGame({ seed, mode: 'competent' });
  await setupGame(Game);
  const st = { grants: 0, uses: 0, feasts: 0 };
  instrument(Game, st);
  const p = Object.assign({}, policy);
  await runDays(Game, p, { days });
  const used = !!((((Game.state || {}).scholar || {}).prog || {}).feastSurgeUsed);
  console.log(`${label} seed=${seed}: feasts=${st.feasts} grants=${st.grants} uses=${st.uses} feastSurgeUsed=${used}`);
  return Object.assign(st, { used });
}

async function runIntegration() {
  console.log('-- PART B: identical-seed before/after --');
  const fixed = require(H + 'policies/competent').competent;
  const pristine = pristinePolicy();
  const SEEDS = [11, 66]; // known chain-firing seeds
  const DAYS = 80;
  for (const seed of SEEDS) {
    console.log(`-- seed ${seed} --`);
    const before = await runOne(pristine, seed, 'BEFORE(pristine)', DAYS);
    const after = await runOne(fixed, seed, 'AFTER (fixed)   ', DAYS);
    check(`B seed${seed}: pristine grants 0 (chain never starts)`, before.grants === 0 && before.uses === 0);
    check(`B seed${seed}: fixed hosts feasts`, after.feasts >= 1);
    check(`B seed${seed}: fixed grants >= 1 (devotion armed -> buff)`, after.grants >= 1);
    check(`B seed${seed}: fixed uses >= 1 (fight while feasted -> deed)`, after.uses >= 1);
    check(`B seed${seed}: fixed feastSurgeUsed`, after.used === true);
  }
}

(async () => {
  runUnit();
  await runIntegration();
  console.log(`\n${pass}/${pass + fail} checks green`);
  process.exit(fail ? 1 : 0);
})();
