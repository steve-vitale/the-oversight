// Joint-foraging kept-promise chain analyzer for landing r118 (Q1 PRIMARY).
// Reads landing census JSONs (DIR = argv[2]) and builds, per distinct
// forage_help favorId, the furthest rung reached on the chain:
//   asked -> waited -> departed -> together-ok -> haul>0 -> deliver -> kept
// plus broken/open outcomes and the break reason at the furthest rung.
// Inputs per census: d.series[].outing snaps (favorId, waiting, run{startedDay,
// forageCount, playerKcal, partnerKcal, deliveredKcal, returned}, promiseKept
// with the R71-amendment-4 id match) and d.r41Summary.{outingOpps,
// outingAttempts, outingTeleDepart/Together/Return/Talk}.
// Attempts join to favors by vid + day inside the favor's seen window (a vid
// holds at most one live forage_help favor at a time — the game blocks
// starting another while one is live, favor-forage.js forageFavorAction).
// Node attribution: together attempts carry node {x,y,d} (r118 driver);
// near = d<=3 (the solo daily's own picked ground), far = d 4-5 (fresh
// patches). The r117 corpus has no node field — those presses count as
// node-unknown, never as near or far.
// Pre-registered verdicts (r118 prereg):
//   CHAIN-COMPLETES-FAR  if keptTotal >= 1 with haul from a far node.
//   CHAIN-COMPLETES-NEAR if keptTotal >= 1 with haul from near nodes only.
//   DELIVERY-RUNG        if keptTotal == 0 and >=1 favor reached haul>0 but
//                        none reached deliver.
//   H-KNOW               if keptTotal == 0, haul 0 on all favors, and >=1
//                        far-node together-ok press returned 0 edible kcal
//                        (hands-empty: press ok, yield unknown-only).
//   H-HOP                if keptTotal == 0, haul 0 on all favors, and far
//                        nodes were unreached on every evening attempt.
//   CONTRADICTION        if a together attempt ok=true carries haul>0 while
//                        the favor shows no run in any snap — stop, adjudicate.
//   OPEN                 otherwise (furthest-rung distribution reported).
'use strict';
const fs = require('fs');
const path = require('path');
const DIR = process.argv[2] || path.join(process.env.HOME || '/home/hatch',
  'workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-11-08/landing-r118');

const files = fs.readdirSync(DIR).filter(f => /census-\d+\.json$/.test(f)).sort();
if (files.length === 0) { console.log('OUTINGCHAIN: no census files in ' + DIR); process.exit(2); }

const RUNGS = ['asked', 'waited', 'departed', 'together-ok', 'haul>0', 'deliver', 'kept'];
const pooled = {
  seeds: 0, favors: 0, waits: 0, departs: 0, togetherOk: 0, haulFavors: 0,
  deliverOk: 0, kept: 0, broken: 0, open: 0,
  farTogetherOk: 0, nearTogetherOk: 0, unknownTogetherOk: 0,
  farHaul: 0, nearHaul: 0, unknownHaul: 0,
  handsEmpty: 0, pressFail: 0, farUnreached: 0, nearUnreached: 0,
};
const rungCounts = {}; for (const r of RUNGS) rungCounts[r] = 0;
const eveningBlockedReasons = {};
const breakReasons = {};
let contradiction = null;

function classifyEveningLine(line) {
  // nodeFails entries: "(3,3):press-fail" (r117) or "(3,3,d2):unreached" (r118).
  const out = [];
  const re = /\((\d+),(\d+)(?:,d(\d+))?\):([a-z-]+)/g;
  let m;
  while ((m = re.exec(line || '')) !== null) {
    out.push({ x: +m[1], y: +m[2], d: m[3] == null ? null : +m[3], reason: m[4] });
  }
  return out;
}

