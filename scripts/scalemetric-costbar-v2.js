// scalemetric-costbar-v2.js — v2 scalemetric cost bar (sim-costbar-b).
// Extends the frozen B1-B5 bar (scripts/analyze-scale-costbar.js) with
// expedition-death + early-loss terms, on the CORRECTED death taxonomy.
//
// TAXONOMY (see evidence/2026-11-21/sim-costbar-b-prereg.md §1): the
// harness captures EVERY tele('death') event into one samples.deaths array
// — monster kills (kind 'monster', who = monster id) AND people deaths
// (kind 'villager'/'person', who = person id). cause 'expedition' rows are
// MONSTER KILLS on expedition (src/js/villager-mapmem.js mapmemNoteKill:
// "the expedition kill hook", kind 'monster', cause 'expedition',
// killerId = the villager). They are a BENEFIT channel, never a cost term.
// The bar prices PEOPLE deaths only, and attributes road deaths by joining
// people-death rows to wave-4 launch records (v4departs result 'launch').
//
// Usage:
//   node scripts/scalemetric-costbar-v2.js --band confirm [--json] [--out <file>]
//   node scripts/scalemetric-costbar-v2.js --off <glob> --on <glob> [--json] [--out <file>]
// Bands: confirm, leanlink-pilot, leanlinkrescue-pilot, leanlinkcap5-pilot,
// leanlinkcap5-confirm. --off/--on take shell globs (quote them); files are
// sorted and paired by seed. Reads ONLY corpus files; writes only --out.
// No game load; corpus analysis only.
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const HOME_CAUSES = new Set(['starvation', 'thirst', 'dehydration', 'disease', 'sickness',
  'wound_fever', "a wound that wouldn't close", 'contest', 'the arena']);
const PEOPLE_KINDS = new Set(['villager', 'person']);

const BANDS = {
  confirm: {
    off: 'evidence/2026-11-21/perseed-profilegate4-confirm-b-off/*.json',
    on: 'evidence/2026-11-21/perseed-profilegate4-confirm-b-on/*.json',
  },
  'leanlink-pilot': {
    off: 'evidence/2026-10-24/perseed-leanlink/s7350[1-8]-control.json',
    on: 'evidence/2026-10-24/perseed-leanlink/s7350[1-8]-armed.json',
  },
  'leanlinkrescue-pilot': {
    off: 'evidence/2026-10-24/perseed-leanlinkrescue/s7350[1-8]-control.json',
    on: 'evidence/2026-10-24/perseed-leanlinkrescue/s7350[1-8]-armed.json',
  },
  'leanlinkcap5-pilot': {
    off: 'evidence/2026-10-24/perseed-leanlinkcap5/s7350[1-8]-control.json',
    on: 'evidence/2026-10-24/perseed-leanlinkcap5/s7350[1-8]-armed.json',
  },
  'leanlinkcap5-confirm': {
    // 73509 needs its own pattern (s7351[0-6] covers 73510-73516 only).
    off: ['evidence/2026-10-24/perseed-leanlinkcap5/s73509-control.json',
      'evidence/2026-10-24/perseed-leanlinkcap5/s7351[0-6]-control.json'],
    on: ['evidence/2026-10-24/perseed-leanlinkcap5/s73509-armed.json',
      'evidence/2026-10-24/perseed-leanlinkcap5/s7351[0-6]-armed.json'],
  },
};

function median(xs) {
  const s = [...xs].sort((a, b) => a - b);
  const n = s.length;
  return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
}

function globFiles(pattern) {
  // Expand a glob via the shell (no glob dep in this repo). Pattern is
  // trusted: it comes from BANDS above or the operator's own CLI arg.
  const out = execSync(`ls -1 ${pattern}`, { encoding: 'utf8', cwd: ROOT });
  return out.split('\n').filter(Boolean).map(f => path.isAbsolute(f) ? f : path.join(ROOT, f));
}

function launchesOf(j) {
  if (!Array.isArray(j.v4departs)) return null; // pre-launch-recorder corpus
  const evs = [];
  for (const d of j.v4departs) {
    if (d.result !== 'launch') continue;
    const vids = new Set([d.vid, d.companion, d.companion2, ...(d.party || [])]);
    vids.delete(null); vids.delete(undefined);
    evs.push({ day: d.day | 0, vids });
  }
  return evs;
}

