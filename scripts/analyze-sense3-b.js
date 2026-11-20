// analyze-sense3-b.js — sense-condition census, arm sim-sense3-b
// (finding #2619: the third ally never reaches a live wave-4+ fight).
//
// WHAT IT MEASURES: for every v4encounters row in a corpus dir,
//   sense return = len(allyVids) — the sense's return, recorded from
//     opts by the driver (NOT who joined: the engine's joined allies
//     are allyVid / ally2Vid / ally3Vid on the row);
//   shouts fired = count of non-null allyVid/ally2Vid/ally3Vid —
//     each shout IS one hopeless round (fieldFights.js else-if
//     chain, one branch per round's break check, hopeless first
//     evaluated at round >= 2), cross-checked against the SHOUTREC
//     shoutRound / shout2Round / shout3Round fields when present;
//   allyFromStart — the at-the-door path, set only by aidFight;
//   rounds, outcome, and an end cause read from outcome + log
//     (evade / contact-finish / signature-exit / low-HP flee /
//     death / monster-flee / killed / flee).
// Aggregates: the three-vid encounter census, the ladder-works
// control (shout-2 rate in fights of >= 4 rounds), the
// allyFromStart count, and the wall numbers per corpus.
// No game code is read or executed here — this is a pure reader
// of corpus JSON (the frozen dmgshape corpus or a fresh sense3 leg).
// Usage:
//   node scripts/analyze-sense3-b.js <corpus-dir> [--json out.json]
//   node scripts/analyze-sense3-b.js --selftest
'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');

function shoutsFired(e) {
  return (e.allyVid ? 1 : 0) + (e.ally2Vid ? 1 : 0) + (e.ally3Vid ? 1 : 0);
}
function senseReturn(e) { return (e.allyVids || []).length; }

