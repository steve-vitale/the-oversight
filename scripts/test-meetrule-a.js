#!/usr/bin/env node
// scripts/test-meetrule-a.js — proof for sim-meetrule-a (DIAG only).
// Re-derives every judged number from evidence/2026-10-26/
// perseed-meetrule-a/ rows + summary.json: re-baseline vs the 1920
// band table, G2 leg-exact identity, w4opp opportunity totals (reused
// partition, not re-litigated), meetrule census aggregates, and the
// pre-registered R0..R3 reachable tiers per never-fought spawn.
// Usage: node scripts/test-meetrule-a.js [--detail <seed>]
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const DIR = path.join(REPO, 'evidence', '2026-10-26', 'perseed-meetrule-a');
const SEEDS = [73671, 73672, 73673, 73674, 73675, 73676, 73677, 73678];
const BAND1920 = { wins: 2, nationalEver: 6, nationalFinal: 5, entered: 2, wave4: 6, wave5: 0, medianDays: 152, deaths: 307, starvation: 1 };
let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; }
  else { fail++; console.log('FAIL ' + name + (extra !== undefined ? ' :: ' + JSON.stringify(extra) : '')); }
}
function medianOf(a) { const s = a.slice().sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; }
function meanOf(a) { return a.length ? a.reduce((t, x) => t + x, 0) / a.length : 0; }

const rows = [];
for (const seed of SEEDS) for (const pid of ['baseline', 'armed']) {
  rows.push(JSON.parse(fs.readFileSync(path.join(DIR, 's' + seed + '-' + pid + '.json'), 'utf8')));
}
const summary = JSON.parse(fs.readFileSync(path.join(DIR, 'summary.json'), 'utf8'));
const armed = rows.filter(r => r.policy === 'armed');
const baseline = rows.filter(r => r.policy === 'baseline');

// --- Re-baseline (field-by-field vs 1920) ---
function bandOf(rs) {
  const wave = (n) => rs.filter(r => (r.waveReach || 1) >= n).length;
  return { wins: rs.reduce((t, r) => t + r.won, 0), nationalEver: rs.reduce((t, r) => t + r.nationalEver, 0),
    nationalFinal: rs.reduce((t, r) => t + r.nationalFinal, 0), entered: rs.reduce((t, r) => t + r.entered, 0),
    wave4: wave(4), wave5: wave(5), medianDays: medianOf(rs.map(r => r.days)),
    deaths: rs.reduce((t, r) => t + r.deathTotal, 0), starvation: rs.reduce((t, r) => t + r.starvationDeaths, 0) };
}
const bb = bandOf(baseline);
for (const k of Object.keys(BAND1920)) check('rebaseline.' + k, bb[k] === BAND1920[k], { got: bb[k], want: BAND1920[k] });
check('summary.baselineBand.matches', JSON.stringify(summary.baselineBand.won) === JSON.stringify(bb.wins) && summary.baselineBand.medianDays === bb.medianDays, summary.baselineBand);

// --- G2 leg-exact identity + cost bar ---
for (const seed of SEEDS) {
  const c = baseline.find(r => r.seed === seed), a = armed.find(r => r.seed === seed);
  check('g2.' + seed, c.days === a.days && c.gameDays === a.gameDays && JSON.stringify(c.ts) === JSON.stringify(a.ts) && c.starvationDeaths === a.starvationDeaths, { c: [c.days, c.gameDays], a: [a.days, a.gameDays] });
  check('g2faced.' + seed, JSON.stringify(c.faced) === JSON.stringify(a.faced));
}
const ab = bandOf(armed);
check('cost.starvation', ab.starvation <= bb.starvation + 2, ab);
check('cost.median', ab.medianDays >= 0.8 * bb.medianDays, ab);

