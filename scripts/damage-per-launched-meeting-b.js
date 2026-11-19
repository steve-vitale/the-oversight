// Damage-per-launched-meeting (descriptive secondary, sim-partysurvive-rerun-b).
// For each quad launch's FIRST joined meeting (CORRECTED join, finding
// #2570), the meeting row's mDealt: total damage the fighting party dealt
// in that fight. Descriptive only — never judged. mDealt is the whole
// fighting party's damage in that meeting, not the launched members'
// alone; rounds are printed beside each damage so a 2-round flee is
// never read bare. Usage:
//   node scripts/damage-per-launched-meeting-b.js --dir evidence/2026-11-19/perseed-partysurvive-rerun-b [--out FILE]
'use strict';
const fs = require('fs');
const path = require('path');
const AN = require(path.join(__dirname, 'analyze-partysurvive-b.js'));
const FCB = require(path.join(__dirname, 'analyze-fightcap-b.js'));

function damagePerLaunchedMeeting(dir) {
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter(function (f) { return f.endsWith('.json'); }).sort() : [];
  const meetings = [];
  let quads = 0, quadsWithMeeting = 0;
  for (const f of files) {
    let d;
    try { d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); } catch (e) { continue; }
    const qs = FCB.quadLaunches(d);
    quads += qs.length;
    for (const launch of qs) {
      const meeting = AN.firstMeeting(d, qs, launch);
      if (!meeting) continue;
      quadsWithMeeting++;
      meetings.push({ seed: d.seed, launchDay: launch.day, holder: launch.vid,
        target: launch.target || null, targetWave: launch.targetWave != null ? launch.targetWave : null,
        meetingDay: meeting.day, meetingMid: meeting.mid, meetingWave: meeting.wave,
        rounds: meeting.rounds || 0, mDealt: meeting.mDealt || 0,
        outcome: meeting.outcome || null,
        ally3Dealt: meeting.ally3Dealt != null ? meeting.ally3Dealt : null,
        mHpStart: meeting.mHpStart != null ? meeting.mHpStart : null });
    }
  }
  const dealt = meetings.map(function (m) { return m.mDealt; }).sort(function (a, b) { return a - b; });
  const total = dealt.reduce(function (s, x) { return s + x; }, 0);
  const mean = dealt.length ? total / dealt.length : null;
  const median = dealt.length ? (dealt.length % 2 ? dealt[(dealt.length - 1) / 2]
    : (dealt[dealt.length / 2 - 1] + dealt[dealt.length / 2]) / 2) : null;
  const zeroDamage = meetings.filter(function (m) { return m.mDealt === 0; }).length;
  return { dir: dir, files: files.length, quadLaunches: quads,
    quadLaunchesWithMeeting: quadsWithMeeting, meetings: meetings,
    totalDamage: total, meanDamage: mean, medianDamage: median,
    zeroDamageMeetings: zeroDamage };
}

if (require.main === module) {
  const args = process.argv.slice(2);
  let dir = null, outFile = null;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--dir') dir = args[++i];
    else if (args[i] === '--out') outFile = args[++i];
  }
  if (!dir) { console.error('usage: damage-per-launched-meeting-b.js --dir DIR [--out FILE]'); process.exit(2); }
  const r = damagePerLaunchedMeeting(dir);
  console.log(JSON.stringify(r, null, 2));
  if (outFile) fs.writeFileSync(outFile, JSON.stringify(r, null, 2) + '\n');
}

module.exports = { damagePerLaunchedMeeting: damagePerLaunchedMeeting };
