// bisect-mournblooded-analyze-20261111.js — analyzer for the
// survival-collapse BISECT leg, ARM B (the suspect commit)
// (arm sim-bisect-mournblooded-a). Reads the 8 per-seed JSONs (seeds
// 190391–190398, the vetphantom band) from
// evidence/2026-11-11/perseed-bisect-mournblooded-a/ and judges them
// against the prereg (evidence/2026-11-11/
// sim-bisect-mournblooded-a-prereg.md).
//
// PRIMARY METRIC — survived count on the suspect commit 13e6f40ae
// vs the vetphantom fix leg's 6/8 (median 150d) and the
// survivalcontrol leg's 1/8 (median 126d, same seeds):
//   >=5/8 survive -> MOURNBLOODED_EXONERATED (the suspect does NOT
//                     reproduce the collapse; the bisect reopens —
//                     reconcile merge / dawn scorer remain)
//   <=2/8 survive -> MOURNBLOODED_IMPLICATED (the suspect reproduces
//                     the survivalcontrol collapse on identical seeds;
//                     the bisect narrows to standing.js)
//   3–4/8 survive -> INCONCLUSIVE (a bigger band is owed)
// Any of the three is a classified outcome. Exit 0 on a classified
// outcome with a complete corpus and 0 instrument errors; exit 1 on
// corpus incompleteness, instrument failure, or an unclassifiable
// read. The verdict is the classification — never re-scored.
// SECONDARY (reported, not judged): median survival vs 150d / 126d;
// death-cause shares — combat/expedition/wild share must stay ≥90%;
// a cause shift means the commit changed more than survival; wave
// 4–5 unlocks; national/table/wins; standing range; tribute-ready
// days (from the final instrument snapshot's tribute read + the
// driver's end tribute field); eulogy-line count — how often the
// mournblooded hold-beat eulogy ("cameras lost them") fires in the
// corpus (context for the mechanism arm, not a verdict input).
// Usage: node scripts/bisect-mournblooded-analyze-20261111.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const DIR = path.join(REPO, 'evidence', '2026-11-11', 'perseed-bisect-mournblooded-a');
const SEEDS = [190391, 190392, 190393, 190394, 190395, 190396, 190397, 190398];
const RUN = 'bisect-mournblooded-pilot';
const VETPHANTOM_SURVIVED = 6; // vetphantom fix leg, same seeds, old base
const VETPHANTOM_MEDIAN = 150;
const SURVIVALCONTROL_SURVIVED = 1; // survivalcontrol leg, same seeds, master d33ca69f9
const SURVIVALCONTROL_MEDIAN = 126;
const TRIBUTEDELIV_BAND_SURVIVED = 1; // fresh band 190411–190418, 1/8

function perSeedFile(seed, dir) {
  return path.join(dir || DIR, 'bisect-mournblooded-s' + seed + '-' + RUN + '-fix.json');
}

function classifySurvived(n) {
  if (typeof n !== 'number' || !Number.isFinite(n) || n < 0 || n > 8) return 'UNCLASSIFIABLE';
  if (n >= 5) return 'MOURNBLOODED_EXONERATED';
  if (n <= 2) return 'MOURNBLOODED_IMPLICATED';
  return 'INCONCLUSIVE';
}

function loadCorpus(seeds, dir) {
  const rows = [];
  const missing = [];
  for (const seed of seeds) {
    const f = perSeedFile(seed, dir);
    if (!fs.existsSync(f)) { missing.push(seed); continue; }
    const d = JSON.parse(fs.readFileSync(f, 'utf8'));
    rows.push(d);
  }
  return { rows: rows, missing: missing, complete: missing.length === 0 && rows.length === seeds.length };
}

function median(xs) {
  const s = xs.slice().sort(function (a, b) { return a - b; });
  return s.length ? s[Math.floor(s.length / 2)] : null;
}

function deathCauseShares(rows) {
  const counts = {};
  let total = 0;
  for (const d of rows) {
    for (const death of (d.deaths || [])) {
      const c = death.cause || death.kind || 'unknown';
      counts[c] = (counts[c] || 0) + 1;
      total++;
    }
  }
  return { total: total, counts: counts };
}

