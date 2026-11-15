#!/usr/bin/env node
// scripts/test-holdbuild-b.js — sim-holdbuild-b proof: upkeep tending for
// seasoned links + post-dissolution poverty-trap relief (win-plan.js
// winPlanBondsTick ONLY).
//
// THE BUILD (see evidence/2026-11-14/sim-holdbuild-b-prereg.md):
//   (a) UPKEEP (HOLDBUILD_UPKEEP, default ON): the nationalLive early
//       return is gone (tenddrive construction) and the tend cap is 55
//       while national, 50 otherwise. Every other gate unchanged.
//   (b) RECLIMB (HOLDBUILD_RECLIMB, default ON): a link below the
//       seasoned trust bar (trust < 40) in a village that is NOT national
//       may be tended by the available representative when no plan-holder
//       is home, and the pantry-days gate for the run is 1, not 3.
//       Grain stays real (1,500 kcal via tendLink).
// Flags are read at call time: a case sets process.env.HOLDBUILD_*
// before its tick call to prove the OFF leg; ON cases run with the env
// unset (default-ON, including the browser where process is undefined).
//
// Cases (one fixture, one process — harness rule: never two harnesses
// in one node process). Fixture pattern from scripts/test-tenddrive-a.js
// (mshipState links, stocked pantry, plan-holder at Haven):
//   upkeep-on       nationalLive on, links 42/45, holder present ->
//                   both tended +8, upkeepTends +2.
//   upkeep-off      same fixture, HOLDBUILD_UPKEEP=0 -> null, no tend.
//   cap55           nationalLive on, links 54/55/49 -> 54,49 tended.
//   cap50           nationalLive off, links 49/50 -> 49 tended, 50 not.
//   reclimb-rep-pd1 not national, links 35/38/45, NO holder, rep
//                   available, pantryDays 1 -> all three tended,
//                   reclimbTends +2 (the sub-40s), actor is the rep.
//   reclimb-rep-pd3 same, pantryDays 4 -> tends via the fallback actor
//                   even with a full pantry (actor fallback, not the
//                   lowered gate, is what fires).
//   reclimb-off     same as pd1, HOLDBUILD_RECLIMB=0 -> null, no tend.
//   reclimb-pd0     same as pd1, pantryDays 0 -> null, no tend (the
//                   relief never tends a village with <1 day of food).
// Static leg (in the 'all' runner, read-only): the tracked modification
// under src/js/ is exactly src/js/win-plan.js.
// CROSS-CHECK (not run here): scripts/test-tenddrive-a.js must pass 4/4
// with the build on (it fails 2/4 by design on the reverted tree).
// Usage: node scripts/test-holdbuild-b.js [seed] [case]
//   No case (or 'all'): spawns one child process per case, aggregates,
//   exit 1 if any case fails. Prints one JSON line per case.
//   A single case prints one JSON line and exits 0 (pass) / 1 (fail).
'use strict';
const path = require('path');
const { execFileSync, execSync } = require('child_process');
const repo = path.join(__dirname, '..');
const seed = Number(process.argv[2] || '7');
const kase = process.argv[3] || 'all';

function out(o) { console.log(JSON.stringify(o)); }

