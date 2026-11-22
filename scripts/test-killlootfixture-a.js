// test-killlootfixture-a.js — forced-arrival fixture for arm sim-killlootfixture-a
// (kill-loot searcaster bundle, KILLBUNDLE=1). Answers the question the
// 8-seed pilot could not: does a BUNDLED kill-loot gun reach a fight and
// FIRE? Stubs rollAlienLoot -> 'searcaster' so a kill-loot drop is forced,
// lets the bundle land (exactly 2 cells, same holder as the gun), then
// runs a wave-4 door fight (fieldFight vs the Herald, wave 4, weakest
// wave-4 mdef) with the bundled holder + a 2-ally party, and measures
// whether the gun fires. Control leg: same fixture with KILLBUNDLE unset
// (dry gun, 0 cells) to show the bundle is what fires.
// NO live-game code change: KILLBUNDLE stays env-gated default-OFF.
// Extends the 2015Z killlootbundle proof test + analyzer helpers; does
// not rebuild them. Seed 7 via scripts/sim-harness.js (Math.random
// seeded BEFORE eval, per the harness rules).
// Run (judged legs, each twice for the determinism gate; full pilot
// substrate env so the party is the prereg's 3-fighter party):
//   VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1 node scripts/test-killlootfixture-a.js            (ctl)
//   VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1 KILLBUNDLE=1 node scripts/test-killlootfixture-a.js  (arm)
//   ... rerun   (determinism copies, writes -rerun.json)
//   node scripts/test-killlootfixture-a.js --compare   (judges bars 1-6)
// Prereg: evidence/2026-11-21/sim-killlootfixture-a-prereg.md (frozen
// before any judged run; this script is the instrument, committed with it).
'use strict';
const path = require('path');
const fs = require('fs');
const REPO = path.join(__dirname, '..');
const driver = require(path.join(REPO, 'scripts', 'killlootbundle-driver-a'));
const analyzer = require(path.join(REPO, 'scripts', 'analyze-killlootbundle-a'));
const { loadGame, setupGame } = require(path.join(REPO, 'scripts', 'sim-harness'));

const EVIDENCE_DIR = path.join(REPO, 'evidence', '2026-11-21');
const MODE = process.env.KILLBUNDLE === '1' ? 'arm' : 'ctl';
const RERUN = process.argv[2] === 'rerun';
const OUT_FILE = path.join(EVIDENCE_DIR, 'killlootfixture-a-' + MODE + (RERUN ? '-rerun' : '') + '.json');

