// analyze-wilddeath-b.js — classify fed-at-home "wild" player deaths.
//
// Reads a sweep-wilddeath-b.js corpus and, for every player death whose
// tele cause is 'the wild', joins it to (a) the playerDeath wrapper
// capture (raw arg + stack + death-moment snapshot), (b) the last
// pre-death day-end for the same scholarKey (place + food state), and
// (c) the fallen / corpse records for the same villager + day.
//
// Classification (fixed by the prereg, not revised here):
//   WILD-FIGHT   raw arg 'the wild' + tbEnd in stack + live fight with
//                >=1 monster fighter and no hostile fighter.
//   FALLBACK     raw arg falsy, tele cause 'the wild' (ledger fallback).
//   WILD-UNCONFIRMED  raw arg 'the wild' but stack/fight do not prove
//                a wild fight (arg alone is never proof).
//   OTHER-NAMED  raw arg names something else but tele reads 'the wild'
//                (a recording mismatch).
//   UNRESOLVED   no wrapper capture for this tele death (tele-only:
//                the tele string is the question, never the answer).
//
// Fed-at-home (prereg definition): last pre-death day-end for the
// dying scholarKey shows away===false AND kcal >= 1000.
//
// Usage: node scripts/analyze-wilddeath-b.js <sweep.json> [out.json]
// Exit 0 always (verdicts are data, not process failure); the JSON
// carries verdict: DIAG-GO | DIAG-NO-GO | NO-INSTANCE.
'use strict';
const fs = require('fs');

