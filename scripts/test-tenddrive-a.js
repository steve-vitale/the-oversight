#!/usr/bin/env node
// scripts/test-tenddrive-a.js — sim-tenddrive-a proof: the Binding-leg
// tend drive while national (win-plan.js winPlanBondsTick).
//
// THE BUILD (see evidence/2026-11-08/sim-tenddrive-a-prereg.md): in
// winPlanBondsTick ONLY, delete the `if (st.nationalLive ||
// st.pendingNational) return null` early return (the TENDING leg), and
// raise the tend cap from 50 to 55 while nationalLive (cap stays 50
// when not national). winPlanMusterTick keeps its own early return.
// Every other gate (≥2 primary links, plan actor at Haven, pantryDays
// ≥ 3, once/week/link, mourning skip, tendLink +8 / 1,500 kcal) is
// untouched.
//
// Cases (one fixture, one process — harness rule: never two harnesses
// in one node process):
//   national-tend    nationalLive on, dipping links at 42/45 -> drive
//                    fires, both tended +8. FAILS on unfixed code
//                    (early return -> null, no tend).
//   cap55            nationalLive on, links at 54/55/49 -> 54 and 49
//                    tended, 55 NOT tended. FAILS on unfixed code.
//   cap50            nationalLive off, links at 49/50 -> 49 tended, 50
//                    NOT tended. Control: PASSES on unfixed code too
//                    (pins the non-national cap stays 50).
//   muster-national  nationalLive on, a live hungry muster that WOULD
//                    stand down -> winPlanMusterTick still returns null
//                    and the muster stands; with nationalLive cleared
//                    the same fixture DOES stand down (liveness check).
//                    Pins the muster leg's nationalLive behavior as-is.
// Usage: node scripts/test-tenddrive-a.js [seed] [case]
//   No case (or 'all'): spawns one child process per case, aggregates,
//   exit 1 if any case fails. Prints one JSON line per case.
//   A single case prints one JSON line and exits 0 (pass) / 1 (fail).
'use strict';
const path = require('path');
const { execFileSync } = require('child_process');
const repo = path.join(__dirname, '..');
const seed = Number(process.argv[2] || '7');
const kase = process.argv[3] || 'all';

function out(o) { console.log(JSON.stringify(o)); }

async function setup() {
  const { loadGame, setupGame } = require(path.join(repo, 'scripts', 'sim-harness'));
  const { Game } = await loadGame({ seed, mode: 'tenddrive-a-' + kase, fullTelemetry: false });
  await setupGame(Game);
  const v = Game.state.village || {};
  const hx = (v.px == null ? 4 : v.px), hy = (v.py == null ? 4 : v.py);
  const stats = () => {
    try { return JSON.parse(JSON.stringify(Game.winPlanStats ? Game.winPlanStats() : {})); } catch (e) { return {}; }
  };
  const npcs = (v.roster || []).filter(id => id !== Game.villagerId);
  if (v.assignments) for (const k of Object.keys(v.assignments)) delete v.assignments[k];
  Game._outdoorCrew = [];
  v.health = v.health || {};
  v.trust = v.trust || {};
  for (const id of (v.roster || [])) v.health[id] = 100;
  const setNode = (id, x, y) => { try { Game.npcSetNode(id, x, y); } catch (e) {} };
  const day = (Game.state.scholar || {}).day || 0;
  const rangers = npcs.filter(id => {
    try { const pr = Game.npcRangeProfile(id); return pr === 'wanderer' || pr === 'explorer'; } catch (e) { return false; }
  });
  const fighter = rangers[0] || npcs[0];
  const companion = (rangers[1] || npcs[1]);
  const mkLink = (id, sub, trust) => ({
    id, status: 'active', primary: 'haven', subordinate: sub,
    trust, day: day - 40, history: [],
  });
  const stockPantry = (units) => {
    v.pantry = [{ itemId: 'grain-test', kcalEach: 1000, units, spoilDay: 99999 }];
  };
  const seatActor = () => {
    for (const id of npcs) setNode(id, hx, hy);
    const plan = Game.winPlanOf(fighter);
    plan.stage = 'standing';
    return fighter;
  };
  return { Game, v, hx, hy, stats, npcs, fighter, companion, day, setNode, mkLink, stockPantry, seatActor };
}

