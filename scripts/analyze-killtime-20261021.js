#!/usr/bin/env node
// analyze-killtime-20261021.js — corrected veteran-channel numbers from the
// killtime re-runs (sim-killtime, 2026-10-21, backlog #753).
//
// Reads evidence/2026-10-21/perseed-killtime/*.json (killtime re-runs), joins
// each corpus's wave-4 kills against the kill-time census, checks fidelity
// (re-run kill rows vs landed corpus kill rows), and publishes the corrected
// veteran-channel primaries + claim-flip verdicts.
//
// twovets-armed is NOT re-runnable (twovets.js deleted per kill protocol) —
// its single kill (Nikos d75 via=companion) is attributed from the corpus's
// own kill-time bearerAtKill, stated explicitly below.
//
// Usage: node scripts/analyze-killtime-20261021.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const EVID = path.join(REPO, 'evidence', '2026-10-21');
const KTDIR = path.join(EVID, 'perseed-killtime');

function loadCorpusTwovets() {
  const d = path.join(EVID, 'perseed-twovets');
  const out = {};
  for (const f of fs.readdirSync(d)) {
    if (f.startsWith('_') || !f.endsWith('.json')) continue;
    const j = JSON.parse(fs.readFileSync(path.join(d, f)));
    out[f.replace('.json', '')] = {
      kills: (j.w4killsDetail || []).map(k => ({ d: k.d, mid: k.mid, by: k.by, via: k.via, bearerAtKill: k.bearerAtKill || null })),
    };
  }
  return out;
}

function loadCorpusVgear() {
  const d = path.join(EVID, 'perseed-vgearconfirm');
  const out = {};
  for (const f of fs.readdirSync(d)) {
    if (f.startsWith('_') || !f.endsWith('.json')) continue;
    const j = JSON.parse(fs.readFileSync(path.join(d, f)));
    out[f.replace('.json', '')] = {
      kills: (j.w4killsDetail || []).map(k => ({ d: k.d, mid: k.mid, by: k.by, via: k.via })),
    };
  }
  return out;
}

function loadReruns() {
  const out = {};
  if (!fs.existsSync(KTDIR)) return out;
  for (const f of fs.readdirSync(KTDIR)) {
    if (!f.endsWith('.json')) continue;
    out[f.replace('.json', '')] = JSON.parse(fs.readFileSync(path.join(KTDIR, f)));
  }
  return out;
}

// Re-run file keys look like: vgear-belongfeast-vgear-s64841,
// control-leadfeast-s64703, vgear-leadfeast-vgear-s64703.
// Parse -> {arm, base, seed}. Corpus key mapping:
//   twovets seeds (64841-64848): corpus key = 'control-<base>-s<seed>'
//     (twovets corpus used ARM=control for the VGEAR=1 stack)
//   vgearconfirm seeds (64701-64716): corpus key = re-run key unchanged.
function parseKey(key) {
  const m = key.match(/^(control|vgear)-((?:lead|belong)feast)(?:-vgear)?-s(\d+)$/);
  if (!m) return null;
  return { arm: m[1], base: m[2], seed: +m[3] };
}
function corpusKeyTwovets(p) { return `control-${p.base}-s${p.seed}`; }
function isTwovetsSeed(s) { return s >= 64841 && s <= 64848; }
function isVgearSeed(s) { return s >= 64701 && s <= 64716; }

function rowsEqual(a, b) {
  if (a.length !== b.length) return false;
  const key = r => [r.d, r.mid, r.by, r.via].join('|');
  const sa = a.map(key).sort().join(';');
  const sb = b.map(key).sort().join(';');
  return sa === sb;
}

const corpT = loadCorpusTwovets();
const corpV = loadCorpusVgear();
const reruns = loadReruns();

const report = { fidelity: [], attribution: {}, verdicts: {} };

