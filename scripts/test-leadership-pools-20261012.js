#!/usr/bin/env node
// test-leadership-pools-20261012.js — proof for longsim trust r5, blank 1.
// The blank (r4 documented): leadership resolution lines were single
// templates — one stand-down line fired verbatim 14x in a 73-day run, and the
// friction/yield/rally/askSupport lines were fixed too.
// The fix (src/js/game.js): every leadership line is a pool picked via
// Game.leadLine(key, cid, pool) — a no-immediate-repeat memory per
// (line-type, contender). standGround lines additionally shift tone tier
// (early/mid/late) as the contender's stand-down count grows.
// Proves:
//   1. leadLine never repeats a line back-to-back (20 seeded picks, 3-pool).
//   2. leadLine handles a 1-line pool (no hang, returns the line).
//   3. standGround: 7 stand-downs -> no consecutive repeats; the late-tier
//      lines (6-7) are a different set from the early-tier lines (1-2) — the
//      5th confrontation does not sound like the 1st; arc.stoodDown counts.
//   4. yieldChallenge: 4 yields on different tasks -> no consecutive repeats.
//   5. askSupport: 2 asks -> lines differ.
//   6. rallyVillage: 4 rallies on successive days -> no consecutive repeats.
//   7. friction lines: 30 delegation provocations -> at least 3 distinct lines.
//   8. challenge raise: 4 raises -> no consecutive repeats.
// All seeded (deterministic): SEED=... node scripts/test-leadership-pools-20261012.js
'use strict';
const { execFileSync } = require('child_process');
const path = require('path');

for (const f of ['src/js/game.js']) {
  try { execFileSync(process.execPath, ['--check', path.join(__dirname, '..', f)], { stdio: 'pipe' }); }
  catch (e) { console.log('FAIL syntax ' + f); process.exit(1); }
}
console.log('PASS syntax (game.js)');

const { loadGame, setupGame } = require('./sim-harness');

const TASKS = ['garden', 'fish', 'water', 'cook', 'wood', 'hunt', 'patrol', 'forage'];

async function freshGame(seed) {
  const { Game } = await loadGame({ seed, mode: 'proof', fullTelemetry: false });
  await setupGame(Game);
  const lines = [];
  Game.say = function (t) { lines.push(String(t)); };
  Game._said = lines;
  return Game;
}

async function findContender(baseSeed) {
  for (let s = baseSeed; s < baseSeed + 60; s++) {
    const Game = await freshGame(s);
    const v = Game.state.village;
    const roster = v.roster.filter(id => id !== Game.villagerId);
    const cids = roster.filter(id => { try { return Game.npcGoal(id) === 'lead'; } catch (e) { return false; } });
    if (cids.length) return { Game, cid: cids[0], seed: s };
  }
  return null;
}

// findFieryContender: a lead-goal contender with a push-back temperament
// (bold/prickly/intense) — only they trigger leadershipFriction lines.
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

