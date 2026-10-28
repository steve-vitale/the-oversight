#!/usr/bin/env node
// scripts/test-retreatdiag-a.js — sim-retreatdiag-a analyzer / census judge.
// DIAGNOSIS ONLY: pure reads of predecessor corpora, never game state.
// Reads:
//   evidence/2026-10-28/perseed-shoutgate-a/s<seed>-armed.json
//     (fieldparty.meetings; judged set + FORMED def VERBATIM from
//     scripts/test-shoutgate-a.js)
//   evidence/2026-10-28/perseed-fieldfeed-a/s<seed>-armed.json
//     (fieldfeed.meetings; judged set + FORMED def VERBATIM from
//     scripts/test-fieldfeed-a-analyze.js)
// Classifies every formed party's retreat trigger (prereg Q1) and
// computes stay-to-kill math at observed rates (prereg Q2).
// Exit 1 on corpus invalidity, on any OTHER (unclassified) party, or
// on stay-to-kill coverage < 80%. The DIAG-GO verdict additionally
// requires the sense transcripts + ranked lever in the evidence file
// (not checkable here); this script prints the three machine legs.
// Usage: node scripts/test-retreatdiag-a.js [--out <path>]
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const SEEDS = [75101, 75102, 75103, 75104, 75105, 75106, 75107, 75108];

function loadCorpus(dir, pid, meetingsKey, diagKey) {
  const rows = []; const problems = [];
  for (const seed of SEEDS) {
    const p = path.join(REPO, 'evidence', '2026-10-28', dir, `s${seed}-${pid}.json`);
    if (!fs.existsSync(p)) { problems.push(`missing ${dir}/s${seed}-${pid}.json`); continue; }
    const r = JSON.parse(fs.readFileSync(p, 'utf8'));
    rows.push(r);
    const store = r[meetingsKey];
    if (!store || !Array.isArray(store.meetings)) problems.push(`seed ${seed} (${dir}): no ${meetingsKey}.meetings`);
    else if (diagKey && store.diag) {
      if (store.diag.errs !== 0) problems.push(`seed ${seed} (${dir}): recorder errs=${store.diag.errs}`);
      if (Object.values(store.diag.overflow || {}).some(v => (v | 0) !== 0)) problems.push(`seed ${seed} (${dir}): recorder overflow`);
    }
    if (!(r.days > 0)) problems.push(`seed ${seed} (${dir}): days<=0`);
  }
  return { rows, problems };
}
function medianOf(arr) {
  const s = arr.filter(Number.isFinite).sort((a, b) => a - b);
  if (!s.length) return null;
  return s[Math.floor(s.length / 2)];
}
function meanOf(arr) {
  const s = arr.filter(Number.isFinite);
  return s.length ? s.reduce((t, v) => t + v, 0) / s.length : null;
}
function round1(v) { return (v === null || v === undefined || !Number.isFinite(v)) ? null : Math.round(v * 10) / 10; }

