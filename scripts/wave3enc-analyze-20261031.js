#!/usr/bin/env node
// wave3enc-analyze-20261031.js — sim-wave3enc-a encounter census analyzer.
//
// Reads evidence/2026-10-31/perseed-wave3enc/leadfeast/s<seed>.json
// (or --dir <dir>) and writes the census to stdout (JSON) plus a
// human-readable table to stderr. Implements the prereg's meeting
// definition and six-bucket split EXACTLY; any deviation is an
// unclassified item, never a guess.
//
// Usage: node scripts/wave3enc-analyze-20261031.js [--dir <dir>] [--out <json>]
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');

const args = process.argv.slice(2);
let dir = path.join(REPO, 'evidence', '2026-10-31', 'perseed-wave3enc', 'leadfeast');
let out = null;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--dir') dir = args[++i];
  else if (args[i] === '--out') out = args[++i];
}

const monstersRaw = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'monsters.json'), 'utf8'));
const monsters = Array.isArray(monstersRaw) ? monstersRaw : (monstersRaw.monsters || []);
const waveById = {};
for (const m of monsters) if (m && m.id) waveById[m.id] = m.wave | 0;
function waveOf(mid) { return (mid && waveById[mid]) ? waveById[mid] : 1; }

const BUCKETS = ['avoided', 'fledByBeast', 'fledByVillagers', 'foughtLost', 'foughtWonNoLedger', 'ledgerPointKill'];
function emptyBuckets() { const o = {}; for (const b of BUCKETS) o[b] = 0; return o; }

