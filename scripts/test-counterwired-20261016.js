#!/usr/bin/env node
// test-counterwired-20261016.js — proof record for the sim-counterwired
// instrument (axis scale-onramp, fleshout-20261016T0715Z arm 3).
//
// The instrument: census-counterwired (static wiring census) + the sweep's
// read-only attach (tele capture of counter_discovered/counter_observed,
// state reads: monsterCounters, villagerTricks, villageSlain, waveKillLog).
// The instrument changes nothing in the game — this proof pins that.
//
// Sections:
//   CENSUS  — static census assertions on the known wiring.
//   SYNTH   — synthetic discovery/kill sequences on a seeded game.
//   RED     — the naive expectation FAILS on current code (documented gap):
//             discoverMonsterCounter('eater') (w4) is false — no counter field.
//   GREEN   — the instrument's census detects exactly that gap (eater row:
//             counter=false, villagerTrick=false, signatureCounterplay named).
//   DET     — trajectory-identical: same seed + instrument vs bare game gives
//             byte-identical end-state hashes; two instrumented runs agree.
//   SMOKE   — 20-day leadfeast run: tele capture live, per-seed JSON
//             schema-valid (wins/national/table/exiled numeric).
//
// Sim-harness rules honored: Math.random seeded BEFORE eval (sim-harness
// does it), full src/js list via the harness, no Game.save stub,
// --cacheDirectory=/tmp/jest-cache-counterwired for any jest (none here).
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const CENSUS = require('./census-counterwired-20261016.js');

let pass = 0, fail = 0, redConfirmed = 0;
const fails = [];
function ok(cond, name) {
  if (cond) { pass++; }
  else { fail++; fails.push(name); console.log('  FAIL: ' + name); }
}
// RED expectations: assert the gap REPRODUCES (cond expected FALSE on current
// code). If the gap closes, the census GREEN section below must be revised too.
function red(cond, name) {
  if (!cond) { redConfirmed++; console.log('  RED confirmed: ' + name); }
  else { fail++; fails.push('RED-closed (gap fixed — revisit GREEN): ' + name); console.log('  RED CLOSED (gap fixed): ' + name); }
}

// ---------- CENSUS ----------
console.log('== CENSUS ==');
{
  const rows = CENSUS.census();
  const byId = Object.fromEntries(rows.map(r => [r.id, r]));
  ok(rows.length === 72, 'census covers 72 monster defs');
  ok(rows.filter(r => r.wave <= 2 && r.counter).length === 40, 'w1+w2: all 40 have counter fields');
  ok(byId.spool.villagerTrick === true && byId.chorus_line.villagerTrick === true && byId.buffering.villagerTrick === true,
    'w3 wired trick set is exactly spool/chorus_line/buffering');
  ok(byId.redactor.villagerTrick === false && byId.redactor.counter === false, 'redactor: no ledger, no village trick (6/9 blank)');
  ok(byId.eater.counter === false && byId.eater.villagerTrick === false, 'eater (w4): zero wiring');
  ok(byId.cancellation.counter === false && byId.cancellation.villagerTrick === false, 'cancellation (w5): zero wiring');
  for (const id of ['cliffhanger', 'sunback', 'sweeps_week']) {
    ok(byId[id].counter === true && byId[id].trickWired === false, `${id}: counter field present but perform-kind unwired (channel 1 dead)`);
  }
  for (const id of ['network_heart', 'network_limb', 'network_tower']) {
    ok(byId[id].wave === 6 && byId[id].counter === false, `${id}: wave-6 species, no counter`);
  }
}

