// scripts/analyze-launchdiag-corpseloot-a.js — sub-arm (1b) census:
// corpse-takes by taker kind on the frozen gunloss / corpsecap /
// rearm-b bands. Reads frozen corpora read-only; never runs sims.
//   node scripts/analyze-launchdiag-corpseloot-a.js [--out <json>] [--selftest]
// Frozen prereg: evidence/2026-11-24/sim-launchdiag-a-prereg.md (§5, §7).
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');

const BANDS = [
  { key: 'gunloss', dir: path.join(REPO, 'evidence', '2026-11-22', 'perseed-gunloss-a-diag'), rearm: false },
  { key: 'corpsecap', dir: path.join(REPO, 'evidence', '2026-11-21', 'perseed-corpsecap-a-diag'), rearm: false },
  { key: 'rearm-ctl', dir: path.join(REPO, 'evidence', '2026-11-21', 'perseed-rearm-b-ctl'), rearm: false },
  { key: 'rearm-arm', dir: path.join(REPO, 'evidence', '2026-11-21', 'perseed-rearm-b-arm'), rearm: true },
];

// Expectations from frozen-evidence reads (prereg §5) — the census
// confirms or overturns them; the analyzer never edits them to fit.
const EXPECTED = {
  gunloss: { files: 1, takes: 50, scholar: 50, villager: 0, gunCellTakes: 0, rearmTakes: 0 },
  corpsecap: { files: 8, takes: 405, scholar: 405, villager: 0, gunCellTakes: 3, rearmTakes: 0 },
  'rearm-ctl': { files: 16, takes: 956, scholar: 956, villager: 0, gunCellTakes: 4, rearmTakes: 0 },
  'rearm-arm': { files: 16, takes: 965, scholar: 965, villager: 0, gunCellTakes: 4, rearmTakes: 4 },
};

function corpseKind(row) {
  if (!('corpseVid' in row)) return 'unrecorded'; // gunloss rows carry no corpseVid
  return row.corpseVid ? 'person' : 'non-person';
}

function censusCorpus(c) {
  const takes = { scholar: 0, villager: 0, total: 0 };
  const gunCellTakes = [];
  for (const e of (c.corpseTakeEvents || [])) {
    takes.total++;
    if (e.toKind === 'villager') takes.villager++;
    else takes.scholar++; // toKind 'scholar'; anything else counts scholar-side only if named so — see below
    if (e.toKind !== 'scholar' && e.toKind !== 'villager') takes.unclassified = (takes.unclassified || 0) + 1;
    if (e.itemId === 'searcaster' || e.itemId === 'fusion_cell') {
      gunCellTakes.push({ seed: c.seed, day: e.day, itemId: e.itemId, corpseId: e.corpseId || null,
        corpseVid: ('corpseVid' in e) ? e.corpseVid : null, corpseKind: corpseKind(e), toKind: e.toKind });
    }
  }
  const rearmTakes = [];
  for (const e of (c.rearmTakeEvents || [])) {
    rearmTakes.push({ seed: c.seed, day: e.day, taker: e.taker, corpseVid: e.corpseVid || null,
      corpseId: e.corpseId || null, kind: e.kind || null, gun: !!e.gun, cells: e.cells | 0,
      channel: e.channel || null });
  }
  return { takes: takes, gunCellTakes: gunCellTakes, rearmTakes: rearmTakes,
    instrumentErrors: (c.instrumentErrors || []).length,
    wall: { seed: c.seed, days: c.days, endReason: c.endReason || null, villageLost: !!c.villageLost,
      maxWave: c.maxWave, standing: c.standing, scaleRank: c.scaleRank || null,
      won: !!c.won, deaths: (c.deaths || []).length } };
}