function analyzeSeed(j) {
  const daily = j.daily || [];
  const sorted = daily.every((r, i) => i === 0 || r.day >= daily[i - 1].day);
  const lastRow = daily.length ? daily[daily.length - 1] : null;
  const rungRows = daily.filter(r => r.w3rung);
  const firstW3Day = rungRows.length ? rungRows[0].day : null;
  const w3Days = rungRows.length;
  const derivedGe3 = lastRow ? !!lastRow.w3rung : false;
  const engineGe3 = (j.engineFinalUw != null) ? (j.engineFinalUw >= 3) : null;
  const uwCheck = (engineGe3 == null) ? 'no-engine' : (derivedGe3 === engineGe3 ? 'pass' : 'FAIL');

  const ffW3 = (j.fieldFights || []).filter(f => (f.wave | 0) === 3);
  const tbW3 = (j.tbFights || []).filter(t => (t.monsterIds || []).some(mid => waveOf(mid) === 3));
  const killEvW3 = (j.killEvents || []).filter(e => (e.wave | 0) === 3);
  const spawnsW3 = (j.spawns || []).filter(s => (s.wave | 0) === 3);

  // Kill-event pool for day+type joining (consumed in order).
  const pool = {};
  for (const e of killEvW3) {
    const k = e.day + '|' + e.mid;
    (pool[k] = pool[k] || []).push(e);
  }
  const usedKillEvents = new Set();
  const unclassified = [];
  const buckets = emptyBuckets();
  const byChannel = { field: emptyBuckets(), tb: emptyBuckets() };
  const fieldCaller = {};
  const meetingMids = [];
  let multiMonsterTb = 0;

  function takeKill(day, mid) {
    const k = day + '|' + mid;
    const arr = pool[k] || [];
    while (arr.length) {
      const e = arr.shift();
      if (!usedKillEvents.has(e)) { usedKillEvents.add(e); return e; }
    }
    return null;
  }
  function putBucket(channel, b) { buckets[b]++; byChannel[channel][b]++; }

  for (const f of ffW3) {
    meetingMids.push(f.mid);
    // Caller normalization: pilot corpus recorded expedition meetings
    // as 'other' (classifier learned the expeditionMonster frame only
    // after the pilot); the stored stack string lets the analyzer
    // recover the channel without re-running sims. Confirm corpus
    // records 'expedition' directly; both normalize to the same label.
    const effCaller = (f.caller === 'other' && (f.stack || '').indexOf('expeditionMonster') >= 0) ? 'expedition' : (f.caller || 'other');
    fieldCaller[effCaller] = (fieldCaller[effCaller] || 0) + 1;
    const o = f.outcome;
    if (o === 'evade') putBucket('field', 'avoided');
    else if (o === 'mFlee') putBucket('field', 'fledByBeast');
    else if (o === 'vFlee') putBucket('field', 'fledByVillagers');
    else if (o === 'vDie') putBucket('field', 'foughtLost');
    else if (o === 'vKill') {
      const ev = takeKill(f.day, f.mid);
      if (!ev) unclassified.push({ kind: 'killRowNoEvent', channel: 'field', day: f.day, mid: f.mid, vid: f.vid });
      else if (ev.delta != null && ev.delta > 0) putBucket('field', 'ledgerPointKill');
      else if (ev.delta === 0) putBucket('field', 'foughtWonNoLedger');
      else unclassified.push({ kind: 'killEventNullDelta', channel: 'field', day: f.day, mid: f.mid });
    } else unclassified.push({ kind: 'fieldUnknownOutcome', channel: 'field', day: f.day, mid: f.mid, outcome: o, vid: f.vid });
  }
  for (const t of tbW3) {
    const mids = [...new Set((t.monsterIds || []).filter(mid => waveOf(mid) === 3))];
    for (const mid of mids) meetingMids.push(mid);
    if (mids.length > 1) multiMonsterTb++;
    const r = t.result;
    if (r === 'lost') putBucket('tb', 'foughtLost');
    else if (r === 'fled' || r === 'routed') putBucket('tb', 'fledByVillagers');
    else if (r === 'won') {
      // One meeting per TB fight row (not per monster).
      let ev = null;
      for (const mid of mids) { if (!ev) ev = takeKill(t.day, mid); }
      if (!ev) putBucket('tb', 'fledByBeast');
      else if (ev.delta != null && ev.delta > 0) putBucket('tb', 'ledgerPointKill');
      else if (ev.delta === 0) putBucket('tb', 'foughtWonNoLedger');
      else unclassified.push({ kind: 'killEventNullDelta', channel: 'tb', day: t.day, mid: mids.join(','), result: r });
    } else unclassified.push({ kind: 'tbUnknownResult', channel: 'tb', day: t.day, mid: mids.join(','), result: r });
  }
  const orphanKillEvents = killEvW3.filter(e => !usedKillEvents.has(e));
  for (const e of orphanKillEvents) unclassified.push({ kind: 'killEventNoFightRow', channel: 'orphan-kill', day: e.day, mid: e.mid, via: e.via, delta: e.delta });

  const meetings = ffW3.length + tbW3.length;
  const bucketSum = BUCKETS.reduce((s, b) => s + buckets[b], 0);
  // Unclassified fight rows (not orphan kill events) break the sum.
  const unclassifiedFightRows = unclassified.filter(u => u.kind !== 'killEventNoFightRow').length;
  const sumOk = (bucketSum + unclassifiedFightRows) === meetings;

  // Deed feed + spawn context (last daily row's faced map).
  const facedW3 = lastRow ? Object.keys(lastRow.faced || {}).filter(mid => (lastRow.faced[mid] | 0) === 3) : [];
  const meetingMidSet = new Set(meetingMids);
  const deedOnly = facedW3.filter(mid => !meetingMidSet.has(mid));
  const spawnedTypes = [...new Set(spawnsW3.map(s => s.mid).filter(Boolean))];
  const unfoughtSpawnTypes = spawnedTypes.filter(mid => !meetingMidSet.has(mid) && facedW3.indexOf(mid) < 0);
  const killLogW3 = (j.killLog || []).filter(e => (e.w | 0) === 3);
  const unmatchedLog = killLogW3.filter(le => !killEvW3.some(e => e.day === le.d && e.mid === le.mid));
  const killLedgerPoint = killEvW3.filter(e => e.delta != null && e.delta > 0).length;
  const killCapped = killEvW3.filter(e => e.delta === 0).length;
  const killNullDelta = killEvW3.filter(e => e.delta == null).length;

  const deathCauses = {};
  for (const d of (j.deaths || [])) deathCauses[d.cause || 'unknown'] = (deathCauses[d.cause || 'unknown'] || 0) + 1;

  // Repeat-meeting audit: same (day, vid, mid) field rows. Sequential
  // re-engagements (progressing HPs) are separate meetings; a 0-round
  // row repeating identical HPs of an earlier same-key row is flagged
  // as a probable double-tap, not silently merged (see evidence).
  const repeatGroups = {};
  for (const f of ffW3) {
    const k = f.day + '|' + f.vid + '|' + f.mid;
    (repeatGroups[k] = repeatGroups[k] || []).push(f);
  }
  let repeatGroupCount = 0, repeatRowCount = 0, zeroRoundRepeats = 0;
  const zeroRoundRepeatDetail = [];
  for (const k of Object.keys(repeatGroups)) {
    const rows = repeatGroups[k];
    if (rows.length > 1) {
      repeatGroupCount++;
      repeatRowCount += rows.length;
      for (let i = 1; i < rows.length; i++) {
        if ((rows[i].rounds | 0) === 0 && rows[i].vHpLeft === rows[i - 1].vHpLeft && rows[i].mHpLeft === rows[i - 1].mHpLeft) {
          zeroRoundRepeats++;
          zeroRoundRepeatDetail.push({ day: rows[i].day, vid: rows[i].vid, mid: rows[i].mid, outcome: rows[i].outcome });
        }
      }
    }
  }

  return {
    seed: j.seed, anchorCommit: j.anchorCommit, instrument: j.instrument,
    gameDays: j.gameDays, endReason: j.endReason, endScaleRank: j.endScaleRank,
    national: j.national, table: j.table, won: j.won, maxWave: j.maxWave,
    engineFinalUw: j.engineFinalUw, engineFinalStanding: j.engineFinalStanding,
    dailyRows: daily.length, dailySorted: sorted,
    firstW3Day, w3Days, endP3: lastRow ? lastRow.p3 : null, endP2: lastRow ? lastRow.p2 : null,
    endWarPts: lastRow ? lastRow.warPts : null,
    derivedGe3, engineGe3, uwCheck,
    meetings, buckets, bucketSum, sumOk, byChannel, fieldCaller,
    fieldMeetings: ffW3.length, tbMeetings: tbW3.length, multiMonsterTb,
    unclassified, unclassifiedCount: unclassified.length, unclassifiedFightRows,
    orphanKillEvents: orphanKillEvents.length,
    spawnsW3: spawnsW3.length, spawnedTypes, unfoughtSpawnTypes,
    facedW3Types: facedW3, deedOnlyTypes: deedOnly,
    killEventsW3: killEvW3.length, killLedgerPoint, killCapped, killNullDelta,
    killLogW3: killLogW3.length, unmatchedLogEntries: unmatchedLog.length,
    recorderErrs: j.recorderErrs || 0, recorderErrors: j.recorderErrors || [],
    recorderOverflow: j.recorderOverflow || {},
    sayLinesW3: (j.sayLines || []).length,
    repeatGroupCount, repeatRowCount, zeroRoundRepeats, zeroRoundRepeatDetail,
    deaths: (j.deaths || []).length, deathCauses,
    hashes: (j.hashes || []).length,
    // Raw detail kept for the sense read + audit (not in the summary table).
    _ffW3: ffW3, _tbW3: tbW3, _killEvW3: killEvW3, _sayLines: j.sayLines || [],
  };
}

