// analyze-hpgate-b.js — analyzer + frozen-bar judge, arm sim-hpgate-b
// (finding #2619: the HP-GATE — a pinned quad does not walk into a
// wave-4+ door with a member below 25 HP, the floor being one round of
// focused wave-4 damage; when the gate fires the party gives the
// monster room instead of fighting it fragile).
//
// The door definition and the freshness judges are REUSED from the
// shared analyzer (scripts/analyze-pinquaddoor-b.js) — isDoorFight,
// freshDoorKill, deriveDoorEntryHp, dealtBound, b1NonInferiority —
// never re-implemented here. This file adds only the hpgate
// judgments: the flee-rate primary (F1, repriced: RATE only, count
// secondary), the kill non-regression (P2), the damage guard (P3,
// repriced: TOTAL damage per door/fight, not per round), the carried
// B1/B2/B3a bars, the substrate check incl. hpgateFlag + hypofloorFlag
// (B4), the matched-pair conversion census (S2), the gate-fire census
// (S8: the agency-state hpgateFires counter, the direct evidence the
// gate fired) and the avoided-doors census (S9: control doors with no
// armed counterpart row — reported, never proof on its own, since
// trajectory divergence can also drop a row).
//
// Frozen bars (see evidence/2026-11-22/sim-hpgate-b-prereg.md):
//   F1 flee (PRIMARY, repriced): armed flee rate <= control flee rate
//      - 20pp, on fought doors. The flee COUNT is a secondary only.
//   P2 kills: armed FRESH door kills >= control fresh door kills.
//   P3 damage (repriced): armed TOTAL damage per fought door >= 0.9x
//      control (total dealt / fought doors — NOT per-round).
//   B1 pin delivery: b1NonInferiority (armed ally3Vid rate >= control
//      - 10pp AND >= 3 armed rows), on the fought-doors subset.
//   B2 ally3Dealt: armed total > 0 AND >= 1 armed fight with >= 10.
//   B3a kill conversion: armed corpus-wide vKill rate on wave-4+ >=
//      control - 2pp.
//   B4 substrate: every file carries anchorCommit == frozen base,
//      policySha 1884c8852d38, pinquadFlag '1', dmgpinFlag '1',
//      doorflee2Flag '1' AND hypofloorFlag '1' (BOTH legs — the control
//      is the hypofloor armed configuration), and hpgateFlag null
//      (control) / '1' (armed).
// M5 (balanced panel) and M6 (evidence file) are judged outside this
// file — the panel compare output and this evidence file carry them.
// S2 (conversion census) is REPORTED, not binding — it is the effect
// metric (flee→kill / flee→later-flee / avoided), not a pass/fail bar.
//
// Usage:
//   node scripts/analyze-hpgate-b.js --control <dir> --armed <dir> --anchor <40-hex> [--json]
//   node scripts/analyze-hpgate-b.js --selftest
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
    dealt: 0, rounds: 0, dmgPerRound: null, dmgPerDoor: null,
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
  stats.dmgPerDoor = stats.fought > 0 ? stats.dealt / stats.fought : null;
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

// S2 — the conversion census (REPORTED, not binding): matched-seed door
// pairs (same seed + day + monster). For each control vFlee door with a
// same-key armed row: armed vKill = a conversion; armed vFlee at MORE
// rounds = a later flee; armed identical outcome+rounds = no change;
// anything else = other. The conversion count is the lever's bite;
// hold rounds are not.
function conversions(controlCorpora, armedCorpora) {
  const ctl = foughtDoors(controlCorpora);
  const arm = foughtDoors(armedCorpora);
  const armByKey = {};
  for (const d of arm) armByKey[d.seed + '|' + d.row.day + '|' + d.row.mid] = d.row;
  const out = { pairs: 0, conversions: 0, laterFlees: 0, noChange: 0, other: 0, list: [] };
  for (const d of ctl) {
    if (d.row.outcome !== 'vFlee') continue;
    const a = armByKey[d.seed + '|' + d.row.day + '|' + d.row.mid];
    if (!a) continue;
    out.pairs++;
    let kind = null;
    if (a.outcome === 'vKill') kind = 'conversion';
    else if (a.outcome === 'vFlee' && (a.rounds | 0) > (d.row.rounds | 0)) kind = 'laterFlee';
    else if (a.outcome === d.row.outcome && (a.rounds | 0) === (d.row.rounds | 0)) kind = 'noChange';
    else kind = 'other';
    if (kind === 'conversion') out.conversions++;
    else if (kind === 'laterFlee') out.laterFlees++;
    else if (kind === 'noChange') out.noChange++;
    else out.other++;
    out.list.push({ seed: d.seed, day: d.row.day, mid: d.row.mid, kind: kind,
      controlRounds: d.row.rounds, armedRounds: a.rounds,
      controlOutcome: d.row.outcome, armedOutcome: a.outcome });
  }
  return out;
}