function perSeed(file) {
  const j = JSON.parse(fs.readFileSync(file, 'utf8'));
  const deaths = j.deaths || [];
  const days = j.gameDays || j.days;
  const people = deaths.filter(d => PEOPLE_KINDS.has(d.kind));
  const monsters = deaths.filter(d => d.kind === 'monster');
  const starv = people.filter(d => d.cause === 'starvation');
  const launches = launchesOf(j);
  let attrRoad = 0, attrAll = 0;
  if (launches) {
    for (const d of people) {
      const hit = launches.some(ev => ev.vids.has(d.who) && ev.day <= (d.day | 0) && (d.day | 0) <= ev.day + 7);
      if (hit) {
        attrAll++;
        if (!HOME_CAUSES.has(d.cause)) attrRoad++;
      }
    }
  }
  return {
    seed: j.seed, file: path.basename(file),
    days, end: j.endReason, lost: j.endReason === 'village-lost',
    peopleDeaths: people.length,
    peopleRate: people.length / days * 100,
    monsterKills: monsters.length,
    expKills: deaths.filter(d => d.cause === 'expedition').length,
    starv: starv.length,
    starvDays: starv.map(d => d.day | 0),
    attrRoad, attrAll,
    launches: launches ? launches.length : null,
    standing: j.standing, scaleRank: j.scaleRank,
    maxWave: j.maxWave, unlockedWave: j.unlockedWave,
    won: !!j.won, table: !!j.table,
  };
}

function summarize(rows, otherRows) {
  const bySeed = new Map(otherRows.map(r => [r.seed, r]));
  let matched = 0; // same-seed same-day starvation matches (this leg vs other)
  for (const r of rows) {
    const o = bySeed.get(r.seed);
    if (!o) continue;
    const counts = {};
    for (const d of r.starvDays) counts[d] = (counts[d] || 0) + 1;
    for (const d of o.starvDays) if (counts[d]) { matched += 1; counts[d] -= 1; }
  }
  const sum = k => rows.reduce((a, r) => a + (r[k] || 0), 0);
  const n = rows.length;
  return {
    n,
    medianDays: median(rows.map(r => r.days)),
    lost: rows.filter(r => r.lost).length,
    peopleDeaths: sum('peopleDeaths'),
    peopleRate: rows.reduce((a, r) => a + r.peopleRate, 0) / n, // mean of per-seed rates (panel construction)
    monsterKills: sum('monsterKills'),
    expKills: sum('expKills'),
    starv: sum('starv'),
    starvArmOnly: sum('starv') - matched,
    attrRoad: sum('attrRoad'),
    attrAll: sum('attrAll'),
    launches: rows.every(r => r.launches !== null) ? sum('launches') : null,
    national: rows.filter(r => (r.scaleRank === 'national' || r.scaleRank === 'global')).length,
    table: sum('table'),
    won: sum('won'),
    wave4: rows.filter(r => (r.maxWave || 0) >= 4).length,
    wave5: rows.filter(r => (r.maxWave || 0) >= 5).length,
  };
}

// Frozen thresholds (sim-costbar-b-prereg.md §2). Do not tune here.
const BAR = {
  B1_medianRatio: 0.8,
  B3_starvSlack: 2,
  C1_rateRatio: 1.10,
  C1_rateDelta: 1.0, // per 100 days
  C2_flips: 4,
  C2_earlierDays: 100,
  C3_attrPerSeed: 1.0, // attrRoad delta >= 1.0 * nSeeds
  C3_perLaunchRatio: 1.50,
  ATTR_WINDOW_DAYS: 7,
};

