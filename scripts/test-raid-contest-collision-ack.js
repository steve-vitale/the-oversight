#!/usr/bin/env node
// test-raid-contest-collision-ack.js — RAID COLLISION ACK proof (journey crisis r40 2026-10-21).
// BEFORE: a contest announced on a raid day, or a raid firing the day after a
// contest announcement, landed as two completely separate beats — 3/3 pilot
// collisions, sayLog + transcript verified, zero lines acknowledged the overlap.
// AFTER: both directions emit one connective line, once per collision day.
// Usage: node scripts/test-raid-contest-collision-ack.js
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { oracleV2 } = require('./policies/oracleV2');

async function main() {
  const fails = [];
  const ok = (name, cond, detail) => {
    console.log((cond ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ' — ' + detail : ''));
    if (!cond) fails.push(name);
  };
  const { Game } = await loadGame({ seed: 7, mode: 'raid-collision-ack-proof', fullTelemetry: true });
  await setupGame(Game);
  Game.state.systemArrived = true; // sysSay is silent pre-System by design
  await runDays(Game, oracleV2, { days: 15 });
  const day = (Game.state.scholar || {}).day || 1;
  const v = Game.state.village || {};

  const lines = [];
  const _say = Game.say, _sys = Game.sysSay;
  Game.say = function (m) { lines.push(String(m)); return _say ? _say.apply(this, arguments) : undefined; };
  Game.sysSay = function (m) { lines.push(String(m)); return _sys ? _sys.apply(this, arguments) : undefined; };
  const ackRe = /watched the raid too|still torn up from the raid/i;

  // ---- DIRECTION 1: contest announced on a raid day (System voice) ----
  lines.length = 0;
  v.lastRaidDay = day; v._raidContestAckDay = undefined;
  const pit = Game.contestPool().find(c => c.id === 'pit');
  if (!pit) { console.log('FAIL contest pool missing pit'); process.exit(1); }
  Game.fireContest(pit);
  ok('contest-on-raid-day emits System ack', lines.some(l => /watched the raid too/.test(l)), `captured ${lines.length} lines`);

  // Once per day: a second fire same day must not repeat the line
  const n1 = lines.filter(l => ackRe.test(l)).length;
  Game.fireContest(pit);
  const n2 = lines.filter(l => ackRe.test(l)).length;
  ok('ack fires once per day', n2 === n1, `${n1} -> ${n2}`);

  // Negative control: raid 10 days ago -> no ack
  lines.length = 0;
  v.lastRaidDay = day - 10; v._raidContestAckDay = undefined;
  Game.fireContest(pit);
  ok('no ack when raid was 10 days ago', !lines.some(l => ackRe.test(l)));

  // ---- DIRECTION 2: raid fires the day after a contest announcement (village voice) ----
  lines.length = 0;
  v.lastRaidDay = day - 10; v._raidContestAckDay = undefined;
  v.lastContest = { day, name: 'The Pit', ids: [], died: [] };
  Game.state.worldMonsters = Game.state.worldMonsters || [];
  while (Game.state.worldMonsters.length < 3)
    Game.state.worldMonsters.push({ id: 'proof_' + Game.state.worldMonsters.length, tx: 0, ty: 0, hp: 50, maxHp: 50 });
  v.pantry = v.pantry || [];
  v.pantry.push({ id: 'proofmeal', kcalEach: 5000, units: 1 });
  let fired = false;
  for (let i = 0; i < 60 && !fired; i++) { try { fired = !!Game.havenRaidTick(); } catch (e) { break; } }
  ok('raid fired under forced conditions', fired);
  ok('raid-on-contest-day emits village ack', lines.some(l => /still torn up from the raid/.test(l)));

  Game.say = _say; Game.sysSay = _sys;
  if (fails.length) { console.log('FAILURES: ' + fails.join(', ')); process.exit(1); }
  console.log('ALL GREEN');
}

main().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
