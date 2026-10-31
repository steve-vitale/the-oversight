#!/usr/bin/env node
// test-herald-20261030.js — proof for the sim-herald-b instrument
// (herald-instrument-20261030.js) + sweep + analyzer.
//
// (a) DET-GATE: HERALD v1 instrument installed vs not installed —
//     per-day trajectory hashes identical on 60d of the leadfeast seatdrive
//     stack. This is the read-only proof: zero game-state writes, zero RNG.
// (b) READ-ONLY STATIC SCAN: no Game.state writes, no Math.random, no
//     titanMusterReady call (that helper can create state.titans), no
//     outcomes.push in the instrument body (comments stripped first).
// (c) UNIT FIXTURES: classifyCaller taxonomy, classifyFieldFight
//     taxonomy, musterProxy unique-counting (allied dupes + haven
//     string/object forms) on a fake Game.
// (d) REAL-SWEEP GATE: the real sweep script on 1 pilot seed, 60d, EVID
//     pointed at a scratch dir — per-seed JSON written, zero instrument
//     errors, re-run byte-identical, analyzer runs clean on the output.
//
// Usage: FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 \
//        FULLSEAT=1 HERALD=1 node scripts/test-herald-20261030.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log(`  ok   ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'FULLSEAT', 'HERALD']) {
  if (process.env[k] !== '1') { console.error(`STOP: ${k}=1 required.`); process.exit(2); }
}

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { dayHash } = require(path.join(REPO, 'scripts', 'det-gate'));
const TF = require(path.join(REPO, 'scripts', 'policies', 'tribfloor'));
const WD = require(path.join(REPO, 'scripts', 'policies', 'windefer'));
const SD = require(path.join(REPO, 'scripts', 'policies', 'seatdrive'));
const FD = require(path.join(REPO, 'scripts', 'policies', 'fullseat-diag'));
const HI = require(path.join(REPO, 'scripts', 'herald-instrument-20261030'));

function seatPolicy() {
  const wd = WD.withWinDefer(TF.leadfeast, 'lead-windefer', 'x');
  const sd = SD.withSeatDrive(wd, 'lead-seatdrive', 'y');
  return FD.withFullseatDiag(sd, 'lead-fullseat', 'z');
}

async function newGame(seed) {
  const { Game } = await loadGame({ seed, mode: 'herald-test', fullTelemetry: false });
  await setupGame(Game);
  return Game;
}

