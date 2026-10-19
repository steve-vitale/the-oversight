#!/usr/bin/env node
// scripts/test-trapjoin-b.js — proof test for the sim-trapjoin-b arm
// (scripts/policies/trapjoin.js).
//
// RED (TRAPJOIN unset): the wrapper is pure delegation — daily returns the
// base's value, zero _tj* keys on ctx, and a 20-day trajectory matches the
// base policy's on the same seed.
// GREEN (TRAPJOIN=1): a trapper-occupation joiner is injected through the
// engine's REAL join path (mshipState().arrivals + arrivalTick); the layer
// detects the vid-appearance event, holds a welcome conversation (trust <
// 15), and puts the trust>=15 joiner on the 'teach' chore via the engine's
// own assignTask. The teach chore's pit apprenticeship (pit_lesson tele) is
// exercised in the sweep; here the duty assignment is the asserted beat.
//
// Usage: node scripts/test-trapjoin-b.js
'use strict';
const assert = require('assert');
// POST-KILL INFO-SKIP: the trapjoin layer was deleted per the kill protocol
// (KILLED AT PILOT on the binding primary, 2026-10-19), so this proof has
// nothing to prove. Exit 0 instead of crashing on the missing module.
const fs0 = require('fs'), path0 = require('path');
if (!fs0.existsSync(path0.join(__dirname, 'policies', 'trapjoin.js'))) {
  console.log('INFO-SKIP: test-trapjoin-b.js — layer deleted per kill protocol (KILLED AT PILOT 2026-10-19); proof vacuous.');
  process.exit(0);
}

const SEED = 6621; // fresh (verified against evidence/ + scripts/ + hidden_files/)

