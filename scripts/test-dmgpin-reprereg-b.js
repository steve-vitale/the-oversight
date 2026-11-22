// test-dmgpin-reprereg-b.js — proof test, arm sim-dmgpin-report-b
// (findings #2605/#2619: DMGPIN re-judged under RE-REGISTERED bars).
// ADAPTED from the reprereg arm's copy (sim-dmgpin-reprereg-b): §0
// re-pointed at THIS arm's frozen prereg
// (evidence/2026-11-21/sim-dmgpin-report-b-prereg.md — it names the
// re-registered bars + the scout bands 106809–106832) and §1/§2/§5
// read the two 106722 fixture files
// (scripts/fixtures/dmgpin-b-s106722-{control,armed}.json), because
// the reprereg test as written reads
// evidence/2026-11-21/perseed-dmgpin-b-*/, which are NOT on master
// (only the reprereg corpora were cherry-picked). §3/§4 are
// synthetic/arithmetic and unchanged.
// The 0330Z pilot went NO-GO kind METRIC-BROKEN: P1 priced freshness
// on mHpStart, which the recorder nulls on EVERY vKill row by design,
// and B1's absolute 50% sat above the only true PIN-only control rate
// (46.7%). This test proves the re-registered computation BEFORE any
// judged leg on the fresh band:
//
// WHAT IT PROVES (observable effect, not just assertions):
//   §0 the frozen prereg exists and names the re-registered bars
//     (roundsDetail-derived P1, B1 non-inferiority) + the fresh band.
//   §1 the 106722 fixture kill (armed d115 network_note, real corpus
//     row): derived entry HP 1,275 = mHpStartRec = the parallel
//     control fight's recorded mHpStart; dealt bound 1,253 (final
//     blow 48); fresh by the new judge; mHpStart itself null.
//   §2 the control door kill (d117 congregation, real corpus row):
//     derived 974, fresh, bound inside [500, derived].
//   §3 synthetic rows: a ground-down kill fails P1, a fresh kill
//     passes, a kill without roundsDetail falls back to the dealt
//     bound (pass AND fail cases), a kill with neither derivation is
//     unjudgeable (never guessed), a non-door kill and a fled door
//     are not P1 candidates.
//   §4 B1 arithmetic reproduces: pooled PIN-armed rate 23/39,
//     dmgpin control 7/15, non-inferiority passes the dmgpin band
//     (41.7% vs 36.7% floor) where the old absolute 50% failed, and
//     a 2pp margin would still fail — the 10pp margin is load-bearing.
//   §5 the metric-broken finding, reproduced on real data: EVERY
//     vKill row in the dmgpin corpora has mHpStart null AND
//     mHpStartRec present; both door kills are fresh by the new judge.
// Usage: node scripts/test-dmgpin-reprereg-b.js
// Exit 0 = all checks pass. Reads corpora only; writes nothing.
'use strict';
const path = require('path');
const fs = require('fs');
const REPO = path.join(__dirname, '..');
const analyzer = require(path.join(REPO, 'scripts', 'analyze-pinquaddoor-b.js'));

let passed = 0, failed = 0;
function check(name, cond, extra) {
  if (cond) { passed++; console.log('PASS ' + name); }
  else { failed++; console.log('FAIL ' + name + (extra != null ? ' :: ' + JSON.stringify(extra) : '')); }
}
function approx(a, b, eps) { return Math.abs(a - b) < (eps || 0.001); }
function loadCorpus(rel) {
  return JSON.parse(fs.readFileSync(path.join(REPO, rel), 'utf8'));
}
function doorKillRow(data) {
  return (data.v4encounters || []).find(function (r) {
    return r.outcome === 'vKill' && r.origin === 'expedition' && r.allyFromStart && r.pinned && (r.wave | 0) >= 4;
  });
}

