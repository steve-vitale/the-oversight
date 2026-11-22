// analyze-doorflee2-b.js — analyzer + frozen-bar judge, arm sim-doorflee2-b
// (finding #2619: why a winning pinned quad still flees at doors).
//
// The door definition and the freshness judges are REUSED from the
// shared analyzer (scripts/analyze-pinquaddoor-b.js) — isDoorFight,
// freshDoorKill, deriveDoorEntryHp, dealtBound, b1NonInferiority —
// never re-implemented here. This file adds only the doorflee
// judgments: the flee-rate primary (F1), the kill non-regression
// (P2), the damage-shape guard (P3), the carried B1/B2/B3a bars,
// the substrate check incl. doorflee2Flag (B4), and the door table.
//
// Frozen bars (see evidence/2026-11-21/sim-doorflee2-b-prereg.md):
//   F1 flee (PRIMARY): armed vFlee count <= 4 AND armed flee rate
//      <= control flee rate - 20pp, on fought doors.
//   P2 kills: armed FRESH door kills >= control fresh door kills.
//   P3 damage: armed pooled damage/round on fought doors >= 0.9x control.
//   B1 pin delivery: b1NonInferiority (armed ally3Vid rate >= control
//      - 10pp AND >= 3 armed rows), on the fought-doors subset.
//   B2 ally3Dealt: armed total > 0 AND >= 1 armed fight with >= 10.
//   B3a kill conversion: armed corpus-wide vKill rate on wave-4+ >=
//      control - 2pp.
//   B4 substrate: every file carries anchorCommit == frozen base,
//      policySha 1884c8852d38, pinquadFlag '1', dmgpinFlag '1', and
//      doorflee2Flag null (control) / '1' (armed).
// M5 (balanced panel) and M6 (evidence file) are judged outside this
// file — the panel compare output and this evidence file carry them.
//
// Usage:
//   node scripts/analyze-doorflee2-b.js --control <dir> --armed <dir> --anchor <40-hex> [--json]
//   node scripts/analyze-doorflee2-b.js --selftest
// Exit 0 iff every computed bar passes; exit 1 otherwise (or exit 2
// on a usage/instrument error).
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const shared = require(path.join(__dirname, 'analyze-pinquaddoor-b.js'));
const isDoorFight = shared.isDoorFight;
const freshDoorKill = shared.freshDoorKill;
const b1NonInferiority = shared.b1NonInferiority;

const POLICY_SHA12 = '1884c8852d38';

function readCorpusDir(dir) {
  const files = fs.readdirSync(dir).filter(function (f) { return f.endsWith('.json'); }).sort();
  const out = [];
  for (const f of files) {
    const data = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    out.push({ file: f, data: data });
  }
  return out;
}

function foughtDoors(corpora) {
  const rows = [];
  for (const c of corpora) {
    for (const e of (c.data.v4encounters || [])) {
      if (isDoorFight(e) && (e.rounds | 0) >= 1) rows.push({ seed: c.data.seed, file: c.file, row: e });
    }
  }
  return rows;
}

function doorStats(corpora) {
  const fought = foughtDoors(corpora);
  const stats = {
    files: corpora.length, fought: fought.length,
    vFlee: 0, vKill: 0, mFlee: 0, vDie: 0, other: 0,
    fleeRate: null, killsFresh: 0, kills: [],
    dealt: 0, rounds: 0, dmgPerRound: null,
    doorHold: 0, everHopeless: 0, holdFights: 0,
    ally3Vid: 0, ally3Dealt: 0, ally3DealtMax: 0,
    rows: [],
  };
  for (const d of fought) {
    const e = d.row;
    if (e.outcome === 'vFlee') stats.vFlee++;
    else if (e.outcome === 'vKill') stats.vKill++;
    else if (e.outcome === 'mFlee') stats.mFlee++;
    else if (e.outcome === 'vDie') stats.vDie++;
    else stats.other++;
    stats.dealt += (e.mDealt | 0);
    stats.rounds += (e.rounds | 0);
    stats.doorHold += (typeof e.doorHold === 'number' ? e.doorHold : 0);
    if (e.everHopeless) stats.everHopeless++;
    if ((typeof e.doorHold === 'number' ? e.doorHold : 0) > 0) stats.holdFights++;
    if (e.ally3Vid) stats.ally3Vid++;
    if (typeof e.ally3Dealt === 'number') {
      stats.ally3Dealt += e.ally3Dealt;
      if (e.ally3Dealt > stats.ally3DealtMax) stats.ally3DealtMax = e.ally3Dealt;
    }
    const fk = freshDoorKill(e, 500);
    if (fk.fresh) { stats.killsFresh++; stats.kills.push({ seed: d.seed, day: e.day, mid: e.mid, entryHp: fk.entryHp, method: fk.method }); }
    stats.rows.push({
      seed: d.seed, day: e.day, mid: e.mid, wave: e.wave, rounds: e.rounds, outcome: e.outcome,
      dealt: e.mDealt, dmgPerRound: e.rounds > 0 ? +(e.mDealt / e.rounds).toFixed(1) : null,
      fleeHpFrac: (e.fleeHpFrac != null ? e.fleeHpFrac : null),
      everHopeless: !!e.everHopeless, doorHold: (typeof e.doorHold === 'number' ? e.doorHold : 0),
      ally3Vid: !!e.ally3Vid, ally3Dealt: (typeof e.ally3Dealt === 'number' ? e.ally3Dealt : null),
    });
  }
  stats.fleeRate = stats.fought > 0 ? stats.vFlee / stats.fought : null;
  stats.dmgPerRound = stats.rounds > 0 ? stats.dealt / stats.rounds : null;
  return stats;
}

