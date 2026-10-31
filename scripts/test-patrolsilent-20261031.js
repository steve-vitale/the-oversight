#!/usr/bin/env node
// test-patrolsilent-20261031.js — sim-patrolsilent-a proof test.
// 1. Pure functions: atHavenOf (vs playerAtHaven semantics), combatOcc,
//    classifyBeatVillager branch order.
// 2. Synthetic corpus through the real analyzer (exact counts).
// 3. Live gate: the real sweep on NON-band seed 85901, 60d, S-PATROL
//    stack, twice with instrument (byte-identical) + once without
//    (PSINSTR=0; dayHash sequences identical => instrument neutral
//    on this base at 60d; the full-horizon paired gate runs in the
//    pilot per the prereg).
// 4. Live atHaven replication: beginBeat's computed flag equals
//    Game.playerAtHaven() on a live game, and uninstall restores
//    Game.assignTask.
// No [needs-eyes] (measurement only).
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const PS = require(path.join(REPO, 'scripts', 'patrolsilent-diag-20261031'));
const { analyzeSeed } = require(path.join(REPO, 'scripts', 'patrolsilent-analyze-20261031'));

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}

// --- 1. Pure functions ---
check('atHaven: map missing defaults present', PS.atHavenOf(null, null, 4, 4, true) === true);
check('atHaven: on village node', PS.atHavenOf(4, 4, 4, 4, false) === true);
check('atHaven: adjacent node counts', PS.atHavenOf(5, 4, 4, 4, false) === true);
check('atHaven: two away does not', PS.atHavenOf(6, 4, 4, 4, false) === false);
check('atHaven: diagonal dist 2 does not', PS.atHavenOf(5, 5, 4, 4, false) === false);
check('atHaven: village px default 4', PS.atHavenOf(4, 4, null, null, false) === true);
check('combatOcc: hunter/soldier/marine match', PS.combatOcc('hunter') && PS.combatOcc('ex-marine') && PS.combatOcc('police officer'));
check('combatOcc: farmer/cook do not', !PS.combatOcc('farmer') && !PS.combatOcc('cook') && !PS.combatOcc(''));
check('classify: already-assigned wins', PS.classifyBeatVillager({ hadAssignment: true, hp: 100, cred: true, assignedTask: 'cook' }) === 'already-assigned');
check('classify: rest before fit', PS.classifyBeatVillager({ hadAssignment: false, hp: 30, cred: false, assignedTask: 'rest' }) === 'rest');
check('classify: fit-cook', PS.classifyBeatVillager({ hadAssignment: false, hp: 100, cred: true, assignedTask: 'cook' }) === 'fit-cook');
check('classify: patrol is cred-eligible', PS.classifyBeatVillager({ hadAssignment: false, hp: 100, cred: true, assignedTask: 'patrol' }) === 'cred-eligible');
check('classify: need task + cred = cred-eligible', PS.classifyBeatVillager({ hadAssignment: false, hp: 100, cred: true, assignedTask: 'forage' }) === 'cred-eligible');
check('classify: need task + no cred = no-cred', PS.classifyBeatVillager({ hadAssignment: false, hp: 100, cred: false, assignedTask: 'forage' }) === 'no-cred');
check('classify: need task + low hp = hp-low', PS.classifyBeatVillager({ hadAssignment: false, hp: 50, cred: true, assignedTask: 'forage' }) === 'hp-low');
check('classify: null task unclassified', PS.classifyBeatVillager({ hadAssignment: false, hp: 100, cred: true, assignedTask: null }) === 'unclassified');

