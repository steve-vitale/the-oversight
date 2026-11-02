#!/usr/bin/env node
// sweep-laircontact-a.js — band runner + comparison table for
// sim-laircontact-a (Loop A 20261102, axis scale-onramp). Spawns the
// laircontact driver as one process per (arm, seed) — never two
// harnesses in one process — then prints one comparison row per run
// from the per-seed JSONs. Screening runs (RUN=screen, closecommit
// only) are NOT judged runs; band runs use RUN=r1 at DAYS=180.
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1 HERALD=1 \
//   node scripts/sweep-laircontact-a.js closecommit,musterfed,lairsham,lairnoise 97400,97401
// Env: DAYS (default 180), RUN (default r1). Driver env gates above
// are required by the driver itself.
'use strict';
const path = require('path');
const fs = require('fs');
const { execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const DAYS = process.env.DAYS || '180';
const RUN = process.env.RUN || 'r1';
const arms = (process.argv[2] || 'closecommit').split(',').map(s => s.trim()).filter(Boolean);
const seeds = (process.argv[3] || '').split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
if (!seeds.length) { console.error('SWEEP STOP: seeds required as argv[3], comma-separated.'); process.exit(2); }
const env = Object.assign({}, process.env, { DAYS: DAYS, RUN: RUN });
for (const arm of arms) {
  for (const seed of seeds) {
    const out = execFileSync('node', [path.join(REPO, 'scripts', 'laircontact-driver-20261102.js')],
      { cwd: REPO, env: Object.assign({}, env, { ARM: arm, SEEDS: String(seed) }), encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] });
    const line = out.trim().split('\n').filter(Boolean).pop();
    console.log(line);
  }
}
console.log('--- comparison ---');
for (const seed of seeds) {
  for (const arm of arms) {
    const file = path.join(REPO, 'evidence', '2026-11-02', 'perseed-laircontact-a', `lc-${arm}-s${seed}-${RUN}.json`);
    if (!fs.existsSync(file)) { console.log(`${seed} ${arm} MISSING ${file}`); continue; }
    const r = JSON.parse(fs.readFileSync(file, 'utf8'));
    const win = r.dailyTrace.filter(d => r.callDay != null && d.day >= r.callDay);
    const guardDays = win.filter(d => d.guardBlock).map(d => `${d.day}:${d.guardBlock.fed ? 'F' : 'f'}${d.guardBlock.watered ? 'W' : 'w'}${d.guardBlock.healthy ? 'H' : 'h'}`);
    const engCo = r.attempts.filter(a => a.scholarPos && a.entityPos && a.scholarPos.px === a.entityPos.tx && a.scholarPos.py === a.entityPos.ty).length;
    console.log(`${seed} ${arm} call=${r.callDay} gate=${win.length ? win[0].gate.gateLiving : null} attempts=${r.attemptCount} attDays=${[...new Set(r.attempts.map(a => a.day))].join(',') || '-'} engCo=${engCo}/${r.attemptCount} coLocDays=${win.filter(d => d.coLocated).map(d => d.day).join(',') || '-'} onLair=${win.filter(d => d.onLair).length} guardDays=${guardDays.join(',') || '-'} end=${r.endReason}@${r.gameDays} deaths=${r.deaths}`);
  }
}