function censusBand(band) {
  const files = fs.readdirSync(band.dir).filter(function (f) { return /\.json$/.test(f); }).sort();
  const perSeed = [];
  let takes = { scholar: 0, villager: 0, total: 0, unclassified: 0 };
  let gunCellTakes = [], rearmTakes = [], instrumentErrors = 0;
  const wallSeeds = [];
  for (const f of files) {
    const c = JSON.parse(fs.readFileSync(path.join(band.dir, f), 'utf8'));
    const r = censusCorpus(c);
    perSeed.push({ file: f, seed: c.seed, takes: r.takes, gunCellTakes: r.gunCellTakes.length, rearmTakes: r.rearmTakes.length });
    takes.scholar += r.takes.scholar; takes.villager += r.takes.villager; takes.total += r.takes.total;
    takes.unclassified += r.takes.unclassified || 0;
    gunCellTakes = gunCellTakes.concat(r.gunCellTakes);
    rearmTakes = rearmTakes.concat(r.rearmTakes);
    instrumentErrors += r.instrumentErrors;
    wallSeeds.push(r.wall);
  }
  const surv = wallSeeds.map(function (w) { return w.days; }).sort(function (a, b) { return a - b; });
  const wall = {
    seeds: wallSeeds.length,
    wins: wallSeeds.filter(function (w) { return w.won; }).length,
    national: wallSeeds.filter(function (w) { return w.scaleRank === 'national' || w.scaleRank === 'global'; }).length,
    wave5: wallSeeds.filter(function (w) { return (w.maxWave | 0) >= 5; }).length,
    wave4: wallSeeds.filter(function (w) { return (w.maxWave | 0) >= 4; }).length,
    medianSurvival: surv.length ? surv[Math.floor(surv.length / 2)] : null,
    maxSurvival: surv.length ? surv[surv.length - 1] : null,
    villagesLost: wallSeeds.filter(function (w) { return w.villageLost; }).length,
    totalDeaths: wallSeeds.reduce(function (a, w) { return a + w.deaths; }, 0),
  };
  const exp = EXPECTED[band.key];
  const crossCheck = {
    filesMatch: files.length === exp.files,
    takesMatch: takes.total === exp.takes,
    scholarMatch: takes.scholar === exp.scholar,
    villagerMatch: takes.villager === exp.villager,
    gunCellMatch: gunCellTakes.length === exp.gunCellTakes,
    rearmMatch: rearmTakes.length === exp.rearmTakes,
    expected: exp,
    observed: { files: files.length, takes: takes.total, scholar: takes.scholar,
      villager: takes.villager, gunCellTakes: gunCellTakes.length, rearmTakes: rearmTakes.length },
  };
  crossCheck.allMatch = crossCheck.filesMatch && crossCheck.takesMatch && crossCheck.scholarMatch &&
    crossCheck.villagerMatch && crossCheck.gunCellMatch && crossCheck.rearmMatch;
  return { band: band.key, rearm: band.rearm, files: files.length, takes: takes,
    gunCellTakes: gunCellTakes, rearmTakes: rearmTakes,
    rearmByChannel: rearmTakes.reduce(function (m, r) { m[r.channel || '?'] = (m[r.channel || '?'] || 0) + 1; return m; }, {}),
    instrumentErrors: instrumentErrors, wall: wall, crossCheck: crossCheck, perSeed: perSeed };
}

// Emma check (prereg §5): seed 107539, rearm-arm leg — her corpse
// corpse_86_z6zl89 must read gun 1, cells 0, buried false at the end.
function emmaCheck() {
  const dir = path.join(REPO, 'evidence', '2026-11-21', 'perseed-rearm-b-arm');
  const c = JSON.parse(fs.readFileSync(
    path.join(dir, 'killlootbundle-a-s107539-killlootbundle-a-arm.json'), 'utf8'));
  const rows = (c.v4gunLoc || []).filter(function (r) {
    return (r.locations || []).some(function (l) { return l.cid === 'corpse_86_z6zl89'; });
  });
  const last = rows[rows.length - 1];
  const loc = last ? last.locations.filter(function (l) { return l.cid === 'corpse_86_z6zl89'; })[0] : null;
  const death = (c.deaths || []).filter(function (d) { return d.who === 'emma_larsen'; })[0] || null;
  return { seed: 107539, corpseId: 'corpse_86_z6zl89', deathDay: death ? death.day : null,
    deathCause: death ? death.cause : null, deathPlayer: death ? !!death.player : null,
    lastDay: last ? last.day : null,
    gun: loc ? loc.count : null, cells: loc ? loc.cells : null,
    buried: loc ? !!loc.buried : null, cvid: loc ? loc.cvid : null,
    pass: !!(loc && loc.count === 1 && loc.cells === 0 && !loc.buried) };
}