function stackHasTbEnd(stack) {
  return Array.isArray(stack) && stack.some(l => /tbEnd/.test(l));
}
function stackCaller(stack) {
  if (!Array.isArray(stack)) return null;
  const hit = stack.find(l => /src\/js\//.test(l) || /tbEnd|playerDeath|resolveDay|hurtVillager|encScholarDeathGate/.test(l));
  return hit || stack[0] || null;
}

function lastPreDeathDayEnd(row, who, deathDay) {
  const ends = (row.dayEnds || []).filter(e => e.scholarKey === who);
  let before = null;
  for (const e of ends) { if (e.d < deathDay) before = e; }
  if (before) return before;
  for (const e of ends) { if (e.d === deathDay) before = e; }
  return before;
}

function classifyWildDeath(row, death) {
  const caps = (row.deathCaptures || []).filter(c => c.snap && c.snap.scholarKey === death.who && c.snap.day === death.day);
  const cap = caps[0] || null;
  const pre = lastPreDeathDayEnd(row, death.who, death.day);
  const fedAtHome = !!(pre && pre.away === false && (pre.kcal || 0) >= 1000);
  const fallen = (row.fallen || []).filter(f => f.villagerId === death.who && f.day === death.day);
  const corpses = (row.corpses || []).filter(c => c.villagerId === death.who && c.dayDied === death.day);
  const deathLine = cap ? (cap.sayTail || []).filter(s => /is dead/.test(s.line)).slice(-1)[0] || null : null;
  // The death line itself is said INSIDE the original playerDeath call,
  // after the pre-death snapshot — the wrapper's post-call tail carries
  // it; the row's full say-lines are a fallback for the death day.
  const postDeathLine = cap ? (cap.postSayTail || []).filter(s => /is dead —/.test(s.line)).slice(-1)[0]
    || (cap.postSayTail || []).filter(s => /is dead/.test(s.line)).slice(-1)[0] || null : null;
  const rowDeathLine = (row.sayLines || []).filter(s => s.d === death.day && /is dead/.test(s.line)).slice(-1)[0] || null;
  if (!cap) {
    return { seed: row.seed, death, fedAtHome, preDayEnd: pre, class: 'UNRESOLVED',
      reason: 'no playerDeath wrapper capture for this tele death (tele-only evidence)', fallen, corpses, deathLine: rowDeathLine };
  }
  const snap = cap.snap || {};
  const fight = snap.fight || {};
  const fighters = fight.fighters || [];
  const hasMonster = fighters.some(f => f.kind === 'monster');
  const hasHostile = fighters.some(f => f.kind === 'hostile');
  const atHaven = snap.atHaven === true || snap.tileType === 'haven' || (Array.isArray(snap.tile) && snap.tile[0] === 4 && snap.tile[1] === 4);
  let cls, reason;
  if (cap.rawArg === null || cap.rawArg === undefined || cap.rawArg === '') {
    cls = 'FALLBACK'; reason = 'playerDeath called with falsy cause; ledger fallback wrote the wild';
  } else if (cap.rawArg === 'the wild' && stackHasTbEnd(cap.stack) && fight.live && hasMonster && !hasHostile) {
    cls = 'WILD-FIGHT'; reason = 'tbEnd wild-fight loss: monster fighter(s), no hostile fighter';
  } else if (cap.rawArg === 'the wild') {
    cls = 'WILD-UNCONFIRMED'; reason = 'raw arg is the wild but stack/fight do not prove a wild fight';
  } else if (cap.rawArg !== death.cause) {
    cls = 'OTHER-NAMED'; reason = 'raw arg names another cause but tele reads the wild (recording mismatch)';
  } else {
    cls = 'OTHER-NAMED'; reason = 'raw arg names another cause; death is not a wild death by trace';
  }
  return { seed: row.seed, death, fedAtHome, preDayEnd: pre, class: cls, reason,
    rawArg: cap.rawArg, stackCaller: stackCaller(cap.stack), stack: cap.stack,
    snap, fallen, corpses, deathLine: (postDeathLine || rowDeathLine || deathLine),
    locationMisleading: (cls === 'WILD-FIGHT' && atHaven),
    hurtTail: cap.hurtTail || [] };
}

function analyze(corpus) {
  const rows = corpus.rows || [];
  const wild = [];
  const census = {};
  let national = 0, table = 0, wins = 0, survivedDays = [];
  for (const row of rows) {
    if (row.nationalLive) national++;
    if (row.tableEntered) table++;
    if (row.won) wins++;
    if (typeof row.days === 'number') survivedDays.push(row.days);
    for (const d of (row.deaths || [])) {
      if (!d.player) continue;
      census[d.cause] = (census[d.cause] || 0) + 1;
      if (d.cause === 'the wild') wild.push(classifyWildDeath(row, d));
    }
  }
  survivedDays.sort((a, b) => a - b);
  const median = survivedDays.length ? survivedDays[Math.floor(survivedDays.length / 2)] : null;
  const fedAtHomeWild = wild.filter(w => w.fedAtHome);
  const attributed = fedAtHomeWild.filter(w => w.class === 'WILD-FIGHT' || w.class === 'FALLBACK');
  let verdict;
  if (attributed.length >= 1) verdict = 'DIAG-GO';
  else if (fedAtHomeWild.length >= 1) verdict = 'DIAG-NO-GO';
  else verdict = 'NO-INSTANCE';
  return {
    meta: corpus.meta || {},
    wall: { seeds: rows.length, national, table, wins, medianSurvival: median,
      maxWave: rows.reduce((m, r) => Math.max(m, r.maxWave || 1), 1),
      waveCounts: rows.reduce((o, r) => { const w = r.maxWave || 1; o[w] = (o[w] || 0) + 1; return o; }, {}) },
    playerDeathCensus: census,
    wildDeaths: wild,
    fedAtHomeWildCount: fedAtHomeWild.length,
    attributedCount: attributed.length,
    verdict,
  };
}

if (require.main === module) {
  const inPath = process.argv[2];
  if (!inPath) { console.error('usage: node scripts/analyze-wilddeath-b.js <sweep.json> [out.json]'); process.exit(2); }
  const corpus = JSON.parse(fs.readFileSync(inPath, 'utf8'));
  const out = analyze(corpus);
  console.log(JSON.stringify(out, null, 1));
  if (process.argv[3]) fs.writeFileSync(process.argv[3], JSON.stringify(out, null, 1));
}
module.exports = { analyze, classifyWildDeath, lastPreDeathDayEnd };
