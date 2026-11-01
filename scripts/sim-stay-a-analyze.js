#!/usr/bin/env node
// scripts/sim-stay-a-analyze.js — sim-stay-a analyzer + judge.
// Reads two leg corpora (baseline + candidate, plus optional det-gate
// leg) written by scripts/sim-stay-a-sweep.js, decomposes wave-4
// fights identically per leg, judges the prereg bars (G1–G3; G4 sense
// is a human read, passed in as --sense-ok / --sense-fail), and prints
// the verdict. Usage:
//   node scripts/sim-stay-a-analyze.js <baselineDir> <candidateDir>
//     [--detgate <detgateDir>] [--sense-ok|--sense-fail]
//     [--out <analysis.json>]
// Exit 0 on a computed verdict (GO or NO-GO); exit 1 only on missing
// corpus files. A NO-GO verdict is a measurement result, not an error.
'use strict';
const fs = require('fs');
const path = require('path');

function medianOf(arr) {
  if (!arr.length) return null;
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}
function share(n, d) { return d ? +(n / d).toFixed(4) : null; }
function readLeg(dir, seeds) {
  const rows = [];
  for (const seed of seeds) {
    const p = path.join(dir, `s${seed}-played.json`);
    if (!fs.existsSync(p)) return { dir, rows: null, missing: seed };
    rows.push(JSON.parse(fs.readFileSync(p, 'utf8')));
  }
  return { dir, rows, missing: null };
}
function corpusValid(rows, seeds) {
  if (!rows || rows.length !== seeds.length) return false;
  return rows.every(r => r.days > 0
    && r.fieldparty && Array.isArray(r.fieldparty.meetings)
    && r.fieldparty.diag.errs === 0
    && Object.values(r.fieldparty.diag.overflow || {}).every(v => (v | 0) === 0)
    && (r.wrapDiag.errs | 0) === 0
    && r.ammo && (r.ammo.instrumentErrors || []).length === 0
    && (r.ammo.pocketOverflow | 0) === 0);
}
function decompose(rows) {
  const fights = [];
  for (const r of rows) for (const f of (r.wave4Fights || [])) fights.push(Object.assign({ seed: r.seed }, f));
  const offered = fights.length;
  const fought = fights.filter(f => f.outcome !== 'evade');
  const evades = fights.filter(f => f.outcome === 'evade');
  const byOutcome = {};
  for (const f of fought) byOutcome[f.outcome] = (byOutcome[f.outcome] || 0) + 1;
  const roundsDist = {};
  for (const f of fought) roundsDist[f.rounds] = (roundsDist[f.rounds] || 0) + 1;
  const sustained = fought.filter(f => (f.rounds | 0) >= 1).map(f => (f.mDealt | 0) / (f.rounds | 0));
  const medianDpr = medianOf(sustained);
  const healthy = fought.filter(f => (f.mHpStart | 0) >= 91);
  const healthyKills = healthy.filter(f => f.outcome === 'vKill').length;
  const healthyDamageConv = healthy.filter(f => f.outcome === 'vKill' || (f.outcome === 'mFlee' && (f.mDealt | 0) >= 100)).length;
  const round4plus = fought.filter(f => (f.rounds | 0) >= 4);
  const round4plusSurvived = round4plus.filter(f => f.outcome !== 'vDie');
  const totalDealt = fought.reduce((t, f) => t + (f.mDealt | 0), 0);
  const totalAlly = fought.reduce((t, f) => t + (f.allyDealt | 0), 0);
  const totalVolley = fought.reduce((t, f) => t + (f.volleyDmg | 0), 0);
  const joined = fought.filter(f => f.joined);
  const allyDeaths = joined.filter(f => f.allyDied === true).length;
  const allyStruck = joined.filter(f => f.allyTaken > 0).length;
  const leaderDeaths = fought.filter(f => f.outcome === 'vDie').length;
  const byCaller = {};
  for (const f of fought) {
    const c = byCaller[f.caller] || (byCaller[f.caller] = { n: 0, fled: 0, died: 0, driveOff: 0, kill: 0, joined: 0, engineAllies: {} });
    c.n++; if (f.outcome === 'vFlee') c.fled++; if (f.outcome === 'vDie') c.died++;
    if (f.outcome === 'mFlee') c.driveOff++; if (f.outcome === 'vKill') c.kill++;
    if (f.joined) c.joined++;
    c.engineAllies[f.engineAllies] = (c.engineAllies[f.engineAllies] || 0) + 1;
  }
  const deepest = fought.slice().sort((a, b) => (b.mDealt | 0) - (a.mDealt | 0)).slice(0, 5)
    .map(f => ({ seed: f.seed, day: f.day, leader: f.leaderName, mid: f.mid, mHpStart: f.mHpStart, mDealt: f.mDealt, mHpLeft: f.mHpLeft, outcome: f.outcome, rounds: f.rounds }));
  // Wall numbers (reported, never claimed as movement).
  const days = rows.map(r => r.days);
  const wall = {
    seeds: rows.length, won: rows.reduce((t, r) => t + (r.won | 0), 0),
    nationalEver: rows.reduce((t, r) => t + (r.nationalEver | 0), 0),
    nationalFinal: rows.reduce((t, r) => t + (r.nationalFinal | 0), 0),
    table: rows.reduce((t, r) => t + (r.table | 0), 0),
    entered: rows.reduce((t, r) => t + (r.entered | 0), 0),
    wave4Reach: rows.filter(r => (r.waveReach | 0) >= 4).length,
    wave5Reach: rows.filter(r => (r.waveReach | 0) >= 5).length,
    medianDays: medianOf(days), maxDays: Math.max.apply(null, days),
    deathsTotal: rows.reduce((t, r) => t + (r.deathTotal | 0), 0),
    starvationDeaths: rows.reduce((t, r) => t + (r.starvationDeaths | 0), 0),
    deathCauses: {},
  };
  for (const r of rows) for (const [k, v] of Object.entries(r.deaths || {})) wall.deathCauses[k] = (wall.deathCauses[k] || 0) + v;
  // Ammo census (secondary, #1718): ammo.fights are wave-4 only.
  const arows = [];
  for (const r of rows) for (const f of (((r.ammo || {}).fights) || [])) arows.push(Object.assign({ seed: r.seed }, f));
  const ranged = arows.filter(f => f.rangedWeaponId);
  const carried = ranged.filter(f => (f.carriedNeeded | 0) > 0);
  const ammo = {
    fights: arows.length, ranged: ranged.length,
    carriedGt0: carried.length, carriedShare: share(carried.length, ranged.length),
    volleyShots: arows.reduce((t, f) => t + ((f.volley && f.volley.shots) | 0), 0),
    volleyDmg: arows.reduce((t, f) => t + ((f.volley && f.volley.dmg) | 0), 0),
    byWeapon: {},
  };
  for (const f of ranged) {
    const w = ammo.byWeapon[f.rangedWeaponId] || (ammo.byWeapon[f.rangedWeaponId] = { n: 0, carriedGt0: 0 });
    w.n++; if ((f.carriedNeeded | 0) > 0) w.carriedGt0++;
  }
  return {
    offered, fought: fought.length, evades: evades.length, byOutcome,
    shares: { fled: share(byOutcome.vFlee || 0, fought.length), died: share(byOutcome.vDie || 0, fought.length), driveOff: share(byOutcome.mFlee || 0, fought.length), kill: share(byOutcome.vKill || 0, fought.length) },
    roundsDist, medianDpr, healthy: healthy.length, healthyKills, healthyDamageConv,
    round4plus: round4plus.map(f => ({ seed: f.seed, day: f.day, leader: f.leaderName, mid: f.mid, rounds: f.rounds, outcome: f.outcome, mDealt: f.mDealt, mHpStart: f.mHpStart })),
    round4plusSurvived: round4plusSurvived.length,
    componentShares: { leader: share(totalDealt - totalAlly, totalDealt), ally: share(totalAlly, totalDealt), volley: share(totalVolley, totalDealt), totalDealt, totalAlly, totalVolley },
    leaderDeaths, leaderDeathShare: share(leaderDeaths, fought.length),
    joined: joined.length, allyDeaths, allyStruck,
    byCaller, deepest, wall, ammo,
  };
}
function fightIdentity(f) { return [f.day, f.vid, f.mid, f.outcome, f.rounds, f.mDealt].join('|'); }
function compareDetgate(baseRows, gateRows) {
  if (!baseRows || !gateRows) return { ok: false, why: 'missing rows' };
  const diffs = [];
  for (let i = 0; i < baseRows.length; i++) {
    const b = baseRows[i], g = gateRows[i];
    if (!b || !g) { diffs.push(`seed index ${i}: missing row`); continue; }
    if (b.days !== g.days || b.waveReach !== g.waveReach) diffs.push(`s${b.seed}: days ${b.days}→${g.days}, wave ${b.waveReach}→${g.waveReach}`);
    const bi = (b.wave4Fights || []).map(fightIdentity).sort().join('\n');
    const gi = (g.wave4Fights || []).map(fightIdentity).sort().join('\n');
    if (bi !== gi) diffs.push(`s${b.seed}: wave-4 fight identity differs (${(b.wave4Fights || []).length} vs ${(g.wave4Fights || []).length} fights)`);
  }
  return { ok: diffs.length === 0, diffs };
}
function judgePilot(base, cand, senseOk) {
  const g1 = base.valid && cand.valid;
  const signals = {
    round4plusSurvived: cand.dec.round4plusSurvived > 0,
    healthyDamageConv: cand.dec.healthyDamageConv > 0,
    dprDoubled: cand.dec.medianDpr != null && cand.dec.medianDpr >= 22,
  };
  const g2 = signals.round4plusSurvived || signals.healthyDamageConv || signals.dprDoubled;
  const diedDeltaPp = ((cand.dec.shares.died || 0) - (base.dec.shares.died || 0)) * 100;
  const g3 = diedDeltaPp <= 5;
  const g4 = !!senseOk;
  const go = g1 && g2 && g3 && g4;
  return {
    verdict: go ? 'PILOT-GO' : 'NO-GO',
    g1CorpusValid: g1, g2StayingSignal: g2, signals,
    g3DeathGuard: g3, diedShareBase: base.dec.shares.died, diedShareCand: cand.dec.shares.died, diedDeltaPp: +diedDeltaPp.toFixed(2),
    g4Sense: g4,
    reasons: [
      g1 ? 'G1 corpus valid' : 'G1 corpus INVALID',
      g2 ? 'G2 staying signal present' : 'G2 NO staying signal',
      g3 ? 'G3 death guard holds' : 'G3 death guard FAILED (flees converted to deaths)',
      g4 ? 'G4 sense leg read' : 'G4 sense leg NOT read',
    ],
  };
}
function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) { console.error('usage: sim-stay-a-analyze.js <baselineDir> <candidateDir> [--detgate <dir>] [--sense-ok|--sense-fail] [--out <file>] [--seeds 75101,...]'); process.exit(1); }
  const baseDir = args[0], candDir = args[1];
  let detDir = null, senseOk = null, out = null, seeds = [75101, 75102, 75103, 75104, 75105, 75106, 75107, 75108];
  for (let i = 2; i < args.length; i++) {
    if (args[i] === '--detgate') detDir = args[++i];
    else if (args[i] === '--sense-ok') senseOk = true;
    else if (args[i] === '--sense-fail') senseOk = false;
    else if (args[i] === '--out') out = args[++i];
    else if (args[i] === '--seeds') seeds = args[++i].split(',').map(s => parseInt(s, 10));
  }
  const base = readLeg(baseDir, seeds);
  const cand = readLeg(candDir, seeds);
  if (base.missing) { console.error('MISSING baseline seed ' + base.missing); process.exit(1); }
  if (cand.missing) { console.error('MISSING candidate seed ' + cand.missing); process.exit(1); }
  const baseDec = decompose(base.rows), candDec = decompose(cand.rows);
  const result = {
    baseline: { dir: baseDir, valid: corpusValid(base.rows, seeds), dec: baseDec },
    candidate: { dir: candDir, valid: corpusValid(cand.rows, seeds), dec: candDec },
    detgate: null, judge: null,
  };
  if (detDir) {
    const gate = readLeg(detDir, [seeds[0]]);
    const baseOne = readLeg(baseDir, [seeds[0]]);
    result.detgate = gate.missing ? { ok: false, why: 'missing seed ' + gate.missing }
      : compareDetgate(baseOne.rows, gate.rows);
  }
  result.judge = judgePilot(result.baseline, result.candidate, senseOk);
  console.log('=== sim-stay-a pilot judgment ===');
  for (const [label, d] of [['baseline', baseDec], ['candidate', candDec]]) {
    console.log(`--- ${label}: offered=${d.offered} fought=${d.fought} evades=${d.evades}`);
    console.log(`    shares fled=${d.shares.fled} died=${d.shares.died} driveOff=${d.shares.driveOff} kill=${d.shares.kill}`);
    console.log(`    rounds=${JSON.stringify(d.roundsDist)} medianDPR=${d.medianDpr}`);
    console.log(`    healthy>=91: n=${d.healthy} kills=${d.healthyKills} damageConv=${d.healthyDamageConv}`);
    console.log(`    round4+: ${d.round4plus.length} (survived ${d.round4plusSurvived})`);
    console.log(`    components leader=${d.componentShares.leader} ally=${d.componentShares.ally} volley=${d.componentShares.volley} (total ${d.componentShares.totalDealt}, ally ${d.componentShares.totalAlly}, volley ${d.componentShares.totalVolley})`);
    console.log(`    leaderDeaths=${d.leaderDeaths} joined=${d.joined} allyDeaths=${d.allyDeaths} allyStruck=${d.allyStruck}`);
    console.log(`    wall: won=${d.wall.won}/8 nationalEver=${d.wall.nationalEver} nationalFinal=${d.wall.nationalFinal} table=${d.wall.table} entered=${d.wall.entered} wave4=${d.wall.wave4Reach} wave5=${d.wall.wave5Reach} medianDays=${d.wall.medianDays} deaths=${d.wall.deathsTotal} starv=${d.wall.starvationDeaths}`);
    console.log(`    ammo: fights=${d.ammo.fights} ranged=${d.ammo.ranged} carried>0=${d.ammo.carriedGt0} (${d.ammo.carriedShare}) volley=${d.ammo.volleyShots}shots/${d.ammo.volleyDmg}dmg byWeapon=${JSON.stringify(d.ammo.byWeapon)}`);
    console.log(`    deepest: ${JSON.stringify(d.deepest)}`);
  }
  if (result.detgate) console.log(`detgate: ok=${result.detgate.ok} ${result.detgate.diffs ? result.detgate.diffs.join(' | ') : ''}`);
  console.log(`VERDICT: ${result.judge.verdict} (sense=${senseOk === null ? 'PENDING' : senseOk})`);
  for (const r of result.judge.reasons) console.log('  ' + r);
  if (out) fs.writeFileSync(out, JSON.stringify(result, null, 1) + '\n');
}
if (require.main === module) main();
module.exports = { medianOf, share, corpusValid, decompose, fightIdentity, compareDetgate, judgePilot };
