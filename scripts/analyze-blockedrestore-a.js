#!/usr/bin/env node
// scripts/analyze-blockedrestore-a.js — sim-blockedrestore-a analyzer.
// PURE: reads the committed draftflag corpus JSON under
// evidence/2026-10-30/perseed-draftflag-a/ (EVID override), never
// touches game state, never writes into the corpus (its JSON goes
// to evidence/2026-10-30/sim-blockedrestore-a-analysis.json, or
// --out). Usage:
//   node scripts/analyze-blockedrestore-a.js [--dir <dir>] [--out <file>]
//     [--seeds 75101,...]
// Judges the prereg (evidence/2026-10-30/sim-blockedrestore-a-prereg.md):
// band-wide census of tbEnd restore outcomes over the draftflag
// corpus; every tbend 'lost' event classified restored / blocked /
// by-design-not-restored / unmeasured-cause; every dissolved
// scholarmelt meeting counted as UNMEASURED with its hook named;
// blocker breakdown by hp/wave/tile/lingering/raidBorn; the 1-HP
// pattern verdict under the prereg rule; the s75116 fightSeq 23
// anchor reproduced exactly.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-30', 'perseed-draftflag-a');
const DEFAULT_SEEDS = [75101, 75102, 75103, 75104, 75105, 75106, 75107, 75108,
  75109, 75110, 75111, 75112, 75113, 75114, 75115, 75116];

function parseArgs(argv) {
  const out = { dir: EVID, out: null, seeds: DEFAULT_SEEDS };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--dir') out.dir = argv[++i];
    else if (argv[i] === '--out') out.out = argv[++i];
    else if (argv[i] === '--seeds') out.seeds = argv[i + 1].split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite), i++;
  }
  if (!out.out) out.out = path.join(REPO, 'evidence', '2026-10-30', 'sim-blockedrestore-a-analysis.json');
  return out;
}

// Classification, verbatim from the prereg (game.js tbEnd restore block).
// isLingerer = lingering && !titan; ELIGIBLE = result !== 'won' &&
// (!isLingerer || result === 'fled' || result === 'lost').
// BLOCKED requires restored false AND ELIGIBLE AND a DIFFERENT
// occupant on the origin tile at guard time (occupantBefore).
function isLingerer(origin) { return !!(origin && origin.lingering && !origin.titan); }
function isEligible(ev) {
  if (!ev || !ev.origin) return false;
  if (ev.result === 'won') return false;
  if (!isLingerer(ev.origin)) return true;
  return ev.result === 'fled' || ev.result === 'lost';
}
function classify(ev) {
  if (!ev || !ev.origin) return 'NO-ORIGIN';
  if (ev.restored) return 'RESTORED';
  if (!isEligible(ev)) return 'BY-DESIGN-NOT-RESTORED';
  const occ = ev.occupantBefore;
  if (occ && !ev.occupantSameAsOriginBefore && ev.originInWorldBefore < 0) return 'BLOCKED';
  return 'UNMEASURED-cause';
}
function blockerOf(ev) {
  if (classify(ev) !== 'BLOCKED') return null;
  const o = ev.occupantBefore;
  return { uid: o.uid, id: o.id, hp: o.hp, maxHp: o.maxHp, wave: o.wave,
    tx: o.tx, ty: o.ty, lingering: !!o.lingering, raidBorn: !!o.raidBorn, titan: !!o.titan };
}

function loadSeed(dir, seed) {
  const row = JSON.parse(fs.readFileSync(path.join(dir, `s${seed}-fresh.json`), 'utf8'));
  const census = JSON.parse(fs.readFileSync(path.join(dir, `census-s${seed}.json`), 'utf8'));
  return { row, census };
}
function censusInfo(census, rowDays) {
  const snaps = census.snapshots || [];
  let sorted = true;
  for (let i = 1; i < snaps.length; i++) if (snaps[i].day < snaps[i - 1].day) sorted = false;
  const lastDay = snaps.length ? snaps[snaps.length - 1].day : null;
  return { snapshots: snaps.length, sorted, lastDay,
    within1: lastDay !== null && Math.abs(lastDay - rowDays) <= 1 };
}
function trajectory(census, uid) {
  const out = [];
  for (const s of (census.snapshots || [])) {
    for (const m of (s.monsters || [])) if (m.uid === uid) out.push({ day: s.day, entry: m });
  }
  return out;
}
const medianOf = (arr) => { if (!arr.length) return 0; const s = arr.slice().sort((a, b) => a - b); return s[Math.floor(s.length / 2)]; };

