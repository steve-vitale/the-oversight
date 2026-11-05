// test-vetrest-20261105.js — proof for the vetrest mantle-skip lever
// (arm sim-vetrest-b). Per local-proof-of-effect, the proof demonstrates
// the OBSERVABLE EFFECT, not just green assertions: the skip firing
// changes who takes the Codex after a scholar's death (a different
// living villager becomes the scholar, named on camera), with the
// old-code control (flag off → the blooded killer takes it, as
// before). Plus: window-boundary fixtures, the never-strand fallback,
// analyzer verdict fixtures (GO / NO-GO + METRIC-BROKEN /
// CONCEPT-DEAD / UNDERPOWERED / INSUFFICIENT-DATA), live determinism
// and off/on neutrality legs, and a driver smoke leg into /tmp
// (never into evidence/). Exit non-zero on any failure.
// Usage: node scripts/test-vetrest-20261105.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const AN = require(path.join(REPO, 'scripts', 'vetrest-analyze-20261105'));
const KS = require(path.join(REPO, 'scripts', 'killersim-analyze-20261105'));

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}

// ---------- live-harness helpers ----------
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const INST = require(path.join(REPO, 'scripts', 'killerdeath-instrument-20261105'));

async function freshGame(seed) {
  const { Game } = await loadGame({ seed: seed, mode: 'competent-vetrest-proof', fullTelemetry: false });
  await setupGame(Game);
  return Game;
}

// Two living NPCs, A top-trust, B second. Returns {A, B}.
function twoNPCs(Game, trustA, trustB) {
  const v = Game.state.village || {};
  const roster = (v.roster || []).filter(function (id) { return id !== Game.villagerId; });
  if (roster.length < 2) throw new Error('need 2 NPCs, got ' + roster.length);
  const A = roster[0], B = roster[1];
  v.trust = v.trust || {};
  roster.forEach(function (id) { v.trust[id] = 0; });
  v.trust[A] = trustA; v.trust[B] = trustB;
  return { A: A, B: B };
}

function captureSay(Game) {
  const lines = [];
  const orig = Game.say;
  Game.say = function () {
    try { if (typeof arguments[0] === 'string') lines.push(String(arguments[0])); } catch (e) {}
    return orig.apply(this, arguments);
  };
  return lines;
}