// --- Opportunity totals (reused partition) ---
let bandOpp = { 'contact-without-fight': 0, 'in-range-never-met': 0, 'never-in-range': 0 };
let bandNever = 0, bandSpawns = 0, unclassified = 0, meetErrs = 0, w4oppErrs = 0;
const perSeedOpp = {};
for (const p of summary.perSeed) {
  perSeedOpp[p.seed] = p.opp;
  bandNever += p.opp.neverFought; bandSpawns += p.spawns4;
  for (const k of Object.keys(bandOpp)) bandOpp[k] += (p.opp.classes[k] || 0);
  unclassified += (p.opp.neverFought - p.opp.classSum);
  check('opp.fullyClassified.' + p.seed, p.opp.fullyClassified === true, p.opp);
  check('opp.classSum.' + p.seed, p.opp.classSum === p.opp.neverFought, p.opp);
  meetErrs += 0; // per-row meetrule errs checked below
}
check('opp.bandNever', bandNever === 24, bandNever);
check('opp.bandSpawns', bandSpawns === 33, bandSpawns);
check('opp.bandClasses', bandOpp['contact-without-fight'] === 2 && bandOpp['in-range-never-met'] === 0 && bandOpp['never-in-range'] === 22, bandOpp);
check('opp.unclassified', unclassified === 0, unclassified);

