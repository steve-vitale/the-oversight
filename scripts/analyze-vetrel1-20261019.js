#!/usr/bin/env node
// analyze-vetrel1-20261019.js — stall-point attribution + arm comparison
// for the sim-vetrel1 VETREL diagnostic re-measure (flesh-out loop,
// run fleshout-20261019T0415Z, axis scale-onramp; w5census named next #2).
//
// REUSE: classification machinery (classify/attemptsOf/attribute) is
// imported from scripts/analyze-w5path-20261019.js — the pre-registered
// stall-point definitions are IDENTICAL on both arms; only the corpus root
// and the arm dimension differ.
//
// Reads evidence/2026-10-19/perseed-vetrel1/{vetrel-off,vetrel-on}/<policy>/s<seed>.json
// Writes: evidence/2026-10-19/vetrel1-corpus-summary.json and
//         evidence/2026-10-19/vetrel1-stall-attribution.md
// Usage: node scripts/analyze-vetrel1-20261019.js
'use strict';
const fs = require('fs');
const path = require('path');
const AN = require('./analyze-w5path-20261019');

const EVID = path.join(__dirname, '..', 'evidence', '2026-10-19', 'perseed-vetrel1');
const OUTD = path.join(__dirname, '..', 'evidence', '2026-10-19');
const ARMS = ['vetrel-off', 'vetrel-on'];
const POLICIES = ['leadfeast', 'belongfeast'];
const W5_VET_DEMAND = 2; // standingCfg readyDemand[5].veterans (pinned by the proof test)

function deathsPer100d(rec) {
  const deaths = rec.deaths || {};
  const total = Object.values(deaths).reduce((t, v) => t + (v | 0), 0);
  const days = rec.gameDays || 1;
  return total * 100 / days;
}
function villagerW4Kills(a) {
  const via = (a.w4 && a.w4.via) || {};
  return (via.villager | 0) + (via.companion | 0);
}
function veteranLegMet(a) {
  return a.r5term && (a.r5term.vet | 0) >= W5_VET_DEMAND;
}

function summarize(atts) {
  const n = atts.length;
  const cls = {};
  for (const a of atts) cls[a.stallClass] = (cls[a.stallClass] || 0) + 1;
  const agg = (f) => atts.filter(f).length;
  const surv = atts.map(a => a.endDay).sort((x, y) => x - y);
  const median = surv.length ? surv[Math.floor(surv.length / 2)] : 0;
  const mean = surv.length ? surv.reduce((t, v) => t + v, 0) / surv.length : 0;
  const attWins = [];
  for (const a of atts) for (const w of a.attempts) attWins.push({ ...w });
  const outcomes = {};
  for (const w of attWins) outcomes[w.outcome] = (outcomes[w.outcome] || 0) + 1;
  const d100 = atts.map(deathsPer100d).sort((x, y) => x - y);
  const medD100 = d100.length ? d100[Math.floor(d100.length / 2)] : 0;
  return {
    n, stallClasses: cls,
    doorReaching: agg(a => a.stallClass === 'engaged-but-failed' || a.stallClass === 'unlocked'),
    veteranLegMet: agg(veteranLegMet),
    villagerW4Kills: atts.reduce((t, a) => t + villagerW4Kills(a), 0),
    totalW4Kills: atts.reduce((t, a) => t + ((a.w4 && a.w4.kills) | 0), 0),
    wall: {
      national: agg(a => a.national), table: agg(a => a.table), wins: agg(a => a.won),
      wave4: agg(a => a.maxWave >= 4), wave5: agg(a => a.wave5Day != null),
      medianSurvival: median, meanSurvival: +mean.toFixed(1), exiled: agg(a => a.exiled),
    },
    attempts: { total: attWins.length, outcomes, runsWithAttempts: agg(a => a.attempts.length > 0) },
    deathsPer100dMedian: +medD100.toFixed(2),
  };
}