function sleepMs(ms) {
  try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); }
  catch (e) {
    const t0 = process.hrtime.bigint();
    while (process.hrtime.bigint() - t0 < BigInt(ms) * 1000000n) {}
  }
}
function writeRobust(filePath, data) {
  const tmp = filePath + '.tmp-' + process.pid;
  for (let i = 0; i < 480; i++) {
    try {
      if (fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, data);
        const back = fs.readFileSync(filePath, 'utf8');
        if (back.length !== data.length) throw new Error('readback length mismatch');
        return;
      }
      fs.writeFileSync(tmp, data);
      const back = fs.readFileSync(tmp, 'utf8');
      if (back.length !== data.length) throw new Error('readback length mismatch');
      fs.renameSync(tmp, filePath);
      return;
    } catch (e) {
      if (i === 479) { process.stdout.write('@@FALLBACK ' + filePath + '\n' + data + '\n'); return; }
      sleepMs(250);
    }
  }
}
function itemIdOf(e) {
  if (!e) return null;
  if (typeof e === 'string') return e;
  return e.itemId || e.id || e.material || null;
}
function countItemIn(items, id) {
  let n = 0;
  for (const e of (items || [])) {
    if (itemIdOf(e) === id) n += (typeof e === 'string') ? 1 : ((e.units == null) ? 1 : e.units);
  }
  return n;
}
function canonItems(items) {
  const rows = [];
  for (const e of (items || [])) {
    rows.push({ id: itemIdOf(e), units: (typeof e === 'string') ? 1 : ((e.units == null) ? 1 : e.units) });
  }
  rows.sort(function (a, b) { return (a.id < b.id ? -1 : (a.id > b.id ? 1 : a.units - b.units)); });
  return rows;
}
// Canonical pre-fight state snapshot (for the neutrality bar: arm vs ctl
// must differ ONLY in the holder's fusion_cell count).
function preFightStateOf(Game) {
  const out = { villagers: {}, scholarItems: [], health: {} };
  try {
    const st = Game.state || {};
    const roster = ((st.village || {}).roster || []);
    for (const p of ((Game.data && Game.data.villagers) || [])) {
      if (!p || !p.id) continue;
      out.villagers[p.id] = {
        dead: !!p.dead, onRoster: roster.indexOf(p.id) !== -1,
        items: canonItems(p.items || []),
        hp: ((st.village || {}).health || {})[p.id] != null ? ((st.village || {}).health || {})[p.id] : null,
      };
    }
    out.scholarItems = canonItems(((st.scholar || {}).inventory) || []);
    out.health = JSON.parse(JSON.stringify(((st.village || {}).health) || {}));
  } catch (e) {}
  return out;
}
// Neutrality diff: returns the list of differences between two
// pre-fight snapshots that are NOT the holder gaining exactly 2 fusion
// cells. Empty list = neutral (arm differs from ctl only by the bundle).
function neutralityDiff(ctlState, armState, holder) {
  const bad = [];
  try {
    const cV = (ctlState && ctlState.villagers) || {};
    const aV = (armState && armState.villagers) || {};
    const ids = {};
    for (const k of Object.keys(cV)) ids[k] = true;
    for (const k of Object.keys(aV)) ids[k] = true;
    for (const vid of Object.keys(ids).sort()) {
      const c = cV[vid] || { dead: null, onRoster: null, items: [], hp: null };
      const a = aV[vid] || { dead: null, onRoster: null, items: [], hp: null };
      if (c.dead !== a.dead || c.onRoster !== a.onRoster || c.hp !== a.hp) {
        bad.push(vid + ': dead/onRoster/hp differs');
        continue;
      }
      const ci = c.items || [], ai = a.items || [];
      const cmap = {};
      for (const r of ci) cmap[r.id] = (cmap[r.id] || 0) + r.units;
      const amap = {};
      for (const r of ai) amap[r.id] = (amap[r.id] || 0) + r.units;
      const allIds = {};
      for (const k of Object.keys(cmap)) allIds[k] = true;
      for (const k of Object.keys(amap)) allIds[k] = true;
      for (const iid of Object.keys(allIds).sort()) {
        const d = (amap[iid] || 0) - (cmap[iid] || 0);
        if (d === 0) continue;
        if (vid === holder && iid === 'fusion_cell' && d === 2) continue;
        bad.push(vid + ': ' + iid + ' differs by ' + d);
      }
    }
    if (JSON.stringify((ctlState || {}).scholarItems) !== JSON.stringify((armState || {}).scholarItems)) {
      bad.push('scholarItems differ');
    }
  } catch (e) { bad.push('neutrality-diff threw: ' + String(e.message).slice(0, 80)); }
  return bad;
}
function killbundlePresent() {
  try {
    const src = fs.readFileSync(path.join(REPO, 'src', 'js', 'game.js'), 'utf8');
    const m = src.match(/villagerKillLoot\(vid, mdef\) \{([\s\S]*?)\n    \},/);
    return !!(m && /KILLBUNDLE/.test(m[1]) && /fusion_cell/.test(m[1]));
  } catch (e) { return false; }
}
function judgedFields(out) {
  return {
    cellsAtArrival: out.cellsAtArrival,
    volley: out.volley,
    outcome: out.outcome, rounds: out.rounds,
    mHpLeft: out.mHpLeft, vHpLeft: out.vHpLeft,
    holderAlive: out.holderAlive, cellsAfterFight: out.cellsAfterFight,
  };
}