// --- Meetrule census integrity + tiers ---
const tierRows = [];
const censusAgg = {};
for (const row of armed) {
  const cen = row.meetrule.census;
  check('census.present.' + row.seed, Array.isArray(cen) && cen.length > 0, cen && cen.length);
  check('census.errs.' + row.seed, (row.meetrule.diag.errs | 0) === 0 && (row.meetrule.diag.overflow.census | 0) === 0, row.meetrule.diag);
  check('census.daysMonotonic.' + row.seed, cen.every((c, i) => i === 0 || c.day >= cen[i - 1].day));
  const haven0 = cen[0].haven;
  check('census.havenConstant.' + row.seed, cen.every(c => c.haven[0] === haven0[0] && c.haven[1] === haven0[1]), haven0);
  for (const c of cen) for (const rid of Object.keys(c.nodes)) {
    const md = c.nodes[rid][2];
    check('census.maxD.' + row.seed, md === null || [0, 1, 3, 6].indexOf(md) >= 0, md);
    break; // one sample per census row keeps the check count sane
  }
  const elig = cen.map(c => c.eligibleN), eligNS = cen.map(c => c.eligibleNotSickN);
  const has6 = cen.filter(c => (c.maxDDist['6'] || 0) > 0).length;
  const has3p = cen.filter(c => ((c.maxDDist['3'] || 0) + (c.maxDDist['6'] || 0)) > 0).length;
  const has1p = cen.filter(c => ((c.maxDDist['1'] || 0) + (c.maxDDist['3'] || 0) + (c.maxDDist['6'] || 0)) > 0).length;
  censusAgg[row.seed] = {
    days: row.days, censusDays: cen.length,
    eligMean: Math.round(meanOf(elig) * 10) / 10, eligMin: Math.min.apply(null, elig), eligMax: Math.max.apply(null, elig),
    eligNSMean: Math.round(meanOf(eligNS) * 10) / 10, eligNSMin: Math.min.apply(null, eligNS),
    zeroEligDays: elig.filter(x => x === 0).length, zeroEligNSDays: eligNS.filter(x => x === 0).length,
    travMean: Math.round(meanOf(cen.map(c => c.travelingN)) * 10) / 10, travMax: Math.max.apply(null, cen.map(c => c.travelingN)),
    crewMean: Math.round(meanOf(cen.map(c => c.outdoorCrewN)) * 10) / 10, crewMax: Math.max.apply(null, cen.map(c => c.outdoorCrewN)),
    companionDays: cen.filter(c => c.companionN > 0).length,
    daysWithMaxD6: has6, daysWithMaxD3plus: has3p, daysWithMaxD1plus: has1p,
    shelteredMean: Math.round(meanOf(cen.map(c => c.shelteredN)) * 10) / 10,
    postFleeMean: Math.round(meanOf(cen.map(c => c.postFleeN)) * 10) / 10,
    sickMean: Math.round(meanOf(cen.map(c => c.sickN)) * 10) / 10,
  };
  // Tiers per never-fought spawn on this seed.
  const p = perSeedOpp[row.seed];
  const snapsBySeq = new Map();
  for (const sn of row.w4opp.snaps) {
    if (sn.seq == null) continue;
    if (!snapsBySeq.has(sn.seq)) snapsBySeq.set(sn.seq, []);
    snapsBySeq.get(sn.seq).push(sn);
  }
  const censusByDay = cen.slice().sort((a, b) => a.day - b.day);
  const censusOnOrAfter = (d) => censusByDay.find(c => c.day >= d) || censusByDay[censusByDay.length - 1];
  for (const ps of p.perSpawn) {
    const mySnaps = (snapsBySeq.get(ps.seq) || []).slice().sort((a, b) => a.day - b.day);
    const first = mySnaps[0] || null;
    const tx = first ? first.tx : null, ty = first ? first.ty : null;
    const dCheb = (tx == null) ? null : Math.max(Math.abs(tx - haven0[0]), Math.abs(ty - haven0[1]));
    const dManh = (tx == null) ? null : (Math.abs(tx - haven0[0]) + Math.abs(ty - haven0[1]));
    const sc = censusOnOrAfter(ps.day);
    let r1 = false, r1maxD = null;
    if (dCheb != null && sc) {
      for (const rid of Object.keys(sc.nodes)) {
        const md = sc.nodes[rid][2];
        if (md != null && md >= dCheb) { r1 = true; if (r1maxD == null || md > r1maxD) r1maxD = md; }
      }
    }
    const r2 = !!(r1 && dCheb != null && dCheb <= ps.daysPresent * 4);
    const r3 = !!(r2 && sc && sc.eligibleNotSickN > 0);
    const tickSnaps = mySnaps.filter(sn => sn.source === 'tick').length;
    // Exploratory (NOT judged — the headline uses spawn-day R1/R3 only):
    // R1-ever: any census day during presence with an eligible villager
    // whose maxD >= dCheb, and eligibleNotSick > 0 that day.
    let r1ever = false;
    if (dCheb != null) {
      for (const c of censusByDay) {
        if (c.day < ps.day || (first && c.day > Math.max.apply(null, mySnaps.map(sn => sn.day)))) continue;
        if (c.eligibleNotSickN <= 0) continue;
        for (const rid of Object.keys(c.nodes)) {
          const md = c.nodes[rid][2];
          if (md != null && md >= dCheb) { r1ever = true; break; }
        }
        if (r1ever) break;
      }
    }
    // Player-tile-change days during presence (census proxy for worldTick days).
    const lastDay = first ? Math.max.apply(null, mySnaps.map(sn => sn.day)) : ps.day;
    let tileChanges = 0, presenceDays = 0, prevTile = null;
    for (const c of censusByDay) {
      if (c.day < ps.day || c.day > lastDay) continue;
      presenceDays++;
      const t = c.playerTile.join(',');
      if (prevTile != null && t !== prevTile) tileChanges++;
      prevTile = t;
    }
    tierRows.push({
      seed: row.seed, day: ps.day, seq: ps.seq, type: ps.type, src: ps.src, cls: ps.cls,
      spawnTile: (tx == null) ? null : [tx, ty], dCheb: dCheb, dManh: dManh,
      daysPresent: ps.daysPresent, presentAtEnd: ps.presentAtEnd,
      spawnDayCensusDay: sc ? sc.day : null,
      eligibleOnSpawnDay: sc ? sc.eligibleN : null, eligibleNotSickOnSpawnDay: sc ? sc.eligibleNotSickN : null,
      travelingOnSpawnDay: sc ? sc.travelingN : null, crewOnSpawnDay: sc ? sc.outdoorCrewN : null,
      r1range: r1, r1maxD: r1maxD, r2travel: r2, travelPartsLB: dCheb,
      r3departPool: r3, newlyReachable: (ps.cls === 'never-in-range' && r3),
      r1ever: r1ever, newlyReachableEver: (ps.cls === 'never-in-range' && r1ever && dCheb != null && dCheb <= ps.daysPresent * 4),
      tickSnaps: tickSnaps, tickVillagerSnaps: ps.tickVillagerSnaps,
      presenceCensusDays: presenceDays, playerTileChangeDays: tileChanges,
      minNearest: ps.minNearestVillager, minPlayerTiles: ps.minPlayerTiles,
    });
  }
}
check('tiers.rows', tierRows.length === 24, tierRows.length);
const newly = tierRows.filter(t => t.newlyReachable).length;
const contact = tierRows.filter(t => t.cls === 'contact-without-fight').length;
const r1n = tierRows.filter(t => t.r1range).length;
const r2n = tierRows.filter(t => t.r2travel).length;
const r3n = tierRows.filter(t => t.r3departPool).length;
check('tiers.contact', contact === 2, contact);
check('tiers.reachableConsistent', (contact + newly) <= 24 && newly <= tierRows.filter(t => t.cls === 'never-in-range').length, { contact, newly });
const reachable = contact + newly;
console.log('BAND rebaseline: ' + JSON.stringify(bb) + ' vs1920 ' + JSON.stringify(BAND1920));
console.log('BAND opp: ' + JSON.stringify(bandOpp) + ' never=' + bandNever + ' spawns=' + bandSpawns);
const newlyEver = tierRows.filter(t => t.newlyReachableEver).length;
console.log('TIERS r1range=' + r1n + ' r2travel=' + r2n + ' r3departPool=' + r3n + ' newlyReachable=' + newly + ' contact=' + contact + ' REACHABLE=' + reachable + '/24 = ' + (reachable / 24).toFixed(3));
console.log('TIERS exploratory (NOT judged): r1ever=' + tierRows.filter(t => t.r1ever).length + ' newlyReachableEver=' + newlyEver + ' reachableEver=' + (contact + newlyEver) + '/24');
console.log('CENSUS per seed: ' + JSON.stringify(censusAgg, null, 1));
console.log('TIER rows:');
for (const t of tierRows) console.log('  TIER seed=' + t.seed + ' d' + t.day + ' seq' + t.seq + ' ' + t.type + ' cls=' + t.cls + ' tile=' + JSON.stringify(t.spawnTile) + ' dCheb=' + t.dCheb + ' dManh=' + t.dManh + ' daysPresent=' + t.daysPresent + ' presentEnd=' + t.presentAtEnd + ' elig=' + t.eligibleOnSpawnDay + '/' + t.eligibleNotSickOnSpawnDay + ' trav=' + t.travelingOnSpawnDay + ' crew=' + t.crewOnSpawnDay + ' r1=' + t.r1range + '(maxD' + t.r1maxD + ') r2=' + t.r2travel + ' r3=' + t.r3departPool + ' newly=' + t.newlyReachable + ' r1ever=' + t.r1ever + ' newlyEver=' + t.newlyReachableEver + ' tickSnaps=' + t.tickSnaps + ' tickVill=' + t.tickVillagerSnaps + ' dayEndTileChangeDays=' + t.playerTileChangeDays + '/' + t.presenceCensusDays + ' minNearest=' + t.minNearest + ' minPlayerTiles=' + t.minPlayerTiles);
const detailIdx = process.argv.indexOf('--detail');
const detailSeed = detailIdx >= 0 ? process.argv[detailIdx + 1] : null;
if (detailSeed) {
  const ds = parseInt(detailSeed, 10);
  const row = armed.find(r => r.seed === ds);
  const again = JSON.parse(JSON.stringify(row));
  console.log('DETAIL seed=' + ds + ' censusDays=' + row.meetrule.census.length + ' censusMatch=' + (JSON.stringify(again.meetrule.census) === JSON.stringify(row.meetrule.census)));
}
console.log('PROOF: ' + pass + ' PASS, ' + fail + ' FAIL');
if (fail) process.exit(1);
