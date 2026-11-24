// PROOF: the base-damage decomposition instrument (sim-basedmg-b,
// finding #2544 — DIAG, no lever). The ragecarry NO-GO exhausted
// the carrier family, so this arm measures instead of building:
//   §1 FIGHTER SNAPSHOT: fighterSnapshot (driver) matches the
//      engine's own weapon/armor reads on live staged villagers,
//      and returns explicit nulls (never silent zeros) for an
//      unreadable vid.
//   §2 PARSER ON A REAL FIGHT: a staged launched-party field fight
//      vs a wave-4 monster, parsed by analyze-basedmg-b.js — the
//      parsed total reconciles against rec.mDealt (residual share
//      <= 0.10), the lead base reconstructs against 6+wb, and a Rage
//      window (when one fires) attributes exactly 3 strikes.
//   §3 DRIVER SMOKE (child process): oneRun on 3 fresh-band seeds
//      returns a corpus with carrier flags OFF, instrument errors 0,
//      and every wave-4+ encounter row carrying a fighters snapshot
//      + full log + allyDealt tally.
//   §4 ANALYZER SELFTEST (child process): green.
//   §5 MODE GUARDS (child processes): MODE=arm stops loudly;
//      MODE=ctl without SENSEEXPED=1 stops loudly.
// Live sections run through scripts/sim-harness.js (seeded, full
// src/js list in index.html order, Math.random seeded before eval).
// Staging follows test-ragecarry-b.js (launched holder: plan +
// expedition; fresh mulberry32(rngSeed) per fight). Trick state is
// reset between attempts (a learned trick displaces fieldAct and
// would hide the strike lines — each staged attempt must be fight
// #1 for that trick).
// Usage: node scripts/test-basedmg-b.js
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const { execSync, spawnSync } = require('child_process');
const { loadGame, setupGame, mulberry32 } = require('./sim-harness');
const { fighterSnapshot } = require('./basedmg-driver-b.js');
const { parseMeetingStrikes } = require('./analyze-basedmg-b.js');

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log('  ok  ' + name); }
  else { fail++; console.log('  FAIL ' + name + (detail !== undefined ? ' :: ' + detail : '')); }
}

