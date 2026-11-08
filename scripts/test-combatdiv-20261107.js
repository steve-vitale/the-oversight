// test-combatdiv-20261107.js — proof for the combat-divergence analyzer
// (arm sim-combatdiv-b). Fixture-based classification legs (D same-fight,
// D downstream, R pure re-roll, U hp-outside-fights, U no-divergence),
// reproduction/wall legs on synthetic corpora, and a LIVE A/A leg: the
// driver runs twice on 1 seed at a 5d horizon in separate processes and
// the fight streams must be byte-identical (determinism), with varmor /
// wb / hpBefore recorded on every field fight.
// Run: node scripts/test-combatdiv-20261107.js
// Seeds used: fixtures only + 53003 smoke (5d, not judged).
'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');
const A = require('./analyze-combatdiv-20261107');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

function field(gseq, day, fighter, name, mid, outcome, vTaken, vHpLeft, opts) {
  const r = { gseq: gseq, channel: 'field', day: day, fighter: fighter, fighterName: name,
    mid: mid, wave: 1, outcome: outcome, rounds: 3, vTaken: vTaken, vHpLeft: vHpLeft,
    mHpLeft: 0, allyDealt: 0, allyVid: null, fleeHopeless: false,
    hpBefore: (opts && opts.hpBefore != null) ? opts.hpBefore : 100,
    hpAfter: vHpLeft, varmor: (opts && opts.varmor != null) ? opts.varmor : 5, wb: 10, tailLog: null };
  return r;
}
function tb(gseq, day, scholarId, mid, outcome, fracEnd, opts) {
  return { gseq: gseq, channel: 'tb', day: day, scholarId: scholarId, mid: mid, wave: 1,
    outcome: outcome, rounds: 4, scholarHpFracEnd: fracEnd, monsterHpFracEnd: 0,
    scholarDiedInFight: false, scholarProt: (opts && opts.prot != null) ? opts.prot : 5,
    fightersBefore: [{ key: 'p', kind: 'player', name: 'Scholar', villagerId: scholarId, hp: (opts && opts.hpBefore != null) ? opts.hpBefore : 100, maxHp: 100, varmor: null }],
    fightersAfter: [{ key: 'p', kind: 'player', name: 'Scholar', villagerId: scholarId, hp: Math.round(fracEnd * 100), maxHp: 100, varmor: null }] };
}
function dailyHp(days, mods) {
  // mods: {day: {vid: hp}} — HP map per day; default 12 villagers at 100.
  const rows = [];
  const ids = ['v01', 'v02', 'v03', 'v04', 'v05', 'v06', 'v07', 'v08', 'v09', 'v10', 'v11', 'v12'];
  for (let d = 1; d <= days; d++) {
    const hp = {};
    ids.forEach(function (id) { hp[id] = 100; });
    if (mods && mods[d]) Object.keys(mods[d]).forEach(function (id) { hp[id] = mods[d][id]; });
    rows.push({ day: d, hpById: hp, living: 12 });
  }
  return rows;
}
function corpus(seed, fights, tbrows, daily) {
  return { seed: seed, days: 150, endReason: 'survived', won: false, maxWave: 4, standing: 175,
    scaleRank: 'regional', takeseatStats: { seatTaken: 0, seatDay: null, seatKind: null },
    waveKillLog: [], fieldFights: fights, tbRows: tbrows, daily: daily, instrumentErrors: [] };
}

// --- Fixture 1: D, same-fight damage delta (fights 1-2 identical).
const f1c1 = [field(1, 6, 'v03', 'Maeve', 'belltoad', 'won', 10, 80), field(2, 7, 'v03', 'Maeve', 'sanjun', 'won', 8, 72),
  field(3, 8, 'v05', 'Victor', 'living_wire', 'fled', 12, 60)];
const f1p2 = [field(1, 6, 'v03', 'Maeve', 'belltoad', 'won', 10, 80), field(2, 7, 'v03', 'Maeve', 'sanjun', 'won', 8, 72),
  field(3, 8, 'v05', 'Victor', 'living_wire', 'fled', 8, 64, { varmor: 9 })];
const r1 = A.classify(corpus(53001, f1c1, [], dailyHp(150)), corpus(53001, f1p2, [], dailyHp(150)));
check('D same-fight: class D', r1.cls === 'D', JSON.stringify(r1));
check('D same-fight: root is gseq 3, d8 Victor vs living_wire', r1.rootGseq === 3 && r1.rootDay === 8 && r1.rootMonster === 'living_wire', JSON.stringify(r1));
check('D same-fight: first-divergence day d8', r1.firstDivDay === 8);