for (const f of files) {
  const d = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
  const seed = d.seed;
  const sum = d.r41Summary || {};
  const series = d.series || [];
  const attempts = sum.outingAttempts || [];
  const favors = {}; // favorId -> chain record
  for (const row of series) {
    const day = row.day;
    for (const o of (row.outing || [])) {
      if (!o || o.favorId == null) continue;
      const id = String(o.favorId);
      const rec = favors[id] || (favors[id] = {
        favorId: id, vid: o.vid, name: o.name, firstDay: day, lastDay: day,
        askedDay: o.askedDay ?? null, waited: false, departed: false,
        togetherOk: 0, maxHaul: 0, deliveredKcal: 0, returned: false,
        kept: false, broken: false, finalState: o.favorState || null,
        runSeen: false, farHaul: false, nearHaul: false, unknownHaul: false,
        farTogetherOk: 0, nearTogetherOk: 0, unknownTogetherOk: 0,
        handsEmpty: 0, pressFail: 0, lastBlock: null, deliverOk: false,
      });
      rec.lastDay = day;
      if (o.waiting) rec.waited = true;
      if (o.run) {
        rec.runSeen = true;
        if (o.run.startedDay != null) rec.departed = true;
        const haul = (o.run.playerKcal || 0) + (o.run.partnerKcal || 0);
        if (haul > rec.maxHaul) rec.maxHaul = haul;
        if ((o.run.deliveredKcal || 0) > rec.deliveredKcal) rec.deliveredKcal = o.run.deliveredKcal;
        if (o.run.returned) rec.returned = true;
      }
      // R71 amendment 4: kept must belong to THIS favor.
      if (o.promiseKept === true && o.promiseFavorId === o.favorId) rec.kept = true;
      if (o.favorState === 'broken') rec.broken = true;
      rec.finalState = o.favorState || rec.finalState;
    }
  }
  // Dawn opps: the snap's waiting flag is read at day-change, so it misses
  // a dawn wait that already departed by snapshot time — the opp record is
  // the authority for "waited" (r117: 4 waits — Ruby, Oliver, Benoit, Tom —
  // all show waiting=false in every snap but waiting=true in their opps).
  // A 'depart' attempt ok=true is a second source for "departed".
  const opps = sum.outingOpps || [];
  for (const o of opps) {
    if (!o || !o.waiting) continue;
    let rec = null;
    if (o.favorId != null) rec = favors[String(o.favorId)] || null;
    if (!rec) {
      const cands = Object.values(favors).filter(r => r.vid === o.vid && o.day >= r.firstDay && o.day <= r.lastDay + 1);
      cands.sort((x, y) => y.lastDay - x.lastDay);
      rec = cands[0] || null;
    }
    if (rec) rec.waited = true;
  }
  // Join attempts by vid + day inside the favor's seen window.
  for (const a of attempts) {
    const cands = Object.values(favors).filter(r => r.vid === a.vid && a.day >= r.firstDay && a.day <= r.lastDay + 1);
    if (!cands.length) continue;
    // The favor whose window contains the day; prefer the one most recently seen.
    cands.sort((x, y) => y.lastDay - x.lastDay);
    const rec = cands[0];
    const haul = (a.playerKcal || 0) + (a.partnerKcal || 0);
    if (a.kind === 'depart' && a.ok) rec.departed = true;
    if (a.kind === 'together' && a.ok) {
      rec.togetherOk++;
      const nd = a.node && Number.isFinite(a.node.d) ? a.node.d : null;
      if (nd == null) { rec.unknownTogetherOk++; }
      else if (nd <= 3) { rec.nearTogetherOk++; }
      else { rec.farTogetherOk++; }
      if (haul > 0) {
        if (nd == null) { rec.unknownHaul = true; }
        else if (nd <= 3) { rec.nearHaul = true; }
        else { rec.farHaul = true; }
      } else {
        rec.handsEmpty++;
      }
      if (haul > 0 && !rec.runSeen) {
        contradiction = `seed ${seed} ${rec.name} favor ${rec.favorId}: together attempt d${a.day} ok with haul ${haul} but no run in any snap`;
      }
    } else if (a.kind === 'together' && !a.ok) {
      rec.pressFail++;
      rec.lastBlock = 'press-fail: ' + String(a.line || '').slice(0, 100);
    } else if (a.kind === 'together-blocked') {
      rec.lastBlock = 'together-blocked: ' + String(a.line || '').slice(0, 100);
    } else if (a.kind === 'evening-blocked') {
      const entries = classifyEveningLine(a.line);
      if (entries.length) {
        for (const e of entries) {
          const key = e.reason + (e.d == null ? '' : (e.d <= 3 ? ':near' : ':far'));
          eveningBlockedReasons[key] = (eveningBlockedReasons[key] || 0) + 1;
          if (e.reason === 'unreached') { if (e.d != null && e.d > 3) pooled.farUnreached++; else pooled.nearUnreached++; }
        }
        rec.lastBlock = 'evening-blocked: ' + String(a.line || '').slice(0, 120);
      } else {
        eveningBlockedReasons[String(a.line || '?').slice(0, 60)] = (eveningBlockedReasons[String(a.line || '?').slice(0, 60)] || 0) + 1;
        rec.lastBlock = 'evening-blocked: ' + String(a.line || '').slice(0, 120);
      }
    } else if (a.kind === 'deliver-blocked' || a.kind === 'walkhome-blocked' || a.kind === 'evening-home-fail') {
      rec.lastBlock = a.kind + ': ' + String(a.line || '').slice(0, 120);
    } else if ((a.kind === 'deliver-day' || a.kind === 'deliver-walkhome' || a.kind === 'deliver') && a.ok) {
      rec.deliverOk = true;
    }
  }
  // Furthest rung + outcome per favor.
  let sFavors = 0, sWaits = 0, sDeparts = 0, sTog = 0, sHaul = 0, sDel = 0, sKept = 0, sBroken = 0, sOpen = 0;
  for (const rec of Object.values(favors)) {
    sFavors++;
    let rung = 'asked';
    if (rec.waited) rung = 'waited';
    if (rec.departed) rung = 'departed';
    if (rec.togetherOk > 0) rung = 'together-ok';
    if (rec.maxHaul > 0) rung = 'haul>0';
    if (rec.deliverOk || rec.deliveredKcal > 0) rung = 'deliver';
    if (rec.kept) rung = 'kept';
    rec.rung = rung;
    rungCounts[rung]++;
    if (rec.waited) sWaits++;
    if (rec.departed) sDeparts++;
    if (rec.togetherOk > 0) sTog++;
    if (rec.maxHaul > 0) sHaul++;
    if (rec.deliverOk || rec.deliveredKcal > 0) sDel++;
    if (rec.kept) { sKept++; }
    else if (rec.broken) { sBroken++; }
    else { sOpen++; }
    if (rec.farHaul) pooled.farHaul++;
    if (rec.nearHaul) pooled.nearHaul++;
    if (rec.unknownHaul) pooled.unknownHaul++;
    pooled.farTogetherOk += rec.farTogetherOk;
    pooled.nearTogetherOk += rec.nearTogetherOk;
    pooled.unknownTogetherOk += rec.unknownTogetherOk;
    pooled.handsEmpty += rec.handsEmpty;
    pooled.pressFail += rec.pressFail;
    if (rec.lastBlock) {
      const k = rec.lastBlock.split(':')[0];
      breakReasons[k] = (breakReasons[k] || 0) + 1;
    }
    console.log(`  CHAIN seed ${seed} ${rec.name} ${rec.favorId} rung=${rung} waited=${rec.waited} departed=${rec.departed} togOk=${rec.togetherOk} (near ${rec.nearTogetherOk}/far ${rec.farTogetherOk}/unk ${rec.unknownTogetherOk}) maxHaul=${rec.maxHaul} delivered=${rec.deliveredKcal} kept=${rec.kept} broken=${rec.broken} state=${rec.finalState}${rec.lastBlock ? ' break=[' + rec.lastBlock.slice(0, 110) + ']' : ''}`);
  }
  pooled.seeds++; pooled.favors += sFavors; pooled.waits += sWaits; pooled.departs += sDeparts;
  pooled.togetherOk += sTog; pooled.haulFavors += sHaul; pooled.deliverOk += sDel;
  pooled.kept += sKept; pooled.broken += sBroken; pooled.open += sOpen;
  console.log(`seed ${seed}: favors=${sFavors} waits=${sWaits} departs=${sDeparts} togetherOkFavors=${sTog} haulFavors=${sHaul} deliverFavors=${sDel} kept=${sKept} broken=${sBroken} open=${sOpen} tele=dep${sum.outingTeleDepart || 0}/tog${sum.outingTeleTogether || 0}/ret${sum.outingTeleReturn || 0}/talk${sum.outingTeleTalk || 0}`);
}

