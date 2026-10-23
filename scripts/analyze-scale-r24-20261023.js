#!/usr/bin/env node
// R24 gate extraction: one table row per seed from census + seatWatch +
// table-approach lines. Reads the journey-scale-r24-lead evidence dir.
const fs = require('fs');
const path = require('path');
const DIR = path.join(process.env.HOME, 'workspace/the-scattering/evidence/2026-10-23/journey-scale-r24-lead');
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [70001, 70002, 70003, 70004]);
const rows = [];
for (const s of SEEDS) {
  const cpath = path.join(DIR, `journey-scale-r24-lead-${s}.json`);
  if (!fs.existsSync(cpath)) { rows.push({ seed: s, missing: true }); continue; }
  const c = JSON.parse(fs.readFileSync(cpath, 'utf8'));
  const cc = c.census || {};
  const sw = cc.seatWatch || [];
  const lastSeat = sw.length ? sw[sw.length - 1] : {};
  const gn = cc.globalNotes || [];
  let tableLines = [];
  try { tableLines = fs.readFileSync(path.join(DIR, `journey-scale-r24-table-${s}.txt`), 'utf8').split('\n').filter(Boolean); } catch (e) {}
  const d = cc.tableSeatDetail || {};
  rows.push({
    seed: s, day: cc.day, over: cc.over, pop: `${cc.popAlive}/${cc.popTotal}`,
    rank: cc.scaleRank, nationalDay: cc.nationalDay, globalDay: cc.globalDay,
    natVoiced: cc.nationalVoiced, globVoiced: cc.globalVoiced,
    globalAnswers: gn.map(g => `d${g.day}:${g.how}`),
    seat: cc.tableSeat, arc: cc.arcNow, tableWaiting: cc.tableWaiting, tableAnnounced: cc.tableAnnounced,
    seatDetail: d.seat ? undefined : { w1: d.w1, w2: d.w2, w3: d.w3, contestsN: d.contestsN, crisesN: d.crisesN, rank: d.rank, stage: d.stage, foodDeeds: d.foodDeeds },
    seatTrajectory: sw.filter((_, i) => i % 2 === 0 || i === sw.length - 1).map(x => `d${x.day}:${x.seat}/a${x.arc}${x.tableWaiting ? '/tW' : ''}`),
    tableLines: tableLines.length,
    tableSamples: tableLines.slice(0, 4).map(t => t.slice(0, 150)),
  });
}
console.log(JSON.stringify(rows, null, 1));