async function oneLeg() {
  const errors = [];
  if (process.env.CELLGATE !== '1') {
    console.error('KILLLOOTFIXTURE STOP: CELLGATE=1 required (both legs).');
    process.exit(2);
  }
  if (process.env.FIGHTALLY2 !== '1') {
    console.error('KILLLOOTFIXTURE STOP: FIGHTALLY2=1 required (both legs) — the prereg party is holder + 2 allies; without it only 1 ally joins.');
    process.exit(2);
  }
  const kbPresent = killbundlePresent();
  if (!kbPresent) {
    console.error('KILLLOOTFIXTURE STOP: the KILLBUNDLE lever code (game.js villagerKillLoot) must be present.');
    process.exit(2);
  }
  const { Game } = await loadGame({ seed: 7, mode: 'killlootfixture-' + MODE, fullTelemetry: false });
  await setupGame(Game);
  const roster = ((Game.state.village || {}).roster || []);
  const living = [];
  for (const r of roster) {
    if (!r || r === Game.villagerId) continue;
    const p = Game.getPerson ? Game.getPerson(r) : null;
    if (p && !p.dead) living.push({ vid: r, person: p });
  }
  if (living.length < 3) {
    console.error('KILLLOOTFIXTURE STOP: need holder + 2 living allies, found ' + living.length);
    process.exit(2);
  }
  const holder = living[0].vid, holderPerson = living[0].person;
  const allies = [living[1].vid, living[2].vid];
  const monsters = Game.data.monsters || Game.data.monstersList || [];
  const mlist = Array.isArray(monsters) ? monsters : (monsters.monsters || []);
  const mdef = (mlist || []).find(function (m) { return m && m.id === 'herald'; });
  if (!mdef || mdef.wave !== 4) {
    console.error('KILLLOOTFIXTURE STOP: herald wave-4 mdef not found (wave=' + (mdef && mdef.wave) + ')');
    process.exit(2);
  }
  // --- staging: force the kill-loot drop, then restore the stub ---
  const origRoll = Game.rollAlienLoot;
  let before = null, drop = null, gains = [], stubRestored = false;
  try {
    Game.rollAlienLoot = function () { return 'searcaster'; };
    before = driver.snapshotGunCells(Game);
    drop = Game.villagerKillLoot(holder, { wave: 4, id: 'fixture-beast' });
    const afterSnap = driver.snapshotGunCells(Game);
    gains = driver.diffGunCells(before, afterSnap);
  } catch (e) {
    errors.push('staging: ' + String(e.message).slice(0, 120));
  } finally {
    Game.rollAlienLoot = origRoll;
    stubRestored = (Game.rollAlienLoot === origRoll);
  }
  const holderGain = (gains || []).find(function (g) { return g.holder === holder; }) || null;
  const cellsAtArrival = holderGain ? holderGain.cellsGained : null;
  const gunsAtArrival = holderGain ? holderGain.gunsGained : null;
  // --- fight-entry gear-up, run explicitly before the pre-fight read ---
  // fieldFight re-equips the fighter at entry (villagerGearUp(vid,
  // false)); the gun sits in items until then, so an equipped-slot read
  // before entry sees null. Running the engine's own entry step here
  // (deterministic, no acquisition, idempotent — fieldFight runs the
  // identical call again at entry) makes the setup gate read what the
  // fight will actually see. Instrument correction after a ctl false
  // start (setup-gate failed equipped=null before any judged data);
  // the frozen prereg's gate text is unchanged.
  try {
    if (typeof Game.villagerGearUp === 'function') Game.villagerGearUp(holder, false);
    else errors.push('gear-up: villagerGearUp not a function');
  } catch (e) { errors.push('gear-up: ' + String(e.message).slice(0, 80)); }
  // --- pre-fight state + setup gate ---
  const preState = preFightStateOf(Game);
  let kit = null, cellsPre = null, hpBefore = null;
  try {
    kit = driver.rangedKitOf(Game, holderPerson);
    cellsPre = countItemIn(holderPerson.items, 'fusion_cell');
    hpBefore = (((Game.state || {}).village || {}).health || {})[holder] != null
      ? ((Game.state.village || {}).health || {})[holder] : 100;
  } catch (e) { errors.push('prefight-read: ' + String(e.message).slice(0, 80)); }
  const expectCells = (MODE === 'arm') ? 2 : 0;
  const setupGate = (kit && kit.rwId === 'searcaster' && cellsPre === expectCells);
  const out = {
    arm: 'killlootfixture-a', mode: MODE, rerun: RERUN, seed: 7,
    anchorCommit: (function () { try { return require('child_process').execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim(); } catch (e) { return 'unknown'; } })(),
    killbundlePresent: kbPresent, cellgateOn: true,
    holder: holder, allies: allies, monsterId: 'herald', monsterWave: 4,
    dropId: drop, cellsAtArrival: cellsAtArrival, gunsAtArrival: gunsAtArrival,
    gains: gains, stubRestored: stubRestored,
    preFightEquippedRanged: kit ? kit.rwId : null,
    preFightCells: cellsPre, hpBefore: hpBefore,
    preFightState: preState,
    setupGate: !!setupGate,
    instrumentErrors: errors,
  };
  if (!setupGate) {
    out.setupGateWhy = 'equipped=' + (kit && kit.rwId) + ' cells=' + cellsPre + ' expected=' + expectCells;
    writeRobust(OUT_FILE, JSON.stringify(out, null, 2) + '\n');
    console.error('KILLLOOTFIXTURE SETUP-FAIL: ' + out.setupGateWhy);
    console.log(JSON.stringify({ mode: MODE, rerun: RERUN, setupGate: false, why: out.setupGateWhy, file: path.relative(REPO, OUT_FILE) }));
    process.exit(2);
  }
  // --- the wave-4 door fight ---
  let rec = null;
  try {
    rec = Game.fieldFight(holder, mdef, null, { allies: 2, allyVids: allies.slice(), allyFromStart: true });
  } catch (e) {
    errors.push('fieldFight threw: ' + String(e.message).slice(0, 120));
    out.instrumentErrors = errors;
    writeRobust(OUT_FILE, JSON.stringify(out, null, 2) + '\n');
    console.error('KILLLOOTFIXTURE STOP: fieldFight threw: ' + e.stack);
    process.exit(2);
  }
  let holderAlive = null, cellsAfter = null, hpAfter = null, hpAfterHealthMap = null;
  try {
    const p2 = Game.getPerson ? Game.getPerson(holder) : null;
    // HOLDER-ALIVE READ (instrument correction): village.health carries
    // NO entry for the holder at setup (null before and after — fieldFight
    // reads HP with a 100 default and never writes it back to the map in
    // this path), so a health-map read always reports dead. The sealed
    // fight record's vHpLeft IS the authoritative post-fight HP.
    holderAlive = !!(p2 && !p2.dead) && (rec && rec.vHpLeft != null ? rec.vHpLeft > 0 : false);
    cellsAfter = countItemIn((p2 && p2.items) || [], 'fusion_cell');
    hpAfter = (rec && rec.vHpLeft != null) ? rec.vHpLeft : null;
    hpAfterHealthMap = (((Game.state || {}).village || {}).health || {})[holder] != null
      ? ((Game.state.village || {}).health || {})[holder] : null;
  } catch (e) { errors.push('postfight-read: ' + String(e.message).slice(0, 80)); }
  out.volley = (rec && rec.volley) || null;
  out.outcome = rec ? rec.outcome : null;
  out.rounds = rec ? rec.rounds : null;
  out.mDealt = rec ? rec.mDealt : null;
  out.vHpLeft = rec ? rec.vHpLeft : null;
  out.mHpLeft = rec ? rec.mHpLeft : null;
  out.holderAlive = holderAlive;
  out.cellsAfterFight = cellsAfter;
  out.hpAfter = hpAfter;
  out.hpAfterHealthMap = hpAfterHealthMap;
  out.partySize = rec ? rec.partySize : null;
  out.allyVid = rec ? rec.allyVid : null;
  out.ally2Vid = rec ? rec.ally2Vid : null;
  out.log = (rec && rec.log) || [];
  out.arrowLine = (out.log || []).some(function (l) { return String(l).indexOf('nocks an arrow') !== -1; });
  out.instrumentErrors = errors;
  out.judged = judgedFields(out);
  fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
  writeRobust(OUT_FILE, JSON.stringify(out, null, 2) + '\n');
  console.log(JSON.stringify({
    mode: MODE, rerun: RERUN, holder: holder, allies: allies,
    drop: drop, cellsAtArrival: cellsAtArrival, gunsAtArrival: gunsAtArrival,
    equipped: out.preFightEquippedRanged, cellsPre: cellsPre,
    volley: out.volley, outcome: out.outcome, rounds: out.rounds,
    partySize: out.partySize, allyVid: out.allyVid, ally2Vid: out.ally2Vid,
    holderAlive: holderAlive, cellsAfter: cellsAfter,
    stubRestored: stubRestored, errors: errors.length,
    file: path.relative(REPO, OUT_FILE),
  }));
}