function judge(offFiles, onFiles) {
  const offRows = offFiles.map(perSeed);
  const onRows = onFiles.map(perSeed);
  const offSeeds = offRows.map(r => r.seed).sort((a, b) => a - b);
  const onSeeds = onRows.map(r => r.seed).sort((a, b) => a - b);
  if (JSON.stringify(offSeeds) !== JSON.stringify(onSeeds)) {
    throw new Error(`seed mismatch: off [${offSeeds}] vs on [${onSeeds}]`);
  }
  const off = summarize(offRows, onRows);
  const on = summarize(onRows, offRows);
  const n = off.n;
  const bySeedOff = new Map(offRows.map(r => [r.seed, r]));
  const flips = onRows.filter(r => !bySeedOff.get(r.seed).lost && r.lost).length;
  const revFlips = onRows.filter(r => bySeedOff.get(r.seed).lost && !r.lost).length;
  const earlierDays = onRows.reduce((a, r) => {
    const o = bySeedOff.get(r.seed);
    return (o.lost && r.lost) ? a + Math.max(0, o.days - r.days) : a;
  }, 0);
  const medianRatio = on.medianDays / off.medianDays;
  const rateRatio = on.peopleRate / off.peopleRate;
  const rateDelta = on.peopleRate - off.peopleRate;
  // C3 needs launch records on BOTH legs; pre-launch-recorder corpora
  // (e.g. the 2026-10-24 scalemetric bands) report not_observed, never PASS.
  const launchesObserved = off.launches !== null && on.launches !== null;
  const attrDelta = launchesObserved ? on.attrRoad - off.attrRoad : null;
  const perLaunchOff = (launchesObserved && off.launches > 0) ? off.attrRoad / off.launches : null;
  const perLaunchOn = (launchesObserved && on.launches > 0) ? on.attrRoad / on.launches : null;
  const perLaunchRatio = (perLaunchOff !== null && perLaunchOn !== null && perLaunchOff > 0)
    ? perLaunchOn / perLaunchOff : null;

  const B1 = medianRatio >= BAR.B1_medianRatio;
  const B3tot = on.starv <= off.starv + BAR.B3_starvSlack;
  const B3only = on.starvArmOnly <= off.starvArmOnly + BAR.B3_starvSlack;
  // C1 (amended 2026-11-21, prereg amendment A1): FAIL iff BOTH clauses
  // breach — a cost must be relatively AND absolutely large. The OR form
  // tripped on n=8 Poisson noise (rescue ratio 1.130 alone).
  const C1 = !(rateRatio > BAR.C1_rateRatio && rateDelta > BAR.C1_rateDelta);
  const C2 = flips < BAR.C2_flips && earlierDays < BAR.C2_earlierDays;
  const C3 = !launchesObserved ? null
    : (attrDelta < BAR.C3_attrPerSeed * n && (perLaunchRatio === null || perLaunchRatio < BAR.C3_perLaunchRatio));
  const pass = B1 && B3tot && B3only && C1 && C2 && (C3 !== false);

  return {
    n, seeds: offSeeds,
    off, on,
    medianRatio, rateRatio, rateDelta,
    flips, revFlips, earlierDays,
    attrDelta, perLaunchOff, perLaunchOn, perLaunchRatio,
    bars: {
      B1_median: B1,
      B3_starvTotals: B3tot,
      B3_starvArmOnly: B3only,
      C1_peopleDeathRate: C1,
      C2_earlyLoss: C2,
      C3_launchAttrRoadDeaths: C3, // null = not_observed (no launch records)
      C4_expKills_diagnosticOnly: null, // never a cost term
    },
    verdict: pass ? 'COST PASS' : 'COST FAIL',
    perSeed: { off: offRows, on: onRows },
  };
}

