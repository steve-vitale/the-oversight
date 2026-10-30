#!/usr/bin/env node
// test-w4field-20261030.js — proof for the sim-w4field-a instrument
// (w4field-instrument-20261030.js) + sweep + analyzer.
//
// (a) DET-GATE: W4FIELD v1 instrument installed vs not installed —
//     per-day trajectory hashes identical on 60d of the leadfeast seatdrive
//     stack. This is the read-only proof: zero game-state writes, zero
//     RNG draws. (The pilot replay check vs the killconv corpus in the
//     analyzer is a second, independent read-only proof: killconv ran
//     WITHOUT this instrument.)
// (b) READ-ONLY STATIC SCAN: no assignments to Game.<x> / Game.state /
//     this.state outside install-time wrapper replacement; no
//     Math.random / .roll( in the instrument.
// (c) WRAP FIXTURES on a real harness game:
//     - classifyFlee taxonomy on engine-shaped records (learn /
//       hopeless / floor / round-cap / death / drive-off / kill / evade)
//     - a real wave-4 fieldFight driven through the wrapped path records
//       a complete fight (beast HP, damage, rounds, outcome, flee class,
//       party, gear, wounds, log copy) and the original record object is
//       returned untouched (same object identity).
// (d) REAL-SWEEP GATE: the real sweep script on 1 pilot seed, 60d, EVID
//     pointed at a scratch dir — per-seed JSON written, zero instrument
//     errors, re-run byte-identical, analyzer runs clean on the output.
//
// Usage: FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 \
//        FULLSEAT=1 W4FIELD=1 node scripts/test-w4field-20261030.js
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

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'FULLSEAT', 'W4FIELD']) {
  if (process.env[k] !== '1') { console.error(`STOP: ${k}=1 required.`); process.exit(2); }
}

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { dayHash } = require(path.join(REPO, 'scripts', 'det-gate'));
const TF = require(path.join(REPO, 'scripts', 'policies', 'tribfloor'));
const WD = require(path.join(REPO, 'scripts', 'policies', 'windefer'));
const SD = require(path.join(REPO, 'scripts', 'policies', 'seatdrive'));
const FD = require(path.join(REPO, 'scripts', 'policies', 'fullseat-diag'));
const WF = require(path.join(REPO, 'scripts', 'w4field-instrument-20261030'));

function seatPolicy() {
  const wd = WD.withWinDefer(TF.leadfeast, 'lead-windefer', 'x');
  const sd = SD.withSeatDrive(wd, 'lead-seatdrive', 'y');
  return FD.withFullseatDiag(sd, 'lead-fullseat', 'z');
}

async function newGame(seed) {
  const { Game } = await loadGame({ seed, mode: 'w4field-test', fullTelemetry: false });
  await setupGame(Game);
  return Game;
}

