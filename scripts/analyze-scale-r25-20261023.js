#!/usr/bin/env node
// R25 gate extraction: one table row per seed from census + seatWatch +
// table-approach lines, with full-seat component reach. Reads the
// journey-scale-r25-fullseat evidence dir.
const fs = require('fs');
const path = require('path');
const DIR = path.join(process.env.HOME, 'workspace/worktrees/journey-scale/evidence/2026-10-23/journey-scale-r25-fullseat');
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [80001, 80002, 80003, 80004]);
function reach(last) {
  if (!last || !last.fullDetail) return { w1: 0, w2: 0, w3: 0, w4: 0, w5: 0, contests: 0, crises: 0, stage: 0, foodDeeds: false, fullOk: false };
  const f = last.fullDetail;
  return { w1: f.w1 | 0, w2: f.w2 | 0, w3: f.w3 | 0, w4: f.w4 | 0, w5: f.w5 | 0, contests: f.contestsN | 0, crises: f.crisesN | 0, stage: f.stage | 0, foodDeeds: !!f.foodDeeds, fullOk: !!last.fullOk };
}
function missing(r) {
  const m = [];
  if (r.w1 < 5) m.push(`w1:${r.w1}/5`); if (r.w2 < 5) m.push(`w2:${r.w2}/5`);
  if (r.w3 < 4) m.push(`w3:${r.w3}/4`); if (r.w4 < 3) m.push(`w4:${r.w4}/3`);
  if (r.w5 < 2) m.push(`w5:${r.w5}/2`);
  if (r.contests < 3) m.push(`contests:${r.contests}/3`);
  if (r.crises < 3) m.push(`crises:${r.crises}/3`);
  if (r.stage < 2) m.push(`stage:${r.stage}/2`);
  if (!r.foodDeeds) m.push('foodDeeds:0');
  return m;
}
const rows = [];
for (const s of SEEDS) {
  const cpath = path.join(DIR, `journey-scale-r25-fullseat-${s}.json`);
  if (!fs.existsSync(cpath)) { rows.push({ seed: s, missing: true }); continue; }
  const c = JSON.parse(fs.readFileSync(cpath, 'utf8'));
  const cc = c.census || {};
  const sw = cc.seatWatch || [];
  const lastSeat = sw.length ? sw[sw.length - 1] : {};
  const r = reach(lastSeat);
  const gn = cc.globalNotes || [];
  let tableLines = [];
  try { tableLines = fs.readFileSync(path.join(DIR, `journey-scale-r25-table-${s}.txt`), 'utf8').split('\n').filter(Boolean); } catch (e) {}
  const w5 = cc.wave5FacedDetail || {};
  rows.push({
    seed: s, day: cc.day, over: cc.over, overCause: cc.overCause, pop: `${cc.popAlive}/${cc.popTotal}`,
    rank: cc.scaleRank, nationalDay: cc.nationalDay, globalDay: cc.globalDay,
    natVoiced: cc.nationalVoiced, globVoiced: cc.globalVoiced,
    globalAnswers: gn.map(g => `d${g.day}:${g.how}`),
    seat: cc.tableSeat, arc: cc.arcNow, tableWaiting: cc.tableWaiting, tableAnnounced: cc.tableAnnounced,
    fullSeatEver: sw.some(x => x.fullOk),
    fullReach: r,
    missingBars: missing(r),
    w5faced: w5.w5, w5voiced: cc.wave5Voiced || null,
    seatHonestyVoiced: cc.seatHonestyVoiced,
    seatTrajectory: sw.filter((_, i) => i % 2 === 0 || i === sw.length - 1).map(x => `d${x.day}:${x.seat}${x.fullOk ? '/FULL' : ''}/a${x.arc}${x.tableWaiting ? '/tW' : ''}`),
    tableLines: tableLines.length,
    tableSamples: tableLines.slice(0, 4).map(t => t.slice(0, 160)),
  });
}
console.log(JSON.stringify(rows, null, 1));
