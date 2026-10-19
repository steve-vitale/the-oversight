#!/usr/bin/env node
'use strict';
// Actual pantry-predation receipts and independent observer-neutrality proofs.
// Every fixture/arm gets one shared-harness world in a separate process.
const assert = require('assert');
const { createHash } = require('crypto');
const { execFileSync } = require('child_process');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { installPredation, finalizePredation, pantryKcal } = require('./predation-lib-20261014');
let passed = 0;
function check(name, condition, detail) { assert(condition, name + (detail ? ' — ' + detail : '')); passed++; console.log('  ok ' + name); }
const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
function snapshot(Game) { return digest({ state: Game.state, over: Game.over, won: Game.won,
  dayPart: Game.dayPart, villagerId: Game.villagerId, tbfight: Game.tbfight,
  pendingEncounter: Game.pendingEncounter }); }
function child(kind, extra = {}) {
  const stdout = execFileSync(process.execPath, [__filename], { env: { ...process.env,
    PREDATION_CHILD: kind, ...extra }, encoding: 'utf8', maxBuffer: 8e6 });
  const line = stdout.split('\n').find(line => line.startsWith('PREDATION_RESULT '));
  assert(line, 'child result ' + kind);
  process.stdout.write(stdout.split('\n').filter(line => !line.startsWith('PREDATION_RESULT ')).join('\n'));
  const result = JSON.parse(line.slice('PREDATION_RESULT '.length)); passed += result.checks || 0;
  return result;
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
  const { Game } = await loadGame({ seed: Number(process.env.SEED || 42), mode: 'predation', fullTelemetry: false });
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
  check('beat names Endure and a costly sortie', !!beat && /Endure it/.test(beat.text) && /send a sortie: fighters, rations, real risk/.test(beat.text),
    beat ? beat.text.slice(0, 120) : 'none');
  check('no instrument errors', track.instrErrors.length === 0, track.instrErrors.join('; '));
  const beforeEndure = pantryKcal(Game), hp = m.hp;
  check('actual Endure answer succeeds', Game.answerLingerer('endure') === 'endured');
  check('Endure keeps the live raider and current pantry', m.lingering && m.hp === hp && pantryKcal(Game) === beforeEndure);
  Game.havenGrowthDaily();
  check('next gorge still costs real pantry food', track.gorgeNights.length === 2 && pantryKcal(Game) === beforeEndure - track.gorgeNights[1].totalGorged && track.gorgeNights[1].totalGorged > 0);
  check('Endure decision captured once without claiming a fight', track.lingererAnswers.length === 1 && track.lingererAnswers[0].how === 'endure' && track.lingererAnswers[0].result === 'endured' && track.fieldFights.length === 0);
  check('Endure response survives finalization', finalizePredation(Game, track).lingererAnswers.length === 1);
}

async function partB() {
  console.log('PART B — drive-off outcome fixture');
  const { Game } = await loadGame({ seed: Number(process.env.SEED || 43), mode: 'predation', fullTelemetry: false });
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
  check('killed episode: exact kcal receipts attributed', killed && killed.gorgeKcal === track.gorgeNights[0].totalGorged + track.gorgeNights[1].totalGorged && killed.gorgeKcal >= 1000 && killed.gorgeKcal <= 3000,
    killed && killed.gorgeKcal);
  check('moved-on episode: 1 gorge night', moved && moved.gorgeNights === 1,
    moved && moved.gorgeNights);
  check('no instrument errors', track.instrErrors.length === 0, track.instrErrors.join('; '));
}