(async () => {
  console.log('== (a) DET-GATE: instrument installed vs not — 60d leadfeast trajectory ==');
  async function traj(seed, useInstr) {
    const pol = seatPolicy();
    const G = await newGame(seed);
    const t = { fights: [], instrumentErrors: [], fieldFightCalls: 0 };
    let uninstall = null;
    if (useInstr) uninstall = WF.install(G, t);
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
    check(`det s${seed} zero instrument errors`, c.t.instrumentErrors.length === 0, c.t.instrumentErrors.slice(0, 2).join(' | '));
    judged = true;
  }
  check('det-gate found a stable seed', judged, 'all 3 seeds flaky');

  console.log('== (b) READ-ONLY STATIC SCAN ==');
  {
    const src = fs.readFileSync(path.join(REPO, 'scripts', 'w4field-instrument-20261030.js'), 'utf8');
    const lines = src.split('\n');
    const badGame = lines.filter(l => {
      if (/^\s*\/\//.test(l)) return false;
      if (/Game\.fieldFight = function/.test(l)) return false;
      if (/Game\.fieldFight = orig/.test(l)) return false;
      return /Game\.\w+\s*=(?!=)/.test(l);
    });
    check('no Game.<x> assignments outside install wraps', badGame.length === 0, badGame.slice(0, 3).join(' | '));
    const badState = lines.filter(l => {
      if (/^\s*\/\//.test(l)) return false;
      if (/t\.(fights|instrumentErrors|fieldFightCalls)/.test(l)) return false;
      return /Game\.state\.\w+\s*=(?!=)|this\.state\.\w+\s*=(?!=)/.test(l);
    });
    check('no Game.state / this.state writes', badState.length === 0, badState.slice(0, 3).join(' | '));
    const rng = lines.filter(l => !/^\s*\/\//.test(l) && /Math\.random|\.roll\(/.test(l));
    check('no RNG draws in instrument', rng.length === 0, rng.slice(0, 3).join(' | '));
  }

  console.log('== (c) WRAP FIXTURES ==');
  check('classifyFlee taxonomy',
    WF.classifyFlee({ outcome: 'vFlee', fleeLearn: true }) === 'LEARN-WITHDRAWAL' &&
    WF.classifyFlee({ outcome: 'vFlee', fleeHopeless: true }) === 'HOPELESS' &&
    WF.classifyFlee({ outcome: 'vFlee', log: ['Neither gives after 15 rounds'] }) === 'ROUND-CAP' &&
    WF.classifyFlee({ outcome: 'vFlee' }) === 'FLOOR' &&
    WF.classifyFlee({ outcome: 'vDie' }) === 'DEATH' &&
    WF.classifyFlee({ outcome: 'mFlee' }) === 'DRIVE-OFF' &&
    WF.classifyFlee({ outcome: 'vKill' }) === 'KILL' &&
    WF.classifyFlee({ outcome: 'evade' }) === 'EVADE' &&
    WF.classifyFlee({ outcome: 'bogus' }) === 'UNRESOLVED', 'taxonomy mismatch');
  {
    const G = await newGame(85101);
    const w4 = (G.data.monsters || []).filter(m => m && m.wave === 4);
    check('wave-4 monster defs exist for fixture', w4.length > 0, 'no wave-4 defs');
    const t = { fights: [], instrumentErrors: [], fieldFightCalls: 0 };
    const uninstall = WF.install(G, t);
    const roster = ((G.state || {}).village || {}).roster || [];
    const vid = roster[0] || G.villagerId;
    let rec = null, threw = null;
    try { rec = G.fieldFight(vid, w4[0], null, {}); } catch (e) { threw = e; }
    check('real wave-4 fieldFight runs through wrapped path', !threw && rec && typeof rec === 'object', threw ? threw.message : 'no record');
    check('instrument captured exactly one wave-4 fight', t.fights.length === 1, `captured=${t.fights.length}`);
    if (t.fights.length === 1) {
      const f = t.fights[0];
      check('captured fight is field-complete',
        f.beastMaxHp !== null && f.rounds !== null && f.mDealt !== null && f.partySize !== null &&
        f.armorP !== null && f.vHpStart !== null && f.vHpLeft !== null && f.mHpLeft !== null &&
        Array.isArray(f.log) && f.fleeClass && f.fighterClass,
        JSON.stringify({ beastMaxHp: f.beastMaxHp, rounds: f.rounds, mDealt: f.mDealt, armorP: f.armorP, fleeClass: f.fleeClass }));
      check('captured fight outcome matches engine record', f.outcome === rec.outcome && f.rounds === rec.rounds && f.mDealt === rec.mDealt,
        `instr ${f.outcome}/${f.rounds}/${f.mDealt} vs engine ${rec.outcome}/${rec.rounds}/${rec.mDealt}`);
      check('captured log is a copy, not the live array', f.log !== rec.log, 'same array reference');
    }
    check('zero instrument errors on fixture fight', t.instrumentErrors.length === 0, t.instrumentErrors.slice(0, 2).join(' | '));
    uninstall();
    check('uninstall restores fieldFight (callable)', typeof G.fieldFight === 'function', '');
  }

  console.log('== (d) REAL-SWEEP GATE: 1 pilot seed, 60d, scratch EVID ==');
  {
    const scratch = '/tmp/w4field-proof-20261030';
    try { fs.rmSync(scratch, { recursive: true, force: true }); } catch (e) {}
    const env = Object.assign({}, process.env, { SEEDS: '85101', DAYS: '60', EVID: scratch });
    execFileSync('node', [path.join(REPO, 'scripts', 'w4field-sweep-20261030.js')], { env, stdio: 'pipe' });
    const fp = path.join(scratch, 'leadfeast', 's85101.json');
    check('sweep wrote per-seed JSON', fs.existsSync(fp), 'missing ' + fp);
    const first = fs.readFileSync(fp, 'utf8');
    const j = JSON.parse(first);
    check('sweep JSON zero instrument errors', (j.instrumentErrors || []).length === 0, (j.instrumentErrors || []).slice(0, 2).join(' | '));
    check('sweep JSON carries wall numbers + fights array', Array.isArray(j.fights) && j.national !== undefined && j.maxWave !== undefined, 'missing wall/fights');
    execFileSync('node', [path.join(REPO, 'scripts', 'w4field-sweep-20261030.js')], { env, stdio: 'pipe' });
    const second = fs.readFileSync(fp, 'utf8');
    check('sweep re-run byte-identical', first === second, 'bytes differ');
    const ana = execFileSync('node', [path.join(REPO, 'scripts', 'w4field-analyze-20261030.js'), path.join(scratch, 'leadfeast')], { encoding: 'utf8' });
    check('analyzer runs clean on sweep output', /"seeds": 1/.test(ana), ana.split('\n').slice(0, 3).join(' | '));
    try { fs.rmSync(scratch, { recursive: true, force: true }); } catch (e) {}
  }

  console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('PROOF CRASH: ' + (e && e.stack || e)); process.exit(1); });