function main() {
  const argv = process.argv.slice(2);
  const get = flag => {
    const i = argv.indexOf(flag);
    return i >= 0 && argv[i + 1] ? argv[i + 1] : null;
  };
  let offPat, onPat, bandId = null;
  if (get('--band')) {
    bandId = get('--band');
    const b = BANDS[bandId];
    if (!b) { console.error(`unknown band ${bandId}; known: ${Object.keys(BANDS).join(', ')}`); process.exit(2); }
    offPat = b.off; onPat = b.on;
  } else {
    offPat = get('--off'); onPat = get('--on');
    if (!offPat || !onPat) {
      console.error('usage: --band <id> | --off <glob> --on <glob>  [--json] [--out <file>]');
      process.exit(2);
    }
  }
  const offFiles = (Array.isArray(offPat) ? offPat : [offPat]).flatMap(globFiles).sort();
  const onFiles = (Array.isArray(onPat) ? onPat : [onPat]).flatMap(globFiles).sort();
  if (!offFiles.length || !onFiles.length) {
    console.error(`no files: off=${offFiles.length} on=${onFiles.length}`);
    process.exit(2);
  }
  const out = judge(offFiles, onFiles);
  out.band = bandId;
  if (get('--out')) fs.writeFileSync(get('--out'), JSON.stringify(out, null, 2) + '\n');
  if (argv.includes('--json')) {
    console.log(JSON.stringify(out, null, 2));
  } else {
    const f = (x, d = 2) => (x === null || x === undefined) ? 'n/a' : (typeof x === 'number' ? x.toFixed(d) : x);
    console.log(`band ${bandId || '(custom)'} n=${out.n} seeds ${out.seeds[0]}-${out.seeds[out.seeds.length - 1]}`);
    console.log(`OFF: median ${out.off.medianDays}d lost ${out.off.lost}/${out.n} peopleDeaths ${out.off.peopleDeaths} rate ${f(out.off.peopleRate)}/100d monsterKills ${out.off.monsterKills} expKills ${out.off.expKills} starv ${out.off.starv} (armOnly ${out.off.starvArmOnly}) attrRoad ${out.off.attrRoad} launches ${out.off.launches === null ? 'n/a' : out.off.launches} nat ${out.off.national} table ${out.off.table} won ${out.off.won} wave4 ${out.off.wave4} wave5 ${out.off.wave5}`);
    console.log(`ON:  median ${out.on.medianDays}d lost ${out.on.lost}/${out.n} peopleDeaths ${out.on.peopleDeaths} rate ${f(out.on.peopleRate)}/100d monsterKills ${out.on.monsterKills} expKills ${out.on.expKills} starv ${out.on.starv} (armOnly ${out.on.starvArmOnly}) attrRoad ${out.on.attrRoad} launches ${out.on.launches === null ? 'n/a' : out.on.launches} nat ${out.on.national} table ${out.on.table} won ${out.on.won} wave4 ${out.on.wave4} wave5 ${out.on.wave5}`);
    console.log(`B1 medianRatio ${f(out.medianRatio, 3)} (>=0.8) ${out.bars.B1_median ? 'PASS' : 'FAIL'}`);
    console.log(`B3 starv ${out.on.starv} vs ${out.off.starv}+2 ${out.bars.B3_starvTotals ? 'PASS' : 'FAIL'}; armOnly ${out.on.starvArmOnly} vs ${out.off.starvArmOnly}+2 ${out.bars.B3_starvArmOnly ? 'PASS' : 'FAIL'}`);
    console.log(`C1 peopleRate ${f(out.off.peopleRate)} -> ${f(out.on.peopleRate)} ratio ${f(out.rateRatio, 3)} (<=1.10) delta ${f(out.rateDelta, 2)} (<=+1.00) ${out.bars.C1_peopleDeathRate ? 'PASS' : 'FAIL'}`);
    console.log(`C2 flips ${out.flips} (rev ${out.revFlips}, bar <4) earlierDays ${out.earlierDays} (bar <100) ${out.bars.C2_earlyLoss ? 'PASS' : 'FAIL'}`);
    if (out.bars.C3_launchAttrRoadDeaths === null) {
      console.log('C3 not_observed (no launch records in corpus)');
    } else {
      console.log(`C3 attrRoad ${out.off.attrRoad} -> ${out.on.attrRoad} delta ${out.attrDelta} (bar <${BAR.C3_attrPerSeed * out.n}) perLaunch ${f(out.perLaunchOff, 4)} -> ${f(out.perLaunchOn, 4)} ratio ${f(out.perLaunchRatio, 3)} (bar <1.50) ${out.bars.C3_launchAttrRoadDeaths ? 'PASS' : 'FAIL'}`);
    }
    console.log(`C4 expKills ${out.off.expKills} -> ${out.on.expKills} (delta ${out.on.expKills - out.off.expKills}, diagnostic only — never a cost term)`);
    console.log(`VERDICT: ${out.verdict}`);
  }
}

if (require.main === module) main();
module.exports = { judge, perSeed, summarize, BAR, BANDS, HOME_CAUSES, PEOPLE_KINDS };