const files = [];
if (require.main === module) {
  const found = fs.readdirSync(dir).filter(f => /^s\d+\.json$/.test(f)).sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1)));
  for (const f of found) files.push(f);
}
if (require.main === module) {
if (!files.length) { console.error('ANALYZE STOP: no per-seed JSONs in ' + dir); process.exit(2); }
const seeds = [];
for (const f of files) {
  const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  seeds.push(analyzeSeed(j));
}
seeds.sort((a, b) => a.seed - b.seed);

// Wall numbers.
const wall = {
  n: seeds.length,
  national: seeds.filter(s => s.national).length,
  table: seeds.filter(s => s.table).length,
  won: seeds.filter(s => s.won).length,
  wave4: seeds.filter(s => s.maxWave >= 4).length,
  wave5: seeds.filter(s => s.maxWave >= 5).length,
  medianSurvival: null, maxSurvival: null,
  totalMeetings: seeds.reduce((s, x) => s + x.meetings, 0),
  totalBuckets: null,
};
{
  const days = seeds.map(s => s.gameDays).sort((a, b) => a - b);
  wall.medianSurvival = days.length % 2 ? days[(days.length - 1) / 2] : (days[days.length / 2 - 1] + days[days.length / 2]) / 2;
  wall.maxSurvival = days[days.length - 1];
  const tb = emptyBuckets();
  for (const s of seeds) for (const b of BUCKETS) tb[b] += s.buckets[b];
  wall.totalBuckets = tb;
}
const outObj = { dir, seeds, wall, buckets: BUCKETS };
if (out) fs.writeFileSync(out, JSON.stringify(outObj, null, 1) + '\n');
console.log(JSON.stringify(outObj));

// Human-readable table to stderr.
console.error('\nseed | days/end | w3day w3days p3 warPts | meetings | avoided fledB fledV lost wonNoLed ledPt | unclass | spawns unfought');
for (const s of seeds) {
  const b = s.buckets;
  console.error(`${s.seed} | ${s.gameDays}/${s.endReason} | ${s.firstW3Day} ${s.w3Days}d p3=${s.endP3} war=${s.endWarPts} | ${s.meetings} | ${b.avoided} ${b.fledByBeast} ${b.fledByVillagers} ${b.foughtLost} ${b.foughtWonNoLedger} ${b.ledgerPointKill} | ${s.unclassifiedCount} | ${s.spawnsW3} ${s.unfoughtSpawnTypes.join(',') || '-'}`);
}
console.error(`wall: n=${wall.n} national=${wall.national} table=${wall.table} won=${wall.won} w4=${wall.wave4} w5=${wall.wave5} median=${wall.medianSurvival} max=${wall.maxSurvival} meetings=${wall.totalMeetings}`);
} // require.main

module.exports = { analyzeSeed, BUCKETS, waveOf };