// --- 2. Synthetic corpus through the real analyzer ---
(function synthetic() {
  const j = { seed: 99999, gameDays: 10, endReason: 'test', national: 0, table: 0, won: 0,
    maxWave: 1, wave4: 0, wave5: 0, deadfallHauls: 3, deadfallSticks: 4, deadfallFiber: 1,
    psErrors: [],
    psBeats: [
      { id: 1, day: 1, part: 0, scholarPx: 4, scholarPy: 4, villagePx: 4, villagePy: 4, mapMissing: false, atHaven: true,
        roster: [
          { vid: 'v_cred_fit', dead: false, personMissing: false, hp: 90, occ: 'Cook', cred: true, hadAssignment: false },
          { vid: 'v_cred_patrol', dead: false, personMissing: false, hp: 90, occ: 'Hunter', cred: true, hadAssignment: false },
          { vid: 'v_nocred', dead: false, personMissing: false, hp: 90, occ: 'Farmer', cred: false, hadAssignment: false },
          { vid: 'v_held', dead: false, personMissing: false, hp: 90, occ: 'Hunter', cred: true, hadAssignment: true, preTask: 'wood' },
          { vid: 'v_preclaimed', dead: false, personMissing: false, hp: 90, occ: 'Farmer', cred: true, hadAssignment: false },
        ],
        assignments: {}, taskLeads: { patrol: 'v_cred_patrol' } },
      { id: 2, day: 1, part: 1, scholarPx: 7, scholarPy: 4, villagePx: 4, villagePy: 4, mapMissing: false, atHaven: false,
        roster: [], assignments: {}, taskLeads: {} },
    ],
    psAssigns: [
      { beat: 1, day: 1, vid: 'v_cred_fit', task: 'cook', assignedAfter: true, retOk: true, retRefused: null, caller: 'delegateBeat' },
      { beat: 1, day: 1, vid: 'v_cred_patrol', task: 'patrol', assignedAfter: true, retOk: true, retRefused: null, caller: 'delegateBeat' },
      { beat: 1, day: 1, vid: 'v_nocred', task: 'forage', assignedAfter: true, retOk: true, retRefused: null, caller: 'delegateBeat' },
      // Competent's water claim stands BEFORE delegateBeat: the farmer
      // never reaches pickTask, so this must NOT count as a danger
      // beat (v2 join fix) — it is pre-claimed.
      { beat: 1, day: 1, vid: 'v_preclaimed', task: 'water', assignedAfter: true, retOk: true, retRefused: null, caller: 'assignOne' },
    ],
    finalAssignments: {}, finalLeads: {}, hashes: [], anchorCommit: 'test' };
  const r = analyzeSeed(j);
  check('synthetic: beats/atHaven', r.beats === 2 && r.atHavenBeats === 1 && r.awayBeats === 1, JSON.stringify({ beats: r.beats, atHaven: r.atHavenBeats }));
  check('synthetic: patrol attempts', r.patrolAttempts === 1 && r.patrolStood === 1, JSON.stringify({ att: r.patrolAttempts, stood: r.patrolStood }));
  check('synthetic: credVB + fit/danger split', r.credVB === 2 && r.credFitFirst === 1 && r.credDanger === 1 && r.credPatrol === 1, JSON.stringify({ credVB: r.credVB, fit: r.credFitFirst, danger: r.credDanger }));
  check('synthetic: pre-claimed excluded from credVB', r.preClaimedVB === 1 && r.preClaimedCredVB === 1, JSON.stringify({ pre: r.preClaimedVB, preCred: r.preClaimedCredVB }));
  check('synthetic: fit share 0.5', r.fitFirstShare === 0.5, String(r.fitFirstShare));
  check('synthetic: noCredVB + held', r.noCredVB === 1 && r.alreadyVB === 1, JSON.stringify({ noCred: r.noCredVB, held: r.alreadyVB }));
  check('synthetic: patrol lead sighting', r.patrolLeadSightings === 1, String(r.patrolLeadSightings));
  check('synthetic: caller audit', r.callers.delegateBeat === 3, JSON.stringify(r.callers));
  check('synthetic: away dist hist', r.awayDistHist[3] === 1, JSON.stringify(r.awayDistHist));
  // 4 holders: fit + patrol + held + pre-claimed (holding cred is a
  // roster fact, independent of whether a beat picked them).
  check('synthetic: cred holders', r.credHoldersN === 4, String(r.credHoldersN));
})();

