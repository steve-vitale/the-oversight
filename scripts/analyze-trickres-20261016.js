#!/usr/bin/env node
// analyze-trickres-20261016.js — the sim-trickres resolution analysis.
// Reads evidence/2026-10-16/perseed-trickres/*.json, joins each fight against
// the run's waveKillLog for trick attribution, classifies resolutions with
// scripts/trickres-instrument-20261016.js, and prints the verdict.
//
// PRIMARY (binding): trick RESOLUTIONS >0 on the 16-run treatment sweep.
// SECONDARY: mean field deaths/run within wave-3+-reached runs (directional).
// Guardrails: national >= control-2, wave reach not worse, no new death mode,
// median survival report-only.
'use strict';
const fs = require('fs');
const path = require('path');
const { classifyFieldFight, classifyTbFight } = require('./trickres-instrument-20261016.js');

const EVID = path.join(__dirname, '..', 'evidence', '2026-10-16', 'perseed-trickres');

// The 26 counterwire-new villagerTrickDefs entries (44de021d). Everything else
// trick-bearing (w1/2 counter defs + spool/chorus_line/buffering) is legacy.
const NEW26 = new Set([
  'redactor', 'gavel', 'focus_group', 'terms_of_service', 'callback', 'ad_break',
  'congregation', 'strike', 'influencer', 'audit', 'reunion', 'suburb', 'eulogy', 'algorithm', 'eater',
  'cancellation', 'editor', 'rerun', 'spoiler', 'timeslot', 'nielsen', 'finale', 'finale_crew', 'finale_opening', 'network_note',
  'herald',
]);
// 10 wave-4 + 10 wave-5 = 20; + 6 wave-3 = 26. (Count check below.)

function trickKillJoin(waveKillTricks, mid, day) {
  return (waveKillTricks || []).some(k => k.mid === mid && k.trick && Math.abs((k.d || 0) - day) <= 1);
}

// Death-mode normalization for the "no new death mode" guardrail: a cause
// string naming a specific monster ("The Congregation", "Bulldozer") is an
// attribution detail of the pre-existing combat mode, not a new mode. Modes
// are mechanics (combat, sickness, starvation, ...). Normalize against the
// monster roster from the treatment tree's data.
let MONSTER_NAMES = new Set();
try {
  const mdata = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'monsters.json'), 'utf8'));
  const list = Array.isArray(mdata) ? mdata : (mdata.monsters || []);
  for (const m of list) { if (m.name) MONSTER_NAMES.add(String(m.name).toLowerCase()); if (m.id) MONSTER_NAMES.add(String(m.id).toLowerCase().replace(/_/g, ' ')); }
} catch (e) {}
function deathMode(cause) {
  const c = String(cause || '').toLowerCase();
  if (MONSTER_NAMES.has(c)) return 'monster-named';
  return String(cause || '?');
}

function analyzeRun(run) {
  const res = {
    seed: run.seed, policyId: run.policyId, arm: run.arm,
    days: run.days, endReason: run.endReason, maxWave: run.maxWave,
    national: run.national, table: run.table, won: run.won,
    fieldDeaths: run.fieldDeaths, deaths: run.deaths, deathCauses: run.deathCauses,
    resolutions: [], diagnostics: [],
  };
  for (const f of (run.fieldFights || [])) {
    if (!f || f.outcome === 'alreadyDead' || f.outcome === 'evade') continue;
    const attributed = f.outcome === 'vKill' ? trickKillJoin(run.waveKillTricks, f.mid, f.day) : false;
    const c = classifyFieldFight({ outcome: f.outcome, trickTokens: f.trickTokens }, attributed);
    if (c.resolution) {
      res.resolutions.push({ path: 'field', kind: c.kind, mid: f.mid, wave: f.wave, day: f.day,
        tokens: (f.trickTokens || []).join(','), layer: NEW26.has(f.mid) ? 'counterwire-new' : 'legacy',
        knownStart: !!f.knownStart, knownViolation: !!f.knownViolation });
    } else if (c.kind !== 'none') {
      res.diagnostics.push({ path: 'field', kind: c.kind, mid: f.mid, wave: f.wave, day: f.day,
        tokens: (f.trickTokens || []).join(','), outcome: f.outcome });
    }
    if (f.knownViolation) res.diagnostics.push({ path: 'field', kind: 'KNOWN-VIOLATION', mid: f.mid, day: f.day });
  }
  for (const t of (run.tbFights || [])) {
    const byMid = {};
    for (const mid of Object.keys((t && t.perfs) || {})) {
      byMid[mid] = ((t.perfs[mid] || []).length > 0) && trickKillJoin(run.waveKillTricks, mid, t.day);
    }
    for (const r of classifyTbFight({ perfs: t.perfs, killAttributedByMid: byMid })) {
      const knownStart = t.knownByMid ? t.knownByMid[r.mid] : null;
      res.resolutions.push({ path: 'tb', kind: r.kind, mid: r.mid, wave: null, day: t.day,
        tokens: ((t.perfs || {})[r.mid] || []).join(','), layer: NEW26.has(r.mid) ? 'counterwire-new' : 'legacy',
        knownStart: knownStart });
    }
  }
  return res;
}

const files = fs.readdirSync(EVID).filter(f => f.endsWith('.json')).sort();
const arms = {};
for (const f of files) {
  const run = JSON.parse(fs.readFileSync(path.join(EVID, f), 'utf8'));
  const a = analyzeRun(run);
  (arms[run.arm] = arms[run.arm] || []).push(a);
}

