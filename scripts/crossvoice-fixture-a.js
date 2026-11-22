// crossvoice-fixture-a.js — staged volley fixture for arm sim-crossvoice-a
// (crossbow/sling/phase_sling volley narration — same defect class
// sim-searvoice-a fixed for the searcaster, leftover per searvoice §5/§6).
// Mirrors scripts/test-killlootfixture-a.js exactly in shape: same harness
// (seed via loadGame, Math.random seeded BEFORE eval), same holder + 2-ally
// party, same wave-4 Herald door fight, same fieldFight call — only the
// staged ranged weapon differs. The searcaster fixture stages its gun
// through the kill-loot path because that path is what it tests; here the
// staged weapon IS the test input, so it is granted directly to the holder
// (the gear-up + fieldFight path under test is identical).
//   CROSSVOICE_WEAPON=crossbow|sling|phase_sling|bow  (default crossbow)
//   CROSSVOICE_AMMO=N   (default 4; 0 = dry leg, no ammo)
//   CROSSVOICE_SEED=N   (default 7, same as killlootfixture-a)
//   CROSSVOICE_EVIDENCE_DIR=evidence/2026-11-22 (default)
// Writes evidence/2026-11-22/crossvoice-a-<weapon>-<armed|dry>[-rerun].json.
// Run with the full pilot substrate env (same as the killlootfixture legs):
//   VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1
//   BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1 node scripts/crossvoice-fixture-a.js
// (rerun: add 'rerun' as argv[2] — determinism copy.)
// Prereg: evidence/2026-11-22/sim-crossvoice-a-prereg.md (frozen before
// any judged run; scripts/test-crossvoice-a.js is the judge).
'use strict';
const path = require('path');
const fs = require('fs');
const { spawnSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const driver = require(path.join(REPO, 'scripts', 'killlootbundle-driver-a'));
const { loadGame, setupGame } = require(path.join(REPO, 'scripts', 'sim-harness'));

const EVIDENCE_DIR = process.env.CROSSVOICE_EVIDENCE_DIR
  ? path.join(REPO, process.env.CROSSVOICE_EVIDENCE_DIR)
  : path.join(REPO, 'evidence', '2026-11-22');
const WEAPON = process.env.CROSSVOICE_WEAPON || 'crossbow';
const AMMO_N = (process.env.CROSSVOICE_AMMO == null) ? 4 : parseInt(process.env.CROSSVOICE_AMMO, 10);
const SEED = (process.env.CROSSVOICE_SEED == null) ? 7 : parseInt(process.env.CROSSVOICE_SEED, 10);
const MODE = AMMO_N > 0 ? 'armed' : 'dry';
const RERUN = process.argv[2] === 'rerun';
const OUT_FILE = path.join(EVIDENCE_DIR, 'crossvoice-a-' + WEAPON + '-' + MODE + (RERUN ? '-rerun' : '') + '.json');

function sleepMs(ms) {
  try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); }
  catch (e) {
    const t0 = process.hrtime.bigint();
    while (process.hrtime.bigint() - t0 < BigInt(ms) * 1000000n) {}
  }
}
// writeRobust — same flap-safe writer as test-killlootfixture-a.js:
// write to a temp file + rename when the target is new, direct write +
// readback when it exists, retrying up to 480x; last resort prints the
// payload to stdout so the run still records it.
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
function itemMatOf(e) {
  if (!e || typeof e === 'string') return null;
  return e.material || null;
}
// Ammo as the volley block itself counts it: an entry counts when its id
// OR its material equals the ammo id (a stone-material tool is a stone
// to a sling). The setup gate uses this count, so the gate reads what
// the fight will actually fire.
function countAmmoLikeVolley(items, ammoId) {
  let n = 0;
  for (const e of (items || [])) {
    if (itemIdOf(e) === ammoId || itemMatOf(e) === ammoId) {
      n += (typeof e === 'string') ? 1 : ((e.units == null) ? 1 : e.units);
    }
  }
  return n;
}
function judgedFields(out) {
  return {
    ammoAtArrival: out.ammoAtArrival,
    volley: out.volley,
    outcome: out.outcome, rounds: out.rounds,
    mHpLeft: out.mHpLeft, vHpLeft: out.vHpLeft,
    holderAlive: out.holderAlive, ammoAfterFight: out.ammoAfterFight,
  };
}