function substrateCheck(corpora, leg, anchor) {
  const bad = [];
  for (const c of corpora) {
    const d = c.data;
    const wantHpgate = leg === 'armed' ? '1' : null;
    if (d.anchorCommit !== anchor) bad.push(c.file + ': anchorCommit ' + String(d.anchorCommit).slice(0, 12) + ' != ' + String(anchor).slice(0, 12));
    if (String(d.policySha || '').slice(0, 12) !== POLICY_SHA12) bad.push(c.file + ': policySha ' + String(d.policySha));
    if (d.pinquadFlag !== '1') bad.push(c.file + ': pinquadFlag ' + JSON.stringify(d.pinquadFlag));
    if (d.dmgpinFlag !== '1') bad.push(c.file + ': dmgpinFlag ' + JSON.stringify(d.dmgpinFlag));
    if (d.doorflee2Flag !== '1') bad.push(c.file + ': doorflee2Flag ' + JSON.stringify(d.doorflee2Flag) + ' want "1" (both legs carry the hold)');
    if (d.hypofloorFlag !== '1') bad.push(c.file + ': hypofloorFlag ' + JSON.stringify(d.hypofloorFlag) + ' want "1" (both legs carry the floor — the control IS the hypofloor armed configuration)');
    if ((d.hpgateFlag || null) !== wantHpgate) bad.push(c.file + ': hpgateFlag ' + JSON.stringify(d.hpgateFlag) + ' want ' + JSON.stringify(wantHpgate));
    if (typeof d.hpgateFires !== 'number') bad.push(c.file + ': hpgateFires ' + JSON.stringify(d.hpgateFires) + ' want a number (driver stamps the agency-state counter)');
    if (!d.slotPresent || !d.pinPresent) bad.push(c.file + ': slotPresent/pinPresent ' + JSON.stringify(d.slotPresent) + '/' + JSON.stringify(d.pinPresent));
  }
  return { files: corpora.length, bad: bad, pass: bad.length === 0 };
}