// Trigger classes, in code order (fieldFights.js morale block).
function classifyTrigger(m) {
  if (m.outcome === 'vDie') return 'DEATH';
  if (m.outcome === 'vKill' || m.outcome === 'mFlee') return 'NON-RETREATING';
  if (m.fleeLearn) return 'LEARN-WITHDRAWAL';
  if (m.outcome === 'vFlee' && m.fleeHopeless === true) return 'HOPELESS-REFIRE';
  if (m.outcome === 'vFlee' && m.fleeHopeless === false) return 'HP-FLOOR';
  if (m.outcome === 'vFlee' && m.fleeHopeless === null && (m.rounds | 0) >= 15) return 'ROUND-CAP';
  return 'OTHER';
}
function allyArmor(m, allyVid) {
  const pools = [];
  if (Array.isArray(m.crew)) pools.push(...m.crew);
  if (Array.isArray(m.earshot)) pools.push(...m.earshot);
  if (Array.isArray(m.tile)) pools.push(...m.tile);
  const hit = pools.find(e => e && e.vid === allyVid);
  return hit ? { armed: hit.armed === true, armorP: (hit.armorP === undefined ? null : hit.armorP) } : { armed: null, armorP: null };
}
function analyzeParty(source, seed, m) {
  const rounds = m.rounds | 0;
  const mDealt = m.mDealt | 0, vTaken = m.vTaken | 0;
  const allyDealt = m.allyDealt | 0, allyTaken = m.allyTaken | 0;
  const mHpStart = m.mHpStart | 0, mHpLeft = m.mHpLeft | 0;
  const partyDPR = rounds > 0 ? mDealt / rounds : null;
  const killRounds = (partyDPR !== null && partyDPR > 0) ? mHpStart / partyDPR : (partyDPR === 0 ? Infinity : null);
  const driveOffRounds = (partyDPR !== null && partyDPR > 0) ? (0.85 * mHpStart) / partyDPR : (partyDPR === 0 ? Infinity : null);
  const remainingAtFlee = (partyDPR !== null && partyDPR > 0) ? mHpLeft / partyDPR : (partyDPR === 0 ? Infinity : null);
  const monsterDPR = rounds > 0 ? (vTaken + allyTaken) / rounds : null;
  const leaderDPR = rounds > 0 ? (mDealt - allyDealt) / rounds : null;
  const aa = allyArmor(m, m.joinedAllyVid);
  const quantified = rounds > 0 && Number.isFinite(mHpStart) && Number.isFinite(mDealt);
  return {
    source, seed, day: m.day, leader: m.vid, ally: m.joinedAllyVid || null,
    mid: m.mid || null, caller: m.caller || null, outcome: m.outcome || null,
    rounds, mHpStart, mHpLeft, mDealt, vTaken, allyDealt, allyTaken,
    trigger: classifyTrigger(m), struck: allyDealt > 0,
    everHopeless: !!m.everHopeless, everWinning: !!m.everWinning,
    intent: m.intent || null, intentWhy: m.intentWhy || null,
    leaderArmed: !!(m.leader && m.leader.armed), leaderArmorP: (m.leader ? (m.leader.armorP ?? null) : null),
    allyArmed: aa.armed, allyArmorP: aa.armorP,
    partyDPR: round1(partyDPR), leaderDPR: round1(leaderDPR), monsterDPR: round1(monsterDPR),
    killRounds: (killRounds === Infinity ? 'inf' : round1(killRounds)),
    driveOffRounds: (driveOffRounds === Infinity ? 'inf' : round1(driveOffRounds)),
    remainingAtFlee: (remainingAtFlee === Infinity ? 'inf' : round1(remainingAtFlee)),
    _killRoundsNum: killRounds, _driveOffNum: driveOffRounds, _partyDPRNum: partyDPR,
    quantified,
  };
}
function main() {
  const sg = loadCorpus('perseed-shoutgate-a', 'armed', 'fieldparty', true);
  const ff = loadCorpus('perseed-fieldfeed-a', 'armed', 'fieldfeed', false);
  const problems = [...sg.problems, ...ff.problems];
  const corpusOk = problems.length === 0 && sg.rows.length === 8 && ff.rows.length === 8;
  // Shoutgate judged set + FORMED, verbatim from test-shoutgate-a.js.
  const sgMeetings = [];
  for (const r of sg.rows) for (const m of ((r.fieldparty || {}).meetings || [])) sgMeetings.push(Object.assign({ seed: r.seed }, m));
  const sgJudged = sgMeetings.filter(m => (m.wave | 0) === 4 && m.channel === 'field'
    && ['resolve', 'patrol', 'aid'].indexOf(m.caller) >= 0 && !(m.leader && m.leader.isScholar));
  const sgCrewOf = (m) => ((m.crewRaw || []).filter(v => v !== m.vid));
  const sgFormed = sgJudged.filter(m => sgCrewOf(m).length > 0 && (m.calledHelp || m.joinedAllyVid));
  // Fieldfeed judged set + FORMED, verbatim from test-fieldfeed-a-analyze.js.
  const ffMeetings = [];
  for (const r of ff.rows) for (const m of ((r.fieldfeed || {}).meetings || [])) ffMeetings.push(Object.assign({ seed: r.seed }, m));
  const ffJudged = ffMeetings.filter(m => m && m.wave === 4 && (m.caller === 'resolve' || m.caller === 'patrol')
    && m.channel === 'field' && !(m.leader && m.leader.isScholar));
  const ffFormed = ffJudged.filter(m => m.calledHelp && m.joinedAllyVid);
  const parties = [
    ...sgFormed.map(m => analyzeParty('shoutgate-armed', m.seed, m)),
    ...ffFormed.map(m => analyzeParty('fieldfeed-pilot', m.seed, m)),
  ];
  const triggers = {};
  for (const p of parties) triggers[p.trigger] = (triggers[p.trigger] || 0) + 1;
  const other = parties.filter(p => p.trigger === 'OTHER');
  const quantified = parties.filter(p => p.quantified);
  const finiteKill = parties.filter(p => Number.isFinite(p._killRoundsNum));
  const overCapKill = parties.filter(p => p._killRoundsNum === Infinity || p._killRoundsNum > 15);
  const overCapDrive = parties.filter(p => p._driveOffNum === Infinity || p._driveOffNum > 15);
  const inBand = parties.filter(p => p.mHpStart >= 850 && p.mHpStart <= 1500);
  const struck = parties.filter(p => p.struck);
  console.log('=== sim-retreatdiag-a analyzer ===');
  console.log(`corpus: shoutgate rows=${sg.rows.length}/8 fieldfeed rows=${ff.rows.length}/8 ok=${corpusOk} ${problems.join('; ')}`);
  console.log(`judged: shoutgate=${sgJudged.length} formed=${sgFormed.length} | fieldfeed=${ffJudged.length} formed=${ffFormed.length} | TOTAL FORMED=${parties.length}`);
  console.log(`TRIGGERS: ${JSON.stringify(triggers)}`);
  console.log(`CLASSIFICATION: ${parties.length} parties, OTHER=${other.length} ${other.length === 0 ? 'PASS (100%)' : 'FAIL'}`);
  console.log(`STRUCK: ${struck.length}/${parties.length} allyDealt>0; UNSTRUCK: ${parties.length - struck.length}`);
  console.log(`STAY-TO-KILL: quantified=${quantified.length}/${parties.length} (${parties.length ? Math.round(100 * quantified.length / parties.length) : 0}%, bar>=80% ${quantified.length >= 0.8 * parties.length ? 'PASS' : 'FAIL'})`);
  console.log(`  partyDPR median=${round1(medianOf(parties.map(p => p._partyDPRNum)))} mean=${round1(meanOf(parties.map(p => p._partyDPRNum)))} range=[${Math.min(...parties.map(p => p._partyDPRNum))}, ${Math.max(...parties.map(p => p._partyDPRNum))}]`);
  console.log(`  killRounds median(finite)=${round1(medianOf(finiteKill.map(p => p._killRoundsNum)))} mean(finite)=${round1(meanOf(finiteKill.map(p => p._killRoundsNum)))} overCap(>15 or inf)=${overCapKill.length}/${parties.length}`);
  console.log(`  driveOffRounds median(finite)=${round1(medianOf(parties.filter(p => Number.isFinite(p._driveOffNum)).map(p => p._driveOffNum)))} overCap=${overCapDrive.length}/${parties.length}`);
  console.log(`  monsterDPR median=${round1(medianOf(parties.map(p => (p.vTaken + p.allyTaken) / Math.max(1, p.rounds))))}`);
  console.log(`  mHpStart in 850-1500 band: ${inBand.length}/${parties.length}; mHpStart range=[${Math.min(...parties.map(p => p.mHpStart))}, ${Math.max(...parties.map(p => p.mHpStart))}]`);
  console.log(`  outcomes: ${JSON.stringify(parties.reduce((a, p) => { a[p.outcome] = (a[p.outcome] || 0) + 1; return a; }, {}))}`);
  console.log(`  rounds: ${JSON.stringify(parties.reduce((a, p) => { a[p.rounds] = (a[p.rounds] || 0) + 1; return a; }, {}))}`);
  console.log(`  leaders armed: ${parties.filter(p => p.leaderArmed).length}/${parties.length}; allies armed-known: ${parties.filter(p => p.allyArmed === true).length}, unknown: ${parties.filter(p => p.allyArmed === null).length}`);
  console.log('PER-PARTY:');
  for (const p of parties) {
    console.log(`  [${p.source}] s${p.seed} d${p.day} ${p.leader} + ${p.ally} vs ${p.mid} (${p.caller}) hp=${p.mHpStart}->${p.mHpLeft} out=${p.outcome} r=${p.rounds} trig=${p.trigger} struck=${p.struck} partyDPR=${p.partyDPR} killR=${p.killRounds} driveR=${p.driveOffRounds} leftR=${p.remainingAtFlee} monDPR=${p.monsterDPR} mDealt=${p.mDealt} vTaken=${p.vTaken} allyDealt=${p.allyDealt} allyTaken=${p.allyTaken} leadArm=${p.leaderArmorP} allyArm=${p.allyArmorP}`);
  }
  const outIdx = process.argv.indexOf('--out');
  if (outIdx >= 0 && process.argv[outIdx + 1]) {
    fs.mkdirSync(path.dirname(process.argv[outIdx + 1]), { recursive: true });
    fs.writeFileSync(process.argv[outIdx + 1], JSON.stringify({ parties, triggers, corpusOk, judged: { shoutgate: sgJudged.length, fieldfeed: ffJudged.length } }, null, 1) + '\n');
    console.log(`wrote ${process.argv[outIdx + 1]}`);
  }
  if (!corpusOk) { console.log('CENSUS: FAIL (corpus invalid)'); process.exit(1); }
  if (other.length > 0) { console.log('CLASSIFICATION: FAIL (unclassified parties)'); process.exit(1); }
  if (quantified.length < 0.8 * parties.length) { console.log('STAY-TO-KILL: FAIL (coverage < 80%)'); process.exit(1); }
  console.log('MACHINE LEGS: classification PASS, stay-to-kill PASS, census PASS (sense + ranked lever live in evidence)');
}
main();