async function observedRun(kind) {
  const seed = Number(process.env.SEED || 44);
  const { Game, loadFails } = await loadGame({ seed, mode: 'predation-honesty' });
  assert.equal(loadFails.length, 0, 'no module load failures');
  await setupGame(Game);
  if (kind === 'response') {
    stockPantry(Game, 20000); addLingering(Game, 'cancellation', 1200);
    Game.state.village.roster = [Game.villagerId]; // prepared empty defense bench
  }
  if (kind === 'sortie' || kind === 'risk') {
    stockPantry(Game, 20000); addLingering(Game, 'herald', kind === 'risk' ? 700 : 1);
  }
  const fights = [];
  const originalFight = Game.fieldFight;
  Game.fieldFight = function () {
    const result = originalFight.apply(this, arguments);
    fights.push({ outcome: result.outcome, rounds: result.rounds, vTaken: result.vTaken, logLines: (result.log || []).length });
    return result;
  };
  const track = process.env.PREDATION_ARMED === '1' ? installPredation(Game) : null;
  const hashes = [snapshot(Game)], warnings = [], warn = console.warn;
  console.warn = (...args) => { warnings.push(args.map(String).join(' ')); warn(...args); };
  let result;
  try {
    if (kind === 'response') {
      assert.equal(Game.answerLingerer('endure'), 'endured'); hashes.push(snapshot(Game));
      Game.havenGrowthDaily(); hashes.push(snapshot(Game));
      const refusal = Game.answerLingerer('sortie');
      assert(refusal && !refusal.ok && refusal.why === 'no-fighters', 'real sortie refuses an empty defense bench');
      hashes.push(snapshot(Game));
      result = { days: 0, endReason: 'prepared-response' };
    } else if (kind === 'sortie' || kind === 'risk') {
      const before = pantryKcal(Game), response = Game.answerLingerer('sortie');
      assert(response && response.ok && response.paid === before - pantryKcal(Game), 'actual sortie pays its reported rations');
      assert(response.paid >= 6000, 'prepared sortie funds three fighters');
      assert(fights.length === 1 && fights[0].logLines >= 1, 'sortie plays one narrated fieldFight');
      if (kind === 'sortie') assert.equal(response.cleared, 1, 'wounded raider cleared');
      else assert(fights[0].rounds >= 1 && (fights[0].vTaken > 0 || response.broke), 'full-HP raider fights back');
      hashes.push(snapshot(Game)); result = { days: 0, endReason: 'prepared-sortie' };
    } else {
      const policy = { id: 'honesty-idle', daily(G) {
        if (track) track.sampleDay(); hashes.push(snapshot(G));
      } };
      await quietLog(async () => { result = await runDays(Game, policy, { days: 120, sampleEvery: 10 }); });
    }
  } finally { console.warn = warn; Game.fieldFight = originalFight; }
  hashes.push(snapshot(Game));
  return { seed, hashes, days: result.days, gameDays: result.gameDays, end: result.endReason,
    randomTail: Array.from({ length: 16 }, () => Math.random()), warnings,
    samples: track ? track.samples.length : 0,
    fights, answers: track ? track.lingererAnswers : [], errors: track ? track.instrErrors : [] };
}
async function main() {
  const task = process.env.PREDATION_CHILD;
  if (task) {
    Object.defineProperty(globalThis, 'performance', { configurable: true, value: { now: () => 0 } });
    let result;
    if (task === 'a' || task === 'b') {
      await quietLog(async () => { if (task === 'a') await partA(); else await partB(); });
      result = { checks: passed };
    } else result = await observedRun(task);
    console.log('PREDATION_RESULT ' + JSON.stringify(result)); return;
  }
  child('a'); child('b');
  for (const kind of ['response', 'sortie', 'risk', 'campaign']) {
    for (const seed of (kind === 'campaign' ? [7, 42, 44, 99] : kind === 'risk' ? [105] : [44])) {
      const off = child(kind, { SEED: String(seed), PREDATION_ARMED: '0' });
      const on = child(kind, { SEED: String(seed), PREDATION_ARMED: '1' });
      console.log('  neutrality receipt ' + JSON.stringify({ kind, off, on }));
      check(kind + ' seed ' + seed + ': all state snapshots match', digest(off.hashes) === digest(on.hashes));
      check(kind + ' seed ' + seed + ': RNG continuation matches', digest(off.randomTail) === digest(on.randomTail));
      check(kind + ' seed ' + seed + ': days and ending match', off.days === on.days && off.gameDays === on.gameDays && off.end === on.end);
      check(kind + ' seed ' + seed + ': no observer errors or warnings', on.errors.length === 0 && on.warnings.length === 0 && off.warnings.length === 0);
      if (kind === 'campaign') check('campaign observed at least 30 real days', on.samples >= 30);
      else if (kind === 'sortie') {
        check('successful sortie records actual funded use', on.answers.length === 1 && on.answers[0].ok === true && on.answers[0].paid >= 6000 && on.answers[0].cleared === 1);
        check('funded response records exact pantry cost', on.answers[0].paid === on.answers[0].pantryBefore - on.answers[0].pantryAfter);
        check('observer preserves actual played fight receipts', digest(off.fights) === digest(on.fights) && on.fights.length === 1);
      } else if (kind === 'risk') {
        check('costly risk records actual returned result', on.answers.length === 1 && on.answers[0].ok === true && on.answers[0].paid >= 6000 && typeof on.answers[0].broke === 'boolean');
        check('observer preserves full-HP fight and wounds', digest(off.fights) === digest(on.fights) && on.fights[0].rounds >= 1 && on.fights[0].vTaken > 0);
      } else {
        check('both real response choices recorded', on.answers.length === 2 && on.answers[0].how === 'endure' && on.answers[1].how === 'sortie');
        check('refused sortie never counted as success', on.answers[1].ok === false && on.answers[1].why === 'no-fighters' && on.answers[1].pantryBefore === on.answers[1].pantryAfter);
      }
    }
  }
  console.log(passed + ' passed, 0 failed');
}
main().catch(error => { console.error(error.stack); process.exitCode = 1; });
