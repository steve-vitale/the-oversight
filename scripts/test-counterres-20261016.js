#!/usr/bin/env node
// test-counterres-20261016.js — proof record for the sim-counterres arm
// (flesh-out loop): resolution-based confirm of the landed wave-3+
// counter-wiring (sim-counterwire, 0815Z). POLICY-SIDE ONLY — zero src/js.
//
// Sections:
//   RESDEF-RED   — the OLD (kill-only) metric definition scores 0 on flee
//                  resolutions: the blind spot the counterwire metric
//                  review identified. RED by construction.
//   RESDEF-GREEN — the sweep's exported countResolutions implements the
//                  revised definition: trick-attributed kills + mFlee/vFlee
//                  with >=2 trick actions vs known-trick species. GREEN on
//                  fixtures (each clause + each exclusion).
//   WRAP-DET     — the read-only fieldFight capture wrapper leaves
//                  trajectories byte-identical (attached vs bare, 60d,
//                  seed 702) AND actually captures fights.
//   COMPOSE      — the sweep's policy is explicitly composed through
//                  seatdrive.withSeatDrive (METHOD NOTE: env unset !=
//                  driver active); layerOn() honors SEATDRIVE.
//   SMOKE        — 20-day armed run green; per-seed JSON schema-valid
//                  (numeric national/table/won/wins/exiled + resolutions).
//
// Sim-harness rules honored: Math.random seeded BEFORE eval (sim-harness
// does it), full src/js list via the harness, no Game.save stub.
// New tests must not write into the repo: SMOKE writes per-seed JSONs to
// a tmp dir via COUNTERRES_EVID/COUNTERRES_BEATS.
'use strict';
process.env.FEASTSCALE_R13 = '1';
process.env.TRIBFLOOR = '1';
process.env.SUCCGRACE = '1';
process.env.RAIDDENSITY = '1';
process.env.WINPURSUIT = '1';
process.env.WINDEFER = '1';
process.env.SEATDRIVE = '1';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const HARNESS = path.join(ROOT, 'scripts', 'sim-harness.js');
const SWEEP = path.join(ROOT, 'scripts', 'sweep-counterres-20261016.js');
const SD = path.join(ROOT, 'scripts', 'policies', 'seatdrive.js');

// New tests must not write into the repo: point the sweep's per-seed /
// beats dirs at tmp BEFORE the sweep module loads (it computes EVID at
// require time).
const _tmpEvid = fs.mkdtempSync(path.join(os.tmpdir(), 'cr-smoke-evid-'));
const _tmpBeats = fs.mkdtempSync(path.join(os.tmpdir(), 'cr-smoke-beats-'));
process.env.COUNTERRES_EVID = _tmpEvid;
process.env.COUNTERRES_BEATS = _tmpBeats;

let pass = 0, fail = 0;
const fails = [];
function ok(cond, name) {
  if (cond) { pass++; }
  else { fail++; fails.push(name); console.log('  FAIL: ' + name); }
}

// The OLD metric (counterwire pilot PRIMARY (a)): kill-only. Inline here
// to demonstrate the blind spot — it is NOT the sweep's resolver.
function oldKillOnlyResolver(waveKillLog, monsterById) {
  let n = 0;
  for (const k of (waveKillLog || [])) {
    if (k.trick && (monsterById[k.mid] || k.w || 1) >= 3) n++;
  }
  return n;
}

// ---------- RESDEF-RED ----------
console.log('== RESDEF-RED ==');
{
  const monsterById = { eulogy: 4, redactor: 3, suburb: 4, hummice: 1 };
  // A eulogy fight: 3 contradictions, the story dismisses the villager
  // kindly (mFlee). A redactor fight: quiet x3, starved out (mFlee). These
  // are the trick game's SUCCESSES — the Undertale channel.
  const waveKillLog = []; // no kills at all
  const fights = [
    { mid: 'eulogy', wave: 4, outcome: 'mFlee', nTrick: 3, trickActions: ['contradict', 'contradict', 'contradict'], knownStart: true, knownEnd: true },
    { mid: 'redactor', wave: 3, outcome: 'mFlee', nTrick: 3, trickActions: ['wait:redactor-quiet', 'wait:redactor-quiet', 'wait:redactor-quiet'], knownStart: true, knownEnd: true },
  ];
  const oldScore = oldKillOnlyResolver(waveKillLog, monsterById);
  ok(oldScore === 0, `RED: kill-only metric scores the two flee-resolutions as 0 (got ${oldScore}) — the blind spot`);
}

