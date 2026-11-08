#!/usr/bin/env node
// RALLY-GUARD drive proof (win-drives Track 3, 2026-11-03).
// Drive 1: within 3 days of raid gossip, a protect/prove/lead villager
// at haven volunteers as GUARD on a 'go'-verdict departure that the
// danger check alone would send out solo. No new RNG draws on any path.
//
// Cases (fresh loadGame each, seed 4242 + case offset):
//   main:  raid gossip today + bold principal + protect volunteer
//          -> principal departs WITH the volunteer as GUARD.
//   noraid: no gossip + same staging -> principal departs SOLO.
//   wronggoal: raid gossip + volunteer goal 'family' -> SOLO.
//   stale: raid gossip 4 days old -> SOLO (window is 3 days).
//   askpath: raid gossip + steady principal -> verdict 'ask' (existing
//          companion path, untouched by this drive).
const { loadGame } = require('./sim-harness');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

async function stage(Game) {
  await Game.init();
  Game.genRoster('Breaker');
  const rid = Game.generatedRoster[0].id;
  Game.newGame('Breaker', null, rid);
  Game.depart();
  const v = Game.state.village;
  const hx = v.px ?? 4, hy = v.py ?? 4;
  Game.map.px = hx; Game.map.py = hy;
  try { Game.stockPantry(20000, 'test'); } catch (e) {}
  const ids = (v.roster || []).filter(id => id !== Game.villagerId);
  for (const id of ids) {
    try {
      const n = Game.npcNeeds(id);
      n.hunger = 10; n.energy = 80; n.social = 40; n.fear = 10;
    } catch (e) {}
    try { Game.npcSetNode(id, hx, hy); } catch (e) {}
    try { Game.npcSetInside(id, true); } catch (e) {}
    try { const vp = Game.vpOf(id); if (vp) vp.hp = 100; } catch (e) {}
  }
  return { v, hx, hy, ids };
}

function setGoal(Game, vid, goal) {
  // npcGoal reads data.villagers[].goal first, then bgGoals.
  try {
    const dv = (Game.data.villagers || []).find(x => x.id === vid);
    if (dv) { dv.goal = goal; return; }
  } catch (e) {}
  try {
    const gr = (Game.generatedRoster || []).find(x => x.id === vid);
    if (gr) { gr.goal = goal; return; }
  } catch (e) {}
  Game.state.village.bgGoals = Game.state.village.bgGoals || {};
  Game.state.village.bgGoals[vid] = goal;
}

function setObjective(Game, vid, hx, hy) {
  const o = Game.objOf(vid);
  o.kind = 'FORAGE'; o.purpose = 'forage'; o.state = 'ready';
  o.indoor = false; o.tx = hx + 1; o.ty = hy; o.tightness = 1;
  o.partsLeft = 3; o.targetVid = null; o.companion = null; o.solo = false;
  return o;
}

async function runCase(name, opts) {
  console.log('== ' + name + ' ==');
  const { Game } = await loadGame({ seed: 4242 + opts.seedOff });
  const { v, hx, hy, ids } = await stage(Game);
  const day = (Game.state.scholar || {}).day || 0;
  // principal: bold (or restless) so raid +2 scores 1 -> 'go'
  let principal = null;
  for (const id of ids) {
    let t = 'steady';
    try { t = Game.npcTemper(id); } catch (e) {}
    if (opts.steadyPrincipal ? t === 'steady' : (t === 'bold' || t === 'restless')) { principal = id; break; }
  }
  if (!principal) { check(name + ': principal found', false, 'no villager with needed temper'); return; }
  const volunteer = ids.find(id => id !== principal);
  if (!volunteer) { check(name + ': volunteer found', false, 'roster too small'); return; }
  setGoal(Game, volunteer, opts.goal || 'protect');
  check(name + ': volunteer goal reads back', Game.npcGoal(volunteer) === (opts.goal || 'protect'),
    'npcGoal=' + Game.npcGoal(volunteer));
  // AskCompanion only keeps candidates with score > 0. Stage a ready
  // outdoor errand only when we expect THIS volunteer to win the rally
  // pick — otherwise an ask-path companion search would snag them.
  if (opts.expectGuard) setObjective(Game, volunteer, hx, hy);
  if (opts.gossipAge != null) {
    v.gossip = v.gossip || [];
    // Heard-filtered danger (seam 4): the volunteer must personally hear
    // the raid to arm rally-guard. Principal may or may not hear — door
    // uses their own belief separately.
    const hearers = opts.hearers || [volunteer, principal];
    v.gossip.push({ action: 'raid', day: day - opts.gossipAge, village: 'other-village-x', heard: hearers });
  }
  const o = setObjective(Game, principal, hx, hy);
  const dg = Game.objDanger(principal, o.tx, o.ty, hx, hy);
  if (opts.expectVerdict) check(name + ': verdict ' + opts.expectVerdict, dg.verdict === opts.expectVerdict,
    'verdict=' + dg.verdict + ' score=' + dg.score);
  Game.objMaybeDepart(principal, Game.npcNode(principal), true, hx, hy);
  const awayP = (v.away || {})[principal];
  check(name + ': principal departs', !!awayP, 'away=' + JSON.stringify(v.away || {}));
  const awayV = (v.away || {})[volunteer];
  if (opts.expectGuard) {
    // The drive picks the BEST rally volunteer by the existing scoring
    // (own errand, bold/warm, trust, social) — not necessarily the first
    // roster id. Assert on whoever was actually picked.
    const cid = Game.objOf(principal).companion;
    check(name + ': a rally companion was picked', !!cid, 'companion=' + cid);
    const awayC = cid ? (v.away || {})[cid] : null;
    check(name + ': picked companion departs as guard', !!(awayC && awayC.purpose === 'guard'),
      'companion away=' + JSON.stringify(awayC));
    if (cid) {
      const vo = Game.objOf(cid);
      check(name + ': guard targets principal', vo.targetVid === principal, 'targetVid=' + vo.targetVid);
      check(name + ': guard goal is rally', ['protect', 'prove', 'lead'].includes(Game.npcGoal(cid)),
        'goal=' + Game.npcGoal(cid));
    }
  } else {
    check(name + ': volunteer stays home', !awayV, 'volunteer away=' + JSON.stringify(awayV));
  }
}

(async () => {
  await runCase('main: raid + bold + protect', { seedOff: 0, gossipAge: 0, expectVerdict: 'go', expectGuard: true });
  await runCase('noraid: no gossip', { seedOff: 1, gossipAge: null, expectGuard: false });
  await runCase('wronggoal: raid + family volunteer', { seedOff: 2, gossipAge: 0, expectVerdict: 'go', goal: 'family', expectGuard: false });
  await runCase('stale: raid 4 days old', { seedOff: 3, gossipAge: 4, expectGuard: false });
  await runCase('askpath: raid + steady principal', { seedOff: 4, gossipAge: 0, steadyPrincipal: true, expectVerdict: 'ask', expectGuard: false });
  console.log(`\nrally-guard: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('rally-guard harness error', e); process.exit(1); });
