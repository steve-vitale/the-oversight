#!/usr/bin/env node
// herald-analyze-20261030.js — band summary for sim-herald-b per-seed JSONs.
// Usage: node scripts/herald-analyze-20261030.js [per-seed-dir]
// Prints a JSON summary to stdout (band totals, refusal rates by class,
// corrected fought-only numbers, re-attempt table, cross-checks, wall).
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const dir = process.argv[2] || path.join(REPO, 'evidence', '2026-10-31', 'perseed-herald', 'leadfeast');
const files = fs.readdirSync(dir).filter(f => /^s\d+\.json$/.test(f)).sort();
const seeds = files.map(f => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));

function countBy(arr, fn) {
  const m = {};
  arr.forEach(x => { const k = fn(x); m[k] = (m[k] || 0) + 1; });
  return m;
}
function median(xs) {
  if (!xs.length) return null;
  const s = xs.slice().sort((a, b) => a - b);
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
}

const allAtt = [], allFF = [], allKills = [], allMuster = [];
let errs = 0, usableSeeds = 0;
const perSeed = [];
for (const s of seeds) {
  if ((s.instrumentErrors || []).length) errs += s.instrumentErrors.length; else usableSeeds++;
  perSeed.push({
    seed: s.seed, days: s.gameDays, won: s.won, national: s.national, table: s.table,
    maxWave: s.maxWave, w4Day: s.w4Day, w5Day: s.w5Day, endReason: s.endReason,
    att4: (s.attempts || []).length,
    attFought: (s.attempts || []).filter(a => a.cls === 'FOUGHT').length,
    attRefused: (s.attempts || []).filter(a => a.cls === 'REFUSED').length,
    attThrow: (s.attempts || []).filter(a => a.cls === 'THROW').length,
    heraldAtt: (s.attempts || []).filter(a => a.mid === 'herald').length,
    heraldRefused: (s.attempts || []).filter(a => a.mid === 'herald' && a.cls === 'REFUSED').length,
    ff4: (s.fieldFights || []).length, kills4: (s.kills || []).length,
    errs: (s.instrumentErrors || []).length,
  });
  (s.attempts || []).forEach(a => allAtt.push(Object.assign({ seed: s.seed }, a)));
  (s.fieldFights || []).forEach(f => allFF.push(Object.assign({ seed: s.seed }, f)));
  (s.kills || []).forEach(k => allKills.push(Object.assign({ seed: s.seed }, k)));
  (s.musterEvents || []).forEach(m => allMuster.push(Object.assign({ seed: s.seed }, m)));
}

const att4 = allAtt;
const fought = att4.filter(a => a.cls === 'FOUGHT');
const refused = att4.filter(a => a.cls === 'REFUSED');
const thrown = att4.filter(a => a.cls === 'THROW');
const herald = att4.filter(a => a.mid === 'herald');
const heraldFought = herald.filter(a => a.cls === 'FOUGHT');
const heraldRefused = herald.filter(a => a.cls === 'REFUSED');
const nonTitan = att4.filter(a => !a.titan);
const titanNonHerald = att4.filter(a => a.titan && a.mid !== 'herald');
function rate(arr) {
  const f = arr.filter(a => a.cls === 'FOUGHT').length;
  const r = arr.filter(a => a.cls === 'REFUSED').length;
  return { attempts: arr.length, fought: f, refused: r, throws: arr.filter(a => a.cls === 'THROW').length, refusalRate: (f + r) ? r / (f + r) : null };
}

// Cross-check (i): fought attempts carrying a tbEnd result.
const foughtWithEnd = fought.filter(a => a.end !== null && a.end !== undefined).length;
// Cross-check (ii): game-side refused records (multiset by titan|day).
const gameRef = {}, attRef = {};
for (const a of att4) {
  (a.gameOutcomes || []).forEach(rec => {
    if (rec && rec.outcome === 'refused') { const k = rec.titan + '|' + rec.day; gameRef[k] = (gameRef[k] || 0) + 1; }
  });
  if (a.cls === 'REFUSED' && a.titan) { const k = a.mid + '|' + a.day; attRef[k] = (attRef[k] || 0) + 1; }
}
let gameRefTotal = 0, gameRefMatched = 0;
for (const k of Object.keys(gameRef)) { gameRefTotal += gameRef[k]; gameRefMatched += Math.min(gameRef[k], attRef[k] || 0); }

