#!/usr/bin/env node
// test-predation-instrument-20261014.js — proof test for the PANTRY-PREDATION
// diagnostic instrument (ARM 3, loop B, 2026-10-14). INSTRUMENT ONLY — no
// game-code changes. The instrument is scripts/predation-lib-20261014.js.
//
// PART A (fixture): forced gorge — a lingering Cancellation at the haven
//   tile with a stocked pantry → havenGrowthDaily() must record: one gorge
//   night, the monster id + wave 5, got kcal > 0 within [500,1500], pantry
//   reduced by exactly got, the transcript beat captured.
// PART B (fixture): drive-off outcomes — a killed lingering monster closes
//   as 'killed'; a lingering=false monster closes as 'moved-on'; gorge
//   nights + kcal attributed to the episode.
// PART C (live honesty): s44 120d with wraps vs without — per-day state
//   hashes must be BYTE-IDENTICAL (the r27 instrument-honesty pattern;
//   s44 was an IDENTICAL det-gate seed in r27, so divergence is harness
//   noise, not the instrument).
//
// Usage: node scripts/test-predation-instrument-20261014.js
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { installPredation, finalizePredation, pantryKcal } = require('./predation-lib-20261014');

let passed = 0, failed = 0;
function check(name, cond, extra) {
  if (cond) { passed++; }
  else { failed++; process.stderr.write('  FAIL ' + name + (extra ? ' — ' + extra : '') + '\n'); }
}
function dayHash(Game) {
  try {
    const s = (Game.state || {}).scholar || {}, v = (Game.state || {}).village || {};
    let standing = 0;
    try { standing = Math.round(((Game.villageStanding ? Game.villageStanding() : null) || {}).total || 0); } catch (e) {}
    return [s.day, Math.round(s.health || 0), Math.round(s.kcal || 0),
      (v.roster || []).length,
      Math.round(pantryKcal(Game) / 100), standing].join('|');
  } catch (e) { return 'ERR'; }
}
function havenTile(Game) {
  const v = Game.state.village || {};
  return { x: (v.px !== undefined && v.px !== null) ? v.px : 4,
           y: (v.py !== undefined && v.py !== null) ? v.py : 4 };
}
function addLingering(Game, id, hp) {
  const { x, y } = havenTile(Game);
  const m = { id, key: 'pred-test-' + id + '-' + Math.floor(Math.random() * 1e9),
              lingering: true, hp: hp || 1200, tx: x, ty: y, mx: x, my: y };
  Game.worldMonsters().push(m);
  return m;
}
function stockPantry(Game, kcal) {
  Game.state.village.pantry = [{ name: 'smoked test meat', kcalEach: 500, units: Math.ceil(kcal / 500), foodState: 'preserved' }];
}

async function partA() {
  console.log('PART A — forced gorge fixture');
  const { Game } = await loadGame({ seed: 42, mode: 'predation', fullTelemetry: false });
  await setupGame(Game);
  const track = installPredation(Game);
  stockPantry(Game, 20000);
  const pan0 = pantryKcal(Game);
  check('pantry stocked', pan0 >= 19000, 'got ' + pan0);
  const m = addLingering(Game, 'cancellation', 1200);
  check('monster lingering at haven', !!Game.worldMonsters().find(x => x === m && x.lingering));
  Game.havenGrowthDaily();
  check('one gorge night recorded', track.gorgeNights.length === 1,
    'got ' + track.gorgeNights.length);
  const gn = track.gorgeNights[0];
  check('gorge event count', gn && gn.events.length === 1, 'got ' + (gn && gn.events.length));
  const ev = gn && gn.events[0];
  check('monster id captured', ev && ev.id === 'cancellation', 'got ' + (ev && ev.id));
  check('wave 5 captured', ev && ev.wave === 5, 'got ' + (ev && ev.wave));
  check('got in [500,1500]', ev && ev.got >= 500 && ev.got <= 1500, 'got ' + (ev && ev.got));
  check('asked in [500,1500]', ev && ev.asked >= 500 && ev.asked <= 1500, 'asked ' + (ev && ev.asked));
  const pan1 = pantryKcal(Game);
  check('pantry reduced by exactly got', pan1 === pan0 - ev.got, pan0 + ' -> ' + pan1 + ' (got ' + ev.got + ')');
  const beat = track.sayBeats.find(b => /gorges at the treeline/.test(b.text));
  check('transcript beat captured', !!beat, 'beats: ' + track.sayBeats.length);
  check('beat names the drive-off verbs', !!beat && /Drive it off/i.test(beat.text),
    beat ? beat.text.slice(0, 120) : 'none');
  check('no instrument errors', track.instrErrors.length === 0, track.instrErrors.join('; '));
  return { Game, track, m, gn };
}

