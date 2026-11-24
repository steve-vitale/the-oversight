// analyze-zerodmg-recheck-a.js — zero-damage classifier, arm sim-fightcap-recheck-a
// (DIAG RECHECK of the wave-4 fight; the dmgshape lesson: zero-damage
// fights must be classified explicitly, never silently pooled).
//
// Reads the fightcap-a analysis JSON (armPairMeetings / ctlPairMeetings)
// and assigns every engaged meeting a class:
//   strike-fight            — mDealt > 0 (the decomposition can price it)
//   contradict-counterplay  — mDealt == 0 and the log names contradicting
//                             the narration / working the trick (the
//                             Eulogy's authored counter; the fight's
//                             correct play deals no damage)
//   died-before-strike      — mDealt == 0, outcome vDie, no strike line
//                             in the log (holder fired an ability or
//                             nothing, then died)
//   other-zero-damage       — any remaining 0-damage engaged meeting,
//                             named individually (seed/day/vid/mid)
//   unclassified            — mDealt missing (null) on an engaged row;
//                             fails the prereg classification bar.
// A meeting is fully classified iff its class is one of the first four.
// Usage:
//   node scripts/analyze-zerodmg-recheck-a.js --analysis FILE [--out FILE]
//   node scripts/analyze-zerodmg-recheck-a.js --selftest
'use strict';
const path = require('path');
const fs = require('fs');

const CONTRADICT_RE = /contradict/i;
const STRIKE_RE = /strikes for/i;
const TRICK_RE = /working the trick|holds the line/i;

function classifyMeeting(m) {
  const dealt = (m && m.mDealt != null) ? m.mDealt : null;
  const log = ((m && m.log) || []).map(function (s) { return String(s); });
  const joined = log.join('\n');
  if (dealt == null) return { cls: 'unclassified', why: 'mDealt null on engaged row' };
  if (dealt > 0) return { cls: 'strike-fight', why: 'mDealt ' + dealt };
  // mDealt == 0 on an engaged (rounds > 0) meeting.
  if (CONTRADICT_RE.test(joined) || TRICK_RE.test(joined)) {
    return { cls: 'contradict-counterplay', why: 'log names the contradict/trick play' };
  }
  if (m.outcome === 'vDie' && !STRIKE_RE.test(joined)) {
    return { cls: 'died-before-strike', why: 'vDie with no strike line in log' };
  }
  return { cls: 'other-zero-damage', why: '0 damage, no contradict, no strike line' };
}

function classify(meetings) {
  const rows = [];
  const counts = { 'strike-fight': 0, 'contradict-counterplay': 0, 'died-before-strike': 0, 'other-zero-damage': 0, 'unclassified': 0 };
  for (const m of (meetings || [])) {
    const c = classifyMeeting(m);
    counts[c.cls] = (counts[c.cls] || 0) + 1;
    rows.push({ seed: m.seed, day: m.day, vid: m.vid, mid: m.mid, outcome: m.outcome,
      rounds: m.rounds, mDealt: m.mDealt, cls: c.cls, why: c.why });
  }
  const unclassified = rows.filter(function (r) { return r.cls === 'unclassified'; });
  return { total: rows.length, counts: counts,
    zeroDamage: counts['contradict-counterplay'] + counts['died-before-strike'] + counts['other-zero-damage'],
    fullyClassified: unclassified.length === 0, unclassified: unclassified, rows: rows };
}

function selftest() {
  let passed = 0, failed = 0;
  function check(name, cond, extra) {
    if (cond) passed++;
    else { failed++; console.log('FAIL: ' + name + (extra ? ' — ' + JSON.stringify(extra) : '')); }
  }
  const base = { seed: 110101, day: 50, vid: 'v1', mid: 'eulogy', outcome: 'vFlee', rounds: 5, mDealt: 100, log: ['R1: A strikes for 30'] };
  check('strike-fight: mDealt > 0', classifyMeeting(base).cls === 'strike-fight');
  check('contradict-counterplay: 0 dealt + contradict line',
    classifyMeeting(Object.assign({}, base, { mDealt: 0, outcome: 'mFlee', log: ['R1: Tashi contradicts the narration', 'Tashi holds the line — working the trick, not the damage race.'] })).cls === 'contradict-counterplay');
  check('died-before-strike: 0 dealt + vDie + no strike line',
    classifyMeeting(Object.assign({}, base, { mDealt: 0, outcome: 'vDie', rounds: 2, log: ["R1: Thong's eyes go red. Next 3 strikes hit twice as hard. (Rage)", 'R2: Gorge hits Thong for 55 (0 left)'] })).cls === 'died-before-strike');
  check('other-zero-damage: 0 dealt, no contradict, vFlee, no strike line',
    classifyMeeting(Object.assign({}, base, { mDealt: 0, outcome: 'vFlee', log: ['R1: A walks straight in. No avoiding it.'] })).cls === 'other-zero-damage');
  check('other-zero-damage: 0 dealt vDie WITH a strike line is not died-before-strike',
    classifyMeeting(Object.assign({}, base, { mDealt: 0, outcome: 'vDie', rounds: 3, log: ['R1: A strikes for 0'] })).cls === 'other-zero-damage');
  check('unclassified: mDealt null',
    classifyMeeting(Object.assign({}, base, { mDealt: null })).cls === 'unclassified');
  const agg = classify([base, Object.assign({}, base, { mDealt: 0, log: ['contradicts the narration'] })]);
  check('aggregate: 1 strike + 1 contradict, fully classified',
    agg.total === 2 && agg.counts['strike-fight'] === 1 && agg.counts['contradict-counterplay'] === 1 && agg.fullyClassified === true, agg);
  console.log('analyze-zerodmg-recheck-a --selftest: ' + passed + ' passed, ' + failed + ' failed');
  return failed === 0;
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.indexOf('--selftest') !== -1) { process.exit(selftest() ? 0 : 1); }
  let analysisFile = null, outFile = null;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--analysis') analysisFile = args[++i];
    else if (args[i] === '--out') outFile = args[++i];
  }
  if (!analysisFile) { console.error('usage: analyze-zerodmg-recheck-a.js --analysis FILE [--out FILE] | --selftest'); process.exit(2); }
  const analysis = JSON.parse(fs.readFileSync(analysisFile, 'utf8'));
  const result = {
    armPair: classify(analysis.armPairMeetings || []),
    ctlPair: classify(analysis.ctlPairMeetings || []),
    armTrio: classify(analysis.armMeetings || []),
    ctlTrio: classify(analysis.ctlMeetings || []),
  };
  console.log(JSON.stringify({ armPair: { total: result.armPair.total, counts: result.armPair.counts, fullyClassified: result.armPair.fullyClassified },
    ctlPair: { total: result.ctlPair.total, counts: result.ctlPair.counts, fullyClassified: result.ctlPair.fullyClassified } }, null, 2));
  if (outFile) fs.writeFileSync(outFile, JSON.stringify(result, null, 2) + '\n');
}
module.exports = { classifyMeeting: classifyMeeting, classify: classify };
