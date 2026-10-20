#!/usr/bin/env node
// scripts/analyze-scholarcare-20261020.js — primary + taxonomy + guardrails
// for arm sim-scholarcare (axis scale-onramp).
//
// Reads evidence/2026-10-20/perseed-scholarcare/{control,armed}/ and prints:
//   PRIMARY   — armed wave-4 killer-alive-at-+30d (GO >= 25%)
//   TAXONOMY  — per-kill death class: kill-fight | threat-saturation |
//               attrition | other (the scholarsurvive attrition slice)
//   SECONDARY — 2-living-veterans runs per policy (>= 2/8)
//   GUARDRAILS— median survival >= control-10d; no new death modes
//               (>=2-event armed-only cause); wave-4 unlocks >= control-1
//   WALL      — national/table/wins, wave reach, death-cause shares
//
// Usage: node scripts/analyze-scholarcare-20261020.js
'use strict';
const fs = require('fs');
const path = require('path');

const REPO = path.join(__dirname, '..');
const DIR = path.join(REPO, 'evidence', '2026-10-20', 'perseed-scholarcare');
const SEEDS = [64001, 64002, 64003, 64004, 64005, 64006, 64007, 64008];
const POLICIES = ['leadfeast', 'belongfeast'];
const WIN = 30; // +30d window (E3 convention)

const ATTRITION = new Set(['sickness', 'disease', 'dehydration', 'thirst', 'starvation', 'starved', 'hunger', 'exposure']);
const COMBATISH = new Set(['combat', 'monster', 'expedition', 'contest', 'patrol']);

function load(arm) {
  const rows = [];
  for (const policyId of POLICIES) {
    for (const seed of SEEDS) {
      const fp = path.join(DIR, arm, policyId, `s${seed}.json`);
      if (!fs.existsSync(fp)) throw new Error('missing sweep file: ' + fp);
      rows.push({ policy: policyId, seed, r: JSON.parse(fs.readFileSync(fp, 'utf8')) });
    }
  }
  return rows;
}

// Wave-4+ scholar kills (via='player', by===scholar vid) with kill days.
function killsOf(r) {
  const out = [];
  for (const rec of (r.recs || [])) {
    for (const k of (rec.newKills || [])) {
      if ((k.w | 0) >= 4 && k.ch === 'player' && k.by) out.push({ mid: k.mid, w: k.w, by: k.by, d: k.d | 0 });
    }
  }
  return out;
}

// Killer death: a player death with who===by and killDay <= day <= killDay+30.
function killerDeath(r, kill) {
  let best = null;
  for (const d of (r.deathList || [])) {
    if (!d.player) continue;
    if (String(d.who) !== String(kill.by)) continue;
    if (d.day < kill.d || d.day > kill.d + WIN) continue;
    if (!best || d.day < best.day) best = d;
  }
  return best;
}

function taxClass(kill, death) {
  if (!death) return 'alive';
  const cause = String(death.cause || death.kind || 'unknown');
  if (death.day === kill.d) return 'kill-fight';
  if (ATTRITION.has(cause)) return 'attrition';
  if (COMBATISH.has(cause)) return 'threat-saturation';
  return 'other:' + cause;
}