// ---------- RESDEF-GREEN ----------
console.log('== RESDEF-GREEN ==');
{
  const { countResolutions } = require(SWEEP);
  const monsterById = { eulogy: 4, redactor: 3, suburb: 4, gavel: 3, hummice: 1, sunback: 1 };
  const sid = 'v_9';
  const waveKillLog = [
    { mid: 'gavel', w: 3, trick: 'confess', by: 'v_9', via: 'wild', d: 81 },          // trick-attributed w3 kill
    { mid: 'hummice', w: 1, trick: 'shout,shout', by: 'v_9', via: 'player', d: 40 },  // w1: counts all-wave only
    { mid: 'sunback', w: 1, trick: null, by: 'v_9', via: 'wild', d: 41 },            // kill, no trick: not a resolution
  ];
  const fights = [
    { mid: 'eulogy', wave: 4, outcome: 'mFlee', nTrick: 3, trickActions: ['contradict', 'contradict', 'contradict'], knownStart: true, knownEnd: true, vid: 'v_3', day: 82, rounds: 5 },
    { mid: 'redactor', wave: 3, outcome: 'vFlee', nTrick: 2, trickActions: ['wait:redactor-quiet', 'wait:redactor-quiet'], knownStart: false, knownEnd: true, vid: 'v_4', day: 83, rounds: 4 },
    { mid: 'suburb', wave: 4, outcome: 'vFlee', nTrick: 1, trickActions: ['leave'], knownStart: true, knownEnd: true, vid: 'v_5', day: 84, rounds: 2 }, // 1 action: below the bar
    { mid: 'suburb', wave: 4, outcome: 'mFlee', nTrick: 3, trickActions: ['x', 'x', 'x'], knownStart: false, knownEnd: false, vid: 'v_6', day: 85, rounds: 3 }, // unknown species
    { mid: 'eulogy', wave: 4, outcome: 'vDie', nTrick: 3, trickActions: ['contradict', 'contradict', 'contradict'], knownStart: true, knownEnd: true, vid: 'v_7', day: 86, rounds: 6 }, // died anyway
    { mid: 'eulogy', wave: 4, outcome: 'evade', nTrick: 2, trickActions: ['contradict', 'contradict'], knownStart: true, knownEnd: true, vid: 'v_8', day: 87, rounds: 1 }, // never engaged
  ];
  const r = countResolutions(waveKillLog, fights, monsterById, sid);
  ok(r.w3 === 3, `w3 resolutions = 3 (gavel kill + eulogy mFlee + redactor vFlee), got ${r.w3}`);
  ok(r.w3kill === 1 && r.w3flee === 2, `w3 split kill/flee = 1/2, got ${r.w3kill}/${r.w3flee}`);
  ok(r.total === 4 && r.allkill === 2 && r.allflee === 2, `all-wave = 4 (2 kill + 2 flee), got ${r.total}`);
  ok(r.items.every(i => i.channel === 'kill' || i.channel === 'flee'), 'every item carries its channel');
  const gk = r.items.find(i => i.channel === 'kill' && i.mid === 'gavel');
  ok(gk && gk.trick === 'confess' && gk.day === 81, 'kill item keeps trick detail + day for sense-reading');
  const ef = r.items.find(i => i.channel === 'flee' && i.mid === 'eulogy');
  ok(ef && ef.nTrick === 3 && ef.outcome === 'mFlee', 'flee item keeps nTrick + outcome for sense-reading');
  // exclusions
  const mids = r.items.map(i => i.mid + '/' + i.channel);
  ok(!mids.includes('suburb/flee'), 'single-action flee and unknown-species flee excluded');
  ok(!r.items.some(i => i.mid === 'sunback'), 'kill without trick detail excluded');
  ok(!r.items.some(i => i.outcome === 'vDie'), 'vDie excluded even with tricks performed');
}