function analyzeBands() {
  const bands = BANDS.map(censusBand);
  const emma = emmaCheck();
  const totals = {
    takes: bands.reduce(function (a, b) { return a + b.takes.total; }, 0),
    scholar: bands.reduce(function (a, b) { return a + b.takes.scholar; }, 0),
    villager: bands.reduce(function (a, b) { return a + b.takes.villager; }, 0),
    unclassified: bands.reduce(function (a, b) { return a + (b.takes.unclassified || 0); }, 0),
    gunCellTakes: bands.reduce(function (a, b) { return a + b.gunCellTakes.length; }, 0),
    rearmTakes: bands.reduce(function (a, b) { return a + b.rearmTakes.length; }, 0),
    instrumentErrors: bands.reduce(function (a, b) { return a + b.instrumentErrors; }, 0),
  };
  return { arm: 'launchdiag-a-1b-census', bands: bands, emma: emma, totals: totals,
    crossCheckAll: bands.every(function (b) { return b.crossCheck.allMatch; }) };
}

function selftest() {
  let pass = 0, fail = 0;
  function check(name, cond, extra) {
    if (cond) { pass++; } else { fail++; console.log('SELFTEST FAIL: ' + name + (extra ? ' — ' + extra : '')); }
  }
  // Scholar takes, villager rearm takes, gun/cell itemization, corpse kind.
  const c = { seed: 1, instrumentErrors: [],
    corpseTakeEvents: [
      { day: 5, itemId: 'denim_jacket', corpseId: 'c1', corpseVid: 'v1', toKind: 'scholar' },
      { day: 6, itemId: 'searcaster', corpseId: 'c2', corpseVid: 'v2', toKind: 'scholar' },
      { day: 7, itemId: 'fusion_cell', corpseId: 'c3', corpseVid: null, toKind: 'scholar' },
      { day: 8, itemId: 'fusion_cell', toKind: 'scholar' }, // gunloss shape: no corpseVid
    ],
    rearmTakeEvents: [
      { day: 9, taker: 't1', corpseVid: 'v3', corpseId: 'c4', kind: 'second-life', gun: true, cells: 2, channel: 'haven' },
      { day: 10, taker: 't2', corpseVid: 'v4', corpseId: 'c5', kind: 'rearm', gun: false, cells: 1, channel: 'witness' },
    ],
    deaths: [{ day: 6, who: 'v2', kind: 'villager', cause: 'combat', player: false }],
    days: 150, endReason: 'survived', villageLost: false, maxWave: 5, standing: 300, scaleRank: 'regional', won: false };
  const r = censusCorpus(c);
  check('takes-total', r.takes.total === 4);
  check('takes-scholar', r.takes.scholar === 4 && r.takes.villager === 0);
  check('gunCell-count', r.gunCellTakes.length === 3);
  check('corpse-kind-person', r.gunCellTakes[0].corpseKind === 'person');
  check('corpse-kind-nonperson', r.gunCellTakes[1].corpseKind === 'non-person');
  check('corpse-kind-unrecorded', r.gunCellTakes[2].corpseKind === 'unrecorded');
  check('rearm-count', r.rearmTakes.length === 2);
  check('rearm-channels', r.rearmTakes[0].channel === 'haven' && r.rearmTakes[1].channel === 'witness');
  check('rearm-cells', r.rearmTakes[0].cells === 2 && r.rearmTakes[1].cells === 1);
  // Determinism of the census on real bands is checked by the proof
  // test (two runs, byte-identical); here the unit shape is enough.
  console.log('launchdiag-corpseloot selftest: ' + pass + ' passed, ' + fail + ' failed');
  return fail === 0;
}

function main() {
  const args = process.argv.slice(2);
  if (args.indexOf('--selftest') !== -1) { process.exit(selftest() ? 0 : 1); }
  const result = analyzeBands();
  const text = JSON.stringify(result, null, 2) + '\n';
  let out = null;
  const oi = args.indexOf('--out'); if (oi !== -1 && args[oi + 1]) out = args[oi + 1];
  if (out) { fs.mkdirSync(path.dirname(out), { recursive: true }); fs.writeFileSync(out, text); }
  console.log(JSON.stringify({
    totals: result.totals, crossCheckAll: result.crossCheckAll,
    emmaPass: result.emma.pass, emma: result.emma,
    bands: result.bands.map(function (b) { return { band: b.band, takes: b.takes.total, scholar: b.takes.scholar, villager: b.takes.villager, gunCell: b.gunCellTakes.length, rearm: b.rearmTakes.length, channels: b.rearmByChannel, crossCheck: b.crossCheck.allMatch, wall: b.wall }; }),
    out: out ? path.relative(REPO, out) : null,
  }, null, 2));
}

if (require.main === module) main();
module.exports = { analyzeBands: analyzeBands, censusCorpus: censusCorpus,
  censusBand: censusBand, emmaCheck: emmaCheck, selftest: selftest, BANDS: BANDS };