function wave4KillRate(corpora) {
  let n = 0, k = 0;
  for (const c of corpora) {
    for (const e of (c.data.v4encounters || [])) {
      if (((e.wave | 0) >= 4)) { n++; if (e.outcome === 'vKill') k++; }
    }
  }
  return { n: n, k: k, rate: n > 0 ? k / n : null };
}

// B2 (carried from the dmgpin bars, same subset): ally3Dealt over the
// PINNED wave-4+ v4encounters rows (any rounds/outcome) — the 31-row
// armed subset the dmgpin report priced (total 2,162, max 404), NOT
// just the fought doors.
function pinnedWave4Ally3(corpora) {
  let n = 0, total = 0, max = 0;
  for (const c of corpora) {
    for (const e of (c.data.v4encounters || [])) {
      if (e.pinned && ((e.wave | 0) >= 4)) {
        n++;
        if (typeof e.ally3Dealt === 'number') {
          total += e.ally3Dealt;
          if (e.ally3Dealt > max) max = e.ally3Dealt;
        }
      }
    }
  }
  return { n: n, total: total, max: max };
}

function substrateCheck(corpora, leg, anchor) {
  const bad = [];
  for (const c of corpora) {
    const d = c.data;
    const wantDoor = leg === 'armed' ? '1' : null;
    if (d.anchorCommit !== anchor) bad.push(c.file + ': anchorCommit ' + String(d.anchorCommit).slice(0, 12) + ' != ' + String(anchor).slice(0, 12));
    if (String(d.policySha || '').slice(0, 12) !== POLICY_SHA12) bad.push(c.file + ': policySha ' + String(d.policySha));
    if (d.pinquadFlag !== '1') bad.push(c.file + ': pinquadFlag ' + JSON.stringify(d.pinquadFlag));
    if (d.dmgpinFlag !== '1') bad.push(c.file + ': dmgpinFlag ' + JSON.stringify(d.dmgpinFlag));
    if ((d.doorflee2Flag || null) !== wantDoor) bad.push(c.file + ': doorflee2Flag ' + JSON.stringify(d.doorflee2Flag) + ' want ' + JSON.stringify(wantDoor));
    if (!d.slotPresent || !d.pinPresent) bad.push(c.file + ': slotPresent/pinPresent ' + JSON.stringify(d.slotPresent) + '/' + JSON.stringify(d.pinPresent));
  }
  return { files: corpora.length, bad: bad, pass: bad.length === 0 };
}

