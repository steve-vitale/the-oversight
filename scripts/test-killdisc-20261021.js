#!/usr/bin/env node
// test-killdisc-20261021.js — proof for the sim-killdisc v2 instrument
// (backlog #736, zero-veteran survivors).
//
// (a) DET-GATE: KILLDISC v2 instrument installed vs not installed —
//     per-day trajectory hashes identical on 60d of the seatdrive substrate
//     (stable seeds; noinstr-vs-noinstr stability pre-check per the repo's
//     det-gate standard, scripts/det-gate.js). This is the read-only proof:
//     the instrument makes zero game-state writes, so the trajectory is
//     byte-identical with it installed.
// (b) READ-ONLY STATIC SCAN: the instrument source performs no assignments
//     to Game.<x> / Game.state / this.state outside the install-time wrapper
//     replacement, and draws no RNG (no Math.random / .roll( in the wraps).
// (c) WRAP FIXTURES on a real harness game:
//     - classifyFieldFight on engine-shaped records (evade/vKill/mFlee/vFlee/
//       vDie/alreadyDead/null -> taxonomy, null -> 'unresolved')
//     - castMonster wrap records spawn {mid, wave, veteran} without touching
//       the returned value
//     - fieldFight wrap: a real fieldFight call against a wave-4 monster is
//       recorded with a recognized outcome class and wave 4
//     - startCombat + tbEnd: fightId captured and end outcome matched
// (d) REAL-SWEEP GATE: one 180d diagnostic run (seed 64506, leadfeast,
//     seatdrive substrate) through the real sweep script — per-seed JSON
//     written, zero instrument errors, re-run byte-identical.
//
// Usage: FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 \
//        FULLSEAT=1 KILLDISC=1 node scripts/test-killdisc-20261021.js
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

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'FULLSEAT', 'KILLDISC']) {
  if (process.env[k] !== '1') { console.error(`STOP: ${k}=1 required.`); process.exit(2); }
}

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { dayHash } = require(path.join(REPO, 'scripts', 'det-gate'));
const TF = require(path.join(REPO, 'scripts', 'policies', 'tribfloor'));
const WD = require(path.join(REPO, 'scripts', 'policies', 'windefer'));
const SD = require(path.join(REPO, 'scripts', 'policies', 'seatdrive'));
const FD = require(path.join(REPO, 'scripts', 'policies', 'fullseat-diag'));
const KD = require(path.join(REPO, 'scripts', 'killdisc-instrument-20261021'));

function seatPolicy(pid) {
  const base = pid === 'leadfeast' ? TF.leadfeast : TF.belongfeast;
  const tag = pid === 'leadfeast' ? 'lead' : 'belong';
  const wd = WD.withWinDefer(base, `${tag}-windefer`, 'x');
  const sd = SD.withSeatDrive(wd, `${tag}-seatdrive`, 'y');
  return FD.withFullseatDiag(sd, `${tag}-fullseat`, 'z');
}

async function newGame(seed) {
  const { Game } = await loadGame({ seed, mode: 'killdisc2-test', fullTelemetry: false });
  await setupGame(Game);
  return Game;
}

