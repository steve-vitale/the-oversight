#!/usr/bin/env node
// test-sortieretry-a.js — proof test for arm sim-sortieretry-a.
// Fixture-level: a fake Game with a scripted answerLingerer. No harness,
// no repo writes. Exit 0 only if ALL legs pass.
'use strict';
const fs = require('fs');
const path = require('path');
const SR = require(path.join(__dirname, 'policies', 'sortieretry'));

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}

function fakeGame(script) {
  // script: array of {ok, why} returned in order by answerLingerer.
  const calls = [];
  const Game = {
    over: false, tbfight: null,
    state: { scholar: { day: 1 }, lastLingererOffer: null },
    answerLingerer(how, key) {
      calls.push({ how, key });
      const r = script.shift() || { ok: false, why: 'none' };
      return { ok: !!r.ok, why: r.why || null, cleared: r.cleared || 0,
        fought: r.fought || [], targetMatched: !!r.targetMatched, raidersAtStart: r.raidersAtStart || 0 };
    },
  };
  return { Game, calls };
}

function runDaily(policy, Game, ctx) { policy.daily(Game, ctx); }

// Leg 1: ok dequeues the head, key passed through.
{
  const { Game, calls } = fakeGame([{ ok: true, fought: [{ key: 'ling1' }], targetMatched: true }]);
  Game.state.lastLingererOffer = { key: 'ling1', name: 'Beast', day: 1 };
  const p = SR.withQueueRetry({}, 't', 't');
  const ctx = {};
  runDaily(p, Game, ctx);
  check('ok dequeues + passes key', calls.length === 1 && calls[0].key === 'ling1' && ctx.sortieretry.queue.length === 0, JSON.stringify(calls));
}

// Leg 2: no-fighters keeps the head; next day it is retried.
{
  const { Game, calls } = fakeGame([{ ok: false, why: 'no-fighters' }, { ok: true, fought: [{ key: 'ling2' }] }]);
  Game.state.lastLingererOffer = { key: 'ling2', name: 'Beast', day: 1 };
  const p = SR.withQueueRetry({}, 't', 't');
  const ctx = {};
  runDaily(p, Game, ctx);
  check('no-fighters keeps head', ctx.sortieretry.queue.length === 1 && ctx.sortieretry.queue[0].key === 'ling2', JSON.stringify(ctx.sortieretry.queue));
  Game.state.scholar.day = 2;
  runDaily(p, Game, ctx);
  check('no-fighters retried next day', calls.length === 2 && calls[1].key === 'ling2', JSON.stringify(calls));
}

// Leg 3: none WITHOUT invalidation dequeues only the head.
{
  const { Game } = fakeGame([{ ok: false, why: 'none' }]);
  const p = SR.withQueueNoInvalidation({}, 't', 't');
  const ctx = { sortieretry: { queue: [
    { key: 'lingA', day: 1, name: 'A', enqueuedDay: 1 },
    { key: 'lingB', day: 1, name: 'B', enqueuedDay: 1 },
    { key: 'lingC', day: 2, name: 'C', enqueuedDay: 2 } ], seen: {}, calls: [], invalidations: 0 } };
  Game.state.lastLingererOffer = null;
  runDaily(p, Game, ctx);
  check('none no-invalidation drops head only', ctx.sortieretry.queue.length === 2 && ctx.sortieretry.queue[0].key === 'lingB', JSON.stringify(ctx.sortieretry.queue));
}

// Leg 4: none WITH invalidation clears the whole backlog.
{
  const { Game } = fakeGame([{ ok: false, why: 'none' }]);
  const p = SR.withQueueRetry({}, 't', 't');
  const ctx = { sortieretry: { queue: [
    { key: 'lingA', day: 1, name: 'A', enqueuedDay: 1 },
    { key: 'lingB', day: 1, name: 'B', enqueuedDay: 1 },
    { key: 'lingC', day: 2, name: 'C', enqueuedDay: 2 } ], seen: {}, calls: [], invalidations: 0 } };
  Game.state.lastLingererOffer = null;
  runDaily(p, Game, ctx);
  check('none invalidation clears backlog', ctx.sortieretry.queue.length === 0 && ctx.sortieretry.invalidations === 1, JSON.stringify(ctx.sortieretry));
}

// Leg 5: duplicate (key,day) never enqueues twice; a fresh day stamp does.
{
  const { Game } = fakeGame([]);
  Game.state.lastLingererOffer = { key: 'ling9', name: 'Beast', day: 3 };
  const p = SR.withQueueRetry({}, 't', 't');
  const ctx = {};
  // Block answering (no answerLingerer would still be called; use a Game
  // whose tbfight is set so daily returns early AFTER enqueue? No —
  // tbfight returns before enqueue. Instead: answer ok and re-offer.)
  Game.answerLingerer = () => ({ ok: true, fought: [], targetMatched: true });
  runDaily(p, Game, ctx);
  runDaily(p, Game, ctx); // same day: answeredToday guard, no dup anyway
  check('no duplicate enqueue', ctx.sortieretry.queue.length === 0 && Object.keys(ctx.sortieretry.seen).length === 1, JSON.stringify(ctx.sortieretry.seen));
  Game.state.scholar.day = 4;
  Game.state.lastLingererOffer = { key: 'ling9', name: 'Beast', day: 4 };
  runDaily(p, Game, ctx);
  check('fresh day stamp enqueues', Object.keys(ctx.sortieretry.seen).length === 2, JSON.stringify(ctx.sortieretry.seen));
}

// Leg 6: perception cleanliness — no roster/position token in policy.
{
  const src = fs.readFileSync(path.join(__dirname, 'policies', 'sortieretry.js'), 'utf8');
  const banned = ['lingeringRaiders', 'worldMonsters', 'worldArray', 'monsterAt', 'tileMonsters'];
  const hits = banned.filter(t => src.includes(t));
  check('policy cleanliness (no roster tokens)', hits.length === 0, 'hits: ' + hits.join(','));
}

// Leg 7: fresh offer after an invalidation is answerable (queue not stuck).
{
  const { Game, calls } = fakeGame([{ ok: false, why: 'none' }, { ok: true, fought: [{ key: 'lingZ' }] }]);
  const p = SR.withQueueRetry({}, 't', 't');
  const ctx = { sortieretry: { queue: [{ key: 'lingOld', day: 1, name: 'Old', enqueuedDay: 1 }], seen: {}, calls: [], invalidations: 0 } };
  Game.state.lastLingererOffer = null;
  runDaily(p, Game, ctx);
  check('invalidation then empty', ctx.sortieretry.queue.length === 0, '');
  Game.state.scholar.day = 2;
  Game.state.lastLingererOffer = { key: 'lingZ', name: 'New', day: 2 };
  runDaily(p, Game, ctx);
  check('fresh offer answered after invalidation', calls.length === 2 && calls[1].key === 'lingZ', JSON.stringify(calls));
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