// The frozen-bar judge. Returns { bars, pass } and prints nothing
// (callers print). M5/M6 are NOT computed here.
function judge(controlDir, armedDir, anchor) {
  const control = readCorpusDir(controlDir);
  const armed = readCorpusDir(armedDir);
  const cs = doorStats(control);
  const as = doorStats(armed);
  const ckr = wave4KillRate(control);
  const akr = wave4KillRate(armed);
  const cB2 = pinnedWave4Ally3(control);
  const aB2 = pinnedWave4Ally3(armed);
  const subC = substrateCheck(control, 'control', anchor);
  const subA = substrateCheck(armed, 'armed', anchor);
  const b1 = b1NonInferiority(as.fought, as.ally3Vid, cs.fought, cs.ally3Vid, 10);
  const f1 = {
    armedFlee: as.vFlee, controlFlee: cs.vFlee,
    armedFought: as.fought, controlFought: cs.fought,
    armedRate: as.fleeRate, controlRate: cs.fleeRate,
    rateDropPp: (as.fleeRate != null && cs.fleeRate != null) ? (cs.fleeRate - as.fleeRate) * 100 : null,
    pass: as.fleeRate != null && cs.fleeRate != null && as.vFlee <= 4 &&
      (cs.fleeRate - as.fleeRate) >= 0.20,
  };
  const bars = {
    F1: f1,
    P2: { armedFreshKills: as.killsFresh, controlFreshKills: cs.killsFresh, pass: as.killsFresh >= cs.killsFresh },
    P3: { armedDmgPerRound: as.dmgPerRound, controlDmgPerRound: cs.dmgPerRound,
      pass: as.dmgPerRound != null && cs.dmgPerRound != null && as.dmgPerRound >= 0.9 * cs.dmgPerRound },
    B1: b1,
    B2: { armedAlly3Dealt: aB2.total, armedAlly3DealtMax: aB2.max, armedPinnedWave4Rows: aB2.n,
      controlAlly3Dealt: cB2.total, controlAlly3DealtMax: cB2.max, controlPinnedWave4Rows: cB2.n,
      pass: aB2.total > 0 && aB2.max >= 10 },
    B3a: { armedRate: akr.rate, controlRate: ckr.rate, armedN: akr.n, controlN: ckr.n,
      armedK: akr.k, controlK: ckr.k,
      pass: akr.rate != null && ckr.rate != null && akr.rate >= ckr.rate - 0.02 },
    B4: { control: subC, armed: subA, pass: subC.pass && subA.pass },
  };
  const pass = bars.F1.pass && bars.P2.pass && bars.P3.pass && bars.B1.pass && bars.B2.pass && bars.B3a.pass && bars.B4.pass;
  return {
    control: cs, armed: as,
    controlKillRate: ckr, armedKillRate: akr,
    bars: bars, pass: pass,
  };
}