(function section0() {
  check('§0 analyzer exports the re-registered computation (isDoorFight/deriveDoorEntryHp/finalBlowFromLog/dealtBound/freshDoorKill/b1NonInferiority)',
    typeof analyzer.isDoorFight === 'function' && typeof analyzer.deriveDoorEntryHp === 'function' &&
    typeof analyzer.finalBlowFromLog === 'function' && typeof analyzer.dealtBound === 'function' &&
    typeof analyzer.freshDoorKill === 'function' && typeof analyzer.b1NonInferiority === 'function');
  const prereg = fs.readFileSync(path.join(REPO, 'evidence', '2026-11-21', 'sim-dmgpin-report-b-prereg.md'), 'utf8');
  check('§0 frozen prereg names the re-registered bars (roundsDetail-derived P1, B1 non-inferiority -10pp) + scout bands 106809–106832',
    /FROZEN/.test(prereg) && /roundsDetail\[0\]\.mHpStart \+ flPreRoundDealt/.test(prereg) &&
    /non-inferiority/.test(prereg) && /106809–106832/.test(prereg) && /NEVER on `mHpStart`/.test(prereg));
})();

(function section1() {
  const data = loadCorpus('scripts/fixtures/dmgpin-b-s106722-armed.json');
  const kill = doorKillRow(data);
  check('§1 fixture kill found (106722 d115 network_note, wave 5, 5 rounds, 1,301 dealt)',
    !!kill && kill.day === 115 && kill.mid === 'network_note' && kill.wave === 5 && kill.rounds === 5 && kill.mDealt === 1301, kill && { day: kill.day, mid: kill.mid, rounds: kill.rounds, mDealt: kill.mDealt });
  check('§1 isDoorFight true (expedition-origin, allyFromStart, pinned, wave >= 4)',
    analyzer.isDoorFight(kill) === true);
  check('§1 derived entry HP is 1,275 (R1 mHpStart 1,240 + flPreRoundDealt 35)',
    analyzer.deriveDoorEntryHp(kill) === 1275, analyzer.deriveDoorEntryHp(kill));
  check('§1 final blow from the log is 48 (Siobhan\'s last strike)',
    analyzer.finalBlowFromLog(kill) === 48, analyzer.finalBlowFromLog(kill));
  check('§1 dealt bound is 1,253 (1,301 - 48) — a lower bound, below the derived 1,275',
    analyzer.dealtBound(kill) === 1253, analyzer.dealtBound(kill));
  const j = analyzer.freshDoorKill(kill, 500);
  check('§1 fresh by the new judge (method roundsDetail, entryHp 1,275 >= 500)',
    j.fresh === true && j.method === 'roundsDetail' && j.entryHp === 1275, j);
  check('§1 cross-checks agree (boundOk: derived >= bound; recAgrees: mHpStartRec 1,275 == derived)',
    j.boundOk === true && j.recAgrees === true && j.mHpStartRec === 1275, j);
  check('§1 the broken field is null on the fixture (mHpStart null on a vKill row — why the old P1 could never pass)',
    kill.mHpStart === null, kill.mHpStart);
  check('§1 the old frozen P1 would still fail this row (mHpStart >= 500 is false on null)',
    !(typeof kill.mHpStart === 'number' && kill.mHpStart >= 500));
})();

(function section2() {
  const data = loadCorpus('scripts/fixtures/dmgpin-b-s106722-control.json');
  const kill = doorKillRow(data);
  check('§2 control door kill found (106722 d117 congregation, 8 rounds, 985 dealt)',
    !!kill && kill.day === 117 && kill.mid === 'congregation' && kill.rounds === 8 && kill.mDealt === 985, kill && { day: kill.day, mid: kill.mid, rounds: kill.rounds, mDealt: kill.mDealt });
  check('§2 derived entry HP is 974 (R1 mHpStart 912 + flPreRoundDealt 62)',
    analyzer.deriveDoorEntryHp(kill) === 974, analyzer.deriveDoorEntryHp(kill));
  const j = analyzer.freshDoorKill(kill, 500);
  check('§2 fresh by the new judge (method roundsDetail)',
    j.fresh === true && j.method === 'roundsDetail' && j.entryHp === 974, j);
  check('§2 dealt bound sits inside [500, derived] and mHpStartRec agrees (974)',
    j.dealtBound != null && j.dealtBound >= 500 && j.dealtBound <= j.entryHp && j.boundOk === true && j.recAgrees === true && j.mHpStartRec === 974, j);
})();