const sum = (a) => a.reduce((x, y) => x + y, 0);
for (const [arm, runs] of Object.entries(arms)) {
  const nRes = sum(runs.map(r => r.resolutions.length));
  const kills = sum(runs.map(r => r.resolutions.filter(x => x.kind === 'kill').length));
  const flees = sum(runs.map(r => r.resolutions.filter(x => x.kind === 'flee').length));
  const newLayer = sum(runs.map(r => r.resolutions.filter(x => x.layer === 'counterwire-new').length));
  const legacy = sum(runs.map(r => r.resolutions.filter(x => x.layer === 'legacy').length));
  const tb = sum(runs.map(r => r.resolutions.filter(x => x.path === 'tb').length));
  const singleTok = sum(runs.map(r => r.diagnostics.filter(x => x.kind === 'single-token-flee').length));
  const unatt = sum(runs.map(r => r.diagnostics.filter(x => x.kind === 'unattributed-kill').length));
  const kv = sum(runs.map(r => r.diagnostics.filter(x => x.kind === 'KNOWN-VIOLATION').length));
  const w3r = runs.filter(r => r.maxWave >= 3);
  const nat = sum(runs.map(r => r.national));
  const maxW = Math.max(...runs.map(r => r.maxWave));
  const medDays = runs.map(r => r.days).sort((a, b) => a - b)[Math.floor(runs.length / 2)];
  console.log(`\n== ${arm} (${runs.length} runs) ==`);
  console.log(`resolutions: ${nRes} (kills ${kills}, non-lethal flees ${flees}) | path: tb ${tb}, field ${nRes - tb} | layer: counterwire-new ${newLayer}, legacy ${legacy}`);
  console.log(`diagnostics: single-token-flees ${singleTok}, unattributed-kills ${unatt}, KNOWN-VIOLATIONS ${kv}`);
  console.log(`wave3+-reached: ${w3r.length}/${runs.length} | mean fieldDeaths/run (w3+): ${(sum(w3r.map(r => r.fieldDeaths)) / Math.max(1, w3r.length)).toFixed(2)}`);
  console.log(`national ${nat}/${runs.length} | table ${sum(runs.map(r => r.table))}/${runs.length} | won ${sum(runs.map(r => r.won))}/${runs.length} | maxWave ${maxW} | median days ${medDays}`);
  // per-species resolution ledger
  const bySp = {};
  for (const r of runs) for (const x of r.resolutions) {
    const k = `${x.mid}(${x.path}/${x.kind}/${x.layer})`;
    bySp[k] = (bySp[k] || 0) + 1;
  }
  console.log('resolution ledger: ' + (Object.entries(bySp).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}:${v}`).join(' ') || '(none)'));
  const stD = {};
  for (const r of runs) for (const x of r.diagnostics.filter(d => d.kind === 'single-token-flee')) {
    const k = `${x.mid}(${x.outcome})`; stD[k] = (stD[k] || 0) + 1;
  }
  console.log('single-token flees: ' + (Object.entries(stD).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}:${v}`).join(' ') || '(none)'));
}

const T = arms.treatment || [], C = arms.control || [];
if (T.length && C.length) {
  const nResT = sum(T.map(r => r.resolutions.length));
  const natT = sum(T.map(r => r.national)), natC = sum(C.map(r => r.national));
  const maxWT = Math.max(...T.map(r => r.maxWave)), maxWC = Math.max(...C.map(r => r.maxWave));
  const w3T = T.filter(r => r.maxWave >= 3), w3C = C.filter(r => r.maxWave >= 3);
  const fdT = sum(w3T.map(r => r.fieldDeaths)) / Math.max(1, w3T.length);
  const fdC = sum(w3C.map(r => r.fieldDeaths)) / Math.max(1, w3C.length);
  const causesT = new Set(), causesC = new Set();
  for (const r of T) Object.keys(r.deathCauses || {}).forEach(c => causesT.add(deathMode(c)));
  for (const r of C) Object.keys(r.deathCauses || {}).forEach(c => causesC.add(deathMode(c)));
  const newModes = [...causesT].filter(c => !causesC.has(c));
  console.log('\n== VERDICT ==');
  console.log(`PRIMARY (resolutions >0 on 16-run treatment): ${nResT} → ${nResT > 0 ? 'GO' : 'NO-GO'}`);
  console.log(`SECONDARY (field deaths/run within w3+-reached, treatment ${fdT.toFixed(2)} vs control ${fdC.toFixed(2)}): ${fdT < fdC ? 'down' : fdT > fdC ? 'UP' : 'flat'}`);
  console.log(`guardrail national: treatment ${natT} vs control ${natC} (need >= ${natC - 2}): ${natT >= natC - 2 ? 'HOLD' : 'BREACH'}`);
  console.log(`guardrail wave reach: treatment max ${maxWT} vs control max ${maxWC}: ${maxWT >= maxWC ? 'HOLD' : 'BREACH'}`);
  console.log(`guardrail new death modes: ${newModes.length ? 'BREACH: ' + newModes.join(' | ') : 'none — HOLD'}`);
  const med = (rs) => rs.map(r => r.days).sort((a, b) => a - b)[Math.floor(rs.length / 2)];
  console.log(`median survival (report-only): treatment ${med(T)}d vs control ${med(C)}d`);
}
console.log(`\nNEW26 count check: ${NEW26.size} (expect 26)`);
