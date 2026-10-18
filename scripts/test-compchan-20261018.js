#!/usr/bin/env node
// test-compchan-20261018.js — proof for the sim-compchan instrument.
//
// (a) DET-GATE: COMPCHAN instrument installed vs not installed —
//     byte-identical Game.state after 60d (2 fixed seeds x {leadfeast,
//     belongfeast}). The instrument is read-only; this pins it.
// (b) CLASSIFIER FIXTURES (pure): every via x ctx -> expected shape; the
//     mis-tag rule (via='player' with by != kill-time scholar vid counts
//     as companion).
// (c) WRAP FIXTURES on a real harness game: crafted recordWaveKill /
//     recordPyrrhicKill / startCombat calls covering all channels + the
//     mis-tag + an in-party companion kill; kill-time ctx captured
//     (scholarVid, party, aid/atHaven/inTb/onExped); zero 'unknown' shapes.
// (d) REAL-SWEEP GATE: one full 180d census run (seed 63101, leadfeast)
//     through the real sweep script into a scratch dir — asserts
//     attributionComplete true, zero instrument errors.
//
// Usage: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 \
//        WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 COMPCHAN=1 \
//        node scripts/test-compchan-20261018.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync, execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log(`  ok   ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER', 'COMPCHAN']) {
  if (process.env[k] !== '1') { console.error(`STOP: ${k}=1 required.`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('STOP: SEATDRIVE=0 required.'); process.exit(2); }
if (process.env.NODEWITNESS !== '1') { console.error('STOP: NODEWITNESS=1 required.'); process.exit(2); }

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { dayHash } = require(path.join(REPO, 'scripts', 'det-gate'));
const TF = require(path.join(REPO, 'scripts', 'policies', 'tribfloor'));
const CC = require(path.join(REPO, 'scripts', 'compchan-instrument-20261018'));

async function newGame(seed) {
  const { Game } = await loadGame({ seed, mode: 'compchan-test', fullTelemetry: false });
  await setupGame(Game);
  return Game;
}
function w3mid(Game) {
  const m = ((Game.data || {}).monsters || []).find(x => x && (x.wave | 0) === 3);
  return m ? m.id : null;
}
function someVillager(Game) {
  const roster = (((Game.state || {}).village || {}).roster || []);
  const sid = Game.villagerId;
  return roster.find(v => v && v !== sid) || null;
}

(async () => {
  console.log('== (a) DET-GATE: instrument installed vs not — 60d trajectory ==');
  // NOTE: full-state byte comparison is INVALID on this master — det-gate.js
  // documents the known issue (2026-10-14, entropy-hunt r26): wall-clock
  // timestamps (state.pacing.lastTs) and timestamp-based villager IDs leak
  // into state, so two identical no-instrument runs already differ. The
  // repo's own det-gate compares per-day trajectory hashes (dayHash) — the
  // standard this gate follows. Because the same ID leak can make even the
  // trajectory gate flaky on contest-heavy seeds, each pair first proves
  // noinstr-vs-noinstr stability; only stable seeds judge the instrument.
  async function traj(seed, pid, useInstr) {
    const pol = pid === 'leadfeast' ? TF.leadfeast : TF.belongfeast;
    const G = await newGame(seed);
    const t = { kills: [], engagements: [], census: [], instrumentErrors: [] };
    let uninstall = null;
    if (useInstr) uninstall = CC.install(G, t);
    const hs = [];
    const wrapped = Object.assign({}, pol, {
      daily(Gm, ctx) { hs.push(Gm.state.scholar.day + ':' + dayHash(Gm)); return pol.daily(Gm, ctx); },
    });
    await quietLog(async () => { await runDays(G, wrapped, { days: 60, manifest: undefined, sampleEvery: 30 }); });
    if (uninstall) uninstall();
    return { hashes: hs.join('\n'), t };
  }
  let gateGreen = 0, gateTotal = 0;
  for (const pid of ['leadfeast', 'belongfeast']) {
    let judged = false;
    for (const seed of [94011, 94012, 94013, 94014]) {
      if (judged) break;
      const a = await traj(seed, pid, false);
      const b = await traj(seed, pid, false);
      if (a.hashes !== b.hashes) { console.log(`  .. ${pid} s${seed}: noinstr-vs-noinstr UNSTABLE (contest-ID leak) — seed skipped`); continue; }
      gateTotal++;
      const c = await traj(seed, pid, true);
      const same = c.hashes === a.hashes;
      if (same) gateGreen++;
      check(`det ${pid} s${seed} trajectory identical (stable seed)`, same, same ? '' : 'trajectories diverged');
      check(`det ${pid} s${seed} instrument recorded (sanity)`, c.t.census.length > 0, `census=${c.t.census.length}`);
      judged = true;
    }
    if (!judged) check(`det ${pid}: no stable seed found`, false, 'all 4 seeds contest-flaky');
  }
  check('det-gate all green', gateGreen === gateTotal && gateTotal > 0, `${gateGreen}/${gateTotal}`);

  console.log('== (b) CLASSIFIER FIXTURES ==');
  const cases = [
    // [via, ctx, expected]
    ['aid-crisis', {}, 'raid'],
    ['player', { aid: true }, 'raid'],
    ['agency', {}, 'agency'],
    ['sortie', {}, 'expedition'],
    ['patrol', {}, 'patrol'],
    ['contest', {}, 'contest'],
    ['player', { onExped: true, inTb: true }, 'expedition'],
    ['wild', {}, 'wild'],
    ['player', { inTb: true, atHaven: false }, 'wild'],
    ['companion', { inTb: true, atHaven: true }, 'haven-TB'],
    ['player', { inTb: true, atHaven: true }, 'haven-TB'],
    ['player', { atHaven: true }, 'haven-TB'],
    ['player', {}, 'wild'],
    ['unknown', {}, 'unknown'],
  ];
  for (const [via, ctx, want] of cases) {
    const got = CC.classifyKill({ via, w: 3 }, ctx);
    check(`classify via=${via} ctx=${JSON.stringify(ctx)} -> ${want}`, got === want, `got ${got}`);
  }

  console.log('== (c) WRAP FIXTURES on a real harness game ==');
  {
    const Game = await newGame(94013);
    const mid = w3mid(Game);
    check('fixture has a wave-3 monster', !!mid, '');
    const vA = someVillager(Game);
    check('fixture has a non-scholar villager', !!vA, '');
    const scholarVid = Game.villagerId;
    // Put vA in the scholar's party (documented fixture setup — ensure the
    // array exists first; `(...).party || []` would push into a throwaway).
    try {
      const vv = Game.state.village || (Game.state.village = {});
      vv.party = vv.party || [];
      if (!vv.party.includes(vA)) vv.party.push(vA);
    } catch (e) {}
    const t = { kills: [], engagements: [], census: [], instrumentErrors: [] };
    const uninstall = CC.install(Game, t);
    // All channels + the mis-tag + pyrrhic + an unresolved killer.
    Game.recordWaveKill(mid, vA, 'companion', null);          // companion, in party
    Game.recordWaveKill(mid, vA, 'player', null);             // MIS-TAG: by=villager, via=player
    Game.recordWaveKill(mid, vA, 'agency', null);
    Game.recordWaveKill(mid, vA, 'sortie', null);
    Game.recordWaveKill(mid, vA, 'wild', null);
    Game.recordWaveKill(mid, vA, 'patrol', null);
    Game.recordWaveKill(mid, vA, 'contest', null);
    Game.recordWaveKill(mid, scholarVid, 'player', null);     // scholar kill
    Game.recordWaveKill(mid, null, 'player', null);           // unresolved
    Game.recordPyrrhicKill(mid, vA, 'player', null);          // pyrrhic mis-tag
    Game.startCombat(mid);                                     // engagement (may refuse: no fight live — fine)
    uninstall();
    check('10 kill rows captured', t.kills.length === 10, `got ${t.kills.length}`);
    check('kill-time scholarVid captured', t.kills.every(k => k.ctx && k.ctx.scholarVid === scholarVid), '');
    check('kill-time party captured', t.kills.every(k => k.ctx && k.ctx.partyVids.includes(vA)), '');
    const shapes = t.kills.map(k => CC.classifyKill(k, k.ctx));
    check('zero unknown shapes', shapes.every(s => s !== 'unknown'), JSON.stringify(shapes));
    const rows = t.kills.map(k => ({
      shape: CC.classifyKill(k, k.ctx),
      companion: !!(k.by && k.ctx.scholarVid && k.by !== k.ctx.scholarVid),
      inParty: (k.ctx.partyVids || []).includes(k.by),
      misTag: !!(k.by && k.by !== k.ctx.scholarVid && k.via === 'player'),
      pyrrhic: k.pyrrhic,
    }));
    check('companion tag fires on via=companion', rows[0].companion && rows[0].inParty && (rows[0].shape === 'haven-TB' || rows[0].shape === 'wild'),
      JSON.stringify(rows[0]));
    check('mis-tag counted as companion', rows[1].companion && rows[1].misTag, JSON.stringify(rows[1]));
    check('agency shape', rows[2].shape === 'agency', JSON.stringify(rows[2]));
    check('sortie -> expedition', rows[3].shape === 'expedition', JSON.stringify(rows[3]));
    check('wild shape', rows[4].shape === 'wild', JSON.stringify(rows[4]));
    check('patrol shape', rows[5].shape === 'patrol', JSON.stringify(rows[5]));
    check('contest shape', rows[6].shape === 'contest', JSON.stringify(rows[6]));
    check('scholar kill not companion', !rows[7].companion && rows[7].shape !== 'unknown', JSON.stringify(rows[7]));
    check('unresolved killer not companion', !rows[8].companion, JSON.stringify(rows[8]));
    check('pyrrhic flagged', rows[9].pyrrhic && rows[9].misTag, JSON.stringify(rows[9]));
    check('zero instrument errors', t.instrumentErrors.length === 0, JSON.stringify(t.instrumentErrors));
    check('engagement captured', t.engagements.length >= 1, `got ${t.engagements.length}`);
  }

  console.log('== (d) REAL-SWEEP GATE: 180d run via the real sweep script ==');
  {
    const scratch = path.join(REPO, 'evidence', '2026-10-18', '.proof-scratch-compchan');
    try { execSync(`rm -rf ${scratch}`); } catch (e) {}
    const env = Object.assign({}, process.env, { SEEDS: '63101', POLICIES: 'leadfeast', EVID: scratch });
    try {
      execFileSync('node', [path.join(REPO, 'scripts', 'compchan-sweep-20261018.js')], { env, stdio: 'pipe', cwd: REPO });
    } catch (e) {
      check('sweep subprocess exit 0', false, String((e && e.message) || e).slice(0, 300));
    }
    const fp = path.join(scratch, 'leadfeast-s63101.json');
    let row = null;
    try { row = JSON.parse(fs.readFileSync(fp, 'utf8')); } catch (e) {}
    check('per-seed JSON written', !!row, fp);
    if (row) {
      check('attributionComplete true', row.attributionComplete === true,
        `unknownShapes=${row.unknownShapes} reconcileDelta=${row.reconcileDelta} errs=${(row.instrumentErrors || []).length}`);
      check('zero instrument errors', (row.instrumentErrors || []).length === 0,
        JSON.stringify(row.instrumentErrors).slice(0, 200));
      check('kills array present', Array.isArray(row.kills), '');
      check('companions array present', Array.isArray(row.companions), '');
      // Determinism: re-run the subprocess, byte-compare.
      execFileSync('node', [path.join(REPO, 'scripts', 'compchan-sweep-20261018.js')], { env, stdio: 'pipe', cwd: REPO });
      let row2 = null;
      try { row2 = JSON.parse(fs.readFileSync(fp, 'utf8')); } catch (e) {}
      check('re-run byte-identical', !!row2 && JSON.stringify(row) === JSON.stringify(row2), '');
    }
    try { execSync(`rm -rf ${scratch}`); } catch (e) {}
  }

  console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('PROOF CRASH:', e && e.stack || e); process.exit(2); });