// S8 — the gate-fire census (REPORTED, the direct evidence): the
// agency-state hpgateFires counter summed over the leg's files.
// S9 — the avoided-doors census (REPORTED, never proof on its own):
// control fought doors with NO armed row on the same seed + day +
// monster. A missing armed row is consistent with a gate avoid, but
// trajectory divergence can also drop a row — the counter (S8) is
// the direct evidence, this census only names the candidates.
function gateFires(corpora) {
  let n = 0;
  for (const c of corpora) n += (c.data.hpgateFires | 0);
  return n;
}
function avoidedDoors(controlCorpora, armedCorpora) {
  const ctl = foughtDoors(controlCorpora);
  const arm = foughtDoors(armedCorpora);
  const armKeys = {};
  for (const d of arm) armKeys[d.seed + '|' + d.row.day + '|' + d.row.mid] = true;
  const out = { n: 0, list: [] };
  for (const d of ctl) {
    if (!armKeys[d.seed + '|' + d.row.day + '|' + d.row.mid]) {
      out.n++;
      out.list.push({ seed: d.seed, day: d.row.day, mid: d.row.mid, controlOutcome: d.row.outcome, controlRounds: d.row.rounds });
    }
  }
  return out;
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
  const conv = conversions(control, armed);
  const b1 = b1NonInferiority(as.fought, as.ally3Vid, cs.fought, cs.ally3Vid, 10);
  const f1 = {
    armedFlee: as.vFlee, controlFlee: cs.vFlee,
    armedFought: as.fought, controlFought: cs.fought,
    armedRate: as.fleeRate, controlRate: cs.fleeRate,
    rateDropPp: (as.fleeRate != null && cs.fleeRate != null) ? (cs.fleeRate - as.fleeRate) * 100 : null,
    // REPRICED (doorflee2 §8, adopted): the flee RATE is the bar; the
    // count is reported only and never passes or fails F1.
    pass: as.fleeRate != null && cs.fleeRate != null &&
      (cs.fleeRate - as.fleeRate) >= 0.20,
  };
  const bars = {
    F1: f1,
    P2: { armedFreshKills: as.killsFresh, controlFreshKills: cs.killsFresh, pass: as.killsFresh >= cs.killsFresh },
    // REPRICED (doorflee2 §8, adopted): TOTAL damage per fought door,
    // not per round — longer held fights dilute per-round damage by
    // construction.
    P3: { armedDmgPerDoor: as.dmgPerDoor, controlDmgPerDoor: cs.dmgPerDoor,
      armedDmgPerRound: as.dmgPerRound, controlDmgPerRound: cs.dmgPerRound,
      pass: as.dmgPerDoor != null && cs.dmgPerDoor != null && as.dmgPerDoor >= 0.9 * cs.dmgPerDoor },
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
    conversions: conv,
    controlGateFires: gateFires(control),
    armedGateFires: gateFires(armed),
    avoided: avoidedDoors(control, armed),
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
      pinquadFlag: '1', dmgpinFlag: '1', doorflee2Flag: '1',
      hypofloorFlag: '1',
      hpgateFlag: leg === 'armed' ? '1' : null,
      hpgateFires: leg === 'armed' ? 2 : 0,
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
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'hpgate-analyze-'));
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
    check('§A synthetic: B4 substrate passes on clean files (hpgateFlag null/1, hypofloorFlag 1 both legs, doorflee2Flag 1 both legs)', j1.bars.B4.pass === true, j1.bars.B4);
    check('§A synthetic: B1 passes (ally3Vid 11/11 both legs)',
      j1.bars.B1.pass === true, j1.bars.B1);
    check('§A synthetic: P3 priced per door (armed dealt/door vs control) — passes here',
      j1.bars.P3.pass === true && j1.bars.P3.armedDmgPerDoor != null && j1.bars.P3.controlDmgPerDoor != null, j1.bars.P3);
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
    check('§B synthetic GO: armed 3/11 flees vs control 8/11 — F1 passes (drop 45pp)',
      j2.bars.F1.pass === true && j2.armed.vFlee === 3, j2.bars.F1);
    check('§B synthetic GO: all computed bars pass', j2.pass === true, j2.bars);
    // Count-high rate-pass case (the repriced F1's signature): the
    // armed leg fights MORE doors (16 vs 11) and flees 8 — the old
    // count bar would fail it, the rate bar passes it (50% vs 72.7%,
    // a 22.7pp drop).
    const armWide = [];
    for (let i = 0; i < 8; i++) armWide.push(doorRow({ day: 90 + i, outcome: 'vFlee', doorHold: 0, everHopeless: true }));
    for (let i = 0; i < 8; i++) armWide.push(doorRow({ day: 100 + i, outcome: 'vKill', rounds: 4, mDealt: 950, roundsDetail: [{ round: 1, mHpStart: 900 }], flPreRoundDealt: 50, mHpStartRec: 950, log: ['R1: h1 strikes for 40 (910 left)', 'R4: c3 strikes for 55 (0 left)'], doorHold: 0, everHopeless: false }));
    const aWideDir = path.join(tmp, 'armwide');
    fs.mkdirSync(aWideDir);
    fs.writeFileSync(path.join(aWideDir, 'a1.json'), JSON.stringify(file(1, 'armed', armWide)));
    const j2b = judge(cDir, aWideDir, ANCHOR);
    check('§B2 repriced F1: armed 8 flees on 16 doors vs control 8/11 — rate drops 22.7pp, F1 PASSES despite count 8',
      j2b.bars.F1.pass === true && j2b.armed.vFlee === 8 && j2b.armed.fought === 16, j2b.bars.F1);
    check('§B2 repriced F1: the wide GO case passes all computed bars', j2b.pass === true, j2b.bars);
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
    // P3 per-door regression case: armed fights the same doors but
    // deals little per door (per-round would look fine on short fights).
    const armWeak = armGo.map(function (r) {
      return Object.assign({}, r, { mDealt: 100, rounds: 1 });
    });
    const aWeakDir = path.join(tmp, 'armweak');
    fs.mkdirSync(aWeakDir);
    fs.writeFileSync(path.join(aWeakDir, 'a1.json'), JSON.stringify(file(1, 'armed', armWeak)));
    const j3b = judge(cDir, aWeakDir, ANCHOR);
    check('§C2 damage regression: armed 100/door vs control ~409/door — P3 fails',
      j3b.bars.P3.pass === false && j3b.armed.dmgPerDoor === 100, j3b.bars.P3);
    // Substrate case: armed file missing the hpgateFlag.
    const badFile = file(1, 'armed', armGo);
    delete badFile.hpgateFlag;
    const aBadDir = path.join(tmp, 'armbad');
    fs.mkdirSync(aBadDir);
    fs.writeFileSync(path.join(aBadDir, 'a1.json'), JSON.stringify(badFile));
    const j4 = judge(cDir, aBadDir, ANCHOR);
    check('§D substrate: armed file without hpgateFlag — B4 fails and names the file',
      j4.bars.B4.pass === false && j4.bars.B4.armed.bad.length === 1 && /hpgateFlag/.test(j4.bars.B4.armed.bad[0]), j4.bars.B4);
    // Substrate case: control file missing the hypofloorFlag (both
    // legs must carry the floor — the control IS the hypofloor armed
    // configuration).
    const badHypo = file(1, 'control', ctlRows);
    delete badHypo.hypofloorFlag;
    const cHypoDir = path.join(tmp, 'ctlhypo');
    fs.mkdirSync(cHypoDir);
    fs.writeFileSync(path.join(cHypoDir, 'c1.json'), JSON.stringify(badHypo));
    const j4c = judge(cHypoDir, aGoDir, ANCHOR);
    check('§D3 substrate: control file without hypofloorFlag — B4 fails and names the file',
      j4c.bars.B4.pass === false && j4c.bars.B4.control.bad.length === 1 && /hypofloorFlag/.test(j4c.bars.B4.control.bad[0]), j4c.bars.B4);
    // Gate-fire census: the synthetic files carry hpgateFires 2 on
    // the armed leg, 0 on control — the judge sums them.
    check('§H gate fires: armed leg sums hpgateFires (2), control 0',
      j2.armedGateFires === 2 && j2.controlGateFires === 0, { a: j2.armedGateFires, c: j2.controlGateFires });
    // Avoided-doors census: the §A armed set fights days 90-92,
    // 100, 101, 103, 110-114 while the control fights 90-97, 100,
    // 101, 102 — the control rows with no armed counterpart are the
    // five day-93..97 flees plus the day-102 mFlee (6 rows, named).
    check('§H2 avoided doors: control rows with no armed counterpart are counted and named',
      j1.avoided.n === 6 && j1.avoided.list.some(function (x) { return x.day === 93 && x.mid === 'algorithm' && x.controlOutcome === 'vFlee'; }), j1.avoided);
    // Substrate case: control file missing the doorflee2Flag (both
    // legs must carry the hold — the control IS the doorflee2 armed
    // configuration).
    const badCtl = file(1, 'control', ctlRows);
    delete badCtl.doorflee2Flag;
    const cBadDir = path.join(tmp, 'ctlbad');
    fs.mkdirSync(cBadDir);
    fs.writeFileSync(path.join(cBadDir, 'c1.json'), JSON.stringify(badCtl));
    const j4b = judge(cBadDir, aGoDir, ANCHOR);
    check('§D2 substrate: control file without doorflee2Flag — B4 fails and names the file',
      j4b.bars.B4.pass === false && j4b.bars.B4.control.bad.length === 1 && /doorflee2Flag/.test(j4b.bars.B4.control.bad[0]), j4b.bars.B4);
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
    // Conversion census: one conversion, one later flee, one
    // no-change, one control kill (not counted — only control flees
    // pair up).
    const convCtl = [
      doorRow({ day: 90, mid: 'algorithm', outcome: 'vFlee', rounds: 2 }),
      doorRow({ day: 91, mid: 'eater', outcome: 'vFlee', rounds: 3 }),
      doorRow({ day: 92, mid: 'audit', outcome: 'vFlee', rounds: 2 }),
      doorRow({ day: 93, mid: 'strike', outcome: 'vKill', rounds: 5, mDealt: 1100, roundsDetail: [{ round: 1, mHpStart: 1050 }], flPreRoundDealt: 50, mHpStartRec: 1100, log: ['R1: h1 strikes for 40 (1060 left)', 'R5: c3 strikes for 60 (0 left)'] }),
    ];
    const convArm = [
      doorRow({ day: 90, mid: 'algorithm', outcome: 'vKill', rounds: 5, mDealt: 1100, roundsDetail: [{ round: 1, mHpStart: 1050 }], flPreRoundDealt: 50, mHpStartRec: 1100, log: ['R1: h1 strikes for 40 (1060 left)', 'R5: c3 strikes for 60 (0 left)'] }),
      doorRow({ day: 91, mid: 'eater', outcome: 'vFlee', rounds: 5 }),
      doorRow({ day: 92, mid: 'audit', outcome: 'vFlee', rounds: 2 }),
      doorRow({ day: 93, mid: 'strike', outcome: 'vKill', rounds: 5, mDealt: 1100, roundsDetail: [{ round: 1, mHpStart: 1050 }], flPreRoundDealt: 50, mHpStartRec: 1100, log: ['R1: h1 strikes for 40 (1060 left)', 'R5: c3 strikes for 60 (0 left)'] }),
    ];
    const cCvDir = path.join(tmp, 'ctlcv'), aCvDir = path.join(tmp, 'armcv');
    fs.mkdirSync(cCvDir); fs.mkdirSync(aCvDir);
    fs.writeFileSync(path.join(cCvDir, 'c1.json'), JSON.stringify(file(1, 'control', convCtl)));
    fs.writeFileSync(path.join(aCvDir, 'a1.json'), JSON.stringify(file(1, 'armed', convArm)));
    const j7 = judge(cCvDir, aCvDir, ANCHOR);
    check('§G conversions: 1 conversion + 1 later flee + 1 no-change over 3 control flees',
      j7.conversions.pairs === 3 && j7.conversions.conversions === 1 && j7.conversions.laterFlees === 1 && j7.conversions.noChange === 1, j7.conversions);
    check('§G conversions: the conversion is named (seed/day/mid/kind)',
      j7.conversions.list.some(function (x) { return x.kind === 'conversion' && x.day === 90 && x.mid === 'algorithm'; }), j7.conversions.list);
  } finally {
    try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}
  }
  console.log('analyze-hpgate-b selftest: ' + passed + ' passed, ' + failed + ' failed');
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
    console.error('usage: node scripts/analyze-hpgate-b.js --control <dir> --armed <dir> --anchor <40-hex> [--json] | --selftest');
    process.exit(2);
  }
  const result = judge(control, armed, anchor);
  if (asJson) console.log(JSON.stringify(result, null, 2));
  else {
    console.log('hpgate judge: ' + (result.pass ? 'PASS' : 'FAIL'));
    console.log('  control fought doors: ' + result.control.fought + ' (vFlee ' + result.control.vFlee + ', vKill ' + result.control.vKill + ', mFlee ' + result.control.mFlee + ', vDie ' + result.control.vDie + ')');
    console.log('  armed fought doors: ' + result.armed.fought + ' (vFlee ' + result.armed.vFlee + ', vKill ' + result.armed.vKill + ', mFlee ' + result.armed.mFlee + ', vDie ' + result.armed.vDie + ')');
    console.log('  F1 flee rate (PRIMARY): armed ' + result.armed.vFlee + '/' + result.armed.fought + ' vs control ' + result.control.vFlee + '/' + result.control.fought +
      ' (drop ' + (result.bars.F1.rateDropPp == null ? 'null' : result.bars.F1.rateDropPp.toFixed(1)) + 'pp; count secondary) -> ' + (result.bars.F1.pass ? 'PASS' : 'FAIL'));
    console.log('  P2 fresh kills: armed ' + result.armed.killsFresh + ' vs control ' + result.control.killsFresh + ' -> ' + (result.bars.P2.pass ? 'PASS' : 'FAIL'));
    console.log('  P3 dmg/door: armed ' + (result.armed.dmgPerDoor == null ? 'null' : result.armed.dmgPerDoor.toFixed(1)) +
      ' vs control ' + (result.control.dmgPerDoor == null ? 'null' : result.control.dmgPerDoor.toFixed(1)) + ' (per-round: armed ' +
      (result.armed.dmgPerRound == null ? 'null' : result.armed.dmgPerRound.toFixed(1)) + ' vs control ' +
      (result.control.dmgPerRound == null ? 'null' : result.control.dmgPerRound.toFixed(1)) + ') -> ' + (result.bars.P3.pass ? 'PASS' : 'FAIL'));
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
    console.log('  gate fires (S8, direct): control ' + result.controlGateFires + ', armed ' + result.armedGateFires);
    console.log('  avoided doors (S9, reported): ' + result.avoided.n + ' control doors with no armed counterpart' +
      (result.avoided.n > 0 ? ' — ' + result.avoided.list.map(function (x) { return x.seed + ' d' + x.day + ' ' + x.mid + ' (' + x.controlOutcome + ')'; }).join(', ') : ''));
    console.log('  conversions (S2, reported): ' + result.conversions.pairs + ' matched control flees -> ' +
      result.conversions.conversions + ' kills, ' + result.conversions.laterFlees + ' later flees, ' +
      result.conversions.noChange + ' no-change, ' + result.conversions.other + ' other');
  }
  process.exit(result.pass ? 0 : 1);
}

module.exports = { doorStats: doorStats, foughtDoors: foughtDoors, substrateCheck: substrateCheck, wave4KillRate: wave4KillRate, conversions: conversions, gateFires: gateFires, avoidedDoors: avoidedDoors, judge: judge, selftest: selftest };