// ---- twovets: fidelity + attribution ----
let twovetsErr = 0, twovetsUnexp = 0;
const twovetsKt = { control: { scholar: 0, villager: 0, villagers: new Set() }, armed: { scholar: 0, villager: 0, villagers: new Set() } };
const twovetsEnd = { control: { scholar: 0, villager: 0 }, armed: { scholar: 0, villager: 0 } };
for (const [key, r] of Object.entries(reruns)) {
  const p = parseKey(key);
  if (!p || !isTwovetsSeed(p.seed)) continue;
  const ck = corpusKeyTwovets(p);
  const corp = corpT[ck];
  const fid = corp ? rowsEqual(r.killRows || [], corp.kills) : null;
  report.fidelity.push({ config: key, corpusKills: corp ? corp.kills.length : null, rerunKills: (r.killRows || []).length, match: fid, errors: (r.instrumentErrors || []).length });
  twovetsErr += (r.instrumentErrors || []).length;
  const rep = r.correctionReport || {};
  twovetsUnexp += ((rep.unexplained || []).length);
  const arm = 'control'; // twovets re-runs are all control (armed not re-runnable)
  twovetsKt[arm].scholar += (rep.killTime || {}).scholar || 0;
  twovetsKt[arm].villager += (rep.killTime || {}).villager || 0;
  twovetsEnd[arm].scholar += (rep.endOfRun || {}).scholar || 0;
  twovetsEnd[arm].villager += (rep.endOfRun || {}).villager || 0;
  for (const row of (r.attribution || [])) if (!row.killTimeScholar && row.by) twovetsKt[arm].villagers.add(row.by);
}
// twovets-armed: corpus's own kill-time bearerAtKill (layer deleted, no re-run).
{
  const ak = corpT['twovets-belongfeast-twovets-s64845'];
  const k = (ak && ak.kills[0]) || null;
  if (k) {
    const ktScholar = k.by === 'player' || k.by === k.bearerAtKill;
    if (ktScholar) twovetsKt.armed.scholar++; else { twovetsKt.armed.villager++; twovetsKt.armed.villagers.add(k.by); }
    report.attribution.twovetsArmedNote = `armed kill ${k.mid} d${k.d} by ${k.by} (${k.via}), bearerAtKill=${k.bearerAtKill} — corpus kill-time, no re-run (twovets.js deleted per kill protocol)`;
  }
}
report.attribution.twovets = {
  control: { endOfRun: twovetsEnd.control, killTime: { scholar: twovetsKt.control.scholar, villager: twovetsKt.control.villager, distinctVillagers: twovetsKt.control.villagers.size } },
  armed: { killTime: { scholar: twovetsKt.armed.scholar, villager: twovetsKt.armed.villager, distinctVillagers: twovetsKt.armed.villagers.size } },
  unexplained: twovetsUnexp, instrumentErrors: twovetsErr,
};

// ---- vgearconfirm: fidelity + attribution ----
let vgearErr = 0, vgearUnexp = 0;
const vgearKt = { control: { scholar: 0, villager: 0, villagers: new Set() }, vgear: { scholar: 0, villager: 0, villagers: new Set() } };
const vgearEnd = { control: { scholar: 0, villager: 0 }, vgear: { scholar: 0, villager: 0 } };
const flips = [];
for (const [key, r] of Object.entries(reruns)) {
  const p = parseKey(key);
  if (!p || !isVgearSeed(p.seed)) continue;
  const arm = p.arm === 'vgear' ? 'vgear' : 'control';
  const corp = corpV[key];
  const fid = corp ? rowsEqual(r.killRows || [], corp.kills) : null;
  report.fidelity.push({ config: key, corpusKills: corp ? corp.kills.length : null, rerunKills: (r.killRows || []).length, match: fid, errors: (r.instrumentErrors || []).length });
  vgearErr += (r.instrumentErrors || []).length;
  const rep = r.correctionReport || {};
  vgearUnexp += ((rep.unexplained || []).length);
  vgearKt[arm].scholar += (rep.killTime || {}).scholar || 0;
  vgearKt[arm].villager += (rep.killTime || {}).villager || 0;
  vgearEnd[arm].scholar += (rep.endOfRun || {}).scholar || 0;
  vgearEnd[arm].villager += (rep.endOfRun || {}).villager || 0;
  for (const d of (rep.deltas || [])) flips.push(Object.assign({ config: key }, d));
  for (const row of (r.attribution || [])) if (!row.killTimeScholar && row.by) vgearKt[arm].villagers.add(row.by);
}
report.attribution.vgearconfirm = {
  control: { endOfRun: vgearEnd.control, killTime: { scholar: vgearKt.control.scholar, villager: vgearKt.control.villager, distinctVillagers: vgearKt.control.villagers.size } },
  vgear: { endOfRun: vgearEnd.vgear, killTime: { scholar: vgearKt.vgear.scholar, villager: vgearKt.vgear.villager, distinctVillagers: vgearKt.vgear.villagers.size } },
  unexplained: vgearUnexp, instrumentErrors: vgearErr, flips,
};

// ---- verdicts ----
report.verdicts.twovetsClaim = 'published: "0 scholar wave-4 kills in 16 armed runs"';
report.verdicts.twovetsArmedScholarKills = twovetsKt.armed.scholar;
report.verdicts.vgearconfirmGo = 'published GO: 2/16 armed seeds reach w5vetsMax>=2 vs 0/16 control (primary = readiness census, not kills)';

console.log(JSON.stringify(report, (k, v) => v instanceof Set ? [...v] : v, 1));