async function setup() {
  const { loadGame, setupGame } = require(path.join(repo, 'scripts', 'sim-harness'));
  const { Game } = await loadGame({ seed, mode: 'holdbuild-b-' + kase, fullTelemetry: false });
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
  const mkLink = (id, sub, trust) => ({
    id, status: 'active', primary: 'haven', subordinate: sub,
    trust, day: day - 40, history: [],
  });
  // stockPantry(units): 1,000-kcal grain units. pantryDaysEstimate falls
  // back (empty burnHistory) to floor(pantry / roster*2000); roster ~12
  // so 100 units -> ~4 days, 30 -> 1 day, 10 -> 0 days.
  const stockPantry = (units) => {
    v.pantry = [{ itemId: 'grain-test', kcalEach: 1000, units, spoilDay: 99999 }];
  };
  const seatActor = () => {
    for (const id of npcs) setNode(id, hx, hy);
    const plan = Game.winPlanOf(fighter);
    plan.stage = 'standing';
    return fighter;
  };
  // No plan-holder anywhere: clear any plan the setup formed, leave the
  // villagers at Haven (the representative is chosen by availability,
  // not by plan-holding).
  const clearPlans = () => {
    try { v.winPlan = {}; } catch (e) {}
    for (const id of npcs) setNode(id, hx, hy);
  };
  const repId = () => {
    try { const r = Game._availableRepresentative ? Game._availableRepresentative() : null; return r ? r.id : null; } catch (e) { return null; }
  };
  return { Game, v, hx, hy, stats, npcs, fighter, day, setNode, mkLink, stockPantry, seatActor, clearPlans, repId };
}

