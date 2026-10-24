#!/usr/bin/env node
// R28 governance extraction: one row per seed — G1 tribute arrivals post-
// national, G2 court/calendar lines post-first-court, G3 granary draws,
// plus the r27 stay-green spine (national, rank, seat, survival).
// Reads the journey-scale-r28-lead evidence dir.
'use strict';
const fs = require('fs');
const path = require('path');
const DIR = path.join(__dirname, '..', 'evidence', '2026-10-24', 'journey-scale-r28-lead');
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [83001, 83002, 83003, 83004]);
const rows = [];
for (const s of SEEDS) {
  const cpath = path.join(DIR, `journey-scale-r28-lead-${s}.json`);
  if (!fs.existsSync(cpath)) { rows.push({ seed: s, missing: true }); continue; }
  const c = JSON.parse(fs.readFileSync(cpath, 'utf8'));
  const cc = c.census || {};
  const gov = cc.govWatch || [];
  const byCls = (cls) => gov.filter(g => g.cls === cls);
  const natDay = cc.nationalDay;
  const courtDay = cc.firstCourtDay;
  // G2: courtLine entries strictly after the first-court day, excluding any
  // line that IS a first-court staging line (feast/host/cold offer text).
  const courtPost = byCls('courtLine').filter(g => courtDay == null || g.day > courtDay);
  const tribPostNat = byCls('tribArrive').filter(g => natDay == null || g.day > natDay);
  rows.push({
    seed: s, day: cc.day, over: cc.over, overCause: cc.overCause,
    pop: `${cc.popAlive}/${cc.popTotal}`,
    rank: cc.scaleRank, nationalDay: natDay, globalDay: cc.globalDay,
    natVoiced: cc.nationalVoiced, firstCourtDay: courtDay,
    seat: cc.tableSeat, arc: cc.arcNow, tableWaiting: cc.tableWaiting,
    leaguePoolKcal: cc.leaguePoolKcal,
    linkTribute: cc.linkTribute || [],
    // G1
    tribArriveTotal: byCls('tribArrive').length,
    tribArrivePostNational: tribPostNat.length,
    tribArrivePostNationalDays: tribPostNat.slice(0, 8).map(g => g.day),
    tribShortTotal: byCls('tribShort').length,
    tribShortSamples: byCls('tribShort').slice(0, 3).map(g => `d${g.day}: ${g.line.slice(0, 140)}`),
    tribArriveSamples: byCls('tribArrive').slice(0, 3).map(g => `d${g.day}: ${g.line.slice(0, 140)}`),
    // G2
    courtLineTotal: byCls('courtLine').length,
    courtPostFirstCourt: courtPost.length,
    courtPostSamples: courtPost.slice(0, 5).map(g => `d${g.day}: ${g.line.slice(0, 140)}`),
    // G3
    feastCourt: byCls('feastCourt').length,
    granaryDrawTotal: byCls('granaryDraw').length,
    granaryDrawSamples: byCls('granaryDraw').slice(0, 3).map(g => `d${g.day}: ${g.line.slice(0, 140)}`),
    govAnnounce: byCls('govAnnounce').length,
    deaths: (cc.deathLog || []).length,
  });
}
console.log(JSON.stringify(rows, null, 1));
