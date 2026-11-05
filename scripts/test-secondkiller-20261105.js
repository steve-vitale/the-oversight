// test-secondkiller-20261105.js — proof for the secondkiller instrument,
// driver, and analyzer (arm sim-secondkiller-b). Fixture tests (fake Game
// wrappers + analyzer splits) + live harness smoke + off/on neutrality leg
// (driver subprocesses into /tmp, never into evidence/). Exit non-zero on
// any failure.
// Usage: node scripts/test-secondkiller-20261105.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const AN = require(path.join(REPO, 'scripts', 'secondkiller-analyze-20261105'));
const INST = require(path.join(REPO, 'scripts', 'secondkiller-instrument-20261105'));

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}

// ---- fake-Game instrument fixtures ----
function fakeGame() {
  const persons = {
    leader: { equipped: { melee: { itemId: 'shard_spear' }, armor: { itemId: 'bark_armor' } } },
    ally1: { equipped: { melee: { itemId: 'shard_spear' }, armor: null } },
    k1: { equipped: {} },
  };
  const G = {
    villagerId: 'leader',
    data: {
      monsters: [{ id: 'w4a', wave: 4 }, { id: 'w3a', wave: 3 }],
      items: [{ id: 'bark_armor', armor: { protection: 10 } }, { id: 'shard_spear', weapon: { bonus: 25 } }],
      villagers: [], background_survivors: [],
    },
    state: { scholar: { day: 50 }, waveKillLog: [{ d: 10, mid: 'w4a', w: 4, by: 'k1', via: 'field' }], village: { fallen: [], roster: ['leader', 'ally1', 'k1'], health: {} } },
    map: { px: 4, py: 4 },
    getPerson: function (id) { return persons[id] || null; },
    playerAtHaven: function () { return true; },
    tbfight: null,
    fieldFight: function (vid, mdef, m, opts) {
      return { outcome: 'mFlee', rounds: 6, mDealt: 300, allyDealt: 50, vTaken: 20, mHpLeft: 650, packCount: 1, log: [], partySize: 2, allyVid: 'ally1', intent: 'engage', intentWhy: 'party', trickLog: ['shout'] };
    },
    startCombat: function (mid) { G.tbfight = { round: 1, fighters: [{ kind: 'villager', villagerId: 'leader', hp: 80 }, { kind: 'monster', monsterId: 'w4a', mdef: { id: 'w4a' }, hp: 900 }] }; return true; },
    tbPlayerStrike: function () { return true; },
    useAbility: function () { return true; },
    tbEnd: function () { return true; },
    recordWaveKill: function () { return true; },
    playerDeath: function () { return true; },
  };
  return G;
}