// --- Fixture 2: D downstream (damage delta gseq 3, outcome moves gseq 5).
// The first difference IS the damage fight (compareKey includes the damage
// fields); the downstream story is told by firstDamageGseq (3) vs
// firstOutcomeGseq (5).
const f2c1 = [field(1, 6, 'v03', 'Maeve', 'belltoad', 'won', 10, 80), field(2, 7, 'v03', 'Maeve', 'sanjun', 'won', 8, 72),
  field(3, 8, 'v05', 'Victor', 'living_wire', 'won', 12, 60),
  field(4, 9, 'v03', 'Maeve', 'belltoad', 'won', 5, 67),
  field(5, 10, 'v05', 'Victor', 'gavel', 'died', 60, 0, { hpBefore: 60 })];
const f2p2 = [field(1, 6, 'v03', 'Maeve', 'belltoad', 'won', 10, 80), field(2, 7, 'v03', 'Maeve', 'sanjun', 'won', 8, 72),
  field(3, 8, 'v05', 'Victor', 'living_wire', 'won', 8, 64, { varmor: 9 }),
  field(4, 9, 'v03', 'Maeve', 'belltoad', 'won', 5, 67),
  field(5, 10, 'v05', 'Victor', 'gavel', 'won', 40, 24, { hpBefore: 64 })];
const r2 = A.classify(corpus(53003, f2c1, [], dailyHp(150)), corpus(53003, f2p2, [], dailyHp(150)));
check('D downstream: class D', r2.cls === 'D', JSON.stringify(r2));
check('D downstream: root is the damage fight gseq 3 (same-fight-damage)', r2.rootGseq === 3 && r2.rootWhat === 'same-fight-damage', JSON.stringify(r2));
check('D downstream: outcome first moves later, gseq 5', r2.firstOutcomeGseq === 5 && r2.firstDamageGseq === 3);

// --- Fixture 3: R, different monster with identical priors (bisect 53001 shape).
const f3c1 = [field(1, 6, 'v03', 'Maeve', 'belltoad', 'won', 10, 80), field(2, 7, 'v03', 'Maeve', 'sanjun', 'won', 8, 72)];
const f3p2 = [field(1, 6, 'v03', 'Maeve', 'belltoad', 'won', 10, 80), field(2, 7, 'v03', 'Maeve', 'belltoad', 'won', 8, 72)];
const r3 = A.classify(corpus(53001, f3c1, [], dailyHp(150)), corpus(53001, f3p2, [], dailyHp(150)));
check('R pure re-roll: class R', r3.cls === 'R', JSON.stringify(r3));
check('R pure re-roll: root is the different-monster fight d7', r3.rootDay === 7 && r3.rootMonster === 'sanjun', JSON.stringify(r3));

// --- Fixture 4: U, HP diverges outside any fight (identical fight streams).
const hpC1 = dailyHp(150), hpP2 = dailyHp(150, { 5: { v07: 75 } });
const r4 = A.classify(corpus(53005, f1c1, [], hpC1), corpus(53005, f1c1, [], hpP2));
check('U hp-outside-fights: class U', r4.cls === 'U', JSON.stringify(r4));
check('U hp-outside-fights: names d5 and the villager', r4.firstDivDay === 5 && /v07/.test(r4.detail), JSON.stringify(r4));

// --- Fixture 5: U, no divergence at all.
const r5 = A.classify(corpus(53006, f1c1, [], dailyHp(150)), corpus(53006, f1c1, [], dailyHp(150)));
check('U no-divergence: class U with no-divergence note', r5.cls === 'U' && r5.rootWhat === 'no-divergence-in-window', JSON.stringify(r5));

// --- Fixture 6: TB fight D (scholar HP fraction moves in the same fight).
const t6c1 = [tb(1, 7, 'v01', 'highbeam_deer', 'won', 0.6)];
const t6p2 = [tb(1, 7, 'v01', 'highbeam_deer', 'won', 0.72, { prot: 9 })];
const r6 = A.classify(corpus(53002, [], t6c1, dailyHp(150)), corpus(53002, [], t6p2, dailyHp(150)));
check('TB D: class D on scholar HP fraction', r6.cls === 'D' && r6.rootDay === 7, JSON.stringify(r6));