// Eulogy lines: the mournblooded hold-beat line fires as
// "… blooded <beast> — and the cameras lost them. …" (or the
// unnameable-beast fallback "… was blooded — and the cameras lost
// them. …"). The driver's SAY_RE captures it via /blooded/; count
// the eulogy lines per seed from the captured vetSays.
function eulogyLines(rows) {
  const perSeed = [];
  let total = 0;
  for (const d of rows) {
    let n = 0;
    for (const s of (d.vetSays || [])) {
      if (typeof s.line === 'string' && s.line.indexOf('cameras lost them') !== -1) n++;
    }
    perSeed.push({ seed: d.seed, eulogyLines: n });
    total += n;
  }
  return { total: total, perSeed: perSeed };
}

// Combat-family share of deaths: villager combat + combat +
// expedition + the wild, over all deaths. Prereg secondary: the
// profile must stay >=90% combat/expedition/wild.
function combatShare(causes) {
  const c = causes.counts || {};
  const fam = (c['villager combat'] || 0) + (c.combat || 0) + (c.expedition || 0) + (c['the wild'] || 0);
  return { combatFamily: fam, total: causes.total || 0, share: (causes.total || 0) ? fam / causes.total : null };
}

function analyzeRows(rows) {
  const perSeed = rows.map(function (d) {
    const daily = d.daily || [];
    const snap = daily.length ? daily[daily.length - 1] : null;
    return {
      seed: d.seed, anchorCommit: d.anchorCommit, standingFix: d.standingFix, standingSha: d.standingSha,
      days: d.days, endReason: d.endReason, won: !!d.won, villageLost: !!d.villageLost,
      scaleRank: d.scaleRank, maxWave: d.maxWave, unlockedWave: d.unlockedWave,
      standing: d.standing, deaths: (d.deaths || []).length,
      endPantryKcal: d.endPantryKcal, blooded: !!d.blooded,
      tribute: d.tribute, ready4: d.ready4 ? d.ready4.veterans : null,
      ready5: d.ready5 ? d.ready5.veterans : null,
      ladderVets4: d.ladderVets4,
      errors: (d.instrumentErrors || []).length,
      snapshotCount: daily.length,
      finalSnapDay: snap ? snap.day : null,
    };
  });
  const survived = perSeed.filter(function (r) { return !r.villageLost; }).length;
  const wall = {
    wins: perSeed.filter(function (r) { return r.won; }).length,
    national: perSeed.filter(function (r) { return r.scaleRank === 'national'; }).length,
    table: perSeed.filter(function (r) { return r.scaleRank === 'table'; }).length,
    regional: perSeed.filter(function (r) { return r.scaleRank === 'regional'; }).length,
    village: perSeed.filter(function (r) { return r.scaleRank === 'village'; }).length,
    wave5: perSeed.filter(function (r) { return (r.maxWave || 1) >= 5; }).length,
    wave4: perSeed.filter(function (r) { return (r.maxWave || 1) >= 4; }).length,
    medianDays: median(perSeed.map(function (r) { return r.days; })),
    survived: survived,
    deaths: perSeed.reduce(function (a, r) { return a + r.deaths; }, 0),
    standingRange: [Math.min.apply(null, perSeed.map(function (r) { return r.standing; })), Math.max.apply(null, perSeed.map(function (r) { return r.standing; }))],
    blooded: perSeed.filter(function (r) { return r.blooded; }).length,
  };
  const causes = deathCauseShares(rows);
  const instrumentErrors = perSeed.reduce(function (a, r) { return a + r.errors; }, 0);
  const eulogy = eulogyLines(rows);
  const combat = combatShare(causes);
  return { perSeed: perSeed, survived: survived, wall: wall, causes: causes, instrumentErrors: instrumentErrors, eulogy: eulogy, combat: combat };
}