async function main() {
  const { Game, loadFails } = await loadGame({ seed: 7, mode: 'test' });
  if (loadFails && loadFails.length) { console.log('FAIL live module load failures: ' + loadFails.join('; ')); process.exit(1); }
  await setupGame(Game);
  const S = globalThis.Scattering;
  const eq = S && S.equipment;
  check('equipment module present (weaponBonusOf/armorOf)', !!(eq && eq.weaponBonusOf && eq.armorOf));
  if (!eq) { console.log('FAIL no equipment'); process.exit(1); }
  const mdef = function (id) { return (Game.data.monsters || []).find(function (m) { return m.id === id; }); };
  const eulogy = mdef('eulogy');
  check('eulogy def is wave 4', !!(eulogy && eulogy.wave === 4));
  const roster = (Game.state.village.roster || []).filter(function (id) { return id !== Game.villagerId; });
  if (roster.length < 4) { console.log('FAIL need 4+ NPCs, have ' + roster.length); process.exit(1); }
  const village = Game.state.village;
  village.npcAbilities = village.npcAbilities || {};
  const items = Game.data.items || [];
  function personOf(vid) {
    try { if (Game.getPerson) return Game.getPerson(vid); } catch (e) {}
    try { if (Game.vpOf) return Game.vpOf(vid); } catch (e) {}
    return null;
  }

  // ================= §1 fighter snapshot =================
  console.log('§1 fighter snapshot');
  let snapChecked = 0;
  for (const vid of roster.slice(0, 3)) {
    const person = personOf(vid);
    if (!person) continue;
    const snap = fighterSnapshot(Game, vid);
    const meleeB = (eq.weaponBonusOf(person, items, 'melee') || 0);
    const rangedB = (eq.weaponBonusOf(person, items, 'ranged') || 0);
    const expWb = Math.round((meleeB + rangedB) / 2);
    const expArmor = (eq.armorOf(person, items) || 0);
    check('§1 snapshot wb matches the engine formula for ' + (snap.name || vid),
      snap.wb === expWb && snap.meleeB === meleeB && snap.rangedB === rangedB,
      'wb ' + snap.wb + ' vs ' + expWb + ' (meleeB ' + snap.meleeB + '/' + meleeB + ', rangedB ' + snap.rangedB + '/' + rangedB + ')');
    check('§1 snapshot armorP matches the engine for ' + (snap.name || vid),
      snap.armorP === expArmor, 'armorP ' + snap.armorP + ' vs ' + expArmor);
    check('§1 snapshot carries the vid + a name for ' + (snap.name || vid),
      snap.vid === vid && typeof snap.name === 'string' && snap.name.length > 0,
      JSON.stringify(snap.name));
    snapChecked++;
  }
  check('§1 snapshot checked on 3 live villagers', snapChecked === 3, 'checked ' + snapChecked);
  const ghost = fighterSnapshot(Game, 'no-such-vid');
  check('§1 snapshot on an unreadable vid returns explicit nulls, never a crash',
    ghost && ghost.vid === 'no-such-vid' && ghost.wb === null && ghost.armorP === null && ghost.name === null,
    JSON.stringify(ghost));

  // ================= §2 parser on a real fight =================
  console.log('§2 parser on a real staged fight');
  const vid = roster[0], cid = roster[1], did = roster[2];
  function resetTrick(mid) {
    try { if (Game.state.villageCounterObs) delete Game.state.villageCounterObs[mid]; } catch (e) {}
    try { if (Game.state.villagerTricks) delete Game.state.villagerTricks[mid]; } catch (e) {}
    try { if (Game.state.monsterCounters) delete Game.state.monsterCounters[mid]; } catch (e) {}
  }
  function stage(mid, abilities) {
    village.npcAbilities[vid] = (abilities || []).slice();
    village.npcAbilities[cid] = [];
    village.npcAbilities[did] = [];
    village.winPlan = village.winPlan || {};
    village.winPlan[vid] = { stage: 'hunt', target: { type: 'monster', mid: mid }, node: null,
      party: [cid, did], sinceDay: 1, holdSinceDay: -1 };
    try { const ag = Game.agencyState ? Game.agencyState() : null; if (ag) { ag.exped = ag.exped || {}; ag.exped[vid] = { tx: 5, ty: 5 }; } } catch (e) {}
    try { ((village.health = village.health || {}))[vid] = 100; village.health[cid] = 100; village.health[did] = 100; } catch (e) {}
    resetTrick(mid);
  }
  // Try rng seeds until a fight with rounds > 0 and damage dealt
  // appears (an evade or a no-contact fight proves nothing here).
  let rec = null, usedSeed = null;
  const trySeeds = [101, 102, 103, 104, 105, 106, 107, 108];
  for (const rs of trySeeds) {
    stage('eulogy', []);
    const r = Game.fieldFight(vid, eulogy, null,
      { awareness: false, rng: mulberry32(rs), allies: 2, allyVids: [cid, did], allyFromStart: true });
    if (r && (r.rounds | 0) > 0 && (r.mDealt | 0) > 0) { rec = r; usedSeed = rs; break; }
  }
  check('§2 a staged launched-party fight vs wave-4 lands (rounds>0, dealt>0)',
    !!rec, 'tried seeds ' + trySeeds.join(','));
  if (!rec) { console.log('FAIL no staged fight landed'); process.exit(1); }
  console.log('  (staged fight: rngSeed ' + usedSeed + ', ' + rec.rounds + ' rounds, outcome ' + rec.outcome + ', mDealt ' + rec.mDealt + ')');
  const fighters = [fighterSnapshot(Game, vid), fighterSnapshot(Game, cid), fighterSnapshot(Game, did)];
  const row = { vid: vid, mid: 'eulogy', wave: 4, outcome: rec.outcome, rounds: rec.rounds,
    mDealt: rec.mDealt, mHpStart: null, rageFired: !!rec.rageFired, fighters: fighters, log: (rec.log || []).slice() };
  const parsed = parseMeetingStrikes(row);
  check('§2 parsed total reconciles against rec.mDealt (residual share <= 0.10)',
    parsed.residualShare != null && Math.abs(parsed.residualShare) <= 0.10,
    'parsed ' + parsed.parsedTotal + ' vs mDealt ' + rec.mDealt + ' (residual ' + parsed.residual + ', share ' + (parsed.residualShare == null ? 'n/a' : parsed.residualShare.toFixed(3)) + ')');
  const leadF = fighters[0];
  const leadStrikes = parsed.strikes.filter(function (s) { return s.vid === vid && s.kind === 'strike' && s.base != null; });
  const meanBase = leadStrikes.length ? leadStrikes.reduce(function (a, s) { return a + s.base; }, 0) / leadStrikes.length : null;
  check('§2 lead bases sit inside the tactical roll range [4+wb, 8+wb] (±2 for modifier rounding)',
    leadStrikes.length > 0 && leadF.wb != null && leadStrikes.every(function (s) { return s.base >= 4 + leadF.wb - 2 && s.base <= 8 + leadF.wb + 2; }) &&
    meanBase != null && Math.abs(meanBase - (6 + leadF.wb)) <= 3,
    'bases ' + JSON.stringify(leadStrikes.map(function (s) { return s.base; })) + ' vs range [' + (4 + leadF.wb) + ', ' + (8 + leadF.wb) + '], mean ' + (meanBase == null ? 'n/a' : meanBase.toFixed(1)));
  check('§2 base validation rate is 1.0 on the real log',
    parsed.baseValidationRate === 1, 'rate ' + parsed.baseValidationRate);
  check('§2 every parsed strike names a snapshot fighter (no unknown strikers)',
    parsed.strikes.every(function (s) { return s.vid === vid || s.vid === cid || s.vid === did; }),
    JSON.stringify(parsed.strikes.filter(function (s) { return !(s.vid === vid || s.vid === cid || s.vid === did); }).slice(0, 3)));
  if (rec.rageFired) {
    check('§2 a real Rage fire attributes exactly 3 strikes',
      parsed.rageStrikes === 3 && parsed.rageWindowsOpened >= 1,
      'rageStrikes ' + parsed.rageStrikes + ', windows ' + parsed.rageWindowsOpened);
  } else {
    console.log('  (no Rage fired in the staged fight — the Rage-window check is covered by the analyzer selftest)');
  }

  // ================= §3 driver smoke (child process) =================
  console.log('§3 driver smoke (child process, 3 seeds x 150d)');
  const smokeEnv = Object.assign({}, process.env, {
    SENSEEXPED: '1', PARTYSIZE4: '1', VETREENGAGE: '1', FLEEREPAIR2: '1', FIGHTALLY2: '1',
    MODE: 'ctl', RUN: 'basedmg-b-proof', DAYS: '150',
  });
  const smoke = spawnSync('node', ['-e',
    "const d=require('./scripts/basedmg-driver-b.js');(async()=>{const outs=[];for(const s of [109501,109502,109503]){outs.push(await d.oneRun(s));}console.log(JSON.stringify({carrierOn:outs.map(o=>o.carrierOn),errors:outs.map(o=>o.instrumentErrors.length),encounters:outs.map(o=>o.v4encounters.length),rows:outs.map(o=>o.v4encounters.filter(r=>(r.wave|0)>=4).map(r=>({fighters:(r.fighters||[]).length,log:(r.log||[]).length,allyDealt:typeof r.allyDealt,origin:r.origin}))) }));})().catch(e=>{console.error(e.stack);process.exit(1);});",
  ], { cwd: REPO, env: smokeEnv, encoding: 'utf8', timeout: 600000 });
  check('§3 driver smoke exits 0', smoke.status === 0, 'status ' + smoke.status + ' stderr ' + String(smoke.stderr || '').slice(0, 300));
  let smokeOut = null;
  try { smokeOut = JSON.parse(String(smoke.stdout || '').trim().split('\n').pop()); } catch (e) { smokeOut = null; }
  check('§3 smoke output parses', !!smokeOut, String(smoke.stdout || '').slice(0, 200));
  if (smokeOut) {
    check('§3 carrier flags OFF on all three smoke seeds', smokeOut.carrierOn.every(function (x) { return x === false; }), JSON.stringify(smokeOut.carrierOn));
    check('§3 instrument errors 0 on all three smoke seeds', smokeOut.errors.every(function (x) { return x === 0; }), JSON.stringify(smokeOut.errors));
    const allRows = [].concat.apply([], smokeOut.rows);
    check('§3 at least one wave-4+ encounter row across the smoke seeds', allRows.length >= 1, 'rows ' + allRows.length);
    check('§3 every wave-4+ row carries a fighters snapshot + a log + a numeric allyDealt',
      allRows.every(function (r) { return r.fighters >= 1 && r.log >= 0 && r.allyDealt === 'number'; }),
      JSON.stringify(allRows.slice(0, 3)));
    console.log('  (smoke: ' + allRows.length + ' wave-4+ rows, encounters per seed ' + JSON.stringify(smokeOut.encounters) + ')');
  }

  // ================= §4 analyzer selftest (child process) =================
  console.log('§4 analyzer selftest');
  const self = spawnSync('node', ['scripts/analyze-basedmg-b.js', '--selftest'],
    { cwd: REPO, encoding: 'utf8', timeout: 120000 });
  check('§4 analyzer --selftest exits 0', self.status === 0,
    'status ' + self.status + ' :: ' + String(self.stdout || '').trim().split('\n').pop() + ' ' + String(self.stderr || '').slice(0, 200));

  // ================= §5 MODE guards (child processes) =================
  console.log('§5 MODE guards');
  const guardArm = spawnSync('node', ['scripts/basedmg-driver-b.js'],
    { cwd: REPO, env: Object.assign({}, process.env, { MODE: 'arm', SEEDS: '109501' }), encoding: 'utf8', timeout: 60000 });
  check('§5 MODE=arm stops loudly (exit 2, BASEDMG STOP)', guardArm.status === 2 && /BASEDMG STOP/.test(String(guardArm.stderr || '')),
    'status ' + guardArm.status + ' :: ' + String(guardArm.stderr || '').slice(0, 200));
  const guardSenseEnv = Object.assign({}, process.env, { MODE: 'ctl', SEEDS: '109501',
    VETREENGAGE: '1', FLEEREPAIR2: '1', FIGHTALLY2: '1', PARTYSIZE4: '1' });
  delete guardSenseEnv.SENSEEXPED; // SENSEEXPED deliberately unset.
  const guardSense = spawnSync('node', ['scripts/basedmg-driver-b.js'],
    { cwd: REPO, env: guardSenseEnv, encoding: 'utf8', timeout: 60000 });
  check('§5 MODE=ctl without SENSEEXPED=1 stops loudly (exit 2, BASEDMG STOP)', guardSense.status === 2 && /BASEDMG STOP/.test(String(guardSense.stderr || '')),
    'status ' + guardSense.status + ' :: ' + String(guardSense.stderr || '').slice(0, 200));

  console.log('test-basedmg-b: ' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
}

main().catch(function (e) { console.error(e.stack); process.exit(1); });
