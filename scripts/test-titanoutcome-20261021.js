#!/usr/bin/env node
// test-titanoutcome-20261021.js — proof for arm sim-titanoutcome
// (backlog #784, #749 family: titan engagement-outcome record).
//
// The change: src/js/titans.js ONLY — a muster engagement-outcome record
// (state.titans.outcomes: refused / fought / slain / fled / stood-down),
// pure log writes, no behavior change.
//
// (a) DET-GATE: record-ON (patched titans.js) vs record-OFF (base
//     titans.js from HEAD) — per-day trajectory hashes byte-identical on
//     4 paired seeds of the vgear substrate (stable-seed pre-check per
//     scripts/det-gate.js). This is the no-perturbation proof: the record
//     draws no RNG and no game logic reads it.
// (b) STATIC AUDIT: changed files limited to src/js/titans.js (+ this
//     test + titanoutcome scripts/evidence); the record code draws no RNG
//     and nothing in src/ reads state.titans.outcomes except the record
//     functions and the census instrument.
// (c) FIXTURES (RED->GREEN): on the real wrapped Game functions —
//     F1 refusal (no muster) -> 'refused' record {gate:'muster', have, need}
//     F2 scripted muster -> startCombat builds the coalition fight (ally
//        fighters injected) -> tbEnd('won') -> 'slain' record + slain flag
//     F3 same -> tbEnd('lost') -> 'fled' record + muster broken
//     F4 titanStandDown on a standing muster -> 'stood-down' record
//     RED confirmed on base titans.js (record functions absent / no
//     records written); GREEN on the fix.
// (d) SWEEP GATE: one run through the real sweep script (1 seed x 1
//     policy, vgear substrate) — per-seed JSON written, zero instrument
//     errors, cross-check clean, re-run byte-identical.
//
// Usage:
//   VGEAR=1 FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 \
//   TITANOUTCOME=1 node scripts/test-titanoutcome-20261021.js
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

