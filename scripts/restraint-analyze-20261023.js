#!/usr/bin/env node
// restraint-analyze-20261023.js — attribution for sim-restraint-b.
//
// *** KILLED-AT-PILOT 2026-10-23 (see evidence/2026-10-23/sim-restraint-b.md).
// Retained as the attribution record; reads the per-seed JSONs. ***
//
// Reads evidence/2026-10-23/perseed-restraint/*.json (mantlechain
// instrument rows + restraint-namespace extensions) and judges the
// pre-registered criteria from evidence/2026-10-23/sim-restraint-b.md.
//
// REUSES (not duplicated): veteranAt + latestSuccession from
// scripts/mantlechain-analyze-20261022.js; combatCause from
// scripts/mantlechain-instr-20261022.js.
//
// PRIMARY (binding, revised per the DIAG's metric review): in-scope =
// veteran (>=1 wave-4+ waveKillLog kill by death day) who died in a
// wave-4 fight (fightWave>=4, combat-cause-gated linkage); chain-
// accelerated = died as the mantle-holder (player death) at ANY
// succession age. GO: restraint pooled <= control pooled - 2.
//
// ENGAGEMENT (mechanism check, reported): fresh-scholar (<=30d in chair)
// wave-4 fight participations per arm — the restraint must reduce exposure.
//
// GUARDRAILS (all binding): villager wave-4 kills armed >= control-2;
// wave-4 unlocks not reduced; median survival armed >= control-10d;
// starvation deaths <= control+2; no new death mode (>=2-event rule);
// scholar-combat-mortality/100d paired diff <= control+2.
//
// Usage: node scripts/restraint-analyze-20261023.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const DIR = path.join(REPO, 'evidence', '2026-10-23', 'perseed-restraint');
const N_DAYS = 30;

const { veteranAt, latestSuccession } = require('./mantlechain-analyze-20261022');
let combatCause = null;
try { combatCause = require('./mantlechain-instr-20261022').combatCause; } catch (e) {}
let MONSTERS = [];
try { MONSTERS = require(path.join(REPO, 'src', 'data', 'monsters.json')); } catch (e) {}
const MONSTER_GAME = { data: { monsters: MONSTERS } };

function inWave4Fight(d) {
  // Same predicate as the DIAG analyzer (live-tbfight always counts;
  // same-day only for combat causes).
  if ((d.fightWave | 0) < 4) return false;
  if (d.fightBasis === 'live-tbfight') return true;
  if (d.fightBasis === 'same-day' && combatCause) {
    try { return combatCause(d.cause, MONSTER_GAME); } catch (e) { return false; }
  }
  return false;
}

// Revised primary bucket (DIAG metric review): the CHAIR is the
// accelerant — chain-accelerated = died as mantle-holder at ANY age.
function attributeRow(row) {
  const { seed, base, arm, successions, deaths, waveKillLog } = row;
  const out = [];
  for (const d of deaths) {
    const who = d.who;
    if (!who || who === '?') continue;
    if (!veteranAt(waveKillLog, who, d.day)) continue;
    if (!inWave4Fight(d)) continue;
    const succ = latestSuccession(successions, who, d.day);
    out.push({
      seed, base, arm, day: d.day, vid: who, name: d.whoName, cause: d.cause,
      fightMid: d.fightMid, fightBasis: d.fightBasis,
      scholarAtDeath: !!d.player,
      succDay: succ ? succ.day : null,
      daysSinceSuccession: succ ? d.day - succ.day : null,
      bucket: d.player ? 'chain-accelerated' : 'baseline-fighter',
    });
  }
  return out;
}

// ENGAGEMENT: fresh-scholar (<=30d in chair) wave-4 fight participations.
function engagement(row) {
  const { successions, fights } = row;
  let fresh = 0, old = 0;
  const seen = new Set();
  for (const f of fights) {
    const k = `d${f.day}|${f.mid}|${f.scholar}`;
    if (seen.has(k)) continue;
    seen.add(k);
    if (!f.scholar) continue;
    const succ = latestSuccession(successions, f.scholar, f.day);
    const age = succ ? f.day - succ.day : 9999;
    if (age <= N_DAYS) fresh++;
    else old++;
  }
  return { fresh, old };
}