async function runCase() {
  if (kase === 'national-tend') {
    const { Game, v, hx, hy, stats, mkLink, stockPantry, seatActor } = await setup();
    const mship = Game.mshipState();
    mship.links = mship.links || [];
    const la = mkLink('tlink-a', 'village-a', 42);
    const lb = mkLink('tlink-b', 'village-b', 45);
    mship.links.push(la, lb);
    stockPantry(100);
    seatActor();
    Game.state.nationalLive = true;
    const before = stats();
    let res = null, err = null;
    try { res = Game.winPlanBondsTick(hx, hy); } catch (e) { err = e && e.message; }
    const after = stats();
    const pass = !err && !!res && (res.tended || []).length === 2
      && la.trust === 50 && lb.trust === 53
      && ((after.bondTends || 0) - (before.bondTends || 0)) === 2;
    out({ seed, case: kase, pass, err, tended: res && res.tended, trustA: la.trust, trustB: lb.trust,
      bondTendsDelta: (after.bondTends || 0) - (before.bondTends || 0),
      nationalLive: !!Game.state.nationalLive });
    process.exit(pass ? 0 : 1);
  }
  if (kase === 'cap55') {
    const { Game, v, hx, hy, stats, mkLink, stockPantry, seatActor } = await setup();
    const mship = Game.mshipState();
    mship.links = mship.links || [];
    const la = mkLink('tlink-a', 'village-a', 54);
    const lb = mkLink('tlink-b', 'village-b', 55);
    const lc = mkLink('tlink-c', 'village-c', 49);
    mship.links.push(la, lb, lc);
    stockPantry(100);
    seatActor();
    Game.state.nationalLive = true;
    const before = stats();
    let res = null, err = null;
    try { res = Game.winPlanBondsTick(hx, hy); } catch (e) { err = e && e.message; }
    const after = stats();
    const tended = (res && res.tended) || [];
    const pass = !err && !!res && tended.indexOf('tlink-a') !== -1 && tended.indexOf('tlink-c') !== -1
      && tended.indexOf('tlink-b') === -1
      && la.trust === 62 && lb.trust === 55 && lc.trust === 57
      && lb.tendedWeek == null
      && ((after.bondTends || 0) - (before.bondTends || 0)) === 2;
    out({ seed, case: kase, pass, err, tended, trustA: la.trust, trustB: lb.trust, trustC: lc.trust,
      tendedWeekB: lb.tendedWeek, bondTendsDelta: (after.bondTends || 0) - (before.bondTends || 0),
      nationalLive: !!Game.state.nationalLive });
    process.exit(pass ? 0 : 1);
  }
  if (kase === 'cap50') {
    const { Game, v, hx, hy, stats, mkLink, stockPantry, seatActor } = await setup();
    const mship = Game.mshipState();
    mship.links = mship.links || [];
    const la = mkLink('tlink-a', 'village-a', 49);
    const lb = mkLink('tlink-b', 'village-b', 50);
    mship.links.push(la, lb);
    stockPantry(100);
    seatActor();
    Game.state.nationalLive = false;
    const before = stats();
    let res = null, err = null;
    try { res = Game.winPlanBondsTick(hx, hy); } catch (e) { err = e && e.message; }
    const after = stats();
    const tended = (res && res.tended) || [];
    const pass = !err && !!res && tended.indexOf('tlink-a') !== -1 && tended.indexOf('tlink-b') === -1
      && la.trust === 57 && lb.trust === 50 && lb.tendedWeek == null
      && ((after.bondTends || 0) - (before.bondTends || 0)) === 1;
    out({ seed, case: kase, pass, err, tended, trustA: la.trust, trustB: lb.trust,
      tendedWeekB: lb.tendedWeek, bondTendsDelta: (after.bondTends || 0) - (before.bondTends || 0),
      nationalLive: !!Game.state.nationalLive });
    process.exit(pass ? 0 : 1);
  }
  if (kase === 'muster-national') {
    const { Game, v, hx, hy, stats, fighter, day, setNode, mkLink, seatActor } = await setup();
    const mship = Game.mshipState();
    mship.links = mship.links || [];
    const la = mkLink('slink-a', 'village-a', 45);
    la.history = [{ day, kind: 'muster-hunger', amount: -2 }];
    const lb = mkLink('slink-b', 'village-b', 48);
    mship.links.push(la, lb);
    for (const id of (v.roster || []).filter(x => x !== Game.villagerId)) setNode(id, hx, hy);
    const setMuster = () => {
      Game.state.titans = { omens: { herald: { stage: 1, day: day - 5 } },
        musters: { herald: { day: day - 5, allies: [{ villageId: 'village-a', vid: 'ally-1', name: 'Ally' }], haven: [fighter], lastUpkeep: day } },
        slain: {}, cast: null };
      v.titanCommitted = {}; v.titanCommitted[fighter] = 'herald';
    };
    setMuster();
    seatActor();
    Game.state.nationalLive = true;
    const before = stats();
    let res = null, err = null;
    try { res = Game.winPlanMusterTick(hx, hy); } catch (e) { err = e && e.message; }
    const mid = stats();
    const musterStands1 = (() => { try { return Game.state.titans.musters.herald != null; } catch (e) { return 'ERR'; } })();
    // Liveness: the same fixture with nationalLive cleared MUST stand down.
    Game.state.nationalLive = false;
    setMuster();
    let res2 = null;
    try { res2 = Game.winPlanMusterTick(hx, hy); } catch (e) {}
    const after = stats();
    const musterGone2 = (() => { try { return Game.state.titans.musters.herald == null; } catch (e) { return 'ERR'; } })();
    const pass = !err && res === null
      && ((mid.musterStanddowns || 0) - (before.musterStanddowns || 0)) === 0
      && musterStands1 === true
      && !!res2 && musterGone2 === true
      && ((after.musterStanddowns || 0) - (mid.musterStanddowns || 0)) === 1;
    out({ seed, case: kase, pass, err, resNullWhileNational: res === null,
      standdownsWhileNational: (mid.musterStanddowns || 0) - (before.musterStanddowns || 0),
      musterStands1, res2: !!res2, musterGone2,
      standdownsAfterClear: (after.musterStanddowns || 0) - (mid.musterStanddowns || 0) });
    process.exit(pass ? 0 : 1);
  }
  out({ seed, case: kase, pass: false, err: 'unknown case' });
  process.exit(2);
}

