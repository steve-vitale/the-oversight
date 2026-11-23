// test-doorstage-b.js — proof test, arm sim-doorstage-b
// (finding #2695: the leader-projection gate's D1, fourth attempt
// at supply — stage pool doors deliberately, per the doorrich
// metric review. The driver stages a geared pinned quad at a
// wave-4+ door with its leader hurt, through the real
// expeditionMonster door-open decision, on both legs.)
//
// WHAT IT PROVES (observable effect, not just assertions):
//   §0 the driver stages through existing entry points (no game
//     hook invented) and the gateavoid analyzer is reused verbatim
//     (no doorstage fork of it).
//   §1 the driver's spec JSON matches the frozen prereg table door
//     for door (16 doors, 12 pool + 4 safe, bands per the
//     analyzer's projectionBand).
//   §2 GATE REFUSES a staged dead2 door (audit, leader 30 HP,
//     armed): no fight, leaderprojFires 1, one 'proj' log entry
//     (hp 30, projHp2 -20, mid audit), no fought row, and the
//     parsed note cross-checks the log.
//   §3 GATE FIGHTS a staged safe door (reunion, leader 85 HP,
//     armed): the door opens (allyFromStart, pinned trio),
//     leaderprojFires 0, armor P in the live 8-30 range.
//   §4 CONTROL/ARMED DETERMINISM on identical staged safe doors
//     (reunion 85, audit 80): the fought rows are identical
//     (outcome/rounds/dealt/vTaken/log equal exactly).
//   §5 LOG-VS-NOTES ATTRIBUTION: the reused analyzer, run over a
//     synthetic control/armed pair built from staged doors,
//     attributes the refused dead2 door from the durable log
//     (seed+day+mid) — matchedPool projAvoids 1, armedBad 0,
//     divergence 0 — with D5 + D6 green on the staged corpus
//     shape.
//   §6 DRIVER SMOKE: the doorstage driver runs one staged door
//     per leg (exit 0, 0 instrument errors, every D5 field on
//     the corpus).
//   §7 BASE GATES: test-leaderproj-b.js re-runs green (55/55) and
//     test-gateavoid-b.js re-runs green (36/36) on this tip.
// Fixture (encounter-gear rule, Steve 2026-11-13): the staged party
// is a geared wave-4 hunting party — hide_armor + hunting_spear,
// leader at the staged HP, allies at 100 HP — never a fresh
// un-geared scholar. The meeting is staged through
// expeditionMonster itself (the gates' home), with the monster
// pool forced to the door's single monster def.
// Usage: node scripts/test-doorstage-b.js
// Exit 0 = all checks pass.
'use strict';
const path = require('path');
const fs = require('fs');
const os = require('os');
const { spawnSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const driver = require(path.join(REPO, 'scripts', 'doorstage-driver-b'));
const gateAvoid = require(path.join(REPO, 'scripts', 'analyze-gateavoid-b'));

let passed = 0, failed = 0;
function check(name, cond, extra) {
  if (cond) { passed++; console.log('PASS ' + name); }
  else { failed++; console.log('FAIL ' + name + (extra != null ? ' :: ' + JSON.stringify(extra) : '')); }
}
function eq(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

// The frozen prereg table (evidence/2026-11-23/
// sim-doorstage-b-prereg.md) — the test cross-checks the driver's
// spec JSON against it door for door.
const FROZEN_TABLE = [
  { door: 1, seed: 424200, mid: 'audit', wave: 4, leaderHp: 30, band: 'dead2', pool: true },
  { door: 2, seed: 424201, mid: 'reunion', wave: 4, leaderHp: 40, band: 'dead2', pool: true },
  { door: 3, seed: 424202, mid: 'eater', wave: 4, leaderHp: 50, band: 'dead2', pool: true },
  { door: 4, seed: 424203, mid: 'strike', wave: 4, leaderHp: 35, band: 'dead2', pool: true },
  { door: 5, seed: 424204, mid: 'suburb', wave: 4, leaderHp: 55, band: 'collapse2', pool: true },
  { door: 6, seed: 424205, mid: 'eulogy', wave: 4, leaderHp: 65, band: 'collapse2', pool: true },
  { door: 7, seed: 424206, mid: 'algorithm', wave: 4, leaderHp: 75, band: 'collapse2', pool: true },
  { door: 8, seed: 424207, mid: 'congregation', wave: 4, leaderHp: 60, band: 'collapse2', pool: true },
  { door: 9, seed: 424208, mid: 'influencer', wave: 4, leaderHp: 70, band: 'collapse2', pool: true },
  { door: 10, seed: 424209, mid: 'audit', wave: 4, leaderHp: 55, band: 'collapse2', pool: true },
  { door: 11, seed: 424210, mid: 'rerun', wave: 5, leaderHp: 45, band: 'dead2', pool: true },
  { door: 12, seed: 424211, mid: 'spoiler', wave: 5, leaderHp: 65, band: 'collapse2', pool: true },
  { door: 13, seed: 424212, mid: 'reunion', wave: 4, leaderHp: 85, band: 'safe', pool: false },
  { door: 14, seed: 424213, mid: 'eater', wave: 4, leaderHp: 95, band: 'safe', pool: false },
  { door: 15, seed: 424214, mid: 'audit', wave: 4, leaderHp: 80, band: 'safe', pool: false },
  { door: 16, seed: 424215, mid: 'cancellation', wave: 5, leaderHp: 90, band: 'safe', pool: false },
];

const agSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'villager-agency.js'), 'utf8');
const driverSrc = fs.readFileSync(path.join(REPO, 'scripts', 'doorstage-driver-b.js'), 'utf8');