function judge(analysis) {
  const verdict = classifySurvived(analysis.survived);
  const ok = verdict !== 'UNCLASSIFIABLE';
  return { verdict: verdict, classifiable: ok };
}

function main() {
  const corpus = loadCorpus(SEEDS);
  if (!corpus.complete) {
    console.error('bisect-mournblooded-a: INCOMPLETE corpus — missing seeds: ' + corpus.missing.join(', '));
    process.exit(1);
  }
  const analysis = analyzeRows(corpus.rows);
  const j = judge(analysis);
  const summary = {
    seeds: SEEDS, run: RUN,
    vetphantomFixLeg: { survived: VETPHANTOM_SURVIVED, medianDays: VETPHANTOM_MEDIAN },
    survivalcontrolLeg: { survived: SURVIVALCONTROL_SURVIVED, medianDays: SURVIVALCONTROL_MEDIAN },
    tributedelivBand: { survived: TRIBUTEDELIV_BAND_SURVIVED, seeds: [190411, 190412, 190413, 190414, 190415, 190416, 190417, 190418] },
    perSeed: analysis.perSeed,
    survived: analysis.survived,
    verdict: j.verdict,
    classifiable: j.classifiable,
    wall: analysis.wall,
    deathCauses: analysis.causes,
    combatShare: analysis.combat,
    eulogy: analysis.eulogy,
    instrumentErrors: analysis.instrumentErrors,
  };
  const outFile = path.join(REPO, 'evidence', '2026-11-11', 'bisect-mournblooded-a-summary.json');
  fs.writeFileSync(outFile, JSON.stringify(summary, null, 2) + '\n');
  console.log('bisect-mournblooded-a: ' + j.verdict + ' (survived ' + analysis.survived + '/8 vs vetphantom fix leg ' + VETPHANTOM_SURVIVED + '/8, survivalcontrol ' + SURVIVALCONTROL_SURVIVED + '/8)');
  console.log('  wall: wins ' + analysis.wall.wins + ', national ' + analysis.wall.national + ', table ' + analysis.wall.table + ', wave5 ' + analysis.wall.wave5 + '/8, wave4 ' + analysis.wall.wave4 + '/8, median ' + analysis.wall.medianDays + 'd, deaths ' + analysis.wall.deaths + ', standing ' + analysis.wall.standingRange[0] + '–' + analysis.wall.standingRange[1]);
  console.log('  death causes (' + analysis.causes.total + '): ' + JSON.stringify(analysis.causes.counts));
  console.log('  combat-family share: ' + analysis.combat.combatFamily + '/' + analysis.combat.total + ' (' + (analysis.combat.share === null ? 'n/a' : (100 * analysis.combat.share).toFixed(1) + '%') + ')');
  console.log('  eulogy lines: ' + analysis.eulogy.total + ' total; per seed ' + JSON.stringify(analysis.eulogy.perSeed.map(function (r) { return r.seed + ':' + r.eulogyLines; })));
  console.log('  instrument errors: ' + analysis.instrumentErrors);
  for (const r of analysis.perSeed) {
    console.log('  seed ' + r.seed + ': ' + r.days + 'd ' + r.endReason + ' standing ' + r.standing + ' scale ' + r.scaleRank + ' maxWave ' + r.maxWave + ' deaths ' + r.deaths + ' errors ' + r.errors);
  }
  console.log('  summary: ' + path.relative(REPO, outFile));
  if (!j.classifiable || analysis.instrumentErrors > 0) process.exit(1);
  process.exit(0);
}

if (require.main === module) main();

module.exports = {
  SEEDS: SEEDS, RUN: RUN, DIR: DIR,
  VETPHANTOM_SURVIVED: VETPHANTOM_SURVIVED, SURVIVALCONTROL_SURVIVED: SURVIVALCONTROL_SURVIVED,
  classifySurvived: classifySurvived,
  loadCorpus: loadCorpus, analyzeRows: analyzeRows, judge: judge,
  deathCauseShares: deathCauseShares, median: median,
  eulogyLines: eulogyLines, combatShare: combatShare,
  perSeedFile: perSeedFile,
};