// ---------- Part 1: the skip fires (observable effect) ----------
(async function () {
  // 1. Flag ON: the blooded top-trust killer is passed over; the
  // next-most-trusted takes the Codex; the skip is traced and said.
  {
    process.env.VETREST_MANTLE_SKIP = '1';
    const Game = await freshGame(99711);
    const lines = captureSay(Game);
    const npcs = twoNPCs(Game, 90, 50);
    const day = (Game.state.scholar || {}).day || 1;
    Game.state.waveKillLog = [{ d: day, mid: 'influencer', w: 4, by: npcs.A, via: 'player', trick: null }];
    Game.playerDeath('test');
    check('skip-fires-pick', Game.villagerId === npcs.B, 'successor=' + Game.villagerId + ' want ' + npcs.B);
    const sk = ((Game.state.village || {}).vetrestSkips || []);
    check('skip-fires-trace', sk.length === 1 && sk[0].skipped === npcs.A && sk[0].picked === npcs.B,
      'trace=' + JSON.stringify(sk));
    check('skip-fires-said', lines.some(function (l) { return l.indexOf('only just bled') >= 0; }),
      'lines=' + lines.slice(-3).join(' | ').slice(0, 200));
    delete process.env.VETREST_MANTLE_SKIP;
  }
  // 2. OLD-CODE CONTROL (flag OFF): same setup, the blooded killer
  // takes the Codex as before; no trace, no skip line. The effect
  // fails on the old code and passes on the new.
  {
    delete process.env.VETREST_MANTLE_SKIP;
    const Game = await freshGame(99711);
    const lines = captureSay(Game);
    const npcs = twoNPCs(Game, 90, 50);
    const day = (Game.state.scholar || {}).day || 1;
    Game.state.waveKillLog = [{ d: day, mid: 'influencer', w: 4, by: npcs.A, via: 'player', trick: null }];
    Game.playerDeath('test');
    check('skip-off-old-pick', Game.villagerId === npcs.A, 'successor=' + Game.villagerId + ' want ' + npcs.A);
    check('skip-off-no-trace', ((Game.state.village || {}).vetrestSkips || []).length === 0);
    check('skip-off-no-line', !lines.some(function (l) { return l.indexOf('only just bled') >= 0; }));
  }
  // 3. Window edge, 45d: kill exactly 45 days ago IS skipped.
  {
    process.env.VETREST_MANTLE_SKIP = '1';
    const Game = await freshGame(99711);
    const npcs = twoNPCs(Game, 90, 50);
    Game.state.scholar.day = 50;
    Game.state.waveKillLog = [{ d: 5, mid: 'influencer', w: 4, by: npcs.A, via: 'player', trick: null }];
    Game.playerDeath('test');
    check('skip-window-45', Game.villagerId === npcs.B, 'successor=' + Game.villagerId);
    delete process.env.VETREST_MANTLE_SKIP;
  }
  // 4. Window edge, 46d: kill 46 days ago is NOT skipped.
  {
    process.env.VETREST_MANTLE_SKIP = '1';
    const Game = await freshGame(99711);
    const npcs = twoNPCs(Game, 90, 50);
    Game.state.scholar.day = 50;
    Game.state.waveKillLog = [{ d: 4, mid: 'influencer', w: 4, by: npcs.A, via: 'player', trick: null }];
    Game.playerDeath('test');
    check('skip-window-46', Game.villagerId === npcs.A, 'successor=' + Game.villagerId);
    delete process.env.VETREST_MANTLE_SKIP;
  }
  // 5. Wrong wave: a wave-3 kill does NOT trigger the skip.
  {
    process.env.VETREST_MANTLE_SKIP = '1';
    const Game = await freshGame(99711);
    const npcs = twoNPCs(Game, 90, 50);
    const day = (Game.state.scholar || {}).day || 1;
    Game.state.waveKillLog = [{ d: day, mid: 'spool', w: 3, by: npcs.A, via: 'player', trick: null }];
    Game.playerDeath('test');
    check('skip-wave3-no-skip', Game.villagerId === npcs.A, 'successor=' + Game.villagerId);
    delete process.env.VETREST_MANTLE_SKIP;
  }
  // 6. Fallback: every candidate is a fresh killer — the mantle still
  // passes to the top-trust candidate; the village is never stranded.
  {
    process.env.VETREST_MANTLE_SKIP = '1';
    const Game = await freshGame(99711);
    const v = Game.state.village || {};
    const roster = (v.roster || []).filter(function (id) { return id !== Game.villagerId; });
    v.trust = v.trust || {};
    roster.forEach(function (id, i) { v.trust[id] = 90 - i; });
    const day = (Game.state.scholar || {}).day || 1;
    Game.state.waveKillLog = roster.map(function (id) { return { d: day, mid: 'influencer', w: 4, by: id, via: 'player', trick: null }; });
    Game.playerDeath('test');
    check('skip-fallback-passes', Game.villagerId === roster[0], 'successor=' + Game.villagerId + ' want ' + roster[0]);
    check('skip-fallback-no-trace', ((Game.state.village || {}).vetrestSkips || []).length === 0);
    delete process.env.VETREST_MANTLE_SKIP;
  }

  // ---------- Part 2: analyzer verdict fixtures ----------
  function row(seed, opts) {
    const r = {
      seed: seed, policy: 'baseline', run: 'fixture', days: 100, endReason: 'horizon', won: false, fights: [],
      daily: [], waveKillLog: [], fallen: [], wavesFaced: {}, instrumentErrors: [],
      killsLive: [], scholarDeaths: [], killerTrack: [], deadMap: {},
      scaleRank: 'village', unlockedWave: 4, maxWave: 4, exiles: [], teleDeaths: [],
      vetrestSkips: [], villageLost: false, flagOn: false,
    };
    return Object.assign(r, opts || {});
  }
  function kill(d, mid, w, by, via) { return { d: d, mid: mid, w: w, by: by, via: via || 'player', trick: null }; }
  function dead(vid, day, cause, extra) { return Object.assign({ villagerId: vid, day: day, cause: cause || 'The Eater', name: vid }, extra || {}); }
  function liveKill(d, mid, w, by, scholarChannel) {
    return { day: d, mid: mid, wave: w, by: by, via: 'player', scholarAtKill: scholarChannel ? by : 'someone-else', scholarChannel: !!scholarChannel };
  }
  function scholarDeath(day, vid, causeArg) {
    return { day: day, scholarId: vid, causeArg: causeArg || 'the wild', atHaven: true, inCombat: true, pendingEncounter: false };
  }
  // Daily snapshots day 1..endDay. readiness5.veterans matches the
  // derived living count only loosely (mismatch days do not affect
  // the verdict fixtures); ready stays false.
  function dailyTo(endDay) {
    const out = [];
    for (let d = 1; d <= endDay; d++) out.push({ day: d, gated: 100, raw: 100, readiness5: { veterans: 0, ready: false, short: ['veterans'] } });
    return out;
  }
  // A banking row: killer `by` kills on killDay, exits on exitDay
  // (null = still living, censored). Optionally a second killer.
  function bankingRow(seed, policy, killDay, exitDay, opts) {
    const o = opts || {};
    const by = o.by || 'alice';
    const log = [kill(killDay, 'influencer', 4, by)];
    const live = [liveKill(killDay, 'influencer', 4, by, true)];
    const fallen = [];
    const deadMap = {};
    const sd = [];
    if (exitDay != null) {
      fallen.push(dead(by, exitDay, 'The Eater', { monsterId: 'the_eater', monsterName: 'The Eater' }));
      deadMap[by] = true;
      sd.push(scholarDeath(exitDay, by, 'the wild'));
    } else { deadMap[by] = false; }
    if (o.second) {
      log.push(kill(o.second.killDay, 'algorithm', 4, o.second.by));
      live.push(liveKill(o.second.killDay, 'algorithm', 4, o.second.by, false));
      if (o.second.exitDay != null) {
        fallen.push(dead(o.second.by, o.second.exitDay, 'The Eater', { monsterId: 'the_eater', monsterName: 'The Eater' }));
        deadMap[o.second.by] = true;
        sd.push(scholarDeath(o.second.exitDay, o.second.by, 'the wild'));
      } else { deadMap[o.second.by] = false; }
    }
    return row(seed, {
      policy: policy, days: o.days || 100, daily: dailyTo(o.days || 100),
      waveKillLog: log, killsLive: live, fallen: fallen, deadMap: deadMap, scholarDeaths: sd,
      vetrestSkips: o.skips || [], flagOn: policy === 'vetrest',
      fights: [{ day: killDay, channel: 'player-tb', mid: 'influencer', wave: 4 }],
    });
  }
  function errRow(seed, policy) {
    return row(seed, { policy: policy, instrumentErrors: ['boom'] });
  }

  // (a) GO: armed median 25d >= 19d, one armed L>=2 seed, cost bars hold.
  {
    const dir = '/tmp/vetrest-proof-go';
    fs.mkdirSync(dir, { recursive: true });
    const files = [
      ['vetrest-s99711-vetrest-baseline.json', bankingRow(99711, 'baseline', 10, 19)],
      ['vetrest-s99712-vetrest-baseline.json', bankingRow(99712, 'baseline', 10, 20)],
      ['vetrest-s99713-vetrest-baseline.json', bankingRow(99713, 'baseline', 10, 21)],
      ['vetrest-s99711-vetrest-vetrest.json', bankingRow(99711, 'vetrest', 10, 40, { skips: [{ day: 15, skipped: 'alice', picked: 'bob' }] })],
      ['vetrest-s99712-vetrest-vetrest.json', bankingRow(99712, 'vetrest', 10, 35, { skips: [{ day: 16, skipped: 'alice', picked: 'bob' }] })],
      ['vetrest-s99713-vetrest-vetrest.json', bankingRow(99713, 'vetrest', 10, 30, { second: { by: 'carol', killDay: 20, exitDay: 45 }, skips: [{ day: 17, skipped: 'alice', picked: 'bob' }] })],
    ];
    files.forEach(function (pair) { fs.writeFileSync(path.join(dir, pair[0]), JSON.stringify(pair[1])); });
    const res = AN.analyzeDir(dir);
    check('verdict-GO', res.verdict === 'GO', 'got ' + res.verdict + ' :: ' + res.verdictReason);
    check('verdict-GO-median', res.armed.firstKillerSurvivalExit.median === 25, 'median=' + res.armed.firstKillerSurvivalExit.median);
    check('verdict-GO-pair', res.armed.pairBankingSeeds.length === 1 && res.armed.pairBankingSeeds[0] === 99713,
      'pairs=' + JSON.stringify(res.armed.pairBankingSeeds));
    check('verdict-GO-skips', res.armed.skipsTotal === 3, 'skips=' + res.armed.skipsTotal);
    check('verdict-GO-paired-up', res.pairedUp === 3, 'pairedUp=' + res.pairedUp);
  }
  // (b) NO-GO median miss + mechanism fires → METRIC-BROKEN.
  {
    const dir = '/tmp/vetrest-proof-nogo';
    fs.mkdirSync(dir, { recursive: true });
    const files = [
      ['vetrest-s99711-vetrest-baseline.json', bankingRow(99711, 'baseline', 10, 19)],
      ['vetrest-s99712-vetrest-baseline.json', bankingRow(99712, 'baseline', 10, 20)],
      ['vetrest-s99713-vetrest-baseline.json', bankingRow(99713, 'baseline', 10, 21)],
      ['vetrest-s99711-vetrest-vetrest.json', bankingRow(99711, 'vetrest', 10, 20, { skips: [{ day: 15, skipped: 'alice', picked: 'bob' }] })],
      ['vetrest-s99712-vetrest-vetrest.json', bankingRow(99712, 'vetrest', 10, 21, { skips: [{ day: 16, skipped: 'alice', picked: 'bob' }] })],
      ['vetrest-s99713-vetrest-vetrest.json', bankingRow(99713, 'vetrest', 10, 22, { skips: [{ day: 17, skipped: 'alice', picked: 'bob' }] })],
    ];
    files.forEach(function (pair) { fs.writeFileSync(path.join(dir, pair[0]), JSON.stringify(pair[1])); });
    const res = AN.analyzeDir(dir);
    check('verdict-NOGO', res.verdict === 'NO-GO', 'got ' + res.verdict + ' :: ' + res.verdictReason);
    check('verdict-NOGO-class', res.killClass && res.killClass.indexOf('METRIC-BROKEN') === 0, 'class=' + res.killClass);
  }
  // (c) NO-GO + zero skips → CONCEPT-DEAD.
  {
    const dir = '/tmp/vetrest-proof-dead';
    fs.mkdirSync(dir, { recursive: true });
    const files = [
      ['vetrest-s99711-vetrest-baseline.json', bankingRow(99711, 'baseline', 10, 19)],
      ['vetrest-s99712-vetrest-baseline.json', bankingRow(99712, 'baseline', 10, 20)],
      ['vetrest-s99713-vetrest-baseline.json', bankingRow(99713, 'baseline', 10, 21)],
      ['vetrest-s99711-vetrest-vetrest.json', bankingRow(99711, 'vetrest', 10, 19)],
      ['vetrest-s99712-vetrest-vetrest.json', bankingRow(99712, 'vetrest', 10, 20)],
      ['vetrest-s99713-vetrest-vetrest.json', bankingRow(99713, 'vetrest', 10, 21)],
    ];
    files.forEach(function (pair) { fs.writeFileSync(path.join(dir, pair[0]), JSON.stringify(pair[1])); });
    const res = AN.analyzeDir(dir);
    check('verdict-DEAD', res.verdict === 'NO-GO' && res.killClass && res.killClass.indexOf('CONCEPT-DEAD') === 0,
      'got ' + res.verdict + ' / ' + res.killClass);
  }
  // (d) UNDERPOWERED: fewer than 2 banking seeds across both legs.
  {
    const dir = '/tmp/vetrest-proof-under';
    fs.mkdirSync(dir, { recursive: true });
    const files = [
      ['vetrest-s99711-vetrest-baseline.json', row(99711, { policy: 'baseline', daily: dailyTo(100) })],
      ['vetrest-s99711-vetrest-vetrest.json', bankingRow(99711, 'vetrest', 10, 40, { skips: [{ day: 15, skipped: 'alice', picked: 'bob' }] })],
    ];
    files.forEach(function (pair) { fs.writeFileSync(path.join(dir, pair[0]), JSON.stringify(pair[1])); });
    const res = AN.analyzeDir(dir);
    check('verdict-UNDERPOWERED', res.verdict === 'UNDERPOWERED', 'got ' + res.verdict + ' :: ' + res.verdictReason);
  }
  // (e) INSUFFICIENT-DATA: > 2 legs with instrument errors.
  {
    const dir = '/tmp/vetrest-proof-err';
    fs.mkdirSync(dir, { recursive: true });
    const files = [
      ['vetrest-s99711-vetrest-baseline.json', errRow(99711, 'baseline')],
      ['vetrest-s99712-vetrest-baseline.json', errRow(99712, 'baseline')],
      ['vetrest-s99713-vetrest-baseline.json', errRow(99713, 'baseline')],
      ['vetrest-s99711-vetrest-vetrest.json', bankingRow(99711, 'vetrest', 10, 40)],
    ];
    files.forEach(function (pair) { fs.writeFileSync(path.join(dir, pair[0]), JSON.stringify(pair[1])); });
    const res = AN.analyzeDir(dir);
    check('verdict-INSUFFICIENT', res.verdict === 'INSUFFICIENT-DATA', 'got ' + res.verdict);
  }
  // (f) Skip cross-check: a skipped vid who IS scholar inside the
  // window is a violation; outside the window it is not.
  {
    const r = bankingRow(99711, 'vetrest', 10, 40, { skips: [{ day: 15, skipped: 'alice', picked: 'bob' }] });
    r.daily = dailyTo(100).map(function (s) { return Object.assign({}, s, { scholarId: s.day >= 20 && s.day <= 25 ? 'alice' : 'bob' }); });
    const chk = AN.skipCrossCheck(r);
    check('skip-crosscheck-violation', chk.violations.length === 6, 'violations=' + chk.violations.length);
    const r2 = bankingRow(99711, 'vetrest', 10, 40, { skips: [{ day: 15, skipped: 'alice', picked: 'bob' }] });
    r2.daily = dailyTo(100).map(function (s) { return Object.assign({}, s, { scholarId: s.day >= 70 ? 'alice' : 'bob' }); });
    check('skip-crosscheck-clean', AN.skipCrossCheck(r2).violations.length === 0);
  }

  // ---------- Part 3: live determinism / neutrality / smoke ----------
  async function liveLeg(seed, days, flagOn, useInstrument) {
    if (flagOn) process.env.VETREST_MANTLE_SKIP = '1'; else delete process.env.VETREST_MANTLE_SKIP;
    const { Game } = await loadGame({ seed: seed, mode: 'competent-vetrest-proof', fullTelemetry: false });
    await setupGame(Game);
    let inst = null;
    if (useInstrument) inst = INST.install(Game);
    const t = inst ? inst.t : { fights: [], daily: [], killsLive: [], scholarDeaths: [], killerTrack: [], instrumentErrors: [] };
    let lastSnapDay = -1;
    function gday() { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
    const policy = require(path.join(REPO, 'scripts', 'policies', 'competent')).competent;
    const wrapped = Object.assign({}, policy, {
      daily: function (Gm, ctx) {
        try { return policy.daily(Gm, ctx); } finally {
          try { const d = gday(); if (inst && d !== lastSnapDay) { lastSnapDay = d; inst.snapshot(); } } catch (e) {}
        }
      },
    });
    let result = null;
    await quietLog(async function () { result = await runDays(Game, wrapped, { days: days, manifest: undefined, sampleEvery: 30 }); });
    if (inst) { try { inst.snapshot(); } catch (e) {} }
    let fin = null;
    if (inst) { try { fin = inst.finalize(); } catch (e) {} }
    if (inst) { try { inst.uninstall(); } catch (e) {} }
    const skips = (((Game.state || {}).village || {}).vetrestSkips || []).slice();
    delete process.env.VETREST_MANTLE_SKIP;
    return {
      days: result.days, endReason: result.endReason,
      killLog: fin ? (fin.waveKillLog || []).length : (((Game.state || {}).waveKillLog || []).length),
      errors: t.instrumentErrors.length, skips: skips.length,
    };
  }
  // Determinism: same seed twice, flag ON, 30d — identical.
  {
    const a = await liveLeg(99711, 30, true, true);
    const b = await liveLeg(99711, 30, true, true);
    check('live-determinism', a.days === b.days && a.endReason === b.endReason && a.killLog === b.killLog && a.skips === b.skips,
      JSON.stringify(a) + ' vs ' + JSON.stringify(b));
  }
  // Instrument off/on neutrality: flag OFF, 30d — identical trajectories.
  {
    const a = await liveLeg(99712, 30, false, true);
    const b = await liveLeg(99712, 30, false, false);
    check('live-instrument-neutrality', a.days === b.days && a.endReason === b.endReason && a.killLog === b.killLog,
      JSON.stringify(a) + ' vs ' + JSON.stringify(b));
    check('live-instrument-no-errors', a.errors === 0 && b.errors === 0, 'errors=' + a.errors + '/' + b.errors);
  }
  // Flag off/on neutrality when no skip fires (30d: wave 4 cannot
  // unlock — assert the trace is empty AND trajectories match).
  {
    const a = await liveLeg(99713, 30, false, true);
    const b = await liveLeg(99713, 30, true, true);
    check('live-flag-neutrality', a.days === b.days && a.endReason === b.endReason && a.killLog === b.killLog && b.skips === 0,
      JSON.stringify(a) + ' vs ' + JSON.stringify(b));
  }
  // Driver smoke: both legs via the real driver into /tmp, 5d, 1 seed.
  {
    const outDir = '/tmp/vetrest-proof-driver-' + process.pid;
    const envBase = Object.assign({}, process.env);
    delete envBase.VETREST_MANTLE_SKIP;
    execSync('node scripts/vetrest-driver-20261105.js', {
      cwd: REPO,
      env: Object.assign({}, envBase, { SEEDS: '99711', DAYS: '5', POLICY: 'baseline', RUN: 'proof-smoke', OUTDIR: outDir }),
      stdio: 'pipe',
    });
    execSync('node scripts/vetrest-driver-20261105.js', {
      cwd: REPO,
      env: Object.assign({}, envBase, { SEEDS: '99711', DAYS: '5', POLICY: 'vetrest', RUN: 'proof-smoke', OUTDIR: outDir }),
      stdio: 'pipe',
    });
    const bf = JSON.parse(fs.readFileSync(path.join(outDir, 'vetrest-s99711-vetrest-baseline.json'), 'utf8'));
    const af = JSON.parse(fs.readFileSync(path.join(outDir, 'vetrest-s99711-vetrest-vetrest.json'), 'utf8'));
    check('driver-smoke-files', bf.seed === 99711 && af.seed === 99711 && bf.policy === 'baseline' && af.policy === 'vetrest');
    check('driver-smoke-no-errors', (bf.instrumentErrors || []).length === 0 && (af.instrumentErrors || []).length === 0,
      'errors=' + JSON.stringify(bf.instrumentErrors) + ' / ' + JSON.stringify(af.instrumentErrors));
    check('driver-smoke-flag', bf.flagOn === false && af.flagOn === true, 'flags=' + bf.flagOn + '/' + af.flagOn);
  }

  console.log('\n' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
})().catch(function (e) { console.error(e.stack); process.exit(1); });