function compare() {
  function load(f) {
    try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { return null; }
  }
  const ctl = load(path.join(EVIDENCE_DIR, 'killlootfixture-a-ctl.json'));
  const arm = load(path.join(EVIDENCE_DIR, 'killlootfixture-a-arm.json'));
  const ctlR = load(path.join(EVIDENCE_DIR, 'killlootfixture-a-ctl-rerun.json'));
  const armR = load(path.join(EVIDENCE_DIR, 'killlootfixture-a-arm-rerun.json'));
  const bars = {};
  const notes = [];
  if (!ctl || !arm) {
    console.log('COMPARE STOP: missing leg files (need ctl + arm).');
    process.exit(2);
  }
  // Bar 1 — arrival.
  bars.arrival = (arm.cellsAtArrival === 2 && ctl.cellsAtArrival === 0 &&
    arm.gunsAtArrival === 1 && ctl.gunsAtArrival === 1 &&
    arm.holder === ctl.holder);
  if (!bars.arrival) notes.push('arrival: arm cells=' + arm.cellsAtArrival + ' ctl cells=' + ctl.cellsAtArrival +
    ' arm guns=' + arm.gunsAtArrival + ' ctl guns=' + ctl.gunsAtArrival + ' holders ' + arm.holder + '/' + ctl.holder);
  // Bar 2 — PRIMARY volley.
  const armVolleys = (arm.volley && arm.volley.shots > 0) ? 1 : 0;
  const ctlVolleys = (ctl.volley && ctl.volley.shots > 0) ? 1 : 0;
  bars.volley = (armVolleys >= 1 && ctlVolleys === 0);
  if (!bars.volley) notes.push('volley: arm=' + armVolleys + ' ctl=' + ctlVolleys +
    ' armVolley=' + JSON.stringify(arm.volley) + ' ctlVolley=' + JSON.stringify(ctl.volley));
  // Bar 3 — determinism.
  let detCtl = false, detArm = false;
  if (ctlR) detCtl = JSON.stringify(judgedFields(ctlR)) === JSON.stringify(judgedFields(ctl));
  if (armR) detArm = JSON.stringify(judgedFields(armR)) === JSON.stringify(judgedFields(arm));
  bars.determinism = detCtl && detArm;
  if (!bars.determinism) notes.push('determinism: ctl-rerun-match=' + detCtl + ' arm-rerun-match=' + detArm);
  // Bar 4 — neutrality.
  const nd = neutralityDiff(ctl.preFightState, arm.preFightState, arm.holder);
  bars.neutrality = (ctl.stubRestored === true && arm.stubRestored === true && nd.length === 0 &&
    ((ctl.instrumentErrors || []).length === 0) && ((arm.instrumentErrors || []).length === 0));
  if (!bars.neutrality) notes.push('neutrality: stubRestored ctl=' + ctl.stubRestored + ' arm=' + arm.stubRestored +
    ' diff=' + JSON.stringify(nd) + ' errors ctl=' + (ctl.instrumentErrors || []).length + ' arm=' + (arm.instrumentErrors || []).length);
  // Bar 5 — holder fate (report only).
  bars.holderFate = { ctlAlive: ctl.holderAlive, armAlive: arm.holderAlive };
  // Bar 6 — instrument validity (selftest inline; proof test 12/12 recorded separately from pre-flight).
  let selftest = false;
  try { selftest = analyzer.selftest() === true; } catch (e) { selftest = false; }
  bars.instrument = (selftest && ctl.killbundlePresent === true && arm.killbundlePresent === true &&
    ctl.setupGate === true && arm.setupGate === true);
  if (!bars.instrument) notes.push('instrument: selftest=' + selftest + ' kbPresent ctl=' + ctl.killbundlePresent +
    ' arm=' + arm.killbundlePresent + ' setupGate ctl=' + ctl.setupGate + ' arm=' + arm.setupGate);
  const go = bars.arrival && bars.volley && bars.determinism && bars.neutrality && bars.instrument;
  const verdict = go ? 'GO' : 'NO-GO';
  console.log(JSON.stringify({
    verdict: verdict,
    bars: { arrival: bars.arrival, volley: bars.volley, determinism: bars.determinism,
      neutrality: bars.neutrality, instrument: bars.instrument },
    holderFate: bars.holderFate,
    armVolley: arm.volley, ctlVolley: ctl.volley,
    armCellsAtArrival: arm.cellsAtArrival, ctlCellsAtArrival: ctl.cellsAtArrival,
    armOutcome: arm.outcome, ctlOutcome: ctl.outcome,
    armRounds: arm.rounds, ctlRounds: ctl.rounds,
    armArrowLine: arm.arrowLine, ctlArrowLine: ctl.arrowLine,
    notes: notes,
  }, null, 2));
  process.exit(go ? 0 : 1);
}

if (require.main === module) {
  if (process.argv[2] === '--compare') { compare(); }
  else {
    (async function () {
      await oneLeg();
    })().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
  }
}
module.exports = { neutralityDiff: neutralityDiff, judgedFields: judgedFields, preFightStateOf: preFightStateOf };