function runAll() {
  const cases = ['national-tend', 'cap55', 'cap50', 'muster-national'];
  const results = [];
  let failed = false;
  for (const c of cases) {
    try {
      const o = execFileSync('node', [path.join(repo, 'scripts', 'test-tenddrive-a.js'), String(seed), c],
        { cwd: repo, encoding: 'utf8', timeout: 120000 });
      const line = (o || '').trim().split('\n').filter(Boolean).pop();
      const r = JSON.parse(line);
      results.push(r);
      if (!r.pass) failed = true;
    } catch (e) {
      const o = (e && e.stdout) || '';
      const line = String(o).trim().split('\n').filter(Boolean).pop();
      let r = null;
      try { r = JSON.parse(line); } catch (_) {}
      results.push(r || { seed, case: c, pass: false, err: String((e && e.message) || e).slice(0, 200) });
      failed = true;
    }
  }
  for (const r of results) console.log(JSON.stringify(r));
  console.log(JSON.stringify({ seed, case: 'all', pass: !failed, cases: results.map(r => r.case + ':' + (r.pass ? 'PASS' : 'FAIL')) }));
  process.exit(failed ? 1 : 0);
}

if (kase === 'all') runAll();
else runCase().catch(e => { console.error('TENDDRIVE-A FAILED:', (e && e.stack) || e); process.exit(1); });