(function section3() {
  const doorBase = { day: 120, vid: 'h1', mid: 'eater', wave: 4, origin: 'expedition', outcome: 'vKill',
    vKill: true, allyVids: ['c1', 'c2', 'c3'], allyVid: 'c1', ally2Vid: 'c2', ally3Vid: 'c3',
    ally3Dealt: 45, allyFromStart: true, pinned: true, pinnedAllies: ['c1', 'c2', 'c3'], log: [] };
  // Ground-down kill: entry HP 12 — a cleanup, not a lever kill.
  const ground = Object.assign({}, doorBase, { mDealt: 500, flPreRoundDealt: 2,
    roundsDetail: [{ round: 1, mHpStart: 10, mHpEnd: 0, dealt: 10 }],
    log: ['R1: A strikes for 12 (0 left)'] });
  const gj = analyzer.freshDoorKill(ground, 500);
  check('§3 ground-down kill fails P1 (derived 12 < 500; the floor still bites)',
    gj.fresh === false && gj.entryHp === 12 && gj.method === 'roundsDetail', gj);
  // Fresh synthetic kill: entry HP 600.
  const fresh = Object.assign({}, doorBase, { mDealt: 640, flPreRoundDealt: 20, mHpStartRec: 600,
    roundsDetail: [{ round: 1, mHpStart: 580, mHpEnd: 0, dealt: 580 }],
    log: ['R1: A strikes for 40 (0 left)'] });
  const fj = analyzer.freshDoorKill(fresh, 500);
  check('§3 fresh synthetic kill passes P1 (derived 600, boundOk, recAgrees)',
    fj.fresh === true && fj.method === 'roundsDetail' && fj.entryHp === 600 && fj.boundOk === true && fj.recAgrees === true, fj);
  // No roundsDetail: the dealt bound alone judges.
  const boundOnly = Object.assign({}, doorBase, { mDealt: 600,
    log: ['R1: A strikes for 50 (0 left)'] });
  const bj = analyzer.freshDoorKill(boundOnly, 500);
  check('§3 no-roundsDetail kill falls back to the dealt bound and passes (bound 550 >= 500)',
    bj.fresh === true && bj.method === 'dealt-bound-only' && bj.dealtBound === 550, bj);
  const boundOnlyThin = Object.assign({}, doorBase, { mDealt: 300,
    log: ['R1: A strikes for 50 (0 left)'] });
  const bt = analyzer.freshDoorKill(boundOnlyThin, 500);
  check('§3 no-roundsDetail thin kill fails on the bound alone (bound 250 < 500)',
    bt.fresh === false && bt.method === 'dealt-bound-only' && bt.dealtBound === 250, bt);
  // Neither derivation: unjudgeable, never guessed.
  const noDeriv = Object.assign({}, doorBase, { log: [] });
  const nj = analyzer.freshDoorKill(noDeriv, 500);
  check('§3 kill with neither derivation is unjudgeable and counts as not fresh',
    nj.fresh === false && nj.method === 'unjudgeable', nj);
  // Not a door kill at all.
  const wild = Object.assign({}, doorBase, { origin: 'wild', mDealt: 900,
    roundsDetail: [{ round: 1, mHpStart: 880, mHpEnd: 0, dealt: 880 }],
    log: ['R1: A strikes for 20 (0 left)'] });
  check('§3 non-door kill (origin wild) is not a P1 candidate',
    analyzer.freshDoorKill(wild, 500).method === 'not-a-door-kill' && analyzer.freshDoorKill(wild, 500).fresh === false);
  const fled = Object.assign({}, doorBase, { outcome: 'vFlee', mDealt: 900,
    roundsDetail: [{ round: 1, mHpStart: 880, mHpEnd: 0, dealt: 880 }],
    log: ['R1: A strikes for 20 (860 left)'] });
  check('§3 fled door fight is not a P1 candidate (outcome != vKill)',
    analyzer.freshDoorKill(fled, 500).method === 'not-a-door-kill' && analyzer.freshDoorKill(fled, 500).fresh === false);
})();