(async () => {
  let pass = 0, fail = 0;
  const ok = (name, cond, extra) => {
    if (cond) { pass++; console.log('PASS ' + name); }
    else { fail++; console.log('FAIL ' + name + (extra ? ' — ' + extra : '')); }
  };
  const baseSeed = parseInt(process.env.SEED || '20261012', 10);

  // 1. leadLine: no immediate repeat
  {
    const Game = await freshGame(baseSeed);
    const pool = ['a', 'b', 'c'];
    const picks = [];
    for (let i = 0; i < 20; i++) picks.push(Game.leadLine('test', 'x', pool));
    const noRepeat = picks.every((p, i) => i === 0 || p !== picks[i - 1]);
    ok('leadLine: 20 seeded picks, no consecutive repeat', noRepeat, picks.slice(0, 8).join(','));
    const usedAll = new Set(picks).size === 3;
    ok('leadLine: all 3 pool lines used across 20 picks', usedAll);
  }

  // 2. leadLine: 1-line pool
  {
    const Game = await freshGame(baseSeed + 1);
    const got = Game.leadLine('solo', 'x', ['only']);
    ok('leadLine: 1-line pool returns the line', got === 'only', String(got));
  }

  // 2b. leadPick: stream-neutral deterministic rotation (0 Math.random draws)
  {
    const Game = await freshGame(baseSeed + 2);
    const r0 = Math.random; let draws = 0;
    Math.random = () => { draws++; return r0(); };
    const p1 = Game.leadPick('k2', 'c', ['a', 'b']);
    const p2 = Game.leadPick('k2', 'c', ['a', 'b']);
    const p3 = Game.leadPick('k2', 'c', ['a', 'b']);
    Math.random = r0;
    ok('leadPick: consumes zero random draws', draws === 0, draws + ' draws');
    ok('leadPick: rotates without back-to-back repeat', p1 !== p2, [p1, p2].join(','));
    ok('leadPick: 2-pool cycles (3rd == 1st)', p3 === p1, [p1, p2, p3].join(','));
    // same key+cid in a fresh same-seed game -> same start line (deterministic)
    const Game2 = await freshGame(baseSeed + 2);
    const q1 = Game2.leadPick('k2', 'c', ['a', 'b']);
    ok('leadPick: deterministic start per (key, contender)', q1 === p1, q1 + ' vs ' + p1);
    // different contender -> independent rotation state
    const r1 = Game.leadPick('k2', 'd', ['a', 'b']);
    const r2 = Game.leadPick('k2', 'd', ['a', 'b']);
    ok('leadPick: per-contender rotation memory', r1 !== r2);
  }

  // 3. standGround: tiered pools, no verbatim 14x
  {
    const found = await findContender(baseSeed + 10);
    ok('found a lead-goal contender', !!found);
    if (found) {
      const { Game, cid } = found;
      const v = Game.state.village;
      // isolate the line-tier behavior from arc resolution (tested separately)
      const realResolve = Game._maybeResolveContendArc;
      Game._maybeResolveContendArc = function () { return null; };
      const said = [];
      for (let i = 0; i < 7; i++) {
        v.challenge = { cid, task: 'forage', age: 1 };
        Game.standGround(cid);
        said.push(Game._said[Game._said.length - 1]);
      }
      Game._maybeResolveContendArc = realResolve;
      const noRepeat = said.every((l, i) => i === 0 || l !== said[i - 1]);
      ok('standGround: 7 stand-downs, no consecutive repeat', noRepeat);
      const early = new Set(said.slice(0, 2)), late = new Set(said.slice(5, 7));
      const disjoint = [...early].every(l => !late.has(l));
      ok('standGround: late-tier lines differ from early-tier lines (arc has a voice)', disjoint,
        'early=' + [...early].map(l => l.slice(0, 40)).join(' | ') + ' ... late=' + [...late].map(l => l.slice(0, 40)).join(' | '));
      const arc = (v.contendArc || {})[cid] || {};
      ok('standGround: arc.stoodDown counts 7', arc.stoodDown === 7, 'got ' + arc.stoodDown);
    }
  }

  // 4. yieldChallenge: varied
  {
    const found = await findContender(baseSeed + 20);
    if (found) {
      const { Game, cid } = found;
      const v = Game.state.village;
      const said = [];
      for (let i = 0; i < 4; i++) {
        v.challenge = { cid, task: TASKS[i], age: 1 };
        Game.yieldChallenge(cid);
        said.push(Game._said[Game._said.length - 1]);
      }
      const noRepeat = said.every((l, i) => i === 0 || l !== said[i - 1]);
      ok('yieldChallenge: 4 yields, no consecutive repeat', noRepeat);
      const arc = (v.contendArc || {})[cid] || {};
      ok('yieldChallenge: arc.yielded counts 4', arc.yielded === 4, 'got ' + arc.yielded);
    } else ok('yieldChallenge: contender found', false);
  }

  // 5. askSupport: varied
  {
    const found = await findContender(baseSeed + 30);
    if (found) {
      const { Game, cid } = found;
      const v = Game.state.village;
      const roster = v.roster.filter(id => id !== Game.villagerId && id !== cid);
      v.trust = v.trust || {};
      for (const id of roster) v.trust[id] = 80;
      v.heat = v.heat || {};
      v.heat[cid] = 3;
      const said = [];
      for (const vid of roster.slice(0, 2)) {
        Game.askSupport(vid);
        said.push(Game._said[Game._said.length - 1]);
      }
      ok('askSupport: 2 asks -> 2 lines', said.length === 2, said.length + '');
      ok('askSupport: lines differ', said.length < 2 || said[0] !== said[1]);
    } else ok('askSupport: contender found', false);
  }

  // 6. rallyVillage: varied across days
  {
    const Game = await freshGame(baseSeed + 40);
    const said = [];
    for (let d = 0; d < 4; d++) {
      Game.state.scholar.day += 1;
      Game.rallyVillage();
      said.push(Game._said[Game._said.length - 1]);
    }
    const noRepeat = said.every((l, i) => i === 0 || l !== said[i - 1]);
    ok('rallyVillage: 4 rallies, no consecutive repeat', noRepeat);
  }

  // 7. friction lines: variety under provocation
  {
    const found = await findFieryContender(baseSeed + 50);
    if (found) {
      const { Game, cid } = found;
      const v = Game.state.village;
      const roster = v.roster.filter(id => id !== Game.villagerId && id !== cid);
      const distinct = new Set();
      for (let i = 0; i < 30; i++) {
        const before = Game._said.length;
        try { Game.leadershipFriction(roster[i % roster.length], 'wood'); } catch (e) {}
        for (let j = before; j < Game._said.length; j++) {
          const l = Game._said[j];
          if (l.includes('giving orders') || l.includes('Nobody asked me') || l.includes('Your call') || l.includes('arms crossed') || l.includes('Orders are orders') || l.includes('again."')) distinct.add(l);
        }
        if (v.challenge) v.challenge = null; // keep provocations coming
        v.heat[cid] = 0;
      }
      ok('friction: >=3 distinct one-liners over 30 provocations', distinct.size >= 3, 'distinct=' + distinct.size);
    } else ok('friction: contender found', false);
  }

  // 8. challenge raise: varied
  {
    const found = await findFieryContender(baseSeed + 60);
    if (found) {
      const { Game, cid } = found;
      const v = Game.state.village;
      const roster = v.roster.filter(id => id !== Game.villagerId && id !== cid);
      const raises = [];
      for (let i = 0; i < 40 && raises.length < 4; i++) {
        v.heat = v.heat || {};
        v.heat[cid] = 3; v.challenge = null;
        const before = Game._said.length;
        try { Game.leadershipFriction(roster[0], 'wood'); } catch (e) {}
        // count only iterations where the challenge actually raised (heat 3
        // + the 0.4 temper roll both have to land)
        if (v.challenge && v.challenge.cid === cid) {
          raises.push(Game._said[Game._said.length - 1]);
        }
        v.heat[cid] = 0; v.challenge = null;
      }
      ok('challengeRaise: captured 4 real raises', raises.length === 4, raises.length + '');
      const noRepeat = raises.every((l, i) => i === 0 || l !== raises[i - 1]);
      ok('challengeRaise: 4 raises, no consecutive repeat', noRepeat, raises.length + ' captured');
    } else ok('challengeRaise: contender found', false);
  }

  console.log('\n' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS-FAIL', e); process.exit(2); });