function analyze(dir, seeds) {
  const perSeed = [];
  const allTbend = []; // {seed, ev, cls}
  const blockedRows = [];
  const lostRows = [];
  const dissolvedPerSeed = {};
  const lostMeetingsPerSeed = {};
  let dissolvedTotal = 0, lostMeetingsTotal = 0;
  for (const seed of seeds) {
    const { row, census } = loadSeed(dir, seed);
    const df = row.draftflag || {};
    const diag = df.diag || {};
    const events = df.events || [];
    const tbends = events.filter(e => e.type === 'tbend');
    const cInfo = censusInfo(census, row.days);
    // Floor corroboration: draft rows per uid with hpAfter == 1.
    const floorUids = new Set();
    for (const e of events) {
      if (e.type !== 'raid') continue;
      for (const d of (e.drafts || [])) if (d.hpAfter === 1) floorUids.add(d.uid);
    }
    // Scholarmelt populations.
    const meetings = (row.scholarmelt && row.scholarmelt.meetings) || [];
    const dissolved = meetings.filter(m => m.result === 'dissolved-no-tbend');
    const lostMeetings = meetings.filter(m => m.result === 'lost');
    dissolvedPerSeed[seed] = dissolved.length;
    lostMeetingsPerSeed[seed] = lostMeetings.length;
    dissolvedTotal += dissolved.length;
    lostMeetingsTotal += lostMeetings.length;
    const seedTb = [];
    for (const ev of tbends) {
      const cls = classify(ev);
      const rec = { seed, seq: ev.seq, day: ev.day, result: ev.result, cls,
        origin: { uid: ev.origin.uid, id: ev.origin.id, hp: ev.origin.hp, maxHp: ev.origin.maxHp,
          wave: ev.origin.wave, tx: ev.origin.tx, ty: ev.origin.ty,
          lingering: !!ev.origin.lingering, raidBorn: !!ev.origin.raidBorn, titan: !!ev.origin.titan },
        restored: !!ev.restored, blocker: blockerOf(ev) };
      if (cls === 'BLOCKED') {
        rec.blocker.floorDraftRow = floorUids.has(ev.occupantBefore.uid);
        blockedRows.push(rec);
      }
      if (ev.result === 'lost') {
        // Heuristic scholarmelt linkage (context only, never the census).
        const linked = lostMeetings.filter(m => m.dayStart <= ev.day && ev.day <= m.dayEnd
          && m.worldOrigin && m.worldOrigin.id === ev.origin.id && m.worldOrigin.hp === ev.origin.hp);
        rec.linkedMeetings = linked.map(m => m.fightSeq);
        lostRows.push(rec);
      }
      seedTb.push(rec);
      allTbend.push(rec);
    }
    perSeed.push({ seed, days: row.days, valid: row.days > 0 && diag.errs === 0
        && Object.keys(diag.overflow || {}).length === 0 && cInfo.sorted && cInfo.within1,
      diagTbEndWithOrigin: diag.tbEndWithOrigin, diagTbEndTotal: diag.tbEndTotal,
      tbendEvents: tbends.length, census: cInfo,
      dissolved: dissolved.length, lostMeetings: lostMeetings.length,
      rows: seedTb });
  }
  // Reconciliation: analyzer tbend totals vs corpus diag totals.
  const recon = perSeed.map(p => ({ seed: p.seed, diag: p.diagTbEndWithOrigin,
    counted: p.tbendEvents, match: p.diagTbEndWithOrigin === p.tbendEvents }));
  // Counts.
  const countBy = (rows, cls) => rows.filter(r => r.cls === cls).length;
  const byClass = {};
  for (const c of ['RESTORED', 'BLOCKED', 'BY-DESIGN-NOT-RESTORED', 'UNMEASURED-cause', 'NO-ORIGIN']) {
    byClass[c] = countBy(allTbend, c);
  }
  const lostByClass = {};
  for (const c of ['RESTORED', 'BLOCKED', 'BY-DESIGN-NOT-RESTORED', 'UNMEASURED-cause', 'NO-ORIGIN']) {
    lostByClass[c] = countBy(lostRows, c);
  }
  const byResult = {};
  for (const r of ['won', 'routed', 'lost', 'fled']) {
    const sub = allTbend.filter(x => x.result === r);
    byResult[r] = { total: sub.length, RESTORED: countBy(sub, 'RESTORED'),
      BLOCKED: countBy(sub, 'BLOCKED'), 'BY-DESIGN-NOT-RESTORED': countBy(sub, 'BY-DESIGN-NOT-RESTORED'),
      'UNMEASURED-cause': countBy(sub, 'UNMEASURED-cause') };
  }
  // Blocker breakdown.
  const hp1 = blockedRows.filter(r => r.blocker.hp === 1);
  const hpGt1 = blockedRows.filter(r => r.blocker.hp !== 1);
  const byWave = {};
  for (const r of blockedRows) byWave[String(r.blocker.wave)] = (byWave[String(r.blocker.wave)] || 0) + 1;
  const byTile = {};
  for (const r of blockedRows) byTile[`${r.blocker.tx},${r.blocker.ty}`] = (byTile[`${r.blocker.tx},${r.blocker.ty}`] || 0) + 1;
  const byId = {};
  for (const r of blockedRows) byId[r.blocker.id] = (byId[r.blocker.id] || 0) + 1;
  const blockerSeeds = [...new Set(blockedRows.map(r => r.seed))].sort((a, b) => a - b);
  const hp1Seeds = [...new Set(hp1.map(r => r.seed))].sort((a, b) => a - b);
  const n = blockedRows.length, k = hp1.length;
  let pattern;
  if (n < 4) pattern = 'INSUFFICIENT-DATA';
  else if (k / n > 0.5 && hp1Seeds.length >= 2) pattern = 'RULE';
  else if (k / n <= 0.25) pattern = 'RARITY';
  else pattern = 'COMMON-BUT-NOT-THE-RULE';
  // Anchor: s75116 day 159 origin uid 29, blocker uid 33 hp 1.
  const anchor = allTbend.find(r => r.seed === 75116 && r.day === 159 && r.origin.uid === 29);
  const anchorOk = !!(anchor && anchor.cls === 'BLOCKED' && anchor.result === 'lost'
    && anchor.blocker && anchor.blocker.uid === 33 && anchor.blocker.hp === 1
    && anchor.blocker.tx === 4 && anchor.blocker.ty === 4);
  // Wall numbers (report-only, from row fields).
  const rows = perSeed.map(p => p); // per-seed rows already carry days; re-read wall fields below
  const wallRows = seeds.map(seed => { const { row } = loadSeed(dir, seed); return row; });
  const wall = { wins: wallRows.filter(r => r.won).length,
    nationalEver: wallRows.filter(r => r.nationalEver).length,
    nationalFinal: wallRows.filter(r => r.nationalFinal).length,
    table: wallRows.filter(r => r.table).length,
    entered: wallRows.filter(r => r.entered).length,
    waveReach: [1, 2, 3, 4, 5].map(w => wallRows.filter(r => (r.waveReach || 0) >= w).length),
    medianDays: medianOf(wallRows.map(r => r.days)),
    maxDays: Math.max(...wallRows.map(r => r.days)),
    deathTotal: wallRows.reduce((a, r) => a + (r.deathTotal || 0), 0) };
  const linkedLost = lostRows.filter(r => (r.linkedMeetings || []).length > 0).length;
  return { seeds, perSeed,
    totals: { tbendEvents: allTbend.length, byClass, byResult,
      lostTotal: lostRows.length, lostByClass,
      dissolvedTotal, lostMeetingsTotal,
      linkedLost, unlinkedLost: lostRows.length - linkedLost },
    blockedRows, lostRows, dissolvedPerSeed, lostMeetingsPerSeed,
    blockerBreakdown: { n, kHp1: k, kHpGt1: hpGt1.length,
      hp1Share: n ? k / n : null, byWave, byTile, byId,
      blockerSeeds, hp1Seeds, lingeringBlockers: blockedRows.filter(r => r.blocker.lingering).length,
      raidBornBlockers: blockedRows.filter(r => r.blocker.raidBorn).length,
      floorDraftCorroborated: blockedRows.filter(r => r.blocker.floorDraftRow).length,
      hp1FloorCorroborated: hp1.filter(r => r.blocker.floorDraftRow).length },
    pattern, anchor, anchorOk, reconciliation: recon,
    wall, validSeeds: perSeed.filter(p => p.valid).length };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const result = analyze(args.dir, args.seeds);
  fs.writeFileSync(args.out, JSON.stringify(result, null, 2) + '\n', 'utf8');
  console.log(`TBEND total=${result.totals.tbendEvents} lost=${result.totals.lostTotal} ` +
    `RESTORED=${result.totals.byClass.RESTORED} BLOCKED=${result.totals.byClass.BLOCKED} ` +
    `BYDESIGN=${result.totals.byClass['BY-DESIGN-NOT-RESTORED']} UNMEASURED=${result.totals.byClass['UNMEASURED-cause']}`);
  console.log(`LOST: RESTORED=${result.totals.lostByClass.RESTORED} BLOCKED=${result.totals.lostByClass.BLOCKED} ` +
    `BYDESIGN=${result.totals.lostByClass['BY-DESIGN-NOT-RESTORED']} UNMEASURED=${result.totals.lostByClass['UNMEASURED-cause']}`);
  console.log(`BLOCKED n=${result.blockerBreakdown.n} hp1=${result.blockerBreakdown.kHp1} ` +
    `pattern=${result.pattern} anchorOk=${result.anchorOk}`);
  console.log(`DISSOLVED=${result.totals.dissolvedTotal} lostMeetings=${result.totals.lostMeetingsTotal} ` +
    `linkedLost=${result.totals.linkedLost} validSeeds=${result.validSeeds}/${result.seeds.length} ` +
    `recon=${result.reconciliation.every(r => r.match) ? 'MATCH' : 'MISMATCH'}`);
  console.log(`WALL wins=${result.wall.wins} natEver=${result.wall.nationalEver} natFinal=${result.wall.nationalFinal} ` +
    `table=${result.wall.table} entered=${result.wall.entered} wave=${result.wall.waveReach.join('/')} ` +
    `median=${result.wall.medianDays} deaths=${result.wall.deathTotal}`);
  console.log(`WROTE ${args.out}`);
}
if (require.main === module) main();
module.exports = { classify, isEligible, isLingerer, blockerOf, analyze, parseArgs };