function main() {
  const byArm = {};
  const allAtts = [];
  for (const arm of ARMS) {
    const atts = [];
    for (const policyId of POLICIES) {
      const dir = path.join(EVID, arm, policyId);
      if (!fs.existsSync(dir)) continue;
      for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort()) {
        const p = path.join(dir, f);
        let rec;
        try { rec = JSON.parse(fs.readFileSync(p, 'utf8')); }
        catch (e) { console.error(`  SKIP (unparseable): ${arm}/${policyId}/${f}`); continue; }
        if (!rec || !Array.isArray(rec.recs)) { console.error(`  SKIP (no recs): ${arm}/${policyId}/${f}`); continue; }
        const a = AN.attribute(rec);
        a.arm = arm;
        atts.push(a);
        allAtts.push(a);
      }
    }
    byArm[arm] = summarize(atts);
    byArm[arm].atts = atts;
  }
  const off = byArm['vetrel-off'], on = byArm['vetrel-on'];
  const d = (a, b) => (b == null || a == null) ? null : b - a;
  const comparison = {
    arms: 'vetrel-off (control) -> vetrel-on (VETREL=1)',
    n: { off: off.n, on: on.n },
    stallClassDelta: {},
    doorReaching: { off: off.doorReaching, on: on.doorReaching, delta: d(off.doorReaching, on.doorReaching) },
    veteranLegMet: { off: off.veteranLegMet, on: on.veteranLegMet, delta: d(off.veteranLegMet, on.veteranLegMet) },
    villagerW4Kills: { off: off.villagerW4Kills, on: on.villagerW4Kills, delta: d(off.villagerW4Kills, on.villagerW4Kills) },
    totalW4Kills: { off: off.totalW4Kills, on: on.totalW4Kills, delta: d(off.totalW4Kills, on.totalW4Kills) },
    wallDelta: {
      national: d(off.wall.national, on.wall.national),
      table: d(off.wall.table, on.wall.table),
      wins: d(off.wall.wins, on.wall.wins),
      wave4: d(off.wall.wave4, on.wall.wave4),
      wave5: d(off.wall.wave5, on.wall.wave5),
      medianSurvival: d(off.wall.medianSurvival, on.wall.medianSurvival),
      exiled: d(off.wall.exiled, on.wall.exiled),
    },
    deathsPer100dMedian: { off: off.deathsPer100dMedian, on: on.deathsPer100dMedian, delta: +(d(off.deathsPer100dMedian, on.deathsPer100dMedian) || 0).toFixed(2) },
    attemptOutcomeDelta: {},
  };
  for (const k of new Set([...Object.keys(off.stallClasses), ...Object.keys(on.stallClasses)])) {
    comparison.stallClassDelta[k] = { off: off.stallClasses[k] || 0, on: on.stallClasses[k] || 0, delta: (on.stallClasses[k] || 0) - (off.stallClasses[k] || 0) };
  }
  for (const k of new Set([...Object.keys(off.attempts.outcomes), ...Object.keys(on.attempts.outcomes)])) {
    comparison.attemptOutcomeDelta[k] = { off: off.attempts.outcomes[k] || 0, on: on.attempts.outcomes[k] || 0, delta: (on.attempts.outcomes[k] || 0) - (off.attempts.outcomes[k] || 0) };
  }

  fs.writeFileSync(path.join(OUTD, 'vetrel1-corpus-summary.json'),
    JSON.stringify({ comparison, arms: { 'vetrel-off': stripAtts(off), 'vetrel-on': stripAtts(on) } }, null, 1));

  // Stall-attribution tables (both arms).
  const L = [];
  L.push('# sim-vetrel1 — wave-5 unlock-path stall attribution, VETREL diagnostic');
  L.push('');
  L.push(`Control (vetrel-off): ${off.n} runs. Armed (vetrel-on): ${on.n} runs. 8 fresh seeds 63901-63908 x {leadfeast, belongfeast} per arm, 180d death-aware, pre-seat + windefer.`);
  L.push('');
  L.push('## Arm shift (off -> on)');
  L.push('');
  L.push('| dimension | off | on | delta |');
  L.push('|---|---|---|---|');
  for (const [k, v] of Object.entries(comparison.stallClassDelta)) L.push(`| stall: ${k} | ${v.off} | ${v.on} | ${v.delta >= 0 ? '+' : ''}${v.delta} |`);
  L.push(`| door-reaching runs | ${comparison.doorReaching.off} | ${comparison.doorReaching.on} | ${fmtD(comparison.doorReaching.delta)} |`);
  L.push(`| veteran leg met (r5 vet>=2) | ${comparison.veteranLegMet.off} | ${comparison.veteranLegMet.on} | ${fmtD(comparison.veteranLegMet.delta)} |`);
  L.push(`| villager wave-4 kills (villager+companion via) | ${comparison.villagerW4Kills.off} | ${comparison.villagerW4Kills.on} | ${fmtD(comparison.villagerW4Kills.delta)} |`);
  L.push(`| total wave-4 kills | ${comparison.totalW4Kills.off} | ${comparison.totalW4Kills.on} | ${fmtD(comparison.totalW4Kills.delta)} |`);
  const wd = comparison.wallDelta;
  L.push(`| wall: national | ${off.wall.national} | ${on.wall.national} | ${fmtD(wd.national)} |`);
  L.push(`| wall: table | ${off.wall.table} | ${on.wall.table} | ${fmtD(wd.table)} |`);
  L.push(`| wall: wins | ${off.wall.wins} | ${on.wall.wins} | ${fmtD(wd.wins)} |`);
  L.push(`| wall: wave-4 unlocks | ${off.wall.wave4} | ${on.wall.wave4} | ${fmtD(wd.wave4)} |`);
  L.push(`| wall: wave-5 unlocks | ${off.wall.wave5} | ${on.wall.wave5} | ${fmtD(wd.wave5)} |`);
  L.push(`| wall: median survival | ${off.wall.medianSurvival} | ${on.wall.medianSurvival} | ${fmtD(wd.medianSurvival)} |`);
  L.push(`| deaths/100d (median) | ${comparison.deathsPer100dMedian.off} | ${comparison.deathsPer100dMedian.on} | ${fmtD(comparison.deathsPer100dMedian.delta)} |`);
  L.push('');
  for (const arm of ARMS) {
    const s = byArm[arm];
    L.push(`## ${arm} — stall attribution (${s.n} runs)`);
    L.push('');
    L.push('Classes: ' + Object.entries(s.stallClasses).map(([k, v]) => `${k} ${v}`).join(' | '));
    L.push('');
    L.push('| run | class | sub | w4d | firstDef5d | w5d | end | attempts (outcome) | termRaw/cap | war/dip/plenty | w4kills (via) | r5 short @stall |');
    L.push('|---|---|---|---|---|---|---|---|---|---|---|---|---|');
    for (const a of s.atts.sort((x, y) => x.policyId.localeCompare(y.policyId) || x.seed - y.seed)) {
      const att = a.attempts.map(w => `d${w.start}-${w.end}:${w.outcome}`).join('; ') || '—';
      const via = a.w4.via ? Object.entries(a.w4.via).filter(([, v]) => v > 0).map(([k, v]) => `${k}:${v}`).join(',') : '—';
      L.push(`| ${a.policyId}-s${a.seed} | ${a.stallClass} | ${a.stallSub || '—'} | ${a.wave4Day == null ? '—' : 'd' + a.wave4Day} | ${a.firstDef5Day == null ? '—' : 'd' + a.firstDef5Day} | ${a.wave5Day == null ? '—' : 'd' + a.wave5Day} | ${a.won ? 'won' : a.endReason}:d${a.endDay} | ${att} | ${a.standing.termRaw}/${a.standing.termCap} | ${a.standing.termWar}/${a.standing.termDip}/${a.standing.termPlenty} | ${a.w4.kills} (${via}) | ${(a.r5term && a.r5term.short.join('+')) || '—'} |`);
    }
    L.push('');
    L.push(`Attempt outcomes: ${s.attempts.total} windows across ${s.attempts.runsWithAttempts} runs — ` + Object.entries(s.attempts.outcomes).map(([k, v]) => `${k}: ${v}`).join(', '));
    L.push('');
  }
  fs.writeFileSync(path.join(OUTD, 'vetrel1-stall-attribution.md'), L.join('\n'));
  console.log(`analyzed off=${off.n} on=${on.n} -> ${path.join(OUTD, 'vetrel1-corpus-summary.json')}`);
  console.log('off classes:', JSON.stringify(off.stallClasses), 'wall:', JSON.stringify(off.wall));
  console.log('on  classes:', JSON.stringify(on.stallClasses), 'wall:', JSON.stringify(on.wall));
  console.log('delta doorReaching:', fmtD(comparison.doorReaching.delta), '| veteranLegMet:', fmtD(comparison.veteranLegMet.delta), '| villagerW4Kills:', fmtD(comparison.villagerW4Kills.delta), '| medianSurvival:', fmtD(wd.medianSurvival));
}

function stripAtts(s) {
  const { atts, ...rest } = s;
  return { ...rest, runs: atts };
}
function fmtD(x) { return x == null ? '—' : (x >= 0 ? '+' : '') + x; }

if (require.main === module) main();
module.exports = { summarize, deathsPer100d, villagerW4Kills, veteranLegMet, ARMS, POLICIES };