function endCause(e) {
  const log = (e.log || []).join('\n');
  const rounds = e.rounds | 0;
  if (rounds === 0) {
    if (e.outcome === 'evade') return 'evade';
    if (e.outcome === 'vKill') return 'contact-finish';
    return 'no-fight:' + (e.outcome || 'null');
  }
  if (/can't kill a suburb|They walk out|Navigation is victory/.test(log)) return 'signature-exit';
  if (/stands down/.test(log) && e.outcome === 'mFlee') return 'signature-exit';
  if (e.outcome === 'vDie') return 'death';
  if (e.outcome === 'vFlee') return /past holding/.test(log) ? 'low-HP flee' : 'flee';
  if (e.outcome === 'mFlee') return 'monster-flee';
  if (e.outcome === 'vKill') return 'killed';
  return 'other:' + (e.outcome || 'null');
}

function classifyEncounter(seed, e) {
  const sf = shoutsFired(e);
  // SHOUTREC cross-check: the engine's own shout rounds must agree
  // with the joined-ally fields (shoutRound set ⟺ allyVid set, etc.).
  // shout3Round is null on slot-absent code — recorded, never defaulted.
  // When the corpus carries no SHOUTREC fields at all (the dmgshape
  // driver never recorded them), the check is null — unverifiable,
  // not a failure.
  const shoutRounds = [];
  if (typeof e.shoutRound === 'number') shoutRounds.push(e.shoutRound);
  if (typeof e.shout2Round === 'number') shoutRounds.push(e.shout2Round);
  if (typeof e.shout3Round === 'number') shoutRounds.push(e.shout3Round);
  const hasShoutRec = ('shoutRound' in e) || ('shout2Round' in e) || ('shout3Round' in e);
  return {
    seed: seed, day: e.day, vid: e.vid, mid: e.mid, wave: e.wave,
    origin: e.origin || null,
    senseReturn: senseReturn(e),
    shoutsFired: sf,
    shoutRounds: shoutRounds,
    shoutCrossOk: hasShoutRec ? (shoutRounds.length === sf) : null,
    allyFromStart: !!e.allyFromStart,
    rounds: e.rounds | 0,
    outcome: e.outcome || null,
    endCause: endCause(e),
    allyVid: e.allyVid || null,
    ally2Vid: e.ally2Vid || null,
    ally3Vid: e.ally3Vid || null,
    ally3Dealt: (typeof e.ally3Dealt === 'number' ? e.ally3Dealt : null),
    intent: (typeof e.intent === 'string' ? e.intent : null),
    log: e.log || [],
  };
}

const RANK_ORDER = { village: 0, local: 1, regional: 2, national: 3, global: 4 };
function analyzeFile(data) {
  const seed = data.seed;
  const rows = (data.v4encounters || []).map(function (e) { return classifyEncounter(seed, e); });
  const threeVid = rows.filter(function (r) { return r.senseReturn >= 3; });
  const fought = rows.filter(function (r) { return r.rounds > 0; });
  const longFights = fought.filter(function (r) { return r.rounds >= 4; });
  const longWithShout2 = longFights.filter(function (r) { return !!r.ally2Vid; });
  return {
    seed: seed,
    files: 1,
    encounters: rows.length,
    threeVid: threeVid.length,
    threeVidFought: threeVid.filter(function (r) { return r.rounds > 0; }).length,
    threeVidMaxShouts: threeVid.reduce(function (m, r) { return Math.max(m, r.shoutsFired); }, 0),
    threeVidAlly3: threeVid.filter(function (r) { return !!r.ally3Vid; }).length,
    threeVidEndCauses: threeVid.reduce(function (o, r) { o[r.endCause] = (o[r.endCause] || 0) + 1; return o; }, {}),
    allyFromStart: rows.filter(function (r) { return r.allyFromStart; }).length,
    ally3Vid: rows.filter(function (r) { return !!r.ally3Vid; }).length,
    shout1: rows.filter(function (r) { return !!r.allyVid; }).length,
    shout2: rows.filter(function (r) { return !!r.ally2Vid; }).length,
    longFights: longFights.length,
    longWithShout2: longWithShout2.length,
    shoutCrossBad: rows.filter(function (r) { return r.shoutCrossOk === false; }).length,
    launches: (data.v4departs || []).filter(function (r) { return r.result === 'launch' && (r.targetWave | 0) >= 4; }).length,
    quadLaunches: (data.v4departs || []).filter(function (r) { return r.result === 'launch' && (r.targetWave | 0) >= 4 && (r.partySize | 0) >= 4; }).length,
    // Wall numbers (per-seed, descriptive).
    won: !!data.won,
    national: (RANK_ORDER[data.scaleRank] || 0) >= 3,
    nationalStanding: (data.standing | 0) >= 200,
    table: !!data.won,
    maxWave: data.maxWave | 0,
    standing: data.standing | 0,
    days: data.days | 0,
    gameDays: data.gameDays | 0,
    endReason: data.endReason || null,
    villageLost: !!data.villageLost,
    deaths: (data.deaths || []).length,
    instrumentErrors: (data.instrumentErrors || []).length,
    slotAbsent: data.slotAbsent === true,
    allyslot3Flag: (data.allyslot3Flag === undefined ? null : data.allyslot3Flag),
    rows: rows,
  };
}

function analyzeDir(dir) {
  const files = fs.readdirSync(dir).filter(function (f) { return /\.json$/.test(f); }).sort();
  const out = {
    dir: dir, files: 0, errors: 0,
    encounters: 0, threeVid: 0, threeVidFought: 0, threeVidMaxShouts: 0,
    threeVidAlly3: 0, threeVidEndCauses: {},
    allyFromStart: 0, ally3Vid: 0, shout1: 0, shout2: 0,
    longFights: 0, longWithShout2: 0, shoutCrossBad: 0,
    launches: 0, quadLaunches: 0,
    wins: 0, national: 0, nationalStanding: 0, table: 0,
    wave5: 0, wave4: 0, survived: 0, villageLost: 0,
    standings: [], gameDays: [], deaths: 0, instrumentErrors: 0,
    threeVidRows: [], perSeed: [],
  };
  for (const f of files) {
    let data;
    try { data = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); }
    catch (e) { out.errors++; continue; }
    out.files++;
    const a = analyzeFile(data);
    out.encounters += a.encounters;
    out.threeVid += a.threeVid;
    out.threeVidFought += a.threeVidFought;
    out.threeVidMaxShouts = Math.max(out.threeVidMaxShouts, a.threeVidMaxShouts);
    out.threeVidAlly3 += a.threeVidAlly3;
    for (const k of Object.keys(a.threeVidEndCauses)) out.threeVidEndCauses[k] = (out.threeVidEndCauses[k] || 0) + a.threeVidEndCauses[k];
    out.allyFromStart += a.allyFromStart;
    out.ally3Vid += a.ally3Vid;
    out.shout1 += a.shout1;
    out.shout2 += a.shout2;
    out.longFights += a.longFights;
    out.longWithShout2 += a.longWithShout2;
    out.shoutCrossBad += a.shoutCrossBad;
    out.launches += a.launches;
    out.quadLaunches += a.quadLaunches;
    if (a.won) out.wins++;
    if (a.national) out.national++;
    if (a.nationalStanding) out.nationalStanding++;
    if (a.table) out.table++;
    if (a.maxWave >= 5) out.wave5++;
    if (a.maxWave >= 4) out.wave4++;
    if (a.endReason === 'survived' || (a.gameDays | 0) >= 150) out.survived++;
    if (a.villageLost) out.villageLost++;
    out.standings.push(a.standing);
    out.gameDays.push(a.gameDays);
    out.deaths += a.deaths;
    out.instrumentErrors += a.instrumentErrors;
    out.threeVidRows = out.threeVidRows.concat(a.rows.filter(function (r) { return r.senseReturn >= 3; }));
    out.perSeed.push({
      seed: a.seed, encounters: a.encounters, threeVid: a.threeVid,
      threeVidMaxShouts: a.threeVidMaxShouts, allyFromStart: a.allyFromStart,
      shout1: a.shout1, shout2: a.shout2, longFights: a.longFights,
      longWithShout2: a.longWithShout2, launches: a.launches,
      quadLaunches: a.quadLaunches, maxWave: a.maxWave,
      standing: a.standing, gameDays: a.gameDays,
      endReason: a.endReason, won: a.won,
    });
  }
  out.medianSurvival = out.gameDays.length
    ? out.gameDays.slice().sort(function (x, y) { return x - y; })[Math.floor(out.gameDays.length / 2)] : null;
  return out;
}

