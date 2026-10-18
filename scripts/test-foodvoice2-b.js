#!/usr/bin/env node
// scripts/test-foodvoice2-b.js — proof for sim-foodvoice2-b (findings #504/#505).
//
// PART A (RED, static): on the landed sim-foragelead-b corpus
//   (evidence/2026-10-17/perseed-foragelead, pre-fix), quantify the bug:
//   max per-day verbatim departure-line repetitions, pantry-check beats
//   per day, and the within-day fresh-days wobble.
// PART B (det-gate): control (FOODVOICE2_GATE='0') vs armed on identical
//   seeds — per-day state trajectories must be byte-identical (narration
//   stream the only allowed difference). Uses the dayHash schema from
//   scripts/test-nothingedible-20261017.js.
// PART C (GREEN): runs scripts/census-foodvoice2-b.js armed on the exact
//   32 corpus pairs, then asserts the pre-registered PRIMARY + guardrails.
//
// Usage: FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/test-foodvoice2-b.js
//   PARTS="A" / "B" / "C" to run one part. PART=A needs no env gate;
//   PART=B sets FOODVOICE2_GATE itself per arm.
'use strict';
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const SEEDS8 = [7621, 7622, 7623, 7624, 7625, 7626, 7627, 7628];
const SEEDS16 = SEEDS8.concat([7631, 7632, 7633, 7634, 7635, 7636, 7637, 7638]);
const POLICIES = ['leadfeast', 'belongfeast'];
const CORPUS = path.join(__dirname, '..', 'evidence', '2026-10-17', 'perseed-foragelead');
const CENSUS_OUT = '/tmp/foodvoice2-census';
const DAYS = 180;

const strip = (s) => String(s == null ? '' : s).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').slice(0, 400);
const depLines = [
  'Back before dark. Probably.',
  "Gone looking. Don't wait up.",
  "There's food out there. Going to find it.",
  'Out for a forage. If I\'m late, start without me.',
  'Bringing dinner back. One way or another.',
];

function corpusRuns() {
  const out = [];
  for (const f of fs.readdirSync(CORPUS)) {
    const m = f.match(/^(leadfeast|belongfeast)-(\d+)\.json$/);
    if (!m) continue;
    const d = JSON.parse(fs.readFileSync(path.join(CORPUS, f), 'utf8'));
    if (!d.beats) continue;
    out.push({ policy: m[1], seed: +m[2], beats: d.beats, wall: d.wall });
  }
  return out;
}

