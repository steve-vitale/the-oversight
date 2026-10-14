#!/usr/bin/env node
// scripts/test-siegedef3-20261014.js — proof test for the siegedef3 Haven
// siege-defense doctrine (scripts/policies/siegedef3.js, SIEGEDEF3=1).
//
// The blank (sim-findings #96, w5death audit re-verified on current tip):
// 84.8% of post-unlock scholar deaths happen AT HAVEN, 48.5% killed by
// wave-5 monsters — and the draw diagnostic (scripts/w5death-drawdiag-
// 20261014.js) measured the channel: 16/33 post-unlock deaths (48.5%) had
// the feast's scavenger DRAW marker live at death. Every fresh armed feast
// casts a wave-appropriate scavenger to Haven's edge and the substrate's
// feastFightRoad FACES it unconditionally. Post-wave-5-unlock that is a
// wave-5 monster at Haven ~every 7 days, a coin-flip the succession chain
// eventually loses. The engine offers the choice (faceFeastDraw vs
// driveOffFeastDraw); the substrate never takes the second option.
//
// PART A — REAL RED→GREEN: script a post-unlock game (standing 200 via
//   feastLog, wave-4 faced via deedState) with a live feast buff and a
//   wave-5 (cancellation) draw pending, scholar weak (low HP, no armor,
//   species never slain).
//   RED (SIEGEDEF3 unset): Game.faceFeastDraw() starts the fight — the
//     scholar faces a wave-5 draw they cannot win. No triage exists.
//   GREEN (SIEGEDEF3=1, siegedef3.setup installed): the same call drives
//     the draw off — no fight, draw cleared, ctx.sdDriven=1, the watch
//     beat said.
// PART B — triage matrix on shouldFaceDraw (pure, deterministic): 7 cases
//   pinning the sally-only-in-strength rule.
// PART C — DET-GATE: SIEGEDEF3 unset, siegedef3 vs leadfeast on identical
//   seeds — trajectory-identical (the wrap is never installed when off).
// PART D — SMOKE: named-export unwrap (the r20b lesson), policy.daily is a
//   function, harness drives the policy, and with SIEGEDEF3=1 setup()
//   installs the triage wrap.
//
// Usage: node scripts/test-siegedef3-20261014.js
'use strict';
// LAYER-DELETED GRACE (kill protocol 2026-10-14): the siegedef3 policy was
// deleted after the pilot NO-GO (see evidence/2026-10-14/sim-siegedef3.md).
// Without the layer this proof cannot run — exit cleanly, not with a
// MODULE_NOT_FOUND crash. To re-apply: restore scripts/policies/siegedef3.js
// from git history, then re-run (proof was 22/22 GREEN before deletion).
let siegedef3mod = null;
try { siegedef3mod = require('./policies/siegedef3'); }
catch (e) {
  console.log('LAYER DELETED per kill protocol — proof not runnable without scripts/policies/siegedef3.js.');
  console.log('(Was 22/22 GREEN before deletion; see evidence/2026-10-14/sim-siegedef3.md.)');
  process.exit(0);
}
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { leadfeast } = require('./policies/feastscale');

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; }
  else { fail++; console.log(`FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

// Script a post-unlock game state: standing 200 (10 quality feasts in the
// feastLog -> plenty 10x20) + a wave-4 faced (deedState.wavesFaced) so
// unlockedWave() reads 5 honestly through the engine's own gate.
function scriptPostUnlock(Game) {
  Game.state.feastLog = [];
  for (let i = 0; i < 10; i++) Game.state.feastLog.push({ day: 50 + i, quality: 2, kcal: 3000 });
  const ds = Game.deedState();
  ds.wavesFaced = ds.wavesFaced || {};
  ds.wavesFaced['the_audit'] = 4; // wave-4 monster id, faced blow-by-blow
  return Game.unlockedWave();
}
function scriptWeakScholar(Game) {
  const s = Game.state.scholar;
  s.health = 30; // battered
  s.equipped = {}; // no armor
  Game.state.villageSlain = {}; // species never slain
}

async function newGame(seed) {
  const { Game } = await loadGame({ seed, mode: 'siegedef3-proof' });
  await setupGame(Game);
  return Game;
}

async function partA() {
  console.log('--- PART A: REAL RED -> GREEN (weak scholar, wave-5 draw) ---');
  // RED: no layer — the draw is cast and left pending to be faced.
  {
    delete process.env.SIEGEDEF3;
    const Game = await newGame(911);
    const uw = scriptPostUnlock(Game);
    check('RED setup: unlockedWave()==5', uw === 5, 'uw=' + uw);
    scriptWeakScholar(Game);
    // armed devotion, no draw yet — drawFeastScavenger is the creation choke point.
    // Pin the cast to a wave-5 (cancellation) for a deterministic scenario
    // (the triage is under test, not the cast).
    const origCast = Game.castMonster;
    Game.castMonster = () => ({ id: 'cancellation', veteran: false });
    const s = Game.state.scholar;
    s.feastBuff = { untilDay: (s.day || 60) + 2, armed: true };
    const r = Game.drawFeastScavenger();
    Game.castMonster = origCast;
    check('RED: unlayered draw is cast', !!(r && r.drawn), JSON.stringify(r));
    check('RED: draw is the pinned wave-5', r && r.monsterId === 'cancellation', 'mid=' + (r && r.monsterId));
    check('RED: the draw WILL be faced (the blank — no triage)', !!(Game.pendingEncounter && Game.feastDrawPending && Game.feastDrawPending()), 'pending=' + Game.pendingEncounter);
  }
  // GREEN: layer armed — the weak scholar's wave-5 draw is driven off at creation.
  {
    process.env.SIEGEDEF3 = '1';
    const mod = siegedef3mod;
    const { siegedef3 } = mod; // NAMED export unwrap (r20b)
    check('GREEN setup: named export unwraps', !!(siegedef3 && siegedef3.id === 'siegedef3'), 'id=' + (siegedef3 && siegedef3.id));
    const Game = await newGame(911);
    const uw = scriptPostUnlock(Game);
    check('GREEN setup: unlockedWave()==5', uw === 5, 'uw=' + uw);
    scriptWeakScholar(Game);
    // Healthy but unarmored, species never slain -> the 'unknown-w5' branch
    // (the doctrine's primary path): strong enough to stand, not to sally.
    Game.state.scholar.health = Game.maxHealth();
    const origCast = Game.castMonster;
    Game.castMonster = () => ({ id: 'cancellation', veteran: false });
    const s = Game.state.scholar;
    s.feastBuff = { untilDay: (s.day || 60) + 2, armed: true };
    const ctx = {};
    siegedef3.setup(Game, ctx);
    const r = Game.drawFeastScavenger();
    Game.castMonster = origCast;
    check('GREEN: draw was cast', !!(r && r.drawn), JSON.stringify(r));
    check('GREEN: triaged draw driven off — no pending encounter', !Game.pendingEncounter, 'pending=' + Game.pendingEncounter);
    check('GREEN: draw marker cleared', !(Game.feastDrawPending && Game.feastDrawPending()), '');
    check('GREEN: telemetry sdDriven=1', ctx.sdDriven === 1, 'sdDriven=' + ctx.sdDriven);
    check('GREEN: telemetry sdTriaged=1', ctx.sdTriaged === 1, 'sdTriaged=' + ctx.sdTriaged);
    check('GREEN: drive reason is unknown-w5', ctx.sdFirstDrive && ctx.sdFirstDrive.reason === 'unknown-w5', JSON.stringify(ctx.sdFirstDrive));
    delete process.env.SIEGEDEF3;
  }
}

async function partB() {
  console.log('--- PART B: triage matrix (shouldFaceDraw) ---');
  const { shouldFaceDraw } = siegedef3mod;
  const Game = await newGame(912);
  const s = Game.state.scholar;
  const setDraw = (mid) => {
    const day = s.day || 60; s.day = day;
    s.feastBuff = { untilDay: day + 2, armed: true };
    s.feastDraw = { monsterId: mid, veteran: false, day };
    Game.pendingEncounter = true; Game.pendingMonsterId = mid;
  };
  const clearDraw = () => { delete s.feastDraw; Game.pendingEncounter = false; Game.pendingMonsterId = null; };
  const healthy = () => { s.health = Game.maxHealth(); };
  const noArmor = () => { s.equipped = {}; };
  const plateArmor = () => { s.equipped = { torso: { itemId: 'worldroot_plate' } }; };

  // 1. no draw -> face (nothing to triage)
  clearDraw();
  { const t = shouldFaceDraw(Game); check('B1 no-draw faces', t.face === true && t.reason === 'no-draw', JSON.stringify(t)); }

  // pre-siege setup: standing low -> unlockedWave < 5
  Game.state.feastLog = [];
  check('B setup: pre-siege uw<5', Game.unlockedWave() < 5, 'uw=' + Game.unlockedWave());
  setDraw('cancellation'); healthy(); noArmor();
  { const t = shouldFaceDraw(Game); check('B2 pre-siege draw always faced', t.face === true && t.reason === 'pre-siege', JSON.stringify(t)); }
  clearDraw();

  // post-siege from here
  const uw = scriptPostUnlock(Game);
  check('B setup: post-siege uw==5', uw === 5, 'uw=' + uw);
  Game.state.villageSlain = {};

  // 3. battered scholar -> driven off even vs wave-4
  setDraw('the_audit'); s.health = Math.round(Game.maxHealth() * 0.3); noArmor();
  { const t = shouldFaceDraw(Game); check('B3 battered scholar driven off', t.face === false && t.reason === 'battered', JSON.stringify(t)); }

  // 4. healthy vs wave-4 -> faced (deed prey)
  setDraw('the_audit'); healthy(); noArmor();
  { const t = shouldFaceDraw(Game); check('B4 wave-4 faced when healthy', t.face === true && t.reason === 'deed-prey', JSON.stringify(t)); }

  // 5. healthy vs unknown wave-5, no armor -> driven off
  setDraw('cancellation'); healthy(); noArmor();
  { const t = shouldFaceDraw(Game); check('B5 unknown w5 driven off when unarmored', t.face === false && t.reason === 'unknown-w5', JSON.stringify(t)); }

  // 6. healthy vs slain-before wave-5 -> faced (known quantity)
  Game.state.villageSlain = { cancellation: 2 };
  setDraw('cancellation'); healthy(); noArmor();
  { const t = shouldFaceDraw(Game); check('B6 slain-before w5 faced', t.face === true && t.reason === 'known-quantity', JSON.stringify(t)); }
  Game.state.villageSlain = {};

  // 7. healthy vs unknown wave-5 in plate (P=60) -> faced (armored)
  setDraw('cancellation'); healthy(); plateArmor();
  { const t = shouldFaceDraw(Game); check('B7 armored (P>=60) faces unknown w5', t.face === true && t.reason === 'armored', JSON.stringify(t) + ' armorP=' + (t.detail && t.detail.armorP)); }
  clearDraw();
}

async function partC() {
  console.log('--- PART C: DET-GATE (gate-off byte-identical to leadfeast) ---');
  delete process.env.SIEGEDEF3;
  process.env.FEASTSCALE_R13 = '1';
  const { siegedef3 } = siegedef3mod;
  const seeds = [11, 22];
  let identical = 0, total = 0;
  for (const seed of seeds) {
    const snap = async (policy) => {
      const { Game } = await loadGame({ seed, mode: 'siegedef3-detgate' });
      await setupGame(Game);
      const p = Object.assign({}, policy);
      let res = null;
      await quietLog(async () => { res = await runDays(Game, p, { days: 60, sampleEvery: 10 }); });
      const deaths = ((res.samples || {}).deaths || []).map(d => (d.player ? 'p:' : 'v:') + d.cause + '@' + d.day).join('|');
      let standing = 0, nat = 0, table = false, arc = 1;
      try { standing = Game.villageStandingTotal() | 0; } catch (e) {}
      try { nat = (res.samples.scale || []).filter(x => x[1] === 'national' || x[1] === 'global').length; } catch (e) {}
      try { table = !!(Game.progState && Game.progState().tableWaiting); } catch (e) {}
      try { arc = (Game.progState && Game.progState().arc) || 1; } catch (e) {}
      return [res.days, res.endReason, deaths, standing, nat, table, arc].join('~');
    };
    const a = await snap(leadfeast);
    const b = await snap(siegedef3);
    total++;
    if (a === b) { identical++; console.log(`  s${seed}: identical`); }
    else { console.log(`  s${seed}: DIVERGED\n    A ${a}\n    B ${b}`); }
  }
  check('det-gate: gate-off trajectories identical', identical === total, `${identical}/${total}`);
}

async function partD() {
  console.log('--- PART D: SMOKE (instrument honesty) ---');
  const fails = [];
  const scheck = (name, cond, detail) => {
    console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
    if (!cond) fails.push(name);
  };
  // (a) named-export unwrap — the r20b lesson: Object.assign spread of the
  // module yields {siegedef3:{...}} with daily undefined.
  const mod = siegedef3mod;
  const { siegedef3 } = mod;
  scheck('named export unwraps to the policy', !!(siegedef3 && siegedef3.id === 'siegedef3'), 'id=' + (siegedef3 && siegedef3.id));
  scheck('unwrapped policy.daily is a function', typeof siegedef3.daily === 'function', 'typeof=' + typeof siegedef3.daily);
  const spread = Object.assign({}, mod);
  scheck('Object.assign spread does NOT unwrap (r20b guard)', typeof spread.daily !== 'function', 'spread.daily typeof=' + typeof spread.daily);
  if (fails.length) { console.log('\nSMOKE STOP: unwrap failure — the suite would run policy-less.'); process.exit(1); }
  // (b) harness drives the policy (short live run, gate off).
  delete process.env.SIEGEDEF3;
  process.env.FEASTSCALE_R13 = '1';
  const { Game } = await loadGame({ seed: 11, mode: 'siegedef3-smoke' });
  await setupGame(Game);
  const policy = Object.assign({}, siegedef3);
  let dailyCalls = 0;
  const origDaily = siegedef3.daily.bind(siegedef3);
  policy.daily = (G, ctx) => { dailyCalls++; return origDaily(G, ctx); };
  let result = null;
  await quietLog(async () => { result = await runDays(Game, policy, { days: 15, sampleEvery: 10 }); });
  const meanCalls = result.pacing ? (result.pacing.meanPolicyCallsPerDay || 0) : 0;
  scheck('harness invokes policy.daily (meanCalls/day>0)', meanCalls > 0, 'mean=' + meanCalls);
  scheck('policy.daily actually ran', dailyCalls > 0, 'dailyCalls=' + dailyCalls);
  // (c) with SIEGEDEF3=1, setup() installs the triage wrap.
  process.env.SIEGEDEF3 = '1';
  const { Game: G2 } = await loadGame({ seed: 12, mode: 'siegedef3-smoke2' });
  await setupGame(G2);
  const before = G2.drawFeastScavenger;
  const ctx2 = {};
  siegedef3.setup(G2, ctx2);
  scheck('SIEGEDEF3=1: setup installs the drawFeastScavenger triage wrap', G2.drawFeastScavenger !== before, '');
  delete process.env.SIEGEDEF3;
  const { Game: G3 } = await loadGame({ seed: 13, mode: 'siegedef3-smoke3' });
  await setupGame(G3);
  const before3 = G3.drawFeastScavenger;
  siegedef3.setup(G3, {});
  scheck('gate-off: setup does NOT install the wrap', G3.drawFeastScavenger === before3, '');
  if (fails.length) { console.log('\nSMOKE STOP: instrument-honesty gate failed.'); process.exit(1); }
  console.log('SMOKE GREEN: unwrap honest, harness drives the policy, wrap installs only when armed.');
}

async function main() {
  if (process.env.SMOKE === '1') { await partD(); return; }
  await partA();
  await partB();
  await partC();
  await partD();
  console.log(`\nproof: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}

if (require.main === module) { main().catch(e => { console.error('FATAL', e); process.exit(1); }); }