(function section0() {
  check('§0 the driver stages through existing entry points (monsterWavePool override + expeditionMonster + pinQuadParty, max-30-call loop, no new game hook)',
    /monsterWavePool = function/.test(driverSrc) && /expeditionMonster\(q\.holder, 3, false\)/.test(driverSrc) &&
    /pinQuadParty\(q\.holder/.test(driverSrc) && /MAX_CALLS = 30/.test(driverSrc) &&
    driverSrc.indexOf('src/js') === -1);
  check('§0 the driver reads the frozen spec JSON (doorstage-b-spec.json, not a hardcoded table)',
    /doorstage-b-spec\.json/.test(driverSrc) && /loadSpec/.test(driverSrc));
  check('§0 the gateavoid analyzer is reused verbatim (no analyze-doorstage-b.js fork exists)',
    !fs.existsSync(path.join(REPO, 'scripts', 'analyze-doorstage-b.js')) &&
    typeof gateAvoid.judge === 'function' && typeof gateAvoid.matchedPool === 'function' &&
    typeof gateAvoid.selftest === 'function');
  check('§0 the LEADERPROJ gate is on this base (LEADERPROJ env + _pinDoor + wave >= 4 + projection at-or-below 25)',
    /LEADERPROJ/.test(agSrc) && /_lpProj <= 25/.test(agSrc) && /_lpHp - 50/.test(agSrc) &&
    /\(m\.wave \| 0\) >= 4/.test(agSrc));
  check('§0 the durable log is on this base (gateAvoids + kind proj + projHp2)',
    /gateAvoids/.test(agSrc) && /kind: 'proj'/.test(agSrc) && /projHp2/.test(agSrc));
})();

(async () => {
  process.env.SENSEEXPED = '1'; process.env.PARTYSIZE4 = '1'; process.env.VETREENGAGE = '1';
  process.env.FIGHTALLY2 = '1'; process.env.ALLYSLOT3 = '1'; process.env.PINQUAD = '1';
  process.env.LAUNCHSURVIVE = '1'; process.env.DMGPIN = '1'; process.env.DOORFLEE2 = '1';
  process.env.HYPOFLOOR = '1'; process.env.HPGATE = '1';
  delete process.env.LEADERHPGATE; delete process.env.LEADERPROJ;

  // ---------- §1 SPEC-TABLE CONFORMANCE ----------
  const spec = driver.loadSpec();
  check('§1 the spec loads: 16 staged doors', Array.isArray(spec.doors) && spec.doors.length === 16, spec.doors && spec.doors.length);
  const tableOk = spec.doors.length === FROZEN_TABLE.length && FROZEN_TABLE.every(function (f, i) {
    const d = spec.doors[i];
    return d && d.door === f.door && d.seed === f.seed && d.mid === f.mid && d.wave === f.wave &&
      d.leaderHp === f.leaderHp && d.band === f.band && d.pool === f.pool;
  });
  check('§1 every spec door matches the frozen prereg table (door/seed/mid/wave/leaderHp/band/pool)',
    tableOk, spec.doors.map(function (d) { return d.door + ':' + d.mid + '@' + d.leaderHp; }).join(','));
  const poolN = spec.doors.filter(function (d) { return d.pool; }).length;
  const safeN = spec.doors.filter(function (d) { return !d.pool; }).length;
  check('§1 pool size is 12 staged pool doors + 4 safe negative controls', poolN === 12 && safeN === 4, { pool: poolN, safe: safeN });
  const bandsOk = spec.doors.every(function (d) { return gateAvoid.projectionBand(d.leaderHp) === d.band; });
  check('§1 every door band matches the analyzer projectionBand for its leader HP (dead2 26-50, collapse2 51-75, safe > 75)',
    bandsOk, spec.doors.map(function (d) { return d.door + ':' + d.leaderHp + '=' + gateAvoid.projectionBand(d.leaderHp); }).join(','));

  const doorById = function (n) { return spec.doors.find(function (d) { return d.door === n; }); };

  // ---------- §2 GATE REFUSES a staged dead2 door (armed, door 1: audit, leader 30) ----------
  process.env.LEADERPROJ = '1';
  const g1 = await driver.oneDoor(doorById(1), 'armed');
  check('§2 staging: dead2 door stages clean (0 instrument errors)', g1.instrumentErrors.length === 0, g1.instrumentErrors);
  if (g1.instrumentErrors.length === 0) {
    console.log('  [§2] fought=' + g1.fought + ' fired=' + g1.fired + ' projFires=' + g1.leaderprojFires +
      ' log=' + JSON.stringify(g1.gateAvoidLog) + ' encounters=' + g1.v4encounters.length);
    check('§2 the dead2 door is refused, not fought (fought false, fired true)',
      g1.fought === false && g1.fired === true, { fought: g1.fought, fired: g1.fired });
    check('§2 the projection gate counts itself (leaderprojFires 1, hpgateFires 0, leaderhpgateFires 0)',
      g1.leaderprojFires === 1 && g1.hpgateFires === 0 && g1.leaderhpgateFires === 0,
      { proj: g1.leaderprojFires, hp: g1.hpgateFires, lead: g1.leaderhpgateFires });
    const e1 = (g1.gateAvoidLog || [])[0];
    check('§2 the fire appends one durable proj entry (kind proj, hp 30, projHp2 -20, mid audit, day a number)',
      Array.isArray(g1.gateAvoidLog) && g1.gateAvoidLog.length === 1 && e1 && e1.kind === 'proj' &&
      e1.hp === 30 && e1.projHp2 === -20 && e1.mid === 'audit' && typeof e1.day === 'number', g1.gateAvoidLog);
    check('§2 no fought row is recorded for the refused door (v4encounters empty)',
      g1.v4encounters.length === 0, g1.v4encounters);
    const n1 = (g1.gateAvoidNotes || [])[0];
    check('§2 the parsed note cross-checks the log (same mid/hp/projHp2, kind proj)',
      Array.isArray(g1.gateAvoidNotes) && g1.gateAvoidNotes.length === 1 && n1 && n1.kind === 'proj' &&
      n1.mid === 'audit' && n1.hp === 30 && n1.projHp2 === -20, g1.gateAvoidNotes);
  }

  // ---------- §3 GATE FIGHTS a staged safe door (armed, door 13: reunion, leader 85) ----------
  const g2 = await driver.oneDoor(doorById(13), 'armed');
  check('§3 staging: safe door stages clean (0 instrument errors)', g2.instrumentErrors.length === 0, g2.instrumentErrors);
  if (g2.instrumentErrors.length === 0) {
    const r2 = g2.v4encounters[0];
    console.log('  [§3] fought=' + g2.fought + ' fired=' + g2.fired + ' projFires=' + g2.leaderprojFires +
      ' outcome=' + (r2 && r2.outcome) + ' rounds=' + (r2 && r2.rounds) + ' armorP=' + JSON.stringify(g2.measuredArmorP));
    check('§3 the safe door is fought, not refused (fought true, fired false, leaderprojFires 0)',
      g2.fought === true && g2.fired === false && g2.leaderprojFires === 0,
      { fought: g2.fought, fired: g2.fired, projFires: g2.leaderprojFires });
    check('§3 the safe door opens at the door (allyFromStart true, pinned, three pinned allies)',
      !!r2 && r2.allyFromStart === true && r2.pinned === true && (r2.pinnedAllies || []).length === 3, r2);
    check('§3 the safe door is a real fight (leaderEntryHp 85, rounds >= 1, outcome a fight outcome)',
      !!r2 && r2.leaderEntryHp === 85 && (r2.rounds | 0) >= 1 &&
      ['vKill', 'vFlee', 'mFlee', 'vDie'].indexOf(r2.outcome) !== -1, r2);
    check('§3 the staged gear measures inside the live quad-gate range (armor P 8-30, all four, issued kit read right after gearUp)',
      (g2.measuredArmorP || []).length === 4 && g2.measuredArmorP.every(function (p) { return p >= 8 && p <= 30; }), g2.measuredArmorP);
    check('§3 the door-worn gear is stamped as observed (4 numbers, no range — the game\'s own expedition auto-equip picks pack-best; the issued kit is the floor, not the fight kit)',
      (g2.measuredArmorPAtDoor || []).length === 4 && g2.measuredArmorPAtDoor.every(function (p) { return typeof p === 'number'; }), g2.measuredArmorPAtDoor);
  }

  // ---------- §4 CONTROL/ARMED DETERMINISM on identical staged safe doors ----------
  delete process.env.LEADERPROJ;
  const c13 = await driver.oneDoor(doorById(13), 'control');
  process.env.LEADERPROJ = '1';
  const a13 = await driver.oneDoor(doorById(13), 'armed');
  delete process.env.LEADERPROJ;
  const c15 = await driver.oneDoor(doorById(15), 'control');
  process.env.LEADERPROJ = '1';
  const a15 = await driver.oneDoor(doorById(15), 'armed');
  check('§4 staging: all four determinism doors stage clean (0 instrument errors each)',
    [c13, a13, c15, a15].every(function (o) { return o.instrumentErrors.length === 0; }),
    { c13: c13.instrumentErrors, a13: a13.instrumentErrors, c15: c15.instrumentErrors, a15: a15.instrumentErrors });
  const rC13 = c13.v4encounters[0], rA13 = a13.v4encounters[0];
  const rC15 = c15.v4encounters[0], rA15 = a15.v4encounters[0];
  check('§4 safe door 13 (reunion 85) fights identically control vs armed (full row equal: outcome/rounds/dealt/vTaken/log)',
    !!rC13 && !!rA13 && eq(rC13, rA13), { control: rC13 && { outcome: rC13.outcome, rounds: rC13.rounds, mDealt: rC13.mDealt }, armed: rA13 && { outcome: rA13.outcome, rounds: rA13.rounds, mDealt: rA13.mDealt } });
  check('§4 safe door 15 (audit 80) fights identically control vs armed (full row equal)',
    !!rC15 && !!rA15 && eq(rC15, rA15), { control: rC15 && { outcome: rC15.outcome, rounds: rC15.rounds, mDealt: rC15.mDealt }, armed: rA15 && { outcome: rA15.outcome, rounds: rA15.rounds, mDealt: rA15.mDealt } });
  check('§4 the gate never fires on a safe door on either leg (leaderprojFires 0 control and armed, both doors)',
    c13.leaderprojFires === 0 && a13.leaderprojFires === 0 && c15.leaderprojFires === 0 && a15.leaderprojFires === 0,
    { c13: c13.leaderprojFires, a13: a13.leaderprojFires, c15: c15.leaderprojFires, a15: a15.leaderprojFires });

  // ---------- §5 LOG-VS-NOTES ATTRIBUTION (synthetic judge on staged doors) ----------
  // Control fought door 1 (audit 30) vs armed refused it: the reused
  // analyzer must attribute the missing door from the durable log.
  delete process.env.LEADERPROJ;
  const c1 = await driver.oneDoor(doorById(1), 'control');
  check('§5 staging: control door 1 stages clean (0 instrument errors, fought)', c1.instrumentErrors.length === 0 && c1.fought === true, { errors: c1.instrumentErrors, fought: c1.fought });
  if (c1.instrumentErrors.length === 0 && c1.fought) {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'doorstage-attr-'));
    try {
      const cDir = path.join(tmp, 'ctl'), aDir = path.join(tmp, 'arm');
      fs.mkdirSync(cDir); fs.mkdirSync(aDir);
      fs.writeFileSync(path.join(cDir, 'c1.json'), JSON.stringify(c1));
      fs.writeFileSync(path.join(aDir, 'a1.json'), JSON.stringify(g1));
      const anchor = c1.anchorCommit;
      const j = gateAvoid.judge(cDir, aDir, anchor);
      console.log('  [§5] matchedPool=' + JSON.stringify(j.matchedPool) + ' D5=' + j.bars.D5.pass + ' D6=' + j.bars.D6.pass);
      check('§5 the refused dead2 door scores GOOD from the log (matched pool 1, projAvoids 1, armedBad 0, divergence 0)',
        j.matchedPool.pool === 1 && j.matchedPool.projAvoids === 1 && j.matchedPool.armedBad === 0 && j.matchedPool.divergence === 0, j.matchedPool);
      check('§5 D6 passes on the staged pair (armed log 1 entry == 1 proj fire; control log empty == 0 fires)',
        j.bars.D6.pass === true && j.bars.D6.armed.entries === 1 && j.bars.D6.armed.byKind.proj === 1, j.bars.D6);
      check('§5 D5 passes on the staged pair (anchor + policy + flags + counters + notes/log arrays)',
        j.bars.D5.pass === true, j.bars.D5);
      check('§5 S9 attributes the missing door proj (avoided 1, proj 1, divergence 0)',
        j.avoided.n === 1 && j.avoided.proj === 1 && j.avoided.divergence === 0, j.avoided);
      const cRow = c1.v4encounters[0];
      const aLog = (g1.gateAvoidLog || [])[0];
      check('§5 the log entry keys on the same seed+day+mid as the control fought row (the match the analyzer uses)',
        !!cRow && !!aLog && aLog.day === cRow.day && aLog.mid === cRow.mid && g1.seed === c1.seed,
        { rowDay: cRow && cRow.day, logDay: aLog && aLog.day, rowMid: cRow && cRow.mid, logMid: aLog && aLog.mid });
    } finally {
      try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}
    }
  }

  // ---------- §6 DRIVER SMOKE (one staged door per leg, direct) ----------
  process.env.ALLYSLOT3 = '1'; process.env.PINQUAD = '1'; process.env.DMGPIN = '1'; process.env.DOORFLEE2 = '1'; process.env.HYPOFLOOR = '1'; process.env.HPGATE = '1'; process.env.LEADERPROJ = '1';
  delete process.env.LEADERHPGATE;
  const smokeDir = 'perseed-doorstage-b-smoke';
  const smokePath = path.join(REPO, 'evidence', '2026-11-23', smokeDir);
  try { fs.rmSync(smokePath, { recursive: true, force: true }); } catch (e) {}
  const baseEnv = Object.assign({}, process.env, {
    SENSEEXPED: '1', PARTYSIZE4: '1', VETREENGAGE: '1', FLEEREPAIR2: '1',
    FIGHTALLY2: '1', LAUNCHSURVIVE: '1', ALLYSLOT3: '1', PINQUAD: '1', DMGPIN: '1', DOORFLEE2: '1', HYPOFLOOR: '1', HPGATE: '1',
    EVIDENCE_DATE: '2026-11-23', CORPUS_PREFIX: 'doorstage-b', RUN: 'doorstage-b',
    DOOR_IDS: '1', OUTDIR: smokeDir });
  const envCtl = Object.assign({}, baseEnv, { LEG: 'control' });
  delete envCtl.LEADERPROJ;
  const r6c = spawnSync(process.execPath, [path.join(REPO, 'scripts', 'doorstage-driver-b.js')],
    { cwd: REPO, env: envCtl, encoding: 'utf8', timeout: 600000 });
  check('§6 driver smoke (direct, control): exit 0 on one staged door', r6c.status === 0, (r6c.stderr || '').slice(0, 300));
  const envArm = Object.assign({}, baseEnv, { LEG: 'armed', LEADERPROJ: '1' });
  const r6a = spawnSync(process.execPath, [path.join(REPO, 'scripts', 'doorstage-driver-b.js')],
    { cwd: REPO, env: envArm, encoding: 'utf8', timeout: 600000 });
  check('§6 driver smoke (direct, armed): exit 0 on one staged door (refuses to overwrite — second run writes the same file name only if the first is gone)',
    r6a.status === 0 || /refusing to overwrite/.test(r6a.stderr || ''), (r6a.stderr || '').slice(0, 300));
  // The two legs share one OUTDIR in this smoke, so the armed run
  // refuses the control file by design (exit 3) — rerun it into a
  // second dir to prove the armed leg itself is clean.
  let ddCtl = null, ddArm = null;
  try { ddCtl = JSON.parse(fs.readFileSync(path.join(smokePath, 'doorstage-b-s424200-doorstage-b-pinquaddoor.json'), 'utf8')); } catch (e) {}
  const smokePath2 = path.join(REPO, 'evidence', '2026-11-23', smokeDir + '-armed');
  try { fs.rmSync(smokePath2, { recursive: true, force: true }); } catch (e) {}
  const envArm2 = Object.assign({}, envArm, { OUTDIR: smokeDir + '-armed' });
  const r6a2 = spawnSync(process.execPath, [path.join(REPO, 'scripts', 'doorstage-driver-b.js')],
    { cwd: REPO, env: envArm2, encoding: 'utf8', timeout: 600000 });
  check('§6 driver smoke (direct, armed, own dir): exit 0 on one staged door', r6a2.status === 0, (r6a2.stderr || '').slice(0, 300));
  try { ddArm = JSON.parse(fs.readFileSync(path.join(smokePath2, 'doorstage-b-s424200-doorstage-b-pinquaddoor.json'), 'utf8')); } catch (e) {}
  function d5Fields(d, leg) {
    return !!d && d.anchorCommit && String(d.policySha || '').slice(0, 12) === '1884c8852d38' &&
      d.pinquadFlag === '1' && d.dmgpinFlag === '1' && d.doorflee2Flag === '1' && d.hypofloorFlag === '1' &&
      d.hpgateFlag === '1' && (d.leaderhpgateFlag || null) === null &&
      (d.leaderprojFlag || null) === (leg === 'armed' ? '1' : null) &&
      typeof d.leaderprojFires === 'number' && typeof d.hpgateFires === 'number' &&
      Array.isArray(d.gateAvoidNotes) && Array.isArray(d.gateAvoidLog) &&
      d.slotPresent === true && d.pinPresent === true;
  }
  check('§6 control corpus carries every D5 field + 0 instrument errors + the door fought',
    d5Fields(ddCtl, 'control') && (ddCtl.instrumentErrors || []).length === 0 && ddCtl.fought === true,
    ddCtl && { leaderprojFlag: ddCtl.leaderprojFlag, fought: ddCtl.fought, errors: ddCtl.instrumentErrors });
  check('§6 armed corpus carries every D5 field + 0 instrument errors + the door refused (fired, 1 proj log entry)',
    d5Fields(ddArm, 'armed') && (ddArm.instrumentErrors || []).length === 0 && ddArm.fired === true &&
    (ddArm.gateAvoidLog || []).length === 1 && ddArm.leaderprojFires === 1,
    ddArm && { leaderprojFlag: ddArm.leaderprojFlag, fired: ddArm.fired, logLen: (ddArm.gateAvoidLog || []).length, errors: ddArm.instrumentErrors });
  try { fs.rmSync(smokePath, { recursive: true, force: true }); } catch (e) {}
  try { fs.rmSync(smokePath2, { recursive: true, force: true }); } catch (e) {}

  // ---------- §7 BASE GATES ----------
  const subEnv = Object.assign({}, process.env);
  delete subEnv.LEADERPROJ;
  const r7a = spawnSync(process.execPath, [path.join(REPO, 'scripts', 'test-leaderproj-b.js')],
    { cwd: REPO, env: subEnv, encoding: 'utf8', timeout: 1500000 });
  check('§7 projection gate re-runs green (test-leaderproj-b.js 55/55)',
    r7a.status === 0 && /55 passed, 0 failed/.test(r7a.stdout || ''), (r7a.stdout || '').split('\n').slice(-2).join(' / '));
  const r7b = spawnSync(process.execPath, [path.join(REPO, 'scripts', 'test-gateavoid-b.js')],
    { cwd: REPO, env: subEnv, encoding: 'utf8', timeout: 1500000 });
  check('§7 durable log re-runs green (test-gateavoid-b.js 36/36)',
    r7b.status === 0 && /36 passed, 0 failed/.test(r7b.stdout || ''), (r7b.stdout || '').split('\n').slice(-2).join(' / '));

  console.log('test-doorstage-b: ' + passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
})().catch(function (e) { console.error('test-doorstage-b FATAL', e && e.stack || e); process.exit(1); });
