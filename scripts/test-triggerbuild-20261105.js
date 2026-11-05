// test-triggerbuild-20261105.js — proof for arm sim-triggerbuild-b.
// (a) Live harness legs: travelTo parting turn — fires once for a
// wave-4 monster on the departing tile and travel proceeds; commits to
// combat (territorial warnTurns) aborts travel with a live fight;
// wave-3 and lingering monsters are excluded; no-monster travel is
// neutral. (b) Analyzer fixtures: first-episode turn counting — the
// parting turn falls inside the episode, return-episode calls are
// excluded, the no-marker case is flagged as a fallback.
// Usage: node scripts/test-triggerbuild-20261105.js (writes tmp only).
'use strict';
const path = require('path');
const fs = require('fs');
const os = require('os');
const { execSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame } = require(path.join(REPO, 'scripts', 'sim-harness'));

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}
function sleepSync(ms) { try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); } catch (e) {} }
function mkTmp(prefix) {
  for (let i = 0; i < 60; i++) {
    try { return fs.mkdtempSync(path.join(os.tmpdir(), prefix)); }
    catch (e) { if (e.code !== 'EPERM') throw e; sleepSync(5000); }
  }
  throw new Error('mkdtemp EPERM retries exhausted');
}
function writeRetry(file, content) {
  const want = Buffer.byteLength(content);
  let lastErr = null;
  for (let i = 0; i < 120; i++) {
    try {
      fs.writeFileSync(file, content);
      try {
        const got = fs.statSync(file).size;
        if (got === want) return;
        lastErr = new Error('short-write: got ' + got + ' want ' + want);
      } catch (e) { lastErr = e; }
    } catch (e) { lastErr = e; if (e.code !== 'EPERM') throw e; }
    try { fs.unlinkSync(file); } catch (e) {}
    sleepSync(5000);
  }
  throw lastErr;
}