(async () => {
  console.log('== (a) DET-GATE: instrument installed vs not — 60d leadfeast trajectory ==');
  async function traj(seed, useInstr) {
    const pol = seatPolicy();
    const G = await newGame(seed);
    const t = { attempts: [], tbOutcomes: {}, fieldFights: [], kills: [], musterEvents: [], census: [], transcripts: [], instrumentErrors: [] };
    let uninstall = null;
    if (useInstr) uninstall = HI.install(G, t);
    const hs = [];
    const wrapped = Object.assign({}, pol, {
      daily(Gm, ctx) { hs.push(Gm.state.scholar.day + ':' + dayHash(Gm)); return pol.daily(Gm, ctx); },
    });
    await quietLog(async () => { await runDays(G, wrapped, { days: 60, manifest: undefined, sampleEvery: 1 }); });
    if (uninstall) uninstall();
    return { hashes: hs.join('\n'), t };
  }
  let judged = false;
  for (const seed of [85101, 85102, 85103]) {
    if (judged) break;
    const a = await traj(seed, false);
    const b = await traj(seed, false);
    if (a.hashes !== b.hashes) { console.log(`  .. s${seed}: noinstr-vs-noinstr UNSTABLE — seed skipped`); continue; }
    const c = await traj(seed, true);
    check(`det s${seed} trajectory identical with instrument`, c.hashes === a.hashes, 'trajectories diverged');
    check(`det s${seed} instrument recorded census`, c.t.census.length > 0, `census=${c.t.census.length}`);
    check(`det s${seed} census rows carry uw+rank only`, c.t.census.every(r => r.uw !== undefined && 'rank' in r && !('r4' in r) && !('r5' in r)), 'census shape wrong');
    check(`det s${seed} zero instrument errors`, c.t.instrumentErrors.length === 0, c.t.instrumentErrors.slice(0, 2).join(' | '));
    judged = true;
  }
  check('det-gate found a stable seed', judged, 'all 3 seeds flaky');

  console.log('== (b) READ-ONLY STATIC SCAN ==');
  {
    const raw = fs.readFileSync(path.join(REPO, 'scripts', 'herald-instrument-20261030.js'), 'utf8');
    // Strip block comments and line comments for the scan (the header
    // NAMES titanMusterReady to explain why it is never called).
    const noBlock = raw.replace(/\/\*[\s\S]*?\*\//g, '');
    const codeLines = noBlock.split('\n').map(l => l.replace(/\/\/.*$/, ''));
    const code = codeLines.join('\n');
    const badGame = codeLines.filter(l => {
      const m = l.match(/Game\.\w+\s*=(?!=)/);
      if (!m) return false;
      if (/Game\[name\] = function|Game\.say = function|Game\.startCombat = function|Game\.tbEnd = function|Game\.fieldFight = function|Game\.recordWaveKill = function|Game\.sleep = function|Game\[k\] = orig\[k\]/.test(l)) return false;
      return true;
    });
    check('no Game.<x> assignments outside install wraps', badGame.length === 0, badGame.slice(0, 3).join(' | '));
    const badState = codeLines.filter(l => /Game\.state\.\w+\s*=(?!=)|this\.state\.\w+\s*=(?!=)/.test(l));
    check('no Game.state / this.state writes', badState.length === 0, badState.slice(0, 3).join(' | '));
    check('no RNG draws in instrument', !/Math\.random|\.roll\(/.test(code), 'rng token present');
    check('no titanMusterReady call in instrument body', !/titanMusterReady\s*\(/.test(code), 'titanMusterReady called');
    check('no outcomes.push in instrument body', !/outcomes\.push/.test(code), 'outcomes.push present');
    check('no Game.save in instrument body', !/Game\.save/.test(code), 'Game.save present');
  }

  console.log('== (c) UNIT FIXTURES ==');
  check('classifyCaller taxonomy',
    HI.classifyCaller(['deedHunt@capable.js:995']) === 'policy-hunt'
    && HI.classifyCaller(['contestChoose@contests.js:100']) === 'contest'
    && HI.classifyCaller(['faceFeastDraw@feastBuff.js:520']) === 'feast-draw'
    && HI.classifyCaller([]) === 'unknown'
    && HI.classifyCaller(['somethingElse@game.js:1']) === 'other-game',
    'caller classes wrong');
  check('classifyFieldFight taxonomy',
    HI.classifyFieldFight({ outcome: 'vKill' }) === 'vKill'
    && HI.classifyFieldFight({ outcome: 'evade' }) === 'evade'
    && HI.classifyFieldFight({ outcome: 'bogus' }) === 'unresolved'
    && HI.classifyFieldFight(null) === 'unresolved',
    'field classes wrong');
  {
    const fake = {
      data: { titans: { herald: { minAllies: 10 } } },
      state: { titans: { musters: { herald: {
        allies: [{ villageId: 'a', vid: 'v1' }, { villageId: 'a', vid: 'v1' }, { villageId: 'b', vid: 'v2' }],
        haven: ['h1', { vid: 'h1' }, { vid: 'h2' }],
      } } } },
    };
    const mp = HI.musterProxy(fake, 'herald');
    check('musterProxy unique counting', mp.present && mp.alliesRaw === 3 && mp.alliesUnique === 2
      && mp.havenRaw === 3 && mp.havenUnique === 2 && mp.need === 10 && mp.readyProxy === false,
      JSON.stringify(mp));
    check('musterProxy absent muster', HI.musterProxy(fake, 'finale').present === false, 'absent muster not false');
  }

  console.log('== (d) REAL-SWEEP GATE: 1 pilot seed, 60d, scratch EVID, re-run byte-identical ==');
  {
    const scratch = path.join(REPO, 'evidence', '2026-10-31', 'perseed-herald-scratch');
    const env = Object.assign({}, process.env, { SEEDS: '85101', DAYS: '60', EVID: scratch });
    const run = () => execFileSync('node', [path.join(REPO, 'scripts', 'herald-sweep-20261030.js')], { env, cwd: REPO, encoding: 'utf8' });
    const out1 = run();
    const fp = path.join(scratch, 'leadfeast', 's85101.json');
    const first = fs.readFileSync(fp, 'utf8');
    const j = JSON.parse(first);
    check('scratch sweep wrote per-seed JSON', !!j && j.seed === 85101 && j.instrument === 'herald-v1', 'bad json');
    check('scratch sweep zero instrument errors', (j.instrumentErrors || []).length === 0, (j.instrumentErrors || []).slice(0, 2).join(' | '));
    check('scratch sweep attempts array present', Array.isArray(j.attempts), 'no attempts array');
    run();
    const second = fs.readFileSync(fp, 'utf8');
    check('scratch sweep re-run byte-identical', first === second, 're-run differed');
    const ana = execFileSync('node', [path.join(REPO, 'scripts', 'herald-analyze-20261030.js'), path.join(scratch, 'leadfeast')], { cwd: REPO, encoding: 'utf8' });
    const summary = JSON.parse(ana);
    check('analyzer runs clean on scratch output', summary.band.seeds === 1 && summary.startCombat !== undefined, 'analyzer summary bad');
    fs.rmSync(scratch, { recursive: true, force: true });
  }

  console.log(`\nherald proof: ${pass} passed, ${fail} failed`);
  if (fail) process.exit(1);
})().catch(e => { console.error('PROOF ERROR', e && e.stack || e); process.exit(1); });