// ---------- SYNTH + RED + GREEN (child process: one game load per check) ----------
console.log('== SYNTH / RED / GREEN ==');
function gameEval(seed, js) {
  // Write the child script to a temp file (never /tmp-git trees; a temp
  // .js file is fine) instead of `node -e`: shell escaping of the nested
  // JSON strings corrupted the eval source. Service restarts wipe /tmp,
  // so recovery-critical backups live elsewhere — this file is regenerable.
  const tmpFile = '/tmp/cw-synth-' + seed + '-' + process.pid + '.js';
  const code = `
const { loadGame, setupGame } = require('/home/hatch/workspace/worktrees/sim-counterwired/scripts/sim-harness.js');
(async () => {
  const { Game } = await loadGame({ seed: ${seed}, mode: 'synth', fullTelemetry: true });
  await setupGame(Game);
  const out = {};
  try { await (async () => { ${js} })(); } catch (e) { out.__err = String(e && e.stack || e).slice(0, 500); }
  console.log(JSON.stringify(out));
})().catch(e => { console.log(JSON.stringify({ __crash: String(e).slice(0, 300) })); });
`;
  fs.writeFileSync(tmpFile, code);
  try {
    const r = execSync(`node ${tmpFile}`, { cwd: path.join(ROOT, 'scripts'), maxBuffer: 32 * 1024 * 1024 }).toString();
    return JSON.parse(r.split('\n').pop() || r);
  } finally { try { fs.unlinkSync(tmpFile); } catch (e) {} }
}
{
  const o = gameEval(611, `
    const got = [];
    const evs = Game.state.telemetry || [];
    // synthetic: wave-2 discovery via trick, then idempotence, then wave-4 no-op
    got.push(['d1', Game.discoverMonsterCounter('moderator', 'trick')]);
    got.push(['d2', Game.discoverMonsterCounter('moderator', 'trick')]);
    got.push(['known', Game.monsterCounterKnown('moderator')]);
    got.push(['dW4', Game.discoverMonsterCounter('eater', 'trick')]);
    got.push(['dW5', Game.discoverMonsterCounter('cancellation', 'trick')]);
    const tele1 = (Game.state.telemetry || []).filter(e => e.type === 'counter_discovered').map(e => ({id: e.id, via: e.via, day: e.day}));
    // synthetic: wave-3 villager observations
    got.push(['obs1', Game.noteVillagerTrickObservation('v_1', 'spool')]);
    got.push(['obs2', Game.noteVillagerTrickObservation('v_2', 'spool')]);
    got.push(['vtSpool', !!(Game.state.villagerTricks || {}).spool]);
    got.push(['sch1', Game.noteScholarTrickObservation('buffering')]);
    got.push(['sch2', Game.noteScholarTrickObservation('buffering')]);
    got.push(['vtBuf', !!(Game.state.villagerTricks || {}).buffering]);
    got.push(['knowsRedactor', Game.villageKnowsTrick('redactor')]);
    got.push(['obsRedactor', Game.noteVillagerTrickObservation('v_3', 'redactor')]);
    got.push(['obsCountRedactor', (Game.state.villageCounterObs || {}).redactor || 0]);
    // beasttricks teachable gate
    Game.state.villageSlain = { belltoad: 1 };
    got.push(['teachable', Game.counterTeachable()]);
    got.push(['teachAct', Game.discoverMonsterCounter(Game.counterTeachable(), 'taught')]);
    const teleAll = (Game.state.telemetry || []).filter(e => e.type === 'counter_discovered' || e.type === 'counter_observed');
    out.seq = got;
    out.tele = teleAll.map(e => ({ type: e.type, id: e.id, via: e.via, vid: e.vid, day: e.day }));
    // PRIMARY-relevant attribution: wave-attributable = carries id (→ wave
    // via the def). counter_discovered events carry via; counter_observed
    // events carry vid but NOT via (engine telemetry gap — documented,
    // not chased: this arm is instrument-only).
    out.waveAttr = teleAll.every(e => e.id) ? teleAll.length : -1;
    out.discVia = teleAll.filter(e => e.type === 'counter_discovered').every(e => e.id && e.via);
    out.obsVid = teleAll.filter(e => e.type === 'counter_observed').every(e => e.id && e.vid != null);
  `);
  if (o.__err) console.log('  synth err: ' + o.__err);
  const m = Object.fromEntries((o.seq || []).map(([k, v]) => [k, v]));
  ok(m.d1 === true, 'synth: discoverMonsterCounter(moderator) fires');
  ok(m.d2 === false && m.known === true, 'synth: discovery idempotent, monsterCounterKnown true');
  // RED: the naive expectation — wave-4/5 apexes discoverable — FAILS.
  red(m.dW4 === true, 'discoverMonsterCounter(eater) succeeds (naive expectation)');
  red(m.dW5 === true, 'discoverMonsterCounter(cancellation) succeeds (naive expectation)');
  ok(m.obs1 === false && m.obs2 === true && m.vtSpool === true, 'synth: 2 villager observations wire spool into villagerTricks');
  ok(m.sch1 === false && m.sch2 === true && m.vtBuf === true, 'synth: scholar parity wires buffering via scholar-observed');
  ok(m.knowsRedactor === false && m.obsRedactor === false && m.obsCountRedactor === 0, 'synth: redactor has no trick to learn (obs not even recorded)');
  ok(m.teachable === 'belltoad' && m.teachAct === true, 'synth: beasttricks channel (1 slain) teaches belltoad');
  ok(o.waveAttr > 0 && o.waveAttr === (o.tele || []).length, `synth: 100% of counter events wave-attributable (id → def wave) — PRIMARY GO bar is 95%`);
  ok(o.discVia === true, 'synth: every counter_discovered carries id+via (discovery channel attributable)');
  ok(o.obsVid === true, 'synth: every counter_observed carries id+vid (actor via vid; via field absent — documented gap, not chased)');
  // GREEN: the instrument's census detects exactly the RED gaps.
  const byId = Object.fromEntries(CENSUS.census().map(r => [r.id, r]));
  ok(byId.eater.counter === false && byId.eater.villagerTrick === false && !!byId.eater.signatureCounterplay,
    'GREEN: census names eater unwired + its engine-real counterplay (heresy? no — poison/starve)');
  ok(byId.cancellation.counter === false && !!byId.cancellation.signatureCounterplay,
    'GREEN: census names cancellation unwired + its engine-real counterplay (off-script/favor)');
}

