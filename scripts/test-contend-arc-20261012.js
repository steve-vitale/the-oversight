#!/usr/bin/env node
// test-contend-arc-20261012.js — proof for longsim trust r5, blank 2.
// The blank (r4 documented): a repeatedly-stood-down contender never
// changed — 14 identical confrontations, never gave up / left / grudgingly
// respected. The fix (src/js/game.js): the contender keeps a rivalry ledger
// (v.contendArc[cid] = {stoodDown, yielded, state}); from stand-down #4 each
// confrontation can resolve: grudging respect (stops challenging, trust
// floor settles), refocus (drops the lead goal for their own work), or the
// rare splinter-leave (walks out — narrated honestly, gossip-seeded with
// real witnesses, never silent). Leave is gated: only when never yielded
// to, holding no domain, and trust <= 25.
// Proves (forced Math.random sequences — deterministic):
//   1. stoodDown < 4 -> no resolution (state stays 'open').
//   2. LEAVE: forced roll -> state 'leave', off roster, exiles how='splinter',
//      departure gossip seeded naming them with witnesses, leave beat said.
//   3. REFOCUS: forced roll -> state 'refocus', goal changed from 'lead'.
//   4. RESPECT: forced roll -> state 'respect', trust bumped, friction skips
//      them (heat stays 0 over 50 provocations).
//   5. LEAVE gated by yield: yielded=1 + leave-roll -> never leaves.
//   6. LEAVE gated by trust: trust=60 + leave-roll -> never leaves.
//   7. Resolution is terminal: a resolved arc never re-rolls.
//   8. Dead ids are pruned from v.contendArc.
// All seeded: SEED=... node scripts/test-contend-arc-20261012.js
'use strict';
const { execFileSync } = require('child_process');
const path = require('path');

for (const f of ['src/js/game.js']) {
  try { execFileSync(process.execPath, ['--check', path.join(__dirname, '..', f)], { stdio: 'pipe' }); }
  catch (e) { console.log('FAIL syntax ' + f); process.exit(1); }
}
console.log('PASS syntax (game.js)');

const { loadGame, setupGame } = require('./sim-harness');

async function freshGame(seed) {
  const { Game } = await loadGame({ seed, mode: 'proof', fullTelemetry: false });
  await setupGame(Game);
  const lines = [];
  Game.say = function (t) { lines.push(String(t)); };
  Game._said = lines;
  return Game;
}

async function findTwoContenders(baseSeed) {
  for (let s = baseSeed; s < baseSeed + 80; s++) {
    const Game = await freshGame(s);
    const v = Game.state.village;
    const roster = v.roster.filter(id => id !== Game.villagerId);
    const cids = roster.filter(id => { try { return Game.npcGoal(id) === 'lead'; } catch (e) { return false; } });
    if (cids.length >= 2) return { Game, cid: cids[0], cid2: cids[1], seed: s };
    if (cids.length === 1) return { Game, cid: cids[0], cid2: null, seed: s };
  }
  return null;
}

// findFieryContender: lead-goal + push-back temperament (needed for the
// friction-suppression proof — non-fiery contenders never build heat anyway).
async function findFieryContender(baseSeed) {
  const fiery = new Set(['bold', 'prickly', 'intense']);
  for (let s = baseSeed; s < baseSeed + 120; s++) {
    const Game = await freshGame(s);
    const v = Game.state.village;
    const roster = v.roster.filter(id => id !== Game.villagerId);
    const cids = roster.filter(id => {
      try { return Game.npcGoal(id) === 'lead' && fiery.has(Game.npcTemper(id)); }
      catch (e) { return false; }
    });
    if (cids.length) return { Game, cid: cids[0], seed: s };
  }
  return null;
}

// forceRandom(seq): run fn with Math.random returning seq in order (then 0.999)
function withRandom(seq, fn) {
  const real = Math.random;
  const q = seq.slice();
  Math.random = () => (q.length ? q.shift() : 0.999);
  try { return fn(); } finally { Math.random = real; }
}

