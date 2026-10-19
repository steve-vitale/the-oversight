#!/usr/bin/env node
// analyze-w5path-20261019.js — stall-point attribution for the sim-w5census
// wave-5 unlock-path census.
//
// Reads evidence/2026-10-19/perseed-w5path/<policy>/s<seed>.json and, per
// run, derives from the daily path series:
//   - stallClass: unlocked | engaged-but-failed | progressed-but-stalled |
//     never-progressed (pre-registered definitions; mutually exclusive and
//     exhaustive by construction — every run classifies).
//   - attempts: maximal contiguous deferral(5)-true windows with outcomes
//     released | died | won | horizon | regressed.
//   - standing by source (terminal + first-t4/t5 days), wave-4 ledger
//     points, wave-4 kill anatomy (via split), readiness-bar state at the
//     stall point, deed-gate bars.
//   - wall numbers: national/table/wins/wave-4/wave-5/median survival.
//
// Writes: evidence/2026-10-19/w5path-corpus-summary.json and
//         evidence/2026-10-19/w5path-stall-attribution.md
// Usage: node scripts/analyze-w5path-20261019.js
'use strict';
const fs = require('fs');
const path = require('path');

const EVID = path.join(__dirname, '..', 'evidence', '2026-10-19', 'perseed-w5path');
const OUTD = path.join(__dirname, '..', 'evidence', '2026-10-19');

// Stall-point classification (pre-registered — the w5 door is
// standingDeferral(5); the classes form a strict path ladder).
function classify(rec) {
  const recs = rec.recs || [];
  let maxPeak = 0, def5ever = false, firstDef5Day = null, peak4Day = null;
  for (const r of recs) {
    if ((r.peak | 0) > maxPeak) maxPeak = r.peak | 0;
    if ((r.peak | 0) >= 4 && peak4Day == null) peak4Day = r.d;
    if (r.def5 && !def5ever) { def5ever = true; firstDef5Day = r.d; }
  }
  const endPeak = (rec.endRec && (rec.endRec.peak | 0)) || 0;
  if (endPeak > maxPeak) maxPeak = endPeak;
  const unlocked = maxPeak >= 5 || (rec.wave5Day != null);
  let stallClass, stallSub = null;
  if (unlocked) stallClass = 'unlocked';
  else if (def5ever) {
    stallClass = 'engaged-but-failed';
    if (maxPeak < 4) stallSub = 'w5door-without-w4'; // stood at the w5 door on standing alone; the w4 door was the real bind
  }
  else if (maxPeak >= 4) stallClass = 'progressed-but-stalled';
  else stallClass = 'never-progressed';
  return { stallClass, stallSub, maxPeak, def5ever, firstDef5Day, peak4Day, unlocked: !!unlocked };
}

// Wave-5 unlock attempts: maximal contiguous deferral(5)-true windows.
function attemptsOf(rec) {
  const recs = (rec.recs || []).slice();
  // The daily hook's last record can lag run end by a day; the endRec is
  // the terminal observation. Without it, a window open at run end reads
  // as 'regressed' (s63708/s63713) or a death-day deferral reads as
  // 'regressed' instead of 'died' (s63711).
  if (rec.endRec && recs.length && (rec.endRec.d | 0) > (recs[recs.length - 1].d | 0)) recs.push(rec.endRec);
  const wins = [];
  let cur = null;
  for (const r of recs) {
    if (r.def5) {
      if (!cur) cur = { start: r.d, end: r.d, shortStart: (r.r5 && r.r5.short || []).slice() };
      else { cur.end = r.d; cur.shortEnd = (r.r5 && r.r5.short || []).slice(); }
    } else if (cur) { wins.push(cur); cur = null; }
  }
  if (cur) wins.push(cur);
  const endKind = rec.won ? 'won'
    : (rec.endReason === 'village-lost' || rec.endReason === 'pop-zero') ? 'died'
    : (rec.gameDays >= 180 || rec.endReason === 'survived') ? 'horizon' : 'died';
  const gameDays = rec.gameDays || 0;
  for (const w of wins) {
    if (rec.wave5Day != null && w.start <= rec.wave5Day && rec.wave5Day <= w.end + 1) w.outcome = 'released';
    else if (w.end >= gameDays) w.outcome = endKind === 'won' ? 'won' : endKind === 'horizon' ? 'horizon' : 'died';
    else w.outcome = 'regressed'; // deferred ended while alive+unwon: capped standing fell below t5
    w.len = w.end - w.start + 1;
  }
  return wins;
}

function attribute(rec) {
  const c = classify(rec);
  const recs = rec.recs || [];
  const end = rec.endRec || {};
  const att = {
    seed: rec.seed, policyId: rec.policyId,
    stallClass: c.stallClass, stallSub: c.stallSub,
    maxPeak: c.maxPeak, def5ever: c.def5ever, firstDef5Day: c.firstDef5Day,
    wave4Day: rec.wave4Day, wave5Day: rec.wave5Day,
    endDay: rec.gameDays, endReason: rec.endReason, won: !!rec.won,
    national: !!rec.national, table: !!rec.table, exiled: !!rec.exiled,
    maxWave: rec.maxWave,
    attempts: attemptsOf(rec),
    // Standing by source: terminal + first-t4/t5-raw days.
    standing: {
      termRaw: end.raw, termWar: end.war, termDip: end.dip, termPlenty: end.plenty,
      termCap: end.cap, warPts: end.warPts, links: end.links, feasts: end.feasts,
      firstT4Day: null, firstT5Day: null,
    },
    // Wave-4 ledger points + kill anatomy (terminal).
    w4: { ledgerPts: end.l4, kills: end.w4k, distinct: end.w4d, killers: end.w4killers, via: end.w4via },
    w3ledgerPts: end.l3,
    // Readiness-bar state at the stall point (terminal).
    r5term: end.r5 ? { arm: end.r5.arm, wpn: end.r5.wpn, trk: end.r5.trk, vet: end.r5.vet, short: end.r5.short, rdy: end.r5.rdy } : null,
    r4term: end.r4 ? { arm: end.r4.arm, wpn: end.r4.wpn, trk: end.r4.trk, vet: end.r4.vet, short: end.r4.short, rdy: end.r4.rdy } : null,
    deed: end.deed || null,
  };
  for (const r of recs) {
    if (att.standing.firstT4Day == null && (r.raw | 0) >= 100) att.standing.firstT4Day = r.d;
    if (att.standing.firstT5Day == null && (r.raw | 0) >= 200) att.standing.firstT5Day = r.d;
  }
  return att;
}