async function runCase() {
  if (kase === 'upkeep-on' || kase === 'upkeep-off') {
    const { Game, v, hx, hy, stats, mkLink, stockPantry, seatActor } = await setup();
    const mship = Game.mshipState();
    mship.links = mship.links || [];
    const la = mkLink('tlink-a', 'village-a', 42);
    const lb = mkLink('tlink-b', 'village-b', 45);
    mship.links.push(la, lb);
    stockPantry(100);
    seatActor();
    Game.state.nationalLive = true;
    if (kase === 'upkeep-off') process.env.HOLDBUILD_UPKEEP = '0';
    const before = stats();
    let res = null, err = null;
    try { res = Game.winPlanBondsTick(hx, hy); } catch (e) { err = e && e.message; }
    const after = stats();
    let pass;
    if (kase === 'upkeep-on') {
      pass = !err && !!res && (res.tended || []).length === 2
        && la.trust === 50 && lb.trust === 53
        && ((after.bondTends || 0) - (before.bondTends || 0)) === 2
        && ((after.upkeepTends || 0) - (before.upkeepTends || 0)) === 2
        && ((after.reclimbTends || 0) - (before.reclimbTends || 0)) === 0;
    } else {
      pass = !err && res === null && la.trust === 42 && lb.trust === 45
        && ((after.bondTends || 0) - (before.bondTends || 0)) === 0
        && ((after.upkeepTends || 0) - (before.upkeepTends || 0)) === 0;
    }
    out({ seed, case: kase, pass, err, tended: res && res.tended, trustA: la.trust, trustB: lb.trust,
      bondTendsDelta: (after.bondTends || 0) - (before.bondTends || 0),
      upkeepTendsDelta: (after.upkeepTends || 0) - (before.upkeepTends || 0),
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
      && ((after.bondTends || 0) - (before.bondTends || 0)) === 2
      && ((after.upkeepTends || 0) - (before.upkeepTends || 0)) === 2;
    out({ seed, case: kase, pass, err, tended, trustA: la.trust, trustB: lb.trust, trustC: lc.trust,
      tendedWeekB: lb.tendedWeek, bondTendsDelta: (after.bondTends || 0) - (before.bondTends || 0),
      upkeepTendsDelta: (after.upkeepTends || 0) - (before.upkeepTends || 0),
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
      && ((after.bondTends || 0) - (before.bondTends || 0)) === 1
      && ((after.upkeepTends || 0) - (before.upkeepTends || 0)) === 0;
    out({ seed, case: kase, pass, err, tended, trustA: la.trust, trustB: lb.trust,
      tendedWeekB: lb.tendedWeek, bondTendsDelta: (after.bondTends || 0) - (before.bondTends || 0),
      nationalLive: !!Game.state.nationalLive });
    process.exit(pass ? 0 : 1);
  }
  if (kase === 'reclimb-rep-pd1' || kase === 'reclimb-rep-pd3' || kase === 'reclimb-off' || kase === 'reclimb-pd0') {
    const { Game, v, hx, hy, stats, mkLink, stockPantry, clearPlans, repId } = await setup();
    const mship = Game.mshipState();
    mship.links = mship.links || [];
    const la = mkLink('rlink-a', 'village-a', 35);
    const lb = mkLink('rlink-b', 'village-b', 38);
    const lc = mkLink('rlink-c', 'village-c', 45);
    mship.links.push(la, lb, lc);
    stockPantry(kase === 'reclimb-rep-pd3' ? 100 : (kase === 'reclimb-pd0' ? 10 : 30));
    clearPlans();
    Game.state.nationalLive = false;
    if (kase === 'reclimb-off') process.env.HOLDBUILD_RECLIMB = '0';
    const rep = repId();
    const before = stats();
    let res = null, err = null;
    try { res = Game.winPlanBondsTick(hx, hy); } catch (e) { err = e && e.message; }
    const after = stats();
    let pass;
    if (kase === 'reclimb-off' || kase === 'reclimb-pd0') {
      pass = !err && res === null && la.trust === 35 && lb.trust === 38 && lc.trust === 45
        && ((after.bondTends || 0) - (before.bondTends || 0)) === 0
        && ((after.reclimbTends || 0) - (before.reclimbTends || 0)) === 0;
    } else {
      const tended = (res && res.tended) || [];
      pass = !err && !!res && !!rep && res.actor === rep && tended.length === 3
        && la.trust === 43 && lb.trust === 46 && lc.trust === 53
        && ((after.bondTends || 0) - (before.bondTends || 0)) === 3
        && ((after.reclimbTends || 0) - (before.reclimbTends || 0)) === 2
        && ((after.upkeepTends || 0) - (before.upkeepTends || 0)) === 0;
    }
    out({ seed, case: kase, pass, err, rep, actor: res && res.actor, tended: res && res.tended,
      trustA: la.trust, trustB: lb.trust, trustC: lc.trust,
      bondTendsDelta: (after.bondTends || 0) - (before.bondTends || 0),
      reclimbTendsDelta: (after.reclimbTends || 0) - (before.reclimbTends || 0),
      nationalLive: !!Game.state.nationalLive });
    process.exit(pass ? 0 : 1);
  }
  out({ seed, case: kase, pass: false, err: 'unknown case' });
  process.exit(2);
}

function runAll() {
  const cases = ['upkeep-on', 'upkeep-off', 'cap55', 'cap50', 'reclimb-rep-pd1', 'reclimb-rep-pd3', 'reclimb-off', 'reclimb-pd0'];
  const results = [];
  let failed = false;
  for (const c of cases) {
    try {
      const o = execFileSync('node', [path.join(repo, 'scripts', 'test-holdbuild-b.js'), String(seed), c],
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
  // Static leg: the tracked modification under src/js/ is exactly win-plan.js.
  // Diff the branch against its merge-base (not the worktree), so the leg
  // still holds once the build is committed.
  try {
    const base = execSync('git merge-base HEAD master', { cwd: repo, encoding: 'utf8' }).trim();
    const names = execSync(`git diff --name-only ${base} HEAD -- src/js/`, { cwd: repo, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
    const staticPass = names.length === 1 && names[0] === 'src/js/win-plan.js';
    results.push({ seed, case: 'static-src-diff', pass: staticPass, files: names });
    if (!staticPass) failed = true;
  } catch (e) {
    results.push({ seed, case: 'static-src-diff', pass: false, err: String((e && e.message) || e).slice(0, 200) });
    failed = true;
  }
  for (const r of results) console.log(JSON.stringify(r));
  console.log(JSON.stringify({ seed, case: 'all', pass: !failed, cases: results.map(r => r.case + ':' + (r.pass ? 'PASS' : 'FAIL')) }));
  process.exit(failed ? 1 : 0);
}

if (kase === 'all') runAll();
else runCase().catch(e => { console.error('HOLDBUILD-B FAILED:', (e && e.stack) || e); process.exit(1); });