console.log(`OUTINGCHAIN SUMMARY: seeds=${pooled.seeds} favors=${pooled.favors} kept=${pooled.kept} broken=${pooled.broken} open=${pooled.open} waits=${pooled.waits} departs=${pooled.departs} togetherOkFavors=${pooled.togetherOk} haulFavors=${pooled.haulFavors} deliverFavors=${pooled.deliverOk} farHaul=${pooled.farHaul} nearHaul=${pooled.nearHaul} unknownHaul=${pooled.unknownHaul}`);
console.log(`OUTINGCHAIN TOGETHER: farOk=${pooled.farTogetherOk} nearOk=${pooled.nearTogetherOk} unknownOk=${pooled.unknownTogetherOk} handsEmpty=${pooled.handsEmpty} pressFail=${pooled.pressFail} farUnreached=${pooled.farUnreached} nearUnreached=${pooled.nearUnreached}`);
console.log(`OUTINGCHAIN RUNGS: ${RUNGS.map(r => `${r}=${rungCounts[r]}`).join(' ')}`);
console.log(`OUTINGCHAIN EVENING-BLOCKED: ${JSON.stringify(eveningBlockedReasons)}`);
console.log(`OUTINGCHAIN BREAKS: ${JSON.stringify(breakReasons)}`);
if (contradiction) {
  console.log('OUTINGCHAIN: CONTRADICTION (' + contradiction + ' — stop, adjudicate, no verdict)');
} else if (pooled.kept >= 1 && pooled.farHaul >= 1) {
  console.log('OUTINGCHAIN: CHAIN-COMPLETES-FAR (kept >= 1 with haul from a far node — H-FAR established)');
} else if (pooled.kept >= 1) {
  console.log('OUTINGCHAIN: CHAIN-COMPLETES-NEAR (kept >= 1 with haul from near nodes only — H-FAR falsified as stated)');
} else if (pooled.haulFavors >= 1) {
  console.log('OUTINGCHAIN: DELIVERY-RUNG (haul reached on >= 1 favor but no deliver — the delivery rung breaks)');
} else if (pooled.farTogetherOk >= 1 && pooled.handsEmpty >= 1 && pooled.haulFavors === 0) {
  console.log('OUTINGCHAIN: H-KNOW (far-node presses return 0 edible kcal — the chain is knowledge-gated, not patch-gated)');
} else if (pooled.farUnreached > 0 && pooled.farTogetherOk === 0 && pooled.haulFavors === 0) {
  console.log('OUTINGCHAIN: H-HOP (far nodes unreached on every evening attempt — the chain is routing-gated)');
} else {
  console.log('OUTINGCHAIN: OPEN (no verdict — furthest-rung distribution reported above)');
}