function printCensus(a) {
  console.log('sense3 census: ' + a.files + ' files, ' + a.errors + ' errors, ' + a.encounters + ' encounters');
  console.log('  three-vid encounters: ' + a.threeVid + ' (fought ' + a.threeVidFought + '), max shouts ' + a.threeVidMaxShouts + ', ally3Vid ' + a.threeVidAlly3);
  console.log('  three-vid end causes: ' + JSON.stringify(a.threeVidEndCauses));
  console.log('  allyFromStart rows: ' + a.allyFromStart + ' | ally3Vid rows: ' + a.ally3Vid);
  console.log('  shout1 ' + a.shout1 + ' / shout2 ' + a.shout2 + ' | long fights (>=4r) ' + a.longFights + ', with shout2 ' + a.longWithShout2);
  console.log('  launches ' + a.launches + ' (quads ' + a.quadLaunches + ')');
  console.log('  wall: wins ' + a.wins + ' national ' + a.national + ' (standing>=200: ' + a.nationalStanding + ') table ' + a.table +
    ' wave5 ' + a.wave5 + '/8 wave4 ' + a.wave4 + '/8 survived ' + a.survived + '/8 median ' + a.medianSurvival + 'd deaths ' + a.deaths);
  for (const r of a.threeVidRows) {
    console.log('  3vid seed ' + r.seed + ' d' + r.day + ' ' + r.mid + ' fighter=' + r.vid + ' ' + r.origin +
      ' rounds=' + r.rounds + ' shouts=' + r.shoutsFired + ' ' + r.outcome + ' (' + r.endCause + ')' +
      ' allyVid=' + (r.allyVid || '-') + ' ally2Vid=' + (r.ally2Vid || '-'));
  }
}