function main() {
  const files = fs.readdirSync(DIR).filter(f => /^(control|restraint)-.*-s\d+\.json$/.test(f));
  const rows = files.map(f => JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')));
  const control = rows.filter(r => r.arm === 'control');
  const armed = rows.filter(r => r.arm === 'restraint');
  console.log(`CORPUS: ${rows.length} configs (${control.length} control, ${armed.length} armed)`);

  // ---- PRIMARY ----
  const allC = [], allA = [];
  for (const r of control) allC.push(...attributeRow(r));
  for (const r of armed) allA.push(...attributeRow(r));
  const chainC = allC.filter(a => a.bucket === 'chain-accelerated').length;
  const chainA = allA.filter(a => a.bucket === 'chain-accelerated').length;
  const baseC = allC.filter(a => a.bucket === 'baseline-fighter').length;
  const baseA = allA.filter(a => a.bucket === 'baseline-fighter').length;
  console.log('\nPRIMARY (binding): chain-accelerated veteran wave-4 deaths (any succession age)');
  console.log(`  control: ${chainC} chain / ${baseC} baseline  (in-scope ${allC.length})`);
  console.log(`  armed:   ${chainA} chain / ${baseA} baseline  (in-scope ${allA.length})`);
  console.log(`  BAR: armed <= control-2  →  ${chainA} <= ${chainC - 2}  →  ${chainA <= chainC - 2 ? 'GO' : 'NO-GO'}`);
  for (const a of [...allC, ...allA]) {
    console.log(`    [${a.arm}] s${a.seed}/${a.base} d${a.day} ${a.name} ← ${a.fightMid} (${a.fightBasis}) ${a.scholarAtDeath ? 'AS SCHOLAR' : 'companion'} succ d${a.succDay} (+${a.daysSinceSuccession}d)`);
  }

  // ---- ENGAGEMENT ----
  let fC = 0, oC = 0, fA = 0, oA = 0;
  for (const r of control) { const e = engagement(r); fC += e.fresh; oC += e.old; }
  for (const r of armed) { const e = engagement(r); fA += e.fresh; oA += e.old; }
  console.log('\nENGAGEMENT (mechanism check, reported): fresh-scholar wave-4 fight participations');
  console.log(`  control: fresh=${fC} old=${oC}  armed: fresh=${fA} old=${oA}`);
  console.log(`  exposure delta (fresh): ${fA - fC}  (${fC ? ((fA - fC) / fC * 100).toFixed(0) : 'n/a'}%)`);

  // ---- restraint mechanism counters ----
  const rc = { patrolSkips: 0, holdDays: 0, successions: 0 };
  for (const r of armed) {
    const q = r.restraint || {};
    rc.patrolSkips += q.restraintPatrolSkips | 0;
    rc.holdDays += q.restraintHoldDays | 0;
    rc.successions += q.restraintSuccessions | 0;
  }
  console.log(`\nRESTRAINT mechanism (armed): patrolSkips=${rc.patrolSkips} holdDays=${rc.holdDays} successions=${rc.successions}`);

  // ---- GUARDRAILS ----
  console.log('\nGUARDRAILS (all binding):');
  const sum = (rs, f) => rs.reduce((t, r) => t + (f(r) | 0), 0);
  // villager wave-4 kills = w4kills - scholar kills (kill-time attributed)
  const vkC = sum(control, r => (r.w4kills | 0) - (r.w4scholarKills | 0));
  const vkA = sum(armed, r => (r.w4kills | 0) - (r.w4scholarKills | 0));
  const g1 = vkA >= vkC - 2;
  console.log(`  [${g1 ? 'PASS' : 'FAIL'}] villager wave-4 kills: control=${vkC} armed=${vkA} (bar >= ${vkC - 2})`);
  const w4C = sum(control, r => r.wave4 | 0), w4A = sum(armed, r => r.wave4 | 0);
  const g2 = w4A >= w4C;
  console.log(`  [${g2 ? 'PASS' : 'FAIL'}] wave-4 unlocks not reduced: control=${w4C}/${control.length} armed=${w4A}/${armed.length}`);
  const med = rs => { const d = rs.map(r => r.gameDays | 0).sort((a, b) => a - b); return d.length ? d[Math.floor(d.length / 2)] : null; };
  const mC = med(control), mA = med(armed);
  const g3 = mA >= mC - 10;
  console.log(`  [${g3 ? 'PASS' : 'FAIL'}] median survival: control=${mC}d armed=${mA}d (bar >= ${mC - 10}d)`);
  const sC = sum(control, r => r.starvationDeaths | 0), sA = sum(armed, r => r.starvationDeaths | 0);
  const g4 = sA <= sC + 2;
  console.log(`  [${g4 ? 'PASS' : 'FAIL'}] starvation deaths: control=${sC} armed=${sA} (bar <= ${sC + 2})`);
  // new death mode: a cause with >=2 events in armed absent from control
  const causesC = new Set(), causesA = {};
  for (const r of control) for (const c of Object.keys(r.deathCauses || {})) causesC.add(c);
  for (const r of armed) for (const [c, n] of Object.entries(r.deathCauses || {})) causesA[c] = (causesA[c] || 0) + n;
  const newModes = Object.entries(causesA).filter(([c, n]) => !causesC.has(c) && n >= 2);
  const g5 = newModes.length === 0;
  console.log(`  [${g5 ? 'PASS' : 'FAIL'}] no new death mode (>=2-event rule): ${newModes.length ? JSON.stringify(newModes) : 'none'}`);
  // scholar-combat-mortality per 100d
  const rate = rs => { const d = sum(rs, r => r.scholarCombatDeaths | 0); const t = sum(rs, r => r.gameDays | 0); return t ? d / t * 100 : 0; };
  const rC = rate(control), rA = rate(armed);
  const g6 = (rA - rC) <= 2;
  console.log(`  [${g6 ? 'PASS' : 'FAIL'}] scholar-combat-mortality/100d: control=${rC.toFixed(2)} armed=${rA.toFixed(2)} (bar: diff <= +2, diff=${(rA - rC).toFixed(2)})`);

  // ---- wall numbers ----
  const wall = rs => {
    let national = 0, table = 0, wins = 0, w4 = 0, w5 = 0;
    const days = [], causes = {};
    for (const r of rs) {
      if (r.national) national++; if (r.table) table++; if (r.won) wins++;
      if (r.wave4) w4++; if (r.wave5) w5++;
      days.push(r.gameDays | 0);
      for (const [c, n] of Object.entries(r.deathCauses || {})) causes[c] = (causes[c] || 0) + n;
    }
    days.sort((a, b) => a - b);
    return { n: rs.length, national, table, wins, w4, w5,
      med: days.length ? days[Math.floor(days.length / 2)] : null,
      max: days.length ? days[days.length - 1] : null, causes };
  };
  const wC = wall(control), wA = wall(armed);
  console.log('\nWALL (per arm):');
  for (const [lbl, w] of [['control', wC], ['armed', wA]]) {
    console.log(`  ${lbl}: national ${w.national}/${w.n} table ${w.table}/${w.n} won ${w.wins}/${w.n} wave4 ${w.w4}/${w.n} wave5 ${w.w5}/${w.n} median ${w.med}d max ${w.max}d`);
  }
  console.log('  death-cause shares (control):', JSON.stringify(wC.causes));
  console.log('  death-cause shares (armed):  ', JSON.stringify(wA.causes));

  const errs = rows.reduce((n, r) => n + ((r.instrumentErrors || []).length), 0);
  console.log(`instrument errors: ${errs}`);

  const go = (chainA <= chainC - 2) && g1 && g2 && g3 && g4 && g5 && g6;
  console.log(`\nVERDICT: ${go ? 'GO' : 'NO-GO'} (primary ${chainA <= chainC - 2 ? 'met' : 'MISSED'}; guardrails ${[g1, g2, g3, g4, g5, g6].every(Boolean) ? 'all pass' : 'FAIL'})`);
  return { go, chainC, chainA, fC, fA, guardrails: [g1, g2, g3, g4, g5, g6] };
}

if (require.main === module) { main(); }
module.exports = { attributeRow, engagement, inWave4Fight, N_DAYS };