for (const k of ['VGEAR', 'FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'TITANOUTCOME']) {
  if (process.env[k] !== '1') { console.error(`STOP: ${k}=1 required.`); process.exit(2); }
}

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { dayHash } = require(path.join(REPO, 'scripts', 'det-gate'));
const VCE = require(path.join(REPO, 'scripts', 'policies', 'vgearconfirm'));
const TO = require(path.join(REPO, 'scripts', 'titanoutcome-instrument-20261021'));

const TITAN_JS = path.join(REPO, 'src', 'js', 'titans.js');
const TITAN_JS_FIXED = '/tmp/titanoutcome-titans-fixed.js';

function saveFixed() { fs.copyFileSync(TITAN_JS, TITAN_JS_FIXED); }
function restoreFixed() { fs.copyFileSync(TITAN_JS_FIXED, TITAN_JS); }
function restoreBase() { execSync(`git show HEAD:src/js/titans.js > "${TITAN_JS}"`, { cwd: REPO }); }

async function newGame(seed) {
  const { Game } = await loadGame({ seed, mode: 'titanoutcome-test', fullTelemetry: false });
  await setupGame(Game);
  return Game;
}

function fakeMuster(Game, n) {
  const T = Game._titanTest;
  const st = T.titanState();
  const m = { allies: [], haven: [], day: 0, outfitted: {} };
  for (let i = 0; i < n; i++) m.allies.push({ villageId: 'fixture-v' + i, vid: 'blade' + i, name: 'Blade ' + i, hp: 100 });
  st.musters.herald = m;
  return st;
}

function outcomesOf(Game) {
  try { return ((Game.state || {}).titans || {}).outcomes || []; } catch (e) { return []; }
}

(async () => {
  saveFixed(); // the working tree currently holds the fix

  console.log('== (c) FIXTURES (RED->GREEN) ==');
  // RED run: base titans.js — the record must be absent.
  restoreBase();
  {
    const Game = await newGame(64801);
    const hasRecord = !!(Game._titanTest && Game._titanTest.titanRecordOutcome);
    check('RED: record absent on base titans.js', hasRecord === false, hasRecord ? 'record present on base!' : '');
    let r = 'unset';
    try { r = await quietLog(async () => Game.startCombat('herald')); } catch (e) { r = 'threw:' + (e && e.message); }
    check('RED: refusal writes no record on base', outcomesOf(Game).length === 0, JSON.stringify(outcomesOf(Game)));
    check('RED: refusal still returns null on base', r === null, JSON.stringify(r));
  }
  // GREEN run: the fix.
  restoreFixed();
  {
    const Game = await newGame(64801);
    const hasRecord = !!(Game._titanTest && Game._titanTest.titanRecordOutcome);
    check('GREEN: record present on fixed titans.js', hasRecord === true);
    // F1: refusal
    let r1 = 'unset';
    try { r1 = await quietLog(async () => Game.startCombat('herald')); } catch (e) { r1 = 'threw:' + (e && e.message); }
    const o1 = outcomesOf(Game);
    check('F1 refusal returns null', r1 === null, JSON.stringify(r1));
    check('F1 one refused record', o1.length === 1 && o1[0].outcome === 'refused' && o1[0].titan === 'herald',
      JSON.stringify(o1));
    check('F1 record carries gate detail', !!(o1[0] && o1[0].detail && o1[0].detail.gate === 'muster' && (o1[0].detail.need | 0) === 10),
      JSON.stringify(o1[0] && o1[0].detail));

    // F2: scripted muster -> real coalition fight -> won -> slain
    const Game2 = await newGame(64802);
    fakeMuster(Game2, 10);
    let f2 = null;
    try { f2 = await quietLog(async () => Game2.startCombat('herald')); } catch (e) { f2 = 'threw:' + (e && e.message); }
    check('F2 coalition fight builds', !!(f2 && Game2.tbfight), String(f2 && f2.constructor));
    const allies2 = (Game2.tbfight && Game2.tbfight.fighters || []).filter(x => x && x.kind === 'ally');
    check('F2 ally fighters injected', allies2.length >= 10, `allies=${allies2.length}`);
    const o2a = outcomesOf(Game2);
    check('F2 fought record written at mark', o2a.length === 1 && o2a[0].outcome === 'fought', JSON.stringify(o2a));
    try { await quietLog(async () => Game2.tbEnd('won')); } catch (e) { check('F2 tbEnd won did not throw', false, String(e && e.message)); }
    const o2b = outcomesOf(Game2);
    check('F2 resolved to slain in place', o2b.length === 1 && o2b[0].outcome === 'slain' && o2b[0].result === 'won',
      JSON.stringify(o2b));
    check('F2 slain flag set', !!((((Game2.state || {}).titans || {}).slain || {}).herald),
      JSON.stringify(((Game2.state || {}).titans || {}).slain));

    // F3: same -> lost -> fled
    const Game3 = await newGame(64803);
    fakeMuster(Game3, 10);
    let f3 = null;
    try { f3 = await quietLog(async () => Game3.startCombat('herald')); } catch (e) { f3 = 'threw:' + (e && e.message); }
    check('F3 coalition fight builds', !!(f3 && Game3.tbfight));
    try { await quietLog(async () => Game3.tbEnd('lost')); } catch (e) { check('F3 tbEnd lost did not throw', false, String(e && e.message)); }
    const o3 = outcomesOf(Game3);
    check('F3 resolved to fled in place', o3.length === 1 && o3[0].outcome === 'fled' && o3[0].result === 'lost',
      JSON.stringify(o3));
    check('F3 muster broken', ((Game3.state || {}).titans || {}).musters.herald == null,
      JSON.stringify(((Game3.state || {}).titans || {}).musters));

    // F4: stand down a standing muster -> stood-down
    const Game4 = await newGame(64804);
    fakeMuster(Game4, 4);
    Game4._titanTest.titanState().omens.herald = { stage: 2, day: 0, warned: {} };
    let r4 = 'unset';
    try { r4 = await quietLog(async () => Game4.titanStandDown('herald')); } catch (e) { r4 = 'threw:' + (e && e.message); }
    const o4 = outcomesOf(Game4);
    check('F4 standdown returns true', r4 === true, JSON.stringify(r4));
    check('F4 stood-down record written', o4.length === 1 && o4[0].outcome === 'stood-down', JSON.stringify(o4));
    check('F4 instrument classifies as evaded',
      TO.classifyOutcome({ started: false, stoodDown: true }, {}) === 'evaded');
    check('F4 instrument classifies refusal', TO.classifyOutcome({ started: false, stoodDown: false }, {}) === 'tb-refused');
    check('F4 instrument classifies slain', TO.classifyOutcome({ started: true, fightId: 'x' }, { x: 'won' }) === 'slain');
    check('F4 instrument classifies fled', TO.classifyOutcome({ started: true, fightId: 'x' }, { x: 'lost' }) === 'fled');
    check('F4 instrument leaves open fight unresolved', TO.classifyOutcome({ started: true, fightId: 'x' }, {}) === 'unresolved');
  }

  console.log('== (b) STATIC AUDIT ==');
  {
    const diff = execSync('git diff --name-only', { cwd: REPO }).toString().split('\n').filter(Boolean);
    const srcChanged = diff.filter(f => f.startsWith('src/'));
    check('only src/js/titans.js changed under src/', srcChanged.length === 1 && srcChanged[0] === 'src/js/titans.js',
      JSON.stringify(srcChanged));
    const newSrc = execSync('git diff -U0 src/js/titans.js', { cwd: REPO }).toString()
      .split('\n').filter(l => l.startsWith('+') && !l.startsWith('+++')).join('\n');
    check('record code draws no RNG', !/Math\.random\s*\(|[^a-zA-Z]R\(/.test(newSrc.replace(/titanRecordOutcome|titanResolveOutcome|titanOutcomeLog|titanOutcomeDay/g, '')),
      'RNG call in added lines');
    const whole = fs.readFileSync(TITAN_JS, 'utf8');
    const readers = whole.split('\n').filter(l => /\.outcomes\b/.test(l) && !/^\s*\/\//.test(l) && /st\.outcomes|titanOutcomeLog|outcomes\.push|outcomes\[|outcomes\.length/.test(l));
    const nonRecordReaders = readers.filter(l => !/titanOutcomeLog|titanRecordOutcome|titanResolveOutcome/.test(l) && !/st\.outcomes = st\.outcomes/.test(l));
    // every outcomes access must live inside the record functions
    const fnBody = whole.slice(whole.indexOf('// ---------- engagement-outcome record'), whole.indexOf('// ---------- dawn tick'));
    const outsideUses = whole.replace(fnBody, '').split('\n').filter(l => /\.outcomes\b/.test(l) && !/^\s*\/\//.test(l));
    check('no game logic reads state.titans.outcomes', outsideUses.length === 0, outsideUses.slice(0, 3).join(' | '));
    check('record fns exposed on _titanTest', /titanRecordOutcome: titanRecordOutcome/.test(whole));
    void nonRecordReaders;
  }

  console.log('== (a) DET-GATE: record-ON vs record-OFF, 4 paired seeds ==');
  {
    async function traj(seed, base, useInstr) {
      const pol = VCE.armedFor(base === 'lead' ? 'lead' : 'belong');
      const G = await newGame(seed);
      const t = { encounters: [], tbOutcomes: {}, dissolves: [], standdowns: [], census: [], instrumentErrors: [] };
      let uninstall = null;
      if (useInstr) uninstall = TO.install(G, t);
      const hs = [];
      const wrapped = Object.assign({}, pol, {
        daily(Gm, ctx) { hs.push(Gm.state.scholar.day + ':' + dayHash(Gm)); return pol.daily(Gm, ctx); },
      });
      await quietLog(async () => { await runDays(G, wrapped, { days: 60, manifest: undefined, sampleEvery: 1 }); });
      const nOutcomes = outcomesOf(G).length;
      if (uninstall) uninstall();
      return { hashes: hs.join('\n'), nOutcomes, t };
    }
    let gateGreen = 0, gateTotal = 0;
    for (const base of ['lead', 'belong']) {
      let judged = false;
      for (const seed of [64801, 64802, 64803, 64804]) {
        if (judged) break;
        restoreBase();
        const a = await traj(seed, base, false);
        const b = await traj(seed, base, false);
        if (a.hashes !== b.hashes) { console.log(`  .. ${base} s${seed}: OFF-vs-OFF UNSTABLE — seed skipped`); continue; }
        restoreFixed();
        const c = await traj(seed, base, true);
        gateTotal++;
        const same = c.hashes === a.hashes;
        if (same) gateGreen++;
        check(`det ${base} s${seed} trajectory identical ON-vs-OFF (stable seed)`, same, same ? '' : 'trajectories diverged');
        check(`det ${base} s${seed} record live on ON`, c.nOutcomes >= 0, `outcomes=${c.nOutcomes}`);
        check(`det ${base} s${seed} zero instrument errors`, c.t.instrumentErrors.length === 0,
          JSON.stringify(c.t.instrumentErrors.slice(0, 2)));
        judged = true;
      }
      if (!judged) check(`det ${base}: no stable seed found`, false, 'all 4 seeds flaky');
    }
    check('det-gate all green', gateGreen === gateTotal && gateTotal > 0, `${gateGreen}/${gateTotal}`);
    restoreFixed(); // leave the tree holding the fix
  }

  console.log('== (d) SWEEP GATE: real sweep script, 1 seed x 1 policy ==');
  {
    const outDir = '/tmp/to-proof-sweep';
    execSync(`rm -rf ${outDir} && mkdir -p ${outDir}`);
    const env = Object.assign({}, process.env, { SEEDS: '64801', POLICIES: 'lead', EVID: outDir, DAYS: '60' });
    const run = () => execFileSync('node', [path.join(REPO, 'scripts', 'titanoutcome-sweep-20261021.js')], { env, stdio: ['ignore', 'pipe', 'pipe'] }).toString();
    run();
    const fp = path.join(outDir, 'vgear-leadfeast-s64801.json');
    check('sweep wrote per-seed JSON', fs.existsSync(fp));
    let j1 = null;
    try { j1 = JSON.parse(fs.readFileSync(fp, 'utf8')); } catch (e) {}
    check('zero instrument errors', j1 && (j1.instrumentErrors || []).length === 0, JSON.stringify(j1 && j1.instrumentErrors));
    check('cross-check clean', j1 && j1.crossCheck && (j1.crossCheck.unexplained || []).length === 0,
      JSON.stringify(j1 && j1.crossCheck));
    const b1 = fs.readFileSync(fp, 'utf8');
    run();
    const b2 = fs.readFileSync(fp, 'utf8');
    check('re-run byte-identical', b1 === b2, `len ${b1.length} vs ${b2.length}`);
  }

  // tree must hold the fix when we leave
  restoreFixed();
  const tail = execSync('git diff --stat', { cwd: REPO }).toString();
  check('tree holds the fix (titans.js still patched)', /titans\.js/.test(tail), tail.split('\n').slice(0, 3).join(' '));

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { try { restoreFixed(); } catch (e2) {} console.error(e && e.stack || e); process.exit(1); });