function main() {
  const atts = [];
  for (const policyId of ['leadfeast', 'belongfeast']) {
    const dir = path.join(EVID, policyId);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort()) {
      const rec = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
      atts.push(attribute(rec));
    }
  }
  // Corpus summary.
  const n = atts.length;
  const cls = {};
  for (const a of atts) cls[a.stallClass] = (cls[a.stallClass] || 0) + 1;
  const agg = (f) => atts.filter(f).length;
  const surv = atts.map(a => a.endDay).sort((a, b) => a - b);
  const median = surv.length ? surv[Math.floor(surv.length / 2)] : 0;
  const attWins = [];
  for (const a of atts) for (const w of a.attempts) attWins.push({ seed: a.seed, policy: a.policyId, cls: a.stallClass, ...w });
  const outcomes = {};
  for (const w of attWins) outcomes[w.outcome] = (outcomes[w.outcome] || 0) + 1;
  const summary = {
    n,
    stallClasses: cls,
    attribution: `${n}/${n} classified`,
    wall: {
      national: agg(a => a.national), table: agg(a => a.table), wins: agg(a => a.won),
      wave4: agg(a => a.maxWave >= 4), wave5: agg(a => a.wave5Day != null),
      medianSurvival: median, exiled: agg(a => a.exiled),
    },
    attempts: { total: attWins.length, outcomes, runsWithAttempts: agg(a => a.attempts.length > 0) },
    // Standing-source means at terminal (across runs that reached the door).
    standingMeans: null,
  };
  const doorRuns = atts.filter(a => a.stallClass === 'engaged-but-failed' || a.stallClass === 'unlocked');
  if (doorRuns.length) {
    const m = (f) => doorRuns.reduce((t, a) => t + (f(a) || 0), 0) / doorRuns.length;
    summary.standingMeans = {
      n: doorRuns.length,
      termWar: +m(a => a.standing.termWar).toFixed(1),
      termDip: +m(a => a.standing.termDip).toFixed(1),
      termPlenty: +m(a => a.standing.termPlenty).toFixed(1),
      termCap: +m(a => a.standing.termCap).toFixed(1),
    };
  }
  fs.writeFileSync(path.join(OUTD, 'w5path-corpus-summary.json'), JSON.stringify({ summary, atts }, null, 1));
  // Stall-attribution table (markdown).
  const L = [];
  L.push('# sim-w5census — wave-5 unlock-path stall attribution');
  L.push('');
  L.push(`Runs: ${n}. Classes: ` + Object.entries(cls).map(([k, v]) => `${k} ${v}`).join(' | '));
  L.push('');
  L.push('| run | class | sub | w4d | firstDef5d | w5d | end | attempts (outcome) | termRaw/cap | war/dip/plenty | w4kills (via) | r5 short @stall |');
  L.push('|---|---|---|---|---|---|---|---|---|---|---|---|---|');
  for (const a of atts.sort((x, y) => x.policyId.localeCompare(y.policyId) || x.seed - y.seed)) {
    const att = a.attempts.map(w => `d${w.start}-${w.end}:${w.outcome}`).join('; ') || '—';
    const via = a.w4.via ? Object.entries(a.w4.via).filter(([, v]) => v > 0).map(([k, v]) => `${k}:${v}`).join(',') : '—';
    L.push(`| ${a.policyId}-s${a.seed} | ${a.stallClass} | ${a.stallSub || '—'} | ${a.wave4Day == null ? '—' : 'd' + a.wave4Day} | ${a.firstDef5Day == null ? '—' : 'd' + a.firstDef5Day} | ${a.wave5Day == null ? '—' : 'd' + a.wave5Day} | ${a.won ? 'won' : a.endReason}:d${a.endDay} | ${att} | ${a.standing.termRaw}/${a.standing.termCap} | ${a.standing.termWar}/${a.standing.termDip}/${a.standing.termPlenty} | ${a.w4.kills} (${via}) | ${(a.r5term && a.r5term.short.join('+')) || '—'} |`);
  }
  L.push('');
  L.push('## Attempt outcomes');
  L.push('');
  L.push(`Total windows: ${attWins.length} across ${summary.attempts.runsWithAttempts} runs. ` + Object.entries(outcomes).map(([k, v]) => `${k}: ${v}`).join(', '));
  L.push('');
  fs.writeFileSync(path.join(OUTD, 'w5path-stall-attribution.md'), L.join('\n'));
  console.log(`analyzed ${n} runs -> ${path.join(OUTD, 'w5path-corpus-summary.json')}`);
  console.log('classes:', JSON.stringify(cls));
  console.log('wall:', JSON.stringify(summary.wall));
  console.log('attempt outcomes:', JSON.stringify(outcomes));
}

if (require.main === module) main();
module.exports = { classify, attemptsOf, attribute };