(function () {
  const G = fakeGame();
  const inst = INST.install(G);
  check('install-no-errors', inst.t.instrumentErrors.length === 0, JSON.stringify(inst.t.instrumentErrors));
  G.fieldFight('leader', { id: 'w4a', wave: 4 }, { id: 'w4a', hp: 1000 }, { allies: 1, allyVids: ['ally1'] });
  check('field-wave4-recorded', inst.t.fights.length === 1, 'n=' + inst.t.fights.length);
  const f = inst.t.fights[0];
  check('field-party-damage', f.partySize === 2 && f.allyVid === 'ally1' && f.damageDealt === 350 && Math.abs(f.damageFrac - 0.35) < 1e-9,
    JSON.stringify({ partySize: f.partySize, damageDealt: f.damageDealt, damageFrac: f.damageFrac }));
  check('field-second-candidate', f.secondCandidatePresent === true && f.secondCandidates.indexOf('leader') >= 0 && f.firstKiller === 'k1' && f.firstKillerAliveAtStart === true && f.firstKillerInFight === false,
    JSON.stringify({ sc: f.secondCandidates, fk: f.firstKiller, alive: f.firstKillerAliveAtStart }));
  check('field-gear', f.gear && f.gear.weaponId === 'shard_spear' && f.gear.weaponBonus === 25 && f.gear.armorP === 10,
    JSON.stringify(f.gear));
  check('field-ending', f.ending === 'flee' && f.outcomeRaw === 'mFlee' && f.swingsAttempted === 6);
  // Wave-3 fight must NOT be recorded (full records are wave-4+ only).
  G.fieldFight('leader', { id: 'w3a', wave: 3 }, { id: 'w3a', hp: 300 }, {});
  check('field-wave3-skipped', inst.t.fights.length === 1, 'n=' + inst.t.fights.length);
  // TB fight: won without a kill-log row must NOT become a kill (analyzer
  // rule; here: the record's ending is kill-or-rout, not kill).
  G.startCombat('w4a');
  G.tbPlayerStrike('m_0'); G.tbPlayerStrike('m_0');
  G.useAbility('bird_strike', 'strike');
  G.tbfight.fighters[1].hp = 400; G.tbfight.round = 3;
  G.tbEnd('won');
  check('tb-recorded', inst.t.fights.length === 2, 'n=' + inst.t.fights.length);
  const tb = inst.t.fights[1];
  check('tb-fields', tb.channel === 'player-tb' && tb.ending === 'kill-or-rout' && tb.swingsAttempted === 2 &&
    tb.damageDealt === 500 && Math.abs(tb.damageFrac - 500 / 900) < 1e-9 &&
    tb.abilitiesUsed.indexOf('bird_strike') >= 0 && tb.secondCandidatePresent === true,
    JSON.stringify(tb));
  inst.uninstall();
  check('uninstall-restores', G.fieldFight('leader', { id: 'w4a', wave: 4 }, { id: 'w4a', hp: 1000 }, {}).outcome === 'mFlee' && inst.t.fights.length === 2);
})();

// ---- analyzer fixtures ----
function arow(seed, opts) {
  const r = { seed: seed, run: 'fixture', days: 100, endReason: 'horizon', won: false,
    fights: [], daily: [{ day: 1, gated: 0, readiness5: { veterans: 0 } }],
    waveKillLog: [], fallen: [], wavesFaced: {}, instrumentErrors: [], deadMap: {},
    scaleRank: 'village', unlockedWave: 1, maxWave: 1 };
  return Object.assign(r, opts || {});
}
function ffight(o) {
  return Object.assign({ day: 20, channel: 'field', fighter: 'leader', fighters: ['leader'], mid: 'w4a', wave: 4,
    entryHp: 1000, damageDealt: 200, damageFrac: 0.2, rounds: 5, swingsAttempted: 5, partySize: 1,
    firstKiller: 'k1', firstKillerAliveAtStart: true, firstKillerInFight: false,
    secondCandidatePresent: true, secondCandidates: ['leader'], ending: 'flee', outcomeRaw: 'mFlee',
    gear: { weaponBonus: 25, armorP: 10 } }, o || {});
}
(function () {
  const r = arow(1, {
    fights: [ffight({ day: 20 }), ffight({ day: 21, partySize: 2, fighters: ['leader', 'ally1'], ending: 'kill', outcomeRaw: 'vKill' }), ffight({ day: 22, channel: 'player-tb', ending: 'kill-or-rout', outcomeRaw: 'won' })],
    waveKillLog: [{ d: 21, mid: 'w4a', w: 4, by: 'leader', via: 'field' }],
  });
  const s = AN.analyzeSeed(JSON.parse(JSON.stringify(r)));
  check('analyzer-match-one-kill', s.w4killsMatched === 1 && s.unmatchedKills === 0 && s.killRate === 1 / 3,
    JSON.stringify({ matched: s.w4killsMatched, unmatched: s.unmatchedKills, rate: s.killRate }));
  check('analyzer-tb-won-not-kill', s.fights[2].matchedKillBy == null && s.fights[1].matchedKillBy === 'leader' && s.fights[1].matchedKillFirst === true,
    JSON.stringify(s.fights.map(function (f) { return f.matchedKillBy; })));
  check('analyzer-splits', s.splits['party:solo'].fights === 2 && s.splits['party:leader+1'].fights === 1 &&
    s.splits['secondCand:present'].fights === 3 && s.splits['alive:alive'].fights === 3,
    JSON.stringify(s.splits));
  const s2 = AN.analyzeSeed(JSON.parse(JSON.stringify(r)));
  check('analyzer-determinism', JSON.stringify(s) === JSON.stringify(s2));
})();
(function () {
  // Exposure signal: kills only when no first killer lives.
  const dir = '/tmp/secondkiller-analyzer-' + process.pid;
  fs.mkdirSync(dir, { recursive: true });
  const mk = function (seed, fights, log) {
    return arow(seed, { fights: fights, waveKillLog: log, daily: [{ day: 1, gated: 0, readiness5: { veterans: 0 } }] });
  };
  fs.writeFileSync(dir + '/secondkiller-s1-fixture.json', JSON.stringify(mk(1,
    [ffight({ day: 20, firstKillerAliveAtStart: true, ending: 'flee' }), ffight({ day: 21, firstKillerAliveAtStart: false, ending: 'kill', outcomeRaw: 'vKill' })],
    [{ d: 21, mid: 'w4a', w: 4, by: 'leader', via: 'field' }])));
  const out = AN.analyzeDir(dir);
  check('analyzer-exposure-signal', out.signals.exposureRotation.killRateFirstAlive === 0 && out.signals.exposureRotation.killRateFirstNotAlive === 1,
    JSON.stringify(out.signals.exposureRotation));
  try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) {}
})();