async function partB() {
  console.log('PART B — drive-off outcome fixture');
  const { Game } = await loadGame({ seed: 43, mode: 'predation', fullTelemetry: false });
  await setupGame(Game);
  const track = installPredation(Game);
  stockPantry(Game, 20000);
  // Episode 1: gorges two nights, then KILLED.
  const m1 = addLingering(Game, 'cancellation', 1200);
  track.sampleDay();
  Game.havenGrowthDaily(); track.sampleDay();
  Game.havenGrowthDaily(); track.sampleDay();
  check('two gorge nights recorded', track.gorgeNights.length === 2,
    'got ' + track.gorgeNights.length);
  m1.hp = 0;
  Game.removeWorldMonster(m1);
  track.sampleDay();
  // Episode 2: gorges once, then the crisis drifts — lingering cleared alive.
  const m2 = addLingering(Game, 'spoiler', 1400);
  Game.havenGrowthDaily(); track.sampleDay();
  m2.lingering = false;
  track.sampleDay();
  const fin = finalizePredation(Game, track);
  const eps = fin.episodes;
  check('two episodes reconstructed', eps.length === 2, 'got ' + eps.length);
  const killed = eps.find(e => e.id === 'cancellation');
  const moved = eps.find(e => e.id === 'spoiler');
  check('killed episode closes as killed', killed && killed.resolution === 'killed',
    killed && killed.resolution);
  check('moved-on episode closes as moved-on', moved && moved.resolution === 'moved-on',
    moved && moved.resolution);
  check('killed episode: 2 gorge nights', killed && killed.gorgeNights === 2,
    killed && killed.gorgeNights);
  check('killed episode: kcal attributed', killed && killed.gorgeKcal > 1000,
    killed && killed.gorgeKcal);
  check('moved-on episode: 1 gorge night', moved && moved.gorgeNights === 1,
    moved && moved.gorgeNights);
  check('no instrument errors', track.instrErrors.length === 0, track.instrErrors.join('; '));
}

async function runShort(seed, useWraps, hashes) {
  const { Game } = await loadGame({ seed, mode: 'predation', fullTelemetry: false });
  await setupGame(Game);
  let track = null;
  if (useWraps) track = installPredation(Game);
  const policy = {
    id: 'honesty-idle',
    daily(G) { try { if (track) track.sampleDay(); } catch (e) {} hashes.push(dayHash(G)); },
  };
  await runDays(Game, policy, { days: 120, manifest: { policy: 'honesty-idle', seed } });
  return track;
}

async function partC() {
  console.log('PART C — live honesty: wraps vs no-wraps byte-identical (s44, 120d)');
  const hOn = [], hOff = [];
  const t1 = await runShort(44, true, hOn);
  const t2 = await runShort(44, false, hOff);
  check('same day count sampled', hOn.length === hOff.length && hOn.length >= 30,
    hOn.length + ' vs ' + hOff.length);
  let diffs = 0, firstDiff = -1;
  for (let i = 0; i < Math.min(hOn.length, hOff.length); i++) {
    if (hOn[i] !== hOff[i]) { diffs++; if (firstDiff < 0) firstDiff = i; }
  }
  check('per-day state hashes byte-identical', diffs === 0,
    diffs + ' diffs, first at sample ' + firstDiff);
  check('no instrument errors (wraps run)', t1 && t1.instrErrors.length === 0,
    t1 ? t1.instrErrors.join('; ') : 'no track');
}

(async () => {
  await quietLog(async () => {
    await partA();
    await partB();
  });
  await partC();
  console.log('\n' + passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error('HARNESS FAILURE', e); process.exit(2); });