(function section4() {
  // Pooled PIN-armed fought-subset rate: wide 15/22 + reprereg 3/5 +
  // dmgpin armed 5/12 = 23/39 = 59.0%.
  const pooled = 23 / 39;
  check('§4 pooled PIN-armed fought-subset rate reproduces (23/39 = 59.0%)',
    approx(pooled, 0.5897));
  // The only PIN-only control rate in the program: dmgpin 7/15.
  const ctl = 7 / 15;
  check('§4 dmgpin PIN-only control rate reproduces (7/15 = 46.7%)',
    approx(ctl, 0.4667));
  const ni = analyzer.b1NonInferiority(12, 5, 15, 7, 10);
  check('§4 non-inferiority PASSES the dmgpin band (armed 41.7% vs floor 36.7%, 5 rows >= 3)',
    ni.pass === true && approx(ni.armedRate, 5 / 12) && approx(ni.controlRate, 7 / 15) && approx(ni.floorRate, 7 / 15 - 0.10) && ni.armedRows === 5, ni);
  check('§4 the old absolute 50% bar FAILS the same armed leg (5/12 = 41.7% < 50% — the re-registration changes the verdict)',
    (5 / 12) < 0.5);
  const ni2 = analyzer.b1NonInferiority(12, 5, 15, 7, 2);
  check('§4 a 2pp margin would still FAIL the dmgpin band (41.7% < 44.7% — the 10pp margin is load-bearing at n=12-15)',
    ni2.pass === false && approx(ni2.floorRate, 7 / 15 - 0.02), ni2);
})();

(function section5() {
  // Scan the two 106722 fixture files (the reprereg test scanned the
  // full dmgpin corpora; those dirs are NOT on master, so this arm
  // reads the byte-identical fixture copies instead — the
  // metric-broken finding, reproduced on the same real rows).
  let vKillRows = 0, nullStart = 0, withRec = 0, doorKills = 0, doorFresh = 0;
  ['scripts/fixtures/dmgpin-b-s106722-control.json', 'scripts/fixtures/dmgpin-b-s106722-armed.json'].forEach(function (rel) {
    const d = JSON.parse(fs.readFileSync(path.join(REPO, rel), 'utf8'));
    (d.v4encounters || []).forEach(function (r) {
      if (r.outcome !== 'vKill') return;
      vKillRows++;
      if (r.mHpStart === null || r.mHpStart === undefined) nullStart++;
      if (typeof r.mHpStartRec === 'number') withRec++;
      if (analyzer.isDoorFight(r)) {
        doorKills++;
        if (analyzer.freshDoorKill(r, 500).fresh) doorFresh++;
      }
    });
  });
  check('§5 every vKill row in the 106722 fixtures has mHpStart null (' + vKillRows + ' rows — the old P1 could never pass)',
    vKillRows > 0 && nullStart === vKillRows, { vKillRows: vKillRows, nullStart: nullStart });
  check('§5 every vKill row carries mHpStartRec (the diagnostic the cross-check reads)',
    vKillRows > 0 && withRec === vKillRows, { vKillRows: vKillRows, withRec: withRec });
  check('§5 both 106722 door kills are fresh by the new judge (2/2)',
    doorKills === 2 && doorFresh === 2, { doorKills: doorKills, doorFresh: doorFresh });
})();

console.log('test-dmgpin-reprereg-b: ' + passed + ' passed, ' + failed + ' failed');
process.exit(failed === 0 ? 0 : 1);