// Field fought-only numbers.
const ffFought = allFF.filter(f => f.outcome !== 'evade' && f.outcome !== 'unresolved' && f.outcome !== 'alreadyDead');
const ffEvade = allFF.filter(f => f.outcome === 'evade');
const ffByOutcome = countBy(allFF, f => f.outcome);
const ffHerald = allFF.filter(f => f.mid === 'herald');
// TB fought outcomes.
const tbEndBy = countBy(fought, a => a.end || 'null');
// Re-attempt table per seed x titan.
const reAttempts = [];
{
  const groups = {};
  att4.forEach(a => { if (!a.titan) return; const k = a.seed + '|' + a.mid; (groups[k] = groups[k] || []).push(a); });
  for (const k of Object.keys(groups)) {
    const rows = groups[k].slice().sort((a, b) => a.day - b.day);
    const ref = rows.filter(a => a.cls === 'REFUSED');
    const days = rows.map(a => a.day);
    const gaps = [];
    for (let i = 1; i < rows.length; i++) gaps.push(rows[i].day - rows[i - 1].day);
    const perDay = countBy(rows, a => a.day);
    const maxPerDay = Math.max.apply(null, Object.keys(perDay).map(d => perDay[d]));
    const seedN = rows[0].seed, midN = rows[0].mid;
    const musterBetween = allMuster.filter(m => m.seed === seedN && m.titan === midN && ref.length && m.day >= ref[0].day && m.day <= ref[ref.length - 1].day);
    const lastMuster = rows[rows.length - 1].muster;
    reAttempts.push({
      seed: seedN, mid: midN, attempts: rows.length, refused: ref.length, fought: rows.filter(a => a.cls === 'FOUGHT').length,
      firstDay: days[0], lastDay: days[days.length - 1], span: days[days.length - 1] - days[0],
      maxPerDay, medianGap: median(gaps), callers: countBy(rows, a => a.caller),
      reasons: countBy(ref, a => a.reason), musterEventsBetween: musterBetween.length,
      musterEventKinds: countBy(musterBetween, m => m.kind),
      lastMusterProxy: lastMuster, everFought: rows.some(a => a.cls === 'FOUGHT'),
      pendingSurvivedRefusals: ref.filter(a => a.pendingAfter).length,
    });
  }
  reAttempts.sort((a, b) => b.attempts - a.attempts);
}

const wall = {
  seeds: seeds.length, usableSeeds, national: seeds.filter(s => s.national).length,
  table: seeds.filter(s => s.table).length, wins: seeds.filter(s => s.won).length,
  wave4Unlocked: seeds.filter(s => s.maxWave >= 4).length, wave5Unlocked: seeds.filter(s => s.maxWave >= 5).length,
  medianSurvival: median(seeds.map(s => s.gameDays)), maxSurvival: Math.max.apply(null, seeds.map(s => s.gameDays)),
  endReasons: countBy(seeds, s => s.endReason),
};

const summary = {
  band: { seeds: seeds.length, usableSeeds, instrumentErrors: errs },
  wall,
  startCombat: {
    overall: rate(att4),
    byMid: (() => { const m = {}; att4.forEach(a => { (m[a.mid] = m[a.mid] || []).push(a); }); const o = {}; for (const k of Object.keys(m)) o[k] = rate(m[k]); return o; })(),
    herald: rate(herald),
    heraldicAggression: rate(att4.filter(a => a.aggression === 'heraldic')),
    nonTitan: rate(nonTitan),
    titanNonHerald: rate(titanNonHerald),
    byCaller: (() => { const m = {}; att4.forEach(a => { (m[a.caller] = m[a.caller] || []).push(a); }); const o = {}; for (const k of Object.keys(m)) o[k] = rate(m[k]); return o; })(),
    byReason: countBy(refused, a => a.reason),
    byReasonHerald: countBy(heraldRefused, a => a.reason),
    throws: thrown.map(a => ({ seed: a.seed, day: a.day, mid: a.mid, reason: a.reason })),
    tbFoughtEndOutcomes: tbEndBy,
  },
  completeness: {
    classified: fought.length + refused.length, total: att4.length,
    completeness: att4.length ? (fought.length + refused.length) / att4.length : null,
    crosscheckTbEndJoin: fought.length ? foughtWithEnd / fought.length : null,
    foughtWithEnd, foughtTotal: fought.length,
    crosscheckGameRefusedMatch: gameRefTotal ? gameRefMatched / gameRefTotal : null,
    gameRefusedTotal: gameRefTotal, gameRefusedMatched: gameRefMatched,
  },
  corrected: {
    tbNaiveAttempts: att4.length, tbFoughtOnly: fought.length,
    tbKillProxyWon: fought.filter(a => a.end === 'won').length,
    fieldMeetingsTotal: allFF.length, fieldEvades: ffEvade.length, fieldFoughtOnly: ffFought.length,
    fieldByOutcome: ffByOutcome,
    fieldHerald: { total: ffHerald.length, byOutcome: countBy(ffHerald, f => f.outcome) },
    combinedFoughtMeetings: fought.length + ffFought.length,
    kills4: allKills, kills4Count: allKills.length,
    fieldKills: allFF.filter(f => f.outcome === 'vKill').length,
  },
  reAttempts,
  perSeed,
};
console.log(JSON.stringify(summary, null, 1));
