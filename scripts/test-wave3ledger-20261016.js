#!/usr/bin/env node
// test-wave3ledger-20261016.js — proof record for the sim-wave3ledger arm
// (axis scale-onramp): extend the ledger convention to the named species —
// verify their waves, verify the revived perform-channels resolve on current
// master, RED→GREEN anchored to the pre-counterwire base, det-gate, SMOKE.
//
// FINDING (claim-note check): cliffhanger / sunback / sweeps_week are WAVE 1
// (src/data/monsters.json), NOT wave-3+. The wave-4+ unmeasurability concern
// (readiness-gated behind ebcdf397, 0/48 unlocks) does not apply to them —
// they are measurable on the pre-seat courtship substrate. The counterwire
// arm (44de021d, landed) already: (a) added the three dead perform-kinds
// (blindside/face_it/eyes) to checkMonsterCounter, (b) recorded performances
// per-monster on f.trickLogByMid, (c) passed trickSummary into tbEnd kill
// attribution. This proof re-verifies that wiring on the CURRENT master
// (which has moved: journey deepening r14, readiness design call #4) and
// measures the revived channels in live fights at pilot.
//
// Sections:
//   WAVES  — data-driven: the three species are wave 1 with the revived
//            counter kinds; readiness gates (waves 4-5) cannot block them.
//   KINDS  — synthetic TB fights: each revived kind discovers via
//            checkMonsterCounter; f.trickLogByMid records performances
//            per-monster; face_it does NOT fire on approach.
//   RED    — static: the three cases are ABSENT in af818ee2's
//            checkMonsterCounter (the dead perform-channel pre-state).
//   DET    — identical-seed pairs: the read-only trickres instrument
//            attached vs bare game → byte-identical trajectories.
//   SMOKE  — 20d pre-seat run completes; per-seed schema valid.
//
// Sim-harness rules honored: Math.random seeded BEFORE eval (sim-harness
// does it); child processes for process isolation (never two harnesses in
// one process); no Game.save stub; no hardcoded absolute paths (ROOT
// derived from __dirname); no copied eval boilerplate (all loads via
// sim-harness.js).
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const HARNESS = path.join(ROOT, 'scripts', 'sim-harness.js');
const TRIBFLOOR = path.join(ROOT, 'scripts', 'policies', 'tribfloor.js');
const INSTRUMENT = path.join(ROOT, 'scripts', 'trickres-instrument-20261016.js');
const PRE_COUNTERWIRE = 'af818ee2'; // parent of the first counterwire game-code commit

let pass = 0, fail = 0;
const fails = [];
function ok(cond, name) {
  if (cond) { pass++; }
  else { fail++; fails.push(name); console.log('  FAIL: ' + name); }
}

function gameEval(seed, js, env) {
  const tmpFile = '/tmp/w3l-synth-' + seed + '-' + process.pid + '.js';
  const envLines = Object.entries(env || {}).map(([k, v]) => `process.env.${k} = '${v}';`).join('\n');
  const code = `
${envLines}
const { loadGame, setupGame } = require('${HARNESS}');
(async () => {
  const { Game } = await loadGame({ seed: ${seed}, mode: 'synth', fullTelemetry: true });
  await setupGame(Game);
  const out = {};
  try { await (async () => { ${js} })(); } catch (e) { out.__err = String(e && e.stack || e).slice(0, 600); }
  console.log(JSON.stringify(out));
})().catch(e => { console.log(JSON.stringify({ __crash: String(e).slice(0, 300) })); });
`;
  fs.writeFileSync(tmpFile, code);
  try {
    const r = execSync(`node ${tmpFile}`, { cwd: path.join(ROOT, 'scripts'), maxBuffer: 32 * 1024 * 1024 }).toString();
    return JSON.parse(r.split('\n').pop() || r);
  } finally { try { fs.unlinkSync(tmpFile); } catch (e) {} }
}

// ---------- WAVES (the claim-note check) ----------
console.log('== WAVES ==');
{
  const o = gameEval(991, `
    const byId = {};
    for (const m of (Game.data.monsters || [])) byId[m.id] = m;
    const r = {};
    for (const [mid, kind] of [['cliffhanger','eyes'], ['sunback','blindside'], ['sweeps_week','face_it']]) {
      const m = byId[mid] || {};
      r[mid + '_wave'] = m.wave;
      r[mid + '_kind'] = m.counter && m.counter.kind;
      r[mid + '_hasHint'] = !!(m.counter && m.counter.hint);
      r[mid + '_hasReveal'] = !!(m.counter && m.counter.reveal);
    }
    out.r = r;
  `);
  if (o.__err) console.log('  waves err: ' + o.__err);
  const r = o.r || {};
  ok(r.cliffhanger_wave === 1 && r.sunback_wave === 1 && r.sweeps_week_wave === 1,
    `claim-note check: all three named species are WAVE 1 (got ${r.cliffhanger_wave}/${r.sunback_wave}/${r.sweeps_week_wave}) — measurable on the pre-seat substrate, readiness gates do not apply`);
  ok(r.cliffhanger_kind === 'eyes' && r.sunback_kind === 'blindside' && r.sweeps_week_kind === 'face_it',
    `counter kinds wired in data (got ${r.cliffhanger_kind}/${r.sunback_kind}/${r.sweeps_week_kind})`);
  ok(r.cliffhanger_hasHint && r.cliffhanger_hasReveal && r.sunback_hasHint && r.sunback_hasReveal && r.sweeps_week_hasHint && r.sweeps_week_hasReveal,
    'all three carry hint + reveal (knowledge representation present)');
}