async function main() {
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  const FS = require('./policies/feastscale');
  const TJ = require('./policies/trapjoin');

  // ---------- RED: gate off = pure delegation ----------
  delete process.env.TRAPJOIN;
  {
    const { Game } = await loadGame({ seed: SEED, mode: 'leanwinter' });
    await setupGame(Game);
    const ctx = {};
    TJ.joinerWatch(Game, ctx);
    TJ.welcomeRound(Game, ctx);
    TJ.teachDuty(Game, ctx);
    assert.deepStrictEqual(Object.keys(ctx).filter(k => k.indexOf('_tj') === 0), [],
      'RED: gate-off layer functions must write zero _tj* ctx keys');
    // daily returns the base's value with no layer side effects
    let baseCalled = 0;
    const fake = { daily: () => { baseCalled++; return 'base-ret'; }, upkeep: () => {} };
    const w = TJ.withTrapjoin(fake, 'x', 'y');
    const rv = w.daily(Game, {});
    assert.strictEqual(rv, 'base-ret', 'RED: gate-off daily must return base.daily value');
    assert.strictEqual(baseCalled, 1, 'RED: gate-off daily must call base.daily once');
    console.log('RED-1 PASS: gate-off layer is zero-write, pure delegation');
  }
  // RED trajectory: wrapped policy (gate off) vs base policy, same seed
  async function traj(policy, seed) {
    const { Game } = await loadGame({ seed, mode: 'leanwinter' });
    await setupGame(Game);
    const hashes = [];
    const wrapped = Object.assign({}, policy);
    const base = policy.daily;
    wrapped.daily = (G, ctx) => {
      const s = G.state.scholar || {}, v = G.state.village || {};
      hashes.push([s.day, Math.round(s.kcal || 0), (v.roster || []).length].join('|'));
      return base ? base(G, ctx) : undefined;
    };
    let result;
    await quietLog(async () => { result = await runDays(Game, wrapped, { days: 20 }); });
    return { hashes, days: result.days };
  }
  {
    const t1 = await traj(TJ.trapjoinLead, SEED);
    const t2 = await traj(FS.leadfeast, SEED);
    assert.deepStrictEqual(t1.hashes, t2.hashes,
      'RED: gate-off wrapped trajectory must equal base trajectory');
    console.log(`RED-2 PASS: 20d trajectory identical (gate off), days=${t1.days}`);
  }

  // ---------- GREEN: gate on ----------
  process.env.TRAPJOIN = '1';
  assert.strictEqual(TJ.layerOn(), true, 'GREEN: layerOn() with TRAPJOIN=1');

  // injectJoiner: the ENGINE'S REAL join path — a background_survivors seed
  // with a trapper occupation as the applicant (genApplicant's 70% branch:
  // charId set -> arrivalTick -> ensureRosterPerson -> hydrateSeed, whose vp
  // keeps the occupation's knowsPit, game.js:1545). Seeds not on the roster.
  function injectJoiner(Game, day) {
    const used = new Set(Game.state.village.roster || []);
    const seeds = (Game.data.background_survivors || []).filter(s =>
      !used.has(s.id) && /hunting guide|trail crew|rancher/i.test(String(s.formerOccupation || '')));
    assert.ok(seeds.length, 'GREEN: a trapper-occupation survivor seed is available');
    const seed = seeds[0];
    const m = Game.mshipState();
    (m.arrivals = m.arrivals || []).push({
      id: seed.id, charId: seed.id, name: seed.name,
      formerOccupation: seed.formerOccupation, arriveDay: day,
    });
    Game.arrivalTick();
    const roster = Game.state.village.roster || [];
    assert.ok(roster.indexOf(seed.id) >= 0, 'GREEN: joiner arrived via arrivalTick');
    return seed.id;
  }

  {
    const { Game } = await loadGame({ seed: SEED, mode: 'leanwinter' });
    await setupGame(Game);
    const policy = TJ.trapjoinLead;
    const ctx = {};
    // day 0: joinerWatch seeds the day-0 roster set
    let day0 = ((Game.state.scholar || {}).day || 0);
    policy.upkeep(Game, ctx);
    assert.ok(ctx._tjSeen && Object.keys(ctx._tjSeen).length > 5, 'GREEN: day-0 roster seeded');
    assert.deepStrictEqual(Object.keys(ctx._tjJoiners || {}), [], 'GREEN: no joiners on day 0');

    const jvid = injectJoiner(Game, day0);
    policy.upkeep(Game, ctx);
    const j = (ctx._tjJoiners || {})[jvid];
    assert.ok(j, 'GREEN: joinerWatch detected the vid-appearance event');
    assert.strictEqual(j.trapper, true, 'GREEN: trapper occupation flagged');
    assert.strictEqual(j.knowsPit, true, `GREEN: trapper-occupation joiner constructed with knowsPit (occ "${j.occ}")`);
    console.log(`GREEN-1 PASS: joiner detected (day ${j.day}, occ "${j.occ}", knowsPit=${j.knowsPit})`);

    // Scholar to haven so the layer can act in person.
    const hv = Game.state.village || {};
    try { Game.map.px = (hv.px ?? 4); Game.map.py = (hv.py ?? 4); } catch (e) {}
    assert.ok(Game.playerAtHaven(), 'GREEN: scholar at haven for in-person verbs');

    // WELCOME: drop trust below the ask gate, the layer sits down with them.
    // (Trust 5: even the engine's full sitting stipend can't reach the 20
    // ask gate in one day, so no duty fires yet — the welcome is isolated.)
    (Game.state.village.trust || (Game.state.village.trust = {}))[jvid] = 5;
    policy.daily(Game, ctx);
    const welcomes = ctx._tjWelcomeLog || [];
    assert.strictEqual(welcomes.length, 1, 'GREEN: exactly one welcome sitting fired');
    assert.strictEqual(welcomes[0].vid, jvid, 'GREEN: welcome targeted the trapper joiner');
    assert.ok(welcomes[0].turns >= 1, `GREEN: welcome held real turns (got ${welcomes[0].turns})`);
    assert.ok(welcomes[0].trustAfter >= welcomes[0].trustBefore,
      `GREEN: welcome never loses trust (${welcomes[0].trustBefore} -> ${welcomes[0].trustAfter})`);
    console.log(`GREEN-2 PASS: welcome held (${welcomes[0].turns} turns, trust ${welcomes[0].trustBefore} -> ${welcomes[0].trustAfter})`);

    // DUTY: raise trust past the ask gate; the layer asks them to teach.
    // Check the assignment synchronously: assignments are day-scoped and the
    // base daily consumes them (the teach chore runs that day).
    (Game.state.village.trust[jvid]) = 45; // above the obedience reluctance band — honest ask, honest yes
    try { Game.map.px = (hv.px ?? 4); Game.map.py = (hv.py ?? 4); } catch (e) {}
    try { Game.state.scholar.day = day0 + 1; } catch (e) {}
    TJ.teachDuty(Game, ctx);
    const asg = (Game.state.village.assignments || {})[jvid];
    assert.ok(asg && asg.task === 'teach', `GREEN: assignTask put the joiner on 'teach' (got ${asg && asg.task})`);
    const duties = (ctx._tjDutyLog || []).filter(e => e.vid === jvid);
    assert.ok(duties.length >= 1, 'GREEN: a teach duty was attempted');
    assert.strictEqual(duties[duties.length - 1].ok, true, 'GREEN: duty logged ok');
    console.log(`GREEN-3 PASS: teach duty assigned via engine assignTask (trust 45, no refusal)`);
    // The wrapper path: a full daily consumes the duty (the teach chore runs).
    policy.daily(Game, ctx);

    // DUTY HONESTY in the reluctance band: trust 20-39 — the engine's 40%
    // reluctance roll is the last word; the layer logs whatever happens and
    // never overrides. Branch-invariant assertions (seed decides the branch).
    const jvid2 = injectJoiner(Game, day0 + 1);
    policy.upkeep(Game, ctx);
    (Game.state.village.trust[jvid2]) = 25; // askable, inside the reluctance band
    try { Game.map.px = (hv.px ?? 4); Game.map.py = (hv.py ?? 4); } catch (e) {}
    try { Game.state.scholar.day = day0 + 2; } catch (e) {}
    policy.daily(Game, ctx);
    const d2 = (ctx._tjDutyLog || []).filter(e => e.vid === jvid2);
    assert.ok(d2.length >= 1, 'GREEN: a duty was attempted for the band-trust joiner');
    const last2 = d2[d2.length - 1];
    assert.ok(last2.ok !== last2.refused, 'GREEN: duty logged exactly one of ok/refused');
    const asg2 = (Game.state.village.assignments || {})[jvid2];
    if (last2.ok) assert.ok(asg2 && asg2.task === 'teach', 'GREEN: ok duty => assigned teach');
    else assert.ok(!(asg2 && asg2.task === 'teach'), 'GREEN: refused duty => NOT assigned');
    console.log(`GREEN-4 PASS: reluctance-band duty honestly ${last2.ok ? 'accepted' : 'refused'} by the engine, logged, no override`);

    // REFUSAL BACKOFF: a refused ask isn't nagged daily.
    const jvid3 = injectJoiner(Game, day0 + 2);
    policy.upkeep(Game, ctx);
    (ctx._tjDutyLog || []).push({ day: day0 + 2, vid: jvid3, ok: false, refused: true });
    (Game.state.village.trust[jvid3]) = 30;
    try { Game.map.px = (hv.px ?? 4); Game.map.py = (hv.py ?? 4); } catch (e) {}
    try { Game.state.scholar.day = day0 + 3; } catch (e) {}
    policy.daily(Game, ctx);
    const d3 = (ctx._tjDutyLog || []).filter(e => e.vid === jvid3 && e.day === day0 + 3);
    assert.strictEqual(d3.length, 0, 'GREEN: refused joiner not re-asked within the backoff');
    console.log('GREEN-5 PASS: refusal backoff holds (no re-ask within 7d)');
  }
  delete process.env.TRAPJOIN;
  console.log('\nALL TRAPJOIN PROOF TESTS PASS');
}

main().catch(e => { console.error('PROOF TEST FAILED:', e); process.exit(1); });