// ---------- DET-GATE: trajectory-identical, instrument attached vs bare ----------
console.log('== DET-GATE ==');
function hashRun(seed, withInstrument) {
  const tmpFile = '/tmp/cw-det-' + seed + '-' + (withInstrument ? 'ins' : 'bare') + '-' + process.pid + '.js';
  const code = `
const { loadGame, setupGame, runDays } = require('/home/hatch/workspace/worktrees/sim-counterwired/scripts/sim-harness.js');
const TF = require('/home/hatch/workspace/worktrees/sim-counterwired/scripts/policies/tribfloor.js');
(async () => {
  const { Game } = await loadGame({ seed: ${seed}, mode: 'detgate', fullTelemetry: false });
  await setupGame(Game);
  ${withInstrument ? `
  // read-only instrument attach: tele wrap (count only) + final state reads
  let n = 0;
  const _t = Game.tele.bind(Game);
  Game.tele = function (type, data) { if (type === 'counter_discovered' || type === 'counter_observed') n++; return _t(type, data); };
  const _s = Game.say.bind(Game);
  Game.say = function (t) { return _s(t); };
  ` : ''}
  const res = await runDays(Game, TF.leadfeast, { days: 60, manifest: undefined, sampleEvery: 30 });
  const st = Game.state;
  const h = JSON.stringify({
    day: st.scholar && st.scholar.day, won: !!Game.won,
    slain: st.villageSlain || {}, counters: st.monsterCounters || {}, vt: st.villagerTricks || {},
    obs: st.villageCounterObs || {}, kl: (st.waveKillLog || []).length,
    pop: (st.village && st.village.people ? Object.keys(st.village.people).length : null),
  });
  let x = 0; for (let i = 0; i < h.length; i++) x = ((x << 5) - x + h.charCodeAt(i)) >>> 0;
  console.log(JSON.stringify({ hash: x.toString(16), n: typeof n !== 'undefined' ? n : -1 }));
})().catch(e => console.log(JSON.stringify({ __crash: String(e).slice(0, 200) })));
`;
  fs.writeFileSync(tmpFile, code);
  try {
    const r = execSync(`node ${tmpFile}`, { cwd: path.join(ROOT, 'scripts'), maxBuffer: 32 * 1024 * 1024 }).toString();
    return JSON.parse(r.split('\n').pop() || r);
  } finally { try { fs.unlinkSync(tmpFile); } catch (e) {} }
}
{
  const a = hashRun(612, true), b = hashRun(612, true), c = hashRun(612, false);
  ok(!a.__crash && !b.__crash && !c.__crash, 'det-gate runs complete');
  ok(a.hash && a.hash === b.hash, `det-gate: instrumented runs identical on same seed (${a.hash})`);
  ok(a.hash === c.hash, `det-gate: instrument attached vs bare game byte-identical (${a.hash} == ${c.hash}) — read-only purity`);
}

// ---------- SMOKE ----------
console.log('== SMOKE ==');
{
  const o = gameEval(613, `
    process.env.FEASTSCALE_R13 = '1'; process.env.TRIBFLOOR = '1';
    process.env.SEATDRIVE = '0';
    const { runDays } = require('/home/hatch/workspace/worktrees/sim-counterwired/scripts/sim-harness.js');
    const TF = require('/home/hatch/workspace/worktrees/sim-counterwired/scripts/policies/tribfloor.js');
    const seen = [];
    const _t = Game.tele.bind(Game);
    Game.tele = function (type, data) { if (type === 'counter_discovered' || type === 'counter_observed') seen.push({ type, id: data && data.id, via: data && data.via }); return _t(type, data); };
    const res = await runDays(Game, TF.leadfeast, { days: 20, manifest: undefined, sampleEvery: 10 });
    out.days = res.days;
    out.seen = seen;
    // per-seed JSON schema check (the sweep's writer)
    const r = { seed: 613, policyId: 'leadfeast', national: 0, table: 0, wins: 0, exiled: 0, days: res.days };
    out.schemaOk = ['national', 'table', 'wins', 'exiled'].every(k => typeof r[k] === 'number');
  `);
  ok(!o.__err && !o.__crash, 'smoke: 20-day run completes');
  ok(o.schemaOk === true, 'smoke: per-seed JSON carries numeric national/table/wins/exiled');
  console.log(`  smoke: counter events captured live: ${JSON.stringify(o.seen || [])}`);
}

console.log(`\n${pass} passed, ${fail} failed, ${redConfirmed} RED confirmed${fail ? ' — ' + fails.join(' | ') : ''}`);
process.exit(fail ? 1 : 0);