// ---------- KINDS (re-verify resolution on current master) ----------
console.log('== KINDS ==');
{
  const o = gameEval(992, `
    function mkfight(mid) {
      const mdef = Game.data.monsters.find(m => m.id === mid);
      Game.tbfight = { over: false, round: 1, fighters: [
        { key: 'p', kind: 'player', alive: true, hp: 100, maxHp: 100 },
        { key: 'm_0', kind: 'monster', alive: true, mdef: mdef, telegraph: { cells: [] } },
      ] };
    }
    const res = {};
    mkfight('sunback');
    res.blindsideHit = Game.checkMonsterCounter('sunback', { type: 'move', windup: true, via: 'trick' });
    res.blindsideKnown = !!Game.state.monsterCounters.sunback;
    mkfight('sweeps_week');
    res.faceHit = Game.checkMonsterCounter('sweeps_week', { type: 'move', closer: false, via: 'trick' });
    res.faceKnown = !!Game.state.monsterCounters.sweeps_week;
    mkfight('sweeps_week');
    Game.state.monsterCounters = {};
    res.faceApproach = Game.checkMonsterCounter('sweeps_week', { type: 'move', closer: true, via: 'trick' });
    mkfight('cliffhanger');
    res.eyesHit = Game.checkMonsterCounter('cliffhanger', { type: 'strike', windup: true, target: {}, via: 'trick' });
    res.eyesKnown = !!Game.state.monsterCounters.cliffhanger;
    mkfight('sunback');
    Game.state.monsterCounters = { sunback: true };
    Game.tbfight.trickLogByMid = {};
    Game.checkMonsterCounter('sunback', { type: 'move', windup: true, via: 'trick' });
    res.trickLogKnown = ((Game.tbfight.trickLogByMid || {}).sunback || []).join(',');
    Game.tbfight = null;
    out.r = res;
  `);
  if (o.__err) console.log('  kinds err: ' + o.__err);
  const r = o.r || {};
  ok(r.blindsideHit === true && r.blindsideKnown === true, 'blindside (sunback): move-during-arch discovers on current master');
  ok(r.faceHit === true && r.faceKnown === true, 'face_it (sweeps_week): backing away discovers on current master');
  ok(r.faceApproach === false, 'face_it: approaching does NOT discover (honest: the gaze must be held)');
  ok(r.eyesHit === true && r.eyesKnown === true, 'eyes (cliffhanger): strike-on-lunge discovers on current master');
  ok(r.trickLogKnown === 'blindside', `f.trickLogByMid records the performance even when already known (got '${r.trickLogKnown}')`);
}

// ---------- RED (static: the dead perform-channel pre-state) ----------
console.log('== RED ==');
{
  const src = execSync(`git show ${PRE_COUNTERWIRE}:src/js/game.js`, { cwd: ROOT, maxBuffer: 64 * 1024 * 1024 }).toString();
  const start = src.indexOf('checkMonsterCounter(mid, ev)');
  const slice = src.slice(start, start + 9000);
  const hasBlind = /case 'blindside'/.test(slice);
  const hasFace = /case 'face_it'/.test(slice);
  const hasEyes = /case 'eyes'/.test(slice);
  ok(!hasBlind && !hasFace && !hasEyes,
    `RED: pre-counterwire base (${PRE_COUNTERWIRE}) has NO blindside/face_it/eyes cases in checkMonsterCounter (the dead perform-channel)`);
  const now = execSync('git show HEAD:src/js/game.js', { cwd: ROOT, maxBuffer: 64 * 1024 * 1024 }).toString();
  const nstart = now.indexOf('checkMonsterCounter(mid, ev)');
  const nslice = now.slice(nstart, nstart + 9000);
  ok(/case 'blindside'/.test(nslice) && /case 'face_it'/.test(nslice) && /case 'eyes'/.test(nslice),
    'GREEN: current master carries all three cases');
}