function censusRuns(dir) {
  const out = [];
  for (const f of fs.readdirSync(dir)) {
    const m = f.match(/^(leadfeast|belongfeast)-(\d+)\.json$/);
    if (!m) continue;
    out.push(JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
  }
  return out;
}

// ---- beat classifiers (same shape both sides) ----
function depStats(beats) {
  // per (policy,seed): day -> {verbatim counts per line}
  const per = {};
  for (const b of beats) {
    const line = depLines.find(l => b.text.includes(l));
    if (!line) continue;
    per[b.day] = per[b.day] || {};
    per[b.day][line] = (per[b.day][line] || 0) + 1;
  }
  const days = Object.keys(per);
  let maxVerbatim = 0, verbatimDays = 0, total = 0;
  const linesUsed = new Set();
  for (const d of days) {
    for (const l of Object.keys(per[d])) { linesUsed.add(l); total += per[d][l]; maxVerbatim = Math.max(maxVerbatim, per[d][l]); }
    if (Math.max(...Object.values(per[d])) > 1) verbatimDays++;
  }
  return { maxVerbatim, total, daysWithBeats: days.length, daysWithVerbatimRepeats: verbatimDays, distinctLines: linesUsed.size };
}
function pantryStats(beats) {
  // classify: redirect beat (🌿 shelves are full) vs exempt beat (🍽️ hungry eat first)
  const per = {};
  const wobbles = [];
  for (const b of beats) {
    if (!/checks the pantry/.test(b.text)) continue;
    const kind = b.text.startsWith('🌿') ? 'redirect' : (b.text.startsWith('🍽️') ? 'exempt' : 'other');
    const m = b.text.match(/~(\d+) days/);
    per[b.day] = per[b.day] || { redirect: [], exempt: [], other: [] };
    per[b.day][kind].push(m ? +m[1] : null);
  }
  const days = Object.keys(per);
  let maxRed = 0, maxEx = 0, totalRed = 0, totalEx = 0, redDays = 0, exDays = 0, wobbleDays = 0;
  for (const d of days) {
    const r = per[d].redirect, e = per[d].exempt;
    if (r.length) { redDays++; totalRed += r.length; maxRed = Math.max(maxRed, r.length); if (new Set(r).size > 1) wobbleDays++; }
    if (e.length) { exDays++; totalEx += e.length; maxEx = Math.max(maxEx, e.length); if (new Set(e).size > 1) wobbleDays++; }
  }
  return { maxRed, maxEx, totalRed, totalEx, redDays, exDays, wobbleDays, days: days.length };
}

// ================= PART A: RED (static, on the corpus) =================
function partA() {
  console.log('PART A — RED: corpus census (pre-fix, 32 runs)');
  const runs = corpusRuns();
  if (runs.length !== 32) { console.log('  FATAL: expected 32 corpus runs, got', runs.length); process.exit(1); }
  let gMaxV = 0, gTot = 0, gDaysV = 0;
  let pMaxR = 0, pMaxE = 0, pTotR = 0, pTotE = 0, pWob = 0, pDays = 0;
  for (const r of runs) {
    const ds = depStats(r.beats);
    gMaxV = Math.max(gMaxV, ds.maxVerbatim); gTot += ds.total; gDaysV += ds.daysWithVerbatimRepeats;
    const ps = pantryStats(r.beats);
    pMaxR = Math.max(pMaxR, ps.maxRed); pMaxE = Math.max(pMaxE, ps.maxEx);
    pTotR += ps.totalRed; pTotE += ps.totalEx; pWob += ps.wobbleDays; pDays += ps.days;
  }
  console.log(`  departure-line: ${gTot} verbatim beats, max verbatim/day ${gMaxV}, days w/ verbatim repeats ${gDaysV}`);
  console.log(`  pantry-check: redirect ${pTotR} beats (max ${pMaxR}/day), exempt ${pTotE} beats (max ${pMaxE}/day), days w/ wobbling count ${pWob} of ${pDays}`);
  const redOk = gMaxV >= 5 && pMaxR >= 10;
  console.log(redOk ? '  RED OK — repetition reproduced on corpus' : '  RED FAILED — corpus does not show the bug');
  if (!redOk) process.exit(1);
  return { gMaxV, gTot, pMaxR, pTotR, pMaxE, pTotE, pWob };
}

// ================= PART B: det-gate =================
function dayHash(Game) {
  const s = Game.state.scholar || {}, v = Game.state.village || {};
  const parts = [s.day, Math.round(s.health || 0), Math.round(s.kcal || 0),
    (v.roster || []).length, Game.map.px, Game.map.py,
    Game.unlockedWave ? Game.unlockedWave() : 0,
    Math.round((((v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0))) / 100)];
  return parts.join('|');
}
async function detGateRun(seed, policyId) {
  const { belongfeast, leadfeast } = require('./policies/feastscale');
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  const base = policyId === 'leadfeast' ? leadfeast : belongfeast;
  const { Game } = await loadGame({ seed, mode: 'foodvoice2-detgate', fullTelemetry: false });
  await setupGame(Game);
  const policy = Object.assign({}, base);
  const hs = [];
  const detDays = parseInt(process.env.DETDAYS || '180', 10);
  const oDaily = base.daily;
  policy.daily = (G, ctx) => { try { hs.push(G.state.scholar.day + ':' + dayHash(G)); } catch (e) {} if (oDaily) { try { return oDaily(G, ctx); } catch (e) {} } return undefined; };
  await quietLog(async () => { await runDays(Game, policy, { days: detDays, sampleEvery: 30 }); });
  return hs.join('\n');
}
async function partB() {
  console.log('PART B — det-gate: control (FOODVOICE2_GATE=0) vs armed, identical seeds, per-day state hash');
  const { belongfeast, leadfeast } = require('./policies/feastscale'); // validate env early
  const arms = {};
  for (const armed of [false, true]) {
    process.env.FOODVOICE2_GATE = armed ? '1' : '0';
    arms[armed ? 'armed' : 'control'] = {};
    for (const pid of POLICIES) {
      for (const seed of SEEDS8) {
        const h = await detGateRun(seed, pid);
        arms[armed ? 'armed' : 'control'][`${pid}-${seed}`] = h;
      }
    }
  }
  delete process.env.FOODVOICE2_GATE;
  let same = 0, diff = 0;
  for (const k of Object.keys(arms.control)) {
    if (arms.control[k] === arms.armed[k]) same++;
    else { diff++; console.log('  DIFF:', k); }
  }
  console.log(`  det-gate: ${same}/${same + diff} byte-identical per-day trajectories`);
  if (diff) { console.log('  DET-GATE FAILED'); process.exit(1); }
  console.log('  DET-GATE OK');
}

// ================= PART C: GREEN census + PRIMARY =================
function wallAgg(runs) {
  const a = { national: 0, table: 0, wins: 0, wave4: 0, wave5: 0, exiled: 0, starvDeaths: 0, survival: [] };
  const causes = {};
  for (const r of runs) {
    const w = r.wall || {};
    if (w.national) a.national++;
    if (w.table) a.table++;
    if (w.wins) a.wins++;
    if (w.maxWave >= 4) a.wave4++;
    if (w.maxWave >= 5) a.wave5++;
    if (w.exiled) a.exiled++;
    a.starvDeaths += r.starvationDeaths || 0;
    if (r.days != null) a.survival.push(r.days);
    for (const c of Object.keys(r.deathCauses || {})) causes[c] = (causes[c] || 0) + (r.deathCauses[c] || 0);
  }
  a.survival.sort((x, y) => x - y);
  a.medianSurvival = a.survival.length ? a.survival[Math.floor(a.survival.length / 2)] : null;
  a.causes = causes;
  return a;
}
async function partC() {
  console.log('PART C — GREEN: re-run census armed on the 32 corpus pairs');
  fs.mkdirSync(CENSUS_OUT, { recursive: true });
  const env = Object.assign({}, process.env, { FEASTSCALE_R13: '1', SEATDRIVE: '0', OUT: CENSUS_OUT, DAYS: String(DAYS) });
  delete env.FOODVOICE2_GATE; // armed
  execFileSync('node', [path.join(__dirname, 'census-foodvoice2-b.js')], { env, stdio: 'inherit' });
  const runs = censusRuns(CENSUS_OUT);
  if (runs.length !== 32) { console.log('  FATAL: expected 32 census runs, got', runs.length); process.exit(1); }
  let gMaxV = 0, gTot = 0, gDist = 0;
  let pMaxR = 0, pMaxE = 0, pTotR = 0, pTotE = 0, pWob = 0;
  for (const r of runs) {
    const ds = depStats(r.beats);
    gMaxV = Math.max(gMaxV, ds.maxVerbatim); gTot += ds.total; gDist = Math.max(gDist, ds.distinctLines);
    const ps = pantryStats(r.beats);
    pMaxR = Math.max(pMaxR, ps.maxRed); pMaxE = Math.max(pMaxE, ps.maxEx);
    pTotR += ps.totalRed; pTotE += ps.totalEx; pWob += ps.wobbleDays;
  }
  console.log(`  departure-line armed: ${gTot} verbatim-line beats, max verbatim/day ${gMaxV}, distinct pool lines used ${gDist}`);
  console.log(`  pantry-check armed: redirect ${pTotR} (max ${pMaxR}/day), exempt ${pTotE} (max ${pMaxE}/day), wobble days ${pWob}`);
  const goA = gMaxV <= 2 && gDist >= 4;
  const goB = pMaxR <= 1 && pMaxE <= 1 && pWob === 0;
  console.log(goA ? '  PRIMARY (a) GO' : '  PRIMARY (a) NO-GO');
  console.log(goB ? '  PRIMARY (b) GO' : '  PRIMARY (b) NO-GO');

  // guardrail wall comparison vs corpus
  const corpus = corpusRuns();
  const aw = wallAgg(runs);
  console.log('  wall armed:', JSON.stringify({ national: aw.national, table: aw.table, wins: aw.wins, wave4: aw.wave4, wave5: aw.wave5, exiled: aw.exiled, starvDeaths: aw.starvDeaths, medianSurvival: aw.medianSurvival }));
  // corpus wall (from its own wall key; death-cause shares from corpus not captured — compare via armed only)
  let cNat = 0, cTab = 0, cWin = 0, cW4 = 0, cW5 = 0;
  for (const r of corpus) { const w = r.wall || {}; if ((w.maxRank || 0) >= 2) cNat++; if (w.table) cTab++; if (w.wins) cWin++; if ((w.maxWave || 1) >= 4) cW4++; if ((w.maxWave || 1) >= 5) cW5++; }
  console.log('  wall corpus (pre-fix):', JSON.stringify({ national: cNat, table: cTab, wins: cWin, wave4: cW4, wave5: cW5 }));
  const guard = Math.abs(aw.national - cNat) <= 2 && Math.abs(aw.table - cTab) <= 2 && Math.abs(aw.wins - cWin) <= 2 && Math.abs(aw.wave4 - cW4) <= 2 && Math.abs(aw.wave5 - cW5) <= 2;
  console.log(guard ? '  GUARDRAIL wall metrics OK' : '  GUARDRAIL wall metrics BREACHED');
  if (!goA || !goB || !guard) process.exit(1);
  console.log('  GREEN OK');
}

async function main() {
  const part = process.env.PARTS || 'ABC';
  if (part.includes('A')) partA();
  if (part.includes('B')) await partB();
  if (part.includes('C')) await partC();
  console.log('DONE');
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