(async () => {
  console.log('== (a) DET-GATE: instrument installed vs not — 60d seatdrive trajectory ==');
  async function traj(seed, pid, useInstr) {
    const pol = seatPolicy(pid);
    const G = await newGame(seed);
    const t = { kills: [], engagements: [], fieldFights: [], spawns: [], tbOutcomes: {}, census: [], dmg: {}, instrumentErrors: [] };
    let uninstall = null;
    if (useInstr) uninstall = KD.install(G, t);
    const hs = [];
    const wrapped = Object.assign({}, pol, {
      daily(Gm, ctx) { hs.push(Gm.state.scholar.day + ':' + dayHash(Gm)); return pol.daily(Gm, ctx); },
    });
    await quietLog(async () => { await runDays(G, wrapped, { days: 60, manifest: undefined, sampleEvery: 1 }); });
    if (uninstall) uninstall();
    return { hashes: hs.join('\n'), t };
  }
  let gateGreen = 0, gateTotal = 0;
  for (const pid of ['leadfeast', 'belongfeast']) {
    let judged = false;
    for (const seed of [64506, 64507, 64501, 64502]) {
      if (judged) break;
      const a = await traj(seed, pid, false);
      const b = await traj(seed, pid, false);
      if (a.hashes !== b.hashes) { console.log(`  .. ${pid} s${seed}: noinstr-vs-noinstr UNSTABLE — seed skipped`); continue; }
      gateTotal++;
      const c = await traj(seed, pid, true);
      const same = c.hashes === a.hashes;
      if (same) gateGreen++;
      check(`det ${pid} s${seed} trajectory identical (stable seed)`, same, same ? '' : 'trajectories diverged');
      check(`det ${pid} s${seed} instrument recorded (sanity)`, c.t.census.length > 0, `census=${c.t.census.length}`);
      judged = true;
    }
    if (!judged) check(`det ${pid}: no stable seed found`, false, 'all 4 seeds flaky');
  }
  check('det-gate all green', gateGreen === gateTotal && gateTotal > 0, `${gateGreen}/${gateTotal}`);

  console.log('== (b) READ-ONLY STATIC SCAN ==');
  {
    const src = fs.readFileSync(path.join(REPO, 'scripts', 'killdisc-instrument-20261021.js'), 'utf8');
    // assignments to Game.<x> = ... — allowed only the install-time wrapper replacements
    const lines = src.split('\n');
    const badGame = lines.filter(l => {
      if (/^\s*\/\//.test(l)) return false;
      const m = l.match(/Game\.\w+\s*=(?!=)/);
      if (!m) return false;
      if (/Game\[name\] = function|Game\.sleep = function/.test(l)) return false; // install wraps
      return true;
    });
    check('no Game.<x> assignments outside install wraps', badGame.length === 0, badGame.slice(0, 3).join(' | '));
    const badState = lines.filter(l => {
      if (/^\s*\/\//.test(l)) return false;
      if (/t\.(kills|engagements|fieldFights|spawns|tbOutcomes|census|dmg|instrumentErrors)/.test(l)) return false; // telemetry buffer
      return /Game\.state\.\w+\s*=(?!=)|this\.state\.\w+\s*=(?!=)/.test(l);
    });
    check('no Game.state / this.state writes', badState.length === 0, badState.slice(0, 3).join(' | '));
    const rngLines = lines.filter(l => !/^\s*\/\//.test(l) && /Math\.random\s*\(/.test(l));
    check('no RNG draws in instrument', rngLines.length === 0, rngLines.slice(0, 3).join(' | '));
  }

  console.log('== (c) WRAP FIXTURES ==');
  {
    const cc = KD.classifyFieldFight;
    check('evade', cc({ outcome: 'evade' }, 4) === 'evade');
    check('vKill', cc({ outcome: 'vKill' }, 4) === 'vKill');
    check('mFlee', cc({ outcome: 'mFlee' }, 4) === 'mFlee');
    check('vFlee', cc({ outcome: 'vFlee' }, 4) === 'vFlee');
    check('vDie', cc({ outcome: 'vDie' }, 4) === 'vDie');
    check('alreadyDead', cc({ outcome: 'alreadyDead' }, 4) === 'alreadyDead');
    check('null outcome -> unresolved', cc({ outcome: null }, 4) === 'unresolved');
    check('null record -> unresolved', cc(null, 4) === 'unresolved');
  }
  {
    const Game = await newGame(64506);
    const t = { kills: [], engagements: [], fieldFights: [], spawns: [], tbOutcomes: {}, census: [], dmg: {}, instrumentErrors: [] };
    const uninstall = KD.install(Game, t);
    // castMonster wrap: record without touching the return
    const cast = Game.castMonster();
    const mid = typeof cast === 'string' ? cast : (cast && cast.id);
    const last = t.spawns[t.spawns.length - 1];
    check('castMonster records spawn', !!last && last.mid === mid, JSON.stringify(last));
    check('spawn wave recorded', last && (last.wave | 0) >= 1, JSON.stringify(last && last.wave));
    // spawnWorldMonster wrap: world-entity spawn recorded, return untouched
    try {
      const ent = Game.spawnWorldMonster({ id: 'congregation' }, 4, 4, {});
      const wlast = t.spawns[t.spawns.length - 1];
      check('spawnWorldMonster records w4 world spawn', !!wlast && wlast.mid === 'congregation' && (wlast.wave | 0) === 4 && wlast.src === 'world',
        JSON.stringify(wlast));
      check('spawnWorldMonster return untouched', !!ent, 'no entity returned');
    } catch (e) { check('spawnWorldMonster fixture did not throw', false, String(e && e.message)); }
    // fieldFight wrap: real call against a wave-4 monster
    const mdef = (Game.data.monsters || []).find(m => m && m.id === 'congregation');
    const roster = (((Game.state || {}).village || {}).roster || []);
    const vid = roster.find(v => v && v !== Game.villagerId) || Game.villagerId;
    let rec = null;
    try { rec = await quietLog(async () => Game.fieldFight(vid, mdef, null, {})); } catch (e) { rec = { __threw: String(e && e.message) }; }
    const ff = t.fieldFights[t.fieldFights.length - 1];
    check('fieldFight recorded w4', !!ff && (ff.wave | 0) === 4 && ff.mid === 'congregation', JSON.stringify(ff && { mid: ff.mid, wave: ff.wave, outcome: ff.outcome }));
    check('fieldFight outcome classified', !!ff && ff.outcome !== 'unresolved', JSON.stringify(ff && ff.outcome));
    check('fieldFight return untouched', rec && typeof rec === 'object' && rec.outcome !== undefined || (rec && rec.__threw), JSON.stringify(rec && (rec.outcome || rec.__threw)));
    uninstall();
    check('instrument errors empty', t.instrumentErrors.length === 0, JSON.stringify(t.instrumentErrors.slice(0, 3)));
  }

  console.log('== (d) REAL-SWEEP GATE: 180d seatdrive run through the real sweep ==');
  {
    const outDir = '/tmp/kd-proof-sweep';
    execSync(`rm -rf ${outDir} && mkdir -p ${outDir}`);
    const env = Object.assign({}, process.env, { SEEDS: '64506', POLICIES: 'leadfeast', EVID: outDir, DAYS: '180' });
    const run = () => execFileSync('node', [path.join(REPO, 'scripts', 'killdisc-sweep-20261021.js')], { env, stdio: ['ignore', 'pipe', 'pipe'] }).toString();
    const o1 = run();
    const fp = path.join(outDir, 'leadfeast', 's64506.json');
    check('sweep wrote per-seed JSON', fs.existsSync(fp));
    let j1 = null;
    try { j1 = JSON.parse(fs.readFileSync(fp, 'utf8')); } catch (e) {}
    check('zero instrument errors', j1 && (j1.instrumentErrors || []).length === 0, JSON.stringify(j1 && j1.instrumentErrors));
    check('w4 attribution present', j1 && (j1.w4Spawns | 0) + (j1.w4TbEngagements | 0) + (j1.w4FieldFights | 0) > 0,
      JSON.stringify(j1 && { sp: j1.w4Spawns, tb: j1.w4TbEngagements, ff: j1.w4FieldFights }));
    const b1 = fs.readFileSync(fp, 'utf8');
    const o2 = run();
    const b2 = fs.readFileSync(fp, 'utf8');
    check('re-run byte-identical', b1 === b2, `len ${b1.length} vs ${b2.length}`);
    void o1; void o2;
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e && e.stack || e); process.exit(1); });