async function liveLegs() {
  const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
  const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
  const { Game } = await loadGame({ seed: 99151, mode: 'competent-secondkiller-proof', fullTelemetry: false });
  await setupGame(Game);
  const inst = INST.install(Game);
  let last = -1;
  const wrapped = Object.assign({}, competent, {
    daily: function (Gm, ctx) {
      try { return competent.daily(Gm, ctx); } finally {
        const d = ((Game.state || {}).scholar || {}).day || 0;
        if (d !== last) { last = d; inst.snapshot(); }
      }
    },
  });
  let result = null;
  await quietLog(async function () { result = await runDays(Game, wrapped, { days: 5, manifest: undefined, sampleEvery: 30 }); });
  inst.snapshot();
  const fin = inst.finalize();
  inst.uninstall();
  check('live-smoke', result && result.days > 0 && inst.t.daily.length > 0 && inst.t.instrumentErrors.length === 0 && Array.isArray(fin.waveKillLog),
    'days=' + (result && result.days) + ' snaps=' + inst.t.daily.length + ' errs=' + JSON.stringify(inst.t.instrumentErrors));

  const tmp = '/tmp/secondkiller-proof-' + process.pid;
  fs.mkdirSync(tmp, { recursive: true });
  const envBase = Object.assign({}, process.env, { REPO: REPO, DAYS: '10', SEEDS: '99151', OUTDIR: tmp });
  execSync('node scripts/secondkiller-driver-20261105.js', { cwd: REPO, env: Object.assign({}, envBase, { RUN: 'proof-off', SECONDKILLER_OFF: '1' }), stdio: 'pipe' });
  execSync('node scripts/secondkiller-driver-20261105.js', { cwd: REPO, env: Object.assign({}, envBase, { RUN: 'proof-on' }), stdio: 'pipe' });
  const off = JSON.parse(fs.readFileSync(path.join(tmp, 'secondkiller-s99151-proof-off.json'), 'utf8'));
  const on = JSON.parse(fs.readFileSync(path.join(tmp, 'secondkiller-s99151-proof-on.json'), 'utf8'));
  check('neutrality-off-on', off.days === on.days && off.endReason === on.endReason &&
    (off.waveKillLog || []).length === (on.waveKillLog || []).length &&
    on.instrumentErrors.length === 0,
    'off=' + off.days + '/' + off.endReason + '/' + (off.waveKillLog || []).length +
    ' on=' + on.days + '/' + on.endReason + '/' + (on.waveKillLog || []).length +
    ' errs=' + JSON.stringify(on.instrumentErrors));
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}

  console.log(pass + '/' + (pass + fail) + ' PASS');
  process.exit(fail ? 1 : 0);
}
liveLegs().catch(function (e) { console.error(e.stack); process.exit(1); });