function selftest() {
  let passed = 0, failed = 0;
  function check(name, cond, extra) {
    if (cond) { passed++; console.log('PASS ' + name); }
    else { failed++; console.log('FAIL ' + name + (extra != null ? ' :: ' + JSON.stringify(extra) : '')); }
  }
  const ANCHOR = 'a'.repeat(40);
  function file(seed, leg, rows, extra) {
    const d = Object.assign({
      seed: seed, anchorCommit: ANCHOR, policySha: POLICY_SHA12 + 'deadbeef',
      pinquadFlag: '1', dmgpinFlag: '1', doorflee2Flag: leg === 'armed' ? '1' : null,
      slotPresent: true, pinPresent: true, instrumentErrors: [],
      v4encounters: rows,
    }, extra || {});
    return d;
  }
  function doorRow(o) {
    return Object.assign({
      day: 100, vid: 'h1', mid: 'algorithm', wave: 4, origin: 'expedition',
      allyFromStart: true, pinned: true, pinnedAllies: ['c1', 'c2', 'c3'],
      allyVids: ['c1', 'c2', 'c3'], allyVid: 'c1', ally2Vid: 'c2', ally3Vid: 'c3',
      ally3Dealt: 50, rounds: 3, outcome: 'vFlee', mDealt: 300, vTaken: 40,
      fleeHpFrac: 0.35, everHopeless: true, doorHold: 0,
      roundsDetail: [{ round: 1, mHpStart: 1000 }], flPreRoundDealt: 0,
      mHpStartRec: 1000, log: ['R1: h1 strikes for 40 (960 left)'],
    }, o || {});
  }
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'doorflee2-analyze-'));
  try {
    // GO case: control 8 flees / 11 fought, 2 fresh kills; armed 3
    // flees / 11 fought, 3 fresh kills, holds fired, damage held.
    const ctlRows = [];
    for (let i = 0; i < 8; i++) ctlRows.push(doorRow({ day: 90 + i, outcome: 'vFlee', doorHold: 0 }));
    ctlRows.push(doorRow({ day: 100, outcome: 'vKill', rounds: 5, mDealt: 1100, roundsDetail: [{ round: 1, mHpStart: 1050 }], flPreRoundDealt: 50, mHpStartRec: 1100, log: ['R1: h1 strikes for 40 (1060 left)', 'R5: c3 strikes for 60 (0 left)'] }));
    ctlRows.push(doorRow({ day: 101, outcome: 'vKill', rounds: 6, mDealt: 1000, roundsDetail: [{ round: 1, mHpStart: 950 }], flPreRoundDealt: 50, mHpStartRec: 1000, log: ['R1: h1 strikes for 40 (960 left)', 'R6: c3 strikes for 50 (0 left)'] }));
    ctlRows.push(doorRow({ day: 102, outcome: 'mFlee', rounds: 1, mDealt: 0, doorHold: 0, everHopeless: false }));
    const armRows = [];
    for (let i = 0; i < 3; i++) armRows.push(doorRow({ day: 90 + i, outcome: 'vFlee', doorHold: 1 }));
    armRows.push(doorRow({ day: 100, outcome: 'vKill', rounds: 5, mDealt: 1100, roundsDetail: [{ round: 1, mHpStart: 1050 }], flPreRoundDealt: 50, mHpStartRec: 1100, log: ['R1: h1 strikes for 40 (1060 left)', 'R5: c3 strikes for 60 (0 left)'], doorHold: 2 }));
    armRows.push(doorRow({ day: 101, outcome: 'vKill', rounds: 6, mDealt: 1000, roundsDetail: [{ round: 1, mHpStart: 950 }], flPreRoundDealt: 50, mHpStartRec: 1000, log: ['R1: h1 strikes for 40 (960 left)', 'R6: c3 strikes for 50 (0 left)'], doorHold: 1 }));
    armRows.push(doorRow({ day: 103, outcome: 'vKill', rounds: 4, mDealt: 900, roundsDetail: [{ round: 1, mHpStart: 850 }], flPreRoundDealt: 50, mHpStartRec: 900, log: ['R1: h1 strikes for 40 (860 left)', 'R4: c3 strikes for 55 (0 left)'], doorHold: 3 }));
    for (let i = 0; i < 5; i++) armRows.push(doorRow({ day: 110 + i, outcome: 'vFlee', doorHold: 0, everHopeless: false, fleeHpFrac: 0.2 }));
    // The armed set above is deliberately the NO-GO shape: 8/11
    // flees, same as control — F1 must fail on the rate drop.
    const cDir = path.join(tmp, 'ctl'), aDir = path.join(tmp, 'arm');
    fs.mkdirSync(cDir); fs.mkdirSync(aDir);
    fs.writeFileSync(path.join(cDir, 'c1.json'), JSON.stringify(file(1, 'control', ctlRows)));
    fs.writeFileSync(path.join(aDir, 'a1.json'), JSON.stringify(file(1, 'armed', armRows)));
    const j1 = judge(cDir, aDir, ANCHOR);
    check('§A synthetic NO-GO: armed 8/11 flees vs control 8/11 — F1 fails (no rate drop)',
      j1.bars.F1.pass === false && j1.control.fought === 11 && j1.armed.fought === 11, j1.bars.F1);
    check('§A synthetic: kills counted (control 2 fresh, armed 3 fresh) — P2 passes',
      j1.bars.P2.pass === true && j1.control.killsFresh === 2 && j1.armed.killsFresh === 3, j1.bars.P2);
    check('§A synthetic: doorHold sums read (control 0, armed 3+2+1+3=9)',
      j1.control.doorHold === 0 && j1.armed.doorHold === 9, { c: j1.control.doorHold, a: j1.armed.doorHold });
    check('§A synthetic: B4 substrate passes on clean files', j1.bars.B4.pass === true, j1.bars.B4);
    check('§A synthetic: B1 passes (ally3Vid 11/11 both legs)',
      j1.bars.B1.pass === true, j1.bars.B1);
    // GO case: armed flees cut to 3/11 with holds.
    const armGo = [];
    for (let i = 0; i < 3; i++) armGo.push(doorRow({ day: 90 + i, outcome: 'vFlee', doorHold: 1 }));
    armGo.push(doorRow({ day: 100, outcome: 'vKill', rounds: 5, mDealt: 1100, roundsDetail: [{ round: 1, mHpStart: 1050 }], flPreRoundDealt: 50, mHpStartRec: 1100, log: ['R1: h1 strikes for 40 (1060 left)', 'R5: c3 strikes for 60 (0 left)'], doorHold: 2 }));
    armGo.push(doorRow({ day: 101, outcome: 'vKill', rounds: 6, mDealt: 1000, roundsDetail: [{ round: 1, mHpStart: 950 }], flPreRoundDealt: 50, mHpStartRec: 1000, log: ['R1: h1 strikes for 40 (960 left)', 'R6: c3 strikes for 50 (0 left)'], doorHold: 1 }));
    armGo.push(doorRow({ day: 103, outcome: 'vKill', rounds: 4, mDealt: 900, roundsDetail: [{ round: 1, mHpStart: 850 }], flPreRoundDealt: 50, mHpStartRec: 900, log: ['R1: h1 strikes for 40 (860 left)', 'R4: c3 strikes for 55 (0 left)'], doorHold: 3 }));
    for (let i = 0; i < 5; i++) armGo.push(doorRow({ day: 110 + i, outcome: 'vKill', rounds: 4, mDealt: 950, roundsDetail: [{ round: 1, mHpStart: 900 }], flPreRoundDealt: 50, mHpStartRec: 950, log: ['R1: h1 strikes for 40 (910 left)', 'R4: c3 strikes for 55 (0 left)'], doorHold: 1 }));
    const aGoDir = path.join(tmp, 'armgo');
    fs.mkdirSync(aGoDir);
    fs.writeFileSync(path.join(aGoDir, 'a1.json'), JSON.stringify(file(1, 'armed', armGo)));
    const j2 = judge(cDir, aGoDir, ANCHOR);
    check('§B synthetic GO: armed 3/11 flees vs control 8/11 — F1 passes (count <= 4, drop 45pp)',
      j2.bars.F1.pass === true && j2.armed.vFlee === 3, j2.bars.F1);
    check('§B synthetic GO: all computed bars pass', j2.pass === true, j2.bars);
    // Kills-regression case: every armed door flees — 0 fresh kills.
    const armKill = armGo.map(function (r) {
      return Object.assign({}, r, { outcome: 'vFlee', doorHold: 0 });
    });
    const aKillDir = path.join(tmp, 'armkill');
    fs.mkdirSync(aKillDir);
    fs.writeFileSync(path.join(aKillDir, 'a1.json'), JSON.stringify(file(1, 'armed', armKill)));
    const j3 = judge(cDir, aKillDir, ANCHOR);
    check('§C kills regression: armed 0 fresh kills < control 2 — P2 fails',
      j3.bars.P2.pass === false && j3.armed.killsFresh === 0, j3.bars.P2);
    // Substrate case: armed file missing the doorflee2Flag.
    const badFile = file(1, 'armed', armGo);
    delete badFile.doorflee2Flag;
    const aBadDir = path.join(tmp, 'armbad');
    fs.mkdirSync(aBadDir);
    fs.writeFileSync(path.join(aBadDir, 'a1.json'), JSON.stringify(badFile));
    const j4 = judge(cDir, aBadDir, ANCHOR);
    check('§D substrate: armed file without doorflee2Flag — B4 fails and names the file',
      j4.bars.B4.pass === false && j4.bars.B4.armed.bad.length === 1 && /doorflee2Flag/.test(j4.bars.B4.armed.bad[0]), j4.bars.B4);
    // Anchor case: wrong expected anchor fails B4 on both legs.
    const j5 = judge(cDir, aGoDir, 'b'.repeat(40));
    check('§E anchor: wrong expected anchor — B4 fails on both legs',
      j5.bars.B4.pass === false && j5.bars.B4.control.bad.length > 0 && j5.bars.B4.armed.bad.length > 0, j5.bars.B4);
    // Non-door rows never enter the fought-doors denominator.
    const nonDoor = doorRow({ origin: 'world-tick', allyFromStart: false, pinned: false });
    const cNdDir = path.join(tmp, 'ctlnd');
    fs.mkdirSync(cNdDir);
    fs.writeFileSync(path.join(cNdDir, 'c1.json'), JSON.stringify(file(1, 'control', [nonDoor])));
    const j6 = judge(cNdDir, aGoDir, ANCHOR);
    check('§F non-door rows excluded: control with only a world-tick row has 0 fought doors',
      j6.control.fought === 0 && j6.bars.F1.pass === false, j6.control);
  } finally {
    try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}
  }
  console.log('analyze-doorflee2-b selftest: ' + passed + ' passed, ' + failed + ' failed');
  return failed === 0;
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.indexOf('--selftest') !== -1) {
    process.exit(selftest() ? 0 : 1);
  }
  let control = null, armed = null, anchor = null, asJson = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--control') control = args[++i];
    else if (args[i] === '--armed') armed = args[++i];
    else if (args[i] === '--anchor') anchor = args[++i];
    else if (args[i] === '--json') asJson = true;
  }
  if (!control || !armed || !anchor) {
    console.error('usage: node scripts/analyze-doorflee2-b.js --control <dir> --armed <dir> --anchor <40-hex> [--json] | --selftest');
    process.exit(2);
  }
  const result = judge(control, armed, anchor);
  if (asJson) console.log(JSON.stringify(result, null, 2));
  else {
    console.log('doorflee2 judge: ' + (result.pass ? 'PASS' : 'FAIL'));
    console.log('  control fought doors: ' + result.control.fought + ' (vFlee ' + result.control.vFlee + ', vKill ' + result.control.vKill + ', mFlee ' + result.control.mFlee + ', vDie ' + result.control.vDie + ')');
    console.log('  armed fought doors: ' + result.armed.fought + ' (vFlee ' + result.armed.vFlee + ', vKill ' + result.armed.vKill + ', mFlee ' + result.armed.mFlee + ', vDie ' + result.armed.vDie + ')');
    console.log('  F1 flee: armed ' + result.armed.vFlee + '/' + result.armed.fought + ' vs control ' + result.control.vFlee + '/' + result.control.fought +
      ' (drop ' + (result.bars.F1.rateDropPp == null ? 'null' : result.bars.F1.rateDropPp.toFixed(1)) + 'pp) -> ' + (result.bars.F1.pass ? 'PASS' : 'FAIL'));
    console.log('  P2 fresh kills: armed ' + result.armed.killsFresh + ' vs control ' + result.control.killsFresh + ' -> ' + (result.bars.P2.pass ? 'PASS' : 'FAIL'));
    console.log('  P3 dmg/round: armed ' + (result.armed.dmgPerRound == null ? 'null' : result.armed.dmgPerRound.toFixed(1)) +
      ' vs control ' + (result.control.dmgPerRound == null ? 'null' : result.control.dmgPerRound.toFixed(1)) + ' -> ' + (result.bars.P3.pass ? 'PASS' : 'FAIL'));
    console.log('  B1 ally3Vid rate: armed ' + (result.bars.B1.armedRate == null ? 'null' : result.bars.B1.armedRate.toFixed(3)) +
      ' vs control ' + (result.bars.B1.controlRate == null ? 'null' : result.bars.B1.controlRate.toFixed(3)) + ' -> ' + (result.bars.B1.pass ? 'PASS' : 'FAIL'));
    console.log('  B2 ally3Dealt (pinned w4+ subset): armed total ' + result.bars.B2.armedAlly3Dealt + ' (' + result.bars.B2.armedPinnedWave4Rows + ' rows), max ' + result.bars.B2.armedAlly3DealtMax + ' -> ' + (result.bars.B2.pass ? 'PASS' : 'FAIL'));
    console.log('  B3a kill conv: armed ' + (result.armedKillRate.rate == null ? 'null' : result.armedKillRate.rate.toFixed(3)) +
      ' (' + result.armedKillRate.k + '/' + result.armedKillRate.n + ') vs control ' +
      (result.controlKillRate.rate == null ? 'null' : result.controlKillRate.rate.toFixed(3)) +
      ' (' + result.controlKillRate.k + '/' + result.controlKillRate.n + ') -> ' + (result.bars.B3a.pass ? 'PASS' : 'FAIL'));
    console.log('  B4 substrate: control bad ' + result.bars.B4.control.bad.length + ', armed bad ' + result.bars.B4.armed.bad.length + ' -> ' + (result.bars.B4.pass ? 'PASS' : 'FAIL'));
    if (!result.bars.B4.pass) {
      result.bars.B4.control.bad.concat(result.bars.B4.armed.bad).forEach(function (b) { console.log('    B4: ' + b); });
    }
    console.log('  doorHold rounds: control ' + result.control.doorHold + ', armed ' + result.armed.doorHold +
      ' (fights with a hold: ' + result.armed.holdFights + '; everHopeless fights: control ' + result.control.everHopeless + ', armed ' + result.armed.everHopeless + ')');
  }
  process.exit(result.pass ? 0 : 1);
}

module.exports = { doorStats: doorStats, foughtDoors: foughtDoors, substrateCheck: substrateCheck, wave4KillRate: wave4KillRate, judge: judge, selftest: selftest };