// --- (b) Analyzer first-episode fixtures (run first: no game state) ---
(function analyzerFixtures() {
  const dir = mkTmp('triggerbuild-proof-');
  function snap(day, gated, unlocked, world, px, py) {
    return { day: day, gated: gated, unlockedWave: unlocked, raw: gated, readiness5: null, worldCap: 8, px: px, py: py, world: world, w4facedTypes: 0 };
  }
  function corpus(over) {
    const base = {
      seed: 99102, arm: 'triggerbuild', run: 'proof', anchorCommit: 'test', instrumentOff: false,
      days: 116, gameDays: 117, endReason: 'village-lost', won: false, over: true, villageLost: true,
      scaleRank: 'village', maxWave: 4, unlockedWave: 4, standing: 199, readiness5: null,
      spawns: [], removals: [], casts: [], fights: [], daily: [], mtCalls: [], tileChanges: [], sayLines: [],
      waveKillLog: [], fallen: [], wavesFaced: null, finalWorld: [], instrumentErrors: [],
    };
    return Object.assign(base, over);
  }
  // Seed file: unlock day 80. Three unfought player-reaching instances:
  // seq 1: spawn on player tile idx 10, PARTING turn idx 20 (viaTravel),
  //   departure marker idx 30, return-episode call idx 40 -> firstEp 1,
  //   viaTravel true, subCause player-left (return call excluded).
  // seq 2: spawn on player tile idx 11, NO call before marker idx 31,
  //   return-episode call idx 41 -> firstEp 0 (the 99102-eulogy shape).
  // seq 3: spawn on player tile idx 50 — AFTER both markers (30/31) —
  //   calls idx 55/60, NO marker after its spawn -> firstEp 2,
  //   fallback flagged. (Markers are global player tile changes: a
  //   marker after ANY spawn ends that instance's episode, so a
  //   no-marker fixture must spawn after the last marker.)
  const daily = [];
  for (let d = 79; d <= 116; d++) daily.push(snap(d, 199, 4, [], 4, 4));
  const c = corpus({
    daily: daily,
    spawns: [
      { idx: 10, seq: 1, day: 83, id: 'eulogy', wave: 4, tx: 4, ty: 4, mx: 2, my: 5, px: 4, py: 4, dist: 0, onPlayerTile: true, source: 'checkEncounter', stackFn: 'checkEncounter', veteran: false },
      { idx: 11, seq: 2, day: 84, id: 'eulogy', wave: 4, tx: 4, ty: 4, mx: 2, my: 5, px: 4, py: 4, dist: 0, onPlayerTile: true, source: 'checkEncounter', stackFn: 'checkEncounter', veteran: false },
      { idx: 50, seq: 3, day: 85, id: 'strike', wave: 4, tx: 4, ty: 4, mx: 3, my: 3, px: 4, py: 4, dist: 0, onPlayerTile: true, source: 'checkEncounter', stackFn: 'checkEncounter', veteran: false },
    ],
    tileChanges: [
      { idx: 30, day: 83, from: [4, 4], to: [5, 4] },
      { idx: 31, day: 84, from: [5, 4], to: [4, 4] },
    ],
    mtCalls: [
      { idx: 20, day: 83, seq: 1, id: 'eulogy', wave: 4, px: 4, py: 4, pmx: 4, pmy: 4, before: { mx: 2, my: 5, lostSight: 0, stance: null }, after: { mx: 2, my: 5, lostSight: 0, stance: 'curious' }, distBefore: 2, distAfter: 2, fightFired: false, removedFired: false, viaTravel: true },
      { idx: 40, day: 88, seq: 1, id: 'eulogy', wave: 4, px: 4, py: 4, pmx: 4, pmy: 4, before: { mx: 2, my: 5, lostSight: 0, stance: 'curious' }, after: { mx: 2, my: 5, lostSight: 1, stance: 'curious' }, distBefore: 2, distAfter: 2, fightFired: false, removedFired: false, viaTravel: false },
      { idx: 41, day: 89, seq: 2, id: 'eulogy', wave: 4, px: 4, py: 4, pmx: 4, pmy: 4, before: { mx: 2, my: 5, lostSight: 0, stance: null }, after: { mx: 2, my: 5, lostSight: 1, stance: null }, distBefore: 2, distAfter: 2, fightFired: false, removedFired: false, viaTravel: false },
      { idx: 55, day: 86, seq: 3, id: 'strike', wave: 4, px: 4, py: 4, pmx: 4, pmy: 4, before: { mx: 3, my: 3, lostSight: 0, stance: null }, after: { mx: 3, my: 3, lostSight: 0, stance: 'hungry' }, distBefore: 1, distAfter: 1, fightFired: false, removedFired: false, viaTravel: true },
      { idx: 60, day: 87, seq: 3, id: 'strike', wave: 4, px: 4, py: 4, pmx: 4, pmy: 4, before: { mx: 3, my: 3, lostSight: 0, stance: 'hungry' }, after: { mx: 3, my: 3, lostSight: 0, stance: 'hungry' }, distBefore: 1, distAfter: 1, fightFired: false, removedFired: false, viaTravel: false },
    ],
    sayLines: [
      { idx: 19, day: 83, line: 'You turn to leave — behind you, the Eulogy stirs.' },
    ],
  });
  writeRetry(path.join(dir, 'trigger-s99102-proof.json'), JSON.stringify(c, null, 2) + '\n');
  let out;
  try {
    const raw = execSync('node ' + path.join(REPO, 'scripts', 'triggerbuild-analyze-20261105.js') + ' ' + dir, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    out = JSON.parse(raw);
  } catch (e) {
    ok('analyzer runs on fixture corpus', false, String(e.message).slice(0, 300));
    return;
  }
  const s = out.seeds[0];
  const bySeq = {};
  (s.instances || []).forEach(function (i) { bySeq[i.seq] = i; });
  ok('fixture seq1: firstEp 1 (parting turn inside, return call excluded)',
    bySeq[1] && bySeq[1].firstEpMt === 1, 'got ' + (bySeq[1] && bySeq[1].firstEpMt));
  ok('fixture seq1: viaTravel attributed', !!(bySeq[1] && bySeq[1].firstEpViaTravel));
  ok('fixture seq1: subCause player-left', bySeq[1] && bySeq[1].subCause === 'player-left-the-tile', bySeq[1] && bySeq[1].subCause);
  ok('fixture seq2: firstEp 0 (return-episode call excluded)',
    bySeq[2] && bySeq[2].firstEpMt === 0, 'got ' + (bySeq[2] && bySeq[2].firstEpMt));
  ok('fixture seq2: no fallback (marker exists)', bySeq[2] && bySeq[2].firstEpFallback === false);
  ok('fixture seq3: firstEp 2 with fallback flagged',
    bySeq[3] && bySeq[3].firstEpMt === 2 && bySeq[3].firstEpFallback === true,
    'got ' + (bySeq[3] && bySeq[3].firstEpMt) + '/' + (bySeq[3] && bySeq[3].firstEpFallback));
  ok('band: firstEpContact 2 of 3', out.triggerbuild && out.triggerbuild.firstEpContact === 2,
    'got ' + (out.triggerbuild && out.triggerbuild.firstEpContact));
  ok('band: zeroTurnPlayerLeft 1 (seq2 only)', out.triggerbuild && out.triggerbuild.zeroTurnPlayerLeft === 1,
    'got ' + (out.triggerbuild && out.triggerbuild.zeroTurnPlayerLeft));
  ok('band: partingLines 1', out.triggerbuild && out.triggerbuild.partingLines === 1,
    'got ' + (out.triggerbuild && out.triggerbuild.partingLines));
})();

// --- (a) Live harness legs ---
async function liveLegs() {
  async function freshGame() {
    const { Game } = await loadGame({ seed: 99108, mode: 'competent-triggerbuild', fullTelemetry: false });
    await setupGame(Game);
    return Game;
  }
  function pickDest(Game) {
    const tts = Game.travelTargets() || [];
    for (const t of tts) {
      try { if (!Game.travelBlockage(t.x, t.y)) return t; } catch (e) {}
    }
    return null;
  }
  function armCounters(Game) {
    let mtN = 0;
    const origMT = Game.monsterTurn;
    Game.monsterTurn = function () { mtN++; return origMT.apply(this, arguments); };
    const lines = [];
    const origSay = Game.say;
    Game.say = function () { try { if (typeof arguments[0] === 'string') lines.push(arguments[0]); } catch (e) {} return origSay.apply(this, arguments); };
    return { mt: function () { return mtN; }, lines: lines };
  }

  // Leg A: wave-4 grazing monster on the tile; travel proceeds, exactly
  // one extra monsterTurn (the parting turn), parting line spoken.
  try {
    const Game = await freshGame();
    const dest = pickDest(Game);
    ok('legA: a travel target exists', !!dest, 'targets=' + (Game.travelTargets() || []).length);
    if (dest) {
      const px = Game.map.px, py = Game.map.py;
      const s = Game.state.scholar;
      const mon = Game.spawnWorldMonster({ id: 'eulogy' }, px, py, { mx: s.mx ?? 4, my: s.my ?? 4, stance: 'grazing' });
      ok('legA: spawned wave-4 eulogy on player tile', !!mon && (mon.wave | 0) === 4 && Game.playerMonster() === mon);
      const cnt = armCounters(Game);
      const before = cnt.mt();
      const ret = Game.travelTo(dest.x, dest.y);
      ok('legA: exactly one parting monsterTurn', cnt.mt() === before + 1, 'delta=' + (cnt.mt() - before));
      ok('legA: travel proceeded', Game.map.px === dest.x && Game.map.py === dest.y, 'at ' + Game.map.px + ',' + Game.map.py);
      ok('legA: parting line spoken', cnt.lines.some(function (l) { return /turn to leave/i.test(l); }), cnt.lines.slice(-3).join(' | '));
      ok('legA: travelTo did not return a blockage', !(ret && ret.blockType), 'ret=' + JSON.stringify(ret));
    }
  } catch (e) { ok('legA ran without exception', false, String(e && e.stack || e).slice(0, 300)); }

  // Leg B: territorial monster one warnTurn from committing; the
  // parting turn commits, travel aborts, fight live, player stays.
  try {
    const Game = await freshGame();
    const dest = pickDest(Game);
    ok('legB: a travel target exists', !!dest);
    if (dest) {
      const px = Game.map.px, py = Game.map.py;
      const s = Game.state.scholar;
      const mon = Game.spawnWorldMonster({ id: 'eulogy' }, px, py, { mx: s.mx ?? 4, my: s.my ?? 4, stance: 'territorial', warned: true, warnTurns: 1 });
      ok('legB: spawned committed-pending territorial eulogy', !!mon);
      const cnt = armCounters(Game);
      const ret = Game.travelTo(dest.x, dest.y);
      const fighting = !!Game.tbfight || (typeof Game.inCombat === 'function' && !!Game.inCombat());
      ok('legB: travel aborted (null)', ret === null, 'ret=' + JSON.stringify(ret));
      ok('legB: player stayed on the tile', Game.map.px === px && Game.map.py === py);
      ok('legB: fight is live', fighting, 'tbfight=' + !!Game.tbfight);
      ok('legB: parting turn ran', cnt.mt() >= 1, 'mt=' + cnt.mt());
    }
  } catch (e) { ok('legB ran without exception', false, String(e && e.stack || e).slice(0, 300)); }

  // Leg C: exclusions — wave-3 monster and lingering wave-4 monster
  // get NO parting turn; travel proceeds normally.
  try {
    const Game = await freshGame();
    const dest = pickDest(Game);
    ok('legC: a travel target exists', !!dest);
    if (dest) {
      const px = Game.map.px, py = Game.map.py;
      const s = Game.state.scholar;
      const m3 = Game.spawnWorldMonster({ id: 'redactor' }, px, py, { mx: s.mx ?? 4, my: s.my ?? 4, stance: 'grazing' });
      ok('legC: spawned wave-3 redactor', !!m3 && (m3.wave | 0) === 3);
      const cnt = armCounters(Game);
      const before = cnt.mt();
      Game.travelTo(dest.x, dest.y);
      ok('legC: wave-3 gets no parting turn', cnt.mt() === before, 'delta=' + (cnt.mt() - before));
      ok('legC: travel proceeded past wave-3', Game.map.px === dest.x && Game.map.py === dest.y);
    }
  } catch (e) { ok('legC wave-3 ran without exception', false, String(e && e.stack || e).slice(0, 300)); }
  try {
    const Game = await freshGame();
    const dest = pickDest(Game);
    ok('legC-ling: a travel target exists', !!dest);
    if (dest) {
      const px = Game.map.px, py = Game.map.py;
      const s = Game.state.scholar;
      const ml = Game.spawnWorldMonster({ id: 'eulogy' }, px, py, { mx: s.mx ?? 4, my: s.my ?? 4, stance: 'grazing', lingering: true });
      ok('legC-ling: spawned lingering wave-4 eulogy', !!ml && ml.lingering === true);
      const cnt = armCounters(Game);
      const before = cnt.mt();
      Game.travelTo(dest.x, dest.y);
      ok('legC-ling: lingerer gets no parting turn', cnt.mt() === before, 'delta=' + (cnt.mt() - before));
      ok('legC-ling: travel proceeded past lingerer', Game.map.px === dest.x && Game.map.py === dest.y);
    }
  } catch (e) { ok('legC lingerer ran without exception', false, String(e && e.stack || e).slice(0, 300)); }

  // Leg D: no monster — travel is neutral (no extra turn, no line).
  try {
    const Game = await freshGame();
    const dest = pickDest(Game);
    ok('legD: a travel target exists', !!dest);
    if (dest) {
      const cnt = armCounters(Game);
      const before = cnt.mt();
      Game.travelTo(dest.x, dest.y);
      ok('legD: no extra monsterTurn without a monster', cnt.mt() === before, 'delta=' + (cnt.mt() - before));
      ok('legD: no parting line without a monster', !cnt.lines.some(function (l) { return /turn to leave/i.test(l); }));
      ok('legD: travel proceeded', Game.map.px === dest.x && Game.map.py === dest.y);
    }
  } catch (e) { ok('legD ran without exception', false, String(e && e.stack || e).slice(0, 300)); }
}

liveLegs().then(function () {
  console.log('\n' + pass + ' PASS, ' + fail + ' FAIL');
  process.exit(fail ? 1 : 0);
}).catch(function (e) {
  console.log('FAIL live legs harness :: ' + String(e && e.stack || e).slice(0, 500));
  console.log('\n' + pass + ' PASS, ' + (fail + 1) + ' FAIL');
  process.exit(1);
});