function median(xs) {
  const s = xs.slice().sort((a, b) => a - b);
  if (!s.length) return 0;
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

function analyze() {
  const control = load('control'), armed = load('armed');
  const out = { seeds: SEEDS, policies: POLICIES, window: WIN };

  // PRIMARY (armed only) + taxonomy
  const kills = [];
  const censored = [];
  for (const { policy, seed, r } of armed) {
    for (const k of killsOf(r)) {
      if (k.d + WIN > r.gameDays) { censored.push({ policy, seed, kill: k, gameDays: r.gameDays }); continue; }
      const death = killerDeath(r, k);
      kills.push({ policy, seed, kill: k, death, cls: taxClass(k, death) });
    }
  }
  const alive = kills.filter(k => k.cls === 'alive').length;
  out.primary = {
    armedKills: kills.length, censored: censored.length, alive, share: kills.length ? alive / kills.length : null,
    go: kills.length ? (alive / kills.length) >= 0.25 : false, bar: 0.25,
    kills: kills.map(k => ({ policy: k.policy, seed: k.seed, mid: k.kill.mid, d: k.kill.d, cls: k.cls,
      deathDay: k.death ? k.death.day : null, cause: k.death ? (k.death.cause || k.death.kind) : null })),
  };
  const tax = {};
  for (const k of kills) tax[k.cls] = (tax[k.cls] || 0) + 1;
  out.taxonomy = tax;
  out.censoredDetail = censored.map(c => ({ policy: c.policy, seed: c.seed, mid: c.kill.mid, d: c.kill.d, gameDays: c.gameDays }));

  // Control kills for the armed-vs-control sanity read (not the judge).
  const ckills = [];
  for (const { policy, seed, r } of control) {
    for (const k of killsOf(r)) {
      if (k.d + WIN > r.gameDays) continue;
      ckills.push(killerDeath(r, k) ? 0 : 1);
    }
  }
  out.controlBaseline = { kills: ckills.length, alive: ckills.reduce((a, b) => a + b, 0) };

  // SECONDARY: 2-living-veterans runs per policy
  out.secondary = {};
  for (const armRows of [['control', control], ['armed', armed]]) {
    out.secondary[armRows[0]] = {};
    for (const policy of POLICIES) {
      const n = armRows[1].filter(x => x.policy === policy && (x.r.vets5max | 0) >= 2).length;
      out.secondary[armRows[0]][policy] = { runs2vets: n, of: 8, go: n >= 2 };
    }
  }

  // GUARDRAILS
  const medC = median(control.map(x => x.r.gameDays | 0));
  const medA = median(armed.map(x => x.r.gameDays | 0));
  out.guardrails = { medianSurvival: { control: medC, armed: medA, pass: medA >= medC - 10 } };
  const cCauses = new Set(), aCauses = {};
  for (const { r } of control) for (const k of Object.keys(r.deaths || {})) cCauses.add(k);
  for (const { r } of armed) for (const [k, n] of Object.entries(r.deaths || {})) aCauses[k] = (aCauses[k] || 0) + n;
  const newModes = Object.entries(aCauses).filter(([k, n]) => !cCauses.has(k) && n >= 2).map(([k]) => k);
  out.guardrails.newDeathModes = { modes: newModes, pass: newModes.length === 0 };
  const w4c = control.filter(x => (x.r.maxWave | 0) >= 4).length;
  const w4a = armed.filter(x => (x.r.maxWave | 0) >= 4).length;
  out.guardrails.wave4 = { control: w4c, armed: w4a, pass: w4a >= w4c - 1 };

  // Layer engagement (armed): did the drive fire?
  const sc = { careDays: 0, sickDays: 0, woundedDays: 0, treated: 0, folk: 0, rests: 0, firstAid: 0, pills: 0, examined: 0 };
  for (const { r } of armed) {
    const c = r.sc || {};
    sc.careDays += c.scCareDays | 0; sc.sickDays += c.scSickDays | 0;
    sc.woundedDays += c.scWoundedDays | 0; sc.treated += c.scTreated | 0;
    sc.folk += (c.scFolkFluids | 0) + (c.scFolkTea | 0) + (c.scFolkRest | 0);
    sc.rests += c.scRests | 0; sc.firstAid += c.scFirstAid | 0;
    sc.pills += c.scPills | 0; sc.examined += c.scExamined | 0;
  }
  out.engagement = sc;

  // WALL numbers
  out.wall = {};
  for (const [arm, rows] of [['control', control], ['armed', armed]]) {
    const nat = rows.filter(x => x.r.national).length;
    const won = rows.filter(x => x.r.won).length;
    const waveReach = [1, 2, 3, 4, 5].map(w => rows.filter(x => (x.r.maxWave | 0) >= w).length);
    const causes = {};
    for (const { r } of rows) for (const [k, n] of Object.entries(r.deaths || {})) causes[k] = (causes[k] || 0) + n;
    out.wall[arm] = {
      national: nat, table: nat, wins: won, of: rows.length,
      waveReach, medianSurvival: median(rows.map(x => x.r.gameDays | 0)),
      maxSurvival: Math.max(...rows.map(x => x.r.gameDays | 0)),
      deaths: causes,
    };
  }
  return out;
}

const out = analyze();
console.log(JSON.stringify(out, null, 1));

// Loud one-line verdicts for the evidence file.
const p = out.primary;
console.log(`\nPRIMARY: ${p.alive}/${p.armedKills} = ${p.share === null ? 'n/a' : (p.share * 100).toFixed(1) + '%'} vs bar 25% -> ${p.go ? 'GO' : 'NO-GO'}`);
console.log('TAXONOMY:', JSON.stringify(out.taxonomy));
console.log(`CONTROL BASELINE: ${out.controlBaseline.alive}/${out.controlBaseline.kills}`);
console.log('SECONDARY:', JSON.stringify(out.secondary));
console.log('GUARDRAILS:', JSON.stringify(out.guardrails));
console.log('ENGAGEMENT:', JSON.stringify(out.engagement));
console.log('WALL:', JSON.stringify(out.wall));