// ================= SELFTEST =================
function selftest() {
  let passed = 0, failed = 0;
  function check(name, cond, extra) {
    if (cond) { passed++; console.log('PASS ' + name); }
    else { failed++; console.log('FAIL ' + name + (extra != null ? ' :: ' + JSON.stringify(extra) : '')); }
  }
  // §A classification fixtures (synthetic rows).
  const base = { day: 100, vid: 'h1', mid: 'eulogy', wave: 4, origin: 'expedition', rounds: 2,
    outcome: 'vFlee', allyVids: ['c1', 'c2', 'c3'], allyVid: 'c1', ally2Vid: null, ally3Vid: null,
    ally3Dealt: 0, allyFromStart: false, log: ['Tashi is losing — shouts for help! Daniyar charges in!',
    "Daniyar answered Tashi's shout, but Tashi is past holding — they run while running still works."] };
  const c1 = classifyEncounter(1, base);
  check('§A three-vid low-HP flee: senseReturn 3, shouts 1, endCause low-HP flee',
    c1.senseReturn === 3 && c1.shoutsFired === 1 && c1.endCause === 'low-HP flee', c1);
  check('§A SHOUTREC cross-check: recorded shoutRound agrees with the joined ally (1 recorded round, 1 shout)',
    (function () { const c = classifyEncounter(1, Object.assign({}, base, { shoutRound: 2 })); return c.shoutCrossOk === true && c.shoutRounds.length === 1; })(), null);
  check('§A SHOUTREC cross-check: a recorded shoutRound with NO joined ally is flagged as a mismatch, not hidden',
    (function () { const c = classifyEncounter(1, Object.assign({}, base, { allyVid: null, shoutRound: 2 })); return c.shoutCrossOk === false; })(), null);
  const evade = classifyEncounter(1, Object.assign({}, base, { rounds: 0, outcome: 'evade', allyVid: null, allyVids: ['c1', 'c2', 'c3'], log: ['Tashi saw Loud-Eyes in time and gave it room.'] }));
  check('§A evade: 0 rounds, endCause evade, shouts 0',
    evade.endCause === 'evade' && evade.shoutsFired === 0 && evade.rounds === 0, evade);
  const contact = classifyEncounter(1, Object.assign({}, base, { rounds: 0, outcome: 'vKill', allyVid: null, log: ['Tashi does not let it slip away — they close in and strike with the kitchen knife for 12 — Big Big falls. (Contact finish)'] }));
  check('§A contact finish: 0 rounds + vKill = contact-finish',
    contact.endCause === 'contact-finish', contact);
  const suburb = classifyEncounter(1, Object.assign({}, base, { rounds: 1, mid: 'suburb', outcome: 'vFlee', allyVid: null, log: ["R1: Jorge reads the sterile streets — you can't kill a suburb. They walk out. (Navigation is victory.)"] }));
  check('§A suburb signature exit: 1 round, no shout, endCause signature-exit',
    suburb.endCause === 'signature-exit' && suburb.shoutsFired === 0, suburb);
  const death = classifyEncounter(1, Object.assign({}, base, { rounds: 3, outcome: 'vDie', allyVid: 'c1', log: ['Olivia is losing — shouts for help! Kieran charges in!'] }));
  check('§A death after one shout: endCause death, shouts 1',
    death.endCause === 'death' && death.shoutsFired === 1, death);
  const long2 = classifyEncounter(1, Object.assign({}, base, { rounds: 5, outcome: 'vFlee', allyVid: 'c1', ally2Vid: 'c2', allyVids: ['c1', 'c2'], log: ['Hassan is losing — shouts for help! Frank charges in!', 'Hassan is still losing — shouts again! Si-chan charges in!'] }));
  check('§A long two-vid fight: shouts 2, endCause flee (no past-holding line)',
    long2.shoutsFired === 2 && long2.endCause === 'flee', long2);
  const door = classifyEncounter(1, Object.assign({}, base, { allyFromStart: true, rounds: 4, outcome: 'vFlee', allyVid: 'c1', ally2Vid: 'c2', log: [] }));
  check('§A allyFromStart is carried, not dropped',
    door.allyFromStart === true, door);
  // §C analyzeDir over a synthetic two-file corpus in tmp.
  // NOTE: fixtures here are RAW encounter rows (what a driver
  // writes), not classified rows — classifyEncounter reads the raw
  // allyVids / allyVid / rounds / outcome / log fields.
  const rawEvade = { day: 100, vid: 'h1', mid: 'eater', wave: 4, origin: 'expedition', rounds: 0,
    outcome: 'evade', allyVids: ['c1', 'c2', 'c3'], allyVid: null, ally2Vid: null, ally3Vid: null,
    allyFromStart: false, log: ['Tashi saw Loud-Eyes in time and gave it room.'] };
  const rawLong2 = { day: 114, vid: 'h1', mid: 'eulogy', wave: 4, origin: 'expedition', rounds: 5,
    outcome: 'vFlee', allyVids: ['c1', 'c2'], allyVid: 'c1', ally2Vid: 'c2', ally3Vid: null,
    allyFromStart: false, log: ['Hassan is losing — shouts for help! Frank charges in!', 'Hassan is still losing — shouts again! Si-chan charges in!'] };
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'sense3-analyze-'));
  try {
    const f1 = { seed: 900001, won: false, scaleRank: 'regional', maxWave: 4, standing: 199, days: 150, gameDays: 150, endReason: 'survived', villageLost: false, deaths: [], instrumentErrors: [], v4departs: [{ result: 'launch', targetWave: 4, partySize: 4 }], v4encounters: [base, rawEvade] };
    const f2 = { seed: 900002, won: false, scaleRank: 'regional', maxWave: 5, standing: 530, days: 150, gameDays: 150, endReason: 'survived', villageLost: false, deaths: [], instrumentErrors: [], v4departs: [], v4encounters: [rawLong2] };
    fs.writeFileSync(path.join(tmp, 'a.json'), JSON.stringify(f1));
    fs.writeFileSync(path.join(tmp, 'b.json'), JSON.stringify(f2));
    const a = analyzeDir(tmp);
    check('§C synthetic dir: 2 files, 3 encounters, 2 three-vid, max shouts 1 in three-vid',
      a.files === 2 && a.encounters === 3 && a.threeVid === 2 && a.threeVidMaxShouts === 1,
      { files: a.files, encounters: a.encounters, threeVid: a.threeVid, threeVidMaxShouts: a.threeVidMaxShouts });
    check('§C synthetic dir: long-fight control 1/1 shout-2, wall wave5 1/2, standing>=200 1/2',
      a.longFights === 1 && a.longWithShout2 === 1 && a.wave5 === 1 && a.nationalStanding === 1,
      { longFights: a.longFights, longWithShout2: a.longWithShout2, wave5: a.wave5, nationalStanding: a.nationalStanding });
    check('§C synthetic dir: allyFromStart 0, ally3Vid 0, 0 errors',
      a.allyFromStart === 0 && a.ally3Vid === 0 && a.errors === 0, a);
  } finally { try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {} }
  // §D driver smoke: one 30d seed on the fresh band, slot-absent substrate.
  const { spawnSync } = require('child_process');
  const smokeDir = 'perseed-sense3-b-smoke';
  const smokePath = path.join(__dirname, '..', 'evidence', '2026-11-20', smokeDir);
  try { fs.rmSync(smokePath, { recursive: true, force: true }); } catch (e) {}
  const env = Object.assign({}, process.env, {
    SENSEEXPED: '1', PARTYSIZE4: '1', VETREENGAGE: '1', FLEEREPAIR2: '1',
    FIGHTALLY2: '1', LAUNCHSURVIVE: '1', MODE: 'sense3', DAYS: '30',
    SEEDS: '106251', RUN: 'sense3-b-smoke', OUTDIR: smokeDir });
  delete env.ALLYSLOT3;
  const r = spawnSync(process.execPath, [path.join(__dirname, 'sense3-driver-b.js')],
    { cwd: path.join(__dirname, '..'), env: env, encoding: 'utf8', timeout: 600000 });
  check('§D driver smoke: exit 0 on one 30d seed', r.status === 0, (r.stderr || '').slice(0, 300));
  let dd = null;
  try { dd = JSON.parse(fs.readFileSync(path.join(smokePath, 'sense3-b-s106251-sense3-b-smoke-sense3.json'), 'utf8')); } catch (e) {}
  check('§D driver smoke: corpus file written', !!dd, null);
  if (dd) {
    check('§D driver smoke: flags self-describe (slotAbsent true, allyslot3Flag null, senseexpedFlag 1, arm sense3-b)',
      dd.slotAbsent === true && (dd.allyslot3Flag === null || dd.allyslot3Flag === undefined) && dd.senseexpedFlag === '1' && dd.arm === 'sense3-b',
      { slotAbsent: dd.slotAbsent, allyslot3Flag: dd.allyslot3Flag, senseexpedFlag: dd.senseexpedFlag, arm: dd.arm });
    check('§D driver smoke: 0 instrument errors', (dd.instrumentErrors || []).length === 0, dd.instrumentErrors);
    check('§D driver smoke: encounter rows carry intent + shout rounds (new sense fields present)',
      (dd.v4encounters || []).every(function (e) { return ('intent' in e) && ('shoutRound' in e) && ('shout2Round' in e) && ('shout3Round' in e); }),
      (dd.v4encounters || []).length);
  }
  try { fs.rmSync(smokePath, { recursive: true, force: true }); } catch (e) {}
  console.log('analyze-sense3-b selftest: ' + passed + ' passed, ' + failed + ' failed');
  return failed === 0;
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.indexOf('--selftest') !== -1) { process.exit(selftest() ? 0 : 1); }
  const dir = args[0];
  if (!dir) { console.error('usage: node scripts/analyze-sense3-b.js <corpus-dir> [--json out.json] | --selftest'); process.exit(2); }
  const a = analyzeDir(dir);
  printCensus(a);
  const ji = args.indexOf('--json');
  if (ji !== -1 && args[ji + 1]) fs.writeFileSync(args[ji + 1], JSON.stringify(a, null, 2) + '\n');
}

module.exports = { classifyEncounter: classifyEncounter, endCause: endCause, shoutsFired: shoutsFired, senseReturn: senseReturn, analyzeFile: analyzeFile, analyzeDir: analyzeDir, selftest: selftest };