// ---------- SENSE (discovery narration attributes the learning honestly) ----------
console.log('== SENSE ==');
{
  const o = gameEval(995, `
    const said = [];
    const _say = Game.say.bind(Game);
    Game.say = function (t) { said.push(String(t)); return _say(t); };
    Game.state.monsterCounters = {};
    Game.discoverMonsterCounter('sunback', 'observed');
    out.observedBeat = said.join('\\n');
    said.length = 0;
    Game.state.monsterCounters = {};
    Game.discoverMonsterCounter('sweeps_week', 'trick');
    out.trickBeat = said.join('\\n');
    said.length = 0;
    Game.state.monsterCounters = {};
    Game.discoverMonsterCounter('cliffhanger', 'scholar-observed');
    out.scholarBeat = said.join('\\n');
  `);
  if (o.__err) console.log('  sense err: ' + o.__err);
  ok(/the fire has a theory/.test(o.observedBeat || '') && !/You did the thing/.test(o.observedBeat || ''),
    `SENSE: villager-observed discovery reads as the fire's theory, not the scholar's deed`);
  ok(/You did the thing/.test(o.trickBeat || ''),
    'SENSE: performed-trick discovery keeps "You did the thing"');
  ok(/twice — and now you see the pattern/.test(o.scholarBeat || ''),
    'SENSE: scholar-observed discovery keeps the first-person pattern beat');
}

// ---------- DET-GATE ----------
console.log('== DET-GATE ==');
function hashRun(seed, withInstrument) {
  const tmpFile = '/tmp/w3l-det-' + seed + '-' + (withInstrument ? 'ins' : 'bare') + '-' + process.pid + '.js';
  const code = `
const { loadGame, setupGame, runDays } = require('${HARNESS}');
const TF = require('${TRIBFLOOR}');
const { attachTrickresCapture } = require('${INSTRUMENT}');
(async () => {
  const { Game } = await loadGame({ seed: ${seed}, mode: 'detgate', fullTelemetry: false });
  await setupGame(Game);
  ${withInstrument ? 'const cap = attachTrickresCapture(Game);' : ''}
  await runDays(Game, TF.leadfeast, { days: 60, manifest: undefined, sampleEvery: 30 });
  ${withInstrument ? 'cap.restore();' : ''}
  const st = Game.state;
  const h = JSON.stringify({
    day: st.scholar && st.scholar.day, won: !!Game.won,
    slain: st.villageSlain || {}, counters: st.monsterCounters || {}, vt: st.villagerTricks || {},
    obs: st.villageCounterObs || {}, kl: (st.waveKillLog || []).length,
    pop: (st.village && st.village.people ? Object.keys(st.village.people).length : null),
  });
  let x = 0; for (let i = 0; i < h.length; i++) x = ((x << 5) - x + h.charCodeAt(i)) >>> 0;
  console.log(JSON.stringify({ hash: x.toString(16) }));
})().catch(e => console.log(JSON.stringify({ __crash: String(e).slice(0, 200) })));
`;
  fs.writeFileSync(tmpFile, code);
  try {
    const r = execSync(`node ${tmpFile}`, { cwd: path.join(ROOT, 'scripts'), maxBuffer: 32 * 1024 * 1024, env: { ...process.env, FEASTSCALE_R13: '1', TRIBFLOOR: '1', SEATDRIVE: '0' } }).toString();
    return JSON.parse(r.split('\n').pop() || r);
  } finally { try { fs.unlinkSync(tmpFile); } catch (e) {} }
}
{
  const a = hashRun(993, true), b = hashRun(993, true), c = hashRun(993, false);
  ok(!a.__crash && !b.__crash && !c.__crash, 'det-gate runs complete');
  ok(a.hash && a.hash === b.hash, `det-gate: instrumented runs identical on same seed (${a.hash})`);
  ok(a.hash === c.hash, `det-gate: instrument attached vs bare game byte-identical (${a.hash} == ${c.hash})`);
}

// ---------- SMOKE ----------
console.log('== SMOKE ==');
{
  const o = gameEval(994, `
    const { runDays } = require('${HARNESS.replace(/'/g, "\\'")}');
    const TF = require('${TRIBFLOOR.replace(/'/g, "\\'")}');
    const { attachTrickresCapture } = require('${INSTRUMENT.replace(/'/g, "\\'")}');
    const cap = attachTrickresCapture(Game);
    const res = await runDays(Game, TF.leadfeast, { days: 20, manifest: undefined, sampleEvery: 30 });
    cap.restore();
    out.days = (Game.state.scholar || {}).day;
    out.ok = !!res;
    out.schema = ['seed','policyId','arm','days','national','table','won','wins','exiled','maxWave'];
    out.jsonKeys = Object.keys(Game.state || {}).length > 0;
  `, { FEASTSCALE_R13: '1', TRIBFLOOR: '1', SEATDRIVE: '0' });
  if (o.__err) console.log('  smoke err: ' + o.__err);
  ok(!o.__err && o.ok === true && o.days >= 20, `SMOKE: 20d pre-seat run completes (day ${o.days})`);
}

console.log(`\n${pass} passed, ${fail} failed${fail ? ' — ' + fails.join('; ') : ''}`);
process.exit(fail ? 1 : 0);
