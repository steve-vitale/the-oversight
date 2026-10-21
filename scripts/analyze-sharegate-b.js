#!/usr/bin/env node
// analyze-sharegate-b.js — pilot analysis for sim-sharegate-b.
// Reads the 4 pilot corpora and judges the pre-registered PRIMARY +
// guardrails. Corpus files:
//   evidence/2026-10-21/perseed-sharegate-b/{control,armed}-{leadfeast,belongfeast}.json
// Usage: node scripts/analyze-sharegate-b.js [dir]
'use strict';
const fs = require('fs');
const path = require('path');

const DIR = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-10-21', 'perseed-sharegate-b');
const { gateCrossing, trustTrajectories } = require('./sharegate-metrics');
const FILES = {
  control_lead: 'control-leadfeast.json', control_belong: 'control-belongfeast.json',
  armed_lead: 'armed-leadfeast.json', armed_belong: 'armed-belongfeast.json',
};
function load(f) {
  const j = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
  return j.rows || [];
}
const control = [...load(FILES.control_lead), ...load(FILES.control_belong)];
const armed = [...load(FILES.armed_lead), ...load(FILES.armed_belong)];
const rows = (side) => side;

function median(a) {
  if (!a.length) return 0;
  const s = a.slice().sort((x, y) => x - y);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
function sum(a, f) { return a.reduce((t, r) => t + (f(r) || 0), 0); }

function wall(rs) {
  const natEnd = rs.filter(r => r.end.nationalLive).length;
  const natEver = rs.filter(r => (r.end.upkeep.natEvents || []).some(e => e.kind === 'sat')).length;
  const table = rs.filter(r => r.end.tableWaiting).length;
  const won = rs.filter(r => r.end.won).length;
  const exiled = rs.filter(r => r.end.exiled).length;
  const days = rs.map(r => r.end.days);
  const waves = [1, 2, 3, 4, 5].map(w => rs.filter(r => (r.end.maxWave || 1) >= w).length);
  const deaths = [];
  const causes = {};
  for (const r of rs) for (const d of (r.end.deaths || [])) { deaths.push(d); causes[d.cause] = (causes[d.cause] || 0) + 1; }
  const starv = deaths.filter(d => /starv/.test(d.cause)).length;
  const natLost = sum(rs, r => (r.end.upkeep.natEvents || []).filter(e => e.kind === 'lost').length);
  const rot = sum(rs, r => (r.end.rotFresh || 0) + (r.end.rotPreserved || 0));
  const shareSurplus = sum(rs, r => r.end.shareSurplus || 0);
  const trimKcal = sum(rs, r => r.end.trimKcal || 0);
  const trimEvents = sum(rs, r => r.end.trimEvents || 0);
  return { n: rs.length, won, natEnd, natEver, table, exiled, waves, medDays: median(days), maxDays: Math.max(...days, 0), starv, natLost, rot, shareSurplus, trimKcal, trimEvents, causes };
}

// gate metrics: INDEPENDENT of the layer's bookkeeping — rebuilt from the
// upkeep instrument (scripts/sharegate-metrics.js). gate-crossing = a
// skip-week with trust0 < 40, or a run of >= 3 consecutive skip-weeks.
function sumGateCrossing(rs) {
  let below40 = 0, run3 = 0;
  const detail = [];
  for (const r of rs) {
    const g = gateCrossing(r.end);
    below40 += g.below40; run3 += g.run3;
    for (const d of g.detail) detail.push(Object.assign({ seed: r.seed }, d));
  }
  return { below40, run3, total: below40 + run3, detail };
}

// post-gate trust trajectories (armed): links the second pass decided on.
function sumTrustTraj(rs) {
  let below40Links = 0, craters = 0;
  const detail = [];
  for (const r of rs) {
    const t = trustTrajectories(r.end);
    below40Links += t.below40Links; craters += t.craters;
    for (const d of t.detail) detail.push(Object.assign({ seed: r.seed }, d));
  }
  return { below40Links, craters, detail };
}

// control contrast: links that cratered (trust >= 90 → < 40) on the
// no-gate side, and their skip exposure from dawn tdw/tpw stamps.
function controlCraters(rs) {
  let craters = 0;
  const detail = [];
  for (const r of rs) {
    const byOther = {};
    for (const s of (r.end.upkeep.links || [])) {
      const k = String(s.other || '?').toLowerCase();
      (byOther[k] = byOther[k] || []).push(s);
    }
    for (const k of Object.keys(byOther)) {
      const traj = byOther[k].filter(s => s.st === 0).sort((a, b) => a.d - b.d);
      const maxT = Math.max(-1, ...traj.map(s => s.trust));
      const minT = Math.min(999, ...traj.map(s => s.trust));
      if (maxT >= 90 && minT < 40) {
        craters++;
        detail.push({ seed: r.seed, other: k, max: maxT, min: minT, nSnap: traj.length });
      }
    }
  }
  return { craters, detail };
}

const wc = wall(control), wa = wall(armed);
const gx = sumGateCrossing(armed);
const tt = sumTrustTraj(armed);
const cc = controlCraters(control);

const rotRatio = wc.rot > 0 ? wa.rot / wc.rot : NaN;
const rotBar = rotRatio <= 0.90;
const gateBar = gx.total === 0;
const trajBar = tt.below40Links === 0;
const craterBar = tt.craters === 0;

const guard = {
  starv: wa.starv <= wc.starv,
  survival: wa.medDays >= wc.medDays - 10,
  dissolutions: wa.natLost <= wc.natLost,
  national: wa.natEnd >= wc.natEnd - 2,
  laundering: wc.shareSurplus > 0 ? wa.shareSurplus <= 1.05 * wc.shareSurplus : true,
  deathMech: JSON.stringify(Object.keys(wa.causes).sort()) === JSON.stringify(Object.keys(wc.causes).sort()),
};

const primary = rotBar && gateBar && trajBar && craterBar;
const guardrails = Object.values(guard).every(Boolean);
const verdict = (primary && guardrails) ? 'GO' : 'KILLED-AT-PILOT';

const out = {
  meta: { dir: DIR, n: { control: control.length, armed: armed.length } },
  wall: { control: wc, armed: wa },
  primary: {
    rotRatio: +rotRatio.toFixed(3), rotBar,
    gateCrossingSkips: gx.total, gateCrossingBelow40: gx.below40, gateCrossingRun3: gx.run3,
    gateBar, gateDetail: gx.detail.slice(0, 20),
    postGateBelow40: tt.below40Links, trajBar,
    trustCraters: tt.craters, craterBar, trajDetail: tt.detail.slice(0, 20),
  },
  controlContrast: { craters: cc.craters, detail: cc.detail.slice(0, 20) },
  guardrails: guard,
  verdict,
};

console.log(JSON.stringify(out, null, 1));
console.log(`\nVERDICT: ${verdict}`);