async function oneLeg() {
  const errors = [];
  if (process.env.CELLGATE !== '1') {
    console.error('CROSSVOICE STOP: CELLGATE=1 required (both legs).');
    process.exit(2);
  }
  if (process.env.FIGHTALLY2 !== '1') {
    console.error('CROSSVOICE STOP: FIGHTALLY2=1 required (both legs) — the prereg party is holder + 2 allies; without it only 1 ally joins.');
    process.exit(2);
  }
  const { Game } = await loadGame({ seed: SEED, mode: 'crossvoice-' + WEAPON + '-' + MODE, fullTelemetry: false });
  await setupGame(Game);
  const roster = ((Game.state.village || {}).roster || []);
  const living = [];
  for (const r of roster) {
    if (!r || r === Game.villagerId) continue;
    const p = Game.getPerson ? Game.getPerson(r) : null;
    if (p && !p.dead) living.push({ vid: r, person: p });
  }
  if (living.length < 3) {
    console.error('CROSSVOICE STOP: need holder + 2 living allies, found ' + living.length);
    process.exit(2);
  }
  const holder = living[0].vid, holderPerson = living[0].person;
  const allies = [living[1].vid, living[2].vid];
  const monsters = Game.data.monsters || Game.data.monstersList || [];
  const mlist = Array.isArray(monsters) ? monsters : (monsters.monsters || []);
  const mdef = (mlist || []).find(function (m) { return m && m.id === 'herald'; });
  if (!mdef || mdef.wave !== 4) {
    console.error('CROSSVOICE STOP: herald wave-4 mdef not found (wave=' + (mdef && mdef.wave) + ')');
    process.exit(2);
  }
  const wdef = (Game.data.items || []).find(function (d) { return d && d.id === WEAPON; });
  if (!wdef || !wdef.weapon || !wdef.weapon.ammo) {
    console.error('CROSSVOICE STOP: weapon ' + WEAPON + ' has no ranged def/ammo');
    process.exit(2);
  }
  const ammoId = wdef.weapon.ammo;
  // --- staging: the holder carries ONLY the staged weapon + exactly N
  // ammo. Strip every ranged weapon (any bow would otherwise win the
  // ranged slot over a sling on bonus) and every entry the volley
  // block would count as this weapon's ammo (id OR material match —
  // a stone-material tool is sling ammo), then grant exactly N.
  // Allies are untouched: only the lead fighter volleys (the volley
  // block is lead-only — one 'the fight opens at range' site in
  // fieldFights.js), so allies cannot pollute the transcript.
  try {
    const defs = Game.data.items || [];
    const isRanged = function (e) {
      const id = itemIdOf(e);
      const d = defs.find(function (x) { return x && x.id === id; });
      return !!(d && d.weapon && d.weapon.type === 'ranged');
    };
    holderPerson.items = (holderPerson.items || []).filter(function (e) {
      return !isRanged(e) && itemIdOf(e) !== ammoId && itemMatOf(e) !== ammoId;
    });
    holderPerson.items.push(WEAPON);
    if (AMMO_N > 0) holderPerson.items.push({ itemId: ammoId, units: AMMO_N });
  } catch (e) { errors.push('staging: ' + String(e.message).slice(0, 120)); }
  // --- fight-entry gear-up, run explicitly before the pre-fight read
  // (same instrument correction as killlootfixture-a: fieldFight
  // re-equips at entry, so the setup gate must read what the fight
  // will actually see).
  try {
    if (typeof Game.villagerGearUp === 'function') Game.villagerGearUp(holder, false);
    else errors.push('gear-up: villagerGearUp not a function');
  } catch (e) { errors.push('gear-up: ' + String(e.message).slice(0, 80)); }
  // --- pre-fight state + setup gate ---
  let kit = null, ammoPre = null, hpBefore = null;
  try {
    kit = driver.rangedKitOf(Game, holderPerson);
    ammoPre = countAmmoLikeVolley(holderPerson.items, ammoId);
    hpBefore = (((Game.state || {}).village || {}).health || {})[holder] != null
      ? ((Game.state || {}).village || {})[holder] : 100;
  } catch (e) { errors.push('prefight-read: ' + String(e.message).slice(0, 80)); }
  const setupGate = (kit && kit.rwId === WEAPON && ammoPre === AMMO_N);
  const out = {
    arm: 'crossvoice-a', weapon: WEAPON, ammoId: ammoId, mode: MODE, rerun: RERUN, seed: SEED,
    anchorCommit: (function () { try { return spawnSync('git', ['rev-parse', 'HEAD'], { cwd: REPO, encoding: 'utf8' }).stdout.trim(); } catch (e) { return 'unknown'; } })(),
    holder: holder, allies: allies, monsterId: 'herald', monsterWave: 4,
    ammoAtArrival: ammoPre,
    preFightEquippedRanged: kit ? kit.rwId : null,
    preFightAmmo: ammoPre, hpBefore: hpBefore,
    setupGate: !!setupGate,
    instrumentErrors: errors,
  };
  if (!setupGate) {
    out.setupGateWhy = 'equipped=' + (kit && kit.rwId) + ' ammo=' + ammoPre + ' expectedWeapon=' + WEAPON + ' expectedAmmo=' + AMMO_N;
    writeRobust(OUT_FILE, JSON.stringify(out, null, 2) + '\n');
    console.error('CROSSVOICE SETUP-FAIL: ' + out.setupGateWhy);
    console.log(JSON.stringify({ weapon: WEAPON, mode: MODE, rerun: RERUN, setupGate: false, why: out.setupGateWhy, file: path.relative(REPO, OUT_FILE) }));
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
    console.error('CROSSVOICE STOP: fieldFight threw: ' + e.stack);
    process.exit(2);
  }
  let holderAlive = null, ammoAfter = null, hpAfter = null;
  try {
    const p2 = Game.getPerson ? Game.getPerson(holder) : null;
    holderAlive = !!(p2 && !p2.dead) && (rec && rec.vHpLeft != null ? rec.vHpLeft > 0 : false);
    ammoAfter = countAmmoLikeVolley((p2 && p2.items) || [], ammoId);
    hpAfter = (rec && rec.vHpLeft != null) ? rec.vHpLeft : null;
  } catch (e) { errors.push('postfight-read: ' + String(e.message).slice(0, 80)); }
  out.volley = (rec && rec.volley) || null;
  out.outcome = rec ? rec.outcome : null;
  out.rounds = rec ? rec.rounds : null;
  out.mDealt = rec ? rec.mDealt : null;
  out.vHpLeft = rec ? rec.vHpLeft : null;
  out.mHpLeft = rec ? rec.mHpLeft : null;
  out.holderAlive = holderAlive;
  out.ammoAfterFight = ammoAfter;
  out.hpAfter = hpAfter;
  out.partySize = rec ? rec.partySize : null;
  out.log = (rec && rec.log) || [];
  out.bowLine = (out.log || []).some(function (l) { return String(l).indexOf('nocks an arrow') !== -1; });
  out.instrumentErrors = errors;
  out.judged = judgedFields(out);
  fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
  writeRobust(OUT_FILE, JSON.stringify(out, null, 2) + '\n');
  console.log(JSON.stringify({
    weapon: WEAPON, mode: MODE, rerun: RERUN, holder: holder, allies: allies,
    equipped: out.preFightEquippedRanged, ammoPre: ammoPre,
    volley: out.volley, outcome: out.outcome, rounds: out.rounds,
    partySize: out.partySize,
    holderAlive: holderAlive, ammoAfter: ammoAfter,
    errors: errors.length,
    file: path.relative(REPO, OUT_FILE),
  }));
}

if (require.main === module) {
  (async function () {
    await oneLeg();
  })().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
}
module.exports = { countAmmoLikeVolley: countAmmoLikeVolley, judgedFields: judgedFields };