// --- Fixture 6b: U, outcome differs with identical damage and HP
// (untraced-draw drift — the instrument cannot name the draw).
const f6bc1 = [field(1, 6, 'v03', 'Maeve', 'belltoad', 'won', 10, 80)];
const f6bp2 = [field(1, 6, 'v03', 'Maeve', 'belltoad', 'fled', 10, 80)];
const r6b = A.classify(corpus(53004, f6bc1, [], dailyHp(150)), corpus(53004, f6bp2, [], dailyHp(150)));
check('U outcome-reroll: class U with identical-damage note', r6b.cls === 'U' && r6b.rootWhat === 'outcome-differs-with-identical-damage-and-hp', JSON.stringify(r6b));
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'combatdiv-proof-'));
function writeCorp(dir, rows) {
  fs.mkdirSync(dir, { recursive: true });
  rows.forEach(function (r) {
    fs.writeFileSync(path.join(dir, 'combatdiv-b-s' + r.seed + '-combatdiv-c1.json'), JSON.stringify(r));
  });
}
function sumSeed(seed, days, sat, standing, wave, rank, won) {
  return { seed: seed, days: days, endReason: days >= 150 ? 'survived' : 'village-lost', won: won,
    maxWave: wave, standing: standing, scaleRank: rank,
    takeseatStats: { seatTaken: sat != null ? 1 : 0, seatDay: sat, seatKind: sat != null ? 'lesser' : null },
    waveKillLog: [], fieldFights: [], tbRows: [], daily: [], instrumentErrors: [] };
}
const dirH = path.join(tmp, 'healthy');
writeCorp(dirH, [
  sumSeed(53001, 150, null, 175, 4, 'regional', false), sumSeed(53002, 79, null, 125, 4, 'village', false),
  sumSeed(53003, 150, 90, 344, 5, 'regional', false), sumSeed(53004, 150, 94, 260, 5, 'regional', false),
  sumSeed(53005, 97, 90, 230, 5, 'regional', false), sumSeed(53006, 150, 90, 849, 5, 'national', false),
  sumSeed(53007, 86, null, 99, 3, 'village', false), sumSeed(53008, 150, 90, 199, 4, 'regional', false),
]);
const sH = A.seedSummaries(dirH);
check('seedSummaries reads 8 seeds + sits (53003 d90 lesser)', Object.keys(sH).length === 8 && sH[53003].sat === 90 && sH[53003].seat === 'lesser');
const wH = A.wallNumbers(sH);
check('wall numbers: median 150, table-sat 5/8, national 1/8, wave-5 4/8, wins 0/8',
  wH.medianDays === 150 && wH.tableSat === 5 && wH.national === 1 && wH.wave5unlocks === 4 && wH.wins === 0, JSON.stringify(wH));
check('median helper: even count averages middles', A.median([70, 150]) === 110);

// --- LIVE A/A leg: driver twice, 1 seed, 5d, separate processes.
const aa1 = path.join(tmp, 'aa1'), aa2 = path.join(tmp, 'aa2');
const env1 = Object.assign({}, process.env, { DAYS: '5', SEEDS: '53003', RUN: 'aa-test', OUTDIR: aa1 });
const env2 = Object.assign({}, process.env, { DAYS: '5', SEEDS: '53003', RUN: 'aa-test', OUTDIR: aa2 });
execSync('node scripts/combatdiv-20261107.js', { cwd: path.join(__dirname, '..'), env: env1, stdio: 'pipe', timeout: 300000 });
execSync('node scripts/combatdiv-20261107.js', { cwd: path.join(__dirname, '..'), env: env2, stdio: 'pipe', timeout: 300000 });
const j1 = JSON.parse(fs.readFileSync(path.join(aa1, 'combatdiv-b-s53003-aa-test.json'), 'utf8'));
const j2 = JSON.parse(fs.readFileSync(path.join(aa2, 'combatdiv-b-s53003-aa-test.json'), 'utf8'));
check('live A/A: driver wrote 1 seed, 0 instrument errors', j1.seed === 53003 && (j1.instrumentErrors || []).length === 0, JSON.stringify(j1.instrumentErrors));
check('live A/A: field fights recorded (5d)', (j1.fieldFights || []).length > 0, 'fieldFights=' + (j1.fieldFights || []).length);
check('live A/A: every field fight carries hpBefore/varmor/wb',
  (j1.fieldFights || []).every(function (f) { return f.hpBefore != null && f.varmor != null && f.wb != null; }));
check('live A/A: daily rows carry hpById maps',
  (j1.daily || []).length > 0 && (j1.daily || []).every(function (d) { return d.hpById && Object.keys(d.hpById).length > 0; }));
check('live A/A: fight streams identical across processes',
  JSON.stringify(j1.fieldFights) === JSON.stringify(j2.fieldFights) &&
  JSON.stringify(j1.tbRows) === JSON.stringify(j2.tbRows), 'field ' + (j1.fieldFights || []).length + ' vs ' + (j2.fieldFights || []).length);
check('live A/A: analyzer classifies A/A as U no-divergence',
  A.classify(j1, j2).rootWhat === 'no-divergence-in-window', JSON.stringify(A.classify(j1, j2)));

console.log(pass + '/' + (pass + fail) + ' green');
process.exit(fail ? 1 : 0);
