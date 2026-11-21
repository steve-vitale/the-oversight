#!/usr/bin/env node
// test-namebeast-told-unkicked-r152-20261121.js — PROOF for journey-landing r152:
// "what are we calling that thing?" must open the beast just told about,
// even when that beast's naming debate hasn't kicked yet.
//
// PANEL-CAUGHT (r152, seeds 1332-1341): 27 of 43 tellbeast->namebeast pairs
// opened a DIFFERENT beast than the one just told about (r151: 17/31 —
// a standing shape, not a new regression). Root cause: telling adds ONE
// knower, but monsterNewsCheck kicks the naming debate at THREE knowers,
// so the told beast's debate usually isn't kicked at tell time — and
// namebeast only opens kicked debates. The r25 fix (sort by namingKickSeq)
// only helps when the told beast's debate already kicked; the live shape
// is the told beast UNkicked. E.g. 1336 d11: scholar tells Ingrid about
// the belltoad ("a toad like a war drum") — 2 knowers, debate unkicked —
// then asks "what are we calling that thing?" and Ingrid answers about
// the gallowdeer ("the thing with headlights for eyes"), an older kicked
// debate. The transcript reads as one conversation about one beast; the
// pivot is never signaled.
//
// FIX (game.js): tellbeast records the told beast on the codex
// (lastToldBeast, day-stamped); namebeast, asked the same day about a
// reported-but-unnamed beast, kicks that beast's debate on the spot —
// the player asking to name it IS the village starting the argument —
// and opens it first (fresh kick seq sorts highest; an already-kicked
// told beast is moved to the front). No-tell and already-named paths
// are unchanged.
//
// RED: pre-fix -> namebeast opens the older kicked debate (gallowdeer).
// GREEN: fix -> namebeast opens the just-told beast (belltoad), kicked.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

const SEED = parseInt(process.env.SEED || '9102', 10);
let pass = 0, fail = 0;
function ok(cond, name) { if (cond) pass++; else { fail++; console.error('FAIL:', name); } }

async function main() {
  const { Game } = await loadGame({ seed: SEED, mode: 'namebeast-told-unkicked-proof' });
  await setupGame(Game);
  const v = Game.state.village || {};
  const roster = (v.roster || []).filter(id => id !== Game.villagerId);
  ok(roster.length > 0, 'roster non-empty');
  const vid = roster[0];
  const scholarId = (Game.state.scholar || {}).villagerId || 'player';

  const said = [];
  const origSay = Game.say.bind(Game);
  Game.say = (line) => { said.push(String(line)); try { return origSay(line); } catch (e) { return null; } };

  function entry(mid) { return Game.ensureMonsterEntry(mid); }

  // Y (gallowdeer): older kicked debate, unnamed — the wrong answer.
  const y = entry('gallowdeer');
  y.reported = true; y.knowers = [scholarId, roster[1] || 'other1', roster[2] || 'other2'];
  Game.kickMonsterNaming('gallowdeer');
  // X (belltoad): reported, ONE knower (the scholar) — below the 3-knower
  // kick threshold, debate NOT kicked, unnamed — the beast about to be told.
  const x = entry('belltoad');
  x.reported = true; x.knowers = [scholarId];
  ok(!x.namingKicked, 'belltoad debate NOT kicked before telling');
  ok(!x.villageName, 'belltoad unnamed before telling');

  // --- the live shape: tell about X, then ask what we're calling it ---
  said.length = 0;
  const tell = Game.askAbout(vid, 'tellbeast');
  ok(tell && tell.ok, 'tellbeast ran');
  ok(/war drum/i.test(said.join(' ')), 'tellbeast told about the belltoad: ' + said.join(' ').slice(0, 120));
  ok((x.knowers || []).length === 2, 'telling added the listener as 2nd knower (still below kick threshold)');
  ok(!x.namingKicked, 'belltoad debate STILL unkicked after telling (threshold is 3)');

  said.length = 0;
  const res = Game.askAbout(vid, 'namebeast');
  ok(res && res.ok && res.naming, 'namebeast returned a naming result');
  ok(res.naming.mid === 'belltoad', 'namebeast opened the just-told beast (belltoad), got ' + (res.naming && res.naming.mid));
  ok(/war drum/i.test(said.join(' ')), 'opened line describes the toad: ' + said.join(' ').slice(0, 120));
  ok(!/headlights/i.test(said.join(' ')), 'opened line is NOT about the older gallowdeer debate');
  ok(x.namingKicked, 'belltoad debate kicked by the naming question');

  // --- control A: no telling in this sitting -> most-recent kicked debate (unchanged) ---
  const { Game: G2 } = await loadGame({ seed: SEED + 1, mode: 'namebeast-told-unkicked-proof-ctl' });
  await setupGame(G2);
  const r2 = (G2.state.village.roster || []).filter(id => id !== G2.villagerId);
  const s2 = (G2.state.scholar || {}).villagerId || 'player';
  const y2 = G2.ensureMonsterEntry('gallowdeer');
  y2.reported = true; y2.knowers = [s2, r2[1] || 'o1', r2[2] || 'o2'];
  G2.kickMonsterNaming('gallowdeer');
  const x2 = G2.ensureMonsterEntry('belltoad');
  x2.reported = true; x2.knowers = [s2];
  const res2 = G2.askAbout(r2[0], 'namebeast');
  ok(res2 && res2.naming && res2.naming.mid === 'gallowdeer',
    'control A (no tell): namebeast still opens the kicked debate, got ' + (res2.naming && res2.naming.mid));

  // --- control B: told beast already named -> falls through to the kicked debate ---
  const { Game: G3 } = await loadGame({ seed: SEED + 2, mode: 'namebeast-told-unkicked-proof-ctl2' });
  await setupGame(G3);
  const r3 = (G3.state.village.roster || []).filter(id => id !== G3.villagerId);
  const s3 = (G3.state.scholar || {}).villagerId || 'player';
  const said3 = [];
  const origSay3 = G3.say.bind(G3);
  G3.say = (line) => { said3.push(String(line)); try { return origSay3(line); } catch (e) { return null; } };
  const y3 = G3.ensureMonsterEntry('gallowdeer');
  y3.reported = true; y3.knowers = [s3, r3[1] || 'o1', r3[2] || 'o2'];
  G3.kickMonsterNaming('gallowdeer');
  const x3 = G3.ensureMonsterEntry('belltoad');
  x3.reported = true; x3.knowers = [s3]; x3.villageName = 'Big Toad';
  G3.askAbout(r3[0], 'tellbeast');
  const res3 = G3.askAbout(r3[0], 'namebeast');
  ok(res3 && res3.naming && res3.naming.mid === 'gallowdeer',
    'control B (told beast already named): namebeast falls through to the kicked debate, got ' + (res3.naming && res3.naming.mid));

  console.log(`\nnamebeast-told-unkicked: ${pass} pass, ${fail} fail (seed ${SEED})`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(2); });
