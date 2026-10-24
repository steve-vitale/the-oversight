#!/usr/bin/env node
// postunlock-sense.js — SENSE-TESTING pass for arm sim-postunlock-b2.
// Prints, per config, the final death-day's narration (sayRing, the game's
// single emit() write path) plus the killing-window death rows, so a human
// can judge whether the deaths read as meaningful (a village that earned
// its wave but couldn't hold it) or as mechanical attrition.
// Usage: node scripts/postunlock-sense.js [SEEDS=70201,70209] [CONTEXT=25]
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = process.env.REPO || path.join(__dirname, '..');
const EVID = path.join(REPO, 'evidence', '2026-10-24', 'perseed-postunlock');

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [70201, 70202, 70204, 70209]).filter(Number.isFinite);
const CONTEXT = parseInt(process.env.CONTEXT || '25', 10) || 25;

for (const s of SEEDS) {
  for (const b of ['lead', 'belong']) {
    const fn = path.join(EVID, `s${s}-${b}.json`);
    if (!fs.existsSync(fn)) { console.log(`--- s${s}-${b}: MISSING`); continue; }
    const d = JSON.parse(fs.readFileSync(fn, 'utf8'));
    const rows = (d.postunlockDeaths || []).filter(r => r && r.person !== false);
    if (!rows.length) { console.log(`--- s${s}-${b}: no person deaths (endReason=${d.endReason})`); continue; }
    const lastDay = Math.max.apply(null, rows.map(r => r.day | 0));
    console.log(`\n===== s${s}-${b} | maxWave=${d.maxWave} w4=${d.unlock.w4Day} w5=${d.unlock.w5Day} end=${d.endReason}@${d.days} =====`);
    console.log(`--- narration: last ${CONTEXT} emit() lines at/before day ${lastDay} ---`);
    const ring = (d.sayRing || []).filter(x => x && (x.day | 0) <= lastDay).slice(-CONTEXT);
    for (const x of ring) {
      const t = String(x.text).replace(/\s+/g, ' ').slice(0, 220);
      console.log(`[d${x.day}${x.surface ? '/' + x.surface : ''}] ${t}`);
    }
    console.log(`--- killing window (deaths on day ${lastDay}) ---`);
    for (const r of rows.filter(x => (x.day | 0) === lastDay)) {
      const f = r.fight;
      console.log(`d${r.day} ${r.whoName} | ${r.cause} | opp=${r.oppMid || '?'} w${r.oppWave != null ? r.oppWave : '?'} (${r.fightBasis})` +
        (f ? ` | pack=[${f.monsterIds.join(',')}] tier=${f.overtimeTier} rerun=${f.rerun} party=${f.party.length} scholarIn=${f.scholarIn}` : ' | fight=?') +
        ` | armored=${r.armored} armed=${r.armed} vet4+=${r.veteran4plus} hp=${r.hp}` +
        ` | village{a:${r.village.armored},w:${r.village.armed},v:${r.village.veterans},r:${r.village.roster}}` +
        ` | ot{tier=${r.overtime.tier},active=${r.overtime.active},seat=${r.overtime.seat},tableWaiting=${r.overtime.tableWaiting}}`);
    }
  }
}