(async () => {
  let pass = 0, fail = 0;
  const ok = (name, cond, extra) => {
    if (cond) { pass++; console.log('PASS ' + name); }
    else { fail++; console.log('FAIL ' + name + (extra ? ' — ' + extra : '')); }
  };
  const baseSeed = parseInt(process.env.SEED || '20261012', 10);

  // 1. below threshold: no resolution
  {
    const f = await findTwoContenders(baseSeed);
    ok('found a contender', !!f);
    if (f) {
      const { Game, cid } = f;
      const v = Game.state.village;
      v.challenge = { cid, task: 'forage', age: 1 };
      const arc = Game._contendArc(cid);
      arc.stoodDown = 2;
      const res = withRandom([0.0, 0.0], () => Game._maybeResolveContendArc(cid, arc));
      ok('stoodDown=2 -> no resolution', res === null && arc.state === 'open');
    }
  }

  // 2. LEAVE
  {
    const f = await findTwoContenders(baseSeed + 100);
    if (f) {
      const { Game, cid } = f;
      const v = Game.state.village;
      v.trust = v.trust || {}; v.trust[cid] = 10;
      v.taskLeads = {};
      v.challenge = { cid, task: 'forage', age: 1 };
      const before = Game._said.length;
      const arc = Game._contendArc(cid);
      arc.stoodDown = 4; arc.yielded = 0;
      const res = withRandom([0.0, 0.05, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0], () => Game._maybeResolveContendArc(cid, arc));
      const said = Game._said.slice(before).join('\n');
      ok('leave: resolves to leave', res === 'leave' && arc.state === 'leave', res);
      ok('leave: off the roster', !(v.roster || []).includes(cid));
      const exile = (v.exiles || []).find(e => e && e.vid === cid);
      ok('leave: recorded as splinter in exiles', !!exile && exile.how === 'splinter', exile ? exile.how : 'none');
      const gossip = (v.gossip || []).find(g => g.action === 'departure' && g.dims && g.dims.who === cid);
      ok('leave: departure gossip seeded naming them', !!gossip);
      ok('leave: gossip has witnesses (not born dead)', !!gossip && (gossip.heard || []).length > 0, gossip ? 'heard=' + gossip.heard.length : '');
      ok('leave: narrated honestly (not silent)', /pack/.test(said) && /look back|somewhere else/.test(said), said.slice(0, 120));
      ok('leave: no theft — takes their own things', /their own things, nothing else/.test(said));
    } else ok('leave: contender found', false);
  }

  // 3. REFOCUS
  {
    const f = await findTwoContenders(baseSeed + 200);
    if (f) {
      const { Game, cid } = f;
      const v = Game.state.village;
      const arc = Game._contendArc(cid);
      arc.stoodDown = 5;
      const res = withRandom([0.0, 0.25], () => Game._maybeResolveContendArc(cid, arc));
      ok('refocus: resolves to refocus', res === 'refocus' && arc.state === 'refocus', res);
      let goal = null;
      try { goal = Game.npcGoal(cid); } catch (e) {}
      ok('refocus: goal changed from lead', goal !== 'lead', 'goal=' + goal);
      const mem = ((v.memory || {})[cid] || []).some(m => m.t === 'refocused');
      ok('refocus: memory recorded', mem);
    } else ok('refocus: contender found', false);
  }

  // 4. RESPECT + friction suppression
  {
    const f = await findFieryContender(baseSeed + 300);
    if (f) {
      const { Game, cid } = f;
      const v = Game.state.village;
      v.trust = v.trust || {}; v.trust[cid] = 20;
      const arc = Game._contendArc(cid);
      arc.stoodDown = 4;
      // control: friction CAN build heat for this fiery contender pre-respect
      {
        const v2 = Game.state.village;
        const r2 = v2.roster.filter(id => id !== Game.villagerId && id !== cid);
        let sawHeat = false;
        for (let i = 0; i < 50; i++) {
          try { Game.leadershipFriction(r2[i % r2.length], 'wood'); } catch (e) {}
          if (((v2.heat || {})[cid] || 0) > 0) { sawHeat = true; break; }
          v2.challenge = null;
        }
        ok('control: fiery contender builds heat pre-respect', sawHeat);
        v2.heat[cid] = 0; v2.challenge = null;
      }
      const res = withRandom([0.0, 0.9], () => Game._maybeResolveContendArc(cid, arc));
      ok('respect: resolves to respect', res === 'respect' && arc.state === 'respect', res);
      ok('respect: trust floor settled (bumped, not spiked)', (v.trust[cid] || 0) > 20 && (v.trust[cid] || 0) <= 30, 'trust=' + v.trust[cid]);
      // friction suppression: 50 provocations, heat stays 0 for the respected contender
      const roster = v.roster.filter(id => id !== Game.villagerId && id !== cid);
      for (let i = 0; i < 50; i++) {
        try { Game.leadershipFriction(roster[i % roster.length], 'wood'); } catch (e) {}
        v.challenge = null;
      }
      ok('respect: friction skips them (heat stays 0)', ((v.heat || {})[cid] || 0) === 0, 'heat=' + ((v.heat || {})[cid] || 0));
      // terminal: even with resolution-favorable rolls, no re-roll
      v.challenge = { cid, task: 'forage', age: 1 };
      const res2 = withRandom([0.0, 0.0], () => Game.standGround(cid));
      ok('respect: terminal (standGround keeps state)', (v.contendArc[cid] || {}).state === 'respect');
      ok('respect: standGround still clears challenge', !v.challenge);
    } else ok('respect: contender found', false);
  }

  // 5. leave gated by yield
  {
    const f = await findTwoContenders(baseSeed + 400);
    if (f) {
      const { Game, cid } = f;
      const v = Game.state.village;
      v.trust = v.trust || {}; v.trust[cid] = 10;
      const arc = Game._contendArc(cid);
      arc.stoodDown = 6; arc.yielded = 1;
      const res = withRandom([0.0, 0.05], () => Game._maybeResolveContendArc(cid, arc));
      ok('leave-gate: yielded contender never leaves', res !== 'leave' && (v.roster || []).includes(cid), res);
    } else ok('leave-gate: contender found', false);
  }

  // 6. leave gated by trust
  {
    const f = await findTwoContenders(baseSeed + 500);
    if (f) {
      const { Game, cid } = f;
      const v = Game.state.village;
      v.trust = v.trust || {}; v.trust[cid] = 60;
      const arc = Game._contendArc(cid);
      arc.stoodDown = 6; arc.yielded = 0;
      const res = withRandom([0.0, 0.05], () => Game._maybeResolveContendArc(cid, arc));
      ok('leave-gate: trusted contender never leaves', res !== 'leave' && (v.roster || []).includes(cid), res);
    } else ok('leave-gate: contender found', false);
  }

  // 8. dead ids pruned
  {
    const Game = await freshGame(baseSeed + 600);
    const v = Game.state.village;
    v.contendArc = { ghost_1: { stoodDown: 9, state: 'open' } };
    Game._contendArc('someone');
    ok('arc: dead ids pruned', !v.contendArc.ghost_1);
  }

  console.log('\n' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS-FAIL', e); process.exit(2); });
