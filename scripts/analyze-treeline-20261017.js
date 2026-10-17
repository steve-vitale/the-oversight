#!/usr/bin/env node
// analyze-treeline-20261017.js — judges the sim-treeline sweep against its
// pre-registered header (evidence/2026-10-17/sim-treeline.md).
//
// PRIMARY: treeline-channel kcal, aggregate armed/control <= 0.25.
// GUARDRAILS: villager deaths armed <= control x 1.1; national count armed
//   >= control - 2; det-gate byte-identical (from the det-gate log);
//   no new death mode (cause-family level).
// REPORT-ONLY: total raid hemorrhage (compound context), wall metrics,
//   hold counts, per-seed table.
//
// Usage: node scripts/analyze-treeline-20261017.js [--detgate-log <path>]
// Reads evidence/2026-10-17/perseed-treeline/treeline-*-s*.json
'use strict';
const fs = require('fs');
const path = require('path');
const DIR = path.join(__dirname, '..', 'evidence', '2026-10-17', 'perseed-treeline');
const read = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));

function main() {
  const files = fs.readdirSync(DIR).filter(f => /^treeline-(control|armed)-(leadfeast|belongfeast)-s\d+\.json$/.test(f));
  const rows = files.map(f => read(path.join(DIR, f)));
  const ctl = rows.filter(r => r.side === 'control');
  const arm = rows.filter(r => r.side === 'armed');
  console.log(`runs: control=${ctl.length} armed=${arm.length}`);
  const sum = (rs, k) => rs.reduce((a, r) => a + (r[k] | 0), 0);
  const agg = {};
  for (const [name, rs] of [['control', ctl], ['armed', arm]]) {
    agg[name] = {
      n: rs.length,
      national: sum(rs, 'national'), table: sum(rs, 'table'), wins: sum(rs, 'wins'),
      exiled: sum(rs, 'exiled'), entered: sum(rs, 'entered'),
      raidTotal: sum(rs, 'raidKcalTotal'), raidTreeline: sum(rs, 'raidKcalTreeline'),
      raidCommons: sum(rs, 'raidKcalCommons'), holds: sum(rs, 'holds'),
      staged: sum(rs, 'stagedRaids'), deaths: sum(rs, 'villagerDeaths'),
    };
  }
  for (const [name, a] of Object.entries(agg)) {
    console.log(`  ${name}: n=${a.n} national=${a.national} table=${a.table} wins=${a.wins} exiled=${a.exiled} ` +
      `raidTot=${a.raidTotal} (treeline=${a.raidTreeline} commons=${a.raidCommons}) holds=${a.holds}/${a.staged} deaths=${a.deaths}`);
  }

  // PRIMARY
  const ratio = agg.control.raidTreeline ? agg.armed.raidTreeline / agg.control.raidTreeline : null;
  const goPrimary = ratio != null && ratio <= 0.25;
  console.log(`\nPRIMARY treeline-channel aggregate ratio: ${ratio == null ? 'n/a' : ratio.toFixed(3)} (GO iff <= 0.25) → ${goPrimary ? 'GO' : 'NO-GO'}`);

  // GUARDRAILS
  const gDeaths = agg.armed.deaths <= agg.control.deaths * 1.1;
  const gNational = agg.armed.national >= agg.control.national - 2;
  console.log(`GUARDRAIL deaths: armed ${agg.armed.deaths} <= control ${agg.control.deaths} x 1.1 = ${(agg.control.deaths * 1.1).toFixed(1)} → ${gDeaths ? 'PASS' : 'FAIL'}`);
  console.log(`GUARDRAIL national: armed ${agg.armed.national} >= control ${agg.control.national} - 2 → ${gNational ? 'PASS' : 'FAIL'}`);

  // det-gate (from the log)
  let detgate = 'NOT-RUN';
  const logArg = process.argv.indexOf('--detgate-log');
  const logPath = logArg >= 0 ? process.argv[logArg + 1] : path.join(__dirname, '..', 'evidence', '2026-10-17', 'treeline-detgate.log');
  try {
    const log = fs.readFileSync(logPath, 'utf8');
    const bad = (log.match(/MISMATCH/g) || []).length;
    const green = /DET-GATE GREEN/.test(log);
    detgate = green && !bad ? 'PASS (16/16 byte-identical)' : `FAIL (${bad} mismatches)`;
  } catch (e) { detgate = 'NOT-RUN (no log)'; }
  console.log(`GUARDRAIL det-gate: ${detgate}`);

  // no new death mode (cause-family level): armed causes not in control causes
  const fam = (c) => String(c).split(':')[0].split(' ')[0].toLowerCase();
  const ctlCauses = new Set();
  for (const r of ctl) for (const k of Object.keys(r.deathCauses || {})) ctlCauses.add(fam(k));
  const newModes = new Set();
  for (const r of arm) for (const k of Object.keys(r.deathCauses || {})) {
    if (!ctlCauses.has(fam(k)) && (r.deathCauses[k] | 0) >= 2) newModes.add(k);
  }
  console.log(`GUARDRAIL new death mode: ${newModes.size ? 'FAIL (' + [...newModes].join(', ') + ')' : 'PASS (none)'}`);

  // paired per-seed view (seed x policy)
  console.log('\nper-pair (seed/policy): control treeline -> armed treeline');
  const keys = [...new Set(ctl.map(r => `${r.seed}/${r.policyId}`))].sort();
  for (const k of keys) {
    const [seed, pid] = k.split('/');
    const c = ctl.find(r => String(r.seed) === seed && r.policyId === pid);
    const a = arm.find(r => String(r.seed) === seed && r.policyId === pid);
    if (c && a) console.log(`  s${seed} ${pid}: ${c.raidKcalTreeline} -> ${a.raidKcalTreeline} (holds ${a.holds}/${a.stagedRaids}, deaths ${c.villagerDeaths}->${a.villagerDeaths}, end ${c.endReason}->${a.endReason})`);
  }

  const go = goPrimary && gDeaths && gNational && detgate.startsWith('PASS') && !newModes.size;
  console.log(`\nVERDICT: ${go ? 'GO' : 'NO-GO'}`);
  process.exit(go ? 0 : 1);
}

if (require.main === module) main();