// ---------- WRAP-DET ----------
console.log('== WRAP-DET ==');
function hashRun(seed, withWrap) {
  const tmpFile = path.join(os.tmpdir(), 'cr-det-' + seed + '-' + (withWrap ? 'w' : 'b') + '-' + process.pid + '.js');
  const code = `
const { loadGame, setupGame, runDays } = require('${HARNESS}');
const { attachFightCapture } = require('${SWEEP}');
const TF = require('${path.join(ROOT, 'scripts', 'policies', 'tribfloor.js')}');
(async () => {
  const { Game } = await loadGame({ seed: ${seed}, mode: 'detgate', fullTelemetry: false });
  await setupGame(Game);
  let nFights = -1;
  ${withWrap ? `
  const cap = attachFightCapture(Game);
  ` : ''}
  const res = await runDays(Game, TF.leadfeast, { days: 60, manifest: undefined, sampleEvery: 30 });
  ${withWrap ? `nFights = cap.fights.length; cap.restore();` : ''}
  const st = Game.state;
  const h = JSON.stringify({
    day: st.scholar && st.scholar.day, won: !!Game.won,
    slain: st.villageSlain || {}, counters: st.monsterCounters || {}, vt: st.villagerTricks || {},
    obs: st.villageCounterObs || {}, kl: (st.waveKillLog || []).length,
    pop: (st.village && st.village.people ? Object.keys(st.village.people).length : null),
  });
  let x = 0; for (let i = 0; i < h.length; i++) x = ((x << 5) - x + h.charCodeAt(i)) >>> 0;
  console.log(JSON.stringify({ hash: x.toString(16), nFights }));
})().catch(e => console.log(JSON.stringify({ __crash: String(e).slice(0, 200) })));
`;
  fs.writeFileSync(tmpFile, code);
  try {
    const r = execSync(`node ${tmpFile}`, { cwd: path.join(ROOT, 'scripts'), maxBuffer: 32 * 1024 * 1024 }).toString();
    return JSON.parse(r.split('\n').pop() || r);
  } finally { try { fs.unlinkSync(tmpFile); } catch (e) {} }
}
{
  const a = hashRun(702, true), b = hashRun(702, false);
  ok(!a.__crash && !b.__crash, 'wrap-det runs complete');
  ok(a.hash === b.hash, `wrap-det: capture wrapper attached vs bare byte-identical (${a.hash} == ${b.hash})`);
  ok(a.nFights > 0, `wrap-det: the wrapper actually captures fights (n=${a.nFights})`);
}

// ---------- COMPOSE ----------
console.log('== COMPOSE ==');
{
  const { policyFor } = require(SWEEP);
  const sd = require(SD);
  const p = policyFor('leadfeast');
  ok(/seatdrive/i.test(p.desc || ''), `sweep policy is composed through withSeatDrive (desc: ${(p.desc || '').slice(0, 60)}...)`);
  ok(sd.layerOn() === true, 'layerOn() true with SEATDRIVE=1 (driver genuinely active)');
  const w = sd.withSeatDrive({ daily() { return 'base'; }, id: 'x' }, 'x', 'x');
  process.env.SEATDRIVE = '0';
  let delegated = null;
  w.daily({}, { });
  ok(sd.layerOn() === false, 'layerOn() false with SEATDRIVE=0 (opt-out purity)');
  process.env.SEATDRIVE = '1';
}

// ---------- SMOKE ----------
console.log('== SMOKE ==');
(async () => {
  const tmpEvid = process.env.COUNTERRES_EVID;
  const tmpBeats = process.env.COUNTERRES_BEATS;
  process.env.SEEDS = '702';
  process.env.POLICIES = 'leadfeast';
  process.env.DAYS = '20';
  process.env.ARM = 'armed';
  let out = null, err = null;
  try { out = await require(SWEEP).oneRun(702, 'leadfeast'); }
  catch (e) { err = String(e && e.stack || e).slice(0, 500); }
  if (err) console.log('  smoke err: ' + err);
  ok(!err && out && out.days >= 20, `smoke: 20-day armed run completes (days=${out && out.days})`);
  const fp = path.join(tmpEvid, 'leadfeast-s702-armed.json');
  let j = null;
  try { j = JSON.parse(fs.readFileSync(fp, 'utf8')); } catch (e) {}
  ok(!!j, 'smoke: per-seed JSON written');
  ok(j && ['national', 'table', 'won', 'wins', 'exiled'].every(k => typeof j[k] === 'number'),
    'smoke: schema carries numeric national/table/won/wins/exiled');
  ok(j && typeof j.resW3 === 'number' && typeof j.resAll === 'number' && Array.isArray(j.resolutions),
    'smoke: schema carries resolution fields (resW3/resAll/resolutions)');
  ok(j && typeof j.nFights === 'number' && j.nFights >= 0, `smoke: fight capture recorded (nFights=${j && j.nFights})`);
  console.log(`  smoke: resW3=${j && j.resW3} resAll=${j && j.resAll} nFights=${j && j.nFights} end=${j && j.endReason}`);
  delete process.env.COUNTERRES_EVID; delete process.env.COUNTERRES_BEATS;

  console.log(`\n${pass} passed, ${fail} failed${fail ? ' — ' + fails.join(' | ') : ''}`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('SMOKE CRASH:', e); process.exit(2); });