// --- 3. Live gate: sweep seed 85901, 60d, twice + no-instrument leg ---
(function live() {
  const baseEnv = { FEASTSCALE_R13: '1', TRIBFLOOR: '1', WINPURSUIT: '1', WINDEFER: '1', SEATDRIVE: '1', FULLSEAT: '1', DEADFALL_B: '1', SEEDS: '85901', DAYS: '60' };
  const dirs = ['/tmp/ps-proof-a', '/tmp/ps-proof-b', '/tmp/ps-proof-noinstr'];
  try {
    for (const d of dirs) { try { fs.rmSync(d, { recursive: true, force: true }); } catch (e) {} }
    execFileSync('node', [path.join(REPO, 'scripts', 'patrolsilent-sweep-20261031.js')],
      { env: Object.assign({}, process.env, baseEnv, { PSILDIAG: '1', EVID: dirs[0] }), stdio: 'pipe', timeout: 600000 });
    execFileSync('node', [path.join(REPO, 'scripts', 'patrolsilent-sweep-20261031.js')],
      { env: Object.assign({}, process.env, baseEnv, { PSILDIAG: '1', EVID: dirs[1] }), stdio: 'pipe', timeout: 600000 });
    execFileSync('node', [path.join(REPO, 'scripts', 'patrolsilent-sweep-20261031.js')],
      { env: Object.assign({}, process.env, baseEnv, { PSINSTR: '0', EVID: dirs[2] }), stdio: 'pipe', timeout: 600000 });
    const a = fs.readFileSync(path.join(dirs[0], 's85901.json'), 'utf8');
    const b = fs.readFileSync(path.join(dirs[1], 's85901.json'), 'utf8');
    const c = JSON.parse(fs.readFileSync(path.join(dirs[2], 's85901.json'), 'utf8'));
    const ja = JSON.parse(a);
    check('live: instrument runs byte-identical', a === b, 're-run differs');
    check('live: no instrument errors', (ja.psErrors || []).length === 0, JSON.stringify(ja.psErrors));
    check('live: beats recorded', (ja.psBeats || []).length > 0, String((ja.psBeats || []).length));
    check('live: neutrality 60d hashes equal', JSON.stringify(ja.hashes) === JSON.stringify(c.hashes),
      `instr ${ja.hashes.length} vs noinstr ${c.hashes.length}`);
    // v2 caller regression guard: through the REAL harness, callers
    // must be policy functions (delegateBeat / assignOne), never the
    // harness verb wrapper Object.w.
    const callersLive = {};
    for (const a of (ja.psAssigns || [])) callersLive[a.caller || 'null'] = (callersLive[a.caller || 'null'] || 0) + 1;
    check('live: callers are policy functions, not Object.w',
      !callersLive['Object.w'] && (callersLive.delegateBeat > 0 || callersLive.assignOne > 0),
      JSON.stringify(callersLive));
    console.log(`live: seed 85901 60d: gameDays=${ja.gameDays} maxWave=${ja.maxWave} beats=${ja.psBeats.length} atHaven=${ja.psBeats.filter(x => x.atHaven).length} assigns=${ja.psAssigns.length} patrolAtt=${ja.psAssigns.filter(x => x.task === 'patrol').length}`);
  } catch (e) {
    check('live: sweep runs clean', false, String((e && e.message) || e) + '\n' + String((e && e.stdout) || '') + String((e && e.stderr) || ''));
  }
})();

// --- 4. Live atHaven replication + uninstall restore ---
(async function liveReplication() {
  try {
    const { loadGame, setupGame } = require(path.join(REPO, 'scripts', 'sim-harness'));
    const { Game } = await loadGame({ seed: 85901, mode: 'deadfall-diag', fullTelemetry: false });
    const before = Game.assignTask;
    const t = { psBeats: [], psAssigns: [], psErrors: [], psBeatSeq: 0, _psCurBeat: null };
    const uninstall = PS.install(Game, t);
    await setupGame(Game);
    PS.beginBeat(Game, t);
    const beat = t.psBeats[t.psBeats.length - 1];
    let liveFlag = null;
    try { liveFlag = Game.playerAtHaven(); } catch (e) {}
    check('live: beat atHaven equals playerAtHaven()', beat.atHaven === liveFlag, `beat=${beat.atHaven} live=${liveFlag}`);
    check('live: beat roster rows carry pick inputs', (beat.roster || []).every(r => ('hp' in r) && ('cred' in r) && ('hadAssignment' in r)), JSON.stringify((beat.roster || []).slice(0, 1)));
    uninstall();
    check('live: uninstall restores assignTask', Game.assignTask === before);
  } catch (e) {
    check('live: replication runs clean', false, String((e && e.message) || e));
  }
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
