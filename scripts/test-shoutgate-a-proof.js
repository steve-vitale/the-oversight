#!/usr/bin/env node
// scripts/test-shoutgate-a-proof.js — sim-shoutgate-a mechanism proof.
// Proves the FIRST-EXCHANGE SHOUT gate in fieldFights.js with direct
// fieldFight calls (no crew feed, no policy, no sim band): the fight's
// own opts.rng isolates every draw, so each fixture is deterministic
// for its PRNG seed — no seed-hunting flakiness, no trajectory noise.
//
// Fixtures (all with an ally named in opts.allyVids unless noted):
//   A. Catastrophic round 1 (wave-4 influencer, leader mauled below
//      half HP in the first exchange, losing the damage race) WITH
//      an ally present -> the shout fires IN ROUND 1 (log position),
//      calledHelp true, allyVid set, ally strikes (allyDealt > 0).
//   B. Same fixture, NO ally (allies 0) -> no shout line at all
//      (nobody to shout to); outcome stays vFlee/vDie in kind.
//   C. Non-catastrophic round 1 (wave-1 deer, healthy leader) WITH
//      an ally present -> NO round-1 shout (shout line absent, or
//      positioned at round >= 2). The round-1 gate is narrow, not a
//      general round-1 morale evaluation.
// The shout round is read from log POSITION: the shout line sits
// after the last "R<n>:" strike line of its round and before the
// next round's strikes, so the round is the last R-prefix seen
// before the shout line. (The shout line itself carries no R tag.)
'use strict';
const { loadGame, setupGame } = require('./sim-harness');
function fail(msg) { console.error('PROOF FAIL: ' + msg); process.exit(1); }
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function shoutRound(rec) {
  const log = rec.log || [];
  let round = 0; let found = 0;
  for (const line of log) {
    const m = /^R(\d+):/.exec(line);
    if (m) round = parseInt(m[1], 10);
    else if (line.indexOf('shouts for help!') >= 0) found = round;
  }
  return found;
}
async function main() {
  const { Game } = await loadGame({ seed: 75101, mode: 'shoutgate-a-proof', fullTelemetry: false });
  await setupGame(Game);
  const roster = ((Game.state.village || {}).roster || []).slice();
  const pool = [];
  for (const id of roster) {
    if (id === Game.villagerId) continue;
    try { const p = Game.getPerson(id); if (!p || p.dead) continue; } catch (e) { continue; }
    pool.push(id);
    if (pool.length >= 4) break;
  }
  if (pool.length < 2) fail('pool too small: ' + pool.length);
  const leader = pool[0], mate = pool[1];
  const defs = Game.data.monsters || [];
  const infl = defs.find(d => d && d.id === 'influencer');
  const deer = defs.find(d => d && d.id === 'highbeam_deer') || defs.find(d => d && (d.wave | 0) === 1);
  if (!infl) fail('no influencer def');
  if (!deer) fail('no wave-1 def');
  // NOTE: PRNG seeds below were chosen by the scratch probe
  // (scripts/test-shoutgate-a-probe.js, never committed): seed 8
  // yields a catastrophic round 1 for the influencer fixture.
  const recA = Game.fieldFight(leader, infl, { id: 'influencer', hp: 950, maxHp: 950 },
    { allies: 1, allyVids: [mate], rng: mulberry32(8) });
  const srA = shoutRound(recA);
  console.log(`A catastrophic-R1: outcome=${recA.outcome} rounds=${recA.rounds} calledHelp=${recA.calledHelp} allyVid=${recA.allyVid} allyDealt=${recA.allyDealt} vTaken=${recA.vTaken} mDealt=${recA.mDealt} shoutRound=${srA} vHpLeft=${recA.vHpLeft}`);
  if (srA !== 1) fail('A: expected round-1 shout, got shoutRound=' + srA);
  if (!recA.calledHelp || recA.allyVid !== mate) fail('A: shout fired but ally not joined: calledHelp=' + recA.calledHelp + ' allyVid=' + recA.allyVid);
  if ((recA.allyDealt | 0) <= 0) fail('A: ally never struck (allyDealt=' + recA.allyDealt + ') — shout-then-flee inflation, not a fought party');
  // B: solo control, same PRNG seed, no ally.
  const recB = Game.fieldFight(leader, infl, { id: 'influencer', hp: 950, maxHp: 950 },
    { allies: 0, allyVids: [], rng: mulberry32(8) });
  const srB = shoutRound(recB);
  console.log(`B solo control: outcome=${recB.outcome} rounds=${recB.rounds} calledHelp=${recB.calledHelp} shoutRound=${srB}`);
  if (srB !== 0 || recB.calledHelp) fail('B: solo fight shouted (shoutRound=' + srB + ')');
  // C: non-catastrophic round 1 (deer), ally present -> no round-1 shout.
  const recC = Game.fieldFight(leader, deer, { id: deer.id, hp: deer.hp ? deer.hp[1] : 160, maxHp: deer.hp ? deer.hp[1] : 160 },
    { allies: 1, allyVids: [mate], rng: mulberry32(0xC0FFEE) });
  const srC = shoutRound(recC);
  console.log(`C deer non-catastrophic: outcome=${recC.outcome} rounds=${recC.rounds} calledHelp=${recC.calledHelp} shoutRound=${srC} vTaken=${recC.vTaken}`);
  if (srC === 1) fail('C: round-1 shout fired on a non-catastrophic first exchange');
  console.log('PROOF-GREEN: catastrophic R1 shouts in round 1 with ally striking; solo never shouts; non-catastrophic R1 never shouts in round 1');
}
main().catch(e => { console.error(e); process.exit(1); });
